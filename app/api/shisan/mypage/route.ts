/**
 * /api/shisan/mypage
 *
 * マイページ用データ（追加要件A）。サーバー保存の store から
 * 診断画面と同一ロジック（computeResult）で表示値を生成して返す。
 */

import { NextResponse } from "next/server";
import { getSessionSignupId } from "@/lib/shisan/auth";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import {
  yen, man, judgeScenario, deriveBuckets,
  SCENARIO_PHASE, BUCKET_LABEL,
  type Inputs, type BucketId, type Decision, type ReportEntry,
} from "@/lib/shisan/calc";
import { buildOfficialSummary, type PlanRecord } from "@/lib/shisan/context";

interface StoreShape {
  inputs?: Inputs | null;
  decisions?: Partial<Record<BucketId, Decision>> | null;
}

export async function GET() {
  const signupId = await getSessionSignupId();
  if (!signupId) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });

  try {
    const supabase = createAdminSupabaseClient();
    const [{ data: signup }, { data: reportRows }, { data: planRows }] = await Promise.all([
      supabase.from("shisan_signups").select("store").eq("id", signupId).maybeSingle(),
      supabase.from("shisan_action_reports")
        .select("action_id, status, monthly_amount, created_at")
        .eq("signup_id", signupId)
        .order("created_at", { ascending: true }),
      supabase.from("shisan_action_plans")
        .select("action_id, goal_text, next_step_text, monthly_yen, updated_at")
        .eq("signup_id", signupId),
    ]);
    if (!signup) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });

    const store = (signup.store ?? {}) as StoreShape;
    const inputs = store.inputs ?? null;
    const decisions = store.decisions ?? {};
    const scenario = judgeScenario(inputs);
    const buckets = deriveBuckets(inputs);

    const reports: Record<string, ReportEntry> = {};
    (reportRows ?? []).forEach((r) => { reports[r.action_id] = { status: r.status, monthly_amount: r.monthly_amount }; });
    const plans: Record<string, PlanRecord> = {};
    (planRows ?? []).forEach((p) => { plans[p.action_id] = { goal: p.goal_text, nextStep: p.next_step_text, monthlyYen: p.monthly_yen, updatedAt: p.updated_at }; });

    // 公式サマリー（唯一の正・修正A/C/D）：判定文・配分表・実効値・内訳・超過警告のすべてがここから出る
    const official = buildOfficialSummary(inputs, decisions, reports, plans);
    const adj = official.adj;
    const shown = official.shown;

    return NextResponse.json({
      ok: true,
      summary: inputs && shown ? {
        phase: scenario ? SCENARIO_PHASE[scenario] : null,
        scenario,
        poolYen: yen(shown.pool),
        future65Man: man(shown.future),
        achieve: shown.achieve,
        targetMan: man(inputs.target),
        r: inputs.r,
        recalcApplied: adj.recalcApplied,
        adjustmentYen: adj.adjustment,
        basePoolYen: adj.base ? yen(adj.base.pool) : null,
        baseFuture65Man: adj.base ? man(adj.base.future) : null,
      } : null,
      // 3ブロック用（修正C）
      verdict: official.verdict,
      allocation: {
        rows: official.rows.map((row) => ({ ...row, amountYen: yen(row.amount) })),
        totalYen: shown ? yen(shown.pool) : null,
        overflowYen: official.overflow > 0 ? yen(official.overflow) : null,
      },
      tasks: buckets.filter((b) => decisions[b]).flatMap((b) => {
        const hasPlan = !!plans[b]?.nextStep;
        const mihai = shown ? shown.mihai : 0;
        // ¥ベースの配分CTA（繰上げvs投資・NISA）は「未配分>0」のときだけ出す（修正4改善：配分済みで¥0のCTAを出さない）
        if (!hasPlan && (b === "prepay" || b === "nisa") && mihai <= 0) return [];
        // 方針（次の一歩）未設定のタスクは、決定論の具体文言をサーバー生成（修正4）。¥は未配分額に連動
        const mihaiYen = yen(mihai);
        let cta = "AIと次の一歩を決める";
        if (!hasPlan) {
          if (b === "prepay") cta = `残り¥${mihaiYen}の使い道を決める：繰り上げ返済と投資、あなたの場合の比較を見る`;
          else if (b === "nisa") cta = `NISAの月額を決める：月¥${mihaiYen}を積み立てた場合の65歳時点を見る`;
        }
        return [{
          id: b, label: BUCKET_LABEL[b],
          nextStep: plans[b]?.nextStep ?? null,
          done: reports[b]?.status === "done",
          cta,
        }];
      }),
      refiMismatch: adj.refiMismatch,
      decisions: buckets.filter((b) => decisions[b])
        .map((b) => ({ id: b, label: BUCKET_LABEL[b], choice: decisions[b]!.choice })),
      reports,
      plans,
      total: buckets.length,
      remainingCount: buckets.filter((b) => !decisions[b]).length,
    });
  } catch (err) {
    console.error("[api/shisan/mypage] threw", err instanceof Error ? err.message : err);
    return NextResponse.json({ ok: false, error: "load_failed" }, { status: 500 });
  }
}
