import type { Metadata } from 'next';
import Link from 'next/link';
import { CalendarClock, Calculator, Handshake, RefreshCw, Store, TrendingUp, UserRoundX, Wrench } from 'lucide-react';
import GuideHeader from '@/components/GuideHeader';
import SiteFooter from '@/components/SiteFooter';
import LpViewTracker from '@/components/lp/LpViewTracker';
import { SITE_URL, SITE_NAME, ogImageUrl } from '@/components/loan/LoanArticle';
import TrendCheck from '@/components/trend/TrendCheck';
import { DENKI } from '@/lib/trend/denki';

/**
 * トレンド速攻ページ 2本目：冬の電気代の計算（2026-10-30 新設）。
 * 11月使用分が大手7社で2か月連続の過去最高（NHK 10/29）、12月からの補助再開を首相が表明（時事 10/29）。
 * 設定（設問・計算・紹介先）は lib/trend/denki.ts。画面と計測は components/trend/TrendCheck.tsx。
 * 社名は本文の紹介先の枠にだけ出す（検索広告では社名・サービス名・表記ゆれが不可）。
 */

const PAGE_PATH = '/check/denki';
const TITLE = '電気代は11月に過去最高。冬はいくら上がって、補助でいくら戻る？30秒で計算';
const DESCRIPTION =
  '11月使用分の電気料金は大手7社で2か月連続の過去最高。12月からの補助再開を首相が表明。地域・先月の電気代・暖房の4問で、冬の電気代の目安と、補助で戻る分・切り替えで縮められる差を計算します。';
const NHK_URL = 'https://news.web.nhk/newsweb/na/nd-20261029de67703';
const NIPPON_URL = 'https://www.nippon.com/ja/articles/-/56596';
const JIJI_URL = 'https://www.jiji.com/jc/article?k=2026102901064&g=pol';
const SELECTRA_URL = 'https://selectra.jp/energy/news/electricity-gas-subsidy-restart-january-2027';

export const metadata: Metadata = {
  title: `${TITLE} | ${SITE_NAME}`,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}${PAGE_PATH}` },
  openGraph: {
    title: TITLE, description: DESCRIPTION, url: `${SITE_URL}${PAGE_PATH}`, siteName: SITE_NAME,
    type: 'website', locale: 'ja_JP', images: [{ url: ogImageUrl(TITLE), width: 1200, height: 630, alt: TITLE }],
  },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, images: [ogImageUrl(TITLE)] },
};

const FAQS = [
  { q: '11月の電気代はなぜ上がったのですか？', a: '燃料（LNG）の輸入価格の上昇が、3〜5か月遅れで燃料費調整額に反映されたためです。大手電力7社で値上がりし、2か月連続で過去最高になりました（NHK、2026年10月29日）。' },
  { q: '補助はいつから、いくらですか？', a: '12月からの電気・ガス代支援の再開を、首相が2026年10月29日に表明しました。金額と期間は正式な発表待ちです。前回の冬（2026年1〜2月使用分）は電気4.5円/kWh、3月使用分は1.5円/kWhでした。' },
  { q: '補助があるなら、切り替えは不要では？', a: '補助は使用量（kWh）に応じて誰にでも同じ単価で付くので、切り替えても減りません。切り替えで変わるのは電力量料金の単価の部分で、補助とは別に効きます。' },
  { q: '切り替えに工事や立ち会いは要りますか？', a: '不要です。申し込みだけで、切り替え日まで今の電気がそのまま使えます。今の会社への解約の連絡も、新しい会社が代わりに行います。' },
  { q: '紹介している電力会社はどう選んでいますか？', a: '回答した地域で申し込める会社だけを表示しています。当サイトは紹介料を受け取りますが、計算結果は回答内容だけで決まります。' },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage', '@id': `${SITE_URL}${PAGE_PATH}#webpage`, url: `${SITE_URL}${PAGE_PATH}`,
      name: TITLE, description: DESCRIPTION, inLanguage: 'ja', dateModified: '2026-10-30T12:00:00+09:00',
      isPartOf: { '@id': `${SITE_URL}/#website` }, publisher: { '@id': `${SITE_URL}/#organization` },
    },
    {
      '@type': 'FAQPage',
      mainEntity: FAQS.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
    },
  ],
};

