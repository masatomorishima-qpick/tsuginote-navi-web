/**
 * エンベロープ暗号化モジュール（Phase 1.5 死後開示機能 専用）
 *
 * ─────────────────────────────────────────────────────────────────────
 * 設計（DESIGN_Phase1_PerRecipientBilling.md §4 より）
 *
 *   PIN 平文
 *     ↓ AES-GCM(DEK)
 *   暗号化PIN ［digital_pin_secrets.encrypted_pin に保存］
 *
 *   DEK（PIN 1 つにつき 1 つ、256bit ランダム）
 *     ↓ AES-GCM(KEK)
 *   暗号化DEK ［digital_pin_secrets.encrypted_dek に保存］
 *
 *   KEK（ユーザー 1 人につき 1 つ、256bit ランダム）
 *     ↓ AES-GCM(本人パスフレーズ由来鍵)
 *     ↓ または RSA-OAEP(連携者公開鍵)
 *   暗号化KEK ［digital_user_kek_envelopes に保存、本人用 + 連携者用が並ぶ］
 *
 *   連携者の RSA 秘密鍵（連携者承認時に発行）
 *     ↓ AES-GCM(連携者パスフレーズ由来鍵)
 *   暗号化秘密鍵 ［digital_recipient_keys に保存］
 * ─────────────────────────────────────────────────────────────────────
 *
 * 絶対ルール（lib/crypto/pin.ts と同様）：
 *   1. 鍵・パスフレーズ・PIN 平文を DB に保存しない
 *   2. 鍵・パスフレーズ・PIN 平文をサーバーに送信しない
 *   3. 暗号ロジックは crypto/ 配下に集約（ESLint で他ファイルからの crypto.subtle 直接呼びを禁止）
 *
 * 対応環境：
 *   - ブラウザ（Chrome/Safari/Firefox 最新）：window.crypto.subtle
 *   - Node.js 20+（テスト等）：globalThis.crypto.subtle
 *
 * 現行バージョン（v1）：
 *   - 連携者鍵ペア：RSA-OAEP 4096bit / SHA-256
 *   - KEK / DEK：256bit ランダム
 *   - パスフレーズ由来鍵：PBKDF2 / SHA-256 / 600,000 iter（pin.ts v1 と同等）
 *   - AES-GCM：IV 12 bytes / 鍵 256bit
 *   - 連携者秘密鍵の包装：AES-GCM
 */

// =============================================================================
// 型定義
// =============================================================================

export const ENVELOPE_ALGORITHM_VERSIONS = ['v1'] as const;
export type EnvelopeAlgorithmVersion =
  (typeof ENVELOPE_ALGORITHM_VERSIONS)[number];
export const CURRENT_ENVELOPE_VERSION: EnvelopeAlgorithmVersion = 'v1';

/** 連携者の鍵ペア（承認時にクライアントで生成） */
export type RecipientKeypair = {
  publicKey: string; // Base64(SPKI 形式の RSA 公開鍵)
  encryptedPrivateKey: string; // Base64(AES-GCM で包装した PKCS8 形式の秘密鍵)
  iv: string; // Base64(12 bytes) AES-GCM 用 IV
  salt: string; // Base64(16 bytes) PBKDF2 用 salt
  algorithm_version: EnvelopeAlgorithmVersion;
};

/** 本人パスフレーズで暗号化された KEK */
export type OwnerKekEnvelope = {
  encrypted_kek: string; // Base64
  iv: string; // Base64(12 bytes)
  salt: string; // Base64(16 bytes)
  algorithm_version: EnvelopeAlgorithmVersion;
};

/** 連携者の公開鍵で暗号化された KEK */
export type RecipientKekEnvelope = {
  encrypted_kek: string; // Base64 (RSA-OAEP 出力)
  algorithm_version: EnvelopeAlgorithmVersion;
};

