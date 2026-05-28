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
            デバイスを登録
          </h1>
        </div>
      </header>

      {/* 本体 */}
      <div className="max-w-2xl mx-auto px-4 py-4">
        <section className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6">
          <DeviceForm mode="create" />
        </section>
      </div>
    </div>
  );
}
