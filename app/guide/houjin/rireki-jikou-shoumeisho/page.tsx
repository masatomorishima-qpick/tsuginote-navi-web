import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Building2, CheckCircle2, Clock, Globe, Info, Landmark, Mail, MinusCircle, Stamp, Users } from 'lucide-react';
import LpHeader from '@/components/lp/LpHeader';
import LpFooter from '@/components/lp/LpFooter';
import LpViewTracker from '@/components/lp/LpViewTracker';
import { KakiteLine, KakiteNote, KAKITE_LD } from '@/components/houjin/Kakite';
import HoujinExit from '@/components/houjin/HoujinExit';
import { SITE_URL, SITE_NAME, ogImageUrl } from '@/components/loan/LoanArticle';
import { HOUJIN_PARTNERS } from '@/lib/houjin/partners';

/**
 * 履歴事項全部証明書の取り方：2026年4月からの手数料と、法人口座の申込で要るか（2026-11-25 作成。houjin-plan.md の順番表 3）。
 * 受ける言葉（キーワードプランナー 2025/11〜2026/10 の月平均、11/24 確認）：履歴事項全部証明書 取得 1,900（主）。
 * 上位（11/25 1:40、Google「履歴事項全部証明書 取得」）：法務局（各種証明書請求手続・オンライン請求の案内）・弁護士の媒体・弥生・
 *   マネーフォワード・freee・登記の媒体・お名前.com・みずほ銀行。よくある質問：どこで取れる・コンビニで取れる・何日かかる・誰でも取れる。
 *   上位に欠けている点：
 *   ①2026年4月1日からの手数料（書面600円・オンライン送付520円・オンライン窓口交付490円）。古い金額のままの記事がある
 *   ②設立直後の会社が、法人口座の申込で本当に要るのか（銀行ごとに要る・要らないが違う）
 *   ③印鑑証明書と一緒に取るときの違い（印鑑カード・電子証明書）
 * 数字は公式の記載だけ：法務局「主な手数料一覧【令和8年4月1日〜】」・「登記事項証明書等の請求にはオンラインでの手続が便利です」（2026/2/2 更新）・
 *   法務省「会社・法人の登記事項証明書等を請求される方へ」・日本年金機構「新規適用の手続き」（11/25 確認）。
 *   銀行の必要書類は /guide/houjin/kouza-hitsuyou-shorui と同じ公式の記載（11/17 確認）。
 * 出口：ラクスルバンク（1つだけ）。提出は本人確認書類と事業内容の資料の2種類（公式のよくある質問 1293）。
 */
const LP_ID = 'guide-houjin-rireki';
const PATH = '/guide/houjin/rireki-jikou-shoumeisho';
const CHECKED = '2026/11/25';
const TITLE = '履歴事項全部証明書の取得方法｜2026年4月からの手数料と、法人口座の申込で必要な銀行';
const DESCRIPTION = '会社の履歴事項全部証明書（登記事項証明書の一つ）の取り方を、窓口・郵送・オンラインで比べました。2026年4月1日からの手数料は600円・520円・490円。設立直後の会社が法人口座の申込で使うか、銀行ごとの違いと、印鑑証明書を一緒に取るときの注意。';

