/**
 * lib/retirement/pro/cookie.ts — 通行証の Cookie の決め（1か所）
 *
 * ★B-3 の扉（`hiraku/route.ts`）の中にあった3つを、口（`/retirement/pro/inputs`・`/excel`）と頁も読むので、ここに出しました（A-2a）。
 * ★字は1つも変えていません。★`path` は `/retirement/pro`（B-3 の決め・t.md 止め3）。
 *   ★★口は `/retirement/pro/` の下に置きます ── Cookie の path が頭に一致するときだけ送られるためです（senjutsu_20260902ae.md 1番）。
 * ★`server-only` は付けません（値を持たない決めだけです）。
 */

/** 通行証の鍵の形（base64url の字だけ・1〜200文字） */
export const KAGI_NO_KATACHI = /^[A-Za-z0-9_-]{1,200}$/;

/** Cookie の名前 */
export const COOKIE_NA = 'pro_pass';

/** Cookie の置き方。★消すときも同じ形で（path が違うと消えません） */
export const COOKIE_NO_KATA = {
  httpOnly: true,
  secure: true,
  sameSite: 'lax',
  path: '/retirement/pro',
} as const;

/** 7日（秒） */
export const NANOKA = 604800;

/** Cookie の値が鍵の形か（★形だけ。表は引きません） */
export function kagiNoKatachiKa(v: string | undefined | null): v is string {
  return typeof v === 'string' && KAGI_NO_KATACHI.test(v);
}
