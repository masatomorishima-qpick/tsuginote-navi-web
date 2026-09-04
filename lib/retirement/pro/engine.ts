/** engine.ts ── hikiwatashi/engine/engine.py の移植（Q17 速度実測用）
 *  build() が全通り、evaluate() が1通り。条文の根拠は Python 版のコメントを参照。 */
import * as Z from './zeisei';
import { fdiv } from './zeisei';
type Umare = [number, number] | null;

export const REIWA_OFFSET = 2018;
export const KYUFU_JIMU_TESURYO = 440;   // 給付事務手数料（1回の振込につき）
export const KOZA_KANRI_TSUKI = 66;      // 運用指図者の口座管理手数料（月額）
export const KAISEI_10NEN = 2026;        // 10年ルールの施行（令和8年1月1日）

/** 年月を通し月数に変換。★月に既定値を作りません（2026-09-02・senjutsu_20260902ag.md 2番。engine.py 24行と同じ） */
export function ym(year: number, month: number): number { return year * 12 + month; }
/**
 * 通し月数を「1988年4月」の形にする。`ym()` の逆。**12月を「0月」と書かないこと**
 *
 * 【2026-08-20】`engine.py` の `ym_label()` の写しです。
 *   もとは `gamen4.py` の中だけにありました。**画面13も同じ表記を使うので、
 *   エンジン側に移されました。**画面ごとに書き写すと、片方だけ直る形になります。
 */
export function ymLabel(m: number): string {
  return `${fdiv(m - 1, 12)}年${((m - 1) % 12) + 1}月`;
}
/** 期間(a, b)の月数。両端を含む */
export function kikanTsuki(a: number, b: number): number { return Math.max(0, b - a + 1); }
/** 期間の年数。1年未満は1年に切り上げ（施行令69条1項） */
export function kikanNensu(a: number, b: number): number {
  const m = kikanTsuki(a, b);
  return m > 0 ? Math.ceil(m / 12) : 0;
}
/** 複数の期間を合算し、重複を除いた期間の年数（施行令69条1項2号） */
export function gassanNensu(kikans: [number, number][]): number {
  if (!kikans.length) return 0;
  const xs = [...kikans].sort((p, q) => p[0] - q[0] || p[1] - q[1]);
  const merged: [number, number][] = [[xs[0][0], xs[0][1]]];
  for (const [s, e] of xs.slice(1)) {
    const last = merged[merged.length - 1];
    if (s <= last[1] + 1) last[1] = Math.max(last[1], e);
    else merged.push([s, e]);
  }
  return Math.ceil(merged.reduce((a, [s, e]) => a + kikanTsuki(s, e), 0) / 12);
}

/**
 * **退職手当等の額の単位。**（2026-08-27・戦術Cowork `senjutsu_20260826j.md` §3）
 *
 * **法令の額ではありません。****入力の単位の決めです。**
 *   ① 退職金 ／ ③ iDeCo等 ／ ⑨ 企業年金 ／ ⑲ すでに受け取った退職手当等 ／ ㉓ 役員退職慰労金
 *   の5つを、**全部「万円（整数）」で入れる**と決めました。ですので円では10,000の倍数になります。
 *
 * **なぜ要るか。**退職所得控除は40万・70万・20万・14万・13万／最低保障80万で、
 * どれも1万円の倍数です。**受け取る額も1万円の倍数なら、「倍にした額」が必ず偶数**になり、
 * `han = fdiv(sBai + iBai, 2)` が割り切れます。
 * すると **区分ごとの「その2分の1」が、はみ出した額のちょうど半分**になります。
 * 倍数でない額が入ると、**短期の行は切り捨て、一般の行は切り上げ**になり、
 * **同じ画面の中で丸めの向きが変わります**（`kensa/man_no_baisu.mts` ／ `man_no_baisu_wazato.mts`）。
 */
export const TAISHOKU_TANI = 10_000;

export class Gen {
  name: string; shunyu: number; kikan: [number, number];
  dc: boolean; kanyu_wakaranai: boolean; yakuin: boolean; shogai: boolean;
  constructor(name: string, shunyu: number, kikan: [number, number],
              dc = false, kanyu_wakaranai = false, yakuin = false, shogai = false) {
    /**
     * **番人A（入口）。**（2026-08-27・戦術Cowork `senjutsu_20260827b.md` §3）
     *
     * `gens` も `sumi` も、必ずここを通ります。
     * **公的年金の額・収入・生活費は `Gen` を通りません**ので、巻き込みません。
     *
     * **「入力が万円だから大丈夫」に寄りかからないための番人です。**
     * 画面側で万円の欄に小数を打てないようにしても、
     * **画面を作り直した日や、別の入り口ができた日には効きません。**
     */
    if (!Number.isInteger(shunyu)) {
      throw new Error(`${name} の額が整数ではありません（${shunyu}）。`);
    }
    if (shunyu % TAISHOKU_TANI !== 0) {
      throw new Error(`${name} の額が${TAISHOKU_TANI.toLocaleString('en-US')}円の倍数ではありません`
        + `（${shunyu.toLocaleString('en-US')}円）。退職手当等の額は万円単位で入れてください。`);
    }
    this.name = name; this.shunyu = shunyu; this.kikan = kikan;
    this.dc = dc; this.kanyu_wakaranai = kanyu_wakaranai;
    this.yakuin = yakuin; this.shogai = shogai;
  }
}

export interface JinbutsuInit {
  seinen: number; umare?: Umare; gens?: Gen[];
  koteki_nenkin?: number; koteki_kaishi_age?: number;
  shunyu_by_age?: Record<number, number>; ideco_gen?: string;
  shakai_hoken?: number; fuyou_nin?: number; seimei_hoken?: number; kyuchi?: number;
  shishutsu?: Record<number, number>; kosei_nenkin?: number;
  haigusha_seinen?: number | null; ko_nin?: number; kosei_20nen?: boolean;
  sumi?: [Gen, number][]; jinteki?: Z.Jinteki;
}

export class Jinbutsu {
  seinen: number; umare: Umare = null; gens: Gen[] = [];
  koteki_nenkin = 0; koteki_kaishi_age = 65;
  shunyu_by_age: Record<number, number> = {}; ideco_gen = 'iDeCo等';
  shakai_hoken = 0; fuyou_nin = 0; seimei_hoken = 0; kyuchi = 1;
  shishutsu: Record<number, number> = {}; kosei_nenkin = 0;
  haigusha_seinen: number | null = null; ko_nin = 0; kosei_20nen = false;
  sumi: [Gen, number][] = []; jinteki: Z.Jinteki = new Z.Jinteki();
  constructor(init: JinbutsuInit) {
    this.seinen = init.seinen;
    Object.assign(this, init);
    /**
     * 【2026-09-03・A-2a4】★お子さんの加給年金は、人数だけでは正しく出せないので**道を塞ぎます**。
     *
     * `kakyuNenkin()` は `ko_nin` を**人数として足すだけ**で、**打ち切りの条件が1つもありません**。
     * 実物では「いちばん下のお子さんが**18歳になった年度の3月31日**」（障害があるときは20歳）で終わります。
     * 人数だけを受け取る形のままにすると、欄を作った日に静かに穴が開きます
     * （1968年生・⑳65・お子さん1人で **26年・6,196,583円** 乗り続ける・`kaihatsu_20260903m.md` 3番）。
     *
     * ★お子さんの欄を作るときは、`ko_nin`（人数）ではなく**生まれた年月**を受け取る形に変えてください。
     */
    if (Math.trunc(this.ko_nin) !== 0) {
      throw new Error(
        'お子さんの加給年金は、お子さんの生まれた年月を受け取る形に作り直すまで使えません'
        + `（ko_nin は 0 のみ。渡された値：${this.ko_nin}）。`
        + '人数だけでは「18歳になった年度の末日で終わる」を出せません（A-2a4・2026-09-03）');
    }
  }

  /** 支給源だけを差し替えた複製（dataclasses.replace 相当） */
  withKotekiKaishiAge(age: number): Jinbutsu {
    const q = Object.create(Jinbutsu.prototype) as Jinbutsu;
    Object.assign(q, this);
    q.koteki_kaishi_age = age;
    return q;
  }

  kojoShotokuzei(goukei = 0): number {
    return this.shakai_hoken + 380_000 * this.fuyou_nin + this.seimei_hoken
      + this.jinteki.shotokuzei(goukei);
  }
  kojoJumin(goukei = 0): number {
    return this.shakai_hoken + 330_000 * this.fuyou_nin
      + Math.min(70_000, this.seimei_hoken) + this.jinteki.jumin(goukei);
  }
  fuyouKei(): number { return this.fuyou_nin + this.jinteki.nin(); }

  /** その年の12月31日現在の年齢。1月1日生まれは12月31日に1つ増える */
  nenrei1231(year: number): number {
    let a = year - this.seinen;
    if (this.umare !== null && Math.trunc(this.umare[0]) === 1 && Math.trunc(this.umare[1]) === 1) a += 1;
    return a;
  }

  /** その年齢に達する日の属する月（通し月数）。達した日は誕生日の前日 */
  tassuruTsuki(age: number): number | null {
    if (this.umare === null) return null;
    const m = Math.trunc(this.umare[0]), d = Math.trunc(this.umare[1]);
    const y = this.seinen + Math.trunc(age);
    if (d > 1) return ym(y, m);
    if (m > 1) return ym(y, m - 1);
    return ym(y - 1, 12);
  }

  /** その年に支払を受ける公的年金の月数（B-21） */
  nenkinShiharaiTsukisu(year: number): number {
    return this.tsukisuKara(this.koteki_kaishi_age, year);
  }

