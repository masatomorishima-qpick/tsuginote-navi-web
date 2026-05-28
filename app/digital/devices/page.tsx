/**
 * /digital/devices — デバイス一覧ページ
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Plus, ShieldCheck, KeyRound } from 'lucide-react';
import { createDigitalServerClient } from '@/lib/supabase/digitalServer';
import { listDevicesWithPinFlag } from '@/lib/digital/devices';
import type { DigitalDeviceWithPinFlag } from '@/types/digital';
import DeviceList from '@/components/digital/DeviceList';

export const metadata: Metadata = {
  title: 'パスワード保管｜つぎの手ナビ デジタル資産',
  description:
    'スマートフォンや PC のロック解除 PIN を、大切な方に安全に引き継ぐためのデバイス一覧です。',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function DevicesPage() {
  const supabase = await createDigitalServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

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
    <div className="space-y-6">
      {/* ページ見出し */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
            <KeyRound className="h-6 w-6 text-emerald-600" aria-hidden="true" />
            パスワード保管
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            スマートフォンや PC のロック解除 PIN を、暗号化して安全に保管できます。
          </p>
        </div>

        <Link
          href="/digital/devices/new"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-emerald-700"
        >
          <Plus className="h-5 w-5" aria-hidden="true" />
          デバイスを追加する
        </Link>
      </div>

      {/* セキュリティ案内 */}
      <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
        <ShieldCheck
          className="mt-0.5 h-5 w-5 flex-shrink-0"
          aria-hidden="true"
        />
        <div>
          <p className="font-medium">PIN はあなたの端末の中で暗号化されます</p>
          <p className="mt-1 leading-relaxed text-emerald-800/90">
            登録した PIN は端末内で暗号化してから送信するため、運営側からもデータベース側からも平文では見えません。
            PIN の表示・変更・削除には「メールでの再認証」が必要です。
          </p>
        </div>
      </div>

      {/* サマリー */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <SummaryCard label="登録デバイス数" value={`${total}`} />
        <SummaryCard label="PIN 登録済み" value={`${withPin} / ${total || 0}`} />
        <SummaryCard label="使用中" value={`${activeCount}`} />
      </div>

      <DeviceList devices={devices} />
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-base font-semibold text-slate-900 sm:text-lg">
        {value}
      </p>
    </div>
  );
}
