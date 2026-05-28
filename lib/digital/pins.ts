/**
 * digital_pin_secrets テーブルのサーバー側ヘルパー。
 *
 * 🔒 Phase1 の絶対ルール：
 *   - サーバーは **平文 PIN も平文パスフレーズも絶対に扱わない**。
 *   - このモジュールが保存・取得するのは「暗号文 (encrypted_pin)」「IV」「salt」「algorithm_version」のみ。
 *   - 復号はクライアントの lib/crypto/pin.ts でしか行わない（ESLint rule で担保）。
 *
 * 本ファイルは server-only。API Route からのみ呼ぶ。
 */

import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { DigitalPinSecret } from '@/types/digital';

/**
 * API から受け取った、暗号化済み PIN の保存用レコード。
 * ここで受け取る時点で「クライアントで暗号化済み」であることを必須とする。
 *
 * v1: パスフレーズ → PBKDF2 → AES-GCM で PIN を直接暗号化（salt 必須）
 * v2: PIN → DEK（AES-GCM）→ KEK で DEK を包装。salt は KEK エンベロープ側が持つため不要。
 */
export type PinSecretInputV1 = {
  device_id: string;
  encrypted_pin: string; // base64
  iv: string;            // base64（12 bytes）
  salt: string;          // base64（16 bytes）
  algorithm_version: 'v1';
};

export type PinSecretInputV2 = {
  device_id: string;
  encrypted_pin: string;  // base64（DEK で暗号化）
  iv: string;             // base64（12 bytes）PIN 用 IV
  encrypted_dek: string;  // base64（KEK で暗号化された DEK）
  dek_iv: string;         // base64（12 bytes）DEK 用 IV
  algorithm_version: 'v2';
};

export type PinSecretInput = PinSecretInputV1 | PinSecretInputV2;

/**
 * version に応じた DB 保存用カラム集合を組み立てる。
 * v1 では encrypted_dek / dek_iv を null に、v2 では salt を null にする。
 */
function buildPinSecretColumns(input: PinSecretInput): {
  encrypted_pin: string;
  iv: string;
  salt: string | null;
  algorithm_version: 'v1' | 'v2';
  encrypted_dek: string | null;
  dek_iv: string | null;
} {
  if (input.algorithm_version === 'v1') {
    return {
      encrypted_pin: input.encrypted_pin,
      iv: input.iv,
      salt: input.salt,
      algorithm_version: 'v1',
      encrypted_dek: null,
      dek_iv: null,
    };
  }
  return {
    encrypted_pin: input.encrypted_pin,
    iv: input.iv,
    salt: null,
    algorithm_version: 'v2',
    encrypted_dek: input.encrypted_dek,
    dek_iv: input.dek_iv,
  };
}

/**
 * digital_pin_secrets.device_id は UNIQUE。既存の行があれば `true` を返す。
 * 登録時の重複検知、更新フローの分岐に使う。
 */
export async function pinSecretExistsByDevice(
  supabase: SupabaseClient,
  userId: string,
  deviceId: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from('digital_pin_secrets')
    .select('id')
    .eq('user_id', userId)
    .eq('device_id', deviceId)
    .maybeSingle();

  if (error) {
    console.error('[lib/digital/pins] pinSecretExistsByDevice failed', error);
    throw new Error(error.message);
  }
  return data !== null;
}

/**
 * PIN シークレット（暗号化済み）を新規登録する。
 *
 * ※ INSERT 時に「その device が自分の物か」を RLS ポリシー（005 migration）で担保している。
 *    さらに API 側でも device の所有チェックを事前に行い、多層防御する。
 */
export async function createPinSecret(
  supabase: SupabaseClient,
  userId: string,
  input: PinSecretInput
): Promise<DigitalPinSecret> {
  // 先に存在確認。既存なら 409 を返せるよう呼び出し側で判断するため例外ではなく null を返したいが、
  // UNIQUE 制約で守られているのでここでは重複時は DB が conflict を返す → 上位でハンドリング。
  const { data, error } = await supabase
    .from('digital_pin_secrets')
    .insert({
      user_id: userId,
      device_id: input.device_id,
      ...buildPinSecretColumns(input),
    })
    .select()
    .single();

  if (error) {
    console.error('[lib/digital/pins] createPinSecret failed', {
      code: error.code,
      message: error.message,
    });
    // 23505 = unique_violation
    if (error.code === '23505') {
      throw new PinAlreadyExistsError();
    }
    throw new Error(error.message);
  }

  return data as DigitalPinSecret;
}

/**
 * 取得：PIN 表示（復号）用のレコードを返す。
 * このメソッドを呼べるのは「step-up を通過した API」のみ（API 側で gate する）。
 */
export async function getPinSecretByDevice(
  supabase: SupabaseClient,
  userId: string,
  deviceId: string
): Promise<DigitalPinSecret | null> {
  const { data, error } = await supabase
    .from('digital_pin_secrets')
    .select('*')
    .eq('user_id', userId)
    .eq('device_id', deviceId)
    .maybeSingle();

  if (error) {
    console.error('[lib/digital/pins] getPinSecretByDevice failed', error);
    throw new Error(error.message);
  }
  return data ? (data as DigitalPinSecret) : null;
}

