'use client';

/**
 * PinEditDialog
 *
 * 「PIN を更新する」モーダル（v2 エンベロープ暗号化方式）。
 *
 *   [closed]
 *     │  open()
 *     ▼
 *   [stepup]         ← StepupDialog で OTP 再認証（purpose='pin_update'）
 *     │
 *     ▼
 *   [form]           ← crypto-context 取得 → 新 PIN とパスフレーズを入力
 *     │              → buildV2PinPayload で暗号化 → PATCH /api/digital/pins/[device_id]
 *     ▼
 *   [done]           ← 完了表示 → 親に success 通知して閉じる
 *
 * 🔒 セキュリティ:
 *   - サーバーには平文 PIN / 平文パスフレーズ / 生の鍵を一切送らない。
 *   - PATCH body は暗号文のみ（V2PinPayload + device_id）。
 *   - 成功後、平文 state を破棄。
 *
 * 動作モード（crypto-context で判定）：
 *   - 初回モード：まだ KEK が無い。新しいパスフレーズを設定する（v1→v2 移行を含む）。
 *   - 既存モード：既に KEK がある。最初の PIN 登録時と同じパスフレーズを使う。
 */

import { useEffect, useMemo, useState } from 'react';
import {
  Loader2,
  ShieldCheck,
  Eye,
  EyeOff,
  Save,
  X,
  KeyRound,
  Lock,
  AlertTriangle,
  CheckCircle2,
  Users,
  RefreshCw,
} from 'lucide-react';
import { validatePassphrase } from '@/lib/crypto/pin';
import {
  buildV2PinPayload,
  PassphraseMismatchError,
  type OwnerKekEnvelopeData,
  type RecipientPublicKey,
} from '@/lib/crypto/pinV2Client';
import StepupDialog from './StepupDialog';

type Props = {
  open: boolean;
  deviceId: string;
  deviceName: string;
  userEmail: string | null;
  /**
   * step-up 認証を要求するかどうか（Phase 1 では server 側で false に固定）。
   * false のときは stepup phase をスキップして form から開始する。
   */
  stepupEnabled: boolean;
  onClose: () => void;
  /** 更新成功後に呼ばれる（親側でページ再読み込み等） */
  onUpdated?: () => void;
};

type Phase = 'stepup' | 'form' | 'done';

type FormState = {
  pin: string;
  pin_confirm: string;
  passphrase: string;
  passphrase_confirm: string;
  acknowledge_backup: boolean;
};

const initialForm: FormState = {
  pin: '',
  pin_confirm: '',
  passphrase: '',
  passphrase_confirm: '',
  acknowledge_backup: false,
};

