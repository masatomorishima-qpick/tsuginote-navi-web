'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Calculator, CircleCheck, CircleX } from 'lucide-react';
import { trackEvent } from '@/lib/trackEvent';
import { calcSouzokuzei } from '@/components/souzoku/SouzokuzeiCalc';
import DATA from '@/lib/souzoku/haifu-data.json';

/**
 * 相続税の2割加算の計算（/guide/souzoku/niwari-kasan、2026-11-17）。
 * 判定：国税庁 No.4157（配偶者と一親等の血族〈代襲相続人の孫を含む〉以外は加算。養子は対象外、代襲相続人でない孫養子は加算）。
 * 税額：国税庁 No.4152 の手順。相続税の総額（SouzokuzeiCalc の calcSouzokuzei と同じ計算）×（その人が受け取る額÷正味の遺産額）
 *   ＝その人の相続税額 → ×0.2 が加算額。税額控除はこのあとに引く。
 * 答え合わせ：1億円・配偶者と兄・兄が4,000万円 → 総額837万5,000円、兄335万円、加算67万円、合計402万円。
 * 使われたかは lp_event_logs の event_name 'niwari_kasan'（結果が出た1回目だけ）。入れた数字は送らない。
 */
const N = DATA.niwari;
const yen = (n: number) => `${Math.floor(n).toLocaleString('ja-JP')}円`;
const toYen = (s: string) => {
  const n = Number(s.replace(/[,，\s]/g, ''));
  return Number.isFinite(n) && n > 0 ? Math.round(n * 10000) : 0;
};

type Kosei = 'ko' | 'oya' | 'kyodai' | 'nashi';

export function calcNiwari(isan: number, spouse: boolean, kosei: Kosei, ninzu: number, shutoku: number, kasan: boolean) {
  const r = calcSouzokuzei(isan, spouse, kosei === 'ko' ? ninzu : 0, kosei === 'oya' ? ninzu : 0, kosei === 'kyodai' ? ninzu : 0);
  if (!r || isan <= 0 || shutoku <= 0) return null;
  const sogaku = r.sogaku;
  const zei = Math.floor((sogaku * Math.min(shutoku, isan)) / isan);
  const k = kasan ? Math.floor(zei * 0.2) : 0;
  return { sogaku, kiso: r.kiso, zei, kasan: k, goukei: zei + k };
}

const INPUT = 'w-full rounded-xl bg-white px-3 py-2.5 text-[16px] font-bold text-slate-900 ring-1 ring-slate-300 outline-none focus:ring-2 focus:ring-sky-600';

