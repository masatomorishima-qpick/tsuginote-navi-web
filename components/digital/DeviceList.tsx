'use client';

/**
 * DeviceList
 *
 * /digital/devices のデバイス一覧ビュー。
 * 各カードには：
 *   - デバイス名 / メーカー / 機種
 *   - 状態バッジ（使用中 / 廃棄済み 等）
 *   - PIN 登録状態（未登録 / 登録済み + 更新日）
 *   - 編集 / PIN を登録する（or 表示） のアクション
 *
 * PIN 登録・表示ボタンは Task #6/#7 で実装する画面へのリンクとして配置しておく。
 */

import Link from 'next/link';
import {
  KeyRound,
  Pencil,
  ShieldCheck,
  ShieldOff,
  CheckCircle2,
  AlertTriangle,
  Package,
  PackageOpen,
  Share2,
} from 'lucide-react';
import type {
  DigitalDeviceWithPinFlag,
  DeviceDisposalStatus,
} from '@/types/digital';
import { DEVICE_DISPOSAL_STATUS_LABELS } from '@/types/digital';

type Props = {
  devices: DigitalDeviceWithPinFlag[];
};

const STATUS_STYLE: Record<
  DeviceDisposalStatus,
  { className: string; Icon: typeof CheckCircle2 }
> = {
  in_use: {
    className: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    Icon: CheckCircle2,
  },
  disposed: {
    className: 'border-slate-200 bg-slate-50 text-slate-700',
    Icon: Package,
  },
  sold: {
    className: 'border-sky-200 bg-sky-50 text-sky-800',
    Icon: PackageOpen,
  },
  transferred: {
    className: 'border-violet-200 bg-violet-50 text-violet-800',
    Icon: Share2,
  },
  other: {
    className: 'border-amber-200 bg-amber-50 text-amber-800',
    Icon: AlertTriangle,
  },
};

export default function DeviceList({ devices }: Props) {
  if (devices.length === 0) {
    // ページ上部にすでに「デバイスを追加する」CTA があるので、
    // 空状態は控えめなメッセージのみに留める（重複を避ける）
    return (
      <p className="rounded-xl border border-dashed border-slate-300 bg-white px-5 py-6 text-center text-sm text-slate-500">
        登録されているデバイスはありません。上の「デバイスを追加する」から始めましょう。
      </p>
    );
  }

  return (
    <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
      {devices.map((d) => {
        const statusStyle = STATUS_STYLE[d.disposal_status];
        const StatusIcon = statusStyle.Icon;
        return (
          <li
            key={d.id}
            className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="truncate text-base font-semibold text-slate-900">
                  {d.device_name}
                </h3>
                <p className="mt-0.5 truncate text-xs text-slate-500">
                  {[d.manufacturer, d.model].filter(Boolean).join(' / ') || '—'}
                </p>
              </div>
              <span
                className={`inline-flex flex-shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-xs ${statusStyle.className}`}
              >
                <StatusIcon className="h-3 w-3" aria-hidden="true" />
                {DEVICE_DISPOSAL_STATUS_LABELS[d.disposal_status]}
              </span>
            </div>

            <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-slate-600">
              <dt className="text-slate-400">購入日</dt>
              <dd className="truncate">{d.purchase_date ?? '—'}</dd>
              <dt className="text-slate-400">保管場所</dt>
              <dd className="truncate">{d.storage_place ?? '—'}</dd>
            </dl>

            {/* PIN 登録状態 */}
            <div
              className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs ${
                d.has_pin
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                  : 'border-slate-200 bg-slate-50 text-slate-600'
              }`}
            >
              {d.has_pin ? (
                <ShieldCheck
                  className="h-4 w-4 flex-shrink-0 text-emerald-600"
                  aria-hidden="true"
                />
              ) : (
                <ShieldOff
                  className="h-4 w-4 flex-shrink-0 text-slate-400"
                  aria-hidden="true"
                />
              )}
              <span className="min-w-0 flex-1 truncate">
                {d.has_pin
                  ? `パスワード登録済み（更新日：${formatJpDate(d.pin_updated_at)}）`
                  : 'パスワード未登録'}
              </span>
            </div>

            {/* アクション */}
            <div className="mt-auto flex flex-wrap gap-2 pt-1">
              <Link
                href={`/digital/devices/${d.id}`}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                編集
              </Link>

              {d.has_pin ? (
                <Link
                  href={`/digital/devices/${d.id}/pin`}
                  className="inline-flex items-center gap-1 rounded-lg border border-emerald-300 bg-white px-3 py-1.5 text-xs font-medium text-emerald-800 hover:bg-emerald-50"
                >
                  <KeyRound className="h-3.5 w-3.5" aria-hidden="true" />
                  パスワードを表示・更新
                </Link>
              ) : (
                <Link
                  href={`/digital/devices/${d.id}/pin/new`}
                  className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700"
                >
                  <KeyRound className="h-3.5 w-3.5" aria-hidden="true" />
                  パスワードを登録する
                </Link>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function formatJpDate(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
