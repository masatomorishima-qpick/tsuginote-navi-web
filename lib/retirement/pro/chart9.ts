/**
 * lib/retirement/pro/chart9.ts ── 画面9詳細の図（`v5/gamen9_chart.py` の移植）
 *
 * **数字も座標も、ここで作ります。**画面側は並べるだけです（§2の3・§6の8）。
 *
 * 【色】dataviz の検証済みカテゴリカル配色のスロット1・2（#2a78d6 / #eb6834）。
 *   サイトのブランド色（#0f5f4e / #2c4a7c）の組は、明度帯・彩度・通常視ΔEで
 *   FAILしたためグラフには使いません。
 *
 * 【§7の7】**図の中は目盛りと凡例だけ。**境目の名前と金額は`kijunHanrei()`が図の外に出します。
 *   E-22の直し（2026-08-17・オーナー承認）で、図の中の3行を外へ移しました。
 *   **文字は12px以上**（E-22で9px→12px）。
 */

import * as E from './engine';
import * as S from './sakaime';

/** 5年で受け取る／6年で受け取る */
export const IRO: Record<5 | 6, string> = { 5: '#2a78d6', 6: '#eb6834' };

export type Row9 = { age: number; ideco: number; keigen: number; goukei: number };
export type Data9 = Partial<Record<5 | 6, Row9[]>>;
/** [金額, 名前, その方が実際に越えるか] */
export type Kijun = [number, string, boolean];

/**
 * 図のもとになる数字。
 * `byl` は「ラベル → [Plan, 評価結果]」の辞書（`build()` の戻りから作ります）。
 * ⑳を軸にするとラベルの末尾に「／公的年金を◯歳から」が付くので、
 * **65歳から（＝繰上げも繰下げもしない）もの**を選びます。
 */
export function data9(
  p: E.Jinbutsu,
  byl: Record<string, [E.Plan, unknown]>,
  ages: number[] = [60, 61, 62, 63, 64, 65, 66, 67],
): Data9 {
  const out: Data9 = {};
  for (const k of [5, 6] as const) {
    const key = `iDeCo等を60歳から年金${k}年`;
    const cand = Object.keys(byl).find(
      (x) => x === key || x.startsWith(`${key}／公的年金を65歳から`));
    if (!cand) continue;
    const [pl] = byl[cand];
    const nen = E.nenkinByYear(p, pl);
    out[k] = ages.map((a) => {
      const y = p.year(a);
      const sj = E.shotokuJoukyou(p, y, nen[y] ?? 0);
      return {
        age: a,
        ideco: nen[y] ?? 0,
        keigen: S.keigenHanteiShotoku(a, sj.nenkin_zatsu),
        goukei: sj.goukei,
      };
    });
  }
  return out;
}

// ---------------------------------------------------------------- 図の組み立て
const VIEW_W = 343, VIEW_H = 216;
const X0 = 44, X1 = 338, Y0 = 14, Y1 = 150;   // 目盛りの内側
const BW = 13, GAP = 2;
/** §7の7：図の中の文字は12px以上。**小さくしないこと** */
export const FONT = 12;

export type Chart9 = {
  viewBox: string;
  /** よこ線（目盛り） */
  grid: { y: number; v: number; label: string; koi: boolean }[];
  /** 棒 */
  bars: { x: number; y: number; w: number; h: number; iro: string }[];
  /** 年齢の目盛り */
  ageLabels: { x: number; y: number; text: string }[];
  /** 年齢の下の札（「◯か月」「満額」）。**受け取り始める年は満額入りません** */
  fuda: { x: number; y: number; text: string }[];
  /** 破線（境目）。**名前と金額は図の外**（`kijunHanrei()`） */
  hasen: { y: number; iro: string; futo: number }[];
  /** 65歳の2本だけ、値のラベル */
  ne65: { x: number; y: number; text: string; iro: string }[];
  /** たて・よこの軸名 */
  jiku: { x: number; y: number; text: string; anchor: 'start' | 'end' }[];
};

const bandY = (v: number, ymax: number) => Y1 - (v / ymax) * (Y1 - Y0);

