import type { Metadata } from 'next';
import Link from 'next/link';
import GuideCtaLink from '@/components/guide/GuideCtaLink';
import GuideHeader from '@/components/GuideHeader';
import SiteFooter from '@/components/SiteFooter';

const SITE_URL = 'https://www.tsuginotenavi.jp';

export const metadata: Metadata = {
  title: '家族間の情報共有ガイド｜パスワード・アカウントの共有と線引き | つぎの手ナビ デジタル資産',
  description:
    '家族とのパスワード・アカウント共有の安全なやり方と「どこまで共有するか」の線引きを解説するガイド記事一覧。日常の共有から、もしものときの備えまで。',
  alternates: {
    canonical: `${SITE_URL}/guide/kazoku-kyoyu`,
  },
  openGraph: {
    title: '家族間の情報共有ガイド｜つぎの手ナビ',
    description:
      '家族とのパスワード・アカウント共有の安全なやり方と「どこまで共有するか」の線引きを解説するガイド記事一覧。',
    url: `${SITE_URL}/guide/kazoku-kyoyu`,
    siteName: 'つぎの手ナビ',
    type: 'website',
    locale: 'ja_JP',
  },
};

const articles = [
  {
    href: '/guide/kazoku-kyoyu/fuufu-joho-kyoyu',
    category: '夫婦の情報共有',
    title: '夫婦の情報共有のやり方｜日常のすれ違い解消から“もしも”の備えまで',
    description:
      '予定・家計・連絡先などの「日常の共有」をアプリで仕組み化し、見落としがちな「もしものとき」の備えまで。プライバシーを守りながら共有するコツも。',
  },
  {
    href: '/guide/kazoku-kyoyu/password-account-kyoyu',
    category: '家族間の情報共有',
    title: '家族とのパスワード・アカウント共有｜どこまで共有する？安全なやり方と線引き',
    description:
      '何を共有してよくて、何は個人に留めるべきか。線引きの考え方から、Apple・Google・管理アプリの安全な共有手順までを解説します。',
  },
  {
    href: '/guide/kazoku-kyoyu/joho-kyoyu-hikaku',
    category: '方法の比較',
    title: 'パスワードや大事な情報、エクセル管理は危険？家族に残す・共有する方法の比較',
    description:
      'エクセル／スプレッドシート／パスワード管理アプリ／専用サービスを中立比較。自分に合う方法を選ぶ4つの判断軸まで。',
  },
];

export default function KazokuKyoyuIndexPage() {
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
            <li className="text-slate-700">家族間の情報共有</li>
          </ol>
        </nav>

        <h1 className="mt-10 text-center text-3xl font-semibold leading-tight text-slate-900 sm:text-4xl">
          家族間の情報共有ガイド
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-center text-base leading-8 text-slate-600">
          家族とのパスワードやアカウントの共有を、安全に・気持ちよく続けるためのガイドです。「どこまで共有するか」の線引きから、暗号化された共有の仕組み、もしものときの備えまでを扱います。
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
            関連ガイド
          </h2>
          <p className="mt-5 text-[15px] leading-8 text-slate-700">
            パスワードそのものの安全な管理は
            <Link href="/guide/password-kanri" className="text-blue-600 hover:underline">
              パスワード・認証管理ガイド
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
            生きている間は見せず、もしものときだけ届く備えを
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[15px] leading-8 text-slate-600">
            「つぎの手ナビ
            デジタル資産」は、日常の共有とは別に、もしものときだけ大切な人へ情報が届く準備ができるサービスです。資産の登録・PDF出力・定期リマインドは無料で使えます。
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
