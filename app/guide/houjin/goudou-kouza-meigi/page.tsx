import type { Metadata } from 'next';
import Link from 'next/link';
import { AlertTriangle, ArrowRight, Ban, CheckCircle2, Info, MapPin, SearchCheck, Type, XCircle } from 'lucide-react';
import LpHeader from '@/components/lp/LpHeader';
import LpFooter from '@/components/lp/LpFooter';
import LpViewTracker from '@/components/lp/LpViewTracker';
import { KakiteLine, KakiteNote, KAKITE_LD } from '@/components/houjin/Kakite';
import HoujinExit from '@/components/houjin/HoujinExit';
import { SITE_URL, SITE_NAME, ogImageUrl } from '@/components/loan/LoanArticle';
import { HOUJIN_PARTNERS } from '@/lib/houjin/partners';

/**
 * 合同会社の口座名義（2026-11-26 作成。houjin-plan.md「銀行の記事への切り替え」B6。11/25 オーナー了承で追加）。
 * 受ける言葉（キーワードプランナー 11/25）：合同会社 口座名義 170。
 * 上位（11/26。Chrome につながらず WebSearch で確認）：マネーフォワード・PayPay（加盟店ヘルプ）・PayPay銀行・信用金庫・
 *   決済の会社のヘルプ、小さなサイト（全銀ポン・Acciyo・JPCC）。銀行の自社ページと大手は 9件中6件。
 *   上位が答えている疑問：合同会社の略語（ド）・前／中／後の書き方・使える文字・振込で名義が違うとき・株式会社などほかの略語。
 *   上位に欠けている点：①英字の社名の合同会社が、申込で社名の英字を1文字抜かした実例 ②住所を登記と違えて止まり、
 *   申し込み直して通った日付つきの実例 ③公式3つで略語が一致すること（上位の一部は合同会社を「ユ」とも書いているが、公式の表で「ユ」は有限会社）。
 * 一次情報（11/26 確認）：PayPay銀行「法人格の略称について」「受取人口座名義の入力方法詳細」、長岡信用金庫「受取人口座名義の入力方法」、
 *   PayPay「口座名義人カナの略語の入力ルール」。ドコモSMTBネット銀行のよくある不備は 11/25 確認。
 * 出口：ラクスルバンク（審査は GMOあおぞらネット銀行。私たちはそこで落ちたと正直に書く）。
 */
const LP_ID = 'guide-houjin-goudou-kouza-meigi';
const PATH = '/guide/houjin/goudou-kouza-meigi';
const CHECKED = '2026/11/26';
const TITLE = '合同会社の口座名義の書き方｜カナは「ド）」、申込は登記どおり';
const DESCRIPTION = '合同会社の口座名義のカナは、合同会社を「ド」と略し、社名の前なら「ド）」、後ろなら「（ド」、途中なら「（ド）」と書きます（銀行などの公式の表）。株式会社の「カ」、有限会社の「ユ」との違い、カナの名義に使える文字、振込で名義が違うとどうなるか。法人口座の申込で社名の英字が1文字抜けていた、設立直後の合同会社の実例つき。';

