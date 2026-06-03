/**
 * lib/digital/familyBilling.ts
 *
 * 連携者数（active な digital_family_links 数）と
 * Stripe subscription の quantity を同期するロジック。
 *
 * 単一の真実：DB（digital_family_links.status='active' の件数）が source of truth。
 *            Stripe はその数に追従する。
 *
 * 使い分け：
 *   - 招待承認 / 連携解除のたびに syncSubscriptionQuantity を呼ぶ
 *   - 戻り値で「Checkout 起動が必要」と返ってきたら、UI 側で Checkout に誘導
 *   - Webhook 受信時は反映するだけ（このファイルは呼ばない）
 *
 * 状態遷移：
 *
 *   active links = 0 + サブスク無し       → no_op
 *   active links = 0 + サブスク有り       → サブスクを cancel（次回更新無し）
 *   active links > 0 + サブスク無し       → need_checkout（Checkout URL を返す）
 *   active links > 0 + サブスク active    → quantity を active links 数に update
 *   active links > 0 + サブスク trialing  → quantity を active links 数に update
 *   active links > 0 + サブスク canceled  → Checkout で再加入（need_checkout）
 *
 * 注意：Stripe Webhook がこの操作を観測すると customer.subscription.updated が発火し、
 *      applyStripeEvent 経由で digital_subscriptions も自動更新される（重複処理は冪等）
 */

import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import { stripeRequest } from '@/lib/stripe/client';
import { ensureStripeCustomer } from '@/lib/stripe/billing';
import { countActiveLinks } from './family';

// =============================================================================
// 型
// =============================================================================

export type FamilySubscriptionSyncResult =
  | { ok: true; status: 'no_op'; currentQuantity: number; targetQuantity: number }
  | { ok: true; status: 'updated'; currentQuantity: number; targetQuantity: number }
  | { ok: true; status: 'canceled'; previousQuantity: number }
  // 連携 0 名で「期間終了で解約予定」をセット（Portal 解約と同等）
  | { ok: true; status: 'scheduled_cancellation'; previousQuantity: number }
  | { ok: false; status: 'need_checkout'; checkoutUrl: string; targetQuantity: number }
  | { ok: false; status: 'error'; detail: string };

// =============================================================================
// 定数
// =============================================================================

const TRIAL_DAYS = 30;

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

// =============================================================================
// Stripe API ラッパー
// =============================================================================

type StripeSubscriptionLite = {
  id: string;
  status: string;
  cancel_at_period_end?: boolean;
  items: { data: Array<{ id: string; quantity?: number }> };
};

async function getSubscription(
  subscriptionId: string
): Promise<StripeSubscriptionLite> {
  return stripeRequest<StripeSubscriptionLite>({
    method: 'GET',
    path: `/v1/subscriptions/${subscriptionId}`,
  });
}

async function updateSubscriptionQuantity(
  subscriptionId: string,
  itemId: string,
  quantity: number
): Promise<void> {
  // proration_behavior='create_prorations'：途中追加・削除を月割で清算
  await stripeRequest({
    method: 'POST',
    path: `/v1/subscriptions/${subscriptionId}`,
    body: {
      items: [{ id: itemId, quantity }],
      proration_behavior: 'create_prorations',
    },
  });
}

/**
 * 期間終了で解約予定にする（cancel_at_period_end=true）。
 * Portal 解約と同じ挙動。連携 0 名になった瞬間の自動解約で使用。
 * 期間中（current_period_end まで）はサービス利用可能、期間終了時に Webhook 経由で FREE 降格。
 */
async function scheduleSubscriptionCancellation(
  subscriptionId: string
): Promise<void> {
  await stripeRequest({
    method: 'POST',
    path: `/v1/subscriptions/${subscriptionId}`,
    body: {
      cancel_at_period_end: true,
    },
  });
}

/**
 * 解約予定を取り消す（cancel_at_period_end=false）。
 * 自動解約予定中に連携先が再追加された場合に使用。
 */
async function resumeSubscription(subscriptionId: string): Promise<void> {
  await stripeRequest({
    method: 'POST',
    path: `/v1/subscriptions/${subscriptionId}`,
    body: {
      cancel_at_period_end: false,
    },
  });
}

async function cancelSubscriptionNow(subscriptionId: string): Promise<void> {
  // 即時キャンセル（現状未使用。将来的に「いますぐ完全に止めたい」ボタン用に残置）
  await stripeRequest({
    method: 'DELETE',
    path: `/v1/subscriptions/${subscriptionId}`,
  });
}

