import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight, FileSpreadsheet, Flame, HeartHandshake, KeyRound, Smartphone, Users,
} from 'lucide-react';
import GuideHeader from '@/components/GuideHeader';
import SiteFooter from '@/components/SiteFooter';
import LpViewTracker from '@/components/lp/LpViewTracker';
import { SITE_URL, ORG_NAME, ogImageUrl } from '@/components/loan/LoanArticle';

/**
 * / — サイトのトップページ
 *
 * 2026-11-04 作り直し（オーナー指示「あらゆるジャンルの『つぎの手』を伝える。整理整頓」）：
 *   それまでのトップは「住宅ローンが主軸」の作りだったが、Search Console（8/2〜11/1）では
 *   検索からのクリック286のうち262（92%）が暮らしの整理の3ページ、住宅ローンは9、退職金は3、家計診断は0。
 *   主題を「迷ったときの、つぎの手」に広げ、入口を3つに絞った（docs/site-top.md、枝 docs/listing-rules）。
 *   並び：売上が立つもの（住まいの設備＝給湯器）→ 人が来ているもの（暮らしの整理）→ 相続・もしもの備え。
 *   お金の判断（住宅ローン・退職金・家計診断）は、売上がなく検索のクリックも3か月で12だったので外した（オーナー判断 11/4）。
 *
 * 見せ方：文字を減らし、アイコン・余白で見せる。見出しは名詞にして、文章にしない。
 * 技術要件：本文はすべてサーバー側でHTMLとして出力する（クローラーとAI検索から読めるように）。
 *   LpViewTracker は画面に何も描かない計測だけの部品（どの入口が押されたかを lp_internal_click で取る）。
 */

const LP_ID = 'top';
const VERSION = 'v2b-2026-11-04';

const PAGE_TITLE = 'つぎの手ナビ｜迷ったときの、つぎの手を';
const PAGE_DESCRIPTION =
  '給湯器の交換費用と見積もりの見方、パスワードや保険の整理、相続ともしもの備え。暮らしで迷ったときに、次にやることが分かるところまでまとめています。';
const OG_IMAGE = ogImageUrl(PAGE_TITLE);

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

/** 3つの入口。見出しは名詞、一言は訪問者の言葉で。 */
const AREAS = [
  {
    id: 'setsubi',
    icon: Flame,
    color: 'bg-orange-50 text-orange-600',
    h: '住まいの設備',
    s: '給湯器の交換費用と見積もり',
    href: '/kyutoki/kokan-hiyou',
    links: [
      { label: '交換費用の目安', href: '/kyutoki/kokan-hiyou' },
      { label: 'お湯が出ないとき', href: '/kyutoki/oyu-ga-denai' },
    ],
  },
  {
    id: 'seiri',
    icon: KeyRound,
    color: 'bg-sky-50 text-sky-600',
    h: '暮らしの整理',
    s: 'パスワード・保険・家族との共有',
    href: '/guide',
    links: [
      { label: 'スマホのパスワード', href: '/guide/password-kanri/sumaho-password' },
      { label: '保険の一覧表', href: '/guide/shisan-kanri/hoken-ichiran-excel' },
    ],
  },
  {
    id: 'sonae',
    icon: HeartHandshake,
    color: 'bg-violet-50 text-violet-600',
    h: '相続・もしもの備え',
    s: '家族に引き継ぐための準備',
    href: '/guide/ihinseiri',
    links: [
      { label: 'デジタル遺品', href: '/guide/ihinseiri' },
      { label: '急な入院の備え', href: '/guide/moshimo-sonae/kyu-nyuin-sonae' },
    ],
  },
] as const;

