/**
 * /digital/settings/plan — ご契約プラン詳細
 *
 * 設定トップから遷移する、プラン状態の確認用サブページ。
 * 表示は既存の PlanCard コンポーネントをそのまま利用する。
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createDigitalServerClient } from '@/lib/supabase/digitalServer';
import { getOwnSubscription } from '@/lib/digital/subscriptions';
import PlanCard from '@/components/digital/PlanCard';

export const metadata: Metadata = {
  title: 'ご契約プラン | つぎの手ナビ デジタル資産',
  description: 'ご契約中のプランの状態を確認できます。',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function SettingsPlanPage() {
  const supabase = await createDigitalServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login?next=/digital/settings/plan');
  }

  const subscription = await getOwnSubscription(supabase, user.id);

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
            ご契約プラン
          </h1>
        </div>
      </header>

      {/* 本体 */}
      <div className="max-w-2xl mx-auto px-4 py-4">
        <PlanCard subscription={subscription} />
      </div>
    </div>
  );
}
