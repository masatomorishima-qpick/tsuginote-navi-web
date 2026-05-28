/**
 * /digital/settings — 設定トップ
 *
 * 各設定項目はサブページに分離してあり、ここは「目次」として機能する。
 * カードでグループ分けされた一覧表示。
 *
 * - プラン → /digital/settings/plan
 * - 通知 → /digital/settings/notifications
 * - 家族共有 → /digital/share
 * - ヘルプ → /digital/settings/help
 * - 操作履歴 → /digital/settings/audit
 * - アカウントを削除 → /digital/account/delete
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
  Bell,
  ChevronRight,
  HelpCircle,
  ScrollText,
  Shield,
  Trash2,
  Users,
} from 'lucide-react';
import { createDigitalServerClient } from '@/lib/supabase/digitalServer';
import { getOwnSubscription } from '@/lib/digital/subscriptions';
import { effectivePlan } from '@/lib/digital/subscriptionUtils';
import { getOrInitReminderSettings } from '@/lib/digital/reminders';

export const metadata: Metadata = {
  title: '設定 | つぎの手ナビ デジタル資産',
  description:
    'ご契約プラン、通知、大切な方に共有、サポートなどの設定です。',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

// 一覧行の共通スタイル
const ROW_CLASS =
  'flex items-center justify-between gap-3 px-4 py-4 text-left border-b border-gray-100 last:border-b-0 active:opacity-70 min-h-[56px]';

export default async function DigitalSettingsPage() {
  const supabase = await createDigitalServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login?next=/digital/settings');
  }

  // プラン状態
  const subscription = await getOwnSubscription(supabase, user.id);
  const planLabel = effectivePlan(subscription) === 'standard' ? 'STANDARD' : 'フリー';

  // 通知設定
  const reminder = await getOrInitReminderSettings(supabase, user.id);
  const notifLabel = reminder.reminder_enabled
    ? `${reminder.reminder_interval}日`
    : 'OFF';

  return (
    <div className="min-h-screen bg-[#F5F5F0]">
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link
            href="/digital"
            className="text-sm text-emerald-600 active:opacity-70 flex-shrink-0"
          >
            ← ダッシュボード
          </Link>
          <h1 className="text-base font-medium text-gray-900 flex-1 text-center pr-24">
            設定
          </h1>
        </div>
      </header>

      {/* 本体 */}
      <div className="max-w-2xl mx-auto px-4 py-4 space-y-6">
        {/* アカウントグループ */}
        <section aria-labelledby="group-account">
          <h2
            id="group-account"
            className="px-1 mb-2 text-xs text-gray-500"
          >
            アカウント
          </h2>
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            {/* プラン */}
            <Link href="/digital/settings/plan" className={ROW_CLASS}>
              <div className="flex items-center gap-3 min-w-0">
                <Shield
                  className="w-5 h-5 text-gray-600 flex-shrink-0"
                  aria-hidden="true"
                />
                <span className="text-base text-gray-900 truncate">
                  プラン
                </span>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <span className="text-sm text-gray-500">{planLabel}</span>
                <ChevronRight
                  className="w-4 h-4 text-gray-400"
                  aria-hidden="true"
                />
              </div>
            </Link>
            {/* 通知 */}
            <Link href="/digital/settings/notifications" className={ROW_CLASS}>
              <div className="flex items-center gap-3 min-w-0">
                <Bell
                  className="w-5 h-5 text-gray-600 flex-shrink-0"
                  aria-hidden="true"
                />
                <span className="text-base text-gray-900 truncate">通知</span>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <span className="text-sm text-gray-500">{notifLabel}</span>
                <ChevronRight
                  className="w-4 h-4 text-gray-400"
                  aria-hidden="true"
                />
              </div>
            </Link>
          </div>
        </section>

        {/* 共有グループ */}
        <section aria-labelledby="group-share">
          <h2 id="group-share" className="px-1 mb-2 text-xs text-gray-500">
            共有
          </h2>
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <Link href="/digital/share" className={ROW_CLASS}>
              <div className="flex items-center gap-3 min-w-0">
                <Users
                  className="w-5 h-5 text-gray-600 flex-shrink-0"
                  aria-hidden="true"
                />
                <span className="text-base text-gray-900 truncate">
                  大切な方に共有
                </span>
              </div>
              <ChevronRight
                className="w-4 h-4 text-gray-400 flex-shrink-0"
                aria-hidden="true"
              />
            </Link>
          </div>
        </section>

        {/* サポートグループ */}
        <section aria-labelledby="group-support">
          <h2 id="group-support" className="px-1 mb-2 text-xs text-gray-500">
            サポート
          </h2>
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            {/* ヘルプ */}
            <Link href="/digital/settings/help" className={ROW_CLASS}>
              <div className="flex items-center gap-3 min-w-0">
                <HelpCircle
                  className="w-5 h-5 text-gray-600 flex-shrink-0"
                  aria-hidden="true"
                />
                <span className="text-base text-gray-900 truncate">ヘルプ</span>
              </div>
              <ChevronRight
                className="w-4 h-4 text-gray-400 flex-shrink-0"
                aria-hidden="true"
              />
            </Link>
            {/* 操作履歴 */}
            <Link href="/digital/settings/audit" className={ROW_CLASS}>
              <div className="flex items-center gap-3 min-w-0">
                <ScrollText
                  className="w-5 h-5 text-gray-600 flex-shrink-0"
                  aria-hidden="true"
                />
                <span className="text-base text-gray-900 truncate">
                  操作履歴
                </span>
              </div>
              <ChevronRight
                className="w-4 h-4 text-gray-400 flex-shrink-0"
                aria-hidden="true"
              />
            </Link>
            {/* アカウントを削除（退会） */}
            <Link href="/digital/account/delete" className={ROW_CLASS}>
              <div className="flex items-center gap-3 min-w-0">
                <Trash2
                  className="w-5 h-5 text-gray-600 flex-shrink-0"
                  aria-hidden="true"
                />
                <span className="text-base text-gray-900 truncate">
                  アカウントを削除（退会）
                </span>
              </div>
              <ChevronRight
                className="w-4 h-4 text-gray-400 flex-shrink-0"
                aria-hidden="true"
              />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
