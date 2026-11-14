import type { Metadata } from 'next';
import Link from 'next/link';
import { AlertTriangle, CalendarClock, Package, Search, Wrench } from 'lucide-react';
import LpHeader from '@/components/lp/LpHeader';
import LpFooter from '@/components/lp/LpFooter';
import KyutokiNav from '@/components/kyutoki/KyutokiNav';
import LpViewTracker from '@/components/lp/LpViewTracker';
import { SITE_URL, SITE_NAME, ogImageUrl } from '@/components/loan/LoanArticle';
import { HaifuDownload, OyuBox, OyuSticky, PrNote } from '@/components/kyutoki/Haifu';
import DATA from '@/lib/kyutoki/haifu-data.json';

/**
 * 給湯器の寿命・使った年数（修理か交換か）（P14、2026-11-07 公開）。docs/kyutoki-seo/schedule.md。
 *   受ける言葉：給湯器 寿命（8,100）・耐用年数（1,600）・交換時期、給湯器 10年／15年／20年 交換 費用、築20年 など85語。
 *   出口：お湯が出ない.com だけ（修理も交換も受ける）。
 * 元：メーカー10社の資料（設計標準使用期間10年・10年点検は有料）、ガス石油機器PLセンター（安全に使える目安約10年・部品は製造をやめて7年ほど）、
 *   お湯が出ない.com 公式（耐用年数7〜10年、88・888 の表示）。
 */
const LP_ID = 'kyutoki-nensu';
const VERSION = 'v1-2026-11-07';
const PAGE_PATH = '/kyutoki/nensu';
const TITLE = '給湯器の寿命は約10年｜使った年数で決める、修理か交換か（「88」「888」の表示も）';
const DESCRIPTION = 'ガス給湯器の寿命（耐用年数）は約10年が目安。使った年数ごとの、修理か交換かの決め方。修理用の部品がある期間、10年点検、リモコンの「88」「888」の意味、製造年の見方まで。';

export const metadata: Metadata = {
  title: `${TITLE} | ${SITE_NAME}`,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}${PAGE_PATH}` },
  openGraph: { title: TITLE, description: DESCRIPTION, url: `${SITE_URL}${PAGE_PATH}`, siteName: SITE_NAME, type: 'article', locale: 'ja_JP', images: [{ url: ogImageUrl(TITLE), width: 1200, height: 630, alt: TITLE }] },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, images: [ogImageUrl(TITLE)] },
};

const FAQS = [
  { q: '15年・20年使っていますが、まだ動きます。', a: '動いていても、10年を超えると傷みによる故障や事故のおそれが高まるとメーカーは説明しています。修理用の部品がなくなっていることも多いので、壊れて急ぐ前に交換の見積もりを取っておくと安心です。' },
  { q: '製造年はどこで分かりますか？', a: '本体の横や前に貼ってある銘板（シール）に、型番と製造年月が書いてあります。リモコンではなく本体を見てください。' },
  { q: '「88」「888」が出たら、すぐ交換ですか？', a: '故障ではなく、点検の時期のお知らせです。お湯は使えます。点検（有料）を受けるか、交換を考えるきっかけにしてください。' },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    { '@type': 'Article', headline: TITLE, description: DESCRIPTION, inLanguage: 'ja', dateModified: '2026-11-07T09:00:00+09:00', datePublished: '2026-11-07T09:00:00+09:00', mainEntityOfPage: `${SITE_URL}${PAGE_PATH}`, isPartOf: { '@id': `${SITE_URL}/#website` }, publisher: { '@id': `${SITE_URL}/#organization` } },
    { '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: SITE_NAME, item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: '給湯器', item: `${SITE_URL}/kyutoki` },
      { '@type': 'ListItem', position: 3, name: '給湯器の寿命', item: `${SITE_URL}${PAGE_PATH}` },
    ] },
    { '@type': 'FAQPage', mainEntity: FAQS.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) },
  ],
};

const SECTION = 'flex flex-col gap-5';
const H2 = 'text-[22px] font-black leading-snug text-slate-900';
const SRC = 'text-[11px] leading-relaxed text-slate-500';
const A = 'underline underline-offset-2';
const POINTS = ['修理も交換も相談できる（見積もり無料）', '最短30分で来てくれる', '修理の目安は2.2万円〜（税込）'];

