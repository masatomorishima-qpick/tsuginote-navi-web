/**
 * /api/shisan/signup
 *
 * /shisan 会員登録（第一陣・開発依頼書_20260703 要件1）。
 * - email＋Store スナップショット（inputs/decisions/firstVisit）＋scenario を upsert 保存。
 * - 同一 email の再送信はエラーにせず上書き（onConflict: email）。
 * - 保存成功後に「保存完了」メールを1通送る（Resend・失敗してもレスポンスは成功のまま）。
 * - 認証・ログイン・マジックリンクは作らない（第二陣スコープ）。
 */

import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email/client";

const SITE_URL = "https://www.tsuginotenavi.jp";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_STORE_BYTES = 20_000; // Store スナップショットの上限（異常値ガード）

type SignupPayload = {
  email?: unknown;
  scenario?: unknown;
  store?: unknown;
};

function safeScenario(v: unknown): string | null {
  return v === "A" || v === "B" || v === "C" ? v : null;
}

function safeStore(v: unknown): Record<string, unknown> | null {
  if (!v || typeof v !== "object" || Array.isArray(v)) return null;
  try {
    const json = JSON.stringify(v);
    if (json.length > MAX_STORE_BYTES) return null;
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  let payload: SignupPayload;
  try {
    payload = (await req.json()) as SignupPayload;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const email =
    typeof payload.email === "string" ? payload.email.trim().toLowerCase().slice(0, 254) : "";
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ ok: false, error: "invalid_email" }, { status: 400 });
  }

  const scenario = safeScenario(payload.scenario);
  const store = safeStore(payload.store);

  try {
    const supabase = createAdminSupabaseClient();
    const { error } = await supabase
      .from("shisan_signups")
      .upsert(
        { email, scenario, store, updated_at: new Date().toISOString() },
        { onConflict: "email" }
      );

    if (error) {
      console.error("[api/shisan/signup] upsert failed", { message: error.message });
      return NextResponse.json({ ok: false, error: "save_failed" }, { status: 500 });
    }
  } catch (err) {
    console.error("[api/shisan/signup] threw", err instanceof Error ? err.message : err);
    return NextResponse.json({ ok: false, error: "save_failed" }, { status: 500 });
  }

  // 保存完了メール（最小・失敗しても登録自体は成功として返す）
  const result = await sendEmail({
    to: email,
    subject: "【つぎの手ナビ】診断結果と決めた一手を保存しました",
    fromDisplayName: "つぎの手ナビ",
    html: [
      "<p>つぎの手ナビ 資産づくり（β）をご利用いただきありがとうございます。</p>",
      "<p>あなたの診断結果と、決めた一手を保存しました。<br/>",
      "次に診断へ戻ると、あなたの一手がどれだけ効いたかを見届けられます。</p>",
      `<p><a href="${SITE_URL}/shisan">診断に戻る</a>（入力内容はご利用の端末（ブラウザ）にも保存されています）</p>`,
      "<p style=\"color:#64748b;font-size:12px\">登録は無料です。削除をご希望の場合は、このメールに返信してお知らせください。</p>",
    ].join(""),
    text: [
      "つぎの手ナビ 資産づくり（β）をご利用いただきありがとうございます。",
      "あなたの診断結果と、決めた一手を保存しました。",
      `診断に戻る: ${SITE_URL}/shisan`,
      "登録は無料です。削除をご希望の場合は、このメールに返信してお知らせください。",
    ].join("\n"),
  });

  return NextResponse.json({ ok: true, emailSent: result.ok });
}
