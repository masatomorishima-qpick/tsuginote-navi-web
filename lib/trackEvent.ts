'use client';

import { getAnonId, getVisitId } from './clientTracking';

type TrackEventPayload = {
  lp_id: string;
  event_name: string;
  page_path?: string;
  component_id?: string;
  choice_id?: string;
  choice_label?: string;
  section_id?: string;
  view_order?: number;
  question_id?: string;
  answer_id?: string;
  cta_id?: string;
  partner_category?: string;
  source_section?: string;
  selected_intent_id?: string;
  selected_barrier_id?: string;
  metadata?: Record<string, unknown>;
};

export async function trackEvent(payload: TrackEventPayload) {
  try {
    const anon_id = getAnonId();
    const visit_id = getVisitId();

    const body = {
      visit_id,
      anon_id,
      page_path:
        payload.page_path ||
        (typeof window !== 'undefined' ? window.location.pathname : ''),
      metadata: {},
      ...payload,
    };

    const res = await fetch('/api/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      keepalive: true,
    });

    const data = await res.json();

    if (!res.ok) {
      console.error('trackEvent failed:', data);
      return { ok: false, error: data };
    }

    return { ok: true, data };
  } catch (error) {
    console.error('trackEvent unexpected error:', error);
    return { ok: false, error };
  }
}