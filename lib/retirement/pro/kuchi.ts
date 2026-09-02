/**
 * lib/retirement/pro/kuchi.ts — 口2本（`/retirement/pro/inputs`・`/retirement/pro/excel`）の中身（A-2a-2・A-2a-3）
 *
 * ★★route.ts は「Cookie を読む → ここを呼ぶ → 返りを NextResponse にする」だけです。
 *   中身をここに置くのは、器で当てるためです（`admin` と `now` を呼び出し側から渡す・既定値を作らない）。
 *
 * ★保存と計算の口（senjutsu_20260902ad.md 2番・ae.md 1番）
 *   ①  Cookie が無い・形が外れる → 401 `{}`（記録0）
 *   ②  表を引く `id, expires_at` … 無い → 401／期限切れ → 401（記録0・鍵を書かない）
 *   ③  JSON `{ raw }` … 形が違う → 400 `{ ayamari:'json' }`
 *   ④  `rawToPaidInput(raw, 今年)` … 誤りがあれば 400 `{ ayamari: [...] }`（★項目の `no`・鍵・決まりの名前だけ。値は返さない）
 *   ⑤  計算（`keisan()`）… 例外（E-23 など）→ 422 `{ ayamari:'keisan' }`（記録に例外の名前だけ）
 *   ⑥  `update inputs = { kata:'raw28', raw }, kekka, updated_at` … 書けない → 500 `{}`（★保存できたときだけ返す）
 *   ⑦  200 `{ kekka }`
 *
 * ★Excel の口は `kuchiExcel.ts`（★exceljs を読み込む本を、この口の束に入れないため。ビルドで確かめました）
 *
 * ★記録 … info 1行（ms・通り数・kekka の文字数だけ）。error は道の名前だけ。★鍵・メールアドレス・inputs・kekka の値は書きません
 */

import 'server-only';
import type { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { tokyoYear } from './now';
import { rawToPaidInput, type Ayamari } from './paidRules';
import { keisan } from './kekka';

type Admin = ReturnType<typeof createAdminSupabaseClient>;

export type Henji = { status: number; body: unknown };

/** ①② 通行証の行を引く（★`kekka` は引かない。引くのは頁と、この口の返りだけ） */
export async function gyouWoHiku(
  admin: Admin, kagi: string | null, now: Date, retsu: string,
): Promise<{ ok: true; row: Record<string, unknown> } | { ok: false }> {
  if (kagi === null) return { ok: false };
  const { data, error } = await admin
    .from('retirement_pro_passes')
    .select(retsu)
    .eq('pass_key', kagi)
    .maybeSingle();
  if (error) {
    console.error('[pro/kuchi] 表を引けませんでした', { code: error.code ?? null });
    return { ok: false };
  }
  if (!data) return { ok: false };
  const row = data as unknown as Record<string, unknown>;
  const kigen = new Date(String(row.expires_at));
  if (!Number.isFinite(kigen.getTime()) || kigen.getTime() <= now.getTime()) return { ok: false };
  return { ok: true, row };
}

/** raw の形（`Record<string,string>`）か */
export function rawKa(x: unknown): x is Record<string, string> {
  if (typeof x !== 'object' || x === null || Array.isArray(x)) return false;
  return Object.values(x as Record<string, unknown>).every((v) => typeof v === 'string');
}

/** 400 で返す誤り（★値は返さない。`no`・鍵・決まり・越えの字だけ） */
function ayamariWoKaesu(xs: Ayamari[]): Ayamari[] {
  return xs.map((a) => ({ no: a.no, kagi: a.kagi, kimari: a.kimari, ...(a.ji ? { ji: a.ji } : {}) }));
}

/**
 * 保存と計算の口。
 * @param kagi Cookie の値（形を確かめたもの）。無ければ null
 * @param bodyText 受け取った JSON の字
 * @param now 受け取った時刻（★呼び出し側から）
 */
export async function inputsWoUketoru(
  admin: Admin, kagi: string | null, bodyText: string, now: Date,
): Promise<Henji> {
  // ①②
  const g = await gyouWoHiku(admin, kagi, now, 'id, expires_at');
  if (!g.ok) return { status: 401, body: {} };
  const id = String(g.row.id);

  // ③
  let raw: Record<string, string>;
  try {
    const j = JSON.parse(bodyText) as unknown;
    if (typeof j !== 'object' || j === null || !rawKa((j as { raw?: unknown }).raw)) {
      return { status: 400, body: { ayamari: 'json' } };
    }
    raw = (j as { raw: Record<string, string> }).raw;
  } catch {
    return { status: 400, body: { ayamari: 'json' } };
  }

  // ④（★今年は、受け取った時刻から。既定値を作らない）
  const genzaiNen = tokyoYear(now);
  const y = rawToPaidInput(raw, genzaiNen);
  if (!y.ok) {
    console.info('[pro/inputs] 入力の誤り', { kazu: y.ayamari.length });
    return { status: 400, body: { ayamari: ayamariWoKaesu(y.ayamari) } };
  }

  // ⑤
  let k;
  try {
    k = keisan(y.v, genzaiNen, now);
  } catch (e) {
    console.error('[pro/inputs] ★計算が止まりました', { name: e instanceof Error ? e.name : 'unknown' });
    return { status: 422, body: { ayamari: 'keisan' } };
  }

  // ⑥（★保存できたときだけ返す）
  const { error } = await admin
    .from('retirement_pro_passes')
    .update({ inputs: { kata: 'raw28', raw }, kekka: k.kekka, updated_at: now.toISOString() })
    .eq('id', id);
  if (error) {
    console.error('[pro/inputs] ★計算はできましたが、保存できませんでした', { code: error.code ?? null });
    return { status: 500, body: {} };
  }

  console.info('[pro/inputs] 計算して保存しました', {
    ms: k.ms, toorisu: k.kekka.toorisu, moji: JSON.stringify(k.kekka).length,
  });
  return { status: 200, body: { kekka: k.kekka } };
}

