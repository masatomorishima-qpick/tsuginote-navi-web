import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Building2, CalendarDays, CheckCircle2, Coins, FileSpreadsheet, FileText, Info, Mail, Users, Briefcase, XCircle, Download } from 'lucide-react';
import LpHeader from '@/components/lp/LpHeader';
import LpFooter from '@/components/lp/LpFooter';
import LpViewTracker from '@/components/lp/LpViewTracker';
import HenshuNote from '@/components/guide/HenshuNote';
import HoujinExit from '@/components/houjin/HoujinExit';
import KouzaCheck from '@/components/houjin/KouzaCheck';
import { SITE_URL, SITE_NAME, ogImageUrl } from '@/components/loan/LoanArticle';
import { HOUJIN_PARTNERS } from '@/lib/houjin/partners';
import { CHECKED_AT, SOURCES, RESULTS, JOUKEN, KEIKA, MITATE, ATO, type SourceKey } from '@/lib/houjin/kouza-data';

/**
 * 法人口座が作れない：運営会社が3行に申し込んだ実例（2026-11-16 作成）。
 * 受ける言葉（キーワードプランナー 2025/11〜2026/10 の月平均）：法人口座 作れない 140（主）・法人口座 審査 50・
 *   バーチャルオフィス 法人口座 50・法人口座 開設 できない 30・合同会社 法人口座 30・法人口座 審査 落ちた 30。
 * 上位（11/16、WebSearch）：お金の健康診断（約6,500字、2026/10/16 更新、体験なし、「審査がゆるい銀行」4選）、
 *   創業手帳（約6,000字、2024/6 更新、体験なし）、創業手帳の別記事、ドコモSMTBネット銀行、みずほ銀行、マネーフォワード。
 *   上位に欠けている点：①実際に申し込んだ結果と日付がない ②落ちた後に何をしたかがない ③申込前に点検する表がない。
 * このページは「審査がゆるい」「必ず通る」と書かない。見立ては推定と明記。
 * 出口：ラクスルバンク（A8、申込で成果）。11/16 提携申請中。承認されるまで href は空（出口は出ない）。
 * 書き方はオーナーが案1に決定（11/16）：審査はGMOあおぞらで、運営会社は直接の申込で落ちたことを正直に書いたうえで、申込先の一つとして出す。
 */
const LP_ID = 'guide-houjin-kouza-tsukurenai';
const PATH = '/guide/houjin/kouza-tsukurenai';
const TITLE = '法人口座が作れない？審査に2行落ち、通ったのは1行｜設立直後の合同会社・バーチャルオフィスの実例';
const DESCRIPTION = '設立直後・資本金50万円・本店がバーチャルオフィスの合同会社で、法人口座を3つの銀行に申し込んだ結果と日付。審査に落ちた理由の見立て、落ちたあとにしたこと、申し込む前に整える7つ。無料の申込前チェック表（エクセル・PDF）つき。';

