/**
 * lib/retirement/pro/gamen11Bun.ts ── 画面11（あなたの税金の計算過程について）の**字のもと**を作る
 *
 * ★★★戦術Cowork `senjutsu_20260912e.md` 6-4 の **回2の16種類**です。
 *   ★決め1030（`an_bun`）・1033（保険料の2行）・1036(1)（`tai_hantei_bun`）・1042（`kyuyo`）
 *   ★1049⑥（`zatsu_zero_bun`）・1057＋1085 2-1（`nenkin_toshi_bun` の3つの字）
 *   ★1065（`jumin`・`jumin_hantei_bun`）・1066（`kojo_uchiwake`・`kojo_goukei`）
 *   ★1077（`kojo_shiki`）・1078（`shotokuzei_tai`・`jumin_taishoku`）・1086（`nenkin_nashi_bun`）
 *
 * 【なぜこの本を作ったか】
 *   ★★16のうち8つは**分岐の字**で、2つは**組み立てた字**です。
 *   ★★★§画面に出す数字と分岐は計算エンジン側に置く。実装側に式を持たせない ── ★ですので
 *      `Screens912.tsx` には置かず、`gamen12Bun.ts`・`gamen8Bun.ts` と**同じ形**で1本置きました。
 *
 * 【この本がやらないこと】
 *   ★★**基準HTMLの字を、こちらで書き換えていません。**★戦術Coworkが便に書いた字のとおりです。
 *   ★見せ方（`en()` で「円」を付けるなど）は `atai912()` がします。★ここは**数と字のもと**だけです。
 *   ★★**既定値を作っていません。**★「いまの年」も年齢も、呼ぶ側から渡します。
 *
 * 【★★★止め ── 戦術Coworkにお尋ねしている3つ】（★便に書きました）
 *   (1) `nenkin_toshi_bun` の**3つの字の順**と、字1の `{終了年齢}` の決め方
 *   (2) 保険料の判定の**給与所得者数**（★入力に欄が0か所・決め1059と同じ形）
 *   (3) `zatsu_zero_bun` の字（★給与所得が在る方にも「所得税はかかりません」と読めます）
 */

import * as Z from './zeisei';
import * as S from './sakaime';
import * as E from './engine';

/** ★画面11の年金の表が見る年齢の範囲（★`gamen8.ts` の `AGE_FROM`／`AGE_TO` と同じ 55〜100歳） */
export const AGE_FROM = 55, AGE_TO = 100;

/** 円の字（★3桁区切り＋「円」。★`gamenBun.en()` と同じ形ですが、こちらは `lib` 側です） */
const en = (n: number) => `${n.toLocaleString('en-US')}円`;
/** 万円の字（★式の中だけ。★「800万」「70万」「40万」） */
const man = (n: number) => `${n / 10_000}万`;

