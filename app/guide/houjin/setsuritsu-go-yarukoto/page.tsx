import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Banknote, Building, Coins, FileText, Info, Landmark, Receipt, ShieldCheck } from 'lucide-react';
import LpHeader from '@/components/lp/LpHeader';
import LpFooter from '@/components/lp/LpFooter';
import LpViewTracker from '@/components/lp/LpViewTracker';
import { KakiteLine, KakiteNote, KAKITE_LD } from '@/components/houjin/Kakite';
import HoujinExit from '@/components/houjin/HoujinExit';
import { SITE_URL, SITE_NAME, ogImageUrl } from '@/components/loan/LoanArticle';
import { HOUJIN_PARTNERS } from '@/lib/houjin/partners';

/**
 * 会社設立後にやること：1人・役員報酬0円の合同会社の届出と期限（2026-11-25 作成。houjin-plan.md の順番表 2）。
 * 受ける言葉（キーワードプランナー 2025/11〜2026/10 の月平均、11/24 確認）：
 *   会社設立 後 やること 140（主）・法人成り 手続き 110・会社設立 届出 110・会社設立 後 手続き 70・合同会社 設立 後 やること 50。
 * 上位（11/25 0:55、Google「会社設立 後 やること」）：freee・弥生・マネーフォワード・税理士の紹介会社・GMOあおぞらネット銀行・
 *   会社設立の代行・司法書士の媒体・会社設立の税理士・手続きの解説。どれも届出を全部並べた一覧表（従業員を雇う会社の目線）。
 *   上位に欠けている点：
 *   ①1人・役員報酬0円・従業員なしの会社で、どれが今すぐ要り、どれが「払い始めたとき」でよいかの仕分け
 *   ②期限の早い順に並べた見取り図（表は提出先ごとで、順番が分からない）
 *   ③実際に設立した会社の記録（口座まで）
 * 期限は公式の記載だけ（国税庁 C1-4・C1-19・A2-7・No.5100、日本年金機構「新規適用の手続き」「適用事業所と被保険者」。11/25 確認）。
 * 都道府県・市町村の期限は自治体ごとに違うため、数字を書かない。
 * 運営会社の事実は houjin-plan.md「実体験の事実」の範囲だけ（提出日は書かない。オーナーに確かめてから）。
 * 出口：ラクスルバンク（1つだけ）。口座の段に置く。
 */
const LP_ID = 'guide-houjin-setsuritsugo';
const PATH = '/guide/houjin/setsuritsu-go-yarukoto';
const CHECKED = '2026/11/25';
const TITLE = '会社設立後にやること｜1人・役員報酬0円の合同会社の届出と期限、法人口座までの順番';
const DESCRIPTION = '会社を設立したあとにやることを、期限の早い順に並べました。税務署・都道府県・市町村・年金事務所の届出のうち、役員報酬0円・従業員なしの会社がすぐ出すものと、払い始めたときに出すもの。設立直後の合同会社が法人口座を開くまでの実例つき。';

