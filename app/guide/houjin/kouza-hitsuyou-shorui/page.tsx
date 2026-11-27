import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Briefcase, CalendarClock, FileText, Globe, IdCard, Info, Landmark, ScrollText, Stamp } from 'lucide-react';
import LpHeader from '@/components/lp/LpHeader';
import LpFooter from '@/components/lp/LpFooter';
import LpViewTracker from '@/components/lp/LpViewTracker';
import { KakiteLine, KakiteNote, KAKITE_LD } from '@/components/houjin/Kakite';
import HoujinExit from '@/components/houjin/HoujinExit';
import { SITE_URL, SITE_NAME, ogImageUrl } from '@/components/loan/LoanArticle';
import { HOUJIN_PARTNERS } from '@/lib/houjin/partners';

/**
 * 法人口座の必要書類：銀行4つの比較と、設立直後に困る「事業内容の確認資料」（2026-11-17 作成）。
 * 受ける言葉（キーワードプランナー 2025/11〜2026/10 の月平均、11/17 確認）：法人口座 必要書類 90（主）。
 * 上位（11/17、Google「法人口座 必要書類」）：三菱UFJ銀行・三井住友銀行のよくある質問・みずほ銀行・楽天銀行・みんなの銀行・
 *   PayPay銀行・ドコモSMTBネット銀行・創業融資の解説サイト・三井住友銀行の記事。AIによる概要あり。ほぼ全部が銀行の自社の案内。
 *   上位に欠けている点：
 *   ①銀行ごとの必要書類が横に並んでいない（各行が自分の書類だけを書く）
 *   ②設立直後で取引の書類がない会社が、事業内容の確認資料に何を出せるかを、銀行ごとに並べたものがない
 *   ③申込で実際に止まった所（入力と登記の食い違い）の実例がない
 * 銀行の決まりは公式の記載だけ（2026-11-17 確認。PayPay銀行は 11/16 確認の /guide/houjin/paypay-houjin-kouza と同じ）。
 * 出口：ラクスルバンク（A8）。承認されるまで href は空（出口は出ない）。書き方は案1。
 */
const LP_ID = 'guide-houjin-kouza-shorui';
const PATH = '/guide/houjin/kouza-hitsuyou-shorui';
const CHECKED = '2026/11/17';
const TITLE = '法人口座の開設に必要な書類｜銀行4つの一覧と、設立直後に困る「事業内容の確認資料」';
const DESCRIPTION = '法人口座の開設に必要な書類を、PayPay銀行・ラクスルバンク・楽天銀行・みずほ銀行の公式の記載で比べました。設立直後で請求書や契約書がまだない会社が、事業内容の確認資料に何を出せるか。申込で止まった実例つき。';

