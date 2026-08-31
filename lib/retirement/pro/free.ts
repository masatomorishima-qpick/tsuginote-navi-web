/**
 * lib/retirement/pro/free.ts
 *
 * 無料版（画面2〜5-6）に出す数字を、**すべてエンジンから**出します。
 * 画面に数字を書き写さないこと（§2の3）。
 *
 * 【⑳を軸にしません】§5-3-3・E-17
 *   無料版は `koteki_nenkin = 0` です。公的年金が0なら、⑳（公的年金を受け取り始める
 *   年齢）は手取りに1円も効きません。**同じ案が⑳の候補の数だけ並ぶだけ**です。
 *   軸にすると、スマホ相当のCPUで `build()` が約9秒かかります（実測）。
 *   軸にしないと約1秒で、**画面に出る数字は1つも変わりません**（336人で確認済み）。
 *
 *   **通り数は「⑳を軸にしない通り数 × ⑳の候補数」の掛け算で出します。**
 *   ★候補数を16で固定しないこと。**方によって違います**（繰上げの選択肢が
 *     過去に落ちる方では16より少なくなります）。必ず `nenkinKaishiAges()` の数を使う。
 *
 * 【無料版が使わないもの】§5-3
 *   `koteki_nenkin`・`shunyu_by_age`・`sumi`・所得控除の各項目は、すべて既定（なし）のまま。
 *   画面2には、その前提を書きます（§5-3-2の4行）。
 */

import * as E from './engine';
import * as Z from './zeisei';
import { hantei, type Hantei } from './hantei';

/** 併給のときに一時金にする割合（%）の候補。指示書 §4-3 の呼び方と同じ */
const HEIKYU_WARIAI = [10, 20, 30, 40, 50, 60, 70, 80, 90];

/** 「なぜ差が出るのか」を**年ごと**に出すための1行（基準が2つの年に分かれる方がいるため） */
export type Nenbetsu = {
  year: number; age: number; gens: string[];
  shunyu: number; nensu: number; kojoAdj: number; genkaku: number;
  kasanariNen: number; hamidashi: number; kazei: number;
  /** §7-8 の規則3：この年の1文に出る額。**まとめて**万／円を決める */
  hitomatome: [number, number, number];
};

export type FreeResult = {
  // ---- 基準（あなたが選べる中で、いちばん早く両方を一時金で受け取る受け取り方）----
  saitanAge: number;      // iDeCo等を請求できる最も早い年齢（確定拠出年金法33条1項）
  taishokuAge: number;    // ⑤
  kijunAge: number;       // 基準でiDeCo等を受け取る年齢＝max(saitanAge, ⑤)
  kijunNen: number;
  onaji: boolean;         // 基準が同じ年か
  kijunLabel: string;
  /** "onaji" / "wakareru"。**文は基準HTMLと文案の側にあります**（勝手に変えないこと） */
  bunkiKijun: 'onaji' | 'wakareru';
  // ---- 画面2の表 ----
  uketori: number; gensen: number; tesuryo: number; modoru: number; tedori: number;
  // ---- 緑カード（画面2・画面5-6）／画面3の簡易比較 ----
  saidai: number; sa: number;
  bunkiSa: 'aru' | 'nashi';
  // ---- なぜ差が出るのか ----
  nenbetsu: Nenbetsu[];
  kinzokuNensu: number; kojo: number; hamidashi: number; kazei: number;
  hamidashiKei: number;
  bunkiHami: 'koeru' | 'osamaru';
  // ---- 通り数。**2つあります。1つの数に2つの意味を持たせません**（案③・2026-08-30）----
  /**
   * **有料版が数える数。**＝ `build()` が返した数 × ⑳の候補の数
   * 画面1の「最大41,216通り」と同じ数え方です。**画面2の139行には出しません**
   */
  toorisu: number;
  /**
   * **無料版が実際に数えた数。**＝ `build()` が返した数そのもの
   * 画面2の139行「◯通りの中に、これより手取りが多くなる受け取り方はありませんでした」に出します。
   * **無料版は⑳を軸にしていない**（E-17）ので、実際に見比べたのはこの数です
   */
  kazoeta: number;
  /** 判定（GA4の branch と、入力の整合の警告に使う） */
  hantei: Hantei;
  /** 前提に書く「受け取るのは今年（◯年）」 */
  genzaiNen: number;
  /** 画面4（退職所得控除の説明） */
  g4: Gamen4;
};

