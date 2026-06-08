/**
 * GET /api/cron/login-reminders
 *
 * 定期ログイン催促（情報の最新化リマインド）の Cron Job。
 *
 * 対象：reminder_enabled=true かつ、最終ログインから reminder_interval 日以上
 *   経過している利用者。各利用者の設定間隔（30/60/90/180 日）に従う。
 *
 * 再送制御（last_reminded_at で管理）：
 *   いったん送ったら、次の条件を満たすまで再送しない＝
 *     ① 一度もリマインドしていない（last_reminded_at IS NULL）
 *     ② その後ログインした（last_reminded_at < last_login_at）→ 不在期間がリセット
 *     ③ 前回リマインドからさらに reminder_interval 日以上経過（不在が続く場合の再通知）
 *   これにより「毎日届く」ことはなく、不在が続く間は間隔ごとに 1 回ずつ届く。
 *
 * 認証：CRON_SECRET（Authorization: Bearer {CRON_SECRET}）。
 * スケジュール：vercel.json で定義（毎日 JST 朝）。
 */

import { NextResponse } from 'next/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { getDisplayNameById } from '@/lib/digital/profile';
import { sendLoginReminderEmail } from '@/lib/email/loginReminder';
import type { DigitalReminderSetting } from '@/types/digital';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const MAX_BATCH_SIZE = 200;

function getAppUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL ?? 'https://tsuginotenavi.jp').replace(
    /\/+$/,
    ''
  );
}

function verifyCronAuth(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        '[cron/login-reminders] CRON_SECRET is not set; auth bypassed (dev only)'
      );
      return true;
    }
    return false;
  }
  const auth = req.headers.get('authorization');
  return auth === `Bearer ${secret}`;
}

function daysBetween(fromMs: number, toMs: number): number {
  return Math.floor((toMs - fromMs) / MS_PER_DAY);
}

/**
 * このユーザーに今リマインドを送るべきか判定する。
 * 送るべきなら daysSinceLogin を、不要なら null を返す。
 */
function shouldRemind(
  setting: DigitalReminderSetting,
  nowMs: number
): number | null {
  if (!setting.reminder_enabled) return null;
  if (!setting.last_login_at) return null;

  const lastLoginMs = new Date(setting.last_login_at).getTime();
  const daysSinceLogin = daysBetween(lastLoginMs, nowMs);
  if (daysSinceLogin < setting.reminder_interval) return null;

  const lastRemindedMs = setting.last_reminded_at
    ? new Date(setting.last_reminded_at).getTime()
    : null;

  // ① 一度も送っていない
  if (lastRemindedMs === null) return daysSinceLogin;
  // ② 前回リマインド後にログインした（不在期間がリセットされた）
  if (lastRemindedMs < lastLoginMs) return daysSinceLogin;
  // ③ 前回リマインドから interval 日以上経過（不在継続中の再通知）
  if (daysBetween(lastRemindedMs, nowMs) >= setting.reminder_interval) {
    return daysSinceLogin;
  }
  return null;
}

export async function GET(req: Request) {
  if (!verifyCronAuth(req)) {
    return NextResponse.json(
      { ok: false, error: 'unauthorized' },
      { status: 401 }
    );
  }

  const summary = {
    started_at: new Date().toISOString(),
    candidates_checked: 0,
    reminders_sent: 0,
    mail_errors: 0,
    skipped: 0,
    errors: 0,
  };

  try {
    const admin = createAdminSupabaseClient();
    const nowMs = Date.now();
    const dashboardUrl = `${getAppUrl()}/digital`;

    // enabled かつ last_login がある行のみ取得（古い順＝より長く不在の人を優先）
    const { data, error } = await admin
      .from('digital_reminder_settings')
      .select('*')
      .eq('reminder_enabled', true)
      .not('last_login_at', 'is', null)
      .order('last_login_at', { ascending: true })
      .limit(MAX_BATCH_SIZE);

    if (error) {
      console.error('[cron/login-reminders] fetch failed', error);
      return NextResponse.json(
        { ok: false, error: 'fetch_failed', detail: error.message },
        { status: 500 }
      );
    }

    const settings = (data ?? []) as DigitalReminderSetting[];

    for (const setting of settings) {
      summary.candidates_checked++;
      const daysSinceLogin = shouldRemind(setting, nowMs);
      if (daysSinceLogin === null) {
        summary.skipped++;
        continue;
      }

      try {
        // メールアドレス取得
        const { data: u } = await admin.auth.admin.getUserById(
          setting.user_id
        );
        const email = u?.user?.email;
        if (!email) {
          summary.skipped++;
          continue;
        }

        // 表示名（任意）
        let displayName: string | null = null;
        try {
          const profile = await getDisplayNameById(admin, setting.user_id);
          displayName =
            profile?.display_name ?? profile?.preferred_name ?? null;
        } catch {
          // ignore
        }

        const mailRes = await sendLoginReminderEmail({
          recipientEmail: email,
          displayName,
          daysSinceLogin,
          dashboardUrl,
        });

        if (!mailRes.ok) {
          summary.mail_errors++;
          // 送信失敗時は last_reminded_at を更新しない（次回再試行されるように）
          continue;
        }

        // 送信成功 → last_reminded_at を更新（再送制御）
        await admin
          .from('digital_reminder_settings')
          .update({ last_reminded_at: new Date().toISOString() })
          .eq('user_id', setting.user_id);

        summary.reminders_sent++;
      } catch (err) {
        summary.errors++;
        console.error('[cron/login-reminders] per-user failed', {
          userId: setting.user_id,
          err,
        });
      }
    }

    console.log('[cron/login-reminders] done', summary);
    return NextResponse.json({ ok: true, summary });
  } catch (err) {
    const detail = err instanceof Error ? err.message : 'unexpected_error';
    console.error('[cron/login-reminders] failed', detail);
    return NextResponse.json(
      { ok: false, error: 'unexpected', detail, summary },
      { status: 500 }
    );
  }
}
