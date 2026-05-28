/**
 * lib/digital/deathNotice.ts
 *
 * 死亡通知の作成・運営確認・本人異議申立・開示処理の中核ロジック。
 *
 * フロー（DESIGN_Phase1_PerRecipientBilling.md §5 参照）：
 *   1. 連携者が createDeathNotice で通知を作成（status='pending'）
 *   2. 死亡診断書ファイルを digital_death_documents に保存
 *   3. 運営が Supabase Dashboard 等で書類確認 → verifyByOps（status='awaiting_objection_period'、
 *      objection_token を発行、objection_deadline = +14 日、本人へ異議申立メール送信）
 *   4. 本人が異議申立する場合：submitObjection（status='rejected'）
 *   5. 異議無く 14 日経過 → Vercel Cron が runDisclosure を呼んで status='disclosed'、
 *      連携者全員に開示通知メール送信、本人のサブスクは即時 cancel
 *
 * セキュリティ：
 *   - service_role 経由で操作する関数が多い（運営判断・Cron 処理など）
 *   - 通報者が誤った通知をする可能性を考慮し、通報履歴の参照を支援
 *   - 本人異議申立は 48 文字以上のトークンでのみ可（パスワード不要のワンクリック）
 */

import 'server-only';
import { randomBytes } from 'node:crypto';
import type { SupabaseClient } from '@supabase/supabase-js';

// =============================================================================
// 定数
// =============================================================================

/** 異議申立期間（日数）。Q19 で確定済み */
export const OBJECTION_PERIOD_DAYS = 14;

/** 異議申立トークンの長さ（生バイト、URL-safe Base64 で 48 文字以上） */
const OBJECTION_TOKEN_BYTES = 36;

// =============================================================================
// 型定義
// =============================================================================

export type DeathNoticeStatus =
  | 'pending'                    // 連携者から通知が来た直後。書類確認待ち
  | 'awaiting_objection_period'  // 運営確認 OK。本人異議申立期間中（最大 14 日）
  | 'rejected'                   // 本人異議申立、または運営却下
  | 'disclosed';                 // 14 日経過 + 異議なしで開示済み

export type DigitalDeathNotice = {
  id: string;
  owner_user_id: string;
  notifier_user_id: string;
  reported_death_date: string;
  notifier_relation: string | null;
  notifier_note: string | null;
  status: DeathNoticeStatus;
  ops_verifier: string | null;
  ops_verified_at: string | null;
  ops_rejected_reason: string | null;
  objection_token: string | null;
  objection_deadline: string | null;
  objection_at: string | null;
  disclosed_at: string | null;
  created_at: string;
};

// =============================================================================
// ユーティリティ
// =============================================================================

function generateObjectionToken(): string {
  return randomBytes(OBJECTION_TOKEN_BYTES)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function sanitizeText(input: unknown, maxLen: number): string | null {
  if (typeof input !== 'string') return null;
  const cleaned = input.replace(/[ --]/g, '').trim();
  if (cleaned.length === 0) return null;
  return cleaned.slice(0, maxLen);
}

function isValidIsoDate(input: unknown): input is string {
  if (typeof input !== 'string') return false;
  // YYYY-MM-DD 形式
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input)) return false;
  const d = new Date(input);
  return !Number.isNaN(d.getTime());
}

// =============================================================================
// 死亡通知の作成（連携者から）
// =============================================================================

export type CreateDeathNoticeInput = {
  ownerUserId: string;
  notifierUserId: string;
  reportedDeathDate: unknown;          // YYYY-MM-DD
  notifierRelation?: unknown;          // 「妻」「長男」など
  notifierNote?: unknown;              // 経緯の自由記述
};

export type CreateDeathNoticeResult =
  | { ok: true; notice: DigitalDeathNotice }
  | {
      ok: false;
      error:
        | 'invalid_date'
        | 'invalid_relation'
        | 'not_linked'
        | 'self_notification'
        | 'duplicate_pending'
        | 'unexpected';
      detail?: string;
    };

