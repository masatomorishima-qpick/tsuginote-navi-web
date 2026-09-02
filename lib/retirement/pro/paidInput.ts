/**
 * lib/retirement/pro/paidInput.ts
 *
 * 画面7（有料）の入力を、計算エンジンの `Jinbutsu` / `Gen` / `Plan` に入れます。
 * もとは `hikiwatashi/nyuryoku_taiouhyo_20260815.md`（入力とエンジンの対応表）です。
 *
 * **ここを取り違えると、検査は全部通るのに答えだけが違います。**（対応表の書き出し）
 * ですので、対応表 §3 の「よくある取り違え」7つを、**`kensa/paid_input_test.ts` で
 * 1つずつ当てています。**この7つは、直したあとに必ず回してください。
 *
 * 【単位】画面の単位（万円・年・歳）は**画面側で持ち**、ここには**円・通し月数**で渡します。
 *   `manToYen()` を通すのは画面側の仕事です。**ここで万円を受け取らないでください。**
 */
import * as E from './engine';
import * as Z from './zeisei';

// ---------------------------------------------------------------- ⑰（E-24・未決）
/**
 * ⑰（お住まいの市区町村）を**省いた方**を、どの級地で計算するか。
 *
 * **【E-24・決まりました 2026-08-19（指示書 第25版）】1級地で計算します。**
 *
 *   基準HTMLの ⓘ は「省いた場合は**3級地（あなたに不利な側）**で計算します」と書いていました。
 *   **9,504人に当てたところ、向きが一定しませんでした**（`kensa/kyuchi_scan.ts`）。
 *     1級地のほうが手取りが多く出る 54人 ／ 3級地のほうが手取りが多く出る 42人
 *     動いた幅は全員ちょうど 5,000円（均等割1本ぶん）
 *   **「3級地が不利な側」とは書けません。**
 *
 *   決め手は、**無料版が ⑰ を聞いておらず、1級地で計算している**ことです。
 *   3にすると、**同じ方の手取りが無料版と有料版で5,000円ずれます**（96人＝1.0%）。
 *   **無料版に合わせます。**
 *
 * **変えたいときは、この1行だけです。**画面7・画面8・PDFが同時に変わります。
 * **ⓘ の文言（「3級地（あなたに不利な側）」「20人で試して1,232円」）の書き替えは、
 *   戦術Cowork側の仕事です。**基準HTMLの文言を、こちらでは変えません。
 */
export const KYUCHI_HABUITA_TOKI = 1;

/**
 * ⑰ を必ず明示で渡すための型。**`Jinbutsu.kyuchi` の既定値（1）には頼りません。**
 * 既定値に頼ると、**渡し忘れが検査を全部通ってしまいます**（§4-4-2 と同じ形）。
 */
export type Kyuchi = 1 | 2 | 3 | 'habuku';
export const kyuchiToEngine = (k: Kyuchi): number =>
  k === 'habuku' ? KYUCHI_HABUITA_TOKI : k;

// ---------------------------------------------------------------- 入力の型
/** 年月。`E.ym()` に渡す前の、画面の形のまま */
export type Nengetsu = { nen: number; tsuki: number };
/** 期間。「わからない」を選べるものは `'wakaranai'` */
export type Kikan = { hajime: Nengetsu; owari: Nengetsu } | 'wakaranai';

/** ⑲ すでに受け取った退職手当等。**1件ずつ** */
export type Sumi = {
  /** 受け取った年（西暦）。**前年以前のものだけ**（同じ年のものは ⑨ か ㉓ へ） */
  uketoriNen: number;
  /** 額（円） */
  gaku: number;
  /** その勤め先での勤続期間（または iDeCo等の加入期間） */
  kikan: { hajime: Nengetsu; owari: Nengetsu };
  /** 確定拠出年金（iDeCo・企業型DC）か。**小規模企業共済・企業年金は false**（取り違え4） */
  dc: boolean;
};

/**
 * 画面7の入力。**基準HTML（bin/senjutsu/tsuginote_gamen_base_20260831b.html・164,868バイト。2026-09-02 に注記を直しました）に出ている項目をそのまま並べています。**
 *
 * 【個数】引き継ぎ5 ＋ 本体15（⑥⑦⑧⑨⑩-1⑩-2⑪⑫⑬⑲⑭⑮⑯⑱⑳）＋ 詳細8（㉕㉖㉗㉔㉓㉑㉒⑰）
 *   ＝ **28項目**です。
 *   **【決まりました 2026-08-19（指示書 第25版）】28項目です。**
 *   第24版までの §5-2 は「20項目（15＋詳細8）」でしたが、15＋8＝23で20と合わず、
 *   基準HTMLの実数とも違っていました。**基準HTMLに合わせて直されました。**
 */
