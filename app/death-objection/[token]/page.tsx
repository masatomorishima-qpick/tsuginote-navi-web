/**
 * /death-objection/[token] — 死亡通知の異議申立ページ
 *
 * 本人がメールのリンクから来るページ。**ログイン不要**でワンクリック異議申立を受付。
 * /digital/* 配下ではなく、独立したパスに配置（ログイン誘導を挟まないため）。
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  CheckCircle2,
  ChevronRight,
  XCircle,
} from 'lucide-react';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import {
  getNoticeByObjectionToken,
  DEATH_NOTICE_STATUS_LABELS,
} from '@/lib/digital/deathNotice';
import { getDisplayNameById } from '@/lib/digital/profile';
import { getRecipientNameByOwner } from '@/lib/digital/family';
import ObjectionForm from '@/components/digital/ObjectionForm';

export const metadata: Metadata = {
  title: 'ご本人確認のお願い | つぎの手ナビ',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ token: string }> };

export default async function DeathObjectionPage({ params }: Props) {
  const { token } = await params;
  const admin = createAdminSupabaseClient();
  const notice = await getNoticeByObjectionToken(admin, token);

  if (!notice) {
    return notFound();
  }

  // 状態別の表示分岐
  if (notice.status === 'pending') {
    return (
      <SimpleStateCard
        icon="pending"
        title="現在、運営側で書類確認中です"
        message="このリンクは、書類確認完了後にお使いいただけます。確認が完了次第、改めて異議申立用のメールをお送りしますので、しばらくお待ちください。"
      />
    );
  }
  if (notice.status === 'rejected') {
    return (
      <SimpleStateCard
        icon="rejected"
        title="この通知は既に取り下げとなっています"
        message={
          notice.objection_at
            ? '異議申立が完了しています。情報の開示は行われませんのでご安心ください。'
            : '運営による書類確認の結果、通知は却下されています。'
        }
      />
    );
  }
  if (notice.status === 'disclosed') {
    return (
      <SimpleStateCard
        icon="disclosed"
        title="既に情報開示が完了しています"
        message="このリンクの有効期限はすでに経過しています。お心当たりがない場合は、運営までお問い合わせください。"
      />
    );
  }

  // status === 'awaiting_objection_period'
  const deadline = notice.objection_deadline
    ? new Date(notice.objection_deadline)
    : null;
  const isExpired = deadline ? deadline.getTime() < Date.now() : false;

  if (isExpired) {
    return (
      <SimpleStateCard
        icon="expired"
        title="異議申立の期限を過ぎています"
        message="このリンクの有効期限は過ぎています。確認内容に誤りがある場合は、運営まで直接お問い合わせください。"
      />
    );
  }

  // 表示名の優先順位
  //   本人（ownerDisplayName）：プロフィールから取得（自分自身のメール宛 UI なので
  //     family_links は使わない、というか自分のリンクは存在しない）
  //   通報者（notifierDisplayName）：オーナーが招待時につけた呼称
  //     （family_links.recipient_name）を最優先。次にプロフィール表示名。
  //     例：オーナーが「妻」と招待していれば「妻 さまから」と表示される。
  let ownerDisplayName: string | null = null;
  let notifierDisplayName: string | null = null;
  try {
    const owner = await getDisplayNameById(admin, notice.owner_user_id);
    ownerDisplayName = owner?.display_name ?? owner?.preferred_name ?? null;
  } catch {
    // ignore
  }
  try {
    notifierDisplayName = await getRecipientNameByOwner(
      admin,
      notice.owner_user_id,
      notice.notifier_user_id
    );
    if (!notifierDisplayName) {
      const notifier = await getDisplayNameById(admin, notice.notifier_user_id);
      notifierDisplayName =
        notifier?.display_name ?? notifier?.preferred_name ?? null;
    }
  } catch {
    // ignore
  }

  // 期限を「2026年6月16日（火）23:13」形式で整形
  const deadlineLabel = deadline
    ? deadline.toLocaleString('ja-JP', {
        timeZone: 'Asia/Tokyo',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'short',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  return (
    <div className="min-h-screen bg-[#F5F5F0] px-4 py-8 sm:py-12">
      <div className="mx-auto max-w-xl space-y-6">
        {/* ブランドヘッダー */}
        <div className="text-center">
          <p className="text-sm font-semibold text-emerald-700">
            つぎの手ナビ デジタル資産
          </p>
        </div>

        {/* メインカード — 寄り添うトーン、字サイズ大、無駄省略 */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          {/* 大きな見出し（カード内）*/}
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            {ownerDisplayName ?? 'ご本人'} さま、確認のお願いです
          </h1>

          {/* 本文 — text-base で 16px、leading-relaxed で読みやすく */}
          <div className="mt-5 space-y-4 text-base leading-relaxed text-slate-700">
            <p>
              <b>{notifierDisplayName ?? '連携者の方'}</b> さまから、
              {ownerDisplayName ?? 'ご本人'} さまについて
              「<b>{notice.reported_death_date}</b> にお亡くなりになった」
              とのご報告をお預かりしました。
            </p>
            <p>
              下のボタンを押していただければ、この通知は <b>取り下げ</b> となり、
              ご登録情報は <b>公開されません</b>。
            </p>
            <p className="text-sm text-slate-600">
              お返事の期限：<b className="text-slate-800">{deadlineLabel} まで</b>
            </p>
          </div>

          {/* 異議申立ボタン */}
          <div className="mt-6">
            <ObjectionForm token={token} />
          </div>
        </div>

        {/* 補足（最小限）*/}
        <p className="text-center text-sm leading-relaxed text-slate-600">
          お困りの場合は{' '}
          <a
            href="mailto:info@blueadventures.jp"
            className="font-medium text-emerald-700 hover:underline"
          >
            info@blueadventures.jp
          </a>
          {' '}までご連絡ください。
        </p>

        {/* ダッシュボードへ戻る導線
            ※ このページはトークン認証のためログインなしでも開ける。
              未ログインの場合 /digital → middleware で /login に誘導される。
              既にログイン済（ダッシュボードのアラートから来た）場合は
              そのままダッシュボードへ戻れる。 */}
        <div className="pt-2 text-center">
          <Link
            href="/digital"
            className="inline-flex items-center gap-1 text-sm font-medium text-emerald-700 hover:underline"
          >
            ← ダッシュボードに戻る
          </Link>
        </div>
      </div>
    </div>
  );
}

