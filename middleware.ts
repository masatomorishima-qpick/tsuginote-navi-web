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

  // --- 中カテゴリ /loan/karikae の廃止（2026-07-29）---
  // 記事と中カテゴリが同じ粒度で並ぶ構造をやめ、/loan を唯一のハブにした。
  // 記事URL（/loan/karikae/hiyou など）は変更していないので、ここでは
  // 「/loan/karikae ちょうど」だけを 301 で /loan に寄せる。
  // ※ matcher に '/loan/karikae' のみを登録しているため、配下の記事は素通りする。
  // ※ Supabase の処理に入る前に返すので、既存の認証まわりには一切影響しない。
  if (pathname === '/loan/karikae') {
    const hubUrl = request.nextUrl.clone();
    hubUrl.pathname = '/loan';
    return NextResponse.redirect(hubUrl, 301);
  }

  /* --- TOP（"/"）のリダイレクトは 2026-07-29 に廃止 ---
   *
   * 経緯：2026-07-15 のピボットで TOP を /shisan に移管し、"/" は
   *   ・auth Cookie あり → /digital
   *   ・それ以外        → /shisan（307）
   * にリダイレクトしていた。その結果、サイトの顔が「老後資金の診断ツール」になり、
   * 主軸である /loan にトップから辿れない状態が続いていた。
   *
   * "/" を実体のあるトップページ（app/page.tsx）にしたので、両方の分岐を削除した。
   *   ・/digital の会員はゼロのため、Cookie による振り分けは不要。
   *     /digital へは直接URLでアクセスできる状態を維持している。
   *   ・/shisan は独立したページのまま（canonical は自己参照）。
   *     トップは入口、/shisan はツール、という役割分担にしている。
   *
   * これに伴い、"/" に集約していた旧URL（相続・実家片付け）は
   * next.config.ts で /guide/ihinseiri に転送先を変更した（二段転送も解消）。
   */

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
    // 2026-07-29：'/' を除外した。TOP のリダイレクトを廃止したため middleware で
    // 行う処理がなくなり、残したままだと毎回 Supabase の getUser() が走って
    // トップの初期表示が遅くなる（広告流入はほぼ未ログインで、その通信は無駄）。
    // 中カテゴリ廃止に伴う 301（配下の記事 /loan/karikae/* は含まないので素通りする）
    '/loan/karikae',
    '/digital/:path*',
    '/login',
    '/auth/callback',
  ],
};