/**
 * 死亡通知を作成する。
 *
 * 前提：通報者が当該 owner の active な family_link の recipient であること。
 *
 * 重複防止：同じ owner に対する pending / awaiting_objection_period の通知が既に存在する場合は
 * duplicate_pending を返す。複数の連携者が独立に通知することを想定しているが、
 * 同じ 1 件の通知に対して複数のステータス並行を避けるため。
 */
export async function createDeathNotice(
  admin: SupabaseClient,
  input: CreateDeathNoticeInput
): Promise<CreateDeathNoticeResult> {
  // 入力バリデーション
  if (!isValidIsoDate(input.reportedDeathDate)) {
    return {
      ok: false,
      error: 'invalid_date',
      detail: '逝去日は YYYY-MM-DD 形式でご入力ください。',
    };
  }
  if (input.ownerUserId === input.notifierUserId) {
    return { ok: false, error: 'self_notification' };
  }
  const reportedDeathDate = input.reportedDeathDate;
  const notifierRelation = sanitizeText(input.notifierRelation, 30);
  if (!notifierRelation) {
    return {
      ok: false,
      error: 'invalid_relation',
      detail: 'ご本人とのご関係（続柄）をご入力ください。',
    };
  }
  const notifierNote = sanitizeText(input.notifierNote, 500);

  // 連携関係を確認
  const { data: link, error: linkErr } = await admin
    .from('digital_family_links')
    .select('id, status')
    .eq('owner_user_id', input.ownerUserId)
    .eq('recipient_user_id', input.notifierUserId)
    .eq('status', 'active')
    .maybeSingle();
  if (linkErr) {
    console.error('[createDeathNotice] link lookup failed', linkErr);
    return { ok: false, error: 'unexpected', detail: linkErr.message };
  }
  if (!link) {
    return {
      ok: false,
      error: 'not_linked',
      detail:
        'この方からの連携を受けていない、または連携が解除されているため、通知を作成できません。',
    };
  }

  // 既存の進行中通知をチェック
  const { data: existing } = await admin
    .from('digital_death_notices')
    .select('id, status')
    .eq('owner_user_id', input.ownerUserId)
    .in('status', ['pending', 'awaiting_objection_period'])
    .maybeSingle();
  if (existing) {
    return {
      ok: false,
      error: 'duplicate_pending',
      detail:
        '既に同じ方についての死亡通知が確認中です。重ねての通知は不要です。',
    };
  }

  // INSERT
  const { data: created, error: insErr } = await admin
    .from('digital_death_notices')
    .insert({
      owner_user_id: input.ownerUserId,
      notifier_user_id: input.notifierUserId,
      reported_death_date: reportedDeathDate,
      notifier_relation: notifierRelation,
      notifier_note: notifierNote,
      status: 'pending',
    })
    .select('*')
    .single();
  if (insErr) {
    console.error('[createDeathNotice] insert failed', insErr);
    return { ok: false, error: 'unexpected', detail: insErr.message };
  }

  return { ok: true, notice: created as DigitalDeathNotice };
}

// =============================================================================
// 取得系
// =============================================================================

/** 本人または連携者が、自分に関わる通知を一覧取得 */
export async function listNoticesForUser(
  supabase: SupabaseClient,
  userId: string
): Promise<DigitalDeathNotice[]> {
  const { data, error } = await supabase
    .from('digital_death_notices')
    .select('*')
    .or(`owner_user_id.eq.${userId},notifier_user_id.eq.${userId}`)
    .order('created_at', { ascending: false });
  if (error) {
    console.error('[listNoticesForUser] failed', error);
    return [];
  }
  return (data ?? []) as DigitalDeathNotice[];
}

/** 異議申立 URL の token から通知を引き当てる（パスワード不要のワンクリック用） */
export async function getNoticeByObjectionToken(
  admin: SupabaseClient,
  token: string
): Promise<DigitalDeathNotice | null> {
  if (typeof token !== 'string' || token.length < 32) return null;
  const { data } = await admin
    .from('digital_death_notices')
    .select('*')
    .eq('objection_token', token)
    .maybeSingle();
  return (data as DigitalDeathNotice | null) ?? null;
}

