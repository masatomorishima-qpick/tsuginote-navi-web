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
import { GAMEN9, MADA_NA as MADA9 } from './gamen9';
import { GAMEN9shosai, MADA_NA as MADA9S } from './gamen9shosai';
import { GAMEN10, MADA_NA as MADA10 } from './gamen10';
import { GAMEN11, MADA_NA as MADA11 } from './gamen11';
import { GAMEN12, MADA_NA as MADA12 } from './gamen12';
import { kumitate, en, type BlockKyotsu, type Kumi } from './gamenBun';
import ScreenBlocks from './ScreenBlocks';

/**
 * 5画面が使う、その方のもの。**エンジンが出したものだけ**を受け取ります。
 * **ここで計算しません。**
 */
export type Moto912 = {
  /** その方が選んでいる受け取り方の計算結果 */
  r: E.EvalResult;
  /** その受け取り方（年金の期間などを引きます） */
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
};

/** ★当てはまらない理由の字（★6通り・戦術Cowork `senjutsu_20260908d.md` 4節。**こちらでは書きません**） */
const RIYU_BUN: Record<E.ShinkokuRiyu, string> = {
  あ: 'この決まりは、公的年金等を受け取っている年のためのものです。あなたのこの年は、公的年金等の受け取りが0円です',
  い: 'あなたの公的年金等が、その年に400万円を超えます',
  う: 'あなたの公的年金等以外の所得が、その年に20万円を超えます',
  あう: 'この決まりは、公的年金等を受け取っている年のためのものです。あなたのこの年は、公的年金等の受け取りが0円で、公的年金等以外の所得が20万円を超えます',
  いう: 'あなたの公的年金等が400万円を超え、公的年金等以外の所得も20万円を超えます',
};

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
    nenkin_kikan: `${m.plan.nenkin_kikan}年`,
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
    // ★1行目は差がありません（`sa` は `null`）。★見本と同じ「—」（U+2014）を入れます
    out[`sa${n}`] = g.sa === null ? '\u2014' : g.sa === 0 ? '0' : `\u2212${g.sa.toLocaleString('en-US')}`;
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
  return out;
}

/** 5画面ぶんを組み立てる。**出せなかった数も返します** */
export function kumi912(m: Moto912): Record<string, Kumi> {
  const a = atai912(m);
  const nashi = gyouNashi912(m);
  const hitotsu = (blocks: readonly BlockKyotsu[], mada: readonly string[]) => {
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
    return kumitate(blocks, mada, sono, nashi);
  };
  return {
    画面9: hitotsu(GAMEN9 as readonly BlockKyotsu[], MADA9),
    '画面9 詳細': hitotsu(GAMEN9shosai as readonly BlockKyotsu[], MADA9S),
    画面10: hitotsu(GAMEN10 as readonly BlockKyotsu[], MADA10),
    画面11: hitotsu(GAMEN11 as readonly BlockKyotsu[], MADA11),
    画面12: hitotsu(GAMEN12 as readonly BlockKyotsu[], MADA12),
  };
}

export function Screen9({ m }: { m: Moto912 }) { return <ScreenBlocks kumi={kumi912(m)['画面9']} />; }
export function Screen9Shosai({ m }: { m: Moto912 }) { return <ScreenBlocks kumi={kumi912(m)['画面9 詳細']} />; }
export function Screen10({ m }: { m: Moto912 }) { return <ScreenBlocks kumi={kumi912(m)['画面10']} />; }
export function Screen11({ m }: { m: Moto912 }) { return <ScreenBlocks kumi={kumi912(m)['画面11']} />; }
export function Screen12({ m }: { m: Moto912 }) { return <ScreenBlocks kumi={kumi912(m)['画面12']} />; }
