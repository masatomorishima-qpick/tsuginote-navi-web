'use client';

/**
 * ConfirmDialog
 *
 * 汎用の確認ダイアログ。window.confirm() の代わりに使う。
 * - アプリのデザインシステムに揃えた見た目（モバイル・PC で同じ UX）
 * - variant で色味と意味合いを切替（default / warning / danger）
 * - requireAcknowledge=true でチェックボックス必須にできる（重要操作用）
 * - ESC キー、背景クリックで閉じる
 *
 * 使用例：
 *   const [open, setOpen] = useState(false);
 *   ...
 *   <ConfirmDialog
 *     open={open}
 *     onClose={() => setOpen(false)}
 *     onConfirm={async () => { await doSomething(); setOpen(false); }}
 *     title="本当に解除しますか？"
 *     description="期間終了で解約予定になります。"
 *     confirmLabel="解除する"
 *     variant="warning"
 *   />
 */

import { useEffect, useState } from 'react';
import {
  AlertTriangle,
  AlertOctagon,
  HelpCircle,
  Loader2,
  X,
} from 'lucide-react';

type Variant = 'default' | 'warning' | 'danger';

type Props = {
  /** ダイアログの表示状態 */
  open: boolean;
  /** タイトル（短く） */
  title: string;
  /** 説明文。複数段落の場合は配列で */
  description: string | string[];
  /** 確定ボタンのラベル（既定：「実行する」） */
  confirmLabel?: string;
  /** キャンセルボタンのラベル（既定：「キャンセル」） */
  cancelLabel?: string;
  /**
   * 色味と意味合い：
   *   - default : 通常確認（slate）
   *   - warning : 注意喚起（amber）
   *   - danger  : 取り消し不可な破壊的操作（rose）
   */
  variant?: Variant;
  /**
   * チェックボックスで「理解した」を必須にするか。
   * 文字列を渡すとチェックラベルとして使われる。
   */
  requireAcknowledge?: string | false;
  /** 閉じる（キャンセル） */
  onClose: () => void;
  /** 実行（非同期可。例外時はダイアログが残る） */
  onConfirm: () => Promise<void> | void;
};

const VARIANT_STYLES: Record<
  Variant,
  {
    iconBg: string;
    iconColor: string;
    icon: typeof AlertTriangle;
    confirmBg: string;
  }
> = {
  default: {
    iconBg: 'bg-slate-100',
    iconColor: 'text-slate-600',
    icon: HelpCircle,
    confirmBg: 'bg-emerald-600 hover:bg-emerald-700',
  },
  warning: {
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-700',
    icon: AlertTriangle,
    confirmBg: 'bg-amber-600 hover:bg-amber-700',
  },
  danger: {
    iconBg: 'bg-rose-100',
    iconColor: 'text-rose-700',
    icon: AlertOctagon,
    confirmBg: 'bg-rose-600 hover:bg-rose-700',
  },
};

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = '実行する',
  cancelLabel = 'キャンセル',
  variant = 'default',
  requireAcknowledge = false,
  onClose,
  onConfirm,
}: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setSubmitting(false);
      setAcknowledged(false);
      setError(null);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !submitting) onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, submitting, onClose]);

  if (!open) return null;

  const style = VARIANT_STYLES[variant];
  const IconComp = style.icon;
  const descArray = Array.isArray(description) ? description : [description];
  const ackRequired = !!requireAcknowledge;
  const ackLabel =
    typeof requireAcknowledge === 'string'
      ? requireAcknowledge
      : '内容を理解しました';
  const canConfirm = (!ackRequired || acknowledged) && !submitting;

  async function handleConfirm() {
    if (!canConfirm) return;
    setSubmitting(true);
    setError(null);
    try {
      await onConfirm();
    } catch (err) {
      console.error('[ConfirmDialog] onConfirm failed', err);
      // onConfirm 内で throw new Error(detail) されたエラーは詳細メッセージを表示
      const message =
        err instanceof Error && err.message
          ? err.message
          : '処理に失敗しました。時間をおいて再度お試しください。';
      setError(message);
      setSubmitting(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget && !submitting) onClose();
      }}
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span
              className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${style.iconBg} ${style.iconColor}`}
            >
              <IconComp className="h-5 w-5" aria-hidden="true" />
            </span>
            <h2
              id="confirm-dialog-title"
              className="text-base font-bold text-slate-900 sm:text-lg"
            >
              {title}
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

        <div className="mt-4 space-y-3 text-sm leading-relaxed text-slate-700">
          {descArray.map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>

        {ackRequired && (
          <label className="mt-4 flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-xs text-amber-900">
            <input
              type="checkbox"
              checked={acknowledged}
              onChange={(e) => setAcknowledged(e.target.checked)}
              disabled={submitting}
              className="mt-0.5 h-4 w-4 flex-shrink-0"
            />
            <span className="leading-relaxed">{ackLabel}</span>
          </label>
        )}

        {error && (
          <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">
            {error}
          </p>
        )}

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!canConfirm}
            className={`inline-flex items-center justify-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition disabled:cursor-not-allowed disabled:bg-slate-300 ${style.confirmBg}`}
          >
            {submitting && (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            )}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
