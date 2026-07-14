/**
 * /api/shisan/chat
 *
 * 伴走AIチャット（Phase1 要件§4）。
 * GET  → 会話履歴（直近30件）
 * POST { message } → コンテキスト注入つきでLLM呼び出し→履歴保存→応答を返す（一括応答）
 *
 * モデル：claude-haiku-4-5-20251001（軽量クラス・単価試算は実装報告書に記載）
 * 制御：1日20往復上限／1発言2,000文字（要件§8）／メールアドレスはLLMに送らない
 */

import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { getSessionSignupId } from "@/lib/shisan/auth";
import { buildDiagnosisContext, buildOfficialSummary, SYSTEM_PROMPT, stripMarkdown, stripInternalTerms, type StoreSnapshot, type PlanRecord } from "@/lib/shisan/context";
import { yen, computeRealloc, planAmountsFromMonthly, type ReportEntry } from "@/lib/shisan/calc";
import { extractPlanProposal, extractRealloc } from "@/lib/shisan/plan";
import { extractReallocFallback } from "@/lib/shisan/reallocExtract";
import { dailyLimitFor } from "@/lib/shisan/limits";

const MODEL = "claude-haiku-4-5-20251001";
const MAX_MESSAGE_CHARS = 2000;   // 入力上限（要件§8）
const HISTORY_MESSAGES = 12;      // コンテキストに入れる直近履歴（6往復）

/** JSTでの「今日」の開始時刻（UTC ISO） */
function jstDayStartIso(): string {
  const nowJst = new Date(Date.now() + 9 * 60 * 60 * 1000);
  const dayStartJst = Date.UTC(nowJst.getUTCFullYear(), nowJst.getUTCMonth(), nowJst.getUTCDate());
  return new Date(dayStartJst - 9 * 60 * 60 * 1000).toISOString();
}

