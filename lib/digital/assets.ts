/**
 * digital_assets テーブルの CRUD ヘルパー（サーバー側専用）
 *
 * API Route から呼ばれることを想定しています。
 * RLS（Row Level Security）が効いているため、認証済みユーザーは
 * 自分の行のみ読み書き可能です。
 */

import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  DigitalAsset,
  DigitalCategory,
  DeathAction,
} from '@/types/digital';

export type DigitalAssetInput = {
  service_name: string;
  category: DigitalCategory;
  death_action: DeathAction;
  assignee_name?: string | null;
  memo?: string | null;
  official_url?: string | null;
  monthly_cost?: number | null;
  is_confirmed?: boolean;
  sort_order?: number;
};

/**
 * 自分の全資産を取得（新しい順）
 */
export async function listAssets(
  supabase: SupabaseClient,
  userId: string
): Promise<DigitalAsset[]> {
  const { data, error } = await supabase
    .from('digital_assets')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('[lib/digital/assets] listAssets failed', error);
    throw new Error(error.message);
  }

  return (data ?? []) as DigitalAsset[];
}

/**
 * IDで1件取得（自分の行のみ。他人のIDを指定しても null）
 */
export async function getAssetById(
  supabase: SupabaseClient,
  userId: string,
  id: string
): Promise<DigitalAsset | null> {
  const { data, error } = await supabase
    .from('digital_assets')
    .select('*')
    .eq('user_id', userId)
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('[lib/digital/assets] getAssetById failed', error);
    throw new Error(error.message);
  }

  return data ? (data as DigitalAsset) : null;
}

/**
 * 新規作成
 */
export async function createAsset(
  supabase: SupabaseClient,
  userId: string,
  input: DigitalAssetInput
): Promise<DigitalAsset> {
  const { data, error } = await supabase
    .from('digital_assets')
    .insert({
      user_id: userId,
      service_name: input.service_name,
      category: input.category,
      death_action: input.death_action,
      assignee_name: input.assignee_name ?? null,
      memo: input.memo ?? null,
      official_url: input.official_url ?? null,
      monthly_cost: input.monthly_cost ?? null,
      is_confirmed: input.is_confirmed ?? false,
      sort_order: input.sort_order ?? 0,
    })
    .select()
    .single();

  if (error) {
    console.error('[lib/digital/assets] createAsset failed', error);
    throw new Error(error.message);
  }

  return data as DigitalAsset;
}

/**
 * 更新
 */
export async function updateAsset(
  supabase: SupabaseClient,
  userId: string,
  id: string,
  input: Partial<DigitalAssetInput>
): Promise<DigitalAsset> {
  const patch: Record<string, unknown> = {};
  if (input.service_name !== undefined) patch.service_name = input.service_name;
  if (input.category !== undefined) patch.category = input.category;
  if (input.death_action !== undefined) patch.death_action = input.death_action;
  if (input.assignee_name !== undefined) patch.assignee_name = input.assignee_name;
  if (input.memo !== undefined) patch.memo = input.memo;
  if (input.official_url !== undefined) patch.official_url = input.official_url;
  if (input.monthly_cost !== undefined) patch.monthly_cost = input.monthly_cost;
  if (input.is_confirmed !== undefined) patch.is_confirmed = input.is_confirmed;
  if (input.sort_order !== undefined) patch.sort_order = input.sort_order;

  const { data, error } = await supabase
    .from('digital_assets')
    .update(patch)
    .eq('user_id', userId)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('[lib/digital/assets] updateAsset failed', error);
    throw new Error(error.message);
  }

  return data as DigitalAsset;
}

/**
 * 削除
 */
export async function deleteAsset(
  supabase: SupabaseClient,
  userId: string,
  id: string
): Promise<void> {
  const { error } = await supabase
    .from('digital_assets')
    .delete()
    .eq('user_id', userId)
    .eq('id', id);

  if (error) {
    console.error('[lib/digital/assets] deleteAsset failed', error);
    throw new Error(error.message);
  }
}
