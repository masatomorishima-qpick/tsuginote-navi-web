/**
 * app/retirement/pro/hiraku/route.ts — 扉（B-3・senjutsu_20260902q.md 1番／同 s.md 4番エ）
 *
 * GET `/retirement/pro/hiraku?key=…`
 *
 * ★★これは頁ではありません。HTML を1文字も返しません。
 *   鍵を Cookie に移して、**クエリの無い頁へ 302 で送る**だけの口です。
 *
 * ★★なぜ2本に分けるか
 *   `app/layout.tsx` の105行に `<GoogleAnalytics …/>` があり、**サイトの全部の頁**に入ります。
 *   GA4 の自動 `page_view` は `page_location` に**クエリごと**URLを送ります。
 *   → ★`?key=…` のまま頁を出すと、**通行証の鍵が Google に渡ります。**
 *   ★302 の**あと**に GA4 が動くので、`page_location` は `/retirement/pro/kekka`（クエリなし）になります。
 *   ★`page_referrer` にも鍵は出ません。
 *
 * ★決め
 *   ・★**表を引きません。**鍵を Cookie に移すだけです（★通る／通らないは、頁の側で決めます）
 *   ・★`key` の**字の形だけ**を見ます（base64url の字・1〜200文字）。
 *     ★理由 ── `?key=` には何でも書けます。長すぎる字や妙な字を、そのまま `Set-Cookie` に乗せません
 *     ★通行証の鍵は `randomBytes(32).toString('base64url')` の43文字ですので、この形で足ります
 *   ・★`key` が無い／形が外れたときは、**Cookie を消して**同じところへ 302（★分岐は頁に1本化）
 *   ・★記録に**鍵も `key` の字も書きません**
 *   ・★`Location` は**相対**にします（★元の URL の作り方に頼らないため）
 */

import 'server-only';
import { NextResponse } from 'next/server';
// ★Cookie の決め（名前・形・path・7日）は `lib/retirement/pro/cookie.ts` に1か所（A-2a・口も同じものを読みます）
import { KAGI_NO_KATACHI, COOKIE_NA, COOKIE_NO_KATA, NANOKA } from '@/lib/retirement/pro/cookie';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** 302 の行き先（★クエリなし） */
const IKISAKI = '/retirement/pro/kekka';

export async function GET(req: Request) {
  let key: string | null = null;
  try {
    key = new URL(req.url).searchParams.get('key');
  } catch {
    key = null;
  }

  const res = new NextResponse(null, { status: 302 });
  res.headers.set('Location', IKISAKI);
  res.headers.set('X-Robots-Tag', 'noindex');
  res.headers.set('Cache-Control', 'private, no-store');

  if (key !== null && KAGI_NO_KATACHI.test(key)) {
    res.cookies.set(COOKIE_NA, key, { ...COOKIE_NO_KATA, maxAge: NANOKA });
  } else {
    // ★鍵が無い／形が外れた → 前の Cookie を消して、同じところへ送ります
    res.cookies.set(COOKIE_NA, '', { ...COOKIE_NO_KATA, maxAge: 0 });
  }

  // ★鍵も key の字も書きません。★記録も出しません（A-2a・senjutsu_20260902t.md 2番の2「扉の記録は黙らせる」・栓と同じ）
  return res;
}
