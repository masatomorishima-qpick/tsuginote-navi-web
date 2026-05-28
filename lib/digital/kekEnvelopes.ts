/**
 * lib/digital/kekEnvelopes.ts
 *
 * digital_user_kek_envelopes テーブルのアクセスヘルパー。
 *
 * KEK（ユーザー 1 人につき 1 つの鍵暗号鍵）の暗号文を管理する：
 *   - kind='owner'     : 本人パスフレーズで暗号化された KEK（本人が PIN を扱うとき復号）
 *   - kind='recipient' : 連携者の公開鍵で暗号化された KEK（死後開示時に連携者が復号）
 *
 * KEK の生 bytes はクライアントにしか存在しない。サーバーは暗号文のみ保持する。
 */

import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';

export type OwnerKekEnvelopeRow = {
  encrypted_kek: string;
  iv: string | null;
  salt: string | null;
};

export type RecipientKekEnvelopeRow = {
  recipient_user_id: string;
  encrypted_kek: string;
};

/**
 * 本人用 KEK 暗号文を取得（無ければ null）。
 * null の場合「この人はまだ KEK を持っていない＝初回 PIN 登録」を意味する。
 */
export async function getOwnerKekEnvelope(
  supabase: SupabaseClient,
  ownerUserId: string
): Promise<OwnerKekEnvelopeRow | null> {
  const { data, error } = await supabase
    .from('digital_user_kek_envelopes')
    .select('encrypted_kek, iv, salt')
    .eq('owner_user_id', ownerUserId)
    .eq('kind', 'owner')
    .maybeSingle();
  if (error) {
    console.error('[kekEnvelopes] getOwnerKekEnvelope failed', error);
    throw new Error(error.message);
  }
  return (data as OwnerKekEnvelopeRow | null) ?? null;
}

/**
 * 指定オーナーの連携者用 KEK 暗号文をすべて取得。
 * 既に KEK が配布されている連携者を判定するために使う。
 */
export async function listRecipientKekEnvelopes(
  supabase: SupabaseClient,
  ownerUserId: string
): Promise<RecipientKekEnvelopeRow[]> {
  const { data, error } = await supabase
    .from('digital_user_kek_envelopes')
    .select('recipient_user_id, encrypted_kek')
    .eq('owner_user_id', ownerUserId)
    .eq('kind', 'recipient');
  if (error) {
    console.error('[kekEnvelopes] listRecipientKekEnvelopes failed', error);
    throw new Error(error.message);
  }
  return (data ?? []) as RecipientKekEnvelopeRow[];
}

/**
 * 本人用 KEK 暗号文を保存（初回のみ。既存があれば何もしない）。
 */
