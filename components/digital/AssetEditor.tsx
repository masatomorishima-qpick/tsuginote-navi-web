'use client';

/**
 * AssetEditor
 *
 * 編集ページ用のクライアントラッパ。
 * AssetForm（編集モード）と削除ボタン＋DeleteConfirmDialog をまとめます。
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import type { DigitalAsset } from '@/types/digital';
import AssetForm from './AssetForm';
import DeleteConfirmDialog from './DeleteConfirmDialog';

type Props = {
  asset: DigitalAsset;
};

export default function AssetEditor({ asset }: Props) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);

  async function handleDelete() {
    const res = await fetch(`/api/digital/assets/${asset.id}`, {
      method: 'DELETE',
    });
    const json = await res.json().catch(() => null);
    if (!res.ok || !json?.ok) {
      throw new Error(json?.error ?? 'delete_failed');
    }
    setDialogOpen(false);
    router.push('/digital');
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <AssetForm mode="edit" initial={asset} />

      <div className="border-t border-slate-200 pt-4">
        <button
          type="button"
          onClick={() => setDialogOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-white px-4 py-2 text-sm font-medium text-rose-700 hover:bg-rose-50"
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
          このサービスを削除
        </button>
        <p className="mt-2 text-xs text-slate-500">
          削除すると復元できません。不要になった場合のみ削除してください。
        </p>
      </div>

      <DeleteConfirmDialog
        open={dialogOpen}
        serviceName={asset.service_name}
        onClose={() => setDialogOpen(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
