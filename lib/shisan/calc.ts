/**
 * lib/shisan/calc.ts
 *
 * /shisan 資産づくり診断の計算エンジン（共有モジュール）。
 * Phase 1「伴走AI」（要件定義書_20260706 §6）でクライアント（診断画面）と
 * サーバー（chat API のコンテキスト生成）の両方から参照するために
 * AssetConciergeMvp.tsx から挙動不変で切り出したもの。
 *
 * 原則：AIに計算させない。ここにある検証済みの計算だけが数字の出所。
 */

/* ===== 定数 ===== */
export const RET_AGE = 65;
export const REFI_BASE = 0.7; // 借り換え試算の内部基準金利(%)・画面に明示・手動更新可
export const EDU_PLANS = { kokukou: 400, shibun: 550, shiri: 700 } as const; // 万円・目安
export type EduPlan = keyof typeof EDU_PLANS;
export const SURPLUS_THIN = 30000; // 円/月・余力が薄いライン（仮）

/* ===== 型 ===== */
export interface Inputs {
  age: number; income: number; assets: number;
  surplus: number;   // 毎月の投資・貯蓄余力（円）
  living: number;    // 毎月の生活費ざっくり（円）
  hasMortgage: boolean; mBal: number; mYears: number; mRate: number; mType: string;
  childAges: number[];
  eduPlan: EduPlan;
  target: number;    // 65歳での目標額
  r: number;         // 想定リターン（%）ユーザーが置く
}
export type BucketId = "liq" | "edu" | "refi" | "prepay" | "nisa";
export interface Decision { choice: string; }

/* ===== 表示ラベル ===== */
export const SCENARIO_PHASE: Record<"A" | "B" | "C", string> = {
  A: "教育費と老後準備の両立フェーズ",
  B: "準備を先に進めるフェーズ",
  C: "家計の土台を固めるフェーズ",
};
export const BUCKET_LABEL: Record<BucketId, string> = {
  liq: "もしもの備え", edu: "教育費", refi: "借り換え",
  prepay: "繰り上げ返済と投資", nisa: "NISAの非課税枠",
};

/* ===== 表示ヘルパー ===== */
export const yen = (n: number) => Math.round(n).toLocaleString("ja-JP");
export const man = (n: number) => Math.round(n / 10000).toLocaleString("ja-JP");
export const annFactor = (n: number, rate: number) => (rate === 0 ? n : (Math.pow(1 + rate, n) - 1) / rate);

/* ===== 計算 ===== */
export function loanPayment(B: number, ratePct: number, years: number): number {
  const i = ratePct / 100 / 12, N = years * 12;
  if (N <= 0) return 0;
  if (i === 0) return B / N;
  return (B * i) / (1 - Math.pow(1 + i, -N));
}
export function totalInterest(B: number, ratePct: number, years: number): number {
  return loanPayment(B, ratePct, years) * years * 12 - B;
}
export function prepayCompression(B: number, ratePct: number, years: number, prepay: number): number {
  const i = ratePct / 100 / 12;
  if (i === 0 || years <= 0 || B <= 0) return 0;
  const payment = loanPayment(B, ratePct, years);
  const newBal = B - prepay;
  if (newBal <= 0) return totalInterest(B, ratePct, years);
  const newN = -Math.log(1 - (newBal * i) / payment) / Math.log(1 + i);
  if (!isFinite(newN) || newN <= 0) return 0;
  const after = payment * newN - newBal;
  return Math.max(0, totalInterest(B, ratePct, years) - after);
}
export function refinance(B: number, curRate: number, years: number) {
  if (B <= 0 || years <= 0) return null;
  const mNow = loanPayment(B, curRate, years);
  const mNew = loanPayment(B, REFI_BASE, years);
  const dMonthly = Math.max(0, mNow - mNew);
  const dInterest = Math.max(0, totalInterest(B, curRate, years) - totalInterest(B, REFI_BASE, years));
  const cost = Math.round(B * 0.022 + 100000); // 諸費用概算（事務手数料2.2%＋登記等10万）
  const months = dMonthly > 0 ? Math.ceil(cost / dMonthly) : Infinity;
  return { mNow, mNew, dMonthly, dInterest, cost, months };
}
export function eduMonthly(ages: number[], plan: EduPlan): number {
  const cost = EDU_PLANS[plan] * 10000;
  let sum = 0;
  ages.forEach((a) => { const m = Math.max(0, 18 - a) * 12; if (m > 0) sum += cost / m; });
  return Math.round(sum);
}