  /**
   * その年齢に達した月の**翌月分**から数えて、その年に支払を受ける月数（0〜12）。
   *
   * 【2026-09-03・A-2a4】`nenkinShiharaiTsukisu()` の中身をここに出しました。
   *   ★加給年金の「65歳の門」が**同じ数え方**を使うためです。★式を2か所に書きません。
   */
  tsukisuKara(age: number, year: number): number {
    const t = this.tassuruTsuki(age);
    if (t === null) return year >= this.year(age) ? 12 : 0;
    const kaishi = t + 1;
    const lo = ym(year - 1, 12), hi = ym(year, 11);
    return Math.max(0, Math.min(12, hi - Math.max(lo, kaishi) + 1));
  }

  kotekiGaku(): number {
    return Z.nenkinGaku(this.koteki_nenkin, this.koteki_kaishi_age, this.seinen, this.umare);
  }

  /** その年に実際に受け取る公的年金の額（繰上げ減額・繰下げ増額・在職支給停止・加給年金） */
  kotekiByYear(year: number): number {
    const age = year - this.seinen;
    const tsuki = this.nenkinShiharaiTsukisu(year);
    if (tsuki <= 0) return 0;
    const ritsu = Z.nenkinRitsu(this.koteki_kaishi_age, this.seinen, this.umare);
    const koseiKijun = this.kosei_nenkin;
    const kisoKijun = Math.max(0, this.koteki_nenkin - koseiKijun);

    // 繰下げ待機中に在職支給停止されていたはずの割合は増額の対象外
    const machi: number[] = [];
    for (let y = this.year(65); y < this.year(this.koteki_kaishi_age); y++) machi.push(y);
    let zougakuTaisho: number;
    if (machi.length && koseiKijun > 0) {
      let teishiKei = 0;
      for (const y of machi) teishiKei += Z.zaishokuTeishi(koseiKijun, this.shunyu_by_age[y - this.seinen] ?? 0);
      zougakuTaisho = fdiv(Math.max(0, koseiKijun * machi.length - teishiKei), machi.length);
    } else zougakuTaisho = koseiKijun;
    let kosei = fdiv(zougakuTaisho * ritsu, 10_000) + (koseiKijun - zougakuTaisho);
    const kiso = fdiv(kisoKijun * ritsu, 10_000);
    /**
     * 【2026-09-03・A-2a4】**全額支給停止の年は、報酬比例を 0 にします。**
     *   ★式の丸めで 0〜11円（`kosei % 12`）が残りますが、制度の「全額支給停止」は 0 円です。
     *   ★★**基礎年金（`kiso`）は止めません。**在職老齢年金で止まるのは**報酬比例部分だけ**です。
     */
    const kyuyo = this.shunyu_by_age[age] ?? 0;
    const zenTeishi = Z.zaishokuZengakuTeishi(kosei, kyuyo);
    kosei = zenTeishi ? 0 : Math.max(0, kosei - Z.zaishokuTeishi(kosei, kyuyo));

    /**
     * 加給年金。【2026-09-03・A-2a4】足したもの2つ
     *   ・★**65歳に達した月の翌月分から**（それより前の月には乗せません）。下の `kakyuTsuki`
     *     日本年金機構「加給年金額と振替加算」…「**65歳到達時点**（または定額部分支給開始年齢に
     *     到達した時点）で、その方に生計を維持されている配偶者または子がいるときに加算されます」
     *     ★⑥の下限は1951年で、その方たちに定額部分はありませんので、門は「65歳」だけで足ります。
     *   ・★**報酬比例が全額支給停止の年は出しません**（上の `zenTeishi`）。
     *     「年金支給月額がマイナスになる場合は、老齢厚生年金（**加給年金額を含む**）は全額支給停止」
     */
    let kakyu = 0;
    if (this.kosei_20nen && !zenTeishi) {
      const h = this.haigusha_seinen;
      const haigu = (h !== null && (year - h) < 65) ? h : null;
      kakyu = Z.kakyuNenkin(this.seinen, haigu, this.ko_nin);
    }
    // ★加給年金だけは「65歳から」の月数で数えます（`tsuki` と同じ数え方・`tsukisuKara`）
    const kakyuTsuki = Math.min(tsuki, this.tsukisuKara(65, year));
    // ★丸めは1回。★⑳≧65 のとき `kakyuTsuki === tsuki` になり、元の式と1円も違いません
    return fdiv((kosei + kiso) * tsuki + kakyu * kakyuTsuki, 12);
  }

  age(year: number): number { return year - this.seinen; }
  year(age: number): number { return this.seinen + age; }
  nenbun(year: number): number { return year - REIWA_OFFSET; }
}

export class Plan {
  uketori_nen: Record<string, number> = {};
  nenkin_gen: string | null = null;
  nenkin_kaishi_nen: number | null = null;
  nenkin_kikan = 0; nenkin_kaisu = 1; ichiji_wariai = 0;
  nenkin_kaishi_age: number | null = null;
  label = '';
  constructor(init: Partial<Plan> = {}) { Object.assign(this, init); }
}

// ---------------------------------------------------------------- 退職所得の計算
const monthsOf = (xs: [Gen, number][]): Set<number> => {
  const t = new Set<number>();
  for (const [g] of xs) for (let m = g.kikan[0]; m <= g.kikan[1]; m++) t.add(m);
  return t;
};
const inter = (a: Set<number>, b: Set<number>): Set<number> => {
  const o = new Set<number>(); for (const v of a) if (b.has(v)) o.add(v); return o;
};
const union = (a: Set<number>, b: Set<number>): Set<number> => {
  const o = new Set<number>(a); for (const v of b) o.add(v); return o;
};
const minus = (a: Set<number>, b: Set<number>): Set<number> => {
  const o = new Set<number>(); for (const v of a) if (!b.has(v)) o.add(v); return o;
};
const nenOfSet = (x: Set<number>): number => x.size ? Math.ceil(x.size / 12) : 0;

/** その年の1つの区分ぶん。**画面11の「はみ出した額」はここから出します** */
export interface KubunUchiwake {
  kubun: 'tokutei' | 'tanki' | 'ippan';
  /** その区分で受け取る額 */
  shunyu: number;
  /** その区分に割り振られた退職所得控除（施行令71条の2） */
  kojo: number;
  /** **はみ出した額** ＝ max(0, shunyu − kojo)。**マイナスにしません** */
  hamidashi: number;
  /**
   * 【2026-08-27・戦術Cowork `senjutsu_20260826i.md` §4・`senjutsu_20260827b.md` §0-2】
   * **その区分の退職所得。****画面はこれをそのまま出します。画面で2で割りません。**
   *
   * 組み立ては `v5/engine.py` 384・393行と同じです。
   *   特定役員 … `tShotoku`
   *   短期　　 … `fdiv(sBai, 2)`
   *   一般　　 … `han − fdiv(sBai, 2)`  ← **「一般の倍 ÷ 2」ではありません。`han` から引いた残りです**
   *
   * ですので **3つの和は `KeikaRow.shotoku` と必ず一致します**（下の番人Bで止めています）。
   * **1円の端数は、一般の側に乗ります。**
   *
   * **画面で `hamidashi ÷ 2` を計算しないでください。**
   * 短期と一般の「倍にした額」が両方とも奇数のとき、この値と1円ずれます
   * （入力を1万円の倍数にしているかぎり起きません。`kensa/man_no_baisu.mts`）。
   */
  shotoku: number;
  /**
   * **短期で300万円を超えたときだけ**入ります。300万円までの分（＝`Z.TANKI_KIJUN`）。
   * 画面の「うち300万円までの分」の行に、そのまま出します。
   */
  tanki_kijun?: number;
  /**
   * **短期で300万円を超えたときだけ**入ります。300万円までの分の**2分の1**。
   * 画面の「その2分の1」の行に、そのまま出します。**画面で割りません。**
   */
  tanki_kijun_bun?: number;
  /**
   * **短期で300万円を超えたときだけ**入ります。300万円を**超える**分（2分の1にしません）。
   * `tanki_kijun_bun + tanki_koeta_bun === shotoku` です。
   */
  tanki_koeta_bun?: number;
}

/** 区分の内訳。**null にしません。**区分が1つの年も1件だけ入ります */
export interface KubunMeisai {
  /** 短期退職手当等が300万円の基準を超えたか（所得税法30条5項） */
  koeta: boolean;
  /** その年に出た区分。**必ず1つ以上**入ります */
  kubun_ari: ('tokutei' | 'tanki' | 'ippan')[];
  /** 区分ごとの内訳。`kubun_ari` と同じ順です */
  uchiwake: KubunUchiwake[];
  /** `uchiwake` の `hamidashi` の**和**。**`shunyu − kojo_adj` ではありません** */
  hamidashi: number;
}

