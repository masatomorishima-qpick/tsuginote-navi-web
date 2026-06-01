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
      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-10">
        {/* 大見出し（中央寄せ、十分な余白） */}
        <header className="mb-6 sm:mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            デジタル資産を編集
          </h1>
        </header>

        <div className="space-y-4">
          <section className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6">
            <AssetEditor asset={asset} />
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
