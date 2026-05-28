'use client';

/**
 * PinResetClient
 *
 * パスフレーズを忘れたときの「リセット（作り直し）」フロー。
 *
 *   [confirm]  ← 何が起きるかの説明 + 2 つの確認チェック
 *      │
 *      ▼ （step-up 有効時のみ）
 *   [stepup]   ← StepupDialog で OTP 再認証
 *      │
 *      ▼
 *   POST /api/digital/pins/reset   ← PIN とKEK を全削除
 *      │
 *      ▼
 *   [done]     ← 完了。新しいパスフレーズで登録し直す案内
 *
 * 🔒 リセットは「保存済みの暗号文を捨てる」だけで、平文や鍵は一切扱わない。
 *    忘れたパスフレーズの復元はできない（仕様）。これは作り直しのための導線。
 */

import { useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  Loader2,
  KeyRound,
  CheckCircle2,
  ArrowLeft,
  Trash2,
} from 'lucide-react';
import StepupDialog from './StepupDialog';

type Props = {
  userEmail: string | null;
  /** step-up を要求するか（親で isStepupEnabled() を評価して渡す） */
  stepupEnabled: boolean;
};

type Phase = 'confirm' | 'stepup' | 'done';

export default function PinResetClient({ userEmail, stepupEnabled }: Props) {
  const [phase, setPhase] = useState<Phase>('confirm');
  const [ackCodes, setAckCodes] = useState(false);
  const [ackIrreversible, setAckIrreversible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletedPins, setDeletedPins] = useState(0);

  const bothChecked = ackCodes && ackIrreversible;

  async function doReset() {
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/digital/pins/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ confirm: true }),
      });
      const json = await res.json().catch(() => null);

      if (!res.ok || !json?.ok) {
        if (res.status === 401 && json?.error === 'stepup_required') {
          if (stepupEnabled) {
            setPhase('stepup');
            setError(
              '再認証の有効期限が切れました。もう一度メール認証を行ってください。'
            );
          } else {
            setError(
              'セッションを確認できませんでした。画面を更新してから再度お試しください。'
            );
          }
        } else {
          setError(
            json?.detail ??
              'リセットに失敗しました。時間をおいて再度お試しください。'
          );
        }
        setSubmitting(false);
        return;
      }

      setDeletedPins(
        typeof json.deleted_pins === 'number' ? json.deleted_pins : 0
      );
      setPhase('done');
      setSubmitting(false);
    } catch (err) {
      console.error('[PinResetClient] reset failed', err);
      setError('エラーが発生しました。時間をおいて再度お試しください。');
      setSubmitting(false);
    }
  }

  function handleStart() {
    setError(null);
    if (!bothChecked) return;
    if (stepupEnabled) {
      setPhase('stepup');
    } else {
      void doReset();
    }
  }

  // ── 完了画面 ────────────────────────────────────────────────────
  if (phase === 'done') {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 sm:p-8">
        <div className="flex flex-col items-center text-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-white">
            <CheckCircle2
              className="h-7 w-7 text-emerald-600"
              aria-hidden="true"
            />
          </div>
          <h2 className="text-lg font-bold text-slate-900">
            リセットが完了しました
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-700">
            保存されていたパスワード {deletedPins} 件を削除しました。
            これで、新しいマスターコードで登録し直せる状態になりました。
          </p>
          <p className="mt-2 text-xs leading-relaxed text-slate-500">
            デバイス一覧から、各デバイスの「パスワードを登録」に進んでください。
            最初の登録時に、新しいマスターコードを設定できます。
          </p>
          <Link
            href="/digital/devices"
            className="mt-5 inline-flex items-center justify-center gap-1.5 rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
          >
            <KeyRound className="h-4 w-4" aria-hidden="true" />
            デバイス一覧へ
          </Link>
        </div>
      </div>
    );
  }

  // ── 確認画面（phase 'confirm' / 'stepup'） ──────────────────────
  return (
    <>
      <div className="space-y-5">
        {/* 取り戻せないことの説明 */}
        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-5 text-sm text-amber-900">
          <div className="flex items-start gap-3">
            <AlertTriangle
              className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600"
              aria-hidden="true"
            />
            <div className="space-y-2">
              <p className="font-semibold">
                忘れたマスターコードで、保存済みのパスワードを取り戻すことはできません
              </p>
              <p className="leading-relaxed text-amber-900/90">
                パスワードはご本人のマスターコードで暗号化されており、運営でも取り出せません。
                これは安全のための仕組みです。そのため、ここでできるのは
                「いったん削除して、新しいマスターコードで登録し直す」ことだけです。
              </p>
            </div>
          </div>
        </div>

        {/* 何が起きるか */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-700">
          <h2 className="font-semibold text-slate-900">リセットすると</h2>
          <ul className="mt-2 list-inside list-disc space-y-1.5 leading-relaxed">
            <li>
              保存済みのスマホ・PC のロック解除パスワードが
              <b>すべて削除</b>されます。
            </li>
            <li>
              登録済みのデバイス（機種名など）は<b>残ります</b>。
              同じデバイスに登録し直せます。
            </li>
            <li>
              登録し直すときに、<b>新しいマスターコード</b>を設定します。
            </li>
            <li>
              連携先の方へは、登録し直したあとに改めて取り出すための情報が共有されます。
            </li>
          </ul>
          <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs leading-relaxed text-slate-600">
            ※ 端末のロック解除コードそのもの（4〜16桁の数字など）は、
            お手元の端末で変わらず使えます。リセット後はその値を
            もう一度入力して登録し直してください。
          </p>
        </div>

        {/* 確認チェック */}
        <div className="space-y-2.5">
          <label className="flex cursor-pointer items-start gap-2 rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={ackCodes}
              onChange={(e) => setAckCodes(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
            />
            <span>
              スマホ・PC のロック解除コードは、自分で確認・控えました
              （登録し直すときに入力できます）。
            </span>
          </label>
          <label className="flex cursor-pointer items-start gap-2 rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={ackIrreversible}
              onChange={(e) => setAckIrreversible(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
            />
            <span>
              リセットすると保存済みのパスワードがすべて消え、
              元に戻せないことを理解しました。
            </span>
          </label>
        </div>

        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        {/* ボタン */}
        <div className="flex flex-col-reverse items-stretch gap-2 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/digital/devices"
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            やめておく
          </Link>
          <button
            type="button"
            onClick={handleStart}
            disabled={!bothChecked || submitting}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Trash2 className="h-4 w-4" aria-hidden="true" />
            )}
            {submitting ? 'リセット中…' : 'パスワードをすべてリセットする'}
          </button>
        </div>
      </div>

      {/* step-up OTP（フラグ有効時のみ） */}
      {phase === 'stepup' && (
        <StepupDialog
          open
          purpose="pin_delete"
          email={userEmail}
          title="リセットの前に再認証"
          description="リセットを実行するには、ご登録のメールアドレス宛に届く6桁コードで再認証してください。"
          onClose={() => setPhase('confirm')}
          onVerified={() => {
            void doReset();
          }}
        />
      )}
    </>
  );
}
