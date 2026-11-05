import type { Metadata } from 'next';
import Link from 'next/link';
import { Banknote, CalendarClock, CreditCard, Landmark, Mail, Receipt, ShieldCheck } from 'lucide-react';
import LpHeader from '@/components/lp/LpHeader';
import LpFooter from '@/components/lp/LpFooter';
import LpViewTracker from '@/components/lp/LpViewTracker';
import { SITE_URL, SITE_NAME, ogImageUrl } from '@/components/loan/LoanArticle';
import { OyuBox, OyuSticky, PrNote } from '@/components/kyutoki/Haifu';
import DATA from '@/lib/kyutoki/haifu-data.json';

/**
 * 給湯器の交換の払い方（P16、2026-11-05 公開）。docs/kyutoki-seo/schedule.md。
 *   受ける言葉：給湯器 交換 分割払い／ローン／クレジットカード／後払い、お金がない など31語。
 *   出口：お湯が出ない.com だけ（11/5 の決まり。#78）。
 * 元：国民生活センター（クーリング・オフ）、お湯が出ない.com 公式（料金の考え方、2026-11-04 確認）。
 *   各社の払い方の細かい条件（手数料・回数）は一次情報で確かめられないので、確かめる点だけを書く。
 */
const LP_ID = 'kyutoki-shiharai';
const VERSION = 'v1-2026-11-05';
const PAGE_PATH = '/kyutoki/shiharai';
const TITLE = '給湯器の交換の払い方｜分割・カード・後払いで確かめる3つのこと';
const DESCRIPTION = '給湯器の交換費用の払い方（現金・クレジットカード・分割・工事後の後払い）を比べるときに確かめること。総額、手数料、いつ払うか。訪問で契約したときのクーリング・オフも。';
const DATE_MODIFIED = '2026-11-05';

export const metadata: Metadata = {
  title: `${TITLE} | ${SITE_NAME}`,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}${PAGE_PATH}` },
  openGraph: { title: TITLE, description: DESCRIPTION, url: `${SITE_URL}${PAGE_PATH}`, siteName: SITE_NAME, type: 'article', locale: 'ja_JP', images: [{ url: ogImageUrl(TITLE), width: 1200, height: 630, alt: TITLE }] },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, images: [ogImageUrl(TITLE)] },
};

const FAQS = [
  { q: '分割にすると高くなりますか？', a: '分割やローンには手数料や金利がつくことがあります。見積もりの総額と、分割にしたときに払う合計を、両方書いてもらって比べてください。' },
  { q: 'お金がなくて、すぐに払えません。', a: '工事のあとに払える会社や、カード・分割が使える会社があります。見積もりを頼むときに「払い方」と「いつ払うか」を先に聞いてください。見積もりまで無料の会社もあります（お湯が出ない.com など）。' },
  { q: '訪問してきた業者とローンで契約してしまいました。', a: '訪問販売なら、書面を受け取った日から8日間はクーリング・オフができます。クレジット契約をしているときは、販売会社とクレジット会社の両方に同時に通知します（国民生活センター）。' },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    { '@type': 'Article', headline: TITLE, description: DESCRIPTION, inLanguage: 'ja', dateModified: `${DATE_MODIFIED}T09:00:00+09:00`, datePublished: '2026-11-05T09:00:00+09:00', mainEntityOfPage: `${SITE_URL}${PAGE_PATH}`, isPartOf: { '@id': `${SITE_URL}/#website` }, publisher: { '@id': `${SITE_URL}/#organization` } },
    { '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: SITE_NAME, item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: 'ガス給湯器の交換費用', item: `${SITE_URL}/kyutoki/kokan-hiyou` },
      { '@type': 'ListItem', position: 3, name: '交換の払い方', item: `${SITE_URL}${PAGE_PATH}` },
    ] },
    { '@type': 'FAQPage', mainEntity: FAQS.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) },
  ],
};

const SECTION = 'flex flex-col gap-5';
const H2 = 'text-[22px] font-black leading-snug text-slate-900';
const SRC = 'text-[11px] leading-relaxed text-slate-500';
const A = 'underline underline-offset-2';
const POINTS = ['出張料・見積もり・キャンセル料は無料', '最短30分で来てくれる', '工事は10年保証'];

