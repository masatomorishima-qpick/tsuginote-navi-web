import type { Metadata } from 'next';
import Link from 'next/link';
import { Building2, Camera, CalendarClock, Gauge, Layers, Tag } from 'lucide-react';
import LpHeader from '@/components/lp/LpHeader';
import LpFooter from '@/components/lp/LpFooter';
import LpViewTracker from '@/components/lp/LpViewTracker';
import { SITE_URL, SITE_NAME, ogImageUrl } from '@/components/loan/LoanArticle';
import { HaifuDownload, OyuBox, OyuSticky, PrNote } from '@/components/kyutoki/Haifu';
import KatabanCheck from '@/components/kyutoki/KatabanCheck';
import DATA from '@/lib/kyutoki/haifu-data.json';

/**
 * 給湯器の型番の見方と、後継機種の選び方（P10、2026-11-08 作成）。docs/seisaku-queue.md（予定のパスは /kyutoki/katabang だったが、読みどおり kataban にした）。
 *   受ける言葉：給湯器 型番 見方、GT-2427SAWX 後継機種、RUF-A2400SAW 交換 など型番で探す人。
 *   出口：お湯が出ない.com だけ。
 * 型番ごとの後継機種の対応表は載せない：メーカーの後継機種の検索は業者向け（ノーリツは 2026年3月からログイン必須）で、
 *   一次情報として確かめられないため。代わりに型番から号数とエコジョーズかを読む道具（KatabanCheck）を置く。
 * 元：東京ガス（号数・エコジョーズの読み方、同じ号数・種類・メーカーで選ぶ、写真で交換できる商品を出す）、ノーリツのよくあるご質問。
 */
const LP_ID = 'kyutoki-kataban';
const VERSION = 'v1-2026-11-08';
const PAGE_PATH = '/kyutoki/kataban';
const TITLE = '給湯器の型番の見方｜号数・エコジョーズが分かる、後継機種の選び方';
const DESCRIPTION = 'ガス給湯器の型番を入れると、号数（16・20・24号）とエコジョーズかが分かります。交換するときは、号数・種類・メーカーを今と同じにするのが基本。後継機種の調べ方も。';

export const metadata: Metadata = {
  title: `${TITLE} | ${SITE_NAME}`,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}${PAGE_PATH}` },
  openGraph: { title: TITLE, description: DESCRIPTION, url: `${SITE_URL}${PAGE_PATH}`, siteName: SITE_NAME, type: 'article', locale: 'ja_JP', images: [{ url: ogImageUrl(TITLE), width: 1200, height: 630, alt: TITLE }] },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, images: [ogImageUrl(TITLE)] },
};

const K = DATA.kataban;

const FAQS = [
  { q: '型番で、そのまま後継機種が分かりますか？', a: 'メーカーの後継機種の検索は業者向けで、ノーリツは2026年3月からログインが要るようになりました。個人ならメーカーの相談窓口か、見積もりを頼む会社に型番と写真を見せるのが早道です。' },
  { q: '号数を下げて安くしてもいいですか？', a: '号数を下げると、台所とお風呂などで同時にお湯を使うときに、出が悪くなることがあります。東京ガスは同じ号数での交換をすすめています。' },
  { q: 'ほかのメーカーに替えられますか？', a: '大きさや配管が合わないことがあるため、基本は同じメーカーでの交換がすすめられています。替えられるかは、写真や現地で確かめてもらいます。' },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    { '@type': 'Article', headline: TITLE, description: DESCRIPTION, inLanguage: 'ja', dateModified: '2026-11-08T09:00:00+09:00', datePublished: '2026-11-08T09:00:00+09:00', mainEntityOfPage: `${SITE_URL}${PAGE_PATH}`, isPartOf: { '@id': `${SITE_URL}/#website` }, publisher: { '@id': `${SITE_URL}/#organization` } },
    { '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: SITE_NAME, item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: 'ガス給湯器の交換費用', item: `${SITE_URL}/kyutoki/kokan-hiyou` },
      { '@type': 'ListItem', position: 3, name: '給湯器の型番の見方', item: `${SITE_URL}${PAGE_PATH}` },
    ] },
    { '@type': 'FAQPage', mainEntity: FAQS.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) },
  ],
};

const SECTION = 'flex flex-col gap-5';
const H2 = 'text-[22px] font-black leading-snug text-slate-900';
const SRC = 'text-[11px] leading-relaxed text-slate-500';
const A = 'underline underline-offset-2';
const POINTS = ['見積もり・出張料は無料', '最短30分で来てくれる', '修理できないときは、その日のうちに交換'];
const ERABU_ICONS = [Gauge, Layers, Building2];
const KOUKEI_ICONS = [Tag, Camera, CalendarClock];