export type PaidInput = {
  // ---- 画面1からの引き継ぎ（ここで直せます）----------------------------
  /** ① 退職金の見込額（円） */
  taishokukin: number;
  /** ② 勤続年数（年）。⑫を入れた方では**⑫が優先**します */
  kinzokuNensu: number;
  /** ③ iDeCo等の残高（円） */
  ideco: number;
  /** ④ ③に加入していた期間（年）。⑬を入れた方では**⑬が優先**します */
  kanyuNensu: number;
  /** ⑤ 退職金を受け取る予定の年齢（歳） */
  taishokuAge: number;

  // ---- 税金を正確に計算するために --------------------------------------
  /** ⑥ 生まれた年月日。**月日が分からない方は `umare: null`**（不利側に倒れます） */
  seinen: number;
  umare: [number, number] | null;
  /** ⑦ 退職金を受け取る年の、それ以外の収入（年額・円） */
  shunyuTaishokuNen: number;
  /** ⑧ 退職した翌年以降の収入見込み（年額・円） */
  shunyuYokutoshiIkou: number;
  /** ⑧ を何歳まで見込むか。**画面7で受け取ります。既定値を作りません** */
  shunyuOwariAge: number;
  /** ⑨ 企業年金（確定給付）の額（円）。**`dc: false`**（取り違え4） */
  kigyoNenkin: number;
  /** ⑩-1 老齢厚生年金の見込額（年額・円）。**報酬比例部分だけ** */
  koseiNenkin: number;
  /** ⑩-2 老齢基礎年金の見込額（年額・円）。**単独のフィールドはありません**（取り違え1） */
  kisoNenkin: number;
  /** ⑪ 60歳前後のまとまった支出。年齢 → 円 */
  shishutsu: Record<number, number>;
  /** ⑫ 勤続期間 */
  kinzokuKikan: Kikan;
  /** ⑬ iDeCo等に加入していた期間 */
  kanyuKikan: Kikan;
  /** ⑲ すでに受け取った退職手当等。**`gens` ではなく `sumi` へ**（取り違え3） */
  sumi: Sumi[];

  // ---- 所得控除を反映するために ----------------------------------------
  /** ⑭ 扶養しているご家族の人数。**一般の扶養親族だけ**（取り違え2） */
  fuyouIppan: number;
  /** ⑮ 社会保険料の年間支払額（円） */
  shakaiHoken: number;
  /** ⑯ 生命保険料控除・地震保険料控除の額（円）。**所得税の額をそのまま**（取り違え5） */
  seimeiHoken: number;

  // ---- そのほか --------------------------------------------------------
  /** ⑱ iDeCo等を年金で受け取る場合の、年間の回数 */
  nenkinKaisu: number;
  /** ⑳ 公的年金を受け取り始める年齢（歳）。**軸にもします**（取り違え6） */
  kotekiKaishiAge: number;

  // ---- 詳細（あてはまる方だけ）----------------------------------------
  /** ㉕ 配偶者の合計所得金額（円）。配偶者がいない方は `null` */
  haigushaShotoku: number | null;
  /** ㉕ 配偶者が老人控除対象配偶者か */
  haigushaRojin: boolean;
  /** ㉖ 年齢で区分が変わる扶養親族。**⑭とは別に数えます**（取り違え2） */
  fuyouTokutei: number;
  fuyouRojin: number;
  fuyouDokyoRojin: number;
  /** ㉗ 障害者控除・寡婦控除・ひとり親控除 */
  shogaiIppan: number;
  shogaiTokubetsu: number;
  shogaiDokyoTokubetsu: number;
  kafu: boolean;
  hitorioya: boolean;
  /** ㉔ 障害が直接の原因で退職する場合。**退職金の `Gen` に付きます** */
  shogaiTaishoku: boolean;
  /** ㉓ 役員として受け取る退職金（役員退職慰労金）。無い方は `null` */
  yakuin: { gaku: number; kikan: { hajime: Nengetsu; owari: Nengetsu } } | null;
  /** ㉑ 配偶者が生まれた年（西暦）。加給年金の判定。無い方は `null` */
  haigushaSeinen: number | null;
  /** ㉑ 子の人数 */
  koNin: number;
  /** ㉒ 厚生年金保険の被保険者期間が20年以上か */
  kosei20nen: boolean;
  /** ⑰ お住まいの市区町村（級地）。**省いた方は `'habuku'`**（E-24・上を見てください） */
  kyuchi: Kyuchi;
};

// ---------------------------------------------------------------- 組み立て
const ym = (n: Nengetsu): number => E.ym(n.nen, n.tsuki);

