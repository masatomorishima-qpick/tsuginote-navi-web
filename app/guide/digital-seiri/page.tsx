import type { Metadata } from 'next';
import Link from 'next/link';
import GuideCtaLink from '@/components/guide/GuideCtaLink';
import GuideHeader from '@/components/GuideHeader';
import SiteFooter from '@/components/SiteFooter';

const SITE_URL = 'https://www.tsuginotenavi.jp';

export const metadata: Metadata = {
  title: 'デジタル整理術ガイド｜スマホ・アカウント・サブスクの整理 | つぎの手ナビ デジタル資産',
  description:
    'スマホ・パソコンの中のデータ、アプリ、サブスク、アカウント、パスワードをスッキリ整理するためのガイド記事一覧。デジタル断捨離のやり方から、整理した情報の安全な残し方まで。',
  alternates: {
    canonical: `${SITE_URL}/guide/digital-seiri`,
  },
  openGraph: {
    title: 'デジタル整理術ガイド｜つぎの手ナビ',
    description:
      'スマホ・パソコンの中のデータ、アプリ、サブスク、アカウント、パスワードをスッキリ整理するためのガイド記事一覧。',
    url: `${SITE_URL}/guide/digital-seiri`,
    siteName: 'つぎの手ナビ',
    type: 'website',
    locale: 'ja_JP',
  },
};

const articles = [
  {
    href: '/guide/digital-seiri/digital-dansyari',
    category: 'デジタル断捨離',
    title: 'デジタル断捨離のやり方｜スマホ・アカウント・サブスクをスッキリ整理する全手順',
    description:
      '写真・アプリ・サブスク・アカウント・メールの5つのステップに分けて、デジタル断捨離の手順を解説します。',
  },
  {
    href: '/guide/digital-seiri/account-seiri',
    category: 'アカウント整理',
    title: 'スマホの会員登録・アカウント整理のやり方｜不要な登録の探し方と退会の全手順',
    description:
      'どこに登録したか思い出せなくても大丈夫。使っていない登録サービスの洗い出し方から、退会のコツと注意点までを解説します。',
  },
  {
    href: '/guide/digital-seiri/sumaho-kakin-seiri',
    category: '課金・サブスク整理',
    title: 'スマホの有料サービス・課金を整理する方法｜確認から解約までの全手順',
    description:
      'アプリストアのサブスク、キャリア決済、有料オプションまで「4つの種類」に分けて確認・解約。気づかず払っているお金が見つかります。',
  },
  {
    href: '/guide/digital-seiri/sumaho-shashin-seiri',
    category: '写真整理',
    title: 'スマホの写真整理のやり方｜減らす・分類・バックアップの全手順【iPhone/Android】',
    description:
      '数千枚の写真を「減らす→分類→バックアップ→溜めない」で整理。最後に「整理した写真を家族が取り出せるか」という視点まで。',
  },
  {
    href: '/guide/digital-seiri/sabusuku-kanri',
    category: 'サブスク管理',
    title: 'サブスク管理アプリの選び方と使い方｜契約の見える化から“もしもの備え”まで',
    description:
      'サブスク管理アプリでできること・選び方の4つの軸から、アプリに頼らない管理法、家族が困らない「在りか」の備えまで解説します。',
  },
  {
    href: '/guide/digital-seiri/mail-seiri',
    category: 'メール整理',
    title: 'メールの整理術｜あふれた受信トレイをスッキリさせる手順',
    description:
      '不要メルマガの解除→フィルタで自動振り分け→受信トレイを空に保つ手順。最後に「メールは全アカウントの鍵」という視点も。',
  },
];

export default function DigitalSeiriIndexPage() {
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
            <li className="text-slate-700">デジタル整理術</li>
          </ol>
        </nav>

        <h1 className="mt-10 text-center text-3xl font-semibold leading-tight text-slate-900 sm:text-4xl">
          デジタル整理術ガイド
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-center text-base leading-8 text-slate-600">
          スマホ・パソコンの中に溜まったデータ、アプリ、サブスク、アカウント、パスワードをスッキリ整理するためのガイドです。「減らす・整える」の実用的な手順から、整理した情報を安全に残す方法までを扱います。
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
            パスワードを安全に管理する方法は
            <Link href="/guide/password-kanri" className="text-blue-600 hover:underline">
              パスワード・認証管理ガイド
            </Link>
            もあわせてどうぞ。
          </p>
        </section>

        <section className="mt-16 rounded-3xl bg-slate-50 p-8 text-center sm:p-10">
          <h2 className="text-xl font-semibold text-slate-900">
            整理した情報を、もしものときに届く形で残す
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
