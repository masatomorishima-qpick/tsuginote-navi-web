/**
 * POST /api/digital/family/death-notice
 *
 * 連携者が死亡通知を作成する API。
 *
 * 入力（JSON）：
 *   {
 *     owner_user_id: string;
 *     reported_death_date: string;   // YYYY-MM-DD
 *     notifier_relation?: string;    // 「妻」「長男」など
 *     notifier_note?: string;        // 経緯の自由記述
 *     agreed: boolean;               // 確認パネルへの同意（必須）
 *   }
 *
 * 処理：
 *   1. ログインユーザーが当該 owner の active な連携者か RLS で担保（INSERT ポリシー）
 *   2. createDeathNotice で row 作成
 *   3. 本人に「死亡通知を受け取りました」即時通知メール送信
 *   4. 他の連携者全員にも「逝去のご報告があり確認中です」通知メール送信（透明性確保）
 *   5. 運営に通知メール（書類確認依頼）
 */

import { NextResponse } from 'next/server';
import { createDigitalServerClient } from '@/lib/supabase/digitalServer';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { createDeathNotice } from '@/lib/digital/deathNotice';
import {
  getRecipientNameByOwner,
  listLinksByOwner,
} from '@/lib/digital/family';
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

function getAppUrl(): string {
  const url = process.env.NEXT_PUBLIC_APP_URL;
  if (!url) return 'https://tsuginotenavi.jp';
  return url.replace(/\/+$/, '');
}