/** DEK の暗号化結果（KEK で暗号化） */
export type EncryptedDek = {
  encrypted_dek: string; // Base64
  iv: string; // Base64(12 bytes)
};

// =============================================================================
// パラメータ定数
// =============================================================================

const V1_PBKDF2_ITERATIONS = 600_000;
const V1_PBKDF2_HASH = 'SHA-256';
const V1_SALT_BYTES = 16;
const V1_IV_BYTES = 12;
const V1_AES_KEY_BITS = 256;
const V1_RSA_MODULUS_LENGTH = 4096;
const V1_RSA_HASH = 'SHA-256';

// =============================================================================
// 環境ガード
// =============================================================================

function getSubtle(): SubtleCrypto {
  const c = (globalThis as unknown as { crypto?: Crypto }).crypto;
  if (!c || !c.subtle) {
    throw new Error(
      '[lib/crypto/envelope] Web Crypto API is not available. ' +
        'Browser requires secure context (HTTPS or localhost). ' +
        'Node.js requires version 20 or later.'
    );
  }
  return c.subtle;
}

function getRandomBytes(length: number): Uint8Array {
  const c = (globalThis as unknown as { crypto?: Crypto }).crypto;
  if (!c || !c.getRandomValues) {
    throw new Error(
      '[lib/crypto/envelope] crypto.getRandomValues is not available.'
    );
  }
  const buf = new Uint8Array(length);
  c.getRandomValues(buf);
  return buf;
}

// =============================================================================
// Base64 ⇔ Uint8Array
// =============================================================================

function bytesToBase64(bytes: Uint8Array): string {
  if (typeof btoa === 'function') {
    let s = '';
    for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
    return btoa(s);
  }
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
// パスフレーズ → AES-GCM 鍵 (PBKDF2)
// =============================================================================

async function deriveAesKeyFromPassphrase(
  passphrase: string,
  salt: Uint8Array,
  usage: 'encrypt' | 'decrypt'
): Promise<CryptoKey> {
  const subtle = getSubtle();
  const normalized = passphrase.normalize('NFC');
  const passBytes = new TextEncoder().encode(normalized);

  const baseKey = await subtle.importKey(
    'raw',
    passBytes as BufferSource,
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as BufferSource,
      iterations: V1_PBKDF2_ITERATIONS,
      hash: V1_PBKDF2_HASH,
    },
    baseKey,
    { name: 'AES-GCM', length: V1_AES_KEY_BITS },
    false,
    [usage]
  );
}

// =============================================================================
// AES-GCM 共通ヘルパー
// =============================================================================

/**
 * raw な 32 byte の対称鍵を AES-GCM 鍵として import する。
 * KEK や DEK のように「平文 32 byte」として持っている鍵を AES-GCM 操作で使うために必要。
 */
async function importAesKeyFromBytes(
  keyBytes: Uint8Array,
  usage: 'encrypt' | 'decrypt'
): Promise<CryptoKey> {
  const subtle = getSubtle();
  return subtle.importKey(
    'raw',
    keyBytes as BufferSource,
    { name: 'AES-GCM', length: V1_AES_KEY_BITS },
    false,
    [usage]
  );
}

async function aesGcmEncrypt(
  key: CryptoKey,
  plaintext: Uint8Array
): Promise<{ ciphertextB64: string; ivB64: string }> {
  const subtle = getSubtle();
  const iv = getRandomBytes(V1_IV_BYTES);
  const ciphertextBuffer = await subtle.encrypt(
    { name: 'AES-GCM', iv: iv as BufferSource },
    key,
    plaintext as BufferSource
  );
  return {
    ciphertextB64: bytesToBase64(new Uint8Array(ciphertextBuffer)),
    ivB64: bytesToBase64(iv),
  };
}

