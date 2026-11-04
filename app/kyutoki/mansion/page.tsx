import type { Metadata } from 'next';
import Link from 'next/link';
import { Building2, ClipboardList, DoorClosed, FileCheck2, Maximize2, MessageSquare, PanelTop, Users, Wrench } from 'lucide-react';
import LpHeader from '@/components/lp/LpHeader';
import LpFooter from '@/components/lp/LpFooter';
import LpViewTracker from '@/components/lp/LpViewTracker';
import { SITE_URL, SITE_NAME, ogImageUrl } from '@/components/loan/LoanArticle';
import { HaifuDownload, OyuBox, OyuSticky, PrNote } from '@/components/kyutoki/Haifu';
import DATA from '@/lib/kyutoki/haifu-data.json';

/**
 * マンションの給湯器の交換（P4、2026-11-05 公開）。docs/kyutoki-seo/schedule.md。
 *   受ける言葉：マンション 給湯器 交換 費用、分譲マンション、パイプシャフト／PS設置、管理組合／管理規約／申請 など72語。
 *   出口：お湯が出ない.com だけ。
 * 数字の元：東京ガスの販売価格（同じメーカー・同じ号数どうしの差）、東京ガス「工事について」（扉の中のエコジョーズの排水工事は別料金）、
 *   国土交通省「マンション標準管理規約」第17条（専有部分の修繕等の申請と承認）。
 */
const LP_ID = 'kyutoki-mansion';
const VERSION = 'v1-2026-11-05';
const PAGE_PATH = '/kyutoki/mansion';
const TITLE = 'マンションの給湯器の交換費用｜扉の中（パイプシャフト）・壁掛けの差と、管理組合への申請';
const DESCRIPTION = 'マンションの給湯器の交換費用の目安。扉の中（パイプシャフト）と壁掛けの差、細身の型で上がる金額、エコジョーズの排水工事、管理組合への申請の流れ（標準管理規約）まで。';
const DATE_MODIFIED = '2026-11-05';

export const metadata: Metadata = {
  title: `${TITLE} | ${SITE_NAME}`,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}${PAGE_PATH}` },
  openGraph: { title: TITLE, description: DESCRIPTION, url: `${SITE_URL}${PAGE_PATH}`, siteName: SITE_NAME, type: 'article', locale: 'ja_JP', images: [{ url: ogImageUrl(TITLE), width: 1200, height: 630, alt: TITLE }] },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, images: [ogImageUrl(TITLE)] },
};

const P = DATA.prices;
const price = (kind: string, eff: string, place: string, maker: string) => P.find((p) => p.kind === kind && p.eff === eff && p.place === place && p.maker === maker)?.yen ?? 0;
const FURO = 'ふろ給湯器（オート）';
const kabe = price(FURO, '従来型', '壁掛', 'リンナイ');
const ps = price(FURO, '従来型', 'PS', 'リンナイ');
const ecoKabe = price(FURO, 'エコジョーズ', '壁掛', 'リンナイ');
const hoso = price(FURO, 'エコジョーズ', '壁掛（細身）', 'リンナイ');
const man = (v: number) => `約${(Math.round(v / 1000) / 10).toLocaleString('ja-JP')}万円`;
const sa = (v: number) => (v < 10000 ? `約${Math.round(v / 1000)}千円` : man(v));

const FAQS = [
  { q: '管理組合への申請は要りますか？', a: '国が示す管理規約のひな形（国土交通省の標準管理規約）の第17条では、共用部分やほかの部屋に影響するおそれがある工事は、前もって理事長に申請し、書面で承認を受けることになっています。給湯器の交換が当たるかは、お住まいのマンションの管理規約で確かめてください。' },
  { q: '扉の中の給湯器を、壁掛けに替えられますか？', a: '置き場所を変えるには、配管や排気の工事が要ることがあり、共用部分にかかることもあります。今と同じ置き場所・同じ型の大きさで替えるのが基本です。' },
  { q: '賃貸マンションです。', a: '賃貸の給湯器は、ふつう大家さんか管理会社のものです。自分で業者を呼ぶ前に、管理会社に連絡してください。' },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    { '@type': 'Article', headline: TITLE, description: DESCRIPTION, inLanguage: 'ja', dateModified: `${DATE_MODIFIED}T09:00:00+09:00`, datePublished: '2026-11-05T09:00:00+09:00', mainEntityOfPage: `${SITE_URL}${PAGE_PATH}`, isPartOf: { '@id': `${SITE_URL}/#website` }, publisher: { '@id': `${SITE_URL}/#organization` } },
    { '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: SITE_NAME, item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: 'ガス給湯器の交換費用', item: `${SITE_URL}/kyutoki/kokan-hiyou` },
      { '@type': 'ListItem', position: 3, name: 'マンションの給湯器の交換', item: `${SITE_URL}${PAGE_PATH}` },
    ] },
    { '@type': 'FAQPage', mainEntity: FAQS.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) },
  ],
};

