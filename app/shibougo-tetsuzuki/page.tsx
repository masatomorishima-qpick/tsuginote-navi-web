'use client';

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import SiteFooter from "@/components/SiteFooter";
import AffiliateCtaBox from "@/components/AffiliateCtaBox";
import { trackEvent } from "@/lib/trackEvent";

const FUNERAL_AFFILIATE_HREF = "REPLACE_WITH_FUNERAL_AFFILIATE_URL";
const WILL_SUPPORT_AFFILIATE_HREF = "REPLACE_WITH_WILL_SUPPORT_AFFILIATE_URL";

const prioritySteps = [
  "今日中に、連絡先と書類を整理する",
  "7日以内に、役所と保険の流れを確認する",
  "その後の相続や遺言書確認に備えて、情報を1か所にまとめる",
];

const todayChecklist = [
  "病院・施設から受け取る書類（死亡届と一体になった死亡診断書など）を確認する",
  "親族や関係者に連絡する範囲を決める",
  "搬送先・安置先・葬儀社の候補を整理する",
  "故人の保険証・診察券・身分証・スマートフォンなど、手元にあるものをまとめる",
];

const firstWeekChecklist = [
  "死亡届をどこに出すか確認する",
  "火葬・葬儀の日程に関わる手続きの流れを確認する",
  "健康保険証・介護保険証・年金の手続きに必要な書類をそろえる",
  "勤務先、年金、自治体窓口で何を確認するかメモにする",
];

const within30Checklist = [
  "年金、勤務先、銀行、クレジットカード、公共料金などを一覧で整理する",
  "口座や契約の名義、引き落とし、未払費用の有無を確認する",
  "ご実家や住居の片付け、明け渡し、引き継ぎの必要性を確認する",
  "今後の相続手続きに備えて、財産や借金の入口情報をまとめる",
];

const willChecklist = [
  "封がされた遺言書は、勝手に開封すると5万円以下の過料を科される可能性があるため、絶対に開けずに家庭裁判所での『検認』手続きを確認してください。",
  "公正証書遺言や、法務局で保管されている自筆証書遺言は扱いが異なる",
  "遺言書があるか不明な場合は、保管制度の利用有無や書類の所在を確認する",
  "不安がある場合は、司法書士・弁護士などの専門家に早めに相談する",
];

const deadlineItems = [
  "死亡届は原則7日以内の提出が必要です。",
  "健康保険・介護保険・年金などは、手続きが遅れると亡くなった後の年金が振り込まれ続け、後から一括で返還請求されるなどのトラブルに繋がるため注意が必要です。",
  "相続放棄を検討する場合は、相続開始を知ってから3か月以内がひとつの重要な目安です。",
];

const avoidMistakes = [
  "必要書類をそろえる前に、あちこちへ個別に連絡してしまう",
  "借金や契約の有無を確認しないまま、相続の判断を進めてしまう",
  "遺言書らしきものを見つけても、扱いを確認せずに進めてしまう",
  "役所の手続きが終われば大丈夫と思い込み、その後の名義変更や相続確認を後回しにしてしまう",
];

const timelineNavItems = [
  {
    choiceId: "today_first",
    choiceLabel: "まず今日やることを知りたい",
    targetId: "today_first",
  },
  {
    choiceId: "within_7days_first",
    choiceLabel: "7日以内にやることを確認したい",
    targetId: "within_7days",
  },
  {
    choiceId: "within_30days_first",
    choiceLabel: "2週間〜1か月で進めることを知りたい",
    targetId: "within_30days",
  },
  {
    choiceId: "after_settlement_first",
    choiceLabel: "手続きが落ち着いた後に考えることを知りたい",
    targetId: "after_settlement",
  },
];

