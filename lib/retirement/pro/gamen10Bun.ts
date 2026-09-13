/**
 * lib/retirement/pro/gamen10Bun.ts ── 画面10の18種類のもと（★回3・戦術Cowork `senjutsu_20260913b.md`）
 *
 * 【この本がやること】
 *   ★`chart10.ts` の `data10()` が作った**年齢ごとの累計**から、★画面10の文が要る**数と字**を出します。
 *   ★★**図は作りません**（★図は `chart10.ts` が作り `Chart10.tsx` が描きます・決め1040）。
 *
 * 【この本がやらないこと】
 *   ★★**基準HTMLの字を、こちらで書き換えていません。**
 *   ★★★**決まっていない字を、こちらで作っていません**（★下の「★★★字が決まっていない3つ」）。
 *   ★★**既定値を作っていません。**★「いまの年」も年齢の範囲も、呼ぶ側から渡します。
 *
 * 【もとになった決め】
 *   ★決め1030 …… 画面10・11・12が見せる案は「一覧で選んだ案」（★選ぶ前は一覧の1行目）
 *   ★決め1037 …… ①が比べる2案 ＝ **基準案**（`gamen8.kijunAn()`）対 **選んだ案**
 *   ★決め1038 …… ②の比べ先は**その方の繰下げの上限**（`zeisei.kurisageJogenAge()`）／図の右端は**90歳**
 *   ★決め1047 …… ②は**比べる相手が在る方だけ**に出す／`oitsuku_bun` の字は**3つ**
 *   ★決め1070 …… `an_1_label`・`an_2_label` は **`Plan.label` そのまま**
 *
 * ★★★【字が決まっていない3つ ── 戦術Coworkにお尋ねしています】
 *   `sa_hajime_bun`・`gyakuten_bun`・`sa_saishu_bun` の3つは、**判断ログに決めが1つもありません**
 *   （★決め854「`_bun` は戦術が言葉を出すまで着手できない」）。
 *   ★★ですので、この本は **3つとも `null` を返します**（＝★その箱は`kumitate()` がかたまりごと落とします）。
 *   ★★★**字を、こちらで作りません。**★そのかわり、字を決めるのに要る**数**を `shirabeta` に入れて返します。
 *     ★（★決め1047 の `oitsuku_bun` も、開発が数を出してから戦術が字を決めた形です。★同じ順にします。）
 */

import * as Z from './zeisei';
import * as E from './engine';
import { data10, type Data10 } from './chart10';

/** 円の字（★`gamen11Bun.ts` と同じ形） */
const en = (n: number) => `${n.toLocaleString('en-US')}円`;

/** ★★図の右端（★決め1038 …… **寿命の見立てではなく、図の右端**です） */
export const AGE_MIGI = 90;

