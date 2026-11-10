'use client';

import { useEffect, useRef, useState } from 'react';
import { CalendarClock, Check } from 'lucide-react';
import { trackEvent } from '@/lib/trackEvent';
import DATA from '@/lib/souzoku/haifu-data.json';

/**
 * 相続の手続きの期限の目安（/guide/souzoku/tetsuzuki-checklist、2026-11-10）。
 * 亡くなった日を入れると、月・年で決まる期限を「同じ日付」で数えた目安を出す（国税庁 No.4205 の例：1月6日→11月6日）。
 * 日数で決まる期限（死亡届7日・年金10日／14日）は数え方が手続きで違うので、日付は出さず文言だけ。
 * 使われたかは lp_event_logs の event_name 'tetsuzuki_kigen'（1回目だけ）。入れた日付は送らない。
 */
const T = DATA.tetsuzuki;

function addMonths(d: Date, n: number) {
  const r = new Date(d.getFullYear(), d.getMonth() + n, d.getDate());
  // 応当日がない月（例：1/31 の1か月後）は、その月の末日にする
  if (r.getDate() !== d.getDate()) return new Date(d.getFullYear(), d.getMonth() + n + 1, 0);
  return r;
}
const fmt = (d: Date) => `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;

export default function TetsuzukiKigen({ lpId }: { lpId: string }) {
  const [day, setDay] = useState('');
  const [done, setDone] = useState<Record<string, boolean>>({});
  const sent = useRef(false);
  const base = day ? new Date(`${day}T00:00:00`) : null;
  const valid = base && !Number.isNaN(base.getTime());

  useEffect(() => {
    if (!valid || sent.current) return;
    sent.current = true;
    void trackEvent({ lp_id: lpId, event_name: 'tetsuzuki_kigen', component_id: 'tetsuzuki-kigen' });
  }, [valid, lpId]);

  return (
    <div className="flex flex-col gap-3 rounded-2xl border-2 border-sky-200 bg-sky-50/60 p-4">
      <p className="flex items-center gap-2 text-[17px] font-black text-slate-900">
        <CalendarClock size={22} className="text-sky-700" aria-hidden="true" />手続きの期限<span className="text-[12px] font-bold text-sky-700">無料</span>
      </p>
      <label className="flex flex-col gap-1.5">
        <span className="text-[13px] font-bold text-slate-700">亡くなった日</span>
        <input type="date" value={day} onChange={(e) => setDay(e.target.value)} className="rounded-xl bg-white px-3 py-3 text-[17px] font-bold text-slate-900 ring-1 ring-slate-300 outline-none focus:ring-2 focus:ring-sky-600" aria-label="亡くなった日" />
      </label>
      <ol className="flex flex-col gap-1.5">
        {T.items.map((it) => {
          const date = valid && it.unit && it.n ? (it.unit === 'm' ? addMonths(base!, it.n) : it.unit === 'y' ? addMonths(base!, it.n * 12) : null) : null;
          const on = !!done[it.key];
          return (
            <li key={it.key} className={`flex items-start gap-2.5 rounded-xl bg-white p-3 ring-1 ${on ? 'ring-emerald-300' : 'ring-slate-200'}`}>
              <button type="button" aria-pressed={on} aria-label={`${it.h}を済みにする`} onClick={() => setDone((s) => ({ ...s, [it.key]: !s[it.key] }))}
                className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md ring-1 ${on ? 'bg-emerald-600 text-white ring-emerald-600' : 'bg-white text-transparent ring-slate-300'}`}>
                <Check size={16} aria-hidden="true" />
              </button>
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className={`text-[15px] font-black ${on ? 'text-slate-400 line-through' : 'text-slate-900'}`}>{it.h}</span>
                <span className="text-[12px] text-slate-600">{it.kigen}　{it.saki}</span>
              </span>
              {date && <span className="shrink-0 rounded-lg bg-orange-50 px-2 py-1 text-right text-[12px] font-black leading-tight text-orange-700">{fmt(date)}<br /><span className="text-[10px] font-bold">まで（目安）</span></span>}
            </li>
          );
        })}
      </ol>
      <p className="text-[11px] leading-relaxed text-slate-500">{T.keisanNote}入れた日付は送られません。</p>
    </div>
  );
}
