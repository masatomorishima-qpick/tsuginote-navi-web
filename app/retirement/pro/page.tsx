/**
 * app/retirement/pro/page.tsx — 老後のお金の受け取りシミュレーション（無料の入口）
 *
 * §1  titleタグ・OGPは指示書の指定どおり。
 * §3-2 Q11・Q12：**`/retirement/pro` は検索に出す**（`/retirement/pro/result` は出さない）。
 * §4-4-2：「現在の年」に**既定値を作らない。**ここで `Asia/Tokyo` の年を求めて渡す。
 *   サーバーがUTCだと、日本時間の元日0時〜9時に前の年を返し、候補が1年ずれる。
 */

import type { Metadata } from 'next';
import GuideHeader from '@/components/GuideHeader';
import SiteFooter from '@/components/SiteFooter';
import { Breadcrumb, SITE_URL, ORG_NAME, ogImageUrl } from '@/components/loan/LoanArticle';
import ProApp from '@/components/retirement/pro/ProApp';
import { tokyoYear } from '@/lib/retirement/pro/now';

const PAGE_PATH = '/retirement/pro';
const PAGE_TITLE = '老後のお金の受け取りシミュレーション【2026年改正対応】';
const PAGE_DESCRIPTION =
  '退職金とiDeCo等の受け取り方で、あなたの手取りがいくら変わるかを計算します。退職所得控除の2026年（令和8年）改正に対応。特定の金融機関・金融商品の推奨は行いません。';

/*
  【2026-09-22・戦術Cowork `kaihatsu_ate_20260922c.md` 0節（(ア)のお答え）】
    この頁だけ OGP画像が指定されておらず、SNS・LINE に貼っても絵が出ませんでした。
    `/loan`・`/retirement`・`/company` と同じく、`/og` の自動生成のカード（1200×630）を指します。
    専用の絵を作らない理由（戦術Cowork）……「題名を変えた日に、絵だけ古びる形を作りません」。
    組み立て方は `app/loan/page.tsx` 29行・42行と同じです（字も数も、そこから写しました）。
*/
const OG_IMAGE = ogImageUrl(PAGE_TITLE);

export const metadata: Metadata = {
  title: `${PAGE_TITLE}｜つぎの手ナビ`,
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
      '@type': 'WebApplication',
      name: PAGE_TITLE,
      description: PAGE_DESCRIPTION,
      url: `${SITE_URL}${PAGE_PATH}`,
      applicationCategory: 'FinanceApplication',
      inLanguage: 'ja',
      operatingSystem: 'Web',
      publisher: { '@type': 'Organization', name: ORG_NAME, url: SITE_URL },
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'ホーム', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: '退職金・年金', item: `${SITE_URL}/retirement` },
        { '@type': 'ListItem', position: 3, name: '受け取りシミュレーション', item: `${SITE_URL}${PAGE_PATH}` },
      ],
    },
  ],
};

/** 年が変わったのに古い年で計算しないよう、毎回サーバーで求める */
export const dynamic = 'force-dynamic';

export default function ProPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <GuideHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6">
        <Breadcrumb
          crumbs={[
            { name: '退職金・年金', path: '/retirement' },
            { name: '受け取りシミュレーション', path: PAGE_PATH },
          ]}
        />
        <ProApp genzaiNen={tokyoYear(new Date())} />
      </main>
      <SiteFooter />
    </div>
  );
}
