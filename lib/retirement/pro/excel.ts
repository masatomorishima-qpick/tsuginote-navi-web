/**
 * lib/retirement/pro/excel.ts — 結果の Excel（4シート）を作る（A-2a-3）
 *
 * ★シートと列は、基準HTMLの画面8「ファイルの中身」の字と、戦術Coworkの決め（senjutsu_20260902y.md 1番・ad.md 3番）のとおり。
 *   1 結果のまとめ　　　画面8と同じ内容 ── `Gamen8`・`Bun8` から
 *   2 受け取り方の一覧　全通り（`D`）
 *   ★★★【2026-09-14・決め1208】**列名は `RETSU_S1`／`RETSU_S2`／`RETSU_S3` だけが持ちます**（★下）。
 *     ★ここに列名を書き写しません（★2か所に在ると、片方だけ直ります）。
 *   3 年ごとの内訳　　　★この便では「結論の案」と「⑳をそろえた一時金の案」の2本だけ（9〜12 の便で「画面に出た受け取り方」に広げる）。
 *                        番号・年・年齢・その年に手元に入る額（**額面**）・その年に納める税金・その年の手数料（1歳きざみの通し）
 *                        ★★案ごとに `合計` と `手取り` の2行（`入る額 − 税 − 手数料 ＝ 手取り`。★シート1の手取りと同じ数）。
 *                          ★案と案の間に空の行を1つ。★年の範囲は `nenNoHani()`（A-2a2）
 *   4 計算の内容と根拠　ご入力の28項目（ラベルは `PAID_FIELDS` の字・値は raw）
 *                        ＋ ★★★**計算の全ステップ**（★画面11のかたまり・シート3と同じ案ぶん・決め1231）
 *                        ＋ 根拠にした条文（`gamen13.ts`）
 *
 * ★★ここに式はありません。数は全部 `D`・`R`・`Gamen8` から写すだけです
 *   （★1つだけ `engine.ts` の `modoruGaku()` を**呼び**ます ── ★シート2の「確定申告で戻る額」・決め1225。
 *    ★★式は `engine.ts` が持ちます）。
 * ★保険料の字は画面9の2つ（`保険料は変わりません`／`◯歳から保険料が上がる場合があります`）。金額は出しません。
 * ★シート2に「番号」の列を先頭に足しています（★シート3の「番号」が指す先。仕様の列に無い1列・便に書きます）。
 * ★道具は exceljs（MIT・4.4.0）。★書式なし・共有文字列なし（stream）。この本だけが読み込みます（`server-only`）。
 */

import 'server-only';
import { PassThrough } from 'node:stream';
import ExcelJS from 'exceljs';
import type { Keisan } from './kekka';
import type { PaidInput } from './paidInput';
import type { Row } from './gamen8';
/**
 * ★★★【2026-09-15・決め1225】**`import type` をやめました。**
 *   ★シート2の「確定申告で戻る額」で `E.modoruGaku()` を**呼ぶ**ようになったためです。
 *   ★★**式はこの本に持ちません**（★§2の3）── ★呼ぶだけです。
 */
import * as E from './engine';
import { PAID_FIELDS } from '@/components/retirement/pro/paidFields';
import { GAMEN13 } from '@/components/retirement/pro/gamen13';
import { hitogotoBun } from '@/components/retirement/pro/gamen13Bun';
import { paidKou, ranWoHiku, type Kou } from './paidRules';
import { gamen11Bun } from './gamen11Bun';
import { atai11, gyouNashi11, setaiNoJi } from './gamen11Atai';
import { GAMEN11, MADA_NA as MADA11 } from '@/components/retirement/pro/gamen11';
import { kumitate } from '@/components/retirement/pro/gamenBun';

/**
 * ★シート3の上に置く1行（戦術の字・senjutsu_20260903c.md 1番）。
 * ★「拠出が終わってから受け取り始めるまでの年」がある案が1つでもあるときだけ出します。
 */
export const JI_S3_KOZA =
  'iDeCo等の拠出が終わったあと、受け取り始めるまでの年は、口座管理手数料だけがかかります。';
/**
 * ★★★シート2の見出しの上に置く1行（★戦術Cowork 決め1214・`senjutsu_20260915.md` お願い3）。
 *   ★基準HTML **885行**の字をそのまま写しました。★こちらで書き直さないこと
 */
export const JI_S2_SHINKOKU =
  '増える税金と手取りは、あなたが確定申告をしたときの額です。';
/**
 * ★シート3の先頭の添え字（森嶋さんの決め「ア」・senjutsu_20260905g.md 1番②）。★こちらで書き直さないこと
 */
