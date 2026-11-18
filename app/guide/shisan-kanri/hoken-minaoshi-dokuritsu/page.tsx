import type { Metadata } from 'next';
import Link from 'next/link';
import HenshuNote from '@/components/guide/HenshuNote';
import { ArrowRight, Download, FileSpreadsheet, FileText, Info } from 'lucide-react';
import LpHeader from '@/components/lp/LpHeader';
import LpFooter from '@/components/lp/LpFooter';
import LpViewTracker from '@/components/lp/LpViewTracker';
import { SITE_URL, SITE_NAME, ogImageUrl } from '@/components/loan/LoanArticle';
import HokenSoudanBox from '@/components/guide/HokenSoudanBox';
import DokuritsuIzokuCalc from '@/components/guide/DokuritsuIzokuCalc';
import DATA from '@/lib/hoken/haifu-data.json';

/**
 * 子どもが独立したときの保険の見直し（2026-11-19 作成。docs/seisaku-queue.md の T34）。
 * 受ける言葉：子供 独立 保険 見直し（主）・子供が独立したら 生命保険・子育て終了 保険 見直し・死亡保障 減らす。
 *   上位5件（11/19、WebSearch。Chrome につながらず）：1・2 マネーポスト（同じ記事の1・2ページ）3 マネーフォワードの媒体
 *   4 Oggi（女性誌）5 ファイナンシャルフィールド。ほかにリベシティ（個人の投稿）・マネーキャリア・お金の相談の会社。
 *   上位が答えている疑問：死亡保障を減らしてよいか・医療保険や老後の備えに替えるか・解約か減額か・何歳で見直すか。
 *   上位に欠けている点：①遺族基礎年金が「18歳の年度末」で終わり、大学の間は出ないことを日付で出す道具がない
 *   ②減額・特約の解約・払済・延長・解約の違いと注意（特約が消えるなど）を一次情報で並べた表がない
 *   ③印刷できるチェックリストがない ④令和8年度の年金額と確認日がない。
 * 出口：保険見直し本舗（レントラックス 7502、新規の無料面談の完了）。
 */
const LP_ID = 'guide-hoken-dokuritsu';
const VERSION = 'v1-2026-11-19';
const PAGE_PATH = '/guide/shisan-kanri/hoken-minaoshi-dokuritsu';
const TITLE = '子供が独立したら保険の見直し｜遺族年金が終わる日も計算（無料チェックリスト）';
const DESCRIPTION = '子どもが独立したときの保険の見直しで確かめる8つの点を1枚にした無料のチェックリスト（エクセル・PDF）。末の子の生年月日を入れると、遺族基礎年金が終わる日（18歳の年度末）と独立までの空白の年数が出ます。減額・払済・延長の違いも。';

