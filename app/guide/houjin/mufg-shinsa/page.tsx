import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, CalendarClock, CheckCircle2, FileText, Info, Mail, Monitor, Target, Upload, UserRound, Video, Wallet, XCircle, Briefcase } from 'lucide-react';
import LpHeader from '@/components/lp/LpHeader';
import LpFooter from '@/components/lp/LpFooter';
import LpViewTracker from '@/components/lp/LpViewTracker';
import { KakiteLine, KakiteNote, KAKITE_LD } from '@/components/houjin/Kakite';
import HoujinExit from '@/components/houjin/HoujinExit';
import { SITE_URL, SITE_NAME, ogImageUrl } from '@/components/loan/LoanArticle';
import { HOUJIN_PARTNERS } from '@/lib/houjin/partners';

/**
 * 三菱UFJ銀行の法人口座の開設は難しい？（2026-11-27 作成。houjin-plan.md B14。体験のない銀行）。
 * 運営会社は三菱UFJ銀行には申し込んでいないので、体験したふりはしない。
 * 受ける言葉（キーワードプランナー 11/27）：三菱UFJ 法人口座 開設 難しい 210（競合性 低）。あわせて「三菱UFJ 法人口座 審査落ち」。
 * 上位（11/27、Chrome）：「開設 難しい」は Wise・税理士事務所・三菱UFJ銀行3・バーチャルオフィスの会社・行政書士・note（銀行3＋大手1）。
 *   「審査落ち」は銀行の自社ページ0で、税理士・知恵袋・X・ポイントサイト・個人のブログ。
 *   関連する質問：開設は難しいか／開設できない理由／必要な書類。
 *   上位に欠けている点：①銀行が聞く3つ（主たる事業・口座開設目的・実質的支配者）を公式の文で並べたもの
 *   ②同時申込のインターネットバンキングが月1,760円（最初の3か月無料）で、1人会社には年の費用になること
 *   ③申込から開設まで1か月〜1か月半、6か月更新がないと申込が消えること ④3つの銀行に申し込んだ日付つきの実例
 * 一次情報（11/27 確認）：三菱UFJ銀行「法人口座開設」「WEBでの法人口座のお申し込みにあたって」「法人口座を開設されるお客さまへ」、WEB法人口座開設のよくあるご質問。
 * 出口：ラクスルバンク（審査は GMOあおぞらネット銀行。私たちはそこで落ちたと正直に書く）。
 */
const LP_ID = 'guide-houjin-mufg-shinsa';
const PATH = '/guide/houjin/mufg-shinsa';
const CHECKED = '2026/11/27';
const TITLE = '三菱UFJ銀行の法人口座の開設は難しい？審査で聞かれる3つと開設までの期間';
const DESCRIPTION = '三菱UFJ銀行の法人口座の開設は難しいのか、審査に落ちたら何を見直すか。銀行が聞く3つ（主たる事業・口座開設目的・実質的支配者）、追加で求められることがある資料、開設まで1か月〜1か月半、同時に申し込むインターネットバンキングの月額を公式の記載からまとめました。三菱UFJ以外の3つの銀行に申し込んだ実例つき。';

