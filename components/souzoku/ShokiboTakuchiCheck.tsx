'use client';

import { useEffect, useRef, useState } from 'react';
import { Calculator, Check, ListChecks } from 'lucide-react';
import { trackEvent } from '@/lib/trackEvent';
import DATA from '@/lib/souzoku/haifu-data.json';

/**
 * 小規模宅地等の特例：状況を選ぶと要る書類が一覧になり、面積と評価額で減る額が出る（/guide/souzoku/shokibo-takuchi-shorui、2026-11-14）。
 * 書類：国税庁「相続税の申告の際に提出していただく主な書類」（R8.7）の (5)。限度面積と割合：国税庁 No.4124（令和8年4月1日現在法令等）。
 * 減る額 ＝ 評価額 × min(面積, 限度面積) ÷ 面積 × 割合（1つの区分だけ使うとき）。
 * 使われたかは lp_event_logs の event_name 'shokibo_takuchi'（1回目だけ）。選んだ内容・数字は送らない。
 */
const D = DATA.shokibo;
const yen = (n: number) => `${Math.round(n).toLocaleString('ja-JP')}円`;
const num = (s: string) => {
  const n = Number(s.replace(/[,，\s]/g, ''));
  return Number.isFinite(n) && n > 0 ? n : 0;
};

export function gengaku(kagaku: number, menseki: number, gendo: number, wari: number) {
  if (kagaku <= 0 || menseki <= 0) return 0;
  return Math.floor((kagaku * Math.min(menseki, gendo) * wari) / (menseki * 100));
}

const INPUT = 'w-full min-w-0 rounded-xl bg-white px-3 py-2.5 text-[16px] font-bold text-slate-900 ring-1 ring-slate-300 outline-none focus:ring-2 focus:ring-sky-600';

export default function ShokiboTakuchiCheck({ lpId }: { lpId: string }) {
  const [on, setOn] = useState<string>('');
  const [rojin, setRojin] = useState(false);
  const [menseki, setMenseki] = useState('');
  const [man, setMan] = useState('');
  const sent = useRef(false);
  const j = D.jokyo.find((x) => x.key === on);
  const k = D.kubun.find((x) => x.key === (j?.kubun ?? 'kyoju'))!;
  const rj = D.jokyo.find((x) => 'addon' in x && x.addon)!;
  const withRojin = !!j && j.kubun === 'kyoju' && rojin;
  const m = num(menseki);
  const kagaku = num(man) * 10000;
  const g = gengaku(kagaku, m, k.menseki, k.wari);
  const used = !!on || rojin || g > 0;

  useEffect(() => {
    if (!used || sent.current) return;
    sent.current = true;
    void trackEvent({ lp_id: lpId, event_name: 'shokibo_takuchi', component_id: 'shokibo-takuchi' });
  }, [used, lpId]);

  return (
    <div className="flex flex-col gap-4 rounded-2xl border-2 border-sky-200 bg-sky-50/60 p-4">
      <p className="flex items-center gap-2 text-[17px] font-black text-slate-900">
        <ListChecks size={22} className="text-sky-700" aria-hidden="true" />要る書類と減る額<span className="text-[12px] font-bold text-sky-700">無料</span>
      </p>
      <div className="flex flex-col gap-1.5" role="radiogroup" aria-label="当てはまる形">
        <p className="text-[13px] font-black text-slate-700">① 当てはまる形を1つ選ぶ</p>
        {D.jokyo.filter((x) => !('addon' in x && x.addon)).map((x) => {
          const sel = on === x.key;
          return (
            <button key={x.key} type="button" role="radio" aria-checked={sel} onClick={() => setOn(sel ? '' : x.key)}
              className={`flex w-full items-center gap-2.5 rounded-xl bg-white p-3 text-left ring-1 ${sel ? 'ring-2 ring-emerald-500' : 'ring-slate-200'}`}>
              <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ring-1 ${sel ? 'bg-emerald-600 ring-emerald-600' : 'bg-white ring-slate-300'}`}>
                {sel && <span className="h-2 w-2 rounded-full bg-white" />}
              </span>
              <span className="text-[14px] font-bold text-slate-800">{x.h}</span>
            </button>
          );
        })}
        {j && j.kubun === 'kyoju' && (
          <label className="mt-1 flex items-center gap-2.5 rounded-xl bg-white p-3 text-[14px] font-bold text-slate-800 ring-1 ring-slate-200">
            <input type="checkbox" checked={rojin} onChange={(e) => setRojin(e.target.checked)} className="h-5 w-5" />
            亡くなった人が老人ホームなどに入っていた
          </label>
        )}
      </div>
      {j && (
        <div className="flex flex-col gap-2" aria-live="polite">
          <p className="rounded-xl bg-white p-3 text-[13px] leading-relaxed text-slate-700 ring-1 ring-slate-200">
            <b className="text-slate-900">条件：</b>{j.yoken}
            {withRojin && <><br /><b className="text-slate-900">老人ホーム：</b>{rj.yoken}</>}
          </p>
          <p className="text-[13px] font-black text-slate-700">申告書に付ける書類</p>
          <ul className="flex flex-col gap-1.5">
            {[...D.kyotsu, ...j.items, ...(withRojin ? rj.items : [])].map((it) => {
              const baai = 'baai' in it && it.baai;
              return (
                <li key={it.h} className="flex items-start gap-2 rounded-xl bg-white p-2.5 ring-1 ring-slate-200">
                  {baai
                    ? <span className="mt-0.5 shrink-0 rounded bg-amber-100 px-1 text-[10px] font-bold text-amber-800">場合<br />による</span>
                    : <Check size={18} className="mt-0.5 shrink-0 text-emerald-600" aria-hidden="true" />}
                  <span className="flex flex-col"><span className="text-[14px] font-bold text-slate-900">{it.h}</span>{it.d && <span className="text-[12px] text-slate-600">{it.d}</span>}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
      <div className="flex flex-col gap-2">
        <p className="flex items-center gap-1.5 text-[13px] font-black text-slate-700"><Calculator size={16} className="text-sky-700" aria-hidden="true" />② 減る額（{k.h.replace(/（.*）/, '')}：{k.menseki}㎡まで{k.wari}%）</p>
        <div className="grid grid-cols-2 gap-2">
          <label className="flex min-w-0 flex-col gap-1 text-[11px] font-bold text-slate-600">土地の面積（㎡）
            <input inputMode="decimal" value={menseki} placeholder="400" onChange={(e) => setMenseki(e.target.value)} className={INPUT} />
          </label>
          <label className="flex min-w-0 flex-col gap-1 text-[11px] font-bold text-slate-600">土地の評価額（万円）
            <input inputMode="decimal" value={man} placeholder="8000" onChange={(e) => setMan(e.target.value)} className={INPUT} />
          </label>
        </div>
        {g > 0 && (
          <div className="flex flex-col gap-1.5" aria-live="polite">
            <p className="rounded-xl bg-orange-600 px-3 py-3 text-center text-white">
              <span className="block text-[12px] opacity-90">特例で減る額</span>
              <span className="text-[22px] font-black">{yen(g)}</span>
            </p>
            <p className="text-center text-[13px] text-slate-700">特例を使った後の評価額 <b>{yen(kagaku - g)}</b></p>
          </div>
        )}
      </div>
      <p className="text-[11px] leading-relaxed text-slate-500">評価額は、路線価などで出した特例の前の土地の評価額です。1つの区分だけを使うときの計算で、自宅・事業用・貸している土地を組み合わせるときは面積の調整が要ります。1円未満は切り捨てて表示します。入れた内容は送られません。</p>
    </div>
  );
}
