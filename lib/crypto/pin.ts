/**
 * PIN 暗号化モジュール（Phase 1 PIN 機能 専用・単一集約モジュール）
 *
 * ─────────────────────────────────────────────────────────────────────
 * 絶対ルール（DESIGN_Phase1_PIN.md §2 より）
 *   1. PIN 平文を DB に保存しない
 *   2. PIN 平文をサーバーに送信しない
 *   3. PIN 平文を API レスポンスで返さない
 *   4. 暗号ロジックは **このファイル 1 つ** に集約する
 *   5. step-up 認証成功トークンの有効期限は最長 5 分
 *   6. algorithm_version は必ず保存し、復号時に version で分岐する
 *
 * このファイル以外で crypto.subtle を直接呼ぶと ESLint がエラーにする。
 * ─────────────────────────────────────────────────────────────────────
 *
 * 対応環境:
 *   - ブラウザ（Chrome/Safari/Firefox 最新）: window.crypto.subtle を使用
 *   - Node.js 20+（SSR / Jest 等）: globalThis.crypto.subtle を使用
 *
 * 現行バージョン (v1):
 *   - 鍵導出: PBKDF2 / SHA-256 / 600,000 iterations（OWASP 2023）
 *   - salt:   16 bytes / レコード毎
 *   - 鍵:     AES-GCM / 256 bit
 *   - IV:     12 bytes / 暗号化毎
 *
 * 将来 v2 を追加する場合:
 *   1. ALGORITHM_VERSIONS に 'v2' を追加
 *   2. 005_digital_pin_secrets.sql の CHECK IN (...) に 'v2' を追加
 *   3. encryptPinV2 / decryptPinV2 を実装し、deriveKey を切り替える
 *   4. decryptPin 内で version によるディスパッチを追加
 */

// =============================================================================
// 型定義（サーバー／クライアント両方で参照される）
// =============================================================================

export const ALGORITHM_VERSIONS = ['v1', 'v2'] as const;
export type AlgorithmVersion = typeof ALGORITHM_VERSIONS[number];

/**
 * 既定の暗号化バージョン。
 *   v1: PBKDF2 でパスフレーズから直接 PIN 暗号化鍵を導出（Phase 1 初期実装）
 *   v2: KEK + DEK の二段鍵（Phase 1.5 死後開示対応）。PBKDF2 で導出するのは KEK の包装鍵だけ。
 *
 * 新規 PIN は v2 で登録される。既存の v1 データは互換性を維持しつつ、
 * 本人ログイン時に v2 への移行を任意で実施できる（移行ロジックは lib/digital/pins.ts 側）。
 */
export const CURRENT_ALGORITHM_VERSION: AlgorithmVersion = 'v2';

/**
 * サーバー送信用／DB 保存用の暗号化済み PIN レコード。
 * サーバー側では **このオブジェクトとそのフィールド以外を扱わない**。
 *
 * v1: encrypted_pin / iv / salt（パスフレーズ→PBKDF2→AES-GCM 直接）
 * v2: encrypted_pin / iv / encrypted_dek / dek_iv （DEK → KEK で包装、salt は KEK 側に持つため null）
 */
export type EncryptedPin = {
  encrypted_pin: string;          // base64(ciphertext || auth_tag)
  iv: string;                     // base64(12 bytes)
  salt: string | null;            // v1: 必須 / v2: null
  algorithm_version: AlgorithmVersion;
  // v2 固有フィールド
  encrypted_dek?: string | null;  // base64(DEK ciphertext)
  dek_iv?: string | null;         // base64(12 bytes)
};

// =============================================================================
// v1 アルゴリズムの固定パラメータ
// =============================================================================

const V1_PBKDF2_ITERATIONS = 600_000;
const V1_PBKDF2_HASH = 'SHA-256';
const V1_SALT_BYTES = 16;
const V1_IV_BYTES = 12;
const V1_KEY_BITS = 256;

// =============================================================================
// ガード: 実行環境チェック
// =============================================================================

/**
 * Web Crypto が利用可能かチェック。
 * ブラウザは secure context (HTTPS/localhost) でのみ利用可能。
 * Node.js 20+ は標準で利用可能。
 */
