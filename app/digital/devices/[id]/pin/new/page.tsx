/**
 * /digital/devices/[id]/pin/new — ロック解除 PIN を登録する画面
 *
 * サーバー側は「デバイスが自分のもので、かつ PIN 未登録」かをチェックして、
 * 登録フォーム（クライアント component）をマウントする。
 * 実際の暗号化はすべてフォームの中（ブラウザ内）で行う。
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ChevronRight, KeyRound, Crown, ArrowRight } from 'lucide-react';
import { createDigitalServerClient } from '@/lib/supabase/digitalServer';
import { getDeviceById, deviceHasPin } from '@/lib/digital/devices';
import { getOwnSubscription, effectivePlan } from '@/lib/digital/subscriptions';
import { PLAN_LIMITS } from '@/types/digital';
import PinRegisterForm from '@/components/digital/PinRegisterForm';

export const metadata: Metadata = {
  title: 'パスワードを登録 | つぎの手ナビ',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ id: string }> };

export default async function NewPinPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createDigitalServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=/digital/devices/${id}/pin/new`);
  }

  const device = await getDeviceById(supabase, user.id, id);
  if (!device) {
    notFound();
  }

  // 既登録の場合は更新画面へ誘導。
  // 現時点ではデバイス詳細画面に戻す。
  const hasPin = await deviceHasPin(supabase, user.id, id);
  if (hasPin) {
    redirect(`/digital/devices/${id}`);
  }

  // プランチェック（Phase 1.5：FREE はパスワード保管不可）
  const subscription = await getOwnSubscription(supabase, user.id);
  const plan = effectivePlan(subscription);
  const canStorePin = PLAN_LIMITS[plan].canStorePin;

  return (
    <div className="mx-auto max-w-2xl">
      {/* パンくず */}
      <nav
        aria-label="パンくず"
        className="mb-4 flex items-center gap-1 text-xs text-slate-500"
      >
        <Link href="/digital" className="hover:text-emerald-700 hover:underline">
          ダッシュボード
        </Link>
        <ChevronRight className="h-3 w-3" aria-hidden="true" />
        <Link
          href="/digital/devices"
          className="hover:text-emerald-700 hover:underline"
        >
          パスワード保管
        </Link>
        <ChevronRight className="h-3 w-3" aria-hidden="true" />
        <Link
          href={`/digital/devices/${device.id}`}
          className="truncate hover:text-emerald-700 hover:underline"
        >
          {device.device_name}
        </Link>
        <ChevronRight className="h-3 w-3" aria-hidden="true" />
        <span className="text-slate-700">パスワードを登録</span>
      </nav>

      <header className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
          <KeyRound className="h-6 w-6 text-emerald-600" aria-hidden="true" />
          パスワードを登録
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          パスワードはブラウザ内で暗号化されてから送信されます。サーバーにはそのままの形では残りません。
        </p>
      </header>

      {canStorePin ? (
        <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-6">
          <PinRegisterForm deviceId={device.id} deviceName={device.device_name} />
        </section>
      ) : (
        // FREE プラン用：STANDARD アップグレード案内
        <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <Crown
              className="mt-0.5 h-6 w-6 flex-shrink-0 text-emerald-700"
              aria-hidden="true"
            />
            <div className="flex-1">
              <h2 className="text-lg font-bold text-emerald-900">
                スマホ・PC のパスワード保管は STANDARD プラン限定の機能です
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-emerald-900/90">
                ロック解除パスワードを暗号化して安全に保管する機能は、STANDARD プランでご利用いただけます。
                30 日間の無料トライアルを使い切った方も、アップグレードでいつでも再開できます。
              </p>
              <ul className="mt-4 space-y-1 text-sm text-emerald-900/90">
                <li>・強力な暗号化で保護、お客様のマスターコードなしでは誰も取り出せません</li>
                <li>・もしもの時、マスターコードを共有するだけで大切な方に届きます</li>
                <li>・1 デバイスにつき 1 つのパスワードを保管</li>
              </ul>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/digital/settings/upgrade"
                  className="inline-flex items-center justify-center gap-1.5 rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
                >
                  STANDARD にアップグレード
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link
                  href={`/digital/devices/${device.id}`}
                  className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  デバイス画面に戻る
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
