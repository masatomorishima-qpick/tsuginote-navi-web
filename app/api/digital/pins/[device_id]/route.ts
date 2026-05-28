/**
 * /api/digital/pins/[device_id]
 *
 * GET    — 暗号化済み PIN レコードを取得（step-up 必須）
 * PATCH  — 暗号化済み PIN レコードを v2 で差し替え（step-up 必須）
 * DELETE — 暗号化済み PIN レコードを削除（step-up 必須）
 *
 * 🔒 GET で返すのは暗号文と本人 KEK エンベロープのみ。復号はクライアントの
 *    lib/crypto/* が行う。サーバーは絶対に復号しない。
 *    - v1 レコード：encrypted_pin / iv / salt
 *    - v2 レコード：encrypted_pin / iv / encrypted_dek / dek_iv ＋ owner_kek_envelope
 *
 * 🔒 PATCH は v2 ペイロードのみ受け付ける。v1 の PIN を PATCH すると v2 に移行する。
 *    body のキーはホワイトリスト検証し、平文が混ざっていたら 400 で拒否する。
 *    旧パスフレーズの証明は求めない（Phase1 の割り切り）。
 *
 * 🔒 DELETE は PIN シークレットだけを物理削除する（デバイス本体は残す）。
 *
 * step-up 仕様：
 *   - いずれも step-up 認証 Cookie の通過を要求する。
 *   - PATCH / DELETE は成功時に step-up Cookie を即時無効化する（使い回し防止）。
 *     GET は表示専用のため温存。
 */

import { NextRequest, NextResponse } from 'next/server';
import { createDigitalServerClient } from '@/lib/supabase/digitalServer';
import { getDeviceById } from '@/lib/digital/devices';
import {
  getPinSecretByDevice,
  updatePinSecret,
  deletePinSecretByDevice,
  PinNotFoundError,
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
import { assertStepup, clearStepupCookieOptions } from '@/lib/digital/stepup';

/**
 * 成功レスポンスに step-up Cookie 無効化ヘッダを載せるヘルパ。
 */
function respondAndClearStepup(payload: Record<string, unknown>, status = 200) {
  const clear = clearStepupCookieOptions();
  const res = NextResponse.json(payload, { status });
  res.cookies.set(clear.name, '', {
    httpOnly: clear.httpOnly,
    sameSite: clear.sameSite,
    secure: clear.secure,
    path: clear.path,
    maxAge: clear.maxAge,
  });
  return res;
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ device_id: string }> };

// =============================================================================
// GET — 暗号化済み PIN レコード取得（step-up 必須）
// =============================================================================

export async function GET(request: NextRequest, ctx: Ctx) {
  try {
    const { device_id } = await ctx.params;

    const supabase = await createDigitalServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
    }

    // step-up 必須
    const gate = await assertStepup(user.id);
    if (!gate.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: 'stepup_required',
          stepup_purpose: 'pin_reveal',
          detail:
            '再認証の有効期限が切れています。メール認証からやり直してください。',
        },
        { status: 401 }
      );
    }

    // device の所有確認（論理削除済みは対象外）
    const device = await getDeviceById(supabase, user.id, device_id);
    if (!device) {
      return NextResponse.json(
        { ok: false, error: 'device_not_found' },
        { status: 404 }
      );
    }

    const record = await getPinSecretByDevice(supabase, user.id, device_id);
    if (!record) {
      return NextResponse.json(
        { ok: false, error: 'pin_not_registered' },
        { status: 404 }
      );
    }

    // v2 レコードは本人 KEK エンベロープを同梱（クライアントが KEK→DEK 経由で復号する）
    let ownerKekEnvelope: {
      encrypted_kek: string;
      iv: string;
      salt: string;
    } | null = null;
    if (record.algorithm_version === 'v2') {
      const env = await getOwnerKekEnvelope(supabase, user.id);
      if (env && env.iv && env.salt) {
        ownerKekEnvelope = {
          encrypted_kek: env.encrypted_kek,
          iv: env.iv,
          salt: env.salt,
        };
      }
    }

    // 監査ログ（失敗してもレスポンスは返す）
    await recordAuditLog(supabase, user.id, {
      action: 'pin_reveal',
      resource_id: device_id,
      user_agent: request.headers.get('user-agent'),
      metadata: {
        device_name: device.device_name,
        algorithm_version: record.algorithm_version,
      },
    });

    return NextResponse.json({
      ok: true,
      device_id,
      encrypted_pin: record.encrypted_pin,
      iv: record.iv,
      salt: record.salt,
      algorithm_version: record.algorithm_version,
      encrypted_dek: record.encrypted_dek,
      dek_iv: record.dek_iv,
      owner_kek_envelope: ownerKekEnvelope,
      updated_at: record.updated_at,
    });
  } catch (err) {
    console.error('[api/digital/pins/:device_id] GET failed', err);
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: 500 });
  }
}

// =============================================================================
// PATCH — PIN を v2 で差し替え（step-up 必須）
// =============================================================================

