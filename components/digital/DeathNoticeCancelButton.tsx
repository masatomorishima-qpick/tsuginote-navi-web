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

type Props = {
  noticeId: string;
};

export default function DeathNoticeCancelButton({ noticeId }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

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