export async function POST(req: Request) {
  try {
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

    // ② 入力
    const body = (await req.json().catch(() => ({}))) as {
      owner_user_id?: unknown;
      reported_death_date?: unknown;
      notifier_relation?: unknown;
      notifier_note?: unknown;
      agreed?: unknown;
    };

    if (typeof body.owner_user_id !== 'string' || !body.owner_user_id) {
      return NextResponse.json(
        { ok: false, error: 'invalid_owner', detail: '通知対象のユーザー ID が指定されていません。' },
        { status: 400 }
      );
    }
    if (body.agreed !== true) {
      return NextResponse.json(
        {
          ok: false,
          error: 'agreement_required',
          detail: '注意事項にご同意のうえ送信してください。',
        },
        { status: 400 }
      );
    }

    const admin = createAdminSupabaseClient();

    // ③ 通知作成
    const created = await createDeathNotice(admin, {
      ownerUserId: body.owner_user_id,
      notifierUserId: user.id,
      reportedDeathDate: body.reported_death_date,
      notifierRelation: body.notifier_relation,
      notifierNote: body.notifier_note,
    });

    if (!created.ok) {
      const statusByError: Record<string, number> = {
        invalid_date: 400,
        invalid_relation: 400,
        not_linked: 403,
        self_notification: 400,
        duplicate_pending: 409,
        same_owner_cooldown: 429,           // 同一 owner、cooldown 中
        same_owner_lifetime_exceeded: 429,  // 同一 owner、生涯上限超過
        notifier_rate_limited: 429,         // 通報者の 30 日合算上限
        unexpected: 500,
      };
      return NextResponse.json(
        {
          ok: false,
          error: created.error,
          detail: created.detail,
          // cooldown エラー時はクライアント表示用に retry_after_days を返す
          retry_after_days:
            'retryAfterDays' in created ? created.retryAfterDays : undefined,
        },
        { status: statusByError[created.error] ?? 500 }
      );
    }

    const notice = created.notice;

    // ④ 並行で：本人通知 / 他連携者通知 / 運営通知
    //    すべて失敗してもメイン処理（通知作成）はロールバックしない
    try {
      // 通報者の表示名（任意）
      //   オーナー視点では、自分が招待時につけた呼称（family_links.recipient_name）が
      //   最も自然。次にプロフィール表示名、最後にフォールバック。
      let notifierName = '連携者の方';
      try {
        const recipientName = await getRecipientNameByOwner(
          admin,
          body.owner_user_id,
          user.id
        );
        if (recipientName) {
          notifierName = recipientName;
        } else {
          const profile = await getDisplayNameById(admin, user.id);
          notifierName =
            profile?.display_name ?? profile?.preferred_name ?? notifierName;
        }
      } catch {
        // ignore
      }

      // 本人の表示名（任意）
      let ownerName = 'ご本人';
      try {
        const profile = await getDisplayNameById(admin, body.owner_user_id);
        ownerName =
          profile?.display_name ?? profile?.preferred_name ?? ownerName;
      } catch {
        // ignore
      }

      // 本人 email
      let ownerEmail = '';
      try {
        const { data: u } = await admin.auth.admin.getUserById(body.owner_user_id);
        ownerEmail = u?.user?.email ?? '';
      } catch {
        // ignore
      }

      // 全連携者を取得（透明性確保のため通報者にもメールが届く）
      const allLinks = await listLinksByOwner(admin, body.owner_user_id);
      const activeLinks = allLinks.filter((l) => l.status === 'active');

      // 本人通知（即時）
      const helpUrl = `${getAppUrl()}/digital/settings/help`;
      if (ownerEmail) {
        await sendEmail({
          to: ownerEmail,
          subject: `[つぎの手ナビ] 死亡通知を受け取りました（重要：ご本人確認のお願い）`,
          html: ownerImmediateNoticeHtml({
            ownerName,
            notifierName,
            notifierEmail: user.email ?? '',
            reportedDeathDate: notice.reported_death_date,
            helpUrl,
          }),
          text: ownerImmediateNoticeText({
            ownerName,
            notifierName,
            notifierEmail: user.email ?? '',
            reportedDeathDate: notice.reported_death_date,
            helpUrl,
          }),
        });
      }

      // 連携者全員に通知（通報者本人も含む）
      const recipientEmails: string[] = [];
      for (const link of activeLinks) {
        try {
          const { data: u } = await admin.auth.admin.getUserById(
            link.recipient_user_id
          );
          const e = u?.user?.email;
          if (e) recipientEmails.push(e);
        } catch {
          // ignore individual lookup failure
        }
      }

      for (const e of recipientEmails) {
        await sendEmail({
          to: e,
          subject: `[つぎの手ナビ] ${ownerName} さまの逝去のご報告があり、確認中です`,
          html: recipientAwarenessHtml({ ownerName, notifierName, helpUrl }),
          text: recipientAwarenessText({ ownerName, notifierName, helpUrl }),
        });
      }

      // 運営通知（書類確認依頼）
      await sendEmail({
        to: getOpsEmail(),
        subject: `[要対応] 死亡通知が届きました（${ownerName}）`,
        html: opsNoticeHtml({
          ownerName,
          ownerEmail,
          notifierName,
          notifierEmail: user.email ?? '',
          reportedDeathDate: notice.reported_death_date,
          noticeId: notice.id,
        }),
        text: opsNoticeText({
          ownerName,
          ownerEmail,
          notifierName,
          notifierEmail: user.email ?? '',
          reportedDeathDate: notice.reported_death_date,
          noticeId: notice.id,
        }),
      });
    } catch (mailErr) {
      console.warn('[death-notice POST] mail dispatch failed', mailErr);
    }

    return NextResponse.json({ ok: true, notice });
  } catch (err) {
    const detail = err instanceof Error ? err.message : 'unexpected_error';
    console.error('[death-notice POST] failed', detail);
    return NextResponse.json(
      { ok: false, error: 'unexpected', detail },
      { status: 500 }
    );
  }
}

// =============================================================================
// メールテンプレート（最低限）
// =============================================================================

