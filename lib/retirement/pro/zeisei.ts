/** zeisei.ts ── hikiwatashi/engine/zeisei.py の移植（Q17 速度実測用）
 *  条文の根拠コメントは Python 版に付いている。ここでは対応関係だけ残す。
 *  **すべて整数演算。Math.round / toFixed は使わない。**
 *  Python の // は床除算なので fdiv() で厳密に合わせる。 */

/** Python の a // b（床除算）。JS の / は実数除算なので必ずこれを通す */
export const fdiv = (a: number, b: number): number => Math.floor(a / b);

// 所得税の速算表（所得税法89条1項）。税率は百分率の整数で持つ
const BRK: [number | null, number, number][] = [
  [1_950_000, 5, 0], [3_300_000, 10, 97_500], [6_950_000, 20, 427_500],
  [9_000_000, 23, 636_000], [18_000_000, 33, 1_536_000],
  [40_000_000, 40, 2_796_000], [null, 45, 4_796_000],
];

/** 課税標準の1,000円未満切捨て */
export function f1000(x: number): number { return fdiv(Math.max(0, Math.trunc(x)), 1000) * 1000; }

/** 所得税額（上乗せ前） */
export function itax(kazei: number): number {
  const b = Math.trunc(kazei);
  if (b <= 0) return 0;
  for (const [cap, r, d] of BRK) if (cap === null || b <= cap) return fdiv(b * r, 100) - d;
  return 0;
}

/** 所得税への上乗せ額（円未満切捨て）。〜令和29年分 2.1%／令和30年分以後 1.0% */
export function uwanose(honzei: number, nenbun: number): number {
  if (honzei <= 0) return 0;
  return nenbun <= 29 ? fdiv(honzei * 21, 1000) : fdiv(honzei * 10, 1000);
}

export function shotokuzei(kazei: number, nenbun: number): number {
  const t = itax(kazei);
  return t > 0 ? t + uwanose(t, nenbun) : 0;
}

/** 所得税の基礎控除（所得税法86条＋措置法41条の16の2）
 *  令和8・9年分 104万（合計所得489万以下）／67万（655万以下）／62万 */
// --- 施行令70条1項：控除を減らすかどうかを見る「窓」（前年以前◯年内）------------
//  **法令の数値は必ずここに置く。**画面に出す「空ける年数」は、窓の外に出る最小の年数＝この値＋1年。
export const MADO_DC_ATO = 19;    // その年に受け取るのが確定拠出年金の一時金（＝iDeCo等があと）
export const MADO_DC_SAKI = 9;    // 前がDCの一時金で、その年のものは退職手当等（令和8年1月1日以後）
export const MADO_FUTSU = 4;      // どちらもDCでない

export function kisoShotoku(goukei: number, nenbun: number): number {
  const g = Math.trunc(goukei);
  let base: number | null;
  if (nenbun <= 7) {
    if (g <= 1_320_000) base = 950_000;
    else if (g <= 3_360_000) base = 880_000;
    else if (g <= 4_890_000) base = 680_000;
    else if (g <= 6_550_000) base = 630_000;
    else if (g <= 23_500_000) base = 580_000;
    else base = null;
  } else if (nenbun === 8 || nenbun === 9) {
    if (g <= 4_890_000) base = 1_040_000;
    else if (g <= 6_550_000) base = 670_000;
    else if (g <= 23_500_000) base = 620_000;
    else base = null;
  } else {
    if (g <= 1_320_000) base = 990_000;
    else if (g <= 23_500_000) base = 620_000;
    else base = null;
  }
  if (base !== null) return base;
  if (g <= 24_000_000) return 480_000;
  if (g <= 24_500_000) return 320_000;
  if (g <= 25_000_000) return 160_000;
  return 0;
}

/** 住民税の基礎控除（地方税法314条の2第2項） */
export function kisoJumin(goukei: number): number {
  const g = Math.trunc(goukei);
  if (g <= 24_000_000) return 430_000;
  if (g <= 24_500_000) return 290_000;
  if (g <= 25_000_000) return 150_000;
  return 0;
}

