'use client';

import { useEffect, useRef, useState } from 'react';
import { CalendarClock, Check, ListChecks } from 'lucide-react';
import { trackEvent } from '@/lib/trackEvent';
import DATA from '@/lib/hoken/haifu-data.json';

/**
 * 生命保険の見直しチェック（/guide/shisan-kanri/hoken-minaoshi-checklist、2026-11-10）。
 * 節目と、保険証券で確かめる6つに印を付けると、見直しの目安と残りが出る。
 * 契約した日と保険期間を入れると、次の更新の目安の日付を出す（更新型は更新の前に申し出る：生命保険文化センター）。
 * 使われたかは lp_event_logs の event_name 'hoken_minaoshi'（1回目だけ）。入れた内容は送らない。
 */
const M = DATA.minaoshi;
const KIKAN = [5, 10, 15, 20];

function nextKoshin(start: Date, years: number, today: Date) {
  for (let n = 1; n <= 20; n++) {
    const y = start.getFullYear() + years * n;
    let d = new Date(y, start.getMonth(), start.getDate());
    // 2/29 契約などで応当日がない年は、その月の末日にする
    if (d.getMonth() !== start.getMonth()) d = new Date(y, start.getMonth() + 1, 0);
    if (d > today) return d;
  }
  return null;
}
const fmt = (d: Date) => `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;

function Box({ on, label, sub, toggle }: { on: boolean; label: string; sub?: string; toggle: () => void }) {
  return (
    <button type="button" aria-pressed={on} onClick={toggle}
      className={`flex w-full items-start gap-2.5 rounded-xl bg-white p-3 text-left ring-1 ${on ? 'ring-emerald-300' : 'ring-slate-200'}`}>
      <span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md ring-1 ${on ? 'bg-emerald-600 text-white ring-emerald-600' : 'bg-white text-transparent ring-slate-300'}`}>
        <Check size={16} aria-hidden="true" />
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="text-[14px] font-bold text-slate-900">{label}</span>
        {sub && <span className="text-[12px] text-slate-500">{sub}</span>}
      </span>
    </button>
  );
}

export default function HokenMinaoshiCheck({ lpId }: { lpId: string }) {
  const [on, setOn] = useState<Record<string, boolean>>({});
  const [day, setDay] = useState('');
  const [kikan, setKikan] = useState(10);
  const sent = useRef(false);
  const flip = (k: string) => setOn((s) => ({ ...s, [k]: !s[k] }));

  const fushime = M.fushime.filter((f) => on[f.key]).length;
  const shoken = M.shoken.filter((s) => on[s.key]).length;
  const start = day ? new Date(`${day}T00:00:00`) : null;
  const valid = !!start && !Number.isNaN(start.getTime());
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const next = valid ? nextKoshin(start!, kikan, today) : null;
  const months = next ? (next.getFullYear() - today.getFullYear()) * 12 + next.getMonth() - today.getMonth() - (next.getDate() < today.getDate() ? 1 : 0) : 0;
  const used = fushime + shoken > 0 || valid;

  useEffect(() => {
    if (!used || sent.current) return;
    sent.current = true;
    void trackEvent({ lp_id: lpId, event_name: 'hoken_minaoshi', component_id: 'hoken-minaoshi' });
  }, [used, lpId]);

  return (
    <div className="flex flex-col gap-4 rounded-2xl border-2 border-sky-200 bg-sky-50/60 p-4">
      <p className="flex items-center gap-2 text-[17px] font-black text-slate-900">
        <ListChecks size={22} className="text-sky-700" aria-hidden="true" />見直しチェック<span className="text-[12px] font-bold text-sky-700">無料</span>
      </p>

      <div className="flex flex-col gap-2">
        <p className="text-[13px] font-black text-slate-700">① 最後に見直してからあった節目</p>
        <div className="grid grid-cols-2 gap-1.5">
          {M.fushime.map((f) => <Box key={f.key} on={!!on[f.key]} label={f.h} toggle={() => flip(f.key)} />)}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-[13px] font-black text-slate-700">② 保険証券で確かめた</p>
        <div className="flex flex-col gap-1.5">
          {M.shoken.map((s) => <Box key={s.key} on={!!on[s.key]} label={s.h} sub={s.d} toggle={() => flip(s.key)} />)}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <p className="flex items-center gap-1.5 text-[13px] font-black text-slate-700"><CalendarClock size={16} aria-hidden="true" />③ 次の更新の目安</p>
        <div className="grid grid-cols-[1fr_auto] gap-2">
          <label className="flex flex-col gap-1 text-[11px] font-bold text-slate-600">契約した日
            <input type="date" value={day} onChange={(e) => setDay(e.target.value)} className="rounded-xl bg-white px-3 py-2.5 text-[16px] font-bold text-slate-900 ring-1 ring-slate-300 outline-none focus:ring-2 focus:ring-sky-600" />
          </label>
          <label className="flex flex-col gap-1 text-[11px] font-bold text-slate-600">保険期間
            <select value={kikan} onChange={(e) => setKikan(Number(e.target.value))} className="rounded-xl bg-white px-3 py-2.5 text-[16px] font-bold text-slate-900 ring-1 ring-slate-300 outline-none">
              {KIKAN.map((k) => <option key={k} value={k}>{k}年</option>)}
            </select>
          </label>
        </div>
        {next && (
          <p className="rounded-xl bg-orange-50 px-3 py-2 text-center text-[14px] font-black text-orange-700" aria-live="polite">
            次の更新 {fmt(next)}ごろ<span className="ml-1 text-[12px] font-bold">（あと約{months}か月）</span>
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-1.5 text-center" aria-live="polite">
        <div className={`rounded-xl px-2 py-2.5 ${fushime > 0 ? 'bg-orange-600 text-white' : 'bg-white text-slate-900 ring-1 ring-slate-200'}`}>
          <p className="text-[11px] opacity-90">節目</p>
          <p className="text-[15px] font-black">{fushime > 0 ? `${fushime}つ。見直しどき` : 'なし'}</p>
        </div>
        <div className={`rounded-xl px-2 py-2.5 ${shoken === M.shoken.length ? 'bg-emerald-600 text-white' : 'bg-white text-slate-900 ring-1 ring-slate-200'}`}>
          <p className="text-[11px] opacity-90">証券の確認</p>
          <p className="text-[15px] font-black">{shoken === M.shoken.length ? 'ぜんぶ済み' : `あと${M.shoken.length - shoken}つ`}</p>
        </div>
      </div>
      <p className="text-[11px] leading-relaxed text-slate-500">{M.keisanNote}入れた内容は送られません。</p>
    </div>
  );
}
