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
 *   ★決め1116 …… `sa_hajime_bun`・`gyakuten_bun`・`sa_saishu_bun` の字（★**その年に見た事実だけ**）
 *   ★決め1117 …… `an_a`・`an_b` は**尻尾を外さない**（★2案の⑳は違いえます）
 *   ★決め1122／1126／1127 …… `gyakuten_bun` の**5つの字**（★「入れ替わる」は正負が変わる年だけ）
 *   ★決め1118 …… `an_onaji_bun`（①の相手が無い方）／`sa_hajime_age`（★`an_a_age` から改名）／
 *   　　　　　　　図の**左端**は「2つの案のどちらかで、はじめてお金が入る年齢」
 *
 * ★★★【前の回に、字が決まっていなかった3つ】
 *   `sa_hajime_bun`・`gyakuten_bun`・`sa_saishu_bun` は、決めが1つも無いまま `data-mada` が外れました。
 *   ★★こちらは**字を作らず `null` を返し**、★字を決めるのに要る**数**を出しました
 *     （★決め854「`_bun` は戦術が言葉を出すまで着手できない」）。
 *   ★★★**2026-09-13・決め1116 で、戦術Coworkが字を決めました。**★いまはその字を返しています。
 *     ★見本の「そこから先は…**変わりません**」は **135人／226（59.7%）で当たらない**と数で出し、
 *       ★戦術Coworkが**字から外されました**（★90歳の時点の事実だけを言う形に）。
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
  /** ★`{an_b}` …… 選んだ案の名前（★1000行。★尻尾「／公的年金を◯歳から」を**残します**・決め1117(2)） */
  an_b: string | null;
  /**
   * ★★★`{an_b_mijikai}` …… **尻尾を外した**選んだ案の名前（★1037行・**決め1135(2)**）。
   *
   *   ★1037行は「どちらも`{nenkin_gen}`を`{an_b_mijikai}`にそろえて」で、
   *     ★★**②は公的年金の年齢を比べる節**ですので、★尻尾が入ると**同じ文の中に2つの年齢が並びます**。
   *   ★★`motoJi()` で作ります ── ★**突き合わせの鍵と同じ関数です**が、
   *     ★★★**これは画面に出す字**ですので、★決め1121（字と鍵を同じ関数にしない）に当たります。
   *     ★★戦術Coworkが決め1135(2)で「`motoJi()` の形」と書かれていますので、そのとおりにしました。
   *     ★**お尋ねしています**（★便）── ★鍵のほうを別の関数に分けるか、このままにするか。
   */
  an_b_mijikai: string | null;
  /**
   * ★`{sa_hajime_age}` …… ①の図の**左端の年齢**（★＝`ages[0]`）。
   *   ★★①の**見出しにも**出ます（★決め1119(B)）ので、★`null` のとき**見出しごと落ちます**。
   *   ★★★印の名前は `an_a_age` から `sa_hajime_age` に変わりました（★決め1118(6)）。
   */
  sa_hajime_age: string | null;
  /**
   * ★★★`{an_onaji_bun}` …… **①の相手（基準案）が無い方だけ**の1文（★決め1118(3)）。
   *   ★①の見出しの**上**に在りますので、★相手が在る方は `null` ＝ かたまりごと落ちます。
   */
  an_onaji_bun: string | null;
  /** ★決め1116 …… 左端の年齢の時点の差（★3つの字） */
  sa_hajime_bun: string | null;
  /** ★決め1116 …… 多い少ないが入れ替わるか（★1文まるごと・2つの字） */
  gyakuten_bun: string | null;
  /** ★決め1116 …… **90歳の時点**の差（★3つの字） */
  sa_saishu_bun: string | null;
  /** ★`{sa_saishu}` …… **90歳の時点**の差（★絶対値）。★②の箱（1085行）に出ます */
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
    /** ★90歳の時点の差（★符号つき）。★`sa_saishu_bun` と `sa_saishu` のもと */
    sa_migi: number | null;
    /** ★`sa_hajime_bun` が3つのうちどの字になったか */
    hajime_kata: 'moto' | 'onaji' | 'ima' | null;
    /** ★`gyakuten_bun` が**5つ**のうちどの字になったか（★決め1122・決め1126・決め1127） */
    gyakuten_kata: 'tsuki_irekawaru' | 'tsuki' | 'irekawaru' | 'irekawaranai' | 'sa_zero' | null;
    /** ★はじめの差が0の方の、**差が付きはじめる年齢**（★ほかの方は `null`） */
    tsuki_age: number | null;
    /** ★★はじめの差が0の方が、**差が付いたあと さらに正負が入れ替わる**年齢（★戦術Coworkのお尋ね） */
    tsuki_gyakuten_age: number | null;
    /** ★`sa_saishu_bun` が3つのうちどの字になったか */
    saishu_kata: 'ima' | 'moto' | 'onaji' | null;
    /** ★図の左端が、退職の年齢と違うか */
    hidari_chigau: boolean;
    /** ★図の左端をさがした範囲の、いちばん若い年齢 */
    hidari_moto: number;
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
 * ★★★`Plan.label` から、**先頭の「`{nenkin_gen}`を」だけ**を外す（★決め1070(2)と同じ形）。
 *
 * ★★★【2026-09-13・決め1117(2)】**尻尾（「／公的年金を◯歳から」）は外しません。**
 *   ★前は尻尾も外していました。★ところが `gamen8.ts` 92〜95行のとおり
 *     **基準案の⑳は入力の⑳・選んだ案の⑳はその案のもの**で、★**2案の⑳は違いえます**。
 *   ★★尻尾を外すと、★★★**⑳だけが違う2案が、同じ字になります**
 *     （★実測 …… golden 250人で1人／226・こちらが描いた方はまさにこの形で「61歳で一時金」が2つ並びました）。
 *   ★尻尾を残せば、⑳が違えば字も違います。
 */
