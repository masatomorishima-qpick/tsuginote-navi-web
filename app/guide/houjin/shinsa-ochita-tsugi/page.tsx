import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, FileText, HelpCircle, Landmark, Layers, SearchCheck, XCircle } from 'lucide-react';
import LpHeader from '@/components/lp/LpHeader';
import LpFooter from '@/components/lp/LpFooter';
import LpViewTracker from '@/components/lp/LpViewTracker';
import { KakiteLine, KakiteNote, KAKITE_LD } from '@/components/houjin/Kakite';
import HoujinExit from '@/components/houjin/HoujinExit';
import { SITE_URL, SITE_NAME, ogImageUrl } from '@/components/loan/LoanArticle';
import { HOUJIN_PARTNERS } from '@/lib/houjin/partners';

/**
 * 法人口座の審査に落ちたら次は（2026-11-25 作成。houjin-plan.md「銀行の記事への切り替え」B3）。
 * 受ける言葉（キーワードプランナー 11/25）：法人口座 審査落ち 30・落ちた 30・理由 20。銀行名の記事（B1・B2）と PayPay の記事への入口。
 * 上位（11/25、Google「法人口座 審査 落ちた 次」）：Wise・GMO のコラムのほかは、会社設立の会社・税理士事務所・コンサル・note・知恵袋。
 *   どれも「断られる理由」の一般論。関連する質問：落ちたらどうすればいい／断られる理由／再申し込み／作れないとどうなる。
 *   上位に欠けている点：①実際に2つの銀行で落ち、1つで通った日付つきの記録と銀行ごとの記事 ②落ちた理由が開示されないことを銀行3つの公式で確かめたもの
 *   ③申込の入力の誤り（社名の1文字・住所）という、書類以前の確認点の実例
 * 一次情報（11/25 確認）：GMOあおぞら よくある質問 1219・「事業内容確認書類について」、ドコモSMTB よくあるご質問 2426・5927、
 *   ラクスルバンク よくあるご質問 54・1293・33。
 * 実体験：houjin-plan.md「実体験の事実」と lib/houjin/kouza-data.ts（オーナー 11/16 の引き継ぎ資料）。
 * 出口：ラクスルバンク（審査は GMOあおぞらネット銀行。GMO で落ちた会社には同じ審査と正直に書く）。
 */
const LP_ID = 'guide-houjin-shinsa-ochita';
const PATH = '/guide/houjin/shinsa-ochita-tsugi';
const CHECKED = '2026/11/25';
const TITLE = '法人口座の審査に落ちたら次は？3つの銀行に申し込んで1つ通った実例';
const DESCRIPTION = '法人口座の審査に落ちたら、次は何をするか。設立直後の合同会社が3つの銀行に申し込み、2つで落ちて1つで通った日付つきの記録。落ちた理由は銀行が開示しないこと（3つの銀行の公式の記載）、申込の入力を登記と照らすこと、事業の中身が分かる書類、別の銀行に同時に申し込むこと。';

