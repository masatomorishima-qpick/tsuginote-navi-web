/**
 * lib/retirement/pro/gamen11Bun.ts ── 画面11（あなたの税金の計算過程について）の**字のもと**を作る
 *
 * ★★★戦術Cowork `senjutsu_20260912e.md` 6-4 の **回2の16種類**と、
 *   ★★`senjutsu_20260912g.md` 3節の **`ichiji_*` 9種類**（★2本目の表）── ★あわせて **25種類**です。
 *   ★決め1030（`an_bun`）・1033（保険料の2行）・1036(1)（`tai_hantei_bun`）・1042（`kyuyo`）
 *   ★1049⑥＋1092＋1100（`zatsu_zero_bun`）・1085 2-1＋1093＋1099（`nenkin_toshi_bun` の4つの字）
 *   ★1065（`jumin`・`jumin_hantei_bun`）・1066（`kojo_uchiwake`・`kojo_goukei`）
 *   ★1077（`kojo_shiki`）・1078（`shotokuzei_tai`・`jumin_taishoku`）・1086（`nenkin_nashi_bun`）
 *   ★★1101（`ichiji_*` 9種類 ── ★41人／250・16.4%に、最大 6,195,000円の退職所得と
 *      1,448,041円の税が、計算過程の画面に1円も出ていませんでした）
 *
 * 【なぜこの本を作ったか】
 *   ★★16のうち8つは**分岐の字**で、2つは**組み立てた字**です。
 *   ★★★§画面に出す数字と分岐は計算エンジン側に置く。実装側に式を持たせない ── ★ですので
 *      `Screens912.tsx` には置かず、`gamen12Bun.ts`・`gamen8Bun.ts` と**同じ形**で1本置きました。
 *
 * 【この本がやらないこと】
 *   ★★**基準HTMLの字を、こちらで書き換えていません。**★戦術Coworkが便に書いた字のとおりです。
 *   ★見せ方（`en()` で「円」を付けるなど）は `atai912()` がします。★ここは**数と字のもと**だけです。
 *   ★★**既定値を作っていません。**★「いまの年」も年齢も、呼ぶ側から渡します。
 *
 * 【★★★止め ── 戦術Coworkにお尋ねしているもの】（★便に書きました）
 *   (1) 保険料の判定の**給与所得者数**（★入力に欄が0か所・決め1059と同じ形・回4の前に直します）
 *
 * 【★済み】(2) ⑨企業年金・㉓役員退職慰労金が `build()` に渡っていなかった件は、
 *   **2026-09-13・決め1106 で直りました**（★`kekka.ts` 94行 → `ichijikinOnly(p)`）。
 *   ★★このとき書いていた「**渡すようになると退職所得の年が3つになりえます**」は、
 *     ★★★**こちらの誤りでした。**★`engine.ts` 1652行は、渡された名前を**ぜんぶ同じ年**
 *     （＝退職の年）に入れますので、`keika` の年は **退職の年 ＋ iDeCo等の一時金の年 の最大2つ**です
 *     （★⑲ すでに受け取った退職手当等は `keika` の行を作りません ── `engine.ts` 748〜762行）。
 *     ★実測（250人・910案）…… **直す前も直したあとも、2つが最大**（★2つが234人・1つが16人）。
 */

import * as Z from './zeisei';
import * as S from './sakaime';
import * as E from './engine';

/** ★画面11の年金の表が見る年齢の範囲（★`gamen8.ts` の `AGE_FROM`／`AGE_TO` と同じ 55〜100歳） */
export const AGE_FROM = 55, AGE_TO = 100;

/** 円の字（★3桁区切り＋「円」。★`gamenBun.en()` と同じ形ですが、こちらは `lib` 側です） */
const en = (n: number) => `${n.toLocaleString('en-US')}円`;
/** 万円の字（★式の中だけ。★「800万」「70万」「40万」） */
const man = (n: number) => `${n / 10_000}万`;

