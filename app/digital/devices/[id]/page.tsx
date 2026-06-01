/**
 * /digital/devices/[id] — デバイス編集ページ
 *
 * フォームと削除ボタンのほか、PIN 登録状況サマリー（登録済み／未登録）も表示する。
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import {
  KeyRound,
  ShieldCheck,
  ShieldOff,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { createDigitalServerClient } from '@/lib/supabase/digitalServer';
import { getDeviceById, deviceHasPin } from '@/lib/digital/devices';
import { getOwnSubscription, effectivePlan } from '@/lib/digital/subscriptions';
import { PLAN_LIMITS } from '@/types/digital';
import DeviceEditor from '@/components/digital/DeviceEditor';

export const metadata: Metadata = {
  title: 'デバイスを編集 | つぎの手ナビ',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string }>;
};

export default async function EditDevicePage({ params, searchParams }: Props) {
  const { id } = await params;
  const { created } = await searchParams;
  const justCreated = created === '1';
  const supabase = await createDigitalServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=/digital/devices/${id}`);
  }

  const device = await getDeviceById(supabase, user.id, id);
  if (!device) {
    notFound();
  }

  const hasPin = await deviceHasPin(supabase, user.id, id);

  // STANDARDプランかどうか（PIN 保管機能を表示するか）
  const subscription = await getOwnSubscription(supabase, user.id);
  const canStorePin = PLAN_LIMITS[effectivePlan(subscription)].canStorePin;

  return (
    <div className="min-h-screen bg-[#F5F5F0]">
      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-10">
        {/* 大見出し（中央寄せ、十分な余白） */}
        <header className="mb-6 sm:mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            {device.device_name} を編集
          </h1>
        </header>

        <div className="space-y-4">

      {/* PIN 登録済み：表示・更新への誘導カード（hasPin=false 側と同じスタイルに揃える） */}
      {hasPin && (
        <div className="flex flex-col gap-3 rounded-xl border border-emerald-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100">
              <ShieldCheck
                className="h-5 w-5 text-emerald-700"
                aria-hidden="true"
              />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">
                パスワード保管済み
              </p>
              <p className="mt-0.5 text-xs text-slate-600">
                暗号化して安全に保管しています。表示・更新・削除ができます。
              </p>
            </div>
          </div>
          <Link
            href={`/digital/devices/${device.id}/pin`}
            className="inline-flex flex-shrink-0 items-center justify-center gap-1.5 rounded-full border border-emerald-300 bg-white px-5 py-2.5 text-sm font-semibold text-emerald-800 hover:bg-emerald-50"
          >
            パスワードを表示・更新
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      )}

      {/* デバイス追加完了の成功バナー（?created=1 の時のみ） */}
      {justCreated && (
        <div className="mb-4 flex items-start gap-3 rounded-xl border border-emerald-300 bg-emerald-50 p-4">
          <CheckCircle2
            className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600"
            aria-hidden="true"
          />
          <div className="flex-1 text-sm text-emerald-900">
            <p className="font-semibold">
              デバイスを登録しました。
            </p>
            <p className="mt-1 text-emerald-900/90">
              {canStorePin
                ? '次に、このデバイスのロック解除パスワードを保管しましょう。下のボタンから登録できます。'
                : 'デバイス情報の登録が完了しました。STANDARDプランにアップグレードすると、ロック解除パスワードの保管機能もご利用いただけます。'}
            </p>
          </div>
        </div>
      )}

      {/* PIN 未登録時：登録への誘導カード（よりはっきり表示） */}
      {!hasPin && canStorePin && (
        <div className="mb-4 flex flex-col gap-3 rounded-xl border border-emerald-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100">
              <KeyRound
                className="h-5 w-5 text-emerald-700"
                aria-hidden="true"
              />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">
                ロック解除パスワードを保管しましょう
              </p>
              <p className="mt-0.5 text-xs text-slate-600">
                暗号化して安全に保管します。マスターコードなしでは誰も取り出せません。
              </p>
            </div>
          </div>
          <Link
            href={`/digital/devices/${device.id}/pin/new`}
            className="inline-flex flex-shrink-0 items-center justify-center gap-1.5 rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
          >
            パスワードを登録する
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      )}

      {/* PIN 未登録 & FREEプラン：アップグレード誘導 */}
      {!hasPin && !canStorePin && (
        <div className="mb-4 flex items-start gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
          <ShieldOff
            className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-400"
            aria-hidden="true"
          />
          <p>
            ロック解除パスワードの保管は STANDARDプラン限定の機能です。
            <Link
              href="/digital/settings/plan"
              className="ml-1 font-semibold text-emerald-700 hover:underline"
            >
              アップグレード
            </Link>
            でご利用いただけます。
          </p>
        </div>
      )}

      <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-6">
        <DeviceEditor device={device} hasPin={hasPin} />
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
