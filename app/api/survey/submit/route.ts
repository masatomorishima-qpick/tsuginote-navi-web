import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

type SurveySubmitPayload = {
  sessionId?: unknown;
  area?: unknown;
  category?: unknown;
  answers?: unknown;
  resultCount?: unknown;
};

function safeString(value: unknown, maxLength = 200): string {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, maxLength);
}

function safeInteger(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.max(0, Math.floor(value));
  }

  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return Math.max(0, Math.floor(parsed));
    }
  }

  return 0;
}

function sanitizeAnswers(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }

  try {
    const normalized = JSON.parse(JSON.stringify(value));
    if (!normalized || typeof normalized !== 'object' || Array.isArray(normalized)) {
      return {};
    }

    const allowedKeys = [
      'situation',
      'urgency',
      'hasRealEstate',
      'preferredArea',
      'contactMethod',
      'primaryConcern',
    ];

    const result: Record<string, unknown> = {};

    for (const key of allowedKeys) {
      if (key in normalized) {
        result[key] = (normalized as Record<string, unknown>)[key];
      }
    }

    return result;
  } catch {
    return {};
  }
}

export async function POST(request: NextRequest) {
  let body: SurveySubmitPayload | null = null;

  try {
    body = (await request.json()) as SurveySubmitPayload;
  } catch (error) {
    console.error('[api/survey/submit] json parse failed', error);

    return NextResponse.json(
      {
        ok: false,
        stage: 'json_parse',
        error: 'JSONの解析に失敗しました。',
      },
      { status: 400 }
    );
  }

  const sessionId = safeString(body.sessionId, 200);
  const area = safeString(body.area, 100);
  const category = safeString(body.category, 100);
  const answers = sanitizeAnswers(body.answers);
  const resultCount = safeInteger(body.resultCount);

  console.log('[api/survey/submit] received', {
    sessionId,
    area,
    category,
    answers,
    resultCount,
  });

  if (!sessionId || !area || !category) {
    return NextResponse.json(
      {
        ok: false,
        stage: 'validation',
        error: 'sessionId, area, category は必須です。',
        received: {
          sessionId,
          area,
          category,
        },
      },
      { status: 400 }
    );
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
      console.error('[api/survey/submit] insert failed', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });

      return NextResponse.json(
        {
          ok: false,
          stage: 'insert',
          error: 'アンケート保存に失敗しました。',
          details: {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code,
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      stage: 'insert',
      saved: true,
    });
  } catch (error) {
    console.error('[api/survey/submit] unexpected error', error);

    return NextResponse.json(
      {
        ok: false,
        stage: 'unexpected',
        error: 'サーバー処理で例外が発生しました。',
      },
      { status: 500 }
    );
  }
}