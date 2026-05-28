'use client';

/**
 * CategoryTabs
 *
 * ダッシュボードで資産をカテゴリ別に絞り込むタブ。
 * 件数バッジ付き。
 */

import type { DigitalCategory } from '@/types/digital';
import { CATEGORY_LABELS, CATEGORY_ORDER } from '@/types/digital';

type Props = {
  counts: Record<DigitalCategory | 'all', number>;
  active: DigitalCategory | 'all';
  onChange: (next: DigitalCategory | 'all') => void;
};

export default function CategoryTabs({ counts, active, onChange }: Props) {
  return (
    <div
      role="tablist"
      aria-label="カテゴリで絞り込み"
      className="flex flex-wrap gap-2"
    >
      <Tab
        label="すべて"
        count={counts.all}
        active={active === 'all'}
        onClick={() => onChange('all')}
      />
      {CATEGORY_ORDER.map((c) => (
        <Tab
          key={c}
          label={CATEGORY_LABELS[c]}
          count={counts[c] ?? 0}
          active={active === c}
          onClick={() => onChange(c)}
        />
      ))}
    </div>
  );
}

function Tab({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      role="tab"
      aria-selected={active}
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
        active
          ? 'bg-emerald-600 text-white shadow-sm'
          : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-emerald-50 hover:text-emerald-800'
      }`}
    >
      <span>{label}</span>
      <span
        className={`inline-flex min-w-[1.5rem] justify-center rounded-full px-1.5 text-xs ${
          active
            ? 'bg-emerald-700/40 text-white'
            : 'bg-slate-100 text-slate-600'
        }`}
      >
        {count}
      </span>
    </button>
  );
}
