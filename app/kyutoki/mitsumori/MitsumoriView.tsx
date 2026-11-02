import Link from 'next/link';
import { DotGothic16 } from 'next/font/google';
import { CalendarCheck, ClipboardList, HardHat, Mail, Receipt, Scale, ShieldCheck } from 'lucide-react';
import LpHeader from '@/components/lp/LpHeader';
import LpFooter from '@/components/lp/LpFooter';
import LpViewTracker from '@/components/lp/LpViewTracker';
import { SITE_URL } from '@/components/loan/LoanArticle';
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

export const PAGE_PATH = '/kyutoki/mitsumori';
export const TITLE = '給湯器の交換の総額、妥当か10秒で確かめる｜ガス給湯器';
export const DESCRIPTION =
  'ガス給湯器の交換で、本体込みの総額の目安が2問・10秒でわかります。手元の見積もりが妥当か、2社の見積もりで確かめられます。';

const lcdFont = DotGothic16({ weight: '400', subsets: ['latin'], display: 'swap', preload: false });


const FAQS = [
  { q: '総額の目安は、どこの数字ですか？', a: '東京ガスが公表している相場（工事費込み・税込）です。号数や置き場所で変わるので、正確な金額は見積もりで確かめます。' },
  { q: '費用はかかりますか？', a: '目安を見るのも、見積もりを頼むのも無料です。当サイトは、工事会社から紹介料を受け取る形で運営します。' },
  { q: 'どんな会社を紹介してもらえますか？', a: '1都3県の給湯器の工事会社のうち、保証・資格・自社施工・追加費用の扱いを確かめた会社だけを紹介します。' },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage', '@id': `${SITE_URL}${PAGE_PATH}#webpage`, url: `${SITE_URL}${PAGE_PATH}`,
      name: TITLE, description: DESCRIPTION, inLanguage: 'ja', dateModified: '2026-11-03T09:00:00+09:00',
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

export type Hero = 'default' | 'jumyo' | 'hiyou';
const HEROS: Record<Hero, { tag: string; h1: [string, string]; sub: [string, string, string] }> = {
  default: { tag: 'ガス給湯器の交換', h1: ['交換の総額', '妥当？'], sub: ['2問・10秒で', '総額の目安', '。'] },
  jumyo: { tag: 'ガス給湯器の替えどき', h1: ['替えるなら', 'いくら？'], sub: ['2問・10秒で', '総額の目安', '。'] },
  hiyou: { tag: 'ガス給湯器の交換費用', h1: ['その見積もり', '妥当？'], sub: ['相場の', '総額', 'と比べる。'] },
};

export function MitsumoriView({ hero = 'default' }: { hero?: Hero }) {
  const h = HEROS[hero];
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
            <span className="self-start rounded-full bg-white px-3 py-1 text-xs font-bold text-sky-800 ring-1 ring-sky-200">{h.tag}</span>
            <h1 className="text-[34px] font-black leading-[1.1] tracking-tight text-slate-900 min-[380px]:text-[40px]">
              <span className="whitespace-nowrap">{h.h1[0]}</span><br /><span className="whitespace-nowrap">{h.h1[1]}</span>
            </h1>
            <p className="text-[18px] font-bold leading-snug text-slate-700">
              {h.sub[0]}<span className="text-orange-600">{h.sub[1]}</span>{h.sub[2]}
            </p>
          </div>
          <MitsumoriDiagnosis lcdFontClass={lcdFont.className} entry={hero === 'default' ? 'mitsumori' : hero} />
        </section>

        <section className={SECTION} aria-labelledby="nagare">
          <h2 id="nagare" className={H2}>見積もりまでの流れ</h2>
          <ol className="grid gap-3">
            {[
              { icon: ClipboardList, h: '2問に答える', d: '10秒。総額の目安が出ます' },
              { icon: Mail, h: '写真を送る', d: '本体と、ラベルの2枚' },
              { icon: CalendarCheck, h: '見積もりが届く', d: '本体込みの総額で' },
              { icon: Receipt, h: '妥当かを確かめる', d: '相場と並べて比べる' },
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
              { icon: Receipt, h: '本体込みの総額', d: '工事費だけの金額で比べない' },
              { icon: Scale, h: '妥当かが分かる', d: '相場と見積もりを並べて確かめる' },
              { icon: ShieldCheck, h: '選ぶ基準を公開', d: '保証・資格・自社施工・追加費用' },
              { icon: HardHat, h: '工事は行いません', d: '工事会社を紹介する第三者です' },
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
          総額の目安は一般的な相場で、実際の金額は現地で確かめます。工事の契約は、お客さまと工事会社の間で結びます。最終更新：2026年11月3日
        </p>
      </main>
      <LpFooter />
    </div>
  );
}