export async function GET() {
  const signupId = await getSessionSignupId();
  if (!signupId) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });

  try {
    const supabase = createAdminSupabaseClient();
    const [{ data }, { count: todayCount }, { data: sg }] = await Promise.all([
      supabase
        .from("shisan_chat_messages")
        .select("id, role, content, feedback, created_at")
        .eq("signup_id", signupId)
        .order("created_at", { ascending: false })
        .limit(30),
      supabase
        .from("shisan_chat_messages")
        .select("id", { count: "exact", head: true })
        .eq("signup_id", signupId).eq("role", "user")
        .gte("created_at", jstDayStartIso()),
      supabase.from("shisan_signups").select("email").eq("id", signupId).maybeSingle(),
    ]);
    const limit = dailyLimitFor((sg as { email?: string | null } | null)?.email ?? null);
    return NextResponse.json({
      ok: true,
      messages: (data ?? []).reverse(),
      remaining: Math.max(0, limit - (todayCount ?? 0)),
      limit,
    });
  } catch {
    return NextResponse.json({ ok: false, error: "load_failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const signupId = await getSessionSignupId();
  if (!signupId) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error("[api/shisan/chat] ANTHROPIC_API_KEY 未設定");
    return NextResponse.json({ ok: false, error: "not_configured" }, { status: 500 });
  }

  let message = "";
  try {
    const body = (await req.json()) as { message?: unknown };
    message = typeof body.message === "string" ? body.message.trim() : "";
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }
  if (!message) return NextResponse.json({ ok: false, error: "empty" }, { status: 400 });
  if (message.length > MAX_MESSAGE_CHARS) {
    return NextResponse.json({ ok: false, error: "too_long" }, { status: 400 });
  }

  try {
    const supabase = createAdminSupabaseClient();

    // 会員データ（store）・実行申告・レート制限・履歴を取得
    const [{ data: signup }, { count: todayCount }, { data: historyDesc }, { data: reportRows }] = await Promise.all([
      supabase.from("shisan_signups").select("store, email").eq("id", signupId).maybeSingle(),
      supabase.from("shisan_chat_messages")
        .select("id", { count: "exact", head: true })
        .eq("signup_id", signupId).eq("role", "user")
        .gte("created_at", jstDayStartIso()),
      supabase.from("shisan_chat_messages")
        .select("role, content")
        .eq("signup_id", signupId)
        .order("created_at", { ascending: false })
        .limit(HISTORY_MESSAGES),
      supabase.from("shisan_action_reports")
        .select("action_id, status, monthly_amount, created_at")
        .eq("signup_id", signupId)
        .order("created_at", { ascending: true }),
    ]);
    const { data: planRows } = await supabase
      .from("shisan_action_plans")
      .select("action_id, goal_text, next_step_text, monthly_yen, updated_at")
      .eq("signup_id", signupId);

    if (!signup) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
    const limit = dailyLimitFor((signup as { email?: string | null }).email ?? null);
    if ((todayCount ?? 0) >= limit) {
      return NextResponse.json({ ok: false, error: "daily_limit", limit }, { status: 429 });
    }

    // コンテキスト組み立て（§4-2）：システム＋診断データ（実行申告の実効値込み・修正B）＋直近履歴＋新規発言
    const store = (signup.store ?? null) as StoreSnapshot | null;
    const reports: Record<string, ReportEntry> = {};
    (reportRows ?? []).forEach((r) => { reports[r.action_id] = { status: r.status, monthly_amount: r.monthly_amount }; });
    const plans: Record<string, PlanRecord> = {};
    (planRows ?? []).forEach((p) => {
      plans[p.action_id] = { goal: p.goal_text, nextStep: p.next_step_text, monthlyYen: p.monthly_yen, updatedAt: p.updated_at };
    });
    const context = buildDiagnosisContext(store, reports, plans);
    // 提案タグの金額検証用（単体で余力超えは破棄）
    const official = buildOfficialSummary(store?.inputs ?? null, store?.decisions ?? {}, reports, plans);
    const poolCap = official.shown?.pool ?? undefined;

    // マイページの自由対話モード（会員が「決める」場・4問フローは撤去）。
    // 修正4：realloc は「明確な決定の意思」のときだけ提案（雑談・比較・検討では出さない）。
    const flowNote = `\n\n【マイページの自由対話モード（会員が「決める」場）】
1. これはユーザー主導の自由な相談です。深掘りに必要なら1応答1問まで質問してよい（質問したら次の回答で完結させる）。診断データを文脈に、中立・非計算を維持して答える。
2. **配分（毎月の使い道）の変更は、ユーザーが明確に「決定」の意思を示したときだけ**、算数を一切せず次のタグを1つ返す：
<realloc>{"target":"liq/edu/prepay/nisaのいずれか","monthly_yen":希望額の円整数,"source":"補填元バケツID(liq/edu/prepay/nisa)／未配分ならunallocated／指定なければnull"}</realloc>
・「決定の意思」とは「〜に決めた」「〜に変える」「〜にして」「〜でお願い」等の確定表現。単なる質問・比較・検討・相談・雑談（「〜はどう？」「どっちがいい？」「〜だといくら？」等）では**絶対にタグを出さない**（雑談での乱発は信頼を壊す）。迷っている段階では、選択肢と数字の変化を示すにとどめ、タグは出さない。
・タグを出すときは本文で新しい金額を計算・提示しない。「変更後の配分は、次のカードでご確認ください」とだけ添える（結果金額・合計・差し引きを本文に書かない）。
・補填元が不明で未配分だけでは足りない場合のみ、タグを出さず本文で「どこから減らしますか？」と1回だけ聞く。
・バケツID：もしもの備え＝liq／教育費＝edu／繰り上げ返済と投資＝prepay／NISA＝nisa（「投資」は文脈に応じてprepayかnisa）。「実行メモ（申告額）」と「配分方針」は別物。
3. 方針（定性の次の一歩）がユーザーの言明で固まったときは、応答本文の後に次を1つ付ける：
<plan>{"action_id":"liq/edu/refi/prepay/nisaのいずれか","goal_text":"目標を40字以内","next_step_text":"次の一歩を40字以内","monthly_yen":合意時のみ円の整数（任意）}</plan>
・雑談・情報質問・まだ固まっていない会話では付けない。商品名・事業者名・推奨表現は入れない。
4. **保存を示唆する表現の禁止**：「承認します」「記録します」「更新しました」「保存しました」等を本文で言わない。保存はタグ→確認カード→ユーザー承認の経路でのみ起こる。
5. マークダウン記法（**太字**・#・箇条書き記号の*等）は使わない。強調は「」、箇条書きは「・」。`;
    const history = (historyDesc ?? []).reverse().map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content as string,
    }));

    const llmRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 700,
        system: `${SYSTEM_PROMPT}\n\n${context}${flowNote}`,
        messages: [...history, { role: "user", content: message }],
      }),
      cache: "no-store",
    });

    if (!llmRes.ok) {
      const detail = await llmRes.text().catch(() => "");
      console.error("[api/shisan/chat] LLM error", { status: llmRes.status, detail: detail.slice(0, 300) });
      return NextResponse.json({ ok: false, error: "llm_failed" }, { status: 502 });
    }
    const llmJson = (await llmRes.json()) as { content?: { type: string; text?: string }[] };
    const rawReply = (llmJson.content ?? [])
      .filter((c) => c.type === "text" && c.text)
      .map((c) => c.text)
      .join("\n")
      .trim();
    // 記録提案：タグを抽出しサーバー検証（金額は余力上限・単体超えは破棄）。伴走モードのみ有効
    const { text: afterRealloc, intent: taggedIntent } = extractRealloc(rawReply);
    const { text: replyBody, proposal } = extractPlanProposal(afterRealloc, poolCap);
    let reply = stripInternalTerms(stripMarkdown(replyBody));
    const validProposal = proposal;
    // フォールバック(c)：タグが無くても配分変更の気配（意図 or AIの確認表現）があれば
    //   専用の単機能抽出で意図を組み立て、承認カードを強制表示する（タグ発行の単一障害点を除去）。
    let reallocIntent = taggedIntent;
    if (!reallocIntent) {
      reallocIntent = await extractReallocFallback({ apiKey, model: MODEL, history, message, aiReply: rawReply });
    }
    // 配分変更（自由対話・修正1）：意図→サーバー計算→変更前→変更後の配分表（全変化行・合計＝余力）
    let realloc: unknown = null;
    let reallocHasRows = false;
    if (reallocIntent) {
      const curPA = planAmountsFromMonthly({
        liq: plans.liq?.monthlyYen ?? null, edu: plans.edu?.monthlyYen ?? null,
        prepay: plans.prepay?.monthlyYen ?? null, nisa: plans.nisa?.monthlyYen ?? null,
      });
      const rr = computeRealloc(store?.inputs ?? null, store?.decisions ?? {}, curPA,
        reallocIntent.target, reallocIntent.monthlyYen, reallocIntent.source, reports);
      if (rr.ok && rr.beforeRows && rr.afterRows) {
        const before = rr.beforeRows;
        realloc = {
          target: reallocIntent.target, targetLabel: rr.targetLabel,
          monthlyYen: reallocIntent.monthlyYen, source: reallocIntent.source,
          poolYen: yen(rr.poolYen ?? 0),
          rows: rr.afterRows.map((row, i) => ({
            key: row.key, label: row.label,
            beforeYen: yen(before[i].amount), afterYen: yen(row.amount),
            changed: before[i].amount !== row.amount,
          })),
        };
        reallocHasRows = true;
      } else if (rr.error === "over_pool") {
        realloc = { error: "over_pool", poolYen: yen(rr.poolYen ?? 0) };
      }
      // need_source は本文でAIが「どこから減らしますか？」と聞く前提（カードは出さない）
    }
    // 数字の正はカード（本文が金額を喋っても、ユーザーはカードの数字に従う設計）。
    // カードを出すときは、本文にカード優先の一文を必ず添える（本文の narration との齟齬を吸収）。
    if (reallocHasRows && !/カード/.test(reply)) {
      const note = "変更後の金額は、下のカードでご確認ください（本文の数字より、カードの数字が正です）。";
      reply = reply ? `${reply}\n\n${note}` : note;
    }
    // 既存方針がある一手への提案＝上書き提案（変更前→変更後プレビュー用・修正B）
    const previous = validProposal && plans[validProposal.actionId]
      ? { goal: plans[validProposal.actionId].goal, nextStep: plans[validProposal.actionId].nextStep, monthlyYen: plans[validProposal.actionId].monthlyYen }
      : null;
    if (!reply) return NextResponse.json({ ok: false, error: "empty_reply" }, { status: 502 });

    // 履歴保存（user→assistantの順。assistantのidをフィードバック用に返す）
    const { error: userInsErr } = await supabase
      .from("shisan_chat_messages").insert({ signup_id: signupId, role: "user", content: message });
    if (userInsErr) console.error("[api/shisan/chat] user insert failed", { message: userInsErr.message });
    const { data: saved, error: asstInsErr } = await supabase
      .from("shisan_chat_messages")
      .insert({ signup_id: signupId, role: "assistant", content: reply })
      .select("id")
      .single();
    if (asstInsErr) console.error("[api/shisan/chat] assistant insert failed", { message: asstInsErr.message });

    return NextResponse.json({
      ok: true,
      reply,
      messageId: saved?.id ?? null,
      remaining: Math.max(0, limit - (todayCount ?? 0) - 1),
      limit,
      proposal: validProposal, // {actionId, goal, nextStep, monthlyYen} | null（承認カード表示用）
      previous,                // 上書き提案時の変更前（修正B）
      realloc,                 // 配分変更の承認カード（変更前→変更後の配分表）| {error} | null（修正1）
    });
  } catch (err) {
    console.error("[api/shisan/chat] threw", err instanceof Error ? err.message : err);
    return NextResponse.json({ ok: false, error: "chat_failed" }, { status: 500 });
  }
}