export default function ShiharaiPage() {
  const S = DATA.sources;
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
            <h1 id="top" className="text-[28px] font-black leading-tight text-slate-900">交換の払い方<br />確かめる3つ</h1>
          </div>
          <ol className="grid gap-2">
            {[
              { icon: Receipt, h: '総額', d: '本体・工事・処分費まで入った金額（税込）' },
              { icon: Banknote, h: '手数料', d: '分割・ローンにしたときに上乗せされる額' },
              { icon: CalendarClock, h: 'いつ払うか', d: '前払いか、工事のあとか' },
            ].map(({ icon: I, h, d }, i) => (
              <li key={h} className="flex items-center gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-slate-200">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-700"><I size={20} aria-hidden="true" /></span>
                <span className="flex flex-col">
                  <span className="text-[15px] font-black text-slate-900"><span className="mr-1.5 text-sky-700">{i + 1}</span>{h}</span>
                  <span className="text-[12px] text-slate-600">{d}</span>
                </span>
              </li>
            ))}
          </ol>
          <p className="text-[14px] text-slate-700">総額の目安は<Link href="/kyutoki/kokan-hiyou#hyou" className={`${A} text-sky-800`}>費用の目安表</Link>で確かめられます。</p>
        </section>

        <section className={SECTION} aria-labelledby="kata">
          <h2 id="kata" className={H2}>払い方は4つ</h2>
          <ul className="grid grid-cols-2 gap-2">
            {[
              { icon: Banknote, h: '現金・振り込み', d: '手数料はかからない' },
              { icon: CreditCard, h: 'クレジットカード', d: '分割・リボは手数料を確かめる' },
              { icon: Landmark, h: '分割・ローン', d: '払う合計と回数を書いてもらう' },
              { icon: CalendarClock, h: '工事のあとに払う', d: 'お湯が出たのを見てから払える' },
            ].map(({ icon: I, h, d }) => (
              <li key={h} className="flex flex-col gap-1 rounded-2xl bg-white p-3.5 ring-1 ring-slate-200">
                <I size={20} className="text-sky-700" aria-hidden="true" />
                <span className="text-[14px] font-black text-slate-900">{h}</span>
                <span className="text-[12px] leading-snug text-slate-600">{d}</span>
              </li>
            ))}
          </ul>
          <p className="text-[13px] text-slate-600">使える払い方は会社ごとに違います。見積もりを頼むときに先に聞きます。</p>
        </section>

        <section className={SECTION} aria-labelledby="oyu">
          <h2 id="oyu" className={H2}>見積もりの金額で工事する会社</h2>
          <ul className="flex flex-col gap-2">
            {DATA.oyuPay.map((t) => (
              <li key={t} className="flex items-start gap-2 rounded-2xl bg-white p-3.5 text-[14px] text-slate-800 ring-1 ring-slate-200"><ShieldCheck size={18} className="mt-0.5 shrink-0 text-emerald-600" aria-hidden="true" />{t}</li>
            ))}
          </ul>
          <OyuBox lpId={LP_ID} position="pay" lead="払い方も、見積もりのときに聞ける" points={POINTS} />
          <p className={SRC}>出典：<a href={S.oyuDenai.url} target="_blank" rel="noopener noreferrer" className={A}>{S.oyuDenai.name}</a>（{DATA.checkedAt.split('-').join('/')} 確認）</p>
        </section>

        <section className={SECTION} aria-labelledby="cooling">
          <h2 id="cooling" className={H2}>訪問で契約したら</h2>
          <div className="flex flex-col gap-2 rounded-2xl border-2 border-orange-200 bg-orange-50/60 p-4">
            <p className="flex items-start gap-2 text-[14px] text-slate-800"><CalendarClock size={18} className="mt-0.5 shrink-0 text-orange-600" aria-hidden="true" />書面を受け取った日から8日間は、クーリング・オフができる</p>
            <p className="flex items-start gap-2 text-[14px] text-slate-800"><Mail size={18} className="mt-0.5 shrink-0 text-orange-600" aria-hidden="true" />ローンを組んだときは、販売会社とクレジット会社の両方に同時に通知する</p>
          </div>
          <p className={SRC}>出典：<a href={S.kokusenCooling.url} target="_blank" rel="noopener noreferrer" className={A}>{S.kokusenCooling.name}</a>。迷ったら消費者ホットライン「188」へ。</p>
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
        <p className="text-[11px] leading-relaxed text-slate-400">払い方の条件は会社ごとに違います。最終更新：2026年11月5日</p>
      </main>
      <OyuSticky lpId={LP_ID} />
      <LpFooter />
    </div>
  );
}