/**
 * 「わからない」と答えた期間の置き方。**あなたに不利な側**に置きます（基準HTMLの ⓘ）。
 *   ⑫（勤続期間）  … iDeCo等の加入期間と**最も重なる**置き方
 *   ⑬（加入期間）  … 勤続期間の**末尾に完全に重なる**置き方
 * どちらも「退職の年の3月まで、②（④）年ぶん」を末尾にそろえる形になります。
 */
function kikanOf(k: Kikan, nensu: number, owari: number): [number, number] {
  if (k === 'wakaranai') return [owari - Math.trunc(nensu) * 12 + 1, owari];
  return [ym(k.hajime), ym(k.owari)];
}

export type Kumitate = {
  p: E.Jinbutsu;
  /** ⑤から作った、退職金を受け取る年 */
  taishokuNen: number;
  /** ⑱。`Plan` に入ります（`build()` の引数ではありません） */
  nenkinKaisu: number;
  /** 「わからない」を使った項目。**計算の根拠のページに、どう置いたかを書きます** */
  wakaranai: ('⑫' | '⑬')[];
};

/**
 * 画面7の入力 → `Jinbutsu`。
 *
 * 【「現在の年」を受け取らない理由・2026-08-19】
 *   最初は `genzaiNen` を引数に取っていましたが、**一度も使っていませんでした**
 *   （本物のプロジェクトの ESLint が「定義されているが使われていない」で拾いました）。
 *   ここで要るのは**退職の年**（＝⑥の生年 ＋ ⑤の年齢）だけで、現在の年は関係しません。
 *   **使わない引数を残すと「渡したから大丈夫」と読めてしまう**ので、外しました。
 *   `build()` に渡す `genzaiNen` は、**呼び出し側が別に渡してください**（§4-4-2）。
 */
