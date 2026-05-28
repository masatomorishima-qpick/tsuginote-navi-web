/**
 * digital_devices テーブルの CRUD ヘルパー（サーバー側専用）
 *
 * - 一覧取得は deleted_at IS NULL のみを返す
 * - 削除は「論理削除（deleted_at を set）」がデフォルト。PIN 付きデバイスの削除は
 *   付随 PIN を物理削除する（ON DELETE CASCADE ではなく明示的に先に pin_secrets を消す）
 *   ことで、後で「削除済みだがPINだけ残っている」状態を作らないようにする。
 * - 本ファイルは RLS を前提にしているが、すべてのクエリで `user_id` を明示し、
 *   万一 RLS が外れても他人の行に触れないように二重防御している。
 */

import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { DigitalDevice, DigitalDeviceWithPinFlag } from '@/types/digital';
import type { ValidatedDeviceInput } from './deviceValidation';

/**
 * 自分のアクティブなデバイス一覧を取得（作成順で古い→新しいの順）。
 * PIN 登録有無（has_pin / pin_updated_at）も同時に返す。
 */
export async function listDevicesWithPinFlag(
  supabase: SupabaseClient,
  userId: string
): Promise<DigitalDeviceWithPinFlag[]> {
  const { data: devices, error: deviceErr } = await supabase
    .from('digital_devices')
    .select('*')
    .eq('user_id', userId)
    .is('deleted_at', null)
    .order('created_at', { ascending: true });

  if (deviceErr) {
    console.error('[lib/digital/devices] listDevicesWithPinFlag devices failed', deviceErr);
    throw new Error(deviceErr.message);
  }

  if (!devices || devices.length === 0) return [];

  const deviceIds = devices.map((d) => d.id as string);

  // PIN 存在確認（encrypted_pin/iv/salt は取得しない：Phase1 ルール「読まないならクエリしない」）
  const { data: pins, error: pinErr } = await supabase
    .from('digital_pin_secrets')
    .select('device_id, updated_at')
    .eq('user_id', userId)
    .in('device_id', deviceIds);

  if (pinErr) {
    console.error('[lib/digital/devices] listDevicesWithPinFlag pins failed', pinErr);
    throw new Error(pinErr.message);
  }

  const pinMap = new Map<string, string>();
  for (const p of pins ?? []) {
    pinMap.set(p.device_id as string, p.updated_at as string);
  }

  return devices.map((d) => {
    const updated = pinMap.get(d.id as string) ?? null;
    return {
      ...(d as DigitalDevice),
      has_pin: updated !== null,
      pin_updated_at: updated,
    };
  });
}

/**
 * 自分のデバイスを ID で 1 件取得（論理削除済は取得しない）
 */
export async function getDeviceById(
  supabase: SupabaseClient,
  userId: string,
  id: string
): Promise<DigitalDevice | null> {
  const { data, error } = await supabase
    .from('digital_devices')
    .select('*')
    .eq('user_id', userId)
    .eq('id', id)
    .is('deleted_at', null)
    .maybeSingle();

  if (error) {
    console.error('[lib/digital/devices] getDeviceById failed', error);
    throw new Error(error.message);
  }

  return data ? (data as DigitalDevice) : null;
}

/**
 * 指定デバイスに PIN が登録済みかを判定（encrypted_pin を取得しない軽量クエリ）
 */
export async function deviceHasPin(
  supabase: SupabaseClient,
  userId: string,
  deviceId: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from('digital_pin_secrets')
    .select('id')
    .eq('user_id', userId)
    .eq('device_id', deviceId)
    .maybeSingle();

  if (error) {
    console.error('[lib/digital/devices] deviceHasPin failed', error);
    throw new Error(error.message);
  }

  return data !== null;
}

/**
 * 新規作成
 */
export async function createDevice(
  supabase: SupabaseClient,
  userId: string,
  input: ValidatedDeviceInput
): Promise<DigitalDevice> {
  const { data, error } = await supabase
    .from('digital_devices')
    .insert({
      user_id: userId,
      device_name: input.device_name,
      manufacturer: input.manufacturer,
      model: input.model,
      purchase_date: input.purchase_date,
      storage_place: input.storage_place,
      note: input.note,
      disposal_status: input.disposal_status,
    })
    .select()
    .single();

  if (error) {
    console.error('[lib/digital/devices] createDevice failed', error);
    throw new Error(error.message);
  }

  return data as DigitalDevice;
}

/**
 * 更新（deleted_at や id は更新対象外）
 */
export async function updateDevice(
  supabase: SupabaseClient,
  userId: string,
  id: string,
  input: Partial<ValidatedDeviceInput>
): Promise<DigitalDevice> {
  const patch: Record<string, unknown> = {};
  if (input.device_name !== undefined) patch.device_name = input.device_name;
  if (input.manufacturer !== undefined) patch.manufacturer = input.manufacturer;
  if (input.model !== undefined) patch.model = input.model;
  if (input.purchase_date !== undefined) patch.purchase_date = input.purchase_date;
  if (input.storage_place !== undefined) patch.storage_place = input.storage_place;
  if (input.note !== undefined) patch.note = input.note;
  if (input.disposal_status !== undefined)
    patch.disposal_status = input.disposal_status;

  const { data, error } = await supabase
    .from('digital_devices')
    .update(patch)
    .eq('user_id', userId)
    .eq('id', id)
    .is('deleted_at', null)
    .select()
    .single();

  if (error) {
    console.error('[lib/digital/devices] updateDevice failed', error);
    throw new Error(error.message);
  }

  return data as DigitalDevice;
}

/**
 * 論理削除（deleted_at を現在時刻にセット）。
 * 付随 PIN がある場合は呼び出し側で事前に deletePinByDeviceId するか、
 * step-up を必須にすること（API 層で担保）。
 */
export async function softDeleteDevice(
  supabase: SupabaseClient,
  userId: string,
  id: string
): Promise<void> {
  const { error } = await supabase
    .from('digital_devices')
    .update({ deleted_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('id', id)
    .is('deleted_at', null);

  if (error) {
    console.error('[lib/digital/devices] softDeleteDevice failed', error);
    throw new Error(error.message);
  }
}

/**
 * 付随 PIN を物理削除する（デバイス削除の前段で使用）。
 * Phase1 ルール「PIN を残したまま他を壊さない」の徹底のため明示的に消す。
 */
export async function deletePinByDeviceId(
  supabase: SupabaseClient,
  userId: string,
  deviceId: string
): Promise<void> {
  const { error } = await supabase
    .from('digital_pin_secrets')
    .delete()
    .eq('user_id', userId)
    .eq('device_id', deviceId);

  if (error) {
    console.error('[lib/digital/devices] deletePinByDeviceId failed', error);
    throw new Error(error.message);
  }
}
