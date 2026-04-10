import type { SurveyAnswers } from '@/types/survey';

export type SurveyResponsePayload = {
  sessionId: string;
  area: string;
  category: string;
  answers: SurveyAnswers;
  resultCount: number;
};

export async function postSurveyResponse(payload: SurveyResponsePayload) {
  try {
    await fetch('/api/survey/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      keepalive: true,
    });
  } catch {
    // PoCでは画面遷移を優先
  }
}