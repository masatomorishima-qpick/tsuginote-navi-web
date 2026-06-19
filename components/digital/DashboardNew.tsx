'use client';
import { useRouter } from 'next/navigation';
import { Shield, Globe, Smartphone, Lock, CheckCircle2, Circle, Users, CreditCard } from 'lucide-react';
import SubscriptionStatusBanner from '@/components/digital/SubscriptionStatusBanner';
import RecipientLinksCorner from '@/components/digital/RecipientLinksCorner';
import KekDistributePrompt from '@/components/digital/KekDistributePrompt';
import PendingDeathNoticeAlert, {
  type PendingDeathNotice,
} from '@/components/digital/PendingDeathNoticeAlert';
import type {
  DigitalSubscription,
  DigitalDeviceWithPinFlag,
} from '@/types/digital';
import type { RecipientLinkInfoLite } from '@/components/digital/RecipientLinksCorner';
import type { DigitalFamilyLink } from '@/lib/digital/family';
import {
  CATEGORY_LABELS,
  DEATH_ACTION_LABELS,
} from '@/lib/digital/utils';

// 1名あたりの月額（税込）。料金変更時はここを更新。
const PRICE_PER_RECIPIENT = 110;

type DashboardNewProps = {
  plan: 'free' | 'standard';
  status: 'trialing' | 'active' | 'past_due' | 'canceled' | 'free';
  trialDaysLeft: number | null;
  assets: {
    id: string;
    service_name: string;
    category: string;
    death_action: string;
  }[];
  devices: DigitalDeviceWithPinFlag[];
  subscription: DigitalSubscription | null;
  recipientLinks: RecipientLinkInfoLite[];
  ownerLinks: Pick<
    DigitalFamilyLink,
    'id' | 'recipient_name' | 'status' | 'created_at'
  >[];
  /** 休止中（suspended）の連携件数。> 0 のとき「カード登録で再開」案内を表示する（課題 #30） */
  suspendedOwnerLinkCount?: number;
  /** 自分（オーナー）が死亡通知を受けている場合の情報 */
  pendingDeathNotice?: PendingDeathNotice | null;
};

