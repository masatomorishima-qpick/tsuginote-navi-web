/**
 * components/retirement/pro/gamen13Bun.ts
 *
 * 画面13の**その方によって変わる行**の文を組み立てます（施行令70条2項）。
 *
 * 【ここは「見せ方」です。式は持ちません】
 *   戦術Coworkの決め（2026-08-20・判断ログ82）
 *     「**エンジンは数を返し、見せ方は画面が作る**」
 *   ですので、ここがするのは**基準HTMLの型に、エンジンが出した数を入れるだけ**です。
 *   **足し算も引き算も、条文の判定もしません。**
 *   `HITOGOTO_KATA` は `kensa/gamen13_chushutsu.mjs` が基準HTMLから機械で作った型で、
 *   **文はそのまま、変わる8種類（9か所）だけが `{名前}` になっています。**
 *
 * 【この主張が間違っていたら何が起きるか】
 *   入れ忘れた `{名前}` がそのまま画面に出るか、
 *   もっと悪いことに、**見本の方（退職金2,000万円）の金額が別の方の画面に出ます。**
 *   ですので、**入れ残しが1つでもあれば例外で止めます。**
 *
 * ──────────────────────────────────────────────────────────
 * 【8種類とも、エンジンから取れます・2026-08-20】
 *
 *   `maeGaku` … `KeikaRow.shunyu_mae`（前に受け取った額の合計・窓の中・A-20の形）
 *   `maeKojo` … `KeikaRow.kojo_mae`（その期間を合算した退職所得控除額）
 *
 *   **この2つは、はじめ外に出ていませんでした。**戦術Coworkが `engine.py` に出口を作り、
 *   こちらが `engine.ts` に移しました（判断ログ82・5つ）。
 *
 *   【こちらの誤り・2026-08-20】前の便で、この2つを
 *   「`KeikaRow.shunyu` と `KeikaRow.kojo` から取れます」と書きました。**取り違えです。**
 *   その2つは**その年に受け取るもの**の額と控除（見本では 5,000,000／8,000,000）で、
 *   **前に受け取ったもの**（20,000,000／20,600,000）ではありません。
 *   **7つと書きましたが、実際は8種類（9か所）でした。**
 *
 *   **前の支給源が窓の中に無い年は、`shunyu_mae` も `kojo_mae` も `null` です。**
 *   その年は「その方によって変わる行」を出す場面ではありません（縮める話が起きません）。
 */

import { HITOGOTO_KATA, HITOGOTO_MIDASHI } from './gamen13';

/** 型に入れる8種類の値。**すべて文字列**（見せ方はここで決めます） */
export type Hitogoto13 = {
  /** 前に受け取った額の合計。**`KeikaRow.shunyu_mae`** を「20,000,000円」の形に */
  maeGaku: string;
  /** 前の期間の退職所得控除（本則）。**`KeikaRow.kojo_mae`** を「20,600,000円」の形に */
  maeKojo: string;
  /** `KeikaRow.minashi_nensu` を「37年」の形に */
  minashiNensu: string;
  /** `KeikaRow.minashi_kikan` を `ymLabel()` で「1988年4月〜2025年3月」の形に */
  minashiKikan: string;
  /** これから受け取るものの期間。**入力から**「2006年4月〜2026年3月」 */
  idecoKikan: string;
  /** `KeikaRow.kasanari_tsuki` を「228か月」の形に */
  kasanariTsuki: string;
  /** `KeikaRow.kasanari_nen` を「19年」の形に。**型の中に2か所出ます** */
  kasanariNen: string;
  /** `KeikaRow.genkaku` を「7,600,000円」の形に */
  genkaku: string;
};

/** 型に出てくる `{名前}` の一覧。**型のほうから拾います**（書き写しません） */
export const HITOGOTO_NA: readonly string[] =
  [...new Set([...HITOGOTO_KATA.matchAll(/\{([a-zA-Z]+)\}/g)].map((m) => m[1]))];

/**
 * 型に値を入れて、その方の文を作る（8種類・9か所）。
 * **入れ残しが1つでもあれば例外で止めます。**黙って `{名前}` を画面に出しません。
 */
export function hitogotoBun(v: Hitogoto13): Record<string, string> {
  let bun = HITOGOTO_KATA;
  for (const na of HITOGOTO_NA) {
    const atai = (v as unknown as Record<string, string>)[na];
    if (atai === undefined || atai === '') {
      throw new Error(
        `画面13の「${HITOGOTO_MIDASHI}」の文に、{${na}} が入っていません。`
        + 'エンジンが出した値を渡してください。',
      );
    }
    bun = bun.split(`{${na}}`).join(atai);
  }
  const nokori = bun.match(/\{[a-zA-Z]+\}/g);
  if (nokori) {
    throw new Error(
      `画面13の「${HITOGOTO_MIDASHI}」の文に、入れ残しがあります： ${nokori.join(' ')}`,
    );
  }
  return { [HITOGOTO_MIDASHI]: bun };
}