export const metadata: Metadata = {
  title: `${TITLE} | ${SITE_NAME}`,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}${PATH}` },
  openGraph: { title: TITLE, description: DESCRIPTION, url: `${SITE_URL}${PATH}`, siteName: SITE_NAME, type: 'article', locale: 'ja_JP', images: [{ url: ogImageUrl(TITLE), width: 1200, height: 630, alt: TITLE }] },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, images: [ogImageUrl(TITLE)] },
};

const S = {
  kaisetsu: { name: '三菱UFJ銀行「法人口座開設」', url: 'https://www.bk.mufg.jp/houjin/kouza_kaisetu.html' },
  flow: { name: '三菱UFJ銀行「WEBでの法人口座のお申し込みにあたって」', url: 'https://www.bk.mufg.jp/houjin/kouza_kaisetu/flow.html' },
  info: { name: '三菱UFJ銀行「法人口座を開設されるお客さまへ」', url: 'https://www.bk.mufg.jp/info/houjin_kouza.html' },
  faq: { name: '三菱UFJ銀行「WEB法人口座開設に関するよくあるご質問」', url: 'https://houjin-services.bk.mufg.jp/FAQList' },
  raksul1293: { name: 'ラクスルバンク よくあるご質問「口座開設の際、必要書類は何を提出すればいいですか。」', url: 'https://support.raksulbank.com/faq/show/1293?site_domain=default' },
  gmoTokuyaku: { name: 'GMOあおぞらネット銀行「ラクスルバンク支店に関する特約」', url: 'https://gmo-aozora.com/provision/pdf/raksul_260816.pdf' },
} as const;
type K = keyof typeof S;

const KIKARERU = [
  { icon: Briefcase, h: '主たる事業（会社のおもな事業）', s: '履歴事項全部証明書（登記簿謄本）の事業目的が多岐にわたる場合は、その内容の説明も' },
  { icon: Target, h: '口座開設目的', s: '事業内容も踏まえて、口座を何に使うか' },
  { icon: UserRound, h: '実質的支配者', s: '議決権の25%超を直接または間接に持つなど、支配的な影響力があると認められる個人の氏名・住所・生年月日など' },
] as const;

const TSUIKA = ['会社案内', '製品カタログ', 'パンフレット', '取引先向けの提案書', '見積書', '注文書', '仕様書'];

const NAGARE = [
  { icon: Mail, h: '申し込み登録', s: '初回パスワードの設定用のアドレスがメールで届く。24時間以内に設定' },
  { icon: Upload, h: '申込情報の入力と書類のアップロード', s: '許認可が済んだことが分かる資料や、委任状が要る場合あり' },
  { icon: Video, h: '取引担当者とのウェブ面談', s: 'カメラのついたパソコンかスマートフォンが必要' },
  { icon: FileText, h: '書類の受け取りと返送', s: '' },
  { icon: CheckCircle2, h: '開設', s: '通帳・キャッシュカードを受け取る' },
] as const;

const TENTOU = ['個人事業主', '組合・任意団体（業界団体・サークルなど）', '同じ支店で2つ目以降の法人口座', '国外法人（外国企業の日本法人・日本支店は除く）'];

const GINKO = [
  { href: '/guide/houjin/gmo-aozora-shinsa', bank: 'GMOあおぞらネット銀行', when: '11/7 申込 → 11/10 見合わせのメール', ok: false },
  { href: '/guide/houjin/docomo-smtb-shinsa', bank: 'ドコモSMTBネット銀行（旧 住信SBIネット銀行）', when: '11/12 申込 → 11/16 見合わせのメール', ok: false },
  { href: '/guide/houjin/paypay-houjin-kouza', bank: 'PayPay銀行', when: '11/12 申込 → 11/13 法人の住所に自宅を入れていたため、登記の本店と合わずに止まる → 登記どおりに申し込み直し → 11/16 通過', ok: true },
] as const;

const FAQS = [
  { q: '三菱UFJ銀行の法人口座の開設は難しいですか？', a: '確かめた三菱UFJ銀行の案内には審査の基準が書かれていないので、難しいかどうかは一概に言えません。三菱UFJ銀行は、提出書類にもとづいて内容を確認し、相談の内容によっては口座開設を断ることもあるとしています。申込の中では、主たる事業・口座開設目的・実質的支配者を聞かれ、会社案内や見積書などの追加の資料を求められることがあります。' },
  { q: '三菱UFJ銀行の法人口座は、開設までどのくらいかかりますか？', a: 'ウェブの申込では、申し込み登録から口座開設まで1か月〜1か月半としています。申込の手続きを終えないまま6か月間何も更新しないと、申込の内容は削除されます。' },
  { q: '三菱UFJ銀行の審査に落ちたら、次は何をすればいいですか？', a: '断った理由を伝えるかどうかは、確かめた三菱UFJ銀行の案内には書かれていませんでした。銀行が聞く3つ（主たる事業・口座開設目的・実質的支配者）を説明できるか、追加で求められることがある資料を用意できるかを見直し、ほかの銀行への申込も進めます。私たちは（三菱UFJ銀行ではなく）GMOあおぞらネット銀行で落ちた2日後に、ドコモSMTBネット銀行とPayPay銀行へ同じ日に申し込み、PayPay銀行で通りました。' },
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
    { '@type': 'Article', author: KAKITE_LD, publisher: { '@id': 'https://www.tsuginotenavi.jp/#organization' }, headline: TITLE, description: DESCRIPTION, inLanguage: 'ja', about: { '@type': 'Thing', name: '三菱UFJ銀行の法人口座の審査' }, mentions: [{ '@type': 'BankOrCreditUnion', name: '三菱UFJ銀行' }], datePublished: '2026-11-27T13:00:00+09:00', dateModified: '2026-11-27T13:00:00+09:00', mainEntityOfPage: `${SITE_URL}${PATH}` },
    { '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: SITE_NAME, item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: '法人成り', item: `${SITE_URL}/guide/houjin` },
      { '@type': 'ListItem', position: 3, name: '三菱UFJ銀行の法人口座の審査', item: `${SITE_URL}${PATH}` },
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
          <span>三菱UFJ銀行の審査</span>
        </nav>

        <section className="flex flex-col gap-5" aria-labelledby="top">
          <div className="flex flex-col gap-2">
            <p className="text-[13px] font-bold text-sky-700">公式の案内と、ほかの銀行での私たちの実例</p>
            <h1 id="top" className="text-[26px] font-black leading-tight text-slate-900">三菱UFJ銀行の<br />法人口座の開設は<br />難しい？<br /><span className="text-[19px] text-orange-600">審査で聞かれる3つと開設までの期間</span></h1>
            <KakiteLine />
          </div>
          <ul className="grid grid-cols-3 gap-2" aria-label="公式の要点">
            {[
              { big: '3つ', s: '申込で聞かれること' },
              { big: '1〜1.5か月', s: '申込から開設までの目安' },
              { big: '月1,760円', s: '同時申込のネットバンキング' },
            ].map((k) => (
              <li key={k.s} className="flex flex-col items-center gap-0.5 rounded-2xl bg-white px-2 py-3.5 text-center ring-1 ring-slate-200">
                <span className="text-[19px] font-black leading-none text-orange-600">{k.big}</span>
                <span className="text-[11px] leading-snug text-slate-600">{k.s}</span>
              </li>
            ))}
          </ul>
          <p className="rounded-2xl bg-white p-4 text-[14px] leading-relaxed text-slate-800 ring-1 ring-slate-200">
            <span className="mb-1 block text-[12px] font-black text-sky-700">結論</span>
            確かめた三菱UFJ銀行の案内には審査の基準が書かれていないので、難しいかどうかは一概に言えません。三菱UFJ銀行は、申込の中で主たる事業・口座開設目的・実質的支配者を聞き、会社案内や見積書などの追加の資料を求めることがあるとしています。審査に落ちたら、この3つを説明できるか、追加で求められる資料を出せるかを見直し、あわせてほかの銀行にも申し込みます。
          </p>
          <p className="flex items-start gap-2 text-[12px] leading-relaxed text-slate-600"><Info size={16} className="mt-0.5 shrink-0 text-sky-700" aria-hidden="true" /><span>私たちは三菱UFJ銀行には申し込んでいません。このページの三菱UFJ銀行の案内は、公式の記載だけをもとにしています。</span></p>
        </section>

        <section className={SECTION} aria-labelledby="kikareru">
          <h2 id="kikareru" className={H2}>審査の中で聞かれる3つ</h2>
          <ol className="grid gap-2">
            {KIKARERU.map((k, i) => (
              <li key={k.h} className="flex items-start gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-slate-200">
                <k.icon size={20} className="mt-0.5 shrink-0 text-sky-700" aria-hidden="true" />
                <span className="flex flex-col gap-0.5"><span className="text-[14px] font-black text-slate-900">{i + 1}. {k.h}</span><span className="text-[12px] leading-relaxed text-slate-600">{k.s}</span></span>
              </li>
            ))}
          </ol>
          <div className="flex flex-col gap-2 rounded-2xl bg-amber-50 p-4 ring-1 ring-amber-200">
            <span className="text-[14px] font-black text-amber-900">追加で求められることがある資料（例）</span>
            <ul className="flex flex-wrap gap-1.5">
              {TSUIKA.map((d) => <li key={d} className="rounded-full bg-white px-3 py-1 text-[12px] text-slate-700 ring-1 ring-amber-200">{d}</li>)}
            </ul>
            <p className="text-[13px] leading-relaxed text-slate-800">許認可などが要る事業は、それが済んでいることが分かる資料も求められます。提示した資料の内容を確かめるため、回答まで数日かかるとしています（「法人口座を開設されるお客さまへ」、2023年11月1日現在の案内）。</p>
          </div>
          <p className="text-[13px] leading-relaxed text-slate-700">三菱UFJ銀行は、提出書類にもとづいて内容を確認し、相談の内容によっては口座開設を断ることもあるとしています。</p>
          <p className="flex items-start gap-2 text-[13px] leading-relaxed text-slate-700"><Info size={18} className="mt-0.5 shrink-0 text-sky-700" aria-hidden="true" /><span>私たちは設立直後、法人の名前で請求書や発注書（注文書）を出したことも、受け取ったこともありませんでした。同じ状態の会社は、見積書や注文書がまだない場合があります。</span></p>
          <p className={SRC}>出典：{src(['kaisetsu', 'info', 'faq'])}（{CHECKED} 確認）</p>
        </section>

        <section className={SECTION} aria-labelledby="shorui">
          <h2 id="shorui" className={H2}>必要な書類</h2>
          <ol className="grid gap-1.5">
            {['履歴事項全部証明書（発行から6か月以内）', '法人の印鑑証明書（発行から6か月以内）', '取引担当者の公的な本人確認資料（運転免許証・個人番号カードなど）'].map((h, i) => (
              <li key={h} className="flex items-start gap-3 rounded-xl bg-white px-3.5 py-2.5 ring-1 ring-slate-200">
                <span className="w-[18px] shrink-0 text-[13px] font-black text-sky-700">{i + 1}</span>
                <span className="text-[13px] leading-relaxed text-slate-800">{h}</span>
              </li>
            ))}
          </ol>
          <p className="text-[13px] leading-relaxed text-slate-700">代表者以外の株主や役員などに、事業活動に支配的な影響力がある人がいる場合は、実質的支配者を確認できる資料（実質的支配者リストの写し・株主名簿など）も出します。代表者以外が手続きするときは委任状などが要ります。出した書類は、原本も返却されません。</p>
          <p className={SRC}>出典：{src(['kaisetsu', 'flow'])}（{CHECKED} 確認）</p>
        </section>

        <section className={SECTION} aria-labelledby="nagare">
          <h2 id="nagare" className={H2}>ウェブで申し込んだときの流れ</h2>
          <div className="flex items-center gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-slate-200">
            <CalendarClock size={22} className="shrink-0 text-sky-700" aria-hidden="true" />
            <span className="text-[14px] font-black text-slate-900">申し込み登録から開設まで1か月〜1か月半</span>
          </div>
          <ol className="grid gap-2">
            {NAGARE.map((n, i) => (
              <li key={n.h} className="flex items-start gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-slate-200">
                <n.icon size={20} className="mt-0.5 shrink-0 text-sky-700" aria-hidden="true" />
                <span className="flex flex-col gap-0.5"><span className="text-[14px] font-black text-slate-900">{i + 1}. {n.h}</span>{n.s && <span className="text-[12px] leading-relaxed text-slate-600">{n.s}</span>}</span>
              </li>
            ))}
          </ol>
          <p className="text-[13px] leading-relaxed text-slate-700">申込の手続きを終えないまま6か月間何も更新しないと、申込の内容は削除されます。口座開設の対応は、三菱UFJ銀行の100%子会社のエム・ユー・センターサービス東京が担当します。</p>
          <p className={SRC}>出典：{src(['flow'])}（{CHECKED} 確認）</p>
        </section>

        <section className={SECTION} aria-labelledby="hiyou">
          <h2 id="hiyou" className={H2}>同時に申し込むサービスの費用</h2>
          <div className="grid gap-2">
            {[
              { icon: Monitor, h: 'インターネットバンキング（BizSTATION）', s: '月額1,760円（税込）。最初の3か月は無料' },
              { icon: Wallet, h: 'ビジネスデビットカード', s: '年会費無料' },
              { icon: Briefcase, h: 'MUFG Biz', s: '無料（一部、有料の追加サービスあり）' },
            ].map((c) => (
              <div key={c.h} className="flex items-start gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-slate-200">
                <c.icon size={20} className="mt-0.5 shrink-0 text-sky-700" aria-hidden="true" />
                <span className="flex flex-col gap-0.5"><span className="text-[14px] font-black text-slate-900">{c.h}</span><span className="text-[12px] leading-relaxed text-slate-600">{c.s}</span></span>
              </div>
            ))}
          </div>
          <p className="text-[13px] leading-relaxed text-slate-700">ウェブで普通預金口座を開くときは、この3つを同時に申し込みます。インターネットバンキングは、1人の会社でも1年目は1,760円×9か月で15,840円、2年目からは年21,120円（いずれも税込）です。ほかに、2年以上使っていない普通預金口座は年1,320円（税込）、紙の通帳を使う口座は年550円（税込。通帳の代わりに取引の照合表を受け取る口座の種類ならかかりません）の手数料があります。</p>
          <p className={SRC}>出典：{src(['flow', 'kaisetsu'])}（{CHECKED} 確認）</p>
        </section>

        <section className={SECTION} aria-labelledby="tentou">
          <h2 id="tentou" className={H2}>店頭での申込になる場合</h2>
          <ul className="flex flex-wrap gap-1.5">
            {TENTOU.map((t) => <li key={t} className="rounded-full bg-white px-3 py-1 text-[12px] text-slate-700 ring-1 ring-slate-200">{t}</li>)}
          </ul>
          <p className="text-[13px] leading-relaxed text-slate-700">どれかに当てはまる場合は、ウェブでは申し込めず、店頭での申込になります。</p>
          <p className={SRC}>出典：{src(['kaisetsu'])}（{CHECKED} 確認）</p>
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
          <p className="text-[13px] leading-relaxed text-slate-700">1つ目で落ちた2日後に、2つの銀行へ同じ日に申し込みました。通ったのはPayPay銀行で、11月16日、設立から19日後です。落ちた2つの銀行は、どちらも理由の説明がありませんでした。何が原因だったかは分かりません。</p>
          <p className={SRC}>運営会社（BlueAdventures合同会社、2026年10月28日設立・本店はバーチャルオフィス）の2026年11月の記録</p>
          {hasExit && (
            <HoujinExit
              lpId={LP_ID} partner="raksulBank" position="jitsurei" lead="三菱UFJ銀行のほかに申し込む先の候補"
              note="ラクスルバンクは、設立したばかりで取引の書類がまだない会社が出せる書類として、代表者が署名・捺印した事業計画書を挙げています（これを出せば通るとは限りません）。口座はGMOあおぞらネット銀行のラクスルバンク支店で、審査もGMOあおぞらネット銀行が行います。私たちはGMOあおぞらネット銀行に直接申し込んで落ちています。GMOあおぞらネット銀行で落ちたことがある会社は、同じ銀行の審査になると知ったうえで選んでください。"
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
          <p className={`${SRC} mt-1`}>出典：{src(['faq', 'kaisetsu', 'info', 'flow'])}（{CHECKED} 確認）・運営会社の2026年11月の記録</p>
        </section>

        <nav aria-label="あわせて読む" className="flex flex-col gap-2">
          {[
            { href: '/guide/houjin/shinsa-ochita-tsugi', t: '法人口座の審査に落ちたら次は', s: '落ちたあとにすること4つと、3つの銀行の結果' },
            { href: '/guide/houjin/mizuho-shinsa', t: 'みずほ銀行の審査に落ちたら', s: '公式が挙げる4つの確認点と申込の流れ' },
            { href: '/guide/houjin/smbc-shinsa', t: '三井住友銀行の審査に落ちたら', s: 'Trunk の必要書類と見直す点' },
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
          三菱UFJ銀行の案内は、公式の記載（{CHECKED} 確認）をもとにしています。運営会社は三菱UFJ銀行には申し込んでいません。銀行は案内を変えることがあり、審査の結果は会社ごとに違います。実例は運営会社（BlueAdventures合同会社）の2026年11月の申込です。最終更新：2026年11月27日
        </p>
      </main>
      <LpFooter />
    </div>
  );
}
