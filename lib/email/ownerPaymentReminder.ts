/**
 * lib/email/ownerPaymentReminder.ts
 *
 * 連携相手が招待を「承認」した直後に、オーナー（本人）へ送る案内メール。
 *
 * 背景：
 *   per-recipient 課金では、連携相手の承認時に Stripe サブスクが未作成だと
 *   syncSubscriptionQuantity が need_checkout を返す（= オーナーのカード未登録）。
 *   この場合、連携自体は active になるが、トライアル終了後も継続するには
 *   オーナーがカードを登録する必要がある。その案内を本人へ送る。
 *
 * 設計方針（invitation.ts / trialReminder.ts に準拠）：
 *   - 差出人「つぎの手ナビ デジタル資産 <noreply@tsuginotenavi.jp>」
 *   - 白背景＋薄いボーダーのシンプルテンプレート
 *   - 送信失敗で UX フローを止めない（呼び出し側で best-effort 実行）
 */

import 'server-only';
import { sendEmail, type SendEmailResult } from './client';

export type OwnerLinkAcceptedEmailInput = {
  /** オーナー（本人）のメールアドレス */
  ownerEmail: string;
  /** 承認した連携相手の呼称（オーナーが付けた名前） */
  recipientName: string | null;
  /** カード登録ページの URL（例：https://tsuginotenavi.jp/digital/settings/plan） */
  manageUrl: string;
};

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function sendOwnerLinkAcceptedEmail(
  input: OwnerLinkAcceptedEmailInput
): Promise<SendEmailResult> {
  const recipientLabel = input.recipientName?.trim()
    ? input.recipientName.trim()
    : '連携先の方';
  const recipient = escapeHtml(recipientLabel);
  const manageUrl = input.manageUrl;

  const subject = `連携が承認されました｜カードのご登録のご案内 — つぎの手ナビ`;

  const text = `${recipientLabel} さまが、あなたとの連携を承認しました。

無料トライアル期間中は、このまま追加のお手続きなくご利用いただけます。
トライアルが終了すると、有料プランの機能（スマホ・パソコンのパスワード保管／大切な方への連携）がご利用いただけなくなり、自動的に無料プランへ切り替わります。

引き続きご利用いただくには、クレジットカードのご登録をお願いいたします。
料金：連携 1 名あたり 月額 110 円（税込）／最初の 30 日間は無料

  ${manageUrl}

※ ご登録いただいたデジタル資産情報は、無料プランでも失われずに保持されます。連携は、後からカードを登録すればいつでも再開できます。

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
      連携が承認されました
    </h1>
    <p style="margin:0 0 40px;font-size:14px;color:#6b7280;">
      つぎの手ナビ デジタル資産
    </p>

    <!-- 本文 -->
    <p style="margin:0 0 32px;font-size:15px;line-height:1.8;color:#374151;">
      <strong style="color:#111827;">${recipient}</strong> さまが、あなたとの連携を承認しました。
    </p>

    <!-- 案内：枠線のみ -->
    <div style="margin:0 0 32px;padding:20px 24px;border:1px solid #e5e7eb;border-radius:12px;background:#ffffff;">
      <p style="margin:0 0 12px;font-size:14px;line-height:1.8;color:#374151;">
        無料トライアル期間中は、このまま追加のお手続きなくご利用いただけます。<br>
        トライアルが終了すると、<strong style="color:#111827;">有料プランの機能（スマホ・パソコンのパスワード保管／大切な方への連携）</strong>がご利用いただけなくなり、自動的に無料プランへ切り替わります。引き続きご利用いただくには、クレジットカードのご登録をお願いいたします。
      </p>
      <p style="margin:0;font-size:13px;line-height:1.7;color:#6b7280;">
        料金：連携 1 名あたり <strong style="color:#111827;">月額 110 円（税込）</strong>／最初の 30 日間は無料
      </p>
    </div>

    <!-- CTA -->
    <div style="margin:0 0 32px;text-align:center;">
      <a href="${manageUrl}"
         style="display:inline-block;padding:16px 40px;background:#059669;color:#ffffff;text-decoration:none;border-radius:9999px;font-weight:600;font-size:15px;letter-spacing:0.01em;">
        クレジットカードを登録する
      </a>
    </div>

    <!-- 補足 -->
    <p style="margin:0 0 8px;font-size:13px;line-height:1.7;color:#9ca3af;">
      ご登録いただいたデジタル資産情報は、無料プランでも失われずに保持されます。連携は、後からカードを登録すればいつでも再開できます。
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
    to: input.ownerEmail,
    subject,
    html,
    text,
    fromDisplayName: 'つぎの手ナビ デジタル資産',
  });
}
