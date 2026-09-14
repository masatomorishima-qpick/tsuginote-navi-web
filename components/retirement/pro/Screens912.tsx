/**
 * components/retirement/pro/Screens912.tsx ── 画面9・9詳細・10・11・12
 *
 * **オーナーの承認（2026-08-23）を受けて着手しました。**
 * 戦術Coworkの2026-08-22「**印が付いていて `data-mada` が無いところは、実装を始めていただけます**」。
 *
 * ──────────────────────────────────────────────────────────
 * 【出せたかたまり 37個／出せなかったかたまり 29個】★2026-09-07 に、1度描いて数え直しました
 *
 *   ★★この数は「読んで数えたもの」ではありません。**1度描いて数えたもの**です
 *     （`bin/kaihatsu/kaihatsu_20260907o.md`・判断ログ886番）。
 *   ★描いた人 …… ①1,850万円 ②33年 ③430万円 ④18年 ⑤61歳 ⑥1965年7月20日 ／ 今年 2026 ／
 *     受け取り方は `E.build()` の 36,225通りのうち**1つめ**（★一時金で受け取る案でした）。
 *   ★★★**受け取り方が変わると「出せなかった」の数は動きます**（★`gyouNashi` が効くため）。
 *     ★下の数は「この1人・この案」のものです。
 *
 *   ★かたまり（文・表・箇条書き）の単位で数えます。
 *     1つの文の途中だけを出すと、残った文が別の意味になります。
 *     3列のうち1列が空いた表は、読めるようで読めません。
 *     ですので**かたまりごと出さない**にしています（`gamenBun.ts`）。
 *
 *     画面9　　　 出せた 9個／出せなかった 2個／`MADA_NA` **4個**（`ideco_jogen_age` `an_label` `hoken_bun` `sa`）
 *     画面9 詳細　出せた 9個／出せなかった 12個／`MADA_NA` **43個**
 *     画面10　　　出せた 8個／出せなかった 8個／`MADA_NA` **23個**
 *     画面11　　　出せた 4個／出せなかった 5個／`MADA_NA` **12個**
 *     画面12　　　出せた 7個／出せなかった 2個／`MADA_NA` **3個**（`tai_age` `gensen_ritsu` `nenkin_kaishi_age`）
 *     ★足し算 …… 出せた **37個** ／ 出せなかった **29個** ／ `MADA_NA` の名前 **85個**
 *
 *   ★★★**前の頭は、印の数が5つとも違っていました**（★とくに画面12は、まるごと別の3つでした）。
 *     ★数は `gamen9.ts`〜`gamen12.ts` の `MADA_NA` が正です。★ここは写しですので、必ず古びます。
 *
 *   **見本の方の金額は、1つも画面に出ません。**
 *     ★★2026-09-07 に、描いたもので数えました …… 画面1の例（`rei1.ts` の `REI`）**16個**を探して、
 *     ★★★**出ていた 0個**。
 * ──────────────────────────────────────────────────────────
 *
 * 【文言は基準HTMLのままです】
 *   ここに文は1文字も書いていません。`gamen9.ts` 〜 `gamen12.ts` は
 *   `kensa/gamen_chushutsu.mjs` が基準HTML（164,458）から機械で作ったものです。
 */

'use client';

import * as E from '@/lib/retirement/pro/engine';
import type { IchiranGyou, IchiranMatome } from '@/lib/retirement/pro/ichiran';
import { ritsuJi } from '@/lib/retirement/pro/gamen12Bun';
import type * as E11 from '@/lib/retirement/pro/gamen11Bun';
import type * as E10 from '@/lib/retirement/pro/gamen10Bun';
import type * as E9S from '@/lib/retirement/pro/gamen9shosaiBun';
import { GAMEN9, MADA_NA as MADA9 } from './gamen9';
import { GAMEN9shosai, MADA_NA as MADA9S } from './gamen9shosai';
import { GAMEN10, MADA_NA as MADA10 } from './gamen10';
import { GAMEN11, MADA_NA as MADA11 } from './gamen11';
import { GAMEN12, MADA_NA as MADA12 } from './gamen12';
import { kumitate, en, enFu, type BlockKyotsu, type Kumi } from './gamenBun';
import ScreenBlocks from './ScreenBlocks';

/**
 * 5画面が使う、その方のもの。**エンジンが出したものだけ**を受け取ります。
 * **ここで計算しません。**
 */
