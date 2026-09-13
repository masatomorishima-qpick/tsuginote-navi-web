/**
 * lib/retirement/pro/gamen9shosaiBun.ts
 *   ── 画面9詳細の **42種類**（★戦術Cowork `senjutsu_20260913f.md` 4-3・**回4**）
 *
 * 【ここは「エンジン側」です。画面側に式を持たせないための本です】
 *   ★分岐も式も字も、ぜんぶここに在ります。`Screens912.tsx` は**受け取って渡すだけ**です。
 *   ★★**既定値を作りません。**★要るものは、ぜんぶ呼ぶ側から渡してください。
 *
 * 【もとにした決め】
 *   ★決め1046 …… A案 ＝ 跨がない いちばん長い年数（＝ ⑳ − 受け取り始める年齢）／B案 ＝ その1年上。
 *                 出す相手は `⑳ − 受け取り始める年齢` が **5以上19以下**の方
 *   ★決め1049②③⑤ …… `setai_kubun` に級地／`zatsu_chu` は0円の方だけ／満額の年が無い方の字
 *   ★決め1055 …… 914行の見出しから結論を外した（★`{nenkin_gen}`を受け取る年数と、`{koteki_kaishi_age}`の年の保険料）
 *   ★決め1058 …… 975行の文1・文2を1つの印 `koteki_tsukisu_bun` に。月日が分からない方には別の字
 *   ★決め1130(2) …… 額を言い切る固定の字は、数えると当たらない
 *   ★決め1131 …… 住民税の非課税は `hikazeiGendo(級地, 扶養)` で判定する
 *
 * ──────────────────────────────────────────────────────────
 * ★★★【この回で `null` にした6種類 ── 字が決まっていません】
 *
 *   (1) `handan_a_bun`・`handan_b_bun`・`handan_c_bun`（★917行の3文）
 *       ★決め1043(2)「正本は `sakaime.ts` の `koka` にします。**ただし `koka` の字を、戦術は
 *         まだ読んでいません**」／★決め1048「**残るのは917行の3文だけ**です」。
 *       ★★**まだ決まっていませんので、こちらでは決めません**（★決め1126・1127と同じ進め方）。
 *
 *   (2) `keigen_a`・`keigen_b`・`keigen_c`
 *       ★★★**1つの名前が、同じ画面で2つの意味に使われています。**
 *         ・917行／warn箱の箇条書き …… **その方のA案・B案・満額の年の軽減割合**
 *         ・破線の箇条書き　　　　　 …… **7割・5割・2割という3つの段**（★`sakaime_1`〜`3` と対）
 *       ★見本の方は A＝7割・B＝5割・満額の年＝2割で、★**たまたま2つの意味が同じ字**になります。
 *       ★★こちらでは決めません。★数は `shirabeta.keigen_onaji` に在ります。
 * ──────────────────────────────────────────────────────────
 */

import * as E from './engine';
import * as S from './sakaime';
import * as Z from './zeisei';

/** 円の表記（★`gamen10Bun.ts`・`gamen11Bun.ts` と同じ形） */
const en = (n: number) => `${n.toLocaleString('en-US')}円`;

/**
 * ★★★**出す相手**（★決め1046）。`⑳ − 受け取り始める年齢` が **5以上19以下**の方。
 *   ★5未満だとA案が `build()` に無く、20以上だとB案が無い（★`engine.ts` の `k <= 20`）。
 */
export const NENSU_MIN = 5, NENSU_MAX = 19;

/**
 * 公的年金等控除の**収入の区分**（所得税法35条4項の表）。
 *
 * ★★**`zeisei.ts` の `nenkinShotoku()` が使っている境目と同じ数**です。
 *   ★★★**ずれたら止まる門を、下の `kojoKubunJi()` に置いています**（★同じ数を2か所に置くためです）。
 */