/** 給与所得控除（所得税法28条3項＋措置法29条の4） */
export function kyuyoKojo(shunyu: number, nenbun: number): number {
  const s = Math.trunc(shunyu);
  if (s <= 0) return 0;
  const mn = nenbun <= 7 ? 650_000 : ((nenbun === 8 || nenbun === 9) ? 740_000 : 690_000);
  if (s <= mn) return s;
  if (s <= 1_900_000) return mn;
  if (s <= 3_600_000) return Math.max(mn, fdiv(s * 30, 100) + 80_000);
  if (s <= 6_600_000) return fdiv(s * 20, 100) + 440_000;
  if (s <= 8_500_000) return fdiv(s * 10, 100) + 1_100_000;
  return 1_950_000;
}

const BEPPYO_KIZAMI = 4_000;

/** 給与所得の金額（別表第五＝4,000円刻み。所得税法28条4項） */
export function kyuyoShotoku(shunyu: number, nenbun: number, beppyo = true): number {
  const s = Math.trunc(shunyu);
  if (s <= 0) return 0;
  if (!beppyo || s >= 6_600_000) return Math.max(0, s - kyuyoKojo(s, nenbun));
  if ((nenbun === 8 || nenbun === 9) && s < 2_200_000) {
    if (s < 741_000) return 0;
    if (s < 2_191_000) return s - 740_000;
    if (s < 2_193_000) return 1_451_000;
    if (s < 2_196_000) return 1_453_000;
    return 1_456_000;
  }
  if (s < 2_200_000) return Math.max(0, s - kyuyoKojo(s, nenbun));
  const t = fdiv(s, BEPPYO_KIZAMI) * BEPPYO_KIZAMI;
  return Math.max(0, t - kyuyoKojo(t, nenbun));
}

const CHOSEI_JOGEN = 100_000;

/** 所得金額調整控除（措置法41条の3の11第2項） */
export function shotokuKingakuChosei(kyuyoShotokuGaku: number, nenkinZatsu: number): number {
  const g = Math.trunc(kyuyoShotokuGaku), n = Math.trunc(nenkinZatsu);
  if (g <= 0 || n <= 0 || g + n <= CHOSEI_JOGEN) return 0;
  return Math.min(g, CHOSEI_JOGEN) + Math.min(n, CHOSEI_JOGEN) - CHOSEI_JOGEN;
}

const NENKIN_KUBUN_1 = 10_000_000, NENKIN_KUBUN_2 = 20_000_000;

/** 公的年金等控除の区分による減額（B-10）。ta_goukei は退職所得金額を含む */
export function nenkinKojoKubunGen(taGoukei: number): number {
  const g = Math.trunc(taGoukei);
  if (g <= NENKIN_KUBUN_1) return 0;
  return g <= NENKIN_KUBUN_2 ? 100_000 : 200_000;
}

/** 公的年金等に係る雑所得。age は**その年12月31日現在の年齢**（B-13） */
export function nenkinShotoku(age: number, shunyu: number, taGoukei = 0): number {
  const s = Math.trunc(shunyu);
  if (s <= 0) return 0;
  const hiku = nenkinKojoKubunGen(taGoukei);
  if (age >= 65) { if (s <= 3_299_999) return Math.max(0, s - (1_100_000 - hiku)); }
  else { if (s <= 1_299_999) return Math.max(0, s - (600_000 - hiku)); }
  let z: number;
  if (s <= 4_099_999) z = fdiv(s * 75, 100) - 275_000;
  else if (s <= 7_699_999) z = fdiv(s * 85, 100) - 685_000;
  else if (s <= 9_999_999) z = fdiv(s * 95, 100) - 1_455_000;
  else z = s - 1_955_000;
  return Math.max(0, z + hiku);
}

