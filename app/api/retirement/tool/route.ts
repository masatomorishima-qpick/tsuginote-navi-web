/**
 * /api/retirement/tool
 *
 * 退職金の手取り比較ツール（components/retirement/TaishokukinCalculator.tsx）の入力を、
 * 統計・分析用の一次データとして best-effort で匿名保存する（2026-08-03 新設・駅1指示書3-4）。
 *
 * 設計は /api/shisan/loan-tool と同型（同じ流儀に揃えている）：
 * - fire-and-forget（応答は使わない）。UI・GA・計算結果に一切影響しない
 * - PII は保存しない。入力値と匿名IDのみ
 * - 匿名IDは Cookie "sa" を /shisan・/loan と共用
 * - 極端値は弾かず保存（生データを失わない。除外判断は分析時）
 * - is_operator は ?op=1 の端末フラグ（lib/shisan/op.ts）を body.operator で受ける
 * - debug_flag は ?ga_debug=1 / ?debug=1
 *
 * 保存先テーブル retirement_tool_inputs は supabase/migrations に含まれない（手動管理）。
 * DDL はリポジトリ外の DDL_retirement_tool_inputs_20260803.sql（完了報告時に提示）を
 * masato が SQL Editor で実行する。テーブル未作成の間は insert が静かに失敗するだけで、
 * ツールの表示・計算には影響しない。
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

const MAX_BODY_BYTES = 8_000;

const numOrNull = (v: unknown): number | null =>
  typeof v === 'number' && isFinite(v) ? v : null;
const boolOf = (v: unknown): boolean => v === true;
const strCap = (v: unknown, max: number): string | null =>
  typeof v === 'string' && v.trim() ? v.trim().slice(0, max) : null;

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

  // 匿名ID（/shisan・/loan と共用の Cookie "sa"）。無ければ発行する。
  const cookieAnon = req.cookies.get('sa')?.value ?? '';
  const anonId = /^[0-9a-f-]{36}$/i.test(cookieAnon) ? cookieAnon : crypto.randomUUID();

  const years = numOrNull(body.years);
  const amount = numOrNull(body.amount);
  const rate = numOrNull(body.rate);
  const receiveYears = numOrNull(body.receiveYears);
  const publicPension = numOrNull(body.publicPension);

  try {
    const supabase = createAdminSupabaseClient();

    // seq：同一 anon_id の何回目の計算か（分析時に最新1件へ畳むため・loan-tool と同じ）。
    let seq = 1;
    try {
      const { count } = await supabase
        .from('retirement_tool_inputs')
        .select('id', { count: 'exact', head: true })
        .eq('anon_id', anonId);
      seq = (count ?? 0) + 1;
    } catch {
      /* 取得失敗は seq=1 のまま（best-effort） */
    }

    const { error } = await supabase.from('retirement_tool_inputs').insert({
      anon_id: anonId,
      seq,
      // 入力（型だけ整え、極端値は弾かない）
      years: years === null ? null : Math.round(years),
      amount: amount === null ? null : Math.round(amount),
      rate,
      receive_years: receiveYears === null ? null : Math.round(receiveYears),
      public_pension: publicPension === null ? null : Math.round(publicPension),
      // コンテキスト
      article_path: strCap(body.articlePath, 200),
      // データ品質（shisan_diagnoses / shisan_loan_tool_inputs と同じ規約）
      debug_flag: boolOf(body.debug),
      is_operator: boolOf(body.operator),
      referrer: strCap(body.referrer, 500),
      utm_source: strCap(body.utmSource, 120),
      utm_medium: strCap(body.utmMedium, 120),
      utm_campaign: strCap(body.utmCampaign, 200),
      user_agent: strCap(req.headers.get('user-agent'), 400),
      region: strCap(req.headers.get('x-vercel-ip-country-region'), 16),
      region_country: strCap(req.headers.get('x-vercel-ip-country'), 8),
      raw: body,
    });
    if (error) throw new Error(error.message);
  } catch (err) {
    console.error('[api/retirement/tool] save skipped', err instanceof Error ? err.message : err);
    // 失敗しても ok を返す（best-effort）。Cookie は発行する。
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
