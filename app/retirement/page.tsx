import type { Metadata } from 'next';
import Link from 'next/link';
import GuideHeader from '@/components/GuideHeader';
import SiteFooter from '@/components/SiteFooter';
import { Breadcrumb, SITE_URL, ORG_NAME, formatJaDate, toIsoJst, ogImageUrl } from '@/components/loan/LoanArticle';
import { RETIREMENT_ARTICLES } from '@/lib/retirement/articles';

/**
 * /retirement — 退職金・年金領域の入口（2026-08-03 新設・駅1指示書2）
 *
 * 経緯：/loan に続く2つ目の記事セクション。記事1本の段階だが、パンくずと
 * BreadcrumbList が /retirement を指すため、404 を出さないよう最小のハブを置く
 * （駅1指示書1-2・masato確定）。今後、年金の受給開始・取り崩しの順番など複数の
 * 記事が入る想定なので、/loan と同じ「レジストリ（lib/retirement/articles.ts）が
 * 唯一の正、ここは並べるだけ」の形にしている。
 *
 * /loan ハブとの違いは1点：ここには計算ツールを置かない。退職金の手取り比較ツールは
 * 記事本体（/retirement/taishokukin-uketorikata）に埋め込むため（駅1指示書2-3）。
 */

const PAGE_PATH = '/retirement';
const PAGE_TITLE = '退職金・年金の受け取り方｜手取りで比べて判断する';
const PAGE_DESCRIPTION =
  '退職金や年金の受け取り方を、税金と社会保険料を引いた後の手取りで比べられる形にまとめています。一時金と年金どちらで受け取るか、控除の使い方など。特定の金融機関・商品は推奨しません。';

/* OGP画像は記事と同じ /og の動的生成カードを使う（/loan ハブと同じ） */
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
        itemListElement: RETIREMENT_ARTICLES.map((a, i) => ({
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
        { '@type': 'ListItem', position: 2, name: '退職金・年金', item: `${SITE_URL}${PAGE_PATH}` },
      ],
    },
  ],
};

export default function RetirementHubPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <GuideHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6">
        <Breadcrumb crumbs={[{ name: '退職金・年金', path: PAGE_PATH }]} />

        <h1 className="text-[26px] font-bold leading-tight text-slate-900 sm:text-[30px]">
          退職金・年金の受け取り方
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-slate-700">
          退職金や年金は、受け取り方によって税金と社会保険料が変わり、手元に残る金額そのものが動きます。会社の案内に書かれているのは税引き前の額面であることが多く、手取りで比べると結論が入れ替わることがあります。
          ここでは受け取り方の判断ごとに、あなたの数字で比べられる形で解説しています。特定の金融機関や金融商品を推奨するものではありません。
        </p>

        {/* 記事一覧（レジストリの order 順） */}
        <h2 className="mt-8 text-[20px] font-bold text-slate-900">退職金・年金の記事</h2>
        <div className="mt-4 space-y-4">
          {RETIREMENT_ARTICLES.map((a) => (
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

        <p className="mt-10 text-[13px] leading-relaxed text-slate-500">
          本サイトは一般的な情報と、入力された数字にもとづく試算を提供するものです。特定の金融商品・金融機関の推奨や、投資助言・金融商品の販売勧誘を行うものではありません。
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
