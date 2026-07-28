/**
 * lib/shisan/format.ts
 *
 * 金額の表示ヘルパー（共有）。
 *
 * 経緯：もともと app/shisan/AssetConciergeMvp.tsx の中に置いていたが、
 * /loan の計算ツールでも同じ表記ルールが必要になったため、2026-07-29 に共通化した。
 * **純粋な抽出であり、ロジックは一切変えていない**（/shisan の表示は変更前後で完全に同一）。
 *
 * 表記ルール（既存の決定事項）：
 *   - 価格表記はすべて「円」。`¥` は使わない。
 *   - 1億以上は「◯億」「◯億◯,◯◯◯万」と表記する（「20,000万」を避ける）。
 *   - 1億未満は従来どおり「◯,◯◯◯万」。
 *   - 表示専用。calc.ts の計算は不変。
 */

/** 万円単位の数値を「2億5,813万」「1,623万」の形にする（表示専用）。 */
export function manUnitToOku(manTotal: number): string {
  if (Math.abs(manTotal) < 10000) return `${manTotal.toLocaleString("ja-JP")}万`;
  const oku = Math.trunc(manTotal / 10000);
  const rest = Math.abs(manTotal % 10000);
  return rest === 0 ? `${oku.toLocaleString("ja-JP")}億` : `${oku.toLocaleString("ja-JP")}億${rest.toLocaleString("ja-JP")}万`;
}

/** 円単位の数値を「2億5,813万」「1,623万」の形にする（表示専用）。 */
export function manOku(yenValue: number): string {
  return manUnitToOku(Math.round(yenValue / 10000));
}

/**
 * 金額入力欄の下に出す万円換算（例：「＝3,000万円」）。
 * 単位ミス（年収を「60」と入れる等）を防ぐための表示で、内部単位は円のまま。
 * 1万円未満は表示しない（換算する意味がないため）。
 */
export function manHint(v?: string): string {
  const d = (v ?? "").replace(/[^\d]/g, "");
  if (!d) return "";
  const n = Number(d);
  return n >= 10000 ? `＝${manOku(n)}円` : "";
}
