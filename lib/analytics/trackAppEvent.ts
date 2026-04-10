'use client';

import {
  type GA4EventName,
  type GA4EventParams,
  getTrackingSessionId,
  sendGA4Event,
} from '@/lib/analytics/ga4';

type AppTrackPayload = GA4EventParams & {
  page_path?: string;
  page_location?: string;
  sent_at?: string;
};

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

/**
 * 既存の Supabase / API イベント計測を壊さず残すための送信。
 * 既存実装が /api/track を持っている前提で keepalive POST します。
 * 失敗しても UI を止めません。
 */
async function sendSupabaseTrackEvent(
  eventName: GA4EventName,
  params: AppTrackPayload
): Promise<void> {
  if (!isBrowser()) return;

  try {
    await fetch('/api/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      keepalive: true,
      body: JSON.stringify({
        event_name: eventName,
        ...params,
      }),
    });
  } catch {
    // 既存導線を壊さないため握りつぶす
  }
}

export function buildTrackingContext(input: {
  area?: string;
  category?: string;
  session_id?: string;
}): Required<Pick<GA4EventParams, 'area' | 'category' | 'session_id'>> {
  return {
    area: input.area ?? 'unknown',
    category: input.category ?? 'unknown',
    session_id: input.session_id ?? getTrackingSessionId(),
  };
}

export function trackAppEvent(
  eventName: GA4EventName,
  params: GA4EventParams = {}
): string {
  const sessionId = params.session_id ?? getTrackingSessionId();

  const payload: AppTrackPayload = {
    ...params,
    session_id: sessionId,
    ...(isBrowser()
      ? {
          page_path: window.location.pathname,
          page_location: window.location.href,
        }
      : {}),
    sent_at: new Date().toISOString(),
  };

  // GA4
  sendGA4Event(eventName, payload);

  // 既存 Supabase / API track
  void sendSupabaseTrackEvent(eventName, payload);

  return sessionId;
}