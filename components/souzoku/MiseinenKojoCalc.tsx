'use client';

import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, Calculator } from 'lucide-react';
import { trackEvent } from '@/lib/trackEvent';
import DATA from '@/lib/souzoku/haifu-data.json';

/**
 * 相続税の未成年者控除・障害者控除の計算（/guide/souzoku/miseinen-shougaisha-kojo、2026-11-15）。
 * 決まり：国税庁 No.4164・No.4167（令和8年4月1日現在法令等）。
 *   控除額 ＝ 1年あたりの額 ×（18歳か85歳になるまでの年数。1年未満は切り上げ）＝ 1年あたりの額 ×（18か85 − 満年齢）。
 *   本人の相続税で引き切れない分は、扶養義務者の相続税から引く。
 * 満年齢は誕生日で1つ上がるものとして数え、亡くなった日が誕生日の前日・当日のときは確かめるよう表示する。
 * 使われたかは lp_event_logs の event_name 'miseinen_kojo'（1回目だけ）。入れた日付・数字は送らない。
 */
const D = DATA.miseinen;
const yen = (n: number) => `${Math.round(n).toLocaleString('ja-JP')}円`;
const toDate = (s: string) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  return m ? { y: +m[1], m: +m[2], d: +m[3] } : null;
};

export function mannenrei(b: { y: number; m: number; d: number }, at: { y: number; m: number; d: number }) {
  let a = at.y - b.y;
  if (at.m < b.m || (at.m === b.m && at.d < b.d)) a -= 1;
  return a;
}

export function kojo(age: number, made: number, per: number) {
  if (age < 0 || age >= made) return { nensu: 0, gaku: 0 };
  const nensu = made - age;
  return { nensu, gaku: nensu * per };
}

/** 亡くなった日が誕生日の前日なら true（年齢の数え方で1年変わりうる） */
export function kiwado(b: { y: number; m: number; d: number }, at: { y: number; m: number; d: number }) {
  const t = Date.UTC(at.y, at.m - 1, at.d);
  const bd = Date.UTC(at.y, b.m - 1, b.d);
  return t + 86400000 === bd || (b.m === 1 && b.d === 1 && at.m === 12 && at.d === 31);
}

const INPUT = 'w-full min-w-0 rounded-xl bg-white px-3 py-2.5 text-[16px] font-bold text-slate-900 ring-1 ring-slate-300 outline-none focus:ring-2 focus:ring-sky-600';

