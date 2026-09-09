/**
 * lib/retirement/pro/ichiran.ts ── 画面9（退職金受け取りパターン一覧）の**行**を作る
 *
 * ★戦術Cowork `senjutsu_20260909c.md` 4節（★判断ログ980番）です。
 *
 * 【この本がやること】
 *   `zenToori()` が作った `Row[]` を、
 *     ★★★**(ウ) …… 「受け取り方が同じ」かつ「手取りが同じ」かつ「保険料の字が同じ」行を1行にまとめ**
 *       （★戦術Cowork `senjutsu_20260909h.md` 決め999・決め1001）、
 *     ★そのうえで並べ、**上位 n 件**の「その方の字のもと」を返します。
 *   ★**字にはしません**（★字にするのは画面側です）。
 *
 * 【なぜまとめるか・2026-09-09】
 *   ★⑳（公的年金を受け取り始める年齢）を軸に入れると、**⑳だけが違って手取りが1円も変わらない案**が並びます。
 *     ★手取りは `uketori − zei − tesuryo` で、`uketori` は退職金と iDeCo等だけです（★決め994）。
 *   ★★実測（`golden_heavy_20260906`・250人・開発Cowork `kaihatsu_20260909h.md`）……
 *     ★上位7件が**1種類だけ**になる方が **46人（18.4%）**、★7行のうち6行が「差 0」でした。
 *   ★★★まとめても、**何も失いません**（★同じ手取りの行だけがまとまります）。
 *
 * 【この本がやらないこと】
 *   ★絞り込み②（画面9の2つ目のチェック）は、**ここにはありません**。
 *   ★★(ア)（⑳を入力の値に固定する）と (イ)（受け取り方ごとに⑳の最大を代表にする）は、
 *     ★戦術Cowork 決め999 で**採らないと決まりました**。★作っていません。
 *
 * 【既定値を作りません】
 *   ★`n`（何件出すか）は**呼び出し側から渡してください**。★ここでは決めません。
 *     ★基準HTMLの表は 7行ですが、★**それは見本であって、この本の決めではありません**。
 *   ★★`nyuryokuAge`（入力の⑳ ＝ `p.koteki_kaishi_age`）も、**呼び出し側から渡してください**。
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
 * ★★★まとめの鍵① …… その行の「退職金・iDeCo等の受け取り方」（★⑳を外したもの）。
 *
 * ★`lab` の尻尾に付く「／公的年金を◯歳から」を外します。
 *   ★★◯は**その案の⑳**（`Row.nenkin_age`）ですので、**探さずに、その数で外します。**
 *     （★`engine.ts` 1567行 …… `const fuki = nenkinAges.length <= 1 ? '' : `／公的年金を${nAge}歳から`;`）
 *   ★★★**当てずっぽうで切りません。**★尻尾がその形でないときは、`lab` をそのまま返します。
 * ★⑳を軸にしていない方は尻尾が付きませんので、`lab` がそのまま「受け取り方」になります。
 */
export function motoLab(x: Row): string {
  if (x.nenkin_age === null) return x.lab;
  const shippo = `／公的年金を${x.nenkin_age}歳から`;
  return x.lab.endsWith(shippo) ? x.lab.slice(0, -shippo.length) : x.lab;
}

/**
 * ★決め1000 …… まとめた行の代表は「**入力された⑳にいちばん近いもの**」。
 *
 * ★★`gamen8.ts` 262〜268行の同点の並び（③⑳が入力に近い順／④差が同じなら繰上げでないほう／
 *   ⑤ラベルの字順）と**同じ決め方**です ── ★★★**画面8と違う代表を出さないため**です。
 */
function chikaiKagi(x: Row, nyuryokuAge: number): [number, number, string] {
  const a = x.nenkin_age;
  return [a === null ? 0 : Math.abs(a - nyuryokuAge),
          (a === null || a >= nyuryokuAge) ? 0 : 1,
          x.pl.label];
}

/** 2つのうち、入力の⑳に近いほうを返します（★上の3つを順に見ます） */
function chikaiHou(a: Row, b: Row, nyuryokuAge: number): Row {
  const ka = chikaiKagi(a, nyuryokuAge), kb = chikaiKagi(b, nyuryokuAge);
  if (ka[0] !== kb[0]) return ka[0] < kb[0] ? a : b;
  if (ka[1] !== kb[1]) return ka[1] < kb[1] ? a : b;
  return ka[2] <= kb[2] ? a : b;
}

/**
 * ★★★(ウ) ── 3つの鍵が同じ行を、1行にまとめます（★戦術Cowork `senjutsu_20260909h.md` 決め1001）。
 *
 * | | 鍵 |
 * |---|---|
 * | ① | `motoLab()`（★退職金・iDeCo等の受け取り方） |
 * | ② | `tedori`（★手取り） |
 * | ★③ | `hokenBun()` の字 |
 *
 * ★★③が要る理由 …… `Row.h` は**⑳に寄ります**（★`gamen8.ts` 204〜206行 ……
 *   `p.withKotekiKaishiAge(pl.nenkin_kaishi_age)` で所得を組み立て直しています）。
 *   ★★★③が無いと、**手取りは同じで保険料の境目が違う行**が1行になり、
 *   ★一覧の「保険料は変わりません／◯歳から保険料が上がる場合があります」が、
 *     まとめた中のどれのものか分からなくなります。
 *
 * ★`owari`（受け取り終わる年齢）と `age0`（最初の年に入る額）は**⑳に寄りません**
 *   （★`gamen8.ts` 219〜227行 …… `nenkinByYear(p, pl)` と `r.keika` だけで作られています）ので、鍵に足しません。
 *
 * ★★**何も失いません。**★まとまるのは、3つの鍵がぜんぶ同じ行だけです。
 * ★戻す順は、渡された順のままです（★並べるのは下の `erabu()` です）。
 */
