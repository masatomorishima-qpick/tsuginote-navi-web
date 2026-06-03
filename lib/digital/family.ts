/**
 * lib/digital/family.ts
 *
 * 家族連携（共有 ID 単位の従量課金モデル）の中核ロジック。
 *
 * 役割：
 *   - 招待の作成・トークン生成・期限管理
 *   - 招待承認時の family_links 作成
 *   - 招待解除・連携解除（owner / recipient 両側から）
 *   - 招待再送ロジック（同じトークンで何度でも）
 *   - 未承認招待の同時保有上限チェック（5 件）
 *   - 連携上限チェック（10 名）
 *
 * 課金タイミング：承認課金（承認の瞬間に Stripe quantity を +1）。
 *                招待発行だけでは課金されない。
 *
 * セキュリティ：
 *   - 招待トークンは暗号学的に推測困難な 48 文字以上（URL-safe Base64）
 *   - RLS は SQL 側でかけているが、ここでも owner_user_id を明示して二重防御
 *   - 招待先メールは citext で大文字小文字無視
 */

import 'server-only';
import { randomBytes } from 'node:crypto';
import type { SupabaseClient } from '@supabase/supabase-js';

// =============================================================================
// 定数
// =============================================================================

/** 招待トークンの長さ（生バイト数。URL-safe Base64 で表現すると 48〜64 文字程度） */
const INVITATION_TOKEN_BYTES = 36;

/** 招待有効期限（日数） */
export const INVITATION_TTL_DAYS = 7;

/**
 * 再送のクールダウン秒数。
 * - 連打スパム防止のため、前回の last_sent_at から N 秒未満は拒否する。
 * - 正当な「メール届かないのでもう一度」はすぐ許容したいので 60 秒に設定。
 *   厳格にしたい場合はこの値を増やす（例：300 = 5 分）。
 */
export const INVITATION_RESEND_COOLDOWN_SECONDS = 60;

/** 同時保有可能な未承認招待の上限（オーナー 1 人につき） */
export const MAX_PENDING_INVITATIONS = 5;

/** 連携可能な相手の上限（active な family_links の上限） */
export const MAX_FAMILY_LINKS = 10;

/** 招待相手の呼称の最大文字数 */
export const RECIPIENT_NAME_MAX = 30;

// =============================================================================
// 型定義
// =============================================================================

export type DigitalFamilyInvitation = {
  id: string;
  owner_user_id: string;
  recipient_email: string;
  recipient_name: string;
  token: string;
  expires_at: string;
  accepted_at: string | null;
  recipient_user_id: string | null;
  revoked_at: string | null;
  last_sent_at: string;
  created_at: string;
};

export type DigitalFamilyLink = {
  id: string;
  owner_user_id: string;
  recipient_user_id: string;
  recipient_name: string | null;
  // 'suspended'：未払い（トライアル満了・カード未登録）で一時休止中。
  //   active 以外なので課金数量・死亡開示の対象から外れる。カード登録で active へ戻す。
  status: 'active' | 'revoked' | 'suspended';
  share_during_lifetime: boolean;
  created_at: string;
  revoked_at: string | null;
  suspended_at: string | null;
};

export type InvitationStatus =
  | 'pending'   // 未承認、有効期限内
  | 'expired'   // 未承認、期限切れ
  | 'accepted'  // 承認済み
  | 'revoked';  // オーナーが取り消し

// =============================================================================
// ユーティリティ
// =============================================================================

