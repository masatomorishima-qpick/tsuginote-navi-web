/**
 * POST /api/retirement/pro/billing/checkout
 *
 * 退職金とiDeCoの受け取り方シミュレーション（有料版・19,800円税込・一回払い）の
 * Stripe Checkout Session を1つ作り、その url を返します（B-2・senjutsu_20260902f.md 4番イ）。
 *
 * 入力（JSON）… 無料版の5項目（★単位は画面のまま＝万円・年・歳）
 * 出力        … { url }。だめだったときは空の 400／500（★文は出しません）
 *
 * ★決め
 *   ・Customer を作らない（customer_creation: 'if_required'）
 *   ・customer_email を渡さない（★Stripe の決済画面で入れていただく）
 *   ・metadata に無料版の5項目を乗せて Stripe に預ける。★払い終わるまで当社の側に何も残りません
 *   ・環境変数に既定値を作らない。無ければ 500（記録には**名前だけ**書き、値は書きません）
 *   ・記録にメールアドレスを書かない（この口はメールを受け取りません）
 *   ・★記録に「知らない鍵の名前」を書かない。数だけ書く（senjutsu_20260902h.md 5番 足し1）
 *   ・★記録の重み … info＝通ったこと／warn＝途中で止めたこと／error＝書けなかったこと・こちらの落ち
 *
 * ★★この口は、本番に出ても**閉じています**（栓・senjutsu_20260902k.md 6番）。
 *   PRO_RETIREMENT_CHECKOUT_ENABLED が '1' でなければ 404 を返します。
 *   ★「画面から呼ばれない」と「誰も叩けない」は別のことです。口はボタンとは別に開きます。
 *   ★画面5-6の「有料版購入」は /retirement/pro/buy のままです（A-2 で繋ぎます）。
 */

import 'server-only';
import { NextResponse } from 'next/server';
import { stripeRequest } from '@/lib/stripe/client';
import { freeInputWoTashikameru, metadataNiNoseru } from '@/lib/retirement/pro/pass';
import { FIELDS } from '@/components/retirement/pro/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** 19,800円・税込・一回払いの Price の ID。★既定値を作りません */
function kakakuId(): string {
  const id = process.env.STRIPE_PRICE_PRO_RETIREMENT;
  if (!id) throw new Error('STRIPE_PRICE_PRO_RETIREMENT');
  return id;
}

/** 頁の元。★既定値を作りません */
function sitoNoMoto(): string {
  const url = process.env.NEXT_PUBLIC_APP_URL;
  if (!url) throw new Error('NEXT_PUBLIC_APP_URL');
  return url.replace(/\/+$/, '');
}

type Session = { id?: string; url?: string };

export async function POST(req: Request) {
  // ① JSON が読めるか
  let moto: unknown;
  try {
    moto = await req.json();
  } catch {
    return new NextResponse(null, { status: 400 });
  }

  // ② 5項目を確かめる
  const t = freeInputWoTashikameru(moto);
  if (!t.ok) {
    // ★どの鍵がだめかは記録にだけ書きます（画面には出しません）
    // ★★知らない鍵の「名前」は書きません。数だけにします。
    //   この口は直に叩けるため、名前をそのまま書くと、外から当社の記録に字を書き込めます
    //   （senjutsu_20260902h.md 5番 足し1）
    console.warn('[pro/checkout] 入力が範囲の外です', {
      dameNaKagi: t.dameNaKagi.filter((k) => FIELDS.some((f) => f.key === k)),
      shiranaiKagi: t.dameNaKagi.filter((k) => !FIELDS.some((f) => f.key === k)).length,
    });
    return new NextResponse(null, { status: 400 });
  }

  // ③ 環境変数
  let price: string;
  let moto2: string;
  try {
    price = kakakuId();
    moto2 = sitoNoMoto();
  } catch (e) {
    console.error('[pro/checkout] 環境変数がありません', {
      name: e instanceof Error ? e.message : 'unknown',
    });
    return new NextResponse(null, { status: 500 });
  }

  // ④ ★★栓（senjutsu_20260902k.md 6番）
  //   PRO_RETIREMENT_CHECKOUT_ENABLED が '1' でなければ、この口は開いていません。
  //   ★Vercel には入れません。入れるのは A-2（画面から呼ぶようにする回）です。
  //   ★既定値は「閉じている」です（無ければ動かない＝「既定値を作らない」と同じ向き）。
  //   ★404 にします。503 や 501 だと「あるけれど閉じている」と分かってしまいます。
  //   ★見る順番は ①JSON ②5項目 ③環境変数 ④栓 ⑤Stripe。
  //     ③のあとに置いています（Preview には PRICE が無いので③で止まり、当てが変わりません）
  if (process.env.PRO_RETIREMENT_CHECKOUT_ENABLED !== '1') {
    console.info('[pro/checkout] ★口はまだ開いていません');
    return new NextResponse(null, { status: 404 });
  }

  // ⑤ Stripe に Session を作らせる
  try {
    const s = await stripeRequest<Session>({
      method: 'POST',
      path: '/v1/checkout/sessions',
      body: {
        mode: 'payment',
        line_items: [{ price, quantity: 1 }],
        customer_creation: 'if_required',
        locale: 'ja',
        metadata: metadataNiNoseru(t.value),
        success_url: `${moto2}/retirement/pro/arigatou?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${moto2}/retirement/pro`,
      },
    });
    if (!s.url) {
      console.error('[pro/checkout] url が返りませんでした', { id: s.id ?? null });
      return new NextResponse(null, { status: 500 });
    }
    return NextResponse.json({ url: s.url });
  } catch (e) {
    console.error('[pro/checkout] Stripe に作れませんでした', {
      message: e instanceof Error ? e.message : 'unknown',
    });
    return new NextResponse(null, { status: 500 });
  }
}
