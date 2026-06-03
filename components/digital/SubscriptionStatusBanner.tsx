/* ────────────────────────────────────────────────────────────────
 * サブスク状態警告バナー（ダッシュボード /digital に表示）
 *
 * 2026-06 改訂：iPhone SE 等の狭幅でテキストが縦縞化しないよう、
 *   レイアウトを縦積みベースにシンプル化。
 *   - 解約予定（cancel_at_period_end / canceled）：amber
 *   - 連携 0 名による自動解約予定：amber（再招待 CTA 付き）
 *   - 支払い遅延（past_due）：rose（カード再確認 CTA）
 *   - トライアル残り 7 日以内：emerald（アップグレード CTA）
 *
 * 「プラン管理」リンクはダッシュボード上部の PlanCard 側にあるため、
 * このバナーでは「設定で詳細を見る」等の冗長なボタンは付けない。
 * （アクション必須のものだけ専用 CTA を 1 つ配置）
 * ──────────────────────────────────────────────────────────────── */

import Link from 'next/link';
import { AlertCircle, AlertTriangle, Sparkles, ArrowRight } from 'lucide-react';
import { trialDaysLeft } from '@/lib/digital/subscriptionUtils';
import { formatJpDate } from '@/lib/digital/utils';
import type { DigitalSubscription } from '@/types/digital';

export default function SubscriptionStatusBanner({
  subscription,
}: {
  subscription: DigitalSubscription | null;
}) {
  if (!subscription) return null;
  const status = subscription.status;
  const cancelPending = subscription.cancel_at_period_end;
  const daysLeft = trialDaysLeft(subscription);
  const quantity = subscription.quantity ?? 0;

  // 連携 0 名による自動解約予定（cancel_at_period_end=true かつ quantity=0）
  if (
    cancelPending &&
    quantity === 0 &&
    subscription.current_period_end
  ) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
        <div className="flex items-start gap-2.5">
          <AlertCircle
            className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600"
            aria-hidden="true"
          />
          <div className="flex-1 min-w-0 text-sm">
            <p className="font-semibold text-amber-900">
              {formatJpDate(subscription.current_period_end)} で解約予定
            </p>
            <p className="mt-0.5 text-xs leading-relaxed text-amber-800/80">
              連携先がいないため、期間終了時に FREEプランに切り替わります。
            </p>
          </div>
        </div>
        <Link
          href="/digital/share"
          className="mt-3 inline-flex w-full items-center justify-center gap-1 rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
        >
          大切な方を招待する
          <ArrowRight className="h-3 w-3" aria-hidden="true" />
        </Link>
      </div>
    );
  }

  // 通常の解約予定（Portal で手動キャンセル、cancel_at_period_end=true で quantity>0）
  if (
    (cancelPending || status === 'canceled') &&
    subscription.current_period_end
  ) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
        <div className="flex items-start gap-2.5">
          <AlertCircle
            className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600"
            aria-hidden="true"
          />
          <div className="flex-1 min-w-0 text-sm">
            <p className="font-semibold text-amber-900">
              {formatJpDate(subscription.current_period_end)} で解約予定
            </p>
            <p className="mt-0.5 text-xs leading-relaxed text-amber-800/80">
              期間終了後、FREEプランに切り替わります。
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 支払い遅延
  if (status === 'past_due') {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
        <div className="flex items-start gap-2.5">
          <AlertTriangle
            className="mt-0.5 h-4 w-4 flex-shrink-0 text-rose-600"
            aria-hidden="true"
          />
          <div className="flex-1 min-w-0 text-sm">
            <p className="font-semibold text-rose-900">
              お支払い確認中
            </p>
            <p className="mt-0.5 text-xs leading-relaxed text-rose-800/80">
              クレジットカードのご確認をお願いします。
            </p>
          </div>
        </div>
        <Link
          href="/digital/settings/plan"
          className="mt-3 inline-flex w-full items-center justify-center gap-1 rounded-full bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-700"
        >
          お支払い情報を確認する
          <ArrowRight className="h-3 w-3" aria-hidden="true" />
        </Link>
      </div>
    );
  }

  // トライアル残り 7 日以下（リマインドメールの早期送信＝7 日前と閾値を揃える）
  if (status === 'trialing' && daysLeft !== null && daysLeft <= 7) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
        <div className="flex items-start gap-2.5">
          <Sparkles
            className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-600"
            aria-hidden="true"
          />
          <div className="flex-1 min-w-0 text-sm">
            <p className="font-semibold text-emerald-900">
              {daysLeft > 0
                ? `無料期間 残り ${daysLeft} 日`
                : '無料期間が終了しました'}
            </p>
            <p className="mt-0.5 text-xs leading-relaxed text-emerald-800/80">
              {daysLeft > 0
                ? 'クレジットカードのご登録をお願いします。'
                : '継続してご利用いただくにはアップグレードが必要です。'}
            </p>
          </div>
        </div>
        <Link
          href="/digital/settings/plan"
          className="mt-3 inline-flex w-full items-center justify-center gap-1 rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
        >
          クレジットカードを登録する
          <ArrowRight className="h-3 w-3" aria-hidden="true" />
        </Link>
      </div>
    );
  }

  return null;
}
