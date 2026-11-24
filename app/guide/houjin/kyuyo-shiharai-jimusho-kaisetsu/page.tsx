import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, CalendarClock, CircleHelp, Clock, FileText, Info, Laptop, Send, Users } from 'lucide-react';
import LpHeader from '@/components/lp/LpHeader';
import LpFooter from '@/components/lp/LpFooter';
import LpViewTracker from '@/components/lp/LpViewTracker';
import { KakiteLine, KakiteNote, KAKITE_LD } from '@/components/houjin/Kakite';
import HoujinExit from '@/components/houjin/HoujinExit';
import NokiTokurei from '@/components/houjin/NokiTokurei';
import { SITE_URL, SITE_NAME, ogImageUrl } from '@/components/loan/LoanArticle';
import { HOUJIN_PARTNERS } from '@/lib/houjin/partners';

/**
 * 給与支払事務所等の開設届出書の書き方と、源泉所得税の納期の特例（2026-11-25 作成。houjin-plan.md の順番表 4）。
 * 受ける言葉（キーワードプランナー 2025/11〜2026/10 の月平均、11/24 確認）：給与支払事務所等の開設届出書 2,400（主）／
 *   源泉所得税の納期の特例 1,300／役員報酬 0円 170。
 * 上位（11/25 朝。Chrome につながらず WebSearch で確認）：マネーフォワード・国税庁（記載要領・A2-7）・弥生・freee・All About・税理士ドットコムの質問。
 *   共通して答えている疑問：どんなときに要るか・期限（1か月以内）・提出先・欄の書き方・出し方・納期の特例と一緒に出すか。
 *   上位に欠けている点：
 *   ①役員報酬0円の会社の扱いを、国税庁の案内に書いてあること／書いていないことに分けたもの（上位4つは0円に触れず、税理士ドットコムは2018年の個人の回答で意見が割れている）
 *   ②納期の特例の申請書を出す月から、年2回になる月と最初の納付期限を出す計算（No.2505 の決まりだけ）
 *   ③2026年の変化：税務署の総合窓口の受付は令和8年10月1日から原則9時〜15時、所得税徴収高計算書の様式が令和8年9月下旬以降A4の単票式に
 * 書き方は国税庁の記載要領（008-1.pdf・201601h268.pdf）の文だけ。運営会社の例は houjin-plan.md「実体験の事実」の範囲（社名・代表・役員報酬0円）。
 *   運営会社が開設届出書を出したか・いつ出したかは確かめていないため書かない。
 * 役員報酬0円の間に開設届出書が要るかは、国税庁の案内に答えがない。断定せず「払う前に税務署へ確かめる」。
 * 出口：ラクスルバンク（1つだけ）。口座の段に置く。
 */
const LP_ID = 'guide-houjin-kyuyo-kaisetsu';
const PATH = '/guide/houjin/kyuyo-shiharai-jimusho-kaisetsu';
const CHECKED = '2026/11/25';
const TITLE = '給与支払事務所等の開設届出書の書き方｜役員報酬0円の会社と納期の特例';
const DESCRIPTION = '給与支払事務所等の開設届出書は、事務所を開いた日から1か月以内に税務署へ。欄ごとの書き方を国税庁の記載要領で整理し、役員報酬0円の会社が迷う点と、源泉所得税の納期の特例（常時10人未満、7月10日・1月20日）の最初の納付期限の計算をつけました。';

