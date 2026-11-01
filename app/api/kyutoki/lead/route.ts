import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendEmail } from '@/lib/email/client';
import { ANSWER_KEYS, CONSENT_TEXT, CONSENT_VERSION, isEmail } from '@/lib/kyutoki/lead';
import { labelOf, M_STEPS, type MStepId } from '@/lib/kyutoki/mitsumori';

/**
 * 給湯器 B：見積もり希望（メールアドレス）の受付。2026-11-02 新設。
 *
 * - kyutoki_leads（supabase/migrations/022）に1行入れる。書き込みは秘密鍵（サーバー）だけ。
 * - 受け付けたら、オーナーに通知メールを1通送る（KYUTOKI_LEAD_NOTIFY_TO が未設定なら送らない）。
 * - 利用者へのメールはここでは送らない（AI メールで下書き → オーナーが確かめてから送る決まり）。
 * - 迷惑な送信よけ：見えない入力欄（website）に値があれば、保存せずに成功を返す。
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

function str(v: unknown, max = 200): string {
  return typeof v === 'string' ? v.trim().slice(0, max) : '';
}

function pickAnswers(v: unknown): Record<string, string> {
  const out: Record<string, string> = {};
  if (!v || typeof v !== 'object' || Array.isArray(v)) return out;
  for (const k of ANSWER_KEYS) {
    const x = (v as Record<string, unknown>)[k];
    if (typeof x === 'string' && /^[a-z0-9_]{1,20}$/.test(x)) out[k] = x;
  }
  return out;
}

function pickAttr(v: unknown): Record<string, string> {
  const out: Record<string, string> = {};
  if (!v || typeof v !== 'object' || Array.isArray(v)) return out;
  for (const k of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid']) {
    const x = (v as Record<string, unknown>)[k];
    if (typeof x === 'string') out[k] = x.slice(0, 200);
  }
  return out;
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: 'bad_json' }, { status: 400 });
  }

  if (str(body.website)) return NextResponse.json({ ok: true });

  const email = str(body.email, 254).toLowerCase();
  if (!isEmail(email)) return NextResponse.json({ ok: false, error: 'email' }, { status: 400 });
  if (body.consent !== true) return NextResponse.json({ ok: false, error: 'consent' }, { status: 400 });

  if (!supabaseUrl || !supabaseSecretKey) {
    console.error('[api/kyutoki/lead] supabase env missing');
    return NextResponse.json({ ok: false, error: 'server' }, { status: 500 });
  }
  const supabase = createClient(supabaseUrl, supabaseSecretKey);

  const answers = pickAnswers(body.answers);
  const attribution = pickAttr(body.attribution);
  const row = {
    email,
    consent_at: new Date().toISOString(),
    consent_text: `${CONSENT_TEXT}（${CONSENT_VERSION}）`,
    answers,
    verdict: str(body.verdict, 40) || null,
    entry: str(body.entry, 40) || null,
    version: str(body.version, 40) || null,
    attribution,
    anon_id: str(body.anon_id, 80) || null,
    visit_id: str(body.visit_id, 80) || null,
  };

  const { data, error } = await supabase.from('kyutoki_leads').insert(row).select('id').single();
  if (error) {
    console.error('[api/kyutoki/lead] insert error', error);
    return NextResponse.json({ ok: false, error: 'server' }, { status: 500 });
  }

  const notifyTo = process.env.KYUTOKI_LEAD_NOTIFY_TO;
  if (notifyTo) {
    const lines = M_STEPS.filter((s) => answers[s.id]).map((s) => `${s.lcd}：${labelOf(s.id as MStepId, answers[s.id])}`);
    const text = [
      `給湯器の見積もり希望が届きました（受付番号 ${data.id}）。`,
      '',
      `メール：${email}`,
      ...lines,
      '',
      `入口：${row.entry ?? ''}／版：${row.version ?? ''}`,
      `広告の言葉：${attribution.utm_term ?? '（なし）'}`,
      '',
      '受付メール（市区町村と本体の写真を聞く）の下書きを作り、確かめてから送ってください。',
    ].join('\n');
    const html = `<pre style="font-family:sans-serif;white-space:pre-wrap">${text
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>`;
    const r = await sendEmail({
      to: notifyTo,
      subject: `[給湯器] 見積もり希望 #${data.id}`,
      text,
      html,
      fromDisplayName: 'つぎの手ナビ 給湯器',
    });
    if (!r.ok) console.error('[api/kyutoki/lead] notify failed', r);
  }

  return NextResponse.json({ ok: true });
}
