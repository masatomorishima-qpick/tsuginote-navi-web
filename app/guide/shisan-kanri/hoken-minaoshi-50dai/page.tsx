import type { Metadata } from 'next';
import Link from 'next/link';
import HenshuNote from '@/components/guide/HenshuNote';
import { ArrowRight, Download, FileSpreadsheet, FileText } from 'lucide-react';
import LpHeader from '@/components/lp/LpHeader';
import LpFooter from '@/components/lp/LpFooter';
import LpViewTracker from '@/components/lp/LpViewTracker';
import { SITE_URL, SITE_NAME, ogImageUrl } from '@/components/loan/LoanArticle';
import HokenSoudanBox from '@/components/guide/HokenSoudanBox';
import IryoJogenCalc from '@/components/guide/IryoJogenCalc';
import DATA from '@/lib/hoken/haifu-data.json';

/**
 * 50代の医療保険の見直しチェックリスト（2026-11-22 作成。docs/seisaku-queue.md の T38）。
 * 受ける言葉：50代 医療保険 見直し（主）・50代 医療保険 見直し チェックリスト・50代 医療保険 必要か。
 *   上位5件（11/22、WebSearch。Chrome につながらず）：1 ほけんのコスパ（保険代理店の媒体、2026/10）2 保険チャンネル（FP 相談の予約サイト、出典が2019年）
 *   3 保険BOOK（保険の情報媒体、2026/9）4 生命保険相談ナビ（比較・相談紹介、2026/8）5 保険のぷろ magazine（相談サービスの媒体、2025/5）。
 *   上位が答えている疑問：50代に医療保険は必要か／がん・生活習慣病への備え／いまの保険の見直し方／更新型・終身型と老後の保険料／
 *   公的な医療費の上限の外の費用（差額ベッド・先進医療）／持病があるときの入り方。
 *   上位に欠けている点：①2026年8月診療分からの高額療養費の新しい上限と年間上限（5件とも7月までの数字か、数字なし）
 *   ②区分と医療費・日額を入れて、窓口の医療費と入院給付金を並べる計算（5件とも計算なし）③印刷できるチェックリスト（エクセル・PDF）
 *   ④厚生労働省の最新の平均在院日数（35〜64歳 20.2日）。
 * 出口：保険見直し本舗（レントラックス 7502、新規の無料面談の完了）。
 */
const LP_ID = 'guide-hoken-50dai';
const VERSION = 'v1-2026-11-22';
const PAGE_PATH = '/guide/shisan-kanri/hoken-minaoshi-50dai';
const TITLE = '50代の医療保険の見直しチェックリスト｜医療費の上限の計算つき（無料）';
const DESCRIPTION = '50代の医療保険の見直しで確かめる9つの点の無料チェックリスト（エクセル・PDF）。2026年8月から上がった高額療養費の上限を区分ごとに計算し、入院給付金の日額と比べられます。更新型の保険料、払い込みの期間、先進医療も。';