export default function MiseinenKojoCalc({ lpId }: { lpId: string }) {
  const [shurui, setShurui] = useState(D.shurui[0].key);
  const [birth, setBirth] = useState('');
  const [shibou, setShibou] = useState('');
  const [zei, setZei] = useState('');
  const sent = useRef(false);
  const s = D.shurui.find((x) => x.key === shurui)!;
  const b = toDate(birth);
  const at = toDate(shibou);
  const ok = !!b && !!at && Date.UTC(at.y, at.m - 1, at.d) >= Date.UTC(b.y, b.m - 1, b.d);
  const age = ok ? mannenrei(b!, at!) : -1;
  const r = kojo(age, s.made, s.per);
  const zeiNum = Number(zei.replace(/[,，\s]/g, ''));
  const zeiOk = zei.trim() !== '' && Number.isFinite(zeiNum) && zeiNum >= 0;
  const zeigaku = zeiOk ? Math.round(zeiNum * 10000) : 0;
  const honnin = zeiOk ? Math.min(r.gaku, zeigaku) : r.gaku;
  const nokori = zeiOk ? r.gaku - honnin : 0;

  useEffect(() => {
    if (!ok || sent.current) return;
    sent.current = true;
    void trackEvent({ lp_id: lpId, event_name: 'miseinen_kojo', component_id: 'miseinen-kojo' });
  }, [ok, lpId]);

  return (
    <div className="flex flex-col gap-4 rounded-2xl border-2 border-sky-200 bg-sky-50/60 p-4">
      <p className="flex items-center gap-2 text-[17px] font-black text-slate-900">
        <Calculator size={22} className="text-sky-700" aria-hidden="true" />控除の額の計算<span className="text-[12px] font-bold text-sky-700">無料</span>
      </p>
      <div className="grid grid-cols-3 gap-1.5" role="radiogroup" aria-label="控除の種類">
        {D.shurui.map((x) => (
          <button key={x.key} type="button" role="radio" aria-checked={shurui === x.key} onClick={() => setShurui(x.key)}
            className={`rounded-xl px-1.5 py-2.5 text-[12px] font-bold leading-snug ring-1 ${shurui === x.key ? 'bg-sky-700 text-white ring-sky-700' : 'bg-white text-slate-700 ring-slate-200'}`}>
            {x.h.replace('障害者控除（', '').replace('）', '')}
            <span className="block text-[10px] font-normal opacity-80">{x.made}歳まで・年{x.per / 10000}万円</span>
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <label className="flex min-w-0 flex-col gap-1 text-[11px] font-bold text-slate-600">生年月日
          <input type="date" value={birth} min="1920-01-01" max="2040-12-31" onChange={(e) => setBirth(e.target.value)} className={`${INPUT} px-2 text-[15px]`} />
        </label>
        <label className="flex min-w-0 flex-col gap-1 text-[11px] font-bold text-slate-600">亡くなった日
          <input type="date" value={shibou} min="2020-01-01" max="2040-12-31" onChange={(e) => setShibou(e.target.value)} className={`${INPUT} px-2 text-[15px]`} />
        </label>
      </div>
      <label className="flex flex-col gap-1 text-[11px] font-bold text-slate-600">その人の相続税（控除の前・万円。分からなければ空のまま）
        <input inputMode="decimal" value={zei} placeholder="20" onChange={(e) => setZei(e.target.value)} className={INPUT} />
      </label>
      {ok && (
        <div className="flex flex-col gap-2" aria-live="polite">
          <p className="rounded-xl bg-white px-3 py-2 text-center text-[13px] text-slate-800 ring-1 ring-slate-200">
            亡くなった日の満年齢 <b>{age}歳</b> → {s.made}歳までの年数 <b>{r.nensu}年</b>
          </p>
          <p className="rounded-xl bg-orange-600 px-3 py-3 text-center text-white">
            <span className="block text-[12px] opacity-90">{s.h}の額</span>
            <span className="text-[22px] font-black">{r.gaku ? yen(r.gaku) : '使えません'}</span>
            {!r.gaku && <span className="block text-[12px]">{s.made}歳以上のため</span>}
          </p>
          {zeiOk && r.gaku > 0 && (
            <div className="grid grid-cols-2 gap-1.5 text-center text-[12px]">
              <span className="rounded-lg bg-emerald-50 py-1.5 text-emerald-800">本人の相続税から<b className="block text-[14px]">{yen(honnin)}</b></span>
              <span className="rounded-lg bg-amber-50 py-1.5 text-amber-800">扶養義務者の相続税から<b className="block text-[14px]">{yen(nokori)}</b></span>
            </div>
          )}
          {kiwado(b!, at!) && (
            <p className="flex items-start gap-2 rounded-xl bg-amber-50 p-2.5 text-[12px] leading-relaxed text-amber-900 ring-1 ring-amber-200">
              <AlertTriangle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
              誕生日の前日に亡くなっています。年齢の数え方で年数が1年変わることがあるので、税務署か税理士に確かめてください。
            </p>
          )}
        </div>
      )}
      <p className="text-[11px] leading-relaxed text-slate-500">法定相続人で、財産を受け取ったときに日本に住所がある人などが使えます。前の相続でも同じ控除を受けていると、額が減ることがあります。入れた内容は送られません。</p>
    </div>
  );
}
