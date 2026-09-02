/**
 * POST /api/retirement/pro/billing/webhook
 *
 * Stripe から「払い終わった」知らせを受け、通行証を1枚作ります（B-2・senjutsu_20260902f.md 4番ウ）。
 *
 * ★7段（仕様のとおり）
 *   1 raw body を取り、Stripe-Signature を STRIPE_WEBHOOK_SECRET_PRO_RETIREMENT で確かめる。外れたら 400
 *   2 type が checkout.session.completed でなければ 200 を返して何もしない
 *   3 mode==='payment' かつ payment_status==='paid' でなければ 200（記録に cs_… を書く）
 *   4 amount_total===19800 かつ currency==='jpy' でなければ 200（通行証を作らない。記録に cs_… と数を書く）
 *   5 通行証を1枚作る。★cs が無ければ 500。★メールアドレスが取れなくても作る（null で入れ、
 *     作れたあとに記録へ1行。senjutsu_20260902h.md 2番）。
 *     stripe_checkout_session_id の unique で衝突したら何もしない → 200
 *   6 DB に書けなかったときだけ 500（Stripe が送り直します）
 *   7 返すのは常に空の 200／400／500。文は出さない
 *
 * ★digital の webhook と、そろえたところ／変えたところ（senjutsu_20260902g.md 5番）
 *   そろえた … runtime='nodejs' ／ dynamic='force-dynamic' ／ req.text() ／ verifyStripeSignature()
 *   変えた   … 二重を避けるのは `retirement_pro_passes.stripe_checkout_session_id` の unique（イベントの表は作りません）
 *              ★DB に書けなかったら 500 にします（digital は続行。pro は「払ったのに通行証が無い」を避けます）
 *
 * ★記録にメールアドレスを書きません。書くのは cs_… / pi_… までです。
 * ★記録の重み（senjutsu_20260902h.md 5番 足し3）
 *   info  … 通ったこと（通行証を1枚作りました／もう作ってあります）
 *   warn  … 途中で止めたこと（署名が合いません／払い終わっていません／金額が合いません）
 *   error … 書けなかったこと・こちらの落ち（環境変数が無い／id が無い／created が無い／
 *           metadata が範囲の外／DBに書けない／★メールアドレスが取れなかった）
 * ★purchased_at は**イベントの created**（＝支払いが完了した知らせの時刻）から作ります。
 *   session.created（押した時刻）ではありません（規約15-3「お支払いの完了後、1年間」）。
 */

import 'server-only';
import { NextResponse } from 'next/server';
import { verifyStripeSignature } from '@/lib/stripe/client';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import {
  tsuukoushoKagi,
  kigenWoKimeru,
  metadataKaraModosu,
} from '@/lib/retirement/pro/pass';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** 19,800円・税込。★この数はここ1か所だけです */
const KAKAKU_EN = 19800;

type Session = {
  id?: string;
  mode?: string;
  payment_status?: string;
  amount_total?: number;
  currency?: string;
  payment_intent?: string | { id?: string } | null;
  customer_details?: { email?: string | null } | null;
  metadata?: Record<string, unknown> | null;
};
type Event = { id?: string; type?: string; created?: number; data?: { object?: Session } };

const kara = (status: number) => new NextResponse(null, { status });

