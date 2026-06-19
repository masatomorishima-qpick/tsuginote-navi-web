/**
 * PlanCard
 *
 * 設定ページに表示する「現在のプラン」カード（サーバーコンポーネント）。
 *
 * 表示内容:
 *   - 現在のプラン名（FREE / STANDARD）
 *   - 状態（無料トライアル中 / 有効 / 解約予定 / FREE）
 *   - トライアル残日数（トライアル中のみ）
 *   - 次回更新日（active 中のみ）
 *   - アップグレード / 解約 / プラン変更 ボタン
 *
 * Stripe 連携：段階 6 で実装済み。
 *   - アップグレード → /digital/settings/plan（UpgradeButton で Checkout）
 *   - お支払い情報の管理 → ManageBillingButton で Customer Portal を開く
 */

import Link from 'next/link';
import { Sparkles, ShieldCheck, AlertCircle, Crown, UserRoundPlus } from 'lucide-react';
import {
  type DigitalSubscription,
  PLAN_LABELS,
  SUBSCRIPTION_STATUS_LABELS,
  PER_RECIPIENT_PRICING,
} from '@/types/digital';
import {
  effectivePlan,
  isStandardActive,
  trialDaysLeft,
} from '@/lib/digital/subscriptions';
import ManageBillingButton from '@/components/digital/ManageBillingButton';
import UpgradeButton from '@/components/digital/UpgradeButton';

type Props = {
  subscription: DigitalSubscription | null;
};

