/**
 * POST /api/digital/stepup/start
 *
 * step-up 再認証のための 6 桁 OTP を本人のメールに送信する。
 *
 * リクエスト形式:
 *   { purpose: 'pin_reveal' | 'pin_update' | 'pin_delete' | 'device_delete_with_pin' }
 *
 * 手順:
 *   1. 本人セッション必須（401）
 *   2. Supabase の signInWithOtp で本人メールに OTP を発行（既存アカウントのみ）
 *   3. digital_audit_logs に stepup_start を記録
 *
 * 注意:
 *   - signInWithOtp はメール本文中の `{{ .Token }}` を使って 6 桁コードを表示する。
 *     Supabase Dashboard → Authentication → Email Templates の "Magic Link" を
 *     OTP 付きテンプレートに更新しておくこと（SETUP_GUIDE_Phase1PIN.md 参照）。
 *   - shouldCreateUser: false を付けてアカウント未作成ユーザーでの誤発行を防ぐ。
 *
 * 設計メモ（2026-04-26）:
 *   理想は auth.reauthenticate() + Reauthentication 専用テンプレを使い、ログイン用
 *   メールと完全分離することだが、Supabase JS の reauthenticate は updateUser({password,nonce})
 *   とセットでしか検証できない（nonce を verifyOtp で消費する API が無い）。
 *   よって Phase 1 では signInWithOtp を流用し、Magic link テンプレ内に 6 桁コードを
 *   併記する形で UX を妥協する。Phase 2 で独自 OTP テーブルを設けて分離予定。
 */

import { NextRequest, NextResponse } from 'next/server';
import { createDigitalServerClient } from '@/lib/supabase/digitalServer';
import { recordAuditLog } from '@/lib/digital/audit';
import { isStepupEnabled, type StepupPurpose } from '@/lib/digital/stepup';

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

    let body: { purpose?: unknown };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
    }

    const purpose =
      typeof body.purpose === 'string' && (VALID_PURPOSES as string[]).includes(body.purpose)
        ? (body.purpose as StepupPurpose)
        : null;

    if (!purpose) {
      return NextResponse.json(
        { ok: false, error: 'invalid_purpose' },
        { status: 400 }
      );
    }

    // OTP 発行（既存ユーザーのみ）。6 桁コードとマジックリンク両方が届く。
    const { error } = await supabase.auth.signInWithOtp({
      email: user.email,
      options: {
        shouldCreateUser: false,
      },
    });

    if (error) {
      // レート制限や一時的なメール送信失敗を含む。詳細はログにだけ出す。
      console.error('[api/digital/stepup/start] signInWithOtp failed', {
        message: error.message,
        status: error.status,
      });
      return NextResponse.json(
        {
          ok: false,
          error: 'otp_send_failed',
          detail:
            'ワンタイムコードの送信に失敗しました。時間を置いて再度お試しください。',
        },
        { status: 500 }
      );
    }

    const userAgent = request.headers.get('user-agent');

    // fire-and-forget で監査ログ
    await recordAuditLog(supabase, user.id, {
      action: 'stepup_start',
      user_agent: userAgent,
      metadata: { purpose },
    });

    return NextResponse.json({
      ok: true,
      sent_to: user.email,
    });
  } catch (err) {
    console.error('[api/digital/stepup/start] POST failed', err);
    return NextResponse.json(
      { ok: false, error: 'server_error' },
      { status: 500 }
    );
  }
}
