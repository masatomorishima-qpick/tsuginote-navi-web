import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Ban, CheckCircle2, FileText, Info, Mail, Monitor, SearchCheck, XCircle } from 'lucide-react';
import LpHeader from '@/components/lp/LpHeader';
import LpFooter from '@/components/lp/LpFooter';
import LpViewTracker from '@/components/lp/LpViewTracker';
import { KakiteLine, KakiteNote, KAKITE_LD } from '@/components/houjin/Kakite';
import HoujinExit from '@/components/houjin/HoujinExit';
import { SITE_URL, SITE_NAME, ogImageUrl } from '@/components/loan/LoanArticle';
import { HOUJIN_PARTNERS } from '@/lib/houjin/partners';

/**
 * 楽天銀行の法人口座の審査に落ちたら（2026-11-27 作成。houjin-plan.md B11。体験のない銀行。オーナー了承 11/25）。
 * 運営会社は楽天銀行には申し込んでいないので、体験したふりはしない。
 * 受ける言葉（キーワードプランナー 11/25）：楽天 法人口座 審査落ち 70。
 * 上位（11/25 22:30、Google「楽天銀行 法人口座 審査 落ちた」）：Wise・会社設立の会社・実録のブログ・楽天銀行の新設法人向けページ・
 *   知恵袋・定款の会社・ポイントサイト・お名前.com・バーチャルオフィスの会社。銀行の自社ページ1・大手 Wise 1。
 *   関連する質問：落ちたらどうすればいい／楽天の審査に落ちる理由。
 *   上位に欠けている点：①設立6か月以内はホームページだけでは足りず、法人名の入った取引の書類か契約書が要ること、
 *   受け付けない書類（設立届出書・定款・設立時の司法書士の請求書など）を公式の記載で並べたもの
 *   ②届く郵便が「簡易書留（転送不要）」であること ③3つの銀行に申し込んだ日付つきの実例へのつなぎ
 * 一次情報（11/27 確認）：楽天銀行「法人ビジネス口座開設に必要な書類一覧」「法人ビジネス口座開設に関する注意事項」「法人ビジネス口座開設の流れ」。
 * 実体験：houjin-plan.md「実体験の事実」。設立直後は、法人の名前で請求書や発注書を出したり受け取ったりしたことがなかった。
 * 出口：ラクスルバンク（審査は GMOあおぞらネット銀行。私たちはそこで落ちたと正直に書く）。
 */
const LP_ID = 'guide-houjin-rakuten-shinsa';
const PATH = '/guide/houjin/rakuten-shinsa';
const CHECKED = '2026/11/27';
const TITLE = '楽天銀行の法人口座の審査に落ちたら｜設立6か月以内に要る書類と見直す点';
const DESCRIPTION = '楽天銀行の法人口座の審査に落ちたときに見直す点。設立6か月以内の会社は、ホームページだけでは事業の確認にならず、法人名の入った請求書や契約書が要ると公式は書いています。受け付けない書類（設立届出書・定款など）、届く郵便が簡易書留（転送不要）であることも公式の記載から。楽天銀行以外の3つの銀行に申し込んだ運営会社の実例つき。';

