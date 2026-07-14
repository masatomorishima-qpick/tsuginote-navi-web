/**
 * /api/shisan/save-answer
 *
 * 診断結果画面で表示したアクション案（回答全文＋質問）を、会員に紐付けて保存する（修正3）。
 * 「マイページに保存」＝会員登録（即セッション）直後に、そのセッションで呼ばれる。
 * マイページで「保存したアドバイス」として全文表示する記録（配分数字とは非連動）。
 * 認証必須（getSessionSignupId）。best-effort（保存失敗は握りつぶさず400/500で返すが、呼び出し側は致命にしない）。
 */

import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { getSessionSignupId } from "@/lib/shisan/auth";

const MAX_Q = 2000;
const MAX_A = 8000;

export async function POST(req: NextRequest) {
  const signupId = await getSessionSignupId();
  if (!signupId) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });

  // 単発 {question, answer} と、まとめ {items:[{question,answer}...]} の両方に対応（メール送信時に一括保存するため）
  const clean = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
  let rows: { signup_id: string; question: string; answer: string }[] = [];
  try {
    const body = (await req.json()) as {
      question?: unknown; answer?: unknown;
      items?: { question?: unknown; answer?: unknown }[];
    };
    const raw = Array.isArray(body.items)
      ? body.items
      : [{ question: body.question, answer: body.answer }];
    rows = raw
      .map((it) => ({ signup_id: signupId, question: clean(it.question, MAX_Q), answer: clean(it.answer, MAX_A) }))
      .filter((r) => r.answer.length > 0);
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }
  if (rows.length === 0) return NextResponse.json({ ok: false, error: "empty" }, { status: 400 });

  try {
    const supabase = createAdminSupabaseClient();
    const { error } = await supabase.from("shisan_saved_answers").insert(rows);
    if (error) throw new Error(error.message);
    return NextResponse.json({ ok: true, saved: rows.length });
  } catch (err) {
    console.error("[api/shisan/save-answer] threw", err instanceof Error ? err.message : err);
    return NextResponse.json({ ok: false, error: "save_failed" }, { status: 500 });
  }
}