async function aesGcmDecrypt(
  key: CryptoKey,
  ciphertextB64: string,
  ivB64: string
): Promise<Uint8Array> {
  const subtle = getSubtle();
  const iv = base64ToBytes(ivB64);
  const ciphertext = base64ToBytes(ciphertextB64);
  const plaintextBuffer = await subtle.decrypt(
    { name: 'AES-GCM', iv: iv as BufferSource },
    key,
    ciphertext as BufferSource
  );
  return new Uint8Array(plaintextBuffer);
}

// =============================================================================
// ⓐ 連携者の鍵ペア生成（承認時に 1 回だけ）
// =============================================================================

/**
 * RSA-OAEP-4096 の鍵ペアを生成し、秘密鍵を連携者のパスフレーズで AES-GCM 暗号化する。
 *
 * @param passphrase 連携者自身が決めるパスフレーズ
 * @returns 公開鍵（Base64 SPKI）と暗号化された秘密鍵
 */
export async function generateRecipientKeypair(
  passphrase: string
): Promise<RecipientKeypair> {
  if (!passphrase || passphrase.length < 8) {
    throw new Error(
      '[lib/crypto/envelope] パスフレーズは 8 文字以上で指定してください。'
    );
  }
  const subtle = getSubtle();

  // RSA-OAEP 4096bit の鍵ペアを生成（extractable=true：秘密鍵を export する必要があるため）
  const keypair = await subtle.generateKey(
    {
      name: 'RSA-OAEP',
      modulusLength: V1_RSA_MODULUS_LENGTH,
      publicExponent: new Uint8Array([0x01, 0x00, 0x01]), // 65537
      hash: V1_RSA_HASH,
    },
    true,
    ['encrypt', 'decrypt']
  );

  // 公開鍵を SPKI で export
  const publicKeyBuffer = await subtle.exportKey('spki', keypair.publicKey);
  const publicKeyB64 = bytesToBase64(new Uint8Array(publicKeyBuffer));

  // 秘密鍵を PKCS8 で export → パスフレーズ由来鍵で AES-GCM 包装
  const privateKeyBuffer = await subtle.exportKey('pkcs8', keypair.privateKey);
  const privateKeyBytes = new Uint8Array(privateKeyBuffer);

  const salt = getRandomBytes(V1_SALT_BYTES);
  const wrappingKey = await deriveAesKeyFromPassphrase(
    passphrase,
    salt,
    'encrypt'
  );
  const { ciphertextB64, ivB64 } = await aesGcmEncrypt(
    wrappingKey,
    privateKeyBytes
  );

  return {
    publicKey: publicKeyB64,
    encryptedPrivateKey: ciphertextB64,
    iv: ivB64,
    salt: bytesToBase64(salt),
    algorithm_version: 'v1',
  };
}

/**
 * 暗号化されている連携者秘密鍵を、パスフレーズで復号して CryptoKey として返す。
 * 連携者が情報を閲覧するときに毎回呼ぶ。
 */
export async function unwrapRecipientPrivateKey(
  keypair: Pick<RecipientKeypair, 'encryptedPrivateKey' | 'iv' | 'salt'>,
  passphrase: string
): Promise<CryptoKey> {
  const subtle = getSubtle();
  const salt = base64ToBytes(keypair.salt);

  const unwrappingKey = await deriveAesKeyFromPassphrase(
    passphrase,
    salt,
    'decrypt'
  );
  let privateKeyBytes: Uint8Array;
  try {
    privateKeyBytes = await aesGcmDecrypt(
      unwrappingKey,
      keypair.encryptedPrivateKey,
      keypair.iv
    );
  } catch {
    throw new Error('passphrase_mismatch');
  }

  return subtle.importKey(
    'pkcs8',
    privateKeyBytes as BufferSource,
    { name: 'RSA-OAEP', hash: V1_RSA_HASH },
    false,
    ['decrypt']
  );
}

/**
 * 公開鍵（Base64 SPKI）を CryptoKey として import する。
 * KEK を連携者の公開鍵で暗号化するときに使う。
 */
