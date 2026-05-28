/**
 * /digital/assets/[id] — デジタル資産の編集ページ
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { createDigitalServerClient } from '@/lib/supabase/digitalServer';
import { getAssetById } from '@/lib/digital/assets';
import AssetEditor from '@/components/digital/AssetEditor';

export const metadata: Metadata = {
  title: 'デジタル資産を編集 | つぎの手ナビ',
  robots: { index: false, follow: false },
};

type Props = { params: Promise<{ id: string }> };

export default async function EditAssetPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createDigitalServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=/digital/assets/${id}`);
  }

  const asset = await getAssetById(supabase, user.id, id);
  if (!asset) {
    notFound();
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
          <h1 className="text-base font-medium text-gray-900 flex-1 text-center pr-24 truncate">
            デジタル資産を編集
          </h1>
        </div>
      </header>

      {/* 本体 */}
      <div className="max-w-2xl mx-auto px-4 py-4">
        <section className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6">
          <AssetEditor asset={asset} />
        </section>
      </div>
    </div>
  );
}
