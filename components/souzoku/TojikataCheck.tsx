'use client';

import { useEffect, useRef, useState } from 'react';
import { CalendarClock, Check, Layers } from 'lucide-react';
import { trackEvent } from '@/lib/trackEvent';
import DATA from '@/lib/souzoku/haifu-data.json';
import { kigenDate, shukuKnown, yasumiAke } from '@/components/souzoku/ZeroShinkokuCheck';

/**
 * 相続税の申告書の綴じ方と提出の準備（/guide/souzoku/shinkoku-tojikata、2026-11-19）。
 * 期限：知った日の翌日から10か月（国税庁 No.4205）。応当日の前の日、応当日がない月はその月の末日。土日・祝日・年末年始は翌日（国税通則法10条）。
 * 並べ方：様式一覧（令和8年分用）の表の番号と、国税庁「相続税の申告の際に提出していただく主な書類」（R8.7）の順に合わせた例（国税庁の決まりではない）。
 *   本人確認書類の写しは書面（持参・郵送）のときだけ。窓口で見せるなら要らない。e-Tax は要らない（一覧の本人確認書類の節）。
 * 出し方：郵便・信書便は通信日付印の日が提出日（国税通則法22条）。荷物扱いでは送れない（国税庁「申告書の税務署への送付について」）。
 * 使われたかは lp_event_logs の event_name 'tojikata'（1回目だけ）。入れた日付は送らない。
 */
const T = DATA.tojikata;
const fmt = (d: Date) => `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
type Way = 'jisan' | 'yuso' | 'etax';

export function junbanFor(way: Way, tokurei: boolean) {
  return T.junban.filter((j) => j.when === 'always' || (j.when === 'shomen' && way !== 'etax') || (j.when === 'tokurei' && tokurei));
}

export default function TojikataCheck({ lpId }: { lpId: string }) {
  const [day, setDay] = useState('');
  const [way, setWay] = useState<Way>('jisan');
  const [tokurei, setTokurei] = useState(false);
  const [done, setDone] = useState<Record<string, boolean>>({});
  const sent = useRef(false);
  const touched = useRef(false);

  useEffect(() => {
    if (!touched.current || sent.current) return;
    sent.current = true;
    void trackEvent({ lp_id: lpId, event_name: 'tojikata', component_id: 'tojikata-check' });
  });

  const base = day ? new Date(`${day}T00:00:00`) : null;
  const valid = !!base && !Number.isNaN(base.getTime());
  const kigen = valid ? kigenDate(base!, T.kigenN) : null;
  const ake = kigen ? yasumiAke(kigen) : null;
  const list = junbanFor(way, tokurei);
  const d = T.dashikata.find((x) => x.key === way)!;
  const touch = () => { touched.current = true; };

  return (
    <div className="flex flex-col gap-4 rounded-2xl border-2 border-sky-200 bg-sky-50/60 p-4">
      <p className="flex items-center gap-2 text-[17px] font-black text-slate-900">
        <Layers size={22} className="text-sky-700" aria-hidden="true" />綴じる順番と出し方<span className="text-[12px] font-bold text-sky-700">無料</span>
      </p>

      <div className="flex flex-col gap-1.5">
        <p className="text-[13px] font-black text-slate-700">出し方を選ぶ</p>
        <div className="grid grid-cols-3 gap-1.5">
          {T.dashikata.map((x) => (
            <button key={x.key} type="button" aria-pressed={way === x.key} onClick={() => { touch(); setWay(x.key as Way); }}
              className={`rounded-xl px-2 py-2.5 text-[13px] font-bold ring-1 ${way === x.key ? 'bg-sky-700 text-white ring-sky-700' : 'bg-white text-slate-800 ring-slate-300'}`}>
              {x.h.replace('税務署に', '').replace('で送る', '')}
            </button>
          ))}
        </div>
        <button type="button" aria-pressed={tokurei} onClick={() => { touch(); setTokurei(!tokurei); }}
          className={`flex w-full items-center gap-2.5 rounded-xl bg-white p-3 text-left ring-1 ${tokurei ? 'ring-emerald-300' : 'ring-slate-200'}`}>
          <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md ring-1 ${tokurei ? 'bg-emerald-600 text-white ring-emerald-600' : 'bg-white text-transparent ring-slate-300'}`}><Check size={16} aria-hidden="true" /></span>
          <span className="text-[14px] font-bold text-slate-900">配偶者の税額軽減か、小規模宅地等の特例を使う</span>
        </button>
      </div>

      <div className="flex flex-col gap-1.5" aria-live="polite">
        <p className="text-[13px] font-black text-slate-700">上から順に重ねる（{list.filter((j) => done[j.key]).length}/{list.length}）</p>
        <ol className="grid gap-1.5">
          {list.map((j, i) => {
            const sel = !!done[j.key];
            return (
              <li key={j.key}>
                <button type="button" aria-pressed={sel} onClick={() => { touch(); setDone((s) => ({ ...s, [j.key]: !s[j.key] })); }}
                  className={`flex w-full items-start gap-2.5 rounded-xl bg-white p-3 text-left ring-1 ${sel ? 'ring-emerald-300' : 'ring-slate-200'}`}>
                  <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[12px] font-black ${sel ? 'bg-emerald-600 text-white' : 'bg-sky-700 text-white'}`}>{sel ? <Check size={14} aria-hidden="true" /> : i + 1}</span>
                  <span className="flex min-w-0 flex-col"><span className="text-[14px] font-bold text-slate-900">{j.h}</span><span className="text-[12px] text-slate-500">{j.d}</span></span>
                </button>
              </li>
            );
          })}
        </ol>
        <p className="rounded-xl bg-white p-3 text-[12px] text-slate-700 ring-1 ring-slate-200"><b className="text-slate-900">{d.h}：</b>{d.d}</p>
      </div>

      <label className="flex flex-col gap-1 text-[11px] font-bold text-slate-600">亡くなったことを知った日（ふつうは亡くなった日）
        <input type="date" value={day} onChange={(e) => { touch(); setDay(e.target.value); }}
          className="w-full min-w-0 rounded-xl bg-white px-3 py-2.5 text-[16px] font-bold text-slate-900 ring-1 ring-slate-300 outline-none focus:ring-2 focus:ring-sky-600" />
      </label>
      {kigen && ake && (
        <p className="flex items-start gap-2 rounded-xl bg-orange-50 p-3 text-[14px] font-bold text-orange-900 ring-1 ring-orange-200">
          <CalendarClock size={20} className="mt-0.5 shrink-0" aria-hidden="true" />
          <span>提出の期限：{fmt(ake)}
            {ake.getTime() !== kigen.getTime() && <span className="block text-[11px] font-bold text-orange-700">10か月目の{fmt(kigen)}が土日・祝日・年末年始のため、次の日</span>}
            {way === 'yuso' && <span className="block text-[11px] font-bold text-orange-700">郵便なら、この日までの通信日付印があれば間に合う</span>}
            {!shukuKnown(kigen) && <span className="block text-[11px] font-normal text-orange-700">この年の祝日は入っていません。祝日に当たるときは次の日です</span>}
          </span>
        </p>
      )}
      <p className="text-[11px] leading-relaxed text-slate-500">並べ方は確かめやすい例で、国税庁の決まりではありません。入れた日付は送られません。</p>
    </div>
  );
}
