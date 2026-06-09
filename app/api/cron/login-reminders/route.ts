/**
 * GET /api/cron/login-reminders
 *
 * 定期ログイン催促（情報の最新化リマインド）の Cron Job。
 *
 * 【設計（2026-06-05 改訂・#34）】
 * 最終ログイン日時は、自前の digital_reminder_settings.last_login_at ではなく
 * Supabase 標準の auth.users.last_sign_in_at を「正」とする。理由：
 *   - パスワードログインは auth/callback を通らず last_login_at が更新されない
 *   - 設定行の自動作成トリガーが本番で機能しておらず、行自体が無い場合がある
 * → auth.users を基準にすれば、Google/パスワード問わず・行の有無に関係なく
 *    全利用者に確実に効く。
 *
 * digital_reminder_settings は「利用者の希望（有効/無効・間隔）」と
 * 「最後にリマインドした日時（再送制御）」の保存にのみ使う。行が無ければ
 * 既定（有効・90 日）で扱い、リマインド送信時に cron が行を upsert で自己修復する。
 *
 * 再送制御：
 *   ① 一度も送っていない（last_reminded_at なし）
 *   ② 前回リマインド後にログインした（last_reminded_at < last_sign_in_at）→ リセット
 *   ③ 前回リマインドから interval 日以上経過（不在継続中の再通知）
 *   → 毎日は届かず、不在が続く間は間隔ごとに 1 回ずつ。
 *
 * 認証：CRON_SECRET（Authorization: Bearer {CRON_SECRET}）。
 * スケジュール：vercel.json（毎日 JST 08:00）。
 */

import { NextResponse } from 'next/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { getDisplayNameById } from '@/lib/digital/profile';
import { sendLoginReminderEmail } from '@/lib/email/loginReminder';
import type { DigitalReminderSetting } from '@/types/digital';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const DEFAULT_ENABLED = true;
const DEFAULT_INTERVAL = 90;
const USERS_PER_PAGE = 200;
const MAX_PAGES = 50; // 安全上限（最大 1 万ユーザー）

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

type Pref = {
  enabled: boolean;
  interval: number;
  lastRemindedMs: number | null;
};

/**
 * 設定行（無ければ既定）と最終ログインから、今送るべきか判定する。
 * 送るべきなら経過日数を、不要なら null を返す。
 */
function shouldRemind(
  pref: Pref,
  lastSignInMs: number,
  nowMs: number
): number | null {
  if (!pref.enabled) return null;

  const daysSinceLogin = daysBetween(lastSignInMs, nowMs);
  if (daysSinceLogin < pref.interval) return null;

  const { lastRemindedMs } = pref;
  // ① 一度も送っていない
  if (lastRemindedMs === null) return daysSinceLogin;
  // ② 前回リマインド後にログインした（不在期間がリセットされた）
  if (lastRemindedMs < lastSignInMs) return daysSinceLogin;
  // ③ 前回リマインドから interval 日以上経過（不在継続中の再通知）
  if (daysBetween(lastRemindedMs, nowMs) >= pref.interval) return daysSinceLogin;
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
    users_checked: 0,
    reminders_sent: 0,
    mail_errors: 0,
    skipped: 0,
    errors: 0,
  };

  try {
    const admin = createAdminSupabaseClient();
    const nowMs = Date.now();
    const dashboardUrl = `${getAppUrl()}/digital`;

    // ① 設定（希望・再送状態）を一括取得して Map 化（行が無ければ既定で扱う）
    const prefByUser = new Map<string, Pref>();
    {
      const { data, error } = await admin
        .from('digital_reminder_settings')
        .select('user_id, reminder_enabled, reminder_interval, last_reminded_at');
      if (error) {
        console.error('[cron/login-reminders] settings fetch failed', error);
      } else {
        for (const row of (data ?? []) as Array<
          Pick<
            DigitalReminderSetting,
            'user_id' | 'reminder_enabled' | 'reminder_interval' | 'last_reminded_at'
          >
        >) {
          prefByUser.set(row.user_id, {
            enabled: row.reminder_enabled,
            interval: row.reminder_interval,
            lastRemindedMs: row.last_reminded_at
              ? new Date(row.last_reminded_at).getTime()
              : null,
          });
        }
      }
    }

    // ② auth.users をページングで走査（last_sign_in_at を正とする）
    for (let page = 1; page <= MAX_PAGES; page++) {
      const { data, error } = await admin.auth.admin.listUsers({
        page,
        perPage: USERS_PER_PAGE,
      });
      if (error) {
        console.error('[cron/login-reminders] listUsers failed', error);
        summary.errors++;
        break;
      }
      const users = data?.users ?? [];
      if (users.length === 0) break;

      for (const u of users) {
        summary.users_checked++;

        const email = u.email;
        // 最終ログイン。未ログインなら作成日時を代替に使う（招待後すぐ放置の検知）
        const lastSignInIso = u.last_sign_in_at ?? u.created_at;
        if (!email || !lastSignInIso) {
          summary.skipped++;
          continue;
        }
        const lastSignInMs = new Date(lastSignInIso).getTime();

        const pref: Pref = prefByUser.get(u.id) ?? {
          enabled: DEFAULT_ENABLED,
          interval: DEFAULT_INTERVAL,
          lastRemindedMs: null,
        };

        const daysSinceLogin = shouldRemind(pref, lastSignInMs, nowMs);
        if (daysSinceLogin === null) {
          summary.skipped++;
          continue;
        }

        try {
          // 表示名（任意）
          let displayName: string | null = null;
          try {
            const profile = await getDisplayNameById(admin, u.id);
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
            continue; // last_reminded_at は更新しない（次回再試行）
          }

          // 送信成功 → 設定行を upsert して last_reminded_at を記録（行が無ければ自己修復）
          await admin.from('digital_reminder_settings').upsert(
            {
              user_id: u.id,
              reminder_enabled: pref.enabled,
              reminder_interval: pref.interval,
              last_reminded_at: new Date().toISOString(),
            },
            { onConflict: 'user_id' }
          );

          summary.reminders_sent++;
        } catch (err) {
          summary.errors++;
          console.error('[cron/login-reminders] per-user failed', {
            userId: u.id,
            err,
          });
        }
      }

      if (users.length < USERS_PER_PAGE) break; // 最終ページ
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
