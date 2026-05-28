/**
 * /reset-password — パスワード再設定ページ
 *
 * Supabase の recovery メールリンクから飛んで来るユーザーが、新しいパスワードを設定する。
 * recovery セッションは Supabase が自動で確立するため、ここではセッション存在を確認するだけ。
 */

import type { Metadata } from 'next';
import SiteFooter from '@/components/SiteFooter';
import MarketingHeader from '@/components/MarketingHeader';
import ResetPasswordForm from '@/components/digital/ResetPasswordForm';

export const metadata: Metadata = {
  title: 'パスワード再設定｜つぎの手ナビ デジタル資産',
  description: '新しいパスワードを設定します。',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <MarketingHeader />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-10">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-slate-900">パスワードを再設定</h1>
          </div>
          <ResetPasswordForm />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
