/**
 * lib/retirement/pro/chart10.ts ── 画面10の図2つ（`v5/gamen10_chart.py` の移植）
 *
 *   図1（差）　　`sa(...)`     … `moto` を0とおいて `aite` が何円多いかを年齢ごとに
 *   図2（累計）　`ruikei(...)` … 手元に入るお金の累計＋**41,216通り全部の幅（帯）**
 *
 * 【§7の7・E-22（2026-08-17・オーナー承認）】
 *   **判断に使う金額は、どちらの図でも図の外に出しました。**図には点と線だけを残します。
 *   文字は**12px以上**。図2の縦の目盛りは**5本まで**に間引いています
 *   （4本までにすると、きざみが4,000万になって上限が「1億2,000万」になり、
 *    縦軸のラベルが左に10pxはみ出しました。**画面に出してみないと分からない類のものです**）。
 */

import * as E from './engine';

/** dataviz の検証済み配色。**色だけで見分けさせない**ので、破線も併用します */
export const IRO = ['#2a78d6', '#eb6834', '#5b3fa0'];

export type Nagare = { age: number; nen: number; ruikei: number };
export type Data10 = {
  ages: number[];
  /** 年齢 → [全通りの中の最小, 最大] */
  band: Record<number, [number, number]>;
  /** [ラベル, {年齢:累計}, {年齢:その年の額}] */
  sen: [string, Record<number, number>, Record<number, number>][];
  zenbu: number;
};

/**
 * 年 → その年に手元に入る公的年金の額（その年に納める税を引いたもの）。
 *
 * ★ **キャッシュの鍵を `id(p)` にしてはいけません。**Python版でそれをやって、
 *   回収後に使い回された `id` で**別人の公的年金を取り違え、3,219件の誤り**になりました。
 *   **鍵は呼び出し側から渡す辞書に限り、人物をまたいで残しません。**
 */
