import type { Metadata } from 'next';
import Link from 'next/link';
import GuideCtaLink from '@/components/guide/GuideCtaLink';
import GuideHeader from '@/components/GuideHeader';
import SiteFooter from '@/components/SiteFooter';

const SITE_URL = 'https://www.tsuginotenavi.jp';

export const metadata: Metadata = {
  title: 'コラム｜デジタル資産との付き合い方を考える読み物 | つぎの手ナビ デジタル資産',
  description:
    'サブスク・ネット銀行・スマホの写真——暮らしを支えるデジタルの仕組みに隠れた、知られていない性質を解き明かす読み物。公的機関の事例と数字をもとに、前向きな備え方まで考えます。',
  alternates: { canonical: `${SITE_URL}/guide/column` },
  openGraph: {
    title: 'コラム｜つぎの手ナビ',
    description:
      '暮らしを支えるデジタルの仕組みに隠れた、知られていない性質を解き明かす読み物。',
    url: `${SITE_URL}/guide/column`,
    siteName: 'つぎの手ナビ',
    type: 'website',
    locale: 'ja_JP',
  },
};

const articles = [
  {
    href: '/guide/column/pet-omoide-5shukan',
    category: 'ペットの思い出を残す',
    title: 'ペットの思い出を一生ものにする5つの習慣',
    description:
      'スマホに何百枚——私たちは史上いちばんペットを撮っている飼い主かもしれません。でも「撮る」と「残る」は別の話。共有・二重保管・フォトブック・鳴き声の記録、そして見落とされがちな「鍵の引き継ぎ」まで、思い出を一生ものにする5つの習慣。',
  },
  {
    href: '/guide/column/sumaho-shuyaku-5sen',
    category: '時代の変化の答え合わせ',
    title: 'この5年で、スマホ1台に集約された機能5選',
    description:
      'お金、きっぷ、診察券、身分証、そして家の鍵まで。この5年でスマホ1台に集まった5つの機能を公的な数字で振り返り、便利さの裏で「家族が代わりに開けられなくなった」という変化を解き明かします。',
  },
  {
    href: '/guide/column/kodomo-omoide-5shukan',
    category: '子どもの思い出を残す',
    title: '子どもの思い出を一生ものにする5つの習慣',
    description:
      'スマホに何千枚——私たちは人類史上いちばん子どもを撮っている親です。でも「撮る」と「残る」は別の話。共有・二重保管・フォトブック・声の記録、そして見落とされがちな「鍵の引き継ぎ」まで、思い出を一生ものにする5つの習慣。',
  },
  {
    href: '/guide/column/saifu-hikidashi-5sen',
    category: '時代の変化の答え合わせ',
    title: 'この5年で、財布と引き出しから消えたもの5選',
    description:
      '現金、ポイントカード、通帳、印鑑、アルバム。消えた5つには共通点があります——全部、あなたにしか開けられない場所へ引っ越しただけ。公的な数字で振り返る大変化の話。',
  },
  {
    href: '/guide/column/okane-kanri-kichinto',
    category: 'お金の管理の死角',
    title: 'お金の管理がきちんとしている人ほど、家族を困らせてしまう3つの理由',
    description:
      'ネット銀行・NISA・ペーパーレス——正しい管理ほど、家族からは「見えない資産」になる。きちんとしている人だけに起きる副作用と、金額もパスワードも書かない「どこに何があるかの一覧」を残す備え方。',
  },
  {
    href: '/guide/column/subsuku-kaiyaku-riyu',
    category: 'サブスクの仕組み',
    title: 'サブスクは全部、死ぬまでに解約しておかなければならない3つの理由',
    description:
      '契約した本人にしか止められない——サブスクという仕組みの、ほとんどの人が知らない性質を、国民生活センターの実例と公的な数字から解き明かします。',
  },
];

export default function ColumnIndexPage() {
  return (
    <main className="bg-white">
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
            <li className="text-slate-700">コラム</li>
          </ol>
        </nav>

        <h1 className="mt-10 text-center text-3xl font-semibold leading-tight text-slate-900 sm:text-4xl">
          コラム
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-center text-base leading-8 text-slate-600">
          サブスク・ネット銀行・スマホの写真——暮らしを支えるデジタルの仕組みに隠れた、知られていない性質を解き明かす読み物です。公的機関の事例と数字をもとに、前向きな備え方まで考えます。
        </p>

        <section className="mt-14">
          <h2 className="border-b border-slate-200 pb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
            記事一覧
          </h2>
          <ul className="divide-y divide-slate-200">
            {articles.map((article) => (
              <li key={article.href} className="py-7">
                <p className="text-xs font-medium text-slate-500">{article.category}</p>
                <h3 className="mt-2 text-lg font-semibold leading-snug sm:text-xl">
                  <Link href={article.href} className="text-blue-600 hover:underline">
                    {article.title}
                  </Link>
                </h3>
                <p className="mt-3 text-[15px] leading-7 text-slate-600">{article.description}</p>
                <p className="mt-3">
                  <Link
                    href={article.href}
                    className="text-sm font-medium text-blue-600 hover:underline"
                  >
                    記事を読む &rsaquo;
                  </Link>
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-12">
          <h2 className="border-b border-slate-200 pb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
            デジタル資産の基本
          </h2>
          <p className="mt-5 text-[15px] leading-8 text-slate-700">
            デジタル資産の種類や、整理・引き継ぎの全体像は
            <Link href="/guide/digital-shisan" className="text-blue-600 hover:underline">
              デジタル資産の整理と引き継ぎ
            </Link>
            にまとめています。各テーマの入口としてもどうぞ。
          </p>
        </section>

        <section className="mt-12">
          <h2 className="border-b border-slate-200 pb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
            関連ガイド
          </h2>
          <p className="mt-5 text-[15px] leading-8 text-slate-700">
            具体的な整理の手順は
            <Link href="/guide/digital-seiri" className="text-blue-600 hover:underline">
              デジタル整理術ガイド
            </Link>
            、もしものときへの備えは
            <Link href="/guide/moshimo-sonae" className="text-blue-600 hover:underline">
              もしもの備えガイド
            </Link>
            もあわせてどうぞ。
          </p>
        </section>

        <section className="mt-16 rounded-3xl bg-slate-50 p-8 text-center sm:p-10">
          <h2 className="text-xl font-semibold text-slate-900">
            情報の「在りか」を、もしものときに届く形で残す
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[15px] leading-8 text-slate-600">
            あなたにもしもがあったとき、家族が「どこに何があるか」にたどり着けるように。「つぎの手ナビ デジタル資産」は、パスワードや口座・契約・写真の在りかを、生きている間は誰にも見せず、もしものときだけ選んだ人へ届ける準備ができるサービスです。登録・PDF出力・定期リマインドは無料。あなたにできる、いちばんやさしい準備です。
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
