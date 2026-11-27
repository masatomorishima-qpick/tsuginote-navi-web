import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Building2, CheckCircle2, FileText, Info, Mail, Monitor, RotateCcw, ScanFace, SearchCheck, Store, XCircle } from 'lucide-react';
import LpHeader from '@/components/lp/LpHeader';
import LpFooter from '@/components/lp/LpFooter';
import LpViewTracker from '@/components/lp/LpViewTracker';
import { KakiteLine, KakiteNote, KAKITE_LD } from '@/components/houjin/Kakite';
import HoujinExit from '@/components/houjin/HoujinExit';
import { SITE_URL, SITE_NAME, ogImageUrl } from '@/components/loan/LoanArticle';
import { HOUJIN_PARTNERS } from '@/lib/houjin/partners';

/**
 * りそな銀行の法人口座の審査に落ちたら（2026-11-27 作成。houjin-plan.md B13。体験のない銀行。オーナー了承 11/25）。
 * 運営会社はりそな銀行には申し込んでいないので、体験したふりはしない。
 * 受ける言葉（キーワードプランナー 11/25）：りそな 法人口座 審査落ち 50。
 * 上位（11/27 10:10、Chrome で Google「りそな 法人口座 審査落ち」）：ミカタグループ・ファクログ・知恵袋・sugu.site・
 *   ナレッジソサエティ・T-FRONT・池上会計・INQ・創業手帳。銀行の自社ページ0。
 *   関連する質問：審査に落ちる原因／りそなで落ちることはある／断られる理由／再申し込みはできる。
 *   上位に欠けている点：①一度ネットで申し込んだ会社はネットで再申込できず、店頭になること（公式）
 *   ②合同会社の実質的支配者の確認書類に「直近決算期の別表二」が挙がっていて、設立1期目の会社にはまだないこと
 *   ③本店がバーチャルオフィスのときの本社確認書類と、転送不要の簡易書留 ④3つの銀行に申し込んだ日付つきの実例
 * 一次情報（11/27 確認）：りそな銀行「法人口座開設」「法人口座開設で必要な書類」「法人口座開設のよくあるご質問」。
 * 出口：ラクスルバンク（審査は GMOあおぞらネット銀行。私たちはそこで落ちたと正直に書く）。
 */
const LP_ID = 'guide-houjin-resona-shinsa';
const PATH = '/guide/houjin/resona-shinsa';
const CHECKED = '2026/11/27';
const TITLE = 'りそな銀行の法人口座の審査に落ちたら｜ネットの再申込はできず店頭へ';
const DESCRIPTION = 'りそな銀行の法人口座の審査に落ちたら見直す点。一度ネットで申し込んだ会社は、ネットで申し込み直せず店頭での申込になると公式は書いています。断る理由は答えられないこと、審査にかかる期間（1〜2週間程度）、合同会社が出す書類、本店がバーチャルオフィスのときの書類も、公式の記載からまとめました。りそな以外の3つの銀行に申し込んだ実例つき。';

