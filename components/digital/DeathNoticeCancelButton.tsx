'use client';

/**
 * DeathNoticeCancelButton
 *
 * 通報者が自分の出した死亡通知（pending 中、24h 以内）を取り消すボタン。
 *
 * 設計：
 *   - 既存の汎用 ConfirmDialog を使い、アプリ全体の確認 UI 体験と統一
 *   - ボタンはカード内に控えめに配置（赤テキストリンク調）
 *   - 押下時、ConfirmDialog（variant='danger'）が中央モーダルで開く
 *   - 取り消し成功 → router.refresh で画面更新
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { XCircle } from 'lucide-react';
import ConfirmDialog from '@/components/digital/ConfirmDialog';

/** 通報者本人が取り消せる時間：24h（lib/digital/deathNotice.ts と同期）*/
const NOTIFIER_SELF_CANCEL_WINDOW_MS = 24 * 60 * 60 * 1000;

type Props = {
  noticeId: string;
  /** 通知の申請日時（ISO 文字列）。24h を過ぎていたらボタンを出さない */
  createdAt: string;
};

export default function DeathNoticeCancelButton({ noticeId, createdAt }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  // マウント時に一度だけ判定（render 本体での Date.now() 直呼びを避ける）。
  // 表示中に 24h を跨いだ場合は API 側の cancel_window_expired が最終防衛線。
  const [withinCancelWindow] = useState(
    () =>
      Date.now() - new Date(createdAt).getTime() <
      NOTIFIER_SELF_CANCEL_WINDOW_MS
  );

  async function handleConfirm() {
    const res = await fetch(
      `/api/digital/family/death-notice/${encodeURIComponent(noticeId)}/cancel`,
      { method: 'POST' }
    );
    const json = (await res.json()) as {
      ok: boolean;
      error?: string;
      detail?: string;
    };
    if (!res.ok || !json.ok) {
      const message =
        json.detail ??
        (json.error === 'invalid_status'
          ? '既に運営にて確認が始まっているため、ご自身での取り消しはできません。'
          : json.error === 'cancel_window_expired'
            ? '申請から 24 時間が経過したため、ご自身での取り消しはできません。'
            : '取り消しに失敗しました。時間をおいて再度お試しください。');
      // ConfirmDialog 内で throw すると詳細メッセージとして表示される
      throw new Error(message);
    }
    setOpen(false);
    router.refresh();
  }

  if (!withinCancelWindow) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1 text-sm font-medium text-rose-700 hover:underline"
      >
        <XCircle className="h-4 w-4" aria-hidden="true" />
        申請を取り消す
      </button>

      <ConfirmDialog
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={handleConfirm}
        title="申請を取り消しますか？"
        description={[
          'ご本人とオーナーへ「取り消されました」のお知らせメールが送られます。',
          '誤申請の救済として、運営確認前かつ 24 時間以内のみご自身で取り消せます。',
        ]}
        confirmLabel="取り消す"
        cancelLabel="やめる"
        variant="danger"
      />
    </>
  );
}
