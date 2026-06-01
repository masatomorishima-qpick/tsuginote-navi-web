/**
 * /digital/devices/[id]/pin — 登録済み PIN の管理ページ
 *
 * サーバー側で検証：
 *   1. ログイン済みであること（未ログインなら /login へ）
 *   2. そのデバイスが本人の物で、削除されていないこと
 *   3. PIN が登録済みであること（未登録なら登録画面にリダイレクト）
 *
 * 画面上の操作（PIN を表示／更新／削除）はすべてクライアント component で実装し、
 * step-up / パスフレーズ入力 / 復号 / 30 秒自動マスク を PinManagePanel が担当する。
 *
 * 🔒 このサーバーコンポーネントは **暗号文も平文も参照しない**。
 *    PIN の実データを取得するのは GET /api/digital/pins/[device_id]（step-up 通過必須）のみ。
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import {
  ShieldCheck,
  Info,
} from 'lucide-react';
import { createDigitalServerClient } from '@/lib/supabase/digitalServer';
import { getDeviceById, deviceHasPin } from '@/lib/digital/devices';
import { isStepupEnabled } from '@/lib/digital/stepup';
import PinManagePanel from '@/components/digital/PinManagePanel';

export const metadata: Metadata = {
  title: 'パスワードを表示・管理 | つぎの手ナビ',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ id: string }> };

export default async function PinManagePage({ params }: Props) {
  const { id } = await params;
  const supabase = await createDigitalServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=/digital/devices/${id}/pin`);
  }

  const device = await getDeviceById(supabase, user.id, id);
  if (!device) {
    notFound();
  }

  // 未登録ならデバイス編集画面へ
  //   ここに来るケースは主に「削除直後の refresh」「直リンクで未登録のデバイスに来た」の 2 種。
  //   どちらも /[id] のデバイス編集画面に飛ばすことで、「パスワード未保管」表示 +
  //   「パスワードを登録する」CTA を提示し、ユーザーが次のアクションを選べるようにする。
  const hasPin = await deviceHasPin(supabase, user.id, id);
  if (!hasPin) {
    redirect(`/digital/devices/${id}`);
  }

  const stepupEnabled = isStepupEnabled();

  return (
    <div className="min-h-screen bg-[#F5F5F0]">
      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-10">
        {/* 大見出し（中央寄せ、十分な余白） */}
        <header className="mb-6 sm:mb-8">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl text-center">
            パスワード
          </h1>
          <p className="mt-3 text-sm text-gray-600 leading-relaxed">
            {device.device_name} に登録されたパスワードを表示します。
            {stepupEnabled
              ? 'セキュリティのため、操作ごとにメール再認証とマスターコード入力が必要です。'
              : 'マスターコードの入力が必要です。表示されたパスワードは 30 秒で自動的に隠れます。'}
          </p>
        </header>

        <div className="space-y-4">

      <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-6">
        <div className="mb-4 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-900">
          <ShieldCheck
            className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-600"
            aria-hidden="true"
          />
          <div className="space-y-0.5 leading-relaxed">
            <p className="font-medium">この操作のセキュリティ設定</p>
            <ul className="list-inside list-disc text-emerald-900/90">
              {stepupEnabled && (
                <li>メール宛ての 6 桁ワンタイムコードで再認証します。</li>
              )}
              <li>登録時に設定した<b>マスターコード</b>がないとパスワードは表示できません。</li>
              <li>表示されたパスワードは 30 秒で自動的に隠れます。</li>
            </ul>
          </div>
        </div>

        <PinManagePanel
          deviceId={device.id}
          deviceName={device.device_name}
          userEmail={user.email ?? null}
          stepupEnabled={stepupEnabled}
        />

        <div className="mt-5 flex items-start gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
          <Info
            className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-400"
            aria-hidden="true"
          />
          <p className="leading-relaxed">
            マスターコードを忘れてしまったときは「パスワードを削除」→「再登録」の手順で作り直してください。
            削除後は自動で登録画面に戻ります。
          </p>
        </div>
      </section>

          {/* 戻るリンク（下部） */}
          <div className="pt-4 text-center">
            <Link
              href={`/digital/devices/${device.id}`}
              className="inline-flex items-center gap-1 text-sm text-emerald-600 active:opacity-70"
            >
              ← デバイス編集画面に戻る
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
