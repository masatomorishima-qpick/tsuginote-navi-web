import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowDown, CalendarClock, Clock, Flame, Gauge, Hammer, PhoneCall, PhoneOff, PlugZap, Receipt, ShieldCheck, Truck, Wrench,
} from 'lucide-react';
import LpHeader from '@/components/lp/LpHeader';
import LpFooter from '@/components/lp/LpFooter';
import LpViewTracker from '@/components/lp/LpViewTracker';
import { SITE_URL, SITE_NAME, ogImageUrl } from '@/components/loan/LoanArticle';
import { OyuBox, OyuSticky, PrNote } from '@/components/kyutoki/Haifu';
import DATA from '@/lib/kyutoki/haifu-data.json';

/**
 * 給湯器が壊れた日（急ぎ・即日）。2026-11-05 公開。
 * 設計：docs/kyutoki-seo/schedule.md の P15（枝 docs/listing-rules）。
 *   受ける言葉：給湯器 交換 即日／当日／最短、在庫あり、仮設／代替機／レンタル機、何日かかる など38語。
 *   出口：お湯が出ない.com だけ（1ページに1つ。11/4 22:40 に GAS-Q から変更。docs/kyutoki-seo/pdca.md の「出口の決まり」）。
 * 数字の元：lib/kyutoki/haifu-data.json（東京消防庁のメーター復帰方法、お湯が出ない.com 公式、東京ガスの販売価格、国民生活センター）。
 */

const LP_ID = 'kyutoki-sokujitsu';
const VERSION = 'v1-2026-11-05';
const PAGE_PATH = '/kyutoki/sokujitsu';
const TITLE = '給湯器が壊れた日に｜即日の修理・交換と、当日お湯を使う手順';
const DESCRIPTION =
  '給湯器が急に止まった日の手順。電話の前に確かめること（ガスメーターの復帰）、最短30分で来てもらう流れ、修理と交換の目安、部品がないときの貸出機まで。';
const DATE_MODIFIED = '2026-11-05';

export const metadata: Metadata = {
  title: `${TITLE} | ${SITE_NAME}`,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}${PAGE_PATH}` },
  openGraph: {
    title: TITLE, description: DESCRIPTION, url: `${SITE_URL}${PAGE_PATH}`, siteName: SITE_NAME, type: 'article', locale: 'ja_JP',
    images: [{ url: ogImageUrl(TITLE), width: 1200, height: 630, alt: TITLE }],
  },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, images: [ogImageUrl(TITLE)] },
};

const FAQS = [
  {
    q: '今日中に交換までできますか？',
    a: '在庫のある機種なら、当日に交換できることがあります。お湯が出ない.com は、修理できないときは即日で交換すると書いています（交換は最短80分）。在庫がない機種は取り寄せになるので、そのあいだは貸出機を付けてもらえるか聞いてください。',
  },
  {
    q: '夜や休みの日でも来てもらえますか？',
    a: 'お湯が出ない.com の電話の受付は9時〜21時で、年中無休です。夜遅い時間は、受付の時間内に電話して、翌朝の訪問を頼むのが確実です。',
  },
  {
    q: '見積もりだけで断ってもいいですか？',
    a: 'お湯が出ない.com は、見積もり料・キャンセル料・出張費はかからないと書いています。金額に納得できなければ、その場で決めずに断ってかまいません。',
  },
  {
    q: '賃貸に住んでいます。',
    a: '賃貸の給湯器は、ふつう大家さんか管理会社のものです。自分で業者を呼ぶ前に、まず大家さんか管理会社に連絡してください。',
  },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Article', headline: TITLE, description: DESCRIPTION, inLanguage: 'ja',
      dateModified: `${DATE_MODIFIED}T09:00:00+09:00`, datePublished: '2026-11-05T09:00:00+09:00',
      mainEntityOfPage: `${SITE_URL}${PAGE_PATH}`, isPartOf: { '@id': `${SITE_URL}/#website` }, publisher: { '@id': `${SITE_URL}/#organization` },
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: SITE_NAME, item: `${SITE_URL}/` },
        { '@type': 'ListItem', position: 2, name: 'ガス給湯器の交換費用', item: `${SITE_URL}/kyutoki/kokan-hiyou` },
        { '@type': 'ListItem', position: 3, name: '給湯器が壊れた日に', item: `${SITE_URL}${PAGE_PATH}` },
      ],
    },
    { '@type': 'FAQPage', mainEntity: FAQS.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) },
  ],
};

