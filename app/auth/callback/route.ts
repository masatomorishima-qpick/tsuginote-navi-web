/**
 * OAuth / Magic Link 認証コールバック
 *
 * Google OAuth とメールリンクの両方の戻り先として使われます。
 *  - Google OAuth は ?code=xxx のクエリで戻ってきます
 *  - Magic Link メールのリンクも同じく ?code=xxx のクエリで戻ってきます
 *
 * ここでコードをセッションに交換し、`/digital`（または ?next= 指定先）へ遷移させます。
 */

import { NextResponse, type NextRequest } from 'next/server';
import { createDigitalServerClient } from '@/lib/supabase/digitalServer';
import { touchLastLogin } from '@/lib/digital/reminders';
import { recordAuditLog } from '@/lib/digital/audit';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/digital';

  // `next` は内部パスのみ許可（オープンリダイレクト対策）
  const safeNext = next.startsWith('/') && !next.startsWith('//') ? next : '/digital';

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`);
  }

  try {
    const supabase = await createDigitalServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('[auth/callback] exchange failed', {
        message: error.message,
        status: error.status,
      });
      return NextResponse.redirect(`${origin}/login?error=exchange_failed`);
    }

    // ログイン成功時：最終ログイン日を更新 + 監査ログ（失敗してもリダイレクトは止めない）
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const userAgent = request.headers.get('user-agent');
        await touchLastLogin(supabase, user.id);
        await recordAuditLog(supabase, user.id, {
          action: 'login',
          user_agent: userAgent,
        });
      }
    } catch (err) {
      console.error('[auth/callback] post-login hooks failed', err);
    }

    return NextResponse.redirect(`${origin}${safeNext}`);
  } catch (err) {
    console.error('[auth/callback] unexpected error', err);
    return NextResponse.redirect(`${origin}/login?error=unexpected`);
  }
}
