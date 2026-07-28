import type { Metadata } from 'next';
import Link from 'next/link';
import GuideHeader from '@/components/GuideHeader';
import SiteFooter from '@/components/SiteFooter';
import { Breadcrumb, SITE_URL, ORG_NAME } from '@/components/loan/LoanArticle';

const PAGE_PATH = '/loan/karikae';
const PAGE_TITLE = '住宅ローンの借り換え｜費用の内訳と、元が取れる条件';
const PAGE_DESCRIPTION =
  '住宅ローンの借り換えでかかる費用の内訳、元が取れる条件、よく言われる「金利差1%・残高1,000万円・残期間10年」の目安が実際どうなのかを、残高と残り年数ごとの表で解説しています。特定の金融機関・商品は推奨しません。';

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

/* 記事が増えたらこの配列に足すだけで並ぶ。 */
const ARTICLES: { path: string; title: string; summary: string; published: boolean }[] = [
  {
    path: '/loan/karikae/hiyou',
    title: '住宅ローンの借り換え費用はいくら？手数料の内訳と、元が取れる条件',
    summary:
      '費用は借入額の2.8〜3.4%程度、残高3,000万円なら約87万円。事務手数料と登録免許税が借入額に比例して増えます。費用を引いた後にいくら残るのかを、残高・残り年数・金利差ごとの表で示しています。',
    published: true,
  },
  {
    path: '/loan/karikae/timing',
    title: '住宅ローンの借り換えはいつがベストなタイミングか',
    summary:
      '金利の底は誰にも予測できません。判断できるのは自分の条件です。残りの返済期間が10年を切ると費用倒れになりやすいこと、1年待つとメリットが7万〜18万円減ることを、残高・残り年数ごとの表で示しています。',
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
        { '@type': 'ListItem', position: 2, name: '住宅ローン', item: `${SITE_URL}/loan` },
        { '@type': 'ListItem', position: 3, name: '借り換え', item: `${SITE_URL}${PAGE_PATH}` },
      ],
    },
  ],
};

export default function KarikaeHubPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <GuideHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6">
        <Breadcrumb
          crumbs={[
            { name: '住宅ローン', path: '/loan' },
            { name: '借り換え', path: PAGE_PATH },
          ]}
        />

        <h1 className="text-[26px] font-bold leading-tight text-slate-900 sm:text-[30px]">
          住宅ローンの借り換え
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-slate-700">
          借り換えは「金利が下がるかどうか」だけでは決まりません。事務手数料や登記費用がかかるため、
          費用を引いたあとに手元へいくら残るのかで判断が変わります。ここでは費用の内訳と、元が取れる条件を数字で示しています。
        </p>

        <h2 className="mt-8 text-[20px] font-bold text-slate-900">借り換えで迷う判断</h2>
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

        <p className="mt-8 text-[14px]">
          <Link href="/loan" className="text-blue-700 underline hover:no-underline">← 住宅ローンの記事一覧へ</Link>
        </p>

        <p className="mt-10 text-[13px] leading-relaxed text-slate-500">
          本サイトは一般的な情報と、入力された数字にもとづく試算を提供するものです。特定の金融商品・金融機関の推奨や、投資助言・金融商品の販売勧誘を行うものではありません。
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