/** 同一通報者からの過去通知数（運営判断補助。複数あれば要注意フラグ） */
export async function countRecentNoticesByNotifier(
  admin: SupabaseClient,
  notifierUserId: string,
  withinDays = 90
): Promise<number> {
  const since = new Date(Date.now() - withinDays * 24 * 60 * 60 * 1000);
  const { count, error } = await admin
    .from('digital_death_notices')
    .select('id', { count: 'exact', head: true })
    .eq('notifier_user_id', notifierUserId)
    .gt('created_at', since.toISOString());
  if (error) return 0;
  return count ?? 0;
}

// =============================================================================
// 運営確認・却下
// =============================================================================

/**
 * 運営が書類確認 OK と判断したときに呼ぶ。
 *   - status='pending' → 'awaiting_objection_period'
 *   - ops_verifier / ops_verified_at をセット
 *   - objection_token を発行
 *   - objection_deadline = now + 14 日
 *
 * 戻り値の objection_token を、本人への異議申立メールの URL に埋めて送信する。
 */
export async function verifyByOps(
  admin: SupabaseClient,
  noticeId: string,
  opsVerifier: string
): Promise<
  | { ok: true; notice: DigitalDeathNotice }
  | { ok: false; error: string; detail?: string }
> {
  // 既存 notice を確認
  const { data: existing, error: getErr } = await admin
    .from('digital_death_notices')
    .select('*')
    .eq('id', noticeId)
    .maybeSingle();
  if (getErr) {
    return { ok: false, error: 'unexpected', detail: getErr.message };
  }
  if (!existing) return { ok: false, error: 'not_found' };
  if (existing.status !== 'pending') {
    return {
      ok: false,
      error: 'invalid_status',
      detail: `現在のステータス（${existing.status}）からは確認操作できません。`,
    };
  }

  const now = new Date();
  const deadline = new Date(
    now.getTime() + OBJECTION_PERIOD_DAYS * 24 * 60 * 60 * 1000
  );
  const token = generateObjectionToken();

  const { data: updated, error: updErr } = await admin
    .from('digital_death_notices')
    .update({
      status: 'awaiting_objection_period',
      ops_verifier: opsVerifier.slice(0, 100),
      ops_verified_at: now.toISOString(),
      objection_token: token,
      objection_deadline: deadline.toISOString(),
    })
    .eq('id', noticeId)
    .select('*')
    .single();

  if (updErr) {
    console.error('[verifyByOps] update failed', updErr);
    return { ok: false, error: 'unexpected', detail: updErr.message };
  }

  return { ok: true, notice: updated as DigitalDeathNotice };
}

/** 運営が書類不備等で却下するときに呼ぶ */
export async function rejectByOps(
  admin: SupabaseClient,
  noticeId: string,
  opsVerifier: string,
  reason: string
): Promise<
  | { ok: true; notice: DigitalDeathNotice }
  | { ok: false; error: string; detail?: string }
> {
  const { data: updated, error } = await admin
    .from('digital_death_notices')
    .update({
      status: 'rejected',
      ops_verifier: opsVerifier.slice(0, 100),
      ops_verified_at: new Date().toISOString(),
      ops_rejected_reason: reason.slice(0, 500),
    })
    .eq('id', noticeId)
    .in('status', ['pending', 'awaiting_objection_period'])
    .select('*')
    .maybeSingle();
  if (error) {
    return { ok: false, error: 'unexpected', detail: error.message };
  }
  if (!updated) {
    return { ok: false, error: 'not_found_or_invalid_status' };
  }
  return { ok: true, notice: updated as DigitalDeathNotice };
}

// =============================================================================
// 本人異議申立
// =============================================================================

/**
 * 本人が「私は生きています」と異議申立したときに呼ぶ。
 * status='awaiting_objection_period' のときのみ受付。
 */
export async function submitObjection(
  admin: SupabaseClient,
  token: string
): Promise<
  | { ok: true; notice: DigitalDeathNotice }
  | { ok: false; error: string; detail?: string }
