/**
 * /digital/settings/plan — ご契約プラン
 *
 * 2026-05 改訂：Apple Store 風シンプルレイアウトに刷新。
 *   情報を「状態 / 次のアクション / 利用状況」の 3 カードに集約。
 *   旧 PlanCard コンポーネントは未使用化（履歴のため残置）。
 *
 * 状態別レイアウト:
 *   - trialing                : STANDARD + 残日数 + カード登録 CTA + 連携サマリー
 *   - active                  : STANDARD + 次回請求日 + 支払い管理 + 連携サマリー
 *   - active + 解約予定        : STANDARD（解約予定）+ 期間終了日 + 支払い管理
 *   - canceled                : 同上
 *   - past_due                : STANDARD（支払い確認中）+ 警告 + 支払い管理
 *   - free                    :無料プラン + 招待で STANDARD 開始の案内
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
  AlertTriangle,
  ChevronRight,
  Crown,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { createDigitalServerClient } from '@/lib/supabase/digitalServer';
import {
  getOwnSubscription,
  isStandardActive,
  trialDaysLeft,
} from '@/lib/digital/subscriptions';
import { effectivePlan } from '@/lib/digital/subscriptionUtils';
import ManageBillingButton from '@/components/digital/ManageBillingButton';
import { PER_RECIPIENT_PRICING } from '@/types/digital';

export const metadata: Metadata = {
  title: 'ご契約プラン | つぎの手ナビ デジタル資産',
  description: 'ご契約中のプランの状態と利用状況を確認できます。',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

type Props = {
  searchParams: Promise<{ canceled?: string }>;
};

function formatDate(iso: string | null | undefined): string | null {
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
}

export default async function SettingsPlanPage({ searchParams }: Props) {
  const { canceled } = await searchParams;
  const supabase = await createDigitalServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login?next=/digital/settings/plan');
  }

  const subscription = await getOwnSubscription(supabase, user.id);
  const status = subscription?.status ?? 'free';
  const plan = effectivePlan(subscription);
  const isStandard = isStandardActive(subscription);
  const daysLeft = trialDaysLeft(subscription);
  const quantity = subscription?.quantity ?? 0;
  // 解約予定（active / trialing いずれでも cancel_at_period_end=true なら該当）
  const cancelScheduled =
    status === 'canceled' ||
    ((status === 'active' || status === 'trialing') &&
      subscription?.cancel_at_period_end === true);
  // 「連携 0 名による自動解約予定」かどうか。
  //   ユーザー側で連携先を全解除した場合に system が cancel_at_period_end=true をセットする。
  //   Portal で手動解約した場合は連携先が残っている（quantity > 0）ことが多いので区別できる。
  //   連携先を再追加すれば自動的に解約予定が取り消される（resumeSubscription）。
  const isAutoCancelByNoRecipients = cancelScheduled && quantity === 0;
  const isPastDue = status === 'past_due';
  // 解約予定中の trialing は cancel banner が優先されるため、通常 trialing UI は出さない
  const isTrialing = status === 'trialing' && !cancelScheduled;
  const isActive = status === 'active' && !cancelScheduled;
  const isFree = plan === 'free';

  // ステータスバッジ
  const statusBadge = (() => {
    if (isTrialing) return '無料トライアル中';
    if (isAutoCancelByNoRecipients) return '連携先なし・解約予定';
    if (cancelScheduled) return '解約予定';
    if (isPastDue) return 'お支払い確認中';
    if (isActive) return 'ご利用中';
    if (isFree) return '無料でご利用中';
    return null;
  })();

  return (
    <div className="min-h-screen bg-[#F5F5F0]">
      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-10">
        {/* 大見出し（中央寄せ、十分な余白） */}
        <header className="mb-6 sm:mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            ご契約プラン
          </h1>
        </header>

        <div className="space-y-4">

        {/* Stripe Checkout キャンセル時のお知らせ */}
        {canceled === '1' && (
          <div className="flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <AlertTriangle
              className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600"
              aria-hidden="true"
            />
            <p>決済をキャンセルしました。プラン変更は行われていません。</p>
          </div>
        )}

        {/* カード①：現在のプラン状態（大きく、Apple 風） */}
        <section className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
          <div
            className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl ${
              isStandard ? 'bg-emerald-100' : 'bg-slate-100'
            }`}
          >
            {isStandard ? (
              <Crown className="h-8 w-8 text-emerald-700" aria-hidden="true" />
            ) : (
              <ShieldCheck className="h-8 w-8 text-slate-500" aria-hidden="true" />
            )}
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {isStandard ? '有料プラン' : '無料プラン'}
          </p>
          {statusBadge && (
            <p className="mt-1 text-sm text-gray-500">{statusBadge}</p>
          )}
        </section>

        {/* カード②：次のアクション（状態に応じて変化） */}
        {/* trialing は「カード登録済み」と「カード未登録」で UI が異なる */}
        {isTrialing && subscription?.stripe_subscription_id && (
          // === ケース A: カード登録済み、Stripe trial 進行中 ===
          <section className="bg-white rounded-2xl border border-gray-100 p-5">
            <dl className="space-y-2 text-sm">
              {quantity > 0 && (
                <div className="flex justify-between">
                  <dt className="text-gray-500">連携中</dt>
                  <dd className="font-medium text-gray-900">{quantity} 名</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-gray-500">無料期間</dt>
                <dd className="font-medium text-gray-900">
                  残り {daysLeft ?? '—'} 日
                </dd>
              </div>
              {subscription?.trial_expires_at && (
                <div className="flex justify-between">
                  <dt className="text-gray-500">無料期間終了日</dt>
                  <dd className="font-medium text-gray-900">
                    {formatDate(subscription.trial_expires_at)}
                  </dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-gray-500">トライアル後の月額</dt>
                <dd className="font-medium text-gray-900">
                  ¥{(quantity * PER_RECIPIENT_PRICING.amount).toLocaleString()}
                  <span className="ml-1 text-xs text-gray-500">（税込）</span>
                </dd>
              </div>
            </dl>
            <div className="mt-4 flex items-start gap-2 rounded-lg bg-emerald-50 p-3 text-xs text-emerald-900">
              <CheckCircle2
                className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-600"
                aria-hidden="true"
              />
              <div>
                <p className="font-medium">クレジットカード登録済み</p>
                <p className="mt-0.5 text-emerald-900/80">
                  トライアル終了後、自動的に課金が開始されます。
                </p>
              </div>
            </div>
            <div className="mt-4">
              <ManageBillingButton label="お支払い情報を管理する" />
            </div>
          </section>
        )}

        {isTrialing && !subscription?.stripe_subscription_id && (
          // === ケース B: カード未登録、DB trial のみ ===
          <section className="bg-white rounded-2xl border border-gray-100 p-5">
            {quantity > 0 && (
              <div className="mb-4 flex justify-between border-b border-gray-100 pb-3 text-sm">
                <span className="text-gray-500">連携中</span>
                <span className="font-medium text-gray-900">{quantity} 名</span>
              </div>
            )}
            <p className="text-sm font-medium text-gray-900">
              無料期間：残り {daysLeft ?? '—'} 日
            </p>
            {subscription?.trial_expires_at && (
              <p className="mt-1 text-xs text-gray-500">
                {formatDate(subscription.trial_expires_at)} まで
              </p>
            )}
            <p className="mt-3 text-sm leading-relaxed text-gray-600">
              このまま続けるには、クレジットカードのご登録をお願いします。
            </p>
            <div className="mt-4">
              <ManageBillingButton
                disabled={
                  !subscription?.stripe_customer_id || quantity === 0
                }
                label="クレジットカードを登録する"
                endpoint="checkout"
              />
            </div>
            {quantity === 0 && (
              <p className="mt-2 text-xs text-amber-700">
                ※ カード登録には連携先の方を 1 名以上ご招待・ご承認いただく必要があります。
              </p>
            )}
            <p className="mt-3 text-xs leading-relaxed text-gray-500">
              ※ ご登録がない場合は、期間終了後に自動で無料プランへ切り替わります。
            </p>
          </section>
        )}

        {isActive && (
          <section className="bg-white rounded-2xl border border-gray-100 p-5">
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">連携中</dt>
                <dd className="font-medium text-gray-900">{quantity} 名</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">月額</dt>
                <dd className="font-medium text-gray-900">
                  ¥{(quantity * PER_RECIPIENT_PRICING.amount).toLocaleString()}
                  <span className="ml-1 text-xs text-gray-500">（税込）</span>
                </dd>
              </div>
              {subscription?.current_period_end && (
                <div className="flex justify-between">
                  <dt className="text-gray-500">次回請求</dt>
                  <dd className="font-medium text-gray-900">
                    {formatDate(subscription.current_period_end)}
                  </dd>
                </div>
              )}
            </dl>
            <div className="mt-4">
              <ManageBillingButton label="お支払い情報を管理する" />
            </div>
          </section>
        )}

        {isAutoCancelByNoRecipients && subscription?.current_period_end && (
          // === 連携 0 名による自動解約予定 ===
          // ユーザーが全連携を解除した状態。再招待で自動復帰できることを案内。
          <section className="bg-white rounded-2xl border border-amber-200 p-5">
            <div className="flex items-start gap-2 text-sm text-amber-900">
              <AlertTriangle
                className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600"
                aria-hidden="true"
              />
              <div>
                <p className="font-medium">
                  連携先がいないため {formatDate(subscription.current_period_end)} で解約予定
                </p>
                <p className="mt-1 text-amber-800/90">
                  それまでに新しい連携先を招待・承認いただくと、自動的にご継続いただけます。
                </p>
              </div>
            </div>
            <Link
              href="/digital/share"
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
            >
              大切な方を招待する
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </section>
        )}

        {cancelScheduled && !isAutoCancelByNoRecipients && subscription?.current_period_end && (
          // === Portal で手動解約予定（連携先は残っている） ===
          <section className="bg-white rounded-2xl border border-amber-200 p-5">
            <div className="flex items-start gap-2 text-sm text-amber-900">
              <AlertTriangle
                className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600"
                aria-hidden="true"
              />
              <div>
                <p className="font-medium">
                  {formatDate(subscription.current_period_end)} まで利用可能
                </p>
                <p className="mt-1 text-amber-800/90">
                  期間終了後、自動的に無料プランに切り替わります。
                </p>
              </div>
            </div>
            <div className="mt-4">
              <ManageBillingButton label="解約を取り消す・支払い情報を変更" />
            </div>
          </section>
        )}

        {isPastDue && (
          <section className="bg-white rounded-2xl border border-rose-200 p-5">
            <div className="flex items-start gap-2 text-sm text-rose-900">
              <AlertCircle
                className="mt-0.5 h-4 w-4 flex-shrink-0 text-rose-600"
                aria-hidden="true"
              />
              <div>
                <p className="font-medium">お支払いの確認が必要です</p>
                <p className="mt-1 text-rose-800/90">
                  クレジットカードの再確認をお願いします。
                </p>
              </div>
            </div>
            <div className="mt-4">
              <ManageBillingButton label="お支払い情報を確認する" />
            </div>
          </section>
        )}

        {isFree && (
          <section className="bg-white rounded-2xl border border-gray-100 p-5">
            <p className="text-sm leading-relaxed text-gray-700">
              大切な方を招待すると、有料プランが自動で始まります。
              <br />
              最初の招待から 30 日間は無料でお試しいただけます。
            </p>
            <Link
              href="/digital/share"
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
            >
              大切な方を招待する
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </section>
        )}

        {/* カード③：連携先の管理（常に表示） */}
        <section className="bg-white rounded-2xl border border-gray-100 p-5">
          <Link
            href="/digital/share"
            className="flex items-center justify-between gap-3 text-sm font-medium text-gray-900 active:opacity-70"
          >
            <span>連携先を管理する</span>
            <ChevronRight
              className="h-4 w-4 text-gray-400"
              aria-hidden="true"
            />
          </Link>
          {!isFree && (
            <p className="mt-2 text-xs text-gray-500">
              料金：連携先 1 名あたり ¥{PER_RECIPIENT_PRICING.amount}/月（税込）
            </p>
          )}
        </section>

        {/* 戻るリンク（下部） */}
        <div className="pt-4 text-center">
          <Link
            href="/digital/settings"
            className="inline-flex items-center gap-1 text-sm text-emerald-600 active:opacity-70"
          >
            ← 設定に戻る
          </Link>
        </div>
        </div>
      </div>
    </div>
  );
}
