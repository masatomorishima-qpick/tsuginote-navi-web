'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, CalendarCheck, CircleCheck, ClipboardCheck, Mail, PhoneOff } from 'lucide-react';
import { getAnonId, getVisitId } from '@/lib/clientTracking';
import { CONSENT_TEXT, isEmail } from '@/lib/kyutoki/lead';

/**
 * 給湯器 B：「2社から総額の見積もり」のメール入力欄（2026-11-02 新設）。
 * 送信先は /api/kyutoki/lead。名前・電話・住所は聞かない（日程が決まってから伺う決まり）。
 * onEvent で、表示・送信・失敗を親の計測に渡す（lp_event_logs に送るのは親）。
 */

type Props = {
  answers: Record<string, string | undefined>;
  verdict?: string;
  entry: string;
  version: string;
  getAttribution: () => Record<string, string>;
  onEvent: (event: 'kyutoki_lead_submit' | 'kyutoki_lead_error' | 'kyutoki_lead_consent', params?: Record<string, string>) => void;
};

const STEPS = [
  { icon: Mail, t: 'メールで条件を確認' },
  { icon: CalendarCheck, t: '日程を調整' },
  { icon: ClipboardCheck, t: '2社が現地で見積もり' },
];

export default function QuoteRequestForm({ answers, verdict, entry, version, getAttribution, onEvent }: Props) {
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [hp, setHp] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [msg, setMsg] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = email.trim();
    if (!isEmail(v)) {
      setMsg('メールアドレスをご確認ください');
      onEvent('kyutoki_lead_error', { reason: 'email' });
      return;
    }
    if (!consent) {
      setMsg('工事会社に伝えることへの同意にチェックを入れてください');
      onEvent('kyutoki_lead_error', { reason: 'consent' });
      return;
    }
    setMsg('');
    setState('sending');
    try {
      const res = await fetch('/api/kyutoki/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: v, consent: true, answers, verdict, entry, version, attribution: getAttribution(),
          anon_id: getAnonId(), visit_id: getVisitId(), website: hp,
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setState('done');
      onEvent('kyutoki_lead_submit');
    } catch (err) {
      setState('error');
      setMsg('送れませんでした。時間をおいて、もう一度お試しください');
      onEvent('kyutoki_lead_error', { reason: 'server', detail: String(err).slice(0, 60) });
    }
  };

  if (state === 'done') {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-5 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
          <CircleCheck size={30} aria-hidden="true" />
        </span>
        <p className="text-[22px] font-black text-slate-900">受け付けました</p>
        <p className="text-[15px] text-slate-700">確認のメールを、その日のうちにお送りします<span className="whitespace-nowrap">（夜は翌朝）</span></p>
        <p className="text-[12px] text-slate-500">届かないときは、迷惑メールのフォルダもご確認ください</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-4 rounded-2xl border-2 border-orange-200 bg-orange-50/60 p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-orange-800">無料</span>
        <span className="rounded border border-orange-300 px-1.5 text-[10px] tracking-widest text-orange-800">PR</span>
      </div>
      <p className="-mt-2 text-[22px] font-black leading-tight text-slate-900">2社から総額の見積もり</p>

      <ol className="grid grid-cols-3 gap-2">
        {STEPS.map(({ icon: I, t }, i) => (
          <li key={t} className="flex flex-col items-center gap-1.5 rounded-xl bg-white px-1.5 py-3 text-center ring-1 ring-orange-100">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-100 text-orange-700">
              <I size={18} aria-hidden="true" />
            </span>
            <span className="text-[10px] font-bold text-orange-700">{i + 1}</span>
            <span className="text-[12px] font-bold leading-tight text-slate-700">{t}</span>
          </li>
        ))}
      </ol>

      <label className="flex flex-col gap-1.5">
        <span className="text-[13px] font-bold text-slate-700">メールアドレス</span>
        <input
          type="email"
          inputMode="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="example@mail.com"
          className="min-h-[52px] rounded-xl border-2 border-slate-200 bg-white px-4 text-[16px] text-slate-900 outline-none focus:border-sky-600"
        />
      </label>

      {/* 迷惑な送信よけ（人には見えない） */}
      <input type="text" name="website" value={hp} onChange={(e) => setHp(e.target.value)} tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute left-[-9999px] h-px w-px opacity-0" />

      <label className="flex items-start gap-2.5 text-[13px] leading-relaxed text-slate-700">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => { setConsent(e.target.checked); if (e.target.checked) onEvent('kyutoki_lead_consent'); }}
          className="mt-1 h-5 w-5 shrink-0 accent-orange-600"
        />
        <span>
          {CONSENT_TEXT}
          <Link href="/privacy#kyutoki" target="_blank" className="ml-1 text-sky-800 underline underline-offset-2">情報の取り扱い</Link>
        </span>
      </label>

      <button
        type="submit"
        disabled={state === 'sending'}
        className="flex min-h-[60px] w-full items-center justify-center gap-2 rounded-2xl bg-orange-600 px-5 text-lg font-bold text-white shadow-[0_8px_20px_-10px_rgba(234,88,12,.8)] transition hover:bg-orange-700 active:scale-[.99] disabled:opacity-60"
      >
        {state === 'sending' ? '送っています…' : <>見積もりを頼む（無料）<ArrowRight size={20} aria-hidden="true" /></>}
      </button>

      {msg && <p role="alert" className="text-center text-[13px] font-bold text-red-700">{msg}</p>}

      <p className="flex items-center justify-center gap-1.5 text-center text-[12px] text-slate-600">
        <PhoneOff size={14} className="shrink-0 text-slate-500" aria-hidden="true" />
        日程が決まるまで、電話番号は工事会社に伝えません
      </p>
    </form>
  );
}
