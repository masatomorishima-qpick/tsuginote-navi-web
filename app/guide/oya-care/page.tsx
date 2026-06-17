import type { Metadata } from 'next';
import Link from 'next/link';
import GuideCtaLink from '@/components/guide/GuideCtaLink';
import GuideHeader from '@/components/GuideHeader';
import SiteFooter from '@/components/SiteFooter';

const SITE_URL = 'https://www.tsuginotenavi.jp';

export const metadata: Metadata = {
  title: '親・家族のケアガイド｜親のデジタル・お金まわりを前向きに備える | つぎの手ナビ デジタル資産',
  description:
    '親のネット銀行・スマホ・契約まわりを、プライバシーに踏み込まずに「在りか」の共有で前向きに備えるためのガイド記事一覧。元気な今だからこそできる、穏やかな親子の備えを扱います。',
  alternates: { canonical: `${SITE_URL}/guide/oya-care` },
  openGraph: {
    title: '親・家族のケアガイド｜つぎの手ナビ',
    description:
      '親のネット銀行・スマホ・契約まわりを、プライバシーに踏み込まずに「在りか」の共有で前向きに備えるためのガイド記事一覧。',
    url: `${SITE_URL}/guide/oya-care`,
    siteName: 'つぎの手ナビ',
    type: 'website',
    locale: 'ja_JP',
  },
};

const articles = [
  {
    href: '/guide/oya-care/oya-netbank',
    category: '親のお金まわりの備え',
    title: '親がネット銀行を使っているなら｜もしものとき家族が困らない「在りか」の備え方',
    description:
      '通帳がないネット銀行は、家族から「見えない」資産になりがち。残高もパスワードも聞かずに、「在りか」だけを共有する3ステップを解説します。',
  },
];

export default function OyaCareIndexPage() {
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
            <li className="text-slate-700">親・家族のケア</li>
          </ol>
        </nav>

        <h1 className="mt-10 text-center text-3xl font-semibold leading-tight text-slate-900 sm:text-4xl">
          親・家族のケアガイド
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-center text-base leading-8 text-slate-600">
          親のネット銀行・スマホ・契約まわりを、プライバシーに踏み込まずに「在りか」の共有で備えるためのガイドです。元気な今だからこそできる、穏やかな親子の備えを扱います。
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
            急な入院などへの備えは
            <Link href="/guide/moshimo-sonae" className="text-blue-600 hover:underline">
              もしもの備えガイド
            </Link>
            、家族との情報共有は
            <Link href="/guide/kazoku-kyoyu" className="text-blue-600 hover:underline">
              家族間の情報共有ガイド
            </Link>
            もあわせてどうぞ。
          </p>
        </section>

        <section className="mt-16 rounded-3xl bg-slate-50 p-8 text-center sm:p-10">
          <h2 className="text-xl font-semibold text-slate-900">
            情報の「在りか」を、もしものときに届く形で残す
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[15px] leading-8 text-slate-600">
            「つぎの手ナビ
            デジタル資産」は、口座やアカウントの在りかを、生きている間は誰にも見せず、もしものときだけ大切な人へ届ける準備ができるサービスです。
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
