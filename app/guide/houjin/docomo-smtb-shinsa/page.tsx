import type { Metadata } from 'next';
import Link from 'next/link';
import { AlertTriangle, ArrowRight, Ban, CalendarDays, Check, CheckCircle2, Clock, Info, Landmark, Mail, XCircle } from 'lucide-react';
import LpHeader from '@/components/lp/LpHeader';
import LpFooter from '@/components/lp/LpFooter';
import LpViewTracker from '@/components/lp/LpViewTracker';
import { KakiteLine, KakiteNote, KAKITE_LD } from '@/components/houjin/Kakite';
import HoujinExit from '@/components/houjin/HoujinExit';
import { SITE_URL, SITE_NAME, ogImageUrl } from '@/components/loan/LoanArticle';
import { HOUJIN_PARTNERS } from '@/lib/houjin/partners';

/**
 * ドコモSMTBネット銀行（旧住信SBIネット銀行）の法人口座、審査に落ちた実例（2026-11-25 作成。houjin-plan.md「銀行の記事への切り替え」B2）。
 * 受ける言葉（キーワードプランナー 2025/11〜2026/10 の月平均、11/25 確認）：住信SBI 法人口座 審査 落ち 140。
 * 上位（11/25 21:30、Google「住信SBI 法人口座 審査 落ちた」）：紹介サイト・銀行のコラム・税理士事務所・Wise・note・
 *   バーチャルオフィスの会社2つ・会社設立の会社・バーチャルオフィスの会社。銀行と大手は9件中2件。
 *   上位は「落ちる理由6つ」などの一般論で、実際に落ちた日付・通知・申込の入力の誤りを書いた記事はない。
 *   関連する質問・検索語：落ちてしまう原因／断られる理由／審査期間／見合わせ 理由／審査 状況。
 *   上位に欠けている点：①申込から結果までの日付（4日）と、同じ日に申し込んだ別の銀行は通ったこと
 *   ②申込の社名が登記と1文字違っていた事実を、公式の「よくある不備」と照らしたもの ③今の銀行名と旧名の関係（2026/8/3）
 * 一次情報：ドコモSMTBネット銀行 よくあるご質問 2523・5927・2427・2426・776・7605、法人のお客さまのページ（11/25 確認）。
 * 実体験：houjin-plan.md「実体験の事実」と lib/houjin/kouza-data.ts（オーナー 11/16 の引き継ぎ資料：11/12 申込、
 *   11/16「口座開設を見合わせ」のメール・理由の説明なし、申込の社名の英字が1文字抜けていた）。
 *   落ちた理由は銀行が開示しないので決めつけない。オンラインか郵送かは記録にないので書かない。
 * 出口：ラクスルバンク（審査は GMOあおぞらネット銀行で、私たちはそこでも落ちたと正直に書く）。
 */
const LP_ID = 'guide-houjin-docomo-shinsa';
const PATH = '/guide/houjin/docomo-smtb-shinsa';
const CHECKED = '2026/11/25';
const TITLE = 'ドコモSMTBネット銀行（旧住信SBIネット銀行）の法人口座、審査に落ちた｜申込から4日の実例';
const DESCRIPTION = 'ドコモSMTBネット銀行（旧住信SBIネット銀行）の法人口座の審査に、設立15日後に申し込んだ合同会社が落ちた実例。申込から4日で「口座開設を見合わせ」のメール。申込の社名は英字が1文字抜けていました。同じ日に申し込んだPayPay銀行は、住所を登記どおりに直して申し込み直し、通過。公式のよくある不備、申込の条件、審査の日数。';