export const metadata: Metadata = {
  title: `${TITLE} | ${SITE_NAME}`,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}${PATH}` },
  openGraph: { title: TITLE, description: DESCRIPTION, url: `${SITE_URL}${PATH}`, siteName: SITE_NAME, type: 'article', locale: 'ja_JP', images: [{ url: ogImageUrl(TITLE), width: 1200, height: 630, alt: TITLE }] },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, images: [ogImageUrl(TITLE)] },
};

const S = {
  a27: { name: '国税庁「A2-7 給与支払事務所等の開設・移転・廃止の届出」', url: 'https://www.nta.go.jp/taxes/tetsuzuki/shinsei/annai/gensen/annai/1648_11.htm' },
  a27yoryo: { name: '国税庁「給与支払事務所等の開設・移転・廃止届出書」記載要領', url: 'https://www.nta.go.jp/law/tsutatsu/kobetsu/hojin/010705/pdf/008-1.pdf' },
  a28: { name: '国税庁「A2-8 源泉所得税の納期の特例の承認に関する申請」', url: 'https://www.nta.go.jp/taxes/tetsuzuki/shinsei/annai/gensen/annai/1648_14.htm' },
  a28yoryo: { name: '国税庁「源泉所得税の納期の特例の承認に関する申請書」記載要領', url: 'https://www.nta.go.jp/law/tsutatsu/kobetsu/hojin/010705/pdf/201601h268.pdf' },
  no2505: { name: '国税庁 タックスアンサー No.2505「源泉所得税及び復興特別所得税の納付期限と納期の特例」', url: 'https://www.nta.go.jp/taxes/shiraberu/taxanswer/gensen/2505.htm' },
  shikata: { name: '国税庁「源泉徴収税額表の使い方」令和8年版（所得税徴収高計算書の書き方）', url: 'https://www.nta.go.jp/publication/pamph/gensen/shikata_r08/pdf/14.pdf' },
  arama: { name: '国税庁「源泉徴収のあらまし」令和8年版（所得税徴収高計算書の記載例）', url: 'https://www.nta.go.jp/publication/pamph/gensen/aramashi2026/pdf/18.pdf' },
  raksul1293: { name: 'ラクスルバンク よくあるご質問（口座開設の必要書類）', url: 'https://support.raksulbank.com/faq/show/1293?site_domain=default' },
  raksul33: { name: 'ラクスルバンク よくあるご質問（審査にかかる時間）', url: 'https://support.raksulbank.com/faq/show/33?site_domain=default' },
} as const;
type K = keyof typeof S;

/** 開設届出書の欄ごとの書き方（記載要領の文だけ）。ex は運営会社の例（書いてよい事実の範囲） */
const RAN: { h: string; d: string; ex?: string; tag?: 'mayou' }[] = [
  { h: '届出書種別', d: '「届出内容」の届出書種別の欄に、当てはまる届出の区分の数字を書く' },
  { h: '事務所開設者', d: '本店の所在地、名称、法人番号、代表者の氏名を書く', ex: 'BlueAdventures合同会社／代表社員 森嶋 聖人' },
  { h: '給与支払を開始する年月日', d: '開設した月のうちに給与を払い始めないときに、払い始めた日（または払い始める予定の日）を書く', tag: 'mayou' },
  { h: '届出の内容及び理由', d: '当てはまる区分の数字を書く' },
  { h: '給与支払事務所等について', d: '届出の内容と理由に合わせて、事務所の所在地などを書く' },
  { h: '従事員数', d: '給与を払う人の数を職種ごとに書く。「役員」「従業員」以外は「その他」の区分に職種を書く' },
  { h: 'その他参考事項', d: '個人事業を会社にしたとき（法人成り）は、個人事業の事業主・納税地・整理番号など、参考になることを書く', tag: 'mayou' },
  { h: '税理士署名', d: '税理士が作ったときだけ、その税理士が署名する' },
  { h: '税務署整理欄', d: '書かない' },
];

/** 役員報酬0円の会社が迷う点（国税庁の案内の文と、書いていないこと） */
const ZERO = [
  { icon: Users, h: '出す人', d: '対象は「給与等の支払事務を取り扱う事務所等を開設した」給与等の支払者。報酬0円の間に出すかどうかは、国税庁の案内に書いていません', src: ['a27'] as K[] },
  { icon: CalendarClock, h: '払い始める日の欄', d: '開設した月に払わないなら、払い始める日か予定の日を書く欄があります。予定が決まっていないときの書き方は、出す前に税務署に聞きます', src: ['a27yoryo'] as K[] },
  { icon: FileText, h: '税額のない月の計算書', d: '給与を払って、引く税額がない月でも、所得税徴収高計算書（納付書）に支給額などを書いて税務署に出す必要があります（e-Taxでも出せます）。報酬を払っていない月の扱いは書いていません', src: ['arama', 'shikata'] as K[] },
];

const DASHIKATA = [
  { icon: Laptop, h: 'e-Tax', d: 'e-Taxソフトで届出書を作って出す' },
  { icon: Send, h: '書面', d: '事務所の所在地を受け持つ税務署に、持っていくか送る' },
  { icon: Clock, h: '窓口の時間', d: '2026年10月1日から、全国の税務署で総合窓口の受付が原則9時〜15時にそろいました（開庁は8時30分〜17時）' },
];

const FAQS = [
  { q: '給与支払事務所等の開設届出書の期限はいつですか？', a: '国税庁は、給与の支払事務を扱う事務所などを開設した日から1か月以内に、その事務所の所在地を受け持つ税務署に出すとしています。' },
  { q: '源泉所得税の納期の特例の申請に期限はありますか？', a: '国税庁の案内では、提出の時期は特に決まっていません。原則として、出した日の翌月に払う給与から特例の対象になります。出した月の翌月末日までに通知がなければ、翌月末日に承認されたものとされます。' },
  { q: '役員報酬0円でも、開設届出書は出しますか？', a: '国税庁の案内には、報酬0円の間の扱いは書いてありません。対象は給与の支払事務を扱う事務所を開いた人で、給与を払って引く税額がない月でも、計算書は出す必要があると案内しています。報酬を払っていない月の扱いは案内にないため、払う前に、事務所の所在地を受け持つ税務署に確かめてください。' },
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
    { '@type': 'Article', author: KAKITE_LD, publisher: { '@id': 'https://www.tsuginotenavi.jp/#organization' }, headline: TITLE, description: DESCRIPTION, inLanguage: 'ja', about: [{ '@type': 'Thing', name: '給与支払事務所等の開設届出書' }, { '@type': 'Thing', name: '源泉所得税の納期の特例' }], datePublished: '2026-11-25T09:00:00+09:00', dateModified: '2026-11-25T09:00:00+09:00', mainEntityOfPage: `${SITE_URL}${PATH}` },
    { '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: SITE_NAME, item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: '法人成り', item: `${SITE_URL}/guide/houjin` },
      { '@type': 'ListItem', position: 3, name: '給与支払事務所等の開設届出書の書き方', item: `${SITE_URL}${PATH}` },
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
          <span>給与支払事務所等の開設届出書</span>
        </nav>

        <section className="flex flex-col gap-5" aria-labelledby="top">
          <div className="flex flex-col gap-2">
            <p className="text-[13px] font-bold text-sky-700">国税庁の記載要領の欄ごとに</p>
            <h1 id="top" className="text-[28px] font-black leading-tight text-slate-900">給与支払事務所等の<br />開設届出書の書き方<br /><span className="text-[20px] text-orange-600">役員報酬0円の会社と納期の特例</span></h1>
            <KakiteLine />
          </div>
          <ul className="grid grid-cols-3 gap-2" aria-label="開設届出書と納期の特例の要点">
            {[
              { icon: CalendarClock, big: '1か月以内', s: '事務所を開いた日から' },
              { icon: Users, big: '常時10人未満', s: '給与を払う人数（納期の特例）' },
              { icon: FileText, big: '年2回', s: '7月10日・1月20日' },
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
            給与支払事務所等の開設届出書は、給与の支払事務を扱う事務所を開いた日から1か月以内に、その所在地を受け持つ税務署に出します。給与を受ける人が常時10人未満なら、源泉所得税の納期の特例の承認を受ければ、納付を年2回（7月10日・1月20日）にできます。役員報酬0円の間の扱いは国税庁の案内に書いていないため、払う前に税務署に確かめます。
          </p>
          <p className="text-[13px] leading-relaxed text-slate-700">私たちの会社は、代表社員の役員報酬0円で始めました（本業の会社員を続けるため）。このページは、その立場で迷った点を、国税庁の文で確かめた記録です。</p>
          <p className={SRC}>出典：{src(['a27', 'no2505'])}（{CHECKED} 確認）</p>
        </section>

        <section className={SECTION} aria-labelledby="ran">
          <h2 id="ran" className={H2}>開設届出書の欄ごとの書き方</h2>
          <p className="text-[13px] text-slate-600">国税庁の記載要領の順。「例」は私たちの会社の場合。</p>
          <ul className="grid gap-2">
            {RAN.map((r) => (
              <li key={r.h} className={`flex flex-col gap-1.5 rounded-2xl p-3.5 ring-1 ${r.tag === 'mayou' ? 'bg-amber-50 ring-amber-200' : 'bg-white ring-slate-200'}`}>
                <span className="flex flex-wrap items-center gap-2">
                  <span className="text-[15px] font-black leading-snug text-slate-900">{r.h}</span>
                  {r.tag === 'mayou' && <span className="rounded bg-amber-200 px-1.5 py-0.5 text-[11px] font-bold text-amber-900">迷いやすい</span>}
                </span>
                <span className="text-[13px] leading-relaxed text-slate-700">{r.d}</span>
                {r.ex && <span className="text-[12px] text-sky-800"><span className="mr-1 font-bold">例</span>{r.ex}</span>}
              </li>
            ))}
          </ul>
          <p className={SRC}>出典：{src(['a27yoryo', 'a27'])}（{CHECKED} 確認）</p>
        </section>

        <section className={SECTION} aria-labelledby="zero">
          <h2 id="zero" className={H2}>役員報酬0円の会社が迷う3つの点</h2>
          <ul className="grid gap-2.5">
            {ZERO.map(({ icon: I, h, d, src: s }) => (
              <li key={h} className="flex items-start gap-3 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700"><I size={20} aria-hidden="true" /></span>
                <span className="flex flex-1 flex-col gap-1">
                  <span className="text-[15px] font-black text-slate-900">{h}</span>
                  <span className="text-[13px] leading-relaxed text-slate-600">{d}</span>
                  <span className={SRC}>出典：{src(s)}</span>
                </span>
              </li>
            ))}
          </ul>
          <p className="flex items-start gap-2 rounded-2xl bg-sky-50 p-3.5 text-[13px] leading-relaxed text-slate-700 ring-1 ring-sky-200"><CircleHelp size={18} className="mt-0.5 shrink-0 text-sky-700" aria-hidden="true" />税務署で聞くこと：①報酬0円の間に出すか ②出すなら払い始める日の欄をどう書くか ③税額のない月の計算書をどうするか</p>
          <Link href="/guide/houjin/houjin-setsuritsu-todokedesho" className="flex items-center gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-slate-200 hover:ring-slate-300">
            <FileText size={22} className="shrink-0 text-sky-700" aria-hidden="true" />
            <span className="flex flex-1 flex-col"><span className="text-[15px] font-black text-slate-900">法人設立届出書の書き方</span><span className="text-[12px] text-slate-600">「開設届出書の提出の有無」の欄（まだなら2）</span></span>
            <ArrowRight size={18} className="text-sky-700" aria-hidden="true" />
          </Link>
        </section>

        <section className={SECTION} aria-labelledby="noki">
          <h2 id="noki" className={H2}>源泉所得税の納期の特例</h2>
          <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200">
            <table className="w-full text-left text-[13px]">
              <tbody>
                {[
                  ['対象', '給与の支給人員が常時10人未満'],
                  ['納める時期', '1月〜6月分は7月10日、7月〜12月分は翌年1月20日'],
                  ['まとめて納める税', '給与・退職手当と、税理士・弁護士・司法書士など一定の報酬から引いた税だけ'],
                  ['申請の期限', '特に決まっていない'],
                  ['始まる時期', '出した月の翌月に払う給与から'],
                  ['承認', '翌月末日までに通知がなければ、翌月末日に承認されたものとされる'],
                ].map(([k, v]) => (
                  <tr key={k} className="border-b border-slate-100 last:border-0">
                    <th scope="row" className="w-[34%] bg-slate-50 px-3 py-2.5 align-top text-[12px] font-bold text-slate-600">{k}</th>
                    <td className="px-3 py-2.5 leading-relaxed text-slate-800">{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <NokiTokurei lpId={LP_ID} />
          <p className="flex items-start gap-2 text-[13px] leading-relaxed text-slate-700"><Info size={18} className="mt-0.5 shrink-0 text-sky-700" aria-hidden="true" />申請書には、申請の日の前6か月の各月末の人数と、各月の支給額を書く欄があります。設立したばかりで払っていない月の書き方は、出す前に税務署に確かめます。</p>
          <p className={SRC}>出典：{src(['no2505', 'a28', 'a28yoryo'])}（{CHECKED} 確認）</p>
        </section>

        <section className={SECTION} aria-labelledby="dashikata">
          <h2 id="dashikata" className={H2}>出し方と2026年の変化</h2>
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
          <p className="text-[13px] leading-relaxed text-slate-700">税務署の窓口で配る所得税徴収高計算書（納付書）は、2026年9月下旬以降に配る分からA4の単票の様式に変える予定と、国税庁が案内しています。今の複写式も2028年9月ごろまで使える予定です。2025年1月から、控えに受付の日付の印は押されないため、出した日は自分で記録しておきます。</p>
          <p className={SRC}>出典：{src(['a27', 'a28', 'arama', 'shikata'])}（{CHECKED} 確認）</p>
        </section>

        <section className={SECTION} aria-labelledby="kouza">
          <h2 id="kouza" className={H2}>給与を払う法人口座</h2>
          <p className="text-[13px] leading-relaxed text-slate-700">役員報酬や給与を会社の口座から振り込むなら、先に法人口座が要ります。法人口座には期限がありませんが、審査に日数がかかります。私たちは設立から19日でPayPay銀行の審査に通りました（審査の日数は銀行によります）。届出と同じ時期に申し込んでおくと、口座が要る時期に間に合いやすくなります。</p>
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
          <p className={`${SRC} mt-1`}>出典：{src(['a27', 'a28', 'arama'])}（{CHECKED} 確認）</p>
        </section>

        <nav aria-label="あわせて読む" className="flex flex-col gap-2">
          {[
            { href: '/guide/houjin/setsuritsu-go-yarukoto', t: '会社設立後にやること', s: '届出と期限。役員報酬0円の場合' },
            { href: '/guide/houjin/aoiro-shinsei-houjin', t: '青色申告の承認申請書（法人）', s: '設立1期目の期限を日付で計算' },
            { href: '/guide/houjin/kouza-hitsuyou-shorui', t: '法人口座の必要書類', s: '銀行4つの比較と、設立直後の事業内容の資料' },
          ].map((l) => (
            <Link key={l.href} href={l.href} className="flex items-center gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-slate-200 hover:ring-slate-300">
              <span className="flex flex-1 flex-col"><span className="text-[15px] font-black text-slate-900">{l.t}</span><span className="text-[12px] text-slate-600">{l.s}</span></span>
              <ArrowRight size={18} className="text-sky-700" aria-hidden="true" />
            </Link>
          ))}
        </nav>

        <KakiteNote />
        <p className="text-[11px] leading-relaxed text-slate-400">
          書き方は国税庁の記載要領、期限と納期の特例は国税庁の案内（{CHECKED} 確認）です。様式は変わることがあります。会社の状況で扱いは変わるため、迷うときは税務署か税理士に確かめてください。最終更新：2026年11月25日
        </p>
      </main>
      <LpFooter />
    </div>
  );
}
