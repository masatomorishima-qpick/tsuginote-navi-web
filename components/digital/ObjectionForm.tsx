'use client';

/**
 * ObjectionForm
 *
 * 死亡通知に対する「私は生きています」のワンクリック異議申立フォーム。
 *
 * トークン認証のため、ログイン情報は不要。
 * 押すと POST /api/death-objection/[token] が呼ばれ、通知が rejected に遷移する。
 */

import { useState } from 'react';
import { AlertCircle, CheckCircle2, Loader2, ShieldCheck } from 'lucide-react';

type Props = {
  token: string;
};

export default function ObjectionForm({ token }: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    if (submitting || done) return;
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch(
        `/api/death-objection/${encodeURIComponent(token)}`,
        { method: 'POST' }
      );
      const json = (await res.json()) as {
        ok: boolean;
        error?: string;
        detail?: string;
      };

      if (!res.ok || !json.ok) {
        const message =
          json.detail ??
          (json.error === 'deadline_passed'
            ? '異議申立の期限を過ぎています。'
            : json.error === 'invalid_status'
              ? 'この通知は既に処理済みです。'
              : '異議申立の送信に失敗しました。時間をおいて再度お試しください。');
        setError(message);
        setSubmitting(false);
        return;
      }

      setDone(true);
      setSubmitting(false);
    } catch (err) {
      console.error('[ObjectionForm] failed', err);
      setError('ネットワークエラーが発生しました。');
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-5">
        <div className="flex items-start gap-3">
          <CheckCircle2
            className="mt-0.5 h-6 w-6 flex-shrink-0 text-emerald-600"
            aria-hidden="true"
          />
          <div>
            <p className="text-sm font-semibold text-emerald-900">
              異議申立を受け付けました
            </p>
            <p className="mt-1 text-xs leading-relaxed text-emerald-800/90">
              この通知は取り下げとなり、大切な方への情報開示は行われません。
              通報者の方にも、ご本人がご無事である旨の連絡が届きます。
              <br />
              ご不明な点があれば support@tsuginotenavi.jp までご連絡ください。
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={handleClick}
        disabled={submitting}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-rose-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        {submitting ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          <ShieldCheck className="h-4 w-4" aria-hidden="true" />
        )}
        {submitting ? '送信中…' : '私は生きています（異議申立を送信）'}
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

      <p className="text-xs leading-relaxed text-slate-500">
        ※ このボタンを押せるのはご本人だけです（このページの URL はご本人のメールアドレスにしか送られていません）。
      </p>
    </div>
  );
}