const highlightPhrases = (text: string) => {
  const phrases = ["原則7日以内", "勝手に開封せず"];
  const escaped = phrases.map((phrase) => phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const regex = new RegExp(`(${escaped.join("|")})`, "g");
  const parts = text.split(regex);

  return parts.map((part, index) => {
    const isHighlight = phrases.includes(part);
    if (isHighlight) {
      return (
        <span
          key={`${part}-${index}`}
          className="rounded bg-rose-50 px-1 py-0.5 font-bold text-rose-700"
        >
          {part}
        </span>
      );
    }
    return <span key={`${part}-${index}`}>{part}</span>;
  });
};

function StepBadge({ label }: { label: string }) {
  return (
    <div className="mb-3">
      <span className="inline-flex items-center rounded-full bg-slate-900 px-3 py-1 text-xs font-bold tracking-[0.12em] text-white">
        {label}
      </span>
    </div>
  );
}

function Checklist({ items }: { items: string[] }) {
  return (
    <ul className="mt-3 space-y-3 text-base leading-8 text-slate-600">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3">
          <span
            aria-hidden="true"
            className="mt-1 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded border border-slate-300 bg-slate-50 text-sm text-slate-700"
          >
            ☑
          </span>
          <span>{highlightPhrases(item)}</span>
        </li>
      ))}
    </ul>
  );
}

function MicroCopy({ text }: { text: string }) {
  return (
    <p className="mt-3 text-center text-xs leading-6 text-slate-500 sm:text-sm">
      {text}
    </p>
  );
}

