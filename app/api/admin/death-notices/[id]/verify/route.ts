/**
 * POST /api/admin/death-notices/[id]/verify
 *
 * 運営が書類確認 OK と判断したときに呼ぶ admin API。
 *
 * 処理：
 *   1. CRON_SECRET ベース認証で運営アクセスを担保
 *   2. verifyByOps を実行（status='awaiting_objection_period'、objection_token 発行、14 日 deadline）
 *   3. 本人に異議申立 URL 入りのメールを送信
 *
 * 入力（JSON）：
 *   { ops_verifier: string }   運営担当者の名前またはイニシャル（監査用）
 *
 * 注：Phase 1 では運営 UI を作らず、運営はターミナルから curl で叩くか、
 *     簡易管理ツールから呼び出す想定。Phase 2 で管理画面を構築する。
 *
 * curl 例：
 *   curl -X POST "http://localhost:3000/api/admin/death-notices/{id}/verify" \
 *     -H "Authorization: Bearer $CRON_SECRET" \
 *     -H "Content-Type: application/json" \
 *     -d '{"ops_verifier": "山田"}'
 */

import { NextResponse } from 'next/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { verifyByOps, rejectByOps } from '@/lib/digital/deathNotice';
import { getDisplayNameById } from '@/lib/digital/profile';
import { sendObjectionInvitationEmail } from '@/lib/email/deathNotice';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function verifyAdminAuth(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        '[admin/death-notices/verify] CRON_SECRET 未設定のため auth スキップ（dev のみ）'
      );
      return true;
    }
    return false;
  }
  const auth = req.headers.get('authorization');
  return auth === `Bearer ${secret}`;
}

function getAppUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL ?? 'https://tsuginotenavi.jp').replace(
    /\/+$/,
    ''
  );
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // ① 認証
  if (!verifyAdminAuth(req)) {
    return NextResponse.json(
      { ok: false, error: 'unauthorized' },
      { status: 401 }
    );
  }

  try {
    const { id: noticeId } = await params;
    const body = (await req.json().catch(() => ({}))) as {
      ops_verifier?: unknown;
      action?: unknown;          // 'verify' | 'reject'
      reject_reason?: unknown;
    };

    const opsVerifier =
      typeof body.ops_verifier === 'string' && body.ops_verifier.trim()
        ? body.ops_verifier.trim()
        : 'ops';
    const action = body.action === 'reject' ? 'reject' : 'verify';

    const admin = createAdminSupabaseClient();

    // ② action による分岐
    if (action === 'reject') {
      const reason =
        typeof body.reject_reason === 'string'
          ? body.reject_reason.trim()
          : '書類不備';
      const result = await rejectByOps(admin, noticeId, opsVerifier, reason);
      if (!result.ok) {
        return NextResponse.json(
          { ok: false, error: result.error, detail: result.detail },
          { status: 400 }
        );
      }
      return NextResponse.json({ ok: true, notice: result.notice });
    }

    // verify: 通知を確認 OK にし、本人へ異議申立メールを送信
    const result = await verifyByOps(admin, noticeId, opsVerifier);
    if (!result.ok) {
      return NextResponse.json(
        { ok: false, error: result.error, detail: result.detail },
        { status: 400 }
      );
    }
    const notice = result.notice;

    // ③ 本人へ異議申立 URL 入りメール送信
    if (notice.objection_token && notice.objection_deadline) {
      try {
        // 本人 email
        let ownerEmail = '';
        try {
          const { data: u } = await admin.auth.admin.getUserById(
            notice.owner_user_id
          );
          ownerEmail = u?.user?.email ?? '';
        } catch {
          ownerEmail = '';
        }
        // 表示名取得
        let ownerName = 'ご本人';
        let notifierName = '連携者の方';
        try {
          const owner = await getDisplayNameById(admin, notice.owner_user_id);
          ownerName = owner?.display_name ?? owner?.preferred_name ?? ownerName;
        } catch {
          // ignore
        }
        try {
          const notifier = await getDisplayNameById(
            admin,
            notice.notifier_user_id
          );
          notifierName =
            notifier?.display_name ?? notifier?.preferred_name ?? notifierName;
        } catch {
          // ignore
        }

        if (ownerEmail) {
          const objectionUrl = `${getAppUrl()}/death-objection/${notice.objection_token}`;
          await sendObjectionInvitationEmail({
            recipientEmail: ownerEmail,
            ownerDisplayName: ownerName,
            notifierDisplayName: notifierName,
            objectionUrl,
            deadline: new Date(notice.objection_deadline),
          });
        } else {
          console.warn('[admin/death-notices/verify] owner email not found', {
            noticeId,
          });
        }
      } catch (mailErr) {
        console.warn(
          '[admin/death-notices/verify] objection mail dispatch failed',
          mailErr
        );
      }
    }

    return NextResponse.json({
      ok: true,
      notice,
    });
  } catch (err) {
    const detail = err instanceof Error ? err.message : 'unexpected_error';
    console.error('[admin/death-notices/verify] failed', detail);
    return NextResponse.json(
      { ok: false, error: 'unexpected', detail },
      { status: 500 }
    );
  }
}
