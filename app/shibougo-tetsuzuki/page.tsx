import Image from "next/image";
import Link from "next/link";
import SiteFooter from "@/components/SiteFooter";
import AffiliateCtaBox from "@/components/AffiliateCtaBox";

const concerns = [
  "家族が亡くなった後、何から進めればよいか分からない",
  "役所や年金、保険の手続きの順番を知りたい",
  "期限のある届け出を漏れなく確認したい",
  "葬儀や連絡、必要書類の準備をどう進めるか不安",
];

const immediateSteps = [
  {
    title: "1. まずはご逝去直後に必要な連絡を整理する",
    body: "ご親族への連絡、葬儀社や搬送先の確認、医師から死亡診断書を受け取る流れなど、最初に必要な対応を落ち着いて整理します。短時間で判断が重なる場面なので、誰に何を確認するかを先に決めておくと進めやすくなります。",
  },
  {
    title: "2. 役所で必要になる手続きを確認する",
    body: "死亡届の提出、健康保険証や介護保険証の返却、世帯主変更など、市区町村で確認が必要な手続きがあります。自治体によって窓口や必要書類が異なるため、早めに確認しておくと動きやすくなります。",
  },
  {
    title: "3. 年金・勤務先・金融機関まわりを整理する",
    body: "年金受給停止、勤務先への連絡、銀行口座やクレジットカード、公共料金の名義確認など、生活に関わる情報も順番に整理していきます。後回しにすると見落としが増えやすいため、一覧で把握しておくことが大切です。",
  },
  {
    title: "4. その後の相続や名義変更の入口を確認する",
    body: "死亡後の手続きが落ち着いたあと、相続人の確認、財産や借金の把握、名義変更、相続放棄の検討が必要になる場合があります。今の時点で全て判断できなくても、次に何を見ればよいかを知っておくと安心です。",
  },
];

const deadlineItems = [
  "死亡届は原則7日以内の提出が必要です。",
  "健康保険・介護保険・年金などは、確認時期が遅れると返却や手続きの負担が増えることがあります。",
  "相続放棄を検討する場合は、相続開始を知ってから3か月以内がひとつの重要な目安です。",
];

const avoidMistakes = [
  "必要書類をそろえる前に、あちこちへ個別に連絡してしまう",
  "借金や契約の有無を確認しないまま、相続の判断を進めてしまう",
  "役所の手続きが終われば大丈夫と思い込み、その後の名義変更や相続確認を後回しにしてしまう",
];

export default function ShibougoTetsuzukiPage() {
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
              <p className="inline-flex rounded-full bg-amber-50 px-4 py-1.5 text-sm font-semibold text-amber-700">
                死亡後手続きの案内
              </p>

              <h1 className="mt-5 text-[2.2rem] font-bold leading-[1.15] tracking-tight text-slate-900 sm:text-5xl">
                亡くなった後の手続きを順番で整理する
              </h1>

              <p className="mt-5 text-base leading-8 text-slate-600 sm:text-lg">
                ご家族が亡くなった後は、葬儀、役所、年金、保険、名義確認など、短い期間で確認すべきことが重なります。
                まずは慌てず、何を先に進めるべきかを順番で整理していきましょう。
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
  title="まず何から進めるべきか、相談先を確認できます"
  description="ご家族が亡くなった直後は、葬儀、連絡、必要書類の確認など、短時間で決めることが重なります。今の状況に近い相談先や手配先を先に確認しておくと、次の一手が取りやすくなります。"
  buttonText="相談先を確認する"
  href="A8の実リンク"
  lpName="death_procedures"
  position="firstview"
  programName="anshin_sougi"
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
            まず確認したい流れ
          </h2>

          <div className="mt-6 grid gap-4">
            {immediateSteps.map((step) => (
              <div
                key={step.title}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
              >
                <h3 className="text-lg font-semibold text-slate-900">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-4 sm:px-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-semibold text-slate-900">
            期限や見落としに注意したいポイント
          </h2>

          <ul className="mt-6 space-y-4 text-sm leading-7 text-slate-600 sm:text-base">
            {deadlineItems.map((item) => (
              <li key={item}>・{item}</li>
            ))}
          </ul>

          <div className="mt-8 rounded-2xl bg-slate-50 px-5 py-4 text-sm leading-7 text-slate-600 sm:text-base">
            死亡後手続きのあとに、相続放棄や相続手続きの検討が必要になる場合があります。
            今の段階では全てを決めきれなくても、次に確認すべきテーマを把握しておくことが大切です。
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
            まずは現時点で分かっている情報を整理し、期限がありそうなものから順に確認していくと、負担を減らしやすくなります。
            迷う部分は、早めに相談先を確認しておくのもひとつの方法です。
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-4 sm:px-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-semibold text-slate-900">
            相談先とあわせて確認しておきたいこと
          </h2>
          <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
            まずは葬儀や直後の対応を整理し、そのうえで住まいや遺品整理まで見据えて確認しておくと、その後の負担を減らしやすくなります。
          </p>

          <div className="mt-6 grid gap-6">
            <AffiliateCtaBox
              title="まず何から進めるべきか、相談先を確認できます"
              description="ご家族が亡くなった直後は、葬儀、連絡、必要書類の確認など、短時間で決めることが重なります。今の状況に近い相談先や手配先を先に確認しておくと、次の一手が取りやすくなります。"
              buttonText="相談先を確認する"
              href="A8_LINK_安心葬儀_または_よりそうお葬式"
              lpName="death_procedures"
              position="bottom"
              programName="anshin_sougi"
            />

            <AffiliateCtaBox
              title="手続きとあわせて、遺品整理の進め方も確認しておきたい方へ"
              description="死亡後の対応は、葬儀だけで終わりません。住まいの片付けや遺品整理まで見据えて、無理のない進め方を考えておくと、その後の負担を減らしやすくなります。"
              buttonText="遺品整理の相談先を見る"
              href="A8_LINK_遺品整理110番_または_みんなの遺品整理"
              lpName="death_procedures"
              position="bottom"
              programName="ihinseiri_110"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-4 sm:px-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-semibold text-slate-900">
            次に見たいテーマ
          </h2>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/souzoku-tetsuzuki"
              className="inline-flex min-h-14 items-center justify-center rounded-2xl border border-slate-300 bg-white px-6 py-3 text-base font-semibold text-slate-900 transition hover:bg-slate-50"
            >
              相続の手続きを確認する
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