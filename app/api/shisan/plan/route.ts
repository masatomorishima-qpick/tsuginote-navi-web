/**
 * /api/shisan/plan
 *
 * 方針（AIとの合意）の保存（修正指示書_20260707 修正A）。
 * POST { actionId, goal, nextStep } → 再検証（クライアント改ざん対策）→ upsert。
 * ユーザー承認（記録するボタン）時のみ呼ばれる。AIが勝手に保存する経路は存在しない。
 */

import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { getSessionSignupId } from "@/lib/shisan/auth";
import { validatePlanProposal } from "@/lib/shisan/plan";
import { computeResult, type Inputs, type BucketId, type Decision } from "@/lib/shisan/calc";

export async function POST(req: NextRequest) {
  const signupId = await getSessionSignupId();
  if (!signupId) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });

  let raw: unknown;
  try { raw = await req.json(); } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  try {
    const supabase = createAdminSupabaseClient();
    // 金額の単体検証用に余力を取得（単体で余力超え→拒否・合計超過は画面警告＝二段検証）
    const { data: signup } = await supabase.from("shisan_signups").select("store").eq("id", signupId).maybeSingle();
    if (!signup) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
    const store = (signup.store ?? {}) as { inputs?: Inputs | null; decisions?: Partial<Record<BucketId, Decision>> | null };
    const base = computeResult(store.inputs ?? null, store.decisions ?? {});
    const plan = validatePlanProposal(raw, base?.pool);
    if (!plan) return NextResponse.json({ ok: false, error: "invalid_plan" }, { status: 400 });

    const { error } = await supabase
      .from("shisan_action_plans")
      .upsert(
        {
          signup_id: signupId, action_id: plan.actionId,
          goal_text: plan.goal, next_step_text: plan.nextStep, monthly_yen: plan.monthlyYen,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "signup_id,action_id" }
      );
    if (error) throw new Error(error.message);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[api/shisan/plan] threw", err instanceof Error ? err.message : err);
    return NextResponse.json({ ok: false, error: "save_failed" }, { status: 500 });
  }
}
