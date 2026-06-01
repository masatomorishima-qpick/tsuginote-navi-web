/**
 * /digital/settings/notifications — 通知設定
 *
 * 設定トップから遷移する、リマインダー間隔の設定用サブページ。
 * 表示は既存の ReminderSettingsForm コンポーネントをそのまま利用する。
 *
 * 2026-05 改訂：ダッシュボード新スタイル（bg-[#F5F5F0] + 白丸角カード）に統一。
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Bell } from 'lucide-react';
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
    <div className="min-h-screen bg-[#F5F5F0]">
      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-10">
        {/* 大見出し（中央寄せ、十分な余白） */}
        <header className="mb-6 sm:mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            通知
          </h1>
        </header>

        <div className="space-y-4">
        {/* 説明 */}
        <p className="px-1 text-xs text-gray-500 leading-relaxed">
          長期間ログインが無いときに、ダッシュボードでお知らせします。
          間隔の変更や、通知を OFF にすることができます。
        </p>

        {/* 仕組みの案内 */}
        <section
          aria-labelledby="notif-mechanism"
          className="bg-white rounded-2xl border border-gray-100 p-5"
        >
          <h2
            id="notif-mechanism"
            className="flex items-center gap-2 text-base font-medium text-gray-900"
          >
            <Bell className="h-4 w-4 flex-shrink-0 text-gray-500" aria-hidden="true" />
            現在のリマインドは「画面内のみ」です
          </h2>
          <p className="mt-2 text-sm text-gray-600 leading-relaxed">
            メール送信は行いません。次回ログインいただいたダッシュボードで
            「OO日以上ログインがありません」という黄色の帯が表示されます。
            （メール通知機能は今後のアップデートで追加予定です）
          </p>
        </section>

        {/* 設定フォーム */}
        <section className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6">
          <ReminderSettingsForm initialSetting={setting} />
        </section>

        {/* 状態のサマリー */}
        <section className="bg-white rounded-2xl border border-gray-100 p-5">
          <p className="text-xs text-gray-500">
            最終ログイン日：
            <span className="ml-1 font-medium text-gray-700">
              {setting.last_login_at
                ? new Date(setting.last_login_at).toLocaleString('ja-JP')
                : '未記録'}
            </span>
          </p>
        </section>

        {/* 戻るリンク（下部） */}
        <div className="pt-4 text-center">
          <Link
            href="/digital/settings"
            className="inline-flex items-center gap-1 text-sm text-emerald-600 active:opacity-70"
          >
            ← 設定に戻る
          </Link>
        </div>
        </div>
      </div>
    </div>
  );
}
