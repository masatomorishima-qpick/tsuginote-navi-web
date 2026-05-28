'use client';

/**
 * ResetPasswordForm
 *
 * パスワード再設定の最終ステップ。Supabase の recovery リンクから来たユーザーが
 * 新しいパスワードを設定できる。
 *
 * 前提：このコンポーネントが render される時点で、Supabase が recovery セッションを
 *       自動的に確立している（リンクのトークンが処理済み）。
 */

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { createDigitalBrowserClient } from '@/lib/supabase/digitalBrowser';

type Strength = { score: 0 | 1 | 2 | 3; label: string; color: string };

function evaluatePassword(password: string): Strength {
  if (password.length === 0) {
    return { score: 0, label: '', color: 'bg-slate-200' };
  }
  let s = 0;
  if (password.length >= 8) s++;
  if (/[A-Za-z]/.test(password) && /\d/.test(password)) s++;
  if (password.length >= 12 || /[^A-Za-z0-9]/.test(password)) s++;
  if (s <= 1) return { score: 1, label: '弱い', color: 'bg-rose-400' };
  if (s === 2) return { score: 2, label: '普通', color: 'bg-amber-400' };
  return { score: 3, label: '強い', color: 'bg-emerald-500' };
}

export default function ResetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [hasSession, setHasSession] = useState<boolean | null>(null);

  const strength = useMemo(() => evaluatePassword(password), [password]);

  // recovery セッションが存在するか確認
  useEffect(() => {
    const supabase = createDigitalBrowserClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setHasSession(!!session);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);

    if (password.length < 8) {
      setErrorMsg('パスワードは 8 文字以上で入力してください。');
      return;
    }
    if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
      setErrorMsg('パスワードには英字と数字の両方を含めてください。');
      return;
    }
    if (password !== passwordConfirm) {
      setErrorMsg('パスワード（確認）が一致しません。');
      return;
    }

    setSubmitting(true);
    try {
      const supabase = createDigitalBrowserClient();
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        const msg = error.message?.toLowerCase() ?? '';
        if (msg.includes('weak') || msg.includes('password')) {
          setErrorMsg('もう少し複雑なパスワードを設定してください。');
        } else if (msg.includes('expired') || msg.includes('invalid')) {
          setErrorMsg('リンクの有効期限が切れています。もう一度パスワード再設定をお試しください。');
        } else {
          setErrorMsg('パスワード変更に失敗しました。時間を置いて再度お試しください。');
        }
        setSubmitting(false);
        return;
      }

      setSuccess(true);
      setSubmitting(false);

      // 3 秒後にダッシュボードへ
      setTimeout(() => {
        router.replace('/digital');
        router.refresh();
      }, 3000);
    } catch {
      setErrorMsg('予期せぬエラーが発生しました。');
      setSubmitting(false);
    }
  };

  // セッション確認中
  if (hasSession === null) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="h-6 w-6 animate-spin text-emerald-600" aria-hidden="true" />
      </div>
    );
  }

  // 無効なリンク（セッション無し）
  if (!hasSession) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-sm text-slate-700">
          リンクが無効か、有効期限が切れています。
        </p>
        <Link
          href="/forgot-password"
          className="inline-block rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          パスワード再設定をやり直す
        </Link>
      </div>
    );
  }

  // 成功
  if (success) {
    return (
      <div className="space-y-5 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
          <CheckCircle2 className="h-8 w-8 text-emerald-700" aria-hidden="true" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">パスワードを変更しました</h2>
        <p className="text-sm text-slate-600">
          ３秒後にダッシュボードに移動します...
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <p className="text-sm leading-relaxed text-slate-600">
        新しいパスワードを設定してください。次回からこのパスワードでログインできます。
      </p>

      <div>
        <label
          htmlFor="reset-password"
          className="block text-sm font-medium text-slate-700"
        >
          新しいパスワード
        </label>
        <div className="relative mt-1.5">
          <input
            id="reset-password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="8 文字以上の英字＋数字"
            className="w-full rounded-xl border border-slate-300 px-4 py-3 pr-12 text-sm placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
            disabled={submitting}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? 'パスワードを隠す' : 'パスワードを表示'}
            className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 hover:text-slate-600"
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Eye className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        </div>
        {password.length > 0 && (
          <div className="mt-2">
            <div className="flex gap-1">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded ${
                    strength.score >= i ? strength.color : 'bg-slate-200'
                  }`}
                />
              ))}
            </div>
            <p className="mt-1 text-xs text-slate-500">
              強度：<span className="font-medium text-slate-700">{strength.label}</span>
            </p>
          </div>
        )}
      </div>

      <div>
        <label
          htmlFor="reset-password-confirm"
          className="block text-sm font-medium text-slate-700"
        >
          新しいパスワード（確認）
        </label>
        <input
          id="reset-password-confirm"
          type={showPassword ? 'text' : 'password'}
          autoComplete="new-password"
          required
          value={passwordConfirm}
          onChange={(e) => setPasswordConfirm(e.target.value)}
          placeholder="同じパスワードを再入力"
          className="mt-1.5 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
          disabled={submitting}
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? (
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
        ) : null}
        <span>パスワードを変更する</span>
      </button>

      {errorMsg && (
        <div role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {errorMsg}
        </div>
      )}
    </form>
  );
}