/** ★★★画面11の16種類のもと。★数は数のまま、字は字のまま返します */
export interface Bun11 {
  /** ★決め1030 …… いま見せている案の札（`plan.label`） */
  an_bun: string;
  // ── 退職金の表（★基準HTML 1111〜1115行・**退職の年**） -------------------
  /** ★決め1077 …… 退職所得控除の式（★本則＋減額＋最低保障＋障害加算を、在るものだけ並べた字） */
  kojo_shiki: string;
  /** ★決め1036(1) …… 「→ 控除に収まるので、あなたの退職所得」／「→ 控除を超えますので、…」 */
  tai_hantei_bun: string;
  /** ★決め1078 …… その退職所得にかかる所得税（★`KeikaRow.gensen_ari` ＝申告書を出した場合） */
  shotokuzei_tai: number;
  /** ★決め1078 …… その退職所得にかかる住民税（★その年に差し引かれます） */
  jumin_taishoku: number;
  // ── 年金の表（★基準HTML 1117〜1130行・**年金収入がはじめて0でなくなる年**・決め1085） ---
  /** ★決め1086 …… その年が1つも無い方だけの1文。★ほかの方は `null`（かたまりごと落ちます） */
  nenkin_nashi_bun: string | null;
  /** ★決め1057＋1085 2-1 …… 下の表がどの年のものかを言う1文（★3つの字） */
  nenkin_toshi_bun: string | null;
  /** ★決め1042 …… その年の給与所得 */
  kyuyo: number;
  /** ★決め1066 …… 所得控除の内わけ（★0円でない項目だけを、決まった順で「名前 額」／でつないだ字） */
  kojo_uchiwake: string;
  /** ★決め1066 …… 所得税の所得控除の合計 */
  kojo_goukei: number;
  /** ★決め1065 …… その年の所得にかかる住民税（★総合課税分・翌年度に納めます） */
  jumin: number;
  /** ★決め1065 …… 「→ あなたの合計所得が収まるので、翌年度に納める住民税」／「…超えるので、…」 */
  jumin_hantei_bun: string;
  /** ★決め1033 …… 国民健康保険の基礎控除（★全国共通の額） */
  kokuho_kiso: number;
  /** ★決め1033 …… 「→ あなたの保険料の判定に使う所得が収まるので」／「…超えるので」 */
  hoken_hantei_bun: string;
  /** ★決め1033 …… 「変わりません」／「上がる場合があります」 */
  hoken_kekka: string;
  /** ★決め1049⑥ …… 雑所得が0円の方だけの1文。★ほかの方は `null`（かたまりごと落ちます） */
  zatsu_zero_bun: string | null;
  // ── ★この本が見た年（★当て・数えのために返します。★画面には出しません） ----------
  shirabeta: {
    /** 退職金の表の年 */
    tai_nen: number;
    /** 年金の表の年（★その年が1つも無い方は `null`） */
    nenkin_nen: number | null;
    /** 年金の表の年の、公的年金の支払月数 */
    nenkin_tsukisu: number | null;
    /** `nenkin_toshi_bun` が3つのうちどの字になったか */
    toshi_bun_kata: 'onaji' | 'kubun' | 'zatsu' | 'tsukisu' | 'nashi';
    /** 字2・字3のとき、はじめて変わる年齢 */
    kawaru_age: number | null;
    /** 字1のとき、どの年も同じである最後の年齢 */
    owari_age: number | null;
    /** その年の雑所得 */
    zatsu: number;
    /** 軽減判定所得 */
    keigen_shotoku: number;
  };
}

/** ★決め1066 …… 項目の名前と順（★戦術Coworkが決めた順そのまま） */
const KOJO_NA: readonly [keyof E.KojoUchiwake, string][] = [
  ['kiso', '基礎控除'],
  ['shakai', '社会保険料控除'],
  ['kakekin', '小規模企業共済等掛金控除'],
  ['hoken', '生命保険料控除・地震保険料控除'],
  ['haigusha', '配偶者控除・配偶者特別控除'],
  ['fuyou', '扶養控除'],
  ['shogai', '障害者控除'],
  ['kafu', '寡婦控除'],
  ['hitorioya', 'ひとり親控除'],
];

/**
 * ★★★`{kojo_uchiwake}` ── **0円でない項目だけ**を、決め1066の順で「名前 額」と並べ、「／」でつなぐ。
 *
 * ★★項目が1つだけのときも同じ形です（★決め1066）。
 * ★★★**1つも無いことがあります**（★所得控除の合計が0円の方）。★そのときは空の字ではなく `null` を返します
 *   ── ★`kumitate()` は空の字を「入れ忘れ」として止めます（`gamenBun.ts` 237行）。
 */
export function kojoUchiwakeJi(u: E.KojoUchiwake): string | null {
  const xs = KOJO_NA.filter(([k]) => u[k] !== 0).map(([k, na]) => `${na} ${en(u[k])}`);
  return xs.length ? xs.join('／') : null;
}

/**
 * ★★★`{kojo_shiki}` ── 退職所得控除の式（★決め1077・5つの形）。
 *
 * ★本則 …… 20年超「800万＋70万×`{kojo_kasan_nensu}`年」／20年以下「40万×`{kojo_kasan_nensu}`年」
 * ★減額 …… 前に受け取った退職手当等で減る方は「− `{genkaku}`円（重複 `{kasanari_nen}`年）」
 * ★最低保障 …… 差し引いたあとが800,000円に満たない方は「→ 800,000円（最低保障）」
 * ★障害加算 …… 障害で退職された方は「＋ 1,000,000円（障害加算）」
 * ★勤続0年 …… 「0円（勤続年数が0年のため、控除はありません）」
 *
 * ★★★**`KeikaRow.kojo` を本則として読みません。**★あれは最低保障と障害加算を**すでに含んだ
 *   表示用の額**です（★開発Coworkが1度取り違え、障害の方31人で100万円を二重に数えました）。
 */
