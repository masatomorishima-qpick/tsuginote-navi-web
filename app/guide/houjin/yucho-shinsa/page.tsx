import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, CalendarClock, CheckCircle2, FileText, Info, SearchCheck, Store, XCircle } from 'lucide-react';
import LpHeader from '@/components/lp/LpHeader';
import LpFooter from '@/components/lp/LpFooter';
import LpViewTracker from '@/components/lp/LpViewTracker';
import { KakiteLine, KakiteNote, KAKITE_LD } from '@/components/houjin/Kakite';
import HoujinExit from '@/components/houjin/HoujinExit';
import { SITE_URL, SITE_NAME, ogImageUrl } from '@/components/loan/LoanArticle';
import { HOUJIN_PARTNERS } from '@/lib/houjin/partners';

/**
 * ゆうちょ銀行の法人口座の審査に落ちたら（2026-11-25 作成。houjin-plan.md B9。体験のない銀行。オーナー了承 11/25「OK」）。
 * 運営会社はゆうちょ銀行には申し込んでいないので、体験したふりはしない。
 * 受ける言葉（キーワードプランナー 11/25）：ゆうちょ 法人口座 審査落ち 90。
 * 上位（11/25 22:30、Google「ゆうちょ 法人口座 審査 落ちた」）：税理士事務所2・実録ブログ・知恵袋・紹介サイト・会社設立の会社・Wise。
 *   銀行の自社ページは0件、大手は Wise 1件。関連する質問：落ちたらどうすればいい／ゆうちょの法人口座の短所。
 *   上位に欠けている点：①公式の書類11項目のうち、設立1年以下の合同会社に当てはまる書類（出資者名簿・試算表と事業計画書・設立届出書の控など）
 *   ②書類が出せないと申込を受け付けないこと ③審査は1か月程度、3〜6月は2か月程度 ④3つの銀行に申し込んだ日付つきの実例へのつなぎ
 * 一次情報（11/25 確認）：ゆうちょ銀行「法人口座を開設されるお客さまへ」。
 * 出口：ラクスルバンク（審査は GMOあおぞらネット銀行。私たちはそこで落ちたと正直に書く）。
 */
const LP_ID = 'guide-houjin-yucho-shinsa';
const PATH = '/guide/houjin/yucho-shinsa';
const CHECKED = '2026/11/25';
const TITLE = 'ゆうちょ銀行の法人口座の審査に落ちたら｜公式の必要書類11項目と見直す点';
const DESCRIPTION = 'ゆうちょ銀行の法人口座の審査に落ちたときに見直す点。公式の必要書類は11項目で、出せないと申込を受け付けないとしています。設立1年以下の合同会社に当てはまる書類、審査は1か月程度（3〜6月は2か月程度）のことも公式の記載から。ゆうちょ銀行以外の3つの銀行に申し込んだ運営会社の実例つき。';