/** ★★★画面11の16種類のもと。★数は数のまま、字は字のまま返します */
export interface Bun11 {
  /** ★決め1030 …… いま見せている案の札（`plan.label`） */
  an_bun: string;
  // ── 退職金の表（★基準HTML 1111〜1115行・**退職の年**） -------------------
  /**
   * ★★★決め1113 …… `{tai_gen}` ＝ **その年に受け取る退職手当等の名前**を `KeikaRow.gens` の順に「・」で。
   *   ★画面10（993行）と画面11（1109行・1112行）の**3か所**に同じ字が出ます。
   */
  tai_gen: string | null;
  /**
   * ★★★【2026-09-22・決め（戦術Cowork `kaihatsu_ate_20260922k.md` 3節）】**退職の年に退職所得が無い方**の一文。
   *   ★その方は、上の `tai_gen` から下の `jumin_taishoku` までの **9つが `null`**＝退職の段（見出し＋表）が
   *     **節ごと落ちます**（★`Screens912.tsx` の「退職の年の節」・代表 `tai_gen`）。
   *   ★★**この一文は節の外に置きます**（★節の中に置くと一緒に落ちます・便k 3-1）。
   *   ★★どんな方か …… ★**退職金 0円**（①に0万円）で、iDeCo等を年金か別の年の一時金で受け取る案。
   *     ★golden 250人では seed 36 の1人（★187通りのうち 186通り）。★前はここで `throw` していました（575〜577行）。
   *   ★★分けは「**退職の年に退職所得の行（`keika`）が無い**」です。★「退職金0円」ではありません
   *     （★退職金0円・企業年金ありの方は、企業年金の行が立ちますので、表が出ます ── 便h 5節で数えました）。
   *   ★ほかの方は `null`。
   */
  tai_nashi_bun: string | null;
  /**
   * ★★★【2026-09-22・決め（`kaihatsu_ate_20260922k.md` 2節）】画面10「この画面の前提」の**1文目**。
   *   ★前は `{tai_age}`・`{tai_gen}`・`{shunyu}`・`{nensu}` を箱の中で組み立てていましたが、
   *     ★`tai_gen` が `null` の方は**箱ごと落ちます**ので、★**1文目を1本の印にして、エンジンが2通りから選びます**。
   *   A（退職の年に退職所得がある方）　あなたは{tai_age}で{tai_gen} {shunyu}を受け取ります（勤続{nensu}）。
   *   B（無い方）　　　　　　　　　　　あなたは{tai_age}で退職され、その年に受け取る退職金は0円とお答えいただいています。
   *   ★★Bに「（勤続{nensu}）」は入れません（★2026-09-22・戦術Cowork `kaihatsu_ate_20260922l.md` 5節。
   *     ★退職金0円の方の期間が手取りに効くかが分かるまで）。
   *   ★★基準HTML 1185行（232,032 ／ 5095f522…）に印 `zentei_tai_bun` が入りました（★2026-09-22・便l 2-1(1)）。
   */
  zentei_tai_bun: string;
  /**
   * ★★★決め1113 4-1 …… `{tai_uchiwake_bun}` ＝ **2本以上の方の内わけ**。
   *   ★1本だけの方は `null`（★**その行だけ**が落ちます ── 表の中の行ですので）。
   */
  tai_uchiwake_bun: string | null;
  /**
   * ★★★【2026-09-13・回3で分かったこと】**`{kojo}`・`{shunyu}`・`{shotoku}` の3つも、ここで出します。**
   *
   *   ★この3つは、基準HTMLで **1度も `data-mada` が付いたことがありません**
   *     （★エンジンには `KeikaRow.kojo_adj`・`shunyu`・`shotoku` として在るためです）。
   *   ★★ところが **`atai912()` には、値を渡す所が0か所**でした。
   *   ★★★**回2までは気づけませんでした** …… ★この3つが入っている表には `{tai_gen}` も入っていて、
   *     ★`{tai_gen}` が `data-mada` でしたので、**表がかたまりごと落ちていた**からです。
   *   ★★決め1114で `{tai_gen}` の `data-mada` が外れ、★**表が出るようになって、はじめて止まりました**
   *     （★`kumitate()` が「かたまりに {kojo} が入っていません」で止めました ── ★門が鳴りました）。
   */
  kojo: number | null;
  /** ★その年に受け取る退職手当等の額（★`KeikaRow.shunyu`。★2本以上の方は**合計**です） */
  shunyu: number | null;
  /** ★その年の退職所得（★`KeikaRow.shotoku`） */
  shotoku: number | null;
  /** ★決め1077 …… 退職所得控除の式（★本則＋減額＋最低保障＋障害加算を、在るものだけ並べた字） */
  kojo_shiki: string | null;
  /** ★決め1036(1) …… 「→ 控除に収まるので、あなたの退職所得」／「→ 控除を超えますので、…」 */
  tai_hantei_bun: string | null;
  /** ★決め1078 …… その退職所得にかかる所得税（★`KeikaRow.gensen_ari` ＝申告書を出した場合） */
  shotokuzei_tai: number | null;
  /** ★決め1078 …… その退職所得にかかる住民税（★その年に差し引かれます） */
  jumin_taishoku: number | null;
  // ── 年金の表（★基準HTML 1117〜1130行・**年金収入がはじめて0でなくなる年**・決め1085） ---
  /** ★決め1086 …… その年が1つも無い方だけの1文。★ほかの方は `null`（かたまりごと落ちます） */
  nenkin_nashi_bun: string | null;
  /**
   * ★★★決め1181 …… **年金の節の見出し**（★基準HTML 1124行・★2026-09-14に印が1つ増えました）。
   *
   * ★★【なぜ印にしたか】★年金の年が1つも無い方は、★**この節の中身が1つ残らず落ちます**
   *   （★`nenkin_toshi_bun`・表・`zatsu_zero_bun` の3つとも `null`）。
   *   ★★見出しに印が無いと、★**見出しだけが中身なしで残ります**（★実測 1人／250・`seed 12`）。
   * ★★★これは**決め1086ですでに決めてあったもの**です ──
   *   「節そのもの（見出し＋`nenkin_toshi_bun`＋表）を落とせるなら落とす」。
   *   ★あのときは落とせるか分かっていませんでしたが、★**見出しに印を入れれば落ちます**（★決め1094）。
   * ★★分かれ方は `nenkin_nashi_bun` と**同じ1つの条件**です（★その年が1つも無いか）。
   */
  nenkin_setsu_midashi: string | null;
  /** ★決め1057＋1085 2-1 …… 下の表がどの年のものかを言う1文（★3つの字） */
  nenkin_toshi_bun: string | null;
  /** ★決め1042 …… その年の給与所得 */
  kyuyo: number;
  /** ★決め1066 …… 所得控除の内わけ（★0円でない項目だけを、決まった順で「名前 額」／でつないだ字） */
  kojo_uchiwake: string;
  /** ★所得控除が9項目ぜんぶ0円の年にだけ出す一文（★決め・便j 2-2）。★それ以外は `null` */
  kojo_zero_bun: string | null;
  /** ★決め1066 …… 所得税の所得控除の合計 */
  kojo_goukei: number;
  /** ★決め1065 …… その年の所得にかかる住民税（★総合課税分・翌年度に納めます） */
  jumin: number;
  /** ★決め1065 …… 「→ あなたの合計所得が収まるので、翌年度に納める住民税」／「…超えるので、…」 */
  jumin_hantei_bun: string;
  /** ★決め1033 …… 国民健康保険の基礎控除（★全国共通の額） */
  kokuho_kiso: number;
  /** ★決め1033 …… 「→ あなたの保険料の判定に使う所得が収まるので」／「…超えるので」 */
  hoken_hantei_bun: string;
  /** ★決め1033 …… 「変わりません」／「上がる場合があります」 */
  hoken_kekka: string;
  /**
   * ★決め1049⑥＋決め1092＋★決め1100 …… **年金収入が0でない かつ 雑所得が0円**の方だけの1文
   *   （★実測 **79人／250・31.6%**）。★ほかの方は `null`（かたまりごと落ちます）。
   */
  zatsu_zero_bun: string | null;
  /**
   * ★★★【2026-09-13・回4 ── 出口の無かった6種類のうち5つ】（★戦術Cowork `senjutsu_20260913f.md` 4-3）
   *
   *   ★★**`data-mada` は1度も付いていませんでしたが、値を作る所が0か所**でした
   *     （★`kojo`・`shunyu`・`shotoku` が回3で同じだったのと同じ形です）。
   *   ★★★どれも**年金の表の年**（`shirabeta.nenkin_nen`）のものです。
   */
  /** ★1131行 …… あなたが1年に受け取る年金の額（★公的年金 ＋ `{nenkin_gen}`） */
  nenkin_shunyu: number;
  /** ★1132行 …… 公的年金等控除の区分（★「65歳未満」／「65歳以上」）。★年金収入0円の方は `null` */
  nenkin_kojo_kubun: string | null;
  /** ★1132行 …… 公的年金等控除の額（★引く数ですので、**符号を付けるのは画面側**）。★同じく `null` あり */
  nenkin_kojo: number | null;
  /** ★1133行 …… あなたの雑所得 */
  zatsu: number;
  /**
   * ★1136行 …… 「→ 差し引いたあとの、所得税」。
   *
   *   ★★★**退職所得を入れません。**★この表は「あなたの年金の所得」の表で、
   *     ★上の行が 雑所得・給与所得・所得控除の合計です。★退職所得は分離課税ですので、
   *     ★★この行に入れると**上の行から出てこない数**になります。
   *   ★式は `nenkanZeiUchiwake()` のものを使います（★退職所得に **0** を渡します ── ★既定値ではなく、
   *     ★**この表は退職所得を入れない、とこちらが決めて渡しています**）。
   */
  shotokuzei: number;
  /**
   * ★★★【2026-09-13・回4】画面10（993行）の `{nensu}` …… **退職金の勤続年数**。
   *   ★`{tai_gen}`・`{shunyu}` と**同じ行**（`KeikaRow`）から出します。
   */
  nensu: string | null;
  // ── ★★★2本目の表（★基準HTML 1117〜1124行・決め1101・**`{nenkin_gen}` の一時金の年**） -----
  /** ★見出しの支給源名（★「iDeCo等の一時金」の形）。★この年が無い方は `null`＝**節ごと落ちます** */
  ichiji_gen: string | null;
  /** ★見出しの年齢 */
  ichiji_age: string | null;
  /** ★退職所得控除の式（★1本目と同じ `kojoShikiJi()` で作ります） */
  ichiji_kojo_shiki: string | null;
  /** ★退職所得控除の額（★`KeikaRow.kojo_adj`） */
  ichiji_kojo: number | null;
  /** ★その年に受け取る退職手当等の額（★`KeikaRow.shunyu`） */
  ichiji_shunyu: number | null;
  /** ★「→ 控除に収まるので／控除を超えますので、あなたの退職所得」 */
  ichiji_hantei_bun: string | null;
  /** ★その年の退職所得（★`KeikaRow.shotoku`） */
  ichiji_shotoku: number | null;
  /** ★その退職所得にかかる所得税（★`KeikaRow.gensen_ari`） */
  ichiji_shotokuzei: number | null;
  /** ★その退職所得にかかる住民税（★その年に差し引かれます） */
  ichiji_jumin: number | null;
  // ── ★★★区分の1文（★基準HTML 1117行・1126行・決め1107） --------------------
  /**
   * ★1本目の表の下の1文。★足し算が合う方（★実測 184人／250）と、
   *   ★区分で説明できない方（★実測 1行・seed 235）には `null`（かたまりごと落ちます）。
   */
  kubun_bun: string | null;
  /** ★2本目の表の下の1文（★同じ形。★実測 5人／78） */
  ichiji_kubun_bun: string | null;
  // ── ★この本が見た年（★当て・数えのために返します。★画面には出しません） ----------
  shirabeta: {
    /** 退職金の表の年 */
    tai_nen: number;
    /** ★2本目の表の年（★その年が無い方は `null`） */
    ichiji_nen: number | null;
    /** 年金の表の年（★その年が1つも無い方は `null`） */
    nenkin_nen: number | null;
    /** 年金の表の年の、公的年金の支払月数 */
    nenkin_tsukisu: number | null;
    /** `nenkin_toshi_bun` が3つのうちどの字になったか */
    toshi_bun_kata: 'onaji' | 'kubun' | 'zatsu' | 'tsukisu' | 'nashi';
    /** 字②・字③のとき、はじめて変わる年齢 */
    kawaru_age: number | null;
    /** その年の雑所得 */
    zatsu: number;
    /**
     * その年の年金収入（公的年金＋`{nenkin_gen}`）。
     * ★`zatsu_zero_bun` の字（決め1092）は「この年の年金の収入が引ききれます」と言いますので、
     *   ★**0円の年に出ていないか**を数えるために返します。
     */
    nenkin_shunyu: number;
    /** 軽減判定所得 */
    keigen_shotoku: number;
    /** ★`退職所得 −（収入 − 控除）÷ 2`（★決め1107・0なら足し算が合っています）。★退職の年に退職所得が無い方は `null` */
    kubun_sa: number | null;
    /** ★2本目の同じもの（★その年が無い方は `null`） */
    ichiji_kubun_sa: number | null;
  };
}

