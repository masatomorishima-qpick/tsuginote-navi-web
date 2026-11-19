import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Coins, FileText, IdCard, Mail, Stamp, Briefcase, Info, Clock, Landmark } from 'lucide-react';
import LpHeader from '@/components/lp/LpHeader';
import LpFooter from '@/components/lp/LpFooter';
import LpViewTracker from '@/components/lp/LpViewTracker';
import { KakiteLine, KakiteNote, KAKITE_LD } from '@/components/houjin/Kakite';
import HoujinExit from '@/components/houjin/HoujinExit';
import { SITE_URL, SITE_NAME, ogImageUrl } from '@/components/loan/LoanArticle';
import { HOUJIN_PARTNERS } from '@/lib/houjin/partners';

/**
 * PayPay銀行の法人口座：運営会社が審査に通った実例（2026-11-16 作成）。
 * 受ける言葉（キーワードプランナー 2025/11〜2026/10 の月平均）：paypay銀行 法人口座 1,000（主）・paypay銀行 法人口座 審査 10。
 * 上位（11/16、WebSearch「PayPay銀行 法人口座」）：ほぼ PayPay銀行の公式ページ。ほかは比較サイト（マイベスト、2026/7 更新、開設の体験なし）と IT製品の紹介サイト。
 *   上位に欠けている点：①設立直後・バーチャルオフィスで実際に通った例 ②どこで止まったか ③必要書類を設立直後の目で並べたもの。
 * 銀行の決まりは公式の記載だけ（2026-11-16 確認）。体験はオーナーの記録どおり。
 * PayPay銀行には紹介料の案件がない（A8・ポイントサイトとも、11/16 確認）。
 * 出口：ラクスルバンク（他行あての振込が多い会社の、支払い用の2つ目の口座として。公式の手数料 145円と119円の比較が根拠）。
 *   承認されるまで href は空（出口は出ない）。書き方は案1。
 */
const LP_ID = 'guide-houjin-paypay-kouza';
const PATH = '/guide/houjin/paypay-houjin-kouza';
const CHECKED = '2026/11/16';
const TITLE = 'PayPay銀行の法人口座｜設立直後・バーチャルオフィスで審査に通った実例と必要書類・手数料';
const DESCRIPTION = 'PayPay銀行の法人口座に、設立直後・資本金50万円・本店がバーチャルオフィスの合同会社で申し込み、4日で審査に通った実例。住所の食い違いで止まった所、設立直後に要る「事業内容の確認資料」、他行あての振込手数料、郵便の受け取りの注意を公式の記載で整理。';

