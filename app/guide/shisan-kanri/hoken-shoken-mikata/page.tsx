import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Download, FileSearch, FileSpreadsheet, FileText, RefreshCw, UserCog } from 'lucide-react';
import LpHeader from '@/components/lp/LpHeader';
import LpFooter from '@/components/lp/LpFooter';
import LpViewTracker from '@/components/lp/LpViewTracker';
import { SITE_URL, SITE_NAME, ogImageUrl } from '@/components/loan/LoanArticle';
import HokenSoudanBox from '@/components/guide/HokenSoudanBox';
import HokenZeiCheck from '@/components/guide/HokenZeiCheck';
import DATA from '@/lib/hoken/haifu-data.json';

/**
 * 保険証券の見方（2026-11-11 作成。docs/seisaku-queue.md の T5）。
 * 受ける言葉：保険証券 見方（主）・生命保険証券 見方・保険証券 契約者 被保険者 受取人。
 *   上位5件（11/11、WebSearch）：1 メガバンクのコラム（2022年・表1つ）2 代理店向けの集客記事（2026年9月）
 *   3 金融の情報媒体（約2,000字）4 保険相談の媒体（約6,000字）5 証券会社の比較サイト（1万字超・検索に載らない設定）。
 *   上位に欠けている点：①書き写せる表（エクセル・PDF）がない ②契約者・被保険者・受取人の組み合わせで税が変わる点が5件ともない
 *   ③証券がないときの探し方（生命保険協会の照会）が2件だけ ④一次情報の出典が3件にない。
 * 出口：保険見直し本舗（レントラックス 7502、新規の無料面談の完了 14,520円）。
 * 文言の元：生命保険文化センター（保険商品の見方・用語辞典・諸変更と届出・税金のQ&A）、生命保険協会（契約照会制度）、国税庁 No.1750。
 */
const LP_ID = 'guide-hoken-shoken';
const VERSION = 'v1-2026-11-11';
const PAGE_PATH = '/guide/shisan-kanri/hoken-shoken-mikata';
const TITLE = '保険証券の見方｜欄ごとの意味と書き写し表（無料・エクセル）、税の種類も分かる';
const DESCRIPTION = '保険証券の見方を欄ごとに1行で。契約者・被保険者・受取人、主契約と特約、保険期間と払込期間、更新。書き写すだけで一覧になる無料のエクセル・PDF付き。3人の組み合わせで死亡保険金の税（相続税・所得税・贈与税）も分かります。';

