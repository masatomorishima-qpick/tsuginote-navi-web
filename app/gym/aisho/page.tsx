import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Brain, CalendarClock, ClipboardCheck, Handshake, HeartHandshake, Hourglass, ListChecks, Receipt, Store, Undo2, UserRoundX,
} from 'lucide-react';
import GuideHeader from '@/components/GuideHeader';
import SiteFooter from '@/components/SiteFooter';
import { SITE_URL, SITE_NAME, ogImageUrl } from '@/components/loan/LoanArticle';
import { TYPES } from '@/lib/gym/aisho';
import AishoDiagnosis from './AishoDiagnosis';

/**
 * パーソナルジム「相性診断」LP（2026-10-28 新設）。
 *
 * 考え方：ジムが個室化して口コミが効きにくい。店より「担当トレーナーとの相性」が満足を決める。
 *   7問で「合うトレーナーのタイプ」と「ジムを選ぶ条件」を出し、条件に合う提携ジムの体験へ送る。
 *   結果のあとに任意・匿名のアンケート（やめた理由など）を置き、次の改善と事業検討の材料にする。
 *
 * 集客はソーシャルメディア広告が主（「パーソナルジム 選び方」の検索は月140回程度と小さい）。
 * 判定・アンケート・紹介先の設定は lib/gym/aisho.ts に集約。
 * 表現の注意：「絶対に失敗しない」「必ず痩せる」など言い切りは使わない（景品表示法）。
 */

const PAGE_PATH = '/gym/aisho';
const TITLE = 'パーソナルジム相性診断｜合うトレーナーのタイプがわかる';
const DESCRIPTION =
  '7問に答えると、あなたに合うパーソナルトレーナーのタイプと、ジムを選ぶ条件がわかります。体験の前に確かめたい4つの点も紹介します。';
const DATE_MODIFIED = '2026-10-29';
const KOKUSEN_URL = 'https://www.kokusen.go.jp/news/data/n-20261007_1.html';

export const metadata: Metadata = {
  title: `${TITLE} | ${SITE_NAME}`,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}${PAGE_PATH}` },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `${SITE_URL}${PAGE_PATH}`,
    siteName: SITE_NAME,
    type: 'website',
    locale: 'ja_JP',
    images: [{ url: ogImageUrl(TITLE), width: 1200, height: 630, alt: TITLE }],
  },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, images: [ogImageUrl(TITLE)] },
};

const FAQS = [
  {
    q: '体験の当日に契約しないといけませんか？',
    a: 'いいえ。「今日だけの価格」と言われても、総額と解約の条件を書面でもらい、持ち帰って比べてかまいません。',
  },
  {
    q: '途中で担当を変えられますか？',
    a: 'ジムによります。体験のときに「担当を変えたいときはどうするか」を聞いておくと、合わなかったときに困りません。',
  },
  {
    q: '紹介先はどうやって選んでいますか？',
    a: '料金の総額と解約の条件を公開していて、体験当日の契約を求めない方針であることを確認したジムだけを載せます。紹介料を受け取っていますが、診断の結果は回答だけで決まります。',
  },
  {
    q: 'アンケートの回答はどう使いますか？',
    a: '名前や連絡先は聞かず、集計して診断の改善に使います。答えなくても結果は見られます。',
  },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      '@id': `${SITE_URL}${PAGE_PATH}#webpage`,
      url: `${SITE_URL}${PAGE_PATH}`,
      name: TITLE,
      description: DESCRIPTION,
      inLanguage: 'ja',
      dateModified: `${DATE_MODIFIED}T09:00:00+09:00`,
      isPartOf: { '@id': `${SITE_URL}/#website` },
      publisher: { '@id': `${SITE_URL}/#organization` },
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: SITE_NAME, item: `${SITE_URL}/` },
        { '@type': 'ListItem', position: 2, name: 'パーソナルジム相性診断', item: `${SITE_URL}${PAGE_PATH}` },
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: FAQS.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    },
  ],
};

