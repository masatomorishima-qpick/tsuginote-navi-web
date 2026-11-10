'use client';

import { useEffect, useRef, useState } from 'react';
import { Scale } from 'lucide-react';
import { trackEvent } from '@/lib/trackEvent';

/**
 * 保険証券の3人（契約者・被保険者・受取人）から、死亡保険金にかかる税の種類を出す（/guide/shisan-kanri/hoken-shoken-mikata、2026-11-11）。
 * 元：生命保険文化センター「保険金などを受け取ったときの税金は？」、国税庁 No.1750（保険料を負担した人で区分）。
 *   契約者＝被保険者 → 相続税／契約者＝受取人 → 所得税（住民税も）／3人とも違う → 贈与税。
 * 使われたかは lp_event_logs の event_name 'hoken_zei'（1回目だけ）。選んだ内容は送らない。
 */
const HITO = ['夫', '妻', '子', '親'];

export function zeiOf(keiyaku: string, hihoken: string, uketori: string) {
  if (uketori === hihoken) return { zei: '－', d: '死亡保険金の受取人は、被保険者と別の人を選んでください' };
  if (keiyaku === hihoken) return { zei: '相続税', d: '契約者と被保険者が同じ。相続人が受け取るなら「500万円×法定相続人の数」まで非課税' };
  if (keiyaku === uketori) return { zei: '所得税', d: '契約者と受取人が同じ（住民税も）。一時金なら一時所得' };
  return { zei: '贈与税', d: '契約者・被保険者・受取人が3人とも違う' };
}

export default function HokenZeiCheck({ lpId }: { lpId: string }) {
  const [v, setV] = useState({ keiyaku: '夫', hihoken: '夫', uketori: '妻' });
  const touched = useRef(false);
  const sent = useRef(false);
  const [used, setUsed] = useState(false);
  const r = zeiOf(v.keiyaku, v.hihoken, v.uketori);

  useEffect(() => {
    if (!used || sent.current) return;
    sent.current = true;
    void trackEvent({ lp_id: lpId, event_name: 'hoken_zei', component_id: 'hoken-zei' });
  }, [used, lpId]);

  const pick = (k: keyof typeof v, label: string, sub: string) => (
    <label className="flex flex-col gap-1 text-[12px] font-bold text-slate-700">{label}<span className="text-[10px] font-normal text-slate-500">{sub}</span>
      <select value={v[k]} onChange={(e) => { setV((s) => ({ ...s, [k]: e.target.value })); if (!touched.current) { touched.current = true; setUsed(true); } }}
        className="rounded-xl bg-white px-3 py-2.5 text-[16px] font-bold text-slate-900 ring-1 ring-slate-300 outline-none focus:ring-2 focus:ring-sky-600">
        {HITO.map((h) => <option key={h} value={h}>{h}</option>)}
      </select>
    </label>
  );

  return (
    <div className="flex flex-col gap-3 rounded-2xl border-2 border-sky-200 bg-sky-50/60 p-4">
      <p className="flex items-center gap-2 text-[17px] font-black text-slate-900">
        <Scale size={22} className="text-sky-700" aria-hidden="true" />証券の3人で、税の種類を見る<span className="text-[12px] font-bold text-sky-700">無料</span>
      </p>
      <div className="grid grid-cols-3 gap-2">
        {pick('keiyaku', '契約者', '保険料を払う人')}
        {pick('hihoken', '被保険者', '亡くなった人')}
        {pick('uketori', '受取人', '受け取る人')}
      </div>
      <div className="rounded-xl bg-orange-600 px-3 py-3 text-center text-white" aria-live="polite">
        <p className="text-[12px] opacity-90">死亡保険金にかかる税</p>
        <p className="text-[22px] font-black">{r.zei}</p>
        <p className="text-[12px]">{r.d}</p>
      </div>
      <p className="text-[11px] leading-relaxed text-slate-500">国税庁は「保険料を負担した人」で分けます。契約者と保険料を払った人が違うときは、払った人を契約者の欄に選びます。選んだ内容は送られません。</p>
    </div>
  );
}
