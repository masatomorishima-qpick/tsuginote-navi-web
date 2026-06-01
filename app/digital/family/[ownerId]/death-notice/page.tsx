/**
 * /digital/family/[ownerId]/death-notice — 連携者が死亡通知を作成する画面
 *
 * 表示条件：
 *   - ログイン済み
 *   - ログインユーザーが当該 owner の active な連携者（recipient）であること
 *
 * 既に進行中の通知（pending / awaiting_objection_period）がある場合は、
 * フォームを出さずに「確認中です」の状態表示にする。
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { AlertTriangle, Clock } from 'lucide-react';
import { createDigitalServerClient } from '@/lib/supabase/digitalServer';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { getDisplayNameById } from '@/lib/digital/profile';
import { DEATH_NOTICE_STATUS_LABELS } from '@/lib/digital/deathNotice';
import DeathNoticeForm from '@/components/digital/DeathNoticeForm';

export const metadata: Metadata = {
  title: '逝去のご報告 | つぎの手ナビ',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ ownerId: string }> };

export default async function DeathNoticePage({ params }: Props) {
  const { ownerId } = await params;

  const supabase = await createDigitalServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(
      `/login?next=${encodeURIComponent(`/digital/family/${ownerId}/death-notice`)}`
    );
  }

  // ① 連携関係を確認（自分が active な recipient であること）
  const { data: link, error: linkErr } = await supabase
    .from('digital_family_links')
    .select('id, status')
    .eq('owner_user_id', ownerId)
    .eq('recipient_user_id', user.id)
    .eq('status', 'active')
    .maybeSingle();
  if (linkErr) {
    console.error('[death-notice page] link lookup failed', linkErr);
    return notFound();
  }
  if (!link) {
    return notFound();
  }

  // ② オーナーの表示名
  const admin = createAdminSupabaseClient();
  let ownerDisplayName = '連携先の方';
  try {
    const profile = await getDisplayNameById(admin, ownerId);
    ownerDisplayName =
      profile?.display_name ?? profile?.preferred_name ?? ownerDisplayName;
  } catch {
    // ignore
  }

  // ③ 既に進行中の通知があるか確認
  const { data: existingNotice } = await admin
    .from('digital_death_notices')
    .select('id, status, created_at, objection_deadline')
    .eq('owner_user_id', ownerId)
    .in('status', ['pending', 'awaiting_objection_period', 'disclosed'])
    .order('created_at', { ascending: false })
    .maybeSingle();

  return (
    <div className="min-h-screen bg-[#F5F5F0]">
      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-10">
        {/* 大見出し（中央寄せ、十分な余白） */}
        <header className="mb-6 sm:mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            {ownerDisplayName} さまの逝去をご報告
          </h1>
          <p className="mt-3 text-sm text-gray-600 leading-relaxed">
            {ownerDisplayName} さまがお亡くなりになった事実をご報告いただくと、
            運営での確認とご本人への最終確認を経て、連携先の皆さまに登録情報が開示されます。
          </p>
        </header>

        <div className="space-y-6">

      {existingNotice ? (
        // 既に通知が進行中／開示済み
        <div
          className={`rounded-2xl border p-5 sm:p-6 ${
            existingNotice.status === 'disclosed'
              ? 'border-slate-200 bg-slate-50'
              : 'border-amber-200 bg-amber-50'
          }`}
        >
          <div className="flex items-start gap-3">
            {existingNotice.status === 'disclosed' ? (
              <Clock
                className="mt-0.5 h-5 w-5 flex-shrink-0 text-slate-500"
                aria-hidden="true"
              />
            ) : (
              <AlertTriangle
                className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600"
                aria-hidden="true"
              />
            )}
            <div>
              <p className="text-sm font-semibold text-slate-900">
                {existingNotice.status === 'disclosed'
                  ? 'この方の情報はすでに開示されています'
                  : '既に死亡通知が進行中です'}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-slate-600">
                現在のステータス：
                <b>
                  {
                    DEATH_NOTICE_STATUS_LABELS[
                      existingNotice.status as keyof typeof DEATH_NOTICE_STATUS_LABELS
                    ]
                  }
                </b>
                <br />
                {existingNotice.status === 'disclosed'
                  ? 'ダッシュボードの「あなたが連携先になっている方」から情報をご確認いただけます。'
                  : '重ねての通知は不要です。運営での確認をお待ちください。進捗はダッシュボードでご確認いただけます。'}
              </p>
              <Link
                href="/digital"
                className="mt-3 inline-flex items-center gap-1 rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                ダッシュボードへ
              </Link>
            </div>
          </div>
        </div>
      ) : (
        // 通知フォーム
        <DeathNoticeForm ownerId={ownerId} ownerDisplayName={ownerDisplayName} />
      )}

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
