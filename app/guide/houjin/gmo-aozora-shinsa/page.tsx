import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, CalendarDays, CheckCircle2, Clock, FileText, Info, Landmark, Mail, MessageSquare, XCircle } from 'lucide-react';
import LpHeader from '@/components/lp/LpHeader';
import LpFooter from '@/components/lp/LpFooter';
import LpViewTracker from '@/components/lp/LpViewTracker';
import { KakiteLine, KakiteNote, KAKITE_LD } from '@/components/houjin/Kakite';
import HoujinExit from '@/components/houjin/HoujinExit';
import { SITE_URL, SITE_NAME, ogImageUrl } from '@/components/loan/LoanArticle';
import { HOUJIN_PARTNERS } from '@/lib/houjin/partners';

/**
 * GMOあおぞらネット銀行の法人口座、審査に落ちた実例（2026-11-25 作成。houjin-plan.md「銀行の記事への切り替え」B1）。
 * 受ける言葉（キーワードプランナー 2025/11〜2026/10 の月平均、11/25 確認）：
 *   GMOあおぞらネット銀行 法人口座 審査 落ち 110（主）・審査期間 40・法人口座 審査 20・口座開設 審査 20・法人審査 20。
 * 上位（11/25 19:00、Google「GMOあおぞらネット銀行 法人口座 審査 落ちた」）：GMO 自身のコラム2つ・口コミの媒体・X・税理士事務所・
 *   知恵袋・会計事務所・GMO のよくある質問・バーチャルオフィスの会社。実際に落ちた日付と出した書類を書いた記事はない。
 *   上位に欠けている点：①申込から結果までの日付と通知の文面 ②実際に出した書類（アフィリエイトの明細2つ・公開1年以上のホームページ）と公式の案内の照らし合わせ
 *   ③設立直後（準備段階）の書類の出し方を公式の案内どおりに並べたもの
 * 11/25 18:35 オーナー訂正：GMOに出したのは Google アドセンスの明細とアクセストレードの明細。ホームページは公開1年以上。
 *   （履歴事項全部証明書・法人設立届出書は GMO 以外の申込の話。GMO の記事には書かない）
 * 一次情報：GMOあおぞらネット銀行「事業内容確認書類について」・よくある質問 1219・874・1316・1514（11/25 確認）。
 * 実体験：houjin-plan.md「実体験の事実」（11/7 申込・11/10 結果のメール・出した書類。オーナー 11/25）。
 *   落ちた理由は銀行が開示しないので決めつけない。出したものは公式の書類の例に当てはまっていたが落ちた、という事実だけ書く。
 *   明細の名義は2つとも個人（11/25 22:11 オーナー回答）。理由だったかは分からないと書く。
 * 出口：ラクスルバンク（審査は GMOあおぞらネット銀行。同じ審査で、GMO で落ちたあと通るかは分からないと注記。まだ申し込んでいない会社向けの紹介とする）。
 */
const LP_ID = 'guide-houjin-gmo-shinsa';
const PATH = '/guide/houjin/gmo-aozora-shinsa';
const CHECKED = '2026/11/25';
const TITLE = 'GMOあおぞらネット銀行の法人口座、審査に落ちた｜設立直後に出した書類と結果';
const DESCRIPTION = 'GMOあおぞらネット銀行の法人口座の審査に、設立から10日後に申し込んだ合同会社が落ちた実例。申込から結果のメールまで3日。出したのはアフィリエイトの明細2つと、公開1年以上のホームページ。書類の種類は公式の例に当たるものでしたが、明細は2つとも個人の名義でした。公式が挙げる書類、設立直後の出し方、審査の日数、次にしたこと。';