export const JI_S3_SOEJI =
  'あなたの給与と公的年金はそのままにして、退職金とiDeCo等をこの受け取り方にしたときに、その年に増える税金です。給与や公的年金にかかる税は、この額に入っていません';

/**
 * ★★★【2026-09-15・決め1231】**シート4の「計算の全ステップ」が渡す2つ**。
 *
 * ★★★**これは既定値ではありません。**★`paidInput.ts` に欄が**0か所**ですので、
 *   ★**こちらが「1人」と決めて渡しています**（★`gamen8.ts` 248行・`_hakaru.tsx` 374行と**同じ数**です）。
 * ★★★**欄ができた日は、ここを入力から渡してください**（★呼ばれる側に既定を置かないでください）。
 */
const HIHOKENSHA = 1;
const KYUYO_SHOTOKUSHA = 1;
/** ★iDeCo等の名前（★`kekka.ts` の `IDECO_NAME` と同じ字。★シート3の `ichijikinNoAn()` にも渡しています） */
const IDECO_NAME = 'iDeCo等';

/**
 * ★シート3が出す年の範囲（senjutsu_20260903c.md 5番・d.md 1番）。
 *
 *   `uketoriFirst` … 最初の受け取りの年
 *   `first` … `min(uketoriFirst, tesuryo_by_year の鍵の最小)`
 *     ★★口座管理手数料は「拠出が終わった年の翌年」から始まるので、**最初の受け取りの年より前**に出ることがあります
 *       （⑬〈iDeCo等の加入期間〉を退職の年より前に終えた方）。★その年を落とすと、足し算が合いません
 *     ★★`hajime` を実装側で作りません（`engine.ts` 887行の `− 1` を写さないため）。**engine が返した鍵を見るだけ**です
 *     ★手数料が1円もかからない方（③＝0 など）は鍵が空になるので、`uketoriFirst` をそのまま使います
 *   `last` … `max(saishu_nen, harau〈税を納める年〉の最大)`
 *     ★★住民税の総合課税分は**翌年**に付きます（`engine.ts` 866〜867行・B-14）。★その年を落とすと、足し算が合いません
 */
export function nenNoHani(r: E.EvalResult): { uketoriFirst: number; first: number; last: number } {
  const ys = [...Object.keys(r.detail).map(Number), ...r.keika.map((kk) => kk.year)];
  const uketoriFirst = Math.min(...ys);
  const tesuY = Object.keys(r.tesuryo_by_year ?? {}).map(Number);
  // ★★`harau` は、値が 0 の年も鍵だけ残ります（住民税の総合課税分は翌年に入れるため。`engine.ts` 866〜867行）。
  //   ★そのまま `last` に入れると、表のいちばん下に「入る額 0・税 0・手数料 0」の年が1行つきます
  //   （見本の方で 3,276 / 41,216案）。★**値が 0 でない年だけ**を見ます（senjutsu_20260903e.md 1番「ア」）
  const harauY = Object.entries(r.harau ?? {})
    .filter(([, en]) => en !== 0)
    .map(([y]) => Number(y));
  return {
    uketoriFirst,
    first: tesuY.length ? Math.min(uketoriFirst, ...tesuY) : uketoriFirst,
    // ★空の集合は入れません（`...[]` は何も足しません。★`saishu_nen` が必ず1つあるので `-Infinity` になりません）
    last: Math.max(r.saishu_nen ?? Math.max(...ys), ...harauY, ...tesuY),
  };
}

/** 保険料の字（画面9の字・2つ） */
export function hokenNoJi(x: Row): string {
  if (x.h.length === 0) return '保険料は変わりません';
  const age = Math.min(...x.h.map((k) => k.age));
  return `${age}歳から保険料が上がる場合があります`;
}

/** ⑳を結論の案にそろえた「一時金の案」（senjutsu_20260902x.md 2番・y.md 2番）。★無ければ null（400人では0人） */
export function ichijikinNoAn(k: Keisan, idecoName: string): Row | null {
  const ketsuron = k.D.find((x) => x.lab === k.g8.houkou[0]?.lab) ?? null;
  const ketsu20 = ketsuron?.pl.nenkin_kaishi_age ?? k.p.koteki_kaishi_age;
  const kijunNen = k.g8.kijun.kijun_nen;
  const ko = k.D.filter((x) =>
    x.pl.nenkin_gen === null && x.pl.ichiji_wariai === 0
    && x.pl.uketori_nen[idecoName] === kijunNen
    && Object.entries(x.pl.uketori_nen).every(([n, y]) => n === idecoName || y === k.taishokuNen)
    && (x.pl.nenkin_kaishi_age ?? k.p.koteki_kaishi_age) === ketsu20);
  if (!ko.length) return null;
  // ★複数あれば kijunAn() と同じ並び（手取り → ラベル順）
  return ko.reduce((a, b) => (b.tedori - a.tedori || (a.pl.label <= b.pl.label ? -1 : 1)) > 0 ? b : a);
}

