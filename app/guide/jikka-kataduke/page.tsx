import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import SiteFooter from '@/components/SiteFooter';

export const metadata: Metadata = {
  title: '実家片付け｜役立ち情報一覧',
  description:
    '親が亡くなった後の実家片付けに関する役立ち情報の一覧ページです。何から始めるか、捨ててはいけないもの、進め方などを整理しています。',
};

const articles = [
  {
    title: '親が亡くなった実家の片付けは何から？先に分けるもの・捨てないもの・進め方',
    description:
      '実家の片付けで最初にやること、捨ててはいけないもの、自分でやるか業者に頼むかの判断基準を整理します。',
    href: '/guide/jikka-kataduke/nanikara-a001',
    label: '実家片付け',
  },
];

function BrandHeader() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 sm:py-5">
        <Link href="/" className="flex items-center">
          <Image
            src="/images/tsuginote-logo.png"
            alt="つぎの手ナビ"
            width={754}
            height={201}
            priority
            className="h-12 w-auto sm:h-14"
          />
        </Link>
      </div>
    </header>
  );
}

export default function JikkaKatadukeGuideIndexPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <BrandHeader />

      <div className="mx-auto max-w-5xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
        <nav className="text-sm text-slate-500">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href="/" className="hover:text-slate-700 hover:underline">
                ホーム
              </Link>
            </li>
            <li>/</li>
            <li>
              <Link href="/guide" className="hover:text-slate-700 hover:underline">
                役立ち情報
              </Link>
            </li>
            <li>/</li>
            <li className="text-slate-700">実家片付け</li>
          </ol>
        </nav>

        <header className="mt-6 rounded-3xl bg-white p-6 ring-1 ring-slate-200 sm:p-8">
          <div className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            役立ち情報｜実家片付け
          </div>

          <h1 className="mt-4 text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">
            実家片付け
            <br className="hidden sm:block" />
            役立ち情報一覧
          </h1>

          <p className="mt-5 max-w-3xl text-base leading-8 text-slate-700">
            親が亡くなった後の実家片付けで、何から始めればよいか、
            どの書類や物を先に残すべきか、自分で進めるか業者に頼むかなど、
            実務で迷いやすいポイントを整理しています。
          </p>
        </header>

        <section className="mt-8">
          <h2 className="text-2xl font-bold text-slate-900">記事一覧</h2>

          <div className="mt-6 grid gap-6">
            {articles.map((article) => (
              <Link
                key={article.href}
                href={article.href}
                className="rounded-3xl bg-white p-6 ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:bg-slate-50"
              >
                <div className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                  {article.label}
                </div>
                <h3 className="mt-4 text-xl font-bold leading-tight text-slate-900">
                  {article.title}
                </h3>
                <p className="mt-4 text-[15px] leading-8 text-slate-700">
                  {article.description}
                </p>
                <p className="mt-5 text-sm font-semibold text-slate-600">
                  記事を読む →
                </p>
              </Link>
            ))}
          </div>
        </section>
      </div>

      <SiteFooter />
    </main>
  );
}