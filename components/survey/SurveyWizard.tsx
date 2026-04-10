"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  Check,
  Clock3,
  UserRound,
  MousePointerClick,
  FileText,
  Search,
  PhoneCall,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  buildTrackingContext,
  trackAppEvent,
} from "@/lib/analytics/trackAppEvent";
import { getOrCreateSessionId } from "@/lib/survey/session";
import type { SurveyEnglishPreference } from "@/types/survey";

type SurveyWizardProps = {
  area: string;
  category: string;
  areaName: string;
  categoryName: string;
};

type FormState = {
  q1: string;
  q2: string;
  q3: string;
  q5: string;
  q6: string;
  q7: string;
};

type Option = {
  value: string;
  label: string;
};

type QuestionTrackingId =
  | "situation"
  | "urgency"
  | "real_estate"
  | "contact_method"
  | "primary_concern"
  | "english_preference";

type QuestionConfig = {
  key: keyof FormState;
  trackingId: QuestionTrackingId;
  number: number;
  title: string;
  hint: string;
  options: Option[];
};

type TrackingContext = {
  area: string;
  category: string;
  session_id: string;
};

const HERO_IMAGE_SRC = "/images/tsuginote-start-hero.jpg";

const QUESTIONS: QuestionConfig[] = [
  {
    key: "q1",
    trackingId: "situation",
    number: 1,
    title: "現在のご状況を教えてください",
    hint: "いちばん近いものを1つ選ぶと、そのまま次の質問へ進みます。",
    options: [
      { value: "family_conflict", label: "家族間で意見が分かれている" },
      { value: "not_conflict", label: "まだ揉めていないが整理したい" },
      { value: "debt_claim", label: "借金や請求が気になる" },
      { value: "deadline", label: "期限が迫っていて急いでいる" },
      { value: "not_sorted", label: "どこから始めればいいか分からない" },
    ],
  },
  {
    key: "q2",
    trackingId: "urgency",
    number: 2,
    title: "どれくらい急いでいますか",
    hint: "状況に合う候補を表示するために使います。",
    options: [
      { value: "urgent_today", label: "今日〜数日以内" },
      { value: "within_2weeks", label: "1〜2週間以内" },
      { value: "within_1month", label: "1か月以内" },
      { value: "info_only", label: "まず情報収集したい" },
    ],
  },
  {
    key: "q3",
    trackingId: "real_estate",
    number: 3,
    title: "不動産はありますか",
    hint: "家・土地・マンションなどがある場合は、確認事項が増えることがあります。",
    options: [
      { value: "has_property", label: "ある" },
      { value: "no_property", label: "ない" },
      { value: "unknown_property", label: "分からない" },
    ],
  },
  {
    key: "q5",
    trackingId: "contact_method",
    number: 4,
    title: "連絡しやすい方法を選んでください",
    hint: "対応している連絡方法を確認するために使います。",
    options: [
      { value: "phone", label: "電話" },
      { value: "email", label: "メール" },
      { value: "line", label: "LINE" },
      { value: "either", label: "どちらでもよい" },
    ],
  },
  {
    key: "q6",
    trackingId: "primary_concern",
    number: 5,
    title: "今いちばん気になることを選んでください",
    hint: "結果を見るときの参考にします。",
    options: [
      { value: "deadline", label: "期限に間に合うか" },
      { value: "preparation", label: "何を準備すべきか" },
      { value: "fee", label: "費用感" },
      { value: "who_first", label: "まず誰に相談すべきか" },
    ],
  },
  {
    key: "q7",
    trackingId: "english_preference",
    number: 6,
    title: "英語で相談したいですか",
    hint: "英語で相談したい場合だけ「希望する」を選んでください。",
    options: [
      { value: "want_english", label: "希望する" },
      { value: "no_preference", label: "こだわらない" },
    ],
  },
];

const TOTAL_QUESTIONS = QUESTIONS.length;

function mapQ1ToSituation(value: string) {
  switch (value) {
    case "family_conflict":
      return "family_conflict";
    case "not_conflict":
      return "not_conflicting_yet";
    case "debt_claim":
      return "billing_concern";
    case "deadline":
      return "deadline_urgent";
    case "not_sorted":
      return "not_organized_yet";
    default:
      return "not_organized_yet";
  }
}

