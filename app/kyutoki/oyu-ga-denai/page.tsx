import type { Metadata } from 'next';
import Link from 'next/link';
import { DotGothic16 } from 'next/font/google';
import {
  CircleDollarSign, Gauge, HardHat, Handshake, MapPin, Receipt,
  RefreshCw, Scale, ShieldCheck, TriangleAlert, UserRoundX, Wrench,
} from 'lucide-react';
import GuideHeader from '@/components/GuideHeader';
import SiteFooter from '@/components/SiteFooter';
import { SITE_URL, SITE_NAME, ogImageUrl } from '@/components/loan/LoanArticle';
import OyuDiagnosis from './OyuDiagnosis';

/**
 * 給湯器「お湯が出ない」診断 LP（2026-10-28 新設 / 同日 v2 で全面デザイン改修）。
 *
 * 役割：検索広告（東京・神奈川の「お湯が出ない」系）の着地ページ。
 *   症状と使用年数から「直すか・替えるか」の目安を出し、地域と給湯器の種類に
 *   対応する紹介先（A8・レントラックス）へ1つだけ送客する。凍結・断水・賃貸・ガス臭は送客せずに止める。
 *
 * v2 の方針：1ブロック1メッセージ。文章で説明していた所は、図・アイコン・色分けで見せる。
 * 判定ロジックと紹介先の設定は lib/kyutoki/diagnosis.ts に集約（PDCAで触るのはそこ）。
 * 本文はサーバー側でHTMLとして出力する（JS非実行でも読める）。
 */

const PAGE_PATH = '/kyutoki/oyu-ga-denai';
const TITLE = 'お湯が出ないときの30秒診断｜給湯器は修理か交換か';
const DESCRIPTION =
  '給湯器のお湯が出ないときの30秒診断。症状と使用年数から修理か交換かの目安がわかり、凍結やガスメーターなど自分で確かめることも案内します。';
const DATE_MODIFIED = '2026-10-29';

const lcdFont = DotGothic16({ weight: '400', subsets: ['latin'], display: 'swap', preload: false });

export const metadata: Metadata = {
  title: `${TITLE} | ${SITE_NAME}`,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}${PAGE_PATH}` },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `${SITE_URL}${PAGE_PATH}`,
    siteName: SITE_NAME,
    type: 'website',
    locale: 'ja_JP',
    images: [{ url: ogImageUrl(TITLE), width: 1200, height: 630, alt: TITLE }],
  },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, images: [ogImageUrl(TITLE)] },
};

const FAQS = [
  {
    q: '寒い朝だけお湯が出ないのはなぜですか？',
    a: '配管の凍結かもしれません。気温が上がると解けることが多いです。熱湯をかけると配管が傷むので避けてください。',
  },
  {
    q: '賃貸でも、自分で業者を呼んでいいですか？',
    a: '先に管理会社か大家さんへ連絡してください。給湯器は建物の設備なので、手配と費用の負担は契約で決まっていることが多いです。',
  },
  {
    q: '給湯器は何年くらいで交換するものですか？',
    a: '一般に10年前後が目安です。修理部品は製造終了からおよそ10年で手に入りにくくなります。',
  },
  {
    q: '紹介先はどうやって選んでいますか？',
    a: 'お住まいの地域と給湯器の種類に対応する会社だけを表示します。紹介料を受け取っていますが、修理か交換かの目安は症状と使用年数だけで決まります。',
  },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      '@id': `${SITE_URL}${PAGE_PATH}#webpage`,
      url: `${SITE_URL}${PAGE_PATH}`,
      name: TITLE,
      description: DESCRIPTION,
      inLanguage: 'ja',
      dateModified: `${DATE_MODIFIED}T09:00:00+09:00`,
      isPartOf: { '@id': `${SITE_URL}/#website` },
      publisher: { '@id': `${SITE_URL}/#organization` },
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: SITE_NAME, item: `${SITE_URL}/` },
        { '@type': 'ListItem', position: 2, name: 'お湯が出ないときの30秒診断', item: `${SITE_URL}${PAGE_PATH}` },
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: FAQS.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    },
  ],
};

/** ヒーローの図：屋外のガス給湯器。表示窓は「消えた炎」、横に「？」の水滴。 */
function HeaterIllustration() {
  return (
    <svg viewBox="0 0 220 200" role="img" aria-label="お湯が出なくなった給湯器のイラスト" className="h-auto w-full max-w-[220px]">
      {/* 壁 */}
      <rect x="0" y="0" width="220" height="200" rx="28" fill="#e0f2fe" />
      <path d="M0 150h220" stroke="#bae6fd" strokeWidth="2" />
      {/* 本体 */}
      <rect x="58" y="26" width="92" height="118" rx="12" fill="#ffffff" stroke="#cbd5e1" strokeWidth="2" />
      <rect x="70" y="40" width="68" height="30" rx="6" fill="#1c2a22" />
      <text x="104" y="61" textAnchor="middle" fontSize="16" fill="#b9f5c8" fontFamily="monospace">--℃</text>
      {/* 吸排気口 */}
      {[86, 96, 106, 116].map((y) => (
        <rect key={y} x="74" y={y} width="60" height="4" rx="2" fill="#e2e8f0" />
      ))}
      {/* 配管 */}
      <path d="M78 144v26M96 144v26M112 144v26M130 144v26" stroke="#94a3b8" strokeWidth="5" strokeLinecap="round" />
      {/* 水滴と？ */}
      <path d="M176 70c0 0-20 22-20 35a20 20 0 0 0 40 0c0-13-20-35-20-35z" fill="#ea580c" />
      <text x="176" y="115" textAnchor="middle" fontSize="22" fontWeight="700" fill="#ffffff">?</text>
    </svg>
  );
}

