'use client';

/**
 * KekDistributePrompt
 *
 * 「KEK 未配布の連携者」が残っているとき、ダッシュボードでパスフレーズ入力を
 * 促すバナー＋ポップアップ。
 *
 * 背景：
 *   連携者へ PIN を引き継ぐには、KEK をその連携者の公開鍵で暗号化したものが必要。
 *   その暗号化は「本人がパスフレーズを入力した瞬間（＝本人のブラウザ内）」でしか作れない。
 *   PIN の登録・更新・表示の裏で自動配布しているが、PIN を一切操作しないと
 *   取りこぼしが残る。その隙間をこのポップアップで塞ぐ。
 *
 * 挙動（ユーザー選択：毎回表示＋バナー）：
 *   - マウント時に crypto-context を取得。未配布の連携者がいればポップアップを自動表示。
 *   - 「後で」で閉じてもバナーは残り、ダッシュボードを開くたびにポップアップを再表示。
 *   - 配布が完了したら、その訪問ではバナーもポップアップも消える。
 *
 * 🔒 パスフレーズはこのコンポーネント内だけで使い、サーバーには暗号文のみ送る。
 */

import { useEffect, useState } from 'react';
import {
  KeyRound,
  Loader2,
  X,
  AlertCircle,
  ShieldCheck,
  Users,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
} from 'lucide-react';
import {
  buildRecipientKekEnvelopes,
  PassphraseMismatchError,
  type OwnerKekEnvelopeData,
  type RecipientPublicKey,
} from '@/lib/crypto/pinV2Client';

type Status = 'loading' | 'hidden' | 'pending' | 'done';

