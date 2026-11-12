import type { Metadata } from 'next';
import Link from 'next/link';
import { Home, Maximize2, PanelTop, Square, Wrench } from 'lucide-react';
import LpHeader from '@/components/lp/LpHeader';
import LpFooter from '@/components/lp/LpFooter';
import KyutokiNav from '@/components/kyutoki/KyutokiNav';
import LpViewTracker from '@/components/lp/LpViewTracker';
import { SITE_URL, SITE_NAME, ogImageUrl } from '@/components/loan/LoanArticle';
import { HaifuDownload, OyuBox, OyuSticky, PrNote } from '@/components/kyutoki/Haifu';
import DATA from '@/lib/kyutoki/haifu-data.json';

/**
 * 戸建ての給湯器の交換（置き場所）（P5、2026-11-06 公開）。docs/kyutoki-seo/schedule.md。
 *   受ける言葉：戸建て／一戸建て／持ち家 給湯器 交換 費用、壁掛け／据え置き／屋外 など120語。
 *   出口：お湯が出ない.com だけ。
 * 元：東京ガス「給湯器の選び方」（置き場所の型）、東京ガスの販売価格（同じメーカー・号数・機能どうしの差）、東京ガス「工事について」（据え置き台は別料金）。
 */
const LP_ID = 'kyutoki-kodate';
const VERSION = 'v1-2026-11-06';
const PAGE_PATH = '/kyutoki/kodate';
const TITLE = '戸建ての給湯器の交換費用｜壁掛け・据え置き・細身の型の差と、置き場所の確かめ方';
const DESCRIPTION = '一戸建ての給湯器の交換費用の目安。家の外の壁に付ける型、地面に置く型、細身の型で変わる値段の差（東京ガスの販売価格）と、別料金になる工事。置き場所の型は変えられないので、先に確かめます。';

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
const nKabe = price(FURO, 'エコジョーズ', '壁掛', 'ノーリツ');
const nOki = price(FURO, 'エコジョーズ', '据え置き', 'ノーリツ');
const nHoso = price(FURO, 'エコジョーズ', '壁掛（細身）', 'ノーリツ');
const rKabe = price(FURO, 'エコジョーズ', '壁掛', 'リンナイ');
const rHoso = price(FURO, 'エコジョーズ', '壁掛（細身）', 'リンナイ');
const man = (v: number) => `約${(Math.round(v / 1000) / 10).toLocaleString('ja-JP')}万円`;
const sa = (v: number) => (v < 10000 ? `約${Math.round(v / 1000)}千円` : man(v));

const FAQS = [
  { q: '壁掛けから据え置きに替えられますか？', a: '置き場所の型は変えられないので、今と同じ型で替えるのが基本です（東京ガス）。今の置き場所を先に確かめてください。' },
  { q: '据え置き台は替える必要がありますか？', a: '不安定な場所をブロックで固定する据え置き台は、基本の工事費とは別の料金です（東京ガス）。今の台がそのまま使えるかは、見積もりのときに見てもらいます。' },
  { q: '戸建ては管理組合への申請は要りますか？', a: '持ち家の一戸建てなら、マンションのような管理組合への申請はありません。借りている家なら、先に大家さんに連絡します。' },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    { '@type': 'Article', headline: TITLE, description: DESCRIPTION, inLanguage: 'ja', dateModified: '2026-11-06T09:00:00+09:00', datePublished: '2026-11-06T09:00:00+09:00', mainEntityOfPage: `${SITE_URL}${PAGE_PATH}`, isPartOf: { '@id': `${SITE_URL}/#website` }, publisher: { '@id': `${SITE_URL}/#organization` } },
    { '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: SITE_NAME, item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: '給湯器', item: `${SITE_URL}/kyutoki` },
      { '@type': 'ListItem', position: 3, name: '戸建ての給湯器の交換', item: `${SITE_URL}${PAGE_PATH}` },
    ] },
    { '@type': 'FAQPage', mainEntity: FAQS.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) },
  ],
};