export async function saveOwnerKekEnvelope(
  supabase: SupabaseClient,
  ownerUserId: string,
  envelope: { encrypted_kek: string; iv: string; salt: string }
): Promise<{ ok: boolean; error?: string }> {
  const existing = await getOwnerKekEnvelope(supabase, ownerUserId);
  if (existing) {
    // 既に KEK がある＝上書きすると既存 PIN が復号できなくなるため、保存しない
    return { ok: true };
  }
  const { error } = await supabase.from('digital_user_kek_envelopes').insert({
    owner_user_id: ownerUserId,
    kind: 'owner',
    encrypted_kek: envelope.encrypted_kek,
    iv: envelope.iv,
    salt: envelope.salt,
    algorithm_version: 'v1',
  });
  if (error) {
    console.error('[kekEnvelopes] saveOwnerKekEnvelope failed', error);
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

/**
 * 連携者用 KEK 暗号文を保存（既にあれば何もしない＝冪等）。
 *
 * 設計メモ：
 *   - digital_user_kek_envelopes の連携者ユニーク制約は
 *     「uq_kek_recipient (owner_user_id, recipient_user_id) WHERE kind='recipient'」
 *     という **部分ユニークインデックス**。Supabase JS の upsert は onConflict に
 *     述語付きの部分インデックスを指定できないため、ここでは素の INSERT を使い、
 *     重複（23505）は「既に配布済み」とみなして成功扱いにする。
 *   - KEK は不変なので、再度書こうとして弾かれても問題ない。
 *   - そもそも呼び出し側（listRecipientsNeedingKek）が「KEK 未配布の連携者」だけを
 *     渡すため、通常フローでは衝突しない。23505 ハンドリングは競合時の保険。
 *   - kek_envelopes には UPDATE の RLS ポリシーが無い（INSERT/SELECT/DELETE のみ）。
 *     upsert だと衝突時に UPDATE 経路へ入り RLS で弾かれるため、INSERT 固定にする。
 */
export async function upsertRecipientKekEnvelope(
  supabase: SupabaseClient,
  ownerUserId: string,
  recipientUserId: string,
  encryptedKek: string
): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabase.from('digital_user_kek_envelopes').insert({
    owner_user_id: ownerUserId,
    kind: 'recipient',
    recipient_user_id: recipientUserId,
    encrypted_kek: encryptedKek,
    algorithm_version: 'v1',
  });
  if (error) {
    // 23505 = unique_violation → 既に配布済み。冪等なので成功扱い。
    if (error.code === '23505') {
      return { ok: true };
    }
    console.error('[kekEnvelopes] upsertRecipientKekEnvelope failed', error);
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

/**
 * 指定オーナーの KEK エンベロープをすべて削除する（owner 用・recipient 用の両方）。
 *
 * パスフレーズ紛失時の「リセット（作り直し）」フローで使う。
 * - owner 用：パスフレーズで施錠された KEK。本人が復号できない以上、保持しても無意味。
 * - recipient 用：旧 KEK を連携者の公開鍵で施錠したもの。旧 KEK ごと破棄するため、
 *   こちらも消す。残すと、リセット後に新 KEK を配ろうとしても部分ユニーク制約に
 *   弾かれ、連携者が旧 KEK を持ったまま（新 PIN を開けない）になってしまう。
 *
 * kek_delete_owner RLS ポリシー（auth.uid() = owner_user_id）で、本人セッションの
 * クライアントから両 kind を削除できる。
 */
export async function deleteAllKekEnvelopesForUser(
  supabase: SupabaseClient,
  ownerUserId: string
): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabase
    .from('digital_user_kek_envelopes')
    .delete()
    .eq('owner_user_id', ownerUserId);
  if (error) {
    console.error('[kekEnvelopes] deleteAllKekEnvelopesForUser failed', error);
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

/**
 * 指定オーナーの「KEK 未配布の連携者」を返す。
 * active な family_links のうち、recipient 用 KEK 暗号文がまだ無い人のリスト。
 * それぞれの公開鍵も同時に返す（クライアントが KEK を暗号化するため）。
 */
export async function listRecipientsNeedingKek(
  supabase: SupabaseClient,
  ownerUserId: string
): Promise<Array<{ recipient_user_id: string; public_key: string }>> {
  // active な連携者を取得
  const { data: links, error: linkErr } = await supabase
    .from('digital_family_links')
    .select('recipient_user_id')
    .eq('owner_user_id', ownerUserId)
    .eq('status', 'active');
  if (linkErr) {
    console.error('[kekEnvelopes] listRecipientsNeedingKek link lookup failed', linkErr);
    throw new Error(linkErr.message);
  }
  const recipientIds = (links ?? []).map((l) => l.recipient_user_id as string);
  if (recipientIds.length === 0) return [];

  // 既に KEK を持っている連携者
  const existingEnvelopes = await listRecipientKekEnvelopes(supabase, ownerUserId);
  const hasKek = new Set(existingEnvelopes.map((e) => e.recipient_user_id));

  // KEK 未配布の連携者の公開鍵を取得
  const needKek = recipientIds.filter((id) => !hasKek.has(id));
  if (needKek.length === 0) return [];

  const { data: keys, error: keyErr } = await supabase
    .from('digital_recipient_keys')
    .select('user_id, public_key')
    .in('user_id', needKek);
  if (keyErr) {
    console.error('[kekEnvelopes] listRecipientsNeedingKek key lookup failed', keyErr);
    throw new Error(keyErr.message);
  }

  return (keys ?? []).map((k) => ({
    recipient_user_id: k.user_id as string,
    public_key: k.public_key as string,
  }));
}