export const metadata: Metadata = {
  title: `${TITLE} | ${SITE_NAME}`,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}${PATH}` },
  openGraph: { title: TITLE, description: DESCRIPTION, url: `${SITE_URL}${PATH}`, siteName: SITE_NAME, type: 'article', locale: 'ja_JP', images: [{ url: ogImageUrl(TITLE), width: 1200, height: 630, alt: TITLE }] },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, images: [ogImageUrl(TITLE)] },
};

const S = {
  ppbRyaku: { name: 'PayPay銀行「法人格の略称について」', url: 'https://www.paypay-bank.co.jp/business/account/abbreviation.html' },
  ppbNyuryoku: { name: 'PayPay銀行「受取人口座名義の入力方法詳細」', url: 'https://www.paypay-bank.co.jp/how_remittance_name.html' },
  nagaoka: { name: '長岡信用金庫「受取人口座名義の入力方法」', url: 'https://www.shinkin.co.jp/nagaoka/service/netbank/02.html' },
  paypay: { name: 'PayPay 加盟店ヘルプ「口座名義人カナの略語の入力ルール」', url: 'https://paypay.ne.jp/help-merchant/b0887/' },
  fubi: { name: 'ドコモSMTBネット銀行 よくあるご質問「口座開設のよくある不備を教えてください。」', url: 'https://help.netbk.co.jp/faq_detail.html?id=5927' },
  raksul33: { name: 'ラクスルバンク よくあるご質問「口座開設の審査にはどれくらいの時間がかかりますか？」', url: 'https://support.raksulbank.com/faq/show/33?site_domain=default' },
  gmoTokuyaku: { name: 'GMOあおぞらネット銀行「ラクスルバンク支店に関する特約」', url: 'https://gmo-aozora.com/provision/pdf/raksul_260816.pdf' },
} as const;
type K = keyof typeof S;

/** 合同会社の略語の位置（PayPay銀行・長岡信用金庫・PayPay の表で同じ） */
const ICHI = [
  { pos: '社名の前', kana: 'ド）', rei: '合同会社ミナト', meigi: 'ド）ミナト' },
  { pos: '社名の後ろ', kana: '（ド', rei: 'ミナト合同会社', meigi: 'ミナト（ド' },
  { pos: '社名の途中', kana: '（ド）', rei: 'ミナト合同会社トウキョウ', meigi: 'ミナト（ド）トウキヨウ' },
];

/** ほかの会社の略語（PayPay銀行の表。社名の前に付く場合） */
const HOKA = [
  { h: '合同会社', k: 'ド）', me: true },
  { h: '株式会社', k: 'カ）', me: false },
  { h: '有限会社', k: 'ユ）', me: false },
  { h: '合名会社', k: 'メ）', me: false },
  { h: '合資会社', k: 'シ）', me: false },
  { h: '一般社団法人', k: 'シヤ）', me: false },
];

/** カナの名義の入力の決まり（PayPay銀行の振込の画面） */
const MOJI = [
  { ok: true, h: 'カタカナ', s: '小さい「ッ・ャ・ュ・ョ」は大きい「ツ・ヤ・ユ・ヨ」に変わる' },
  { ok: true, h: '英字', s: '小文字で入れても大文字になる' },
  { ok: true, h: '使える記号', s: '，．－／「」（）￥ と全角の空白' },
  { ok: false, h: '漢字', s: '使えない' },
  { ok: false, h: '中黒「・」', s: '使えない（ピリオドに置き換える）。「＆」「！」も使えない' },
  { ok: false, h: '「サマ」や会員番号', s: '口座名義のほかの文字は付けない' },
];

const GINKO = [
  { href: '/guide/houjin/gmo-aozora-shinsa', bank: 'GMOあおぞらネット銀行', when: '11/7 申込 → 11/10 見合わせのメール', ok: false },
  { href: '/guide/houjin/docomo-smtb-shinsa', bank: 'ドコモSMTBネット銀行（旧 住信SBIネット銀行）', when: '11/12 申込 → 11/16 見合わせのメール（社名の英字が1文字抜けていた）', ok: false },
  { href: '/guide/houjin/paypay-houjin-kouza', bank: 'PayPay銀行', when: '11/12 申込 → 11/13 住所の違いで止まり申し込み直し → 11/16 通過', ok: true },
] as const;

const FAQS = [
  { q: '合同会社の口座名義の略称は何ですか？', a: 'カナの口座名義では、合同会社を「ド」と略します。社名の前なら「ド）」、後ろなら「（ド」、途中なら「（ド）」です。PayPay銀行・長岡信用金庫・PayPay の公式の表で同じ書き方です。「ユ）」は有限会社の略語です。' },
  { q: '振込の受取人名が口座名義と違うと、どうなりますか？', a: '長岡信用金庫の案内では、受取人名のカナが実際の口座名義と違う場合は振込が行われないとしています。取引先に口座を伝えるときは、通帳やネットバンキングの画面に出るカナの名義をそのまま伝えます。' },
  { q: '法人口座の申込で、社名はどう入力すればいいですか？', a: '履歴事項全部証明書のとおりに、英字・記号まで1文字も違わずに入れます。ドコモSMTBネット銀行は、法人名称の記載の違いをよくある不備に挙げています。私たちはドコモSMTBネット銀行の申込で社名の英字が1文字抜けていて、結果は見合わせでした（理由は知らされていません）。' },
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
    { '@type': 'Article', author: KAKITE_LD, publisher: { '@id': 'https://www.tsuginotenavi.jp/#organization' }, headline: TITLE, description: DESCRIPTION, inLanguage: 'ja', about: { '@type': 'Thing', name: '合同会社の口座名義' }, datePublished: '2026-11-26T09:00:00+09:00', dateModified: '2026-11-26T09:00:00+09:00', mainEntityOfPage: `${SITE_URL}${PATH}` },
    { '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: SITE_NAME, item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: '法人成り', item: `${SITE_URL}/guide/houjin` },
      { '@type': 'ListItem', position: 3, name: '合同会社の口座名義', item: `${SITE_URL}${PATH}` },
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
      <LpViewTracker lpId={LP_ID} version="v1-2026-11-26" />
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
          <span>合同会社の口座名義</span>
        </nav>

        <section className="flex flex-col gap-5" aria-labelledby="top">
          <div className="flex flex-col gap-2">
            <p className="text-[13px] font-bold text-sky-700">銀行の公式の表と、運営会社の申込の実例</p>
            <h1 id="top" className="text-[26px] font-black leading-tight text-slate-900">合同会社の<br />口座名義の書き方<br /><span className="text-[19px] text-orange-600">カナは「ド）」、申込は登記どおり</span></h1>
            <KakiteLine />
          </div>
          <ul className="grid grid-cols-3 gap-2" aria-label="合同会社の略語">
            {ICHI.map((k) => (
              <li key={k.pos} className="flex flex-col items-center gap-1 rounded-2xl bg-white px-2 py-3.5 text-center ring-1 ring-slate-200">
                <span className="text-[22px] font-black leading-none text-orange-600">{k.kana}</span>
                <span className="text-[11px] leading-snug text-slate-600">{k.pos}</span>
              </li>
            ))}
          </ul>
          <p className="rounded-2xl bg-white p-4 text-[14px] leading-relaxed text-slate-800 ring-1 ring-slate-200">
            <span className="mb-1 block text-[12px] font-black text-sky-700">結論</span>
            合同会社の口座名義のカナは、合同会社を「ド」と略します。社名の前なら「ド）」、後ろなら「（ド」、途中なら「（ド）」です。法人口座の申込では、社名を登記のとおりに、英字・記号まで1文字も違えずに入れます。私たちはドコモSMTBネット銀行の申込で社名の英字が1文字抜けていて、結果は見合わせでした（理由は知らされていません）。
          </p>
          <p className={SRC}>出典：{src(['ppbRyaku', 'nagaoka', 'paypay'])}（{CHECKED} 確認）</p>
        </section>

        <section className={SECTION} aria-labelledby="ichi">
          <h2 id="ichi" className={H2}>「ド」の位置と書き方</h2>
          <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200">
            <table className="w-full table-fixed text-left text-[13px]">
              <thead className="bg-slate-50 text-[12px] text-slate-600">
                <tr><th className="w-[30%] px-3 py-2 font-bold">位置</th><th className="px-3 py-2 font-bold">登記の社名</th><th className="px-3 py-2 font-bold">カナの名義</th></tr>
              </thead>
              <tbody>
                {ICHI.map((k) => (
                  <tr key={k.pos} className="border-t border-slate-100 align-top">
                    <td className="px-3 py-2.5 font-black text-slate-900">{k.pos}</td>
                    <td className="px-3 py-2.5 text-slate-700">{k.rei}</td>
                    <td className="px-3 py-2.5 font-black text-orange-700">{k.meigi}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[12px] text-slate-500">「ミナト」「トウキョウ」は例の名前です。小さい「ョ」は、PayPay銀行の振込の画面の決まりで大きい「ヨ」にしています。</p>
          <p className="text-[13px] leading-relaxed text-slate-700">PayPay銀行は、カナの口座名義の中の法人格を略称で登録すると案内しています。公式の表では、後ろに付くときの「（ド」に閉じかっこがありません。</p>
          <p className={SRC}>出典：{src(['ppbRyaku', 'nagaoka', 'paypay'])}（{CHECKED} 確認）</p>
        </section>

        <section className={SECTION} aria-labelledby="hoka">
          <h2 id="hoka" className={H2}>ほかの会社の略語との違い</h2>
          <ul className="grid grid-cols-2 gap-2">
            {HOKA.map((h) => (
              <li key={h.h} className={`flex items-center justify-between gap-2 rounded-xl px-3.5 py-2.5 ring-1 ${h.me ? 'bg-orange-50 ring-orange-200' : 'bg-white ring-slate-200'}`}>
                <span className="text-[13px] font-bold text-slate-800">{h.h}</span>
                <span className="text-[16px] font-black text-slate-900">{h.k}</span>
              </li>
            ))}
          </ul>
          <div className="flex items-start gap-3 rounded-2xl bg-amber-50 p-4 ring-1 ring-amber-200">
            <AlertTriangle size={20} className="mt-0.5 shrink-0 text-amber-600" aria-hidden="true" />
            <span className="text-[13px] leading-relaxed text-slate-700">「ユ）」は有限会社の略語で、合同会社ではありません。株式会社を「（カブ）」と略すことは、PayPay銀行は「使えない」、長岡信用金庫は「間違い」としています。</span>
          </div>
          <p className={SRC}>出典：{src(['ppbRyaku', 'ppbNyuryoku', 'nagaoka'])}（{CHECKED} 確認）</p>
        </section>

        <section className={SECTION} aria-labelledby="moji">
          <h2 id="moji" className={H2}>カナの名義に使える文字</h2>
          <ul className="grid gap-2">
            {MOJI.map((m) => (
              <li key={m.h} className={`flex items-start gap-3 rounded-2xl p-3.5 ring-1 ${m.ok ? 'bg-white ring-slate-200' : 'bg-rose-50/60 ring-rose-200'}`}>
                {m.ok ? <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-emerald-600" aria-hidden="true" /> : <Ban size={20} className="mt-0.5 shrink-0 text-rose-600" aria-hidden="true" />}
                <span className="flex flex-col gap-0.5"><span className="text-[14px] font-black text-slate-900">{m.h}</span><span className="text-[12px] leading-relaxed text-slate-600">{m.s}</span></span>
              </li>
            ))}
          </ul>
          <p className="text-[13px] leading-relaxed text-slate-700">これは PayPay銀行の振込の画面の決まりです。使える記号などは銀行ごとに違う場合があるので、振込に使う銀行の案内も確かめます。長岡信用金庫は、受取人名のカナが実際の口座名義と違うと振込が行われないとしています。</p>
          <p className={SRC}>出典：{src(['ppbNyuryoku', 'nagaoka'])}（{CHECKED} 確認）</p>
        </section>

        <section className={SECTION} aria-labelledby="moushikomi">
          <h2 id="moushikomi" className={H2}>法人口座の申込の社名と住所</h2>
          <ul className="grid gap-2.5">
            {[
              { icon: Type, h: '社名は登記と1文字も違えない', s: '私たちの社名は英字を含みます（BlueAdventures合同会社）。ドコモSMTBネット銀行の申込で、社名の英字が1文字抜けていました。結果は見合わせです。落ちた理由かどうかは、知らされていないので分かりません。', tag: '実例' },
              { icon: MapPin, h: '住所は登記の本店どおり', s: 'PayPay銀行の申込で、法人の住所に自宅を入れて、登記の本店と違ったために手続きが止まりました。登記どおりに申し込み直して、11月16日に通りました。', tag: '実例' },
              { icon: SearchCheck, h: '公式のよくある不備', s: 'ドコモSMTBネット銀行は、入力した住所と登記上の本店所在地の違いや、法人名称・設立年月日の記載の違いを、よくある不備に挙げています。', tag: '公式' },
            ].map((m) => (
              <li key={m.h} className="flex items-start gap-3 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                <m.icon size={22} className="mt-0.5 shrink-0 text-sky-700" aria-hidden="true" />
                <span className="flex flex-col gap-1">
                  <span className="flex items-center gap-2 text-[15px] font-black text-slate-900">{m.h}<span className={`rounded px-1.5 text-[10px] font-bold ${m.tag === '実例' ? 'bg-orange-100 text-orange-700' : 'bg-sky-100 text-sky-800'}`}>{m.tag}</span></span>
                  <span className="text-[13px] leading-relaxed text-slate-600">{m.s}</span>
                </span>
              </li>
            ))}
          </ul>
          <p className="flex items-start gap-2 text-[13px] leading-relaxed text-slate-700"><Info size={18} className="mt-0.5 shrink-0 text-sky-700" aria-hidden="true" /><span>申し込む前に、履歴事項全部証明書と、入力した社名・住所・設立年月日を1文字ずつ照らし合わせます。</span></p>
          <p className={SRC}>出典：{src(['fubi'])}（2026/11/25 確認）。実例は運営会社の2026年11月の申込</p>
        </section>

        <section className={SECTION} aria-labelledby="jitsurei">
          <h2 id="jitsurei" className={H2}>私たちが申し込んだ3つの銀行</h2>
          <div className="grid gap-2">
            {GINKO.map((g) => (
              <Link key={g.href} href={g.href} className={`flex items-center gap-3 rounded-2xl p-3.5 ring-1 ${g.ok ? 'bg-emerald-50 ring-emerald-200' : 'bg-rose-50 ring-rose-200'}`}>
                {g.ok ? <CheckCircle2 size={22} className="shrink-0 text-emerald-600" aria-hidden="true" /> : <XCircle size={22} className="shrink-0 text-rose-600" aria-hidden="true" />}
                <span className="flex flex-1 flex-col gap-0.5"><span className="text-[15px] font-black text-slate-900">{g.bank}</span><span className="text-[12px] text-slate-600">{g.when}</span></span>
                <ArrowRight size={18} className="shrink-0 text-sky-700" aria-hidden="true" />
              </Link>
            ))}
          </div>
          <p className="text-[13px] leading-relaxed text-slate-700">1つ目で落ちた2日後に、2つの銀行へ同じ日に申し込みました。通ったのは11月16日、設立から19日後です。</p>
          <p className={SRC}>運営会社（BlueAdventures合同会社、2026年10月28日設立・本店はバーチャルオフィス）の2026年11月の記録</p>
          {hasExit && (
            <HoujinExit
              lpId={LP_ID} partner="raksulBank" position="jitsurei" lead="法人口座の申込先を探している合同会社の候補の1つ"
              note="ラクスルバンクの口座はGMOあおぞらネット銀行のラクスルバンク支店で、審査もGMOあおぞらネット銀行が行います。私たちはGMOあおぞらネット銀行に直接申し込んで落ちています。GMOあおぞらネット銀行で落ちたことがある会社は、同じ銀行の審査になると知ったうえで、落ちた理由として思い当たる点（書類・入力の違いなど）を直してから判断してください。"
            />
          )}
          {hasExit && <p className={SRC}>出典：{src(['raksul33', 'gmoTokuyaku'])}（2026/11/25 確認）</p>}
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
          <p className={`${SRC} mt-1`}>出典：{src(['ppbRyaku', 'nagaoka', 'paypay', 'fubi'])}</p>
        </section>

        <nav aria-label="あわせて読む" className="flex flex-col gap-2">
          {[
            { href: '/guide/houjin/kouza-tsukurenai', t: '法人口座が作れない', s: '3つの銀行に申し込んだ記録と、申込前のチェック表' },
            { href: '/guide/houjin/docomo-smtb-shinsa', t: 'ドコモSMTBネット銀行（旧住信SBIネット銀行）の審査に落ちた', s: '社名の英字が1文字抜けていた申込の記録' },
            { href: '/guide/houjin/rireki-jikou-shoumeisho', t: '履歴事項全部証明書の取り方', s: '申込の入力を照らし合わせる書類' },
            { href: '/guide/houjin', t: '法人口座の開設（まとめ）', s: '設立直後にネット銀行3つに申し込んだ記録' },
          ].map((l) => (
            <Link key={l.href} href={l.href} className="flex items-center gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-slate-200 hover:ring-slate-300">
              <span className="flex flex-1 flex-col"><span className="text-[15px] font-black text-slate-900">{l.t}</span><span className="text-[12px] text-slate-600">{l.s}</span></span>
              <ArrowRight size={18} className="shrink-0 text-sky-700" aria-hidden="true" />
            </Link>
          ))}
        </nav>

        <KakiteNote />
        <p className="text-[11px] leading-relaxed text-slate-400">
          略語と入力の決まりは、銀行などの公式の記載（{CHECKED} 確認）をもとにしています。銀行は案内を変えることがあり、登録のしかたが銀行ごとに違う場合もあります。実例は運営会社（BlueAdventures合同会社）の2026年11月の申込です。最終更新：2026年11月26日
        </p>
      </main>
      <LpFooter />
    </div>
  );
}
