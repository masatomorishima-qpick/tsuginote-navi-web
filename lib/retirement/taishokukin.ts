/**
 * lib/retirement/taishokukin.ts
 *
 * 退職金の受け取り方（一時金／年金／併用）の手取り計算（2026-08-03 新設・駅1指示書3-1）。
 *
 * 設計方針：
 * - UI・DOMに依存しない純関数。node --experimental-strip-types で直接検算できる形にする
 *   （記事9の掲載数値・完了条件2の期待値はこのファイルの関数から再現する）。
 * - lib/shisan/calc.ts とは独立。住宅ローン・家計診断とは計算の系統が違うため参照しない。
 * - 制度パラメータ（控除・速算表）は一次資料（国税庁）に対応する定数としてここに集約し、
 *   税制改正時はこのファイルだけを更新する（年式運用の共通資産・事業戦略まとめ§4）。
 *
 * 前提（記事9・ツール注記と同一）：
 * - 60歳で退職し、年金形式は60歳受け取り開始。60〜64歳は他の収入なし、65歳以降は公的年金と合算
 * - 所得控除は基礎控除のみ（所得税48万円・住民税43万円）
 * - 国民健康保険料・介護保険料は「増えた雑所得の約10%」の目安（自治体差・賦課限度額は未考慮）
 * - 復興特別所得税（×1.021）を含む。住民税は一律10%
 * - 勤続5年以下・役員等・iDeCo等との近接受取の特例には対応しない（ツール側の注記で明示）
 *
 * 丸め仕様（完了条件2の報告対象）：
 * - 課税退職所得：千円未満切捨て
 * - 一時金の所得税：復興税を乗じた後に1円未満切捨て。住民税は課税退職所得×10%（整数）
 * - 年金の各年の所得税：復興税を乗じた後に1円未満切捨て。住民税・社保目安は小数のまま年次合計し、
 *   合計後も丸めない（表示側で円単位に丸める）。このため期待値と数円の差が出る（万円単位で一致）
 */

// v2.0（2026-08-04）：繰下げの増額率などの制度定数は constants.ts に集約（年次改定はそこだけ）。
import { PENSION_START_AGES, LIFESPANS, kurisageMultiplier } from './constants';

/* ===== 制度パラメータ（2026-08-03 時点・出典は記事9の出典欄） ===== */

/** 退職所得控除（国税庁 No.1420）。勤続年数は1年未満切り上げ済みの整数を渡す。 */
export function taishokuKojo(years: number): number {
  if (years <= 20) return Math.max(800_000, 400_000 * years);
  return 8_000_000 + 700_000 * (years - 20);
}

/** 所得税の速算表（復興税抜き・国税庁）。
 *  指示書3-1は1,800万円以下までだったが、入力上限（退職金1億・勤続1年）で課税退職所得が
 *  約4,960万円に達しうるため、40%・45%の2区分を追加した（2026-08-03 masato承認）。 */
export function incomeTaxBase(taxable: number): number {
  if (taxable <= 0) return 0;
  if (taxable <= 1_950_000) return taxable * 0.05;
  if (taxable <= 3_300_000) return taxable * 0.10 - 97_500;
  if (taxable <= 6_950_000) return taxable * 0.20 - 427_500;
  if (taxable <= 9_000_000) return taxable * 0.23 - 636_000;
  if (taxable <= 18_000_000) return taxable * 0.33 - 1_536_000;
  if (taxable <= 40_000_000) return taxable * 0.40 - 2_796_000;
  return taxable * 0.45 - 4_796_000;
}

/** 公的年金等控除後の雑所得（国税庁の速算表。収入1,000万円以下・他の所得1,000万円以下の場合）。 */
export function pensionZatsu(income: number, over65: boolean): number {
  if (over65) {
    if (income <= 1_100_000) return 0;
    if (income < 3_300_000) return income - 1_100_000;
  } else {
    if (income <= 600_000) return 0;
    if (income < 1_300_000) return income - 600_000;
  }
  if (income < 4_100_000) return income * 0.75 - 275_000;
  if (income < 7_700_000) return income * 0.85 - 685_000;
  if (income < 10_000_000) return income * 0.95 - 1_455_000;
  return income - 1_955_000;
}

/* ===== 各プランの計算 ===== */

