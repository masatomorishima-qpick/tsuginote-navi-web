import type { Metadata } from 'next';
import Link from 'next/link';
import { Bath, Check, Droplets, Flame, Minus, ShowerHead } from 'lucide-react';
import LpHeader from '@/components/lp/LpHeader';
import LpFooter from '@/components/lp/LpFooter';
import KyutokiNav from '@/components/kyutoki/KyutokiNav';
import LpViewTracker from '@/components/lp/LpViewTracker';
import { SITE_URL, SITE_NAME, ogImageUrl } from '@/components/loan/LoanArticle';
import { HaifuDownload, OyuBox, OyuSticky, PrNote } from '@/components/kyutoki/Haifu';
import DATA from '@/lib/kyutoki/haifu-data.json';

/**
 * お風呂の給湯器（給湯専用・オート・フルオート）の交換（P6、2026-11-06 公開）。docs/kyutoki-seo/schedule.md。
 *   受ける言葉：ふろ給湯器 交換 費用、追い焚き 値段、オート フルオート 価格差、給湯専用 値段 など100語。
 *   出口：お湯が出ない.com だけ。
 * 元：東京ガス「給湯器の選び方」（種類・オートとフルオートの違い・相場）、東京ガスの販売価格（給湯専用とふろ給湯器の差）、
 *   リンナイの希望小売価格（オートとフルオートの差）。
 */
const LP_ID = 'kyutoki-furo';
const VERSION = 'v1-2026-11-06';
const PAGE_PATH = '/kyutoki/furo';
const TITLE = 'お風呂の給湯器の交換費用｜給湯専用・オート・フルオートの違いと値段の差';
const DESCRIPTION = 'お風呂の給湯器（ふろ給湯器）の交換費用の目安。給湯専用・オート・フルオートでできることの違いと、値段の差（東京ガスの販売価格・メーカーの定価）。追いだきが要るか、たし湯が要るかで選べます。';

export const metadata: Metadata = {
  title: `${TITLE} | ${SITE_NAME}`,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}${PAGE_PATH}` },
  openGraph: { title: TITLE, description: DESCRIPTION, url: `${SITE_URL}${PAGE_PATH}`, siteName: SITE_NAME, type: 'article', locale: 'ja_JP', images: [{ url: ogImageUrl(TITLE), width: 1200, height: 630, alt: TITLE }] },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, images: [ogImageUrl(TITLE)] },
};

const P = DATA.prices;
const price = (kind: string, eff: string, place: string, maker: string) => P.find((p) => p.kind === kind && p.eff === eff && p.place === place && p.maker === maker)?.yen ?? 0;
const kyuto = price('給湯専用', '従来型', '壁掛', 'リンナイ');
const auto = price('ふろ給湯器（オート）', '従来型', '壁掛', 'リンナイ');
const teika = (gosu: string, func: string) => DATA.teika.find((t) => t.gosu === gosu && t.func === func)?.yen ?? 0;
const fullDiff = ['16号', '20号', '24号'].map((g) => teika(g, 'フルオート') - teika(g, 'オート'));
const man = (v: number) => `約${(Math.round(v / 1000) / 10).toLocaleString('ja-JP')}万円`;

const FAQS = [
  { q: '給湯専用からオートに替えられますか？', a: '追いだきをするには、浴槽と給湯器をつなぐ配管が要ります。今の浴槽に追いだき用の穴があるかを、見積もりのときに見てもらってください。' },
  { q: 'オートとフルオートは、どちらがいいですか？', a: 'お湯はりと追いだきがあれば十分なら、オートで足ります。お湯が減ったときの自動のたし湯や、追いだきの配管の自動の洗浄がほしいならフルオートです（東京ガス）。' },
  { q: '号数はどう選びますか？', a: '迷ったら今と同じ号数です。家族の人数と、同時にお湯を使う場所の数で選びます。くわしくは号数の選び方のページにあります。' },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    { '@type': 'Article', headline: TITLE, description: DESCRIPTION, inLanguage: 'ja', dateModified: '2026-11-06T09:00:00+09:00', datePublished: '2026-11-06T09:00:00+09:00', mainEntityOfPage: `${SITE_URL}${PAGE_PATH}`, isPartOf: { '@id': `${SITE_URL}/#website` }, publisher: { '@id': `${SITE_URL}/#organization` } },
    { '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: SITE_NAME, item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: '給湯器', item: `${SITE_URL}/kyutoki` },
      { '@type': 'ListItem', position: 3, name: 'お風呂の給湯器の交換', item: `${SITE_URL}${PAGE_PATH}` },
    ] },
    { '@type': 'FAQPage', mainEntity: FAQS.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) },
  ],
};

const SECTION = 'flex flex-col gap-5';
const H2 = 'text-[22px] font-black leading-snug text-slate-900';
const SRC = 'text-[11px] leading-relaxed text-slate-500';
const A = 'underline underline-offset-2';
const POINTS = ['出張料・見積もり・キャンセル料は無料', '最短30分で来てくれる', '工事は10年保証'];

