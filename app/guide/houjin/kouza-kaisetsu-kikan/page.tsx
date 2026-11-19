import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, CalendarDays, CheckCircle2, Clock, FileUp, Info, Landmark, ListChecks, Split, Sun, XCircle } from 'lucide-react';
import LpHeader from '@/components/lp/LpHeader';
import LpFooter from '@/components/lp/LpFooter';
import LpViewTracker from '@/components/lp/LpViewTracker';
import { KakiteLine, KakiteNote, KAKITE_LD } from '@/components/houjin/Kakite';
import HoujinExit from '@/components/houjin/HoujinExit';
import { SITE_URL, SITE_NAME, ogImageUrl } from '@/components/loan/LoanArticle';
import { HOUJIN_PARTNERS } from '@/lib/houjin/partners';

/**
 * 法人口座の開設期間：運営会社が設立から審査通過まで19日かかった実例（2026-11-17 作成）。
 * 受ける言葉（キーワードプランナー 2025/11〜2026/10 の月平均、11/17 確認）：
 *   法人口座 開設 期間 90（主）・法人口座 必要書類 90・法人口座 開設 バーチャルオフィス 30・法人口座 開設 日数 20・
 *   合同会社 法人口座 おすすめ 20・法人口座 開設 流れ 10。設立直後 法人口座・法人口座 審査 期間・個人事業主 法人化 口座は数字なし。
 * 主の言葉を「開設 期間」にした理由：必要書類と同じ90で、こちらは運営会社の日付つきの経過（他にない一次情報）がそのまま答えになる。
 * 上位（11/17、Google「法人口座 開設 期間」）：みずほ銀行・三井住友銀行・会社設立の税理士事務所・PayPay銀行のよくある質問・
 *   GMOあおぞらネット銀行の記事（2024/6）・ゆうちょ・創業手帳・銀行の記事・三菱UFJ銀行。AIによる概要あり。
 *   ほとんどが銀行が自分の口座を案内するページ。上位に欠けている点：
 *   ①設立直後の会社が、設立から通るまで何日かかったかの日付つきの実例がない
 *   ②銀行ごとの公式の日数が横に並んでいない（各行が自分の日数だけを書く）
 *   ③「最短当日」が何で延びるのかを、公式の注記から拾って並べたものがない
 * 数字は公式の記載だけ（PayPay銀行のよくある質問 97、ラクスルバンクの公式・よくある質問 33、みずほ銀行の記事。11/17 確認）。
 * 体験はオーナーの記録（lib/houjin/kouza-data.ts と同じ）。
 * 出口：ラクスルバンク（A8）。承認されるまで href は空（出口は出ない）。書き方は案1。
 */
const LP_ID = 'guide-houjin-kouza-kikan';
const PATH = '/guide/houjin/kouza-kaisetsu-kikan';
const CHECKED = '2026/11/17';
const TITLE = '法人口座の開設期間はどれくらい？設立から審査通過まで19日の実例と、最短当日が延びる理由';
const DESCRIPTION = '法人口座の開設にかかる期間を、銀行の公式の記載（最短当日〜2週間から1か月ほど）と、設立直後の合同会社が審査に通るまで19日かかった日付つきの実例で整理。最短当日が延びる理由と、早く作るためにできること。';