/**
 * 画面4に出す数字と**出し分け**（engine/gamen4.py の移植・§5-4／E-19）。
 * **実装側で式を持たせないこと。**ここが返した値を並べるだけにします。
 */
export type Gamen4 = {
  /** "A" ＝ 削られる控除がある／"B" ＝ 削られる控除が0円（無作為1,200人中178人＝15%） */
  jotai: 'A' | 'B';
  taishokuAge: number; idecoAge: number; aketa: number;
  honsoku: number;        // iDeCo等（加入◯年）の控除
  kasanariNen: number;    // 退職金と重なる期間（施行令70条3項の切捨て後）
  genkaku: number;        // 削られる控除
  sashihiki: number;      // 差し引き
  kojoAdj: number;        // あなたが使える控除（80万円の最低保障つき）
  kazei: number;          // 課税される退職所得
  zei: number;            // あなたが引かれる税金（源泉徴収）
  osamaru: boolean; minashiNensu: number;
  chijimeFrom: string; chijimeTo: string;
  kanyuFrom: string; kanyuTo: string;
  kanyuTsuki: number; kasanariTsuki: number; hamideruTsuki: number;
  /** 重なっている期間そのもの（「2006年4月〜2025年3月の228か月」の前半） */
  kasanariFrom: string; kasanariTo: string;
  /** 施行令70条2項の説明に出す「あなたの退職金◯円は、退職所得控除◯円に収まっています」 */
  taishokukin: number; taishokuKojo: number; kinzokuNensu: number; kanyuNensu: number;
  /** 空ければ削られなくなる年数。**状態Bでは null** */
  modoruNen: number | null;
  /** 「受け取る順番で、空ける年数が変わります」。**20年・10年を直に書かない** */
  junban: [string, number][];
};

