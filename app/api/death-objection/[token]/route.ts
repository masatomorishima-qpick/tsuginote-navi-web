/**
 * GET  /api/death-objection/[token] : 異議申立ページで表示する情報を返す
 * POST /api/death-objection/[token] : 「私は生きています」のワンクリック異議申立を受付
 *
 * トークン単独で認証する（ログイン不要）。設計上、URL は本人のメールアドレス宛にしか
 * 送られていないため、トークンを知っているのは原則本人のみ。
 *
 * セキュリティ補強：
 *   - トークンは 48 文字以上の URL-safe Base64
 *   - 受付は status='awaiting_objection_period' かつ deadline 内のみ
 *   - 受付後は通報者・運営にも通知メール送信
 */

import { NextResponse } from 'next/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import {
  getNoticeByObjectionToken,
  submitObjection,
} from '@/lib/digital/deathNotice';
import { getDisplayNameById } from '@/lib/digital/profile';
import { sendEmail } from '@/lib/email/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getOpsEmail(): string {
  return process.env.OPS_NOTIFICATION_EMAIL ?? 'ops@tsuginotenavi.jp';
}

// =============================================================================
// GET：ページ表示用情報を返す
// =============================================================================

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const admin = createAdminSupabaseClient();
    const notice = await getNoticeByObjectionToken(admin, token);
    if (!notice) {
      return NextResponse.json(
        { ok: false, error: 'not_found' },
        { status: 404 }
      );
    }

    // owner / notifier の表示名（任意）
    let ownerDisplayName: string | null = null;
    let notifierDisplayName: string | null = null;
    try {
      const owner = await getDisplayNameById(admin, notice.owner_user_id);
      ownerDisplayName =
        owner?.display_name ?? owner?.preferred_name ?? null;
    } catch {
      // ignore
    }
    try {
      const notifier = await getDisplayNameById(admin, notice.notifier_user_id);
      notifierDisplayName =
        notifier?.display_name ?? notifier?.preferred_name ?? null;
    } catch {
      // ignore
    }

    return NextResponse.json({
      ok: true,
      notice: {
        status: notice.status,
        reported_death_date: notice.reported_death_date,
        objection_deadline: notice.objection_deadline,
        objection_at: notice.objection_at,
        owner_display_name: ownerDisplayName,
        notifier_display_name: notifierDisplayName,
      },
    });
  } catch (err) {
    const detail = err instanceof Error ? err.message : 'unexpected_error';
    return NextResponse.json(
      { ok: false, error: 'unexpected', detail },
      { status: 500 }
    );
  }
}

// =============================================================================
// POST：「私は生きています」異議申立を受付
// =============================================================================

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const admin = createAdminSupabaseClient();

    const result = await submitObjection(admin, token);
    if (!result.ok) {
      const statusByError: Record<string, number> = {
        not_found: 404,
        invalid_status: 409,
        deadline_passed: 410,
        unexpected: 500,
      };
      return NextResponse.json(
        { ok: false, error: result.error, detail: result.detail },
        { status: statusByError[result.error] ?? 500 }
      );
    }

    const notice = result.notice;

    // 異議申立を運営と通報者にも通知（透明性確保）
    try {
      // 本人情報
      let ownerDisplayName = 'ご本人';
      try {
        const owner = await getDisplayNameById(admin, notice.owner_user_id);
        ownerDisplayName =
          owner?.display_name ?? owner?.preferred_name ?? ownerDisplayName;
      } catch {
        // ignore
      }

      // 通報者の email
      let notifierEmail = '';
      try {
        const { data: u } = await admin.auth.admin.getUserById(
          notice.notifier_user_id
        );
        notifierEmail = u?.user?.email ?? '';
      } catch {
        // ignore
      }

      const objectionMessage = `ご本人より「私は生きています」との異議申立がございました。
当該の死亡通知はこの時点で取り下げとなります。

  本人　：${ownerDisplayName}
  通知 ID：${notice.id}
  異議受付日時：${new Date().toISOString()}`;

      // 通報者通知
      if (notifierEmail) {
        await sendEmail({
          to: notifierEmail,
          subject: `[つぎの手ナビ] ${ownerDisplayName} さまから異議申立がございました`,
          text: `${objectionMessage}

ご報告いただいた死亡通知は取り下げとなりました。お気持ちは丁寧に受け取っており、
ご本人がご無事であることを最優先と判断しました。何卒ご了承ください。

──
つぎの手ナビ デジタル資産
info@blueadventures.jp
`,
          html: `<p>${escapeHtml(objectionMessage).replace(/\n/g, '<br>')}</p>
<p>ご報告いただいた死亡通知は取り下げとなりました。お気持ちは丁寧に受け取っており、
ご本人がご無事であることを最優先と判断しました。何卒ご了承ください。</p>`,
        });
      }

      // 運営通知
      await sendEmail({
        to: getOpsEmail(),
        subject: `[つぎの手ナビ] 異議申立により取り下げ（${ownerDisplayName}）`,
        text: objectionMessage,
        html: `<pre>${escapeHtml(objectionMessage)}</pre>`,
      });
    } catch (mailErr) {
      console.warn('[death-objection POST] mail dispatch failed', mailErr);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    const detail = err instanceof Error ? err.message : 'unexpected_error';
    return NextResponse.json(
      { ok: false, error: 'unexpected', detail },
      { status: 500 }
    );
  }
}
