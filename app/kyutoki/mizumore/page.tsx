import type { Metadata } from 'next';
import Link from 'next/link';
import { AlertTriangle, Building2, CircleCheck, Flame, Gauge, Hammer, Home, Plug, PowerOff, Wrench } from 'lucide-react';
import LpHeader from '@/components/lp/LpHeader';
import LpFooter from '@/components/lp/LpFooter';
import KyutokiNav from '@/components/kyutoki/KyutokiNav';
import LpViewTracker from '@/components/lp/LpViewTracker';
import { SITE_URL, SITE_NAME, ogImageUrl } from '@/components/loan/LoanArticle';
import { OyuBox, OyuSticky, PrNote } from '@/components/kyutoki/Haifu';
import DATA from '@/lib/kyutoki/haifu-data.json';

/**
 * 給湯器の水漏れ（止め方と連絡先）（P19、2026-11-09 作成）。docs/seisaku-queue.md。
 *   受ける言葉：給湯器 水漏れ、給湯器 水漏れ 修理 費用、給湯器の下が濡れている。
 *   出口：お湯が出ない.com だけ（修理）。修理費の数字は紹介先の公式（目安2.2万円〜）だけ。
 * 元：東京ガスのコラム（水漏れの対処法・連絡先）、パロマ（水抜きせん兼安全弁）。
 */
const LP_ID = 'kyutoki-mizumore';
const VERSION = 'v1-2026-11-09';
const PAGE_PATH = '/kyutoki/mizumore';
const TITLE = '給湯器の水漏れ｜まず止水栓・電源・ガス栓、ポタポタが故障でないとき、連絡先';
const DESCRIPTION = '給湯器から水が漏れたら、使うのをやめて止水栓を閉め、電源プラグを抜き、ガス栓を閉めます。水抜き栓からのポタポタは圧を逃がす排水で水漏れではありません。賃貸・持ち家ごとの連絡先と、修理か交換かの目安も。';

export const metadata: Metadata = {
  title: `${TITLE} | ${SITE_NAME}`,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}${PAGE_PATH}` },
  openGraph: { title: TITLE, description: DESCRIPTION, url: `${SITE_URL}${PAGE_PATH}`, siteName: SITE_NAME, type: 'article', locale: 'ja_JP', images: [{ url: ogImageUrl(TITLE), width: 1200, height: 630, alt: TITLE }] },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, images: [ogImageUrl(TITLE)] },
};

const F = DATA.mizumore;

const FAQS = [
  { q: '給湯器の下がポタポタ濡れています。故障ですか？', a: '水抜き栓から水滴が落ちているだけなら、中の圧を逃がすための排水で、水漏れではありません。そのまま使えます。何度も出る、量が多いなど、おかしいと感じたら点検を頼んでください。' },
  { q: '賃貸です。自分で業者を呼んでいいですか？', a: 'まず大家さんか管理会社に連絡します。自分の判断で直すと、あとでもめるもとになります。だれが直すかは契約書も確かめてください。' },
  { q: '修理と交換、どちらがいいですか？', a: '使って10年未満なら、傷んだ部品を替えればまた使えるので、まず修理です。10年を超えて壊れたなら、交換を考えはじめどきです。' },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    { '@type': 'Article', headline: TITLE, description: DESCRIPTION, inLanguage: 'ja', dateModified: '2026-11-09T09:00:00+09:00', datePublished: '2026-11-09T09:00:00+09:00', mainEntityOfPage: `${SITE_URL}${PAGE_PATH}`, isPartOf: { '@id': `${SITE_URL}/#website` }, publisher: { '@id': `${SITE_URL}/#organization` } },
    { '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: SITE_NAME, item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: '給湯器', item: `${SITE_URL}/kyutoki` },
      { '@type': 'ListItem', position: 3, name: '給湯器の水漏れ', item: `${SITE_URL}${PAGE_PATH}` },
    ] },
    { '@type': 'FAQPage', mainEntity: FAQS.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) },
  ],
};

const SECTION = 'flex flex-col gap-5';
const H2 = 'text-[22px] font-black leading-snug text-slate-900';
const SRC = 'text-[11px] leading-relaxed text-slate-500';
const A = 'underline underline-offset-2';
const POINTS = ['修理の目安は2.2万円〜（税込）', '最短30分で来てくれる', '見積もり・出張料は無料'];
const TEJUN_ICONS = [PowerOff, Wrench, Plug, Flame];
const RENRAKU_ICONS = [Building2, Home, Home, Hammer];

