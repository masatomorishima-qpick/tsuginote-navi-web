/**
 * step-up 再認証トークンのサーバー側ヘルパー（Phase 1 PIN 機能）
 *
 * ──────────────────────────────────────────────────────────────────
 * なぜ独自実装か
 *   Supabase の verifyOtp は「新しいログインセッション」を発行する API であり、
 *   step-up 用途に対しては有効期限・スコープを限定できない。
 *   そこで「Supabase verifyOtp の成功＝step-up 通過」とみなし、
 *   5 分間だけ有効な HMAC 署名つき Cookie を独自に発行する。
 *
 * セキュリティ前提
 *   - SecRet は env 変数 `DIGITAL_STEPUP_HMAC_SECRET`（32 文字以上必須）
 *   - Cookie は httpOnly / sameSite=strict / secure（本番時）
 *   - 有効期限 5 分 / ペイロードに user_id を含め、他ユーザーへの転用を防ぐ
 *   - サインは HMAC-SHA256。timingSafeEqual で比較
 *
 * 本モジュールはサーバー側専用（server-only）。
 * ──────────────────────────────────────────────────────────────────
 *
 * フィーチャーフラグ（Phase 1 ローンチ仕様）:
 *   `DIGITAL_STEPUP_ENABLED=true` の時だけ step-up が必須になる。
 *   それ以外（未設定 or 'false'）では assertStepup は無条件で ok を返し、
 *   start/verify エンドポイントは 503 を返す。
 *   Phase 1 は OFF で出荷し、顧客フィードバックを見て Phase 2 で
 *   独自 OTP テーブル方式（DESIGN_Phase1_PIN.md §11 参照）に置き換えて再有効化する。
 */

import 'server-only';
import { createHmac, timingSafeEqual } from 'node:crypto';

// -----------------------------------------------------------------------------
// 定数
// -----------------------------------------------------------------------------

/** step-up トークンの最大有効秒数（5 分） */
export const STEPUP_MAX_AGE_SEC = 5 * 60;

/** Cookie 名 */
export const STEPUP_COOKIE_NAME = 'digital_stepup';

/** step-up の用途（監査ログの metadata.purpose に入る） */
export type StepupPurpose =
  | 'pin_reveal'
  | 'pin_update'
  | 'pin_delete'
  | 'device_delete_with_pin';

// -----------------------------------------------------------------------------
// フィーチャーフラグ
// -----------------------------------------------------------------------------

/**
 * step-up 機能が有効かどうか。
 *
 * - `DIGITAL_STEPUP_ENABLED=true` の時だけ true を返す。
 * - 未設定 or 'false' の場合は false（Phase 1 のデフォルト）。
 * - false の時：assertStepup は常に ok、start/verify は 503 を返す、
 *   UI 側の dialog は stepup phase をスキップする。
 */
export function isStepupEnabled(): boolean {
  return process.env.DIGITAL_STEPUP_ENABLED === 'true';
}

// -----------------------------------------------------------------------------
// Secret 取得（起動時に一度だけ検証）
// -----------------------------------------------------------------------------

function getSecret(): string {
  const s = process.env.DIGITAL_STEPUP_HMAC_SECRET;
  if (!s) {
    throw new Error(
      '[lib/digital/stepup] DIGITAL_STEPUP_HMAC_SECRET is not set. ' +
        'Set a 32+ character random string in .env.local / Vercel env.'
    );
  }
  if (s.length < 32) {
    throw new Error(
      '[lib/digital/stepup] DIGITAL_STEPUP_HMAC_SECRET must be at least 32 characters.'
    );
  }
  return s;
}

// -----------------------------------------------------------------------------
// トークン発行
// -----------------------------------------------------------------------------

/**
 * step-up 通過トークンを発行する。
 * 形式: `{user_id}.{exp_unix_sec}.{base64url(hmac)}`
 *
 * @param userId 対象ユーザー ID（Supabase Auth の UUID）
 * @param purpose step-up の用途（監査用・現時点ではペイロードに含めない）
 * @param nowMs  現在時刻（テスト注入用）
 */
