/**
 * lib/email/loginReminder.ts
 *
 * 定期ログイン催促（情報の最新化リマインド）メール。
 *
 * 目的：一定期間ログインのない利用者に、つぎの手ナビへ戻って
 *   「パスワードの変更」「デジタル資産の追加・削除」など登録情報を
 *   最新化していただくよう促す。エクセル等での自己管理に対する
 *   本サービスの差別化価値（情報が古くならない仕組み）の中核。
 *
 * 送信は app/api/cron/login-reminders から行う。
 */

import 'server-only';
import { sendEmail, type SendEmailResult } from './client';

export type LoginReminderEmailInput = {
  recipientEmail: string;
  /** 表示名（無ければ「ご利用者さま」にフォールバック） */
  displayName?: string | null;
  /** 最終ログインからの経過日数 */
  daysSinceLogin: number;
  /** ダッシュボード URL */
  dashboardUrl: string;
};

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function sendLoginReminderEmail(
  input: LoginReminderEmailInput
): Promise<SendEmailResult> {
  const name = input.displayName?.trim() || 'ご利用者さま';
  const subject = '[つぎの手ナビ] 登録情報の確認・更新のお願い';

  const text = `${name}

つぎの手ナビ デジタル資産をご利用いただきありがとうございます。

前回のご利用から ${input.daysSinceLogin} 日が経過しました。
この機会に、ご登録内容が最新かどうかをご確認ください。

【ご確認のおすすめ】
・パスワードを変更したサービスはありませんか？
・新しく使い始めたサブスク・SNS・ネット銀行などはありませんか？
・解約・退会したサービスは登録に残っていませんか？

もしものとき、大切な方に正確な情報をお届けするために、
登録内容を最新に保っておくことが大切です。

▼ ダッシュボードを開いて確認する
${input.dashboardUrl}

※ このお知らせの頻度は、設定 → 通知 からいつでも変更・停止できます。

──
つぎの手ナビ デジタル資産
お問い合わせ：info@blueadventures.jp
`;

  const html = `<!DOCTYPE html>
<html lang="ja"><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','Hiragino Sans','Noto Sans JP',sans-serif;background:#f8fafc;color:#1e293b;">
  <div style="max-width:600px;margin:0 auto;padding:40px 24px;">
    <div style="background:#ffffff;border-radius:16px;padding:32px;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
      <h1 style="margin:0 0 16px;font-size:18px;color:#0f766e;">登録情報の確認・更新のお願い</h1>
      <p style="margin:0 0 12px;font-size:14px;line-height:1.7;">
        ${escapeHtml(name)}、つぎの手ナビ デジタル資産をご利用いただきありがとうございます。
      </p>
      <p style="margin:0 0 12px;font-size:14px;line-height:1.7;">
        前回のご利用から <b>${input.daysSinceLogin} 日</b> が経過しました。
        この機会に、ご登録内容が最新かどうかをご確認ください。
      </p>
      <section style="margin:20px 0;padding:16px 20px;background:#f0fdfa;border-left:4px solid #14b8a6;border-radius:8px;">
        <p style="margin:0 0 8px;font-size:13px;line-height:1.7;font-weight:600;color:#0f766e;">
          ご確認のおすすめ
        </p>
        <ul style="margin:4px 0 0;padding-left:20px;font-size:13px;line-height:1.8;color:#334155;">
          <li>パスワードを変更したサービスはありませんか？</li>
          <li>新しく使い始めたサブスク・SNS・ネット銀行などはありませんか？</li>
          <li>解約・退会したサービスが登録に残っていませんか？</li>
        </ul>
      </section>
      <p style="margin:0 0 20px;font-size:13px;line-height:1.7;color:#334155;">
        もしものとき、大切な方に正確な情報をお届けするために、登録内容を最新に保っておくことが大切です。
      </p>
      <p style="text-align:center;margin:24px 0;">
        <a href="${escapeHtml(input.dashboardUrl)}" style="display:inline-block;background:#0d9488;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 28px;border-radius:9999px;">
          ダッシュボードを開いて確認する
        </a>
      </p>
      <p style="margin:16px 0 0;font-size:11px;line-height:1.7;color:#94a3b8;">
        ※ このお知らせの頻度は、設定 → 通知 からいつでも変更・停止できます。
      </p>
    </div>
    <div style="margin-top:24px;text-align:center;font-size:11px;color:#94a3b8;">
      つぎの手ナビ デジタル資産<br>info@blueadventures.jp
    </div>
  </div>
</body></html>`;

  return sendEmail({
    to: input.recipientEmail,
    subject,
    html,
    text,
  });
}
