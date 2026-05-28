/**
 * lib/stripe/client.ts
 *
 * Stripe REST API への薄いラッパー。
 *
 * 設計判断：本プロジェクトでは npm の `stripe` SDK を使わず、HTTP API を直接 fetch する。
 *   - 依存パッケージを増やさない
 *   - SDK のメジャーアップデートに振り回されない
 *   - Vercel Edge と相性が良い
 *
 * 使用するエンドポイントは限定的：
 *   - POST /v1/customers
 *   - GET  /v1/customers/{id}
 *   - POST /v1/checkout/sessions
 *   - POST /v1/billing_portal/sessions
 *   - GET  /v1/subscriptions/{id}
 *
 * Webhook 署名検証は `verifyStripeSignature` で実施（node:crypto を使用）。
 */

import 'server-only';
import { createHmac, timingSafeEqual } from 'node:crypto';

const STRIPE_API_BASE = 'https://api.stripe.com';
const STRIPE_API_VERSION = '2024-12-18.acacia'; // 安定版を固定

function getSecretKey(): string {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error(
      '[lib/stripe/client] STRIPE_SECRET_KEY is not set in environment'
    );
  }
  return key;
}

/**
 * フォーム形式（application/x-www-form-urlencoded）の文字列を組み立てる。
 * Stripe はネストしたオブジェクトを `metadata[user_id]=xxx` のような記法で受け取る。
 */
function buildFormBody(
  params: Record<string, unknown>,
  prefix = ''
): URLSearchParams {
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    const fullKey = prefix ? `${prefix}[${key}]` : key;
    if (value === undefined || value === null) continue;

    if (Array.isArray(value)) {
      value.forEach((item, i) => {
        if (typeof item === 'object' && item !== null) {
          const nested = buildFormBody(
            item as Record<string, unknown>,
            `${fullKey}[${i}]`
          );
          nested.forEach((v, k) => sp.append(k, v));
        } else {
          sp.append(`${fullKey}[${i}]`, String(item));
        }
      });
    } else if (typeof value === 'object') {
      const nested = buildFormBody(value as Record<string, unknown>, fullKey);
      nested.forEach((v, k) => sp.append(k, v));
    } else {
      sp.append(fullKey, String(value));
    }
  }
  return sp;
}

export type StripeRequestOptions = {
  method: 'GET' | 'POST' | 'DELETE';
  path: string; // 例: '/v1/checkout/sessions'
  body?: Record<string, unknown>;
  idempotencyKey?: string;
};

/**
 * Stripe API への最小ラッパー。
 *
 * - 認証：Bearer
 * - 戻り値：JSON（パース済み）
 * - 4xx/5xx：例外を投げる（呼び出し元で try/catch）
 */
export async function stripeRequest<T = Record<string, unknown>>(
  opts: StripeRequestOptions
): Promise<T> {
  const url = `${STRIPE_API_BASE}${opts.path}`;
  const headers: Record<string, string> = {
    Authorization: `Bearer ${getSecretKey()}`,
    'Stripe-Version': STRIPE_API_VERSION,
  };

  let body: string | undefined;
  if (opts.body && opts.method !== 'GET') {
    headers['Content-Type'] = 'application/x-www-form-urlencoded';
    body = buildFormBody(opts.body).toString();
  }
  if (opts.idempotencyKey) {
    headers['Idempotency-Key'] = opts.idempotencyKey;
  }

  const res = await fetch(url, {
    method: opts.method,
    headers,
    body,
    cache: 'no-store',
  });

  const json = (await res.json()) as Record<string, unknown>;

  if (!res.ok) {
    const error = (json?.error ?? {}) as Record<string, unknown>;
    const message =
      (error.message as string | undefined) ?? `Stripe API error ${res.status}`;
    const code = (error.code as string | undefined) ?? 'stripe_error';
    console.error('[lib/stripe/client] API error', {
      status: res.status,
      path: opts.path,
      code,
      message,
    });
    throw new StripeApiError(message, res.status, code);
  }

  return json as T;
}

export class StripeApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly code: string
  ) {
    super(message);
    this.name = 'StripeApiError';
  }
}

// ============================================================================
// Webhook 署名検証
// ============================================================================

/**
 * Stripe-Signature ヘッダを検証する。
 *
 * ヘッダ形式： `t=1234567890,v1=signature1,v1=signature2,...`
 *
 * @param rawBody Webhook リクエストの生 body（パース前の文字列）
 * @param sigHeader `Stripe-Signature` ヘッダの値
 * @param secret   STRIPE_WEBHOOK_SECRET（whsec_***）
 * @param tolerance タイムスタンプ許容差（秒、デフォルト 300）
 * @returns 検証成功時 true、失敗時例外
 */
export function verifyStripeSignature(
  rawBody: string,
  sigHeader: string,
  secret: string,
  tolerance = 300
): true {
  const parts = sigHeader.split(',').reduce<{ t?: string; v1: string[] }>(
    (acc, part) => {
      const [k, v] = part.split('=');
      if (k === 't') acc.t = v;
      if (k === 'v1') acc.v1.push(v);
      return acc;
    },
    { v1: [] }
  );

  if (!parts.t || parts.v1.length === 0) {
    throw new Error('Invalid Stripe-Signature header format');
  }

  const timestamp = parseInt(parts.t, 10);
  if (Number.isNaN(timestamp)) {
    throw new Error('Invalid timestamp in Stripe-Signature header');
  }

  const nowSec = Math.floor(Date.now() / 1000);
  if (Math.abs(nowSec - timestamp) > tolerance) {
    throw new Error('Stripe webhook timestamp outside tolerance window');
  }

  const signedPayload = `${parts.t}.${rawBody}`;
  const expected = createHmac('sha256', secret)
    .update(signedPayload, 'utf8')
    .digest('hex');

  // 提供された v1 のいずれかが一致すれば OK
  const expectedBuf = Buffer.from(expected, 'utf8');
  const matched = parts.v1.some((sig) => {
    const sigBuf = Buffer.from(sig, 'utf8');
    if (sigBuf.length !== expectedBuf.length) return false;
    return timingSafeEqual(sigBuf, expectedBuf);
  });

  if (!matched) {
    throw new Error('Stripe webhook signature mismatch');
  }
  return true;
}
