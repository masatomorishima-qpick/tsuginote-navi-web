import type { Metadata } from 'next';
import Link from 'next/link';
import GuideHeader from '@/components/GuideHeader';
import SiteFooter from '@/components/SiteFooter';

const SITE_URL = 'https://www.tsuginotenavi.jp';

export const metadata: Metadata = {
  title: 'コラム｜デジタル資産との付き合い方を考える読み物 | つぎの手ナビ',
  description:
    'サブスク・ネット銀行・スマホの写真——暮らしを支えるデジタルの仕組みに隠れた、知られていない性質を解き明かす読み物。公的機関の事例と数字をもとに、前向きな備え方まで考えます。',
  alternates: { canonical: `${SITE_URL}/guide/column` },
  openGraph: {
    title: 'コラム｜つぎの手ナビ',
    description:
      '暮らしを支えるデジタルの仕組みに隠れた、知られていない性質を解き明かす読み物。',
    url: `${SITE_URL}/guide/column`,
    siteName: 'つぎの手ナビ',
    type: 'website',
    locale: 'ja_JP',
  },
};

const articles = [
  {
    href: '/guide/column/okane-kanri-kichinto',
    category: 'お金の管理の死角',
    title: 'お金の管理がきちんとしている人ほど、家族を困らせてしまう3つの理由',
    description:
      'ネット銀行・NISA・ペーパーレス——正しい管理ほど、家族からは「見えない資産」になる。きちんとしている人だけに起きる副作用と、金額もパスワードも書かない「どこに何があるかの一覧」を残す備え方。',
  },
];

export default function ColumnIndexPage() {
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
            <li className="text-slate-700">コラム</li>
          </ol>
        </nav>

        <h1 className="mt-10 text-center text-3xl font-semibold leading-tight text-slate-900 sm:text-4xl">
          コラム
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-center text-base leading-8 text-slate-600">
          サブスク・ネット銀行・スマホの写真——暮らしを支えるデジタルの仕組みに隠れた、知られていない性質を解き明かす読み物です。公的機関の事例と数字をもとに、前向きな備え方まで考えます。
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
            具体的な整理の手順は
            <Link href="/guide/digital-seiri" className="text-blue-600 hover:underline">
              デジタル整理術ガイド
            </Link>
            、もしものときへの備えは
            <Link href="/guide/moshimo-sonae" className="text-blue-600 hover:underline">
              もしもの備えガイド
            </Link>
            もあわせてどうぞ。
          </p>
        </section>
      </div>

      <SiteFooter />
    </main>
  );
}