const SECTION = 'flex flex-col gap-5';
const H2 = 'text-[22px] font-black leading-snug text-slate-900';
const SRC = 'text-[11px] leading-relaxed text-slate-500';
const A = 'underline underline-offset-2';

const OYU_POINTS = ['出張料・見積もり・キャンセル料は無料', '最短30分で到着', '修理できないときは、その日に交換'];
const FLOW_ICONS = [Truck, Receipt, Wrench, Hammer];

export default function SokujitsuPage() {
  const S = DATA.sources;
  const checked = DATA.checkedAt.split('-').join('/');
  return (
    <div className="flex min-h-screen flex-col bg-[#f6f8fa]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <LpHeader />
      <LpViewTracker lpId={LP_ID} version={VERSION} />

      <main className="mx-auto flex w-full max-w-[520px] flex-1 flex-col gap-14 px-4 pt-4 pb-32 sm:pb-16">
        <div className="-mb-10"><PrNote /></div>

        {/* 最初の画面：今日の3つの手順と出口 */}
        <section className="flex flex-col gap-5" aria-labelledby="top">
          <div className="flex flex-col gap-2">
            <p className="text-[13px] font-bold text-sky-700">ガス給湯器が止まった</p>
            <h1 id="top" className="text-[28px] font-black leading-tight text-slate-900">今日お湯を<br />使うまで</h1>
          </div>
          <ol className="flex flex-col gap-1">
            {[
              { icon: Gauge, h: 'メーターを確かめる', d: '赤ランプの点滅なら、自分で戻せることがある' },
              { icon: PhoneCall, h: '来てもらう', d: '見積もりまでは無料' },
              { icon: Wrench, h: '修理か交換か、貸出機', d: '直らない日も、お湯は使える' },
            ].map(({ icon: I, h, d }, i, arr) => (
              <li key={h} className="flex flex-col items-stretch">
                <div className="flex items-center gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-slate-200">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-700"><I size={20} aria-hidden="true" /></span>
                  <span className="flex flex-col">
                    <span className="text-[15px] font-black text-slate-900"><span className="mr-1.5 text-sky-700">{i + 1}</span>{h}</span>
                    <span className="text-[12px] text-slate-600">{d}</span>
                  </span>
                </div>
                {i < arr.length - 1 && <ArrowDown size={16} className="mx-auto my-0.5 text-slate-300" aria-hidden="true" />}
              </li>
            ))}
          </ol>
          <OyuBox lpId={LP_ID} position="hero" lead="今日、来てもらう" points={OYU_POINTS} />
        </section>

        {/* 電話の前に */}
        <section className={SECTION} aria-labelledby="meter">
          <h2 id="meter" className={H2}>電話の前に：ガスメーター</h2>
          <div className="grid grid-cols-3 gap-2">
            {[
              { icon: PlugZap, h: 'リモコン', d: '電源が入っているか' },
              { icon: Flame, h: 'コンロ', d: '火がつくか' },
              { icon: Gauge, h: 'メーター', d: '赤ランプの点滅' },
            ].map(({ icon: I, h, d }) => (
              <div key={h} className="flex flex-col items-center gap-1 rounded-2xl bg-white px-2 py-3 text-center ring-1 ring-slate-200">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-50 text-sky-700"><I size={18} aria-hidden="true" /></span>
                <span className="text-[14px] font-black text-slate-900">{h}</span>
                <span className="text-[11px] leading-tight text-slate-600">{d}</span>
              </div>
            ))}
          </div>
          <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
            <p className="text-[15px] font-black text-slate-900">赤ランプが点滅していたら</p>
            <ol className="mt-2 flex flex-col gap-2">
              {DATA.meterReset.map((t, i) => (
                <li key={t} className="flex items-start gap-2.5 text-[14px] text-slate-700">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-700 text-[12px] font-bold text-white">{i + 1}</span>{t}
                </li>
              ))}
            </ol>
          </div>
          <p className="rounded-2xl border-2 border-red-200 bg-red-50 px-4 py-3 text-[14px] font-bold text-red-800">
            ガスのにおいがするときは、火を使わず、ボタンも押さずに、ガス会社へ連絡
          </p>
          <p className={SRC}>出典：<a href={S.tfdMeter.url} target="_blank" rel="noopener noreferrer" className={A}>{S.tfdMeter.name}</a>（{checked} 確認）。プロパンガスは手順が少し違います。</p>
        </section>

        {/* 来てもらったあとの流れ */}
        <section className={SECTION} aria-labelledby="flow">
          <h2 id="flow" className={H2}>来てもらったあとの時間</h2>
          <ul className="grid grid-cols-2 gap-2">
            {DATA.oyuFlow.map((f, i) => {
              const I = FLOW_ICONS[i] ?? Clock;
              return (
                <li key={f.h} className="flex flex-col gap-1 rounded-2xl bg-white p-3.5 ring-1 ring-slate-200">
                  <span className="flex items-center gap-1.5 text-[13px] font-bold text-slate-600"><I size={16} className="text-sky-700" aria-hidden="true" />{f.h}</span>
                  <span className="text-[20px] font-black text-slate-900">{f.v}</span>
                  <span className="text-[11px] leading-tight text-slate-500">{f.d}</span>
                </li>
              );
            })}
          </ul>
          <p className="flex items-start gap-2 rounded-2xl bg-sky-50 px-4 py-3 text-[14px] text-slate-800 ring-1 ring-sky-200">
            <ShieldCheck size={18} className="mt-0.5 shrink-0 text-sky-700" aria-hidden="true" />{DATA.oyuKari}
          </p>
          <p className={SRC}>出典：<a href={S.oyuDenai.url} target="_blank" rel="noopener noreferrer" className={A}>{S.oyuDenai.name}</a>（{checked} 確認）。対象は東京都・神奈川県。</p>
        </section>

        {/* 修理か交換か */}
        <section className={SECTION} aria-labelledby="nensu">
          <h2 id="nensu" className={H2}>修理か交換か：使った年数</h2>
          <ul className="grid gap-2">
            {[
              { y: '7年未満', h: 'まず修理', d: '耐用年数（7〜10年）より前' },
              { y: '7〜9年', h: '両方の見積もり', d: '耐用年数に入っている。直しても、ほかが傷みやすい' },
              { y: '10年以上', h: '交換を考える', d: '使い始めて10年ほどで「88」「888」が出る' },
            ].map((r) => (
              <li key={r.y} className="flex items-center gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-slate-200">
                <span className="w-[72px] shrink-0 text-center text-[15px] font-black text-sky-800">{r.y}</span>
                <span className="flex flex-col">
                  <span className="text-[15px] font-black text-slate-900">{r.h}</span>
                  <span className="text-[12px] text-slate-600">{r.d}</span>
                </span>
              </li>
            ))}
          </ul>
          <p className="text-[14px] text-slate-700">「88」「888」は故障ではなく、点検の時期のお知らせです。お湯は使えます。年数は本体のシールの製造年で分かります。</p>
          <p className={SRC}>出典：<a href={S.oyuDenai.url} target="_blank" rel="noopener noreferrer" className={A}>{S.oyuDenai.name}</a>（耐用年数は7〜10年、「88」「888」は使い始めて10年ほどで出るお知らせ）。</p>
          <p className="text-[14px] text-slate-700">
            交換するときの総額の目安は<Link href="/kyutoki/kokan-hiyou#hyou" className={`${A} text-sky-800`}>費用の目安表</Link>、
            号数は<Link href="/kyutoki/gosu-erabikata" className={`${A} text-sky-800`}>号数の選び方</Link>にあります。
          </p>
        </section>

        {/* 急がされたとき */}
        <section className={SECTION} aria-labelledby="chui">
          <h2 id="chui" className={H2}>急いでいる日こそ注意</h2>
          <div className="flex flex-col gap-2 rounded-2xl border-2 border-orange-200 bg-orange-50/60 p-4">
            {DATA.tenken.map((t, i) => {
              const I = [PhoneOff, CalendarClock, ShieldCheck][i] ?? ShieldCheck;
              return (
                <p key={t} className="flex items-start gap-2 text-[14px] text-slate-800">
                  <I size={18} className="mt-0.5 shrink-0 text-orange-600" aria-hidden="true" />{t}
                </p>
              );
            })}
          </div>
          <p className={SRC}>出典：<a href={S.kokusen.url} target="_blank" rel="noopener noreferrer" className={A}>{S.kokusen.name}</a></p>
        </section>

        <section className={SECTION} aria-labelledby="end">
          <h2 id="end" className={H2}>今日、来てもらう</h2>
          <OyuBox lpId={LP_ID} position="bottom" lead="電話かフォームで、今の症状を伝えるだけ" points={OYU_POINTS} beacon={false} />
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
          時間と金額は紹介先の公式サイトの記載で、状況によって変わります。最終更新：2026年11月5日
        </p>
      </main>
      <OyuSticky lpId={LP_ID} />
      <LpFooter />
    </div>
  );
}
