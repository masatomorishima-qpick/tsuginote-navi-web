/**
 * lib/loan/prepay.ts — 繰り上げ返済の計算（2026-07-31 新設）
 *
 * 方針（refi.ts と同じ）：
 *   **新しい計算式は書かない。** lib/shisan/calc.ts の loanPayment / totalInterest /
 *   prepayCompression を組み替えているだけである。記事6・7の表・/shisan の診断・
 *   このツールの3者で数字が一致する状態を保つのが目的。
 *
 * calc.ts に追記せず lib/loan/ に置いた理由（2026-07-31 masato 承認）：
 *   calc.ts は /shisan の5ファイルも依存する「サイト全体の数値の源」である。
 *   繰り上げ返済モードは /loan 専用の機能なので、ここに閉じ込めておけば
 *   /shisan への回帰リスクが構造的にゼロになる。
 *
 * 短縮月数 n' の式の重複について（重要・明示しておく）：
 *   利息の軽減は prepayCompression() をそのまま呼んでいる（独自計算していない）。
 *   ただし prepayCompression は内部で n' を求めながら返り値に持たないため、
 *   n' だけはこのファイルで同じ式を書き直している。
 *   **式が同一であることは、「同じ n' から独自に計算した利息軽減」と
 *   「prepayCompression の返り値」が一致することで担保する。**
 *   （検証済み：2,000万/1.0%/20年/100万・3,000万/1.0%/30年/100万・
 *     3,000万/1.5%/30年/100万・3,000万/1.0%/30年/300万・2,006万/1.0%/22年/100万 の
 *     5ケースで差 0.000000 円。この一致確認は v2 の完了条件に含まれる）
 */

import { loanPayment, totalInterest, prepayCompression } from '@/lib/shisan/calc';

export interface PrepayShorten {
  /** 減る利息（円） */
  interestSaved: number;
  /** 短縮される期間（月・小数のまま返す。丸めは表示側の責務） */
  monthsShortened: number;
}

export interface PrepayReduce {
  /** 減る利息（円） */
  interestSaved: number;
  /** 毎月の返済額の軽減（円） */
  monthlyReduction: number;
}

/**
 * 期間短縮型：毎月の返済額を変えずに残高だけ減らし、返済回数を縮める。
 *
 * n' = −ln(1 − (P−A)·r / M) / ln(1+r)
 *
 * 金利0%のとき：利息はもともと発生しないので軽減は0円。
 *   返済回数は残高を毎月の返済額で割った数なので、短縮月数は A ÷ M になる。
 *   （calc.ts の prepayCompression も r=0 では 0 を返す実装で、整合している）
 *
 * @returns 入力が不正・全額返済相当のときは null（呼び出し側で案内を出す）
 */
export function prepayShorten(
  balanceYen: number,
  currentRate: number,
  years: number,
  prepayYen: number,
): PrepayShorten | null {
  const P = balanceYen;
  const A = prepayYen;
  const n = years * 12;
  if (P <= 0 || years <= 0 || A <= 0) return null;
  // 全額返済（A ≥ P）は計算せず、呼び出し側で団信・完済手数料の案内を出す。
  if (A >= P) return null;

  const r = currentRate / 100 / 12;
  const M = loanPayment(P, currentRate, years);
  if (!(M > 0)) return null;

  if (r === 0) {
    return { interestSaved: 0, monthsShortened: A / M };
  }

  // 防御的ガード：入力が整合している限り 1 − (P−A)·r/M > 0 は常に成立する
  // （(P−A)·r/M = ((P−A)/P)·(1−(1+r)^−n) < 1 のため）。到達しない想定だが、
  // 将来 M を外から渡す形に変えたときに NaN を出さないために残す。
  const inner = 1 - ((P - A) * r) / M;
  if (!(inner > 0)) return null;

  const nAfter = -Math.log(inner) / Math.log(1 + r);
  if (!isFinite(nAfter) || nAfter < 0) return null;

  // 利息の軽減は既存エンジンをそのまま使う（このファイルで計算し直さない）。
  const interestSaved = prepayCompression(P, currentRate, years, A);

  return { interestSaved, monthsShortened: n - nAfter };
}

/**
 * 返済額軽減型：返済期間を変えずに、毎月の返済額を下げる。
 *
 * M' = (P−A)·r / (1 − (1+r)^−n)   ＝ loanPayment(P−A, rate, years)
 * 利息軽減 = I0 − (M'·n − (P−A))  ＝ totalInterest(P) − totalInterest(P−A)
 *
 * 金利0%のとき：利息の軽減は0円、月々の軽減は A ÷ n。
 */
export function prepayReduce(
  balanceYen: number,
  currentRate: number,
  years: number,
  prepayYen: number,
): PrepayReduce | null {
  const P = balanceYen;
  const A = prepayYen;
  const n = years * 12;
  if (P <= 0 || years <= 0 || A <= 0) return null;
  if (A >= P) return null;

  if (currentRate === 0) {
    return { interestSaved: 0, monthlyReduction: A / n };
  }

  const M = loanPayment(P, currentRate, years);
  const MAfter = loanPayment(P - A, currentRate, years);
  const interestSaved = totalInterest(P, currentRate, years) - totalInterest(P - A, currentRate, years);
  if (!isFinite(M) || !isFinite(MAfter)) return null;

  return { interestSaved, monthlyReduction: M - MAfter };
}

/**
 * 未払利息が発生し始める金利の目安（%）。
 *
 * 毎月の返済額 × 12 ÷ 残高 × 100
 *
 * 記事5・記事6と同じ式。返済額が同じまま残高だけ減ると、このラインは上がる。
 * （返済額軽減型では返済額と残高が同じ割合で減るため、ラインは動かない）
 */
export function unpaidInterestLine(monthlyPayment: number, balanceYen: number): number | null {
  if (!(balanceYen > 0) || !(monthlyPayment > 0)) return null;
  return ((monthlyPayment * 12) / balanceYen) * 100;
}

/**
 * 繰り上げ返済の利息軽減を「34.2万円」の形にする（表示専用・計算は不変）。
 *
 * 既存の manOku() は万単位に丸めるため、記事6の表が「15.8万円」としている値が
 * 「約16万円」になり、記事とツールで数字が食い違って見える。繰り上げの効果は
 * 万円未満の桁に意味があるので、ここだけ1桁まで出す（完了条件1の許容誤差にも合わせる）。
 * 1億以上は桁が多すぎて読みにくいので、その場合だけ万単位に丸める。
 */
export function manDetail(yenValue: number): string {
  const man = yenValue / 10000;
  if (Math.abs(man) >= 10000) return `${Math.round(man).toLocaleString('ja-JP')}万`;
  return `${(Math.round(man * 10) / 10).toLocaleString('ja-JP', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}万`;
}

/** 月数を「◯年◯か月」に整形する（小数は四捨五入して月単位にする）。 */
export function formatMonths(months: number): string {
  const total = Math.round(months);
  const y = Math.floor(total / 12);
  const m = total % 12;
  if (y > 0 && m > 0) return `${y}年${m}か月`;
  if (y > 0) return `${y}年`;
  return `${m}か月`;
}
