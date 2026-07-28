import Link from 'next/link';

/**
 * 住宅ローン記事（/loan/*）の共通テンプレート。
 *
 * 2本目以降は、この部品に「原稿の中身」を渡すだけで記事が1本増える形にしている。
 * - パンくず（表示＋BreadcrumbList JSON-LD の元データを共通化）
 * - 目次（H2 の一覧から自動生成。id は呼び出し側の section と対応）
 * - FAQ（表示と FAQPage JSON-LD を同じ配列から生成＝内容のズレが起きない）
 * - 前提と出典 / 免責 / 運営者情報への導線
 *
 * 技術要件（重要）：本文・表・数値はすべてサーバー側でHTMLとして出力する。
 * クライアントJSでレンダリングしない（JSを実行しないクローラーでも全文が読める）。
 */

export interface Crumb {
  name: string;
  path: string; // サイトルートからのパス（例：/loan/）
}
export interface TocItem {
  id: string;
  label: string;
}
export interface Faq {
  q: string;
  a: string;
}

export const SITE_URL = 'https://www.tsuginotenavi.jp';
/** 記事の author / publisher（決定事項1：個人名は出さない） */
export const ORG_NAME = 'Blue Adventures';

/** JSON-LD（Article / FAQPage / BreadcrumbList）を手書きで組み立てる。
 *  reviewedBy は決定事項2により今回は出力しない（引数で渡せば将来追加できる）。 */
export function buildArticleJsonLd(opts: {
  path: string;
  title: string;
  description: string;
  datePublished: string;
  dateModified: string;
  crumbs: Crumb[];
  faqs: Faq[];
  reviewedBy?: { name: string; url?: string };
}) {
  const url = `${SITE_URL}${opts.path}`;
  const article: Record<string, unknown> = {
    '@type': 'Article',
    headline: opts.title,
    description: opts.description,
    mainEntityOfPage: url,
    datePublished: opts.datePublished,
    dateModified: opts.dateModified,
    inLanguage: 'ja',
    author: { '@type': 'Organization', name: ORG_NAME, url: SITE_URL },
    publisher: { '@type': 'Organization', name: ORG_NAME, url: SITE_URL },
  };
  if (opts.reviewedBy) {
    article.reviewedBy = { '@type': 'Person', name: opts.reviewedBy.name, url: opts.reviewedBy.url };
  }
  return {
    '@context': 'https://schema.org',
    '@graph': [
      article,
      {
        '@type': 'FAQPage',
        mainEntity: opts.faqs.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'ホーム', item: SITE_URL },
          ...opts.crumbs.map((c, i) => ({
            '@type': 'ListItem',
            position: i + 2,
            name: c.name,
            item: `${SITE_URL}${c.path}`,
          })),
        ],
      },
    ],
  };
}

/** パンくず表示 */
export function Breadcrumb({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <nav aria-label="パンくずリスト" className="mb-4 text-[12px] text-slate-500">
      <ol className="flex flex-wrap items-center gap-1">
        <li>
          <Link href="/" className="hover:underline">ホーム</Link>
        </li>
        {crumbs.map((c, i) => (
          <li key={c.path} className="flex items-center gap-1">
            <span aria-hidden="true">›</span>
            {i === crumbs.length - 1 ? (
              <span className="text-slate-700">{c.name}</span>
            ) : (
              <Link href={c.path} className="hover:underline">{c.name}</Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/** 目次（H2 と対応） */
export function Toc({ items }: { items: TocItem[] }) {
  return (
    <nav aria-label="目次" className="my-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
      <h2 className="mb-2 text-[15px] font-bold text-slate-900">目次</h2>
      <ol className="list-decimal space-y-1 pl-5 text-[14px] text-slate-700">
        {items.map((t) => (
          <li key={t.id}>
            <a href={`#${t.id}`} className="text-blue-700 hover:underline">{t.label}</a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

/** FAQ（表示。JSON-LD と同じ配列から作るのでズレない） */
export function FaqSection({ id, heading, faqs }: { id: string; heading: string; faqs: Faq[] }) {
  return (
    <section id={id} className="mt-10 scroll-mt-20">
      <h2 className="mb-3 text-[20px] font-bold text-slate-900">{heading}</h2>
      <div className="space-y-4">
        {faqs.map((f) => (
          <div key={f.q}>
            <h3 className="text-[16px] font-bold text-slate-900">{f.q}</h3>
            <p className="mt-1 text-[15px] leading-relaxed text-slate-700">{f.a}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/** 前提と出典＋免責＋運営者情報への導線 */
export function SourcesAndDisclaimer({
  id,
  assumptions,
  sources,
  disclaimer,
}: {
  id: string;
  assumptions: string[];
  sources: string[];
  disclaimer: string;
}) {
  return (
    <section id={id} className="mt-10 scroll-mt-20">
      <h2 className="mb-3 text-[20px] font-bold text-slate-900">この記事の前提と出典</h2>
      <h3 className="mt-4 text-[16px] font-bold text-slate-900">試算の前提</h3>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-[15px] leading-relaxed text-slate-700">
        {assumptions.map((a) => <li key={a}>{a}</li>)}
      </ul>
      <h3 className="mt-4 text-[16px] font-bold text-slate-900">出典</h3>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-[15px] leading-relaxed text-slate-700">
        {sources.map((s) => <li key={s}>{s}</li>)}
      </ul>
      <h3 className="mt-4 text-[16px] font-bold text-slate-900">免責</h3>
      <p className="mt-2 text-[14px] leading-relaxed text-slate-600">{disclaimer}</p>
      <p className="mt-4 text-[13px] text-slate-500">
        運営：{ORG_NAME}（
        <Link href="/company" className="text-blue-700 hover:underline">運営会社・お問い合わせ</Link>
        ／
        <Link href="/privacy" className="text-blue-700 hover:underline">プライバシーポリシー</Link>
        ）
      </p>
    </section>
  );
}

/** 表を375pxでも崩さないためのラッパー（横スクロール可） */
export function TableScroll({ children }: { children: React.ReactNode }) {
  return <div className="my-4 -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">{children}</div>;
}

/** 記事内の表の共通クラス（見た目を全記事で統一） */
export const tableCls = 'w-full min-w-[520px] border-collapse text-[13px] sm:text-[14px]';
export const thCls = 'border border-slate-200 bg-slate-50 px-2 py-2 text-left font-bold text-slate-700 whitespace-nowrap';
export const tdCls = 'border border-slate-200 px-2 py-2 text-slate-700 whitespace-nowrap';