const SECTION = 'flex flex-col gap-5';
const H2 = 'text-[22px] font-black leading-snug text-slate-900';

export default function OyuGaDenaiPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#f6f8fa]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <GuideHeader />

      <main className="mx-auto flex w-full max-w-[520px] flex-1 flex-col gap-14 px-4 pt-4 pb-28 sm:pb-16">
        {/* 広告であることの表示（A8 の条件：ファーストビューに置く） */}
        <p className="-mb-10 flex flex-wrap items-center gap-x-2 text-[11px] text-slate-500">
          <span className="rounded border border-slate-300 px-1.5 tracking-widest">PR</span>
          当サイトは紹介料を受け取っています（工事は行いません）
          <Link href="/policy" className="text-sky-800 underline underline-offset-2">中立性ポリシー</Link>
        </p>

        {/* ヒーロー：見出しは短く、図で状況を伝える */}
        <section className="flex flex-col gap-5">
          <div className="grid grid-cols-[1fr_auto] items-center gap-3">
            <div className="flex flex-col gap-3">
              <span className="self-start rounded-full bg-white px-3 py-1 text-xs font-bold text-sky-800 ring-1 ring-sky-200">給湯器トラブル診断</span>
              <h1 className="text-[40px] font-black leading-[1.1] tracking-tight text-slate-900">お湯が<br />出ない？</h1>
              <p className="text-[18px] font-bold leading-snug text-slate-700">
                直す？替える？<br /><span className="text-orange-600">30秒</span>でわかる。
              </p>
            </div>
            <div className="w-[136px] sm:w-[180px]">
              <HeaterIllustration />
            </div>
          </div>

          <p role="note" className="flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2.5 text-[13px] font-bold text-red-800">
            <TriangleAlert size={16} className="shrink-0" aria-hidden="true" />
            ガスのにおいがするときは、診断より先にガス会社へ
          </p>

          <OyuDiagnosis lcdFontClass={lcdFont.className} />
        </section>

        {/* 使用年数の目安：表ではなく色分けの帯で見せる */}
        <section className={SECTION} aria-labelledby="meyasu">
          <div className="flex flex-col gap-1.5">
            <h2 id="meyasu" className={H2}>修理か交換かの目安</h2>
            <p className="text-[15px] text-slate-600">目安は10年。製造年は本体のラベルにあります。</p>
          </div>
          <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200">
            <div className="grid grid-cols-[7fr_3fr_4fr] text-center text-[12px] font-bold text-white">
              <span className="bg-emerald-600 py-2">7年未満</span>
              <span className="bg-sky-600 py-2">7〜9年</span>
              <span className="bg-orange-600 py-2">10年以上</span>
            </div>
            <ul className="grid grid-cols-3 divide-x divide-slate-100">
              {[
                { icon: Wrench, tone: 'text-emerald-700', h: '修理', d: '部品があり直りやすい' },
                { icon: Scale, tone: 'text-sky-700', h: '比べる', d: '修理と交換の両方を見積もり' },
                { icon: RefreshCw, tone: 'text-orange-700', h: '交換', d: '修理部品がないことも' },
              ].map(({ icon: I, tone, h, d }) => (
                <li key={h} className="flex flex-col items-center gap-1.5 px-2 py-4 text-center">
                  <I size={26} className={tone} aria-hidden="true" />
                  <span className={`text-[17px] font-black ${tone}`}>{h}</span>
                  <span className="text-[12px] leading-snug text-slate-500">{d}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 見積もりの確認点：2×2 のアイコンカード */}
        <section className={SECTION} aria-labelledby="mitsumori">
          <div className="flex flex-col gap-1.5">
            <h2 id="mitsumori" className={H2}>見積もりで確かめる4点</h2>
            <p className="text-[15px] text-slate-600">高額請求を避けるための確認点です。</p>
          </div>
          <ul className="grid grid-cols-2 gap-3">
            {[
              { icon: Receipt, h: '総額', d: '本体・工事・処分費込みか' },
              { icon: CircleDollarSign, h: '追加費用', d: 'どんなときにいくら増えるか' },
              { icon: ShieldCheck, h: '保証', d: '本体と工事、それぞれ何年か' },
              { icon: Gauge, h: '号数', d: '20号・24号など、今と同じか' },
            ].map(({ icon: I, h, d }) => (
              <li key={h} className="flex flex-col gap-2 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-700">
                  <I size={22} aria-hidden="true" />
                </span>
                <span className="text-[16px] font-black text-slate-900">{h}</span>
                <span className="text-[13px] leading-snug text-slate-600">{d}</span>
              </li>
            ))}
          </ul>
          <p className="text-[12px] leading-relaxed text-slate-500">号数は、水温＋25℃のお湯を1分間に何リットル出せるかの数字です。</p>
        </section>

        {/* このページについて：中立性を3つのアイコンで */}
        <section className={SECTION} aria-labelledby="about">
          <h2 id="about" className={H2}>このページについて</h2>
          <ul className="grid gap-3">
            {[
              { icon: HardHat, h: '工事を行わない第三者のサイト', d: '修理や交換の業者ではありません' },
              { icon: MapPin, h: '対応エリアの会社だけ紹介', d: '対応する会社がなければ、紹介しません' },
              { icon: Handshake, h: '診断は紹介料で変わらない', d: '結果は症状と年数だけで決まる' },
              { icon: UserRoundX, h: '名前や連絡先の入力は不要', d: '診断の回答だけで結果を出します' },
            ].map(({ icon: I, h, d }) => (
              <li key={h} className="flex items-center gap-4 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                  <I size={22} aria-hidden="true" />
                </span>
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
          診断は一般的な目安で、故障の原因を特定するものではありません。各社の対応時間や保証は各社の公表内容によります。最終更新：2026年10月29日
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