/** その年の退職所得の金額。特定役員・短期・一般の3区分に分ける */
export function taishokuShotokuKubun(gs: [Gen, number][],
                                     kojoAdj: number): [number, KubunMeisai] {
  /**
   * 【2026-08-26・戦術Coworkのご指摘】**支給源が1つも無いときは、止めます。**
   *   前は `kubun_ari: ['ippan']` を返していました。
   *   **「一般の区分があった」と、事実でないことを返していました。**
   *   `golden_light` の1,000人（のべ1,463行）では**0行**ですので、いまは起きません。
   *   ですが「起きないから既定値で返す」は、**既定値を作らない**に反します。
   *   `kubun_ari` の説明に「必ず1つ以上」と書いた以上、そこを守る形にします。
   */
  if (gs.length === 0) {
    throw new Error('その年に受け取る退職手当等が1つもありません。'
      + '区分（特定役員・短期・一般）を決められません。');
  }
  const nensu = (g: Gen) => kikanNensu(g.kikan[0], g.kikan[1]);
  const tokutei = gs.filter(([g]) => g.yakuin && nensu(g) <= Z.TOKUTEI_HANTEI_NENSU);
  const nokori = gs.filter(([g]) => !(g.yakuin && nensu(g) <= Z.TOKUTEI_HANTEI_NENSU));
  const tanki = nokori.filter(([g]) => nensu(g) <= Z.TANKI_HANTEI_NENSU);
  const ippan = nokori.filter(([g]) => nensu(g) > Z.TANKI_HANTEI_NENSU);
  const shunyuKei = gs.reduce((a, [, s]) => a + s, 0);
  if (!tokutei.length && !tanki.length) {
    /** 一般だけの年。**それでも内訳を返します**（画面11の「はみ出した額」に要ります） */
    const hami = Math.max(0, shunyuKei - kojoAdj);
    /** **区分が1つですので、その区分の退職所得 ＝ その年の退職所得です** */
    const sho = Z.taishokuShotoku(shunyuKei, kojoAdj);
    return [sho, {
      koeta: false, kubun_ari: ['ippan'],
      uchiwake: [{ kubun: 'ippan', shunyu: shunyuKei, kojo: kojoAdj,
                   hamidashi: hami, shotoku: sho }],
      hamidashi: hami,
    }];
  }

  const T = monthsOf(tokutei), S = monthsOf(tanki), I = monthsOf(ippan);
  const zen = inter(inter(T, S), I);
  const tBubun = minus(union(inter(T, S), inter(T, I)), zen);
  const sBubun = minus(union(inter(S, T), inter(S, I)), zen);

  let tKojo = T.size ? Z.tokuteiKojo(nenOfSet(T), nenOfSet(tBubun), nenOfSet(zen)) : 0;
  let sKojo = S.size ? Z.tankiKojo3(nenOfSet(S), nenOfSet(sBubun), nenOfSet(zen)) : 0;
  tKojo = Math.min(tKojo, kojoAdj);
  sKojo = Math.min(sKojo, kojoAdj - tKojo);
  let iKojo = kojoAdj - tKojo - sKojo;
  // 【E-18の修正・2026-08-17】**その年の区分が1つだけのときは、割り振りをしない。**
  //   施行令71条の2の割り振りは、法30条**5項**（同じ年に区分が2つ以上ある場合）の
  //   計算に使うもの。その年に短期退職手当等しかなければ、当てはまるのは法30条**4項**で、
  //   そこでいう「退職所得控除額」は**その年の退職所得控除額そのもの**
  //   （30条6項2号の80万円の最低保障を含む）。
  //   直す前は、区分が1つでも算式（40万円×年数）で割り振っていたため、
  //   **加入年数が1年の方で80万円の最低保障が消えていた。**
  //   例：加入1年・iDeCo等50万円 → 直す前 50,000円／直したあと 0円。
  if ([tokutei, tanki, ippan].filter((x) => x.length).length === 1) {
    tKojo = tokutei.length ? kojoAdj : 0;
    sKojo = tanki.length ? kojoAdj : 0;
    iKojo = ippan.length ? kojoAdj : 0;
  }

  const tShunyu = tokutei.reduce((a, [, s]) => a + s, 0);
  const sShunyu = tanki.reduce((a, [, s]) => a + s, 0);
  const iShunyu = ippan.reduce((a, [, s]) => a + s, 0);

  const tShotoku = Z.taishokuShotokuTokutei(tShunyu, tKojo);
  const sZan = sShunyu - sKojo;
  let sBai = 0;
  if (sZan > 0) sBai = sZan <= Z.TANKI_KIJUN ? sZan
    : 2 * (fdiv(Z.TANKI_KIJUN, 2) + sZan - Z.TANKI_KIJUN);
  const iBai = Math.max(0, iShunyu - iKojo);
  const han = fdiv(sBai + iBai, 2);
  const shotoku = tShotoku + han;
  /**
   * **区分ごとの「はみ出した額」。**
   * `shunyu − kojo_adj` を1つ出すのは誤りです（戦術Cowork 2026-08-26・実測65人でずれます）。
   * **区分ごとに `max(0, 収入 − 控除)` を出して、和をとります。**
   */
  /**
   * **区分ごとの退職所得**（`v5/engine.py` 384・393行と同じ組み立て）。
   * `iShotoku` は「一般の倍 ÷ 2」ではありません。**`han` から短期ぶんを引いた残り**です。
   * ですので3つの和は `shotoku` と**定義上必ず一致します**（下の番人B）。
   * **1円の端数は、一般の側に乗ります。**
   */
  const sShotoku = fdiv(sBai, 2);
  const iShotoku = han - sShotoku;
  /** **式を変えていません。**前と1文字も同じ判定です（変数に取り出しただけ） */
  const koeta = Math.max(0, sShunyu - sKojo) > Z.TANKI_KIJUN;
  const uchiwake: KubunUchiwake[] = [];
  if (tokutei.length) uchiwake.push({ kubun: 'tokutei', shunyu: tShunyu, kojo: tKojo,
                                      hamidashi: Math.max(0, tShunyu - tKojo),
                                      shotoku: tShotoku });
  if (tanki.length) uchiwake.push({ kubun: 'tanki', shunyu: sShunyu, kojo: sKojo,
                                    hamidashi: Math.max(0, sShunyu - sKojo),
                                    shotoku: sShotoku,
                                    ...(koeta ? { tanki_kijun: Z.TANKI_KIJUN,
                                                  tanki_kijun_bun: fdiv(Z.TANKI_KIJUN, 2),
                                                  tanki_koeta_bun: sZan - Z.TANKI_KIJUN }
                                              : {}) });
  if (ippan.length) uchiwake.push({ kubun: 'ippan', shunyu: iShunyu, kojo: iKojo,
                                    hamidashi: Math.max(0, iShunyu - iKojo),
                                    shotoku: iShotoku });
  /**
   * **番人B**（2026-08-27・戦術Cowork `senjutsu_20260826j.md` §2「置いてください」）。
   * 区分ごとの退職所得の和が、その年の退職所得と合わなければ**止めます**。
   * いまの組み立てでは定義上ここは通ります。
   * **通るはずのところに番人を置くのは、組み立てを変えた日のためです。**
   */
  const wa = uchiwake.reduce((a, u) => a + u.shotoku, 0);
  if (wa !== shotoku) {
    throw new Error('区分ごとの退職所得の和が、その年の退職所得と合いません。'
      + `（和 ${wa} ／ その年 ${shotoku}）`);
  }
  /**
   * **一般の区分がない年に、一般の退職所得が残っていたら止めます。**
   * 残ると、**画面に出す先のない額**になります。
   */
  if (!ippan.length && iShotoku !== 0) {
    throw new Error(`一般の区分がないのに、一般の退職所得が ${iShotoku}円 あります。`);
  }
  const meisai: KubunMeisai = {
    koeta,
    kubun_ari: uchiwake.map((u) => u.kubun),
    uchiwake,
    hamidashi: uchiwake.reduce((a, u) => a + u.hamidashi, 0),
  };
  return [shotoku, meisai];
}

export interface KeikaRow {
  year: number; gens: string[]; shunyu: number; nensu: number;
  kojo: number; genkaku: number; kojo_adj: number; shotoku: number;
  /**
   * 【2026-08-26・画面11】**区分ごとの内訳。**画面に式を持たせないためのものです。
   * **`shunyu − kojo_adj` を画面で計算しないでください。**65人（6.5%）で退職所得と合いません。
   */
  kubun_meisai: KubunMeisai;
  /** **はみ出した額**（区分ごとの和）。`kubun_meisai.hamidashi` と同じ値です */
  hamidashi: number;
  /** 施行令70条3項の重複年数（1年未満切捨て後）。**genkaku から逆算しないこと**（20年超は1年70万円） */
  kasanari_nen: number;
  /**
   * 施行令70条2項で**縮めた年数**。縮めていない方は `null`。
   * **0にしません。**存在しないものを0と書くと、画面が「0年に縮めた」と読めます
   * （判断ログ 7-2 の1番。`kasanari_from` を重なり0のとき `None` にしたのと同じ形）。
   */
  minashi_nensu: number | null;
  /**
   * 縮めた期間 `[from, to]`。**通し月数のまま**返します。縮めていない方は `null`。
   * 「1988年4月」の表記は画面側で `ymLabel()` を使ってください。
   * **エンジンは数を返し、見せ方は画面が作ります。**
   */
  minashi_kikan: [number, number] | null;
  /**
   * **切り捨て前**の重複月数。重ならなければ **0**（0は事実なので `null` にしません）。
   * `kasanari_nen` は これを 12 で割って切り捨てたものです。
   */
  kasanari_tsuki: number;
  /**
   * **前に受け取った退職手当等の合計額**（窓の中・A-20の形）。
   * 窓の中に前の支給源が1つも無い年は `null`。**0にしません。存在しないためです。**
   */
  shunyu_mae: number | null;
  /** **その期間を合算した退職所得控除額**（本則）。同じく無ければ `null` */
  kojo_mae: number | null;
  /**
   * 退職所得控除の式の内訳（所得税法30条3項）。**画面11に式を持たせないため**に出します。
   * `engine.py` 570〜576行の写し（2026-08-21・戦術Cowork）。
   *
   * **20年以下は「40万×◯年」、20年超は「800万＋70万×(◯−20)年」で、行の形そのものが変わります**
   * （判断ログ83⑤）。ですので**区分と3つの数**を返し、画面側は並べるだけにします。
   *
   * **勤続0年のときは4つとも `null` です。0にしません。**式が存在しないためです。
   */
  kojo_kubun: '20年超' | '20年以下' | null;
  /** 20年超のときの定額 8,000,000円。20年以下では `null`（式に出てこないため） */
  kojo_teigaku: number | null;
  /** 1年あたりの単価。20年超は 700,000円／20年以下は 400,000円 */
  kojo_tanka: number | null;
  /** 単価を掛ける年数。20年超は `nensu − 20`／20年以下は `nensu` */
  kojo_kasan_nensu: number | null;
  shogai: boolean; gensen_ari: number; gensen_nashi: number;
}

