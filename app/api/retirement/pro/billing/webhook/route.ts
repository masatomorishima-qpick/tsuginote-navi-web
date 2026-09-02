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
 *   6 DB に書けなかったときだけ 500（Stripe が送り直します）。★A-2a からは、メールの道でも 500 を返すことがあります（環境の変数が無い／Resend まで届かない）
 *   7 返すのは常に空の 200／400／500。文は出さない
 *
 * ★★B-3 で足したもの（senjutsu_20260902s.md 4番ウ）
 *   ・通行証を作れたら、そのまま**ご購入のメールを1通**送り、送れたら `mail_sent_at` を書く
 *   ・★23505（もう作ってある）でも、**`mail_sent_at` が null なら送る**
 *     → ★Stripe の送り直しが、そのまま**メールの取り返し**になります
 *   ・★A-2a（2026-09-02・senjutsu_20260902ad.md 6番）で**決め直し** ── 返りは道で決めます（`mailNoMichi()` の注記）
 *       送り先が無い → 200／環境の変数が無い → 500／Resend まで届かない（network_error）→ 500／Resend が断った → 200
 *   ・★メールを送る前に、必ず `mail_error='sending'` を**条件つきの1本の update**で書きます（★同時に2つ来ても送るのは1つ）
 *   ・★メールの文「同じ内容のメールが2通届くことがあります。お支払いは1回だけです。」はそのまま（手で送り直したときの2通が0ではないため）
 *   ・★行の見え方6つ（`mail_sent_at`／`mail_error`）は `mailNoMichi()` の注記。手順書 `tejun_mail_okurinaoshi.md`（戦術）が読みます
 *   ・★書き置き … Resend が遅いと、その分だけ Stripe への返事が遅れます。
 *     ★Stripe の説明頁は「複雑な処理の前に 2xx を返せ」「非同期の待ち行列で処理せよ」と書いています。
 *     ★★いまの形は、その字と逆を向いています。**C-4 で、メールを webhook の外に出します**
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
 * ★2026-09-02 時点で有効な支払い方法は6つ（JCB・カード・カード分割払い・Apple Pay・Link・MB WAY）。
 *   すべてカード／ウォレットで、`unpaid` になる道はありません。
 *   ★ただし設定は画面で変わります。ここは設定に頼らず、`async_payment_succeeded` も受けます。
 *
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
import { kounyuMailWoOkuru } from '@/lib/retirement/pro/mail';

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

type Admin = ReturnType<typeof createAdminSupabaseClient>;

/** メールに載せるリンクの元。★既定値を作りません */
function sitoNoMoto(): string | null {
  const u = process.env.NEXT_PUBLIC_APP_URL;
  if (!u) return null;
  return u.replace(/\/+$/, '');
}

/** 鍵つきの道のリンク */
function linkWoTsukuru(moto: string, kagi: string): string {
  return `${moto}/retirement/pro/hiraku?key=${encodeURIComponent(kagi)}`;
}

/**
 * ★送り直してよい `mail_error` の字（★定数1つ・字を2か所に書かない・senjutsu_20260902ab.md 2番）。
 *   `network_error` … Resend まで届かなかった＝1通も出ていない。★Stripe の送り直しで、もう一度送る道に入れます
 *   ★`send_failed`・`no_message_id`・`email_null`・`sending` は送り直しません（出ているかもしれない／永久に出ない）
 */
const OKURINAOSHI_OK = ['network_error'] as const;

/**
 * ★★メールの道（A-2a-6・senjutsu_20260902ad.md 6番・ab.md・ac.md・ad.md）。返りは 200 か 500。
 *
 *   a  email が null → `mail_error='email_null'`（書けなくても 200）→ **200**（送る道に入らない・送り直しても永久に送れない）
 *   b  `NEXT_PUBLIC_APP_URL` 無し／`RESEND_API_KEY` 無し → **500**（行は触らない。環境を直せば送り直しが通る）
 *   c  ★条件つき update … `mail_error='sending' where mail_sent_at is null and (mail_error is null or in OKURINAOSHI_OK)`
 *        更新できた行数 0 → **送らずに 200**（もう誰かが送る道に入っている／もう送れている／別の理由の字が立っている）
 *        update 自体が失敗 → **送らずに 500**（まだ送っていないので、送り直しで取り返せる）
 *        ★★同じ知らせが同時に2つ来ても、この update は1本の原子な文なので、**送るのは1つだけ**です
 *   d  送る（`mail.ts` の形のまま）
 *   e  ok:true  → `mail_sent_at=now(), mail_error=null` → **200**（書けなくても 200・error 1行。行は 'sending' のまま＝手順書）
 *      ok:false → `mail_error=<error の字>` → `network_error` なら **500**、それ以外は **200**
 *                 （★この update が書けなければ、どちらも 200・error 1行。'sending' のまま残る＝手順書で拾う）
 *
 * ★★通行証（`pass_key`・`inputs`・`kekka`）には触りません。★記録に `to`（メールアドレス）を書きません。
 * ★行の見え方（手順書）… null/null＝送る道に未到達（または環境の変数が無くて500）／null/'email_null'／null/'sending'＝送ったかもしれない／
 *   null/'network_error'＝送り直しで通る／null/'send_failed'・'no_message_id'＝Resend が断った／now()/null＝送れた
 */
