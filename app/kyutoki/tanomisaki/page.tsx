import type { Metadata } from 'next';
import Link from 'next/link';
import { AlertTriangle, ArrowRight, Building2, Check, Factory, Wrench } from 'lucide-react';
import LpHeader from '@/components/lp/LpHeader';
import LpFooter from '@/components/lp/LpFooter';
import KyutokiNav from '@/components/kyutoki/KyutokiNav';
import LpViewTracker from '@/components/lp/LpViewTracker';
import { SITE_URL, SITE_NAME, ogImageUrl } from '@/components/loan/LoanArticle';
import { HaifuDownload, OyuBox, OyuSticky, PrNote } from '@/components/kyutoki/Haifu';
import DATA from '@/lib/kyutoki/haifu-data.json';

/**
 * 給湯器の交換・修理の頼み先（P12、2026-11-08 作成）。docs/seisaku-queue.md。
 *   受ける言葉：給湯器 交換 どこに頼む（どこがいい）、給湯器 業者 選び方、給湯器 修理 どこに頼む。
 *   出口：お湯が出ない.com だけ。急ぐ人の頼み先として置く。急がない人にはガス会社の見積もりと比べることも書く（訪問者の立場を優先）。
 * 元：お湯が出ない.com 公式（2026-11-08 再確認：最短30分・修理45分〜・2.2万円〜・即日交換最短80分・工事10年保証）、
 *   東京ガス（写真の見積もり・最短当日・追加費用なし・約92%・工事保証2年）、ノーリツ（修理のご依頼・取り替え）。
 *   会社名は見出しに入れず、各頼み先の例として小さく書く（docs/kyutoki-seo/page-guide.md）。
 */
const LP_ID = 'kyutoki-tanomisaki';
const VERSION = 'v1-2026-11-08';
const PAGE_PATH = '/kyutoki/tanomisaki';
const TITLE = '給湯器の交換・修理はどこに頼む？｜急ぎは地域の工事会社、比べるならガス会社';
const DESCRIPTION = 'ガス給湯器の頼み先は、地域の工事会社・ガス会社・メーカーの3つ。今日お湯を出したいなら地域の工事会社、急がず値段を比べたいならガス会社、保証の期間内ならメーカー。それぞれの速さ・値段・保証を、各社の公式の記載で比べました。';

export const metadata: Metadata = {
  title: `${TITLE} | ${SITE_NAME}`,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}${PAGE_PATH}` },
  openGraph: { title: TITLE, description: DESCRIPTION, url: `${SITE_URL}${PAGE_PATH}`, siteName: SITE_NAME, type: 'article', locale: 'ja_JP', images: [{ url: ogImageUrl(TITLE), width: 1200, height: 630, alt: TITLE }] },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, images: [ogImageUrl(TITLE)] },
};

const T = DATA.tanomi;

const FAQS = [
  { q: '見積もりだけで断ったら、お金はかかりますか？', a: 'お湯が出ない.com は、出張料・見積もり・キャンセル料が無料と公式サイトに書いています。ほかの会社に頼むときは、来てもらう前に確かめてください。' },
  { q: 'マンションでも、同じ頼み先でよいですか？', a: '頼み先は同じです。ただ、管理組合への申請が要ることがあります。国の管理規約のひな形（国土交通省の標準管理規約）の第17条にあるので、お住まいの管理規約で確かめてください。' },
  { q: '10年使っています。修理と交換、どちらを頼めばいいですか？', a: '10年以上なら、メーカーも取り替えをすすめています。来てもらうときに、修理と交換の両方の見積もりを頼むと決めやすくなります。' },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    { '@type': 'Article', headline: TITLE, description: DESCRIPTION, inLanguage: 'ja', dateModified: '2026-11-08T09:00:00+09:00', datePublished: '2026-11-08T09:00:00+09:00', mainEntityOfPage: `${SITE_URL}${PAGE_PATH}`, isPartOf: { '@id': `${SITE_URL}/#website` }, publisher: { '@id': `${SITE_URL}/#organization` } },
    { '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: SITE_NAME, item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: '給湯器', item: `${SITE_URL}/kyutoki` },
      { '@type': 'ListItem', position: 3, name: '給湯器の頼み先', item: `${SITE_URL}${PAGE_PATH}` },
    ] },
    { '@type': 'FAQPage', mainEntity: FAQS.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) },
  ],
};

const SECTION = 'flex flex-col gap-5';
const H2 = 'text-[22px] font-black leading-snug text-slate-900';
const SRC = 'text-[11px] leading-relaxed text-slate-500';
const A = 'underline underline-offset-2';
const POINTS = ['出張料・見積もり・キャンセル料は無料', '最短30分で来てくれる', '工事は10年保証'];

const SAKI_STYLE: Record<string, { icon: typeof Wrench; ring: string; head: string; bg: string }> = {
  koji: { icon: Wrench, ring: 'ring-orange-200', head: 'text-orange-700', bg: 'bg-orange-50' },
  gas: { icon: Building2, ring: 'ring-sky-200', head: 'text-sky-800', bg: 'bg-sky-50' },
  maker: { icon: Factory, ring: 'ring-slate-300', head: 'text-slate-800', bg: 'bg-slate-100' },
};

