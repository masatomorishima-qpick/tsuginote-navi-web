import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Calculator, CalendarClock, FileText, Home, ShieldCheck } from 'lucide-react';
import LpHeader from '@/components/lp/LpHeader';
import LpFooter from '@/components/lp/LpFooter';
import { SITE_URL, SITE_NAME } from '@/components/loan/LoanArticle';

/**
 * 相続のページの入口（2026-11-11 作成）。
 * それまで /guide/souzoku に一覧のページがなく、相続のページはお互いのリンクだけでつながっていた（トップや役立ちガイドからのリンクが0）。
 * 検索の評価を相続のページ全体に回すため、入口を作り、役立ちガイドの一覧からここへつなぐ。
 * 紹介先のリンクは置かない（入口のページ。出口は各ページに1つ）。
 */
const PATH = '/guide/souzoku';
const TITLE = '相続の手続き・相続税・書類のひな形｜無料の計算とチェックリスト';
const DESCRIPTION = '家族が亡くなった後の手続きの期限、相続税がかかるかの計算、申告の必要書類、遺産分割協議書や財産目録のひな形まで。無料で使える計算の道具とエクセル・PDF の一覧です。';

export const metadata: Metadata = {
  title: `${TITLE} | ${SITE_NAME}`,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}${PATH}` },
  openGraph: { title: TITLE, description: DESCRIPTION, url: `${SITE_URL}${PATH}`, siteName: SITE_NAME, type: 'website', locale: 'ja_JP' },
};

const GROUPS = [
  {
    h: '期限と手続き', icon: CalendarClock,
    items: [
      { href: '/guide/souzoku/tetsuzuki-checklist', t: '相続の手続きチェックリスト', s: '亡くなった日から、期限を日付で' },
      { href: '/guide/souzoku/houtei-souzokubun', t: '法定相続分の計算', s: '誰がいくらかを自動で' },
      { href: '/guide/souzoku/junkakutei-checklist', t: '準確定申告の必要書類', s: '4か月の期限と出す書類' },
      { href: '/guide/souzoku/koseki-atsumekata', t: '相続の戸籍の集め方', s: '要る戸籍と広域交付で取れるか' },
      { href: '/guide/souzoku/zaisan-shirabekata', t: '相続財産の調べ方', s: '財産ごとの窓口と手数料' },
    ],
  },
  {
    h: '相続税', icon: Calculator,
    items: [
      { href: '/guide/souzoku/souzokuzei-keisan', t: '相続税の計算', s: 'かかるか・いくらかの目安' },
      { href: '/guide/souzoku/shibou-hokenkin-hikazei', t: '死亡保険金の非課税', s: '受取人ごとの額を計算' },
      { href: '/guide/souzoku/shinkoku-shorui-checklist', t: '相続税の申告の必要書類', s: '状況を選ぶと一覧に' },
    ],
  },
  {
    h: '書類のひな形', icon: FileText,
    items: [
      { href: '/guide/souzoku/zaisan-mokuroku', t: '財産目録', s: 'エクセル・PDF。合計は自動' },
      { href: '/guide/souzoku/souzoku-kankei-setsumeizu', t: '相続関係説明図', s: 'エクセル・PDF' },
      { href: '/guide/souzoku/isan-bunkatsu-kyogisho', t: '遺産分割協議書', s: 'ワード・PDF' },
    ],
  },
  {
    h: '実家・不動産', icon: Home,
    items: [
      { href: '/guide/souzoku/touki-shorui', t: '相続登記の必要書類', s: '期限と登録免許税も計算' },
      { href: '/guide/souzoku/jikka-akiya-tokurei', t: '相続した実家の3,000万円控除', s: '使えるか8つのチェック' },
    ],
  },
  {
    h: '保険', icon: ShieldCheck,
    items: [
      { href: '/guide/shisan-kanri/hoken-shoken-mikata', t: '保険証券の見方', s: '受取人と税の種類も' },
      { href: '/guide/shisan-kanri/hoken-ichiran-excel', t: '保険の一覧表', s: '入っている保険を書き出す' },
    ],
  },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    { '@type': 'CollectionPage', name: TITLE, description: DESCRIPTION, url: `${SITE_URL}${PATH}`, inLanguage: 'ja' },
    { '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: SITE_NAME, item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: '役立ちガイド', item: `${SITE_URL}/guide` },
      { '@type': 'ListItem', position: 3, name: '相続', item: `${SITE_URL}${PATH}` },
    ] },
    { '@type': 'ItemList', itemListElement: GROUPS.flatMap((g) => g.items).map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.t, url: `${SITE_URL}${it.href}` })) },
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
          <Link href="/guide" className="underline underline-offset-2">役立ちガイド</Link>
          <span className="mx-1.5">/</span>
          <span>相続</span>
        </nav>
        <div className="flex flex-col gap-2">
          <h1 className="text-[28px] font-black leading-tight text-slate-900">相続の<br /><span className="text-orange-600">手続き・相続税・書類</span></h1>
          <p className="text-[14px] text-slate-600">計算の道具とエクセル・PDF は、すべて無料・登録不要です。</p>
        </div>
        {GROUPS.map(({ h, icon: I, items }) => (
          <section key={h} className="flex flex-col gap-3" aria-labelledby={`g-${h}`}>
            <h2 id={`g-${h}`} className="flex items-center gap-2 text-[19px] font-black text-slate-900">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50 text-sky-700"><I size={18} aria-hidden="true" /></span>{h}
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
        ))}
        <p className="text-[11px] leading-relaxed text-slate-400">各ページの金額や期限は、国税庁・法務省・裁判所などの公式の情報をもとにし、出典と確認日をページごとに書いています。</p>
      </main>
      <LpFooter />
    </div>
  );
}
