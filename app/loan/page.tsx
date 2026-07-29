import type { Metadata } from 'next';
import Link from 'next/link';
import GuideHeader from '@/components/GuideHeader';
import SiteFooter from '@/components/SiteFooter';
import LoanCalculator from '@/components/loan/LoanCalculator';
import { Breadcrumb, SITE_URL, ORG_NAME, formatJaDate, toIsoJst, ogImageUrl } from '@/components/loan/LoanArticle';
import { LOAN_ARTICLES } from '@/lib/loan/articles';

/**
 * /loan — 住宅ローン領域の唯一の入口（2026-07-29 再設計）
 *
 * 経緯：中カテゴリ /loan/karikae をページとして廃止し、記事をフラットに並べる形にした。
 * 記事と中カテゴリが同じカードで並んでいると、クリック先が「記事なのか、また選択を
 * 迫られるのか」が分からないため。カテゴリ分けが有効になるのは1カテゴリ10本以上
 * たまってからで、現状の本数ではフラットな一覧のほうが速く目的に辿り着ける。
 *
 * 記事のURL（/loan/karikae/...）は変更していない。インデックス済みの評価を
 * 失わないため。将来カテゴリを復活させるときはそのまま使える。
 *
 * 一覧の中身は lib/loan/articles.ts（レジストリ）が唯一の正。ここでは並べるだけ。
 */

const PAGE_PATH = '/loan';
const PAGE_TITLE = '住宅ローンの判断に迷ったら｜変動と固定・借り換えを数字で比べる';
const PAGE_DESCRIPTION =
  '住宅ローンで迷いやすい判断を、あなたの数字で比べられる形にまとめています。変動と固定どちらがいいか、借り換えの費用と損益分岐、借り換えのタイミングとデメリットなど。特定の金融機関・商品は推奨しません。';

/* OGP画像は記事と同じ /og の動的生成カードを使う（2026-07-29 追加） */
const OG_IMAGE = ogImageUrl(PAGE_TITLE);

export const metadata: Metadata = {
  title: `${PAGE_TITLE} | つぎの手ナビ`,
  description: PAGE_DESCRIPTION,
  alternates: { canonical: `${SITE_URL}${PAGE_PATH}` },
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: `${SITE_URL}${PAGE_PATH}`,
    siteName: 'つぎの手ナビ',
    type: 'website',
    locale: 'ja_JP',
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: PAGE_TITLE }],
  },
  twitter: {
    card: 'summary_large_image',
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    images: [OG_IMAGE],
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'CollectionPage',
      name: PAGE_TITLE,
      description: PAGE_DESCRIPTION,
      url: `${SITE_URL}${PAGE_PATH}`,
      inLanguage: 'ja',
      publisher: { '@type': 'Organization', name: ORG_NAME, url: SITE_URL },
      // 記事一覧そのものも構造化データに出す（レジストリ由来なので表示とズレない）
      mainEntity: {
        '@type': 'ItemList',
        itemListElement: LOAN_ARTICLES.map((a, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: a.title,
          url: `${SITE_URL}${a.path}`,
        })),
      },
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'ホーム', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: '住宅ローン', item: `${SITE_URL}${PAGE_PATH}` },
      ],
    },
  ],
};

export default function LoanHubPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <GuideHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6">
        <Breadcrumb crumbs={[{ name: '住宅ローン', path: PAGE_PATH }]} />

        <h1 className="text-[26px] font-bold leading-tight text-slate-900 sm:text-[30px]">
          住宅ローンの判断に迷ったら
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-slate-700">
          住宅ローンの判断は、金利のニュースを追うだけでは決まりません。残高・残りの返済年数・いまの適用金利によって、答えが変わるからです。
          ここでは迷いやすい判断ごとに、あなたの数字で比べられる形で解説しています。記事は判断の流れに沿って並べています。特定の金融機関や金融商品を推奨するものではありません。
        </p>

        {/* 記事一覧（レジストリの order 順。中カテゴリは挟まない） */}
        <h2 className="mt-8 text-[20px] font-bold text-slate-900">住宅ローンの記事</h2>
        <div className="mt-4 space-y-4">
          {LOAN_ARTICLES.map((a) => (
            <article key={a.path} className="rounded-xl border border-slate-200 p-4">
              <h3 className="text-[17px] font-bold leading-snug text-slate-900">
                <Link href={a.path} className="text-blue-700 hover:underline">{a.title}</Link>
              </h3>
              <p className="mt-1.5 text-[14px] leading-relaxed text-slate-700">{a.summary}</p>
              <p className="mt-2 text-[12px] text-slate-500">
                最終更新：<time dateTime={toIsoJst(a.dateModified)}>{formatJaDate(a.dateModified)}</time>
              </p>
            </article>
          ))}
        </div>

        {/* 計算ツール（記事と同じコンポーネント。/shisan への導線は置かない） */}
        <h2 className="mt-10 text-[20px] font-bold text-slate-900">自分の数字で計算する</h2>
        <p className="mt-2 text-[15px] leading-relaxed text-slate-700">
          記事の表は代表的なケースです。実際の判断は、あなたの残高・残り年数・現在の金利で計算する必要があります。
        </p>
        <LoanCalculator articlePath={PAGE_PATH} />

        <p className="mt-10 text-[13px] leading-relaxed text-slate-500">
          本サイトは一般的な情報と、入力された数字にもとづく試算を提供するものです。特定の金融商品・金融機関の推奨や、投資助言・金融商品の販売勧誘を行うものではありません。
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
