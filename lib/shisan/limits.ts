/**
 * lib/shisan/limits.ts
 *
 * 1日の相談上限（修正指示書_20260707・修正6）。
 * 一般ユーザーは SHISAN_CHAT_DAILY_LIMIT（既定20）。
 * SHISAN_OPERATOR_EMAILS（カンマ区切り）に列挙したメールの会員は大幅緩和（テスト用）。
 */
import "server-only";

const DEFAULT_LIMIT = 20;
const OPERATOR_LIMIT = 200;

function baseLimit(): number {
  const v = Number(process.env.SHISAN_CHAT_DAILY_LIMIT);
  return isFinite(v) && v > 0 ? Math.round(v) : DEFAULT_LIMIT;
}
function operatorEmails(): Set<string> {
  return new Set(
    (process.env.SHISAN_OPERATOR_EMAILS ?? "")
      .split(",").map((s) => s.trim().toLowerCase()).filter(Boolean)
  );
}

/** 会員メールに応じた1日の相談上限。運営者は緩和後の値。 */
export function dailyLimitFor(email: string | null | undefined): number {
  const base = baseLimit();
  if (email && operatorEmails().has(email.toLowerCase())) return Math.max(OPERATOR_LIMIT, base);
  return base;
}
