import type { Metadata } from 'next';
import Link from 'next/link';
import GuideCtaLink from '@/components/guide/GuideCtaLink';
import GuideHeader from '@/components/GuideHeader';
import SiteFooter from '@/components/SiteFooter';

const SITE_URL = 'https://www.tsuginotenavi.jp';
const PAGE_PATH = '/guide/research';
const PAGE_TITLE = 'デジタル遺品に関する意識調査（2026年4月・BlueAdventures調べ）';
const PAGE_DESCRIPTION =
  '大切な方を亡くした経験のある人の60.9%が「デジタル関係で困った経験がある」と回答。最多の困りごとは「スマホ・パソコンのパスワードが分からない」。BlueAdventuresが2026年4月に実施した、デジタル遺品（デジタル資産の引き継ぎ）に関する意識調査の結果をまとめた一次データです。';

export const metadata: Metadata = {
  title: `${PAGE_TITLE} | つぎの手ナビ デジタル資産`,
  description: PAGE_DESCRIPTION,
  alternates: {
    canonical: `${SITE_URL}${PAGE_PATH}`,
  },
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: `${SITE_URL}${PAGE_PATH}`,
    siteName: 'つぎの手ナビ',
    type: 'article',
    locale: 'ja_JP',
  },
  twitter: {
    card: 'summary_large_image',
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
  },
};

const overviewRows = [
  { label: '調査名', value: 'デジタル遺品に関する意識調査' },
  { label: '調査主体', value: 'BlueAdventures（自社調査）' },
  { label: '調査時期', value: '2026年4月' },
  { label: '調査対象', value: '大切な方（ご家族など）を亡くした経験のある方' },
  { label: '有効回答数', value: '約70（設問により69〜75）' },
  { label: '調査方法', value: '調査会社によるインターネットアンケート調査' },
  { label: '表記', value: '2026年 BlueAdventures調べ' },
];

const findings = [
  {
    stat: '60.9%',
    headline: '大切な方を亡くした経験のある人の60.9%が、デジタル関係で困った経験がある',
    body: 'パソコンやスマホ、ネット上の契約・口座・写真など、デジタルに関わる事柄で「困った経験がある」と答えた人は60.9%にのぼりました（2026年 BlueAdventures調べ）。デジタルの引き継ぎは、すでに過半数の家庭が直面している問題です。',
  },
  {
    stat: '第1位',
    headline: '最も多かった困りごとは「スマホ・パソコンのパスワードが分からない」（約3〜4割）',
    body: '具体的な困りごととして最も多く挙がったのは「スマホ・パソコンのパスワードが分からない」で、回答者の約3〜4割を占めました（2026年 BlueAdventures調べ）。本人以外には開けない端末が、引き継ぎの最初の壁になっています。',
  },
  {
    stat: '約70%',
    headline: '約70%が「生前に整理してくれていたら助かった」と回答',
    body: '大切な方を亡くした経験のある人の約70%が、「生前にデジタルの情報を整理してくれていたら助かった」と答えました（2026年 BlueAdventures調べ）。事後の対応より、生前の備えを求める声が多数を占めます。',
  },
  {
    stat: '動機 ≒ 知識×2',
    headline: '行動できない最大の理由は「知識不足」ではなく「面倒・手間」',
    body: 'デジタルの整理を行動に移せない理由として最も多かったのは、やり方が分からない（知識不足）ではなく「面倒・手間」でした。動機不足を理由に挙げた人は、知識不足を挙げた人の約2倍にのぼります（2026年 BlueAdventures調べ）。「教える」より「手間をなくす」設計が求められています。',
  },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Dataset',
      '@id': `${SITE_URL}${PAGE_PATH}#dataset`,
      name: 'デジタル遺品に関する意識調査（2026年4月・BlueAdventures調べ）',
      description: PAGE_DESCRIPTION,
      url: `${SITE_URL}${PAGE_PATH}`,
      inLanguage: 'ja',
      datePublished: '2026-06-14',
      temporalCoverage: '2026-04',
      measurementTechnique: '調査会社によるインターネットアンケート調査',
      variableMeasured: [
        'デジタル関係で困った経験の有無',
        '具体的な困りごとの内容',
        '生前整理への評価',
        '行動できない理由',
      ],
      creator: {
        '@type': 'Organization',
        name: 'BlueAdventures',
        url: 'https://blueadventures.jp/',
      },
      publisher: { '@id': `${SITE_URL}/#organization` },
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'ホーム', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: '役立ちガイド', item: `${SITE_URL}/guide` },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'デジタル遺品に関する意識調査（2026年4月）',
          item: `${SITE_URL}${PAGE_PATH}`,
        },
      ],
    },
  ],
};

