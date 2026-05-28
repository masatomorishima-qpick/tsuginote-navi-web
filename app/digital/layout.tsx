/**
 * /digital/* 専用レイアウト
 *
 * 既存の app/layout.tsx（共通レイアウト）はそのまま流用し、
 * その内側で「認証必須」「専用ヘッダー付き」のラッパーを追加します。
 *
 * middleware.ts 側でも未ログイン時は /login に飛ばしますが、
 * このレイアウトでも二重に getUser() チェックを行い確実性を高めています。
 */

import { redirect } from 'next/navigation';
import { createDigitalServerClient } from '@/lib/supabase/digitalServer';
import DigitalHeader from '@/components/digital/DigitalHeader';
import SiteFooter from '@/components/SiteFooter';

export default async function DigitalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createDigitalServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <DigitalHeader userEmail={user.email ?? null} />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
          {children}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