const SECTION = 'flex flex-col gap-5';
const H2 = 'text-[22px] font-black leading-snug text-slate-900';
const SRC = 'text-[11px] leading-relaxed text-slate-500';
const A = 'underline underline-offset-2';
const POINTS = ['出張料・見積もり・キャンセル料は無料', '最短30分で来てくれる', '工事は10年保証'];

export default function MansionPage() {
  const S = DATA.sources;
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
            <p className="text-[13px] font-bold text-sky-700">ガス給湯器の交換</p>
            <h1 id="top" className="text-[28px] font-black leading-tight text-slate-900">マンションの<br />給湯器の交換</h1>
          </div>
          <ul className="grid gap-2">
            {[
              { icon: DoorClosed, h: '扉の中（パイプシャフト）', v: `壁掛けと${sa(ps - kabe)}差`, d: '玄関の横の扉の中に置く型' },
              { icon: Maximize2, h: '細身の型', v: `+${man(hoso - ecoKabe)}`, d: '置き場所がせまいときの型（エコジョーズ）' },
              { icon: Wrench, h: '扉の中でエコジョーズに', v: '排水工事が別', d: '従来の型から替えるとき' },
            ].map(({ icon: I, h, v, d }) => (
              <li key={h} className="flex items-center gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-slate-200">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-700"><I size={20} aria-hidden="true" /></span>
                <span className="flex flex-1 flex-col">
                  <span className="text-[15px] font-black text-slate-900">{h}</span>
                  <span className="text-[12px] text-slate-600">{d}</span>
                </span>
                <span className="shrink-0 text-right text-[14px] font-black text-orange-600">{v}</span>
              </li>
            ))}
          </ul>
          <p className={SRC}>
            東京ガスの販売価格（リンナイのふろ給湯器16号オート、工事費込み・税込）どうしの差。出典：
            <a href={S.tgRinnai.url} target="_blank" rel="noopener noreferrer" className={A}>{S.tgRinnai.name}</a>・
            <a href={S.tgKoji.url} target="_blank" rel="noopener noreferrer" className={A}>{S.tgKoji.name}</a>（{checked} 確認）
          </p>
          <HaifuDownload main="hiyou" others={['gosu']} />
        </section>

        <section className={SECTION} aria-labelledby="kakunin">
          <h2 id="kakunin" className={H2}>今の給湯器で見る3つ</h2>
          <ul className="grid grid-cols-3 gap-2">
            {[
              { icon: PanelTop, h: '置き場所', d: '扉の中か、外の壁か' },
              { icon: ClipboardList, h: '型番', d: '本体のシール。号数も分かる' },
              { icon: Building2, h: '管理規約', d: '工事の申請が要るか' },
            ].map(({ icon: I, h, d }) => (
              <li key={h} className="flex flex-col items-center gap-1.5 rounded-2xl bg-white px-2 py-4 text-center ring-1 ring-slate-200">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-50 text-sky-700"><I size={20} aria-hidden="true" /></span>
                <span className="text-[14px] font-black text-slate-900">{h}</span>
                <span className="text-[11px] leading-snug text-slate-500">{d}</span>
              </li>
            ))}
          </ul>
          <p className="text-[14px] text-slate-700">号数は、迷ったら今と同じにします。くわしくは<Link href="/kyutoki/gosu-erabikata" className={`${A} text-sky-800`}>号数の選び方</Link>へ。</p>
        </section>

        <section className={SECTION} aria-labelledby="shinsei">
          <h2 id="shinsei" className={H2}>管理組合への申請</h2>
          <ol className="grid gap-2">
            {[
              { icon: Building2, h: '管理規約を見る', d: '専有部分の工事に申請が要るか' },
              { icon: FileCheck2, h: '申請書を出す', d: '設計図・仕様書・工程表を付けて理事長へ' },
              { icon: Users, h: '理事会で承認', d: '書面で承認を受けてから工事' },
              { icon: MessageSquare, h: '工事の前に知らせる', d: '業者の出入りや音で、ほかの部屋に影響するとき' },
            ].map(({ icon: I, h, d }, i) => (
              <li key={h} className="flex items-center gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-slate-200">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-700 text-[14px] font-bold text-white">{i + 1}</span>
                <span className="flex flex-1 flex-col">
                  <span className="text-[15px] font-black text-slate-900">{h}</span>
                  <span className="text-[12px] text-slate-600">{d}</span>
                </span>
                <I size={18} className="shrink-0 text-slate-400" aria-hidden="true" />
              </li>
            ))}
          </ol>
          <p className={SRC}>出典：<a href={S.mlitKiyaku.url} target="_blank" rel="noopener noreferrer" className={A}>{S.mlitKiyaku.name}</a>。給湯器の交換が申請の対象かは、マンションごとの管理規約で決まります。</p>
          <OyuBox lpId={LP_ID} position="shinsei" lead="型番と置き場所を伝えて、見積もりを無料で" points={POINTS} />
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
        <p className="text-[11px] leading-relaxed text-slate-400">金額は設置の状況で変わります。最終更新：2026年11月5日</p>
      </main>
      <OyuSticky lpId={LP_ID} />
      <LpFooter />
    </div>
  );
}
