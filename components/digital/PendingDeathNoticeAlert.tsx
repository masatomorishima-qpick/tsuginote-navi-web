'use client';

/**
 * PendingDeathNoticeAlert
 *
 * オーナーが「自分について死亡通知が出されている」状態のときに、
 * ダッシュボード最上段に表示する最重要アラート。
 *
 * 想定背景：
 *   - メール通知だけだと見落とすリスクがある（迷惑メール、開封漏れ等）
 *   - 異議申立期限を過ぎると登録情報が大切な方に開示されてしまうため、
 *     ログインした瞬間に絶対に気付ける位置に出す必要がある
 *
 * 状態別の振る舞い：
 *   - status='pending'（書類確認中）
 *       通知の存在のみ表示。異議申立ボタンは出さない
 *       （運営確認前のため objection_token がまだ無い）
 *   - status='awaiting_objection_period'（異議申立可能）
 *       「私は生きています」ボタンへの導線を表示
 *       /death-objection/[token] へ遷移
 */

import Link from 'next/link';
import { AlertTriangle, ShieldCheck } from 'lucide-react';

export type PendingDeathNotice = {
  id: string;
  status: 'pending' | 'awaiting_objection_period';
  notifierDisplayName: string | null;
  reportedDeathDate: string;
  objectionToken: string | null;
  objectionDeadline: string | null;
};

type Props = {
  notice: PendingDeathNotice;
};

export default function PendingDeathNoticeAlert({ notice }: Props) {
  const deadlineLabel = notice.objectionDeadline
    ? new Date(notice.objectionDeadline).toLocaleString('ja-JP', {
        timeZone: 'Asia/Tokyo',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'short',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  const notifierLabel = notice.notifierDisplayName ?? '連携者の方';

  if (notice.status === 'pending') {
    // 書類確認中。ボタンは出さない（運営確認後にメール + 当画面でボタン表示）
    return (
      <section
        className="rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:p-6"
        aria-labelledby="pending-death-notice-title"
      >
        <div className="flex items-start gap-3">
          <AlertTriangle
            className="mt-0.5 h-6 w-6 flex-shrink-0 text-amber-600"
            aria-hidden="true"
          />
          <div className="min-w-0">
            <h2
              id="pending-death-notice-title"
              className="text-lg font-bold text-slate-900 sm:text-xl"
            >
              あなたについて死亡のご報告が届いています
            </h2>
            <p className="mt-2 text-base leading-relaxed text-slate-700">
              <b>{notifierLabel}</b> さまから、{notice.reportedDeathDate} にお亡くなりになったとのご報告をお預かりし、現在運営にて書類の確認中です。
            </p>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              書類確認の完了後、改めて「異議申立」のご案内をお送りします。
              ご本人からのお返事をいただければ、情報の開示は行われません。
            </p>
          </div>
        </div>
      </section>
    );
  }

  // status === 'awaiting_objection_period'：取り下げボタン付き
  return (
    <section
      className="rounded-2xl border border-rose-300 bg-white p-5 shadow-sm sm:p-6"
      aria-labelledby="objection-alert-title"
    >
      <div className="flex items-start gap-3">
        <AlertTriangle
          className="mt-0.5 h-6 w-6 flex-shrink-0 text-rose-600"
          aria-hidden="true"
        />
        <div className="min-w-0 flex-1">
          <h2
            id="objection-alert-title"
            className="text-lg font-bold text-slate-900 sm:text-xl"
          >
            あなたについての死亡通知を確認してください
          </h2>
          <p className="mt-2 text-base leading-relaxed text-slate-700">
            <b>{notifierLabel}</b> さまから、{notice.reportedDeathDate} にお亡くなりになったとのご報告をいただきました。
          </p>
          {deadlineLabel && (
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              お返事の期限：<b className="text-slate-800">{deadlineLabel} まで</b>
            </p>
          )}

          {notice.objectionToken ? (
            <Link
              href={`/death-objection/${notice.objectionToken}`}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-rose-600 px-6 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-rose-700 sm:w-auto"
            >
              <ShieldCheck className="h-5 w-5" aria-hidden="true" />
              内容を確認する
            </Link>
          ) : (
            <p className="mt-4 text-sm text-slate-500">
              ※ 異議申立用のリンクが見つかりません。メールをご確認のうえアクセスしてください。
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