export type Moto912 = {
  /** その方が選んでいる受け取り方の計算結果 */
  r: E.EvalResult;
  /**
   * その受け取り方。
   * ★★★**2026-09-09 …… この本の中では、いま1か所も使っていません。**
   *   ★`nenkin_kikan` を引いていた1か所（`atai912()`）を消したためです（★決め1023）。
   *   ★★**消していないのは、呼ぶ側がまだ画面12を繋いでいないからです**（★口は `Moto912` を作っていません）。
   *   ★繋ぐ回に、要るかどうかを数えてから決めます。
   */
  plan: E.Plan;
  /** 年金で受け取る支給源の名前（「iDeCo等」「小規模企業共済」など）。**入力から** */
  nenkinGen: string;
  /**
   * ★★★確定申告（所得税法121条3項）。**一時金を受け取る年ごと**・年の小さい順。
   *
   * ★エンジンの **`shinkokuIchiran(p, r)`** が出したものを、そのまま運びます
   *   （★戦術Cowork `senjutsu_20260908d.md` 決め904・`senjutsu_20260908b.md` 決め916・917）。
   * ★★**ここで `shinkokuIru()` を呼びません**（★§画面に出す数字と分岐は計算エンジン側に置く）。
   * ★★★**空の並びのことがあります**（★一時金を受け取る年が1つも無い方 …… 実測 6案／10,000案・0.1%）。
   * ★★**いちばん多くても2つ**です（★実測 …… 全通り 38,157通りで3つ以上は0案・決め925）。
   */
  shinkoku: E.ShinkokuGyou[];
  /**
   * ★★★画面9（一覧）の行。**エンジンの `ichiran(D, n)` が出したものを、そのまま運びます**
   *   （★戦術Cowork `senjutsu_20260909c.md` 4節・判断ログ980番）。
   * ★★**ここで並べ替えも絞り込みもしません**（★§画面に出す数字と分岐は計算エンジン側に置く）。
   * ★★★**7つに満たないことがあります**（★通り数が7未満の方）。★足りない行は `gyouNashi912()` が落とします。
   */
  ichiran: IchiranGyou[];
  /**
   * ★★★一覧の下の1文が使う数（★戦術Cowork 決め986・989）。
   *
   * ★`ichiranMatome` …… **いま選ばれている並び順・絞り込み**の組（★`kekka.ichiran` の8つから、親が1つ選んで渡します）。
   *   ★★**ここで選びません。★`Math.max`／`Math.min` も取りません**（★§画面に出す数字と分岐は計算エンジン側）。
   * ★`toorisu` …… `kekka.toorisu` をそのまま（★新しく作りません）。
   * ★`zenbuHaba` …… `kekka.gamen8.haba` をそのまま（★`gamen8.ts` 162行に既に在ります）。
   */
  ichiranMatome: IchiranMatome;
  toorisu: number;
  zenbuHaba: number;
  /**
   * ★★★画面12の4つ（★戦術Cowork `senjutsu_20260909l.md` 決め1022・1023・1025）。
   * ★★**どれも、ここでは作りません。**★エンジンが出したものを、そのまま受け取ります
   *   （★分岐と式は `lib/retirement/pro/gamen12Bun.ts` に在ります）。
   */
  /** `{tai_age}` のもと …… `kekka.gamen8.kijun.taishoku_age`（★`gamen8.ts` 56行・119行）＝画面7の**⑤** */
  taishokuAge: number;
  /** `{uketori_katachi}` …… `gamen12Bun.uketoriKatachi(plan)` の戻り（★「で」まで入っています） */
  uketoriKatachi: string;
  /**
   * `{gensen_ritsu}` のもと …… `gamen12Bun.gensenRitsu(nenbun)` の戻り。
   * ★★**百分率の100倍の整数**です（★20.42% ＝ `2042`）。★字にするのは下の `ritsuJi()` です。
   */
  gensenRitsu: number;
  /** `{nenkin_kaishi_age}` のもと …… その方が iDeCo等 を受け取り始める**年齢**（★`p.age(nenkinKaishiNen(...))`） */
  nenkinKaishiAge: number;
  /**
   * ★★★画面11の16種類（★戦術Cowork `senjutsu_20260912e.md` 6-4・**回2**）。
   * ★★**どれも、ここでは作りません。**★エンジンが出したものを、そのまま受け取ります
   *   （★分岐と式と字は `lib/retirement/pro/gamen11Bun.ts` に在ります）。
   * ★呼ぶ側は `E11.gamen11Bun(p, plan, r, taishokuAge, nenkinGen)` の戻りを、そのまま渡してください。
   */
  bun11: E11.Bun11;
  /**
   * ★★★画面10の18種類（★戦術Cowork `senjutsu_20260913b.md`・**回3**）。
   * ★★**どれも、ここでは作りません。**★エンジンが出したものを、そのまま受け取ります
   *   （★分岐と式と字は `lib/retirement/pro/gamen10Bun.ts` に在ります）。
   * ★呼ぶ側は `E10.gamen10Bun(p, R, plan, kijunLab, idecoName, ages)` の戻りを、そのまま渡してください。
   */
  bun10: E10.Bun10;
  /**
   * ★★★画面9詳細の44種類（★戦術Cowork `senjutsu_20260913g.md`・**回4の続き**）。
   * ★★**どれも、ここでは作りません。**★エンジンが出したものを、そのまま受け取ります
   *   （★分岐と式と字は `lib/retirement/pro/gamen9shosaiBun.ts` に在ります）。
   * ★呼ぶ側は `E9S.gamen9shosaiBun(p, R, plan, idecoName, 1, 1, kyuchiHabuita)` の戻りを、
   *   そのまま渡してください（★`kyuchiHabuita` は `toJinbutsu()` が返します・決め1056）。
   */
  bun9s: E9S.Bun9shosai;
};

/** ★当てはまらない理由の字（★6通り・戦術Cowork `senjutsu_20260908d.md` 4節。**こちらでは書きません**） */
const RIYU_BUN: Record<E.ShinkokuRiyu, string> = {
  あ: 'この決まりは、公的年金等を受け取っている年のためのものです。あなたのこの年は、公的年金等の受け取りが0円です',
  い: 'あなたの公的年金等が、その年に400万円を超えます',
  う: 'あなたの公的年金等以外の所得が、その年に20万円を超えます',
  あう: 'この決まりは、公的年金等を受け取っている年のためのものです。あなたのこの年は、公的年金等の受け取りが0円で、公的年金等以外の所得が20万円を超えます',
  いう: 'あなたの公的年金等が400万円を超え、公的年金等以外の所得も20万円を超えます',
};

/**
 * ★★`null` をそのまま通す `en()`。
 *   ★★**`null` は「その方には存在しない」**で、`kumitate()` がかたまりごと落とします。
 *   ★0円と `null` を取り違えないために、★**ここで 0 にしません**。
 */
const enKa = (n: number | null) => (n === null ? null : en(n));

/** ★説明の後半（★年があるとき／無いとき。★戦術Cowork `senjutsu_20260908d.md` 4節） */
const BUN_ARU = 'あなたが一時金を受け取る年ごとに、この決まりに当てはまるかどうかを見ました。';
const BUN_NASHI = 'あなたは、退職金やiDeCo等を一時金で受け取る年がありません。ですので、この決まりの判定はしていません。';

/**
 * `data-mada` の無い印に、エンジンの値を入れる。
 *
 * **`null` は「その方には存在しない」という意味です。0にしません**
 * （`kumitate()` が、そのかたまりを出さずに数えます）。
 */
