/**
 * POST /api/digital/family/invitations
 *
 * 家族連携の招待を発行する。
 *
 * 入力（JSON）：
 *   {
 *     recipient_email: string;
 *     recipient_name: string;       // 「妻」「長男」など
 *     owner_display_name?: string;  // 初回のみ必須（profile.display_name が未設定の場合）
 *   }
 *
 * 動作：
 *   1. ログイン確認
 *   2. owner の display_name 確認・必要なら upsert
 *   3. createOrResendInvitation（新規 or 再送扱い）
 *   4. 招待メール送信
 *
 * 戻り値：
 *   { ok: true, invitation, is_resend, mail_status }
 *   { ok: false, error, detail? }
 *
 * 注：課金は承認時点で発生するため、この API は Stripe を呼ばない。
 */

import { NextResponse } from 'next/server';
import { createDigitalServerClient } from '@/lib/supabase/digitalServer';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import {
  createOrResendInvitation,
  listInvitationsByOwner,
  type DigitalFamilyInvitation,
} from '@/lib/digital/family';
import {
  getOwnProfile,
  upsertOwnProfile,
  profileHasDisplayName,
  DISPLAY_NAME_MAX,
} from '@/lib/digital/profile';
import { sendInvitationEmail } from '@/lib/email/invitation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function getAppUrl(): string {
  const url = process.env.NEXT_PUBLIC_APP_URL;
  if (!url) throw new Error('NEXT_PUBLIC_APP_URL is not set');
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

    // ② 入力パース
    const body = (await req.json().catch(() => ({}))) as {
      recipient_email?: unknown;
      recipient_name?: unknown;
      owner_display_name?: unknown;
    };

    // ③ プロファイル確認：display_name 未設定なら今回の入力で upsert する
    const existingProfile = await getOwnProfile(supabase, user.id);
    if (!profileHasDisplayName(existingProfile)) {
      const ownerName =
        typeof body.owner_display_name === 'string'
          ? body.owner_display_name.trim()
          : '';
      if (!ownerName) {
        return NextResponse.json(
          {
            ok: false,
            error: 'owner_display_name_required',
            detail:
              'はじめての招待では「あなたのお名前」のご入力が必須です。招待メールで大切な方に表示されます。',
          },
          { status: 400 }
        );
      }
      if (ownerName.length > DISPLAY_NAME_MAX) {
        return NextResponse.json(
          {
            ok: false,
            error: 'owner_display_name_too_long',
            detail: `お名前は ${DISPLAY_NAME_MAX} 文字以内でお願いします。`,
          },
          { status: 400 }
        );
      }
      const upsertRes = await upsertOwnProfile(supabase, user.id, {
        display_name: ownerName,
      });
      if (!upsertRes.ok) {
        return NextResponse.json(
          { ok: false, error: 'profile_save_failed', detail: upsertRes.detail },
          { status: 500 }
        );
      }
    }

    // 改めて最新の display_name を取得（upsert 後の値、または既存値）
    const profile =
      existingProfile && profileHasDisplayName(existingProfile)
        ? existingProfile
        : await getOwnProfile(supabase, user.id);
    const ownerDisplayName = profile?.display_name ?? '匿名のユーザー';

    // ④ 招待発行
    const createResult = await createOrResendInvitation(supabase, {
      ownerUserId: user.id,
      recipientEmail: body.recipient_email,
      recipientName: body.recipient_name,
    });

    if (!createResult.ok) {
      const statusByError: Record<string, number> = {
        invalid_email: 400,
        invalid_name: 400,
        pending_limit_reached: 409,
        links_limit_reached: 409,
        recipient_already_linked: 409,
        resend_cooldown: 429, // Too Many Requests
        unexpected: 500,
      };
      return NextResponse.json(
        {
          ok: false,
          error: createResult.error,
          detail: createResult.detail,
          // resend_cooldown 時のクライアント向けカウントダウン用
          retry_after_seconds:
            'retryAfterSeconds' in createResult
              ? createResult.retryAfterSeconds
              : undefined,
        },
        { status: statusByError[createResult.error] ?? 500 }
      );
    }

    // ⑤ 招待メール送信（失敗してもフロー全体は止めない）
    const acceptUrl = `${getAppUrl()}/digital/invitations/${createResult.invitation.token}`;
    const mailRes = await sendInvitationEmail({
      recipientEmail: createResult.invitation.recipient_email,
      recipientName: createResult.invitation.recipient_name,
      ownerDisplayName,
      ownerEmail: user.email ?? '',
      acceptUrl,
      expiresAt: new Date(createResult.invitation.expires_at),
    });

    // ⑥ 監査ログ（軽量、失敗はエラーにしない）
    try {
      const admin = createAdminSupabaseClient();
      await admin.from('digital_audit_logs').insert({
        user_id: user.id,
        action: createResult.isResend
          ? 'family_invite_resend'
          : 'family_invite_create',
        resource_id: createResult.invitation.id,
        metadata: {
          recipient_email: createResult.invitation.recipient_email,
          mail_sent: mailRes.ok,
          mail_error: !mailRes.ok ? mailRes.error : null,
        },
      });
    } catch (err) {
      console.warn('[invitations POST] audit log skipped', err);
    }

    return NextResponse.json({
      ok: true,
      invitation: createResult.invitation,
      is_resend: createResult.isResend,
      mail_status: mailRes.ok ? 'sent' : mailRes.error,
      // メール送信失敗時に手動でコピーできるよう URL も返す（オーナー本人にしか見えない）
      accept_url: acceptUrl,
    });
  } catch (err) {
    const detail = err instanceof Error ? err.message : 'unexpected_error';
    console.error('[api/digital/family/invitations POST] failed', detail);
    return NextResponse.json(
      { ok: false, error: 'unexpected', detail },
      { status: 500 }
    );
  }
}

/**
 * GET /api/digital/family/invitations
 * オーナーが自分の招待一覧を取得する。
 */
export async function GET() {
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

    const invitations: DigitalFamilyInvitation[] = await listInvitationsByOwner(
      supabase,
      user.id
    );
    return NextResponse.json({ ok: true, invitations });
  } catch (err) {
    const detail = err instanceof Error ? err.message : 'unexpected_error';
    return NextResponse.json(
      { ok: false, error: 'unexpected', detail },
      { status: 500 }
    );
  }
}
