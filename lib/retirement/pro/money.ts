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

// ────────────────────────────────────────────────────────────────
// 入れた額の言い換え（★2026-09-21・戦術Cowork `kaihatsu_ate_20260921d.md` 1節）
//
// 【なぜここに置くか】…… ★森嶋さんのお決め（2026-09-21）で、金額の欄は**入れた額を
//   その場で言い換えて見せます**。★★**数の作り方（丸め・桁区切り）は計算エンジン側**に
//   置く決まりです（★移管指示書「実装側に式を持たせない」）。★画面（`Screen7.tsx`・
//   `Screen1.tsx`）は、この本が返した字を**そのまま並べるだけ**にします。
//
// 【出す字（戦術Coworkの表そのまま）】
//   | 欄の単位 | 入れた字 | 出す字 |
//   | 円   | 1200000 | 1,200,000円（120万円）    |
//   | 円   | 1234567 | 1,234,567円（約123万円）  |
//   | 円   | 5000    | 5,000円（1万円未満）      |
//   | 円   | 0       | 0円                      |
//   | 万円 | 2000    | 2,000万円（20,000,000円） |
//   | 万円 | 0       | 0万円（0円）              |
//   | どちらも 空 | （何も出さない）             |
// ────────────────────────────────────────────────────────────────

/**
 * ★全角の数字・カンマ・空白を整えて整数にします。★小数点はそのまま残す（下の判定で落とすため）。
 *
 * ★★【2026-09-21】`paidRules.ts` から**ここへ移しました**（★中身は1文字も変えていません）。
 *   ★理由 …… ★無料版の画面（`Screen1.tsx`）も言い換えの字を出しますが、
 *     ★★`paidRules.ts` は `engine.ts` を読みますので、**無料版に計算エンジンを丸ごと持ちこみます**。
 *   ★`paidRules.ts` は、この本から読んで**同じ名前で出し直します**（★呼ぶ側は直りません）。
 */
export function seisuNiSuru(s: string): { ok: true; n: number } | { ok: false; kara: true } | { ok: false; kara: false } {
  const t = s.replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0))
    .replace(/[,，、\s　]/g, '')
    .replace(/[－−―]/g, '-');
  if (t === '') return { ok: false, kara: true };
  if (!/^-?\d+$/.test(t)) return { ok: false, kara: false };
  const n = Number(t);
  if (!Number.isSafeInteger(n)) return { ok: false, kara: false };
  return { ok: true, n };
}

/** 言い換えの字を出す欄の単位。★`paidRules.ts` の `TANI.en`・`TANI.man` と同じ字です */
export type IikaeTani = '円' | '万円';

const ku = (n: number): string => n.toLocaleString('en-US');

/**
 * 入れた額の言い換え（欄のすぐ下に出す1行）。
 *
 * @param ji   欄に入っている字（★整えていない、そのままの字）
 * @param tani 欄の単位（`'円'` か `'万円'`）
 * @returns    出す字。★**空のとき・数として読めないときは `null`**（★何も出しません）
 *
 * ★丸めの向き …… ★「約」を付けるときの万は**切り捨て**です
 *   （例：1,234,567円 → 約123万円。★1,238,000円 → 約123万円）。
 *   ★★これは開発が置いた向きで、**戦術Coworkの字ではありません**。便でお諮りしています。
 * ★1万円未満（0を除く）は「（1万円未満）」。★「（0万円）」とは書きません（★戦術Coworkの決まり2）。
 * ★負の数は、金額の欄の範囲（`min: 0`）に入りませんので、`null` を返します。
 */
export function iikaeNoJi(ji: string, tani: IikaeTani): string | null {
  const s = seisuNiSuru(ji);
  if (!s.ok) return null;
  const n = s.n;
  if (n < 0) return null;
  if (tani === '万円') return `${ku(n)}万円（${ku(n * 10_000)}円）`;
  // ── 円の欄
  if (n === 0) return '0円';
  if (n < 10_000) return `${ku(n)}円（1万円未満）`;
  const man = Math.trunc(n / 10_000);
  return isMan(n) ? `${ku(n)}円（${ku(man)}万円）` : `${ku(n)}円（約${ku(man)}万円）`;
}
