import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, CalendarClock, FileText, Info, Laptop, Paperclip, Send, Smartphone } from 'lucide-react';
import LpHeader from '@/components/lp/LpHeader';
import LpFooter from '@/components/lp/LpFooter';
import LpViewTracker from '@/components/lp/LpViewTracker';
import { KakiteLine, KakiteNote, KAKITE_LD } from '@/components/houjin/Kakite';
import HoujinExit from '@/components/houjin/HoujinExit';
import { SITE_URL, SITE_NAME, ogImageUrl } from '@/components/loan/LoanArticle';
import { HOUJIN_PARTNERS } from '@/lib/houjin/partners';

/**
 * 法人設立届出書の書き方：合同会社の欄ごとの書き方と期限・添付書類・出し方（2026-11-25 作成。houjin-plan.md の順番表 5）。
 * 受ける言葉（キーワードプランナー 2025/11〜2026/10 の月平均、11/24 確認）：法人設立届出書 4,400（主）。
 * 上位（11/25 1:00、Google「法人設立届出書」）：国税庁（C1-4・記載要領）・弥生・小さな税理士事務所2つ・会社設立の解説・
 *   地方税共同機構（地方税の記載要領）・マネーフォワード。よくある質問：どこでもらえる・必須か・どうやって出す・出さないとどうなる。
 *   上位に欠けている点：
 *   ①今の様式（様式ID NTA1HOZ600010090）の欄の番号（F02・G03・G04 など）に沿った書き方。合同会社は組織区分（名称）が「28」
 *   ②合同会社・資本金1,000万円未満・役員報酬0円の会社で、空欄でよい欄と迷う欄（消費税の新設法人・設立の形態・給与支払事務所）
 *   ③出し方3つ（e-Tax・書面・法人設立ワンストップサービス）を並べたもの
 * 書き方は国税庁の様式と「法人設立届出書の記載要領等」だけ（11/25、Chrome で原文を確認）。期限・添付は C1-4・No.5100。
 * 運営会社の例は houjin-plan.md「実体験の事実」の範囲（設立日・資本金・事業年度・社名の位置）。提出日・税務署名・住所は書かない。
 *   「設立の形態」は運営会社が何番を選んだか確かめていないため、例を書かない。
 * 出口：ラクスルバンク（1つだけ）。口座の段に置く。
 */
const LP_ID = 'guide-houjin-setsuritsu-todoke';
const PATH = '/guide/houjin/houjin-setsuritsu-todokedesho';
const CHECKED = '2026/11/25';
const TITLE = '法人設立届出書の書き方｜合同会社の欄ごとの記入と期限（2か月以内）・添付書類・出し方';
const DESCRIPTION = '法人設立届出書の書き方を、今の様式の欄ごとに、合同会社の例で整理しました。期限は設立の日から2か月以内、添付は定款の写し。組織区分の「28」、資本金1,000万円未満なら空欄の欄、設立の形態の番号。e-Tax・書面・法人設立ワンストップサービスの出し方も。';

