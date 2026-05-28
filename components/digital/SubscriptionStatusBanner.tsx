/* ────────────────────────────────────────────────────────────────
 * サブスク状態警告バナー
 *   - 解約予定：琥珀
 *   - 支払い遅延（past_due）：赤
 *   - トライアル残り 5 日以内：青みのある情報帯
 *   - それ以外：表示しない（PlanBadge で十分）
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

  // 解約予定（cancel_at_period_end=true、または status='canceled'）
  if (
    (cancelPending || status === 'canceled') &&
    subscription.current_period_end
  ) {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
        <AlertCircle
          className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600"
          aria-hidden="true"
        />
        <div className="flex-1">
          <p className="font-semibold">解約予定</p>
          <p className="mt-1 leading-relaxed text-amber-800/90">
            {formatJpDate(subscription.current_period_end)}まで STANDARD 機能をご利用いただけます。
            それ以降は FREE プランへ自動的に切り替わります。
          </p>
        </div>
        <Link
          href="/digital/settings"
          className="inline-flex flex-shrink-0 items-center gap-1 self-center rounded-full border border-amber-400 bg-white px-3 py-1.5 text-xs font-semibold text-amber-800 hover:bg-amber-100"
        >
          設定で詳細を見る
          <ArrowRight className="h-3 w-3" aria-hidden="true" />
        </Link>
      </div>
    );
  }

  // 支払い遅延
  if (status === 'past_due') {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-rose-300 bg-rose-50 p-4 text-sm text-rose-900">
        <AlertTriangle
          className="mt-0.5 h-5 w-5 flex-shrink-0 text-rose-600"
          aria-hidden="true"
        />
        <div className="flex-1">
          <p className="font-semibold">お支払いの確認ができておりません</p>
          <p className="mt-1 leading-relaxed text-rose-800/90">
            クレジットカードの請求が完了できなかったため、STANDARD 機能の利用が一時的に制限される可能性があります。
            お支払い情報のご確認をお願いいたします。
          </p>
        </div>
        <Link
          href="/digital/settings"
          className="inline-flex flex-shrink-0 items-center gap-1 self-center rounded-full bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700"
        >
          設定で確認
          <ArrowRight className="h-3 w-3" aria-hidden="true" />
        </Link>
      </div>
    );
  }

  // トライアル残り 5 日以下（5 日切ってから注意喚起）
  if (status === 'trialing' && daysLeft !== null && daysLeft <= 5) {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-900">
        <Sparkles
          className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600"
          aria-hidden="true"
        />
        <div className="flex-1">
          <p className="font-semibold">
            無料トライアル{daysLeft > 0 ? `残り ${daysLeft} 日` : 'が終了しました'}
          </p>
          <p className="mt-1 leading-relaxed text-emerald-800/90">
            {daysLeft > 0
              ? '継続してご利用いただくには、STANDARD プランへのアップグレード手続きをお願いいたします。'
              : '現在は STANDARD 機能が一時停止しています。アップグレードで利用を再開できます。'}
          </p>
        </div>
        <Link
          href="/digital/settings/upgrade"
          className="inline-flex flex-shrink-0 items-center gap-1 self-center rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
        >
          アップグレード
          <ArrowRight className="h-3 w-3" aria-hidden="true" />
        </Link>
      </div>
    );
  }

  return null;
}