export const metadata: Metadata = {
  title: `${TITLE} | ${SITE_NAME}`,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}${PATH}` },
  openGraph: { title: TITLE, description: DESCRIPTION, url: `${SITE_URL}${PATH}`, siteName: SITE_NAME, type: 'article', locale: 'ja_JP', images: [{ url: ogImageUrl(TITLE), width: 1200, height: 630, alt: TITLE }] },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, images: [ogImageUrl(TITLE)] },
};

const S = {
  tesuryo: { name: '法務局「主な手数料一覧【令和8年4月1日〜】」', url: 'https://houmukyoku.moj.go.jp/homu/content/001460398.pdf' },
  online: { name: '法務局「登記事項証明書等の請求にはオンラインでの手続が便利です」', url: 'https://houmukyoku.moj.go.jp/homu/static/online_syoumei_annai.html' },
  seikyu: { name: '法務局「各種証明書請求手続」', url: 'https://houmukyoku.moj.go.jp/homu/category_00002.html' },
  moj: { name: '法務省「会社・法人の登記事項証明書等を請求される方へ」', url: 'https://www.moj.go.jp/MINJI/minji11.html' },
  nenkin: { name: '日本年金機構「新規適用の手続き」', url: 'https://www.nenkin.go.jp/service/kounen/tekiyo/jigyosho/20150311.html' },
  rakuten: { name: '楽天銀行「法人ビジネス口座開設に必要な書類一覧」', url: 'https://www.rakuten-bank.co.jp/business/account/id.html' },
  mizuho: { name: 'みずほ銀行「法人口座開設に必要な書類は？」', url: 'https://www.mizuhobank.co.jp/corporate/account/tips/topic_47.html' },
  paypay: { name: 'PayPay銀行「口座開設に必要な書類（法人のお客さま）」', url: 'https://www.paypay-bank.co.jp/business/account/documents.html' },
  raksul: { name: 'ラクスルバンク よくあるご質問（口座開設の必要書類）', url: 'https://support.raksulbank.com/faq/show/1293?site_domain=default' },
} as const;
type K = keyof typeof S;

/** 取り方3つ（2026年4月1日からの手数料。1通） */
const TORIKATA = [
  { icon: Globe, h: 'オンライン請求・登記所で受取', yen: '490円', d: 'インターネットで請求。手数料はネットバンキングかペイジー対応のATMで納める', best: true },
  { icon: Mail, h: 'オンライン請求・郵送で受取', yen: '520円', d: '家や会社にいながら請求して、郵便で受け取る', best: false },
  { icon: Building2, h: '窓口・郵送で請求', yen: '600円', d: '申請書に収入印紙を貼って、登記所の窓口に出すか郵送する', best: false },
];

/** 法人口座の申込などで要るか（公式の記載だけ） */
const IRU = [
  { who: '楽天銀行', need: true, d: '履歴事項全部証明書の原本。印鑑証明書の原本も', src: ['rakuten'] as K[] },
  { who: 'みずほ銀行', need: true, d: '登記事項証明書。店舗では発行から6か月以内の原本', src: ['mizuho'] as K[] },
  { who: 'PayPay銀行', need: false, d: '履歴事項全部証明書は必要書類にない。法人の印鑑証明書（発行から6か月以内の原本）は要る', src: ['paypay'] as K[] },
  { who: 'ラクスルバンク', need: false, d: '履歴事項全部証明書は必要書類にない。提出は本人確認書類と事業内容の資料の2種類', src: ['raksul'] as K[] },
];

const FAQS = [
  { q: '履歴事項全部証明書はどこで取れますか？', a: '登記所（法務局）の窓口、郵送、オンラインで請求できます。最寄りの登記所で、ほかの登記所が担当する会社の登記事項証明書も取れます。オンラインで請求した証明書は、郵送でも、最寄りの登記所や法務局証明サービスセンターでも受け取れます。' },
  { q: '手数料はいくらですか？', a: '2026年4月1日から、1通あたり窓口・郵送での請求が600円、オンライン請求で郵送の受け取りが520円、オンライン請求で窓口の受け取りが490円です。' },
  { q: '誰でも取れますか？', a: '法務省は、会社・法人の登記事項証明書は、どなたでも所定の手数料を納めて請求できるとしています。会社の代表者でなくても取れます。' },
  { q: '夜や休日にも請求できますか？', a: 'オンラインなら平日は午前8時30分から午後11時まで、休日は午前8時30分から午後6時まで請求できます。ただし午後5時15分以降の請求は、次の業務日の午前8時30分以降の受け付けになります。' },
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
    { '@type': 'Article', author: KAKITE_LD, publisher: { '@id': 'https://www.tsuginotenavi.jp/#organization' }, headline: TITLE, description: DESCRIPTION, inLanguage: 'ja', about: { '@type': 'Thing', name: '履歴事項全部証明書' }, datePublished: '2026-11-25T04:00:00+09:00', dateModified: '2026-11-25T04:00:00+09:00', mainEntityOfPage: `${SITE_URL}${PATH}` },
    { '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: SITE_NAME, item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: '法人成り', item: `${SITE_URL}/guide/houjin` },
      { '@type': 'ListItem', position: 3, name: '履歴事項全部証明書の取り方', item: `${SITE_URL}${PATH}` },
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
          <span>履歴事項全部証明書の取り方</span>
        </nav>

        <section className="flex flex-col gap-5" aria-labelledby="top">
          <div className="flex flex-col gap-2">
            <p className="text-[13px] font-bold text-sky-700">2026年4月1日からの手数料</p>
            <h1 id="top" className="text-[28px] font-black leading-tight text-slate-900">履歴事項全部証明書の<br />取り方（取得方法）<br /><span className="text-[20px] text-orange-600">2026年4月からの手数料</span></h1>
            <KakiteLine />
          </div>
          <ul className="grid grid-cols-3 gap-2" aria-label="1通の手数料">
            {[
              { big: '490円', s: 'オンライン請求・登記所で受取' },
              { big: '520円', s: 'オンライン請求・郵送で受取' },
              { big: '600円', s: '窓口・郵送で請求' },
            ].map((k, i) => (
              <li key={k.s} className={`flex flex-col items-center gap-0.5 rounded-2xl px-2 py-3.5 text-center ring-1 ${i === 0 ? 'bg-orange-50 ring-orange-200' : 'bg-white ring-slate-200'}`}>
                <span className="text-[24px] font-black leading-none text-orange-600">{k.big}</span>
                <span className="text-[11px] leading-snug text-slate-600">{k.s}</span>
              </li>
            ))}
          </ul>
          <p className="rounded-2xl bg-white p-4 text-[14px] leading-relaxed text-slate-800 ring-1 ring-slate-200">
            <span className="mb-1 block text-[12px] font-black text-sky-700">結論</span>
            いちばん安いのは、オンラインで請求して登記所で受け取る490円です。法人口座の申込で要るかは銀行しだいで、比べた4つの銀行のうち2つは必要書類に入っていませんでした。取る前に、出す先の案内を確かめてください。
          </p>
          <p className={SRC}>出典：{src(['tesuryo'])}（{CHECKED} 確認）</p>
        </section>

        <section className={SECTION} aria-labelledby="torikata">
          <h2 id="torikata" className={H2}>取り方と手数料</h2>
          <ul className="grid gap-2.5">
            {TORIKATA.map(({ icon: I, h, yen, d, best }) => (
              <li key={h} className={`flex items-start gap-3 rounded-2xl p-4 ring-1 ${best ? 'bg-orange-50/60 ring-orange-200' : 'bg-white ring-slate-200'}`}>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-700"><I size={20} aria-hidden="true" /></span>
                <span className="flex flex-1 flex-col gap-1">
                  <span className="text-[15px] font-black leading-snug text-slate-900">{h}</span>
                  <span className="text-[13px] leading-relaxed text-slate-600">{d}</span>
                </span>
                <span className="shrink-0 text-[18px] font-black text-orange-600">{yen}</span>
              </li>
            ))}
          </ul>
          <ul className="grid gap-2 text-[13px] leading-relaxed text-slate-700">
            <li className="flex items-start gap-2"><Clock size={18} className="mt-0.5 shrink-0 text-sky-700" aria-hidden="true" />オンラインは平日8時30分〜23時、休日8時30分〜18時。17時15分以降の請求は、次の業務日の受け付け</li>
            <li className="flex items-start gap-2"><Landmark size={18} className="mt-0.5 shrink-0 text-sky-700" aria-hidden="true" />最寄りの登記所で、ほかの登記所が担当する会社の証明書も取れる</li>
            <li className="flex items-start gap-2"><Users size={18} className="mt-0.5 shrink-0 text-sky-700" aria-hidden="true" />代表者でなくても、誰でも請求できる</li>
          </ul>
          <p className={SRC}>出典：{src(['tesuryo', 'online', 'seikyu', 'moj'])}（{CHECKED} 確認）</p>
        </section>

        <section className={SECTION} aria-labelledby="inkan">
          <h2 id="inkan" className={H2}>印鑑証明書も一緒に取るとき</h2>
          <div className="flex items-start gap-3 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-700"><Stamp size={20} aria-hidden="true" /></span>
            <span className="flex flex-1 flex-col gap-2">
              <span className="text-[15px] font-black text-slate-900">会社の印鑑証明書</span>
              <dl className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-1 text-[13px] leading-relaxed">
                <dt className="text-slate-500">窓口・郵送で請求</dt><dd className="text-right font-bold text-slate-800">500円</dd>
                <dt className="text-slate-500">オンライン請求・郵送で受取</dt><dd className="text-right font-bold text-slate-800">450円</dd>
                <dt className="text-slate-500">オンライン請求・登記所で受取</dt><dd className="text-right font-bold text-slate-800">420円</dd>
              </dl>
              <span className="text-[13px] leading-relaxed text-slate-600">窓口や郵送で請求するときは、印鑑カードが要ります。オンラインで請求するときは、電子証明書が要ります。</span>
            </span>
          </div>
          <p className={SRC}>出典：{src(['tesuryo', 'moj', 'seikyu'])}（{CHECKED} 確認）</p>
        </section>

        <section className={SECTION} aria-labelledby="iru">
          <h2 id="iru" className={H2}>法人口座の申込で要るか</h2>
          <ul className="grid gap-2">
            {IRU.map((r) => (
              <li key={r.who} className="flex items-start gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-slate-200">
                {r.need
                  ? <CheckCircle2 size={22} className="mt-0.5 shrink-0 text-orange-600" aria-hidden="true" />
                  : <MinusCircle size={22} className="mt-0.5 shrink-0 text-slate-400" aria-hidden="true" />}
                <span className="flex flex-1 flex-col gap-0.5">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="text-[15px] font-black text-slate-900">{r.who}</span>
                    <span className={`rounded px-1.5 py-0.5 text-[11px] font-bold ${r.need ? 'bg-orange-100 text-orange-800' : 'bg-slate-100 text-slate-600'}`}>{r.need ? '要る' : '必要書類にない'}</span>
                  </span>
                  <span className="text-[13px] leading-relaxed text-slate-600">{r.d}</span>
                </span>
              </li>
            ))}
          </ul>
          <p className="flex items-start gap-2 text-[13px] text-slate-700"><Info size={18} className="mt-0.5 shrink-0 text-sky-700" aria-hidden="true" />会社の状況によって、追加で求められることがあります。</p>
          <div className="flex items-start gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-slate-200">
            <CheckCircle2 size={22} className="mt-0.5 shrink-0 text-orange-600" aria-hidden="true" />
            <span className="flex flex-1 flex-col gap-0.5">
              <span className="text-[12px] font-bold text-slate-500">ほかに要る場面</span>
              <span className="text-[15px] font-black text-slate-900">年金事務所（社会保険の新規適用届）</span>
              <span className="text-[13px] leading-relaxed text-slate-600">登記簿謄本。提出日から90日以内に発行されたもの</span>
            </span>
          </div>
          <p className={SRC}>出典：{src(['rakuten', 'mizuho', 'paypay', 'raksul'])}（2026/11/17 確認）・{src(['nenkin'])}（{CHECKED} 確認）</p>
          {hasExit && (
            <HoujinExit
              lpId={LP_ID} partner="raksulBank" position="iru" lead="出す書類が2種類で済む申込先"
              note="ラクスルバンクの提出書類は、本人確認書類と事業内容の資料（設立直後は代表者の署名・捺印のある事業計画書も可）です。審査はGMOあおぞらネット銀行で、私たちは設立直後にGMOあおぞらネット銀行に直接申し込んで通りませんでした。それを知ったうえで、申込先の一つとして載せています。"
            />
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
          <p className={`${SRC} mt-1`}>出典：{src(['online', 'moj', 'tesuryo'])}（{CHECKED} 確認）</p>
        </section>

        <nav aria-label="あわせて読む" className="flex flex-col gap-2">
          {[
            { href: '/guide/houjin/kouza-hitsuyou-shorui', t: '法人口座の必要書類', s: '銀行4つの比較と、設立直後の事業内容の資料' },
            { href: '/guide/houjin', t: '設立直後の法人口座の開設', s: 'ネット銀行3つに申し込んだ記録' },
            { href: '/guide/houjin/kyuujitai-touki', t: '登記で旧字体がエラー', s: '印鑑証明書の「塚」が使えなかった実例' },
          ].map((l) => (
            <Link key={l.href} href={l.href} className="flex items-center gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-slate-200 hover:ring-slate-300">
              <span className="flex flex-1 flex-col"><span className="text-[15px] font-black text-slate-900">{l.t}</span><span className="text-[12px] text-slate-600">{l.s}</span></span>
              <ArrowRight size={18} className="text-sky-700" aria-hidden="true" />
            </Link>
          ))}
        </nav>

        <KakiteNote />
        <p className="text-[11px] leading-relaxed text-slate-400">
          手数料と請求の方法は法務局・法務省の公式の記載（{CHECKED} 確認）、銀行の必要書類は各銀行の公式の記載（2026年11月17日 確認）です。手数料や案内は変わることがあります。最終更新：2026年11月25日
        </p>
      </main>
      <LpFooter />
    </div>
  );
}