async function createCheckoutSessionForNewSubscription(
  customerId: string,
  quantity: number,
  trialPeriodDays: number
): Promise<string> {
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
      cancel_url: `${appUrl}/digital/share?canceled=1`,
      allow_promotion_codes: false,
      subscription_data: {
        // トライアル残がある場合のみ付与。消化済み（=0）なら付けず即課金。
        ...(trialPeriodDays > 0
          ? { trial_period_days: trialPeriodDays }
          : {}),
      },
      payment_method_types: ['card'],
    },
  });

  if (!session.url) {
    throw new Error('Stripe Checkout URL was not returned');
  }
  return session.url;
}

// =============================================================================
// メインエントリ：syncSubscriptionQuantity
// =============================================================================

/**
 * DB（active family_links 数）に Stripe quantity を合わせる。
 * 呼び出し例：
 *   - 招待承認直後（quantity を +1 にする）
 *   - 連携解除直後（quantity を −1 にする、0 になれば cancel）
 *   - 死後開示確定後（quantity を 0 にしてサブスク終了）
 *
 * @param admin       service_role の Supabase client
 * @param ownerUserId サブスクを持つオーナーの auth.users.id
 * @param ownerEmail  Stripe Customer 作成時に使うメール
 */
export async function syncSubscriptionQuantity(
  admin: SupabaseClient,
  ownerUserId: string,
  ownerEmail: string
): Promise<FamilySubscriptionSyncResult> {
  try {
    // ① DB から target quantity を算出
    const targetQuantity = await countActiveLinks(admin, ownerUserId);

    // ② 現在のサブスク状態を取得
    const { data: subRow, error } = await admin
      .from('digital_subscriptions')
      .select('*')
      .eq('user_id', ownerUserId)
      .maybeSingle();

    if (error) {
      console.error('[syncSubscriptionQuantity] sub lookup failed', error);
      return { ok: false, status: 'error', detail: error.message };
    }

    const subscriptionId = (subRow?.stripe_subscription_id as string | null) ?? null;
    const subscriptionStatus = (subRow?.status as string | null) ?? 'free';
    const currentQuantity = (subRow?.quantity as number | null) ?? 0;
    const stripeCustomerId = (subRow?.stripe_customer_id as string | null) ?? null;

    const hasActiveSubscription =
      subscriptionId &&
      (subscriptionStatus === 'active' ||
        subscriptionStatus === 'trialing' ||
        subscriptionStatus === 'past_due');

    // ③ パターン分岐
    if (targetQuantity === 0) {
      // 連携者ゼロ
      if (!hasActiveSubscription) {
        // サブスクも無し → UI 整合性のため DB quantity を 0 に揃えて終わり。
        // （trialing 中に連携者を全解除したケース。Stripe 側には何もしない）
        if (currentQuantity !== 0) {
          await admin
            .from('digital_subscriptions')
            .update({
              quantity: 0,
              updated_at: new Date().toISOString(),
            })
            .eq('user_id', ownerUserId);
        }
        return {
          ok: true,
          status: 'no_op',
          currentQuantity,
          targetQuantity,
        };
      }
      // サブスク有り → 期間終了で解約予定にする（Portal 解約と挙動を統一）
      //   即時キャンセルではなく cancel_at_period_end=true。
      //   理由：ユーザーは既に当該期間分の料金を支払っており、
      //         期間終了まで利用可能なのが Portal 解約と整合する。
      //         連携先を再追加すれば、syncSubscriptionQuantity が呼ばれて
      //         自動的に解約予定を取り消す（下の resumeSubscription 呼び出し）。
      try {
        await scheduleSubscriptionCancellation(subscriptionId!);
        // DB 側は Webhook（customer.subscription.updated）で更新されるが、
        // 念のためここでも反映しておく（race condition 対策）
        await admin
          .from('digital_subscriptions')
          .update({
            quantity: 0,
            cancel_at_period_end: true,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', ownerUserId);

        return {
          ok: true,
          status: 'scheduled_cancellation',
          previousQuantity: currentQuantity,
        };
      } catch (err) {
        const detail = err instanceof Error ? err.message : 'schedule_cancel_failed';
        console.error(
          '[syncSubscriptionQuantity] schedule cancellation failed',
          detail
        );
        return { ok: false, status: 'error', detail };
      }
    }

    // targetQuantity > 0 のケース
    if (!hasActiveSubscription) {
      // サブスクが無い／キャンセル済み → Checkout を起動する必要あり
      // Stripe Customer を確保（無ければ作成）
      let customerId: string;
      try {
        customerId = await ensureStripeCustomer(admin, ownerUserId, ownerEmail);
      } catch (err) {
        const detail = err instanceof Error ? err.message : 'customer_failed';
        return { ok: false, status: 'error', detail };
      }

      // トライアル残日数（無料トライアルは初回 1 回のみ）。
      //   行が無い新規 → 通常トライアル。残あり → 残り日数。消化済み → 0（即課金）。
      const trialExpiresMs = subRow?.trial_expires_at
        ? new Date(subRow.trial_expires_at as string).getTime()
        : null;
      let remainingTrialDays: number;
      if (!subRow) {
        remainingTrialDays = TRIAL_DAYS;
      } else if (trialExpiresMs && trialExpiresMs > Date.now()) {
        remainingTrialDays = Math.ceil(
          (trialExpiresMs - Date.now()) / (24 * 60 * 60 * 1000)
        );
      } else {
        remainingTrialDays = 0;
      }

      let checkoutUrl: string;
      try {
        checkoutUrl = await createCheckoutSessionForNewSubscription(
          customerId,
          targetQuantity,
          remainingTrialDays
        );
      } catch (err) {
        const detail = err instanceof Error ? err.message : 'checkout_failed';
        console.error('[syncSubscriptionQuantity] checkout creation failed', detail);
        return { ok: false, status: 'error', detail };
      }

      // Stripe サブスクは未確定だが、UI 表示の整合性のため DB 側の
      // quantity を「連携者数」で先回り更新する（pending 表示）。
      // Webhook が来れば applySubscription が同じ値で上書きするので冪等。
      await admin
        .from('digital_subscriptions')
        .update({
          quantity: targetQuantity,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', ownerUserId);

      return {
        ok: false,
        status: 'need_checkout',
        checkoutUrl,
        targetQuantity,
      };
    }

    // サブスク有り → quantity を target に更新
    let stripeSub: StripeSubscriptionLite;
    try {
      stripeSub = await getSubscription(subscriptionId!);
    } catch (err) {
      const detail = err instanceof Error ? err.message : 'subscription_fetch_failed';
      return { ok: false, status: 'error', detail };
    }

    // 解約予定（cancel_at_period_end=true）の状態で連携先が再追加された場合、
    // 自動的に解約予定を取り消す。
    //   これは「連携 0 名 → 自動解約予定」シナリオで、ユーザーが再度連携を
    //   追加したケースを想定。ユーザー視点では「再開」が自然な挙動。
    //   ※ Portal 解約と区別はしていないが、Portal でわざわざ解約予定にした
    //     ユーザーが追加で連携を増やすのは稀なシナリオ。万一そうなった場合も
    //     ユーザーは Portal で再度キャンセルすれば良い。
    if (stripeSub.cancel_at_period_end === true) {
      try {
        await resumeSubscription(subscriptionId!);
        await admin
          .from('digital_subscriptions')
          .update({
            cancel_at_period_end: false,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', ownerUserId);
        // この後の updateSubscriptionQuantity に進む
      } catch (err) {
        const detail = err instanceof Error ? err.message : 'resume_failed';
        console.error('[syncSubscriptionQuantity] resume failed', detail);
        return { ok: false, status: 'error', detail };
      }
    }

    const itemId = stripeSub.items?.data?.[0]?.id;
    if (!itemId) {
      return {
        ok: false,
        status: 'error',
        detail: 'Stripe subscription item not found',
      };
    }

    const stripeCurrentQty = stripeSub.items.data[0].quantity ?? 0;
    if (stripeCurrentQty === targetQuantity) {
      // 既に target と一致 → DB の quantity だけ反映して終わり
      await admin
        .from('digital_subscriptions')
        .update({
          quantity: targetQuantity,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', ownerUserId);
      return {
        ok: true,
        status: 'no_op',
        currentQuantity: stripeCurrentQty,
        targetQuantity,
      };
    }

    try {
      await updateSubscriptionQuantity(subscriptionId!, itemId, targetQuantity);
    } catch (err) {
      const detail = err instanceof Error ? err.message : 'subscription_update_failed';
      console.error('[syncSubscriptionQuantity] update failed', detail);
      return { ok: false, status: 'error', detail };
    }

    // DB 側にも反映（Webhook が遅れても UI に即座に反映できるよう）
    await admin
      .from('digital_subscriptions')
      .update({
        quantity: targetQuantity,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', ownerUserId);

    // stripeCustomerId が未設定だったケースの保険
    if (!stripeCustomerId) {
      console.warn(
        '[syncSubscriptionQuantity] stripe_customer_id missing for user',
        ownerUserId
      );
    }

    return {
      ok: true,
      status: 'updated',
      currentQuantity: stripeCurrentQty,
      targetQuantity,
    };
  } catch (err) {
    const detail = err instanceof Error ? err.message : 'unexpected';
    console.error('[syncSubscriptionQuantity] unexpected', detail);
    return { ok: false, status: 'error', detail };
  }
}
