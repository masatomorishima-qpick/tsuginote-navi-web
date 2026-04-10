"use client";

import {
  Clock3,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  PlayCircle,
  Tag,
} from "lucide-react";
import type { Office, OfficeCardLabel } from "@/types/office";
import type { SurveyAnswers } from "@/types/survey";
import {
  buildOfficeLineHref,
  buildOfficeMailtoHref,
  buildOfficeTelHref,
} from "@/lib/utils/mailto";
import { trackAppEvent } from "@/lib/analytics/trackAppEvent";

type OfficeCardProps = {
  office: Office;
  answers: SurveyAnswers;
  badges?: OfficeCardLabel[];
  matchedReasons?: OfficeCardLabel[];
  area: string;
  category: string;
  sessionId: string;
};

const MAX_MATCHED_REASON_COUNT = 3;

function uniqueLabels(labels: OfficeCardLabel[]) {
  return Array.from(new Set(labels));
}

function buildDisplayLabels(
  office: Office,
  badges: OfficeCardLabel[] = []
): OfficeCardLabel[] {
  const fallback: OfficeCardLabel[] = [];

  if (office.supportsTokyo) fallback.push("東京対応");
  if (office.handlesInheritanceRenunciation) fallback.push("相続放棄取扱い");
  if (office.acceptingNewCases) fallback.push("受付中");
  if (office.urgentConsultationAvailable) fallback.push("急ぎ相談の受付情報あり");
  if (office.phoneConsultationAvailable) fallback.push("電話相談可");
  if (office.inPersonConsultationAvailable) fallback.push("面談相談可");
  if (office.emailConsultationAvailable) fallback.push("メール相談可");
  if (office.lineConsultationAvailable) fallback.push("LINE相談可");
  if (office.familyConflictSupport) {
    fallback.push("家族間の対立がある相談に対応可能");
  }
  if (office.situationOrganizingSupport) {
    fallback.push("まず状況整理から相談可能");
  }
  if (office.billingConcernSupport) {
    fallback.push("請求不安を含む相談に対応可能");
  }
  if (office.initialFreeConsultation) fallback.push("初回相談無料");
  if (office.weekendConsultationAvailable) fallback.push("土日相談可");
  if (office.nightConsultationAvailable) fallback.push("夜間相談可");
  if (office.hasFeeInfo) fallback.push("費用感に関する情報あり");

  return uniqueLabels([...(badges ?? []), ...fallback]);
}

function isHttpUrl(url: string) {
  return url.startsWith("http://") || url.startsWith("https://");
}

function toYouTubeEmbedUrl(url: string) {
  if (!url) return "";

  try {
    const parsed = new URL(url);

    if (parsed.hostname.includes("youtube.com")) {
      const list = parsed.searchParams.get("list");
      const videoId = parsed.searchParams.get("v");

      if (videoId && list) {
        return `https://www.youtube.com/embed/${videoId}?list=${list}`;
      }

      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }

      if (list) {
        return `https://www.youtube.com/embed/videoseries?list=${list}`;
      }
    }

    if (parsed.hostname.includes("youtu.be")) {
      const videoId = parsed.pathname.replace("/", "");
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    }

    return "";
  } catch {
    return "";
  }
}

function getVideoSectionSource(office: Office) {
  const introEmbedUrl = toYouTubeEmbedUrl(office.introVideoUrl);
  if (introEmbedUrl) {
    return {
      type: "embed" as const,
      url: introEmbedUrl,
      linkUrl: office.introVideoUrl,
    };
  }

  const playlistEmbedUrl = toYouTubeEmbedUrl(office.lawyerPlaylistUrl);
  if (playlistEmbedUrl) {
    return {
      type: "embed" as const,
      url: playlistEmbedUrl,
      linkUrl: office.lawyerPlaylistUrl,
    };
  }

  if (office.introVideoUrl) {
    return {
      type: "link" as const,
      url: office.introVideoUrl,
      linkUrl: office.introVideoUrl,
    };
  }

  if (office.lawyerPlaylistUrl) {
    return {
      type: "link" as const,
      url: office.lawyerPlaylistUrl,
      linkUrl: office.lawyerPlaylistUrl,
    };
  }

  return null;
}

