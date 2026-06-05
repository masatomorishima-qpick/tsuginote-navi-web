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
 *
 * 2026-05 改訂：
 *   ブラウザの bfcache（back-forward cache）対策として、クライアント側でも
 *   オンボーディング完了状態を再チェックする。
 *   - 初回マウント時：完了済みなら /digital へ即遷移
 *   - pageshow イベント（bfcache 復元時）：再チェック実行
 *   これにより、サーバーサイドチェックをすり抜けるブラウザバック経由の重複登録を防ぐ。
 */

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import OnboardingFlow from '@/components/onboarding/OnboardingFlow';
import { createDigitalBrowserClient } from '@/lib/supabase/digitalBrowser';
import { sendGA4Event } from '@/lib/analytics/ga4';

export default function OnboardingClient({
  userId,
}: {
  userId: string;
}) {
  const router = useRouter();
  // Supabase クライアントは useMemo でメモ化（毎レンダーで新規生成されないようにする）
  const supabase = useMemo(() => createDigitalBrowserClient(), []);

  // bfcache 対策：
  //   1. このページを bfcache 対象外にする（unload リスナー追加で
  //      モダンブラウザがキャッシュから除外する仕様を利用）
  //      → ブラウザバック時にサーバーサイドの完了チェックが必ず走り、
  //        onboarding 画面が一瞬たりとも表示されなくなる。
  //   2. 念のためクライアント側でも完了状態を確認し、完了済みなら /digital へ遷移
  useEffect(() => {
    const checkAndRedirect = async () => {
      const { data } = await supabase
        .from('digital_user_profiles')
        .select('onboarding_completed_at')
        .eq('user_id', userId)
        .maybeSingle();
      if (data?.onboarding_completed_at) {
        router.replace('/digital');
      }
    };

    // 初回マウント時にも一応確認（サーバー側チェックの補強）
    void checkAndRedirect();

    // bfcache 無効化用のダミー unload リスナー
    const handleUnload = () => {
      // 何もしない（リスナーの存在自体が bfcache 対象外化のトリガー）
    };
    window.addEventListener('unload', handleUnload);

    // bfcache が有効な環境（古いブラウザ等）への保険：pageshow で再チェック
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        void checkAndRedirect();
      }
    };
    window.addEventListener('pageshow', handlePageShow);

    return () => {
      window.removeEventListener('unload', handleUnload);
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, [userId, router, supabase]);

  // Onboarding 完了処理。nextPath を指定すると、その URL に遷移する（未指定なら /digital）。
  // Step 3 の「次にできること」カードからは個別の遷移先を渡す。
  const handleComplete = async (nextPath?: string) => {
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
      // GA4：会員登録完了（キーイベント #33）。失敗してもフローは止めない
      sendGA4Event('digital_sign_up');
    } catch (e) {
      console.error('onboarding complete error:', e);
    } finally {
      router.push(nextPath ?? '/digital');
    }
  };

  return <OnboardingFlow onComplete={handleComplete} />;
}