export const metadata: Metadata = {
  title: `${TITLE} | ${SITE_NAME}`,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}${PATH}` },
  openGraph: { title: TITLE, description: DESCRIPTION, url: `${SITE_URL}${PATH}`, siteName: SITE_NAME, type: 'article', locale: 'ja_JP', images: [{ url: ogImageUrl(TITLE), width: 1200, height: 630, alt: TITLE }] },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, images: [ogImageUrl(TITLE)] },
};

const S = {
  shorui: { name: '楽天銀行「法人ビジネス口座開設に必要な書類一覧」', url: 'https://www.rakuten-bank.co.jp/business/account/id.html' },
  notes: { name: '楽天銀行「法人ビジネス口座開設に関する注意事項」', url: 'https://www.rakuten-bank.co.jp/business/account/notes.html' },
  flow: { name: '楽天銀行「法人ビジネス口座開設の流れ」', url: 'https://www.rakuten-bank.co.jp/business/account/flow.html' },
  raksul1293: { name: 'ラクスルバンク よくあるご質問「口座開設の際、必要書類は何を提出すればいいですか。」', url: 'https://support.raksulbank.com/faq/show/1293?site_domain=default' },
  raksul33: { name: 'ラクスルバンク よくあるご質問「口座開設の審査にはどれくらいの時間がかかりますか？」', url: 'https://support.raksulbank.com/faq/show/33?site_domain=default' },
  gmoTokuyaku: { name: 'GMOあおぞらネット銀行「ラクスルバンク支店に関する特約」', url: 'https://gmo-aozora.com/provision/pdf/raksul_260816.pdf' },
} as const;
type K = keyof typeof S;

/** 必ず出す書類（公式の1〜6） */
const HISSU = [
  '申込書兼申込委任状（実印と届出印を押す）',
  '実質的支配者に関する届出書',
  '法人の印鑑証明書（原本・発行から3か月以内）',
  '履歴事項全部証明書（原本・発行から6か月以内）',
  '口座管理者の本人確認書類',
  '事業実態の確認できる資料（下の表）',
];

/** 事業実態の資料（公式のグループA。1点）。shinsetsu は設立6か月以内の扱い */
const JITTAI = [
  { h: 'ホームページのアドレス', s: '取扱商品・事業内容・法人名・住所が分かるもの', shinsetsu: '設立6か月以内は、これだけでは足りない' },
  { h: '発注書・納品書・請求書の写し', s: '日付・法人名・具体的な取引内容が分かるもの。発行から6か月以内', shinsetsu: '' },
  { h: '各種契約書の写し', s: '双方の署名・押印済みで、契約期間内のもの。ひな形は不可', shinsetsu: '' },
];

const UKETSUKENAI = ['設立時の司法書士・行政書士などの請求書', '法人設立届出書', '定款', '顧問税理士との契約書', '事務用品や備品の請求書・納品書', '公共料金・固定資産税などの請求書'];

const GINKO = [
  { href: '/guide/houjin/gmo-aozora-shinsa', bank: 'GMOあおぞらネット銀行', when: '11/7 申込 → 11/10 見合わせのメール', ok: false },
  { href: '/guide/houjin/docomo-smtb-shinsa', bank: 'ドコモSMTBネット銀行（旧 住信SBIネット銀行）', when: '11/12 申込 → 11/16 見合わせのメール', ok: false },
  { href: '/guide/houjin/paypay-houjin-kouza', bank: 'PayPay銀行', when: '11/12 申込 → 11/13 住所の違いで止まり申し込み直し → 11/16 通過', ok: true },
] as const;

const FAQS = [
  { q: '楽天銀行は、法人口座の審査に落ちた理由を教えてくれますか？', a: '楽天銀行は、口座開設の審査には楽天銀行で定めた審査基準があるが、詳細は公開していないとしています。受け付けできない例の1つ目に「事業実態の確認が取れない場合」を挙げています。' },
  { q: '設立したばかりで、請求書や契約書がありません。楽天銀行に申し込めますか？', a: '楽天銀行の必要書類の案内では、設立6か月以内の会社は、ホームページがあっても事業実態の確認できる資料を別に出すとしています。挙げられているのは、法人名の入った発注書・納品書・請求書（発行から6か月以内）か、双方が署名・押印した契約書です。法人設立届出書や定款は受け付けない書類の例に入っています。' },
  { q: '楽天銀行の審査に落ちたら、次は何をすればいいですか？', a: '事業実態の資料と、申込の内容が登記と合っているかを見直します。私たちは楽天銀行ではなく、GMOあおぞらネット銀行・ドコモSMTBネット銀行・PayPay銀行に申し込みました。1つ目で落ちた2日後に残りの2つへ同じ日に申し込み、PayPay銀行が通りました。' },
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
    { '@type': 'Article', author: KAKITE_LD, publisher: { '@id': 'https://www.tsuginotenavi.jp/#organization' }, headline: TITLE, description: DESCRIPTION, inLanguage: 'ja', about: { '@type': 'Thing', name: '楽天銀行の法人口座の審査' }, mentions: [{ '@type': 'BankOrCreditUnion', name: '楽天銀行' }], datePublished: '2026-11-27T08:00:00+09:00', dateModified: '2026-11-27T08:00:00+09:00', mainEntityOfPage: `${SITE_URL}${PATH}` },
    { '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: SITE_NAME, item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: '法人成り', item: `${SITE_URL}/guide/houjin` },
      { '@type': 'ListItem', position: 3, name: '楽天銀行の法人口座の審査', item: `${SITE_URL}${PATH}` },
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
          <span>楽天銀行の審査</span>
        </nav>

        <section className="flex flex-col gap-5" aria-labelledby="top">
          <div className="flex flex-col gap-2">
            <p className="text-[13px] font-bold text-sky-700">公式の案内と、ほかの銀行での私たちの実例</p>
            <h1 id="top" className="text-[26px] font-black leading-tight text-slate-900">楽天銀行の<br />法人口座の審査に<br />落ちたら<br /><span className="text-[19px] text-orange-600">設立6か月以内に要る書類</span></h1>
            <KakiteLine />
          </div>
          <ul className="grid grid-cols-3 gap-2" aria-label="公式の数字">
            {[
              { big: '6点', s: '必ず出す書類' },
              { big: '6か月', s: '以内はホームページだけでは不可' },
              { big: '郵送', s: '書類は郵便で送る' },
            ].map((k) => (
              <li key={k.s} className="flex flex-col items-center gap-0.5 rounded-2xl bg-white px-2 py-3.5 text-center ring-1 ring-slate-200">
                <span className="text-[22px] font-black leading-none text-orange-600">{k.big}</span>
                <span className="text-[11px] leading-snug text-slate-600">{k.s}</span>
              </li>
            ))}
          </ul>
          <p className="rounded-2xl bg-white p-4 text-[14px] leading-relaxed text-slate-800 ring-1 ring-slate-200">
            <span className="mb-1 block text-[12px] font-black text-sky-700">結論</span>
            楽天銀行は、設立6か月以内の会社には、ホームページとは別に、法人名の入った請求書・発注書・納品書か、双方が署名した契約書を求めています。設立届出書や定款は、事業の確認の書類として受け付けません。落ちたら、まずこの書類を見直し、ほかの銀行への申込も同時に進めます。
          </p>
          <p className="flex items-start gap-2 text-[12px] leading-relaxed text-slate-600"><Info size={16} className="mt-0.5 shrink-0 text-sky-700" aria-hidden="true" /><span>私たちは楽天銀行には申し込んでいません。このページの楽天銀行の案内は、公式の記載だけをもとにしています。</span></p>
        </section>

        <section className={SECTION} aria-labelledby="hissu">
          <h2 id="hissu" className={H2}>必ず出す書類</h2>
          <ol className="grid gap-1.5">
            {HISSU.map((h, i) => (
              <li key={h} className="flex items-start gap-3 rounded-xl bg-white px-3.5 py-2.5 ring-1 ring-slate-200">
                <span className="w-[18px] shrink-0 text-[13px] font-black text-sky-700">{i + 1}</span>
                <span className="text-[13px] leading-relaxed text-slate-800">{h}</span>
              </li>
            ))}
          </ol>
          <p className="text-[13px] leading-relaxed text-slate-700">書類は、楽天銀行に届いた時点で有効期限内である必要があります。許認可が要る事業は、許認可証の写しも出します。</p>
          <p className={SRC}>出典：{src(['shorui'])}（{CHECKED} 確認）</p>
        </section>

        <section className={SECTION} aria-labelledby="jittai">
          <h2 id="jittai" className={H2}>事業実態の資料</h2>
          <p className="text-[13px] leading-relaxed text-slate-700">次のうち1点を出します。</p>
          <ul className="grid gap-2">
            {JITTAI.map((j) => (
              <li key={j.h} className={`flex items-start gap-3 rounded-2xl p-3.5 ring-1 ${j.shinsetsu ? 'bg-amber-50 ring-amber-200' : 'bg-white ring-slate-200'}`}>
                <FileText size={20} className="mt-0.5 shrink-0 text-sky-700" aria-hidden="true" />
                <span className="flex flex-col gap-0.5">
                  <span className="text-[14px] font-black text-slate-900">{j.h}</span>
                  <span className="text-[12px] leading-relaxed text-slate-600">{j.s}</span>
                  {j.shinsetsu && <span className="text-[12px] font-bold text-amber-800">{j.shinsetsu}</span>}
                </span>
              </li>
            ))}
          </ul>
          <div className="flex flex-col gap-2 rounded-2xl bg-slate-100 p-4">
            <span className="flex items-center gap-2 text-[14px] font-black text-slate-900"><Ban size={18} className="text-slate-500" aria-hidden="true" />受け付けない書類の例</span>
            <ul className="flex flex-wrap gap-1.5">
              {UKETSUKENAI.map((d) => <li key={d} className="rounded-full bg-white px-3 py-1 text-[12px] text-slate-700 ring-1 ring-slate-200">{d}</li>)}
            </ul>
          </div>
          <p className="flex items-start gap-2 text-[13px] leading-relaxed text-slate-700"><Info size={18} className="mt-0.5 shrink-0 text-sky-700" aria-hidden="true" /><span>私たちは設立直後、法人の名前で請求書や発注書を出したことも、受け取ったこともありませんでした。同じ状態の会社は、楽天銀行のこの条件に当てはまる書類がまだない場合があります。</span></p>
          <p className={SRC}>出典：{src(['shorui'])}（{CHECKED} 確認）</p>
        </section>

        <section className={SECTION} aria-labelledby="nagare">
          <h2 id="nagare" className={H2}>申込の流れ</h2>
          <ol className="grid gap-2">
            {[
              { icon: Monitor, h: 'パソコンで入力', s: 'スマートフォンからは申し込めない' },
              { icon: Mail, h: '申込書と書類を郵送', s: '申込から180日以内に届かないと取り消し' },
              { icon: SearchCheck, h: '楽天銀行が確認と審査', s: '追加の書類や電話での確認を求める場合あり' },
              { icon: CheckCircle2, h: '開設できる場合は、簡易書留（転送不要）が2通届く', s: '連絡先の住所あてと、口座管理者の自宅あて' },
            ].map((n, i) => (
              <li key={n.h} className="flex items-start gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-slate-200">
                <n.icon size={20} className="mt-0.5 shrink-0 text-sky-700" aria-hidden="true" />
                <span className="flex flex-col gap-0.5"><span className="text-[14px] font-black text-slate-900">{i + 1}. {n.h}</span><span className="text-[12px] leading-relaxed text-slate-600">{n.s}</span></span>
              </li>
            ))}
          </ol>
          <p className="text-[13px] leading-relaxed text-slate-700">楽天銀行は、審査基準の詳細は公開していないとしています。受け付けできない例の1つ目は「事業実態の確認が取れない場合」です。</p>
          <p className={SRC}>出典：{src(['flow', 'notes', 'shorui'])}（{CHECKED} 確認）</p>
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
              lpId={LP_ID} partner="raksulBank" position="jitsurei" lead="取引の書類がまだない会社の申込先の候補"
              note="ラクスルバンクは、設立直後の会社が補う書類として、代表者が署名・捺印した事業計画書を挙げています。口座はGMOあおぞらネット銀行のラクスルバンク支店で、審査もGMOあおぞらネット銀行が行います。私たちはGMOあおぞらネット銀行に直接申し込んで落ちています。GMOあおぞらネット銀行で落ちたことがある会社は、同じ銀行の審査になると知ったうえで選んでください。"
            />
          )}
          {hasExit && <p className={SRC}>出典：{src(['raksul1293', 'raksul33', 'gmoTokuyaku'])}（{CHECKED} 確認）</p>}
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
          <p className={`${SRC} mt-1`}>出典：{src(['notes', 'shorui'])}（{CHECKED} 確認）</p>
        </section>

        <nav aria-label="あわせて読む" className="flex flex-col gap-2">
          {[
            { href: '/guide/houjin/shinsa-ochita-tsugi', t: '法人口座の審査に落ちたら次は', s: '落ちたあとにすること4つと、3つの銀行の結果' },
            { href: '/guide/houjin/kouza-hitsuyou-shorui', t: '法人口座の開設に必要な書類', s: '銀行ごとの比較と、設立直後の事業内容の資料' },
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
          楽天銀行の案内は、公式の記載（{CHECKED} 確認）をもとにしています。運営会社は楽天銀行には申し込んでいません。銀行は案内を変えることがあり、審査の結果は会社ごとに違います。実例は運営会社（BlueAdventures合同会社）の2026年11月の申込です。最終更新：2026年11月27日
        </p>
      </main>
      <LpFooter />
    </div>
  );
}