/** 無料版の5項目（円・年・歳）から、画面2〜5-6に出す数字を出す */
export function freeResult(args: {
  taishokukin: number;    // ① 円
  kinzokuNensu: number;   // ② 年
  ideco: number;          // ③ 円
  kanyuNensu: number;     // ④ 年
  taishokuAge: number;    // ⑤ 歳
  genzaiNen: number;      // 受け取る年。**既定値を作らない**（§4-4-2）
}): FreeResult {
  const { taishokukin, kinzokuNensu, ideco, kanyuNensu, taishokuAge, genzaiNen } = args;

  // 「退職の年の3月まで、②年ぶん」で期間を組み立てる（入力とエンジンの対応表 §1）
  const owari = E.ym(genzaiNen, 3);
  const p = new E.Jinbutsu({
    seinen: genzaiNen - taishokuAge,
    umare: null,
    gens: [
      new E.Gen('退職金', Math.trunc(taishokukin), [owari - kinzokuNensu * 12 + 1, owari]),
      new E.Gen('iDeCo等', Math.trunc(ideco), [owari - kanyuNensu * 12 + 1, owari], true),
    ],
    // 以下はすべて既定（なし）のまま。**無料版は聞いていません**（§5-3）
    koteki_nenkin: 0,
    koteki_kaishi_age: 65,
  });
  const tai = p.gens[0], ide = p.gens[1];

  // --- 基準（§5-5・E-20）------------------------------------------------
  // iDeCo等は「最短で請求できる年齢」より前には受け取れません（確定拠出年金法33条1項）。
  // ⑤がそれより若い方（407人中200人＝49%）では、「同じ年にまとめて」はその方に**選べません**。
  // 【E-14】月で数える。kikanNensu()（所得税法の切り上げ）を渡さないこと
  const saitanAge = E.idecoSaitanAge(ide.kikan[1] - ide.kikan[0] + 1);
  const kijunAge = Math.max(saitanAge, taishokuAge);
  const kijunNen = genzaiNen + (kijunAge - taishokuAge);
  const onaji = kijunAge === taishokuAge;

  const kijun = new E.Plan({
    uketori_nen: { [tai.name]: genzaiNen, [ide.name]: kijunNen },
    label: onaji ? '同じ年にまとめて一時金'
                 : `一時金だけ（${tai.name}${taishokuAge}歳・${ide.name}${kijunAge}歳）`,
  });
  const sh = E.evaluate(p, kijun, true);     // 確定申告をした場合
  const gs = E.evaluate(p, kijun, false);    // 源泉徴収のまま

  // --- 手取りの最大と差 ---------------------------------------------------
  // 【§5-3-3・E-17】⑳を軸にしない。無料版は koteki_nenkin=0 なので⑳は手取りに効かず、
  //   同じ案が⑳の候補の数だけ並ぶだけ。軸にすると6倍おそいCPUで8,762ms／しなければ957ms。
  //
  // 【2026-08-29・オーナー判断（案2）。戦術Cowork `senjutsu_20260827o.md` §1・§2】
  //   ここには前まで `const nenkinAges = E.nenkinKaishiAges(p, genzaiNen);` がありました。
  //   **`build()` には渡さず、通り数の掛け算にだけ**使っていました。
  //   **利用者が選んでいない軸を、画面に出す数に掛けない** ── その1行を消しました。
  //   （ほかで使われていないことを当ててから消しています。`free.ts` の中で
  //     `nenkinAges` を読んでいたのは、184行の掛け算 1か所だけでした）
  /**
   * ★**`nenkinAges` を明示で渡します**（2026-08-30・①A）。
   *   `engine.ts` の `?? [p.koteki_kaishi_age]` を外したので、**渡さないと止まります。**
   *   **無料版は⑳を軸にしません**（E-17）。ですので `[p.koteki_kaishi_age]` の1通りです。
   *   **これは既定値ではありません。**「無料版は⑳を軸にしない」という決めを、ここに書いています。
   *   ★**②A（`nenkinKouho`）は使いません。**無料版は⑳を聞いていないためです
   */
  const R = E.build(p, ['退職金'], 'iDeCo等', genzaiNen, {
    heikyuWariai: HEIKYU_WARIAI,
    nenkinAges: [p.koteki_kaishi_age],
    genzaiNen,
  });
  // 【E-20】**一覧だけから取る。基準を初期値にしない。**
  //   基準が一覧に無い方では、選べない案の金額が「手取りの最大」として出ていました（20人・最大13,024円）。
  let saidai = -Infinity;
  for (const [, r] of R) if (r.tedori > saidai) saidai = r.tedori;
  const sa = saidai - sh.tedori;

  // --- なぜ差が出るのか（**年ごと**）--------------------------------------
  // 基準が2つの年に分かれる方では、枠も年ごとに分かれます。1年ぶんの表に押し込めません。
  const [taib, keika] = E.taishokuByYear(p, kijun);
  const nenbetsu: Nenbetsu[] = keika.map((k) => {
    const hamidashi = Math.max(0, k.shunyu - k.kojo_adj);
    return {
      year: k.year, age: taishokuAge + (k.year - genzaiNen), gens: [...k.gens],
      shunyu: k.shunyu, nensu: k.nensu, kojoAdj: k.kojo_adj, genkaku: k.genkaku,
      kasanariNen: k.kasanari_nen, hamidashi, kazei: taib[k.year] ?? 0,
      hitomatome: [k.kojo_adj, k.shunyu, hamidashi],
    };
  });
  const kt = nenbetsu.find((x) => x.year === genzaiNen);
  const hamidashiKei = nenbetsu.reduce((a, x) => a + x.hamidashi, 0);

  /**
   * ★**通り数を2つに分けます**（オーナー判断・案③。戦術Cowork `senjutsu_20260830h.md` §1）
   *
   *   2026-08-29 の案2では、`toorisu = R.length` の1つだけにしていました。
   *   **1つの数に、2つの意味を持たせていました。**案③で分けます。
   *
   *   ★**名前を取り違えると、また混ざります。**ですので、両方に1行ずつ書いています。
   */
  /**
   * **有料版が数える数**（＝画面1の「最大41,216通り」と同じ数え方）
   *
   *   `build()` が返した数 × ⑳の候補の数。**無料版は実際にはここまで数えていません。**
   *   無料版は⑳を軸にしない（E-17）ので、⑳の候補の数だけ**同じ案が並ぶ**だけだからです。
   *   ★**16で固定しないこと。**方によって候補数が違います（この頭のコメントのとおり）
   *   ★**無料版では②A（`nenkinKouho`）を使いません。**⑳を聞いていないためです。
   *     `nenkinKaishiAges()` をそのまま使います
   */
  const nenkinAges = E.nenkinKaishiAges(p, genzaiNen);
  const toorisu = R.length * nenkinAges.length;
  /**
   * **無料版が実際に数えた数**（＝ `build()` が返した数そのもの）
   *
   *   画面2の139行に出すのは、こちらです。**実際に見比べた数**だからです。
   *   ★**掛けない・足さない・別に数え直さない**（オーナー判断・2026-08-29）。
   *     この決めは、**`kazoeta` のほうに生きています**
   */
  const kazoeta = R.length;

  const kekka: FreeResult = {
    saitanAge, taishokuAge, kijunAge, kijunNen, onaji, kijunLabel: kijun.label,
    bunkiKijun: onaji ? 'onaji' : 'wakareru',
    uketori: sh.uketori, gensen: gs.zei, tesuryo: sh.tesuryo,
    modoru: gs.zei - sh.zei, tedori: sh.tedori,
    saidai, sa,
    bunkiSa: sa > 0 ? 'aru' : 'nashi',
    nenbetsu,
    kinzokuNensu: kt ? kt.nensu : 0,
    kojo: kt ? kt.kojoAdj : 0,
    hamidashi: kt ? kt.hamidashi : 0,
    kazei: kt ? kt.kazei : 0,
    hamidashiKei,
    bunkiHami: hamidashiKei > 0 ? 'koeru' : 'osamaru',
    // ★16で固定しないこと。方によって候補数が違います（§5-3-3）
    toorisu,
    kazoeta,
    hantei: hantei(taishokukin, kinzokuNensu, ideco, kanyuNensu, taishokuAge, genzaiNen),
    genzaiNen,
    g4: gamen4(p, genzaiNen, taishokuAge),
  };

  /**
   * **番人D（出口）**（戦術Cowork `senjutsu_20260827o.md` §3-4）
   *
   *   > **画面に出す通り数 ＝ `build()` が返した数**でなければ、止める
   *
   * **画面に出る前に止めます。**掛け算に戻した日も、別に数え直した日も、ここで落ちます。
   * **この番人を守る当ては、作りません**（同 §3-4「1段だけです」）。
   */
  /**
   * ★**番人D-1**（2026-08-30・案③。戦術Cowork `senjutsu_20260830h.md` §2）
   *   **無料版が実際に数えた数 ＝ `build()` が返した数**
   *   案2の番人Dは `toorisu` に当てていました。掛け算に戻したので、**そのままだと必ず落ちます。**
   *   ですので、**`kazoeta` のほうに当て直します**（意味が変わっていません）。
   */
  if (kekka.kazoeta !== R.length) {
    throw new Error(`無料版が数えた数（${kekka.kazoeta}）が、build() が返した数（${R.length}）と違います。`
      + '画面2に出す数は、build() が返した配列の長さと必ず同じにしてください。'
      + '掛けない・足さない・別に数え直さない（オーナー判断・2026-08-29）。');
  }
  /**
   * ★**番人D-2**（同上）
   *   **有料版が数える数 ＝ `build()` が返した数 × ⑳の候補の数**
   *   ★候補の数を **16 で固定した日**に、ここで落ちます。方によって違うためです。
   */
  const kouhoKazu = E.nenkinKaishiAges(p, genzaiNen).length;
  if (kekka.toorisu !== R.length * kouhoKazu) {
    throw new Error(`有料版が数える数（${kekka.toorisu}）が、`
      + `build() が返した数 × ⑳の候補の数（${R.length} × ${kouhoKazu} = ${R.length * kouhoKazu}）`
      + 'と違います。候補の数を16で固定していないか、確かめてください'
      + '（方によって候補数が違います・§5-3-3）。');
  }
  return kekka;
}