/** よく読まれている記事（Search Console 8/2〜11/1 のクリック上位。入れ替えたら日付も直す） */
const POPULAR = [
  { icon: FileSpreadsheet, label: '保険の一覧表をエクセルで作る', note: '無料の表つき', href: '/guide/shisan-kanri/hoken-ichiran-excel' },
  { icon: Smartphone, label: 'スマホのパスワードの管理', note: '忘れっぽくても安全に', href: '/guide/password-kanri/sumaho-password' },
  { icon: Users, label: '家族とのパスワードの共有', note: 'どこまで共有するか', href: '/guide/kazoku-kyoyu/password-account-kyoyu' },
  { icon: HeartHandshake, label: '急な入院に備えて、家族に伝えておくこと', note: '持ち物だけでは足りない', href: '/guide/moshimo-sonae/kyu-nyuin-sonae' },
  { icon: Smartphone, label: 'デジタル断捨離のやり方', note: 'スマホと契約をすっきり', href: '/guide/digital-seiri/digital-dansyari' },
] as const;

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'ItemList',
      name: 'つぎの手ナビのカテゴリ',
      itemListElement: AREAS.map((a, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: a.h,
        url: `${SITE_URL}${a.href}`,
      })),
    },
  ],
};

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <LpViewTracker lpId={LP_ID} version={VERSION} />
      <GuideHeader />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 pb-16 sm:px-6">
        {/* 最初の画面 */}
        <section aria-labelledby="hero" className="py-12 text-center sm:py-16">
          <h1 id="hero" className="text-[28px] font-bold leading-tight text-slate-900 sm:text-[40px]">
            迷ったときの、つぎの手を
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-slate-600 sm:text-[17px]">
            給湯器の交換、パスワードの整理、もしもの備え。
            <br />
            次にやることが分かるところまで。
          </p>
        </section>

        {/* 3つの入口 */}
        <section aria-labelledby="areas">
          <h2 id="areas" className="sr-only">カテゴリ</h2>
          <ul className="grid gap-4 sm:grid-cols-3">
            {AREAS.map((a) => {
              const Icon = a.icon;
              return (
                <li key={a.id} className="rounded-2xl border border-slate-200 p-5 transition hover:border-slate-300 hover:shadow-sm">
                  <Link href={a.href} className="flex items-start gap-4 sm:flex-col sm:gap-3">
                    <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${a.color}`}>
                      <Icon className="h-6 w-6" aria-hidden="true" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[18px] font-bold text-slate-900">{a.h}</span>
                      <span className="mt-1 block text-[14px] text-slate-600">{a.s}</span>
                    </span>
                  </Link>
                  <div className="mt-4 flex flex-wrap gap-2 pl-16 sm:pl-0">
                    {a.links.map((l) => (
                      <Link
                        key={l.href}
                        href={l.href}
                        className="rounded-full bg-slate-100 px-3 py-1 text-[13px] text-slate-700 hover:bg-slate-200"
                      >
                        {l.label}
                      </Link>
                    ))}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        {/* よく読まれている記事 */}
        <section aria-labelledby="popular" className="mt-16">
          <h2 id="popular" className="text-[18px] font-bold text-slate-900 sm:text-[20px]">よく読まれている記事</h2>
          <ul className="mt-4 divide-y divide-slate-100 border-y border-slate-100">
            {POPULAR.map((p) => {
              const Icon = p.icon;
              return (
                <li key={p.href}>
                  <Link href={p.href} className="flex items-center gap-3 py-4 hover:bg-slate-50">
                    <Icon className="h-5 w-5 shrink-0 text-slate-400" aria-hidden="true" />
                    <span className="min-w-0 flex-1">
                      <span className="block text-[15px] font-medium text-slate-900">{p.label}</span>
                      <span className="block text-[13px] text-slate-500">{p.note}</span>
                    </span>
                    <ArrowRight className="h-4 w-4 shrink-0 text-slate-300" aria-hidden="true" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>

        {/* このサイトについて */}
        <section aria-labelledby="about" className="mt-16 rounded-2xl bg-slate-50 p-6">
          <h2 id="about" className="text-[16px] font-bold text-slate-900">このサイトについて</h2>
          <ul className="mt-3 space-y-1.5 text-[14px] leading-relaxed text-slate-700">
            <li>・金額や制度は、公式の発表や販売価格をもとにし、出典を記事に書いています</li>
            <li>・紹介料を受け取るリンクには、その旨を表示しています</li>
            <li>・運営：{ORG_NAME}</li>
          </ul>
          <p className="mt-4 flex gap-4 text-[14px]">
            <Link href="/policy" className="text-blue-700 underline hover:no-underline">中立性ポリシー</Link>
            <Link href="/company" className="text-blue-700 underline hover:no-underline">運営会社・お問い合わせ</Link>
          </p>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
