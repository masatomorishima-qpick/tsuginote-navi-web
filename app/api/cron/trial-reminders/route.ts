/**
 * GET /api/cron/trial-reminders
 *
 * 毎日深夜に実行する Cron Job：
 *   - トライアル終了 5 日前のリマインドメール送信
 *   - トライアル満了当日の通知メール送信
 *
 * 送信履歴は digital_subscriptions の trial_warning_sent_at / trial_ended_sent_at で
 * 管理し、重複送信を防止する。
 *
 * 認証：CRON_SECRET 環境変数で認証。Vercel Cron は Authorization ヘッダに
 *       「Bearer {CRON_SECRET}」を付けて呼ぶ。
 *
 * 実行スケジュール（vercel.json で定義）：
 *   - 毎日 JST 02:00（UTC 17:00 前日）
 */

import { NextResponse } from 'next/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import {
  sendTrialWarningEmail,
  sendTrialEndedEmail,
} from '@/lib/email/trialReminder';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// リマインド発火日数（トライアル終了 N 日前）
const WARNING_DAYS_BEFORE = 5;

// 1 回の実行で処理する最大件数（無限ループ予防）
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
    // ローカル開発：CRON_SECRET 未設定なら検証スキップ（注意：本番では必ず設定）
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        '[cron/trial-reminders] CRON_SECRET is not set; auth bypassed (dev only)'
      );
      return true;
    }
    return false;
  }
  const auth = req.headers.get('authorization');
  return auth === `Bearer ${secret}`;
}

export async function GET(req: Request) {
  // ① 認証
  if (!verifyCronAuth(req)) {
    return NextResponse.json(
      { ok: false, error: 'unauthorized' },
      { status: 401 }
    );
  }

  const admin = createAdminSupabaseClient();
  const now = new Date();
  const upgradeUrl = `${getAppUrl()}/digital/settings/plan`;

  // 結果サマリーを返す（運用時の Cron 観測用）
  const summary = {
    started_at: now.toISOString(),
    warning_sent: 0,
    warning_errors: 0,
    ended_sent: 0,
    ended_errors: 0,
    skipped: 0,
  };

  try {
    // ② リマインドメール送信対象
    //    条件：status='trialing' / trial_expires_at が WARNING_DAYS_BEFORE 日以内に切れる
    //    かつ stripe_subscription_id がまだ無い（カード未登録）
    //    かつ trial_warning_sent_at が NULL（未送信）
    const warningDeadline = new Date(
      now.getTime() + WARNING_DAYS_BEFORE * 24 * 60 * 60 * 1000
    );

    const { data: warningCandidates, error: warningErr } = await admin
      .from('digital_subscriptions')
      .select('user_id, trial_expires_at')
      .eq('status', 'trialing')
      .is('stripe_subscription_id', null)
      .is('trial_warning_sent_at', null)
      .not('trial_expires_at', 'is', null)
      .lt('trial_expires_at', warningDeadline.toISOString())
      .gt('trial_expires_at', now.toISOString())
      .limit(MAX_BATCH_SIZE);

    if (warningErr) {
      console.error('[cron/trial-reminders] warning lookup failed', warningErr);
    } else {
      for (const row of warningCandidates ?? []) {
        const userId = row.user_id as string;
        const trialExpiresAt = row.trial_expires_at as string;

        // ユーザーのメールを取得
        let email: string | null = null;
        try {
          const { data: u } = await admin.auth.admin.getUserById(userId);
          email = u?.user?.email ?? null;
        } catch (err) {
          console.warn('[cron/trial-reminders] getUser failed', { userId, err });
        }
        if (!email) {
          summary.skipped++;
          continue;
        }

        const expDate = new Date(trialExpiresAt);
        const daysLeft = Math.max(
          1,
          Math.ceil((expDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000))
        );

        const mailRes = await sendTrialWarningEmail({
          recipientEmail: email,
          daysLeft,
          trialExpiresAt: expDate,
          upgradeUrl,
        });
        if (mailRes.ok) {
          summary.warning_sent++;
          await admin
            .from('digital_subscriptions')
            .update({
              trial_warning_sent_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('user_id', userId);
        } else {
          summary.warning_errors++;
          console.warn('[cron/trial-reminders] warning send failed', {
            userId,
            error: mailRes.error,
          });
        }
      }
    }

    // ③ 満了通知メール送信対象
    //    条件：status='trialing' / trial_expires_at が現在より過去
    //    かつ stripe_subscription_id がまだ無い（カード未登録）
    //    かつ trial_ended_sent_at が NULL（未送信）
    const { data: endedCandidates, error: endedErr } = await admin
      .from('digital_subscriptions')
      .select('user_id, trial_expires_at')
      .eq('status', 'trialing')
      .is('stripe_subscription_id', null)
      .is('trial_ended_sent_at', null)
      .not('trial_expires_at', 'is', null)
      .lt('trial_expires_at', now.toISOString())
      .limit(MAX_BATCH_SIZE);

    if (endedErr) {
      console.error('[cron/trial-reminders] ended lookup failed', endedErr);
    } else {
      for (const row of endedCandidates ?? []) {
        const userId = row.user_id as string;
        const trialExpiresAt = row.trial_expires_at as string;

        let email: string | null = null;
        try {
          const { data: u } = await admin.auth.admin.getUserById(userId);
          email = u?.user?.email ?? null;
        } catch {
          email = null;
        }
        if (!email) {
          summary.skipped++;
          continue;
        }

        const mailRes = await sendTrialEndedEmail({
          recipientEmail: email,
          endedAt: new Date(trialExpiresAt),
          upgradeUrl,
        });
        if (mailRes.ok) {
          summary.ended_sent++;
          await admin
            .from('digital_subscriptions')
            .update({
              trial_ended_sent_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('user_id', userId);
        } else {
          summary.ended_errors++;
          console.warn('[cron/trial-reminders] ended send failed', {
            userId,
            error: mailRes.error,
          });
        }
      }
    }

    console.log('[cron/trial-reminders] done', summary);
    return NextResponse.json({ ok: true, summary });
  } catch (err) {
    const detail = err instanceof Error ? err.message : 'unexpected_error';
    console.error('[cron/trial-reminders] threw', detail);
    return NextResponse.json(
      { ok: false, error: 'unexpected', detail, summary },
      { status: 500 }
    );
  }
}
