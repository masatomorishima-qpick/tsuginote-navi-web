import type { Metadata } from 'next';
import Link from 'next/link';
import { Building2, Droplets, Flame, Leaf, Search, Tag } from 'lucide-react';
import LpHeader from '@/components/lp/LpHeader';
import LpFooter from '@/components/lp/LpFooter';
import LpViewTracker from '@/components/lp/LpViewTracker';
import { SITE_URL, SITE_NAME, ogImageUrl } from '@/components/loan/LoanArticle';
import { HaifuDownload, OyuBox, OyuSticky, PrNote } from '@/components/kyutoki/Haifu';
import DATA from '@/lib/kyutoki/haifu-data.json';

/**
 * エコジョーズにするか（P9、2026-11-08 公開）。docs/kyutoki-seo/schedule.md。
 *   受ける言葉：エコジョーズ 交換 費用、従来型 価格差、16・20・24号 エコジョーズ など41語。
 *   出口：お湯が出ない.com だけ。
 * 元：東京ガスの販売価格（同じメーカー・種類・号数・壁掛けどうしの従来型とエコジョーズの差）、
 *     東京ガス「給湯器の選び方」（ガスの使用量 約13%減・見分け方）、東京ガス「工事について」（扉の中の排水工事）。
 */
const LP_ID = 'kyutoki-ecojozu';
const VERSION = 'v1-2026-11-08';
const PAGE_PATH = '/kyutoki/ecojozu';
const TITLE = 'エコジョーズへの交換費用｜従来型との差額は約2万〜3万円、ガスの使用量は約13%減';
const DESCRIPTION = 'エコジョーズに替えると、交換費用はいくら上がるか。東京ガスの販売価格で同じ型どうしを比べると、給湯専用・ふろ給湯器は約2万〜2.8万円、暖房付きは約5千円の差。ガスの使用量は約13%減。マンションの扉の中なら排水の工事が要ります。';

export const metadata: Metadata = {
  title: `${TITLE} | ${SITE_NAME}`,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}${PAGE_PATH}` },
  openGraph: { title: TITLE, description: DESCRIPTION, url: `${SITE_URL}${PAGE_PATH}`, siteName: SITE_NAME, type: 'article', locale: 'ja_JP', images: [{ url: ogImageUrl(TITLE), width: 1200, height: 630, alt: TITLE }] },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, images: [ogImageUrl(TITLE)] },
};

const E = DATA.ecojozu;
const P = DATA.prices;
const yen = (kind: string, gosu: string, eff: string, maker: string) =>
  P.find((p) => p.kind === kind && p.gosu === gosu && p.eff === eff && p.place === '壁掛' && p.maker === maker)?.yen ?? 0;
type Row = { label: string; maker: string; old: number; eco: number };
const ROWS: Row[] = [
  ['給湯専用 16号', '給湯専用', '16号'],
  ['ふろ 16号オート', 'ふろ給湯器（オート）', '16号'],
  ['暖房付き 24号オート', '暖房付き（オート）', '24号'],
].flatMap(([label, kind, gosu]) =>
  ['リンナイ', 'ノーリツ'].map((maker) => ({ label, maker, old: yen(kind, gosu, '従来型', maker), eco: yen(kind, gosu, 'エコジョーズ', maker) })),
);
const sa = ROWS.map((r) => r.eco - r.old);
const furoKyuto = sa.slice(0, 4);
const danbo = sa.slice(4);
const man = (v: number) => `${(Math.round(v / 1000) / 10).toLocaleString('ja-JP')}万円`;
const sen = (v: number) => (v < 10000 ? `${Math.round(v / 1000)}千円` : man(v));

const FAQS = [
  { q: 'エコジョーズにしないといけませんか？', a: '従来型も売られています（東京ガスの販売価格に、従来型とエコジョーズの両方があります）。東京ガスは、お湯をたくさん使う家にエコジョーズをすすめています。' },
  { q: 'ガス代はどれくらい下がりますか？', a: `東京ガスによると、従来型からエコジョーズに替えると、ガスの使用量を約${E.gasPct}%抑えられます（リンナイの24号の比較）。いくら下がるかは、お湯の使い方で変わります。` },
  { q: 'マンションでもエコジョーズにできますか？', a: 'できます（東京ガスの販売価格に、扉の中に置くエコジョーズがあります）。扉の中（パイプシャフト）で従来型から替えるときは、エコジョーズから出る水を浴室の排水口へ流す工事が要ります（東京ガス）。見積もりのときに確かめてください。' },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    { '@type': 'Article', headline: TITLE, description: DESCRIPTION, inLanguage: 'ja', dateModified: '2026-11-08T09:00:00+09:00', datePublished: '2026-11-08T09:00:00+09:00', mainEntityOfPage: `${SITE_URL}${PAGE_PATH}`, isPartOf: { '@id': `${SITE_URL}/#website` }, publisher: { '@id': `${SITE_URL}/#organization` } },
    { '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: SITE_NAME, item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: 'ガス給湯器の交換費用', item: `${SITE_URL}/kyutoki/kokan-hiyou` },
      { '@type': 'ListItem', position: 3, name: 'エコジョーズへの交換費用', item: `${SITE_URL}${PAGE_PATH}` },
    ] },
    { '@type': 'FAQPage', mainEntity: FAQS.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) },
  ],
};

