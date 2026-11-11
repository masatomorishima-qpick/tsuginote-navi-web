import type { Metadata } from 'next';
import Link from 'next/link';
import HenshuNote from '@/components/guide/HenshuNote';
import { AlertTriangle, CalendarClock, Download, FileSpreadsheet, FileText, Layers, ListChecks, Wallet } from 'lucide-react';
import LpHeader from '@/components/lp/LpHeader';
import LpFooter from '@/components/lp/LpFooter';
import LpViewTracker from '@/components/lp/LpViewTracker';
import { SITE_URL, SITE_NAME, ogImageUrl } from '@/components/loan/LoanArticle';
import HokenSoudanBox from '@/components/guide/HokenSoudanBox';
import HokenSogakuCalc from '@/components/guide/HokenSogakuCalc';
import DATA from '@/lib/hoken/haifu-data.json';

/**
 * 保険の比較表（いまの保険と見直し案を並べる、エクセル・PDF）（2026-11-10 作成。docs/seisaku-queue.md の T2）。
 * 受ける言葉：保険 比較表 エクセル・医療保険 比較表 エクセル・生命保険 比較表。
 *   上位（11/10）はひな形の配布サイトと意図違いの結果（協会けんぽの料額表など）。保険の一覧表のページがこの言葉で6.2位（Search Console 28日）。
 * 出口：保険見直し本舗（レントラックス 7502、新規の無料面談の完了 14,520円）。表ができた人の次の一歩＝見直しの相談。
 * 文言の元：生命保険文化センター「生命保険の契約にあたっての手引」その3（見直しの方法・乗り換えの留意点）。
 */
const LP_ID = 'guide-hoken-hikaku';
const VERSION = 'v1-2026-11-10';
const PAGE_PATH = '/guide/shisan-kanri/hoken-hikaku-excel';
const TITLE = '保険の比較表（無料・エクセル）｜いまの保険と見直し案を並べて、払う総額を自動計算';
const DESCRIPTION = '生命保険・医療保険の比較表の無料テンプレート（エクセル・PDF、登録不要）。いまの保険と見直し案を同じ欄で並べ、払う総額（月の保険料×12×年数）と差を自動で計算します。乗り換える前に確かめる4つの点も。';