/** 28項目の raw を「ラベル｜値」の行に（★値は raw の字のまま。複数の欄は鍵ごとに1行） */
/** ★★決め1204 …… お答えいただいていない欄の字（★空欄にしません） */
const KOTAE_NASHI = 'お答えいただいていません';

/**
 * ★★★【2026-09-14・決め1207(4)】**お答えいただいていない欄が、何として計算されているか。**
 *
 * ★★【戦術Coworkのお願い】…… ★「お答えいただいていません（**0円として計算しました**）」にすること。
 * ★★★【こちらが止めた所】…… ★この字が出る欄を**数えました**（★`_excel_miru.tsx` で見本の方1人）。
 *   ★★★**18欄に出ます。★そのうち「0円」は5種類（⑦⑧⑨⑮⑯-1〜7）だけ**でした。
 *   ★★ほかは …… ★⑭㉖㉗は**人数**（0人）／★㉒㉔は**はい・いいえ**（いいえ）／
 *     ★★★**⑰（お住まいの市区町村）は、0円ではなく「1級地」として計算しています**
 *       （★`paidInput.ts` 37行 `KYUCHI_HABUITA_TOKI = 1`・44〜45行 `kyuchiToEngine()`）。
 *   ★★★**このまま「0円として計算しました」と書くと、13欄で正しくない字が出ます。**
 *     ★19,800円をお支払いになる方に、★**その方の入力が何になったかを、違う形でお伝えすることになります。**
 *   ★ですので **欄ごとに書き分けました**（★戦術Coworkのご意図＝「後出ししない」はそのままです）。
 *
 * ★★【この表は実測です】…… ★かっこの中は、★**`paidRules.ts` の行を読んで書きました**（★推測ではありません）。
 * ★★★【まだ穴があります】…… ★**この表に無い欄が空だったときは、かっこを付けずに出します**（★正しくない字は出ません）。
 *   ★★ただし「新しく空にできる欄が増えたとき、ここに1行足し忘れる」ことを止める門は、★**まだ置いていません**（★便に書きます）。
 */
export const KARA_NO_ATSUKAI: Record<string, string> = {
  '⑦': '0円として計算しました',                          // paidRules.ts 467行 `?? 0`
  // ★⑧の「何歳まで」は退職する年齢になりますが（469行）、★⑧が0円のときは読みません（470〜477行）
  '⑧': '0円として計算しました',                          // paidRules.ts 468行 `?? 0`
  '⑨': '0円として計算しました',                          // paidRules.ts 480行 `?? 0`（★欄の単位は万円）
  '⑭': '0人として計算しました',                          // paidRules.ts 533行 `?? 0`
  '⑮': '0円として計算しました',                          // paidRules.ts 534行 `?? 0`
  '⑯-1': '0円として計算しました',                        // paidRules.ts 536行 `?? 0`
  '⑯-2': '0円として計算しました',                        // paidRules.ts 537行 `?? 0`
  '⑯-3': '0円として計算しました',                        // paidRules.ts 538行 `?? 0`
  '⑯-4': '0円として計算しました',                        // paidRules.ts 539行 `?? 0`
  '⑯-5': '0円として計算しました',                        // paidRules.ts 540行 `?? 0`
  '⑯-6': '0円として計算しました',                        // paidRules.ts 541行 `?? 0`
  '⑯-7': '0円として計算しました',                        // paidRules.ts 542行 `?? 0`
  // ★★★⑰は0円ではありません。★「省く」を選ばれた方と同じ扱いで、**1級地**として計算しています
  '⑰': '1級地として計算しました',                        // paidRules.ts 608〜609行 ＋ paidInput.ts 37・44〜45行
  '㉒': '「いいえ」として計算しました',                    // paidRules.ts 428行 `moji(kagi) === 'hai'`・607行
  '㉔': '「いいえ」として計算しました',                    // paidRules.ts 428行・606行
  '㉖': '0人として計算しました',                          // paidRules.ts 598〜600行 `?? 0`
  /**
   * ★★【2026-09-15・決め1215】★㉗は**5つの値**を持ちます（★`paidRules.ts` 301〜303行）──
   *   ★人数3つ（障害者・特別障害者・同居特別障害者）／★はい・いいえ2つ（寡婦・ひとり親）。
   *   ★前は「0人・「いいえ」として計算しました」でしたが、★中黒が読みにくいとのことで、
   *     ★戦術Coworkが**こちらの案のとおりに**お決めになりました。
   */
  '㉗': '人数は0人、あてはまるかは「いいえ」として計算しました',   // paidRules.ts 601〜605行
  // ★★★㉑はここに在りません。★下の `DASHITE_INAI` に移しました（★決め1215）
};

