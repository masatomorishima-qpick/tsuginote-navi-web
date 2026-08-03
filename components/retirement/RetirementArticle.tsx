import type { Metadata } from 'next';
import type { RetirementArticle } from '@/lib/retirement/articles';
import {
  // 汎用部品は LoanArticle.tsx から再輸出する（実装は1箇所のまま・/loan は無変更）。
  // 2026-08-03（駅1指示書1-1・masato確定）：共通基盤への抽象化は3セクション目まで行わない。
  // /loan 固有なのはパンくずのハブ定数と、それを埋め込む JsonLd / Header だけなので、
  // その3点のみ retirement 版をここに実装する。
  Breadcrumb, ArticleUpdatedAt, ArticleVisual, mainVisualUrl, toIsoJst, ogImageUrl,
  SITE_URL, ORG_NAME, SITE_NAME,
  type Crumb, type Faq,
} from '@/components/loan/LoanArticle';

/* 汎用部品の再輸出（記事ページはこのファイルだけ import すれば済む形にする） */
export {
  Toc, FaqSection, SourcesAndDisclaimer, TableScroll, tableCls, thCls, tdCls,
  toIsoJst, formatJaDate, ogImageUrl, SITE_URL, ORG_NAME, SITE_NAME, Breadcrumb,
} from '@/components/loan/LoanArticle';
export type { TocItem, Faq, Crumb } from '@/components/loan/LoanArticle';
export type { RetirementArticle };

/** パンくず「ホーム › 退職金・年金 › 記事」の中段。/retirement には最小ハブを置く
 *  （パンくずと BreadcrumbList が404を指さないため・2026-08-03 masato確定）。 */
export const RETIREMENT_HUB: Crumb = { name: '退職金・年金', path: '/retirement' };

/** 記事のパンくず（表示・JSON-LD 共通の元データ） */
export function retirementCrumbs(article: RetirementArticle): Crumb[] {
  return [RETIREMENT_HUB, { name: article.breadcrumb, path: article.path }];
}

/** JSON-LD（Article / BreadcrumbList、FAQがあれば FAQPage）。
 *  /loan の buildArticleJsonLd と同じ構造。違いは2点：ハブが RETIREMENT_HUB であること、
 *  faqs が空のとき FAQPage ノードを出さないこと（記事9はFAQ節を持たないため。
 *  空の FAQPage を出すとリッチリザルトの警告になる）。 */
export function buildRetirementArticleJsonLd(opts: { article: RetirementArticle; faqs?: Faq[] }) {
  const a = opts.article;
  const url = `${SITE_URL}${a.path}`;
  const crumbs = retirementCrumbs(a);
  const graph: Record<string, unknown>[] = [
    {
      '@type': 'Article',
      headline: a.title,
      description: a.description,
      mainEntityOfPage: url,
      datePublished: toIsoJst(a.datePublished),
      dateModified: toIsoJst(a.dateModified),
      image: [mainVisualUrl(a.visual)],
      inLanguage: 'ja',
      author: { '@type': 'Organization', name: ORG_NAME, url: SITE_URL },
      publisher: { '@type': 'Organization', name: ORG_NAME, url: SITE_URL },
    },
  ];
  if (opts.faqs && opts.faqs.length > 0) {
    graph.push({
      '@type': 'FAQPage',
      mainEntity: opts.faqs.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    });
  }
  graph.push({
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'ホーム', item: SITE_URL },
      ...crumbs.map((c, i) => ({
        '@type': 'ListItem',
        position: i + 2,
        name: c.name,
        item: `${SITE_URL}${c.path}`,
      })),
    ],
  });
  return { '@context': 'https://schema.org', '@graph': graph };
}

/** 記事の metadata。/loan の buildArticleMetadata と同一の組み立て（構造も値の作り方も同じ）。 */
export function buildRetirementArticleMetadata(article: RetirementArticle): Metadata {
  const url = `${SITE_URL}${article.path}`;
  const image = ogImageUrl(article.title);
  return {
    title: `${article.title} | ${SITE_NAME}`,
    description: article.description,
    alternates: { canonical: url },
    openGraph: {
      title: article.title,
      description: article.description,
      url,
      siteName: SITE_NAME,
      type: 'article',
      locale: 'ja_JP',
      publishedTime: toIsoJst(article.datePublished),
      modifiedTime: toIsoJst(article.dateModified),
      images: [{ url: image, width: 1200, height: 630, alt: article.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.description,
      images: [image],
    },
  };
}

/** 記事の冒頭（パンくず → H1 → 最終更新日 → メインビジュアル）。並び順は /loan と同じ
 *  （金融領域では更新日が信頼性のシグナル・H1→日付→画像の順は masato の決定）。 */
export function RetirementArticleHeader({ article }: { article: RetirementArticle }) {
  return (
    <>
      <Breadcrumb crumbs={retirementCrumbs(article)} />
      <h1 className="text-[24px] font-bold leading-tight text-slate-900 sm:text-[30px]">
        {article.heading}
      </h1>
      <ArticleUpdatedAt dateModified={article.dateModified} />
      <ArticleVisual visual={article.visual} />
    </>
  );
}
