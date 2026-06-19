'use client';

/**
 * PinRegisterForm
 *
 * ロック解除 PIN を登録するクライアント専用フォーム（v2 エンベロープ暗号化方式）。
 *
 * 🔒 セキュリティの前提：
 *   - 平文 PIN と平文マスターコードは **このコンポーネントから外に出さない**。
 *     送信前に lib/crypto/pinV2Client.ts の buildV2PinPayload で暗号化し、
 *     暗号文（V2PinPayload）だけを POST する。
 *   - PIN は DEK で、DEK は KEK で、KEK はマスターコード（本人用）と連携者の公開鍵
 *     （連携者用）で暗号化される。これにより、万一の際に連携者へ PIN を引き継げる。
 *   - マスターコードはログインパスワードと **別物**。ユーザーが自分で保管する。
 *
 * 動作モード（マウント時に /api/digital/pins/crypto-context で判定）：
 *   - 初回モード   ：まだ KEK が無い。新しいマスターコードを設定する。
 *   - 既存モード   ：既に KEK がある。最初の PIN 登録時と同じマスターコードを使う。
 */

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Loader2,
  AlertTriangle,
  Eye,
  EyeOff,
  Save,
  KeyRound,
  Lock,
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

type Props = {
  deviceId: string;
  deviceName: string;
};

type FormState = {
  pin: string;
  pin_confirm: string;
  passphrase: string;
  passphrase_confirm: string;
  acknowledge_backup: boolean;
};

const initialState: FormState = {
  pin: '',
  pin_confirm: '',
  passphrase: '',
  passphrase_confirm: '',
  acknowledge_backup: false,
};

