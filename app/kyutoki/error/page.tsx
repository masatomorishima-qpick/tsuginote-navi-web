import type { Metadata } from 'next';
import Link from 'next/link';
import { AlertTriangle, BellRing, Flame, Hand, Plug, Power, ShowerHead, Wrench } from 'lucide-react';
import LpHeader from '@/components/lp/LpHeader';
import LpFooter from '@/components/lp/LpFooter';
import KyutokiNav from '@/components/kyutoki/KyutokiNav';
import LpViewTracker from '@/components/lp/LpViewTracker';
import { SITE_URL, SITE_NAME, ogImageUrl } from '@/components/loan/LoanArticle';
import { HaifuDownload, OyuBox, OyuSticky, PrNote } from '@/components/kyutoki/Haifu';
import DATA from '@/lib/kyutoki/haifu-data.json';

/**
 * 給湯器のエラー番号の早見（P17、2026-11-08 作成）。docs/seisaku-queue.md。
 *   受ける言葉：給湯器 エラー 111／140／290／610／632／710／760／920／930、ノーリツ 140、リンナイ 290 など。
 *   出口：お湯が出ない.com だけ（修理を受ける。修理の目安2.2万円〜）。
 * 元：東京ガスがまとめたリンナイ・ノーリツ・パロマのエラー番号の一覧と、エラーが出たときの対処（入れ直しの手順）。
 *   ガスメーターの復帰は東京消防庁の資料（DATA.meterReset、既存）。
 */
const LP_ID = 'kyutoki-error';
const VERSION = 'v1-2026-11-08';
const PAGE_PATH = '/kyutoki/error';
const TITLE = '給湯器のエラー番号の早見｜111・140・290・760…自分で直せるか、修理か';
const DESCRIPTION = 'ガス給湯器のリモコンに出るエラー番号で、自分で試せるか・修理を頼むかが分かります。111・121・632・760 はまず入れ直し、140・290・610・710・930 は修理、888・920 はすぐには止まりません。入れ直しの手順とガスメーターの復帰も。';

export const metadata: Metadata = {
  title: `${TITLE} | ${SITE_NAME}`,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}${PAGE_PATH}` },
  openGraph: { title: TITLE, description: DESCRIPTION, url: `${SITE_URL}${PAGE_PATH}`, siteName: SITE_NAME, type: 'article', locale: 'ja_JP', images: [{ url: ogImageUrl(TITLE), width: 1200, height: 630, alt: TITLE }] },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, images: [ogImageUrl(TITLE)] },
};

const E = DATA.error;

const FAQS = [
  { q: '2けたの番号が出ます。', a: `${E.nikeTa}です（東京ガスがまとめたリンナイの一覧）。ほかの番号は、メーカーの取扱説明書で確かめてください。` },
  { q: '入れ直したら消えました。このまま使えますか？', a: 'お湯が普通に出れば、ひとまず使えます。入れ直しても消えないときや、すぐにまた出るときは、中の部品が故障しているおそれがあります。無理に使い続けず、点検を頼んでください（東京ガス）。' },
  { q: '修理と交換、どちらがよいですか？', a: '使った年数で決めます。10年以内なら修理、10年以上なら交換がおすすめと東京ガスは案内しています。製造年は本体の銘板（シール）で分かります。' },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    { '@type': 'Article', headline: TITLE, description: DESCRIPTION, inLanguage: 'ja', dateModified: '2026-11-08T09:00:00+09:00', datePublished: '2026-11-08T09:00:00+09:00', mainEntityOfPage: `${SITE_URL}${PAGE_PATH}`, isPartOf: { '@id': `${SITE_URL}/#website` }, publisher: { '@id': `${SITE_URL}/#organization` } },
    { '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: SITE_NAME, item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: '給湯器', item: `${SITE_URL}/kyutoki` },
      { '@type': 'ListItem', position: 3, name: '給湯器のエラー番号', item: `${SITE_URL}${PAGE_PATH}` },
    ] },
    { '@type': 'FAQPage', mainEntity: FAQS.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) },
  ],
};

