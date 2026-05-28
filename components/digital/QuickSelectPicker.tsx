'use client';

/**
 * QuickSelectPicker
 *
 * サービスマスタ（Netflix / PayPay / LINE など）から選ぶだけで
 * サービス名・カテゴリ・公式URLが自動入力されるピッカー。
 *
 * AssetForm から使われ、選択された項目は親のステートに反映されます。
 */

import { useEffect, useMemo, useState } from 'react';
import { Search, Check, Loader2, RefreshCw } from 'lucide-react';
import type { DigitalCategory, DigitalServiceMaster } from '@/types/digital';
import { CATEGORY_LABELS, CATEGORY_ORDER } from '@/types/digital';

type Props = {
  selectedMasterId: string | null;
  onSelect: (master: DigitalServiceMaster | null) => void;
};

export default function QuickSelectPicker({ selectedMasterId, onSelect }: Props) {
  const [masters, setMasters] = useState<DigitalServiceMaster[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [keyword, setKeyword] = useState('');
  const [activeCategory, setActiveCategory] = useState<DigitalCategory | 'all'>('all');

  async function fetchMasters() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/digital/service-masters', { cache: 'no-store' });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json?.error ?? 'fetch_failed');
      }
      setMasters(json.masters as DigitalServiceMaster[]);
    } catch (err) {
      console.error('[QuickSelectPicker] fetch failed', err);
      setError('サービス一覧を取得できませんでした。ネットワークをご確認ください。');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMasters();
  }, []);

  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    return masters.filter((m) => {
      if (activeCategory !== 'all' && m.category !== activeCategory) return false;
      if (!kw) return true;
      return m.service_name.toLowerCase().includes(kw);
    });
  }, [masters, activeCategory, keyword]);

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        サービス一覧を読み込んでいます…
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-700">
        <p>{error}</p>
        <button
          type="button"
          onClick={fetchMasters}
          className="mt-2 inline-flex items-center gap-1 rounded-lg border border-rose-300 bg-white px-3 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-100"
        >
          <RefreshCw className="h-3 w-3" aria-hidden="true" />
          再試行
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white">
      {/* 検索 */}
      <div className="border-b border-slate-100 p-3">
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="サービス名で検索（例：Netflix）"
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-100"
          />
        </div>
      </div>

      {/* カテゴリタブ */}
      <div className="flex flex-wrap gap-1 border-b border-slate-100 p-2">
        <CategoryChip
          label="すべて"
          active={activeCategory === 'all'}
          onClick={() => setActiveCategory('all')}
        />
        {CATEGORY_ORDER.map((c) => (
          <CategoryChip
            key={c}
            label={CATEGORY_LABELS[c]}
            active={activeCategory === c}
            onClick={() => setActiveCategory(c)}
          />
        ))}
      </div>

      {/* 候補リスト */}
      <div className="max-h-64 overflow-y-auto p-2">
        {filtered.length === 0 ? (
          <p className="px-3 py-6 text-center text-sm text-slate-500">
            該当するサービスが見つかりませんでした。
            <br />
            下の「サービス名」欄に直接入力してください。
          </p>
        ) : (
          <ul className="grid grid-cols-1 gap-1 sm:grid-cols-2">
            {filtered.map((m) => {
              const selected = m.id === selectedMasterId;
              return (
                <li key={m.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(selected ? null : m)}
                    className={`flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left text-sm transition ${
                      selected
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-900'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-emerald-300 hover:bg-emerald-50/40'
                    }`}
                  >
                    <span className="flex flex-col">
                      <span className="font-medium">{m.service_name}</span>
                      <span className="text-xs text-slate-500">
                        {CATEGORY_LABELS[m.category]}
                      </span>
                    </span>
                    {selected && (
                      <Check className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="border-t border-slate-100 bg-slate-50 px-3 py-2 text-xs text-slate-500">
        ※ 一覧にないサービスは、下の「サービス名」欄に直接入力できます。
      </div>
    </div>
  );
}

function CategoryChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1 text-xs font-medium transition ${
        active
          ? 'bg-emerald-600 text-white shadow-sm'
          : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100'
      }`}
    >
      {label}
    </button>
  );
}
