'use client';

/**
 * UpgradeButton（新モデル：共有 ID 単位の従量課金）
 *
 * クリックで /api/digital/billing/checkout を叩き、
 * Stripe Checkout の URL を取得して遷移する。
 *
 * 旧の月額/年額選択は廃止。料金は連携 1 名あたり ¥110/月（税込）固定で、
 * Stripe 側で trial 30 日が自動的に付与される。
 */

import { useState } from 'react';
import { CreditCard, Loader2, AlertCircle } from 'lucide-react';

type Props = {
  label?: string;
  /** 既に他の状態で disabled にしたい場合 */
  disabled?: boolean;
  /** 既定 quantity（無指定なら API 側が active family_links 数 or 1 で決定） */
  quantity?: number;
};

export default function UpgradeButton({
  label = 'クレジットカードを今すぐ登録する',
  disabled = false,
  quantity,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    if (loading || disabled) return;
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/digital/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          typeof quantity === 'number' && quantity > 0 ? { quantity } : {}
        ),
      });
      const json = (await res.json()) as {
        ok: boolean;
        url?: string;
        error?: string;
        detail?: string;
      };

      if (!res.ok || !json.ok || !json.url) {
        const msg =
          json.detail ??
          (json.error === 'already_subscribed'
            ? '既に STANDARD プランをご利用中です。'
            : '決済画面の準備に失敗しました。時間をおいて再度お試しください。');
        setError(msg);
        setLoading(false);
        return;
      }

      window.location.href = json.url;
    } catch (err) {
      console.error('[UpgradeButton] failed', err);
      setError('ネットワークエラーが発生しました。');
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading || disabled}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300 sm:w-auto"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          <CreditCard className="h-4 w-4" aria-hidden="true" />
        )}
        {loading ? '決済画面を準備中…' : label}
      </button>
      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
          <AlertCircle
            className="mt-0.5 h-3.5 w-3.5 flex-shrink-0"
            aria-hidden="true"
          />
          <span>{error}</span>
        </div>
      )}
      <p className="text-xs text-slate-500">
        ※ Stripe（決済代行）の画面でカード情報を登録します。当社にはカード番号は届きません。最初の月から 30 日間は無料です。
      </p>
    </div>
  );
}
