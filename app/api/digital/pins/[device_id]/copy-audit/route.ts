/**
 * POST /api/digital/pins/[device_id]/copy-audit
 *
 * 「復号済み PIN をクリップボードにコピーした」イベントを監査ログに残すだけの軽量エンドポイント。
 *
 * セキュリティ:
 *   - クライアント発信イベントなのでサーバーでは「step-up を通過していたか」を
 *     もう一度チェックする。step-up 期限切れの状態からの copy は受理しない。
 *   - PIN そのものは絶対に body に含めない。このエンドポイントは
 *     body を読まない（JSON パースすらしない）。
 */

import { NextRequest, NextResponse } from 'next/server';
import { createDigitalServerClient } from '@/lib/supabase/digitalServer';
import { getDeviceById } from '@/lib/digital/devices';
import { recordAuditLog } from '@/lib/digital/audit';
import { assertStepup } from '@/lib/digital/stepup';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ device_id: string }> };

export async function POST(request: NextRequest, ctx: Ctx) {
  try {
    const { device_id } = await ctx.params;
    const supabase = await createDigitalServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
    }

    const gate = await assertStepup(user.id);
    if (!gate.ok) {
      return NextResponse.json(
        { ok: false, error: 'stepup_required' },
        { status: 401 }
      );
    }

    const device = await getDeviceById(supabase, user.id, device_id);
    if (!device) {
      return NextResponse.json(
        { ok: false, error: 'device_not_found' },
        { status: 404 }
      );
    }

    await recordAuditLog(supabase, user.id, {
      action: 'pin_reveal_copy',
      resource_id: device_id,
      user_agent: request.headers.get('user-agent'),
      metadata: {
        device_name: device.device_name,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[api/digital/pins/:device_id/copy-audit] POST failed', err);
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: 500 });
  }
}
