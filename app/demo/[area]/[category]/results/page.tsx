import type { Metadata } from "next";
import Image from "next/image";
import BackButton from "@/components/common/BackButton";
import ResultsListClient from "@/components/result/ResultsListClient";
import SiteFooter from "@/components/SiteFooter";
import { getDemoOffices } from "@/lib/offices/getDemoOffices";
import { matchOffices } from "@/lib/survey/matching";
import type {
  SurveyAnswers,
  SurveyContactMethod,
  SurveyEnglishPreference,
  SurveyPrimaryConcern,
  SurveyRealEstate,
  SurveySituation,
  SurveyUrgency,
} from "@/types/survey";

export const metadata: Metadata = {
  title: "営業用デモ結果 | つぎの手ナビ",
  robots: {
    index: false,
    follow: false,
  },
};

type SearchParams = {
  [key: string]: string | string[] | undefined;
};

type PageProps = {
  params: Promise<{
    area: string;
    category: string;
  }>;
  searchParams?: Promise<SearchParams>;
};

function firstValue(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }
  return value ?? "";
}

function parseSituation(value: string): SurveySituation {
  const allowed: SurveySituation[] = [
    "family_conflict",
    "not_conflicting_yet",
    "billing_concern",
    "deadline_urgent",
    "not_organized_yet",
  ];

  return allowed.includes(value as SurveySituation)
    ? (value as SurveySituation)
    : "not_organized_yet";
}

function parseUrgency(value: string): SurveyUrgency {
  const allowed: SurveyUrgency[] = [
    "today_or_few_days",
    "within_1_2_weeks",
    "within_1_month",
    "just_collecting_info",
  ];

  return allowed.includes(value as SurveyUrgency)
    ? (value as SurveyUrgency)
    : "just_collecting_info";
}

function parseRealEstate(value: string): SurveyRealEstate {
  const allowed: SurveyRealEstate[] = ["yes", "no", "unknown"];

  return allowed.includes(value as SurveyRealEstate)
    ? (value as SurveyRealEstate)
    : "unknown";
}

function parseContactMethod(value: string): SurveyContactMethod {
  const allowed: SurveyContactMethod[] = ["phone", "email", "line", "either"];

  return allowed.includes(value as SurveyContactMethod)
    ? (value as SurveyContactMethod)
    : "either";
}

function parsePrimaryConcern(value: string): SurveyPrimaryConcern {
  const allowed: SurveyPrimaryConcern[] = [
    "deadline",
    "preparation",
    "cost",
    "who_to_contact",
  ];

  return allowed.includes(value as SurveyPrimaryConcern)
    ? (value as SurveyPrimaryConcern)
    : "who_to_contact";
}

function parseEnglishPreference(value: string): SurveyEnglishPreference {
  const allowed: SurveyEnglishPreference[] = [
    "want_english",
    "no_preference",
  ];

  return allowed.includes(value as SurveyEnglishPreference)
    ? (value as SurveyEnglishPreference)
    : "no_preference";
}

function normalizeAreaLabel(area: string): string {
  if (area === "tokyo") return "東京";
  return area;
}

function mapQ1ToSituation(value: string): SurveySituation {
  switch (value) {
    case "family_conflict":
    case "trouble":
    case "揉めている":
      return "family_conflict";

    case "not_conflicting_yet":
    case "まだ揉めていない":
      return "not_conflicting_yet";

    case "billing_concern":
    case "debt":
    case "借金・請求":
      return "billing_concern";

    case "deadline_urgent":
    case "urgent":
    case "期限が迫っている":
      return "deadline_urgent";

    case "not_organized_yet":
    case "まだ整理できていない":
      return "not_organized_yet";

    default:
      return "not_organized_yet";
  }
}

function mapQ2ToUrgency(value: string): SurveyUrgency {
  switch (value) {
    case "today_or_few_days":
    case "today":
    case "今日〜数日以内":
      return "today_or_few_days";

    case "within_1_2_weeks":
    case "1〜2週間以内":
      return "within_1_2_weeks";

    case "within_1_month":
    case "1か月以内":
      return "within_1_month";

    case "just_collecting_info":
    case "情報収集中":
      return "just_collecting_info";

    default:
      return "just_collecting_info";
  }
}

