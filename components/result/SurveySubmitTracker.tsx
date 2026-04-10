'use client';

import { useEffect, useRef } from 'react';
import type { SurveyAnswers } from '@/types/survey';

type SurveySubmitTrackerProps = {
  sessionId?: string;
  area?: string;
  category?: string;
  answers: SurveyAnswers;
  resultCount: number;
};

const STORAGE_KEY = 'tsn_survey_session_id';

function safeString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function getPathFallback() {
  if (typeof window === 'undefined') {
    return { area: '', category: '' };
  }

  const segments = window.location.pathname.split('/').filter(Boolean);

  return {
    area: segments[0] ?? '',
    category: segments[1] ?? '',
  };
}

function getOrCreateSessionId(provided?: string) {
  const direct = safeString(provided);
  if (direct) return direct;

  if (typeof window === 'undefined') {
    return '';
  }

  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (saved) return saved;

  const created =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `tsn-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

  window.localStorage.setItem(STORAGE_KEY, created);
  return created;
}

export default function SurveySubmitTracker({
  sessionId,
  area,
  category,
  answers,
  resultCount,
}: SurveySubmitTrackerProps) {
  const sentRef = useRef(false);

  useEffect(() => {
    if (sentRef.current) return;
    sentRef.current = true;

    const run = async () => {
      const pathFallback = getPathFallback();

      const normalizedSessionId = getOrCreateSessionId(sessionId);
      const normalizedArea = safeString(area) || pathFallback.area;
      const normalizedCategory = safeString(category) || pathFallback.category;

      const payload = {
        sessionId: normalizedSessionId,
        area: normalizedArea,
        category: normalizedCategory,
        answers,
        resultCount,
      };

      console.log('[SurveySubmitTracker] payload', payload);

      try {
        const response = await fetch('/api/survey/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
          keepalive: true,
        });

        const text = await response.text();
        let json: unknown = null;

        try {
          json = text ? JSON.parse(text) : null;
        } catch {
          json = text;
        }

        if (!response.ok) {
          console.error('[SurveySubmitTracker] save failed', {
            status: response.status,
            json,
          });
          return;
        }

        console.log('[SurveySubmitTracker] saved', {
          status: response.status,
          json,
        });
      } catch (error) {
        console.error('[SurveySubmitTracker] request failed', error);
      }
    };

    void run();
  }, [sessionId, area, category, answers, resultCount]);

  return null;
}