/** ★★★画面10の18種類のもと。★数は数のまま、字は字のまま返します */
export interface Bun10 {
  // ── この画面の前提の箱（★基準HTML 993行） -------------------------------
  /** ★`{ideco_kanyu_nensu}` …… `{nenkin_gen}` の加入期間（★所得税法の数え方＝1年未満は切り上げ） */
  ideco_kanyu_nensu: string;
  /** ★`{koteki_nenkin}` …… 公的年金の年額（★入力の⑭。★`p.koteki_nenkin`） */
  koteki_nenkin: number;
  // ── ① 退職金とiDeCo等の受け取り方（★基準HTML 1000行・1034行） -----------
  /** ★`{an_a}` …… 基準案の名前。★比べる相手が無い方は `null`（かたまりごと落ちます） */
  an_a: string | null;
  /** ★`{an_b}` …… 選んだ案の名前 */
  an_b: string | null;
  /** ★`{an_a_age}` …… ①の図の左端の年齢（★＝`ages[0]`） */
  an_a_age: string | null;
  /** ★★★字が決まっていません。★いまは必ず `null` を返します（上の覚え書き） */
  sa_hajime_bun: string | null;
  /** ★★★字が決まっていません。★いまは必ず `null` を返します */
  gyakuten_bun: string | null;
  /** ★★★字が決まっていません。★いまは必ず `null` を返します */
  sa_saishu_bun: string | null;
  /** ★`{sa_saishu}` …… ①の差が動かなくなったあとの額（★絶対値）。★②の箱に出ます */
  sa_saishu: number | null;
  // ── ② 公的年金を繰り下げると（★基準HTML 1037〜1085行） ------------------
  /** ★`{kurisage_age}` …… その方の繰下げの上限（★決め1038）。★相手が無い方は `null` */
  kurisage_age: string | null;
  /** ★`{an_1_label}` …… 選んだ案の `Plan.label` そのまま（★決め1070） */
  an_1_label: string | null;
  /** ★`{an_2_label}` …… 同じ受け取り方で⑳を上限にした案の `Plan.label` そのまま */
  an_2_label: string | null;
  /** ★`{ruikei_min}` …… 90歳までの累計の、全通りの最小（★帯の下のふち） */
  ruikei_min: number | null;
  /** ★`{ruikei_max}` …… 同じく最大（★帯の上のふち） */
  ruikei_max: number | null;
  /** ★`{kuuhaku_kaishi_age}` …… 繰り下げると公的年金が入らなくなる、はじめの年齢 */
  kuuhaku_kaishi_age: string | null;
  /** ★`{kuuhaku_owari_age}` …… 同じく終わりの年齢（★＝ 上限 − 1歳） */
  kuuhaku_owari_age: string | null;
  /** ★`{oitsuku_bun}` …… 決め1047の**3つの字**のどれか */
  oitsuku_bun: string | null;
  /** ★`{sa_90}` …… 90歳まで受け取った場合の差（★絶対値） */
  sa_90: number | null;
  // ── ★この本が見たもの（★当て・数えのために返します。★画面には出しません） ----
  shirabeta: {
    /** 図の年齢の範囲（★呼ぶ側から渡されたもの） */
    ages: number[];
    /** ①の相手（基準案）が在るか */
    kijun_ari: boolean;
    /** ★①の差 ＝ **基準案の累計 − 選んだ案の累計**（★年齢ごと） */
    sa_hajime: number | null;
    /** ★差の向きが変わる年齢（★変わらない方は `null`） */
    gyakuten_age: number | null;
    /** ★差が動かなくなる年齢 */
    kotei_age: number | null;
    /** ★差が動かなくなったあとの差（★符号つき） */
    sa_kotei: number | null;
    /** ★①の差が、どの年齢でも0か */
    sa_zero: boolean;
    /** ②の相手が在るか */
    kurisage_ari: boolean;
    /** ★②の相手が無い理由（★決め1047の(あ)(い)(う)） */
    kurisage_nashi: 'kouho1' | 'nyuryoku_jogen' | 'an_jogen' | null;
    /** ★②の追いつく年齢（★追いつかない方は `null`） */
    oitsuku_age: number | null;
    /** ★`oitsuku_bun` が3つのうちどれになったか */
    oitsuku_kata: 'oitsuku' | 'oitsukanai' | 'onaji' | 'hajime_kara' | null;
  };
}

/**
 * ★★★`Plan.label` から、先頭の「`{nenkin_gen}`を」と尻尾の「／公的年金を◯歳から」を外す。
 *
 * ★★**尻尾の外し方は `ichiran.ts` の `motoLab()` と同じ形**です ── ★その案の⑳の数で外します
 *   （★探さずに、その数で外す。★当てずっぽうで切りません）。
 * ★★★**この形が正しいかは、戦術Coworkにお尋ねしています**（★便の5節）。
 *   ★見本の字は「60歳で一時金」「60歳から5年の年金」で、★この形では「60歳で一時金」「60歳から年金5年」です。
 */
export function anJi(pl: E.Plan, idecoName: string): string {
  let s = pl.label;
  const atama = `${idecoName}を`;
  if (s.startsWith(atama)) s = s.slice(atama.length);
  if (pl.nenkin_kaishi_age !== null) {
    const shippo = `／公的年金を${pl.nenkin_kaishi_age}歳から`;
    if (s.endsWith(shippo)) s = s.slice(0, -shippo.length);
  }
  return s;
}

/** ★案の⑳（★`null` の案は、その方の入力の⑳です） */
const anAge = (pl: E.Plan, p: E.Jinbutsu): number =>
  pl.nenkin_kaishi_age ?? p.koteki_kaishi_age;

/**
 * ★★★画面10の18種類を作ります。
 *
 * @param p その方
 * @param R `build()` の戻り（★⑳を軸にしたもの）
 * @param plan **いま見せている案**（★決め1030 …… 一覧で選んだ案／選ぶ前は一覧の1行目）
 * @param kijunLab **基準案の `Plan.label`**（★`gamen8.kijunAn()` の `lab`）。
 *   ★★**在らない方は `null` を渡してください**（★`kijunAn()` が `null` を返す方 ＝ E-23）。
 * @param idecoName 年金で受け取る支給源の名前（★入力から）
 * @param ages 図の年齢の範囲（★**既定値を作りません**。★呼ぶ側から渡してください）
 */
