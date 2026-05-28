'use client';

/**
 * DeviceForm
 *
 * デバイスの「新規登録」「編集」両方で使う共有フォーム。
 *
 * 🚨 重要：このフォームは PIN を扱わない。
 *   PIN の登録／更新／表示は専用画面（後続タスク）から行う。
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Save, ArrowLeft, Info } from 'lucide-react';
import type { DigitalDevice, DeviceDisposalStatus } from '@/types/digital';
import { DEVICE_DISPOSAL_STATUS_LABELS } from '@/types/digital';

type Mode = 'create' | 'edit';

type Props = {
  mode: Mode;
  initial?: DigitalDevice;
};

type FormState = {
  device_name: string;
  manufacturer: string;
  model: string;
  purchase_date: string; // YYYY-MM-DD
  storage_place: string;
  note: string;
  disposal_status: DeviceDisposalStatus;
};

const DISPOSAL_STATUSES: DeviceDisposalStatus[] = [
  'in_use',
  'disposed',
  'sold',
  'transferred',
  'other',
];

export default function DeviceForm({ mode, initial }: Props) {
  const router = useRouter();

  const [form, setForm] = useState<FormState>({
    device_name: initial?.device_name ?? '',
    manufacturer: initial?.manufacturer ?? '',
    model: initial?.model ?? '',
    purchase_date: initial?.purchase_date ?? '',
    storage_place: initial?.storage_place ?? '',
    note: initial?.note ?? '',
    disposal_status: initial?.disposal_status ?? 'in_use',
  });

  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;

    setErrors({});
    setGeneralError(null);
    setSubmitting(true);

    const payload = {
      device_name: form.device_name.trim(),
      manufacturer: form.manufacturer.trim() || null,
      model: form.model.trim() || null,
      purchase_date: form.purchase_date.trim() || null,
      storage_place: form.storage_place.trim() || null,
      note: form.note.trim() || null,
      disposal_status: form.disposal_status,
    };

    const url =
      mode === 'create'
        ? '/api/digital/devices'
        : `/api/digital/devices/${initial?.id}`;
    const method = mode === 'create' ? 'POST' : 'PATCH';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();

      if (!res.ok || !json.ok) {
        if (json?.error === 'validation_failed' && json.errors) {
          setErrors(json.errors as Record<string, string>);
          setGeneralError('入力内容をご確認ください。');
        } else if (json?.error === 'forbidden_field') {
          setGeneralError(
            json.detail ??
              'このフォームでは保存できない項目が含まれています。'
          );
        } else {
          setGeneralError('保存に失敗しました。時間をおいて再度お試しください。');
        }
        setSubmitting(false);
        return;
      }

      // 新規作成時：作成したデバイスの詳細画面へ遷移し、PIN 登録への動線を提示する。
      // 編集時：従来通り一覧へ戻る。
      if (mode === 'create' && json?.device?.id) {
        router.push(`/digital/devices/${json.device.id}?created=1`);
      } else {
        router.push('/digital/devices');
      }
      router.refresh();
    } catch (err) {
      console.error('[DeviceForm] submit failed', err);
      setGeneralError('ネットワークエラーが発生しました。');
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 案内 */}
      <div className="flex gap-3 rounded-xl border border-sky-200 bg-sky-50 p-4 text-sm text-sky-900">
        <Info
          className="mt-0.5 h-5 w-5 flex-shrink-0 text-sky-600"
          aria-hidden="true"
        />
        <div>
          <p className="font-semibold">
            この画面では「デバイス情報」だけを登録します
          </p>
          <p className="mt-1 leading-relaxed">
            パスワードは登録後、デバイス一覧の「パスワードを登録する」から別途設定します。
            パスワードは端末内で暗号化してから送信されるため、運営側からも閲覧できません。
          </p>
        </div>
      </div>

      {generalError && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {generalError}
        </div>
      )}

      {/* デバイス名 */}
      <Field
        label="デバイス名"
        required
        error={errors.device_name}
        htmlFor="device_name"
        hint="ご自身が識別できる呼び方で構いません"
      >
        <input
          id="device_name"
          type="text"
          value={form.device_name}
          onChange={(e) => setField('device_name', e.target.value)}
          placeholder="例：自分の iPhone"
          maxLength={80}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
        />
      </Field>

      {/* メーカー */}
      <Field
        label="メーカー（任意）"
        error={errors.manufacturer}
        htmlFor="manufacturer"
      >
        <input
          id="manufacturer"
          type="text"
          value={form.manufacturer}
          onChange={(e) => setField('manufacturer', e.target.value)}
          placeholder="例：Apple"
          maxLength={60}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
        />
      </Field>

      {/* 機種 */}
      <Field label="機種（任意）" error={errors.model} htmlFor="model">
        <input
          id="model"
          type="text"
          value={form.model}
          onChange={(e) => setField('model', e.target.value)}
          placeholder="例：iPhone 15 Pro"
          maxLength={80}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
        />
      </Field>

      {/* 購入日 */}
      <Field
        label="購入日（任意）"
        error={errors.purchase_date}
        htmlFor="purchase_date"
        hint="おおよそで構いません"
      >
        <input
          id="purchase_date"
          type="date"
          value={form.purchase_date}
          onChange={(e) => setField('purchase_date', e.target.value)}
          min="1900-01-01"
          max="2100-12-31"
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100 sm:w-60"
        />
      </Field>

      {/* 保管場所 */}
      <Field
        label="保管場所（任意）"
        error={errors.storage_place}
        htmlFor="storage_place"
        hint="大切な方が見つけやすいヒントを書けます"
      >
        <input
          id="storage_place"
          type="text"
          value={form.storage_place}
          onChange={(e) => setField('storage_place', e.target.value)}
          placeholder="例：リビングの棚の引き出し"
          maxLength={120}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
        />
      </Field>

      {/* 状態 */}
      <Field label="状態" required error={errors.disposal_status}>
        <div className="flex flex-wrap gap-2">
          {DISPOSAL_STATUSES.map((s) => (
            <label
              key={s}
              className={`cursor-pointer rounded-full border px-3 py-1.5 text-sm transition ${
                form.disposal_status === s
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                  : 'border-slate-300 bg-white text-slate-700 hover:border-emerald-300'
              }`}
            >
              <input
                type="radio"
                name="disposal_status"
                value={s}
                checked={form.disposal_status === s}
                onChange={() => setField('disposal_status', s)}
                className="sr-only"
              />
              {DEVICE_DISPOSAL_STATUS_LABELS[s]}
            </label>
          ))}
        </div>
        <p className="mt-1 text-xs text-slate-500">
          「廃棄済み／売却済み／譲渡済み」を選ぶと、一覧でも区別して表示されます。
          デバイス自体を削除する場合は、下の「このデバイスを削除」ボタンをご利用ください。
        </p>
      </Field>

      {/* メモ */}
      <Field
        label="メモ（任意）"
        error={errors.note}
        htmlFor="note"
        hint="大切な方向けのメモを500文字以内で"
      >
        <textarea
          id="note"
          value={form.note}
          onChange={(e) => setField('note', e.target.value)}
          placeholder="例：FaceID 登録済み。バッテリー交換を1度行っています。"
          rows={4}
          maxLength={500}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
        />
        <p className="mt-1 text-right text-xs text-slate-400">
          {form.note.length} / 500
        </p>
      </Field>

      {/* ボタン */}
      <div className="flex flex-col-reverse items-stretch gap-2 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/digital/devices"
          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          デバイス一覧に戻る
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
          {mode === 'create' ? '保存する' : '変更を保存'}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  required,
  error,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  htmlFor?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-slate-700"
      >
        {label}
        {required && (
          <span className="rounded bg-rose-50 px-1.5 py-0.5 text-xs font-medium text-rose-700">
            必須
          </span>
        )}
      </label>
      {hint && <p className="mb-1.5 text-xs text-slate-500">{hint}</p>}
      {children}
      {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
    </div>
  );
}
