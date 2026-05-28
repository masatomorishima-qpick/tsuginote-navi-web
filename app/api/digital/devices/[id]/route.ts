/**
 * GET    /api/digital/devices/[id]  — 1件取得
 * PATCH  /api/digital/devices/[id]  — 部分更新
 * DELETE /api/digital/devices/[id]  — 削除（論理削除）
 *
 * DELETE の挙動：
 *   - PIN が登録されていないデバイスは step-up 不要で論理削除できる。
 *   - PIN が登録されているデバイスは step-up Cookie
 *     （purpose = 'device_delete_with_pin' で発行されたもの）が必須。
 *     step-up OK の場合は PIN（digital_pin_secrets）を物理削除してから
 *     デバイスを論理削除する。
 *
 *   ※ PIN 付きデバイスの削除は「セキュリティに影響する操作」のため
 *     監査ログに `pin_secret_deleted: true` を残す。
 */

import { NextRequest, NextResponse } from 'next/server';
import { createDigitalServerClient } from '@/lib/supabase/digitalServer';
import {
  getDeviceById,
  updateDevice,
  softDeleteDevice,
  deviceHasPin,
  deletePinByDeviceId,
} from '@/lib/digital/devices';
import {
  validateDeviceInput,
  containsForbiddenDeviceField,
} from '@/lib/digital/deviceValidation';
import { recordAuditLog } from '@/lib/digital/audit';
import {
  assertStepup,
  clearStepupCookieOptions,
  isStepupEnabled,
} from '@/lib/digital/stepup';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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

    const device = await getDeviceById(supabase, user.id, id);
    if (!device) {
      return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 });
    }
    return NextResponse.json({ ok: true, device });
  } catch (err) {
    console.error('[api/digital/devices/:id] GET failed', err);
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

    const forbidden = containsForbiddenDeviceField(body);
    if (forbidden) {
      return NextResponse.json(
        {
          ok: false,
          error: 'forbidden_field',
          detail: `このフォームでは ${forbidden} を保存できません。`,
        },
        { status: 400 }
      );
    }

    const validation = validateDeviceInput(body);
    if (!validation.ok) {
      return NextResponse.json(
        { ok: false, error: 'validation_failed', errors: validation.errors },
        { status: 400 }
      );
    }

    const existing = await getDeviceById(supabase, user.id, id);
    if (!existing) {
      return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 });
    }

    const updated = await updateDevice(supabase, user.id, id, validation.value);

    await recordAuditLog(supabase, user.id, {
      action: 'device_update',
      resource_id: id,
      user_agent: request.headers.get('user-agent'),
      metadata: {
        device_name: updated.device_name,
        disposal_status: updated.disposal_status,
      },
    });

    return NextResponse.json({ ok: true, device: updated });
  } catch (err) {
    console.error('[api/digital/devices/:id] PATCH failed', err);
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const supabase = await createDigitalServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
    }

    const existing = await getDeviceById(supabase, user.id, id);
    if (!existing) {
      return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 });
    }

    const userAgent = request.headers.get('user-agent');
    const hasPin = await deviceHasPin(supabase, user.id, id);

    // PIN 付きの場合は step-up 必須
    if (hasPin) {
      const gate = await assertStepup(user.id);
      if (!gate.ok) {
        return NextResponse.json(
          {
            ok: false,
            error: 'stepup_required',
            stepup_purpose: 'device_delete_with_pin',
            detail:
              'このデバイスには PIN が登録されています。再認証のうえ、PIN とあわせて削除します。',
          },
          { status: 401 }
        );
      }

      // step-up OK：PIN を物理削除 → デバイス論理削除
      await deletePinByDeviceId(supabase, user.id, id);
      await softDeleteDevice(supabase, user.id, id);

      await recordAuditLog(supabase, user.id, {
        action: 'device_delete',
        resource_id: id,
        user_agent: userAgent,
        metadata: {
          device_name: existing.device_name,
          pin_secret_deleted: true,
          // step-up が実際に通過したか（フラグ OFF 時は false）
          stepup: isStepupEnabled(),
        },
      });
      // PIN 削除のイベントも別途残す（監査ログ検索のしやすさ）
      await recordAuditLog(supabase, user.id, {
        action: 'pin_delete',
        resource_id: id,
        user_agent: userAgent,
        metadata: {
          reason: 'device_delete_with_pin',
          device_name: existing.device_name,
        },
      });

      // 一度使った step-up Cookie は即時無効化（使い回し防止）
      const clear = clearStepupCookieOptions();
      const res = NextResponse.json({ ok: true, deleted_with_pin: true });
      res.cookies.set(clear.name, '', {
        httpOnly: clear.httpOnly,
        sameSite: clear.sameSite,
        secure: clear.secure,
        path: clear.path,
        maxAge: clear.maxAge,
      });
      return res;
    }

    // PIN なし：そのまま論理削除
    await softDeleteDevice(supabase, user.id, id);
    await recordAuditLog(supabase, user.id, {
      action: 'device_delete',
      resource_id: id,
      user_agent: userAgent,
      metadata: {
        device_name: existing.device_name,
        pin_secret_deleted: false,
      },
    });

    return NextResponse.json({ ok: true, deleted_with_pin: false });
  } catch (err) {
    console.error('[api/digital/devices/:id] DELETE failed', err);
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: 500 });
  }
}