export const metadata: Metadata = {
  title: `${TITLE} | ${SITE_NAME}`,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}${PATH}` },
  openGraph: { title: TITLE, description: DESCRIPTION, url: `${SITE_URL}${PATH}`, siteName: SITE_NAME, type: 'article', locale: 'ja_JP', images: [{ url: ogImageUrl(TITLE), width: 1200, height: 630, alt: TITLE }] },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, images: [ogImageUrl(TITLE)] },
};

const S = {
  paypay: { name: 'PayPay銀行 よくあるご質問「口座開設までどのくらい日にちがかかりますか。」', url: 'https://faq.paypay-bank.co.jp/faq/show/97?site_domain=business' },
  raksulTop: { name: 'ラクスルバンク 公式サイト', url: 'https://raksulbank.com/' },
  raksulFaq: { name: 'ラクスルバンク よくあるご質問「口座開設の審査にはどれくらいの時間がかかりますか？」', url: 'https://support.raksulbank.com/faq/show/33?site_domain=default' },
  mizuho: { name: 'みずほ銀行「法人口座開設にかかる期間はどのくらい？」', url: 'https://www.mizuhobank.co.jp/corporate/account/tips/topic_98.html' },
} as const;
type K = keyof typeof S;

/** 銀行が案内している日数（公式の記載だけ） */
const KOUSHIKI = [
  { bank: 'PayPay銀行', big: '最短当日', s: '必要書類をアップロードした場合', src: ['paypay'] as K[] },
  { bank: 'ラクスルバンク', big: '最短当日', s: 'ふだんは1週間ほど。最短当日は取引責任者と代表者が同じ人のとき', src: ['raksulTop', 'raksulFaq'] as K[] },
  { bank: '法人口座の目安', big: '2週間〜1か月ほど', s: 'みずほ銀行の案内。銀行によって異なる', src: ['mizuho'] as K[] },
];

/** 設立から審査通過までの経過（2026年。運営会社の実例） */
const KEIKA = [
  { d: '2026/10/28', n: '0日', t: '会社を設立（登記）', ok: null },
  { d: '11月上旬', n: '', t: 'GMOあおぞらネット銀行に申込 → 通らず', ok: false },
  { d: '11/12', n: '15日', t: 'ドコモSMTBネット銀行とPayPay銀行に同時に申込', ok: null },
  { d: '11/13', n: '16日', t: 'PayPay銀行：法人の住所に自宅を入れていて止まる → 登記どおりに直して申し込み直し', ok: null },
  { d: '11/16', n: '19日', t: 'ドコモSMTBネット銀行は見合わせ、PayPay銀行は審査に通過', ok: true },
] as const;

/** 最短当日が延びる理由 */
const NOBIRU = [
  { icon: FileUp, h: '書類を郵送する・書類に不備がある', d: 'アップロードなら最短当日でも、郵送や不備があると日数がかかります。', from: '公式', src: ['paypay'] as K[] },
  { icon: Sun, h: '休日・祝日をはさむ', d: '銀行の休業日の申込は、当日には開設できません。', from: '公式', src: ['paypay', 'raksulTop'] as K[] },
  { icon: Clock, h: '申込が多い時期', d: '申込が多いときは、当日に開設できないことがあります。', from: '公式', src: ['raksulFaq'] as K[] },
  { icon: XCircle, h: '審査に落ちて、次の銀行へ', d: '1行目に通らず、次の申込は設立から15日後でした。', from: '実例', src: [] as K[] },
  { icon: Split, h: '入力が登記と違って止まる', d: '法人の住所に自宅を入れていて、手続きが止まりました。', from: '実例', src: [] as K[] },
];

/** 早く作るためにできること */
const HAYAKU = [
  { h: '書類は郵送でなくアップロードで出す', d: 'PayPay銀行は、アップロードなら最短当日と案内しています。' },
  { h: '平日の早い時間に申し込む', d: 'ラクスルバンクは、平日14時までの申込は原則その日のうちに審査するとしています。' },
  { h: '2行以上に同時に申し込む', d: '落ちた理由は教えてもらえません。1行ずつ結果を待つと、その分だけ遅れます。' },
  { h: '申込の入力を登記どおりにそろえる', d: '社名・本店の住所は登記事項証明書のとおりに。私たちはここで止まりました。' },
];

const FAQS = [
  { q: '法人口座の開設にかかる期間はどれくらいですか？', a: 'ネット銀行には最短当日と案内するところがあり、みずほ銀行は法人口座の開設の目安を2週間〜1か月ほどとしています。私たちは設立から審査に通るまで19日、申込から結果までは4日でした。' },
  { q: '最短で法人口座を作れる銀行はどこですか？', a: 'このページで確かめた中では、PayPay銀行とラクスルバンクが最短当日の開設と案内しています。ただし、書類の郵送や不備、休日をはさむと日数がかかるとしています。' },
  { q: '審査に落ちると、どれくらい遅れますか？', a: '私たちは1行目に通らず、次の2行に申し込んだのは設立から15日後でした。落ちた理由は教えてもらえないため、はじめから2行以上に同時に申し込むと遅れを減らせます。' },
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
    { '@type': 'Article', author: KAKITE_LD, publisher: { '@id': 'https://www.tsuginotenavi.jp/#organization' }, headline: TITLE, description: DESCRIPTION, inLanguage: 'ja', about: { '@type': 'Thing', name: '法人口座の開設期間' }, mentions: ['PayPay銀行', 'ラクスルバンク', 'みずほ銀行', 'GMOあおぞらネット銀行', 'ドコモSMTBネット銀行'].map((name) => ({ '@type': 'BankOrCreditUnion', name })), datePublished: '2026-11-17T03:00:00+09:00', dateModified: '2026-11-17T03:00:00+09:00', mainEntityOfPage: `${SITE_URL}${PATH}` },
    { '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: SITE_NAME, item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: '法人成り', item: `${SITE_URL}/guide/houjin` },
      { '@type': 'ListItem', position: 3, name: '法人口座の開設期間', item: `${SITE_URL}${PATH}` },
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
          <span>法人口座の開設期間</span>
        </nav>

        <section className="flex flex-col gap-5" aria-labelledby="top">
          <div className="flex flex-col gap-2">
            <p className="text-[13px] font-bold text-sky-700">運営会社の実例</p>
            <h1 id="top" className="text-[28px] font-black leading-tight text-slate-900">法人口座の開設期間<br /><span className="text-[22px] text-orange-600">設立から審査通過まで19日</span></h1>
            <p className="text-[14px] text-slate-600">設立直後の合同会社で、法人口座の審査に通るまでにかかった日数です。</p>
            <KakiteLine />
          </div>
          <div className="grid grid-cols-2 gap-2" aria-label="かかった日数">
            {[
              { n: '19日', s: '設立から審査通過まで' },
              { n: '4日', s: '申込から結果まで' },
            ].map((x) => (
              <div key={x.s} className="flex flex-col items-center gap-0.5 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                <span className="text-[30px] font-black leading-none text-orange-600">{x.n}</span>
                <span className="text-[12px] text-slate-600">{x.s}</span>
              </div>
            ))}
          </div>
          <p className="rounded-2xl bg-white p-4 text-[14px] leading-relaxed text-slate-800 ring-1 ring-slate-200">
            <span className="mb-1 block text-[12px] font-black text-sky-700">結論</span>
            法人口座の開設期間は、ネット銀行の公式で最短当日、みずほ銀行の目安で2週間〜1か月ほど。私たちは設立から審査に通るまで19日でした。日数を延ばしたのは、1行目に落ちたことと、申込の入力が登記と違って止まったことです。
          </p>
        </section>

        <section className={SECTION} aria-labelledby="koushiki">
          <h2 id="koushiki" className={H2}>銀行が案内している開設期間</h2>
          <ul className="grid gap-2.5">
            {KOUSHIKI.map((k) => (
              <li key={k.bank} className="flex items-center gap-3 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                <Landmark size={22} className="shrink-0 text-sky-700" aria-hidden="true" />
                <span className="flex flex-1 flex-col gap-0.5">
                  <span className="text-[13px] font-bold text-slate-600">{k.bank}</span>
                  <span className="text-[19px] font-black leading-tight text-slate-900">{k.big}</span>
                  <span className="text-[12px] leading-relaxed text-slate-600">{k.s}</span>
                </span>
              </li>
            ))}
          </ul>
          <p className="flex items-start gap-2 text-[13px] text-slate-700"><Info size={18} className="mt-0.5 shrink-0 text-sky-700" aria-hidden="true" />「最短当日」は、書類も入力もそろい、審査がすぐ終わったときの日数です。</p>
          <p className={SRC}>出典：{src(['paypay', 'raksulTop', 'raksulFaq', 'mizuho'])}（{CHECKED} 確認）</p>
        </section>

        <section className={SECTION} aria-labelledby="keika">
          <h2 id="keika" className={H2}>設立から審査通過までの19日</h2>
          <ol className="flex flex-col">
            {KEIKA.map((k, i) => (
              <li key={`${k.d}-${i}`} className="flex gap-3">
                <span className="flex flex-col items-center">
                  {k.ok === true
                    ? <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-600" aria-hidden="true" />
                    : k.ok === false
                      ? <XCircle size={18} className="mt-0.5 shrink-0 text-slate-400" aria-hidden="true" />
                      : <span className="mt-1 h-3 w-3 shrink-0 rounded-full bg-sky-700" />}
                  {i < KEIKA.length - 1 && <span className="w-0.5 flex-1 bg-sky-200" />}
                </span>
                <span className="flex flex-col pb-4">
                  <span className="flex items-baseline gap-2">
                    <span className="text-[13px] font-black text-sky-800">{k.d}</span>
                    {k.n && <span className="rounded bg-sky-50 px-1.5 text-[11px] font-bold text-sky-700">設立から{k.n}</span>}
                  </span>
                  <span className="text-[14px] text-slate-800">{k.t}</span>
                </span>
              </li>
            ))}
          </ol>
          <ul className="grid gap-2 text-[13px]">
            {[
              { h: '申込から結果まで', d: '4日（11/12 → 11/16）。途中で止まり、申し込み直した分も含みます。' },
              { h: '最初の申込', d: '11月上旬。通らなかったあとで、11/12に次の2行へ申し込みました。' },
            ].map((x) => (
              <li key={x.h} className="flex flex-col rounded-2xl bg-white p-3.5 ring-1 ring-slate-200">
                <span className="font-black text-slate-900">{x.h}</span>
                <span className="text-slate-600">{x.d}</span>
              </li>
            ))}
          </ul>
          <Link href="/guide/houjin/kouza-tsukurenai" className="flex items-center gap-1 text-[13px] font-bold text-sky-800 underline underline-offset-2">審査に落ちた理由の見立てと、会社の条件<ArrowRight size={14} aria-hidden="true" /></Link>
        </section>

        <section className={SECTION} aria-labelledby="nobiru">
          <h2 id="nobiru" className={H2}>法人口座の開設期間が延びる理由</h2>
          <ul className="grid gap-2.5">
            {NOBIRU.map((n) => {
              const I = n.icon;
              return (
                <li key={n.h} className="flex items-start gap-3 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-700"><I size={20} aria-hidden="true" /></span>
                  <span className="flex flex-1 flex-col gap-0.5">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="text-[15px] font-black text-slate-900">{n.h}</span>
                      <span className={`rounded px-1.5 py-0.5 text-[11px] font-bold ${n.from === '実例' ? 'bg-orange-100 text-orange-800' : 'bg-slate-100 text-slate-600'}`}>{n.from}</span>
                    </span>
                    <span className="text-[13px] leading-relaxed text-slate-600">{n.d}</span>
                  </span>
                </li>
              );
            })}
          </ul>
          <p className={SRC}>公式：{src(['paypay', 'raksulTop', 'raksulFaq'])}（{CHECKED} 確認）。実例：運営会社の2026年11月の申込</p>
        </section>

        <section className={SECTION} aria-labelledby="hayaku">
          <h2 id="hayaku" className={H2}>法人口座を早く作るには</h2>
          <ol className="grid gap-2.5">
            {HAYAKU.map((h, i) => (
              <li key={h.h} className="flex items-start gap-3 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-[15px] font-black text-sky-700">{i + 1}</span>
                <span className="flex flex-col gap-0.5">
                  <span className="text-[15px] font-black text-slate-900">{h.h}</span>
                  <span className="text-[13px] leading-relaxed text-slate-600">{h.d}</span>
                </span>
              </li>
            ))}
          </ol>
          <p className={SRC}>出典：{src(['paypay', 'raksulFaq'])}（{CHECKED} 確認）</p>
          <Link href="/guide/houjin/kouza-tsukurenai#check" className="flex items-center gap-3 rounded-2xl border-2 border-sky-200 bg-sky-50/60 p-3.5 hover:border-sky-300">
            <ListChecks size={22} className="shrink-0 text-sky-700" aria-hidden="true" />
            <span className="flex flex-1 flex-col"><span className="text-[15px] font-black text-slate-900">申込前チェック表（無料）</span><span className="text-[12px] text-slate-600">入力で止まらないための7つ。エクセル・PDF</span></span>
            <ArrowRight size={18} className="text-sky-700" aria-hidden="true" />
          </Link>
        </section>

        <section className={SECTION} aria-labelledby="kojin">
          <h2 id="kojin" className={H2}>個人事業から会社にする人へ</h2>
          <div className="flex items-start gap-3 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
            <CalendarDays size={22} className="mt-0.5 shrink-0 text-sky-700" aria-hidden="true" />
            <span className="flex flex-col gap-0.5">
              <span className="text-[15px] font-black text-slate-900">口座ができるまでの請求を先に決める</span>
              <span className="text-[13px] leading-relaxed text-slate-600">会社の口座は、登記のあとに申し込みます。私たちは設立から19日かかりました。会社として最初に出す請求の振込先は、口座の審査が終わる日から逆算しておきます。</span>
            </span>
          </div>
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
          <p className={`${SRC} mt-1`}>出典：{src(['paypay', 'raksulTop', 'mizuho'])}（{CHECKED} 確認）</p>
        </section>

        <nav aria-label="あわせて読む" className="flex flex-col gap-2">
        {[
          { href: '/guide/houjin/kouza-hitsuyou-shorui', t: '法人口座の必要書類', s: '銀行4つの比較と、設立直後の事業内容の資料' },
          { href: '/guide/houjin/paypay-houjin-kouza', t: 'PayPay銀行の法人口座', s: '4日で審査に通った経過と必要書類' },
          { href: '/guide/houjin/raksulbank', t: 'ラクスルバンクの審査と手数料', s: '審査はGMOあおぞらネット銀行。申し込める会社' },
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
          体験は運営会社（BlueAdventures合同会社）が2026年10〜11月に申し込んだときのものです。日数は銀行・時期・申込の内容で変わり、同じ日数になるとは限りません。最終更新：2026年11月17日
        </p>
      </main>
      <LpFooter />
    </div>
  );
}
