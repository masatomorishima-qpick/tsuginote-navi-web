/**
 * GET /api/cron/cleanup-death-documents
 *
 * 毎日深夜に実行する Cron Job：
 *   - disclosed（情報開示済み）の死亡通知のうち、disclosed_at から 7 日以上経過した
 *     ものに紐づく書類（Supabase Storage 上のファイルと digital_death_documents 行）を
 *     一括削除する。
 *   - 既に削除済みの通知は no-op として通過する（冪等）。
 *   - 削除実行時は digital_audit_logs に記録を残す。
 *
 * 認証: CRON_SECRET（Vercel Cron が自動付与）
 * スケジュール: vercel.json で「0 18 * * *」（UTC 18:00 = JST 03:00）
 */

import { NextResponse } from 'next/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { listDisclosedNoticesOlderThan } from '@/lib/digital/deathNotice';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const STORAGE_BUCKET = 'death-documents';
const DAYS_AFTER_DISCLOSURE = 7;
const MAX_BATCH = 100;

function verifyCronAuth(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        '[cron/cleanup-death-documents] CRON_SECRET 未設定（dev 用バイパス）'
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
    days_after_disclosure: DAYS_AFTER_DISCLOSURE,
    notices_checked: 0,
    notices_with_docs: 0,
    storage_files_deleted: 0,
    storage_delete_errors: 0,
    db_rows_deleted: 0,
    db_delete_errors: 0,
  };

  try {
    // ① 対象通知を取得：disclosed && disclosed_at < 7 日前
    const expiredNotices = await listDisclosedNoticesOlderThan(
      admin,
      DAYS_AFTER_DISCLOSURE,
      MAX_BATCH
    );
    summary.notices_checked = expiredNotices.length;

    for (const notice of expiredNotices) {
      // ② 紐づく書類を取得
      const { data: docs, error: docsErr } = await admin
        .from('digital_death_documents')
        .select('id, storage_path, file_name')
        .eq('death_notice_id', notice.id);

      if (docsErr) {
        console.warn('[cron/cleanup-death-documents] doc list failed', {
          noticeId: notice.id,
          error: docsErr.message,
        });
        continue;
      }
      if (!docs || docs.length === 0) {
        // 既にクリーンアップ済み（冪等性）
        continue;
      }

      summary.notices_with_docs++;

      // ③ Storage から削除
      // storage_path は "death-documents/{noticeId}/{uuid}_{name}" の形式で保存されているため、
      // バケット名のプレフィックスを除去してから remove() に渡す。
      const storagePaths = docs.map((d) => {
        const path = d.storage_path as string;
        return path.startsWith(`${STORAGE_BUCKET}/`)
          ? path.slice(STORAGE_BUCKET.length + 1)
          : path;
      });

      const { data: removed, error: removeErr } = await admin.storage
        .from(STORAGE_BUCKET)
        .remove(storagePaths);

      if (removeErr) {
        console.warn('[cron/cleanup-death-documents] storage remove failed', {
          noticeId: notice.id,
          error: removeErr.message,
        });
        summary.storage_delete_errors += storagePaths.length;
        // Storage 側の削除が失敗した場合は DB 行も残す（次回再試行できるように）
        continue;
      }
      summary.storage_files_deleted += removed?.length ?? storagePaths.length;

      // ④ DB から削除
      const docIds = docs.map((d) => d.id);
      const { error: dbDelErr } = await admin
        .from('digital_death_documents')
        .delete()
        .in('id', docIds);

      if (dbDelErr) {
        console.warn('[cron/cleanup-death-documents] db delete failed', {
          noticeId: notice.id,
          error: dbDelErr.message,
        });
        summary.db_delete_errors += docIds.length;
        continue;
      }
      summary.db_rows_deleted += docIds.length;

      // ⑤ 監査ログ（失敗してもメイン処理は止めない）
      try {
        await admin.from('digital_audit_logs').insert({
          user_id: notice.owner_user_id,
          action: 'death_documents_purged',
          resource_id: notice.id,
          metadata: {
            document_count: docIds.length,
            disclosed_at: notice.disclosed_at,
            purged_at: new Date().toISOString(),
          },
        });
      } catch (err) {
        console.warn(
          '[cron/cleanup-death-documents] audit log skipped',
          err
        );
      }
    }

    console.log('[cron/cleanup-death-documents] done', summary);
    return NextResponse.json({ ok: true, summary });
  } catch (err) {
    const detail = err instanceof Error ? err.message : 'unexpected_error';
    console.error('[cron/cleanup-death-documents] threw', detail);
    return NextResponse.json(
      { ok: false, error: 'unexpected', detail, summary },
      { status: 500 }
    );
  }
}
