/**
 * lib/retirement/pro/gamen9shosaiBun.ts
 *   ── 画面9詳細の **44種類**（★戦術Cowork `senjutsu_20260913g.md`・**回4の続き**）
 *
 * 【ここは「エンジン側」です。画面側に式を持たせないための本です】
 *   ★分岐も式も字も、ぜんぶここに在ります。`Screens912.tsx` は**受け取って渡すだけ**です。
 *   ★★**既定値を作りません。**★要るものは、ぜんぶ呼ぶ側から渡してください。
 *
 * 【もとにした決め】
 *   ★決め1046 …… A案 ＝ 跨がない いちばん長い年数（＝ ⑳ − 受け取り始める年齢）／B案 ＝ その1年上。
 *                 出す相手は `⑳ − 受け取り始める年齢` が **5以上19以下**の方
 *   ★決め1049⑤ …… 満額になる年齢が無い方の字
 *   ★決め1055 …… 914行の見出しから結論を外した
 *   ★決め1056 …… `setai_kubun` ＝「`{世帯}`・`{級地}`」（★扶養0人なら「単身」・1人以上なら「扶養`{n}`人」）
 *   ★決め1058 …… 975行の文1・文2を1つの印 `koteki_tsukisu_bun` に。月日が分からない方には別の字
 *   ★決め1130(2)・1131 …… 住民税の非課税は `hikazeiGendo(級地, 扶養)` で判定する
 *   ★★決め1134 …… **917行の3文を1文まるごとの印に**し、`keigen_a/b/c` を基準HTMLから外した
 *   ★★決め1135 …… 表の金額にも円を付ける（14か所）
 *   ★★決め1136 …… **表や箇条書きのセルの中の印を `null` にしない**（★かたまりごと落ちるため）
 *   ★★決め1137 …… `hantei_nenkin_kojo_kubun` は見本と同じ形で上の段も作る／公的年金0円の方の3つめの字
 *   ★★決め1139 …… `koteki_tsukisu_bun` の**4つめの字**（★⑳の年が0か月）／`mangaku_bun`（★公的年金0円）
 *   ★★決め1141 …… warn の囲みの出し方を3つに（★`jumin_koeru_bun` を足した）
 *   ★★決め1143 …… **その方に当たる字が1つも無い画面を出さない**
 *
 * ──────────────────────────────────────────────────────────
 * ★★★【この本が `null` を返す所】
 *
 *   1. `keigen_koeru_bun` …… ★★**B案で軽減も住民税も変わらない方**（★実測 76人／102・74.5%）。
 *      ★★★決め1141(3)＝**「こうなります」と言って、何も起きないものを並べない。**
 *      ★warn の囲みの `<b>` の中の印ですので、★**囲みごと落ちます**（★決め1101の形）。
 *   2. `dasu` が `false` の方 …… ★`setai_kubun`・`hikazei_gendo` いがい ぜんぶ `null`。
 *      ★★この2つは画面11（1137〜1138行）にも出ますので、★**必ず返します**（★決め1143(5-1)）。
 *
 * ★★★【`gyouNashi` で `<li>` を落とす所】（★`null` にしません・決め1136）
 *   `keigen_kokuho_bun` …… ★軽減が変わらない方（★実測 77人／102）
 *   `jumin_koeru_bun` ……… ★住民税が変わらない方（★実測 87人／102）
 *   ★★**どちらも落ちる76人は、`keigen_koeru_bun` が `null` ですので囲みごと落ちます。**
 * ──────────────────────────────────────────────────────────
 */

import * as E from './engine';
import * as S from './sakaime';
import * as Z from './zeisei';
import { setaiNoJi } from './gamen11Atai';

/** 円の表記（★`gamen10Bun.ts`・`gamen11Bun.ts` と同じ形） */
const en = (n: number) => `${n.toLocaleString('en-US')}円`;
/** 引く数の円（★見本は「−1,100,000円」。★マイナスは U+2212・0のときは「0円」） */
const enHiku = (n: number) => (n === 0 ? '0円' : `−${Math.abs(n).toLocaleString('en-US')}円`);

/**
 * ★★★**出す相手**（★決め1046）。`⑳ − 受け取り始める年齢` が **5以上19以下**の方。
 *   ★5未満だとA案が `build()` に無く、20以上だとB案が無い（★`engine.ts` の `k <= 20`）。
 */
export const NENSU_MIN = 5, NENSU_MAX = 19;

/**
 * 公的年金等控除の**収入の区分**（所得税法35条4項の表）。
 *
 * ★★**`zeisei.ts` の `nenkinShotoku()` が使っている境目と同じ数**です。
 *   ★★★**ずれたら止まる門を、下に置いています**（★同じ数を2か所に置くためです）。
 */
const KUBUN_65IJOU_1 = 3_300_000;
const KUBUN_65MIMAN_1 = 1_300_000;
const KUBUN_2 = 4_100_000, KUBUN_3 = 7_700_000, KUBUN_4 = 10_000_000;

