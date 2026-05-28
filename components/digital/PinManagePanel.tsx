'use client';

/**
 * PinManagePanel
 *
 * 登録済み PIN の管理画面の操作ボタン群（クライアント side）。
 *
 *   - PIN を表示する  → PinRevealDialog（Task #7）
 *   - PIN を更新      → PinEditDialog    （Task #8）
 *   - PIN を削除      → PinDeleteDialog  （Task #8）
 *
 * サーバー側（app/digital/devices/[id]/pin/page.tsx）で
 * 「自分のデバイスである」「PIN が登録済みである」を確認した後に mount する。
 *
 * 更新・削除成功時は router.refresh() で SSR の表示（登録済みフラグ等）を再評価する。
 * 削除時は親ページが「PIN 未登録なら登録画面へ」とリダイレクトする設計に寄せてあるので、
 * refresh のみでよい（手動 navigation は親側に任せる）。
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import PinRevealDialog from './PinRevealDialog';
import PinEditDialog from './PinEditDialog';
import PinDeleteDialog from './PinDeleteDialog';

type Props = {
  deviceId: string;
  deviceName: string;
  userEmail: string | null;
  /**
   * step-up 認証を要求するかどうか。
   * 親（サーバーコンポーネント）で `isStepupEnabled()` の評価結果を渡す。
   * Phase 1 はデフォルト OFF（false）でリリース。
   */
  stepupEnabled: boolean;
};

export default function PinManagePanel({
  deviceId,
  deviceName,
  userEmail,
  stepupEnabled,
}: Props) {
  const router = useRouter();

  const [revealOpen, setRevealOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <div className="space-y-3">
      <div className="grid gap-2 sm:grid-cols-3">
        <button
          type="button"
          onClick={() => setRevealOpen(true)}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
        >
          <Eye className="h-4 w-4" aria-hidden="true" />
          パスワードを表示する
        </button>

        <button
          type="button"
          onClick={() => setEditOpen(true)}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <Pencil className="h-4 w-4" aria-hidden="true" />
          パスワードを更新
        </button>

        <button
          type="button"
          onClick={() => setDeleteOpen(true)}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-rose-300 bg-white px-4 py-2.5 text-sm font-medium text-rose-700 hover:bg-rose-50"
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
          パスワードを削除
        </button>
      </div>

      <PinRevealDialog
        open={revealOpen}
        deviceId={deviceId}
        deviceName={deviceName}
        userEmail={userEmail}
        stepupEnabled={stepupEnabled}
        onClose={() => setRevealOpen(false)}
      />

      <PinEditDialog
        open={editOpen}
        deviceId={deviceId}
        deviceName={deviceName}
        userEmail={userEmail}
        stepupEnabled={stepupEnabled}
        onClose={() => setEditOpen(false)}
        onUpdated={() => router.refresh()}
      />

      <PinDeleteDialog
        open={deleteOpen}
        deviceId={deviceId}
        deviceName={deviceName}
        userEmail={userEmail}
        stepupEnabled={stepupEnabled}
        onClose={() => setDeleteOpen(false)}
        onDeleted={() => {
          // サーバーサイドで「未登録なら /pin/new にリダイレクト」する実装のため、
          // refresh でその判定を再実行させる。
          router.refresh();
        }}
      />
    </div>
  );
}
