/**
 * /onboarding — 新規ユーザーの初回オンボーディング
 *
 * 2026-05 改訂：
 *   既にオンボーディング完了済みのユーザーがブラウザバック等でアクセスした場合、
 *   /digital へリダイレクトする。これにより重複登録（資産・デバイスの再登録）を防ぐ。
 */

import { createDigitalServerClient } from '@/lib/supabase/digitalServer';
import { redirect } from 'next/navigation';
import OnboardingClient from './OnboardingClient';

export const dynamic = 'force-dynamic';

export default async function OnboardingPage() {
  const supabase = await createDigitalServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login?next=/onboarding');
  }

  // 既にオンボーディング完了済みなら /digital へリダイレクト。
  // ブラウザバックや URL 直打ちで再度オンボーディングを開始させない。
  const { data: profile } = await supabase
    .from('digital_user_profiles')
    .select('onboarding_completed_at')
    .eq('user_id', user.id)
    .maybeSingle();

  if (profile?.onboarding_completed_at) {
    redirect('/digital');
  }

  return <OnboardingClient userId={user.id} />;
}
