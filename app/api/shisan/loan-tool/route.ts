/**
 * /api/shisan/loan-tool
 *
 * 住宅ローン計算ツール（components/loan/LoanCalculator.tsx）の入力を、
 * 統計・分析用の一次データとして best-effort で匿名保存する（2026-07-31 新設）。
 *
 * 設計方針（/shisan の /api/shisan/diagnosis と同じ流儀に揃えている）：
 * - 保存はクライアントからの fire-and-forget（応答は使わない）。UI・GAイベント・計算結果に一切影響しない。
 * - PII は保存しない。住宅ローンの入力値と匿名IDのみ。
 * - 匿名IDは Cookie "sa"（PIIではないUUID）を /shisan と共用し、同一訪問者の行動を後から繋げられるようにする。
 * - 極端値は弾かず保存する（生データを失わない。除外判断は分析時）。
 * - 保存失敗は無音（best-effort）。ツールの表示は別経路なので止まらない。
 *
 * データ品質：?ga_debug=1 / ?debug=1 での操作は debug_flag=true で保存し、分析時に除外する。
 * （テスト行が実データに混ざる事故を過去に起こしているため、この除外は必須）
 *
 * is_operator について：会員モデルが廃止済みで /loan にログインがないため、判定手段がない。
 * 常に false のままとし、列だけ将来のために残す（2026-07-31 masato 確定）。
 *
 * 保存先テーブル shisan_loan_tool_inputs は supabase/migrations には含まれない。
 * DDL は リポジトリ外の DDL_shisan_loan_tool_inputs_20260731.sql で管理し、
 * Supabase の SQL Editor で手動実行する（ランブック第7章-3）。
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { isToolMode, RATE_TYPE_CODE, type RateTypeCode } from '@/lib/loan/tool';

const MAX_BODY_BYTES = 8_000;

const numOrNull = (v: unknown): number | null =>
  typeof v === 'number' && isFinite(v) ? v : null;
const boolOf = (v: unknown): boolean => v === true;
const strCap = (v: unknown, max: number): string | null =>
  typeof v === 'string' && v.trim() ? v.trim().slice(0, max) : null;
const rateTypeOf = (v: unknown): RateTypeCode | null =>
  v === RATE_TYPE_CODE.HENDO || v === RATE_TYPE_CODE.KOTEI ? v : null;

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    const text = await req.text();
    if (text.length > MAX_BODY_BYTES) {
      return NextResponse.json({ ok: false, error: 'too_large' }, { status: 413 });
    }
    body = JSON.parse(text) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }

  // mode だけは DB の check 制約と対応するため、ここで弾く（制約違反は best-effort だと無音の欠損になる）。
  const mode = body.mode;
  if (!isToolMode(mode)) {
    return NextResponse.json({ ok: false, error: 'invalid_mode' }, { status: 400 });
  }

  // 匿名ID（/shisan と共用の Cookie "sa"）。無ければ発行する。
  const cookieAnon = req.cookies.get('sa')?.value ?? '';
  const anonId = /^[0-9a-f-]{36}$/i.test(cookieAnon) ? cookieAnon : crypto.randomUUID();

  const balance = numOrNull(body.balance);
  const years = numOrNull(body.years);
  const rate = numOrNull(body.rate);
  const prepayAmount = numOrNull(body.prepayAmount);

  try {
    const supabase = createAdminSupabaseClient();

    // seq：同一 anon_id の何回目の計算か（分析時に最新1件へ畳むため）。
    let seq = 1;
    try {
      const { count } = await supabase
        .from('shisan_loan_tool_inputs')
        .select('id', { count: 'exact', head: true })
        .eq('anon_id', anonId);
      seq = (count ?? 0) + 1;
    } catch {
      /* 取得失敗は seq=1 のまま（best-effort） */
    }

    const { error } = await supabase.from('shisan_loan_tool_inputs').insert({
      anon_id: anonId,
      seq,
      // 入力（型だけ整え、極端値は弾かない）
      balance: balance === null ? null : Math.round(balance),
      years: years === null ? null : Math.round(years),
      rate,
      rate_type: rateTypeOf(body.rateType),
      prepay_amount: prepayAmount === null ? null : Math.round(prepayAmount),
      // コンテキスト
      mode,
      article_path: strCap(body.articlePath, 200),
      // データ品質
      debug_flag: boolOf(body.debug),
      is_operator: false, // 判定手段がないため常に false
      referrer: strCap(body.referrer, 500),
      utm_source: strCap(body.utmSource, 120),
      utm_medium: strCap(body.utmMedium, 120),
      utm_campaign: strCap(body.utmCampaign, 200),
      user_agent: strCap(req.headers.get('user-agent'), 400),
      // 地域：Vercel の geo ヘッダから都道府県レベルのみ（市区町村は取らない）
      region: strCap(req.headers.get('x-vercel-ip-country-region'), 16),
      region_country: strCap(req.headers.get('x-vercel-ip-country'), 8),
      raw: body,
    });
    if (error) throw new Error(error.message);
  } catch (err) {
    console.error('[api/shisan/loan-tool] save skipped', err instanceof Error ? err.message : err);
    // 失敗しても ok を返す（ツールの表示は別経路・best-effort）。Cookie は発行する。
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set('sa', anonId, {
    httpOnly: true,
    sameSite: 'lax',
    secure: true,
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}