const KUBUN_65IJOU_1 = 3_300_000;
const KUBUN_65MIMAN_1 = 1_300_000;
const KUBUN_2 = 4_100_000, KUBUN_3 = 7_700_000, KUBUN_4 = 10_000_000;

/**
 * `{hantei_nenkin_kojo_kubun}` の字。見本は「**65歳以上・330万円以下**」。
 *
 * ★★★**見本に在るのは、いちばん下の段の字だけ**です。★上の段の字は、★**見本と同じ形**
 *   （「◯歳以上／未満・◯◯万円以下」）で作っています ── ★戦術Coworkにお尋ねしています（★便）。
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
 *   ★`nenkinShotoku()` は「その段のいちばん上の額」と「その1円上」で、★**引く額の形が変わります**。
 *   ★この本が読み込まれたときに、1度だけ回ります。
 */
{
  /**
   * ★★控除の額は**境目でつながっています**（★段の上と下で同じ額）。★変わるのは**傾き**です。
   *   ★ですので「1万円ふえたときに、控除がいくらふえるか」を、境目の下と上で比べます。
   */
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

/** 画面9詳細の 42種類（★`{nenkin_gen}` は `atai912()` がすでに持っています） */
export interface Bun9shosai {
  /**
   * ★★★**その方に画面9詳細を出すか**（★決め1046）。
   *   ★`false` のとき、下の42種類は**ぜんぶ `null`** です（★かたまりは落ちます）。
   *   ★★**「出さない」を決めるのは、ここではありません**（★呼ぶ側・画面の道筋です）。
   */
  dasu: boolean;

  // ── 見出し・囲み（★917行の3文は `null`。上の覚え書き(1)）
  koteki_kaishi_age: string | null;
  handan_a_bun: string | null;
  handan_b_bun: string | null;
  handan_c_bun: string | null;
  keigen_a: string | null;
  keigen_b: string | null;
  keigen_c: string | null;

  // ── 図の凡例と、破線の箇条書き
  an_a_bun: string | null;
  an_b_bun: string | null;
  sakaime_1: string | null;
  sakaime_2: string | null;
  sakaime_3: string | null;

  // ── 保険料判定所得の表（1本目）
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
  a_koujo15: string | null;
  b_koujo15: string | null;
  a_hantei_shotoku: string | null;
  b_hantei_shotoku: string | null;

  // ── 表の下の文
  koteki_tsukisu_bun: string | null;
  mangaku_bun: string | null;
  ideco_zandaka: string | null;

  // ── どの基準を超えるかの表（2本目）
  kokuho_kijun: string | null;
  a_kokuho_bun: string | null;
  b_kokuho_bun: string | null;
  setai_kubun: string | null;
  hikazei_gendo: string | null;
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
    /** A案・B案が `build()` の中に見つかったか */
    an_a_atta: boolean;
    an_b_atta: boolean;
    /** ⑳の年に支払を受ける公的年金の月数 */
    koteki_tsukisu: number;
    /** ⑥の月日をお答えになっているか */
    umare_ari: boolean;
    /** ⑳の年の給与所得（★表に行がありません） */
    kyuyo: number;
    /** A案・B案の 軽減割合（7・5・2・0）と、満額の年の軽減割合 */
    keigen_a: number | null;
    keigen_b: number | null;
    keigen_c: number | null;
    /** ★破線の箇条書きの読み（7→5→2）と、その方のA・B・満額の年が**同じ**か */
    keigen_onaji: boolean;
    /** A案・B案の 雑所得 */
    zatsu_a: number;
    zatsu_b: number;
    /** 公的年金等控除の収入の区分が、見本と同じ「いちばん下の段」か */
    kubun_shita: boolean;
    /** `mangaku_bun` の当て（★満額 × 月数 ÷ 12 が、その年の公的年金と合うか） */
    mangaku_atta: boolean;
    /** 満額が入り始める年齢（★無ければ `null`） */
    mangaku_age: number | null;
  };
}