export async function POST(req: Request) {
  // ① 署名
  let rawBody: string;
  try {
    rawBody = await req.text();
  } catch {
    return kara(400);
  }
  const sig = req.headers.get('stripe-signature');
  if (!sig) return kara(400);

  const secret = process.env.STRIPE_WEBHOOK_SECRET_PRO_RETIREMENT;
  if (!secret) {
    console.error('[pro/webhook] 環境変数がありません', {
      name: 'STRIPE_WEBHOOK_SECRET_PRO_RETIREMENT',
    });
    return kara(500);
  }

  try {
    verifyStripeSignature(rawBody, sig, secret);
  } catch (e) {
    console.warn('[pro/webhook] 署名が合いません', {
      message: e instanceof Error ? e.message : 'unknown',
    });
    return kara(400);
  }

  let ev: Event;
  try {
    ev = JSON.parse(rawBody) as Event;
  } catch {
    return kara(400);
  }

  // ② 種類
  if (ev.type !== 'checkout.session.completed') return kara(200);

  const s = ev.data?.object ?? {};
  const cs = typeof s.id === 'string' ? s.id : null;

  // ③ 払い終わっているか
  if (s.mode !== 'payment' || s.payment_status !== 'paid') {
    console.warn('[pro/webhook] 払い終わっていません', {
      cs,
      mode: s.mode ?? null,
      payment_status: s.payment_status ?? null,
    });
    return kara(200);
  }

  // ④ 金額（★19,800円でない支払いに通行証を出しません）
  if (s.amount_total !== KAKAKU_EN || s.currency !== 'jpy') {
    console.warn('[pro/webhook] 金額が合いません。通行証を作りません', {
      cs,
      amount_total: s.amount_total ?? null,
      currency: s.currency ?? null,
    });
    return kara(200);
  }

  // ⑤ 通行証を1枚

  // ★cs（Session の id）が無ければ、ここで止めます（senjutsu_20260902h.md 5番 足し2）。
  //   null のまま insert すると not null 違反で⑥に落ち、送り直しのたびに同じところで落ちます。
  //   ★500 のままにします。Stripe は必ず id を送りますので、起きたら「知らせの形が変わった」ということです
  if (!cs) {
    console.error('[pro/webhook] 知らせに Session の id がありません', { evId: ev.id ?? null });
    return kara(500);
  }

  // ★★メールアドレスが取れなくても、通行証は作ります（senjutsu_20260902h.md 2番）。
  //   「払ったのに通行証が無い」は取り返せません。「通行証はあるがメールが送れない」は手で取り返せます。
  //   ★記録は、通行証を作れたあとに1行出します（下）。値（メールアドレス）は書きません
  const email =
    typeof s.customer_details?.email === 'string' && s.customer_details.email.length > 0
      ? s.customer_details.email
      : null;

  const t = metadataKaraModosu(s.metadata);
  if (!t.ok) {
    console.error('[pro/webhook] metadata の入力が範囲の外です', { cs, dameNaKagi: t.dameNaKagi });
    return kara(500);
  }

  if (typeof ev.created !== 'number' || !Number.isFinite(ev.created)) {
    console.error('[pro/webhook] 知らせに created がありません', { cs });
    return kara(500);
  }
  const katta = new Date(ev.created * 1000);
  const kigen = kigenWoKimeru(katta);

  const pi =
    typeof s.payment_intent === 'string'
      ? s.payment_intent
      : (s.payment_intent && typeof s.payment_intent === 'object' && s.payment_intent.id) || null;

  const admin = createAdminSupabaseClient();
  const { error } = await admin.from('retirement_pro_passes').insert({
    pass_key: tsuukoushoKagi(),
    stripe_checkout_session_id: cs,
    stripe_payment_intent_id: pi,
    email,
    purchased_at: katta.toISOString(),
    expires_at: kigen.toISOString(),
    inputs: t.value,
    updated_at: katta.toISOString(),
  });

  if (error) {
    // ★同じ支払いの2度目の知らせ。unique（23505）なら、もう1枚作りません
    if (error.code === '23505') {
      console.info('[pro/webhook] もう作ってあります', { cs });
      return kara(200);
    }
    // ⑥ 書けなかった → 500。Stripe が送り直します
    console.error('[pro/webhook] 通行証を書けませんでした', { cs, code: error.code ?? null });
    return kara(500);
  }

  // ★メールアドレスが取れなかったときは、ここで1行。★通行証は作れています
  if (email === null) {
    console.error(
      '[pro/webhook] ★メールアドレスが取れませんでした。通行証は作りました。手で連絡が要ります',
      { cs, pi },
    );
  }

  console.info('[pro/webhook] 通行証を1枚作りました', { cs, pi });
  return kara(200);
}
