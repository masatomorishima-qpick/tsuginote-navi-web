import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Clock, FileText, Info, Landmark, SearchCheck, Video, XCircle } from 'lucide-react';
import LpHeader from '@/components/lp/LpHeader';
import LpFooter from '@/components/lp/LpFooter';
import LpViewTracker from '@/components/lp/LpViewTracker';
import { KakiteLine, KakiteNote, KAKITE_LD } from '@/components/houjin/Kakite';
import HoujinExit from '@/components/houjin/HoujinExit';
import { SITE_URL, SITE_NAME, ogImageUrl } from '@/components/loan/LoanArticle';
import { HOUJIN_PARTNERS } from '@/lib/houjin/partners';

/**
 * 三井住友銀行の法人口座の審査に落ちたら（2026-11-25 作成。houjin-plan.md「銀行の記事への切り替え」B8。
 * オーナー了承 11/25 22:21「体験のない銀行もOK」）。運営会社は三井住友銀行には申し込んでいないので、体験したふりはしない。
 * 受ける言葉（キーワードプランナー 11/25）：三井住友 法人口座 審査落ち 170。
 * 上位（11/25 22:30、Google「三井住友銀行 法人口座 審査 落ちた」）：紹介サイト・税理士事務所・バーチャルオフィスの会社・会社設立の会社・知恵袋など。
 *   銀行の自社ページと大手は0件。関連する質問：落ちたらどうすればいい／断られる理由。
 *   上位に欠けている点：①公式（Trunk のページ）の必要書類5つと「事業計画書は(1)〜(4)が出せない場合に限る」という条件
 *   ②Web面談で事業内容を聞かれること ③実際に3つの銀行に申し込み、2つ落ちて1つ通った日付つきの記録へのつなぎ
 * 一次情報（11/25 確認）：三井住友銀行 Trunk の案内ページ（必要書類・流れ・よくあるご質問）、「口座を開設されるお客さまへのお願い（法人）」。
 * 出口：ラクスルバンク（審査は GMOあおぞらネット銀行。私たちはそこで落ちたと正直に書く）。
 */
const LP_ID = 'guide-houjin-smbc-shinsa';
const PATH = '/guide/houjin/smbc-shinsa';
const CHECKED = '2026/11/25';
const TITLE = '三井住友銀行の法人口座の審査に落ちたら｜Trunkの必要書類と見直す所';
const DESCRIPTION = '三井住友銀行の法人口座（Trunk）の審査に落ちたときに見直す所。公式の必要書類は事業内容を確かめる書類1点と本人確認書類で、事業計画書は他の書類が出せない設立間もない会社に限られます。Web面談で事業内容を聞かれること、店頭で申し込む場合の書類も公式の記載から。設立直後に3つの銀行へ申し込んだ実例つき。';

