import type { Metadata } from 'next';
import Link from 'next/link';
import { AlertTriangle, Droplets, Hourglass, Plug, PowerOff, Search, Snowflake, Wind } from 'lucide-react';
import LpHeader from '@/components/lp/LpHeader';
import LpFooter from '@/components/lp/LpFooter';
import LpViewTracker from '@/components/lp/LpViewTracker';
import { SITE_URL, SITE_NAME, ogImageUrl } from '@/components/loan/LoanArticle';
import { OyuBox, OyuSticky, PrNote } from '@/components/kyutoki/Haifu';
import DATA from '@/lib/kyutoki/haifu-data.json';

/**
 * 給湯器の凍結（とかし方と予防）（P18、2026-11-08 作成）。docs/seisaku-queue.md。
 *   受ける言葉：給湯器 凍結、給湯器 凍結 解凍、給湯器 凍結 防止、お湯も水も出ない 冬。冬（12〜2月）に検索が増える。
 *   出口：お湯が出ない.com だけ（とけたあとに水漏れ・エラーがあるときの修理）。
 * 元：リンナイ「メンテナンスについて（給湯器の凍結予防と対策）」。
 */
const LP_ID = 'kyutoki-touketsu';
const VERSION = 'v1-2026-11-08';
const PAGE_PATH = '/kyutoki/touketsu';
const TITLE = '給湯器が凍結したら｜お湯をかけずに待つ、とかし方と予防（電源を抜かない・水を流す）';
const DESCRIPTION = '給湯器からお湯も水も出ないときは凍結のおそれ。リモコンを切り、コンセントは抜かずに、自然にとけるのを待ちます。配管にお湯をかけるのは壊れるもと。凍結で壊れると保証の期間内でも有料です。予防のしかたも、メーカーの説明で。';

export const metadata: Metadata = {
  title: `${TITLE} | ${SITE_NAME}`,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}${PAGE_PATH}` },
  openGraph: { title: TITLE, description: DESCRIPTION, url: `${SITE_URL}${PAGE_PATH}`, siteName: SITE_NAME, type: 'article', locale: 'ja_JP', images: [{ url: ogImageUrl(TITLE), width: 1200, height: 630, alt: TITLE }] },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, images: [ogImageUrl(TITLE)] },
};

const F = DATA.touketsu;

const FAQS = [
  { q: '凍結か故障か、どう見分けますか？', a: 'お湯も水も出ないときは、凍結のおそれがあります。水は出るのにお湯だけ出ないときや、リモコンに番号が出ているときは、エラー番号の早見で確かめてください。' },
  { q: '雪の少ない地域でも凍りますか？', a: '凍ります。暖かい地方でも、冬は配管の水が凍って壊れることがあるとメーカーは説明しています。冷えこむ予報の日は、前の晩に予防をしておくと安心です。' },
  { q: '凍結で壊れたら、保証で直せますか？', a: '凍結で壊れたときは、保証の期間内でも有料の修理になるとメーカーは説明しています。とけたあとに水漏れがあるときは、使わずに修理を頼んでください。' },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    { '@type': 'Article', headline: TITLE, description: DESCRIPTION, inLanguage: 'ja', dateModified: '2026-11-08T09:00:00+09:00', datePublished: '2026-11-08T09:00:00+09:00', mainEntityOfPage: `${SITE_URL}${PAGE_PATH}`, isPartOf: { '@id': `${SITE_URL}/#website` }, publisher: { '@id': `${SITE_URL}/#organization` } },
    { '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: SITE_NAME, item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: 'ガス給湯器の交換費用', item: `${SITE_URL}/kyutoki/kokan-hiyou` },
      { '@type': 'ListItem', position: 3, name: '給湯器の凍結', item: `${SITE_URL}${PAGE_PATH}` },
    ] },
    { '@type': 'FAQPage', mainEntity: FAQS.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) },
  ],
};

const SECTION = 'flex flex-col gap-5';
const H2 = 'text-[22px] font-black leading-snug text-slate-900';
const SRC = 'text-[11px] leading-relaxed text-slate-500';
const A = 'underline underline-offset-2';
const POINTS = ['修理の目安は2.2万円〜（税込）', '最短30分で来てくれる', '見積もり・出張料は無料'];
const KAITO_ICONS = [PowerOff, Hourglass, Search];
const YOBOU_ICONS = [Plug, Droplets, Wind, Snowflake];

