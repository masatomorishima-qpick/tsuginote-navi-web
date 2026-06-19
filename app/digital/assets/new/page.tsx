/**
 * /digital/assets/new — デジタル資産の新規登録ページ
 *
 * 2026-05 改訂：無料プランも無制限化。プラン上限ガードは撤去。
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
      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-10">
        {/* 大見出し（中央寄せ、十分な余白） */}
        <header className="mb-6 sm:mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            デジタル資産を登録
          </h1>
        </header>

        <div className="space-y-4">
          <section className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6">
            <AssetForm mode="create" />
          </section>

          {/* 戻るリンク（下部） */}
          <div className="pt-4 text-center">
            <Link
              href="/digital"
              className="inline-flex items-center gap-1 text-sm text-emerald-600 active:opacity-70"
            >
              ← ダッシュボードに戻る
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
