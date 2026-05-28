/**
 * /signup — 新規登録ページ（メール + パスワード）
 *
 * Phase 1.5：認証拡張で新設。
 * メール + パスワードでアカウント作成。確認メール送信後、ユーザーがリンクをクリックして
 * 登録完了。完了後は /digital にリダイレクトされる。
 *
 * ログイン済みユーザーは /digital へ自動誘導。
 */

import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import SiteFooter from '@/components/SiteFooter';
import MarketingHeader from '@/components/MarketingHeader';
import SignupForm from '@/components/digital/SignupForm';
import { createDigitalServerClient } from '@/lib/supabase/digitalServer';

export const metadata: Metadata = {
  title: '新規登録｜つぎの手ナビ デジタル資産',
  description:
    'メールアドレスとパスワードで、つぎの手ナビ デジタル資産の新規アカウントを作成します。30 日間無料、クレジットカード登録不要。',
  robots: { index: true, follow: true },
};

export const dynamic = 'force-dynamic';

type Props = {
  searchParams: Promise<{ next?: string }>;
};

export default async function SignupPage({ searchParams }: Props) {
  const supabase = await createDigitalServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    redirect('/digital');
  }

  const { next } = await searchParams;
  const nextPath = next ?? '/digital';

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <MarketingHeader />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-10">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-slate-900">無料で新規登録</h1>
            <p className="mt-2 text-sm text-slate-600">
              30 日間、STANDARD のすべての機能を無料でお試しいただけます
            </p>
          </div>

          <SignupForm nextPath={nextPath} />
        </div>

        <p className="mt-6 text-center text-xs text-slate-500">
          ※ クレジットカード登録不要 / 30 日後 FREE プランへ自動切替
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