function mapQ2ToUrgency(value: string) {
  switch (value) {
    case "urgent_today":
      return "today_or_few_days";
    case "within_2weeks":
      return "within_1_2_weeks";
    case "within_1month":
      return "within_1_month";
    case "info_only":
      return "just_collecting_info";
    default:
      return "just_collecting_info";
  }
}

function mapQ3ToRealEstate(value: string) {
  switch (value) {
    case "has_property":
      return "yes";
    case "no_property":
      return "no";
    case "unknown_property":
      return "unknown";
    default:
      return "unknown";
  }
}

function mapQ6ToPrimaryConcern(value: string) {
  switch (value) {
    case "deadline":
      return "deadline";
    case "preparation":
      return "preparation";
    case "fee":
      return "cost";
    case "who_first":
      return "who_to_contact";
    default:
      return "who_to_contact";
  }
}

function mapQ7ToEnglishPreference(value: string): SurveyEnglishPreference {
  switch (value) {
    case "want_english":
      return "want_english";
    case "no_preference":
      return "no_preference";
    default:
      return "no_preference";
  }
}

function buildResultsQueryParams(
  form: FormState,
  areaName: string,
  sessionId: string
) {
  const params = new URLSearchParams();

  params.set("situation", mapQ1ToSituation(form.q1));
  params.set("urgency", mapQ2ToUrgency(form.q2));
  params.set("hasRealEstate", mapQ3ToRealEstate(form.q3));
  params.set("contactMethod", form.q5 || "either");
  params.set("primaryConcern", mapQ6ToPrimaryConcern(form.q6));
  params.set("englishPreference", mapQ7ToEnglishPreference(form.q7));
  params.set("preferredArea", areaName);
  params.set("sessionId", sessionId);

  return params;
}

function buildSafeTrackingContext(
  area: string,
  category: string
): TrackingContext {
  try {
    const context = buildTrackingContext({ area, category }) as Partial<TrackingContext>;

    return {
      area: typeof context.area === "string" && context.area ? context.area : area,
      category:
        typeof context.category === "string" && context.category
          ? context.category
          : category,
      session_id:
        typeof context.session_id === "string" && context.session_id
          ? context.session_id
          : getOrCreateSessionId(),
    };
  } catch (error) {
    console.error("[SurveyWizard] buildTrackingContext failed", error);

    return {
      area,
      category,
      session_id: getOrCreateSessionId(),
    };
  }
}

function ProgressBar({ current }: { current: number }) {
  const percent = (current / TOTAL_QUESTIONS) * 100;

  return (
    <div className="w-full">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[11px] font-semibold tracking-[0.14em] text-slate-500">
          STEP {current} / {TOTAL_QUESTIONS}
        </span>
        <span className="text-[11px] font-semibold text-slate-500">
          {Math.max(TOTAL_QUESTIONS - current, 0)}問のこり
        </span>
      </div>

      <div className="h-2 rounded-full bg-slate-200">
        <div
          className="h-2 rounded-full bg-orange-500 transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

function TrustPill({
  icon,
  text,
}: {
  icon: ReactNode;
  text: string;
}) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-[12px] font-medium text-slate-700 sm:text-[13px]">
      <span className="text-orange-500">{icon}</span>
      <span>{text}</span>
    </div>
  );
}

function FlowCard({
  number,
  icon,
  title,
  text,
}: {
  number: string;
  icon: ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-50 text-orange-500">
          {icon}
        </div>
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 text-[22px] font-semibold text-white">
          {number}
        </div>
      </div>

      <h3 className="mt-8 text-[22px] font-semibold leading-[1.45] text-slate-900">
        {title}
      </h3>

      <p className="mt-4 text-[16px] leading-[1.85] text-slate-600">{text}</p>
    </div>
  );
}

