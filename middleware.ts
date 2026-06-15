/**
 * Next.js Middleware：Supabase セッションの自動更新 + 保護ルートのガード
 *
 * - matcher で指定したパスにアクセスがあるたびに実行されます
 * - 既存の `/souzoku-houki` `/tokyo/*` 等には影響しない設定にしています
 * - `/digital/*` は未ログインなら `/login` へ自動リダイレクト
 * - `/auth/callback` は常に通す（ログインコールバックのため）
 *
 * 参考：@supabase/ssr の Next.js App Router 用パターンをベースに実装
 */

import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const { pathname } = request.nextUrl;

  // --- TOP（"/"）専用の軽量処理 ---
  // TOP は静的 LP（CDN キャッシュ対象）。ここで Supabase へ getUser 通信をすると
  // 広告流入（ほぼ未ログイン）の初期表示が遅くなるため、ネットワーク往復をせず
  // Cookie の有無だけで「ログイン済みらしさ」を判定する。
  //   - ログイン済みらしい（auth Cookie あり）→ /digital へ誘導
  //   - 未ログイン → そのまま静的 TOP を表示（getUser しない）
  // ※ Cookie が期限切れの稀なケースは /digital 側で再度ログインに弾かれるため安全。
  if (pathname === '/') {
    const hasAuthCookie = request.cookies
      .getAll()
      .some((c) => c.name.startsWith('sb-') && c.name.includes('auth-token'));
    if (hasAuthCookie) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = '/digital';
      return NextResponse.redirect(redirectUrl);
    }
    return response;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // 環境変数が未設定なら素通り（ビルド時エラーの回避）
  if (!url || !anonKey) {
    return response;
  }

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  // getUser() は Supabase Auth サーバーに問い合わせて検証するため安全
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // `/digital/*` は未ログインなら `/login` へ飛ばす
  if (pathname.startsWith('/digital') && !user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/login';
    redirectUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // ログイン済みユーザーが `/login` に来たら `/digital` に飛ばす
  if (pathname === '/login' && user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/digital';
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  /**
   * 以下のパスのみ middleware を実行します。
   * 既存の `/souzoku-houki` `/tokyo/*` `/souzoku-tetsuzuki` 等は完全に素通りします。
   */
  matcher: [
    '/',
    '/digital/:path*',
    '/login',
    '/auth/callback',
  ],
};