export default function TouketsuPage() {
  const S = DATA.sources;
  const checked = F.checkedAt.split('-').join('/');
  const src = (
    <p className={SRC}>
      出典：<a href={S.rinnaiTouketsu.url} target="_blank" rel="noopener noreferrer" className={A}>{S.rinnaiTouketsu.name}</a>（{checked} 確認）
    </p>
  );
  return (
    <div className="flex min-h-screen flex-col bg-[#f6f8fa]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <LpHeader />
      <LpViewTracker lpId={LP_ID} version={VERSION} />
      <main className="mx-auto flex w-full max-w-[520px] flex-1 flex-col gap-14 px-4 pt-4 pb-32 sm:pb-16">
        <div className="-mb-10"><PrNote /></div>
        <section className="flex flex-col gap-5" aria-labelledby="top">
          <div className="flex flex-col gap-2">
            <p className="flex items-center gap-1.5 text-[13px] font-bold text-sky-700"><Snowflake size={16} aria-hidden="true" />給湯器の凍結</p>
            <h1 id="top" className="text-[28px] font-black leading-tight text-slate-900">凍ったら<br /><span className="text-orange-600">お湯をかけずに待つ</span></h1>
            <p className="text-[14px] text-slate-700">{F.sain}</p>
          </div>
          <ol className="grid grid-cols-3 gap-2">
            {F.kaito.map((k, i) => {
              const I = KAITO_ICONS[i] ?? Hourglass;
              return (
                <li key={k.h} className="flex flex-col items-center gap-1.5 rounded-2xl bg-white p-3 text-center ring-1 ring-slate-200">
                  <span className="text-[12px] font-black text-sky-700">{i + 1}</span>
                  <I size={24} className="text-sky-700" aria-hidden="true" />
                  <span className="text-[14px] font-black leading-snug text-slate-900">{k.h}</span>
                  <span className="text-[11px] leading-snug text-slate-600">{k.d}</span>
                </li>
              );
            })}
          </ol>
          <ul className="grid gap-2">
            {[F.dame, F.yuryo].map((t) => (
              <li key={t} className="flex items-start gap-2 rounded-xl bg-white p-3 text-[13px] font-bold text-slate-800 ring-1 ring-red-200">
                <AlertTriangle size={18} className="mt-0.5 shrink-0 text-red-600" aria-hidden="true" />{t}
              </li>
            ))}
          </ul>
          {src}
          <OyuBox lpId={LP_ID} position="hero" lead="とけても水漏れ・エラーなら、来て見てもらう" points={POINTS} />
        </section>

        <section className={SECTION} aria-labelledby="yobou">
          <h2 id="yobou" className={H2}>凍結の予防</h2>
          <ol className="grid gap-2">
            {F.yobou.map((y, i) => {
              const I = YOBOU_ICONS[i] ?? Snowflake;
              return (
                <li key={y.h} className="flex items-start gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-slate-200">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-700"><I size={20} aria-hidden="true" /></span>
                  <span className="flex flex-col gap-0.5">
                    <span className="flex flex-wrap items-center gap-x-2">
                      <span className="text-[15px] font-black text-slate-900">{i + 1}. {y.h}</span>
                      <span className={`rounded-md px-1.5 text-[11px] font-bold ${y.tsuki === 'ふだん' ? 'bg-slate-100 text-slate-600' : 'bg-sky-100 text-sky-800'}`}>{y.tsuki}</span>
                    </span>
                    <span className="text-[13px] leading-relaxed text-slate-600">{y.d}</span>
                  </span>
                </li>
              );
            })}
          </ol>
          <p className="flex items-start gap-2 rounded-xl bg-sky-50 p-3 text-[13px] text-slate-800 ring-1 ring-sky-200">
            <Wind size={18} className="mt-0.5 shrink-0 text-sky-700" aria-hidden="true" />{F.yobouNote}
          </p>
          <p className="text-[13px] text-slate-600">{F.atatakai}。{F.kishuNote}。</p>
          {src}
        </section>

        <section className={SECTION} aria-labelledby="tokeTara">
          <h2 id="tokeTara" className={H2}>とけたあと</h2>
          <p className="text-[14px] text-slate-700">水漏れがあるときは使わずに修理を頼みます。リモコンに番号が出ているときは<Link href="/kyutoki/error" className={`${A} text-sky-800`}>エラー番号の早見</Link>へ。10年以上使っているなら、<Link href="/kyutoki/nensu" className={`${A} text-sky-800`}>修理か交換か</Link>も考えどきです。</p>
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
        <OyuBox lpId={LP_ID} position="bottom" lead="凍結で壊れたら、来て見てもらう" points={POINTS} beacon={false} />
        <p className="text-[11px] leading-relaxed text-slate-400">手順は機種によって違うことがあります。お使いの機種の取扱説明書も確かめてください。最終更新：2026年11月8日</p>
      </main>
      <OyuSticky lpId={LP_ID} />
      <LpFooter />
    </div>
  );
}
