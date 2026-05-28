/**
 * GET  /api/digital/devices  — 自分のデバイス一覧（PIN 登録有無つき）
 * POST /api/digital/devices  — デバイスを新規作成
 */

import { NextRequest, NextResponse } from 'next/server';
import { createDigitalServerClient } from '@/lib/supabase/digitalServer';
import { listDevicesWithPinFlag, createDevice } from '@/lib/digital/devices';
import {
  validateDeviceInput,
  containsForbiddenDeviceField,
} from '@/lib/digital/deviceValidation';
import { recordAuditLog } from '@/lib/digital/audit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = await createDigitalServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
    }

    const devices = await listDevicesWithPinFlag(supabase, user.id);
    return NextResponse.json({ ok: true, devices });
  } catch (err) {
    console.error('[api/digital/devices] GET failed', err);
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
      return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
    }

    // PIN や機密情報が混入していないかの二重チェック
    const forbidden = containsForbiddenDeviceField(body);
    if (forbidden) {
      return NextResponse.json(
        {
          ok: false,
          error: 'forbidden_field',
          detail: `このフォームでは ${forbidden} を保存できません。PIN は別画面から登録してください。`,
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

    const device = await createDevice(supabase, user.id, validation.value);

    await recordAuditLog(supabase, user.id, {
      action: 'device_create',
      resource_id: device.id,
      user_agent: request.headers.get('user-agent'),
      metadata: {
        device_name: device.device_name,
        disposal_status: device.disposal_status,
      },
    });

    return NextResponse.json({ ok: true, device }, { status: 201 });
  } catch (err) {
    console.error('[api/digital/devices] POST failed', err);
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: 500 });
  }
}
