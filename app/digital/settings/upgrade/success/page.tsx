/**
 * /digital/settings/upgrade/success
 *
 * Stripe Checkout 成功時のランディングページ。
 *
 * 2026-06 改訂：Apple Store 風シンプルレイアウトに刷新。
 *   - サポート用 ID 表示を削除（Stripe Dashboard で email から引けるため）
 *   - 説明文を最小限に
 *   - 遷移ボタンは「ダッシュボードへ」1 個に
 *   - 数十秒の Webhook 反映遅延だけ、ボタン下に小さく補足
 *
 * Webhook が到達する前にユーザーがここに来ることがあるため、
 * 実際の DB 反映確認はこのページでは行わない（ダッシュボード側で表示）。
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';
import { createDigitalServerClient } from '@/lib/supabase/digitalServer';

export const metadata: Metadata = {
  title: 'お支払い完了 | つぎの手ナビ',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

type Props = {
  searchParams: Promise<{ session_id?: string }>;
};

export default async function UpgradeSuccessPage({ searchParams }: Props) {
  // session_id は URL に残るが UI では使わない（サポート時は Stripe Dashboard 側から引く）
  await searchParams;

  const supabase = await createDigitalServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login?next=/digital/settings/plan');
  }

  return (
    <div className="min-h-screen bg-[#F5F5F0] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle2
              className="h-8 w-8 text-emerald-600"
              aria-hidden="true"
            />
          </div>
          <h1 className="text-xl font-bold text-gray-900">
            ご登録ありがとうございます
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-gray-600">
            お支払い情報の登録が完了しました。
          </p>

          <Link
            href="/digital"
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
          >
            ダッシュボードへ
          </Link>
        </div>

        <p className="mt-3 text-center text-xs text-gray-500">
          ※ プラン表示の切り替わりに数十秒かかる場合があります。
        </p>
      </div>
    </div>
  );
}
