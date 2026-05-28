/**
 * POST /api/digital/pins/distribute-kek
 *
 * 「連携者へ KEK を配り直す」専用 API。PIN 本体には一切触れない。
 *
 * 用途：
 *   PIN を登録し終えた後で新しい連携者を追加したケースなど、KEK 未配布の
 *   連携者が残っているときに、本人が後追いで KEK を配るために使う。
 *   - PIN 表示時のバックグラウンド処理
 *   - ダッシュボードのポップアップ（パスフレーズ入力）
 *   のどちらからも呼ばれる。
 *
 * リクエスト：
 *   { recipient_kek_envelopes: [ { recipient_user_id, encrypted_kek } ] }
 *
 * 🔒 受け取るのは「KEK を連携者の公開鍵で暗号化した暗号文」のみ。
 *    平文 PIN・パスフレーズ・生の鍵は受け取らない（ホワイトリスト検証で多層防御）。
 *    実際に保存されるのは active な連携者の分だけ（不正な recipient_user_id は無視）。
 *
 * レスポンス：
 *   成功 200 { ok: true, distributed: <保存件数> }
 *   失敗 400 / 401 / 500
 */

import { NextRequest, NextResponse } from 'next/server';
import { createDigitalServerClient } from '@/lib/supabase/digitalServer';
import {
  v2BodyDisallowedKey,
  parseRecipientKekEnvelopesOnly,
  distributeRecipientKekEnvelopes,
} from '@/lib/digital/pinV2Server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createDigitalServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
    }

    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
    }

    // 平文混入の保険：未知キーは拒否（ネストした recipient_kek_envelopes も検査）
    const disallowedKey = v2BodyDisallowedKey(body);
    if (disallowedKey) {
      console.warn('[api/digital/pins/distribute-kek] rejected: disallowed body key', {
        user_id: user.id,
        key: disallowedKey,
      });
      return NextResponse.json(
        {
          ok: false,
          error: 'forbidden_field',
          detail:
            'サーバーには暗号化済みデータのみ送ってください。平文 PIN やパスフレーズは送信しません。',
        },
        { status: 400 }
      );
    }

    // recipient_kek_envelopes の形式検証
    const parsed = parseRecipientKekEnvelopesOnly(body);
    if (!parsed.ok) {
      return NextResponse.json(
        { ok: false, error: 'validation_failed', errors: parsed.errors },
        { status: 400 }
      );
    }

    // active な連携者の分だけ保存（idempotent）
    const { saved } = await distributeRecipientKekEnvelopes(
      supabase,
      user.id,
      parsed.data
    );

    return NextResponse.json({ ok: true, distributed: saved });
  } catch (err) {
    console.error('[api/digital/pins/distribute-kek] POST failed', err);
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: 500 });
  }
}
