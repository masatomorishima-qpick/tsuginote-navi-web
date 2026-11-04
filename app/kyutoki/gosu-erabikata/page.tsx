import type { Metadata } from 'next';
import Link from 'next/link';
import { Bath, CookingPot, Droplets, Gauge, Scan, TriangleAlert, User, Users } from 'lucide-react';
import LpHeader from '@/components/lp/LpHeader';
import LpFooter from '@/components/lp/LpFooter';
import LpViewTracker from '@/components/lp/LpViewTracker';
import { SITE_URL, SITE_NAME, ogImageUrl } from '@/components/loan/LoanArticle';
import { GasqBox, GasqSticky, HaifuDownload, PrNote } from '@/components/kyutoki/Haifu';
import DATA from '@/lib/kyutoki/haifu-data.json';

/**
 * 給湯器の号数の選び方（配布物：号数の選び方の表）。2026-11-04 新設。
 * 設計：docs/kyutoki-seo/plan.md の P3（枝 docs/listing-rules）。
 *   受ける言葉：16号／20号／24号 交換 費用、20号 24号 どっち、号数 上げる 費用、3〜5人家族 など101語。
 *   出口：B の受け皿 /kyutoki/mitsumori。紹介料のリンクは置かない。
 * 数字の元：lib/kyutoki/haifu-data.json（リンナイ「号数（能力）について」、東京ガス「給湯器の選び方」、リンナイの希望小売価格）。
 */

const LP_ID = 'kyutoki-gosu-erabikata';
const VERSION = 'v2-2026-11-04';
const PAGE_PATH = '/kyutoki/gosu-erabikata';
const TITLE = '給湯器の号数の選び方｜16号・20号・24号の目安と費用の差【表つき】';
const DESCRIPTION =
  '給湯器の号数（16号・20号・24号）を、家族の人数と同時に使う場所の数で選ぶ目安を表にしました（PDF無料）。号数を上げる・下げるときの注意、号数の確かめ方、号数で変わる費用の差。';
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