export interface LumpResult {
  net: number;          // 手取り
  taxable: number;      // 課税退職所得（千円未満切捨て後）
  incomeTax: number;    // 所得税（復興税込み・1円未満切捨て）
  residentTax: number;  // 住民税
  kojo: number;         // 退職所得控除
}

/** 全額一時金。円単位で確定する（丸めは仕様どおり）。 */
export function lumpSumPlan(amount: number, years: number): LumpResult {
  const kojo = taishokuKojo(years);
  const taxableRaw = Math.max(0, amount - kojo) / 2;
  const taxable = Math.floor(taxableRaw / 1000) * 1000; // 千円未満切捨て
  const incomeTax = Math.floor(incomeTaxBase(taxable) * 1.021);
  const residentTax = Math.round(taxable * 0.10);
  return { net: amount - incomeTax - residentTax, taxable, incomeTax, residentTax, kojo };
}

/** 公的年金等の雑所得 z にかかる所得税＋住民税（復興税込み）。
 *  課税標準（所得税＝雑所得−48万／住民税＝雑所得−43万）に千円未満切捨てを適用する
 *  （国税通則法118条1項・地方税法20条の4の2第1項。退職所得側 lumpSumPlan と同じ扱い・2026-08-04 C対応）。
 *  切捨ての定義はこの1か所に集約し、v1（yearlyTax）と v2.0（yearBurden）の両方から呼ぶ。
 *  ※国保・介護の目安（雑所得×10%）は税ではないため、この関数では扱わない（呼び出し側で加算）。 */
function zatsuTax(z: number): { incomeTax: number; residentTax: number } {
  const incomeBase = Math.floor(Math.max(0, z - 480_000) / 1000) * 1000;   // 課税標準の千円未満切捨て
  const residentBase = Math.floor(Math.max(0, z - 430_000) / 1000) * 1000; // 同上（住民税）
  return {
    incomeTax: Math.floor(incomeTaxBase(incomeBase) * 1.021),
    residentTax: residentBase * 0.10,
  };
}

/** 雑所得 z に対するその年の税（所得税＋住民税）。課税標準の端数処理は zatsuTax に集約。 */
function yearlyTax(z: number): number {
  const { incomeTax, residentTax } = zatsuTax(z);
  return incomeTax + residentTax;
}

export interface PensionResult {
  net: number;      // 手取り（総額 − 負担増合計）
  annual: number;   // 年額（元利均等・規程の利率で終価計算）
  total: number;    // 受取総額
  growth: number;   // 運用による増分（総額 − 元本）
  burden: number;   // 税・社保（目安）の増加合計
}

/** 全額年金（60歳受け取り開始）。元本 P を利率 r・n 年の年金現価で年額化する。 */
export function pensionPlan(P: number, ratePct: number, n: number, publicPension: number): PensionResult {
  const r = ratePct / 100;
  const annual = r === 0 ? P / n : (P * r) / (1 - Math.pow(1 + r, -n));
  const total = annual * n;
  let burden = 0;
  for (let y = 0; y < n; y++) {
    const over65 = 60 + y >= 65;
    const base = over65 ? publicPension : 0; // 60〜64歳は公的年金0（60歳退職・他収入なしの前提）
    const zWith = pensionZatsu(base + annual, over65);
    const zBase = pensionZatsu(base, over65);
    // 負担増 = 税の増分 + 社保目安（増えた雑所得の10%）
    burden += yearlyTax(zWith) - yearlyTax(zBase) + (zWith - zBase) * 0.10;
  }
  return { net: total - burden, annual, total, growth: total - P, burden };
}

export interface HeiyoResult {
  lumpPart: number;       // 一時金部分（＝控除額。税0円）
  pensionPart: number;    // 年金に回す元本（＝控除の超過分）
  pension: PensionResult; // 超過分の年金計算
  net: number;            // 手取り合計
}

/** 併用（控除額まで一時金・超過分を年金）。退職金≦控除のときは null（表示しない）。 */
export function heiyoPlan(
  amount: number, years: number, ratePct: number, n: number, publicPension: number,
): HeiyoResult | null {
  const kojo = taishokuKojo(years);
  if (amount <= kojo) return null;
  const pensionPart = amount - kojo;
  const pension = pensionPlan(pensionPart, ratePct, n, publicPension);
  return { lumpPart: kojo, pensionPart, pension, net: kojo + pension.net };
}

/* ===== ツール用の一括計算 ===== */

