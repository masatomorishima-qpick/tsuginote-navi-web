/**
 * components/retirement/pro/gamen9shosai.ts
 *
 * **このファイルは手で書きません。**`kensa/gamen_chushutsu.mjs` が
 * 基準HTMLから機械で作ります。直したいときは**基準HTMLを直して作り直してください。**
 *
 *   node kensa/gamen_chushutsu.mjs <基準HTML> 9 詳細 > components/retirement/pro/gamen9shosai.ts
 *
 * 画面9 詳細。**基準HTMLの文がそのまま入ります。こちらが書き直してはいけません（§2の8）。**
 *
 * **その方によって変わるところは `{名前}` になっています。**
 * 名前は基準HTMLの `data-na`（＝エンジンの鍵の名前・判断ログ83①）です。
 * **推測では立てていません。印だけを見ています。**
 *
 * もと: hikiwatashi/tsuginote_gamen_base_20260812.html（164,458バイト）
 */

/** 表の1行。`cells` は左から順のセル。`na` は、この行に出る `{名前}` の一覧 */
export type Gyou9shosai = { cells: readonly string[]; na: readonly string[] };

export type Block9shosai =
  | { kind: 'midashi'; lv: 2 | 3; bun: string }
  | { kind: 'hon'; bun: string; na: readonly string[] }
  | { kind: 'hako'; bun: string; na: readonly string[] }
  | { kind: 'kousin'; bun: string }
  | { kind: 'ret'; koumoku: { bun: string; na: readonly string[] }[] }
  | { kind: 'hyo'; gyou: Gyou9shosai[] };