export function nenkinKojo(age: number, shunyu: number, taGoukei = 0): number {
  return Math.trunc(shunyu) - nenkinShotoku(age, shunyu, taGoukei);
}

const KOJO_GOUKEI_JOGEN = 2_800_000;

/** 令和9年分以後の280万円ルール（A-21） */
export function nenkinKojoChosei(age: number, nenkinShunyu: number, kyuyoShunyu: number,
                                 nenbun: number, taGoukei = 0): number {
  const p = nenkinKojo(age, nenkinShunyu, taGoukei);
  if (nenbun < 9 || Math.trunc(kyuyoShunyu) <= 0 || Math.trunc(nenkinShunyu) <= 0) return p;
  const g = kyuyoKojo(kyuyoShunyu, nenbun);
  return p - Math.max(0, g + p - KOJO_GOUKEI_JOGEN);
}

export function nenkinShotokuChosei(age: number, nenkinShunyu: number, kyuyoShunyu: number,
                                    nenbun: number, taGoukei = 0): number {
  return Math.max(0, Math.trunc(nenkinShunyu)
    - nenkinKojoChosei(age, nenkinShunyu, kyuyoShunyu, nenbun, taGoukei));
}

// ---------------------------------------------------------------- 退職所得控除
export const SAITEI_HOSHO = 800_000;
export const SHOGAI_KASAN = 1_000_000;

/** 退職所得控除額の本則（所得税法30条3項のみ。80万円の最低保障を含まない） */
export function taishokuKojoHonsoku(nensu: number): number {
  const y = Math.max(0, Math.trunc(nensu));
  if (y === 0) return 0;
  return y <= 20 ? 400_000 * y : 8_000_000 + 700_000 * (y - 20);
}

/** 所得税法30条6項2号の80万円＋6項3号の障害加算100万円 */
export function kojoSaitei(gaku: number, shogai = false): number {
  const v = Math.max(SAITEI_HOSHO, Math.trunc(gaku));
  return shogai ? v + SHOGAI_KASAN : v;
}

export function taishokuKojo(nensu: number, shogai = false): number {
  const y = Math.max(0, Math.trunc(nensu));
  if (y === 0) return 0;
  return kojoSaitei(taishokuKojoHonsoku(y), shogai);
}

/** 前の退職手当等の収入金額から勤続年数を逆算（国税庁 No.2732） */
export function minashiNensu(shunyu: number): number {
  const s = Math.trunc(shunyu);
  if (s <= 8_000_000) return fdiv(s, 400_000);
  return fdiv(s - 8_000_000, 700_000) + 20;
}

export const GENSEN_MISHUTSU_RITSU = 20;
/** 申告書を出さなかった場合の源泉徴収税額（所得税法201条3項） */
export function gensenMishutsu(shunyu: number, nenbun: number): number {
  const honzei = fdiv(Math.max(0, Math.trunc(shunyu)) * GENSEN_MISHUTSU_RITSU, 100);
  return honzei + uwanose(honzei, nenbun);
}

/** 退職所得の金額（所得税法30条2項） */
export function taishokuShotoku(shunyu: number, kojo: number): number {
  return fdiv(Math.max(0, Math.trunc(shunyu) - Math.trunc(kojo)), 2);
}

export const TANKI_KIJUN = 3_000_000;
export const TANKI_HANTEI_NENSU = 5;
export const TOKUTEI_HANTEI_NENSU = 5;
const ZEN_CHOFUKU_TOKUTEI = 140_000, ZEN_CHOFUKU_TANKI = 130_000;

/** 特定役員退職所得控除額（施行令71条の2） */
export function tokuteiKojo(yakuinNensu: number, bubunChofuku: number, zenChofuku = 0): number {
  const y = Math.max(0, Math.trunc(yakuinNensu));
  const z = Math.min(y, Math.max(0, Math.trunc(zenChofuku)));
  const b = Math.min(y - z, Math.max(0, Math.trunc(bubunChofuku)));
  return 400_000 * (y - b - z) + 200_000 * b + ZEN_CHOFUKU_TOKUTEI * z;
}

