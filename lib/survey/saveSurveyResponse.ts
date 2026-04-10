import 'server-only';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { SurveyAnswers } from '@/types/survey';

type SaveSurveyResponseParams = {
  sessionId: string;
  area: string;
  category: string;
  answers: SurveyAnswers;
  resultCount: number;
};

export async function saveSurveyResponse({
  sessionId,
  area,
  category,
  answers,
  resultCount,
}: SaveSurveyResponseParams) {
  if (!sessionId || !area || !category) {
    console.warn('[saveSurveyResponse] skipped: missing required fields', {
      sessionId,
      area,
      category,
    });
    return;
  }

  try {
    const supabase = await createServerSupabaseClient();

    const { error } = await supabase.from('survey_responses').insert({
      session_id: sessionId,
      area,
      category,
      answers,
      result_count: resultCount,
    });

    if (error) {
      console.error('[saveSurveyResponse] insert failed', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      return;
    }

    console.log('[saveSurveyResponse] inserted', {
      sessionId,
      area,
      category,
      resultCount,
    });
  } catch (error) {
    console.error('[saveSurveyResponse] unexpected error', error);
  }
}