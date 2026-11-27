import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Building2, CheckCircle2, FileText, Info, Mail, Monitor, SearchCheck, UserRound, Video, Wallet, XCircle } from 'lucide-react';
import LpHeader from '@/components/lp/LpHeader';
import LpFooter from '@/components/lp/LpFooter';
import LpViewTracker from '@/components/lp/LpViewTracker';
import { KakiteLine, KakiteNote, KAKITE_LD } from '@/components/houjin/Kakite';
import HoujinExit from '@/components/houjin/HoujinExit';
import { SITE_URL, SITE_NAME, ogImageUrl } from '@/components/loan/LoanArticle';
import { HOUJIN_PARTNERS } from '@/lib/houjin/partners';

/**
 * みずほ銀行の法人口座の審査に落ちたら（2026-11-27 作成。houjin-plan.md B12。体験のない銀行。オーナー了承 11/25）。
 * 運営会社はみずほ銀行には申し込んでいないので、体験したふりはしない。
 * 受ける言葉（キーワードプランナー 11/25）：みずほ 法人口座 審査落ち 70。
 * 上位（11/27 9:20、Chrome で Google「みずほ 法人口座 審査落ち」）：みずほ銀行の記事3・ファクログ・知恵袋・ミカタグループ・
 *   ポイントタウン・バーチャルオフィス1・お名前.com。銀行の自社ページ3・大手1。
 *   関連する質問：審査に落ちる原因／みずほの審査はどうなっている／みずほで落ちることはある／再申し込みはできる。
 *   上位に欠けている点：①申込書類は登記の「本店」あてに転送不要の簡易書留で届き、受け取れないと手続きを進められないこと
 *   ②一次審査と最終審査の2回の連絡の間に何があるかを公式のよくある質問の文で並べたもの ③3つの銀行に申し込んだ日付つきの実例
 * 一次情報（11/27 確認）：みずほ銀行「法人口座の開設ができない理由とは？」（みずほ銀行提供の記事）・「法人口座開設のお手続き」・
 *   よくあるご質問 8641・8642・8644・8655・8068。
 * 出口：ラクスルバンク（審査は GMOあおぞらネット銀行。私たちはそこで落ちたと正直に書く）。
 */
const LP_ID = 'guide-houjin-mizuho-shinsa';
const PATH = '/guide/houjin/mizuho-shinsa';
const CHECKED = '2026/11/27';
const TITLE = 'みずほ銀行の法人口座の審査に落ちたら｜公式が挙げる4つの確認点と申込の流れ';
const DESCRIPTION = 'みずほ銀行の法人口座の審査に落ちたら見直す点。理由は「総合的判断」として公開されません。みずほ銀行が挙げる4つの確認点と、一次審査・ウェブ面談・最終審査の流れ、本店あてに転送不要で届く申込書類のことを公式の記載から。みずほ以外の3つの銀行に申し込んだ実例つき。';