export const metadata: Metadata = {
  title: `${TITLE} | ${SITE_NAME}`,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}${PATH}` },
  openGraph: { title: TITLE, description: DESCRIPTION, url: `${SITE_URL}${PATH}`, siteName: SITE_NAME, type: 'article', locale: 'ja_JP', images: [{ url: ogImageUrl(TITLE), width: 1200, height: 630, alt: TITLE }] },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, images: [ogImageUrl(TITLE)] },
};

const FAQS = [
  { q: '審査に落ちた理由は教えてもらえますか？', a: '私たちが落ちた2行では、どちらも理由の説明はありませんでした。ドコモSMTBネット銀行は「口座開設を見合わせ」と伝えるメールだけでした。' },
  { q: '審査の結果が出るまで何日かかりましたか？', a: '11/12に申し込んだドコモSMTBネット銀行とPayPay銀行は、4日後の11/16に結果が届きました。PayPay銀行は最短当日の開設と案内していますが、申込の内容によっては日数がかかるとしています。' },
  { q: 'バーチャルオフィスの住所では法人口座は作れませんか？', a: '私たちは、本店がバーチャルオフィスのまま、PayPay銀行で法人口座を作れました。ただ、落ちた2行にも共通していたため、審査で見られる点の一つと考えています（推定）。' },
  { q: '個人事業の口座を、会社の口座に変えられますか？', a: 'できません。個人名義の口座を会社名義に変えることはできず、会社の口座は登記が終わってから新しく作ります。' },
];

const ICONS = [Building2, CalendarDays, Coins, Mail, Briefcase, Users];
const SECTION = 'flex flex-col gap-5';
const H2 = 'text-[22px] font-black leading-snug text-slate-900';
const SRC = 'text-[11px] leading-relaxed text-slate-500';
const A = 'underline underline-offset-2';
const FILES = [
  { label: 'エクセル', href: '/downloads/houjin-kouza-check.xlsx', icon: FileSpreadsheet },
  { label: 'PDF', href: '/downloads/houjin-kouza-check.pdf', icon: FileText },
];

function src(keys: readonly SourceKey[]) {
  return keys.map((k, i) => (
    <span key={k}>{i > 0 && '・'}<a href={SOURCES[k].url} target="_blank" rel="noopener noreferrer" className={A}>{SOURCES[k].name}</a></span>
  ));
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    { '@type': 'Article', author: { '@type': 'Organization', name: 'つぎの手ナビ 編集部', url: 'https://www.tsuginotenavi.jp/policy#ayamari' }, publisher: { '@id': 'https://www.tsuginotenavi.jp/#organization' }, headline: TITLE, description: DESCRIPTION, inLanguage: 'ja', about: { '@type': 'Thing', name: '法人口座の審査' }, mentions: ['GMOあおぞらネット銀行', 'ドコモSMTBネット銀行', 'PayPay銀行'].map((name) => ({ '@type': 'BankOrCreditUnion', name })), datePublished: `${CHECKED_AT}T18:00:00+09:00`, dateModified: `${CHECKED_AT}T18:00:00+09:00`, mainEntityOfPage: `${SITE_URL}${PATH}` },
    { '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: SITE_NAME, item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: '法人成り', item: `${SITE_URL}/guide/houjin` },
      { '@type': 'ListItem', position: 3, name: '法人口座が作れない', item: `${SITE_URL}${PATH}` },
    ] },
    { '@type': 'FAQPage', mainEntity: FAQS.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) },
  ],
};

export default function Page() {
  const hasExit = !!HOUJIN_PARTNERS.raksulBank.href;
  const checked = CHECKED_AT.split('-').join('/');
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
          <Link href="/" className={A}>ホーム</Link><span className="mx-1.5">/</span>
          <Link href="/guide/houjin" className={A}>法人成り</Link><span className="mx-1.5">/</span>
          <span>法人口座が作れない</span>
        </nav>

        <section className="flex flex-col gap-5" aria-labelledby="top">
          <div className="flex flex-col gap-2">
            <p className="text-[13px] font-bold text-sky-700">運営会社の実例</p>
            <h1 id="top" className="text-[28px] font-black leading-tight text-slate-900">法人口座が作れない<br /><span className="text-[22px] text-orange-600">3行に申し込み、通ったのは1行</span></h1>
            <p className="text-[14px] text-slate-600">設立直後の合同会社で、法人口座を3つの銀行に申し込んだ結果です。</p>
          </div>
          <ul className="grid gap-2" aria-label="申し込んだ3行の結果">
            {RESULTS.map((r) => (
              <li key={r.bank} className={`flex items-center gap-3 rounded-2xl p-3.5 ring-1 ${r.ok ? 'bg-emerald-50 ring-emerald-200' : 'bg-white ring-slate-200'}`}>
                {r.ok
                  ? <CheckCircle2 size={26} className="shrink-0 text-emerald-600" aria-hidden="true" />
                  : <XCircle size={26} className="shrink-0 text-slate-400" aria-hidden="true" />}
                <span className="flex flex-1 flex-col">
                  <span className="text-[15px] font-black text-slate-900">{r.bank}</span>
                  <span className="text-[12px] text-slate-600">{r.when}</span>
                </span>
                <span className={`text-[14px] font-black ${r.ok ? 'text-emerald-700' : 'text-slate-500'}`}>{r.result}</span>
              </li>
            ))}
          </ul>
          <p className="flex items-start gap-2 text-[13px] text-slate-700"><Info size={18} className="mt-0.5 shrink-0 text-sky-700" aria-hidden="true" />落ちた2行とも、理由の説明はありませんでした。</p>
          <p className="rounded-2xl bg-white p-4 text-[14px] leading-relaxed text-slate-800 ring-1 ring-slate-200">
            <span className="mb-1 block text-[12px] font-black text-sky-700">結論</span>
            設立直後・本店がバーチャルオフィスの合同会社でも、法人口座は作れました。落ちた2行に共通していたのは、バーチャルオフィスと設立直後で実績がないこと。通った1行では、申込の入力を登記どおりにそろえていました。
          </p>
          <div className="flex flex-col gap-3 rounded-2xl border-2 border-sky-200 bg-sky-50/60 p-4">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-sky-700 ring-1 ring-sky-200"><FileSpreadsheet size={24} aria-hidden="true" /></span>
              <span className="flex flex-col">
                <span className="text-[17px] font-black text-slate-900">申込前チェック表<span className="ml-1.5 text-[12px] font-bold text-sky-700">無料</span></span>
                <span className="text-[12px] text-slate-600">7つの点検と、申込先の記録</span>
              </span>
            </div>
            <div className="flex gap-2">
              {FILES.map(({ label, href, icon: FI }) => (
                <a key={href} href={href} download className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-sky-700 px-3 py-3 text-[15px] font-bold text-white hover:bg-sky-800">
                  <FI size={18} aria-hidden="true" />{label}<Download size={16} aria-hidden="true" />
                </a>
              ))}
            </div>
            <p className="text-[11px] text-slate-500">登録やメールアドレスの入力は要りません</p>
          </div>
        </section>

        <section className={SECTION} aria-labelledby="jouken">
          <h2 id="jouken" className={H2}>申し込んだ会社の条件</h2>
          <ul className="grid grid-cols-2 gap-2">
            {JOUKEN.map((j, i) => {
              const I = ICONS[i];
              return (
                <li key={j.h} className="flex flex-col gap-1.5 rounded-2xl bg-white p-3.5 ring-1 ring-slate-200">
                  <I size={20} className="text-sky-700" aria-hidden="true" />
                  <span className="text-[14px] font-black leading-snug text-slate-900">{j.h}</span>
                  {j.s && <span className="text-[11px] text-slate-600">{j.s}</span>}
                </li>
              );
            })}
          </ul>
          <p className="text-[13px] text-slate-600">審査で不利と言われる条件が、いくつも重なった状態でした。</p>
        </section>

        <section className={SECTION} aria-labelledby="keika">
          <h2 id="keika" className={H2}>審査の経過（2026年）</h2>
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
          <p className="rounded-2xl bg-white p-3.5 text-[13px] font-bold text-slate-800 ring-1 ring-slate-200">11/12に申し込んだ2行は、4日後に結果が届きました。設立から審査に通るまで19日でした。</p>
        </section>

        <section className={SECTION} aria-labelledby="mitate">
          <div className="flex flex-wrap items-center gap-2">
            <h2 id="mitate" className={H2}>法人口座の審査に落ちた理由</h2>
            <span className="rounded bg-slate-200 px-1.5 py-0.5 text-[11px] font-bold text-slate-600">推定</span>
          </div>
          <ol className="grid gap-2.5">
            {MITATE.map((m, i) => (
              <li key={m.h} className="flex items-start gap-3 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-[15px] font-black text-orange-700">{i + 1}</span>
                <span className="flex flex-col gap-0.5">
                  <span className="text-[15px] font-black text-slate-900">{m.h}</span>
                  <span className="text-[13px] leading-relaxed text-slate-600">{m.d}</span>
                  {m.src.length > 0 && <span className={SRC}>出典：{src(m.src)}</span>}
                </span>
              </li>
            ))}
          </ol>
          <div className="flex flex-col gap-2 rounded-2xl bg-emerald-50 p-4 ring-1 ring-emerald-200">
            <p className="text-[15px] font-black text-emerald-900">PayPay銀行で違ったこと</p>
            <ul className="flex flex-col gap-1.5 text-[13px] leading-relaxed text-emerald-950">
              <li>・申し込み直しで、入力を登記どおりにそろえた</li>
              <li>・本店は同じバーチャルオフィスのまま。銀行ごとの基準の違いも大きいと見ています</li>
            </ul>
            <p className={SRC}>PayPay銀行は、申込フォームに登記の情報や本人確認書類と同じ内容を入れるよう案内しています（出典：{src(['paypayStart'])}）。</p>
            <Link href="/guide/houjin/paypay-houjin-kouza" className="flex items-center gap-1 text-[13px] font-bold text-emerald-900 underline underline-offset-2">PayPay銀行の法人口座：必要書類と経過<ArrowRight size={14} aria-hidden="true" /></Link>
          </div>
        </section>

        <section className={SECTION} aria-labelledby="ato">
          <h2 id="ato" className={H2}>法人口座が作れないとき</h2>
          <ol className="grid gap-2.5">
            {ATO.map((a, i) => (
              <li key={a.h} className="flex items-start gap-3 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-[15px] font-black text-sky-700">{i + 1}</span>
                <span className="flex flex-col gap-0.5">
                  <span className="text-[15px] font-black text-slate-900">{a.h}</span>
                  <span className="text-[13px] leading-relaxed text-slate-600">{a.d}</span>
                </span>
              </li>
            ))}
          </ol>
        </section>

        <section className={SECTION} aria-labelledby="check">
          <h2 id="check" className={H2}>法人口座を申し込む前に整える7つ</h2>
          <KouzaCheck lpId={LP_ID} />
          <p className={SRC}>郵便：PayPay銀行は、郵送物を受け取れないと口座の利用を止めると案内しています（出典：{src(['paypayStart'])}、{checked} 確認）。</p>
        </section>

        <section className={SECTION} aria-labelledby="kojin">
          <h2 id="kojin" className={H2}>個人事業から会社にする人へ</h2>
          <ul className="grid gap-2">
            {[
              { h: '個人の口座は、会社の口座にできない', d: '名義を変えることはできず、登記のあとに新しく作ります。' },
              { h: '口座ができるまでの請求を決めておく', d: '私たちは設立から法人口座の審査に通るまで19日。最初の請求の振込先を、先に考えておきます。' },
              { h: '本店の住所は口座のことも考えて', d: '自宅を出したくない人は、バーチャルオフィスでも通った銀行がある（私たちはPayPay銀行）。' },
            ].map((c) => (
              <li key={c.h} className="flex flex-col gap-0.5 rounded-2xl bg-white p-3.5 ring-1 ring-slate-200">
                <span className="text-[15px] font-black text-slate-900">{c.h}</span>
                <span className="text-[13px] leading-relaxed text-slate-600">{c.d}</span>
              </li>
            ))}
          </ul>
          <p className={SRC}>出典：{src(['mfHoujinnari'])}（{checked} 確認）</p>
        </section>

        {hasExit && (
          <section className={SECTION} aria-labelledby="exit">
            <h2 id="exit" className="sr-only">申込先</h2>
            <HoujinExit
              lpId={LP_ID} partner="raksulBank" position="bottom" lead="申込先を増やすなら"
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
        </section>

        <Link href="/guide/houjin/raksulbank" className="flex items-center gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-slate-200 hover:ring-slate-300">
          <span className="flex flex-1 flex-col"><span className="text-[15px] font-black text-slate-900">ラクスルバンクの審査と手数料</span><span className="text-[12px] text-slate-600">審査はGMOあおぞらネット銀行。申し込める会社</span></span>
          <ArrowRight size={18} className="text-sky-700" aria-hidden="true" />
        </Link>
        <Link href="/guide/houjin" className="flex items-center gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-slate-200 hover:ring-slate-300">
          <span className="flex flex-1 flex-col"><span className="text-[15px] font-black text-slate-900">法人成りのページ一覧</span><span className="text-[12px] text-slate-600">設立から口座まで、つまずいた所</span></span>
          <ArrowRight size={18} className="text-sky-700" aria-hidden="true" />
        </Link>

        <HenshuNote />
        <p className="text-[11px] leading-relaxed text-slate-400">
          体験は運営会社（BlueAdventures合同会社）が2026年10〜11月に申し込んだときのものです。審査の基準は銀行ごとに違い、同じ結果になるとは限りません。最終更新：2026年11月16日
        </p>
      </main>
      <LpFooter />
    </div>
  );
}
