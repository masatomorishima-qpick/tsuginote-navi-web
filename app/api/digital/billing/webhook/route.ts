/**
 * POST /api/digital/billing/webhook
 *
 * Stripe からの Webhook を受信するエンドポイント。
 *
 * 重要：
 *   - **必ず raw body** を使う（パース後だと署名検証が通らない）
 *   - **Node.js runtime** で動かす（node:crypto を使うため）
 *   - **冪等保存**：digital_billing_events テーブルに stripe_event_id UNIQUE で保存
 *   - **5xx を返さない方針**：ハンドラ内エラーでも 200 を返す（Stripe の再送ループ回避）
 *     ただし署名検証失敗 / 設定不備は 400 を返してロギング
 */

import { NextResponse } from 'next/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import {
  verifyStripeSignature,
  StripeApiError,
} from '@/lib/stripe/client';
import {
  applyStripeEvent,
  type StripeWebhookEvent,
} from '@/lib/digital/billing';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function getWebhookSecret(): string {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret || secret.startsWith('whsec_xxx')) {
    throw new Error(
      'STRIPE_WEBHOOK_SECRET is not configured. stripe listen --forward-to localhost:3000/api/digital/billing/webhook を実行するか、Stripe Dashboard で endpoint を登録して値を取得してください。'
    );
  }
  return secret;
}

export async function POST(req: Request) {
  // ① raw body を取得
  let rawBody: string;
  try {
    rawBody = await req.text();
  } catch (err) {
    console.error('[webhook] failed to read body', err);
    return NextResponse.json(
      { ok: false, error: 'invalid_body' },
      { status: 400 }
    );
  }

  // ② Stripe-Signature ヘッダ取得
  const sigHeader = req.headers.get('stripe-signature');
  if (!sigHeader) {
    return NextResponse.json(
      { ok: false, error: 'missing_signature' },
      { status: 400 }
    );
  }

  // ③ 署名検証
  let secret: string;
  try {
    secret = getWebhookSecret();
  } catch (err) {
    const message = err instanceof Error ? err.message : 'config_error';
    console.error('[webhook] config error', message);
    return NextResponse.json(
      { ok: false, error: 'config_error', detail: message },
      { status: 500 }
    );
  }

  try {
    verifyStripeSignature(rawBody, sigHeader, secret);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'signature_error';
    console.warn('[webhook] signature verification failed', message);
    return NextResponse.json(
      { ok: false, error: 'invalid_signature' },
      { status: 400 }
    );
  }

  // ④ Event をパース
  let event: StripeWebhookEvent;
  try {
    event = JSON.parse(rawBody) as StripeWebhookEvent;
  } catch (err) {
    console.error('[webhook] JSON parse failed', err);
    return NextResponse.json(
      { ok: false, error: 'invalid_json' },
      { status: 400 }
    );
  }

  // ⑤ 冪等保存：stripe_event_id UNIQUE で INSERT
  // 重複なら 23505（unique_violation）が返るので、200 で終了
  const admin = createAdminSupabaseClient();

  try {
    const { error: insErr } = await admin.from('digital_billing_events').insert({
      stripe_event_id: event.id,
      type: event.type,
      payload: event,
      // user_id は applyStripeEvent 後にわかる場合があるので、ここでは未設定
    });
    if (insErr) {
      // duplicate key（23505）なら既処理として終了
      if (insErr.code === '23505') {
        return NextResponse.json({ ok: true, duplicate: true });
      }
      console.error('[webhook] event save failed', insErr);
      // 保存に失敗してもイベント処理は続行する（重複処理リスク < 取りこぼしリスク）
    }
  } catch (err) {
    console.error('[webhook] event save threw', err);
  }

  // ⑥ Event を反映
  let userId: string | null = null;
  try {
    const result = await applyStripeEvent(admin, event);
    userId = result.userId;
  } catch (err) {
    // applyStripeEvent 内で catch しているので通常ここには来ないが念のため
    if (err instanceof StripeApiError) {
      console.error('[webhook] stripe API error during apply', err.message);
    } else {
      console.error('[webhook] applyStripeEvent threw', err);
    }
  }

  // ⑦ user_id が判明していれば後付けで更新
  if (userId) {
    try {
      await admin
        .from('digital_billing_events')
        .update({ user_id: userId })
        .eq('stripe_event_id', event.id);
    } catch (err) {
      console.error('[webhook] user_id backfill failed', err);
    }
  }

  return NextResponse.json({ ok: true });
}
