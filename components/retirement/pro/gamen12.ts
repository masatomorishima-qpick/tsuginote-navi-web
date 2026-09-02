/**
 * components/retirement/pro/gamen12.ts
 *
 * **このファイルは手で書きません。**`kensa/gamen_chushutsu.mjs` が
 * 基準HTMLから機械で作ります。直したいときは**基準HTMLを直して作り直してください。**
 *
 *   node kensa/gamen_chushutsu.mjs <基準HTML> 12 > components/retirement/pro/gamen12.ts
 *
 * 画面12。**基準HTMLの文がそのまま入ります。こちらが書き直してはいけません（§2の8）。**
 *
 * **その方によって変わるところは `{名前}` になっています。**
 * 名前は基準HTMLの `data-na`（＝エンジンの鍵の名前・判断ログ83①）です。
 * **推測では立てていません。印だけを見ています。**
 *
 * もと: bin/senjutsu/tsuginote_gamen_base_20260831b.html（164,868バイト・印つき。★文の基準は hikiwatashi/tsuginote_gamen_base_20260812.html（155,413・印なし）で、字は同じ・2026-09-02）
 */

/** 表の1行。`cells` は左から順のセル。`na` は、この行に出る `{名前}` の一覧 */
export type Gyou12 = { cells: readonly string[]; na: readonly string[] };

export type Block12 =
  | { kind: 'midashi'; lv: 2 | 3; bun: string }
  | { kind: 'hon'; bun: string; na: readonly string[] }
  | { kind: 'hako'; bun: string; na: readonly string[] }
  | { kind: 'kousin'; bun: string }
  | { kind: 'ret'; koumoku: { bun: string; na: readonly string[] }[] }
  | { kind: 'hyo'; gyou: Gyou12[] };

export const GAMEN12: readonly Block12[] = [
  { kind: 'midashi', lv: 2, bun: "確認事項の整理" },
  { kind: 'midashi', lv: 3, bun: "あなたが{tai_age}になる前に" },
  { kind: 'ret', koumoku: [
    { bun: "ご利用の金融機関に、あなたの{nenkin_gen}を{nenkin_kikan}の年金で受け取れるかを確認する", na: ["nenkin_gen","nenkin_kikan"] },
    { bun: "あなたが年金を年に何回受け取れるかを確認する。1回ごとに440円の手数料がかかります", na: [] },
    { bun: "勤め先に、あなたの退職金の支給予定日を確認する", na: [] },
  ] },
  { kind: 'midashi', lv: 3, bun: "あなたが退職するとき" },
  { kind: 'ret', koumoku: [
    { bun: "「退職所得の受給に関する申告書」を必ず提出する。出さないと{gensen_ritsu}が引かれます", na: ["gensen_ritsu"] },
    { bun: "あなたの{nenkin_gen}の受け取り開始を{nenkin_kaishi_age}で請求する", na: ["nenkin_gen","nenkin_kaishi_age"] },
  ] },
  { kind: 'midashi', lv: 3, bun: "あなたが退職した翌年" },
  { kind: 'ret', koumoku: [
    { bun: "あなたの場合、確定申告は{shinkoku_iru}（公的年金等400万円以下かつ他の所得20万円以下）", na: ["shinkoku_iru"] },
    { bun: "ただし医療費控除などがある場合は、申告すると戻ることがあります", na: [] },
  ] },
  { kind: 'hako', bun: "この判定は、日本の公的年金と{nenkin_gen}だけを受け取っている場合のものです。海外の年金を受け取っている方は、当社の判定は当てはまりません。", na: ["nenkin_gen"] },
  { kind: 'hako', bun: "このツールは書類の作成や代筆はいたしません。手続きはご自身または専門家にご相談ください。金融商品の販売や紹介も行いません。", na: [] },
] as const;

/** その方によって変わるものの**種類**（`data-na` の異なり数） */
export const HITOGOTO_SHURUI: readonly string[] = ["tai_age","nenkin_gen","nenkin_kikan","gensen_ritsu","nenkin_kaishi_age","shinkoku_iru"];

/** その方によって変わるものの**箇所**（同じ名前が2か所なら2と数えます・判断ログ83③） */
export const HITOGOTO_KASHO = 8;

/** **エンジンにまだ出口が無いもの**（`data-mada`・判断ログ83②）。**0になるまで本番化しません** */
export const MADA_NA: readonly string[] = ["tai_age","gensen_ritsu","nenkin_kaishi_age"];

