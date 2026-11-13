import type { Metadata } from 'next';
import Link from 'next/link';
import HenshuNote from '@/components/guide/HenshuNote';
import { ArrowRight, Download, FileSpreadsheet, FileText, HandCoins, Info } from 'lucide-react';
import LpHeader from '@/components/lp/LpHeader';
import LpFooter from '@/components/lp/LpFooter';
import LpViewTracker from '@/components/lp/LpViewTracker';
import { SITE_URL, SITE_NAME, ogImageUrl } from '@/components/loan/LoanArticle';
import HokenSoudanBox from '@/components/guide/HokenSoudanBox';
import IzokuNenkinCalc from '@/components/guide/IzokuNenkinCalc';
import DATA from '@/lib/hoken/haifu-data.json';

/**
 * 子どもが生まれたときの保険の見直しチェックリスト（2026-11-14 作成。docs/seisaku-queue.md の T21）。
 * 受ける言葉：保険 見直し 子供が生まれたら（主）・出産 保険 見直し・子供 生まれた 生命保険・保険 見直し チェックリスト 出産。
 *   上位5件（11/14、WebSearch。Chrome につながらず）：1 在宅ワークの媒体（2026/8、文のチェックリスト）2 楽天カードの媒体（2023、質問の回答）
 *   3 お金の媒体（2025/7 更新だが遺族年金の額は平成29年度）4 三井住友銀行（数字は平成30年度の調査）5 女性誌（2016）。
 *   上位が答えている疑問：死亡保障を増やすか・必要保障額の考え方・教育費の準備・公的な保障（遺族年金など）を引いて考える・共働きの備え。
 *   上位に欠けている点：①遺族年金を自分の子の人数と生年月日で出す計算がない ②公的な給付の数字が古い（令和8年度の額と確認日がない）
 *   ③印刷・エクセルのチェックリストがない ④受取人を確かめる点が手順になっていない ⑤2028年4月の遺族年金の見直しに触れていない。
 * 出口：保険見直し本舗（レントラックス 7502、新規の無料面談の完了 14,520円）。
 */
const LP_ID = 'guide-hoken-shussan';
const VERSION = 'v1-2026-11-14';
const PAGE_PATH = '/guide/shisan-kanri/hoken-minaoshi-shussan';
const TITLE = '子どもが生まれたら保険の見直しチェックリスト｜遺族年金の計算つき（無料・エクセル）';
const DESCRIPTION = '子どもが生まれたときの保険の見直しで確かめる8つの点を1枚にした無料のチェックリスト（エクセル・PDF）。子の生年月日を入れると、遺族基礎年金の年額と合計の目安（令和8年度の額）が出ます。出産育児一時金・児童手当の額も。';