/** ★決め1066 …… 項目の名前と順（★戦術Coworkが決めた順そのまま） */
const KOJO_NA: readonly [keyof E.KojoUchiwake, string][] = [
  ['kiso', '基礎控除'],
  ['shakai', '社会保険料控除'],
  ['kakekin', '小規模企業共済等掛金控除'],
  ['hoken', '生命保険料控除・地震保険料控除'],
  ['haigusha', '配偶者控除・配偶者特別控除'],
  ['fuyou', '扶養控除'],
  ['shogai', '障害者控除'],
  ['kafu', '寡婦控除'],
  ['hitorioya', 'ひとり親控除'],
];

/**
 * ★★★`{kojo_uchiwake}` ── **0円でない項目だけ**を、決め1066の順で「名前 額」と並べ、「／」でつなぐ。
 *
 * ★★項目が1つだけのときも同じ形です（★決め1066）。
 * ★★★**1つも無いことがあります**（★所得控除の合計が0円の方）。
 *   ★★【2026-09-22・決め（戦術Cowork `kaihatsu_ate_20260922k.md` 1節・(ア)）】★そのときは **`基礎控除 0円`** を返します。
 *     ★前は `null` を返し、★呼ぶ側（680行あたり）が `throw` していました。
 *     ★★**なぜ `基礎控除 0円` か** …… ★行の形が、ほかの方と同じになります（「所得税の所得控除の合計／基礎控除 0円 …… 0円」）。
 *       ★★同じ場所に同じ形で額だけが0、という見え方が、いちばん誤解が少ない（★戦術Coworkの決め）。
 *     ★★★**事実です** …… ★9項目がぜんぶ0円になるのは、`Z.kisoShotoku()` が0を返すとき＝**合計所得金額が
 *       2,500万円を超える年**だけです（所得税法86条の逓減）。★その年の基礎控除は、法どおり0円です。
 *       ★golden 250人・473,416通りで **229通り・3人**（`kensa/g11_tomari_kazoeru.tsx`）。
 *     ★理由は、表の下の `kojo_zero_bun`（★`kojoZeroBun()`）が言います。
 */
export function kojoUchiwakeJi(u: E.KojoUchiwake): string {
  const xs = KOJO_NA.filter(([k]) => u[k] !== 0).map(([k, na]) => `${na} ${en(u[k])}`);
  return xs.length ? xs.join('／') : `${KOJO_NA[0][1]} ${en(0)}`;
}

/**
 * ★★★`{kojo_zero_bun}` ── **所得控除が9項目ぜんぶ0円の年**にだけ出す一文（★決め・戦術Cowork `kaihatsu_ate_20260922j.md` 2-2）。
 *   ★それ以外の方は `null`（★その方には存在しない＝落ちます）。
 *
 * ★字は3つ（★並びは A→B→C・★1本につなぎます）
 *   A（いつも）　この年は、あなたの合計所得金額が2,500万円を超えますので、基礎控除は0円です。
 *   B（★退職所得を除くと2,500万円以下になる年だけ）　合計所得金額には、この年のあなたの退職所得が入ります。
 *   C（いつも）　ほかの所得控除も、この年はいずれも0円です。
 *
 * ★★分けはここ（エンジン側）に置きます。
 *   ★Bの分け …… **`sougou ≦ KISO_ZERO_KOE_SHOTOKU`**。★`shotokuKumitate()` は `goukei = sougou + trunc(taiShotoku)`
 *     （`engine.ts` 1097行）ですので、「合計所得金額 − 退職所得」は **`sougou` そのもの**です。★引き算を新しく書きません。
 *   ★2,500万円は `zeisei.ts` の **`KISO_ZERO_KOE_SHOTOKU`** の1か所から読みます（★A は所得税の基礎控除の話です）。
 *
 * ★★★番人 …… **この一文を出すとき、`goukei > KISO_ZERO_KOE_SHOTOKU` を満たさなければ止めます。**
 *   ★A の字が事実でなくなる道を、先に塞ぎます（★9項目ぜんぶ0円なのに合計所得金額が2,500万円以下なら、
 *     基礎控除が0になった理由が法の逓減ではない＝どこかが違っています）。
 *
 * @param zenbuZero  9項目がぜんぶ0円か（★`kojoUchiwakeJi()` と同じ見方で、呼ぶ側が決めます）
 * @param sougou     その年の総所得（★`shotokuKumitate().sougou`）
 * @param goukei     その年の合計所得金額（★`shotokuKumitate().goukei`・★退職所得を含む）
 * @param hyoNen     その年（★止めるときの字のため）
 */
export function kojoZeroBun(zenbuZero: boolean, sougou: number, goukei: number, hyoNen: number): string | null {
  if (!zenbuZero) return null;
  if (!(goukei > Z.KISO_ZERO_KOE_SHOTOKU)) {
    throw new Error(
      `所得控除が9項目とも0円なのに、合計所得金額（${goukei}円・${hyoNen}年）が `
      + `${Z.KISO_ZERO_KOE_SHOTOKU}円を超えていません。基礎控除が0円になった理由が法の逓減ではありません。`
      + 'こちらでは決めません。戦術Coworkに投げてください。',
    );
  }
  const A = 'この年は、あなたの合計所得金額が2,500万円を超えますので、基礎控除は0円です。';
  const B = '合計所得金額には、この年のあなたの退職所得が入ります。';
  const C = 'ほかの所得控除も、この年はいずれも0円です。';
  return sougou <= Z.KISO_ZERO_KOE_SHOTOKU ? A + B + C : A + C;
}

/**
 * ★★★`{kojo_shiki}` ── 退職所得控除の式（★決め1077・5つの形）。
 *
 * ★本則 …… 20年超「800万＋70万×`{kojo_kasan_nensu}`年」／20年以下「40万×`{kojo_kasan_nensu}`年」
 * ★減額 …… 前に受け取った退職手当等で減る方は「− `{genkaku}`円（重複 `{kasanari_nen}`年）」
 * ★最低保障 …… 差し引いたあとが800,000円に満たない方は「→ 800,000円（最低保障）」
 * ★障害加算 …… 障害で退職された方は「＋ 1,000,000円（障害加算）」
 * ★勤続0年 …… 「0円（勤続年数が0年のため、控除はありません）」
 *
 * ★★★**`KeikaRow.kojo` を本則として読みません。**★あれは最低保障と障害加算を**すでに含んだ
 *   表示用の額**です（★開発Coworkが1度取り違え、障害の方31人で100万円を二重に数えました）。
 */
