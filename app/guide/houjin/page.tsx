import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight, Building2, CalendarDays, CheckCircle2, Clock, Coins, FileText, Globe, Landmark, Layers, Send, Stamp, XCircle,
} from 'lucide-react';
import LpHeader from '@/components/lp/LpHeader';
import LpFooter from '@/components/lp/LpFooter';
import LpViewTracker from '@/components/lp/LpViewTracker';
import { KakiteLine, KakiteNote, KAKITE_LD } from '@/components/houjin/Kakite';
import HoujinExit from '@/components/houjin/HoujinExit';
import KouzaCheck from '@/components/houjin/KouzaCheck';
import { SITE_URL, SITE_NAME, ogImageUrl } from '@/components/loan/LoanArticle';
import { HOUJIN_PARTNERS } from '@/lib/houjin/partners';
import { KEIKA } from '@/lib/houjin/kouza-data';

/**
 * 法人成りの柱のページ：設立直後の法人口座の開設（2026-11-25 作り替え。元は 2026-11-16 作成のページ一覧だけの入口）。
 * 狙う客：S2＝設立直後〜2か月の1人・少人数の会社（docs/houjin-plan.md「狙う客と立ち位置」、11/24 オーナー了承）。
 * 受ける言葉（キーワードプランナー 2025/11〜2026/10 の月平均、11/24 確認）：法人口座 開設 2,900・法人口座 ネット銀行 880・法人口座 開設 おすすめ 390。
 * 上位（11/24 23:55、Google、日本）：
 *   「法人口座 開設」：三井住友銀行・三菱UFJ銀行・PayPay銀行・みんなの銀行・SBJ銀行・弥生・地方銀行2つ・みずほ銀行。ほぼ銀行の自社の案内。広告4本。
 *   「法人口座 ネット銀行」：Wise・楽天銀行・三井住友銀行・ドコモSMTB・株探・GMOあおぞら・マネーフォワード・PayPay銀行・バーチャルオフィスの会社。
 *   「法人口座 開設 設立直後」：税理士事務所・GMOあおぞら・創業手帳・司法書士事務所・オフィスの会社・会社設立の税理士・ラクスルバンクのコラム・freee・ドコモSMTB。
 *     小さな事務所が上位にいて、取れる余地がある。どれも体験なしの一般論。
 *   上位に欠けている点：①設立直後に実際に申し込んだ結果と日付 ②設立直後の目で、事業内容の資料と日数を銀行ごとに並べたもの ③申込で止まった所の実例。
 * 題名は「法人口座の開設」を入れたまま、前に「設立直後」を置いて S2 に絞る（「法人口座 開設」の上位は銀行で、すぐには取れない）。
 * 数字・銀行の決まりは、子のページで確かめた公式の記載だけ（必要書類・開設期間は 11/17、PayPay銀行・ラクスルバンクは 11/16）。
 * 出口：ラクスルバンク（1つだけ）。書き方は案1（審査はGMOあおぞらで、運営会社は直接の申込で通らなかったと書く）。
 */
const LP_ID = 'guide-houjin-top';
const PATH = '/guide/houjin';
const TITLE = '設立直後の法人口座の開設｜ネット銀行3つに申し込んだ実例と、開設までの流れ・準備';
const DESCRIPTION = '設立したばかりの会社が法人口座を開設するまでの流れを、運営会社がネット銀行3つに申し込んだ実例（設立から審査通過まで19日）で。準備する書類、申込で止まった所、設立直後に見るネット銀行の違い。';

