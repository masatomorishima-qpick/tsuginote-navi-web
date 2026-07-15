/**
 * /api/shisan/diagnosis
 *
 * 診断完了時（shisan_input_complete のタイミング）に、非会員も含めて
 * 診断入力＋算出結果を統計・分析用の一次データとして best-effort でサーバー保存する。
 *
 * 設計方針（観測期間中：ユーザー体験を1ミリも変えない）：
 * - 保存はクライアントからの fire-and-forget（応答は使わない）。UI・GAイベント・ファネル・入力項目には一切影響しない。
 * - PII（メール・氏名）は保存しない。家計の数値と匿名IDのみ。会員でも email/signup_id とは紐づけない（匿名保存）。
 * - 匿名IDは ask と同じ Cookie "sa"（PIIではないUUID）を共用し、診断↔相談を後から紐づけられるようにする。
 * - 算出結果（65歳見込み・目標比・scenario・buckets）はクライアントを信用せず calc.ts でサーバー再計算する。
 * - 極端値は弾かず保存する（生データを失わない。除外判断は分析時）。
 * - 保存失敗は無音（best-effort）。診断結果画面の表示は別経路のため止まらない。
 *
 * データ品質のための付帯情報：seq（同一anon_idの何回目か）／所要時間／流入元（referrer・utm）／
 * 再診断か新規か／運営者・デバッグ判定（テスト行を分析時に除外するため）。
 */

import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { getSessionSignupId } from "@/lib/shisan/auth";
import { isOperatorEmail } from "@/lib/shisan/limits";
import { computeResult, judgeScenario, deriveBuckets, type Inputs, type EduPlan } from "@/lib/shisan/calc";

const MAX_BODY_BYTES = 20_000;
const numOr = (v: unknown, d = 0): number => (typeof v === "number" && isFinite(v) ? v : d);
const boolOf = (v: unknown): boolean => v === true;
const strCap = (v: unknown, max: number): string | null =>
  typeof v === "string" && v.trim() ? v.trim().slice(0, max) : null;

/** クライアント入力を Inputs 型へ健全化（型のみ整える。極端値は弾かない＝生データ保持）。 */
function sanitizeInputs(raw: unknown): Inputs | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = raw as Record<string, unknown>;
  const ages = Array.isArray(o.childAges)
    ? (o.childAges as unknown[]).slice(0, 20).map((a) => numOr(a, 0))
    : [];
  const inputs: Inputs = {
    age: numOr(o.age), income: numOr(o.income), assets: numOr(o.assets),
    surplus: numOr(o.surplus), living: numOr(o.living),
    hasMortgage: boolOf(o.hasMortgage),
    mBal: numOr(o.mBal), mYears: numOr(o.mYears), mRate: numOr(o.mRate),
    mType: strCap(o.mType, 20) ?? "変動",
    childAges: ages,
    eduPlan: (["kokukou", "shibun", "shiri"].includes(o.eduPlan as string) ? o.eduPlan : "shibun") as EduPlan,
    target: numOr(o.target, 0), r: numOr(o.r, 0),
  };
  if (!inputs.age && !inputs.income && !inputs.assets) return null; // 空同然は保存しない
  return inputs;
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    const text = await req.text();
    if (text.length > MAX_BODY_BYTES) return NextResponse.json({ ok: false, error: "too_large" }, { status: 413 });
    body = JSON.parse(text) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const inputs = sanitizeInputs(body.inputs);
  if (!inputs) return NextResponse.json({ ok: false, error: "invalid_inputs" }, { status: 400 });

  // 算出結果はクライアントを信用せずサーバー再計算（診断画面の値とロジック同一）。
  const result = computeResult(inputs, {});
  const scenario = judgeScenario(inputs);
  const buckets = deriveBuckets(inputs);

  // 匿名ID（ask と共用の Cookie "sa"・PIIではないUUID）。無ければ発行。
  const cookieAnon = req.cookies.get("sa")?.value ?? "";
  const anonId = /^[0-9a-f-]{36}$/i.test(cookieAnon) ? cookieAnon : crypto.randomUUID();

  // 運営者判定（テスト行の機械的除外用）。email 自体は保存せず boolean のみ。
  let isOperator = false;
  try {
    const signupId = await getSessionSignupId();
    if (signupId) {
      const admin = createAdminSupabaseClient();
      const { data } = await admin.from("shisan_signups").select("email").eq("id", signupId).maybeSingle();
      isOperator = isOperatorEmail((data as { email?: string | null } | null)?.email ?? null);
    }
  } catch { /* 判定失敗は false のまま（best-effort） */ }

  try {
    const supabase = createAdminSupabaseClient();

    // seq：同一 anon_id の何回目の診断か（分析時に「1人1行＝最新1件」へ畳むための連番）。
    let seq = 1;
    try {
      const { count } = await supabase
        .from("shisan_diagnoses")
        .select("id", { count: "exact", head: true })
        .eq("anon_id", anonId);
      seq = (count ?? 0) + 1;
    } catch { /* 取得失敗は seq=1 */ }

    const { error } = await supabase.from("shisan_diagnoses").insert({
      anon_id: anonId,
      seq,
      // 診断入力（全項目）
      age: inputs.age, income: inputs.income, assets: inputs.assets,
      surplus: inputs.surplus, living: inputs.living,
      has_mortgage: inputs.hasMortgage, m_bal: inputs.mBal, m_years: inputs.mYears, m_rate: inputs.mRate,
      m_type: inputs.mType, child_ages: inputs.childAges, child_count: inputs.childAges.length,
      edu_plan: inputs.eduPlan, target: inputs.target, r: inputs.r,
      // 算出結果（サーバー再計算）
      future: result ? Math.round(result.future) : null,
      achieve: result ? result.achieve : null,
      scenario, buckets, buckets_count: buckets.length,
      // データ品質・メタ
      duration_sec: (() => { const d = numOr(body.durationSec, -1); return d >= 0 && d < 86400 ? Math.round(d) : null; })(),
      is_reenter: boolOf(body.isReenter),
      is_new: boolOf(body.isNew),
      is_operator: isOperator,
      debug_flag: boolOf(body.debug),
      referrer: strCap(body.referrer, 500),
      utm_source: strCap(body.utmSource, 120),
      utm_medium: strCap(body.utmMedium, 120),
      utm_campaign: strCap(body.utmCampaign, 200),
      user_agent: strCap(req.headers.get("user-agent"), 400),
      raw: inputs,
    });
    if (error) throw new Error(error.message);
  } catch (err) {
    console.error("[api/shisan/diagnosis] save skipped", err instanceof Error ? err.message : err);
    // 失敗しても ok を返す（診断表示は別経路・best-effort）。ただし Cookie は発行する。
  }

  // 匿名IDを再送（30日・ask と同一属性）。同一訪問者の再診断・連続質問を紐づける。
  const res = NextResponse.json({ ok: true });
  res.cookies.set("sa", anonId, { httpOnly: true, sameSite: "lax", secure: true, path: "/", maxAge: 60 * 60 * 24 * 30 });
  return res;
}