export function atai912(m: Moto912): Record<string, string | null> {
  const t = m.r.tesuryo_uchiwake;
  if (!t) throw new Error('`evaluate()` が `tesuryo_uchiwake` を返していません。');
  const out: Record<string, string | null> = {
    // 画面10・画面9（表の中は `data-mada` があるので、実際には出ません）
    tedori: en(m.r.tedori),
    /**
     * 画面11（手数料の表）。
     *
     * **行を出すかどうかは `kyufu_gyou` / `koza_gyou` が決めます**（下の `gyouNashi912()`）。
     * ここでは値だけを作ります。**`null` のときも、いちおう文字にはしません。**
     */
    kyufu_kaisu: `${t.kyufu_kaisu}回`,
    kyufu_kei: en(t.kyufu_kei),
    koza_tanka: t.koza_tanka === null ? null : en(t.koza_tanka),
    koza_tsuki: t.koza_tsuki === null ? null : `${t.koza_tsuki}か月`,
    koza_kei: t.koza_kei === null ? null : en(t.koza_kei),
    tesuryo: en(t.kei),
    // 画面12
    nenkin_gen: m.nenkinGen,
    /**
     * ★★★画面12の4つ（★戦術Cowork `senjutsu_20260909l.md`）。
     * ★★**ここでは字にするだけです。**★分岐も式もありません（★`gamen12Bun.ts` に在ります）。
     * ★（★`nenkin_kikan` は消しました ── ★基準HTML 1141行が `{uketori_katachi}` に変わり、
     *    ★★`nenkin_kikan` の印は**基準HTMLに0か所**になりました・決め1023）
     */
    tai_age: `${m.taishokuAge}歳`,
    uketori_katachi: m.uketoriKatachi,
    gensen_ritsu: ritsuJi(m.gensenRitsu),
    nenkin_kaishi_age: `${m.nenkinKaishiAge}歳`,
    // ★★★確定申告の説明（★年が1つも無い方は、別の字になります）
    shinkoku_bun: m.shinkoku.length ? BUN_ARU : BUN_NASHI,
    /**
     * ★★★画面9（一覧）の下の1文（★戦術Cowork 決め986）。
     * ★`ichiran_kensu` …… 「7件」の形 ／ `toori_kazu` …… 「41,216通り」の形
     * ★★`ichiran_haba`・`zenbu_haba` …… ★**円を付けます**（★文の中に出るためです。★表の `sa` 列とは別・決め983(2)）
     */
    ichiran_kensu: `${m.ichiranMatome.kensu}件`,
    ichiran_haba: en(m.ichiranMatome.haba),
    toori_kazu: `${m.toorisu.toLocaleString('en-US')}通り`,
    zenbu_haba: en(m.zenbuHaba),
    /**
     * ★★★画面11の16種類（★戦術Cowork `senjutsu_20260912e.md` 6-4・**回2**）。
     *
     * ★★**ここでは字にするだけです。**★分岐も式もありません（★`gamen11Bun.ts` に在ります）。
     * ★★★**`null` は、そのまま渡します** …… ★「その方には存在しない」で、
     *   `kumitate()` がかたまりごと落とします（★`nenkin_nashi_bun`・`nenkin_toshi_bun`・`zatsu_zero_bun`）。
     *
     * ★★★**この16を繋いでも、画面11の表は2つとも落ちたままです**（★回2の姿）──
     *   ★退職金の表に `tai_gen`（回3）・年金の表に `setai_kubun`／`hikazei_gendo`（回4）が
     *   `data-mada` で残っているためです。★開発Coworkが**実際に `kumitate()` を回して**測りました
     *   （★16種類だけでも／24種類ぜんぶでも かたまり9・落ち3で**1つも変わりません**）。
     */
    an_bun: m.bun11.an_bun,
    kojo_shiki: m.bun11.kojo_shiki,
    tai_hantei_bun: m.bun11.tai_hantei_bun,
    shotokuzei_tai: en(m.bun11.shotokuzei_tai),
    jumin_taishoku: en(m.bun11.jumin_taishoku),
    nenkin_nashi_bun: m.bun11.nenkin_nashi_bun,
    nenkin_toshi_bun: m.bun11.nenkin_toshi_bun,
    kyuyo: en(m.bun11.kyuyo),
    kojo_uchiwake: m.bun11.kojo_uchiwake,
    kojo_goukei: en(m.bun11.kojo_goukei),
    jumin: en(m.bun11.jumin),
    jumin_hantei_bun: m.bun11.jumin_hantei_bun,
    kokuho_kiso: en(m.bun11.kokuho_kiso),
    hoken_hantei_bun: m.bun11.hoken_hantei_bun,
    hoken_kekka: m.bun11.hoken_kekka,
    zatsu_zero_bun: m.bun11.zatsu_zero_bun,
    /**
     * ★★★2本目の表の9種類（★戦術Cowork `senjutsu_20260912g.md` 3節・決め1101）。
     *
     * ★★**`null` は、そのまま渡します** …… ★その年が無い方（★実測 172人／250・68.8%）は
     *   9種類とも `null` で、★★**見出しと表がまとめて落ちます**
     *   （★決め1101で**見出しに印 `ichiji_gen` を入れていただきました** ── ★見出しに名前が
     *     1つも無いと、`naWoHirou()` が空を返して落ちません・決め1094）。
     * ★★★**41人／250（16.4%）に、最大 6,195,000円の退職所得と 1,448,041円の税**が、
     *   ★この表が入るまで、計算過程の画面に1円も出ていませんでした。
     */
    ichiji_gen: m.bun11.ichiji_gen,
    ichiji_age: m.bun11.ichiji_age,
    ichiji_kojo_shiki: m.bun11.ichiji_kojo_shiki,
    ichiji_kojo: enKa(m.bun11.ichiji_kojo),
    ichiji_shunyu: enKa(m.bun11.ichiji_shunyu),
    ichiji_hantei_bun: m.bun11.ichiji_hantei_bun,
    ichiji_shotoku: enKa(m.bun11.ichiji_shotoku),
    ichiji_shotokuzei: enKa(m.bun11.ichiji_shotokuzei),
    ichiji_jumin: enKa(m.bun11.ichiji_jumin),
    /**
     * ★★★区分の1文（★戦術Cowork `senjutsu_20260913.md` 3節・決め1107）。
     *   ★「収入」「控除」「退職所得」の3行が `（収入 − 控除）÷ 2 ＝ 退職所得` にならない方に出します
     *     （★実測 1本目 66人／250・2本目 5人／78）。★合う方は `null`＝かたまりごと落ちます。
     */
    kubun_bun: m.bun11.kubun_bun,
    ichiji_kubun_bun: m.bun11.ichiji_kubun_bun,
    /**
     * ★★★回3の2種類（★決め1113）。★画面10（993行）と画面11（1109・1112行）に出ます。
     *   ★`tai_uchiwake_bun` は**1本だけの方に `null`** ＝ **その行だけ**が落ちます。
     */
    tai_gen: m.bun11.tai_gen,
    tai_uchiwake_bun: m.bun11.tai_uchiwake_bun,
    /**
     * ★★★この3つは `data-mada` が1度も付いていませんでしたが、**渡す所が0か所**でした。
     *   ★`{tai_gen}` の `data-mada` が外れて表が出るようになり、★`kumitate()` が止めて分かりました。
     */
    kojo: en(m.bun11.kojo),
    shunyu: en(m.bun11.shunyu),
    shotoku: en(m.bun11.shotoku),
    /**
     * ★★★回3の画面10・18種類（★戦術Cowork `senjutsu_20260913b.md`）。
     *
     * ★★**ここでは字にするだけです。**★分岐も式もありません（★`gamen10Bun.ts` に在ります）。
     * ★★★**`sa_hajime_bun`・`gyakuten_bun`・`sa_saishu_bun` の3つは、字が決まっていません**
     *   ── ★`gamen10Bun()` が `null` を返しますので、★**①の箱はかたまりごと落ちます**。
     *   ★戦術Coworkにお尋ねしています（★便の5節。★数は `bun10.shirabeta` に在ります）。
     */
    ideco_kanyu_nensu: m.bun10.ideco_kanyu_nensu,
    koteki_nenkin: en(m.bun10.koteki_nenkin),
    an_a: m.bun10.an_a,
    an_b: m.bun10.an_b,
    sa_hajime_age: m.bun10.sa_hajime_age,
    an_onaji_bun: m.bun10.an_onaji_bun,
    sa_hajime_bun: m.bun10.sa_hajime_bun,
    gyakuten_bun: m.bun10.gyakuten_bun,
    sa_saishu_bun: m.bun10.sa_saishu_bun,
    sa_saishu: enKa(m.bun10.sa_saishu),
    kurisage_age: m.bun10.kurisage_age,
    an_1_label: m.bun10.an_1_label,
    an_2_label: m.bun10.an_2_label,
    ruikei_min: enKa(m.bun10.ruikei_min),
    ruikei_max: enKa(m.bun10.ruikei_max),
    kuuhaku_kaishi_age: m.bun10.kuuhaku_kaishi_age,
    kuuhaku_owari_age: m.bun10.kuuhaku_owari_age,
    oitsuku_bun: m.bun10.oitsuku_bun,
    sa_90: enKa(m.bun10.sa_90),
    /** ★★決め1135(2) …… 画面10 1037行は**尻尾を外した**字 */
    an_b_mijikai: m.bun10.an_b_mijikai,
    /**
     * ★★★回4の、画面11の5種類 ＋ 画面10の `{nensu}`（★戦術Cowork `senjutsu_20260913f.md` 4-3）。
     *   ★★**`data-mada` は1度も付いていませんでしたが、渡す所が0か所**でした。
     *   ★`nenkin_kojo` は**引く数**ですので、★**符号はここで付けます**（★見本「−600,000円」）。
     */
    nenkin_shunyu: en(m.bun11.nenkin_shunyu),
    nenkin_kojo_kubun: m.bun11.nenkin_kojo_kubun,
    nenkin_kojo: m.bun11.nenkin_kojo === null ? null : enFu(-m.bun11.nenkin_kojo),
    zatsu: en(m.bun11.zatsu),
    shotokuzei: en(m.bun11.shotokuzei),
    nensu: m.bun11.nensu,
    /**
     * ★★★回4の画面9詳細・42種類（★戦術Cowork `senjutsu_20260913f.md` 4-3）。
     *
     * ★★**ここでは渡すだけです。**★字も分岐も `gamen9shosaiBun.ts` に在ります
     *   （★`{a_koteki}` などの円の有無も、あちらで決めています）。
     * ★★★**`null` は、そのまま渡します** …… ★かたまりごと落ちます。
     *   ★この回で `null` にしたのは、★**字が決まっていない6種類**
     *   （`handan_a_bun`・`handan_b_bun`・`handan_c_bun`・`keigen_a`・`keigen_b`・`keigen_c`）と、
     *   ★その方に当たらない字（`zatsu_chu`・`setai_kubun`・`koteki_tsukisu_bun`・`mangaku_bun`）です。
     */
    koteki_kaishi_age: m.bun9s.koteki_kaishi_age,
    handan_a_bun: m.bun9s.handan_a_bun,
    handan_b_bun: m.bun9s.handan_b_bun,
    handan_c_bun: m.bun9s.handan_c_bun,
    /**
     * ★★★決め1134（2026-09-13）── `keigen_a`・`keigen_b`・`keigen_c` は、
     *   ★**基準HTMLから 0か所**になりました。★代わりに 917行の3文が1文まるごとの印です。
     */
    keigen_koeru_bun: m.bun9s.keigen_koeru_bun,
    keigen_kokuho_bun: m.bun9s.keigen_kokuho_bun,
    /** ★★決め1141(1) …… 住民税の行（★変わらない方は `gyouNashi912()` が `<li>` を落とします） */
    jumin_koeru_bun: m.bun9s.jumin_koeru_bun,
    /** ★★決め1136(6) …… 表に足した給与所得の行 */
    a_kyuyo: m.bun9s.a_kyuyo,
    b_kyuyo: m.bun9s.b_kyuyo,
    an_a_bun: m.bun9s.an_a_bun,
    an_b_bun: m.bun9s.an_b_bun,
    sakaime_1: m.bun9s.sakaime_1,
    sakaime_2: m.bun9s.sakaime_2,
    sakaime_3: m.bun9s.sakaime_3,
    hantei_age: m.bun9s.hantei_age,
    an_a_nensu: m.bun9s.an_a_nensu,
    an_b_nensu: m.bun9s.an_b_nensu,
    koteki_tsukisu: m.bun9s.koteki_tsukisu,
    a_koteki: m.bun9s.a_koteki,
    b_koteki: m.bun9s.b_koteki,
    a_ideco: m.bun9s.a_ideco,
    b_ideco: m.bun9s.b_ideco,
    a_shunyu_kei: m.bun9s.a_shunyu_kei,
    b_shunyu_kei: m.bun9s.b_shunyu_kei,
    hantei_nenkin_kojo_kubun: m.bun9s.hantei_nenkin_kojo_kubun,
    a_nenkin_kojo: m.bun9s.a_nenkin_kojo,
    b_nenkin_kojo: m.bun9s.b_nenkin_kojo,
    zatsu_chu: m.bun9s.zatsu_chu,
    a_zatsu: m.bun9s.a_zatsu,
    b_zatsu: m.bun9s.b_zatsu,
    a_koujo15: m.bun9s.a_koujo15,
    b_koujo15: m.bun9s.b_koujo15,
    a_hantei_shotoku: m.bun9s.a_hantei_shotoku,
    b_hantei_shotoku: m.bun9s.b_hantei_shotoku,
    koteki_tsukisu_bun: m.bun9s.koteki_tsukisu_bun,
    mangaku_bun: m.bun9s.mangaku_bun,
    ideco_zandaka: m.bun9s.ideco_zandaka,
    kokuho_kijun: m.bun9s.kokuho_kijun,
    a_kokuho_bun: m.bun9s.a_kokuho_bun,
    b_kokuho_bun: m.bun9s.b_kokuho_bun,
    /**
     * ★★★**この2つは、画面11（1137行）にも出ます。**
     *   ★ですので `gamen9shosaiBun()` は、★**出す相手でない方にも必ず返します**
     *     （★`null` にすると、画面11の年金の表がまるごと落ちます）。
     */
    setai_kubun: m.bun9s.setai_kubun,
    hikazei_gendo: m.bun9s.hikazei_gendo,
    a_jumin_bun: m.bun9s.a_jumin_bun,
    b_jumin_bun: m.bun9s.b_jumin_bun,
  };

  /**
   * ★★★確定申告の11個のうち、年ごとの10個（`nen`・`age`・`gens`・`ataru`・`riyu` × 2）。
   *
   * ★★**無い年の分も、字を入れます。**★`null` にしません。
   *   ★理由 …… `null` は「その方には存在しない」で、`kumitate()` が**かたまりごと**落とします。
   *     ★★確定申告の表は**1つのかたまり**ですので、`null` にすると**1年の方の1行目まで消えます**。
   *   ★★★出すか出さないかは、**`gyouNashi912()` が行ごとに決めます**（★下）。
   *     ★ここで入れた字は、落とされる行のものですので、**画面には出ません**。
   */
  for (const i of [0, 1]) {
    const g = m.shinkoku[i];
    const n = i + 1;
    if (!g) {
      // ★その年が無いとき …… `gyouNashi912()` が行ごと落とします。★空文字にしません
      //   （★`kumitate()` は空文字を「入れ忘れ」として止めます）
      out[`shinkoku_nen${n}`] = '―';
      out[`shinkoku_age${n}`] = '―';
      out[`shinkoku_gens${n}`] = '―';
      out[`shinkoku_ataru${n}`] = '―';
      out[`shinkoku_riyu${n}`] = '―';
      continue;
    }
    const d = m.r.detail[g.nen];
    if (!d) throw new Error(`\`detail\` に ${g.nen}年 がありません（\`keika\` と \`detail\` が食い違っています）。`);
    out[`shinkoku_nen${n}`] = `${g.nen}年`;
    out[`shinkoku_age${n}`] = `${d.age}歳`;
    // ★支給源が2つ以上のときは「と」でつなぎます（★戦術Cowork `senjutsu_20260908e.md` お願い(1)）
    out[`shinkoku_gens${n}`] = g.gens.join('と');
    out[`shinkoku_ataru${n}`] = g.ataru ? '当てはまります' : '当てはまりません';
    // ★理由は、当てはまらない年だけ。★当てはまる年は `gyouNashi912()` が落とします
    out[`shinkoku_riyu${n}`] = g.riyu ? `${g.nen}年 …… ${RIYU_BUN[g.riyu]}` : '―';
  }
  /**
   * ★★★画面9（一覧）の7行 …… `an_labelN`・`hoken_bunN`・`tedoriN`・`saN`（★4つ × 7行 ＝ 28個）。
   *
   * ★★**無い行の分も、字を入れます。**★`null` にしません（★確定申告の表と同じ理由 ── 上）。
   *   ★出すか出さないかは、**`gyouNashi912()` が行ごとに決めます**。
   * ★`sa` …… **1行目は「—」（U+2014）**、2行目からは **「−」（U+2212）＋ 桁区切り**。
   *   ★★この2つの字は、**基準HTMLの見本から機械で拾いました**（★898〜904行の `data-na="saN"`）。
   *   ★★★**円は付けません。**★見本が「−25,732」で、円が付いていないためです。
   * ★`tedori` …… 同じく**円を付けません**（★見本は「24,994,632」）。
   *   ★★画面10の `{tedori}` は文の中ですので、そちらは `en()`（円つき）のままです。
   * ★★★`tedori1`〜`7` は、**この回まで、どこも作っていませんでした**
   *   （★`MADA_NA` に入っていないだけで、値を作る所が0か所でした・★戦術Cowork 判断ログ982番）。
   */
  for (let i = 0; i < 7; i++) {
    const g = m.ichiran[i];
    const n = i + 1;
    if (!g) {
      out[`an_label${n}`] = '\u2014';
      out[`hoken_bun${n}`] = '\u2014';
      out[`tedori${n}`] = '\u2014';
      out[`sa${n}`] = '\u2014';
      continue;
    }
    out[`an_label${n}`] = g.lab;
    out[`hoken_bun${n}`] = g.hokenBun;
    out[`tedori${n}`] = g.tedori.toLocaleString('en-US');
    /**
     * ★★★「差」の字（★戦術Cowork `senjutsu_20260909i.md` 決め1007）。
     *   ★`sa` は「**この行の手取り − 1行目の手取り**」です（`ichiran.ts`）。
     *
     * | `sa` | 字 |
     * |---|---|
     * | `null`（1行目） | 「—」（U+2014） |
     * | `0` | 「0」 |
     * | 負（1行目より少ない） | 「−」（U+2212）＋ **絶対値** |
     * | ★正（1行目より多い） | 「＋」（**U+FF0B・全角**）＋ その値 |
     *
     * ★★全角の「＋」にするのは、**U+2212 と幅がそろう**ためです。★円は付けません（★決め983(2)）。
     * ★★★正が出るのは、**手取りが多い順いがいの3つの並び順**です（★1行目が手取りの最大とはかぎりません）。
     */
    out[`sa${n}`] = g.sa === null ? '\u2014'
      : g.sa === 0 ? '0'
      : g.sa < 0 ? `\u2212${(-g.sa).toLocaleString('en-US')}`
      : `\uFF0B${g.sa.toLocaleString('en-US')}`;
  }
  return out;
}

