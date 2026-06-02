/**
 * lib/email/invitation.ts
 *
 * 家族連携の招待メール送信。
 *
 * 差出人は「つぎの手ナビ デジタル資産 <noreply@tsuginotenavi.jp>」。
 * 2026-06 リデザイン：Apple Store 風シンプルテンプレートに刷新。
 *   - 装飾的なカラーカードを削除し、白背景 + 薄いボーダー + 余白多めに
 *   - 不要な敬語・繰り返し表現を削除して 1/3 程度の文字量に
 *   - お問い合わせ先表記は削除（受信メール未対応のため）
 *
 * テンプレ要素：
 *   - {owner_display_name} : 招待を送る本人の表示名
 *   - {owner_email}        : 本人のメールアドレス
 *   - {recipient_name}     : 招待相手の呼称
 *   - {accept_url}         : 承認画面の URL（トークン付き）
 *   - {expires_at}         : 有効期限（日本語表記）
 */

import 'server-only';
import { sendEmail, type SendEmailResult } from './client';

export type InvitationEmailInput = {
  recipientEmail: string;
  recipientName: string;
  ownerDisplayName: string;
  ownerEmail: string;
  acceptUrl: string;
  expiresAt: Date;
};

function formatJaDate(d: Date): string {
  return new Intl.DateTimeFormat('ja-JP', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function sendInvitationEmail(
  input: InvitationEmailInput
): Promise<SendEmailResult> {
  const owner = escapeHtml(input.ownerDisplayName);
  const ownerEmail = escapeHtml(input.ownerEmail);
  const recipient = escapeHtml(input.recipientName);
  const expires = formatJaDate(input.expiresAt);
  const acceptUrl = input.acceptUrl;

  const subject = `${input.ownerDisplayName} さまから連携のご案内 | つぎの手ナビ`;

  const text = `${input.recipientName} さま

${input.ownerDisplayName} さま（${input.ownerEmail}）から、
つぎの手ナビ デジタル資産の連携先として指定されました。

ご本人がご存命の間は、情報があなたに共有されることはありません。
ご本人が亡くなった事実が確認された後、はじめて開示されます。

下のリンクから連携を承認してください：

${acceptUrl}

このリンクは ${expires} まで有効です。

心当たりがない場合は、このメールを破棄してください。

──
つぎの手ナビ デジタル資産
https://tsuginotenavi.jp
お問い合わせ：info@blueadventures.jp
`;

  const html = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','Hiragino Sans','Noto Sans JP',sans-serif;background:#f5f5f0;color:#111827;-webkit-font-smoothing:antialiased;">
  <div style="max-width:560px;margin:0 auto;padding:48px 24px;">

    <!-- 見出し -->
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;line-height:1.4;color:#111827;letter-spacing:-0.01em;">
      連携のご案内
    </h1>
    <p style="margin:0 0 40px;font-size:14px;color:#6b7280;">
      つぎの手ナビ デジタル資産
    </p>

    <!-- 本文 -->
    <p style="margin:0 0 24px;font-size:16px;line-height:1.7;color:#111827;">
      ${recipient} さま
    </p>

    <p style="margin:0 0 32px;font-size:15px;line-height:1.8;color:#374151;">
      <strong style="color:#111827;">${owner}</strong> さま（${ownerEmail}）から、つぎの手ナビ デジタル資産の連携先として指定されました。
    </p>

    <!-- 重要案内：シンプルな枠線のみ -->
    <div style="margin:0 0 40px;padding:20px 24px;border:1px solid #e5e7eb;border-radius:12px;background:#ffffff;">
      <p style="margin:0;font-size:14px;line-height:1.8;color:#374151;">
        ご本人がご存命の間は、情報があなたに共有されることはありません。<br>
        ご本人が亡くなった事実が確認された後、はじめて開示されます。
      </p>
    </div>

    <!-- CTA -->
    <div style="margin:0 0 16px;text-align:center;">
      <a href="${acceptUrl}"
         style="display:inline-block;padding:16px 40px;background:#059669;color:#ffffff;text-decoration:none;border-radius:9999px;font-weight:600;font-size:15px;letter-spacing:0.01em;">
        連携を承認する
      </a>
    </div>

    <p style="margin:0 0 48px;font-size:13px;color:#9ca3af;text-align:center;">
      このリンクは ${expires} まで有効です
    </p>

    <!-- 補足 -->
    <p style="margin:0 0 8px;font-size:13px;line-height:1.7;color:#9ca3af;">
      心当たりがない場合は、このメールを破棄してください。
    </p>

    <!-- フッター -->
    <div style="margin-top:48px;padding-top:24px;border-top:1px solid #e5e7eb;text-align:center;">
      <p style="margin:0 0 4px;font-size:12px;color:#9ca3af;line-height:1.7;">
        <a href="https://tsuginotenavi.jp" style="color:#9ca3af;text-decoration:none;">tsuginotenavi.jp</a>
      </p>
      <p style="margin:0;font-size:11px;color:#9ca3af;line-height:1.6;">
        お問い合わせ：<a href="mailto:info@blueadventures.jp" style="color:#9ca3af;text-decoration:underline;">info@blueadventures.jp</a>
      </p>
    </div>

  </div>
</body>
</html>`;

  return sendEmail({
    to: input.recipientEmail,
    subject,
    html,
    text,
    fromDisplayName: 'つぎの手ナビ デジタル資産',
  });
}
