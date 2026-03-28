'use client';

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import SiteFooter from "@/components/SiteFooter";
import AffiliateCtaBox from "@/components/AffiliateCtaBox";

const heroPoints = [
  {
    title: "期限が分かる",
    body: "相続放棄は原則3か月以内です。まず先に、今どのくらい時間が残っているかを確認できます。",
  },
  {
    title: "判断材料が分かる",
    body: "借金、未払い金、保証債務の可能性など、何を確認して判断すべきかを整理できます。",
  },
  {
    title: "相談先が分かる",
    body: "司法書士と弁護士の違いを整理し、自分の状況に合う相談先を選びやすくしています。",
  },
];

const concerns = [
  "借金があるかもしれず不安",
  "相続放棄の期限に間に合うか気になる",
  "どこに相談すればよいか分からない",
  "相続放棄した方がよいのか判断できない",
];

const quickNavItems = [
  {
    label: "まずは流れを知りたい",
    targetId: "flow_overview",
  },
  {
    label: "期限を先に確認したい",
    targetId: "deadline_section",
  },
  {
    label: "何を確認すべきか知りたい",
    targetId: "checks_section",
  },
  {
    label: "相談先を選びたい",
    targetId: "cta_section",
  },
  {
    label: "よくある疑問を見たい",
    targetId: "faq_section",
  },
];

const actionSteps = [
  {
    step: "STEP1",
    title: "亡くなってからどのくらい経っているかを確認する",
    body: "相続放棄は、原則として自分が相続人になったことを知ってから3か月以内に進める必要があります。まずは、いつ亡くなったことを知ったのか、今どのくらい時間があるのかを確認します。",
  },
  {
    step: "STEP2",
    title: "借金超過のおそれがあるかを整理し、放棄するか判断する",
    body: "預貯金や不動産だけでなく、借入、未払い金、保証人になっていた可能性なども含めて確認します。財産より負債が大きいおそれがあるなら、相続放棄を含めて早めに判断することが大切です。",
  },
  {
    step: "STEP3",
    title: "放棄するなら、家庭裁判所での手続き（申述）を準備する",
    body: "法的に借金を免れるためには、被相続人の最後の住所地を管轄する家庭裁判所での手続き（申述）が必要です。手続きを前提に、書類や相談先を早めに整理します。",
  },
];

const checks = [
  {
    title: "1. 亡くなってからどのくらい経っているかを確認する",
    body: "相続放棄には、原則として相続の開始を知ってから3か月以内という重要な期限があります。まだ時間があると思っていても、確認や書類収集に時間がかかることがあるため、まず時期を把握することが大切です。",
  },
  {
    title: "2. 借金や負債の可能性があるかを整理する",
    body: "預貯金や不動産だけでなく、借入、未払い金、保証人になっていた可能性なども含めて確認する必要があります。負債の有無が分からないまま判断を先延ばしにすると、対応が難しくなることがあります。",
  },
  {
    title: "3. すでに相続に関する行動を進めていないか確認する",
    body: "故人の預貯金を引き出して使ってしまったり、未払いの家賃を故人のお金から支払ったりすると、法律上『相続した』とみなされる方向に働くおそれがあります。何をどこまで進めたかを整理してから判断した方が安全です。",
  },
  {
    title: "4. 相続放棄以外の選択肢も含めて考える",
    body: "状況によっては、単純に放棄すべきかどうかだけでなく、相続人の範囲、財産の内容、他の家族への影響も含めて検討が必要になることがあります。迷う場合は、先に相談先を確認しておく方が安心です。",
  },
];

const cautionPoints = [
  "相続放棄は、期限の確認が特に重要です。",
  "借金があるか分からない場合でも、早めに情報を集めることが大切です。",
  "放棄すると決めた場合は、家庭裁判所での手続き（申述）を前提に動く必要があります。",
  "自分で判断しにくい場合は、相続全体の状況を含めて相談できる先を確認しておくと安心です。",
];

const avoidMistakes = [
  "借金がありそうだと感じながら、確認を後回しにしてしまう",
  "期限がまだ先だと思い込み、必要書類の準備や相談を遅らせてしまう",
  "一部の財産だけを見て、相続放棄すべきかを急いで決めてしまう",
  "家庭裁判所での手続きが必要だと知らず、相談だけで止まってしまう",
];