/**
 * Base64 形式のゆるい検証。
 * Web Crypto から出力した base64 (padding `=` あり) を想定。
 * 厳密なパディング計算までは行わない（DB の TEXT 型に保存するだけ）。
 */
export function isBase64Like(s: unknown, minBytes = 1, maxBytes = 1024): boolean {
  if (typeof s !== 'string') return false;
  if (!/^[A-Za-z0-9+/_-]+={0,2}$/.test(s)) return false;
  // 雑な長さレンジチェック：base64 の長さ ≒ ceil(bytes/3)*4
  const approxBytes = Math.floor((s.replace(/=+$/, '').length * 3) / 4);
  return approxBytes >= minBytes && approxBytes <= maxBytes;
}

/**
 * 既登録の PIN に対してもう一度 POST が来たときに投げる例外。
 */
export class PinAlreadyExistsError extends Error {
  constructor() {
    super('PIN is already registered for this device.');
    this.name = 'PinAlreadyExistsError';
  }
}

/**
 * 更新対象の PIN が見つからないときに投げる例外（RLS / user_id 不一致 / device_id 不一致 を含む）。
 */
export class PinNotFoundError extends Error {
  constructor() {
    super('PIN is not registered for this device.');
    this.name = 'PinNotFoundError';
  }
}

/**
 * 登録済み PIN を新しい暗号文で丸ごと差し替える。
 *
 * Phase1 の設計判断：
 *   - 「旧パスフレーズの証明」を要求しない。
 *     旧暗号文は他者に読めず、運営にも読めないので、差し替えにあたって旧の鍵を証明させる
 *     暗号学的メリットは無い。UX 面でも「パスフレーズを忘れた → 更新不可」の詰みを避けるため、
 *     step-up OTP 再認証のみをゲートとする。
 *   - device_id の変更は許可しない（URL のパラメータと一致させる）。
 *   - algorithm_version は必ず保存。v1 の PIN を v2 で更新すると、その PIN は v2 に移行する
 *     （buildPinSecretColumns が v2 では salt=null、encrypted_dek/dek_iv を埋める）。
 *
 * API 側で必ず assertStepup を通過してから呼ぶこと。
 */
export async function updatePinSecret(
  supabase: SupabaseClient,
  userId: string,
  input: PinSecretInput
): Promise<DigitalPinSecret> {
  const { data, error } = await supabase
    .from('digital_pin_secrets')
    .update(buildPinSecretColumns(input))
    .eq('user_id', userId)
    .eq('device_id', input.device_id)
    .select()
    .maybeSingle();

  if (error) {
    console.error('[lib/digital/pins] updatePinSecret failed', {
      code: error.code,
      message: error.message,
    });
    throw new Error(error.message);
  }
  if (!data) {
    // RLS / user_id 不一致 / 未登録 のいずれか → 登録済みでないとみなす
    throw new PinNotFoundError();
  }
  return data as DigitalPinSecret;
}

/**
 * 登録済み PIN を削除する（物理削除）。
 *
 * Phase1 の設計判断：
 *   - 削除にはパスフレーズを要求しない（そもそも DB 側からは復号できない & UX 詰み回避）。
 *   - デバイス自体は残す。デバイスごと削除したいときは DELETE /api/digital/devices/[id] 側で処理する。
 *   - 戻り値は「実際に削除された行があったか」。0行削除でも成功扱いだが、UI 側で警告を出したいときに使う。
 */
export async function deletePinSecretByDevice(
  supabase: SupabaseClient,
  userId: string,
  deviceId: string
): Promise<{ deleted: boolean }> {
  const { data, error } = await supabase
    .from('digital_pin_secrets')
    .delete()
    .eq('user_id', userId)
    .eq('device_id', deviceId)
    .select('id');

  if (error) {
    console.error('[lib/digital/pins] deletePinSecretByDevice failed', error);
    throw new Error(error.message);
  }
  return { deleted: Array.isArray(data) && data.length > 0 };
}

/**
 * 指定ユーザーの PIN シークレットをすべて物理削除する。
 *
 * パスフレーズ紛失時の「リセット（作り直し）」フローで使う。
 * 暗号文は本人パスフレーズが無ければ誰も復号できず、保持し続ける意味が無いため、
 * KEK エンベロープの全削除（lib/digital/kekEnvelopes.ts）とセットで実行する。
 *
 * デバイス本体（digital_devices）は残す。リセット後、本人が同じデバイスに
 * 新しいパスフレーズで PIN を登録し直せる。
 *
 * @returns 実際に削除した PIN 件数
 */
export async function deleteAllPinSecretsForUser(
  supabase: SupabaseClient,
  userId: string
): Promise<{ deletedCount: number }> {
  const { data, error } = await supabase
    .from('digital_pin_secrets')
    .delete()
    .eq('user_id', userId)
    .select('id');

  if (error) {
    console.error('[lib/digital/pins] deleteAllPinSecretsForUser failed', error);
    throw new Error(error.message);
  }
  return { deletedCount: Array.isArray(data) ? data.length : 0 };
}