export default function OfficeCard({
  office,
  answers,
  badges = [],
  matchedReasons = [],
  area,
  category,
  sessionId,
}: OfficeCardProps) {
  const lineHref = office.lineUrl ? buildOfficeLineHref(office.lineUrl) : "";
  const telHref = office.phoneNumber ? buildOfficeTelHref(office.phoneNumber) : "";
  const mailHref = office.emailAddress
    ? buildOfficeMailtoHref(office, answers)
    : "";

  const displayLabels = buildDisplayLabels(office, badges);
  const videoSource = getVideoSectionSource(office);
  const playlistHref = office.lawyerPlaylistUrl?.trim() ?? "";
  const displayMatchedReasons = uniqueLabels(matchedReasons).slice(
    0,
    MAX_MATCHED_REASON_COUNT
  );
  const wantsEnglish = answers.englishPreference === "want_english";

  function safeTrack(
    eventName: Parameters<typeof trackAppEvent>[0],
    params?: Parameters<typeof trackAppEvent>[1]
  ) {
    try {
      trackAppEvent(eventName, params);
    } catch (error) {
      console.error("[OfficeCard] track failed", eventName, error);
    }
  }

  const trackVideoLinkClick = () => {
    safeTrack("office_video_link_clicked", {
      area,
      category,
      session_id: sessionId,
      office_id: office.id,
      target: "youtube",
    });
  };

  const trackLawyerPlaylistClick = () => {
    safeTrack("office_video_link_clicked", {
      area,
      category,
      session_id: sessionId,
      office_id: office.id,
      target: "lawyer_playlist",
    });
  };

  const trackOfficeContactClick = (
    contactMethod: "line" | "phone" | "email"
  ) => {
    safeTrack("office_contact_click", {
      area,
      category,
      session_id: sessionId,
      office_id: office.id,
      contact_method: contactMethod,
    });
  };

  const trackOfficeWebsiteClick = () => {
    safeTrack("office_website_click", {
      area,
      category,
      session_id: sessionId,
      office_id: office.id,
    });
  };

  return (
    <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="p-5 sm:p-6">
        <p className="text-xs font-medium tracking-wide text-slate-500">
          掲載事務所の情報
        </p>

        <h2 className="mt-2 text-xl font-bold leading-tight text-slate-900 sm:text-2xl">
          {office.officeName}
        </h2>

        <div className="mt-3 flex flex-wrap gap-2">
          {office.englishConsultationAvailable ? (
            <span className="inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-3 py-1.5 text-xs font-semibold text-sky-700">
              英語相談可
            </span>
          ) : null}

          {wantsEnglish && !office.englishConsultationAvailable ? (
            <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600">
              英語相談の記載なし
            </span>
          ) : null}
        </div>

        <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
          {office.mainImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={office.mainImageUrl}
              alt={office.officeName}
              className="h-52 w-full object-cover sm:h-64"
            />
          ) : (
            <div className="flex h-52 w-full items-center justify-center bg-slate-100 text-sm text-slate-500 sm:h-64">
              掲載画像は準備中です
            </div>
          )}
        </div>

        {office.shortDescription ? (
          <p className="mt-4 text-sm leading-7 text-slate-700 sm:text-base">
            {office.shortDescription}
          </p>
        ) : null}

        <div className="mt-5 grid gap-3 rounded-2xl bg-slate-50 p-4">
          <div className="flex items-start gap-3">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
            <div className="text-sm text-slate-700">
              <span className="font-medium text-slate-900">対応エリア：</span>
              {office.areaText || "掲載情報をご確認ください"}
            </div>
          </div>

          <div className="flex items-start gap-3">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
            <div className="text-sm text-slate-700">
              <span className="font-medium text-slate-900">最寄り：</span>
              {office.nearestStation || "掲載情報をご確認ください"}
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
            <div className="text-sm text-slate-700">
              <span className="font-medium text-slate-900">受付時間：</span>
              {office.receptionHours || "掲載情報をご確認ください"}
            </div>
          </div>
        </div>

        {displayLabels.length > 0 ? (
          <section className="mt-5">
            <div className="mb-2 flex items-center gap-2">
              <Tag className="h-4 w-4 text-slate-500" />
              <h3 className="text-sm font-semibold text-slate-900">掲載情報</h3>
            </div>

            <div className="flex flex-wrap gap-2">
              {displayLabels.map((label) => (
                <span
                  key={label}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700"
                >
                  {label}
                </span>
              ))}
            </div>
          </section>
        ) : null}

        {office.feeInfoText ? (
          <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
            <h3 className="text-sm font-semibold text-slate-900">
              費用感に関する情報
            </h3>
            <p className="mt-2 text-sm leading-7 text-slate-700">
              {office.feeInfoText}
            </p>
          </section>
        ) : null}

        {displayMatchedReasons.length > 0 ? (
          <section className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            <h3 className="text-sm font-semibold text-emerald-900">
              表示順に反映した掲載情報
            </h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {displayMatchedReasons.map((reason) => (
                <span
                  key={reason}
                  className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-emerald-800 ring-1 ring-emerald-200"
                >
                  {reason}
                </span>
              ))}
            </div>
          </section>
        ) : null}

        <section className="mt-6">
          <div className="mb-2 flex items-center gap-2">
            <PlayCircle className="h-4 w-4 text-slate-500" />
            <h3 className="text-sm font-semibold text-slate-900">
              事務所紹介動画
            </h3>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
            {videoSource?.type === "embed" ? (
              <iframe
                className="aspect-video w-full"
                src={videoSource.url}
                title={`${office.officeName} 事務所紹介動画`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : videoSource?.type === "link" ? (
              <div className="p-4">
                <a
                  href={videoSource.linkUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={trackVideoLinkClick}
                  className="inline-flex items-center gap-2 text-sm font-medium text-slate-900 underline underline-offset-4"
                >
                  YouTubeで見る
                </a>
              </div>
            ) : (
              <div className="flex h-40 items-center justify-center px-4 text-sm text-slate-500">
                動画の掲載は準備中です
              </div>
            )}
          </div>

          {playlistHref ? (
            <div className="mt-3">
              <a
                href={playlistHref}
                target="_blank"
                rel="noreferrer"
                onClick={trackLawyerPlaylistClick}
                className="text-sm font-medium text-slate-700 underline underline-offset-4"
              >
                所属弁護士の動画一覧を見る
              </a>
            </div>
          ) : null}
        </section>

        <section className="mt-6">
          <h3 className="text-sm font-semibold text-slate-900">連絡方法</h3>

          <div className="mt-3 grid gap-3">
            {lineHref ? (
              <a
                href={lineHref}
                target={isHttpUrl(lineHref) ? "_blank" : undefined}
                rel={isHttpUrl(lineHref) ? "noreferrer" : undefined}
                onClick={() => trackOfficeContactClick("line")}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                <MessageCircle className="h-4 w-4" />
                LINE相談
              </a>
            ) : null}

            {telHref ? (
              <a
                href={telHref}
                onClick={() => trackOfficeContactClick("phone")}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                <Phone className="h-4 w-4" />
                電話相談
              </a>
            ) : null}

            {mailHref ? (
              <a
                href={mailHref}
                onClick={() => trackOfficeContactClick("email")}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
              >
                <Mail className="h-4 w-4" />
                メール相談
              </a>
            ) : null}
          </div>

          {!lineHref && !telHref && !mailHref ? (
            <p className="mt-3 text-sm text-slate-600">
              連絡方法の掲載がない場合は、事務所の公式情報をご確認ください。
            </p>
          ) : null}
        </section>

        {office.officeWebsiteUrl ? (
          <div className="mt-5">
            <a
              href={office.officeWebsiteUrl}
              target="_blank"
              rel="noreferrer"
              onClick={trackOfficeWebsiteClick}
              className="text-sm font-medium text-slate-700 underline underline-offset-4"
            >
              事務所の公式情報を見る
            </a>
          </div>
        ) : null}
      </div>
    </article>
  );
}