function HeroFallbackVisual() {
  return (
    <div className="relative h-full min-h-[240px] overflow-hidden rounded-[28px] bg-[linear-gradient(135deg,#fff7ed_0%,#ffffff_52%,#eff6ff_100%)]">
      <div className="absolute -left-10 top-10 h-32 w-32 rounded-full bg-orange-100 blur-3xl" />
      <div className="absolute -right-8 bottom-6 h-28 w-28 rounded-full bg-sky-100 blur-3xl" />

      <div className="relative flex h-full items-end justify-center px-6 pb-0 pt-8">
        <div className="flex w-full max-w-[520px] items-end justify-center gap-4">
          <div className="flex w-[44%] flex-col items-center">
            <div className="h-16 w-16 rounded-full bg-[#f4c7b5]" />
            <div className="mt-3 h-28 w-full rounded-t-[28px] bg-[#4ca3c7]" />
          </div>
          <div className="flex w-[44%] flex-col items-center">
            <div className="h-16 w-16 rounded-full bg-[#f2c9ba]" />
            <div className="mt-3 h-28 w-full rounded-t-[28px] bg-white shadow-[0_0_0_1px_rgba(148,163,184,0.2)]" />
          </div>
        </div>
      </div>
    </div>
  );
}

function HeroImage() {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return <HeroFallbackVisual />;
  }

  return (
    <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
      <img
        src={HERO_IMAGE_SRC}
        alt="相談イメージ"
        className="h-full w-full object-cover"
        onError={() => setHasError(true)}
      />
    </div>
  );
}

function OptionButton({
  option,
  isSelected,
  onClick,
}: {
  option: Option;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "flex min-h-[62px] w-full items-center justify-between rounded-2xl border px-4 py-4 text-left transition sm:min-h-[68px] sm:px-6",
        "focus:outline-none focus:ring-2 focus:ring-orange-300",
        isSelected
          ? "border-slate-900 bg-slate-50 shadow-[0_0_0_1px_#0f172a]"
          : "border-slate-200 bg-white hover:bg-slate-50",
      ].join(" ")}
    >
      <span className="pr-3 text-[16px] font-semibold leading-[1.55] text-slate-900 sm:text-[18px]">
        {option.label}
      </span>

      <span
        className={[
          "inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-bold",
          isSelected
            ? "border-slate-900 bg-slate-900 text-white"
            : "border-slate-300 text-transparent",
        ].join(" ")}
      >
        ✓
      </span>
    </button>
  );
}

