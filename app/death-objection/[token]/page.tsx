/**
 * /death-objection/[token] — 死亡通知の異議申立ページ
 *
 * 本人がメールのリンクから来るページ。**ログイン不要**でワンクリック異議申立を受付。
 * /digital/* 配下ではなく、独立したパスに配置（ログイン誘導を挟まないため）。
 */

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  AlertTriangle,
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

  // 通報者・本人の表示名
  let ownerDisplayName: string | null = null;
  let notifierDisplayName: string | null = null;
  try {
    const owner = await getDisplayNameById(admin, notice.owner_user_id);
    ownerDisplayName = owner?.display_name ?? owner?.preferred_name ?? null;
  } catch {
    // ignore
  }
  try {
    const notifier = await getDisplayNameById(admin, notice.notifier_user_id);
    notifierDisplayName =
      notifier?.display_name ?? notifier?.preferred_name ?? null;
  } catch {
    // ignore
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:py-12">
      <div className="mx-auto max-w-xl space-y-6">
        {/* シンプルなブランドヘッダー */}
        <div className="text-center">
          <p className="text-xs font-semibold text-emerald-700">
            つぎの手ナビ デジタル資産
          </p>
        </div>

        {/* メインカード */}
        <div className="rounded-2xl border border-rose-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-4 flex items-start gap-3">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-rose-100">
              <AlertTriangle
                className="h-6 w-6 text-rose-600"
                aria-hidden="true"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                大切な確認のお願い
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                ご本人にしかお送りしていないメールから、このページを開いていただいています。
              </p>
            </div>
          </div>

          <div className="space-y-3 text-sm leading-relaxed text-slate-700">
            <p>
              <b>{notifierDisplayName ?? '連携者の方'}</b> さまから、
              <b>{ownerDisplayName ?? 'ご本人'}</b> さま（あなた）が
              <b>{notice.reported_death_date}</b> にお亡くなりになったとのご報告がございました。
            </p>
            <p>
              書類確認は完了しており、このまま <b>{deadline?.toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })} まで</b>
              に異議申立がない場合、大切な方への情報開示が行われます。
            </p>
            <p>
              ご本人がこのページを開いているということは、ご報告に誤りが含まれている可能性があります。
              下のボタンから「私は生きています」をワンクリックで送信してください。
              ボタンを押した瞬間に通知は取り下げとなり、開示は行われません。
            </p>
          </div>

          <div className="mt-6">
            <ObjectionForm token={token} />
          </div>
        </div>

        {/* 補足 */}
        <div className="rounded-xl bg-white p-4 text-xs leading-relaxed text-slate-600 ring-1 ring-slate-200">
          <p className="font-semibold text-slate-700">
            お困りの場合
          </p>
          <p className="mt-1">
            ボタンを押せない、または誤って通知を取り下げてしまった場合は、運営までご連絡ください。
            <br />
            <a
              href="mailto:support@tsuginotenavi.jp"
              className="font-medium text-emerald-700 hover:underline"
            >
              support@tsuginotenavi.jp
            </a>
          </p>
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
    <div className="min-h-screen bg-slate-50 px-4 py-12">
      <div className="mx-auto max-w-xl">
        <div className={`rounded-2xl border ${palette.border} ${palette.bg} p-6 sm:p-8`}>
          <div className="flex flex-col items-center text-center">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-white">
              {iconNode}
            </div>
            <h1 className={`text-lg font-bold ${palette.text}`}>{title}</h1>
            <p className={`mt-2 text-sm leading-relaxed ${palette.text}`}>
              {message}
            </p>
            <p className="mt-4 text-xs text-slate-500">
              お困りの場合は <a href="mailto:support@tsuginotenavi.jp" className="text-emerald-700 hover:underline">support@tsuginotenavi.jp</a> までご連絡ください。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