export function kojoShikiJi(k: E.KeikaRow): string {
  const atama = '退職所得控除 ';
  if (k.kojo_kubun === null) return `${atama}0円（勤続年数が0年のため、控除はありません）`;
  if (k.kojo_tanka === null || k.kojo_kasan_nensu === null) {
    throw new Error(`退職所得控除の区分が「${k.kojo_kubun}」なのに、単価か年数がありません。`);
  }
  const honsoku = (k.kojo_teigaku ?? 0) + k.kojo_tanka * k.kojo_kasan_nensu;
  {
    // ★★**本則が `Z.taishokuKojoHonsoku()` と1円でも違えば止めます**（★式を2か所に持たせないため）
    const hon = Z.taishokuKojoHonsoku(k.nensu);
    if (honsoku !== hon) {
      throw new Error(`退職所得控除の本則が合いません（4つから ${honsoku} ／ 本則 ${hon}）`);
    }
  }
  let ji = k.kojo_teigaku === null
    ? `${atama}${man(k.kojo_tanka)}×${k.kojo_kasan_nensu}年`
    : `${atama}${man(k.kojo_teigaku)}＋${man(k.kojo_tanka)}×${k.kojo_kasan_nensu}年`;
  if (k.genkaku > 0) ji += `　− ${en(k.genkaku)}（重複 ${k.kasanari_nen}年）`;
  if (honsoku - k.genkaku < Z.SAITEI_HOSHO) ji += `　→ ${en(Z.SAITEI_HOSHO)}（最低保障）`;
  if (k.shogai) ji += `　＋ ${en(Z.SHOGAI_KASAN)}（障害加算）`;
  return ji;
}

/** ★決め1057 の字1（★どの年も同じ方） */
const TOSHI_ONAJI = (kara: number, made: number) =>
  `下の表は、${kara}歳から${made}歳まで、どの年も同じです。`;
/** ★決め1057 の字2（★公的年金等控除の区分が変わる方） */
const TOSHI_KUBUN = (kara: number, kawaru: number) =>
  `下の表は${kara}歳の年のものです。${kawaru}歳から公的年金等控除の区分が変わり、雑所得も変わります。`;
/** ★決め1085 2-1 の字3（★はじめの年の公的年金が12か月分でない方） */
const TOSHI_TSUKISU = (kara: number, tsuki: number) =>
  `下の${kara}歳の年の公的年金は${tsuki}か月分だけですので、次の年から額が変わります。`;

/** ★決め1049⑥ の字（★雑所得が0円の方） */
const ZATSU_ZERO = 'あなたの場合、公的年金等控除だけで所得がなくなりますので、この年の所得税はかかりません。';

/** ★決め1086 の字（★年金として受け取る所得が1つも無い方） */
const NENKIN_NASHI = (nenkinGen: string) =>
  `あなたの公的年金の額を0円とお答えいただいており、${nenkinGen}も一時金でお受け取りになりますので、`
  + '年金として受け取る所得はありません。';

/** ★その年の年金の表に出るもの（★`nenkin_toshi_bun` の比べにも使います） */
function toshiSugata(p: E.Jinbutsu, nen: Record<number, number>, r: E.EvalResult, y: number) {
  const k = E.shotokuKumitate(p, y, nen[y] ?? 0, taiShotokuOf(r, y));
  return k;
}

/** ★その年の退職所得（★`keika` に行が無い年は 0 ── ★0は事実です。既定値ではありません） */
function taiShotokuOf(r: E.EvalResult, y: number): number {
  const k = r.keika.find((x) => x.year === y);
  return k ? k.shotoku : 0;
}
/** ★その年の掛金（★`detail` に行が無い年は 0 ── ★同じく事実です） */
function kakekinOf(r: E.EvalResult, y: number): number {
  return r.detail[y]?.kakekin ?? 0;
}

