import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import GuideHeader from '@/components/GuideHeader';
import SiteFooter from '@/components/SiteFooter';

const SITE_URL = 'https://www.tsuginotenavi.jp';

export const metadata: Metadata = {
  title: '役立ちガイド｜デジタル整理・パスワード管理・もしもの備え | つぎの手ナビ',
  description:
    'スマホ・パソコンのデジタル整理から、パスワードの安全な管理、もしものときに家族が困らない備えまで。暮らしを整えながら大切な人への準備ができる、つぎの手ナビの役立ちガイドです。',
  alternates: {
    canonical: `${SITE_URL}/guide`,
  },
  openGraph: {
    title: '役立ちガイド｜つぎの手ナビ',
    description:
      'スマホ・パソコンのデジタル整理から、パスワードの安全な管理、もしものときに家族が困らない備えまで。',
    url: `${SITE_URL}/guide`,
    siteName: 'つぎの手ナビ',
    type: 'website',
    locale: 'ja_JP',
    images: [
      {
        url: `${SITE_URL}/images/guide/guide-top-hero.webp`,
        width: 1600,
        height: 900,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '役立ちガイド｜つぎの手ナビ',
    description:
      'スマホ・パソコンのデジタル整理から、パスワードの安全な管理、もしものときに家族が困らない備えまで。',
    images: [`${SITE_URL}/images/guide/guide-top-hero.webp`],
  },
};

// 新着記事（公開日の新しい順。記事を追加したら先頭に足す）
const latestArticles = [
  {
    href: '/guide/kazoku-kyoyu/password-account-kyoyu',
    category: '家族間の情報共有',
    title: '家族とのパスワード・アカウント共有｜どこまで共有する？安全なやり方と線引き',
    date: '2026-06-06',
  },
  {
    href: '/guide/password-kanri/sumaho-password',
    category: 'パスワード・認証管理',
    title: 'スマホのパスワード管理｜「メモは危険」と言われても、忘れっぽい人はどうすればいい？',
    date: '2026-06-05',
  },
  {
    href: '/guide/digital-seiri/sumaho-kakin-seiri',
    category: 'デジタル整理術',
    title: 'スマホの有料サービス・課金を整理する方法｜確認から解約までの全手順',
    date: '2026-06-05',
  },
  {
    href: '/guide/digital-seiri/account-seiri',
    category: 'デジタル整理術',
    title: 'スマホの会員登録・アカウント整理のやり方｜不要な登録の探し方と退会の全手順',
    date: '2026-06-05',
  },
  {
    href: '/guide/digital-seiri/digital-dansyari',
    category: 'デジタル整理術',
    title: 'デジタル断捨離のやり方｜スマホ・アカウント・サブスクをスッキリ整理する全手順',
    date: '2026-06-05',
  },
];

// カテゴリ（ジャンル）。記事が増えたカテゴリを追加していく
const categories = [
  {
    href: '/guide/digital-seiri',
    name: 'デジタル整理術',
    description:
      'スマホ・パソコンのデータ、アプリ、サブスク、アカウントをスッキリ整理する手順。',
    articles: [
      {
        href: '/guide/digital-seiri/digital-dansyari',
        title: 'デジタル断捨離のやり方｜スッキリ整理する全手順',
      },
      {
        href: '/guide/digital-seiri/account-seiri',
        title: '会員登録・アカウント整理のやり方｜探し方と退会の全手順',
      },
      {
        href: '/guide/digital-seiri/sumaho-kakin-seiri',
        title: 'スマホの有料サービス・課金を整理する方法',
      },
    ],
  },
  {
    href: '/guide/password-kanri',
    name: 'パスワード・認証管理',
    description: 'パスワードを「覚えない仕組み」で安全に管理する方法。二段階認証・パスキーまで。',
    articles: [
      {
        href: '/guide/password-kanri/sumaho-password',
        title: 'スマホのパスワード管理｜忘れっぽい人でも安全な方法',
      },
    ],
  },
  {
    href: '/guide/kazoku-kyoyu',
    name: '家族間の情報共有',
    description:
      '家族とのパスワード・アカウント共有の安全なやり方と「どこまで共有するか」の線引き。',
    articles: [
      {
        href: '/guide/kazoku-kyoyu/password-account-kyoyu',
        title: '家族とのパスワード・アカウント共有｜安全なやり方と線引き',
      },
    ],
  },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: '役立ちガイド｜つぎの手ナビ',
  description:
    'スマホ・パソコンのデジタル整理から、パスワードの安全な管理、もしものときに家族が困らない備えまで。',
  url: `${SITE_URL}/guide`,
  inLanguage: 'ja',
};

export default function GuideTopPage() {
  return (
    <main className="bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <GuideHeader />

      <div className="mx-auto max-w-4xl px-5 pb-20 pt-8 sm:px-8">
        <nav className="text-sm text-slate-500">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href="/" className="text-blue-600 hover:underline">
                ホーム
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="text-slate-700">役立ちガイド</li>
          </ol>
        </nav>

        <h1 className="mt-8 text-3xl font-semibold leading-tight text-slate-900 sm:text-4xl">
          役立ちガイド
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600">
          スマホ・パソコンのデジタル整理から、パスワードの安全な管理、もしものときに大切な人が困らない備えまで。暮らしを整えながら、前向きに準備できる記事をお届けします。
        </p>

        <div className="mt-8 overflow-hidden rounded-3xl">
          <Image
            src="/images/guide/guide-top-hero.webp"
            alt="明るいリビングで、家族が穏やかに暮らしの準備について話している様子"
            width={1600}
            height={900}
            priority
            className="h-auto w-full"
          />
        </div>

        {/* 新着記事 */}
        <section className="mt-14">
          <h2 className="border-b border-slate-200 pb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
            新着記事
          </h2>
          <ul className="divide-y divide-slate-200">
            {latestArticles.map((article) => (
              <li key={article.href} className="py-6">
                <div className="flex items-baseline gap-3">
                  <span className="shrink-0 text-xs font-medium text-slate-500">
                    {article.category}
                  </span>
                  <time className="shrink-0 text-xs text-slate-400">{article.date}</time>
                </div>
                <h3 className="mt-2 text-lg font-semibold leading-snug">
                  <Link href={article.href} className="text-blue-600 hover:underline">
                    {article.title}
                  </Link>
                </h3>
              </li>
            ))}
          </ul>
        </section>

        {/* カテゴリ別 */}
        <section className="mt-16">
          <h2 className="border-b border-slate-200 pb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
            カテゴリから探す
          </h2>
          <div className="mt-6 space-y-10">
            {categories.map((cat) => (
              <div key={cat.href}>
                <h3 className="text-xl font-semibold text-slate-900">
                  <Link href={cat.href} className="text-blue-600 hover:underline">
                    {cat.name}
                  </Link>
                </h3>
                <p className="mt-2 text-[15px] leading-7 text-slate-600">{cat.description}</p>
                <ul className="mt-4 space-y-2.5">
                  {cat.articles.map((a) => (
                    <li key={a.href} className="flex items-start gap-3 text-[15px] leading-7">
                      <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
                      <Link href={a.href} className="text-blue-600 hover:underline">
                        {a.title}
                      </Link>
                    </li>
                  ))}
                </ul>
                <p className="mt-3">
                  <Link
                    href={cat.href}
                    className="text-sm font-medium text-blue-600 hover:underline"
                  >
                    {cat.name}の記事一覧 &rsaquo;
                  </Link>
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mt-16 rounded-3xl bg-slate-50 p-8 text-center sm:p-10">
          <h2 className="text-xl font-semibold text-slate-900">
            整理した情報を、もしものときに届く形で残す
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[15px] leading-8 text-slate-600">
            「つぎの手ナビ
            デジタル資産」は、整理したデジタル情報を、見られたくないものは伏せたまま、もしものときだけ大切な人へ引き継ぐ準備ができるサービスです。資産の登録・PDF出力・定期リマインドは無料で使えます。
          </p>
          <div className="mt-6">
            <Link
              href="/signup?next=/digital"
              className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
            >
              無料で始める（新規登録）
            </Link>
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
