import type { Metadata } from 'next';
import Link from 'next/link';
import HenshuNote from '@/components/guide/HenshuNote';
import { ArrowRight, Download, FileSpreadsheet, FileText, Info } from 'lucide-react';
import LpHeader from '@/components/lp/LpHeader';
import LpFooter from '@/components/lp/LpFooter';
import LpViewTracker from '@/components/lp/LpViewTracker';
import { SITE_URL, SITE_NAME, ogImageUrl } from '@/components/loan/LoanArticle';
import HokenSoudanBox from '@/components/guide/HokenSoudanBox';
import DanshinGenCalc from '@/components/guide/DanshinGenCalc';
import DATA from '@/lib/hoken/haifu-data.json';

/**
 * 住宅ローンの団信と生命保険の見直し（2026-11-19 作成。docs/seisaku-queue.md の T33）。
 * 受ける言葉：住宅ローン 団信 生命保険 見直し（主）・団信 生命保険 減らす・住宅購入 保険 見直し・団信 死亡保障 いくら。
 *   上位5件（11/19、WebSearch。Chrome につながらず）：1 保険の情報媒体（お金の健康診断）2 みずほ銀行のコラム 3 価格.com 保険
 *   4 オールアバウト（見直し事例）5 三井住友信託銀行のコラム。ほかにリクルートの媒体。
 *   上位が答えている疑問：団信とは何か・団信があれば生命保険は要らないか・減らしてよいのはどの部分か・夫婦で借りたとき・3大疾病付き。
 *   上位に欠けている点：①減らせる額を自分の数字で出す道具がない（文章の例だけ）②「残る住まいのお金（管理費・修繕積立金・固定資産税）」を引く考え方
 *   ③住宅金融支援機構の決まり（死亡・所定の身体障害で以後の返済が不要、入っていなければ相続人が引き継ぐ）を一次情報で示したものがない
 *   ④印刷できるチェックリストがない。
 * 出口：保険見直し本舗（レントラックス 7502、新規の無料面談の完了）。
 */
const LP_ID = 'guide-hoken-danshin';
const VERSION = 'v2-2026-11-28';
const PAGE_PATH = '/guide/shisan-kanri/hoken-minaoshi-danshin';
// v2-2026-11-28：題名と説明文を、表示の出た言葉（住宅購入 保険 見直し 8.0位・住宅ローン 保険 見直し 6.7位・住宅ローン 死亡保険 9.0位。Search Console 11/19〜11/25、表示23・クリック0）と、
//   上位の題名（「住宅ローンを組んだときの保険の見直し」「マイホームを購入したら死亡保険の見直し」）に合わせた。判定 12/12：クリック 週0 → 週2。
const TITLE = '住宅ローンを組んだら保険の見直し｜団信で減らせる死亡保険の計算（無料・エクセル）';
const DESCRIPTION = '家を買って住宅ローンを組んだら、生命保険はどう見直す？団信（団体信用生命保険）に入ったら、死亡保険はいくら減らせるか。見込んでいた住居費と年数を入れると減らせる額の目安が出ます。団信の保障の範囲、夫婦で借りたときの注意、確かめる8つの点を1枚にした無料のチェックリスト（エクセル・PDF）。';