export const metadata: Metadata = {
  title: `${TITLE} | ${SITE_NAME}`,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}${PATH}` },
  openGraph: { title: TITLE, description: DESCRIPTION, url: `${SITE_URL}${PATH}`, siteName: SITE_NAME, type: 'article', locale: 'ja_JP', images: [{ url: ogImageUrl(TITLE), width: 1200, height: 630, alt: TITLE }] },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, images: [ogImageUrl(TITLE)] },
};

const FAQ_BASE = 'https://www.resonabank.co.jp/hojin/service/eb/webmoushikomi/faq/faq_hojin_kouza_';
const S = {
  top: { name: 'りそな銀行「法人口座開設」', url: 'https://www.resonabank.co.jp/hojin/service/eb/webmoushikomi/' },
  shorui: { name: 'りそな銀行「法人口座開設で必要な書類」', url: 'https://www.resonabank.co.jp/hojin/service/eb/webmoushikomi/requireddocuments.html' },
  faq0004: { name: 'りそな銀行 よくあるご質問「申込み入力フォームで「すでに登録済みです」とエラーになり、申込み手続きができません。」', url: `${FAQ_BASE}0004.html` },
  faq0016: { name: 'りそな銀行 よくあるご質問「口座開設の審査は、どのくらい時間がかかりますか？」', url: `${FAQ_BASE}0016.html` },
  faq0033: { name: 'りそな銀行 よくあるご質問「審査結果の連絡がまだ届いていません。」', url: `${FAQ_BASE}0033.html` },
  faq0035: { name: 'りそな銀行 よくあるご質問「バーチャルオフィスを利用していますが、本社確認書類で提出する契約書がない場合は、どうすればよいですか？」', url: `${FAQ_BASE}0035.html` },
  faq0005: { name: 'りそな銀行 よくあるご質問「電話で申込みについて相談したいのですが、電話窓口はありますか？」', url: `${FAQ_BASE}0005.html` },
  faq0003: { name: 'りそな銀行 よくあるご質問「申込入力フォームで法人名が表示されません。」', url: `${FAQ_BASE}0003.html` },
  faq0009: { name: 'りそな銀行 よくあるご質問「住所変更や移転などにより、登記情報を変更手続き中の場合でも申込みできますか。」', url: `${FAQ_BASE}0009.html` },
  faq0018: { name: 'りそな銀行 よくあるご質問「法人口座を開設したいのですが、開設できない会社や団体はありますか？」', url: `${FAQ_BASE}0018.html` },
  raksul1293: { name: 'ラクスルバンク よくあるご質問「口座開設の際、必要書類は何を提出すればいいですか。」', url: 'https://support.raksulbank.com/faq/show/1293?site_domain=default' },
  gmoTokuyaku: { name: 'GMOあおぞらネット銀行「ラクスルバンク支店に関する特約」', url: 'https://gmo-aozora.com/provision/pdf/raksul_260816.pdf' },
} as const;
type K = keyof typeof S;

const JIGYOU = ['取引先との調印済の契約書', '取引先との請求書', '使っている預金通帳の表紙と直近3か月分の明細', 'パンフレット（事業実態が確認できるものなど）', '事業計画書（具体的な内容の記載があるもの）'];

const NAGARE = [
  { icon: Monitor, h: '書類を用意して入力', s: '書類は PDF で出す。パソコンでの手続きを勧めている' },
  { icon: ScanFace, h: 'スマートフォンで本人確認', s: '取引担当者のマイナンバーカードか運転免許証で' },
  { icon: SearchCheck, h: '審査', s: '審査受付から完了まで1〜2週間程度。結果は登録したメールアドレスに届く' },
  { icon: Mail, h: '申込書を返送して電子契約', s: '審査を通過すると、法人の届け出住所に申込書が転送不要の簡易書留で届く' },
  { icon: CheckCircle2, h: '開設', s: '法人の届け出住所に通帳が届く' },
] as const;

const DEKINAI = ['個人事業主', '法人格のない社団・財団や任意団体など', '外国法人', '国・地方公共団体・独立行政法人'];

const GINKO = [
  { href: '/guide/houjin/gmo-aozora-shinsa', bank: 'GMOあおぞらネット銀行', when: '11/7 申込 → 11/10 見合わせのメール', ok: false },
  { href: '/guide/houjin/docomo-smtb-shinsa', bank: 'ドコモSMTBネット銀行（旧 住信SBIネット銀行）', when: '11/12 申込 → 11/16 見合わせのメール', ok: false },
  { href: '/guide/houjin/paypay-houjin-kouza', bank: 'PayPay銀行', when: '11/12 申込 → 11/13 法人の住所に自宅を入れていて登記の本店と違い、止まる → 登記どおりに申し込み直し → 11/16 通過', ok: true },
] as const;

const FAQS = [
  { q: 'りそな銀行の法人口座の審査に落ちた理由は、教えてもらえますか？', a: 'りそな銀行は、口座開設を断る場合、理由は答えられないとしています。理由が分からないので、出した書類（実質的支配者の確認書類・事業内容確認書類など）と、入力した内容が登記と合っているかを見直します。' },
  { q: 'りそな銀行の法人口座の審査は、どのくらいかかりますか？', a: '審査受付から審査完了までは1〜2週間程度としています。結果は申込のときに登録したメールアドレスに届きます。審査の結果、口座開設を断る場合もあるとしています。' },
  { q: 'りそな銀行の審査に落ちたら、もう一度申し込めますか？', a: '過去にネットで申し込んだ会社は、ネットでは申し込み直せません。もう一度申し込むときは、最寄りの店舗の店頭で申し込むと案内しています。店頭で申し込み直すまでの間に、ほかの銀行へ申し込むこともできます（私たちはりそな銀行ではない銀行で、1つ目で落ちた2日後に、2つの銀行へ同じ日に申し込みました）。' },
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
    { '@type': 'Article', author: KAKITE_LD, publisher: { '@id': 'https://www.tsuginotenavi.jp/#organization' }, headline: TITLE, description: DESCRIPTION, inLanguage: 'ja', about: { '@type': 'Thing', name: 'りそな銀行の法人口座の審査' }, mentions: [{ '@type': 'BankOrCreditUnion', name: 'りそな銀行' }], datePublished: '2026-11-27T11:00:00+09:00', dateModified: '2026-11-27T11:00:00+09:00', mainEntityOfPage: `${SITE_URL}${PATH}` },
    { '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: SITE_NAME, item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: '法人成り', item: `${SITE_URL}/guide/houjin` },
      { '@type': 'ListItem', position: 3, name: 'りそな銀行の法人口座の審査', item: `${SITE_URL}${PATH}` },
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
          <span>りそな銀行の審査</span>
        </nav>

        <section className="flex flex-col gap-5" aria-labelledby="top">
          <div className="flex flex-col gap-2">
            <p className="text-[13px] font-bold text-sky-700">公式の案内と、ほかの銀行での私たちの実例</p>
            <h1 id="top" className="text-[26px] font-black leading-tight text-slate-900">りそな銀行の<br />法人口座の審査に<br />落ちたら<br /><span className="text-[19px] text-orange-600">ネットの再申込はできず店頭へ</span></h1>
            <KakiteLine />
          </div>
          <ul className="grid grid-cols-3 gap-2" aria-label="公式の要点">
            {[
              { big: '店頭', s: '2回目の申込' },
              { big: '1〜2週間', s: '審査の受付から完了までの目安' },
              { big: '非公開', s: '断る理由' },
            ].map((k) => (
              <li key={k.s} className="flex flex-col items-center gap-0.5 rounded-2xl bg-white px-2 py-3.5 text-center ring-1 ring-slate-200">
                <span className="text-[20px] font-black leading-none text-orange-600">{k.big}</span>
                <span className="text-[11px] leading-snug text-slate-600">{k.s}</span>
              </li>
            ))}
          </ul>
          <p className="rounded-2xl bg-white p-4 text-[14px] leading-relaxed text-slate-800 ring-1 ring-slate-200">
            <span className="mb-1 block text-[12px] font-black text-sky-700">結論</span>
            りそな銀行は、過去にネットで申し込んだ会社はネットで申し込み直せず、もう一度申し込むときは、最寄りの店舗の店頭で申し込むよう案内しています。断る理由は答えられないとしています。店頭で申し込み直す前に、出した書類と入力の内容を見直し、ほかの銀行への申込も同時に進めます。
          </p>
          <p className="flex items-start gap-2 text-[12px] leading-relaxed text-slate-600"><Info size={16} className="mt-0.5 shrink-0 text-sky-700" aria-hidden="true" /><span>私たちはりそな銀行には申し込んでいません。このページのりそな銀行の案内は、公式の記載だけをもとにしています。</span></p>
        </section>

        <section className={SECTION} aria-labelledby="saishinsei">
          <h2 id="saishinsei" className={H2}>申し込み直すとき</h2>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col items-center gap-1.5 rounded-2xl bg-slate-100 p-4 text-center">
              <RotateCcw size={24} className="text-slate-400" aria-hidden="true" />
              <span className="text-[14px] font-black text-slate-500">ネット</span>
              <span className="text-[12px] leading-snug text-slate-500">過去に申し込んだ会社は申し込めない</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 rounded-2xl bg-white p-4 text-center ring-1 ring-sky-200">
              <Store size={24} className="text-sky-700" aria-hidden="true" />
              <span className="text-[14px] font-black text-slate-900">店頭</span>
              <span className="text-[12px] leading-snug text-slate-600">最寄りの店舗で申し込む</span>
            </div>
          </div>
          <p className="text-[13px] leading-relaxed text-slate-700">ネットの申込画面で「すでに登録済みです」と出る場合も、同じ案内です。店頭で手続きするときは、必要書類の原本を持っていきます。</p>
          <p className={SRC}>出典：{src(['top', 'faq0004', 'shorui'])}（{CHECKED} 確認）</p>
        </section>

        <section className={SECTION} aria-labelledby="shorui">
          <h2 id="shorui" className={H2}>必ず出す書類</h2>
          <ol className="grid gap-1.5">
            {['法人の印鑑証明書（発行後6か月以内）', '実質的支配者の確認書類（会社の種類ごと）', '事業内容確認書類'].map((h, i) => (
              <li key={h} className="flex items-start gap-3 rounded-xl bg-white px-3.5 py-2.5 ring-1 ring-slate-200">
                <span className="w-[18px] shrink-0 text-[13px] font-black text-sky-700">{i + 1}</span>
                <span className="text-[13px] leading-relaxed text-slate-800">{h}</span>
              </li>
            ))}
          </ol>
          <div className="flex flex-col gap-2 rounded-2xl bg-amber-50 p-4 ring-1 ring-amber-200">
            <span className="flex items-center gap-2 text-[14px] font-black text-amber-900"><FileText size={18} aria-hidden="true" />合同会社の実質的支配者の確認書類</span>
            <ul className="flex flex-wrap gap-1.5">
              {['直近決算期の法人税確定申告書の別表二', '法人の定款', '出資者名簿'].map((d) => <li key={d} className="rounded-full bg-white px-3 py-1 text-[12px] text-slate-700 ring-1 ring-amber-200">{d}</li>)}
            </ul>
            <p className="text-[13px] leading-relaxed text-slate-800">別表二は、法人税の申告書のうち株主や出資者を書く表です。公式の一覧には、何点出すかは書かれていません。設立1期目の会社は、まだ決算を迎えていないので別表二がありません。私たちの会社も事業年度は10月1日〜9月30日で、最初の決算はまだ先です。別表二がない会社が何を出せばよいかは公式の一覧に書かれていないので、申込の前に問い合わせのメールで確かめます。</p>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-[14px] font-black text-slate-900">事業内容確認書類（当てはまるものを出す）</span>
            <ul className="grid gap-1.5">
              {JIGYOU.map((d) => (
                <li key={d} className="flex items-start gap-2 rounded-xl bg-white px-3.5 py-2.5 text-[13px] leading-relaxed text-slate-800 ring-1 ring-slate-200"><FileText size={16} className="mt-0.5 shrink-0 text-sky-700" aria-hidden="true" />{d}</li>
              ))}
            </ul>
            <p className="text-[12px] leading-relaxed text-slate-600">法人成りの会社は、個人事業主として使っている預金通帳の表紙と直近3か月分の明細を出します。</p>
          </div>
          <p className="flex items-start gap-2 text-[13px] leading-relaxed text-slate-700"><Info size={18} className="mt-0.5 shrink-0 text-sky-700" aria-hidden="true" /><span>私たちは設立直後、法人の名前で請求書や発注書を出したことも、受け取ったこともありませんでした。私たちのように請求書がまだない会社は、公式の一覧の中ではパンフレットや具体的な内容の事業計画書が当てはまりそうです（どれで足りるかは公式に書かれていません）。</span></p>
          <p className="text-[13px] leading-relaxed text-slate-700">書類は PDF で出します。業種によっては許認可証など、代表者以外が申し込むときは委任状も出します。</p>
          <p className={SRC}>出典：{src(['shorui'])}（{CHECKED} 確認）</p>
        </section>

        <section className={SECTION} aria-labelledby="virtual">
          <h2 id="virtual" className={H2}>本店がバーチャルオフィスのとき</h2>
          <div className="grid gap-2">
            <div className="flex items-start gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-slate-200">
              <Building2 size={20} className="mt-0.5 shrink-0 text-sky-700" aria-hidden="true" />
              <span className="flex flex-col gap-0.5"><span className="text-[14px] font-black text-slate-900">本社確認書類</span><span className="text-[12px] leading-relaxed text-slate-600">契約書がないときは、利用承諾書や、契約プラン（契約期間・賃料など）と契約者の名義が分かる書面。書面がなければ、会員サイトなどでそれが分かる画面の写し</span></span>
            </div>
            <div className="flex items-start gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-slate-200">
              <Mail size={20} className="mt-0.5 shrink-0 text-sky-700" aria-hidden="true" />
              <span className="flex flex-col gap-0.5"><span className="text-[14px] font-black text-slate-900">申込書は転送されない書留で届く</span><span className="text-[12px] leading-relaxed text-slate-600">申込書は法人の届け出住所に転送不要の簡易書留で届き、通帳もその住所に郵送される。郵便を受け取れないと、口座を使い始めていても利用の制限や解約になる可能性がある。書留をその住所で受け取れるかを、申込の前に確かめる</span></span>
            </div>
          </div>
          <p className="text-[13px] leading-relaxed text-slate-700">りそな銀行が申込書を送り、電子契約を頼んでから1か月たっても書類を受け取って確認できないときは、口座開設の受付を断り、その連絡もしないとしています。</p>
          <p className="flex items-start gap-2 text-[13px] leading-relaxed text-slate-700"><Info size={18} className="mt-0.5 shrink-0 text-sky-700" aria-hidden="true" /><span>私たちの会社も本店はバーチャルオフィスです。入力する住所は、登記事項証明書の本店どおりにします。私たちは PayPay銀行で、法人の住所の欄に自宅を入れたため登記の本店と合わず、手続きが止まりました。</span></p>
          <p className={SRC}>出典：{src(['faq0035', 'top', 'faq0033'])}（{CHECKED} 確認）</p>
        </section>

        <section className={SECTION} aria-labelledby="nagare">
          <h2 id="nagare" className={H2}>ネットで申し込んだときの流れ</h2>
          <ol className="grid gap-2">
            {NAGARE.map((n, i) => (
              <li key={n.h} className="flex items-start gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-slate-200">
                <n.icon size={20} className="mt-0.5 shrink-0 text-sky-700" aria-hidden="true" />
                <span className="flex flex-col gap-0.5"><span className="text-[14px] font-black text-slate-900">{i + 1}. {n.h}</span><span className="text-[12px] leading-relaxed text-slate-600">{n.s}</span></span>
              </li>
            ))}
          </ol>
          <p className="text-[13px] leading-relaxed text-slate-700">申込の内容によっては、ウェブ面談か来店を求められる場合があります。インターネットバンキングとビジネスデビットカードは口座と同時の申込で、月の基本手数料と年会費は1年間無料です。電話の窓口はなく、問い合わせはメールです。</p>
          <p className={SRC}>出典：{src(['top', 'faq0016', 'faq0033', 'faq0005'])}（{CHECKED} 確認）</p>
        </section>

        <section className={SECTION} aria-labelledby="dekinai">
          <h2 id="dekinai" className={H2}>ネットで申し込めない場合</h2>
          <ul className="flex flex-wrap gap-1.5">
            {DEKINAI.map((t) => <li key={t} className="rounded-full bg-white px-3 py-1 text-[12px] text-slate-700 ring-1 ring-slate-200">{t}</li>)}
          </ul>
          <p className="text-[13px] leading-relaxed text-slate-700">国税庁の法人番号公表サイトに法人の情報が公表される前は申し込めません。住所の移転などで登記を変える手続きの途中も、申込を控えるよう案内しています。申込の前の確認では、業種（宝石・貴金属の小売・卸、暗号資産交換業、資金移動業、決済収納代行業、特定非営利活動法人など）、税務上の居住国が日本か、すでにりそな銀行に法人口座があるか、ウェブ面談の環境も聞かれます。</p>
          <p className={SRC}>出典：{src(['faq0018', 'faq0003', 'faq0009', 'top'])}（{CHECKED} 確認）</p>
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
          <p className="text-[13px] leading-relaxed text-slate-700">1つ目で落ちた2日後に、2つの銀行へ同じ日に申し込みました。通ったのは PayPay銀行で、11月16日、設立から19日後です。落ちた2つの銀行は、どちらも理由の説明がありませんでした。バーチャルオフィスや書類が原因だったかどうかは分かりません。</p>
          <p className={SRC}>運営会社（BlueAdventures合同会社、2026年10月28日設立・本店はバーチャルオフィス）の2026年11月の記録</p>
          {hasExit && (
            <HoujinExit
              lpId={LP_ID} partner="raksulBank" position="jitsurei" lead="りそな銀行のほかに申し込む先の候補"
              note="ラクスルバンクは、設立直後の会社が補う書類として、代表者が署名・捺印した事業計画書を挙げています（補う書類なので、これで通るとは限りません）。口座はGMOあおぞらネット銀行のラクスルバンク支店で、審査もGMOあおぞらネット銀行が行います。私たちはGMOあおぞらネット銀行に直接申し込んで落ちています。GMOあおぞらネット銀行で落ちたことがある会社は、同じ銀行の審査になると知ったうえで選んでください。"
            />
          )}
          {hasExit && <p className={SRC}>出典：{src(['raksul1293', 'gmoTokuyaku'])}（{CHECKED} 確認）</p>}
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
          <p className={`${SRC} mt-1`}>出典：{src(['top', 'faq0016', 'faq0033', 'faq0004', 'shorui'])}（{CHECKED} 確認）</p>
        </section>

        <nav aria-label="あわせて読む" className="flex flex-col gap-2">
          {[
            { href: '/guide/houjin/shinsa-ochita-tsugi', t: '法人口座の審査に落ちたら次は', s: '落ちたあとにすること4つと、3つの銀行の結果' },
            { href: '/guide/houjin/mizuho-shinsa', t: 'みずほ銀行の審査に落ちたら', s: '公式が挙げる4つの確認点と申込の流れ' },
            { href: '/guide/houjin/kouza-virtual-office', t: 'バーチャルオフィスで法人口座', s: '本店がバーチャルオフィスの会社の申込' },
            { href: '/guide/houjin/kouza-tsukurenai', t: '法人口座が作れない', s: '3つの銀行に申し込んだ記録と、申込前のチェック表' },
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
          りそな銀行の案内は、公式の記載（{CHECKED} 確認）をもとにしています。運営会社はりそな銀行には申し込んでいません。銀行は案内を変えることがあり、審査の結果は会社ごとに違います。実例は運営会社（BlueAdventures合同会社）の2026年11月の申込です。最終更新：2026年11月27日
        </p>
      </main>
      <LpFooter />
    </div>
  );
}
