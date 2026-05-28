'use client';

/**
 * ReminderSettingsForm
 *
 * /digital/settings のメインフォーム。
 *
 * - 有効/無効トグル
 * - 期間プリセット（30 / 60 / 90 / 180 日）
 * - 保存ボタン（PUT /api/digital/reminder-settings）
 * - 無効時は期間 select をディム表示（値は保持）
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Check, AlertTriangle } from 'lucide-react';
import {
  REMINDER_INTERVAL_DAYS,
  REMINDER_INTERVAL_LABELS,
  type DigitalReminderSetting,
  type ReminderIntervalDays,
} from '@/types/digital';

type Props = {
  initialSetting: DigitalReminderSetting;
};

export default function ReminderSettingsForm({ initialSetting }: Props) {
  const router = useRouter();
  const [enabled, setEnabled] = useState<boolean>(initialSetting.reminder_enabled);
  const [interval, setInterval] = useState<ReminderIntervalDays>(
    initialSetting.reminder_interval
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    if (saving) return;
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      const res = await fetch('/api/digital/reminder-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reminder_enabled: enabled,
          reminder_interval: interval,
        }),
      });
      const json = (await res.json().catch(() => null)) as
        | { ok: true; setting: DigitalReminderSetting }
        | { ok: false; error?: string; detail?: string }
        | null;

      if (!res.ok || !json || !json.ok) {
        setError(
          (json && !json.ok && (json.detail || json.error)) ||
            '保存に失敗しました。通信環境をご確認のうえ、もう一度お試しください。'
        );
        return;
      }

      setSaved(true);
      router.refresh(); // ダッシュボードに戻ったときに最新値を反映

      // 成功バッジを 2 秒で消す
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('[ReminderSettingsForm] save error', err);
      setError('保存中に予期しないエラーが発生しました。');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <h2 className="text-sm font-semibold text-slate-700">
        リマインドを受け取る
      </h2>
      <p className="mt-1 text-xs text-slate-500">
        長期間ログインがないと、登録内容が古くなってしまう可能性があります。
        一定期間ごとに画面上でお知らせします。
      </p>

      {/* 有効/無効トグル */}
      <label className="mt-4 flex items-center gap-3 cursor-pointer select-none">
        <input
          type="checkbox"
          className="h-5 w-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
          checked={enabled}
          onChange={(e) => setEnabled(e.target.checked)}
        />
        <span className="text-sm text-slate-800">
          リマインドを有効にする
        </span>
      </label>

      {/* 期間 select */}
      <div className="mt-4">
        <label
          htmlFor="reminder-interval"
          className={`text-sm ${enabled ? 'text-slate-700' : 'text-slate-400'}`}
        >
          リマインド間隔
        </label>
        <select
          id="reminder-interval"
          disabled={!enabled}
          value={interval}
          onChange={(e) =>
            setInterval(Number(e.target.value) as ReminderIntervalDays)
          }
          className="mt-1 block w-full max-w-xs rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
        >
          {REMINDER_INTERVAL_DAYS.map((d) => (
            <option key={d} value={d}>
              {REMINDER_INTERVAL_LABELS[d]}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-slate-500">
          最終ログインから指定日数が経過すると、ダッシュボードに黄色の帯が表示されます。
        </p>
      </div>

      {/* エラー表示 */}
      {error && (
        <div className="mt-4 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
          <AlertTriangle
            className="mt-0.5 h-4 w-4 flex-shrink-0"
            aria-hidden="true"
          />
          <span>{error}</span>
        </div>
      )}

      {/* 保存ボタン */}
      <div className="mt-5 flex items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-60"
        >
          {saving ? (
            <>
              <Loader2
                className="h-4 w-4 animate-spin"
                aria-hidden="true"
              />
              保存中...
            </>
          ) : (
            '保存する'
          )}
        </button>
        {saved && (
          <span className="inline-flex items-center gap-1 text-sm text-emerald-700">
            <Check className="h-4 w-4" aria-hidden="true" />
            保存しました
          </span>
        )}
      </div>
    </div>
  );
}
