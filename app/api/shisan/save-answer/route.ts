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

  let question = "";
  let answer = "";
  try {
    const body = (await req.json()) as { question?: unknown; answer?: unknown };
    question = typeof body.question === "string" ? body.question.trim().slice(0, MAX_Q) : "";
    answer = typeof body.answer === "string" ? body.answer.trim().slice(0, MAX_A) : "";
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }
  if (!answer) return NextResponse.json({ ok: false, error: "empty" }, { status: 400 });

  try {
    const supabase = createAdminSupabaseClient();
    const { error } = await supabase.from("shisan_saved_answers").insert({
      signup_id: signupId,
      question,
      answer,
    });
    if (error) throw new Error(error.message);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[api/shisan/save-answer] threw", err instanceof Error ? err.message : err);
    return NextResponse.json({ ok: false, error: "save_failed" }, { status: 500 });
  }
}