/**
 * ★★★【2026-09-15・決め1215】**「その方には、最初から出していない欄」**。
 *
 * ★★【なぜ分けたか・戦術Cowork `senjutsu_20260915.md` 2-3】
 *   ★★★**「お答えいただいていません」は、答え忘れたと読めます。**
 *     ★★出していない欄に、この字は当たりません。
 *   ★ほかの17欄は `kara: 'nashi'` ＝ ★**出したうえで、空にできる欄**です。
 *   ★★㉑だけが違います …… ★`㉕/nai`（「あなたに配偶者はいない」）にお答えになると、
 *     ★★**㉑は欄ごと隠れます**（★`paidRules.ts` 294行 `kakusu: [… '㉑/nen']`）。
 *     ★★★`㉑/nen` は `kara: 'hissu'`（★同 311〜313行）ですので、
 *       ★**配偶者がいらっしゃる方が空のままにすると、入口で止まります**（★同 409〜413行・624行）。
 *       ★ですので、★**ここに来るのは「配偶者はいない」とお答えになった方だけ**です。
 *
 * ★★★決め1215 ＝ **「出したうえで空にできる欄」と「その方には出していない欄」を、同じ字で書かない。**
 * ★★これにより「お答えいただいていません」の行は **18行 → 17行**になります。
 */
export const DASHITE_INAI: Record<string, string> = {
  '㉑': 'この欄は、あなたには出していません（あなたに配偶者はいないとお答えになりましたので、使っていません）',
};

/**
 * ★★★【2026-09-14・決め1208】**Excelの列名は、ここだけが持ちます。**
 *
 * ★★【なぜ1か所に集めたか】…… ★列名を `addRow([...])` の中に直に書いていると、
 *   ★★**門が読めません**（★`kensa/excel_retsu_mon.mjs` が、この3本を字として読みます）。
 * ★★★【何を写しているか】…… ★**基準HTMLの画面8の「表の行名」**です（★決め1208）。
 *   ★★**説明文（基準HTML 878行「ファイルの中身」の表）は、列名の指定ではありません。**
 *   ★★★ですので **「保険料が上がる年齢」ではなく「保険料・医療費」**です（★基準HTML 853行）。
 * ★単位の「（円）」は、★値を数値のままにするため、★**列名の側**に付けています。
 */
const RETSU_S1 = ['あなたの受け取り方', 'この受け取り方で増える税金（円）', '確定申告で戻る額（円）',
  'あなたの手取り（円）', '保険料・医療費', '見方'] as const;
/**
 * ★★★【2026-09-15・決め1225】**「確定申告で戻る額（円）」を1つ足しました**（★戦術Cowork お願い1）。
 *   ★字は**基準HTMLの行名から写しました**（★画面9のカードの行名「確定申告で戻る額」・決め1208）。
 *   ★★**シート1の列名と1字1句そろえています**（★上の `RETSU_S1` の3つめ）。
 *   ★並びも**シート1と同じ**にしました（★「増える税金」の次・「手取り」の前）。
 */
const RETSU_S2 = ['番号', 'あなたの受け取り方', 'この受け取り方で増える税金（円）', '確定申告で戻る額（円）',
  'あなたの手取り（円）', '最初の年に入る額（円）', '受け取り終わる年齢', '保険料・医療費'] as const;
const RETSU_S3 = ['番号', '年', '年齢', 'その年に手元に入る額（円）', 'その年に増える税金（円）',
  'その年の手数料（円）'] as const;

/**
 * ★★【2026-09-14・決め1204】**円で出る値に、桁区切りを入れます**（★「1230000円」→「1,230,000円」）。
 *   ★★シート4は**文字列のまま**にします（★「1850万円」「33年」「61歳」と単位が混ざるためです・戦術Cowork 2節の2）。
 *   ★★★**円の欄だけ**です。★ほかの単位（万円・年・歳・月・日）には入れません。
 *   ★数でない字（★「わからない」など）は、そのまま返します。
 */
function kugiru(v: string, tani: string): string {
  if (tani !== '円') return v;
  if (!/^-?\d+$/.test(v)) return v;
  return Number(v).toLocaleString('en-US');
}

