import type { Metadata } from 'next';
import Link from 'next/link';
import { Equal, Factory, Gauge, Layers, MapPin } from 'lucide-react';
import LpHeader from '@/components/lp/LpHeader';
import LpFooter from '@/components/lp/LpFooter';
import KyutokiNav from '@/components/kyutoki/KyutokiNav';
import LpViewTracker from '@/components/lp/LpViewTracker';
import { SITE_URL, SITE_NAME, ogImageUrl } from '@/components/loan/LoanArticle';
import { HaifuDownload, OyuBox, OyuSticky, PrNote } from '@/components/kyutoki/Haifu';
import DATA from '@/lib/kyutoki/haifu-data.json';

/**
 * メーカーで迷っている（リンナイ・ノーリツ・パロマ・パーパス）（P8、2026-11-07 公開）。docs/kyutoki-seo/schedule.md。
 *   受ける言葉：ノーリツ／リンナイ／パロマ／パーパス 給湯器 交換 費用、メーカー 値段 違い など43語（約1,300回/月）。
 *   出口：お湯が出ない.com だけ（各メーカーに対応と公式に記載）。
 * 元：東京ガスの販売価格（リンナイとノーリツの同じ型どうし。パロマ・パーパスは東京ガスの表に載っていないので値段は比べない）。
 */
const LP_ID = 'kyutoki-maker';
const VERSION = 'v1-2026-11-07';
const PAGE_PATH = '/kyutoki/maker';
const TITLE = '給湯器のメーカーで値段は変わる？｜リンナイとノーリツ、同じ型での差は数千円〜1万円ほど';
const DESCRIPTION = 'リンナイ・ノーリツなど給湯器のメーカーで、交換費用はどれくらい変わるか。同じ号数・機能・置き場所どうしで比べた東京ガスの販売価格では、差は約1.5千円〜1.1万円で、どちらが安いかは型ごとに入れ替わります。値段を決めるのはメーカーより種類・号数・置き場所です。';

export const metadata: Metadata = {
  title: `${TITLE} | ${SITE_NAME}`,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}${PAGE_PATH}` },
  openGraph: { title: TITLE, description: DESCRIPTION, url: `${SITE_URL}${PAGE_PATH}`, siteName: SITE_NAME, type: 'article', locale: 'ja_JP', images: [{ url: ogImageUrl(TITLE), width: 1200, height: 630, alt: TITLE }] },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, images: [ogImageUrl(TITLE)] },
};

type Row = { label: string; r: number; n: number };
const P = DATA.prices;
const yen = (maker: string, kind: string, gosu: string, eff: string, place: string) =>
  P.find((p) => p.maker === maker && p.kind === kind && p.gosu === gosu && p.eff === eff && p.place === place)?.yen ?? 0;
const ROWS: Row[] = [
  ['給湯専用 16号', '給湯専用', '16号', '従来型', '壁掛'],
  ['給湯専用 16号 エコジョーズ', '給湯専用', '16号', 'エコジョーズ', '壁掛'],
  ['ふろ 16号オート', 'ふろ給湯器（オート）', '16号', '従来型', '壁掛'],
  ['ふろ 16号オート エコジョーズ', 'ふろ給湯器（オート）', '16号', 'エコジョーズ', '壁掛'],
  ['ふろ 16号オート 細身', 'ふろ給湯器（オート）', '16号', 'エコジョーズ', '壁掛（細身）'],
  ['暖房付き 24号', '暖房付き（オート）', '24号', '従来型', '壁掛'],
  ['暖房付き 24号 エコジョーズ', '暖房付き（オート）', '24号', 'エコジョーズ', '壁掛'],
].map(([label, kind, gosu, eff, place]) => ({ label, r: yen('リンナイ', kind, gosu, eff, place), n: yen('ノーリツ', kind, gosu, eff, place) }));
const diffs = ROWS.map((x) => Math.abs(x.r - x.n));
const man = (v: number) => `${(Math.round(v / 1000) / 10).toLocaleString('ja-JP')}万円`;
const sen = (v: number) => (v < 10000 ? `${(Math.round(v / 100) / 10).toLocaleString('ja-JP')}千円` : man(v));

const FAQS = [
  { q: 'どのメーカーがいいですか？', a: '同じ号数・機能・置き場所なら、リンナイとノーリツの値段の差は数千円〜1万円ほどで、どちらが安いかは型ごとに入れ替わります（東京ガスの販売価格）。今と同じメーカーにすると、リモコンや配管の合わせが分かりやすいことがあります。' },
  { q: 'パロマやパーパスはどうですか？', a: 'このページで比べている東京ガスの販売価格の表には、パロマ・パーパスは載っていません。同じ条件で見積もりを取って、総額で比べてください。' },
  { q: '今と違うメーカーにできますか？', a: '置き場所の型と号数が合えば、メーカーを替えることはできます。見積もりのときに、今の型番を伝えてください。' },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    { '@type': 'Article', headline: TITLE, description: DESCRIPTION, inLanguage: 'ja', dateModified: '2026-11-07T09:00:00+09:00', datePublished: '2026-11-07T09:00:00+09:00', mainEntityOfPage: `${SITE_URL}${PAGE_PATH}`, isPartOf: { '@id': `${SITE_URL}/#website` }, publisher: { '@id': `${SITE_URL}/#organization` } },
    { '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: SITE_NAME, item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: '給湯器', item: `${SITE_URL}/kyutoki` },
      { '@type': 'ListItem', position: 3, name: '給湯器のメーカーと値段', item: `${SITE_URL}${PAGE_PATH}` },
    ] },
    { '@type': 'FAQPage', mainEntity: FAQS.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) },
  ],
};

