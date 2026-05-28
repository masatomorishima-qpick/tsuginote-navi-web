/**
 * デジタル資産機能専用：ブラウザ側 Supabase クライアント（Cookie対応）
 *
 * 既存の client.ts は Cookie を扱わない素のクライアントのため、
 * ログインセッションの永続化には対応していません。
 * こちらは @supabase/ssr を使って Cookie 経由でセッションを保持します。
 *
 * 使用例：
 *   'use client';
 *   import { createDigitalBrowserClient } from '@/lib/supabase/digitalBrowser';
 *   const supabase = createDigitalBrowserClient();
 */

import { createBrowserClient } from '@supabase/ssr';

export function createDigitalBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL が未設定です。');
  }

  if (!anonKey) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY または NEXT_PUBLIC_SUPABASE_ANON_KEY が未設定です。'
    );
  }

  return createBrowserClient(url, anonKey);
}
