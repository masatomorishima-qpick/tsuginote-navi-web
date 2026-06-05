/**
 * /digital/devices — デバイス一覧ページ
 *
 * 2026-05 改訂：ダッシュボード新スタイル（bg-[#F5F5F0] + 白丸角カード）に統一。
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Plus, ShieldCheck } from 'lucide-react';
import { getDigitalSession } from '@/lib/supabase/digitalServer';
import { listDevicesWithPinFlag } from '@/lib/digital/devices';
import type { DigitalDeviceWithPinFlag } from '@/types/digital';
import DeviceList from '@/components/digital/DeviceList';

export const metadata: Metadata = {
  title: 'パスワード保管｜つぎの手ナビ デジタル資産',
  description:
    'スマートフォンや PC のデバイス・パスワードを、大切な方に安全に引き継ぐためのデバイス一覧です。',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function DevicesPage() {
  const { supabase, user } = await getDigitalSession();

  if (!user) {
    redirect('/login?next=/digital/devices');
  }

  let devices: DigitalDeviceWithPinFlag[] = [];
  try {
    devices = await listDevicesWithPinFlag(supabase, user.id);
  } catch (err) {
    console.error('[digital/devices/page] listDevicesWithPinFlag failed', err);
  }

  const total = devices.length;
  const withPin = devices.filter((d) => d.has_pin).length;
  const activeCount = devices.filter((d) => d.disposal_status === 'in_use').length;

  return (
    <div className="min-h-screen bg-[#F5F5F0]">
      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-10">
        {/* 大見出し（中央寄せ、十分な余白） */}
        <header className="mb-6 sm:mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            パスワード保管
          </h1>
        </header>

        <div className="space-y-4">

        {/* 説明 + 追加ボタン */}
        <section className="bg-white rounded-2xl border border-gray-100 p-5">
          <p className="text-sm text-gray-600 leading-relaxed">
            スマートフォンや PC のデバイス・パスワードを、暗号化して安全に保管できます。
          </p>
          <Link
            href="/digital/devices/new"
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-emerald-700 sm:w-auto"
          >
            <Plus className="h-5 w-5" aria-hidden="true" />
            デバイスを追加する
          </Link>
        </section>

        {/* セキュリティ案内 */}
        <section className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-start gap-3 text-sm text-gray-700">
            <ShieldCheck
              className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600"
              aria-hidden="true"
            />
            <div>
              <p className="font-medium text-gray-900">
                パスワードはあなたの端末の中で暗号化されます
              </p>
              <p className="mt-1 leading-relaxed text-gray-600">
                登録したパスワードは端末内で暗号化してから送信するため、運営側からもデータベース側からも平文では見えません。
                パスワードの表示・変更・削除には「メールでの再認証」が必要です。
              </p>
            </div>
          </div>
        </section>

        {/* サマリー */}
        <section className="grid grid-cols-3 gap-3">
          <SummaryCard label="登録デバイス" value={`${total}`} />
          <SummaryCard label="パスワード登録済み" value={`${withPin}`} />
          <SummaryCard label="使用中" value={`${activeCount}`} />
        </section>

        {/* デバイス一覧 */}
        <DeviceList devices={devices} />

        {/* 戻るリンク（下部に配置：操作の邪魔にならないように） */}
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

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 text-center">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-1 text-base font-semibold text-gray-900 sm:text-lg">
        {value}
      </p>
    </div>
  );
}
