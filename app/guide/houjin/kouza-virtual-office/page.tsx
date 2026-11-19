import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Building2, CheckCircle2, FileText, Home, Info, Mail, XCircle } from 'lucide-react';
import LpHeader from '@/components/lp/LpHeader';
import LpFooter from '@/components/lp/LpFooter';
import LpViewTracker from '@/components/lp/LpViewTracker';
import { KakiteLine, KakiteNote, KAKITE_LD } from '@/components/houjin/Kakite';
import HoujinExit from '@/components/houjin/HoujinExit';
import { SITE_URL, SITE_NAME, ogImageUrl } from '@/components/loan/LoanArticle';
import { HOUJIN_PARTNERS } from '@/lib/houjin/partners';

/**
 * 法人口座とバーチャルオフィス：本店がバーチャルオフィスの会社が3行に申し込んだ実例（2026-11-17 作成）。
 * 受ける言葉（キーワードプランナー 2025/11〜2026/10 の月平均、11/17 確認）：
 *   法人口座 バーチャルオフィス 50（主。直近3か月 +40%）・バーチャルオフィス 銀行口座 40。
 * 上位（11/17、Google「法人口座 バーチャルオフィス」）：みずほ銀行・GMOオフィス・DMMバーチャルオフィス・ワンストップビジネスセンター・
 *   ケイ・ソサエティ・サーブコープ・バーチャルオフィス1・ドコモSMTBネット銀行（バーチャルオフィス連携の案内）・GMOあおぞらネット銀行の記事。
 *   AIによる概要あり。上位の多くはバーチャルオフィスの運営会社で「開設できる」「開設実績」を案内する。
 *   上位に欠けている点：
 *   ①バーチャルオフィスの利用者側から見た、通らなかった銀行も含む日付つきの実例がない
 *   ②銀行の公式の記載で、バーチャルオフィスだと何が変わるか（追加の資料・郵便の受け取り）を銀行ごとに並べたものがない
 *   ③郵便の転送と、転送不要の郵便（キャッシュカード）の食い違いで申込が止まった実例がない
 * 銀行の決まりは公式の記載だけ（楽天銀行・みずほ銀行・ラクスルバンクは 11/17、PayPay銀行は 11/16 確認）。
 * 体験はオーナーの記録（lib/houjin/kouza-data.ts と同じ）。
 * 出口：ラクスルバンク（A8、11/17 提携）。書き方は案1。
 */
const LP_ID = 'guide-houjin-kouza-vo';
const PATH = '/guide/houjin/kouza-virtual-office';
const CHECKED = '2026/11/17';
const TITLE = '法人口座はバーチャルオフィスでも作れる？3行に申し込み通ったのは1行の実例と、郵便・書類の注意';
const DESCRIPTION = '本店がバーチャルオフィスの合同会社が、設立直後に法人口座を3行に申し込み、通ったのは1行でした。日付つきの経過と、銀行の公式の記載で分かる「バーチャルオフィスだと増える書類」「転送できない郵便」をまとめました。';

