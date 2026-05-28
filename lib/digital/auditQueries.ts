/**
 * digital_audit_logs の閲覧クエリ（サーバー側専用）
 *
 * ポリシー:
 *   - 本人分のみ取得（RLS の digital_audit_logs_select_own に依存しつつ、
 *     アプリ側でも user_id を明示して二重防御する）
 *   - 90 日経過分は cron で自動削除される（001 migration 参照）。
 *     ここでは「DB に残っているもの」をそのまま新しい順で返すだけ。
 *   - 平文の機密情報は metadata に入れない契約（書き込み側で担保）。
 *     よって metadata はそのまま JSON として表示してよい。
 */

import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  AuditAction,
  AuditActionCategory,
  DigitalAuditLog,
} from '@/types/digital';
import { AUDIT_ACTION_CATEGORIES } from '@/types/digital';

export type ListAuditLogsParams = {
  /** 1 ページあたりの件数。1〜100 にクランプする。 */
  limit?: number;
  /** 0-origin の offset。負値は 0 にクランプする。 */
  offset?: number;
  /** カテゴリでの絞り込み（'all' は全件） */
  category?: AuditActionCategory;
};

export type ListAuditLogsResult = {
  rows: DigitalAuditLog[];
  total: number;
  limit: number;
  offset: number;
};

const DEFAULT_LIMIT = 30;
const MAX_LIMIT = 100;

/**
 * 自分の監査ログを新しい順で 1 ページ分取得。
 *
 * 戻り値の `total` はカウント取得失敗時に rows.length を返す（UI を壊さないため）。
 */
export async function listOwnAuditLogs(
  supabase: SupabaseClient,
  userId: string,
  params: ListAuditLogsParams = {}
): Promise<ListAuditLogsResult> {
  const limit = clampInt(params.limit ?? DEFAULT_LIMIT, 1, MAX_LIMIT);
  const offset = Math.max(0, params.offset ?? 0);
  const category = params.category ?? 'all';
  const actionFilter = resolveActionFilter(category);

  let query = supabase
    .from('digital_audit_logs')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (actionFilter) {
    query = query.in('action', actionFilter);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error('[lib/digital/auditQueries] listOwnAuditLogs failed', {
      message: error.message,
      code: error.code,
    });
    throw new Error(error.message);
  }

  const rows = (data ?? []) as DigitalAuditLog[];
  return {
    rows,
    total: typeof count === 'number' ? count : rows.length,
    limit,
    offset,
  };
}

/**
 * カテゴリ → action 配列。'all' は null（フィルタなし）を返す。
 */
function resolveActionFilter(
  category: AuditActionCategory
): AuditAction[] | null {
  if (category === 'all') return null;
  const list = AUDIT_ACTION_CATEGORIES[category];
  return list && list.length > 0 ? list : null;
}

function clampInt(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  const n = Math.trunc(value);
  if (n < min) return min;
  if (n > max) return max;
  return n;
}
