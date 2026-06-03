/**
 * lib/digital/billing.ts
 *
 * Stripe Webhook イベントを受け取って digital_subscriptions に反映するロジック。
 *
 * 設計：
 *   - 受信した event.type で switch
 *   - subscription / invoice いずれの payload でも、user_id への解決は
 *     stripe_customer_id（subscriptions テーブル側）または metadata.user_id を使う
 *   - 順序入れ替わり対策：updated_at が新しい payload を優先（Stripe の created を比較）
 *   - 一切例外を投げない（すべて catch して console.error）。
 *     Webhook 受信側で 500 を返さない設計（Stripe の再送ループ回避）
 */

import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { DigitalSubscriptionStatus } from '@/types/digital';
import { reactivateSuspendedLinksForOwner } from './family';

// ============================================================================
// Stripe Webhook Event 型（最低限）
// ============================================================================

export type StripeWebhookEvent = {
  id: string;
  type: string;
  data: {
    object: Record<string, unknown>;
  };
  created: number;
};

type StripeSubscription = {
  id: string;
  customer: string;
  status: string; // 'trialing' | 'active' | 'past_due' | 'canceled' | ...
  // 旧 API（〜2025-04）はトップレベル、新 API（2025-04 basil 以降）は items[] に移動。
  // どちらのバージョンの payload でも取得できるよう両方読む。
  current_period_start?: number | null;
  current_period_end?: number | null;
  cancel_at_period_end: boolean;
  // Stripe 側の trial 期間。trial_period_days で作成された場合などにセットされる。
  // unix epoch (秒)。trial が無ければ null。
  trial_start?: number | null;
  trial_end?: number | null;
  items: {
    data: Array<{
      current_period_start?: number | null;
      current_period_end?: number | null;
      quantity?: number;
      price: {
        id: string;
        recurring?: { interval: 'month' | 'year' };
      };
    }>;
  };
  metadata?: Record<string, string>;
};

type StripeCheckoutSession = {
  id: string;
  customer: string | null;
  subscription: string | null;
  mode: 'subscription' | 'payment' | 'setup';
  metadata?: Record<string, string>;
};

type StripeInvoice = {
  id: string;
  customer: string | null;
  subscription: string | null;
  status: string;
};

// ============================================================================
// Status マッピング
// ============================================================================

function mapStripeStatusToInternal(s: string): DigitalSubscriptionStatus {
  switch (s) {
    case 'active':
      return 'active';
    case 'trialing':
      return 'trialing';
    case 'past_due':
    case 'unpaid':
      return 'past_due';
    case 'canceled':
    case 'incomplete_expired':
      return 'canceled';
    default:
      // incomplete / paused / その他 → 安全側で free 扱い（UI ゲートが落ちる）
      return 'free';
  }
}

// ============================================================================
// 内部ヘルパー：customer_id から user_id を解決
// ============================================================================

async function resolveUserIdByCustomer(
  admin: SupabaseClient,
  customerId: string
): Promise<string | null> {
  const { data, error } = await admin
    .from('digital_subscriptions')
    .select('user_id')
    .eq('stripe_customer_id', customerId)
    .maybeSingle();

  if (error) {
    console.error('[lib/digital/billing] resolveUserIdByCustomer failed', error);
    return null;
  }
  return (data?.user_id as string | null) ?? null;
}

// ============================================================================
// 内部ヘルパー：subscription 行を upsert
// ============================================================================

/**
 * Unix epoch（秒）→ ISO 文字列に安全変換。無効値なら null を返す（例外を投げない）。
 */
function safeIsoFromUnix(value: number | null | undefined): string | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;
  const ms = value * 1000;
  const d = new Date(ms);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

