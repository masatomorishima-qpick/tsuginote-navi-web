import type { ReactNode } from 'react';
import Link from 'next/link';
import HenshuNote from '@/components/guide/HenshuNote';
import { Download, FileSpreadsheet, FileText, type LucideIcon } from 'lucide-react';
import LpHeader from '@/components/lp/LpHeader';
import LpFooter from '@/components/lp/LpFooter';
import LpViewTracker from '@/components/lp/LpViewTracker';
import SouzokuExit, { SouzokuExitSticky } from '@/components/souzoku/SouzokuExit';
import { SOUZOKU_PARTNERS, type SouzokuPartnerKey } from '@/lib/souzoku/partners';

/**
 * 相続の配布物のページの型（2026-11-05 新設）。給湯器の配布物のページと同じ作り：
 * 最初の画面に答え＋無料のひな形、文字は少なく、図とアイコンで見せる。出口は1ページに1つ（href が空なら出さない）。
 */

export const SOUZOKU_FILES = {
  kyogisho: [
    { label: 'ワード', href: '/downloads/souzoku-isan-bunkatsu-kyogisho.docx', icon: FileText },
    { label: 'PDF', href: '/downloads/souzoku-isan-bunkatsu-kyogisho.pdf', icon: FileText },
  ],
  setsumeizu: [
    { label: 'エクセル', href: '/downloads/souzoku-kankei-setsumeizu.xlsx', icon: FileSpreadsheet },
    { label: 'PDF', href: '/downloads/souzoku-kankei-setsumeizu.pdf', icon: FileText },
  ],
  mokuroku: [
    { label: 'エクセル', href: '/downloads/souzoku-zaisan-mokuroku.xlsx', icon: FileSpreadsheet },
    { label: 'PDF', href: '/downloads/souzoku-zaisan-mokuroku.pdf', icon: FileText },
  ],
  akiya: [
    { label: 'エクセル', href: '/downloads/souzoku-akiya-tokurei-check.xlsx', icon: FileSpreadsheet },
    { label: 'PDF', href: '/downloads/souzoku-akiya-tokurei-check.pdf', icon: FileText },
  ],
  tetsuzuki: [
    { label: 'エクセル', href: '/downloads/souzoku-tetsuzuki-checklist.xlsx', icon: FileSpreadsheet },
    { label: 'PDF', href: '/downloads/souzoku-tetsuzuki-checklist.pdf', icon: FileText },
  ],
  shinkoku: [
    { label: 'エクセル', href: '/downloads/souzoku-shinkoku-shorui.xlsx', icon: FileSpreadsheet },
    { label: 'PDF', href: '/downloads/souzoku-shinkoku-shorui.pdf', icon: FileText },
  ],
  hikazei: [
    { label: 'エクセル', href: '/downloads/souzoku-hokenkin-hikazei.xlsx', icon: FileSpreadsheet },
    { label: 'PDF', href: '/downloads/souzoku-hokenkin-hikazei.pdf', icon: FileText },
  ],
  houtei: [
    { label: 'エクセル', href: '/downloads/souzoku-houtei-souzokubun.xlsx', icon: FileSpreadsheet },
    { label: 'PDF', href: '/downloads/souzoku-houtei-souzokubun.pdf', icon: FileText },
  ],
  touki: [
    { label: 'エクセル', href: '/downloads/souzoku-touki-shorui.xlsx', icon: FileSpreadsheet },
    { label: 'PDF', href: '/downloads/souzoku-touki-shorui.pdf', icon: FileText },
  ],
  junkakutei: [
    { label: 'エクセル', href: '/downloads/souzoku-junkakutei-shorui.xlsx', icon: FileSpreadsheet },
    { label: 'PDF', href: '/downloads/souzoku-junkakutei-shorui.pdf', icon: FileText },
  ],
  shirabe: [
    { label: 'エクセル', href: '/downloads/souzoku-zaisan-shirabekata.xlsx', icon: FileSpreadsheet },
    { label: 'PDF', href: '/downloads/souzoku-zaisan-shirabekata.pdf', icon: FileText },
  ],
  koseki: [
    { label: 'エクセル', href: '/downloads/souzoku-koseki-atsumekata.xlsx', icon: FileSpreadsheet },
    { label: 'PDF', href: '/downloads/souzoku-koseki-atsumekata.pdf', icon: FileText },
  ],
} as const;

