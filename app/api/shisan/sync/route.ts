/**
 * /api/shisan/sync
 *
 * 再診断とサーバーデータの同期（追加要件C・訴求の根幹）。
 * ログイン済みユーザーの診断確定・ダッシュボード表示時に store を最新化し、
 * AIが常に最新の数字で話せるようにする。
 * POST { store, scenario } → セッションの signup 行を更新。
 */

import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { getSessionSignupId } from "@/lib/shisan/auth";

const MAX_STORE_BYTES = 20_000;

export async function POST(req: NextRequest) {
  const signupId = await getSessionSignupId();
  if (!signupId) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });

  let store: Record<string, unknown> | null = null;
  let scenario: string | null = null;
  try {
    const body = (await req.json()) as { store?: unknown; scenario?: unknown };
    scenario = body.scenario === "A" || body.scenario === "B" || body.scenario === "C" ? body.scenario : null;
    if (body.store && typeof body.store === "object" && !Array.isArray(body.store)) {
      const json = JSON.stringify(body.store);
      if (json.length <= MAX_STORE_BYTES) store = JSON.parse(json) as Record<string, unknown>;
    }
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }
  if (!store) return NextResponse.json({ ok: false, error: "invalid_store" }, { status: 400 });

  try {
    const supabase = createAdminSupabaseClient();
    const { error } = await supabase
      .from("shisan_signups")
      .update({ store, scenario, updated_at: new Date().toISOString() })
      .eq("id", signupId);
    if (error) throw new Error(error.message);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[api/shisan/sync] threw", err instanceof Error ? err.message : err);
    return NextResponse.json({ ok: false, error: "sync_failed" }, { status: 500 });
  }
}
