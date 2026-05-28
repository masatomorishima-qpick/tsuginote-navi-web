'use client';

/**
 * DashboardClient
 *
 * /digital ダッシュボードのクライアント側メイン。
 * カテゴリタブによる絞り込みと、最終更新の相対表示を担当。
 */

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, CircleAlert, ExternalLink, Pencil } from 'lucide-react';
import type { DigitalAsset, DigitalCategory } from '@/types/digital';
import {
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  DEATH_ACTION_LABELS,
} from '@/types/digital';
import CategoryTabs from './CategoryTabs';

type Props = {
  assets: DigitalAsset[];
};

export default function DashboardClient({ assets }: Props) {
  const [active, setActive] = useState<DigitalCategory | 'all'>('all');

  const counts = useMemo(() => {
    const base: Record<DigitalCategory | 'all', number> = {
      all: assets.length,
      subscription: 0,
      finance: 0,
      sns: 0,
      photo_storage: 0,
      shopping: 0,
      work: 0,
      other: 0,
    };
    for (const a of assets) {
      base[a.category] = (base[a.category] ?? 0) + 1;
    }
    return base;
  }, [assets]);

  const filtered = useMemo(() => {
    if (active === 'all') return assets;
    return assets.filter((a) => a.category === active);
  }, [assets, active]);

  return (
    <div className="space-y-4">
      <CategoryTabs counts={counts} active={active} onChange={setActive} />

      {filtered.length === 0 ? (
        <p className="rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
          このカテゴリには、まだ登録されたサービスがありません。
        </p>
      ) : active === 'all' ? (
        <GroupedByCategory assets={filtered} />
      ) : (
        <FlatList assets={filtered} />
      )}
    </div>
  );
}

function GroupedByCategory({ assets }: { assets: DigitalAsset[] }) {
  return (
    <div className="space-y-4">
      {CATEGORY_ORDER.map((cat) => {
        const items = assets.filter((a) => a.category === cat);
        if (items.length === 0) return null;
        return (
          <section
            key={cat}
            className="rounded-xl border border-slate-200 bg-white p-5"
          >
            <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-slate-900">
              {CATEGORY_LABELS[cat]}
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-normal text-slate-600">
                {items.length}件
              </span>
            </h2>
            <AssetList items={items} />
          </section>
        );
      })}
    </div>
  );
}

function FlatList({ assets }: { assets: DigitalAsset[] }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <AssetList items={assets} />
    </div>
  );
}

function AssetList({ items }: { items: DigitalAsset[] }) {
  return (
    <ul className="divide-y divide-slate-100">
      {items.map((item) => (
        <li key={item.id} className="py-3 first:pt-0 last:pb-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold text-slate-900 truncate">
                  {item.service_name}
                </p>
                {item.is_confirmed ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                    <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                    確認済
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                    <CircleAlert className="h-3 w-3" aria-hidden="true" />
                    未確認
                  </span>
                )}
              </div>

              <p className="mt-1 text-xs text-slate-600">
                希望：{DEATH_ACTION_LABELS[item.death_action]}
                {item.assignee_name && (
                  <>
                    <span className="mx-1 text-slate-300">・</span>
                    担当：{item.assignee_name}
                  </>
                )}
                {typeof item.monthly_cost === 'number' && (
                  <>
                    <span className="mx-1 text-slate-300">・</span>
                    月額：{item.monthly_cost.toLocaleString()}円
                  </>
                )}
              </p>

              {item.memo && (
                <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                  {item.memo}
                </p>
              )}

              {item.official_url && (
                <a
                  href={item.official_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1.5 inline-flex items-center gap-1 text-xs text-emerald-700 hover:text-emerald-800 hover:underline"
                >
                  公式サイト
                  <ExternalLink className="h-3 w-3" aria-hidden="true" />
                </a>
              )}
            </div>

            <Link
              href={`/digital/assets/${item.id}`}
              className="inline-flex flex-shrink-0 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800"
              aria-label={`${item.service_name} を編集`}
            >
              <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
              編集
            </Link>
          </div>
        </li>
      ))}
    </ul>
  );
}
