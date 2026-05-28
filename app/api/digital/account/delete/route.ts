/**
 * POST /api/digital/account/delete
 *
 * アカウントを削除する。
 *
 * リクエスト形式:
 *   { email_confirmation: string }
 *
 * 手順:
 *   1. 本人セッション必須（401 を返す）
 *   2. body.email_confirmation が本人のメールと**大小無視で完全一致**するか検証
 *   3. deleteAccount() を呼ぶ
 *   4. 成功時は ok: true を返すだけ。サインアウトはクライアント側で行う
 *      （このレスポンスが戻ってくる時点で Supabase Auth の session は
 *       無効化されているが、ブラウザの Cookie 掃除はクライアントでやる方が確実）
 */

import { NextRequest, NextResponse } from 'next/server';
import { createDigitalServerClient } from '@/lib/supabase/digitalServer';
import { deleteAccount } from '@/lib/digital/account';
import { sendAccountDeletionEmail } from '@/lib/email/accountDeletion';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
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

    let body: { email_confirmation?: unknown };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { ok: false, error: 'invalid_json' },
        { status: 400 }
      );
    }

    const confirmation =
      typeof body.email_confirmation === 'string'
        ? body.email_confirmation.trim().toLowerCase()
        : '';
    const expected = (user.email ?? '').trim().toLowerCase();

    if (!expected) {
      // 通常は発生しないが、email が無いアカウント（SMS 認証など）が
      // 将来的に入ってきた場合の安全弁
      return NextResponse.json(
        {
          ok: false,
          error: 'no_email_on_account',
          detail:
            'このアカウントには確認用メールアドレスが登録されていないため、画面からの退会はご利用いただけません。運営会社までお問い合わせください。',
        },
        { status: 400 }
      );
    }

    if (confirmation !== expected) {
      return NextResponse.json(
        {
          ok: false,
          error: 'email_mismatch',
          detail:
            'ご自身のメールアドレスと一致しませんでした。入力内容をご確認ください。',
        },
        { status: 400 }
      );
    }

    const userAgent = request.headers.get('user-agent');

    const result = await deleteAccount(supabase, user.id, {
      user_agent: userAgent,
    });

    if (!result.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: result.reason,
          detail:
            '削除処理中にエラーが発生しました。時間を置いて再度お試しください。',
        },
        { status: 500 }
      );
    }

    // 削除完了メールを送信（エビデンス用）。失敗してもユーザーへの削除完了レスポンスは妨げない。
    try {
      const mailRes = await sendAccountDeletionEmail({
        recipientEmail: user.email ?? expected,
        deletedAt: new Date(),
      });
      if (!mailRes.ok) {
        console.warn('[account/delete] confirmation mail failed', {
          error: mailRes.error,
          skipped: 'skipped' in mailRes ? mailRes.skipped : false,
        });
      }
    } catch (mailErr) {
      console.warn('[account/delete] confirmation mail threw', mailErr);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[api/digital/account/delete] POST failed', err);
    return NextResponse.json(
      { ok: false, error: 'server_error' },
      { status: 500 }
    );
  }
}
