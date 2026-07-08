/**
 * /api/shisan/realloc
 *
 * 配分変更の保存（修正指示書_20260707・修正1）。
 * <plan>（定性の方針記録）とは分離。POST { target, monthlyYen, source } →
 * サーバーで再計算・再検証（over_pool/need_source を弾く）→ 変更対象バケツ（target＋必要ならsource）の
 * shisan_action_plans.monthly_yen を更新（＝配分方針額）。ユーザーが承認カードで承認したときのみ呼ばれる。
 *
 * 新規バケツに配分だけ置く場合、goal_text/next_step_text（NOT NULL）は
 * 金額とラベルから決定論的に生成（LLM生成でない＝中立・数字完全性を維持）。既存行は目標/次の一歩を保持し金額のみ更新。
 */

import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { getSessionSignupId } from "@/lib/shisan/auth";
import { validateReallocIntent } from "@/lib/shisan/plan";
import {
  computeRealloc, planAmountsFromMonthly, yen, BUCKET_LABEL,
  type Inputs, type BucketId, type Decision, type ReportEntry,
} from "@/lib/shisan/calc";

/** 金額トークン（¥6,000 / 6,000円）だけを拾う。「6か月」「65歳」「3%」等は拾わない（誤爆防止）。 */
const MONEY_RE = /¥[\d,]+|[\d,]+\s*円/g;

/**
 * 発見A対策：realloc で配分額が変わったとき、既存の方針文に残る古い金額を新額に同期する。
 * 誤爆を避けるため金額の「個数」で分岐：
 *   0個＝古い金額なし → そのまま
 *   1個＝安全に置換（定性の文言は保持）
 *   2個以上＝単純置換は危険（例「月¥6,000を半年で¥36,000」）→ null を返し、呼び出し側が決定論文に作り直す
 */
function syncPlanTextAmount(text: string, newYen: number): string | null {
  const matches = text.match(MONEY_RE);
  if (!matches || matches.length === 0) return text;
  if (matches.length === 1) return text.replace(MONEY_RE, `¥${yen(newYen)}`);
  return null;
}

export async function POST(req: NextRequest) {
  const signupId = await getSessionSignupId();
  if (!signupId) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });

  let raw: unknown;
  try { raw = await req.json(); } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }
  const intent = validateReallocIntent(raw);
  if (!intent) return NextResponse.json({ ok: false, error: "invalid_intent" }, { status: 400 });

  try {
    const supabase = createAdminSupabaseClient();
    const [{ data: signup }, { data: planRows }, { data: reportRows }] = await Promise.all([
      supabase.from("shisan_signups").select("store").eq("id", signupId).maybeSingle(),
      supabase.from("shisan_action_plans")
        .select("action_id, goal_text, next_step_text, monthly_yen").eq("signup_id", signupId),
      supabase.from("shisan_action_reports")
        .select("action_id, status, monthly_amount, created_at")
        .eq("signup_id", signupId).order("created_at", { ascending: true }),
    ]);
    const reports: Record<string, ReportEntry> = {};
    (reportRows ?? []).forEach((r) => { reports[r.action_id] = { status: r.status, monthly_amount: r.monthly_amount }; });
    if (!signup) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });

    const store = (signup.store ?? {}) as { inputs?: Inputs | null; decisions?: Partial<Record<BucketId, Decision>> | null };
    const existing: Record<string, { goal: string; nextStep: string; monthlyYen: number | null }> = {};
    (planRows ?? []).forEach((p) => { existing[p.action_id] = { goal: p.goal_text, nextStep: p.next_step_text, monthlyYen: p.monthly_yen }; });

    const curPA = planAmountsFromMonthly({
      liq: existing.liq?.monthlyYen ?? null, edu: existing.edu?.monthlyYen ?? null,
      prepay: existing.prepay?.monthlyYen ?? null, nisa: existing.nisa?.monthlyYen ?? null,
    });

    // サーバーで再計算・再検証（クライアント改ざん対策・over_pool/need_source を弾く）
    const rr = computeRealloc(store.inputs ?? null, store.decisions ?? {}, curPA,
      intent.target, intent.monthlyYen, intent.source, reports);
    if (!rr.ok || !rr.proposed || !rr.changedKeys) {
      return NextResponse.json({ ok: false, error: rr.error ?? "compute_failed" }, { status: 400 });
    }

    // 変更対象バケツのみ upsert（target＋必要ならsource）
    const nowIso = new Date().toISOString();
    for (const key of rr.changedKeys) {
      const amt = rr.proposed[key] ?? 0;
      const ex = existing[key];
      const fallbackGoal = `${BUCKET_LABEL[key]}へ 毎月¥${yen(amt)}`;
      // 既存行：方針文の古い金額を新額に同期（発見A）。複数金額は誤爆回避で決定論文に作り直す。
      // 新規行：従来通り決定論文で生成。
      const goal = ex ? (syncPlanTextAmount(ex.goal, amt) ?? fallbackGoal) : fallbackGoal;
      const nextStep = ex ? (syncPlanTextAmount(ex.nextStep, amt) ?? "この配分で続ける") : "この配分で続ける";
      const { error } = await supabase.from("shisan_action_plans").upsert({
        signup_id: signupId, action_id: key,
        goal_text: goal, next_step_text: nextStep,
        monthly_yen: amt > 0 ? amt : null,
        updated_at: nowIso,
      }, { onConflict: "signup_id,action_id" });
      if (error) throw new Error(error.message);
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[api/shisan/realloc] threw", err instanceof Error ? err.message : err);
    return NextResponse.json({ ok: false, error: "save_failed" }, { status: 500 });
  }
}
