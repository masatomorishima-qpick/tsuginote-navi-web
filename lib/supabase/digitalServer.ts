/**
 * デジタル資産機能専用：サーバーサイド Supabase クライアント（Cookie対応）
 *
 * Server Component や Route Handler でログインセッションを読み取る／更新する
 * 場合に使用します。Next.js 16 系の cookies() は Promise を返すため await が必要です。
 *
 * 使用例：
 *   import { createDigitalServerClient } from '@/lib/supabase/digitalServer';
 *   const supabase = await createDigitalServerClient();
 *   const { data: { user } } = await supabase.auth.getUser();
 */

import { cache } from 'react';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export async function createDigitalServerClient() {
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

  const cookieStore = await cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Component から呼ばれた場合は set が無視されます。
          // middleware.ts でセッションを更新しているので問題ありません。
        }
      },
    },
  });
}

/**
 * 同一リクエスト内で Supabase クライアント生成＋ getUser() を 1 回に共有する
 * キャッシュ付きヘルパー。
 *
 * layout.tsx と page.tsx がそれぞれ getUser() を呼ぶと、1 画面の表示で
 * Supabase Auth サーバーへの問い合わせが複数回発生してしまう。
 * React の cache() でラップすることで、同じリクエストのレンダリング中は
 * 最初の 1 回だけ実行され、2 回目以降は結果を使い回す（リクエストを跨いだ
 * キャッシュはされないため、セキュリティ上の確認は毎リクエスト必ず行われる）。
 *
 * 使用例（Server Component 専用）：
 *   const { supabase, user } = await getDigitalSession();
 *   if (!user) redirect('/login');
 */
export const getDigitalSession = cache(async () => {
  const supabase = await createDigitalServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
});