/** 棒の角丸パス（Pythonの `_bar` と同じ） */
export function barPath(x: number, y: number, w: number, h: number, r = 3): string {
  if (h <= 0) return '';
  const rr = Math.min(r, h, w / 2);
  return `M${x.toFixed(1)},${(y + h).toFixed(1)} L${x.toFixed(1)},${(y + rr).toFixed(1)} `
    + `Q${x.toFixed(1)},${y.toFixed(1)} ${(x + rr).toFixed(1)},${y.toFixed(1)} `
    + `L${(x + w - rr).toFixed(1)},${y.toFixed(1)} Q${(x + w).toFixed(1)},${y.toFixed(1)} `
    + `${(x + w).toFixed(1)},${(y + rr).toFixed(1)} `
    + `L${(x + w).toFixed(1)},${(y + h).toFixed(1)} Z`;
}

export function chart9(d: Data9, kijun: Kijun[], ymax = 2_000_000, p?: E.Jinbutsu): Chart9 {
  const rows5 = d[5] ?? [];
  const ages = rows5.map((r) => r.age);
  const n = ages.length || 1;
  const gw = (X1 - X0) / n;
  const off = (gw - (BW * 2 + GAP)) / 2;
  const Y = (v: number) => bandY(v, ymax);

  const grid = [0, 1_000_000, 2_000_000].map((v) => ({
    y: Y(v), v, label: v === 0 ? '0' : `${Math.trunc(v / 10_000)}万`, koi: v === 0,
  }));

  const bars: Chart9['bars'] = [];
  const ageLabels: Chart9['ageLabels'] = [];
  const fuda: Chart9['fuda'] = [];
  ages.forEach((a, i) => {
    const gx = X0 + i * gw;
    ([5, 6] as const).forEach((k, j) => {
      const v = d[k]?.[i]?.keigen ?? 0;
      bars.push({ x: gx + off + j * (BW + GAP), y: Y(v), w: BW, h: Y1 - Y(v), iro: IRO[k] });
    });
    ageLabels.push({ x: gx + gw / 2, y: Y1 + 18, text: String(a) });
    // 65歳の棒が60〜64歳より低いのを見て「公的年金は66歳から始まるのか」と読まれた。
    // 原因は**受け取り始める年は公的年金が満額入らない**こと。**変わった年だけ**短く書く。
    if (p) {
      const tsuki = p.nenkinShiharaiTsukisu(p.year(a));
      const mae = p.nenkinShiharaiTsukisu(p.year(a - 1));
      const t = (tsuki > 0 && tsuki < 12) ? `${tsuki}か月`
        : (tsuki === 12 && mae < 12) ? '満額' : '';
      if (t) fuda.push({ x: gx + gw / 2, y: Y1 + 34, text: t });
    }
  });

  // 破線。**名前と金額は図の外**（§7の7・E-22）
  const hasen = kijun.map(([g, , koi]) => ({
    y: Y(g), iro: koi ? '#8a4b12' : '#c9b9a6', futo: koi ? 1.5 : 1,
  }));

  // 65歳の2本だけ、値のラベル（ここが分かれ目なので）
  const i65 = ages.indexOf(65);
  const ne65: Chart9['ne65'] = [];
  if (i65 >= 0) {
    const gx = X0 + i65 * gw;
    ([5, 6] as const).forEach((k, j) => {
      const v = d[k]?.[i65]?.keigen ?? 0;
      ne65.push({
        x: gx + off + j * (BW + GAP) + BW / 2, y: Y(v) - 5,
        text: `${Math.round(v / 10_000)}万円`, iro: IRO[k],
      });
    });
  }

  return {
    viewBox: `0 0 ${VIEW_W} ${VIEW_H}`,
    grid, bars, ageLabels, fuda, hasen, ne65,
    jiku: [
      { x: 0, y: Y1 + 56, text: 'たて＝保険料の判定に使う所得', anchor: 'start' },
      { x: X1, y: Y1 + 56, text: 'あなたの年齢', anchor: 'end' },
    ],
  };
}
