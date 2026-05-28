import type { Metadata } from 'next';
import Link from 'next/link';
import { Mail, ArrowLeft } from 'lucide-react';
import SiteFooter from '@/components/SiteFooter';

export const metadata: Metadata = {
  title: 'メール送信完了｜つぎの手ナビ',
  description: 'ログイン用のリンクをメールでお送りしました。',
};

type Props = {
  searchParams: Promise<{ email?: string }>;
};

export default async function MagicSentPage({ searchParams }: Props) {
  const { email } = await searchParams;

  return (
    <div className="flex min-h-screen flex-col">
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-10">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
            <Mail className="h-8 w-8 text-emerald-600" aria-hidden="true" />
          </div>

          <h1 className="text-xl font-bold text-slate-900">
            メールを送信しました
          </h1>

          {email ? (
            <p className="mt-3 text-sm text-slate-600">
              <span className="font-medium text-slate-900">{email}</span>
              <br />
              宛てにログイン用のリンクをお送りしました。
            </p>
          ) : (
            <p className="mt-3 text-sm text-slate-600">
              入力いただいたメールアドレス宛てにログイン用のリンクをお送りしました。
            </p>
          )}

          <div className="mt-6 space-y-3 rounded-xl bg-slate-50 p-4 text-left text-sm text-slate-700">
            <p className="font-medium text-slate-900">次の手順</p>
            <ol className="list-decimal space-y-2 pl-5 text-slate-600">
              <li>メールアプリを開きます</li>
              <li>「つぎの手ナビ」からのメールを開きます</li>
              <li>「ログインする」ボタンをタップします</li>
            </ol>
          </div>

          <p className="mt-5 text-xs text-slate-500">
            メールが届かない場合は、迷惑メールフォルダもご確認ください。
            <br />
            リンクの有効期限は1時間です。
          </p>

          <Link
            href="/login"
            className="mt-6 inline-flex items-center gap-2 text-sm text-slate-600 underline hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            ログイン画面に戻る
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
