/**
 * lib/email/trialReminder.ts
 *
 * トライアル終了に関する 2 種のメール送信。
 *   - sendTrialWarningEmail   : 終了 N 日前のリマインド
 *   - sendTrialEndedEmail     : 満了当日通知
 */

import 'server-only';
import { sendEmail, type SendEmailResult } from './client';

export type TrialWarningEmailInput = {
  recipientEmail: string;
  daysLeft: number;
  trialExpiresAt: Date;
  upgradeUrl: string; // 例：https://tsuginotenavi.jp/digital/settings/plan
};

export type TrialEndedEmailInput = {
  recipientEmail: string;
  endedAt: Date;
  upgradeUrl: string;
};

function formatJaDate(d: Date): string {
  return new Intl.DateTimeFormat('ja-JP', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
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
// 終了 N 日前リマインド
// ============================================================================

export async function sendTrialWarningEmail(
  input: TrialWarningEmailInput
): Promise<SendEmailResult> {
  const exp = formatJaDate(input.trialExpiresAt);
  const subject = `[つぎの手ナビ] 無料トライアル終了まであと ${input.daysLeft} 日`;

  const text = `つぎの手ナビ デジタル資産 をご利用いただきありがとうございます。

無料トライアル期間が、あと ${input.daysLeft} 日（${exp} まで）で終了いたします。

引き続き有料プランの機能（スマホ・パソコン のパスワード保管、大切な方への連携アカウント等）をご利用いただくには、クレジットカードのご登録をお願いいたします。

  ${input.upgradeUrl}

カードを登録されない場合は、トライアル終了後に自動的に無料プランへ切り替わり、有料プラン限定機能（パスワード保管など）はご利用いただけなくなります。
ご登録いただいたデジタル資産情報は失われずに保持されます。

ご不明な点がございましたら、お気軽にお問い合わせください。

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
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','Hiragino Sans','Noto Sans JP',sans-serif;background:#f8fafc;color:#1e293b;">
  <div style="max-width:600px;margin:0 auto;padding:40px 24px;">
    <div style="background:#ffffff;border-radius:16px;padding:32px;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
      <h1 style="margin:0 0 16px;font-size:18px;font-weight:700;color:#92400e;">
        無料トライアル終了まであと ${input.daysLeft} 日
      </h1>
      <p style="margin:0 0 16px;font-size:14px;line-height:1.7;">
        いつもご利用いただきありがとうございます。<br>
        無料トライアル期間が、あと <b>${input.daysLeft} 日</b>（${escapeHtml(exp)} まで）で終了いたします。
      </p>
      <section style="margin:24px 0;padding:16px 20px;background:#fef3c7;border-left:4px solid #f59e0b;border-radius:8px;">
        <p style="margin:0;font-size:13px;line-height:1.7;color:#78350f;">
          引き続き有料プランの機能（スマホ・パソコン のパスワード保管、大切な方への連携アカウント等）をご利用いただくには、クレジットカードのご登録をお願いいたします。
        </p>
      </section>

      <div style="margin:32px 0;text-align:center;">
        <a href="${input.upgradeUrl}"
           style="display:inline-block;padding:14px 32px;background:#059669;color:#ffffff;text-decoration:none;border-radius:9999px;font-weight:600;font-size:15px;">
          クレジットカードを登録する
        </a>
      </div>

      <p style="margin:16px 0 0;font-size:12px;line-height:1.7;color:#64748b;">
        カードを登録されない場合は、トライアル終了後に自動的に無料プランへ切り替わり、有料プラン限定機能はご利用いただけなくなります。<strong>ご登録いただいた情報は失われずに保持されます。</strong>
      </p>
    </div>
    <div style="margin-top:24px;text-align:center;font-size:11px;color:#94a3b8;line-height:1.6;">
      <strong>つぎの手ナビ デジタル資産</strong><br>
      <a href="https://tsuginotenavi.jp" style="color:#94a3b8;text-decoration:underline;">https://tsuginotenavi.jp</a><br>
      お問い合わせ：info@blueadventures.jp
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

// ============================================================================
// 前日（24h 前）最終リマインド
// ============================================================================

export type TrialFinalReminderEmailInput = {
  recipientEmail: string;
  trialExpiresAt: Date;
  upgradeUrl: string;
};

/**
 * トライアル終了前日の最終リマインド。
 * 早期リマインド（sendTrialWarningEmail）より緊急性・訴求を高めた専用文面。
 * 「失う機能」と「もしものときの引き継ぎが止まる」ことを具体的に伝える。
 */
export async function sendTrialFinalReminderEmail(
  input: TrialFinalReminderEmailInput
): Promise<SendEmailResult> {
  const exp = formatJaDate(input.trialExpiresAt);
  const subject = `【明日まで】無料トライアルが終了します｜つぎの手ナビ`;

  const text = `無料トライアルは明日（${exp}）で終了します。

このままクレジットカードのご登録がないと、トライアル終了とともに次の機能がご利用いただけなくなり、自動的に無料プランへ切り替わります。

・スマホ・パソコンのパスワード保管
・大切な方への連携（あなたにもしものことがあったとき、ご家族へ情報を引き継ぐ仕組み）

「もしものとき、ご家族がパスワードやアカウントを引き継げない」——その状態に戻さないために、継続をおすすめします。

料金は連携 1 名あたり 月額 110 円（税込）。ご登録はおよそ 1 分で完了します。

  ${input.upgradeUrl}

※ ご登録いただいたデジタル資産情報は、無料プランでも失われずに保持されます。いつでも再開できます。

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
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','Hiragino Sans','Noto Sans JP',sans-serif;background:#f8fafc;color:#1e293b;">
  <div style="max-width:600px;margin:0 auto;padding:40px 24px;">
    <div style="background:#ffffff;border-radius:16px;padding:32px;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
      <span style="display:inline-block;margin:0 0 12px;padding:4px 12px;border-radius:9999px;background:#fef2f2;color:#b91c1c;font-size:12px;font-weight:700;">
        明日まで
      </span>
      <h1 style="margin:0 0 16px;font-size:20px;font-weight:700;color:#1e293b;line-height:1.5;">
        無料トライアルが <span style="color:#b91c1c;">明日（${escapeHtml(exp)}）</span>で終了します
      </h1>
      <p style="margin:0 0 16px;font-size:14px;line-height:1.8;color:#374151;">
        このままクレジットカードのご登録がないと、トライアル終了とともに次の機能がご利用いただけなくなり、自動的に無料プランへ切り替わります。
      </p>

      <section style="margin:0 0 20px;padding:16px 20px;background:#fef2f2;border-left:4px solid #ef4444;border-radius:8px;">
        <p style="margin:0 0 8px;font-weight:600;font-size:13px;color:#991b1b;">
          終了後に使えなくなる機能
        </p>
        <ul style="margin:0;padding-left:20px;font-size:13px;line-height:1.8;color:#7f1d1d;">
          <li>スマホ・パソコンのパスワード保管</li>
          <li>大切な方への連携（もしものとき、ご家族へ情報を引き継ぐ仕組み）</li>
        </ul>
      </section>

      <p style="margin:0 0 8px;font-size:14px;line-height:1.8;color:#374151;">
        「もしものとき、ご家族がパスワードやアカウントを引き継げない」——その状態に戻さないために、継続をおすすめします。
      </p>
      <p style="margin:0 0 24px;font-size:13px;line-height:1.7;color:#6b7280;">
        料金は連携 1 名あたり <strong style="color:#111827;">月額 110 円（税込）</strong>。ご登録はおよそ 1 分で完了します。
      </p>

      <div style="margin:0 0 8px;text-align:center;">
        <a href="${input.upgradeUrl}"
           style="display:inline-block;padding:14px 36px;background:#059669;color:#ffffff;text-decoration:none;border-radius:9999px;font-weight:600;font-size:15px;">
          登録して継続する
        </a>
      </div>

      <p style="margin:16px 0 0;font-size:12px;line-height:1.7;color:#94a3b8;">
        ※ ご登録いただいたデジタル資産情報は、無料プランでも失われずに保持されます。いつでも再開できます。
      </p>
    </div>
    <div style="margin-top:24px;text-align:center;font-size:11px;color:#94a3b8;line-height:1.6;">
      <strong>つぎの手ナビ デジタル資産</strong><br>
      <a href="https://tsuginotenavi.jp" style="color:#94a3b8;text-decoration:underline;">https://tsuginotenavi.jp</a><br>
      お問い合わせ：info@blueadventures.jp
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

// ============================================================================
// 満了当日通知
// ============================================================================

export async function sendTrialEndedEmail(
  input: TrialEndedEmailInput
): Promise<SendEmailResult> {
  const ended = formatJaDate(input.endedAt);
  const subject = `[つぎの手ナビ] 無料トライアルが終了しました`;

  const text = `つぎの手ナビ デジタル資産 をご利用いただきありがとうございます。

本日（${ended}）をもって、無料トライアル期間が終了いたしました。
クレジットカードのご登録がございませんでしたので、自動的に無料プランへ切り替わりました。

【ご利用いただけなくなった機能】
・スマホ・パソコン のパスワード保管
・大切な方への連携アカウント

【引き続きご利用いただける機能】
・デジタル資産・サービスの登録（無制限）
・PDF 出力
・定期リマインダー

ご登録いただいたすべての情報は失われずに保持されています。
有料プランの再開をご希望の場合は、下記からクレジットカードのご登録をお願いします。

  ${input.upgradeUrl}

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
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','Hiragino Sans','Noto Sans JP',sans-serif;background:#f8fafc;color:#1e293b;">
  <div style="max-width:600px;margin:0 auto;padding:40px 24px;">
    <div style="background:#ffffff;border-radius:16px;padding:32px;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
      <h1 style="margin:0 0 16px;font-size:18px;font-weight:700;color:#1e293b;">
        無料トライアルが終了しました
      </h1>
      <p style="margin:0 0 16px;font-size:14px;line-height:1.7;">
        本日（<b>${escapeHtml(ended)}</b>）をもって、無料トライアル期間が終了いたしました。<br>
        クレジットカードのご登録がございませんでしたので、自動的に無料プランへ切り替わりました。
      </p>

      <section style="margin:24px 0;padding:16px 20px;background:#fef2f2;border-left:4px solid #ef4444;border-radius:8px;">
        <p style="margin:0 0 8px;font-weight:600;font-size:13px;color:#991b1b;">
          ご利用いただけなくなった機能
        </p>
        <ul style="margin:0;padding-left:20px;font-size:13px;line-height:1.7;color:#7f1d1d;">
          <li>スマホ・パソコン のパスワード保管</li>
          <li>大切な方への連携アカウント</li>
        </ul>
      </section>

      <section style="margin:24px 0;padding:16px 20px;background:#ecfdf5;border-left:4px solid #10b981;border-radius:8px;">
        <p style="margin:0 0 8px;font-weight:600;font-size:13px;color:#065f46;">
          引き続きご利用いただける機能
        </p>
        <ul style="margin:0;padding-left:20px;font-size:13px;line-height:1.7;color:#064e3b;">
          <li>デジタル資産・サービスの登録（無制限）</li>
          <li>PDF 出力</li>
          <li>定期リマインダー</li>
        </ul>
      </section>

      <p style="margin:24px 0 0;font-size:13px;line-height:1.7;">
        ご登録いただいたすべての情報は失われずに保持されています。<br>
       有料プランの再開をご希望の場合は、下記からクレジットカードのご登録をお願いします。
      </p>

      <div style="margin:24px 0;text-align:center;">
        <a href="${input.upgradeUrl}"
           style="display:inline-block;padding:14px 32px;background:#059669;color:#ffffff;text-decoration:none;border-radius:9999px;font-weight:600;font-size:15px;">
         有料プランを再開する
        </a>
      </div>
    </div>
    <div style="margin-top:24px;text-align:center;font-size:11px;color:#94a3b8;line-height:1.6;">
      <strong>つぎの手ナビ デジタル資産</strong><br>
      <a href="https://tsuginotenavi.jp" style="color:#94a3b8;text-decoration:underline;">https://tsuginotenavi.jp</a><br>
      お問い合わせ：info@blueadventures.jp
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
