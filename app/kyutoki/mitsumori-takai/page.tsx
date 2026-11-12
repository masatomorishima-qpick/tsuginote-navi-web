import type { Metadata } from 'next';
import Link from 'next/link';
import {
  CalendarClock, Gauge, Leaf, Maximize2, PhoneOff, Receipt, ShieldCheck, SlidersHorizontal, Tag, Wrench,
} from 'lucide-react';
import LpHeader from '@/components/lp/LpHeader';
import LpFooter from '@/components/lp/LpFooter';
import KyutokiNav from '@/components/kyutoki/KyutokiNav';
import LpViewTracker from '@/components/lp/LpViewTracker';
import { SITE_URL, SITE_NAME, ogImageUrl } from '@/components/loan/LoanArticle';
import { OyuBox, OyuSticky, HaifuDownload, PrNote } from '@/components/kyutoki/Haifu';
import DATA from '@/lib/kyutoki/haifu-data.json';

/**
 * 給湯器の見積もりが高いと感じたとき。2026-11-05 公開。
 * 設計：docs/kyutoki-seo/schedule.md の P11（枝 docs/listing-rules）。
 *   受ける言葉：見積もり 高い／妥当／高すぎ、15万〜60万 相場、相見積もり、交渉／値引き、ぼったくり など148語。
 *   出口：お湯が出ない.com だけ（11/5 に GAS-Q から変更。1クリックの稼ぎ 53円→858円）（1ページに1つ。docs/kyutoki-seo/pdca.md の「出口の決まり」）。
 * 数字の元：lib/kyutoki/haifu-data.json（東京ガスの販売価格・相場・工事、リンナイの希望小売価格、国民生活センター）。
 *   差額は、同じ号数・同じメーカーの東京ガスの販売価格（工事費込み・税込）どうしの差。
 */

const LP_ID = 'kyutoki-mitsumori-takai';
const VERSION = 'v2-2026-11-05';
const PAGE_PATH = '/kyutoki/mitsumori-takai';
const TITLE = '給湯器の見積もりが高い？｜金額の目安と、高くなる理由【相場の図つき】';
const DESCRIPTION =
  '給湯器の交換の見積もりが高いか、目安の金額と比べられます。種類ごとの総額（工事費込み）、エコジョーズ・細身の型・号数で上がる金額、「定価から値引き」の見方、2社目の取り方。';
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

const P = DATA.prices;
const price = (kind: string, eff: string, place: string, maker: string) =>
  P.find((p) => p.kind === kind && p.eff === eff && p.place === place && p.maker === maker)?.yen ?? 0;
const FURO = 'ふろ給湯器（オート）';
const base = price(FURO, '従来型', '壁掛', 'リンナイ');
const eco = price(FURO, 'エコジョーズ', '壁掛', 'リンナイ');
const hoso = price(FURO, 'エコジョーズ', '壁掛（細身）', 'リンナイ');
const ps = price(FURO, '従来型', 'PS', 'リンナイ');
const teika = (gosu: string, func: string) => DATA.teika.find((t) => t.gosu === gosu && t.func === func)?.yen ?? 0;
const man = (v: number) => (v < 10000 ? `約${Math.round(v / 1000)}千円` : `約${(Math.round(v / 1000) / 10).toLocaleString('ja-JP')}万円`);
const teikaMin = Math.min(...DATA.teika.map((t) => t.yen));
const teikaMax = Math.max(...DATA.teika.map((t) => t.yen));

const REASONS = [
  { icon: Leaf, h: 'エコジョーズ', v: `+${man(eco - base)}`, d: 'ガス代は減るが、本体が高い（16号オート）' },
  { icon: Maximize2, h: '細身の型', v: `+${man(hoso - eco)}`, d: '壁掛けで、置き場所がせまいときの型' },
  { icon: Gauge, h: '号数を上げる', v: `+${man(teika('24号', 'オート') - teika('16号', 'オート'))}`, d: '定価で16号→24号。ガスメーターの交換が要ることも' },
  { icon: SlidersHorizontal, h: '扉の中・据え置き', v: `+${man(ps - base)}`, d: '壁掛けとの差は小さい' },
  { icon: Wrench, h: '追加の工事', v: '別料金', d: DATA.kojiExtra.slice(0, 3).join('・') },
];