export async function PATCH(request: NextRequest, ctx: Ctx) {
  try {
    const { device_id: deviceIdFromUrl } = await ctx.params;

    const supabase = await createDigitalServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
    }

    const gate = await assertStepup(user.id);
    if (!gate.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: 'stepup_required',
          stepup_purpose: 'pin_update',
          detail:
            '再認証の有効期限が切れています。メール認証からやり直してください。',
        },
        { status: 401 }
      );
    }

    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
    }

    // 平文漏洩防御：未知キーは全て拒否
    const disallowedKey = v2BodyDisallowedKey(body);
    if (disallowedKey) {
      console.warn('[api/digital/pins/:device_id] PATCH rejected: disallowed body key', {
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

    // device_id の検証（URL）と body との一致確認
    if (!/^[0-9a-f-]{36}$/i.test(deviceIdFromUrl)) {
      return NextResponse.json(
        { ok: false, error: 'validation_failed', errors: { device_id: 'device_id が不正です。' } },
        { status: 400 }
      );
    }
    const bodyDeviceId =
      typeof body.device_id === 'string' ? body.device_id.trim() : '';
    if (bodyDeviceId && bodyDeviceId !== deviceIdFromUrl) {
      return NextResponse.json(
        {
          ok: false,
          error: 'device_id_mismatch',
          detail: 'URL の device_id と body の device_id が一致しません。',
        },
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

    // デバイス所有確認
    const device = await getDeviceById(supabase, user.id, deviceIdFromUrl);
    if (!device) {
      return NextResponse.json(
        { ok: false, error: 'device_not_found' },
        { status: 404 }
      );
    }

    // KEK エンベロープの整合性チェック（POST と同じ）
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

    // 本人 KEK エンベロープを保存（初回のみ。PIN UPDATE より先に行う）
    if (v2.owner_kek_envelope) {
      const savedKek = await saveOwnerKekEnvelope(supabase, user.id, {
        encrypted_kek: v2.owner_kek_envelope.encrypted_kek,
        iv: v2.owner_kek_envelope.iv,
        salt: v2.owner_kek_envelope.salt,
      });
      if (!savedKek.ok) {
        console.error(
          '[api/digital/pins/:device_id] saveOwnerKekEnvelope failed',
          savedKek.error
        );
        return NextResponse.json(
          { ok: false, error: 'server_error', detail: '暗号鍵の保存に失敗しました。' },
          { status: 500 }
        );
      }
    }

    // PIN レコードを v2 で差し替え
    try {
      await updatePinSecret(supabase, user.id, {
        device_id: deviceIdFromUrl,
        encrypted_pin: v2.encrypted_pin,
        iv: v2.iv,
        encrypted_dek: v2.encrypted_dek,
        dek_iv: v2.dek_iv,
        algorithm_version: 'v2',
      });
    } catch (err) {
      if (err instanceof PinNotFoundError) {
        return NextResponse.json(
          {
            ok: false,
            error: 'pin_not_registered',
            detail:
              'このデバイスには PIN が未登録です。新規登録画面から進めてください。',
          },
          { status: 404 }
        );
      }
      throw err;
    }

    // 連携者用 KEK 暗号文を配布（ベストエフォート）
    const { saved } = await distributeRecipientKekEnvelopes(
      supabase,
      user.id,
      v2.recipient_kek_envelopes
    );

    await recordAuditLog(supabase, user.id, {
      action: 'pin_update',
      resource_id: deviceIdFromUrl,
      user_agent: request.headers.get('user-agent'),
      metadata: {
        device_name: device.device_name,
        algorithm_version: 'v2',
        recipient_kek_distributed: saved,
      },
    });

    // 使い回し防止：PATCH 成功で step-up Cookie を即時無効化
    return respondAndClearStepup({
      ok: true,
      device_id: deviceIdFromUrl,
      algorithm_version: 'v2',
    });
  } catch (err) {
    console.error('[api/digital/pins/:device_id] PATCH failed', err);
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: 500 });
  }
}

// =============================================================================
// DELETE — PIN 削除（step-up 必須）
// =============================================================================

export async function DELETE(request: NextRequest, ctx: Ctx) {
  try {
    const { device_id } = await ctx.params;

    if (!/^[0-9a-f-]{36}$/i.test(device_id)) {
      return NextResponse.json(
        { ok: false, error: 'invalid_device_id' },
        { status: 400 }
      );
    }

    const supabase = await createDigitalServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
    }

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

    // body は optional。reason だけ読む。
    let reason: string | null = null;
    try {
      const raw = await request.text();
      if (raw && raw.length > 0) {
        const parsed = JSON.parse(raw) as Record<string, unknown>;
        if (typeof parsed.reason === 'string') {
          reason = parsed.reason.slice(0, 200); // 念のため上限
        }
      }
    } catch {
      // body なし / JSON でない → reason 無しで続行
    }

    const device = await getDeviceById(supabase, user.id, device_id);
    if (!device) {
      return NextResponse.json(
        { ok: false, error: 'device_not_found' },
        { status: 404 }
      );
    }

    const { deleted } = await deletePinSecretByDevice(supabase, user.id, device_id);

    // 実際に削除が発生したときだけ pin_delete を残す。0件削除でも成功扱い（冪等）。
    if (deleted) {
      await recordAuditLog(supabase, user.id, {
        action: 'pin_delete',
        resource_id: device_id,
        user_agent: request.headers.get('user-agent'),
        metadata: {
          device_name: device.device_name,
          reason: reason ?? 'user_initiated',
        },
      });
    }

    // 使い回し防止：DELETE 成功で step-up Cookie を即時無効化
    return respondAndClearStepup({
      ok: true,
      device_id,
      deleted,
    });
  } catch (err) {
    console.error('[api/digital/pins/:device_id] DELETE failed', err);
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: 500 });
  }
}
