/**
 * GET /api/digital/service-masters  — クイック選択用のサービスマスタ一覧
 */

import { NextResponse } from 'next/server';
import { createDigitalServerClient } from '@/lib/supabase/digitalServer';
import { listServiceMasters } from '@/lib/digital/serviceMasters';

export async function GET() {
  try {
    const supabase = await createDigitalServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
    }

    const masters = await listServiceMasters(supabase);
    return NextResponse.json({ ok: true, masters });
  } catch (err) {
    console.error('[api/digital/service-masters] GET failed', err);
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: 500 });
  }
}
