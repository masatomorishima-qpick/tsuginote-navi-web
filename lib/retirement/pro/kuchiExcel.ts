/**
 * lib/retirement/pro/kuchiExcel.ts — Excel の口の中身（A-2a-3・senjutsu_20260902ad.md 3番・y.md 1番・z.md 穴1）
 *
 * ★★`kuchi.ts` と分けているのは、exceljs（約1MB の束）を**この口だけ**が読み込むようにするためです
 *   （`next build` で、`inputs` の口の束に exceljs が入っていないことを確かめました）。
 *
 *   ①②  Cookie → 行（`id, expires_at, inputs`）。★`inputs` が raw28 でない（まだ計算していない）→ 409
 *   ③   `rawToPaidInput` → 計算（build → zenToori → gamen8）。★`kekka` は読まず `inputs` から作り直します（y.md 4番）
 *   ④   4シート（`excel.ts`）→ 200（xlsx の bytes）
 * ★記録 … info 1行（ms とバイト数だけ）
 */

import 'server-only';
import type { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { tokyoYear } from './now';
import { rawToPaidInput } from './paidRules';
import { keisan } from './kekka';
import { excelWoTsukuru } from './excel';
import { gyouWoHiku, rawKa } from './kuchi';

type Admin = ReturnType<typeof createAdminSupabaseClient>;

/**
 * Excel の口。★`kekka` ではなく `inputs`（raw28）から作り直します（senjutsu_20260902y.md 4番）。
 */
export async function excelWoKaesu(
  admin: Admin, kagi: string | null, now: Date,
): Promise<{ status: number; bytes: Uint8Array | null }> {
  const g = await gyouWoHiku(admin, kagi, now, 'id, expires_at, inputs');
  if (!g.ok) return { status: 401, bytes: null };
  const inputs = g.row.inputs as { kata?: unknown; raw?: unknown } | null;
  if (!inputs || inputs.kata !== 'raw28' || !rawKa(inputs.raw)) return { status: 409, bytes: null };

  const genzaiNen = tokyoYear(now);
  const y = rawToPaidInput(inputs.raw, genzaiNen);
  if (!y.ok) {
    // ★保存した raw が今年の決まりで通らない（年が変わった、など）。★入力し直していただく（409 と同じ扱い）
    console.info('[pro/excel] 保存してある入力が、いまの決まりで通りません', { kazu: y.ayamari.length });
    return { status: 409, bytes: null };
  }
  let k;
  try {
    k = keisan(y.v, genzaiNen, now);
  } catch (e) {
    console.error('[pro/excel] ★計算が止まりました', { name: e instanceof Error ? e.name : 'unknown' });
    return { status: 422, bytes: null };
  }
  const t0 = Date.now();
  const bytes = await excelWoTsukuru(k, y.v, inputs.raw);
  console.info('[pro/excel] 作りました', { ms: { ...k.ms, kaku: Date.now() - t0 }, bytes: bytes.byteLength });
  return { status: 200, bytes };
}
