/**
 * digital_service_masters テーブルの取得ヘルパー
 *
 * クイック選択用のサービスマスタ（Netflix, PayPay, LINE等）を取得します。
 * RLSでログインユーザー全員が読み取り可能に設定されています。
 */

import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { DigitalServiceMaster } from '@/types/digital';

/**
 * 全サービスマスタを取得（カテゴリ順 → 表示順）
 */
export async function listServiceMasters(
  supabase: SupabaseClient
): Promise<DigitalServiceMaster[]> {
  const { data, error } = await supabase
    .from('digital_service_masters')
    .select('*')
    .order('category', { ascending: true })
    .order('display_order', { ascending: true });

  if (error) {
    console.error('[lib/digital/serviceMasters] listServiceMasters failed', error);
    throw new Error(error.message);
  }

  return (data ?? []) as DigitalServiceMaster[];
}

/**
 * IDで1件取得（公式URLなどを引き継ぎたい時に使用）
 */
export async function getServiceMasterById(
  supabase: SupabaseClient,
  id: string
): Promise<DigitalServiceMaster | null> {
  const { data, error } = await supabase
    .from('digital_service_masters')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('[lib/digital/serviceMasters] getServiceMasterById failed', error);
    throw new Error(error.message);
  }

  return data ? (data as DigitalServiceMaster) : null;
}
