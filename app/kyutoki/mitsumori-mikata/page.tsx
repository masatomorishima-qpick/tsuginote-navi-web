import type { Metadata } from 'next';
import Link from 'next/link';
import {
  BadgeCheck, CalendarClock, ClipboardList, Cpu, Gauge, HardHat, Leaf, MapPin, PhoneOff, Receipt, ShieldCheck, Truck, Wrench,
} from 'lucide-react';
import LpHeader from '@/components/lp/LpHeader';
import LpFooter from '@/components/lp/LpFooter';
import KyutokiNav from '@/components/kyutoki/KyutokiNav';
import LpViewTracker from '@/components/lp/LpViewTracker';
import { SITE_URL, SITE_NAME, ogImageUrl } from '@/components/loan/LoanArticle';
import { OyuBox, OyuSticky, HaifuDownload, PrNote } from '@/components/kyutoki/Haifu';
import DATA from '@/lib/kyutoki/haifu-data.json';

/**
 * 給湯器の見積もりの見方（配布物：見積もりの見方チェック表）。2026-11-04 新設。
 * 設計：docs/kyutoki-seo/plan.md の P2（枝 docs/listing-rules）。
 *   受ける言葉：見積もり 内訳／見方／何社／追加費用／処分費／撤去費用／本体 工事費／リモコン込み／配管込み／出張費／現地調査／頼み方 など52語。
 *   出口：B の受け皿 /kyutoki/mitsumori（見積もりの総額の確かめ）。紹介料のリンクは置かない。
 * 数字の元：lib/kyutoki/haifu-data.json（東京ガス「工事について」、国民生活センター 2024-02-21）。
 */

const LP_ID = 'kyutoki-mitsumori-mikata';
const VERSION = 'v3-2026-11-05';
const PAGE_PATH = '/kyutoki/mitsumori-mikata';
const TITLE = '給湯器の見積もりの見方｜内訳で確かめる10か所【チェック表つき】';
const DESCRIPTION =
  '給湯器の交換の見積書で確かめる10か所を、無料のチェック表（エクセル・PDF）にまとめました。基本工事費に入るもの・別料金になるもの、リモコン・処分費・出張費・保証の見方。';
const DATE_MODIFIED = '2026-11-04';

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

const CHECK_ICONS = [Cpu, Wrench, Leaf, MapPin, ClipboardList, HardHat, Wrench, Truck, ShieldCheck, Receipt];

const FAQS = [
  {
    q: '見積もりは何社から取ればいいですか？',
    a: '2社あれば、金額と中身の違いが分かります。同じ型番・同じ号数・同じ置き場所の条件で比べてください。条件がそろっていないと、金額だけ比べても意味がありません。',
  },
  {
    q: '基本工事費には何が入っていますか？',
    a: '東京ガスの場合、今の給湯器の取り外しと処分、リモコンの取り付け（3台まで）、配管カバー・排気アダプターの取り付け作業が入っています。部材の代金や、据え置き台・循環金具の交換などは別料金です。',
  },
  {
    q: '処分費や出張費は別にかかりますか？',
    a: '会社によって違います。東京ガスは取り外しと処分を基本工事費に入れていますが、出張費の記載はありません。見積書に項目がなければ、かかるかどうかを聞いてください。',
  },
  {
    q: '「点検します」と電話が来ました。',
    a: '電話や訪問で点検を持ちかける業者には、点検させないでください（国民生活センター）。その場で契約せず、ほかの見積もりと比べます。迷ったら消費者ホットライン「188」に相談できます。',
  },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Article', headline: TITLE, description: DESCRIPTION, inLanguage: 'ja',
      dateModified: `${DATE_MODIFIED}T09:00:00+09:00`, datePublished: '2026-11-04T09:00:00+09:00',
      mainEntityOfPage: `${SITE_URL}${PAGE_PATH}`, isPartOf: { '@id': `${SITE_URL}/#website` }, publisher: { '@id': `${SITE_URL}/#organization` },
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: SITE_NAME, item: `${SITE_URL}/` },
        { '@type': 'ListItem', position: 2, name: '給湯器', item: `${SITE_URL}/kyutoki` },
        { '@type': 'ListItem', position: 3, name: '見積もりの見方', item: `${SITE_URL}${PAGE_PATH}` },
      ],
    },
    { '@type': 'FAQPage', mainEntity: FAQS.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) },
  ],
};

const SECTION = 'flex flex-col gap-5';
const H2 = 'text-[22px] font-black leading-snug text-slate-900';
const SRC = 'text-[11px] leading-relaxed text-slate-500';
const A = 'underline underline-offset-2';
const yen = (v: number) => `${v.toLocaleString('ja-JP')}円`;

