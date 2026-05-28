/**
 * POST /api/digital/pins — PIN シークレット（v2 エンベロープ暗号化済み）を新規登録
 *
 * リクエスト（v2 のみ受け付け）：
 *   {
 *     device_id: UUID,
 *     algorithm_version: 'v2',
 *     encrypted_pin: base64,            // DEK で暗号化された PIN
 *     iv: base64(12bytes),              // PIN 用 IV
 *     encrypted_dek: base64,            // KEK で暗号化された DEK
 *     dek_iv: base64(12bytes),          // DEK 用 IV
 *     owner_kek_envelope?: {            // 初回登録時のみ（既存ユーザーは省略）
 *       encrypted_kek, iv, salt
 *     },
 *     recipient_kek_envelopes?: [       // KEK 未配布の連携者がいる場合のみ
 *       { recipient_user_id, encrypted_kek }
 *     ]
 *   }
 *
 * 🔒 サーバーは平文 PIN も平文パスフレーズも生の鍵も受け取らない。
 *    body のキーはホワイトリスト検証し、未知キーがあれば即 400 で拒否する（多層防御）。
 *
 * 手順：
 *   1. 本人セッション必須（401）
 *   2. body のホワイトリスト検証・形式検証（400）
 *   3. device_id が自分のアクティブなデバイスかを確認（404）
 *   4. プラン確認（FREE は PIN 保管不可）（403）
 *   5. 既に PIN 登録済みの場合は 409（更新フローへ誘導）
 *   6. KEK エンベロープの整合性チェック（初回/既存の食い違いを 409/400 で弾く）
 *   7. 本人 KEK エンベロープを保存（初回のみ）→ PIN レコードを INSERT
 *   8. 連携者用 KEK 暗号文を配布（ベストエフォート）
 *   9. 監査ログ：pin_register
 *
 * レスポンス：
 *   成功 201 { ok: true, device_id, algorithm_version: 'v2' }
 *   失敗 400 / 401 / 403 / 404 / 409 / 500
 */