export const metadata: Metadata = {
  title: `${TITLE} | ${SITE_NAME}`,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}${PAGE_PATH}` },
  openGraph: { title: TITLE, description: DESCRIPTION, url: `${SITE_URL}${PAGE_PATH}`, siteName: SITE_NAME, type: 'article', locale: 'ja_JP', images: [{ url: ogImageUrl(TITLE), width: 1200, height: 630, alt: TITLE }] },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, images: [ogImageUrl(TITLE)] },
};

const P = DATA.dokuritsu;
const POINTS_BOX = ['相談は無料', 'このチェックリストと保険証券を見せると、話を進めやすい', '夫婦の保険をまとめて、専門の相談員と確かめる'];
const FAQS = [
  { q: '子供が独立したら生命保険は必要ですか？', a: '残る家族の暮らししだいです。必要な保障の額の目安は「遺族の支出の見込み − 遺族の収入の見込み」です。教育費と子の生活費の見込みが減るので、目安は小さくなります（生命保険文化センター）。配偶者の生活費や葬儀のお金など、残る分を計算し直します。' },
  { q: '遺族年金は子供が何歳までもらえますか？', a: '遺族基礎年金は、子が18歳になった年度の3月31日まで（障害年金の1級・2級の状態なら20歳未満）です。大学に通っていても、その日を過ぎると対象の子ではなくなります（日本年金機構）。' },
  { q: '保険は解約と減額のどちらがいいですか？', a: '保障を少し残したいなら、減額や特約の解約で保険料を下げる方法があります。解約した生命保険は元に戻せず、解約返戻金はふつう払い込んだ保険料より少ないので、新しい契約が決まってから手続きします（生命保険文化センター）。' },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    { '@type': 'Article', author: { '@type': 'Organization', name: 'つぎの手ナビ 編集部', url: 'https://www.tsuginotenavi.jp/policy#ayamari' }, publisher: { '@id': 'https://www.tsuginotenavi.jp/#organization' }, headline: TITLE, description: DESCRIPTION, inLanguage: 'ja', datePublished: '2026-11-19T09:00:00+09:00', dateModified: '2026-11-19T09:00:00+09:00', mainEntityOfPage: `${SITE_URL}${PAGE_PATH}` },
    { '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: SITE_NAME, item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: '保険・お金の管理', item: `${SITE_URL}/guide/shisan-kanri` },
      { '@type': 'ListItem', position: 3, name: '子どもが独立したときの保険の見直し', item: `${SITE_URL}${PAGE_PATH}` },
    ] },
    { '@type': 'FAQPage', mainEntity: FAQS.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) },
  ],
};

const SECTION = 'flex flex-col gap-5';
const H2 = 'text-[22px] font-black leading-snug text-slate-900';
const SRC = 'text-[11px] leading-relaxed text-slate-500';
const A = 'underline underline-offset-2';
const FILES = [
  { label: 'エクセル', href: '/downloads/hoken-minaoshi-dokuritsu.xlsx', icon: FileSpreadsheet },
  { label: 'PDF', href: '/downloads/hoken-minaoshi-dokuritsu.pdf', icon: FileText },
];
const FLOW = [
  { h: '保険の一覧表', s: '夫婦の保険を1枚に書き出す', href: '/guide/shisan-kanri/hoken-ichiran-excel' },
  { h: '保険証券の見方', s: '受取人と更新の年を確かめる', href: '/guide/shisan-kanri/hoken-shoken-mikata' },
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
            <p className="text-[13px] font-bold text-sky-700">保険の見直し・子どもの独立</p>
            <h1 id="top" className="text-[28px] font-black leading-tight text-slate-900">子供が独立したら<br />保険の見直し<br />チェックリスト<br /><span className="text-[20px] text-orange-600">遺族年金が終わる日と8つの点</span></h1>
          </div>
          <p className="text-[15px] leading-relaxed text-slate-800">{P.kotae}<span className="text-[11px] text-slate-500">（生命保険文化センター・日本年金機構）</span></p>
          <DokuritsuIzokuCalc lpId={LP_ID} />
          <HokenSoudanBox lpId={LP_ID} position="hero" lead="遺族年金が終わる日が分かったら、死亡保障の減らし方を無料で相談" points={POINTS_BOX} />
          <div className="flex flex-col gap-3 rounded-2xl border-2 border-sky-200 bg-white p-4">
            <p className="text-[15px] font-black text-slate-900">印刷して使うチェックリスト<span className="ml-1.5 text-[12px] font-bold text-sky-700">無料</span></p>
            <div className="flex gap-2">
              {FILES.map(({ label, href, icon: FI }) => (
                <a key={href} href={href} download className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-sky-700 px-3 py-3 text-[15px] font-bold text-white hover:bg-sky-800">
                  <FI size={18} aria-hidden="true" />{label}<Download size={16} aria-hidden="true" />
                </a>
              ))}
            </div>
            <p className="text-[11px] text-slate-500">登録やメールアドレスの入力は要りません。エクセルは末の子の生年月日を入れると遺族基礎年金が終わる日が出ます</p>
          </div>
        </section>

        <section className={SECTION} aria-labelledby="izoku">
          <h2 id="izoku" className={H2}>子供の独立と遺族年金</h2>
          <ul className="grid gap-2">
            {P.izokuNote.map((t) => (
              <li key={t} className="flex items-start gap-2.5 rounded-2xl bg-white p-3.5 text-[14px] text-slate-800 ring-1 ring-slate-200">
                <Info size={18} className="mt-0.5 shrink-0 text-sky-700" aria-hidden="true" />{t}
              </li>
            ))}
          </ul>
          <p className={SRC}>出典：{src(['nenkinIzokuKisoR8', 'nenkinIzoku'])}（{checked} 確認）</p>
        </section>

        <section className={SECTION} aria-labelledby="hoho">
          <h2 id="hoho" className={H2}>死亡保障を減らす方法（減額・払済・延長）</h2>
          <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200">
            <table className="w-full text-[13px]">
              <thead className="bg-slate-50 text-[12px] text-slate-600"><tr><th className="w-[24%] px-3 py-2 text-left font-bold">方法</th><th className="px-3 py-2 text-left font-bold">中身</th><th className="w-[32%] px-3 py-2 text-left font-bold">気をつけること</th></tr></thead>
              <tbody>
                {P.hoho.map((x) => (
                  <tr key={x.h} className="border-t border-slate-100 align-top"><td className="px-3 py-2.5 font-black text-slate-900">{x.h}</td><td className="px-3 py-2.5 text-slate-800">{x.d}</td><td className="px-3 py-2.5 text-[12px] text-slate-700">{x.chui}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className={SRC}>出典：{src(P.hoho.map((x) => x.src).concat(['jiliKonnan']))}（{checked} 確認）</p>
        </section>

        <section className={SECTION} aria-labelledby="check">
          <h2 id="check" className={H2}>子供が独立したら保険の見直しで確かめる8つの点</h2>
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
          <p className={SRC}>出典：{src(P.check.map((c) => c.src))}（{checked} 確認）</p>
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

        <HokenSoudanBox lpId={LP_ID} position="bottom" lead="チェックが済んだら、夫婦で無料の見直し相談" points={POINTS_BOX} beacon />

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
        <p className="text-[11px] leading-relaxed text-slate-400">チェックリストと日付は見直しの前に確かめるための目安です。遺族年金は年金事務所で、保障の中身は保険会社の書面で確かめてください。最終更新：2026年11月19日</p>
      </main>
      <LpFooter />
    </div>
  );
}