/**
 * `{hantei_nenkin_kojo_kubun}` の字。見本は「**65歳以上・330万円以下**」。
 *
 * ★★★**上の段の字は、見本と同じ形で作っています**（★決め1137(8)でそれでよいと決まりました）。
 * ★額は所得税法35条4項の表の数です（★推測ではありません）。
 */
export function kojoKubunJi(ijou65: boolean, shunyu: number): string {
  const s = Math.trunc(shunyu);
  const atama = ijou65 ? '65歳以上' : '65歳未満';
  const ichi = ijou65 ? KUBUN_65IJOU_1 : KUBUN_65MIMAN_1;
  const man = (v: number) => `${(v / 10_000).toLocaleString('en-US')}万円`;
  if (s < ichi) return `${atama}・${man(ichi)}以下`;
  if (s < KUBUN_2) return `${atama}・${man(KUBUN_2)}以下`;
  if (s < KUBUN_3) return `${atama}・${man(KUBUN_3)}以下`;
  if (s < KUBUN_4) return `${atama}・${man(KUBUN_4)}以下`;
  return `${atama}・${man(KUBUN_4)}超`;
}

/**
 * ★★**境目の数が `zeisei.ts` とずれたら止まる門**（★§同じ数を2か所に書かない の代わり）。
 *   ★★控除の額は**境目でつながっています**。★変わるのは**傾き**です。
 *   ★ですので「1万円ふえたときに、控除がいくらふえるか」を、境目の下と上で比べます。
 *   ★この本が読み込まれたときに、1度だけ回ります。
 */
{
  const kojo = (age: number, s: number) => s - Z.nenkinShotoku(age, s, 0);
  const katamuki = (age: number, s: number) => kojo(age, s + 10_000) - kojo(age, s);
  const kumi: [boolean, number][] = [
    [true, KUBUN_65IJOU_1], [false, KUBUN_65MIMAN_1],
    [true, KUBUN_2], [true, KUBUN_3], [true, KUBUN_4],
  ];
  for (const [ijou65, ichi] of kumi) {
    const age = ijou65 ? 65 : 64;
    if (katamuki(age, ichi - 20_000) === katamuki(age, ichi)) {
      throw new Error(
        `公的年金等控除の区分の境目（${ijou65 ? '65歳以上' : '65歳未満'}・`
        + `${ichi.toLocaleString('en-US')}円）で、控除の増え方が変わっていません。`
        + '`zeisei.ts` の `nenkinShotoku()` と、この本の区分の額が食い違っています'
        + '（`gamen9shosaiBun.ts` の `KUBUN_*` を確かめてください）。',
      );
    }
  }
}

/** 画面9詳細の 44種類（★`{nenkin_gen}` は `atai912()` がすでに持っています） */
export interface Bun9shosai {
  /**
   * ★★★**その方に画面9詳細を出すか**（★決め1046）。
   *   ★`false` のとき、下の種類は**`setai_kubun`・`hikazei_gendo` いがい ぜんぶ `null`** です。
   *   ★★★**`setai_kubun` と `hikazei_gendo` は、画面11（1137行）にも出ます**ので、
   *     ★**出す相手でない方にも必ず返します**（★`null` にすると、画面11の年金の表が落ちます）。
   */
  dasu: boolean;

  /**
   * ── ★★★**`dasu` が `false` でも必ず返す4つ**（★決め1143(5-1)）
   *
   *   ★★**画面9詳細の都合で `null` にすると、ほかの画面が落ちます。**
   *   ★機械で数えた「画面9詳細の45種類のうち、ほかの画面にも出る名前」は **5種類** ──
   *     `nenkin_gen`（★`atai912()` が別に持っています）／
   *     `setai_kubun`・`hikazei_gendo`（★画面11 1137〜1138行）／
   *     `ideco_zandaka`・`koteki_kaishi_age`（★画面10 993行）。
   *   ★★★この4つは、★**出す相手でない方にも値を返します**。
   */
  setai_kubun: string;
  hikazei_gendo: string;
  ideco_zandaka: string;
  koteki_kaishi_age: string;

  // ── 917行の3文（★決め1134・1文まるごと） -----------------------------------
  handan_a_bun: string | null;
  handan_b_bun: string | null;
  handan_c_bun: string | null;
  // ── warn の囲み（★決め1134(3)・決め1141） -----------------------------------
  /** ★★何も変わらない方は `null`（★囲みごと落ちます・決め1141(3)） */
  keigen_koeru_bun: string | null;
  /** ★軽減の行。★変わらない方は `gyou_nashi` に入り、`<li>` が落ちます（★`null` にしません） */
  keigen_kokuho_bun: string | null;
  /** ★★決め1141(1) …… 住民税の行。★変わらない方は `gyou_nashi` に入ります */
  jumin_koeru_bun: string | null;
  /**
   * ★★★**その方には、その行が無い**名前（★`gyouNashi912()` に渡します）。
   *   ★★`null` ではありません ── ★**ふつうの分岐**で、`<li>` だけが落ちます（★決め1136・決め1094）。
   */
  gyou_nashi: readonly string[];

