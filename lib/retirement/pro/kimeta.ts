/**
 * lib/retirement/pro/kimeta.ts ── ★★**決めた字と数を、1か所だけに置く本**
 *
 * ★2026-09-25（戦術Cowork `kaihatsu_ate_20260922m.md` 2節・森嶋さんのご承認）
 *   ★同じ決めが2か所以上に書かれていると、言い方や数を変える日に、一部だけが直る形が起こります。
 *   ★★ここに置いた字と数は、**ほかの本に書きません**（★`kensa/hitotsu_mon.mjs` が、2か所以上に現れたら鳴ります）。
 */

/**
 * ★支給源 iDeCo等 の名前（★利用者に見える字です・§用語の表記を統一する）。
 *   ★前は `free.ts`・`gamen8.ts`・`excel.ts`・`hantei.ts`・`kekka.ts`・`paidInput.ts`・`engine.ts` の7本・11か所に書いていました。
 */
export const IDECO_NAME = 'iDeCo等';

/**
 * ★被保険者数・給与所得者等の数（★計算に使う数です）。
 * ★★★**これは既定値ではありません。**★`paidInput.ts` に欄が**0か所**ですので、
 *   ★**こちらが「1人」と決めて渡しています**（★戦術Cowork `senjutsu_20260913e.md` 4-1・決め1231）。
 * ★★★**欄ができた日は、ここを使わず入力から渡してください**（★呼ばれる側に既定を置かないでください）。
 *   ★前は `gamen8.ts`（`S.check()` の3つめ・4つめ）と `excel.ts`（`setaiNoJi()` に渡す2つ）に別々に書いていました。
 */
export const HIHOKENSHA = 1;
export const KYUYO_SHOTOKUSHA = 1;
