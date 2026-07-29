import type { Metadata } from 'next';
import Link from 'next/link';
import GuideHeader from '@/components/GuideHeader';
import SiteFooter from '@/components/SiteFooter';
import { SITE_URL, ORG_NAME, formatJaDate, toIsoJst, ogImageUrl } from '@/components/loan/LoanArticle';
import { LOAN_ARTICLES } from '@/lib/loan/articles';

/**
 * / — サイトのトップページ（2026-07-30 に実体化）
 *
 * 経緯：2026-07-15 のピボット以降、"/" は middleware で /shisan にリダイレクトされ、
 * サイトの顔が「老後資金の診断ツール」になっていた。主軸である /loan（記事5本＋
 * 計算ツール）にトップから辿れず、旧URLもすべて "/" 経由の二段転送になっていた。
 * 入口を正しい形に戻すため、リダイレクトを廃止してこのページを置いた。
 *
 * 構成の意図：
 *   1. 導入 — **中立であることを最初に明示する**（このサイトのブランドの核）
 *   2. 住宅ローン（最も大きく・最も上に。レジストリから自動生成）
 *   3. 家計・老後資金の診断
 *   4. 役立ちガイド
 *   5. 運営者情報
 *
 * 技術要件：**すべてサーバー側でHTMLとして出力する。** トップはサイトで最も重要な
 * ページで、クローラーとAI検索から確実に読める必要がある（/shisan がJS依存で
 * ほぼ空に見えていた反省）。クライアントコンポーネントは使わない。
 */

const PAGE_TITLE = 'つぎの手ナビ｜住宅ローンとお金の判断を、あなたの数字で';
const PAGE_DESCRIPTION =
  '住宅ローンの借り換え・変動と固定の比較、老後資金の見通しを、あなたが入力した数字で試算できます。記事も計算ツールも同じ計算式を使っています。特定の金融機関・金融商品の推奨は行いません。';
const OG_IMAGE = ogImageUrl(PAGE_TITLE);

/** /guide の記事数。sitemap の実数に合わせて手で更新する（レジストリ化していないため）。 */
const GUIDE_ARTICLE_COUNT = 40;

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: { canonical: SITE_URL },
  robots: { index: true, follow: true },
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: SITE_URL,
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

/* 構造化データ：WebSite と Organization は app/layout.tsx が出しているので、
 * ここでは住宅ローン記事の一覧（ItemList）だけを足す。/loan ハブと同じ形。 */
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'ItemList',
      name: '住宅ローンの記事',
      itemListElement: LOAN_ARTICLES.map((a, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: a.title,
        url: `${SITE_URL}${a.path}`,
      })),
    },
  ],
};

const h2 = 'text-[20px] font-bold text-slate-900 sm:text-[22px]';
const lead = 'mt-2 text-[15px] leading-relaxed text-slate-700';
const linkCls = 'text-blue-700 underline hover:no-underline';

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <GuideHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6">
        {/* 1. 導入 */}
        <h1 className="text-[26px] font-bold leading-tight text-slate-900 sm:text-[32px]">
          お金の判断を、あなたの数字で
        </h1>
        <div className="mt-4 space-y-3 text-[15px] leading-relaxed text-slate-700">
          <p>
            金利や制度のニュースは毎日流れてきますが、それが自分にとってどういう意味を持つのかは分かりません。
          </p>
          <p>
            ここでは、<strong>あなたの数字を入れると答えが出る形</strong>で、お金の判断を整理しています。残高・残りの返済年数・いまの金利を入れれば、借り換えで元が取れるのかどうかがその場で分かります。
          </p>
          <p>
            <strong>特定の金融機関や金融商品を勧めることはしません。</strong>試算はすべて目安で、根拠にした前提と出典は各記事に明記しています。
          </p>
        </div>

        {/* 2. 住宅ローン（主軸） */}
        <section className="mt-12">
          <h2 className={h2}>住宅ローンの判断</h2>
          <p className={lead}>
            変動と固定のどちらにするか、借り換えで元が取れるか、いつ動くべきか。残高と残りの返済年数によって答えが変わる問いを、記事と計算ツールの両方で扱っています。
          </p>
          <div className="mt-5 space-y-4">
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
          <p className="mt-5 text-[15px]">
            → <Link href="/loan" className={linkCls}>住宅ローンの記事一覧と計算ツール</Link>
          </p>
        </section>

        {/* 3. 家計・老後資金の診断 */}
        <section className="mt-12">
          <h2 className={h2}>家計・老後資金の診断</h2>
          <p className={lead}>
            年齢・年収・資産・毎月の余力・住宅ローンを入力すると、<strong>65歳時点でいくらになる見込みか</strong>が分かります。目標額から逆算して毎月いくら必要かも計算できます。登録は不要で、入力した内容はお使いの端末に保存されます。
          </p>
          <p className="mt-4 text-[15px]">
            → <Link href="/shisan" className={linkCls}>家計診断をはじめる</Link>
          </p>
        </section>

        {/* 4. 役立ちガイド */}
        <section className="mt-12">
          <h2 className={h2}>役立ちガイド</h2>
          <p className={lead}>
            デジタルの整理、パスワードや認証の管理、家族との情報共有、もしものときの備え。暮らしまわりの手順を{GUIDE_ARTICLE_COUNT}本の記事で解説しています。
          </p>
          <p className="mt-4 text-[15px]">
            → <Link href="/guide" className={linkCls}>役立ちガイドを見る</Link>
          </p>
        </section>

        {/* 5. 運営者情報 */}
        <section className="mt-12 rounded-xl border border-slate-200 bg-slate-50 p-5">
          <h2 className="text-[17px] font-bold text-slate-900">このサイトについて</h2>
          <p className="mt-2 text-[14px] leading-relaxed text-slate-700">
            運営：{ORG_NAME}。金融機関からの手数料や広告掲載によって内容が変わることはありません。試算に使っている前提（返済方法・費用の内訳・金利の水準）は各記事に明記し、金利が動いたときは記事とツールの両方を同時に更新しています。
          </p>
          <p className="mt-3 text-[14px]">
            <Link href="/company" className={linkCls}>運営会社・お問い合わせ</Link>
          </p>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
