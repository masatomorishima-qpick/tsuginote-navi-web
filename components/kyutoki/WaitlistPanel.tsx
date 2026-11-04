'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BellRing, CircleCheck } from 'lucide-react';
import { getAnonId, getVisitId } from '@/lib/clientTracking';
import { isEmail, WAITLIST_CONSENT_TEXT } from '@/lib/kyutoki/lead';
import { NEEDS, type Cta } from '@/lib/kyutoki/mitsumori';

/**
 * 給湯器 B：ボタンを押した人に「準備中」を正直に伝え、お知らせ用のメールアドレスと1問を受け取る（2026-11-03）。
 * ニーズの計測（docs/kyutoki-b/measure.md）：
 *   ボタンの押下（親で記録）＝頼みたい気持ち、ここでのメール入力＝待ってでも預ける信頼、1問＝いちばん知りたいこと。
 * メールアドレスはお知らせだけに使い、工事会社には渡さない。
 */

type Props = {
  cta: Cta;
  answers: Record<string, string | undefined>;
  entry: string;
  version: string;
  getAttribution: () => Record<string, string>;
  onEvent: (event: string, params?: Record<string, string>) => void;
};

export default function WaitlistPanel({ cta, answers, entry, version, getAttribution, onEvent }: Props) {
  const [need, setNeed] = useState('');
  const [email, setEmail] = useState('');
  const [hp, setHp] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [msg, setMsg] = useState('');

  const pickNeed = (v: string) => {
    setNeed(v);
    onEvent('kyutoki_need_select', { cta, need: v });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = email.trim();
    if (!isEmail(v)) {
      setMsg('メールアドレスをご確認ください');
      onEvent('kyutoki_lead_error', { reason: 'email', cta });
      return;
    }
    setMsg('');
    setState('sending');
    try {
      const res = await fetch('/api/kyutoki/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'waitlist', email: v, consent: true,
          answers: { ...answers, cta, ...(need ? { need } : {}) },
          entry, version, attribution: getAttribution(),
          anon_id: getAnonId(), visit_id: getVisitId(), website: hp,
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setState('done');
      onEvent('kyutoki_waitlist_submit', { cta, need });
    } catch (err) {
      setState('error');
      setMsg('送れませんでした。時間をおいて、もう一度お試しください');
      onEvent('kyutoki_lead_error', { reason: 'server', cta, detail: String(err).slice(0, 60) });
    }
  };

  if (state === 'done') {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-5 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
          <CircleCheck size={30} aria-hidden="true" />
        </span>
        <p className="text-[22px] font-black text-slate-900">登録しました</p>
        <p className="text-[15px] text-slate-700">受付が始まったら、最初にお知らせします</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-4 rounded-2xl border-2 border-sky-200 bg-sky-50/60 p-4">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-700">
          <BellRing size={20} aria-hidden="true" />
        </span>
        <div className="flex flex-col gap-1">
          <p className="text-[18px] font-black leading-snug text-slate-900">ただいま準備中です</p>
          <p className="text-[14px] leading-relaxed text-slate-700">{cta === 'check' ? '見積もりを見る受付' : '確かめた工事会社の紹介'}を準備しています。始まったら、最初にお知らせします。</p>
        </div>
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-[13px] font-bold text-slate-700">いちばん知りたいことは？</legend>
        <div className="grid grid-cols-2 gap-2">
          {NEEDS.map((n) => (
            <button
              key={n.v}
              type="button"
              aria-pressed={need === n.v}
              onClick={() => pickNeed(n.v)}
              className={`min-h-[48px] rounded-xl border-2 px-2 text-[14px] font-bold transition ${need === n.v ? 'border-sky-600 bg-white text-sky-800' : 'border-slate-200 bg-white text-slate-700 hover:border-sky-400'}`}
            >
              {n.t}
            </button>
          ))}
        </div>
      </fieldset>

      <label className="flex flex-col gap-1.5">
        <span className="text-[13px] font-bold text-slate-700">お知らせを受け取るメールアドレス</span>
        <input
          id="waitlist-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="example@mail.com"
          className="min-h-[52px] rounded-xl border-2 border-slate-200 bg-white px-4 text-[16px] text-slate-900 outline-none focus:border-sky-600"
        />
      </label>
      <input type="text" name="website" value={hp} onChange={(e) => setHp(e.target.value)} tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute left-[-9999px] h-px w-px opacity-0" />

      <button
        type="submit"
        disabled={state === 'sending'}
        className="flex min-h-[56px] w-full items-center justify-center rounded-2xl bg-sky-700 px-5 text-[17px] font-bold text-white transition hover:bg-sky-800 disabled:opacity-60"
      >
        {state === 'sending' ? '送っています…' : 'お知らせを受け取る'}
      </button>
      {msg && <p role="alert" className="text-center text-[13px] font-bold text-red-700">{msg}</p>}
      <p className="text-center text-[11px] leading-relaxed text-slate-500">
        {WAITLIST_CONSENT_TEXT}
        <Link href="/privacy#kyutoki" target="_blank" className="ml-1 text-sky-800 underline underline-offset-2">情報の取り扱い</Link>
      </p>
    </form>
  );
}