function nyuryokuNoGyou(kou: readonly Kou[], raw: Record<string, string>): [string, string][] {
  const out: [string, string][] = [];
  for (const f of PAID_FIELDS) {
    const k = kou.find((x) => x.no === f.no);
    const kagis = Object.keys(raw).filter((x) => x === f.no || x.startsWith(`${f.no}/`)).sort();
    /**
     * ★★★【2026-09-14・決め1204】**お答えいただいていない欄は、そう書きます。**
     *   ★前は**空欄**でしたので、★★「0円」なのか「お答えいただいていない」のかが**見ても分かりません**でした。
     *   ★★★実測 …… ★この欄が空のとき、★**エンジンは 0 として計算しています**
     *     （`paidRules.ts` 467・468・480行 `?? 0`）。★⑧の「何歳まで」だけは、
     *     ★★⑧が0のときは**退職する年齢そのもの**になります（★同 469行・★⑧が0でないときだけ、お答えを読みます）。
     */
    if (!k || kagis.length === 0) {
      // ★★★決め1215 …… ★その方には出していない欄は、「お答えいただいていません」と書きません
      const d = DASHITE_INAI[f.no];
      if (d) { out.push([f.label, d]); continue; }
      const a = KARA_NO_ATSUKAI[f.no];
      out.push([f.label, a ? `${KOTAE_NASHI}（${a}）` : KOTAE_NASHI]);
      continue;
    }
    for (const kagi of kagis) {
      const r = ranWoHiku(kou, kagi);
      const v = raw[kagi];
      const ji = r?.sentaku ? (r.sentaku.find((s) => s.kagi === v)?.ji ?? v)
        : r?.shurui === 'hai' ? (v === 'hai' ? 'はい' : 'いいえ')
        : v === 'wakaranai' ? 'わからない'
        : r?.tani ? `${kugiru(v, r.tani)}${r.tani}` : v;
      out.push([kagi === f.no ? f.label : `${f.label}（${kagi.slice(f.no.length + 1)}）`, ji]);
    }
  }
  return out;
}

/**
 * 4シートの .xlsx を作って bytes で返します。
 */
