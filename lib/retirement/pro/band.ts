/**
 * lib/retirement/pro/band.ts ── GA4へ送る「帯」（実装指示書 §8-2 の変更・2026-08-18）
 *
 * 【なぜ帯にするか】
 *  画面1に「**入力された内容は保存されません**」と書いてあります。`sessionStorage` すら
 *  使わないと決めておきながら（§6-14の2）、**入れた金額そのものをGoogleのサーバーへ送る**
 *  形になっていました。**画面の約束に、実装を合わせます。**
 *
 *  `diff_yen` は**丸めません。**あれは利用者の入力ではなく**こちらの計算結果**で、
 *  「差額がいくらの方が買うか」は価格の判断に直結します（§8-4）。
 *
 * 【なぜ1か所に置くか】
 *  無料版と有料版、画面2とWebhookで別々に書くと、**同じ方が別の帯になります。**
 *  `pro_result_view` と `pro_purchase` は、**必ずこの関数を呼んでください。**
 *
 * 【なぜ先頭に数字を付けるか】
 *  GA4のレポートは値を**文字の順**に並べます。付けないと
 *  `1001〜2000万円` が `501〜1000万円` より前に来て、表が読めません。
 *
 * ──────────────────────────────────────────────────────────
 * 【2026-08-19／20・判断ログ62 のとおりに直しました。こちらの見落としです】
 *
 *  62 の逐語
 *    「帯の変換は3つとも「円」で受ける。`diff_band` の境目とラベルは
 *      `hantei.ts` の `SHIKII` から作る（直書きしない）」
 *    「ラベルも `SHIKII` から作り、10,000で割り切れなければ例外を投げる」
 *
 *  直す前は
 *    ・`taishokuBandFromMan` / `idecoBandFromMan` が**万円**で受けていました
 *    ・`'2_10万円未満'` `'3_10万〜50万円'` は**直書き**でした
 *    ・10,000で割り切れないときの**例外がありません**でした
 *
 *  **画面に出ていた値そのものは、間違っていませんでした。**`ProApp.tsx` が
 *  正しく万円を渡していたためです。**壊れるのは `SHIKII` を変えた日**で、
 *  境目だけ動いてラベルが「10万円未満」のまま残ります。
 *
 *  時系列（すべて日本時間）
 *    8/18 22:14  依頼書 `kaihatsu_irai_obi_20260818.md`（**万円で書かれている**。
 *                例の関数名も `taishokuBand(manYen: number)`）
 *    8/18 23:43  判断ログ★62 が記録される（**3つとも円で受ける**）
 *    8/19 08:20  こちらが band.ts を作る（**万円のまま**）← 62 の8時間半後
 *  **「万円のままでよい」と決め直した便は、探しましたがありません。**
 *  依頼書の単位の食い違いを止めたのはこちらでしたが、**そのあと自分の実装に
 *  当てていませんでした。**
 * ──────────────────────────────────────────────────────────
 */

import { SHIKII } from './hantei';

/** 万円の刻み。**帯のラベルは「◯万円」で書きます** */
const MAN = 10_000;

/**
 * 円 → 「◯万円」のうちの**数の部分**。
 * **10,000で割り切れなければ例外を投げます**（判断ログ62）。
 *
 * 【なぜ例外か】割り切れない境目を「◯万円」と書くと、**画面の数と実際の境目がずれます。**
 * 黙って切り捨てると、ずれたまま何年も出続けます。**その場で止めます。**
 */
export function manSuji(yen: number): number {
  const v = Math.trunc(yen);
  if (v % MAN !== 0) {
    throw new Error(
      `帯のラベルは「◯万円」で書きます。${v.toLocaleString('en-US')}円は10,000で`
      + '割り切れないため、「◯万円」では書けません。'
      + '境目を10,000の倍数にするか、ラベルの書き方を決め直してください（判断ログ62）。',
    );
  }
  return v / MAN;
}

