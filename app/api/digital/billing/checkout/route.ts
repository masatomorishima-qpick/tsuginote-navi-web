/**
 * POST /api/digital/billing/checkout
 *
 * 新モデル（共有 ID 単位の従量課金）用の Checkout Session 発行 API。
 *
 * 用途：
 *   - 本人が「クレジットカードを今すぐ登録する」を選んだとき（家族承認を待たず事前登録）
 *   - 家族が承認した瞬間にサブスクがまだ無く Checkout が必要なとき（familyBilling 経由）
 *
 * 入力（JSON、省略可能）：
 *   { quantity?: number }  既定は max(1, 現在の active family_links 数)
 *
 * 出力：
 *   { ok: true, url }     Stripe Checkout の URL
 *   { ok: false, error }  失敗時
 *
 * フロー：
 *   1. ログイン確認
 *   2. 既に active な subscription があれば 409
 *   3. ensureStripeCustomer（Customer 取得 or 作成）
 *   4. quantity を確定（家族数 or 1）
 *   5. createCheckoutSessionForNewSubscription（trial 30 日付き）
 *   6. URL を返す
 */

import { NextResponse } from 'next/server';
import { createDigitalServerClient } from '@/lib/supabase/digitalServer';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { ensureStripeCustomer } from '@/lib/stripe/billing';
import { getOwnSubscription, isStandardActive } from '@/lib/digital/subscriptions';
import { countActiveLinks } from '@/lib/digital/family';
import { stripeRequest } from '@/lib/stripe/client';
import { PER_RECIPIENT_PRICING } from '@/types/digital';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function getPriceId(): string {
  const id = process.env.STRIPE_PRICE_PER_RECIPIENT;
  if (!id || id.startsWith('price_xxx')) {
    throw new Error(
      'STRIPE_PRICE_PER_RECIPIENT が未設定です。Stripe Dashboard で Price を作成し env に設定してください。'
    );
  }
  return id;
}

function getAppUrl(): string {
  const url = process.env.NEXT_PUBLIC_APP_URL;
  if (!url) {
    throw new Error('NEXT_PUBLIC_APP_URL is not set');
  }
  return url.replace(/\/+$/, '');
}

export async function POST(req: Request) {
  try {
    // ① 認証
    const supabase = await createDigitalServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { ok: false, error: 'unauthorized' },
        { status: 401 }
      );
    }
    if (!user.email) {
      return NextResponse.json(
        { ok: false, error: 'no_email_on_account' },
        { status: 400 }
      );
    }

    // ② 既にサブスクがある場合は 409
    //   - active / trialing / past_due いずれかで stripe_subscription_id があれば
    //     Checkout を再実行すると Stripe 側で重複サブスクが作られてしまうため拒否。
    //   - canceled / free / incomplete 等で sub_id が無ければ新規 Checkout を許可する。
    const sub = await getOwnSubscription(supabase, user.id);
    const hasLiveSubscription =
      !!sub?.stripe_subscription_id &&
      (sub.status === 'active' ||
        sub.status === 'trialing' ||
        sub.status === 'past_due');
    if (hasLiveSubscription) {
      return NextResponse.json(
        {
          ok: false,
          error: 'already_subscribed',
          detail:
            '既にサブスクリプションをご登録いただいています。カードのご変更・解約は「お支払い情報を管理する」（カスタマーポータル）からお願いします。',
        },
        { status: 409 }
      );
    }

    // ③ 入力 quantity（任意）と family_links 数から決定
    const body = (await req.json().catch(() => ({}))) as { quantity?: unknown };
    const admin = createAdminSupabaseClient();
    const linksCount = await countActiveLinks(admin, user.id);

    let quantity: number;
    if (typeof body.quantity === 'number' && body.quantity > 0) {
      quantity = Math.max(1, Math.floor(body.quantity));
    } else {
      // 家族連携が無いタイミングでも 1 名分を確保（カードを事前登録するケース）
      quantity = Math.max(1, linksCount);
    }

    // ④ Stripe Customer を取得 or 作成
    const customerId = await ensureStripeCustomer(admin, user.id, user.email);

    // ⑤ Checkout Session 発行（trial 30 日）
    const priceId = getPriceId();
    const appUrl = getAppUrl();
    const session = await stripeRequest<{ id: string; url: string | null }>({
      method: 'POST',
      path: '/v1/checkout/sessions',
      body: {
        mode: 'subscription',
        customer: customerId,
        line_items: [{ price: priceId, quantity }],
        success_url: `${appUrl}/digital/settings/upgrade/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${appUrl}/digital/settings/plan?canceled=1`,
        allow_promotion_codes: false,
        subscription_data: {
          trial_period_days: PER_RECIPIENT_PRICING.trialDays,
          metadata: {
            user_id: user.id,
            per_recipient_quantity: String(quantity),
          },
        },
        payment_method_types: ['card'],
      },
    });

    if (!session.url) {
      return NextResponse.json(
        { ok: false, error: 'no_checkout_url' },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, url: session.url });
  } catch (err) {
    const detail = err instanceof Error ? err.message : 'unexpected_error';
    console.error('[api/digital/billing/checkout] failed', detail);
    return NextResponse.json(
      { ok: false, error: 'checkout_failed', detail },
      { status: 500 }
    );
  }
}