function ownerImmediateNoticeText(p: {
  ownerName: string;
  notifierName: string;
  notifierEmail: string;
  reportedDeathDate: string;
  helpUrl: string;
}): string {
  return `${p.ownerName} さま

つぎの手ナビ デジタル資産を運営しております。

本日、${p.notifierName}（${p.notifierEmail}）さまから、
${p.ownerName} さまがお亡くなりになったとのご報告がございました（${p.reportedDeathDate}）。

万が一の確認のため、ご本人にこのメールをお送りしております。
ご本人がこのメールをお読みいただいているということは、報告に何らかの誤りが
含まれている可能性があります。

【お手続きの流れ】
1. 運営にて、ご提出書類の確認を 5 営業日以内に行います。
2. 書類確認の完了後、改めて「異議申立用のリンク」を含むメールをお送りします。
3. 14 日以内に異議申立をいただければ、ご登録情報の開示は行われません。

お手続きの詳細はこちらをご確認ください：
${p.helpUrl}

──
つぎの手ナビ デジタル資産
お問い合わせ：info@blueadventures.jp
`;
}

function ownerImmediateNoticeHtml(p: {
  ownerName: string;
  notifierName: string;
  notifierEmail: string;
  reportedDeathDate: string;
  helpUrl: string;
}): string {
  return `<!DOCTYPE html>
<html lang="ja"><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','Hiragino Sans','Noto Sans JP',sans-serif;background:#f8fafc;color:#1e293b;">
  <div style="max-width:600px;margin:0 auto;padding:40px 24px;">
    <div style="background:#ffffff;border-radius:16px;padding:32px;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
      <h1 style="margin:0 0 16px;font-size:18px;color:#b91c1c;">大切な確認のお願い</h1>
      <p style="margin:0 0 12px;font-size:14px;line-height:1.7;">
        ${escapeHtml(p.ownerName)} さま、つぎの手ナビ デジタル資産を運営しております。
      </p>
      <p style="margin:0 0 12px;font-size:14px;line-height:1.7;">
        本日、<b>${escapeHtml(p.notifierName)}</b>（${escapeHtml(p.notifierEmail)}）さまから、
        ${escapeHtml(p.ownerName)} さまがお亡くなりになった（${escapeHtml(p.reportedDeathDate)}）
        とのご報告がございました。
      </p>
      <section style="margin:20px 0;padding:16px 20px;background:#fef2f2;border-left:4px solid #ef4444;border-radius:8px;">
        <p style="margin:0 0 8px;font-size:13px;line-height:1.7;color:#7f1d1d;">
          ご本人がこのメールをお読みになっているということは、報告に誤りが含まれている可能性があります。
        </p>
        <p style="margin:0;font-size:13px;line-height:1.7;color:#7f1d1d;font-weight:600;">
          お手続きの流れ：
        </p>
        <ol style="margin:6px 0 0;padding-left:20px;font-size:13px;line-height:1.7;color:#7f1d1d;">
          <li>運営にて、ご提出書類の確認を <b>5 営業日以内</b> に行います。</li>
          <li>書類確認の完了後、改めて<b>「異議申立用のリンク」</b>を含むメールをお送りします。</li>
          <li><b>14 日以内</b>に異議申立をいただければ、ご登録情報の開示は行われません。</li>
        </ol>
      </section>
      <p style="margin:16px 0 0;font-size:13px;line-height:1.7;color:#334155;">
        お手続きの詳細は <a href="${escapeHtml(p.helpUrl)}" style="color:#0369a1;text-decoration:underline;">ヘルプページ</a> をご確認ください。
      </p>
    </div>
    <div style="margin-top:24px;text-align:center;font-size:11px;color:#94a3b8;">
      つぎの手ナビ デジタル資産<br>info@blueadventures.jp
    </div>
  </div>
</body></html>`;
}

function recipientAwarenessText(p: {
  ownerName: string;
  notifierName: string;
  helpUrl: string;
}): string {
  return `${p.ownerName} さまについて、${p.notifierName} さまから逝去のご報告がございました。
現在、運営側で書類確認の手続きを進めております。

【今後の流れ】
・運営による書類確認は 5 営業日以内に行います。
・その後、ご本人への確認期間を経て、確認が取れた段階で
  ${p.ownerName} さまが生前にご指定された連携先の皆さま全員に、
  ご登録情報の開示通知をお送りいたします。

お手続きの詳細はこちらをご確認ください：
${p.helpUrl}

──
つぎの手ナビ デジタル資産
info@blueadventures.jp
`;
}

