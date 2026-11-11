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

/**
 * 運営側の確認を数えないための印（2026-11-11）。
 * - 自動の確認（Playwright など）は navigator.webdriver が true になるので数えない。
 * - 運営者のブラウザは、どれかのページを ?tn_internal=1 で一度開くと、そのブラウザでは以後数えない（?tn_internal=0 で戻す）。
 * 自然流入の閲覧と紹介先の押下率（lp_event_logs）に、確認のための表示が混ざらないようにする。
 */
function isInternal() {
  try {
    if (typeof window === 'undefined') return false;
    if (navigator.webdriver) return true;
    const flag = new URLSearchParams(window.location.search).get('tn_internal');
    if (flag === '1') localStorage.setItem('tn_internal', '1');
    if (flag === '0') localStorage.removeItem('tn_internal');
    return localStorage.getItem('tn_internal') === '1';
  } catch {
    return false;
  }
}

export async function trackEvent(payload: TrackEventPayload) {
  if (isInternal()) return { ok: true, skipped: true };
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