export async function excelWoTsukuru(k: Keisan, v: PaidInput, raw: Record<string, string>): Promise<Uint8Array> {
  const stream = new PassThrough();
  const chunks: Buffer[] = [];
  stream.on('data', (c: Buffer) => chunks.push(c));
  const owatta = new Promise<void>((resolve, reject) => { stream.on('end', resolve); stream.on('error', reject); });

  /**
   * ★★★【2026-09-14・決め1204】**`useStyles` を `true` にしました。**
   *   ★`false` のままだと、★**`numFmt`（桁区切り）が本に書かれません**（★実測：22422160 と出ていました）。
   */
  const wb = new ExcelJS.stream.xlsx.WorkbookWriter({ stream, useStyles: true, useSharedStrings: false });
  /** ★★お金の欄の書式（★決め1204・`#,##0`）。★値は**数値のまま**にします（★利用者がご自分で足せるように） */
  const KUGIRI = '#,##0';
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const okane = (row: any, ...retsu: number[]) => { for (const c of retsu) row.getCell(c).numFmt = KUGIRI; return row; };
  const { g8, D, R, p } = k;
  const b = k.kekka.bun8;

  // ---- 1 結果のまとめ
  const s1 = wb.addWorksheet('結果のまとめ');
  s1.addRow([b.midashi.join('')]).commit();
  /**
   * ★★★【2026-09-14・決め1207】**1つの文を、2つのセルに分けません。**
   *
   * ★★【前はどうなっていたか】…… `[b.atama.lbl, b.atama.ookii]` と**横に2つ**並べていましたので、
   *   ★★★A列「…あなたの手取りは、いちばん多くて」／B列「22,713,632円」と、
   *     ★**1つの文が2つのセルに分かれていました**（★戦術Cowork 2-1）。
   * ★★【なぜ直すか】…… ★画面8で2つに分かれているのは**大きい数字を見せるため**で、
   *   ★★**Excelにその作りは要りません。**
   * ★★★【どう分けるか】…… ★`lbl` の中の改行は `gamen8Bun()` が決めた**文の切れ目**です
   *   （★`gamen8Bun.ts` 133行 …… `…だと ◯円。\nあなたの手取りは、いちばん多くて`）。
   *   ★その切れ目で行に分け、★**いちばん下の文の終わりに `ookii` を付けます**。
   *   ★★ここで文を作り直していません（★`replace` で改行を消していた前の形と違う所です）。
   */
  const atamaGyou = b.atama.lbl.split('\n');
  atamaGyou[atamaGyou.length - 1] = `${atamaGyou[atamaGyou.length - 1]} ${b.atama.ookii}。`;
  for (const g of atamaGyou) s1.addRow([g]).commit();
  if (b.atama.sub) s1.addRow([b.atama.sub]).commit();
  s1.addRow([b.judge.hon.replace(/\n/g, '')]).commit();
  if (b.judge.hosoku) s1.addRow([b.judge.hosoku]).commit();
  s1.addRow([]).commit();
  /**
   * ★★★【2026-09-15・決め1230】**列名の上に1行**（★戦術Cowork 3節）。
   *   ★字は `gamen8Bun()` の `modoruYokunen` が持ちます（★基準HTML 894行から1字1句写したもの）。
   *   ★★シート2にも同じ所に入れます（★どちらにも「確定申告で戻る額」の列が在るためです）。
   */
  s1.addRow([b.modoruYokunen]).commit();
  s1.addRow([...RETSU_S1]).commit();
  for (const h of g8.houkou) {
    const row = D.find((x) => x.lab === h.lab);
    // ★★決め1214 …… 「確定申告で戻る額」を3列目に（★画面8のカードと同じ並び）
    okane(s1.addRow([h.lab, h.zei, h.modoru, h.tedori, row ? hokenNoJi(row) : '', h.mikata.join('／')]),
      2, 3, 4).commit();
  }
  /**
   * ★★★【2026-09-15・決め1227】**表のあとに、2行**（★置き場所はシート1の表の下のまま・戦術Cowork 3-3）。
   *
   * ★★★【前の回からの直し】…… ★前は `b.nokoranai`（★画面8と**同じ字**）を入れていました。
   *   ★★**これは戦術Coworkの誤った指示で、こちらがそのまま入れたものです**（★お尋ね3でお尋ねしていました）。
   *   ★★★なぜ誤りか …… ★`nokoranai` の2文めは「**先にこのファイルをダウンロードしてください**」です。
   *     ★★**このファイルを開いておられる方は、もうダウンロードなさっています。**★当たりません。
   *   ★いまは `b.nokoranaiFile`（★基準HTML 893行）＝「**このファイルは、計算し直しても、お手元に残ります**」。
   *
   * ★★決め1227 …… **同じことを、画面とファイルに同じ字で出さない。**
   * ★★**1行に1つの文**（★決め1207）。
   */
  s1.addRow([]).commit();
  for (const x of b.nokoranaiFile) s1.addRow([x]).commit();
  s1.commit();

  // ---- 2 受け取り方の一覧（全通り）
  const s2 = wb.addWorksheet('受け取り方の一覧');
  /**
   * ★★★【2026-09-15・決め1214】**見出しの上に1行**（★戦術Cowork お願い3）。
   *   ★字は**基準HTML 885行から写しました**（★`tsuginote_gamen_base.html` 183,384／`9a309ee9…`）。
   *   ★★シート2には列を足していません ── ★**測って便に書きました**（★重さの数は便の3節）。
   */
  s2.addRow([JI_S2_SHINKOKU]).commit();
  // ★★決め1230 …… ★「増える税金と手取りは…」の**次の行**（★戦術Cowork 3節）
  s2.addRow([b.modoruYokunen]).commit();
  s2.addRow([...RETSU_S2]).commit();
  /**
   * ★★★【2026-09-15・決め1225】**全通りに「確定申告で戻る額」を出します。**
   *
   * ★★★**式はここに在りません。**★`engine.ts` の `modoruGaku()` が持ちます（★§2の3）。
   * ★ここがするのは、★**キャッシュの入れ物を⑳ごとに分けて渡すこと**だけです。
   *
   * ★★【なぜ⑳ごとか】…… ★`baseCache` は**年だけを鍵**にしていますので、
   *   ★★★**1つにまとめると、別の⑳の答えが静かに返ります**（★`engine.ts` の覚え書き）。
   *   ★`taiCache` は⑳に依存しませんので、★1つで足ります。
   * ★★【なぜ `x.zei` を渡すか】…… ★`x.zei` は `build()` が返した**確定申告をした場合の税**そのものです
   *   （★`gamen8.ts` `zenToori()` が `r.zei` を写しています）。★ここで測り直しません。
   * ★★★【`D` と `R` の並び】…… ★`zenToori()` は `for (const [pl, r] of R)` で**1つずつ**積みますので、
   *   ★`D[i]` と `R[i]` は同じ案です。★★**探しに行きません**（★41,216通りで `indexOf` を呼ぶと、
   *   ★★★総当たりになります ── ★これは器の写しでこちらがしていた誤りです。★便に書きました）。
   */
  const taiCache = new Map<string, [Record<number, number>, E.KeikaRow[]]>();
  const baseCaches = new Map<number, Map<number, E.ZeiUchiwake>>();
  D.forEach((x, i) => {
    const nAge = x.nenkin_age ?? p.koteki_kaishi_age;
    let bc = baseCaches.get(nAge);
    if (!bc) { bc = new Map(); baseCaches.set(nAge, bc); }
    const modoru = E.modoruGaku(p, x.pl, x.zei, bc, taiCache);
    okane(s2.addRow([i + 1, x.lab, x.zei, modoru, x.tedori, x.age0, x.owari, hokenNoJi(x)]),
      3, 4, 5, 6).commit();
  });
  s2.commit();

  // ---- 3 年ごとの内訳（★この便では2本）
  const s3 = wb.addWorksheet('年ごとの内訳');
  const ketsuron = D.find((x) => x.lab === g8.houkou[0]?.lab) ?? null;
  const ichiji = ichijikinNoAn(k, IDECO_NAME);
  const an = [ketsuron, ichiji].filter((x): x is Row => x !== null);
  const seen = new Set<Row>();
  const anRows = an.filter((x) => { if (seen.has(x)) return false; seen.add(x); return true; })
    .map((x) => ({ x, i: D.indexOf(x), ...nenNoHani(R[D.indexOf(x)][1]) }));

  // ★添え字（税金の字の型・senjutsu_20260905g.md 1番②）。★シート3の先頭の行に1つ
  s3.addRow([JI_S3_SOEJI]).commit();
  // ★注記は、拠出が終わってから受け取り始めるまでの年がある案が1つでもあるときだけ（senjutsu_20260903c.md 1番の字）
  if (anRows.some((a) => a.first < a.uketoriFirst)) s3.addRow([JI_S3_KOZA]).commit();
  s3.addRow([...RETSU_S3]).commit();
  anRows.forEach((a, n) => {
    if (n > 0) s3.addRow([]).commit();          // ★案と案の間に空の行を1つ（どこまでが1つの案か分かるように）
    const r = R[a.i][1];
    let gKei = 0, zKei = 0, tKei = 0;
    for (let y = a.first; y <= a.last; y++) {
      const gaku = r.haitta_by_year?.[y] ?? 0;
      const zei = r.harau?.[y] ?? 0;
      const tesu = r.tesuryo_by_year?.[y] ?? 0;
      gKei += gaku; zKei += zei; tKei += tesu;
      okane(s3.addRow([a.i + 1, y, p.age(y), gaku, zei, tesu]), 4, 5, 6).commit();
    }
    // ★合計と手取りの2行（案ごと）。★「年」の列に語を置きます（その行が「年」の行ではないため）
    okane(s3.addRow([a.i + 1, '合計', '', gKei, zKei, tKei]), 4, 5, 6).commit();
    okane(s3.addRow([a.i + 1, '手取り', '', gKei - zKei - tKei, '', '']), 4).commit();
  });
  s3.commit();

  // ---- 4 計算の内容と根拠
  const s4 = wb.addWorksheet('計算の内容と根拠');
  s4.addRow(['ご入力の内容']).commit();
  for (const [l, val] of nyuryokuNoGyou(paidKou(k.kekka.genzaiNen), raw)) s4.addRow([l, val]).commit();
  s4.addRow([]).commit();

  /**
   * ★★★【2026-09-15・決め1231】**計算の全ステップ**（★戦術Cowork `senjutsu_20260915e.md` 1節）。
   *
   * ★★【なぜ入れるか】…… ★基準HTMLの「ファイルの中身」の4行目は、★**4画面ともこう約束しています** ──
   *   「4　計算の内容と根拠 ｜ あなたがご入力になった内容、**計算の全ステップ**、根拠にした条文」。
   *   ★★★**ところが、この本には1行も入っていませんでした**（★戦術Coworkが本を開いて見つけられました）。
   *
   * ★★【何を出すか】…… ★**画面11のかたまり**（`GAMEN11`）に、`gamen11Bun()` の値を入れたもの。
   *   ★★字は**基準HTMLのまま**です（★`gamen11.ts` は `gamen_chushutsu.mjs` が機械で抜き出したもの）。
   *   ★★★**ここに式はありません** …… ★当てはめは `gamen11Atai.ts` の `atai11()` が持ちます（★正本）。
   *
   * ★★【どの案を出すか】…… ★★**シート3と同じ案**（★`anRows`）です（★戦術Coworkの決め）。
   *   ★利用者が、同じ案の「年ごとの内訳」と「計算の全ステップ」を並べて読めます。
   *   ★案の番号（★シート2の「番号」）を見出しに添えます。
   *
   * ★★`setai_kubun`・`hikazei_gendo` は**画面9詳細と同じ字**です。
   *   ★★★**画面9詳細は作りません**（★1案あたりが重くなります）── ★`setaiNoJi()` が正本です。
   */
  const setai = setaiNoJi(p, k.kyuchiHabuita, HIHOKENSHA, KYUYO_SHOTOKUSHA);
  s4.addRow(['計算の全ステップ']).commit();
  /**
   * ★★★【2026-09-15・決め1233】**画面のことを言う2つの字を、ファイルには出しません**（★基準HTML 895行の覚え書き）。
   *
   * (1) ★`{an_bun}` の1文（「いま表示しているのは…**一覧で別の受け取り方を選ぶと**…切り替わります。」）
   *     ── ★★**ファイルの中に「一覧で選ぶ」動きがありません。**★すぐ上の行に、その案の番号と名前が出ています。
   *     ★★見分け方は**名前**です（★`na` に `an_bun` を持つかたまり）。★字で見分けません（★字は直る日に古びます）。
   * (2) ★「**この画面の**根拠にした資料」（`kousin`）── ★案ごとに出さず、★**節の終わりに1回だけ**、
   *     ★見出しを「**根拠にした資料**」（★`gamen8Bun()` の `konkyoShiryo`・基準HTML 896行）に替えて出します。
   *     ★★資料の本文は**そのまま**です。★★★案ごとに字が違ったら止めます（★黙って1つだけ出しません）。
   *
   * ★★★画面11そのものの字は、**1文字も変えていません**（★v1.1・`tome.md` G）。★ファイルに入れるときだけです。
   */
  let shiryo: string | null = null;
  for (const a of anRows) {
    const r = R[a.i][1];
    const t = r.tesuryo_uchiwake;
    if (!t) throw new Error('`evaluate()` が `tesuryo_uchiwake` を返していません。');
    const b11 = gamen11Bun(p, a.x.pl, r, g8.kijun.taishoku_age, IDECO_NAME);
    const kumi = kumitate(GAMEN11, MADA11,
      atai11({
        bun11: b11, tesuryo: t, nenkinGen: IDECO_NAME,
        taishokuAge: g8.kijun.taishoku_age,
        setaiKubun: setai.setaiKubun, hikazeiGendo: setai.hikazeiGendo,
      }),
      gyouNashi11(t));
    s4.addRow([]).commit();
    s4.addRow([`番号 ${a.i + 1}`, a.x.lab]).commit();
    for (const blk of kumi.dasu) {
      // ★決め1233(1) …… 「一覧で選ぶと切り替わる」の1文は、ファイルに出しません
      if ((blk.kind === 'hako' || blk.kind === 'hon') && blk.na.includes('an_bun')) continue;
      if (blk.kind === 'kousin') {
        // ★決め1233(2) …… 資料は節の終わりに1回だけ。★案ごとに字が違ったら止めます
        if (shiryo !== null && shiryo !== blk.bun) {
          throw new Error('「根拠にした資料」の字が、案によって違います。1回にまとめられませんので止めます。');
        }
        shiryo = blk.bun;
        continue;
      }
      if (blk.kind === 'hyo') for (const g of blk.gyou) s4.addRow([...g.cells]).commit();
      else if (blk.kind === 'ret') for (const kk of blk.koumoku) s4.addRow(['', kk.bun]).commit();
      else s4.addRow([blk.bun]).commit();
    }
  }
  if (shiryo !== null) {
    const ATAMA = 'この画面の根拠にした資料\n';
    if (!shiryo.startsWith(ATAMA)) {
      // ★見出しの字が変わった日に、黙って古い形で出さないための止めです
      throw new Error('「この画面の根拠にした資料」で始まっていません。基準HTMLの画面11の見出しが変わっています。');
    }
    s4.addRow([]).commit();
    s4.addRow([`${b.konkyoShiryo}\n${shiryo.slice(ATAMA.length)}`]).commit();
  }

  s4.addRow([]).commit();
  s4.addRow(['根拠にした条文']).commit();
  for (const blk of GAMEN13) {
    if (blk.kind === 'hyo') {
      for (const g of blk.gyou) {
        if (g.hitogoto) {
          // ★その方によって変わる行：縮めた年がある方だけ（ari:true・画面13と同じ文）。無い方は行ごと出さない
          const bun = hitogotoBun(k.kekka.hitogoto13)[g.hidari];
          if (!bun) continue;
          s4.addRow([g.hidari, bun]).commit();
          continue;
        }
        s4.addRow([g.hidari, g.migi]).commit();
      }
    } else if (blk.kind === 'ret') {
      for (const kk of blk.koumoku) s4.addRow(['', kk]).commit();
    } else {
      s4.addRow([blk.bun]).commit();
    }
  }
  s4.commit();

  void v;
  await wb.commit();
  await owatta;
  return new Uint8Array(Buffer.concat(chunks));
}