export default function MizumorePage() {
  const S = DATA.sources;
  const checked = F.checkedAt.split('-').join('/');
  const srcTg = (
    <p className={SRC}>
      出典：<a href={S.tgMizumore.url} target="_blank" rel="noopener noreferrer" className={A}>{S.tgMizumore.name}</a>、<a href={S.tgMizumoreRenraku.url} target="_blank" rel="noopener noreferrer" className={A}>{S.tgMizumoreRenraku.name}</a>（{checked} 確認）
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
            <p className="flex items-center gap-1.5 text-[13px] font-bold text-sky-700"><Wrench size={16} aria-hidden="true" />給湯器の水漏れ</p>
            <h1 id="top" className="text-[28px] font-black leading-tight text-slate-900">水漏れは<br /><span className="text-orange-600">止水栓・電源・ガス栓</span></h1>
            <p className="flex items-start gap-1.5 text-[14px] font-bold text-red-700"><AlertTriangle size={18} className="mt-0.5 shrink-0" aria-hidden="true" />{F.kiken}</p>
          </div>
          <ol className="grid grid-cols-2 gap-2">
            {F.tejun.map((k, i) => {
              const I = TEJUN_ICONS[i] ?? Wrench;
              return (
                <li key={k.h} className="flex flex-col items-center gap-1.5 rounded-2xl bg-white p-3 text-center ring-1 ring-slate-200">
                  <span className="text-[12px] font-black text-sky-700">{i + 1}</span>
                  <I size={24} className="text-sky-700" aria-hidden="true" />
                  <span className="text-[15px] font-black leading-snug text-slate-900">{k.h}</span>
                  <span className="text-[11px] leading-snug text-slate-600">{k.d}</span>
                </li>
              );
            })}
          </ol>
          <p className="flex items-start gap-2 rounded-xl bg-white p-3 text-[13px] font-bold text-slate-800 ring-1 ring-red-200">
            <AlertTriangle size={18} className="mt-0.5 shrink-0 text-red-600" aria-hidden="true" />{F.bunkai}
          </p>
          {srcTg}
          <OyuBox lpId={LP_ID} position="hero" lead="止めたら、来て見てもらう" points={POINTS} />
        </section>

        <section className={SECTION} aria-labelledby="minaoshi">
          <h2 id="minaoshi" className={H2}>水漏れかどうかの見分け</h2>
          <ul className="grid gap-2">
            <li className="flex items-start gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-slate-200">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-700"><Gauge size={20} aria-hidden="true" /></span>
              <span className="flex flex-col gap-0.5">
                <span className="text-[15px] font-black text-slate-900">水道メーター</span>
                <span className="text-[13px] leading-relaxed text-slate-600">{F.meter}</span>
              </span>
            </li>
            <li className="flex items-start gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-emerald-200">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700"><CircleCheck size={20} aria-hidden="true" /></span>
              <span className="flex flex-col gap-0.5">
                <span className="flex flex-wrap items-center gap-x-2">
                  <span className="text-[15px] font-black text-slate-900">水抜き栓のポタポタ</span>
                  <span className="rounded-md bg-emerald-100 px-1.5 text-[11px] font-bold text-emerald-800">故障ではない</span>
                </span>
                <span className="text-[13px] leading-relaxed text-slate-600">{F.mizunuki}</span>
                <span className="text-[12px] leading-relaxed text-slate-500">{F.mizunukiNote}</span>
              </span>
            </li>
          </ul>
          <p className={SRC}>
            出典：<a href={S.tgMizumore.url} target="_blank" rel="noopener noreferrer" className={A}>{S.tgMizumore.name}</a>、<a href={S.palomaAnzen.url} target="_blank" rel="noopener noreferrer" className={A}>{S.palomaAnzen.name}</a>（{checked} 確認）
          </p>
        </section>

        <section className={SECTION} aria-labelledby="renraku">
          <h2 id="renraku" className={H2}>連絡先</h2>
          <ul className="grid gap-2">
            {F.renraku.map((r, i) => {
              const I = RENRAKU_ICONS[i] ?? Home;
              return (
                <li key={r.who} className="flex items-start gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-slate-200">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-700"><I size={20} aria-hidden="true" /></span>
                  <span className="flex min-w-0 flex-col gap-0.5">
                    <span className="text-[12px] font-bold text-slate-500">{r.who}</span>
                    <span className="text-[15px] font-black leading-snug text-slate-900">{r.to}</span>
                    <span className="text-[12px] leading-relaxed text-slate-600">{r.d}</span>
                  </span>
                </li>
              );
            })}
          </ul>
          {srcTg}
        </section>

        <section className={SECTION} aria-labelledby="nensu">
          <h2 id="nensu" className={H2}>修理か交換かの目安</h2>
          <div className="grid grid-cols-2 gap-2">
            {F.nensu.map((n, i) => (
              <div key={n.h} className={`flex flex-col gap-1 rounded-2xl p-3.5 ring-1 ${i === 0 ? 'bg-white ring-slate-200' : 'bg-orange-50 ring-orange-200'}`}>
                <span className="text-[17px] font-black text-slate-900">{n.h}</span>
                <span className="text-[12px] leading-relaxed text-slate-600">{n.d}</span>
              </div>
            ))}
          </div>
          <p className="text-[13px] text-slate-600">{F.kurikaeshi}。{F.touketsu}（<Link href="/kyutoki/touketsu" className={`${A} text-sky-800`}>凍結のとかし方と予防</Link>）。年数の考え方は<Link href="/kyutoki/nensu" className={`${A} text-sky-800`}>給湯器の寿命</Link>へ。</p>
          {srcTg}
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
        <OyuBox lpId={LP_ID} position="bottom" lead="水漏れの修理を、来て見てもらう" points={POINTS} beacon={false} />
        <p className="text-[11px] leading-relaxed text-slate-400">栓の位置や手順は機種によって違うことがあります。お使いの機種の取扱説明書も確かめてください。最終更新：2026年11月9日</p>
        <KyutokiNav current={PAGE_PATH} />
      </main>
      <OyuSticky lpId={LP_ID} />
      <LpFooter />
    </div>
  );
}