/** 年ごとの退職所得の金額と、その計算過程 */
export function taishokuByYear(p: Jinbutsu, plan: Plan): [Record<number, number>, KeikaRow[]] {
  const byyear: Record<number, [Gen, number][]> = {};
  for (const g of p.gens) {
    if (g.name === plan.nenkin_gen && plan.ichiji_wariai === 0) continue;
    const y = plan.uketori_nen[g.name];
    if (y === undefined) continue;
    let shunyu = g.shunyu;
    if (g.name === plan.nenkin_gen) shunyu = fdiv(g.shunyu * plan.ichiji_wariai, 100);
    if (shunyu <= 0) continue;
    (byyear[y] ??= []).push([g, shunyu]);
  }

  // ⑲ すでに受け取った退職手当等。控除の減額（施行令70条）にだけ効かせる
  const sumiByyear: Record<number, [Gen, number][]> = {};
  for (const [g, sy] of p.sumi) if (g.shunyu > 0) (sumiByyear[sy] ??= []).push([g, g.shunyu]);
  for (const k of Object.keys(sumiByyear)) if (byyear[+k] !== undefined)
    throw new Error(`⑲ すでに受け取った退職手当等に、これから受け取る年と同じ年が入っています（${k}）`);

  const maePool: Record<number, [Gen, number][]> = {};
  for (const d of [sumiByyear, byyear])
    for (const k of Object.keys(d)) (maePool[+k] ??= []).push(...d[+k]);

  const out: Record<number, number> = {};
  const keika: KeikaRow[] = [];
  for (const y of Object.keys(byyear).map(Number).sort((a, b) => a - b)) {
    const gs = byyear[y];
    const nensu = gassanNensu(gs.map(([g]) => g.kikan));
    const shogai = gs.some(([g]) => g.shogai);
    const kojoHonsoku = Z.taishokuKojoHonsoku(nensu);
    const kojo = Z.taishokuKojo(nensu, shogai);
    const shunyuKei = gs.reduce((a, [, s]) => a + s, 0);

    const tsuki = monthsOf(gs);
    const mae: [number, Gen, number][] = [];
    for (const py of Object.keys(maePool).map(Number).sort((a, b) => a - b)) {
      if (py >= y) break;
      for (const [pg, pshunyu] of maePool[py]) {
        const span = y - py;
        // 窓の年数は「その年に受け取るもの」で決まる（A-3）
        let limit: number;
        if (gs.some(([g]) => g.dc)) limit = Z.MADO_DC_ATO;
        else if (pg.dc) limit = (py >= KAISEI_10NEN && y >= KAISEI_10NEN) ? Z.MADO_DC_SAKI : Z.MADO_FUTSU;  // B-12
        else limit = Z.MADO_FUTSU;
        if (span > limit) continue;
        mae.push([py, pg, pshunyu]);
      }
    }

    /**
     * 施行令70条2項：みなし前の勤続期間等（A-16・A-20）
     *
     * 【2026-08-20・画面13】**すでに内側で計算している3つの出口を作ります**（判断ログ82・案A）。
     *   `engine.py` 500〜527行の写しです。**新しい計算は1つもありません。**
     *   画面13の「前に受け取った額が少ない場合」の行が、この3つを要ります。
     */
    let minashiNensu: number | null = null;      // 縮めていない方は null（0にしない）
    let minashiKikan: [number, number] | null = null;   // 通し月数の [from, to]。表記は画面側
    /**
     * 【2026-08-20・画面13／判断ログ82（3つ→5つに訂正）】
     *   前に受け取ったものの**合計額**と、その期間の**合算控除額**。
     *   `engine.py` 518〜525行の写しです。**窓の中に前の支給源が無い年は `null`。**
     *   （こちらは前便で、この2つを `KeikaRow.shunyu` / `KeikaRow.kojo` から取れると
     *   　書きました。**取り違えです。**あの2つは**その年に受け取るもの**の額と控除です）
     */
    let shunyuMaeOut: number | null = null;
    let kojoMaeOut: number | null = null;
    let maeTsuki = new Set<number>();
    if (mae.length) {
      for (const [, pg] of mae) for (let m = pg.kikan[0]; m <= pg.kikan[1]; m++) maeTsuki.add(m);
      const shunyuMae = mae.reduce((a, [, , s]) => a + s, 0);
      const kojoMae = Z.taishokuKojoHonsoku(gassanNensu(mae.map(([, pg]) => pg.kikan)));
      shunyuMaeOut = shunyuMae;
      kojoMaeOut = kojoMae;
      if (shunyuMae < kojoMae) {
        const nMinashi = Z.minashiNensu(shunyuMae);
        const hajime = Math.min(...mae.map(([, pg]) => pg.kikan[0]));   // 最も早い就職の日
        maeTsuki = new Set<number>();
        for (let m = hajime; m < hajime + nMinashi * 12; m++) maeTsuki.add(m);
        minashiNensu = nMinashi;
        // 【2026-09-03・A-2a2（senjutsu_20260902ak.md 1番）】**縮めた年数が 0 年のときは「期間が無い」ので `null`。**
        //   ★0 年で `[hajime, hajime - 1]` を作ると、字にしたとき「1988年4月〜1988年3月」と**逆さま**に出ます。
        //   ★★「無いもの」を、逆さまの期間として持たせません（画面13は `minashi_kikan === null` で行ごと出しません）。
        minashiKikan = nMinashi > 0 ? [hajime, hajime + nMinashi * 12 - 1] : null;
      }
    }
    // 施行令70条3項：重複期間の1年未満の端数は切捨て
    const kasanariTsuki = inter(tsuki, maeTsuki).size;   // 切り捨て**前**の月数（画面13が要る）
    const yHiku = fdiv(kasanariTsuki, 12);
    // 減額額に80万円の最低保障は効かない（A-17）
    const genkaku = yHiku > 0 ? Z.taishokuKojoHonsoku(yHiku) : 0;
    // 30条6項2号の80万円は「差し引いた後の金額」にかかる（A-18）
    const kojoAdj = nensu > 0 ? Z.kojoSaitei(kojoHonsoku - genkaku, shogai) : 0;

    const [shotoku, meisai] = taishokuShotokuKubun(gs, kojoAdj);
    out[y] = shotoku;
    keika.push({
      year: y, gens: gs.map(([g]) => g.name), shunyu: shunyuKei, nensu,
      kojo, genkaku, kojo_adj: kojoAdj, shotoku, shogai, kasanari_nen: yHiku,
      /** 【2026-08-26・画面11／戦術Cowork】区分ごとの「はみ出した額」と和 */
      kubun_meisai: meisai, hamidashi: meisai.hamidashi,
      // 【2026-08-20・画面13／判断ログ82】すでに計算している3つの出口
      minashi_nensu: minashiNensu, minashi_kikan: minashiKikan,
      kasanari_tsuki: kasanariTsuki,
      shunyu_mae: shunyuMaeOut, kojo_mae: kojoMaeOut,
      // 【2026-08-22・画面11／engine.py 570〜576行の写し】控除の式の内訳。
      //   **勤続0年のときは4つとも null。0にしません**（式が存在しないため）
      kojo_kubun: nensu <= 0 ? null : (nensu > 20 ? '20年超' : '20年以下'),
      kojo_teigaku: nensu > 20 ? 8_000_000 : null,
      kojo_tanka: nensu <= 0 ? null : (nensu > 20 ? 700_000 : 400_000),
      kojo_kasan_nensu: nensu <= 0 ? null : (nensu > 20 ? nensu - 20 : nensu),
      gensen_ari: Z.shotokuzei(Z.f1000(shotoku), p.nenbun(y)),
      gensen_nashi: Z.gensenMishutsu(shunyuKei, p.nenbun(y)),
    });
  }
  return [out, keika];
}

/** 年ごとのiDeCo等の年金受取額。均等割り・端数は最終年 */
export function nenkinByYear(p: Jinbutsu, plan: Plan): Record<number, number> {
  if (!plan.nenkin_gen) return {};
  if (plan.nenkin_kikan <= 0) {
    if (plan.ichiji_wariai < 100) throw new Error(`${plan.nenkin_gen} を年金で受け取る指定なのに期間が0年です`);
    return {};
  }
  const g = p.gens.find(x => x.name === plan.nenkin_gen);
  if (!g) return {};
  const total = g.shunyu - fdiv(g.shunyu * plan.ichiji_wariai, 100);
  if (total <= 0) return {};
  const n = plan.nenkin_kikan;
  const base = fdiv(total, n);
  const o: Record<number, number> = {};
  for (let i = 0; i < n; i++) o[plan.nenkin_kaishi_nen! + i] = i < n - 1 ? base : total - base * (n - 1);
  return o;
}

// ---------------------------------------------------------------- 年ごとの税額

/** その年の所得を組み立てる（B-10 と B-16 が互いに依存するので1か所にまとめる） */
/** taiShotoku … **合計所得金額に足す**退職所得金額
 *  taiKubun   … **公的年金等控除の区分（1,000万／2,000万）の判定に使う**退職所得金額。
 *               省略すると taiShotoku と同じ。
 *
 *  【E-15・決着 2026-08-19】**横浜市 戸塚区役所 税務課の回答**（指示書 §14-0）。
 *    「個人住民税において、『公的年金等に係る雑所得以外の合計所得金額』の判定に、
 *     分離課税の対象となる**退職所得は含めません**」
 *    → 保険料・医療費の判定（`shotokuJoukyou()`）は **`taiKubun=0` のまま。変更なし。**
 *    **この値は `kensa/e15_test.ts` で固定しています。`null` に戻すと落ちます。**
 *    （回答の限界＝横浜市のみ・一般的な取扱い・専門家の確認なし、は §14-0 に記載） */
