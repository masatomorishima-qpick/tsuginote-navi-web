/**
 * components/retirement/pro/gamen9.ts
 *
 * **このファイルは手で書きません。**`kensa/gamen_chushutsu.mjs` が
 * 基準HTMLから機械で作ります。直したいときは**基準HTMLを直して作り直してください。**
 *
 *   node kensa/gamen_chushutsu.mjs <基準HTML> 9 > components/retirement/pro/gamen9.ts
 *
 * 画面9。**基準HTMLの文がそのまま入ります。こちらが書き直してはいけません（§2の8）。**
 *
 * **その方によって変わるところは `{名前}` になっています。**
 * 名前は基準HTMLの `data-na`（＝エンジンの鍵の名前・判断ログ83①）です。
 * **推測では立てていません。印だけを見ています。**
 *
 * もと: bin/senjutsu/tsuginote_gamen_base.html（177,710バイト ／ md5 4713aed7c1b3ed058eab15f611d2a362）
 */

/** 表の1行。`cells` は左から順のセル。`na` は、この行に出る `{名前}` の一覧 */
export type Gyou9 = {
  cells: readonly string[];
  na: readonly string[];
  /** ★セルごと・行ごとの名前（`cells` を `\n` で割った順）。**基準HTMLの `class` そのまま**。無い所は null */
  kazari: readonly (readonly (string | null)[])[];
  /** ★行そのものの名前（`sum`・`shikiri`）。無ければ入りません */
  gyoKazari?: string;
};

export type Block9 =
  | { kind: 'midashi'; lv: 2 | 3; bun: string }
  | { kind: 'hon'; bun: string; na: readonly string[] }
  | { kind: 'hako'; bun: string; na: readonly string[] }
  | { kind: 'kousin'; bun: string }
  | { kind: 'ret'; koumoku: { bun: string; na: readonly string[] }[] }
  | { kind: 'hyo'; gyou: Gyou9[] };

export const GAMEN9: readonly Block9[] = [
  { kind: 'midashi', lv: 2, bun: "退職金受け取りパターン一覧" },
  { kind: 'hako', bun: "並び順", na: [] },
  { kind: 'hako', bun: "手取りが多い順増える税金が少ない順早く受け取り終える順最初の年に多く受け取る順", na: [] },
  { kind: 'hako', bun: "絞り込み", na: [] },
  { kind: 'hon', bun: "保険料・医療費が上がらない受け取り方だけ", na: [] },
  { kind: 'hon', bun: "{nenkin_gen}を{ideco_jogen_age}歳までに受け取り終える", na: ["nenkin_gen","ideco_jogen_age"] },
  { kind: 'hyo', gyou: [
    { cells: ["あなたの受け取り方","手取り","いちばん上との差"],
      na: [],
      kazari: [[null],[null],[null]] },
    { cells: ["{an_label1}\n{hoken_bun1}","{tedori1}","{sa1}"],
      na: ["an_label1","hoken_bun1","tedori1","sa1"],
      kazari: [[null,null],[null],[null]] },
    { cells: ["{an_label2}\n{hoken_bun2}","{tedori2}","{sa2}"],
      na: ["an_label2","hoken_bun2","tedori2","sa2"],
      kazari: [[null,null],[null],[null]] },
    { cells: ["{an_label3}\n{hoken_bun3}","{tedori3}","{sa3}"],
      na: ["an_label3","hoken_bun3","tedori3","sa3"],
      kazari: [[null,null],[null],[null]] },
    { cells: ["{an_label4}\n{hoken_bun4}","{tedori4}","{sa4}"],
      na: ["an_label4","hoken_bun4","tedori4","sa4"],
      kazari: [[null,null],[null],[null]] },
    { cells: ["{an_label5}\n{hoken_bun5}","{tedori5}","{sa5}"],
      na: ["an_label5","hoken_bun5","tedori5","sa5"],
      kazari: [[null,null],[null],[null]] },
    { cells: ["{an_label6}\n{hoken_bun6}","{tedori6}","{sa6}"],
      na: ["an_label6","hoken_bun6","tedori6","sa6"],
      kazari: [[null,null],[null],[null]] },
    { cells: ["{an_label7}\n{hoken_bun7}","{tedori7}","{sa7}"],
      na: ["an_label7","hoken_bun7","tedori7","sa7"],
      kazari: [[null,null],[null],[null]] },
  ] },
  { kind: 'hon', bun: "この一覧は、選んだ並び順の上から{ichiran_kensu}を並べています。この{ichiran_kensu}のうち、手取りがいちばん多いものといちばん少ないものの差は{ichiran_haba}です。あなたが選べる{toori_kazu}全部で見ると、この差は{zenbu_haba}になります。並び順を変えると、ここに出る受け取り方も変わります。すべての受け取り方は、下のファイルでご覧いただけます。", na: ["ichiran_kensu","ichiran_haba","toori_kazu","zenbu_haba"] },
  { kind: 'hako', bun: "・この表の手取りは、あなたの退職金とiDeCo等から、税金と手数料を引いた額です。公的年金の受取額は入っていません\n・公的年金を受け取り始める年齢を変えると、あなたが受け取る公的年金の額も変わりますが、それはこの表に入っていません。公的年金を含めた比べ方は、このあとの「受け取り方の比較」でお出しします\n・この表の手取りには、公的医療保険料・介護保険料は含めていません\n・あなたの退職金を一時金で受け取ることは、保険料には影響しません\n・「＋」は、この表のいちばん上の行より手取りが多いという意味です（「手取りが多い順」以外の並び順で出ることがあります）", na: [] },
  { kind: 'hako', bun: "結果をダウンロード（Excel）", na: [] },
  { kind: 'hon', bun: "すべての受け取り方と、年ごとの内訳、計算の根拠までを1つのファイルにまとめてお渡しします。", na: [] },
] as const;

/** その方によって変わるものの**種類**（`data-na` の異なり数） */
export const HITOGOTO_SHURUI: readonly string[] = ["nenkin_gen","ideco_jogen_age","an_label1","hoken_bun1","tedori1","sa1","an_label2","hoken_bun2","tedori2","sa2","an_label3","hoken_bun3","tedori3","sa3","an_label4","hoken_bun4","tedori4","sa4","an_label5","hoken_bun5","tedori5","sa5","an_label6","hoken_bun6","tedori6","sa6","an_label7","hoken_bun7","tedori7","sa7","ichiran_kensu","ichiran_haba","toori_kazu","zenbu_haba"];

/** その方によって変わるものの**箇所**（同じ名前が2か所なら2と数えます・判断ログ83③） */
export const HITOGOTO_KASHO = 35;

/** **エンジンにまだ出口が無いもの**（`data-mada`・判断ログ83②）。**0になるまで本番化しません** */
export const MADA_NA: readonly string[] = ["ideco_jogen_age"];

