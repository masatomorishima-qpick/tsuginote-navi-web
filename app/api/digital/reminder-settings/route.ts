/**
 * GET  /api/digital/reminder-settings — 本人のリマインド設定を取得
 * PUT  /api/digital/reminder-settings — リマインド設定を更新
 *
 * すべて本人セッションが必要（middleware では `/api` は保護していないので、
 * ここで auth.getUser() を確認）。
 */

import { NextRequest, NextResponse } from 'next/server';
import { createDigitalServerClient } from '@/lib/supabase/digitalServer';
import {
  getOrInitReminderSettings,
  updateReminderSettings,
} from '@/lib/digital/reminders';
import { recordAuditLog } from '@/lib/digital/audit';
import {
  REMINDER_INTERVAL_DAYS,
  type ReminderIntervalDays,
} from '@/types/digital';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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

    const setting = await getOrInitReminderSettings(supabase, user.id);
    return NextResponse.json({ ok: true, setting });
  } catch (err) {
    console.error('[api/digital/reminder-settings] GET failed', err);
    return NextResponse.json(
      { ok: false, error: 'server_error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
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

    let body: { reminder_enabled?: unknown; reminder_interval?: unknown };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { ok: false, error: 'invalid_json' },
        { status: 400 }
      );
    }

    // reminder_enabled バリデーション
    if (typeof body.reminder_enabled !== 'boolean') {
      return NextResponse.json(
        {
          ok: false,
          error: 'validation_failed',
          detail: 'reminder_enabled は true / false で指定してください。',
        },
        { status: 400 }
      );
    }

    // reminder_interval バリデーション
    const interval = Number(body.reminder_interval);
    if (
      !Number.isInteger(interval) ||
      !(REMINDER_INTERVAL_DAYS as readonly number[]).includes(interval)
    ) {
      return NextResponse.json(
        {
          ok: false,
          error: 'validation_failed',
          detail: `reminder_interval は ${REMINDER_INTERVAL_DAYS.join(' / ')} のいずれかを指定してください。`,
        },
        { status: 400 }
      );
    }

    const setting = await updateReminderSettings(supabase, user.id, {
      reminder_enabled: body.reminder_enabled,
      reminder_interval: interval as ReminderIntervalDays,
    });

    await recordAuditLog(supabase, user.id, {
      action: 'reminder_settings_update',
      resource_id: setting.id,
      metadata: {
        reminder_enabled: setting.reminder_enabled,
        reminder_interval: setting.reminder_interval,
      },
    });

    return NextResponse.json({ ok: true, setting });
  } catch (err) {
    console.error('[api/digital/reminder-settings] PUT failed', err);
    return NextResponse.json(
      { ok: false, error: 'server_error' },
      { status: 500 }
    );
  }
}