  // ── 図の凡例と、破線の箇条書きの額 -------------------------------------------
  an_a_bun: string | null;
  an_b_bun: string | null;
  sakaime_1: string | null;
  sakaime_2: string | null;
  sakaime_3: string | null;

  // ── 保険料判定所得の表（1本目・★決め1135で金額に円） ------------------------
  hantei_age: string | null;
  an_a_nensu: string | null;
  an_b_nensu: string | null;
  koteki_tsukisu: string | null;
  a_koteki: string | null;
  b_koteki: string | null;
  a_ideco: string | null;
  b_ideco: string | null;
  a_shunyu_kei: string | null;
  b_shunyu_kei: string | null;
  hantei_nenkin_kojo_kubun: string | null;
  a_nenkin_kojo: string | null;
  b_nenkin_kojo: string | null;
  zatsu_chu: string | null;
  a_zatsu: string | null;
  b_zatsu: string | null;
  /** ★決め1136(6) …… 給与所得の行（★これが無いと 25人／102 で足し算が合いませんでした） */
  a_kyuyo: string | null;
  b_kyuyo: string | null;
  a_koujo15: string | null;
  b_koujo15: string | null;
  a_hantei_shotoku: string | null;
  b_hantei_shotoku: string | null;

  // ── 表の下の文（975行） ------------------------------------------------------
  koteki_tsukisu_bun: string | null;
  mangaku_bun: string | null;

  // ── どの基準を超えるかの表（2本目） ------------------------------------------
  kokuho_kijun: string | null;
  a_kokuho_bun: string | null;
  b_kokuho_bun: string | null;
  a_jumin_bun: string | null;
  b_jumin_bun: string | null;

  /** ★数えたもの（★画面には出ません。★便に書くためのものです） */
  shirabeta: {
    /** `⑳ − 受け取り始める年齢` */
    nensu_a: number;
    /** ⑳（★その案の軸に差し替えたあと） */
    kijun_age: number;
    /** iDeCo等を受け取り始める年齢 */
    ideco_kaishi_age: number;
    an_a_atta: boolean;
    an_b_atta: boolean;
    /** ⑳の年に支払を受ける公的年金の月数 */
    koteki_tsukisu: number;
    /** ⑥の月日をお答えになっているか */
    umare_ari: boolean;
    /** 公的年金の年額（★0円の方が居ます） */
    koteki_gaku: number;
    /** ⑳の年の給与所得（★A案・B案） */
    kyuyo_a: number;
    kyuyo_b: number;
    /** ⑳の年の 軽減割合（★A案・B案）と、⑳＋1歳の割合 */
    wariai_a: number | null;
    wariai_b: number | null;
    wariai_c: number | null;
    /** ★B案で軽減が下がるか ／ 住民税がかかり始めるか */
    keigen_sagaru: boolean;
    jumin_hajimaru: boolean;
    /** ★A案の時点ですでに住民税が課税か（★warn の箇条書きの2行目は固定の字です） */
    jumin_a_kazei: boolean;
    /** A案・B案の 雑所得 */
    zatsu_a: number;
    zatsu_b: number;
    /** 公的年金等控除の収入の区分が、見本と同じ「いちばん下の段」か */
    kubun_shita: boolean;
    /** 満額が入り始める年齢（★無ければ `null`） */
    mangaku_age: number | null;
    /** `koteki_tsukisu_bun` がどの字になったか */
    tsukisu_bun_kata: 'mihon' | 'umare_nashi' | 'koteki_zero' | 'koteki_zero_tsuki' | 'nashi';
    /** 表の足し算（雑所得＋給与所得＋15万円 ＝ 判定所得）が合うか */
    hyo_au_a: boolean;
    hyo_au_b: boolean;
  };
}

/** 表の金額（★決め1135で円を付けました） */
const kazu = en;

/**
 * ★★★【2026-09-13・こちらの誤り】通し月数から「◯月」を作ります。
 *
 *   ★★前の回は `(tsu % 12) + 1` と**自分で書いていました**。★`engine.ts` の `ym()` は
 *     `year * 12 + month`（★`(month - 1)` ではありません）ですので、★★**1か月ずれていました**。
 *   ★★★**式を自分で書かず、`engine.ts` の `ymLabel()`（★`ym()` の逆）から取ります**
 *     （★§同じ式を2か所に書かない）。
 */
const tsukiJi = (tsu: number) => E.ymLabel(tsu).split('年')[1];

/**
 * ★軽減の割合の字（★決め1134）。
 *   ★`wariaiJi(0)` ＝「受けられない」・`wariaiJi(7)` ＝「7割」。
 *   ★★**「◯のまま」に続ける形**は別に作ります（★「受けられない**の**まま」になってしまうため）。
 */
const wariaiJi = (w: number) => (w === 0 ? '受けられない' : `${w}割`);
/** ★「…のまま変わりません」に続ける形（★0割は「受けられないまま」・7割は「7割のまま」） */
const mamaJi = (w: number) => (w === 0 ? '受けられないまま' : `${w}割のまま`);

