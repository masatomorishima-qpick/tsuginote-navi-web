/**
 * lib/email/accountDeletion.ts
 *
 * アカウント削除完了通知メール。
 * 削除自体は不可逆操作なので、ユーザーに記録（エビデンス）が残るよう必ず送信する。
 *
 * 注：削除と同時に auth.users から行が消えるため、メール送信は削除「前」または「直後」に
 *     行う必要がある（送信に使うアドレスを別途取得しておく）。
 */

import 'server-only';
import { sendEmail, type SendEmailResult } from './client';

export type AccountDeletionEmailInput = {
  recipientEmail: string;
  /** 削除完了日時（既定：現在時刻） */
  deletedAt?: Date;
};

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

export async function sendAccountDeletionEmail(
  input: AccountDeletionEmailInput
): Promise<SendEmailResult> {
  const when = formatJaDateTime(input.deletedAt ?? new Date());
  const emailForBody = escapeHtml(input.recipientEmail);

  const subject = '[つぎの手ナビ] アカウント削除のお知らせ';

  const text = `以下のメールアドレスのアカウントを削除しました。

  メールアドレス：${input.recipientEmail}
  削除日時：${when}

【削除された情報】
・ご登録のアカウント情報
・登録されたデジタル資産・サービス情報
・登録されたデバイス・パスワード保管情報
・連携設定・共有リンク
・リマインダー設定

【ご注意】
この削除は取り消すことができません。再度ご利用される場合は、新規ご登録が必要です。

このメールに心当たりがない場合は、第三者により操作された可能性があります。
お手数ですが、support@tsuginotenavi.jp までご連絡ください。

ご利用いただきまして、誠にありがとうございました。

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
      <h1 style="margin:0 0 16px;font-size:18px;font-weight:700;color:#1e293b;">
        アカウント削除のお知らせ
      </h1>
      <p style="margin:0 0 16px;font-size:14px;line-height:1.7;">
        以下のメールアドレスのアカウントを削除いたしました。
      </p>

      <table style="width:100%;border-collapse:collapse;margin:16px 0;">
        <tr>
          <td style="padding:6px 0;font-size:13px;color:#64748b;width:120px;">メールアドレス</td>
          <td style="padding:6px 0;font-size:13px;color:#1e293b;"><b>${emailForBody}</b></td>
        </tr>
        <tr>
          <td style="padding:6px 0;font-size:13px;color:#64748b;">削除日時</td>
          <td style="padding:6px 0;font-size:13px;color:#1e293b;"><b>${escapeHtml(when)}</b></td>
        </tr>
      </table>

      <section style="margin:20px 0;padding:16px 20px;background:#f8fafc;border-left:4px solid #94a3b8;border-radius:8px;">
        <p style="margin:0 0 8px;font-weight:600;font-size:13px;color:#334155;">
          削除された情報
        </p>
        <ul style="margin:0;padding-left:20px;font-size:12px;line-height:1.7;color:#475569;">
          <li>ご登録のアカウント情報</li>
          <li>登録されたデジタル資産・サービス情報</li>
          <li>登録されたデバイス・パスワード保管情報</li>
          <li>連携設定・共有リンク</li>
          <li>リマインダー設定</li>
        </ul>
      </section>

      <section style="margin:20px 0;padding:16px 20px;background:#fef2f2;border-left:4px solid #ef4444;border-radius:8px;">
        <p style="margin:0 0 8px;font-weight:600;font-size:13px;color:#991b1b;">
          ご注意
        </p>
        <p style="margin:0;font-size:12px;line-height:1.7;color:#7f1d1d;">
          この削除は取り消すことができません。再度ご利用される場合は、新規ご登録が必要です。
        </p>
      </section>

      <section style="margin:20px 0;padding:16px 20px;background:#fffbeb;border-left:4px solid #f59e0b;border-radius:8px;">
        <p style="margin:0 0 8px;font-weight:600;font-size:13px;color:#92400e;">
          このメールに心当たりがない場合
        </p>
        <p style="margin:0;font-size:12px;line-height:1.7;color:#78350f;">
          第三者によりアカウント操作が行われた可能性があります。
          お手数ですが、<a href="mailto:support@tsuginotenavi.jp" style="color:#92400e;text-decoration:underline;">support@tsuginotenavi.jp</a> までご連絡ください。
        </p>
      </section>

      <p style="margin:24px 0 0;font-size:13px;color:#64748b;text-align:center;">
        ご利用いただきまして、誠にありがとうございました。
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
