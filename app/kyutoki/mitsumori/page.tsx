import type { Metadata } from 'next';
import Link from 'next/link';
import { DotGothic16 } from 'next/font/google';
import { CalendarCheck, ClipboardList, HardHat, Mail, PhoneOff, Receipt, Wallet } from 'lucide-react';
import LpHeader from '@/components/lp/LpHeader';
import LpFooter from '@/components/lp/LpFooter';
import LpViewTracker from '@/components/lp/LpViewTracker';
import { SITE_URL, SITE_NAME, ogImageUrl } from '@/components/loan/LoanArticle';
import MitsumoriDiagnosis from './MitsumoriDiagnosis';
import { LP_ID, VERSION } from '@/lib/kyutoki/mitsumori';

/**
 * 給湯器 B（自社の取り次ぎ）の着地ページ「見積もりの条件チェック」。2026-11-02 新設。
 *
 * 役割：交換を決めて見積もりを探している人（相見積もり・見積もり比較・交換・寿命の言葉）の着地。
 *   7問の条件チェックで「本体込みの総額の目安」を出し、1都3県のガス給湯器なら
 *   「2社から総額の見積もり（メールアドレスだけ）」を受け付ける。
 * お湯が出ない（急ぎ）の人は /kyutoki/oyu-ga-denai のまま。A（記事型 /kyutoki/kokan-hiyou）とも混ぜない。
 * 設計の根拠：docs/kyutoki-b/page-design.md
 */

const PAGE_PATH = '/kyutoki/mitsumori';
const TITLE = '給湯器の交換、2社の見積もりを比べる｜総額の目安が30秒でわかる';
const DESCRIPTION =
  'ガス給湯器の交換で、本体込みの総額の目安が30秒でわかります。東京・神奈川・千葉・埼玉なら、条件に合う工事会社2社から無料で見積もりを受け取れます。';

const lcdFont = DotGothic16({ weight: '400', subsets: ['latin'], display: 'swap', preload: false });

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
  { q: '費用はかかりますか？', a: '見積もりまでは無料です。見積もりを見て断っても、費用はかかりません。当サイトは、工事会社から紹介料を受け取っています。' },
  { q: '電話がかかってきますか？', a: 'やり取りはメールで進めます。日程が決まるまで、工事会社に電話番号はお伝えしません。' },
  { q: 'どんな会社を紹介してもらえますか？', a: '1都3県の給湯器の工事会社のうち、お住まいの地域とご希望の時期に合う2社を選びます。' },
  { q: '写真は必要ですか？', a: '本体のラベル（号数と製造年が書いてある所）の写真があると、見積もりが正確になります。受付のあとにメールでお願いします。' },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage', '@id': `${SITE_URL}${PAGE_PATH}#webpage`, url: `${SITE_URL}${PAGE_PATH}`,
      name: TITLE, description: DESCRIPTION, inLanguage: 'ja', dateModified: '2026-11-02T09:00:00+09:00',
      isPartOf: { '@id': `${SITE_URL}/#website` }, publisher: { '@id': `${SITE_URL}/#organization` },
    },
    {
      '@type': 'FAQPage',
      mainEntity: FAQS.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
    },
  ],
};

const SECTION = 'flex flex-col gap-5';
const H2 = 'text-[22px] font-black leading-snug text-slate-900';

export default function MitsumoriPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#f6f8fa]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <LpHeader />
      <LpViewTracker lpId={LP_ID} version={VERSION} />

      <main className="mx-auto flex w-full max-w-[520px] flex-1 flex-col gap-14 px-4 pt-4 pb-16">
        <p className="-mb-10 flex flex-wrap items-center gap-x-2 text-[11px] text-slate-500">
          <span className="rounded border border-slate-300 px-1.5 tracking-widest">PR</span>
          <span>当サイトは工事会社から紹介料を受け取っています<span className="whitespace-nowrap">（工事は行いません）</span></span>
          <Link href="/policy" className="text-sky-800 underline underline-offset-2">中立性ポリシー</Link>
        </p>

        <section className="flex flex-col gap-5">
          <div className="flex flex-col gap-3">
            <span className="self-start rounded-full bg-white px-3 py-1 text-xs font-bold text-sky-800 ring-1 ring-sky-200">ガス給湯器の交換</span>
            <h1 className="text-[34px] font-black leading-[1.1] tracking-tight text-slate-900 min-[380px]:text-[40px]">
              <span className="whitespace-nowrap">見積もりは</span><br /><span className="whitespace-nowrap">2社で比べる</span>
            </h1>
            <p className="text-[18px] font-bold leading-snug text-slate-700">
              30秒で<span className="text-orange-600">総額の目安</span>。<br />2社の見積もりも無料。
            </p>
          </div>
          <MitsumoriDiagnosis lcdFontClass={lcdFont.className} />
        </section>

        <section className={SECTION} aria-labelledby="nagare">
          <h2 id="nagare" className={H2}>見積もりまでの流れ</h2>
          <ol className="grid gap-3">
            {[
              { icon: ClipboardList, h: '条件を選ぶ', d: '30秒。総額の目安が出ます' },
              { icon: Mail, h: 'メールで確認', d: '市区町村と本体の写真だけ' },
              { icon: CalendarCheck, h: '日程を決める', d: '2社の候補日から選ぶ' },
              { icon: Receipt, h: '現地で見積もり', d: '本体込みの総額で比べる' },
            ].map(({ icon: I, h, d }, i) => (
              <li key={h} className="flex items-center gap-4 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-orange-50 text-orange-700">
                  <I size={22} aria-hidden="true" />
                  <span className="absolute -top-1 -left-1 flex h-5 w-5 items-center justify-center rounded-full bg-orange-600 text-[11px] font-bold text-white">{i + 1}</span>
                </span>
                <span className="flex flex-col">
                  <span className="text-[15px] font-black text-slate-900">{h}</span>
                  <span className="text-[13px] text-slate-500">{d}</span>
                </span>
              </li>
            ))}
          </ol>
        </section>

        <section className={SECTION} aria-labelledby="about">
          <h2 id="about" className={H2}>このページについて</h2>
          <ul className="grid grid-cols-2 gap-3">
            {[
              { icon: HardHat, h: '工事は行いません', d: '工事会社を紹介する第三者です' },
              { icon: PhoneOff, h: '突然の電話なし', d: '日程が決まるまで番号は伝えません' },
              { icon: Wallet, h: '見積もりまで無料', d: '断っても費用はかかりません' },
              { icon: Receipt, h: '本体込みの総額', d: '工事費だけの金額で比べない' },
            ].map(({ icon: I, h, d }) => (
              <li key={h} className="flex flex-col gap-2 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-700"><I size={22} aria-hidden="true" /></span>
                <span className="text-[15px] font-black text-slate-900">{h}</span>
                <span className="text-[12px] leading-snug text-slate-600">{d}</span>
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
          総額の目安は一般的な相場で、実際の金額は現地で確かめます。工事の契約は、お客さまと工事会社の間で結びます。最終更新：2026年11月2日
        </p>
      </main>
      <LpFooter />
    </div>
  );
}
