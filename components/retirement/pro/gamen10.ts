/**
 * components/retirement/pro/gamen10.ts
 *
 * **このファイルは手で書きません。**`kensa/gamen_chushutsu.mjs` が
 * 基準HTMLから機械で作ります。直したいときは**基準HTMLを直して作り直してください。**
 *
 *   node kensa/gamen_chushutsu.mjs <基準HTML> 10 > components/retirement/pro/gamen10.ts
 *
 * 画面10。**基準HTMLの文がそのまま入ります。こちらが書き直してはいけません（§2の8）。**
 *
 * **その方によって変わるところは `{名前}` になっています。**
 * 名前は基準HTMLの `data-na`（＝エンジンの鍵の名前・判断ログ83①）です。
 * **推測では立てていません。印だけを見ています。**
 *
 * もと: hikiwatashi/tsuginote_gamen_base_20260812.html（164,458バイト）
 */

/** 表の1行。`cells` は左から順のセル。`na` は、この行に出る `{名前}` の一覧 */
export type Gyou10 = { cells: readonly string[]; na: readonly string[] };

export type Block10 =
  | { kind: 'midashi'; lv: 2 | 3; bun: string }
  | { kind: 'hon'; bun: string; na: readonly string[] }
  | { kind: 'hako'; bun: string; na: readonly string[] }
  | { kind: 'kousin'; bun: string }
  | { kind: 'ret'; koumoku: { bun: string; na: readonly string[] }[] }
  | { kind: 'hyo'; gyou: Gyou10[] };

