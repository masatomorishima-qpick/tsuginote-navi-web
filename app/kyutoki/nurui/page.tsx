import type { Metadata } from 'next';
import Link from 'next/link';
import { AlertTriangle, ArrowRight, Droplets, Hash, ShowerHead, Thermometer, Waves } from 'lucide-react';
import LpHeader from '@/components/lp/LpHeader';
import LpFooter from '@/components/lp/LpFooter';
import KyutokiNav from '@/components/kyutoki/KyutokiNav';
import LpViewTracker from '@/components/lp/LpViewTracker';
import { SITE_URL, SITE_NAME, ogImageUrl } from '@/components/loan/LoanArticle';
import { OyuBox, OyuSticky, PrNote } from '@/components/kyutoki/Haifu';
import DATA from '@/lib/kyutoki/haifu-data.json';

/**
 * お湯がぬるい・温度が安定しない（P20、2026-11-09 作成）。docs/seisaku-queue.md。
 *   受ける言葉：給湯器 お湯がぬるい、温度が安定しない、お湯が熱くなったり冷たくなったり。
 *   出口：お湯が出ない.com だけ（直らないときの修理）。
 * 元：東京ガス「お風呂のシャワーのお湯が出ない・お湯にならない場合の原因と対処法」。
 */
const LP_ID = 'kyutoki-nurui';
const VERSION = 'v1-2026-11-09';
const PAGE_PATH = '/kyutoki/nurui';
const TITLE = 'お湯がぬるい・温度が安定しない｜混合栓・同時使用・水量・エラー番号の4つを確かめる';
const DESCRIPTION = 'シャワーのお湯がぬるい、熱くなったり冷たくなったりするときに、まず確かめる4つ。混合栓なら給湯器の設定を50〜60℃に、ほかの水まわりとの同時使用を控える、蛇口を全開に、リモコンの番号。直らなければ故障のおそれです。';

export const metadata: Metadata = {
  title: `${TITLE} | ${SITE_NAME}`,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}${PAGE_PATH}` },
  openGraph: { title: TITLE, description: DESCRIPTION, url: `${SITE_URL}${PAGE_PATH}`, siteName: SITE_NAME, type: 'article', locale: 'ja_JP', images: [{ url: ogImageUrl(TITLE), width: 1200, height: 630, alt: TITLE }] },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, images: [ogImageUrl(TITLE)] },
};

const F = DATA.nurui;

const FAQS = [
  { q: 'シャワーが急に冷たくなります。故障ですか？', a: '台所やトイレの水を同時に使うと、水圧が変わってシャワーの温度が不安定になることがあります。故障ではなく一時的なものなので、同時に使うのを控えてみてください。' },
  { q: '設定温度どおりのお湯になりません。', a: '温度を合わせる混合栓は水と混ぜるので、設定よりぬるく出ることがあります。給湯器の設定を50〜60℃に上げて、熱いお湯が出るか試してください。' },
  { q: '試しても直らないときは？', a: '混合栓か給湯器の故障のおそれがあります。専門の業者に相談してください。給湯器の寿命は10年ほどです。' },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    { '@type': 'Article', headline: TITLE, description: DESCRIPTION, inLanguage: 'ja', dateModified: '2026-11-09T09:00:00+09:00', datePublished: '2026-11-09T09:00:00+09:00', mainEntityOfPage: `${SITE_URL}${PAGE_PATH}`, isPartOf: { '@id': `${SITE_URL}/#website` }, publisher: { '@id': `${SITE_URL}/#organization` } },
    { '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: SITE_NAME, item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: '給湯器', item: `${SITE_URL}/kyutoki` },
      { '@type': 'ListItem', position: 3, name: 'お湯がぬるい・温度が安定しない', item: `${SITE_URL}${PAGE_PATH}` },
    ] },
    { '@type': 'FAQPage', mainEntity: FAQS.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) },
  ],
};

const H2 = 'text-[22px] font-black leading-snug text-slate-900';
const SRC = 'text-[11px] leading-relaxed text-slate-500';
const A = 'underline underline-offset-2';
const POINTS = ['修理の目安は2.2万円〜（税込）', '最短30分で来てくれる', '見積もり・出張料は無料'];
const GENIN_ICONS = [Thermometer, Waves, Droplets, Hash];

export default function NuruiPage() {
  const S = DATA.sources;
  const checked = F.checkedAt.split('-').join('/');
  return (
    <div className="flex min-h-screen flex-col bg-[#f6f8fa]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <LpHeader />
      <LpViewTracker lpId={LP_ID} version={VERSION} />
      <main className="mx-auto flex w-full max-w-[520px] flex-1 flex-col gap-14 px-4 pt-4 pb-32 sm:pb-16">
        <div className="-mb-10"><PrNote /></div>
        <section className="flex flex-col gap-5" aria-labelledby="top">
          <div className="flex flex-col gap-2">
            <p className="flex items-center gap-1.5 text-[13px] font-bold text-sky-700"><ShowerHead size={16} aria-hidden="true" />お湯がぬるい・温度が安定しない</p>
            <h1 id="top" className="text-[28px] font-black leading-tight text-slate-900">ぬるいときは<br /><span className="text-orange-600">まず4つを確かめる</span></h1>
          </div>
          <ol className="grid gap-2">
            {F.genin.map((g, i) => {
              const I = GENIN_ICONS[i] ?? Thermometer;
              return (
                <li key={g.h} className="flex items-start gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-slate-200">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-700"><I size={20} aria-hidden="true" /></span>
                  <span className="flex min-w-0 flex-col gap-1">
                    <span className="text-[15px] font-black text-slate-900">{i + 1}. {g.h}</span>
                    <span className="text-[13px] leading-relaxed text-slate-600">{g.d}</span>
                    <span className="flex items-start gap-1 text-[13px] font-bold text-sky-800"><ArrowRight size={16} className="mt-0.5 shrink-0" aria-hidden="true" />{g.te}</span>
                  </span>
                </li>
              );
            })}
          </ol>
          <p className="text-[13px] text-slate-600">番号が出ているときは<Link href="/kyutoki/error" className={`${A} text-sky-800`}>エラー番号の早見</Link>へ。</p>
          <p className={SRC}>
            出典：<a href={S.tgShower.url} target="_blank" rel="noopener noreferrer" className={A}>{S.tgShower.name}</a>（{checked} 確認）
          </p>
        </section>

        <section className="flex flex-col gap-5" aria-labelledby="koshou">
          <h2 id="koshou" className={H2}>直らないとき</h2>
          <p className="flex items-start gap-2 rounded-xl bg-white p-3 text-[13px] font-bold text-slate-800 ring-1 ring-orange-200">
            <AlertTriangle size={18} className="mt-0.5 shrink-0 text-orange-600" aria-hidden="true" />{F.koshou}
          </p>
          <p className="text-[13px] text-slate-600">{F.jumyo}。長く使っているなら<Link href="/kyutoki/nensu" className={`${A} text-sky-800`}>修理か交換か</Link>も考えどきです。</p>
          <OyuBox lpId={LP_ID} position="hero" lead="直らなければ、来て見てもらう" points={POINTS} />
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
        <OyuBox lpId={LP_ID} position="bottom" lead="ぬるいまま直らないなら、来て見てもらう" points={POINTS} beacon={false} />
        <p className="text-[11px] leading-relaxed text-slate-400">設定のしかたは機種によって違います。お使いの機種の取扱説明書も確かめてください。最終更新：2026年11月9日</p>
        <KyutokiNav current={PAGE_PATH} />
      </main>
      <OyuSticky lpId={LP_ID} />
      <LpFooter />
    </div>
  );
}
