/**
 * /api/shisan/report
 *
 * 実行申告（Phase1 要件§7-1・改善額ファクトの収集装置）。
 * POST { actionId, status: 'done'|'not_yet'|'stopped', monthlyAmount? } → insert（履歴として蓄積）
 */

import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { getSessionSignupId } from "@/lib/shisan/auth";
import { man, type Inputs, type BucketId, type Decision, type ReportEntry } from "@/lib/shisan/calc";
import { buildOfficialSummary, type PlanRecord } from "@/lib/shisan/context";

const ACTION_IDS = new Set(["liq", "edu", "refi", "prepay", "nisa"]);
const STATUSES = new Set(["done", "not_yet", "stopped"]);

/** 最新の申告状態（action_idごと）を返す */
export async function GET() {
  const signupId = await getSessionSignupId();
  if (!signupId) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });

  try {
    const supabase = createAdminSupabaseClient();
    const { data } = await supabase
      .from("shisan_action_reports")
      .select("action_id, status, monthly_amount, created_at")
      .eq("signup_id", signupId)
      .order("created_at", { ascending: true });
    const latest: Record<string, { status: string; monthly_amount: number | null }> = {};
    (data ?? []).forEach((r) => { latest[r.action_id] = { status: r.status, monthly_amount: r.monthly_amount }; });
    return NextResponse.json({ ok: true, reports: latest });
  } catch {
    return NextResponse.json({ ok: false, error: "load_failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const signupId = await getSessionSignupId();
  if (!signupId) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });

  let actionId = "", status = "", monthlyAmount: number | null = null;
  try {
    const body = (await req.json()) as { actionId?: unknown; status?: unknown; monthlyAmount?: unknown };
    actionId = typeof body.actionId === "string" ? body.actionId : "";
    status = typeof body.status === "string" ? body.status : "";
    if (typeof body.monthlyAmount === "number" && isFinite(body.monthlyAmount)) {
      monthlyAmount = Math.max(0, Math.min(10_000_000, Math.round(body.monthlyAmount)));
    }
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }
  if (!ACTION_IDS.has(actionId) || !STATUSES.has(status)) {
    return NextResponse.json({ ok: false, error: "invalid_params" }, { status: 400 });
  }

  try {
    const supabase = createAdminSupabaseClient();

    // 再計算の前後比較用（修正B-3）：申告前の実効見込みを取得（方針金額も反映＝公式サマリー経由）
    const [{ data: signup }, { data: priorRows }, { data: planRows }] = await Promise.all([
      supabase.from("shisan_signups").select("store").eq("id", signupId).maybeSingle(),
      supabase.from("shisan_action_reports")
        .select("action_id, status, monthly_amount, created_at")
        .eq("signup_id", signupId)
        .order("created_at", { ascending: true }),
      supabase.from("shisan_action_plans")
        .select("action_id, goal_text, next_step_text, monthly_yen, updated_at")
        .eq("signup_id", signupId),
    ]);
    const store = (signup?.store ?? {}) as { inputs?: Inputs | null; decisions?: Partial<Record<BucketId, Decision>> | null };
    const inputs = store.inputs ?? null;
    const decisions = store.decisions ?? {};
    const prior: Record<string, ReportEntry> = {};
    (priorRows ?? []).forEach((r) => { prior[r.action_id] = { status: r.status, monthly_amount: r.monthly_amount }; });
    const plans: Record<string, PlanRecord> = {};
    (planRows ?? []).forEach((p) => {
      plans[p.action_id] = { goal: p.goal_text, nextStep: p.next_step_text, monthlyYen: p.monthly_yen, updatedAt: p.updated_at };
    });
    const before = buildOfficialSummary(inputs, decisions, prior, plans).adj;

    const { error } = await supabase.from("shisan_action_reports").insert({
      signup_id: signupId,
      action_id: actionId,
      status,
      monthly_amount: status === "done" ? monthlyAmount : null,
    });
    if (error) throw new Error(error.message);

    // 申告後の実効値（共有関数一箇所集約・修正B）
    const after = buildOfficialSummary(inputs, decisions, {
      ...prior,
      [actionId]: { status, monthly_amount: status === "done" ? monthlyAmount : null },
    }, plans).adj;
    const recalc =
      !!before.effective && !!after.effective &&
      Math.round(before.effective.future) !== Math.round(after.effective.future);

    return NextResponse.json({
      ok: true,
      recalc,
      beforeMan: before.effective ? man(before.effective.future) : null,
      afterMan: after.effective ? man(after.effective.future) : null,
      refiMismatch: after.refiMismatch,
    });
  } catch (err) {
    console.error("[api/shisan/report] threw", err instanceof Error ? err.message : err);
    return NextResponse.json({ ok: false, error: "save_failed" }, { status: 500 });
  }
}