export default function ShibougoTetsuzukiPage() {
  const [selectedIntentId, setSelectedIntentId] = useState<string>("");

  const viewedSectionsRef = useRef<Set<string>>(new Set());
  const viewOrderRef = useRef(0);

  useEffect(() => {
    const sectionIds = [
      "today_first",
      "within_7days",
      "within_30days",
      "after_settlement",
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
            lp_id: "after_death_lp",
            event_name: "section_view",
            component_id: "after_death_sections",
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
        threshold: 0.5,
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

  const handleTimelineNavClick = (
    choiceId: string,
    choiceLabel: string,
    targetId: string
  ) => {
    setSelectedIntentId(choiceId);

    void trackEvent({
      lp_id: "after_death_lp",
      event_name: "intent_select",
      component_id: "after_death_timeline_nav",
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
            <p className="inline-flex rounded-full bg-amber-50 px-4 py-1.5 text-sm font-semibold text-amber-700">
              死亡後手続きの案内
            </p>

            <h1 className="mt-5 text-[2.2rem] font-bold leading-[1.1] tracking-tight text-slate-900 sm:text-5xl">
              亡くなった後の手続きを順番で整理する
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
              ご家族が亡くなった後は、葬儀、役所、年金、保険、名義確認など、短い期間で確認すべきことが重なります。
              まずは慌てず、今日やることと、7日以内に確認したいことから整理していきましょう。
            </p>

            <div className="mt-8 rounded-3xl border border-amber-200 bg-amber-50 px-5 py-6 shadow-sm sm:px-7 sm:py-7">
              <p className="text-lg font-bold leading-8 text-amber-900 sm:text-2xl">
                まずはこの3つだけ確認してください
              </p>

              <div className="mt-5 divide-y divide-amber-200/70 rounded-2xl bg-white/50">
                {prioritySteps.map((item, index) => (
                  <div key={item} className="flex gap-4 px-1 py-4 sm:px-2 sm:py-5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-200 text-sm font-bold text-amber-900 sm:h-10 sm:w-10 sm:text-base">
                      {index + 1}
                    </div>
                    <p className="pt-0.5 text-base font-semibold leading-7 text-slate-900 sm:text-lg">
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-2 sm:px-6">
        <div className="rounded-3xl bg-amber-50 px-5 py-6 sm:px-7 sm:py-7">
          <p className="text-sm font-semibold tracking-[0.08em] text-amber-700">
            時系列ガイド
          </p>

          <h2 className="mt-2 text-2xl font-bold leading-[1.4] text-slate-900 sm:text-3xl">
            今の段階に近いものを選択してください
          </h2>

          <p className="mt-2 text-sm leading-7 text-slate-600 sm:text-base">
            該当するコーナーに移動します。
          </p>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {timelineNavItems.map((item) => (
              <button
                key={item.choiceId}
                type="button"
                onClick={() =>
                  handleTimelineNavClick(
                    item.choiceId,
                    item.choiceLabel,
                    item.targetId
                  )
                }
                className="rounded-2xl border border-white bg-white px-5 py-4 text-left text-base font-semibold leading-7 text-slate-900 transition hover:-translate-y-0.5 hover:border-amber-300 hover:bg-amber-100 sm:text-lg"
              >
                {item.choiceLabel}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section
        id="today_first"
        className="mx-auto max-w-5xl scroll-mt-24 px-4 py-8 sm:px-6"
      >
        <StepBadge label="STEP 1" />
        <h2 className="text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">
          まず今日やることを知りたい方へ
        </h2>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <h3 className="text-xl font-semibold leading-8 text-slate-900">
            まず今日中に整理したいこと
          </h3>
          <p className="mt-3 text-base leading-8 text-slate-600">
            ご逝去当日は、親族への連絡、葬儀社や搬送先の確認、医師から受け取る書類の確認など、短時間で判断が重なります。
            先に「誰に連絡するか」「何を受け取るか」「どこへ相談するか」をメモにすると、動きやすくなります。
          </p>
        </div>

        <div className="mt-6 rounded-2xl border border-amber-200 bg-white p-5">
          <h3 className="text-lg font-semibold leading-8 text-slate-900">
            今日のチェックリスト
          </h3>
          <Checklist items={todayChecklist} />
        </div>

        <div className="mt-6 rounded-2xl bg-slate-100 px-5 py-4 text-base leading-8 text-slate-600">
          まずは連絡先、葬儀や搬送、死亡診断書など、今日中に整理したいことから確認すると混乱を減らしやすくなります。
        </div>

        <div className="mt-8 border-t border-slate-200 pt-8">
          <AffiliateCtaBox
            title="急ぎで葬儀社を探したい方へ"
            serviceLead="比較検討の時間が取りづらいときは、まず即時対応できる窓口を確認しておくと安心です。"
            description="亡くなった当日は、ご遺体の搬送や安置先、葬儀社との打ち合わせを短時間で決める必要があります。24時間対応や深夜のお迎え、家族葬の相談など、すぐ動きたい方向けの比較・相談窓口を先に確認しておくと進めやすくなります。"
            buttonText="葬儀社の相談先を見る"
            href={FUNERAL_AFFILIATE_HREF}
            lpName="death_procedures"
            lpId="after_death_lp"
            position="bottom"
            programName="funeral_support"
            ctaId="cta_after_death_funeral"
            partnerCategory="funeral_service"
            sourceSection="today_first_funeral"
            selectedIntentId={selectedIntentId}
            gaEventName="cta_click_shibougo"
            summaryItems={[
              {
                label: "相談内容",
                value: "搬送・安置・葬儀社手配の相談向けです。",
              },
              {
                label: "訴求",
                value: "24時間・深夜対応の比較相談を想定しています。",
              },
              {
                label: "葬儀形式",
                value: "家族葬など定額プランの比較に向いています。",
              },
              {
                label: "確認",
                value: "対応エリアや費用感を先に確認できます。",
              },
            ]}
            operatorName="案件に合わせて差し替えてください"
          />
          <MicroCopy text="※相談や見積もりの可否、対応エリア、費用条件はリンク先をご確認ください。" />
        </div>
      </section>

      <section
        id="within_7days"
        className="mx-auto max-w-5xl scroll-mt-24 px-4 py-8 sm:px-6"
      >
        <StepBadge label="STEP 2" />
        <h2 className="text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">
          7日以内にやることを確認したい方へ
        </h2>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <h3 className="text-xl font-semibold leading-8 text-slate-900">
            役所や保険まわりは、早めに流れを確認する
          </h3>
          <p className="mt-3 text-base leading-8 text-slate-600">
            死亡届の提出、健康保険証や介護保険証の返却、世帯主変更など、市区町村で確認が必要な手続きがあります。
            自治体によって窓口や必要書類が異なるため、早めに確認しておくと動きやすくなります。
          </p>
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="text-lg font-semibold leading-8 text-slate-900">
            7日以内のチェックリスト
          </h3>
          <Checklist items={firstWeekChecklist} />
        </div>

        <ul className="mt-6 space-y-4 text-base leading-8 text-slate-600">
          {deadlineItems.map((item) => (
            <li key={item} className="flex items-start gap-3">
              <span
                aria-hidden="true"
                className="mt-1 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded border border-slate-300 bg-slate-50 text-sm text-slate-700"
              >
                ☑
              </span>
              <span>{highlightPhrases(item)}</span>
            </li>
          ))}
        </ul>
      </section>

      <section
        id="within_30days"
        className="mx-auto max-w-5xl scroll-mt-24 px-4 py-8 sm:px-6"
      >
        <StepBadge label="STEP 3" />
        <h2 className="text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">
          2週間〜1か月で進めることを知りたい方へ
        </h2>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <h3 className="text-xl font-semibold leading-8 text-slate-900">
            年金・勤務先・金融機関・住居まわりを整理する
          </h3>
          <p className="mt-3 text-base leading-8 text-slate-600">
            年金、勤務先、金融機関、公共料金などは、何を止めるか・何を引き継ぐかを一覧で整理しておくと漏れを減らしやすくなります。
            あわせて、ご実家や故人の住居をどう整理するかも考え始めるタイミングです。
          </p>
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="text-lg font-semibold leading-8 text-slate-900">
            2週間〜1か月のチェックリスト
          </h3>
          <Checklist items={within30Checklist} />
        </div>

        <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <h3 className="text-xl font-semibold leading-8 text-slate-900">
            遺言書が見つかったときは、扱いを先に確認してください
          </h3>
          <p className="mt-3 text-base leading-8 text-slate-700">
            ご自宅や貸金庫、書類の束から遺言書らしきものが見つかっても、すぐに開封・判断せず、まず扱いを確認することが大切です。
            遺言書の種類によって、確認方法や必要な手続きが変わる場合があります。
          </p>
          <Checklist items={willChecklist} />

          <div className="mt-6 border-t border-amber-200 pt-6">
            <AffiliateCtaBox
              title="遺言書の扱い・検認手続きを相談したい方へ"
              serviceLead="戸籍収集から家庭裁判所への申立てまで、まとめて相談したい方向けの枠です。"
              description="封がされた遺言書を見つけたときは、自己判断で進めず、扱いを確認したうえで検認手続きの流れを整理することが大切です。戸籍収集や必要書類の準備、家庭裁判所への申立てまで一括で相談したい方は、まず費用感と対応範囲を確認しておくと安心です。費用目安は6万円程度から案内されることを想定しています。"
              buttonText="遺言書の相談先を見る"
              href={WILL_SUPPORT_AFFILIATE_HREF}
              lpName="death_procedures"
              lpId="after_death_lp"
              position="bottom"
              programName="will_support"
              ctaId="cta_after_death_will_support"
              partnerCategory="legal_service"
              sourceSection="within_30days_will_support"
              selectedIntentId={selectedIntentId}
              gaEventName="cta_click_shibougo"
              summaryItems={[
                {
                  label: "相談内容",
                  value: "遺言書の扱い・検認手続きの相談向けです。",
                },
                {
                  label: "対応範囲",
                  value: "戸籍収集から申立て準備までの相談を想定しています。",
                },
                {
                  label: "費用目安",
                  value: "6万円程度からの案内を想定しています。",
                },
                {
                  label: "確認",
                  value: "対応可否や費用条件を先に確認できます。",
                },
              ]}
              operatorName="案件に合わせて差し替えてください"
            />
            <MicroCopy text="※相談前に費用や対応範囲を確認できます。詳細条件はリンク先をご確認ください。" />
          </div>

          <div className="mt-6 rounded-2xl bg-white/70 px-4 py-4 text-sm leading-7 text-slate-600 sm:text-base">
            <p className="font-semibold text-slate-900">関連ページ</p>
            <div className="mt-2 flex flex-col gap-2">
              <Link
                href="/souzoku-tetsuzuki"
                className="inline-flex items-center gap-2 text-slate-700 underline underline-offset-4 hover:text-slate-900"
              >
                相続全体の流れを確認したい方は、相続手続きページへ
              </Link>
              <Link
                href="/souzoku-houki"
                className="inline-flex items-center gap-2 text-slate-700 underline underline-offset-4 hover:text-slate-900"
              >
                借金や相続放棄が気になる方は、相続放棄ページへ
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-200 pt-8">
          <AffiliateCtaBox
            title="ご実家や住居の片付けを一人で抱え込まずに進めたい方へ"
            serviceLead="サービス全体で累計問い合わせ500万件以上の運営実績がある会社に相談しましょう。"
            description="死亡後の手続きが続く中で、ご実家の片付けまで一人で進めるのは大きな負担です。遺品整理110番は全国対応で、まず無料見積もりから相談できます。費用感を先に確認してから進めたい方や、自分たちだけで抱え込まずに進め方を整理したい方は、先に内容を確認しておくと安心です。※故人が賃貸にお住まいだった場合、家賃が発生し続けるため早めの整理・退去が必要です。"
            buttonText="無料見積もりを見る"
            href="https://px.a8.net/svt/ejp?a8mat=4AZNCN+786GWQ+39GM+5MFLEA"
            lpName="death_procedures"
            lpId="after_death_lp"
            position="bottom"
            programName="ihinseiri_110"
            ctaId="cta_after_death_cleanup"
            partnerCategory="cleanup_service"
            sourceSection="within_30days_cleanup"
            selectedIntentId={selectedIntentId}
            gaEventName="cta_click_shibougo"
            summaryItems={[
              {
                label: "サービス名",
                value: "遺品整理110番",
              },
              {
                label: "対応エリア",
                value: "全国対応です。",
              },
              {
                label: "受付",
                value: "24時間365日受付です。",
              },
              {
                label: "相談",
                value: "無料見積もりから確認できます。",
              },
            ]}
            operatorName="シェアリングテクノロジー株式会社"
          />
          <MicroCopy text="※相談や見積もりは無料です。対応内容や費用条件はリンク先をご確認ください。" />
        </div>
      </section>

      <section
        id="after_settlement"
        className="mx-auto max-w-5xl scroll-mt-24 px-4 py-8 sm:px-6"
      >
        <h2 className="text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">
          手続きが落ち着いた後に考えること
        </h2>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <h3 className="text-xl font-semibold leading-8 text-slate-900">
            相続や名義変更の入口を確認する
          </h3>
          <p className="mt-3 text-base leading-8 text-slate-600">
            死亡後の手続きが落ち着いたあと、相続人の確認、財産や借金の把握、名義変更、相続放棄の検討が必要になる場合があります。
            今の時点で全てを判断できなくても、次に何を見ればよいかを知っておくと安心です。
          </p>
        </div>

        <div className="mt-8 rounded-2xl bg-slate-100 px-5 py-4 text-base leading-8 text-slate-600">
          死亡後手続きのあとに、相続放棄や相続手続きの検討が必要になる場合があります。
          今の段階では全てを決めきれなくても、次に確認すべきテーマを把握しておくことが大切です。
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
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
      </section>

      <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <h2 className="text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">
          慌てて進める前に気をつけたいこと
        </h2>

        <ul className="mt-6 space-y-4 text-base leading-8 text-slate-600">
          {avoidMistakes.map((item) => (
            <li key={item} className="flex items-start gap-3">
              <span
                aria-hidden="true"
                className="mt-1 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded border border-slate-300 bg-slate-50 text-sm text-slate-700"
              >
                ☑
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <p className="mt-6 text-base leading-8 text-slate-600">
          まずは現時点で分かっている情報を整理し、期限がありそうなものから順に確認していくと、負担を減らしやすくなります。
          迷う部分は、早めに相談先を確認しておくのもひとつの方法です。
        </p>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <h2 className="text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">
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