export const metadata: Metadata = {
  title: `${TITLE} | ${SITE_NAME}`,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}${PATH}` },
  openGraph: { title: TITLE, description: DESCRIPTION, url: `${SITE_URL}${PATH}`, siteName: SITE_NAME, type: 'article', locale: 'ja_JP', images: [{ url: ogImageUrl(TITLE), width: 1200, height: 630, alt: TITLE }] },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, images: [ogImageUrl(TITLE)] },
};

const FAQ_URL = (id: number) => `https://help.netbk.co.jp/faq_detail.html?id=${id}`;
const S = {
  joken: { name: 'ドコモSMTBネット銀行 よくあるご質問「法人口座開設に必要な条件や書面を教えてください。」', url: FAQ_URL(2523) },
  fubi: { name: 'ドコモSMTBネット銀行 よくあるご質問「口座開設のよくある不備を教えてください。」', url: FAQ_URL(5927) },
  jikan: { name: 'ドコモSMTBネット銀行 よくあるご質問「法人口座開設の審査は、どのくらい時間がかかりますか。」', url: FAQ_URL(2427) },
  riyu: { name: 'ドコモSMTBネット銀行 よくあるご質問「開設ができない場合は理由を教えてもらえるのでしょうか。」', url: FAQ_URL(2426) },
  dekinai: { name: 'ドコモSMTBネット銀行 よくあるご質問「開設できない会社や団体はありますか？」', url: FAQ_URL(776) },
  meisho: { name: 'ドコモSMTBネット銀行 よくあるご質問（社名の変更）', url: FAQ_URL(7605) },
  hojin: { name: 'ドコモSMTBネット銀行「法人のお客さま」', url: 'https://www.netbk.co.jp/contents/hojin/' },
  raksul33: { name: 'ラクスルバンク よくあるご質問「口座開設の審査にはどれくらいの時間がかかりますか？」', url: 'https://support.raksulbank.com/faq/show/33?site_domain=default' },
  gmoTokuyaku: { name: 'GMOあおぞらネット銀行「ラクスルバンク支店に関する特約」', url: 'https://gmo-aozora.com/provision/pdf/raksul_260816.pdf' },
} as const;
type K = keyof typeof S;

const KIROKU = [
  { d: '10/28', t: '合同会社を設立（本店はバーチャルオフィス）', ok: null },
  { d: '11/7', t: 'GMOあおぞらネット銀行に申込 → 11/10 に通らず', ok: false },
  { d: '11/12', t: 'ドコモSMTBネット銀行と PayPay銀行に、同じ日に申込', ok: null },
  { d: '11/13', t: 'PayPay銀行は、入力した住所が登記の本店と違い手続きが止まる → 登記どおりに申し込み直し', ok: null },
  { d: '11/16', t: 'ドコモSMTBネット銀行から「口座開設を見合わせ」のメール。理由の説明なし', ok: false },
  { d: '11/16', t: 'PayPay銀行の審査に通過（設立から19日）', ok: true },
] as const;

/** 公式の「よくある不備」（5927）。mine は私たちの申込で当てはまったもの */
const FUBI = [
  { h: '法人名称の記載の違い', mine: '社名の英字が1文字抜けていた' },
  { h: '入力した住所と、登記の本店の所在地が違う', mine: '' },
  { h: '名前・法人名・住所の漢字とカナが合わない', mine: '' },
  { h: '法人番号の違い', mine: '' },
  { h: '設立年月日の違い', mine: '' },
  { h: '（オンライン）運転免許証の情報と、入力した内容が合わない', mine: '' },
  { h: '（オンライン）運転免許証の有効期限切れ', mine: '' },
  { h: '（郵送）必要書類の同封漏れ', mine: '' },
  { h: '（郵送）書類の期限切れ', mine: '' },
  { h: '（郵送）本人確認書類のコピーが不鮮明', mine: '' },
  { h: '（郵送）運転免許証の裏面のコピーの同封漏れ', mine: '' },
];