export const metadata: Metadata = {
  title: `${TITLE} | ${SITE_NAME}`,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}${PATH}` },
  openGraph: { title: TITLE, description: DESCRIPTION, url: `${SITE_URL}${PATH}`, siteName: SITE_NAME, type: 'article', locale: 'ja_JP', images: [{ url: ogImageUrl(TITLE), width: 1200, height: 630, alt: TITLE }] },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, images: [ogImageUrl(TITLE)] },
};

const S = {
  setsuritsu: { name: '国税庁「C1-4 内国普通法人等の設立の届出」', url: 'https://www.nta.go.jp/taxes/tetsuzuki/shinsei/annai/hojin/annai/1554_2.htm' },
  aoiro: { name: '国税庁「C1-19 青色申告書の承認の申請」', url: 'https://www.nta.go.jp/taxes/tetsuzuki/shinsei/annai/hojin/annai/1554_14.htm' },
  kyuyo: { name: '国税庁「A2-7 給与支払事務所等の開設・移転・廃止の届出」', url: 'https://www.nta.go.jp/taxes/tetsuzuki/shinsei/annai/gensen/annai/1648_11.htm' },
  no5100: { name: '国税庁 タックスアンサー No.5100「新設法人の届出書類」', url: 'https://www.nta.go.jp/taxes/shiraberu/taxanswer/hojin/5100.htm' },
  shinki: { name: '日本年金機構「新規適用の手続き」', url: 'https://www.nenkin.go.jp/service/kounen/tekiyo/jigyosho/20150311.html' },
  hihoken: { name: '日本年金機構「適用事業所と被保険者」', url: 'https://www.nenkin.go.jp/service/kounen/tekiyo/jigyosho/20150518.html' },
} as const;
type K = keyof typeof S;

type Who = 'all' | 'pay' | 'choice';
/** 期限の早い順（公式の記載だけ） */
const JUN: { when: string; h: string; to: string; who: Who; note: string; src: K[] }[] = [
  { when: '登記のあと', h: '法人口座の申込', to: '銀行', who: 'all', note: '期限はない。審査に日数がかかるので早めに', src: [] },
  { when: 'すぐ確かめる', h: '法人設立の届出', to: '都道府県・市町村', who: 'all', note: '期限と書き方は自治体ごとに違う。本店のある都道府県・市町村の案内で確かめる', src: [] },
  { when: '5日以内', h: '健康保険・厚生年金保険 新規適用届', to: '年金事務所', who: 'pay', note: '加入すべき要件を満たした日から', src: ['shinki'] },
  { when: '1か月以内', h: '給与支払事務所等の開設届出書', to: '税務署', who: 'pay', note: '給与を払う事務所を開いた日から', src: ['kyuyo'] },
  { when: '2か月以内', h: '法人設立届出書（定款の写しをつける）', to: '税務署', who: 'all', note: '設立の日（設立登記の日）から', src: ['setsuritsu', 'no5100'] },
  { when: '3か月以内', h: '青色申告の承認申請書', to: '税務署', who: 'choice', note: '設立から3か月たつ日と、1期目の終わりの日の早いほうの前日まで', src: ['aoiro'] },
];

const WHO: Record<Who, { label: string; cls: string }> = {
  all: { label: 'どの会社も', cls: 'bg-orange-100 text-orange-800' },
  pay: { label: '報酬・給与を払うとき', cls: 'bg-sky-100 text-sky-800' },
  choice: { label: '青色にするなら', cls: 'bg-slate-100 text-slate-700' },
};

/** 私たちの会社（houjin-plan.md「実体験の事実」の範囲） */
const WATASHI = [
  { h: '合同会社・代表1人', s: '2026年10月28日 設立' },
  { h: '資本金50万円', s: '事業年度は10月1日〜9月30日' },
  { h: '役員報酬0円で始めた', s: '代表は会社員を続けるため' },
  { h: '届出はマネーフォワード会社設立で作成', s: '' },
];

const FAQS = [
  { q: '会社を設立したら、まず何をしますか？', a: '期限がいちばん長いのは税務署への法人設立届出書（設立から2か月以内）ですが、法人口座は審査に日数がかかります。私たちは設立から19日で口座の審査に通りました。届出の準備と並行して、口座の申込を先に進めるのがおすすめです。' },
  { q: '役員報酬0円でも、社会保険の手続きは要りますか？', a: '日本年金機構は、法人の事業所（事業主だけの場合も含む）を加入が義務づけられた事業所とし、被保険者は働いた対価として給与などを受ける人としています。役員報酬0円で従業員もいないと、報酬を受ける人がいない状態です。手続きの要否と時期は、年金事務所に確かめてください。' },
  { q: '法人設立届出書の期限はいつですか？', a: '国税庁は、設立の日（設立登記の日）以後2か月以内に、定款などの写しをつけて税務署に出すとしています。e-Taxでも書面でも出せます。' },
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
    { '@type': 'Article', author: KAKITE_LD, publisher: { '@id': 'https://www.tsuginotenavi.jp/#organization' }, headline: TITLE, description: DESCRIPTION, inLanguage: 'ja', about: { '@type': 'Thing', name: '会社設立後の手続き' }, datePublished: '2026-11-25T03:00:00+09:00', dateModified: '2026-11-25T03:00:00+09:00', mainEntityOfPage: `${SITE_URL}${PATH}` },
    { '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: SITE_NAME, item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: '法人成り', item: `${SITE_URL}/guide/houjin` },
      { '@type': 'ListItem', position: 3, name: '会社設立後にやること', item: `${SITE_URL}${PATH}` },
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
          <span>会社設立後にやること</span>
        </nav>

        <section className="flex flex-col gap-5" aria-labelledby="top">
          <div className="flex flex-col gap-2">
            <p className="text-[13px] font-bold text-sky-700">期限の早い順</p>
            <h1 id="top" className="text-[28px] font-black leading-tight text-slate-900">会社設立後に<br />やること<br /><span className="text-[20px] text-orange-600">1人・役員報酬0円の合同会社</span></h1>
            <KakiteLine />
          </div>
          <ul className="grid grid-cols-3 gap-2" aria-label="おもな期限">
            {[
              { big: '2か月', s: '法人設立届出書' },
              { big: '3か月', s: '青色申告の申請' },
              { big: '19日', s: '私たちの口座の審査通過' },
            ].map((k) => (
              <li key={k.s} className="flex flex-col items-center gap-0.5 rounded-2xl bg-white px-2 py-3.5 text-center ring-1 ring-slate-200">
                <span className="text-[24px] font-black leading-none text-orange-600">{k.big}</span>
                <span className="text-[11px] leading-snug text-slate-600">{k.s}</span>
              </li>
            ))}
          </ul>
          <p className="rounded-2xl bg-white p-4 text-[14px] leading-relaxed text-slate-800 ring-1 ring-slate-200">
            <span className="mb-1 block text-[12px] font-black text-sky-700">結論</span>
            どの会社も出すのは、税務署の法人設立届出書（2か月以内）と、都道府県・市町村の届出です。役員報酬0円・従業員なしなら、給与と社会保険の届出は、払い始めるときに確かめます。審査に日数がかかる法人口座は、届出と並行して先に申し込みます。
          </p>
        </section>

        <section className={SECTION} aria-labelledby="jun">
          <h2 id="jun" className={H2}>期限の早い順</h2>
          <ol className="flex flex-col">
            {JUN.map((j, i) => (
              <li key={j.h} className="relative flex items-start gap-3 pb-4 last:pb-0">
                {i < JUN.length - 1 && <span className="absolute left-[35px] top-11 h-[calc(100%-2.75rem)] w-px bg-sky-200" aria-hidden="true" />}
                <span className="relative flex h-11 w-[72px] shrink-0 items-center justify-center rounded-xl bg-sky-50 text-center text-[12px] font-black leading-tight text-sky-800">{j.when}</span>
                <span className="flex flex-1 flex-col gap-1 rounded-2xl bg-white p-3.5 ring-1 ring-slate-200">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className={`rounded px-1.5 py-0.5 text-[11px] font-bold ${WHO[j.who].cls}`}>{WHO[j.who].label}</span>
                    <span className="text-[12px] text-slate-500">{j.to}</span>
                  </span>
                  <span className="text-[15px] font-black leading-snug text-slate-900">{j.h}</span>
                  <span className="text-[12px] leading-relaxed text-slate-600">{j.note}</span>
                </span>
              </li>
            ))}
          </ol>
          <p className="flex items-start gap-2 text-[13px] text-slate-700"><Info size={18} className="mt-0.5 shrink-0 text-sky-700" aria-hidden="true" />消費税・インボイスの届出は、売上や取引先によって要るかどうかが変わるため、ここには入れていません。</p>
          <p className={SRC}>出典：{src(['shinki', 'kyuyo', 'setsuritsu', 'no5100', 'aoiro'])}（{CHECKED} 確認）</p>
        </section>

        <section className={SECTION} aria-labelledby="zero">
          <h2 id="zero" className={H2}>役員報酬0円・従業員なしで変わる所</h2>
          <ul className="grid gap-2.5">
            {[
              { icon: Receipt, h: '給与支払事務所等の開設届出書', d: '給与の支払いをする事務所を開いた人が、1か月以内に出す届出です。給与を払う人がいないうちは、払い始めるときに出すものとして考えます。', src: ['kyuyo'] as K[] },
              { icon: ShieldCheck, h: '社会保険（健康保険・厚生年金保険）', d: '法人は事業主だけでも加入が義務づけられた事業所です。ただ、被保険者は働いた対価として給与などを受ける人です。報酬0円で従業員もいないと、報酬を受ける人がいません。手続きの時期は年金事務所に確かめてください。', src: ['hihoken', 'shinki'] as K[] },
            ].map(({ icon: I, h, d, src: s }) => (
              <li key={h} className="flex items-start gap-3 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-700"><I size={20} aria-hidden="true" /></span>
                <span className="flex flex-1 flex-col gap-1">
                  <span className="text-[15px] font-black text-slate-900">{h}</span>
                  <span className="text-[13px] leading-relaxed text-slate-600">{d}</span>
                  <span className={SRC}>出典：{src(s)}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className={SECTION} aria-labelledby="watashi">
          <h2 id="watashi" className={H2}>私たちの会社の場合</h2>
          <ul className="grid grid-cols-2 gap-2">
            {WATASHI.map((w, i) => {
              const I = [Building, Coins, Banknote, FileText][i];
              return (
                <li key={w.h} className="flex flex-col gap-1 rounded-2xl bg-white p-3.5 ring-1 ring-slate-200">
                  <I size={20} className="text-sky-700" aria-hidden="true" />
                  <span className="text-[14px] font-black leading-snug text-slate-900">{w.h}</span>
                  {w.s && <span className="text-[12px] text-slate-600">{w.s}</span>}
                </li>
              );
            })}
          </ul>
          <p className="text-[13px] leading-relaxed text-slate-700">事業年度の終わり（9月30日）は設立から3か月より後なので、青色申告の申請の期限は「設立から3か月」のほうになります。</p>
        </section>

        <section className={SECTION} aria-labelledby="kouza">
          <h2 id="kouza" className={H2}>法人口座の申込</h2>
          <ul className="grid gap-2">
            {[
              { d: '11月上旬', t: '1行目（GMOあおぞらネット銀行）は通らず' },
              { d: '11/12', t: '2行に同時に申込' },
              { d: '11/16', t: 'PayPay銀行の審査に通過（設立から19日）' },
            ].map((k) => (
              <li key={k.d} className="flex items-start gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-slate-200">
                <span className="w-[62px] shrink-0 text-[13px] font-black text-sky-700">{k.d}</span>
                <span className="text-[13px] leading-relaxed text-slate-700">{k.t}</span>
              </li>
            ))}
          </ul>
          <p className="text-[13px] leading-relaxed text-slate-700">止まりやすいのは「事業が分かる資料」です。設立直後は、請求書や契約書がまだありません。</p>
          <Link href="/guide/houjin" className="flex items-center gap-3 rounded-2xl border-2 border-sky-200 bg-sky-50/60 p-3.5 hover:border-sky-300">
            <Landmark size={22} className="shrink-0 text-sky-700" aria-hidden="true" />
            <span className="flex flex-1 flex-col"><span className="text-[15px] font-black text-slate-900">設立直後の法人口座の開設</span><span className="text-[12px] text-slate-600">開設までの流れと、申し込む前に整える7つ</span></span>
            <ArrowRight size={18} className="text-sky-700" aria-hidden="true" />
          </Link>
          {hasExit && (
            <HoujinExit
              lpId={LP_ID} partner="raksulBank" position="kouza" lead="請求書も契約書もまだない会社の申込先に"
              note="ラクスルバンクは、設立直後の会社は事業計画書（代表者の署名・捺印）を事業内容の資料として出せるとしています。審査はGMOあおぞらネット銀行で、私たちは設立直後にGMOあおぞらネット銀行に直接申し込んで通りませんでした。それを知ったうえで、申込先の一つとして載せています。"
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
          <p className={`${SRC} mt-1`}>出典：{src(['hihoken', 'setsuritsu', 'no5100'])}（{CHECKED} 確認）</p>
        </section>

        <nav aria-label="あわせて読む" className="flex flex-col gap-2">
          {[
            { href: '/guide/houjin/kouza-hitsuyou-shorui', t: '法人口座の必要書類', s: '銀行4つの比較と、設立直後の事業内容の資料' },
            { href: '/guide/houjin/kouza-kaisetsu-kikan', t: '法人口座の開設期間', s: '設立から審査通過まで19日の実例' },
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
          期限は国税庁・日本年金機構の公式の記載（{CHECKED} 確認）です。都道府県・市町村の届出は自治体ごとに違います。会社の状況で要る届出は変わるため、迷うときは税務署・年金事務所・税理士に確かめてください。実例は運営会社（BlueAdventures合同会社）のものです。最終更新：2026年11月25日
        </p>
      </main>
      <LpFooter />
    </div>
  );
}