export function shotokuKumitate(p: Jinbutsu, year: number, idecoNenkin: number,
                                taiShotoku: number, taiKubun: number | null = null) {
  const n = p.nenbun(year);
  const age = p.age(year);
  const koteki = p.kotekiByYear(year);
  const kyuyoShunyu = p.shunyu_by_age[age] ?? 0;
  const nenkinShunyu = idecoNenkin + koteki;

  const kyuyoNama = Z.kyuyoShotoku(kyuyoShunyu, n);
  // B-10：公的年金等以外の合計所得金額。退職所得金額を含む
  // 【E-15・決着】区分に含めない（横浜市 税務課 2026-08-19・§14-0）。taiKubun で渡す
  const taGoukei = kyuyoNama + Math.trunc(taiKubun === null ? taiShotoku : taiKubun);
  // A-21（280万円ルール）・B-13（65歳判定は12月31日現在）
  const zatsu = Z.nenkinShotokuChosei(p.nenrei1231(year), nenkinShunyu, kyuyoShunyu, n, taGoukei);
  // B-16：所得金額調整控除
  const chosei = Z.shotokuKingakuChosei(kyuyoNama, zatsu);
  const kyuyo = Math.max(0, kyuyoNama - chosei);
  const sougou = zatsu + kyuyo;

  /**
   * 【2026-08-22・画面11／engine.py 673〜681行の写し】公的年金等控除額そのものと、その区分。
   *
   * 画面11は「公的年金等控除（65歳未満） −600,000円」と、**額と区分の両方**を出しています。
   * **`nenkinShunyu − zatsu` で逆算しません。**280万円ルール（A-21）が入ると壊れます。
   *
   * **公的年金等の収入が0円の方は、控除も区分も `null` です。0にしません。**
   * 存在しないものを0と書くと、画面が「控除が0円だった」と読めます（判断ログ 7-2 の1番）。
   */
  const nenkinKojo = nenkinShunyu > 0
    ? Z.nenkinKojoChosei(p.nenrei1231(year), nenkinShunyu, kyuyoShunyu, n, taGoukei) : null;
  const nenkinKojoKubun: '65歳以上' | '65歳未満' | null = nenkinShunyu > 0
    ? (p.nenrei1231(year) >= 65 ? '65歳以上' : '65歳未満') : null;

  return { nenbun: n, age, koteki, kyuyoShunyu, nenkinShunyu, kyuyoNama, kyuyo, zatsu,
           nenkin_kojo: nenkinKojo, nenkin_kojo_kubun: nenkinKojoKubun,
           kingakuChosei: chosei, taGoukei, sougou, goukei: sougou + Math.trunc(taiShotoku) };
}

/* ──────────────────────────────────────────────────────────
 * 確定申告が要るか（所得税法121条3項）
 * ────────────────────────────────────────────────────────── */

/** 所得税法121条3項「四百万円」 */
export const SHINKOKU_NENKIN_GENDO = 4_000_000;
/** 同「二十万円」 */
export const SHINKOKU_TA_GENDO = 200_000;

export interface ShinkokuKekka {
  /** `true`＝確定申告が要る／`false`＝要らない */
  iru: boolean;
  /** 公的年金等の収入金額（公的年金＋確定拠出年金の年金） */
  nenkin_shunyu: number;
  /** 公的年金等に係る雑所得**以外**の所得金額 */
  ta_shotoku: number;
  /** 400万円以下か */
  joken_nenkin: boolean;
  /** 20万円以下か */
  joken_ta: boolean;
  gendo_nenkin: number;
  gendo_ta: number;
  /** **こちらで確かめられていないこと**の一覧。空でないことがあります */
  mikakunin: string[];
}

/**
 * その年に確定申告が要るか（所得税法121条3項）。
 * `engine.py` 925〜964行の写し（2026-08-22・戦術Cowork）。
 *
 * ──────────────────────────────────────────────────────────
 * 【20万円の判定に、退職所得を含めません】**ここがいちばん大事です**
 *
 *   条文は、20万円で見るものを**9つ列挙しています。**
 *     「その年分の公的年金等に係る雑所得以外の所得金額（**利子所得の金額、配当所得の金額、
 *       不動産所得の金額、事業所得の金額、給与所得の金額、山林所得の金額、譲渡所得の金額、
 *       一時所得の金額及び公的年金等に係る雑所得以外の雑所得の金額の合計額をいう。**）が
 *       二十万円以下であるとき」
 *   **退職所得は入っていません。**退職所得の申告不要は121条2項に別にあります。
 *
 *   戦術Coworkは、括弧書きの落ちた要約でこの条文を読み、
 *   **「含めるかは未決」として、含める側（＝申告が要ると出る側）を既定にしていました。**
 *   括弧書きを省略しない形で取り直したところ、条文に答えが書いてありました。
 *
 *   **含める／含めないで、1,380人中849人（61.5%）の答えが変わります**（そちらのPythonでの実測）。
 *   **「不利側に倒す」は安全ではありませんでした。条文どおりでない側に倒すのは、
 *   どちらの向きでも誤りです。**（判断ログ 7-2 の24番）
 * ──────────────────────────────────────────────────────────
 *
 * 【3つめの条件（源泉徴収）】
 *   条文は「その公的年金等の全部（**203条の7の適用を受けるものを除く**）について
 *   203条の2の徴収をされた又はされるべき場合」です。
 *   当社が扱うのは日本の公的年金と確定拠出年金等の年金だけで、**どちらも国内の源泉徴収の対象**です。
 *   満たさないのは**海外の年金など203条の2の対象にならない公的年金等がある方**で、
 *   **その入力欄がありません。**ですので、ここでは判定しません。
 *
 * 【`iru` を `false` にするのは、2つの条件が両方とも満たされたときだけです】
 *   公的年金等の収入が0円の方は、この規定の対象外なので `iru=true`（3項では決まりません）。
 *
 * @param taishokuFukumeru **含める読み方を試すためだけ**に残しています。既定は `false` です。
 */
export function shinkokuIru(p: Jinbutsu, year: number, idecoNenkin: number,
                            taiShotoku: number, taishokuFukumeru = false): ShinkokuKekka {
  const k = shotokuKumitate(p, year, idecoNenkin, taiShotoku);
  const nenkinShunyu = k.nenkinShunyu;
  const ta = k.kyuyo + (taishokuFukumeru ? Math.trunc(taiShotoku) : 0);
  const jokenNenkin = nenkinShunyu > 0 && nenkinShunyu <= SHINKOKU_NENKIN_GENDO;
  const jokenTa = ta <= SHINKOKU_TA_GENDO;
  const mikakunin: string[] = [];
  if (taishokuFukumeru && Math.trunc(taiShotoku) > 0) {
    mikakunin.push('20万円の判定に退職所得金額を含めています（条文の列挙と違う読み方です）');
  }
  return {
    iru: !(jokenNenkin && jokenTa),
    nenkin_shunyu: nenkinShunyu, ta_shotoku: ta,
    joken_nenkin: jokenNenkin, joken_ta: jokenTa,
    gendo_nenkin: SHINKOKU_NENKIN_GENDO, gendo_ta: SHINKOKU_TA_GENDO,
    mikakunin,
  };
}

export interface ZeiUchiwake { shotokuzei: number; jumin_sougou: number; jumin_taishoku: number; }

/** その年の所得にかかる税の内訳（所得税／住民税総合＝翌年度／住民税退職＝その年） */
export function nenkanZeiUchiwake(p: Jinbutsu, year: number, idecoNenkin: number,
                                  taiShotoku: number, shinkoku = true, kakekin = 0): ZeiUchiwake {
  // 【E-25・2026-08-19／オーナー承認】**2回に分けます。**
  //   前は1回だけ呼び、その `sougou` を所得税と住民税の**両方**へ渡していました。
  //   **同じ1つの値が、法律の違う2か所へ流れていました。**
  //     所得税 … 区分に退職所得を**含める**のが正しい
  //              （所得税法2条1項30号の合計所得金額は退職所得金額を含む）
  //     住民税 … 区分に退職所得を**含めない**のが正しい
  //              （横浜市 戸塚区役所 税務課 2026-08-19。地方税法292条1項13号→313条1項→328条1項。§14-0）
  //   直す前は、1,680人中442人（26.3%）で住民税を**過大に**取っていました（最大54,000円）。
  const k = shotokuKumitate(p, year, idecoNenkin, taiShotoku);              // 所得税用
  const kj = shotokuKumitate(p, year, idecoNenkin, taiShotoku, 0);          // 住民税用
  const { nenbun: n, sougou, goukei } = k;
  const ks = Z.kisoShotoku(goukei, n) + p.kojoShotokuzei(goukei) + kakekin;
  const kazeiSougou = Z.f1000(sougou - ks);
  // 所得税法87条2項：総所得から引ききれない所得控除を課税退職所得から差し引ける
  const amari = shinkoku ? Math.max(0, ks - sougou) : 0;
  const kazeiTai = Z.f1000(Math.max(0, Math.trunc(taiShotoku) - amari));
  const honzei = Z.itax(kazeiSougou) + Z.itax(kazeiTai);
  const st = honzei > 0 ? honzei + Z.uwanose(honzei, n) : 0;
  // **住民税に渡す5つは、すべて `kj.sougou` です。**
  //   `kojoJumin`（基礎控除の逓減）も `jinteki.sa`（人的控除の差）も `goukei`（調整控除の
  //   2,500万円判定）も、見ているのは**住民税の合計所得金額**で、そこに退職所得は入りません
  //   （問い1。地方税法292条1項13号→313条1項→328条1項）。**所得税側の `goukei` は渡しません。**
  const sj = kj.sougou;
  return {
    shotokuzei: st,
    jumin_sougou: Z.juminSougou(sj, p.kojoJumin(sj) + kakekin, p.fuyouKei(),
                                p.kyuchi, p.jinteki.sa(sj), sj),
    jumin_taishoku: Z.juminTaishoku(taiShotoku),
  };
}

export function nenkanZei(p: Jinbutsu, year: number, idecoNenkin: number,
                          taiShotoku: number, shinkoku = true, kakekin = 0): number {
  const u = nenkanZeiUchiwake(p, year, idecoNenkin, taiShotoku, shinkoku, kakekin);
  return u.shotokuzei + u.jumin_sougou + u.jumin_taishoku;
}