export function anJi(pl: E.Plan, idecoName: string): string {
  const atama = `${idecoName}を`;
  return pl.label.startsWith(atama) ? pl.label.slice(atama.length) : pl.label;
}

/** ★案の⑳（★`null` の案は、その方の入力の⑳です） */
const anAge = (pl: E.Plan, p: E.Jinbutsu): number =>
  pl.nenkin_kaishi_age ?? p.koteki_kaishi_age;

/**
 * ★★**案どうしを突き合わせる鍵**（★画面に出す字ではありません）。
 *   ★`anJi()` からさらに尻尾（「／公的年金を◯歳から」）を外します ── ★`ichiran.ts` の `motoLab()` と同じ形で、
 *     ★**その案の⑳の数で外します**（★探さずに、その数で。★当てずっぽうで切りません）。
 *   ★これで「⑳だけが違う案」を見つけられます（★②の比べ先）。
 */
export function motoJi(pl: E.Plan, idecoName: string, p: E.Jinbutsu): string {
  const s = anJi(pl, idecoName);
  const shippo = `／公的年金を${anAge(pl, p)}歳から`;
  return s.endsWith(shippo) ? s.slice(0, -shippo.length) : s;
}

/** ★★決め1116 …… 3つの `_bun` の字（★戦術Coworkが決めた字を、そのまま置いています） */
const JI = {
  hajime: {
    moto: (x: number) => `くらべるもとのほうが ${en(x)} 多く手元にあります`,
    onaji: () => 'どちらも同じ額です',
    ima: (x: number) => `いま選んでいるほうが ${en(x)} 多く手元にあります`,
  },
  /**
   * ★★★【2026-09-13・決め1122】**3つになりました。**
   *   ★前は2つで、★**はじめの差が0の方（108人／226・47.8%）ぜんぶ**が
   *     「`{年齢}`歳で、多い少ないが**入れ替わります**」になっていました。
   *   ★★**同じ額だったものは「入れ替わり」ません。**
   *   ★★★「入れ替わる」は、★**正から負・負から正に変わる年だけ**を指します
   *     ── ★**0 は「まだ差が付いていない」**であって、多い少ないではありません。
   */
  gyakuten: {
    /**
     * ★★★【2026-09-13・決め1126】**5つめの字**。★はじめの差が0の108人のうち、
     *   ★★**103人（95.4%）が、差が付いたあと さらに正負が入れ替わって**いました。
     *   ★前の字（`tsuki`）だと「`{年齢}`歳から差が付きはじめて、90歳ではこちらが多い」としか言わず、
     *     ★★★**途中で多い少ないが入れ替わったことが、どこにも出ません**でした。
     */
    tsukiIrekawaru: (a: number, b: number) =>
      `${a}歳から差が付きはじめ、${b}歳で多い少ないが入れ替わります。`,
    tsuki: (a: number) => `${a}歳から、差が付きはじめます。`,
    irekawaru: (a: number) => `${a}歳で、多い少ないが入れ替わります。`,
    irekawaranai: () => 'そのあと、多い少ないが入れ替わることはありません。',
    /**
     * ★★★【決め1127】**0人でも、起きたときに黙って消える形を残しません。**
     *   ★前は `null` を返していました。★★すると1034行の箱が**かたまりごと落ち**、
     *     ★`sa_hajime_bun`（「どちらも同じ額です」）も `sa_saishu_bun`（「どちらも同じ額になります」）も
     *     ★★**いっしょに消え、「差が無い」ことすら画面に出なくなります**。
     *   ★実測 **0人／226**ですが、入力しだいで起こりえます（★決め1086と同じ形）。
     */
    saZero: () => 'どの年齢でも、差は付きません。',
  },
  saishu: {
    ima: (x: number) => `いま選んでいるほうが ${en(x)} 多くなります`,
    moto: (x: number) => `くらべるもとのほうが ${en(x)} 多くなります`,
    onaji: () => 'どちらも同じ額になります',
  },
} as const;