export const metadata: Metadata = {
  title: `${TITLE} | ${SITE_NAME}`,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}${PATH}` },
  openGraph: { title: TITLE, description: DESCRIPTION, url: `${SITE_URL}${PATH}`, siteName: SITE_NAME, type: 'article', locale: 'ja_JP', images: [{ url: ogImageUrl(TITLE), width: 1200, height: 630, alt: TITLE }] },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, images: [ogImageUrl(TITLE)] },
};

const S = {
  raksul1293: { name: 'ラクスルバンク よくあるご質問（口座開設の必要書類）', url: 'https://support.raksulbank.com/faq/show/1293?site_domain=default' },
  raksulTop: { name: 'ラクスルバンク 公式サイト', url: 'https://raksulbank.com/' },
  raksulFaq: { name: 'ラクスルバンク よくあるご質問（審査にかかる時間）', url: 'https://support.raksulbank.com/faq/show/33?site_domain=default' },
  paypayDoc: { name: 'PayPay銀行「口座開設に必要な書類（法人のお客さま）」', url: 'https://www.paypay-bank.co.jp/business/account/documents.html' },
  paypayFaq: { name: 'PayPay銀行 よくあるご質問（口座開設までの日数）', url: 'https://faq.paypay-bank.co.jp/faq/show/97?site_domain=business' },
  rakuten: { name: '楽天銀行「法人ビジネス口座開設に必要な書類一覧」', url: 'https://www.rakuten-bank.co.jp/business/account/id.html' },
  mizuho: { name: 'みずほ銀行「法人口座開設にかかる期間はどのくらい？」', url: 'https://www.mizuhobank.co.jp/corporate/account/tips/topic_98.html' },
} as const;
type K = keyof typeof S;

/** 開設までの流れ（設立直後の会社） */
const NAGARE = [
  { icon: Stamp, h: '登記が終わる', s: '会社の口座は、登記のあとに作る' },
  { icon: Globe, h: '事業が分かる資料をそろえる', s: 'ホームページ・事業計画書など' },
  { icon: Send, h: '2行以上に同時に申し込む', s: '社名と住所は登記どおりに入れる' },
  { icon: Clock, h: '審査', s: '私たちは申込から4日' },
  { icon: CheckCircle2, h: '開設', s: '私たちは設立から19日' },
];

/** 設立直後の目で見た、銀行の違い（公式の記載だけ。書いていないものは足さない） */
const CHIGAI = [
  { bank: 'ラクスルバンク', shiryou: '設立直後は、事業計画書（代表者の署名・捺印）も出せる', hayasa: '最短当日（ふだんは1週間ほど）', src: ['raksul1293', 'raksulTop', 'raksulFaq'] as K[] },
  { bank: 'PayPay銀行', shiryou: '契約書・請求書・許認可証などを1点。設立直後も必要', hayasa: '最短当日（書類をアップロードした場合）', src: ['paypayDoc', 'paypayFaq'] as K[] },
  { bank: '楽天銀行', shiryou: '設立6か月以内は、ホームページだけでは足りない', hayasa: '書類の郵送が要る', src: ['rakuten'] as K[] },
];

const HOUJIN_PAGES = [
  { href: '/guide/houjin/setsuritsu-go-yarukoto', t: '会社設立後にやること', s: '届出の期限の早い順。役員報酬0円で変わる所', icon: CalendarDays },
  { href: '/guide/houjin/kouza-tsukurenai', t: '法人口座が作れない', s: '3行に申し込み、通ったのは1行', icon: XCircle },
  { href: '/guide/houjin/gmo-aozora-shinsa', t: 'GMOあおぞらネット銀行の審査に落ちた', s: '申込から3日で結果。出した書類と公式の案内', icon: XCircle },
  { href: '/guide/houjin/docomo-smtb-shinsa', t: 'ドコモSMTBネット銀行（旧住信SBI）の審査に落ちた', s: '申込から4日で見合わせ。公式のよくある不備と照らす', icon: XCircle },
  { href: '/guide/houjin/yucho-shinsa', t: 'ゆうちょ銀行の法人口座の審査に落ちたら', s: '公式の必要書類11項目と、見直す点3つ', icon: Landmark },
  { href: '/guide/houjin/shinsa-ochita-tsugi', t: '法人口座の審査に落ちたら次は', s: '落ちたあとにすること4つと、3つの銀行の結果', icon: Layers },
  { href: '/guide/houjin/goudou-kouza-meigi', t: '合同会社の口座名義の書き方', s: 'カナは「ド）」。申込で社名の英字を1文字抜かした実例', icon: FileText },
  { href: '/guide/houjin/smbc-shinsa', t: '三井住友銀行の法人口座の審査に落ちたら', s: 'Trunk の必要書類と、見直す点3つ', icon: Landmark },
  { href: '/guide/houjin/rakuten-shinsa', t: '楽天銀行の法人口座の審査に落ちたら', s: '設立6か月以内に要る書類と、受け付けない書類', icon: Landmark },
  { href: '/guide/houjin/kouza-hitsuyou-shorui', t: '法人口座の必要書類', s: '銀行4つの比較と、設立直後の事業内容の資料', icon: FileText },
  { href: '/guide/houjin/rireki-jikou-shoumeisho', t: '履歴事項全部証明書の取り方', s: '2026年4月からの手数料と、法人口座の申込で必要な銀行', icon: Stamp },
  { href: '/guide/houjin/kouza-kaisetsu-kikan', t: '法人口座の開設期間', s: '設立から審査通過まで19日。最短当日が延びる理由', icon: CalendarDays },
  { href: '/guide/houjin/kouza-virtual-office', t: '法人口座とバーチャルオフィス', s: '郵便と書類の注意', icon: Building2 },
  { href: '/guide/houjin/houjin-setsuritsu-todokedesho', t: '法人設立届出書の書き方', s: '合同会社の欄ごとの記入と期限・添付書類', icon: FileText },
  { href: '/guide/houjin/kyuyo-shiharai-jimusho-kaisetsu', t: '給与支払事務所等の開設届出書', s: '役員報酬0円の会社と、納期の特例の計算', icon: FileText },
  { href: '/guide/houjin/paypay-houjin-kouza', t: 'PayPay銀行の法人口座', s: '設立直後でも審査に通った実例', icon: Landmark },
  { href: '/guide/houjin/aoiro-shinsei-houjin', t: '青色申告の承認申請書（法人）', s: '設立1期目の期限を日付で計算', icon: CalendarDays },
  { href: '/guide/houjin/raksulbank', t: 'ラクスルバンク', s: '審査はGMOあおぞら。手数料と申し込める会社', icon: Coins },
  { href: '/guide/houjin/kyuujitai-touki', t: '登記で旧字体がエラー', s: '印鑑証明書の「塚」が使えなかった実例', icon: Stamp },
];

const FAQS = [
  { q: '法人口座は、会社を設立したらすぐに開設できますか？', a: '登記が終わってから申し込みます。個人の口座を会社名義に変えることはできません。私たちは1行目に通らず、設立から15日後に2行へ同時に申し込み、4日後に1行の審査に通りました。' },
  { q: '設立直後で、請求書や契約書がまだありません。', a: 'ラクスルバンクは、設立直後の会社は事業計画書（代表者の署名・捺印）を出せるとしています。楽天銀行は、設立6か月以内だとホームページだけでは足りないとしています。くわしくは「法人口座の必要書類」のページで比べています。' },
  { q: '法人口座の開設には、どれくらいかかりますか？', a: 'PayPay銀行とラクスルバンクは最短当日と案内しています。みずほ銀行は、法人口座の開設の目安を2週間〜1か月ほどとしています。私たちは設立から審査通過まで19日でした。' },
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
    { '@type': 'Article', author: KAKITE_LD, publisher: { '@id': 'https://www.tsuginotenavi.jp/#organization' }, headline: TITLE, description: DESCRIPTION, inLanguage: 'ja', about: { '@type': 'Thing', name: '法人口座の開設' }, mentions: ['GMOあおぞらネット銀行', 'ドコモSMTBネット銀行', 'PayPay銀行', 'ラクスルバンク', '楽天銀行'].map((name) => ({ '@type': 'BankOrCreditUnion', name })), datePublished: '2026-11-16T18:00:00+09:00', dateModified: '2026-11-25T01:00:00+09:00', mainEntityOfPage: `${SITE_URL}${PATH}` },
    { '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: SITE_NAME, item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: '法人成り', item: `${SITE_URL}${PATH}` },
    ] },
    { '@type': 'ItemList', itemListElement: HOUJIN_PAGES.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.t, url: `${SITE_URL}${it.href}` })) },
    { '@type': 'FAQPage', mainEntity: FAQS.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) },
  ],
};

const KAZU = [
  { big: '3行', s: 'ネット銀行に申込' },
  { big: '1行', s: '開設できた' },
  { big: '19日', s: '設立から審査通過' },
];

export default function Page() {
  const hasExit = !!HOUJIN_PARTNERS.raksulBank.href;
  return (
    <div className="flex min-h-screen flex-col bg-[#f6f8fa]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <LpHeader />
      <LpViewTracker lpId={LP_ID} version="v2-2026-11-25" />
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
          <span>法人成り</span>
        </nav>

        <section className="flex flex-col gap-5" aria-labelledby="top">
          <div className="flex flex-col gap-2">
            <p className="text-[13px] font-bold text-sky-700">運営会社の実例</p>
            <h1 id="top" className="text-[28px] font-black leading-tight text-slate-900">設立直後の<br />法人口座の開設<br /><span className="text-[20px] text-orange-600">ネット銀行3つに申し込んだ記録</span></h1>
            <KakiteLine />
          </div>
          <ul className="grid grid-cols-3 gap-2" aria-label="実例の数字">
            {KAZU.map((k) => (
              <li key={k.s} className="flex flex-col items-center gap-0.5 rounded-2xl bg-white px-2 py-3.5 text-center ring-1 ring-slate-200">
                <span className="text-[26px] font-black leading-none text-orange-600">{k.big}</span>
                <span className="text-[11px] leading-snug text-slate-600">{k.s}</span>
              </li>
            ))}
          </ul>
          <p className="rounded-2xl bg-white p-4 text-[14px] leading-relaxed text-slate-800 ring-1 ring-slate-200">
            <span className="mb-1 block text-[12px] font-black text-sky-700">結論</span>
            設立直後・取引の実績なし・本店がバーチャルオフィスの合同会社でも、法人口座は開設できました。止まりやすいのは「事業が分かる資料」と「申込の入力が登記と違う」の2つです。
          </p>
        </section>

        <section className={SECTION} aria-labelledby="nagare">
          <h2 id="nagare" className={H2}>開設までの流れ</h2>
          <ol className="flex flex-col">
            {NAGARE.map(({ icon: I, h, s }, i) => (
              <li key={h} className="relative flex items-start gap-3 pb-4 last:pb-0">
                {i < NAGARE.length - 1 && <span className="absolute left-[19px] top-10 h-[calc(100%-2.5rem)] w-px bg-sky-200" aria-hidden="true" />}
                <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-700"><I size={20} aria-hidden="true" /></span>
                <span className="flex flex-col pt-1">
                  <span className="text-[15px] font-black text-slate-900"><span className="mr-1.5 text-sky-700">{i + 1}</span>{h}</span>
                  <span className="text-[12px] text-slate-600">{s}</span>
                </span>
              </li>
            ))}
          </ol>
        </section>

        <section className={SECTION} aria-labelledby="jitsurei">
          <h2 id="jitsurei" className={H2}>私たちの申込の記録</h2>
          <ul className="flex flex-col gap-2">
            {KEIKA.map((k, i) => (
              <li key={`${k.d}-${i}`} className="flex items-start gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-slate-200">
                <span className="w-[62px] shrink-0 text-[13px] font-black text-sky-700">{k.d}</span>
                <span className="text-[13px] leading-relaxed text-slate-700">{k.t}</span>
              </li>
            ))}
          </ul>
          <p className={SRC}>2026年。運営会社（BlueAdventures合同会社）の記録</p>
          <Link href="/guide/houjin/kouza-tsukurenai" className="flex items-center gap-3 rounded-2xl border-2 border-sky-200 bg-sky-50/60 p-3.5 hover:border-sky-300">
            <XCircle size={22} className="shrink-0 text-sky-700" aria-hidden="true" />
            <span className="flex flex-1 flex-col"><span className="text-[15px] font-black text-slate-900">落ちた2行の見立て</span><span className="text-[12px] text-slate-600">法人口座が作れないときのページ</span></span>
            <ArrowRight size={18} className="text-sky-700" aria-hidden="true" />
          </Link>
        </section>

        <section className={SECTION} aria-labelledby="chigai">
          <h2 id="chigai" className={H2}>設立直後に見る、ネット銀行の違い</h2>
          <ul className="grid gap-2.5">
            {CHIGAI.map((c) => (
              <li key={c.bank} className="flex flex-col gap-2 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                <span className="flex items-center gap-2">
                  <Landmark size={20} className="shrink-0 text-sky-700" aria-hidden="true" />
                  <span className="text-[16px] font-black text-slate-900">{c.bank}</span>
                </span>
                <dl className="grid grid-cols-[5.5em_1fr] gap-x-2 gap-y-1.5 text-[13px] leading-relaxed">
                  <dt className="font-bold text-slate-500">事業の資料</dt><dd className="text-slate-800">{c.shiryou}</dd>
                  <dt className="font-bold text-slate-500">早さ</dt><dd className="text-slate-800">{c.hayasa}</dd>
                </dl>
              </li>
            ))}
          </ul>
          <p className={SRC}>出典：{src(['raksul1293', 'raksulTop', 'raksulFaq', 'paypayDoc', 'paypayFaq', 'rakuten'])}（2026/11/16〜11/17 確認）</p>
        </section>

        <section className={SECTION} aria-labelledby="check">
          <h2 id="check" className={H2}>申し込む前に整える7つ</h2>
          <KouzaCheck lpId={LP_ID} />
        </section>

        {hasExit && (
          <section className={SECTION} aria-labelledby="exit">
            <h2 id="exit" className="sr-only">申込先</h2>
            <HoujinExit
              lpId={LP_ID} partner="raksulBank" position="bottom" lead="請求書も契約書もまだない会社の申込先に"
              note="審査はGMOあおぞらネット銀行です。私たちは設立直後に、GMOあおぞらネット銀行に直接申し込んで通りませんでした。それを知ったうえで、申込先の一つとして載せています。"
            />
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
          <p className={`${SRC} mt-1`}>出典：{src(['raksul1293', 'rakuten', 'paypayFaq', 'raksulTop', 'mizuho'])}（2026/11/16〜11/17 確認）</p>
        </section>

        <section className={SECTION} aria-labelledby="pages">
          <h2 id="pages" className={H2}>法人成りのページ</h2>
          <ul className="grid gap-2">
            {HOUJIN_PAGES.map(({ href, t, s, icon: I }) => (
              <li key={href}>
                <Link href={href} className="flex items-center gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-slate-200 hover:ring-slate-300">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-700"><I size={20} aria-hidden="true" /></span>
                  <span className="flex flex-1 flex-col"><span className="text-[15px] font-black text-slate-900">{t}</span><span className="text-[12px] text-slate-600">{s}</span></span>
                  <ArrowRight size={18} className="text-sky-700" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <KakiteNote />
        <p className="text-[11px] leading-relaxed text-slate-400">
          銀行の決まりは各銀行の公式の記載（2026年11月16日〜17日 確認）です。銀行は案内を変えることがあり、審査の結果は会社ごとに違います。実例は運営会社（BlueAdventures合同会社）が2026年10〜11月に設立・申込をしたときのものです。最終更新：2026年11月25日
        </p>
      </main>
      <LpFooter />
    </div>
  );
}
