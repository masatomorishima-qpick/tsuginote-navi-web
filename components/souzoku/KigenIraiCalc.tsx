'use client';

import { useEffect, useRef, useState } from 'react';
import { CalendarClock, Plus, Timer, X } from 'lucide-react';
import { trackEvent } from '@/lib/trackEvent';
import { imaNoIchi, iraiList, shinkokuKigen, shukuNashi } from '@/lib/souzoku/kigen';
import DATA from '@/lib/souzoku/haifu-data.json';

/**
 * 相続税の申告期限の計算と、税理士に頼む目安の日（/guide/souzoku/shinkoku-kigen-irai、2026-11-23）。
 * 期限：知った日の翌日から10か月（国税庁 No.4205・相続税の申告のしかた 令和8年分用）。翌日から数えて応当日の前の日、
 *   応当日がない月・月末に知ったときはその月の末日（国税通則法10条1項）。土日・祝日（内閣府の表の2026・2027年）・12/29〜1/3 は翌日へ（同10条2項）。
 *   国税庁の例：1/6→11/6、R8.6.9→R9.4.9、R8.6.10→R9.4.12（4/10 が土曜日）。
 * 頼む目安：4か月目（準確定申告の期限）・7か月目（期限の3か月前）・9か月目（1か月前）。つぎの手ナビの目安で、国税庁の決まりではない（画面に書く）。
 * 相続放棄の3か月は民法の期間で、休みの日の扱いは国税と同じとは限らないため、繰り下げずに目安として出す。
 * 使われたかは lp_event_logs の event_name 'kigen_irai'（1回目だけ）。入れた日付は送らない。
 */