/** ヒーローの図：右肩上がりの棒と、12月に戻る矢印 */
function BillChart() {
  return (
    <svg viewBox="0 0 200 200" role="img" aria-label="電気代が上がり、12月から補助で一部戻る図" className="h-auto w-full max-w-[200px]">
      <rect width="200" height="200" rx="28" fill="#fff7ed" />
      {[{ x: 34, h: 70, c: '#fdba74' }, { x: 74, h: 86, c: '#fb923c' }, { x: 114, h: 104, c: '#ea580c' }].map(({ x, h, c }) => (
        <rect key={x} x={x} y={160 - h} width="28" height={h} rx="6" fill={c} />
      ))}
      <rect x="154" y="56" width="28" height="104" rx="6" fill="#ea580c" />
      <rect x="154" y="56" width="28" height="30" rx="6" fill="#0ea5e9" />
      <path d="M168 30v22" stroke="#0369a1" strokeWidth="5" strokeLinecap="round" />
      <path d="M158 42l10 12 10-12" fill="none" stroke="#0369a1" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      <text x="48" y="182" fontSize="13" fontWeight="700" fill="#9a3412" textAnchor="middle">9月</text>
      <text x="88" y="182" fontSize="13" fontWeight="700" fill="#9a3412" textAnchor="middle">10月</text>
      <text x="128" y="182" fontSize="13" fontWeight="700" fill="#9a3412" textAnchor="middle">11月</text>
      <text x="168" y="182" fontSize="13" fontWeight="700" fill="#0369a1" textAnchor="middle">12月</text>
    </svg>
  );
}

const SECTION = 'flex flex-col gap-5';
const H2 = 'text-[22px] font-black leading-snug text-slate-900';

