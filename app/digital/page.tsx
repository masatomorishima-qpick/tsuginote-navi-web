/**
 * /digital ダッシュボード
 *
 * データ取得（資産 / デバイス / サブスク / 連携先）はこのサーバーコンポーネントで行い、
 * 画面表示は components/digital/DashboardNew.tsx に委譲する。
 */

import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createDigitalServerClient } from '@/lib/supabase/digitalServer';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { listAssets } from '@/lib/digital/assets';
import { listDevicesWithPinFlag } from '@/lib/digital/devices';
import {
  listLinksByOwner,
  listLinksByRecipient,
  type DigitalFamilyLink,
} from '@/lib/digital/family';
import { getOwnSubscription } from '@/lib/digital/subscriptions';
import { effectivePlan, trialDaysLeft } from '@/lib/digital/subscriptionUtils';
import { getOnboardingStatus } from '@/lib/digital/profile';
import type {
  DigitalAsset,
  DigitalDeviceWithPinFlag,
  DigitalSubscription,
} from '@/types/digital';
import DashboardNew from '@/components/digital/DashboardNew';

export const metadata: Metadata = {
  title: 'ダッシュボード｜つぎの手ナビ デジタル資産',
  description:
    'あなたが登録したデジタルサービスの一覧と、亡くなったときの対応方針を整理できます。',
};

export default async function DigitalDashboardPage() {
  const supabase = await createDigitalServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?next=/digital');
  }

  // オンボーディング未完了なら /onboarding へ
  const { completed } = await getOnboardingStatus(supabase, user.id);
  if (!completed) {
    redirect('/onboarding');
  }

  let assets: DigitalAsset[] = [];
  try {
    assets = await listAssets(supabase, user.id);
  } catch (err) {
    console.error('[digital/page] listAssets failed', err);
  }

  // パスワード保管（デバイス）状況の取得
  let devices: DigitalDeviceWithPinFlag[] = [];
  try {
    devices = await listDevicesWithPinFlag(supabase, user.id);
  } catch (err) {
    console.error('[digital/page] listDevicesWithPinFlag failed', err);
  }

  // プラン状態
  let subscription: DigitalSubscription | null = null;
  try {
    subscription = await getOwnSubscription(supabase, user.id);
  } catch (err) {
    console.error('[digital/page] subscription check failed', err);
  }

  // subscription 取得の直後：プラン関連の派生値
  const plan = effectivePlan(subscription);
  const status = subscription?.status ?? 'free';
  const daysLeft = trialDaysLeft(subscription);

  // 自分が連携先（recipient）になっているリンクの取得
  type RecipientLinkInfo = {
    link: DigitalFamilyLink;
    ownerDisplayName: string | null;
    ownerEmail: string | null;
  };
  let recipientLinks: RecipientLinkInfo[] = [];
  try {
    const allRecipientLinks = await listLinksByRecipient(supabase, user.id);
    const activeOnes = allRecipientLinks.filter((l) => l.status === 'active');
    if (activeOnes.length > 0) {
      const admin = createAdminSupabaseClient();
      recipientLinks = await Promise.all(
        activeOnes.map(async (link) => {
          let ownerDisplayName: string | null = null;
          let ownerEmail: string | null = null;
          try {
            const { data: profile } = await admin
              .from('digital_user_profiles')
              .select('display_name, preferred_name')
              .eq('user_id', link.owner_user_id)
              .maybeSingle();
            ownerDisplayName =
              (profile?.display_name as string | null) ??
              (profile?.preferred_name as string | null) ??
              null;
            const { data: u } = await admin.auth.admin.getUserById(
              link.owner_user_id
            );
            ownerEmail = u?.user?.email ?? null;
          } catch (err) {
            console.warn('[digital/page] recipient link enrich failed', err);
          }
          return { link, ownerDisplayName, ownerEmail };
        })
      );
    }
  } catch (err) {
    console.error('[digital/page] listLinksByRecipient failed', err);
  }

  // 自分が owner として連携している家族リンクの取得（active のみ）
  let ownerLinks: DigitalFamilyLink[] = [];
  try {
    const allOwnerLinks = await listLinksByOwner(supabase, user.id);
    ownerLinks = allOwnerLinks.filter((l) => l.status === 'active');
  } catch (err) {
    console.error('[digital/page] listLinksByOwner failed', err);
  }

  return (
    <DashboardNew
      plan={plan}
      status={status}
      trialDaysLeft={daysLeft}
      assets={assets.map((a) => ({
        id: a.id,
        service_name: a.service_name,
        category: a.category,
        death_action: a.death_action,
      }))}
      devices={devices}
      subscription={subscription}
      recipientLinks={recipientLinks}
      ownerLinks={ownerLinks}
    />
  );
}
