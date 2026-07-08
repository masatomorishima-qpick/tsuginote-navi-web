/**
 * /api/shisan/me
 *
 * セッション状態の確認（チャット画面の入口で使用）。
 * GET → { authenticated, scenario } （未ログインは authenticated: false のみ）
 */

import { NextResponse } from "next/server";
import { getSessionSignupId } from "@/lib/shisan/auth";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export async function GET() {
  const signupId = await getSessionSignupId();
  if (!signupId) return NextResponse.json({ authenticated: false });

  try {
    const supabase = createAdminSupabaseClient();
    const { data } = await supabase
      .from("shisan_signups").select("scenario").eq("id", signupId).maybeSingle();
    if (!data) return NextResponse.json({ authenticated: false });
    return NextResponse.json({ authenticated: true, scenario: data.scenario ?? null });
  } catch {
    return NextResponse.json({ authenticated: false });
  }
}
