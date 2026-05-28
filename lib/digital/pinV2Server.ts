/**
 * lib/digital/pinV2Server.ts
 *
 * v2（エンベロープ暗号化）方式の PIN 登録／更新 API（POST /api/digital/pins と
 * PATCH /api/digital/pins/[device_id]）が共有する、サーバー側の検証・保存ヘルパー。
 *
 * 🔒 ここで扱うのはすべて暗号文・公開情報のみ。平文 PIN・パスフレーズ・
 *    生の鍵 bytes は一切受け取らない（ホワイトリスト検証で多層防御する）。
 *
 * server-only。API Route からのみ呼ぶ。
 */

import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import { isBase64Like } from './pins';
import { upsertRecipientKekEnvelope } from './kekEnvelopes';

// =============================================================================
// 型
// =============================================================================

export type ParsedV2OwnerEnvelope = {
  encrypted_kek: string;
  iv: string;
  salt: string;
};

export type ParsedV2RecipientEnvelope = {
  recipient_user_id: string;
  encrypted_kek: string;
};

export type ParsedV2PinBody = {
  encrypted_pin: string;
  iv: string;
  encrypted_dek: string;
  dek_iv: string;
  /** 初回登録時のみ存在。既存ユーザーは null（既存 KEK を再利用） */
  owner_kek_envelope: ParsedV2OwnerEnvelope | null;
  /** KEK 未配布の連携者へ配る KEK 暗号文。空配列可 */
  recipient_kek_envelopes: ParsedV2RecipientEnvelope[];
};

export type ParseV2Result =
  | { ok: true; data: ParsedV2PinBody }
  | { ok: false; errors: Record<string, string> };

const UUID_RE = /^[0-9a-f-]{36}$/i;

// =============================================================================
// ① ホワイトリスト検証（平文混入の保険）
// =============================================================================

/**
 * body に未知キー（＝平文 PIN / パスフレーズ等が混ざった疑い）が無いか検査する。
 * 見つかればそのキー名（ネストは "owner_kek_envelope.xxx" 形式）を返す。問題なければ null。
 *
 * v1 と違い v2 は owner_kek_envelope / recipient_kek_envelopes というネスト構造を持つため、
 * ネストしたオブジェクトのキーも検査する。
 */
export function v2BodyDisallowedKey(
  body: Record<string, unknown>
): string | null {
  const allowedTop = new Set([
    'device_id',
    'encrypted_pin',
    'iv',
    'salt', // v2 では未使用だが、誤検知防止のため許可キーに含める
    'algorithm_version',
    'encrypted_dek',
    'dek_iv',
    'owner_kek_envelope',
    'recipient_kek_envelopes',
  ]);
  for (const key of Object.keys(body)) {
    if (!allowedTop.has(key)) return key;
  }

  const env = body.owner_kek_envelope;
  if (env && typeof env === 'object' && !Array.isArray(env)) {
    const allowedEnv = new Set([
      'encrypted_kek',
      'iv',
      'salt',
      'algorithm_version',
    ]);
    for (const key of Object.keys(env as Record<string, unknown>)) {
      if (!allowedEnv.has(key)) return `owner_kek_envelope.${key}`;
    }
  }

  const recs = body.recipient_kek_envelopes;
  if (Array.isArray(recs)) {
    const allowedRec = new Set([
      'recipient_user_id',
      'encrypted_kek',
      'algorithm_version',
    ]);
    for (const r of recs) {
      if (r && typeof r === 'object' && !Array.isArray(r)) {
        for (const key of Object.keys(r as Record<string, unknown>)) {
          if (!allowedRec.has(key)) return `recipient_kek_envelopes.${key}`;
        }
      }
    }
  }

  return null;
}

// =============================================================================
// ② 値の形式検証 + パース
// =============================================================================

