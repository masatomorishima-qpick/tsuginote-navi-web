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
/**
 * ★★★【2026-09-22・戦術Cowork `kaihatsu_ate_20260922.md` 1節】**「まとめの印」を先頭に足しました。**
 *   ★結果の画面に出した受け取り方（`g8.houkou`）の行にだけ、★**画面8と同じ見方の印**を入れます。
 *   ★★「番号」の列は**残します**（★並べ替えても、画面やシート3と突き合わせられるように・戦術Coworkの決め）。
 */
const RETSU_S2 = ['まとめの印', '番号', 'あなたの受け取り方', 'この受け取り方で増える税金（円）', '確定申告で戻る額（円）',
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

// ────────────────────────────────────────────────────────────────
// 列の幅（★2026-09-21・戦術Cowork `kaihatsu_ate_20260921b.md` 1節）
//
// ★★【何が起きていたか】…… ★4シートとも `column_dimensions` が空で、どの列も既定の幅でした。
//   ★LibreOffice で開くと、★**手取りの列が `###`**・★**見出しが途中で切れる**・
//   ★**受け取り方の名前が「60歳から年」で切れる**、という姿でした（★戦術Coworkが本番のファイルで数えました）。
//
// ★★【どう決めるか】…… ★★**中身から機械で決めます**（★数を手で置きません）。
//   ★1つのセルの見た目の幅を「半角1・全角2」で数え、★その列のいちばん長い所＋ゆとり2 を幅にします。
//   ★★数の列は、**桁区切りを入れたあとの字**で数えます（★`24,997,800` は8桁ではなく10字です）。
//   ★上限を置きます ── ★置かないと、条文のような長い1文で列が画面より広くなります。
//     ★★上限に当たった列は、**となりのセルが空なら字がはみ出して見えます**（★切れません）。
// ────────────────────────────────────────────────────────────────

/** セル1つの見た目の幅（★半角1・全角2）。★改行があれば、いちばん長い行で数えます */
export function jiHaba(v: unknown, okane = false): number {
  if (v === null || v === undefined) return 0;
  const s = typeof v === 'number' ? (okane ? v.toLocaleString('en-US') : String(v)) : String(v);
  const gyou = s.split('\n');
  let max = 0;
  for (const g of gyou) {
    let w = 0;
    for (const c of g) {
      const n = c.codePointAt(0) ?? 0;
      // ★半角（ASCII・半角カナ）は1、それ以外（漢字・かな・全角記号）は2
      w += (n < 0x0100 || (n >= 0xff61 && n <= 0xff9f)) ? 1 : 2;
    }
    if (w > max) max = w;
  }
  return max;
}

/** 1行ぶん（★セルの並びと、桁区切りを入れる列の番号・1から数えます） */
type Gyou = { c: (string | number)[]; okane?: readonly number[] };

/**
 * 行の並びから、列の幅を決めます。
 * @param gyou   幅を決めるのに使う行（★長い1文だけの行は、渡さないでください）
 * @param jogen  1列の上限（★字の数）
 */
function retsuNoHaba(gyou: readonly Gyou[], jogen: number, orikaeshi = false): Partial<ExcelJS.Column>[] {
  const haba: number[] = [];
  for (const g of gyou) {
    g.c.forEach((v, i) => {
      const w = jiHaba(v, !!g.okane?.includes(i + 1));
      if (w > (haba[i] ?? 0)) haba[i] = w;
    });
  }
  /**
   * ★★`orikaeshi` …… その列の字を**折り返します**（★上限に当たった長い1文が切れないため）。
   *   ★★★シート4だけに付けます ── ★シート2は36,225行あり、★1行ずつ高さを測らせると重くなります。
   *   ★折り返す列は、★**セルの中の改行（`\n`）も見えるようになります**
   *     （★画面11の表には、2行のセルがあります。★折り返さないと**下の行が見えません**）。
   */
  return haba.map((w) => ({
    width: Math.min(jogen, Math.max(w, 4) + 2),
    ...(orikaeshi ? { style: { alignment: { wrapText: true, vertical: 'top' } } } : {}),
  }));
}

/* eslint-disable @typescript-eslint/no-explicit-any */
/** 行を1つ書きます（★お金の列には桁区切りの書式を付けます） */
function kaku(ws: any, g: Gyou, kugiriFmt: string): void {
  const row = ws.addRow(g.c);
  for (const i of g.okane ?? []) row.getCell(i).numFmt = kugiriFmt;
  row.commit();
}
/**
 * 見出しの行を固定する渡しもの（★下へ動かしても見えたまま）。
 *
 * ★★`wb.addWorksheet(名前, これ)` に渡します ── ★**あとから `ws.views = …` とは置けません**
 *   （★書き出しの `WorksheetWriter` は `views` を読むだけにしています。★実測で止まりました）。
 * @param gyou 見出しの行が上から何行めか（★1から数えます）
 */
function midashiWoTomeru(gyou: number): any {
  return { views: [{ state: 'frozen', xSplit: 0, ySplit: gyou }] };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/**
 * ★★★【2026-09-21・戦術Cowork `kaihatsu_ate_20260921.md` お願い2 ／ 同 b 2節】
 *   **中の名前（半角）とローマ字の答えを、買った方に見せません。**
 *
 * ★★【本番で出ていた姿】
 *   ```
 *   ⑥ あなたが生まれた年月日（hi）    5日
 *   ⑥ あなたが生まれた年月日（nen）   1973年
 *   ⑥ あなたが生まれた年月日（tsuki） 5月
 *   ㉓ あなたが役員として受け取る退職金（役員退職慰労金）（nai）  hai
 *   ㉕ あなたの配偶者の合計所得金額（nai）                        hai
 *   ```
 * ★★【数えました】…… `kensa/excel_gyou_kazoeru.tsx`（★28項目・枝番ぜんぶ＝鍵63本を立てて数える本）
 *   ★直す前 …… ★**`（半角の名前）` 39行 ／ ローマ字の答え 2行**（`㉕/nai`・`㉓/nai`）でした。
 *
 * ★★【直した姿】…… 3つの決まりだけです。
 *   (1) **年月日・年月の組は、1行にまとめます**（★`1973年5月5日` ／ `1988年4月 〜 2026年3月`）。
 *       ★★戦術Coworkのお願い（⑥を1行に）を、★**同じ形の組（⑫⑬⑲㉓の期間）にも当てました。**
 *   (2) のこる枝番の名前は、**`paidRules.ts` の `RAN_JI`（戦術Coworkの字）**を使います。
 *       ★★**半角の名前を字にしません**（★`nen` → `年`、`shotoku` → `合計所得金額`）。
 *   (3) `nai` の欄（㉕㉓）は、`Ran` に無い鍵ですので、★**`Kou.nai.ji`（戦術Coworkの字）**を名前にし、
 *       ★答えは **「はい」「いいえ」**にします。
 *   ★★★1つの項目が1行しか作らないときは、**枝番の名前を付けません**（★`㉑ あなたの配偶者が生まれた年` が
 *     `（あなたの配偶者が生まれた年）` と2度出ないため）。
 */
/**
 * ★★★【2026-09-21・戦術Cowork `kaihatsu_ate_20260921e.md` 4節】**Excel の行だけで使う、短い名前。**
 *
 * ★★【なぜ要るか】…… ★画面7の欄の見出し（`paidRules.ts` の `RAN_JI`）は、
 *   ★**項目の見出しが上に在る**ことを前提にした字です（例：`19歳以上23歳未満の方（特定扶養親族）`）。
 *   ★★Excel の行は **項目の見出しと名前が1行に並びます**ので、
 *     ★`㉖ 扶養親族のうち、年齢で区分が変わる方の人数（19歳以上23歳未満の方（特定扶養親族））` と、
 *     ★★**かっこが二重**になります。
 * ★★★**画面7の字（`RAN_JI`）は1文字も変えていません。**★Excel の行だけの差し替えです。
 * ★★鍵は**そのままの形**（複数件は `{n}`）で引きます ── ★`dokyo` のような末尾だけで引くと、
 *   ★★`㉖/dokyo`（同居老親等）と `㉗/dokyo`（同居特別障害者）を**取り違えます**。
 */
const EXCEL_NA: Record<string, string> = {
  '㉖/tokutei': '19歳以上23歳未満',
  '㉖/rojin': '70歳以上',
  '㉖/dokyo': '同居している70歳以上の親',
  // ★⑲の期間の組 …… 組の行を出す鍵（先頭の欄）で引きます
  '⑲/{n}/hajime/nen': '勤続期間・加入期間',
};

/** 複数件の番号を `{n}` に戻した鍵（★`EXCEL_NA` を引くため） */
const kagiKata = (kagi: string): string => kagi.replace(/\/\d+\//, '/{n}/');

/** 年月の組（`hajime/nen` `hajime/tsuki` `owari/nen` `owari/tsuki`）かどうか */
const KIKAN_EDA = ['hajime/nen', 'hajime/tsuki', 'owari/nen', 'owari/tsuki'] as const;
/** 生年月日の組（⑥） */
const HIZUKE_EDA = ['nen', 'tsuki', 'hi'] as const;

/** `1988年4月 〜 2026年3月`。★月が空なら年だけ。★年が空なら、その側を出しません */
function kikanNoJi(get: (eda: string) => string | undefined): string | null {
  const gawa = (m: string) => {
    const n = get(`${m}/nen`), t = get(`${m}/tsuki`);
    if (!n) return null;
    return t ? `${n}年${t}月` : `${n}年`;
  };
  const h = gawa('hajime'), o = gawa('owari');
  if (!h && !o) return null;
  return `${h ?? ''} 〜 ${o ?? ''}`.trim();
}

/**
 * 複数件（⑪⑲）は、枝番の名前の前に**件の番号**を付けます（`1/gaku` → `1件め・額`）。
 * ★件でなければ、名前をそのまま返します。
 */
function ken1(eda: string, na: string, ji: string): [string, string] {
  const m = /^(\d+)\//.exec(eda);
  return [m ? [`${m[1]}件め`, na].filter(Boolean).join('・') : na, ji];
}

/** `1973年5月5日`。★月・日が空なら、そこまで */
function hizukeNoJi(get: (eda: string) => string | undefined): string | null {
  const n = get('nen'), t = get('tsuki'), h = get('hi');
  if (!n) return null;
  if (!t) return `${n}年`;
  return h ? `${n}年${t}月${h}日` : `${n}年${t}月`;
}

/** ★`kensa/excel_gyou_kazoeru.tsx` が、この1本をそのまま数えます（★数える本に写しを作らないため） */
export function nyuryokuNoGyou(kou: readonly Kou[], raw: Record<string, string>): [string, string][] {
  const out: [string, string][] = [];
  for (const f of PAID_FIELDS) {
    const k = kou.find((x) => x.no === f.no);
    const aru0 = Object.keys(raw).filter((x) => x === f.no || x.startsWith(`${f.no}/`));
    /**
     * ★★★【2026-09-21】**鍵の並びを `paidKou()` の並びにそろえます。**
     *   ★前は `sort()`（★半角の名前のあいうえお順）でしたので、★★画面7の並びと合っていませんでした
     *     （例：㉖が `dokyo` → `rojin` → `tokutei`。★画面7は「特定 → 老人 → 同居老親」の順です）。
     *   ★`nai` の欄（㉕㉓）は、その項目の**先頭**に置きます（★「いない」が先・画面7と同じ）。
     *   ★この並びに無い鍵は、あとから元の順で足します（★黙って落とさないため）。
     */
    const jun: string[] = [];
    if (k && k.katachi === 'kumi' && k.nai) jun.push(k.nai.kagi);
    if (k) {
      if (k.katachi === 'ken') {
        // ★件ごとにまとめます（★1件めの欄をぜんぶ → 2件めの欄をぜんぶ）
        for (let n = 1; n <= k.max; n++) for (const r of k.ran) jun.push(r.kagi.replace('{n}', String(n)));
      } else {
        for (const r of (k.katachi === 'tan' ? [k.ran] : k.ran)) jun.push(r.kagi);
      }
    }
    const kagis = [...jun.filter((x) => aru0.includes(x)), ...aru0.filter((x) => !jun.includes(x))];
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
    /**
     * ★決まり(1) …… 年月日・年月の組を、1行にまとめます。
     *   ★`eda` は鍵から項目の番号を取ったもの（`⑫/hajime/nen` → `hajime/nen`、
     *     `⑲/1/hajime/nen` → `1/hajime/nen`）。★複数件は「件ごと」にまとめます。
     */
    const eda = (kagi: string) => (kagi === f.no ? '' : kagi.slice(f.no.length + 1));
    /** まとめた鍵（★下のふつうの行から外します）。★値は「その組の行を出す鍵」（＝組の先頭の鍵） */
    const tsukatta = new Map<string, string>();
    /** 組の行（鍵 → ［枝番の名前・値］） */
    const kumiGyou = new Map<string, [string, string]>();
    /**
     * ★★**期間の組を先に取ります。**★あとで日付の組を取ると、
     *   ★`⑫/hajime/nen` の `nen` が**日付の組にも当たって**しまいます（★こちらの誤りでした・実測で出ました）。
     */
    const atamas = (eda0: readonly string[]) => {
      const s = new Set<string>();
      for (const kagi of kagis) {
        if (tsukatta.has(kagi)) continue;
        const e = eda(kagi);
        for (const su of eda0) if (e === su || e.endsWith(`/${su}`)) s.add(e.slice(0, e.length - su.length));
      }
      return s;
    };
    for (const atama of atamas(KIKAN_EDA)) {
      const kagi0 = `${f.no}/${atama}hajime/nen`;
      const aru = (su: string) => kagis.includes(`${f.no}/${atama}${su}`);
      const ji = kikanNoJi((su) => raw[`${f.no}/${atama}${su}`] || undefined);
      for (const su of KIKAN_EDA) if (aru(su)) tsukatta.set(`${f.no}/${atama}${su}`, kagi0);
      // ★枝番の名前 …… Excel だけの短い名前 → 組の先頭の欄の `kumiJi`（⑲㉓）→ 無ければ件の番号だけ（⑫⑬）
      const na = EXCEL_NA[kagiKata(kagi0)] ?? ranWoHiku(kou, kagi0)?.kumiJi ?? '';
      if (ji) kumiGyou.set(kagi0, [na, ji]);
    }
    for (const atama of atamas(HIZUKE_EDA)) {
      const kagi0 = `${f.no}/${atama}nen`;
      const aru = (su: string) => kagis.includes(`${f.no}/${atama}${su}`);
      /**
       * ★★**年だけの欄を、日付の組にしません。**
       *   ★`⑲/{n}/nen` は「受け取った年」・`㉑/nen` は「配偶者が生まれた年」で、★日付の組ではありません
       *     （★こちらの誤りでした ── ★実測で `⑲ …（1件め）　1990年` と、名前が消えて出ました）。
       *   ★月か日がいっしょに在るときだけ、組にします。
       */
      if (!aru('tsuki') && !aru('hi')) continue;
      const ji = hizukeNoJi((su) => raw[`${f.no}/${atama}${su}`] || undefined);
      for (const su of HIZUKE_EDA) if (aru(su)) tsukatta.set(`${f.no}/${atama}${su}`, kagi0);
      if (ji) kumiGyou.set(kagi0, ['', ji]);
    }

    /** 1つの項目ぶんの行（枝番の名前・値）。★あとで、1行だけなら名前を落とせることがあります */
    const kono: [string, string][] = [];
    for (const kagi of kagis) {
      const matome = tsukatta.get(kagi);
      if (matome !== undefined) {
        // ★組にまとめた鍵 …… 先頭の鍵の所で1行だけ出します（★鍵の並びのまま）
        const g = matome === kagi ? kumiGyou.get(kagi) : undefined;
        if (g) kono.push(ken1(eda(kagi), g[0], g[1]));
        continue;
      }
      const r = ranWoHiku(kou, kagi);
      const v = raw[kagi];
      /**
       * ★決まり(3) …… `nai` の欄（㉕㉓）は `Ran` に無い鍵です。★`Kou.nai`（戦術Coworkの字）で出します。
       *   ★★前はここで `r` が `undefined` になり、★**raw の字（`hai`）がそのまま出ていました。**
       */
      const nai = k && k.katachi === 'kumi' && k.nai && k.nai.kagi === kagi ? k.nai : null;
      const ji = nai ? (v === 'hai' ? 'はい' : 'いいえ')
        : r?.sentaku ? (r.sentaku.find((s) => s.kagi === v)?.ji ?? v)
        : r?.shurui === 'hai' ? (v === 'hai' ? 'はい' : 'いいえ')
        : v === 'wakaranai' ? 'わからない'
        : r?.tani ? `${kugiru(v, r.tani)}${r.tani}` : v;
      /**
       * ★決まり(2) …… 枝番の名前は `RAN_JI`（`r.ji`）。★無ければ半角の名前に**落としません** ──
       *   ★★名前が無い欄は、この時点で `⑧`（項目そのもの）か、上で組にまとめた欄だけです。
       */
      const e = eda(kagi);
      const na = kagi === f.no ? '' : (nai ? nai.ji : (EXCEL_NA[kagiKata(kagi)] ?? r?.ji ?? e));
      kono.push(ken1(e, na, ji));
    }
    /**
     * ★★**1行しか作らない項目は、枝番の名前を落とします** ── ★ただし、次の2つだけです。
     *   (ア) 名前が空（★項目そのものの欄・組にまとめた欄）
     *   (イ) 名前が、項目の見出しの終わりと同じ（★`㉑ あなたの配偶者が生まれた年（あなたの配偶者が生まれた年）` を避けます）
     * ★★★これ以外は**落としません** ── ★落とすと、
     *   ★`㉕ あなたの配偶者の合計所得金額｜はい`（★何に「はい」なのか分かりません）や、
     *   ★`⑪ …｜0`（★知らない鍵の値が、答えのように出ます）になります。★どちらも実測で出ました。
     */
    if (kono.length === 1 && (kono[0][0] === '' || f.label.endsWith(kono[0][0]))) {
      out.push([f.label, kono[0][1]]);
      continue;
    }
    /**
     * ★★★【2026-09-21・戦術Cowork `kaihatsu_ate_20260921f.md` 1節】
     *   **枝番の名前は、いつも `／` でつなぎます。かっこは使いません。**
     *
     * ★★【なぜ「いつも」か】…… ★はじめは「項目の見出しにかっこが在るときだけ `／`」にしていましたが、
     *   ★★それだと**2つの形が混ざります**（★戦術Coworkのお決め）。
     * ★★★これで、行に出る `（　）` は **基準HTMLの見出しの中のものだけ**になります。
     *   ★名前が無い行は、見出しだけです（★⑥⑫のように、1行にまとめた組）。
     *   ★`㉕㉓` の `nai` の字も `／` でつなぎます。
     */
    for (const [na, ji] of kono) out.push([na ? `${f.label}／${na}` : f.label, ji]);
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

  /**
   * ★★★【2026-09-21・戦術Cowork `kaihatsu_ate_20260921b.md` 1節】**列の幅を、中身から決めます。**
   *   ★幅は**シートを作る前**に渡さなければなりません（★`exceljs` の書き出しは、
   *     ★★最初の行を書いた時点で「列の決まり」を本に書いてしまいます）。
   *   ★ですので、★**行をいったんためて**から、幅を数え、シートを作って書きます。
   *   ★★シート2だけは**ためません**（★36,225行を持つと重くなります）── ★中身を先に1度なでて幅を数えます。
   */
  /** 1列の上限（★字の数）。★条文のような長い1文で、列が画面より広くならないように */
  const HABA_JOGEN = 60;
  /** ★シート2の列名の行が、上から何行めか（★注記4行の次） */
  const S2_MIDASHI = 5;

  // ---- 1 結果のまとめ
  const g1: Gyou[] = [];
  g1.push({ c: [b.midashi.join('')] });
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
  for (const g of atamaGyou) g1.push({ c: [g] });
  if (b.atama.sub) g1.push({ c: [b.atama.sub] });
  g1.push({ c: [b.judge.hon.replace(/\n/g, '')] });
  if (b.judge.hosoku) g1.push({ c: [b.judge.hosoku] });
  g1.push({ c: [] });
  /**
   * ★★★【2026-09-15・決め1230】**列名の上に1行**（★戦術Cowork 3節）。
   *   ★字は `gamen8Bun()` の `modoruYokunen` が持ちます（★基準HTML 894行から1字1句写したもの）。
   *   ★★シート2にも同じ所に入れます（★どちらにも「確定申告で戻る額」の列が在るためです）。
   */
  g1.push({ c: [b.modoruYokunen] });
  /** ★シート1の列名の行が、上から何行めか（★幅を数える先頭。★固定はしません・決め＝便e 3節） */
  const s1Midashi = g1.length + 1;
  g1.push({ c: [...RETSU_S1] });
  for (const h of g8.houkou) {
    const row = D.find((x) => x.lab === h.lab);
    // ★★決め1214 …… 「確定申告で戻る額」を3列目に（★画面8のカードと同じ並び）
    g1.push({ c: [h.lab, h.zei, h.modoru, h.tedori, row ? hokenNoJi(row) : '', h.mikata.join('／')], okane: [2, 3, 4] });
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
  g1.push({ c: [] });
  for (const x of b.nokoranaiFile) g1.push({ c: [x] });
  /**
   * ★★★【2026-09-21・戦術Cowork `kaihatsu_ate_20260921e.md` 3節】**シート1は固定しません。**
   *   ★列名の行が8行めにあり、★シート1は全14行です。★8行を固定すると**動かせる行が6行**になり、
   *     ★★**表が短いので、固定の値打ちがありません**（★戦術Coworkのお決め）。
   *   ★シート2（3行）・シート3（2行）・シート4（1行）の固定は、そのままです。
   */
  const s1 = wb.addWorksheet('結果のまとめ');
  /**
   * ★幅は**表の所だけ**から数えます（★`s1Midashi` 行め以降）。
   *   ★上の1文ずつの行は、★**A列だけ**に長い文が入っていますので、★幅に数えるとA列が画面より広くなります。
   *   ★★となりのセルが空ですので、★その文は**はみ出して見えます**（★切れません）。
   */
  s1.columns = retsuNoHaba(g1.slice(s1Midashi - 1), HABA_JOGEN);
  for (const g of g1) kaku(s1, g, KUGIRI);
  s1.commit();

  // ---- 2 受け取り方の一覧（全通り）
  // ★シート2の列名は5行め（★上の4行は注記。★2026-09-22 に2行足しました）。★下へ動かしても見えたままにします
  const s2 = wb.addWorksheet('受け取り方の一覧', midashiWoTomeru(S2_MIDASHI));
  /**
   * ★★★【2026-09-15・決め1214】**見出しの上に1行**（★戦術Cowork お願い3）。
   *   ★字は**基準HTML 885行から写しました**（★`tsuginote_gamen_base.html` 183,384／`9a309ee9…`）。
   *   ★★シート2には列を足していません ── ★**測って便に書きました**（★重さの数は便の3節）。
   */
  /**
   * ★★★【2026-09-21】**幅を、行を書く前に数えます**（★36,225行をためないため）。
   *   ★数えるのは **列名の行と、`D` の中身**です（★上の2行は1文ずつですので、外します・シート1と同じ）。
   *   ★「確定申告で戻る額」は `modoruGaku()` を呼ばないと出ませんが、
   *     ★★**桁は「増える税金」と同じか小さい**ので（★戻る額 ≤ 納めた税）、
   *     ★★★ここでは `x.zei` の桁で数えます（★足りなければ `###` になりますので、下の門で見ます）。
   */
  /**
   * ★★★【2026-09-22・戦術Cowork `kaihatsu_ate_20260922.md` 1節】**手取りの多い順に並べます。**
   *   ★同じ額のときは、**いまの番号の小さい順**（★戦術Coworkの決め）。
   *   ★★**`D` の並びは変えません。**★ここで作るのは「どの順に書くか」の名簿だけです
   *     （★`D[i]` と `R[i]` が同じ案である決まりを崩さないため・下の覚え書き）。
   */
  const s2Jun = D.map((_, i) => i).sort((a, c) => D[c].tedori - D[a].tedori || a - c);
  /**
   * ★「まとめの印」…… 結果の画面に出した受け取り方（`g8.houkou`）の行にだけ入れます。
   *   ★★字は**画面8の見方の印**（`MIKATA` の頭の○数字）です。★シート1の「見方」の列と同じものを指します。
   *   ★★★**この本で新しい番号を作っていません**（★1つのファイルの中で `①` が2つの意味を持たないため）。
   */
  const shirushi = new Map<number, string>();
  for (const h of g8.houkou) {
    const i = D.findIndex((x) => x.lab === h.lab);
    if (i < 0) continue;
    shirushi.set(i, h.mikata.map((m) => m.slice(0, 1)).join('／'));
  }
  const s2Gyou = (i: number, modoru: number | string) =>
    [shirushi.get(i) ?? '', i + 1, D[i].lab, D[i].zei, modoru, D[i].tedori, D[i].age0, D[i].owari, hokenNoJi(D[i])];

  s2.columns = retsuNoHaba([
    { c: [...RETSU_S2] },
    ...D.map((x, i) => ({ c: s2Gyou(i, x.zei), okane: [4, 5, 6, 7] as const })),
  ], HABA_JOGEN);
  s2.addRow([JI_S2_SHINKOKU]).commit();
  // ★★決め1230 …… ★「増える税金と手取りは…」の**次の行**（★戦術Cowork 3節）
  s2.addRow([b.modoruYokunen]).commit();
  /**
   * ★★★【2026-09-22・同 1節】**表の上に2行**（★ふるいの行の上）。
   *   ★通り数は `D.length` から作ります（★画面9の `toori_kazu` と同じ「◯◯通り」の形）。
   */
  s2.addRow([`この表は、計算した${D.length.toLocaleString('en-US')}通りすべてです。手取りの多い順に並んでいます。`]).commit();
  s2.addRow(['①②③の印は、結果の画面に出した受け取り方です。']).commit();
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
  for (const i of s2Jun) {
    const x = D[i];
    const nAge = x.nenkin_age ?? p.koteki_kaishi_age;
    let bc = baseCaches.get(nAge);
    if (!bc) { bc = new Map(); baseCaches.set(nAge, bc); }
    const modoru = E.modoruGaku(p, x.pl, x.zei, bc, taiCache);
    okane(s2.addRow(s2Gyou(i, modoru)), 4, 5, 6, 7).commit();
  }
  /**
   * ★★★【2026-09-22・同 1節】**見出しの行にふるい（フィルター）を付けます。**
   *   ★実測 …… 大きさ ＋28バイト ／ 読む時間 ＋5ms（★前の便の3節）。
   */
  s2.autoFilter = { from: { row: S2_MIDASHI, column: 1 }, to: { row: S2_MIDASHI + D.length, column: RETSU_S2.length } };
  s2.commit();

  // ---- 3 年ごとの内訳（★この便では2本）
  const g3: Gyou[] = [];
  const ketsuron = D.find((x) => x.lab === g8.houkou[0]?.lab) ?? null;
  const ichiji = ichijikinNoAn(k, IDECO_NAME);
  const an = [ketsuron, ichiji].filter((x): x is Row => x !== null);
  const seen = new Set<Row>();
  const anRows = an.filter((x) => { if (seen.has(x)) return false; seen.add(x); return true; })
    .map((x) => ({ x, i: D.indexOf(x), ...nenNoHani(R[D.indexOf(x)][1]) }));

  // ★添え字（税金の字の型・senjutsu_20260905g.md 1番②）。★シート3の先頭の行に1つ
  g3.push({ c: [JI_S3_SOEJI] });
  // ★注記は、拠出が終わってから受け取り始めるまでの年がある案が1つでもあるときだけ（senjutsu_20260903c.md 1番の字）
  if (anRows.some((a) => a.first < a.uketoriFirst)) g3.push({ c: [JI_S3_KOZA] });
  /** ★シート3の列名の行が、上から何行めか（★注記が1行のときと2行のときがあります） */
  const s3Midashi = g3.length + 1;
  g3.push({ c: [...RETSU_S3] });
  anRows.forEach((a, n) => {
    if (n > 0) g3.push({ c: [] });          // ★案と案の間に空の行を1つ（どこまでが1つの案か分かるように）
    const r = R[a.i][1];
    let gKei = 0, zKei = 0, tKei = 0;
    for (let y = a.first; y <= a.last; y++) {
      const gaku = r.haitta_by_year?.[y] ?? 0;
      const zei = r.harau?.[y] ?? 0;
      const tesu = r.tesuryo_by_year?.[y] ?? 0;
      gKei += gaku; zKei += zei; tKei += tesu;
      g3.push({ c: [a.i + 1, y, p.age(y), gaku, zei, tesu], okane: [4, 5, 6] });
    }
    // ★合計と手取りの2行（案ごと）。★「年」の列に語を置きます（その行が「年」の行ではないため）
    g3.push({ c: [a.i + 1, '合計', '', gKei, zKei, tKei], okane: [4, 5, 6] });
    g3.push({ c: [a.i + 1, '手取り', '', gKei - zKei - tKei, '', ''], okane: [4] });
  });
  const s3 = wb.addWorksheet('年ごとの内訳', midashiWoTomeru(s3Midashi));
  // ★幅は表の所だけから（★上の注記は1文ずつ・A列にだけ入りますので、はみ出して見えます）
  s3.columns = retsuNoHaba(g3.slice(s3Midashi - 1), HABA_JOGEN);
  for (const g of g3) kaku(s3, g, KUGIRI);
  s3.commit();

  // ---- 4 計算の内容と根拠
  const g4: Gyou[] = [];
  /**
   * ★★★【2026-09-21】**この節の行だけで、A列とB列の幅を決めます。**
   *   ★下の「計算の全ステップ」「根拠にした条文」は、★**A列に長い1文**が入る行が多くあります。
   *   ★それを幅に数えると、A列が画面より広くなります。★となりが空なら、はみ出して見えます。
   */
  const s4Haba: Gyou[] = [];
  g4.push({ c: ['ご入力の内容'] });
  for (const [l, val] of nyuryokuNoGyou(paidKou(k.kekka.genzaiNen), raw)) {
    g4.push({ c: [l, val] });
    s4Haba.push({ c: [l, val] });
  }
  g4.push({ c: [] });

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
  g4.push({ c: ['計算の全ステップ'] });
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
    g4.push({ c: [] });
    g4.push({ c: [`番号 ${a.i + 1}`, a.x.lab] });
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
      if (blk.kind === 'hyo') for (const g of blk.gyou) { g4.push({ c: [...g.cells] }); s4Haba.push({ c: [...g.cells] }); }
      else if (blk.kind === 'ret') for (const kk of blk.koumoku) g4.push({ c: ['', kk.bun] });
      else g4.push({ c: [blk.bun] });
    }
  }
  if (shiryo !== null) {
    const ATAMA = 'この画面の根拠にした資料\n';
    if (!shiryo.startsWith(ATAMA)) {
      // ★見出しの字が変わった日に、黙って古い形で出さないための止めです
      throw new Error('「この画面の根拠にした資料」で始まっていません。基準HTMLの画面11の見出しが変わっています。');
    }
    g4.push({ c: [] });
    g4.push({ c: [`${b.konkyoShiryo}\n${shiryo.slice(ATAMA.length)}`] });
  }

  g4.push({ c: [] });
  g4.push({ c: ['根拠にした条文'] });
  for (const blk of GAMEN13) {
    if (blk.kind === 'hyo') {
      for (const g of blk.gyou) {
        if (g.hitogoto) {
          // ★その方によって変わる行：縮めた年がある方だけ（ari:true・画面13と同じ文）。無い方は行ごと出さない
          const bun = hitogotoBun(k.kekka.hitogoto13)[g.hidari];
          if (!bun) continue;
          g4.push({ c: [g.hidari, bun] }); s4Haba.push({ c: [g.hidari, bun] });
          continue;
        }
        g4.push({ c: [g.hidari, g.migi] }); s4Haba.push({ c: [g.hidari, g.migi] });
      }
    } else if (blk.kind === 'ret') {
      for (const kk of blk.koumoku) g4.push({ c: ['', kk] });
    } else {
      g4.push({ c: [blk.bun] });
    }
  }
  // ★シート4に「列名の行」はありません（★表ではなく、読む本です）。★先頭の1行を固定します
  const s4 = wb.addWorksheet('計算の内容と根拠', midashiWoTomeru(1));
  s4.columns = retsuNoHaba(s4Haba, HABA_JOGEN, true);
  for (const g of g4) kaku(s4, g, KUGIRI);
  s4.commit();

  void v;
  await wb.commit();
  await owatta;
  return new Uint8Array(Buffer.concat(chunks));
}
