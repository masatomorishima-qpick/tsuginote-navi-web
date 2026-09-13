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
 *
 * ──────────────────────────────────────────────────────────
 * ★★★【2026-09-13・回4 ── 8つ直しました】（★戦術Cowork `senjutsu_20260913f.md` 4-3）
 *
 *   1. `IRO` の鍵を **5・6 から `'a'・'b'`** にしました（★A案・B案は5年・6年とはかぎりません）
 *   2. `[5, 6]` の決め打ちを **`['a', 'b']`** にしました
 *   3. 案の名前の決め打ち（`iDeCo等を60歳から`）をやめ、★**案そのものを渡していただく**形にしました
 *   4. ⑳の **65歳固定**（`／公的年金を65歳から`）をやめました（★3と同じ直しです）
 *   5. `ages` の**既定値を消しました**（★§既定値を作らない）
 *   6. `ymax` の**既定値を消しました**（★同上）
 *   7. ★決め1048 の7つめ …… 破線の凡例の「◯万円」の**字まで、ここで作ります**
 *        （★`Chart9.tsx` の `Math.trunc(g / 10_000)` は、実装側に式を持たせていました）
 *   8. ★決め1048 の8つめ …… `keigenHanteiShotoku()` に**給与所得を渡します**
 *        （★渡さないと、給与所得が在る方で**図の棒が低く出ます**）
 * ──────────────────────────────────────────────────────────
 */

import * as E from './engine';
import * as S from './sakaime';

/** A案（跨がない いちばん長い年数）／B案（その1年上）。★決め1046 */
export type AB = 'a' | 'b';

/** ★1・A案／B案（★前は `5 | 6` でした） */
export const IRO: Record<AB, string> = { a: '#2a78d6', b: '#eb6834' };

export type Row9 = { age: number; ideco: number; keigen: number; goukei: number };
export type Data9 = Partial<Record<AB, Row9[]>>;
/**
 * 破線の境目。
 *   `[金額, 名前, その方が実際に越えるか, ★金額の字]`
 * ★★4つめは**決め1048の7つめ**で足しました（★「430,000円」の形。★画面側で割り算をしません）。
 */
export type Kijun = [number, string, boolean, string];

/** ★7・金額の字（★`en()` と同じ形。★万円にしません・決め1043(1)） */
export const kijunJi = (gaku: number): string => `${gaku.toLocaleString('en-US')}円`;

/**
 * 図のもとになる数字。
 *
 * ★★★**案の名前で探しません**（★3・4の直し）。★A案・B案の `Plan` を、そのまま渡してください
 *   （★`gamen9shosaiBun.ts` が決め1046の形で探したものです）。
 *
 * @param p    その方（★⑳の軸は、呼ぶ側で差し替え済みのもの）
 * @param an   A案・B案の `Plan`
 * @param ages 図に出す年齢（★5・**既定値はありません**）
 */
export function data9(
  p: E.Jinbutsu,
  an: Record<AB, E.Plan>,
  ages: number[],
): Data9 {
  const out: Data9 = {};
  for (const k of ['a', 'b'] as const) {
    const nen = E.nenkinByYear(p, an[k]);
    out[k] = ages.map((a) => {
      const y = p.year(a);
      const sj = E.shotokuJoukyou(p, y, nen[y] ?? 0);
      return {
        age: a,
        ideco: nen[y] ?? 0,
        /** ★8・決め1048の8つめ …… **給与所得を渡します**（★`check()` 214行と同じ形） */
        keigen: S.keigenHanteiShotoku(a, sj.nenkin_zatsu, sj.kyuyo ?? 0),
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
  /** ⑳の年の2本だけ、値のラベル */
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

/**
 * @param ymax たて軸の上限（★6・**既定値はありません**）
 * @param kijunAge ⑳（★値のラベルを出す年齢。★前は 65 の決め打ちでした）
 */
export function chart9(d: Data9, kijun: Kijun[], ymax: number,
                       kijunAge: number, p: E.Jinbutsu): Chart9 {
  const rowsA = d.a ?? [];
  const ages = rowsA.map((r) => r.age);
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
    (['a', 'b'] as const).forEach((k, j) => {
      const v = d[k]?.[i]?.keigen ?? 0;
      bars.push({ x: gx + off + j * (BW + GAP), y: Y(v), w: BW, h: Y1 - Y(v), iro: IRO[k] });
    });
    ageLabels.push({ x: gx + gw / 2, y: Y1 + 18, text: String(a) });
    // ⑳の棒がその前の年より低いのを見て「公的年金は翌年から始まるのか」と読まれた。
    // 原因は**受け取り始める年は公的年金が満額入らない**こと。**変わった年だけ**短く書く。
    const tsuki = p.nenkinShiharaiTsukisu(p.year(a));
    const mae = p.nenkinShiharaiTsukisu(p.year(a - 1));
    const t = (tsuki > 0 && tsuki < 12) ? `${tsuki}か月`
      : (tsuki === 12 && mae < 12) ? '満額' : '';
    if (t) fuda.push({ x: gx + gw / 2, y: Y1 + 34, text: t });
  });

  // 破線。**名前と金額は図の外**（§7の7・E-22）
  const hasen = kijun.map(([g, , koi]) => ({
    y: Y(g), iro: koi ? '#8a4b12' : '#c9b9a6', futo: koi ? 1.5 : 1,
  }));

  // ⑳の年の2本だけ、値のラベル（ここが分かれ目なので）
  const i65 = ages.indexOf(kijunAge);
  const ne65: Chart9['ne65'] = [];
  if (i65 >= 0) {
    const gx = X0 + i65 * gw;
    (['a', 'b'] as const).forEach((k, j) => {
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
