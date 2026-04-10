export type OfficeRow = {
  id: string;
  slug: string;
  office_name: string;
  short_description: string;
  area_text: string;
  supported_areas: string[] | null;
  nearest_station: string;
  reception_hours: string;
  fee_info_text: string;
  main_image_url: string;
  intro_video_url: string;
  lawyer_playlist_url: string;
  phone_number: string;
  email_address: string;
  line_url: string;
  office_website_url: string;
  is_published: boolean;

  supports_tokyo: boolean;
  handles_inheritance_renunciation: boolean;

  phone_consultation_available: boolean;
  in_person_consultation_available: boolean;
  email_consultation_available: boolean;
  line_consultation_available: boolean;
  english_consultation_available: boolean;

  accepting_new_cases: boolean;
  urgent_consultation_available: boolean;

  family_conflict_support: boolean;
  situation_organizing_support: boolean;
  billing_concern_support: boolean;

  initial_free_consultation: boolean;
  weekend_consultation_available: boolean;
  night_consultation_available: boolean;
  has_fee_info: boolean;

  created_at: string;
  updated_at: string;
};

export type Office = {
  id: string;
  slug: string;
  officeName: string;
  shortDescription: string;
  areaText: string;
  supportedAreas: string[];
  nearestStation: string;
  receptionHours: string;
  feeInfoText: string;
  mainImageUrl: string;
  introVideoUrl: string;
  lawyerPlaylistUrl: string;
  phoneNumber: string;
  emailAddress: string;
  lineUrl: string;
  officeWebsiteUrl: string;
  isPublished: boolean;

  supportsTokyo: boolean;
  handlesInheritanceRenunciation: boolean;

  phoneConsultationAvailable: boolean;
  inPersonConsultationAvailable: boolean;
  emailConsultationAvailable: boolean;
  lineConsultationAvailable: boolean;
  englishConsultationAvailable: boolean;

  acceptingNewCases: boolean;
  urgentConsultationAvailable: boolean;

  familyConflictSupport: boolean;
  situationOrganizingSupport: boolean;
  billingConcernSupport: boolean;

  initialFreeConsultation: boolean;
  weekendConsultationAvailable: boolean;
  nightConsultationAvailable: boolean;
  hasFeeInfo: boolean;

  createdAt: string;
  updatedAt: string;
};

export type OfficePriorityFlag =
  | "familyConflictSupport"
  | "situationOrganizingSupport"
  | "billingConcernSupport"
  | "urgentConsultationAvailable"
  | "phoneConsultationAvailable"
  | "inPersonConsultationAvailable"
  | "emailConsultationAvailable"
  | "lineConsultationAvailable"
  | "englishConsultationAvailable"
  | "supportsTokyo"
  | "handlesInheritanceRenunciation";

export type OfficeCardLabel =
  | "東京対応"
  | "相続放棄取扱い"
  | "電話相談可"
  | "面談相談可"
  | "メール相談可"
  | "LINE相談可"
  | "英語相談可"
  | "受付中"
  | "急ぎ相談の受付情報あり"
  | "家族間の対立がある相談に対応可能"
  | "まず状況整理から相談可能"
  | "請求不安を含む相談に対応可能"
  | "初回相談無料"
  | "土日相談可"
  | "夜間相談可"
  | "費用感に関する情報あり";