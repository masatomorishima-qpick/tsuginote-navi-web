/**
 * 家族連携リンク（digital_family_links）の操作 API。
 *
 * PATCH /api/digital/family/links/[id]
 *   オーナーのみ操作可能：
 *     { share_during_lifetime: boolean }   生前共有 ON/OFF
 *
 * DELETE /api/digital/family/links/[id]
 *   オーナー / 連携相手 どちらからでも解除可能
 *   解除後に Stripe quantity を同期（0 になれば即時 cancel）
 */

import { NextResponse } from 'next/server';
import { createDigitalServerClient } from '@/lib/supabase/digitalServer';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import {
  revokeFamilyLink,
  setShareDuringLifetime,
} from '@/lib/digital/family';
import { syncSubscriptionQuantity } from '@/lib/digital/familyBilling';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// =============================================================================
// PATCH：生前共有 ON/OFF
// =============================================================================

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const body = (await req.json().catch(() => ({}))) as {
      share_during_lifetime?: unknown;
    };

    if (typeof body.share_during_lifetime !== 'boolean') {
      return NextResponse.json(
        {
          ok: false,
          error: 'invalid_payload',
          detail: 'share_during_lifetime には true/false を指定してください。',
        },
        { status: 400 }
      );
    }

    const result = await setShareDuringLifetime(
      supabase,
      user.id,
      id,
      body.share_during_lifetime
    );

    if (!result.ok) {
      const status =
        result.error === 'not_found'
          ? 404
          : result.error === 'forbidden'
            ? 403
            : 500;
      return NextResponse.json(
        { ok: false, error: result.error, detail: result.detail },
        { status }
      );
    }

    return NextResponse.json({ ok: true, link: result.link });
  } catch (err) {
    const detail = err instanceof Error ? err.message : 'unexpected_error';
    console.error('[links PATCH] failed', detail);
    return NextResponse.json(
      { ok: false, error: 'unexpected', detail },
      { status: 500 }
    );
  }
}

// =============================================================================
// DELETE：連携解除
// =============================================================================

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    // ① link を解除
    const result = await revokeFamilyLink(supabase, {
      linkId: id,
      byUserId: user.id,
    });

    if (!result.ok) {
      const status =
        result.error === 'not_found'
          ? 404
          : result.error === 'forbidden'
            ? 403
            : 500;
      return NextResponse.json(
        { ok: false, error: result.error, detail: result.detail },
        { status }
      );
    }

    // ② 連携者用の KEK 暗号文を削除（service_role 経由）
    const admin = createAdminSupabaseClient();
    try {
      await admin
        .from('digital_user_kek_envelopes')
        .delete()
        .eq('owner_user_id', result.link.owner_user_id)
        .eq('kind', 'recipient')
        .eq('recipient_user_id', result.link.recipient_user_id);
    } catch (err) {
      console.warn('[links DELETE] KEK envelope deletion failed (continuing)', err);
    }

    // ③ オーナーの email を取得して Stripe quantity 同期
    let ownerEmail = '';
    try {
      const { data: u } = await admin.auth.admin.getUserById(
        result.link.owner_user_id
      );
      ownerEmail = u?.user?.email ?? '';
    } catch {
      ownerEmail = '';
    }

    const syncRes = await syncSubscriptionQuantity(
      admin,
      result.link.owner_user_id,
      ownerEmail
    );

    return NextResponse.json({
      ok: true,
      link: result.link,
      billing: {
        status: syncRes.status,
      },
    });
  } catch (err) {
    const detail = err instanceof Error ? err.message : 'unexpected_error';
    console.error('[links DELETE] failed', detail);
    return NextResponse.json(
      { ok: false, error: 'unexpected', detail },
      { status: 500 }
    );
  }
}