export const GAMEN9shosai: readonly Block9shosai[] = [
  { kind: 'midashi', lv: 2, bun: "{nenkin_gen}を受け取る期間が{koteki_kaishi_age}にかかると、その年だけ保険料が上がります" },
  { kind: 'hako', bun: "ここまでは税金の話でした。このページは保険料と医療費の話です。手取りの金額には含めていません。", na: [] },
  { kind: 'hako', bun: "あなたの場合、こうなります\n{handan_a_bun}（国民健康保険料の軽減は{keigen_a}のまま）。\n{handan_b_bun}軽減が{keigen_a}から{keigen_b}に下がり、住民税がかかり始めます。\n{handan_c_bun}です（公的年金が満額入るので、どちらも軽減は{keigen_c}になります）。", na: ["handan_a_bun","keigen_a","handan_b_bun","keigen_b","handan_c_bun","keigen_c"] },
  { kind: 'midashi', lv: 3, bun: "保険料判定所得と保険料負担の比較" },
  { kind: 'hako', bun: "{an_a_bun}{an_b_bun}", na: ["an_a_bun","an_b_bun"] },
  { kind: 'hako', bun: "破線＝保険料・医療費の境目（濃い線が、あなたが実際に越える境目です）軽減が{keigen_a}から{keigen_b}に下がる {sakaime_1}{keigen_b}から{keigen_c} {sakaime_2}軽減がなくなる {sakaime_3}", na: ["keigen_a","keigen_b","sakaime_1","keigen_c","sakaime_2","sakaime_3"] },
  { kind: 'hon', bun: "あなたの公的年金は{koteki_kaishi_age}から始まります。{nenkin_gen}を受け取る期間が{koteki_kaishi_age}にかかると、その年は公的年金とiDeCo等が同じ年の所得になり、あなたの所得が増えます。所得が国の定める基準を超えると、公的医療保険料・介護保険料・医療費の負担が上がることがあります。", na: ["koteki_kaishi_age","nenkin_gen"] },
  { kind: 'midashi', lv: 3, bun: "保険料判定所得の計算方法" },
  { kind: 'hon', bun: "{hantei_age}のあなたの所得を、計算の順番のまま並べました。", na: ["hantei_age"] },
  { kind: 'hako', bun: "{hantei_age}のあなた{an_a_nensu}で\n受け取る{an_b_nensu}で\n受け取る\n公的年金{koteki_tsukisu}分{a_koteki}{b_koteki}\n{nenkin_gen}{a_ideco}{b_ideco}\n収入の合計{a_shunyu_kei}{b_shunyu_kei}\n公的年金等控除{nenkin_kojo_kubun}{a_nenkin_kojo}{b_nenkin_kojo}\n雑所得0円より下がりません{a_zatsu}{b_zatsu}\n↓ ここから保険料の話です（税金の計算には出てきません）\n65歳以上の15万円{a_koujo15}{b_koujo15}\n保険料の判定に使う所得{a_hantei_shotoku}{b_hantei_shotoku}", na: ["hantei_age","an_a_nensu","an_b_nensu","koteki_tsukisu","a_koteki","b_koteki","nenkin_gen","a_ideco","b_ideco","a_shunyu_kei","b_shunyu_kei","nenkin_kojo_kubun","a_nenkin_kojo","b_nenkin_kojo","a_zatsu","b_zatsu","a_koujo15","b_koujo15","a_hantei_shotoku","b_hantei_shotoku"] },
  { kind: 'hon', bun: "公的年金が{a_koteki}しかないのは、あなたが{hantei_age}になる年に支払を受けるのが{koteki_tsukisu}分だけだからです。あなたは{umare}生まれなので公的年金は{koteki_hajime_tsuki}分から始まり、しかも年金は偶数月に前月までの分をまとめて支払うので、その年に届くのは{koteki_owari_tsuki}分までになります。満額の{koteki_nenkin}が入るのは{mangaku_age}からです（{a_koteki} ＝ {koteki_nenkin} × {koteki_tsukisu} ÷ 12か月・1円未満は切り捨て）。\n{nenkin_gen} {b_ideco} ＝ {ideco_zandaka} ÷ {an_b_nensu}（割り切れない分は最後の年に足します）。\nいちばん下の「保険料の判定に使う所得」で、国民健康保険料の軽減（7割・5割・2割）を受けられるかどうかが決まります。税金の計算に使う所得とは別のものです。", na: ["a_koteki","hantei_age","koteki_tsukisu","umare","koteki_hajime_tsuki","koteki_owari_tsuki","koteki_nenkin","mangaku_age","nenkin_gen","b_ideco","ideco_zandaka","an_b_nensu"] },
  { kind: 'midashi', lv: 3, bun: "この所得が、どの基準を超えるか" },
  { kind: 'hon', bun: "上で出した所得（{an_a_nensu}なら{a_hantei_shotoku}、{an_b_nensu}なら{b_hantei_shotoku}）を、国の定める基準と比べたものです。超えると、その行の負担が上がります。", na: ["an_a_nensu","a_hantei_shotoku","an_b_nensu","b_hantei_shotoku"] },
  { kind: 'hako', bun: "{hantei_age}のあなた{an_a_nensu}で\n受け取る{an_b_nensu}で\n受け取る国民健康保険料などの軽減\n基準 {kokuho_kijun}{a_kokuho_bun}{b_kokuho_bun}住民税の非課税\n基準 {hikazei_gendo}{a_jumin_bun}{b_jumin_bun}", na: ["hantei_age","an_a_nensu","an_b_nensu","kokuho_kijun","a_kokuho_bun","b_kokuho_bun","hikazei_gendo","a_jumin_bun","b_jumin_bun"] },
  { kind: 'hako', bun: "{handan_b_bun}、こうなります。国民健康保険料などの軽減　軽減が{keigen_a}から{keigen_b}に下がります住民税の非課税　住民税がかかり始めます。介護保険料の段階や医療費の負担にも連動します", na: ["handan_b_bun","keigen_a","keigen_b"] },
  { kind: 'hako', bun: "保険料がいくら上がるかは、お住まいの市区町村によって違います。上の表に出した基準の額（1,000,000円など）は国が定めているものですが、保険料の率は市区町村がそれぞれ決めているため、金額は出していません。\n\n介護保険料も所得で段階が上がりますが、あなたには境目をお出ししていません。住民税が課税される方の段階の境目は、国の告示と市区町村の条例で決まり、全国共通の金額がないためです。", na: [] },
  { kind: 'hako', bun: "あなたに給与などの収入があって、iDeCo等がなくても基準を超えている場合は、この「保険料と医療費」の画面は出ません。受け取り方を変えても保険料が変わらないので、比べる意味がないためです。\n\nこの画面でいう「あなたの所得」は、公的年金とiDeCo等の年金から公的年金等控除を引いた額に給与所得を足したもので、あなたの退職金は入りません（国民健康保険料の判定では、65歳以上の方はさらに15万円を引きます）。", na: [] },
  { kind: 'kousin', bun: "この画面の根拠にした法令\n\n国民健康保険料の軽減：国民健康保険法施行令29条の7第6項。令和8年度は、単身の方で所得43万円まで7割、74万円まで5割、100万円まで2割の軽減。判定に使う所得には給与所得も入ります。65歳以上の方は公的年金等の所得からさらに15万円を引きます（同附則5条）\n\n介護保険料：介護保険法施行令38条1項1号ハ・2号イ。住民税が非課税の方の第1〜3段階の境目（826,500円・1,200,000円）だけが政令に金額で書かれています。第6段階以降の基準所得金額は厚生労働大臣の告示で、市区町村が条例で変えられます（同38条6〜8項・39条1項）\n\n医療費の窓口負担：高齢者医療確保法施行令7条2項〜5項。3割は課税所得145万円以上でも、収入が単身383万円・複数世帯520万円に満たない場合、基礎控除後の総所得金額等の合算が210万円以下の場合、住民税が非課税の場合は該当しません。「収入の額」の算定方法は厚生労働省令に委ねられており、当社は原文を確認できていないため、公的年金等の収入金額と給与収入の合計で判定しています" },
] as const;

