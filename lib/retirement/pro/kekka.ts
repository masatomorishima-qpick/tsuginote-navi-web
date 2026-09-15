/**
 * lib/retirement/pro/kekka.ts — 有料版の計算を1回まわして、行に置く `kekka` を組む（A-2a-2）
 *
 * ★★ここは「呼ぶ順番」だけです。**式は1つも持ちません**（§2の3「画面に出す数字と分岐はエンジン側」）。
 *   `toJinbutsu()` → `nenkinKouho()` → `E.build()`（⑳軸）→ `zenToori()` → `gamen8(…, { d })` → `gamen8Bun()` → `Hitogoto13`
 *
 * ★決め（senjutsu_20260902ad.md 2番・ae.md 3番・af.md 4番の2）
 *   ・`build()` の `taishokuNen` は **⑥の生年＋⑤**（`Kumitate.taishokuNen`）。`genzaiNen`（今年・口が受け取った時刻の年）は**別の数**
 *   ・★`R`（157MB）と `D` は `kekka` に**入れません**。サーバーの中で使い切ります
 *   ・`Hitogoto13` は `{ ari:true, …8値 } | { ari:false }`。★**縮めた期間**（`keika` に `minashi_kikan !== null`）が無ければ `ari:false`
 *   ・★縮めた期間があるのに8値のどれかが null → 例外（口は 422）。黙って出しません
 *   ・★`zenToori()` の3つ目は **`kumitate.taishokuNen`（受け取る年）**。`gamen8()` の2つ目は **`genzaiNen`（今年・④A用）**。
 *     ★★この2つを混ぜないでください（senjutsu_20260902ah.md 1番）
 *   ・★`hitogoto13` の `ari` は「`minashi_kikan !== null` の年がある」ときだけ（A-2a2・al.md 1番）
 *
 * ★`server-only` を付けます（口だけが読みます。ブラウザには入れません）。
 */

import 'server-only';
import * as E from './engine';
import { toJinbutsu, ichijikinOnly, HEIKYU_WARIAI, type PaidInput } from './paidInput';
import { gamen8, zenToori, type Gamen8, type Row } from './gamen8';
import { gamen8Bun } from './gamen8Bun';
import { ichiranMatome } from './ichiran';
import type { Hitogoto13 } from '@/components/retirement/pro/gamen13Bun';
import type { Kekka } from './kekkaKata';
export type { Kekka } from './kekkaKata';

/** 計算の戻り。★`R`・`D` は口の中だけで使い、行にも返りにも入れません */
export type Keisan = {
  p: E.Jinbutsu;
  taishokuNen: number;
  R: [E.Plan, E.EvalResult][];
  D: Row[];
  g8: Gamen8;
  kekka: Kekka;
  /**
   * ★★★【2026-09-15・決め1231】⑰（お住まいの級地）を**省いてお答えになったか**（★決め1056）。
   *   ★`toJinbutsu()` がすでに返しているものを、そのまま運びます（★ここで判じ直しません）。
   *   ★★Excel シート4の「計算の全ステップ」が、★`setaiNoJi()` に渡します。
   */
  kyuchiHabuita: boolean;
  /** かかった時間（ms・build／zenToori／gamen8） */
  ms: { build: number; zenToori: number; gamen8: number };
};

const TAI_NAME = '退職金';
const IDECO_NAME = 'iDeCo等';

const en = (n: number): string => `${n.toLocaleString('en-US')}円`;

/**
 * 画面13の「その方によって変わる行」の8値（`gamen13Bun.ts` の注記のとおり・判断ログ82）。
 * ★**縮めた期間が無い**（`minashi_kikan === null`）方は `{ ari:false }`。
 *
 * 【2026-09-03・A-2a2（senjutsu_20260902al.md 1番）】拾う条件を **`minashi_kikan !== null`** にしました。
 *   ★`engine` は「みなし期間が 0 年」のとき、期間を持ちません（`engine.ts` 536行）。
 *   ★★ですので条件は「**その行を画面に書けるか（期間があるか）**」そのものになります。
 *   ★（それまでは `minashi_nensu >= 1` でした。★`senjutsu_20260902ah.md` 4番の1 の理由は取り下げられています）
 */