export const metadata: Metadata = {
  title: `${TITLE} | ${SITE_NAME}`,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}${PAGE_PATH}` },
  openGraph: { title: TITLE, description: DESCRIPTION, url: `${SITE_URL}${PAGE_PATH}`, siteName: SITE_NAME, type: 'article', locale: 'ja_JP', images: [{ url: ogImageUrl(TITLE), width: 1200, height: 630, alt: TITLE }] },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, images: [ogImageUrl(TITLE)] },
};

const P = DATA.danshin;
const POINTS_BOX = ['相談は無料', 'この計算と保険証券を見せると、話を進めやすい', 'ローンの書類と家族の保険を並べて、専門の相談員と確かめる'];
const FAQS = [
  { q: '団信に入れば生命保険はいらないですか？', a: '要らなくなるのは、住宅ローンの返済の分だけです。団信で返されるのは団信に入った人のローンで、管理費・固定資産税などの住まいのお金や、教育費・生活費は残ります。必要な保障の額の目安「遺族の支出の見込み − 遺族の収入の見込み」で計算し直します（住宅金融支援機構・生命保険文化センター）。' },
  { q: '団信とは何ですか？', a: '住宅ローンを借りた人が亡くなったり所定の身体障害の状態になったりしたとき、ローンの残りを保険金で返す生命保険です。住宅金融支援機構の新機構団信では、住宅の持分や返済の割合にかかわらず、以後の機構への返済が要らなくなります。' },
  { q: '夫婦で住宅ローンを組んだら、団信はどうなりますか？', a: '団信で返されるのは、団信に入った人のローンです。入っていない人が亡くなっても、その人のローンは残り、相続人が引き継いで返します（住宅金融支援機構）。誰が亡くなったらどのローンがなくなるかを、ローンの書類で確かめます。' },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    { '@type': 'Article', author: { '@type': 'Organization', name: 'つぎの手ナビ 編集部', url: 'https://www.tsuginotenavi.jp/policy#ayamari' }, publisher: { '@id': 'https://www.tsuginotenavi.jp/#organization' }, headline: TITLE, description: DESCRIPTION, inLanguage: 'ja', datePublished: '2026-11-19T09:00:00+09:00', dateModified: '2026-11-28T09:00:00+09:00', mainEntityOfPage: `${SITE_URL}${PAGE_PATH}` },
    { '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: SITE_NAME, item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: '保険・お金の管理', item: `${SITE_URL}/guide/shisan-kanri` },
      { '@type': 'ListItem', position: 3, name: '住宅ローンの団信と生命保険の見直し', item: `${SITE_URL}${PAGE_PATH}` },
    ] },
    { '@type': 'FAQPage', mainEntity: FAQS.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) },
  ],
};

const SECTION = 'flex flex-col gap-5';
const H2 = 'text-[22px] font-black leading-snug text-slate-900';
const SRC = 'text-[11px] leading-relaxed text-slate-500';
const A = 'underline underline-offset-2';
const FILES = [
  { label: 'エクセル', href: '/downloads/hoken-minaoshi-danshin.xlsx', icon: FileSpreadsheet },
  { label: 'PDF', href: '/downloads/hoken-minaoshi-danshin.pdf', icon: FileText },
];
const FLOW = [
  { h: '保険の一覧表', s: '家族の保険を1枚に書き出す', href: '/guide/shisan-kanri/hoken-ichiran-excel' },
  { h: '保険証券の見方', s: '死亡保障の額と期間を確かめる', href: '/guide/shisan-kanri/hoken-shoken-mikata' },
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
            <p className="text-[13px] font-bold text-sky-700">保険の見直し・住宅ローン</p>
            <h1 id="top" className="text-[28px] font-black leading-tight text-slate-900">住宅ローンの団信で<br />生命保険を見直す<br /><span className="text-[20px] text-orange-600">減らせる死亡保障の計算と8つの点</span></h1>
          </div>
          <p className="text-[15px] leading-relaxed text-slate-800">{P.kotae}<span className="text-[11px] text-slate-500">（住宅金融支援機構・生命保険文化センター）</span></p>
          <DanshinGenCalc lpId={LP_ID} />
          <HokenSoudanBox lpId={LP_ID} position="hero" lead="減らせる額の目安が出たら、どの保険をどう減らすかを無料で相談" points={POINTS_BOX} />
          <div className="flex flex-col gap-3 rounded-2xl border-2 border-sky-200 bg-white p-4">
            <p className="text-[15px] font-black text-slate-900">印刷して使うチェックリスト<span className="ml-1.5 text-[12px] font-bold text-sky-700">無料</span></p>
            <div className="flex gap-2">
              {FILES.map(({ label, href, icon: FI }) => (
                <a key={href} href={href} download className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-sky-700 px-3 py-3 text-[15px] font-bold text-white hover:bg-sky-800">
                  <FI size={18} aria-hidden="true" />{label}<Download size={16} aria-hidden="true" />
                </a>
              ))}
            </div>
            <p className="text-[11px] text-slate-500">登録やメールアドレスの入力は要りません。エクセルは数字を入れると減らせる額が出ます</p>
          </div>
        </section>

        <section className={SECTION} aria-labelledby="shikumi">
          <h2 id="shikumi" className={H2}>団信の保障と生命保険の違い</h2>
          <ul className="grid gap-2">
            {P.shikumi.map((k) => (
              <li key={k.h} className="flex flex-col rounded-2xl bg-white p-3.5 ring-1 ring-slate-200">
                <span className="text-[15px] font-black text-slate-900">{k.h}</span>
                <span className="text-[13px] text-slate-600">{k.d}</span>
              </li>
            ))}
          </ul>
          <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200">
            <table className="w-full text-[13px]">
              <thead className="bg-slate-50 text-[12px] text-slate-600"><tr><th className="px-3 py-2 text-left font-bold">亡くなったあとのお金</th><th className="w-[28%] px-3 py-2 text-left font-bold">団信</th><th className="w-[28%] px-3 py-2 text-left font-bold">生命保険</th></tr></thead>
              <tbody>
                {[['団信に入った人の住宅ローンの残り', '返される', '要らない'], ['管理費・修繕積立金・固定資産税', '払われない', '見込む'], ['生活費・教育費', '払われない', '見込む'], ['団信に入っていない人のローン', '残る', '見込む']].map(([a, b, c]) => (
                  <tr key={a} className="border-t border-slate-100 align-top"><td className="px-3 py-2.5 font-bold text-slate-900">{a}</td><td className="px-3 py-2.5 text-slate-800">{b}</td><td className="px-3 py-2.5 text-slate-800">{c}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="flex items-start gap-2.5 rounded-2xl bg-white p-3.5 text-[13px] text-slate-700 ring-1 ring-slate-200"><Info size={18} className="mt-0.5 shrink-0 text-sky-700" aria-hidden="true" />{P.shikumiNote}</p>
          <p className={SRC}>出典：{src(['jhfShinDanshin', 'jhfHonnin', 'jhfDanshinMenu', 'jiliHitsuyo'])}（{checked} 確認）</p>
        </section>

        <section className={SECTION} aria-labelledby="check">
          <h2 id="check" className={H2}>団信に入ったら保険の見直しで確かめる8つの点</h2>
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

        <HokenSoudanBox lpId={LP_ID} position="bottom" lead="チェックが済んだら、ローンと保険を並べて無料の見直し相談" points={POINTS_BOX} beacon />

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
        <p className="text-[11px] leading-relaxed text-slate-400">計算とチェックリストは見直しの前に確かめるための目安です。団信の保障の中身はローンの契約書類で、保険の中身は保険会社の書面で確かめてください。最終更新：2026年11月19日</p>
      </main>
      <LpFooter />
    </div>
  );
}
