'use client';

/**
 * ManageBillingButton
 *
 * Stripe 連携ボタン。状況に応じて 2 種類のエンドポイントを呼び分ける：
 *   - endpoint='portal'   : Stripe Customer Portal（既存 Sub の管理：解約・カード変更）
 *   - endpoint='checkout' : Stripe Checkout（新規 Sub 作成 + カード登録、trialing 中で Sub なしのケース）
 *
 * 既定は portal。trialing 中のカード登録初回フローでは checkout を指定する。
 */

import { useState } from 'react';
import { CreditCard, Loader2, AlertCircle } from 'lucide-react';

type Props = {
  /** Stripe customer がまだ無いユーザーは disabled にしておく用 */
  disabled?: boolean;
  label?: string;
  /** 呼び出すエンドポイント。既定は 'portal' */
  endpoint?: 'portal' | 'checkout';
};

export default function ManageBillingButton({
  disabled = false,
  label = 'お支払い情報を管理する（解約・支払い方法）',
  endpoint = 'portal',
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    if (loading || disabled) return;
    setError(null);
    setLoading(true);

    try {
      const apiPath =
        endpoint === 'checkout'
          ? '/api/digital/billing/checkout'
          : '/api/digital/billing/portal';
      const res = await fetch(apiPath, {
        method: 'POST',
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
          'お支払い情報の管理画面を開けませんでした。時間をおいて再度お試しください。';
        setError(msg);
        setLoading(false);
        return;
      }
      window.location.href = json.url;
    } catch (err) {
      console.error('[ManageBillingButton] failed', err);
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
        className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          <CreditCard className="h-4 w-4" aria-hidden="true" />
        )}
        {loading
          ? endpoint === 'checkout'
            ? 'Stripe 決済画面を準備中…'
            : 'カスタマーポータルを準備中…'
          : label}
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
    </div>
  );
}
