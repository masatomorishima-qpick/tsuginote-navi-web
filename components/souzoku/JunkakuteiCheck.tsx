'use client';

import { useEffect, useRef, useState } from 'react';
import { CalendarClock, Check, FileCheck2, ListChecks } from 'lucide-react';
import { trackEvent } from '@/lib/trackEvent';
import DATA from '@/lib/souzoku/haifu-data.json';

/**
 * 準確定申告の期限と必要書類（/guide/souzoku/junkakutei-checklist、2026-11-12）。
 * 期限：国税庁 No.2022（相続の開始があったことを知った日の翌日から4か月以内）。
 *   翌日から数えて4か月後の前の日（1月6日→5月6日、月末に知ったら4か月後の月末。10/31→2/28・2/29→6/30）。
 * 書類：国税庁 No.2022・確定申告の手引き「申告書に添付・提示する書類」・準確定申告の e-Tax 対応。
 * 使われたかは lp_event_logs の event_name 'junkakutei_check'（1回目だけ）。入れた内容は送らない。
 */
const J = DATA.junkakutei;

/** 「知った日の翌日から n か月以内」の最後の日：翌日から数えて n か月後の前の日（月末に知ったら n か月後の月末）。 */
function kigenDate(d: Date, n: number) {
  // 翌日から数えて、応当日の前の日。応当日がない月はその月の末日（国税通則法10条と同じ数え方）。
  const next = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
  const y = next.getFullYear();
  const m = next.getMonth() + n;
  const dd = next.getDate() - 1;
  if (dd === 0) return new Date(y, m, 0);
  return new Date(y, m, Math.min(dd, new Date(y, m + 1, 0).getDate()));
}
const fmt = (d: Date) => `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;

export default function JunkakuteiCheck({ lpId }: { lpId: string }) {
  const [day, setDay] = useState('');
  const [on, setOn] = useState<Record<string, boolean>>({});
  const sent = useRef(false);
  const touched = useRef(false);

  useEffect(() => {
    if (!touched.current || sent.current) return;
    sent.current = true;
    void trackEvent({ lp_id: lpId, event_name: 'junkakutei_check', component_id: 'junkakutei-check' });
  });

  const base = day ? new Date(`${day}T00:00:00`) : null;
  const valid = !!base && !Number.isNaN(base.getTime());
  const list: { h: string; d: string }[] = J.kihon.map((k) => ({ h: k.h, d: k.d }));
  for (const j of J.jokyo) if (on[j.key]) for (const it of j.items) list.push(it);

  return (
    <div className="flex flex-col gap-4 rounded-2xl border-2 border-sky-200 bg-sky-50/60 p-4">
      <p className="flex items-center gap-2 text-[17px] font-black text-slate-900">
        <ListChecks size={22} className="text-sky-700" aria-hidden="true" />期限と要る書類<span className="text-[12px] font-bold text-sky-700">無料</span>
      </p>
      <label className="flex flex-col gap-1.5">
        <span className="flex items-center gap-1.5 text-[13px] font-black text-slate-700"><CalendarClock size={16} aria-hidden="true" />亡くなったことを知った日（ふつうは亡くなった日）</span>
        <input type="date" value={day} onChange={(e) => { touched.current = true; setDay(e.target.value); }} aria-label="亡くなったことを知った日"
          className="rounded-xl bg-white px-3 py-3 text-[17px] font-bold text-slate-900 ring-1 ring-slate-300 outline-none focus:ring-2 focus:ring-sky-600" />
      </label>
      {valid && (
        <p className="rounded-xl bg-orange-50 p-3 text-[14px] font-black text-orange-800 ring-1 ring-orange-200">
          申告と納税の期限：{fmt(kigenDate(base!, J.kigenN))}まで（目安）
          <span className="mt-0.5 block text-[11px] font-bold text-orange-700">亡くなった年の1月1日から亡くなった日までの所得を申告</span>
        </p>
      )}
      <div className="flex flex-col gap-1.5">
        <p className="text-[13px] font-black text-slate-700">当てはまるものを選ぶ</p>
        {J.jokyo.map((j) => {
          const sel = !!on[j.key];
          return (
            <button key={j.key} type="button" aria-pressed={sel} onClick={() => { touched.current = true; setOn((s) => ({ ...s, [j.key]: !s[j.key] })); }}
              className={`flex w-full items-center gap-2.5 rounded-xl bg-white p-3 text-left ring-1 ${sel ? 'ring-emerald-300' : 'ring-slate-200'}`}>
              <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md ring-1 ${sel ? 'bg-emerald-600 text-white ring-emerald-600' : 'bg-white text-transparent ring-slate-300'}`}><Check size={16} aria-hidden="true" /></span>
              <span className="text-[14px] font-bold text-slate-900">{j.h}</span>
            </button>
          );
        })}
      </div>
      <div className="flex flex-col gap-2 rounded-xl bg-white p-3 ring-1 ring-slate-200" aria-live="polite">
        <p className="flex items-center gap-1.5 text-[15px] font-black text-orange-700"><FileCheck2 size={18} aria-hidden="true" />出す書類 {list.length}点</p>
        <ol className="flex flex-col gap-1.5">
          {list.map((it, i) => (
            <li key={it.h} className="flex gap-2 text-[13px]">
              <span className="w-5 shrink-0 text-right font-black text-slate-400">{i + 1}</span>
              <span className="flex flex-col"><span className="font-bold text-slate-900">{it.h}</span>{it.d && <span className="text-[11px] text-slate-500">{it.d}</span>}</span>
            </li>
          ))}
        </ol>
        <p className="text-[11px] text-slate-500">{J.gensen}</p>
      </div>
      <p className="text-[11px] leading-relaxed text-slate-500">期限は、知った日の翌日から数えた目安です。土日・祝日なら翌日になることがあります。入れた内容は送られません。</p>
    </div>
  );
}
