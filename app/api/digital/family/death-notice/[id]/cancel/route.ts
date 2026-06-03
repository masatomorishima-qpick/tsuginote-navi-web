/**
 * POST /api/digital/family/death-notice/[id]/cancel
 *
 * 通報者本人が、自分が出した死亡通知を取り消す API。
 *
 * 条件：
 *   - ログイン済み
 *   - 通知の notifier_user_id がログインユーザーと一致
 *   - status='pending'（運営確認前のみ）
 *   - 申請から 24 時間以内
 *
 * 処理：cancelByNotifier を呼ぶ。status='rejected' + センチネル
 *   (ops_verifier='__notifier_self_cancel__') で「通報者本人の取り消し」を表現。
 *   これにより、後の再申請レート制限カウントから除外される。
 *
 * メール：オーナーと運営に「取り消されました」を通知。
 *   - オーナー：心配されないようご報告
 *   - 運営：監査ログ
 */

import { NextResponse } from 'next/server';
import { createDigitalServerClient } from '@/lib/supabase/digitalServer';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { cancelByNotifier } from '@/lib/digital/deathNotice';
import { getDisplayNameById } from '@/lib/digital/profile';
import { getRecipientNameByOwner } from '@/lib/digital/family';
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

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: noticeId } = await params;

    // ① 認証
    const supabase = await createDigitalServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { ok: false, error: 'unauthorized' },
        { status: 401 }
      );
    }

    // ② 取り消し実行
    const admin = createAdminSupabaseClient();
    const result = await cancelByNotifier(admin, noticeId, user.id);
    if (!result.ok) {
      const statusByError: Record<string, number> = {
        not_found: 404,
        forbidden: 403,
        invalid_status: 409,
        cancel_window_expired: 409,
        unexpected: 500,
      };
      return NextResponse.json(
        { ok: false, error: result.error, detail: result.detail },
        { status: statusByError[result.error] ?? 500 }
      );
    }

    // ③ メール通知（失敗してもメイン処理は止めない）
    try {
      const notice = result.notice;

      // オーナー情報
      let ownerEmail = '';
      let ownerDisplayName = 'ご本人';
      try {
        const { data: u } = await admin.auth.admin.getUserById(
          notice.owner_user_id
        );
        ownerEmail = u?.user?.email ?? '';
      } catch {
        // ignore
      }
      try {
        const owner = await getDisplayNameById(admin, notice.owner_user_id);
        ownerDisplayName =
          owner?.display_name ?? owner?.preferred_name ?? ownerDisplayName;
      } catch {
        // ignore
      }

      // 通報者の呼称（オーナー視点で表示するため family_links.recipient_name 優先）
      let notifierName = '連携者の方';
      try {
        const recipientName = await getRecipientNameByOwner(
          admin,
          notice.owner_user_id,
          notice.notifier_user_id
        );
        if (recipientName) {
          notifierName = recipientName;
        } else {
          const notifier = await getDisplayNameById(
            admin,
            notice.notifier_user_id
          );
          notifierName =
            notifier?.display_name ??
            notifier?.preferred_name ??
            notifierName;
        }
      } catch {
        // ignore
      }

      // オーナーへの安心メール
      if (ownerEmail) {
        const subject = `[つぎの手ナビ] 先ほどの死亡通知は取り消されました（${notifierName} さま）`;
        const text = `${ownerDisplayName} さま

先ほど ${notifierName} さまからお預かりした死亡通知は、申請者ご本人により取り消されました。
誤送信であった旨のお知らせです。何卒ご安心ください。

通知 ID：${notice.id}
取り消し日時：${new Date().toISOString()}

──
つぎの手ナビ デジタル資産
${getOpsEmail()}
`;
        await sendEmail({
          to: ownerEmail,
          subject,
          text,
          html: `<p>${escapeHtml(ownerDisplayName)} さま</p>
<p>先ほど <b>${escapeHtml(notifierName)}</b> さまからお預かりした死亡通知は、
申請者ご本人により取り消されました。誤送信であった旨のお知らせです。何卒ご安心ください。</p>
<p>通知 ID：${escapeHtml(notice.id)}<br>取り消し日時：${new Date().toISOString()}</p>`,
        });
      }

      // 運営への監査ログメール
      await sendEmail({
        to: getOpsEmail(),
        subject: `[つぎの手ナビ] 通報者本人による取り消し（${ownerDisplayName}）`,
        text: `通報者：${notifierName}
本人　：${ownerDisplayName}
通知 ID：${notice.id}
取り消し日時：${new Date().toISOString()}`,
      });
    } catch (mailErr) {
      console.warn(
        '[death-notice cancel POST] mail dispatch failed',
        mailErr
      );
    }

    return NextResponse.json({ ok: true, notice: result.notice });
  } catch (err) {
    const detail = err instanceof Error ? err.message : 'unexpected_error';
    console.error('[death-notice cancel POST] failed', detail);
    return NextResponse.json(
      { ok: false, error: 'unexpected', detail },
      { status: 500 }
    );
  }
}