/** ★★決め1118(3) …… ①の相手が無い方だけの1文 */
const AN_ONAJI = 'あなたがいま選んでいる受け取り方は、くらべるもとと同じですので、'
  + 'ここでお見せする差はありません。';

/**
 * ★★★画面10の18種類を作ります。
 *
 * @param p その方
 * @param R `build()` の戻り（★⑳を軸にしたもの）
 * @param plan **いま見せている案**（★決め1030 …… 一覧で選んだ案／選ぶ前は一覧の1行目）
 * @param kijunLab **基準案の `Plan.label`**（★`gamen8.kijunAn()` の `lab`）。
 *   ★★**在らない方は `null` を渡してください**（★`kijunAn()` が `null` を返す方 ＝ E-23）。
 * @param idecoName 年金で受け取る支給源の名前（★入力から）
 * @param ageMigi 図の**右端**の年齢（★**既定値を作りません**。★呼ぶ側から `AGE_MIGI` を渡してください）。
 *   ★★★**左端は、この本が出します**（★決め1118(6)）── ★「2つの案のどちらかで、はじめてお金が入る年齢」。
 *     ★左端は案しだいで動きますので、呼ぶ側には出せません（★呼ぶ側は案を見ていません）。
 */
export function gamen10Bun(
  p: E.Jinbutsu,
  R: [E.Plan, E.EvalResult][],
  plan: E.Plan,
  kijunLab: string | null,
  idecoName: string,
  ageMigi: number,
): Bun10 {
  if (!Number.isInteger(ageMigi)) {
    throw new Error('画面10の図の右端（ageMigi）が渡っていません。呼び出し側から渡してください（既定値を作らない・決め1038）。');
  }
  const ide = p.gens.find((g) => g.name === idecoName);
  if (!ide) throw new Error(`支給源「${idecoName}」がありません。画面10の加入期間が出せません。`);

  // ── ② 相手が在るか（★決め1038・決め1047） ------------------------------
  const jogen = Z.kurisageJogenAge(p.seinen, p.umare);
  const imaAge = anAge(plan, p);
  /**
   * ★選んだ案と、**⑳だけが違う案**（★突き合わせは `motoJi()`＝尻尾も外した字で）。
   *
   * ★★★【2026-09-13・気づいたこと】決め1117(2)で `anJi()` の尻尾を外すのをやめたとき、
   *   ★ここも `anJi()` で突き合わせていたため、★★**②の相手が1人も見つからなくなりました**
   *     （★描いて気づきました ── `kurisage_ari` が true から false に変わりました）。
   *   ★★**画面に出す字**（`anJi()`・尻尾あり）と、**案どうしを突き合わせる鍵**（`motoJi()`・尻尾なし）は、
   *     ★別のものです。★`ichiran.ts` の `motoLab()` と同じ形にしました。
   */
  const moto = motoJi(plan, idecoName, p);
  const aite = R.find(([pl]) =>
    anAge(pl, p) === jogen && anAge(pl, p) !== imaAge && motoJi(pl, idecoName, p) === moto) ?? null;
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
  const erabuPl = erabu.map((lab) => {
    const x = R.find(([pl]) => pl.label === lab);
    if (!x) throw new Error(`build() の戻りに「${lab}」がありません`);
    return x;
  });

  /**
   * ★★★【決め1118(6)】**図の左端は「2つの案のどちらかで、はじめてお金が入る年齢」**です。
   *
   *   ★前は「退職の年齢」でした。★ところが `{nenkin_gen}` を**退職の年より前に**受け取る案や、
   *     ★公的年金を**繰り上げて**受け取る案では、★★**左端より前の差が見えません**。
   *
   *   ★★★**さがす範囲（下の `moto`）は、思い込みで置きません。**★お金が入りうる年は、
   *     ★(1)その案が退職手当等を受け取る年（`plan.uketori_nen`）
   *     ★(2)その案の公的年金がはじまる年齢（⑳）
   *     ★(3)その案の `{nenkin_gen}` の年金がはじまる年（`nenkin_kaishi_nen`）
   *     ★の3つしかありませんので、**その最小**から数えます（★`engine.ts` の `evaluate()` のとおり）。
   *   ★★**退職の年は (1) に入っています** …… `engine.ts` 1652行が、一時金で受け取る支給源
   *     ぜんぶに退職の年を入れますので、`uketori_nen` に必ず在ります（★額が0円の支給源も同じです）。
   */
  const kouhoAge: number[] = [];
  for (const [pl] of erabuPl) {
    kouhoAge.push(anAge(pl, p));
    for (const y of Object.values(pl.uketori_nen)) kouhoAge.push(p.age(y));
    if (pl.nenkin_kaishi_nen !== null) kouhoAge.push(p.age(pl.nenkin_kaishi_nen));
  }
  /** ★退職の年齢（★`{nenkin_gen}` いがいの支給源の受取年。★`engine.ts` 1652行のとおり、みな同じ年です） */
  const taiNen = Object.entries(plan.uketori_nen).find(([n]) => n !== idecoName)?.[1] ?? null;
  const taiAge = taiNen === null ? null : p.age(taiNen);
  const motoAge = Math.min(...kouhoAge);
  if (!(motoAge < ageMigi)) {
    throw new Error(`画面10の図の左端（${motoAge}歳）が右端（${ageMigi}歳）より若くありません。`);
  }
  const kouhoAges = Array.from({ length: ageMigi - motoAge + 1 }, (_, i) => motoAge + i);
  const d0: Data10 = data10(p, R, erabu, kouhoAges);
  /** ★★その年に、どれかの案でお金が入ったか（★`data10()` の3つめ＝その年の額） */
  const haitta = (a: number) => d0.sen.some((x) => (x[2][a] ?? 0) !== 0);
  const hidari = kouhoAges.find(haitta) ?? motoAge;
  const ages = kouhoAges.filter((a) => a >= hidari);

  const d: Data10 = d0;
  const ru = (lab: string): Record<number, number> => {
    const x = d.sen.find((s) => s[0] === lab);
    if (!x) throw new Error(`図のもとに「${lab}」がありません`);
    return x[1];
  };
  const ruB = ru(plan.label);

  /**
   * ── ① 差 ＝ **くらべるもと（基準案）の累計 − いま選んでいる（選んだ案）の累計**
   *   ★決め1117(3) …… 基準HTML 1000行が、この向きを字にしています。
   */
  const kijunAri = kijunLab !== null && kijunLab !== plan.label;
  const migi = ages[ages.length - 1];
  let saHajime: number | null = null, gyakutenAge: number | null = null;
  let koteiAge: number | null = null, saKotei: number | null = null, saZero = false;
  let saMigi: number | null = null;
  let hajimeKata: Bun10['shirabeta']['hajime_kata'] = null;
  let gyakutenKata: Bun10['shirabeta']['gyakuten_kata'] = null;
  let tsukiAge: number | null = null, tsukiGyakutenAge: number | null = null;
  let saishuKata: Bun10['shirabeta']['saishu_kata'] = null;
  if (kijunAri) {
    const ruA = ru(kijunLab as string);
    const sa: Record<number, number> = {};
    for (const a of ages) sa[a] = ruA[a] - ruB[a];
    saHajime = sa[ages[0]];
    saMigi = sa[migi];
    saZero = ages.every((a) => sa[a] === 0);
    /**
     * ★★★【決め1122】**「入れ替わる」は、正から負・負から正に変わる年だけ**です。
     *   ★前は `fu(sa[a]) !== f0`（★**0も入れ替わりに数えていました**）。
     *   ★★0 は「まだ差が付いていない」であって、多い少ないではありません。
     */
    const fu = (v: number) => (v > 0 ? 1 : v < 0 ? -1 : 0);
    const f0 = fu(saHajime);
    if (f0 === 0) {
      // ★はじめの差が0の方 …… **差が付きはじめる年**をさがします
      tsukiAge = ages.find((a) => sa[a] !== 0) ?? null;
      if (tsukiAge !== null) {
        const f1 = fu(sa[tsukiAge]);
        tsukiGyakutenAge = ages.find((a) => a > (tsukiAge as number) && fu(sa[a]) === -f1) ?? null;
      }
    } else {
      gyakutenAge = ages.find((a) => fu(sa[a]) === -f0) ?? null;
    }
    // ★差が動かなくなる年齢（★`v5/gamen10_chart.py` 326行の `kotei` と同じ数え方）
    koteiAge = ages.find((a) => ages.every((b) => b < a || sa[b] === sa[a])) ?? null;
    saKotei = koteiAge === null ? null : sa[koteiAge];
    hajimeKata = saHajime > 0 ? 'moto' : saHajime < 0 ? 'ima' : 'onaji';
    gyakutenKata = f0 === 0
      ? (tsukiAge === null ? 'sa_zero'
        : (tsukiGyakutenAge === null ? 'tsuki' : 'tsuki_irekawaru'))
      : (gyakutenAge === null ? 'irekawaranai' : 'irekawaru');
    saishuKata = saMigi < 0 ? 'ima' : saMigi > 0 ? 'moto' : 'onaji';
  }

  // ── ② 追いつく年齢（★決め1047） ----------------------------------------
  let oitsukuAge: number | null = null;
  let oitsukuKata: Bun10['shirabeta']['oitsuku_kata'] = null;
  let sa90: number | null = null, ruMin: number | null = null, ruMax: number | null = null;
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
    // ★★★決め1135(2)（2026-09-13）…… 1037行は尻尾を外した字
    an_b_mijikai: kijunAri ? motoJi(plan, idecoName, p) : null,
    sa_hajime_age: kijunAri ? `${ages[0]}歳` : null,
    // ★★決め1118(3) …… 相手が在る方には出しません（★かたまりごと落ちます）
    an_onaji_bun: kijunAri ? null : AN_ONAJI,
    /**
     * ★★★決め1116 …… **3つとも「その年に見た事実」だけ**を書きます（★先のことを言いません）。
     *   ★前の見本の「そこから先は…**変わりません**」は、★**135人／226（59.7%）で当たりません**でした
     *     （★90歳まで差が動き続けます）。★戦術Coworkが字から外されました。
     */
    sa_hajime_bun: hajimeKata === null ? null
      : hajimeKata === 'onaji' ? JI.hajime.onaji()
      : JI.hajime[hajimeKata](Math.abs(saHajime as number)),
    /** ★★★決め1122・決め1126・決め1127 の**5つの字**（★`null` は①の相手が無い方だけ） */
    gyakuten_bun: gyakutenKata === null ? null
      : gyakutenKata === 'sa_zero' ? JI.gyakuten.saZero()
      : gyakutenKata === 'tsuki_irekawaru'
        ? JI.gyakuten.tsukiIrekawaru(tsukiAge as number, tsukiGyakutenAge as number)
      : gyakutenKata === 'tsuki' ? JI.gyakuten.tsuki(tsukiAge as number)
      : gyakutenKata === 'irekawaranai' ? JI.gyakuten.irekawaranai()
      : JI.gyakuten.irekawaru(gyakutenAge as number),
    sa_saishu_bun: saishuKata === null ? null
      : saishuKata === 'onaji' ? JI.saishu.onaji()
      : JI.saishu[saishuKata](Math.abs(saMigi as number)),
    /**
     * ★`{sa_saishu}`（1085行「①の`{sa_saishu}`とこの額を足し算しないでください」）は、
     *   ★★**`sa_saishu_bun` と同じ額**にしました（★どちらも**90歳の時点**の差）。
     *   ★前は「差が動かなくなったあとの額」でしたが、★決め1116で `sa_saishu_bun` が
     *     90歳の時点になりましたので、★**同じ画面に違う額を2つ出さない**ためにそろえます。
     */
    sa_saishu: saMigi === null ? null : Math.abs(saMigi),
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
      sa_migi: saMigi,
      hajime_kata: hajimeKata,
      gyakuten_kata: gyakutenKata,
      tsuki_age: tsukiAge,
      tsuki_gyakuten_age: tsukiGyakutenAge,
      saishu_kata: saishuKata,
      hidari_chigau: taiAge !== null && hidari !== taiAge,
      hidari_moto: motoAge,
      kurisage_ari: aite !== null,
      kurisage_nashi: kurisageNashi,
      oitsuku_age: oitsukuAge,
      oitsuku_kata: oitsukuKata,
    },
  };
}

/** ★`{ruikei_min}`・`{ruikei_max}`・`{sa_90}`・`{sa_saishu}` の字（★円つき・`atai912()` から呼びます） */
export const enKa10 = (n: number | null): string | null => (n === null ? null : en(n));