export default function DashboardNew({
  plan,
  status,
  trialDaysLeft,
  assets,
  devices,
  subscription,
  recipientLinks,
  ownerLinks,
  suspendedOwnerLinkCount = 0,
  pendingDeathNotice,
}: DashboardNewProps) {
  const router = useRouter();
  const isStandard = plan === 'standard';
  const isTrialing = status === 'trialing';
  // 進捗計算（資産登録済み・デバイス登録済みで各1ポイント）
  const progressStep =
    (assets.length > 0 ? 1 : 0) + (devices.length > 0 ? 1 : 0);
  const progressPct = (progressStep / 2) * 100;
  return (
    <div className="min-h-screen bg-[#F5F5F0]">
      <div className="max-w-2xl mx-auto px-4 pb-8">
        {/* ★ 最上段：あなたについて死亡通知が出ている場合のアラート（最重要のため一番上）*/}
        {pendingDeathNotice && (
          <div className="pt-4">
            <PendingDeathNoticeAlert notice={pendingDeathNotice} />
          </div>
        )}

        {/* プランバー（Apple 風：プラン名を大きく強調）
            縦積みにして、プラン名がアップグレードボタンに押し潰されて
            折り返す不具合（「フリ／ープ／ラン」）を防ぐ。 */}
        <div className="flex flex-col items-start py-6">
          <div className="min-w-0 w-full">
            <p className="text-2xl font-bold text-gray-900 tracking-tight sm:text-3xl">
              {isStandard ? '有料プラン' : '無料プラン'}
            </p>
            {isStandard &&
              (() => {
                // 2 行目：状態別に表示内容を組み立てる
                const linkCount = ownerLinks.length;
                const linkCountText = `${linkCount}名と連携中`;

                // 支払いエラー
                if (status === 'past_due') {
                  return (
                    <p className="mt-1 text-sm font-medium text-rose-600">
                      お支払いエラー（{linkCountText}）
                    </p>
                  );
                }

                // トライアル中
                if (isTrialing && trialDaysLeft !== null) {
                  return (
                    <p className="mt-1 text-sm text-gray-600">
                      トライアル中（残り {trialDaysLeft} 日・{linkCountText}）
                    </p>
                  );
                }

                // active / canceled（期間末まで継続）
                const monthlyFee = linkCount * PRICE_PER_RECIPIENT;
                const feeText = `¥${monthlyFee.toLocaleString()}/月`;

                if (subscription?.cancel_at_period_end) {
                  return (
                    <p className="mt-1 text-sm text-gray-600">
                      {feeText}（{linkCountText}・期間末で終了）
                    </p>
                  );
                }

                return (
                  <p className="mt-0.5 text-sm font-medium text-gray-700">
                    {feeText}（{linkCountText}）
                  </p>
                );
              })()}
          </div>
          {!isStandard ? (
            <button
              type="button"
              onClick={() => router.push('/digital/settings/plan')}
              className="mt-2 text-sm text-emerald-600 font-medium flex-shrink-0"
            >
             有料プランにアップグレード →
            </button>
          ) : (
            <button
              type="button"
              onClick={() => router.push('/digital/settings')}
              className="mt-2 text-sm text-emerald-600 font-medium flex-shrink-0"
            >
              プラン管理 →
            </button>
          )}
        </div>
        {/* サブスクリプションバナー（条件付き） */}
        <SubscriptionStatusBanner subscription={subscription} />
        {/* KEK配布プロンプト（条件付き） */}
        <KekDistributePrompt />
        {/* 準備の進捗カード（STANDARD では非表示） */}
        {!isStandard && (
          <div className="bg-white rounded-2xl p-5 mb-3 border border-gray-100">
            <div className="flex justify-between items-center mb-3">
              <span className="text-base font-medium">情報連携の準備</span>
              <span className="text-sm text-gray-400">
                {progressStep >= 2
                  ? '完了'
                  : `あと ${2 - progressStep} ステップ`}
              </span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full mb-3">
              <div
                className="h-1.5 bg-emerald-600 rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <ul className="space-y-2">
              <li>
                {assets.length > 0 ? (
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    デジタル資産を登録済み
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => router.push('/digital/assets/new')}
                    className="w-full flex items-center justify-between gap-2 text-sm text-gray-700 text-left active:opacity-70"
                  >
                    <span className="flex items-center gap-2">
                      <Circle className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      デジタル資産を登録する
                    </span>
                    <span className="text-emerald-600 flex-shrink-0">›</span>
                  </button>
                )}
              </li>
              <li>
                {devices.length > 0 ? (
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    デバイスを登録済み
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => router.push('/digital/devices/new')}
                    className="w-full flex items-center justify-between gap-2 text-sm text-gray-700 text-left active:opacity-70"
                  >
                    <span className="flex items-center gap-2">
                      <Circle className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      デバイスを登録する
                    </span>
                    <span className="text-emerald-600 flex-shrink-0">›</span>
                  </button>
                )}
              </li>
            </ul>
          </div>
        )}
        {/* デジタル資産カード */}
        {assets.length === 0 ? (
          <div
            className="bg-white rounded-2xl p-5 mb-3 border border-gray-100 cursor-pointer active:opacity-70"
            onClick={() => router.push('/digital/assets/new')}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <Globe className="w-5 h-5 text-emerald-700" />
                </div>
                <div>
                  <p className="text-base font-medium">デジタル資産</p>
                  <p className="text-sm text-gray-400">未登録</p>
                </div>
              </div>
              <span className="text-sm text-emerald-600 flex-shrink-0">
                はじめる ›
              </span>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-5 mb-3 border border-gray-100">
            {/* ヘッダー（タップで /digital/assets/new へ） */}
            <button
              type="button"
              onClick={() => router.push('/digital/assets/new')}
              className="w-full flex items-center justify-between text-left active:opacity-70"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <Globe className="w-5 h-5 text-emerald-700" />
                </div>
                <div>
                  <p className="text-base font-medium">デジタル資産</p>
                  <p className="text-sm text-gray-400">
                    {assets.length}件登録済み
                  </p>
                </div>
              </div>
              <span className="text-sm text-emerald-600 flex-shrink-0">
                ＋ 追加する
              </span>
            </button>
            {/* 下部：登録済みサービス一覧（最大3件） */}
            <div className="mt-3 border-t border-gray-100">
              {assets.slice(0, 3).map((a) => (
                <button
                  type="button"
                  key={a.id}
                  onClick={() => router.push(`/digital/assets/${a.id}`)}
                  className="w-full flex items-center justify-between gap-3 py-3 text-left border-b border-gray-100 last:border-b-0 active:opacity-70"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-base font-medium text-gray-900 truncate">
                      {a.service_name}
                    </p>
                    <p className="text-[13px] text-gray-400 truncate mt-0.5">
                      {CATEGORY_LABELS[a.category] ?? a.category}
                      <span className="mx-1">・</span>
                      {DEATH_ACTION_LABELS[a.death_action] ?? a.death_action}
                    </p>
                  </div>
                  <span className="text-[13px] text-emerald-600 flex-shrink-0">
                    編集 ›
                  </span>
                </button>
              ))}
            </div>
            {assets.length > 3 && (
              <button
                type="button"
                onClick={() => router.push('/digital/assets')}
                className="w-full text-center py-3 text-sm text-emerald-600 active:opacity-70"
              >
                他 {assets.length - 3} 件を見る →
              </button>
            )}
          </div>
        )}
        {/* デバイス・パスワードカード */}
        {isStandard ? (
          <div className="bg-white rounded-2xl p-5 mb-3 border border-gray-100">
            {/* ヘッダー（タップでデバイス一覧へ） */}
            <button
              type="button"
              onClick={() => router.push('/digital/devices')}
              className="w-full flex items-center justify-between text-left active:opacity-70"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <Smartphone className="w-5 h-5 text-emerald-700" />
                </div>
                <div>
                  <p className="text-base font-medium">デバイス・パスワード</p>
                  <p className="text-sm text-gray-400">
                    {devices.length > 0
                      ? `${devices.length}台登録済み`
                      : '未登録'}
                  </p>
                </div>
              </div>
              <span className="text-sm text-emerald-600 flex-shrink-0">
                {devices.length > 0 ? '管理 ›' : '登録する ›'}
              </span>
            </button>
            {/* 登録済みデバイス一覧 */}
            {devices.length > 0 && (
              <div className="mt-3 border-t border-gray-100">
                {devices.map((d) => (
                  <button
                    type="button"
                    key={d.id}
                    onClick={() => router.push(`/digital/devices/${d.id}`)}
                    className="w-full flex items-center justify-between gap-3 py-2.5 text-left border-b border-gray-100 last:border-b-0 active:opacity-70"
                  >
                    <span className="text-sm text-gray-700 truncate">
                      {d.device_name}
                    </span>
                    <span
                      className={`text-xs flex-shrink-0 ${
                        d.has_pin ? 'text-emerald-600' : 'text-gray-400'
                      }`}
                    >
                      {d.has_pin ? 'パスワード保管済み' : 'パスワード未保管'}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div
            className="bg-emerald-50 rounded-2xl p-5 mb-3 border border-emerald-100 cursor-pointer active:opacity-70"
            onClick={() => router.push('/digital/settings/plan')}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <Lock className="w-5 h-5 text-emerald-700" />
                </div>
                <div>
                  <p className="text-base font-medium">デバイス・パスワード</p>
                  <p className="text-sm text-gray-400">
                    {devices.length > 0
                      ? `${devices.length}台登録済み`
                      : '未登録'}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    スマホ・パソコンのパスワードを大切な方に残せます
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                <span className="text-xs bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                  Standardプラン
                </span>
                <span className="text-sm text-emerald-600">
                  30日間無料で試す
                </span>
              </div>
            </div>
          </div>
        )}
        {/* 休止中の連携の案内（課題 #30）：未払いで休止された連携がある場合、
            カード登録で再開できることを案内する */}
        {suspendedOwnerLinkCount > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 flex-shrink-0 rounded-xl bg-amber-100 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-amber-700" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base font-medium text-amber-900">
                  {suspendedOwnerLinkCount}名との連携が休止中です
                </p>
                <p className="mt-1 text-sm text-amber-800/90 leading-relaxed">
                  無料トライアルが終了したため、連携を一時休止しています。クレジットカードを登録すると、すぐに連携を再開できます。登録されたデジタル資産情報は保持されています。
                </p>
                <button
                  type="button"
                  onClick={() => router.push('/digital/settings/plan')}
                  className="mt-3 inline-flex items-center justify-center gap-1.5 rounded-full bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white active:opacity-80"
                >
                  <CreditCard className="w-4 h-4" />
                  カードを登録して再開する
                </button>
              </div>
            </div>
          </div>
        )}
        {/* 連携中の方カード（オーナー側・条件付き） */}
        {ownerLinks.length > 0 && (
          <div className="bg-white rounded-2xl p-5 mb-3 border border-gray-100">
            {/* ヘッダー（タップで /digital/share へ） */}
            <button
              type="button"
              onClick={() => router.push('/digital/share')}
              className="w-full flex items-center justify-between text-left active:opacity-70"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 text-emerald-700" />
                </div>
                <div>
                  <p className="text-base font-medium">連携中の方</p>
                  <p className="text-sm text-gray-400">
                    {ownerLinks.length}名と連携中
                  </p>
                </div>
              </div>
              <span className="text-[13px] text-emerald-600 flex-shrink-0">
                管理 ›
              </span>
            </button>
            {/* 連携先一覧（最大3件） */}
            <div className="mt-3 border-t border-gray-100">
              {ownerLinks.slice(0, 3).map((l) => (
                <button
                  type="button"
                  key={l.id}
                  onClick={() => router.push('/digital/share')}
                  className="w-full flex items-center justify-between gap-3 py-3 text-left border-b border-gray-100 last:border-b-0 active:opacity-70 min-h-[56px]"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-base font-medium text-gray-900 truncate">
                      {l.recipient_name ?? '（お名前未設定）'}
                    </p>
                    <p className="text-[13px] text-gray-400 truncate mt-0.5">
                      連携中
                    </p>
                  </div>
                  <span className="text-[13px] text-emerald-600 flex-shrink-0">
                    ›
                  </span>
                </button>
              ))}
            </div>
            {ownerLinks.length > 3 && (
              <button
                type="button"
                onClick={() => router.push('/digital/share')}
                className="w-full text-center py-3 text-sm text-emerald-600 active:opacity-70"
              >
                他 {ownerLinks.length - 3} 件を見る →
              </button>
            )}
          </div>
        )}
        {/* 連携先コーナー（受け手側・条件付き） */}
        {recipientLinks.length > 0 && (
          <div className="mb-3">
            <RecipientLinksCorner links={recipientLinks} />
          </div>
        )}
        {/* 信頼フッター */}
        <div className="flex items-center gap-2 mt-4 px-1">
          <Shield className="w-4 h-4 text-gray-300 flex-shrink-0" />
          <span className="text-xs text-gray-400">
            データは端末で暗号化。運営も閲覧できません
          </span>
        </div>
      </div>
    </div>
  );
}
