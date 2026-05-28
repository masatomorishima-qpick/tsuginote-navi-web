/**
 * リマインダー設定 (digital_reminder_settings) の読み書き + 状態計算
 *
 * - 初回ログイン時に 001 migration のトリガーで行が自動作成されるので、
 *   `getOrInitReminderSettings` は基本的に存在する行を返す。
 *   レガシーユーザーや稀にトリガー漏れしたケースの保険として自前 upsert も持つ。
 * - `touchLastLogin` は auth/callback から fire-and-forget で呼ぶ。
 * - `computeReminderStatus` は純粋関数なので types/digital.ts にも置けたが、
 *   リマインダー計算のロジックは他所から直接叩いてほしくないため、server-only にしてある。
 *   画面に値を渡すときは DTO を計算した結果だけを渡す設計。
 */

import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { DigitalReminderSetting } from '@/types/digital';

// =============================================================================
// CRUD
// =============================================================================

/**
 * 本人のリマインド設定を取得する。存在しない場合は NULL。
 * （001 の `digital_handle_new_user` トリガーで通常は自動作成される）
 */
export async function getReminderSettings(
  supabase: SupabaseClient,
  userId: string
): Promise<DigitalReminderSetting | null> {
  const { data, error } = await supabase
    .from('digital_reminder_settings')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('[lib/digital/reminders] getReminderSettings failed', error);
    throw new Error(error.message);
  }
  return (data as DigitalReminderSetting | null) ?? null;
}

/**
 * 設定を取得し、存在しなければデフォルト値で作成して返す。
 */
export async function getOrInitReminderSettings(
  supabase: SupabaseClient,
  userId: string
): Promise<DigitalReminderSetting> {
  const existing = await getReminderSettings(supabase, userId);
  if (existing) return existing;

  const { data, error } = await supabase
    .from('digital_reminder_settings')
    .insert({
      user_id: userId,
      reminder_enabled: true,
      reminder_interval: 90,
      last_login_at: new Date().toISOString(),
    })
    .select('*')
    .single();

  if (error) {
    console.error(
      '[lib/digital/reminders] getOrInitReminderSettings insert failed',
      error
    );
    throw new Error(error.message);
  }
  return data as DigitalReminderSetting;
}

/**
 * 設定を保存する（upsert）。user_id は UNIQUE 制約があるので安全。
 */
export async function updateReminderSettings(
  supabase: SupabaseClient,
  userId: string,
  input: {
    reminder_enabled: boolean;
    reminder_interval: 30 | 60 | 90 | 180;
  }
): Promise<DigitalReminderSetting> {
  const { data, error } = await supabase
    .from('digital_reminder_settings')
    .upsert(
      {
        user_id: userId,
        reminder_enabled: input.reminder_enabled,
        reminder_interval: input.reminder_interval,
      },
      { onConflict: 'user_id' }
    )
    .select('*')
    .single();

  if (error) {
    console.error(
      '[lib/digital/reminders] updateReminderSettings failed',
      error
    );
    throw new Error(error.message);
  }
  return data as DigitalReminderSetting;
}

/**
 * last_login_at を現在時刻に更新する。
 * auth/callback から fire-and-forget で呼ぶ前提なので、例外を外に投げない。
 */
export async function touchLastLogin(
  supabase: SupabaseClient,
  userId: string
): Promise<void> {
  try {
    // 行が無いケース（レガシーユーザー）も考慮して upsert。
    const { error } = await supabase
      .from('digital_reminder_settings')
      .upsert(
        {
          user_id: userId,
          last_login_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      );

    if (error) {
      console.error('[lib/digital/reminders] touchLastLogin failed', {
        message: error.message,
        code: error.code,
      });
    }
  } catch (err) {
    console.error('[lib/digital/reminders] touchLastLogin unexpected', err);
  }
}

// =============================================================================
// 状態計算（画面に渡す DTO）
// =============================================================================

export type ReminderStatus = {
  enabled: boolean;
  interval: number;
  daysSinceLogin: number | null;
  daysUntilReminder: number | null; // 負値なら「すでに過ぎている」
  isOverdue: boolean;
  lastLoginAt: string | null;
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function computeReminderStatus(
  setting: DigitalReminderSetting
): ReminderStatus {
  const now = Date.now();

  const lastLoginMs = setting.last_login_at
    ? new Date(setting.last_login_at).getTime()
    : null;

  const daysSinceLogin =
    lastLoginMs === null
      ? null
      : Math.floor((now - lastLoginMs) / MS_PER_DAY);

  const daysUntilReminder =
    daysSinceLogin === null ? null : setting.reminder_interval - daysSinceLogin;

  const isOverdue = setting.reminder_enabled
    ? daysUntilReminder !== null && daysUntilReminder <= 0
    : false;

  return {
    enabled: setting.reminder_enabled,
    interval: setting.reminder_interval,
    daysSinceLogin,
    daysUntilReminder,
    isOverdue,
    lastLoginAt: setting.last_login_at,
  };
}