const faqItems = [
  {
    question: "故人の預貯金を少し使ってしまったら、相続放棄はできませんか？",
    answer:
      "故人の預貯金を引き出して使ったり、財産を処分したりすると、相続を承認したとみなされる方向に働くおそれがあります。少額でも自己判断せず、何に使ったのかを整理して早めに専門家へ相談した方が安全です。",
  },
  {
    question: "3か月を過ぎそうです。もう間に合いませんか？",
    answer:
      "借金や財産の調査が終わらず、3か月以内に放棄するか決めきれない場合は、家庭裁判所に期間の延長を申し立てる手続きがあります。時間が足りないと感じた段階で、できるだけ早く相談した方が動きやすくなります。",
  },
  {
    question: "3か月を過ぎてしまったら絶対に無理ですか？",
    answer:
      "一般には厳しいですが、事情によっては相談する意味が残る場合があります。諦める前に、何をいつ知ったのか、どこまで手続きを進めたのかを整理して相談した方がよいです。",
  },
  {
    question: "司法書士と弁護士はどう選べばよいですか？",
    answer:
      "相続放棄の書類準備や手続きの整理を進めたい場合は司法書士が向いています。一方で、債権者から督促が来ている、他の相続人とトラブルがある、期限が過ぎそう・過ぎてしまった事情まで含めて強く相談したい場合は、弁護士の方が合いやすいです。",
  },
];

