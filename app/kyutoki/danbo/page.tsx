import type { Metadata } from 'next';
import Link from 'next/link';
import { Bath, Building2, Heater, Home, Maximize2, PanelTop, Thermometer, Wrench } from 'lucide-react';
import LpHeader from '@/components/lp/LpHeader';
import LpFooter from '@/components/lp/LpFooter';
import KyutokiNav from '@/components/kyutoki/KyutokiNav';
import LpViewTracker from '@/components/lp/LpViewTracker';
import { SITE_URL, SITE_NAME, ogImageUrl } from '@/components/loan/LoanArticle';
import { HaifuDownload, OyuBox, OyuSticky, PrNote } from '@/components/kyutoki/Haifu';
import DATA from '@/lib/kyutoki/haifu-data.json';

/**
 * 暖房付きの給湯器（床暖房・浴室暖房）（P7、2026-11-08 公開）。docs/kyutoki-seo/schedule.md。
 *   受ける言葉：暖房付き 給湯器 交換 費用、床暖房 給湯器、給湯暖房機 など48語。
 *   出口：お湯が出ない.com だけ。
 * 元：東京ガス「給湯器の選び方」（相場 30〜35万円）、東京ガスの販売価格（24号オートの暖房付き、売れた値段の割合）、東京ガス「工事について」（基本工事費・床暖房リモコン）。
 */
const LP_ID = 'kyutoki-danbo';
const VERSION = 'v1-2026-11-08';
const PAGE_PATH = '/kyutoki/danbo';
const TITLE = '暖房付き給湯器の交換費用｜床暖房・浴室暖房に使う型は30〜35万円ほど';
const DESCRIPTION = '床暖房や浴室暖房に使う暖房付きの給湯器（給湯暖房機）の交換費用の目安。東京ガスの相場は30〜35万円ほどで、24号オートの販売価格は壁掛けで約28.5万〜29.5万円、細身の型は約33.1万〜34.9万円。置き場所ごとの値段の表と、交換の前に確かめること。';

export const metadata: Metadata = {
  title: `${TITLE} | ${SITE_NAME}`,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}${PAGE_PATH}` },
  openGraph: { title: TITLE, description: DESCRIPTION, url: `${SITE_URL}${PAGE_PATH}`, siteName: SITE_NAME, type: 'article', locale: 'ja_JP', images: [{ url: ogImageUrl(TITLE), width: 1200, height: 630, alt: TITLE }] },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, images: [ogImageUrl(TITLE)] },
};

const D = DATA.danbo;
const PLACES = [
  { place: '壁掛け', icon: PanelTop },
  { place: '扉の中', icon: Building2 },
  { place: '細身（据え置き台）', icon: Maximize2 },
];
const man = (v: number) => `${(Math.round(v / 1000) / 10).toLocaleString('ja-JP')}万円`;
const range = (place: string) => {
  const ys = D.prices.filter((p) => p.place === place).map((p) => p.yen);
  return { min: Math.min(...ys), max: Math.max(...ys) };
};
const KOJI = DATA.kojiBase.filter((k) => k.kind === '暖房付き');

const FAQS = [
  { q: '床暖房のリモコンも替えますか？', a: '浴室・台所・床暖房のリモコンは、合わせて3台まで付け替えが基本工事に入っています。床暖房の新しいリモコンの代金は別です（東京ガス）。' },
  { q: '暖房付きもエコジョーズがいいですか？', a: '東京ガスの販売価格では、暖房付きの24号オート（壁掛け）は、エコジョーズと従来型の差が約5千円です。差が小さいので、両方の見積もりを取って比べてください。' },
  { q: 'パロマの暖房付きはありますか？', a: '東京ガスの「給湯器の選び方」では、パロマの暖房付きは扱いなしです。暖房付きは、リンナイとノーリツから選びます。' },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    { '@type': 'Article', headline: TITLE, description: DESCRIPTION, inLanguage: 'ja', dateModified: '2026-11-08T09:00:00+09:00', datePublished: '2026-11-08T09:00:00+09:00', mainEntityOfPage: `${SITE_URL}${PAGE_PATH}`, isPartOf: { '@id': `${SITE_URL}/#website` }, publisher: { '@id': `${SITE_URL}/#organization` } },
    { '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: SITE_NAME, item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: '給湯器', item: `${SITE_URL}/kyutoki` },
      { '@type': 'ListItem', position: 3, name: '暖房付き給湯器の交換', item: `${SITE_URL}${PAGE_PATH}` },
    ] },
    { '@type': 'FAQPage', mainEntity: FAQS.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) },
  ],
};

