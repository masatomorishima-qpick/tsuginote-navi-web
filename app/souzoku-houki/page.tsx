import Image from "next/image";
import Link from "next/link";
import SiteFooter from "@/components/SiteFooter";

const concerns = [
  "借金があるかもしれず不安",
  "相続放棄の期限に間に合うか気になる",
  "どこに相談すればよいか分からない",
];

const checks = [
  "亡くなってからどのくらい経っているか",
  "借金や負債の可能性があるか",
  "すでに相続に関する手続きを進めていないか",
];

export default function SouzokuHoukiPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
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

      <section className="mx-auto max-w-6xl px-4 pb-8 pt-8 sm:px-6 sm:pb-10 sm:pt-10">
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="grid lg:grid-cols-2">
            <div className="px-5 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
              <p className="inline-flex rounded-full bg-rose-50 px-4 py-1.5 text-sm font-semibold text-rose-700">
                相続放棄の案内
              </p>

              <h1 className="mt-5 text-[2.2rem] font-bold leading-[1.15] tracking-tight text-slate-900 sm:text-5xl">
                相続放棄の期限や
                <br />
                相談先を整理する
              </h1>

              <p className="mt-5 text-base leading-8 text-slate-600 sm:text-lg">
                借金や負債の不安がある方に向けて、
                相続放棄の基本的な考え方と、まず確認したいポイントを整理します。
              </p>

              <div className="mt-6 lg:hidden">
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-slate-200">
                  <Image
                    src="/images/tsuginote-top-main2.png"
                    alt="ご家族で手続きや相談先を整理している様子"
                    fill
                    priority
                    className="object-cover"
                  />
                </div>
              </div>
            </div>

            <div className="hidden border-l border-slate-200 lg:block">
              <div className="relative h-full min-h-[460px] w-full">
                <Image
                  src="/images/tsuginote-top-main2.png"
                  alt="ご家族で手続きや相談先を整理している様子"
                  fill
                  priority
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-4 sm:px-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-semibold text-slate-900">
            こんなお悩みはありませんか
          </h2>
          <ul className="mt-6 space-y-4 text-sm leading-7 text-slate-600 sm:text-base">
            {concerns.map((item) => (
              <li key={item}>・{item}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-4 sm:px-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-semibold text-slate-900">
            まず確認したいこと
          </h2>
          <ul className="mt-6 space-y-4 text-sm leading-7 text-slate-600 sm:text-base">
            {checks.map((item) => (
              <li key={item}>・{item}</li>
            ))}
          </ul>

          <div className="mt-8 rounded-2xl bg-slate-50 px-5 py-4 text-sm leading-7 text-slate-600 sm:text-base">
            相続放棄には期限があるため、迷っている場合は早めに専門家へ相談する方が安心です。
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-4 sm:px-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-semibold text-slate-900">
            相談先の目安
          </h2>
          <p className="mt-5 text-sm leading-7 text-slate-600 sm:text-base">
            期限や借金の有無が気になる場合は、相続放棄に対応している弁護士や司法書士への相談が候補になります。
          </p>

          <div className="mt-8">
            <h3 className="text-lg font-semibold text-slate-900">
              関連して確認したいテーマ
            </h3>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/shibougo-tetsuzuki"
                className="inline-flex min-h-14 items-center justify-center rounded-2xl border border-slate-300 bg-white px-6 py-3 text-base font-semibold text-slate-900 transition hover:bg-slate-50"
              >
                死亡後の手続きを確認する
              </Link>

              <Link
                href="/souzoku-tetsuzuki"
                className="inline-flex min-h-14 items-center justify-center rounded-2xl border border-slate-300 bg-white px-6 py-3 text-base font-semibold text-slate-900 transition hover:bg-slate-50"
              >
                相続の手続きを確認する
              </Link>
            </div>

            <div className="mt-3">
              <Link
                href="/"
                className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                トップに戻る
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-8 pt-4 sm:px-6 sm:pb-10">
        <div className="rounded-2xl bg-slate-100 px-5 py-4 text-sm leading-7 text-slate-500 sm:text-base">
          ※ 本ページは一般的な情報整理を目的としています。個別事情によって必要な対応は異なるため、最終判断は専門家へご相談ください。
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}