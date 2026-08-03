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

/** 雑所得 z に対するその年の税（所得税＝基礎控除48万・復興税込み切捨て／住民税＝基礎控除43万・10%）。 */
function yearlyTax(z: number): number {
  const income = Math.floor(incomeTaxBase(Math.max(0, z - 480_000)) * 1.021);
  const resident = Math.max(0, z - 430_000) * 0.10;
  return income + resident;
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