function getSubtle(): SubtleCrypto {
  const c = (globalThis as unknown as { crypto?: Crypto }).crypto;
  if (!c || !c.subtle) {
    throw new Error(
      '[lib/crypto/pin] Web Crypto API is not available. ' +
        'Browser requires secure context (HTTPS or localhost). ' +
        'Node.js requires version 20 or later.'
    );
  }
  return c.subtle;
}

function getRandomBytes(length: number): Uint8Array {
  const c = (globalThis as unknown as { crypto?: Crypto }).crypto;
  if (!c || !c.getRandomValues) {
    throw new Error('[lib/crypto/pin] crypto.getRandomValues is not available.');
  }
  const buf = new Uint8Array(length);
  c.getRandomValues(buf);
  return buf;
}

// =============================================================================
// base64 <-> Uint8Array 変換（ブラウザ／Node 両対応）
// =============================================================================

function bytesToBase64(bytes: Uint8Array): string {
  // ブラウザ: btoa + binary string
  if (typeof btoa === 'function') {
    let s = '';
    for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
    return btoa(s);
  }
  // Node.js
  return Buffer.from(bytes).toString('base64');
}

function base64ToBytes(b64: string): Uint8Array {
  if (typeof atob === 'function') {
    const bin = atob(b64);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }
  return new Uint8Array(Buffer.from(b64, 'base64'));
}

// =============================================================================
// v1: PBKDF2 で鍵素材 → AES-GCM 鍵 を導出
// =============================================================================

async function deriveKeyV1(
  passphrase: string,
  salt: Uint8Array,
  usage: 'encrypt' | 'decrypt'
): Promise<CryptoKey> {
  const subtle = getSubtle();

  // Unicode 正規化（絵文字や濁点の合成/分解ゆれを防ぐ）
  const normalized = passphrase.normalize('NFC');
  const passBytes = new TextEncoder().encode(normalized);

  // 1. passphrase を importKey で PBKDF2 用の鍵素材にする
  const baseKey = await subtle.importKey(
    'raw',
    passBytes as BufferSource,
    { name: 'PBKDF2' },
    false, // extractable: 不要
    ['deriveKey']
  );

  // 2. PBKDF2 で AES-GCM 鍵を導出
  return subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as BufferSource,
      iterations: V1_PBKDF2_ITERATIONS,
      hash: V1_PBKDF2_HASH,
    },
    baseKey,
    { name: 'AES-GCM', length: V1_KEY_BITS },
    false, // extractable: 不要
    [usage]
  );
}

// =============================================================================
// 公開 API: encryptPin
// =============================================================================

/**
 * PIN をクライアント側で暗号化する。
 *
 * @param pin        ユーザーが入力した生 PIN。この関数を抜けたら破棄すること。
 * @param passphrase PIN を守るためのマスター鍵。ログインパスワードとは別物。
 * @returns          サーバー/DB に送信してよい暗号化済みレコード。
 *
 * @throws Web Crypto が利用不可な環境、または鍵導出が失敗した場合。
 */
export async function encryptPin(
  pin: string,
  passphrase: string
): Promise<EncryptedPin> {
  if (typeof pin !== 'string' || pin.length === 0) {
    throw new Error('[lib/crypto/pin] encryptPin: pin must be a non-empty string.');
  }
  if (typeof passphrase !== 'string' || passphrase.length === 0) {
    throw new Error('[lib/crypto/pin] encryptPin: passphrase must be a non-empty string.');
  }

  const subtle = getSubtle();
  const salt = getRandomBytes(V1_SALT_BYTES);
  const iv = getRandomBytes(V1_IV_BYTES);

  const key = await deriveKeyV1(passphrase, salt, 'encrypt');

  // PIN も NFC 正規化してから UTF-8 エンコード
  const pinBytes = new TextEncoder().encode(pin.normalize('NFC'));

  const cipherBuffer = await subtle.encrypt(
    { name: 'AES-GCM', iv: iv as BufferSource },
    key,
    pinBytes as BufferSource
  );

  // encryptPin は v1 専用関数。algorithm_version は明示的に 'v1' をハードコード
  return {
    encrypted_pin: bytesToBase64(new Uint8Array(cipherBuffer)),
    iv: bytesToBase64(iv),
    salt: bytesToBase64(salt),
    algorithm_version: 'v1',
  };
}

