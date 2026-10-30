import type { Metadata } from 'next';
import Link from 'next/link';
import { BadgeCheck, ClipboardCheck, FileCheck2, Handshake, PenLine, Send, Star, Store, UserRoundX } from 'lucide-react';
import GuideHeader from '@/components/GuideHeader';
import SiteFooter from '@/components/SiteFooter';
import { SITE_URL, SITE_NAME, ogImageUrl } from '@/components/loan/LoanArticle';
import TrendCheck from '@/components/trend/TrendCheck';
import CheckEntryButton from '@/components/trend/CheckEntryButton';
import { SCS } from '@/lib/trend/scs';

/**
 * トレンド速攻ページ 1本目：SCS評価制度の準備度チェック（2026-10-29 新設）。
 * 設定（設問・判定・紹介先）は lib/trend/scs.ts。画面と計測は components/trend/TrendCheck.tsx。
 * 制度の事実は情報処理推進機構のページ（2026-10-28 更新）と大和総研のレポート（2026-06-10）から。
 */

const PAGE_PATH = '/check/scs';
const TITLE = 'SCS評価制度の準備状況チェック｜★3の登録に向けて不足している対策を確認';
const DESCRIPTION =
  'サプライチェーン強化に向けたセキュリティ対策評価制度（SCS評価制度）への準備状況を8つの質問で診断。★3・★4の違いと登録までの流れも図で整理しています。';
const IPA_URL = 'https://www.ipa.go.jp/security/scs/details.html';
const DIR_URL = 'https://www.dir.co.jp/report/technology/feature/20260610_025814.pdf';

export const metadata: Metadata = {
  title: `${TITLE} | ${SITE_NAME}`,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}${PAGE_PATH}` },
  openGraph: {
    title: TITLE, description: DESCRIPTION, url: `${SITE_URL}${PAGE_PATH}`, siteName: SITE_NAME,
    type: 'website', locale: 'ja_JP', images: [{ url: ogImageUrl(TITLE), width: 1200, height: 630, alt: TITLE }],
  },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, images: [ogImageUrl(TITLE)] },
};

const FAQS = [
  { q: '取得は義務ですか？', a: '法的な強制力のない任意の制度です。ただし、普及が進めば、取引先の選定や契約の判断で重視される可能性があると指摘されています（大和総研、2026年6月）。' },
  { q: 'いつから申請できますか？', a: '2027年3月に受付を開始する予定です（情報処理推進機構、2026年10月28日更新）。' },
  { q: '★3と★4の違いは何ですか？', a: '★3は専門家による確認付きの自己評価（要求項目26件）、★4は評価機関による第三者評価（要求項目43件）です。' },
  { q: '紹介しているサービスはどう選んでいますか？', a: '診断で不足している可能性がある対策に関係するサービスだけを表示しています。当サイトは紹介料を受け取りますが、診断結果は回答内容だけで決まります。' },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage', '@id': `${SITE_URL}${PAGE_PATH}#webpage`, url: `${SITE_URL}${PAGE_PATH}`,
      name: TITLE, description: DESCRIPTION, inLanguage: 'ja', dateModified: '2026-10-29T09:00:00+09:00',
      isPartOf: { '@id': `${SITE_URL}/#website` }, publisher: { '@id': `${SITE_URL}/#organization` },
    },
    {
      '@type': 'FAQPage',
      mainEntity: FAQS.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
    },
  ],
};

/** ヒーローの図：盾と3つの星 */
function ShieldStars() {
  return (
    <svg viewBox="0 0 200 200" role="img" aria-label="盾と星のイラスト" className="h-auto w-full max-w-[200px]">
      <rect width="200" height="200" rx="28" fill="#e0f2fe" />
      <path d="M100 34l52 18v42c0 34-22 60-52 72-30-12-52-38-52-72V52z" fill="#ffffff" stroke="#7dd3fc" strokeWidth="3" />
      <path d="M78 102l15 15 30-32" fill="none" stroke="#0369a1" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
      {[{ x: 56, o: 1 }, { x: 100, o: 1 }, { x: 144, o: 0.35 }].map(({ x, o }) => (
        <path key={x} transform={`translate(${x} 178)`} d="M0-11l3.2 6.6 7.3 1-5.3 5.1 1.3 7.2L0 5.5l-6.5 3.4 1.3-7.2-5.3-5.1 7.3-1z" fill="#ea580c" fillOpacity={o} />
      ))}
    </svg>
  );
}

const SECTION = 'flex flex-col gap-5';
const H2 = 'text-[22px] font-black leading-snug text-slate-900';