export function hitogoto13WoTsukuru(p: E.Jinbutsu, R: [E.Plan, E.EvalResult][]): Hitogoto13 {
  // ★どの案でも「縮め」は同じ年に同じ形で起きます（前の支給源と就職の日は入力で決まる）。★最初の案の keika を見ます
  const r = R[0]?.[1];
  if (!r) throw new Error('受け取り方が1つもありません');
  // ★型にも「期間がある」と伝えます（`minashi_kikan` を下で読むため。★式ではありません）
  const kikanAri = (x: E.KeikaRow): x is E.KeikaRow & { minashi_kikan: [number, number] } =>
    x.minashi_kikan !== null;
  const k = r.keika.find(kikanAri);
  if (!k) return { ari: false };
  // ★★ここは「あるはずのものが無い」を止める門です（「出さない」は上の1行で決まっています）
  if (k.shunyu_mae === null || k.kojo_mae === null || k.minashi_nensu === null) {
    throw new Error('画面13：縮めた期間があるのに、前に受け取った額・控除・縮めた年数のどれかが null です');
  }
  const ide = p.gens.find((g) => g.name === IDECO_NAME);
  if (!ide) throw new Error(`支給源「${IDECO_NAME}」がありません`);
  return {
    ari: true,
    maeGaku: en(k.shunyu_mae),
    maeKojo: en(k.kojo_mae),
    minashiNensu: `${k.minashi_nensu}年`,
    minashiKikan: `${E.ymLabel(k.minashi_kikan[0])}〜${E.ymLabel(k.minashi_kikan[1])}`,
    idecoKikan: `${E.ymLabel(ide.kikan[0])}〜${E.ymLabel(ide.kikan[1])}`,
    kasanariTsuki: `${k.kasanari_tsuki}か月`,
    kasanariNen: `${k.kasanari_nen}年`,
    genkaku: en(k.genkaku),
  };
}

/**
 * 有料版の計算を1回まわします。
 * @param genzaiNen 今年（★口が受け取った時刻の `tokyoYear`・呼び出し側から。既定値を作りません）
 * @param now 作った時刻（★呼び出し側から）
 */
