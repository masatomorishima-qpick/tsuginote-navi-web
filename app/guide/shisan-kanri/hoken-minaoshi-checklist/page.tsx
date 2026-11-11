import type { Metadata } from 'next';
import Link from 'next/link';
import HenshuNote from '@/components/guide/HenshuNote';
import { AlertTriangle, ArrowRight, Download, FileSpreadsheet, FileText, HeartPulse, Users } from 'lucide-react';
import LpHeader from '@/components/lp/LpHeader';
import LpFooter from '@/components/lp/LpFooter';
import LpViewTracker from '@/components/lp/LpViewTracker';
import { SITE_URL, SITE_NAME, ogImageUrl } from '@/components/loan/LoanArticle';
import HokenSoudanBox from '@/components/guide/HokenSoudanBox';
import HokenMinaoshiCheck from '@/components/guide/HokenMinaoshiCheck';
import DATA from '@/lib/hoken/haifu-data.json';

/**
 * 生命保険の見直しチェックリスト（2026-11-10 作成。docs/seisaku-queue.md の T3）。
 * 受ける言葉：生命保険 見直し チェックリスト（主）・保険 見直し 確認すること・保険 見直し 更新。
 *   上位5件（11/10、Google）：1 保険代理店（約2,800字・配布物なし）2 相続の情報サイト（契約者・受取人の12項目）
 *   3 保険代理店（6問の診断）4 保険の比較サイト（証券の画像）5 保険代理店（節目7つ）。省庁・保険会社は上位5件にいない。
 *   上位に欠けている点：①エクセル・PDF の配布物がない ②更新の時期を出す道具がない ③公的な保障（高額療養費・遺族年金）を先に確かめる点がない
 *   ④一次情報（生命保険文化センター）の出典がほぼない。
 * 出口：保険見直し本舗（レントラックス 7502、新規の無料面談の完了 14,520円）。
 * 文言の元：生命保険文化センター（手引 その3・その4、保障内容の変更と対応方法）、厚生労働省（高額療養費）、日本年金機構（遺族年金）。
 */
const LP_ID = 'guide-hoken-minaoshi';
const VERSION = 'v1-2026-11-10';
const PAGE_PATH = '/guide/shisan-kanri/hoken-minaoshi-checklist';
const TITLE = '生命保険の見直しチェックリスト（無料・エクセル）｜節目・証券の6項目・更新の時期';
const DESCRIPTION = '生命保険の見直しで確かめることを1枚にした無料のチェックリスト（エクセル・PDF、登録不要）。節目、保険証券で見る6つの項目、契約した日から次の更新の目安、見直す前の注意まで。公的な保障の確かめ方も。';