const K = DATA.kigenIrai;
const W = ['日', '月', '火', '水', '木', '金', '土'];
const fmt = (d: Date) => `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日（${W[d.getDay()]}）`;
const parse = (s: string) => {
  if (!s) return null;
  const d = new Date(`${s}T00:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
};
const INPUT = 'w-full rounded-xl bg-white px-3 py-3 text-[17px] font-bold text-slate-900 ring-1 ring-slate-300 outline-none focus:ring-2 focus:ring-sky-600';

export default function KigenIraiCalc({ lpId }: { lpId: string }) {
  const [day, setDay] = useState('');
  const [others, setOthers] = useState<string[]>([]);
  const sent = useRef(false);
  const touched = useRef(false);

  useEffect(() => {
    if (!touched.current || sent.current) return;
    sent.current = true;
    void trackEvent({ lp_id: lpId, event_name: 'kigen_irai', component_id: 'kigen-irai' });
  });

  const base = parse(day);
  const res = base ? shinkokuKigen(base) : null;
  const list = base ? iraiList(base) : [];
  const ima = base ? imaNoIchi(new Date(), base) : null;
  const touch = () => { touched.current = true; };
  const otherKigen = others.map(parse).filter((d): d is Date => !!d).map((d) => shinkokuKigen(d).kigen);
  const nashi = shukuNashi([...list.filter((x) => x.kind !== 'hoka').map((x) => x.d), ...otherKigen]);

  return (
    <div className="flex flex-col gap-4 rounded-2xl border-2 border-sky-200 bg-sky-50/60 p-4">
      <p className="flex items-center gap-2 text-[17px] font-black text-slate-900">
        <CalendarClock size={22} className="text-sky-700" aria-hidden="true" />申告期限と頼む目安の日を出す<span className="text-[12px] font-bold text-sky-700">無料</span>
      </p>
      <label className="flex flex-col gap-1.5">
        <span className="text-[13px] font-black text-slate-700">亡くなったことを知った日（ふつうは亡くなった日）</span>
        <input type="date" value={day} onChange={(e) => { touch(); setDay(e.target.value); }} aria-label="亡くなったことを知った日" className={INPUT} />
      </label>

      {res && (
        <div className="flex flex-col gap-3" aria-live="polite">
          <div className="rounded-xl bg-orange-50 p-3 ring-1 ring-orange-200">
            <p className="text-[12px] font-bold text-orange-800">相続税の申告と納税の期限</p>
            <p className="text-[20px] font-black text-orange-800">{fmt(res.kigen)}</p>
            {res.kigen.getTime() !== res.raw.getTime() && (
              <p className="text-[12px] font-bold text-orange-700">10か月後の{fmt(res.raw)}が休みの日のため、休みの明けた日</p>
            )}
            {ima && (
              <p className="mt-1 flex items-center gap-1.5 text-[13px] font-black text-slate-900">
                <Timer size={16} className="text-orange-700" aria-hidden="true" />{ima.nokori > 0 ? `期限まであと${ima.nokori}日` : ima.nokori === 0 ? '今日が期限' : `期限を${-ima.nokori}日過ぎています`}
              </p>
            )}
            {ima && <p className="text-[12px] text-slate-700">{ima.ichi}</p>}
          </div>

          <ol className="flex flex-col gap-1.5 rounded-xl bg-white p-3 ring-1 ring-slate-200">
            {list.map((x) => (
              <li key={x.key} className={`flex flex-col gap-0.5 rounded-lg p-2 ${x.kind === 'irai' ? 'bg-sky-50' : x.kind === 'kigen' ? 'bg-orange-50' : ''}`}>
                <span className="flex items-baseline justify-between gap-2">
                  <span className={`text-[13px] font-black ${x.kind === 'irai' ? 'text-sky-800' : x.kind === 'kigen' ? 'text-orange-800' : 'text-slate-700'}`}>{x.h}</span>
                  <span className="shrink-0 text-[13px] font-black text-slate-900">{fmt(x.d)}</span>
                </span>
                <span className="text-[11px] leading-relaxed text-slate-600">{x.sub}</span>
              </li>
            ))}
          </ol>
          <p className="text-[11px] leading-relaxed text-slate-500">青い行の日付は、{K.iraiNote.replace('頼む目安の日は、', '')}</p>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {others.map((o, i) => {
          const d = parse(o);
          const r = d ? shinkokuKigen(d) : null;
          return (
            <div key={i} className="flex flex-col gap-1.5 rounded-xl bg-white p-3 ring-1 ring-slate-200">
              <span className="flex items-center justify-between text-[13px] font-black text-slate-700">
                ほかの相続人{i + 1}が知った日
                <button type="button" onClick={() => setOthers((s) => s.filter((_, j) => j !== i))} aria-label={`ほかの相続人${i + 1}を消す`} className="rounded-full p-1 text-slate-500 hover:bg-slate-100"><X size={16} aria-hidden="true" /></button>
              </span>
              <input type="date" value={o} onChange={(e) => { touch(); const v = e.target.value; setOthers((s) => s.map((x, j) => (j === i ? v : x))); }} aria-label={`ほかの相続人${i + 1}が知った日`} className={INPUT} />
              {r && <p className="text-[14px] font-black text-orange-800">この人の期限：{fmt(r.kigen)}</p>}
            </div>
          );
        })}
        {others.length < 3 && (
          <button type="button" onClick={() => { touch(); setOthers((s) => [...s, '']); }}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-white px-3 py-2.5 text-[13px] font-bold text-sky-800 ring-1 ring-sky-200">
            <Plus size={16} aria-hidden="true" />亡くなったことを別の日に知った相続人を足す
          </button>
        )}
      </div>

      {nashi.length > 0 && <p className="text-[11px] font-bold text-slate-600">{nashi.join('・')}年の祝日は入っていません。期限が祝日に当たるときは、休みの明けた日が期限です。</p>}
      <p className="text-[11px] leading-relaxed text-slate-500">土曜日・日曜日・祝日（2026・2027年の分）と12月29日〜1月3日に当たるときは、休みの明けた日にしています。頼む目安の日と相続放棄の日付は、休みの日でもずらしていません。入れた日付は送られません。</p>
    </div>
  );
}
