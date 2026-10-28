import type { Metadata } from 'next';
import Link from 'next/link';
import { DotGothic16 } from 'next/font/google';
import GuideHeader from '@/components/GuideHeader';
import SiteFooter from '@/components/SiteFooter';
import { SITE_URL, SITE_NAME, ogImageUrl } from '@/components/loan/LoanArticle';
import OyuDiagnosis from './OyuDiagnosis';

/**
 * 給湯器「お湯が出ない」診断 LP（2026-10-28 新設）。
 *
 * 役割：検索広告（東京・神奈川の「お湯が出ない」系）の着地ページ。
 *   症状と使用年数から「直すか・替えるか」の目安を出し、地域と給湯器の種類に
 *   対応する紹介先（A8）へ1つだけ送客する。凍結・断水・賃貸・ガス臭は送客せずに案内で止める。
 *
 * 判定ロジックと紹介先の設定は lib/kyutoki/diagnosis.ts に集約（PDCAで触るのはそこ）。
 * 本文（目安表・見積もりの確認点・FAQ）はサーバー側でHTMLとして出力する（JS非実行でも読める）。
 */

const PAGE_PATH = '/kyutoki/oyu-ga-denai';
const TITLE = 'お湯が出ない｜給湯器を直すか替えるか、30秒診断';
const DESCRIPTION =
  '給湯器からお湯が出ないときに、症状と使用年数から「修理か交換か」の目安を30秒で診断。凍結・ブレーカー・ガスメーターなど、業者を呼ぶ前に自分で確かめることも案内します。';
const DATE_MODIFIED = '2026-10-28';

const lcdFont = DotGothic16({ weight: '400', subsets: ['latin'], display: 'swap', preload: false });

export const metadata: Metadata = {
  title: `${TITLE} | ${SITE_NAME}`,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}${PAGE_PATH}` },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `${SITE_URL}${PAGE_PATH}`,
    siteName: SITE_NAME,
    type: 'website',
    locale: 'ja_JP',
    images: [{ url: ogImageUrl(TITLE), width: 1200, height: 630, alt: TITLE }],
  },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, images: [ogImageUrl(TITLE)] },
};

const FAQS = [
  {
    q: '寒い朝だけお湯が出ません',
    a: '配管の凍結の可能性があります。気温が上がると自然に解けることが多いです。熱湯をかけると配管が傷むことがあるので避けてください。昼を過ぎても出ない場合は、凍結以外の故障を疑います。',
  },
  {
    q: '賃貸に住んでいます。自分で業者を呼んでいいですか',
    a: '先に管理会社か大家さんへ連絡してください。給湯器は建物の設備なので、多くの場合は管理会社が手配し、費用の負担も契約で決まっています。',
  },
  {
    q: '給湯器は何年で交換するものですか',
    a: '一般に10年前後が交換を考える目安です。メーカーの修理部品は製造終了からおよそ10年で手に入りにくくなるため、10年を過ぎると修理できないことがあります。製造年は本体のラベルで確かめられます。',
  },
  {
    q: 'このページはどうやって紹介先を選んでいますか',
    a: 'お住まいの地域と給湯器の種類に対応している会社だけを表示します。対応する会社がない地域では紹介先を出しません。紹介先から紹介料を受け取りますが、修理か交換かの目安は紹介料と関係なく、症状と使用年数だけで決まります。',
  },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      '@id': `${SITE_URL}${PAGE_PATH}#webpage`,
      url: `${SITE_URL}${PAGE_PATH}`,
      name: TITLE,
      description: DESCRIPTION,
      inLanguage: 'ja',
      dateModified: `${DATE_MODIFIED}T09:00:00+09:00`,
      isPartOf: { '@id': `${SITE_URL}/#website` },
      publisher: { '@id': `${SITE_URL}/#organization` },
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: SITE_NAME, item: `${SITE_URL}/` },
        { '@type': 'ListItem', position: 2, name: 'お湯が出ない診断', item: `${SITE_URL}${PAGE_PATH}` },
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: FAQS.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    },
  ],
};

const h2 = 'text-[21px] font-bold leading-snug text-slate-900';
const p = 'text-[15px] leading-relaxed text-slate-700';

