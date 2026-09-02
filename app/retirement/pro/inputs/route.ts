/**
 * app/retirement/pro/inputs/route.ts — 保存と計算の口（A-2a-2・senjutsu_20260902ad.md 2番・ae.md 1番）
 *
 * POST `/retirement/pro/inputs`  body `{ raw: Record<string,string> }`
 *
 * ★★置き場が `/api/...` ではなく `/retirement/pro/` の下なのは、通行証の Cookie の path が `/retirement/pro` で、
 *   ブラウザは path が頭に一致する URL にしか Cookie を送らないためです（ae.md 1番・扉 `hiraku` と同じ置き方）。
 * ★中身は `lib/retirement/pro/kuchi.ts`（器で当てるため）。ここは Cookie を読んで渡し、返りを NextResponse にするだけです。
 * ★返り … 401 `{}`／400 `{ ayamari }`／422 `{ ayamari:'keisan' }`／500 `{}`／200 `{ kekka }`
 * ★GET は Next の既定で 405。★`X-Robots-Tag: noindex`・`Cache-Control: private, no-store`（扉と同じ）。
 * ★記録に鍵・メールアドレス・inputs・kekka の値を書きません（`kuchi.ts`）。
 */

import 'server-only';
import { NextResponse, type NextRequest } from 'next/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { COOKIE_NA, kagiNoKatachiKa } from '@/lib/retirement/pro/cookie';
import { inputsWoUketoru } from '@/lib/retirement/pro/kuchi';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function henji(status: number, body: unknown): NextResponse {
  const res = NextResponse.json(body, { status });
  res.headers.set('X-Robots-Tag', 'noindex');
  res.headers.set('Cache-Control', 'private, no-store');
  return res;
}

export async function POST(req: NextRequest) {
  // ★受け取った時刻。ここで1回だけ作り、下へ渡します（既定値を作らない）
  const now = new Date();
  const c = req.cookies.get(COOKIE_NA)?.value;
  const kagi = kagiNoKatachiKa(c) ? c : null;

  let bodyText: string;
  try {
    bodyText = await req.text();
  } catch {
    return henji(400, { ayamari: 'json' });
  }

  let admin;
  try {
    admin = createAdminSupabaseClient();
  } catch (e) {
    console.error('[pro/inputs] 環境変数がありません', { name: e instanceof Error ? e.message : 'unknown' });
    return henji(500, {});
  }

  const r = await inputsWoUketoru(admin, kagi, bodyText, now);
  return henji(r.status, r.body);
}