export default function NiwariKasanCalc({ lpId }: { lpId: string }) {
  const [who, setWho] = useState(7);
  const [isanMan, setIsanMan] = useState('');
  const [spouse, setSpouse] = useState(true);
  const [kosei, setKosei] = useState<Kosei>('kyodai');
  const [ninzu, setNinzu] = useState(1);
  const [shutokuMan, setShutokuMan] = useState('');
  const sent = useRef(false);

  const h = N.hantei[who];
  const isan = toYen(isanMan);
  const shutoku = toYen(shutokuMan);
  const res = useMemo(() => calcNiwari(isan, spouse, kosei, ninzu, shutoku, h.kasan), [isan, spouse, kosei, ninzu, shutoku, h.kasan]);
  const over = isan > 0 && shutoku > isan;

  useEffect(() => {
    if (!res || sent.current) return;
    sent.current = true;
    void trackEvent({ lp_id: lpId, event_name: 'niwari_kasan', component_id: 'niwari-kasan' });
  }, [res, lpId]);

  return (
    <div className="flex flex-col gap-4 rounded-2xl border-2 border-sky-200 bg-sky-50/60 p-4">
      <p className="flex items-center gap-2 text-[17px] font-black text-slate-900">
        <Calculator size={22} className="text-sky-700" aria-hidden="true" />2割加算の判定と計算<span className="text-[12px] font-bold text-sky-700">無料</span>
      </p>

      <div className="flex flex-col gap-2">
        <label className="flex flex-col gap-1 text-[13px] font-black text-slate-700">① 受け取る人は、亡くなった人の…
          <select value={who} onChange={(e) => setWho(Number(e.target.value))} className={INPUT}>
            {N.hantei.map((x, i) => <option key={x.h} value={i}>{x.h}</option>)}
          </select>
        </label>
        <p className={`flex items-start gap-2 rounded-xl px-3 py-2.5 text-[14px] font-bold ${h.kasan ? 'bg-orange-50 text-orange-900 ring-1 ring-orange-200' : 'bg-emerald-50 text-emerald-900 ring-1 ring-emerald-200'}`} aria-live="polite">
          {h.kasan ? <CircleCheck size={20} className="mt-0.5 shrink-0 text-orange-600" aria-hidden="true" /> : <CircleX size={20} className="mt-0.5 shrink-0 text-emerald-600" aria-hidden="true" />}
          <span><span className="block text-[16px] font-black">{h.kasan ? '2割加算の対象' : '2割加算の対象ではない'}</span><span className="text-[12px] font-bold">{h.d}</span></span>
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-[13px] font-black text-slate-700">② 相続税の総額を出す（法定相続人で決まる）</p>
        <label className="flex flex-col gap-1 text-[11px] font-bold text-slate-600">正味の遺産額（万円）
          <input inputMode="numeric" value={isanMan} placeholder="10000" onChange={(e) => setIsanMan(e.target.value)} className={INPUT} />
        </label>
        <div className="grid grid-cols-[1fr_1.4fr_0.9fr] gap-2">
          <label className="flex flex-col gap-1 text-[11px] font-bold text-slate-600">配偶者
            <select value={spouse ? '1' : '0'} onChange={(e) => setSpouse(e.target.value === '1')} className={INPUT}>
              <option value="1">いる</option><option value="0">いない</option>
            </select>
          </label>
          <label className="flex flex-col gap-1 text-[11px] font-bold text-slate-600">ほかの相続人
            <select value={kosei} onChange={(e) => setKosei(e.target.value as Kosei)} className={INPUT}>
              <option value="ko">子</option><option value="oya">親</option><option value="kyodai">兄弟姉妹</option><option value="nashi">いない</option>
            </select>
          </label>
          <label className="flex flex-col gap-1 text-[11px] font-bold text-slate-600">人数
            <select value={ninzu} onChange={(e) => setNinzu(Number(e.target.value))} className={INPUT} disabled={kosei === 'nashi'}>
              {Array.from({ length: 8 }, (_, n) => n + 1).map((n) => <option key={n} value={n}>{n}人</option>)}
            </select>
          </label>
        </div>
        <p className="text-[11px] text-slate-500">子には養子と、代わりに相続人になった孫も数えます（養子は実子がいれば1人、いなければ2人まで）。相続を放棄した人も数えます。</p>
      </div>

      <label className="flex flex-col gap-1 text-[13px] font-black text-slate-700">③ その人が受け取る額（万円）
        <input inputMode="numeric" value={shutokuMan} placeholder="4000" onChange={(e) => setShutokuMan(e.target.value)} className={INPUT} />
      </label>
      {over && <p className="text-[12px] font-bold text-orange-700">受け取る額が正味の遺産額より多くなっています。遺産額と同じとして計算します。</p>}

      {res && (
        <div className="flex flex-col gap-1.5" aria-live="polite">
          <p className="grid grid-cols-2 gap-1.5 text-center text-[12px]">
            <span className="rounded-lg bg-white py-2 text-slate-700 ring-1 ring-slate-200">相続税の総額<b className="block text-[15px] text-slate-900">{yen(res.sogaku)}</b></span>
            <span className="rounded-lg bg-white py-2 text-slate-700 ring-1 ring-slate-200">その人の相続税額<b className="block text-[15px] text-slate-900">{yen(res.zei)}</b></span>
          </p>
          <p className="rounded-xl bg-orange-600 px-3 py-3 text-center text-white">
            <span className="block text-[12px] opacity-90">2割加算 {yen(res.kasan)} を足すと</span>
            <span className="text-[22px] font-black">{yen(res.goukei)}</span>
            <span className="block text-[11px] opacity-90">配偶者の税額の軽減・未成年者控除などは、このあとに引きます</span>
          </p>
          {res.sogaku === 0 && <p className="text-[12px] font-bold text-emerald-800">正味の遺産額が基礎控除（{yen(res.kiso)}）以下なので、相続税はかかりません。</p>}
        </div>
      )}
      <p className="text-[11px] leading-relaxed text-slate-500">{N.keisanNote}入れた数字は送られません。</p>
    </div>
  );
}
