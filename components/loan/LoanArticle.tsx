import type { Metadata } from 'next';
import Image from 'next/image';
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
export const SITE_NAME = 'つぎの手ナビ';

/* ===== 日付（2026-07-28 追加） =====
 * リッチリザルトテストで datePublished / dateModified に
 * 「日時値が無効／タイムゾーンがありません」の警告が出ていたための対応。
 *
 * 記事側に書かせるのは 'YYYY-MM-DD' の1形式だけにして、
 * ・構造化データ用の ISO 8601（タイムゾーン付き）
 * ・画面表示用の「2026年7月28日」
 * の両方をここで組み立てる。記事ごとに書式がぶれる余地をなくすのが目的。
 */
const JST_TIME = 'T09:00:00+09:00';

/** 'YYYY-MM-DD' → '2026-07-28T09:00:00+09:00'（すでに時刻付きならそのまま返す） */
export function toIsoJst(date: string): string {
  return date.includes('T') ? date : `${date}${JST_TIME}`;
}

/** 'YYYY-MM-DD' → '2026年7月28日'（画面表示用。ゼロ埋めしない） */
export function formatJaDate(date: string): string {
  const [y, m, d] = date.split('-').map(Number);
  return `${y}年${m}月${d}日`;
}

/* ===== OGP画像（2026-07-28 追加） =====
 * 画像ファイルは置かず、next/og の ImageResponse で動的生成する（app/og/route.tsx）。
 * 記事が増えても画像まわりの作業が発生しないようにするため。
 *
 * 注意：置き場所を /api/og にしてはいけない。app/robots.ts が /api/ を
 * 全クローラーに Disallow しているため、Google が画像を取得できず
 * 「項目 image がありません」の警告が戻る。
 */
const OG_PATH = '/og';

/** 記事タイトルから OGP画像のURLを組み立てる（記事側では指定不要） */
export function ogImageUrl(title: string): string {
  return `${SITE_URL}${OG_PATH}?title=${encodeURIComponent(title)}`;
}

/* ===== メインビジュアル（2026-07-29 追加） =====
 * 記事ごとの図版。H1・最終更新日の下、本文の前に置く。
 *
 * 並び順の理由（masato の決定）：金融の記事では更新日が信頼性のシグナルなので、
 * 「これは何か」「いまの情報か」を先に見せ、そのあとに図版を置く。
 * 本記事は冒頭に結論を置く構成のため、大きな画像を日付より上に入れると結論が遠くなる。
 *
 * 用途の使い分け：
 *   ・Article 構造化データの image → この図版（Googleが記事を代表する画像として扱う）
 *   ・og:image                    → /og の動的生成カード（SNSではタイトルが読める方が有効）
 */
export interface MainVisual {
  /** サイトルートからのパス（例：/loan/karikae-demerit.webp） */
  src: string;
  /** 記事の内容を表す日本語。「アイキャッチ」等の無内容な語は使わない */
  alt: string;
}

/** 図版の実寸（4枚とも同じ。next/image のレイアウト確保に使う） */
const VISUAL_W = 1600;
const VISUAL_H = 900;

/** メインビジュアルの絶対URL（構造化データ用） */
export function mainVisualUrl(v: MainVisual): string {
  return `${SITE_URL}${v.src}`;
}

/** H1・最終更新日の下に置く図版。未設定なら何も描画しない（レイアウトは崩れない）。 */
export function ArticleVisual({ visual }: { visual?: MainVisual }) {
  if (!visual) return null;
  return (
    <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
      <Image
        src={visual.src}
        alt={visual.alt}
        width={VISUAL_W}
        height={VISUAL_H}
        priority
        sizes="(max-width: 768px) 100vw, 768px"
        className="h-auto w-full"
      />
    </div>
  );
}

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
  /** 記事のメインビジュアル。Article の image に使う（未指定ならOGPカードで代替）。 */
  visual?: MainVisual;
  reviewedBy?: { name: string; url?: string };
}) {
  const url = `${SITE_URL}${opts.path}`;
  const article: Record<string, unknown> = {
    '@type': 'Article',
    headline: opts.title,
    description: opts.description,
    mainEntityOfPage: url,
    // 日付はタイムゾーン付きの ISO 8601 で出す（記事側は 'YYYY-MM-DD' のみ書く）
    datePublished: toIsoJst(opts.datePublished),
    dateModified: toIsoJst(opts.dateModified),
    // image は記事のメインビジュアル（Googleが記事を代表する画像として扱う）。
    // og:image（SNS用の動的生成カード）とは用途が違うので、あえて別のものを指定する。
    image: [opts.visual ? mainVisualUrl(opts.visual) : ogImageUrl(opts.title)],
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

/** 記事の metadata（title / canonical / OGP / Twitter）をまとめて組み立てる。
 *  OGP画像・日付書式をここに閉じ込めることで、記事側は原稿の情報を渡すだけでよくなる。 */
export function buildArticleMetadata(opts: {
  path: string;
  title: string;
  description: string;
  datePublished: string;
  dateModified: string;
}): Metadata {
  const url = `${SITE_URL}${opts.path}`;
  const image = ogImageUrl(opts.title);
  return {
    title: `${opts.title} | ${SITE_NAME}`,
    description: opts.description,
    alternates: { canonical: url },
    openGraph: {
      title: opts.title,
      description: opts.description,
      url,
      siteName: SITE_NAME,
      type: 'article',
      locale: 'ja_JP',
      publishedTime: toIsoJst(opts.datePublished),
      modifiedTime: toIsoJst(opts.dateModified),
      images: [{ url: image, width: 1200, height: 630, alt: opts.title }],
    },
    // サイト既定（app/layout.tsx）と同じ summary_large_image に揃える。
    // 1200×630 の画像を小さい正方形で切り取られないようにするため。
    twitter: {
      card: 'summary_large_image',
      title: opts.title,
      description: opts.description,
      images: [image],
    },
  };
}

/** 「最終更新：2026年7月28日」の表示。JSON-LD と同じ定数から作るのでズレない。 */
export function ArticleUpdatedAt({ dateModified }: { dateModified: string }) {
  return (
    <p className="mt-3 text-[13px] text-slate-500">
      最終更新：<time dateTime={toIsoJst(dateModified)}>{formatJaDate(dateModified)}</time>
    </p>
  );
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