export default function SouzokuHoukiPage() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const handleFaqToggle = (index: number) => {
    setOpenFaqIndex((prev) => (prev === index ? null : index));
  };

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
          <div className="px-5 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
            <div className="mx-auto max-w-4xl">
              <p className="inline-flex rounded-full bg-rose-50 px-4 py-1.5 text-sm font-semibold text-rose-700">
                相続放棄の案内
              </p>

              <h1 className="mt-5 text-[2.2rem] font-bold leading-[1.15] tracking-tight text-slate-900 sm:text-5xl">
                借金超過のおそれがあれば、
                <br />
                相続放棄するかを判断する
              </h1>

              <div className="mt-6">
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-slate-200">
                  <Image
                    src="/images/tsuginote-top-main2.png"
                    alt="相続放棄の期限や相談先を整理している様子"
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 960px"
                    className="object-cover"
                  />
                </div>
              </div>

              <p className="mt-6 text-base leading-8 text-slate-600 sm:text-lg">
                借金や負債の不安がある場合は、相続放棄するかどうかを早めに判断することが大切です。
                相続放棄をする場合は、家庭裁判所での手続き（申述）まで見据えて動く必要があります。
                このページでは、期限、確認事項、相談先を順番に整理します。
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {heroPoints.map((item) => (
                  <div
                    key={item.title}
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4"
                  >
                    <p className="text-sm font-semibold text-slate-900">
                      {item.title}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {item.body}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-2xl bg-amber-50 px-4 py-4 text-sm leading-7 text-amber-900 sm:text-base">
                <span className="font-semibold">お急ぎの方へ：</span>
                亡くなってから3か月が近い方、借金や保証債務が不安な方は、まず期限と相談先を先にご確認ください。
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-2 sm:px-6">
        <div className="rounded-3xl bg-rose-50 px-5 py-6 sm:px-7 sm:py-7">
          <p className="text-sm font-semibold tracking-[0.08em] text-rose-700">
            クイックナビ
          </p>

          <h2 className="mt-2 text-2xl font-bold leading-[1.4] text-slate-900 sm:text-3xl">
            今の不安に近い項目から確認してください
          </h2>

          <p className="mt-2 text-sm leading-7 text-slate-600 sm:text-base">
            気になる箇所へ移動できます。すべてを一気に読むのが大変な方は、まず今の悩みに近い項目からご確認ください。
          </p>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {quickNavItems.map((item) => (
              <button
                key={item.targetId}
                type="button"
                onClick={() => {
                  const target = document.getElementById(item.targetId);
                  if (target) {
                    target.scrollIntoView({ behavior: "smooth", block: "start" });
                  }
                }}
                className="rounded-2xl border border-white bg-white px-5 py-4 text-left text-base font-semibold leading-7 text-slate-900 transition hover:-translate-y-0.5 hover:border-rose-300 hover:bg-rose-100"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <h2 className="text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">
          こんなお悩みはありませんか
        </h2>

        <ul className="mt-6 space-y-4 text-base leading-8 text-slate-600 sm:text-lg">
          {concerns.map((item) => (
            <li key={item} className="flex gap-3">
              <span className="mt-1 text-rose-600">・</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      <section
        id="flow_overview"
        className="mx-auto max-w-5xl px-4 py-8 sm:px-6"
      >
        <p className="text-sm font-semibold tracking-[0.08em] text-rose-700">
          最短の流れ
        </p>
        <h2 className="mt-2 text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">
          相続放棄でまず押さえたい3ステップ
        </h2>

        <div className="mt-8">
          {actionSteps.map((item, index) => (
            <div key={item.step} className="relative pl-10">
              {index !== actionSteps.length - 1 && (
                <div className="absolute left-[19px] top-14 h-[calc(100%-2rem)] w-0.5 bg-rose-200" />
              )}

              <div className="absolute left-0 top-5 flex h-10 w-10 items-center justify-center rounded-full border-4 border-white bg-rose-600 text-sm font-bold text-white shadow-sm">
                {index + 1}
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm font-semibold text-rose-700">
                  {item.step}
                </p>
                <h3 className="mt-1 text-xl font-semibold leading-8 text-slate-900">
                  {item.title}
                </h3>
                <p className="mt-3 text-base leading-8 text-slate-600">
                  {item.body}
                </p>
              </div>

              {index !== actionSteps.length - 1 && (
                <div className="flex justify-center py-3 pl-2 text-rose-500">
                  <span className="text-xl" aria-hidden="true">
                    ↓
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section
        id="deadline_section"
        className="mx-auto max-w-5xl px-4 py-8 sm:px-6"
      >
        <p className="text-sm font-semibold tracking-[0.08em] text-rose-700">
          期限
        </p>
        <h2 className="mt-2 text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">
          最優先で確認したい期限
        </h2>

        <div className="mt-6 rounded-2xl border border-rose-200 bg-white p-5 shadow-sm">
          <div className="inline-flex rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-sm font-semibold text-rose-700">
            原則3か月以内
          </div>
          <h3 className="mt-4 text-xl font-semibold leading-8 text-slate-900">
            相続放棄の手続き（申述）の期限
          </h3>
          <p className="mt-3 text-base leading-8 text-slate-600">
            相続放棄は、原則として自分が相続人になったことを知ってから3か月以内に、
            被相続人の最後の住所地を管轄する家庭裁判所で手続きする必要があります。
            「まだ迷っている段階」でも、期限の確認は先に進めておいた方が安全です。
          </p>
        </div>

        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-5">
          <p className="text-sm font-semibold tracking-[0.08em] text-amber-700">
            間に合うか不安な方へ
          </p>
          <p className="mt-2 text-base leading-8 text-slate-700">
            借金や財産の調査が終わらず、3か月以内に放棄するか決めきれない場合は、
            家庭裁判所に期間の延長を申し立てる手続きがあります。
            期限が迫っている、または過ぎてしまって不安な場合でも、事情によっては相談した方がよいケースがあります。
          </p>
        </div>

        <div className="mt-6 rounded-2xl bg-slate-100 px-5 py-4 text-base leading-8 text-slate-600">
          迷ったときは、
          <span className="font-semibold text-slate-900">
            「借金の可能性があるか」「今どのくらい時間が残っているか」「家庭裁判所での手続きが必要か」
          </span>
          の3点を先に整理すると、優先順位を付けやすくなります。
        </div>
      </section>

      <section
        id="checks_section"
        className="mx-auto max-w-5xl px-4 py-8 sm:px-6"
      >
        <h2 className="text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">
          まず確認したいこと
        </h2>

        <div className="mt-6 grid gap-4">
          {checks.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
            >
              <h3 className="flex gap-3 text-xl font-semibold leading-8 text-slate-900">
                <span className="mt-1 text-rose-600">☑</span>
                <span>{item.title}</span>
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
            <li key={item} className="flex gap-3">
              <span className="mt-1 text-rose-600">・</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <div className="mt-8 rounded-2xl bg-slate-100 px-5 py-4 text-base leading-8 text-slate-600">
          相続放棄は、借金が確定してから考えるものではなく、負債の可能性がある時点で早めに整理を始める方が安心です。
        </div>
      </section>

      <section
        id="cta_section"
        className="mx-auto max-w-5xl px-4 py-10 sm:px-6"
      >
        <p className="text-sm font-semibold tracking-[0.08em] text-rose-700">
          相談先のご案内
        </p>
        <h2 className="mt-2 text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">
          期限が気になる方、借金の不安が強い方へ
        </h2>
        <p className="mt-4 text-base leading-8 text-slate-600 sm:text-lg">
          相続放棄は、相続全体の状況や借金の有無、今までに進めた行動も踏まえて判断する必要があります。
          自分だけで決めきれない場合は、早めに司法書士や弁護士へ相談した方が進めやすくなります。
        </p>

        <div className="mt-6 rounded-2xl border-2 border-slate-200 bg-slate-50 px-5 py-5 shadow-sm">
          <p className="text-sm font-semibold tracking-[0.08em] text-rose-700">
            相談先の選び方
          </p>
          <ul className="mt-3 space-y-3 text-base leading-8 text-slate-700">
            <li className="flex gap-3">
              <span className="mt-1 text-rose-600">・</span>
              <span>
                <span className="font-semibold text-slate-900">司法書士：</span>
                書類準備や手続きの整理を進めたい方、できるだけ費用を抑えてまず相談したい方に向いています。
              </span>
            </li>
            <li className="flex gap-3">
              <span className="mt-1 text-rose-600">・</span>
              <span>
                <span className="font-semibold text-slate-900">弁護士：</span>
                債権者から督促が来ている方、相続人同士のトラブルがある方、期限が迫っている・過ぎてしまった事情まで含めて強く相談したい方に向いています。
              </span>
            </li>
          </ul>
        </div>

        <div className="mt-6 grid gap-6">
          <AffiliateCtaBox
            title="借金や相続放棄の進め方を早めに整理したい方へ"
            serviceLead='借金問題や相続まわりの相談ができる「アース司法書士事務所」'
            description="借金や負債の不安があり、相続放棄も含めて早めに相談先を確保したい方向けの窓口です。迷って止まる前に、今の状況を整理したい方に向いています。"
            buttonText="まずは無料で状況を整理する"
            href="https://px.a8.net/svt/ejp?a8mat=4AZNCN+AQED5M+4LX2+5YZ77"
            lpName="renunciation"
            lpId="renunciation_lp"
            position="bottom"
            programName="earth_shihoshoshi_debt"
            ctaId="cta_renunciation_earth"
            partnerCategory="legal_service"
            sourceSection="cta_section_earth"
            gaEventName="cta_click_houki"
            summaryItems={[
              {
                label: "サービス名",
                value: "アース司法書士事務所",
              },
              {
                label: "主な相談内容",
                value: "借金問題や相続まわりの悩み整理",
              },
              {
                label: "こんな方に",
                value: "まず相談先を確保したい方",
              },
            ]}
            operatorName="アース司法書士事務所"
          />

          <div>
            <AffiliateCtaBox
              title="借金や返済不安が強く、弁護士に相談したい方へ"
              serviceLead='債務整理や借金問題の相談ができる「弁護士法人イストワール法律事務所」'
              description="相続だけでなく借金や返済の不安も重なっている場合は、早めに弁護士へ相談した方が整理しやすくなります。期限が迫っている、または過ぎてしまって不安な方も、事情を含めて相談したいときに向いています。"
              buttonText="借金の不安を弁護士に無料相談する"
              href="https://px.a8.net/svt/ejp?a8mat=4AZPOQ+9X84II+4FR4+639IP"
              lpName="renunciation"
              lpId="renunciation_lp"
              position="bottom"
              programName="histoire_law_office_debt"
              ctaId="cta_renunciation_histoire"
              partnerCategory="legal_service"
              sourceSection="cta_section_histoire"
              gaEventName="cta_click_houki"
              summaryItems={[
                {
                  label: "サービス名",
                  value: "弁護士法人イストワール法律事務所",
                },
                {
                  label: "主な相談内容",
                  value: "債務整理・借金問題の相談",
                },
                {
                  label: "こんな方に",
                  value: "借金の悩みが強い方",
                },
              ]}
              operatorName="弁護士法人イストワール法律事務所"
            />
            <p className="mt-3 text-sm leading-7 text-rose-700">
              ※ 期限の3か月が迫っている方や、すでに督促状が届いている方は、手遅れになる前に今すぐご相談ください。
            </p>
          </div>
        </div>

        <p className="mt-4 text-sm leading-7 text-slate-500">
          ※ ご状況によって適した相談先は異なります。内容を整理したうえでご相談ください。
        </p>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <h2 className="text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">
          慌てて進める前に気をつけたいこと
        </h2>

        <ul className="mt-6 space-y-4 text-base leading-8 text-slate-600">
          {avoidMistakes.map((item) => (
            <li key={item} className="flex gap-3">
              <span className="mt-1 font-bold text-rose-600">×</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <p className="mt-6 text-base leading-8 text-slate-600">
          相続放棄は、期限、財産、負債、すでに進めた行動の有無を分けて整理すると、判断しやすくなります。
          自分だけで決めきれない場合は、相続全体を含めて相談できる先を早めに確認することが大切です。
        </p>
      </section>

      <section
        id="faq_section"
        className="mx-auto max-w-5xl px-4 py-8 sm:px-6"
      >
        <p className="text-sm font-semibold tracking-[0.08em] text-rose-700">
          よくある疑問
        </p>
        <h2 className="mt-2 text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">
          相続放棄でよくある疑問
        </h2>

        <div className="mt-6 space-y-4">
          {faqItems.map((item, index) => {
            const isOpen = openFaqIndex === index;

            return (
              <div
                key={item.question}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => handleFaqToggle(index)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left"
                >
                  <span className="text-lg font-semibold leading-8 text-slate-900">
                    {item.question}
                  </span>
                  <span className="shrink-0 text-2xl font-semibold text-rose-700">
                    {isOpen ? "−" : "+"}
                  </span>
                </button>

                {isOpen && (
                  <div className="border-t border-slate-200 px-5 py-4">
                    <p className="text-base leading-8 text-slate-600">
                      {item.answer}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
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