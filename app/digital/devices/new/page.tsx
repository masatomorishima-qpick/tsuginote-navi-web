/**
 * /digital/devices/new — デバイス新規登録ページ
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import DeviceForm from '@/components/digital/DeviceForm';

export const metadata: Metadata = {
  title: 'デバイスを登録 | つぎの手ナビ',
  robots: { index: false, follow: false },
};

export default function NewDevicePage() {
  return (
    <div className="min-h-screen bg-[#F5F5F0]">
      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-10">
        {/* 大見出し（中央寄せ、十分な余白） */}
        <header className="mb-6 sm:mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            デバイスを登録
          </h1>
        </header>

        <div className="space-y-4">
          <section className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6">
            <DeviceForm mode="create" />
          </section>

          {/* 戻るリンク（下部） */}
          <div className="pt-4 text-center">
            <Link
              href="/digital/devices"
              className="inline-flex items-center gap-1 text-sm text-emerald-600 active:opacity-70"
            >
              ← パスワード保管に戻る
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
