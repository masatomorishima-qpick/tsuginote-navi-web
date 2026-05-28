'use client';

/**
 * DeviceEditor
 *
 * 編集ページのクライアントラッパ。
 * DeviceForm（編集モード）＋「このデバイスを削除」ボタン＋確認ダイアログ をまとめる。
 *
 * 削除ロジック：
 *   - PIN が未登録: API が 200 OK を返して論理削除完了。
 *   - PIN が登録済み: API が 401 'stepup_required' を返す。
 *       → このUIでは、現段階（Task #5）では「先に PIN を削除してください」と案内する。
 *         step-up 経由の即時削除フローは Task #8 で実装する。
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, ShieldAlert } from 'lucide-react';
import type { DigitalDevice } from '@/types/digital';
import DeviceForm from './DeviceForm';
import DeleteConfirmDialog from './DeleteConfirmDialog';

type Props = {
  device: DigitalDevice;
  hasPin: boolean;
};

export default function DeviceEditor({ device, hasPin }: Props) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [blockedReason, setBlockedReason] = useState<string | null>(null);

  async function handleDelete() {
    const res = await fetch(`/api/digital/devices/${device.id}`, {
      method: 'DELETE',
    });
    const json = await res.json().catch(() => null);

    if (res.status === 401 && json?.error === 'stepup_required') {
      // Phase1 Task#5 時点では UI フローがまだ無いため、ユーザーにその旨を伝える。
      // Task#8 で step-up モーダルからの即時削除を実装する。
      setBlockedReason(
        'このデバイスにはパスワードが登録されています。まず「パスワードを削除」を行ってから再度お試しください。'
      );
      throw new Error('stepup_required');
    }

    if (!res.ok || !json?.ok) {
      throw new Error(json?.error ?? 'delete_failed');
    }

    setDialogOpen(false);
    router.push('/digital/devices');
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <DeviceForm mode="edit" initial={device} />

      <div className="border-t border-slate-200 pt-4">
        {hasPin && (
          <div className="mb-3 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
            <ShieldAlert
              className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600"
              aria-hidden="true"
            />
            <p>
              このデバイスにはパスワードが登録されています。デバイスを削除する前に、
              パスワードの扱い（削除／引き継ぎ）をご確認ください。
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={() => {
            setBlockedReason(null);
            setDialogOpen(true);
          }}
          className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-white px-4 py-2 text-sm font-medium text-rose-700 hover:bg-rose-50"
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
          このデバイスを削除
        </button>
        <p className="mt-2 text-xs text-slate-500">
          論理削除のため、一覧からは直ちに見えなくなります。データは監査ログ保持期間の間は DB に残ります。
        </p>

        {blockedReason && (
          <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
            {blockedReason}
          </p>
        )}
      </div>

      <DeleteConfirmDialog
        open={dialogOpen}
        serviceName={device.device_name}
        onClose={() => setDialogOpen(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