/** ヒーローの図：トレーナーと利用者、間に相性のメーター */
function MatchIllustration() {
  return (
    <svg viewBox="0 0 220 200" role="img" aria-label="トレーナーと利用者の相性を表すイラスト" className="h-auto w-full max-w-[220px]">
      <rect x="0" y="0" width="220" height="200" rx="28" fill="#ffe4e6" />
      {/* 左：トレーナー */}
      <circle cx="58" cy="70" r="20" fill="#ffffff" stroke="#fda4af" strokeWidth="2" />
      <path d="M26 140c0-22 14-38 32-38s32 16 32 38z" fill="#ffffff" stroke="#fda4af" strokeWidth="2" />
      <rect x="40" y="120" width="36" height="8" rx="4" fill="#e11d48" />
      {/* 右：利用者 */}
      <circle cx="162" cy="70" r="20" fill="#ffffff" stroke="#fda4af" strokeWidth="2" />
      <path d="M130 140c0-22 14-38 32-38s32 16 32 38z" fill="#ffffff" stroke="#fda4af" strokeWidth="2" />
      {/* 間：ハート */}
      <path d="M110 92c-6-10-22-8-22 4 0 10 22 22 22 22s22-12 22-22c0-12-16-14-22-4z" fill="#e11d48" />
      {/* 下：相性メーター */}
      <rect x="30" y="158" width="160" height="12" rx="6" fill="#ffffff" />
      <rect x="30" y="158" width="128" height="12" rx="6" fill="#fb7185" />
      <circle cx="158" cy="164" r="9" fill="#e11d48" stroke="#ffffff" strokeWidth="3" />
    </svg>
  );
}

const TYPE_ICONS = { bansou: HeartHandshake, kanri: ClipboardCheck, riron: Brain, hippari: ListChecks } as const;
const TYPE_TONE = {
  bansou: 'bg-rose-100 text-rose-700',
  kanri: 'bg-orange-100 text-orange-700',
  riron: 'bg-sky-100 text-sky-800',
  hippari: 'bg-emerald-100 text-emerald-700',
} as const;

const SECTION = 'flex flex-col gap-5';
const H2 = 'text-[22px] font-black leading-snug text-slate-900';

