/**
 * /digital/assets/new — デジタル資産の新規登録ページ
 *
 * 2026-05 改訂：FREE プランも無制限化。プラン上限ガードは撤去。
 *   ※ 将来的に PLAN_LIMITS.maxAssets を有限値に戻した場合に備え、
 *     上限到達時のアップグレード案内 UI は履歴コミットから復元可能（git log）。
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import AssetForm from '@/components/digital/AssetForm';
import { createDigitalServerClient } from '@/lib/supabase/digitalServer';

export const metadata: Metadata = {
  title: 'デジタル資産を登録 | つぎの手ナビ',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function NewAssetPage() {
  const supabase = await createDigitalServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login?next=/digital/assets/new');
  }

  return (
    <div className="min-h-screen bg-[#F5F5F0]">
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link
            href="/digital"
            className="text-sm text-emerald-600 active:opacity-70 flex-shrink-0"
          >
            ← ダッシュボード
          </Link>
          <h1 className="text-base font-medium text-gray-900 flex-1 text-center pr-24">
            デジタル資産を登録
          </h1>
        </div>
      </header>

      {/* 本体 */}
      <div className="max-w-2xl mx-auto px-4 py-4">
        <section className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6">
          <AssetForm mode="create" />
        </section>
      </div>
    </div>
  );
}