export function matomeru(d: readonly Row[], nyuryokuAge: number): Row[] {
  if (!Number.isInteger(nyuryokuAge)) {
    throw new Error(`入力の⑳（公的年金を受け取り始める年齢）が整数ではありません（${nyuryokuAge}）。呼び出し側から渡してください。`);
  }
  const kumi = new Map<string, Row>();
  for (const x of d) {
    // ★区切りは `\u0000`（NUL）。★その方の字にも案の名前にも出ませんので、3つを繋いでも混ざりません
    const kagi = `${motoLab(x)}\u0000${x.tedori}\u0000${hokenBun(x.h)}`;
    const ima = kumi.get(kagi);
    kumi.set(kagi, ima === undefined ? x : chikaiHou(ima, x, nyuryokuAge));
  }
  return [...kumi.values()];
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

/**
 * ★**まとめたあと**の行を並べて、上位 `n` 件を返します。
 * ★この本の中だけで使います（★まとめは呼ぶ側で済ませてください ── 2度まとめないため）。
 */
function erabu(matometa: readonly Row[], n: number, kagi: NarabiKagi): IchiranGyou[] {
  if (matometa.length === 0) throw new Error('受け取り方が1つもありません。`zenToori()` の呼び方を確かめてください。');
  const atama = NARABI[kagi];
  const narabi = [...matometa].sort((a, b) => {
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

/** 件数の当て（★3か所で同じことを書かないため） */
function kensuAte(n: number): void {
  if (!Number.isInteger(n) || n < 1) {
    throw new Error(`一覧に出す件数 n が整数の1以上ではありません（${n}）。呼び出し側から渡してください。`);
  }
}

/**
 * ★(ウ)でまとめてから、手取りの多い順に並べ、上位 `n` 件を返します。
 *
 * ★同じ手取りのときは `lab` の順にします（★機械がいつも同じ答えを出すため）。
 * ★`n` がまとめたあとの数より多いときは、**在るだけ**返します（★空の行を作りません）。
 */
export function ichiran(d: readonly Row[], n: number, nyuryokuAge: number): IchiranGyou[] {
  kensuAte(n);
  if (d.length === 0) throw new Error('受け取り方が1つもありません。`zenToori()` の呼び方を確かめてください。');
  return erabu(matomeru(d, nyuryokuAge), n, 'tedori');
}

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
 *   ★実測（`golden_heavy_20260906`・250人・★`omoi=True`）…… ★★該当が0通りの方は **0人**でした。
 *     ★それでも `null` を返す形にします（★入力しだいで0通りになりえます）。
 * ★★★行は**(ウ)でまとめたあと**のものです（★決め999）。
 * ★`n` と `nyuryokuAge` は**呼び出し側から**渡します（★既定値を作りません）。
 */
export function ichiranMatome(d: readonly Row[], n: number, nyuryokuAge: number):
    Record<NarabiKagi, { nashi: IchiranMatome; ari: IchiranMatome | null }> {
  kensuAte(n);
  if (d.length === 0) throw new Error('受け取り方が1つもありません。`zenToori()` の呼び方を確かめてください。');
  // ★★まとめは1度だけ（★8通りで同じものを使います）
  const matometa = matomeru(d, nyuryokuAge);
  /**
   * ★絞り込み① …… 保険料・医療費の境目が1つも無い案（★`gamen8.ts` 258行と同じ数え方）。
   * ★★まとめたあとで絞っても、まとめる前に絞っても、**同じものになります**
   *   ── ★鍵③（`hokenBun()` の字）が同じ行だけがまとまりますので、
   *      1つの組は「境目が無い行だけ」か「境目が有る行だけ」のどちらかです。
   */
  const cl = matometa.filter((x) => x.h.length === 0);
  const matome = (xs: readonly Row[], kagi: NarabiKagi): IchiranMatome => {
    const g = erabu(xs, n, kagi);
    let saidai = g[0].tedori, saisho = g[0].tedori;
    for (const x of g) { if (x.tedori > saidai) saidai = x.tedori; if (x.tedori < saisho) saisho = x.tedori; }
    return { kensu: g.length, haba: saidai - saisho };
  };
  const out = {} as Record<NarabiKagi, { nashi: IchiranMatome; ari: IchiranMatome | null }>;
  for (const kagi of Object.keys(NARABI) as NarabiKagi[]) {
    out[kagi] = { nashi: matome(matometa, kagi), ari: cl.length ? matome(cl, kagi) : null };
  }
  return out;
}

/** 並び順を指定して、(ウ)でまとめたあとの上位 `n` 件（★`ichiran()` は `tedori` の並びです） */
export function ichiranNarabi(d: readonly Row[], n: number, kagi: NarabiKagi,
                              nyuryokuAge: number): IchiranGyou[] {
  kensuAte(n);
  if (d.length === 0) throw new Error('受け取り方が1つもありません。`zenToori()` の呼び方を確かめてください。');
  return erabu(matomeru(d, nyuryokuAge), n, kagi);
}