function recipientAwarenessHtml(p: {
  ownerName: string;
  notifierName: string;
  helpUrl: string;
}): string {
  return `<!DOCTYPE html>
<html lang="ja"><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','Hiragino Sans','Noto Sans JP',sans-serif;background:#f8fafc;color:#1e293b;">
  <div style="max-width:600px;margin:0 auto;padding:40px 24px;">
    <div style="background:#ffffff;border-radius:16px;padding:32px;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
      <h1 style="margin:0 0 16px;font-size:18px;">${escapeHtml(p.ownerName)} さまの逝去のご報告について</h1>
      <p style="margin:0 0 12px;font-size:14px;line-height:1.7;">
        ${escapeHtml(p.notifierName)} さまから、${escapeHtml(p.ownerName)} さまがお亡くなりになったとのご報告がございました。
        現在、運営側で書類確認の手続きを進めております。
      </p>
      <section style="margin:16px 0;padding:14px 18px;background:#f1f5f9;border-radius:8px;">
        <p style="margin:0 0 6px;font-size:13px;line-height:1.7;font-weight:600;color:#334155;">
          今後の流れ
        </p>
        <ul style="margin:4px 0 0;padding-left:20px;font-size:13px;line-height:1.7;color:#334155;">
          <li>運営による書類確認は <b>5 営業日以内</b> に行います。</li>
          <li>その後、ご本人への確認期間を経て、確認が取れた段階で
            ${escapeHtml(p.ownerName)} さまが生前にご指定された連携先の皆さま全員に、
            ご登録情報の開示通知をお送りいたします。
          </li>
        </ul>
      </section>
      <p style="margin:16px 0 0;font-size:13px;line-height:1.7;color:#334155;">
        お手続きの詳細は <a href="${escapeHtml(p.helpUrl)}" style="color:#0369a1;text-decoration:underline;">ヘルプページ</a> をご確認ください。
      </p>
    </div>
    <div style="margin-top:24px;text-align:center;font-size:11px;color:#94a3b8;">
      つぎの手ナビ デジタル資産<br>info@blueadventures.jp
    </div>
  </div>
</body></html>`;
}

function opsNoticeText(p: {
  ownerName: string;
  ownerEmail: string;
  notifierName: string;
  notifierEmail: string;
  reportedDeathDate: string;
  noticeId: string;
}): string {
  return `【死亡通知が届きました】

  通知 ID：${p.noticeId}
  本人　：${p.ownerName}（${p.ownerEmail}）
  通報者：${p.notifierName}（${p.notifierEmail}）
  逝去日：${p.reportedDeathDate}

Supabase Dashboard で digital_death_notices テーブルおよび digital_death_documents の書類を確認し、
verifyByOps または rejectByOps を実行してください。
`;
}

function opsNoticeHtml(p: {
  ownerName: string;
  ownerEmail: string;
  notifierName: string;
  notifierEmail: string;
  reportedDeathDate: string;
  noticeId: string;
}): string {
  return `<!DOCTYPE html>
<html lang="ja"><head><meta charset="utf-8"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;padding:24px;">
  <h2>死亡通知が届きました（要対応）</h2>
  <ul>
    <li>通知 ID：<code>${escapeHtml(p.noticeId)}</code></li>
    <li>本人：${escapeHtml(p.ownerName)}（${escapeHtml(p.ownerEmail)}）</li>
    <li>通報者：${escapeHtml(p.notifierName)}（${escapeHtml(p.notifierEmail)}）</li>
    <li>逝去日：${escapeHtml(p.reportedDeathDate)}</li>
  </ul>
  <p>Supabase Dashboard で digital_death_notices および digital_death_documents の書類を確認し、verifyByOps / rejectByOps を実行してください。</p>
</body></html>`;
}
