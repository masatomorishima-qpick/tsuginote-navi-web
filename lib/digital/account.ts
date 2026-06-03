/**
 * アカウント削除（退会）処理
 *
 * - 削除フロー全体:
 *   1. 本人セッションで API Route `/api/digital/account/delete` を叩く
 *   2. そこで本人の email 確認入力が一致することをチェック
 *   3. **削除前に** Stripe サブスクリプションがあれば即時解約する
 *      （退会後に Stripe 側だけ課金が残る orphan を防ぐ。fail-open：失敗しても退会は続行）
 *   4. **削除前に** `account_delete` の監査ログを記録（user_id は残っているうちに）
 *   5. service_role の admin client で `auth.admin.deleteUser(userId)` を実行
 *      - FK の ON DELETE CASCADE により
 *        digital_assets / digital_reminder_settings / digital_devices /
 *        digital_pin_secrets / digital_family_links / digital_subscriptions 等は即消滅
 *      - digital_audit_logs は ON DELETE SET NULL なので、ログ本体は user_id=NULL で残存
 *        （001 migration の cleanup policy により 90 日後に自動削除）
 *   6. クライアントは signOut() してサイト公開面へリダイレクト
 *
 * - この関数はサーバー専用。クライアントから直接叩けないよう 'server-only' を付与。
 */

import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { recordAuditLog } from '@/lib/digital/audit';
import { stripeRequest } from '@/lib/stripe/client';

export type DeleteAccountResult =
  | { ok: true }
  | { ok: false; reason: 'admin_delete_failed'; message: string };

/**
 * アカウントとそれに紐づくデジタル資産データを削除する。
 *
 * @param supabase 本人のサーバークライアント（監査ログ記録用）
 * @param userId 削除対象ユーザー（必ず auth.getUser() で確認した ID を渡すこと）
 * @param context ログに残す付加情報
 */
export async function deleteAccount(
  supabase: SupabaseClient,
  userId: string,
  context: { user_agent?: string | null; ip_address?: string | null } = {}
): Promise<DeleteAccountResult> {
  const admin = createAdminSupabaseClient();

  // 1. Stripe サブスクリプションの解約（退会後も Stripe 側だけ課金が残る orphan を防ぐ）。
  //    fail-open：解約に失敗しても退会自体は続行し、結果は監査ログに残す。
  //    （退会をブロックするとユーザーが離脱できず UX を損ねるため。失敗は監視で拾う方針）
  let stripeCancel: 'canceled' | 'no_subscription' | 'failed' = 'no_subscription';
  let stripeCancelDetail: string | null = null;
  try {
    const { data: sub } = await admin
      .from('digital_subscriptions')
      .select('stripe_subscription_id')
      .eq('user_id', userId)
      .maybeSingle();
    const subId = sub?.stripe_subscription_id as string | null | undefined;
    if (subId) {
      try {
        await stripeRequest({ method: 'DELETE', path: `/v1/subscriptions/${subId}` });
        stripeCancel = 'canceled';
      } catch (err) {
        stripeCancel = 'failed';
        stripeCancelDetail = err instanceof Error ? err.message : 'cancel_failed';
        console.warn('[lib/digital/account] Stripe 解約に失敗（退会は続行）', {
          userId,
          subId,
          detail: stripeCancelDetail,
        });
      }
    }
  } catch (err) {
    // サブスク参照自体に失敗しても退会はブロックしない
    console.warn('[lib/digital/account] subscription 参照に失敗（退会は続行）', err);
  }

  // 2. 監査ログを残す（user_id が消えると後追いできない）。Stripe 解約結果も併記。
  //    recordAuditLog は fire-and-forget で例外を外に投げない実装。
  await recordAuditLog(supabase, userId, {
    action: 'account_delete',
    user_agent: context.user_agent ?? null,
    ip_address: context.ip_address ?? null,
    metadata: {
      reason: 'user_initiated',
      stripe_cancel: stripeCancel,
      stripe_cancel_detail: stripeCancelDetail,
    },
  });

  // 3. admin client で auth.users を削除。
  //    FK CASCADE により紐づくデジタル資産データはここで一括消滅する。
  const { error } = await admin.auth.admin.deleteUser(userId);

  if (error) {
    console.error('[lib/digital/account] admin.deleteUser failed', {
      message: error.message,
      status: error.status,
    });
    return {
      ok: false,
      reason: 'admin_delete_failed',
      message: error.message,
    };
  }

  return { ok: true };
}