export default function KekDistributePrompt() {
  const [status, setStatus] = useState<Status>('loading');
  const [ownerKekEnvelope, setOwnerKekEnvelope] =
    useState<OwnerKekEnvelopeData | null>(null);
  const [recipients, setRecipients] = useState<RecipientPublicKey[]>([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalPhase, setModalPhase] = useState<'input' | 'done'>('input');
  const [passphrase, setPassphrase] = useState('');
  const [showPassphrase, setShowPassphrase] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // マウント時に crypto-context を取得し、未配布の連携者がいるか判定
  useEffect(() => {
    let aborted = false;
    (async () => {
      try {
        const res = await fetch('/api/digital/pins/crypto-context', {
          method: 'GET',
          credentials: 'same-origin',
        });
        const json = (await res.json().catch(() => null)) as {
          ok?: boolean;
          owner_kek_envelope?: OwnerKekEnvelopeData | null;
          recipients_needing_kek?: RecipientPublicKey[];
        } | null;
        if (aborted) return;
        const env = json?.ok ? json.owner_kek_envelope ?? null : null;
        const needing = json?.ok ? json.recipients_needing_kek ?? [] : [];
        // KEK 自体が無い（PIN 未登録）／未配布の連携者がいない → 何も出さない
        if (!env || needing.length === 0) {
          setStatus('hidden');
          return;
        }
        setOwnerKekEnvelope(env);
        setRecipients(needing);
        setStatus('pending');
        setModalOpen(true); // 訪問のたびに自動表示
      } catch {
        if (!aborted) setStatus('hidden');
      }
    })();
    return () => {
      aborted = true;
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setError(null);

    if (!passphrase || passphrase.length < 8) {
      setError('マスターコードを入力してください（8 文字以上）。');
      return;
    }
    if (!ownerKekEnvelope) return;

    setSubmitting(true);
    try {
      // パスフレーズで KEK を取り出し、連携者の公開鍵で暗号化
      let envelopes;
      try {
        envelopes = await buildRecipientKekEnvelopes({
          passphrase,
          ownerKekEnvelope,
          recipients,
        });
      } catch (err) {
        if (err instanceof PassphraseMismatchError) {
          setError(
            'マスターコードが正しくありません。パスワードを登録したときに設定したマスターコードをご確認ください。'
          );
          setSubmitting(false);
          return;
        }
        throw err;
      }

      if (envelopes.length === 0) {
        setError(
          '連携先の情報が読み取れませんでした。お手数ですがサポートまでご連絡ください。'
        );
        setSubmitting(false);
        return;
      }

      // 暗号文のみをサーバーへ送る
      const res = await fetch('/api/digital/pins/distribute-kek', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ recipient_kek_envelopes: envelopes }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) {
        setError(
          json?.detail ??
            'お渡しに失敗しました。時間をおいて再度お試しください。'
        );
        setSubmitting(false);
        return;
      }

      // 成功：パスフレーズを破棄して完了表示へ
      setPassphrase('');
      setShowPassphrase(false);
      setModalPhase('done');
      setSubmitting(false);
    } catch (err) {
      console.error('[KekDistributePrompt] submit failed', err);
      setError('エラーが発生しました。ブラウザを最新にして再度お試しください。');
      setSubmitting(false);
    }
  }

  if (status === 'loading' || status === 'hidden' || status === 'done') {
    return null;
  }

  const count = recipients.length;

  return (
    <>
      {/* 常時バナー（配布が完了するまで残る） */}
      <div className="flex flex-col gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-white">
            <KeyRound className="h-5 w-5 text-amber-600" aria-hidden="true" />
          </span>
          <div className="text-sm text-amber-900">
            <p className="font-semibold">
              引き継ぎ準備が必要な連携先が {count} 名います
            </p>
            <p className="mt-0.5 text-xs leading-relaxed text-amber-900/90">
              この連携先は、まだ端末パスワードを引き継ぐための準備ができていません。
              マスターコードを 1 回入力すると、お渡しが完了します。
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            setModalPhase('input');
            setError(null);
            setModalOpen(true);
          }}
          className="inline-flex flex-shrink-0 items-center justify-center gap-1.5 rounded-full bg-amber-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-amber-700"
        >
          <KeyRound className="h-4 w-4" aria-hidden="true" />
          今すぐ引き継ぎ準備をする
        </button>
      </div>

      {/* ポップアップ */}
      {modalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="kekdist-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget && !submitting) setModalOpen(false);
          }}
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 text-violet-700">
                  <KeyRound className="h-5 w-5" aria-hidden="true" />
                </span>
                <h2
                  id="kekdist-title"
                  className="text-lg font-bold text-slate-900"
                >
                  {modalPhase === 'input'
                    ? '連携先への引き継ぎ準備をしてください'
                    : 'お渡しが完了しました'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                disabled={submitting}
                aria-label="閉じる"
                className="rounded-full p-1 text-slate-500 hover:bg-slate-100 disabled:opacity-50"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            {modalPhase === 'input' && (
              <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                <div className="flex items-start gap-2 rounded-xl border border-violet-200 bg-violet-50 p-3 text-xs text-violet-900">
                  <Users
                    className="mt-0.5 h-4 w-4 flex-shrink-0 text-violet-600"
                    aria-hidden="true"
                  />
                  <p className="leading-relaxed">
                    新しく連携した <b>{count} 名</b>の連携先へ、端末パスワードを
                    万一の際に引き継ぐための準備をします。パスワードそのものは
                    変わりません。
                  </p>
                </div>

                <p className="text-sm leading-relaxed text-slate-700">
                  パスワードを登録したときに設定した<b>マスターコード</b>を入力してください。
                  入力内容はこのブラウザ内でのみ使われ、サーバーには送信されません。
                </p>

                <div>
                  <label
                    htmlFor="kekdist-passphrase"
                    className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-slate-700"
                  >
                    <Lock className="h-4 w-4 text-slate-400" aria-hidden="true" />
                    マスターコード
                  </label>
                  <div className="relative">
                    <input
                      id="kekdist-passphrase"
                      type={showPassphrase ? 'text' : 'password'}
                      value={passphrase}
                      onChange={(e) => setPassphrase(e.target.value)}
                      autoComplete="off"
                      spellCheck={false}
                      autoCapitalize="off"
                      autoCorrect="off"
                      disabled={submitting}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 pr-11 text-sm text-slate-800 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100 disabled:bg-slate-100"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassphrase((v) => !v)}
                      aria-label={showPassphrase ? '隠す' : '表示する'}
                      className="absolute inset-y-0 right-2 my-auto inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100"
                    >
                      {showPassphrase ? (
                        <EyeOff className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        <Eye className="h-4 w-4" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
                    <AlertCircle
                      className="mt-0.5 h-3.5 w-3.5 flex-shrink-0"
                      aria-hidden="true"
                    />
                    <span>{error}</span>
                  </div>
                )}

                <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    disabled={submitting}
                    className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                  >
                    後で
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-violet-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                  >
                    {submitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    ) : (
                      <KeyRound className="h-4 w-4" aria-hidden="true" />
                    )}
                    {submitting ? 'お渡し中…' : '引き継ぎ準備をする'}
                  </button>
                </div>

                <p className="flex items-start gap-1.5 rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
                  <ShieldCheck
                    className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-slate-500"
                    aria-hidden="true"
                  />
                  <span>
                    お渡しするのは強力な暗号化で守られた情報だけです。連携先がご存命中の本人の
                    パスワードを見ることはできません。
                  </span>
                </p>
              </form>
            )}

            {modalPhase === 'done' && (
              <div className="mt-4 space-y-4">
                <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
                  <CheckCircle2
                    className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600"
                    aria-hidden="true"
                  />
                  <p className="leading-relaxed">
                    連携先 {count} 名への引き継ぎ準備が完了しました。万一の際には、
                    この連携先が端末パスワードを引き継げます。
                  </p>
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setModalOpen(false);
                      setStatus('done');
                    }}
                    className="inline-flex items-center justify-center rounded-lg bg-slate-800 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-900"
                  >
                    閉じる
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