/** 短期退職所得控除額（3区分あるとき。施行令71条の2） */
export function tankiKojo3(tankiNensu: number, bubunChofuku: number, zenChofuku = 0): number {
  const t = Math.max(0, Math.trunc(tankiNensu));
  const z = Math.min(t, Math.max(0, Math.trunc(zenChofuku)));
  const b = Math.min(t - z, Math.max(0, Math.trunc(bubunChofuku)));
  return 400_000 * (t - b - z) + 200_000 * b + ZEN_CHOFUKU_TANKI * z;
}

/** 特定役員退職手当等の退職所得の金額（所得税法30条5項）。2分の1にしない */
export function taishokuShotokuTokutei(shunyu: number, kojo: number): number {
  return Math.max(0, Math.trunc(shunyu) - Math.trunc(kojo));
}

// ---------------------------------------------------------------- 人的控除（B-5）
export const DOITSU_SEIKEI_JOGEN = 620_000;
export const HAIGUSHA_TOKUBETSU_JOGEN = 1_330_000;

function haigushaTokubetsuShotokuzei(h: number): number {
  if (h <= 950_000) return 380_000;
  if (h <= 1_300_000) {
    const koeru = h - 930_001;
    const kizami = fdiv(koeru + 30_000, 50_000) * 50_000 - 30_000;
    return Math.max(0, 380_000 - Math.max(0, kizami));
  }
  return 30_000;
}
function haigushaTokubetsuJumin(h: number): number {
  if (h <= 1_000_000) return 330_000;
  if (h <= 1_300_000) {
    const koeru = h - 930_001;
    const kizami = fdiv(koeru + 30_000, 50_000) * 50_000 - 30_000;
    return Math.max(0, 380_000 - Math.max(0, kizami));
  }
  return 30_000;
}

export interface JintekiInit {
  haigusha_shotoku?: number | null; haigusha_rojin?: boolean;
  fuyou_tokutei?: number; fuyou_rojin?: number; fuyou_dokyo_rojin?: number;
  shogai_ippan?: number; shogai_tokubetsu?: number; shogai_dokyo_tokubetsu?: number;
  kafu?: boolean; hitorioya?: boolean;
}

export class Jinteki {
  haigusha_shotoku: number | null = null; haigusha_rojin = false;
  fuyou_tokutei = 0; fuyou_rojin = 0; fuyou_dokyo_rojin = 0;
  shogai_ippan = 0; shogai_tokubetsu = 0; shogai_dokyo_tokubetsu = 0;
  kafu = false; hitorioya = false;
  constructor(init: JintekiInit = {}) { Object.assign(this, init); }

  nin(): number {
    let n = this.fuyou_tokutei + this.fuyou_rojin + this.fuyou_dokyo_rojin;
    if (this.haigusha_shotoku !== null && this.haigusha_shotoku <= DOITSU_SEIKEI_JOGEN) n += 1;
    return n;
  }

  private haigusha(honninGoukei: number, hyoKojo: number[], hyoRojin: number[],
                   hyoTokubetsu: (h: number) => number): number {
    const h = this.haigusha_shotoku;
    if (h === null || honninGoukei > 10_000_000) return 0;
    const dan = honninGoukei <= 9_000_000 ? 0 : (honninGoukei <= 9_500_000 ? 1 : 2);
    if (h <= DOITSU_SEIKEI_JOGEN) return (this.haigusha_rojin ? hyoRojin : hyoKojo)[dan];
    if (h > HAIGUSHA_TOKUBETSU_JOGEN) return 0;
    const moto = hyoTokubetsu(h);
    if (dan === 0) return moto;
    const wari = 3 - dan;
    // Python: -(-(moto * wari) // 30_000) * 10_000  ＝ 1万円未満切上げ
    return -fdiv(-(moto * wari), 30_000) * 10_000;
  }

