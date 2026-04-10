'use client';

import { useEffect, useRef } from 'react';
import { postAppEvent } from '@/lib/events/postAppEvent';
import type { SurveyAnswers } from '@/types/survey';

type ResultsEventTrackerProps = {
  area: string;
  category: string;
  sessionId: string;
  resultCount: number;
  answers: SurveyAnswers;
};

export default function ResultsEventTracker({
  area,
  category,
  sessionId,
  resultCount,
  answers,
}: ResultsEventTrackerProps) {
  const sentRef = useRef(false);

  useEffect(() => {
    if (sentRef.current) return;
    sentRef.current = true;

    void postAppEvent({
      eventName: 'results_page_viewed',
      page: 'results',
      area,
      category,
      sessionId,
      meta: {
        resultCount,
        answers,
      },
    });
  }, [area, category, sessionId, resultCount, answers]);

  return null;
}