export const SOUZOKU_PAGES = [
  { href: '/guide/souzoku/tetsuzuki-checklist', h: '相続の手続きチェックリスト' },
  { href: '/guide/souzoku/souzokuzei-keisan', h: '相続税の計算' },
  { href: '/guide/souzoku/shinkoku-shorui-checklist', h: '相続税の申告の必要書類' },
  { href: '/guide/souzoku/shibou-hokenkin-hikazei', h: '死亡保険金の非課税の計算' },
  { href: '/guide/souzoku/houtei-souzokubun', h: '法定相続分の計算' },
  { href: '/guide/souzoku/junkakutei-checklist', h: '準確定申告の必要書類' },
  { href: '/guide/souzoku/touki-shorui', h: '相続登記の必要書類' },
  { href: '/guide/souzoku/koseki-atsumekata', h: '相続の戸籍の集め方' },
  { href: '/guide/souzoku/zaisan-shirabekata', h: '相続財産の調べ方' },
  { href: '/guide/souzoku/isan-bunkatsu-kyogisho', h: '遺産分割協議書' },
  { href: '/guide/souzoku/souzoku-kankei-setsumeizu', h: '相続関係説明図' },
  { href: '/guide/souzoku/zaisan-mokuroku', h: '財産目録' },
  { href: '/guide/souzoku/jikka-akiya-tokurei', h: '実家の3,000万円控除' },
];

export const SECTION = 'flex flex-col gap-5';
export const H2 = 'text-[22px] font-black leading-snug text-slate-900';
export const SRC = 'text-[11px] leading-relaxed text-slate-500';
export const A = 'underline underline-offset-2';

export function SouzokuDownload({ icon: I, h, s, files }: { icon: LucideIcon; h: string; s: string; files: readonly { label: string; href: string; icon: LucideIcon }[] }) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border-2 border-sky-200 bg-sky-50/60 p-4">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-sky-700 ring-1 ring-sky-200">
          <I size={24} aria-hidden="true" />
        </span>
        <span className="flex flex-col">
          <span className="text-[17px] font-black text-slate-900">{h}<span className="ml-1.5 text-[12px] font-bold text-sky-700">無料</span></span>
          <span className="text-[12px] text-slate-600">{s}</span>
        </span>
      </div>
      <div className="flex gap-2">
        {files.map(({ label, href, icon: FI }) => (
          <a key={href} href={href} download className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-sky-700 px-3 py-3 text-[15px] font-bold text-white hover:bg-sky-800">
            <FI size={18} aria-hidden="true" />{label}<Download size={16} aria-hidden="true" />
          </a>
        ))}
      </div>
      <p className="text-[11px] text-slate-500">登録やメールアドレスの入力は要りません</p>
    </div>
  );
}

export function NumberedCards({ items }: { items: { h: string; d: string; icon?: LucideIcon }[] }) {
  return (
    <ol className="grid gap-2.5">
      {items.map(({ h, d, icon: I }, i) => (
        <li key={h} className="flex items-start gap-3 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-[16px] font-black text-sky-700">
            {I ? <I size={20} aria-hidden="true" /> : i + 1}
          </span>
          <span className="flex flex-col gap-0.5">
            <span className="text-[15px] font-black text-slate-900">{h}</span>
            <span className="text-[13px] leading-relaxed text-slate-600">{d}</span>
          </span>
        </li>
      ))}
    </ol>
  );
}