  shotokuzei(honninGoukei: number): number {
    const v = 270_000 * this.shogai_ippan + 400_000 * this.shogai_tokubetsu
      + 750_000 * this.shogai_dokyo_tokubetsu
      + (this.kafu ? 270_000 : 0) + (this.hitorioya ? 350_000 : 0)
      + 630_000 * this.fuyou_tokutei + 480_000 * this.fuyou_rojin
      + 580_000 * this.fuyou_dokyo_rojin;
    return v + this.haigusha(honninGoukei, [380_000, 260_000, 130_000],
      [480_000, 320_000, 160_000], haigushaTokubetsuShotokuzei);
  }

  jumin(honninGoukei: number): number {
    const v = 260_000 * this.shogai_ippan + 300_000 * this.shogai_tokubetsu
      + 530_000 * this.shogai_dokyo_tokubetsu
      + (this.kafu ? 260_000 : 0) + (this.hitorioya ? 300_000 : 0)
      + 450_000 * this.fuyou_tokutei + 380_000 * this.fuyou_rojin
      + 450_000 * this.fuyou_dokyo_rojin;
    return v + this.haigusha(honninGoukei, [330_000, 220_000, 110_000],
      [380_000, 260_000, 130_000], haigushaTokubetsuJumin);
  }

  /** 調整控除に使う人的控除の差（地方税法37条1号イの表）。（７）は0 */
  sa(honninGoukei: number): number {
    let v = 10_000 * this.shogai_ippan + 100_000 * this.shogai_tokubetsu
      + 220_000 * this.shogai_dokyo_tokubetsu
      + (this.kafu ? 10_000 : 0) + (this.hitorioya ? 50_000 : 0)
      + 180_000 * this.fuyou_tokutei + 100_000 * this.fuyou_rojin
      + 130_000 * this.fuyou_dokyo_rojin;
    const h = this.haigusha_shotoku;
    if (h !== null && h <= DOITSU_SEIKEI_JOGEN && honninGoukei <= 10_000_000) {
      const dan = honninGoukei <= 9_000_000 ? 0 : (honninGoukei <= 9_500_000 ? 1 : 2);
      v += (this.haigusha_rojin ? [100_000, 60_000, 30_000] : [50_000, 40_000, 20_000])[dan];
    }
    return v;
  }
}

// ---------------------------------------------------------------- 住民税
export const KINTOWARI = 5_000;
const JINTEKI_SA = 50_000;
const CHOSEI_KOJO_JOGEN = 25_000_000;
const HIKAZEI_TANKA: Record<number, number> = { 1: 350_000, 2: 315_000, 3: 280_000 };
const HIKAZEI_KASAN: Record<number, number> = { 1: 210_000, 2: 189_000, 3: 168_000 };

/** 住民税の均等割の非課税限度額 */
export function hikazeiGendo(kyuchi = 1, fuyou = 0): number {
  let v = HIKAZEI_TANKA[kyuchi] * (1 + fuyou) + 100_000;
  if (fuyou > 0) v += HIKAZEI_KASAN[kyuchi];
  return v;
}

/** 調整控除（地方税法37条・314条の6）。合計所得2,500万円超は適用しない（B-15） */
export function choseiKojo(kazeiSougou: number, fuyou = 0,
                           goukei: number | null = null, saTsuika = 0): number {
  const b = Math.trunc(kazeiSougou);
  if (b <= 0) return 0;
  if (goukei !== null && Math.trunc(goukei) > CHOSEI_KOJO_JOGEN) return 0;
  const sa = JINTEKI_SA * (1 + fuyou) + Math.trunc(saTsuika);
  if (b <= 2_000_000) return fdiv(Math.min(sa, b) * 5, 100);
  return Math.max(2_500, fdiv(Math.max(0, sa - (b - 2_000_000)) * 5, 100));
}

/** 税額の100円未満切捨て（地方税法20条の4の2第3項） */
export function f100(x: number): number { return fdiv(Math.max(0, Math.trunc(x)), 100) * 100; }

