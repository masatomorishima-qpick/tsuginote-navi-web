'use client';

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import SiteFooter from "@/components/SiteFooter";
import { trackEvent } from "@/lib/trackEvent";
import AffiliateCtaBox from "@/components/AffiliateCtaBox";

const consultationAffiliateItems = [
  {
    id: "earth-judicial-scrivener",
    title: "借金や相続の悩みを早めに相談したい方へ",
    description:
      "借金問題や相続まわりの不安を一人で抱え込まず、まずは無料相談で整理したい方向けの相談先です。状況が複雑になる前に、今の段階で相談できる窓口を確保しておくと動きやすくなります。",
    buttonText: "アース司法書士事務所に無料相談する",
    href: "https://px.a8.net/svt/ejp?a8mat=4AZNCN+AQED5M+4LX2+5YZ77",
    lpName: "inheritance_consultation_lp",
    programName: "アース司法書士事務所",
    summaryItems: [
      { label: "相談内容", value: "借金問題・相続まわりの悩み整理" },
      { label: "こんな方に", value: "まず相談先を確保したい方" },
      { label: "タイミング", value: "迷って止まる前の早期相談" },
    ],
  },
  {
    id: "histoire-law-office",
    title: "債務整理も含めて弁護士に相談したい方へ",
    description:
      "相続だけでなく借金や返済の不安も重なっている場合は、早めに弁護士へ相談した方が整理しやすくなります。放置すると選択肢が狭まることもあるため、不安が大きい方は先に相談窓口を持っておくと安心です。",
    buttonText: "弁護士法人イストワール法律事務所に相談する",
    href: "https://px.a8.net/svt/ejp?a8mat=4AZPOQ+9X84II+4FR4+639IP",
    lpName: "inheritance_consultation_lp",
    programName: "弁護士法人イストワール法律事務所",
    summaryItems: [
      { label: "相談内容", value: "債務整理・借金問題の相談" },
      { label: "こんな方に", value: "借金の悩みが強い方" },
      { label: "タイミング", value: "返済不安や督促が気になるとき" },
    ],
  },
];

const cleanupAffiliateItem = {
  id: "ihinseiri-110",
  title: "遺品整理や実家の片付けを相談したい方へ",
  description:
    "遺品整理は、料金や作業範囲が分かりにくく、どこまで頼めるのか迷いやすい分野です。遺品整理110番は、全国対応・24時間365日受付で、見積や業者紹介は無料です。仕分け、不用品処分、買取、養生、分別・梱包、搬出・積込、簡易清掃まで含めて相談したい方に向いています。",
  buttonText: "遺品整理110番で無料見積を相談する",
  href: "https://px.a8.net/svt/ejp?a8mat=4AZNCN+786GWQ+39GM+5MFLEA",
  lpName: "inheritance_consultation_lp",
  programName: "遺品整理110番",
  summaryItems: [
    { label: "対応エリア", value: "全国対応" },
    { label: "受付時間", value: "24時間365日受付" },
    { label: "費用感", value: "見積無料・業者紹介無料" },
  ],
};

const heroPoints = [
  {
    title: "順番が分かる",
    body: "相続人の確認から名義変更・税務まで、今やることを順番で整理します。",
  },
  {
    title: "期限が分かる",
    body: "3か月・4か月・10か月・3年など、見落としやすい期限を先に確認できます。",
  },
  {
    title: "相談先が分かる",
    body: "司法書士・税理士・弁護士など、どこに相談すべきかをケース別に整理しています。",
  },
];

const quickNavItems = [
  {
    choiceId: "flow_first",
    choiceLabel: "まずは全体の流れをつかみたい",
    targetId: "flow_overview",
  },
  {
    choiceId: "deadline_first",
    choiceLabel: "急ぐ期限を先に確認したい",
    targetId: "deadline_docs",
  },
  {
    choiceId: "docs_first",
    choiceLabel: "必要書類をまとめて見たい",
    targetId: "documents_check",
  },
  {
    choiceId: "advisor_first",
    choiceLabel: "どこに相談すべきか決めたい",
    targetId: "advisor_guide",
  },
  {
    choiceId: "case_first",
    choiceLabel: "自分のケースの注意点を知りたい",
    targetId: "case_by_case",
  },
  {
    choiceId: "cleanup_interest",
    choiceLabel: "遺品整理や不動産の順番も気になる",
    targetId: "cleanup_timing",
  },
];

