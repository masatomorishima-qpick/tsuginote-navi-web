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
  getRecipientNameByOwner,
  listLinksByOwner,
  listLinksByRecipient,
  type DigitalFamilyLink,
} from '@/lib/digital/family';
import { getOwnSubscription } from '@/lib/digital/subscriptions';
import { effectivePlan, trialDaysLeft } from '@/lib/digital/subscriptionUtils';
import {
  getOnboardingStatus,
  getDisplayNameById,
} from '@/lib/digital/profile';
import { NOTIFIER_SELF_CANCEL_MARKER } from '@/lib/digital/deathNotice';
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
  //
  // 加えて、各 owner について最新の死亡通知（pending / awaiting / rejected /
  // disclosed）を取得し、recipient のダッシュボード上で進捗・結果を見せる。
  // これがないと recipient は「通知が受理されたのか」「却下されたのか」を
  // メール以外で確認する術がない。
  type RecipientLinkInfo = {
    link: DigitalFamilyLink;
    ownerDisplayName: string | null;
    ownerEmail: string | null;
    /**
     * 当該 owner についての最新の死亡通知の状態。
     * 該当する通知が無い場合は null。
     * status は表示制御に使うため、API レスポンスから必要最小限の列のみ取り出す。
     */
    latestDeathNotice: {
      id: string;
      status:
        | 'pending'
        | 'awaiting_objection_period'
        | 'rejected'
        | 'disclosed';
      reportedDeathDate: string;
      objectionDeadline: string | null;
      objectionAt: string | null;
      opsRejectedReason: string | null;
      createdAt: string;
      /** 当該通知の申請者が自分自身かどうか（取り消しボタン表示判定用）*/
      isOwnNotice: boolean;
      /**
       * status='rejected' のとき、その理由が「通報者本人による取り消し」かどうか。
       * true:  通報者自身が pending 中にキャンセル
       * false: 運営却下 or 本人異議申立による rejected
       */
      cancelledByNotifier: boolean;
    } | null;
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
          let latestDeathNotice: RecipientLinkInfo['latestDeathNotice'] = null;
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

            // この owner についての最新の死亡通知（自分が通報者かどうかは
            // 問わない。同じ owner について他の連携者が出した通知も結果は
            // 自分に影響するため、表示する）
            // notifier_user_id を取得して、自分の申請かどうかも判定する
            // （取り消しボタンを出すかどうかの判定に使う）
            const { data: notice } = await admin
              .from('digital_death_notices')
              .select(
                'id, status, notifier_user_id, reported_death_date, objection_deadline, objection_at, ops_rejected_reason, ops_verifier, created_at'
              )
              .eq('owner_user_id', link.owner_user_id)
              .in('status', [
                'pending',
                'awaiting_objection_period',
                'rejected',
                'disclosed',
              ])
              .order('created_at', { ascending: false })
              .limit(1)
              .maybeSingle();
            if (notice) {
              const isOwnNotice = notice.notifier_user_id === user.id;
              // 通報者本人による取り消しは、ops_verifier に専用センチネルが
              // 入っているかどうかで判定（lib/digital/deathNotice.ts と同期）
              const cancelledByNotifier =
                notice.ops_verifier === NOTIFIER_SELF_CANCEL_MARKER;
              latestDeathNotice = {
                id: notice.id as string,
                status: notice.status as 'pending' | 'awaiting_objection_period' | 'rejected' | 'disclosed',
                reportedDeathDate: notice.reported_death_date as string,
                objectionDeadline:
                  (notice.objection_deadline as string | null) ?? null,
                objectionAt: (notice.objection_at as string | null) ?? null,
                opsRejectedReason:
                  (notice.ops_rejected_reason as string | null) ?? null,
                createdAt: notice.created_at as string,
                isOwnNotice,
                cancelledByNotifier,
              };
            }
          } catch (err) {
            console.warn('[digital/page] recipient link enrich failed', err);
          }
          return { link, ownerDisplayName, ownerEmail, latestDeathNotice };
        })
      );
    }
  } catch (err) {
    console.error('[digital/page] listLinksByRecipient failed', err);
  }

  // 自分が owner として連携している家族リンクの取得（active のみ）
  // 加えて、休止中（suspended）の件数も数える（課題 #30：カード登録で再開の案内表示用）。
  let ownerLinks: DigitalFamilyLink[] = [];
  let suspendedOwnerLinkCount = 0;
  try {
    const allOwnerLinks = await listLinksByOwner(supabase, user.id);
    ownerLinks = allOwnerLinks.filter((l) => l.status === 'active');
    suspendedOwnerLinkCount = allOwnerLinks.filter(
      (l) => l.status === 'suspended'
    ).length;
  } catch (err) {
    console.error('[digital/page] listLinksByOwner failed', err);
  }

  // 自分（オーナー）が死亡通知を受けている場合の取得
  //   - status='pending'（書類確認中）：通知の存在のみ表示、ボタンは不可
  //   - status='awaiting_objection_period'（異議申立可能）：取り下げボタン付き
  //   開示済（disclosed）/ 却下済（rejected）は表示不要
  type PendingDeathNotice = {
    id: string;
    status: 'pending' | 'awaiting_objection_period';
    notifierDisplayName: string | null;
    reportedDeathDate: string;
    objectionToken: string | null;
    objectionDeadline: string | null;
  };
  let pendingDeathNotice: PendingDeathNotice | null = null;
  try {
    const admin = createAdminSupabaseClient();
    const { data: notice } = await admin
      .from('digital_death_notices')
      .select(
        'id, status, notifier_user_id, reported_death_date, objection_token, objection_deadline'
      )
      .eq('owner_user_id', user.id)
      .in('status', ['pending', 'awaiting_objection_period'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (notice) {
      // 通報者の表示名は次の優先順位で決定：
      //   ① オーナー自身が招待時につけた呼称（family_links.recipient_name）
      //      例：「妻」「長男」「親友 田中」— オーナーが見たとき最も自然
      //   ② 通報者本人のプロフィール表示名
      //   ③ null（呼び出し側で「連携者の方」へフォールバック）
      let notifierDisplayName: string | null = null;
      try {
        notifierDisplayName = await getRecipientNameByOwner(
          admin,
          user.id,
          notice.notifier_user_id as string
        );
        if (!notifierDisplayName) {
          const notifier = await getDisplayNameById(
            admin,
            notice.notifier_user_id as string
          );
          notifierDisplayName =
            notifier?.display_name ?? notifier?.preferred_name ?? null;
        }
      } catch {
        // ignore
      }
      pendingDeathNotice = {
        id: notice.id as string,
        status: notice.status as 'pending' | 'awaiting_objection_period',
        notifierDisplayName,
        reportedDeathDate: notice.reported_death_date as string,
        objectionToken: (notice.objection_token as string | null) ?? null,
        objectionDeadline:
          (notice.objection_deadline as string | null) ?? null,
      };
    }
  } catch (err) {
    console.error('[digital/page] pending death notice fetch failed', err);
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
      suspendedOwnerLinkCount={suspendedOwnerLinkCount}
      pendingDeathNotice={pendingDeathNotice}
    />
  );
}