export default function SouzokuArticle({
  lpId, version, path, eyebrow, title, download, partner, exitLead, faqs, children, updated,
}: {
  lpId: string;
  version: string;
  path: string;
  eyebrow: string;
  title: ReactNode;
  download: ReactNode;
  partner: SouzokuPartnerKey;
  exitLead: string;
  faqs: { q: string; a: string }[];
  children: ReactNode;
  updated: string;
}) {
  const hasExit = !!SOUZOKU_PARTNERS[partner].href;
  return (
    <div className="flex min-h-screen flex-col bg-[#f6f8fa]">
      <LpHeader />
      <LpViewTracker lpId={lpId} version={version} />
      <main className="mx-auto flex w-full max-w-[520px] flex-1 flex-col gap-14 px-4 pt-4 pb-32 sm:pb-16">
        {hasExit && (
          <p className="-mb-10 flex flex-wrap items-center gap-x-2 text-[11px] text-slate-500">
            <span className="rounded border border-slate-300 px-1.5 tracking-widest">PR</span>
            <span>当サイトは紹介料を受け取っています</span>
            <Link href="/policy" className="text-sky-800 underline underline-offset-2">中立性ポリシー</Link>
          </p>
        )}
        <section className="flex flex-col gap-5" aria-labelledby="top">
          <div className="flex flex-col gap-2">
            <p className="text-[13px] font-bold text-sky-700">{eyebrow}</p>
            <h1 id="top" className="text-[28px] font-black leading-tight text-slate-900">{title}</h1>
          </div>
          {download}
        </section>

        {children}

        {hasExit && (
          <section className={SECTION} aria-labelledby="exit">
            <h2 id="exit" className="sr-only">相談先</h2>
            <SouzokuExit lpId={lpId} partner={partner} position="bottom" lead={exitLead} beacon />
          </section>
        )}

        <section className="flex flex-col gap-2" aria-labelledby="faq">
          <h2 id="faq" className={`${H2} mb-2`}>よくある質問</h2>
          {faqs.map((f) => (
            <details key={f.q} className="group rounded-2xl bg-white px-4 py-4 ring-1 ring-slate-200">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-[15px] font-bold text-slate-900">
                {f.q}
                <span aria-hidden="true" className="text-xl text-slate-400 transition group-open:rotate-45">＋</span>
              </summary>
              <p className="mt-3 text-[14px] leading-relaxed text-slate-600">{f.a}</p>
            </details>
          ))}
        </section>

        <nav className="flex flex-col gap-2" aria-label="相続の書類のひな形">
          <p className="flex items-center justify-between text-[13px] font-bold text-slate-600">ほかの無料の道具とひな形<Link href="/guide/souzoku" className="text-[12px] text-sky-800 underline underline-offset-2">相続のページ一覧</Link></p>
          <ul className="grid grid-cols-2 gap-2">
            {SOUZOKU_PAGES.filter((p) => p.href !== path).map((p) => (
              <li key={p.href}>
                <Link href={p.href} className="flex h-full items-center rounded-xl bg-white px-3 py-2.5 text-[13px] font-bold text-slate-800 ring-1 ring-slate-200 hover:ring-slate-300">{p.h}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <HenshuNote />
        <p className="text-[11px] leading-relaxed text-slate-400">
          ひな形は公的な記載例をもとにした参考の形です。実際の内容に合わせて直してください。迷うときは専門家に確かめてください。最終更新：{updated}
        </p>
      </main>
      <SouzokuExitSticky lpId={lpId} partner={partner} />
      <LpFooter />
    </div>
  );
}

export function jsonLdFor({ url, title, description, crumb, faqs, date }: { url: string; title: string; description: string; crumb: string; faqs: { q: string; a: string }[]; date: string }) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'Article', author: { '@type': 'Organization', name: 'つぎの手ナビ 編集部', url: 'https://www.tsuginotenavi.jp/policy#ayamari' }, publisher: { '@id': 'https://www.tsuginotenavi.jp/#organization' }, headline: title, description, inLanguage: 'ja', datePublished: `${date}T09:00:00+09:00`, dateModified: `${date}T09:00:00+09:00`, mainEntityOfPage: url },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'つぎの手ナビ', item: 'https://www.tsuginotenavi.jp/' },
          { '@type': 'ListItem', position: 2, name: '相続', item: 'https://www.tsuginotenavi.jp/guide/souzoku' },
          { '@type': 'ListItem', position: 3, name: crumb, item: url },
        ],
      },
      { '@type': 'FAQPage', mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) },
    ],
  };
}
