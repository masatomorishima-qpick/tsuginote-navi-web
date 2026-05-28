/**
 * digital_audit_logs への記録ヘルパー
 *
 * DB スキーマ（001_digital_assets_migration.sql）に準拠：
 *   columns: user_id / action / resource_id / ip_address / user_agent / metadata
 *   action CHECK: login/logout/asset_create/asset_update/asset_delete/
 *                 pdf_export/data_export/reminder_settings_update/account_delete
 *
 * 失敗してもアプリ本体は止めない（fire-and-forget）。
 */

import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { AuditAction } from '@/types/digital';

export type AuditLogInput = {
  action: AuditAction;
  resource_id?: string | null;
  ip_address?: string | null;
  user_agent?: string | null;
  metadata?: Record<string, unknown> | null;
};

/**
 * 監査ログを1件挿入。失敗してもアプリ本体は止めない（fire-and-forget）。
 */
export async function recordAuditLog(
  supabase: SupabaseClient,
  userId: string,
  input: AuditLogInput
): Promise<void> {
  try {
    const { error } = await supabase.from('digital_audit_logs').insert({
      user_id: userId,
      action: input.action,
      resource_id: input.resource_id ?? null,
      ip_address: input.ip_address ?? null,
      user_agent: input.user_agent ?? null,
      metadata: input.metadata ?? null,
    });

    if (error) {
      // 本体の動作を止めないようログだけ出して握りつぶす
      console.error('[lib/digital/audit] recordAuditLog failed', {
        message: error.message,
        code: error.code,
      });
    }
  } catch (err) {
    console.error('[lib/digital/audit] unexpected error', err);
  }
}