export default function GymAishoPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#f8f6f7]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <GuideHeader />

      <main className="mx-auto flex w-full max-w-[520px] flex-1 flex-col gap-14 px-4 pt-4 pb-28 sm:pb-16">
        <p className="-mb-10 flex flex-wrap items-center gap-x-2 text-[11px] text-slate-500">
          <span className="rounded border border-slate-300 px-1.5 tracking-widest">PR</span>
          当サイトは紹介料を受け取っています（ジムの運営はしていません）
          <Link href="/policy" className="text-sky-800 underline underline-offset-2">中立性ポリシー</Link>
        </p>

        <section className="flex flex-col gap-5">
          <div className="grid grid-cols-[1fr_auto] items-center gap-3">
            <div className="flex flex-col gap-3">
              <span className="self-start rounded-full bg-white px-3 py-1 text-xs font-bold text-rose-700 ring-1 ring-rose-200">パーソナルジム相性診断</span>
              <h1 className="text-[34px] font-black leading-[1.15] tracking-tight text-slate-900 sm:text-[40px]">
                <span className="whitespace-nowrap">ジム、</span><br /><span className="whitespace-nowrap">相性で選ぶ。</span>
              </h1>
            </div>
            <div className="w-[120px] sm:w-[170px]">
              <MatchIllustration />
            </div>
          </div>
          <p className="-mt-1 text-[18px] font-bold leading-snug text-slate-700">
            合うトレーナーが<span className="text-rose-600">約1分</span>でわかる。
          </p>

          <AishoDiagnosis />
        </section>

        {/* 相談件数の伸び：横棒で見せる */}
        <section className={SECTION} aria-labelledby="soudan">
          <div className="flex flex-col gap-1.5">
            <h2 id="soudan" className={H2}>相談件数、1年で約1.6倍</h2>
            <p className="text-[15px] text-slate-600">無料体験のあとの長時間の勧誘や、解約料についての相談が目立ちます。</p>
          </div>
          <div className="flex flex-col gap-3 rounded-2xl bg-white p-4 ring-1 ring-slate-200" role="img" aria-label="パーソナルトレーニングの相談件数。2024年度885件、2025年度1,457件">
            {[
              { y: '2024年度', n: 885, w: '61%', c: 'bg-slate-300' },
              { y: '2025年度', n: 1457, w: '100%', c: 'bg-rose-500' },
            ].map((r) => (
              <div key={r.y} className="grid grid-cols-[4.5em_1fr] items-center gap-3">
                <span className="text-[13px] font-bold text-slate-500">{r.y}</span>
                <span className="flex items-center gap-2">
                  <span className="flex-1">
                    <span className={`block h-7 rounded-lg ${r.c}`} style={{ width: r.w }} />
                  </span>
                  <span className="w-[4.2em] text-right text-[15px] font-black tabular-nums text-slate-900">{r.n.toLocaleString()}件</span>
                </span>
              </div>
            ))}
          </div>
          <p className="text-[12px] leading-relaxed text-slate-500">
            出典：<a href={KOKUSEN_URL} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">国民生活センター（2026年10月7日公表）</a>
          </p>
        </section>

        {/* 4つのタイプ */}
        <section className={SECTION} aria-labelledby="types">
          <h2 id="types" className={H2}>4つのタイプで診断</h2>
          <ul className="grid grid-cols-2 gap-3">
            {(Object.keys(TYPES) as (keyof typeof TYPES)[]).map((k) => {
              const t = TYPES[k];
              const I = TYPE_ICONS[k];
              return (
                <li key={k} className="flex flex-col gap-2 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                  <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${TYPE_TONE[k]}`}>
                    <I size={22} aria-hidden="true" />
                  </span>
                  <span className="text-[16px] font-black text-slate-900">{t.name}</span>
                  <span className="text-[13px] leading-snug text-slate-600">{t.h}</span>
                </li>
              );
            })}
          </ul>
        </section>

        {/* 体験の前に確かめる4点 */}
        <section className={SECTION} aria-labelledby="check">
          <h2 id="check" className={H2}>体験の前に確かめる4点</h2>
          <ul className="grid grid-cols-2 gap-3">
            {[
              { icon: Receipt, h: '総額', d: '入会金・コース代・食事指導の合計' },
              { icon: Undo2, h: '解約・返金', d: '途中でやめたときにいくら戻るか' },
              { icon: Hourglass, h: '当日契約', d: '契約を迫られたら持ち帰って比べる' },
              { icon: CalendarClock, h: '予約', d: '希望の曜日・時間に取れるか' },
            ].map(({ icon: I, h, d }) => (
              <li key={h} className="flex flex-col gap-2 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-700">
                  <I size={22} aria-hidden="true" />
                </span>
                <span className="text-[16px] font-black text-slate-900">{h}</span>
                <span className="text-[13px] leading-snug text-slate-600">{d}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className={SECTION} aria-labelledby="about">
          <h2 id="about" className={H2}>このページについて</h2>
          <ul className="grid gap-3">
            {[
              { icon: Store, h: 'ジムを運営しない第三者のサイト', d: '特定のジムの店舗ではありません' },
              { icon: Receipt, h: '総額と解約条件を公開するジムだけ', d: '当日契約を求めない方針かも確認します' },
              { icon: Handshake, h: '診断は紹介料で変わらない', d: '結果は回答だけで決まります' },
              { icon: UserRoundX, h: '名前や連絡先の入力は不要', d: 'アンケートも匿名です' },
            ].map(({ icon: I, h, d }) => (
              <li key={h} className="flex items-center gap-4 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                  <I size={22} aria-hidden="true" />
                </span>
                <span className="flex flex-col">
                  <span className="text-[15px] font-black text-slate-900">{h}</span>
                  <span className="text-[13px] text-slate-500">{d}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="flex flex-col gap-2" aria-labelledby="faq">
          <h2 id="faq" className={`${H2} mb-2`}>よくある質問</h2>
          {FAQS.map((f) => (
            <details key={f.q} className="group rounded-2xl bg-white px-4 py-4 ring-1 ring-slate-200">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-[15px] font-bold text-slate-900">
                {f.q}
                <span aria-hidden="true" className="text-xl text-slate-400 transition group-open:rotate-45">＋</span>
              </summary>
              <p className="mt-3 text-[14px] leading-relaxed text-slate-600">{f.a}</p>
            </details>
          ))}
        </section>

        <p className="text-[11px] leading-relaxed text-slate-400">
          診断は回答にもとづく一般的な目安で、効果を約束するものではありません。料金・解約条件・体験の内容は各ジムの公表内容によります。最終更新：2026年10月29日
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
