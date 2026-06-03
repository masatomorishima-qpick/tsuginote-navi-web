'use client';

/**
 * PinDeleteDialog
 *
 * 「PIN を削除する」モーダル。
 *
 *   [closed]
 *     │  open()
 *     ▼
 *   [stepup]     ← StepupDialog で OTP 再認証（purpose='pin_delete'）
 *     │
 *     ▼
 *   [confirm]    ← デバイス名を入力させて意図を確認 → DELETE /api/digital/pins/[device_id]
 *     │
 *     ▼
 *   [done]       ← 削除完了表示 → 親に success 通知
 *
 * 注意：
 *   - ここで削除するのは PIN シークレットのみ。デバイス本体は残る。
 *   - 復旧不可：削除後に「PIN 表示」は不可能になり、再登録フロー経由でのみ戻せる。
 *   - DELETE body には reason を optional で渡せる。サーバーは平文 PIN 等は一切受け付けない。
 */

import { useState } from 'react';
import {
  Loader2,
  Trash2,
  X,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import StepupDialog from './StepupDialog';

type Props = {
  open: boolean;
  deviceId: string;
  deviceName: string;
  userEmail: string | null;
  /**
   * step-up 認証を要求するかどうか（Phase 1 では server 側で false に固定）。
   * false のときは stepup phase をスキップして confirm から開始する。
   */
  stepupEnabled: boolean;
  onClose: () => void;
  /** 削除成功後に呼ばれる（親側でリダイレクト等） */
  onDeleted?: () => void;
};

type Phase = 'stepup' | 'confirm' | 'done';

export default function PinDeleteDialog({
  open,
  deviceId,
  deviceName,
  userEmail,
  stepupEnabled,
  onClose,
  onDeleted,
}: Props) {
  const initialPhase: Phase = stepupEnabled ? 'stepup' : 'confirm';
  const [phase, setPhase] = useState<Phase>(initialPhase);
  const [confirmText, setConfirmText] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // open の切り替わりで状態リセット（React 推奨 pattern）
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (!open) {
      setPhase(initialPhase);
      setConfirmText('');
      setReason('');
      setSubmitting(false);
      setError(null);
    }
  }

  function handleStepupVerified() {
    setError(null);
    setPhase('confirm');
  }

  async function handleDelete() {
    if (submitting) return;
    if (confirmText.trim() !== deviceName.trim()) {
      setError('確認のため、デバイス名をそのまま入力してください。');
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch(`/api/digital/pins/${deviceId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
          reason: reason.trim() || 'user_initiated',
        }),
      });
      const json = await res.json().catch(() => null);

      if (!res.ok || !json?.ok) {
        if (res.status === 401 && json?.error === 'stepup_required') {
          if (stepupEnabled) {
            setPhase('stepup');
            setError('再認証の有効期限が切れました。もう一度メール認証を行ってください。');
          } else {
            setError('セッションの状態を確認できませんでした。画面を更新してから再度お試しください。');
          }
        } else if (json?.error === 'device_not_found') {
          setError('対象デバイスが見つかりませんでした。');
        } else {
          setError(
            json?.detail ?? 'パスワードの削除に失敗しました。時間をおいて再度お試しください。'
          );
        }
        setSubmitting(false);
        return;
      }

      setPhase('done');
      setSubmitting(false);
      // 完了画面（done）をユーザーに確実に見てもらうため、ここでは onDeleted を呼ばない。
      // ユーザーが「閉じる」ボタンを押したタイミングで親に通知して画面遷移する。
    } catch (err) {
      console.error('[PinDeleteDialog] delete failed', err);
      setError('ネットワークエラーが発生しました。');
      setSubmitting(false);
    }
  }

  if (!open) return null;

  const confirmMatches = confirmText.trim() === deviceName.trim();

  return (
    <>
      {phase === 'stepup' && (
        <StepupDialog
          open
          purpose="pin_delete"
          email={userEmail}
          title={`${deviceName} のパスワードを削除する前に再認証`}
          description="パスワードを削除するには、ご登録のメールアドレス宛に届く6桁コードで再認証してください。認証後、削除確認の画面に進みます。"
          onClose={onClose}
          onVerified={handleStepupVerified}
        />
      )}

      {(phase === 'confirm' || phase === 'done') && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="pindelete-title"
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget && !submitting) onClose();
          }}
        >
          <div className="my-auto max-h-[calc(100vh-2rem)] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 text-rose-700">
                  <Trash2 className="h-5 w-5" aria-hidden="true" />
                </span>
                <h2
                  id="pindelete-title"
                  className="text-lg font-bold text-slate-900"
                >
                  {phase === 'confirm' ? 'パスワードを削除' : 'パスワードを削除しました'}
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                aria-label="閉じる"
                className="rounded-full p-1 text-slate-500 hover:bg-slate-100 disabled:opacity-50"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <div className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
              <span className="text-slate-400">対象デバイス：</span>
              <span className="ml-1 font-medium text-slate-800">{deviceName}</span>
            </div>

            {phase === 'confirm' && (
              <div className="mt-4 space-y-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 rounded-xl border border-rose-300 bg-rose-50 p-3 text-sm font-semibold text-rose-900">
                    <AlertTriangle
                      className="h-5 w-5 flex-shrink-0 text-rose-600"
                      aria-hidden="true"
                    />
                    削除すると元に戻せません
                  </div>
                  <p className="px-1 text-xs leading-relaxed text-slate-500">
                    ※ デバイス情報は残ります。あとからまた「パスワードを登録」で設定できます。
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="delete-confirm"
                    className="mb-1.5 block text-sm font-semibold text-slate-700"
                  >
                    確認のためデバイス名を入力してください
                  </label>
                  <p className="mb-1.5 text-xs text-slate-500">
                    「<span className="font-medium text-slate-700">{deviceName}</span>」と
                    そのまま入力してください。
                  </p>
                  <input
                    id="delete-confirm"
                    type="text"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    autoComplete="off"
                    spellCheck={false}
                    disabled={submitting}
                    placeholder={deviceName}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100 disabled:bg-slate-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="delete-reason"
                    className="mb-1.5 block text-sm font-semibold text-slate-700"
                  >
                    メモ（任意）
                  </label>
                  <p className="mb-1.5 text-xs text-slate-500">
                    あとで見返せるように、ひとことメモを残せます。空欄でもかまいません。
                  </p>
                  <input
                    id="delete-reason"
                    type="text"
                    value={reason}
                    onChange={(e) => setReason(e.target.value.slice(0, 100))}
                    placeholder="例：マスターコードを忘れたため、登録し直します"
                    disabled={submitting}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-100 disabled:bg-slate-100"
                  />
                </div>

                {error && (
                  <p className="rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">
                    {error}
                  </p>
                )}

                <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={submitting}
                    className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                  >
                    キャンセル
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={submitting || !confirmMatches}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-rose-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                  >
                    {submitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    ) : (
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    )}
                    {submitting ? '削除中…' : 'パスワードを削除する'}
                  </button>
                </div>
              </div>
            )}

            {phase === 'done' && (
              <div className="mt-4 space-y-4">
                <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
                  <CheckCircle2
                    className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600"
                    aria-hidden="true"
                  />
                  <p className="leading-relaxed">
                    パスワードを削除しました。必要になったときは「パスワードを登録」からまた設定できます。
                  </p>
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      // ユーザーが完了画面を確認したので、ここで親に通知 → 画面遷移
                      onClose();
                      onDeleted?.();
                    }}
                    className="inline-flex items-center justify-center rounded-lg bg-slate-800 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-900"
                  >
                    閉じる
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
