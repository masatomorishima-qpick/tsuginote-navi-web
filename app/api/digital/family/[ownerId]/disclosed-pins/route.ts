/**
 * GET /api/digital/family/[ownerId]/disclosed-pins
 *
 * 連携者が、オーナーの PIN（スマホ・PC パスワード）を復号するために必要な
 * 暗号化データ一式を取得する API。
 *
 * 返すのは **暗号文のみ**。復号はクライアント（連携者のブラウザ）で行う。
 * サーバーは平文 PIN を一切扱わない。
 *
 * アクセス条件：
 *   - 既定：死後開示（disclosed）が確定している owner の active な連携者のみ
 *   - DIGITAL_LIFETIME_PIN_REVEAL_ENABLED=true のとき：
 *     生前共有 ON の active な連携者にも開示する（フィーチャーフラグ）
 *   ※ パスワードはアカウント全体のアクセス権を持つため、既定では死後のみ。
 *     ユーザーニーズに応じて env で切り替え可能。
 *
 * 返却内容：
 *   - recipient_keypair：連携者自身の鍵ペア（秘密鍵を復号するため）
 *   - kek_envelope：オーナーの KEK を連携者の公開鍵で暗号化したもの
 *   - pins：デバイスごとの暗号化 PIN（v2 のみ復号可能、v1 は復号不可フラグ付き）
 */

import { NextResponse } from 'next/server';
import { createDigitalServerClient } from '@/lib/supabase/digitalServer';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { isLifetimePinRevealEnabled } from '@/lib/digital/featureFlags';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ ownerId: string }> }
) {
  try {
    const { ownerId } = await params;

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

    const admin = createAdminSupabaseClient();

    // ② 連携リンク確認（active な recipient であること）
    const { data: link, error: linkErr } = await admin
      .from('digital_family_links')
      .select('id, status, share_during_lifetime')
      .eq('owner_user_id', ownerId)
      .eq('recipient_user_id', user.id)
      .eq('status', 'active')
      .maybeSingle();
    if (linkErr) {
      return NextResponse.json(
        { ok: false, error: 'unexpected', detail: linkErr.message },
        { status: 500 }
      );
    }
    if (!link) {
      return NextResponse.json(
        { ok: false, error: 'not_linked' },
        { status: 403 }
      );
    }

    // ③ アクセス可否判定
    //   既定：死後開示済みの場合のみ閲覧可。
    //   フィーチャーフラグ DIGITAL_LIFETIME_PIN_REVEAL_ENABLED=true のときは、
    //   生前共有 ON の連携相手にも開示する。
    let isDisclosed = false;
    const { data: disclosedNotice } = await admin
      .from('digital_death_notices')
      .select('id')
      .eq('owner_user_id', ownerId)
      .eq('status', 'disclosed')
      .not('disclosed_at', 'is', null)
      .maybeSingle();
    isDisclosed = !!disclosedNotice;

    const lifetimePinRevealEnabled = isLifetimePinRevealEnabled();
    const canAccess =
      isDisclosed ||
      (lifetimePinRevealEnabled && link.share_during_lifetime);
    if (!canAccess) {
      return NextResponse.json(
        {
          ok: false,
          error: 'not_accessible',
          detail:
            'ご本人がご存命の間はパスワードを閲覧できません。お亡くなりになった事実が確認された後にご確認いただけます。',
        },
        { status: 403 }
      );
    }

    // ④ 連携者自身の鍵ペアを取得
    const { data: recipientKey } = await admin
      .from('digital_recipient_keys')
      .select('encrypted_private_key, iv, salt')
      .eq('user_id', user.id)
      .maybeSingle();
    if (!recipientKey) {
      return NextResponse.json(
        {
          ok: false,
          error: 'no_recipient_key',
          detail:
            'あなたの暗号鍵が見つかりません。連携承認時のパスフレーズ設定が完了していない可能性があります。',
        },
        { status: 400 }
      );
    }

    // ⑤ 連携者用の KEK 暗号文を取得
    const { data: kekEnvelope } = await admin
      .from('digital_user_kek_envelopes')
      .select('encrypted_kek')
      .eq('owner_user_id', ownerId)
      .eq('kind', 'recipient')
      .eq('recipient_user_id', user.id)
      .maybeSingle();

    // ⑥ オーナーのデバイス + PIN を取得
    const { data: devices } = await admin
      .from('digital_devices')
      .select('id, device_name, manufacturer, model')
      .eq('user_id', ownerId)
      .is('deleted_at', null);

    const deviceMap = new Map<
      string,
      { device_name: string; manufacturer: string | null; model: string | null }
    >();
    for (const d of devices ?? []) {
      deviceMap.set(d.id as string, {
        device_name: d.device_name as string,
        manufacturer: (d.manufacturer as string | null) ?? null,
        model: (d.model as string | null) ?? null,
      });
    }

    const { data: pinSecrets } = await admin
      .from('digital_pin_secrets')
      .select('device_id, encrypted_pin, iv, encrypted_dek, dek_iv, algorithm_version')
      .eq('user_id', ownerId);

    const pins = (pinSecrets ?? []).map((p) => {
      const device = deviceMap.get(p.device_id as string);
      return {
        device_id: p.device_id as string,
        device_name: device?.device_name ?? '（不明なデバイス）',
        manufacturer: device?.manufacturer ?? null,
        model: device?.model ?? null,
        algorithm_version: p.algorithm_version as 'v1' | 'v2',
        encrypted_pin: p.encrypted_pin as string,
        iv: p.iv as string,
        encrypted_dek: (p.encrypted_dek as string | null) ?? null,
        dek_iv: (p.dek_iv as string | null) ?? null,
      };
    });

    return NextResponse.json({
      ok: true,
      recipient_keypair: {
        encrypted_private_key: recipientKey.encrypted_private_key,
        iv: recipientKey.iv,
        salt: recipientKey.salt,
      },
      kek_envelope: kekEnvelope
        ? { encrypted_kek: kekEnvelope.encrypted_kek }
        : null,
      pins,
    });
  } catch (err) {
    const detail = err instanceof Error ? err.message : 'unexpected_error';
    console.error('[disclosed-pins GET] failed', detail);
    return NextResponse.json(
      { ok: false, error: 'unexpected', detail },
      { status: 500 }
    );
  }
}