export function kojoShikiJi(k: E.KeikaRow): string {
  const atama = '退職所得控除 ';
  if (k.kojo_kubun === null) return `${atama}0円（勤続年数が0年のため、控除はありません）`;
  if (k.kojo_tanka === null || k.kojo_kasan_nensu === null) {
    throw new Error(`退職所得控除の区分が「${k.kojo_kubun}」なのに、単価か年数がありません。`);
  }
  const honsoku = (k.kojo_teigaku ?? 0) + k.kojo_tanka * k.kojo_kasan_nensu;
  {
    // ★★**本則が `Z.taishokuKojoHonsoku()` と1円でも違えば止めます**（★式を2か所に持たせないため）
    const hon = Z.taishokuKojoHonsoku(k.nensu);
    if (honsoku !== hon) {
      throw new Error(`退職所得控除の本則が合いません（4つから ${honsoku} ／ 本則 ${hon}）`);
    }
  }
  let ji = k.kojo_teigaku === null
    ? `${atama}${man(k.kojo_tanka)}×${k.kojo_kasan_nensu}年`
    : `${atama}${man(k.kojo_teigaku)}＋${man(k.kojo_tanka)}×${k.kojo_kasan_nensu}年`;
  if (k.genkaku > 0) ji += `　− ${en(k.genkaku)}（重複 ${k.kasanari_nen}年）`;
  if (honsoku - k.genkaku < Z.SAITEI_HOSHO) ji += `　→ ${en(Z.SAITEI_HOSHO)}（最低保障）`;
  if (k.shogai) ji += `　＋ ${en(Z.SHOGAI_KASAN)}（障害加算）`;
  return ji;
}

/**
 * ★★★`nenkin_toshi_bun` の **4つの字**（★戦術Cowork 決め1093・2026-09-12）。
 *
 * ★★**出す順は ① → ② → ③ → ④** です（★はじめの年が無い方には値を渡しません＝かたまりごと落ちます）。
 *   ①（月数）を先にする理由 …… ★「次の年から額が変わります」は**理由を言わない**ので、
 *     ★区分の変化も雑所得の変化も含みます。
 */
/** ★① 決め1085 2-1 …… はじめの年の公的年金が12か月分でない方（★実測 98人・39.2%） */
const TOSHI_TSUKISU = (kara: number, tsuki: number) =>
  `下の${kara}歳の年の公的年金は${tsuki}か月分だけですので、次の年から額が変わります。`;
/**
 * ★② 決め1099（★**因果を外しました**）…… 公的年金等控除の区分が変わる方（★実測 60人・24.0%）。
 *
 * ★★★**前の字（決め1057）は「区分が変わり、★雑所得も変わります」でした。**
 *   ★★その年に**雑所得が変わらない方が 14人／60（23.3%）**いらっしゃいました
 *     （★12人は雑所得が両年とも0円・2人は0でないのに変わらない＝seed 178・211）。
 *   ★なぜ …… ★雑所得は `max(0, 年金収入 − 公的年金等控除)` ですので、
 *     ★★**両年とも控除に収まる方は、区分が変わっても0円のまま**です。
 * ★★いまの字は「**区分が変わります**」だけ ── ★60人ぜんぶで真です（★区分が変わることで分けています）。
 */
const TOSHI_KUBUN = (kara: number, kawaru: number) =>
  `下の表は${kara}歳の年のものです。${kawaru}歳から公的年金等控除の区分が変わります。`;
/**
 * ★③ 決め1099（★**因果を外しました**）…… 区分は変わらず、**雑所得だけ**が変わる方（★実測 84人・33.6%）。
 *
 * ★★★**前の字（決め1093）は「★あなたが受け取る年金の額が変わりますので、雑所得も変わります」でした。**
 *   ★★その年に**年金の額が変わらない方が 28人／84（33.3%）**いらっしゃいました
 *     ── ★**28人とも「年分」が変わっていました**（★令和10年分から基礎控除と公的年金等控除の
 *        表が変わります・決め1031）。★うち19人は⑩の給与の収入も変わります。
 * ★★いまの字は「**あなたの雑所得が変わります**」だけ ── ★84人ぜんぶで真です（★雑所得が変わることで分けています）。
 *
 * ★★★決め1098（★戦術Cowork）＝**「AなのでBも◯◯します」という形の字を書いたら、その回のうちにBを数える。**
 */
const TOSHI_ZATSU = (kara: number, kawaru: number) =>
  `下の表は${kara}歳の年のものです。${kawaru}歳から、あなたの雑所得が変わります。`;
/**
 * ★④ 決め1093（★**字を変えました**）…… どの年も同じ方（★実測 7人・2.8%）。
 *   ★★**終了年齢を出しません** …… ★7人とも終わりが100歳で、`AGE_TO` の端が画面に出てしまいます。
 *   ★前の字（決め1057）は「`{開始年齢}`歳から`{終了年齢}`歳まで、どの年も同じです。」でした。
 */
const TOSHI_ONAJI = (kara: number) =>
  `下の表は、${kara}歳以降、どの年も同じです。`;

/**
 * ★★★`zatsu_zero_bun` の字（★戦術Cowork 決め1092・2026-09-12）。
 *
 * ★★★**前の字（決め1049⑥）は誤りでした** ── 逐語 …
 *   「あなたの場合、公的年金等控除だけで所得がなくなりますので、**この年の所得税はかかりません。**」
 *   ★★この字が出る80人のうち **34人（42.5%）は、その年の所得税が0ではありません**
 *     （★給与所得だけ8人／その年に退職所得だけ19人／両方5人／どちらでもない2人）。
 *   ★★★開発Coworkが数えて、戦術Coworkが字を差し替えられました。
 * ★★決め（1090(1)）＝**「◯◯はかかりません」と書くときは、その税の額そのものを数える。**
 *   ★ある所得が0円であることから、税が0円であることを導きません。
 */
const ZATSU_ZERO = 'あなたの場合、公的年金等控除だけでこの年の年金の収入が引ききれますので、雑所得は0円になります。';

/**
 * ★★★`kubun_bun`・`ichiji_kubun_bun` の字（★戦術Cowork 決め1107・2026-09-13）。
 *
 * ★★【なぜ要るか】★画面は「収入」「控除」「退職所得」を**3行並べて**出しますので、
 *   ★読む方は `（収入 − 控除）÷ 2 ＝ 退職所得` と読みます。
 *   ★★**合わない方が 1本目 66人／250（26.4%）・2本目 5人／78（6.4%）**いらっしゃいました。
 *
 * ★★★【こちらで直した所 ── 便に書きました】
 *   ★決め1107の字は「…より **`{hamidashi}`** 大きくなります」と書かれていましたが、
 *   ★★**`KubunMeisai.hamidashi` は「2分の1にしない部分」ではありません** ──
 *     ★区分ごとの `max(0, その区分の収入 − その区分の控除)` の**和**で、
 *     ★★**一般の区分にも入ります**（★実測 203行／328行）。
 *   ★★★`hamidashi` で出すと、★**足し算が合っている180行にも文が出ます**（★実測）。
 *   ★★ですので **`退職所得 −（収入 − 控除）÷ 2`** で出します ── ★これは
 *     ★戦術Coworkの**見本の数と合います**（★1本目 1,200,000円・2本目 100,000円）。
 *   ★実測 …… ★**マイナスになる行 0行**（★向きを断定できます）・★**0でない行 71行**
 *     （★1本目66・2本目5 ── ★戦術Coworkの数と1行も違いません）。
 */
const KUBUN_JI: Record<'tokutei' | 'tanki' | 'ippan', string> = {
  tokutei: '特定役員退職手当等',
  tanki: '短期退職手当等',
  // ★一般は2分の1にしますので、この字には出ません（★下の `kubunNa()` が外します）
  ippan: '一般の退職手当等',
};

