import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, CalendarDays, Coins, FileText, Landmark } from 'lucide-react';
import LpHeader from '@/components/lp/LpHeader';
import LpFooter from '@/components/lp/LpFooter';
import { SITE_URL, SITE_NAME } from '@/components/loan/LoanArticle';

/**
 * 法人成りのページの入口（2026-11-16 作成）。個人事業から会社にする人に向けて、運営会社が設立から口座まででつまずいた所をまとめる。
 * 給湯器・相続の入口と同じ形。紹介先のリンクは置かない（出口は各ページに1つ）。
 */
const PATH = '/guide/houjin';
const TITLE = '法人成りでつまずいた所｜会社の設立から法人口座まで';
const DESCRIPTION = '個人事業から会社にする人へ。運営会社が合同会社を作ったときに、法人口座の審査などでつまずいた所を、日付と結果つきでまとめています。';

export const metadata: Metadata = {
  title: `${TITLE} | ${SITE_NAME}`,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}${PATH}` },
  openGraph: { title: TITLE, description: DESCRIPTION, url: `${SITE_URL}${PATH}`, siteName: SITE_NAME, type: 'website', locale: 'ja_JP' },
};

const HOUJIN_PAGES = [
  { href: '/guide/houjin/kouza-tsukurenai', t: '法人口座が作れない', s: '3行に申し込み、通ったのは1行', icon: Landmark },
  { href: '/guide/houjin/kouza-hitsuyou-shorui', t: '法人口座の必要書類', s: '銀行4つの比較と、設立直後の事業内容の資料', icon: FileText },
  { href: '/guide/houjin/kouza-kaisetsu-kikan', t: '法人口座の開設期間', s: '設立から審査通過まで19日。最短当日が延びる理由', icon: CalendarDays },
  { href: '/guide/houjin/paypay-houjin-kouza', t: 'PayPay銀行の法人口座', s: '設立直後でも審査に通った実例と必要書類', icon: Landmark },
  { href: '/guide/houjin/raksulbank', t: 'ラクスルバンク', s: '審査はGMOあおぞら。手数料と申し込める会社', icon: Coins },
  { href: '/guide/houjin/kyuujitai-touki', t: '登記で旧字体がエラー', s: '印鑑証明書の「塚」が使えなかった登記の実例', icon: FileText },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    { '@type': 'CollectionPage', name: TITLE, description: DESCRIPTION, url: `${SITE_URL}${PATH}`, inLanguage: 'ja' },
    { '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: SITE_NAME, item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: '法人成り', item: `${SITE_URL}${PATH}` },
    ] },
    { '@type': 'ItemList', itemListElement: HOUJIN_PAGES.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.t, url: `${SITE_URL}${it.href}` })) },
  ],
};

export default function Page() {
  return (
    <div className="flex min-h-screen flex-col bg-[#f6f8fa]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <LpHeader />
      <main className="mx-auto flex w-full max-w-[520px] flex-1 flex-col gap-10 px-4 pt-4 pb-16">
        <nav aria-label="現在の位置" className="text-[12px] text-slate-500">
          <Link href="/" className="underline underline-offset-2">ホーム</Link>
          <span className="mx-1.5">/</span>
          <span>法人成り</span>
        </nav>
        <div className="flex flex-col gap-2">
          <h1 className="text-[28px] font-black leading-tight text-slate-900">法人成り<br /><span className="text-[22px] text-orange-600">設立から口座まで、つまずいた所</span></h1>
          <p className="text-[14px] text-slate-600">運営会社の実例です。</p>
        </div>
        <ul className="grid gap-2">
          {HOUJIN_PAGES.map(({ href, t, s, icon: I }) => (
            <li key={href}>
              <Link href={href} className="flex items-center gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-slate-200 hover:ring-slate-300">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-700"><I size={20} aria-hidden="true" /></span>
                <span className="flex flex-1 flex-col"><span className="text-[15px] font-black text-slate-900">{t}</span><span className="text-[12px] text-slate-600">{s}</span></span>
                <ArrowRight size={18} className="text-sky-700" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      </main>
      <LpFooter />
    </div>
  );
}