/**
 * 画面4：「退職金を⑤の年、iDeCo等をその翌年に一時金で受け取ると、控除はほとんど戻らない」
 * を、その方の数字で出します。**別式を持たせず、エンジンの計算過程から取ります。**
 */
/** 【上限】「何年空ければ削られなくなるか」を探す上限（実測では常に20年） */
const SAGASU_MADE = 40;

/** 通し月数を「1988年4月」の形にする。**12月を「0月」と書かないこと** */
function ymLabel2(m: number): string {
  return `${Math.floor((m - 1) / 12)}年${((m - 1) % 12) + 1}月`;
}

function gamen4(p: E.Jinbutsu, genzaiNen: number, taishokuAge: number): Gamen4 {
  const tai = p.gens[0], ide = p.gens[1];
  const y2 = genzaiNen + 1;

  /** iDeCo等を d 年あとに受け取ったときの、その年の計算過程 */
  const hiku = (d: number): [number, E.KeikaRow | undefined] => {
    const [t, keika] = E.taishokuByYear(p, new E.Plan({
      uketori_nen: { [tai.name]: genzaiNen, [ide.name]: genzaiNen + d },
    }));
    return [t[genzaiNen + d] ?? 0, keika.find((r) => r.year === genzaiNen + d)];
  };

  const [kazei, k] = hiku(1);
  const honsoku = Z.taishokuKojoHonsoku(E.kikanNensu(ide.kikan[0], ide.kikan[1]));
  const genkaku = k ? k.genkaku : 0;
  const kojoAdj = k ? k.kojo_adj : 0;
  // 【E-19】重なる期間を `genkaku / 400,000` で逆算しない。20年超は1年70万円なので壊れる。
  //   エンジンが持っている重複年数（施行令70条3項の切捨て後）をそのまま使う。
  const kasanariNen = k ? k.kasanari_nen : 0;

  // 施行令70条2項：前に受け取った額が退職所得控除額に満たないとき、
  //   重なりを数える期間を「就職の日から みなし勤続年数」に縮める
  const minashi = Z.minashiNensu(tai.shunyu);
  const osamaru = tai.shunyu < Z.taishokuKojoHonsoku(E.kikanNensu(tai.kikan[0], tai.kikan[1]));
  const shukuFrom = tai.kikan[0];
  const shukuTo = osamaru ? tai.kikan[0] + minashi * 12 - 1 : tai.kikan[1];
  const kasanariTsuki = Math.max(0,
    Math.min(shukuTo, ide.kikan[1]) - Math.max(shukuFrom, ide.kikan[0]) + 1);
  const kanyuTsuki = ide.kikan[1] - ide.kikan[0] + 1;

  // 【E-19】「何年空ければ控除が満額に戻るか」を**課税退職所得が0になる年**で探さない。
  //   ③の残高が④から決まる枠を超える方は0にならず（無作為300人中224人＝75%）、
  //   「−1年空けても」「0年空けたとき」と出ていた。**削られる控除が0になる年**で探す。
  let modoruNen: number | null = null;
  if (genkaku > 0) {
    for (let d = 2; d <= SAGASU_MADE; d++) {
      const [, kd] = hiku(d);
      if ((kd ? kd.genkaku : 0) === 0) { modoruNen = d; break; }
    }
  }

  return {
    jotai: genkaku > 0 ? 'A' : 'B',
    taishokuAge, idecoAge: taishokuAge + 1, aketa: 1,
    honsoku, kasanariNen, genkaku, sashihiki: honsoku - genkaku, kojoAdj, kazei,
    zei: E.nenkanZei(p, y2, 0, kazei, false) - E.nenkanZei(p, y2, 0, 0, false),
    osamaru, minashiNensu: minashi,
    chijimeFrom: ymLabel2(shukuFrom), chijimeTo: ymLabel2(shukuTo),
    kanyuFrom: ymLabel2(ide.kikan[0]), kanyuTo: ymLabel2(ide.kikan[1]),
    kanyuTsuki, kasanariTsuki, hamideruTsuki: kanyuTsuki - kasanariTsuki,
    kasanariFrom: ymLabel2(Math.max(shukuFrom, ide.kikan[0])),
    kasanariTo: ymLabel2(Math.min(shukuTo, ide.kikan[1])),
    taishokukin: tai.shunyu,
    taishokuKojo: Z.taishokuKojoHonsoku(E.kikanNensu(tai.kikan[0], tai.kikan[1])),
    kinzokuNensu: E.kikanNensu(tai.kikan[0], tai.kikan[1]),
    kanyuNensu: E.kikanNensu(ide.kikan[0], ide.kikan[1]),
    modoruNen,
    // **実装側で 20年・10年 と直に書かない。**施行令70条1項の窓＋1年（窓は zeisei.ts）
    junban: [['退職金が先 → iDeCo等が後', Z.MADO_DC_ATO + 1],
             ['iDeCo等が先 → 退職金が後', Z.MADO_DC_SAKI + 1]],
  };
}
