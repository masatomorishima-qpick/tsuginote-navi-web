'use client';

/**
 * Toast
 *
 * 短時間表示される通知バナー。window.alert() の代わりに使う。
 * - 画面下部中央にスライドイン
 * - 数秒後に自動消失（duration で指定）
 * - 手動で × ボタンで閉じることも可能
 * - variant で色味を切替（success / info / warning / danger）
 *
 * 使用例：
 *   const [toast, setToast] = useState<{ message: string; variant: ToastVariant } | null>(null);
 *
 *   // 表示
 *   setToast({ message: '招待メールを再送しました', variant: 'success' });
 *
 *   // レンダリング
 *   {toast && (
 *     <Toast
 *       message={toast.message}
 *       variant={toast.variant}
 *       onClose={() => setToast(null)}
 *     />
 *   )}
 */

import { useEffect } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastVariant = 'success' | 'info' | 'warning' | 'danger';

type Props = {
  message: string;
  variant?: ToastVariant;
  /** 自動消失までの ms。0 で無効化（手動 × のみ）。既定 3500ms */
  duration?: number;
  onClose: () => void;
};

const VARIANT_STYLES: Record<
  ToastVariant,
  {
    bg: string;
    text: string;
    iconColor: string;
    icon: typeof CheckCircle2;
  }
> = {
  success: {
    bg: 'bg-emerald-600',
    text: 'text-white',
    iconColor: 'text-emerald-100',
    icon: CheckCircle2,
  },
  info: {
    bg: 'bg-slate-800',
    text: 'text-white',
    iconColor: 'text-slate-300',
    icon: Info,
  },
  warning: {
    bg: 'bg-amber-600',
    text: 'text-white',
    iconColor: 'text-amber-100',
    icon: AlertTriangle,
  },
  danger: {
    bg: 'bg-rose-600',
    text: 'text-white',
    iconColor: 'text-rose-100',
    icon: AlertCircle,
  },
};

export default function Toast({
  message,
  variant = 'info',
  duration = 3500,
  onClose,
}: Props) {
  useEffect(() => {
    if (duration <= 0) return;
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const style = VARIANT_STYLES[variant];
  const IconComp = style.icon;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed left-1/2 z-[60] flex w-full max-w-md -translate-x-1/2 justify-center px-4"
      style={{
        bottom: 'max(1.5rem, env(safe-area-inset-bottom, 0px) + 1rem)',
      }}
    >
      <div
        className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 shadow-lg ${style.bg} ${style.text} animate-[toast-in_180ms_ease-out]`}
      >
        <IconComp
          className={`h-5 w-5 flex-shrink-0 ${style.iconColor}`}
          aria-hidden="true"
        />
        <p className="flex-1 text-sm font-medium leading-snug">{message}</p>
        <button
          type="button"
          onClick={onClose}
          aria-label="閉じる"
          className={`flex-shrink-0 rounded-full p-1 transition hover:bg-white/10 ${style.text}`}
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <style jsx>{`
        @keyframes toast-in {
          from {
            opacity: 0;
            transform: translate(-50%, 12px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
      `}</style>
    </div>
  );
}
