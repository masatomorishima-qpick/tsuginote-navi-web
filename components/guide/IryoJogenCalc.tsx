'use client';

import { useEffect, useRef, useState } from 'react';
import { Calculator } from 'lucide-react';
import { trackEvent } from '@/lib/trackEvent';
import DATA from '@/lib/hoken/haifu-data.json';

/**
 * 医療費の上限（高額療養費）と入院給付金の比べ（/guide/shisan-kanri/hoken-minaoshi-50dai、2026-11-22）。
 * 区分と1か月の医療費（10割）から、69歳以下の人の1か月の自己負担の上限を出し、入院給付金（日額×日数）と並べる。
 * 上限の式：協会けんぽ「高額な医療費を支払ったとき」（令和8年8月診療分から）。
 *   ア〜ウ：金額＋（医療費−境目の額）×1%。エ・オ：定額。窓口の負担（3割）が上限より少なければ3割の額。
 * 入院給付金は「日額 ×（入院日数と1回の入院の支払限度日数の少ない方）」。
 * 使われたかは lp_event_logs の event_name 'iryo_jogen'（1回目だけ）。入れた数字は送らない。
 */
const P = DATA.iryo50;
type Kubun = (typeof P.kubun)[number];

/** 1か月の自己負担の上限（円）。thr が 0 の区分は定額。 */
export function jogen(k: { base: number; thr: number }, iryohi: number) {
  if (k.thr === 0) return k.base;
  return k.base + Math.round(Math.max(0, iryohi - k.thr) * 0.01);
}

/** 窓口で払う額の目安（3割と上限の少ない方）。 */
export function jikofutan(k: { base: number; thr: number }, iryohi: number) {
  return Math.min(Math.round(iryohi * 0.3), jogen(k, iryohi));
}

const yen = (n: number) => `${n.toLocaleString('ja-JP')}円`;
const num = (s: string) => {
  const n = Number(s.replace(/[,，\s]/g, ''));
  return Number.isFinite(n) && n >= 0 ? n : 0;
};

export default function IryoJogenCalc({ lpId }: { lpId: string }) {
  const [kubun, setKubun] = useState<string>('u');
  const [iryo, setIryo] = useState('1000000');
  const [nissu, setNissu] = useState(String(Math.round(P.zaiin.days)));
  const [nichigaku, setNichigaku] = useState('5000');
  const [gendo, setGendo] = useState('60');
  const sent = useRef(false);
  const touched = useRef(false);

  useEffect(() => {
    if (!touched.current || sent.current) return;
    sent.current = true;
    void trackEvent({ lp_id: lpId, event_name: 'iryo_jogen', component_id: 'iryo-jogen' });
  });

  const t = <T,>(f: (v: T) => void) => (v: T) => { touched.current = true; f(v); };
  const k = P.kubun.find((x) => x.key === kubun) as Kubun;
  const i = num(iryo);
  const futanNew = jikofutan(k.new, i);
  const futanOld = jikofutan(k.old, i);
  const kyufu = num(nichigaku) * Math.min(num(nissu), num(gendo) || num(nissu));
  const sa = kyufu - futanNew;

  return (
    <div className="flex flex-col gap-4 rounded-2xl border-2 border-sky-200 bg-white p-4">
      <p className="flex items-center gap-2 text-[16px] font-black text-slate-900"><Calculator size={20} className="text-sky-700" aria-hidden="true" />医療費の上限と入院給付金の比べ</p>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="iryo-kubun" className="text-[14px] font-bold text-slate-900">区分（69歳以下）</label>
        <select id="iryo-kubun" value={kubun} onChange={(e) => t(setKubun)(e.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-[16px]">
          {P.kubun.map((x) => <option key={x.key} value={x.key}>{x.h}：{x.who}</option>)}
        </select>
        <p className="text-[11px] text-slate-500">{P.kubunWho}</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <label className="col-span-2 flex flex-col gap-1 text-[14px] font-bold text-slate-900">1か月の医療費（保険が使える分の総額・10割）
          <span className="flex items-center gap-1"><input inputMode="numeric" value={iryo} onChange={(e) => t(setIryo)(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-[16px]" /><span className="text-[14px]">円</span></span>
        </label>
        <label className="flex flex-col gap-1 text-[14px] font-bold text-slate-900">入院の日数
          <span className="flex items-center gap-1"><input inputMode="numeric" value={nissu} onChange={(e) => t(setNissu)(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-[16px]" /><span className="text-[14px]">日</span></span>
        </label>
        <label className="flex flex-col gap-1 text-[14px] font-bold text-slate-900">入院給付金の日額
          <span className="flex items-center gap-1"><input inputMode="numeric" value={nichigaku} onChange={(e) => t(setNichigaku)(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-[16px]" /><span className="text-[14px]">円</span></span>
        </label>
        <label className="col-span-2 flex flex-col gap-1 text-[14px] font-bold text-slate-900">1回の入院で支払われる日数の上限（保険証券）
          <span className="flex items-center gap-1"><input inputMode="numeric" value={gendo} onChange={(e) => t(setGendo)(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-[16px]" /><span className="text-[14px]">日</span></span>
        </label>
      </div>
      <div className="flex flex-col gap-2 rounded-xl bg-orange-50 p-3.5 ring-1 ring-orange-200" aria-live="polite">
        <p className="text-[13px] font-bold text-slate-700">窓口で払う医療費の目安（2026年8月診療分から）</p>
        <p className="text-[26px] font-black leading-none text-orange-700">{yen(futanNew)}</p>
        <p className="text-[12px] text-slate-600">2026年7月までの決まりでは {yen(futanOld)}。多数回（4か月目から）は {yen(Math.min(k.tasu, futanNew))}、1年（8月〜翌年7月）の上限は {yen(k.nen)}</p>
        <div className="mt-1 grid grid-cols-2 gap-2 border-t border-orange-200 pt-2">
          <p className="flex flex-col text-[12px] text-slate-600">入院給付金<span className="text-[18px] font-black text-slate-900">{yen(kyufu)}</span></p>
          <p className="flex flex-col text-[12px] text-slate-600">給付金 − 窓口の医療費<span className={`text-[18px] font-black ${sa >= 0 ? 'text-sky-800' : 'text-orange-700'}`}>{sa >= 0 ? '' : '−'}{yen(Math.abs(sa))}</span></p>
        </div>
        <p className="text-[12px] text-slate-700">食事代・差額ベッド代・先進医療の技術料は、この上限の外で別にかかります。</p>
      </div>
      <p className="text-[11px] text-slate-500">{P.keisanNote}</p>
    </div>
  );
}
