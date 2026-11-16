'use client';

import { useState } from 'react';
import { CheckCircle2, Circle } from 'lucide-react';
import { trackEvent } from '@/lib/trackEvent';
import { CHECKS } from '@/lib/houjin/kouza-data';

/** 法人口座の申込前チェック（2026-11-16）。押すと済みになる。全部済んだら一度だけ記録する。 */
export default function KouzaCheck({ lpId }: { lpId: string }) {
  const [done, setDone] = useState<boolean[]>(() => CHECKS.map(() => false));
  const [logged, setLogged] = useState(false);
  const n = done.filter(Boolean).length;
  const toggle = (i: number) => {
    const next = done.map((v, j) => (j === i ? !v : v));
    setDone(next);
    if (!logged && next.every(Boolean)) {
      setLogged(true);
      void trackEvent({ lp_id: lpId, event_name: 'check_complete', component_id: 'kouza-check' });
    }
  };
  return (
    <div className="flex flex-col gap-2">
      <p className="flex items-center justify-between text-[13px] font-bold text-slate-600">
        押すと済みになります<span className="text-sky-700">{n} / {CHECKS.length}</span>
      </p>
      <ul className="grid gap-2">
        {CHECKS.map((c, i) => (
          <li key={c.h}>
            <button
              type="button"
              aria-pressed={done[i]}
              onClick={() => toggle(i)}
              className={`flex w-full items-start gap-3 rounded-2xl p-3.5 text-left ring-1 ${done[i] ? 'bg-emerald-50 ring-emerald-200' : 'bg-white ring-slate-200'}`}
            >
              {done[i]
                ? <CheckCircle2 size={22} className="mt-0.5 shrink-0 text-emerald-600" aria-hidden="true" />
                : <Circle size={22} className="mt-0.5 shrink-0 text-slate-300" aria-hidden="true" />}
              <span className="flex flex-col gap-0.5">
                <span className="text-[15px] font-black text-slate-900">{c.h}</span>
                <span className="text-[12px] text-slate-600">{c.s}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
