import type { Metadata } from 'next';
import Link from 'next/link';
import HenshuNote from '@/components/guide/HenshuNote';
import { ArrowRight, Download, FileSpreadsheet, FileText, Info } from 'lucide-react';
import LpHeader from '@/components/lp/LpHeader';
import LpFooter from '@/components/lp/LpFooter';
import LpViewTracker from '@/components/lp/LpViewTracker';
import { SITE_URL, SITE_NAME, ogImageUrl } from '@/components/loan/LoanArticle';
import HokenSoudanBox from '@/components/guide/HokenSoudanBox';
import KekkonIzokuCheck from '@/components/guide/KekkonIzokuCheck';
import DATA from '@/lib/hoken/haifu-data.json';

/**
 * 結婚したときの保険の見直しチェックリスト（2026-11-16 作成。docs/seisaku-queue.md の T28）。
 * 受ける言葉：結婚 保険 見直し（主）・結婚したら 保険 見直し チェックリスト・結婚 生命保険 受取人 変更・結婚 保険 夫婦。
 *   上位5件（11/16、WebSearch で顔ぶれ、web-fetch で本文。Chrome につながらず）：1 クラウドソーシング会社の媒体（2026/8、節目ごとの文の一覧）
 *   2 女性誌（2016、出典なし）3 女性誌（2016、本文約600字）4 保険の比較サイト（2025/1、仮の数字の試算3つ）5 結婚情報誌（2021、体験談）。
 *   上位が答えている疑問：結婚で死亡保障と医療保障をどう見直すか・受取人の変更・2人の保険の重なり・必要な保障の考え方。
 *   上位に欠けている点：①子のない夫婦は遺族基礎年金が出ないことと、遺族厚生年金の年齢の条件（30歳未満の妻は5年、夫は55歳以上）を自分の形で出す道具がない
 *   ②2028年4月の遺族厚生年金の見直しに触れたのは0件 ③印刷・エクセルのチェックリストがない ④数字が古い・出典がない（令和8年度の額と確認日がない）。
 * 出口：保険見直し本舗（レントラックス 7502、新規の無料面談の完了）。
 */
const LP_ID = 'guide-hoken-kekkon';
const VERSION = 'v1-2026-11-16';
const PAGE_PATH = '/guide/shisan-kanri/hoken-minaoshi-kekkon';
const TITLE = '結婚したら保険の見直しチェックリスト｜遺族年金が出るか確認（無料・エクセル）';
const DESCRIPTION = '結婚したときの保険の見直しで確かめる8つの点（受取人・名字と住所の届け出・2人の保険の重なり・死亡保障）を1枚にした無料のチェックリスト。子のない夫婦で遺族年金が出るかを、働き方と年齢から確かめられます（令和8年度）。';

