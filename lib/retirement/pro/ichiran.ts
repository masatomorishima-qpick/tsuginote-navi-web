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

/**
 * ★★★一覧の**並び順4つ**（★基準HTML 891行の `pill` の字のとおり）。
 *
 * ★★**画面側で並べ替えません。**★口（サーバー）がこの4つで並べ、`Kekka` に入れます
 *   （★§画面に出す数字と分岐は計算エンジン側に置く。実装側に式を持たせない）。
 * ★同じ値のときは `lab` の順（★機械がいつも同じ答えを出すため）。
 */
export const NARABI = {
  /** 手取りが多い順 */
  tedori: (x: Row): number[] => [-x.tedori],
  /** 増える税金が少ない順 */
  zei: (x: Row): number[] => [x.zei],
  /** 早く受け取り終える順 */
  hayai: (x: Row): number[] => [x.owari],
  /** 最初の年に多く受け取る順 */
  hajime: (x: Row): number[] => [-x.age0],
} as const;

export type NarabiKagi = keyof typeof NARABI;

/** 一覧の1組ぶんの「件数」と「幅」。★幅 ＝ その組の中の 手取りの最大 − 最小 */
export type IchiranMatome = {
  /** 実際に出る行の数（★`n` に満たないことがあります） */
  kensu: number;
  /** その組の中の 手取りの最大 − 最小。★1件のときは 0 */
  haba: number;
};

/**
 * ★★★一覧の**8通り**（★並び順4つ × 絞り込み①の入／切・決め979）。
 *
 * ★`nashi` …… 絞り込み①を**切った**とき（★全通り）
 * ★`ari` ……… 絞り込み①を**入れた**とき（★保険料・医療費が上がらない案だけ）
 *   ★★**該当が0通りの方は `null`** を入れます（★「上から0件」と書かせないため）。
 *   ★実測（`golden_light_20260906`・1,000人）…… ★★該当が0通りの方は **0人**でした。
 *     ★それでも `null` を返す形にします（★入力しだいで0通りになりえます）。
 * ★`n` は**呼び出し側から**渡します（★既定値を作りません）。
 */
export function ichiranMatome(d: readonly Row[], n: number):
    Record<NarabiKagi, { nashi: IchiranMatome; ari: IchiranMatome | null }> {
  if (!Number.isInteger(n) || n < 1) {
    throw new Error(`一覧に出す件数 n が整数の1以上ではありません（${n}）。呼び出し側から渡してください。`);
  }
  // ★絞り込み① …… 保険料・医療費の境目が1つも無い案（★`gamen8.ts` 258行と同じ数え方）
  const cl = d.filter((x) => x.h.length === 0);
  const matome = (xs: readonly Row[], kagi: NarabiKagi): IchiranMatome => {
    const g = ichiranNarabi(xs, n, kagi);
    let saidai = g[0].tedori, saisho = g[0].tedori;
    for (const x of g) { if (x.tedori > saidai) saidai = x.tedori; if (x.tedori < saisho) saisho = x.tedori; }
    return { kensu: g.length, haba: saidai - saisho };
  };
  const out = {} as Record<NarabiKagi, { nashi: IchiranMatome; ari: IchiranMatome | null }>;
  for (const kagi of Object.keys(NARABI) as NarabiKagi[]) {
    out[kagi] = { nashi: matome(d, kagi), ari: cl.length ? matome(cl, kagi) : null };
  }
  return out;
}

/** 並び順を指定して上位 `n` 件（★`ichiran()` は `tedori` の並びです） */
export function ichiranNarabi(d: readonly Row[], n: number, kagi: NarabiKagi): IchiranGyou[] {
  if (!Number.isInteger(n) || n < 1) {
    throw new Error(`一覧に出す件数 n が整数の1以上ではありません（${n}）。呼び出し側から渡してください。`);
  }
  if (d.length === 0) throw new Error('受け取り方が1つもありません。`zenToori()` の呼び方を確かめてください。');
  const atama = NARABI[kagi];
  const narabi = [...d].sort((a, b) => {
    const ka = atama(a), kb = atama(b);
    for (let i = 0; i < ka.length; i++) if (ka[i] !== kb[i]) return ka[i] - kb[i];
    return a.lab === b.lab ? 0 : (a.lab < b.lab ? -1 : 1);
  });
  const ichi = narabi[0].tedori;
  return narabi.slice(0, n).map((x, i) => ({
    lab: x.lab,
    hokenBun: hokenBun(x.h),
    tedori: x.tedori,
    sa: i === 0 ? null : ichi - x.tedori,
  }));
}