export default function ResearchPage() {
  return (
    <main className="bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <GuideHeader />

      <div className="mx-auto max-w-3xl px-5 pb-20 pt-8 sm:px-8">
        <nav className="text-sm text-slate-500">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href="/" className="text-blue-600 hover:underline">
                ホーム
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link href="/guide" className="text-blue-600 hover:underline">
                役立ちガイド
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="text-slate-700">デジタル遺品に関する意識調査（2026年4月）</li>
          </ol>
        </nav>

        <p className="mt-10 text-xs font-medium uppercase tracking-wide text-slate-500">
          調査データ｜2026年 BlueAdventures調べ
        </p>
        <h1 className="mt-3 text-3xl font-semibold leading-tight text-slate-900 sm:text-4xl">
          デジタル遺品に関する意識調査
          <span className="mt-2 block text-lg font-medium text-slate-500 sm:text-xl">
            2026年4月実施・BlueAdventures調べ
          </span>
        </h1>

        <div className="mt-8 space-y-5 text-[15px] leading-8 text-slate-700">
          <p>
            BlueAdventuresは、デジタル遺品（スマホ・パソコンやネット上の契約・口座・写真など、デジタルに関わる資産の引き継ぎ）について意識調査を実施しました。大切な方を亡くした経験のある人の
            <strong>60.9%</strong>
            が「デジタル関係で困った経験がある」と回答し、最も多い困りごとは「スマホ・パソコンのパスワードが分からない」でした。
          </p>
          <p>
            本ページは、その調査結果をまとめた一次データです。出典を明記いただければ、報道・記事・資料での引用は自由に行っていただけます。
          </p>
        </div>

        <section className="mt-14 scroll-mt-24">
          <h2 className="border-b border-slate-200 pb-3 text-xl font-semibold leading-snug text-slate-900 sm:text-2xl">
            調査概要
          </h2>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full border-collapse text-[15px] leading-7">
              <tbody>
                {overviewRows.map((row) => (
                  <tr key={row.label}>
                    <th className="w-36 border border-slate-200 bg-slate-50 px-4 py-3 text-left align-top font-semibold text-slate-900">
                      {row.label}
                    </th>
                    <td className="border border-slate-200 px-4 py-3 align-top text-slate-700">
                      {row.value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-500">
            ※ 有効回答数は設問により異なります（69〜75）。比率は小数第2位を四捨五入しています。
          </p>
        </section>

        <section className="mt-14 scroll-mt-24">
          <h2 className="border-b border-slate-200 pb-3 text-xl font-semibold leading-snug text-slate-900 sm:text-2xl">
            主な調査結果
          </h2>
          <div className="mt-6 space-y-6">
            {findings.map((f) => (
              <div key={f.headline} className="rounded-2xl border border-slate-200 p-6">
                <p className="text-3xl font-bold text-emerald-600">{f.stat}</p>
                <h3 className="mt-2 text-base font-semibold leading-snug text-slate-900">
                  {f.headline}
                </h3>
                <p className="mt-3 text-[15px] leading-8 text-slate-700">{f.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-14 scroll-mt-24">
          <h2 className="border-b border-slate-200 pb-3 text-xl font-semibold leading-snug text-slate-900 sm:text-2xl">
            調査結果から見えること
          </h2>
          <div className="mt-6 space-y-5 text-[15px] leading-8 text-slate-700">
            <p>
              デジタルへの引っ越しが進んだ結果、もしものときに家族が直面する最初の壁は「端末そのものが開かない」ことになりました。一方で、約70%が「生前に整理してくれていたら助かった」と答えているように、事後の対応よりも
              <strong>生前の備え</strong>
              を求める声が多数を占めます。
            </p>
            <p>
              そして、備えが進まない最大の理由は知識不足ではなく「面倒・手間」でした。だからこそ、必要なのは難しい知識を教えることではなく、
              <strong>手間をかけずに「在りか」を残し、もしものときだけ家族へ届く仕組み</strong>
              です。具体的な備え方は、
              <Link href="/guide/column/okane-kanri-kichinto" className="text-blue-600 hover:underline">
                資産の在りかの一覧の作り方
              </Link>
              や
              <Link href="/guide/moshimo-sonae/kyu-nyuin-sonae" className="text-blue-600 hover:underline">
                急な入院に備えて家族に伝えておく情報リスト
              </Link>
              で紹介しています。
            </p>
          </div>
        </section>

        <section className="mt-14 scroll-mt-24">
          <h2 className="border-b border-slate-200 pb-3 text-xl font-semibold leading-snug text-slate-900 sm:text-2xl">
            数値の引用・転載について
          </h2>
          <div className="mt-6 space-y-5 text-[15px] leading-8 text-slate-700">
            <p>
              本調査の数値は、出典を明記いただければ、報道・記事・社内資料などで自由に引用していただけます。出典表記は
              <strong>「2026年 BlueAdventures調べ」</strong>
              としてください。本ページ（
              <Link href={PAGE_PATH} className="text-blue-600 hover:underline">
                {SITE_URL}
                {PAGE_PATH}
              </Link>
              ）へのリンクを添えていただけると、読者が一次情報を確認できます。
            </p>
            <p>取材・データに関するお問い合わせは info@blueadventures.jp までお願いします。</p>
          </div>
        </section>

        <section className="mt-14 rounded-3xl bg-slate-50 p-8 text-center sm:p-10">
          <h2 className="text-xl font-semibold text-slate-900">
            情報の「在りか」を、もしものときだけ届く形で残す
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[15px] leading-8 text-slate-600">
            「つぎの手ナビ
            デジタル資産」は、契約や口座、写真の在りかを、生きている間は誰にも見せず、もしものときだけ選んだ人へ届ける準備ができるサービスです。登録・PDF出力・定期リマインドは無料で使えます。
          </p>
          <div className="mt-6">
            <GuideCtaLink
              href="/signup?next=/digital"
              className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
            >
              無料で始める（新規登録）
            </GuideCtaLink>
          </div>
          <p className="mt-4 text-sm">
            <Link href="/" className="text-blue-600 hover:underline">
              サービスの詳しい紹介を見る &rsaquo;
            </Link>
          </p>
        </section>
      </div>

      <SiteFooter />
    </main>
  );
}
