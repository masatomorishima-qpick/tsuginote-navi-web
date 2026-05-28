/**
 * DELETE /api/digital/family/invitations/[token]
 *
 * 未承認の招待を取り消す（オーナーのみ）。
 *
 * URL のセグメント名は accept と揃える必要があるため [token] を使う。
 * 内部では token で招待を引き当て、id を解決して revokeInvitation を呼ぶ。
 */

import { NextResponse } from 'next/server';
import { createDigitalServerClient } from '@/lib/supabase/digitalServer';
import { revokeInvitation } from '@/lib/digital/family';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
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

    // token から招待を引き当て（RLS：owner=user.id でフィルタされる）
    const { data: inv, error: findErr } = await supabase
      .from('digital_family_invitations')
      .select('id')
      .eq('token', token)
      .eq('owner_user_id', user.id)
      .maybeSingle();

    if (findErr) {
      return NextResponse.json(
        { ok: false, error: 'lookup_failed', detail: findErr.message },
        { status: 500 }
      );
    }
    if (!inv) {
      return NextResponse.json(
        { ok: false, error: 'not_found' },
        { status: 404 }
      );
    }

    const result = await revokeInvitation(supabase, user.id, inv.id as string);
    if (!result.ok) {
      return NextResponse.json(
        { ok: false, error: result.error, detail: result.detail },
        { status: 500 }
      );
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    const detail = err instanceof Error ? err.message : 'unexpected_error';
    return NextResponse.json(
      { ok: false, error: 'unexpected', detail },
      { status: 500 }
    );
  }
}