export const metadata: Metadata = {
  title: `${TITLE} | ${SITE_NAME}`,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}${PAGE_PATH}` },
  openGraph: { title: TITLE, description: DESCRIPTION, url: `${SITE_URL}${PAGE_PATH}`, siteName: SITE_NAME, type: 'article', locale: 'ja_JP', images: [{ url: ogImageUrl(TITLE), width: 1200, height: 630, alt: TITLE }] },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, images: [ogImageUrl(TITLE)] },
};

const K = DATA.shoken;
const POINTS_BOX = ['相談は無料', '書き写した表を見せれば、話が早い', '保障の重なりや足りない所を、プロと確かめる'];
const FAQS = [
  { q: '保険証券が見つからないときは？', a: '契約している保険会社に問い合わせます。証券の代わりに「契約内容通知書」を出す会社もあります。保険会社が分からないときは、毎年届くお知らせや、通帳の保険料の引き落としが手がかりになります（生命保険文化センター・生命保険協会）。' },
  { q: '契約者と被保険者は、どう違いますか？', a: '契約者は保険会社と契約し、保険料を払う人です。被保険者は、その人の死亡や病気・けがが保険の対象になる人です（生命保険文化センター）。' },
  { q: '受取人は後から変えられますか？', a: '保険期間中なら、契約者が原則として変えられます。被保険者の同意が要り、亡くなるなど支払いの理由が起きた後は変えられません（生命保険文化センター）。' },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    { '@type': 'Article', headline: TITLE, description: DESCRIPTION, inLanguage: 'ja', datePublished: '2026-11-11T09:00:00+09:00', dateModified: '2026-11-11T09:00:00+09:00', mainEntityOfPage: `${SITE_URL}${PAGE_PATH}` },
    { '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: SITE_NAME, item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: '保険証券の見方', item: `${SITE_URL}${PAGE_PATH}` },
    ] },
    { '@type': 'FAQPage', mainEntity: FAQS.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) },
  ],
};

const SECTION = 'flex flex-col gap-5';
const H2 = 'text-[22px] font-black leading-snug text-slate-900';
const SRC = 'text-[11px] leading-relaxed text-slate-500';
const A = 'underline underline-offset-2';
const FILES = [
  { label: 'エクセル', href: '/downloads/hoken-shoken-kakiutsushi.xlsx', icon: FileSpreadsheet },
  { label: 'PDF', href: '/downloads/hoken-shoken-kakiutsushi.pdf', icon: FileText },
];
const FLOW = [
  { h: '保険証券を書き写す', s: 'このページの表で、欄ごとに', href: null },
  { h: '見直しチェック', s: '節目と、次の更新の時期', href: '/guide/shisan-kanri/hoken-minaoshi-checklist' },
  { h: '保険の比較表', s: '見直し案と払う総額を比べる', href: '/guide/shisan-kanri/hoken-hikaku-excel' },
];
const GROUPS = [
  { h: '人', keys: ['keiyakusha', 'hihokensha', 'uketorinin'] },
  { h: '保障の中身', keys: ['shukeiyaku', 'tokuyaku'] },
  { h: '期間とお金', keys: ['kikan', 'haraikomi', 'koshin', 'henrei'] },
];

export default function Page() {
  const S = DATA.sources as Record<string, { name: string; url: string }>;
  const checked = K.checkedAt.split('-').join('/');
  const src = (keys: string[]) => [...new Set(keys)].map((k, i) => (
    <span key={k}>{i > 0 && '・'}<a href={S[k].url} target="_blank" rel="noopener noreferrer" className={A}>{S[k].name}</a></span>
  ));
  const ran = Object.fromEntries(K.ran.map((r) => [r.key, r]));
  return (
    <div className="flex min-h-screen flex-col bg-[#f6f8fa]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <LpHeader />
      <LpViewTracker lpId={LP_ID} version={VERSION} />
      <main className="mx-auto flex w-full max-w-[520px] flex-1 flex-col gap-14 px-4 pt-4 pb-16">
        <p className="-mb-10 flex flex-wrap items-center gap-x-2 text-[11px] text-slate-500">
          <span className="rounded border border-slate-300 px-1.5 tracking-widest">PR</span>
          <span>当サイトは紹介料を受け取っています</span>
          <Link href="/policy" className="text-sky-800 underline underline-offset-2">中立性ポリシー</Link>
        </p>
        <section className="flex flex-col gap-5" aria-labelledby="top">
          <div className="flex flex-col gap-2">
            <p className="text-[13px] font-bold text-sky-700">保険の書類</p>
            <h1 id="top" className="text-[28px] font-black leading-tight text-slate-900">保険証券の<br /><span className="text-orange-600">見方と書き写し表</span></h1>
          </div>
          <div className="flex flex-col gap-3 rounded-2xl border-2 border-sky-200 bg-white p-4">
            <p className="text-[15px] font-black text-slate-900">証券の書き写し表<span className="ml-1.5 text-[12px] font-bold text-sky-700">無料</span></p>
            <p className="text-[12px] text-slate-600">欄の順に5件まで。税の種類と保険料の合計は自動</p>
            <div className="flex gap-2">
              {FILES.map(({ label, href, icon: FI }) => (
                <a key={href} href={href} download className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-sky-700 px-3 py-3 text-[15px] font-bold text-white hover:bg-sky-800">
                  <FI size={18} aria-hidden="true" />{label}<Download size={16} aria-hidden="true" />
                </a>
              ))}
            </div>
            <p className="text-[11px] text-slate-500">登録やメールアドレスの入力は要りません</p>
          </div>
          <HokenZeiCheck lpId={LP_ID} />
          <HokenSoudanBox lpId={LP_ID} position="hero" lead="読み終えたら、無料でプロに見てもらう" points={POINTS_BOX} />
        </section>

        <section className={SECTION} aria-labelledby="ran">
          <h2 id="ran" className={H2}>保険証券の欄の意味</h2>
          {GROUPS.map((g) => (
            <div key={g.h} className="flex flex-col gap-2">
              <p className="text-[13px] font-black text-sky-700">{g.h}</p>
              <ul className="grid gap-2">
                {g.keys.map((k) => (
                  <li key={k} className="flex flex-col gap-0.5 rounded-2xl bg-white p-3.5 ring-1 ring-slate-200">
                    <span className="text-[15px] font-black text-slate-900">{ran[k].h}</span>
                    <span className="text-[13px] text-slate-600">{ran[k].d}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <p className={SRC}>出典：{src(K.ran.map((r) => r.src))}（{checked} 確認）</p>
        </section>

        <section className={SECTION} aria-labelledby="koshin">
          <h2 id="koshin" className={H2}>更新型と全期型</h2>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1 rounded-2xl bg-white p-3.5 ring-1 ring-orange-200">
              <span className="flex items-center gap-1.5 text-[15px] font-black text-slate-900"><RefreshCw size={18} className="text-orange-600" aria-hidden="true" />更新型</span>
              <span className="text-[12px] text-slate-600">{ran.koshin.d}</span>
            </div>
            <div className="flex flex-col gap-1 rounded-2xl bg-white p-3.5 ring-1 ring-slate-200">
              <span className="text-[15px] font-black text-slate-900">全期型</span>
              <span className="text-[12px] text-slate-600">{K.zenki}</span>
            </div>
          </div>
          <p className="text-[13px] text-slate-700">{K.koshinNote}<Link href="/guide/shisan-kanri/hoken-minaoshi-checklist" className="ml-1 font-bold text-sky-700 underline underline-offset-2">次の更新の日を出す</Link></p>
          <p className={SRC}>出典：{src(['jiliYougo'])}（{checked} 確認）</p>
        </section>

        <section className={SECTION} aria-labelledby="zei">
          <h2 id="zei" className={H2}>契約者・被保険者・受取人と税</h2>
          <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200">
            <table className="w-full text-[13px]">
              <thead className="bg-slate-50 text-[12px] text-slate-600">
                <tr><th className="px-2 py-2 text-left font-bold">契約者</th><th className="px-2 py-2 text-left font-bold">被保険者</th><th className="px-2 py-2 text-left font-bold">受取人</th><th className="px-2 py-2 text-left font-bold">死亡保険金の税</th></tr>
              </thead>
              <tbody>
                {K.zei.map((z) => (
                  <tr key={z.zei} className="border-t border-slate-100">
                    <td className="px-2 py-2.5">{z.keiyaku}</td><td className="px-2 py-2.5">{z.hihoken}</td><td className="px-2 py-2.5">{z.uketori}</td>
                    <td className="px-2 py-2.5"><span className="font-black text-slate-900">{z.zei}</span><br /><span className="text-[11px] text-slate-500">{z.memo}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[13px] text-slate-700">{K.zeiNote}</p>
          <Link href="/guide/souzoku/shibou-hokenkin-hikazei" className="flex items-center gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-slate-200 hover:ring-slate-300">
            <span className="flex flex-1 flex-col"><span className="text-[15px] font-black text-slate-900">相続税になるときの非課税を計算</span><span className="text-[12px] text-slate-600">500万円×法定相続人の数を、受取人ごとに</span></span>
            <ArrowRight size={18} className="text-sky-700" aria-hidden="true" />
          </Link>
          <p className={SRC}>出典：{src(['jiliZei', 'nta1750'])}（{checked} 確認）</p>
        </section>

        <section className={SECTION} aria-labelledby="nai">
          <h2 id="nai" className={H2}>保険証券がないとき</h2>
          <ol className="grid gap-2">
            {K.nai.map((n, i) => (
              <li key={n.h} className="flex items-start gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-slate-200">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky-700 text-[13px] font-black text-white">{i + 1}</span>
                <span className="flex flex-col"><span className="flex items-center gap-1.5 text-[15px] font-black text-slate-900">{i === 2 && <FileSearch size={16} className="text-sky-700" aria-hidden="true" />}{n.h}</span><span className="text-[13px] text-slate-600">{n.d}</span></span>
              </li>
            ))}
          </ol>
          <p className={SRC}>出典：{src(K.nai.map((n) => n.src))}（{checked} 確認）</p>
        </section>

        <section className={SECTION} aria-labelledby="henkou">
          <h2 id="henkou" className={H2}>受取人の変更</h2>
          <ul className="grid gap-2">
            {K.henkou.map((h) => (
              <li key={h.h} className="flex items-start gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-slate-200">
                <UserCog size={20} className="mt-0.5 shrink-0 text-sky-700" aria-hidden="true" />
                <span className="flex flex-col"><span className="text-[15px] font-black text-slate-900">{h.h}</span><span className="text-[13px] text-slate-600">{h.d}</span></span>
              </li>
            ))}
          </ul>
          <p className={SRC}>出典：{src(K.henkou.map((h) => h.src))}（{checked} 確認）</p>
        </section>

        <section className={SECTION} aria-labelledby="junban">
          <h2 id="junban" className={H2}>書き写した後の使い方</h2>
          <ol className="grid gap-2">
            {FLOW.map((f, i) => {
              const inner = (
                <>
                  <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[13px] font-black text-white ${f.href ? 'bg-sky-700' : 'bg-orange-600'}`}>{i + 1}</span>
                  <span className="flex flex-1 flex-col"><span className="text-[15px] font-black text-slate-900">{f.h}</span><span className="text-[12px] text-slate-600">{f.s}</span></span>
                  {f.href && <ArrowRight size={18} className="text-sky-700" aria-hidden="true" />}
                </>
              );
              return (
                <li key={f.h}>
                  {f.href ? (
                    <Link href={f.href} className="flex items-center gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-slate-200 hover:ring-slate-300">{inner}</Link>
                  ) : (
                    <span className="flex items-center gap-3 rounded-2xl bg-orange-50 p-3.5 ring-1 ring-orange-200">{inner}</span>
                  )}
                </li>
              );
            })}
          </ol>
        </section>

        <HokenSoudanBox lpId={LP_ID} position="bottom" lead="証券を書き写したら、無料で見直し相談" points={POINTS_BOX} beacon />

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
        </section>
        <p className="text-[11px] leading-relaxed text-slate-400">欄の名前は保険会社によって少し違います。保障の中身と日付は、保険会社の書面で確かめてください。最終更新：2026年11月11日</p>
      </main>
      <LpFooter />
    </div>
  );
}
