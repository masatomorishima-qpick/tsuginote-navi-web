'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import OfficeCard from '@/components/result/OfficeCard';
import { trackAppEvent } from '@/lib/analytics/trackAppEvent';
import type { SurveyAnswers } from '@/types/survey';
import type { Office, OfficeCardLabel } from '@/types/office';

type ResultItem = {
  office: Office;
  score: number;
  badges: OfficeCardLabel[];
  matchedReasons: OfficeCardLabel[];
};

type ResultsListClientProps = {
  items: ResultItem[];
  answers: SurveyAnswers;
  area: string;
  category: string;
  sessionId: string;
};

const INITIAL_VISIBLE_COUNT = 5;
const LOAD_MORE_COUNT = 5;

export default function ResultsListClient({
  items,
  answers,
  area,
  category,
  sessionId,
}: ResultsListClientProps) {
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);
  const hasTrackedResultsViewRef = useRef(false);

  const visibleItems = useMemo(() => {
    return items.slice(0, visibleCount);
  }, [items, visibleCount]);

  const totalCount = items.length;
  const hasMore = visibleCount < totalCount;

  useEffect(() => {
    if (hasTrackedResultsViewRef.current) return;

    hasTrackedResultsViewRef.current = true;

    trackAppEvent('results_view', {
      area,
      category,
      session_id: sessionId,
      result_count: totalCount,
    });
  }, [area, category, sessionId, totalCount]);

  const handleLoadMore = () => {
    trackAppEvent('results_load_more_click', {
      area,
      category,
      session_id: sessionId,
      result_count: totalCount,
      visible_count_before: visibleCount,
    });

    setVisibleCount((prev) => Math.min(prev + LOAD_MORE_COUNT, totalCount));
  };

  return (
    <section>
      <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <p className="text-base font-bold text-slate-900">
          条件に合う掲載事務所 {totalCount}件
        </p>
        {totalCount > 0 ? (
          <p className="mt-1 text-sm text-slate-500">
            {Math.min(visibleCount, totalCount)}件を表示中です
          </p>
        ) : null}
      </div>

      <p className="mt-3 text-sm leading-6 text-slate-600">
        事務所への連絡や相談は直接お願いいたします。
      </p>

      {totalCount > 0 ? (
        <>
          <div className="mt-4 grid gap-5">
            {visibleItems.map((item) => (
              <OfficeCard
                key={item.office.id}
                office={item.office}
                answers={answers}
                badges={item.badges}
                matchedReasons={item.matchedReasons}
                area={area}
                category={category}
                sessionId={sessionId}
              />
            ))}
          </div>

          {hasMore ? (
            <div className="mt-5">
              <button
                type="button"
                onClick={handleLoadMore}
                className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
              >
                さらに5件見る
              </button>
            </div>
          ) : null}
        </>
      ) : (
        <div className="mt-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">
            現在表示できる掲載事務所がありません
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-700">
            条件に合う掲載情報がまだない可能性があります。時間をおいて確認するか、条件を変えてもう一度お試しください。
          </p>
        </div>
      )}
    </section>
  );
}