/**
 * lib/shisan/auth.ts
 *
 * /shisan 会員のマジックリンク認証（Phase1 要件§3）。
 *
 * 採用方式：自前トークン（HMAC署名・ステートレス）＋セッションcookie。
 * Supabase Auth (Magic Link) を使わない理由：
 *   - 本サイトの Supabase Auth はデジタル資産機能（/digital）の会員基盤として稼働中。
 *     middleware が「auth cookieあり→ / から /digital へリダイレクト」する設計のため、
 *     shisan会員を同じ auth.users に混ぜると導線が衝突する。
 *   - shisan Phase1 に必要なのは「メール所有確認＋セッション」のみで、
 *     署名付きトークンで十分（テーブル追加も不要）。
 *
 * トークン形式: base64url("<signupId>.<expiresMs>") + "." + HMAC-SHA256署名
 *   - ログインリンク用: 有効期限24時間
 *   - セッションcookie用: 有効期限30日（httpOnly）
 */

import "server-only";
import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "shisan_session";
const LOGIN_TOKEN_TTL_MS = 24 * 60 * 60 * 1000;      // 24h（要件§3）
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;     // 30日

function secret(): string {
  const s = process.env.SHISAN_AUTH_SECRET;
  if (!s) throw new Error("SHISAN_AUTH_SECRET が未設定です。");
  return s;
}

function b64url(input: string): string {
  return Buffer.from(input, "utf8").toString("base64url");
}
function unb64url(input: string): string | null {
  try { return Buffer.from(input, "base64url").toString("utf8"); } catch { return null; }
}
function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

/** signupId を含む署名付きトークンを発行 */
export function createToken(signupId: string, ttlMs: number): string {
  const payload = b64url(`${signupId}.${Date.now() + ttlMs}`);
  return `${payload}.${sign(payload)}`;
}
export function createLoginToken(signupId: string): string {
  return createToken(signupId, LOGIN_TOKEN_TTL_MS);
}
export function createSessionToken(signupId: string): string {
  return createToken(signupId, SESSION_TTL_MS);
}

/** トークン検証。有効なら signupId、無効/期限切れなら null */
export function verifyToken(token: string | undefined | null): string | null {
  if (!token || typeof token !== "string" || token.length > 500) return null;
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return null;
  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = sign(payload);
  const a = Buffer.from(sig), b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  const decoded = unb64url(payload);
  if (!decoded) return null;
  const sep = decoded.lastIndexOf(".");
  if (sep <= 0) return null;
  const signupId = decoded.slice(0, sep);
  const exp = Number(decoded.slice(sep + 1));
  if (!signupId || !isFinite(exp) || Date.now() > exp) return null;
  return signupId;
}

/** セッションcookieから signupId を取得（未ログインなら null） */
export async function getSessionSignupId(): Promise<string | null> {
  const jar = await cookies();
  return verifyToken(jar.get(SESSION_COOKIE)?.value);
}

/** セッションcookieの属性（Set-Cookie 用） */
export function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  };
}
