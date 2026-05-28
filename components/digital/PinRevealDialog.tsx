'use client';

/**
 * PinRevealDialog
 *
 * 「PIN を表示する」ための一連のフロー:
 *
 *   [closed]
 *      │  open()
 *      ▼
 *   [stepup]          ← StepupDialog で OTP 再認証。成功で次へ。
 *      │
 *      ▼
 *   [passphrase]      ← マスターコード入力 → GET /api/digital/pins/[device_id]
 *      │              → decryptPin() で復号
 *      ▼
 *   [revealed]        ← 30秒カウントダウン付きで PIN 表示
 *                        「隠す」「コピー」「再度表示（カウントダウン延長）」操作
 *                        自動マスク後、state から PIN を破棄
 *
 * 🔒 セキュリティ:
 *   - サーバーには「復号済みの PIN」も「マスターコード」も送らない。
 *   - /api/digital/pins/[device_id]/copy-audit はクリップボードコピーの
 *     事実だけを通知する（body を送らない）。
 *   - 30秒で自動マスク後、メモリ上の平文 PIN を破棄（ベストエフォート）。
 *   - ブラウザのタブを離れた（visibilitychange hidden）時点で即時マスク。
 */

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  Loader2,
  ShieldCheck,
  Eye,
  EyeOff,
  Copy,
  Check,
  X,
  Lock,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { decryptPin, PinDecryptionError, type EncryptedPin } from '@/lib/crypto/pin';
import {
  decryptV2PinAsOwner,
  buildRecipientKekEnvelopes,
  PassphraseMismatchError,
} from '@/lib/crypto/pinV2Client';
import StepupDialog from './StepupDialog';

/**
 * 本人が v2 PIN を表示したついでに、KEK 未配布の連携者へバックグラウンドで配布する。
 * PIN 表示時はマスターコードが手元にある＝KEK を取り出せる、という性質を利用した
 * 「取りこぼし自動回収」。失敗しても PIN 表示の妨げにはしない（best-effort）。
 */
async function backgroundDistributeKek(
  passphrase: string,
  ownerKekEnvelope: { encrypted_kek: string; iv: string; salt: string } | null
) {
  if (!ownerKekEnvelope) return;
  try {
    const ctxRes = await fetch('/api/digital/pins/crypto-context', {
      method: 'GET',
      credentials: 'same-origin',
    });
    const ctx = await ctxRes.json().catch(() => null);
    if (!ctx?.ok) return;
    const recipients = ctx.recipients_needing_kek ?? [];
    if (recipients.length === 0) return;
    const envelopes = await buildRecipientKekEnvelopes({
      passphrase,
      ownerKekEnvelope,
      recipients,
    });
    if (envelopes.length === 0) return;
    await fetch('/api/digital/pins/distribute-kek', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({ recipient_kek_envelopes: envelopes }),
    });
  } catch (err) {
    console.warn('[PinRevealDialog] background KEK distribution failed', err);
  }
}

type Props = {
  open: boolean;
  deviceId: string;
  deviceName: string;
  userEmail: string | null;
  /**
   * step-up 認証を要求するかどうか（Phase 1 では server 側で false に固定）。
   * false のときは stepup phase をスキップして passphrase から開始する。
   */
  stepupEnabled: boolean;
  onClose: () => void;
};

type Phase = 'stepup' | 'passphrase' | 'revealed';

const AUTO_MASK_SECONDS = 30;