export const metadata: Metadata = {
  title: `${TITLE} | ${SITE_NAME}`,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}${PATH}` },
  openGraph: { title: TITLE, description: DESCRIPTION, url: `${SITE_URL}${PATH}`, siteName: SITE_NAME, type: 'article', locale: 'ja_JP', images: [{ url: ogImageUrl(TITLE), width: 1200, height: 630, alt: TITLE }] },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, images: [ogImageUrl(TITLE)] },
};

const S = {
  paypay: { name: 'PayPay銀行「口座開設に必要な書類（法人のお客さま）」', url: 'https://www.paypay-bank.co.jp/business/account/documents.html' },
  raksul1293: { name: 'ラクスルバンク よくあるご質問「口座開設の際、必要書類は何を提出すればいいですか。」', url: 'https://support.raksulbank.com/faq/show/1293?site_domain=default' },
  raksul518: { name: 'ラクスルバンク よくあるご質問「法人口座開設時の事業内容確認書類として、どのような書類を提出すべきかわからない」', url: 'https://support.raksulbank.com/faq/show/518?site_domain=default' },
  rakuten: { name: '楽天銀行「法人ビジネス口座開設に必要な書類一覧」', url: 'https://www.rakuten-bank.co.jp/business/account/id.html' },
  mizuho: { name: 'みずほ銀行「法人口座開設に必要な書類は？」', url: 'https://www.mizuhobank.co.jp/corporate/account/tips/topic_47.html' },
} as const;
type K = keyof typeof S;

/** 銀行ごとの必要書類（公式の記載どおり。書いていないものは足さない） */
const BANKS = [
  {
    bank: 'PayPay銀行', how: 'アップロード', src: ['paypay'] as K[],
    items: ['法人の印鑑証明書（発行から6か月以内の原本）', '取引担当者の本人確認書類（運転免許証かマイナンバーカード）と顔の撮影', '事業内容の確認資料 1点', '登記と今の所在地が違うときだけ、今の住所が分かる領収書など'],
  },
  {
    bank: 'ラクスルバンク', how: 'ネットで申込', src: ['raksul1293'] as K[],
    items: ['取引責任者の本人確認書類', '事業内容の確認書類 1点以上', '提出は、この2種類'],
  },
  {
    bank: '楽天銀行', how: '郵送', src: ['rakuten'] as K[],
    items: ['申込書兼申込委任状', '実質的支配者に関する届出書', '法人の印鑑証明書（原本）', '履歴事項全部証明書（原本）', '口座管理者の本人確認書類', '事業実態の確認できる資料'],
  },
  {
    bank: 'みずほ銀行', how: 'ネットで申込', src: ['mizuho'] as K[],
    items: ['登記事項証明書', '代表者・役員・実質的支配者などの確認書類', '面談する人の本人確認書類の画像', '実質的支配者の確認ができる書類', '必要に応じて、事業内容の資料・印鑑証明書など'],
  },
];

/** 事業内容の確認資料として出せるもの（設立直後の目で） */
const JIGYOU = [
  {
    bank: 'ラクスルバンク', src: ['raksul1293', 'raksul518'] as K[],
    ok: ['他社発行の請求書・発注書・納品書', '業務委託契約書などの契約書', '設立直後は、事業計画書（代表者の署名・捺印あり）', '自社のホームページの住所（商品・価格・会社概要が載っているもの）', '許認可証'],
    note: '1点で足りないときは、組み合わせて出す',
  },
  {
    bank: '楽天銀行', src: ['rakuten'] as K[],
    ok: ['自社のホームページの住所', '許認可・登録・届出の写し', '貴社あての発注書・納品書・請求書の写し', '本業の契約書の写し'],
    note: '設立6か月以内は、ホームページがあっても資料が要る。本店がバーチャルオフィスでも資料が要る。法人設立届出書・納税証明書は受け付けない',
  },
  {
    bank: 'PayPay銀行', src: ['paypay'] as K[],
    ok: ['許認可証', '契約書・請求書・納品書など'],
    note: '登記事項証明書では代わりにならない。設立直後も1点必要',
  },
  {
    bank: 'みずほ銀行', src: ['mizuho'] as K[],
    ok: ['会社案内', '商品パンフレット', '法人名義の国税または地方税の領収書', '受注書・発注書・請求書など'],
    note: '求められた場合に出す。書類の例として挙げているもの',
  },
];

const FAQS = [
  { q: '法人口座の開設に必要な書類は何ですか？', a: '比べた4行では、手続きをする人の本人確認書類と、事業内容が分かる資料が軸です（みずほ銀行の事業内容の資料は、求められた場合）。楽天銀行やみずほ銀行のように、登記事項証明書や印鑑証明書の原本を出す銀行もあります。銀行ごとの違いは、このページの比較を見てください。' },
  { q: '設立直後で、請求書や契約書がまだありません。何を出せますか？', a: 'ラクスルバンクは、設立直後の補う書類として、代表者が署名・捺印した事業計画書を挙げています。楽天銀行は、設立6か月以内だとホームページの住所だけでは足りず、取引の書類などが要るとしています。' },
  { q: '本店がバーチャルオフィスだと、書類は増えますか？', a: '楽天銀行は、本店にバーチャルオフィスやレンタルオフィスを使う場合、事業実態の確認できる資料の提出が必要としています。' },
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
    { '@type': 'Article', author: KAKITE_LD, publisher: { '@id': 'https://www.tsuginotenavi.jp/#organization' }, headline: TITLE, description: DESCRIPTION, inLanguage: 'ja', about: { '@type': 'Thing', name: '法人口座の必要書類' }, mentions: ['PayPay銀行', 'ラクスルバンク', '楽天銀行', 'みずほ銀行'].map((name) => ({ '@type': 'BankOrCreditUnion', name })), datePublished: '2026-11-17T10:00:00+09:00', dateModified: '2026-11-17T10:00:00+09:00', mainEntityOfPage: `${SITE_URL}${PATH}` },
    { '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: SITE_NAME, item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: '法人成り', item: `${SITE_URL}/guide/houjin` },
      { '@type': 'ListItem', position: 3, name: '法人口座の必要書類', item: `${SITE_URL}${PATH}` },
    ] },
    { '@type': 'FAQPage', mainEntity: FAQS.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) },
  ],
};

const COMMON = [
  { icon: IdCard, h: '本人確認書類', s: '4行とも' },
  { icon: Briefcase, h: '事業内容の資料', s: '4行とも' },
  { icon: Stamp, h: '印鑑証明書', s: '銀行による' },
  { icon: ScrollText, h: '登記事項証明書', s: '銀行による' },
];

export default function Page() {
  const hasExit = !!HOUJIN_PARTNERS.raksulBank.href;
  return (
    <div className="flex min-h-screen flex-col bg-[#f6f8fa]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <LpHeader />
      <LpViewTracker lpId={LP_ID} version="v2-2026-11-24" />
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
          <span>法人口座の必要書類</span>
        </nav>

        <section className="flex flex-col gap-5" aria-labelledby="top">
          <div className="flex flex-col gap-2">
            <p className="text-[13px] font-bold text-sky-700">銀行4つの公式の記載で比較</p>
            <h1 id="top" className="text-[28px] font-black leading-tight text-slate-900">法人口座の開設に<br />必要な書類<br /><span className="text-[20px] text-orange-600">設立直後に困るのは、事業内容の資料</span></h1>
            <KakiteLine />
          </div>
          <ul className="grid grid-cols-2 gap-2" aria-label="必要書類の早見">
            {COMMON.map(({ icon: I, h, s }) => (
              <li key={h} className="flex flex-col gap-1 rounded-2xl bg-white p-3.5 ring-1 ring-slate-200">
                <I size={20} className="text-sky-700" aria-hidden="true" />
                <span className="text-[14px] font-black text-slate-900">{h}</span>
                <span className={`text-[12px] font-bold ${s === '4行とも' ? 'text-orange-700' : 'text-slate-500'}`}>{s}</span>
              </li>
            ))}
          </ul>
          <p className="rounded-2xl bg-white p-4 text-[14px] leading-relaxed text-slate-800 ring-1 ring-slate-200">
            <span className="mb-1 block text-[12px] font-black text-sky-700">結論</span>
            法人口座の必要書類は、比べた4行とも「本人確認書類」と「事業内容が分かる資料」の2つが軸です（みずほ銀行の事業内容の資料は、求められた場合）。設立直後に困るのは事業内容の資料で、請求書や契約書がまだない会社は、事業計画書やホームページを受け付ける銀行を選びます。
          </p>
        </section>

        <section className={SECTION} aria-labelledby="hikaku">
          <h2 id="hikaku" className={H2}>法人口座の必要書類（銀行4つの比較）</h2>
          <ul className="grid gap-2.5">
            {BANKS.map((b) => (
              <li key={b.bank} className="flex flex-col gap-2 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                <span className="flex items-center gap-2">
                  <Landmark size={20} className="shrink-0 text-sky-700" aria-hidden="true" />
                  <span className="flex-1 text-[16px] font-black text-slate-900">{b.bank}</span>
                  <span className="rounded bg-sky-50 px-1.5 py-0.5 text-[11px] font-bold text-sky-800">{b.how}</span>
                </span>
                <ul className="flex flex-col gap-1 pl-7 text-[13px] leading-relaxed text-slate-700">
                  {b.items.map((t) => <li key={t} className="list-disc">{t}</li>)}
                </ul>
              </li>
            ))}
          </ul>
          <p className="flex items-start gap-2 text-[13px] text-slate-700"><Info size={18} className="mt-0.5 shrink-0 text-sky-700" aria-hidden="true" />会社の状況によって、求められる書類は増えます。申込の前に、各銀行の案内で確かめてください。</p>
          <p className={SRC}>出典：{src(['paypay', 'raksul1293', 'rakuten', 'mizuho'])}（{CHECKED} 確認）</p>
        </section>

        <section className={SECTION} aria-labelledby="jigyou">
          <h2 id="jigyou" className={H2}>事業内容の確認資料：設立直後に出せるもの</h2>
          <p className="text-[14px] text-slate-700">取引の書類がまだない会社ほど、ここで止まります。</p>
          <ul className="grid gap-2.5">
            {JIGYOU.map((j) => (
              <li key={j.bank} className="flex flex-col gap-2 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                <span className="text-[16px] font-black text-slate-900">{j.bank}</span>
                <ul className="flex flex-col gap-1 pl-5 text-[13px] leading-relaxed text-slate-700">
                  {j.ok.map((t) => <li key={t} className={`list-disc ${t.startsWith('設立直後') ? 'font-bold text-orange-800' : ''}`}>{t}</li>)}
                </ul>
                <p className="rounded-xl bg-slate-50 px-3 py-2 text-[12px] leading-relaxed text-slate-600">{j.note}</p>
              </li>
            ))}
          </ul>
          <div className="flex items-start gap-3 rounded-2xl border-2 border-orange-200 bg-orange-50/60 p-4">
            <FileText size={22} className="mt-0.5 shrink-0 text-orange-700" aria-hidden="true" />
            <span className="flex flex-col gap-1">
              <span className="text-[15px] font-black text-slate-900">請求書も契約書もまだない会社は</span>
              <span className="text-[13px] leading-relaxed text-slate-700">比べた4行のうち、設立直後に補う書類として事業計画書を挙げているのは、ラクスルバンクだけでした。</span>
            </span>
          </div>
          <div className="flex items-start gap-3 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
            <Globe size={22} className="mt-0.5 shrink-0 text-sky-700" aria-hidden="true" />
            <span className="flex flex-col gap-1">
              <span className="text-[15px] font-black text-slate-900">ホームページは先に作る</span>
              <span className="text-[13px] leading-relaxed text-slate-700">ラクスルバンクと楽天銀行は、ホームページの住所を事業内容の資料に挙げています。載せる中身（会社名・所在地・商品・価格など）は銀行ごとに決まっています。</span>
            </span>
          </div>
          <p className={SRC}>出典：{src(['raksul1293', 'raksul518', 'rakuten', 'paypay', 'mizuho'])}（{CHECKED} 確認）</p>
        </section>

        <section className={SECTION} aria-labelledby="kigen">
          <h2 id="kigen" className={H2}>書類の期限と、止まりやすい所</h2>
          <ul className="grid gap-2.5">
            {[
              { icon: CalendarClock, h: '発行から6か月以内', d: 'PayPay銀行の印鑑証明書、みずほ銀行の店舗での登記事項証明書は、発行から6か月以内の原本です。楽天銀行は、銀行に届いた時点で期限内であることを求めています。', tag: '公式' },
              { icon: Info, h: '申込の入力と、書類の食い違い', d: '私たちはPayPay銀行で、法人の住所に自宅を入れて手続きが止まりました。ドコモSMTBネット銀行の申込では、社名の英字が1文字抜けていました。', tag: '実例' },
            ].map(({ icon: I, h, d, tag }) => (
              <li key={h} className="flex items-start gap-3 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-700"><I size={20} aria-hidden="true" /></span>
                <span className="flex flex-1 flex-col gap-0.5">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="text-[15px] font-black text-slate-900">{h}</span>
                    <span className={`rounded px-1.5 py-0.5 text-[11px] font-bold ${tag === '実例' ? 'bg-orange-100 text-orange-800' : 'bg-slate-100 text-slate-600'}`}>{tag}</span>
                  </span>
                  <span className="text-[13px] leading-relaxed text-slate-600">{d}</span>
                </span>
              </li>
            ))}
          </ul>
          <p className={SRC}>出典：{src(['paypay', 'mizuho', 'rakuten'])}（{CHECKED} 確認）。実例：運営会社の2026年11月の申込</p>
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
              lpId={LP_ID} partner="raksulBank" position="bottom" lead="取引の書類がまだない会社の申込先に"
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
          <p className={`${SRC} mt-1`}>出典：{src(['raksul1293', 'rakuten', 'mizuho'])}（{CHECKED} 確認）</p>
        </section>

        <nav aria-label="銀行ごとの審査" className="flex flex-col gap-2">
          <h2 className="mb-1 text-[18px] font-black text-slate-900">銀行ごとの審査</h2>
          {[
            { href: '/guide/houjin/smbc-shinsa', t: '三井住友銀行の審査に落ちたら', s: 'Trunk の必要書類と見直す点' },
            { href: '/guide/houjin/yucho-shinsa', t: 'ゆうちょ銀行の審査に落ちたら', s: '公式の必要書類11項目' },
            { href: '/guide/houjin/resona-shinsa', t: 'りそな銀行の審査に落ちたら', s: 'ネットの再申込はできず店頭へ' },
            { href: '/guide/houjin/mizuho-shinsa', t: 'みずほ銀行の審査に落ちたら', s: '公式が挙げる4つの確認点と申込の流れ' },
            { href: '/guide/houjin/rakuten-shinsa', t: '楽天銀行の審査に落ちたら', s: '設立6か月以内はホームページだけでは不足' },
            { href: '/guide/houjin/docomo-smtb-shinsa', t: 'ドコモSMTBネット銀行（旧 住信SBIネット銀行）の審査に落ちた', s: '申込から4日で見合わせ' },
            { href: '/guide/houjin/gmo-aozora-shinsa', t: 'GMOあおぞらネット銀行の審査に落ちた', s: '出した書類と、名義のこと' },
            { href: '/guide/houjin/paypay-houjin-kouza', t: 'PayPay銀行の法人口座の審査', s: '住所の違いで止まり、4日で通った' },
            { href: '/guide/houjin/goudou-kouza-meigi', t: '合同会社の口座名義の書き方', s: 'カナの略し方と、申込の入力' },
            { href: '/guide/houjin/shinsa-ochita-tsugi', t: '法人口座の審査に落ちたら次は', s: '落ちたあとにすること4つ' },
          ].map((l) => (
            <Link key={l.href} href={l.href} className="flex items-center gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-slate-200 hover:ring-slate-300">
              <span className="flex flex-1 flex-col"><span className="text-[15px] font-black text-slate-900">{l.t}</span><span className="text-[12px] text-slate-600">{l.s}</span></span>
              <ArrowRight size={18} className="text-sky-700" aria-hidden="true" />
            </Link>
          ))}
        </nav>

        <nav aria-label="あわせて読む" className="flex flex-col gap-2">
          {[
            { href: '/guide/houjin/kouza-virtual-office', t: '法人口座とバーチャルオフィス', s: '本店がバーチャルオフィスだと増える書類と郵便の注意' },
            { href: '/guide/houjin/kouza-kaisetsu-kikan', t: '法人口座の開設期間', s: '設立から審査通過まで19日の実例' },
            { href: '/guide/houjin/kouza-tsukurenai', t: '法人口座が作れない', s: '3つの銀行に申し込み、通ったのは1つ' },
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
          必要書類は各銀行の公式の記載（2026年11月17日 確認）です。銀行は案内を変えることがあり、会社の状況で求められる書類も変わります。実例は運営会社（BlueAdventures合同会社）が2026年11月に申し込んだときのものです。最終更新：2026年11月17日
        </p>
      </main>
      <LpFooter />
    </div>
  );
}
