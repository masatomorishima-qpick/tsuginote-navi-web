import type {
  Office,
  OfficeCardLabel,
  OfficePriorityFlag,
} from "@/types/office";
import type {
  SurveyAnswers,
  SurveyContactMethod,
  SurveyPrimaryConcern,
  SurveySituation,
} from "@/types/survey";

type SituationConfig = {
  lead: string;
  primaryFlag: OfficePriorityFlag;
  secondaryFlag: OfficePriorityFlag;
  primaryLabel: OfficeCardLabel;
  secondaryLabel: OfficeCardLabel;
};

export type MatchedOffice = {
  office: Office;
  score: number;
  badges: OfficeCardLabel[];
  matchedReasons: OfficeCardLabel[];
};

export type MatchingResult = {
  title: string;
  lead: string;
  notes: string[];
  disclosure: string;
  offices: MatchedOffice[];
};

const ENGLISH_MATCH_BONUS = 18;

const SITUATION_CONFIG: Record<SurveySituation, SituationConfig> = {
  family_conflict: {
    lead: "家族間の対立がある相談への対応情報を掲載している事務所を優先して表示しています。",
    primaryFlag: "familyConflictSupport",
    secondaryFlag: "inPersonConsultationAvailable",
    primaryLabel: "家族間の対立がある相談に対応可能",
    secondaryLabel: "面談相談可",
  },
  not_conflicting_yet: {
    lead: "まず状況整理から相談できる掲載情報がある事務所を優先して表示しています。",
    primaryFlag: "situationOrganizingSupport",
    secondaryFlag: "emailConsultationAvailable",
    primaryLabel: "まず状況整理から相談可能",
    secondaryLabel: "メール相談可",
  },
  billing_concern: {
    lead: "請求や負債の不安を含む相談への対応情報がある事務所を優先して表示しています。",
    primaryFlag: "billingConcernSupport",
    secondaryFlag: "handlesInheritanceRenunciation",
    primaryLabel: "請求不安を含む相談に対応可能",
    secondaryLabel: "相続放棄取扱い",
  },
  deadline_urgent: {
    lead: "急ぎ相談の受付情報がある事務所を優先して表示しています。",
    primaryFlag: "urgentConsultationAvailable",
    secondaryFlag: "phoneConsultationAvailable",
    primaryLabel: "急ぎ相談の受付情報あり",
    secondaryLabel: "電話相談可",
  },
  not_organized_yet: {
    lead: "まず状況整理から相談できる掲載情報がある事務所を優先して表示しています。",
    primaryFlag: "situationOrganizingSupport",
    secondaryFlag: "emailConsultationAvailable",
    primaryLabel: "まず状況整理から相談可能",
    secondaryLabel: "メール相談可",
  },
};

const CONCERN_NOTE_MAP: Record<SurveyPrimaryConcern, string> = {
  deadline:
    "期限の確認を優先したい回答のため、急ぎ相談の受付情報と連絡方法の情報を表示順に反映しています。",
  preparation:
    "相談前に確認事項を整理したい回答のため、状況整理に関する掲載情報を表示順に反映しています。",
  cost:
    "費用感を確認したい回答のため、掲載情報の確認時に費用案内も見比べやすくしています。",
  who_to_contact:
    "まず誰に相談するか整理したい回答のため、状況整理と連絡方法の情報を表示順に反映しています。",
};