const stageCards = [
  {
    step: "STEP1",
    title: "相続人を確定する",
    body: "誰が相続人になるのかを整理し、必要に応じて戸籍を集めます。ここが曖昧なままでは、その後の遺産分割や名義変更が進みにくくなります。",
  },
  {
    step: "STEP2",
    title: "財産と負債の全体像を把握する",
    body: "預貯金、不動産、有価証券、保険だけでなく、借入や未払い金、保証債務の有無も確認します。プラスの財産だけで判断しないことが大切です。",
  },
  {
    step: "STEP3",
    title: "分け方と放棄の要否を考える",
    body: "相続放棄を検討するのか、遺産分割で進めるのか、まず方向性を決めます。借金が気になる場合は、この判断を後回しにしない方が安全です。",
  },
  {
    step: "STEP4",
    title: "名義変更・解約・引継ぎを進める",
    body: "銀行口座、証券口座、不動産、保険、公共料金、スマートフォン契約など、止めるものと引き継ぐものを分けて進めます。",
  },
  {
    step: "STEP5",
    title: "税務・登記・未了事項を締める",
    body: "準確定申告、相続税、不動産の相続登記など、期限のある手続きを漏れなく確認します。ここまでで相続手続きの大枠が締まります。",
  },
];

const firstActions = [
  "相続人になりそうな人を家族単位で洗い出す",
  "通帳、保険証券、権利書、契約書、請求書をひとまとめにする",
  "借入や未払い金がありそうかを確認する",
  "急ぐ期限がないか、このページの期限一覧で先に確認する",
];

const laterActions = [
  "財産の全体像が見えないうちに、急いで遺産分割の話をまとめる",
  "書類確認前に口座解約や処分を一気に進める",
  "不動産や税金の論点があるのに、自己判断だけで進める",
  "借金の有無が曖昧なまま、相続放棄の検討を後回しにする",
];

const deadlineCards = [
  {
    title: "相続放棄・限定承認",
    deadline: "原則3か月以内",
    body: "借金や保証債務が気になる場合は、相続開始を知った時からの熟慮期間を先に確認します。迷っている間に期限が近づきやすいため、ここは最優先で見ておきたい項目です。",
    tone: "border-rose-200 bg-rose-50 text-rose-700",
    badge: "期限厳守（3か月）",
  },
  {
    title: "準確定申告",
    deadline: "原則4か月以内",
    body: "亡くなった方に確定申告が必要な事情がある場合は、準確定申告を検討します。事業所得や不動産所得がある場合は特に要確認です。",
    tone: "border-amber-200 bg-amber-50 text-amber-700",
    badge: "確認推奨",
  },
  {
    title: "相続税の申告と納付",
    deadline: "原則10か月以内",
    body: "相続税の対象になりそうな場合は、遺産分割や評価の確認も含めて早めに準備した方が動きやすくなります。",
    tone: "border-sky-200 bg-sky-50 text-sky-700",
    badge: "早めに準備",
  },
  {
    title: "不動産の相続登記",
    deadline: "原則3年以内",
    body: "相続で不動産を取得したことを知った日から3年以内に相続登記が必要です。正当な理由なく怠ると10万円以下の過料の対象になり得ます。さらに2026年4月1日からは、住所・氏名の変更登記も義務化され、変更日から2年以内に対応しないと5万円以下の過料対象になり得ます。",
    tone: "border-emerald-200 bg-emerald-50 text-emerald-700",
    badge: "義務化（罰則あり）",
  },
];