export const metadata: Metadata = {
  title: `${TITLE} | ${SITE_NAME}`,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}${PAGE_PATH}` },
  openGraph: { title: TITLE, description: DESCRIPTION, url: `${SITE_URL}${PAGE_PATH}`, siteName: SITE_NAME, type: 'article', locale: 'ja_JP', images: [{ url: ogImageUrl(TITLE), width: 1200, height: 630, alt: TITLE }] },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, images: [ogImageUrl(TITLE)] },
};

const P = DATA.iryo50;
const POINTS_BOX = ['相談は無料', 'この計算とチェックリスト、保険証券を見せると、話を進めやすい', '続けるか、減らすか、足すかを専門の相談員と確かめる'];
const FAQS = [
  { q: '50代に医療保険は必要ですか？', a: '公的な健康保険には1か月の医療費の上限（高額療養費）があり、医療保険はその上で考えます。2026年8月診療分からは、標準報酬月額28万〜50万円の人で 85,800円＋（医療費−286,000円）×1% が上限です（協会けんぽ）。ただし食事代、差額ベッド代など保険外併用療養費の差額部分、先進医療の技術料は上限の外です。上限と上限の外の費用を、貯蓄でまかなえるかで考えます。' },
  { q: '医療保険の更新型と終身型の違いは？', a: '更新型は、一般的に80歳・90歳まで健康状態に関係なく更新できますが、更新のときに保険料を計算し直し、ふつうは更新前より高くなります。終身型は保障が一生涯続き、決まった年齢で払い終える払い方と、一生涯払う払い方があります（生命保険文化センター）。' },
  { q: '高額療養費は2026年8月から何が変わりましたか？', a: '69歳以下の1か月の上限が区分ごとに上がり（例：区分ウは 80,100円＋（医療費−267,000円）×1% から 85,800円＋（医療費−286,000円）×1% へ）、8月から翌年7月までの1年の上限（年間上限）ができました。協会けんぽでは、年間上限の申請は2027年8月からです。2027年8月からは、所得の区分をさらに細かく分ける予定です（厚生労働省）。' },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    { '@type': 'Article', author: { '@type': 'Organization', name: 'つぎの手ナビ 編集部', url: 'https://www.tsuginotenavi.jp/policy#ayamari' }, publisher: { '@id': 'https://www.tsuginotenavi.jp/#organization' }, headline: TITLE, description: DESCRIPTION, inLanguage: 'ja', datePublished: '2026-11-22T09:00:00+09:00', dateModified: '2026-11-22T09:00:00+09:00', mainEntityOfPage: `${SITE_URL}${PAGE_PATH}` },
    { '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: SITE_NAME, item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: '保険・お金の管理', item: `${SITE_URL}/guide/shisan-kanri` },
      { '@type': 'ListItem', position: 3, name: '50代の医療保険の見直しチェックリスト', item: `${SITE_URL}${PAGE_PATH}` },
    ] },
    { '@type': 'FAQPage', mainEntity: FAQS.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) },
  ],
};

const SECTION = 'flex flex-col gap-5';
const H2 = 'text-[22px] font-black leading-snug text-slate-900';
const SRC = 'text-[11px] leading-relaxed text-slate-500';
const A = 'underline underline-offset-2';
const FILES = [
  { label: 'エクセル', href: '/downloads/hoken-minaoshi-50dai.xlsx', icon: FileSpreadsheet },
  { label: 'PDF', href: '/downloads/hoken-minaoshi-50dai.pdf', icon: FileText },
];
const FLOW = [
  { h: '保険証券の見方', s: '入院給付金・手術・特約の欄を読む', href: '/guide/shisan-kanri/hoken-shoken-mikata' },
  { h: '保険の一覧表', s: '入っている保険を1枚に書き出す', href: '/guide/shisan-kanri/hoken-ichiran-excel' },
  { h: '保険の比較表', s: 'いまの保険と見直し案の総額を並べる', href: '/guide/shisan-kanri/hoken-hikaku-excel' },
];
const yen = (n: number) => `${n.toLocaleString('ja-JP')}円`;
const shiki = (k: { base: number; thr: number }) => (k.thr === 0 ? yen(k.base) : `${yen(k.base)}＋（医療費−${yen(k.thr)}）×1%`);

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
            <p className="text-[13px] font-bold text-sky-700">保険の見直し・医療保険</p>
            <h1 id="top" className="text-[28px] font-black leading-tight text-slate-900">50代の医療保険の<br />見直しチェックリスト<br /><span className="text-[18px] text-orange-600">医療費の上限と入院日額を比べる9つの点</span></h1>
          </div>
          <p className="text-[15px] leading-relaxed text-slate-800">{P.kotae}<span className="text-[11px] text-slate-500">（{P.kotaeSrc}）</span></p>
          <IryoJogenCalc lpId={LP_ID} />
          <HokenSoudanBox lpId={LP_ID} position="hero" lead="日額が多すぎる・足りないと見えたら、この計算と証券を見せて無料で相談" points={POINTS_BOX} />
          <div className="flex flex-col gap-3 rounded-2xl border-2 border-sky-200 bg-white p-4">
            <p className="text-[15px] font-black text-slate-900">印刷して使うチェックリスト<span className="ml-1.5 text-[12px] font-bold text-sky-700">無料</span></p>
            <div className="flex gap-2">
              {FILES.map(({ label, href, icon: FI }) => (
                <a key={href} href={href} download className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-sky-700 px-3 py-3 text-[15px] font-bold text-white hover:bg-sky-800">
                  <FI size={18} aria-hidden="true" />{label}<Download size={16} aria-hidden="true" />
                </a>
              ))}
            </div>
            <p className="text-[11px] text-slate-500">登録やメールアドレスの入力は要りません。エクセルは区分と医療費・日額を入れると、上限と入院給付金が出ます</p>
          </div>
        </section>

        <section className={SECTION} aria-labelledby="check">
          <h2 id="check" className={H2}>50代の医療保険の見直しで確かめる9つの点</h2>
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
          <p className={SRC}>出典：{src(P.check.map((c) => c.src))}（{checked} 確認）。保障の名前と条件は保険会社・商品によって違います</p>
        </section>

        <section className={SECTION} aria-labelledby="jogen">
          <h2 id="jogen" className={H2}>高額療養費の上限（2026年8月診療分から）</h2>
          <div className="overflow-x-auto rounded-2xl bg-white ring-1 ring-slate-200">
            <table className="w-full text-[12px]">
              <thead className="bg-slate-50 text-[11px] text-slate-600"><tr><th className="px-2.5 py-2 text-left font-bold">区分</th><th className="px-2.5 py-2 text-left font-bold">1か月の上限</th><th className="px-2.5 py-2 text-right font-bold">多数回</th><th className="px-2.5 py-2 text-right font-bold">1年</th></tr></thead>
              <tbody>
                {P.kubun.map((k) => (
                  <tr key={k.key} className="border-t border-slate-100 align-top">
                    <td className="px-2.5 py-2.5 text-slate-800"><b>{k.h}</b><br /><span className="text-[11px] text-slate-500">{k.who}</span></td>
                    <td className="px-2.5 py-2.5 font-bold text-orange-700">{shiki(k.new)}<br /><span className="text-[11px] font-normal text-slate-500">7月まで {shiki(k.old)}</span></td>
                    <td className="px-2.5 py-2.5 whitespace-nowrap text-right text-slate-700">{yen(k.tasu)}</td>
                    <td className="px-2.5 py-2.5 whitespace-nowrap text-right text-slate-700">{(k.nen / 10000).toLocaleString('ja-JP')}万円</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ul className="flex flex-col gap-1.5">
            {P.kubunNote.map((t) => <li key={t} className="text-[12px] leading-relaxed text-slate-600">・{t}</li>)}
          </ul>
          <div className="flex items-center gap-4 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
            <p className="shrink-0 text-[32px] font-black leading-none text-sky-800">{P.zaiin.days}<span className="text-[15px]">日</span></p>
            <p className="text-[13px] text-slate-700">{P.zaiin.note}。日額と、1回の入院で支払われる日数の上限を、この日数と見比べます</p>
          </div>
          <p className={SRC}>出典：{src(['kyoukaiKougaku', 'mhlwKougaku', 'mhlwKanjaHeikin'])}（{checked} 確認）。70歳以上は区分と上限が違います</p>
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
          <Link href="/guide/shisan-kanri/hoken-minaoshi-gan" className="flex items-center gap-2 text-[13px] font-bold text-sky-700 underline underline-offset-2">がん保険の見直しチェックリスト（診断給付金・先進医療の費用）<ArrowRight size={14} aria-hidden="true" /></Link>
          <Link href="/guide/shisan-kanri/hoken-minaoshi-teinen" className="flex items-center gap-2 text-[13px] font-bold text-sky-700 underline underline-offset-2">定年退職のときの見直し（健康保険の期限の計算つき）<ArrowRight size={14} aria-hidden="true" /></Link>
        </section>

        <HokenSoudanBox lpId={LP_ID} position="bottom" lead="チェックが済んだら、証券を持って無料の見直し相談" points={POINTS_BOX} beacon />

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
        <p className="text-[11px] leading-relaxed text-slate-400">チェックリストと計算は見直しの前に確かめるための目安です。上限と区分は加入している健康保険で、保障の中身は保険証券・約款と保険会社で確かめてください。最終更新：2026年11月22日</p>
      </main>
      <LpFooter />
    </div>
  );
}
