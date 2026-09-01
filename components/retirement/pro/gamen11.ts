/**
 * components/retirement/pro/gamen11.ts
 *
 * **このファイルは手で書きません。**`kensa/gamen_chushutsu.mjs` が
 * 基準HTMLから機械で作ります。直したいときは**基準HTMLを直して作り直してください。**
 *
 *   node kensa/gamen_chushutsu.mjs <基準HTML> 11 > components/retirement/pro/gamen11.ts
 *
 * 画面11。**基準HTMLの文がそのまま入ります。こちらが書き直してはいけません（§2の8）。**
 *
 * **その方によって変わるところは `{名前}` になっています。**
 * 名前は基準HTMLの `data-na`（＝エンジンの鍵の名前・判断ログ83①）です。
 * **推測では立てていません。印だけを見ています。**
 *
 * もと: hikiwatashi/tsuginote_gamen_base_20260812.html（164,458バイト）
 */

/** 表の1行。`cells` は左から順のセル。`na` は、この行に出る `{名前}` の一覧 */
export type Gyou11 = { cells: readonly string[]; na: readonly string[] };

export type Block11 =
  | { kind: 'midashi'; lv: 2 | 3; bun: string }
  | { kind: 'hon'; bun: string; na: readonly string[] }
  | { kind: 'hako'; bun: string; na: readonly string[] }
  | { kind: 'kousin'; bun: string }
  | { kind: 'ret'; koumoku: { bun: string; na: readonly string[] }[] }
  | { kind: 'hyo'; gyou: Gyou11[] };

export const GAMEN11: readonly Block11[] = [
  { kind: 'midashi', lv: 2, bun: "あなたの税金の計算過程について" },
  { kind: 'hako', bun: "いま表示しているのは「{an_bun}」場合の計算過程です。一覧で別の受け取り方を選ぶと、その受け取り方の計算過程に切り替わります。", na: ["an_bun"] },
  { kind: 'midashi', lv: 3, bun: "あなたの{tai_gen}（{tai_age}）" },
  { kind: 'hyo', gyou: [
    { cells: ["{kojo_shiki}","{kojo}"],
      na: ["kojo_shiki","kojo"] },
    { cells: ["あなたの{tai_gen}","{shunyu}"],
      na: ["tai_gen","shunyu"] },
    { cells: ["→ 控除に収まるので、あなたの退職所得","{shotoku}"],
      na: ["shotoku"] },
  ] },
  { kind: 'midashi', lv: 3, bun: "あなたの{nenkin_gen}（{nenkin_kikan_bun}）" },
  { kind: 'hyo', gyou: [
    { cells: ["あなたが1年に受け取る額","{nenkin_shunyu}"],
      na: ["nenkin_shunyu"] },
    { cells: ["公的年金等控除（{nenkin_kojo_kubun}）","{nenkin_kojo}"],
      na: ["nenkin_kojo_kubun","nenkin_kojo"] },
    { cells: ["あなたの雑所得","{zatsu}"],
      na: ["zatsu"] },
    { cells: ["所得税の基礎控除{kiso_shiki}","{kiso_shotoku}"],
      na: ["kiso_shiki","kiso_shotoku"] },
    { cells: ["→ あなたの雑所得を上回るので、所得税","{shotokuzei}"],
      na: ["shotokuzei"] },
    { cells: ["住民税の非課税限度額（{setai_kubun}）","{hikazei_gendo}"],
      na: ["setai_kubun","hikazei_gendo"] },
    { cells: ["→ あなたの合計所得が収まるので、住民税","{jumin}"],
      na: ["jumin"] },
    { cells: ["国民健康保険の基礎控除","{kokuho_kiso}"],
      na: ["kokuho_kiso"] },
    { cells: ["→ あなたの保険料の増加","{hoken_zou}"],
      na: ["hoken_zou"] },
  ] },
  { kind: 'midashi', lv: 3, bun: "あなたの手数料" },
  { kind: 'hyo', gyou: [
    { cells: ["給付事務手数料 440円×{kyufu_kaisu}","{kyufu_kei}"],
      na: ["kyufu_kaisu","kyufu_kei"] },
    { cells: ["口座管理手数料 {koza_tanka}×{koza_tsuki}","{koza_kei}"],
      na: ["koza_tanka","koza_tsuki","koza_kei"] },
    { cells: ["合計","{tesuryo}"],
      na: ["tesuryo"] },
  ] },
  { kind: 'kousin', bun: "この画面の根拠にした資料\n国税庁「令和8年4月 源泉所得税の改正のあらまし」注1・注2「所得税法第86条の規定による基礎控除額62万円（改正前：58万円）に、租税特別措置法第41条の16の２の規定による加算額を加算した額となります」「62万円にそれぞれ、42万円、５万円、37万円を加算した金額」" },
] as const;

/** その方によって変わるものの**種類**（`data-na` の異なり数） */
export const HITOGOTO_SHURUI: readonly string[] = ["an_bun","tai_gen","tai_age","kojo_shiki","kojo","shunyu","shotoku","nenkin_gen","nenkin_kikan_bun","nenkin_shunyu","nenkin_kojo_kubun","nenkin_kojo","zatsu","kiso_shiki","kiso_shotoku","shotokuzei","setai_kubun","hikazei_gendo","jumin","kokuho_kiso","hoken_zou","kyufu_kaisu","kyufu_kei","koza_tanka","koza_tsuki","koza_kei","tesuryo"];

/** その方によって変わるものの**箇所**（同じ名前が2か所なら2と数えます・判断ログ83③） */
export const HITOGOTO_KASHO = 28;

/** **エンジンにまだ出口が無いもの**（`data-mada`・判断ログ83②）。**0になるまで本番化しません** */
export const MADA_NA: readonly string[] = ["an_bun","tai_gen","tai_age","kojo_shiki","nenkin_kikan_bun","kiso_shiki","kiso_shotoku","setai_kubun","hikazei_gendo","jumin","kokuho_kiso","hoken_zou"];

