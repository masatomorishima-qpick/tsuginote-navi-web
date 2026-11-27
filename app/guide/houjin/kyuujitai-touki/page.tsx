import type { Metadata } from 'next';
import Link from 'next/link';
import { AlertTriangle, ArrowRight, CheckCircle2, FileText, Info, Keyboard, Search, Building } from 'lucide-react';
import LpHeader from '@/components/lp/LpHeader';
import LpFooter from '@/components/lp/LpFooter';
import LpViewTracker from '@/components/lp/LpViewTracker';
import { KakiteLine, KakiteNote, KAKITE_LD } from '@/components/houjin/Kakite';
import HoujinExit from '@/components/houjin/HoujinExit';
import { SITE_URL, SITE_NAME, ogImageUrl } from '@/components/loan/LoanArticle';
import { HOUJIN_PARTNERS } from '@/lib/houjin/partners';

/**
 * 会社設立の電子申請で、旧字体（外字）がエラーになった実例（2026-11-16 作成）。
 * 受ける言葉（キーワードプランナー 2025/11〜2026/10 の月平均）：登記 旧字体 10・登記 外字 10・電子申請 旧字体 10。
 * 上位（11/16、WebSearch）：法務省の文字の案内、弥生・マネーフォワード・freee の会社設立のよくある質問、土地家屋調査士の外字の解説。
 *   会社設立の電子申請で旧字体に当たり、どう解決したかの実例はない。
 * 体験（オーナー、11/16）：代表者の印鑑証明書の住所の「塚」が旧字体。電子申請で入れられず、提出書類と一致しない問題になった。
 *   普通の「塚」で出し直して登記は完了。法務局は電子のことは分からず紙を勧めた。会社設立のサービスは「行政に聞いて」。
 * 住所の地名は書かない（オーナーの住所が分かるため。「塚」の字だけにとどめる）。
 * 出口：ラクスルバンク（2026-11-28 追加。法人成りのページで検索からの訪問が最も多く〈11/21〜27 で2〉、平均5位。
 *   登記を終えた読者の次の一歩は法人口座なので、「登記が終わったら、法人口座」の節に1つだけ置く。審査は GMOあおぞらネット銀行と正直に書く）。
 */
const LP_ID = 'guide-houjin-kyuujitai-touki';
const PATH = '/guide/houjin/kyuujitai-touki';
const CHECKED = '2026/11/16';
const TITLE = '登記の電子申請で旧字体がエラーに｜印鑑証明書の住所の「塚」で止まった会社設立の実例と対処';
const DESCRIPTION = '代表者の印鑑証明書の住所にあった旧字体（外字）の「塚」が、会社設立の電子申請で使えずエラーに。普通の「塚」で出し直して登記が完了した実例と、法務省が案内する使える文字の範囲、漢字検索・代わりの字・紙での申請という3つの手。';

