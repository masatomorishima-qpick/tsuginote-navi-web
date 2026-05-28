/**
 * digital_subscriptions テーブルのアクセスヘルパー（サーバー側専用）
 *
 * - 本人分のみ取得（RLS の digital_subscriptions_select_own 依存 + アプリ側の user_id 明示で二重防御）
 * - 書き込みは本ファイルでは扱わず、API ルート / Stripe Webhook 側で service_role を使う
 *
 * ## トライアル満了の判定
 *
 * トライアル満了は cron ではなく **リクエスト都度判定** で行う：
 *   - status='trialing' の行を取得した際、trial_expires_at が現在より過去なら
 *     "FREE 降格済み" として扱う（DB は更新しない、表示上だけ判定）
 *   - 実際の DB 上の status='free' への遷移は、ユーザーが Stripe Checkout を試みた、
 *     または管理者が一括バッチで行うなど別途実施する。
 *
 * これにより：
 *   - cron 失敗時の "本来 FREE なのに STANDARD のまま" 状態を防げる
 *   - DB 更新タイミングを Stripe Webhook と整合させやすい
 *
 * ## 純粋関数の分離
 *
 * DB アクセスを伴わない純粋関数（isStandardActive / effectivePlan / trialDaysLeft /
 * getPlanLimits / getEffectiveLimits）は lib/digital/subscriptionUtils.ts へ移した
 * （クライアントコンポーネントからも利用できるようにするため）。
 * 後方互換のため、本ファイルからも従来どおり import できるよう re-export している。
 */

import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { DigitalSubscription } from '@/types/digital';

// 純粋関数は subscriptionUtils.ts に分離。後方互換のため re-export する。
export {
  isStandardActive,
  effectivePlan,
  trialDaysLeft,
  getPlanLimits,
  getEffectiveLimits,
} from './subscriptionUtils';

/**
 * 本人のサブスク行を 1 件取得。
 * 新規ユーザーは DB トリガーで自動作成されるため、原則 null は返らないはず。
 * 万一 null が返った場合（古いユーザー等）は呼び出し元で「FREE 扱い」とする。
 */
export async function getOwnSubscription(
  supabase: SupabaseClient,
  userId: string
): Promise<DigitalSubscription | null> {
  const { data, error } = await supabase
    .from('digital_subscriptions')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('[lib/digital/subscriptions] getOwnSubscription failed', {
      message: error.message,
      code: error.code,
    });
    throw new Error(error.message);
  }

  return (data as DigitalSubscription | null) ?? null;
}
