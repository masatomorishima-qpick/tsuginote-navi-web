import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Info, Landmark, Search, XCircle } from 'lucide-react';
import LpHeader from '@/components/lp/LpHeader';
import LpFooter from '@/components/lp/LpFooter';
import LpViewTracker from '@/components/lp/LpViewTracker';
import { KakiteLine, KakiteNote, KAKITE_LD } from '@/components/houjin/Kakite';
import HoujinExit from '@/components/houjin/HoujinExit';
import { SITE_URL, SITE_NAME, ogImageUrl } from '@/components/loan/LoanArticle';
import { HOUJIN_PARTNERS } from '@/lib/houjin/partners';

/**
 * 法人口座の審査がゆるい銀行はある？（2026-11-27 作成。キーワードプランナー 11/27：法人口座 審査 ゆるい 90・競合性 中）。
 * 上位（11/27、Chrome）：行政書士・Wise 2・みずほ銀行・バーチャルオフィスの会社・EXIDEA・会社設立の会社・小さな金融の媒体2。
 *   上位は「作りやすい銀行」としてGMOあおぞら・ドコモSMTB・Trunk・楽天などを並べる記事が多い。みずほ銀行は「ゆるい金融機関はない」と書く。
 *   関連する質問：落ちる原因／断られる理由／審査にどのくらい時間がかかるか。
 * このページの立ち位置：「ゆるい銀行」は挙げない（一次情報で裏付けられない）。代わりに、
 *   ①「作りやすい」とよく並ぶネット銀行で、私たちは3つのうち2つ落ちた日付つきの実例
 *   ②各銀行が審査の基準や理由をどう書いているか（公式の文）
 *   ③名前が違っても審査する銀行が同じ場合がある（ラクスルバンク＝GMOあおぞら、フィンサーバンク＝北國銀行）
 *   ④銀行ごとの審査にかかる日数（公式）を並べる。
 * 実体験：houjin-plan.md「実体験の事実」だけ。落ちた理由は決めつけない。
 * 出口：ラクスルバンク（審査は GMOあおぞらネット銀行と正直に書く）。
 */
const LP_ID = 'guide-houjin-shinsa-yurui';
const PATH = '/guide/houjin/shinsa-yurui';
const CHECKED = '2026/11/27';
const TITLE = '法人口座の審査がゆるい銀行はある？作りやすいと言われる銀行で2つ落ちた実例';
const DESCRIPTION = '法人口座の審査がゆるい銀行はあるのか。確かめた銀行の公式の案内に、審査の基準や断った理由の詳しい説明はありませんでした。「作りやすい」と紹介されることがあるGMOあおぞら・ドコモSMTBを含むネット銀行3つに申し込み、私たちは2つ落ちました。銀行ごとの公式の説明と日数、名前が違っても口座を開く銀行が同じ場合があることをまとめました。';