export default function OyuGaDenaiPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <GuideHeader />
      <main className="mx-auto flex w-full max-w-[560px] flex-1 flex-col gap-7 px-4 py-5">
        {/* 広告であることの表示（A8 の条件：ファーストビューに置く） */}
        <p className="text-xs leading-relaxed text-slate-500">
          <span className="mr-1.5 rounded border border-slate-300 px-1.5 text-[11px] tracking-widest">PR</span>
          このページには広告（アフィリエイト）を含みます。紹介先の会社から紹介料を受け取ります。当サイトは修理や工事を行いません。
          <Link href="/policy" className="ml-1 text-sky-800 underline underline-offset-2">中立性ポリシー</Link>
        </p>

        <header className="flex flex-col gap-3.5">
          <h1 className="text-[clamp(26px,7vw,34px)] font-black leading-snug text-slate-900 [text-wrap:balance]">
            お湯が出ない。
            <br />
            まず30秒で、<span className="text-orange-700">直すか・替えるか</span>を見分けましょう。
          </h1>
          <p className="text-slate-600">症状と使用年数を5つ答えるだけ。自分で直せるケースなら、その方法を先にお伝えします。</p>
          <p role="note" className="rounded-lg bg-red-50 px-3 py-2.5 text-sm leading-relaxed text-slate-900">
            <b className="text-red-700">ガスのにおいがするときは診断より先に</b>
            、火やスイッチに触れず窓を開け、契約中のガス会社へ連絡してください。
          </p>
        </header>

        <OyuDiagnosis lcdFontClass={lcdFont.className} />

        <section className="flex flex-col gap-3" aria-labelledby="meyasu">
          <h2 id="meyasu" className={h2}>修理か交換か、使用年数で見る目安</h2>
          <p className={p}>
            給湯器は一般に<b>10年前後</b>が交換を考える目安です。メーカーの修理部品は、製造終了からおよそ10年で手に入りにくくなります。本体のラベルに製造年が書かれています。
          </p>
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="w-full min-w-[420px] border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 text-left text-xs tracking-wide text-slate-500">
                  <th className="border-b border-slate-200 px-3 py-2.5">使用年数</th>
                  <th className="border-b border-slate-200 px-3 py-2.5">考え方</th>
                  <th className="border-b border-slate-200 px-3 py-2.5">見積もりで頼むこと</th>
                </tr>
              </thead>
              <tbody className="align-top">
                <tr><td className="whitespace-nowrap border-b border-slate-200 px-3 py-2.5 font-bold tabular-nums">7年未満</td><td className="border-b border-slate-200 px-3 py-2.5">修理で直ることが多い。保証期間内ならメーカーへ</td><td className="border-b border-slate-200 px-3 py-2.5">修理の見積もり</td></tr>
                <tr><td className="whitespace-nowrap border-b border-slate-200 px-3 py-2.5 font-bold tabular-nums">7〜10年</td><td className="border-b border-slate-200 px-3 py-2.5">修理しても別の部品が続けて傷む時期</td><td className="border-b border-slate-200 px-3 py-2.5">修理と交換の両方の見積もり</td></tr>
                <tr><td className="whitespace-nowrap px-3 py-2.5 font-bold tabular-nums">10年以上</td><td className="px-3 py-2.5">修理部品がないことがある。交換が現実的</td><td className="px-3 py-2.5">交換の見積もり</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="flex flex-col gap-3" aria-labelledby="mitsumori">
          <h2 id="mitsumori" className={h2}>見積もりで必ず確かめる4つ</h2>
          <ul className="grid gap-2.5">
            {[
              ['総額はいくらか', '本体・工事・古い給湯器の処分・リモコンを含めた金額か。「本体○○円〜」だけで決めない。'],
              ['追加費用が出る条件', '配管の延長や部品の追加で金額が変わるのはどんな時か、上限はいくらか。'],
              ['保証は何年で、何が対象か', '本体の保証と工事の保証は別のことが多い。'],
              ['号数は今と同じか', '20号や24号は、水温＋25℃のお湯を1分間に何リットル出せるかの数字。家族の人数に合わない号数をすすめられたら理由を聞く。'],
            ].map(([t, d]) => (
              <li key={t} className="rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-[15px] text-slate-700">
                <b className="block text-slate-900">{t}</b>
                {d}
              </li>
            ))}
          </ul>
        </section>

        <section className="flex flex-col" aria-labelledby="faq">
          <h2 id="faq" className={`${h2} mb-1`}>よくある質問</h2>
          {FAQS.map((f) => (
            <details key={f.q} className="border-b border-slate-200 py-3">
              <summary className="cursor-pointer font-bold text-slate-900">{f.q}</summary>
              <p className={`${p} mt-2`}>{f.a}</p>
            </details>
          ))}
        </section>

        <p className="text-xs leading-relaxed text-slate-500">
          診断は一般的な目安で、故障の原因を特定するものではありません。対応時間や料金などの各社の情報は、各社の公表内容によります。最終更新：2026年10月28日
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
