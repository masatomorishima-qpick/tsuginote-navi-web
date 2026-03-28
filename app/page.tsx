import Image from "next/image";
import Link from "next/link";
import SiteFooter from "@/components/SiteFooter";

const categories = [
  {
    href: "/shibougo-tetsuzuki",
    title: "死亡後の手続き",
    description:
      "役所・年金・保険など、まず何から進めるべきかを整理したい方へ。",
  },
  {
    href: "/souzoku-tetsuzuki",
    title: "相続の手続き",
    description:
      "必要書類、相談先、相続登記など、何から進めるべきか整理したい方へ。",
  },
  {
    href: "/souzoku-houki",
    title: "相続放棄",
    description:
      "借金の不安がある、期限が気になる、どこに相談すればよいか分からない方へ。",
  },
];

export default function Home() {
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
              <p className="inline-flex rounded-full bg-emerald-50 px-4 py-1.5 text-sm font-semibold text-emerald-700">
                相続・手続き・相談先の案内
              </p>

              <h1 className="mt-5 text-[2.2rem] font-bold leading-[1.15] tracking-tight text-slate-900 sm:text-5xl">
                ご家族が亡くなった後の次にやることがわかる
              </h1>

              <p className="mt-5 text-base leading-8 text-slate-600 sm:text-lg">
                相続放棄・相続手続き・死亡後手続きについて、
                今の状況に合わせて必要な手続きや相談先を整理できます。
              </p>

              <div className="mt-6 lg:hidden">
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-slate-200">
                  <Image
                    src="/images/tsuginote-top-main2.png"
                    alt="ご家族で手続きや相談先を整理している様子"
                    fill
                    priority
                    sizes="100vw"
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
                  sizes="50vw"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-3 sm:px-6 sm:pb-4">
        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm sm:px-6">
          <p className="text-sm leading-7 text-slate-600 sm:text-base">
            ご家族の状況によって、必要な対応は変わります。
            まずは今の状況に近いテーマを選んでください。
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-5 sm:px-6 sm:py-8">
        <div className="grid gap-4 md:grid-cols-3">
          {categories.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md"
            >
              <h2 className="text-2xl font-semibold text-slate-900 group-hover:text-slate-800">
                {item.title}
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
                {item.description}
              </p>
              <div className="mt-7 text-sm font-semibold text-emerald-700 sm:text-base">
                詳しく見る →
              </div>
            </Link>
          ))}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}