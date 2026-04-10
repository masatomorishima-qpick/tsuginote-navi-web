import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Office } from "@/types/office";

type ExistingOfficeRow = {
  id: string;
  name: string;
  short_description: string | null;
  is_accepting: boolean | null;
  is_published: boolean | null;
  contact_phone: string | null;
  contact_email: string | null;
  contact_line_url: string | null;
  has_phone_consult: boolean | null;
  has_email_contact: boolean | null;
  has_line_contact: boolean | null;
  website_url: string | null;

  main_image_url: string | null;
  intro_video_url: string | null;
  lawyer_playlist_url: string | null;
  area_text: string | null;
  nearest_station: string | null;
  reception_hours: string | null;
  fee_info_text: string | null;

  supports_tokyo: boolean | null;
  handles_inheritance_renunciation: boolean | null;

  phone_consultation_available: boolean | null;
  in_person_consultation_available: boolean | null;
  email_consultation_available: boolean | null;
  line_consultation_available: boolean | null;
  english_consultation_available: boolean | null;

  accepting_new_cases: boolean | null;
  urgent_consultation_available: boolean | null;

  family_conflict_support: boolean | null;
  situation_organizing_support: boolean | null;
  billing_concern_support: boolean | null;

  initial_free_consultation: boolean | null;
  weekend_consultation_available: boolean | null;
  night_consultation_available: boolean | null;
  has_fee_info: boolean | null;
};

const OFFICE_SELECT = `
  id,
  name,
  short_description,
  is_accepting,
  is_published,
  contact_phone,
  contact_email,
  contact_line_url,
  has_phone_consult,
  has_email_contact,
  has_line_contact,
  website_url,
  main_image_url,
  intro_video_url,
  lawyer_playlist_url,
  area_text,
  nearest_station,
  reception_hours,
  fee_info_text,
  supports_tokyo,
  handles_inheritance_renunciation,
  phone_consultation_available,
  in_person_consultation_available,
  email_consultation_available,
  line_consultation_available,
  english_consultation_available,
  accepting_new_cases,
  urgent_consultation_available,
  family_conflict_support,
  situation_organizing_support,
  billing_concern_support,
  initial_free_consultation,
  weekend_consultation_available,
  night_consultation_available,
  has_fee_info
`;

function mapOfficeRow(row: ExistingOfficeRow): Office {
  return {
    id: row.id,
    slug: row.id,
    officeName: row.name,
    shortDescription: row.short_description ?? "",
    areaText: row.area_text ?? "東京対応",
    supportedAreas: ["東京"],
    nearestStation: row.nearest_station ?? "",
    receptionHours: row.reception_hours ?? "",
    feeInfoText: row.fee_info_text ?? "",
    mainImageUrl: row.main_image_url ?? "",
    introVideoUrl: row.intro_video_url ?? "",
    lawyerPlaylistUrl: row.lawyer_playlist_url ?? "",
    phoneNumber: row.contact_phone ?? "",
    emailAddress: row.contact_email ?? "",
    lineUrl: row.contact_line_url ?? "",
    officeWebsiteUrl: row.website_url ?? "",
    isPublished: row.is_published ?? false,

    // Step1に関わるので null は false にする
    supportsTokyo: row.supports_tokyo ?? false,
    handlesInheritanceRenunciation:
      row.handles_inheritance_renunciation ?? false,

    phoneConsultationAvailable:
      row.phone_consultation_available ?? row.has_phone_consult ?? false,
    inPersonConsultationAvailable:
      row.in_person_consultation_available ?? false,
    emailConsultationAvailable:
      row.email_consultation_available ?? row.has_email_contact ?? false,
    lineConsultationAvailable:
      row.line_consultation_available ?? row.has_line_contact ?? false,
    englishConsultationAvailable:
      row.english_consultation_available ?? false,

    acceptingNewCases: row.accepting_new_cases ?? row.is_accepting ?? false,
    urgentConsultationAvailable:
      row.urgent_consultation_available ?? false,

    familyConflictSupport: row.family_conflict_support ?? false,
    situationOrganizingSupport:
      row.situation_organizing_support ?? false,
    billingConcernSupport: row.billing_concern_support ?? false,

    initialFreeConsultation:
      row.initial_free_consultation ?? false,
    weekendConsultationAvailable:
      row.weekend_consultation_available ?? false,
    nightConsultationAvailable:
      row.night_consultation_available ?? false,
    hasFeeInfo: row.has_fee_info ?? false,

    createdAt: "",
    updatedAt: "",
  };
}

export async function getPublishedOffices(): Promise<Office[]> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("offices")
    .select(OFFICE_SELECT)
    .eq("is_published", true);

  if (error) {
    console.error("[getPublishedOffices] failed", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });

    throw new Error(
      `事務所データの取得に失敗しました: ${error.message}${
        error.details ? ` / ${error.details}` : ""
      }`
    );
  }

  return ((data ?? []) as ExistingOfficeRow[]).map(mapOfficeRow);
}