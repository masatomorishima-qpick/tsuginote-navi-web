import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import GuideCtaLink from '@/components/guide/GuideCtaLink';
import GuideHeader from '@/components/GuideHeader';
import SiteFooter from '@/components/SiteFooter';

const SITE_URL = 'https://www.tsuginotenavi.jp';

export const metadata: Metadata = {
  title: '役立ちガイド｜デジタル整理・パスワード管理・もしもの備え | つぎの手ナビ デジタル資産',
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
    href: '/guide/column/pet-omoide-5shukan',
    category: 'コラム',
    title: 'ペットの思い出を一生ものにする5つの習慣',
    date: '2026-06-18',
  },
  {
    href: '/guide/column/sumaho-shuyaku-5sen',
    category: 'コラム',
    title: 'この5年で、スマホ1台に集約された機能5選',
    date: '2026-06-18',
  },
  {
    href: '/guide/column/kodomo-omoide-5shukan',
    category: 'コラム',
    title: '子どもの思い出を一生ものにする5つの習慣',
    date: '2026-06-14',
  },
  {
    href: '/guide/column/saifu-hikidashi-5sen',
    category: 'コラム',
    title: 'この5年で、財布と引き出しから消えたもの5選',
    date: '2026-06-12',
  },
  {
    href: '/guide/column/okane-kanri-kichinto',
    category: 'コラム',
    title: 'お金の管理がきちんとしている人ほど、家族を困らせてしまう3つの理由',
    date: '2026-06-12',
  },
  {
    href: '/guide/column/subsuku-kaiyaku-riyu',
    category: 'コラム',
    title: 'サブスクは全部、死ぬまでに解約しておかなければならない3つの理由',
    date: '2026-06-12',
  },
  {
    href: '/guide/digital-seiri/sabusuku-kanri',
    category: 'デジタル整理術',
    title: 'サブスク管理アプリの選び方と使い方｜契約の見える化から“もしもの備え”まで',
    date: '2026-06-11',
  },
  {
    href: '/guide/oya-care/oya-netbank',
    category: '親・家族のケア',
    title: '親がネット銀行を使っているなら｜もしものとき家族が困らない「在りか」の備え方',
    date: '2026-06-10',
  },
  {
    href: '/guide/kazoku-kyoyu/fuufu-joho-kyoyu',
    category: '家族間の情報共有',
    title: '夫婦の情報共有のやり方｜日常のすれ違い解消から“もしも”の備えまで',
    date: '2026-06-10',
  },
  {
    href: '/guide/moshimo-sonae/kyu-nyuin-sonae',
    category: 'もしもの備え',
    title: '急な入院に備えて、家族に伝えておく情報リスト｜持ち物だけでは足りない',
    date: '2026-06-09',
  },
  {
    href: '/guide/password-kanri/nidankai-ninsho',
    category: 'パスワード・認証管理',
    title: 'スマホの二段階認証とは？設定のやり方と“もしも”の落とし穴',
    date: '2026-06-09',
  },
  {
    href: '/guide/digital-seiri/mail-seiri',
    category: 'デジタル整理術',
    title: 'メールの整理術｜あふれた受信トレイをスッキリさせる手順',
    date: '2026-06-09',
  },
  {
    href: '/guide/kazoku-kyoyu/joho-kyoyu-hikaku',
    category: '家族間の情報共有',
    title: 'パスワードや大事な情報、エクセル管理は危険？家族に残す・共有する方法の比較',
    date: '2026-06-07',
  },
  {
    href: '/guide/digital-seiri/sumaho-shashin-seiri',
    category: 'デジタル整理術',
    title: 'スマホの写真整理のやり方｜減らす・分類・バックアップの全手順【iPhone/Android】',
    date: '2026-06-07',
  },
  {
    href: '/guide/shisan-kanri/toshi-kazoku',
    category: '資産・お金の管理',
    title: '投資、家族に知らせる？知らせない？｜内緒のままで大丈夫か、もしものときどうなるか',
    date: '2026-06-07',
  },
  {
    href: '/guide/shisan-kanri/hoken-ichiran-excel',
    category: '資産・お金の管理',
    title: '保険契約の一覧表をエクセルで作る方法｜無料テンプレート付き・書く項目はこれだけ',
    date: '2026-06-06',
  },
  {
    href: '/guide/kazoku-kyoyu/password-account-kyoyu',
    category: '家族間の情報共有',
    title: '家族とのパスワード・アカウント共有｜どこまで共有する？安全なやり方と線引き',
    date: '2026-06-06',
  },
  {
    href: '/guide/password-kanri/sumaho-password',
    category: 'パスワード・認証管理',
    title: 'パスワードをメモ帳で管理するのは危険？スマホでも忘れず安全に管理する方法【iPhone/Android】',
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
      {
        href: '/guide/digital-seiri/sumaho-shashin-seiri',
        title: 'スマホの写真整理のやり方｜減らす・分類・バックアップの全手順',
      },
      {
        href: '/guide/digital-seiri/mail-seiri',
        title: 'メールの整理術｜あふれた受信トレイをスッキリさせる手順',
      },
      {
        href: '/guide/digital-seiri/sabusuku-kanri',
        title: 'サブスク管理アプリの選び方と使い方｜見える化からもしもの備えまで',
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
      {
        href: '/guide/password-kanri/nidankai-ninsho',
        title: 'スマホの二段階認証とは？設定のやり方と“もしも”の落とし穴',
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
        href: '/guide/kazoku-kyoyu/fuufu-joho-kyoyu',
        title: '夫婦の情報共有のやり方｜日常のすれ違い解消からもしもの備えまで',
      },
      {
        href: '/guide/kazoku-kyoyu/password-account-kyoyu',
        title: '家族とのパスワード・アカウント共有｜安全なやり方と線引き',
      },
      {
        href: '/guide/kazoku-kyoyu/joho-kyoyu-hikaku',
        title: 'パスワード・情報管理の方法の比較｜エクセル管理は危険？',
      },
    ],
  },
  {
    href: '/guide/shisan-kanri',
    name: '資産・お金の管理',
    description: '保険・口座・契約・投資など、家庭のお金まわりを「把握できている状態」にする整理術。',
    articles: [
      {
        href: '/guide/shisan-kanri/hoken-ichiran-excel',
        title: '保険契約の一覧表をエクセルで作る方法｜無料テンプレート付き',
      },
      {
        href: '/guide/shisan-kanri/toshi-kazoku',
        title: '投資、家族に知らせる？知らせない？｜もしものときどうなるか',
      },
    ],
  },
  {
    href: '/guide/oya-care',
    name: '親・家族のケア',
    description:
      '親のネット銀行・スマホ・契約まわりを、プライバシーに踏み込まずに「在りか」の共有で備える。',
    articles: [
      {
        href: '/guide/oya-care/oya-netbank',
        title: '親がネット銀行を使っているなら｜「在りか」の備え方',
      },
    ],
  },
  {
    href: '/guide/moshimo-sonae',
    name: 'もしもの備え',
    description: '急な入院やもしものときに、家族が困らないための前向きな備え。',
    articles: [
      {
        href: '/guide/moshimo-sonae/kyu-nyuin-sonae',
        title: '急な入院に備えて、家族に伝えておく情報リスト',
      },
    ],
  },
  {
    href: '/guide/column',
    name: 'コラム',
    description: '暮らしを支えるデジタルの仕組みに隠れた、知られていない性質を解き明かす読み物。',
    articles: [
      {
        href: '/guide/column/pet-omoide-5shukan',
        title: 'ペットの思い出を一生ものにする5つの習慣',
      },
      {
        href: '/guide/column/sumaho-shuyaku-5sen',
        title: 'この5年で、スマホ1台に集約された機能5選',
      },
      {
        href: '/guide/column/kodomo-omoide-5shukan',
        title: '子どもの思い出を一生ものにする5つの習慣',
      },
      {
        href: '/guide/column/saifu-hikidashi-5sen',
        title: 'この5年で、財布と引き出しから消えたもの5選',
      },
      {
        href: '/guide/column/okane-kanri-kichinto',
        title: 'お金の管理がきちんとしている人ほど、家族を困らせてしまう3つの理由',
      },
      {
        href: '/guide/column/subsuku-kaiyaku-riyu',
        title: 'サブスクは全部、死ぬまでに解約しておかなければならない3つの理由',
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

        {/* ピラー：デジタル資産の基本 */}
        <section className="mt-10 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-6 sm:p-7">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
            まずはここから
          </p>
          <h2 className="mt-2 text-lg font-semibold leading-snug text-slate-900 sm:text-xl">
            <Link href="/guide/digital-shisan" className="text-blue-600 hover:underline">
              デジタル資産の整理と引き継ぎ｜種類の一覧と、家族が困らない備え方
            </Link>
          </h2>
          <p className="mt-2 text-[15px] leading-7 text-slate-600">
            「デジタル資産」とは何か、種類の一覧、整理のやり方、もしものときの引き継ぎまでをまとめた基本ガイドです。各テーマの記事への入口にもなっています。
          </p>
        </section>

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

        {/* 調査データ */}
        <section className="mt-16">
          <h2 className="border-b border-slate-200 pb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
            調査データ
          </h2>
          <p className="mt-5 text-[15px] leading-8 text-slate-700">
            記事で引用している自社調査の一次データは
            <Link href="/guide/research" className="text-blue-600 hover:underline">
              デジタル遺品に関する意識調査（2026年4月・BlueAdventures調べ）
            </Link>
            にまとめています。困った経験60.9%、最多の困りごとは「スマホ・パソコンのパスワードが分からない」。出典明記のうえ自由に引用いただけます。
          </p>
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