const documentGroups = [
  {
    title: "相続人を確認する書類",
    items: [
      "亡くなった方の戸籍・除籍・改製原戸籍",
      "相続人の現在戸籍",
      "住民票や本籍が確認できる資料",
      "遺言書の有無が分かる資料",
    ],
  },
  {
    title: "財産を確認する書類",
    items: [
      "預貯金通帳、キャッシュカード、取引明細",
      "不動産の権利証、固定資産税通知書、登記事項の確認資料",
      "証券口座、保険証券、年金や退職金に関する資料",
      "車、会員権、貸付金などの一覧",
    ],
  },
  {
    title: "負債や支払いを確認する書類",
    items: [
      "借入明細、ローン返済予定表、クレジット利用明細",
      "未払いの医療費、介護費、家賃、公共料金",
      "保証人になっていないか分かる契約書",
      "請求書、督促状、税金の納付書",
    ],
  },
  {
    title: "名義変更・解約で使うことが多い書類",
    items: [
      "死亡の事実が分かる戸籍類",
      "相続人全員の本人確認書類",
      "遺産分割協議書や印鑑証明書",
      "各金融機関・各契約先の所定書式",
    ],
  },
];

const advisorCards = [
  {
    title: "司法書士",
    fit: "不動産の相続登記、戸籍収集、書類作成を整理したい場合",
    body: "不動産の名義変更がある場合は、早めに相談先候補に入れやすい専門家です。",
  },
  {
    title: "税理士",
    fit: "相続税、準確定申告、財産評価が気になる場合",
    body: "不動産、事業、金融資産が多い場合は、税務面の見通しを早めに持てると進めやすくなります。",
  },
  {
    title: "弁護士",
    fit: "相続人同士の対立、遺言トラブル、借金問題がある場合",
    body: "話し合いがまとまりにくい、争いになりそう、放棄や限定承認も絡むといったケースで検討しやすい相談先です。",
  },
  {
    title: "金融機関・保険会社の窓口",
    fit: "口座凍結後の流れや保険金請求の手順を確認したい場合",
    body: "実際の必要書類や所定書式は窓口ごとに異なるため、早めに確認しておくと二度手間を減らしやすくなります。",
  },
];

const caseCards = [
  {
    title: "不動産がある",
    points: [
      "相続登記の要否を確認する",
      "売却するのか保有するのかで必要な段取りが変わる",
      "遺品整理や残置物の処分を先走らない",
    ],
  },
  {
    title: "借金があるかもしれない",
    points: [
      "相続放棄を検討するかを早めに見極める",
      "借入・保証債務・督促状を先に確認する",
      "財産処分を急ぐ前に相談の要否を考える",
    ],
  },
  {
    title: "相続人が多い・疎遠な人がいる",
    points: [
      "誰が相続人かを先に確定する",
      "戸籍の収集に時間がかかる前提で動く",
      "合意形成が難しそうなら専門家相談を視野に入れる",
    ],
  },
  {
    title: "預金や証券の口座が複数ありそう",
    points: [
      "通帳や郵便物から金融機関を洗い出す",
      "各社の必要書類の違いを確認する",
      "遺産分割前にどこまで進められるか整理する",
    ],
  },
  {
    title: "事業・賃貸収入がある",
    points: [
      "準確定申告や税務確認を優先する",
      "毎月発生する入出金や契約関係を止めないよう整理する",
      "税理士相談を後回しにしない",
    ],
  },
  {
    title: "何から相談すべきか分からない",
    points: [
      "まずは相続人・財産・負債・不動産の有無の4点を整理する",
      "複雑なのは法務か税務か対立かを見分ける",
      "迷う場合は広く整理してくれる窓口から入る",
    ],
  },
];

const cleanupBlocks = [
  {
    title: "遺品整理を急ぎすぎない",
    body: "通帳、契約書、権利書、請求書、税関係の書類などが混ざっていることがあります。先に資料を分けてから、処分対象を考える方が安全です。",
  },
  {
    title: "不動産と片付けの順番を分けて考える",
    body: "持ち家や賃貸、空き家の状況によって、片付けと名義変更・解約・売却の順番が変わります。見通しがないまま一気に進めない方が整理しやすくなります。",
  },
  {
    title: "契約の停止と引継ぎを一覧にする",
    body: "公共料金、通信、サブスク、保険、会員サービスなどは、止めるものと名義変更するものが混ざります。一覧化すると漏れを減らしやすくなります。",
  },
];

