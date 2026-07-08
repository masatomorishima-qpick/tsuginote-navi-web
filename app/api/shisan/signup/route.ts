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
import { createToken, createLoginToken, createSessionToken, SESSION_COOKIE, sessionCookieOptions } from "@/lib/shisan/auth";

const SITE_URL = "https://www.tsuginotenavi.jp";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_STORE_BYTES = 20_000; // Store スナップショットの上限（異常値ガード）

type SignupPayload = {
  email?: unknown;
  scenario?: unknown;
  store?: unknown;
  summary?: unknown;
};

/* 確認メール用サマリー（追加依頼_20260703）。フロントの既存表示値をそのまま受け取り整形のみ行う。
 * 年収・資産の生値は受け取らない設計（結果値のみ）。 */
type MailSummary = {
  phase: string;
  poolYen: string;
  future65Man: string;
  r: number;
  decisions: { label: string; choice: string }[];
};

function safeScenario(v: unknown): string | null {
  return v === "A" || v === "B" || v === "C" ? v : null;
}

function safeText(v: unknown, max: number): string {
  return typeof v === "string" ? v.replace(/[<>]/g, "").trim().slice(0, max) : "";
}

function safeSummary(v: unknown): MailSummary | null {
  if (!v || typeof v !== "object" || Array.isArray(v)) return null;
  const o = v as Record<string, unknown>;
  const phase = safeText(o.phase, 40);
  const poolYen = safeText(o.poolYen, 20);
  const future65Man = safeText(o.future65Man, 20);
  const r = typeof o.r === "number" && isFinite(o.r) && o.r >= 0 && o.r <= 100 ? o.r : 3;
  if (!phase || !poolYen || !future65Man) return null;
  const decisions = Array.isArray(o.decisions)
    ? o.decisions.slice(0, 10).flatMap((d) => {
        if (!d || typeof d !== "object") return [];
        const label = safeText((d as Record<string, unknown>).label, 30);
        const choice = safeText((d as Record<string, unknown>).choice, 40);
        return label && choice ? [{ label, choice }] : [];
      })
    : [];
  return { phase, poolYen, future65Man, r, decisions };
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
  const summary = safeSummary(payload.summary);

  /* 新規/既存の分岐（追加要件F）：
   * 新規メール → 会員作成＋即セッション発行（診断→AIの間のメール往復の壁を除去）
   * 既存メール → 即セッションなし・データ上書きなし・ログインリンク再送のみ
   *   （なりすまし登録による既存会員データの閲覧・上書きを防ぐ） */
  const host = req.headers.get("host") ?? "";
  const base = host.startsWith("localhost") || host.startsWith("127.0.0.1") ? `http://${host}` : SITE_URL;

  let signupId: string | null = null;
  try {
    const supabase = createAdminSupabaseClient();
    const { data: existing } = await supabase
      .from("shisan_signups").select("id").eq("email", email).maybeSingle();

    if (existing?.id) {
      // 既存会員：ログインリンクを再送して案内（本文は最小）
      const relink = `${base}/api/shisan/auth?token=${encodeURIComponent(createLoginToken(existing.id))}`;
      await sendEmail({
        to: email,
        subject: "【つぎの手ナビ】ログインリンク",
        fromDisplayName: "つぎの手ナビ",
        html: [
          "<p>このメールアドレスはすでに登録されています。</p>",
          `<p><a href="${relink}">ログインして続きへ</a>（有効期限：24時間）</p>`,
          "<p style=\"color:#64748b;font-size:12px\">心当たりがない場合は、このメールを破棄してください。</p>",
        ].join(""),
        text: [
          "このメールアドレスはすでに登録されています。",
          `ログインして続きへ: ${relink}`,
          "（有効期限：24時間）心当たりがない場合は、このメールを破棄してください。",
        ].join("\n"),
      });
      return NextResponse.json({ ok: true, existing: true });
    }

    const { data, error } = await supabase
      .from("shisan_signups")
      .insert({ email, scenario, store, updated_at: new Date().toISOString() })
      .select("id")
      .single();

    if (error) {
      console.error("[api/shisan/signup] insert failed", { message: error.message });
      return NextResponse.json({ ok: false, error: "save_failed" }, { status: 500 });
    }
    signupId = data?.id ?? null;
  } catch (err) {
    console.error("[api/shisan/signup] threw", err instanceof Error ? err.message : err);
    return NextResponse.json({ ok: false, error: "save_failed" }, { status: 500 });
  }

  // 保存完了メール（診断内容入り・失敗しても登録自体は成功として返す）
  // 実態のない約束は書かない。今できること（内容が手元のメールに残る）だけを伝える。
  const summaryHtml = summary
    ? [
        `<p style="margin:16px 0 4px;color:#334155;font-weight:bold">── あなたの診断 ──</p>`,
        `<p style="margin:0">いまのフェーズ：${summary.phase}<br/>`,
        `毎月の余力：¥${summary.poolYen}<br/>`,
        `65歳の見込み：約¥${summary.future65Man}万（想定リターン${summary.r}%の目安）</p>`,
        ...(summary.decisions.length > 0
          ? [
              `<p style="margin:16px 0 4px;color:#334155;font-weight:bold">── 決めたこと ──</p>`,
              `<p style="margin:0">${summary.decisions.map((d) => `・${d.label}：${d.choice}`).join("<br/>")}</p>`,
            ]
          : []),
      ].join("")
    : "";
  const summaryText = summary
    ? [
        "",
        "── あなたの診断 ──",
        `いまのフェーズ：${summary.phase}`,
        `毎月の余力：¥${summary.poolYen}`,
        `65歳の見込み：約¥${summary.future65Man}万（想定リターン${summary.r}%の目安）`,
        ...(summary.decisions.length > 0
          ? ["", "── 決めたこと ──", ...summary.decisions.map((d) => `・${d.label}：${d.choice}`)]
          : []),
        "",
      ].join("\n")
    : "";

  // ログインリンク（Phase1 §3：確認メールから戻れるように。TTLは30日＝「次に来たとき」に応える。
  // ログイン再送リンク（/api/shisan/login経由）は24hの短期トークンを使う）
  const loginLink = signupId
    ? `${base}/api/shisan/auth?token=${encodeURIComponent(createToken(signupId, 30 * 24 * 60 * 60 * 1000))}`
    : `${base}/shisan/chat`;

  const result = await sendEmail({
    to: email,
    subject: "【つぎの手ナビ】診断結果と決めたことを保存しました",
    fromDisplayName: "つぎの手ナビ",
    html: [
      "<p>つぎの手ナビ 資産づくり（β）をご利用いただきありがとうございます。</p>",
      "<p>診断結果と、決めたことを保存しました。</p>",
      summaryHtml,
      `<p style="margin-top:16px"><a href="${loginLink}">AIに相談を始める（ログイン）</a><br/>`,
      `<span style="color:#64748b;font-size:12px">あなたの診断結果を知っているAIに、無料で相談できます。次に来たときもこのリンクから戻れます。</span></p>`,
      `<p style="margin-top:16px;color:#64748b;font-size:12px">すべて目安です。特定の金融商品・保険・サービスの推奨や投資助言は行いません。</p>`,
      `<p><a href="${SITE_URL}/shisan">つぎの手ナビ 資産づくり</a></p>`,
    ].join(""),
    text: [
      "つぎの手ナビ 資産づくり（β）をご利用いただきありがとうございます。",
      "診断結果と、決めたことを保存しました。",
      summaryText,
      `AIに相談を始める（ログイン）: ${loginLink}`,
      "あなたの診断結果を知っているAIに、無料で相談できます。次に来たときもこのリンクから戻れます。",
      "",
      "すべて目安です。特定の金融商品・保険・サービスの推奨や投資助言は行いません。",
      `つぎの手ナビ 資産づくり: ${SITE_URL}/shisan`,
    ].join("\n"),
  });

  // 新規会員：即セッション発行（追加要件F。メールを開かずにAIへ進める）
  const res = NextResponse.json({ ok: true, emailSent: result.ok, session: !!signupId });
  if (signupId) {
    res.cookies.set(SESSION_COOKIE, createSessionToken(signupId), sessionCookieOptions());
  }
  return res;
}
