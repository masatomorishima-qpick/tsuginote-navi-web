import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

type EventPayload = {
  eventName?: unknown;
  page?: unknown;
  area?: unknown;
  category?: unknown;
  sessionId?: unknown;
  officeId?: unknown;
  meta?: unknown;
};

function safeString(value: unknown, maxLength = 200): string {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, maxLength);
}

function safeNullableString(value: unknown, maxLength = 200): string | null {
  const normalized = safeString(value, maxLength);
  return normalized ? normalized : null;
}

function sanitizeMeta(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }

  try {
    const normalized = JSON.parse(JSON.stringify(value));
    if (!normalized || typeof normalized !== 'object' || Array.isArray(normalized)) {
      return {};
    }
    return normalized as Record<string, unknown>;
  } catch {
    return {};
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as EventPayload;

    const eventName = safeString(body.eventName, 100);
    const page = safeString(body.page, 100);
    const area = safeString(body.area, 100);
    const category = safeString(body.category, 100);
    const sessionId = safeString(body.sessionId, 200);
    const officeId = safeNullableString(body.officeId, 100);
    const meta = sanitizeMeta(body.meta);

    if (!eventName || !page || !sessionId) {
      return NextResponse.json(
        {
          ok: false,
          error: 'eventName, page, sessionId は必須です。',
        },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();

    const { error } = await supabase.from('app_events').insert({
      event_name: eventName,
      page,
      area,
      category,
      session_id: sessionId,
      office_id: officeId,
      meta,
    });

    if (error) {
      console.error('[api/events] insert failed', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });

      return NextResponse.json(
        {
          ok: false,
          error: 'イベント保存に失敗しました。',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[api/events] unexpected error', error);

    return NextResponse.json(
      {
        ok: false,
        error: '不正なリクエストです。',
      },
      { status: 400 }
    );
  }
}