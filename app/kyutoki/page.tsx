import type { Metadata } from 'next';
import Link from 'next/link';
import { AlertTriangle, ArrowRight, Calculator, Home, Ruler } from 'lucide-react';
import LpHeader from '@/components/lp/LpHeader';
import LpFooter from '@/components/lp/LpFooter';
import { SITE_URL, SITE_NAME } from '@/components/loan/LoanArticle';
import { KYUTOKI_GROUPS, KYUTOKI_PAGES } from '@/lib/kyutoki/pages';

/**
 * 給湯器のページの入口（2026-11-13 作成）。
 * それまで /kyutoki に一覧がなく、トップから辿れる給湯器のページは19のうち4つだけだった（11/13 の点検）。
 * 相続の入口（/guide/souzoku）と同じ形。紹介先のリンクは置かない（出口は各ページに1つ）。
 */
const PATH = '/kyutoki';
const TITLE = '給湯器の故障・交換費用・選び方｜お湯が出ないときから見積もりの見方まで';
const DESCRIPTION = 'お湯が出ない・エラー番号・水漏れ・凍結などの故障のときにまず確かめること、交換費用の目安と見積もりの見方、号数や型番の選び方、マンション・戸建て別の費用までの一覧です。';

export const metadata: Metadata = {
  title: `${TITLE} | ${SITE_NAME}`,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}${PATH}` },
  openGraph: { title: TITLE, description: DESCRIPTION, url: `${SITE_URL}${PATH}`, siteName: SITE_NAME, type: 'website', locale: 'ja_JP' },
};

const ICONS = { trouble: AlertTriangle, money: Calculator, choose: Ruler, home: Home } as const;

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    { '@type': 'CollectionPage', name: TITLE, description: DESCRIPTION, url: `${SITE_URL}${PATH}`, inLanguage: 'ja' },
    { '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: SITE_NAME, item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: '給湯器', item: `${SITE_URL}${PATH}` },
    ] },
    { '@type': 'ItemList', itemListElement: KYUTOKI_PAGES.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.t, url: `${SITE_URL}${it.href}` })) },
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
          <span>給湯器</span>
        </nav>
        <div className="flex flex-col gap-2">
          <h1 className="text-[28px] font-black leading-tight text-slate-900">給湯器の<br /><span className="text-orange-600">故障・交換費用・選び方</span></h1>
          <p className="text-[14px] text-slate-600">お湯が出ないときは、いちばん上から。</p>
        </div>
        {KYUTOKI_GROUPS.map(({ h, icon, items }) => {
          const I = ICONS[icon];
          return (
            <section key={h} className="flex flex-col gap-3" aria-labelledby={`g-${icon}`}>
              <h2 id={`g-${icon}`} className="flex items-center gap-2 text-[19px] font-black text-slate-900">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 text-orange-600"><I size={18} aria-hidden="true" /></span>{h}
              </h2>
              <ul className="grid gap-2">
                {items.map((it) => (
                  <li key={it.href}>
                    <Link href={it.href} className="flex items-center gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-slate-200 hover:ring-slate-300">
                      <span className="flex flex-1 flex-col"><span className="text-[15px] font-black text-slate-900">{it.t}</span><span className="text-[12px] text-slate-600">{it.s}</span></span>
                      <ArrowRight size={18} className="text-sky-700" aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
        <p className="text-[11px] leading-relaxed text-slate-400">各ページの金額や手順は、ガス会社・メーカー・公的機関の公式の情報をもとにし、出典と確認日をページごとに書いています。</p>
      </main>
      <LpFooter />
    </div>
  );
}