export const metadata: Metadata = {
  title: `${TITLE} | ${SITE_NAME}`,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}${PATH}` },
  openGraph: { title: TITLE, description: DESCRIPTION, url: `${SITE_URL}${PATH}`, siteName: SITE_NAME, type: 'article', locale: 'ja_JP', images: [{ url: ogImageUrl(TITLE), width: 1200, height: 630, alt: TITLE }] },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, images: [ogImageUrl(TITLE)] },
};

const S = {
  moj: { name: '登記・供託オンライン申請システム「登記・供託オンライン申請システムで取り扱う文字について」', url: 'https://www.touki-kyoutaku-online.moj.go.jp/cautions/kankyo/charaset.html' },
  freee: { name: 'freee会社設立 ヘルプ「登記書類をオンラインで提出する」', url: 'https://support.freee.co.jp/hc/ja/articles/4406111376665' },
  mf: { name: 'マネーフォワード クラウド会社設立「電子申請で使用できる全角文字を一覧で確認できますか？」', url: 'https://biz.moneyforward.com/support/establish/faq/establish2/f089.html' },
} as const;
type K = keyof typeof S;

const KEIKA = [
  { icon: AlertTriangle, h: '電子申請でエラー', d: '代表者の印鑑証明書の住所にある「塚」が旧字体。その字を入れられず、提出書類と一致しなくなった。' },
  { icon: Building, h: '法務局に聞いた', d: '電子申請のことは分からないと言われ、紙での申請を勧められた。' },
  { icon: Keyboard, h: '会社設立のサービスに聞いた', d: '行政に確かめてほしい、という答えだった。' },
  { icon: CheckCircle2, h: '普通の「塚」で出し直した', d: '登記は完了した。' },
];

const TE = [
  { icon: Search, h: '法務省のソフトの漢字検索で入れる', d: '申請用総合ソフトの漢字検索では、会社の登記で「登記統一文字」をすべて入力できる、と法務省は案内しています。' },
  { icon: Keyboard, h: '使える字に置き換える', d: '使えない字には、代わりの字を入れるよう案内されています。私たちは普通の「塚」に置き換えて完了しました。' },
  { icon: FileText, h: '紙で申請する', d: '法務局で勧められた方法です。電子申請の文字の決まりを気にせずに済みます。' },
];

const FAQS = [
  { q: '登記の電子申請で使えない漢字（外字）はどれですか？', a: '法務省の案内では、JIS第3水準・第4水準の文字は使えません。会社設立のサービスでは、JIS第1・第2水準などの使える文字の一覧を用意しているところもあります（freee会社設立・マネーフォワード クラウド会社設立）。' },
  { q: '印鑑証明書と違う字体で申請して大丈夫ですか？', a: '私たちは普通の「塚」で出し直して登記が完了しました。ただ、扱いは申請の内容で変わることがあるため、不安なときは申請先の法務局に確かめてください。' },
  { q: '旧字体があるか、申請の前に確かめる方法は？', a: '印鑑証明書（または住民票）の住所と氏名を、一字ずつ見ます。点の位置や形が違う字は、旧字体の可能性があります。会社設立のサービスで使える文字の一覧があれば、照らし合わせます。' },
];

function src(keys: K[]) {
  return keys.map((k, i) => (
    <span key={k}>{i > 0 && '・'}<a href={S[k].url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">{S[k].name}</a></span>
  ));
}

const H2 = 'text-[22px] font-black leading-snug text-slate-900';
const SRC = 'text-[11px] leading-relaxed text-slate-500';

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    { '@type': 'Article', author: KAKITE_LD, publisher: { '@id': 'https://www.tsuginotenavi.jp/#organization' }, headline: TITLE, description: DESCRIPTION, inLanguage: 'ja', datePublished: '2026-11-16T20:00:00+09:00', dateModified: '2026-11-16T20:00:00+09:00', mainEntityOfPage: `${SITE_URL}${PATH}`, about: { '@type': 'Thing', name: '会社設立の電子申請で使える文字' } },
    { '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: SITE_NAME, item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: '法人成り', item: `${SITE_URL}/guide/houjin` },
      { '@type': 'ListItem', position: 3, name: '電子申請の旧字体', item: `${SITE_URL}${PATH}` },
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
      <LpViewTracker lpId={LP_ID} version="v2-2026-11-28" />
      <main className="mx-auto flex w-full max-w-[520px] flex-1 flex-col gap-14 px-4 pt-4 pb-16">
        {hasExit && (
          <p className="-mb-10 flex flex-wrap items-center gap-x-2 text-[11px] text-slate-500">
            <span className="rounded border border-slate-300 px-1.5 tracking-widest">PR</span>
            <span>当サイトは紹介料を受け取っています</span>
            <Link href="/policy" className="text-sky-800 underline underline-offset-2">中立性ポリシー</Link>
          </p>
        )}
        <nav aria-label="現在の位置" className="-mb-10 text-[12px] text-slate-500">
          <Link href="/" className="underline underline-offset-2">ホーム</Link><span className="mx-1.5">/</span>
          <Link href="/guide/houjin" className="underline underline-offset-2">法人成り</Link><span className="mx-1.5">/</span>
          <span>電子申請の旧字体</span>
        </nav>

        <section className="flex flex-col gap-5" aria-labelledby="top">
          <div className="flex flex-col gap-2">
            <p className="text-[13px] font-bold text-sky-700">運営会社の実例</p>
            <h1 id="top" className="text-[28px] font-black leading-tight text-slate-900">登記で旧字体がエラー<br /><span className="text-[22px] text-orange-600">印鑑証明書の「塚」が使えなかった</span></h1>
            <p className="text-[14px] text-slate-600">会社設立の登記を、電子申請で出したときの実例です。</p>
            <KakiteLine />
          </div>
          <p className="rounded-2xl bg-white p-4 text-[14px] leading-relaxed text-slate-800 ring-1 ring-slate-200">
            <span className="mb-1 block text-[12px] font-black text-sky-700">結論</span>
            代表者の印鑑証明書の住所にあった旧字体の「塚」は、電子申請で使えませんでした。普通の「塚」で出し直し、登記は完了しました。電子申請では、JIS第3水準・第4水準の字は使えないと法務省は案内しています。
          </p>
          <p className={SRC}>出典：{src(['moj'])}（{CHECKED} 確認）</p>
        </section>

        <section className="flex flex-col gap-5" aria-labelledby="keika">
          <h2 id="keika" className={H2}>旧字体で止まってから、登記まで</h2>
          <ol className="grid gap-2.5">
            {KEIKA.map(({ icon: I, h, d }, i) => (
              <li key={h} className="flex items-start gap-3 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${i === KEIKA.length - 1 ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}><I size={18} aria-hidden="true" /></span>
                <span className="flex flex-col gap-0.5"><span className="text-[15px] font-black text-slate-900">{h}</span><span className="text-[13px] leading-relaxed text-slate-600">{d}</span></span>
              </li>
            ))}
          </ol>
          <p className="flex items-start gap-2 text-[13px] text-slate-700"><Info size={18} className="mt-0.5 shrink-0 text-sky-700" aria-hidden="true" />どこに聞いても、電子申請での答えは出ませんでした。</p>
        </section>

        <section className="flex flex-col gap-5" aria-labelledby="moji">
          <h2 id="moji" className={H2}>電子申請で使える字・使えない字</h2>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1 rounded-2xl bg-emerald-50 p-4 ring-1 ring-emerald-200">
              <p className="text-[15px] font-black text-emerald-900">使える</p>
              <p className="text-[13px] leading-relaxed text-emerald-950">JIS第1・第2水準の漢字、かな、英数字、記号の一部</p>
            </div>
            <div className="flex flex-col gap-1 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
              <p className="text-[15px] font-black text-slate-900">使えない</p>
              <p className="text-[13px] leading-relaxed text-slate-700">JIS第3・第4水準の漢字。旧字体などの外字には、ここに入る字がある</p>
            </div>
          </div>
          <p className={SRC}>出典：{src(['moj', 'freee'])}（{CHECKED} 確認）</p>
        </section>

        <section className="flex flex-col gap-5" aria-labelledby="te">
          <h2 id="te" className={H2}>旧字体が使えないときの3つの手</h2>
          <ol className="grid gap-2.5">
            {TE.map(({ icon: I, h, d }, i) => (
              <li key={h} className="flex items-start gap-3 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-[15px] font-black text-sky-700">{i + 1}</span>
                <span className="flex flex-col gap-0.5"><span className="flex items-center gap-1.5 text-[15px] font-black text-slate-900"><I size={16} className="text-sky-700" aria-hidden="true" />{h}</span><span className="text-[13px] leading-relaxed text-slate-600">{d}</span></span>
              </li>
            ))}
          </ol>
          <p className={SRC}>出典：{src(['moj'])}（{CHECKED} 確認）</p>
          <p className="rounded-2xl bg-orange-50 p-4 text-[13px] font-bold leading-relaxed text-orange-950 ring-1 ring-orange-200">
            申請の前に、印鑑証明書の住所と氏名を一字ずつ見ておきます。会社設立のサービスによっては、使える文字の一覧を用意しています。
          </p>
          <p className={SRC}>出典：{src(['mf', 'freee'])}（{CHECKED} 確認）</p>
        </section>

        <section className="flex flex-col gap-5" aria-labelledby="tsugi">
          <h2 id="tsugi" className={H2}>登記が終わったら、法人口座</h2>
          <p className="text-[13px] text-slate-600">銀行の申込は、登記どおりの字で入れます。私たちは法人の住所に自宅を入れてしまい、一度手続きが止まりました。</p>
          <ul className="grid gap-2">
            {[
              { href: '/guide/houjin/kouza-tsukurenai', h: '法人口座が作れない', s: '3行に申し込み、通ったのは1行' },
              { href: '/guide/houjin/paypay-houjin-kouza', h: 'PayPay銀行の法人口座', s: '設立直後でも審査に通った実例と必要書類' },
            ].map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="flex items-center gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-slate-200 hover:ring-slate-300">
                  <span className="flex flex-1 flex-col"><span className="text-[15px] font-black text-slate-900">{l.h}</span><span className="text-[12px] text-slate-600">{l.s}</span></span>
                  <ArrowRight size={18} className="text-sky-700" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
          {hasExit && (
            <HoujinExit
              lpId={LP_ID} partner="raksulBank" position="tsugi" lead="登記が終わった会社の申込先の候補"
              note="ラクスルバンクは、設立したばかりで取引の書類がまだない会社が出せる書類として、代表者が署名・捺印した事業計画書を挙げています（これを出せば通るとは限りません）。口座はGMOあおぞらネット銀行のラクスルバンク支店で、審査もGMOあおぞらネット銀行が行います。私たちはGMOあおぞらネット銀行に直接申し込んで落ちています。"
            />
          )}
          {hasExit && (
            <p className={SRC}>出典：<a href="https://support.raksulbank.com/faq/show/1293?site_domain=default" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">ラクスルバンク よくあるご質問「口座開設の際、必要書類は何を提出すればいいですか。」</a>・<a href="https://gmo-aozora.com/provision/pdf/raksul_260816.pdf" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">GMOあおぞらネット銀行「ラクスルバンク支店に関する特約」</a>（2026/11/27 確認）</p>
          )}
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
          <p className={SRC}>出典：{src(['moj', 'freee', 'mf'])}（{CHECKED} 確認）</p>
        </section>

        <Link href="/guide/houjin" className="flex items-center gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-slate-200 hover:ring-slate-300">
          <span className="flex flex-1 flex-col"><span className="text-[15px] font-black text-slate-900">法人成りのページ一覧</span><span className="text-[12px] text-slate-600">設立から口座まで、つまずいた所</span></span>
          <ArrowRight size={18} className="text-sky-700" aria-hidden="true" />
        </Link>

        <KakiteNote />
        <p className="text-[11px] leading-relaxed text-slate-400">
          体験は運営会社（BlueAdventures合同会社）が2026年10月に設立の登記を電子申請したときのものです。扱いは申請の内容で変わることがあるため、迷うときは申請先の法務局に確かめてください。最終更新：2026年11月16日
        </p>
      </main>
      <LpFooter />
    </div>
  );
}
