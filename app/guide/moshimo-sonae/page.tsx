import type { Metadata } from 'next';
import Link from 'next/link';
import GuideCtaLink from '@/components/guide/GuideCtaLink';
import GuideHeader from '@/components/GuideHeader';
import SiteFooter from '@/components/SiteFooter';

const SITE_URL = 'https://www.tsuginotenavi.jp';

export const metadata: Metadata = {
  title: 'もしもの備えガイド｜急な入院・もしものときに家族が困らない準備 | つぎの手ナビ デジタル資産',
  description:
    '急な入院や、もしものときに家族が困らないための「前向きな備え」をまとめたガイド記事一覧。持ち物だけでなく、連絡先や情報の在りかの残し方まで。',
  alternates: { canonical: `${SITE_URL}/guide/moshimo-sonae` },
  openGraph: {
    title: 'もしもの備えガイド｜つぎの手ナビ',
    description:
      '急な入院や、もしものときに家族が困らないための「前向きな備え」をまとめたガイド記事一覧。',
    url: `${SITE_URL}/guide/moshimo-sonae`,
    siteName: 'つぎの手ナビ',
    type: 'website',
    locale: 'ja_JP',
  },
};

const articles = [
  {
    href: '/guide/moshimo-sonae/kyu-nyuin-sonae',
    category: '入院の備え',
    title: '急な入院に備えて、家族に伝えておく情報リスト｜持ち物だけでは足りない',
    description:
      '持ち物だけでなく、本人が動けない間に家族が代わりに動くための「情報の備え」を解説。連絡先・保険の場所・スマホのロックまで。',
  },
];

export default function MoshimoSonaeIndexPage() {
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
            <li className="text-slate-700">もしもの備え</li>
          </ol>
        </nav>

        <h1 className="mt-10 text-center text-3xl font-semibold leading-tight text-slate-900 sm:text-4xl">
          もしもの備えガイド
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-center text-base leading-8 text-slate-600">
          急な入院や、もしものときに大切な人が困らないための「前向きな備え」をまとめたガイドです。持ち物だけでなく、連絡先や情報の在りかの残し方までを扱います。
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
            保険・契約の整理は
            <Link href="/guide/shisan-kanri" className="text-blue-600 hover:underline">
              資産・お金の管理ガイド
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
            デジタル資産」は、連絡先や資産・アカウントの在りかを、生きている間は誰にも見せず、もしものときだけ大切な人へ届ける準備ができるサービスです。
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