/**
 * **その方には、その行が無い**もの（`engine.py` の `kyufu_gyou` / `koza_gyou` の写し）。
 *
 * 【`data-mada` とは別のものです・2026-08-23。戦術Coworkのご指摘】
 *   `data-mada` … エンジンに出口が無い。**作れば埋まります**（帯に数えます）
 *   ここ　　　　 … **エンジンが「この方にはこの行は無い」と決めた。**ふつうの分岐です
 *                  （**帯に数えません。**数えると、その方の帯が永久に消えません）
 *
 *   実測（戦術Cowork・400人）では、**口座管理の月数が0の方が41人（10.3%）**です。
 *   その方は `koza_tsuki` が `null` ではなく **`0`** なので、
 *   「口座管理手数料 66円×0か月　0円」がそのまま出てしまいます。
 */
export function gyouNashi912(m: Moto912): string[] {
  const t = m.r.tesuryo_uchiwake;
  if (!t) throw new Error('`evaluate()` が `tesuryo_uchiwake` を返していません。');
  const out: string[] = [];
  if (!t.kyufu_gyou) out.push('kyufu_tanka', 'kyufu_kaisu', 'kyufu_kei');
  if (!t.koza_gyou) out.push('koza_tanka', 'koza_tsuki', 'koza_kei');
  /**
   * ★★★確定申告（★戦術Cowork `senjutsu_20260908d.md` 4節の表）
   *
   *   一時金を受け取る年が **1つ** …… 表の**2行目**と `shinkoku_riyu2` を落とす
   *   その年の `ataru` が **真** ……… その年の **`shinkoku_riyu`** を落とす
   *   一時金を受け取る年が **0** …… 表の**2行とも**と `riyu1`・`riyu2` を落とす
   *
   * ★★`kumitate()` は、**表の行**と**箇条書きの項目**だけを落とします（`gamenBun.ts` 171〜185行）。
   *   ★確定申告の表の1行は、その行の中の名前を1つでも渡せば落ちます。
   */
  for (const i of [0, 1]) {
    const g = m.shinkoku[i];
    const n = i + 1;
    // ★その年が無い → 表の行ごと落とす（★行の中の名前を渡します）
    if (!g) out.push(`shinkoku_nen${n}`, `shinkoku_age${n}`, `shinkoku_gens${n}`, `shinkoku_ataru${n}`);
    // ★当てはまる年、または年が無い → 理由の項目を落とす
    if (!g || g.ataru) out.push(`shinkoku_riyu${n}`);
  }
  /**
   * ★★★画面9（一覧）…… **その方の通り数が7未満のとき**、足りない行を落とします。
   *   ★★★実測（`golden_heavy_20260906`・**250人**・★`omoi=True`＝**⑳を軸に入れています**）
   *     …… ★通り数がいちばん少ない方でも **161通り**でした（★平均 17,934.1 ／ 最大 41,216）。
   *     ★★**本番は⑳を軸に入れます**（`kekka.ts` 91行 `E.nenkinKouho(p, genzaiNen)`）ので、
   *        ★★★**こちらが本番の姿の数です**（★戦術Cowork 決め992）。
   *   ★（★`golden_light_20260906`・1,000人 は `omoi=False` で⑳を軸に入れていません。
   *      ★そちらでも最小は 161通りでしたが、平均は 1,619.0 で、**本番の数ではありません**。
   *      ★250人は light の1,000人に含まれ、入力は1文字も違いません ── 測って当てました。）
   *   ★★ですので、いまの見本の方々では1行も落ちません。★**それでも書きます**
   *     （★入力しだいで7未満になりうるためです。★空の行を出さない）。
   */
  for (let i = 0; i < 7; i++) {
    const n = i + 1;
    if (!m.ichiran[i]) out.push(`an_label${n}`, `hoken_bun${n}`, `tedori${n}`, `sa${n}`);
  }
  /**
   * ★★★画面9詳細の warn の囲みの箇条書き（★決め1141(1)(2)）。
   *   ★`keigen_kokuho_bun` …… 軽減が変わらない方（★実測 77人／102）
   *   ★`jumin_koeru_bun` …… 住民税が変わらない方（★実測 87人／102）
   * ★★**どちらもエンジンが決めています**（★`gamen9shosaiBun()` の `gyou_nashi`）。
   *   ★ここでは受け取って渡すだけです（★§画面に出す数字と分岐は計算エンジン側）。
   * ★★★どちらも落ちる76人は、`keigen_koeru_bun` が `null` ですので**囲みごと落ちます**（★決め1141(3)）。
   */
  out.push(...m.bun9s.gyou_nashi);
  return out;
}

