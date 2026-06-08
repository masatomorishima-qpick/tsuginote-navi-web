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
import GoogleAuthButton from './GoogleAuthButton';

type LoginFormProps = {
  nextPath: string;
};

export default function LoginForm({ nextPath }: LoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState<'password' | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
      {/* Google ログイン（新規/ログイン共通） */}
      <GoogleAuthButton nextPath={nextPath} disabled={loading !== null} />

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