/**
 * ★★★画面11の16種類を作ります。
 *
 * @param p           その方
 * @param plan        いま見せている案（★一覧で選んだ行の案・決め1030）
 * @param r           その案の計算結果
 * @param taishokuAge ★⑤（退職の年齢）。★**呼ぶ側から渡します**（★既定値を作りません）
 * @param nenkinGen   年金で受け取る支給源の名前（★`{nenkin_nashi_bun}` の中に入ります）
 */
export function gamen11Bun(moto: E.Jinbutsu, plan: E.Plan, r: E.EvalResult,
                           taishokuAge: number, nenkinGen: string): Bun11 {
  /**
   * ★★★**⑳の軸を、その案のものに差し替えます**（★`build()` が `evaluate()` に渡したのと同じ形）。
   *
   * ★★★【2026-09-12・開発Coworkの誤り】★はじめは差し替えておらず、★**入力の⑳（65歳）のままで
   *   公的年金を数えていました**。★見本の方（案の札「公的年金を61歳から」）で**描いて目で見て**
   *   見つけました ── ★`nenkin_toshi_bun` が「下の**65歳**の年の…」と出ていました（★正しくは61歳）。
   * ★`kime1071.py`・`kime1081.py` では差し替えていたのに、★こちらでは落としていました。
   */
  const p = (plan.nenkin_kaishi_age === null
    || plan.nenkin_kaishi_age === moto.koteki_kaishi_age)
    ? moto : moto.withKotekiKaishiAge(plan.nenkin_kaishi_age);

  // ── 退職金の表 …… **退職の年**（★`{tai_age}` と同じ年です） -----------------
  const taiNen = p.year(taishokuAge);
  const k = r.keika.find((x) => x.year === taiNen);
  if (!k) {
    throw new Error(`退職の年（${taiNen}年・${taishokuAge}歳）の計算過程が \`keika\` にありません。`);
  }
  const taiU = E.nenkanZeiUchiwake(p, taiNen, r.detail[taiNen]?.ideco_nenkin ?? 0,
                                   k.shotoku, true, kakekinOf(r, taiNen));

  // ── 年金の表 …… **年金収入がはじめて0でなくなる年**（★決め1085の正本） -------
  const nen = E.nenkinByYear(p, plan);
  let nenkinNen: number | null = null;
  for (let a = AGE_FROM; a <= AGE_TO; a++) {
    const y = p.year(a);
    if ((nen[y] ?? 0) + p.kotekiByYear(y) > 0) { nenkinNen = y; break; }
  }
  /**
   * ★★★その年が1つも無い方（★実測 1人／250・0.4%・seed 12）── ★決め1086。
   *   ★**表は⑳の年の姿（0円）で出します**（★戦術Cowork「0円の表のまま残してかまいません」）。
   *   ★★`nenkin_toshi_bun` は `null` にします ── ★「下の表は◯歳の年のものです」と言える年が
   *     無いためです。★`null` は「その方には存在しない」で、かたまりごと落ちます。
   */
  const hyoNen = nenkinNen ?? p.year(p.koteki_kaishi_age);
  const j = toshiSugata(p, nen, r, hyoNen);
  const u = E.nenkanZeiUchiwake(p, hyoNen, nen[hyoNen] ?? 0, taiShotokuOf(r, hyoNen),
                                true, kakekinOf(r, hyoNen));
  const jo = E.shotokuJoukyou(p, hyoNen, nen[hyoNen] ?? 0, kakekinOf(r, hyoNen));

  // ── `nenkin_toshi_bun` …… 3つの字（★決め1057＋決め1085 2-1） -----------------
  const hyoAge = p.age(hyoNen);
  const tsukisu = nenkinNen === null ? null : p.tsukisuKara(p.koteki_kaishi_age, nenkinNen);
  /**
   * ★★**はじめの年のあと、公的年金等控除の区分と雑所得が変わる年**をさがします。
   *   ★★★**式を書いていません** …… ★`shotokuKumitate()` を年ごとに呼んで、**同じかどうかを見る**だけです。
   *   ★見る範囲は 55〜100歳（★`gamen8.ts` と同じ `AGES`）── ★公的年金は生涯続きますので、
   *     ★★**年金の表に「終わり」はありません。**★ですので「どの年も同じ」も100歳まで見ます。
   */
  let kawaruAge: number | null = null;
  let kawaruRiyu: 'kubun' | 'zatsu' | null = null;
  let owariAge = hyoAge;
  for (let a = hyoAge + 1; a <= AGE_TO; a++) {
    const y = p.year(a);
    const x = E.shotokuKumitate(p, y, nen[y] ?? 0, taiShotokuOf(r, y));
    if (x.nenkin_kojo_kubun !== j.nenkin_kojo_kubun) { kawaruAge = a; kawaruRiyu = 'kubun'; break; }
    if (x.zatsu !== j.zatsu) { kawaruAge = a; kawaruRiyu = 'zatsu'; break; }
    owariAge = a;
  }
  let toshiBun: string | null;
  let toshiKata: Bun11['shirabeta']['toshi_bun_kata'];
  if (nenkinNen === null) {
    toshiBun = null; toshiKata = 'nashi';
  } else if (tsukisu !== null && tsukisu !== 12 && p.kotekiByYear(nenkinNen) > 0) {
    // ★字3 …… はじめの年の公的年金が12か月分でない方（★決め1085 2-1）
    toshiBun = TOSHI_TSUKISU(hyoAge, tsukisu); toshiKata = 'tsukisu';
  } else if (kawaruAge !== null) {
    toshiBun = TOSHI_KUBUN(hyoAge, kawaruAge);
    toshiKata = kawaruRiyu === 'kubun' ? 'kubun' : 'zatsu';
  } else {
    toshiBun = TOSHI_ONAJI(hyoAge, owariAge); toshiKata = 'onaji';
  }

  // ── 保険料の2行（★決め1033） -------------------------------------------------
  /**
   * ★★★**給与所得者数を1人として計算しています**（★`sakaimeList()`・`keigenWariai()` の既定と同じ）。
   *   ★理由 …… ★入力（`paidInput.ts`）に**欄が0か所**で、渡せる数がありません。
   *   ★★★**これは決め1059（`check()` の食い違い）と同じ形です。**★戦術Coworkにお尋ねしています
   *     ── ★回2・回3では触らない（回4の前に直す）と決まっていますので、**同じ形で置いています**。
   */
  const keigen = S.keigenHanteiShotoku(hyoAge, jo.nenkin_zatsu, jo.kyuyo);
  const osamaru = S.keigenWariai(keigen, 1, 1) === 7;

  const uchiwakeJi = kojoUchiwakeJi(u.kojo_uchiwake);
  if (uchiwakeJi === null) {
    throw new Error(`所得控除が1つも0円でない項目を持ちません（${hyoNen}年・合計 ${u.kojo_goukei}円）。`);
  }

  return {
    an_bun: plan.label,
    kojo_shiki: kojoShikiJi(k),
    tai_hantei_bun: k.shotoku === 0
      ? '→ 控除に収まるので、あなたの退職所得'
      : '→ 控除を超えますので、あなたの退職所得',
    shotokuzei_tai: k.gensen_ari,
    jumin_taishoku: taiU.jumin_taishoku,
    nenkin_nashi_bun: nenkinNen === null ? NENKIN_NASHI(nenkinGen) : null,
    nenkin_toshi_bun: toshiBun,
    kyuyo: j.kyuyo,
    kojo_uchiwake: uchiwakeJi,
    kojo_goukei: u.kojo_goukei,
    jumin: u.jumin_sougou,
    jumin_hantei_bun: jo.hikazei
      ? '→ あなたの合計所得が収まるので、翌年度に納める住民税'
      : '→ あなたの合計所得が超えるので、翌年度に納める住民税',
    kokuho_kiso: S.KEIGEN_BASE,
    hoken_hantei_bun: osamaru
      ? '→ あなたの保険料の判定に使う所得が収まるので'
      : '→ あなたの保険料の判定に使う所得が超えるので',
    hoken_kekka: osamaru ? '変わりません' : '上がる場合があります',
    zatsu_zero_bun: j.zatsu === 0 ? ZATSU_ZERO : null,
    shirabeta: {
      tai_nen: taiNen, nenkin_nen: nenkinNen, nenkin_tsukisu: tsukisu,
      toshi_bun_kata: toshiKata,
      kawaru_age: kawaruAge, owari_age: toshiKata === 'onaji' ? owariAge : null,
      zatsu: j.zatsu, keigen_shotoku: keigen,
    },
  };
}