export const metadata: Metadata = {
  title: `${TITLE} | ${SITE_NAME}`,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}${PAGE_PATH}` },
  openGraph: { title: TITLE, description: DESCRIPTION, url: `${SITE_URL}${PAGE_PATH}`, siteName: SITE_NAME, type: 'article', locale: 'ja_JP', images: [{ url: ogImageUrl(TITLE), width: 1200, height: 630, alt: TITLE }] },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, images: [ogImageUrl(TITLE)] },
};

const P = DATA.shussan;
const POINTS_BOX = ['相談は無料', 'このチェックリストと遺族年金の目安を見せると、話を進めやすい', '増やすか、そのままかを、専門の相談員と確かめる'];
const FAQS = [
  { q: '子どもが生まれたら、保険は見直したほうがいいですか？', a: '子どもの誕生は見直しの節目の1つです。家族が増えると、親が亡くなったときに要るお金が増えるので、受取人と死亡保障の額を確かめます。必要な額は、遺族年金などで入るお金を引いて考えます（生命保険文化センター）。' },
  { q: '子どもが生まれたら、死亡保障はいくら必要ですか？', a: '決まった額はありません。「遺族の支出の見込み − 遺族の収入の見込み」の不足分が目安です（生命保険文化センター）。収入の見込みには、遺族基礎年金（令和8年度は年847,300円＋子の加算）などが入ります。' },
  { q: '学資保険には入ったほうがいいですか？', a: '教育費の準備の方法の1つです。貯蓄で準備する方法もあるので、払い込む期間と受け取る時期、途中でやめたときの扱いを確かめてから決めます。' },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    { '@type': 'Article', author: { '@type': 'Organization', name: 'つぎの手ナビ 編集部', url: 'https://www.tsuginotenavi.jp/policy#ayamari' }, publisher: { '@id': 'https://www.tsuginotenavi.jp/#organization' }, headline: TITLE, description: DESCRIPTION, inLanguage: 'ja', datePublished: '2026-11-14T09:00:00+09:00', dateModified: '2026-11-14T09:00:00+09:00', mainEntityOfPage: `${SITE_URL}${PAGE_PATH}` },
    { '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: SITE_NAME, item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: '保険・お金の管理', item: `${SITE_URL}/guide/shisan-kanri` },
      { '@type': 'ListItem', position: 3, name: '子どもが生まれたときの保険の見直し', item: `${SITE_URL}${PAGE_PATH}` },
    ] },
    { '@type': 'FAQPage', mainEntity: FAQS.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) },
  ],
};

const SECTION = 'flex flex-col gap-5';
const H2 = 'text-[22px] font-black leading-snug text-slate-900';
const SRC = 'text-[11px] leading-relaxed text-slate-500';
const A = 'underline underline-offset-2';
const FILES = [
  { label: 'エクセル', href: '/downloads/hoken-minaoshi-shussan.xlsx', icon: FileSpreadsheet },
  { label: 'PDF', href: '/downloads/hoken-minaoshi-shussan.pdf', icon: FileText },
];
const FLOW = [
  { h: '保険の一覧表', s: '入っている保険を全部書き出す', href: '/guide/shisan-kanri/hoken-ichiran-excel' },
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
            <p className="text-[13px] font-bold text-sky-700">保険の見直し・子どもの誕生</p>
            <h1 id="top" className="text-[28px] font-black leading-tight text-slate-900">子どもが生まれたら<br /><span className="text-orange-600">保険の見直しチェックリスト</span></h1>
          </div>
          <p className="text-[15px] leading-relaxed text-slate-800">{P.kotae}</p>
          <IzokuNenkinCalc lpId={LP_ID} />
          <HokenSoudanBox lpId={LP_ID} position="hero" lead="遺族年金で足りない分が見えたら、無料で相談する" points={POINTS_BOX} />
          <div className="flex flex-col gap-3 rounded-2xl border-2 border-sky-200 bg-white p-4">
            <p className="text-[15px] font-black text-slate-900">印刷して使うチェックリスト<span className="ml-1.5 text-[12px] font-bold text-sky-700">無料</span></p>
            <div className="flex gap-2">
              {FILES.map(({ label, href, icon: FI }) => (
                <a key={href} href={href} download className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-sky-700 px-3 py-3 text-[15px] font-bold text-white hover:bg-sky-800">
                  <FI size={18} aria-hidden="true" />{label}<Download size={16} aria-hidden="true" />
                </a>
              ))}
            </div>
            <p className="text-[11px] text-slate-500">登録やメールアドレスの入力は要りません。エクセルは子の生年月日から遺族基礎年金の目安が自動で出ます</p>
          </div>
        </section>

        <section className={SECTION} aria-labelledby="check">
          <h2 id="check" className={H2}>子どもが生まれたら確かめる8つの点</h2>
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
          <p className={SRC}>出典：{src(['jiliHitsuyo', 'jiliMinaoshi', 'mhlwKougaku', 'cfaJidou'])}（{checked} 確認）</p>
        </section>

        <section className={SECTION} aria-labelledby="kouteki">
          <h2 id="kouteki" className={H2}>出産と子育ての公的な給付（令和8年度）</h2>
          <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200">
            <table className="w-full text-[13px]">
              <tbody>
                {P.kouteki.map((k, i) => (
                  <tr key={k.h} className={`align-top ${i > 0 ? 'border-t border-slate-100' : ''}`}>
                    <th className="w-[32%] bg-slate-50 px-3 py-2.5 text-left font-bold text-slate-700"><span className="flex items-center gap-1.5"><HandCoins size={14} className="shrink-0 text-sky-700" aria-hidden="true" />{k.h}</span></th>
                    <td className="px-3 py-2.5"><span className="font-black text-slate-900">{k.v}</span><span className="block text-[12px] text-slate-600">{k.d}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className={SRC}>出典：{src(['kyoukaiShussan', 'mhlwShussan', 'cfaJidou', 'nenkinIzokuGuide'])}（{checked} 確認）</p>
        </section>

        <section className={SECTION} aria-labelledby="izoku">
          <h2 id="izoku" className={H2}>遺族年金を受け取れる人と額</h2>
          <ul className="grid gap-2">
            {P.izokuNote.map((t) => (
              <li key={t} className="flex items-start gap-2.5 rounded-2xl bg-white p-3.5 text-[14px] text-slate-800 ring-1 ring-slate-200">
                <Info size={18} className="mt-0.5 shrink-0 text-sky-700" aria-hidden="true" />{t}
              </li>
            ))}
          </ul>
          <p className="rounded-2xl bg-orange-50 p-3.5 text-[13px] text-slate-800 ring-1 ring-orange-200">{P.kaisei}</p>
          <p className={SRC}>出典：{src(['nenkinIzokuKiso', 'nenkinIzokuGuide', 'mhlwIzokuMinaoshi'])}（{checked} 確認）</p>
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
          <Link href="/guide/shisan-kanri/hoken-minaoshi-checklist" className="flex items-center gap-2 text-[13px] font-bold text-sky-700 underline underline-offset-2">ほかの節目もまとめた生命保険の見直しチェックリスト<ArrowRight size={14} aria-hidden="true" /></Link>
        </section>

        <HokenSoudanBox lpId={LP_ID} position="bottom" lead="チェックが済んだら、無料で見直し相談" points={POINTS_BOX} beacon />

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
        <p className="text-[11px] leading-relaxed text-slate-400">チェックリストと計算は見直しの前に確かめるための目安です。遺族年金の額は年金事務所で、保障の中身は保険会社の書面で確かめてください。最終更新：2026年11月14日</p>
      </main>
      <LpFooter />
    </div>
  );
}