/* ===== 実行申告の数字反映（修正指示書_20260707 修正B・二重計上防止の核心） =====
 * 反映ルール（Q3/Q4回答済み・decisionsが数字の唯一の正）：
 * - refi（借り換え）：診断に織り込み済み（decide「進める」で月々減がpoolに加算済み）
 *     ・done＋金額あり → 「申告額 − 診断見込み額」の差分のみ調整（見込み¥7,298に申告¥7,298なら調整0）
 *     ・done＋金額空欄 → 見込み通りの実行とみなし調整0（Q3a）
 *     ・decide「しない/未決定」でdone＋金額 → 織り込みがないため全額加算（Q3b）
 *     ・decide「進める」×申告「やめた」 → 調整しない。食い違いフラグを立て、AIでの解消を促す（Q3c）
 * - liq/edu/prepay/nisa：余力の配分であり余力を増やさない → 加算しない（記録・表示のみ・Q4）
 * - 将来の固定費・収入系：診断に数値なし → 加算（今回は対象外）
 * マイページ・チャットコンテキスト・申告即時フィードバックはすべてこの関数の値を使う（一箇所集約）。
 * 診断画面（/shisan）は従来通り診断ベースのみ表示（Q5＝役割分担：診断＝現在地／マイページ＝実行反映後）。 */
export interface ReportEntry { status: string; monthly_amount: number | null; }
export interface ExecutionAdjusted {
  adjustment: number;               // 実効余力への調整（円/月）
  base: ComputedResult | null;      // 診断ベースの試算
  effective: ComputedResult | null; // 実効（調整反映後）。調整0なら base と同一参照
  recalcApplied: boolean;           // 調整が発生しているか
  refiMismatch: boolean;            // decide「進める」×申告「やめた」の食い違い
}
export function applyExecutionAdjustments(
  inputs: Inputs | null,
  decisions: Partial<Record<BucketId, Decision>>,
  reports: Record<string, ReportEntry>,
  planAmounts: PlanAmounts = {},
): ExecutionAdjusted {
  const base = computeResult(inputs, decisions, planAmounts);
  let adjustment = 0;
  let refiMismatch = false;

  if (inputs) {
    const r = reports["refi"];
    if (r) {
      const refiCalc = inputs.hasMortgage ? refinance(inputs.mBal, inputs.mRate, inputs.mYears) : null;
      const expected = decisions.refi?.choice === "進める" && refiCalc ? Math.round(refiCalc.dMonthly) : 0;
      if (r.status === "done") {
        if (decisions.refi?.choice === "進める") {
          adjustment = (r.monthly_amount ?? expected) - expected; // 差分のみ（空欄＝見込み通り＝0）
        } else {
          adjustment = r.monthly_amount ?? 0; // 織り込みなし → 全額加算
        }
      } else if (r.status === "stopped" && decisions.refi?.choice === "進める") {
        refiMismatch = true; // 調整せず、解消をユーザーに促す（Q3c）
      }
    }
    // liq/edu/prepay/nisa は調整なし（記録のみ）
  }

  const effective = adjustment !== 0 && inputs
    ? computeResult({ ...inputs, surplus: inputs.surplus + adjustment }, decisions, planAmounts)
    : base;

  return { adjustment, base, effective, recalcApplied: adjustment !== 0, refiMismatch };
}

/* ===== 判定 ===== */
/** シナリオ自動判定（A/B/C）。評価順序が優先順位：①C（余力が薄い）→②A（未成年の子あり）→③B（既定）。
 *  余力0以下は null（別出口・打ち手を出さない）。 */
export function judgeScenario(inputs: Inputs | null): "A" | "B" | "C" | null {
  if (!inputs) return null;
  if (inputs.surplus <= 0) return null;
  if (inputs.surplus < SURPLUS_THIN) return "C";
  if (inputs.childAges.some((a) => a < 18)) return "A";
  return "B";
}
/** 該当バケツ（意思決定すべき質問）の導出 */
export function deriveBuckets(inputs: Inputs | null): BucketId[] {
  if (!inputs) return [];
  const b: BucketId[] = ["liq"];
  if (inputs.childAges.length > 0) b.push("edu");
  if (inputs.hasMortgage && inputs.mBal > 0) { b.push("refi"); if (inputs.surplus > 0) b.push("prepay"); }
  if (inputs.surplus > 0) b.push("nisa");
  return b;
}

/* ===== 試算結果（A'案3ブロック。診断画面の表示値と同一ロジック） =====
 * 追加要件A（マイページ）でサーバー側からも同じ表示値を出すため、
 * AssetConciergeMvp.tsx の result useMemo から挙動不変で切り出したもの。 */
