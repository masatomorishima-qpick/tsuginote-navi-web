/**
 * lib/retirement/pro/ichiran.ts ── 画面9（退職金受け取りパターン一覧）の**行**を作る
 *
 * ★戦術Cowork `senjutsu_20260909c.md` 4節（★判断ログ980番）です。
 *
 * 【この本がやること】
 *   `zenToori()` が作った `Row[]` を、**手取りの多い順**に並べ、**上位 n 件**の
 *   「その方の字のもと」を返します。★**字にはしません**（★字にするのは画面側です）。
 *
 * 【この本がやらないこと】
 *   ★並べ替えの4つ（増える税金が少ない順・早く受け取り終える順・最初の年に多く受け取る順）と
 *     絞り込みは、**ここにはありません**。★親（ブラウザ）がやります（★戦術Cowork
 *     `senjutsu_20260909b.md` 決め979 ── ★`Kekka` には「一覧に出しうる案の行」を入れます）。
 *   ★この回は「手取りが多い順の上位 n 件」だけです。
 *
 * 【既定値を作りません】
 *   ★`n`（何件出すか）は**呼び出し側から渡してください**。★ここでは決めません。
 *     ★基準HTMLの表は 7行ですが、★**それは見本であって、この本の決めではありません**。
 */

import type * as S from './sakaime';
import type { Row } from './gamen8';

/** 一覧の1行（★字のもと。★円の記号や桁区切りは、画面側が付けます） */
export type IchiranGyou = {
  /** その案の名前（`Row.lab`） */
  lab: string;
  /** 保険料・医療費の字（★下の `hokenBun()` が作ります） */
  hokenBun: string;
  tedori: number;
  /**
   * いちばん上の案との差。**1件目は `null`**（★基準HTMLの見本は「—」＝ U+2014）。
   * ★引き算だけです。★**float を使いません**（`tedori` は整数です）。
   */
  sa: number | null;
};

/**
 * 保険料・医療費の字。
 *
 * ★境目が1つも無い方 …… 「保険料は変わりません」
 * ★1つ以上ある方 ……… 「◯歳から保険料が上がる場合があります」
 *   ★★◯は、**その案でいちばん早い境目の年齢**です（`Math.min`）。
 *   ★★★2つ以上の境目があっても、**いちばん早い1つ**だけを言います
 *     （★基準HTMLの見本が、そういう1文だからです ── 898〜904行）。
 */
export function hokenBun(h: readonly S.Koeta[]): string {
  if (h.length === 0) return '保険料は変わりません';
  let saitan = h[0].age;
  for (const x of h) if (x.age < saitan) saitan = x.age;
  return `${saitan}歳から保険料が上がる場合があります`;
}

/**
 * 手取りの多い順に並べ、上位 `n` 件を返します。
 *
 * ★同じ手取りのときは `lab` の順にします（★機械がいつも同じ答えを出すため）。
 * ★`n` が全通りより多いときは、**在るだけ**返します（★空の行を作りません）。
 */
export function ichiran(d: readonly Row[], n: number): IchiranGyou[] {
  if (!Number.isInteger(n) || n < 1) {
    throw new Error(`一覧に出す件数 n が整数の1以上ではありません（${n}）。呼び出し側から渡してください。`);
  }
  if (d.length === 0) throw new Error('受け取り方が1つもありません。`zenToori()` の呼び方を確かめてください。');
  const narabi = [...d].sort((a, b) => (a.tedori === b.tedori
    ? (a.lab === b.lab ? 0 : (a.lab < b.lab ? -1 : 1))
    : b.tedori - a.tedori));
  const atama = narabi[0].tedori;
  return narabi.slice(0, n).map((x, i) => ({
    lab: x.lab,
    hokenBun: hokenBun(x.h),
    tedori: x.tedori,
    sa: i === 0 ? null : atama - x.tedori,
  }));
}