import { NextRequest, NextResponse } from 'next/server';
import { createDigitalServerClient } from '@/lib/supabase/digitalServer';
import { getDeviceById } from '@/lib/digital/devices';
import {
  createPinSecret,
  pinSecretExistsByDevice,
  PinAlreadyExistsError,
} from '@/lib/digital/pins';
import {
  getOwnerKekEnvelope,
  saveOwnerKekEnvelope,
} from '@/lib/digital/kekEnvelopes';
import {
  v2BodyDisallowedKey,
  parseV2PinBody,
  distributeRecipientKekEnvelopes,
} from '@/lib/digital/pinV2Server';
import { recordAuditLog } from '@/lib/digital/audit';
import { getOwnSubscription, effectivePlan } from '@/lib/digital/subscriptions';
import { PLAN_LIMITS } from '@/types/digital';

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

    // ② 平文混入の保険：未知キー（pin, passphrase 等）が来ていないか
    const disallowedKey = v2BodyDisallowedKey(body);
    if (disallowedKey) {
      console.warn('[api/digital/pins] POST rejected: disallowed body key', {
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

    // device_id の検証
    const device_id =
      typeof body.device_id === 'string' ? body.device_id.trim() : '';
    if (!/^[0-9a-f-]{36}$/i.test(device_id)) {
      return NextResponse.json(
        { ok: false, error: 'validation_failed', errors: { device_id: 'device_id が不正です。' } },
        { status: 400 }
      );
    }

    // v2 暗号文フィールドの検証
    const parsed = parseV2PinBody(body);
    if (!parsed.ok) {
      return NextResponse.json(
        { ok: false, error: 'validation_failed', errors: parsed.errors },
        { status: 400 }
      );
    }
    const v2 = parsed.data;

    // ③ デバイスの所有・存在確認
    const device = await getDeviceById(supabase, user.id, device_id);
    if (!device) {
      return NextResponse.json({ ok: false, error: 'device_not_found' }, { status: 404 });
    }

    // ④ プランチェック（FREE はパスワード保管不可）
    const subscription = await getOwnSubscription(supabase, user.id);
    const plan = effectivePlan(subscription);
    if (!PLAN_LIMITS[plan].canStorePin) {
      return NextResponse.json(
        {
          ok: false,
          error: 'plan_required',
          detail:
            'スマホ・PC のパスワード保管機能は STANDARD プランのみご利用いただけます。',
          required_plan: 'standard',
        },
        { status: 403 }
      );
    }

    // ⑤ 既登録チェック
    const already = await pinSecretExistsByDevice(supabase, user.id, device_id);
    if (already) {
      return NextResponse.json(
        {
          ok: false,
          error: 'pin_already_exists',
          detail:
            'このデバイスには既に PIN が登録されています。更新画面から変更してください。',
        },
        { status: 409 }
      );
    }

    // ⑥ KEK エンベロープの整合性チェック
    //    - owner_kek_envelope を送ってきたのに既存がある → 二重生成の恐れ。再読込を促す。
    //    - owner_kek_envelope が無いのに既存も無い → DEK を復号できる KEK が存在しない。
    const existingOwnerEnv = await getOwnerKekEnvelope(supabase, user.id);
    if (v2.owner_kek_envelope && existingOwnerEnv) {
      return NextResponse.json(
        {
          ok: false,
          error: 'kek_conflict',
          detail:
            '暗号鍵の状態が変化しました。お手数ですがページを再読み込みしてからもう一度お試しください。',
        },
        { status: 409 }
      );
    }
    if (!v2.owner_kek_envelope && !existingOwnerEnv) {
      return NextResponse.json(
        {
          ok: false,
          error: 'kek_missing',
          detail:
            '暗号鍵を初期化できませんでした。ページを再読み込みしてからもう一度お試しください。',
        },
        { status: 400 }
      );
    }

    // ⑦-a 本人 KEK エンベロープを保存（初回のみ。PIN INSERT より先に行う）
    if (v2.owner_kek_envelope) {
      const savedKek = await saveOwnerKekEnvelope(supabase, user.id, {
        encrypted_kek: v2.owner_kek_envelope.encrypted_kek,
        iv: v2.owner_kek_envelope.iv,
        salt: v2.owner_kek_envelope.salt,
      });
      if (!savedKek.ok) {
        console.error('[api/digital/pins] saveOwnerKekEnvelope failed', savedKek.error);
        return NextResponse.json(
          { ok: false, error: 'server_error', detail: '暗号鍵の保存に失敗しました。' },
          { status: 500 }
        );
      }
    }

    // ⑦-b PIN レコードを INSERT
    try {
      await createPinSecret(supabase, user.id, {
        device_id,
        encrypted_pin: v2.encrypted_pin,
        iv: v2.iv,
        encrypted_dek: v2.encrypted_dek,
        dek_iv: v2.dek_iv,
        algorithm_version: 'v2',
      });
    } catch (err) {
      // 競合（同時登録）→ 409 を返す
      if (err instanceof PinAlreadyExistsError) {
        return NextResponse.json(
          {
            ok: false,
            error: 'pin_already_exists',
            detail:
              'ほぼ同時に別タブから登録されたようです。最新の状態を確認してください。',
          },
          { status: 409 }
        );
      }
      throw err;
    }

    // ⑧ 連携者用 KEK 暗号文を配布（ベストエフォート。失敗しても PIN 登録は成立）
    const { saved } = await distributeRecipientKekEnvelopes(
      supabase,
      user.id,
      v2.recipient_kek_envelopes
    );

    // ⑨ 監査ログ
    await recordAuditLog(supabase, user.id, {
      action: 'pin_register',
      resource_id: device_id,
      user_agent: request.headers.get('user-agent'),
      metadata: {
        device_name: device.device_name,
        algorithm_version: 'v2',
        recipient_kek_distributed: saved,
      },
    });

    return NextResponse.json(
      { ok: true, device_id, algorithm_version: 'v2' },
      { status: 201 }
    );
  } catch (err) {
    console.error('[api/digital/pins] POST failed', err);
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: 500 });
  }
}
