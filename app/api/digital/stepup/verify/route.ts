/**
 * POST /api/digital/stepup/verify
 *
 * 6 桁 OTP を検証し、成功したら 5 分間有効な step-up Cookie を発行する。
 *
 * リクエスト形式:
 *   { purpose: StepupPurpose, code: string }
 *
 * 手順:
 *   1. 本人セッション必須（401）
 *   2. supabase.auth.verifyOtp({ email, token: code, type: 'email' }) を実行
 *      → 成功すると本人のセッションが refresh される（既に同一ユーザーなので問題なし）
 *   3. 成功時：HMAC 署名付き step-up トークンを発行し、httpOnly Cookie にセット
 *   4. digital_audit_logs に stepup_success / stepup_fail を記録
 *
 * レスポンス:
 *   成功: 200 { ok: true, expires_at: ISO8601 }
 *   失敗: 400 { ok: false, error: 'invalid_code' | 'invalid_purpose' | ... }
 */

import { NextRequest, NextResponse } from 'next/server';
import { createDigitalServerClient } from '@/lib/supabase/digitalServer';
import { recordAuditLog } from '@/lib/digital/audit';
import {
  issueStepupToken,
  stepupCookieOptions,
  isStepupEnabled,
  type StepupPurpose,
  STEPUP_MAX_AGE_SEC,
} from '@/lib/digital/stepup';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const VALID_PURPOSES: StepupPurpose[] = [
  'pin_reveal',
  'pin_update',
  'pin_delete',
  'device_delete_with_pin',
];

export async function POST(request: NextRequest) {
  try {
    // Phase 1: フィーチャーフラグ OFF の時はこのエンドポイント自体を無効化する。
    if (!isStepupEnabled()) {
      return NextResponse.json(
        {
          ok: false,
          error: 'stepup_disabled',
          detail: 'この操作は再認証なしで実施できます。画面を更新してもう一度お試しください。',
        },
        { status: 503 }
      );
    }

    const supabase = await createDigitalServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || !user.email) {
      return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
    }

    let body: { purpose?: unknown; code?: unknown };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
    }

    const purpose =
      typeof body.purpose === 'string' && (VALID_PURPOSES as string[]).includes(body.purpose)
        ? (body.purpose as StepupPurpose)
        : null;

    const code = typeof body.code === 'string' ? body.code.trim() : '';

    if (!purpose) {
      return NextResponse.json({ ok: false, error: 'invalid_purpose' }, { status: 400 });
    }
    if (!/^\d{6}$/.test(code)) {
      return NextResponse.json(
        {
          ok: false,
          error: 'invalid_code_format',
          detail: '6桁の数字を入力してください。',
        },
        { status: 400 }
      );
    }

    const userAgent = request.headers.get('user-agent');

    // OTP 検証。成功すると本人のセッションが refresh される。
    const { data, error } = await supabase.auth.verifyOtp({
      email: user.email,
      token: code,
      type: 'email',
    });

    if (error || !data?.user) {
      await recordAuditLog(supabase, user.id, {
        action: 'stepup_fail',
        user_agent: userAgent,
        metadata: {
          purpose,
          reason: error?.message ?? 'unknown',
          status: error?.status ?? null,
        },
      });

      return NextResponse.json(
        {
          ok: false,
          error: 'invalid_code',
          detail:
            'コードが正しくないか、有効期限が切れています。もう一度お試しください。',
        },
        { status: 400 }
      );
    }

    // 念のため：verifyOtp が別ユーザーの成功を返すことはあり得ないが、念を入れて検証
    if (data.user.id !== user.id) {
      console.error(
        '[api/digital/stepup/verify] verifyOtp returned different user',
        { expected: user.id, got: data.user.id }
      );
      return NextResponse.json(
        { ok: false, error: 'user_mismatch' },
        { status: 500 }
      );
    }

    // step-up トークン発行
    const token = issueStepupToken(user.id, purpose);
    const opts = stepupCookieOptions();

    const res = NextResponse.json({
      ok: true,
      expires_at: new Date(Date.now() + STEPUP_MAX_AGE_SEC * 1000).toISOString(),
    });
    res.cookies.set(opts.name, token, {
      httpOnly: opts.httpOnly,
      sameSite: opts.sameSite,
      secure: opts.secure,
      path: opts.path,
      maxAge: opts.maxAge,
    });

    await recordAuditLog(supabase, user.id, {
      action: 'stepup_success',
      user_agent: userAgent,
      metadata: { purpose },
    });

    return res;
  } catch (err) {
    console.error('[api/digital/stepup/verify] POST failed', err);
    return NextResponse.json(
      { ok: false, error: 'server_error' },
      { status: 500 }
    );
  }
}
