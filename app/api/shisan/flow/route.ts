/**
 * /api/shisan/flow
 *
 * AI主導の意思決定フロー（追加要件G）。
 * GET  → 進行状況（残り・次の質問・決定済み一覧）
 * POST { bucket, choice } → decisionsをサーバーstoreに保存 → AIのひと言（LLM）＋次の質問を返す
 *
 * 質問・選択肢は決定論的に生成（flow.ts）。LLMは「選択の意味づけ」のひと言のみ。
 */

import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { getSessionSignupId } from "@/lib/shisan/auth";
import { buildDiagnosisContext, SYSTEM_PROMPT, stripMarkdown, type StoreSnapshot, type PlanRecord } from "@/lib/shisan/context";
import { type ReportEntry } from "@/lib/shisan/calc";
import { undecidedBuckets, buildQuestion, isValidChoice } from "@/lib/shisan/flow";
import { dailyLimitFor } from "@/lib/shisan/limits";
import { judgeScenario, deriveBuckets, BUCKET_LABEL, type Inputs, type BucketId, type Decision } from "@/lib/shisan/calc";

const MODEL = "claude-haiku-4-5-20251001";

/** JSTでの「今日」の開始時刻（UTC ISO）。chat/route.ts と同一ロジック */
function jstDayStartIso(): string {
  const nowJst = new Date(Date.now() + 9 * 60 * 60 * 1000);
  const dayStartJst = Date.UTC(nowJst.getUTCFullYear(), nowJst.getUTCMonth(), nowJst.getUTCDate());
  return new Date(dayStartJst - 9 * 60 * 60 * 1000).toISOString();
}

interface StoreShape {
  inputs?: Inputs | null;
  decisions?: Partial<Record<BucketId, Decision>> | null;
  [k: string]: unknown;
}

function flowPayload(inputs: Inputs, decisions: Partial<Record<BucketId, Decision>>) {
  const all = deriveBuckets(inputs);
  const remaining = undecidedBuckets(inputs, decisions);
  return {
    total: all.length,
    remaining: remaining,
    next: remaining.length > 0 ? buildQuestion(remaining[0], inputs) : null,
    decided: all.filter((b) => decisions[b]).map((b) => ({ id: b, label: BUCKET_LABEL[b], choice: decisions[b]!.choice })),
  };
}

