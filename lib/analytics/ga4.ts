'use client';

export type ContactMethod = 'line' | 'phone' | 'email';

export type GA4EventName =
  | 'survey_start'
  | 'survey_step_view'
  | 'survey_answer_select'
  | 'survey_complete'
  | 'results_view'
  | 'results_load_more_click'
  | 'office_contact_click'
  | 'office_website_click'
  | 'office_video_link_clicked'
  // ---- デジタル資産サービスのコンバージョンイベント（#33・2026-06-05 追加）----
  // GA 管理画面で「キーイベント」に指定して転換率を計測する
  | 'digital_sign_up'          // 会員登録完了（オンボーディング完了時）
  | 'digital_invite_sent'      // 大切な方への招待送信
  | 'digital_invite_approved'  // 連携承認（課金につながる行動）
  | 'digital_checkout_start';  // Stripe Checkout への遷移（カード登録開始）

export type GA4EventParams = {
  area?: string;
  category?: string;
  session_id?: string;
  step_number?: number;
  result_count?: number;
  office_id?: string | number;
  contact_method?: ContactMethod;
  [key: string]: string | number | boolean | undefined;
};

declare global {
  interface Window {
    gtag?: (
      command: 'event' | 'config' | 'set' | 'js',
      targetIdOrEventName: string | Date,
      config?: Record<string, unknown>
    ) => void;
  }
}

const SESSION_STORAGE_KEY = 'tsuginote2_session_id';

const BLOCKED_PARAM_KEYS = new Set([
  'name',
  'full_name',
  'first_name',
  'last_name',
  'email',
  'mail',
  'phone',
  'phone_number',
  'telephone',
  'tel',
]);

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

function createSessionId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `session_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export function getTrackingSessionId(): string {
  if (!isBrowser()) {
    return 'server-session';
  }

  const existing = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
  if (existing) {
    return existing;
  }

  const created = createSessionId();
  window.sessionStorage.setItem(SESSION_STORAGE_KEY, created);
  return created;
}

function shouldUseDebugMode(): boolean {
  if (!isBrowser()) {
    return false;
  }

  const isLocalhost =
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1';

  const hasDebugParam =
    new URLSearchParams(window.location.search).get('ga_debug') === '1';

  return isLocalhost || hasDebugParam;
}

function sanitizeParams(
  params: GA4EventParams
): Record<string, string | number | boolean> {
  const sanitized: Record<string, string | number | boolean> = {};

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined) return;
    if (value === null) return;
    if (BLOCKED_PARAM_KEYS.has(key)) return;

    if (
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean'
    ) {
      sanitized[key] = value;
    }
  });

  return sanitized;
}

export function sendGA4Event(
  eventName: GA4EventName,
  params: GA4EventParams = {}
): void {
  if (!isBrowser()) return;
  if (typeof window.gtag !== 'function') return;

  const payload = sanitizeParams({
    ...params,
    session_id: params.session_id ?? getTrackingSessionId(),
  });

  window.gtag('event', eventName, {
    ...payload,
    transport_type: 'beacon',
    ...(shouldUseDebugMode() ? { debug_mode: true } : {}),
  });
}