export interface ComputedResult {
  n: number; yutori: number; pool: number; bei: number; edu: number;
  kuriage: number; toushi: number; mihai: number; nisaUsed: boolean;
  future: number; achieve: number; eduCrowdsOut: boolean;
  planOverflow: number; // 方針金額の合計が余力を超えた分（0=正常。超過は警告表示・計算は余力でクリップ）
}
/** 方針の毎月金額（liq/edu/prepay/nisa＝配分に反映。refiは削減目標のため対象外・Q1(a)） */
export type PlanAmounts = Partial<Record<BucketId, number>>;

export function computeResult(
  inputs: Inputs | null,
  decisions: Partial<Record<BucketId, Decision>>,
  planAmounts: PlanAmounts = {},
): ComputedResult | null {
  if (!inputs) return null;
  const n = Math.max(0, RET_AGE - inputs.age);
  const r = inputs.r / 100;
  const i = inputs.mRate / 100;
  const S = inputs.surplus;
  const assetsYen = inputs.assets;
  const livingTarget = inputs.living * 6;

  // ブロック1：毎月生まれたゆとり（借換で手取り純増。＋のみ）
  const refi = inputs.hasMortgage ? refinance(inputs.mBal, inputs.mRate, inputs.mYears) : null;
  const yutori = decisions.refi?.choice === "進める" && refi ? Math.round(refi.dMonthly) : 0;

  // ブロック2：毎月の余力の使い道（優先カスケード。方針金額があればその額を優先＝Q1(a)。
  // 合計が余力を超える場合は余力を上限にクリップし、planOverflow で警告用に返す）
  const pool = S + yutori;
  const wanted = (b: BucketId) => {
    const v = planAmounts[b];
    return typeof v === "number" && isFinite(v) && v > 0 ? Math.round(v) : null;
  };
  const allocSum = (["liq", "edu", "prepay", "nisa"] as BucketId[])
    .reduce((s, b) => s + (wanted(b) ?? 0), 0);
  const planOverflow = Math.max(0, allocSum - pool);

  let remaining = pool;
  let bei = 0;
  const liqPlan = wanted("liq");
  if (liqPlan != null) {
    bei = Math.min(remaining, liqPlan); // 方針額を優先（クリップ）
  } else if (decisions.liq && decisions.liq.choice !== "今は見送る") {
    const gap = Math.max(0, livingTarget - assetsYen);
    bei = gap > 0 ? Math.min(remaining, Math.round(gap / 12)) : 0;
  }
  remaining -= bei;
  let edu = 0;
  const eduPlanAmt = wanted("edu");
  if (eduPlanAmt != null) {
    edu = Math.min(remaining, eduPlanAmt);
  } else if (decisions.edu) {
    const need = eduMonthly(inputs.childAges, inputs.eduPlan);
    if (decisions.edu.choice === "必要額を積む") edu = Math.min(remaining, need);
    else if (decisions.edu.choice === "一部を積む") edu = Math.min(remaining, Math.round(need / 2));
  }
  remaining -= edu;
  let kuriage = 0, toushi = 0;
  const prepayPlan = wanted("prepay");
  const nisaPlan = wanted("nisa");
  if (prepayPlan != null || nisaPlan != null) {
    // 方針金額を優先：prepay額は選択に応じて分割、nisa額は投資へ（残余はすべて未配分に）
    let amt = Math.min(remaining, prepayPlan ?? 0);
    if (decisions.prepay?.choice === "繰上げ中心") kuriage = amt;
    else if (decisions.prepay?.choice === "投資中心") toushi = amt;
    else { kuriage = Math.round(amt / 2); toushi = amt - kuriage; }
    remaining -= amt;
    amt = Math.min(remaining, nisaPlan ?? 0);
    toushi += amt;
    remaining -= amt;
  } else if (decisions.prepay) {
    const amt = remaining;
    if (decisions.prepay.choice === "繰上げ中心") kuriage = amt;
    else if (decisions.prepay.choice === "投資中心") toushi = amt;
    else if (decisions.prepay.choice === "両方に分ける") { kuriage = Math.round(amt / 2); toushi = amt - kuriage; }
    remaining -= (kuriage + toushi);
  }
  const mihai = Math.max(0, remaining);
  const nisaUsed = decisions.nisa?.choice === "枠を使う";

  // ブロック3：65歳見込み（配分反映・目安）
  const grow = (m: number, rate: number) => m * 12 * annFactor(n, rate);
  const future =
    assetsYen * Math.pow(1 + r, n) +
    grow(toushi, r) +
    grow(kuriage, i) +
    (bei + edu + mihai) * 12 * n;
  const achieve = Math.min(999, Math.round((future / inputs.target) * 100));
  const eduCrowdsOut = edu > 0 && kuriage === 0 && toushi === 0 && mihai === 0;

  return { n, yutori, pool, bei, edu, kuriage, toushi, mihai, nisaUsed, future, achieve, eduCrowdsOut, planOverflow };
}

