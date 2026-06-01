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
    <div className="mx-auto max-w-2xl space-y-6">
      {/* 見出し */}
      <header>
        <h1 className="text-2xl font-bold text-slate-900">
          マスターコードを忘れたとき
        </h1>
        <p className="mt-1 text-sm leading-relaxed text-slate-600">
          パスワード（スマホ・PC のロック解除パスワード）を守るマスターコードが
          わからなくなった場合は、いったんリセットして、新しいマスターコードで
          登録し直してください。
        </p>
      </header>

      <PinResetClient
        userEmail={user.email ?? null}
        stepupEnabled={isStepupEnabled()}
      />
    </div>
  );
}
