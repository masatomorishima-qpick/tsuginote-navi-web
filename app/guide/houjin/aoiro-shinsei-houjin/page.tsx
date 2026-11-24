import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, BadgeCheck, BookOpen, CalendarClock, Info, Landmark, Laptop, Send, Smartphone } from 'lucide-react';
import LpHeader from '@/components/lp/LpHeader';
import LpFooter from '@/components/lp/LpFooter';
import LpViewTracker from '@/components/lp/LpViewTracker';
import { KakiteLine, KakiteNote, KAKITE_LD } from '@/components/houjin/Kakite';
import HoujinExit from '@/components/houjin/HoujinExit';
import AoiroKigen from '@/components/houjin/AoiroKigen';
import { SITE_URL, SITE_NAME, ogImageUrl } from '@/components/loan/LoanArticle';
import { HOUJIN_PARTNERS } from '@/lib/houjin/partners';

/**
 * 青色申告の承認申請書（法人）：設立1期目の期限の計算と書き方（2026-11-25 作成。houjin-plan.md の順番表 6）。
 * 受ける言葉（キーワードプランナー 2025/11〜2026/10 の月平均、11/24 確認）：青色申告承認申請書 法人 880（主）。
 * 上位（11/25、Google「青色申告承認申請書 法人」）：国税庁（C1-19・記載要領）・小さな税理士事務所4つ・freee・届出の代行・マネーフォワード。
 *   よくある質問：法人の期限はいつ・法人でもできるか・どうすればよいか・2026年はいつまでに。
 *   上位に欠けている点：①設立日と1期目の終わりから期限を出す計算 ②1期目が3か月より短い会社の扱い ③2026年10月からの様式の変更（書かなくてよい欄）
 * 期限は国税庁 C1-19・記載要領（056-1）・No.5100、書き方は記載要領、みなし承認は記載要領、欠損金は No.5762、出し方は C1-19・法人設立ワンストップサービス（11/25 確認）。
 * 期限の計算は components/houjin/AoiroKigen.tsx（設立の日を1日目として数える、早い側の目安）。
 * 運営会社の例：2026/10/28 設立・1期目の終わり 2027/9/30（houjin-plan.md「実体験の事実」）。計算の目安は 2027/1/27。提出日は書かない。
 * 出口：ラクスルバンク（1つだけ）。
 */
const LP_ID = 'guide-houjin-aoiro';
const PATH = '/guide/houjin/aoiro-shinsei-houjin';
const CHECKED = '2026/11/25';
const TITLE = '青色申告の承認申請書（法人）の期限と書き方｜設立1期目はいつまで？日付の計算つき';
const DESCRIPTION = '法人の青色申告の承認申請書は、設立1期目なら「設立の日以後3か月を経過した日」と「1期目の終わりの日」の早いほうの前日まで。設立日と1期目の終わりを入れると期限の目安が出ます。書き方、出し方、みなし承認、2026年10月から書かなくてよい欄も。';