const faqItems = [
  {
    question: "相続手続きは何から始めるのがよいですか？",
    answer:
      "まずは、相続人が誰か、財産と負債がどのくらいありそうか、不動産があるか、急ぐ期限があるかの4点を整理すると、その後の相談先や優先順位を決めやすくなります。",
  },
  {
    question: "借金があるか分からない場合でも進めて大丈夫ですか？",
    answer:
      "借金や保証債務の有無が曖昧な場合は、相続放棄の検討期限との関係もあるため、後回しにしない方が安全です。財産だけを見て動き始めると判断が難しくなることがあります。",
  },
  {
    question: "不動産がある場合は何が変わりますか？",
    answer:
      "相続登記、固定資産税、売却の有無、残置物の扱いなど、手続きが増えやすくなります。2026年2月開始の所有不動産記録証明制度を使うと、亡くなった方名義の不動産を一覧的に確認しやすくなりました。",
  },
  {
    question: "自分だけで進められるか、専門家に相談すべきか迷います。",
    answer:
      "不動産がある、相続人が多い、税金が気になる、借金や対立の可能性がある場合は、早めに相談先候補を決めておくと止まりにくくなります。特に不動産が絡む場合は、最新制度も含めて専門家に確認した方が漏れを防ぎやすくなります。",
  },
];

const relatedLinks = [
  {
    href: "/shibougo-tetsuzuki",
    label: "死亡後の手続きを確認する",
  },
  {
    href: "/souzoku-houki",
    label: "相続放棄を確認する",
  },
];