export async function mailNoMichi(
  admin: Admin,
  x: { cs: string; pi: string | null; kagi: string; email: string | null; kigen: Date },
): Promise<200 | 500> {
  const gyou = () => admin.from('retirement_pro_passes');

  // a
  if (x.email === null) {
    console.error('[pro/webhook] ★通行証は作りました。送り先がありません', { cs: x.cs });
    const { error } = await gyou()
      .update({ mail_error: 'email_null' })
      .eq('stripe_checkout_session_id', x.cs)
      .is('mail_sent_at', null);
    if (error) {
      console.error('[pro/webhook] ★送り先が無い印を書けませんでした', { cs: x.cs, code: error.code ?? null });
    }
    return 200;
  }

  // b（★行は触らない）
  const moto = sitoNoMoto();
  if (moto === null) {
    console.error('[pro/webhook] ★通行証は作りました。メールの宛先の元がありません', {
      name: 'NEXT_PUBLIC_APP_URL',
      cs: x.cs,
    });
    return 500;
  }
  if (!process.env.RESEND_API_KEY) {
    console.error('[pro/webhook] ★通行証は作りました。メールの鍵がありません', {
      name: 'RESEND_API_KEY',
      cs: x.cs,
    });
    return 500;
  }

  // c（★条件つき・原子・行数は .select('id') で見る）
  const { data: totta, error: sendingErr } = await gyou()
    .update({ mail_error: 'sending' })
    .eq('stripe_checkout_session_id', x.cs)
    .is('mail_sent_at', null)
    .or(`mail_error.is.null,mail_error.in.(${OKURINAOSHI_OK.join(',')})`)
    .select('id');
  if (sendingErr) {
    console.error('[pro/webhook] ★通行証は作りました。送る印を書けませんでした。送らずに送り直しを待ちます', {
      cs: x.cs,
      code: sendingErr.code ?? null,
    });
    return 500;
  }
  if (!totta || totta.length === 0) {
    console.info('[pro/webhook] メールは、もう送る道に入っているか、送ってあります', { cs: x.cs });
    return 200;
  }

  // d
  const r = await kounyuMailWoOkuru({
    to: x.email,
    link: linkWoTsukuru(moto, x.kagi),
    kigen: x.kigen,
  });

  // e
  if (r.ok) {
    const { error } = await gyou()
      .update({ mail_sent_at: new Date().toISOString(), mail_error: null })
      .eq('stripe_checkout_session_id', x.cs);
    if (error) {
      // ★送れた印を書けなかった → 'sending' のまま。手順書（受信箱で確かめる → 戻す）で拾います
      console.error('[pro/webhook] ★メールは送りましたが、送れた印を書けませんでした', {
        cs: x.cs,
        code: error.code ?? null,
      });
      return 200;
    }
    console.info('[pro/webhook] ★メールを送りました', { cs: x.cs, pi: x.pi });
    return 200;
  }

  console.error('[pro/webhook] ★通行証は作りました。メールを送れませんでした', {
    cs: x.cs,
    error: r.error,
  });
  const { error } = await gyou()
    .update({ mail_error: r.error })
    .eq('stripe_checkout_session_id', x.cs);
  if (error) {
    console.error('[pro/webhook] ★送れなかった理由を書けませんでした', { cs: x.cs, code: error.code ?? null });
    return 200;
  }
  return (OKURINAOSHI_OK as readonly string[]).includes(r.error) ? 500 : 200;
}

/**
 * ★もう作ってある（23505）ときの道。
 * その行を1つ読み、**まだ送っていなければ送る道へ**（★送り直しを取り返しにするため）。返りは 200 か 500。
 */
async function madaOkuttenaiNaraOkuru(admin: Admin, cs: string, pi: string | null): Promise<200 | 500> {
  const { data, error } = await admin
    .from('retirement_pro_passes')
    .select('pass_key, email, expires_at, mail_sent_at')
    .eq('stripe_checkout_session_id', cs)
    .maybeSingle();

  if (error) {
    console.error('[pro/webhook] ★通行証は作りました。送ったかどうかを読めませんでした', {
      cs,
      code: error.code ?? null,
    });
    return 500;
  }
  if (!data) {
    console.error('[pro/webhook] ★通行証は作りました。その行を読めませんでした', { cs });
    return 500;
  }
  if (data.mail_sent_at) {
    console.info('[pro/webhook] メールは、もう送ってあります', { cs });
    return 200;
  }

  const kigen = new Date(data.expires_at as string);
  if (!Number.isFinite(kigen.getTime())) {
    console.error('[pro/webhook] ★通行証は作りました。期限を日付にできませんでした', { cs });
    return 200;
  }

  return mailNoMichi(admin, {
    cs,
    pi,
    kagi: data.pass_key as string,
    email: (data.email as string | null) ?? null,
    kigen,
  });
}

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
  //   ★checkout.session.async_payment_succeeded … ★**あとからお金が着く**ものの、着いたときの知らせ
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
  // ★鍵は、あとでメールのリンクに使いますので、変数に置きます
  const kagi = tsuukoushoKagi();
  const { error } = await admin.from('retirement_pro_passes').insert({
    pass_key: kagi,
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
      // ★まだメールを送っていなければ、ここで送ります（★送り直しを取り返しにします）。★返りはメールの道が決めます（200／500）
      return kara(await madaOkuttenaiNaraOkuru(admin, cs, pi));
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

  // ★★ご購入のメールを1通。★送れなくても、通行証は消しません。★返りはメールの道が決めます（200／500・A-2a-6）
  return kara(await mailNoMichi(admin, { cs, pi, kagi, email, kigen }));
}
