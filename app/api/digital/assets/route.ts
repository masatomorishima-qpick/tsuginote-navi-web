/**
 * GET  /api/digital/assets       — 自分の資産一覧を取得
 * POST /api/digital/assets       — 資産を新規作成
 */

import { NextRequest, NextResponse } from 'next/server';
import { createDigitalServerClient } from '@/lib/supabase/digitalServer';
import { listAssets, createAsset } from '@/lib/digital/assets';
import { validateAssetInput, containsForbiddenField } from '@/lib/digital/validation';
import { recordAuditLog } from '@/lib/digital/audit';
import { getOwnSubscription, effectivePlan } from '@/lib/digital/subscriptions';
import { PLAN_LIMITS } from '@/types/digital';

export async function GET() {
  try {
    const supabase = await createDigitalServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
    }

    const assets = await listAssets(supabase, user.id);
    return NextResponse.json({ ok: true, assets });
  } catch (err) {
    console.error('[api/digital/assets] GET failed', err);
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
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
      return NextResponse.json(
        { ok: false, error: 'invalid_json' },
        { status: 400 }
      );
    }

    // 機密情報キーを二重チェック（クライアントが誤って送ってきてもガード）
    const forbidden = containsForbiddenField(body);
    if (forbidden) {
      return NextResponse.json(
        {
          ok: false,
          error: 'forbidden_field',
          detail: `機密情報は保存できません（${forbidden}）。パスワード管理アプリ等へ保管してください。`,
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

    // プラン上限チェック（2026-05 改訂：FREE/STANDARD 共に無制限。
    // 将来的に上限を入れる場合に備え、PLAN_LIMITS.maxAssets が有限なら制限する形は残す）
    const subscription = await getOwnSubscription(supabase, user.id);
    const plan = effectivePlan(subscription);
    const limit = PLAN_LIMITS[plan].maxAssets;

    if (Number.isFinite(limit)) {
      const existing = await listAssets(supabase, user.id);
      if (existing.length >= limit) {
        return NextResponse.json(
          {
            ok: false,
            error: 'plan_limit_reached',
            detail: `現在のプランでは ${limit} 件までご登録いただけます。`,
            limit,
            current: existing.length,
          },
          { status: 403 }
        );
      }
    }

    const asset = await createAsset(supabase, user.id, validation.value);

    // 監査ログ（失敗してもエラーにしない）
    await recordAuditLog(supabase, user.id, {
      action: 'asset_create',
      resource_id: asset.id,
      metadata: { service_name: asset.service_name, category: asset.category },
    });

    return NextResponse.json({ ok: true, asset }, { status: 201 });
  } catch (err) {
    console.error('[api/digital/assets] POST failed', err);
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: 500 });
  }
}