// =============================================================================
// 公開 API: encryptPinV2 / decryptPinV2 (Phase 1.5 死後開示対応)
//
// v2 では PIN を DEK（256bit ランダム）で暗号化し、DEK は KEK で別途暗号化される。
// KEK は本人のパスフレーズ、または連携者の公開鍵で暗号化されて
// digital_user_kek_envelopes に保管される（lib/crypto/envelope.ts 参照）。
//
// この関数は **PIN ↔ DEK** 部分だけを扱う。DEK の発行や KEK との暗号化は
// envelope.ts の側にある。アプリ側コード（lib/digital/pins.ts）が両者を組み合わせる。
// =============================================================================

/**
 * PIN を DEK（32 bytes = 256bit）で AES-GCM 暗号化する。
 * 戻り値の encrypted_dek / dek_iv はこの関数では設定しない（呼び出し側で envelope.ts を使い設定）。
 *
 * @param pin  ユーザー入力 PIN
 * @param dek  この PIN 専用に生成された 32 bytes の対称鍵
 */
export async function encryptPinV2(
  pin: string,
  dek: Uint8Array
): Promise<Pick<EncryptedPin, 'encrypted_pin' | 'iv' | 'algorithm_version'>> {
  if (typeof pin !== 'string' || pin.length === 0) {
    throw new Error('[lib/crypto/pin] encryptPinV2: pin must be a non-empty string.');
  }
  if (!(dek instanceof Uint8Array) || dek.length !== V1_KEY_BITS / 8) {
    throw new Error('[lib/crypto/pin] encryptPinV2: DEK must be 32 bytes.');
  }

  const subtle = getSubtle();
  const iv = getRandomBytes(V1_IV_BYTES);

  // DEK を AES-GCM 鍵として import
  const key = await subtle.importKey(
    'raw',
    dek as BufferSource,
    { name: 'AES-GCM', length: V1_KEY_BITS },
    false,
    ['encrypt']
  );

  const pinBytes = new TextEncoder().encode(pin.normalize('NFC'));

  const cipherBuffer = await subtle.encrypt(
    { name: 'AES-GCM', iv: iv as BufferSource },
    key,
    pinBytes as BufferSource
  );

  return {
    encrypted_pin: bytesToBase64(new Uint8Array(cipherBuffer)),
    iv: bytesToBase64(iv),
    algorithm_version: 'v2',
  };
}

/**
 * v2 形式の PIN を DEK で復号する。
 * DEK の取り出し方法：
 *   - 本人：KEK を decryptKekAsOwner(envelope, passphrase) → decryptDekWithKek(encrypted_dek, kek)
 *   - 連携者（死後開示後）：KEK を decryptKekAsRecipient(envelope, privateKey) → decryptDekWithKek(encrypted_dek, kek)
 */
export async function decryptPinV2(
  record: Pick<EncryptedPin, 'encrypted_pin' | 'iv' | 'algorithm_version'>,
  dek: Uint8Array
): Promise<string> {
  if (!record || record.algorithm_version !== 'v2') {
    throw new Error(
      `[lib/crypto/pin] decryptPinV2: algorithm_version は 'v2' でなければなりません（${record?.algorithm_version}）。`
    );
  }
  if (!(dek instanceof Uint8Array) || dek.length !== V1_KEY_BITS / 8) {
    throw new Error('[lib/crypto/pin] decryptPinV2: DEK must be 32 bytes.');
  }

  const subtle = getSubtle();
  const iv = base64ToBytes(record.iv);
  const cipher = base64ToBytes(record.encrypted_pin);

  const key = await subtle.importKey(
    'raw',
    dek as BufferSource,
    { name: 'AES-GCM', length: V1_KEY_BITS },
    false,
    ['decrypt']
  );

  let plainBuffer: ArrayBuffer;
  try {
    plainBuffer = await subtle.decrypt(
      { name: 'AES-GCM', iv: iv as BufferSource },
      key,
      cipher as BufferSource
    );
  } catch {
    throw new Error('pin_decryption_failed');
  }

  return new TextDecoder().decode(plainBuffer);
}