async function importRecipientPublicKey(
  publicKeyB64: string
): Promise<CryptoKey> {
  const subtle = getSubtle();
  const spki = base64ToBytes(publicKeyB64);
  return subtle.importKey(
    'spki',
    spki as BufferSource,
    { name: 'RSA-OAEP', hash: V1_RSA_HASH },
    false,
    ['encrypt']
  );
}

// =============================================================================
// ⓑ KEK の生成と暗号化
// =============================================================================

/**
 * KEK（256bit ランダム）を生成する。ユーザー 1 人につき 1 つだけ持つ。
 */
export function generateKek(): Uint8Array {
  return getRandomBytes(V1_AES_KEY_BITS / 8); // 32 bytes
}

/**
 * KEK を本人のパスフレーズで暗号化する。
 * 本人初回 PIN 登録時に呼ぶ。
 */
export async function encryptKekForOwner(
  kek: Uint8Array,
  passphrase: string
): Promise<OwnerKekEnvelope> {
  if (kek.length !== V1_AES_KEY_BITS / 8) {
    throw new Error('[lib/crypto/envelope] KEK must be 32 bytes (256bit).');
  }
  const salt = getRandomBytes(V1_SALT_BYTES);
  const wrappingKey = await deriveAesKeyFromPassphrase(
    passphrase,
    salt,
    'encrypt'
  );
  const { ciphertextB64, ivB64 } = await aesGcmEncrypt(wrappingKey, kek);
  return {
    encrypted_kek: ciphertextB64,
    iv: ivB64,
    salt: bytesToBase64(salt),
    algorithm_version: 'v1',
  };
}

/**
 * KEK を本人のパスフレーズで復号する。
 * 本人が PIN を更新／追加するときに呼ぶ。
 */
export async function decryptKekAsOwner(
  envelope: OwnerKekEnvelope,
  passphrase: string
): Promise<Uint8Array> {
  const salt = base64ToBytes(envelope.salt);
  const unwrappingKey = await deriveAesKeyFromPassphrase(
    passphrase,
    salt,
    'decrypt'
  );
  try {
    return await aesGcmDecrypt(unwrappingKey, envelope.encrypted_kek, envelope.iv);
  } catch {
    throw new Error('passphrase_mismatch');
  }
}

/**
 * KEK を連携者の公開鍵で暗号化する。
 * 新しい連携者が承認したとき、または既存連携者にまだ KEK が配られていないときに呼ぶ。
 */
export async function encryptKekForRecipient(
  kek: Uint8Array,
  recipientPublicKeyB64: string
): Promise<RecipientKekEnvelope> {
  if (kek.length !== V1_AES_KEY_BITS / 8) {
    throw new Error('[lib/crypto/envelope] KEK must be 32 bytes (256bit).');
  }
  const subtle = getSubtle();
  const publicKey = await importRecipientPublicKey(recipientPublicKeyB64);
  const ciphertextBuffer = await subtle.encrypt(
    { name: 'RSA-OAEP' },
    publicKey,
    kek as BufferSource
  );
  return {
    encrypted_kek: bytesToBase64(new Uint8Array(ciphertextBuffer)),
    algorithm_version: 'v1',
  };
}

/**
 * KEK を連携者の秘密鍵で復号する。
 * 死後開示時、連携者が PIN を閲覧する直前に呼ぶ。
 */
export async function decryptKekAsRecipient(
  envelope: RecipientKekEnvelope,
  privateKey: CryptoKey
): Promise<Uint8Array> {
  const subtle = getSubtle();
  const ciphertext = base64ToBytes(envelope.encrypted_kek);
  let plaintextBuffer: ArrayBuffer;
  try {
    plaintextBuffer = await subtle.decrypt(
      { name: 'RSA-OAEP' },
      privateKey,
      ciphertext as BufferSource
    );
  } catch {
    throw new Error('decryption_failed');
  }
  const kek = new Uint8Array(plaintextBuffer);
  if (kek.length !== V1_AES_KEY_BITS / 8) {
    throw new Error('[lib/crypto/envelope] Recovered KEK has invalid length.');
  }
  return kek;
}