export default function ScsCheckPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#f6f8fa]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <GuideHeader />

      <main className="mx-auto flex w-full max-w-[520px] flex-1 flex-col gap-14 px-4 pt-4 pb-28 sm:pb-16">
        <p className="-mb-10 flex flex-wrap items-center gap-x-2 text-[11px] text-slate-500">
          <span className="rounded border border-slate-300 px-1.5 tracking-widest">PR</span>
          当サイトは紹介先から紹介料を受け取っています。制度の評価・登録は行いません
          <Link href="/policy" className="text-sky-800 underline underline-offset-2">中立性ポリシー</Link>
        </p>

        <section className="flex flex-col gap-5">
          <div className="grid grid-cols-[1fr_auto] items-center gap-3">
            <div className="flex flex-col gap-3">
              <span className="self-start rounded-full bg-white px-3 py-1 text-xs font-bold text-sky-800 ring-1 ring-sky-200">SCS評価制度</span>
              <h1 className="text-[30px] font-black leading-[1.15] tracking-tight text-slate-900 min-[380px]:text-[34px]">
                <span className="whitespace-nowrap">★3の準備、</span><br /><span className="whitespace-nowrap">何が足りない？</span>
              </h1>
            </div>
            <div className="w-[96px] min-[380px]:w-[120px] sm:w-[160px]"><ShieldStars /></div>
          </div>
          <p className="-mt-2 text-[14px] leading-relaxed text-slate-600">
            <span className="whitespace-nowrap">取引先に自社の対策の水準を示す、</span><span className="whitespace-nowrap">国の制度。</span><br />
            <span className="whitespace-nowrap">申請は2027年3月から（予定）</span>
          </p>
          <p className="-mt-1 text-[18px] font-bold leading-snug text-slate-700">
            8つの質問、<span className="text-orange-600">1分</span>でわかる。
          </p>
          <TrendCheck id="scs" />
        </section>

        <section className={SECTION} aria-labelledby="stars">
          <h2 id="stars" className={H2}>★3と★4</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: Star, h: '★3', how: '専門家による確認付きの自己評価', n: 26 },
              { icon: BadgeCheck, h: '★4', how: '評価機関による第三者評価', n: 43 },
            ].map(({ icon: I, h, how, n }) => (
              <div key={h} className="flex flex-col gap-2 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-700"><I size={22} aria-hidden="true" /></span>
                <span className="text-[20px] font-black text-slate-900">{h}</span>
                <span className="text-[13px] leading-snug text-slate-600">{how}</span>
                <span className="mt-1 text-[13px] text-slate-500">要求項目 <b className="text-[22px] font-black tabular-nums text-slate-900">{n}</b> 件</span>
              </div>
            ))}
          </div>
          <p className="flex items-center gap-2 rounded-xl bg-orange-50 px-4 py-3 text-[14px] font-bold text-orange-800">
            受付開始は2027年3月の予定
          </p>
          <p className="text-[12px] text-slate-500">
            出典：<a href={IPA_URL} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">情報処理推進機構（2026年10月28日更新）</a>
          </p>
          <CheckEntryButton lpId={SCS.lpId} section="stars" label="自社は何が足りない？ 1分で診断" />
        </section>

        <section className={SECTION} aria-labelledby="flow">
          <h2 id="flow" className={H2}>★3の登録までの流れ</h2>
          <ol className="grid gap-2">
            {[
              { icon: ClipboardCheck, h: '自己評価', d: '要求事項と評価基準に沿って記入' },
              { icon: PenLine, h: '確認責任者の確認・署名', d: '社内外の確認責任者が内容を確認し、署名' },
              { icon: FileCheck2, h: '自己適合宣言', d: '経営層が宣言' },
              { icon: Send, h: '登録申請', d: '制度の運営機関へ申請' },
              { icon: BadgeCheck, h: '登録・公開', d: '台帳への掲載とロゴマークの発行' },
            ].map(({ icon: I, h, d }, i) => (
              <li key={h} className="flex items-center gap-4 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-50 text-sky-700"><I size={20} aria-hidden="true" /></span>
                <span className="flex flex-col">
                  <span className="text-[15px] font-black text-slate-900"><span className="mr-1.5 text-sky-700">{i + 1}</span>{h}</span>
                  <span className="text-[13px] text-slate-500">{d}</span>
                </span>
              </li>
            ))}
          </ol>
          <CheckEntryButton lpId={SCS.lpId} section="flow" label="★3に向けて不足を確かめる（1分）" />
        </section>

        <section className={SECTION} aria-labelledby="about">
          <h2 id="about" className={H2}>このページについて</h2>
          <ul className="grid gap-3">
            {[
              { icon: Store, h: '当サイトは評価機関ではありません', d: '制度の評価・登録は行いません' },
              { icon: Handshake, h: '診断結果は紹介料に左右されません', d: '結果は回答内容だけで決まります' },
              { icon: UserRoundX, h: '個人情報の入力は不要です', d: '会社名・氏名・連絡先の入力欄はありません' },
            ].map(({ icon: I, h, d }) => (
              <li key={h} className="flex items-center gap-4 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600"><I size={22} aria-hidden="true" /></span>
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
          <div className="pt-3"><CheckEntryButton lpId={SCS.lpId} section="faq" label="準備状況を診断する（8問・1分）" /></div>
        </section>

        <p className="text-[11px] leading-relaxed text-slate-400">
          制度の内容は<a href={IPA_URL} target="_blank" rel="noopener noreferrer" className="underline">情報処理推進機構</a>と
          <a href={DIR_URL} target="_blank" rel="noopener noreferrer" className="underline">大和総研のレポート</a>をもとにしています。
          制度は運用開始に向けて準備中のため、内容が変更される場合があります。最終更新：2026年10月29日
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