export const metadata: Metadata = {
  title: `${TITLE} | ${SITE_NAME}`,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}${PATH}` },
  openGraph: { title: TITLE, description: DESCRIPTION, url: `${SITE_URL}${PATH}`, siteName: SITE_NAME, type: 'article', locale: 'ja_JP', images: [{ url: ogImageUrl(TITLE), width: 1200, height: 630, alt: TITLE }] },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, images: [ogImageUrl(TITLE)] },
};

const S = {
  shorui: { name: 'GMOあおぞらネット銀行「事業内容確認書類について」', url: 'https://gmo-aozora.com/business/account/identification-companyprofile.html' },
  faq1219: { name: 'GMOあおぞらネット銀行 よくある質問「法人口座を開設したいのですが、開設できない場合はありますか？」', url: 'https://help.gmo-aozora.com/faqs/1219' },
  faq1316: { name: 'GMOあおぞらネット銀行 よくある質問（提出書類に不備があると連絡が届いた場合）', url: 'https://help.gmo-aozora.com/faqs/1316' },
  faq1317: { name: 'GMOあおぞらネット銀行 よくある質問（法人口座開設の必要書類の確認方法と提出先）', url: 'https://help.gmo-aozora.com/faqs/1317' },
  faq1514: { name: 'GMOあおぞらネット銀行 よくある質問「口座開設の審査は、どのくらい時間がかかりますか。」', url: 'https://help.gmo-aozora.com/faqs/1514' },
  raksul33: { name: 'ラクスルバンク よくあるご質問（審査にかかる時間）', url: 'https://support.raksulbank.com/faq/show/33?site_domain=default' },
} as const;
type K = keyof typeof S;

const KIROKU = [
  { d: '10/28', t: '合同会社を設立（資本金50万円・本店はバーチャルオフィス）', ok: null },
  { d: '11/7', t: 'GMOあおぞらネット銀行に法人口座を申込', ok: null },
  { d: '11/10', t: 'メールで結果。口座の開設は見合わせ', ok: false },
  { d: '11/12', t: 'ドコモSMTBネット銀行と PayPay銀行に申込', ok: null },
  { d: '11/16', t: 'ドコモSMTBネット銀行は通らず', ok: false },
  { d: '11/16', t: 'PayPay銀行の審査に通過（設立から19日）', ok: true },
] as const;

/** 私たちが出したもの × 公式の案内（「事業内容確認書類について」） */
const DASHITA = [
  { h: 'Google アドセンスの明細（個人の名義）', kekka: '書類の種類は、公式の例「売上・仕入・活動状況が客観的に確認できる書類」（アフィリエイト広告などの管理画面の画像）に当たる。ただし名義は個人', ng: null },
  { h: 'アクセストレードの明細（個人の名義）', kekka: '書類の種類は同じく「売上・仕入・活動状況が客観的に確認できる書類」に当たる。ただし名義は個人', ng: null },
  { h: 'ホームページ（公開1年以上）', kekka: '公式の例「ホームページなど」。条件の「集客目的での運営実績3カ月以上」を満たす', ng: false },
  { h: '請求書・発注書', kekka: '法人として出したことも受け取ったこともなく、出していない', ng: null },
];

/** 公式が挙げる確認書類（審査が進みやすい順。公式の並びのまま） */
const OSUSUME = [
  '各行政機関発行の許認可証',
  '締結・調印済みの各種契約書の一式',
  'ホームページなど',
  '他社発行の請求書、発注書、納品書など',
  '自社発行の請求書、納品書など＋その入出金が確認できる口座明細など',
  '会社案内、パンフレット、チラシ',
  '他社への提案資料、商品企画書',
  '売上・仕入・活動状況が客観的に確認できる書類',
  '事業計画書（書類が用意できない方）',
];

const FAQS = [
  { q: 'GMOあおぞらネット銀行は、審査に落ちた理由を教えてくれますか？', a: '教えてもらえません。公式のよくある質問で、口座開設の審査結果の詳細は開示していないとしています。私たちに届いた結果のメールにも、審査内容には答えられないと書かれていました。' },
  { q: '法人口座の審査には何日かかりますか？', a: '公式では、本人確認をマイナンバーカードの読み取りか自撮りの動画で行うと最短当日、書類のアップロードか郵送だと1週間ほどとしています。私たちは11月7日に申し込み、11月10日にメールで結果が届きました。' },
  { q: '履歴事項全部証明書は、事業内容の書類になりますか？', a: 'なりません。公式の「事業内容確認書類について」では、履歴事項全部証明書・定款・法人設立届出書などを「事業の売上に直接関係しない書類」として、「受付できない書類の例」に挙げています。' },
  { q: 'アフィリエイトの明細は、事業内容の書類になりますか？', a: '公式の案内では、「売上・仕入・活動状況が客観的に確認できる書類」の例に、アフィリエイト広告などの管理画面の画像を挙げています。私たちは Google アドセンスとアクセストレードの明細を、どちらも個人の名義のまま出しましたが、審査には通りませんでした。' },
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
    { '@type': 'Article', author: KAKITE_LD, publisher: { '@id': 'https://www.tsuginotenavi.jp/#organization' }, headline: TITLE, description: DESCRIPTION, inLanguage: 'ja', about: { '@type': 'Thing', name: 'GMOあおぞらネット銀行の法人口座の審査' }, mentions: [{ '@type': 'BankOrCreditUnion', name: 'GMOあおぞらネット銀行' }, { '@type': 'BankOrCreditUnion', name: 'PayPay銀行' }], datePublished: '2026-11-25T21:00:00+09:00', dateModified: '2026-11-25T21:00:00+09:00', mainEntityOfPage: `${SITE_URL}${PATH}` },
    { '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: SITE_NAME, item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: '法人成り', item: `${SITE_URL}/guide/houjin` },
      { '@type': 'ListItem', position: 3, name: 'GMOあおぞらネット銀行の法人口座の審査', item: `${SITE_URL}${PATH}` },
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
          <span>GMOあおぞらネット銀行の審査</span>
        </nav>

        <section className="flex flex-col gap-5" aria-labelledby="top">
          <div className="flex flex-col gap-2">
            <p className="text-[13px] font-bold text-sky-700">運営会社の実例</p>
            <h1 id="top" className="text-[26px] font-black leading-tight text-slate-900">GMOあおぞらネット銀行の<br />法人口座、審査に落ちた<br /><span className="text-[19px] text-orange-600">設立10日後の申込と、出した書類</span></h1>
            <KakiteLine />
          </div>
          <ul className="grid grid-cols-3 gap-2" aria-label="実例の数字">
            {[
              { big: '10日後', s: '設立から申込まで' },
              { big: '3日', s: '申込から結果まで' },
              { big: '1年以上', s: 'ホームページの公開から' },
            ].map((k) => (
              <li key={k.s} className="flex flex-col items-center gap-0.5 rounded-2xl bg-white px-2 py-3.5 text-center ring-1 ring-slate-200">
                <span className="text-[24px] font-black leading-none text-orange-600">{k.big}</span>
                <span className="text-[11px] leading-snug text-slate-600">{k.s}</span>
              </li>
            ))}
          </ul>
          <p className="rounded-2xl bg-white p-4 text-[14px] leading-relaxed text-slate-800 ring-1 ring-slate-200">
            <span className="mb-1 block text-[12px] font-black text-sky-700">結論</span>
            落ちた理由は、銀行が教えないので分かりません。出したのは、アフィリエイトの明細2つと公開1年以上のホームページです。書類の種類は公式が挙げる例に当たるものでしたが、明細は2つとも個人の名義でした。それでも3日で見合わせの結果です。設立直後は1行だけに頼らず、ほかの銀行にも同時に申し込める用意をしておくのが、私たちの学びです。
          </p>
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
            <span className="flex flex-col gap-1.5">
              <span className="text-[12px] font-bold text-slate-500">届いた結果のメール（抜き出し）</span>
              <span className="text-[13px] leading-relaxed text-slate-700">「当社で定めた審査基準により、お客さまの口座開設を見合わせることとなりました。」</span>
              <span className="text-[13px] leading-relaxed text-slate-700">「審査内容についてはお答えすることができません」</span>
            </span>
          </div>
          <p className={SRC}>運営会社（BlueAdventures合同会社）の2026年11月の記録</p>
        </section>

        <section className={SECTION} aria-labelledby="dashita">
          <h2 id="dashita" className={H2}>出した書類と公式の案内</h2>
          <p className="text-[13px] leading-relaxed text-slate-700">銀行の案内では、書類で「登記上の会社名・所在地」「事業や商品の具体的な内容」「今、実際に事業をしていること」を確かめます。書類の不備の主な原因は、「現在、実際にどのような事業活動を行われているのかが分からない」ことだとしています。</p>
          <ul className="grid gap-2">
            {DASHITA.map((d) => (
              <li key={d.h} className="flex items-start gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-slate-200">
                {d.ng === false ? <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-sky-700" aria-hidden="true" /> : <FileText size={20} className="mt-0.5 shrink-0 text-slate-400" aria-hidden="true" />}
                <span className="flex flex-1 flex-col gap-0.5">
                  <span className="text-[15px] font-black text-slate-900">{d.h}</span>
                  <span className="text-[13px] leading-relaxed text-slate-600">{d.kekka}</span>
                </span>
              </li>
            ))}
          </ul>
          <p className="flex items-start gap-2 text-[13px] leading-relaxed text-slate-700"><Info size={18} className="mt-0.5 shrink-0 text-sky-700" aria-hidden="true" />銀行の案内では、確認書類は口座を開く法人の名前が書かれたものに限り、代表者個人の名前の書類は受け付けないとしています。一方で、設立間もない会社が、個人事業主のころから同じ事業をしていた場合は、そのころの書類に準ずるものを出すよう案内しています。私たちが出した明細は、2つとも個人の名義でした。これが落ちた理由だったかは分かりません。</p>
          <p className={SRC}>出典：{src(['shorui', 'faq1316', 'faq1317'])}（{CHECKED} 確認）</p>
        </section>

        <section className={SECTION} aria-labelledby="osusume">
          <h2 id="osusume" className={H2}>公式が挙げる事業内容の書類</h2>
          <p className="text-[13px] leading-relaxed text-slate-700">審査が進みやすい順に並んでいます。いくつか持っているなら、上から2〜3点を出すよう勧めています。</p>
          <ol className="grid gap-1.5">
            {OSUSUME.map((o, i) => (
              <li key={o} className="flex items-start gap-3 rounded-xl bg-white px-3.5 py-2.5 ring-1 ring-slate-200">
                <span className="w-5 shrink-0 text-[13px] font-black text-sky-700">{i + 1}</span>
                <span className="text-[13px] leading-relaxed text-slate-800">{o}</span>
              </li>
            ))}
          </ol>
          <div className="flex flex-col gap-2 rounded-2xl bg-sky-50 p-4 ring-1 ring-sky-200">
            <span className="text-[15px] font-black text-slate-900">設立直後で、まだ準備の段階なら</span>
            <span className="text-[13px] leading-relaxed text-slate-700">銀行の案内では、2点以上を同時に出すと要件を満たしやすいとしています。</span>
            <span className="flex items-start gap-2 text-[13px] leading-relaxed text-slate-700"><FileText size={18} className="mt-0.5 shrink-0 text-sky-700" aria-hidden="true" /><span><b>1点目</b>：会社案内・商品企画書・事業計画書、これから使う契約書や請求書のひな型など</span></span>
            <span className="flex items-start gap-2 text-[13px] leading-relaxed text-slate-700"><MessageSquare size={18} className="mt-0.5 shrink-0 text-sky-700" aria-hidden="true" /><span><b>2点目</b>：事業に関するメールや LINE のやり取りの画面を撮った画像など</span></span>
          </div>
          <p className={SRC}>出典：{src(['shorui'])}（{CHECKED} 確認）</p>
        </section>

        <section className={SECTION} aria-labelledby="nissu">
          <h2 id="nissu" className={H2}>審査の日数</h2>
          <ul className="grid gap-2">
            {[
              { h: 'マイナンバーカードの読み取り・自撮りの動画', s: '最短当日' },
              { h: '書類のアップロード・郵送', s: '1週間ほど' },
              { h: '私たちの場合（11/7 土曜に申込）', s: '土日を挟んで3日' },
            ].map((n) => (
              <li key={n.h} className="flex items-center gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-slate-200">
                <Clock size={20} className="shrink-0 text-sky-700" aria-hidden="true" />
                <span className="flex-1 text-[13px] text-slate-700">{n.h}</span>
                <span className="text-[15px] font-black text-slate-900">{n.s}</span>
              </li>
            ))}
          </ul>
          <p className={SRC}>出典：{src(['faq1514'])}（{CHECKED} 確認）。土日祝や申込が多いときは延びるとしています</p>
        </section>

        <section className={SECTION} aria-labelledby="tsugi">
          <h2 id="tsugi" className={H2}>落ちたあとにしたこと</h2>
          <p className="text-[13px] leading-relaxed text-slate-700">結果の2日後に、ドコモSMTBネット銀行と PayPay銀行に同時に申し込みました。ドコモSMTBネット銀行は通りませんでした。PayPay銀行は、申込の住所が登記と違って一度止まりましたが、申し込み直して設立から19日で審査に通りました。</p>
          <p className="text-[13px] leading-relaxed text-slate-700">GMOあおぞらネット銀行にもう一度申し込めるかは、銀行に確かめてください。</p>
          <div className="grid gap-2">
            <Link href="/guide/houjin/paypay-houjin-kouza" className="flex items-center gap-3 rounded-2xl border-2 border-sky-200 bg-sky-50/60 p-3.5 hover:border-sky-300">
              <Landmark size={22} className="shrink-0 text-sky-700" aria-hidden="true" />
              <span className="flex flex-1 flex-col"><span className="text-[15px] font-black text-slate-900">PayPay銀行の法人口座</span><span className="text-[12px] text-slate-600">設立直後でも審査に通った実例</span></span>
              <ArrowRight size={18} className="text-sky-700" aria-hidden="true" />
            </Link>
            <Link href="/guide/houjin/kouza-tsukurenai" className="flex items-center gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-slate-200 hover:ring-slate-300">
              <XCircle size={22} className="shrink-0 text-sky-700" aria-hidden="true" />
              <span className="flex flex-1 flex-col"><span className="text-[15px] font-black text-slate-900">法人口座が作れない</span><span className="text-[12px] text-slate-600">3行に申し込んだ記録と、申込前のチェック表</span></span>
              <ArrowRight size={18} className="text-sky-700" aria-hidden="true" />
            </Link>
          </div>
          {hasExit && (
            <HoujinExit
              lpId={LP_ID} partner="raksulBank" position="tsugi" lead="これから申し込む会社の申込先に"
              note="ラクスルバンクの審査は、GMOあおぞらネット銀行が行います。GMOあおぞらネット銀行で落ちたあとに、ラクスルバンクで通るかは分かりません。まだどこにも申し込んでいない会社が、申込先の一つとして考えるための紹介です。"
            />
          )}
          {hasExit && <p className={SRC}>出典：{src(['raksul33'])}</p>}
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
          <p className={`${SRC} mt-1`}>出典：{src(['faq1219', 'faq1514', 'shorui'])}（{CHECKED} 確認）</p>
        </section>

        <nav aria-label="あわせて読む" className="flex flex-col gap-2">
          {[
            { href: '/guide/houjin', t: '法人口座の開設（まとめ）', s: '設立直後にネット銀行3つに申し込んだ記録' },
            { href: '/guide/houjin/kouza-hitsuyou-shorui', t: '法人口座の必要書類', s: '銀行4つの比較と、設立直後の事業内容の資料' },
            { href: '/guide/houjin/raksulbank', t: 'ラクスルバンク', s: '審査はGMOあおぞら。手数料と申し込める会社' },
          ].map((l) => (
            <Link key={l.href} href={l.href} className="flex items-center gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-slate-200 hover:ring-slate-300">
              <span className="flex flex-1 flex-col"><span className="text-[15px] font-black text-slate-900">{l.t}</span><span className="text-[12px] text-slate-600">{l.s}</span></span>
              <ArrowRight size={18} className="text-sky-700" aria-hidden="true" />
            </Link>
          ))}
        </nav>

        <KakiteNote />
        <p className="text-[11px] leading-relaxed text-slate-400">
          審査の案内と書類の条件は、GMOあおぞらネット銀行の公式の記載（{CHECKED} 確認）をもとにしています。銀行は案内を変えることがあり、審査の結果は会社ごとに違います。落ちた理由は銀行が開示しないため、このページは理由を決めつけていません。実例は運営会社（BlueAdventures合同会社）の2026年11月の申込です。最終更新：2026年11月25日
        </p>
      </main>
      <LpFooter />
    </div>
  );
}