const SCALE = 40; // 図の右端（万円）

const FAQS = [
  {
    q: '50万円の見積もりは高いですか？',
    a: '暖房のないふろ給湯器なら、東京ガスの総額の目安（17〜24万円）の2倍以上です。暖房付きでも30〜35万円が目安です。見積書の型番・号数・追加の工事を確かめ、同じ条件で2社目の見積もりを取ってください。',
  },
  {
    q: '「定価から6割引き」と書かれていました。',
    a: '定価はメーカーの希望小売価格です。リンナイのふろ給湯器（16〜24号）は40万〜53万円ほどですが、東京ガスが示す工事費込みの総額の目安は17万〜24万円です。値引きの率ではなく、工事費込みの総額（税込）で比べてください。',
  },
  {
    q: '値引きの交渉はできますか？',
    a: '同じ型番・同じ工事の内容で、もう1社の見積もりがあると話が早くなります。条件がそろっていない見積もりどうしでは、金額の差の理由が分かりません。',
  },
  {
    q: '訪問してきた業者と契約してしまいました。',
    a: '訪問販売で契約したときは、クーリング・オフができる場合があります。迷ったら、消費者ホットライン「188」に相談してください（国民生活センター）。',
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
        { '@type': 'ListItem', position: 2, name: '給湯器', item: `${SITE_URL}/kyutoki` },
        { '@type': 'ListItem', position: 3, name: '見積もりが高いとき', item: `${SITE_URL}${PAGE_PATH}` },
      ],
    },
    { '@type': 'FAQPage', mainEntity: FAQS.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) },
  ],
};

const SECTION = 'flex flex-col gap-5';
const H2 = 'text-[22px] font-black leading-snug text-slate-900';
const SRC = 'text-[11px] leading-relaxed text-slate-500';
const A = 'underline underline-offset-2';