// =============================================================================
// ⓒ DEK の生成と暗号化（PIN 1 つにつき 1 つ）
// =============================================================================

/**
 * DEK（256bit ランダム）を生成する。
 * PIN 1 件につき 1 つ独立した DEK を持つことで、PIN ローテーション時に
 * 他の PIN や KEK に影響しない設計。
 */
export function generateDek(): Uint8Array {
  return getRandomBytes(V1_AES_KEY_BITS / 8);
}

/**
 * DEK を KEK で AES-GCM 暗号化する。
 */
export async function encryptDekWithKek(
  dek: Uint8Array,
  kek: Uint8Array
): Promise<EncryptedDek> {
  if (dek.length !== V1_AES_KEY_BITS / 8 || kek.length !== V1_AES_KEY_BITS / 8) {
    throw new Error('[lib/crypto/envelope] DEK/KEK must be 32 bytes.');
  }
  const kekKey = await importAesKeyFromBytes(kek, 'encrypt');
  const { ciphertextB64, ivB64 } = await aesGcmEncrypt(kekKey, dek);
  return { encrypted_dek: ciphertextB64, iv: ivB64 };
}

/**
 * DEK を KEK で AES-GCM 復号する。
 */
export async function decryptDekWithKek(
  envelope: EncryptedDek,
  kek: Uint8Array
): Promise<Uint8Array> {
  if (kek.length !== V1_AES_KEY_BITS / 8) {
    throw new Error('[lib/crypto/envelope] KEK must be 32 bytes.');
  }
  const kekKey = await importAesKeyFromBytes(kek, 'decrypt');
  try {
    return await aesGcmDecrypt(kekKey, envelope.encrypted_dek, envelope.iv);
  } catch {
    throw new Error('dek_decryption_failed');
  }
}

// =============================================================================
// ⓓ DEK で PIN（任意の文字列）を暗号化／復号
//    pin.ts の v1 と同じ AES-GCM 構造だが、鍵は PBKDF2 ではなく DEK 直接
// =============================================================================

/**
 * 任意の文字列（PIN 平文）を DEK で AES-GCM 暗号化する。
 * 戻り値はサーバーに送信して digital_pin_secrets.encrypted_pin に保存される。
 */
export async function encryptDataWithDek(
  plaintext: string,
  dek: Uint8Array
): Promise<{ ciphertext: string; iv: string }> {
  if (dek.length !== V1_AES_KEY_BITS / 8) {
    throw new Error('[lib/crypto/envelope] DEK must be 32 bytes.');
  }
  const dekKey = await importAesKeyFromBytes(dek, 'encrypt');
  const normalized = plaintext.normalize('NFC');
  const plaintextBytes = new TextEncoder().encode(normalized);
  const { ciphertextB64, ivB64 } = await aesGcmEncrypt(dekKey, plaintextBytes);
  return { ciphertext: ciphertextB64, iv: ivB64 };
}

/**
 * DEK で暗号化された PIN 平文を取り出す。
 */
export async function decryptDataWithDek(
  ciphertextB64: string,
  ivB64: string,
  dek: Uint8Array
): Promise<string> {
  if (dek.length !== V1_AES_KEY_BITS / 8) {
    throw new Error('[lib/crypto/envelope] DEK must be 32 bytes.');
  }
  const dekKey = await importAesKeyFromBytes(dek, 'decrypt');
  try {
    const plaintextBytes = await aesGcmDecrypt(dekKey, ciphertextB64, ivB64);
    return new TextDecoder().decode(plaintextBytes);
  } catch {
    throw new Error('pin_decryption_failed');
  }
}