export const metadata: Metadata = {
  title: `${TITLE} | ${SITE_NAME}`,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}${PATH}` },
  openGraph: { title: TITLE, description: DESCRIPTION, url: `${SITE_URL}${PATH}`, siteName: SITE_NAME, type: 'article', locale: 'ja_JP', images: [{ url: ogImageUrl(TITLE), width: 1200, height: 630, alt: TITLE }] },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, images: [ogImageUrl(TITLE)] },
};

const S = {
  c119: { name: '国税庁「C1-19 青色申告書の承認の申請」', url: 'https://www.nta.go.jp/taxes/tetsuzuki/shinsei/annai/hojin/annai/1554_14.htm' },
  yoryo: { name: '国税庁「青色申告の承認申請書の記載要領等」', url: 'https://www.nta.go.jp/law/tsutatsu/kobetsu/hojin/010705/pdf/056-1.pdf' },
  no5100: { name: '国税庁 タックスアンサー No.5100「新設法人の届出書類」', url: 'https://www.nta.go.jp/taxes/shiraberu/taxanswer/hojin/5100.htm' },
  no5762: { name: '国税庁 タックスアンサー No.5762「青色申告書を提出した事業年度の欠損金の繰越控除」', url: 'https://www.nta.go.jp/taxes/shiraberu/taxanswer/hojin/5762.htm' },
  oss: { name: '国税庁「法人設立ワンストップサービスの対象が全ての手続に拡大されました」', url: 'https://www.nta.go.jp/taxes/tetsuzuki/shinsei/annai/hojin/annai/OSS.htm' },
  tsusoku: { name: '国税庁 国税通則法基本通達「第10条関係 期間の計算及び期限の特例」', url: 'https://www.nta.go.jp/law/tsutatsu/kihon/tsusoku/01/03/10.htm' },
  raksul1293: { name: 'ラクスルバンク よくあるご質問（口座開設の必要書類）', url: 'https://support.raksulbank.com/faq/show/1293?site_domain=default' },
  raksul33: { name: 'ラクスルバンク よくあるご質問（審査にかかる時間）', url: 'https://support.raksulbank.com/faq/show/33?site_domain=default' },
} as const;
type K = keyof typeof S;

const KIGEN = [
  { h: '1期目から青色にする', d: '設立の日以後3か月を経過した日と、1期目の終わりの日の、早いほうの前日まで' },
  { h: '1期目が3か月より短く、2期目から青色にする', d: '設立の日以後3か月を経過した日と、2期目の終わりの日の、早いほうの前日まで' },
  { h: '2期目以降に青色にする', d: '青色にしたい事業年度が始まる日の前日まで' },
];

const KAKIKATA = [
  { h: '帳簿組織の状況', d: '伝票から総勘定元帳までの帳簿の種類・形・記帳の時期を書く。形は「3枚複写伝票」「ルーズリーフ」など、時期は「毎日」「1週間ごと」など' },
  { h: '特別な記帳方法の採用の有無', d: '当てはまる番号（1か2）を書く' },
  { h: '税理士が関与している場合の関与度合', d: '「総勘定元帳の記帳から一切の事務」のように具体的に書く' },
  { h: '2026年10月1日以後に出すとき', d: '「承認を受けようとする事業年度終了の日」の欄など、書かなくてよい欄がある' },
];

const DASHIKATA = [
  { icon: Laptop, h: 'e-Tax（電子申告）', d: '作った申請書をネットで出せる。初めてなら利用者識別番号の取得が要る' },
  { icon: Send, h: '書面', d: '申請書を1部、納税地を受け持つ税務署に持っていくか送る' },
  { icon: Smartphone, h: '法人設立ワンストップサービス', d: 'マイナポータルで、法人設立届出などとまとめて出せる。代表者のマイナンバーカードが要る' },
];

const FAQS = [
  { q: '法人の青色申告の承認申請書の期限はいつですか？', a: '設立1期目から青色にするなら、設立の日以後3か月を経過した日と、1期目の終わりの日のうち、早いほうの前日までです。2期目以降は、青色にしたい事業年度が始まる日の前日までです。' },
  { q: '承認の通知が来ません。', a: '国税庁の記載要領では、申請書を出したあと、青色にしたい事業年度の終わりの日までに承認または却下の処分がなかったときは、その日に承認があったものとみなされるとしています（中間申告書を出すべき法人は、事業年度開始の日以後6か月を経過する日まで）。' },
  { q: '青色申告にすると何が変わりますか？', a: '国税庁のタックスアンサーでは、青色申告書を出した事業年度に生じた欠損金額（赤字）は、その後10年以内に始まる事業年度の所得から差し引けるとしています。ほかにも条件があるため、くわしくは税理士か税務署に確かめてください。' },
  { q: '期限が土日に当たるときは？', a: '国税の申請などの期限が土日祝などに当たるときは、その翌日が期限になる取り扱いがあります（国税通則法第10条第2項）。ただ、早めに出すのが安全です。' },
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
    { '@type': 'Article', author: KAKITE_LD, publisher: { '@id': 'https://www.tsuginotenavi.jp/#organization' }, headline: TITLE, description: DESCRIPTION, inLanguage: 'ja', about: { '@type': 'Thing', name: '青色申告の承認申請書（法人）' }, datePublished: '2026-11-25T02:30:00+09:00', dateModified: '2026-11-25T02:30:00+09:00', mainEntityOfPage: `${SITE_URL}${PATH}` },
    { '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: SITE_NAME, item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: '法人成り', item: `${SITE_URL}/guide/houjin` },
      { '@type': 'ListItem', position: 3, name: '青色申告の承認申請書（法人）', item: `${SITE_URL}${PATH}` },
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
          <span>青色申告の承認申請書（法人）</span>
        </nav>

        <section className="flex flex-col gap-5" aria-labelledby="top">
          <div className="flex flex-col gap-2">
            <p className="text-[13px] font-bold text-sky-700">設立1期目の期限</p>
            <h1 id="top" className="text-[28px] font-black leading-tight text-slate-900">青色申告の<br />承認申請書（法人）<br /><span className="text-[20px] text-orange-600">期限の計算と書き方</span></h1>
            <KakiteLine />
          </div>
          <AoiroKigen lpId={LP_ID} />
          <p className="rounded-2xl bg-white p-4 text-[14px] leading-relaxed text-slate-800 ring-1 ring-slate-200">
            <span className="mb-1 block text-[12px] font-black text-sky-700">結論</span>
            設立1期目から青色にするなら、「設立の日以後3か月を経過した日」と「1期目の終わりの日」の早いほうの前日までに、納税地を受け持つ税務署に出します。1期目が3か月より短い会社は、2期目から青色にすることもできます。
          </p>
          <p className={SRC}>出典：{src(['c119', 'no5100'])}（{CHECKED} 確認）</p>
        </section>

        <section className={SECTION} aria-labelledby="kigen">
          <h2 id="kigen" className={H2}>期限のきまり</h2>
          <ul className="grid gap-2">
            {KIGEN.map((k, i) => (
              <li key={k.h} className={`flex items-start gap-3 rounded-2xl p-3.5 ring-1 ${i === 0 ? 'bg-orange-50/60 ring-orange-200' : 'bg-white ring-slate-200'}`}>
                <CalendarClock size={20} className="mt-0.5 shrink-0 text-sky-700" aria-hidden="true" />
                <span className="flex flex-1 flex-col gap-0.5">
                  <span className="text-[15px] font-black leading-snug text-slate-900">{k.h}</span>
                  <span className="text-[13px] leading-relaxed text-slate-600">{k.d}</span>
                </span>
              </li>
            ))}
          </ul>
          <div className="flex items-start gap-3 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
            <BadgeCheck size={22} className="mt-0.5 shrink-0 text-emerald-600" aria-hidden="true" />
            <span className="flex flex-1 flex-col gap-1">
              <span className="text-[15px] font-black text-slate-900">通知がなくても承認とみなされる</span>
              <span className="text-[13px] leading-relaxed text-slate-600">青色にしたい事業年度の終わりの日までに承認も却下もなければ、その日に承認があったものとみなされます。</span>
            </span>
          </div>
          <p className={SRC}>出典：{src(['c119', 'yoryo'])}（{CHECKED} 確認）</p>
        </section>

        <section className={SECTION} aria-labelledby="watashi">
          <h2 id="watashi" className={H2}>私たちの会社の場合</h2>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1 rounded-2xl bg-white p-3.5 ring-1 ring-slate-200">
              <span className="text-[11px] font-bold text-slate-500">設立の日</span>
              <span className="text-[16px] font-black text-slate-900">2026年10月28日</span>
            </div>
            <div className="flex flex-col gap-1 rounded-2xl bg-white p-3.5 ring-1 ring-slate-200">
              <span className="text-[11px] font-bold text-slate-500">1期目の終わり</span>
              <span className="text-[16px] font-black text-slate-900">2027年9月30日</span>
            </div>
          </div>
          <p className="text-[13px] leading-relaxed text-slate-700">設立から3か月のほうが先に来るので、上の計算の目安では2027年1月27日（水）までです。</p>
        </section>

        <section className={SECTION} aria-labelledby="kakikata">
          <h2 id="kakikata" className={H2}>書き方（参考事項の欄）</h2>
          <ul className="grid gap-2">
            {KAKIKATA.map((k) => (
              <li key={k.h} className="flex items-start gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-slate-200">
                <BookOpen size={20} className="mt-0.5 shrink-0 text-sky-700" aria-hidden="true" />
                <span className="flex flex-1 flex-col gap-0.5">
                  <span className="text-[15px] font-black leading-snug text-slate-900">{k.h}</span>
                  <span className="text-[13px] leading-relaxed text-slate-600">{k.d}</span>
                </span>
              </li>
            ))}
          </ul>
          <p className={SRC}>出典：{src(['yoryo', 'c119'])}（{CHECKED} 確認）</p>
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
          <p className="flex items-start gap-2 text-[13px] text-slate-700"><Info size={18} className="mt-0.5 shrink-0 text-sky-700" aria-hidden="true" />法人設立届出書（設立の日以後2か月以内）と一緒に出すと、出し忘れを防げます。</p>
          <p className={SRC}>出典：{src(['c119', 'oss'])}（{CHECKED} 確認）</p>
        </section>

        <section className={SECTION} aria-labelledby="kouza">
          <h2 id="kouza" className={H2}>法人口座の申込</h2>
          <p className="text-[13px] leading-relaxed text-slate-700">法人口座には期限がありませんが、審査に日数がかかります。私たちは設立から19日で審査に通りました。届出と並行して申し込むと、待つ時間を減らせます。</p>
          <Link href="/guide/houjin" className="flex items-center gap-3 rounded-2xl border-2 border-sky-200 bg-sky-50/60 p-3.5 hover:border-sky-300">
            <Landmark size={22} className="shrink-0 text-sky-700" aria-hidden="true" />
            <span className="flex flex-1 flex-col"><span className="text-[15px] font-black text-slate-900">法人口座の開設（まとめ）</span><span className="text-[12px] text-slate-600">ネット銀行3つに申し込んだ記録</span></span>
            <ArrowRight size={18} className="text-sky-700" aria-hidden="true" />
          </Link>
          {hasExit && (
            <HoujinExit
              lpId={LP_ID} partner="raksulBank" position="kouza" lead="請求書も契約書もまだない会社の申込先に"
              note="ラクスルバンクは、設立直後の会社は事業計画書（代表者の署名・捺印）を事業内容の資料として出せるとしています。審査はGMOあおぞらネット銀行が行います。私たちは設立直後にGMOあおぞらネット銀行に直接申し込んで通りませんでした。それを知ったうえで、申込先の一つとして載せています。"
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
          <p className={`${SRC} mt-1`}>出典：{src(['c119', 'yoryo', 'no5762', 'tsusoku'])}（{CHECKED} 確認）</p>
        </section>

        <nav aria-label="あわせて読む" className="flex flex-col gap-2">
          {[
            { href: '/guide/houjin/kouza-hitsuyou-shorui', t: '法人口座の必要書類', s: '銀行4つの比較と、設立直後の事業内容の資料' },
            { href: '/guide/houjin/kouza-kaisetsu-kikan', t: '法人口座の開設期間', s: '設立から審査通過まで19日の実例' },
            { href: '/guide/houjin', t: '法人成りのページ', s: '設立直後の法人口座の開設と、ページの一覧' },
          ].map((l) => (
            <Link key={l.href} href={l.href} className="flex items-center gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-slate-200 hover:ring-slate-300">
              <span className="flex flex-1 flex-col"><span className="text-[15px] font-black text-slate-900">{l.t}</span><span className="text-[12px] text-slate-600">{l.s}</span></span>
              <ArrowRight size={18} className="text-sky-700" aria-hidden="true" />
            </Link>
          ))}
        </nav>

        <KakiteNote />
        <p className="text-[11px] leading-relaxed text-slate-400">
          期限と書き方は国税庁の案内・記載要領（{CHECKED} 確認）です。期限の計算は目安で、祝日は見ていません。会社の状況で扱いが変わることがあるため、迷うときは税務署か税理士に確かめてください。最終更新：2026年11月25日
        </p>
      </main>
      <LpFooter />
    </div>
  );
}