const SECTION = 'flex flex-col gap-5';
const H2 = 'text-[22px] font-black leading-snug text-slate-900';
const SRC = 'text-[11px] leading-relaxed text-slate-500';
const A = 'underline underline-offset-2';
const POINTS = ['出張料・見積もり・キャンセル料は無料', '最短30分で来てくれる', '工事は10年保証'];
const NOTE_ICONS = [Home, Wrench, Thermometer];

export default function DanboPage() {
  const S = DATA.sources;
  const checked = D.checkedAt.split('-').join('/');
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
            <h1 id="top" className="text-[28px] font-black leading-tight text-slate-900">暖房付き給湯器の交換費用<br /><span className="text-orange-600">30〜35万円ほど</span></h1>
          </div>
          <div className="flex items-center gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-slate-200">
            <span className="flex shrink-0 gap-1 text-sky-700"><Heater size={20} aria-hidden="true" /><Bath size={20} aria-hidden="true" /></span>
            <span className="text-[13px] text-slate-700">{D.what}</span>
          </div>
          <ul className="grid gap-2">
            {PLACES.map(({ place, icon: I }) => {
              const r = range(place);
              return (
                <li key={place} className="flex items-center gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-slate-200">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-700"><I size={20} aria-hidden="true" /></span>
                  <span className="flex-1 text-[15px] font-black text-slate-900">{place}</span>
                  <span className="shrink-0 text-right text-[14px] font-black text-orange-600">約{man(r.min).replace('万円', '万')}〜{man(r.max)}</span>
                </li>
              );
            })}
          </ul>
          <p className={SRC}>
            相場は東京ガス「給湯器の選び方」。置き場所ごとの値段は、{D.pricesNote}のリンナイとノーリツ。出典：
            <a href={S.tgHowto.url} target="_blank" rel="noopener noreferrer" className={A}>{S.tgHowto.name}</a>・
            <a href={S.tgRinnai.url} target="_blank" rel="noopener noreferrer" className={A}>{S.tgRinnai.name}</a>・
            <a href={S.tgNoritz.url} target="_blank" rel="noopener noreferrer" className={A}>{S.tgNoritz.name}</a>（{checked} 確認）
          </p>
          <HaifuDownload main="hiyou" others={['gosu']} />
        </section>

        <section className={SECTION} aria-labelledby="hyou">
          <h2 id="hyou" className={H2}>置き場所ごとの値段</h2>
          <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="bg-slate-50 text-[11px] text-slate-600">
                  <th className="px-3 py-2 text-left font-bold">24号オート</th>
                  <th className="px-2 py-2 text-right font-bold">リンナイ</th>
                  <th className="px-2 py-2 text-right font-bold">ノーリツ</th>
                </tr>
              </thead>
              <tbody>
                {PLACES.flatMap(({ place }) => ['従来型', 'エコジョーズ'].map((eff) => {
                  const r = D.prices.find((p) => p.place === place && p.eff === eff && p.maker === 'リンナイ');
                  const n = D.prices.find((p) => p.place === place && p.eff === eff && p.maker === 'ノーリツ');
                  if (!r && !n) return null;
                  return (
                    <tr key={place + eff} className="border-t border-slate-100">
                      <td className="px-3 py-2.5 text-slate-800">{place}<span className="block text-[11px] text-slate-500">{eff}</span></td>
                      {[r, n].map((x, i) => (
                        <td key={i} className="px-2 py-2.5 text-right tabular-nums text-slate-700">{x ? man(x.yen) : '—'}</td>
                      ))}
                    </tr>
                  );
                }))}
              </tbody>
            </table>
          </div>
          <p className={SRC}>
            東京ガスの販売価格（工事費込み・税込）。基本工事費は従来型{KOJI.find((k) => k.eff === '従来型')?.yen.toLocaleString('ja-JP')}円、エコジョーズ{KOJI.find((k) => k.eff === 'エコジョーズ')?.yen.toLocaleString('ja-JP')}円で、この値段に入っています。出典：
            <a href={S.tgRinnai.url} target="_blank" rel="noopener noreferrer" className={A}>{S.tgRinnai.name}</a>・
            <a href={S.tgNoritz.url} target="_blank" rel="noopener noreferrer" className={A}>{S.tgNoritz.name}</a>・
            <a href={S.tgKojiArticle.url} target="_blank" rel="noopener noreferrer" className={A}>{S.tgKojiArticle.name}</a>（{checked} 確認）
          </p>
          <OyuBox lpId={LP_ID} position="hyou" lead="今の型番を伝えて、見積もりを無料で" points={POINTS} />
        </section>

        <section className={SECTION} aria-labelledby="wariai">
          <h2 id="wariai" className={H2}>売れた値段の割合</h2>
          <div className="flex flex-col gap-3 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
            {D.share.map((s) => (
              <div key={s.h} className="flex flex-col gap-1">
                <div className="flex justify-between text-[14px] font-black text-slate-900"><span>{s.h}</span><span className="text-orange-600">{s.pct}%</span></div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-sky-600" style={{ width: `${s.pct}%` }} /></div>
              </div>
            ))}
          </div>
          <p className={SRC}>{D.shareNote}。出典：<a href={S.tgRinnai.url} target="_blank" rel="noopener noreferrer" className={A}>{S.tgRinnai.name}</a>（{checked} 確認）</p>
        </section>

        <section className={SECTION} aria-labelledby="mae">
          <h2 id="mae" className={H2}>交換の前に確かめること</h2>
          <ul className="grid gap-2">
            {D.notes.map((n, i) => {
              const I = NOTE_ICONS[i] ?? Home;
              return (
                <li key={n} className="flex items-start gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-slate-200">
                  <I size={20} className="mt-0.5 shrink-0 text-sky-700" aria-hidden="true" />
                  <span className="text-[14px] text-slate-800">{n}</span>
                </li>
              );
            })}
          </ul>
          <p className={SRC}>出典：<a href={S.tgHowto.url} target="_blank" rel="noopener noreferrer" className={A}>{S.tgHowto.name}</a>・<a href={S.tgKojiArticle.url} target="_blank" rel="noopener noreferrer" className={A}>{S.tgKojiArticle.name}</a>（{checked} 確認）</p>
          <p className="text-[14px] text-slate-700">エコジョーズとの差は<Link href="/kyutoki/ecojozu" className={`${A} text-sky-800`}>エコジョーズ</Link>、置き場所は<Link href="/kyutoki/kodate" className={`${A} text-sky-800`}>戸建て</Link>・<Link href="/kyutoki/mansion" className={`${A} text-sky-800`}>マンション</Link>のページへ。</p>
          <OyuBox lpId={LP_ID} position="mae" lead="置き場所の写真を送って、見積もりを無料で" points={POINTS} beacon={false} />
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
        <p className="text-[11px] leading-relaxed text-slate-400">金額は設置の状況で変わります。最終更新：2026年11月8日</p>
        <KyutokiNav current={PAGE_PATH} />
      </main>
      <OyuSticky lpId={LP_ID} />
      <LpFooter />
    </div>
  );
}
