/**
 * /digital/account/delete — 退会（アカウント削除）確認ページ
 *
 * /digital/settings から「退会する」を押したときの遷移先。
 * 実際の削除は AccountDeleteForm（クライアント）が
 * POST /api/digital/account/delete を叩く。
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { createDigitalServerClient } from '@/lib/supabase/digitalServer';
import AccountDeleteForm from '@/components/digital/AccountDeleteForm';

export const metadata: Metadata = {
  title: 'アカウント削除 | つぎの手ナビ デジタル資産',
  description:
    'デジタル資産機能のアカウントを削除（退会）します。登録データは原則として即時削除されます。',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function AccountDeletePage() {
  const supabase = await createDigitalServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?next=/digital/account/delete');
  }

  // email が無いアカウント（将来的な SMS 認証等）は画面からの退会をブロック
  if (!user.email) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <header>
          <h1 className="text-2xl font-bold text-slate-900">アカウント削除</h1>
        </header>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
          このアカウントには確認用メールアドレスが登録されていないため、
          画面からの退会はご利用いただけません。運営会社までお問い合わせください。
        </div>
        <Link
          href="/digital/settings"
          className="inline-flex items-center gap-1 text-sm font-medium text-emerald-700 hover:underline"
        >
          ← 設定に戻る
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* パンくず */}
      <nav
        aria-label="パンくず"
        className="flex items-center gap-1 text-xs text-slate-500"
      >
        <Link
          href="/digital"
          className="hover:text-emerald-700 hover:underline"
        >
          ダッシュボード
        </Link>
        <ChevronRight className="h-3 w-3" aria-hidden="true" />
        <Link
          href="/digital/settings"
          className="hover:text-emerald-700 hover:underline"
        >
          設定
        </Link>
        <ChevronRight className="h-3 w-3" aria-hidden="true" />
        <span className="text-slate-700">アカウント削除</span>
      </nav>

      {/* 見出し */}
      <header>
        <h1 className="text-2xl font-bold text-slate-900">アカウント削除（退会）</h1>
        <p className="mt-1 text-sm text-slate-600">
          つぎの手ナビ デジタル資産のアカウントを削除します。
          登録されたデータ、共有リンク、リマインド設定はすべて削除されます。
        </p>
      </header>

      <AccountDeleteForm userEmail={user.email} />
    </div>
  );
}
