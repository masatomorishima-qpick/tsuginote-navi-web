/**
 * app/retirement/pro/excel/route.ts — Excel の口（A-2a-3・senjutsu_20260902ad.md 3番・y.md 1番）
 *
 * GET `/retirement/pro/excel` → 4シートの .xlsx（`Content-Disposition: attachment`）
 *
 * ★置き場は `/retirement/pro/` の下（Cookie の path・`inputs` と同じ理由）。
 * ★`kekka` は読まず、`inputs`（raw28）から build し直します（y.md 4番）。★中身は `lib/retirement/pro/kuchiExcel.ts`・`excel.ts`。
 * ★返り … 401（Cookie 無し・表に無い・期限切れ）／409（まだ計算していない）／422（計算が止まった）／200（xlsx）
 * ★親は fetch → blob で受けます（ボタンを押せなくし、待つ間の字を出す）。★`track()` は呼びません（A-2b で決める）。
 */

import 'server-only';
import { NextResponse, type NextRequest } from 'next/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { COOKIE_NA, kagiNoKatachiKa } from '@/lib/retirement/pro/cookie';
import { excelWoKaesu } from '@/lib/retirement/pro/kuchiExcel';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const FILENAME = 'tsuginote_kekka.xlsx';

export async function GET(req: NextRequest) {
  const now = new Date();
  const c = req.cookies.get(COOKIE_NA)?.value;
  const kagi = kagiNoKatachiKa(c) ? c : null;

  let admin;
  try {
    admin = createAdminSupabaseClient();
  } catch (e) {
    console.error('[pro/excel] 環境変数がありません', { name: e instanceof Error ? e.message : 'unknown' });
    return new NextResponse(null, { status: 500 });
  }

  const r = await excelWoKaesu(admin, kagi, now);
  if (r.status !== 200 || r.bytes === null) {
    const res = new NextResponse(null, { status: r.status });
    res.headers.set('X-Robots-Tag', 'noindex');
    res.headers.set('Cache-Control', 'private, no-store');
    return res;
  }
  // ★Uint8Array を ArrayBuffer に写して返します（型の都合。中身は同じ bytes）
  const ab = r.bytes.buffer.slice(r.bytes.byteOffset, r.bytes.byteOffset + r.bytes.byteLength) as ArrayBuffer;
  return new NextResponse(ab, {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${FILENAME}"`,
      'Cache-Control': 'private, no-store',
      'X-Robots-Tag': 'noindex',
    },
  });
}
