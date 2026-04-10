import type { Office } from '@/types/office';
import type { SurveyAnswers } from '@/types/survey';
import {
  SURVEY_CONTACT_METHOD_LABELS,
  SURVEY_PRIMARY_CONCERN_LABELS,
  SURVEY_REAL_ESTATE_LABELS,
  SURVEY_SITUATION_LABELS,
  SURVEY_URGENCY_LABELS,
} from '@/types/survey';

export function buildOfficeMailtoHref(
  office: Office,
  answers: SurveyAnswers
): string {
  if (!office.emailAddress) {
    return '';
  }

  const subject = encodeURIComponent('相続放棄の相談について');

  const bodyLines = [
    `${office.officeName} ご担当者さま`,
    '',
    'つぎの手ナビを見てご連絡しました。',
    '相続放棄について相談したく、初回連絡です。',
    '',
    `現在の状況: ${SURVEY_SITUATION_LABELS[answers.situation]}`,
    `急ぎ度: ${SURVEY_URGENCY_LABELS[answers.urgency]}`,
    `不動産: ${SURVEY_REAL_ESTATE_LABELS[answers.hasRealEstate]}`,
    `希望連絡方法: ${SURVEY_CONTACT_METHOD_LABELS[answers.contactMethod]}`,
    `いちばん知りたいこと: ${SURVEY_PRIMARY_CONCERN_LABELS[answers.primaryConcern]}`,
    '',
    'ご確認よろしくお願いいたします。',
  ];

  const body = encodeURIComponent(bodyLines.join('\n'));

  return `mailto:${office.emailAddress}?subject=${subject}&body=${body}`;
}

export function buildOfficeTelHref(phoneNumber: string): string {
  const normalized = phoneNumber.replace(/[^\d+]/g, '');
  return normalized ? `tel:${normalized}` : '';
}

export function buildOfficeLineHref(lineUrl: string): string {
  return lineUrl.trim();
}