import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import SiteFooter from '@/components/SiteFooter';

export const metadata: Metadata = {
  title: '役立ち情報｜相続・死亡後手続き・遺品整理のガイド一覧',
  description:
    'つぎの手ナビの役立ち情報ページです。相続、死亡後の手続き、遺品整理、実家片付け、デジタル遺品など、家族が亡くなった後に確認したい情報を整理しています。',
};

const categories = [
  {
    title: '遺品整理・実家片付け',
    description:
      '実家の片付け、遺品整理、スマホやパソコンなどのデジタル遺品まで、何から進めるべきかを整理したい方へ。',
    href: '/guide/ihinseiri',
  },
  {
    title: "実家片付け",
    description:
      "親が亡くなった後の実家の片付けで、何から始めるか、捨ててはいけないもの、自分でやるか業者に頼むかを整理したい方へ。",
    href: "/guide/jikka-kataduke",
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

export default function GuideIndexPage() {
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
            <li className="text-slate-700">役立ち情報</li>
          </ol>
        </nav>

        <header className="mt-6 rounded-3xl bg-white p-6 ring-1 ring-slate-200 sm:p-8">
          <div className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            役立ち情報
          </div>

          <h1 className="mt-4 text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">
            相続・死亡後手続き・遺品整理の
            <br className="hidden sm:block" />
            役立ち情報
          </h1>

          <p className="mt-5 max-w-3xl text-base leading-8 text-slate-700">
            ご家族が亡くなった後に確認したい、相続、死亡後の手続き、遺品整理、
            実家片付け、デジタル遺品などの情報をまとめています。
            「何から始めればよいか分からない」ときに、状況ごとに確認しやすいよう整理しています。
          </p>
        </header>

        <section className="mt-8">
          <h2 className="text-2xl font-bold text-slate-900">カテゴリから探す</h2>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            {categories.map((category) => (
              <Link
                key={category.href}
                href={category.href}
                className="rounded-3xl bg-white p-6 ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:bg-slate-50"
              >
                <h3 className="text-xl font-bold text-slate-900">{category.title}</h3>
                <p className="mt-4 text-[15px] leading-8 text-slate-700">
                  {category.description}
                </p>
                <p className="mt-5 text-sm font-semibold text-slate-600">
                  詳しく見る →
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