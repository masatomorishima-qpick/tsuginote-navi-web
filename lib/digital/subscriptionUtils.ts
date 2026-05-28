/**
 * lib/digital/subscriptionUtils.ts
 *
 * digital_subscriptions に関する「純粋関数」（DB アクセスなし）。
 *
 * これらはサーバー／クライアントのどちらからも利用できるよう、
 * 'server-only' を付けないこのファイルに分離している。
 * DB アクセスを伴う取得処理（getOwnSubscription）は
 * lib/digital/subscriptions.ts 側にあり、本ファイルの関数は
 * 後方互換のため subscriptions.ts からも re-export されている。
 */

import {
  type DigitalSubscription,
  type DigitalPlan,
  PLAN_LIMITS,
} from '@/types/digital';

/**
 * 「現在 STANDARD 機能が使える状態か」のリクエスト都度判定。
 *
 * 判定ロジック:
 *   - plan='standard' かつ status='active' → STANDARD 利用可能
 *   - plan='standard' かつ status='trialing' かつ trial_expires_at が未来 → 利用可能
 *   - plan='standard' かつ status='canceled' かつ current_period_end が未来 → 利用可能
 *   - その他 → FREE 扱い
 */
export function isStandardActive(sub: DigitalSubscription | null): boolean {
  if (!sub) return false;
  if (sub.plan !== 'standard') return false;

  const now = Date.now();

  if (sub.status === 'active') {
    // 有料サブスク（自動更新）
    return true;
  }

  if (sub.status === 'trialing') {
    // 30 日無料トライアル中（trial_expires_at が未来であれば有効）
    if (!sub.trial_expires_at) return false;
    return new Date(sub.trial_expires_at).getTime() > now;
  }

  if (sub.status === 'canceled') {
    // 解約予定だが期間終了まで利用可能
    if (!sub.current_period_end) return false;
    return new Date(sub.current_period_end).getTime() > now;
  }

  return false;
}

/**
 * 「事実上のプラン」を返す（リクエスト都度判定）。
 * UI / API ゲートで使うための関数。
 */
export function effectivePlan(sub: DigitalSubscription | null): DigitalPlan {
  return isStandardActive(sub) ? 'standard' : 'free';
}

/**
 * トライアル残り日数（切り上げ）。トライアル中でなければ null。
 */
export function trialDaysLeft(sub: DigitalSubscription | null): number | null {
  if (!sub) return null;
  if (sub.status !== 'trialing') return null;
  if (!sub.trial_expires_at) return null;

  const now = Date.now();
  const exp = new Date(sub.trial_expires_at).getTime();
  const diffMs = exp - now;
  if (diffMs <= 0) return 0;

  return Math.ceil(diffMs / (24 * 60 * 60 * 1000));
}

/**
 * プラン制限値を返すユーティリティ。
 */
export function getPlanLimits(plan: DigitalPlan) {
  return PLAN_LIMITS[plan];
}

/**
 * 「現在のプラン上限値」を返すユーティリティ（subscription を引数に直接受け取れる便利版）。
 */
export function getEffectiveLimits(sub: DigitalSubscription | null) {
  return getPlanLimits(effectivePlan(sub));
}
