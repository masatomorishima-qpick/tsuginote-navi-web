import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendEmail } from '@/lib/email/client';
import { ANSWER_KEYS, CONSENT_TEXT, CONSENT_VERSION, isEmail } from '@/lib/kyutoki/lead';
import { labelOf, M_STEPS, type MStepId } from '@/lib/kyutoki/mitsumori';
import { userDrafts, type Lead } from '@/lib/kyutoki/drafts';

/**
 * 給湯器 B：見積もり希望（メールアドレス）の受付。2026-11-02 新設。
 *
 * - kyutoki_leads（supabase/migrations/022）に1行入れる。書き込みは秘密鍵（サーバー）だけ。
 * - 受け付けたら、オーナーに通知メールを1通送る（宛先は KYUTOKI_LEAD_NOTIFY_TO、未設定なら support@tsuginotenavi.jp）。
 *   通知には、そのまま送れる受付メールの下書きを付ける。
 * - 表（kyutoki_leads）がまだ無い・保存に失敗したときも、通知メールは送って成功を返す
 *   （取り込みを SQL の実行より先にしても、受付を落とさないため。2026-11-02）。
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

  let id: number | null = null;
  let saveError = '';
  if (supabaseUrl && supabaseSecretKey) {
    const supabase = createClient(supabaseUrl, supabaseSecretKey);
    const { data, error } = await supabase.from('kyutoki_leads').insert(row).select('id').single();
    if (error) {
      saveError = error.message;
      console.error('[api/kyutoki/lead] insert error', error);
    } else {
      id = data.id as number;
    }
  } else {
    saveError = 'supabase env missing';
  }

  const notifyTo = process.env.KYUTOKI_LEAD_NOTIFY_TO || 'support@tsuginotenavi.jp';
  const lines = M_STEPS.filter((s) => answers[s.id]).map((s) => `${s.lcd}：${labelOf(s.id as MStepId, answers[s.id])}`);
  const draft = userDrafts({
    id: id ?? 0, created_at: row.consent_at, email, answers, status: 'new',
    city: null, availability: null, photo_received: false, customer_name: null, customer_address: null,
    customer_phone: null, vendor_a: null, vendor_b: null, schedule_a: null, schedule_b: null,
    result_a: null, result_b: null, note: null,
  } satisfies Lead)[0];
  const text = [
    `給湯器の見積もり希望が届きました（受付番号 ${id ?? '未保存'}）。`,
    saveError ? `※保存できませんでした（${saveError}）。このメールが唯一の記録です。` : '',
    '',
    `メール：${email}`,
    ...lines,
    '',
    `入口：${row.entry ?? ''}／版：${row.version ?? ''}`,
    `広告の言葉：${attribution.utm_term ?? '（なし）'}`,
    '',
    '―― 受付メールの下書き（確かめてから送ってください）――',
    `宛先：${email}`,
    `件名：${draft.subject}`,
    '',
    draft.body,
  ].filter((l, i, arr) => !(l === '' && arr[i - 1] === '')).join('\n');
  const html = `<pre style="font-family:sans-serif;white-space:pre-wrap">${text
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>`;
  const r = await sendEmail({
    to: notifyTo,
    subject: `[給湯器] 見積もり希望 #${id ?? '未保存'}`,
    text,
    html,
    fromDisplayName: 'つぎの手ナビ 給湯器',
  });
  if (!r.ok) console.error('[api/kyutoki/lead] notify failed', r);

  // 保存も通知もできなかったときだけ失敗を返す（利用者に送り直してもらう）
  if (id === null && !r.ok) {
    return NextResponse.json({ ok: false, error: 'server' }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
