/**
 * GET /api/cron/disclose-expired
 *
 * 毎日深夜に実行する Cron Job：
 *   - objection_deadline を過ぎた死亡通知（status='awaiting_objection_period'）を
 *     'disclosed' に遷移させる
 *   - 各 owner の全 active 連携者にメール送信
 *   - 各 owner の Stripe subscription を即時 cancel（本人逝去のため課金停止）
 *
 * 認証：CRON_SECRET（Vercel Cron が自動付与）
 * スケジュール：vercel.json で「0 17 * * *」（UTC 17:00 = JST 02:00）に追加
 */

import { NextResponse } from 'next/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import {
  listExpiredAwaitingNotices,
  markDisclosed,
} from '@/lib/digital/deathNotice';
import { listLinksByOwner } from '@/lib/digital/family';
import { getDisplayNameById } from '@/lib/digital/profile';
import { sendDisclosureNotifyEmail } from '@/lib/email/deathNotice';
import { stripeRequest } from '@/lib/stripe/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_BATCH = 50;

function verifyCronAuth(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[cron/disclose-expired] CRON_SECRET 未設定（dev 用バイパス）');
      return true;
    }
    return false;
  }
  return req.headers.get('authorization') === `Bearer ${secret}`;
}

function getAppUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL ?? 'https://tsuginotenavi.jp').replace(
    /\/+$/,
    ''
  );
}

async function cancelOwnerSubscription(
  admin: ReturnType<typeof createAdminSupabaseClient>,
  ownerUserId: string
): Promise<{ ok: boolean; detail?: string }> {
  // 該当 owner の subscription を取得して Stripe 即時キャンセル
  const { data: sub } = await admin
    .from('digital_subscriptions')
    .select('stripe_subscription_id')
    .eq('user_id', ownerUserId)
    .maybeSingle();

  const subId = sub?.stripe_subscription_id as string | null | undefined;
  if (!subId) return { ok: true, detail: 'no_subscription_to_cancel' };

  try {
    await stripeRequest({
      method: 'DELETE',
      path: `/v1/subscriptions/${subId}`,
    });
    // DB の status も更新（Webhook 来るまでの暫定）
    await admin
      .from('digital_subscriptions')
      .update({
        status: 'canceled',
        cancel_at_period_end: false,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', ownerUserId);
    return { ok: true };
  } catch (err) {
    const detail = err instanceof Error ? err.message : 'cancel_failed';
    console.warn('[cron/disclose-expired] subscription cancel failed', {
      subId,
      detail,
    });
    return { ok: false, detail };
  }
}

export async function GET(req: Request) {
  if (!verifyCronAuth(req)) {
    return NextResponse.json(
      { ok: false, error: 'unauthorized' },
      { status: 401 }
    );
  }

  const admin = createAdminSupabaseClient();
  const startedAt = new Date().toISOString();
  const summary = {
    started_at: startedAt,
    disclosed_count: 0,
    mail_sent: 0,
    mail_errors: 0,
    subscription_canceled: 0,
    subscription_cancel_errors: 0,
    errors: 0,
  };

  try {
    const expired = await listExpiredAwaitingNotices(admin, MAX_BATCH);

    for (const notice of expired) {
      // ① notice を disclosed に更新
      const disclosure = await markDisclosed(admin, notice.id);
      if (!disclosure.ok) {
        summary.errors++;
        console.warn('[cron/disclose-expired] markDisclosed failed', {
          noticeId: notice.id,
          error: disclosure.error,
        });
        continue;
      }
      summary.disclosed_count++;

      // owner 表示名
      let ownerDisplayName = '本人';
      try {
        const owner = await getDisplayNameById(admin, notice.owner_user_id);
        ownerDisplayName =
          owner?.display_name ?? owner?.preferred_name ?? ownerDisplayName;
      } catch {
        // ignore
      }

      // ② 連携者全員に開示通知メール送信
      let activeLinks: Awaited<ReturnType<typeof listLinksByOwner>> = [];
      try {
        activeLinks = await listLinksByOwner(admin, notice.owner_user_id);
      } catch (err) {
        console.warn('[cron/disclose-expired] listLinksByOwner failed', err);
      }
      const activeOnly = activeLinks.filter((l) => l.status === 'active');
      const dashboardUrl = `${getAppUrl()}/digital`;

      for (const link of activeOnly) {
        // recipient email を取得
        let email: string | null = null;
        try {
          const { data: u } = await admin.auth.admin.getUserById(
            link.recipient_user_id
          );
          email = u?.user?.email ?? null;
        } catch {
          email = null;
        }
        if (!email) {
          summary.mail_errors++;
          continue;
        }
        const mailRes = await sendDisclosureNotifyEmail({
          recipientEmail: email,
          recipientName: link.recipient_name ?? '大切な方',
          ownerDisplayName,
          dashboardUrl,
        });
        if (mailRes.ok) {
          summary.mail_sent++;
        } else {
          summary.mail_errors++;
          console.warn('[cron/disclose-expired] mail send failed', {
            email,
            error: mailRes.error,
          });
        }
      }

      // ③ サブスク即時キャンセル
      const cancelRes = await cancelOwnerSubscription(admin, notice.owner_user_id);
      if (cancelRes.ok) {
        summary.subscription_canceled++;
      } else {
        summary.subscription_cancel_errors++;
      }
    }

    console.log('[cron/disclose-expired] done', summary);
    return NextResponse.json({ ok: true, summary });
  } catch (err) {
    const detail = err instanceof Error ? err.message : 'unexpected_error';
    console.error('[cron/disclose-expired] threw', detail);
    return NextResponse.json(
      { ok: false, error: 'unexpected', detail, summary },
      { status: 500 }
    );
  }
}