export default function PinRevealDialog({
  open,
  deviceId,
  deviceName,
  userEmail,
  stepupEnabled,
  onClose,
}: Props) {
  const initialPhase: Phase = stepupEnabled ? 'stepup' : 'passphrase';
  const [phase, setPhase] = useState<Phase>(initialPhase);
  const [passphrase, setPassphrase] = useState('');
  const [showPassphrase, setShowPassphrase] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 復号済み PIN（revealed phase でだけ保持。クローズ時に破棄）
  const [pin, setPin] = useState<string | null>(null);
  const [showPin, setShowPin] = useState(true);
  const [secondsLeft, setSecondsLeft] = useState(AUTO_MASK_SECONDS);
  const [copied, setCopied] = useState(false);

  const passInputRef = useRef<HTMLInputElement | null>(null);

  // open が true → false になった瞬間に機密値を破棄。
  // React 推奨パターン（prop の変化を検出して render 中に setState）を使う。
  //   https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (!open) {
      setPhase(initialPhase);
      setPassphrase('');
      setShowPassphrase(false);
      setPin(null);
      setShowPin(true);
      setSecondsLeft(AUTO_MASK_SECONDS);
      setError(null);
      setSubmitting(false);
      setCopied(false);
    }
  }

  // passphrase phase に遷移した瞬間にフォーカス
  useEffect(() => {
    if (phase === 'passphrase') {
      setTimeout(() => passInputRef.current?.focus(), 50);
    }
  }, [phase]);

  // 30秒カウントダウン（revealed 中かつ showPin=true のときだけ進む）。
  // 自動マスクの reset は setTimeout コールバック（= イベントハンドラ相当）で行うことで、
  // useEffect 本体での setState を避ける。
  useEffect(() => {
    if (phase !== 'revealed') return;
    if (!showPin) return;
    if (secondsLeft <= 0) return;

    const t = setTimeout(() => {
      if (secondsLeft <= 1) {
        // 1 → 0 の遷移：PIN を state から破棄
        setPin(null);
        setShowPin(false);
        setSecondsLeft(0);
      } else {
        setSecondsLeft((s) => s - 1);
      }
    }, 1000);
    return () => clearTimeout(t);
  }, [phase, showPin, secondsLeft]);

  // タブ離脱で即座にマスク
  useEffect(() => {
    if (phase !== 'revealed') return;
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') {
        setPin(null);
        setShowPin(false);
        setSecondsLeft(0);
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [phase]);

  // ESC で閉じる（submitting 中は無効）
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !submitting) onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, submitting, onClose]);

  if (!open) return null;

  // =================================================================
  // step-up 成功 → passphrase 入力へ
  // =================================================================
  function handleStepupVerified() {
    setError(null);
    setPhase('passphrase');
  }

  // =================================================================
  // passphrase 入力 → サーバーから暗号レコード取得 → 復号 → revealed
  // =================================================================
  async function handleDecrypt(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;

    const trimmed = passphrase.trim();
    if (trimmed.length === 0) {
      setError('マスターコードを入力してください。');
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch(`/api/digital/pins/${deviceId}`, {
        method: 'GET',
        credentials: 'same-origin',
      });
      const json = await res.json().catch(() => null);

      if (!res.ok || !json?.ok) {
        if (res.status === 401 && json?.error === 'stepup_required') {
          if (stepupEnabled) {
            // step-up が期限切れ → stepup からやり直し
            setPhase('stepup');
            setError('再認証の有効期限が切れました。もう一度メール認証を行ってください。');
          } else {
            // フラグ OFF 中に 401 が返ってきたら設定不整合。画面更新を促す。
            setError('セッションの状態を確認できませんでした。画面を更新してから再度お試しください。');
          }
        } else if (res.status === 404 && json?.error === 'pin_not_registered') {
          setError('このデバイスにはパスワードが登録されていません。');
        } else if (res.status === 404 && json?.error === 'device_not_found') {
          setError('対象デバイスが見つかりませんでした。');
        } else {
          setError(
            json?.detail ??
              'パスワードの取得に失敗しました。時間をおいて再度お試しください。'
          );
        }
        setSubmitting(false);
        return;
      }

      let plainPin: string;
      try {
        if (json.algorithm_version === 'v2') {
          // v2：本人 KEK エンベロープ → KEK → DEK → PIN の順で復号
          if (!json.owner_kek_envelope) {
            setError(
              'お客様の暗号化情報が見つかりませんでした。お手数ですがサポートまでご連絡ください。'
            );
            setSubmitting(false);
            return;
          }
          plainPin = await decryptV2PinAsOwner({
            record: {
              encrypted_pin: json.encrypted_pin,
              iv: json.iv,
              encrypted_dek: json.encrypted_dek,
              dek_iv: json.dek_iv,
            },
            ownerKekEnvelope: json.owner_kek_envelope,
            passphrase,
          });
        } else {
          // v1：マスターコードから直接 PIN を復号
          const record: EncryptedPin = {
            encrypted_pin: json.encrypted_pin,
            iv: json.iv,
            salt: json.salt,
            algorithm_version: json.algorithm_version,
          };
          plainPin = await decryptPin(record, passphrase);
        }
      } catch (err) {
        if (
          err instanceof PassphraseMismatchError ||
          err instanceof PinDecryptionError
        ) {
          setError('マスターコードが違うか、データが壊れています。もう一度入力してください。');
        } else {
          console.error('[PinRevealDialog] decrypt failed', err);
          setError('取り出しの処理中にエラーが発生しました。ブラウザを最新にしてお試しください。');
        }
        setSubmitting(false);
        return;
      }

      // v2 のときは、マスターコードを破棄する前に、KEK 未配布の連携者へ
      // バックグラウンドで配布（取りこぼし回収）。表示の妨げにはしない。
      if (json.algorithm_version === 'v2') {
        void backgroundDistributeKek(passphrase, json.owner_kek_envelope);
      }

      // 復号成功：マスターコードは state から破棄して revealed へ
      setPassphrase('');
      setShowPassphrase(false);
      setPin(plainPin);
      setShowPin(true);
      setSecondsLeft(AUTO_MASK_SECONDS);
      setCopied(false);
      setPhase('revealed');
      setSubmitting(false);
    } catch (err) {
      console.error('[PinRevealDialog] fetch failed', err);
      setError('ネットワークエラーが発生しました。');
      setSubmitting(false);
    }
  }

  // =================================================================
  // コピー（revealed 中のみ押せる）
  // =================================================================
  async function handleCopy() {
    if (!pin) return;
    try {
      await navigator.clipboard.writeText(pin);
      setCopied(true);

      // 監査ログ（サーバー側で step-up 通過を再チェック）
      fetch(`/api/digital/pins/${deviceId}/copy-audit`, {
        method: 'POST',
        credentials: 'same-origin',
      }).catch((err) => {
        // ここでの失敗は UI を止めない（ユーザーは既にコピー済み）
        console.warn('[PinRevealDialog] copy-audit failed', err);
      });

      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('[PinRevealDialog] clipboard write failed', err);
      setError(
        'クリップボードへのコピーに失敗しました。パスワードを手動で控えてください。'
      );
    }
  }

  // =================================================================
  // 再表示（カウントダウンリセット、PIN が既に破棄されているなら再復号へ戻る）
  // =================================================================
  function handleReshow() {
    if (!pin) {
      // PIN を破棄済み → passphrase からやり直し
      setPhase('passphrase');
      setError(null);
      return;
    }
    setShowPin(true);
    setSecondsLeft(AUTO_MASK_SECONDS);
  }

  return (
    <>
      {/* step-up OTP */}
      {phase === 'stepup' && (
        <StepupDialog
          open
          purpose="pin_reveal"
          email={userEmail}
          title={`${deviceName} のパスワードを表示する前に再認証`}
          description="パスワードを表示するには、ご登録のメールアドレス宛に届く6桁コードで再認証してください。認証後、次の画面でマスターコードを入力します。"
          onClose={onClose}
          onVerified={handleStepupVerified}
        />
      )}

      {/* passphrase 入力 or revealed */}
      {(phase === 'passphrase' || phase === 'revealed') && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="pinreveal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget && !submitting) onClose();
          }}
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  <ShieldCheck className="h-5 w-5" aria-hidden="true" />
                </span>
                <h2
                  id="pinreveal-title"
                  className="text-lg font-bold text-slate-900"
                >
                  {phase === 'passphrase' ? 'マスターコードで取り出し' : 'パスワードを表示中'}
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                aria-label="閉じる"
                className="rounded-full p-1 text-slate-500 hover:bg-slate-100 disabled:opacity-50"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <div className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
              <span className="text-slate-400">対象デバイス：</span>
              <span className="ml-1 font-medium text-slate-800">
                {deviceName}
              </span>
            </div>

            {/* ===================================================== */}
            {/* Phase: passphrase                                     */}
            {/* ===================================================== */}
            {phase === 'passphrase' && (
              <form onSubmit={handleDecrypt} className="mt-4 space-y-3">
                <p className="text-sm leading-relaxed text-slate-700">
                  パスワード登録時に設定した<b>マスターコード</b>を入力してください。
                  取り出しはお使いのブラウザ内で行われ、サーバーには送信されません。
                </p>

                <label
                  htmlFor="reveal-passphrase"
                  className="flex items-center gap-1.5 text-sm font-semibold text-slate-700"
                >
                  <Lock className="h-4 w-4 text-slate-400" aria-hidden="true" />
                  マスターコード
                </label>

                <div className="relative">
                  <input
                    id="reveal-passphrase"
                    ref={passInputRef}
                    type={showPassphrase ? 'text' : 'password'}
                    value={passphrase}
                    onChange={(e) => setPassphrase(e.target.value)}
                    autoComplete="off"
                    spellCheck={false}
                    autoCapitalize="off"
                    autoCorrect="off"
                    disabled={submitting}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 pr-11 text-sm text-slate-800 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-100"
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

                {error && (
                  <p className="rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">
                    {error}
                  </p>
                )}

                <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={submitting}
                    className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                  >
                    キャンセル
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || passphrase.length === 0}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                  >
                    {submitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    ) : (
                      <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                    )}
                    {submitting ? '取り出し中…' : '取り出して表示'}
                  </button>
                </div>

                <div className="pt-1 text-center">
                  <Link
                    href="/digital/devices/passphrase-reset"
                    className="text-xs text-slate-500 underline hover:text-slate-700"
                  >
                    マスターコードをお忘れですか？
                  </Link>
                </div>
              </form>
            )}

            {/* ===================================================== */}
            {/* Phase: revealed                                       */}
            {/* ===================================================== */}
            {phase === 'revealed' && (
              <div className="mt-4 space-y-3">
                <div className="flex items-start gap-2 rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900">
                  <AlertTriangle
                    className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600"
                    aria-hidden="true"
                  />
                  <p className="leading-relaxed">
                    画面の覗き見に注意してください。表示は{AUTO_MASK_SECONDS}秒で自動的に隠れます。
                    他の画面に切り替えた瞬間にも自動で隠れます。
                  </p>
                </div>

                <div
                  className="rounded-xl border-2 border-emerald-200 bg-emerald-50/60 px-4 py-5 text-center"
                  aria-live="polite"
                >
                  <p className="text-[10px] font-medium uppercase tracking-wider text-emerald-700">
                    パスワード
                  </p>
                  <p
                    className="mt-2 select-all break-all font-mono text-2xl tracking-[0.2em] text-slate-900"
                    data-testid="revealed-pin"
                  >
                    {showPin && pin ? pin : '••••••••'}
                  </p>

                  {showPin && pin && secondsLeft > 0 && (
                    <p className="mt-2 text-[10px] text-emerald-700">
                      あと <b>{secondsLeft}</b> 秒で自動的に隠れます
                    </p>
                  )}
                  {!showPin && (
                    <p className="mt-2 text-[10px] text-slate-500">
                      パスワードは非表示になりました
                    </p>
                  )}
                </div>

                {error && (
                  <p className="rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">
                    {error}
                  </p>
                )}

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {/* 表示 / 隠す トグル */}
                  {showPin && pin ? (
                    <button
                      type="button"
                      onClick={() => {
                        setShowPin(false);
                        setSecondsLeft(0);
                      }}
                      className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    >
                      <EyeOff className="h-3.5 w-3.5" aria-hidden="true" />
                      隠す
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleReshow}
                      className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    >
                      <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                      {pin ? '再表示' : 'もう一度入力'}
                    </button>
                  )}

                  {/* コピー */}
                  <button
                    type="button"
                    onClick={handleCopy}
                    disabled={!pin || !showPin}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
                        コピー済み
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                        コピー
                      </>
                    )}
                  </button>

                  {/* 閉じる */}
                  <button
                    type="button"
                    onClick={onClose}
                    className="col-span-2 inline-flex items-center justify-center gap-1.5 rounded-lg bg-slate-800 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-900 sm:col-span-1"
                  >
                    閉じる
                  </button>
                </div>

                <p className="pt-1 text-[10px] leading-relaxed text-slate-400">
                  このパスワード表示はブラウザ内でだけ扱われます。閉じると画面から破棄されます。
                  コピー操作は監査ログに記録されます。
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
