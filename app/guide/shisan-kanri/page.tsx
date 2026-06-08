import type { Metadata } from 'next';
import Link from 'next/link';
import GuideHeader from '@/components/GuideHeader';
import SiteFooter from '@/components/SiteFooter';

const SITE_URL = 'https://www.tsuginotenavi.jp';

export const metadata: Metadata = {
  title: '資産・お金の管理ガイド｜契約・口座・保険の整理と家族の把握 | つぎの手ナビ',
  description:
    '保険契約の一覧化、口座や契約の整理など、家庭のお金まわりを「把握できている状態」にするためのガイド記事一覧。家族がいざというとき困らない整理の仕方まで。',
  alternates: {
    canonical: `${SITE_URL}/guide/shisan-kanri`,
  },
  openGraph: {
    title: '資産・お金の管理ガイド｜つぎの手ナビ',
    description:
      '保険契約の一覧化、口座や契約の整理など、家庭のお金まわりを「把握できている状態」にするためのガイド記事一覧。',
    url: `${SITE_URL}/guide/shisan-kanri`,
    siteName: 'つぎの手ナビ',
    type: 'website',
    locale: 'ja_JP',
  },
};

const articles = [
  {
    href: '/guide/shisan-kanri/toshi-kazoku',
    category: '投資と家族',
    title: '投資、家族に知らせる？知らせない？｜内緒のままで大丈夫か、もしものときどうなるか',
    description:
      'なぜ家族に投資を言わない人が多いのか、知らせる/知らせないの考え方、伝え方のコツ。そして「知らせないまま、もしものとき家族が口座にたどり着けない」問題と備え方まで。',
  },
  {
    href: '/guide/shisan-kanri/hoken-ichiran-excel',
    category: '契約の整理',
    title: '保険契約の一覧表をエクセルで作る方法｜無料テンプレート付き・書く項目はこれだけ',
    description:
      'そのまま使える無料テンプレート付き。書くべき項目と書いてはいけないもの、証券や控除証明書からの拾い方まで解説します。',
  },
];

export default function ShisanKanriIndexPage() {
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
            <li className="text-slate-700">資産・お金の管理</li>
          </ol>
        </nav>

        <h1 className="mt-10 text-center text-3xl font-semibold leading-tight text-slate-900 sm:text-4xl">
          資産・お金の管理ガイド
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-center text-base leading-8 text-slate-600">
          保険・口座・契約など、家庭のお金まわりを「自分で把握できている状態」にするためのガイドです。一覧化・整理の実用的な手順から、家族がいざというとき困らない残し方までを扱います。
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
            関連ガイド
          </h2>
          <p className="mt-5 text-[15px] leading-8 text-slate-700">
            サブスクなど毎月の支払いの整理は
            <Link href="/guide/digital-seiri" className="text-blue-600 hover:underline">
              デジタル整理術ガイド
            </Link>
            、家族との共有の線引きは
            <Link href="/guide/kazoku-kyoyu" className="text-blue-600 hover:underline">
              家族間の情報共有ガイド
            </Link>
            もあわせてどうぞ。
          </p>
        </section>

        <section className="mt-16 rounded-3xl bg-slate-50 p-8 text-center sm:p-10">
          <h2 className="text-xl font-semibold text-slate-900">
            整理した情報の「在りか」を、もしものときに届く形で残す
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[15px] leading-8 text-slate-600">
            「つぎの手ナビ
            デジタル資産」は、整理した情報を、見られたくないものは伏せたまま、もしものときだけ大切な人へ引き継ぐ準備ができるサービスです。資産の登録・PDF出力・定期リマインドは無料で使えます。
          </p>
          <div className="mt-6">
            <Link
              href="/signup?next=/digital"
              className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
            >
              無料で始める（新規登録）
            </Link>
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