export const metadata: Metadata = {
  title: `${TITLE} | ${SITE_NAME}`,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}${PATH}` },
  openGraph: { title: TITLE, description: DESCRIPTION, url: `${SITE_URL}${PATH}`, siteName: SITE_NAME, type: 'article', locale: 'ja_JP', images: [{ url: ogImageUrl(TITLE), width: 1200, height: 630, alt: TITLE }] },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, images: [ogImageUrl(TITLE)] },
};

const S = {
  mizuho128: { name: 'みずほ銀行「法人口座の開設審査がゆるい金融機関はある？」', url: 'https://www.mizuhobank.co.jp/corporate/account/tips/topic_128.html' },
  mizuho8644: { name: 'みずほ銀行 よくあるご質問（口座開設見送りの理由）', url: 'https://www.faq.mizuhobank.co.jp/faq/show/8644?site_domain=houjin' },
  mizuho8642: { name: 'みずほ銀行 よくあるご質問（一次審査完了後の連絡）', url: 'https://www.faq.mizuhobank.co.jp/faq/show/8642?site_domain=houjin' },
  resona: { name: 'りそな銀行「法人口座開設」', url: 'https://www.resonabank.co.jp/hojin/service/eb/webmoushikomi/' },
  resona0016: { name: 'りそな銀行 よくあるご質問（審査にかかる時間）', url: 'https://www.resonabank.co.jp/hojin/service/eb/webmoushikomi/faq/faq_hojin_kouza_0016.html' },
  mufgFaq: { name: '三菱UFJ銀行「WEB法人口座開設に関するよくあるご質問」', url: 'https://houjin-services.bk.mufg.jp/FAQList' },
  mufgFlow: { name: '三菱UFJ銀行「WEBでの法人口座のお申し込みにあたって」', url: 'https://www.bk.mufg.jp/houjin/kouza_kaisetu/flow.html' },
  rakuten: { name: '楽天銀行「法人ビジネス口座開設に関する注意事項」', url: 'https://www.rakuten-bank.co.jp/business/account/notes.html' },
  docomo2426: { name: 'ドコモSMTBネット銀行 よくあるご質問「開設ができない場合は理由を教えてもらえるのでしょうか。」', url: 'https://help.netbk.co.jp/faq_detail.html?id=2426' },
  gmoTokuyaku: { name: 'GMOあおぞらネット銀行「ラクスルバンク支店に関する特約」', url: 'https://gmo-aozora.com/provision/pdf/raksul_260816.pdf' },
  finswer: { name: 'フィンサーバンク「口座開設について」', url: 'https://finswer-bank.finswer.jp/feature/opening-account' },
  raksul1293: { name: 'ラクスルバンク よくあるご質問「口座開設の際、必要書類は何を提出すればいいですか。」', url: 'https://support.raksulbank.com/faq/show/1293?site_domain=default' },
} as const;
type K = keyof typeof S;

/** 銀行ごとの公式の書き方（審査の基準・断った理由） */
const KAKIKATA = [
  { bank: 'みずほ銀行', t: '総合的判断に基づき可否を決め、詳細には答えられない', href: '/guide/houjin/mizuho-shinsa' },
  { bank: 'りそな銀行', t: '口座開設を断る場合、理由は答えられない', href: '/guide/houjin/resona-shinsa' },
  { bank: '楽天銀行', t: '審査基準は定めているが、詳細は公開していない', href: '/guide/houjin/rakuten-shinsa' },
  { bank: 'ドコモSMTBネット銀行', t: '審査結果の詳細は開示していない', href: '/guide/houjin/docomo-smtb-shinsa' },
  { bank: '三菱UFJ銀行', t: '提出書類で内容を確認し、「ご相談内容によっては」断ることもある', href: '/guide/houjin/mufg-shinsa' },
] as const;

const NISSU = [
  { bank: 'みずほ銀行', d: '一次審査完了後の連絡は最長1週間程度' },
  { bank: 'りそな銀行', d: '審査受付から完了まで1〜2週間程度' },
  { bank: '三菱UFJ銀行', d: '申し込み登録から開設まで1か月〜1か月半' },
] as const;

const GINKO = [
  { href: '/guide/houjin/gmo-aozora-shinsa', bank: 'GMOあおぞらネット銀行', when: '11/7 申込 → 11/10 見合わせのメール', ok: false },
  { href: '/guide/houjin/docomo-smtb-shinsa', bank: 'ドコモSMTBネット銀行（旧 住信SBIネット銀行）', when: '11/12 申込 → 11/16 見合わせのメール', ok: false },
  { href: '/guide/houjin/paypay-houjin-kouza', bank: 'PayPay銀行', when: '11/12 申込 → 11/13 法人の住所に自宅を入れていたため、登記の本店と合わずに止まる → 登記どおりに申し込み直し → 11/16 通過', ok: true },
] as const;

const MINAOSHI = [
  'GMOあおぞらネット銀行：事業の中身の資料として出した明細は、2つとも個人の名義だった',
  'ドコモSMTBネット銀行：申込の社名の英字が1文字抜けていた',
  ];

const FAQS = [
  { q: '法人口座の審査がゆるい銀行はありますか？', a: '確かめた銀行の公式の案内には、審査の基準や断った理由を詳しく説明しているものはありませんでした。みずほ銀行は自社の記事で、法人口座の開設審査がゆるい金融機関はないと書いています。私たちは「作りやすい」と紹介されることがあるGMOあおぞらネット銀行・ドコモSMTBネット銀行を含む、ネット銀行3つに申し込み、2つ落ちました。' },
  { q: '法人口座の審査に落ちてしまう原因は何ですか？', a: '銀行は断った理由を答えないので、本当の原因は分かりません。私たちが落ちた2つの銀行では、後から見直すと、事業の資料が個人の名義だった・社名の英字が1文字抜けていた、という点がありました。これが原因だったかは確かめられません。別に、PayPay銀行では法人の住所に登記と違う住所を入れていたため手続きが止まり、申し込み直して通りました。' },
  { q: '法人口座の審査には、どのくらい時間がかかりますか？', a: '銀行によって違います。公式の案内では、みずほ銀行は一次審査完了後の連絡が最長1週間程度、りそな銀行は審査受付から完了まで1〜2週間程度、三菱UFJ銀行は申し込み登録から開設まで1か月〜1か月半です。私たちが通ったPayPay銀行は、最初の申込から4日で通りました（途中で1回申し込み直し）。銀行ごとに数え始めと終わりが違うので、そのまま比べることはできません。' },
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
    { '@type': 'Article', author: KAKITE_LD, publisher: { '@id': 'https://www.tsuginotenavi.jp/#organization' }, headline: TITLE, description: DESCRIPTION, inLanguage: 'ja', about: { '@type': 'Thing', name: '法人口座の審査' }, datePublished: '2026-11-27T14:00:00+09:00', dateModified: '2026-11-27T14:00:00+09:00', mainEntityOfPage: `${SITE_URL}${PATH}` },
    { '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: SITE_NAME, item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: '法人成り', item: `${SITE_URL}/guide/houjin` },
      { '@type': 'ListItem', position: 3, name: '法人口座の審査がゆるい銀行はある？', item: `${SITE_URL}${PATH}` },
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
      <LpViewTracker lpId={LP_ID} version="v1-2026-11-27" />
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
          <span>審査がゆるい銀行はある？</span>
        </nav>

        <section className="flex flex-col gap-5" aria-labelledby="top">
          <div className="flex flex-col gap-2">
            <p className="text-[13px] font-bold text-sky-700">3つの銀行に申し込んだ記録と、各銀行の公式の書き方</p>
            <h1 id="top" className="text-[26px] font-black leading-tight text-slate-900">法人口座の<br />審査がゆるい<br />銀行はある？<br /><span className="text-[19px] text-orange-600">作りやすいと言われる銀行で2つ落ちた実例</span></h1>
            <KakiteLine />
          </div>
          <ul className="grid grid-cols-3 gap-2" aria-label="要点">
            {[
              { big: '2つ', s: 'ネット銀行3つのうち落ちた数' },
              { big: '説明なし', s: '公式の案内にある、審査の基準・断った理由' },
              { big: '19日', s: '設立から審査に通るまで' },
            ].map((k) => (
              <li key={k.s} className="flex flex-col items-center gap-0.5 rounded-2xl bg-white px-2 py-3.5 text-center ring-1 ring-slate-200">
                <span className="text-[20px] font-black leading-none text-orange-600">{k.big}</span>
                <span className="text-[11px] leading-snug text-slate-600">{k.s}</span>
              </li>
            ))}
          </ul>
          <p className="rounded-2xl bg-white p-4 text-[14px] leading-relaxed text-slate-800 ring-1 ring-slate-200">
            <span className="mb-1 block text-[12px] font-black text-sky-700">結論</span>
            「審査がゆるい」と言える銀行は、公式の情報からは見つかりませんでした。確かめた銀行の公式の案内には、審査の基準や断った理由の詳しい説明はありません。私たちは「作りやすい」と紹介されることがあるGMOあおぞらネット銀行・ドコモSMTBネット銀行を含む、ネット銀行3つに申し込み、2つ落ちて、PayPay銀行だけ通りました。PayPay銀行の審査がゆるいという意味ではなく、私たちの1件の結果です。ゆるい銀行を探すより、入力を登記どおりにそろえて、2つ以上の銀行に申し込むほうが、早く口座を作れると考えています。
          </p>
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
          <div className="flex flex-col gap-2 rounded-2xl bg-slate-100 p-4">
            <span className="flex items-center gap-2 text-[14px] font-black text-slate-900"><Search size={18} className="text-slate-500" aria-hidden="true" />落ちた2つの銀行で、後から見直した点</span>
            <ul className="grid gap-1.5 pl-5">
              {MINAOSHI.map((m) => <li key={m} className="list-disc text-[13px] leading-relaxed text-slate-700">{m}</li>)}
            </ul>
            <p className="text-[12px] leading-relaxed text-slate-600">落ちた2つの銀行は、どちらも理由の説明がありませんでした。上の点が原因だったかは分かりません。PayPay銀行は落ちたのではなく、法人の住所に登記と違う住所を入れていたため手続きが止まり、申し込み直して通りました。</p>
          </div>
          <p className={SRC}>運営会社（BlueAdventures合同会社、2026年10月28日設立・本店はバーチャルオフィス）の2026年11月の記録</p>
        </section>

        <section className={SECTION} aria-labelledby="kakikata">
          <h2 id="kakikata" className={H2}>銀行ごとの公式の説明</h2>
          <div className="grid gap-2">
            {KAKIKATA.map((k) => (
              <Link key={k.bank} href={k.href} className="flex items-center gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-slate-200 hover:ring-slate-300">
                <Landmark size={20} className="shrink-0 text-sky-700" aria-hidden="true" />
                <span className="flex flex-1 flex-col gap-0.5"><span className="text-[14px] font-black text-slate-900">{k.bank}</span><span className="text-[12px] leading-relaxed text-slate-600">{k.t}</span></span>
                <ArrowRight size={18} className="shrink-0 text-sky-700" aria-hidden="true" />
              </Link>
            ))}
          </div>
          <p className="text-[13px] leading-relaxed text-slate-700">みずほ銀行は自社の記事で、法人口座の開設審査がゆるい金融機関はないと書いています。私たちが申し込んだGMOあおぞらネット銀行から届いたメールも、「当社で定めた審査基準により」口座開設を見合わせるというもので、審査の内容には答えられないとありました。</p>
          <p className={SRC}>出典：{src(['mizuho8644', 'resona', 'rakuten', 'docomo2426', 'mufgFaq', 'mizuho128'])}（{CHECKED} 確認）。GMOあおぞらネット銀行のメールは運営会社が2026年11月10日に受け取ったもの</p>
        </section>

        <section className={SECTION} aria-labelledby="onaji">
          <h2 id="onaji" className={H2}>名前が違っても、口座を開く銀行が同じことがある</h2>
          <div className="grid gap-2">
            {[
              { name: 'ラクスルバンク', bank: 'GMOあおぞらネット銀行（ラクスルバンク支店）' },
              { name: 'フィンサーバンク', bank: '北國銀行（フィンサー支店）' },
            ].map((r) => (
              <div key={r.name} className="flex items-center gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-slate-200">
                <span className="w-[112px] shrink-0 text-[14px] font-black text-slate-900">{r.name}</span>
                <ArrowRight size={16} className="shrink-0 text-slate-400" aria-hidden="true" />
                <span className="text-[13px] leading-snug text-slate-700">口座は{r.bank}</span>
              </div>
            ))}
          </div>
          <p className="text-[13px] leading-relaxed text-slate-700">ある銀行で落ちたあとに別の名前のサービスに申し込むときは、口座がどの銀行のものかを先に確かめてください。口座が同じ銀行なら、申し込む相手もその銀行です。</p>
          <p className={SRC}>出典：{src(['gmoTokuyaku', 'finswer'])}（{CHECKED} 確認）</p>
        </section>

        <section className={SECTION} aria-labelledby="nissu">
          <h2 id="nissu" className={H2}>審査にかかる日数</h2>
          <div className="grid gap-2">
            {NISSU.map((n) => (
              <div key={n.bank} className="flex items-center justify-between gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-slate-200">
                <span className="text-[14px] font-black text-slate-900">{n.bank}</span>
                <span className="text-right text-[12px] leading-snug text-slate-600">{n.d}</span>
              </div>
            ))}
            <div className="flex items-center justify-between gap-3 rounded-2xl bg-emerald-50 p-3.5 ring-1 ring-emerald-200">
              <span className="text-[14px] font-black text-slate-900">PayPay銀行（私たちの場合）</span>
              <span className="text-right text-[12px] leading-snug text-slate-600">最初の申込（11/12）から4日で通過（途中で1回申し込み直し）</span>
            </div>
          </div>
          <p className="text-[13px] leading-relaxed text-slate-700">銀行ごとに数え始めと終わりが違うので、そのまま比べることはできません。</p>
          <p className={SRC}>出典：{src(['mizuho8642', 'resona0016', 'mufgFlow'])}（{CHECKED} 確認）・運営会社の記録</p>
        </section>

        {hasExit && (
          <section className={SECTION} aria-labelledby="shinsei">
            <h2 id="shinsei" className={H2}>同時に申し込む先の候補</h2>
            <p className="flex items-start gap-2 text-[13px] leading-relaxed text-slate-700"><Info size={18} className="mt-0.5 shrink-0 text-sky-700" aria-hidden="true" /><span>私たちは1つ目で落ちた2日後に、2つの銀行へ同じ日に申し込みました。1つの銀行の結果を待ってから次に申し込むと、その分だけ口座ができるのが遅れます。</span></p>
            <HoujinExit
              lpId={LP_ID} partner="raksulBank" position="shinsei" lead="これから申し込む会社向けの候補"
              note="ラクスルバンクは、設立したばかりで取引の書類がまだない会社が出せる書類として、代表者が署名・捺印した事業計画書を挙げています（これを出せば通るとは限りません）。口座はGMOあおぞらネット銀行のラクスルバンク支店で、審査もGMOあおぞらネット銀行が行います。私たちはGMOあおぞらネット銀行に直接申し込んで落ちています。GMOあおぞらネット銀行で落ちたことがある会社は、同じ銀行の審査になると知ったうえで選んでください。"
            />
            <p className={SRC}>出典：{src(['raksul1293', 'gmoTokuyaku'])}（{CHECKED} 確認）</p>
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
          <p className={`${SRC} mt-1`}>出典：{src(['mizuho128', 'mizuho8644', 'resona', 'rakuten', 'docomo2426', 'mufgFaq', 'mizuho8642', 'resona0016', 'mufgFlow'])}（{CHECKED} 確認）・運営会社の2026年11月の記録</p>
        </section>

        <nav aria-label="あわせて読む" className="flex flex-col gap-2">
          {[
            { href: '/guide/houjin/kouza-tsukurenai', t: '法人口座が作れない', s: '3つの銀行に申し込んだ記録と、申込前のチェック表' },
            { href: '/guide/houjin/shinsa-ochita-tsugi', t: '法人口座の審査に落ちたら次は', s: '落ちたあとにすること4つ' },
            { href: '/guide/houjin/kouza-hitsuyou-shorui', t: '法人口座の必要書類', s: '銀行ごとの比較と、設立直後の事業内容の資料' },
            { href: '/guide/houjin', t: '法人口座の開設（まとめ）', s: '設立直後にネット銀行3つに申し込んだ記録' },
          ].map((l) => (
            <Link key={l.href} href={l.href} className="flex items-center gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-slate-200 hover:ring-slate-300">
              <span className="flex flex-1 flex-col"><span className="text-[15px] font-black text-slate-900">{l.t}</span><span className="text-[12px] text-slate-600">{l.s}</span></span>
              <ArrowRight size={18} className="text-sky-700" aria-hidden="true" />
            </Link>
          ))}
        </nav>

        <KakiteNote />
        <p className="text-[11px] leading-relaxed text-slate-400">
          銀行の案内は、公式の記載（{CHECKED} 確認）をもとにしています。実例は運営会社（BlueAdventures合同会社）の2026年11月の申込です。銀行は案内を変えることがあり、審査の結果は会社ごとに違います。最終更新：2026年11月27日
        </p>
      </main>
      <LpFooter />
    </div>
  );
}
