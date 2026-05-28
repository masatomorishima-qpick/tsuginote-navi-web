/**
 * デバイス入力のバリデーション（サーバー/クライアント共用）
 *
 * DB スキーマ（005_digital_pin_secrets.sql）の CHECK 制約と一致させています。
 * 機密情報（パスワード・ロック解除 PIN そのものなど）はこのフォームでは受け付けません。
 * PIN は別 API（/api/digital/pins）経由で、クライアント暗号化済みの状態でしか流れません。
 */

import type { DeviceDisposalStatus } from '@/types/digital';

const VALID_DISPOSAL_STATUSES: DeviceDisposalStatus[] = [
  'in_use',
  'disposed',
  'sold',
  'transferred',
  'other',
];

export type DeviceFormInput = {
  device_name?: unknown;
  manufacturer?: unknown;
  model?: unknown;
  purchase_date?: unknown;
  storage_place?: unknown;
  note?: unknown;
  disposal_status?: unknown;
};

export type ValidatedDeviceInput = {
  device_name: string;
  manufacturer: string | null;
  model: string | null;
  purchase_date: string | null; // YYYY-MM-DD
  storage_place: string | null;
  note: string | null;
  disposal_status: DeviceDisposalStatus;
};

export type DeviceValidationResult =
  | { ok: true; value: ValidatedDeviceInput }
  | { ok: false; errors: Record<string, string> };

/**
 * YYYY-MM-DD 形式の妥当性を雑にチェック（カレンダー上の妥当な日付かも見る）
 */
function isValidYmd(s: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const [y, m, d] = s.split('-').map(Number);
  if (y < 1900 || y > 2100) return false;
  if (m < 1 || m > 12) return false;
  if (d < 1 || d > 31) return false;
  const dt = new Date(`${s}T00:00:00Z`);
  if (Number.isNaN(dt.getTime())) return false;
  // Date が別の月にロールしていないか
  return (
    dt.getUTCFullYear() === y &&
    dt.getUTCMonth() + 1 === m &&
    dt.getUTCDate() === d
  );
}

export function validateDeviceInput(
  input: DeviceFormInput
): DeviceValidationResult {
  const errors: Record<string, string> = {};

  // device_name (required, 1..80)
  const device_name =
    typeof input.device_name === 'string' ? input.device_name.trim() : '';
  if (!device_name) {
    errors.device_name = 'デバイス名を入力してください。';
  } else if (device_name.length > 80) {
    errors.device_name = 'デバイス名は80文字以内で入力してください。';
  }

  // manufacturer (optional, <=60)
  let manufacturer: string | null = null;
  if (typeof input.manufacturer === 'string') {
    const t = input.manufacturer.trim();
    if (t.length > 60) {
      errors.manufacturer = 'メーカー名は60文字以内で入力してください。';
    }
    manufacturer = t ? t : null;
  }

  // model (optional, <=80)
  let model: string | null = null;
  if (typeof input.model === 'string') {
    const t = input.model.trim();
    if (t.length > 80) {
      errors.model = '機種名は80文字以内で入力してください。';
    }
    model = t ? t : null;
  }

  // purchase_date (optional, YYYY-MM-DD)
  let purchase_date: string | null = null;
  if (typeof input.purchase_date === 'string') {
    const t = input.purchase_date.trim();
    if (t) {
      if (!isValidYmd(t)) {
        errors.purchase_date = '購入日は YYYY-MM-DD 形式で入力してください。';
      } else {
        purchase_date = t;
      }
    }
  }

  // storage_place (optional, <=120)
  let storage_place: string | null = null;
  if (typeof input.storage_place === 'string') {
    const t = input.storage_place.trim();
    if (t.length > 120) {
      errors.storage_place = '保管場所は120文字以内で入力してください。';
    }
    storage_place = t ? t : null;
  }

  // note (optional, <=500)
  let note: string | null = null;
  if (typeof input.note === 'string') {
    const t = input.note.trim();
    if (t.length > 500) {
      errors.note = 'メモは500文字以内で入力してください。';
    }
    note = t ? t : null;
  }

  // disposal_status (required)
  const disposal_status =
    typeof input.disposal_status === 'string' &&
    VALID_DISPOSAL_STATUSES.includes(input.disposal_status as DeviceDisposalStatus)
      ? (input.disposal_status as DeviceDisposalStatus)
      : null;
  if (!disposal_status) {
    errors.disposal_status = '状態を選択してください。';
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: {
      device_name,
      manufacturer,
      model,
      purchase_date,
      storage_place,
      note,
      disposal_status: disposal_status as DeviceDisposalStatus,
    },
  };
}

/**
 * デバイスフォームは「PIN そのもの」を受け付けない。保険として、APIでも二重チェックする。
 * PIN はあくまで /api/digital/pins 経由でクライアント暗号化済みの形でのみ流れる想定。
 */
export function containsForbiddenDeviceField(
  body: Record<string, unknown>
): string | null {
  // 許容しないキーの完全一致リスト（正規化後のスペル）。
  // PIN・パスワード系は必ずここで弾く（このフォームは PIN を扱わないため）。
  const forbiddenNormalized = new Set([
    'pin',
    'password',
    'pass',
    'pwd',
    'secret',
    'encryptedpin',
    'encrypted',
    'iv',
    'salt',
  ]);
  for (const key of Object.keys(body)) {
    const normalized = key.toLowerCase().replace(/[_\- ]/g, '');
    if (forbiddenNormalized.has(normalized)) {
      return key;
    }
  }
  return null;
}
