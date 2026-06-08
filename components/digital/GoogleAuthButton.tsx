'use client';

/**
 * GoogleAuthButton
 *
 * Google OAuth で「続ける」ボタン。ログイン画面・新規登録画面の両方で使う共通部品。
 *
 * Google OAuth は新規登録とログインの区別が無い（認証が通れば、既存アカウントなら
 * ログイン・無ければ自動作成）。そのため両画面で同一のこのボタンを置き、文言も
 * 「Google アカウントで続ける」で統一する（2026-06-05・新規/ログインの導線整理）。
 *
 * 会員登録完了の GA イベント（digital_sign_up）はオンボーディング完了時に発火するため、
 * このボタン側では送らない（OAuth 経由でも初回はオンボーディングを必ず通る）。
 */

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { createDigitalBrowserClient } from '@/lib/supabase/digitalBrowser';

type GoogleAuthButtonProps = {
  /** 認証後の遷移先（内部パス）。例：'/digital' */
  nextPath: string;
  /** 同一画面の他ボタンと連動して無効化したい場合 */
  disabled?: boolean;
};

export default function GoogleAuthButton({
  nextPath,
  disabled = false,
}: GoogleAuthButtonProps) {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleGoogle = async () => {
    setErrorMsg(null);
    setLoading(true);
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
        setLoading(false);
      }
      // 成功時はリダイレクトされるため loading は解除しない
    } catch {
      setErrorMsg('予期せぬエラーが発生しました。');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleGoogle}
        disabled={disabled || loading}
        className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
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
      {errorMsg && (
        <div role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {errorMsg}
        </div>
      )}
    </div>
  );
}
