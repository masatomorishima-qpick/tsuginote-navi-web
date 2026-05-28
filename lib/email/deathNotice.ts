/**
 * lib/email/deathNotice.ts
 *
 * 死後検証フローで使うメールテンプレート群。
 *   - sendObjectionInvitationEmail : 本人へ「異議申立用 URL」を含む通知
 *   - sendDisclosureNotifyEmail    : 14 日経過後に連携者全員へ「情報をご確認いただけます」
 */

import 'server-only';
import { sendEmail, type SendEmailResult } from './client';

function formatJaDateTime(d: Date): string {
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

// ============================================================================
// 異議申立用メール（運営確認後、本人宛て）
// ============================================================================

export type ObjectionInvitationEmailInput = {
  recipientEmail: string;
  ownerDisplayName: string;
  notifierDisplayName: string;
  objectionUrl: string;
  deadline: Date;
};

export async function sendObjectionInvitationEmail(
  input: ObjectionInvitationEmailInput
): Promise<SendEmailResult> {
  const deadline = formatJaDateTime(input.deadline);
  const subject = `[つぎの手ナビ] 大切な確認のお願い（ご本人確認）`;

  const text = `${input.ownerDisplayName} さま

つぎの手ナビ デジタル資産を運営しております。

本日、${input.notifierDisplayName} さまから、${input.ownerDisplayName} さまが
お亡くなりになったとのご報告がございました。書類確認の結果、ご本人への
最終確認のメールをお送りしています。

万が一の確認のため、ご本人にこのメールをお送りしております。
ご本人がこのメールをお読みいただいているということは、報告に何らかの誤りが
含まれている可能性があります。

下記のリンクから「私は生きています」のご確認をワンクリックでお願いいたします：

  ${input.objectionUrl}

このリンクは ${deadline} まで有効です。
${deadline} までに異議申立をいただけない場合、${input.notifierDisplayName} さまの
報告内容に基づき、大切な方への情報開示が行われます。

ご不明な点がございましたら、こちらまでお問い合わせください：
  support@tsuginotenavi.jp

──
つぎの手ナビ デジタル資産
`;

  const html = `<!DOCTYPE html>
<html lang="ja">
<head><meta charset="utf-8"><title>${escapeHtml(subject)}</title></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','Hiragino Sans','Noto Sans JP',sans-serif;background:#f8fafc;color:#1e293b;">
  <div style="max-width:600px;margin:0 auto;padding:40px 24px;">
    <div style="background:#ffffff;border-radius:16px;padding:32px;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
      <h1 style="margin:0 0 16px;font-size:18px;color:#b91c1c;">大切な確認のお願い</h1>
      <p style="margin:0 0 12px;font-size:14px;line-height:1.7;">
        ${escapeHtml(input.ownerDisplayName)} さま、つぎの手ナビ デジタル資産を運営しております。
      </p>
      <p style="margin:0 0 12px;font-size:14px;line-height:1.7;">
        本日、<b>${escapeHtml(input.notifierDisplayName)}</b> さまから、
        ${escapeHtml(input.ownerDisplayName)} さまがお亡くなりになったとのご報告がございました。
        書類確認の結果、ご本人への最終確認のメールをお送りしております。
      </p>
      <section style="margin:20px 0;padding:16px 20px;background:#fef2f2;border-left:4px solid #ef4444;border-radius:8px;">
        <p style="margin:0;font-size:13px;line-height:1.7;color:#7f1d1d;">
          ご本人がこのメールをお読みになっているということは、報告に誤りが含まれている可能性があります。
          下のボタンから「私は生きています」をワンクリックでご確認ください。
        </p>
      </section>
      <div style="margin:32px 0;text-align:center;">
        <a href="${input.objectionUrl}"
           style="display:inline-block;padding:14px 32px;background:#dc2626;color:#ffffff;text-decoration:none;border-radius:9999px;font-weight:600;font-size:15px;">
          私は生きています（異議申立）
        </a>
      </div>
      <p style="margin:8px 0;font-size:12px;color:#64748b;text-align:center;">
        このリンクは <b>${escapeHtml(deadline)}</b> まで有効です。
      </p>
      <p style="margin:16px 0 0;font-size:12px;line-height:1.7;color:#64748b;">
        期限までに異議申立がない場合、${escapeHtml(input.notifierDisplayName)} さまの報告内容に基づき、
        大切な方への情報開示が行われます。
      </p>
    </div>
    <div style="margin-top:24px;text-align:center;font-size:11px;color:#94a3b8;line-height:1.6;">
      <strong>つぎの手ナビ デジタル資産</strong><br>
      お問い合わせ：support@tsuginotenavi.jp
    </div>
  </div>
</body></html>`;

  return sendEmail({
    to: input.recipientEmail,
    subject,
    html,
    text,
    fromDisplayName: 'つぎの手ナビ デジタル資産',
  });
}

// ============================================================================
// 開示通知メール（14 日経過後、連携者全員宛て）
// ============================================================================

export type DisclosureNotifyEmailInput = {
  recipientEmail: string;
  recipientName: string;       // 「妻」「長男」など、連携時に owner が付けた呼称
  ownerDisplayName: string;
  dashboardUrl: string;        // 連携者のダッシュボード URL
};

export async function sendDisclosureNotifyEmail(
  input: DisclosureNotifyEmailInput
): Promise<SendEmailResult> {
  const subject = `[つぎの手ナビ] ${input.ownerDisplayName} さまの情報をご確認いただけます`;

  const text = `${input.recipientName} さま

故 ${input.ownerDisplayName} さまから連携先としてご指定いただいておりました
情報の開示が確定しました。

下記のページから内容をご確認いただけます：

  ${input.dashboardUrl}

ご確認の際は、ご自身で設定いただいた連携の合言葉の入力が必要です。
（連携承認時にご設定いただいた連携の合言葉です）

──
つぎの手ナビ デジタル資産
お問い合わせ：support@tsuginotenavi.jp
`;

  const html = `<!DOCTYPE html>
<html lang="ja">
<head><meta charset="utf-8"><title>${escapeHtml(subject)}</title></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','Hiragino Sans','Noto Sans JP',sans-serif;background:#f8fafc;color:#1e293b;">
  <div style="max-width:600px;margin:0 auto;padding:40px 24px;">
    <div style="background:#ffffff;border-radius:16px;padding:32px;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
      <h1 style="margin:0 0 16px;font-size:18px;color:#1e293b;">
        ${escapeHtml(input.ownerDisplayName)} さまの情報をご確認いただけます
      </h1>
      <p style="margin:0 0 16px;font-size:14px;line-height:1.7;">
        ${escapeHtml(input.recipientName)} さま、<br>
        故 <b>${escapeHtml(input.ownerDisplayName)}</b> さまから連携先としてご指定いただいておりました
        情報の開示が確定しました。
      </p>
      <div style="margin:24px 0;text-align:center;">
        <a href="${input.dashboardUrl}"
           style="display:inline-block;padding:14px 32px;background:#7c3aed;color:#ffffff;text-decoration:none;border-radius:9999px;font-weight:600;font-size:15px;">
          情報を確認する
        </a>
      </div>
      <section style="margin:20px 0;padding:16px 20px;background:#f5f3ff;border-left:4px solid #7c3aed;border-radius:8px;">
        <p style="margin:0;font-size:13px;line-height:1.7;color:#5b21b6;">
          ご確認の際は、ご自身で設定いただいた<b>連携の合言葉</b>の入力が必要です。
          連携承認時にご設定いただいた連携の合言葉をお使いください。
        </p>
      </section>
    </div>
    <div style="margin-top:24px;text-align:center;font-size:11px;color:#94a3b8;line-height:1.6;">
      <strong>つぎの手ナビ デジタル資産</strong><br>
      お問い合わせ：support@tsuginotenavi.jp
    </div>
  </div>
</body></html>`;

  return sendEmail({
    to: input.recipientEmail,
    subject,
    html,
    text,
    fromDisplayName: 'つぎの手ナビ デジタル資産',
  });
}