// ---------------------------------------------------------------- 評価
/** 年ごとの内訳。**住民税の総合課税分は翌年に納めます**（B-14）ので、別に持ちます */
export interface DetailRow {
  age: number;
  ideco_nenkin: number;
  tai_shotoku: number;
  kakekin: number;
  /** その年ぶんの税の合計（今年納める分＋翌年度に納める分） */
  zei: number;
  /** そのうち**その年**に納める分（所得税＋住民税の退職所得分） */
  zei_kotoshi: number;
  /** そのうち**翌年度**に納める分（住民税の総合課税分） */
  jumin_yokutoshi: number;
}

/**
 * 手数料の内訳（`engine.py` 833〜839行の写し・2026-08-22）。
 *
 * 画面11は「給付事務手数料 440円×5回 2,200円／口座管理手数料 66円×48か月 3,168円／合計 5,368円」
 * と**単価・回数・小計**まで出しています。**画面側で掛け算をさせないため**に6つとも返します。
 *
 * **確定拠出年金が無い方は、口座管理手数料の3つが `null` です。0にしません。**
 * 「口座管理手数料 66円×0か月 0円」という行が出てしまうためです。
 */
export interface TesuryoUchiwake {
  /** 給付1回あたりの事務手数料（440円） */
  kyufu_tanka: number;
  /** 給付の回数（⑱ 年間の受取回数を含む） */
  kyufu_kaisu: number;
  /** 給付事務手数料の小計 */
  kyufu_kei: number;
  /** 口座管理手数料の月額（66円）。確定拠出年金が無い方は `null` */
  koza_tanka: number | null;
  /** 口座管理手数料のかかる月数。同じく無ければ `null` */
  koza_tsuki: number | null;
  /** 口座管理手数料の小計。同じく無ければ `null` */
  koza_kei: number | null;
  /**
   * 給付事務手数料の**行を画面に出すか**（`engine.py` 844行の写し・2026-08-23）。
   *
   * 【`null` かどうかではなく「その方にその手数料がかかるか」で決めます】
   *   戦術Coworkの実測（stress10000 の400人・635,628通り）
   *     `koza_tanka` が `null`（確定拠出年金が無い）　　 **0人**
   *       ※ そもそも `build()` が止まるので、画面に届きません
   *     **`koza_tsuki` が 0（確定拠出年金はあるが月数0）… 41人（10.3%）**
   *     `kyufu_kaisu` が 0 …… 0人
   *   0円の行を出すと、**かかっていない手数料がかかったように読めます。**
   */
  kyufu_gyou: boolean;
  /** 口座管理手数料の**行を画面に出すか**。**`null` も `0` も `false`** */
  koza_gyou: boolean;
  /** 画面に出す行の数（0／1／2） */
  gyou_kazu: 0 | 1 | 2;
  /** 手数料の合計 */
  kei: number;
}

export interface EvalResult {
  zei: number; uketori: number; tesuryo: number; tedori: number;
  detail: Record<number, DetailRow>; keika: KeikaRow[]; saishu_nen: number | null;
  /** 手数料の内訳（画面11）。**`evaluate()` は必ず返します** */
  tesuryo_uchiwake?: TesuryoUchiwake;
  cash?: Record<number, number>; ruikei?: Record<number, number>; harau?: Record<number, number>;
  /**
   * 【2026-09-03・A-2a2（senjutsu_20260903b.md 3-2・c.md 5番）】**年ごとの手数料**（鍵は年・値は円の整数）。
   *
   * ★Excel のシート3が「その年の手数料」の列に出します。★実装側で割り振らせないため、ここで返します。
   *   給付事務手数料 … その年に受け取った回数 × 440円（★`dc` の支給源だけ。一時金は1回・年金は⑱の回数）
   *   口座管理手数料 … 拠出が終わった年の**翌年**から、最後に受け取る年まで、**12か月 × 66円 ずつ**
   * ★★`Σ tesuryo_by_year` は `tesuryo` と1円も違いません（下の門で止めます）。
   * ★**0 の年は入れません**（senjutsu_20260903c.md 4番）。読む側は `?? 0` で受けてください。
   */
  tesuryo_by_year?: Record<number, number>;
  /**
   * 【2026-09-03・A-2a2（senjutsu_20260903c.md 2番）】**年ごとの額面**（鍵は年・値は円の整数）。
   *
   * ★その年に受け取る額そのもの（**税も手数料も引く前**）。`cash` は税と掛金を引いたあとで、別の数です。
   * ★Excel のシート3が「その年に手元に入る額」の列に出します。
   *   ★`cash + harau` の**逆算に頼らない**ため、ここで返します（判断ログ・A-2a2 の止め①）。
   * ★**0 の年は入れません**。読む側は `?? 0` で受けてください。
   */
  haitta_by_year?: Record<number, number>;
}

/** この受け取り方をしたときに、公的年金だけの世界と比べて何円多く引かれるか
 *  baseCache : (p, year) にしか依存しない「公的年金だけの世界」の税をキャッシュする。
 *              build() の中で同じ q・同じ年が何千回も出るため。**計算結果は変わらない。** */
export function evaluate(p: Jinbutsu, plan: Plan, shinkoku = true,
                         kakekinByYear: Record<number, number> | null = null,
                         baseCache: Map<number, ZeiUchiwake> | null = null,
                         taiCache: Map<string, [Record<number, number>, KeikaRow[]]> | null = null): EvalResult {
  const kk = { ...(kakekinByYear ?? {}) };
  // 退職所得は公的年金の開始年齢（⑳）に依存しない。⑳ごとに同じ計算を16回している分をまとめる。
  // **計算結果は変わらない**（キーは一時金の構成そのもの）。
  let tai: Record<number, number>, keika: KeikaRow[];
  if (taiCache) {
    const key = `${JSON.stringify(plan.uketori_nen)}|${plan.ichiji_wariai}|${plan.nenkin_gen ?? ''}`;
    const hit = taiCache.get(key);
    if (hit) { [tai, keika] = hit; }
    else { const v = taishokuByYear(p, plan); taiCache.set(key, v); [tai, keika] = v; }
  } else { [tai, keika] = taishokuByYear(p, plan); }
  const nen = nenkinByYear(p, plan);
  const ys = new Set<number>([...Object.keys(tai), ...Object.keys(nen), ...Object.keys(kk)].map(Number));
  const years = [...ys].sort((a, b) => a - b);
  if (!years.length)
    return { zei: 0, uketori: p.gens.reduce((a, g) => a + g.shunyu, 0), tesuryo: 0,
             tedori: 0, detail: {}, keika: [], saishu_nen: null };

  let zei = 0;
  const detail: Record<number, DetailRow> = {};
  const harau: Record<number, number> = {};
  for (const y of years) {
    const w = nenkanZeiUchiwake(p, y, nen[y] ?? 0, tai[y] ?? 0, shinkoku, kk[y] ?? 0);
    let wo: ZeiUchiwake;
    if (baseCache && !(kk[y] ?? 0)) {
      const c = baseCache.get(y);
      if (c) wo = c;
      else { wo = nenkanZeiUchiwake(p, y, 0, 0, shinkoku, 0); baseCache.set(y, wo); }
    } else wo = nenkanZeiUchiwake(p, y, 0, 0, shinkoku, 0);
    const saIma = (w.shotokuzei - wo.shotokuzei) + (w.jumin_taishoku - wo.jumin_taishoku);
    const saYoku = w.jumin_sougou - wo.jumin_sougou;   // B-14：住民税の総合課税分は翌年
    zei += saIma + saYoku;
    harau[y] = (harau[y] ?? 0) + saIma;
    harau[y + 1] = (harau[y + 1] ?? 0) + saYoku;
    detail[y] = { age: p.age(y), ideco_nenkin: nen[y] ?? 0, tai_shotoku: tai[y] ?? 0,
                  kakekin: kk[y] ?? 0, zei: saIma + saYoku, zei_kotoshi: saIma, jumin_yokutoshi: saYoku };
  }

  const uketori = p.gens.reduce((a, g) => a + g.shunyu, 0);

  // --- 手数料 ---
  const dcNames = new Set(p.gens.filter(g => g.dc).map(g => g.name));
  const dcIchijiYears = new Set<number>();
  for (const k of keika) if (k.gens.some(n => dcNames.has(n))) dcIchijiYears.add(k.year);
  const kaisu = dcIchijiYears.size + Object.keys(nen).length * plan.nenkin_kaisu;
  let tesuryo = kaisu * KYUFU_JIMU_TESURYO;
  /**
   * 【2026-09-03・A-2a2】**年ごとの手数料**。★合計（`tesuryo`）と同じものを、年に割って持ちます。
   *   ★合計の式には手を入れていません。★下の門で `Σ` が `tesuryo` と一致することを確かめます。
   */
  const tesuryoByYear: Record<number, number> = {};
  const tasu = (y: number, en: number) => { if (en) tesuryoByYear[y] = (tesuryoByYear[y] ?? 0) + en; };
  for (const y of dcIchijiYears) tasu(y, KYUFU_JIMU_TESURYO);                       // 一時金は1回
  for (const y of Object.keys(nen).map(Number)) tasu(y, plan.nenkin_kaisu * KYUFU_JIMU_TESURYO);  // 年金は⑱の回数
  const ideco = p.gens.find(g => g.dc);
  /** 口座管理手数料のかかる月数。**確定拠出年金が無い方には存在しません。0にしません** */
  let kozaTsuki: number | null = null;
  if (ideco) {
    const cand = [...dcIchijiYears, ...Object.keys(nen).map(Number)];
    // ★`ym(y, 12)` を 12 で割ると y+1 になるため、−1 してから割ります（2026-09-02・senjutsu_20260902ag.md 2番。engine.py 799行と同じ）
    const dcOwari = cand.length ? Math.max(...cand) : fdiv(ideco.kikan[1] - 1, 12);
    const hajime = fdiv(ideco.kikan[1] - 1, 12);   // A-6
    kozaTsuki = Math.max(0, dcOwari - hajime) * 12;
    tesuryo += kozaTsuki * KOZA_KANRI_TSUKI;
    // ★年に割る … 拠出が終わった年の翌年から、最後に受け取る年まで、12か月ずつ（★`kozaTsuki` は年数×12 なので端数は出ません）
    for (let y = hajime + 1; y <= dcOwari; y++) tasu(y, 12 * KOZA_KANRI_TSUKI);
  }
  /** **その方にその手数料がかかるか。**`null` も `0` も `false`（`engine.py` 844〜845行の写し） */
  const kyufuGyou = kaisu > 0;
  const kozaGyou = !!kozaTsuki;
  const tesuryoUchiwake: TesuryoUchiwake = {
    kyufu_tanka: KYUFU_JIMU_TESURYO, kyufu_kaisu: kaisu,
    kyufu_kei: kaisu * KYUFU_JIMU_TESURYO,
    koza_tanka: ideco ? KOZA_KANRI_TSUKI : null,
    koza_tsuki: kozaTsuki,
    koza_kei: ideco && kozaTsuki !== null ? kozaTsuki * KOZA_KANRI_TSUKI : null,
    kyufu_gyou: kyufuGyou, koza_gyou: kozaGyou,
    gyou_kazu: ((kyufuGyou ? 1 : 0) + (kozaGyou ? 1 : 0)) as 0 | 1 | 2,
    kei: tesuryo,
  };
  /**
   * **合計は、画面に出す行の合計と必ず一致します**（`engine.py` 856〜858行の写し）。
   * 出さない行のぶんが合計に残っていると、**画面の足し算が合いません。**
   * 利用者は「どこかで1行抜けている」とは読まず、**合計のほうを疑います。**
   */
  {
    const gyouKei = (kyufuGyou ? tesuryoUchiwake.kyufu_kei : 0)
      + (kozaGyou ? (tesuryoUchiwake.koza_kei ?? 0) : 0);
    if (tesuryo !== gyouKei) {
      throw new Error(`手数料の合計が、画面に出す行の合計と合いません（合計 ${tesuryo} ／ 行の合計 ${gyouKei}）`);
    }
  }
  /**
   * 【2026-09-03・A-2a2】**年ごとの手数料の合計は、手数料の合計と必ず一致します。**
   * ★合わないまま Excel に出すと、「入る額 − 税 − 手数料 ＝ 手取り」が合わなくなります。
   *   ★利用者は「どこかの年が抜けている」とは読まず、**手取りのほうを疑います。**
   */
  {
    const nenKei = Object.values(tesuryoByYear).reduce((a, b) => a + b, 0);
    if (tesuryo !== nenKei) {
      throw new Error(`年ごとの手数料の合計が、手数料の合計と合いません（合計 ${tesuryo} ／ 年ごとの合計 ${nenKei}）`);
    }
  }

  // --- ⑪の判定に使う「年ごとに手元に入る額」と累計（B-14 で納める年に付け替え済み） ---
  const cash: Record<number, number> = {}, ruikei: Record<number, number> = {};
  /** 【2026-09-03・A-2a2】**年ごとの額面**（税も手数料も引く前）。★0 の年は入れません */
  const haittaByYear: Record<number, number> = {};
  let ru = 0;
  const allY = [...new Set<number>([...years, ...Object.keys(harau).map(Number)])].sort((a, b) => a - b);
  for (const y of allY) {
    let haitta = nen[y] ?? 0;
    for (const k of keika) if (k.year === y) haitta += k.shunyu;
    if (haitta) haittaByYear[y] = haitta;
    const z = (harau[y] ?? 0) + (kk[y] ?? 0);
    cash[p.age(y)] = haitta - z;
    ru += haitta - z;
    ruikei[p.age(y)] = ru;
  }

  return { zei, uketori, tesuryo, tesuryo_uchiwake: tesuryoUchiwake,
           tedori: uketori - zei - tesuryo, detail, keika,
           saishu_nen: Math.max(...years), cash, ruikei, harau,
           tesuryo_by_year: tesuryoByYear, haitta_by_year: haittaByYear };
}