const FAQS = [
  {
    q: '20号と24号、どっちがいいですか？',
    a: 'お湯を同時に使う場所の数で決まります。浴室と台所の2か所までなら20号、浴室・台所・洗面所の3か所を冬でも同時に使うなら24号が目安です（リンナイ）。迷ったら今と同じ号数にします。',
  },
  {
    q: '号数を上げると、費用はどのくらい変わりますか？',
    a: 'リンナイのふろ給湯器（オート）の定価では、16号→20号で35,200円、20号→24号で29,700円の差です。実際の販売価格は値引きがあり、店ごとに違います。号数を上げるとガスメーターの交換が要ることもあります（東京ガス）。',
  },
  {
    q: '今の号数はどこで分かりますか？',
    a: '給湯器の本体に貼ってあるシールの型番で分かります。型番の最初に出てくる2けたの数字が号数です。たとえば GT-2027SAWX なら20号です（東京ガス）。',
  },
  {
    q: '号数を下げて安くしてもいいですか？',
    a: '2か所で同時に使うと、お湯の出が悪くなることがあります（東京ガス）。家族の人数が減った場合でも、同時に使う場所の数で考えてください。',
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
        { '@type': 'ListItem', position: 2, name: 'ガス給湯器の交換費用', item: `${SITE_URL}/kyutoki/kokan-hiyou` },
        { '@type': 'ListItem', position: 3, name: '号数の選び方', item: `${SITE_URL}${PAGE_PATH}` },
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

/** 同時に使う場所のアイコン（1か所＝浴室、2か所＝浴室＋台所、3か所＝浴室＋台所＋洗面所） */
const PLACE_ICONS = [Bath, CookingPot, Droplets];

export default function GosuErabikataPage() {
  const S = DATA.sources;
  const auto = DATA.teika.filter((t) => t.func === 'オート');
  return (
    <div className="flex min-h-screen flex-col bg-[#f6f8fa]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <LpHeader />
      <LpViewTracker lpId={LP_ID} version={VERSION} />

      <main className="mx-auto flex w-full max-w-[520px] flex-1 flex-col gap-14 px-4 pt-4 pb-32 sm:pb-16">
        <div className="-mb-10"><PrNote /></div>
        {/* 最初の画面：3つの号数 */}
        <section className="flex flex-col gap-5" aria-labelledby="top">
          <div className="flex flex-col gap-2">
            <p className="text-[13px] font-bold text-sky-700">ガス給湯器の交換</p>
            <h1 id="top" className="text-[28px] font-black leading-tight text-slate-900">号数の選び方<br />16号・20号・24号</h1>
          </div>
          <ul className="grid gap-2.5">
            {DATA.gosu.map((g, i) => (
              <li key={g.gosu} className="flex items-center gap-4 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                <span className="w-[64px] shrink-0 text-[26px] font-black text-orange-600">{g.gosu}</span>
                <span className="flex flex-1 flex-col gap-1.5">
                  <span className="flex items-center gap-1.5 text-[14px] font-bold text-slate-900">
                    {i === 0 ? <User size={16} aria-hidden="true" /> : <Users size={16} aria-hidden="true" />}
                    {g.people}
                    <span className="ml-1 flex items-center gap-0.5 text-sky-700" aria-label={`同時に${g.places}`}>
                      {PLACE_ICONS.slice(0, i + 1).map((P, j) => <P key={j} size={16} aria-hidden="true" />)}
                    </span>
                    <span className="text-[12px] font-normal text-slate-500">同時に{g.places}</span>
                  </span>
                  <span className="text-[13px] text-slate-600">{g.use}</span>
                </span>
              </li>
            ))}
          </ul>
          <p className={SRC}>
            冬（水温5℃）に、シャワー40℃・毎分12リットル、台所40℃・毎分5リットルで使う場合の目安。出典：<a href={S.rinnaiGosu.url} target="_blank" rel="noopener noreferrer" className={A}>{S.rinnaiGosu.name}</a>
          </p>
          <HaifuDownload main="gosu" others={['hiyou', 'check']} />
        </section>

        {/* 号数とは */}
        <section className={SECTION} aria-labelledby="toha">
          <h2 id="toha" className={H2}>号数は「一度に出るお湯の量」</h2>
          <div className="flex items-center gap-4 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-700"><Gauge size={26} aria-hidden="true" /></span>
            <p className="text-[14px] leading-relaxed text-slate-700"><b>24号</b>なら、水温より25℃高いお湯が<b>1分間に24リットル</b>出ます。</p>
          </div>
        </section>

        {/* 変えるときの注意 */}
        <section className={SECTION} aria-labelledby="chui">
          <h2 id="chui" className={H2}>号数を変えるときの注意</h2>
          <div className="grid grid-cols-2 gap-2.5">
            <div className="flex flex-col gap-2 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
              <span className="text-[15px] font-black text-slate-900">上げる</span>
              <span className="text-[13px] text-slate-600">お湯は増えるが、ガスメーターの交換が要ることがある</span>
            </div>
            <div className="flex flex-col gap-2 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
              <span className="text-[15px] font-black text-slate-900">下げる</span>
              <span className="text-[13px] text-slate-600">2か所で同時に使うと、お湯の出が悪くなることがある</span>
            </div>
          </div>
          <p className="flex items-center gap-2 rounded-2xl bg-slate-50 px-4 py-3 text-[14px] text-slate-700">
            <TriangleAlert size={20} className="shrink-0 text-orange-600" aria-hidden="true" />迷ったら、今と同じ号数
          </p>
          <p className={SRC}>出典：<a href={S.tgHowto.url} target="_blank" rel="noopener noreferrer" className={A}>{S.tgHowto.name}</a></p>
        </section>

        {/* 確かめ方 */}
        <section className={SECTION} aria-labelledby="tashikame">
          <h2 id="tashikame" className={H2}>今の号数の確かめ方</h2>
          <div className="flex items-center gap-4 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-700"><Scan size={26} aria-hidden="true" /></span>
            <p className="text-[14px] leading-relaxed text-slate-700">
              本体のシールの型番を見る。<br />
              GT-<b className="text-orange-600">20</b>27SAWX → <b>20号</b>
            </p>
          </div>
          <p className="text-[13px] text-slate-600">写真を撮っておくと、見積もりの話が早く進みます。</p>
        </section>

        {/* 費用の差 */}
        <section className={SECTION} aria-labelledby="sa">
          <h2 id="sa" className={H2}>号数で変わる費用の差</h2>
          <ul className="grid grid-cols-3 gap-2">
            {auto.map((t, i) => (
              <li key={t.model} className="flex flex-col items-center gap-1 rounded-2xl bg-white px-2 py-4 text-center ring-1 ring-slate-200">
                <span className="text-[16px] font-black text-slate-900">{t.gosu}</span>
                <span className="text-[12px] tabular-nums text-slate-600">{yen(t.yen)}</span>
                {i > 0 && <span className="text-[12px] font-bold tabular-nums text-orange-600">＋{yen(t.yen - auto[i - 1].yen)}</span>}
              </li>
            ))}
          </ul>
          <p className={SRC}>
            リンナイのふろ給湯器（オート、RUF-E シリーズ）の希望小売価格（税込、本体のみ）。実際の販売価格は値引きがあり、店ごとに違います。出典：<a href={S.rinnaiRufe.url} target="_blank" rel="noopener noreferrer" className={A}>{S.rinnaiRufe.name}</a>
          </p>
          <p className="text-[14px] text-slate-700">工事費込みの総額の目安は<Link href="/kyutoki/kokan-hiyou#hyou" className={`${A} text-sky-800`}>費用の目安表</Link>にあります。</p>
          <GasqBox
            lpId={LP_ID}
            position="sa"
            lead="号数が分かれば、見積もりは早い"
            points={['現地調査・見積もり無料', '在庫があれば、その場で工事日が決まる', '本体・工事とも10年保証']}
          />
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
          号数の目安は一般的なもので、配管の長さや水圧で変わります。最終更新：2026年11月4日
        </p>
      </main>
      <GasqSticky lpId={LP_ID} />
      <LpFooter />
    </div>
  );
}