/**
 * ★★**2分の1にしない区分の名前**（★特定役員 ∪ 短期で300万円を超えた分）。
 *   ★★★**どちらも無いときは `null`** を返します ── ★**実測 1行／71（seed 235・2027年）**。
 *     ★その1行の差（575,000円）は「2分の1にしない」からではなく、
 *     ★★**区分ごとに控除を割り振ると、余った控除が区分別では引かれない**ためです
 *     （★区分ごとに `max(0, …)` で0で止めるため）。
 *   ★★**その1行には値を渡しません**（★かたまりごと落ちます）── ★字が当たらないためです。
 *     ★戦術Coworkにお尋ねしています。
 */
function kubunNa(k: E.KeikaRow): string | null {
  const m = k.kubun_meisai;
  const na: string[] = [];
  if (m.kubun_ari.includes('tokutei')) na.push(KUBUN_JI.tokutei);
  if (m.kubun_ari.includes('tanki') && m.koeta) na.push(KUBUN_JI.tanki);
  return na.length ? na.join('と') : null;
}

/** ★★`退職所得 −（収入 − 控除）÷ 2`（★0のときは足し算が合っています） */
function kubunSa(k: E.KeikaRow): number {
  return k.shotoku - Math.floor(Math.max(0, k.shunyu - k.kojo_adj) / 2);
}

/**
 * ★★★【2026-09-14・決め1165】**`kubun_sa` を、2つの理由に分けます。**
 *
 * *   ★**(1) 2分の1にしない部分** ＝ Σ（区分ごとの退職所得 − その区分のはみ出した額 ÷ 2）
 *     ★特定役員は2分の1にしません。★短期は300万円を超えた分を2分の1にしません。
 * *   ★**(2) 引けなかった控除 ÷ 2** ── ★退職所得控除は**区分ごとに分けて**引きます（施行令71条の2）。
 *     ★★★**ある区分で引き切れなかった控除は、ほかの区分では引けません。**
 *     ★「引けなかった控除」は2通りあります ──
 *       ★(あ) その区分の控除が収入より大きく、余ったぶん
 *       ★(い) ★**区分そのものが無いのに割り振られたぶん**（★`kojo_adj − Σ区分の控除`）
 *     ★★そのうち**実際に効くのは `min(引けなかった控除, はみ出した額の和)`** です
 *       （★はみ出しより多く余っても、それ以上は減らせません）。
 * *   ★★★**実測（250人）…… (1)＋(2) は `kubun_sa` と 250人とも1円まで合います。**
 *     ★内わけ …… (1)だけ **51人**／★(2)だけ **2人**（seed 21・seed 235）／★両方 **13人**（★`kubun_sa > 0` は66人）。
 * *   ★★`engine.ts` は**読むだけ**です（★止め）。★`kubun_meisai` が返すものだけを使います。
 */
function kubunUchiwake(k: E.KeikaRow): { hanbun: number; amari: number } {
  let hanbun = 0, hami = 0, kojoKei = 0;
  for (const u of k.kubun_meisai.uchiwake) {
    hanbun += u.shotoku - Z.fdiv(u.hamidashi, 2);
    hami += u.hamidashi;
    kojoKei += u.kojo;
  }
  /**
   * ★★★【2026-09-14・決め1178】**「引けなかった控除」の数え方が変わりました。**
   *
   * ★前は 2つ足していました ──
   *   (あ) `Σ max(0, その区分の控除 − その区分の収入)`（★その区分で引き切れなかったぶん）
   *   (い) `kojo_adj − Σ その区分の控除`（★どの区分の式にも乗らなかったぶん）
   *
   * ★★★**(あ) は、調整計算が引き取りました**（★`engine.ts`）── ★もう捨てていません。
   *   ★ですので **(い) だけ**が残ります。★実測 …… ★**250人で1人だけ**（`seed 183`・400,000円）。
   *   ★★その1人を直さないのは戦術Coworkの決めです（★決め1179(3)）。
   */
  const hikenakatta = k.kojo_adj - kojoKei;
  return { hanbun, amari: Z.fdiv(Math.min(hikenakatta, hami), 2) };
}

/**
 * ★決め1107 の字（★1本目も2本目も同じ形）。
 *
 * ★★★【2026-09-13・決め1111・決め1114(A)】**式を字の中に書くのをやめました。**
 *   ★前は「（`{収入}` − `{控除}`）÷ 2 より」と、**同じ表の上にある2つの数を、もう一度書いて**いました。
 *   ★★戦術Coworkの直し …… 「**上の2つの数の差を2で割った額より**」。
 *   ★★★理由（★戦術Coworkの便 1-1）…… ★見本の方は1本目の退職所得が0円でこの文が落ちますので、
 *     ★**見本の中に式を書くと、表の数と食い違います**。
 */
function kubunBunJi(k: E.KeikaRow, na: string): string | null {
  const kubun = kubunNa(k);
  const sa = kubunSa(k);
  if (sa <= 0) return null;
  const { hanbun, amari } = kubunUchiwake(k);
  /**
   * ★★★**門**（★決め1165）…… ★2つに分けた和が `kubun_sa` と合わなければ、そこで止めます。
   *   ★実測 …… 250人とも1円まで合いました。★合わなくなったら、分け方が壊れています。
   */
  if (hanbun + amari !== sa) {
    throw new Error(
      `退職所得の食い違い（${en(sa)}）の内わけが合いません`
      + `（2分の1にしない部分 ${en(hanbun)} ＋ 引けなかった控除÷2 ${en(amari)}）。`
      + '`kubunUchiwake()` の分け方を確かめてください（決め1165）。',
    );
  }
  /**
   * ★★★【2026-09-14・決め1165】**2つめの字**（★引けなかった控除だけが理由の方・実測 2人／250）。
   *   ★1つめの字は「その部分は2分の1にしませんので」で、★**2分の1にしない区分が無いこの方には当たりません**。
   */
  /**
   * ★★★【2026-09-14・決め1188】**2つめの字は、消しました。**
   *
   * ★★【なぜ消したか】★2つめの字は「**2分の1にしない部分が0円で、食い違いのぜんぶが
   *   『引けなかった控除』から出ている方**」のための字でした（★決め1165・実測 2人／250）。
   * ★★★**調整計算（決め1178）が「引けなかった控除」を消しましたので、この方は0人になりました。**
   *   ★実測（★249人・門で止まる1人を除く）…… ★**`hanbun` が0で `amari` が0でない方 …… 0人**。
   *   ★あわせて ★**`hanbun + amari === kubun_sa` が 249人とも1円まで合います**（★戦術Cowork 5-1(ア)）。
   *
   * ★★★**代わりに、起きないはずの所へ門を置きます**（★決め1140の形）。
   *   ★★もしここが鳴ったら、★**調整計算が働いていない方が出た**ということです。
   */
  if (hanbun === 0) {
    throw new Error(
      `「2分の1にしない部分」が0円なのに、食い違いが ${en(sa)} あります`
      + `（引けなかった控除÷2 ${en(amari)}）。`
      + '**調整計算（決め1178）が働いていれば、この形は出ないはずです。**'
      + 'こちらでは決めません。戦術Coworkに投げてください。',
    );
  }
  if (kubun === null) {
    throw new Error(
      `2分の1にしない部分が ${en(hanbun)} あるのに、区分の名前が出ません。`
      + '`kubunNa()` と `kubunUchiwake()` が食い違っています（決め1165）。',
    );
  }
  /**
   * ★★★**2つが重なる方（13人／250）の字は、まだ決まっていません**（★戦術Cowork 5節・便に書きました）。
   *   ★★いまは1つめの字を出しています ── ★**その方の食い違いには、引けなかった控除のぶん
   *     （実測 13人・`amari > 0`）も混ざっていますので、★理由としては足りません。**
   *   ★★★**こちらでは決めません。**★戦術Coworkの答えを待っています。
   */
  return `あなたの${na}には、${kubun}にあたる部分があります。`
    + `その部分は2分の1にしませんので、あなたの退職所得は`
    + `上の2つの数の差を2で割った額より ${en(sa)} 大きくなります。`;
}