/**
 * ★★★【2026-09-14・決め1164 門C】**節の一覧（★戦術Coworkが決めました）**
 *
 * *   ★「節」＝**同じ話をしているかたまりのまとまり**です（★画面10の①の節・②の節）。
 * *   ★★**代表の名前が `null` の方には、その節のかたまりが1つ残らず落ちること**を、
 *     ★機械が250人で数えます（★門C）。★1つでも残ったら**止めます**。
 * *   ★★★**そうしないと、節の見出しだけ・説明だけが残ります** ── ★この3回で3つ見つけました
 *     （★`chu`（1075行）が168人に残った／囲み②が7人で落ちた／「この金額に入っているもの」が168人に残った）。
 *     ★★**3つとも人の目が見つけたもので、機械は1つも見つけていません**（★決め1164）。
 *
 * ★★かたまりの見分けは、★**そのかたまりに出てくる `{名前}` の組**でします。
 *   ★★★**字で見分けません**（★基準HTMLの文言を、この本に写さないためです）。
 *   ★組が見つからない・2つ以上見つかったときは、★**そこで止めます**（★基準HTMLが動いた、ということです）。
 */
export type Setsu = {
  /** どの画面か */
  gamen: string;
  /** 節の名前（★止めの文に出します） */
  na: string;
  /**
   * ★★**代表の名前** …… ★この**どれか1つでも `null`** なら、その節は落ちるはずです。
   *   ★①の節＝`sa_hajime_age`（★24人）／②の節＝`kurisage_age`（★168人）／
   *   ★①と②の両方＝`sa_90`・`sa_saishu`（★175人＝24＋168−17）。
   */
  daihyo: readonly string[];
  /** その節に入るかたまり（★そのかたまりに出てくる `{名前}` を並べ、重なりを外して並べ替えたもの） */
  katamari: readonly (readonly string[])[];
  /**
   * ★★★その節に入る**図**の名前（★いまは3つとも空です）。
   *   ★★図は `kumitate()` が見ませんので、★**繋ぐ回に、描いた図の名前を門Cに渡します**（★決め1166）。
   *   ★★★**同じことを2か所に書かないため**、図を出すかどうかの決まりは**ここに1つだけ**置きます。
   */
  zu: readonly string[];
};

