import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import SiteFooter from '@/components/SiteFooter';

export const metadata: Metadata = {
  title: '遺品整理・実家片付け 役立ち情報一覧 | つぎの手ナビ',
  description:
    '遺品整理、実家片付け、デジタル遺品に関する役立ち情報の一覧ページです。家族が亡くなった後に、スマホ、ネット銀行、サブスク、片付けを何から進めるべきかを整理しています。',
};

const articles = [
  {
    category: 'デジタル遺品',
    title: '親のスマホのパスワードがわからないときは？亡くなった後に最初に確認したいこと',
    description:
      'スマホが開けないときに、契約・支払い・書類・実家片付けまで含めて何を優先して進めるべきかを整理します。',
    href: '/guide/ihinseiri/digitalihin-001',
  },
  {
    category: 'デジタル遺品',
    title: '親のネット銀行がわからないときの相続対応',
    description:
      '通帳が少ない、スマホやアプリ中心で管理していた場合に、口座不明で困ったときの確認ポイントを整理します。',
    href: '/guide/ihinseiri/digitalihin-002',
  },
  {
    category: 'デジタル遺品',
    title: '亡くなった人のサブスクを解約できないときは？',
    description:
      '継続課金の請求が気になるときに、スマホや明細、書類から何を確認するかを整理します。',
    href: '/guide/ihinseiri/digitalihin-003',
  },
  {
    category: 'デジタル遺品',
    title: '遺品のパソコンの捨て方と安全に処分する進め方',
    description:
      '遺品のパソコンをすぐ捨てず、確認したい情報や実家全体の片付けも踏まえて、処分前の進め方を整理します。',
    href: '/guide/ihinseiri/digitalihin-004',
  },
  {
    category: 'デジタル遺品',
    title: '親が亡くなった後のスマホ解約の流れと解約前に確認したいこと',
    description:
      '親のスマホを解約する前に、承継か解約かの考え方や、確認したい契約・支払いの手がかりを整理します。',
    href: '/guide/ihinseiri/digitalihin-005',
  },
  {
    category: 'デジタル遺品',
    title: '亡くなった親のスマホはどう処分する？データ消去できないときの考え方',
    description:
      '初期化やデータ消去ができないときに、すぐ処分せず、契約・写真・連絡先などをどう確認して判断するかを整理します。',
    href: '/guide/ihinseiri/digitalihin-006',
  },
  {
    category: 'デジタル遺品',
    title: '親のスマホは売れる？初期化できないときに売却前に確認したいこと',
    description:
      '売却を急ぐ前に、初期化できない場合の注意点や、契約・データ・家族確認を踏まえた進め方をわかりやすくまとめます。',
    href: '/guide/ihinseiri/digitalihin-007',
  },
  {
    category: 'デジタル遺品',
    title: '故人のスマホを見る方法は？無理に開こうとする前に確認したいこと',
    description:
      '無理にロック解除を急がず、何を確認したいのかを先に整理し、契約・課金・資産確認へつなげる考え方をまとめます。',
    href: '/guide/ihinseiri/digitalihin-008',
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

export default function IhinseiriGuideIndexPage() {
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
            <li className="text-slate-700">遺品整理・実家片付け</li>
          </ol>
        </nav>

        <header className="mt-6 rounded-3xl bg-white p-6 ring-1 ring-slate-200 sm:p-8">
          <div className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            役立ち情報｜遺品整理・実家片付け
          </div>

          <h1 className="mt-4 text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">
            遺品整理・実家片付け
            <br className="hidden sm:block" />
            役立ち情報一覧
          </h1>

          <p className="mt-5 max-w-3xl text-base leading-8 text-slate-700">
            実家の片付け、遺品整理、スマホやパソコン、ネット銀行、サブスクなど、
            ご家族が亡くなった後に確認したい情報をまとめています。
            「何から手をつけるべきか」を整理しやすい順番で確認できます。
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
                  {article.category}
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