export default function MitsumoriTakaiPage() {
  const S = DATA.sources;
  const checked = DATA.checkedAt.split('-').join('/');
  return (
    <div className="flex min-h-screen flex-col bg-[#f6f8fa]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <LpHeader />
      <LpViewTracker lpId={LP_ID} version={VERSION} />

      <main className="mx-auto flex w-full max-w-[520px] flex-1 flex-col gap-14 px-4 pt-4 pb-32 sm:pb-16">
        <div className="-mb-10"><PrNote /></div>

        {/* 最初の画面：目安の帯 */}
        <section className="flex flex-col gap-5" aria-labelledby="top">
          <div className="flex flex-col gap-2">
            <p className="text-[13px] font-bold text-sky-700">ガス給湯器の交換</p>
            <h1 id="top" className="text-[28px] font-black leading-tight text-slate-900">見積もりが高いとき<br />目安の金額</h1>
          </div>
          <figure className="flex flex-col gap-3 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
            <figcaption className="text-[13px] font-bold text-slate-700">工事費込み・税込の総額（東京ガス）</figcaption>
            {DATA.souba.map((b) => (
              <div key={b.kind} className="flex flex-col gap-1">
                <div className="flex items-baseline justify-between">
                  <span className="text-[14px] font-black text-slate-900">{b.kind}</span>
                  <span className="text-[16px] font-black text-orange-600">{b.label}</span>
                </div>
                <div className="relative h-3 rounded-full bg-slate-100" aria-hidden="true">
                  <div
                    className="absolute inset-y-0 rounded-full bg-sky-600"
                    style={{ left: `${(b.min / SCALE) * 100}%`, width: `${((b.max - b.min) / SCALE) * 100}%` }}
                  />
                </div>
              </div>
            ))}
            <div className="flex justify-between text-[10px] text-slate-400" aria-hidden="true">
              <span>0</span><span>10万</span><span>20万</span><span>30万</span><span>40万円</span>
            </div>
          </figure>
          <p className="text-[14px] text-slate-700">見積もりが帯より高ければ、下の「高くなる理由」が入っていないかを見ます。</p>
          <HaifuDownload main="hiyou" others={['check']} />
          <p className={SRC}>出典：<a href={S.tgHowto.url} target="_blank" rel="noopener noreferrer" className={A}>{S.tgHowto.name}</a>（{checked} 確認）</p>
        </section>

        {/* 高くなる理由 */}
        <section className={SECTION} aria-labelledby="riyu">
          <h2 id="riyu" className={H2}>高くなる理由</h2>
          <ul className="grid gap-2">
            {REASONS.map(({ icon: I, h, v, d }) => (
              <li key={h} className="flex items-center gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-slate-200">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-700"><I size={20} aria-hidden="true" /></span>
                <span className="flex flex-1 flex-col">
                  <span className="text-[15px] font-black text-slate-900">{h}</span>
                  <span className="text-[12px] leading-snug text-slate-600">{d}</span>
                </span>
                <span className="shrink-0 text-[15px] font-black text-orange-600">{v}</span>
              </li>
            ))}
          </ul>
          <p className={SRC}>
            差額は、東京ガスの販売価格（リンナイのふろ給湯器16号オート、工事費込み・税込）どうしの差。号数は
            <a href={S.rinnaiRufe.url} target="_blank" rel="noopener noreferrer" className={A}>リンナイの希望小売価格</a>の差。
            出典：<a href={S.tgRinnai.url} target="_blank" rel="noopener noreferrer" className={A}>{S.tgRinnai.name}</a>・
            <a href={S.tgKoji.url} target="_blank" rel="noopener noreferrer" className={A}>{S.tgKoji.name}</a>（{checked} 確認）
          </p>
        </section>

        {/* 定価と値引き */}
        <section className={SECTION} aria-labelledby="teika">
          <h2 id="teika" className={H2}>「定価から値引き」の見方</h2>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col items-center gap-1 rounded-2xl bg-white px-2 py-4 text-center ring-1 ring-slate-200">
              <Tag size={20} className="text-slate-500" aria-hidden="true" />
              <span className="text-[12px] font-bold text-slate-600">メーカーの定価</span>
              <span className="text-[17px] font-black text-slate-900">{Math.floor(teikaMin / 10000)}万〜{Math.round(teikaMax / 10000)}万円</span>
              <span className="text-[11px] text-slate-500">本体だけ</span>
            </div>
            <div className="flex flex-col items-center gap-1 rounded-2xl bg-white px-2 py-4 text-center ring-1 ring-sky-200">
              <Receipt size={20} className="text-sky-700" aria-hidden="true" />
              <span className="text-[12px] font-bold text-slate-600">実際の総額の目安</span>
              <span className="text-[17px] font-black text-orange-600">{DATA.souba[1].label}</span>
              <span className="text-[11px] text-slate-500">工事費込み</span>
            </div>
          </div>
          <p className="text-[14px] text-slate-700">ふろ給湯器（16〜24号）の例です。定価は高く書かれるので、「〇割引き」は大きく見えます。比べるのは<strong>工事費込みの総額（税込）</strong>だけです。</p>
          <p className={SRC}>
            出典：<a href={S.rinnaiRufe.url} target="_blank" rel="noopener noreferrer" className={A}>{S.rinnaiRufe.name}</a>（希望小売価格）・
            <a href={S.tgHowto.url} target="_blank" rel="noopener noreferrer" className={A}>{S.tgHowto.name}</a>（{checked} 確認）
          </p>
        </section>

        {/* 2社目 */}
        <section className={SECTION} aria-labelledby="hikaku">
          <h2 id="hikaku" className={H2}>2社目の見積もり</h2>
          <p className="text-[14px] text-slate-700">
            型番・号数・置き場所をそろえて、もう1社に出してもらいます。見積書で確かめる10か所は<Link href="/kyutoki/mitsumori-mikata" className={`${A} text-sky-800`}>見積もりの見方</Link>にあります。
          </p>
          <OyuBox lpId={LP_ID} position="hikaku" lead="今の見積もりと比べる2社目を、無料で" points={['出張料・見積もり・キャンセル料は無料', '最短30分で来てくれる', '工事は10年保証']} />
        </section>

        {/* 急がされたとき */}
        <section className={SECTION} aria-labelledby="chui">
          <h2 id="chui" className={H2}>契約を急がせる業者に注意</h2>
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
          金額は設置の状況で変わります。最終的な金額は見積書で確かめてください。最終更新：2026年11月5日
        </p>
        <KyutokiNav current={PAGE_PATH} />
      </main>
      <OyuSticky lpId={LP_ID} />
      <LpFooter />
    </div>
  );
}