export const metadata: Metadata = {
  title: `${TITLE} | ${SITE_NAME}`,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}${PATH}` },
  openGraph: { title: TITLE, description: DESCRIPTION, url: `${SITE_URL}${PATH}`, siteName: SITE_NAME, type: 'article', locale: 'ja_JP', images: [{ url: ogImageUrl(TITLE), width: 1200, height: 630, alt: TITLE }] },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, images: [ogImageUrl(TITLE)] },
};

const S = {
  yucho: { name: 'ゆうちょ銀行「法人口座を開設されるお客さまへ」', url: 'https://www.jp-bank.japanpost.jp/kaisetu/kat_hojin.html' },
  raksul33: { name: 'ラクスルバンク よくあるご質問「口座開設の審査にはどれくらいの時間がかかりますか？」', url: 'https://support.raksulbank.com/faq/show/33?site_domain=default' },
  gmoTokuyaku: { name: 'GMOあおぞらネット銀行「ラクスルバンク支店に関する特約」', url: 'https://gmo-aozora.com/provision/pdf/raksul_260816.pdf' },
} as const;
type K = keyof typeof S;

/** 公式の11項目（要点）。godo は設立1年以下の合同会社で何を出すか */
const SHORUI = [
  { h: '履歴事項全部証明書（原本・発行から6か月以内）', godo: '' },
  { h: '来店する人の顔写真つきの本人確認書類', godo: '' },
  { h: '来店する人と法人の関係が分かる書類（委任状など）', godo: '' },
  { h: '許認可などが要る業種なら、その写し', godo: '建設・飲食・不動産・古物・中古車販売・介護など、公式が挙げる業種だけ' },
  { h: '法人番号が分かる書類（法人番号通知書など）', godo: '' },
  { h: '法人の印鑑証明書（原本・発行から6か月以内）', godo: '' },
  { h: '実質的支配者が分かる書類', godo: '合同会社は出資者名簿など（出資金額や出資割合が分かるもの）' },
  { h: '財務状況が分かる書類', godo: '設立1年以下で決算書類がなければ、合計残高試算表（または直近1か月分の総勘定元帳）と事業計画書の両方' },
  { h: '設立6か月以内なら、次のどれか', godo: '税務署あての法人設立届出書（控）・青色申告承認申請書（控）・事務所の建物の登記簿か賃貸借契約書（法人が契約しているもの）' },
  { h: '代表者などが外国籍なら、在留カードの写し', godo: '' },
  { h: '事業内容が分かる書類', godo: '会社案内・商品のパンフレット・印刷したホームページ・契約書・請求書など' },
];

const MINAOSHI = [
  { icon: FileText, h: '当てはまる書類の抜け', s: '公式は、書類が出せない場合は申込を受け付けないとしています。設立1年以下の合同会社は、出資者名簿・試算表と事業計画書・設立届出書の控などがそろっているかを確かめます。' },
  { icon: SearchCheck, h: '申込の内容と登記', s: '社名（英字の表記も）・住所・設立年月日が、登記と1文字も違わないかを照らし合わせます。私たちは、ドコモSMTBネット銀行の申込で社名の英字が1文字抜けていました。PayPay銀行の申込では住所に自宅を入れて登記と違い、手続きが止まったので申し込み直しました。' },
  { icon: CalendarClock, h: '待つ時間', s: '審査は1か月程度で、3〜6月は2か月程度かかる場合があると公式は書いています。ゆうちょ銀行だけを待たず、ほかの銀行への申込も同時に進めます。' },
];

const GINKO = [
  { href: '/guide/houjin/gmo-aozora-shinsa', bank: 'GMOあおぞらネット銀行', when: '11/7 申込 → 11/10 見合わせのメール', ok: false },
  { href: '/guide/houjin/docomo-smtb-shinsa', bank: 'ドコモSMTBネット銀行（旧 住信SBIネット銀行）', when: '11/12 申込 → 11/16 見合わせのメール', ok: false },
  { href: '/guide/houjin/paypay-houjin-kouza', bank: 'PayPay銀行', when: '11/12 申込 → 11/13 住所の違いで止まり申し込み直し → 11/16 通過', ok: true },
] as const;

const FAQS = [
  { q: 'ゆうちょ銀行の法人口座の審査には、何日かかりますか？', a: '公式では、審査に1か月程度かかるとしています。休日を挟む時期や申込が集中したときは1か月を超えることがあり、例年3月から6月は2か月程度かかる場合があるとしています。' },
  { q: '設立したばかりの合同会社は、決算書がなくても申し込めますか？', a: '公式では、設立後1年以下で決算書類を用意できない合同会社などは、合計残高試算表（または直近1か月分の総勘定元帳）と事業計画書の両方を出すとしています。設立6か月以内なら、法人設立届出書の控などもいります。' },
  { q: 'ゆうちょ銀行の審査に落ちたら、次は何をすればいいですか？', a: '当てはまる書類の抜けと、申込の内容が登記と合っているかを見直します。私たちはゆうちょ銀行ではなく、GMOあおぞらネット銀行・ドコモSMTBネット銀行・PayPay銀行に申し込みました。1つ目で落ちた2日後に残りの2つへ同じ日に申し込み、PayPay銀行が通りました。' },
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
    { '@type': 'Article', author: KAKITE_LD, publisher: { '@id': 'https://www.tsuginotenavi.jp/#organization' }, headline: TITLE, description: DESCRIPTION, inLanguage: 'ja', about: { '@type': 'Thing', name: 'ゆうちょ銀行の法人口座の審査' }, mentions: [{ '@type': 'BankOrCreditUnion', name: 'ゆうちょ銀行' }], datePublished: '2026-11-26T00:00:00+09:00', dateModified: '2026-11-26T00:00:00+09:00', mainEntityOfPage: `${SITE_URL}${PATH}` },
    { '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: SITE_NAME, item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: '法人成り', item: `${SITE_URL}/guide/houjin` },
      { '@type': 'ListItem', position: 3, name: 'ゆうちょ銀行の法人口座の審査', item: `${SITE_URL}${PATH}` },
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
          <span>ゆうちょ銀行の審査</span>
        </nav>

        <section className="flex flex-col gap-5" aria-labelledby="top">
          <div className="flex flex-col gap-2">
            <p className="text-[13px] font-bold text-sky-700">公式の案内と、運営会社の実例</p>
            <h1 id="top" className="text-[26px] font-black leading-tight text-slate-900">ゆうちょ銀行の<br />法人口座の審査に<br />落ちたら<br /><span className="text-[19px] text-orange-600">必要書類11項目と見直す点</span></h1>
            <KakiteLine />
          </div>
          <ul className="grid grid-cols-3 gap-2" aria-label="公式の数字">
            {[
              { big: '11項目', s: '公式の必要書類' },
              { big: '1か月', s: '審査の目安' },
              { big: '2か月', s: '3〜6月の目安' },
            ].map((k) => (
              <li key={k.s} className="flex flex-col items-center gap-0.5 rounded-2xl bg-white px-2 py-3.5 text-center ring-1 ring-slate-200">
                <span className="text-[22px] font-black leading-none text-orange-600">{k.big}</span>
                <span className="text-[11px] leading-snug text-slate-600">{k.s}</span>
              </li>
            ))}
          </ul>
          <p className="rounded-2xl bg-white p-4 text-[14px] leading-relaxed text-slate-800 ring-1 ring-slate-200">
            <span className="mb-1 block text-[12px] font-black text-sky-700">結論</span>
            ゆうちょ銀行の法人口座は、公式が挙げる書類（当てはまるもの）を窓口に持っていき、審査に1か月程度かかります。書類が出せないと申込を受け付けないとしています。落ちたら、当てはまる書類の抜けと、申込の内容が登記と合っているかを見直します。ほかの銀行への申込も同時に進めます。
          </p>
          <p className="flex items-start gap-2 text-[12px] leading-relaxed text-slate-600"><Info size={16} className="mt-0.5 shrink-0 text-sky-700" aria-hidden="true" /><span>私たちはゆうちょ銀行には申し込んでいません。このページのゆうちょ銀行の案内は、公式の記載だけをもとにしています。</span></p>
        </section>

        <section className={SECTION} aria-labelledby="shorui">
          <h2 id="shorui" className={H2}>公式の必要書類</h2>
          <p className="flex items-start gap-2 text-[13px] leading-relaxed text-slate-700"><Store size={18} className="mt-0.5 shrink-0 text-sky-700" aria-hidden="true" /><span>印章と、次の書類（当てはまるもの）を窓口に持っていきます。下の小さな字は、設立1年以下の合同会社に当てはまる所です。</span></p>
          <ol className="grid gap-1.5">
            {SHORUI.map((d, i) => (
              <li key={d.h} className={`flex items-start gap-3 rounded-xl px-3.5 py-2.5 ring-1 ${d.godo ? 'bg-amber-50 ring-amber-200' : 'bg-white ring-slate-200'}`}>
                <span className="w-[20px] shrink-0 text-[13px] font-black text-sky-700">{i + 1}</span>
                <span className="flex flex-col gap-0.5">
                  <span className="text-[13px] leading-relaxed text-slate-800">{d.h}</span>
                  {d.godo && <span className="text-[12px] leading-relaxed text-amber-800">{d.godo}</span>}
                </span>
              </li>
            ))}
          </ol>
          <p className="text-[13px] leading-relaxed text-slate-700">公式は、これらの書類を出せない場合は申込を受け付けないとしています。財務の書類に加えて、勘定科目内訳表などがあれば審査の参考にするとも書いています。</p>
          <p className={SRC}>出典：{src(['yucho'])}（{CHECKED} 確認）。書類の名前は要点にまとめています。細かい条件は公式のページで確かめてください</p>
        </section>

        <section className={SECTION} aria-labelledby="minaoshi">
          <h2 id="minaoshi" className={H2}>落ちたら見直す点</h2>
          <ul className="grid gap-2.5">
            {MINAOSHI.map((m) => (
              <li key={m.h} className="flex items-start gap-3 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                <m.icon size={22} className="mt-0.5 shrink-0 text-sky-700" aria-hidden="true" />
                <span className="flex flex-col gap-1"><span className="text-[15px] font-black text-slate-900">{m.h}</span><span className="text-[13px] leading-relaxed text-slate-600">{m.s}</span></span>
              </li>
            ))}
          </ul>
          <p className="text-[13px] leading-relaxed text-slate-700">どれが落ちた理由だったかは、外からは分かりません。見直した点を直して、次の申込に生かします。</p>
          <p className={SRC}>出典：{src(['yucho'])}（{CHECKED} 確認）</p>
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
              lpId={LP_ID} partner="raksulBank" position="jitsurei" lead="ゆうちょ銀行と並行して申し込む先の候補"
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
          <p className={`${SRC} mt-1`}>出典：{src(['yucho'])}（{CHECKED} 確認）</p>
        </section>

        <nav aria-label="あわせて読む" className="flex flex-col gap-2">
          {[
            { href: '/guide/houjin/shinsa-ochita-tsugi', t: '法人口座の審査に落ちたら次は', s: '落ちたあとにすること4つと、3つの銀行の結果' },
            { href: '/guide/houjin/kouza-tsukurenai', t: '法人口座が作れない', s: '3つの銀行に申し込んだ記録と、申込前のチェック表' },
            { href: '/guide/houjin/houjin-setsuritsu-todokedesho', t: '法人設立届出書', s: '設立後に税務署へ出す届出の書き方' },
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
          ゆうちょ銀行の案内は、公式の記載（{CHECKED} 確認）をもとにしています。運営会社はゆうちょ銀行には申し込んでいません。銀行は案内を変えることがあり、審査の結果は会社ごとに違います。実例は運営会社（BlueAdventures合同会社）の2026年11月の申込です。最終更新：2026年11月26日
        </p>
      </main>
      <LpFooter />
    </div>
  );
}