/** その方によって変わるものの**種類**（`data-na` の異なり数） */
export const HITOGOTO_SHURUI: readonly string[] = ["nenkin_gen","koteki_kaishi_age","handan_a_bun","keigen_a","handan_b_bun","keigen_b","handan_c_bun","keigen_c","an_a_bun","an_b_bun","sakaime_1","sakaime_2","sakaime_3","hantei_age","an_a_nensu","an_b_nensu","koteki_tsukisu","a_koteki","b_koteki","a_ideco","b_ideco","a_shunyu_kei","b_shunyu_kei","nenkin_kojo_kubun","a_nenkin_kojo","b_nenkin_kojo","a_zatsu","b_zatsu","a_koujo15","b_koujo15","a_hantei_shotoku","b_hantei_shotoku","umare","koteki_hajime_tsuki","koteki_owari_tsuki","koteki_nenkin","mangaku_age","ideco_zandaka","kokuho_kijun","a_kokuho_bun","b_kokuho_bun","hikazei_gendo","a_jumin_bun","b_jumin_bun"];

/** その方によって変わるものの**箇所**（同じ名前が2か所なら2と数えます・判断ログ83③） */
export const HITOGOTO_KASHO = 73;

/** **エンジンにまだ出口が無いもの**（`data-mada`・判断ログ83②）。**0になるまで本番化しません** */
export const MADA_NA: readonly string[] = ["koteki_kaishi_age","handan_a_bun","keigen_a","handan_b_bun","keigen_b","handan_c_bun","keigen_c","an_a_bun","an_b_bun","sakaime_1","sakaime_2","sakaime_3","hantei_age","an_a_nensu","an_b_nensu","koteki_tsukisu","a_koteki","b_koteki","a_ideco","b_ideco","a_shunyu_kei","b_shunyu_kei","nenkin_kojo_kubun","a_nenkin_kojo","b_nenkin_kojo","a_zatsu","b_zatsu","a_koujo15","b_koujo15","a_hantei_shotoku","b_hantei_shotoku","umare","koteki_hajime_tsuki","koteki_owari_tsuki","koteki_nenkin","mangaku_age","ideco_zandaka","kokuho_kijun","a_kokuho_bun","b_kokuho_bun","hikazei_gendo","a_jumin_bun","b_jumin_bun"];

