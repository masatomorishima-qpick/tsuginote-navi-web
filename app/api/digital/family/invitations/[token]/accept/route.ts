/**
 * POST /api/digital/family/invitations/[token]/accept
 *
 * 招待を承認する。
 *
 * クライアントで以下を準備して送る：
 *   1. 連携者のパスフレーズで暗号化された RSA 鍵ペア（generateRecipientKeypair 出力）
 *   2. （後続：オーナーがすでに KEK を持つ場合は、オーナーのアプリが直接 KEK 暗号文を発行するため
 *      この時点では送らない。承認後に owner 側のクライアントが KEK を連携者公開鍵で
 *      暗号化して digital_user_kek_envelopes に保存する仕組みを別経路で実施）
 *
 * 入力（JSON）：
 *   {
 *     keypair: {
 *       publicKey: string;          // Base64 SPKI
 *       encryptedPrivateKey: string;// AES-GCM 包装済み
 *       iv: string;
 *       salt: string;
 *     }
 *   }
 *
 * 動作：
 *   1. ログイン確認（連携者）
 *   2. トークンで招待を取得
 *   3. メール一致確認
 *   4. acceptInvitation で family_links を active 化
 *   5. 連携者の鍵ペアを digital_recipient_keys に保存（既存があれば update）
 *   6. オーナーの Stripe quantity を同期（need_checkout なら URL を返す）
 *
 * 戻り値：
 *   { ok: true, link, billing: { status: 'updated' | 'no_op' | 'canceled' } }
 *   { ok: true, link, billing: { status: 'need_checkout', checkout_url } }   ← オーナーが先にカード登録要
 *   { ok: false, error, detail? }
 */

import { NextResponse } from 'next/server';
import { createDigitalServerClient } from '@/lib/supabase/digitalServer';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { acceptInvitation } from '@/lib/digital/family';
import { syncSubscriptionQuantity } from '@/lib/digital/familyBilling';
import { sendOwnerLinkAcceptedEmail } from '@/lib/email/ownerPaymentReminder';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Keypair = {
  publicKey: string;
  encryptedPrivateKey: string;
  iv: string;
  salt: string;
};

function isKeypair(v: unknown): v is Keypair {
  if (typeof v !== 'object' || v === null) return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.publicKey === 'string' &&
    typeof o.encryptedPrivateKey === 'string' &&
    typeof o.iv === 'string' &&
    typeof o.salt === 'string'
  );
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    // ① 連携者の認証
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

    // ② 入力パース
    const body = (await req.json().catch(() => ({}))) as {
      keypair?: unknown;
    };
    if (!isKeypair(body.keypair)) {
      return NextResponse.json(
        {
          ok: false,
          error: 'invalid_keypair',
          detail:
            '鍵ペア（公開鍵・暗号化された秘密鍵・iv・salt）が必要です。承認画面でパスフレーズを設定すると自動生成されます。',
        },
        { status: 400 }
      );
    }
    const kp = body.keypair;

    // ③ 招待承認（service_role 経由）
    const admin = createAdminSupabaseClient();
    const acceptRes = await acceptInvitation(admin, {
      token,
      recipientUserId: user.id,
      recipientEmail: user.email,
    });

    if (!acceptRes.ok) {
      const statusByError: Record<string, number> = {
        not_found: 404,
        expired: 410,
        revoked: 410,
        already_accepted: 409,
        email_mismatch: 403,
        self_invite: 400,
        unexpected: 500,
      };
      return NextResponse.json(
        { ok: false, error: acceptRes.error, detail: acceptRes.detail },
        { status: statusByError[acceptRes.error] ?? 500 }
      );
    }

    // ④ 連携者の鍵ペアを保存（既存があれば update）
    const { error: keyErr } = await admin
      .from('digital_recipient_keys')
      .upsert(
        {
          user_id: user.id,
          public_key: kp.publicKey,
          encrypted_private_key: kp.encryptedPrivateKey,
          iv: kp.iv,
          salt: kp.salt,
          algorithm_version: 'v1',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      );

    if (keyErr) {
      console.error(
        '[accept POST] recipient key save failed (continuing)',
        keyErr
      );
      // 鍵ペア保存に失敗しても、family_link は作成済みなのでロールバックは行わない。
      // クライアント側に通知して再保存を促す。
      return NextResponse.json(
        {
          ok: false,
          error: 'recipient_key_save_failed',
          detail: keyErr.message,
        },
        { status: 500 }
      );
    }

    // ⑤ オーナーの email を取得（Stripe quantity 同期に必要）
    const { data: ownerUserRow } = await admin
      .from('auth.users' as never)
      .select('email')
      .eq('id', acceptRes.ownerUserId)
      .maybeSingle();
    let ownerEmail: string = '';
    if (ownerUserRow && typeof (ownerUserRow as { email?: unknown }).email === 'string') {
      ownerEmail = (ownerUserRow as { email: string }).email;
    } else {
      // auth.users への直アクセスが SDK 経由で困難な場合は、admin.auth.admin.getUserById を使う
      try {
        const { data: u } = await admin.auth.admin.getUserById(
          acceptRes.ownerUserId
        );
        ownerEmail = u?.user?.email ?? '';
      } catch {
        ownerEmail = '';
      }
    }

    // ⑥ Stripe quantity 同期
    const syncRes = await syncSubscriptionQuantity(
      admin,
      acceptRes.ownerUserId,
      ownerEmail
    );

    if (!syncRes.ok && syncRes.status === 'need_checkout') {
      // オーナーがまだサブスクを持っていないので、オーナーが Checkout を完了する必要がある。
      // 連携者側はここで止まらず承認は完了させる。オーナーへはカード登録を促すメールを送る。
      // メール送信は best-effort：失敗しても承認フローは止めない。
      if (ownerEmail) {
        const appUrl = (
          process.env.NEXT_PUBLIC_APP_URL ?? 'https://tsuginotenavi.jp'
        ).replace(/\/+$/, '');
        try {
          const mailRes = await sendOwnerLinkAcceptedEmail({
            ownerEmail,
            recipientName: acceptRes.link.recipient_name ?? null,
            manageUrl: `${appUrl}/digital/settings/plan`,
          });
          if (!mailRes.ok) {
            console.warn(
              '[accept POST] owner payment reminder email not sent',
              mailRes.error
            );
          }
        } catch (mailErr) {
          console.warn(
            '[accept POST] owner payment reminder email threw',
            mailErr
          );
        }
      } else {
        console.warn(
          '[accept POST] ownerEmail missing; skip payment reminder email'
        );
      }

      return NextResponse.json({
        ok: true,
        link: acceptRes.link,
        billing: {
          status: 'need_checkout',
          checkout_url: syncRes.checkoutUrl,
          target_quantity: syncRes.targetQuantity,
        },
        notice:
          'オーナーがクレジットカード登録を完了するまで連携は完全に有効になりません。オーナーにご連絡ください。',
      });
    }

    if (!syncRes.ok) {
      console.error(
        '[accept POST] billing sync failed but accept succeeded',
        syncRes
      );
      return NextResponse.json({
        ok: true,
        link: acceptRes.link,
        billing: { status: 'error', detail: syncRes.detail },
        notice:
          '連携は記録されましたが、課金処理で問題が発生しました。サポートまでご連絡ください。',
      });
    }

    return NextResponse.json({
      ok: true,
      link: acceptRes.link,
      billing: {
        status: syncRes.status,
        current_quantity:
          'currentQuantity' in syncRes
            ? syncRes.currentQuantity
            : syncRes.previousQuantity ?? null,
        target_quantity:
          'targetQuantity' in syncRes ? syncRes.targetQuantity : null,
      },
    });
  } catch (err) {
    const detail = err instanceof Error ? err.message : 'unexpected_error';
    console.error('[accept POST] failed', detail);
    return NextResponse.json(
      { ok: false, error: 'unexpected', detail },
      { status: 500 }
    );
  }
}