export const metadata: Metadata = {
  title: `${TITLE} | ${SITE_NAME}`,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}${PAGE_PATH}` },
  openGraph: { title: TITLE, description: DESCRIPTION, url: `${SITE_URL}${PAGE_PATH}`, siteName: SITE_NAME, type: 'article', locale: 'ja_JP', images: [{ url: ogImageUrl(TITLE), width: 1200, height: 630, alt: TITLE }] },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, images: [ogImageUrl(TITLE)] },
};

const K = DATA.hikaku;
const POINTS_BOX = ['相談は無料', 'この比較表を見せれば、話が早い', '乗り換えるか、減らすかを、プロと確かめる'];
const FAQS = [
  { q: 'どこを見て書き写せばいいですか？', a: '保険証券や、保険会社から届く契約内容のお知らせから書き写します。いまの保険がいくつもあるときは、先に保険の一覧表で全部を書き出すと抜けがありません。' },
  { q: '見直し案のほうが安いなら、すぐ乗り換えていいですか？', a: '乗り換えると契約するときの年齢が上がって割高になることや、健康状態によっては新しく入れないことがあります。解約した保険は元に戻せないので、新しい契約が成立してから解約します（生命保険文化センター）。' },
  { q: '乗り換えずに保険料を下げる方法はありますか？', a: '保険金を減らす、特約だけを解約する、といった方法があり、減らした分の保険料が安くなります。どれが合うかは、比較表を持って相談すると早く決まります。' },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    { '@type': 'Article', author: { '@type': 'Organization', name: 'つぎの手ナビ 編集部', url: 'https://www.tsuginotenavi.jp/policy#ayamari' }, publisher: { '@id': 'https://www.tsuginotenavi.jp/#organization' }, headline: TITLE, description: DESCRIPTION, inLanguage: 'ja', datePublished: '2026-11-10T21:00:00+09:00', dateModified: '2026-11-10T21:00:00+09:00', mainEntityOfPage: `${SITE_URL}${PAGE_PATH}` },
    { '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: SITE_NAME, item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: '保険の比較表', item: `${SITE_URL}${PAGE_PATH}` },
    ] },
    { '@type': 'FAQPage', mainEntity: FAQS.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) },
  ],
};

const SECTION = 'flex flex-col gap-5';
const H2 = 'text-[22px] font-black leading-snug text-slate-900';
const SRC = 'text-[11px] leading-relaxed text-slate-500';
const A = 'underline underline-offset-2';
const POINT_ICONS = [Layers, Wallet, CalendarClock];
const FILES = [
  { label: 'エクセル', href: '/downloads/hoken-hikaku.xlsx', icon: FileSpreadsheet },
  { label: 'PDF', href: '/downloads/hoken-hikaku.pdf', icon: FileText },
];

export default function Page() {
  const S = DATA.sources;
  const checked = K.checkedAt.split('-').join('/');
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
            <p className="text-[13px] font-bold text-sky-700">保険の見直し</p>
            <h1 id="top" className="text-[28px] font-black leading-tight text-slate-900">保険の比較表<br /><span className="text-orange-600">いまの保険と並べる</span></h1>
          </div>
          <div className="flex flex-col gap-3 rounded-2xl border-2 border-sky-200 bg-sky-50/60 p-4">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-sky-700 ring-1 ring-sky-200"><ListChecks size={24} aria-hidden="true" /></span>
              <span className="flex flex-col">
                <span className="text-[17px] font-black text-slate-900">保険の比較表<span className="ml-1.5 text-[12px] font-bold text-sky-700">無料</span></span>
                <span className="text-[12px] text-slate-600">{K.rows.length}の欄で3つ並べる。払う総額は自動</span>
              </span>
            </div>
            <div className="flex gap-2">
              {FILES.map(({ label, href, icon: FI }) => (
                <a key={href} href={href} download className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-sky-700 px-3 py-3 text-[15px] font-bold text-white hover:bg-sky-800">
                  <FI size={18} aria-hidden="true" />{label}<Download size={16} aria-hidden="true" />
                </a>
              ))}
            </div>
            <p className="text-[11px] text-slate-500">登録やメールアドレスの入力は要りません</p>
          </div>
          <HokenSogakuCalc lpId={LP_ID} />
          <HokenSoudanBox lpId={LP_ID} position="hero" lead="比べて迷ったら、無料でプロに相談する" points={POINTS_BOX} />
        </section>

        <section className={SECTION} aria-labelledby="ran">
          <h2 id="ran" className={H2}>比較表の欄</h2>
          <ul className="grid grid-cols-2 gap-2">
            {K.rows.map((r) => (
              <li key={r.h} className={`rounded-xl px-3 py-2 text-[12px] font-bold ring-1 ${r.kind === 'calc' ? 'bg-emerald-50 text-emerald-800 ring-emerald-200' : 'bg-white text-slate-800 ring-slate-200'}`}>{r.h}</li>
            ))}
          </ul>
          <p className="text-[14px] text-slate-700">いまの保険がいくつもあるときは、先に<Link href="/guide/shisan-kanri/hoken-ichiran-excel" className={`${A} text-sky-800`}>保険の一覧表</Link>で全部を書き出します。見直しどきかは<Link href="/guide/shisan-kanri/hoken-minaoshi-checklist" className={`${A} text-sky-800`}>見直しチェックリスト</Link>で確かめます。</p>
        </section>

        <section className={SECTION} aria-labelledby="miru">
          <h2 id="miru" className={H2}>比べる3つの点</h2>
          <ul className="grid gap-2">
            {K.points.map((p, i) => {
              const I = POINT_ICONS[i] ?? Layers;
              return (
                <li key={p.h} className="flex items-start gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-slate-200">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-700"><I size={20} aria-hidden="true" /></span>
                  <span className="flex flex-col"><span className="text-[15px] font-black text-slate-900">{p.h}</span><span className="text-[13px] text-slate-600">{p.d}</span></span>
                </li>
              );
            })}
          </ul>
        </section>

        <section className={SECTION} aria-labelledby="norikae">
          <h2 id="norikae" className={H2}>乗り換える前に</h2>
          <ul className="grid gap-2">
            {K.norikae.map((t) => (
              <li key={t} className="flex items-start gap-3 rounded-2xl bg-white p-3.5 text-[14px] text-slate-800 ring-1 ring-orange-200">
                <AlertTriangle size={20} className="mt-0.5 shrink-0 text-orange-600" aria-hidden="true" />{t}
              </li>
            ))}
          </ul>
          <p className={SRC}>出典：<a href={S.jiliMinaoshi.url} target="_blank" rel="noopener noreferrer" className={A}>{S.jiliMinaoshi.name}</a>（{checked} 確認）</p>
        </section>

        <section className={SECTION} aria-labelledby="houhou">
          <h2 id="houhou" className={H2}>見直しの5つの方法</h2>
          <ol className="grid gap-2">
            {K.houhou.map((h, i) => (
              <li key={h.h} className="flex items-start gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-slate-200">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky-700 text-[13px] font-black text-white">{i + 1}</span>
                <span className="flex flex-col"><span className="text-[15px] font-black text-slate-900">{h.h}</span><span className="text-[13px] text-slate-600">{h.d}</span></span>
              </li>
            ))}
          </ol>
          <p className={SRC}>出典：<a href={S.jiliMinaoshi.url} target="_blank" rel="noopener noreferrer" className={A}>{S.jiliMinaoshi.name}</a></p>
        </section>

        <HokenSoudanBox lpId={LP_ID} position="bottom" lead="比較表ができたら、無料で見直し相談" points={POINTS_BOX} beacon />

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
        <p className="text-[11px] leading-relaxed text-slate-400">比較表は書き写して比べるための参考の形です。保障の中身は保険会社の書面で確かめてください。最終更新：2026年11月10日</p>
      </main>
      <LpFooter />
    </div>
  );
}