export const metadata: Metadata = {
  title: `${TITLE} | ${SITE_NAME}`,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}${PATH}` },
  openGraph: { title: TITLE, description: DESCRIPTION, url: `${SITE_URL}${PATH}`, siteName: SITE_NAME, type: 'article', locale: 'ja_JP', images: [{ url: ogImageUrl(TITLE), width: 1200, height: 630, alt: TITLE }] },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, images: [ogImageUrl(TITLE)] },
};

const S = {
  rakuten: { name: '楽天銀行「法人ビジネス口座開設に必要な書類一覧」', url: 'https://www.rakuten-bank.co.jp/business/account/id.html' },
  mizuho: { name: 'みずほ銀行「バーチャルオフィスでも法人口座は開設できる？」', url: 'https://www.mizuhobank.co.jp/corporate/account/tips/topic_97.html' },
  raksul: { name: 'ラクスルバンク よくあるご質問「口座開設の際、必要書類は何を提出すればいいですか。」', url: 'https://support.raksulbank.com/faq/show/1293?site_domain=default' },
  paypayDocs: { name: 'PayPay銀行「口座開設に必要な書類（法人のお客さま）」', url: 'https://www.paypay-bank.co.jp/business/account/documents.html' },
  paypayCorp: { name: 'PayPay銀行「法人口座を開設するメリット」', url: 'https://www.paypay-bank.co.jp/business/first/corporation.html' },
} as const;
type K = keyof typeof S;

/** 申し込んだ3行の結果（運営会社の実例。本店はバーチャルオフィス） */
const RESULTS = [
  { bank: 'GMOあおぞらネット銀行', ok: false, s: '11月上旬に申込 → 通らず' },
  { bank: 'ドコモSMTBネット銀行', ok: false, s: '11/12 申込 → 11/16 見合わせ' },
  { bank: 'PayPay銀行', ok: true, s: '11/12 申込 → 11/16 通過' },
] as const;

/** バーチャルオフィスだと変わること（公式の記載） */
const KAWARU = [
  { bank: '楽天銀行', d: '本店にバーチャルオフィス・レンタルオフィスを使う場合は、事業実態の確認できる資料（許認可・取引の書類・契約書など）の提出が必要と案内している。', src: ['rakuten'] as K[] },
  { bank: 'みずほ銀行', d: 'バーチャルオフィスでも開設は可能。ただし事業実態が客観的に分かりにくいため、事業目的と事業実態を示す必要がある。いつでも連絡がつく体制も挙げている。', src: ['mizuho'] as K[] },
  { bank: 'PayPay銀行', d: 'キャッシュカードなどは法人の住所へ転送不要の簡易書留で届く。郵送物を受け取れないと利用が止まる。', src: ['paypayDocs', 'paypayCorp'] as K[] },
  { bank: 'ラクスルバンク', d: '事業内容の確認書類は1点以上。設立直後に補う書類として、代表者が署名・捺印した事業計画書も挙げている。', src: ['raksul'] as K[] },
];

const MAE = [
  { icon: Mail, h: '書留を受け取れるか', d: 'バーチャルオフィスの運営会社に、転送不要の簡易書留を受け取ってもらえるかを聞く。' },
  { icon: Building2, h: '法人の住所は登記の本店', d: '郵便が心配でも、法人の住所に自宅を入れない。私たちはここで止まった。' },
  { icon: Home, h: '代表者の住所は自宅', d: '代表者・取引担当者の住所は、本人確認書類の住所で申し込む。' },
  { icon: FileText, h: '事業が分かる資料', d: '取引の書類・契約書・ホームページ・事業計画書など、銀行が挙げるものを先に用意する。' },
];

const FAQS = [
  { q: 'バーチャルオフィスでも法人口座は作れますか？', a: 'みずほ銀行は、バーチャルオフィスでも事業実態を示せれば開設できると案内しています。私たちは本店がバーチャルオフィスの状態で3行に申し込み、PayPay銀行の1行が通りました。' },
  { q: 'バーチャルオフィスだと、書類は増えますか？', a: '楽天銀行は、本店にバーチャルオフィスを使う場合、事業実態の確認できる資料の提出が必要としています。必要な書類は銀行ごとに違います。' },
  { q: '銀行からの郵便は、転送で受け取れますか？', a: 'PayPay銀行のキャッシュカードは、法人の住所へ転送不要の簡易書留で届きます。転送では受け取れない郵便があるため、バーチャルオフィスで書留を受け取れるかを申し込む前に確かめます。' },
];

const SECTION = 'flex flex-col gap-5';
const H2 = 'text-[22px] font-black leading-snug text-slate-900';
const SRC = 'text-[11px] leading-relaxed text-slate-500';
const A = 'underline underline-offset-2';

function src(keys: readonly K[]) {
  return keys.map((k, i) => (
    <span key={k}>{i > 0 && '・'}<a href={S[k].url} target="_blank" rel="noopener noreferrer" className={A}>{S[k].name}</a></span>
  ));
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    { '@type': 'Article', author: KAKITE_LD, publisher: { '@id': 'https://www.tsuginotenavi.jp/#organization' }, headline: TITLE, description: DESCRIPTION, inLanguage: 'ja', about: { '@type': 'Thing', name: 'バーチャルオフィスでの法人口座の開設' }, mentions: ['PayPay銀行', 'ラクスルバンク', '楽天銀行', 'みずほ銀行', 'GMOあおぞらネット銀行', 'ドコモSMTBネット銀行'].map((name) => ({ '@type': 'BankOrCreditUnion', name })), datePublished: '2026-11-17T19:00:00+09:00', dateModified: '2026-11-17T19:00:00+09:00', mainEntityOfPage: `${SITE_URL}${PATH}` },
    { '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: SITE_NAME, item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: '法人成り', item: `${SITE_URL}/guide/houjin` },
      { '@type': 'ListItem', position: 3, name: '法人口座とバーチャルオフィス', item: `${SITE_URL}${PATH}` },
    ] },
    { '@type': 'FAQPage', mainEntity: FAQS.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) },
  ],
};

export default function Page() {
  const hasExit = !!HOUJIN_PARTNERS.raksulBank.href;
  return (
    <div className="flex min-h-screen flex-col bg-[#f6f8fa]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <LpHeader />
      <LpViewTracker lpId={LP_ID} version="v1-2026-11-17" />
      <main className="mx-auto flex w-full max-w-[520px] flex-1 flex-col gap-14 px-4 pt-4 pb-16">
        {hasExit && (
          <p className="-mb-10 flex flex-wrap items-center gap-x-2 text-[11px] text-slate-500">
            <span className="rounded border border-slate-300 px-1.5 tracking-widest">PR</span>
            <span>当サイトは紹介料を受け取っています</span>
            <Link href="/policy" className="text-sky-800 underline underline-offset-2">中立性ポリシー</Link>
          </p>
        )}
        <nav aria-label="現在の位置" className="-mb-10 text-[12px] text-slate-500">
          <Link href="/" className={A}>ホーム</Link><span className="mx-1.5">/</span>
          <Link href="/guide/houjin" className={A}>法人成り</Link><span className="mx-1.5">/</span>
          <span>法人口座とバーチャルオフィス</span>
        </nav>

        <section className="flex flex-col gap-5" aria-labelledby="top">
          <div className="flex flex-col gap-2">
            <p className="text-[13px] font-bold text-sky-700">運営会社の実例</p>
            <h1 id="top" className="text-[25px] font-black leading-tight text-slate-900">法人口座とバーチャルオフィス<br /><span className="text-[20px] text-orange-600">3行に申し込み、通ったのは1行</span></h1>
            <KakiteLine />
          </div>
          <ul className="grid gap-2" aria-label="申し込んだ3行の結果">
            {RESULTS.map((r) => (
              <li key={r.bank} className="flex items-center gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-slate-200">
                {r.ok ? <CheckCircle2 size={22} className="shrink-0 text-emerald-600" aria-hidden="true" /> : <XCircle size={22} className="shrink-0 text-slate-400" aria-hidden="true" />}
                <span className="flex flex-1 flex-col"><span className="text-[15px] font-black text-slate-900">{r.bank}</span><span className="text-[12px] text-slate-600">{r.s}</span></span>
                <span className={`rounded-lg px-2 py-0.5 text-[12px] font-bold ${r.ok ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{r.ok ? '開設' : '通らず'}</span>
              </li>
            ))}
          </ul>
          <p className="rounded-2xl bg-white p-4 text-[14px] leading-relaxed text-slate-800 ring-1 ring-slate-200">
            <span className="mb-1 block text-[12px] font-black text-sky-700">結論</span>
            バーチャルオフィスでも法人口座は作れます。ただし、銀行によっては事業の資料が増え、キャッシュカードは転送できない郵便で届きます。私たちは本店がバーチャルオフィスのまま3行に申し込み、通ったのはPayPay銀行の1行でした。
          </p>
        </section>

        <section className={SECTION} aria-labelledby="jouken">
          <h2 id="jouken" className={H2}>申し込んだ会社の条件</h2>
          <ul className="grid grid-cols-2 gap-2">
            {[
              { h: '合同会社', s: '代表1人' },
              { h: '設立直後', s: '2026年10月28日 設立' },
              { h: 'バーチャルオフィス', s: '郵便は月1回の転送' },
              { h: '取引はまだなし', s: '個人で運営していた実績はあり' },
            ].map((c) => (
              <li key={c.h} className="flex flex-col gap-0.5 rounded-2xl bg-white p-3.5 ring-1 ring-slate-200">
                <span className="text-[14px] font-black text-slate-900">{c.h}</span>
                <span className="text-[12px] text-slate-600">{c.s}</span>
              </li>
            ))}
          </ul>
          <div className="flex flex-col gap-1.5 rounded-2xl bg-orange-50 p-4 ring-1 ring-orange-200">
            <p className="text-[15px] font-black text-orange-900">止まった所：郵便の思い込み</p>
            <p className="text-[13px] leading-relaxed text-orange-950">郵便が月1回の転送なので、銀行の郵便は自宅で受け取るものと思い込み、PayPay銀行の申込で法人の住所に自宅を入れました。登記の本店（バーチャルオフィス）と違うため手続きが止まり、登記どおりに直して申し込み直し、通りました。</p>
          </div>
          <Link href="/guide/houjin/kouza-tsukurenai" className="flex items-center gap-1 text-[13px] font-bold text-sky-800 underline underline-offset-2">2行に落ちた理由の見立て<ArrowRight size={14} aria-hidden="true" /></Link>
        </section>

        <section className={SECTION} aria-labelledby="kawaru">
          <h2 id="kawaru" className={H2}>バーチャルオフィスだと変わること（銀行の公式の記載）</h2>
          <ul className="grid gap-2.5">
            {KAWARU.map((k) => (
              <li key={k.bank} className="flex flex-col gap-1 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                <span className="text-[16px] font-black text-slate-900">{k.bank}</span>
                <span className="text-[13px] leading-relaxed text-slate-700">{k.d}</span>
              </li>
            ))}
          </ul>
          <p className="flex items-start gap-2 text-[13px] text-slate-700"><Info size={18} className="mt-0.5 shrink-0 text-sky-700" aria-hidden="true" />通るかどうかは、銀行ごとの審査で決まります。申し込む銀行の案内を先に確かめます。</p>
          <p className={SRC}>出典：{src(['rakuten', 'mizuho', 'paypayDocs', 'paypayCorp', 'raksul'])}（楽天銀行・みずほ銀行・ラクスルバンクは {CHECKED}、PayPay銀行は 2026/11/16 確認）</p>
        </section>

        <section className={SECTION} aria-labelledby="mae">
          <h2 id="mae" className={H2}>申し込む前に確かめる4つ</h2>
          <ol className="grid gap-2.5">
            {MAE.map(({ icon: I, h, d }, i) => (
              <li key={h} className="flex items-start gap-3 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-700">
                  <I size={20} aria-hidden="true" />
                  <span className="absolute -top-1.5 -left-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-sky-700 text-[11px] font-bold text-white">{i + 1}</span>
                </span>
                <span className="flex flex-col gap-0.5">
                  <span className="text-[15px] font-black text-slate-900">{h}</span>
                  <span className="text-[13px] leading-relaxed text-slate-600">{d}</span>
                </span>
              </li>
            ))}
          </ol>
          <Link href="/guide/houjin/kouza-tsukurenai#check" className="flex items-center gap-3 rounded-2xl border-2 border-sky-200 bg-sky-50/60 p-3.5 hover:border-sky-300">
            <FileText size={22} className="shrink-0 text-sky-700" aria-hidden="true" />
            <span className="flex flex-1 flex-col"><span className="text-[15px] font-black text-slate-900">申込前チェック表（無料）</span><span className="text-[12px] text-slate-600">入力で止まらないための7つ。エクセル・PDF</span></span>
            <ArrowRight size={18} className="text-sky-700" aria-hidden="true" />
          </Link>
        </section>

        {hasExit && (
          <section className={SECTION} aria-labelledby="exit">
            <h2 id="exit" className="sr-only">申込先</h2>
            <HoujinExit
              lpId={LP_ID} partner="raksulBank" position="bottom" lead="同時に申し込む先を増やすなら"
              note="審査はGMOあおぞらネット銀行です。私たちは設立直後に、GMOあおぞらネット銀行に直接申し込んで通りませんでした。それを知ったうえで、申込先の一つとして載せています。"
            />
          </section>
        )}

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
          <p className={`${SRC} mt-1`}>出典：{src(['mizuho', 'rakuten', 'paypayCorp'])}</p>
        </section>

        <nav aria-label="あわせて読む" className="flex flex-col gap-2">
          {[
            { href: '/guide/houjin/kouza-hitsuyou-shorui', t: '法人口座の必要書類', s: '銀行4つの比較と、設立直後の事業内容の資料' },
            { href: '/guide/houjin/paypay-houjin-kouza', t: 'PayPay銀行の法人口座', s: '4日で審査に通った経過と必要書類' },
            { href: '/guide/houjin', t: '法人成りのページ一覧', s: '設立から口座まで、つまずいた所' },
          ].map((l) => (
            <Link key={l.href} href={l.href} className="flex items-center gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-slate-200 hover:ring-slate-300">
              <span className="flex flex-1 flex-col"><span className="text-[15px] font-black text-slate-900">{l.t}</span><span className="text-[12px] text-slate-600">{l.s}</span></span>
              <ArrowRight size={18} className="text-sky-700" aria-hidden="true" />
            </Link>
          ))}
        </nav>

        <KakiteNote />
        <p className="text-[11px] leading-relaxed text-slate-400">
          体験は運営会社（BlueAdventures合同会社）が2026年10〜11月に申し込んだときのものです。審査の基準は銀行ごとに違い、通ることを約束するものではありません。最終更新：2026年11月17日
        </p>
      </main>
      <LpFooter />
    </div>
  );
}