/** ★節の一覧（★画面10・★戦術Cowork `senjutsu_20260914b.md` 4-1） */
export const SETSU: readonly Setsu[] = [
  {
    gamen: '画面10', na: '①の節', daihyo: ['sa_hajime_age'], zu: [],
    katamari: [
      ['nenkin_gen', 'sa_hajime_age'],                                        // 見出し①（999行）
      ['an_a', 'an_b', 'nenkin_gen'],                                         // 本文①（1000行）
      ['gyakuten_bun', 'sa_hajime_age', 'sa_hajime_bun', 'sa_saishu_bun'],    // 囲み①（1035行）
    ],
  },
  {
    gamen: '画面10', na: '②の節', daihyo: ['kurisage_age'], zu: [],
    katamari: [
      ['kurisage_age'],                                                       // 見出し②（1037行）
      ['an_b_mijikai', 'koteki_kaishi_age', 'kurisage_age', 'nenkin_gen'],    // 本文②（1038行）
      ['an_1_label', 'an_2_label', 'toori_kazu'],                             // hanrei（1074行）
      ['ruikei_max', 'ruikei_min', 'toori_kazu'],                             // chu（1075行）
      ['kuuhaku_kaishi_age', 'kuuhaku_owari_age', 'oitsuku_bun', 'sa_90'],    // 囲み②（1080行）
      ['kurisage_age', 'tedori'],                                             // ②の累計の chu（1093行）
    ],
  },
  {
    gamen: '画面10', na: '①と②の両方の節', daihyo: ['sa_90', 'sa_saishu'], zu: [],
    katamari: [
      ['nenkin_gen', 'sa_90', 'sa_saishu'],                                   // 足し算しないでくださいの chu（1086行）
    ],
  },
];