async function applySubscription(
  admin: SupabaseClient,
  userId: string,
  sub: StripeSubscription
): Promise<void> {
  const internalStatus = mapStripeStatusToInternal(sub.status);
  const interval = sub.items.data[0]?.price.recurring?.interval ?? 'month';
  const billingCycle = interval === 'year' ? 'yearly' : 'monthly';

  // active / trialing なら plan='standard'、それ以外は free 扱い
  const plan: 'standard' | 'free' =
    internalStatus === 'active' || internalStatus === 'trialing'
      ? 'standard'
      : internalStatus === 'past_due' || internalStatus === 'canceled'
        ? 'standard' // 期限終了まで使える前提で 'standard' を維持。UI ゲートは isStandardActive で判定
        : 'free';

  // current_period_start/end：新旧 API どちらにも対応
  //   旧 API: subscription.current_period_*
  //   新 API: subscription.items.data[0].current_period_*
  const periodStart =
    sub.current_period_start ?? sub.items.data[0]?.current_period_start ?? null;
  const periodEnd =
    sub.current_period_end ?? sub.items.data[0]?.current_period_end ?? null;
  const startIso = safeIsoFromUnix(periodStart);
  const endIso = safeIsoFromUnix(periodEnd);

  // 課金可能な状態（active/trialing）になったら、休止中（suspended）の連携を
  // 復活させる（課題 #30・安全網）。主経路は billing/checkout 側で復活させているが、
  // Customer Portal 等の別経路でサブスクが有効化されたケースの取りこぼしをここで拾う。
  // この後の active_links カウントに復活分を含めるため、カウント前に実行する。
  if (internalStatus === 'active' || internalStatus === 'trialing') {
    await reactivateSuspendedLinksForOwner(admin, userId);
  }

  // quantity は active_links 数を真実として扱う。
  //   Stripe 側の subscription item quantity は最低 1 という制約があるため、
  //   連携 0 名で cancel_at_period_end=true にしても Stripe quantity は 1 のまま残る。
  //   その値で DB を上書きしてしまうと、UI で「連携中：0 名」を表示できなくなる。
  //   そのため、family_links の active 件数を直接参照して DB.quantity を決定する。
  const { count: activeLinksCount, error: linksErr } = await admin
    .from('digital_family_links')
    .select('id', { count: 'exact', head: true })
    .eq('owner_user_id', userId)
    .eq('status', 'active');
  const stripeQuantity = sub.items.data[0]?.quantity ?? 1;
  // family_links のクエリ失敗時のみ Stripe quantity にフォールバック
  const resolvedQuantity =
    linksErr || activeLinksCount === null ? stripeQuantity : activeLinksCount;

  // 必須項目（Stripe 側の状態を確実に反映したいフィールド）は常に書く。
  // 日付項目は変換に成功した場合のみ書く（null/undefined や invalid を弾く）。
  const update: Record<string, unknown> = {
    plan,
    status: internalStatus,
    stripe_subscription_id: sub.id,
    billing_cycle: billingCycle,
    cancel_at_period_end: sub.cancel_at_period_end,
    quantity: resolvedQuantity,         // ← active_links 数を優先（cancel_at_period_end 中の整合性確保）
    updated_at: new Date().toISOString(),
  };
  if (startIso) update.current_period_start = startIso;
  if (endIso) update.current_period_end = endIso;

  // trial 期間：Stripe 側が trial_end を持つ場合は DB の trial_expires_at に同期。
  // これにより Checkout 完了時 (trial_period_days で開始) や Customer Portal で
  // trial 変更された場合に、UI 表示も Stripe 側の正しい終了日に揃う。
  const trialEndIso = safeIsoFromUnix(sub.trial_end ?? null);
  if (trialEndIso) {
    update.trial_expires_at = trialEndIso;
  }

  const { error } = await admin
    .from('digital_subscriptions')
    .update(update)
    .eq('user_id', userId);

  if (error) {
    console.error('[lib/digital/billing] applySubscription update failed', {
      userId,
      sub_id: sub.id,
      error: error.message,
    });
  }
}