/**
 * v2 PIN ペイロードの暗号文フィールドを検証し、整形済みオブジェクトを返す。
 * device_id は POST（body）/ PATCH（URL）で出所が異なるため、ここでは検証しない。
 */
export function parseV2PinBody(body: Record<string, unknown>): ParseV2Result {
  const errors: Record<string, string> = {};

  if (body.algorithm_version !== 'v2') {
    errors.algorithm_version = 'algorithm_version は v2 を指定してください。';
  }

  const encrypted_pin =
    typeof body.encrypted_pin === 'string' ? body.encrypted_pin : '';
  const iv = typeof body.iv === 'string' ? body.iv : '';
  const encrypted_dek =
    typeof body.encrypted_dek === 'string' ? body.encrypted_dek : '';
  const dek_iv = typeof body.dek_iv === 'string' ? body.dek_iv : '';

  if (!isBase64Like(encrypted_pin, 16, 512))
    errors.encrypted_pin = 'encrypted_pin の形式が不正です。';
  if (!isBase64Like(iv, 12, 16)) errors.iv = 'iv の形式が不正です。';
  if (!isBase64Like(encrypted_dek, 16, 128))
    errors.encrypted_dek = 'encrypted_dek の形式が不正です。';
  if (!isBase64Like(dek_iv, 12, 16))
    errors.dek_iv = 'dek_iv の形式が不正です。';

  // ── owner_kek_envelope（任意：初回登録時のみ） ──────────────────
  let owner_kek_envelope: ParsedV2OwnerEnvelope | null = null;
  const rawOwnerEnv = body.owner_kek_envelope;
  if (rawOwnerEnv !== undefined && rawOwnerEnv !== null) {
    if (typeof rawOwnerEnv !== 'object' || Array.isArray(rawOwnerEnv)) {
      errors.owner_kek_envelope = 'owner_kek_envelope の形式が不正です。';
    } else {
      const e = rawOwnerEnv as Record<string, unknown>;
      const ek = typeof e.encrypted_kek === 'string' ? e.encrypted_kek : '';
      const eiv = typeof e.iv === 'string' ? e.iv : '';
      const esalt = typeof e.salt === 'string' ? e.salt : '';
      if (
        !isBase64Like(ek, 16, 128) ||
        !isBase64Like(eiv, 12, 16) ||
        !isBase64Like(esalt, 16, 20)
      ) {
        errors.owner_kek_envelope =
          'owner_kek_envelope の暗号文形式が不正です。';
      } else {
        owner_kek_envelope = {
          encrypted_kek: ek,
          iv: eiv,
          salt: esalt,
        };
      }
    }
  }

  // ── recipient_kek_envelopes（任意：連携者がいる場合のみ） ───────
  const recipient_kek_envelopes: ParsedV2RecipientEnvelope[] = [];
  const rawRecs = body.recipient_kek_envelopes;
  if (rawRecs !== undefined && rawRecs !== null) {
    if (!Array.isArray(rawRecs)) {
      errors.recipient_kek_envelopes =
        'recipient_kek_envelopes は配列で指定してください。';
    } else {
      for (let i = 0; i < rawRecs.length; i++) {
        const r = rawRecs[i] as Record<string, unknown>;
        const rid =
          typeof r?.recipient_user_id === 'string' ? r.recipient_user_id : '';
        const rek =
          typeof r?.encrypted_kek === 'string' ? r.encrypted_kek : '';
        // RSA-OAEP-4096 の暗号文は 512 bytes 固定。base64 で ~684 文字。
        if (!UUID_RE.test(rid) || !isBase64Like(rek, 256, 600)) {
          errors.recipient_kek_envelopes = `recipient_kek_envelopes[${i}] の形式が不正です。`;
          break;
        }
        recipient_kek_envelopes.push({
          recipient_user_id: rid,
          encrypted_kek: rek,
        });
      }
    }
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    data: {
      encrypted_pin,
      iv,
      encrypted_dek,
      dek_iv,
      owner_kek_envelope,
      recipient_kek_envelopes,
    },
  };
}

