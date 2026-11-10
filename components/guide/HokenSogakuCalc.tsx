'use client';

import { useEffect, useRef, useState } from 'react';
import { Calculator } from 'lucide-react';
import { trackEvent } from '@/lib/trackEvent';

/**
 * 保険の払う総額の比べ（/guide/shisan-kanri/hoken-hikaku-excel、2026-11-10）。
 * 払う総額＝月の保険料×12×払い込む年数。いまの保険と見直し案の差を出す。
 * 使われたかは lp_event_logs の event_name 'hoken_sogaku'（1回目だけ）。入れた数字は送らない。
 */
const yen = (n: number) => `${Math.round(n).toLocaleString('ja-JP')}円`;
const num = (s: string) => Number(s.normalize('NFKC').replace(/[^\d]/g, ''));

function Col({ title, getsu, nen, setGetsu, setNen }: { title: string; getsu: string; nen: string; setGetsu: (v: string) => void; setNen: (v: string) => void }) {
  return (
    <div className="flex flex-col gap-2 rounded-xl bg-white p-3 ring-1 ring-slate-200">
      <p className="text-[13px] font-black text-slate-800">{title}</p>
      <label className="flex flex-col gap-1 text-[11px] font-bold text-slate-600">月の保険料
        <span className="flex items-center gap-1 rounded-lg bg-slate-50 px-2 ring-1 ring-slate-300">
          <input value={getsu} onChange={(e) => setGetsu(e.target.value)} inputMode="numeric" placeholder="12000" className="w-full bg-transparent py-2 text-right text-[16px] font-black text-slate-900 outline-none placeholder:font-normal placeholder:text-slate-400" />円
        </span>
      </label>
      <label className="flex flex-col gap-1 text-[11px] font-bold text-slate-600">払い込む年数
        <span className="flex items-center gap-1 rounded-lg bg-slate-50 px-2 ring-1 ring-slate-300">
          <input value={nen} onChange={(e) => setNen(e.target.value)} inputMode="numeric" placeholder="30" className="w-full bg-transparent py-2 text-right text-[16px] font-black text-slate-900 outline-none placeholder:font-normal placeholder:text-slate-400" />年
        </span>
      </label>
    </div>
  );
}

export default function HokenSogakuCalc({ lpId }: { lpId: string }) {
  const [g1, setG1] = useState('');
  const [n1, setN1] = useState('');
  const [g2, setG2] = useState('');
  const [n2, setN2] = useState('');
  const sent = useRef(false);
  const t1 = num(g1) * 12 * num(n1);
  const t2 = num(g2) * 12 * num(n2);
  const ready = t1 > 0 && t2 > 0;

  useEffect(() => {
    if (!ready || sent.current) return;
    sent.current = true;
    void trackEvent({ lp_id: lpId, event_name: 'hoken_sogaku', component_id: 'hoken-sogaku' });
  }, [ready, lpId]);

  const diff = t2 - t1;
  return (
    <div className="flex flex-col gap-3 rounded-2xl border-2 border-sky-200 bg-sky-50/60 p-4">
      <p className="flex items-center gap-2 text-[17px] font-black text-slate-900">
        <Calculator size={22} className="text-sky-700" aria-hidden="true" />払う総額をくらべる<span className="text-[12px] font-bold text-sky-700">無料</span>
      </p>
      <div className="grid grid-cols-2 gap-2">
        <Col title="いまの保険" getsu={g1} nen={n1} setGetsu={setG1} setNen={setN1} />
        <Col title="見直し案" getsu={g2} nen={n2} setGetsu={setG2} setNen={setN2} />
      </div>
      {ready && (
        <div className="grid grid-cols-3 gap-1.5 text-center" aria-live="polite">
          <div className="rounded-xl bg-white px-1 py-2 ring-1 ring-slate-200"><p className="text-[11px] text-slate-500">いまの保険</p><p className="text-[14px] font-black text-slate-900">{yen(t1)}</p></div>
          <div className="rounded-xl bg-white px-1 py-2 ring-1 ring-slate-200"><p className="text-[11px] text-slate-500">見直し案</p><p className="text-[14px] font-black text-slate-900">{yen(t2)}</p></div>
          <div className={`rounded-xl px-1 py-2 ${diff <= 0 ? 'bg-emerald-600' : 'bg-orange-600'} text-white`}><p className="text-[11px] opacity-90">{diff <= 0 ? '見直し案が少ない' : '見直し案が多い'}</p><p className="text-[14px] font-black">{yen(Math.abs(diff))}</p></div>
        </div>
      )}
      <p className="text-[11px] leading-relaxed text-slate-500">払う総額＝月の保険料×12×払い込む年数。保障の中身（金額・期間）が同じかも、表で並べて確かめます。入れた数字は送られません。</p>
    </div>
  );
}