const SHOTOKUWARI_TANKA = 350_000, SHOTOKUWARI_KASAN = 320_000, JUMIN_KASAN_10MAN = 100_000;

export function shotokuwariHikazeiGendo(fuyou = 0): number {
  const n = 1 + Math.max(0, Math.trunc(fuyou));
  let v = SHOTOKUWARI_TANKA * n + JUMIN_KASAN_10MAN;
  if (fuyou > 0) v += SHOTOKUWARI_KASAN;
  return v;
}

/** 逆転防止（税額調整額）を適用したあとの所得割額 */
export function gyakutenBoushi(sanshutsuZei: number, sougouShotoku: number, fuyou = 0): number {
  const z = Math.trunc(sanshutsuZei), s = Math.trunc(sougouShotoku);
  if (z <= 0) return 0;
  const gendo = shotokuwariHikazeiGendo(fuyou);
  if (s <= gendo) return 0;
  const chosei = gendo - (s - z);
  return chosei > 0 ? z - chosei : z;
}

/** 住民税（総合課税分）。市6%・県4%を別々に計算し、それぞれ100円未満切捨て */
export function juminSougou(sougouShotoku: number, kojoTsuika = 0, fuyou = 0,
                            kyuchi = 1, saTsuika = 0, goukei: number | null = null): number {
  const s = Math.trunc(sougouShotoku);
  const g = goukei === null ? s : Math.trunc(goukei);
  if (s <= hikazeiGendo(kyuchi, fuyou)) return 0;
  const b = f1000(s - kisoJumin(s) - kojoTsuika);
  const ch = choseiKojo(b, fuyou, g, saTsuika);
  const shi = f100(Math.max(0, fdiv(b * 6, 100) - fdiv(ch * 3, 5)));
  const ken = f100(Math.max(0, fdiv(b * 4, 100) - fdiv(ch * 2, 5)));
  return gyakutenBoushi(shi + ken, s, fuyou) + KINTOWARI;
}

/** 退職所得の住民税（地方税法328条の3＝市6%／50条の4＝県4%） */
export function juminTaishoku(taishokuShotokuGaku: number): number {
  const t = f1000(taishokuShotokuGaku);
  return f100(fdiv(t * 6, 100)) + f100(fdiv(t * 4, 100));
}

// ---------------------------------------------------------------- 公的年金の増減率
const KURIAGE_TSUKI_MANBUN_KYU = 50, KURIAGE_TSUKI_MANBUN_SHIN = 40, KURISAGE_TSUKI_MANBUN = 70;
export const KURIAGE_SAITEI_AGE = 60;
const KURISAGE_KIJUN_YMD: [number, number, number] = [1952, 4, 2];
const KURIAGE_KIJUN_YMD: [number, number, number] = [1962, 4, 2];

export type Umare = [number, number] | null;

/** 生年月日が基準日以後か。判定できない場合は null */
export function seinengappiIjo(seinen: number, umare: Umare, kijun: [number, number, number]): boolean | null {
  const y = Math.trunc(seinen);
  if (y > kijun[0]) return true;
  if (y < kijun[0]) return false;
  if (umare === null) return null;
  const m = Math.trunc(umare[0]), d = Math.trunc(umare[1]);
  return m > kijun[1] || (m === kijun[1] && d >= kijun[2]);
}

/** 繰下げできる上限の年齢（分からない場合は狭い方の70歳） */
export function kurisageJogenAge(seinen: number, umare: Umare = null): number {
  return seinengappiIjo(seinen, umare, KURISAGE_KIJUN_YMD) ? 75 : 70;
}