export interface TaishokukinInput {
  years: number;         // 勤続年数（整数 1〜50）
  amount: number;        // 退職金額（円 100万〜1億）
  ratePct: number;       // 規程の利率（% 0〜5.00）
  receiveYears: number;  // 受取年数（5/10/15/20）
  publicPension: number; // 65歳からの公的年金 年額（円 0〜500万）
}

export interface PlanComparison {
  kojo: number;
  lump: LumpResult;
  pension: PensionResult;
  heiyo: HeiyoResult | null;
  /** 手取りの大きい順。'lump' | 'pension' | 'heiyo' */
  ranking: Array<'lump' | 'pension' | 'heiyo'>;
}

export function comparePlans(input: TaishokukinInput): PlanComparison {
  const { years, amount, ratePct, receiveYears, publicPension } = input;
  const lump = lumpSumPlan(amount, years);
  const pension = pensionPlan(amount, ratePct, receiveYears, publicPension);
  const heiyo = heiyoPlan(amount, years, ratePct, receiveYears, publicPension);
  const entries: Array<['lump' | 'pension' | 'heiyo', number]> = [
    ['lump', lump.net],
    ['pension', pension.net],
  ];
  if (heiyo) entries.push(['heiyo', heiyo.net]);
  entries.sort((a, b) => b[1] - a[1]);
  return { kojo: lump.kojo, lump, pension, heiyo, ranking: entries.map((e) => e[0]) };
}

/** 表示用：円 → 「2,084万円」形式（万円未満切捨てだと期待値表とずれるため四捨五入）。 */
export function manDisp(yenValue: number): string {
  return `${Math.round(yenValue / 10_000).toLocaleString('ja-JP')}万`;
}

/* =====================================================================
 * v2.0：年金の受け取り開始年齢との組み合わせ（2026-08-04 追加）
 *
 * 退職金の受け取り方（全額年金）と、老齢年金の受け取り開始年齢は別々に決められない。
 * 65歳から老齢年金を受け取ると 65〜69歳は企業年金と合算されて課税されるが、
 * 繰り下げるとその期間は企業年金だけになり、企業年金の税負担も下がる——という相互作用を、
 * 「全額年金」を選んだ場合の生涯手取りで比較する。
 *
 * 重要：既存の pensionPlan / comparePlans / lumpSumPlan には一切触れない（完了条件5）。
 *   pensionPlan は「公的年金のみとの増分」を企業年金の受取期間だけ計算する別概念のため、
 *   ここは 60歳〜想定寿命の絶対額を合計する新しい純関数として分離する（v2.0指示書1・masato確定）。
 *
 * 前提（v2.0指示書2-2・注記6〜10）：
 * - 全額年金（退職金全額を受取年数で年金化）。企業年金は 60〜(60+受取年数−1) 歳に受け取る
 * - 老齢年金は入力の「65歳からの公的年金額」を起点に、開始年齢 S で繰下げ増額する
 * - 60〜64歳は他の収入なし（在職老齢年金・給与は未計算）。加給年金・分割繰下げも未計算
 * - 各年：雑所得＝公的年金等控除後、負担＝所得税(基礎48万・復興税後1円未満切捨て)
 *   ＋住民税(基礎43万・10%)＋国保介護の目安(雑所得×10%)。手取り＝収入−負担
 * - 生涯手取り＝60歳〜想定寿命(inclusive)の手取りの合計
 *
 * 丸め：v1と揃える（所得税のみ復興税後に1円未満切捨て。住民税・社保目安は小数のまま
 *   年次合計し、合計後も丸めない＝表示側で円に丸める）。
 * ===================================================================== */

/** 企業年金の年額（全額年金）。v1 pensionPlan と同じ式（annual は publicPension 非依存）。 */
function corpAnnual(amount: number, ratePct: number, receiveYears: number): number {
  const r = ratePct / 100;
  return r === 0 ? amount / receiveYears : (amount * r) / (1 - Math.pow(1 + r, -receiveYears));
}

/** 繰下げ後の老齢年金 年額（円・整数）。表示（表2）と計算で同じ整数値を使うために四捨五入する。
 *  0.007×120 が二進で 0.8399… となり publicPension×倍率 が 4,047,999.99… に落ちる浮動小数点誤差で、
 *  課税標準の千円未満切捨てが系統的に1,000円下振れするのを防ぐ（2026-08-04 C対応・masato確定）。
 *  ※企業年金の年額（corpAnnual）は年金原資の計算結果で丸い値にならないため丸めない（v2.1で見直し）。 */
