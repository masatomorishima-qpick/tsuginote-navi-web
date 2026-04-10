const SESSION_KEY = "tsn_session_id";

export function getOrCreateSessionId() {
  if (typeof window === "undefined") return "";

  const existing = localStorage.getItem(SESSION_KEY);
  if (existing) return existing;

  const newId = crypto.randomUUID();
  localStorage.setItem(SESSION_KEY, newId);
  return newId;
}