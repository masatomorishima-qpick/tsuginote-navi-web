/**
 * /digital/devices/passphrase-reset — パスフレーズを忘れたときのリセット画面
 *
 * パスフレーズを忘れると保存済み PIN は誰も復号できない（仕様）。
 * このページは「復元」ではなく「いったん削除して、新しいパスフレーズで
 * 登録し直す」ための導線。実処理は POST /api/digital/pins/reset。
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createDigitalServerClient } from '@/lib/supabase/digitalServer';
import { isStepupEnabled } from '@/lib/digital/stepup';
import PinResetClient from '@/components/digital/PinResetClient';

export const metadata: Metadata = {
  title: 'マスターコードを忘れたとき | つぎの手ナビ',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function PassphraseResetPage() {
  const supabase = await createDigitalServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(
      `/login?next=${encodeURIComponent('/digital/devices/passphrase-reset')}`
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F0]">
      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-10">
        {/* 大見出し（中央寄せ、十分な余白） */}
        <header className="mb-6 sm:mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            マスターコードを忘れたとき
          </h1>
          <p className="mt-3 text-sm text-gray-600 leading-relaxed">
            デバイス・パスワード（スマホ・パソコンの画面ロック等に使うパスワード）を守るマスターコードが
            わからなくなった場合は、いったんリセットして、新しいマスターコードで
            登録し直してください。
          </p>
        </header>

        <div className="space-y-6">
          <PinResetClient
            userEmail={user.email ?? null}
            stepupEnabled={isStepupEnabled()}
          />

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
