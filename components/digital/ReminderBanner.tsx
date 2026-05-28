/**
 * ReminderBanner
 *
 * ダッシュボード（/digital）の上部に表示する「ログイン間隔」のお知らせバー。
 *
 * - 有効 & 期限内       → 薄いグレーで「次回リマインドまで XX日」
 * - 有効 & 期限超過     → 黄色で「XX日以上ログインがありません」
 * - 無効               → 非表示（null を返す）
 * - 初回/last_login_at 未記録 → 薄いグレーで「ようこそ」
 *
 * Server Component（ロジックは server 側の computeReminderStatus で算出済み）。
 */

import Link from 'next/link';
import { Bell, AlertTriangle, Settings } from 'lucide-react';
import type { ReminderStatus } from '@/lib/digital/reminders';

type Props = {
  status: ReminderStatus;
};

export default function ReminderBanner({ status }: Props) {
  if (!status.enabled) {
    return null;
  }

  // last_login_at 未記録のケース（トリガーで作成された直後など）
  if (status.daysSinceLogin === null || status.daysUntilReminder === null) {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
        <Bell
          className="mt-0.5 h-5 w-5 flex-shrink-0 text-slate-500"
          aria-hidden="true"
        />
        <div className="flex-1">
          <p className="font-medium text-slate-800">ようこそ</p>
          <p className="mt-0.5 text-slate-600">
            これから {status.interval} 日ごとにログイン状況をお知らせします。
            間隔は
            <Link
              href="/digital/settings"
              className="mx-1 font-medium text-emerald-700 hover:underline"
            >
              設定画面
            </Link>
            から変更できます。
          </p>
        </div>
      </div>
    );
  }

  if (status.isOverdue) {
    const overdueDays = Math.abs(status.daysUntilReminder); // 0 or positive
    return (
      <div className="flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
        <AlertTriangle
          className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600"
          aria-hidden="true"
        />
        <div className="flex-1">
          <p className="font-medium">
            {status.daysSinceLogin}日ログインがありませんでした
          </p>
          <p className="mt-0.5 text-amber-800/90 leading-relaxed">
            設定した間隔（{status.interval}日）を
            {overdueDays > 0 ? `${overdueDays}日` : ''}超えています。
            この機会に登録内容が最新か確認しましょう。
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Link
              href="/digital"
              className="inline-flex items-center gap-1 rounded-md bg-amber-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-800"
            >
              登録内容を確認する
            </Link>
            <Link
              href="/digital/settings"
              className="inline-flex items-center gap-1 rounded-md border border-amber-300 bg-white px-3 py-1.5 text-xs font-semibold text-amber-800 hover:bg-amber-50"
            >
              <Settings className="h-3.5 w-3.5" aria-hidden="true" />
              リマインド間隔を変更
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 期限内
  return (
    <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
      <Bell
        className="mt-0.5 h-5 w-5 flex-shrink-0 text-slate-500"
        aria-hidden="true"
      />
      <div className="flex-1">
        <p className="font-medium text-slate-800">
          次回リマインドまで {status.daysUntilReminder}日
        </p>
        <p className="mt-0.5 text-slate-600">
          最終ログインから {status.daysSinceLogin}日経過（設定：
          {status.interval}日ごと）。
          <Link
            href="/digital/settings"
            className="ml-1 font-medium text-emerald-700 hover:underline"
          >
            設定を変更
          </Link>
        </p>
      </div>
    </div>
  );
}
