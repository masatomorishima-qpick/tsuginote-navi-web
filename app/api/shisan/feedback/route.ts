/**
 * /api/shisan/feedback
 *
 * AI応答へのフィードバック（Phase1 要件§7-2）。
 * POST { messageId, helpful: boolean } → shisan_chat_messages.feedback を更新。
 */

import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { getSessionSignupId } from "@/lib/shisan/auth";

export async function POST(req: NextRequest) {
  const signupId = await getSessionSignupId();
  if (!signupId) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });

  let messageId = "", helpful: boolean | null = null;
  try {
    const body = (await req.json()) as { messageId?: unknown; helpful?: unknown };
    messageId = typeof body.messageId === "string" ? body.messageId.slice(0, 64) : "";
    helpful = typeof body.helpful === "boolean" ? body.helpful : null;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }
  if (!messageId || helpful === null) {
    return NextResponse.json({ ok: false, error: "invalid_params" }, { status: 400 });
  }

  try {
    const supabase = createAdminSupabaseClient();
    const { error } = await supabase
      .from("shisan_chat_messages")
      .update({ feedback: helpful ? "helpful" : "not_helpful" })
      .eq("id", messageId)
      .eq("signup_id", signupId)   // 他人のメッセージは更新不可
      .eq("role", "assistant");
    if (error) throw new Error(error.message);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[api/shisan/feedback] threw", err instanceof Error ? err.message : err);
    return NextResponse.json({ ok: false, error: "save_failed" }, { status: 500 });
  }
}
