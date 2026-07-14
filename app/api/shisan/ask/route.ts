/**
 * /api/shisan/ask
 *
 * 非会員向け「聞きたいことを書く→アクション案を返す」エンドポイント（AI導線の全面移行・要因A対処）。
 * - 認証不要（会員登録の前に価値体験させるため）。診断snapshot（store）はクライアントから受け取る。
 * - 既存のチャット資産を流用：buildDiagnosisContext / buildOfficialSummary / SYSTEM_PROMPT / 整形。
 * - 返すのは「現状説明」でなく「アクション案」（数字に基づく選択肢と変化）。投資助言はしない・計算はさせない。
 * - フリーテキストは一次情報として shisan_anon_questions に best-effort 保存（PII＝メール等は保存しない）。
 *   連続質問の紐づけ用に匿名ID（Cookie "sa"・PIIではない）を anon_id として保存。応答内容・UI・CV・広告は不変。
 *
 * 軽いガード（MVP）：入力2000字上限＋store形式検証。ANTHROPIC_API_KEY 必須。
 */

import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { buildDiagnosisContext, SYSTEM_PROMPT, stripMarkdown, stripInternalTerms, type StoreSnapshot } from "@/lib/shisan/context";
import { judgeScenario, deriveBuckets, surplusBand, type Inputs } from "@/lib/shisan/calc";

const MODEL = "claude-haiku-4-5-20251001";
const MAX_QUESTION_CHARS = 2000;
const MAX_STORE_BYTES = 20_000;

/** 応答形式の指示：アクション案を「言い切る」。この応答に限り、上位ルールの丸投げ締めを上書きする。 */
const ASK_INSTRUCTION = `【この応答の絶対ルール：アクション案を1往復で言い切る】
これは「アクション案」を返す応答です。上の一般ルールに『決めるのはあなた』的な締めや『〜すべきと言わない』という指示がありますが、この応答では以下を最優先し、必ず具体的なアクションの提示で完結させます（中立＝特定の商品・事業者・銘柄の推奨や個別の投資助言をしないことだけは維持）。

1. 回答の最後を質問で終えてはならない。必ず「まずはこれをやるといい」という具体的な次のアクションの提示で締める。
2. 判断をユーザーに丸投げする表現（「決めるのはあなたです」「あなた次第です」等）で終えない。その人の数字だと、まず何をやるべきかを、選択肢とその変化とともに言い切る。
3. 1往復で完結させる。追加の情報を集めるための逆質問をしない。必要な数字はすでに【会員の診断データ】にあるので、それを使って答える。
4. コンテキストの計算済み数値だけを使い、"何をするとどう変わるか"を具体的な一手（やること → あなたの数字での変化）として1〜2個、言い切る。数値は転記し自分で計算しない。含まれない数値は「この場では正確に計算できません」と言う。
5. 中立は維持：特定の金融商品・事業者名・銘柄の推奨や個別の投資助言はしない。ただし「あなたの数字ならAとBの選択肢があり、それぞれこう変わる。一般にはこう考える。まずはこれから始めるとよい」までは言い切ってよい。
6. 末尾に「他に気になることがあれば教えてください」を1文だけ添えるのは可。ただし主文は必ずアクション案で完結させ、その一文は締めの"質問返し"にしない（言い切った上での任意の追伸にとどめる）。
7. マークダウン記法（**・#・箇条書きの*等）は使わない。強調は「」、箇条書きは・。`;

function safeStore(v: unknown): StoreSnapshot | null {
  if (!v || typeof v !== "object" || Array.isArray(v)) return null;
  try {
    const json = JSON.stringify(v);
    if (json.length > MAX_STORE_BYTES) return null;
    const parsed = JSON.parse(json) as StoreSnapshot;
    if (!parsed.inputs || typeof parsed.inputs !== "object") return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error("[api/shisan/ask] ANTHROPIC_API_KEY 未設定");
    return NextResponse.json({ ok: false, error: "not_configured" }, { status: 500 });
  }

  let question = "";
  let store: StoreSnapshot | null = null;
  try {
    const body = (await req.json()) as { question?: unknown; store?: unknown };
    question = typeof body.question === "string" ? body.question.trim() : "";
    store = safeStore(body.store);
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }
  if (!question) return NextResponse.json({ ok: false, error: "empty" }, { status: 400 });
  if (question.length > MAX_QUESTION_CHARS) return NextResponse.json({ ok: false, error: "too_long" }, { status: 400 });
  if (!store) return NextResponse.json({ ok: false, error: "invalid_store" }, { status: 400 });

  const inputs = (store.inputs ?? null) as Inputs | null;

  try {
    // 既存のコンテキスト生成を流用（reports/plans は非会員なので空）。数字はここから注入＝AIに計算させない。
    const context = buildDiagnosisContext(store, {}, {});

    const llmRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": apiKey, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 700,
        system: `${SYSTEM_PROMPT}\n\n${context}\n\n${ASK_INSTRUCTION}`,
        messages: [{ role: "user", content: question }],
      }),
      cache: "no-store",
    });
    if (!llmRes.ok) {
      const detail = await llmRes.text().catch(() => "");
      console.error("[api/shisan/ask] LLM error", { status: llmRes.status, detail: detail.slice(0, 300) });
      return NextResponse.json({ ok: false, error: "llm_failed" }, { status: 502 });
    }
    const llmJson = (await llmRes.json()) as { content?: { type: string; text?: string }[] };
    const rawAnswer = (llmJson.content ?? [])
      .filter((c) => c.type === "text" && c.text)
      .map((c) => c.text)
      .join("\n")
      .trim();
    const answer = stripInternalTerms(stripMarkdown(rawAnswer));
    if (!answer) return NextResponse.json({ ok: false, error: "empty_reply" }, { status: 502 });

    // 匿名ID（連続質問の紐づけ用・PIIではない）。Cookieから復元し、無ければ発行。
    const cookieAnon = req.cookies.get("sa")?.value ?? "";
    const anonId = /^[0-9a-f-]{36}$/i.test(cookieAnon) ? cookieAnon : crypto.randomUUID();

    // 一次情報として best-effort 保存（失敗しても回答は返す＝既存メール送信と同じ思想）。PIIは保存しない。
    try {
      const supabase = createAdminSupabaseClient();
      await supabase.from("shisan_anon_questions").insert({
        anon_id: anonId,
        question,
        answer,
        scenario: judgeScenario(inputs),
        surplus_band: inputs ? surplusBand(inputs.surplus) : null,
        buckets_count: deriveBuckets(inputs).length,
      });
    } catch (saveErr) {
      console.error("[api/shisan/ask] save skipped", saveErr instanceof Error ? saveErr.message : saveErr);
    }

    // 応答内容・UI・CV・広告には影響しない。分析用に匿名IDを再送（30日）＝同一訪問者の連続質問を紐づける。
    const res = NextResponse.json({ ok: true, answer });
    res.cookies.set("sa", anonId, { httpOnly: true, sameSite: "lax", secure: true, path: "/", maxAge: 60 * 60 * 24 * 30 });
    return res;
  } catch (err) {
    console.error("[api/shisan/ask] threw", err instanceof Error ? err.message : err);
    return NextResponse.json({ ok: false, error: "ask_failed" }, { status: 500 });
  }
}