export function toJinbutsu(v: PaidInput): Kumitate {
  const taishokuNen = v.seinen + Math.trunc(v.taishokuAge);
  // 「退職の年の3月まで」で末尾をそろえる（対応表 §1）
  const owari = E.ym(taishokuNen, 3);

  const wakaranai: ('⑫' | '⑬')[] = [];
  if (v.kinzokuKikan === 'wakaranai') wakaranai.push('⑫');
  if (v.kanyuKikan === 'wakaranai') wakaranai.push('⑬');

  const gens: E.Gen[] = [
    // ① 退職金。㉔（障害が原因の退職）はここに付きます
    new E.Gen('退職金', Math.trunc(v.taishokukin),
      kikanOf(v.kinzokuKikan, v.kinzokuNensu, owari),
      false, v.kinzokuKikan === 'wakaranai', false, v.shogaiTaishoku),
    // ③ iDeCo等。**`dc: true` は確定拠出年金だけ**（取り違え4）
    new E.Gen('iDeCo等', Math.trunc(v.ideco),
      kikanOf(v.kanyuKikan, v.kanyuNensu, owari),
      true, v.kanyuKikan === 'wakaranai'),
  ];
  // ⑨ 企業年金（確定給付）。**`dc: false`**（取り違え4）
  if (v.kigyoNenkin > 0) {
    gens.push(new E.Gen('企業年金', Math.trunc(v.kigyoNenkin),
      kikanOf(v.kinzokuKikan, v.kinzokuNensu, owari), false));
  }
  // ㉓ 役員退職慰労金。役員だった期間が5年以下なら特定役員退職手当等
  if (v.yakuin) {
    gens.push(new E.Gen('役員退職慰労金', Math.trunc(v.yakuin.gaku),
      [ym(v.yakuin.kikan.hajime), ym(v.yakuin.kikan.owari)], false, false, true));
  }

  // ⑦⑧ 収入。⑦は退職の年、⑧は翌年以降 ⑧の終わりの年齢まで
  const shunyuByAge: Record<number, number> = {};
  if (v.shunyuTaishokuNen > 0) shunyuByAge[v.taishokuAge] = Math.trunc(v.shunyuTaishokuNen);
  if (v.shunyuYokutoshiIkou > 0) {
    for (let a = v.taishokuAge + 1; a <= v.shunyuOwariAge; a++) {
      shunyuByAge[a] = Math.trunc(v.shunyuYokutoshiIkou);
    }
  }

  // ⑲ すでに受け取った退職手当等。**`sumi` へ**（取り違え3）
  const sumi: [E.Gen, number][] = v.sumi.map((s) => [
    new E.Gen('すでに受け取った退職手当等', Math.trunc(s.gaku),
      [ym(s.kikan.hajime), ym(s.kikan.owari)], s.dc),
    s.uketoriNen,
  ]);

  /**
   * ★**⑳が、その方の繰下げの上限を超えていないか**（2026-08-30・(a)。戦術Cowork `senjutsu_20260830f.md` §2）
   *
   * 【なぜ要るか】上限は、**その方の生まれ年で変わります。**
   *     `zeisei.ts` 414〜416行  **1952年4月2日以後生まれなら 75歳、それより前なら 70歳**
   *   ところが⑳の説明は、**全員に「60歳から75歳まで」**と書いてあります（`paidFields.ts` 107〜110行）。
   *
   *   1952年4月2日より前に生まれた方が⑳に **71〜75** を入れると、こうなります。
   *     ・`nenkinKaishiAges()` が**空**になり、`[jogen]` に落ちる
   *       → **その方の実際の年齢と違う 70 が候補**になります
   *     ・そのあと `nenkinRitsu()`（`zeisei.ts` 422〜423行）が**例外で止まります**
   *       → **利用者から見ると、数が違うのではなく、画面が出ません**
   *
   *   戦術Coworkが総当たりで数えられました（`jogen.mts`・2,304通り）。
   *     `[jogen]` に落ちる  2026年 **8通り** → 2028年 0通り
   *     例外で止まる        2026年 **242通り** → 2028年 **250通り**（**毎年増えます**）
   *
   * 【ですので、手前で止めます】`nenkinRitsu()` まで持っていきません。
   *   **理由の分かる形で、入口で止めます。**
   */
  const kotekiKaishiAge = Math.trunc(v.kotekiKaishiAge);
  {
    const jogen = Z.kurisageJogenAge(v.seinen, v.umare);
    if (kotekiKaishiAge < Z.KURIAGE_SAITEI_AGE || kotekiKaishiAge > jogen) {
      throw new Error(`⑳「あなたが公的年金を受け取り始める（始めた）年齢」が範囲外です`
        + `（${kotekiKaishiAge}歳）。${v.seinen}年生まれの方は`
        + `${Z.KURIAGE_SAITEI_AGE}歳から${jogen}歳までです。`
        + `（繰下げの上限は生まれた日で変わります。1952年4月2日より前に生まれた方は70歳までです）`);
    }
  }

  const p = new E.Jinbutsu({
    seinen: v.seinen,
    umare: v.umare,                      // 取り違え7：受けているなら必ず渡す
    gens,
    // 取り違え1：⑩-2 に単独のフィールドはありません。**合算して `koteki_nenkin`**
    koteki_nenkin: Math.trunc(v.koseiNenkin) + Math.trunc(v.kisoNenkin),
    kosei_nenkin: Math.trunc(v.koseiNenkin),
    koteki_kaishi_age: kotekiKaishiAge,                 // 取り違え6：軸は build() 側
    shunyu_by_age: shunyuByAge,
    shakai_hoken: Math.trunc(v.shakaiHoken),
    fuyou_nin: Math.trunc(v.fuyouIppan),               // 取り違え2：一般だけ
    seimei_hoken: Math.trunc(v.seimeiHoken),           // 取り違え5：所得税の額のまま
    kyuchi: kyuchiToEngine(v.kyuchi),                  // E-24：既定値に頼らず明示で渡す
    shishutsu: v.shishutsu,
    haigusha_seinen: v.haigushaSeinen,
    ko_nin: Math.trunc(v.koNin),
    kosei_20nen: v.kosei20nen,
    sumi,
    jinteki: new Z.Jinteki({
      haigusha_shotoku: v.haigushaShotoku,
      haigusha_rojin: v.haigushaRojin,
      fuyou_tokutei: Math.trunc(v.fuyouTokutei),
      fuyou_rojin: Math.trunc(v.fuyouRojin),
      fuyou_dokyo_rojin: Math.trunc(v.fuyouDokyoRojin),
      shogai_ippan: Math.trunc(v.shogaiIppan),
      shogai_tokubetsu: Math.trunc(v.shogaiTokubetsu),
      shogai_dokyo_tokubetsu: Math.trunc(v.shogaiDokyoTokubetsu),
      kafu: v.kafu,
      hitorioya: v.hitorioya,
    }),
  });

  return { p, taishokuNen, nenkinKaisu: Math.trunc(v.nenkinKaisu), wakaranai };
}

/** 一時金でだけ受け取る支給源の名前（`build()` の第2引数） */
export function ichijikinOnly(p: E.Jinbutsu): string[] {
  return p.gens.filter((g) => g.name !== 'iDeCo等').map((g) => g.name);
}

/** 併給のときに一時金にする割合（%）の候補。対応表 §2-3 */
export const HEIKYU_WARIAI = [10, 20, 30, 40, 50, 60, 70, 80, 90] as const;
