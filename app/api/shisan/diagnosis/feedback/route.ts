/**
 * /api/shisan/diagnosis/feedback
 *
 * 満足度アンケート（第4区間・7/20）の回答を、同一 anon_id の最新の shisan_diagnoses 行に best-effort で反映する。
 * 設計は /diagnosis・/diagnosis/deep と同じ思想：匿名（Cookie "sa"）・PII非保存・fire-and-forget・失敗は無音。
 * 同じ診断行を上書き更新するため、連打しても二重記録にならない。
 * 自由記述は長さ上限を設けて保存（個人が分かる内容は書かないよう画面で案内している）。
 */

import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

const MAX_BODY_BYTES = 4_000;
const MAX_FREE_CHARS = 100;
const oneOf = (v: unknown, allowed: string[]): string | null =>
  typeof v === "string" && allowed.includes(v) ? v : null;

const ANSWERS = ["answered", "partial", "mismatch"];
const REASONS = ["amount", "steps", "comparison", "basis", "other"];
const HELPFULS = ["monthly", "harsh", "compare", "explanation"];

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    const text = await req.text();
    if (text.length > MAX_BODY_BYTES) return NextResponse.json({ ok: false, error: "too_large" }, { status: 413 });
    body = JSON.parse(text) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const cookieAnon = req.cookies.get("sa")?.value ?? "";
  if (!/^[0-9a-f-]{36}$/i.test(cookieAnon)) return NextResponse.json({ ok: true, skipped: "no_anon" });

  const answer = oneOf(body.answer, ANSWERS);
  const reason = oneOf(body.reason, REASONS);
  const helpful = oneOf(body.helpful, HELPFULS);
  const free = typeof body.free === "string" && body.free.trim()
    ? body.free.trim().slice(0, MAX_FREE_CHARS) : null;

  try {
    const supabase = createAdminSupabaseClient();
    const { data: latest } = await supabase
      .from("shisan_diagnoses")
      .select("id")
      .eq("anon_id", cookieAnon)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    const rowId = (latest as { id?: string } | null)?.id;
    if (!rowId) return NextResponse.json({ ok: true, skipped: "no_row" });

    const { error } = await supabase
      .from("shisan_diagnoses")
      .update({
        sat_answer: answer, sat_reason: reason, sat_helpful: helpful, sat_free: free,
        sat_at: new Date().toISOString(),
      })
      .eq("id", rowId);
    if (error) throw new Error(error.message);
  } catch (err) {
    console.error("[api/shisan/diagnosis/feedback] update skipped", err instanceof Error ? err.message : err);
  }

  return NextResponse.json({ ok: true });
}