/** かたまりに出てくる `{名前}`（★重なりを外し、並べ替えたもの） */
function naNoKumi(b: BlockKyotsu): string[] {
  const out: string[] = [];
  const hirou = (x: string) => { for (const m of x.matchAll(/\{([a-zA-Z0-9_]+)\}/g)) out.push(m[1]); };
  if (b.kind === 'hyo') for (const g of b.gyou) hirou(g.cells.join(' '));
  else if (b.kind === 'ret') for (const k of b.koumoku) hirou(k.bun);
  else hirou(b.bun);
  return [...new Set(out)].sort();
}

/**
 * ★★★【2026-09-14・決め1164】**門C** ── 節ごとに、1つ残らず落ちたかを見ます。
 *
 * @param zuDeta ★**その方に実際に描いた図の名前**（★いまは1つも描いていませんので、いつも空です）。
 *   ★★繋ぐ回に、`Screen10` が描いた図の名前を渡します（★決め1166）。
 */
function monC(
  gamen: string,
  blocks: readonly BlockKyotsu[],
  atai: Readonly<Record<string, string | null>>,
  kumi: Kumi,
  zuDeta: readonly string[],
): void {
  const deta = new Set(kumi.dasuIndex);
  const kumiJi = blocks.map((b) => naNoKumi(b).join(','));
  for (const se of SETSU) {
    if (se.gamen !== gamen) continue;
    /** ★代表の名前が1つでも `null` なら、この節は落ちるはずです */
    const ochiru = se.daihyo.some((x) => atai[x] === null);
    if (!ochiru) continue;
    const nokotta: string[] = [];
    for (const k of se.katamari) {
      const kj = [...k].sort().join(',');
      const ban = kumiJi.map((x, i) => (x === kj ? i : -1)).filter((i) => i >= 0);
      if (ban.length !== 1) {
        throw new Error(
          `門C …… ${gamen}「${se.na}」のかたまり（${kj || '（印なし）'}）が、`
          + `**${ban.length}個**見つかりました（★1個のはずです）。`
          + '**基準HTMLが動いています。**節の一覧を直してください（決め1164）。',
        );
      }
      if (deta.has(ban[0])) nokotta.push(kj || '（印なし）');
    }
    const zuNokotta = se.zu.filter((z) => zuDeta.includes(z));
    if (nokotta.length || zuNokotta.length) {
      throw new Error(
        `門C …… ${gamen}「${se.na}」は落ちるはずなのに、`
        + `かたまりが${nokotta.length}個・図が${zuNokotta.length}個 残っています。\n`
        + `  代表の名前（\`null\` のもの）： ${se.daihyo.filter((x) => atai[x] === null).join(' ')}\n`
        + `  残ったかたまり： ${nokotta.join(' ／ ') || '（なし）'}\n`
        + `  残った図： ${zuNokotta.join(' ') || '（なし）'}\n`
        + '  **節の見出しだけ・説明だけが残ります。**そこで止めます（決め1164）。',
      );
    }
  }
}

/**
 * ★★★【2026-09-13・決め1146】**落としてよい名前の名簿（いまは空です）**
 *
 * *   ★ここに名前を入れると、その名前が `null` で落ちたかたまりは
 *     `ochitaNashiKime`（決めで落とした）に数えられ、★`ochita` には入りません。
 * *   ★★**空のままにしてください。**名前を増やす要りが出たときは、
 *     ★そこで止めて戦術Coworkに投げます（★決め1146・名簿を作るのは戦術Cowork）。
 * *   ★★★**1行は「名前 ＋ その名前で落とすかたまりの数」です**（★2026-09-14・決め1155）。
 *     ★例 …… `画面10: { kurisage_age: 2 }` ＝「`kurisage_age` で**2つ**落とす」。
 *     ★★門B（`kumitate()`）が、★**書いた数と実際の数が違ったら止めます**。
 * *   ★★★**数は戦術Coworkが書きます**（★決め1155）── ★こちらで数えて埋めません。
 *     ★`kurisage_age`・`sa_hajime_age`（★決め1118(5)）と `ichiji_gen`（★決め1101）は、
 *     ★★**見出しにも印を入れて、見出しごと落とすのが決め**でした（★2か所とも落とします）。
 * *   ★★★**画面ごとに分けて書きます**（★決め1147(1)）── ★同じ名前でも、画面が違えば別に書きます。
 *     ★理由 …… ★`ichiji_gen` は画面11で2か所・`kurisage_age` は画面10で2か所というように、
 *     ★**同じ名前でも画面によって出てくる数が違います**。まとめて書くと、それが見えません。
 * *   ★1行ごとに決め番号を書きます（★決め1147(2)）。
 */
export const OCHITE_YOI: Readonly<Record<string, Readonly<Record<string, number>>>> = {
  画面9: {},
  '画面9 詳細': {},
  画面10: {},
  画面11: {},
  画面12: {},
};