/**
 * GET /api/digital/family/invitations/[token]/accept
 *
 * 承認画面で「招待先メール」を確認するための情報を返す（ログイン前に呼ばれる場合あり）。
 * トークンが有効なら、安全に表示してよい情報（owner_display_name / recipient_email / expires_at）を返す。
 *
 * セキュリティ：トークンを知っている人にしか返さない情報のみ返す。
 *              owner_user_id 等の内部 ID は返さない。
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const admin = createAdminSupabaseClient();
    const { data: inv, error } = await admin
      .from('digital_family_invitations')
      .select(
        'recipient_email, recipient_name, expires_at, accepted_at, revoked_at, owner_user_id'
      )
      .eq('token', token)
      .maybeSingle();

    if (error || !inv) {
      return NextResponse.json(
        { ok: false, error: 'not_found' },
        { status: 404 }
      );
    }

    if (inv.revoked_at) {
      return NextResponse.json(
        { ok: false, error: 'revoked' },
        { status: 410 }
      );
    }
    if (new Date(inv.expires_at).getTime() <= Date.now()) {
      return NextResponse.json(
        { ok: false, error: 'expired' },
        { status: 410 }
      );
    }
    if (inv.accepted_at) {
      return NextResponse.json(
        { ok: false, error: 'already_accepted' },
        { status: 409 }
      );
    }

    // オーナーの display_name を取得（admin 経由）
    let ownerDisplayName: string | null = null;
    try {
      const { data: profile } = await admin
        .from('digital_user_profiles')
        .select('display_name, preferred_name')
        .eq('user_id', inv.owner_user_id)
        .maybeSingle();
      ownerDisplayName =
        (profile?.display_name as string | null) ??
        (profile?.preferred_name as string | null) ??
        null;
    } catch {
      ownerDisplayName = null;
    }

    return NextResponse.json({
      ok: true,
      invitation: {
        recipient_email: inv.recipient_email,
        recipient_name: inv.recipient_name,
        expires_at: inv.expires_at,
        owner_display_name: ownerDisplayName,
      },
    });
  } catch (err) {
    const detail = err instanceof Error ? err.message : 'unexpected_error';
    return NextResponse.json(
      { ok: false, error: 'unexpected', detail },
      { status: 500 }
    );
  }
}