export default function NensuPage() {
  const S = DATA.sources;
  const J = DATA.jumyo;
  const checked = DATA.checkedAt.split('-').join('/');
  return (
    <div className="flex min-h-screen flex-col bg-[#f6f8fa]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <LpHeader />
      <LpViewTracker lpId={LP_ID} version={VERSION} />
      <main className="mx-auto flex w-full max-w-[520px] flex-1 flex-col gap-14 px-4 pt-4 pb-32 sm:pb-16">
        <div className="-mb-10"><PrNote /></div>
        <section className="flex flex-col gap-5" aria-labelledby="top">
          <div className="flex flex-col gap-2">
            <p className="text-[13px] font-bold text-sky-700">ガス給湯器の寿命</p>
            <h1 id="top" className="text-[28px] font-black leading-tight text-slate-900">給湯器の寿命は約10年<br /><span className="text-orange-600">使った年数で決める</span></h1>
          </div>
          <ol className="grid gap-2">
            {[
              { y: '7年未満', h: 'まず修理', d: '修理用の部品があることが多い' },
              { y: '7〜9年', h: '修理と交換、両方の見積もり', d: '直しても、ほかが傷みやすい' },
              { y: '10年以上', h: '交換を考える', d: '安全に使える目安を過ぎている' },
            ].map((r) => (
              <li key={r.y} className="flex items-center gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-slate-200">
                <span className="w-[72px] shrink-0 text-center text-[16px] font-black text-sky-800">{r.y}</span>
                <span className="flex flex-col">
                  <span className="text-[15px] font-black text-slate-900">{r.h}</span>
                  <span className="text-[12px] text-slate-600">{r.d}</span>
                </span>
              </li>
            ))}
          </ol>
          <p className={SRC}>
            区切りの元：<a href={S.plCenter.url} target="_blank" rel="noopener noreferrer" className={A}>{S.plCenter.name}</a>（安全に使える目安約10年・部品の保有期間）、
            <a href={S.oyuDenai.url} target="_blank" rel="noopener noreferrer" className={A}>{S.oyuDenai.name}</a>（耐用年数7〜10年）
          </p>
          <OyuBox lpId={LP_ID} position="hero" lead="修理か交換か、来て見てもらう" points={POINTS} />
        </section>

        <section className={SECTION} aria-labelledby="riyu">
          <h2 id="riyu" className={H2}>10年の理由</h2>
          <ul className="grid gap-2">
            {[
              { icon: CalendarClock, t: J.sekkei },
              { icon: AlertTriangle, t: J.anzen },
              { icon: Package, t: J.buhin },
              { icon: Wrench, t: J.tenken },
            ].map(({ icon: I, t }) => (
              <li key={t} className="flex items-start gap-3 rounded-2xl bg-white p-3.5 text-[14px] text-slate-800 ring-1 ring-slate-200">
                <I size={20} className="mt-0.5 shrink-0 text-sky-700" aria-hidden="true" />{t}
              </li>
            ))}
          </ul>
          <p className={SRC}>
            出典：<a href={S.jumyoKyokai.url} target="_blank" rel="noopener noreferrer" className={A}>{S.jumyoKyokai.name}</a>・
            <a href={S.plCenter.url} target="_blank" rel="noopener noreferrer" className={A}>{S.plCenter.name}</a>（{checked} 確認）
          </p>
        </section>

        <section className={SECTION} aria-labelledby="hyoji">
          <h2 id="hyoji" className={H2}>「88」「888」の表示</h2>
          <div className="flex items-center gap-4 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
            <span className="rounded-xl bg-slate-900 px-3 py-2 font-mono text-[26px] font-black tracking-widest text-emerald-400">888</span>
            <span className="text-[14px] text-slate-800">{J.hyoji}</span>
          </div>
          <p className={SRC}>出典：<a href={S.oyuDenai.url} target="_blank" rel="noopener noreferrer" className={A}>{S.oyuDenai.name}</a>（{checked} 確認）</p>
        </section>

        <section className={SECTION} aria-labelledby="mikata">
          <h2 id="mikata" className={H2}>製造年の見方</h2>
          <p className="flex items-start gap-3 rounded-2xl bg-sky-50 p-4 text-[14px] text-slate-800 ring-1 ring-sky-200">
            <Search size={20} className="mt-0.5 shrink-0 text-sky-700" aria-hidden="true" />本体に貼ってある銘板（シール）に、型番と製造年月が書いてあります。
          </p>
          <p className="text-[14px] text-slate-700">交換するときの総額は、下の目安表で確かめられます。号数は<Link href="/kyutoki/gosu-erabikata" className={`${A} text-sky-800`}>号数の選び方</Link>へ。</p>
          <HaifuDownload main="hiyou" others={['check']} />
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
        <OyuBox lpId={LP_ID} position="bottom" lead="10年を過ぎていたら、壊れる前に見積もり" points={POINTS} beacon={false} />
        <p className="text-[11px] leading-relaxed text-slate-400">年数の区切りは目安です。最終更新：2026年11月7日</p>
        <KyutokiNav current={PAGE_PATH} />
      </main>
      <OyuSticky lpId={LP_ID} />
      <LpFooter />
    </div>
  );
}