/* ===== 配分変更の計算（修正指示書_20260707・修正1「配分変更の構造化」） =====
 * LLMは意図抽出のみ。ここが唯一の配分計算＝三段構えの「サーバー計算」。
 * 入口検証：target単体が余力超→over_pool。
 * (a) 増額が余力内に収まる→未配分/下流がカスケードで自動吸収（sourceは無理に削らない）。
 * (b) 明示方針の合計が余力超→指定sourceの方針額を削って収める。
 * (c) source未指定かつ収まらない→need_source（AIが「どこから？」と1回聞く）。 */
const ALLOC_BUCKETS: BucketId[] = ["liq", "edu", "prepay", "nisa"];

/** 配分表の行（承認カード／マイページのプレビュー用・合計＝余力） */
export function allocationRows(res: ComputedResult): { key: string; label: string; amount: number }[] {
  return [
    { key: "bei", label: "もしもの備え", amount: res.bei },
    { key: "edu", label: "教育費", amount: res.edu },
    { key: "kuriage", label: "繰上げ返済", amount: res.kuriage },
    { key: "toushi", label: res.nisaUsed ? "投資（NISA枠）" : "投資", amount: res.toushi },
    { key: "mihai", label: "未配分", amount: res.mihai },
  ];
}

export interface ReallocResult {
  ok: boolean;
  error?: "over_pool" | "need_source";
  poolYen?: number;                 // 余力（＝配分表の合計・over_pool時の上限）
  beforeRows?: { key: string; label: string; amount: number }[];
  afterRows?: { key: string; label: string; amount: number }[];
  proposed?: PlanAmounts;           // 保存すべき方針額（target・必要ならsourceも）
  changedKeys?: BucketId[];         // 保存対象バケツ（target＋削ったsource）
  targetLabel?: string;
}

export function computeRealloc(
  inputs: Inputs | null,
  decisions: Partial<Record<BucketId, Decision>>,
  current: PlanAmounts,
  target: BucketId,
  monthlyYen: number,
  source: string | null,
  reports: Record<string, ReportEntry> = {},
): ReallocResult {
  if (!inputs) return { ok: false };
  // 実効余力（実行申告の調整反映後）で計算＝マイページ・公式説明と同一の余力を使う（実機検証で発見した不整合の修正）
  const adj = applyExecutionAdjustments(inputs, decisions, reports, current);
  const effInputs: Inputs = adj.adjustment !== 0 ? { ...inputs, surplus: inputs.surplus + adj.adjustment } : inputs;
  const base = computeResult(effInputs, decisions, current);
  if (!base) return { ok: false };
  const pool = base.pool;

  // 入口検証：target単体が余力超（source分岐以前）
  if (monthlyYen > pool) return { ok: false, error: "over_pool", poolYen: pool };

  const proposed: PlanAmounts = { ...current };
  if (monthlyYen > 0) proposed[target] = monthlyYen; else delete proposed[target];
  const changedKeys: BucketId[] = [target];

  const explicitSum = () => ALLOC_BUCKETS.reduce((s, b) => s + (proposed[b] ?? 0), 0);
  let overflow = Math.max(0, explicitSum() - pool);

  if (overflow > 0) {
    const src = ALLOC_BUCKETS.includes(source as BucketId) ? (source as BucketId) : null;
    if (src && src !== target && (proposed[src] ?? 0) > 0) {
      const reduced = Math.max(0, (proposed[src] ?? 0) - overflow);
      if (reduced > 0) proposed[src] = reduced; else delete proposed[src];
      changedKeys.push(src);
      overflow = Math.max(0, explicitSum() - pool);
      if (overflow > 0) return { ok: false, error: "over_pool", poolYen: pool }; // 削っても収まらない
    } else {
      return { ok: false, error: "need_source", poolYen: pool };
    }
  }

  const after = computeResult(effInputs, decisions, proposed);
  if (!after) return { ok: false };
  return {
    ok: true, poolYen: pool,
    beforeRows: allocationRows(base),
    afterRows: allocationRows(after),
    proposed, changedKeys, targetLabel: BUCKET_LABEL[target],
  };
}

/** plans（保存済み方針）から配分に使う planAmounts を抽出（liq/edu/prepay/nisaのみ・共通化） */
export function planAmountsFromMonthly(monthly: Partial<Record<BucketId, number | null>>): PlanAmounts {
  const pa: PlanAmounts = {};
  ALLOC_BUCKETS.forEach((b) => {
    const m = monthly[b];
    if (typeof m === "number" && isFinite(m) && m > 0) pa[b] = Math.round(m);
  });
  return pa;
}
