import type { Metadata } from 'next';
import Link from 'next/link';
import GuideCtaLink from '@/components/guide/GuideCtaLink';
import GuideHeader from '@/components/GuideHeader';
import SiteFooter from '@/components/SiteFooter';

const SITE_URL = 'https://www.tsuginotenavi.jp';

export const metadata: Metadata = {
  title: 'パスワード・認証管理ガイド｜安全な管理と二段階認証 | つぎの手ナビ デジタル資産',
  description:
    'スマホのパスワードを安全に管理するためのガイド記事一覧。メモ帳保管の危険性、忘れっぽい人でもできるパスワード管理アプリの始め方、二段階認証・パスキーまで。',
  alternates: {
    canonical: `${SITE_URL}/guide/password-kanri`,
  },
  openGraph: {
    title: 'パスワード・認証管理ガイド｜つぎの手ナビ',
    description:
      'スマホのパスワードを安全に管理するためのガイド記事一覧。メモ帳保管の危険性、管理アプリの始め方、二段階認証・パスキーまで。',
    url: `${SITE_URL}/guide/password-kanri`,
    siteName: 'つぎの手ナビ',
    type: 'website',
    locale: 'ja_JP',
  },
};

const articles = [
  {
    href: '/guide/password-kanri/sumaho-password',
    category: 'パスワード管理',
    title: 'パスワードをメモ帳で管理するのは危険？スマホでも忘れず安全に管理する方法【iPhone/Android】',
    description:
      '危険な保管法の見分け方から、忘れっぽい人でもできるパスワード管理アプリの始め方、二段階認証・パスキーまでを解説します。',
  },
  {
    href: '/guide/password-kanri/nidankai-ninsho',
    category: '二段階認証',
    title: 'スマホの二段階認証とは？設定のやり方と“もしも”の落とし穴',
    description:
      '二段階認証の仕組みと設定手順（SMS・認証アプリ・パスキー）、リカバリーコードや機種変更の注意点までを解説します。',
  },
];

export default function PasswordKanriIndexPage() {
  return (
    <main className="bg-white">
      <GuideHeader />

      <div className="mx-auto max-w-3xl px-5 pb-20 pt-8 sm:px-8">
        <nav className="text-sm text-slate-500">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href="/" className="text-blue-600 hover:underline">
                ホーム
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link href="/guide" className="text-blue-600 hover:underline">
                役立ちガイド
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="text-slate-700">パスワード・認証管理</li>
          </ol>
        </nav>

        <h1 className="mt-10 text-center text-3xl font-semibold leading-tight text-slate-900 sm:text-4xl">
          パスワード・認証管理ガイド
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-center text-base leading-8 text-slate-600">
          スマホのパスワードを「覚えない仕組み」で安全に管理するためのガイドです。危険な保管法の見分け方から、忘れっぽい人でもできる管理アプリの始め方、二段階認証・パスキーまでを扱います。
        </p>

        <section className="mt-14">
          <h2 className="border-b border-slate-200 pb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
            記事一覧
          </h2>
          <ul className="divide-y divide-slate-200">
            {articles.map((article) => (
              <li key={article.href} className="py-7">
                <p className="text-xs font-medium text-slate-500">{article.category}</p>
                <h3 className="mt-2 text-lg font-semibold leading-snug sm:text-xl">
                  <Link href={article.href} className="text-blue-600 hover:underline">
                    {article.title}
                  </Link>
                </h3>
                <p className="mt-3 text-[15px] leading-7 text-slate-600">{article.description}</p>
                <p className="mt-3">
                  <Link
                    href={article.href}
                    className="text-sm font-medium text-blue-600 hover:underline"
                  >
                    記事を読む &rsaquo;
                  </Link>
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-12">
          <h2 className="border-b border-slate-200 pb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
            デジタル資産の基本
          </h2>
          <p className="mt-5 text-[15px] leading-8 text-slate-700">
            デジタル資産の種類や、整理・引き継ぎの全体像は
            <Link href="/guide/digital-shisan" className="text-blue-600 hover:underline">
              デジタル資産の整理と引き継ぎ
            </Link>
            にまとめています。各テーマの入口としてもどうぞ。
          </p>
        </section>

        <section className="mt-12">
          <h2 className="border-b border-slate-200 pb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
            関連ガイド
          </h2>
          <p className="mt-5 text-[15px] leading-8 text-slate-700">
            家族との共有の線引きは
            <Link href="/guide/kazoku-kyoyu" className="text-blue-600 hover:underline">
              家族間の情報共有ガイド
            </Link>
            、スマホ全体の整理は
            <Link href="/guide/digital-seiri" className="text-blue-600 hover:underline">
              デジタル整理術ガイド
            </Link>
            もあわせてどうぞ。
          </p>
        </section>

        <section className="mt-16 rounded-3xl bg-slate-50 p-8 text-center sm:p-10">
          <h2 className="text-xl font-semibold text-slate-900">
            すべての鍵を握る「在りか」を、もしものときに届く形で残す
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[15px] leading-8 text-slate-600">
            あなたにもしもがあったとき、家族が「どこに何があるか」にたどり着けるように。「つぎの手ナビ デジタル資産」は、パスワードや口座・契約・写真の在りかを、生きている間は誰にも見せず、もしものときだけ選んだ人へ届ける準備ができるサービスです。登録・PDF出力・定期リマインドは無料。あなたにできる、いちばんやさしい準備です。
          </p>
          <div className="mt-6">
            <GuideCtaLink
              href="/signup?next=/digital"
              className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
            >
              無料で始める（新規登録）
            </GuideCtaLink>
          </div>
          <p className="mt-4 text-sm">
            <Link href="/" className="text-blue-600 hover:underline">
              サービスの詳しい紹介を見る &rsaquo;
            </Link>
          </p>
        </section>
      </div>

      <SiteFooter />
    </main>
  );
}
