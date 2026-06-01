/**
 * /digital/family/[ownerId] — 連携先の情報を閲覧する画面（連携者用）
 *
 * 表示条件：
 *   - 自分が当該オーナーの active な family_link の recipient であること
 *   - かつ、以下のいずれかを満たすこと：
 *     a) link.share_during_lifetime = true（生前共有 ON）
 *     b) disclosed_at が確定済みの death_notice が存在する（死後開示済み）
 *
 * Phase 1 では：
 *   - 資産情報（サービス名 / カテゴリ / 希望 / 担当 / メモ / 公式URL）を表示
 *   - PIN の復号は V-27 の死後開示専用画面で対応予定（このページでは表示しない）
 *
 * セキュリティ：service_role 経由で他人のデータを取得するため、上記の表示条件チェックを
 *               この page.tsx 内で厳密に行う。チェックを通らなければ閲覧不可。
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import {
  AlertTriangle,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';
import { createDigitalServerClient } from '@/lib/supabase/digitalServer';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import {
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  DEATH_ACTION_LABELS,
  type DigitalAsset,
  type DigitalCategory,
} from '@/types/digital';
import { KeyRound } from 'lucide-react';
import { formatJpDate } from '@/lib/digital/utils';
import RecipientPinReveal from '@/components/digital/RecipientPinReveal';

export const metadata: Metadata = {
  title: '連携先の情報 | つぎの手ナビ',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ ownerId: string }> };

export default async function FamilyOwnerViewPage({ params }: Props) {
  const { ownerId } = await params;

  const supabase = await createDigitalServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/login?next=${encodeURIComponent(`/digital/family/${ownerId}`)}`);
  }

  // ① 連携リンクを確認（自分が recipient、status=active のものを引く）
  const { data: linkRow, error: linkErr } = await supabase
    .from('digital_family_links')
    .select('*')
    .eq('owner_user_id', ownerId)
    .eq('recipient_user_id', user.id)
    .eq('status', 'active')
    .maybeSingle();

  if (linkErr) {
    console.error('[family/ownerId] link lookup failed', linkErr);
    return notFound();
  }
  if (!linkRow) {
    return notFound();
  }

  const shareDuringLifetime = !!linkRow.share_during_lifetime;

  // ② disclosed_at つきの death_notice があるか（service_role で確認、RLS をバイパス）
  const admin = createAdminSupabaseClient();
  const { data: disclosedNotice } = await admin
    .from('digital_death_notices')
    .select('id, disclosed_at')
    .eq('owner_user_id', ownerId)
    .eq('status', 'disclosed')
    .not('disclosed_at', 'is', null)
    .maybeSingle();

  const isDeathDisclosed = !!disclosedNotice;
  const canView = shareDuringLifetime || isDeathDisclosed;

  if (!canView) {
    // 連携はあるが、生前共有 OFF かつ未開示 → 待機中画面
    return <WaitingScreen />;
  }

  // ③ オーナーの表示名を取得
  let ownerDisplayName: string | null = null;
  try {
    const { data: profile } = await admin
      .from('digital_user_profiles')
      .select('display_name, preferred_name')
      .eq('user_id', ownerId)
      .maybeSingle();
    ownerDisplayName =
      (profile?.display_name as string | null) ??
      (profile?.preferred_name as string | null) ??
      null;
  } catch {
    ownerDisplayName = null;
  }

  // ④ オーナーの資産一覧を取得（service_role 経由）
  const { data: assetRows, error: assetErr } = await admin
    .from('digital_assets')
    .select('*')
    .eq('user_id', ownerId)
    .order('category', { ascending: true })
    .order('service_name', { ascending: true });
  if (assetErr) {
    console.error('[family/ownerId] assets lookup failed', assetErr);
  }
  const assets = (assetRows ?? []) as DigitalAsset[];

  // カテゴリ別にグループ化
  const grouped = new Map<DigitalCategory, DigitalAsset[]>();
  for (const a of assets) {
    const list = grouped.get(a.category) ?? [];
    list.push(a);
    grouped.set(a.category, list);
  }

  return (
    <div className="min-h-screen bg-[#F5F5F0]">
      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-10">
        {/* 大見出し（中央寄せ、十分な余白） */}
        <header className="mb-6 sm:mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            {isDeathDisclosed ? '故 ' : ''}
            {ownerDisplayName ?? '連携先の方'} さまの情報
          </h1>
          <p className="mt-3 text-sm text-gray-600 leading-relaxed">
            {isDeathDisclosed
              ? '開示が確定したため、ご登録情報をご確認いただけます。'
              : '現在、ご登録情報をご確認いただける状態です。'}
          </p>
        </header>

        <div className="space-y-6">

      {/* 状態バッジ */}
      <div
        className={`flex items-start gap-3 rounded-xl border p-4 text-sm ${
          isDeathDisclosed
            ? 'border-slate-300 bg-slate-50 text-slate-700'
            : 'border-emerald-200 bg-emerald-50 text-emerald-900'
        }`}
      >
        <ShieldCheck
          className={`mt-0.5 h-5 w-5 flex-shrink-0 ${isDeathDisclosed ? 'text-slate-500' : 'text-emerald-600'}`}
          aria-hidden="true"
        />
        <div>
          <p className="font-medium">
            {isDeathDisclosed
              ? `開示済み（${ownerDisplayName ?? 'ご本人'} さまのご逝去確認後）`
              : '閲覧可能'}
          </p>
          {isDeathDisclosed && disclosedNotice?.disclosed_at && (
            <p className="mt-0.5 text-xs">
              開示日：{formatJpDate(disclosedNotice.disclosed_at)}
            </p>
          )}
          <p className="mt-1 text-xs leading-relaxed">
            パスワード・ID・口座番号は含まれていません。
            記載されているのは「サービス名」「引き継ぐかたのご希望」「担当の方」「メモ」「公式サイトのURL」のみです。
          </p>
        </div>
      </div>

      {/* 資産一覧（カテゴリ別） */}
      {assets.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
          登録されているサービスはまだありません。
        </div>
      ) : (
        <div className="space-y-5">
          {CATEGORY_ORDER.filter((c) => grouped.has(c)).map((category) => (
            <section
              key={category}
              aria-label={CATEGORY_LABELS[category]}
              className="rounded-2xl border border-slate-200 bg-white p-5"
            >
              <h2 className="mb-3 text-sm font-semibold text-slate-700">
                {CATEGORY_LABELS[category]}（{grouped.get(category)!.length} 件）
              </h2>
              <ul className="space-y-3">
                {grouped.get(category)!.map((asset) => (
                  <li
                    key={asset.id}
                    className="rounded-xl border border-slate-200 bg-white p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-base font-semibold text-slate-900">
                          {asset.service_name}
                        </p>
                        {asset.official_url && (
                          <a
                            href={asset.official_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-0.5 inline-flex items-center gap-1 truncate text-xs text-emerald-700 hover:underline"
                          >
                            {asset.official_url}
                            <ExternalLink
                              className="h-3 w-3"
                              aria-hidden="true"
                            />
                          </a>
                        )}
                      </div>
                    </div>
                    <dl className="mt-3 grid grid-cols-1 gap-x-4 gap-y-2 text-xs sm:grid-cols-2">
                      <div>
                        <dt className="text-slate-400">引き継ぐかたのご希望</dt>
                        <dd className="mt-0.5 text-slate-700">
                          {DEATH_ACTION_LABELS[asset.death_action]}
                        </dd>
                      </div>
                      {asset.assignee_name && (
                        <div>
                          <dt className="text-slate-400">担当の方</dt>
                          <dd className="mt-0.5 text-slate-700">
                            {asset.assignee_name}
                          </dd>
                        </div>
                      )}
                      {asset.monthly_cost !== null && (
                        <div>
                          <dt className="text-slate-400">月額目安</dt>
                          <dd className="mt-0.5 text-slate-700">
                            ¥{asset.monthly_cost.toLocaleString()}
                          </dd>
                        </div>
                      )}
                      {asset.memo && (
                        <div className="sm:col-span-2">
                          <dt className="text-slate-400">メモ</dt>
                          <dd className="mt-0.5 whitespace-pre-wrap text-slate-700">
                            {asset.memo}
                          </dd>
                        </div>
                      )}
                    </dl>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      {/* スマホ・PC のパスワード（PIN）復号セクション */}
      <section
        aria-labelledby="section-pin-reveal"
        className="rounded-2xl border border-violet-200 bg-violet-50/40 p-5 sm:p-6"
      >
        <h2
          id="section-pin-reveal"
          className="flex items-center gap-2 text-lg font-semibold text-slate-900"
        >
          <KeyRound className="h-5 w-5 text-violet-700" aria-hidden="true" />
          スマホ・PC のロック解除パスワード
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          {isDeathDisclosed
            ? `故 ${ownerDisplayName ?? 'ご本人'} さまが保管されていた、スマートフォンや PC のロック解除パスワードです。`
            : `${ownerDisplayName ?? 'ご本人'} さまが保管されている、スマートフォンや PC のロック解除パスワードです。`}
        </p>
        <div className="mt-4">
          <RecipientPinReveal ownerId={ownerId} />
        </div>
      </section>

      <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-500">
        ※ この画面は連携先である本人のみ閲覧可能です。スクリーンショット・共有はご遠慮ください。
      </div>

          {/* 戻るリンク（下部） */}
          <div className="pt-4 text-center">
            <Link
              href="/digital"
              className="inline-flex items-center gap-1 text-sm text-emerald-600 active:opacity-70"
            >
              ← ダッシュボードに戻る
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function WaitingScreen() {
  return (
    <div className="mx-auto max-w-2xl py-8">
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 sm:p-8">
        <div className="flex flex-col items-center text-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-white">
            <AlertTriangle
              className="h-7 w-7 text-amber-600"
              aria-hidden="true"
            />
          </div>
          <h2 className="text-lg font-bold text-slate-900">
            現在、内容はご確認いただけません
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-700">
            ご本人がお元気な間は、原則として情報は表示されません。
            お亡くなりになった事実が確認された後にお届けします。
          </p>
          <Link
            href="/digital"
            className="mt-5 inline-flex items-center justify-center rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
          >
            ダッシュボードに戻る
          </Link>
        </div>
      </div>
    </div>
  );
}