// =============================================================================
// ②-2 連携者用 KEK 暗号文だけを検証（distribute-kek エンドポイント用）
// =============================================================================

/**
 * 「連携者へ KEK を配り直す」専用 API の body を検証する。
 * PIN フィールドは含まれない。recipient_kek_envelopes だけを検証する。
 */
export function parseRecipientKekEnvelopesOnly(
  body: Record<string, unknown>
):
  | { ok: true; data: ParsedV2RecipientEnvelope[] }
  | { ok: false; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  const recipient_kek_envelopes: ParsedV2RecipientEnvelope[] = [];

  const rawRecs = body.recipient_kek_envelopes;
  if (!Array.isArray(rawRecs) || rawRecs.length === 0) {
    errors.recipient_kek_envelopes =
      'recipient_kek_envelopes を 1 件以上指定してください。';
  } else {
    for (let i = 0; i < rawRecs.length; i++) {
      const r = rawRecs[i] as Record<string, unknown>;
      const rid =
        typeof r?.recipient_user_id === 'string' ? r.recipient_user_id : '';
      const rek = typeof r?.encrypted_kek === 'string' ? r.encrypted_kek : '';
      // RSA-OAEP-4096 の暗号文は 512 bytes 固定。base64 で ~684 文字。
      if (!UUID_RE.test(rid) || !isBase64Like(rek, 256, 600)) {
        errors.recipient_kek_envelopes = `recipient_kek_envelopes[${i}] の形式が不正です。`;
        break;
      }
      recipient_kek_envelopes.push({
        recipient_user_id: rid,
        encrypted_kek: rek,
      });
    }
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }
  return { ok: true, data: recipient_kek_envelopes };
}

// =============================================================================
// ③ 連携者用 KEK 暗号文の配布（PIN 保存後・ベストエフォート）
// =============================================================================

/**
 * クライアントが用意した連携者用 KEK 暗号文を保存する。
 *
 * - 実際に active な連携者の分だけを保存する（不正な recipient_user_id を弾く）。
 * - 1 件失敗しても他は続行する（KEK は次回登録時に再配布されるため致命的でない）。
 * - 戻り値は「保存できた件数」。呼び出し側はログ用途に使う。
 *
 * PIN レコードの保存が成功した **後** に呼ぶこと（PIN より先に連携者へ配っても無害だが、
 * PIN 保存が失敗したら連携者配布は不要なため）。
 */
export async function distributeRecipientKekEnvelopes(
  supabase: SupabaseClient,
  ownerUserId: string,
  envelopes: ParsedV2RecipientEnvelope[]
): Promise<{ saved: number }> {
  if (envelopes.length === 0) return { saved: 0 };

  // active な連携者だけを対象にする
  const { data: links, error: linkErr } = await supabase
    .from('digital_family_links')
    .select('recipient_user_id')
    .eq('owner_user_id', ownerUserId)
    .eq('status', 'active');
  if (linkErr) {
    console.error(
      '[pinV2Server] distributeRecipientKekEnvelopes link lookup failed',
      linkErr
    );
    return { saved: 0 };
  }
  const activeRecipients = new Set(
    (links ?? []).map((l) => l.recipient_user_id as string)
  );

  let saved = 0;
  for (const env of envelopes) {
    if (!activeRecipients.has(env.recipient_user_id)) {
      // active な連携者でない recipient_user_id は無視（不正・解除済み）
      continue;
    }
    const res = await upsertRecipientKekEnvelope(
      supabase,
      ownerUserId,
      env.recipient_user_id,
      env.encrypted_kek
    );
    if (res.ok) {
      saved++;
    } else {
      console.warn(
        '[pinV2Server] recipient KEK 保存に失敗（スキップ）',
        env.recipient_user_id,
        res.error
      );
    }
  }
  return { saved };
}