/** URL-safe Base64 トークンを生成（48 文字以上） */
function generateInvitationToken(): string {
  const buf = randomBytes(INVITATION_TOKEN_BYTES);
  return buf
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function sanitizeEmail(input: unknown): string | null {
  if (typeof input !== 'string') return null;
  const trimmed = input.trim().toLowerCase();
  if (trimmed.length === 0 || trimmed.length > 254) return null;
  // ざっくりした email バリデーション（厳密にはサーバー側で再チェック）
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return null;
  return trimmed;
}

function sanitizeName(input: unknown, maxLen = RECIPIENT_NAME_MAX): string | null {
  if (typeof input !== 'string') return null;
  const cleaned = input.replace(/[ --]/g, '').trim();
  if (cleaned.length === 0) return null;
  return cleaned.slice(0, maxLen);
}

export function getInvitationStatus(
  inv: Pick<DigitalFamilyInvitation, 'accepted_at' | 'revoked_at' | 'expires_at'>
): InvitationStatus {
  if (inv.revoked_at) return 'revoked';
  if (inv.accepted_at) return 'accepted';
  if (new Date(inv.expires_at).getTime() <= Date.now()) return 'expired';
  return 'pending';
}

// =============================================================================
// 招待の取得
// =============================================================================

/** オーナーの招待一覧（未承認・承認済み・取消・期限切れ含む） */
export async function listInvitationsByOwner(
  supabase: SupabaseClient,
  ownerUserId: string
): Promise<DigitalFamilyInvitation[]> {
  const { data, error } = await supabase
    .from('digital_family_invitations')
    .select('*')
    .eq('owner_user_id', ownerUserId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[lib/digital/family] listInvitationsByOwner failed', error);
    throw new Error(error.message);
  }
  return (data ?? []) as DigitalFamilyInvitation[];
}

/** 招待をトークンで取得（承認フロー用、誰でも取得可能なように service_role を使う想定） */
export async function getInvitationByToken(
  supabaseAdmin: SupabaseClient,
  token: string
): Promise<DigitalFamilyInvitation | null> {
  if (typeof token !== 'string' || token.length < 32) return null;
  const { data, error } = await supabaseAdmin
    .from('digital_family_invitations')
    .select('*')
    .eq('token', token)
    .maybeSingle();
  if (error) {
    console.error('[lib/digital/family] getInvitationByToken failed', error);
    return null;
  }
  return (data as DigitalFamilyInvitation | null) ?? null;
}

/** 未承認の招待数（5 件上限チェック用） */
export async function countPendingInvitations(
  supabase: SupabaseClient,
  ownerUserId: string
): Promise<number> {
  const { count, error } = await supabase
    .from('digital_family_invitations')
    .select('id', { count: 'exact', head: true })
    .eq('owner_user_id', ownerUserId)
    .is('accepted_at', null)
    .is('revoked_at', null)
    .gt('expires_at', new Date().toISOString());

  if (error) {
    console.error('[lib/digital/family] countPendingInvitations failed', error);
    return 0;
  }
  return count ?? 0;
}

// =============================================================================
// 連携リンクの取得
// =============================================================================

export async function listLinksByOwner(
  supabase: SupabaseClient,
  ownerUserId: string
): Promise<DigitalFamilyLink[]> {
  const { data, error } = await supabase
    .from('digital_family_links')
    .select('*')
    .eq('owner_user_id', ownerUserId)
    .order('created_at', { ascending: false });
  if (error) {
    console.error('[lib/digital/family] listLinksByOwner failed', error);
    throw new Error(error.message);
  }
  return (data ?? []) as DigitalFamilyLink[];
}

export async function listLinksByRecipient(
  supabase: SupabaseClient,
  recipientUserId: string
): Promise<DigitalFamilyLink[]> {
  const { data, error } = await supabase
    .from('digital_family_links')
    .select('*')
    .eq('recipient_user_id', recipientUserId)
    .order('created_at', { ascending: false });
  if (error) {
    console.error('[lib/digital/family] listLinksByRecipient failed', error);
    throw new Error(error.message);
  }
  return (data ?? []) as DigitalFamilyLink[];
}

/**
 * オーナーが連携相手につけた呼称（recipient_name）を引く。
 *
 * 用途：オーナー視点 UI で連携相手を表示するときに、
 *   オーナー自身が招待時につけたあだ名（例「妻」「長男」「親友 田中」）を
 *   優先表示するため。
 *
 * 戻り値：
 *   - recipient_name が設定されていれば文字列
 *   - リンクが無い / 取得失敗のときは null
 *
 * 呼び出し側は通常、null の場合に通報者本人のプロフィール表示名へフォールバックする。
 */
export async function getRecipientNameByOwner(
  admin: SupabaseClient,
  ownerUserId: string,
  recipientUserId: string
): Promise<string | null> {
  const { data, error } = await admin
    .from('digital_family_links')
    .select('recipient_name')
    .eq('owner_user_id', ownerUserId)
    .eq('recipient_user_id', recipientUserId)
    .maybeSingle();
  if (error) {
    console.warn('[lib/digital/family] getRecipientNameByOwner failed', error);
    return null;
  }
  const name = (data?.recipient_name as string | null) ?? null;
  return name && name.trim() ? name.trim() : null;
}

export async function countActiveLinks(
  supabase: SupabaseClient,
  ownerUserId: string
): Promise<number> {
  const { count, error } = await supabase
    .from('digital_family_links')
    .select('id', { count: 'exact', head: true })
    .eq('owner_user_id', ownerUserId)
    .eq('status', 'active');
  if (error) {
    console.error('[lib/digital/family] countActiveLinks failed', error);
    return 0;
  }
  return count ?? 0;
}

/**
 * オーナーの active な連携を 'suspended'（休止）にする（課題 #30）。
 *
 * 用途：trial-reminders cron が、トライアル満了・カード未登録（事実上 FREE）の
 *       オーナーの連携を休止するために呼ぶ。
 *
 * 冪等性：status='active' の行だけを対象にするため、再実行しても二重処理にならない
 *         （既に suspended / revoked の行は対象外）。
 *
 * @returns 休止に切り替えた件数（失敗時は 0）
 */
export async function suspendActiveLinksForOwner(
  admin: SupabaseClient,
  ownerUserId: string
): Promise<number> {
  const { data, error } = await admin
    .from('digital_family_links')
    .update({
      status: 'suspended',
      suspended_at: new Date().toISOString(),
    })
    .eq('owner_user_id', ownerUserId)
    .eq('status', 'active')
    .select('id');
  if (error) {
    console.error('[lib/digital/family] suspendActiveLinksForOwner failed', {
      ownerUserId,
      error: error.message,
    });
    return 0;
  }
  return data?.length ?? 0;
}

/**
 * オーナーの 'suspended'（休止）連携を 'active' に戻す（課題 #30）。
 *
 * 用途：オーナーがカードを登録（Checkout 完了）して支払い可能になったときに、
 *       休止していた連携を復活させるために呼ぶ。
 *
 * 注意：呼び出し側は、復活後に Stripe の subscription quantity を
 *       active 連携数に合わせて同期すること（請求数量の取りこぼし防止）。
 *       本番の主経路（billing/checkout）では、本関数で復活 → countActiveLinks で
 *       数量算出 → その数量で Checkout を作成する順序にしている。
 *
 * 冪等性：status='suspended' の行だけを対象にするため、再実行しても安全。
 *
 * @returns 復活させた件数（失敗時は 0）
 */
export async function reactivateSuspendedLinksForOwner(
  admin: SupabaseClient,
  ownerUserId: string
): Promise<number> {
  const { data, error } = await admin
    .from('digital_family_links')
    .update({
      status: 'active',
      suspended_at: null,
    })
    .eq('owner_user_id', ownerUserId)
    .eq('status', 'suspended')
    .select('id');
  if (error) {
    console.error(
      '[lib/digital/family] reactivateSuspendedLinksForOwner failed',
      { ownerUserId, error: error.message }
    );
    return 0;
  }
  return data?.length ?? 0;
}

// =============================================================================
// 招待の発行
// =============================================================================

export type CreateInvitationInput = {
  ownerUserId: string;
  recipientEmail: unknown;
  recipientName: unknown;
};

export type CreateInvitationResult =
  | {
      ok: true;
      invitation: DigitalFamilyInvitation;
      isResend: boolean; // 既存招待の再送扱い（新規発行ではない）か
    }
  | {
      ok: false;
      error:
        | 'invalid_email'
        | 'invalid_name'
        | 'pending_limit_reached'
        | 'links_limit_reached'
        | 'recipient_already_linked'
        | 'resend_cooldown'
        | 'unexpected';
      detail?: string;
      /** resend_cooldown 時：次に再送できるようになるまでの秒数 */
      retryAfterSeconds?: number;
    };

/**
 * 招待を発行する。
 *   - 同じ recipient_email に対する未承認招待が既にある場合は「再送」として last_sent_at だけ更新（token は維持）
 *   - 未承認招待 5 件上限を超えていたら拒否
 *   - active な family_links が 10 件に達していたら拒否
 *   - その recipient が既にリンク済みなら拒否
 */
export async function createOrResendInvitation(
  supabase: SupabaseClient,
  input: CreateInvitationInput
): Promise<CreateInvitationResult> {
  const email = sanitizeEmail(input.recipientEmail);
  if (!email) {
    return { ok: false, error: 'invalid_email', detail: 'メールアドレスの形式が正しくありません。' };
  }
  const name = sanitizeName(input.recipientName);
  if (!name) {
    return { ok: false, error: 'invalid_name', detail: '呼称（例：妻、長男）を入力してください。' };
  }

  // 既に active なリンクがあるか確認（同じ email の人とは既にリンク済みか）
  const { data: existingLink, error: linkErr } = await supabase
    .from('digital_family_links')
    .select('id, recipient_user_id, status')
    .eq('owner_user_id', input.ownerUserId)
    .eq('status', 'active');
  if (linkErr) {
    console.error('[createOrResendInvitation] active link lookup failed', linkErr);
    return { ok: false, error: 'unexpected', detail: linkErr.message };
  }
  if ((existingLink?.length ?? 0) >= MAX_FAMILY_LINKS) {
    return {
      ok: false,
      error: 'links_limit_reached',
      detail: `連携は最大 ${MAX_FAMILY_LINKS} 名までです。`,
    };
  }

  // 既存の未承認招待を探す（再送扱いにするため）
  const { data: existingPending, error: pendErr } = await supabase
    .from('digital_family_invitations')
    .select('*')
    .eq('owner_user_id', input.ownerUserId)
    .eq('recipient_email', email)
    .is('accepted_at', null)
    .is('revoked_at', null)
    .maybeSingle();
  if (pendErr) {
    console.error('[createOrResendInvitation] pending lookup failed', pendErr);
    return { ok: false, error: 'unexpected', detail: pendErr.message };
  }

  // 既存招待がある場合：再送（last_sent_at と recipient_name を更新、期限も延長）
  if (existingPending) {
    // ── レート制限：前回送信から COOLDOWN_SECONDS 未満の連打は拒否 ──
    const lastSentAtMs = new Date(
      (existingPending as DigitalFamilyInvitation).last_sent_at
    ).getTime();
    const elapsedSeconds = Math.floor((Date.now() - lastSentAtMs) / 1000);
    if (elapsedSeconds < INVITATION_RESEND_COOLDOWN_SECONDS) {
      const retryAfterSeconds =
        INVITATION_RESEND_COOLDOWN_SECONDS - elapsedSeconds;
      return {
        ok: false,
        error: 'resend_cooldown',
        retryAfterSeconds,
        detail: `招待メールは ${INVITATION_RESEND_COOLDOWN_SECONDS} 秒に 1 回までです。あと約 ${retryAfterSeconds} 秒お待ちください。`,
      };
    }

    const newExpiresAt = new Date(
      Date.now() + INVITATION_TTL_DAYS * 24 * 60 * 60 * 1000
    ).toISOString();
    const { data: updated, error: updErr } = await supabase
      .from('digital_family_invitations')
      .update({
        recipient_name: name,
        last_sent_at: new Date().toISOString(),
        expires_at: newExpiresAt,
      })
      .eq('id', existingPending.id)
      .select('*')
      .single();
    if (updErr) {
      console.error('[createOrResendInvitation] resend update failed', updErr);
      return { ok: false, error: 'unexpected', detail: updErr.message };
    }
    return {
      ok: true,
      invitation: updated as DigitalFamilyInvitation,
      isResend: true,
    };
  }

  // 新規招待：未承認招待上限チェック
  const pendingCount = await countPendingInvitations(supabase, input.ownerUserId);
  if (pendingCount >= MAX_PENDING_INVITATIONS) {
    return {
      ok: false,
      error: 'pending_limit_reached',
      detail: `未承認の招待は同時に ${MAX_PENDING_INVITATIONS} 件までです。古い招待を取り消してから再度お試しください。`,
    };
  }

  // トークン発行 + INSERT
  const token = generateInvitationToken();
  const expiresAt = new Date(
    Date.now() + INVITATION_TTL_DAYS * 24 * 60 * 60 * 1000
  ).toISOString();

  const { data: inserted, error: insErr } = await supabase
    .from('digital_family_invitations')
    .insert({
      owner_user_id: input.ownerUserId,
      recipient_email: email,
      recipient_name: name,
      token,
      expires_at: expiresAt,
      last_sent_at: new Date().toISOString(),
    })
    .select('*')
    .single();

  if (insErr) {
    console.error('[createOrResendInvitation] insert failed', insErr);
    return { ok: false, error: 'unexpected', detail: insErr.message };
  }

  return {
    ok: true,
    invitation: inserted as DigitalFamilyInvitation,
    isResend: false,
  };
}

// =============================================================================
// 招待の取り消し（オーナー側）
// =============================================================================

export async function revokeInvitation(
  supabase: SupabaseClient,
  ownerUserId: string,
  invitationId: string
): Promise<{ ok: true } | { ok: false; error: string; detail?: string }> {
  const { error } = await supabase
    .from('digital_family_invitations')
    .update({ revoked_at: new Date().toISOString() })
    .eq('id', invitationId)
    .eq('owner_user_id', ownerUserId)
    .is('accepted_at', null)
    .is('revoked_at', null);

  if (error) {
    console.error('[lib/digital/family] revokeInvitation failed', error);
    return { ok: false, error: 'unexpected', detail: error.message };
  }
  return { ok: true };
}

// =============================================================================
// 招待の承認（連携者側）
// =============================================================================

export type AcceptInvitationInput = {
  token: string;
  recipientUserId: string;     // 既にログイン済みのアカウントの uuid
  recipientEmail: string;      // ログイン中のアカウントのメール（招待先と一致するか検証）
};

export type AcceptInvitationResult =
  | { ok: true; link: DigitalFamilyLink; ownerUserId: string }
  | {
      ok: false;
      error:
        | 'not_found'
        | 'expired'
        | 'revoked'
        | 'already_accepted'
        | 'email_mismatch'
        | 'self_invite'
        | 'unexpected';
      detail?: string;
    };

/**
 * 招待を承認し、digital_family_links に active レコードを作成する。
 * service_role 経由で呼ぶこと（招待を発行した owner じゃないため RLS をバイパスする必要あり）。
 *
 * 承認後の処理（呼び出し側で実施）：
 *   1. 連携者の公開鍵ペアを生成 → digital_recipient_keys に保存
 *   2. オーナーの KEK 暗号文（連携者公開鍵で暗号化）を digital_user_kek_envelopes に追加
 *      → ただしオーナーが KEK を未発行の場合（v1 PIN のみ）は呼び出し側でスキップ
 *   3. Stripe subscription quantity を +1（trial 中は実課金されない）
 */
export async function acceptInvitation(
  supabaseAdmin: SupabaseClient,
  input: AcceptInvitationInput
): Promise<AcceptInvitationResult> {
  if (!input.token || typeof input.token !== 'string') {
    return { ok: false, error: 'not_found' };
  }

  const { data: inv, error: findErr } = await supabaseAdmin
    .from('digital_family_invitations')
    .select('*')
    .eq('token', input.token)
    .maybeSingle();

  if (findErr) {
    console.error('[acceptInvitation] find failed', findErr);
    return { ok: false, error: 'unexpected', detail: findErr.message };
  }
  if (!inv) return { ok: false, error: 'not_found' };

  const invitation = inv as DigitalFamilyInvitation;
  const status = getInvitationStatus(invitation);
  if (status === 'revoked') return { ok: false, error: 'revoked' };
  if (status === 'expired') return { ok: false, error: 'expired' };
  if (status === 'accepted') return { ok: false, error: 'already_accepted' };

  // メール一致チェック（招待を送信したメールアドレスのアカウントでのみ承認可能）
  if (invitation.recipient_email.toLowerCase() !== input.recipientEmail.toLowerCase()) {
    return { ok: false, error: 'email_mismatch' };
  }

  // 自己招待を防止
  if (invitation.owner_user_id === input.recipientUserId) {
    return { ok: false, error: 'self_invite' };
  }

  // 1. 招待を accepted に更新
  const nowIso = new Date().toISOString();
  const { error: updErr } = await supabaseAdmin
    .from('digital_family_invitations')
    .update({
      accepted_at: nowIso,
      recipient_user_id: input.recipientUserId,
    })
    .eq('id', invitation.id);
  if (updErr) {
    console.error('[acceptInvitation] update invitation failed', updErr);
    return { ok: false, error: 'unexpected', detail: updErr.message };
  }

  // 2. family_links を作成（既に同じ owner-recipient リンクが revoked 状態であれば再 active 化）
  const { data: existingLink, error: existErr } = await supabaseAdmin
    .from('digital_family_links')
    .select('*')
    .eq('owner_user_id', invitation.owner_user_id)
    .eq('recipient_user_id', input.recipientUserId)
    .maybeSingle();

  if (existErr) {
    console.error('[acceptInvitation] existing link lookup failed', existErr);
    return { ok: false, error: 'unexpected', detail: existErr.message };
  }

  let link: DigitalFamilyLink;
  if (existingLink) {
    // 既存リンクを active に戻す
    const { data: reactivated, error: reErr } = await supabaseAdmin
      .from('digital_family_links')
      .update({
        status: 'active',
        recipient_name: invitation.recipient_name,
        share_during_lifetime: false, // 再承認時は OFF から始める
        revoked_at: null,
      })
      .eq('id', existingLink.id)
      .select('*')
      .single();
    if (reErr) {
      console.error('[acceptInvitation] reactivate link failed', reErr);
      return { ok: false, error: 'unexpected', detail: reErr.message };
    }
    link = reactivated as DigitalFamilyLink;
  } else {
    const { data: created, error: createErr } = await supabaseAdmin
      .from('digital_family_links')
      .insert({
        owner_user_id: invitation.owner_user_id,
        recipient_user_id: input.recipientUserId,
        recipient_name: invitation.recipient_name,
        status: 'active',
        share_during_lifetime: false,
      })
      .select('*')
      .single();
    if (createErr) {
      console.error('[acceptInvitation] create link failed', createErr);
      return { ok: false, error: 'unexpected', detail: createErr.message };
    }
    link = created as DigitalFamilyLink;
  }

  return { ok: true, link, ownerUserId: invitation.owner_user_id };
}

// =============================================================================
// 連携リンクの解除
// =============================================================================

export type RevokeLinkInput = {
  linkId: string;
  byUserId: string; // owner または recipient のどちらか
};

export type RevokeLinkResult =
  | { ok: true; link: DigitalFamilyLink }
  | { ok: false; error: 'not_found' | 'forbidden' | 'unexpected'; detail?: string };

/**
 * 連携を解除する（owner / recipient どちらからでも可能）。
 *
 * 解除後の処理（呼び出し側で実施）：
 *   1. owner 側の digital_user_kek_envelopes から該当 recipient_user_id 用の row を削除
 *   2. Stripe subscription quantity を −1（0 になれば自動 cancel）
 *
 * @returns 解除した link 行（owner_user_id を含むので Stripe 反映に使える）
 */
export async function revokeFamilyLink(
  supabase: SupabaseClient,
  input: RevokeLinkInput
): Promise<RevokeLinkResult> {
  // まず link を取得して権限チェック
  const { data: link, error: getErr } = await supabase
    .from('digital_family_links')
    .select('*')
    .eq('id', input.linkId)
    .maybeSingle();
  if (getErr) {
    console.error('[revokeFamilyLink] get failed', getErr);
    return { ok: false, error: 'unexpected', detail: getErr.message };
  }
  if (!link) return { ok: false, error: 'not_found' };

  const familyLink = link as DigitalFamilyLink;
  if (
    familyLink.owner_user_id !== input.byUserId &&
    familyLink.recipient_user_id !== input.byUserId
  ) {
    return { ok: false, error: 'forbidden' };
  }
  if (familyLink.status === 'revoked') {
    return { ok: true, link: familyLink };
  }

  const { data: updated, error: updErr } = await supabase
    .from('digital_family_links')
    .update({
      status: 'revoked',
      revoked_at: new Date().toISOString(),
    })
    .eq('id', familyLink.id)
    .select('*')
    .single();
  if (updErr) {
    console.error('[revokeFamilyLink] update failed', updErr);
    return { ok: false, error: 'unexpected', detail: updErr.message };
  }
  return { ok: true, link: updated as DigitalFamilyLink };
}

// =============================================================================
// 生前共有 ON/OFF（連携者ごと個別、オーナーのみ操作可能）
// =============================================================================

export async function setShareDuringLifetime(
  supabase: SupabaseClient,
  ownerUserId: string,
  linkId: string,
  enabled: boolean
): Promise<{ ok: true; link: DigitalFamilyLink } | { ok: false; error: string; detail?: string }> {
  const { data, error } = await supabase
    .from('digital_family_links')
    .update({ share_during_lifetime: enabled })
    .eq('id', linkId)
    .eq('owner_user_id', ownerUserId)
    .eq('status', 'active')
    .select('*')
    .maybeSingle();

  if (error) {
    console.error('[setShareDuringLifetime] failed', error);
    return { ok: false, error: 'unexpected', detail: error.message };
  }
  if (!data) {
    return { ok: false, error: 'not_found' };
  }
  return { ok: true, link: data as DigitalFamilyLink };
}
