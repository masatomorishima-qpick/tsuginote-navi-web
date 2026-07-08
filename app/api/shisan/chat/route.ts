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
import { undecidedBuckets } from "@/lib/shisan/flow";
import { BUCKET_LABEL, yen, computeRealloc, planAmountsFromMonthly, type ReportEntry } from "@/lib/shisan/calc";
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

    // 質問進行中の自由入力（修正指示書_20260707 修正3：逆質問禁止・完結回答・復帰宣言）
    const undecided = undecidedBuckets(store?.inputs ?? null, store?.decisions ?? {});
    const flowNote = undecided.length > 0
      ? `\n\n【割り込み応答の制約（いま方針決めの質問進行中・残り${undecided.length}問：${undecided.map((b) => BUCKET_LABEL[b]).join("・")}）】
1. ユーザーへの逆質問・追加の聞き返しを一切しない（応答を疑問文で終えない）。手持ちの【会員の診断データ】と決定状況だけで完結した回答を返す。
2. 情報が足りず一般論しか言えない場合は、「詳しい状況は、質問が終わってからゆっくり伺います」と正直に添える。
3. 応答の最後は、改行して「では、質問の続きです。」で締める（それ以外の締め方をしない）。質問文そのものは書かない（画面が別途提示します）。
4. マークダウン記法（**太字**・#・箇条書き記号の*等）はここでも禁止。強調は「」、箇条書きは「・」。`
      : `\n\n【伴走モードの追加ルール（方針決めは完了済み）】
1. 深掘りに必要なら、1応答につき1つまでユーザーへ質問してよい。質問した場合は、次のユーザーの回答を受けてから完結した回答を返すこと（聞いたのに答えない、を禁止）。質問は応答の最後に置く。
2. 会話でユーザーの方針が固まったとき（目標の言明・選択肢の決定・配分の合意）、および**既存の方針の変更・更新の言明**（「やっぱり〜にしたい」「〜に変える」「目標を〜に」等）を受けたときは、応答本文の後に次の形式のタグを1つ付ける：
<plan>{"action_id":"liq/edu/refi/prepay/nisaのいずれか該当する一手","goal_text":"目標を40字以内","next_step_text":"次の一歩を40字以内","monthly_yen":毎月の金額が合意されていれば円の整数（任意・例 20000）}</plan>
・雑談・情報質問・方針がまだ固まっていない会話では絶対に付けない（乱発は信頼を下げる）。
・タグ内に商品名・事業者名・「おすすめ」等の推奨表現を入れない。
・monthly_yenは会話で合意された毎月の金額を円の整数でそのまま。goal_text内に金額を書く場合もコンテキストの値を円表記で転記（「万」への換算・言い換え禁止。単位誤りは信頼を壊す）。
・タグは記録の「提案」であり、記録するかはユーザーが決める（確認カードが別途表示される）。本文で記録を押し付けない。
・配分や見込みの再計算はあなたの仕事ではない。タグで方針を記録すれば、システムが正確に再計算して画面（配分表・65歳見込み）に反映する。「計算できないので記録できない」という理由でタグを出し惜しみしない——対象の一手と金額が合意できていれば、まずタグを出す。本文では「記録すると、マイページの配分と見込みに反映されます」と案内してよい。
3. **保存を示唆する表現の禁止**：「承認します」「記録します」「更新しました」「保存しました」等を本文で言わない。保存はタグ→確認カード→ユーザー承認の経路でのみ起こる。会話上の受け止めは「その方針に変えるのですね」までにとどめる。
4. 配分（毎月の使い道）の金額を変える意図（例「備えを月6,000円に」「投資を減らして備えへ」）を受けたら、算数を一切せず次のタグを1つ**必ず**返す：
<realloc>{"target":"liq/edu/prepay/nisaのいずれか","monthly_yen":希望額の円整数,"source":"補填元バケツID(liq/edu/prepay/nisa)／未配分からならunallocated／指定なければnull"}</realloc>
・対象の一手（target）と金額が分かれば、確認を求める前に必ずこのタグを出す。本文で新しい金額を述べたり「〜になります」「確定しますか？」と聞くだけでタグを出さずに終わらせない（タグを出せば承認カードが自動で表示され、ユーザーがそこで確認・承認する）。本文は「変更後の配分をカードでお見せします。ご確認ください。」の一文にとどめる。
・新しい配分金額を本文で計算・提示しない（合計・差し引き・「＋◯」・「投資は月¥◯になる」等の結果金額を書かない）。『変更後の配分は、次のカードでご確認ください』とだけ添える。変更前→変更後の配分表はシステムが計算し承認カードで見せる。
・補填元がユーザー発言から不明で未配分だけでは足りない場合のみ、タグを出さず本文で「どこから減らしますか？」と1回だけ聞く（明言済みなら聞かない）。
・バケツID対応：もしもの備え＝liq／教育費＝edu／繰り上げ返済と投資＝prepay／NISA＝nisa（「投資」は文脈に応じてprepayかnisa）。
・「実行メモ（申告額）」と「配分方針」は別物。申告額を配分方針として扱わない。`;
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
    const validProposal = undecided.length === 0 ? proposal : null;
    // フォールバック(c)：タグが無くても配分変更の気配（意図 or AIの確認表現）があれば
    //   専用の単機能抽出で意図を組み立て、承認カードを強制表示する（タグ発行の単一障害点を除去）。
    let reallocIntent = taggedIntent;
    if (undecided.length === 0 && !reallocIntent) {
      reallocIntent = await extractReallocFallback({ apiKey, model: MODEL, history, message, aiReply: rawReply });
    }
    // 配分変更（伴走モードのみ・修正1）：意図→サーバー計算→変更前→変更後の配分表（全変化行・合計＝余力）
    let realloc: unknown = null;
    let reallocHasRows = false;
    if (undecided.length === 0 && reallocIntent) {
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
