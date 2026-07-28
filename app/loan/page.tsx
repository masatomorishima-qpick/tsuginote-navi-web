import type { Metadata } from 'next';
import Link from 'next/link';
import GuideHeader from '@/components/GuideHeader';
import SiteFooter from '@/components/SiteFooter';
import { Breadcrumb, SITE_URL, ORG_NAME } from '@/components/loan/LoanArticle';

const PAGE_PATH = '/loan';
const PAGE_TITLE = '住宅ローンの判断に迷ったら｜変動と固定・借り換えを数字で比べる';
const PAGE_DESCRIPTION =
  '住宅ローンで迷いやすい判断を、あなたの数字で比べられる形にまとめています。変動と固定どちらがいいか、借り換えの費用と損益分岐、繰上げ返済と投資の比較など。特定の金融機関・商品は推奨しません。';

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
  },
  twitter: { card: 'summary', title: PAGE_TITLE, description: PAGE_DESCRIPTION },
};

/* 記事が増えたらこの配列に足すだけでハブに並ぶ（公開済みのものだけ published: true にする）。 */
const ARTICLES: { path: string; title: string; summary: string; published: boolean }[] = [
  {
    path: '/loan/hendo-kotei',
    title: '住宅ローンは変動と固定どちらがいいか',
    summary:
      'すでに変動で借りている人向けに、いま固定へ切り替えると月々いくら増えるのか、変動が何%まで上がったら切り替えた方が総支払額が少なくなるのかを、残高・残り年数ごとの表で示しています。',
    published: true,
  },
  {
    path: '/loan/karikae',
    title: '住宅ローンの借り換え',
    summary:
      '借り換えでかかる費用の内訳（事務手数料・登録免許税・司法書士報酬など）と、費用を払っても元が取れる条件を、残高・残り年数・金利差ごとの表で解説しています。',
    published: true,
  },
];

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
          ここでは、迷いやすい判断ごとに、あなたの数字で比べられる形で解説しています。特定の金融機関や金融商品を推奨するものではありません。
        </p>

        <h2 className="mt-8 text-[20px] font-bold text-slate-900">住宅ローンで迷う判断</h2>
        <div className="mt-4 space-y-4">
          {ARTICLES.filter((a) => a.published).map((a) => (
            <article key={a.path} className="rounded-xl border border-slate-200 p-4">
              <h3 className="text-[17px] font-bold text-slate-900">
                <Link href={a.path} className="text-blue-700 hover:underline">{a.title}</Link>
              </h3>
              <p className="mt-1.5 text-[14px] leading-relaxed text-slate-700">{a.summary}</p>
            </article>
          ))}
        </div>

        <h2 className="mt-8 text-[20px] font-bold text-slate-900">自分の数字で計算する</h2>
        <p className="mt-2 text-[15px] leading-relaxed text-slate-700">
          住宅ローンの残高・残り年数・金利を入力すると、借り換えで軽くできる月々の金額と、手数料を差し引いた正味のメリットの目安が分かります。
        </p>
        <p className="mt-3">
          <Link href="/shisan" className="text-blue-700 underline hover:no-underline">
            資産づくり診断で計算する
          </Link>
        </p>

        <p className="mt-10 text-[13px] leading-relaxed text-slate-500">
          本サイトは一般的な情報と、入力された数字にもとづく試算を提供するものです。特定の金融商品・金融機関の推奨や、投資助言・金融商品の販売勧誘を行うものではありません。
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