/** ★ぜんぶ `null` の戻り（★出す相手でない方・決め1046） */
function karappo(shirabeta: Bun9shosai['shirabeta']): Bun9shosai {
  return {
    dasu: false,
    koteki_kaishi_age: null, handan_a_bun: null, handan_b_bun: null, handan_c_bun: null,
    keigen_a: null, keigen_b: null, keigen_c: null,
    an_a_bun: null, an_b_bun: null, sakaime_1: null, sakaime_2: null, sakaime_3: null,
    hantei_age: null, an_a_nensu: null, an_b_nensu: null, koteki_tsukisu: null,
    a_koteki: null, b_koteki: null, a_ideco: null, b_ideco: null,
    a_shunyu_kei: null, b_shunyu_kei: null, hantei_nenkin_kojo_kubun: null,
    a_nenkin_kojo: null, b_nenkin_kojo: null, zatsu_chu: null,
    a_zatsu: null, b_zatsu: null, a_koujo15: null, b_koujo15: null,
    a_hantei_shotoku: null, b_hantei_shotoku: null,
    koteki_tsukisu_bun: null, mangaku_bun: null, ideco_zandaka: null,
    kokuho_kijun: null, a_kokuho_bun: null, b_kokuho_bun: null,
    setai_kubun: null, hikazei_gendo: null, a_jumin_bun: null, b_jumin_bun: null,
    shirabeta,
  };
}

/** 表の中の数（★円を付けません。★見本が「916,666」です） */
const kazu = (v: number) => v.toLocaleString('en-US');
/** 引く数（★見本は「−1,100,000」。★マイナスは U+2212・0のときは「0」） */
const hiku = (v: number) => (v === 0 ? '0' : `−${Math.abs(v).toLocaleString('en-US')}`);

/**
 * 通し月数から「◯月」を作る（★`engine.ts` の `ym()` と同じ数え方）。
 *   ★`ym(y, m) = y * 12 + (m - 1)`。
 */
const tsukiNo = (tsu: number) => (tsu % 12) + 1;

/**
 * ★★★画面9詳細の 42種類を作ります。
 *
 * @param moto        その方（★入力のまま）
 * @param R           `build()` の戻り（★A案・B案をここから探します）
 * @param plan        いま見せている案（★一覧で選んだ行の案・決め1030）
 * @param idecoName   iDeCo等の支給源の名前（★案の名前から拾ったもの）
 * @param hihokensha      国民健康保険の被保険者数（★呼ぶ側が決めて渡します。既定値ではありません）
 * @param kyuyoShotokusha 給与所得者等の数（★同じく、呼ぶ側が決めて渡します）
 */
