export type AppEventPayload = {
  eventName: string;
  page: string;
  area: string;
  category: string;
  sessionId: string;
  officeId?: string;
  meta?: Record<string, unknown>;
};

type PostAppEventOptions = {
  preferBeacon?: boolean;
};

export async function postAppEvent(
  payload: AppEventPayload,
  options?: PostAppEventOptions
) {
  const body = JSON.stringify(payload);

  if (
    options?.preferBeacon &&
    typeof navigator !== 'undefined' &&
    typeof navigator.sendBeacon === 'function'
  ) {
    try {
      const blob = new Blob([body], { type: 'application/json' });
      const sent = navigator.sendBeacon('/api/events', blob);

      if (sent) {
        return;
      }
    } catch {
      // fetch fallback
    }
  }

  try {
    await fetch('/api/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body,
      keepalive: options?.preferBeacon ?? false,
    });
  } catch {
    // PoCでは握りつぶして画面を優先
  }
}