export const metadata: Metadata = {
  title: `${TITLE} | ${SITE_NAME}`,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}${PATH}` },
  openGraph: { title: TITLE, description: DESCRIPTION, url: `${SITE_URL}${PATH}`, siteName: SITE_NAME, type: 'article', locale: 'ja_JP', images: [{ url: ogImageUrl(TITLE), width: 1200, height: 630, alt: TITLE }] },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, images: [ogImageUrl(TITLE)] },
};

const S = {
  gmo1219: { name: 'GMOあおぞらネット銀行 よくある質問「法人口座を開設したいのですが、開設できない場合はありますか？」', url: 'https://help.gmo-aozora.com/faqs/1219' },
  gmoShorui: { name: 'GMOあおぞらネット銀行「事業内容確認書類について」', url: 'https://gmo-aozora.com/business/account/identification-companyprofile.html' },
  docomo2426: { name: 'ドコモSMTBネット銀行 よくあるご質問「法人口座開設審査の結果、開設ができない場合は理由を教えてもらえるのでしょうか。」', url: 'https://help.netbk.co.jp/faq_detail.html?id=2426' },
  docomo5927: { name: 'ドコモSMTBネット銀行 よくあるご質問「口座開設のよくある不備を教えてください。」', url: 'https://help.netbk.co.jp/faq_detail.html?id=5927' },
  raksul54: { name: 'ラクスルバンク よくあるご質問「口座開設の審査基準や、申込が却下される主な理由は何ですか？」', url: 'https://support.raksulbank.com/faq/show/54?site_domain=default' },
  raksul1293: { name: 'ラクスルバンク よくあるご質問「口座開設の際、必要書類は何を提出すればいいですか。」', url: 'https://support.raksulbank.com/faq/show/1293?site_domain=default' },
  raksul33: { name: 'ラクスルバンク よくあるご質問「口座開設の審査にはどれくらいの時間がかかりますか？」', url: 'https://support.raksulbank.com/faq/show/33?site_domain=default' },
  gmoTokuyaku: { name: 'GMOあおぞらネット銀行「ラクスルバンク支店に関する特約」', url: 'https://gmo-aozora.com/provision/pdf/raksul_260816.pdf' },
} as const;
type K = keyof typeof S;

/** 申し込んだ3つの銀行（運営会社の実例） */
const GINKO = [
  { href: '/guide/houjin/gmo-aozora-shinsa', bank: 'GMOあおぞらネット銀行', when: '11/7 申込 → 11/10 見合わせのメール', ok: false, s: '理由の説明なし（出した書類は記事に）' },
  { href: '/guide/houjin/docomo-smtb-shinsa', bank: 'ドコモSMTBネット銀行（旧 住信SBIネット銀行）', when: '11/12 申込 → 11/16 見合わせのメール', ok: false, s: '理由の説明なし（申込の社名の英字が1文字抜けていた）' },
  { href: '/guide/houjin/paypay-houjin-kouza', bank: 'PayPay銀行', when: '11/12 申込 → 11/13 止まる → 11/16 通過', ok: true, s: '住所が登記と違って止まり、申し込み直した' },
] as const;

/** 落ちた理由を教えてくれるか（公式） */
const KAIJI = [
  { bank: 'GMOあおぞらネット銀行', src: 'gmo1219' as K },
  { bank: 'ドコモSMTBネット銀行', src: 'docomo2426' as K },
  { bank: 'ラクスルバンク', src: 'raksul54' as K },
];

const FAQS = [
  { q: '法人口座の審査に落ちた理由は、教えてもらえますか？', a: '確かめた3つの銀行は、教えないとしています。GMOあおぞらネット銀行・ドコモSMTBネット銀行・ラクスルバンクは、どれも公式のよくある質問で、口座開設の審査結果の詳細は開示していないとしています。私たちに届いた2通の見合わせのメールにも、理由は書かれていませんでした。' },
  { q: '法人口座の審査に落ちたら、次は何をすればいいですか？', a: '私たちは、1つ目の銀行で落ちた2日後に、別の2つの銀行へ同じ日に申し込み、1つが通りました。申し込む前に、社名・住所・設立年月日などの入力を登記と照らし合わせ、事業の中身が分かる書類をそろえておくのがおすすめです。' },
  { q: '同じ銀行に、もう一度申し込めますか？', a: '申し込める時期や条件は、銀行に確かめてください。私たちは、落ちた銀行にもう一度申し込まず、別の銀行に申し込みました。' },
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
    { '@type': 'Article', author: KAKITE_LD, publisher: { '@id': 'https://www.tsuginotenavi.jp/#organization' }, headline: TITLE, description: DESCRIPTION, inLanguage: 'ja', about: { '@type': 'Thing', name: '法人口座の審査に落ちたとき' }, mentions: ['GMOあおぞらネット銀行', 'ドコモSMTBネット銀行', 'PayPay銀行'].map((name) => ({ '@type': 'BankOrCreditUnion', name })), datePublished: '2026-11-25T20:00:00+09:00', dateModified: '2026-11-25T20:00:00+09:00', mainEntityOfPage: `${SITE_URL}${PATH}` },
    { '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: SITE_NAME, item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: '法人成り', item: `${SITE_URL}/guide/houjin` },
      { '@type': 'ListItem', position: 3, name: '法人口座の審査に落ちたら', item: `${SITE_URL}${PATH}` },
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
          <span>審査に落ちたら</span>
        </nav>

        <section className="flex flex-col gap-5" aria-labelledby="top">
          <div className="flex flex-col gap-2">
            <p className="text-[13px] font-bold text-sky-700">運営会社の実例</p>
            <h1 id="top" className="text-[26px] font-black leading-tight text-slate-900">法人口座の審査に<br />落ちたら次は<br /><span className="text-[19px] text-orange-600">3つの銀行に申し込み、通ったのは1つ</span></h1>
            <KakiteLine />
          </div>
          <ul className="grid grid-cols-3 gap-2" aria-label="実例の数字">
            {[
              { big: '2つ', s: '審査に落ちた銀行' },
              { big: '2日後', s: '落ちてから次の申込まで' },
              { big: '19日', s: '設立から審査に通るまで' },
            ].map((k) => (
              <li key={k.s} className="flex flex-col items-center gap-0.5 rounded-2xl bg-white px-2 py-3.5 text-center ring-1 ring-slate-200">
                <span className="text-[24px] font-black leading-none text-orange-600">{k.big}</span>
                <span className="text-[11px] leading-snug text-slate-600">{k.s}</span>
              </li>
            ))}
          </ul>
          <p className="rounded-2xl bg-white p-4 text-[14px] leading-relaxed text-slate-800 ring-1 ring-slate-200">
            <span className="mb-1 block text-[12px] font-black text-sky-700">結論</span>
            落ちた理由は、銀行は教えてくれません（確かめた3つの銀行とも公式に明記）。待っても理由は分からないので、入力と書類を見直して、別の銀行に申し込みます。私たちは1つ目で落ちた2日後に、2つの銀行へ同じ日に申し込み、1つが通りました。
          </p>
        </section>

        <section className={SECTION} aria-labelledby="ginko">
          <h2 id="ginko" className={H2}>申し込んだ3つの銀行</h2>
          <div className="grid gap-2">
            {GINKO.map((g) => (
              <Link key={g.href} href={g.href} className={`flex items-center gap-3 rounded-2xl p-3.5 ring-1 ${g.ok ? 'bg-emerald-50 ring-emerald-200' : 'bg-rose-50 ring-rose-200'}`}>
                {g.ok ? <CheckCircle2 size={22} className="shrink-0 text-emerald-600" aria-hidden="true" /> : <XCircle size={22} className="shrink-0 text-rose-600" aria-hidden="true" />}
                <span className="flex flex-1 flex-col gap-0.5">
                  <span className="text-[15px] font-black text-slate-900">{g.bank}</span>
                  <span className="text-[12px] text-slate-600">{g.when}</span>
                  <span className="text-[12px] text-slate-600">{g.s}</span>
                </span>
                <ArrowRight size={18} className="shrink-0 text-sky-700" aria-hidden="true" />
              </Link>
            ))}
          </div>
          <p className={SRC}>運営会社（BlueAdventures合同会社、2026年10月28日設立・本店はバーチャルオフィス）の2026年11月の記録</p>
        </section>

        <section className={SECTION} aria-labelledby="kaiji">
          <h2 id="kaiji" className={H2}>落ちた理由の開示</h2>
          <ul className="grid gap-1.5">
            {KAIJI.map((k) => (
              <li key={k.bank} className="flex items-center gap-3 rounded-xl bg-white px-3.5 py-3 ring-1 ring-slate-200">
                <Landmark size={18} className="shrink-0 text-slate-400" aria-hidden="true" />
                <span className="flex-1 text-[13px] text-slate-800">{k.bank}</span>
                <span className="text-[14px] font-black text-slate-900">開示しない</span>
              </li>
            ))}
          </ul>
          <p className="text-[13px] leading-relaxed text-slate-700">どれも公式のよくある質問で「口座開設の審査結果の詳細は、開示しておりません。」としています。理由を推し量るより、銀行が公式に挙げている「よくある不備」に照らすほうが確かです。</p>
          <p className={SRC}>出典：{src(['gmo1219', 'docomo2426', 'raksul54'])}（{CHECKED} 確認）</p>
        </section>

        <section className={SECTION} aria-labelledby="tsugi">
          <h2 id="tsugi" className={H2}>落ちたあとにすること</h2>
          <ol className="grid gap-2.5">
            <li className="flex items-start gap-3 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
              <SearchCheck size={22} className="mt-0.5 shrink-0 text-sky-700" aria-hidden="true" />
              <span className="flex flex-col gap-1">
                <span className="text-[15px] font-black text-slate-900">1. 申込の入力を登記と照らす</span>
                <span className="text-[13px] leading-relaxed text-slate-600">ドコモSMTBネット銀行は、入力した住所と登記上の本店所在地の違いや、法人名称・設立年月日の記載の違いを、よくある不備に挙げています。私たちは、ドコモSMTBネット銀行の申込で社名の英字が1文字抜けていました（落ちた理由かどうかは分かりません）。PayPay銀行では法人の住所に自宅を入れて手続きが止まり、登記どおりに入れ直して通りました。</span>
              </span>
            </li>
            <li className="flex items-start gap-3 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
              <FileText size={22} className="mt-0.5 shrink-0 text-sky-700" aria-hidden="true" />
              <span className="flex flex-col gap-1">
                <span className="text-[15px] font-black text-slate-900">2. 事業の中身が分かる書類をそろえる</span>
                <span className="text-[13px] leading-relaxed text-slate-600">GMOあおぞらネット銀行は、履歴事項全部証明書や定款を、事業内容の書類としては受け付けないとしています。ラクスルバンクは、設立直後の補う書類として、代表者の署名・捺印がある事業計画書を挙げています。</span>
              </span>
            </li>
            <li className="flex items-start gap-3 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
              <Layers size={22} className="mt-0.5 shrink-0 text-sky-700" aria-hidden="true" />
              <span className="flex flex-col gap-1">
                <span className="text-[15px] font-black text-slate-900">3. 別の銀行に、同じ日に申し込む</span>
                <span className="text-[13px] leading-relaxed text-slate-600">私たちは、1つ目の結果の2日後に、2つの銀行へ同じ日に申し込みました。1つは落ち、1つは通りました。通ったのは11月16日、設立から19日後です。</span>
              </span>
            </li>
            <li className="flex items-start gap-3 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
              <HelpCircle size={22} className="mt-0.5 shrink-0 text-sky-700" aria-hidden="true" />
              <span className="flex flex-col gap-1">
                <span className="text-[15px] font-black text-slate-900">4. 同じ銀行にもう一度申し込むとき</span>
                <span className="text-[13px] leading-relaxed text-slate-600">申し込める時期や条件は、申し込む銀行に確かめてください。私たちは、落ちた銀行にもう一度は申し込んでいません。</span>
              </span>
            </li>
          </ol>
          <p className={SRC}>出典：{src(['docomo5927', 'gmoShorui', 'raksul1293'])}（{CHECKED} 確認）</p>
          {hasExit && (
            <HoujinExit
              lpId={LP_ID} partner="raksulBank" position="tsugi" lead="GMOあおぞらネット銀行にまだ申し込んでいないなら"
              note="ラクスルバンクの口座はGMOあおぞらネット銀行のラクスルバンク支店で、審査もGMOあおぞらネット銀行が行います。私たちはGMOあおぞらネット銀行に直接申し込んで落ちています。GMOあおぞらネット銀行で落ちたことがある会社は、同じ銀行の審査になると知ったうえで選んでください。"
            />
          )}
          {hasExit && <p className={SRC}>出典：{src(['raksul33', 'gmoTokuyaku'])}（{CHECKED} 確認）</p>}
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
          <p className={`${SRC} mt-1`}>出典：{src(['gmo1219', 'docomo2426', 'raksul54'])}（{CHECKED} 確認）</p>
        </section>

        <nav aria-label="あわせて読む" className="flex flex-col gap-2">
          {[
            { href: '/guide/houjin/kouza-tsukurenai', t: '法人口座が作れない', s: '3つの銀行に申し込んだ記録と、申込前のチェック表' },
            { href: '/guide/houjin/kouza-hitsuyou-shorui', t: '法人口座の必要書類', s: '銀行4つの比較と、設立直後の事業内容の資料' },
            { href: '/guide/houjin/kouza-virtual-office', t: '法人口座とバーチャルオフィス', s: '本店がバーチャルオフィスで申し込んだ記録' },
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
          銀行の案内は、各銀行の公式の記載（{CHECKED} 確認）をもとにしています。銀行は案内を変えることがあり、審査の結果は会社ごとに違います。落ちた理由は銀行が開示しないため、このページは理由を決めつけていません。実例は運営会社（BlueAdventures合同会社）の2026年11月の申込です。最終更新：2026年11月25日
        </p>
      </main>
      <LpFooter />
    </div>
  );
}
