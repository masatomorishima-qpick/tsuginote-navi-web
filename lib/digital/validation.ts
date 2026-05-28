/**
 * デジタル資産フォームのバリデーションヘルパー（サーバー・クライアント共用）
 *
 * 🚨 重要：パスワード・ID・口座番号の保存は MVP では行わないため、
 *   そもそもそれらのフィールド自体を受け付けません（型レベルで拒否）。
 *
 * DB スキーマ（001_digital_assets_migration.sql）の CHECK 制約と一致させています。
 */

import type { DigitalCategory, DeathAction } from '@/types/digital';

const VALID_CATEGORIES: DigitalCategory[] = [
  'subscription',
  'finance',
  'sns',
  'photo_storage',
  'shopping',
  'work',
  'other',
];

const VALID_DEATH_ACTIONS: DeathAction[] = [
  'cancel',
  'inherit',
  'memorialize',
  'self_only',
  'undecided',
];

export type AssetFormInput = {
  service_name?: unknown;
  category?: unknown;
  death_action?: unknown;
  assignee_name?: unknown;
  memo?: unknown;
  official_url?: unknown;
  monthly_cost?: unknown;
  is_confirmed?: unknown;
  sort_order?: unknown;
};

export type ValidationResult =
  | { ok: true; value: ValidatedAssetInput }
  | { ok: false; errors: Record<string, string> };

export type ValidatedAssetInput = {
  service_name: string;
  category: DigitalCategory;
  death_action: DeathAction;
  assignee_name: string | null;
  memo: string | null;
  official_url: string | null;
  monthly_cost: number | null;
  is_confirmed: boolean;
  sort_order?: number;
};

/**
 * 入力のバリデーション。エラーがあればキー別にメッセージを返却。
 */
export function validateAssetInput(input: AssetFormInput): ValidationResult {
  const errors: Record<string, string> = {};

  // service_name
  const service_name = typeof input.service_name === 'string' ? input.service_name.trim() : '';
  if (!service_name) {
    errors.service_name = 'サービス名を入力してください。';
  } else if (service_name.length > 100) {
    errors.service_name = 'サービス名は100文字以内で入力してください。';
  }

  // category
  const category =
    typeof input.category === 'string' &&
    VALID_CATEGORIES.includes(input.category as DigitalCategory)
      ? (input.category as DigitalCategory)
      : null;
  if (!category) {
    errors.category = 'カテゴリを選択してください。';
  }

  // death_action
  const death_action =
    typeof input.death_action === 'string' &&
    VALID_DEATH_ACTIONS.includes(input.death_action as DeathAction)
      ? (input.death_action as DeathAction)
      : null;
  if (!death_action) {
    errors.death_action = 'ご家族への希望を選択してください。';
  }

  // assignee_name (optional, <=50)
  let assignee_name: string | null = null;
  if (typeof input.assignee_name === 'string') {
    const trimmed = input.assignee_name.trim();
    if (trimmed.length > 50) {
      errors.assignee_name = '担当のご家族名は50文字以内で入力してください。';
    }
    assignee_name = trimmed ? trimmed : null;
  }

  // memo (optional, <=500)
  let memo: string | null = null;
  if (typeof input.memo === 'string') {
    const trimmed = input.memo.trim();
    if (trimmed.length > 500) {
      errors.memo = 'メモは500文字以内で入力してください。';
    }
    memo = trimmed ? trimmed : null;
  }

  // official_url (optional, <=2000, http/https)
  let official_url: string | null = null;
  if (typeof input.official_url === 'string') {
    const trimmed = input.official_url.trim();
    if (trimmed) {
      if (trimmed.length > 2000) {
        errors.official_url = 'URLは2000文字以内で入力してください。';
      } else if (!/^https?:\/\//i.test(trimmed)) {
        errors.official_url = 'URLは http:// または https:// で始めてください。';
      } else {
        official_url = trimmed;
      }
    }
  }

  // monthly_cost (optional, integer, 0..10_000_000)
  let monthly_cost: number | null = null;
  if (input.monthly_cost !== undefined && input.monthly_cost !== null && input.monthly_cost !== '') {
    const n =
      typeof input.monthly_cost === 'number'
        ? input.monthly_cost
        : typeof input.monthly_cost === 'string'
          ? Number(input.monthly_cost)
          : NaN;
    if (!Number.isFinite(n) || !Number.isInteger(n)) {
      errors.monthly_cost = '月額費用は整数で入力してください。';
    } else if (n < 0 || n > 10_000_000) {
      errors.monthly_cost = '月額費用は 0〜10,000,000 の範囲で入力してください。';
    } else {
      monthly_cost = n;
    }
  }

  // is_confirmed
  const is_confirmed = input.is_confirmed === true || input.is_confirmed === 'true';

  // sort_order (optional)
  let sort_order: number | undefined;
  if (input.sort_order !== undefined) {
    const n =
      typeof input.sort_order === 'number'
        ? input.sort_order
        : typeof input.sort_order === 'string'
          ? Number(input.sort_order)
          : NaN;
    if (Number.isFinite(n) && Number.isInteger(n) && n >= 0) {
      sort_order = n;
    }
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: {
      service_name,
      category: category as DigitalCategory,
      death_action: death_action as DeathAction,
      assignee_name,
      memo,
      official_url,
      monthly_cost,
      is_confirmed,
      ...(sort_order !== undefined ? { sort_order } : {}),
    },
  };
}

/**
 * 機密情報っぽいキーが混入していないかのガード。
 * MVPではパスワード/ID/口座番号は保存しないので、APIで二重にチェックします。
 */
export function containsForbiddenField(body: Record<string, unknown>): string | null {
  const forbiddenKeys = [
    'password',
    'pass',
    'pwd',
    'secret',
    'token',
    'login_id',
    'account_id',
    'account_number',
    'card_number',
    'cvv',
    'pin',
  ];
  for (const key of Object.keys(body)) {
    const normalized = key.toLowerCase().replace(/[_\- ]/g, '');
    for (const forbidden of forbiddenKeys) {
      const normalizedForbidden = forbidden.replace(/[_\- ]/g, '');
      if (normalized.includes(normalizedForbidden)) {
        return key;
      }
    }
  }
  return null;
}
