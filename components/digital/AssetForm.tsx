'use client';

/**
 * AssetForm
 *
 * デジタル資産の「新規登録」「編集」両方で使う共有フォーム。
 *
 * 🚨 重要：パスワード・ID・口座番号を入力できるフィールドは
 *   意図的に用意していません。MVPでは保存しません。
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, AlertTriangle, Save } from 'lucide-react';
import Link from 'next/link';
import type {
  DigitalAsset,
  DigitalCategory,
  DeathAction,
  DigitalServiceMaster,
} from '@/types/digital';
import {
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  DEATH_ACTION_LABELS,
} from '@/types/digital';
import QuickSelectPicker from './QuickSelectPicker';

type Mode = 'create' | 'edit';

type Props = {
  mode: Mode;
  initial?: DigitalAsset;
};

type FormState = {
  service_name: string;
  category: DigitalCategory | '';
  death_action: DeathAction | '';
  assignee_name: string;
  memo: string;
  official_url: string;
  monthly_cost: string; // 文字列で保持、送信時に数値化
  is_confirmed: boolean;
};

const DEATH_ACTIONS: DeathAction[] = [
  'cancel',
  'inherit',
  'memorialize',
  'self_only',
  'undecided',
];

// クイック選択で選んだマスタID（DBには保存しないがUX用に保持）
type SelectedMaster = { id: string } | null;

export default function AssetForm({ mode, initial }: Props) {
  const router = useRouter();

  const [form, setForm] = useState<FormState>({
    service_name: initial?.service_name ?? '',
    category: initial?.category ?? '',
    death_action: initial?.death_action ?? '',
    assignee_name: initial?.assignee_name ?? '',
    memo: initial?.memo ?? '',
    official_url: initial?.official_url ?? '',
    monthly_cost:
      initial?.monthly_cost !== null && initial?.monthly_cost !== undefined
        ? String(initial.monthly_cost)
        : '',
    is_confirmed: initial?.is_confirmed ?? false,
  });

  const [selectedMaster, setSelectedMaster] = useState<SelectedMaster>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleMasterSelect(master: DigitalServiceMaster | null) {
    if (master) {
      setSelectedMaster({ id: master.id });
      setForm((prev) => ({
        ...prev,
        service_name: master.service_name,
        category: master.category,
        official_url: master.official_url ?? prev.official_url,
      }));
    } else {
      setSelectedMaster(null);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;

    setErrors({});
    setGeneralError(null);
    setSubmitting(true);

    const payload = {
      service_name: form.service_name.trim(),
      category: form.category || null,
      death_action: form.death_action || null,
      assignee_name: form.assignee_name.trim() || null,
      memo: form.memo.trim() || null,
      official_url: form.official_url.trim() || null,
      monthly_cost: form.monthly_cost.trim() || null,
      is_confirmed: form.is_confirmed,
    };

    const url =
      mode === 'create'
        ? '/api/digital/assets'
        : `/api/digital/assets/${initial?.id}`;
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
              '機密情報は保存できません。パスワードやID等は入力しないでください。'
          );
        } else {
          setGeneralError('保存に失敗しました。時間をおいて再度お試しください。');
        }
        setSubmitting(false);
        return;
      }

      router.push('/digital');
      router.refresh();
    } catch (err) {
      console.error('[AssetForm] submit failed', err);
      setGeneralError('ネットワークエラーが発生しました。');
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 警告バナー（簡素化） */}
      <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-900">
        <AlertTriangle
          className="mt-0.5 h-4 w-4 flex-shrink-0 text-rose-600"
          aria-hidden="true"
        />
        <p>
          パスワード・ID・口座番号は入力しないでください。
          <Link
            href="/digital/settings/help"
            className="ml-1 underline hover:text-rose-700"
          >
            詳しくはヘルプ
          </Link>
        </p>
      </div>

      {generalError && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {generalError}
        </div>
      )}

      {/* クイック選択（新規時のみ目立たせる） */}
      {mode === 'create' && (
        <section>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            クイック選択
            <span className="ml-2 text-xs font-normal text-slate-500">
              一覧から選ぶと以下が自動入力されます
            </span>
          </label>
          <QuickSelectPicker
            selectedMasterId={selectedMaster?.id ?? null}
            onSelect={handleMasterSelect}
          />
        </section>
      )}

      {/* サービス名 */}
      <Field
        label="サービス名"
        required
        error={errors.service_name}
        htmlFor="service_name"
      >
        <input
          id="service_name"
          type="text"
          value={form.service_name}
          onChange={(e) => setField('service_name', e.target.value)}
          placeholder="例：Netflix"
          maxLength={100}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
        />
      </Field>

      {/* カテゴリ */}
      <Field label="カテゴリ" required error={errors.category}>
        <div className="flex flex-wrap gap-2">
          {CATEGORY_ORDER.map((c) => (
            <label
              key={c}
              className={`cursor-pointer rounded-full border px-3 py-1.5 text-sm transition ${
                form.category === c
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                  : 'border-slate-300 bg-white text-slate-700 hover:border-emerald-300'
              }`}
            >
              <input
                type="radio"
                name="category"
                value={c}
                checked={form.category === c}
                onChange={() => setField('category', c)}
                className="sr-only"
              />
              {CATEGORY_LABELS[c]}
            </label>
          ))}
        </div>
      </Field>

      {/* 死後の対応 */}
      <Field label="引き継ぐかたのご希望" required error={errors.death_action}>
        <div className="grid grid-cols-1 gap-2">
          {DEATH_ACTIONS.map((a) => (
            <label
              key={a}
              className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition ${
                form.death_action === a
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-900'
                  : 'border-slate-300 bg-white text-slate-700 hover:border-emerald-300'
              }`}
            >
              <input
                type="radio"
                name="death_action"
                value={a}
                checked={form.death_action === a}
                onChange={() => setField('death_action', a)}
                className="h-4 w-4 border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span>{DEATH_ACTION_LABELS[a]}</span>
            </label>
          ))}
        </div>
      </Field>

      {/* 担当の方 */}
      <Field
        label="担当の方（任意）"
        error={errors.assignee_name}
        htmlFor="assignee_name"
        hint="誰にお願いしたいか、名前や続柄などをメモできます"
      >
        <input
          id="assignee_name"
          type="text"
          value={form.assignee_name}
          onChange={(e) => setField('assignee_name', e.target.value)}
          placeholder="例：長男（太郎）"
          maxLength={50}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
        />
      </Field>

      {/* 月額費用 */}
      <Field
        label="月額費用（任意）"
        error={errors.monthly_cost}
        htmlFor="monthly_cost"
        hint="解約判断の参考になります。円単位の整数で入力。"
      >
        <div className="flex items-center gap-2">
          <input
            id="monthly_cost"
            type="number"
            inputMode="numeric"
            min={0}
            max={10000000}
            value={form.monthly_cost}
            onChange={(e) => setField('monthly_cost', e.target.value)}
            placeholder="例：1490"
            className="w-40 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
          />
          <span className="text-sm text-slate-600">円 / 月</span>
        </div>
      </Field>

      {/* 公式URL */}
      <Field
        label="公式サイトURL（任意）"
        error={errors.official_url}
        htmlFor="official_url"
        hint="大切な方が解約手続き等を調べるときに役立ちます"
      >
        <input
          id="official_url"
          type="url"
          value={form.official_url}
          onChange={(e) => setField('official_url', e.target.value)}
          placeholder="https://www.example.com"
          maxLength={500}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
        />
      </Field>

      {/* メモ */}
      <Field
        label="メモ（任意）"
        error={errors.memo}
        htmlFor="memo"
        hint={`残しておきたい伝言を自由に書けます（500文字以内）`}
      >
        <textarea
          id="memo"
          value={form.memo}
          onChange={(e) => setField('memo', e.target.value)}
          placeholder="例：請求は妻の口座引き落とし。家族アカウントで使っているので解約前に子どもたちに相談してほしい。"
          rows={4}
          maxLength={500}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
        />
        <p className="mt-1 text-right text-xs text-slate-400">
          {form.memo.length} / 500
        </p>
      </Field>

      {/* 確認済みチェック */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
        <label className="flex cursor-pointer items-start gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={form.is_confirmed}
            onChange={(e) => setField('is_confirmed', e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
          />
          <span>
            この内容で保存します
            <span className="block text-xs text-slate-500">
              3 ヶ月後に、内容の見直しリマインドを画面に表示します。
            </span>
          </span>
        </label>
      </div>

      {/* 保存ボタン（全幅） */}
      <div className="border-t border-slate-200 pt-4">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-400"
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
