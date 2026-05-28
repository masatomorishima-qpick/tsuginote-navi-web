/**
 * GET /api/digital/pins/crypto-context
 *
 * v2（エンベロープ暗号化）方式で PIN を登録／更新するために、クライアントが
 * 事前に必要とする「暗号文の文脈」を返す。
 *
 * 返却内容：
 *   - owner_kek_envelope     : 本人 KEK の暗号文（パスフレーズで暗号化済み）。
 *                              null なら「まだ KEK を持っていない＝初回登録」。
 *   - recipients_needing_kek : KEK 未配布の active な連携者（公開鍵付き）。
 *                              クライアントはこの公開鍵で KEK を暗号化して送り返す。
 *
 * 🔒 返すのはすべて公開鍵・暗号文のみ。平文鍵・パスフレーズ・PIN は一切扱わない。
 *    すべて RLS が効く本人セッションのクライアントで取得する（service_role は使わない）。
 */

import { NextResponse } from 'next/server';
import { createDigitalServerClient } from '@/lib/supabase/digitalServer';
import {
  getOwnerKekEnvelope,
  listRecipientsNeedingKek,
} from '@/lib/digital/kekEnvelopes';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
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

    // 本人 KEK エンベロープ（無ければ null＝初回 PIN 登録）
    const ownerEnvelope = await getOwnerKekEnvelope(supabase, user.id);

    // KEK 未配布の連携者（公開鍵付き）
    const recipients = await listRecipientsNeedingKek(supabase, user.id);

    return NextResponse.json({
      ok: true,
      owner_kek_envelope: ownerEnvelope
        ? {
            encrypted_kek: ownerEnvelope.encrypted_kek,
            iv: ownerEnvelope.iv,
            salt: ownerEnvelope.salt,
          }
        : null,
      recipients_needing_kek: recipients.map((r) => ({
        recipient_user_id: r.recipient_user_id,
        public_key: r.public_key,
      })),
    });
  } catch (err) {
    const detail = err instanceof Error ? err.message : 'unexpected_error';
    console.error('[api/digital/pins/crypto-context] GET failed', detail);
    return NextResponse.json(
      { ok: false, error: 'server_error', detail },
      { status: 500 }
    );
  }
}
