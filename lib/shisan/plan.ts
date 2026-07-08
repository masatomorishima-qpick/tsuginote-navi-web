/**
 * lib/shisan/plan.ts
 *
 * タスク化＝AIとの合意（方針）の記録提案の検証（修正指示書_20260707 修正A）。
 * 三段構え：LLMが提案 → ここでサーバー検証 → ユーザー承認時のみ保存。
 * 不正（存在しないaction_id・字数超過・禁止語）は破棄し、承認カードを出さない。
 */

import { type BucketId, BUCKET_LABEL } from "@/lib/shisan/calc";

/** 記録対象は「決めた一手」カードを持つ5バケツに限定（Q1回答・固定費/収入は器ができてから） */
export const PLAN_ACTION_IDS: readonly BucketId[] = ["liq", "edu", "refi", "prepay", "nisa"];
const MAX_TEXT_LEN = 40;

/** 禁止語（Q2回答：主要事業者名＋推奨表現。検知漏れの最終防波堤はユーザー承認カード） */
const BANNED_WORDS = [
  // 推奨表現（事業者名が漏れても言い回しごと弾く）
  "おすすめ", "オススメ", "お勧め", "推奨", "一番良い", "一番いい", "ベストな", "最良", "最適な商品", "買うべき", "選ぶべき",
  // 証券
  "SBI", "楽天証券", "マネックス", "auカブコム", "松井証券", "野村", "大和", "SMBC日興", "みずほ証券", "岡三", "GMOクリック", "moomoo", "ウィブル",
  // 銀行
  "楽天銀行", "住信SBI", "ソニー銀行", "イオン銀行", "auじぶん銀行", "PayPay銀行", "三菱UFJ", "三井住友銀行", "みずほ銀行", "りそな", "新生銀行", "SBI新生",
  // 保険
  "ソニー生命", "アフラック", "メットライフ", "プルデンシャル", "オリックス生命", "ライフネット", "県民共済", "コープ共済", "アクサ", "チューリッヒ", "SOMPO", "東京海上", "明治安田", "住友生命", "日本生命", "かんぽ",
  // 投信・運用
  "eMAXIS", "オルカン", "S&P500", "SBI・V", "楽天VTI", "ニッセイ外国", "iFree", "たわら",
  // 通信（固定費文脈の事業者名）
  "ahamo", "povo", "LINEMO", "楽天モバイル", "UQモバイル", "ワイモバイル", "mineo", "IIJmio",
];

export interface PlanProposal {
  actionId: BucketId;
  goal: string;
  nextStep: string;
  /** 毎月の金額（円・任意）。liq/edu/prepay/nisa=配分額／refi=削減目標（表示のみ）。
   * 二段検証：単体で余力超えは拒否・保存後の合計超過は警告表示（クリップ）＝Q1/Q2条件 */
  monthlyYen: number | null;
}

function containsBanned(text: string): string | null {
  const lower = text.toLowerCase();
  for (const w of BANNED_WORDS) {
    if (lower.includes(w.toLowerCase())) return w;
  }
  return null;
}

/** LLM出力（または保存APIへの入力）の検証。不正は null（＝提案破棄）。
 * maxYen＝余力（単体でこれを超える金額は拒否。合計超過は保存後に警告＝二段検証） */
