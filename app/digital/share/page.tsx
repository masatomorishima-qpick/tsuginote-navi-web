/**
 * /digital/share — 「大切な方に共有」ページ
 *
 * 構成（D-① 改修版・ダッシュボード/設定と同じスタイル）：
 *   ① 連携アカウントに招待する（メイン）
 *   ② PDF として手元に保存する（サブ、コンパクト）
 *
 * 未ログインなら /login?next=/digital/share にリダイレクト。
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ShieldCheck, FileDown, UserRoundPlus } from 'lucide-react';
import { createDigitalServerClient } from '@/lib/supabase/digitalServer';
import { listAssets } from '@/lib/digital/assets';
import {
  listInvitationsByOwner,
  listLinksByOwner,
  MAX_FAMILY_LINKS,
  MAX_PENDING_INVITATIONS,
} from '@/lib/digital/family';
import { getOwnProfile, profileHasDisplayName } from '@/lib/digital/profile';
import FamilyInvitePanel from '@/components/digital/FamilyInvitePanel';
import PdfDownloadPanel from '@/components/digital/PdfDownloadPanel';

export const metadata: Metadata = {
  title: '大切な方に共有 | つぎの手ナビ デジタル資産',
  description:
    'もしものとき、登録内容を大切な方にお届けします。連携アカウントの招待と、PDF のダウンロードができます。',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function SharePage() {
  const supabase = await createDigitalServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?next=/digital/share');
  }

  // 並行取得
  const [assets, invitations, links, profile] = await Promise.all([
    listAssets(supabase, user.id),
    listInvitationsByOwner(supabase, user.id),
    listLinksByOwner(supabase, user.id),
    getOwnProfile(supabase, user.id),
  ]);

  const ownerHasDisplayName = profileHasDisplayName(profile);

  return (
    <div className="min-h-screen bg-[#F5F5F0]">
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link
            href="/digital/settings"
            className="text-sm text-emerald-600 active:opacity-70 flex-shrink-0"
          >
            ← 設定
          </Link>
          <h1 className="text-base font-medium text-gray-900 flex-1 text-center pr-12">
            大切な方に共有
          </h1>
        </div>
      </header>

      {/* 本体 */}
      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        {/* メイン：連携アカウントに招待 */}
        <section
          aria-labelledby="section-invite"
          className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6"
        >
          <h2
            id="section-invite"
            className="flex items-center gap-2 text-lg font-semibold text-gray-900"
          >
            <UserRoundPlus
              className="h-5 w-5 flex-shrink-0 text-emerald-700"
              aria-hidden="true"
            />
            連携アカウントに招待
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            招待を受けた方は専用のアカウントを作成し、もしものときに登録情報を引き継げるようになります。
          </p>

          <div className="mt-4">
            <FamilyInvitePanel
              initialLinks={links}
              initialInvitations={invitations}
              ownerHasDisplayName={ownerHasDisplayName}
              maxLinks={MAX_FAMILY_LINKS}
              maxPendingInvitations={MAX_PENDING_INVITATIONS}
            />
          </div>
        </section>

        {/* サブ：PDF として保存（コンパクト） */}
        <section
          aria-labelledby="section-pdf"
          className="bg-white rounded-2xl border border-gray-100 p-5"
        >
          <h2
            id="section-pdf"
            className="flex items-center gap-2 text-base font-medium text-gray-900"
          >
            <FileDown
              className="h-4 w-4 flex-shrink-0 text-gray-500"
              aria-hidden="true"
            />
            PDF として手元に保存
          </h2>
          <p className="mt-1 text-xs text-gray-500">
            A4 PDF をその場でダウンロード（無料）。印刷・郵送・メール添付にお使いいただけます。
            登録 {assets.length} 件分が含まれます。
          </p>
          <div className="mt-3">
            <PdfDownloadPanel assetCount={assets.length} />
          </div>
        </section>

        {/* 機微情報の注意（フッター） */}
        <div className="flex items-start gap-2 px-1 pt-2 text-xs text-gray-500">
          <ShieldCheck
            className="mt-0.5 h-3.5 w-3.5 flex-shrink-0"
            aria-hidden="true"
          />
          <p>
            パスワード・口座番号などの機微情報は含まれません。
            <Link
              href="/digital/settings/help"
              className="ml-1 underline hover:text-gray-700"
            >
              詳しくはヘルプ
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
