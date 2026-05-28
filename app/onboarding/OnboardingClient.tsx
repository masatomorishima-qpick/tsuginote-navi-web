'use client';

/**
 * OnboardingClient
 *
 * 初回オンボーディング画面のクライアント側ラッパー。
 * OnboardingFlow を表示し、完了（またはスキップ）時に
 * digital_user_profiles.onboarding_completed_at を記録して /digital へ遷移する。
 *
 * 注記：完了記録は lib/digital/profile.ts の completeOnboarding と同じ処理だが、
 *       profile.ts は 'server-only' のためクライアントから import できない。
 *       そのため、ここでは同等の upsert をブラウザ用 Supabase クライアントで直接実行する。
 *       （update ではなく upsert なのは、プロフィール行が未作成の新規ユーザーでも
 *         確実に記録できるようにするため）
 */

import { useRouter } from 'next/navigation';
import OnboardingFlow from '@/components/onboarding/OnboardingFlow';
import { createDigitalBrowserClient } from '@/lib/supabase/digitalBrowser';

export default function OnboardingClient({
  userId,
}: {
  userId: string;
}) {
  const router = useRouter();
  const supabase = createDigitalBrowserClient();

  const handleComplete = async () => {
    try {
      const { error } = await supabase
        .from('digital_user_profiles')
        .upsert(
          {
            user_id: userId,
            onboarding_completed_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        );
      if (error) {
        console.error('onboarding upsert error:', error);
      }
    } catch (e) {
      console.error('onboarding complete error:', e);
    } finally {
      router.push('/digital');
    }
  };

  return <OnboardingFlow onComplete={handleComplete} />;
}
