/**
 * POST /api/digital/pins/reset
 *
 * パスフレーズ紛失時の「リセット（作り直し）」API。
 *
 * パスフレーズを忘れると、保存済みの PIN 暗号文は本人も運営も復号できない。
 * これは仕様（安全性の核）なので「復元」はできない。代わりに、復号不能になった
 * データを破棄して、新しいパスフレーズで登録し直せる状態に戻す。
 *
 * 実行内容：
 *   1. 本人の PIN シークレット（digital_pin_secrets）を全削除
 *   2. 本人の KEK エンベロープ（digital_user_kek_envelopes、owner/recipient 両方）を全削除
 *
 * これにより crypto-context が「KEK 無し」を返すようになり、次回の PIN 登録は
 * 初回モード（新パスフレーズ設定）になる。デバイス本体は残るので、本人は同じ
 * デバイスに登録し直せる（端末の解除コード自体は本人が知っているはず）。
 *
 * 🔒 破壊的操作のため step-up を要求する（Phase 1 はフラグ OFF のため実質スキップ）。
 *    また、誤爆防止に body の confirm:true を必須とする。
 *
 * レスポンス：
 *   成功 200 { ok: true, deleted_pins: <件数> }
 *   失敗 400 / 401 / 500
 */

import { NextRequest, NextResponse } from 'next/server';
import { createDigitalServerClient } from '@/lib/supabase/digitalServer';
import { deleteAllPinSecretsForUser } from '@/lib/digital/pins';
import { deleteAllKekEnvelopesForUser } from '@/lib/digital/kekEnvelopes';
import { recordAuditLog } from '@/lib/digital/audit';
import { assertStepup, clearStepupCookieOptions } from '@/lib/digital/stepup';

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

    // step-up ゲート（フラグ OFF 時は無条件で通過）
    const gate = await assertStepup(user.id);
    if (!gate.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: 'stepup_required',
          stepup_purpose: 'pin_delete',
          detail:
            '再認証の有効期限が切れています。メール認証からやり直してください。',
        },
        { status: 401 }
      );
    }

    // 誤爆防止：body に confirm:true が必須
    let body: Record<string, unknown> = {};
    try {
      body = await request.json();
    } catch {
      body = {};
    }
    if (body.confirm !== true) {
      return NextResponse.json(
        {
          ok: false,
          error: 'confirmation_required',
          detail: 'リセットを実行するには確認が必要です。',
        },
        { status: 400 }
      );
    }

    // ① PIN シークレットを全削除
    const { deletedCount } = await deleteAllPinSecretsForUser(supabase, user.id);

    // ② KEK エンベロープを全削除（owner / recipient 両方）
    const kekResult = await deleteAllKekEnvelopesForUser(supabase, user.id);
    if (!kekResult.ok) {
      // PIN は消えたが KEK 削除に失敗。再実行すれば収束する（削除は冪等）。
      console.error('[api/digital/pins/reset] KEK deletion failed', kekResult.error);
      return NextResponse.json(
        {
          ok: false,
          error: 'server_error',
          detail:
            '暗号鍵の削除に失敗しました。お手数ですがもう一度リセットをお試しください。',
        },
        { status: 500 }
      );
    }

    // 監査ログ（一括削除なので pin_delete アクションで記録）
    await recordAuditLog(supabase, user.id, {
      action: 'pin_delete',
      user_agent: request.headers.get('user-agent'),
      metadata: {
        reason: 'passphrase_reset',
        deleted_pins: deletedCount,
      },
    });

    // 使い回し防止：成功で step-up Cookie を即時無効化
    const clear = clearStepupCookieOptions();
    const res = NextResponse.json({ ok: true, deleted_pins: deletedCount });
    res.cookies.set(clear.name, '', {
      httpOnly: clear.httpOnly,
      sameSite: clear.sameSite,
      secure: clear.secure,
      path: clear.path,
      maxAge: clear.maxAge,
    });
    return res;
  } catch (err) {
    console.error('[api/digital/pins/reset] POST failed', err);
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: 500 });
  }
}