function roundedOap(publicPension: number, startAge: number): number {
  return Math.round(publicPension * kurisageMultiplier(startAge));
}

/** ある1年の負担（所得税＋住民税＋国保介護の目安）。income はその年の公的年金等の収入。 */
function yearBurden(income: number, over65: boolean): number {
  const z = pensionZatsu(income, over65);
  const { incomeTax, residentTax } = zatsuTax(z); // 課税標準の千円未満切捨ては zatsuTax に集約
  const shaho = z * 0.10; // 国保・介護の目安（税ではないため千円未満切捨ての対象外）
  return incomeTax + residentTax + shaho;
}

/** 老齢年金の開始年齢 S を受け取ったときの、60歳〜life歳(inclusive)の生涯手取り。 */
function lifetimeNet(
  annual: number, receiveYears: number, publicPension: number, startAge: number, life: number,
): number {
  const oap = roundedOap(publicPension, startAge); // 繰下げ後の老齢年金 年額（整数）
  const corpLastAge = 60 + receiveYears - 1;                // 企業年金の最終受取年齢
  let sum = 0;
  for (let age = 60; age <= life; age++) {
    const corp = age >= 60 && age <= corpLastAge ? annual : 0;
    const pension = age >= startAge ? oap : 0;
    const income = corp + pension;
    sum += income - yearBurden(income, age >= 65);
  }
  return sum;
}

export interface PensionStartAnnual {
  startAge: number;   // 65 / 70 / 75
  annual: number;     // 繰下げ後の老齢年金 年額
  increasePct: number; // 増額率（%）。65歳は0
}

export interface LifespanRow {
  life: number;                                  // 80 / 85 / 90 / 95
  byStart: Array<{ startAge: number; net: number }>; // 開始年齢ごとの生涯手取り
  bestStartAge: number;                          // その行で生涯手取りが最大の開始年齢
}

export interface PensionStartComparison {
  corpAnnual: number;                    // 企業年金の年額（全額年金）
  corpLastAge: number;                   // 企業年金の最終受取年齢（60+受取年数−1）
  oapAnnuals: PensionStartAnnual[];      // 表2：老齢年金の年額（65/70/75）
  /** 企業年金期間（60〜69歳）の税・社保の合計。開始年齢ごと（分解表示用）。 */
  corpPeriodBurden: Array<{ startAge: number; burden: number }>;
  /** 表1：生涯手取りの比較（想定寿命 × 開始年齢）。 */
  lifespanRows: LifespanRow[];
}

/**
 * 年金の受け取り開始年齢の比較（全額年金前提）。既存の3案比較とは独立した別の量。
 * 追加入力なし（現行の5項目だけで計算できる）。
 */
export function pensionStartComparison(input: TaishokukinInput): PensionStartComparison {
  const { amount, ratePct, receiveYears, publicPension } = input;
  const annual = corpAnnual(amount, ratePct, receiveYears);
  const corpLastAge = 60 + receiveYears - 1;

  const oapAnnuals: PensionStartAnnual[] = PENSION_START_AGES.map((startAge) => {
    const m = kurisageMultiplier(startAge);
    return { startAge, annual: roundedOap(publicPension, startAge), increasePct: Math.round((m - 1) * 100) };
  });

  // 企業年金期間（60〜69歳・固定）の税社保合計。開始年齢で 65〜69 に老齢年金が乗るかが変わる。
  const corpPeriodBurden = PENSION_START_AGES.map((startAge) => {
    const oap = roundedOap(publicPension, startAge);
    let burden = 0;
    for (let age = 60; age <= 69; age++) {
      const corp = age <= corpLastAge ? annual : 0;
      const pension = age >= startAge ? oap : 0;
      burden += yearBurden(corp + pension, age >= 65);
    }
    return { startAge, burden };
  });

  const lifespanRows: LifespanRow[] = LIFESPANS.map((life) => {
    const byStart = PENSION_START_AGES.map((startAge) => ({
      startAge,
      net: lifetimeNet(annual, receiveYears, publicPension, startAge, life),
    }));
    const bestStartAge = byStart.reduce((a, b) => (b.net > a.net ? b : a)).startAge;
    return { life, byStart, bestStartAge };
  });

  return { corpAnnual: annual, corpLastAge, oapAnnuals, corpPeriodBurden, lifespanRows };
}
