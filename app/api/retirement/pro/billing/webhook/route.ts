/**
 * POST /api/retirement/pro/billing/webhook
 *
 * Stripe から「払い終わった」知らせを受け、通行証を1枚作ります（B-2・senjutsu_20260902f.md 4番ウ）。
 *
 * ★7段（仕様のとおり）
 *   1 raw body を取り、Stripe-Signature を STRIPE_WEBHOOK_SECRET_PRO_RETIREMENT で確かめる。外れたら 400
 *   2 type が checkout.session.completed / checkout.session.async_payment_succeeded の
 *     どちらでもなければ 200 を返して何もしない
 *   3 mode==='payment' かつ payment_status==='paid' でなければ 200（記録に cs_… を書く）
 *   4 amount_total===19800 かつ currency==='jpy' でなければ 200（通行証を作らない。記録に cs_… と数を書く）
 *   5 通行証を1枚作る。★cs が無ければ 500。
 *     ★★欠けているものがあっても、通行証は作ります（senjutsu_20260902i.md 2番）。
 *       メールアドレスが取れない → null で作る／入力が読めない → inputs は空 {} で作る／
 *       知らせに created が無い → 受け取った時刻で作る。いずれも作れたあとに記録へ1行
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
 * ★記録の重み（senjutsu_20260902h.md 5番 足し3 ／ 同 i.md 2番）
 *   info  … 通ったこと（通行証を1枚作りました／もう作ってあります）
 *   warn  … 途中で止めたこと（署名が合いません／払い終わっていません／金額が合いません）
 *   error … 2つあります。★字で見分けられるようにします
 *           ・作れなかった   … 「★通行証を作れませんでした。」で始めます
 *           ・作ったが欠けた … 「★通行証は作りました。」を必ず文の中に入れます
 *
 * ★★層の表（senjutsu_20260902j.md 2番。i.md 2番の3つを、4つの層に置き換えました）
 *   層1・受け取る前  … 見出しが無い／署名が合わない／JSON が読めない          → 400
 *                      ★記録は「★知らせを受け取れませんでした」で始める
 *   層2・作らずに終わる … ①まだ払い終わっていない（あとの知らせを待つ）
 *                        ②金額が違う（当社の口が作った支払いではない）
 *                        ③もう作ってある（二重）                              → 200
 *   層3・あとで作る／気づく … ④環境変数が無い ⑤DBに書けない（送り直しで直る）
 *                            ⑥cs が無い（★直りません。500 は気づくためです）  → 500
 *                            ★記録は「★通行証を作れませんでした。」で始める
 *   層4・欠けても作る … email が無い→null ／ metadata が読めない→{} ／
 *                      created が無い→受け取った時刻                          → 200・★作る
 *                      ★記録は「★通行証は作りました。」を必ず入れる
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
  // ★受け取った時刻。★ここで1回だけ作り、下へ渡します。
  //   知らせに created が無かったときの purchased_at に使います（senjutsu_20260902i.md 2番）。
  //   ★既定値ではありません。入口が知っている事実を、1回だけ作って渡しています
  const uketottaToki = new Date();

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
    console.error('[pro/webhook] ★通行証を作れませんでした。環境変数がありません', {
      name: 'STRIPE_WEBHOOK_SECRET_PRO_RETIREMENT',
    });
    return kara(500);
  }

  try {
    verifyStripeSignature(rawBody, sig, secret);
  } catch (e) {
    console.warn('[pro/webhook] ★知らせを受け取れませんでした。署名が合いません', {
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

  // ② 種類。★2つ受けます（senjutsu_20260902j.md 1番）
  //   checkout.session.completed               … カード等、その場で払い終わるもの
  //   ★checkout.session.async_payment_succeeded … コンビニ払い等、**あとでお金が着いた**ときの知らせ
  //     ★checkout.session.completed は payment_status が 'unpaid' でも飛びます
  //       （Stripe の説明 … status complete は「Payment processing may still be in progress」）。
  //       この知らせを受けないと、あとでお金が着いても通行証が出ません
  //     ★cs（Session の id）は同じですので、unique の二重よけがそのまま効きます
  //     ★ev.created は「お金が着いた時刻」になり、purchased_at として正しくなります（規約15-3）
  //   ★checkout.session.async_payment_failed は受けません（口を小さく保ちます・書き置き）
  if (
    ev.type !== 'checkout.session.completed' &&
    ev.type !== 'checkout.session.async_payment_succeeded'
  ) {
    return kara(200);
  }

  const s = ev.data?.object ?? {};
  const cs = typeof s.id === 'string' ? s.id : null;

  // ③ 払い終わっているか
  if (s.mode !== 'payment' || s.payment_status !== 'paid') {
    console.warn('[pro/webhook] ★まだ払い終わっていません。あとの知らせを待ちます', {
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
    console.error('[pro/webhook] ★通行証を作れませんでした。知らせに Session の id がありません', {
      evId: ev.id ?? null,
    });
    return kara(500);
  }

  // ★★メールアドレスが取れなくても、通行証は作ります（senjutsu_20260902h.md 2番）。
  //   「払ったのに通行証が無い」は取り返せません。「通行証はあるがメールが送れない」は手で取り返せます。
  //   ★記録は、通行証を作れたあとに1行出します（下）。値（メールアドレス）は書きません
  const email =
    typeof s.customer_details?.email === 'string' && s.customer_details.email.length > 0
      ? s.customer_details.email
      : null;

  // ★★入力が読めなくても、通行証は作ります（senjutsu_20260902i.md 2番）。
  //   入力は空（{}）で入れます。A-2 の門で、入力し直していただきます。
  //   ★1年の間、何度でも計算し直せますので、入力し直せば済みます
  const t = metadataKaraModosu(s.metadata);
  const inputs = t.ok ? t.value : {};

  // ★★知らせに created が無くても、通行証は作ります。★入口で作った「受け取った時刻」を使います。
  //   数分ずれますが、1年の通行証では問題になりません。記録に残しますので、あとで直せます
  const created =
    typeof ev.created === 'number' && Number.isFinite(ev.created) ? ev.created : null;
  const katta = created !== null ? new Date(created * 1000) : uketottaToki;
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
    inputs,
    updated_at: katta.toISOString(),
  });

  if (error) {
    // ★同じ支払いの2度目の知らせ。unique（23505）なら、もう1枚作りません
    if (error.code === '23505') {
      console.info('[pro/webhook] もう作ってあります', { cs });
      return kara(200);
    }
    // ⑥ 書けなかった → 500。Stripe が送り直します
    console.error('[pro/webhook] ★通行証を作れませんでした。DBに書けませんでした', {
      cs,
      code: error.code ?? null,
    });
    return kara(500);
  }

  // ★欠けていたものは、ここで1行ずつ。★通行証は作れています（字は「★通行証は作りました。」で始めます）
  if (email === null) {
    console.error(
      '[pro/webhook] ★通行証は作りました。メールアドレスが取れませんでした。手で連絡が要ります',
      { cs, pi },
    );
  }
  if (!t.ok) {
    console.error(
      '[pro/webhook] ★通行証は作りました。入力が取れませんでした。入力し直していただく必要があります',
      { cs, pi, dameNaKagi: t.dameNaKagi },
    );
  }
  if (created === null) {
    console.error(
      '[pro/webhook] ★通行証は作りました。知らせに created がありませんでしたので、受け取った時刻を使いました',
      { cs, pi },
    );
  }

  console.info('[pro/webhook] 通行証を1枚作りました', { cs, pi });
  return kara(200);
}
