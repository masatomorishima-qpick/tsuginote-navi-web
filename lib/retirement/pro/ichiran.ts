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
   * ★★**この行の手取り − 1行目の手取り**（★決め1007）。**1件目は `null`**（★基準HTMLの見本は「—」＝ U+2014）。
   *
   * ★★★手取りが多い順では、1行目が最大ですので **0 か負**です。
   * ★★★ほかの3つの並び順では、**1行目より手取りが多い行が下に来ることがあり、そのとき正**になります。
   *   ★字にするのは画面側です（`Screens912.tsx` 207行 …… 負は「−」U+2212／正は「＋」U+FF0B）。
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
 * ★★③が要る理由（★戦術Cowork `senjutsu_20260909i.md` 2節で**言い直されました**。★前の理由
 *   「まとめた中のどれのものか分からなくなる」は**誤り**でした ── ★決め1000で代表を1つに決めていますので、
 *   出る字はその代表の行のもので、はっきりしています）。★正しい理由は、次の2つです。
 *
 *   ★★(a) ③が無いと、**同じ手取りで保険料が上がらない受け取り方が、既定の並びから消えることがあります。**
 *      ★1つの組に「上がる行」と「変わらない行」が混ざり、代表は入力の⑳に近いほうで選ばれますので、
 *      ★★入力が「上がる」側に近ければ、「変わらない」行は出ません（★§後出しにしない）。
 *   ★★(b) ③が有ると、**まとめが絞り込み①の前後で同じ結果になります**（★下の `ichiranMatome()` の覚え書き）。
 *      ★③が無いと1つの組に混ざり、まとめてから絞るのと絞ってからまとめるので、結果も代表も変わります。
 *
 * ★`Row.h` が**⑳に寄る**ことは、`gamen8.ts` 204〜206行のとおりです
 *   （★`p.withKotekiKaishiAge(pl.nenkin_kaishi_age)` で所得を組み立て直しています）。
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
 * ★同じ値のときの並びは、下の `erabu()` に書いてあります（★決め1008 …… ①境目が無い行を先に ②入力の⑳に近い順 ③字の順）。
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
 *
 * 【同点のときの並び・決め1008】★戦術Cowork `senjutsu_20260909i.md` 5節
 *   | ① | ★★**`h.length === 0`（保険料・医療費の境目が無い）を先に** |
 *   | ② | `chikaiKagi()`（★入力の⑳に近い順。★`gamen8.ts` 266〜268行と同じ） |
 *   ★★決め1008の③「`lab` の文字順」は、**`chikaiKagi()` の3つ目**（`x.pl.label`）に入っています
 *     ── ★`lab` は `pl.label` から**同じ字を1つ外しただけ**（`gamen8.ts` 228行）ですので、
 *        ★★同じ方の中では**並び順が変わりません**。★ですので、ここでは1つにまとめて書きます。
 *
 * 【①を足す理由】★この product は「保険料・医療費が上がらない受け取り方だけ」を絞り込み①として
 *   持っています（★基準HTML 893行）ので、**上がらないほうを望ましいとする立ち位置は、すでに取っています。**
 *   ★★★これは §向きを断定しない とは別のことです ── ★**手取りが同じ行どうしの並べ方**の話で、
 *      手取りの向きを1つも言っていません。
 *
 * 【`sa` の向き・決め1007】★★`sa` は「**この行の手取り − 1行目の手取り**」です。
 *   ★★★手取りが多い順**以外**では、1行目が手取りの最大とはかぎりません。
 *      ★1行目より多い行が下に来ることがあり、そのとき `sa` は**正**になります。
 *   ★（★前は `1行目 − この行` でしたので、そのとき `sa` が負になり、画面が「−-1,076,850」になっていました。）
 */
function erabu(matometa: readonly Row[], n: number, kagi: NarabiKagi,
               nyuryokuAge: number): IchiranGyou[] {
  if (matometa.length === 0) throw new Error('受け取り方が1つもありません。`zenToori()` の呼び方を確かめてください。');
  const atama = NARABI[kagi];
  const narabi = [...matometa].sort((a, b) => {
    const ka = atama(a), kb = atama(b);
    for (let i = 0; i < ka.length; i++) if (ka[i] !== kb[i]) return ka[i] - kb[i];
    // ★① 保険料・医療費の境目が無い行を先に（★決め1008）
    const ha = a.h.length === 0 ? 0 : 1, hb = b.h.length === 0 ? 0 : 1;
    if (ha !== hb) return ha - hb;
    // ★② 入力の⑳に近い順（★3つ目は `pl.label` ＝ 決め1008の③）
    const ca = chikaiKagi(a, nyuryokuAge), cb = chikaiKagi(b, nyuryokuAge);
    if (ca[0] !== cb[0]) return ca[0] - cb[0];
    if (ca[1] !== cb[1]) return ca[1] - cb[1];
    return ca[2] === cb[2] ? 0 : (ca[2] < cb[2] ? -1 : 1);
  });
  const ichi = narabi[0].tedori;
  return narabi.slice(0, n).map((x, i) => ({
    lab: x.lab,
    hokenBun: hokenBun(x.h),
    tedori: x.tedori,
    sa: i === 0 ? null : x.tedori - ichi,
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
 * ★同じ手取りのときの並びは `erabu()` のとおりです（★決め1008）。
 * ★`n` がまとめたあとの数より多いときは、**在るだけ**返します（★空の行を作りません）。
 */
export function ichiran(d: readonly Row[], n: number, nyuryokuAge: number): IchiranGyou[] {
  kensuAte(n);
  if (d.length === 0) throw new Error('受け取り方が1つもありません。`zenToori()` の呼び方を確かめてください。');
  return erabu(matomeru(d, nyuryokuAge), n, 'tedori', nyuryokuAge);
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
    const g = erabu(xs, n, kagi, nyuryokuAge);
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
  return erabu(matomeru(d, nyuryokuAge), n, kagi, nyuryokuAge);
}