export function issueStepupToken(
  userId: string,
  _purpose: StepupPurpose,
  nowMs: number = Date.now()
): string {
  if (!userId) throw new Error('issueStepupToken: userId is required.');

  const expiresAt = Math.floor(nowMs / 1000) + STEPUP_MAX_AGE_SEC;
  const payload = `${userId}.${expiresAt}`;
  const sig = createHmac('sha256', getSecret()).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

// -----------------------------------------------------------------------------
// トークン検証
// -----------------------------------------------------------------------------

export type StepupVerifyResult =
  | { ok: true; expiresAtMs: number }
  | { ok: false; reason: 'malformed' | 'user_mismatch' | 'expired' | 'bad_signature' };

/**
 * step-up トークンを検証する。形式・署名・期限・user_id すべて一致したときのみ ok:true。
 */
export function verifyStepupToken(
  token: string | null | undefined,
  expectedUserId: string,
  nowMs: number = Date.now()
): StepupVerifyResult {
  if (typeof token !== 'string' || token.length === 0) {
    return { ok: false, reason: 'malformed' };
  }

  const parts = token.split('.');
  if (parts.length !== 3) {
    return { ok: false, reason: 'malformed' };
  }
  const [uid, expStr, sig] = parts;

  if (uid !== expectedUserId) {
    return { ok: false, reason: 'user_mismatch' };
  }

  const exp = Number.parseInt(expStr, 10);
  if (!Number.isFinite(exp) || exp <= 0) {
    return { ok: false, reason: 'malformed' };
  }
  if (exp * 1000 < nowMs) {
    return { ok: false, reason: 'expired' };
  }

  const expected = createHmac('sha256', getSecret())
    .update(`${uid}.${expStr}`)
    .digest('base64url');

  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length) return { ok: false, reason: 'bad_signature' };
    if (!timingSafeEqual(a, b)) return { ok: false, reason: 'bad_signature' };
  } catch {
    return { ok: false, reason: 'bad_signature' };
  }

  return { ok: true, expiresAtMs: exp * 1000 };
}

// -----------------------------------------------------------------------------
// Cookie 設定オプション
// -----------------------------------------------------------------------------

/**
 * Route Handler で `NextResponse` に step-up Cookie をセットする際のオプション。
 * `maxAge` は秒単位。
 */
export function stepupCookieOptions() {
  return {
    name: STEPUP_COOKIE_NAME,
    httpOnly: true,
    sameSite: 'strict' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: STEPUP_MAX_AGE_SEC,
  };
}

/**
 * Cookie を削除するためのオプション。
 */
export function clearStepupCookieOptions() {
  return {
    name: STEPUP_COOKIE_NAME,
    httpOnly: true,
    sameSite: 'strict' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  };
}

// -----------------------------------------------------------------------------
// リクエストゲート（PIN 操作系 API から呼ぶ）
// -----------------------------------------------------------------------------

import { cookies } from 'next/headers';

/**
 * 現在のリクエストが step-up を通過していれば ok を返す。PIN 表示/更新/削除の前に呼ぶ。
 *
 * フィーチャーフラグ OFF 時（Phase 1 デフォルト）は無条件で ok を返す。
 * 理由：Phase 1 は段階的リリースとして step-up を OFF で出荷し、
 *      ログイン状態 + パスフレーズ（または削除確認 UI）を防御線とする。
 *
 * 使用例:
 *   const gate = await assertStepup(user.id);
 *   if (!gate.ok) return NextResponse.json({ ok:false, error:'stepup_required' }, { status:401 });
 */
export async function assertStepup(expectedUserId: string): Promise<StepupVerifyResult> {
  if (!isStepupEnabled()) {
    // フィーチャーフラグ OFF：step-up は要求しない。
    return {
      ok: true,
      expiresAtMs: Date.now() + STEPUP_MAX_AGE_SEC * 1000,
    };
  }
  const jar = await cookies();
  const token = jar.get(STEPUP_COOKIE_NAME)?.value ?? null;
  return verifyStepupToken(token, expectedUserId);
}
