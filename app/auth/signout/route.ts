/**
 * ログアウト用 Route Handler（サーバー側でセッション破棄）
 *
 * DigitalHeader のボタンからはクライアント側で signOut() しますが、
 * フォーム POST でも使える形で用意しておくと、CookieをSetしたリダイレクトが
 * 確実に効くのでフォールバックとして残します。
 */

import { NextResponse, type NextRequest } from 'next/server';
import { createDigitalServerClient } from '@/lib/supabase/digitalServer';

export async function POST(request: NextRequest) {
  const supabase = await createDigitalServerClient();
  await supabase.auth.signOut();

  const { origin } = new URL(request.url);
  return NextResponse.redirect(`${origin}/login`, { status: 303 });
}