export function validatePlanProposal(raw: unknown, maxYen?: number): PlanProposal | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = raw as Record<string, unknown>;
  const actionId = typeof o.action_id === "string" ? o.action_id : (typeof o.actionId === "string" ? o.actionId : "");
  const goal = typeof o.goal_text === "string" ? o.goal_text.trim() : (typeof o.goal === "string" ? o.goal.trim() : "");
  const nextStep = typeof o.next_step_text === "string" ? o.next_step_text.trim() : (typeof o.nextStep === "string" ? o.nextStep.trim() : "");

  if (!(PLAN_ACTION_IDS as readonly string[]).includes(actionId)) return null;      // 存在しないaction_id
  if (!goal || !nextStep) return null;
  if (goal.length > MAX_TEXT_LEN || nextStep.length > MAX_TEXT_LEN) return null;    // 字数超過
  if (containsBanned(goal) || containsBanned(nextStep)) return null;                // 禁止語（商品名・事業者名・推奨表現）
  if (/[<>{}]/.test(goal) || /[<>{}]/.test(nextStep)) return null;                  // タグ・JSON片の混入

  // 毎月の金額（任意・整数・正・単体で余力以内）
  let monthlyYen: number | null = null;
  const rawYen = (o.monthly_yen ?? o.monthlyYen) as unknown;
  if (rawYen !== undefined && rawYen !== null && rawYen !== "") {
    const v = typeof rawYen === "number" ? rawYen : Number(rawYen);
    if (!isFinite(v) || v <= 0 || Math.round(v) !== v) return null;
    if (typeof maxYen === "number" && v > maxYen) return null;                      // 単体で余力超え→拒否
    if (v > 10_000_000) return null;
    monthlyYen = v;
  }

  return { actionId: actionId as BucketId, goal, nextStep, monthlyYen };
}

/** LLM応答から <plan>{...}</plan> タグを抽出し、表示用テキストと提案に分離 */
export function extractPlanProposal(reply: string, maxYen?: number): { text: string; proposal: PlanProposal | null } {
  const m = reply.match(/<plan>([\s\S]*?)<\/plan>/);
  if (!m) return { text: reply, proposal: null };
  const text = reply.replace(m[0], "").trim();
  let proposal: PlanProposal | null = null;
  try { proposal = validatePlanProposal(JSON.parse(m[1]), maxYen); } catch { proposal = null; }
  return { text, proposal };
}

export function planLabel(actionId: BucketId): string {
  return BUCKET_LABEL[actionId];
}

/* ===== 配分変更（realloc）＝修正指示書_20260707・修正1 =====
 * <plan>（定性の方針記録）とは分離。LLMは意図抽出のみ、算数はサーバー。
 * タグ: <realloc>{"target":バケツID,"monthly_yen":数値,"source":バケツID|"unallocated"|null}</realloc> */
export const ALLOC_ACTION_IDS: readonly BucketId[] = ["liq", "edu", "prepay", "nisa"]; // refiは配分対象外

export interface ReallocIntent {
  target: BucketId;
  monthlyYen: number;
  source: BucketId | "unallocated" | null;
}

/** realloc意図の検証。不正は null（＝提案破棄）。金額の余力チェックはサーバー計算側で行う */
export function validateReallocIntent(raw: unknown): ReallocIntent | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = raw as Record<string, unknown>;
  const target = typeof o.target === "string" ? o.target : "";
  if (!(ALLOC_ACTION_IDS as readonly string[]).includes(target)) return null; // 配分可能バケツのみ
  const rawYen = o.monthly_yen ?? o.monthlyYen;
  const v = typeof rawYen === "number" ? rawYen : Number(rawYen);
  if (!isFinite(v) || v < 0 || Math.round(v) !== v || v > 10_000_000) return null;
  let source: BucketId | "unallocated" | null = null;
  const s = typeof o.source === "string" ? o.source : "";
  if (s === "unallocated") source = "unallocated";
  else if ((ALLOC_ACTION_IDS as readonly string[]).includes(s)) source = s as BucketId;
  return { target: target as BucketId, monthlyYen: Math.round(v), source };
}

/** LLM応答から <realloc>{...}</realloc> を抽出（<plan>とは別系統） */
export function extractRealloc(reply: string): { text: string; intent: ReallocIntent | null } {
  const m = reply.match(/<realloc>([\s\S]*?)<\/realloc>/);
  if (!m) return { text: reply, intent: null };
  const text = reply.replace(m[0], "").trim();
  let intent: ReallocIntent | null = null;
  try { intent = validateReallocIntent(JSON.parse(m[1])); } catch { intent = null; }
  return { text, intent };
}