export function keisan(v: PaidInput, genzaiNen: number, now: Date): Keisan {
  const kumitate = toJinbutsu(v);
  const p = kumitate.p;
  const nenkinAges = E.nenkinKouho(p, genzaiNen);

  let t0 = Date.now();
  /**
   * ⑨㉓【決め1106・2026-09-13・森嶋さんの承認あり】★★★**ここが抜けていました。**
   *
   *   `paidInput.ts` 213〜232行は、支給源を最大4本つくります
   *     ── ①退職金・③iDeCo等・**⑨企業年金**・**㉓役員退職慰労金**。
   *   ★ところが、ここは `[TAI_NAME]`（＝「退職金」1本）だけを渡していました。
   *   ★`engine.ts` 1652行は、**渡された名前にしか受取年を入れません**
   *     （`for (const n of taishokuGenNames) baseUketori[n] = taishokuNen;`）。
   *   ★`engine.ts` 741〜742行は、**受取年の無い支給源を飛ばします**ので、
   *     ⑨と㉓は**退職所得に1円も入らず、税がかかりませんでした**。
   *   ★★ところが `engine.ts` 1347行は `p.gens` を**ぜんぶ**足して `uketori` を作り、
   *     1430行が `tedori = uketori − zei − tesuryo` としますので、
   *     ★★★**税を引かないまま、満額が手取りに入っていました。**
   *
   *   ★実測（`golden_heavy_20260906`・250人・910案）……
   *     ★⑨か㉓が在る方 **91人（36.4%）**。★その91人は**910案ぜんぶ**動きました。
   *     ★税の和 4,304,275,438円 → 8,119,715,657円（★手取りは同じ額だけ減ります）。
   *     ★1案あたりの税の差は **−123,498円 〜 +13,775,284円**（★向きは1つではありません）。
   *     ★⑨も㉓も無い方 **159人**は、**1円も動きません**（★渡す名前が `['退職金']` のままです）。
   *
   *   ★`ichijikinOnly()`（`paidInput.ts` 344行）は、この日まで**0か所から呼ばれていませんでした**。
   *   ★`p` は 90行の `const p = kumitate.p;` です（★戦術Coworkの便は `ichijikinOnly(kumitate.p)`。同じものです）。
   */
  const R = E.build(p, ichijikinOnly(p), IDECO_NAME, kumitate.taishokuNen, {
    heikyuWariai: [...HEIKYU_WARIAI],
    nenkinAges,
    genzaiNen,
    /**
     * ⑱【回1・1-1・2026-09-04】★★**ここが抜けていました。**
     *
     *   `PaidInput.nenkinKaisu`（画面7の⑱）は `toJinbutsu()` が `Kumitate.nenkinKaisu` に
     *   入れていましたが、**`build()` に渡していませんでした。**その結果、`Plan.nenkin_kaisu` は
     *   ずっと既定の 1 のままで、**利用者が「年6回」と選んでも手数料が変わりませんでした**
     *   （★給付事務手数料 440円／回。★実測で 41,216案のうち 40,960案が動き、
     *     手数料は最大 +96,800円・手取りは最大 −161,196円・`kaihatsu_20260904f.md` 3番）。
     *   ★`build()` 側で 1以上の整数でなければ止まります（既定値を作らない）。
     */
    nenkinKaisu: kumitate.nenkinKaisu,
  });
  const msBuild = Date.now() - t0;

  t0 = Date.now();
  // ★3つ目は「受け取る年（＝退職の年）」です。**今年ではありません**（senjutsu_20260902ah.md 1番）
  const D = zenToori(R, p, kumitate.taishokuNen, IDECO_NAME);
  const msZen = Date.now() - t0;

  t0 = Date.now();
  const g8 = gamen8(p, genzaiNen, R, {
    taishokuNen: kumitate.taishokuNen,
    taishokuAge: v.taishokuAge,
    taiName: TAI_NAME,
    idecoName: IDECO_NAME,
    d: D,
  });
  const msG8 = Date.now() - t0;

  // ★勤続年数は、エンジンが退職金の期間から数えたもの（所得税法の切り上げ・`kikanNensu`）。⑫を入れた方は⑫が優先されます
  const tai = p.gens.find((g) => g.name === TAI_NAME);
  if (!tai) throw new Error(`支給源「${TAI_NAME}」がありません`);
  const bun8 = gamen8Bun(g8, {
    taiName: TAI_NAME,
    idecoName: IDECO_NAME,
    taishokuAge: v.taishokuAge,
    kotekiAge: v.kotekiKaishiAge,
    kinzokuNensu: E.kikanNensu(tai.kikan[0], tai.kikan[1]),
    taiGaku: v.taishokukin,
    idecoGaku: v.ideco,
  });

  const hitogoto13 = hitogoto13WoTsukuru(p, R);

  // ★Screen8 の pattern は「カードの数」。★4つの見方が全部別の案に落ちると kado_su=4 になりえます（★便に書きます）
  const kado = g8.kado_su;
  const pattern: 1 | 2 | 3 = kado <= 1 ? 1 : kado === 2 ? 2 : 3;

  /**
   * ★★★一覧に出す件数。**基準HTMLの表が7行**ですので 7 です（★測った数。★既定値ではありません）。
   *   ★戦術Cowork `senjutsu_20260909b.md` 決め979 …… 「① 一覧 …… **7件**」。
   * ★★`ichiranMatome()` には、ここから渡します（★あちらでは決めません）。
   */
  const ICHIRAN_KENSU = 7;

  /**
   * ★★★入力の⑳（公的年金を受け取り始める年齢）。
   *   ★戦術Cowork `senjutsu_20260909h.md` 決め1000 …… **まとめた行の代表は、この年齢にいちばん近いもの**。
   * ★★`ichiranMatome()` には、ここから渡します（★あちらで既定値を作らないため）。
   */
  const NYURYOKU_AGE = p.koteki_kaishi_age;

  const kekka: Kekka = {
    v: 2,
    tsukutta: now.toISOString(),
    genzaiNen,
    taishokuNen: kumitate.taishokuNen,
    toorisu: R.length,
    pattern,
    gamen8: g8,
    bun8,
    hitogoto13,
    // ★★★一覧の8通り（★並び順4つ × 絞り込み①の入／切・決め989）。★口がここで作ります
    //   ★★行は (ウ) でまとめたあとのものです（★決め999・決め1000・決め1001）
    ichiran: ichiranMatome(D, ICHIRAN_KENSU, NYURYOKU_AGE),
  };
  return { p, taishokuNen: kumitate.taishokuNen, R, D, g8, kekka,
           kyuchiHabuita: kumitate.kyuchiHabuita,
           ms: { build: msBuild, zenToori: msZen, gamen8: msG8 } };
}