export default function KatabanPage() {
  const S = DATA.sources;
  const checked = K.checkedAt.split('-').join('/');
  return (
    <div className="flex min-h-screen flex-col bg-[#f6f8fa]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <LpHeader />
      <LpViewTracker lpId={LP_ID} version={VERSION} />
      <main className="mx-auto flex w-full max-w-[520px] flex-1 flex-col gap-14 px-4 pt-4 pb-32 sm:pb-16">
        <div className="-mb-10"><PrNote /></div>
        <section className="flex flex-col gap-5" aria-labelledby="top">
          <div className="flex flex-col gap-2">
            <p className="text-[13px] font-bold text-sky-700">給湯器の型番の見方</p>
            <h1 id="top" className="text-[28px] font-black leading-tight text-slate-900">型番で分かる<br /><span className="text-orange-600">号数とエコジョーズ</span></h1>
          </div>
          <KatabanCheck lpId={LP_ID} />
          <p className={SRC}>読み方の元：<a href={S.tgWhat.url} target="_blank" rel="noopener noreferrer" className={A}>{S.tgWhat.name}</a>・<a href={S.tgHowto.url} target="_blank" rel="noopener noreferrer" className={A}>{S.tgHowto.name}</a>（{checked} 確認）。入れた型番は送られません。</p>
          <OyuBox lpId={LP_ID} position="hero" lead="今と同じ型で、来て見積もり" points={POINTS} />
        </section>

        <section className={SECTION} aria-labelledby="yomikata">
          <h2 id="yomikata" className={H2}>型番の読み方</h2>
          <p className="rounded-2xl bg-sky-50 p-4 text-[14px] text-slate-800 ring-1 ring-sky-200">{K.basho}</p>
          <div className="flex flex-col gap-2 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
            <p className="text-[15px] font-black text-slate-900">号数：{K.gosuRule}</p>
            <ul className="grid gap-1.5">
              {K.gosuEx.map((g) => (
                <li key={g.g} className="flex items-center gap-3 text-[13px] text-slate-700">
                  <span className="w-[48px] shrink-0 rounded-lg bg-sky-50 py-0.5 text-center font-black text-sky-800">{g.g}号</span>
                  <span className="font-mono">{g.ex}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col gap-2 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
            <p className="text-[15px] font-black text-slate-900">エコジョーズ：{K.ecoNote}</p>
            <ul className="grid gap-1.5">
              {K.ecoRule.map((e) => (
                <li key={e.maker} className="flex items-center gap-3 text-[13px] text-slate-700">
                  <span className="w-[64px] shrink-0 font-bold text-slate-800">{e.maker}</span>
                  <span className="w-[28px] shrink-0 rounded-lg bg-emerald-50 py-0.5 text-center font-black text-emerald-700">{e.s}</span>
                  <span className="font-mono">{e.ex}</span>
                </li>
              ))}
            </ul>
          </div>
          <p className={SRC}>出典：<a href={S.tgWhat.url} target="_blank" rel="noopener noreferrer" className={A}>{S.tgWhat.name}</a>・<a href={S.tgHowto.url} target="_blank" rel="noopener noreferrer" className={A}>{S.tgHowto.name}</a>（{checked} 確認）</p>
        </section>

        <section className={SECTION} aria-labelledby="erabu">
          <h2 id="erabu" className={H2}>交換するときに合わせる3つ</h2>
          <ul className="grid gap-2">
            {K.erabu.map((e, i) => {
              const I = ERABU_ICONS[i] ?? Gauge;
              return (
                <li key={e.h} className="flex items-start gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-slate-200">
                  <I size={20} className="mt-0.5 shrink-0 text-sky-700" aria-hidden="true" />
                  <span className="flex flex-col">
                    <span className="text-[15px] font-black text-slate-900">{e.h}</span>
                    <span className="text-[13px] text-slate-600">{e.d}</span>
                  </span>
                </li>
              );
            })}
          </ul>
          <p className={SRC}>出典：<a href={S.tgWhat.url} target="_blank" rel="noopener noreferrer" className={A}>{S.tgWhat.name}</a>・<a href={S.tgHowto.url} target="_blank" rel="noopener noreferrer" className={A}>{S.tgHowto.name}</a>（{checked} 確認）</p>
        </section>

        <section className={SECTION} aria-labelledby="koukei">
          <h2 id="koukei" className={H2}>後継機種の調べ方</h2>
          <ul className="grid gap-2">
            {K.koukei.map((e, i) => {
              const I = KOUKEI_ICONS[i] ?? Tag;
              return (
                <li key={e.h} className="flex items-start gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-slate-200">
                  <I size={20} className="mt-0.5 shrink-0 text-sky-700" aria-hidden="true" />
                  <span className="flex flex-col">
                    <span className="text-[15px] font-black text-slate-900">{e.h}</span>
                    <span className="text-[13px] text-slate-600">{e.d}</span>
                  </span>
                </li>
              );
            })}
          </ul>
          <p className={SRC}>出典：<a href={S.noritzTorikae.url} target="_blank" rel="noopener noreferrer" className={A}>{S.noritzTorikae.name}</a>・<a href={S.tgWhat.url} target="_blank" rel="noopener noreferrer" className={A}>{S.tgWhat.name}</a>（{checked} 確認）</p>
          <p className="text-[14px] text-slate-700">号数と種類が分かったら、総額は下の目安表で確かめられます。号数に迷ったら<Link href="/kyutoki/gosu-erabikata" className={`${A} text-sky-800`}>号数の選び方</Link>へ。</p>
          <HaifuDownload main="hiyou" others={['gosu']} />
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
        <OyuBox lpId={LP_ID} position="bottom" lead="型番が分かったら、来て見積もり" points={POINTS} beacon={false} />
        <p className="text-[11px] leading-relaxed text-slate-400">型番の読み方は目安です。機種によって違うことがあります。最終更新：2026年11月8日</p>
      </main>
      <OyuSticky lpId={LP_ID} />
      <LpFooter />
    </div>
  );
}