export function kotekiCash(
  p: E.Jinbutsu, kaishiAge: number, years: number[],
  cache: Map<string, Record<number, number>>,
): Record<number, number> {
  const key = `${kaishiAge}|${years[0]}|${years[years.length - 1]}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const q = kaishiAge === p.koteki_kaishi_age ? p : p.withKotekiKaishiAge(kaishiAge);
  const nashi = Object.assign(Object.create(E.Jinbutsu.prototype) as E.Jinbutsu, q, {
    koteki_nenkin: 0, kosei_nenkin: 0, kosei_20nen: false, haigusha_seinen: null, ko_nin: 0,
  });
  const out: Record<number, number> = {};
  for (const y of years) {
    const gaku = q.kotekiByYear(y);
    const w = E.nenkanZeiUchiwake(q, y, 0, 0);
    const wo = E.nenkanZeiUchiwake(nashi, y, 0, 0);
    // 所得税と住民税の退職所得分はその年、住民税の総合課税分は翌年（B-14）
    const ima = (w.shotokuzei - wo.shotokuzei) + (w.jumin_taishoku - wo.jumin_taishoku);
    const yoku = w.jumin_sougou - wo.jumin_sougou;
    out[y] = (out[y] ?? 0) + gaku - ima;
    out[y + 1] = (out[y + 1] ?? 0) - yoku;
  }
  cache.set(key, out);
  return out;
}

/** 1案ぶんの流れ。手数料は、いちばん最後に受け取る年にまとめて引きます */
export function nagare(
  p: E.Jinbutsu, pl: E.Plan, r: { cash?: Record<number, number>; saishu_nen?: number | null; tesuryo?: number },
  ages: number[], cache: Map<string, Record<number, number>>,
): Nagare[] {
  const years = ages.map((a) => p.year(a));
  const kt = kotekiCash(p, pl.nenkin_kaishi_age ?? p.koteki_kaishi_age, years, cache);
  const cash = r.cash ?? {};
  const owari = r.saishu_nen ?? null;
  let ru = 0;
  return ages.map((a, i) => {
    let v = (cash[a] ?? 0) + (kt[years[i]] ?? 0);
    if (owari !== null && years[i] === owari) v -= r.tesuryo ?? 0;
    ru += v;
    return { age: a, nen: v, ruikei: ru };
  });
}

/** 図のもと。**帯は必ず全通りから作ります** */
export function data10(
  p: E.Jinbutsu, R: [E.Plan, { cash?: Record<number, number>; saishu_nen?: number | null; tesuryo?: number }][],
  erabu: string[], ages: number[] = Array.from({ length: 31 }, (_, i) => 60 + i),
): Data10 {
  if (erabu.length > 3) throw new Error('一度に重ねられるのは3本までです');
  const byl = new Map(R.map(([pl, r]) => [pl.label, [pl, r] as const]));
  // 公的年金は⑳だけで決まるので、**この呼び出しの中だけ**で使い回す
  const cache = new Map<string, Record<number, number>>();
  const lo: Record<number, number> = {}, hi: Record<number, number> = {};
  for (const [pl, r] of R) {
    for (const x of nagare(p, pl, r, ages, cache)) {
      if (lo[x.age] === undefined || x.ruikei < lo[x.age]) lo[x.age] = x.ruikei;
      if (hi[x.age] === undefined || x.ruikei > hi[x.age]) hi[x.age] = x.ruikei;
    }
  }
  const band: Record<number, [number, number]> = {};
  for (const a of ages) band[a] = [lo[a] ?? 0, hi[a] ?? 0];

  const sen: Data10['sen'] = erabu.map((lab) => {
    const got = byl.get(lab);
    if (!got) throw new Error(`一覧に無いラベルです: ${lab}`);
    const [pl, r] = got;
    const ru: Record<number, number> = {}, ne: Record<number, number> = {};
    for (const x of nagare(p, pl, r, ages, cache)) { ru[x.age] = x.ruikei; ne[x.age] = x.nen; }
    return [lab, ru, ne];
  });
  return { ages, band, sen, zenbu: R.length };
}

// ---------------------------------------------------------------- 図
export const FONT = 12;

export type Zu = {
  viewBox: string;
  /** 目盛りの左端・右端（ラベルの位置も含めて、**図の側で決めます**） */
  x0: number; x1: number; labelX: number;
  grid: { y: number; label: string; koi: boolean; futo: number }[];
  ageTicks: { x: number; y: number; text: string; anchor: 'middle' | 'end' }[];
  jiku: { x: number; y: number; text: string; anchor: 'start' | 'end' }[];
};
export type ZuRuikei = Zu & {
  obi: string;                                        // 帯（polygon の points）
  sen: { points: string; iro: string; hasen: boolean }[];
};
export type ZuSa = Zu & {
  points: string; iro: string;
  ten: { cx: number; cy: number }[];
  sa: Record<number, number>;
};

/** 目盛りの見出し。1億を超えたら「万」を積み上げず「億」にする */
function me(v: number): string {
  if (v === 0) return '0';
  const oku = Math.trunc(v / 100_000_000);
  const man = Math.trunc((v % 100_000_000) / 10_000);
  if (oku && man) return `${oku}億${man.toLocaleString('en-US')}万`;
  return oku ? `${oku}億` : `${man.toLocaleString('en-US')}万`;
}

/** 図2（累計＋全通りの幅の帯） */
export function ruikei(d: Data10, haba = 343, takasa = 228,
                       idx?: number[], hasenIdx: number[] = []): ZuRuikei {
  const { ages, band } = d;
  const sen = idx ? idx.map((i) => d.sen[i]) : d.sen;
  const X0 = 52, X1 = haba - 4, Y0 = 14, Y1 = takasa - 56;
  const ymax = Math.max(...Object.values(band).map(([, h]) => h)) || 1;
  // §7の7：**5本まで**に間引く（4本だと上限が「1億2,000万」になり、左に10pxはみ出す）
  let kizami = 10_000_000;
  while (ymax / kizami > 5) kizami *= 2;
  const joge = (Math.trunc(ymax / kizami) + 1) * kizami;
  const X = (a: number) => X0 + (X1 - X0) * (a - ages[0]) / Math.max(1, ages[ages.length - 1] - ages[0]);
  const Y = (v: number) => Y1 - (Y1 - Y0) * v / joge;

  const grid: Zu['grid'] = [];
  for (let v = 0; v <= joge; v += kizami) grid.push({ y: Y(v), label: me(v), koi: v === 0, futo: 1 });

  const ue = ages.map((a) => `${X(a).toFixed(1)},${Y(band[a][1]).toFixed(1)}`).join(' ');
  const shita = [...ages].reverse().map((a) => `${X(a).toFixed(1)},${Y(band[a][0]).toFixed(1)}`).join(' ');

  return {
    viewBox: `0 0 ${haba} ${takasa}`,
    x0: X0, x1: X1, labelX: X0 - 5,
    grid,
    obi: `${ue} ${shita}`,
    sen: sen.map(([, ru], i) => {
      const j = idx ? idx[i] : i;
      return {
        points: ages.map((a) => `${X(a).toFixed(1)},${Y(ru[a]).toFixed(1)}`).join(' '),
        iro: IRO[j % 3], hasen: hasenIdx.includes(j),
      };
    }),
    ageTicks: ages.filter((a) => a % 5 === 0).map((a) => ({
      x: X(a), y: Y1 + 18, text: String(a),
      anchor: a === ages[ages.length - 1] ? 'end' as const : 'middle' as const,
    })),
    jiku: [
      { x: 4, y: takasa - 14, text: '手元に入るお金の累計', anchor: 'start' },
      { x: X1, y: takasa - 14, text: 'あなたの年齢（歳）', anchor: 'end' },
    ],
  };
}

/**
 * 図1（差）。`moto` を0とおいて、`aite` が何円多いか。
 *
 * 【なぜ要るか・2026-08-14】累計の図では、無料版でお伝えしている274,290円が**1px未満**で
 *   見えませんでした（縦軸9,000万円に対し1pxが約57万円）。**公的年金の受け取り方が同じ2案**に
 *   かぎって差を描くと、縦軸が約400万円になり、読める大きさになります。
 *   **公的年金の開始年齢が違う案は混ぜないでください**（差が1,000万円単位で動きます）。
 */
export function saZu(d: Data10, moto: number, aite: number, haba = 343, takasa = 208): ZuSa {
  const { ages } = d;
  const A = d.sen[moto][1], B = d.sen[aite][1];
  const sa: Record<number, number> = {};
  for (const a of ages) sa[a] = B[a] - A[a];
  const X0 = 58, X1 = haba - 4, Y0 = 16, Y1 = takasa - 54;
  const vals = ages.map((a) => sa[a]);
  const hi = Math.max(...vals), lo = Math.min(...vals);
  const kizami = 1_000_000;
  const ue = (Math.trunc(hi / kizami) + 1) * kizami;
  const shita = Math.min(Math.trunc(lo / kizami) * kizami, -kizami);
  const X = (a: number) => X0 + (X1 - X0) * (a - ages[0]) / Math.max(1, ages[ages.length - 1] - ages[0]);
  const Y = (v: number) => Y1 - (Y1 - Y0) * (v - shita) / (ue - shita);

  const grid: Zu['grid'] = [];
  for (let v = shita; v <= ue; v += kizami) {
    const fu = v > 0 ? '+' : '';
    grid.push({
      y: Y(v), label: v === 0 ? '0' : `${fu}${Math.trunc(v / 10_000).toLocaleString('en-US')}万`,
      koi: v === 0, futo: v === 0 ? 1.4 : 1,
    });
  }
  // 値を書く点：はじめの年と、差が動かなくなってから（**金額は図の外**・§7の7）
  const kotei = ages.find((a) => ages.filter((b) => b >= a).every((b) => sa[b] === sa[a])) ?? ages[0];
  return {
    viewBox: `0 0 ${haba} ${takasa}`,
    x0: X0, x1: X1, labelX: X0 - 5,
    grid,
    points: ages.map((a) => `${X(a).toFixed(1)},${Y(sa[a]).toFixed(1)}`).join(' '),
    iro: IRO[aite % 3],
    ten: [ages[0], kotei].map((a) => ({ cx: X(a), cy: Y(sa[a]) })),
    ageTicks: ages.filter((a) => a % 5 === 0).map((a) => ({
      x: X(a), y: Y1 + 18, text: String(a),
      anchor: a === ages[ages.length - 1] ? 'end' as const : 'middle' as const,
    })),
    jiku: [
      { x: 4, y: takasa - 12, text: 'たて＝手元に入った累計の差', anchor: 'start' },
      { x: X1, y: takasa - 12, text: 'あなたの年齢（歳）', anchor: 'end' },
    ],
    sa,
  };
}