const SECTION = 'flex flex-col gap-5';
const H2 = 'text-[22px] font-black leading-snug text-slate-900';
const SRC = 'text-[11px] leading-relaxed text-slate-500';
const A = 'underline underline-offset-2';
const POINTS = ['出張料・見積もり・キャンセル料は無料', '最短30分で来てくれる', '工事は10年保証'];
const BASHO_ICONS = [PanelTop, Maximize2, Square, Home];

export default function KodatePage() {
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
            <h1 id="top" className="text-[28px] font-black leading-tight text-slate-900">戸建ての給湯器<br />置き場所で変わる値段</h1>
          </div>
          <ul className="grid gap-2">
            {[
              { icon: Square, h: '据え置き（地面に置く）', v: `壁掛けと${sa(nOki - nKabe)}差` },
              { icon: Maximize2, h: '細身の壁掛け', v: `+${man(nHoso - nKabe)}〜${man(rHoso - rKabe).replace('約', '')}` },
              { icon: Wrench, h: '据え置き台の固定', v: '別料金' },
            ].map(({ icon: I, h, v }) => (
              <li key={h} className="flex items-center gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-slate-200">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-700"><I size={20} aria-hidden="true" /></span>
                <span className="flex-1 text-[15px] font-black text-slate-900">{h}</span>
                <span className="shrink-0 text-right text-[14px] font-black text-orange-600">{v}</span>
              </li>
            ))}
          </ul>
          <p className={SRC}>
            東京ガスの販売価格（ふろ給湯器16号オートのエコジョーズ、工事費込み・税込）どうしの差。据え置きはノーリツ、細身はノーリツとリンナイ。出典：
            <a href={S.tgNoritz.url} target="_blank" rel="noopener noreferrer" className={A}>{S.tgNoritz.name}</a>・
            <a href={S.tgRinnai.url} target="_blank" rel="noopener noreferrer" className={A}>{S.tgRinnai.name}</a>・
            <a href={S.tgKoji.url} target="_blank" rel="noopener noreferrer" className={A}>{S.tgKoji.name}</a>（{checked} 確認）
          </p>
          <HaifuDownload main="hiyou" others={['gosu']} />
        </section>

        <section className={SECTION} aria-labelledby="basho">
          <h2 id="basho" className={H2}>置き場所の4つの型</h2>
          <ul className="grid grid-cols-2 gap-2">
            {DATA.basho.map((b, i) => {
              const I = BASHO_ICONS[i] ?? Home;
              return (
                <li key={b.h} className="flex flex-col gap-1 rounded-2xl bg-white p-3.5 ring-1 ring-slate-200">
                  <I size={20} className="text-sky-700" aria-hidden="true" />
                  <span className="text-[14px] font-black text-slate-900">{b.h}</span>
                  <span className="text-[12px] leading-snug text-slate-600">{b.d}</span>
                </li>
              );
            })}
          </ul>
          <p className="rounded-2xl bg-sky-50 px-4 py-3 text-[14px] font-bold text-slate-800 ring-1 ring-sky-200">{DATA.bashoNote}</p>
          <p className={SRC}>出典：<a href={S.tgHowto.url} target="_blank" rel="noopener noreferrer" className={A}>{S.tgHowto.name}</a>（{checked} 確認）</p>
          <p className="text-[14px] text-slate-700">号数で迷ったら<Link href="/kyutoki/gosu-erabikata" className={`${A} text-sky-800`}>号数の選び方</Link>、お風呂の機能で迷ったら<Link href="/kyutoki/furo" className={`${A} text-sky-800`}>お風呂の給湯器</Link>へ。</p>
          <OyuBox lpId={LP_ID} position="basho" lead="置き場所の写真を送って、見積もりを無料で" points={POINTS} />
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
        <p className="text-[11px] leading-relaxed text-slate-400">金額は設置の状況で変わります。最終更新：2026年11月6日</p>
        <KyutokiNav current={PAGE_PATH} />
      </main>
      <OyuSticky lpId={LP_ID} />
      <LpFooter />
    </div>
  );
}
