/**
 * POST /api/digital/billing/portal
 *
 * Stripe Customer Portal Session を発行し、Portal の URL を返す。
 * 解約・支払い方法の更新・領収書閲覧などはすべて Portal で行う。
 *
 * 入力：なし
 * 出力：{ ok: true, url } または { ok: false, error }
 */

import { NextResponse } from 'next/server';
import { createDigitalServerClient } from '@/lib/supabase/digitalServer';
import { createPortalSession } from '@/lib/stripe/billing';
import { getOwnSubscription } from '@/lib/digital/subscriptions';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function getAppUrl(): string {
  const url = process.env.NEXT_PUBLIC_APP_URL;
  if (!url) throw new Error('NEXT_PUBLIC_APP_URL is not set');
  return url.replace(/\/+$/, '');
}

export async function POST() {
  try {
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

    const sub = await getOwnSubscription(supabase, user.id);
    if (!sub?.stripe_customer_id) {
      return NextResponse.json(
        {
          ok: false,
          error: 'no_customer',
          detail:
            'Stripe の顧客情報が見つかりません。先にアップグレード画面から決済をお試しください。',
        },
        { status: 400 }
      );
    }

    const session = await createPortalSession(
      sub.stripe_customer_id,
      `${getAppUrl()}/digital/settings`
    );

    return NextResponse.json({ ok: true, url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unexpected_error';
    console.error('[api/digital/billing/portal] failed', message);
    return NextResponse.json(
      { ok: false, error: 'portal_failed', detail: message },
      { status: 500 }
    );
  }
}
