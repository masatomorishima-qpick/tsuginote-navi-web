/**
 * lib/email/invitation.ts
 *
 * 家族連携の招待メール送信。
 *
 * Q22 で確定した文面に基づく。差出人は「つぎの手ナビ デジタル資産 <noreply@tsuginotenavi.jp>」。
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

  const subject = `[つぎの手ナビ] ${input.ownerDisplayName} さまから「もしものとき」の情報共有のご案内`;

  const text = `${input.recipientName} さま

${input.ownerDisplayName}（メール：${input.ownerEmail}）さまから、もしものときに必要な
情報の共有設定にあなたを連携先として指定したい、というご依頼が届きました。

【この案内は何ですか？】
つぎの手ナビ デジタル資産は、ご本人が亡くなったとき、大切な方（ご家族・ご友人など、信頼できる方）に
契約中のサービス・スマホや PC のロック解除パスワードといった情報をお届けする
サービスです。${input.ownerDisplayName} さまは、その「お届け先」の一人として
あなたを指定したいとお考えです。

【今すぐ何かが見られるわけではありません】
ご本人がご存命の間は、${input.ownerDisplayName} さまの情報があなたに共有されることは
ありません。ご本人が亡くなった事実が確認された後、はじめて開示されます。
（ご本人が「生前から共有」を ON にした場合のみ、生前から閲覧可能になります）

【ご対応のお願い】
下のリンクから、あなた専用のアカウントを作成（または既存のアカウントでログイン）
してください：

  ${acceptUrl}

このリンクは ${expires} まで有効です。期限を過ぎた場合、${input.ownerDisplayName}
さまから再度お送りいただく必要があります。

心当たりがない場合は、このメールを破棄してください。
何かのお間違いの可能性があります。

──
つぎの手ナビ デジタル資産
https://tsuginotenavi.jp
お問い合わせ：support@tsuginotenavi.jp
`;

  const html = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','Hiragino Sans','Noto Sans JP',sans-serif;background:#f8fafc;color:#1e293b;">
  <div style="max-width:600px;margin:0 auto;padding:40px 24px;">
    <div style="background:#ffffff;border-radius:16px;padding:32px;box-shadow:0 1px 3px rgba(0,0,0,0.08);">

      <h1 style="margin:0 0 16px;font-size:18px;font-weight:700;color:#065f46;">
        ${recipient} さま
      </h1>

      <p style="margin:0 0 16px;font-size:14px;line-height:1.7;">
        <strong>${owner}</strong>（メール：${ownerEmail}）さまから、もしものときに必要な
        情報の共有設定にあなたを連携先として指定したい、というご依頼が届きました。
      </p>

      <section style="margin:24px 0;padding:16px 20px;background:#f0fdf4;border-left:4px solid #10b981;border-radius:8px;">
        <p style="margin:0 0 8px;font-weight:600;font-size:14px;color:#065f46;">
          この案内は何ですか？
        </p>
        <p style="margin:0;font-size:13px;line-height:1.7;color:#1e293b;">
          つぎの手ナビ デジタル資産は、ご本人が亡くなったとき、大切な方（ご家族・ご友人など、信頼できる方）に
          契約中のサービス・スマホや PC のロック解除パスワードといった情報をお届けする
          サービスです。${owner} さまは、その「お届け先」の一人としてあなたを指定したいとお考えです。
        </p>
      </section>

      <section style="margin:24px 0;padding:16px 20px;background:#fefce8;border-left:4px solid #eab308;border-radius:8px;">
        <p style="margin:0 0 8px;font-weight:600;font-size:14px;color:#854d0e;">
          今すぐ何かが見られるわけではありません
        </p>
        <p style="margin:0;font-size:13px;line-height:1.7;color:#1e293b;">
          ご本人がご存命の間は、${owner} さまの情報があなたに共有されることはありません。
          ご本人が亡くなった事実が確認された後、はじめて開示されます。
          （ご本人が「生前から共有」を ON にした場合のみ、生前から閲覧可能になります）
        </p>
      </section>

      <div style="margin:32px 0;text-align:center;">
        <a href="${acceptUrl}"
           style="display:inline-block;padding:14px 32px;background:#059669;color:#ffffff;text-decoration:none;border-radius:9999px;font-weight:600;font-size:15px;">
          連携承認の手続きを開始する
        </a>
      </div>

      <p style="margin:8px 0;font-size:12px;color:#64748b;text-align:center;">
        このリンクは <strong>${expires}</strong> まで有効です。
      </p>

      <p style="margin:24px 0 0;font-size:12px;line-height:1.6;color:#64748b;">
        心当たりがない場合は、このメールを破棄してください。何かのお間違いの可能性があります。
      </p>
    </div>

    <div style="margin-top:24px;text-align:center;font-size:11px;color:#94a3b8;line-height:1.6;">
      <strong>つぎの手ナビ デジタル資産</strong><br>
      <a href="https://tsuginotenavi.jp" style="color:#94a3b8;text-decoration:underline;">https://tsuginotenavi.jp</a><br>
      お問い合わせ：support@tsuginotenavi.jp
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