export const metadata: Metadata = {
  title: `${TITLE} | ${SITE_NAME}`,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}${PATH}` },
  openGraph: { title: TITLE, description: DESCRIPTION, url: `${SITE_URL}${PATH}`, siteName: SITE_NAME, type: 'article', locale: 'ja_JP', images: [{ url: ogImageUrl(TITLE), width: 1200, height: 630, alt: TITLE }] },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, images: [ogImageUrl(TITLE)] },
};

const S = {
  docs: { name: 'PayPay銀行「口座開設に必要な書類（法人のお客さま）」', url: 'https://www.paypay-bank.co.jp/business/account/documents.html' },
  corp: { name: 'PayPay銀行「法人口座を開設するメリット」', url: 'https://www.paypay-bank.co.jp/business/first/corporation.html' },
  multi: { name: 'PayPay銀行「追加口座開設（法人のお客さま）」', url: 'https://www.paypay-bank.co.jp/business/account/multiple.html' },
  raksul: { name: 'GMOあおぞらネット銀行「ラクスルバンク支店に関する特約」', url: 'https://gmo-aozora.com/provision/pdf/raksul_260816.pdf' },
} as const;
type K = keyof typeof S;

const KEIKA = [
  { d: '11/12', t: '申込（設立から15日）' },
  { d: '11/13', t: '法人の住所に自宅を入れていて、登記の本店（バーチャルオフィス）と違うため手続きが止まる' },
  { d: '11/13', t: '法人の住所を登記どおりに直して申し込み直し' },
  { d: '11/16', t: '審査に通過（設立から19日）' },
];

const YOUTEN = [
  { icon: Coins, h: '他行あての振込 145円', s: 'PayPay銀行あては0円（税込）' },
  { icon: Clock, h: '最短当日に開設', s: '来店・捺印なし' },
  { icon: Landmark, h: '原則1法人1口座', s: '特別な事情があれば最大20口座' },
  { icon: Mail, h: '郵送物は転送不要', s: '受け取れないと利用が止まる' },
];

const SHORUI = [
  { icon: Stamp, h: '法人の印鑑証明書', s: '発行から6か月以内の原本をアップロード' },
  { icon: IdCard, h: '取引担当者の本人確認書類', s: '運転免許証かマイナンバーカード。あわせて顔を撮影' },
  { icon: Briefcase, h: '事業内容の確認資料を1点', s: '許認可証、または契約書・請求書・納品書など。登記事項証明書では代わりにならない' },
  { icon: FileText, h: '登記と今の所在地が違うときだけ', s: '法人名・今の住所が分かる税金・社会保険料・固定電話の領収書など1点' },
];

const FAQS = [
  { q: '設立直後でもPayPay銀行の法人口座は作れますか？', a: '私たちは設立から19日で審査に通りました。ただし、事業内容の確認資料（許認可証、または契約書・請求書・納品書など）を1点出せないと開設できず、設立直後も同じだとPayPay銀行は案内しています。' },
  { q: 'バーチャルオフィスの住所でも審査に通りますか？', a: '私たちは本店がバーチャルオフィスのまま通りました。キャッシュカードなどは法人の住所へ転送不要の簡易書留で届くため、バーチャルオフィスで書留を受け取れるかを先に確かめておくと安心です。' },
  { q: '審査は何日かかりましたか？', a: '11/12に申し込み、11/13に法人の住所の食い違いで止まり、申し込み直して11/16に通りました。公式は最短当日の開設としていますが、申込の内容によって日数は変わります。' },
  { q: 'PayPay銀行で法人口座を2つ持てますか？', a: '原則1法人1口座です。店舗や取引先、支払いの用途ごとに分けるなど特別な事情があれば、ログイン後の画面から最大20口座まで追加を申し込めます。' },
];

function src(keys: K[]) {
  return keys.map((k, i) => (
    <span key={k}>{i > 0 && '・'}<a href={S[k].url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">{S[k].name}</a></span>
  ));
}

const H2 = 'text-[22px] font-black leading-snug text-slate-900';
const SRC = 'text-[11px] leading-relaxed text-slate-500';

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    { '@type': 'Article', author: KAKITE_LD, publisher: { '@id': 'https://www.tsuginotenavi.jp/#organization' }, headline: TITLE, description: DESCRIPTION, inLanguage: 'ja', datePublished: '2026-11-16T19:30:00+09:00', dateModified: '2026-11-16T19:30:00+09:00', mainEntityOfPage: `${SITE_URL}${PATH}`, about: { '@type': 'Thing', name: 'PayPay銀行の法人口座' }, mentions: [{ '@type': 'BankOrCreditUnion', name: 'PayPay銀行' }] },
    { '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: SITE_NAME, item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: '法人成り', item: `${SITE_URL}/guide/houjin` },
      { '@type': 'ListItem', position: 3, name: 'PayPay銀行の法人口座', item: `${SITE_URL}${PATH}` },
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
      <LpViewTracker lpId={LP_ID} version="v1-2026-11-16" />
      <main className="mx-auto flex w-full max-w-[520px] flex-1 flex-col gap-14 px-4 pt-4 pb-16">
        {hasExit && (
          <p className="-mb-10 flex flex-wrap items-center gap-x-2 text-[11px] text-slate-500">
            <span className="rounded border border-slate-300 px-1.5 tracking-widest">PR</span>
            <span>当サイトは紹介料を受け取っています</span>
            <Link href="/policy" className="text-sky-800 underline underline-offset-2">中立性ポリシー</Link>
          </p>
        )}
        <nav aria-label="現在の位置" className="-mb-10 text-[12px] text-slate-500">
          <Link href="/" className="underline underline-offset-2">ホーム</Link><span className="mx-1.5">/</span>
          <Link href="/guide/houjin" className="underline underline-offset-2">法人成り</Link><span className="mx-1.5">/</span>
          <span>PayPay銀行の法人口座</span>
        </nav>

        <section className="flex flex-col gap-5" aria-labelledby="top">
          <div className="flex flex-col gap-2">
            <p className="text-[13px] font-bold text-sky-700">運営会社の実例</p>
            <h1 id="top" className="text-[28px] font-black leading-tight text-slate-900">PayPay銀行の法人口座<br /><span className="text-[22px] text-orange-600">設立直後でも審査に通った</span></h1>
            <p className="text-[14px] text-slate-600">設立直後・本店がバーチャルオフィスの合同会社で申し込んだ実例です。</p>
            <KakiteLine />
          </div>
          <div className="flex items-center gap-3 rounded-2xl bg-emerald-50 p-4 ring-1 ring-emerald-200">
            <CheckCircle2 size={30} className="shrink-0 text-emerald-600" aria-hidden="true" />
            <span className="flex flex-col">
              <span className="text-[17px] font-black text-emerald-900">申込から4日で審査に通過</span>
              <span className="text-[12px] text-emerald-950">設立から19日。途中で一度止まり、申し込み直し</span>
            </span>
          </div>
          <p className="rounded-2xl bg-white p-4 text-[14px] leading-relaxed text-slate-800 ring-1 ring-slate-200">
            <span className="mb-1 block text-[12px] font-black text-sky-700">結論</span>
            設立直後で取引の実績がなく、本店がバーチャルオフィスでも、PayPay銀行の法人口座の審査に通りました。止まったのは、法人の住所に自宅を入れていた1回だけ。登記の本店（バーチャルオフィス）に直して通りました。
          </p>
          <ul className="grid grid-cols-2 gap-2">
            {YOUTEN.map(({ icon: I, h, s }) => (
              <li key={h} className="flex flex-col gap-1.5 rounded-2xl bg-white p-3.5 ring-1 ring-slate-200">
                <I size={20} className="text-sky-700" aria-hidden="true" />
                <span className="text-[14px] font-black leading-snug text-slate-900">{h}</span>
                <span className="text-[11px] text-slate-600">{s}</span>
              </li>
            ))}
          </ul>
          <p className={SRC}>出典：{src(['corp', 'multi', 'docs'])}（{CHECKED} 確認）</p>
        </section>

        <section className="flex flex-col gap-5" aria-labelledby="keika">
          <h2 id="keika" className={H2}>PayPay銀行の審査の経過（2026年）</h2>
          <ol className="flex flex-col">
            {KEIKA.map((k, i) => (
              <li key={`${k.d}-${i}`} className="flex gap-3">
                <span className="flex flex-col items-center">
                  <span className="mt-1 h-3 w-3 shrink-0 rounded-full bg-sky-700" />
                  {i < KEIKA.length - 1 && <span className="w-0.5 flex-1 bg-sky-200" />}
                </span>
                <span className="flex flex-col pb-4">
                  <span className="text-[13px] font-black text-sky-800">{k.d}</span>
                  <span className="text-[14px] text-slate-800">{k.t}</span>
                </span>
              </li>
            ))}
          </ol>
          <div className="flex flex-col gap-1.5 rounded-2xl bg-orange-50 p-4 ring-1 ring-orange-200">
            <p className="text-[15px] font-black text-orange-900">止まった原因は、私たちの思い込み</p>
            <p className="text-[13px] leading-relaxed text-orange-950">バーチャルオフィスは郵便が月1回の転送。銀行の郵便は本人が受け取るものと思い込み、法人の住所に自宅を入れました。法人の住所は登記の本店と同じにします。キャッシュカードは法人の住所へ転送不要の簡易書留で届くため、バーチャルオフィスで受け取れるかを先に確かめます。</p>
          </div>
          <div className="flex flex-col gap-1.5 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
            <p className="text-[15px] font-black text-slate-900">申し込んだ会社</p>
            <p className="text-[13px] leading-relaxed text-slate-600">合同会社（代表1人）・資本金50万円・本店はバーチャルオフィス（郵便は月1回の転送）・代表は会社員と兼業・会社の取引はまだなし</p>
          </div>
          <Link href="/guide/houjin/kouza-tsukurenai" className="flex items-center gap-1 text-[13px] font-bold text-sky-800 underline underline-offset-2">同じ時期に2つの銀行では通らなかった経過<ArrowRight size={14} aria-hidden="true" /></Link>
        </section>

        <section className="flex flex-col gap-5" aria-labelledby="shorui">
          <h2 id="shorui" className={H2}>PayPay銀行の法人口座の必要書類</h2>
          <ul className="grid gap-2">
            {SHORUI.map(({ icon: I, h, s }) => (
              <li key={h} className="flex items-start gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-slate-200">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-700"><I size={18} aria-hidden="true" /></span>
                <span className="flex flex-col gap-0.5"><span className="text-[15px] font-black text-slate-900">{h}</span><span className="text-[13px] leading-relaxed text-slate-600">{s}</span></span>
              </li>
            ))}
          </ul>
          <p className="rounded-2xl bg-orange-50 p-4 text-[13px] font-bold leading-relaxed text-orange-950 ring-1 ring-orange-200">
            設立直後に気をつけるのは「事業内容の確認資料」。出せないと開設できず、設立直後も同じとPayPay銀行は案内しています。最初の契約書や請求書を、申し込む前に用意しておきます。
          </p>
          <p className={SRC}>出典：{src(['docs'])}（{CHECKED} 確認）</p>
          <Link href="/guide/houjin/kouza-hitsuyou-shorui" className="flex items-center gap-1 text-[13px] font-bold text-sky-800 underline underline-offset-2">ほかの銀行の必要書類と比べる<ArrowRight size={14} aria-hidden="true" /></Link>
        </section>

        <section className="flex flex-col gap-5" aria-labelledby="yubin">
          <h2 id="yubin" className={H2}>バーチャルオフィスで気をつけること</h2>
          <ul className="grid gap-2">
            {[
              { h: 'キャッシュカードは転送不要の簡易書留', d: '法人の住所へ届きます。転送の届けを出していても受け取れないことがある、と案内されています。' },
              { h: '郵送物を受け取れないと、利用が止まる', d: 'バーチャルオフィスで書留を受け取ってもらえるか、申し込む前に確かめます。' },
              { h: '取引担当者の住所に、転送先は使えない', d: '本人確認書類の住所（自宅）で申し込みます。' },
            ].map((c) => (
              <li key={c.h} className="flex items-start gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-slate-200">
                <Mail size={20} className="mt-0.5 shrink-0 text-sky-700" aria-hidden="true" />
                <span className="flex flex-col gap-0.5"><span className="text-[15px] font-black text-slate-900">{c.h}</span><span className="text-[13px] leading-relaxed text-slate-600">{c.d}</span></span>
              </li>
            ))}
          </ul>
          <p className={SRC}>出典：{src(['docs', 'corp'])}（{CHECKED} 確認）</p>
          <Link href="/guide/houjin/kouza-virtual-office" className="flex items-center gap-1 text-[13px] font-bold text-sky-800 underline underline-offset-2">ほかの銀行で、バーチャルオフィスだと変わること<ArrowRight size={14} aria-hidden="true" /></Link>
        </section>

        <section className="flex flex-col gap-5" aria-labelledby="tesuryo">
          <h2 id="tesuryo" className={H2}>振込手数料と、2つ目の口座</h2>
          <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200">
            <table className="w-full text-[13px]">
              <thead className="bg-slate-50 text-[12px] text-slate-600">
                <tr><th className="px-3 py-2 text-left font-bold">他行あての振込（1件・税込）</th><th className="px-3 py-2 text-right font-bold">手数料</th></tr>
              </thead>
              <tbody>
                <tr className="border-t border-slate-100"><td className="px-3 py-2.5 font-black text-slate-900">PayPay銀行</td><td className="px-3 py-2.5 text-right">145円</td></tr>
                <tr className="border-t border-slate-100"><td className="px-3 py-2.5 font-black text-slate-900">ラクスルバンク<br /><span className="text-[11px] font-normal text-slate-500">GMOあおぞらネット銀行のラクスルバンク支店</span></td><td className="px-3 py-2.5 text-right">119円</td></tr>
              </tbody>
            </table>
          </div>
          <p className="flex items-start gap-2 text-[13px] text-slate-700"><Info size={18} className="mt-0.5 shrink-0 text-sky-700" aria-hidden="true" />差は1件26円。振込が月30件なら月780円です。振込が多い会社は、支払い用の口座を分けると安くなります。</p>
          <p className={SRC}>出典：{src(['corp', 'raksul'])}（{CHECKED} 確認）。PayPay銀行は、新しく口座を作った人に、開設の翌々月末まで他行あての振込を月5回無料にしています。</p>
          <Link href="/guide/houjin/raksulbank" className="flex items-center gap-1 text-[13px] font-bold text-sky-800 underline underline-offset-2">ラクスルバンクの審査と申し込める会社<ArrowRight size={14} aria-hidden="true" /></Link>
        </section>

        {hasExit && (
          <section className="flex flex-col gap-5" aria-labelledby="exit">
            <h2 id="exit" className="sr-only">申込先</h2>
            <HoujinExit
              lpId={LP_ID} partner="raksulBank" position="bottom" lead="支払い用の2つ目の法人口座に"
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
          <p className={SRC}>出典：{src(['docs', 'corp', 'multi'])}（{CHECKED} 確認）</p>
        </section>

        <Link href="/guide/houjin" className="flex items-center gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-slate-200 hover:ring-slate-300">
          <span className="flex flex-1 flex-col"><span className="text-[15px] font-black text-slate-900">法人成りのページ一覧</span><span className="text-[12px] text-slate-600">設立から口座まで、つまずいた所</span></span>
          <ArrowRight size={18} className="text-sky-700" aria-hidden="true" />
        </Link>

        <KakiteNote />
        <p className="text-[11px] leading-relaxed text-slate-400">
          体験は運営会社（BlueAdventures合同会社）が2026年11月に申し込んだときのものです。審査の基準は公表されておらず、同じ結果になるとは限りません。手数料・書類は公式の記載（2026年11月16日 確認）で、変わることがあります。最終更新：2026年11月16日
        </p>
      </main>
      <LpFooter />
    </div>
  );
}
