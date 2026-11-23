'use client';

import { useEffect, useRef, useState } from 'react';
import { Briefcase, Check, Clock3, ListChecks, Printer } from 'lucide-react';
import { trackEvent } from '@/lib/trackEvent';
import DATA from '@/lib/souzoku/haifu-data.json';

/**
 * 税理士に相続税の申告を頼む前の準備：当てはまるものを選ぶと、面談の日に持っていく物と、あとで取る証明書が一覧になる
 * （/guide/souzoku/irai-junbi、2026-11-24）。
 * 書類の名前と要る場合：国税庁 No.4202「相続税の申告のために必要な準備」・「相続税の申告の際に提出していただく主な書類」（R8.7）ほか。
 * 使われたかは lp_event_logs の event_name 'irai_junbi'（1回目だけ）。選んだ内容は送らない。
 */
const D = DATA.iraiJunbi;

type Item = { h: string; d: string };
type Ato = { h: string; saki: string };

export default function IraiJunbiCheck({ lpId }: { lpId: string }) {
  const [on, setOn] = useState<Record<string, boolean>>({});
  const sent = useRef(false);
  const flip = (k: string) => setOn((s) => ({ ...s, [k]: !s[k] }));
  const used = Object.values(on).some(Boolean);

  useEffect(() => {
    if (!used || sent.current) return;
    sent.current = true;
    void trackEvent({ lp_id: lpId, event_name: 'irai_junbi', component_id: 'irai-junbi' });
  }, [used, lpId]);

  const motsu: Item[] = D.kyotsu.map((k) => ({ h: k.h, d: k.d }));
  const ato: Ato[] = [];
  for (const j of D.jokyo) {
    if (!on[j.key]) continue;
    for (const it of j.motsu) if (!motsu.some((x) => x.h === it.h)) motsu.push(it);
    for (const a of j.ato) if (!ato.some((x) => x.h === a.h && x.saki === a.saki)) ato.push(a);
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl border-2 border-sky-200 bg-sky-50/60 p-4">
      <p className="flex items-center gap-2 text-[17px] font-black text-slate-900">
        <ListChecks size={22} className="text-sky-700" aria-hidden="true" />面談の持ち物を一覧に<span className="text-[12px] font-bold text-sky-700">無料</span>
      </p>
      <div className="flex flex-col gap-1.5">
        <p className="text-[13px] font-black text-slate-700">当てはまるものを選ぶ</p>
        {D.jokyo.map((j) => {
          const sel = !!on[j.key];
          return (
            <button key={j.key} type="button" aria-pressed={sel} onClick={() => flip(j.key)}
              className={`flex w-full items-center gap-2.5 rounded-xl bg-white p-3 text-left ring-1 ${sel ? 'ring-emerald-300' : 'ring-slate-200'}`}>
              <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md ring-1 ${sel ? 'bg-emerald-600 text-white ring-emerald-600' : 'bg-white text-transparent ring-slate-300'}`}>
                <Check size={16} aria-hidden="true" />
              </span>
              <span className="text-[14px] font-bold text-slate-900">{j.h}</span>
            </button>
          );
        })}
      </div>
      {/* 「この一覧を印刷する」で、この箱だけを印刷する */}
      <style>{'@media print{body *{visibility:hidden}#irai-junbi-list,#irai-junbi-list *{visibility:visible}#irai-junbi-list{position:absolute;left:0;top:0;width:100%}}'}</style>
      <div id="irai-junbi-list" className="flex flex-col gap-2 rounded-xl bg-white p-3 ring-1 ring-slate-200" aria-live="polite">
        <p className="flex items-center gap-1.5 text-[15px] font-black text-orange-700">
          <Briefcase size={18} aria-hidden="true" />面談の日に持っていく物 {motsu.length}点
        </p>
        <ol className="flex flex-col gap-1.5">
          {motsu.map((it, i) => (
            <li key={it.h} className="flex gap-2 text-[13px]">
              <span className="w-5 shrink-0 text-right font-black text-slate-400">{i + 1}</span>
              <span className="flex flex-col"><span className="font-bold text-slate-900">{it.h}</span>{it.d && <span className="text-[11px] text-slate-500">{it.d}</span>}</span>
            </li>
          ))}
        </ol>
        {ato.length > 0 && (
          <>
            <p className="mt-2 flex items-center gap-1.5 text-[14px] font-black text-sky-800">
              <Clock3 size={17} aria-hidden="true" />面談のあとに取る証明書 {ato.length}点
            </p>
            <ul className="flex flex-col gap-1.5">
              {ato.map((a) => (
                <li key={a.h} className="flex flex-col text-[13px]">
                  <span className="font-bold text-slate-900">{a.h}</span>
                  <span className="text-[11px] text-slate-500">請求先：{a.saki}</span>
                </li>
              ))}
            </ul>
          </>
        )}
        <button type="button" onClick={() => window.print()}
          className="mt-2 flex items-center justify-center gap-1.5 self-start print:hidden rounded-lg px-3 py-2 text-[13px] font-bold text-sky-800 ring-1 ring-sky-200 hover:bg-sky-50">
          <Printer size={16} aria-hidden="true" />この一覧を印刷する
        </button>
      </div>
      <p className="text-[11px] leading-relaxed text-slate-500">選んだ内容は送られません。</p>
    </div>
  );
}