export default function PlanCard({ subscription }: Props) {
  const plan = effectivePlan(subscription);
  const isStandard = isStandardActive(subscription);
  const status = subscription?.status ?? 'free';
  const daysLeft = trialDaysLeft(subscription);

  // 表示用日付フォーマッタ（JST）
  const formatDate = (iso: string | null | undefined) => {
    if (!iso) return null;
    try {
      return new Intl.DateTimeFormat('ja-JP', {
        timeZone: 'Asia/Tokyo',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(new Date(iso));
    } catch {
      return null;
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      {/* ヘッダー部 */}
      <div
        className={
          isStandard
            ? 'flex items-center gap-3 bg-gradient-to-r from-emerald-50 to-teal-50 px-5 py-4 sm:px-6'
            : 'flex items-center gap-3 bg-slate-50 px-5 py-4 sm:px-6'
        }
      >
        <div
          className={
            isStandard
              ? 'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100'
              : 'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-slate-200'
          }
        >
          {isStandard ? (
            <Crown className="h-5 w-5 text-emerald-700" aria-hidden="true" />
          ) : (
            <ShieldCheck className="h-5 w-5 text-slate-600" aria-hidden="true" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
            現在のプラン
          </p>
          <p className="text-lg font-bold text-slate-900 sm:text-xl">
            {PLAN_LABELS[plan]}
            <span className="ml-2 text-sm font-medium text-slate-500">
              {SUBSCRIPTION_STATUS_LABELS[status]}
            </span>
          </p>
        </div>
      </div>

      {/* 本体 */}
      <div className="space-y-4 p-5 sm:p-6">
        {/* トライアル中：残日数表示 */}
        {status === 'trialing' && daysLeft !== null && (
          <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <Sparkles
              className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600"
              aria-hidden="true"
            />
            <div className="flex-1 text-sm">
              <p className="font-semibold text-amber-900">
                {daysLeft > 0
                  ? `無料トライアル残り ${daysLeft} 日`
                  : '無料トライアルが終了しました'}
              </p>
              <p className="mt-1 leading-relaxed text-amber-800/90">
                {daysLeft > 0
                  ? `${formatDate(subscription?.trial_expires_at)}まで有料プランのすべての機能をご利用いただけます。継続するにはクレジットカード登録をお願いします。`
                  : '現在は有料プランの機能が一時停止しています。クレジットカード登録で利用を再開できます。'}
              </p>
            </div>
          </div>
        )}

        {/*
         * 解約予定表示：以下のいずれかの場合に「期間終了まで利用可」のバナー
         *   - status === 'canceled'                              （内部的な解約済み）
         *   - status === 'active' && cancel_at_period_end       （Stripe Portal で解約予定をセット）
         */}
        {(status === 'canceled' ||
          (status === 'active' && subscription?.cancel_at_period_end)) &&
          subscription?.current_period_end && (
            <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <AlertCircle
                className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600"
                aria-hidden="true"
              />
              <div className="flex-1 text-sm">
                <p className="font-semibold text-amber-900">解約予定</p>
                <p className="mt-1 leading-relaxed text-amber-800/90">
                  {formatDate(subscription.current_period_end)}まで有料プランの機能をご利用いただけます。それ以降は無料プランへ自動的に切り替わります。
                </p>
                <p className="mt-1 text-xs text-amber-800/80">
                  解約を取りやめたい場合は「お支払い情報を管理する」からお手続きいただけます。
                </p>
              </div>
            </div>
          )}

        {/*
         * 連携者数 × ¥110 のサマリー：active / trialing で表示
         */}
        {(status === 'active' || status === 'trialing') &&
          !subscription?.cancel_at_period_end && (
            <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
              <p>
                連携中：
                <span className="ml-1 font-semibold text-slate-900">
                  {subscription?.quantity ?? 0} 名
                </span>
                {(subscription?.quantity ?? 0) > 0 && (
                  <span className="ml-3 text-xs text-slate-500">
                    （月額 ¥{(subscription?.quantity ?? 0) * PER_RECIPIENT_PRICING.amount} 税込）
                  </span>
                )}
              </p>
              {subscription?.current_period_end && (
                <p className="mt-1 text-xs text-slate-500">
                  次回更新日：{formatDate(subscription.current_period_end)}
                </p>
              )}
            </div>
          )}

        {/* プラン機能の概要 */}
        <div className="rounded-xl bg-slate-50 p-4 text-sm leading-relaxed text-slate-700">
          {isStandard ? (
            <>
              <p className="font-semibold text-slate-900">有料プランでご利用中の機能</p>
              <ul className="mt-2 list-inside list-disc space-y-0.5">
                <li>デジタル資産・サービスの登録（無制限）</li>
                <li>スマホ・パソコン のパスワード保管</li>
                <li>大切な方への連携アカウント（連携者 1 名ごと {PER_RECIPIENT_PRICING.label}）</li>
                <li>PDF 出力 / リマインダー / 操作履歴</li>
              </ul>
            </>
          ) : (
            <>
              <p className="font-semibold text-slate-900">無料プランの内容</p>
              <ul className="mt-2 list-inside list-disc space-y-0.5">
                <li>デジタル資産・サービスの登録（無制限）</li>
                <li>大切な方に共有（PDF 出力）/ リマインダー / 操作履歴</li>
                <li className="text-slate-400">
                  スマホ・パソコン のパスワード保管は有料プランのみ
                </li>
              </ul>
            </>
          )}
        </div>

        {/*
         * CTA — Stripe Customer の有無で表示を分岐
         * レイアウト方針：説明文を上、ボタンを下の縦並びでまとめる。
         * （PC で左右に振り分けると、説明文側の幅が極端に狭くなり崩れることがあったため）
         */}
        <div className="space-y-4 border-t border-slate-100 pt-4">
          {!isStandard ? (
            <>
              <div>
                <p className="text-sm font-semibold text-slate-900">
                 有料プランにアップグレード
                </p>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">
                  大切な方を 1 名招待すると、自動的に有料プランが開始されます。
                  料金は <b>連携 1 名あたり {PER_RECIPIENT_PRICING.label}（税込）</b>。
                  最初の招待から <b>30 日間は無料</b>です。
                </p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-3">
                <InviteCtaButton />
              </div>
            </>
          ) : status === 'trialing' && !subscription?.stripe_subscription_id ? (
            <>
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  まだクレジットカードのご登録がありません
                </p>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">
                  最初の招待時に自動的にお手続きが始まりますが、先にカードを登録してトライアル期間の終了後もスムーズに継続したい場合は、下のボタンからどうぞ。
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-3">
                <InviteCtaButton />
                <UpgradeButton label="先にカードだけ登録する" />
              </div>
            </>
          ) : status === 'trialing' ? (
            <ManageSubscriptionLinks />
          ) : status === 'active' ? (
            <ManageSubscriptionLinks />
          ) : null}
        </div>
      </div>
    </div>
  );
}

/**
 * 大切な方を招待する CTA（FREE ユーザー向け）
 * /digital/share に直接遷移する。新モデルではここから招待 → 承認時に Checkout 起動。
 */
function InviteCtaButton() {
  return (
    <Link
      href="/digital/share"
      className="inline-flex flex-shrink-0 items-center justify-center gap-1.5 rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
    >
      <UserRoundPlus className="h-4 w-4" aria-hidden="true" />
      大切な方を招待する
    </Link>
  );
}


/**
 * 課金管理リンク群（active 状態のみ表示）。
 * 「お支払い情報を管理」は ManageBillingButton で Stripe Customer Portal を開く。
 */
function ManageSubscriptionLinks() {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
      <ManageBillingButton label="お支払い情報を管理する（解約・支払い方法）" />
    </div>
  );
}