// ---------------------------------------------------------------- 全通りの列挙

/** 確定拠出年金の老齢給付金を請求できる最も早い年齢（確定拠出年金法33条1項）
 *  引数は**通算加入者等期間の月数**。
 *  【E-14】kikanNensu()（所得税法施行令69条1項＝1年未満は切り上げ）を渡してはいけない。 */
export function idecoSaitanAge(tsusanKanyuTsukisu: number): number {
  const m = Math.trunc(tsusanKanyuTsukisu);
  if (m >= 120) return 60;
  if (m >= 96) return 61;
  if (m >= 72) return 62;
  if (m >= 48) return 63;
  if (m >= 24) return 64;
  return 65;
}

/** 公的年金を受け取り始められる年齢の一覧。**genzai_nen に既定値を作らない**（§4-4-2） */
export function nenkinKaishiAges(p: Jinbutsu, genzaiNen: number): number[] {
  const jogen = Z.kurisageJogenAge(p.seinen, p.umare);
  const ages: number[] = [];
  for (let a = Z.KURIAGE_SAITEI_AGE; a <= jogen; a++) if (p.year(a) >= genzaiNen) ages.push(a);
  return ages.length ? ages : [jogen];
}

/**
 * ②A **その方が選べる、公的年金の受け取り開始年齢の候補**（2026-08-30・オーナー判断）
 *
 * 【なぜ要るか】`nenkinKaishiAges()` は「60歳から上限まで、まだ来ていない年齢」を返します。
 *   **すでに受け取り始めている方**には、その候補がありません。**もう決まっているからです。**
 *
 *     1953年生まれ・73歳・65歳から受け取り中の方
 *       `nenkinKaishiAges()` が返すのは **73・74・75歳**。**実際の65歳は入っていません**
 *       その方に「73歳から始めたら」の案を出しても、**選べません**
 *
 *   ですので、**すでに受け取り中の方は、いまの開始年齢1通りだけ**にします。
 *
 * 【なぜ `nenkinKaishiAges()` の中に入れないか】戦術Cowork `senjutsu_20260830c.md` §2
 *   ・`nenkinKaishiAges()` は「**その方が選べる年齢の一覧**」という1つの意味を持っています。
 *     「すでに受け取り中なら1通り」は**別の決め（②A）**です。1つの関数に2つの決めを持たせません
 *   ・**番人Eと同じ層に並びます。**分岐が関数の中に隠れると、
 *     番人Eは**自分が守るはずのものを、外から見られなくなります**
 *   ・**無料版は⑳を聞いていません。**関数に入れると、無料版が呼んだときにも効きます
 *
 * 【写しを作らないために】呼び出し側に `? :` を書き写すと、片方だけ直る形になります。
 *   ですので**分岐は、この関数1本だけ**です。**`nenkinKaishiAges()` は1文字も触っていません。**
 *
 * @param genzaiNen **既定値を作りません。**呼び出し側から渡してください
 */
export function nenkinKouho(p: Jinbutsu, genzaiNen: number): number[] {
  return p.year(p.koteki_kaishi_age) < genzaiNen
    ? [p.koteki_kaishi_age]              // すでに受け取り中 → 軸にしない
    : nenkinKaishiAges(p, genzaiNen);    // まだ → いまのまま
}

/**
 * ★**番人E**（2026-08-30。戦術Cowork `senjutsu_20260830e.md` §6）
 *
 *   > 有料版の結果に、**その方が選べない⑳から作られた案**が1つでも入っていたら止める
 *
 * 【なぜ要るか】②A（`nenkinKouho`）は**呼び出し側**に置きました。
 *   ですので、**呼び忘れたり、`nenkinKaishiAges` を直に呼んだりすると、②Aが効きません。**
 *   そのとき、**その方が選べない⑳の案が、画面のいちばん上に出ることがあります。**
 *   1953年生まれ・65歳から受け取り中の方で、**手取り最大が 73〜75歳から始める案**になる例を、
 *   戦術Coworkが測っておられます（`erabe.mts`。B案・C案とも 24,948,224円）。
 *
 * 【なぜ「選べない」と言えるか】その方は**もう受け取り始めています。**
 *   開始年齢は決まっていて、**変えられません。**
 *
 * 【この番人を守る当ては、作りません】（`senjutsu_20260827o.md` §3-4「1段だけです」）
 *
 * 【★`nenkin_kaishi_age` が `null` になるのは、どういう案ですか】
 *   （2026-08-30。戦術Cowork `senjutsu_20260830j.md` §5 のお尋ねへの答えです）
 *
 *   `Plan` の宣言（198行）で `nenkin_kaishi_age: number | null = null;` としています。
 *   **`null` は「まだ入れていない」という初期値**です。
 *
 *   `build()` が作る案は、**3か所とも `nenkin_kaishi_age: nAge` を必ず入れています**
 *   （1072・1078・1086行の `new Plan({...})`）。
 *   ですので **`build()` の戻りに `null` の案は1つも入りません。**
 *   そちらが当てられた2人で0通りだったのは、**そのためです。**
 *
 *   `null` のままの `Plan` は、**`build()` の外で手で作ったもの**だけです。器の中では4か所。
 *     `free.ts` 142行（無料版の基準の案）／`free.ts` 295行
 *     `hantei.ts` 27・28行
 *   これらは `evaluate()` や `taishokuByYear()` に直に渡すもので、
 *   **`banninE()` には渡していません。**
 *
 *   → **いまの器では、この番人に `null` の案は届きません。**
 *     ですが `banninE()` は `[Plan, EvalResult][]` なら何でも受け取れますので、
 *     **手で作った案を渡されたときに、黙って飛ばすことになります。**
 *     ですので**飛ばさずに数えて、返して**います（下の `nullNoAn`）。
 *
 * 【★2026-08-30・決まりました。`null` は「その方の⑳」として当てます】
 *   （戦術Cowork `senjutsu_20260830k.md` §3）
 *
 *   第67便でこちらは「落とすか、素通りか」を尋ねました。**答えはどちらでもありませんでした。**
 *
 *   > `null` の案が、**⑳を使っていないわけではありません。**
 *   > `Jinbutsu` の 145・154・162・168行が `this.koteki_kaishi_age` を読んでいます。
 *   > → **`null` の案は、その方の⑳ で計算されます。**
 *   > ・落とす  → **当てられるものを、当てずに止めることになります**
 *   > ・素通り  → **当てるべきものを、黙って飛ばします**
 *
 *   **こちらでも 145・154・162・168行を読んで確かめました。そのとおりです。**
 *     145行  `const kaishiAge = this.koteki_kaishi_age;`（支払月数）
 *     154行  `Z.nenkinGaku(..., this.koteki_kaishi_age, ...)`（年金額）
 *     162行  `Z.nenkinRitsu(this.koteki_kaishi_age, ...)`（繰上げ減額・繰下げ増額の率）
 *     168行  `for (let y = this.year(65); y < this.year(this.koteki_kaishi_age); y++)`（繰下げ待機）
 *
 *   ですので `continue` を外し、**`?? p.koteki_kaishi_age` で当てます。**
 *
 *   ★これで、**⑳が繰下げの上限を超えている方**（例：1951年生まれ・⑳75歳。上限は70歳）に
 *     `null` の案を渡すと、**落ちるようになります。**素通りしていたときは通っていました。
 *
 * 【★`nullNoAn` は、当てとは別に数えます】（`senjutsu_20260830k.md` §3・★4）
 *   上の `??` を入れると当てに使う `a` は `null` になりませんので、
 *   **`pl.nenkin_kaishi_age === null` を、当てとは別に数えます。**0でも行を出します。
 *
 * @param R `build()` が返したもの
 * @param genzaiNen **既定値を作りません。**呼び出し側から渡してください
 * @returns 数えた3つ。`zenbu`＝受け取った案の数 ／
 *   `toshiNoAn`＝⑳の歳が入っている案 ／
 *   `nullNoAn`＝⑳が `null` の案（＝手で作った案。**その方の⑳として当てています**）
 */
