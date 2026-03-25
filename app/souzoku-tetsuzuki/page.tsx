import Image from "next/image";
import Link from "next/link";
import SiteFooter from "@/components/SiteFooter";
import AffiliateCtaBox from "@/components/AffiliateCtaBox";

const concerns = [
  "相続の手続きを何から始めればよいか分からない",
  "必要書類や相談先を整理したい",
  "不動産や預貯金の名義変更が気になっている",
  "相続人の確認や遺産分割の進め方に不安がある",
];

const checks = [
  {
    title: "1. まずは財産と負債の全体像を確認する",
    body: "預貯金、不動産、有価証券、保険、車などの資産だけでなく、借入や未払い金などの負債も含めて把握することが大切です。プラスの財産だけを見て進めると、後から判断が難しくなることがあります。",
  },
  {
    title: "2. 相続人が誰になるかを整理する",
    body: "配偶者、子、親、兄弟姉妹など、誰が相続人になるかは家族構成によって変わります。戸籍の確認が必要になる場面も多いため、早めに関係者を整理しておくと、その後の手続きが進めやすくなります。",
  },
  {
    title: "3. 名義変更や解約が必要なものを洗い出す",
    body: "銀行口座、不動産、保険、証券口座、公共料金、スマートフォン契約など、亡くなった方の名義のまま残るものは少なくありません。何を止めるか、何を引き継ぐかを一覧で把握しておくことが重要です。",
  },
  {
    title: "4. 専門家への相談が必要な場面を見極める",
    body: "相続人が多い、不動産がある、相続税が気になる、借金の有無が不安などの場合は、自分だけで進めるよりも、早めに相談先を確認した方が整理しやすいことがあります。",
  },
];

const cautionPoints = [
  "不動産がある場合は、相続登記の確認が必要になることがあります。",
  "銀行や証券会社の手続きは、必要書類や流れが金融機関ごとに異なることがあります。",
  "相続税が関わる可能性がある場合は、早めに税務面も確認しておくと安心です。",
];

const avoidMistakes = [
  "財産の一部だけを見て、全体像を確認しないまま話を進めてしまう",
  "相続人の確認が不十分なまま、遺産分割や名義変更を考え始めてしまう",
  "不動産や税金の論点があるのに、相談を後回しにして手続きが止まってしまう",
];

export default function SouzokuTetsuzukiPage() {
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
                相続手続きの案内
              </p>

              <h1 className="mt-5 text-[2.2rem] font-bold leading-[1.15] tracking-tight text-slate-900 sm:text-5xl">
                相続手続きに必要なことを整理する
              </h1>

              <p className="mt-5 text-base leading-8 text-slate-600 sm:text-lg">
                相続の手続きは、財産の内容、相続人の状況、不動産や税金の有無によって進め方が変わります。
                まずは今の状況で何を確認すべきかを整理し、次の一手を決めやすくしていきましょう。
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

      <section className="mx-auto max-w-5xl px-4 py-4 sm:px-6">
        <AffiliateCtaBox
          title="相続手続きをどこから始めるべきか、相談先を確認できます"
          description="名義変更、必要書類、相続人の確認など、相続手続きはやることが多く、状況によって進め方も変わります。自分のケースで何を優先すべきか迷う場合は、相談先を先に整理しておくと進めやすくなります。"
          buttonText="相続の相談先を確認する"
          href="A8_LINK_相続ナビ_または_終活と相続のまどぐち"
          lpName="inheritance_procedures"
          position="firstview"
          programName="souzoku_navi"
        />
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

          <div className="mt-6 grid gap-4">
            {checks.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
              >
                <h3 className="text-lg font-semibold text-slate-900">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-4 sm:px-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-semibold text-slate-900">
            不動産や税金が関わる場合に注意したいこと
          </h2>

          <ul className="mt-6 space-y-4 text-sm leading-7 text-slate-600 sm:text-base">
            {cautionPoints.map((item) => (
              <li key={item}>・{item}</li>
            ))}
          </ul>

          <div className="mt-8 rounded-2xl bg-slate-50 px-5 py-4 text-sm leading-7 text-slate-600 sm:text-base">
            相続手続きは、単に書類を集めれば終わるとは限りません。財産の内容や家族構成によって、
            先に相談しておいた方が進めやすいケースもあります。
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-4 sm:px-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-semibold text-slate-900">
            慌てて進める前に気をつけたいこと
          </h2>

          <ul className="mt-6 space-y-4 text-sm leading-7 text-slate-600 sm:text-base">
            {avoidMistakes.map((item) => (
              <li key={item}>・{item}</li>
            ))}
          </ul>

          <p className="mt-6 text-sm leading-7 text-slate-600 sm:text-base">
            相続人、財産、不動産、税金の論点を分けて整理していくと、何を先に進めるべきか見えやすくなります。
            判断がつかない部分は、無理に進めず相談先を確認することも大切です。
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-4 sm:px-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-semibold text-slate-900">
            相談先とあわせて確認しておきたいこと
          </h2>
          <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
            まずは相続全体の進め方を整理し、そのうえで税金や空き家の扱いなど、状況に応じて必要な論点を確認していくと進めやすくなります。
          </p>

          <div className="mt-6 grid gap-6">
            <AffiliateCtaBox
              title="相続手続きをどこから始めるべきか、相談先を確認できます"
              description="名義変更、必要書類、相続人の確認など、相続手続きはやることが多く、状況によって進め方も変わります。自分のケースで何を優先すべきか迷う場合は、相談先を先に整理しておくと進めやすくなります。"
              buttonText="相続の相談先を確認する"
              href="A8_LINK_相続ナビ_または_終活と相続のまどぐち"
              lpName="inheritance_procedures"
              position="bottom"
              programName="souzoku_navi"
            />

            <AffiliateCtaBox
              title="税金や不動産の扱いまで気になる方へ"
              description="相続税の対象になるか分からない、実家や空き家をどうするか悩んでいるなど、相続手続きの後半で判断が必要になるテーマもあります。状況に応じた相談先を確認したい方向けの案内です。"
              buttonText="税金・不動産の相談先を見る"
              href="A8_LINK_税理士ドットコム_または_ラクウル_または_ワケガイ"
              lpName="inheritance_procedures"
              position="bottom"
              programName="zeirishi_or_realestate"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-4 sm:px-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-semibold text-slate-900">
            関連して確認したいテーマ
          </h2>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/shibougo-tetsuzuki"
              className="inline-flex min-h-14 items-center justify-center rounded-2xl border border-slate-300 bg-white px-6 py-3 text-base font-semibold text-slate-900 transition hover:bg-slate-50"
            >
              死亡後の手続きを確認する
            </Link>
            <Link
              href="/souzoku-houki"
              className="inline-flex min-h-14 items-center justify-center rounded-2xl border border-slate-300 bg-white px-6 py-3 text-base font-semibold text-slate-900 transition hover:bg-slate-50"
            >
              相続放棄を確認する
            </Link>
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