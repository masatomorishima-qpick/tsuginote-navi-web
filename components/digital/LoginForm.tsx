'use client';

/**
 * LoginForm
 *
 * Phase 1.5：認証拡張（Magic Link 削除版）
 *   - Google ログイン（ワンクリック）
 *   - メール + パスワード（メイン）
 *   - パスワードリセット導線（/forgot-password）
 *
 * Magic Link は削除。理由：
 *   - メール+パスワードがメイン、Google が補助、リセットが救済 で全シナリオをカバー
 *   - Magic Link は他機能と役割が重複し、ユーザー混乱の元
 *   - Supabase 無料 SMTP のレート制限を消費する
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, KeyRound } from 'lucide-react';
import { createDigitalBrowserClient } from '@/lib/supabase/digitalBrowser';

type LoginFormProps = {
  nextPath: string;
};

export default function LoginForm({ nextPath }: LoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState<'google' | 'password' | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // ---- Google OAuth ----
  const handleGoogle = async () => {
    setErrorMsg(null);
    setLoading('google');
    try {
      const supabase = createDigitalBrowserClient();
      const appUrl =
        process.env.NEXT_PUBLIC_APP_URL ||
        (typeof window !== 'undefined' ? window.location.origin : '');

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${appUrl}/auth/callback?next=${encodeURIComponent(nextPath)}`,
        },
      });

      if (error) {
        setErrorMsg(
          'Google ログインの開始に失敗しました。しばらくしてからお試しください。'
        );
        setLoading(null);
      }
    } catch {
      setErrorMsg('予期せぬエラーが発生しました。');
      setLoading(null);
    }
  };

  // ---- メール + パスワードログイン ----
  const handlePasswordLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);

    const trimmed = email.trim();
    if (!trimmed) {
      setErrorMsg('メールアドレスを入力してください。');
      return;
    }
    if (!emailRegex.test(trimmed)) {
      setErrorMsg('正しいメールアドレスを入力してください。');
      return;
    }
    if (!password) {
      setErrorMsg('パスワードを入力してください。');
      return;
    }

    setLoading('password');
    try {
      const supabase = createDigitalBrowserClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: trimmed,
        password,
      });

      if (error) {
        // Supabase は "Invalid login credentials" を返すが、ユーザーへは曖昧に
        setErrorMsg(
          'メールアドレスまたはパスワードが違います。お確かめのうえ再度お試しください。'
        );
        setLoading(null);
        return;
      }

      // パスワード成功 → セッション確立済み → /digital へ
      router.replace(nextPath);
      router.refresh();
    } catch {
      setErrorMsg('予期せぬエラーが発生しました。');
      setLoading(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Google ログイン */}
      <button
        type="button"
        onClick={handleGoogle}
        disabled={loading !== null}
        className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading === 'google' ? (
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
        ) : (
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.83z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.83C6.71 7.31 9.14 5.38 12 5.38z"
              fill="#EA4335"
            />
          </svg>
        )}
        <span>Google アカウントで続ける</span>
      </button>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-slate-200" />
        <span className="text-xs text-slate-400">または</span>
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      {/* メール + パスワード */}
      <form onSubmit={handlePasswordLogin} className="space-y-3">
        <div>
          <label htmlFor="email-pw" className="block text-sm font-medium text-slate-700">
            メールアドレス
          </label>
          <input
            id="email-pw"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="mt-1.5 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
            disabled={loading !== null}
          />
        </div>
        <div>
          <div className="flex items-baseline justify-between">
            <label htmlFor="password" className="block text-sm font-medium text-slate-700">
              パスワード
            </label>
            <Link
              href="/forgot-password"
              className="text-xs text-emerald-700 hover:underline"
            >
              お忘れですか？
            </Link>
          </div>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="8 文字以上"
            className="mt-1.5 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
            disabled={loading !== null}
          />
        </div>
        <button
          type="submit"
          disabled={loading !== null}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading === 'password' ? (
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
          ) : (
            <KeyRound className="h-5 w-5" aria-hidden="true" />
          )}
          <span>ログイン</span>
        </button>
        <p className="text-center text-xs text-slate-500">
          アカウントをお持ちでない方は{' '}
          <Link
            href={`/signup?next=${encodeURIComponent(nextPath)}`}
            className="font-medium text-emerald-700 hover:underline"
          >
            新規登録
          </Link>
        </p>
      </form>

      {errorMsg && (
        <div role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {errorMsg}
        </div>
      )}
    </div>
  );
}
