export type SurveySituation =
  | "family_conflict"
  | "not_conflicting_yet"
  | "billing_concern"
  | "deadline_urgent"
  | "not_organized_yet";

export type SurveyUrgency =
  | "today_or_few_days"
  | "within_1_2_weeks"
  | "within_1_month"
  | "just_collecting_info";

export type SurveyRealEstate = "yes" | "no" | "unknown";

export type SurveyContactMethod = "phone" | "email" | "line" | "either";

export type SurveyPrimaryConcern =
  | "deadline"
  | "preparation"
  | "cost"
  | "who_to_contact";

export type SurveyEnglishPreference =
  | "want_english"
  | "no_preference";

export type SurveyAnswers = {
  situation: SurveySituation;
  urgency: SurveyUrgency;
  hasRealEstate: SurveyRealEstate;
  preferredArea: string;
  contactMethod: SurveyContactMethod;
  primaryConcern: SurveyPrimaryConcern;
  englishPreference: SurveyEnglishPreference;
};

export const SURVEY_SITUATION_LABELS: Record<SurveySituation, string> = {
  family_conflict: "家族で揉めている",
  not_conflicting_yet: "まだ揉めていない",
  billing_concern: "借金や請求が気になる",
  deadline_urgent: "期限が迫っている",
  not_organized_yet: "まだ整理できていない",
};

export const SURVEY_URGENCY_LABELS: Record<SurveyUrgency, string> = {
  today_or_few_days: "今日〜数日以内",
  within_1_2_weeks: "1〜2週間以内",
  within_1_month: "1か月以内",
  just_collecting_info: "まず情報収集したい",
};

export const SURVEY_REAL_ESTATE_LABELS: Record<SurveyRealEstate, string> = {
  yes: "ある",
  no: "ない",
  unknown: "分からない",
};

export const SURVEY_CONTACT_METHOD_LABELS: Record<SurveyContactMethod, string> = {
  phone: "電話",
  email: "メール",
  line: "LINE",
  either: "どちらでもよい",
};

export const SURVEY_PRIMARY_CONCERN_LABELS: Record<SurveyPrimaryConcern, string> = {
  deadline: "期限に間に合うか",
  preparation: "何を準備すべきか",
  cost: "費用感",
  who_to_contact: "まず誰に相談すべきか",
};

export const SURVEY_ENGLISH_PREFERENCE_LABELS: Record<SurveyEnglishPreference, string> = {
  want_english: "希望する",
  no_preference: "こだわらない",
};