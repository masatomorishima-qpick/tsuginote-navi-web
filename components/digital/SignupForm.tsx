'use client';

/**
 * SignupForm
 *
 * Phase 1.5：新規登録（メール + パスワード）
 *   - メール、パスワード（強度チェック付き）、確認パスワードを入力
 *   - supabase.auth.signUp でアカウント作成
 *   - サーバーが確認メールを送信。リンククリックでログイン状態に。
 *
 * パスワード要件:
 *   - 8 文字以上
 *   - 英字＋数字を含む（推奨）
 *
 * 既に登録済みのメールで登録しようとした場合、Supabase は曖昧な応答を返す（ユーザー列挙対策）。
 */

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Loader2, Mail, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { createDigitalBrowserClient } from '@/lib/supabase/digitalBrowser';
import GoogleAuthButton from './GoogleAuthButton';

type SignupFormProps = {
  nextPath: string;
};

type PasswordStrength = {
  score: 0 | 1 | 2 | 3;
  label: string;
  color: string;
};

function evaluatePassword(password: string): PasswordStrength {
  if (password.length === 0) {
    return { score: 0, label: '', color: 'bg-slate-200' };
  }
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Za-z]/.test(password) && /\d/.test(password)) score++;
  if (password.length >= 12 || /[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) {
    return { score: 1, label: '弱い', color: 'bg-rose-400' };
  }
  if (score === 2) {
    return { score: 2, label: '普通', color: 'bg-amber-400' };
  }
  return { score: 3, label: '強い', color: 'bg-emerald-500' };
}

export default function SignupForm({ nextPath }: SignupFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [sentEmail, setSentEmail] = useState<string | null>(null);

  const strength = useMemo(() => evaluatePassword(password), [password]);

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
    if (!agreedTerms) {
      setErrorMsg('利用規約とプライバシーポリシーへの同意が必要です。');
      return;
    }

    setSubmitting(true);
    try {
      const supabase = createDigitalBrowserClient();
      const appUrl =
        process.env.NEXT_PUBLIC_APP_URL ||
        (typeof window !== 'undefined' ? window.location.origin : '');

      const { data, error } = await supabase.auth.signUp({
        email: trimmed,
        password,
        options: {
          emailRedirectTo: `${appUrl}/auth/callback?next=${encodeURIComponent(
            nextPath
          )}`,
        },
      });

      if (error) {
        // ユーザー列挙対策のため、ほとんどの失敗はあいまいに案内
        const msg = error.message?.toLowerCase() ?? '';
        if (msg.includes('rate') || msg.includes('limit')) {
          setErrorMsg('短時間に何度もお試しになっています。しばらくしてから再度お試しください。');
        } else if (msg.includes('weak') || msg.includes('password')) {
          setErrorMsg('もう少し複雑なパスワードを設定してください。');
        } else {
          setErrorMsg('登録に失敗しました。時間を置いて再度お試しください。');
        }
        setSubmitting(false);
        return;
      }

      // Supabase の仕様：既に登録済みのメールアドレスでも error は返さない
      // （ユーザー列挙対策）。data.user.identities が空配列で判別可能。
      const identities = data?.user?.identities;
      if (data?.user && identities && identities.length === 0) {
        setErrorMsg(
          'このメールアドレスは既に登録されています。ログインページからお進みください。'
        );
        setSubmitting(false);
        return;
      }

      // 確認メール送信完了 → メール案内画面に切替
      setSentEmail(trimmed);
      setSubmitting(false);
    } catch {
      setErrorMsg('予期せぬエラーが発生しました。');
      setSubmitting(false);
    }
  };

  // 確認メール送信後の表示
  if (sentEmail) {
    return (
      <div className="space-y-5 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
          <Mail className="h-8 w-8 text-emerald-700" aria-hidden="true" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-slate-900">確認メールを送信しました</h2>
          <p className="text-sm leading-relaxed text-slate-600">
            <span className="font-medium text-slate-800">{sentEmail}</span> 宛に
            <br />
            アカウント確認のメールをお送りしました。
            <br />
            メール内のリンクをクリックして登録を完了してください。
          </p>
        </div>
        <div className="rounded-xl bg-slate-50 p-4 text-left text-xs leading-relaxed text-slate-600">
          <p className="font-semibold text-slate-700">メールが届かない場合</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>迷惑メールフォルダをご確認ください</li>
            <li>メールアドレスが正しいかご確認ください</li>
            <li>5 分待っても届かない場合は再度お試しください</li>
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
    <div className="space-y-5">
      {/* Google で続ける（新規/ログイン共通の入口。Google は登録・ログインの区別なし） */}
      <GoogleAuthButton nextPath={nextPath} disabled={submitting} />

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-slate-200" />
        <span className="text-xs text-slate-400">または メールで登録</span>
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="signup-email" className="block text-sm font-medium text-slate-700">
          メールアドレス
        </label>
        <input
          id="signup-email"
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

      <div>
        <label htmlFor="signup-password" className="block text-sm font-medium text-slate-700">
          パスワード
        </label>
        <div className="relative mt-1.5">
          <input
            id="signup-password"
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
        {/* 強度メーター */}
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
              {' / '}
              8 文字以上の英字＋数字
            </p>
          </div>
        )}
      </div>

      <div>
        <label
          htmlFor="signup-password-confirm"
          className="block text-sm font-medium text-slate-700"
        >
          パスワード（確認）
        </label>
        <input
          id="signup-password-confirm"
          type={showPassword ? 'text' : 'password'}
          autoComplete="new-password"
          required
          value={passwordConfirm}
          onChange={(e) => setPasswordConfirm(e.target.value)}
          placeholder="同じパスワードを再入力"
          className="mt-1.5 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
          disabled={submitting}
        />
        {passwordConfirm.length > 0 && (
          <p
            className={`mt-1 text-xs ${
              password === passwordConfirm ? 'text-emerald-700' : 'text-rose-600'
            }`}
          >
            {password === passwordConfirm ? (
              <span className="inline-flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                一致しています
              </span>
            ) : (
              'パスワードが一致しません'
            )}
          </p>
        )}
      </div>

      <div className="flex items-start gap-2">
        <input
          id="agree-terms"
          type="checkbox"
          checked={agreedTerms}
          onChange={(e) => setAgreedTerms(e.target.checked)}
          className="mt-1 h-4 w-4 cursor-pointer rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
          disabled={submitting}
        />
        <label htmlFor="agree-terms" className="text-xs text-slate-600">
          <Link href="/terms" target="_blank" className="font-medium text-emerald-700 hover:underline">
            利用規約
          </Link>
          および
          <Link href="/privacy" target="_blank" className="font-medium text-emerald-700 hover:underline">
            プライバシーポリシー
          </Link>
          に同意します
        </label>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? (
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
        ) : null}
        <span>無料で登録する</span>
      </button>

      {errorMsg && (
        <div role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {errorMsg}
        </div>
      )}

      <p className="text-center text-xs text-slate-500">
        既にアカウントをお持ちの方は{' '}
        <Link
          href={`/login?next=${encodeURIComponent(nextPath)}`}
          className="font-medium text-emerald-700 hover:underline"
        >
          ログイン
        </Link>
      </p>
      </form>
    </div>
  );
}