> {
  const notice = await getNoticeByObjectionToken(admin, token);
  if (!notice) return { ok: false, error: 'not_found' };
  if (notice.status !== 'awaiting_objection_period') {
    return {
      ok: false,
      error: 'invalid_status',
      detail: `現在のステータス（${notice.status}）からは異議申立できません。`,
    };
  }
  if (notice.objection_deadline) {
    const deadline = new Date(notice.objection_deadline).getTime();
    if (deadline < Date.now()) {
      return { ok: false, error: 'deadline_passed' };
    }
  }

  const { data: updated, error } = await admin
    .from('digital_death_notices')
    .update({
      status: 'rejected',
      objection_at: new Date().toISOString(),
    })
    .eq('id', notice.id)
    .select('*')
    .single();
  if (error) {
    return { ok: false, error: 'unexpected', detail: error.message };
  }
  return { ok: true, notice: updated as DigitalDeathNotice };
}

// =============================================================================
// 14 日経過 → 開示処理（Cron Job から呼ばれる）
// =============================================================================

/**
 * objection_deadline を過ぎていて、まだ disclosed/rejected になっていない通知を
 * 一括取得して disclosed に遷移させる。
 *
 * 呼び出し側（Cron）でやること：
 *   - 各 notice について：
 *     1. このメソッドで status を 'disclosed' に更新
 *     2. その owner の連携者全員にメール送信
 *     3. その owner の Stripe subscription を即時 cancel
 */
export async function listExpiredAwaitingNotices(
  admin: SupabaseClient,
  limit = 100
): Promise<DigitalDeathNotice[]> {
  const now = new Date().toISOString();
  const { data, error } = await admin
    .from('digital_death_notices')
    .select('*')
    .eq('status', 'awaiting_objection_period')
    .lt('objection_deadline', now)
    .limit(limit);
  if (error) {
    console.error('[listExpiredAwaitingNotices] failed', error);
    return [];
  }
  return (data ?? []) as DigitalDeathNotice[];
}

/**
 * 開示完了から一定日数経過した disclosed 通知を取得（書類自動削除 Cron 用）。
 * cutoffMs より過去に disclosed_at が設定されている disclosed 通知を返す。
 */
export async function listDisclosedNoticesOlderThan(
  admin: SupabaseClient,
  daysAfterDisclosure: number,
  limit = 100
): Promise<DigitalDeathNotice[]> {
  const cutoff = new Date(
    Date.now() - daysAfterDisclosure * 24 * 60 * 60 * 1000
  ).toISOString();
  const { data, error } = await admin
    .from('digital_death_notices')
    .select('*')
    .eq('status', 'disclosed')
    .lt('disclosed_at', cutoff)
    .limit(limit);
  if (error) {
    console.error('[listDisclosedNoticesOlderThan] failed', error);
    return [];
  }
  return (data ?? []) as DigitalDeathNotice[];
}

/** 単一の notice を disclosed 状態に更新する */
export async function markDisclosed(
  admin: SupabaseClient,
  noticeId: string
): Promise<
  | { ok: true; notice: DigitalDeathNotice }
  | { ok: false; error: string; detail?: string }
> {
  const { data: updated, error } = await admin
    .from('digital_death_notices')
    .update({
      status: 'disclosed',
      disclosed_at: new Date().toISOString(),
    })
    .eq('id', noticeId)
    .eq('status', 'awaiting_objection_period')
    .select('*')
    .maybeSingle();
  if (error) {
    return { ok: false, error: 'unexpected', detail: error.message };
  }
  if (!updated) {
    return { ok: false, error: 'not_found_or_invalid_status' };
  }
  return { ok: true, notice: updated as DigitalDeathNotice };
}

// =============================================================================
// 表示用ヘルパー
// =============================================================================

export const DEATH_NOTICE_STATUS_LABELS: Record<DeathNoticeStatus, string> = {
  pending: '書類確認中',
  awaiting_objection_period: 'ご本人への確認中（異議申立期間）',
  rejected: '取り下げ済み',
  disclosed: '開示済み',
};