export const metadata: Metadata = {
  title: `${TITLE} | ${SITE_NAME}`,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}${PATH}` },
  openGraph: { title: TITLE, description: DESCRIPTION, url: `${SITE_URL}${PATH}`, siteName: SITE_NAME, type: 'article', locale: 'ja_JP', images: [{ url: ogImageUrl(TITLE), width: 1200, height: 630, alt: TITLE }] },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, images: [ogImageUrl(TITLE)] },
};

const FAQ_BASE = 'https://www.faq.mizuhobank.co.jp/faq/show/';
const S = {
  tips63: { name: 'みずほ銀行「法人口座の開設ができない理由とは？審査基準と対策、スムーズな開設のポイントを解説」', url: 'https://www.mizuhobank.co.jp/corporate/account/tips/topic_63.html' },
  procedure: { name: 'みずほ銀行「法人口座開設のお手続き」', url: 'https://www.mizuhobank.co.jp/corporate/account/procedure/index.html' },
  faq8641: { name: 'みずほ銀行 よくあるご質問「口座開設をする際、審査はありますか。」', url: `${FAQ_BASE}8641?site_domain=houjin` },
  faq8642: { name: 'みずほ銀行 よくあるご質問「一次審査完了後の連絡は、どの程度の日数を要しますか。」', url: `${FAQ_BASE}8642?site_domain=houjin` },
  faq8644: { name: 'みずほ銀行 よくあるご質問「審査の結果、口座開設見送りの連絡（メール）をもらったが、口座開設見送りの理由を教えてください。」', url: `${FAQ_BASE}8644?site_domain=houjin` },
  faq8655: { name: 'みずほ銀行 よくあるご質問「「法人口座開設ネット受付」は、誰でも利用ができますか。」', url: `${FAQ_BASE}8655?site_domain=houjin` },
  faq8068: { name: 'みずほ銀行 よくあるご質問「法人口座開設の流れを知りたい。」', url: `${FAQ_BASE}8068?site_domain=houjin` },
  raksul1293: { name: 'ラクスルバンク よくあるご質問「口座開設の際、必要書類は何を提出すればいいですか。」', url: 'https://support.raksulbank.com/faq/show/1293?site_domain=default' },
  gmoTokuyaku: { name: 'GMOあおぞらネット銀行「ラクスルバンク支店に関する特約」', url: 'https://gmo-aozora.com/provision/pdf/raksul_260816.pdf' },
} as const;
type K = keyof typeof S;

/** みずほ銀行の記事が挙げる4つ（審査の詳細ではないと明記されている） */
const KAKUNIN = [
  { icon: FileText, h: '提出書類', s: ['履歴事項全部証明書と、ほかの書類の内容が合っていない', '公的書類の有効期限が切れている', '代表者の本人確認書類が最新でない（旧姓のままなど）', '必要書類が足りない'] },
  { icon: Building2, h: '事業内容と実態', s: ['具体的な事業内容がはっきりしない', '事業実績が確認できない', 'ホームページやパンフレットなどがない', '登記の事業目的と、実際の事業内容が合っていない'] },
  { icon: Wallet, h: '資本金の額と出所', s: ['出所を示す書類（通帳の写し・振込明細書など）を出していない', '代表者個人の預金の出所がはっきりしない', '第三者から出資を受けた理由や関係がはっきりしない'] },
  { icon: UserRound, h: '代表者・役員の信用情報', s: ['代表者や役員の信用情報が確認される場合がある'] },
] as const;

const NAGARE = [
  { icon: Monitor, h: 'ネットで申込', s: '登記の内容と、代表者・役員・面談する人の名前・住所・生年月日を入力' },
  { icon: Mail, h: '一次審査の結果の連絡', s: '担当者から。一次審査完了後の連絡は最長1週間程度。年末年始・ゴールデンウィークや申込が集中したときは、さらにかかる場合あり' },
  { icon: Video, h: 'ウェブ面談', s: '一次審査で面談に進む場合。事業内容などを聞かれる。カメラのついた端末が必要' },
  { icon: SearchCheck, h: '最終審査の結果の連絡', s: '面談のあと、担当者から' },
  { icon: CheckCircle2, h: '申込書類を返送して開設', s: '書類に記入・押印して返す。通帳・キャッシュカードなどが届く' },
] as const;

const TENPO = ['個人事業主・任意団体', '有限責任事業組合・投資事業有限責任組合', '本店所在地（設立国）が日本以外', '支社や支店名で開設したい', 'すでにみずほ銀行に法人口座がある', '普通預金以外の口座を開設したい'];

const GINKO = [
  { href: '/guide/houjin/gmo-aozora-shinsa', bank: 'GMOあおぞらネット銀行', when: '11/7 申込 → 11/10 見合わせのメール', ok: false },
  { href: '/guide/houjin/docomo-smtb-shinsa', bank: 'ドコモSMTBネット銀行（旧 住信SBIネット銀行）', when: '11/12 申込 → 11/16 見合わせのメール', ok: false },
  { href: '/guide/houjin/paypay-houjin-kouza', bank: 'PayPay銀行', when: '11/12 申込 → 11/13 法人の住所に自宅を入れていて登記の本店と違い、止まる → 登記どおりに申し込み直し → 11/16 通過', ok: true },
] as const;

const FAQS = [
  { q: 'みずほ銀行の法人口座の審査に落ちた理由は、教えてもらえますか？', a: 'みずほ銀行は、口座開設の可否は総合的判断に基づいて決めていて、詳細には答えられないとしています。理由が分からないので、みずほ銀行が記事で挙げている4つの確認点（提出書類・事業内容と実態・資本金の額と出所・代表者や役員の信用情報）と照らし合わせて見直します。みずほ銀行は、この4つは審査の詳細を示すものではないとしています。' },
  { q: 'みずほ銀行の一次審査の結果は、いつ届きますか？', a: 'みずほ銀行のよくある質問では、一次審査完了後の連絡は最長1週間程度としています。年末年始やゴールデンウィークなどをはさむときや、申込が集中したときは、さらにかかる場合があります。一次審査で面談に進む場合は、そのあとウェブ面談があり、最終審査の結果が届きます。' },
  { q: 'みずほ銀行の審査に落ちたら、次は何をすればいいですか？', a: '4つの確認点と照らして直せるところを直し、ほかの銀行への申込も進めます。再申込までの期間は、このページで確かめたみずほ銀行の案内には記載がありませんでした。私たちはみずほ銀行ではなく、GMOあおぞらネット銀行・ドコモSMTBネット銀行・PayPay銀行に申し込みました。1つ目で落ちた2日後に残りの2つへ同じ日に申し込み、PayPay銀行が通りました。' },
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
    { '@type': 'Article', author: KAKITE_LD, publisher: { '@id': 'https://www.tsuginotenavi.jp/#organization' }, headline: TITLE, description: DESCRIPTION, inLanguage: 'ja', about: { '@type': 'Thing', name: 'みずほ銀行の法人口座の審査' }, mentions: [{ '@type': 'BankOrCreditUnion', name: 'みずほ銀行' }], datePublished: '2026-11-27T10:00:00+09:00', dateModified: '2026-11-27T10:00:00+09:00', mainEntityOfPage: `${SITE_URL}${PATH}` },
    { '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: SITE_NAME, item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: '法人成り', item: `${SITE_URL}/guide/houjin` },
      { '@type': 'ListItem', position: 3, name: 'みずほ銀行の法人口座の審査', item: `${SITE_URL}${PATH}` },
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
          <span>みずほ銀行の審査</span>
        </nav>

        <section className="flex flex-col gap-5" aria-labelledby="top">
          <div className="flex flex-col gap-2">
            <p className="text-[13px] font-bold text-sky-700">公式の案内と、ほかの銀行での私たちの実例</p>
            <h1 id="top" className="text-[26px] font-black leading-tight text-slate-900">みずほ銀行の<br />法人口座の審査に<br />落ちたら<br /><span className="text-[19px] text-orange-600">公式が挙げる4つの確認点と申込の流れ</span></h1>
            <KakiteLine />
          </div>
          <ul className="grid grid-cols-3 gap-2" aria-label="公式の要点">
            {[
              { big: '非公開', s: '落ちた理由' },
              { big: '2回', s: '一次審査と最終審査の連絡' },
              { big: '転送不可', s: '本店あての申込書類' },
            ].map((k) => (
              <li key={k.s} className="flex flex-col items-center gap-0.5 rounded-2xl bg-white px-2 py-3.5 text-center ring-1 ring-slate-200">
                <span className="text-[20px] font-black leading-none text-orange-600">{k.big}</span>
                <span className="text-[11px] leading-snug text-slate-600">{k.s}</span>
              </li>
            ))}
          </ul>
          <p className="rounded-2xl bg-white p-4 text-[14px] leading-relaxed text-slate-800 ring-1 ring-slate-200">
            <span className="mb-1 block text-[12px] font-black text-sky-700">結論</span>
            みずほ銀行は、審査は総合的に判断していて、見送りの理由には答えられないとしています。見直すときは、みずほ銀行が記事で挙げている4つ（提出書類・事業内容と実態・資本金の額と出所・代表者や役員の信用情報）と照らし合わせます。ネットの申込では、申込書類が登記の本店あてに転送不要の簡易書留で届き、受け取れないと手続きを進められません。ほかの銀行への申込も同時に進めます。
          </p>
          <p className="flex items-start gap-2 text-[12px] leading-relaxed text-slate-600"><Info size={16} className="mt-0.5 shrink-0 text-sky-700" aria-hidden="true" /><span>私たちはみずほ銀行には申し込んでいません。このページのみずほ銀行の案内は、公式の記載だけをもとにしています。</span></p>
        </section>

        <section className={SECTION} aria-labelledby="kakunin">
          <h2 id="kakunin" className={H2}>公式が挙げる4つの確認点</h2>
          <div className="grid gap-2">
            {KAKUNIN.map((k, i) => (
              <div key={k.h} className="flex flex-col gap-2 rounded-2xl bg-white p-3.5 ring-1 ring-slate-200">
                <span className="flex items-center gap-2 text-[15px] font-black text-slate-900"><k.icon size={20} className="shrink-0 text-sky-700" aria-hidden="true" />{i + 1}. {k.h}</span>
                <ul className="grid gap-1 pl-7">
                  {k.s.map((t) => <li key={t} className="list-disc text-[12px] leading-relaxed text-slate-600">{t}</li>)}
                </ul>
              </div>
            ))}
          </div>
          <p className="text-[13px] leading-relaxed text-slate-700">みずほ銀行は、可否は法令と内部の審査基準にもとづいて総合的に判断していて、この4つは審査の詳細を示すものではないとしています。バーチャルオフィスの利用や固定電話の有無だけで結果が決まるものではない、とも書いています。法人口座の開設には所定の審査があり、口座開設を断る場合もあるとしています。</p>
          <p className={SRC}>出典：{src(['tips63', 'faq8641', 'faq8644'])}（{CHECKED} 確認）</p>
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
          <div className="flex flex-col gap-2 rounded-2xl bg-amber-50 p-4 ring-1 ring-amber-200">
            <span className="flex items-center gap-2 text-[14px] font-black text-amber-900"><Mail size={18} aria-hidden="true" />郵便は転送されない</span>
            <ul className="grid gap-1 pl-5">
              <li className="list-disc text-[13px] leading-relaxed text-slate-800">申込書類：登記事項証明書の「本店」あて</li>
              <li className="list-disc text-[13px] leading-relaxed text-slate-800">確認のはがき：提出した本人確認書類に書かれた住所あて</li>
            </ul>
            <p className="text-[13px] leading-relaxed text-slate-800">どちらも転送不要の簡易書留で、受け取れないと口座開設の手続きを進められません。本店がバーチャルオフィスの会社は、本店あての簡易書留を受け取ってもらえるかを、バーチャルオフィスの事業者に先に確かめます。</p>
          </div>
          <p className="flex items-start gap-2 text-[13px] leading-relaxed text-slate-700"><Info size={18} className="mt-0.5 shrink-0 text-sky-700" aria-hidden="true" /><span>入力する住所は、登記事項証明書の本店どおりにします。私たちは PayPay銀行で、法人の住所の欄に登記の本店ではなく自宅を入れたため住所が合わず、手続きが止まりました。止まった理由は入力の違いです。</span></p>
          <p className={SRC}>出典：{src(['faq8068', 'faq8642', 'procedure'])}（{CHECKED} 確認）</p>
        </section>

        <section className={SECTION} aria-labelledby="shorui">
          <h2 id="shorui" className={H2}>ネットの申込で出す書類</h2>
          <div className="grid gap-2">
            <div className="flex flex-col gap-1 rounded-2xl bg-white p-3.5 ring-1 ring-slate-200">
              <span className="text-[14px] font-black text-slate-900">出す書類</span>
              <span className="text-[12px] leading-relaxed text-slate-600">面談する人の本人確認書類（運転免許証・マイナンバーカードなど）／株式会社・有限会社・投資法人・特定目的会社は、実質的支配者を確認できる書類（株主名簿など）。合同会社は、この一覧には入っていません</span>
            </div>
            <div className="flex flex-col gap-1 rounded-2xl bg-white p-3.5 ring-1 ring-slate-200">
              <span className="text-[14px] font-black text-slate-900">必要に応じて出す書類</span>
              <span className="text-[12px] leading-relaxed text-slate-600">事業内容や事業実態が分かる資料（会社案内・商品パンフレット・法人名義の国税か地方税の領収書・受注書・発注書・請求書など）／登記事項証明書の原本／印鑑証明書の原本</span>
            </div>
          </div>
          <p className="text-[13px] leading-relaxed text-slate-700">申込の入力では、登記事項証明書に書かれた内容を使うので、手元に用意します。原本の提出は、必要に応じて求められます。</p>
          <p className={SRC}>出典：{src(['procedure'])}（{CHECKED} 確認）</p>
        </section>

        <section className={SECTION} aria-labelledby="tenpo">
          <h2 id="tenpo" className={H2}>店舗で申し込む必要がある場合</h2>
          <ul className="flex flex-wrap gap-1.5">
            {TENPO.map((t) => <li key={t} className="rounded-full bg-white px-3 py-1 text-[12px] text-slate-700 ring-1 ring-slate-200">{t}</li>)}
          </ul>
          <p className="text-[13px] leading-relaxed text-slate-700">ほかに、口座と同時に申し込むインターネットバンキングなどのサービスを希望しない場合も、店舗での申込です。</p>
          <p className="text-[13px] leading-relaxed text-slate-700">ネットの申込を使えるのは、本店所在地が日本で、国税庁の法人番号公表サイトに法人番号が反映されていて、みずほ銀行と取引がない法人です。設立したばかりの会社は、法人番号が反映されているかを先に確かめます。登記の申請中は口座開設ができず、登記が終わってから申し込みます。</p>
          <p className="text-[13px] leading-relaxed text-slate-700">ネットで申し込んでも、業種が金融機関、投資運用が主な事業目的、実質的支配者の税務上の居住地国が日本以外で直前の事業年度がない、などの場合は来店不要の手続きは使えず、原則1回来店になります。ネットの申込のあと、面談のときに店舗へ来店となる場合もあります。</p>
          <p className={SRC}>出典：{src(['faq8068', 'faq8655', 'tips63', 'procedure'])}（{CHECKED} 確認）</p>
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
          <p className="text-[13px] leading-relaxed text-slate-700">1つ目で落ちた2日後に、2つの銀行へ同じ日に申し込みました。通ったのは PayPay銀行で、11月16日、設立から19日後です。落ちた2つの銀行は、どちらも理由の説明がありませんでした。</p>
          <p className={SRC}>運営会社（BlueAdventures合同会社、2026年10月28日設立・本店はバーチャルオフィス）の2026年11月の記録</p>
          {hasExit && (
            <HoujinExit
              lpId={LP_ID} partner="raksulBank" position="jitsurei" lead="みずほ銀行のほかに申し込む先の候補"
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
          <p className={`${SRC} mt-1`}>出典：{src(['faq8644', 'faq8642', 'faq8068', 'tips63'])}（{CHECKED} 確認）</p>
        </section>

        <nav aria-label="あわせて読む" className="flex flex-col gap-2">
          {[
            { href: '/guide/houjin/shinsa-ochita-tsugi', t: '法人口座の審査に落ちたら次は', s: '落ちたあとにすること4つと、3つの銀行の結果' },
            { href: '/guide/houjin/smbc-shinsa', t: '三井住友銀行の審査に落ちたら', s: 'Trunk の必要書類と見直す点' },
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
          みずほ銀行の案内は、公式の記載（{CHECKED} 確認）をもとにしています。運営会社はみずほ銀行には申し込んでいません。銀行は案内を変えることがあり、審査の結果は会社ごとに違います。実例は運営会社（BlueAdventures合同会社）の2026年11月の申込です。最終更新：2026年11月27日
        </p>
      </main>
      <LpFooter />
    </div>
  );
}
