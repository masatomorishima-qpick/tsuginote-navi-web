/**
 * lib/retirement/pro/money.ts — 金額の書き方（実装指示書 v4 §7-8）
 *
 * 基準HTMLを実測して確定した規則です。**実装側だけで決めないこと。**
 *
 *  1. **表とカードの中は、必ず円。**桁をそろえて比べるところです
 *  2. **本文で万円を使ってよいのは、万で割り切れる額のときだけ。**割り切れないときは円。**丸めません**
 *  3. **同じ文の中に、万円と円を混ぜない。**1つでも万で割り切れない額があれば、
 *     **その文の中の額はすべて円**にします
 *  4. **計算式（A ＝ B × C ÷ D）・法令が金額で定めている基準額・前提の列挙は、割り切れても円のまま**
 *
 * 規則3は「1つずつ変換する」形では守れません（1つが円になっても、隣が万円のまま残る）。
 * そこで **1文ぶんの額をまとめて渡す `bunAmounts()`** を使います。
 */

/** 規則1・4：必ず円 */
export const yen = (n: number): string => `${Math.trunc(n).toLocaleString('en-US')}円`;

/** 万で割り切れるか */
export const isMan = (n: number): boolean => Math.trunc(n) % 10_000 === 0;

/**
 * 規則2＋3：**1つの文に出てくる額をまとめて**渡し、まとめて書き方を決める。
 *
 *   const [kojo, uketori, hami] = bunAmounts(r.kojo, r.uketori, r.hamidashi);
 *   → すべて万で割り切れる → 「2,060万円」「2,500万円」「440万円」
 *   → 1つでも割り切れない  → 全部「20,600,000円」…（円）
 */
export function bunAmounts(...ns: number[]): string[] {
  const all = ns.every(isMan);
  return ns.map((n) =>
    all ? `${(Math.trunc(n) / 10_000).toLocaleString('en-US')}万円` : yen(n),
  );
}

/** 符号つき（緑カードの「＋274,290円」）。規則1のところで使う */
export const signedYen = (n: number): string =>
  `${n < 0 ? '−' : '＋'}${Math.abs(Math.trunc(n)).toLocaleString('en-US')}円`;
