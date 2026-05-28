/**
 * /forgot-password — パスワードリセット要求ページ
 *
 * メールアドレス入力 → パスワード再設定メール送信。
 * メール内のリンクから /reset-password に飛ぶ。
 */

import type { Metadata } from 'next';
import SiteFooter from '@/components/SiteFooter';
import MarketingHeader from '@/components/MarketingHeader';
import ForgotPasswordForm from '@/components/digital/ForgotPasswordForm';

export const metadata: Metadata = {
  title: 'パスワードを忘れた方｜つぎの手ナビ デジタル資産',
  description: 'パスワード再設定用のメールをお送りします。',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <MarketingHeader />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-10">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-slate-900">パスワードをお忘れの方へ</h1>
          </div>
          <ForgotPasswordForm />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