export default function PinRegisterForm({ deviceId, deviceName }: Props) {
  const router = useRouter();

  // crypto-context（KEK の有無 + 連携者の公開鍵）
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [ownerKekEnvelope, setOwnerKekEnvelope] =
    useState<OwnerKekEnvelopeData | null>(null);
  const [recipients, setRecipients] = useState<RecipientPublicKey[]>([]);

  const [form, setForm] = useState<FormState>(initialState);
  const [showPin, setShowPin] = useState(false);
  const [showPassphrase, setShowPassphrase] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  // 既に KEK がある＝既存のマスターコードを使う必要がある
  const hasExistingKek = ownerKekEnvelope !== null;

  // ── crypto-context を取得 ────────────────────────────────────────
  const [reloadKey, setReloadKey] = useState(0);
  useEffect(() => {
    let aborted = false;
    setLoading(true);
    setLoadError(null);
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
          setLoadError(
            '準備情報の取得に失敗しました。通信環境をご確認のうえ、再読み込みしてください。'
          );
          setLoading(false);
          return;
        }
        setOwnerKekEnvelope(json.owner_kek_envelope ?? null);
        setRecipients(json.recipients_needing_kek ?? []);
        setLoading(false);
      } catch (err) {
        if (aborted) return;
        console.error('[PinRegisterForm] crypto-context fetch failed', err);
        setLoadError(
          '準備情報の取得中にエラーが発生しました。再読み込みしてください。'
        );
        setLoading(false);
      }
    })();
    return () => {
      aborted = true;
    };
  }, [reloadKey]);

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  // マスターコード強度のヒント（初回モードのみ表示）
  const passphraseIssues = useMemo(
    () => validatePassphrase(form.passphrase),
    [form.passphrase]
  );

  function validateAll(): Record<string, string> {
    const e: Record<string, string> = {};

    // パスワード: 4〜16文字、空白不可
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

    // マスターコード
    if (hasExistingKek) {
      // 既存モード：強度チェックはしない（既に設定済みのものを入力するだけ）
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
    setForm(initialState);
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
      // 1) クライアントで v2 エンベロープ暗号化。pin と passphrase は外に出さない。
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

      // 2) 暗号文のみをサーバーに送る
      const res = await fetch('/api/digital/pins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ device_id: deviceId, ...payload }),
      });
      const json = await res.json().catch(() => null);

      if (!res.ok || !json?.ok) {
        if (json?.error === 'kek_conflict' || json?.error === 'kek_missing') {
          setGeneralError(
            '暗号鍵の状態が変わりました。お手数ですが「再読み込み」を押してからもう一度お試しください。'
          );
        } else if (json?.error === 'validation_failed') {
          setGeneralError(
            '入力内容をサーバー側で受け付けられませんでした。ページを再読込して再度お試しください。'
          );
        } else if (json?.error === 'pin_already_exists') {
          setGeneralError(
            json.detail ??
              'このデバイスには既にパスワードが登録されています。更新画面からご確認ください。'
          );
        } else if (json?.error === 'forbidden_field') {
          setGeneralError('暗号化に失敗したようです。ページを再読込してください。');
        } else if (json?.error === 'device_not_found') {
          setGeneralError(
            '対象デバイスが見つかりませんでした。画面を再読込してください。'
          );
        } else if (json?.error === 'plan_required') {
          setGeneralError(
            json.detail ??
              'スマホ・パソコン のパスワード保管機能は有料プランのみご利用いただけます。'
          );
        } else {
          setGeneralError(
            'パスワードの保存に失敗しました。時間をおいて再度お試しください。'
          );
        }
        setSubmitting(false);
        return;
      }

      // 3) 成功：平文を state から破棄してから遷移
      wipeSensitiveState();
      router.push('/digital/devices');
      router.refresh();
    } catch (err) {
      console.error('[PinRegisterForm] submit failed', err);
      setGeneralError(
        'パスワードの暗号化中にエラーが発生しました。ブラウザが最新かを確認し、HTTPS または localhost でお試しください。'
      );
      setSubmitting(false);
    }
  }

  // ── 読み込み中 ──────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white p-10 text-sm text-slate-500">
        <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
        準備しています…
      </div>
    );
  }

  // ── 読み込み失敗 ────────────────────────────────────────────────
  if (loadError) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-800">
        <p className="font-medium">{loadError}</p>
        <button
          type="button"
          onClick={() => setReloadKey((k) => k + 1)}
          className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-rose-300 bg-white px-4 py-2 text-sm font-medium text-rose-700 hover:bg-rose-50"
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          再読み込み
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" autoComplete="off">
      {/* マスターコードに関する案内（モードで出し分け） */}
      {hasExistingKek ? (
        <div className="rounded-xl border border-sky-200 bg-sky-50 p-4 text-sm text-sky-900">
          <div className="flex items-start gap-3">
            <KeyRound
              className="mt-0.5 h-5 w-5 flex-shrink-0 text-sky-600"
              aria-hidden="true"
            />
            <div className="space-y-1">
              <p className="font-semibold">
                最初に設定したマスターコードを入力してください
              </p>
              <p className="leading-relaxed text-sky-900/90">
                すでに別のデバイスでパスワードを登録済みです。同じマスターコードで
                すべてのパスワードをまとめて保護しています。
                <b>最初のパスワード登録時に決めたマスターコード</b>を入力してください。
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 sm:p-5">
          <div className="flex items-start gap-2.5">
            <AlertTriangle
              className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600"
              aria-hidden="true"
            />
            <div className="space-y-2">
              <p className="font-semibold">
                マスターコードを忘れると取り出せません
              </p>
              <p className="leading-relaxed text-amber-900/90">
                マスターコードはログインパスワードとは別物で、運営やサポートでも復元できません。
                メモ帳・パスワード管理アプリ・大切な方への封書など、ご自身で管理できる場所に必ず保管してください。
                今後登録するすべてのパスワードで共通して使用します。
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 連携先がいる場合、引き継ぎ対象を明示 */}
      {recipients.length > 0 && (
        <div className="flex gap-3 rounded-xl border border-violet-200 bg-violet-50 p-4 text-sm text-violet-900">
          <Users
            className="mt-0.5 h-5 w-5 flex-shrink-0 text-violet-600"
            aria-hidden="true"
          />
          <p className="leading-relaxed">
            このパスワードは、万一の際に <b>{recipients.length} 名</b>の連携先へ
            引き継げる形で暗号化されます。
            連携先がご存命中の本人のパスワードを見ることはできません。
          </p>
        </div>
      )}

      {generalError && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {generalError}
          {generalError.includes('再読み込み') && (
            <button
              type="button"
              onClick={() => setReloadKey((k) => k + 1)}
              className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-rose-300 bg-white px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-50"
            >
              <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
              再読み込み
            </button>
          )}
        </div>
      )}

      {/* 対象デバイス（変更不可の参考表示） */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
        <span className="text-slate-400">対象デバイス</span>
        <p className="mt-0.5 text-sm font-semibold text-slate-800">
          {deviceName}
        </p>
      </div>

      {/* パスワード */}
      <SecretField
        label="パスワード"
        required
        htmlFor="pin"
        icon={<KeyRound className="h-4 w-4 text-slate-400" aria-hidden="true" />}
        hint="画面ロックや SIM のロック解除に使うパスワードを入力してください。4〜16文字。"
        error={errors.pin}
        value={form.pin}
        onChange={(v) => setField('pin', v)}
        show={showPin}
        onToggleShow={() => setShowPin((v) => !v)}
        autoComplete="new-password"
        inputMode="text"
      />

      <SecretField
        label="パスワードの確認入力"
        required
        htmlFor="pin_confirm"
        icon={<KeyRound className="h-4 w-4 text-slate-400" aria-hidden="true" />}
        error={errors.pin_confirm}
        value={form.pin_confirm}
        onChange={(v) => setField('pin_confirm', v)}
        show={showPin}
        onToggleShow={() => setShowPin((v) => !v)}
        autoComplete="new-password"
        inputMode="text"
      />

      <div className="h-px bg-slate-200" aria-hidden="true" />

      {/* マスターコード */}
      <SecretField
        label={hasExistingKek ? '設定済みのマスターコード' : 'マスターコード'}
        required
        htmlFor="passphrase"
        icon={<Lock className="h-4 w-4 text-slate-400" aria-hidden="true" />}
        hint={
          hasExistingKek
            ? '最初にパスワードを登録したときに決めたマスターコードを入力してください。'
            : 'パスワードを取り出すためのマスターコードです（8文字以上・数字のみ不可）。ログインパスワードとは別にしてください。'
        }
        error={errors.passphrase}
        value={form.passphrase}
        onChange={(v) => setField('passphrase', v)}
        show={showPassphrase}
        onToggleShow={() => setShowPassphrase((v) => !v)}
        autoComplete="new-password"
        inputMode="text"
      />

      {/* 既存モードのみ：マスターコードを忘れたときのリセット導線 */}
      {hasExistingKek && (
        <p className="-mt-1 text-xs text-slate-500">
          マスターコードが思い出せないときは{' '}
          <Link
            href="/digital/devices/passphrase-reset"
            className="underline hover:text-slate-700"
          >
            こちらからリセット
          </Link>
          できます（保存済みのパスワードを削除し、登録し直します）。
        </p>
      )}

      {/* 初回モードのみ：強度ヒント + 確認入力 + 保管確認 */}
      {!hasExistingKek && (
        <>
          {form.passphrase.length > 0 && passphraseIssues.length > 0 && (
            <ul className="-mt-2 ml-1 list-inside list-disc space-y-0.5 text-xs text-amber-700">
              {passphraseIssues.map((msg) => (
                <li key={msg}>{msg}</li>
              ))}
            </ul>
          )}

          <SecretField
            label="マスターコードの確認入力"
            required
            htmlFor="passphrase_confirm"
            icon={<Lock className="h-4 w-4 text-slate-400" aria-hidden="true" />}
            error={errors.passphrase_confirm}
            value={form.passphrase_confirm}
            onChange={(v) => setField('passphrase_confirm', v)}
            show={showPassphrase}
            onToggleShow={() => setShowPassphrase((v) => !v)}
            autoComplete="new-password"
            inputMode="text"
          />

          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <label className="flex cursor-pointer items-start gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={form.acknowledge_backup}
                onChange={(e) => setField('acknowledge_backup', e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span>
                上記のマスターコードを、ご自身が安全に取り出せる場所（メモ帳・パスワード管理アプリ・大切な方への封書など）に保管しました。
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

      {/* 暗号化の透明性表示 */}
      <p className="text-right text-[10px] text-slate-400">
        強力な暗号化方式で保護されています
      </p>

      {/* ボタン */}
      <div className="flex flex-col-reverse items-stretch gap-2 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/digital/devices"
          className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          キャンセル
        </Link>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <Save className="h-4 w-4" aria-hidden="true" />
          )}
          {submitting ? '暗号化して保存中…' : 'パスワードを暗号化して保存'}
        </button>
      </div>
    </form>
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
  inputMode,
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
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
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
          inputMode={inputMode}
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