/**
 * ★★★`{tai_gen}` ── **その年に受け取る退職手当等の名前**（★決め1113）。
 *
 * ★★**`KeikaRow.gens` の順に「・」でつなぎます**（★戦術Coworkの決めのとおり）。
 * ★★★**戦術Coworkの例には `iDeCo等` が入っていません**（★1本「退職金」／2本「退職金・企業年金」／
 *   3本「退職金・企業年金・役員退職慰労金」）。★ところが **`{nenkin_gen}` の一時金を退職の年に
 *   受け取る方**では、`KeikaRow.gens` にその支給源も入ります（★実測は便に数で書きました）。
 *   ★★こちらは**決めの字のとおり（`KeikaRow.gens` の順に「・」）**に作り、★数を便に出しています。
 */
export function taiGenJi(k: E.KeikaRow): string {
  return k.gens.join('・');
}

/**
 * ★★★`{tai_uchiwake_bun}` ── **2本以上の方の内わけ**（★決め1113 4-1）。
 *
 * ★字 …… 「内わけは、退職金 20,000,000円・企業年金 3,200,000円です。」
 * ★★**1本だけの方には `null`** を返します（★`gyouNashi` ではなく `null` ＝ **行ごと落ちます**
 *   ── ★この行は表の中ですので、`kumitate()` は**その行だけ**を落とします）。
 * ★★★**額は `KubunMeisai` ではなく、その年に受け取る支給源そのものから取ります。**
 *   ★`KeikaRow` は支給源ごとの額を持っていませんので、`plan` と `p.gens` から組み直します
 *   （★`engine.ts` 736〜746行 `taishokuByYear()` と**同じ絞り方**です）。
 */
export function taiUchiwakeBun(p: E.Jinbutsu, plan: E.Plan, k: E.KeikaRow): string | null {
  if (k.gens.length < 2) return null;
  const xs: string[] = [];
  let kei = 0;
  for (const na of k.gens) {
    const g = p.gens.find((x) => x.name === na);
    if (!g) throw new Error(`支給源「${na}」が見つかりません（keika と gens が食い違っています）。`);
    // ★`{nenkin_gen}` を併給で受け取る方は、一時金にする割合ぶんだけがその年に入ります
    //   （★`engine.ts` 743行と**同じ式**です ── `Z.fdiv` で割ります。★`float` を使いません）
    const shunyu = g.name === plan.nenkin_gen
      ? Z.fdiv(g.shunyu * plan.ichiji_wariai, 100) : g.shunyu;
    kei += shunyu;
    xs.push(`${g.name} ${en(shunyu)}`);
  }
  /**
   * ★★★**門** …… 内わけの和が、表に出る `{shunyu}`（＝`KeikaRow.shunyu`）と1円も違わないこと。
   *   ★★違っていたら、画面に**足し算が合わない内わけ**が出ます。★黙って出しません。
   */
  if (kei !== k.shunyu) {
    throw new Error(
      `内わけの和（${en(kei)}）が、その年に受け取る額（${en(k.shunyu)}）と違います`
      + `（${k.year}年・${k.gens.join('・')}）。画面に足し算が合わない内わけを出しません。`,
    );
  }
  return `内わけは、${xs.join('・')}です。`;
}

/** ★決め1086 の字（★年金として受け取る所得が1つも無い方） */
/**
 * ★★★【2026-09-22・決め（戦術Cowork `kaihatsu_ate_20260922k.md` 3-2）】退職の年に退職所得が無い方の一文。
 *   ★`nenkin_nashi_bun` と同じ形（「…を0円とお答えいただいて…ありません。」）。★字は便k 3-2 から1字1句。
 */
const TAI_NASHI = (taishokuAge: number) =>
  `あなたが${taishokuAge}歳で受け取る退職金を0円とお答えいただいていますので、その年に受け取る退職所得はありません。`;
/**
 * ★★★【2026-09-22・決め（`kaihatsu_ate_20260922k.md` 2-4）】画面10「この画面の前提」の1文目（★A／B）。
 *   ★字は便k 2-4 から1字1句。★A は基準HTML 1185行の1文目と同じ字です（★印4つを組み立てたもの）。
 */
const ZENTEI_TAI_A = (taishokuAge: number, taiGen: string, shunyu: number, nensu: number) =>
  `あなたは${taishokuAge}歳で${taiGen} ${en(shunyu)}を受け取ります（勤続${nensu}年）。`;
/**
 * ★★★【2026-09-22・戦術Cowork `kaihatsu_ate_20260922l.md` 5節】★Bに「（勤続{nensu}年）」を**入れません**。
 *   ★理由（戦術）…… 退職金が0円の方に「（勤続2年）」と出すと、その期間が手取りに効いていると読まれる。
 *     ★効いているかどうかが分かるまで（★便l 5-1・お願い4）、外したままにします。
 *   ★前の回（便k）にあった `taiNensuKaraNyuryoku()`（①〜②の期間から `E.gassanNensu()`）は、使う所が0か所になりましたので消しました。
 */
const ZENTEI_TAI_B = (taishokuAge: number) =>
  `あなたは${taishokuAge}歳で退職され、その年に受け取る退職金は0円とお答えいただいています。`;

const NENKIN_NASHI = (nenkinGen: string) =>
  `あなたの公的年金の額を0円とお答えいただいており、${nenkinGen}も一時金でお受け取りになりますので、`
  + '年金として受け取る所得はありません。';

/** ★その年の年金の表に出るもの（★`nenkin_toshi_bun` の比べにも使います） */
function toshiSugata(p: E.Jinbutsu, nen: Record<number, number>, r: E.EvalResult, y: number) {
  const k = E.shotokuKumitate(p, y, nen[y] ?? 0, taiShotokuOf(r, y));
  return k;
}

/** ★その年の退職所得（★`keika` に行が無い年は 0 ── ★0は事実です。既定値ではありません） */
function taiShotokuOf(r: E.EvalResult, y: number): number {
  const k = r.keika.find((x) => x.year === y);
  return k ? k.shotoku : 0;
}
/** ★その年の掛金（★`detail` に行が無い年は 0 ── ★同じく事実です） */
function kakekinOf(r: E.EvalResult, y: number): number {
  return r.detail[y]?.kakekin ?? 0;
}

/**
 * ★★★画面11の16種類を作ります。
 *
 * @param p           その方
 * @param plan        いま見せている案（★一覧で選んだ行の案・決め1030）
 * @param r           その案の計算結果
 * @param taishokuAge ★⑤（退職の年齢）。★**呼ぶ側から渡します**（★既定値を作りません）
 * @param nenkinGen   年金で受け取る支給源の名前（★`{nenkin_nashi_bun}` の中に入ります）
 */