export const metadata: Metadata = {
  title: `${TITLE} | ${SITE_NAME}`,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}${PAGE_PATH}` },
  openGraph: { title: TITLE, description: DESCRIPTION, url: `${SITE_URL}${PAGE_PATH}`, siteName: SITE_NAME, type: 'article', locale: 'ja_JP', images: [{ url: ogImageUrl(TITLE), width: 1200, height: 630, alt: TITLE }] },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, images: [ogImageUrl(TITLE)] },
};

const M = DATA.minaoshi;
const POINTS_BOX = ['相談は無料', 'このチェックリストを見せれば、話が早い', '減らすか、変えるかを、プロと確かめる'];
const FAQS = [
  { q: '見直しは、どのくらいの間隔でしますか？', a: '決まった間隔はありません。結婚や子どもの誕生など家族やお金の節目と、更新の前が目安です。更新型の保険は、更新しない・減らすときは更新の前に申し出ます（生命保険文化センター）。' },
  { q: '保険証券が見つからないときは？', a: '契約している保険会社に問い合わせると、契約の内容を確かめられます。保険会社から届く契約内容のお知らせや、保険料の控除証明書でも、保険会社名が分かります。' },
  { q: '見直しで気をつけることは？', a: '解約した保険は元に戻せないので、新しい契約が成立してから解約します。乗り換えは年齢が上がって割高になることや、健康状態で入れないことがあります。保険金を減らす・特約だけ解約する方法もあります（生命保険文化センター）。' },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    { '@type': 'Article', author: { '@type': 'Organization', name: 'つぎの手ナビ 編集部', url: 'https://www.tsuginotenavi.jp/policy#ayamari' }, publisher: { '@id': 'https://www.tsuginotenavi.jp/#organization' }, headline: TITLE, description: DESCRIPTION, inLanguage: 'ja', datePublished: '2026-11-10T23:30:00+09:00', dateModified: '2026-11-10T23:30:00+09:00', mainEntityOfPage: `${SITE_URL}${PAGE_PATH}` },
    { '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: SITE_NAME, item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: '生命保険の見直しチェックリスト', item: `${SITE_URL}${PAGE_PATH}` },
    ] },
    { '@type': 'FAQPage', mainEntity: FAQS.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) },
  ],
};

const SECTION = 'flex flex-col gap-5';
const H2 = 'text-[22px] font-black leading-snug text-slate-900';
const SRC = 'text-[11px] leading-relaxed text-slate-500';
const A = 'underline underline-offset-2';
const KOUTEKI_ICONS = [HeartPulse, Users];
const FILES = [
  { label: 'エクセル', href: '/downloads/hoken-minaoshi-checklist.xlsx', icon: FileSpreadsheet },
  { label: 'PDF', href: '/downloads/hoken-minaoshi-checklist.pdf', icon: FileText },
];
const FLOW = [
  { h: '保険の一覧表', s: '入っている保険を全部書き出す', href: '/guide/shisan-kanri/hoken-ichiran-excel' },
  { h: 'このチェックリスト', s: '節目と証券の6項目を確かめる', href: null },
  { h: '保険の比較表', s: '見直し案と払う総額を比べる', href: '/guide/shisan-kanri/hoken-hikaku-excel' },
];

export default function Page() {
  const S = DATA.sources as Record<string, { name: string; url: string }>;
  const checked = M.checkedAt.split('-').join('/');
  const src = (keys: string[]) => [...new Set(keys)].map((k, i) => (
    <span key={k}>{i > 0 && '・'}<a href={S[k].url} target="_blank" rel="noopener noreferrer" className={A}>{S[k].name}</a></span>
  ));
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
            <h1 id="top" className="text-[28px] font-black leading-tight text-slate-900">生命保険の<br /><span className="text-orange-600">見直しチェックリスト</span></h1>
          </div>
          <div className="flex flex-col gap-3 rounded-2xl border-2 border-sky-200 bg-white p-4">
            <p className="text-[15px] font-black text-slate-900">印刷して使うチェックリスト<span className="ml-1.5 text-[12px] font-bold text-sky-700">無料</span></p>
            <div className="flex gap-2">
              {FILES.map(({ label, href, icon: FI }) => (
                <a key={href} href={href} download className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-sky-700 px-3 py-3 text-[15px] font-bold text-white hover:bg-sky-800">
                  <FI size={18} aria-hidden="true" />{label}<Download size={16} aria-hidden="true" />
                </a>
              ))}
            </div>
            <p className="text-[11px] text-slate-500">登録やメールアドレスの入力は要りません。エクセルは更新の年が自動で出ます</p>
          </div>
          <HokenMinaoshiCheck lpId={LP_ID} />
          <HokenSoudanBox lpId={LP_ID} position="hero" lead="見直しどきなら、無料でプロに相談する" points={POINTS_BOX} />
        </section>

        <section className={SECTION} aria-labelledby="koteki">
          <h2 id="koteki" className={H2}>先に確かめる公的な保障</h2>
          <ul className="grid gap-2">
            {M.kouteki.map((k, i) => {
              const I = KOUTEKI_ICONS[i] ?? HeartPulse;
              return (
                <li key={k.h} className="flex items-start gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-slate-200">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-700"><I size={20} aria-hidden="true" /></span>
                  <span className="flex flex-col"><span className="text-[15px] font-black text-slate-900">{k.h}</span><span className="text-[13px] text-slate-600">{k.d}</span></span>
                </li>
              );
            })}
          </ul>
          <p className="text-[14px] text-slate-700">公的な保障で足りない分を、保険で備えるかを考えます。</p>
          <p className={SRC}>出典：{src(M.kouteki.map((k) => k.src))}（{checked} 確認）</p>
        </section>

        <section className={SECTION} aria-labelledby="maeni">
          <h2 id="maeni" className={H2}>見直す前の注意</h2>
          <ul className="grid gap-2">
            {M.maeni.map((t) => (
              <li key={t.h} className="flex items-start gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-orange-200">
                <AlertTriangle size={20} className="mt-0.5 shrink-0 text-orange-600" aria-hidden="true" />
                <span className="flex flex-col"><span className="text-[15px] font-black text-slate-900">{t.h}</span><span className="text-[13px] text-slate-600">{t.d}</span></span>
              </li>
            ))}
          </ul>
          <p className={SRC}>出典：{src(M.maeni.map((t) => t.src))}（{checked} 確認）</p>
        </section>

        <section className={SECTION} aria-labelledby="houhou">
          <h2 id="houhou" className={H2}>見直しの5つの方法</h2>
          <ol className="grid grid-cols-2 gap-2">
            {DATA.hikaku.houhou.map((h, i) => (
              <li key={h.h} className={`flex flex-col gap-1 rounded-2xl bg-white p-3 ring-1 ring-slate-200 ${i === 0 ? 'col-span-2' : ''}`}>
                <span className="flex items-center gap-2 text-[14px] font-black text-slate-900"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-700 text-[12px] text-white">{i + 1}</span>{h.h}</span>
                <span className="text-[12px] text-slate-600">{h.d}</span>
              </li>
            ))}
          </ol>
          <p className={SRC}>出典：{src(['jiliMinaoshi', 'jiliHenkou'])}</p>
        </section>

        <section className={SECTION} aria-labelledby="junban">
          <h2 id="junban" className={H2}>3枚の表の使う順</h2>
          <ol className="grid gap-2">
            {FLOW.map((f, i) => {
              const inner = (
                <>
                  <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[13px] font-black ${f.href ? 'bg-sky-700 text-white' : 'bg-orange-600 text-white'}`}>{i + 1}</span>
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
          <Link href="/guide/shisan-kanri/hoken-shoken-mikata" className="flex items-center gap-2 text-[13px] font-bold text-sky-700 underline underline-offset-2">保険証券の欄の意味と書き写し表<ArrowRight size={14} aria-hidden="true" /></Link>
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
        <p className="text-[11px] leading-relaxed text-slate-400">チェックリストは見直しの前に確かめるための参考の形です。保障の中身と更新の日は、保険会社の書面で確かめてください。最終更新：2026年11月10日</p>
      </main>
      <LpFooter />
    </div>
  );
}