export function banninE(p: Jinbutsu, genzaiNen: number, R: [Plan, EvalResult][]):
    { zenbu: number; toshiNoAn: number; nullNoAn: number } {
  const kouho = new Set(nenkinKouho(p, genzaiNen));
  const warui: number[] = [];
  let toshiNoAn = 0, nullNoAn = 0;
  for (const [pl] of R) {
    /**
     * ★**`null` は、その方の⑳ として当てます**（2026-08-30・`senjutsu_20260830k.md` §3）。
     *   飛ばしません。`null` の案も `p.koteki_kaishi_age` で計算されるためです
     */
    const a = pl.nenkin_kaishi_age ?? p.koteki_kaishi_age;
    /** ★当てとは別に、`null` だった案を数えます（★4）。**0でも呼び出し側で行にします** */
    if (pl.nenkin_kaishi_age === null) nullNoAn++; else toshiNoAn++;
    if (!kouho.has(a)) warui.push(a);
  }
  if (warui.length) {
    const uchi = [...new Set(warui)].sort((x, y) => x - y);
    throw new Error('その方が選べない開始年齢の案が入っています'
      + `（${uchi.join('・')}歳。のべ ${warui.length}件）。`
      + `この方が選べるのは ${[...kouho].sort((x, y) => x - y).join('・')}歳です`
      + `（${p.year(p.koteki_kaishi_age) < genzaiNen
          ? 'すでに受け取り始めているので、いまの開始年齢1通りだけです'
          : 'まだ受け取っていないので、nenkinKaishiAges() の一覧です'}）。`
      + 'build() に渡す候補を nenkinKouho(p, genzaiNen) にしてください（②A・2026-08-30）。');
  }
  return { zenbu: R.length, toshiNoAn, nullNoAn };
}

export function build(p: Jinbutsu, taishokuGenNames: string[], idecoGenName: string,
                      taishokuNen: number, opts: {
                        heikyuWariai?: number[]; nenkinAges?: number[] | null;
                        idecoAgeRange?: [number, number] | null; genzaiNen: number;
                      }): [Plan, EvalResult][] {
  const heikyuWariai = opts.heikyuWariai ?? [];
  const genzaiNen = opts.genzaiNen;
  /**
   * ★**`nenkinAges` は必ず渡してください**（2026-08-30・①A。戦術Cowork `senjutsu_20260830e.md`）
   *
   *   前はここに `?? [p.koteki_kaishi_age]` と書いてありました。**既定値です。**
   *   こちらの決め「**既定値を作らない。呼び出し側から渡す**」に反していました。
   *   **渡し忘れても止まらず、1通りだけ計算して、それらしい答えを返します。**
   *
   *   ⑳を軸にする（①A）ことになったので、**渡し忘れが「軸にしていない答え」になります。**
   *   数が違うのではなく、**別のものを計算して、同じ顔で返します。**ですので止めます。
   *
   *   ・有料版  `nenkinKouho(p, genzaiNen)` を渡してください（②A）
   *   ・無料版  `[p.koteki_kaishi_age]` を渡してください（`free.ts`。E-17 のまま⑳を軸にしません）
   */
  if (!Array.isArray(opts.nenkinAges) || opts.nenkinAges.length === 0) {
    throw new Error('build() に nenkinAges が渡っていません。'
      + '公的年金を受け取り始める年齢の候補を、呼び出し側から必ず渡してください。'
      + '有料版は nenkinKouho(p, genzaiNen)、無料版は [p.koteki_kaishi_age] です'
      + '（既定値を作らない・2026-08-30）。');
  }
  const nenkinAges = opts.nenkinAges;
  const out: [Plan, EvalResult][] = [];
  const ide = p.gens.find(g => g.name === idecoGenName)!;
  // 【E-14】**月で渡す。**kikanNensu() は所得税法の数え方（切り上げ）なので使わない
  const idecoAgeRange = opts.idecoAgeRange
    ?? [idecoSaitanAge(ide.kikan[1] - ide.kikan[0] + 1), 75] as [number, number];

  const taiCache = new Map<string, [Record<number, number>, KeikaRow[]]>();
  for (const nAge of nenkinAges) {
    const q = nAge === p.koteki_kaishi_age ? p : p.withKotekiKaishiAge(nAge);
    const fuki = nenkinAges.length <= 1 ? '' : `／公的年金を${nAge}歳から`;
    // 「公的年金だけの世界」の税は q と年にしか依存しない。⑳ごとに1回だけ計算する
    const baseCache = new Map<number, ZeiUchiwake>();
    for (let iAge = idecoAgeRange[0]; iAge <= idecoAgeRange[1]; iAge++) {
      const iNen = p.year(iAge);
      if (iNen < genzaiNen) continue;   // A-2：過去の年は候補に出さない
      const baseUketori: Record<string, number> = {};
      for (const n of taishokuGenNames) baseUketori[n] = taishokuNen;

      // 全額を一時金で
      let plan = new Plan({ uketori_nen: { ...baseUketori, [idecoGenName]: iNen },
        label: `${idecoGenName}を${iAge}歳で一時金${fuki}`, nenkin_kaishi_age: nAge });
      out.push([plan, evaluate(q, plan, true, null, baseCache, taiCache)]);

      // 全額を年金で（5〜20年）
      for (let k = 5; k <= 20; k++) {
        plan = new Plan({ uketori_nen: { ...baseUketori }, nenkin_gen: idecoGenName,
          nenkin_kaishi_nen: iNen, nenkin_kikan: k,
          label: `${idecoGenName}を${iAge}歳から年金${k}年${fuki}`, nenkin_kaishi_age: nAge });
        out.push([plan, evaluate(q, plan, true, null, baseCache, taiCache)]);
      }

      // 併給（一部を一時金、残りを年金）
      for (const w of heikyuWariai) for (let k = 5; k <= 20; k++) {
        plan = new Plan({ uketori_nen: { ...baseUketori, [idecoGenName]: iNen },
          nenkin_gen: idecoGenName, nenkin_kaishi_nen: iNen, nenkin_kikan: k, ichiji_wariai: w,
          label: `${idecoGenName}を${iAge}歳で${w}%一時金＋残り年金${k}年${fuki}`,
          nenkin_kaishi_age: nAge });
        out.push([plan, evaluate(q, plan, true, null, baseCache, taiCache)]);
      }
    }
  }
  return out;
}

/** 保険料・医療費の「境目」の判定に使う、その年の所得の状況。
 *  いずれも**退職所得を含まない**（分離課税なので算定にも非課税限度額の判定にも入らない）。 */
export function shotokuJoukyou(p: Jinbutsu, year: number, idecoNenkin = 0, kakekin = 0) {
  // 【E-15・決着 2026-08-19】合計に足さない(0)／区分にも使わない(0)。**両方0が決着した側**（§14-0）
  const k = shotokuKumitate(p, year, idecoNenkin, 0, 0);
  const goukei = k.sougou;
  const kazei = Z.f1000(Math.max(0, goukei - Z.kisoJumin(goukei) - p.kojoJumin(goukei) - kakekin));
  return {
    nenkin_zatsu: k.zatsu, kyuyo: k.kyuyo, goukei, kazei,
    kingaku_chosei: k.kingakuChosei, ta_goukei: k.taGoukei, kyuyo_nama: k.kyuyoNama,
    nenkin_shunyu: k.nenkinShunyu, kyuyo_shunyu: k.kyuyoShunyu,
    hikazei: goukei <= Z.hikazeiGendo(p.kyuchi, p.fuyouKei()),
  };
}
export type Joukyou = ReturnType<typeof shotokuJoukyou>;