export const metadata: Metadata = {
  title: `${TITLE} | ${SITE_NAME}`,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}${PAGE_PATH}` },
  openGraph: { title: TITLE, description: DESCRIPTION, url: `${SITE_URL}${PAGE_PATH}`, siteName: SITE_NAME, type: 'article', locale: 'ja_JP', images: [{ url: ogImageUrl(TITLE), width: 1200, height: 630, alt: TITLE }] },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, images: [ogImageUrl(TITLE)] },
};

const P = DATA.kekkon;
const POINTS_BOX = ['相談は無料', 'このチェックリストと遺族年金の確認の結果を見せると、話を進めやすい', '2人の保険をまとめて、専門の相談員と確かめる'];
const FAQS = [
  { q: '結婚したら保険の見直しは必要ですか？', a: '結婚は見直しの節目の1つです。まず受取人と名字・住所の届け出を確かめ、そのうえで、どちらかが亡くなったときに残る人の暮らしに要るお金を2人で考えます（生命保険文化センター）。' },
  { q: '結婚したら生命保険の受取人は変更したほうがいいですか？', a: '独身のころに親を受取人にした契約なら、今の家族に合うかを確かめます。受取人は保険期間中なら契約者が変えられ、被保険者の同意が要ります（生命保険文化センター）。' },
  { q: '子どもがいない夫婦でも遺族年金はもらえますか？', a: '遺族基礎年金は「子のある配偶者」か「子」だけなので出ません。会社員・公務員として厚生年金に入っている人が亡くなったときの遺族厚生年金は出ることがありますが、子のない30歳未満の妻は5年間だけ、子のない夫は55歳以上に限られ、受け取るのは60歳からです（日本年金機構）。' },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    { '@type': 'Article', author: { '@type': 'Organization', name: 'つぎの手ナビ 編集部', url: 'https://www.tsuginotenavi.jp/policy#ayamari' }, publisher: { '@id': 'https://www.tsuginotenavi.jp/#organization' }, headline: TITLE, description: DESCRIPTION, inLanguage: 'ja', datePublished: '2026-11-16T09:00:00+09:00', dateModified: '2026-11-16T09:00:00+09:00', mainEntityOfPage: `${SITE_URL}${PAGE_PATH}` },
    { '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: SITE_NAME, item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: '保険・お金の管理', item: `${SITE_URL}/guide/shisan-kanri` },
      { '@type': 'ListItem', position: 3, name: '結婚したときの保険の見直し', item: `${SITE_URL}${PAGE_PATH}` },
    ] },
    { '@type': 'FAQPage', mainEntity: FAQS.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) },
  ],
};

const SECTION = 'flex flex-col gap-5';
const H2 = 'text-[22px] font-black leading-snug text-slate-900';
const SRC = 'text-[11px] leading-relaxed text-slate-500';
const A = 'underline underline-offset-2';
const FILES = [
  { label: 'エクセル', href: '/downloads/hoken-minaoshi-kekkon.xlsx', icon: FileSpreadsheet },
  { label: 'PDF', href: '/downloads/hoken-minaoshi-kekkon.pdf', icon: FileText },
];
const FLOW = [
  { h: '保険の一覧表', s: '2人の保険を1枚に書き出す', href: '/guide/shisan-kanri/hoken-ichiran-excel' },
  { h: '保険証券の見方', s: '受取人と保障の期間を確かめる', href: '/guide/shisan-kanri/hoken-shoken-mikata' },
  { h: '保険の比較表', s: '見直し案と払う総額を比べる', href: '/guide/shisan-kanri/hoken-hikaku-excel' },
];

export default function Page() {
  const S = DATA.sources as Record<string, { name: string; url: string }>;
  const checked = P.checkedAt.split('-').join('/');
  const src = (keys: string[]) => [...new Set(keys)].map((k, i) => (
    <span key={k}>{i > 0 && '・'}<a href={S[k].url} target="_blank" rel="noopener noreferrer" className={A}>{S[k].name}</a></span>
  ));
  const groups = [...new Set(P.check.map((c) => c.g))];
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
            <p className="text-[13px] font-bold text-sky-700">保険の見直し・結婚</p>
            <h1 id="top" className="text-[28px] font-black leading-tight text-slate-900">結婚したら保険の<br />見直しチェックリスト<br /><span className="text-[20px] text-orange-600">受取人・届け出・遺族年金の確認</span></h1>
          </div>
          <p className="text-[15px] leading-relaxed text-slate-800">{P.kotae}</p>
          <KekkonIzokuCheck lpId={LP_ID} />
          <HokenSoudanBox lpId={LP_ID} position="hero" lead="遺族年金が出るかが分かったら、要る額を2人で無料相談" points={POINTS_BOX} />
          <div className="flex flex-col gap-3 rounded-2xl border-2 border-sky-200 bg-white p-4">
            <p className="text-[15px] font-black text-slate-900">印刷して使うチェックリスト<span className="ml-1.5 text-[12px] font-bold text-sky-700">無料</span></p>
            <div className="flex gap-2">
              {FILES.map(({ label, href, icon: FI }) => (
                <a key={href} href={href} download className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-sky-700 px-3 py-3 text-[15px] font-bold text-white hover:bg-sky-800">
                  <FI size={18} aria-hidden="true" />{label}<Download size={16} aria-hidden="true" />
                </a>
              ))}
            </div>
            <p className="text-[11px] text-slate-500">登録やメールアドレスの入力は要りません。エクセルには2人の保険を並べる欄があります</p>
          </div>
        </section>

        <section className={SECTION} aria-labelledby="check">
          <h2 id="check" className={H2}>結婚したら確かめる8つの点</h2>
          {groups.map((g) => (
            <div key={g} className="flex flex-col gap-2">
              <p className="text-[13px] font-black text-sky-800">{g}</p>
              <ul className="grid gap-2">
                {P.check.filter((c) => c.g === g).map((c) => (
                  <li key={c.key} className="flex flex-col rounded-2xl bg-white p-3.5 ring-1 ring-slate-200">
                    <span className="text-[15px] font-black text-slate-900">{c.h}</span>
                    <span className="text-[13px] text-slate-600">{c.d}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <p className="text-[13px] text-slate-700">{P.hitsuyo}</p>
          <p className={SRC}>出典：{src(['jiliShohenkou', 'jiliHitsuyo', 'jiliMinaoshi', 'mhlwKougaku', 'nenkinIzokuGuide'])}（{checked} 確認）</p>
        </section>

        <section className={SECTION} aria-labelledby="izoku">
          <h2 id="izoku" className={H2}>子のない夫婦の遺族年金</h2>
          <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200">
            <table className="w-full text-[13px]">
              <thead className="bg-slate-50 text-[11px] text-slate-600">
                <tr><th className="px-2 py-2 text-left font-bold">残る人</th><th className="px-2 py-2 text-left font-bold">遺族基礎年金</th><th className="px-2 py-2 text-left font-bold">遺族厚生年金（厚生年金に入っている間に亡くなったときなど）</th></tr>
              </thead>
              <tbody>
                {[
                  ['妻 30歳未満', '出ない', '5年間だけ'],
                  ['妻 30〜39歳', '出ない', '受け取れる'],
                  ['妻 40〜64歳', '出ない', '受け取れる＋中高齢寡婦加算'],
                  ['夫 55歳未満', '出ない', '出ない'],
                  ['夫 55〜59歳', '出ない', '60歳から'],
                  ['夫 60歳以上', '出ない', '受け取れる'],
                ].map(([a, b, c]) => (
                  <tr key={a} className="border-t border-slate-100">
                    <td className="px-2 py-2.5 font-black text-slate-900">{a}</td>
                    <td className="px-2 py-2.5 text-slate-500">{b}</td>
                    <td className="px-2 py-2.5 font-bold text-slate-900">{c}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ul className="grid gap-2">
            {P.izokuNote.map((t) => (
              <li key={t} className="flex items-start gap-2.5 rounded-2xl bg-white p-3.5 text-[14px] text-slate-800 ring-1 ring-slate-200">
                <Info size={18} className="mt-0.5 shrink-0 text-sky-700" aria-hidden="true" />{t}
              </li>
            ))}
          </ul>
          <p className="rounded-2xl bg-orange-50 p-3.5 text-[13px] text-slate-800 ring-1 ring-orange-200">{P.kaisei}</p>
          <p className={SRC}>出典：{src(['nenkinIzokuKousei', 'nenkinIzokuKiso', 'nenkinIzokuGuide', 'mhlwIzokuMinaoshi'])}（{checked} 確認）</p>
        </section>

        <section className={SECTION} aria-labelledby="junban">
          <h2 id="junban" className={H2}>次に使う表</h2>
          <ol className="grid gap-2">
            {FLOW.map((f, i) => (
              <li key={f.h}>
                <Link href={f.href} className="flex items-center gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-slate-200 hover:ring-slate-300">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky-700 text-[13px] font-black text-white">{i + 1}</span>
                  <span className="flex flex-1 flex-col"><span className="text-[15px] font-black text-slate-900">{f.h}</span><span className="text-[12px] text-slate-600">{f.s}</span></span>
                  <ArrowRight size={18} className="text-sky-700" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ol>
          <Link href="/guide/shisan-kanri/hoken-minaoshi-shussan" className="flex items-center gap-2 text-[13px] font-bold text-sky-700 underline underline-offset-2">子どもが生まれたときの見直し（遺族基礎年金の計算つき）<ArrowRight size={14} aria-hidden="true" /></Link>
          <Link href="/guide/shisan-kanri/hoken-minaoshi-checklist" className="flex items-center gap-2 text-[13px] font-bold text-sky-700 underline underline-offset-2">ほかの節目もまとめた生命保険の見直しチェックリスト<ArrowRight size={14} aria-hidden="true" /></Link>
        </section>

        <HokenSoudanBox lpId={LP_ID} position="bottom" lead="チェックが済んだら、2人で無料の見直し相談" points={POINTS_BOX} beacon />

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
        <HenshuNote />
        <p className="text-[11px] leading-relaxed text-slate-400">チェックリストと確認は見直しの前に確かめるための目安です。遺族年金を受け取れるかと額は年金事務所で、保障の中身は保険会社の書面で確かめてください。最終更新：2026年11月16日</p>
      </main>
      <LpFooter />
    </div>
  );
}