export const GAMEN10: readonly Block10[] = [
  { kind: 'midashi', lv: 2, bun: "退職金受け取りパターン比較" },
  { kind: 'hako', bun: "この画面の前提\nあなたは{tai_age}で{tai_gen} {shunyu}を受け取ります（勤続{nensu}）。{nenkin_gen} {ideco_zandaka}（加入{ideco_kanyu_nensu}）、公的年金 年 {koteki_nenkin}（{koteki_kaishi_age}から受け取る場合の額）。{tai_age}以降の給与はありません。", na: ["tai_age","tai_gen","shunyu","nensu","nenkin_gen","ideco_zandaka","ideco_kanyu_nensu","koteki_nenkin","koteki_kaishi_age"] },
  { kind: 'hon', bun: "あなたの年齢ごとに、手元にいくら入るかを比べます。\n性質の違う2つを、それぞれ分けてお見せします。", na: [] },
  { kind: 'midashi', lv: 3, bun: "① 退職金とiDeCo等の受け取り方で、いつ・いくら入るか" },
  { kind: 'hon', bun: "公的年金の受け取り方はどちらも{koteki_kaishi_age}からにそろえて、\n退職金とiDeCo等の受け取り方だけを比べます。\n\nグラフは、{an_a}を選択した場合、{an_b}にした場合との手取り累計の差を表しています。", na: ["koteki_kaishi_age","an_a","an_b"] },
  { kind: 'hako', bun: "{an_a_age}の時点では、{sa_hajime_bun}。{gyakuten_bun}、そこから先は{sa_saishu_bun}。", na: ["an_a_age","sa_hajime_bun","gyakuten_bun","sa_saishu_bun"] },
  { kind: 'midashi', lv: 3, bun: "② 公的年金を繰り下げると、どうなるか" },
  { kind: 'hon', bun: "受け取り方はどちらも{nenkin_gen}を{an_b}にそろえて、\n公的年金を{koteki_kaishi_age}から受け取る場合と、{kurisage_age}から受け取る場合を比べます。\n\nたては、その年齢までに手元に入ったお金の累計です。", na: ["nenkin_gen","an_b","koteki_kaishi_age","kurisage_age"] },
  { kind: 'hako', bun: "{an_1_label}{an_2_label}灰色の帯＝{toori_kazu}全部の幅（最小〜最大）", na: ["an_1_label","an_2_label","toori_kazu"] },
  { kind: 'hon', bun: "灰色の帯は、{toori_kazu}すべてを計算して出した幅です。\n上のふちがその年齢までの累計がいちばん多くなる受け取り方、\n下のふちがいちばん少なくなる受け取り方で、\nあなたが選べるどの受け取り方も、必ずこの帯の中に入ります。\n90歳までの累計でいえば{ruikei_min}〜{ruikei_max}です。", na: ["toori_kazu","ruikei_min","ruikei_max"] },
  { kind: 'hako', bun: "{kuuhaku_kaishi_age}から{kuuhaku_owari_age}までは、公的年金が1円も入りません。\n{oitsuku_bun}。\nそれより長く生きれば多く、短ければ少なくなります。\n当社は何歳まで生きるかを置きませんので、どちらが有利かは申し上げません。\n追いつく年齢だけをお伝えします。\n\n90歳まで受け取った場合の差は{sa_90}ですが、\n①の{sa_saishu}とこの額を足し算しないでください。\n①は何歳まで生きても変わらない額、②は何歳まで生きるか次第の額です。", na: ["kuuhaku_kaishi_age","kuuhaku_owari_age","oitsuku_bun","sa_90","sa_saishu"] },
  { kind: 'midashi', lv: 3, bun: "この金額に入っているもの" },
  { kind: 'hako', bun: "あなたの退職金・iDeCo等・公的年金の、税金と手数料を引いたあとの額です。\n給与など、受け取り方で変わらない収入は入れていません。\n\n②の累計には公的年金も入っています。計算結果としてお出しする手取り（{tedori}）は\n退職金とiDeCo等だけの金額なので、②の数字とは一致しません。\n公的年金を受け取り始める年齢が違う受け取り方を並べるには、\n公的年金を入れないと比べようがないためです。\n\n何歳まで生きるかは置いていません。たては「その年齢まで受け取った場合」の数字です。\n\n手数料は、いちばん最後に受け取る年にまとめて引いています。", na: ["tedori"] },
  { kind: 'midashi', lv: 3, bun: "年ごとに、手元にいくら入るか" },
  { kind: 'hon', bun: "年齢ごとの金額は、ダウンロードするファイルに入れてお渡しします。\n1歳きざみで、その年に手元に入る額と、その年に納める税金が並びます。\n\n{tai_age}前後にまとまった支出のご予定がある場合は、そちらでご確認ください。", na: ["tai_age"] },
  { kind: 'hako', bun: "結果をダウンロード（Excel）", na: [] },
] as const;

/** その方によって変わるものの**種類**（`data-na` の異なり数） */
export const HITOGOTO_SHURUI: readonly string[] = ["tai_age","tai_gen","shunyu","nensu","nenkin_gen","ideco_zandaka","ideco_kanyu_nensu","koteki_nenkin","koteki_kaishi_age","an_a","an_b","an_a_age","sa_hajime_bun","gyakuten_bun","sa_saishu_bun","kurisage_age","an_1_label","an_2_label","toori_kazu","ruikei_min","ruikei_max","kuuhaku_kaishi_age","kuuhaku_owari_age","oitsuku_bun","sa_90","sa_saishu","tedori"];

/** その方によって変わるものの**箇所**（同じ名前が2か所なら2と数えます・判断ログ83③） */
export const HITOGOTO_KASHO = 34;

/** **エンジンにまだ出口が無いもの**（`data-mada`・判断ログ83②）。**0になるまで本番化しません** */
export const MADA_NA: readonly string[] = ["tai_age","tai_gen","ideco_zandaka","ideco_kanyu_nensu","koteki_nenkin","koteki_kaishi_age","an_a","an_b","an_a_age","sa_hajime_bun","gyakuten_bun","sa_saishu_bun","kurisage_age","an_1_label","an_2_label","toori_kazu","ruikei_min","ruikei_max","kuuhaku_kaishi_age","kuuhaku_owari_age","oitsuku_bun","sa_90","sa_saishu"];