export const metadata: Metadata = {
  title: `${TITLE} | ${SITE_NAME}`,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}${PATH}` },
  openGraph: { title: TITLE, description: DESCRIPTION, url: `${SITE_URL}${PATH}`, siteName: SITE_NAME, type: 'article', locale: 'ja_JP', images: [{ url: ogImageUrl(TITLE), width: 1200, height: 630, alt: TITLE }] },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, images: [ogImageUrl(TITLE)] },
};

const S = {
  trunk: { name: '三井住友銀行「法人口座を検討中の方へ｜Trunk」（必要書類・口座開設までの流れ・よくあるご質問）', url: 'https://www.smbc.co.jp/hojin/kouza/special/kaisetsu/brand-trunk/' },
  onegai: { name: '三井住友銀行「口座を開設されるお客さまへのお願い（法人）」', url: 'https://www.smbc.co.jp/terms/account-hojin/' },
  raksul33: { name: 'ラクスルバンク よくあるご質問「口座開設の審査にはどれくらいの時間がかかりますか？」', url: 'https://support.raksulbank.com/faq/show/33?site_domain=default' },
  gmoTokuyaku: { name: 'GMOあおぞらネット銀行「ラクスルバンク支店に関する特約」', url: 'https://gmo-aozora.com/provision/pdf/raksul_260816.pdf' },
} as const;
type K = keyof typeof S;

/** Trunk の事業内容の書類（公式。1点出す） */
const SHORUI = [
  '締結・調印済みの各種契約書の一式',
  '他社が発行した請求書・発注書・納品書など',
  '自社で発行した請求書・納品書など',
  '売上・仕入・活動状況が客観的に確認できる書類',
  '事業計画書（設立間もなく、上の4つが出せない場合に限る）',
];

/** 落ちたあとに見直す所 */
const MINAOSHI = [
  { icon: FileText, h: '書類の名義と社名・所在地', s: '公式は、売上などが分かる書類の例に「登記上の社名・所在地が明記されている事業案内」などを挙げています。私たちは別の銀行に、個人の名義のままの明細を出して落ちました。' },
  { icon: SearchCheck, h: '申込の入力と登記', s: '社名・住所・設立年月日を、登記と1文字ずつ照らします。私たちは別の銀行の申込で、社名の英字が1文字抜け、住所に自宅を入れていました。' },
  { icon: Video, h: 'Web面談での事業の説明', s: '公式では、Web面談で担当者が事業内容などを聞くとしています。何を売り、だれから入金があるかを、短く言えるようにしておきます。' },
];

const GINKO = [
  { href: '/guide/houjin/gmo-aozora-shinsa', bank: 'GMOあおぞらネット銀行', when: '11/7 申込 → 11/10 見合わせのメール', ok: false },
  { href: '/guide/houjin/docomo-smtb-shinsa', bank: 'ドコモSMTBネット銀行（旧 住信SBIネット銀行）', when: '11/12 申込 → 11/16 見合わせのメール', ok: false },
  { href: '/guide/houjin/paypay-houjin-kouza', bank: 'PayPay銀行', when: '11/12 申込 → 11/16 通過', ok: true },
] as const;

const FAQS = [
  { q: '設立したばかりの会社でも、三井住友銀行の法人口座は作れますか？', a: '公式のよくあるご質問では、新設法人も口座を開設している実績が多数あり、これまでの実績にかかわらず現在の事業計画などをもとに検討するとしています。作れるかどうかは審査しだいです。' },
  { q: '三井住友銀行の法人口座は、申し込んでから何日で開けますか？', a: 'Web の Trunk は、公式で最短即日としています。審査の状況によって時間がかかる場合があるとも書いています。店頭で申し込む場合は、申込から開設まで1か月ほどかかる場合があるとしています。' },
  { q: '三井住友銀行の審査に落ちたら、次は何をすればいいですか？', a: '書類の名義と社名・所在地、申込の入力が登記と合っているかを見直します。私たちは3つの銀行に申し込み、1つ目で落ちた2日後に、別の2つの銀行へ同じ日に申し込んで、1つが通りました。' },
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
    { '@type': 'Article', author: KAKITE_LD, publisher: { '@id': 'https://www.tsuginotenavi.jp/#organization' }, headline: TITLE, description: DESCRIPTION, inLanguage: 'ja', about: { '@type': 'Thing', name: '三井住友銀行の法人口座の審査' }, mentions: [{ '@type': 'BankOrCreditUnion', name: '三井住友銀行' }], datePublished: '2026-11-25T23:30:00+09:00', dateModified: '2026-11-25T23:30:00+09:00', mainEntityOfPage: `${SITE_URL}${PATH}` },
    { '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: SITE_NAME, item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: '法人成り', item: `${SITE_URL}/guide/houjin` },
      { '@type': 'ListItem', position: 3, name: '三井住友銀行の法人口座の審査', item: `${SITE_URL}${PATH}` },
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
          <span>三井住友銀行の審査</span>
        </nav>

        <section className="flex flex-col gap-5" aria-labelledby="top">
          <div className="flex flex-col gap-2">
            <p className="text-[13px] font-bold text-sky-700">公式の案内と、運営会社の実例</p>
            <h1 id="top" className="text-[26px] font-black leading-tight text-slate-900">三井住友銀行の<br />法人口座の審査に<br />落ちたら<br /><span className="text-[19px] text-orange-600">必要書類と見直す所</span></h1>
            <KakiteLine />
          </div>
          <ul className="grid grid-cols-3 gap-2" aria-label="公式の数字">
            {[
              { big: '1点', s: '事業内容の書類' },
              { big: '最短即日', s: 'Web の Trunk で開設' },
              { big: '1か月', s: '店頭は開設までかかる場合' },
            ].map((k) => (
              <li key={k.s} className="flex flex-col items-center gap-0.5 rounded-2xl bg-white px-2 py-3.5 text-center ring-1 ring-slate-200">
                <span className="text-[22px] font-black leading-none text-orange-600">{k.big}</span>
                <span className="text-[11px] leading-snug text-slate-600">{k.s}</span>
              </li>
            ))}
          </ul>
          <p className="rounded-2xl bg-white p-4 text-[14px] leading-relaxed text-slate-800 ring-1 ring-slate-200">
            <span className="mb-1 block text-[12px] font-black text-sky-700">結論</span>
            三井住友銀行の法人口座は、Web の Trunk で、事業内容を確かめる書類1点と面談で審査されます。落ちたら、書類の名義と社名・所在地、申込の入力、面談での事業の説明を見直します。あわせて、ほかの銀行への申込も同時に進めます。
          </p>
          <p className="flex items-start gap-2 text-[12px] leading-relaxed text-slate-600"><Info size={16} className="mt-0.5 shrink-0 text-sky-700" aria-hidden="true" /><span>私たちは三井住友銀行には申し込んでいません。このページの三井住友銀行の案内は、公式の記載だけをもとにしています。</span></p>
        </section>

        <section className={SECTION} aria-labelledby="shorui">
          <h2 id="shorui" className={H2}>Trunk の必要書類</h2>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col items-center gap-1 rounded-2xl bg-white p-3.5 text-center ring-1 ring-slate-200">
              <FileText size={22} className="text-sky-700" aria-hidden="true" />
              <span className="text-[13px] font-black text-slate-900">事業内容の書類</span>
              <span className="text-[11px] text-slate-600">下の5つから1点</span>
            </div>
            <div className="flex flex-col items-center gap-1 rounded-2xl bg-white p-3.5 text-center ring-1 ring-slate-200">
              <Landmark size={22} className="text-sky-700" aria-hidden="true" />
              <span className="text-[13px] font-black text-slate-900">本人確認書類</span>
              <span className="text-[11px] text-slate-600">マイナンバーカードか運転免許証など</span>
            </div>
          </div>
          <ol className="grid gap-1.5">
            {SHORUI.map((h, i) => (
              <li key={h} className={`flex items-start gap-3 rounded-xl px-3.5 py-2.5 ring-1 ${i === 4 ? 'bg-amber-50 ring-amber-200' : 'bg-white ring-slate-200'}`}>
                <span className="w-[18px] shrink-0 text-[13px] font-black text-sky-700">{i + 1}</span>
                <span className="text-[13px] leading-relaxed text-slate-800">{h}</span>
              </li>
            ))}
          </ol>
          <p className="text-[13px] leading-relaxed text-slate-700">4つ目の例として、公式は登記上の社名・所在地が明記された事業案内や商品カタログ、法人名義の許認可証、収益や売上が分かる管理画面の画像を挙げています。</p>
          <p className={SRC}>出典：{src(['trunk', 'onegai'])}（{CHECKED} 確認）</p>
        </section>

        <section className={SECTION} aria-labelledby="nagare">
          <h2 id="nagare" className={H2}>申込の流れと日数</h2>
          <ol className="grid gap-2">
            {[
              { icon: FileText, h: '入力と書類のアップロード', s: '法人口座の申込の画面に入力し、書類を出す' },
              { icon: Video, h: 'Web面談', s: '担当者が事業内容や申込の内容を確かめる。本人確認書類を手元に用意' },
              { icon: CheckCircle2, h: '口座の開設', s: '最短即日。審査の状況で時間がかかる場合あり' },
            ].map((n, i) => (
              <li key={n.h} className="flex items-start gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-slate-200">
                <n.icon size={20} className="mt-0.5 shrink-0 text-sky-700" aria-hidden="true" />
                <span className="flex flex-col gap-0.5"><span className="text-[14px] font-black text-slate-900">{i + 1}. {n.h}</span><span className="text-[12px] leading-relaxed text-slate-600">{n.s}</span></span>
              </li>
            ))}
          </ol>
          <div className="flex items-start gap-3 rounded-2xl bg-slate-100 p-4">
            <Clock size={20} className="mt-0.5 shrink-0 text-slate-500" aria-hidden="true" />
            <span className="text-[13px] leading-relaxed text-slate-700">Trunk で申し込めない会社は店頭で申し込みます。その場合は、法人の印鑑登録証明書・履歴事項全部証明書（どちらも発行から6か月以内）・手続きする人の本人確認書類・許認可証（要る事業だけ）が要り、開設まで1か月ほどかかる場合があります。</span>
          </div>
          <p className={SRC}>出典：{src(['trunk', 'onegai'])}（{CHECKED} 確認）</p>
        </section>

        <section className={SECTION} aria-labelledby="minaoshi">
          <h2 id="minaoshi" className={H2}>落ちたら見直す所</h2>
          <ul className="grid gap-2.5">
            {MINAOSHI.map((m) => (
              <li key={m.h} className="flex items-start gap-3 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                <m.icon size={22} className="mt-0.5 shrink-0 text-sky-700" aria-hidden="true" />
                <span className="flex flex-col gap-1"><span className="text-[15px] font-black text-slate-900">{m.h}</span><span className="text-[13px] leading-relaxed text-slate-600">{m.s}</span></span>
              </li>
            ))}
          </ul>
          <p className="text-[13px] leading-relaxed text-slate-700">どれが落ちた理由だったかは、外からは分かりません。見直した点を直して、次の申込に生かします。</p>
          <p className={SRC}>出典：{src(['trunk'])}（{CHECKED} 確認）</p>
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
              lpId={LP_ID} partner="raksulBank" position="jitsurei" lead="三井住友銀行のほかに申し込む先の一つに"
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
          <p className={`${SRC} mt-1`}>出典：{src(['trunk', 'onegai'])}（{CHECKED} 確認）</p>
        </section>

        <nav aria-label="あわせて読む" className="flex flex-col gap-2">
          {[
            { href: '/guide/houjin/shinsa-ochita-tsugi', t: '法人口座の審査に落ちたら次は', s: '落ちたあとにすること4つと、3つの銀行の結果' },
            { href: '/guide/houjin/kouza-tsukurenai', t: '法人口座が作れない', s: '3つの銀行に申し込んだ記録と、申込前のチェック表' },
            { href: '/guide/houjin/kouza-hitsuyou-shorui', t: '法人口座の必要書類', s: '銀行4つの比較と、設立直後の事業内容の資料' },
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
          三井住友銀行の案内は、公式の記載（{CHECKED} 確認）をもとにしています。運営会社は三井住友銀行には申し込んでいません。銀行は案内を変えることがあり、審査の結果は会社ごとに違います。実例は運営会社（BlueAdventures合同会社）の2026年11月の申込です。最終更新：2026年11月25日
        </p>
      </main>
      <LpFooter />
    </div>
  );
}
