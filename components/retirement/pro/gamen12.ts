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
 * もと: bin/senjutsu/tsuginote_gamen_base.html（176,854バイト ／ md5 08fa7c414960f7374612597753351d23）
 */

/** 表の1行。`cells` は左から順のセル。`na` は、この行に出る `{名前}` の一覧 */
export type Gyou12 = {
  cells: readonly string[];
  na: readonly string[];
  /** ★セルごと・行ごとの名前（`cells` を `\n` で割った順）。**基準HTMLの `class` そのまま**。無い所は null */
  kazari: readonly (readonly (string | null)[])[];
  /** ★行そのものの名前（`sum`・`shikiri`）。無ければ入りません */
  gyoKazari?: string;
};

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
  { kind: 'midashi', lv: 3, bun: "あなたの確定申告について" },
  { kind: 'hon', bun: "公的年金等を受け取っている方には、その年の所得について確定申告をしなくてよいという決まりがあります（所得税法121条3項）。{shinkoku_bun}", na: ["shinkoku_bun"] },
  { kind: 'hyo', gyou: [
    { cells: ["{shinkoku_nen1}（あなたが{shinkoku_age1}の年・{shinkoku_gens1}を受け取る年）","{shinkoku_ataru1}"],
      na: ["shinkoku_nen1","shinkoku_age1","shinkoku_gens1","shinkoku_ataru1"],
      kazari: [[null],[null]] },
    { cells: ["{shinkoku_nen2}（あなたが{shinkoku_age2}の年・{shinkoku_gens2}を受け取る年）","{shinkoku_ataru2}"],
      na: ["shinkoku_nen2","shinkoku_age2","shinkoku_gens2","shinkoku_ataru2"],
      kazari: [[null],[null]] },
  ] },
  { kind: 'ret', koumoku: [
    { bun: "{shinkoku_riyu1}", na: ["shinkoku_riyu1"] },
    { bun: "{shinkoku_riyu2}", na: ["shinkoku_riyu2"] },
  ] },
  { kind: 'hon', bun: "当てはまらない場合でも、ほかの決まりで申告をしなくてよいことがあります。実際に申告が要るかどうかは、税務署または税理士にご確認ください。", na: [] },
  { kind: 'ret', koumoku: [
    { bun: "医療費控除などがある場合は、申告をすると税金が戻ることがあります", na: [] },
  ] },
  { kind: 'hako', bun: "この判定は、日本の公的年金と{nenkin_gen}だけを受け取っている場合のものです。海外の年金を受け取っている方は、当社の判定は当てはまりません。", na: ["nenkin_gen"] },
  { kind: 'hako', bun: "このツールは書類の作成や代筆はいたしません。手続きはご自身または専門家にご相談ください。金融商品の販売や紹介も行いません。", na: [] },
] as const;

/** その方によって変わるものの**種類**（`data-na` の異なり数） */
export const HITOGOTO_SHURUI: readonly string[] = ["tai_age","nenkin_gen","nenkin_kikan","gensen_ritsu","nenkin_kaishi_age","shinkoku_bun","shinkoku_nen1","shinkoku_age1","shinkoku_gens1","shinkoku_ataru1","shinkoku_nen2","shinkoku_age2","shinkoku_gens2","shinkoku_ataru2","shinkoku_riyu1","shinkoku_riyu2"];

/** その方によって変わるものの**箇所**（同じ名前が2か所なら2と数えます・判断ログ83③） */
export const HITOGOTO_KASHO = 18;

/** **エンジンにまだ出口が無いもの**（`data-mada`・判断ログ83②）。**0になるまで本番化しません** */
export const MADA_NA: readonly string[] = ["tai_age","gensen_ritsu","nenkin_kaishi_age"];