/** 5画面ぶんを組み立てる。**出せなかった数も返します** */
export function kumi912(m: Moto912, zuDeta: readonly string[] = []): Record<string, Kumi> {
  const a = atai912(m);
  const nashi = gyouNashi912(m);
  /**
   * @param gamen ★名簿は**画面ごと**ですので、画面の名前を受け取ります（★決め1147(1)）。
   *   ★★**既定値を作りません** ── ★名簿に無い画面の名前を渡したら、そこで止めます。
   */
  const hitotsu = (gamen: string, blocks: readonly BlockKyotsu[], mada: readonly string[]) => {
    const yoi = OCHITE_YOI[gamen];
    if (yoi === undefined) {
      throw new Error(
        `名簿（\`OCHITE_YOI\`）に「${gamen}」がありません。`
        + `**画面を足したときは、名簿にもその画面を足してください**（空の配列で結構です・決め1147(1)）。`,
      );
    }
    // **その画面に出てこない名前は渡しません。**渡すと「使っていない値」が見えなくなります
    const dero = new Set<string>();
    const hirou = (s: string) => { for (const x of s.matchAll(/\{([a-zA-Z0-9_]+)\}/g)) dero.add(x[1]); };
    for (const b of blocks) {
      if (b.kind === 'hyo') for (const g of b.gyou) hirou(g.cells.join(' '));
      else if (b.kind === 'ret') for (const k of b.koumoku) hirou(k.bun);
      else hirou(b.bun);
    }
    const madaSet = new Set(mada);
    const sono: Record<string, string | null> = {};
    for (const na of dero) if (!madaSet.has(na) && na in a) sono[na] = a[na];
    return kumitate(blocks, mada, sono, nashi, yoi);
  };
  /**
   * ★★★【2026-09-13・決め1143】**その方に当たる字が1つも無い画面を出しません。**
   *
   *   ★画面9詳細は、決め1046の「出す相手」でない方（★実測 148人／250・59.2%）には
   *     ★★**かたまりが9個残りますが、その9個は「印が1つも無いか `{nenkin_gen}` だけ」**
   *     ── ★その方に当たる字が1つもありません。
   *   ★★ですので、★**かたまりを1つも作りません**（★決め1143(2)）。
   *   ★★★**出すかどうかを決めているのはエンジン**です（★`gamen9shosaiBun()` の `dasu`）。
   */
  /**
   * ★★★【2026-09-13・決め1143(5-1)】**画面9詳細の都合で `null` にした印が、
   *   ほかの画面を落としていないか**を、★**ここで機械で数えます**。
   *
   *   ★★前の回、`setai_kubun`・`hikazei_gendo` を `null` にして**画面11の年金の表**を落としました。
   *   ★★この回、`ideco_zandaka`・`koteki_kaishi_age` を `null` にして**画面10の前提の箱**を落としました
   *     ── ★**2回とも、同じ形**です。★ですので**門にします。**
   *   ★★★「画面9詳細にも、ほかの画面にも出る名前」を機械で拾い、
   *     ★**出す相手でない方で、その名前が `null` なら止めます**。
   */
  if (!m.bun9s.dasu) {
    const hoka = new Set<string>();
    const marude = [GAMEN9, GAMEN10, GAMEN11, GAMEN12] as unknown as readonly BlockKyotsu[][];
    for (const b of marude) {
      for (const x of b) {
        const hirou = (t: string) => {
          for (const y of t.matchAll(/\{([a-zA-Z0-9_]+)\}/g)) hoka.add(y[1]);
        };
        if (x.kind === 'hyo') for (const g of x.gyou) hirou(g.cells.join(' '));
        else if (x.kind === 'ret') for (const k of x.koumoku) hirou(k.bun);
        else hirou(x.bun);
      }
    }
    const kyoyu: string[] = [];
    for (const x of GAMEN9shosai as readonly BlockKyotsu[]) {
      const hirou = (t: string) => {
        for (const y of t.matchAll(/\{([a-zA-Z0-9_]+)\}/g)) {
          if (hoka.has(y[1]) && a[y[1]] === null) kyoyu.push(y[1]);
        }
      };
      if (x.kind === 'hyo') for (const g of x.gyou) hirou(g.cells.join(' '));
      else if (x.kind === 'ret') for (const k of x.koumoku) hirou(k.bun);
      else hirou(x.bun);
    }
    if (kyoyu.length) {
      throw new Error(
        `画面9詳細を出さない方に、「${[...new Set(kyoyu)].join(' ')}」が \`null\` で渡されています。`
        + '**この名前は、ほかの画面にも出ます。**`null` にすると、そちらのかたまりが落ちます。'
        + '`gamen9shosaiBun()` が `dasu` に寄らず値を返すようにしてください（決め1143）。',
      );
    }
  }
  const kara: Kumi = {
    dasu: [], ochita: 0, ochitaMada: 0, ochitaNashi: 0,
    ochitaNashiKime: 0, ochitaNashiNazo: 0,
    ochitaNa: [], nashiNa: [], kimeNa: [],
    gyouNashiKazu: 0, gyouNashiNa: [], karaOchi: 0, ireta: 0, dasuIndex: [],
  };
  const out: Record<string, Kumi> = {
    画面9: hitotsu('画面9', GAMEN9 as readonly BlockKyotsu[], MADA9),
    '画面9 詳細': m.bun9s.dasu
      ? hitotsu('画面9 詳細', GAMEN9shosai as readonly BlockKyotsu[], MADA9S) : kara,
    画面10: hitotsu('画面10', GAMEN10 as readonly BlockKyotsu[], MADA10),
    画面11: hitotsu('画面11', GAMEN11 as readonly BlockKyotsu[], MADA11),
    画面12: hitotsu('画面12', GAMEN12 as readonly BlockKyotsu[], MADA12),
  };
  /**
   * ★★★【2026-09-14・決め1164】**門C** …… 節ごとに、1つ残らず落ちたかを見ます。
   *   ★★`zuDeta`（描いた図の名前）は、★**いまは1つも描いていませんので空**です
   *     （★`Chart10.tsx` を読み込んでいる本は0本・実測）。★繋ぐ回に `Screen10` が渡します。
   */
  const BLOCKS: Record<string, readonly BlockKyotsu[]> = {
    画面9: GAMEN9 as readonly BlockKyotsu[],
    '画面9 詳細': GAMEN9shosai as readonly BlockKyotsu[],
    画面10: GAMEN10 as readonly BlockKyotsu[],
    画面11: GAMEN11 as readonly BlockKyotsu[],
    画面12: GAMEN12 as readonly BlockKyotsu[],
  };
  for (const gamen of Object.keys(out)) {
    // ★出さない画面（★`kara`）は、かたまりが1つも無いので見ません
    if (gamen === '画面9 詳細' && !m.bun9s.dasu) continue;
    monC(gamen, BLOCKS[gamen], a, out[gamen], zuDeta);
  }
  return out;
}

export function Screen9({ m }: { m: Moto912 }) { return <ScreenBlocks kumi={kumi912(m)['画面9']} />; }
/**
 * ★★★決め1143 …… **出す相手でない方には、この画面を1文字も描きません。**
 *   ★★★**入口（導線）は、基準HTMLにも `PaidApp.tsx` にも 0か所**です
 *     （★こちらで機械で数えました ── ★`Screen9Shosai` を読み込む所が0か所）。
 *     ★ですので、決め1143(3)（入口も出さない）で**この回に直す所はありません**。
 */
export function Screen9Shosai({ m }: { m: Moto912 }) {
  if (!m.bun9s.dasu) return null;
  return <ScreenBlocks kumi={kumi912(m)['画面9 詳細']} />;
}
export function Screen10({ m }: { m: Moto912 }) { return <ScreenBlocks kumi={kumi912(m)['画面10']} />; }
export function Screen11({ m }: { m: Moto912 }) { return <ScreenBlocks kumi={kumi912(m)['画面11']} />; }
export function Screen12({ m }: { m: Moto912 }) { return <ScreenBlocks kumi={kumi912(m)['画面12']} />; }
