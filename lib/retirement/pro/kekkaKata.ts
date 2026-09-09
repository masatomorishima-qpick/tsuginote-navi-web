/**
 * lib/retirement/pro/kekkaKata.ts — 行に置く `kekka` の**形**（型と、形の確かめ）
 *
 * ★`server-only` を付けません。親（ブラウザ）と口（サーバー）の両方が読みます。
 * ★中身を作るのは `kekka.ts`（server-only）。ここは形だけです。
 */

import type { Gamen8 } from './gamen8';
import type { Bun8 } from './gamen8Bun';
import type { Hitogoto13 } from '@/components/retirement/pro/gamen13Bun';
import type { IchiranMatome, NarabiKagi } from './ichiran';

/**
 * ★★★一覧の**8通り**（★並び順4つ × 絞り込み①の入／切・戦術Cowork 決め979・989）。
 *
 * ★鍵は `tedori`（手取りが多い順）／`zei`（増える税金が少ない順）／
 *   `hayai`（早く受け取り終える順）／`hajime`（最初の年に多く受け取る順）。
 * ★`nashi` ＝ 絞り込み①を切ったとき ／ `ari` ＝ 入れたとき。
 * ★★**`ari` が `null`** …… その方は、絞り込み①の該当が**0通り**（★実測1,000人で 0人）。
 * ★★★**口（サーバー）が8つとも作ります。**★画面側で `Math.max`／`Math.min` を取らせません。
 */
export type IchiranKekka = Record<NarabiKagi, { nashi: IchiranMatome; ari: IchiranMatome | null }>;

/** 行の `kekka` の形（v2）。★9〜12 の便で `obi` などを足します */
export type Kekka = {
  v: 2;
  /** 口が作った時刻（ISO） */
  tsukutta: string;
  genzaiNen: number;
  /** 退職金を受け取る年（⑥＋⑤） */
  taishokuNen: number;
  toorisu: number;
  /** Screen8 の `pattern`（＝`gamen8().kado_su`） */
  pattern: 1 | 2 | 3;
  gamen8: Gamen8;
  bun8: Bun8;
  hitogoto13: Hitogoto13;
  /**
   * ★★★画面9（一覧）の下の1文が使う数（★戦術Cowork 決め986）。
   * ★`{ichiran_kensu}` と `{ichiran_haba}` は、**いま選ばれている並び順・絞り込み**の組から取ります。
   * ★`{toori_kazu}` は `toorisu`、`{zenbu_haba}` は `gamen8.haba` から取ります（★新しく作りません）。
   */
  ichiran: IchiranKekka;
};

/** 行から読んだ `kekka` の形を確かめます（★親と口の両方で。形が違えば「入力から」に落とす） */
export function kekkaKa(x: unknown): x is Kekka {
  if (typeof x !== 'object' || x === null) return false;
  const o = x as Record<string, unknown>;
  return o.v === 2 && typeof o.tsukutta === 'string' && typeof o.genzaiNen === 'number'
    && typeof o.toorisu === 'number' && (o.pattern === 1 || o.pattern === 2 || o.pattern === 3)
    && typeof o.gamen8 === 'object' && o.gamen8 !== null
    && typeof o.bun8 === 'object' && o.bun8 !== null
    && typeof o.hitogoto13 === 'object' && o.hitogoto13 !== null
    // ★★一覧の8通り（★決め989）。★4つの鍵がそろっていて、それぞれに `nashi` が在ることまで見ます
    && typeof o.ichiran === 'object' && o.ichiran !== null
    && (['tedori', 'zei', 'hayai', 'hajime'] as const).every((k) => {
      const g = (o.ichiran as Record<string, unknown>)[k];
      if (typeof g !== 'object' || g === null) return false;
      const h = g as Record<string, unknown>;
      return typeof h.nashi === 'object' && h.nashi !== null && 'ari' in h;
    });
}
