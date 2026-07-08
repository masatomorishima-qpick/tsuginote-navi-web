/**
 * /api/shisan/login
 *
 * マジックリンクの送信（Phase1 要件§3）。
 * POST { email } → 登録済みならログインリンクをメール送信。
 * メールアドレスの存在有無を漏らさないため、レスポンスは常に { ok: true }。
 */

import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email/client";
import { createLoginToken } from "@/lib/shisan/auth";

const SITE_URL = "https://www.tsuginotenavi.jp";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function baseUrl(req: NextRequest): string {
  // ローカル開発ではリンクをlocalhostに向ける（メール内リンクの検証用）
  const host = req.headers.get("host") ?? "";
  if (host.startsWith("localhost") || host.startsWith("127.0.0.1")) return `http://${host}`;
  return SITE_URL;
}

export async function POST(req: NextRequest) {
  let email = "";
  try {
    const body = (await req.json()) as { email?: unknown };
    email = typeof body.email === "string" ? body.email.trim().toLowerCase().slice(0, 254) : "";
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ ok: false, error: "invalid_email" }, { status: 400 });
  }

  try {
    const supabase = createAdminSupabaseClient();
    const { data } = await supabase
      .from("shisan_signups").select("id").eq("email", email).maybeSingle();

    if (data?.id) {
      const link = `${baseUrl(req)}/api/shisan/auth?token=${encodeURIComponent(createLoginToken(data.id))}`;
      await sendEmail({
        to: email,
        subject: "【つぎの手ナビ】ログインリンク",
        fromDisplayName: "つぎの手ナビ",
        html: [
          "<p>つぎの手ナビ 資産づくり（β）のログインリンクです。</p>",
          `<p><a href="${link}">ログインして続きへ</a>（有効期限：24時間）</p>`,
          "<p style=\"color:#64748b;font-size:12px\">心当たりがない場合は、このメールを破棄してください。</p>",
        ].join(""),
        text: [
          "つぎの手ナビ 資産づくり（β）のログインリンクです。",
          `ログインして続きへ: ${link}`,
          "（有効期限：24時間）心当たりがない場合は、このメールを破棄してください。",
        ].join("\n"),
      });
    }
  } catch (err) {
    console.error("[api/shisan/login] threw", err instanceof Error ? err.message : err);
    // 失敗しても外形は同じ応答（存在有無・障害の詳細を漏らさない）
  }

  return NextResponse.json({ ok: true });
}