export default function PinEditDialog({
  open,
  deviceId,
  deviceName,
  userEmail,
  stepupEnabled,
  onClose,
  onUpdated,
}: Props) {
  const initialPhase: Phase = stepupEnabled ? 'stepup' : 'form';
  const [phase, setPhase] = useState<Phase>(initialPhase);
  const [form, setForm] = useState<FormState>(initialForm);
  const [showPin, setShowPin] = useState(false);
  const [showPassphrase, setShowPassphrase] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  // crypto-context（KEK の有無 + 連携者の公開鍵）
  const [cryptoLoading, setCryptoLoading] = useState(true);
  const [cryptoError, setCryptoError] = useState<string | null>(null);
  const [ownerKekEnvelope, setOwnerKekEnvelope] =
    useState<OwnerKekEnvelopeData | null>(null);
  const [recipients, setRecipients] = useState<RecipientPublicKey[]>([]);
  const [reloadKey, setReloadKey] = useState(0);

  // 既に KEK がある＝既存のパスフレーズを使う必要がある
  const hasExistingKek = ownerKekEnvelope !== null;

  // open の切り替わりでリセット（React 推奨: prop-diff in render）
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (!open) {
      setPhase(initialPhase);
      setForm(initialForm);
      setShowPin(false);
      setShowPassphrase(false);
      setSubmitting(false);
      setErrors({});
      setGeneralError(null);
      setCryptoLoading(true);
      setCryptoError(null);
      setOwnerKekEnvelope(null);
      setRecipients([]);
    }
  }

  // crypto-context を取得（モーダルが開いている間に裏で取得しておく）
  useEffect(() => {
    if (!open) return;
    let aborted = false;
    setCryptoLoading(true);
    setCryptoError(null);
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
        if (!res.ok || !json?.ok) {
          setCryptoError(
            '準備情報の取得に失敗しました。再読み込みしてください。'
          );
          setCryptoLoading(false);
          return;
        }
        setOwnerKekEnvelope(json.owner_kek_envelope ?? null);
        setRecipients(json.recipients_needing_kek ?? []);
        setCryptoLoading(false);
      } catch (err) {
        if (aborted) return;
        console.error('[PinEditDialog] crypto-context fetch failed', err);
        setCryptoError(
          '準備情報の取得中にエラーが発生しました。再読み込みしてください。'
        );
        setCryptoLoading(false);
      }
    })();
    return () => {
      aborted = true;
    };
  }, [open, reloadKey]);

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const passphraseIssues = useMemo(
    () => validatePassphrase(form.passphrase),
    [form.passphrase]
  );

  function validateAll(): Record<string, string> {
    const e: Record<string, string> = {};
    const pin = form.pin;
    if (!pin) {
      e.pin = 'パスワードを入力してください。';
    } else if (pin.length < 4) {
      e.pin = 'パスワードは4文字以上で入力してください。';
    } else if (pin.length > 16) {
      e.pin = 'パスワードは16文字以内で入力してください。';
    } else if (/\s/.test(pin)) {
      e.pin = 'パスワードに空白は使えません。';
    }
    if (pin !== form.pin_confirm) {
      e.pin_confirm = '確認用のパスワードが一致しません。';
    }

    if (hasExistingKek) {
      // 既存モード：強度チェックはしない（設定済みのものを入力するだけ）
      if (form.passphrase.length === 0) {
        e.passphrase = 'マスターコードを入力してください。';
      }
    } else {
      // 初回モード：強度チェック + 確認入力 + 保管確認
      const ppIssues = validatePassphrase(form.passphrase);
      if (ppIssues.length > 0) {
        e.passphrase = ppIssues.join(' / ');
      }
      if (form.passphrase !== form.passphrase_confirm) {
        e.passphrase_confirm = '確認用のマスターコードが一致しません。';
      }
      if (!form.acknowledge_backup) {
        e.acknowledge_backup =
          'マスターコードを安全に保管したことを確認してください。';
      }
    }
    return e;
  }

  function wipeSensitiveState() {
    setForm(initialForm);
  }

  function handleStepupVerified() {
    setGeneralError(null);
    setPhase('form');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;

    setErrors({});
    setGeneralError(null);

    const validation = validateAll();
    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      return;
    }

    setSubmitting(true);
    try {
      // 1) クライアントで v2 エンベロープ暗号化
      let payload;
      try {
        payload = await buildV2PinPayload({
          pin: form.pin,
          passphrase: form.passphrase,
          ownerKekEnvelope,
          recipients,
        });
      } catch (err) {
        if (err instanceof PassphraseMismatchError) {
          setErrors({
            passphrase:
              '入力されたマスターコードが、最初にパスワードを登録したときのものと一致しません。',
          });
          setSubmitting(false);
          return;
        }
        throw err;
      }

      // 2) PATCH：暗号文のみサーバーに送る
      const res = await fetch(`/api/digital/pins/${deviceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ device_id: deviceId, ...payload }),
      });
      const json = await res.json().catch(() => null);

      if (!res.ok || !json?.ok) {
        if (res.status === 401 && json?.error === 'stepup_required') {
          if (stepupEnabled) {
            setPhase('stepup');
            setGeneralError(
              '再認証の有効期限が切れました。もう一度メール認証を行ってください。'
            );
          } else {
            setGeneralError(
              'セッションの状態を確認できませんでした。画面を更新してから再度お試しください。'
            );
          }
        } else if (
          json?.error === 'kek_conflict' ||
          json?.error === 'kek_missing'
        ) {
          setGeneralError(
            '保護状態が変わりました。一度この画面を閉じて、もう一度開いてからお試しください。'
          );
        } else if (json?.error === 'pin_not_registered') {
          setGeneralError(
            'このデバイスにはパスワードが未登録です。登録画面から進めてください。'
          );
        } else if (json?.error === 'forbidden_field') {
          setGeneralError('暗号化に失敗したようです。ページを再読込してください。');
        } else if (json?.error === 'validation_failed') {
          setGeneralError('入力内容をサーバー側で受け付けられませんでした。');
        } else {
          setGeneralError(
            'パスワードの更新に失敗しました。時間をおいて再度お試しください。'
          );
        }
        setSubmitting(false);
        return;
      }

      // 3) 成功：state から平文を破棄して done 表示
      wipeSensitiveState();
      setPhase('done');
      setSubmitting(false);
      onUpdated?.();
    } catch (err) {
      console.error('[PinEditDialog] submit failed', err);
      setGeneralError(
        'パスワードの暗号化中にエラーが発生しました。ブラウザを最新にしてお試しください。'
      );
      setSubmitting(false);
    }
  }

  if (!open) return null;

  return (
    <>
      {/* step-up OTP */}
      {phase === 'stepup' && (
        <StepupDialog
          open
          purpose="pin_update"
          email={userEmail}
          title={`${deviceName} のパスワードを更新する前に再認証`}
          description="パスワードを更新するには、ご登録のメールアドレス宛に届く6桁コードで再認証してください。認証後、新しいパスワードとマスターコードを入力します。"
          onClose={onClose}
          onVerified={handleStepupVerified}
        />
      )}

      {(phase === 'form' || phase === 'done') && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="pinedit-title"
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget && !submitting) onClose();
          }}
        >
          <div className="my-auto max-h-[calc(100vh-2rem)] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  <ShieldCheck className="h-5 w-5" aria-hidden="true" />
                </span>
                <h2
                  id="pinedit-title"
                  className="text-lg font-bold text-slate-900"
                >
                  {phase === 'form' ? 'パスワードを更新' : 'パスワードを更新しました'}
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
              <span className="ml-1 font-medium text-slate-800">{deviceName}</span>
            </div>

            {/* form 中：crypto-context の状態で出し分け */}
            {phase === 'form' && cryptoLoading && (
              <div className="mt-6 flex items-center justify-center gap-2 py-8 text-sm text-slate-500">
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                準備しています…
              </div>
            )}

            {phase === 'form' && !cryptoLoading && cryptoError && (
              <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
                <p className="font-medium">{cryptoError}</p>
                <button
                  type="button"
                  onClick={() => setReloadKey((k) => k + 1)}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-rose-300 bg-white px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-50"
                >
                  <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                  再読み込み
                </button>
              </div>
            )}

            {phase === 'form' && !cryptoLoading && !cryptoError && (
              <form
                onSubmit={handleSubmit}
                className="mt-4 space-y-4"
                autoComplete="off"
              >
                {/* パスフレーズに関する案内（モードで出し分け） */}
                {hasExistingKek ? (
                  <div className="flex items-start gap-2 rounded-xl border border-sky-200 bg-sky-50 p-3 text-xs text-sky-900">
                    <KeyRound
                      className="mt-0.5 h-4 w-4 flex-shrink-0 text-sky-600"
                      aria-hidden="true"
                    />
                    <div className="space-y-1 leading-relaxed">
                      <p className="font-medium">
                        マスターコードは設定済みのものを入力してください
                      </p>
                      <p className="text-sky-900/90">
                        すべてのパスワードは同じマスターコードで保護されています。
                        最初のパスワード登録時に決めたマスターコードを入力してください。
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-2 rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900">
                    <AlertTriangle
                      className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600"
                      aria-hidden="true"
                    />
                    <div className="space-y-1 leading-relaxed">
                      <p className="font-medium">
                        ここで決めるマスターコードは、今後の全パスワード共通になります
                      </p>
                      <p className="text-amber-900/90">
                        新しいマスターコードを忘れると復元できません。
                        大切な方・手帳・パスワード管理アプリに必ず保管してください。
                      </p>
                    </div>
                  </div>
                )}

                {/* 連携先がいる場合、引き継ぎ対象を明示 */}
                {recipients.length > 0 && (
                  <div className="flex items-start gap-2 rounded-xl border border-violet-200 bg-violet-50 p-3 text-xs text-violet-900">
                    <Users
                      className="mt-0.5 h-4 w-4 flex-shrink-0 text-violet-600"
                      aria-hidden="true"
                    />
                    <p className="leading-relaxed">
                      更新後のパスワードは、万一の際に{' '}
                      <b>{recipients.length} 名</b>の連携先へ
                      引き継げるよう暗号化されます。
                    </p>
                  </div>
                )}

                {generalError && (
                  <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
                    {generalError}
                  </div>
                )}

                {/* PIN */}
                <SecretField
                  label="新しいパスワード"
                  required
                  htmlFor="edit-pin"
                  icon={<KeyRound className="h-4 w-4 text-slate-400" aria-hidden="true" />}
                  hint="4〜16文字。画面ロックや SIM のロック解除に使うパスワードを入力してください。"
                  error={errors.pin}
                  value={form.pin}
                  onChange={(v) => setField('pin', v)}
                  show={showPin}
                  onToggleShow={() => setShowPin((v) => !v)}
                  autoComplete="new-password"
                />
                <SecretField
                  label="新しいパスワードの確認"
                  required
                  htmlFor="edit-pin-confirm"
                  icon={<KeyRound className="h-4 w-4 text-slate-400" aria-hidden="true" />}
                  error={errors.pin_confirm}
                  value={form.pin_confirm}
                  onChange={(v) => setField('pin_confirm', v)}
                  show={showPin}
                  onToggleShow={() => setShowPin((v) => !v)}
                  autoComplete="new-password"
                />

                <div className="h-px bg-slate-200" aria-hidden="true" />

                {/* Passphrase */}
                <SecretField
                  label={
                    hasExistingKek
                      ? '設定済みのマスターコード'
                      : '新しいマスターコード'
                  }
                  required
                  htmlFor="edit-pass"
                  icon={<Lock className="h-4 w-4 text-slate-400" aria-hidden="true" />}
                  hint={
                    hasExistingKek
                      ? '最初にパスワードを登録したときに決めたマスターコードを入力してください。'
                      : '8文字以上・数字のみ不可。ログインパスワードとは別にしてください。'
                  }
                  error={errors.passphrase}
                  value={form.passphrase}
                  onChange={(v) => setField('passphrase', v)}
                  show={showPassphrase}
                  onToggleShow={() => setShowPassphrase((v) => !v)}
                  autoComplete="new-password"
                />

                {/* 初回モードのみ：強度ヒント + 確認入力 + 保管確認 */}
                {!hasExistingKek && (
                  <>
                    {form.passphrase.length > 0 &&
                      passphraseIssues.length > 0 && (
                        <ul className="-mt-2 ml-1 list-inside list-disc space-y-0.5 text-xs text-amber-700">
                          {passphraseIssues.map((msg) => (
                            <li key={msg}>{msg}</li>
                          ))}
                        </ul>
                      )}
                    <SecretField
                      label="新しいマスターコードの確認"
                      required
                      htmlFor="edit-pass-confirm"
                      icon={
                        <Lock className="h-4 w-4 text-slate-400" aria-hidden="true" />
                      }
                      error={errors.passphrase_confirm}
                      value={form.passphrase_confirm}
                      onChange={(v) => setField('passphrase_confirm', v)}
                      show={showPassphrase}
                      onToggleShow={() => setShowPassphrase((v) => !v)}
                      autoComplete="new-password"
                    />

                    <div className="rounded-xl border border-slate-200 bg-white p-3">
                      <label className="flex cursor-pointer items-start gap-2 text-sm text-slate-700">
                        <input
                          type="checkbox"
                          checked={form.acknowledge_backup}
                          onChange={(e) =>
                            setField('acknowledge_backup', e.target.checked)
                          }
                          className="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                        />
                        <span>
                          新しいマスターコードを、ご自身が取り出せる場所に保管しました。
                        </span>
                      </label>
                      {errors.acknowledge_backup && (
                        <p className="mt-1 ml-6 text-xs text-rose-600">
                          {errors.acknowledge_backup}
                        </p>
                      )}
                    </div>
                  </>
                )}

                <p className="text-right text-[10px] text-slate-400">
                  強力な暗号化方式で保護されています
                </p>

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
                    disabled={submitting}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                  >
                    {submitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    ) : (
                      <Save className="h-4 w-4" aria-hidden="true" />
                    )}
                    {submitting ? '暗号化して更新中…' : '新しいパスワードで更新'}
                  </button>
                </div>
              </form>
            )}

            {phase === 'done' && (
              <div className="mt-4 space-y-4">
                <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
                  <CheckCircle2
                    className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600"
                    aria-hidden="true"
                  />
                  <p className="leading-relaxed">
                    {hasExistingKek
                      ? 'パスワードを新しい値で差し替えました。表示には、これまでと同じマスターコードをお使いください。'
                      : 'パスワードを新しい値で差し替えました。次回からは、設定したマスターコードを使って表示してください。'}
                  </p>
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={onClose}
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

function SecretField({
  label,
  required,
  htmlFor,
  hint,
  error,
  value,
  onChange,
  show,
  onToggleShow,
  icon,
  autoComplete,
}: {
  label: string;
  required?: boolean;
  htmlFor: string;
  hint?: string;
  error?: string;
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  onToggleShow: () => void;
  icon?: React.ReactNode;
  autoComplete?: string;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-slate-700"
      >
        {icon}
        {label}
        {required && (
          <span className="rounded bg-rose-50 px-1.5 py-0.5 text-xs font-medium text-rose-700">
            必須
          </span>
        )}
      </label>
      {hint && <p className="mb-1.5 text-xs text-slate-500">{hint}</p>}
      <div className="relative">
        <input
          id={htmlFor}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete ?? 'off'}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 pr-11 text-sm text-slate-800 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
        />
        <button
          type="button"
          onClick={onToggleShow}
          aria-label={show ? '隠す' : '表示する'}
          className="absolute inset-y-0 right-2 my-auto inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100"
        >
          {show ? (
            <EyeOff className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Eye className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
      </div>
      {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
    </div>
  );
}