export default function SouzokuTetsuzukiClient() {
  const [selectedIntentId, setSelectedIntentId] = useState<string>("");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const viewedSectionsRef = useRef<Set<string>>(new Set());
  const viewOrderRef = useRef(0);

  useEffect(() => {
    const sectionIds = [
      "flow_overview",
      "deadline_docs",
      "documents_check",
      "advisor_guide",
      "case_by_case",
      "cleanup_timing",
      "faq_section",
    ];

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const target = entry.target as HTMLElement;
          const sectionId = target.id;

          if (!sectionId) return;
          if (viewedSectionsRef.current.has(sectionId)) return;

          viewedSectionsRef.current.add(sectionId);
          viewOrderRef.current += 1;

          void trackEvent({
            lp_id: "inheritance_lp",
            event_name: "section_view",
            component_id: "inheritance_sections",
            section_id: sectionId,
            view_order: viewOrderRef.current,
            selected_intent_id: selectedIntentId || undefined,
            metadata: {
              trigger: "intersection_observer",
            },
          });
        });
      },
      {
        threshold: 0.45,
      }
    );

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => {
      observer.disconnect();
    };
  }, [selectedIntentId]);

  const handleQuickNavClick = (
    choiceId: string,
    choiceLabel: string,
    targetId: string
  ) => {
    setSelectedIntentId(choiceId);

    void trackEvent({
      lp_id: "inheritance_lp",
      event_name: "intent_select",
      component_id: "inheritance_quick_nav",
      choice_id: choiceId,
      choice_label: choiceLabel,
      section_id: targetId,
      selected_intent_id: choiceId,
      metadata: {
        target_section: targetId,
      },
    });

    const target = document.getElementById(targetId);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

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
              <p className="inline-flex rounded-full bg-emerald-50 px-4 py-1.5 text-sm font-semibold text-emerald-700">
                相続手続きの案内｜相続人の確認から名義変更・税務まで
              </p>

              <h1 className="mt-5 text-[2.2rem] font-bold leading-[1.15] tracking-tight text-slate-900 sm:text-5xl">
                相続手続きの流れ・期限・必要書類を順番に整理する
              </h1>

              <div className="mt-6">
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-slate-200">
                  <Image
                    src="/images/tsuginote-top-main2.png"
                    alt="ご家族で手続きや相談先を整理している様子"
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 960px"
                    className="object-cover"
                  />
                </div>
              </div>

              <p className="mt-6 text-base leading-8 text-slate-600 sm:text-lg">
                死亡直後の手続きがひと段落した後は、相続人の確認、財産と負債の把握、相続放棄の検討、名義変更、税務など、
                判断が必要な手続きが続きます。このページでは、相続人の確認から名義変更・税務まで、
                迷いやすいポイントを流れに沿って整理しやすい形でまとめています。
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
                借金が不安な方は「期限」を、不動産がある方は「相談先」や「片付けの順番」を先にご確認いただくとスムーズです。
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-2 sm:px-6">
        <div className="rounded-3xl bg-emerald-50 px-5 py-6 sm:px-7 sm:py-7">
          <p className="text-sm font-semibold tracking-[0.08em] text-emerald-700">
            クイックナビ
          </p>

          <h2 className="mt-2 text-2xl font-bold leading-[1.4] text-slate-900 sm:text-3xl">
            今の悩みに近いものを選択してください
          </h2>

          <p className="mt-2 text-sm leading-7 text-slate-600 sm:text-base">
            該当するコーナーに移動します。上から順に読むと、全体の流れがつかみやすい構成です。
          </p>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {quickNavItems.map((item) => (
              <button
                key={item.choiceId}
                type="button"
                onClick={() =>
                  handleQuickNavClick(
                    item.choiceId,
                    item.choiceLabel,
                    item.targetId
                  )
                }
                className="rounded-2xl border border-white bg-white px-5 py-4 text-left text-base font-semibold leading-7 text-slate-900 transition hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-emerald-100"
              >
                {item.choiceLabel}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section
        id="flow_overview"
        className="mx-auto max-w-5xl scroll-mt-24 px-4 py-8 sm:px-6 sm:py-10"
      >
        <p className="text-sm font-semibold tracking-[0.08em] text-emerald-700">
          全体像
        </p>
        <h2 className="mt-2 text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">
          まずは、相続手続きの流れをつかむ
        </h2>

        <p className="mt-4 text-base leading-8 text-slate-600 sm:text-lg">
          相続手続きは、いきなり名義変更や相談先探しだけを始めるより、
          「誰が相続人か」「何が財産か」「借金はないか」「どの期限が近いか」を先に整理した方が、
          途中で止まりにくくなります。
        </p>

        <div className="mt-8">
          {stageCards.map((item, index) => (
            <div key={item.step} className="relative pl-10">
              {index !== stageCards.length - 1 && (
                <div className="absolute left-[19px] top-14 h-[calc(100%-2rem)] w-0.5 bg-emerald-200" />
              )}

              <div className="absolute left-0 top-5 flex h-10 w-10 items-center justify-center rounded-full border-4 border-white bg-emerald-600 text-sm font-bold text-white shadow-sm">
                {index + 1}
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm font-semibold text-emerald-700">
                  {item.step}
                </p>
                <h3 className="mt-1 text-xl font-semibold leading-8 text-slate-900">
                  {item.title}
                </h3>
                <p className="mt-3 text-base leading-8 text-slate-600">
                  {item.body}
                </p>
              </div>

              {index !== stageCards.length - 1 && (
                <div className="flex justify-center py-3 pl-2 text-emerald-500">
                  <span className="text-xl" aria-hidden="true">
                    ↓
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
            <h3 className="text-xl font-semibold text-slate-900">
              先にやると進めやすいこと
            </h3>
            <ul className="mt-4 space-y-3 text-base leading-7 text-slate-700">
              {firstActions.map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-1 text-emerald-700">☑</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5">
            <h3 className="text-xl font-semibold text-slate-900">
              焦って失敗しないためのNG行動
            </h3>
            <ul className="mt-4 space-y-3 text-base leading-7 text-slate-700">
              {laterActions.map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-1 font-bold text-rose-600">×</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section
        id="deadline_docs"
        className="mx-auto max-w-5xl scroll-mt-24 px-4 py-8 sm:px-6 sm:py-10"
      >
        <p className="text-sm font-semibold tracking-[0.08em] text-emerald-700">
          期限
        </p>
        <h2 className="mt-2 text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">
          急ぐ期限を先に確認する
        </h2>

        <p className="mt-4 text-base leading-8 text-slate-600 sm:text-lg">
          すべてを同じスピードで進める必要はありませんが、
          相続放棄、準確定申告、相続税、不動産の相続登記などは、期限を知らずに後回しにすると判断しづらくなります。
          まずは「自分のケースに関係しそうな期限があるか」を確認してください。
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {deadlineCards.map((item) => (
            <div
              key={item.title}
              className="relative rounded-2xl border bg-white p-5 shadow-sm"
            >
              <div className="absolute right-4 top-4">
                <span className="inline-flex rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
                  {item.badge}
                </span>
              </div>

              <div
                className={`inline-flex rounded-full border px-3 py-1 text-sm font-semibold ${item.tone}`}
              >
                {item.deadline}
              </div>

              <h3 className="mt-4 pr-24 text-xl font-semibold leading-8 text-slate-900">
                {item.title}
              </h3>
              <p className="mt-3 text-base leading-8 text-slate-600">
                {item.body}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-2xl bg-slate-100 px-5 py-4 text-base leading-8 text-slate-600">
          迷ったときは、
          <span className="font-semibold text-slate-900">
            借金の有無が不安なら3か月、不動産があるなら相続登記と住所・氏名変更登記の両方、
            財産の洗い出しが不安なら2026年2月開始の所有不動産記録証明制度も意識する
          </span>
          と、優先順位を付けやすくなります。
        </div>

        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-5">
          <p className="text-sm font-semibold tracking-[0.08em] text-amber-700">
            2026年の不動産ルールで押さえたい点
          </p>
          <ul className="mt-3 space-y-3 text-base leading-8 text-slate-700">
            <li className="flex gap-3">
              <span className="mt-1 text-amber-700">・</span>
              <span>2026年2月2日から、所有不動産記録証明制度で亡くなった方名義の不動産を一覧的に確認しやすくなりました。</span>
            </li>
            <li className="flex gap-3">
              <span className="mt-1 text-amber-700">・</span>
              <span>2026年4月1日から、住所・氏名の変更登記も義務化されました。引っ越しや結婚で変更がある方は、ここも見落としに注意です。</span>
            </li>
            <li className="flex gap-3">
              <span className="mt-1 text-amber-700">・</span>
              <span>不動産が絡む場合は、財産調査から登記までまとめて相談した方が、漏れや二度手間を減らしやすくなります。</span>
            </li>
          </ul>
        </div>
      </section>

      <section
        id="documents_check"
        className="mx-auto max-w-5xl scroll-mt-24 px-4 py-8 sm:px-6 sm:py-10"
      >
        <p className="text-sm font-semibold tracking-[0.08em] text-emerald-700">
          必要書類
        </p>
        <h2 className="mt-2 text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">
          先に集めたい書類を整理する
        </h2>

        <p className="mt-4 text-base leading-8 text-slate-600 sm:text-lg">
          相続手続きが止まりやすい理由のひとつが、必要書類がバラバラなことです。
          まずは「相続人の確認」「財産の確認」「負債の確認」「名義変更・解約用」の4つに分けると、
          探す順番が分かりやすくなります。
        </p>

        <div className="mt-6 grid gap-4">
          {documentGroups.map((group) => (
            <div
              key={group.title}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <h3 className="text-xl font-semibold leading-8 text-slate-900">
                {group.title}
              </h3>
              <ul className="mt-4 space-y-3 text-base leading-7 text-slate-600">
                {group.items.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-1 text-emerald-700">☑</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-2xl bg-amber-50 px-5 py-4 text-base leading-8 text-amber-900">
          先に処分せずに残しておきたいもの：
          通帳、証券の郵送物、保険証券、権利書、請求書、借入明細、会員情報が分かる書類、スマートフォン内の契約関連情報など。
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white px-5 py-5 shadow-sm">
          <p className="text-sm font-semibold tracking-[0.08em] text-emerald-700">
            書類が多くて止まりそうな方へ
          </p>
          <p className="mt-2 text-base leading-8 text-slate-700">
            戸籍収集や書類作成の量を見て、「自分だけでは難しい」と感じた方も多いはずです。
            不動産や相続人が多いケースは、早めに相談先を決めておくと進みやすくなります。
          </p>
          <p className="mt-3 text-sm text-slate-500">
            ※ 不安が強い方は、下の「相談先のご案内」もあわせてご確認ください。
          </p>
        </div>
      </section>

      <section
        id="advisor_guide"
        className="mx-auto max-w-5xl scroll-mt-24 px-4 py-8 sm:px-6 sm:py-10"
      >
        <p className="text-sm font-semibold tracking-[0.08em] text-emerald-700">
          相談先
        </p>
        <h2 className="mt-2 text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">
          どこに相談すべきか決める
        </h2>

        <p className="mt-4 text-base leading-8 text-slate-600 sm:text-lg">
          相続手続きは、すべてを一人で抱えなくても大丈夫です。
          どの専門家が近いかは、
          「不動産か」「税務か」「争いか」「実務窓口か」を分けると判断しやすくなります。
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {advisorCards.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <h3 className="text-xl font-semibold leading-8 text-slate-900">
                {item.title}
              </h3>
              <p className="mt-3 text-sm font-semibold leading-7 text-emerald-700">
                向いているケース：{item.fit}
              </p>
              <p className="mt-3 text-base leading-8 text-slate-600">
                {item.body}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-2xl bg-slate-100 px-5 py-4 text-base leading-8 text-slate-600">
          特に
          <span className="font-semibold text-slate-900">
            不動産がある、相続人が多い、借金が気になる、相続税の可能性がある
          </span>
          場合は、相談先を早めに決めておくと、書類集めや判断がスムーズになりやすくなります。
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
        <p className="text-sm font-semibold tracking-[0.08em] text-emerald-700">
          相談先のご案内
        </p>
        <h2 className="mt-2 text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">
          状況に応じて相談先を選びたい方へ
        </h2>
        <p className="mt-4 text-base leading-8 text-slate-600 sm:text-lg">
          借金の不安が強い方、相続とあわせて法的な整理が必要そうな方は、
          早めに専門家へ相談した方が進めやすくなります。ご自身の状況に近い相談先を選んでください。
        </p>

        <div className="mt-6 grid gap-6">
          <AffiliateCtaBox
            title={consultationAffiliateItems[0].title}
            description={consultationAffiliateItems[0].description}
            buttonText={consultationAffiliateItems[0].buttonText}
            href={consultationAffiliateItems[0].href}
            lpName={consultationAffiliateItems[0].lpName}
            lpId="inheritance_lp"
            position="bottom"
            programName={consultationAffiliateItems[0].programName}
            summaryItems={consultationAffiliateItems[0].summaryItems}
            ctaId="cta_inheritance_consult_earth"
            partnerCategory="legal_service"
            sourceSection="advisor_consultation_earth"
            selectedIntentId={selectedIntentId}
            gaEventName="cta_click_souzoku"
          />

          <AffiliateCtaBox
            title={consultationAffiliateItems[1].title}
            description={consultationAffiliateItems[1].description}
            buttonText={consultationAffiliateItems[1].buttonText}
            href={consultationAffiliateItems[1].href}
            lpName={consultationAffiliateItems[1].lpName}
            lpId="inheritance_lp"
            position="bottom"
            programName={consultationAffiliateItems[1].programName}
            summaryItems={consultationAffiliateItems[1].summaryItems}
            ctaId="cta_inheritance_consult_histoire"
            partnerCategory="legal_service"
            sourceSection="advisor_consultation_histoire"
            selectedIntentId={selectedIntentId}
            gaEventName="cta_click_souzoku"
          />
        </div>

        <p className="mt-4 text-sm leading-7 text-slate-500">
          ※ ご状況によって適した相談先は異なります。内容を整理したうえでご相談ください。
        </p>
      </section>

      <section
        id="case_by_case"
        className="mx-auto max-w-5xl scroll-mt-24 px-4 py-8 sm:px-6 sm:py-10"
      >
        <p className="text-sm font-semibold tracking-[0.08em] text-emerald-700">
          ケース別
        </p>
        <h2 className="mt-2 text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">
          ケース別に、止まりやすいポイントを確認する
        </h2>

        <p className="mt-4 text-base leading-8 text-slate-600 sm:text-lg">
          相続手続きは、家庭ごとに論点が変わります。自分のケースに近いものから読むと、
          「何を優先すべきか」が見えやすくなります。
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {caseCards.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <h3 className="text-xl font-semibold leading-8 text-slate-900">
                {item.title}
              </h3>
              <ul className="mt-4 space-y-3 text-base leading-7 text-slate-600">
                {item.points.map((point) => (
                  <li key={point} className="flex gap-3">
                    <span className="mt-1 text-emerald-700">☑</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section
        id="cleanup_timing"
        className="mx-auto max-w-5xl scroll-mt-24 px-4 py-8 sm:px-6 sm:py-10"
      >
        <p className="text-sm font-semibold tracking-[0.08em] text-emerald-700">
          遺品整理・片付け
        </p>
        <h2 className="mt-2 text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">
          遺品整理や不動産の手続きは、順番を意識する
        </h2>

        <p className="mt-4 text-base leading-8 text-slate-600 sm:text-lg">
          片付けや遺品整理は、亡くなった直後に急いで終わらせるものとは限りません。
          相続人の確認や財産の把握の前に進めすぎると、必要書類や判断材料を失いやすくなります。
        </p>

        <div className="mt-6 grid gap-4">
          {cleanupBlocks.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
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

        <div className="mt-6 rounded-2xl bg-emerald-50 px-5 py-4 text-base leading-8 text-slate-700">
          迷ったときは、
          <span className="font-semibold text-slate-900">
            「先に資料を分ける → 相続人と財産を確認する → 片付け・解約・売却の順を決める」
          </span>
          という流れで考えると、判断ミスを減らしやすくなります。
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white px-5 py-5 shadow-sm">
          <p className="text-sm font-semibold tracking-[0.08em] text-emerald-700">
            遺品整理の相談先
          </p>
          <h3 className="mt-2 text-2xl font-bold leading-tight text-slate-900 sm:text-3xl">
            遺品整理や実家の片付けをまとめて相談したい方へ
          </h3>
          <p className="mt-3 text-base leading-8 text-slate-600">
            相続手続きと並行して、遺品整理や空き家の片付けに悩む方も少なくありません。
            急いで処分する前に、仕分け・搬出・簡易清掃まで含めて相談したい方は、
            先に見積を取って進め方を整理しておくと動きやすくなります。
          </p>

          <div className="mt-6">
            <AffiliateCtaBox
              title={cleanupAffiliateItem.title}
              description={cleanupAffiliateItem.description}
              buttonText={cleanupAffiliateItem.buttonText}
              href={cleanupAffiliateItem.href}
              lpName={cleanupAffiliateItem.lpName}
              lpId="inheritance_lp"
              position="bottom"
              programName={cleanupAffiliateItem.programName}
              summaryItems={cleanupAffiliateItem.summaryItems}
              ctaId="cta_inheritance_cleanup"
              partnerCategory="cleanup_service"
              sourceSection="cleanup_timing_service"
              selectedIntentId={selectedIntentId}
              gaEventName="cta_click_souzoku"
            />
          </div>

          <p className="mt-4 text-sm leading-7 text-slate-500">
            ※ 不用品回収だけの依頼ではなく、遺品整理や片付け全体の相談として案内する想定です。
          </p>
        </div>
      </section>

      <section
        id="faq_section"
        className="mx-auto max-w-5xl scroll-mt-24 px-4 py-8 sm:px-6 sm:py-10"
      >
        <p className="text-sm font-semibold tracking-[0.08em] text-emerald-700">
          よくある疑問
        </p>
        <h2 className="mt-2 text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">
          相続手続きでよくある疑問
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
                  <span className="shrink-0 text-2xl font-semibold text-emerald-700">
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

      <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
        <h2 className="text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">
          関連して確認したいテーマ
        </h2>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          {relatedLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="inline-flex min-h-14 items-center justify-center rounded-2xl border border-slate-300 bg-white px-6 py-3 text-base font-semibold text-slate-900 transition hover:bg-slate-50"
            >
              {item.label}
            </Link>
          ))}
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