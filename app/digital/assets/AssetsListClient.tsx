'use client';

import { useRouter } from 'next/navigation';
import type { DigitalAsset } from '@/types/digital';
import {
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  DEATH_ACTION_LABELS,
} from '@/lib/digital/utils';

export default function AssetsListClient({
  assets,
}: {
  assets: DigitalAsset[];
}) {
  const router = useRouter();

  // カテゴリ別にグループ化
  const grouped = new Map<string, DigitalAsset[]>();
  for (const a of assets) {
    const list = grouped.get(a.category) ?? [];
    list.push(a);
    grouped.set(a.category, list);
  }

  return (
    <div className="min-h-screen bg-[#F5F5F0]">
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => router.push('/digital')}
            className="text-sm text-emerald-600 active:opacity-70 flex-shrink-0"
          >
            ← ダッシュボード
          </button>
          <h1 className="text-base font-medium text-gray-900">デジタル資産</h1>
          <button
            type="button"
            onClick={() => router.push('/digital/assets/new')}
            className="text-sm text-emerald-600 active:opacity-70 flex-shrink-0"
          >
            ＋ 追加
          </button>
        </div>
      </header>

      {/* 本体 */}
      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        {assets.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
            <p className="text-sm text-gray-500">まだ登録されていません</p>
            <button
              type="button"
              onClick={() => router.push('/digital/assets/new')}
              className="mt-4 inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 active:bg-emerald-800"
            >
              ＋ 最初のサービスを追加する
            </button>
          </div>
        ) : (
          CATEGORY_ORDER
            .filter((cat) => grouped.has(cat))
            .map((cat) => {
              const items = grouped.get(cat)!;
              return (
                <section key={cat}>
                  <h2 className="px-1 mb-2 text-xs text-gray-400">
                    {CATEGORY_LABELS[cat] ?? cat}
                  </h2>
                  <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    {items.map((a) => (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => router.push(`/digital/assets/${a.id}`)}
                        className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left border-b border-gray-100 last:border-b-0 active:opacity-70"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-base font-medium text-gray-900 truncate">
                            {a.service_name}
                          </p>
                          <p className="text-[13px] text-gray-400 truncate mt-0.5">
                            {DEATH_ACTION_LABELS[a.death_action] ?? a.death_action}
                          </p>
                        </div>
                        <span className="text-[13px] text-emerald-600 flex-shrink-0">
                          編集 ›
                        </span>
                      </button>
                    ))}
                  </div>
                </section>
              );
            })
        )}
      </div>
    </div>
  );
}