function safeText(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function stableHash(input: string): number {
  let hash = 0;

  for (let index = 0; index < input.length; index += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(index);
    hash |= 0;
  }

  return Math.abs(hash);
}

function getRotationDateKey(): string {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const day = String(now.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getDailyTieBreaker(
  sessionId: string,
  officeId: string,
  dateKey: string
): number {
  return stableHash(`${dateKey}:${sessionId}:${officeId}`);
}

function uniqueLabels(labels: OfficeCardLabel[]): OfficeCardLabel[] {
  return Array.from(new Set(labels));
}

function getContactBoostFlag(
  contactMethod: SurveyContactMethod
): OfficePriorityFlag | null {
  switch (contactMethod) {
    case "phone":
      return "phoneConsultationAvailable";
    case "email":
      return "emailConsultationAvailable";
    case "line":
      return "lineConsultationAvailable";
    case "either":
      return null;
    default:
      return null;
  }
}

function getContactLabel(
  contactMethod: SurveyContactMethod
): OfficeCardLabel | null {
  switch (contactMethod) {
    case "phone":
      return "電話相談可";
    case "email":
      return "メール相談可";
    case "line":
      return "LINE相談可";
    case "either":
      return null;
    default:
      return null;
  }
}

function buildFallbackLabels(office: Office): OfficeCardLabel[] {
  const labels: OfficeCardLabel[] = [];

  if (office.initialFreeConsultation) {
    labels.push("初回相談無料");
  }

  if (office.weekendConsultationAvailable) {
    labels.push("土日相談可");
  }

  if (office.nightConsultationAvailable) {
    labels.push("夜間相談可");
  }

  if (office.hasFeeInfo) {
    labels.push("費用感に関する情報あり");
  }

  if (office.lineConsultationAvailable) {
    labels.push("LINE相談可");
  }

  if (office.phoneConsultationAvailable) {
    labels.push("電話相談可");
  }

  if (office.emailConsultationAvailable) {
    labels.push("メール相談可");
  }

  if (office.supportsTokyo) {
    labels.push("東京対応");
  }

  if (office.handlesInheritanceRenunciation) {
    labels.push("相続放棄取扱い");
  }

  if (office.acceptingNewCases) {
    labels.push("受付中");
  }

  if (office.englishConsultationAvailable) {
    labels.push("英語相談可");
  }

  return uniqueLabels(labels);
}

function buildBadges(
  matchedReasons: OfficeCardLabel[],
  office: Office
): OfficeCardLabel[] {
  const merged = uniqueLabels([...matchedReasons, ...buildFallbackLabels(office)]);
  return merged.slice(0, 2);
}

function buildNotes(answers: Partial<SurveyAnswers>): string[] {
  const notes: string[] = [];
  const primaryConcern = answers.primaryConcern ?? "who_to_contact";

  notes.push(CONCERN_NOTE_MAP[primaryConcern]);

  if (answers.hasRealEstate === "yes") {
    notes.push("不動産がある場合は、追加で確認が必要になることがあります。");
  }

  if (answers.englishPreference === "want_english") {
    notes.push(
      "英語で相談したい回答のため、英語相談可の掲載情報がある事務所を表示順に反映しています。"
    );
  }

  return notes;
}

function scoreOffice(
  office: Office,
  answers: Partial<SurveyAnswers>
): MatchedOffice {
  const situation = answers.situation ?? "not_organized_yet";
  const contactMethod = answers.contactMethod ?? "either";
  const urgency = answers.urgency ?? "just_collecting_info";
  const englishPreference = answers.englishPreference ?? "no_preference";

  const config = SITUATION_CONFIG[situation];
  const matchedReasons: OfficeCardLabel[] = [];
  let score = 0;

  // Step2〜4: 相談整理タイプ・優先ラベル判定
  if (office[config.primaryFlag]) {
    score += 100;
    matchedReasons.push(config.primaryLabel);
  }

  if (office[config.secondaryFlag]) {
    score += 30;
    matchedReasons.push(config.secondaryLabel);
  }

  // Step5: 急ぎ補正
  if (urgency === "today_or_few_days" && office.urgentConsultationAvailable) {
    score += 20;
    matchedReasons.push("急ぎ相談の受付情報あり");
  }

  // Step6: 連絡方法補正
  const contactBoostFlag = getContactBoostFlag(contactMethod);
  const contactLabel = getContactLabel(contactMethod);

  if (contactBoostFlag && office[contactBoostFlag]) {
    score += 15;
    if (contactLabel) {
      matchedReasons.push(contactLabel);
    }
  }

  // Step7: 英語対応補正
  if (
    englishPreference === "want_english" &&
    office.englishConsultationAvailable
  ) {
    score += ENGLISH_MATCH_BONUS;
    matchedReasons.push("英語相談可");
  }

  return {
    office,
    score,
    badges: buildBadges(matchedReasons, office),
    matchedReasons: uniqueLabels(matchedReasons),
  };
}

function sortSameScoreGroupDaily(params: {
  items: MatchedOffice[];
  sessionId: string;
  dateKey: string;
}): MatchedOffice[] {
  const { items, sessionId, dateKey } = params;

  return [...items].sort((left, right) => {
    const leftTie = getDailyTieBreaker(sessionId, left.office.id, dateKey);
    const rightTie = getDailyTieBreaker(sessionId, right.office.id, dateKey);

    if (leftTie !== rightTie) {
      return leftTie - rightTie;
    }

    return left.office.id.localeCompare(right.office.id);
  });
}

function sortMatchedOfficesWithDailyRotation(params: {
  items: MatchedOffice[];
  sessionId: string;
}): MatchedOffice[] {
  const { items, sessionId } = params;
  const dateKey = getRotationDateKey();

  // スコア帯ごとにまとめる
  const grouped = new Map<number, MatchedOffice[]>();

  for (const item of items) {
    const current = grouped.get(item.score) ?? [];
    current.push(item);
    grouped.set(item.score, current);
  }

  // 高スコア帯から順に並べ、同点グループ内だけ日替わりローテーション
  const sortedScores = Array.from(grouped.keys()).sort((a, b) => b - a);
  const result: MatchedOffice[] = [];

  for (const score of sortedScores) {
    const sameScoreGroup = grouped.get(score) ?? [];
    const rotatedGroup = sortSameScoreGroupDaily({
      items: sameScoreGroup,
      sessionId,
      dateKey,
    });

    result.push(...rotatedGroup);
  }

  return result;
}

export function matchOffices(params: {
  answers: Partial<SurveyAnswers>;
  offices: Office[];
  sessionId: string;
}): MatchingResult {
  const { answers, offices, sessionId } = params;
  const situation = answers.situation ?? "not_organized_yet";
  const config = SITUATION_CONFIG[situation];

  // Step1: 表示対象判定
  const filtered = offices.filter((office) => {
    return (
      office.supportsTokyo &&
      office.handlesInheritanceRenunciation &&
      office.acceptingNewCases
    );
  });

  // Step2〜7: スコア算出
  const scored = filtered.map((office) => scoreOffice(office, answers));

  // Step8: 同点グループ単位で日替わりローテーション
  const matched = sortMatchedOfficesWithDailyRotation({
    items: scored,
    sessionId,
  });

  return {
    title: "回答内容と掲載情報をもとに、条件に合う掲載事務所の情報を表示しています",
    lead: config.lead,
    notes: buildNotes(answers),
    disclosure:
      "表示順は回答内容と掲載情報によるもので、支払額や動画の有無では変わりません。同点の掲載事務所は日替わりで順番が入れ替わることがあります。",
    offices: matched,
  };
}