export default function DenkiCheckPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#f6f8fa]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <GuideHeader />
      <LpViewTracker lpId={DENKI.lpId} version={DENKI.version} />

      <main className="mx-auto flex w-full max-w-[520px] flex-1 flex-col gap-14 px-4 pt-4 pb-28 sm:pb-16">
        <p className="-mb-10 flex flex-wrap items-center gap-x-2 text-[11px] text-slate-500">
          <span className="rounded border border-slate-300 px-1.5 tracking-widest">PR</span>
          <span>当サイトは紹介先から紹介料を受け取っています<span className="whitespace-nowrap">（電気の販売は行いません）</span></span>
          <Link href="/policy" className="text-sky-800 underline underline-offset-2">中立性ポリシー</Link>
        </p>

        <section className="flex flex-col gap-5">
          <div className="grid grid-cols-[1fr_auto] items-center gap-3">
            <div className="flex flex-col gap-3">
              <span className="self-start rounded-full bg-white px-3 py-1 text-xs font-bold text-orange-800 ring-1 ring-orange-200">11月使用分・大手7社で過去最高</span>
              <h1 className="text-[30px] font-black leading-[1.15] tracking-tight text-slate-900 min-[380px]:text-[34px]">
                <span className="whitespace-nowrap">冬の電気代、</span><br /><span className="whitespace-nowrap">いくら上がる？</span>
              </h1>
            </div>
            <div className="w-[96px] min-[380px]:w-[120px] sm:w-[160px]"><BillChart /></div>
          </div>
          <p className="-mt-1 text-[18px] font-bold leading-snug text-slate-700">
            4つの質問、<span className="text-orange-600">30秒</span>で目安がわかる。
          </p>
          <p className="-mt-2 text-[14px] leading-relaxed text-slate-600">
            <span className="whitespace-nowrap">補助で戻る分と、</span><span className="whitespace-nowrap">切り替えで縮められる差を</span><span className="whitespace-nowrap">分けて計算します。</span>
          </p>
          <TrendCheck id="denki" />
        </section>

        <section className={SECTION} aria-labelledby="now">
          <h2 id="now" className={H2}>いま起きていること</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: TrendingUp, h: '11月使用分', d: '大手7社が値上がり、2か月連続の過去最高', n: '+177円', sub: '東京電力の標準家庭（9,738円）' },
              { icon: CalendarClock, h: '12月から', d: '電気・ガス代支援の再開を首相が表明', n: '金額未定', sub: '前回の冬は4.5円/kWh' },
            ].map(({ icon: I, h, d, n, sub }) => (
              <div key={h} className="flex flex-col gap-2 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-700"><I size={22} aria-hidden="true" /></span>
                <span className="text-[18px] font-black text-slate-900">{h}</span>
                <span className="text-[13px] leading-snug text-slate-600">{d}</span>
                <span className="mt-1 text-[22px] font-black tabular-nums text-slate-900">{n}</span>
                <span className="text-[12px] text-slate-500">{sub}</span>
              </div>
            ))}
          </div>
          <p className="flex items-center gap-2 rounded-xl bg-orange-50 px-4 py-3 text-[14px] font-bold text-orange-800">
            10〜12月使用分は補助がない期間。冬の立ち上がりが一番きつい
          </p>
          <p className="text-[12px] text-slate-500">
            出典：<a href={NHK_URL} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">NHK（2026年10月29日）</a>、
            <a href={NIPPON_URL} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">nippon.com（同日）</a>、
            <a href={JIJI_URL} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">時事通信（同日）</a>、
            <a href={SELECTRA_URL} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">セレクトラ（10月21日）</a>
          </p>
        </section>

        <section className={SECTION} aria-labelledby="two">
          <h2 id="two" className={H2}>「戻る分」と「縮める差」は別もの</h2>
          <ol className="grid gap-2">
            {[
              { icon: Calculator, h: '補助で戻る分', d: '使用量（kWh）に単価を掛けて、誰にでも同じ割合で付く。会社を変えても増減しない' },
              { icon: RefreshCw, h: '切り替えで縮める差', d: '電力量料金の単価の違い。大手の標準プランから新電力へは3〜8%が目安' },
              { icon: Wrench, h: '両方を足したものが冬の実額', d: '補助を待つだけだと、単価の差はそのまま残る' },
            ].map(({ icon: I, h, d }, i) => (
              <li key={h} className="flex items-center gap-4 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-50 text-sky-700"><I size={20} aria-hidden="true" /></span>
                <span className="flex flex-col">
                  <span className="text-[15px] font-black text-slate-900"><span className="mr-1.5 text-sky-700">{i + 1}</span>{h}</span>
                  <span className="text-[13px] text-slate-500">{d}</span>
                </span>
              </li>
            ))}
          </ol>
        </section>

        <section className={SECTION} aria-labelledby="about">
          <h2 id="about" className={H2}>このページについて</h2>
          <ul className="grid gap-3">
            {[
              { icon: Store, h: '当サイトは電力会社ではありません', d: '電気の販売・契約は行いません' },
              { icon: Handshake, h: '計算結果は紹介料に左右されません', d: '結果は回答内容だけで決まります' },
              { icon: UserRoundX, h: '個人情報の入力は不要です', d: '氏名・住所・連絡先の入力欄はありません' },
            ].map(({ icon: I, h, d }) => (
              <li key={h} className="flex items-center gap-4 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600"><I size={22} aria-hidden="true" /></span>
                <span className="flex flex-col">
                  <span className="text-[15px] font-black text-slate-900">{h}</span>
                  <span className="text-[13px] text-slate-500">{d}</span>
                </span>
              </li>
            ))}
          </ul>
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
          電気料金の数字は各社の公表値（標準家庭＝30A・月260kWh）の報道をもとにしています。
          補助の金額と期間は政府の正式な発表で確定します。最終更新：2026年10月30日
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
