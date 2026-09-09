/**
 * lib/retirement/pro/gamen12Bun.ts ── 画面12（確認事項の整理）の**字のもと**を作る
 *
 * ★戦術Cowork `senjutsu_20260909l.md` 決め1022・決め1023・決め1025 です。
 *
 * 【なぜこの本を作ったか】
 *   ★★画面12の4つは、**分岐**（案の形で字が変わる）と**式**（率の組み立て）を持ちます。
 *   ★★★§画面に出す数字と分岐は計算エンジン側に置く。実装側に式を持たせない ── ★ですので
 *      `Screens912.tsx` には置かず、`gamen8Bun.ts`（★画面8の文を作る本）と**同じ形**で1本置きました。
 *
 * 【この本がやらないこと】
 *   ★`Kekka` に入れていません（★口はまだ画面12を運んでいません）。★呼ぶ側が使います。
 *   ★★**基準HTMLの字を、こちらで書き換えていません。**★戦術Coworkが便に書いた字のとおりです。
 */

import * as Z from './zeisei';
import type * as E from './engine';

/**
 * ★★★`{uketori_katachi}` ── その方の案の「受け取りの形」（★決め1023）。
 *
 * ★★**「で」まで、この字の中に入れます**（★基準HTML 1141行 …… 「あなたの{nenkin_gen}を、{uketori_katachi}受け取れるかを確認する」）。
 *
 * | 案の形 | 字 |
 * |---|---|
 * | 一時金だけ（`nenkin_gen === null`） | **一時金で** |
 * | 年金だけ（`ichiji_wariai === 0`） | **{k}年の年金で** |
 * | 併給 | **{w}%を一時金で、残りを{k}年の年金で** |
 *
 * ★★★**なぜ項目ごと落とさないか**（★決め1023）…… ★どの案でも、その方は「自分の受け取り方が、
 *   その金融機関でできるか」を確かめる要りがあります。★★とくに**併給を取り扱わない金融機関があります。**
 *   ★落とすと、**いちばん確かめる要りのある方に、確かめる所を出さない**ことになります。
 */
export function uketoriKatachi(plan: E.Plan): string {
  if (plan.nenkin_gen === null) return '一時金で';
  if (plan.ichiji_wariai === 0) return `${plan.nenkin_kikan}年の年金で`;
  return `${plan.ichiji_wariai}%を一時金で、残りを${plan.nenkin_kikan}年の年金で`;
}

/**
 * ★★★`{gensen_ritsu}` ── 「退職所得の受給に関する申告書」を出さなかったときの率（★決め1025）。
 *
 * ★★★**字として固定しません。**★このツールが実際に使う率（`Z.uwanose()`）と**同じ数**を出します。
 *   ★固定すると、**計算と表示が食い違う日が来ます。**
 *
 * ★★**float を使いません。**★率は「**百分率の100倍の整数**」で持ちます（★20.42% ＝ **2042**）。
 *
 * ```
 * 2000（＝ GENSEN_MISHUTSU_RITSU × 100）＋ uwanose(2000, nenbun)
 *   → 2047年まで  2000 + 42 = 2042
 *   → 2048年以後  2000 + 20 = 2020
 * ```
 *
 * ★`uwanose()` …… `zeisei.ts` 28〜31行。★令和29年分（**2047年**）まで 2.1%／令和30年分（2048年）以後 1.0%。
 * ★★`nenbun` は **その方が退職金を受け取る年**の年分で見ます（★決め1025(い)）
 *   ── ★この文は「勤め先へ出してください」（★基準HTML 871行）＝**勤め先が退職金を払うときの源泉徴収**の話で、
 *      ★★**iDeCo等ではありません。**
 * ★`nenbun` は `engine.ts` 439行 `p.nenbun(year)`（＝`year − REIWA_OFFSET`）で作ってください。
 *   ★★**ここで既定値を作りません。**
 */
export function gensenRitsu(nenbun: number): number {
  if (!Number.isInteger(nenbun)) {
    throw new Error(`年分（nenbun）が整数ではありません（${nenbun}）。呼び出し側から渡してください。`);
  }
  const hyaku = Z.GENSEN_MISHUTSU_RITSU * 100;
  return hyaku + Z.uwanose(hyaku, nenbun);
}

/**
 * ★率の字（★決め1025(う)）…… **半角の `%`**／小数点以下 **2桁**（★「20.42%」「20.20%」と桁をそろえます）。
 * ★★`fdiv`（床除算）で上2桁を取り、下2桁は0で埋めます（★**float を使いません**）。
 */
export function ritsuJi(hyakubai: number): string {
  if (!Number.isInteger(hyakubai) || hyakubai < 0) {
    throw new Error(`率（百分率の100倍の整数）が0以上の整数ではありません（${hyakubai}）。`);
  }
  return `${Z.fdiv(hyakubai, 100)}.${String(hyakubai % 100).padStart(2, '0')}%`;
}

/**
 * ★★★`{nenkin_kaishi_age}` のもと ── その方が **iDeCo等 を受け取り始める年**（★決め1022）。
 *
 * ★★`engine.ts` **1577〜1596行**を開いて確かめました（★戦術Cowork `senjutsu_20260909l.md` 4節(B)）。
 *
 * | 案の形 | `iNen` の在り処 |
 * |---|---|
 * | 一時金だけ | **1577行** `uketori_nen: { …, [idecoGenName]: iNen }` |
 * | 年金だけ | **1585行** `nenkin_kaishi_nen: iNen` |
 * | 併給 | **1592〜1594行** …… 両方に同じ `iNen` |
 *
 * ★★★**3つの形とも `iNen` が入っていますので、`null` になりません。**★分岐は要りません。
 * ★★それでも見つからないときは**投げます**（★黙って0や今年を入れません ── ★§既定値を作らない）。
 */
export function nenkinKaishiNen(plan: E.Plan, idecoName: string): number {
  const n = plan.nenkin_kaishi_nen ?? plan.uketori_nen[idecoName];
  if (typeof n !== 'number' || !Number.isInteger(n)) {
    throw new Error(`${idecoName} を受け取り始める年が見つかりません（label: ${plan.label}）。`);
  }
  return n;
}