export function gamen9shosaiBun(
  moto: E.Jinbutsu, R: readonly [E.Plan, E.EvalResult][], plan: E.Plan,
  idecoName: string, hihokensha: number, kyuyoShotokusha: number,
): Bun9shosai {
  /**
   * ★★★**⑳の軸を、その案のものに差し替えます**（★`gamen11Bun.ts` と同じ形）。
   *   ★`build()` が `evaluate()` に渡したのと同じ人物で数えないと、公的年金の額がずれます。
   */
  const p = (plan.nenkin_kaishi_age === null || plan.nenkin_kaishi_age === moto.koteki_kaishi_age)
    ? moto : moto.withKotekiKaishiAge(plan.nenkin_kaishi_age);
  const kijunAge = p.koteki_kaishi_age;

  /** iDeCo等を受け取り始める年（★年金の案なら `nenkin_kaishi_nen`・一時金なら `uketori_nen`） */
  const kaishiNen = (plan.nenkin_gen === idecoName && plan.nenkin_kaishi_nen !== null)
    ? plan.nenkin_kaishi_nen : plan.uketori_nen[idecoName];
  if (kaishiNen === undefined) {
    throw new Error(`いま見せている案に、${idecoName} を受け取る年が在りません。`);
  }
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
    koteki_tsukisu: tsukisu, umare_ari: p.umare !== null, kyuyo: 0,
    keigen_a: null, keigen_b: null, keigen_c: null, keigen_onaji: false,
    zatsu_a: 0, zatsu_b: 0, kubun_shita: false, mangaku_atta: false, mangaku_age: null,
  };
  if (planA === null || planB === null) return karappo(shirabetaKara);

  // ── ⑳の年の、A案とB案の所得 -------------------------------------------------
  /** ★退職所得は、合計にも区分にも入れません（★`shotokuJoukyou()` と同じ置き方・E-15） */
  const toshi = (pl: E.Plan) => {
    const nen = E.nenkinByYear(p, pl);
    return { ideco: nen[y0] ?? 0, k: E.shotokuKumitate(p, y0, nen[y0] ?? 0, 0, 0) };
  };
  const A = toshi(planA), B = toshi(planB);

  /**
   * ★★「65歳以上の15万円」で**引かれた額**。
   *   ★★★**式をここに書きません** ── ★`keigenHanteiShotoku()` が出した数との**差**で出します
   *     （★§同じ式を2か所に書かない）。
   */
  const hantei = (t: typeof A) => S.keigenHanteiShotoku(kijunAge, t.k.zatsu, t.k.kyuyo);
  const koujo15 = (t: typeof A) => hantei(t) - (t.k.zatsu + t.k.kyuyo);

  // ── 軽減の割合（★`keigen_a`〜`c` は `null` にします。上の覚え書き(2)） -------
  const mangakuAge = (() => {
    for (let a = kijunAge; a <= kijunAge + 2; a++) {
      if (p.nenkinShiharaiTsukisu(p.year(a)) === 12) return a;
    }
    return null;
  })();
  const wariai = (t: typeof A) => S.keigenWariai(hantei(t), hihokensha, kyuyoShotokusha);
  const wariaiC = (() => {
    if (mangakuAge === null) return null;
    const yM = p.year(mangakuAge);
    const nenA = E.nenkinByYear(p, planA), nenB = E.nenkinByYear(p, planB);
    const kA = E.shotokuKumitate(p, yM, nenA[yM] ?? 0, 0, 0);
    const kB = E.shotokuKumitate(p, yM, nenB[yM] ?? 0, 0, 0);
    const wA = S.keigenWariai(S.keigenHanteiShotoku(mangakuAge, kA.zatsu, kA.kyuyo),
      hihokensha, kyuyoShotokusha);
    const wB = S.keigenWariai(S.keigenHanteiShotoku(mangakuAge, kB.zatsu, kB.kyuyo),
      hihokensha, kyuyoShotokusha);
    return wA === wB ? wA : null;   // ★A案とB案で違う方は、1つの字にできません（★決め1049④）
  })();

  // ── 破線の3つの境目（★`sakaimeList()` から取ります。★額を写しません） ------
  const list = S.sakaimeList(hihokensha, kyuyoShotokusha, p.kyuchi, p.fuyouKei());
  const gakuOf = (key: string) => {
    const s = list.find((x) => x.key === key);
    if (!s) throw new Error(`\`sakaimeList()\` に ${key} が在りません。`);
    return s.gaku;
  };
  const kijun7 = gakuOf('keigen7'), kijun5 = gakuOf('keigen5'), kijun2 = gakuOf('keigen2');
  const hikazeiGaku = gakuOf('hikazei');

  // ── 975行の2つの文（★決め1058） ---------------------------------------------
  const mangaku = p.kotekiGaku();
  /** ★見本の字の割り算（★満額 × 月数 ÷ 12）が、その年の公的年金と合うか */
  const mangakuAtta = A.k.koteki === Math.trunc((mangaku * tsukisu) / 12);

  const tsukisuBun = (() => {
    const umare = p.umare;
    if (umare === null) {
      // ★決め1058 の字（★そのまま）
      return `あなたは生まれた月日をお答えになっていないので、${kijunAge}歳になる年から`
        + '12か月分が入るものとして計算しています。';
    }
    /**
     * ★★★**12か月の方の字は、決まっていません。**
     *   ★見本の文1は「支払を受けるのが**5か月分だけ**だからです」で、★12か月の方には当たりません。
     *   ★決め1058 が字を書いているのは「月日が分からない方」だけです。★こちらでは決めません。
     */
    if (tsukisu >= 12) return null;
    const t = p.tassuruTsuki(kijunAge);
    if (t === null) throw new Error('生まれた月日が在るのに、達する月が出ませんでした。');
    const m = Math.trunc(umare[0]), d = Math.trunc(umare[1]);
    return `公的年金が${kazu(A.k.koteki)}円しかないのは、あなたが${kijunAge}歳になる年に`
      + `支払を受けるのが${tsukisu}か月分だけだからです。`
      + `あなたは${m}月${d}日生まれなので公的年金は${tsukiNo(t + 1)}月分から始まり、`
      + 'しかも年金は偶数月に前月までの分をまとめて支払うので、'
      + 'その年に届くのは11月分までになります。';
  })();

  const mangakuBun = (() => {
    // ★決め1049⑤ の字（★はじめの年から満額が入る方）
    if (tsukisu >= 12) return 'はじめの年から満額が入ります。';
    if (mangakuAge === null || !mangakuAtta) return null;   // ★見本の割り算が合わない方
    return `満額の${en(mangaku)}が入るのは${mangakuAge}歳からです`
      + `（${kazu(A.k.koteki)}円 ＝ ${kazu(mangaku)}円 × ${tsukisu}か月 ÷ 12か月`
      + '・1円未満は切り捨て）。';
  })();

  // ── iDeCo等の残高（★年金で受け取る額の合計） --------------------------------
  const idecoGen = p.gens.find((g) => g.name === idecoName);
  if (!idecoGen) throw new Error(`${idecoName} が、その方の支給源に在りません。`);

  const ijou65 = p.nenrei1231(y0) >= 65;
  const kubunShita = ijou65 ? A.k.nenkinShunyu < KUBUN_65IJOU_1 : A.k.nenkinShunyu < KUBUN_65MIMAN_1;

  /**
   * ★★`{a_kokuho_bun}`・`{a_jumin_bun}` は、★**見本が2行**です
   *   （`<span class="hito" data-na="a_kokuho_bun">0円<br>超えない</span>`）。
   * ★★★**`<br>` は返しません**（★決め850「字の飾りは画面の持ちもの」）── ★**改行**を返します。
   *   ★`ScreenBlocks.tsx` が、セルの中の改行を行に分けて出します（★2026-09-05・イ）。
   */
  const koeruJi = (gaku: number, kijun: number) =>
    `${en(gaku)}\n${gaku > kijun ? '超える' : '超えない'}`;

  const wA = wariai(A), wB = wariai(B);
  return {
    dasu: true,
    koteki_kaishi_age: `${kijunAge}歳`,
    // ★★★917行の3文 …… 字が決まっていません（★決め1043(2)・決め1048）
    handan_a_bun: null, handan_b_bun: null, handan_c_bun: null,
    // ★★★1つの名前が2つの意味 …… こちらでは決めません（★上の覚え書き(2)）
    keigen_a: null, keigen_b: null, keigen_c: null,
    an_a_bun: `${nensuA}年で受け取る`,
    an_b_bun: `${nensuB}年で受け取る`,
    sakaime_1: en(kijun7),
    sakaime_2: en(kijun5),
    sakaime_3: en(kijun2),
    hantei_age: `${kijunAge}歳`,
    an_a_nensu: `${nensuA}年`,
    an_b_nensu: `${nensuB}年`,
    koteki_tsukisu: `${tsukisu}か月`,
    a_koteki: kazu(A.k.koteki),
    b_koteki: kazu(B.k.koteki),
    a_ideco: kazu(A.ideco),
    /**
     * ★★★**見本が2通りあります** …… 表は「833,335」（円なし）・975行の文は「833,335円」（円つき）。
     *   ★1つの名前ですので、★**どちらか1つ**しか出せません。★**円つき**にしました
     *     ── ★文の中で円が落ちると、55〜65歳の方に「833,335」とだけ出ます。
     *   ★★表の他の行は円なしですので、★**表の中でこの行だけ円が付きます**。
     *   ★★★戦術Coworkにお尋ねしています（★便）。
     */
    b_ideco: en(B.ideco),
    a_shunyu_kei: kazu(A.k.nenkinShunyu),
    b_shunyu_kei: kazu(B.k.nenkinShunyu),
    hantei_nenkin_kojo_kubun: kojoKubunJi(ijou65, A.k.nenkinShunyu),
    a_nenkin_kojo: A.k.nenkin_kojo === null ? null : hiku(A.k.nenkin_kojo),
    b_nenkin_kojo: B.k.nenkin_kojo === null ? null : hiku(B.k.nenkin_kojo),
    /**
     * ★決め1049③ …… **0円の方にだけ出します**。★0でない方は `null`（★かたまりごと落ちます）。
     *   ★A案とB案のどちらかが0円なら出します（★見本の方は A＝0円・B＝650,001円で、出ています）。
     */
    zatsu_chu: Math.min(A.k.zatsu, B.k.zatsu) === 0 ? '0円より下がりません' : null,
    a_zatsu: kazu(A.k.zatsu),
    b_zatsu: kazu(B.k.zatsu),
    a_koujo15: hiku(koujo15(A)),
    b_koujo15: hiku(koujo15(B)),
    // ★★★こちらも見本が2通り（表は「0」・977行の文は「0円」）。★同じ理由で円つきにしました
    a_hantei_shotoku: en(hantei(A)),
    b_hantei_shotoku: en(hantei(B)),
    koteki_tsukisu_bun: tsukisuBun,
    mangaku_bun: mangakuBun,
    ideco_zandaka: en(idecoGen.shunyu),
    kokuho_kijun: en(kijun7),
    a_kokuho_bun: koeruJi(hantei(A), kijun7),
    b_kokuho_bun: koeruJi(hantei(B), kijun7),
    /**
     * ★★★**扶養がいらっしゃる方の字は、決まっていません。**
     *   ★見本は「単身・1級地」で、★★限度額は `hikazeiGendo(級地, 扶養)`（★下の `hikazei_gendo`）です。
     *   ★扶養がいらっしゃる方（★実測 125人／250・50.0%）に「単身」と出すと、
     *     ★★**字と額が合いません**（★級地1・扶養1人なら 1,010,000円）。
     *   ★★決め1130(2)と同じ形です ── ★こちらでは決めません。
     */
    setai_kubun: p.fuyouKei() === 0 ? `単身・${p.kyuchi}級地` : null,
    hikazei_gendo: en(hikazeiGaku),
    /** ★住民税の非課税は**合計所得金額**で見ます（★`sakaimeList()` の `hikazei` と同じ・決め1131） */
    a_jumin_bun: koeruJi(A.k.sougou, hikazeiGaku),
    b_jumin_bun: koeruJi(B.k.sougou, hikazeiGaku),
    shirabeta: {
      ...shirabetaKara,
      kyuyo: A.k.kyuyo,
      keigen_a: wA, keigen_b: wB, keigen_c: wariaiC,
      keigen_onaji: wA === 7 && wB === 5 && wariaiC === 2,
      zatsu_a: A.k.zatsu, zatsu_b: B.k.zatsu,
      kubun_shita: kubunShita,
      mangaku_atta: mangakuAtta,
      mangaku_age: mangakuAge,
    },
  };
}
