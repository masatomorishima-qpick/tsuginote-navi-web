/**
 * GET    /api/digital/assets/[id]  — 1件取得
 * PATCH  /api/digital/assets/[id]  — 部分更新
 * DELETE /api/digital/assets/[id]  — 削除
 */

import { NextRequest, NextResponse } from 'next/server';
import { createDigitalServerClient } from '@/lib/supabase/digitalServer';
import { getAssetById, updateAsset, deleteAsset } from '@/lib/digital/assets';
import { validateAssetInput, containsForbiddenField } from '@/lib/digital/validation';
import { recordAuditLog } from '@/lib/digital/audit';

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const supabase = await createDigitalServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
    }

    const asset = await getAssetById(supabase, user.id, id);
    if (!asset) {
      return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 });
    }
    return NextResponse.json({ ok: true, asset });
  } catch (err) {
    console.error('[api/digital/assets/:id] GET failed', err);
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const supabase = await createDigitalServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
    }

    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
    }

    const forbidden = containsForbiddenField(body);
    if (forbidden) {
      return NextResponse.json(
        {
          ok: false,
          error: 'forbidden_field',
          detail: `機密情報は保存できません（${forbidden}）。`,
        },
        { status: 400 }
      );
    }

    const validation = validateAssetInput(body);
    if (!validation.ok) {
      return NextResponse.json(
        { ok: false, error: 'validation_failed', errors: validation.errors },
        { status: 400 }
      );
    }

    // 事前に存在確認（自分の行か？）
    const existing = await getAssetById(supabase, user.id, id);
    if (!existing) {
      return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 });
    }

    const updated = await updateAsset(supabase, user.id, id, validation.value);

    await recordAuditLog(supabase, user.id, {
      action: 'asset_update',
      resource_id: id,
      metadata: {
        service_name: updated.service_name,
        category: updated.category,
      },
    });

    return NextResponse.json({ ok: true, asset: updated });
  } catch (err) {
    console.error('[api/digital/assets/:id] PATCH failed', err);
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const supabase = await createDigitalServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
    }

    const existing = await getAssetById(supabase, user.id, id);
    if (!existing) {
      return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 });
    }

    await deleteAsset(supabase, user.id, id);

    await recordAuditLog(supabase, user.id, {
      action: 'asset_delete',
      resource_id: id,
      metadata: {
        service_name: existing.service_name,
        category: existing.category,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[api/digital/assets/:id] DELETE failed', err);
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: 500 });
  }
}