const SECTION = 'flex flex-col gap-5';
const H2 = 'text-[22px] font-black leading-snug text-slate-900';
const SRC = 'text-[11px] leading-relaxed text-slate-500';
const A = 'underline underline-offset-2';
const POINTS = ['出張料・見積もり・キャンセル料は無料', '最短30分で来てくれる', '工事は10年保証'];

export default function EcojozuPage() {
  const S = DATA.sources;
  const checked = E.checkedAt.split('-').join('/');
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
            <h1 id="top" className="text-[28px] font-black leading-tight text-slate-900">エコジョーズの差額<br /><span className="text-orange-600">約2万〜3万円</span></h1>
          </div>
          <ul className="grid gap-2">
            {[
              { icon: Tag, h: '給湯専用・ふろ', v: `+${sen(Math.min(...furoKyuto))}〜${sen(Math.max(...furoKyuto))}` },
              { icon: Tag, h: '暖房付き', v: `+約${sen(Math.min(...danbo))}` },
              { icon: Leaf, h: 'ガスの使用量', v: `約${E.gasPct}%減` },
            ].map(({ icon: I, h, v }) => (
              <li key={h} className="flex items-center gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-slate-200">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-700"><I size={20} aria-hidden="true" /></span>
                <span className="flex-1 text-[15px] font-black text-slate-900">{h}</span>
                <span className="shrink-0 text-right text-[15px] font-black text-orange-600">{v}</span>
              </li>
            ))}
          </ul>
          <p className={SRC}>
            東京ガスの販売価格（工事費込み・税込、壁掛け）で、同じメーカー・種類・号数の従来型とエコジョーズの差。ガスの使用量はリンナイの24号どうしの比較。出典：
            <a href={S.tgRinnai.url} target="_blank" rel="noopener noreferrer" className={A}>{S.tgRinnai.name}</a>・
            <a href={S.tgNoritz.url} target="_blank" rel="noopener noreferrer" className={A}>{S.tgNoritz.name}</a>・
            <a href={S.tgHowto.url} target="_blank" rel="noopener noreferrer" className={A}>{S.tgHowto.name}</a>（{checked} 確認）
          </p>
          <HaifuDownload main="hiyou" others={['gosu']} />
        </section>

        <section className={SECTION} aria-labelledby="sagaku">
          <h2 id="sagaku" className={H2}>従来型との差額</h2>
          <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="bg-slate-50 text-[11px] text-slate-600">
                  <th className="px-3 py-2 text-left font-bold">種類（壁掛け）</th>
                  <th className="px-2 py-2 text-right font-bold">従来型</th>
                  <th className="px-2 py-2 text-right font-bold">エコジョーズ</th>
                  <th className="px-2 py-2 text-right font-bold">差</th>
                </tr>
              </thead>
              <tbody>
                {ROWS.map((r) => (
                  <tr key={r.label + r.maker} className="border-t border-slate-100">
                    <td className="px-3 py-2.5 text-slate-800">{r.label}<span className="block text-[11px] text-slate-500">{r.maker}</span></td>
                    <td className="px-2 py-2.5 text-right tabular-nums text-slate-700">{man(r.old)}</td>
                    <td className="px-2 py-2.5 text-right tabular-nums text-slate-700">{man(r.eco)}</td>
                    <td className="px-2 py-2.5 text-right font-black tabular-nums text-orange-600">+{sen(r.eco - r.old)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className={SRC}>
            東京ガスの販売価格（工事費込み・税込）。基本工事費もエコジョーズのほうが{E.kojiSa.toLocaleString('ja-JP')}円高く、この差に入っています。出典：
            <a href={S.tgRinnai.url} target="_blank" rel="noopener noreferrer" className={A}>{S.tgRinnai.name}</a>・
            <a href={S.tgNoritz.url} target="_blank" rel="noopener noreferrer" className={A}>{S.tgNoritz.name}</a>・
            <a href={S.tgKojiArticle.url} target="_blank" rel="noopener noreferrer" className={A}>{S.tgKojiArticle.name}</a>（{checked} 確認）
          </p>
          <OyuBox lpId={LP_ID} position="sagaku" lead="エコジョーズと従来型、両方の見積もりを無料で" points={POINTS} />
        </section>

        <section className={SECTION} aria-labelledby="shikumi">
          <h2 id="shikumi" className={H2}>仕組みと見分け方</h2>
          <ul className="grid gap-2">
            <li className="flex items-start gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-slate-200">
              <Flame size={20} className="mt-0.5 shrink-0 text-sky-700" aria-hidden="true" />
              <span className="text-[14px] text-slate-800">{E.how}</span>
            </li>
            <li className="flex items-start gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-slate-200">
              <Leaf size={20} className="mt-0.5 shrink-0 text-sky-700" aria-hidden="true" />
              <span className="text-[14px] text-slate-800">{E.osusume}</span>
            </li>
          </ul>
          <div className="flex flex-col gap-2 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
            <p className="flex items-center gap-2 text-[14px] font-black text-slate-900"><Search size={18} className="text-sky-700" aria-hidden="true" />型番のハイフンのあとの文字</p>
            <div className="grid grid-cols-2 gap-2">
              {E.mark.map((m) => (
                <div key={m.maker} className="flex flex-col items-center gap-1 rounded-xl bg-sky-50 py-3">
                  <span className="text-[26px] font-black leading-none text-sky-800">{m.s}</span>
                  <span className="text-[12px] text-slate-600">{m.maker}</span>
                </div>
              ))}
            </div>
            <p className="text-[12px] text-slate-500">例：RUF-<b>E</b>160ESAW、GT-<b>C</b>1672SAW</p>
          </div>
          <p className={SRC}>出典：<a href={S.tgHowto.url} target="_blank" rel="noopener noreferrer" className={A}>{S.tgHowto.name}</a>（{checked} 確認）</p>
        </section>

        <section className={SECTION} aria-labelledby="mansion">
          <h2 id="mansion" className={H2}>マンションの扉の中の排水工事</h2>
          <div className="flex items-start gap-3 rounded-2xl bg-sky-50 p-4 ring-1 ring-sky-200">
            <span className="flex flex-col items-center gap-1 text-sky-700"><Building2 size={22} aria-hidden="true" /><Droplets size={18} aria-hidden="true" /></span>
            <p className="text-[14px] font-bold text-slate-800">{E.drain}</p>
          </div>
          <p className={SRC}>出典：<a href={S.tgKojiArticle.url} target="_blank" rel="noopener noreferrer" className={A}>{S.tgKojiArticle.name}</a>（{checked} 確認）</p>
          <p className="text-[14px] text-slate-700">置き場所ごとの値段は<Link href="/kyutoki/mansion" className={`${A} text-sky-800`}>マンション</Link>・<Link href="/kyutoki/kodate" className={`${A} text-sky-800`}>戸建て</Link>、号数は<Link href="/kyutoki/gosu-erabikata" className={`${A} text-sky-800`}>号数の選び方</Link>へ。</p>
          <OyuBox lpId={LP_ID} position="mansion" lead="置き場所の写真を送って、見積もりを無料で" points={POINTS} beacon={false} />
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
      </main>
      <OyuSticky lpId={LP_ID} />
      <LpFooter />
    </div>
  );
}