function SimpleStateCard({
  icon,
  title,
  message,
}: {
  icon: 'pending' | 'rejected' | 'disclosed' | 'expired';
  title: string;
  message: string;
}) {
  const palette = {
    pending: { border: 'border-amber-200', bg: 'bg-amber-50', text: 'text-amber-900' },
    rejected: { border: 'border-emerald-200', bg: 'bg-emerald-50', text: 'text-emerald-900' },
    disclosed: { border: 'border-slate-200', bg: 'bg-slate-50', text: 'text-slate-700' },
    expired: { border: 'border-slate-200', bg: 'bg-slate-50', text: 'text-slate-700' },
  }[icon];

  const iconNode = {
    pending: <ChevronRight className="h-6 w-6 text-amber-600" />,
    rejected: <CheckCircle2 className="h-6 w-6 text-emerald-600" />,
    disclosed: <XCircle className="h-6 w-6 text-slate-500" />,
    expired: <XCircle className="h-6 w-6 text-slate-500" />,
  }[icon];

  return (
    <div className="min-h-screen bg-[#F5F5F0] px-4 py-12">
      <div className="mx-auto max-w-xl space-y-6">
        <div className={`rounded-2xl border ${palette.border} ${palette.bg} p-6 sm:p-8`}>
          <div className="flex flex-col items-center text-center">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-white">
              {iconNode}
            </div>
            <h1 className={`text-lg font-bold ${palette.text}`}>{title}</h1>
            <p className={`mt-2 text-base leading-relaxed ${palette.text}`}>
              {message}
            </p>
            <p className="mt-4 text-sm text-slate-500">
              お困りの場合は{' '}
              <a
                href="mailto:info@blueadventures.jp"
                className="text-emerald-700 hover:underline"
              >
                info@blueadventures.jp
              </a>
              {' '}までご連絡ください。
            </p>
          </div>
        </div>

        {/* ダッシュボードへ戻る導線（未ログインの場合は /login にリダイレクト）*/}
        <div className="text-center">
          <Link
            href="/digital"
            className="inline-flex items-center gap-1 text-sm font-medium text-emerald-700 hover:underline"
          >
            ← ダッシュボードに戻る
          </Link>
        </div>
      </div>
    </div>
  );
}
