import Image from "next/image";
import Link from "next/link";
import SiteFooter from "@/components/SiteFooter";
import AffiliateCtaBox from "@/components/AffiliateCtaBox";

const concerns = [
  "借金があるかもしれず不安",
  "相続放棄の期限に間に合うか気になる",
  "どこに相談すればよいか分からない",
  "相続放棄した方がよいのか判断できない",
];

const checks = [
  {
    title: "1. 亡くなってからどのくらい経っているかを確認する",
    body: "相続放棄には、原則として相続の開始を知ってから3か月以内という重要な目安があります。まだ時間があると思っていても、確認や書類収集に時間がかかることがあるため、まず時期を把握することが大切です。",
  },
  {
    title: "2. 借金や負債の可能性があるかを整理する",
    body: "預貯金や不動産だけでなく、借入、未払い金、保証人になっていた可能性なども含めて確認する必要があります。負債の有無が分からないまま判断を先延ばしにすると、対応が難しくなることがあります。",
  },
  {
    title: "3. すでに相続に関する手続きを進めていないか確認する",
    body: "財産を処分したり、相続を前提にした手続きを進めたりすると、相続放棄との関係で慎重な判断が必要になる場合があります。何をどこまで進めたかを整理しておくと相談しやすくなります。",
  },
  {
    title: "4. 相続放棄以外の選択肢も含めて考える",
    body: "状況によっては、単純に放棄すべきかどうかだけでなく、相続人の範囲、財産の内容、他の家族への影響も含めて検討が必要になることがあります。迷う場合は、先に相談先を確認しておく方が安心です。",
  },
];

const cautionPoints = [
  "相続放棄は、期限の確認が特に重要です。",
  "借金があるか分からない場合でも、早めに情報を集めることが大切です。",
  "自分で判断しにくい場合は、相続全体の状況を含めて相談できる先を確認しておくと安心です。",
];

const avoidMistakes = [
  "借金がありそうだと感じながら、確認を後回しにしてしまう",
  "期限がまだ先だと思い込み、必要書類の準備や相談を遅らせてしまう",
  "一部の財産だけを見て、相続放棄すべきかを急いで決めてしまう",
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
                借金や負債の不安がある方に向けて、相続放棄の基本的な考え方と、まず確認したいポイントを整理します。
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

      <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <h2 className="text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">
          こんなお悩みはありませんか
        </h2>

        <ul className="mt-6 space-y-4 text-base leading-8 text-slate-600 sm:text-lg">
          {concerns.map((item) => (
            <li key={item}>・{item}</li>
          ))}
        </ul>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <h2 className="text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">
          まず確認したいこと
        </h2>

        <div className="mt-6 grid gap-4">
          {checks.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
            >
              <h3 className="text-xl font-semibold leading-8 text-slate-900">
                {item.title}
              </h3>
              <p className="mt-3 text-base leading-8 text-slate-600">
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <h2 className="text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">
          期限や判断で注意したいポイント
        </h2>

        <ul className="mt-6 space-y-4 text-base leading-8 text-slate-600">
          {cautionPoints.map((item) => (
            <li key={item}>・{item}</li>
          ))}
        </ul>

        <div className="mt-8 rounded-2xl bg-slate-100 px-5 py-4 text-base leading-8 text-slate-600">
          相続放棄は、借金が確定してから考えるものではなく、負債の可能性がある時点で早めに整理を始める方が安心です。
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <h2 className="text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">
          慌てて進める前に気をつけたいこと
        </h2>

        <ul className="mt-6 space-y-4 text-base leading-8 text-slate-600">
          {avoidMistakes.map((item) => (
            <li key={item}>・{item}</li>
          ))}
        </ul>

        <p className="mt-6 text-base leading-8 text-slate-600">
          相続放棄は、期限、財産、負債、すでに進めた手続きの有無を分けて整理すると、判断しやすくなります。自分だけで決めきれない場合は、相続全体を含めて相談できる先を早めに確認することが大切です。
        </p>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="border-t border-slate-200 pt-8">
          <AffiliateCtaBox
            title="借金や負債対応まで不安がある方へ"
            serviceLead='借金問題や債務整理の相談ができる「アース司法書士事務所」'
            description="相続放棄の判断だけでなく、借金問題そのものへの対応が気になる場合は、法律・手続きの相談先を先に確認しておく方法もあります。自分だけで抱え込まず、「アース司法書士事務所」の内容を確認してみる選択肢もあります。"
            buttonText="詳細を見る"
            href="https://px.a8.net/svt/ejp?a8mat=4AZNCN+AQED5M+4LX2+5YZ77"
            lpName="renunciation"
            position="bottom"
            programName="earth_shihoshoshi_debt"
            summaryItems={[
              {
                label: "サービス名",
                value: "アース司法書士事務所",
              },
              {
                label: "主な相談内容",
                value: "借金問題や債務整理について確認できます。",
              },
            ]}
            operatorName="アース司法書士事務所"
          />
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <h2 className="text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">
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