const SECTION = 'flex flex-col gap-5';
const H2 = 'text-[22px] font-black leading-snug text-slate-900';
const SRC = 'text-[11px] leading-relaxed text-slate-500';
const A = 'underline underline-offset-2';
const POINTS = ['リンナイ・ノーリツ・パロマなど各メーカーに対応', '出張料・見積もり・キャンセル料は無料', '工事は10年保証'];

export default function MakerPage() {
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
            <h1 id="top" className="text-[28px] font-black leading-tight text-slate-900">給湯器のメーカーと値段<br /><span className="text-orange-600">差は数千円〜1万円</span></h1>
          </div>
          <div className="flex flex-col items-center gap-1 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
            <div className="flex items-center gap-3">
              <span className="whitespace-nowrap text-[17px] font-black text-slate-900">リンナイ</span>
              <Equal size={22} className="text-slate-400" aria-hidden="true" />
              <span className="whitespace-nowrap text-[17px] font-black text-slate-900">ノーリツ</span>
            </div>
            <span className="text-[12px] text-slate-500">同じ型なら、差は{sen(Math.min(...diffs))}〜{sen(Math.max(...diffs))}</span>
          </div>
          <p className="text-[14px] text-slate-700">値段を大きく決めるのは、メーカーより次の3つです。</p>
          <ul className="grid grid-cols-3 gap-2">
            {[{ icon: Layers, h: '種類', d: '給湯専用・ふろ・暖房付き' }, { icon: Gauge, h: '号数', d: '16・20・24号' }, { icon: MapPin, h: '置き場所', d: '壁掛け・扉の中・細身' }].map(({ icon: I, h, d }) => (
              <li key={h} className="flex flex-col items-center gap-1 rounded-2xl bg-white px-2 py-3 text-center ring-1 ring-slate-200">
                <I size={20} className="text-sky-700" aria-hidden="true" />
                <span className="text-[14px] font-black text-slate-900">{h}</span>
                <span className="text-[10px] leading-snug text-slate-500">{d}</span>
              </li>
            ))}
          </ul>
          <HaifuDownload main="hiyou" others={['gosu']} />
        </section>

        <section className={SECTION} aria-labelledby="hikaku">
          <h2 id="hikaku" className={H2}>同じ型で比べた値段</h2>
          <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="bg-slate-50 text-[11px] text-slate-600">
                  <th className="px-3 py-2 text-left font-bold">型（壁掛け）</th>
                  <th className="px-2 py-2 text-right font-bold">リンナイ</th>
                  <th className="px-2 py-2 text-right font-bold">ノーリツ</th>
                </tr>
              </thead>
              <tbody>
                {ROWS.map((x) => (
                  <tr key={x.label} className="border-t border-slate-100">
                    <td className="px-3 py-2.5 text-slate-800">{x.label}</td>
                    {[x.r, x.n].map((v, i) => (
                      <td key={i} className={`px-2 py-2.5 text-right tabular-nums ${v <= Math.min(x.r, x.n) ? 'font-black text-orange-600' : 'text-slate-700'}`}>{man(v)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className={SRC}>
            東京ガスの販売価格（工事費込み・税込）。オレンジは安いほう。出典：
            <a href={S.tgRinnai.url} target="_blank" rel="noopener noreferrer" className={A}>{S.tgRinnai.name}</a>・
            <a href={S.tgNoritz.url} target="_blank" rel="noopener noreferrer" className={A}>{S.tgNoritz.name}</a>（{checked} 確認）。パロマ・パーパスはこの表に載っていません。
          </p>
          <p className="flex items-start gap-2 text-[14px] text-slate-700"><Factory size={18} className="mt-0.5 shrink-0 text-sky-700" aria-hidden="true" />どちらが安いかは型ごとに入れ替わります。迷ったら、今と同じメーカー・号数・置き場所で見積もりを取ります。</p>
          <p className="text-[14px] text-slate-700">機能の違いは<Link href="/kyutoki/furo" className={`${A} text-sky-800`}>お風呂の給湯器</Link>、置き場所は<Link href="/kyutoki/kodate" className={`${A} text-sky-800`}>戸建て</Link>・<Link href="/kyutoki/mansion" className={`${A} text-sky-800`}>マンション</Link>のページへ。</p>
          <OyuBox lpId={LP_ID} position="hikaku" lead="今の型番を伝えて、見積もりを無料で" points={POINTS} />
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
        <p className="text-[11px] leading-relaxed text-slate-400">金額は設置の状況で変わります。最終更新：2026年11月7日</p>
        <KyutokiNav current={PAGE_PATH} />
      </main>
      <OyuSticky lpId={LP_ID} />
      <LpFooter />
    </div>
  );
}