export default function SurveyWizard({
  area,
  category,
  areaName,
  categoryName,
}: SurveyWizardProps) {
  const router = useRouter();
  const autoNextTimerRef = useRef<number | null>(null);
  const hasTrackedStartRef = useRef(false);
  const trackedStepNumbersRef = useRef<Set<number>>(new Set());

  const [stepIndex, setStepIndex] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const [form, setForm] = useState<FormState>({
    q1: "",
    q2: "",
    q3: "",
    q5: "",
    q6: "",
    q7: "",
  });

  const trackingContext = useMemo(
    () => buildSafeTrackingContext(area, category),
    [area, category]
  );

  useEffect(() => {
    setForm({
      q1: "",
      q2: "",
      q3: "",
      q5: "",
      q6: "",
      q7: "",
    });
    setStepIndex(1);
    setSubmitError("");
    setIsSubmitting(false);
    hasTrackedStartRef.current = false;
    trackedStepNumbersRef.current = new Set();
  }, [area, category]);

  useEffect(() => {
    return () => {
      if (autoNextTimerRef.current) {
        window.clearTimeout(autoNextTimerRef.current);
      }
    };
  }, []);

  function safeTrack(eventName: string, params?: Record<string, unknown>) {
    try {
      trackAppEvent(eventName as Parameters<typeof trackAppEvent>[0], params);
    } catch (error) {
      console.error("[SurveyWizard] track failed", eventName, error);
    }
  }

  useEffect(() => {
    if (!trackedStepNumbersRef.current.has(stepIndex)) {
      const question = QUESTIONS[stepIndex - 1] ?? null;

      safeTrack("survey_step_view", {
        ...trackingContext,
        step_number: stepIndex,
        question_id: question?.trackingId ?? null,
        question_number: question?.number ?? null,
      });

      trackedStepNumbersRef.current.add(stepIndex);
    }
  }, [stepIndex, trackingContext]);

  const currentQuestion = useMemo(() => {
    return QUESTIONS[stepIndex - 1] ?? null;
  }, [stepIndex]);

  const currentValue =
    currentQuestion && form[currentQuestion.key]
      ? form[currentQuestion.key]
      : "";

  function trackAnswerSelect(
    question: QuestionConfig,
    answerValue: string,
    selectionAction: "select" | "deselect" = "select"
  ) {
    safeTrack("survey_answer_select", {
      ...trackingContext,
      question_id: question.trackingId,
      question_number: question.number,
      answer_value: answerValue,
      selection_action: selectionAction,
    });
  }

  function ensureStartTracked() {
    if (hasTrackedStartRef.current) return;

    hasTrackedStartRef.current = true;
    safeTrack("survey_start", {
      ...trackingContext,
      entry_step: 1,
    });
  }

  function handleBack() {
    if (autoNextTimerRef.current) {
      window.clearTimeout(autoNextTimerRef.current);
    }

    setSubmitError("");

    if (stepIndex === 1) {
      return;
    }

    setStepIndex((prev) => Math.max(prev - 1, 1));
  }

  function handleSelect(optionValue: string) {
    if (!currentQuestion) return;

    if (stepIndex === 1) {
      ensureStartTracked();
    }

    trackAnswerSelect(currentQuestion, optionValue, "select");

    const nextForm: FormState = {
      ...form,
      [currentQuestion.key]: optionValue,
    };

    setForm(nextForm);
    setSubmitError("");

    const isLastQuestion = stepIndex === TOTAL_QUESTIONS;
    if (isLastQuestion) return;

    if (autoNextTimerRef.current) {
      window.clearTimeout(autoNextTimerRef.current);
    }

    autoNextTimerRef.current = window.setTimeout(() => {
      setStepIndex((prev) => Math.min(prev + 1, TOTAL_QUESTIONS));
    }, 180);
  }

  async function handleSubmit() {
    if (!form.q1 || !form.q2 || !form.q3 || !form.q5 || !form.q6 || !form.q7) {
      setSubmitError("未回答の項目があります。");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const sessionId = trackingContext.session_id || getOrCreateSessionId();

      safeTrack("survey_complete", {
        ...trackingContext,
        step_number: TOTAL_QUESTIONS,
        q1_code: form.q1,
        q2_code: form.q2,
        q3_code: form.q3,
        q5_code: form.q5,
        q6_code: form.q6,
        q7_code: form.q7,
      });

      const params = buildResultsQueryParams(form, areaName, sessionId);

      router.push(`/${area}/${category}/results?${params.toString()}`);
    } catch (error) {
      console.error("[SurveyWizard] final submit failed", error);
      setSubmitError("画面の切り替えに失敗しました。もう一度お試しください。");
      setIsSubmitting(false);
    }
  }

  if (!currentQuestion) return null;

  const isLastQuestion = stepIndex === TOTAL_QUESTIONS;
  const isFirstQuestion = stepIndex === 1;

  if (isFirstQuestion) {
    return (
      <div className="space-y-6 sm:space-y-8">
        <section className="rounded-[30px] border border-slate-200 bg-white p-4 shadow-sm sm:p-6 lg:p-8">
          <div className="grid gap-6 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:gap-8">
            <div className="order-1 lg:order-2">
              <HeroImage />
            </div>

            <div className="order-2 lg:order-1">
              <p className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-[12px] font-medium text-slate-700 sm:text-[13px]">
                {areaName}エリア限定 ・ {categoryName}対応
              </p>

              <h1 className="mt-5 max-w-4xl text-left text-[28px] font-semibold leading-[1.3] tracking-[-0.03em] text-slate-900 sm:text-[36px] lg:text-[44px]">
                相続放棄の検討状況に合う、弁護士事務所の候補を確認できます
              </h1>

              <p className="mt-5 max-w-4xl text-left text-[16px] leading-[1.95] text-slate-600 sm:text-[18px]">
                6つの質問から今の状況や急ぎ度を整理できます。その内容から、東京で相続放棄に対応する弁護士事務所の候補を確認できます。氏名・メール・電話番号の入力は不要です。
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-[30px] border border-slate-200 bg-white p-4 shadow-sm sm:p-6 lg:p-8">
          <div className="mx-auto max-w-3xl rounded-[28px] border border-slate-200 bg-slate-50 p-4 sm:p-6">
            <h2 className="text-left text-[28px] font-semibold leading-[1.3] tracking-[-0.03em] text-slate-900 sm:text-[36px]">
              相続放棄の状況を整理しましょう
            </h2>

            <div className="mt-6">
              <ProgressBar current={stepIndex} />
            </div>

            <h3 className="mt-8 text-left text-[26px] font-semibold leading-[1.35] tracking-[-0.03em] text-slate-900 sm:text-[34px]">
              {currentQuestion.title}
            </h3>

            <p className="mt-4 text-left text-[15px] leading-[1.85] text-slate-600 sm:text-[16px]">
              {currentQuestion.hint}
            </p>

            <div className="mt-6 grid gap-3">
              {currentQuestion.options.map((option) => (
                <OptionButton
                  key={option.value}
                  option={option}
                  isSelected={currentValue === option.value}
                  onClick={() => handleSelect(option.value)}
                />
              ))}
            </div>

            <p className="mt-5 text-left text-[13px] leading-[1.85] text-slate-500 sm:text-[14px]">
              回答後に、条件に合う弁護士事務所の一覧を確認できます。営業電話が増える仕組みではありません。
            </p>
          </div>
        </section>

        <section className="pb-1">
          <h2 className="text-center text-[34px] font-semibold leading-[1.3] tracking-[-0.03em] text-slate-900 sm:text-[42px]">
            ご利用の流れ
          </h2>

          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            <FlowCard
              number="1"
              icon={<FileText className="h-8 w-8" strokeWidth={2.2} />}
              title="簡単な質問で検討状況を整理"
              text="いくつかの質問に答えるだけで、相続放棄を急いでいるか、借金や請求が気になっているかなど、今の状況を整理できます。"
            />
            <FlowCard
              number="2"
              icon={<Search className="h-8 w-8" strokeWidth={2.2} />}
              title="条件に合う弁護士事務所の候補を確認"
              text="対応内容や連絡方法を確認しながら、条件に合う弁護士事務所の候補を一覧で見ることができます。"
            />
            <FlowCard
              number="3"
              icon={<PhoneCall className="h-8 w-8" strokeWidth={2.2} />}
              title="連絡先を選んで直接問い合わせ"
              text="候補を確認したあとご自身で問い合わせいただきます。問い合わせ方法はメール・電話・LINE(選択可能な場合)から選択できます。"
            />
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100svh-88px)] sm:min-h-[calc(100svh-112px)]">
      <div className="flex min-h-[calc(100svh-88px)] flex-col rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm sm:min-h-[calc(100svh-112px)] sm:rounded-[30px] sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex min-h-[40px] items-center rounded-full border border-slate-300 px-4 text-[14px] font-semibold text-slate-900 transition hover:bg-slate-50"
          >
            戻る
          </button>

          <div className="w-full max-w-[220px] sm:max-w-[320px]">
            <ProgressBar current={stepIndex} />
          </div>
        </div>

        <div className="flex-1 py-6 sm:py-8">
          <div className="max-w-3xl">
            <p className="text-[12px] font-semibold tracking-[0.14em] text-slate-500 sm:text-[13px]">
              QUESTION {currentQuestion.number}
            </p>

            <h2 className="mt-3 text-[28px] font-semibold leading-[1.2] tracking-[-0.04em] text-slate-900 sm:text-[48px]">
              {currentQuestion.title}
            </h2>

            <p className="mt-3 max-w-2xl text-[14px] leading-[1.8] text-slate-600 sm:text-[16px]">
              {currentQuestion.hint}
            </p>
          </div>

          <div className="mt-6 grid gap-3 sm:mt-7">
            {currentQuestion.options.map((option) => (
              <OptionButton
                key={option.value}
                option={option}
                isSelected={currentValue === option.value}
                onClick={() => handleSelect(option.value)}
              />
            ))}
          </div>
        </div>

        <div className="min-h-[72px]">
          {isLastQuestion ? (
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting || !currentValue}
                className="inline-flex min-h-[56px] w-full items-center justify-center rounded-full bg-slate-900 px-6 text-[17px] font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-[60px] sm:text-[18px]"
              >
                {isSubmitting ? "結果へ移動中..." : "条件に合う候補を確認する"}
              </button>

              {submitError ? (
                <p className="text-sm font-medium text-rose-600">{submitError}</p>
              ) : null}
            </div>
          ) : (
            <p className="text-[13px] text-slate-500 sm:text-[14px]">
              選択すると次へ進みます。
            </p>
          )}
        </div>
      </div>
    </div>
  );
}