export default function FuroPage() {
  const S = DATA.sources;
  const checked = DATA.checkedAt.split('-').join('/');
  return (
    <div className="flex min-h-screen flex-col bg-[#f6f8fa]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <LpHeader />
      <LpViewTracker lpId={LP_ID} version={VERSION} />
      <main className="mx-auto flex w-full max-w-[520px] flex-1 flex-col gap-14 px-4 pt-4 pb-32 sm:pb-16">
        <div className="-mb-10"><PrNote /></div>
        <section className="flex flex-col gap-5" aria-labelledby="top">
          <div className="flex flex-col gap-2">
            <p className="text-[13px] font-bold text-sky-700">ガス給湯器の交換</p>
            <h1 id="top" className="text-[28px] font-black leading-tight text-slate-900">お風呂の給湯器<br />3つの種類</h1>
          </div>
          <ul className="grid grid-cols-3 gap-2">
            {[
              { icon: ShowerHead, h: '給湯専用', d: 'お湯を出すだけ。お湯はりは手で', v: DATA.souba[0].label },
              { icon: Bath, h: 'オート', d: '自動でお湯はり・追いだき', v: DATA.souba[1].label },
              { icon: Droplets, h: 'フルオート', d: 'たし湯と配管の洗浄も自動', v: `オート＋${man(fullDiff[0])}〜` },
            ].map(({ icon: I, h, d, v }) => (
              <li key={h} className="flex flex-col items-center gap-1.5 rounded-2xl bg-white px-2 py-3 text-center ring-1 ring-slate-200">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-50 text-sky-700"><I size={18} aria-hidden="true" /></span>
                <span className="text-[14px] font-black text-slate-900">{h}</span>
                <span className="text-[10px] leading-snug text-slate-500">{d}</span>
                <span className="text-[13px] font-black leading-tight text-orange-600">{v}</span>
              </li>
            ))}
          </ul>
          <p className={SRC}>
            給湯専用・オートは東京ガスの相場（工事費込み・税込）。フルオートはメーカーの定価どうしの差。出典：
            <a href={S.tgHowto.url} target="_blank" rel="noopener noreferrer" className={A}>{S.tgHowto.name}</a>・
            <a href={S.rinnaiRufe.url} target="_blank" rel="noopener noreferrer" className={A}>{S.rinnaiRufe.name}</a>（{checked} 確認）
          </p>
          <HaifuDownload main="hiyou" others={['gosu']} />
        </section>

        <section className={SECTION} aria-labelledby="chigai">
          <h2 id="chigai" className={H2}>オートとフルオートの違い</h2>
          <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200">
            <table className="w-full text-[14px]">
              <thead>
                <tr className="bg-slate-50 text-[12px] text-slate-600">
                  <th className="px-3 py-2 text-left font-bold">できること</th>
                  <th className="px-2 py-2 font-bold">オート</th>
                  <th className="px-2 py-2 font-bold">フルオート</th>
                </tr>
              </thead>
              <tbody>
                {DATA.furoKinou.map((r) => (
                  <tr key={r.h} className="border-t border-slate-100">
                    <td className="px-3 py-2.5 text-slate-800">{r.h}</td>
                    {[r.auto, r.full].map((ok, i) => (
                      <td key={i} className="px-2 py-2.5 text-center">
                        {ok ? <Check size={18} className="mx-auto text-emerald-600" aria-label="できる" /> : <Minus size={18} className="mx-auto text-slate-300" aria-label="できない" />}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[13px] text-slate-600">{DATA.furoNote}。</p>
          <p className={SRC}>出典：<a href={S.tgHowto.url} target="_blank" rel="noopener noreferrer" className={A}>{S.tgHowto.name}</a>（{checked} 確認）</p>
        </section>

        <section className={SECTION} aria-labelledby="sa">
          <h2 id="sa" className={H2}>値段の差</h2>
          <ul className="grid gap-2">
            <li className="flex items-center gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-slate-200">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-700"><Bath size={20} aria-hidden="true" /></span>
              <span className="flex flex-1 flex-col">
                <span className="text-[15px] font-black text-slate-900">給湯専用 → オート</span>
                <span className="text-[12px] text-slate-600">16号・壁掛け・リンナイ（工事費込み）</span>
              </span>
              <span className="shrink-0 text-[15px] font-black text-orange-600">+{man(auto - kyuto)}</span>
            </li>
            <li className="flex items-center gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-slate-200">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-700"><Droplets size={20} aria-hidden="true" /></span>
              <span className="flex flex-1 flex-col">
                <span className="text-[15px] font-black text-slate-900">オート → フルオート</span>
                <span className="text-[12px] text-slate-600">16・20・24号の定価の差</span>
              </span>
              <span className="shrink-0 text-[15px] font-black text-orange-600">+{man(Math.min(...fullDiff))}〜{man(Math.max(...fullDiff)).replace('約', '')}</span>
            </li>
          </ul>
          <p className={SRC}>
            上は東京ガスの販売価格どうしの差、下はリンナイの希望小売価格どうしの差（実際の販売価格は値引きがあり、店ごとに違う）。出典：
            <a href={S.tgRinnai.url} target="_blank" rel="noopener noreferrer" className={A}>{S.tgRinnai.name}</a>・
            <a href={S.rinnaiRufe.url} target="_blank" rel="noopener noreferrer" className={A}>{S.rinnaiRufe.name}</a>
          </p>
          <p className="flex items-start gap-2 text-[14px] text-slate-700"><Flame size={18} className="mt-0.5 shrink-0 text-sky-700" aria-hidden="true" />床暖房にも使う「暖房付き」は、{DATA.souba[2].label}が目安です。</p>
          <p className="text-[14px] text-slate-700">号数で迷ったら<Link href="/kyutoki/gosu-erabikata" className={`${A} text-sky-800`}>号数の選び方</Link>へ。</p>
          <OyuBox lpId={LP_ID} position="sa" lead="今の型番を伝えて、見積もりを無料で" points={POINTS} />
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
        </section>
        <p className="text-[11px] leading-relaxed text-slate-400">金額は設置の状況で変わります。最終更新：2026年11月6日</p>
        <KyutokiNav current={PAGE_PATH} />
      </main>
      <OyuSticky lpId={LP_ID} />
      <LpFooter />
    </div>
  );
}
