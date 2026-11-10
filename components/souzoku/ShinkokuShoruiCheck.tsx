'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, FileCheck2, ListChecks } from 'lucide-react';
import { trackEvent } from '@/lib/trackEvent';
import DATA from '@/lib/souzoku/haifu-data.json';

/**
 * 相続税の申告の必要書類を、状況を選ぶと一覧にする（/guide/souzoku/shinkoku-shorui-checklist、2026-11-11）。
 * 書類の名前と要る場合：国税庁「相続税の申告の際に提出していただく主な書類」（R8.7）。
 * 使われたかは lp_event_logs の event_name 'shinkoku_shorui'（1回目だけ）。選んだ内容は送らない。
 */
const D = DATA.shorui;

type Item = { h: string; d: string };

export default function ShinkokuShoruiCheck({ lpId }: { lpId: string }) {
  const [on, setOn] = useState<Record<string, boolean>>({});
  const sent = useRef(false);
  const flip = (k: string) => setOn((s) => ({ ...s, [k]: !s[k] }));
  const used = Object.values(on).some(Boolean);

  useEffect(() => {
    if (!used || sent.current) return;
    sent.current = true;
    void trackEvent({ lp_id: lpId, event_name: 'shinkoku_shorui', component_id: 'shinkoku-shorui' });
  }, [used, lpId]);

  // 子の項目は、親（小規模宅地等の特例）を選んだときだけ出す
  const visible = D.jokyo.filter((j) => !('sub' in j && j.sub) || on.shokibo);
  const list: Item[] = D.kyotsu.filter((k) => k.key !== 'yoshi' || on.yoshi).map((k) => ({ h: k.h, d: k.d }));
  for (const j of visible) {
    if (!on[j.key]) continue;
    for (const it of j.items) if (!list.some((x) => x.h === it.h)) list.push(it);
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl border-2 border-sky-200 bg-sky-50/60 p-4">
      <p className="flex items-center gap-2 text-[17px] font-black text-slate-900">
        <ListChecks size={22} className="text-sky-700" aria-hidden="true" />要る書類を一覧に<span className="text-[12px] font-bold text-sky-700">無料</span>
      </p>
      <div className="flex flex-col gap-1.5">
        <p className="text-[13px] font-black text-slate-700">当てはまるものを選ぶ</p>
        {[{ key: 'yoshi', h: '亡くなった人に養子がいる' }, ...visible].map((j) => {
          const sel = !!on[j.key];
          const sub = 'sub' in j && j.sub;
          return (
            <button key={j.key} type="button" aria-pressed={sel} onClick={() => flip(j.key)}
              className={`flex w-full items-center gap-2.5 rounded-xl bg-white p-3 text-left ring-1 ${sel ? 'ring-emerald-300' : 'ring-slate-200'} ${sub ? 'ml-4 w-[calc(100%-1rem)]' : ''}`}>
              <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md ring-1 ${sel ? 'bg-emerald-600 text-white ring-emerald-600' : 'bg-white text-transparent ring-slate-300'}`}>
                <Check size={16} aria-hidden="true" />
              </span>
              <span className="text-[14px] font-bold text-slate-900">{j.h.replace('└ ', '')}</span>
            </button>
          );
        })}
      </div>
      <div className="flex flex-col gap-2 rounded-xl bg-white p-3 ring-1 ring-slate-200" aria-live="polite">
        <p className="flex items-center gap-1.5 text-[15px] font-black text-orange-700">
          <FileCheck2 size={18} aria-hidden="true" />出す書類 {list.length}点
        </p>
        <ol className="flex flex-col gap-1.5">
          {list.map((it, i) => (
            <li key={it.h} className="flex gap-2 text-[13px]">
              <span className="w-5 shrink-0 text-right font-black text-slate-400">{i + 1}</span>
              <span className="flex flex-col"><span className="font-bold text-slate-900">{it.h}</span>{it.d && <span className="text-[11px] text-slate-500">{it.d}</span>}</span>
            </li>
          ))}
        </ol>
      </div>
      <p className="text-[11px] leading-relaxed text-slate-500">選んだ内容は送られません。</p>
    </div>
  );
}