export default function TanomisakiPage() {
  const S = DATA.sources as Record<string, { name: string; url: string }>;
  const checked = T.checkedAt.split('-').join('/');
  return (
    <div className="flex min-h-screen flex-col bg-[#f6f8fa]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <LpHeader />
      <LpViewTracker lpId={LP_ID} version={VERSION} />
      <main className="mx-auto flex w-full max-w-[520px] flex-1 flex-col gap-14 px-4 pt-4 pb-32 sm:pb-16">
        <div className="-mb-10"><PrNote /></div>
        <section className="flex flex-col gap-5" aria-labelledby="top">
          <div className="flex flex-col gap-2">
            <p className="text-[13px] font-bold text-sky-700">給湯器の頼み先</p>
            <h1 id="top" className="text-[28px] font-black leading-tight text-slate-900">頼み先は<span className="text-orange-600">3つ</span><br />急ぐかどうかで決める</h1>
          </div>
          <ul className="grid gap-2">
            {T.kime.map((k) => {
              const st = SAKI_STYLE[k.key];
              const I = st.icon;
              return (
                <li key={k.key}>
                  <a href={`#${k.key}`} className="flex items-center gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-slate-200 hover:ring-slate-300">
                    <span className="flex-1 text-[14px] font-bold text-slate-800">{k.when}</span>
                    <ArrowRight size={16} className="shrink-0 text-slate-400" aria-hidden="true" />
                    <span className={`flex w-[152px] shrink-0 items-center gap-1.5 rounded-xl px-2.5 py-2 text-[13px] font-black ${st.bg} ${st.head}`}>
                      <I size={18} className="shrink-0" aria-hidden="true" />{k.to}
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>
          <OyuBox lpId={LP_ID} position="hero" lead="今日お湯を出したいなら、来てもらう" points={POINTS} />
        </section>

        <section className={SECTION} aria-labelledby="kurabe">
          <h2 id="kurabe" className={H2}>3つの頼み先の違い</h2>
          {T.saki.map((s) => {
            const st = SAKI_STYLE[s.key];
            const I = st.icon;
            return (
              <div key={s.key} id={s.key} className={`flex scroll-mt-20 flex-col gap-3 rounded-2xl bg-white p-4 ring-1 ${st.ring}`}>
                <p className="flex items-center gap-2">
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${st.bg} ${st.head}`}><I size={20} aria-hidden="true" /></span>
                  <span className="text-[18px] font-black text-slate-900">{s.h}</span>
                  <span className="text-[12px] text-slate-500">{s.ex}</span>
                </p>
                <ul className="flex flex-col gap-1.5">
                  {s.p.map((t) => (
                    <li key={t} className="flex items-start gap-2 text-[14px] text-slate-800">
                      <Check size={18} className={`mt-0.5 shrink-0 ${st.head}`} aria-hidden="true" />{t}
                    </li>
                  ))}
                </ul>
                <p className={SRC}>
                  出典：{s.src.map((k, i) => (
                    <span key={k}>{i > 0 && '・'}<a href={S[k].url} target="_blank" rel="noopener noreferrer" className={A}>{S[k].name}</a></span>
                  ))}（{checked} 確認）
                </p>
              </div>
            );
          })}
        </section>

        <section className={SECTION} aria-labelledby="chui">
          <h2 id="chui" className={H2}>訪問の点検に注意</h2>
          <ul className="grid gap-2">
            {[T.chui, ...DATA.tenken].map((t) => (
              <li key={t} className="flex items-start gap-3 rounded-2xl bg-white p-3.5 text-[14px] text-slate-800 ring-1 ring-red-200">
                <AlertTriangle size={20} className="mt-0.5 shrink-0 text-red-600" aria-hidden="true" />{t}
              </li>
            ))}
          </ul>
          <p className={SRC}>
            出典：<a href={S.noritzRepair.url} target="_blank" rel="noopener noreferrer" className={A}>{S.noritzRepair.name}</a>・
            <a href={S.kokusen.url} target="_blank" rel="noopener noreferrer" className={A}>{S.kokusen.name}</a>
          </p>
        </section>

        <section className={SECTION} aria-labelledby="mitsumori">
          <h2 id="mitsumori" className={H2}>見積もりを比べるとき</h2>
          <p className="text-[14px] text-slate-700">金額は、本体・工事・リモコン・処分まで入った総額で比べます。見積書で見る10か所は<Link href="/kyutoki/mitsumori-mikata" className={`${A} text-sky-800`}>見積もりの見方</Link>へ。</p>
          <HaifuDownload main="check" others={['hiyou']} />
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
        <OyuBox lpId={LP_ID} position="bottom" lead="急ぐなら、まず来て見てもらう" points={POINTS} beacon={false} />
        <p className="text-[11px] leading-relaxed text-slate-400">各社の記載は確認日のものです。最終更新：2026年11月8日</p>
        <KyutokiNav current={PAGE_PATH} />
      </main>
      <OyuSticky lpId={LP_ID} />
      <LpFooter />
    </div>
  );
}