export const metadata: Metadata = {
  title: `${TITLE} | ${SITE_NAME}`,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}${PATH}` },
  openGraph: { title: TITLE, description: DESCRIPTION, url: `${SITE_URL}${PATH}`, siteName: SITE_NAME, type: 'article', locale: 'ja_JP', images: [{ url: ogImageUrl(TITLE), width: 1200, height: 630, alt: TITLE }] },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, images: [ogImageUrl(TITLE)] },
};

const S = {
  c14: { name: '国税庁「C1-4 内国普通法人等の設立の届出」', url: 'https://www.nta.go.jp/taxes/tetsuzuki/shinsei/annai/hojin/annai/1554_2.htm' },
  yoshiki: { name: '国税庁「法人設立届出書」（様式）', url: 'https://www.nta.go.jp/law/tsutatsu/kobetsu/hojin/010705/pdf/HOZ600.pdf' },
  yoryo: { name: '国税庁「法人設立届出書の記載要領等」', url: 'https://www.nta.go.jp/law/tsutatsu/kobetsu/hojin/010705/pdf/001-1.pdf' },
  no5100: { name: '国税庁 タックスアンサー No.5100「新設法人の届出書類」', url: 'https://www.nta.go.jp/taxes/shiraberu/taxanswer/hojin/5100.htm' },
  oss: { name: '国税庁「法人設立ワンストップサービスの対象が全ての手続に拡大されました」', url: 'https://www.nta.go.jp/taxes/tetsuzuki/shinsei/annai/hojin/annai/OSS.htm' },
  kyuyo: { name: '国税庁「A2-7 給与支払事務所等の開設・移転・廃止の届出」', url: 'https://www.nta.go.jp/taxes/tetsuzuki/shinsei/annai/gensen/annai/1648_11.htm' },
  raksul1293: { name: 'ラクスルバンク よくあるご質問（口座開設の必要書類）', url: 'https://support.raksulbank.com/faq/show/1293?site_domain=default' },
  raksul33: { name: 'ラクスルバンク よくあるご質問（審査にかかる時間）', url: 'https://support.raksulbank.com/faq/show/33?site_domain=default' },
} as const;
type K = keyof typeof S;

/** 欄ごとの書き方（記載要領と様式の記載だけ）。ex は運営会社の例（書いてよい事実の範囲） */
const RAN: { code: string; h: string; d: string; ex?: string; tag?: 'kara' | 'mayou' }[] = [
  { code: 'F02', h: '法人番号', d: '13桁の法人番号。出す日にまだ指定を受けていなければ、書かなくてよい' },
  { code: 'E01', h: '本店又は主たる事務所の所在地', d: '登記してある本店の所在地', ex: 'バーチャルオフィスなら、登記した住所' },
  { code: 'E03', h: '法人名', d: '登記どおりの社名', ex: 'BlueAdventures合同会社' },
  { code: 'G03', h: '組織区分（位置）', d: '「合同会社」が社名の前なら1、後なら2', ex: '2（社名の後ろに「合同会社」）' },
  { code: 'G04', h: '組織区分（名称）', d: '様式の下にある番号から選ぶ', ex: '28（合同会社）' },
  { code: 'G01', h: '設立時の資本金又は出資金の額', d: '設立のときに登記した資本金の額', ex: '500,000円' },
  { code: 'H07', h: '代表者氏名・住所', d: '会社を代表する人の氏名と住所' },
  { code: 'N01', h: '設立年月日', d: '登記簿に書かれている登記の年月日', ex: '令和8年10月28日' },
  { code: 'U01', h: '事業年度', d: '定款などで決めた会計期間', ex: '10月1日〜9月30日' },
  { code: 'N02', h: '消費税の新設法人に該当することとなった事業年度開始の日', d: '設立時の資本金が1,000万円以上のときだけ書く', ex: '資本金50万円なので書かない', tag: 'kara' },
  { code: 'E04', h: '事業の目的', d: '定款の目的のうち主なものと、今している・する予定の事業' },
  { code: '', h: '支店・出張所・工場等', d: '登記の有無にかかわらず、支店・営業所・事務所などを全部書く。なければ空欄', tag: 'kara' },
  { code: 'G02', h: '設立の形態（区分1）', d: '1 個人企業を法人組織にした／2 合併／3 新設分割／4 現物出資／5 その他（内容を区分4の欄に書く）', tag: 'mayou' },
  { code: '', h: '事業開始（見込み）年月日', d: '設立後に事業を始めた日か、始める見込みの日' },
  { code: '', h: '「給与支払事務所等の開設届出書」提出の有無', d: '出したなら1、出していなければ2。給与の支払事務を扱う事務所を設けたら、1か月以内にこの届出書が要る', tag: 'mayou' },
  { code: '', h: '添付書類', d: '1（定款等の写し）に印をつける' },
];

const DASHIKATA = [
  { icon: Laptop, h: 'e-Tax（電子申告）', d: '国税庁が案内している出し方。初めてなら利用者識別番号の取得が要る' },
  { icon: Send, h: '書面', d: '届出書と添付書類を1部、税務署に持っていくか送る' },
  { icon: Smartphone, h: '法人設立ワンストップサービス', d: 'マイナポータルで、国税・地方税の設立の届出などをまとめて出せる。代表者のマイナンバーカードが要る' },
];

const FAQS = [
  { q: '法人設立届出書は、出さなければいけませんか？', a: '国税庁は、普通法人などを設立した場合は、設立の日（設立登記の日）以後2か月以内に、法人設立届出書を税務署に出さなければならないとしています。合同会社も対象です。' },
  { q: '法人設立届出書の用紙はどこでもらえますか？', a: '国税庁のホームページ「C1-4 内国普通法人等の設立の届出」から、様式と記載要領をダウンロードできます。e-Taxや法人設立ワンストップサービスなら、画面で作って出せます。' },
  { q: '添付書類は何ですか？', a: '定款などの写しです。国税庁の記載要領では、定款・寄附行為・規則・規約などの写しを添付するとしています。' },
  { q: '都道府県や市町村にも出しますか？', a: '税務署とは別に、都道府県・市町村にも法人設立の届出をします。期限と様式は自治体ごとに違うため、本店のある自治体の案内で確かめてください。法人設立ワンストップサービスでは、地方税の設立の届出もまとめて出せます。' },
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
    { '@type': 'Article', author: KAKITE_LD, publisher: { '@id': 'https://www.tsuginotenavi.jp/#organization' }, headline: TITLE, description: DESCRIPTION, inLanguage: 'ja', about: { '@type': 'Thing', name: '法人設立届出書' }, datePublished: '2026-11-25T02:00:00+09:00', dateModified: '2026-11-25T02:00:00+09:00', mainEntityOfPage: `${SITE_URL}${PATH}` },
    { '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: SITE_NAME, item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: '法人成り', item: `${SITE_URL}/guide/houjin` },
      { '@type': 'ListItem', position: 3, name: '法人設立届出書の書き方', item: `${SITE_URL}${PATH}` },
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
          <span>法人設立届出書の書き方</span>
        </nav>

        <section className="flex flex-col gap-5" aria-labelledby="top">
          <div className="flex flex-col gap-2">
            <p className="text-[13px] font-bold text-sky-700">今の様式の欄ごとに</p>
            <h1 id="top" className="text-[28px] font-black leading-tight text-slate-900">法人設立届出書の<br />書き方<br /><span className="text-[20px] text-orange-600">合同会社の記入の例</span></h1>
            <KakiteLine />
          </div>
          <ul className="grid grid-cols-3 gap-2" aria-label="法人設立届出書の要点">
            {[
              { icon: CalendarClock, big: '2か月以内', s: '設立の日から' },
              { icon: Paperclip, big: '定款の写し', s: '添付する' },
              { icon: FileText, big: '28', s: '合同会社の組織区分' },
            ].map(({ icon: I, big, s }) => (
              <li key={s} className="flex flex-col items-center gap-1 rounded-2xl bg-white px-2 py-3.5 text-center ring-1 ring-slate-200">
                <I size={18} className="text-sky-700" aria-hidden="true" />
                <span className="text-[17px] font-black leading-none text-orange-600">{big}</span>
                <span className="text-[11px] leading-snug text-slate-600">{s}</span>
              </li>
            ))}
          </ul>
          <p className="rounded-2xl bg-white p-4 text-[14px] leading-relaxed text-slate-800 ring-1 ring-slate-200">
            <span className="mb-1 block text-[12px] font-black text-sky-700">結論</span>
            法人設立届出書は、設立の日（設立登記の日）から2か月以内に、定款の写しをつけて税務署に出します。合同会社は組織区分（名称）が「28」。資本金1,000万円未満なら、消費税の新設法人の欄は書きません。迷いやすいのは「設立の形態」と「給与支払事務所等の開設届出書の有無」の2つです。
          </p>
          <p className={SRC}>出典：{src(['c14', 'yoryo', 'yoshiki'])}（{CHECKED} 確認）</p>
        </section>

        <section className={SECTION} aria-labelledby="ran">
          <h2 id="ran" className={H2}>欄ごとの書き方</h2>
          <p className="text-[13px] text-slate-600">左の記号は、様式の欄の番号です。「例」は私たちの会社の場合。</p>
          <ul className="grid gap-2">
            {RAN.map((r) => (
              <li key={r.h} className={`flex flex-col gap-1.5 rounded-2xl p-3.5 ring-1 ${r.tag === 'mayou' ? 'bg-amber-50 ring-amber-200' : 'bg-white ring-slate-200'}`}>
                <span className="flex flex-wrap items-center gap-2">
                  {r.code && <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] font-bold text-slate-600">{r.code}</span>}
                  <span className="text-[15px] font-black leading-snug text-slate-900">{r.h}</span>
                  {r.tag === 'kara' && <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[11px] font-bold text-emerald-800">空欄のことが多い</span>}
                  {r.tag === 'mayou' && <span className="rounded bg-amber-200 px-1.5 py-0.5 text-[11px] font-bold text-amber-900">迷いやすい</span>}
                </span>
                <span className="text-[13px] leading-relaxed text-slate-700">{r.d}</span>
                {r.ex && <span className="text-[12px] text-sky-800"><span className="mr-1 font-bold">例</span>{r.ex}</span>}
              </li>
            ))}
          </ul>
          <p className="flex items-start gap-2 text-[13px] text-slate-700"><Info size={18} className="mt-0.5 shrink-0 text-sky-700" aria-hidden="true" />代表者が会社員のまま役員報酬0円で、給与を払う人がいないときの「給与支払事務所等の開設届出書」の扱いは、税務署に確かめてください。</p>
          <p className={SRC}>出典：{src(['yoryo', 'yoshiki', 'kyuyo'])}（{CHECKED} 確認）</p>
        </section>

        <section className={SECTION} aria-labelledby="dashikata">
          <h2 id="dashikata" className={H2}>出し方3つ</h2>
          <ul className="grid gap-2.5">
            {DASHIKATA.map(({ icon: I, h, d }) => (
              <li key={h} className="flex items-start gap-3 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-700"><I size={20} aria-hidden="true" /></span>
                <span className="flex flex-1 flex-col gap-1">
                  <span className="text-[15px] font-black text-slate-900">{h}</span>
                  <span className="text-[13px] leading-relaxed text-slate-600">{d}</span>
                </span>
              </li>
            ))}
          </ul>
          <p className="text-[13px] leading-relaxed text-slate-700">私たちは、設立後の届出をマネーフォワード会社設立で作りました。</p>
          <p className={SRC}>出典：{src(['c14', 'oss'])}（{CHECKED} 確認）</p>
        </section>

        <section className={SECTION} aria-labelledby="kouza">
          <h2 id="kouza" className={H2}>届出と並行して、法人口座</h2>
          <p className="text-[13px] leading-relaxed text-slate-700">法人口座には期限がありませんが、審査に日数がかかります。私たちは設立から19日で審査に通りました。設立直後は、請求書や契約書がまだなく、「事業が分かる資料」で止まりやすくなります。</p>
          <Link href="/guide/houjin" className="flex items-center gap-3 rounded-2xl border-2 border-sky-200 bg-sky-50/60 p-3.5 hover:border-sky-300">
            <FileText size={22} className="shrink-0 text-sky-700" aria-hidden="true" />
            <span className="flex flex-1 flex-col"><span className="text-[15px] font-black text-slate-900">法人口座の開設（まとめ）</span><span className="text-[12px] text-slate-600">ネット銀行3つに申し込んだ記録</span></span>
            <ArrowRight size={18} className="text-sky-700" aria-hidden="true" />
          </Link>
          {hasExit && (
            <HoujinExit
              lpId={LP_ID} partner="raksulBank" position="kouza" lead="請求書も契約書もまだない会社の申込先に"
              note="ラクスルバンクは、設立直後の会社は事業計画書（代表者の署名・捺印）を事業内容の資料として出せるとしています。審査はGMOあおぞらネット銀行で、私たちは設立直後にGMOあおぞらネット銀行に直接申し込んで通りませんでした。それを知ったうえで、申込先の一つとして載せています。"
            />
          )}
          {hasExit && <p className={SRC}>出典：{src(['raksul1293', 'raksul33'])}（2026/11/17 確認）</p>}
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
          <p className={`${SRC} mt-1`}>出典：{src(['no5100', 'c14', 'yoryo', 'oss'])}（{CHECKED} 確認）</p>
        </section>

        <nav aria-label="あわせて読む" className="flex flex-col gap-2">
          {[
            { href: '/guide/houjin/setsuritsu-go-yarukoto', t: '会社設立後にやること', s: '届出と期限。役員報酬0円の場合' },
            { href: '/guide/houjin/rireki-jikou-shoumeisho', t: '履歴事項全部証明書の取り方', s: '2026年4月からの手数料' },
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
          書き方は国税庁の様式（様式ID NTA1HOZ600010090）と記載要領、期限と出し方は国税庁の案内（{CHECKED} 確認）です。様式は変わることがあります。会社の状況で書く内容は変わるため、迷うときは税務署か税理士に確かめてください。最終更新：2026年11月25日
        </p>
      </main>
      <LpFooter />
    </div>
  );
}
