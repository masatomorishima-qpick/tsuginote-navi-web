/**
 * GET /api/cron/purge-disclosed-owners
 *
 * 毎日深夜に実行する Cron Job：
 *   - disclosed（情報開示済み）の死亡通知のうち、disclosed_at から 365 日以上経過した
 *     オーナーのアカウントを `auth.users` ごと完全削除する。
 *   - 全テーブルが auth.users(id) ON DELETE CASCADE を設定しているため、
 *     digital_assets / digital_devices / digital_pin_secrets / digital_kek_envelopes /
 *     digital_family_links / digital_family_invitations / digital_death_notices /
 *     digital_reminder_settings / digital_subscriptions などは自動で消滅する。
 *   - digital_audit_logs は ON DELETE SET NULL のため、ログ本体は user_id=NULL で残存し、
 *     001 migration の cleanup policy により 90 日後に自動削除される。
 *   - 各オーナー単位で失敗してもバッチ全体は継続する。
 *
 * 設計上の前提（LP の「ご利用の流れ」STEP5、利用規約 §13-9 と整合）：
 *   - 1 年間 = 365 日 と定義。閏年などの厳密扱いは不要（運用上 1 日のズレ許容）。
 *   - 削除対象は disclosed 状態のオーナー本人のアカウント。
 *     連携相手（recipient）のアカウントは引き続き利用可能なので削除しない。
 *
 * 認証: CRON_SECRET（Vercel Cron が自動付与）
 * スケジュール: vercel.json で「0 19 * * *」（UTC 19:00 = JST 04:00）
 */

import { NextResponse } from 'next/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { listDisclosedNoticesOlderThan } from '@/lib/digital/deathNotice';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** 開示から完全削除までの日数（= 1 年）。LP / 利用規約 §13-9 と整合 */
const PURGE_DAYS_AFTER_DISCLOSURE = 365;

/** 1 回の実行で処理する最大件数（Cron のタイムアウト・Stripe レート制限を考慮） */
const MAX_BATCH = 50;

function verifyCronAuth(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        '[cron/purge-disclosed-owners] CRON_SECRET 未設定（dev 用バイパス）'
      );
      return true;
    }
    return false;
  }
  return req.headers.get('authorization') === `Bearer ${secret}`;
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
    days_after_disclosure: PURGE_DAYS_AFTER_DISCLOSURE,
    notices_checked: 0,
    owners_purged: 0,
    purge_errors: 0,
    audit_log_errors: 0,
  };

  try {
    // ① 対象通知を取得：disclosed && disclosed_at < 365 日前
    const expiredNotices = await listDisclosedNoticesOlderThan(
      admin,
      PURGE_DAYS_AFTER_DISCLOSURE,
      MAX_BATCH
    );
    summary.notices_checked = expiredNotices.length;

    // 同じオーナーが複数 disclosed 通知を持つことは設計上ありえないが、
    // 念のため owner_user_id でユニーク化してから削除ループに入る。
    const ownerToNotice = new Map<
      string,
      { id: string; owner_user_id: string; disclosed_at: string | null }
    >();
    for (const notice of expiredNotices) {
      if (!ownerToNotice.has(notice.owner_user_id)) {
        ownerToNotice.set(notice.owner_user_id, {
          id: notice.id,
          owner_user_id: notice.owner_user_id,
          disclosed_at: notice.disclosed_at,
        });
      }
    }

    for (const target of ownerToNotice.values()) {
      // ② 削除前に監査ログを記録（user_id が消える前に証跡を残す）
      try {
        await admin.from('digital_audit_logs').insert({
          user_id: target.owner_user_id,
          action: 'account_delete',
          resource_id: target.id,
          metadata: {
            reason: 'post_disclosure_purge',
            disclosed_at: target.disclosed_at,
            purged_at: new Date().toISOString(),
            days_after_disclosure: PURGE_DAYS_AFTER_DISCLOSURE,
          },
        });
      } catch (err) {
        summary.audit_log_errors++;
        console.warn(
          '[cron/purge-disclosed-owners] audit log insert failed',
          {
            ownerUserId: target.owner_user_id,
            noticeId: target.id,
            error: err instanceof Error ? err.message : String(err),
          }
        );
        // 監査ログ失敗でも削除は実行する（運用上の重要度: 削除 > ログ）
      }

      // ③ auth.users を削除 → CASCADE で全データ消滅
      const { error: deleteErr } = await admin.auth.admin.deleteUser(
        target.owner_user_id
      );

      if (deleteErr) {
        summary.purge_errors++;
        console.error('[cron/purge-disclosed-owners] deleteUser failed', {
          ownerUserId: target.owner_user_id,
          noticeId: target.id,
          status: deleteErr.status,
          message: deleteErr.message,
        });
        continue;
      }

      summary.owners_purged++;
    }

    console.log('[cron/purge-disclosed-owners] done', summary);
    return NextResponse.json({ ok: true, summary });
  } catch (err) {
    const detail = err instanceof Error ? err.message : 'unexpected_error';
    console.error('[cron/purge-disclosed-owners] threw', detail);
    return NextResponse.json(
      { ok: false, error: 'unexpected', detail, summary },
      { status: 500 }
    );
  }
}
