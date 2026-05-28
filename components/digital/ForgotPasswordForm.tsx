'use client';

/**
 * ForgotPasswordForm
 *
 * パスワードリセット用メール送信フォーム。
 * supabase.auth.resetPasswordForEmail を使い、登録済みメールに /reset-password へのリンクを送信。
 *
 * セキュリティ：
 *   - ユーザー列挙対策のため、未登録メールでも「送信しました」と返す
 *   - レートリミットは Supabase 側で自動適用される
 */

import { useState } from 'react';
import Link from 'next/link';
import { Loader2, Mail } from 'lucide-react';
import { createDigitalBrowserClient } from '@/lib/supabase/digitalBrowser';

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sentEmail, setSentEmail] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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

    setSubmitting(true);
    try {
      const supabase = createDigitalBrowserClient();
      const appUrl =
        process.env.NEXT_PUBLIC_APP_URL ||
        (typeof window !== 'undefined' ? window.location.origin : '');

      const { error } = await supabase.auth.resetPasswordForEmail(trimmed, {
        redirectTo: `${appUrl}/reset-password`,
      });

      // ユーザー列挙対策：失敗してもユーザーには成功したように見せる（レートリミット等の特殊ケース除く）
      if (error) {
        const msg = error.message?.toLowerCase() ?? '';
        if (msg.includes('rate') || msg.includes('limit')) {
          setErrorMsg(
            '短時間に何度もお試しになっています。しばらくしてから再度お試しください。'
          );
          setSubmitting(false);
          return;
        }
        // それ以外のエラーは送信成功扱い
      }

      setSentEmail(trimmed);
      setSubmitting(false);
    } catch {
      setErrorMsg('予期せぬエラーが発生しました。');
      setSubmitting(false);
    }
  };

  // 送信完了表示
  if (sentEmail) {
    return (
      <div className="space-y-5 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
          <Mail className="h-8 w-8 text-emerald-700" aria-hidden="true" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-slate-900">メールを送信しました</h2>
          <p className="text-sm leading-relaxed text-slate-600">
            <span className="font-medium text-slate-800">{sentEmail}</span> 宛に
            <br />
            パスワード再設定のメールをお送りしました。
            <br />
            メール内のリンクをクリックして新しいパスワードを設定してください。
          </p>
        </div>
        <div className="rounded-xl bg-slate-50 p-4 text-left text-xs leading-relaxed text-slate-600">
          <p className="font-semibold text-slate-700">ご注意</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>登録されていないメールアドレスの場合はメールは届きません</li>
            <li>5 分待っても届かない場合は迷惑メールフォルダをご確認ください</li>
            <li>リンクの有効期限は 60 分です</li>
          </ul>
        </div>
        <Link
          href="/login"
          className="inline-block text-sm font-medium text-emerald-700 hover:underline"
        >
          ログインページへ戻る
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <p className="text-sm leading-relaxed text-slate-600">
        ご登録のメールアドレスを入力してください。パスワード再設定用のリンクをお送りします。
      </p>

      <div>
        <label
          htmlFor="forgot-email"
          className="block text-sm font-medium text-slate-700"
        >
          メールアドレス
        </label>
        <input
          id="forgot-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
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
        ) : (
          <Mail className="h-5 w-5" aria-hidden="true" />
        )}
        <span>パスワード再設定メールを送る</span>
      </button>

      {errorMsg && (
        <div role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {errorMsg}
        </div>
      )}

      <p className="text-center text-xs text-slate-500">
        <Link href="/login" className="font-medium text-emerald-700 hover:underline">
          ログインページへ戻る
        </Link>
      </p>
    </form>
  );
}