/**
 * ★★★画面9詳細の 44種類を作ります。
 *
 * @param moto        その方（★入力のまま）
 * @param R           `build()` の戻り（★A案・B案をここから探します）
 * @param plan        いま見せている案（★一覧で選んだ行の案・決め1030）
 * @param idecoName   iDeCo等の支給源の名前（★案の名前から拾ったもの）
 * @param hihokensha      国民健康保険の被保険者数（★呼ぶ側が決めて渡します。既定値ではありません）
 * @param kyuyoShotokusha 給与所得者等の数（★同じく、呼ぶ側が決めて渡します）
 * @param kyuchiHabuita   ★⑰（お住まいの級地）を**省いてお答えになったか**（★決め1056）。
 *                        ★`paidInput.ts` の `toJinbutsu()` が返します。★既定値を作りません。
 */
export function gamen9shosaiBun(
  moto: E.Jinbutsu, R: readonly [E.Plan, E.EvalResult][], plan: E.Plan,
  idecoName: string, hihokensha: number, kyuyoShotokusha: number,
  kyuchiHabuita: boolean,
): Bun9shosai {
  /**
   * ★★★**⑳の軸を、その案のものに差し替えます**（★`gamen11Bun.ts` と同じ形）。
   *   ★`build()` が `evaluate()` に渡したのと同じ人物で数えないと、公的年金の額がずれます。
   */
  const p = (plan.nenkin_kaishi_age === null || plan.nenkin_kaishi_age === moto.koteki_kaishi_age)
    ? moto : moto.withKotekiKaishiAge(plan.nenkin_kaishi_age);
  const kijunAge = p.koteki_kaishi_age;

  // ── その方のもの（★`dasu` が `false` でも返します） --------------------------
  /**
   * ★★決め1056 …… 「`{世帯}`・`{級地}`」。★世帯の字は**扶養の人数**から作ります
   *   （★`zeisei.ts` の `hikazeiGendo()` が、級地と扶養の人数の2つだけで額を決めているため）。
   * ★★★⑰を省いてお答えの方には「（お答えがないため）」を添えます（★決め1056）。
   */
  /**
   * ★★★【2026-09-15・決め1231】**この2つの正本を `gamen11Atai.ts` に移しました。**
   *   ★理由 …… ★この2つは**画面9詳細と画面11の両方**に出ます（★基準HTML 1137〜1138行）。
   *     ★★Excel シート4に「計算の全ステップ」（＝画面11）を入れることになり、
   *     ★★★`excel.ts` は**画面9詳細を作りません**ので、★この2つだけを取り出せる本が要りました。
   *   ★★**ここで組み立て直しません**（★写しは、いつか片方だけ古びます・決め1219）。
   */
  const { setaiKubun, hikazeiGendo, hikazeiGaku, fuyou } =
    setaiNoJi(p, kyuchiHabuita, hihokensha, kyuyoShotokusha);
  /** ★軽減の基準（★`sakaimeList()` から読みます。★額を写しません） */
  const listHito = S.sakaimeList(hihokensha, kyuyoShotokusha, p.kyuchi, fuyou);
  const gakuOf = (key: string) => {
    const s = listHito.find((x) => x.key === key);
    if (!s) throw new Error(`\`sakaimeList()\` に ${key} が在りません。`);
    return s.gaku;
  };
  const kijun7 = gakuOf('keigen7'), kijun5 = gakuOf('keigen5'), kijun2 = gakuOf('keigen2');

  /** iDeCo等を受け取り始める年（★年金の案なら `nenkin_kaishi_nen`・一時金なら `uketori_nen`） */
  const kaishiNen = (plan.nenkin_gen === idecoName && plan.nenkin_kaishi_nen !== null)
    ? plan.nenkin_kaishi_nen : plan.uketori_nen[idecoName];
  if (kaishiNen === undefined) {
    throw new Error(`いま見せている案に、${idecoName} を受け取る年が在りません。`);
  }
  /** ★`{ideco_zandaka}` のもと（★画面10にも出ますので、`dasu` に寄らず返します） */
  const idecoGen = p.gens.find((g) => g.name === idecoName);
  if (!idecoGen) throw new Error(`${idecoName} が、その方の支給源に在りません。`);

  const idecoKaishiAge = p.age(kaishiNen);
  const nensuA = kijunAge - idecoKaishiAge;
  const nensuB = nensuA + 1;
  const y0 = p.year(kijunAge);
  const tsukisu = p.nenkinShiharaiTsukisu(y0);

  /** A案・B案を `build()` の中から探す（★名前の字ではなく、案の中身で探します） */
  const sagasu = (n: number): E.Plan | null =>
    R.find(([pl]) => pl.nenkin_gen === idecoName && pl.ichiji_wariai === 0
      && pl.nenkin_kikan === n && pl.nenkin_kaishi_nen === kaishiNen
      && (pl.nenkin_kaishi_age === null || pl.nenkin_kaishi_age === kijunAge))?.[0] ?? null;
  const planA = nensuA >= NENSU_MIN && nensuA <= NENSU_MAX ? sagasu(nensuA) : null;
  const planB = nensuA >= NENSU_MIN && nensuA <= NENSU_MAX ? sagasu(nensuB) : null;

  const shirabetaKara: Bun9shosai['shirabeta'] = {
    nensu_a: nensuA, kijun_age: kijunAge, ideco_kaishi_age: idecoKaishiAge,
    an_a_atta: planA !== null, an_b_atta: planB !== null,
    koteki_tsukisu: tsukisu, umare_ari: p.umare !== null, koteki_gaku: p.kotekiGaku(),
    kyuyo_a: 0, kyuyo_b: 0, wariai_a: null, wariai_b: null, wariai_c: null,
    keigen_sagaru: false, jumin_hajimaru: false, jumin_a_kazei: false,
    zatsu_a: 0, zatsu_b: 0, kubun_shita: false, mangaku_age: null,
    tsukisu_bun_kata: 'nashi', hyo_au_a: false, hyo_au_b: false,
  };
  if (planA === null || planB === null) {
    return {
      dasu: false,
      setai_kubun: setaiKubun, hikazei_gendo: hikazeiGendo,
      ideco_zandaka: en(idecoGen.shunyu), koteki_kaishi_age: `${kijunAge}歳`,
      handan_a_bun: null, handan_b_bun: null, handan_c_bun: null,
      keigen_koeru_bun: null, keigen_kokuho_bun: null, jumin_koeru_bun: null,
      gyou_nashi: [],
      an_a_bun: null, an_b_bun: null,
      sakaime_1: null, sakaime_2: null, sakaime_3: null,
      hantei_age: null, an_a_nensu: null, an_b_nensu: null, koteki_tsukisu: null,
      a_koteki: null, b_koteki: null, a_ideco: null, b_ideco: null,
      a_shunyu_kei: null, b_shunyu_kei: null, hantei_nenkin_kojo_kubun: null,
      a_nenkin_kojo: null, b_nenkin_kojo: null, zatsu_chu: null,
      a_zatsu: null, b_zatsu: null, a_kyuyo: null, b_kyuyo: null,
      a_koujo15: null, b_koujo15: null,
      a_hantei_shotoku: null, b_hantei_shotoku: null,
      koteki_tsukisu_bun: null, mangaku_bun: null,
      kokuho_kijun: null, a_kokuho_bun: null, b_kokuho_bun: null,
      a_jumin_bun: null, b_jumin_bun: null,
      shirabeta: shirabetaKara,
    };
  }

  // ── ⑳の年の、A案とB案の所得 -------------------------------------------------
  /** ★退職所得は、合計にも区分にも入れません（★`shotokuJoukyou()` と同じ置き方・E-15） */
  const toshi = (pl: E.Plan, y: number) => {
    const nen = E.nenkinByYear(p, pl);
    return { ideco: nen[y] ?? 0, k: E.shotokuKumitate(p, y, nen[y] ?? 0, 0, 0) };
  };
  const A = toshi(planA, y0), B = toshi(planB, y0);

  /**
   * ★★「65歳以上の15万円」で**引かれた額**。
   *   ★★★**式をここに書きません** ── ★`keigenHanteiShotoku()` が出した数との**差**で出します
   *     （★§同じ式を2か所に書かない）。
   */
  const hantei = (t: typeof A, age: number) => S.keigenHanteiShotoku(age, t.k.zatsu, t.k.kyuyo);
  const koujo15 = (t: typeof A) => hantei(t, kijunAge) - (t.k.zatsu + t.k.kyuyo);
  const wariai = (t: typeof A, age: number) =>
    S.keigenWariai(hantei(t, age), hihokensha, kyuyoShotokusha);

  const wA = wariai(A, kijunAge), wB = wariai(B, kijunAge);
  /**
   * ★★**門** …… B案はA案に `{nenkin_gen}` の1年分を足した姿ですので、
   *   ★**判定所得は減りません**＝軽減の割合は上がりません。★ずれたら、置き方が違っています。
   */
  if (wB > wA) {
    throw new Error(
      `B案（${nensuB}年）の軽減の割合（${wB}割）が、A案（${nensuA}年・${wA}割）より上になりました。`
      + 'B案はA案に1年分を足した姿ですので、判定所得は減りません。置き方を確かめてください。',
    );
  }
  const juminAKazei = A.k.sougou > hikazeiGaku;
  const juminBKazei = B.k.sougou > hikazeiGaku;
  const keigenSagaru = wB < wA;
  const juminHajimaru = !juminAKazei && juminBKazei;

  // ── ⑳＋1歳の姿（★917行の3文めが言う年） ------------------------------------
  const ageC = kijunAge + 1;
  const yC = p.year(ageC);
  const AC = toshi(planA, yC), BC = toshi(planB, yC);
  /**
   * ★★**門** …… A案（`nensuA` 年）は⑳−1歳で、B案（`nensuB` 年）は⑳で受け取り終えますので、
   *   ★**⑳＋1歳は、どちらも公的年金だけ**です。★割合が違ったら、置き方が違っています。
   */
  const wC = wariai(AC, ageC);
  if (wC !== wariai(BC, ageC)) {
    throw new Error(
      `${ageC}歳の軽減の割合が、A案（${wC}割）とB案（${wariai(BC, ageC)}割）で違います。`
      + `どちらも${idecoName}を受け取り終えている年ですので、同じになるはずです。`,
    );
  }
  /** 満額が入り始める年齢（★⑳・⑳＋1・⑳＋2 の中で、はじめて12か月になる年） */
  const mangakuAge = (() => {
    for (let a = kijunAge; a <= kijunAge + 2; a++) {
      if (p.nenkinShiharaiTsukisu(p.year(a)) === 12) return a;
    }
    return null;
  })();

  // ── 917行の3文（★決め1134） -------------------------------------------------
  const handanA = `${nensuA}年で受け取れば、国民健康保険料の軽減は${mamaJi(wA)}変わりません。`;
  /** ★軽減の変わり方（★`sakaime.ts` の `koka` と同じ言い方にそろえました） */
  const keigenKu = wB === 0 ? `軽減が${wA}割からなくなり` : `軽減が${wA}割から${wB}割に下がり`;
  const handanB = (() => {
    const bu: string[] = [];
    if (keigenSagaru) bu.push(keigenKu);
    if (juminHajimaru) bu.push('住民税がかかり始め');
    return bu.length
      ? `${nensuB}年に延ばすと、${kijunAge}歳の1年だけ${bu.join('、')}ます。`
      : `${nensuB}年に延ばしても、${kijunAge}歳の国民健康保険料の軽減と住民税は変わりません。`;
  })();
  const handanC = (() => {
    const riyu = (tsukisu < 12 && p.nenkinShiharaiTsukisu(yC) === 12)
      ? '公的年金が満額入るので' : `${idecoName}を受け取り終えているので`;
    const owari = wC === 0 ? 'どちらも軽減は受けられません' : `どちらも軽減は${wC}割になります`;
    return `${ageC}歳からは、どちらを選んでも同じです（${riyu}、${owari}）。`;
  })();

  // ── warn の囲み（★決め1134(3)・★★決め1141） --------------------------------
  /**
   * ★★★決め1141 …… **3つに整理しました。**
   *   (1) `jumin_koeru_bun` を足しました。★住民税が変わらない方（★87人）は `<li>` を落とします
   *   (2) `keigen_kokuho_bun` も同じ。★軽減が変わらない方（★77人）は `<li>` を落とします
   *   (3) ★★**どちらも変わらない方（★76人）は `keigen_koeru_bun` を `null`** ＝ 囲みごと落ちます
   *   ★★★**「こうなります」と言って、何も起きないものを並べません。**
   */
  const koeruBun = (keigenSagaru || juminHajimaru)
    ? `${nensuB}年に延ばして基準を超えると`
    : null;
  /**
   * ★★`<li>` の字は、★**落とす方にも値を返します**（★決め1136＝箇条書きのセルの中の印を `null` にしない）。
   *   ★落とすのは `gyou_nashi` です ── ★**`kumitate()` が `<li>` だけを落とします**（★決め1094）。
   */
  const kokuhoBun = keigenSagaru
    ? (wB === 0 ? `軽減が${wA}割からなくなります` : `軽減が${wA}割から${wB}割に下がります`)
    : `軽減は${mamaJi(wA)}変わりません`;
  /** ★決め1141(1) …… 基準HTML 980行の固定の字を、そのまま印にしていただきました */
  const juminBun = juminHajimaru
    ? '住民税がかかり始めます。介護保険料の段階や医療費の負担にも連動します'
    : '住民税は変わりません';
  const gyouNashi: string[] = [];
  if (!keigenSagaru) gyouNashi.push('keigen_kokuho_bun');
  if (!juminHajimaru) gyouNashi.push('jumin_koeru_bun');

  // ── 975行の2つの文（★決め1058・決め1136(7)・決め1137(9)） -------------------
  const kotekiGaku = p.kotekiGaku();
  let tsukisuKata: Bun9shosai['shirabeta']['tsukisu_bun_kata'] = 'mihon';
  const tsukisuBun = (() => {
    if (kotekiGaku === 0) {
      // ★決め1137(9) の字（★そのまま）
      tsukisuKata = 'koteki_zero';
      return `あなたの公的年金は0円ですので、この表の年金はすべて${idecoName}です。`;
    }
    const umare = p.umare;
    if (umare === null) {
      // ★決め1058 の字（★そのまま）
      tsukisuKata = 'umare_nashi';
      return `あなたは生まれた月日をお答えになっていないので、${kijunAge}歳になる年から`
        + '12か月分が入るものとして計算しています。';
    }
    /**
     * ★★★**⑳の年が 12か月 の方の字は、まだ決まっていません**（★便でお尋ねしています・実測 0人）。
     *   ★見本は「◯か月分だけだからです」で、12か月の方には立ちません。
     */
    if (tsukisu >= 12) { tsukisuKata = 'nashi'; return null; }
    const t = p.tassuruTsuki(kijunAge);
    if (t === null) throw new Error('生まれた月日が在るのに、達する月が出ませんでした。');
    const m = Math.trunc(umare[0]), d = Math.trunc(umare[1]);
    const kaishiJi = tsukiJi(t + 1);
    /**
     * ★★★決め1139 …… **⑳の年に公的年金の支払が 0か月 の方**（★実測 1人／102・seed 226）。
     *   ★★11月生まれ・12月1日生まれの方は**12月分**から、12月生まれの方は**翌年1月分**から始まり、
     *     ★どちらも**その年には1か月分も届きません**（★偶数月に前月までの分をまとめて支払うため）。
     */
    if (tsukisu === 0) {
      /**
       * ★★★【2026-09-13・決め1151】**門** …… ★この字は「その分が支払われるのは翌年」と言い切ります。
       *
       * *   ★これが当たるのは、開始が**12月分**（11月生まれ・12月1日生まれ）か
       *     **翌年1月分**（12月生まれ）の**2通りだけ**です。
       * *   ★それ以外の月で 0か月 になったら、★★**字が嘘になります**ので、ここで止めます。
       * *   ★実測 …… 250人で1度も鳴っていません（★便に数を書きます）。
       */
      const hajimeM = Number(kaishiJi.replace('月', ''));
      if (hajimeM !== 12 && hajimeM !== 1) {
        throw new Error(
          `⑳の年の公的年金が0か月なのに、開始が${kaishiJi}分になっています。`
          + '0か月になるのは、開始が12月分か翌年1月分のときだけです（決め1151）。'
          + `生まれた月日は ${m}月${d}日です。`
          + '`tassuruTsuki()` と `nenkinShiharaiTsukisu()` の数え方を確かめてください。',
        );
      }
      tsukisuKata = 'koteki_zero_tsuki';
      return `あなたは${m}月${d}日生まれなので公的年金は${kaishiJi}分から始まりますが、`
        + `その分が支払われるのは翌年ですので、${kijunAge}歳になる年には公的年金が入りません。`;
    }
    /**
     * ★★**門** …… 「開始月から11月分まで」の月数が、`nenkinShiharaiTsukisu()` と合うこと。
     *   ★★★**前の回、ここが1か月ずれていました**（★`tsukiJi()` の覚え書き）。
     *   ★字と数が食い違ったら、その場で止めます。
     */
    const kaishiM = Number(kaishiJi.replace('月', ''));
    if (12 - kaishiM !== tsukisu) {
      throw new Error(
        `公的年金の開始月（${kaishiJi}分）から11月分までが ${12 - kaishiM}か月で、`
        + `\`nenkinShiharaiTsukisu()\` の ${tsukisu}か月 と合いません。`
        + '`tsukiJi()` の数え方を確かめてください。',
      );
    }
    return `公的年金が${kazu(A.k.koteki)}しかないのは、あなたが${kijunAge}歳になる年に`
      + `支払を受けるのが${tsukisu}か月分だけだからです。`
      + `あなたは${m}月${d}日生まれなので公的年金は${kaishiJi}分から始まり、`
      + 'しかも年金は偶数月に前月までの分をまとめて支払うので、'
      + 'その年に届くのは11月分までになります。';
  })();

  const mangakuBun = (() => {
    /**
     * ★★★決め1139 …… **公的年金が0円の方**（★実測 1人／102・seed 12）。
     *   ★「満額の**0円**が入るのは◯歳からです。」になってしまうためです。
     *   ★★★**`null` にしません** …… ★975行の段落には `koteki_tsukisu_bun`（★決め1137(9)の字）も
     *     在りますので、★`null` にすると**段落ごと落ちて、その字も消えます**（★決め1136の家族）。
     */
    if (kotekiGaku === 0) return '満額になる年はありません。';
    // ★決め1049⑤ の字（★はじめの年から満額が入る方）
    if (tsukisu >= 12) return 'はじめの年から満額が入ります。';
    if (mangakuAge === null) return null;
    // ★決め1136(7) …… （ ）の割り算を外しました
    return `満額の${en(kotekiGaku)}が入るのは${mangakuAge}歳からです。`;
  })();

  const ijou65 = p.nenrei1231(y0) >= 65;
  const kubunShita = ijou65 ? A.k.nenkinShunyu < KUBUN_65IJOU_1 : A.k.nenkinShunyu < KUBUN_65MIMAN_1;

  /**
   * ★★`{a_kokuho_bun}`・`{a_jumin_bun}` は、★**見本が2行**です
   *   （`<span class="hito" data-na="a_kokuho_bun">0円<br>超えない</span>`）。
   * ★★★**`<br>` は返しません**（★決め850・決め1137(11)）── ★**改行**を返します。
   *   ★`ScreenBlocks.tsx` が、セルの中の改行を行に分けて出します（★2026-09-05・イ）。
   */
  const koeruJi = (gaku: number, kijun: number) =>
    `${en(gaku)}\n${gaku > kijun ? '超える' : '超えない'}`;

  return {
    dasu: true,
    setai_kubun: setaiKubun,
    hikazei_gendo: hikazeiGendo,
    ideco_zandaka: en(idecoGen.shunyu),
    koteki_kaishi_age: `${kijunAge}歳`,
    handan_a_bun: handanA,
    handan_b_bun: handanB,
    handan_c_bun: handanC,
    keigen_koeru_bun: koeruBun,
    keigen_kokuho_bun: kokuhoBun,
    jumin_koeru_bun: juminBun,
    gyou_nashi: gyouNashi,
    an_a_bun: `${nensuA}年で受け取る`,
    an_b_bun: `${nensuB}年で受け取る`,
    sakaime_1: en(kijun7),
    sakaime_2: en(kijun5),
    sakaime_3: en(kijun2),
    hantei_age: `${kijunAge}歳`,
    an_a_nensu: `${nensuA}年`,
    an_b_nensu: `${nensuB}年`,
    koteki_tsukisu: `${tsukisu}か月`,
    // ★★決め1135 …… 表の金額にも円を付けました（★14か所）
    a_koteki: kazu(A.k.koteki),
    b_koteki: kazu(B.k.koteki),
    a_ideco: kazu(A.ideco),
    b_ideco: kazu(B.ideco),
    a_shunyu_kei: kazu(A.k.nenkinShunyu),
    b_shunyu_kei: kazu(B.k.nenkinShunyu),
    hantei_nenkin_kojo_kubun: kojoKubunJi(ijou65, A.k.nenkinShunyu),
    /**
     * ★★★**年金収入が0円の方は、控除も区分も存在しません**（★`shotokuKumitate()` が `null`）。
     *   ★★決め1136「表のセルの中の印を `null` にしない」に従い、★**0円**を返します
     *     ── ★★この表は「計算の順番のまま並べた」表で、★**引く額が無い年は 0円 が事実**です。
     *   ★（★画面11の `nenkin_kojo` は `null` のままです ── ★あちらは「存在しない」を出す形の決めです）
     */
    a_nenkin_kojo: enHiku(A.k.nenkin_kojo ?? 0),
    b_nenkin_kojo: enHiku(B.k.nenkin_kojo ?? 0),
    /**
     * ★決め1136(4) …… **誰にも値を返します**（★決め1049③を差し替え）。
     *   ★雑所得が0円の方「0円より下がりません」／0円でない方「公的年金等控除を引いた残りです」
     *   ★A案とB案のどちらかが0円なら、0円の側の字を出します（★見本の方は A＝0円・B＝650,001円）。
     */
    zatsu_chu: Math.min(A.k.zatsu, B.k.zatsu) === 0
      ? '0円より下がりません' : '公的年金等控除を引いた残りです',
    a_zatsu: kazu(A.k.zatsu),
    b_zatsu: kazu(B.k.zatsu),
    a_kyuyo: kazu(A.k.kyuyo),
    b_kyuyo: kazu(B.k.kyuyo),
    a_koujo15: enHiku(koujo15(A)),
    b_koujo15: enHiku(koujo15(B)),
    a_hantei_shotoku: en(hantei(A, kijunAge)),
    b_hantei_shotoku: en(hantei(B, kijunAge)),
    koteki_tsukisu_bun: tsukisuBun,
    mangaku_bun: mangakuBun,
    kokuho_kijun: en(kijun7),
    a_kokuho_bun: koeruJi(hantei(A, kijunAge), kijun7),
    b_kokuho_bun: koeruJi(hantei(B, kijunAge), kijun7),
    /** ★住民税の非課税は**合計所得金額**で見ます（★`sakaimeList()` の `hikazei` と同じ・決め1131） */
    a_jumin_bun: koeruJi(A.k.sougou, hikazeiGaku),
    b_jumin_bun: koeruJi(B.k.sougou, hikazeiGaku),
    shirabeta: {
      ...shirabetaKara,
      kyuyo_a: A.k.kyuyo, kyuyo_b: B.k.kyuyo,
      wariai_a: wA, wariai_b: wB, wariai_c: wC,
      keigen_sagaru: keigenSagaru, jumin_hajimaru: juminHajimaru, jumin_a_kazei: juminAKazei,
      zatsu_a: A.k.zatsu, zatsu_b: B.k.zatsu,
      kubun_shita: kubunShita,
      mangaku_age: mangakuAge,
      tsukisu_bun_kata: tsukisuKata,
      /** ★表の足し算（★雑所得 ＋ 給与所得 ＋ 65歳以上の15万円 ＝ 判定所得） */
      hyo_au_a: A.k.zatsu + A.k.kyuyo + koujo15(A) === hantei(A, kijunAge),
      hyo_au_b: B.k.zatsu + B.k.kyuyo + koujo15(B) === hantei(B, kijunAge),
    },
  };
}
