'use client';

/**
 * AccountDeleteForm
 *
 * /digital/account/delete に置く退会フォーム。
 *
 * ユーザ操作:
 *   1. 赤色の警告ボックスを読む
 *   2. 「このまま進めると元に戻せないこと」をチェック
 *   3. 自分のメールアドレスを再入力（タイプミス / 第三者クリック防止）
 *   4. 「アカウントを削除する」を押す
 *   5. 成功 → クライアント側で signOut → /login?deleted=1 へ
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AlertTriangle, Loader2, Trash2, ArrowLeft } from 'lucide-react';
import { createDigitalBrowserClient } from '@/lib/supabase/digitalBrowser';

type Props = {
  userEmail: string;
};

export default function AccountDeleteForm({ userEmail }: Props) {
  const router = useRouter();
  const [acknowledged, setAcknowledged] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const normalizedInput = emailInput.trim().toLowerCase();
  const normalizedExpected = userEmail.trim().toLowerCase();
  const emailMatches =
    normalizedInput.length > 0 && normalizedInput === normalizedExpected;

  const canSubmit = acknowledged && emailMatches && !submitting;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/digital/account/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email_confirmation: emailInput }),
      });
      const json = (await res.json().catch(() => null)) as
        | { ok: true }
        | { ok: false; error?: string; detail?: string }
        | null;

      if (!res.ok || !json || !json.ok) {
        setError(
          (json && !json.ok && (json.detail || json.error)) ||
            '削除に失敗しました。もう一度お試しください。'
        );
        setSubmitting(false);
        return;
      }

      // Supabase セッション Cookie を掃除してからサインアウト画面へ
      try {
        const supabase = createDigitalBrowserClient();
        await supabase.auth.signOut();
      } catch (err) {
        // signOut が失敗しても削除自体は完了しているので先に進む
        console.error('[AccountDeleteForm] signOut after delete failed', err);
      }
      router.replace('/login?deleted=1');
      router.refresh();
    } catch (err) {
      console.error('[AccountDeleteForm] submit error', err);
      setError('通信エラーが発生しました。時間を置いて再度お試しください。');
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 警告ボックス */}
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-900">
        <div className="flex items-start gap-2">
          <AlertTriangle
            className="mt-0.5 h-5 w-5 flex-shrink-0 text-rose-600"
            aria-hidden="true"
          />
          <div className="space-y-2">
            <p className="font-semibold">退会すると、以下のデータが削除されます。</p>
            <ul className="list-disc space-y-1 pl-5 text-rose-800/90">
              <li>登録されたデジタル資産（サービス名・引き継ぐかたのご希望など）</li>
              <li>発行済みの大切な方に共有のリンク（即時に閲覧不能になります）</li>
              <li>リマインド設定</li>
              <li>ログインに使われていたメールアドレス／Google 連携</li>
            </ul>
            <p className="text-rose-800/90">
              削除後の復元はできません。事前に PDF を出力して大切な方に渡すことをご検討ください。
            </p>
          </div>
        </div>
      </div>

      {/* 同意チェック */}
      <label className="flex items-start gap-3 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={acknowledged}
          onChange={(e) => setAcknowledged(e.target.checked)}
          className="mt-0.5 h-5 w-5 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
        />
        <span className="text-sm text-slate-800">
          上記の内容を確認しました。登録データと共有リンクをすべて削除することに同意します。
        </span>
      </label>

      {/* メール確認入力 */}
      <div>
        <label
          htmlFor="email-confirmation"
          className="block text-sm font-medium text-slate-800"
        >
          確認のため、ログインに使っているメールアドレスを入力してください
        </label>
        <p className="mt-1 text-xs text-slate-500">
          登録メール：
          <span className="ml-1 font-mono text-slate-700">{userEmail}</span>
        </p>
        <input
          id="email-confirmation"
          type="email"
          autoComplete="off"
          spellCheck={false}
          value={emailInput}
          onChange={(e) => setEmailInput(e.target.value)}
          className="mt-2 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
          placeholder="your@example.com"
        />
        {emailInput.length > 0 && !emailMatches && (
          <p className="mt-1 text-xs text-rose-600">
            登録メールと一致しません。
          </p>
        )}
      </div>

      {/* エラー */}
      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
          <AlertTriangle
            className="mt-0.5 h-4 w-4 flex-shrink-0"
            aria-hidden="true"
          />
          <span>{error}</span>
        </div>
      )}

      {/* ボタン群 */}
      <div className="flex flex-wrap items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={!canSubmit}
          className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              削除中...
            </>
          ) : (
            <>
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              アカウントを削除する
            </>
          )}
        </button>
        <Link
          href="/digital/settings"
          className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          キャンセルして戻る
        </Link>
      </div>
    </form>
  );
}