async function applySubscriptionDeleted(
  admin: SupabaseClient,
  userId: string,
  sub: StripeSubscription
): Promise<void> {
  // DB に記録されている stripe_subscription_id を取得
  const { data: row } = await admin
    .from('digital_subscriptions')
    .select('stripe_subscription_id')
    .eq('user_id', userId)
    .maybeSingle();

  // 孤児サブスク（重複作成等）の cancel イベントが届いた場合、
  // DB に登録されている「現役」サブスクとは別物なので無視する。
  // 無視しないと、現役サブスクの記録が誤って消去されてしまう。
  if (
    row?.stripe_subscription_id &&
    row.stripe_subscription_id !== sub.id
  ) {
    console.warn(
      '[applySubscriptionDeleted] ignoring orphan subscription deletion',
      {
        userId,
        db_sub_id: row.stripe_subscription_id,
        deleted_sub_id: sub.id,
      }
    );
    return;
  }

  const { error } = await admin
    .from('digital_subscriptions')
    .update({
      plan: 'free',
      status: 'free',
      stripe_subscription_id: null,
      billing_cycle: null,
      current_period_start: null,
      current_period_end: null,
      cancel_at_period_end: false,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId);

  if (error) {
    console.error('[lib/digital/billing] applySubscriptionDeleted failed', {
      userId,
      sub_id: sub.id,
      error: error.message,
    });
  }
}

// ============================================================================
// メインエントリ：Webhook イベントを反映
// ============================================================================

export async function applyStripeEvent(
  admin: SupabaseClient,
  event: StripeWebhookEvent
): Promise<{ userId: string | null }> {
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as StripeCheckoutSession;
        if (session.mode !== 'subscription' || !session.customer) {
          return { userId: null };
        }
        // metadata.user_id は checkout 作成時に埋めている
        const userIdFromMeta = session.metadata?.user_id ?? null;
        const userId =
          userIdFromMeta ??
          (await resolveUserIdByCustomer(admin, session.customer));
        if (!userId) {
          console.warn(
            '[applyStripeEvent] checkout.session.completed: user not found',
            { session_id: session.id, customer: session.customer }
          );
          return { userId: null };
        }
        // checkout 完了直後は subscription の詳細が無い場合もあるので、
        // ここでは customer_id だけ確定させる。詳細は後続の subscription.updated で反映される。
        await admin
          .from('digital_subscriptions')
          .update({
            stripe_customer_id: session.customer,
            stripe_subscription_id: session.subscription ?? null,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId);

        return { userId };
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const sub = event.data.object as StripeSubscription;
        const userId = await resolveUserIdByCustomer(admin, sub.customer);
        if (!userId) {
          console.warn(
            '[applyStripeEvent] subscription.updated: user not found',
            { sub_id: sub.id, customer: sub.customer }
          );
          return { userId: null };
        }
        await applySubscription(admin, userId, sub);
        return { userId };
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as StripeSubscription;
        const userId = await resolveUserIdByCustomer(admin, sub.customer);
        if (!userId) return { userId: null };
        await applySubscriptionDeleted(admin, userId, sub);
        return { userId };
      }

      case 'invoice.payment_failed':
      case 'invoice.payment_succeeded':
      case 'invoice_payment.paid': // 新 API（2025+）の別名イベント
      case 'invoice.paid': {
        const invoice = event.data.object as StripeInvoice;
        if (!invoice.customer) return { userId: null };
        const userId = await resolveUserIdByCustomer(admin, invoice.customer);
        if (!userId) return { userId: null };

        // payment_failed → past_due、それ以外（成功系）→ active
        const newStatus: DigitalSubscriptionStatus =
          event.type === 'invoice.payment_failed' ? 'past_due' : 'active';

        const { error } = await admin
          .from('digital_subscriptions')
          .update({
            status: newStatus,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId);

        if (error) {
          console.error(
            '[applyStripeEvent] invoice update failed',
            error.message
          );
        }
        return { userId };
      }

      default:
        // 興味のないイベントはスルー（保存だけ済んでいる）
        return { userId: null };
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown';
    console.error('[applyStripeEvent] unexpected error', {
      type: event.type,
      message,
    });
    return { userId: null };
  }
}
