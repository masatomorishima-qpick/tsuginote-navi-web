/**
 * lib/stripe/billing.ts
 *
 * Stripe Customer / Checkout / Customer Portal の薄いヘルパー群。
 *
 * 設計：
 *   - Customer は 1 user = 1 Customer を維持
 *   - Customer ID は digital_subscriptions.stripe_customer_id に保存
 *   - 既存があれば Stripe API で生存確認 → 新規発行はしない
 */

import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import { stripeRequest } from './client';

// ============================================================================
// Stripe レスポンス型（必要最低限のフィールドのみ抜粋）
// ============================================================================

export type StripeCustomer = {
  id: string;
  email: string | null;
  metadata: Record<string, string>;
  deleted?: boolean;
};

export type StripeCheckoutSession = {
  id: string;
  url: string | null;
  mode: 'subscription' | 'payment' | 'setup';
  customer: string | null;
  subscription: string | null;
  status: string;
};

export type StripePortalSession = {
  id: string;
  url: string;
  return_url: string;
};

// ============================================================================
// Customer
// ============================================================================

/**
 * 指定ユーザーの Stripe Customer を取得、無ければ作成して digital_subscriptions に保存する。
 *
 * @param supabase  service_role の Supabase client（RLS を通さず subscriptions 行を更新するため）
 * @param userId    auth.users.id
 * @param email     ユーザーのメールアドレス（Customer の表示用）
 */
export async function ensureStripeCustomer(
  supabase: SupabaseClient,
  userId: string,
  email: string
): Promise<string> {
  // 既存 customer_id を確認
  const { data: sub, error } = await supabase
    .from('digital_subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error(
      '[lib/stripe/billing] ensureStripeCustomer: subscription lookup failed',
      error
    );
    throw new Error(error.message);
  }

  const existingId = (sub?.stripe_customer_id as string | null) ?? null;

  if (existingId) {
    // 念のため Stripe 側にも残っているか確認
    try {
      const customer = await stripeRequest<StripeCustomer>({
        method: 'GET',
        path: `/v1/customers/${existingId}`,
      });
      if (customer && !customer.deleted) {
        return existingId;
      }
    } catch (err) {
      console.warn(
        '[lib/stripe/billing] existing stripe_customer_id not found, creating new',
        { existingId, err }
      );
    }
  }

  // 新規作成
  const customer = await stripeRequest<StripeCustomer>({
    method: 'POST',
    path: '/v1/customers',
    body: {
      email,
      metadata: {
        user_id: userId,
      },
    },
    idempotencyKey: `customer-${userId}`,
  });

  // digital_subscriptions に保存
  const { error: updErr } = await supabase
    .from('digital_subscriptions')
    .update({ stripe_customer_id: customer.id, updated_at: new Date().toISOString() })
    .eq('user_id', userId);

  if (updErr) {
    console.error(
      '[lib/stripe/billing] ensureStripeCustomer: failed to save customer_id',
      updErr
    );
    // 致命的ではない。Customer は作成済みなので id は返すが、次回 lookup でまた到達する
  }

  return customer.id;
}

// ============================================================================
// Checkout Session
// ============================================================================

export type CreateCheckoutInput = {
  customerId: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
};

export async function createCheckoutSession(
  input: CreateCheckoutInput
): Promise<StripeCheckoutSession> {
  return stripeRequest<StripeCheckoutSession>({
    method: 'POST',
    path: '/v1/checkout/sessions',
    body: {
      mode: 'subscription',
      customer: input.customerId,
      line_items: [{ price: input.priceId, quantity: 1 }],
      success_url: input.successUrl,
      cancel_url: input.cancelUrl,
      allow_promotion_codes: false,
      // 顧客が同じ Customer で重複サブスクするのを Stripe 側でも防止
      subscription_data: {
        metadata: input.metadata ?? {},
      },
      // クレジットカード以外も後で増やせるように、一旦カードのみ明示
      payment_method_types: ['card'],
    },
  });
}

// ============================================================================
// Customer Portal Session
// ============================================================================

export async function createPortalSession(
  customerId: string,
  returnUrl: string
): Promise<StripePortalSession> {
  return stripeRequest<StripePortalSession>({
    method: 'POST',
    path: '/v1/billing_portal/sessions',
    body: {
      customer: customerId,
      return_url: returnUrl,
    },
  });
}
