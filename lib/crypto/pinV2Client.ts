/**
 * lib/crypto/pinV2Client.ts
 *
 * v2（エンベロープ暗号化）方式の PIN を、クライアント側で組み立て／復号するための
 * 「合成（オーケストレーション）ヘルパー」。
 *
 * envelope.ts（KEK/DEK）と pin.ts（PIN↔DEK）の関数を呼び合わせるだけで、
 * crypto.subtle を直接は触らない。暗号プリミティブは引き続き envelope.ts / pin.ts に集約。
 *
 * ─────────────────────────────────────────────────────────────────────
 * v2 登録の流れ（buildV2PinPayload）：
 *   1. KEK を用意する
 *      - 既に本人 KEK エンベロープがある → パスフレーズで復号して再利用
 *      - まだ無い（初回）→ 新しい KEK を生成し、パスフレーズで暗号化
 *   2. DEK を生成し、PIN を DEK で暗号化（encrypted_pin / iv）
 *   3. DEK を KEK で暗号化（encrypted_dek / dek_iv）
 *   4. 連携者ごとに KEK を公開鍵で暗号化（recipient_kek_envelopes）
 *
 * v2 復号の流れ（本人・decryptV2PinAsOwner）：
 *   1. パスフレーズで KEK を復号
 *   2. KEK で DEK を復号
 *   3. DEK で PIN を復号
 * ─────────────────────────────────────────────────────────────────────
 *
 * 🔒 平文 PIN・パスフレーズ・KEK/DEK の生 bytes はこのファイル（＝ブラウザ）の外に出ない。
 *    サーバーに送るのは V2PinPayload（すべて暗号文）のみ。
 */

import {
  generateKek,
  encryptKekForOwner,
  decryptKekAsOwner,
  encryptKekForRecipient,
  generateDek,
  encryptDekWithKek,
  decryptDekWithKek,
} from './envelope';
import { encryptPinV2, decryptPinV2 } from './pin';

// =============================================================================
// 型
// =============================================================================

/** 本人パスフレーズで暗号化された KEK（DB の digital_user_kek_envelopes と同形） */
export type OwnerKekEnvelopeData = {
  encrypted_kek: string;
  iv: string;
  salt: string;
};

/** KEK を暗号化する対象の連携者（公開鍵付き） */
export type RecipientPublicKey = {
  recipient_user_id: string;
  public_key: string;
};

/** crypto-context API のレスポンス（PinRegisterForm / PinEditDialog が取得する） */
export type PinCryptoContext = {
  ownerKekEnvelope: OwnerKekEnvelopeData | null;
  recipients: RecipientPublicKey[];
};

/** サーバーに POST/PATCH する v2 ペイロード（すべて暗号文・非機密） */
export type V2PinPayload = {
  algorithm_version: 'v2';
  encrypted_pin: string;
  iv: string;
  encrypted_dek: string;
  dek_iv: string;
  /** 初回登録時のみ。既に KEK エンベロープがある場合は省略（既存を再利用） */
  owner_kek_envelope?: OwnerKekEnvelopeData;
  /** KEK 未配布の連携者へ配る KEK 暗号文（空配列可） */
  recipient_kek_envelopes: Array<{
    recipient_user_id: string;
    encrypted_kek: string;
  }>;
};

/**
 * 既存の本人 KEK エンベロープを、入力されたパスフレーズで復号できなかったときに投げる。
 * ＝「最初に PIN を登録したときと違うパスフレーズが入力された」を意味する。
 */
export class PassphraseMismatchError extends Error {
  constructor() {
    super('passphrase_mismatch');
    this.name = 'PassphraseMismatchError';
  }
}

// =============================================================================
// 登録／更新：v2 ペイロードの組み立て
// =============================================================================

/**
 * v2 方式の PIN ペイロードを組み立てる。
 *
 * @throws PassphraseMismatchError 既存 KEK エンベロープがあるのにパスフレーズが一致しない場合
 */