/** 円 → 「◯万円」。**3桁区切りは入れません**（依頼書の表が `1000万円` と書いているため） */
export const manLabel = (yen: number): string => `${manSuji(yen)}万円`;

/**
 * 「その額まで」の境目（円）からラベルの並びを作る。①③はこの形です。
 *   0円 ／ 1〜◯万円 ／ (◯+1)〜◯万円 … ／ ◯万円以上
 * **境目を変えると、ラベルも一緒に変わります。**
 */
export function madeLabels(sakaime: readonly number[]): string[] {
  const out = ['1_0円'];
  sakaime.forEach((s, i) => {
    const atama = i === 0 ? '1' : String(manSuji(sakaime[i - 1] + MAN));
    out.push(`${i + 2}_${atama}〜${manLabel(s)}`);
  });
  out.push(`${sakaime.length + 2}_${manLabel(sakaime[sakaime.length - 1] + MAN)}以上`);
  return out;
}

/** 帯を選ぶ（「その額まで」の形）。**引数は円** */
function madeErabu(yen: number, sakaime: readonly number[], labels: string[]): string {
  const v = Math.trunc(yen);
  if (v <= 0) return labels[0];
  for (let i = 0; i < sakaime.length; i++) if (v <= sakaime[i]) return labels[i + 1];
  return labels[labels.length - 1];
}

// ---------------------------------------------------------------- ①退職金
/** ①退職金の境目（円）。**依頼書の表：500万／1000万／2000万／3000万** */
export const TAISHOKU_SAKAIME = [5_000_000, 10_000_000, 20_000_000, 30_000_000] as const;
const TAISHOKU_LABELS = madeLabels(TAISHOKU_SAKAIME);

/** ①退職金の帯。**引数は円**（判断ログ62） */
export function taishokuBandFromYen(yen: number): string {
  return madeErabu(yen, TAISHOKU_SAKAIME, TAISHOKU_LABELS);
}

// ---------------------------------------------------------------- ③iDeCo等
/** ③iDeCo等の境目（円）。**依頼書の表：300万／600万／1000万** */
export const IDECO_SAKAIME = [3_000_000, 6_000_000, 10_000_000] as const;
const IDECO_LABELS = madeLabels(IDECO_SAKAIME);

/** ③iDeCo等の帯。**引数は円**（判断ログ62） */
export function idecoBandFromYen(yen: number): string {
  return madeErabu(yen, IDECO_SAKAIME, IDECO_LABELS);
}

// ---------------------------------------------------------------- 差額
/**
 * 差額の境目（円）。**先頭は `hantei.ts` の `SHIKII`。直書きしません**（判断ログ62）。
 *
 * ★ `SHIKII` は「金額が小さい」と判定する境目です。**別の値にすると、
 *   `branch` が「金額が小さい」の方と `diff_band` が食い違います。**
 */
export const diffSakaime = (shikii: number = SHIKII): readonly number[] =>
  [shikii, 500_000, 1_000_000];

/**
 * 差額のラベル。**`shikii` を変えると、ラベルもその値になります。**
 * `kensa/band_test.ts` が、別の値を入れて確かめています。
 */
export function diffLabels(shikii: number = SHIKII): string[] {
  const s = diffSakaime(shikii);
  const out = ['1_0円', `2_${manLabel(s[0])}未満`];
  for (let i = 1; i < s.length; i++) {
    out.push(`${i + 2}_${manSuji(s[i - 1])}万〜${manLabel(s[i])}`);
  }
  out.push(`${s.length + 2}_${manLabel(s[s.length - 1])}以上`);
  return out;
}

/** 差額の帯。**引数は円**（`diff_yen` と同じ単位） */
export function diffBandFromYen(yen: number, shikii: number = SHIKII): string {
  const v = Math.trunc(yen);
  const s = diffSakaime(shikii);
  const labels = diffLabels(shikii);
  if (v <= 0) return labels[0];
  for (let i = 0; i < s.length; i++) if (v < s[i]) return labels[i + 1];
  return labels[labels.length - 1];
}
