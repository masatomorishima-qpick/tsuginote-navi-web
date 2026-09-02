/**
 * lib/retirement/pro/kekkaKata.ts — 行に置く `kekka` の**形**（型と、形の確かめ）
 *
 * ★`server-only` を付けません。親（ブラウザ）と口（サーバー）の両方が読みます。
 * ★中身を作るのは `kekka.ts`（server-only）。ここは形だけです。
 */

import type { Gamen8 } from './gamen8';
import type { Bun8 } from './gamen8Bun';
import type { Hitogoto13 } from '@/components/retirement/pro/gamen13Bun';

/** 行の `kekka` の形（v1・共通部分）。★9〜12 の便で `ichiran`・`obi` などを足します */
export type Kekka = {
  v: 1;
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
};

/** 行から読んだ `kekka` の形を確かめます（★親と口の両方で。形が違えば「入力から」に落とす） */
export function kekkaKa(x: unknown): x is Kekka {
  if (typeof x !== 'object' || x === null) return false;
  const o = x as Record<string, unknown>;
  return o.v === 1 && typeof o.tsukutta === 'string' && typeof o.genzaiNen === 'number'
    && typeof o.toorisu === 'number' && (o.pattern === 1 || o.pattern === 2 || o.pattern === 3)
    && typeof o.gamen8 === 'object' && o.gamen8 !== null
    && typeof o.bun8 === 'object' && o.bun8 !== null
    && typeof o.hitogoto13 === 'object' && o.hitogoto13 !== null;
}