function mapQ5ToContactMethod(value: string): SurveyContactMethod {
  switch (value) {
    case "phone":
    case "電話":
      return "phone";

    case "email":
    case "mail":
    case "メール":
      return "email";

    case "line":
    case "LINE":
      return "line";

    case "either":
    case "どれでもよい":
      return "either";

    default:
      return "either";
  }
}

function mapQ7ToEnglishPreference(value: string): SurveyEnglishPreference {
  switch (value) {
    case "want_english":
    case "english":
    case "yes":
    case "true":
    case "英語相談を希望する":
      return "want_english";

    default:
      return "no_preference";
  }
}

function buildAnswers(
  area: string,
  searchParams?: Record<string, string | string[] | undefined>
): SurveyAnswers {
  const preferredArea =
    firstValue(searchParams?.preferredArea) || normalizeAreaLabel(area);

  const situationParam =
    firstValue(searchParams?.situation) || firstValue(searchParams?.q1);

  const urgencyParam =
    firstValue(searchParams?.urgency) || firstValue(searchParams?.q2);

  const contactParam =
    firstValue(searchParams?.contactMethod) || firstValue(searchParams?.q5);

  const englishParam =
    firstValue(searchParams?.englishPreference) || firstValue(searchParams?.q7);

  return {
    situation: firstValue(searchParams?.situation)
      ? parseSituation(firstValue(searchParams?.situation))
      : mapQ1ToSituation(situationParam),

    urgency: firstValue(searchParams?.urgency)
      ? parseUrgency(firstValue(searchParams?.urgency))
      : mapQ2ToUrgency(urgencyParam),

    hasRealEstate: parseRealEstate(firstValue(searchParams?.hasRealEstate)),
    preferredArea,

    contactMethod: firstValue(searchParams?.contactMethod)
      ? parseContactMethod(firstValue(searchParams?.contactMethod))
      : mapQ5ToContactMethod(contactParam),

    primaryConcern: parsePrimaryConcern(firstValue(searchParams?.primaryConcern)),

    englishPreference: firstValue(searchParams?.englishPreference)
      ? parseEnglishPreference(firstValue(searchParams?.englishPreference))
      : mapQ7ToEnglishPreference(englishParam),
  };
}

function createEphemeralSessionId(area: string, category: string): string {
  const randomPart =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  return `demo-${area}-${category}-${randomPart}`;
}

function buildSessionId(
  area: string,
  category: string,
  searchParams?: Record<string, string | string[] | undefined>
) {
  const fromQuery =
    firstValue(searchParams?.sid) || firstValue(searchParams?.sessionId);

  if (fromQuery) return fromQuery;

  return createEphemeralSessionId(area, category);
}

export default async function DemoResultsPage({
  params,
  searchParams,
}: PageProps) {
  const { area, category } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;

  const answers = buildAnswers(area, resolvedSearchParams);
  const sessionId = buildSessionId(area, category, resolvedSearchParams);

  const offices = await getDemoOffices();

  const result = matchOffices({
    answers,
    offices,
    sessionId,
  });

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center" aria-label="つぎの手ナビ">
            <Image
              src="/images/tsuginote-logo.png"
              alt="つぎの手ナビ"
              width={180}
              height={44}
              className="h-auto w-[150px] sm:w-[180px]"
              priority
            />
          </div>

          <BackButton
            fallbackHref={`/demo/${area}/${category}`}
            label="戻る"
            className="text-sm font-medium text-slate-600 underline underline-offset-4"
          />
        </div>
      </header>

      <section className="mx-auto max-w-4xl px-4 py-4 sm:px-6 sm:py-6">
        <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
          <p className="font-semibold">営業用デモ表示です</p>
          <p className="mt-1">
            この画面は掲載イメージです。表示中の事務所情報は営業説明用のサンプルで、公開用の掲載事務所ではありません。
          </p>
        </div>

        <ResultsListClient
          items={result.offices}
          answers={answers}
          area={area}
          category={category}
          sessionId={sessionId}
        />
      </section>

      <SiteFooter />
    </main>
  );
}