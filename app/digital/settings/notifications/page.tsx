/**
 * /digital/settings/notifications — 通知設定
 *
 * 設定トップから遷移する、リマインダー間隔の設定用サブページ。
 * 表示は既存の ReminderSettingsForm コンポーネントをそのまま利用する。
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Bell, ChevronRight } from 'lucide-react';
import { createDigitalServerClient } from '@/lib/supabase/digitalServer';
import { getOrInitReminderSettings } from '@/lib/digital/reminders';
import ReminderSettingsForm from '@/components/digital/ReminderSettingsForm';

export const metadata: Metadata = {
  title: '通知 | つぎの手ナビ デジタル資産',
  description: 'リマインダーの有効/無効と間隔を設定できます。',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function SettingsNotificationsPage() {
  const supabase = await createDigitalServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login?next=/digital/settings/notifications');
  }

  const setting = await getOrInitReminderSettings(supabase, user.id);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* パンくず */}
      <nav
        aria-label="パンくず"
        className="flex items-center gap-1 text-xs text-slate-500"
      >
        <Link
          href="/digital"
          className="hover:text-emerald-700 hover:underline"
        >
          ダッシュボード
        </Link>
        <ChevronRight className="h-3 w-3" aria-hidden="true" />
        <Link
          href="/digital/settings"
          className="hover:text-emerald-700 hover:underline"
        >
          設定
        </Link>
        <ChevronRight className="h-3 w-3" aria-hidden="true" />
        <span className="text-slate-700">通知</span>
      </nav>

      {/* 見出し */}
      <header>
        <h1 className="text-2xl font-bold text-slate-900">通知</h1>
        <p className="mt-1 text-sm text-slate-600">
          長期間ログインが無いときに、ダッシュボードでお知らせします。
          間隔の変更や、通知を OFF にすることができます。
        </p>
      </header>

      {/* 仕組みの説明 */}
      <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
        <Bell
          className="mt-0.5 h-5 w-5 flex-shrink-0 text-slate-500"
          aria-hidden="true"
        />
        <div>
          <p className="font-medium text-slate-800">
            現在のリマインドは「画面内のみ」です
          </p>
          <p className="mt-1 text-slate-600 leading-relaxed">
            メール送信は行いません。次回ログインいただいたダッシュボードで
            「OO日以上ログインがありません」という黄色の帯が表示されます。
            （メール通知機能は今後のアップデートで追加予定です）
          </p>
        </div>
      </div>

      {/* 設定フォーム */}
      <ReminderSettingsForm initialSetting={setting} />

      {/* 状態のサマリー */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 text-xs text-slate-500">
        <p>
          最終ログイン日：
          <span className="ml-1 font-medium text-slate-700">
            {setting.last_login_at
              ? new Date(setting.last_login_at).toLocaleString('ja-JP')
              : '未記録'}
          </span>
        </p>
      </div>
    </div>
  );
}
