'use client';

/**
 * StepupDialog
 *
 * step-up 再認証用の汎用モーダル。
 * PIN 表示・PIN 更新・PIN 削除・PIN 付きデバイス削除 など、step-up を必要とする操作の前に開く。
 *
 * 使い方：
 *   const [open, setOpen] = useState(false);
 *   <StepupDialog
 *     open={open}
 *     purpose="pin_reveal"
 *     email={user.email}
 *     onClose={() => setOpen(false)}
 *     onVerified={() => {  // step-up Cookie が発行された後のコールバック
 *       // 次の動作（GET /api/digital/pins/[id] など）へ
 *     }}
 *   />
 */

import { useEffect, useRef, useState } from 'react';
import { Loader2, Mail, ShieldCheck, X, RefreshCw } from 'lucide-react';

export type StepupPurpose =
  | 'pin_reveal'
  | 'pin_update'
  | 'pin_delete'
  | 'device_delete_with_pin';

type Props = {
  open: boolean;
  purpose: StepupPurpose;
  email: string | null;
  title?: string;
  description?: string;
  onClose: () => void;
  onVerified: () => void;
};

const PURPOSE_LABEL: Record<StepupPurpose, string> = {
  pin_reveal: 'パスワードの表示',
  pin_update: 'パスワードの更新',
  pin_delete: 'パスワードの削除',
  device_delete_with_pin: 'パスワード付きデバイスの削除',
};

export default function StepupDialog({
  open,
  purpose,
  email,
  title,
  description,
  onClose,
  onVerified,
}: Props) {
  const [phase, setPhase] = useState<'idle' | 'sending' | 'sent' | 'verifying'>(
    'idle'
  );
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // open の切り替わりで状態リセット。React 推奨パターン（prop の変化を検出して
  // render 中に setState）を使う。useEffect 内での setState は cascading render を招くため避ける。
  //   https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setPhase('idle');
      setCode('');
      setError(null);
      setInfo(null);
    }
  }

  useEffect(() => {
    if (phase === 'sent') {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [phase]);

  // ESC で閉じる（送信中は無効）
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && phase !== 'sending' && phase !== 'verifying') {
        onClose();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, phase, onClose]);

  if (!open) return null;

  async function handleSendOtp() {
    setError(null);
    setInfo(null);
    setPhase('sending');

    try {
      const res = await fetch('/api/digital/stepup/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ purpose }),
      });
      const json = await res.json().catch(() => null);

      if (!res.ok || !json?.ok) {
        setPhase('idle');
        setError(
          json?.detail ??
            '確認コードの送信に失敗しました。しばらく待ってから再度お試しください。'
        );
        return;
      }

      setPhase('sent');
      setInfo('確認コードをメールで送信しました。メールボックスをご確認ください。');
    } catch (err) {
      console.error('[StepupDialog] send failed', err);
      setPhase('idle');
      setError('ネットワークエラーが発生しました。');
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (phase === 'verifying') return;

    const trimmed = code.trim();
    if (!/^\d{6}$/.test(trimmed)) {
      setError('6桁の数字を入力してください。');
      return;
    }

    setError(null);
    setPhase('verifying');

    try {
      const res = await fetch('/api/digital/stepup/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ purpose, code: trimmed }),
      });
      const json = await res.json().catch(() => null);

      if (!res.ok || !json?.ok) {
        setPhase('sent');
        setError(
          json?.detail ??
            'コードが正しくないか、有効期限が切れています。もう一度お試しください。'
        );
        return;
      }

      // OK：親コンポーネントに通知
      onVerified();
    } catch (err) {
      console.error('[StepupDialog] verify failed', err);
      setPhase('sent');
      setError('ネットワークエラーが発生しました。');
    }
  }

  const heading = title ?? `${PURPOSE_LABEL[purpose]}のための再認証`;
  const body =
    description ??
    'セキュリティのため、ご登録のメールアドレス宛に6桁の確認コードを送信します。';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="stepup-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
      onClick={(e) => {
        if (
          e.target === e.currentTarget &&
          phase !== 'sending' &&
          phase !== 'verifying'
        )
          onClose();
      }}
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <ShieldCheck className="h-5 w-5" aria-hidden="true" />
            </span>
            <h2 id="stepup-title" className="text-lg font-bold text-slate-900">
              {heading}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={phase === 'sending' || phase === 'verifying'}
            aria-label="閉じる"
            className="rounded-full p-1 text-slate-500 hover:bg-slate-100 disabled:opacity-50"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-slate-700">{body}</p>

        {email && (
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
            <Mail className="h-4 w-4 text-slate-400" aria-hidden="true" />
            送信先メール：<span className="font-medium text-slate-800">{email}</span>
          </div>
        )}

        {/* Phase: idle (not sent yet) */}
        {(phase === 'idle' || phase === 'sending') && (
          <div className="mt-4">
            <button
              type="button"
              onClick={handleSendOtp}
              disabled={phase === 'sending'}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {phase === 'sending' ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <Mail className="h-4 w-4" aria-hidden="true" />
              )}
              確認コードをメールで送る
            </button>
          </div>
        )}

        {/* Phase: sent / verifying */}
        {(phase === 'sent' || phase === 'verifying') && (
          <form onSubmit={handleVerify} className="mt-4 space-y-3">
            <label
              htmlFor="stepup-code"
              className="block text-sm font-medium text-slate-700"
            >
              メールに届いた 6 桁コード
            </label>
            <input
              id="stepup-code"
              ref={inputRef}
              type="text"
              inputMode="numeric"
              pattern="\d{6}"
              maxLength={6}
              autoComplete="one-time-code"
              value={code}
              onChange={(e) =>
                setCode(e.target.value.replace(/\D/g, '').slice(0, 6))
              }
              placeholder="123456"
              disabled={phase === 'verifying'}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-center font-mono text-lg tracking-[0.35em] text-slate-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-100"
            />

            <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={phase === 'verifying'}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                コードを再送信
              </button>
              <button
                type="submit"
                disabled={phase === 'verifying' || code.length !== 6}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {phase === 'verifying' ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                )}
                認証する
              </button>
            </div>
          </form>
        )}

        {info && (
          <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
            {info}
          </p>
        )}
        {error && (
          <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">
            {error}
          </p>
        )}

        <p className="mt-4 text-[10px] leading-relaxed text-slate-400">
          この認証は5分間のみ有効です。時間を過ぎると再度のコード送信が必要になります。
        </p>
      </div>
    </div>
  );
}