/** 申込の条件（2523）。online / yuso に当てはまるか */
const JOKEN = [
  { h: '日本国内で登記している', online: true, yuso: true },
  { h: '法人の居住地国（税を納める国）が日本', online: true, yuso: true },
  { h: '代表者が有効な運転免許証を持っている', online: true, yuso: false },
  { h: '担当者の届出が不要な申込である', online: true, yuso: false },
  { h: '実質的支配者が5人以下で、居住地国は日本だけ', online: true, yuso: false },
  { h: 'アプリで初期設定とスマート認証NEOの登録をする', online: true, yuso: false },
  { h: '口座開設に必要な書面を用意する', online: false, yuso: true },
  { h: '審査の結果、銀行が口座開設を認める', online: true, yuso: true },
];

const DEKINAI = ['登記していない団体の名義', '屋号などを使った名義', '外国法人', '有限責任事業組合・マンション管理組合などの任意団体（登記していても不可）'];

const FAQS = [
  { q: 'ドコモSMTBネット銀行は、審査に落ちた理由を教えてくれますか？', a: '教えてもらえません。公式のよくあるご質問で、口座開設の審査結果の詳細は開示していないとしています。私たちに届いたメールも「口座開設を見合わせ」というもので、理由の説明はありませんでした。' },
  { q: 'ドコモSMTBネット銀行の法人口座の審査は、何日かかりますか？', a: '公式では、オンラインの申込は本人確認書類などのアップロードが終わってから最短翌日、郵送の申込は書類が届いてから2〜3週間ほどとしています。私たちは11月12日（木）に申し込み、土日を挟んで11月16日（月）に結果のメールが届きました。' },
  { q: '住信SBIネット銀行とドコモSMTBネット銀行は同じ銀行ですか？', a: '同じ銀行です。公式のよくあるご質問で、2026年8月3日（月）に株式会社ドコモSMTBネット銀行になったとしています。' },
  { q: '本店がバーチャルオフィスだと、審査に落ちますか？', a: '分かりません。私たちの本店はバーチャルオフィスで、ドコモSMTBネット銀行には通りませんでした。同じ日に申し込んだ PayPay銀行は、住所を直して申し込み直したあと、通りました。銀行は審査の理由を開示しないため、バーチャルオフィスが理由だったかは確かめられません。' },
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

function Maru({ ok }: { ok: boolean }) {
  return ok
    ? <Check size={18} className="mx-auto text-sky-700" aria-label="当てはまる" />
    : <span className="block text-center text-slate-300" aria-label="当てはまらない">－</span>;
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    { '@type': 'Article', author: KAKITE_LD, publisher: { '@id': 'https://www.tsuginotenavi.jp/#organization' }, headline: TITLE, description: DESCRIPTION, inLanguage: 'ja', about: { '@type': 'Thing', name: 'ドコモSMTBネット銀行（旧住信SBIネット銀行）の法人口座の審査' }, mentions: [{ '@type': 'BankOrCreditUnion', name: 'ドコモSMTBネット銀行', alternateName: '住信SBIネット銀行' }, { '@type': 'BankOrCreditUnion', name: 'PayPay銀行' }], datePublished: '2026-11-25T23:00:00+09:00', dateModified: '2026-11-25T23:00:00+09:00', mainEntityOfPage: `${SITE_URL}${PATH}` },
    { '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: SITE_NAME, item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: '法人成り', item: `${SITE_URL}/guide/houjin` },
      { '@type': 'ListItem', position: 3, name: 'ドコモSMTBネット銀行の法人口座の審査', item: `${SITE_URL}${PATH}` },
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
      <LpViewTracker lpId={LP_ID} version="v1-2026-11-25" />
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
          <span>ドコモSMTBネット銀行の審査</span>
        </nav>

        <section className="flex flex-col gap-5" aria-labelledby="top">
          <div className="flex flex-col gap-2">
            <p className="text-[13px] font-bold text-sky-700">運営会社の実例</p>
            <h1 id="top" className="text-[26px] font-black leading-tight text-slate-900">ドコモSMTBネット銀行の<br />法人口座、審査に落ちた<br /><span className="text-[17px] text-slate-600">（旧住信SBIネット銀行）</span><br /><span className="text-[19px] text-orange-600">申込から4日で見合わせのメール</span></h1>
            <KakiteLine />
          </div>
          <ul className="grid grid-cols-3 gap-2" aria-label="実例の数字">
            {[
              { big: '15日後', s: '設立から申込まで' },
              { big: '4日', s: '申込から結果まで' },
              { big: '1文字', s: '社名の英字の抜け' },
            ].map((k) => (
              <li key={k.s} className="flex flex-col items-center gap-0.5 rounded-2xl bg-white px-2 py-3.5 text-center ring-1 ring-slate-200">
                <span className="text-[24px] font-black leading-none text-orange-600">{k.big}</span>
                <span className="text-[11px] leading-snug text-slate-600">{k.s}</span>
              </li>
            ))}
          </ul>
          <p className="rounded-2xl bg-white p-4 text-[14px] leading-relaxed text-slate-800 ring-1 ring-slate-200">
            <span className="mb-1 block text-[12px] font-black text-sky-700">結論</span>
            落ちた理由は、銀行が開示しないので分かりません。分かっているのは、申込の社名の英字が1文字抜けていたことです。公式は、法人名称の記載の違いを、よくある不備に挙げています。同じ日に申し込んだ PayPay銀行は、住所を直して申し込み直したあと、通りました。申し込む前に、社名と住所を登記と1文字ずつ照らし合わせてください。私たちが学んだことです。
          </p>
          <p className="flex items-start gap-2 text-[12px] leading-relaxed text-slate-600"><Info size={16} className="mt-0.5 shrink-0 text-sky-700" aria-hidden="true" /><span>住信SBIネット銀行は、2026年8月3日（月）にドコモSMTBネット銀行になりました（{src(['meisho'])}）。</span></p>
        </section>

        <section className={SECTION} aria-labelledby="kiroku">
          <h2 id="kiroku" className={H2}>申込から結果まで</h2>
          <ol className="flex flex-col gap-2">
            {KIROKU.map((k) => (
              <li key={`${k.d}-${k.t}`} className={`flex items-start gap-3 rounded-2xl p-3.5 ring-1 ${k.ok === false ? 'bg-rose-50 ring-rose-200' : k.ok ? 'bg-emerald-50 ring-emerald-200' : 'bg-white ring-slate-200'}`}>
                <span className="w-[48px] shrink-0 text-[14px] font-black text-sky-700">{k.d}</span>
                {k.ok === false ? <XCircle size={18} className="mt-0.5 shrink-0 text-rose-600" aria-hidden="true" /> : k.ok ? <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-600" aria-hidden="true" /> : <CalendarDays size={18} className="mt-0.5 shrink-0 text-slate-400" aria-hidden="true" />}
                <span className="text-[13px] leading-relaxed text-slate-700">{k.t}</span>
              </li>
            ))}
          </ol>
          <div className="flex items-start gap-3 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
            <Mail size={20} className="mt-0.5 shrink-0 text-sky-700" aria-hidden="true" />
            <span className="flex flex-col gap-1">
              <span className="text-[12px] font-bold text-slate-500">届いた結果</span>
              <span className="text-[13px] leading-relaxed text-slate-700">メールで「口座開設を見合わせ」。理由の説明はありませんでした。</span>
            </span>
          </div>
          <p className={SRC}>運営会社（BlueAdventures合同会社）の2026年11月の記録</p>
        </section>

        <section className={SECTION} aria-labelledby="fubi">
          <h2 id="fubi" className={H2}>よくある不備と私たちの申込</h2>
          <p className="text-[13px] leading-relaxed text-slate-700">公式が「よくある不備」として挙げているものです。私たちの申込では、社名に誤りがありました。ほかの項目が登記どおりだったかは、記録に残っていません。</p>
          <ul className="grid gap-1.5">
            {FUBI.map((f) => (
              <li key={f.h} className={`flex items-start gap-3 rounded-xl px-3.5 py-2.5 ring-1 ${f.mine ? 'bg-rose-50 ring-rose-200' : 'bg-white ring-slate-200'}`}>
                {f.mine ? <AlertTriangle size={18} className="mt-0.5 shrink-0 text-rose-600" aria-hidden="true" /> : <span className="mt-0.5 w-[18px] shrink-0 text-center text-slate-400" aria-hidden="true">・</span>}
                <span className="flex flex-col gap-0.5">
                  <span className="text-[13px] leading-relaxed text-slate-800">{f.h}</span>
                  {f.mine && <span className="text-[12px] font-bold text-rose-700">私たち：{f.mine}</span>}
                </span>
              </li>
            ))}
          </ul>
          <p className="flex items-start gap-2 text-[13px] leading-relaxed text-slate-700"><Info size={18} className="mt-0.5 shrink-0 text-sky-700" aria-hidden="true" />この誤りが見合わせの理由だったかは分かりません。なお、同じ日に申し込んだ PayPay銀行では、法人の住所に自宅を入れていて登記の本店と違い、手続きが一度止まりました。登記どおりに入れ直して通っています。</p>
          <p className={SRC}>出典：{src(['fubi'])}（{CHECKED} 確認）</p>
        </section>

        <section className={SECTION} aria-labelledby="joken">
          <h2 id="joken" className={H2}>申込の条件</h2>
          <p className="text-[13px] leading-relaxed text-slate-700">公式の案内では、オンラインの申込の必要書類は運転免許証だけです。</p>
          <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200">
            <table className="w-full text-[13px]">
              <thead className="bg-slate-50 text-[12px] text-slate-500">
                <tr><th className="px-3 py-2 text-left font-bold">条件</th><th className="w-[76px] whitespace-nowrap px-1 py-2 font-bold">オンライン</th><th className="w-[52px] px-1 py-2 font-bold">郵送</th></tr>
              </thead>
              <tbody>
                {JOKEN.map((j) => (
                  <tr key={j.h} className="border-t border-slate-100">
                    <td className="px-3 py-2.5 leading-relaxed text-slate-800">{j.h}</td>
                    <td className="px-1 py-2.5"><Maru ok={j.online} /></td>
                    <td className="px-1 py-2.5"><Maru ok={j.yuso} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-col gap-2 rounded-2xl bg-slate-100 p-4">
            <span className="flex items-center gap-2 text-[14px] font-black text-slate-900"><Ban size={18} className="text-slate-500" aria-hidden="true" />口座を開けない名義</span>
            <ul className="flex flex-wrap gap-1.5">
              {DEKINAI.map((d) => <li key={d} className="rounded-full bg-white px-3 py-1 text-[12px] text-slate-700 ring-1 ring-slate-200">{d}</li>)}
            </ul>
          </div>
          <p className={SRC}>出典：{src(['joken', 'hojin', 'dekinai'])}（{CHECKED} 確認）</p>
        </section>

        <section className={SECTION} aria-labelledby="nissu">
          <h2 id="nissu" className={H2}>審査の日数</h2>
          <ul className="grid gap-2">
            {[
              { h: 'オンラインの申込（本人確認書類などのアップロード完了から）', s: '最短翌日' },
              { h: '郵送の申込（書類が届いてから）', s: '2〜3週間ほど' },
              { h: '私たちの場合（11/12 木曜に申込）', s: '土日を挟んで4日' },
            ].map((n) => (
              <li key={n.h} className="flex items-center gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-slate-200">
                <Clock size={20} className="shrink-0 text-sky-700" aria-hidden="true" />
                <span className="flex-1 text-[13px] text-slate-700">{n.h}</span>
                <span className="shrink-0 text-[15px] font-black text-slate-900">{n.s}</span>
              </li>
            ))}
          </ul>
          <p className={SRC}>出典：{src(['jikan'])}（{CHECKED} 確認）</p>
        </section>

        <section className={SECTION} aria-labelledby="tsugi">
          <h2 id="tsugi" className={H2}>落ちたあと</h2>
          <p className="text-[13px] leading-relaxed text-slate-700">同時に申し込んでいた PayPay銀行が、同じ11月16日に通りました。設立から19日です。</p>
          <div className="grid gap-2">
            <Link href="/guide/houjin/paypay-houjin-kouza" className="flex items-center gap-3 rounded-2xl border-2 border-sky-200 bg-sky-50/60 p-3.5 hover:border-sky-300">
              <Landmark size={22} className="shrink-0 text-sky-700" aria-hidden="true" />
              <span className="flex flex-1 flex-col"><span className="text-[15px] font-black text-slate-900">PayPay銀行の法人口座</span><span className="text-[12px] text-slate-600">設立直後でも審査に通った実例</span></span>
              <ArrowRight size={18} className="text-sky-700" aria-hidden="true" />
            </Link>
            <Link href="/guide/houjin/gmo-aozora-shinsa" className="flex items-center gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-slate-200 hover:ring-slate-300">
              <XCircle size={22} className="shrink-0 text-sky-700" aria-hidden="true" />
              <span className="flex flex-1 flex-col"><span className="text-[15px] font-black text-slate-900">GMOあおぞらネット銀行の審査に落ちた</span><span className="text-[12px] text-slate-600">申込から3日で結果。出した書類と公式の案内</span></span>
              <ArrowRight size={18} className="text-sky-700" aria-hidden="true" />
            </Link>
          </div>
          {hasExit && (
            <HoujinExit
              lpId={LP_ID} partner="raksulBank" position="tsugi" lead="次の申込先の一つに"
              note="ラクスルバンクの口座はGMOあおぞらネット銀行のラクスルバンク支店で、審査もGMOあおぞらネット銀行が行います。私たちはGMOあおぞらネット銀行に直接申し込んで落ちています。GMOあおぞらネット銀行で落ちたことがある会社は、同じ銀行の審査になると知ったうえで選んでください。"
            />
          )}
          {hasExit && <p className={SRC}>出典：{src(['raksul33', 'gmoTokuyaku'])}</p>}
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
          <p className={`${SRC} mt-1`}>出典：{src(['riyu', 'jikan', 'meisho'])}（{CHECKED} 確認）</p>
        </section>

        <nav aria-label="あわせて読む" className="flex flex-col gap-2">
          {[
            { href: '/guide/houjin', t: '法人口座の開設（まとめ）', s: '設立直後にネット銀行3つに申し込んだ記録' },
            { href: '/guide/houjin/kouza-tsukurenai', t: '法人口座が作れない', s: '3つの銀行に申し込んだ記録と、申込前のチェック表' },
            { href: '/guide/houjin/kouza-virtual-office', t: '法人口座とバーチャルオフィス', s: '3つの銀行に申し込み、通ったのは1つ' },
          ].map((l) => (
            <Link key={l.href} href={l.href} className="flex items-center gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-slate-200 hover:ring-slate-300">
              <span className="flex flex-1 flex-col"><span className="text-[15px] font-black text-slate-900">{l.t}</span><span className="text-[12px] text-slate-600">{l.s}</span></span>
              <ArrowRight size={18} className="text-sky-700" aria-hidden="true" />
            </Link>
          ))}
        </nav>

        <KakiteNote />
        <p className="text-[11px] leading-relaxed text-slate-400">
          申込の条件と審査の案内は、ドコモSMTBネット銀行の公式の記載（{CHECKED} 確認）をもとにしています。銀行は案内を変えることがあり、審査の結果は会社ごとに違います。落ちた理由は銀行が開示しないため、このページは理由を決めつけていません。実例は運営会社（BlueAdventures合同会社）の2026年11月の申込です。最終更新：2026年11月25日
        </p>
      </main>
      <LpFooter />
    </div>
  );
}
