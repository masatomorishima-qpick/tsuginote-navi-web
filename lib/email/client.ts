/**
 * lib/email/client.ts
 *
 * Resend REST API への薄いラッパー。
 *
 * 設計：SDK を使わず fetch 直叩き（依存最小化、Vercel Edge 相性）。
 *
 * 失敗時の方針：
 *   - 設定不備（API キー未設定 等）：ログを出して送信スキップ、呼び出し側に false を返す
 *   - API エラー：例外を投げず false を返す（メール送信失敗で UX フローを止めない）
 *
 * 環境変数：
 *   RESEND_API_KEY       … Resend のシークレットキー（re_xxx）
 *   RESEND_FROM_EMAIL    … 差出人メールアドレス（noreply@tsuginotenavi.jp）
 */

import 'server-only';

const RESEND_API_BASE = 'https://api.resend.com';

export type SendEmailInput = {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  /** 差出人を上書きしたい場合（既定は env の RESEND_FROM_EMAIL） */
  from?: string;
  /** 「{差出人名} <noreply@xxx>」の差出人名（表示名）。Phase 1 では「つぎの手ナビ」固定 */
  fromDisplayName?: string;
  replyTo?: string;
};

export type SendEmailResult =
  | { ok: true; id: string }
  | { ok: false; error: string; skipped?: boolean; detail?: string };

function getApiKey(): string | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  // 未設定プレースホルダの検出
  if (key.startsWith('re_xxxxxx')) return null;
  return key;
}

function getFromAddress(input?: { from?: string; fromDisplayName?: string }): string {
  const address =
    input?.from ?? process.env.RESEND_FROM_EMAIL ?? 'noreply@tsuginotenavi.jp';
  const displayName = input?.fromDisplayName ?? 'つぎの手ナビ デジタル資産';
  return `${displayName} <${address}>`;
}

export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.warn(
      '[lib/email/client] RESEND_API_KEY が未設定のため、メール送信をスキップします。',
      { to: input.to, subject: input.subject }
    );
    return {
      ok: false,
      error: 'api_key_not_configured',
      skipped: true,
      detail: 'RESEND_API_KEY を .env.local に設定してください。',
    };
  }

  try {
    const res = await fetch(`${RESEND_API_BASE}/emails`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: getFromAddress(input),
        to: Array.isArray(input.to) ? input.to : [input.to],
        subject: input.subject,
        html: input.html,
        text: input.text,
        reply_to: input.replyTo,
      }),
      cache: 'no-store',
    });

    const json = (await res.json()) as { id?: string; error?: { message?: string } };

    if (!res.ok) {
      const errMsg =
        json?.error?.message ?? `Resend API error ${res.status}`;
      console.error('[lib/email/client] send failed', { status: res.status, errMsg });
      return { ok: false, error: 'send_failed', detail: errMsg };
    }

    if (!json.id) {
      return { ok: false, error: 'no_message_id' };
    }

    return { ok: true, id: json.id };
  } catch (err) {
    const detail = err instanceof Error ? err.message : 'network_error';
    console.error('[lib/email/client] threw', detail);
    return { ok: false, error: 'network_error', detail };
  }
}
