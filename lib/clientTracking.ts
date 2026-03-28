'use client';

const ANON_ID_KEY = 'tsuginote_anon_id';
const VISIT_ID_KEY = 'tsuginote_visit_id';

function generateId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function getAnonId() {
  if (typeof window === 'undefined') return '';

  const existing = localStorage.getItem(ANON_ID_KEY);
  if (existing) return existing;

  const newId = generateId();
  localStorage.setItem(ANON_ID_KEY, newId);
  return newId;
}

export function getVisitId() {
  if (typeof window === 'undefined') return '';

  const existing = sessionStorage.getItem(VISIT_ID_KEY);
  if (existing) return existing;

  const newId = generateId();
  sessionStorage.setItem(VISIT_ID_KEY, newId);
  return newId;
}