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
 * もと: hikiwatashi/tsuginote_gamen_base_20260812.html（164,458バイト）
 */

/** 表の1行。`cells` は左から順のセル。`na` は、この行に出る `{名前}` の一覧 */
export type Gyou9 = { cells: readonly string[]; na: readonly string[] };

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
  { kind: 'hako', bun: "手取りが多い順税金が少ない順早く受け取り終える順最初の年に多く受け取る順", na: [] },
  { kind: 'hako', bun: "絞り込み", na: [] },
  { kind: 'hon', bun: "✓保険料・医療費が上がらない受け取り方だけ", na: [] },
  { kind: 'hon', bun: "{nenkin_gen}を{ideco_jogen_age}歳までに受け取り終える", na: ["nenkin_gen","ideco_jogen_age"] },
  { kind: 'hyo', gyou: [
    { cells: ["あなたの受け取り方","手取り","差"],
      na: [] },
    { cells: ["{an_label}{hoken_bun}","{tedori}","{sa}"],
      na: ["an_label","hoken_bun","tedori","sa"] },
    { cells: ["{an_label}{hoken_bun}","{tedori}","{sa}"],
      na: ["an_label","hoken_bun","tedori","sa"] },
    { cells: ["{an_label}{hoken_bun}","{tedori}","{sa}"],
      na: ["an_label","hoken_bun","tedori","sa"] },
    { cells: ["{an_label}{hoken_bun}","{tedori}","{sa}"],
      na: ["an_label","hoken_bun","tedori","sa"] },
    { cells: ["{an_label}{hoken_bun}","{tedori}","{sa}"],
      na: ["an_label","hoken_bun","tedori","sa"] },
    { cells: ["{an_label}{hoken_bun}","{tedori}","{sa}"],
      na: ["an_label","hoken_bun","tedori","sa"] },
    { cells: ["{an_label}{hoken_bun}","{tedori}","{sa}"],
      na: ["an_label","hoken_bun","tedori","sa"] },
  ] },
  { kind: 'hon', bun: "この一覧は、選んだ並び順の上位を並べています。すべての受け取り方は、下のファイルでご覧いただけます。", na: [] },
  { kind: 'hako', bun: "・この表の手取りには、公的医療保険料・介護保険料は含めていません\n・あなたの退職金を一時金で受け取ることは、保険料には影響しません", na: [] },
  { kind: 'hako', bun: "結果をダウンロード（Excel）", na: [] },
  { kind: 'hon', bun: "すべての受け取り方と、年ごとの内訳、計算の根拠までを1つのファイルにまとめてお渡しします。", na: [] },
] as const;

/** その方によって変わるものの**種類**（`data-na` の異なり数） */
export const HITOGOTO_SHURUI: readonly string[] = ["nenkin_gen","ideco_jogen_age","an_label","hoken_bun","tedori","sa"];

/** その方によって変わるものの**箇所**（同じ名前が2か所なら2と数えます・判断ログ83③） */
export const HITOGOTO_KASHO = 30;

/** **エンジンにまだ出口が無いもの**（`data-mada`・判断ログ83②）。**0になるまで本番化しません** */
export const MADA_NA: readonly string[] = ["ideco_jogen_age","an_label","hoken_bun","sa"];

