import type { Metadata } from 'next';
import Link from 'next/link';
import SiteFooter from '@/components/SiteFooter';
import MarketingHeader from '@/components/MarketingHeader';
import LoginForm from '@/components/digital/LoginForm';

export const metadata: Metadata = {
  title: 'ログイン｜つぎの手ナビ デジタル資産整理',
  description:
    'Googleアカウントまたはメールアドレスでログインし、デジタル資産の整理を始めます。',
};

type Props = {
  searchParams: Promise<{ next?: string; error?: string; deleted?: string }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const { next, error, deleted } = await searchParams;

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <MarketingHeader />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-10">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-8 text-center">
            <Link href="/" className="inline-block">
              <h1 className="text-2xl font-bold text-slate-900">つぎの手ナビ</h1>
              <p className="mt-1 text-sm text-slate-500">デジタル資産の整理</p>
            </Link>
          </div>

          <h2 className="mb-2 text-center text-lg font-semibold text-slate-900">
            ログイン
          </h2>
          <p className="mb-6 text-center text-sm text-slate-600">
            登録済みのメールアドレスとパスワードでログインしてください
          </p>

          {deleted === '1' && (
            <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
              アカウントを削除しました。ご利用ありがとうございました。
            </div>
          )}

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              ログインに失敗しました。もう一度お試しください。
            </div>
          )}

          <LoginForm nextPath={next ?? '/digital'} />

          <div className="mt-8 space-y-3 border-t border-slate-100 pt-6 text-xs text-slate-500">
            <p>
              ご利用開始により、
              <Link href="/terms" className="underline hover:text-slate-700">
                利用規約
              </Link>
              および
              <Link href="/privacy" className="underline hover:text-slate-700">
                プライバシーポリシー
              </Link>
              に同意したものとみなします。
            </p>
            <p>
              ※ つぎの手ナビでは、デジタル資産のパスワードやID等の機密情報は保存しません。
            </p>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