const SECTION = 'flex flex-col gap-5';
const H2 = 'text-[22px] font-black leading-snug text-slate-900';
const SRC = 'text-[11px] leading-relaxed text-slate-500';
const A = 'underline underline-offset-2';
const POINTS = ['修理の目安は2.2万円〜（税込）', '最短30分で来てくれる', '見積もり・出張料は無料'];

const GROUP_STYLE: Record<string, { icon: typeof Hand; box: string; chip: string; head: string }> = {
  jibun: { icon: Hand, box: 'bg-sky-50 ring-sky-200', chip: 'bg-white text-sky-800 ring-sky-200', head: 'text-sky-800' },
  shuri: { icon: Wrench, box: 'bg-orange-50 ring-orange-200', chip: 'bg-white text-orange-700 ring-orange-200', head: 'text-orange-700' },
  oshirase: { icon: BellRing, box: 'bg-emerald-50 ring-emerald-200', chip: 'bg-white text-emerald-700 ring-emerald-200', head: 'text-emerald-700' },
};
const RESET_ICONS = [ShowerHead, Power, Flame];

export default function ErrorPage() {
  const S = DATA.sources;
  const checked = E.checkedAt.split('-').join('/');
  const errSrc = (
    <>
      <a href={S.tgErrRinnai.url} target="_blank" rel="noopener noreferrer" className={A}>リンナイ</a>・
      <a href={S.tgErrNoritz.url} target="_blank" rel="noopener noreferrer" className={A}>ノーリツ</a>・
      <a href={S.tgErrPaloma.url} target="_blank" rel="noopener noreferrer" className={A}>パロマ</a>
    </>
  );
  return (
    <div className="flex min-h-screen flex-col bg-[#f6f8fa]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <LpHeader />
      <LpViewTracker lpId={LP_ID} version={VERSION} />
      <main className="mx-auto flex w-full max-w-[520px] flex-1 flex-col gap-14 px-4 pt-4 pb-32 sm:pb-16">
        <div className="-mb-10"><PrNote /></div>
        <section className="flex flex-col gap-5" aria-labelledby="top">
          <div className="flex flex-col gap-2">
            <p className="text-[13px] font-bold text-sky-700">給湯器のエラー番号</p>
            <h1 id="top" className="text-[28px] font-black leading-tight text-slate-900">番号で分かる<br /><span className="text-orange-600">自分で直せるか</span></h1>
          </div>
          <ul className="grid gap-2">
            {E.groups.map((g) => {
              const st = GROUP_STYLE[g.key];
              const I = st.icon;
              return (
                <li key={g.key} className={`flex flex-col gap-2.5 rounded-2xl p-3.5 ring-1 ${st.box}`}>
                  <span className="flex items-center gap-2">
                    <I size={20} className={`shrink-0 ${st.head}`} aria-hidden="true" />
                    <span className={`text-[16px] font-black ${st.head}`}>{g.h}</span>
                    <span className="text-[12px] text-slate-600">{g.d}</span>
                  </span>
                  <span className="flex flex-wrap gap-1.5">
                    {g.codes.map((c) => (
                      <a key={c} href={`#c${c}`} className={`rounded-lg px-2.5 py-1 font-mono text-[17px] font-black ring-1 ${st.chip}`}>{c}</a>
                    ))}
                  </span>
                </li>
              );
            })}
          </ul>
          <p className="flex items-start gap-2 rounded-xl bg-white p-3 text-[13px] font-bold text-slate-800 ring-1 ring-red-200">
            <AlertTriangle size={18} className="mt-0.5 shrink-0 text-red-600" aria-hidden="true" />{E.gasMore}
          </p>
          <OyuBox lpId={LP_ID} position="hero" lead="エラーが消えないなら、来て見てもらう" points={POINTS} />
        </section>

        <section className={SECTION} aria-labelledby="hayami">
          <h2 id="hayami" className={H2}>番号の早見</h2>
          <ul className="grid gap-2">
            {E.codes.map((c) => {
              const st = GROUP_STYLE[c.g];
              return (
                <li key={c.c} id={`c${c.c}`} className="flex scroll-mt-20 items-start gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-slate-200">
                  <span className={`w-[58px] shrink-0 rounded-lg py-1 text-center font-mono text-[18px] font-black ring-1 ${st.chip}`}>{c.c}</span>
                  <span className="flex flex-col gap-0.5">
                    <span className="text-[15px] font-black text-slate-900">{c.m}</span>
                    <span className="text-[13px] leading-relaxed text-slate-600">{c.a}</span>
                  </span>
                </li>
              );
            })}
          </ul>
          <p className={SRC}>{E.codesNote}。出典：東京ガスのエラー番号の一覧（{errSrc}）（{checked} 確認）</p>
        </section>

        <section className={SECTION} aria-labelledby="ireNaoshi">
          <h2 id="ireNaoshi" className={H2}>入れ直しの手順</h2>
          <ol className="grid grid-cols-3 gap-2">
            {E.reset.map((r, i) => {
              const I = RESET_ICONS[i] ?? Power;
              return (
                <li key={r.h} className="flex flex-col items-center gap-1.5 rounded-2xl bg-white p-3 text-center ring-1 ring-slate-200">
                  <span className="text-[12px] font-black text-sky-700">{i + 1}</span>
                  <I size={24} className="text-sky-700" aria-hidden="true" />
                  <span className="text-[14px] font-black text-slate-900">{r.h}</span>
                  <span className="text-[11px] leading-snug text-slate-600">{r.d}</span>
                </li>
              );
            })}
          </ol>
          <ul className="grid gap-2">
            {[{ icon: Plug, t: E.resetPlug }, { icon: Power, t: E.resetAgain }].map(({ icon: I, t }) => (
              <li key={t} className="flex items-start gap-3 rounded-2xl bg-white p-3.5 text-[14px] text-slate-800 ring-1 ring-slate-200">
                <I size={20} className="mt-0.5 shrink-0 text-sky-700" aria-hidden="true" />{t}
              </li>
            ))}
          </ul>
          <p className={SRC}>
            出典：<a href={S.tgErrKyotsu.url} target="_blank" rel="noopener noreferrer" className={A}>{S.tgErrKyotsu.name}</a>（{checked} 確認）
          </p>
        </section>

        <section className={SECTION} aria-labelledby="meter">
          <h2 id="meter" className={H2}>ガスメーターの復帰（111・121）</h2>
          <ol className="grid gap-2">
            {DATA.meterReset.map((t, i) => (
              <li key={t} className="flex items-start gap-3 rounded-2xl bg-white p-3.5 text-[14px] text-slate-800 ring-1 ring-slate-200">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-700 text-[12px] font-black text-white">{i + 1}</span>{t}
              </li>
            ))}
          </ol>
          <p className={SRC}>
            出典：<a href={S.tfdMeter.url} target="_blank" rel="noopener noreferrer" className={A}>{S.tfdMeter.name}</a>
          </p>
        </section>

        <section className={SECTION} aria-labelledby="shuriKokan">
          <h2 id="shuriKokan" className={H2}>修理か交換か</h2>
          <p className="flex items-start gap-3 rounded-2xl bg-sky-50 p-4 text-[15px] font-bold text-slate-900 ring-1 ring-sky-200">
            <Wrench size={20} className="mt-0.5 shrink-0 text-sky-700" aria-hidden="true" />{E.nenSu}
          </p>
          <p className="text-[14px] text-slate-700">年数ごとの決め方は<Link href="/kyutoki/nensu" className={`${A} text-sky-800`}>給湯器の寿命</Link>へ。交換するときの総額は、下の目安表で確かめられます。</p>
          <HaifuDownload main="hiyou" others={['check']} />
          <p className={SRC}>出典：<a href={S.tgErrRinnai.url} target="_blank" rel="noopener noreferrer" className={A}>{S.tgErrRinnai.name}</a>（{checked} 確認）</p>
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
        <OyuBox lpId={LP_ID} position="bottom" lead="修理が要る番号なら、来て見てもらう" points={POINTS} beacon={false} />
        <p className="text-[11px] leading-relaxed text-slate-400">番号の意味は機種で違うことがあります。くわしくはお使いの機種の取扱説明書で確かめてください。最終更新：2026年11月8日</p>
        <KyutokiNav current={PAGE_PATH} />
      </main>
      <OyuSticky lpId={LP_ID} />
      <LpFooter />
    </div>
  );
}