/** 公的年金の増減率（1万分率。65歳開始＝10000） */
export function nenkinRitsu(kaishiAge: number, seinen: number, umare: Umare = null): number {
  const a = Math.trunc(kaishiAge);
  const jogen = kurisageJogenAge(seinen, umare);
  if (a < KURIAGE_SAITEI_AGE || a > jogen)
    throw new Error(`公的年金の受け取り開始年齢が範囲外です（${a}歳）。${KURIAGE_SAITEI_AGE}歳から${jogen}歳までです`);
  if (a < 65) {
    const tsuki = (65 - a) * 12;
    const gen = seinengappiIjo(seinen, umare, KURIAGE_KIJUN_YMD)
      ? KURIAGE_TSUKI_MANBUN_SHIN : KURIAGE_TSUKI_MANBUN_KYU;
    return 10_000 - tsuki * gen;
  }
  return 10_000 + (a - 65) * 12 * KURISAGE_TSUKI_MANBUN;
}

export function nenkinGaku(kijunGaku: number, kaishiAge: number, seinen: number, umare: Umare = null): number {
  return fdiv(Math.trunc(kijunGaku) * nenkinRitsu(kaishiAge, seinen, umare), 10_000);
}

// ---------------------------------------------------------------- 在職老齢年金・加給年金
const ZAISHOKU_CHOSEI = 650_000;
const KAKYU_HAIGUSHA = 243_800, KAKYU_TOKUBETSU = 179_900;
const KAKYU_KO_1_2 = 243_800, KAKYU_KO_3 = 81_300;

/** 在職老齢年金で1年間に支給停止される額（厚生年金保険法46条） */
export function zaishokuTeishi(koseiNengaku: number, kyuyoNenshu: number): number {
  const kihon = fdiv(Math.trunc(koseiNengaku), 12);
  const sohoshu = fdiv(Math.trunc(kyuyoNenshu), 12);
  if (kihon <= 0 || kihon + sohoshu <= ZAISHOKU_CHOSEI) return 0;
  const teishi = fdiv(kihon + sohoshu - ZAISHOKU_CHOSEI, 2);
  return Math.min(kihon, teishi) * 12;
}

/**
 * 【2026-09-03・A-2a4】在職老齢年金で、老齢厚生年金（報酬比例部分）が**全額支給停止**になるか。
 *
 * 日本年金機構「在職老齢年金の計算方法」
 *   用語の説明 …「基本月額」＝**加給年金額を除いた**老齢厚生（退職共済）年金（報酬比例部分）の月額
 *   留意事項  …「年金支給月額がマイナスになる場合は、老齢厚生年金（**加給年金額を含む**）は
 *                全額支給停止となります」
 *   https://www.nenkin.go.jp/service/jukyu/seido/roureinenkin/zaishoku/20150401-01.html
 *
 * ★★**式は `zaishokuTeishi` に1本だけ**。ここでは「返りが `kihon * 12` か」で全額停止を見ます
 *   （式を2本にしない・`kaihatsu_20260903p.md` 1番）。
 * ★`kihon` が 0 のときを全額停止と読まないこと（`0 >= 0` が真になり、報酬比例が無い方の
 *   加給年金まで消えます・`senjutsu_20260903k.md` 4番の門A）。
 */
export function zaishokuZengakuTeishi(koseiNengaku: number, kyuyoNenshu: number): boolean {
  const kihon = fdiv(Math.trunc(koseiNengaku), 12);
  return kihon > 0 && zaishokuTeishi(koseiNengaku, kyuyoNenshu) === kihon * 12;
}

/** 加給年金額の年額（配偶者が65歳未満であることは呼ぶ側で判定する） */
export function kakyuNenkin(ukeSeinen: number, haigushaSeinen: number | null, koNin = 0): number {
  let gaku = 0;
  if (haigushaSeinen !== null) {
    gaku += KAKYU_HAIGUSHA;
    if (Math.trunc(ukeSeinen) >= 1944) gaku += KAKYU_TOKUBETSU;
  }
  const n = Math.max(0, Math.trunc(koNin));
  gaku += KAKYU_KO_1_2 * Math.min(2, n) + KAKYU_KO_3 * Math.max(0, n - 2);
  return gaku;
}