export function gamen10Bun(
  p: E.Jinbutsu,
  R: [E.Plan, E.EvalResult][],
  plan: E.Plan,
  kijunLab: string | null,
  idecoName: string,
  ages: number[],
): Bun10 {
  if (!Array.isArray(ages) || ages.length < 2) {
    throw new Error('画面10の年齢の範囲（ages）が渡っていません。呼び出し側から渡してください（既定値を作らない）。');
  }
  for (let i = 1; i < ages.length; i++) {
    if (!Number.isInteger(ages[i]) || ages[i] !== ages[i - 1] + 1) {
      throw new Error(`画面10の年齢の範囲（ages）が1歳きざみの整数ではありません（${ages.join(',')}）。`);
    }
  }
  const ide = p.gens.find((g) => g.name === idecoName);
  if (!ide) throw new Error(`支給源「${idecoName}」がありません。画面10の加入期間が出せません。`);

  // ── ② 相手が在るか（★決め1038・決め1047） ------------------------------
  const jogen = Z.kurisageJogenAge(p.seinen, p.umare);
  const imaAge = anAge(plan, p);
  /** ★選んだ案と、⑳だけが違う案（★`Plan.label` の尻尾を外して突き合わせます） */
  const moto = anJi(plan, idecoName);
  const aite = R.find(([pl]) =>
    anAge(pl, p) === jogen && anAge(pl, p) !== imaAge && anJi(pl, idecoName) === moto) ?? null;
  /** ★⑳の候補が1つだけの方（★決め1047の(あ)） */
  const kouho = new Set(R.map(([pl]) => anAge(pl, p)));
  const kurisageNashi: Bun10['shirabeta']['kurisage_nashi'] =
    aite !== null ? null
      : kouho.size <= 1 ? 'kouho1'
      : p.koteki_kaishi_age >= jogen ? 'nyuryoku_jogen'
      : 'an_jogen';

  // ── 図のもと（★`data10()` は `Plan.label` で案を選びます） ---------------
  const erabu: string[] = [plan.label];
  if (kijunLab !== null && kijunLab !== plan.label) erabu.push(kijunLab);
  if (aite !== null) erabu.push(aite[0].label);
  const d: Data10 = data10(p, R, erabu, ages);
  const ru = (lab: string): Record<number, number> => {
    const x = d.sen.find((s) => s[0] === lab);
    if (!x) throw new Error(`図のもとに「${lab}」がありません`);
    return x[1];
  };
  const ruB = ru(plan.label);

  // ── ① 差（★基準案の累計 − 選んだ案の累計） ------------------------------
  const kijunAri = kijunLab !== null && kijunLab !== plan.label;
  let saHajime: number | null = null, gyakutenAge: number | null = null;
  let koteiAge: number | null = null, saKotei: number | null = null, saZero = false;
  if (kijunAri) {
    const ruA = ru(kijunLab as string);
    const sa: Record<number, number> = {};
    for (const a of ages) sa[a] = ruA[a] - ruB[a];
    saHajime = sa[ages[0]];
    saZero = ages.every((a) => sa[a] === 0);
    // ★向きが変わる年齢（★はじめの符号と違う符号が、はじめて出る年齢）
    const fu = (v: number) => (v > 0 ? 1 : v < 0 ? -1 : 0);
    const f0 = fu(saHajime);
    for (const a of ages) { if (fu(sa[a]) !== f0) { gyakutenAge = a; break; } }
    // ★差が動かなくなる年齢（★`v5/gamen10_chart.py` 326行の `kotei` と同じ数え方）
    koteiAge = ages.find((a) => ages.every((b) => b < a || sa[b] === sa[a])) ?? null;
    saKotei = koteiAge === null ? null : sa[koteiAge];
  }

  // ── ② 追いつく年齢（★決め1047） ----------------------------------------
  let oitsukuAge: number | null = null;
  let oitsukuKata: Bun10['shirabeta']['oitsuku_kata'] = null;
  let sa90: number | null = null, ruMin: number | null = null, ruMax: number | null = null;
  const migi = ages[ages.length - 1];
  ruMin = d.band[migi][0];
  ruMax = d.band[migi][1];
  if (aite !== null) {
    const ru2 = ru(aite[0].label);
    sa90 = Math.abs(ru2[migi] - ruB[migi]);
    /**
     * ★★★**「追いつく」は、いちど下がってから追いつくことです。**
     *   ★★はじめのうちは、どちらの案もまだ公的年金が入っていませんので、**累計が同じ**です。
     *     ★`ru2[a] >= ruB[a]` を素直に見ると、★★**その年で「追いつきました」と言ってしまいます**
     *       （★実測 seed 0 で「63歳で、64歳から受け取る場合の累計に追いつきます」と出ました）。
     *   ★ですので、★**はじめて差が付いた年**を見つけ、★そこから先で追いつく年齢をさがします。
     */
    const sa: Record<number, number> = {};
    for (const a of ages) sa[a] = ru2[a] - ruB[a];
    const hajime = ages.find((a) => sa[a] !== 0) ?? null;
    if (hajime === null) {
      oitsukuKata = 'onaji';
    } else if (sa[hajime] > 0) {
      /**
       * ★★★**はじめて差が付いた年から、繰り下げたほうが多い方**です。
       *   ★★決め1047の3つの字は、どれもこの方に当たりません（★「追いつく」も「追いつかない」も
       *     「1円も変わりません」も、当てはまりません）。★★**字を、こちらで作りません。**
       *   ★数は便に出します（★戦術Coworkにお尋ねしています）。
       */
      oitsukuKata = 'hajime_kara';
    } else {
      oitsukuAge = ages.find((a) => a > hajime && sa[a] >= 0) ?? null;
      oitsukuKata = oitsukuAge === null ? 'oitsukanai' : 'oitsuku';
    }
  }

  /** ★決め1047の3つの字 */
  const oitsukuBun = (): string | null => {
    if (oitsukuKata === null) return null;
    // ★★★決め1047に字がありません。★こちらで作りません（★便の5節）
    if (oitsukuKata === 'hajime_kara') return null;
    if (oitsukuKata === 'onaji') return '1円も変わりません';
    if (oitsukuKata === 'oitsukanai') {
      return `${migi}歳までには、${imaAge}歳から受け取る場合の累計に追いつきません`;
    }
    return `${oitsukuAge}歳で、${imaAge}歳から受け取る場合の累計に追いつきます`;
  };

  return {
    // ★所得税法施行令69条1項の数え方（★1年未満は切り上げ。★`engine.ts` 27行）
    ideco_kanyu_nensu: `${E.kikanNensu(ide.kikan[0], ide.kikan[1])}年`,
    koteki_nenkin: p.koteki_nenkin,
    an_a: kijunAri ? anJi(R.find(([pl]) => pl.label === kijunLab)![0], idecoName) : null,
    an_b: kijunAri ? anJi(plan, idecoName) : null,
    an_a_age: kijunAri ? `${ages[0]}歳` : null,
    /**
     * ★★★**字が決まっていませんので、`null` を返します**（★この本の冒頭の覚え書き）。
     *   ★★**こちらで字を作りません。**★数は `shirabeta` に入れてあります。
     */
    sa_hajime_bun: null,
    gyakuten_bun: null,
    sa_saishu_bun: null,
    sa_saishu: saKotei === null ? null : Math.abs(saKotei),
    kurisage_age: aite === null ? null : `${jogen}歳`,
    an_1_label: aite === null ? null : plan.label,
    an_2_label: aite === null ? null : aite[0].label,
    ruikei_min: ruMin,
    ruikei_max: ruMax,
    kuuhaku_kaishi_age: aite === null ? null : `${imaAge}歳`,
    kuuhaku_owari_age: aite === null ? null : `${jogen - 1}歳`,
    oitsuku_bun: oitsukuBun(),
    sa_90: sa90,
    shirabeta: {
      ages: [...ages],
      kijun_ari: kijunAri,
      sa_hajime: saHajime,
      gyakuten_age: gyakutenAge,
      kotei_age: koteiAge,
      sa_kotei: saKotei,
      sa_zero: saZero,
      kurisage_ari: aite !== null,
      kurisage_nashi: kurisageNashi,
      oitsuku_age: oitsukuAge,
      oitsuku_kata: oitsukuKata,
    },
  };
}

/** ★`{ruikei_min}`・`{ruikei_max}`・`{sa_90}`・`{sa_saishu}` の字（★円つき・`atai912()` から呼びます） */
export const enKa10 = (n: number | null): string | null => (n === null ? null : en(n));