// =============================================================================
// 公開 API: decryptPin
// =============================================================================

/**
 * 暗号化された PIN をクライアント側で復号する。
 *
 * - algorithm_version によって復号ロジックを分岐する（現在は v1 のみ）。
 * - 認証タグ検証に失敗すると例外を投げる（静かに空文字を返さない）。
 *
 * @throws パスフレーズが違う／改竄されたデータ／未対応 version の場合。
 */
export async function decryptPin(
  record: EncryptedPin,
  passphrase: string
): Promise<string> {
  if (!record || typeof record !== 'object') {
    throw new Error('[lib/crypto/pin] decryptPin: record is required.');
  }
  if (typeof passphrase !== 'string' || passphrase.length === 0) {
    throw new Error('[lib/crypto/pin] decryptPin: passphrase must be a non-empty string.');
  }

  switch (record.algorithm_version) {
    case 'v1':
      return decryptPinV1(record, passphrase);
    case 'v2':
      // v2 はパスフレーズだけでは復号できない（DEK が必要）。
      // 呼び出し側で decryptPinV2(record, dek) を直接使う必要がある。
      throw new Error(
        '[lib/crypto/pin] decryptPin: v2 形式は decryptPinV2(record, dek) を使ってください。'
      );
    default: {
      // 型システムを信頼せず、ランタイムでも拒否する
      const v: string = record.algorithm_version;
      throw new Error(
        `[lib/crypto/pin] decryptPin: unsupported algorithm_version "${v}".`
      );
    }
  }
}

async function decryptPinV1(
  record: EncryptedPin,
  passphrase: string
): Promise<string> {
  const subtle = getSubtle();

  // v1 形式では salt が必須。v2 形式の record を誤ってここに渡したらエラー
  if (!record.salt) {
    throw new Error(
      '[lib/crypto/pin] decryptPinV1: salt is required for v1 records.'
    );
  }

  const salt = base64ToBytes(record.salt);
  const iv = base64ToBytes(record.iv);
  const cipher = base64ToBytes(record.encrypted_pin);

  const key = await deriveKeyV1(passphrase, salt, 'decrypt');

  let plainBuffer: ArrayBuffer;
  try {
    plainBuffer = await subtle.decrypt(
      { name: 'AES-GCM', iv: iv as BufferSource },
      key,
      cipher as BufferSource
    );
  } catch {
    // AES-GCM の認証タグ検証失敗 ＝ 不正な passphrase もしくは改竄
    // ユーザー向けメッセージは呼び出し側で「パスフレーズが違います」に変換する
    throw new PinDecryptionError('PIN decryption failed (wrong passphrase or tampered data).');
  }

  const plain = new TextDecoder('utf-8', { fatal: true }).decode(plainBuffer);
  return plain;
}

/**
 * 復号失敗を示す専用エラー（UI 側で catch しやすくする）。
 */
export class PinDecryptionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PinDecryptionError';
  }
}

// =============================================================================
// パスフレーズ強度バリデーション（UI から呼ぶ）
// =============================================================================

/**
 * パスフレーズの最低条件をチェック。
 * Phase1 の高齢者層を考慮して「長さ」を主軸にする。
 *   - 8 文字以上
 *   - 数字だけ不可
 *   - 空白のみ不可
 *
 * エラーがあれば理由文字列配列を返す。空配列ならOK。
 */
export function validatePassphrase(passphrase: string): string[] {
  const errors: string[] = [];
  const trimmed = passphrase.trim();

  if (trimmed.length < 8) {
    errors.push('8文字以上で入力してください。');
  }
  if (/^\d+$/.test(trimmed)) {
    errors.push('数字のみは使えません。英字や記号を混ぜてください。');
  }
  if (trimmed.length === 0) {
    errors.push('空白だけでは設定できません。');
  }
  return errors;
}