export function gamen11Bun(moto: E.Jinbutsu, plan: E.Plan, r: E.EvalResult,
                           taishokuAge: number, nenkinGen: string): Bun11 {
  /**
   * ★★★**⑳の軸を、その案のものに差し替えます**（★`build()` が `evaluate()` に渡したのと同じ形）。
   *
   * ★★★【2026-09-12・開発Coworkの誤り】★はじめは差し替えておらず、★**入力の⑳（65歳）のままで
   *   公的年金を数えていました**。★見本の方（案の札「公的年金を61歳から」）で**描いて目で見て**
   *   見つけました ── ★`nenkin_toshi_bun` が「下の**65歳**の年の…」と出ていました（★正しくは61歳）。
   * ★`kime1071.py`・`kime1081.py` では差し替えていたのに、★こちらでは落としていました。
   */
  const p = (plan.nenkin_kaishi_age === null
    || plan.nenkin_kaishi_age === moto.koteki_kaishi_age)
    ? moto : moto.withKotekiKaishiAge(plan.nenkin_kaishi_age);

  // ── 退職金の表 …… **退職の年**（★`{tai_age}` と同じ年です） -----------------
  const taiNen = p.year(taishokuAge);
  const k0 = r.keika.find((x) => x.year === taiNen) ?? null;
  /**
   * ★★★【2026-09-22・決め（`kaihatsu_ate_20260922k.md` 3節）】★前はここで `throw` していました
   *   （「退職の年の計算過程が `keika` にありません」）。★★退職金0円の方は、iDeCo等を年金で受け取る案の
   *   **ぜんぶ**でここに来ます（★seed 36 …… 187通りのうち 186通り）。★19,800円をお払いになった方が
   *   一覧のどの行を選んでも止まる形でしたので、★**止めずに、退職の段を `null`（節ごと落ちる）にし、
   *   一文 `tai_nashi_bun` を出します**。
   * ★`k` が `null` の間は、退職の段の9つが `null` です（★下の戻りの所）。
   */
  const k = k0;
  const taiU = k === null ? null
    : E.nenkanZeiUchiwake(p, taiNen, r.detail[taiNen]?.ideco_nenkin ?? 0,
                          k.shotoku, true, kakekinOf(r, taiNen));

  /**
   * ── ★★★2本目の表 …… **退職の年いがいに退職所得の年が在る方**（★決め1101・実測 78人／250・31.2%）
   *
   * ★★1本目（1111〜1116行）は「あなたの`{tai_gen}`（`{tai_age}`）」＝**退職の年 1本ぶん**です。
   *   ★★★ですので、`keika` に退職の年いがいの年が在ると、★**その退職所得も税も、画面11のどこにも
   *     出ていませんでした**（★41人／250・16.4%に、最大 6,195,000円の退職所得と 1,448,041円の税）。
   *
   * ★★**その年が無い方（172人・68.8%）には 9種類とも `null`** を渡します ＝ ★見出しごと落ちます
   *   （★決め1101で、**見出しに印 `ichiji_gen` を入れていただきました** ── ★決め1094で分かったとおり、
   *     ★見出しに名前が1つも無いと落ちません）。
   *
   * ★★★**2年以上在ったら止めます。**★表は2本しかありませんので、★**黙って1年だけ出しません。**
   *   ★`engine.ts` 1652行は、渡された支給源を**ぜんぶ退職の年**に入れ、iDeCo等だけが別の年ですので、
   *     ★退職所得の年は**最大2つ**です（★⑨㉓を渡すようにした決め1106のあとも同じです）。
   *   ★★この門は「思い込みを残さないため」に置いています。★実測（250人・910案）では**1度も鳴りません**。
   */
  const hoka = r.keika.filter((x) => x.year !== taiNen);
  if (hoka.length > 1) {
    throw new Error(
      `退職所得の年が、退職の年のほかに ${hoka.length}つあります`
      + `（${hoka.map((x) => `${x.year}年`).join('・')}）。`
      + '**画面11の表は2本までです。**3本目をどう出すかは決まっていませんので、こちらでは決めません。'
      + '戦術Coworkに投げてください。',
    );
  }
  const ik = hoka[0] ?? null;
  const iU = ik === null ? null
    : E.nenkanZeiUchiwake(p, ik.year, r.detail[ik.year]?.ideco_nenkin ?? 0,
                          ik.shotoku, true, kakekinOf(r, ik.year));

  // ── 年金の表 …… **年金収入がはじめて0でなくなる年**（★決め1085の正本） -------
  const nen = E.nenkinByYear(p, plan);
  let nenkinNen: number | null = null;
  for (let a = AGE_FROM; a <= AGE_TO; a++) {
    const y = p.year(a);
    if ((nen[y] ?? 0) + p.kotekiByYear(y) > 0) { nenkinNen = y; break; }
  }
  /**
   * ★★★その年が1つも無い方（★実測 1人／250・0.4%・seed 12）── ★決め1086。
   *   ★**表は⑳の年の姿（0円）で出します**（★戦術Cowork「0円の表のまま残してかまいません」）。
   *   ★★`nenkin_toshi_bun` は `null` にします ── ★「下の表は◯歳の年のものです」と言える年が
   *     無いためです。★`null` は「その方には存在しない」で、かたまりごと落ちます。
   */
  const hyoNen = nenkinNen ?? p.year(p.koteki_kaishi_age);
  const j = toshiSugata(p, nen, r, hyoNen);
  const u = E.nenkanZeiUchiwake(p, hyoNen, nen[hyoNen] ?? 0, taiShotokuOf(r, hyoNen),
                                true, kakekinOf(r, hyoNen));
  const jo = E.shotokuJoukyou(p, hyoNen, nen[hyoNen] ?? 0, kakekinOf(r, hyoNen));

  // ── `nenkin_toshi_bun` …… ★★**4つの字**（★決め1093） -----------------------
  const hyoAge = p.age(hyoNen);
  const tsukisu = nenkinNen === null ? null : p.tsukisuKara(p.koteki_kaishi_age, nenkinNen);
  /**
   * ★★**はじめの年のあと、公的年金等控除の区分と雑所得が変わる年**をさがします。
   *   ★★★**式を書いていません** …… ★`shotokuKumitate()` を年ごとに呼んで、**同じかどうかを見る**だけです。
   *   ★見る範囲は 55〜100歳（★`gamen8.ts` と同じ `AGES`）── ★公的年金は生涯続きますので、
   *     ★★**年金の表に「終わり」はありません**（★戦術Cowork 決め1093・お尋ね(6)への答え）。
   *
   * ★★★**はじめて変わる年で止めます**（★`break`）── ★その1つの年齢を `{変わる年齢}` に出すためです。
   *   ★その年に**区分が変わっていれば字②**、★**雑所得だけなら字③**です。
   *   ★同じ年に両方変わったときは**字②**です（★区分を先に見ます）。
   */
  let kawaruAge: number | null = null;
  let kawaruRiyu: 'kubun' | 'zatsu' | null = null;
  for (let a = hyoAge + 1; a <= AGE_TO; a++) {
    const y = p.year(a);
    const x = E.shotokuKumitate(p, y, nen[y] ?? 0, taiShotokuOf(r, y));
    if (x.nenkin_kojo_kubun !== j.nenkin_kojo_kubun) { kawaruAge = a; kawaruRiyu = 'kubun'; break; }
    if (x.zatsu !== j.zatsu) { kawaruAge = a; kawaruRiyu = 'zatsu'; break; }
  }
  let toshiBun: string | null;
  let toshiKata: Bun11['shirabeta']['toshi_bun_kata'];
  if (nenkinNen === null) {
    toshiBun = null; toshiKata = 'nashi';
  } else if (tsukisu !== null && tsukisu !== 12 && p.kotekiByYear(nenkinNen) > 0) {
    // ★字① …… はじめの年の公的年金が12か月分でない方（★決め1085 2-1）
    toshiBun = TOSHI_TSUKISU(hyoAge, tsukisu); toshiKata = 'tsukisu';
  } else if (kawaruRiyu === 'kubun' && kawaruAge !== null) {
    // ★字② …… 公的年金等控除の区分が変わる方（★決め1057）
    toshiBun = TOSHI_KUBUN(hyoAge, kawaruAge); toshiKata = 'kubun';
  } else if (kawaruRiyu === 'zatsu' && kawaruAge !== null) {
    // ★字③ …… 区分は変わらず、雑所得だけが変わる方（★決め1093・新しい字）
    toshiBun = TOSHI_ZATSU(hyoAge, kawaruAge); toshiKata = 'zatsu';
  } else {
    // ★字④ …… どの年も同じ方（★決め1093・終了年齢を出しません）
    toshiBun = TOSHI_ONAJI(hyoAge); toshiKata = 'onaji';
  }

  // ── 保険料の2行（★決め1033） -------------------------------------------------
  /**
   * ★★★**給与所得者数を1人として計算しています**（★`sakaimeList()`・`keigenWariai()` の既定と同じ）。
   *   ★理由 …… ★入力（`paidInput.ts`）に**欄が0か所**で、渡せる数がありません。
   *   ★★★**これは決め1059（`check()` の食い違い）と同じ形です。**★戦術Coworkにお尋ねしています
   *     ── ★回2・回3では触らない（回4の前に直す）と決まっていますので、**同じ形で置いています**。
   */
  const keigen = S.keigenHanteiShotoku(hyoAge, jo.nenkin_zatsu, jo.kyuyo);
  const osamaru = S.keigenWariai(keigen, 1, 1) === 7;

  /**
   * ★★【2026-09-22・決め（`kaihatsu_ate_20260922k.md` 1節）】★前はここで、9項目ぜんぶ0円の方を `throw` していました。
   *   ★いまは `基礎控除 0円` の字を出し、★下の `kojo_zero_bun` が理由を言います。
   *   ★9項目ぜんぶ0円かどうかは、★`kojoUchiwakeJi()` と**同じ見方**（`KOJO_NA` の9つが全部0）で決めます。
   */
  const uchiwakeJi = kojoUchiwakeJi(u.kojo_uchiwake);
  const kojoZenbuZero = KOJO_NA.every(([k]) => u.kojo_uchiwake[k] === 0);
  const sk = E.shotokuKumitate(p, hyoNen, nen[hyoNen] ?? 0, taiShotokuOf(r, hyoNen));
  const kojoZeroBunJi = kojoZeroBun(kojoZenbuZero, sk.sougou, sk.goukei, hyoNen);

  return {
    an_bun: plan.label,
    // ── ★★★回3の2種類（★決め1113） --------------------------------------
    tai_gen: k === null ? null : taiGenJi(k),
    tai_nashi_bun: k === null ? TAI_NASHI(taishokuAge) : null,
    zentei_tai_bun: k === null
      ? ZENTEI_TAI_B(taishokuAge)
      : ZENTEI_TAI_A(taishokuAge, taiGenJi(k), k.shunyu, k.nensu),
    tai_uchiwake_bun: k === null ? null : taiUchiwakeBun(p, plan, k),
    // ★上の覚え書きの3つ（★`data-mada` は1度も付いていませんでしたが、渡す所が0か所でした）
    kojo: k === null ? null : k.kojo_adj,
    shunyu: k === null ? null : k.shunyu,
    shotoku: k === null ? null : k.shotoku,
    kojo_shiki: k === null ? null : kojoShikiJi(k),
    tai_hantei_bun: k === null ? null : (k.shotoku === 0
      ? '→ 控除に収まるので、あなたの退職所得'
      : '→ 控除を超えますので、あなたの退職所得'),
    shotokuzei_tai: k === null ? null : k.gensen_ari,
    jumin_taishoku: taiU === null ? null : taiU.jumin_taishoku,
    nenkin_nashi_bun: nenkinNen === null ? NENKIN_NASHI(nenkinGen) : null,
    /** ★★決め1181 …… `nenkin_nashi_bun` と**裏返し**です（★同じ1つの条件で分けます） */
    nenkin_setsu_midashi: nenkinNen === null ? null : '年金の所得',
    nenkin_toshi_bun: toshiBun,
    kyuyo: j.kyuyo,
    kojo_uchiwake: uchiwakeJi,
    kojo_zero_bun: kojoZeroBunJi,
    kojo_goukei: u.kojo_goukei,
    jumin: u.jumin_sougou,
    jumin_hantei_bun: jo.hikazei
      ? '→ あなたの合計所得が収まるので、翌年度に納める住民税'
      : '→ あなたの合計所得が超えるので、翌年度に納める住民税',
    kokuho_kiso: S.KEIGEN_BASE,
    hoken_hantei_bun: osamaru
      ? '→ あなたの保険料の判定に使う所得が収まるので'
      : '→ あなたの保険料の判定に使う所得が超えるので',
    hoken_kekka: osamaru ? '変わりません' : '上がる場合があります',
    /**
     * ★★★決め1100 …… **年金収入が0でない**ことを条件に入れました。
     *   ★字は「公的年金等控除だけで**この年の年金の収入が引ききれます**ので」ですが、
     *     ★★年金収入が0円の方（★1人・seed 12）は**引くもの自身がありません**（`nenkin_kojo` も `null`）。
     *   ★その方には `nenkin_nashi_bun` が上で同じことを言いますので、2つの文が並んでいました。
     * ★★出す相手 …… **79人／250（31.6%）**（★80人 − 1人）。
     */
    zatsu_zero_bun: j.zatsu === 0 && j.nenkinShunyu > 0 ? ZATSU_ZERO : null,
    /**
     * ★★★【2026-09-13・回4】出口の無かった5種類 ＋ 画面10の `{nensu}`。
     *   ★`shotokuzei` …… **退職所得を入れません**（★`Bun11` の覚え書き）。
     *     ★★`taiShotoku` に 0 を渡した `nenkanZeiUchiwake()` の `shotokuzei` です。
     */
    nenkin_shunyu: j.nenkinShunyu,
    nenkin_kojo_kubun: j.nenkin_kojo_kubun,
    nenkin_kojo: j.nenkin_kojo,
    zatsu: j.zatsu,
    shotokuzei: E.nenkanZeiUchiwake(p, hyoNen, nen[hyoNen] ?? 0, 0,
                                    true, kakekinOf(r, hyoNen)).shotokuzei,
    nensu: k === null ? null : `${k.nensu}年`,
    // ── ★★★2本目の表の9種類（★決め1101）
    // ★`{tai_gen}` と同じ字の作り方にそろえました（★決め1113。★2本目の年は実測でいつも1本です）
    ichiji_gen: ik === null ? null : `${taiGenJi(ik)}の一時金`,
    ichiji_age: ik === null ? null : `${p.age(ik.year)}歳`,
    ichiji_kojo_shiki: ik === null ? null : kojoShikiJi(ik),
    ichiji_kojo: ik === null ? null : ik.kojo_adj,
    ichiji_shunyu: ik === null ? null : ik.shunyu,
    ichiji_hantei_bun: ik === null ? null
      : (ik.shotoku === 0
        ? '→ 控除に収まるので、あなたの退職所得'
        : '→ 控除を超えますので、あなたの退職所得'),
    ichiji_shotoku: ik === null ? null : ik.shotoku,
    ichiji_shotokuzei: ik === null ? null : ik.gensen_ari,
    ichiji_jumin: iU === null ? null : iU.jumin_taishoku,
    /**
     * ── ★★★区分の1文（★決め1107・決め1114(A)）
     *
     * ★★★**`{tai_gen}` と同じ字を使います**（★決め1107の字が「あなたの`{tai_gen}`には、」ですので、
     *   ★決め1113で `{tai_gen}` の字が決まったいま、**同じ画面で2通りに書きません**）。
     *   ★前の回は `k.gens.join('と')` でしたので、「退職金とiDeCoと企業年金」でした。
     */
    /** ★退職の年に退職所得が無い方は `null`（★退職の段と一緒に落ちます。★`kubun_bun` は退職の段の下の1文です） */
    kubun_bun: k === null ? null : kubunBunJi(k, taiGenJi(k)),
    ichiji_kubun_bun: ik === null ? null
      : kubunBunJi(ik, `${taiGenJi(ik)}の一時金`),
    shirabeta: {
      tai_nen: taiNen, ichiji_nen: ik === null ? null : ik.year,
      nenkin_nen: nenkinNen, nenkin_tsukisu: tsukisu,
      toshi_bun_kata: toshiKata,
      kawaru_age: kawaruAge,
      zatsu: j.zatsu, nenkin_shunyu: j.nenkinShunyu, keigen_shotoku: keigen,
      kubun_sa: k === null ? null : kubunSa(k), ichiji_kubun_sa: ik === null ? null : kubunSa(ik),
    },
  };
}
