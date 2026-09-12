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
 * もと: bin/senjutsu/tsuginote_gamen_base.html（177,710バイト ／ md5 4713aed7c1b3ed058eab15f611d2a362）
 */

/** 表の1行。`cells` は左から順のセル。`na` は、この行に出る `{名前}` の一覧 */
export type Gyou11 = {
  cells: readonly string[];
  na: readonly string[];
  /** ★セルごと・行ごとの名前（`cells` を `\n` で割った順）。**基準HTMLの `class` そのまま**。無い所は null */
  kazari: readonly (readonly (string | null)[])[];
  /** ★行そのものの名前（`sum`・`shikiri`）。無ければ入りません */
  gyoKazari?: string;
};

export type Block11 =
  | { kind: 'midashi'; lv: 2 | 3; bun: string }
  | { kind: 'hon'; bun: string; na: readonly string[] }
  | { kind: 'hako'; bun: string; na: readonly string[] }
  | { kind: 'kousin'; bun: string }
  | { kind: 'ret'; koumoku: { bun: string; na: readonly string[] }[] }
  | { kind: 'hyo'; gyou: Gyou11[] };

export const GAMEN11: readonly Block11[] = [
  { kind: 'midashi', lv: 2, bun: "あなたの税金の計算過程について" },
  { kind: 'hako', bun: "いま表示しているのは、{an_bun} の場合の計算過程です。一覧で別の受け取り方を選ぶと、その受け取り方の計算過程に切り替わります。", na: ["an_bun"] },
  { kind: 'midashi', lv: 3, bun: "あなたの{tai_gen}（{tai_age}）" },
  { kind: 'hyo', gyou: [
    { cells: ["{kojo_shiki}","{kojo}"],
      na: ["kojo_shiki","kojo"],
      kazari: [[null],[null]] },
    { cells: ["あなたの{tai_gen}","{shunyu}"],
      na: ["tai_gen","shunyu"],
      kazari: [[null],[null]] },
    { cells: ["{tai_hantei_bun}","{shotoku}"],
      na: ["tai_hantei_bun","shotoku"],
      kazari: [[null],[null]] },
    { cells: ["→ この退職所得にかかる所得税\n「退職所得の受給に関する申告書」を出した場合の額です","{shotokuzei_tai}"],
      na: ["shotokuzei_tai"],
      kazari: [[null,"tbls"],[null]] },
    { cells: ["→ この退職所得にかかる住民税\nその年に、受け取るときに差し引かれます","{jumin_taishoku}"],
      na: ["jumin_taishoku"],
      kazari: [[null,"tbls"],[null]] },
  ] },
  { kind: 'midashi', lv: 3, bun: "あなたの年金の所得" },
  { kind: 'hon', bun: "{nenkin_toshi_bun}", na: ["nenkin_toshi_bun"] },
  { kind: 'hyo', gyou: [
    { cells: ["あなたが1年に受け取る年金の額\n公的年金と{nenkin_gen}の合計です","{nenkin_shunyu}"],
      na: ["nenkin_gen","nenkin_shunyu"],
      kazari: [[null,"tbls"],[null]] },
    { cells: ["公的年金等控除（{nenkin_kojo_kubun}）","{nenkin_kojo}"],
      na: ["nenkin_kojo_kubun","nenkin_kojo"],
      kazari: [[null],[null]] },
    { cells: ["あなたの雑所得","{zatsu}"],
      na: ["zatsu"],
      kazari: [[null],[null]] },
    { cells: ["あなたの給与所得","{kyuyo}"],
      na: ["kyuyo"],
      kazari: [[null],[null]] },
    { cells: ["所得税の所得控除の合計\n{kojo_uchiwake}","{kojo_goukei}"],
      na: ["kojo_uchiwake","kojo_goukei"],
      kazari: [[null,"tbls"],[null]] },
    { cells: ["→ 差し引いたあとの、所得税","{shotokuzei}"],
      na: ["shotokuzei"],
      kazari: [[null],[null]] },
    { cells: ["住民税の非課税限度額（{setai_kubun}）","{hikazei_gendo}"],
      na: ["setai_kubun","hikazei_gendo"],
      kazari: [[null],[null]] },
    { cells: ["{jumin_hantei_bun}","{jumin}"],
      na: ["jumin_hantei_bun","jumin"],
      kazari: [[null],[null]] },
    { cells: ["国民健康保険の基礎控除","{kokuho_kiso}"],
      na: ["kokuho_kiso"],
      kazari: [[null],[null]] },
    { cells: ["{hoken_hantei_bun}\n保険料の額は、お住まいの市区町村で違います","{hoken_kekka}"],
      na: ["hoken_hantei_bun","hoken_kekka"],
      kazari: [[null,"tbls"],[null]] },
  ] },
  { kind: 'hon', bun: "{zatsu_zero_bun}", na: ["zatsu_zero_bun"] },
  { kind: 'midashi', lv: 3, bun: "あなたの手数料" },
  { kind: 'hyo', gyou: [
    { cells: ["給付事務手数料 440円×{kyufu_kaisu}","{kyufu_kei}"],
      na: ["kyufu_kaisu","kyufu_kei"],
      kazari: [[null],[null]] },
    { cells: ["口座管理手数料 {koza_tanka}×{koza_tsuki}","{koza_kei}"],
      na: ["koza_tanka","koza_tsuki","koza_kei"],
      kazari: [[null],[null]] },
    { cells: ["合計","{tesuryo}"],
      na: ["tesuryo"],
      kazari: [[null],[null]] },
  ] },
  { kind: 'kousin', bun: "この画面の根拠にした資料\n国税庁「令和8年4月 源泉所得税の改正のあらまし」注1・注2「所得税法第86条の規定による基礎控除額62万円（改正前：58万円）に、租税特別措置法第41条の16の２の規定による加算額を加算した額となります」「62万円にそれぞれ、42万円、５万円、37万円を加算した金額」" },
] as const;

/** その方によって変わるものの**種類**（`data-na` の異なり数） */
export const HITOGOTO_SHURUI: readonly string[] = ["an_bun","tai_gen","tai_age","kojo_shiki","kojo","shunyu","tai_hantei_bun","shotoku","shotokuzei_tai","jumin_taishoku","nenkin_toshi_bun","nenkin_gen","nenkin_shunyu","nenkin_kojo_kubun","nenkin_kojo","zatsu","kyuyo","kojo_uchiwake","kojo_goukei","shotokuzei","setai_kubun","hikazei_gendo","jumin_hantei_bun","jumin","kokuho_kiso","hoken_hantei_bun","hoken_kekka","zatsu_zero_bun","kyufu_kaisu","kyufu_kei","koza_tanka","koza_tsuki","koza_kei","tesuryo"];

/** その方によって変わるものの**箇所**（同じ名前が2か所なら2と数えます・判断ログ83③） */
export const HITOGOTO_KASHO = 35;

/** **エンジンにまだ出口が無いもの**（`data-mada`・判断ログ83②）。**0になるまで本番化しません** */
export const MADA_NA: readonly string[] = ["an_bun","tai_gen","kojo_shiki","tai_hantei_bun","shotokuzei_tai","jumin_taishoku","nenkin_toshi_bun","kyuyo","kojo_uchiwake","kojo_goukei","setai_kubun","hikazei_gendo","jumin_hantei_bun","jumin","kokuho_kiso","hoken_hantei_bun","hoken_kekka","zatsu_zero_bun"];