export default function MitsumoriMikataPage() {
  const S = DATA.sources;
  return (
    <div className="flex min-h-screen flex-col bg-[#f6f8fa]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <LpHeader />
      <LpViewTracker lpId={LP_ID} version={VERSION} />

      <main className="mx-auto flex w-full max-w-[520px] flex-1 flex-col gap-14 px-4 pt-4 pb-32 sm:pb-16">
        <div className="-mb-10"><PrNote /></div>
        {/* 最初の画面：配布物 */}
        <section className="flex flex-col gap-5" aria-labelledby="top">
          <div className="flex flex-col gap-2">
            <p className="text-[13px] font-bold text-sky-700">ガス給湯器の交換</p>
            <h1 id="top" className="text-[28px] font-black leading-tight text-slate-900">見積もりの見方<br />確かめる10か所</h1>
          </div>
          <HaifuDownload main="check" others={['hiyou', 'gosu']} />
        </section>

        {/* 10か所 */}
        <section className={SECTION} aria-labelledby="ten">
          <h2 id="ten" className={H2}>見積書で見る10か所</h2>
          <ol className="grid gap-2.5">
            {DATA.check.map((c, i) => {
              const I = CHECK_ICONS[i] ?? BadgeCheck;
              return (
                <li key={c.h} className="flex items-start gap-3 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-700"><I size={20} aria-hidden="true" /></span>
                  <span className="flex flex-col gap-0.5">
                    <span className="text-[15px] font-black text-slate-900"><span className="mr-1.5 text-sky-700">{i + 1}</span>{c.h}</span>
                    <span className="text-[13px] leading-relaxed text-slate-600">{c.d}</span>
                  </span>
                </li>
              );
            })}
          </ol>
        </section>

        {/* 基本工事費に入るもの・入らないもの */}
        <section className={SECTION} aria-labelledby="koji">
          <h2 id="koji" className={H2}>基本工事費に入るもの</h2>
          <div className="grid gap-2.5">
            <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
              <p className="flex items-center gap-2 text-[15px] font-black text-emerald-700"><BadgeCheck size={20} aria-hidden="true" />入る</p>
              <ul className="mt-2 flex flex-col gap-1.5 text-[14px] text-slate-700">
                {DATA.kojiIncluded.map((t) => <li key={t}>・{t}</li>)}
              </ul>
            </div>
            <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
              <p className="flex items-center gap-2 text-[15px] font-black text-orange-600"><Receipt size={20} aria-hidden="true" />別料金になる例</p>
              <ul className="mt-2 flex flex-col gap-1.5 text-[14px] text-slate-700">
                {DATA.kojiExtra.map((t) => <li key={t}>・{t}</li>)}
              </ul>
            </div>
          </div>
          <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200">
            <table className="w-full text-[14px]">
              <caption className="bg-slate-50 px-4 py-2 text-left text-[13px] font-bold text-slate-700">基本工事費（税込）</caption>
              <tbody>
                {DATA.kojiBase.map((k) => (
                  <tr key={k.kind + k.eff} className="border-t border-slate-100">
                    <td className="px-4 py-2 text-slate-700">{k.kind}</td>
                    <td className="px-2 py-2 text-slate-500">{k.eff}</td>
                    <td className="px-4 py-2 text-right font-bold tabular-nums text-slate-900">{yen(k.yen)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className={SRC}>
            出典：<a href={S.tgKoji.url} target="_blank" rel="noopener noreferrer" className={A}>{S.tgKoji.name}</a>（{DATA.checkedAt.split('-').join('/')} 確認）。他社では処分費や出張費を別にすることがあります。
          </p>
        </section>

        {/* 2社で比べる */}
        <section className={SECTION} aria-labelledby="hikaku">
          <h2 id="hikaku" className={H2}>2社で比べるときは</h2>
          <ul className="grid grid-cols-3 gap-2">
            {[
              { icon: Cpu, h: '同じ型番' },
              { icon: Gauge, h: '同じ号数' },
              { icon: MapPin, h: '同じ置き場所' },
            ].map(({ icon: I, h }) => (
              <li key={h} className="flex flex-col items-center gap-1.5 rounded-2xl bg-white px-2 py-4 text-center ring-1 ring-slate-200">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-50 text-sky-700"><I size={20} aria-hidden="true" /></span>
                <span className="text-[14px] font-black text-slate-900">{h}</span>
              </li>
            ))}
          </ul>
          <p className="text-[14px] text-slate-700">条件をそろえてから、総額（税込）で比べます。目安の金額は<Link href="/kyutoki/kokan-hiyou#hyou" className={`${A} text-sky-800`}>費用の目安表</Link>にあります。</p>
          <OyuBox lpId={LP_ID} position="hikaku" lead="2社目の見積もりを無料で" points={['出張料・見積もり・キャンセル料は無料', '最短30分で来てくれる', '工事は10年保証']} />
        </section>

        {/* 点検商法 */}
        <section className={SECTION} aria-labelledby="chui">
          <h2 id="chui" className={H2}>「点検します」に注意</h2>
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
          金額は設置の状況で変わります。最終的な金額は見積書で確かめてください。最終更新：2026年11月4日
        </p>
        <KyutokiNav current={PAGE_PATH} />
      </main>
      <OyuSticky lpId={LP_ID} />
      <LpFooter />
    </div>
  );
}