export async function buildV2PinPayload(args: {
  pin: string;
  passphrase: string;
  /** crypto-context から取得した既存の本人 KEK エンベロープ（無ければ null＝初回） */
  ownerKekEnvelope: OwnerKekEnvelopeData | null;
  /** KEK を配布すべき連携者（公開鍵付き）。空配列可 */
  recipients: RecipientPublicKey[];
}): Promise<V2PinPayload> {
  const { pin, passphrase, ownerKekEnvelope, recipients } = args;

  // ── ① KEK を用意 ───────────────────────────────────────────────
  let kek: Uint8Array;
  let ownerEnvelopeToSend: OwnerKekEnvelopeData | undefined;

  if (ownerKekEnvelope) {
    // 既存ユーザー：同じパスフレーズで既存 KEK を復号して再利用する。
    // ※ 新しい KEK を作ってはいけない（既存 v2 PIN が復号できなくなる）。
    try {
      kek = await decryptKekAsOwner(
        { ...ownerKekEnvelope, algorithm_version: 'v1' },
        passphrase
      );
    } catch {
      throw new PassphraseMismatchError();
    }
    ownerEnvelopeToSend = undefined; // 既存を再利用するので再送しない
  } else {
    // 初回：新しい KEK を生成し、パスフレーズで暗号化
    kek = generateKek();
    const env = await encryptKekForOwner(kek, passphrase);
    ownerEnvelopeToSend = {
      encrypted_kek: env.encrypted_kek,
      iv: env.iv,
      salt: env.salt,
    };
  }

  // ── ② PIN を DEK で暗号化 ──────────────────────────────────────
  const dek = generateDek();
  const pinPart = await encryptPinV2(pin, dek);

  // ── ③ DEK を KEK で暗号化 ──────────────────────────────────────
  const dekPart = await encryptDekWithKek(dek, kek);

  // ── ④ 連携者ごとに KEK を公開鍵で暗号化 ────────────────────────
  const recipient_kek_envelopes: V2PinPayload['recipient_kek_envelopes'] = [];
  for (const r of recipients) {
    try {
      const env = await encryptKekForRecipient(kek, r.public_key);
      recipient_kek_envelopes.push({
        recipient_user_id: r.recipient_user_id,
        encrypted_kek: env.encrypted_kek,
      });
    } catch (err) {
      // 1 人分の公開鍵が壊れていても、PIN 登録自体は止めない。
      // この連携者には次回の PIN 登録／更新時に再配布される。
      console.warn(
        '[pinV2Client] 連携者への KEK 暗号化に失敗（スキップ）',
        r.recipient_user_id,
        err
      );
    }
  }

  return {
    algorithm_version: 'v2',
    encrypted_pin: pinPart.encrypted_pin,
    iv: pinPart.iv,
    encrypted_dek: dekPart.encrypted_dek,
    dek_iv: dekPart.iv,
    owner_kek_envelope: ownerEnvelopeToSend,
    recipient_kek_envelopes,
  };
}

// =============================================================================
// 連携者への KEK 追加配布（PIN には触れない）
// =============================================================================

/**
 * 既存の KEK を、まだ受け取っていない連携者の公開鍵で暗号化する。
 *
 * PIN の登録・更新とは独立して「連携者にだけ鍵を配り直す」ために使う。
 * 連携者を新しく追加したあと、本人がパスフレーズを入力したタイミング
 * （PIN 表示時のバックグラウンド処理 / ダッシュボードのポップアップ）で呼ばれる。
 *
 * @returns サーバーに送る連携者用 KEK 暗号文の配列（空配列もありうる）
 * @throws PassphraseMismatchError パスフレーズが既存 KEK と一致しない場合
 */
export async function buildRecipientKekEnvelopes(args: {
  passphrase: string;
  ownerKekEnvelope: OwnerKekEnvelopeData;
  recipients: RecipientPublicKey[];
}): Promise<Array<{ recipient_user_id: string; encrypted_kek: string }>> {
  const { passphrase, ownerKekEnvelope, recipients } = args;
  if (recipients.length === 0) return [];

  // パスフレーズで既存 KEK を復号
  let kek: Uint8Array;
  try {
    kek = await decryptKekAsOwner(
      { ...ownerKekEnvelope, algorithm_version: 'v1' },
      passphrase
    );
  } catch {
    throw new PassphraseMismatchError();
  }

  const out: Array<{ recipient_user_id: string; encrypted_kek: string }> = [];
  for (const r of recipients) {
    try {
      const env = await encryptKekForRecipient(kek, r.public_key);
      out.push({
        recipient_user_id: r.recipient_user_id,
        encrypted_kek: env.encrypted_kek,
      });
    } catch (err) {
      // 1 人分の公開鍵が壊れていても他は続行
      console.warn(
        '[pinV2Client] 連携者への KEK 暗号化に失敗（スキップ）',
        r.recipient_user_id,
        err
      );
    }
  }
  return out;
}

// =============================================================================
// 表示：本人が v2 PIN を復号
// =============================================================================

/**
 * 本人が、v2 方式で保存された PIN を自分のパスフレーズで復号する。
 *
 * @throws PassphraseMismatchError パスフレーズが一致しない場合
 */
export async function decryptV2PinAsOwner(args: {
  record: {
    encrypted_pin: string;
    iv: string;
    encrypted_dek: string;
    dek_iv: string;
  };
  ownerKekEnvelope: OwnerKekEnvelopeData;
  passphrase: string;
}): Promise<string> {
  const { record, ownerKekEnvelope, passphrase } = args;

  // ① パスフレーズで KEK を復号
  let kek: Uint8Array;
  try {
    kek = await decryptKekAsOwner(
      { ...ownerKekEnvelope, algorithm_version: 'v1' },
      passphrase
    );
  } catch {
    throw new PassphraseMismatchError();
  }

  // ② KEK で DEK を復号
  const dek = await decryptDekWithKek(
    { encrypted_dek: record.encrypted_dek, iv: record.dek_iv },
    kek
  );

  // ③ DEK で PIN を復号
  return decryptPinV2(
    {
      encrypted_pin: record.encrypted_pin,
      iv: record.iv,
      algorithm_version: 'v2',
    },
    dek
  );
}