export async function GET() {
  const signupId = await getSessionSignupId();
  if (!signupId) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  try {
    const supabase = createAdminSupabaseClient();
    const { data: signup } = await supabase.from("shisan_signups").select("store, email").eq("id", signupId).maybeSingle();
    if (!signup) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
    const store = (signup.store ?? {}) as StoreShape;
    if (!store.inputs) return NextResponse.json({ ok: true, total: 0, remaining: [], next: null, decided: [] });
    return NextResponse.json({ ok: true, ...flowPayload(store.inputs, store.decisions ?? {}) });
  } catch {
    return NextResponse.json({ ok: false, error: "load_failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const signupId = await getSessionSignupId();
  if (!signupId) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });

  let bucket = "", choice = "";
  try {
    const body = (await req.json()) as { bucket?: unknown; choice?: unknown };
    bucket = typeof body.bucket === "string" ? body.bucket : "";
    choice = typeof body.choice === "string" ? body.choice.slice(0, 40) : "";
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  try {
    const supabase = createAdminSupabaseClient();
    const { data: signup } = await supabase.from("shisan_signups").select("store, email").eq("id", signupId).maybeSingle();
    if (!signup) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
    const store = (signup.store ?? {}) as StoreShape;
    const inputs = store.inputs ?? null;
    if (!inputs) return NextResponse.json({ ok: false, error: "no_diagnosis" }, { status: 400 });

    const buckets = deriveBuckets(inputs);
    if (!buckets.includes(bucket as BucketId) || !isValidChoice(bucket as BucketId, inputs, choice)) {
      return NextResponse.json({ ok: false, error: "invalid_params" }, { status: 400 });
    }
    const b = bucket as BucketId;

    // decisions をサーバーstoreに保存（要件G-4。要件Cの同期と同一の保存先）
    const decisions = { ...(store.decisions ?? {}), [b]: { choice } };
    const newStore = { ...store, decisions };
    const { error: upErr } = await supabase
      .from("shisan_signups")
      .update({ store: newStore, scenario: judgeScenario(inputs), updated_at: new Date().toISOString() })
      .eq("id", signupId);
    if (upErr) throw new Error(upErr.message);

    const payload = flowPayload(inputs, decisions);
    const complete = payload.remaining.length === 0;

    // 履歴：選択を user メッセージとして保存
    const userLine = `【選択】${BUCKET_LABEL[b]}：${choice}`;
    await supabase.from("shisan_chat_messages").insert({ signup_id: signupId, role: "user", content: userLine });

    // AIのひと言（選択の意味＝計算値との関係。次の質問文はLLMに作らせない）
    let comment = "";
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (apiKey) {
      try {
        // 公式説明の整合（修正D）：申告・方針も含めた同一コンテキストでコメント生成
        const [{ data: repRows }, { data: plRows }] = await Promise.all([
          supabase.from("shisan_action_reports")
            .select("action_id, status, monthly_amount, created_at")
            .eq("signup_id", signupId).order("created_at", { ascending: true }),
          supabase.from("shisan_action_plans")
            .select("action_id, goal_text, next_step_text, monthly_yen, updated_at")
            .eq("signup_id", signupId),
        ]);
        const reps: Record<string, ReportEntry> = {};
        (repRows ?? []).forEach((r) => { reps[r.action_id] = { status: r.status, monthly_amount: r.monthly_amount }; });
        const pls: Record<string, PlanRecord> = {};
        (plRows ?? []).forEach((p) => { pls[p.action_id] = { goal: p.goal_text, nextStep: p.next_step_text, monthlyYen: p.monthly_yen, updatedAt: p.updated_at }; });
        const context = buildDiagnosisContext(newStore as StoreSnapshot, reps, pls);
        const instruction = complete
          ? `ユーザーは最後の論点「${BUCKET_LABEL[b]}」について「${choice}」と決め、該当する全論点の意思決定が揃いました。この決定を短く承認し、診断数値との関係をひと言述べてください。締めに「あなたの方針が揃いました。」と添えてください。120字以内。マークダウン禁止。質問はしない。`
          : `ユーザーはいま「${BUCKET_LABEL[b]}」について「${choice}」と決めました。この決定を短く承認し、診断数値との関係をひと言述べてください。80字以内。マークダウン禁止。次の質問文は書かない（画面が別途提示します）。質問はしない。`;
        const llmRes = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: { "x-api-key": apiKey, "anthropic-version": "2023-06-01", "content-type": "application/json" },
          body: JSON.stringify({
            model: MODEL, max_tokens: 250,
            system: `${SYSTEM_PROMPT}\n\n${context}\n\n${instruction}`,
            messages: [{ role: "user", content: userLine }],
          }),
          cache: "no-store",
        });
        if (llmRes.ok) {
          const j = (await llmRes.json()) as { content?: { type: string; text?: string }[] };
          comment = stripMarkdown((j.content ?? []).filter((c) => c.type === "text" && c.text).map((c) => c.text).join("").trim());
        }
      } catch { /* コメント生成失敗はフォールバックで続行 */ }
    }
    if (!comment) {
      comment = complete
        ? `「${BUCKET_LABEL[b]}：${choice}」を記録しました。あなたの方針が揃いました。`
        : `「${BUCKET_LABEL[b]}：${choice}」を記録しました。`;
    }

    // 完了時は要約＋伴走モードへの切替宣言を添えて保存（修正2）
    let summary = "";
    if (complete) {
      summary = payload.decided.map((d) => `・${d.label}：${d.choice}`).join("\n");
    }
    const assistantContent = complete
      ? `${comment}\n\n― 決めたこと ―\n${summary}\n\nここからは、実行で迷ったことを何でも聞いてください。`
      : comment;
    const { data: saved } = await supabase
      .from("shisan_chat_messages")
      .insert({ signup_id: signupId, role: "assistant", content: assistantContent })
      .select("id")
      .single();

    // 残り相談回数（修正4：チャットと同一の1日上限にカウント）
    const { count: todayCount } = await supabase
      .from("shisan_chat_messages")
      .select("id", { count: "exact", head: true })
      .eq("signup_id", signupId).eq("role", "user")
      .gte("created_at", jstDayStartIso());
    const limit = dailyLimitFor((signup as { email?: string | null } | null)?.email ?? null);

    return NextResponse.json({
      ok: true,
      comment: assistantContent,
      messageId: saved?.id ?? null,
      complete,
      remainingChats: Math.max(0, limit - (todayCount ?? 0)), // 残相談回数（remainingは未決定質問の配列）
      ...payload,
    });
  } catch (err) {
    console.error("[api/shisan/flow] threw", err instanceof Error ? err.message : err);
    return NextResponse.json({ ok: false, error: "flow_failed" }, { status: 500 });
  }
}
