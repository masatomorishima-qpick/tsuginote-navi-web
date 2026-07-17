/**
 * /api/shisan/diagnosis/deep
 *
 * 二段診断（Wave 2・2-1）の第2段の回答を、同一 anon_id の最新の shisan_diagnoses 行に best-effort で反映する。
 * 設計は Wave 1 の /diagnosis と同じ思想：匿名（Cookie "sa"）・PII非保存・fire-and-forget・失敗は無音。
 * 第1段（診断入力）の保存とは別呼び出し。第2段は全タップ・全任意なので、部分回答でも受け付ける。
 */

import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

const MAX_BODY_BYTES = 8_000;
const oneOf = (v: unknown, allowed: string[]): string | null =>
  typeof v === "string" && allowed.includes(v) ? v : null;

const TOUCHED_KEYS = ["nisa", "refi", "buffer", "insurance", "ideco", "none"];
const ASSET_MIX = ["cash", "half", "invested"];
const PURPOSE = ["retire_living", "early_retire", "family_edu", "enjoy", "vague_anxiety"];
const HOUSEHOLD = ["single", "couple", "kids"];

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    const text = await req.text();
    if (text.length > MAX_BODY_BYTES) return NextResponse.json({ ok: false, error: "too_large" }, { status: 413 });
    body = JSON.parse(text) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  // 匿名ID（第1段と共用の Cookie "sa"）。無ければ紐づけ先が無いので何もしない。
  const cookieAnon = req.cookies.get("sa")?.value ?? "";
  if (!/^[0-9a-f-]{36}$/i.test(cookieAnon)) {
    return NextResponse.json({ ok: true, skipped: "no_anon" });
  }
  const anonId = cookieAnon;

  const touched = Array.isArray(body.touched)
    ? (body.touched as unknown[]).map((v) => (typeof v === "string" ? v : "")).filter((v) => TOUCHED_KEYS.includes(v))
    : [];
  const assetMix = oneOf(body.assetMix, ASSET_MIX);
  const purpose = oneOf(body.purpose, PURPOSE);
  const household = oneOf(body.household, HOUSEHOLD);
  const durationSec = (() => { const d = typeof body.durationSec === "number" ? body.durationSec : -1; return d >= 0 && d < 86400 ? Math.round(d) : null; })();

  try {
    const supabase = createAdminSupabaseClient();
    // 同一 anon_id の最新行（＝直前に第1段で作られた行）を1件更新する。
    const { data: latest } = await supabase
      .from("shisan_diagnoses")
      .select("id")
      .eq("anon_id", anonId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    const rowId = (latest as { id?: string } | null)?.id;
    if (!rowId) return NextResponse.json({ ok: true, skipped: "no_row" });

    const { error } = await supabase
      .from("shisan_diagnoses")
      .update({
        deep_done: true,
        deep_touched: touched,
        deep_asset_mix: assetMix,
        deep_purpose: purpose,
        deep_household: household,
        deep_duration_sec: durationSec,
        deep_at: new Date().toISOString(),
      })
      .eq("id", rowId);
    if (error) throw new Error(error.message);
  } catch (err) {
    console.error("[api/shisan/diagnosis/deep] update skipped", err instanceof Error ? err.message : err);
  }

  return NextResponse.json({ ok: true });
}
