/**
 * /digital/settings/upgrade — プラン詳細・料金体系
 *
 * 新モデルでは「STANDARD への直接アップグレード」フローは存在しない。
 * STANDARD は「大切な方を 1 名招待 → 承認時に自動開始」となるため、
 * このページは料金体系の説明と /digital/share への誘導を担う。
 *
 * 互換性：旧 ?canceled=1 は Stripe Checkout キャンセル時のリダイレクト先として使うので残置。
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
  AlertTriangle,
  UserRoundPlus,
  Sparkles,
} from 'lucide-react';
import { createDigitalServerClient } from '@/lib/supabase/digitalServer';
import {
  getOwnSubscription,
  isStandardActive,
} from '@/lib/digital/subscriptions';
import { PER_RECIPIENT_PRICING, PLAN_LABELS } from '@/types/digital';

export const metadata: Metadata = {
  title: 'プランについて | つぎの手ナビ',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

type Props = {
  searchParams: Promise<{ canceled?: string }>;
};

export default async function UpgradePage({ searchParams }: Props) {
  const { canceled } = await searchParams;
  const supabase = await createDigitalServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login?next=/digital/settings/upgrade');
  }

  const subscription = await getOwnSubscription(supabase, user.id);
  const isStandard = isStandardActive(subscription);

  return (
    <div className="min-h-screen bg-[#F5F5F0]">
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link
            href="/digital/settings"
            className="text-sm text-emerald-600 active:opacity-70 flex-shrink-0"
          >
            ← 設定
          </Link>
          <h1 className="text-base font-medium text-gray-900 flex-1 text-center pr-12">
            プランについて
          </h1>
        </div>
      </header>

      {/* 本体 */}
      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        {/* 現在のプラン（小さく表示） */}
        <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
          現在のプラン：
          <span className="font-semibold text-gray-900">
            {isStandard ? PLAN_LABELS.standard : PLAN_LABELS.free}
          </span>
          {subscription?.status === 'trialing' && (
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">
              無料トライアル中
            </span>
          )}
        </div>

        {/* Checkout キャンセル時のお知らせ */}
        {canceled === '1' && (
          <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <AlertTriangle
              className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600"
              aria-hidden="true"
            />
            <div>
              <p className="font-medium">決済をキャンセルしました</p>
              <p className="mt-1 text-amber-800/90">
                プラン変更は行われていません。再度お試しになる場合は「大切な方に共有」ページからどうぞ。
              </p>
            </div>
          </div>
        )}

        {/* 料金カード（簡素化版） */}
        <section className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <Sparkles className="h-5 w-5 text-emerald-600" aria-hidden="true" />
            STANDARD プランの料金
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            大切な方の連携 1 名ごとに料金が発生する従量課金制です。最大 10 名まで連携できます。
          </p>

          <div className="mt-4 rounded-xl bg-emerald-50 p-5 text-center">
            <p className="text-3xl font-bold text-emerald-900">
              ¥{PER_RECIPIENT_PRICING.amount.toLocaleString()}
              <span className="ml-1 text-sm font-normal text-emerald-700">
                /月（税込）
              </span>
            </p>
            <p className="mt-1 text-xs text-emerald-700">連携 1 名あたり</p>
          </div>

          <p className="mt-3 text-xs text-gray-500">
            ※ 最初の招待から {PER_RECIPIENT_PRICING.trialDays} 日間は無料でお試しいただけます。
          </p>
        </section>

        {/* CTA セクション */}
        <section className="bg-white rounded-2xl border border-gray-100 p-5">
          {!isStandard ? (
            <>
              <p className="text-sm text-gray-700 leading-relaxed">
                「大切な方に共有」から招待を送ると、承認時点で STANDARD が自動開始されます。
              </p>
              <Link
                href="/digital/share"
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
              >
                <UserRoundPlus className="h-4 w-4" aria-hidden="true" />
                大切な方を招待する
              </Link>
            </>
          ) : (
            <>
              <p className="text-sm text-gray-700 leading-relaxed">
                STANDARD プランをご利用中です。連携の追加・解除は「大切な方に共有」から行えます。
              </p>
              <Link
                href="/digital/share"
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
              >
                <UserRoundPlus className="h-4 w-4" aria-hidden="true" />
                連携を管理する
              </Link>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
