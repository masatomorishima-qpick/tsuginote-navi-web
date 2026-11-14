'use client';

import { useEffect, useRef, useState } from 'react';
import { Calculator, Plus, Trash2 } from 'lucide-react';
import { trackEvent } from '@/lib/trackEvent';

/**
 * 生前贈与の加算（7年）の計算（/guide/souzoku/seizen-zouyo-kasan、2026-11-14）。
 * 決まり：国税庁 No.4161（令和8年4月1日現在法令等）。
 *   足す期間：亡くなった日が 2026-12-31 まで → 3年前の日〜亡くなった日／2027-01-01〜2030-12-31 → 2024-01-01〜亡くなった日／
 *   2031-01-01 から → 7年前の日〜亡くなった日。
 *   2027-01-02 以後に亡くなったら、期間のうち「3年以内」より前の分の合計から総額100万円まで足さない。
 * 「n年前の日」は同じ月日。その日がない（2月29日）ときは2月28日とする（エクセルの EDATE と同じ）。
 * 使われたかは lp_event_logs の event_name 'seizen_kasan'（1回目だけ）。入れた数字は送らない。
 */
const toDate = (s: string) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) return null;
  const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
  return Number.isNaN(d.getTime()) ? null : d;
};
const iso = (d: Date) => d.toISOString().slice(0, 10);
const jp = (d: Date) => `${d.getUTCFullYear()}年${d.getUTCMonth() + 1}月${d.getUTCDate()}日`;
const yen = (n: number) => `${Math.round(n).toLocaleString('ja-JP')}円`;

/** n 年前の同じ月日。ない日（2月29日）はその月の末日。 */
export function yearsBefore(d: Date, n: number) {
  const y = d.getUTCFullYear() - n;
  const m = d.getUTCMonth();
  const last = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
  return new Date(Date.UTC(y, m, Math.min(d.getUTCDate(), last)));
}

export function kasanKikan(shibou: Date) {
  const s = iso(shibou);
  const start = s <= '2026-12-31' ? yearsBefore(shibou, 3) : s <= '2030-12-31' ? new Date(Date.UTC(2024, 0, 1)) : yearsBefore(shibou, 7);
  return { start, san: yearsBefore(shibou, 3), hyaku: s >= '2027-01-02' };
}

export type Gift = { date: Date; amount: number };
export function calcKasan(shibou: Date, gifts: Gift[]) {
  const { start, san, hyaku } = kasanKikan(shibou);
  let within3 = 0;
  let older = 0;
  const kubun = gifts.map((g) => {
    if (g.date.getTime() < start.getTime() || g.date.getTime() > shibou.getTime()) return 'gai' as const;
    if (g.date.getTime() >= san.getTime()) { within3 += g.amount; return 'san' as const; }
    older += g.amount;
    return 'mae' as const;
  });
  const kojo = hyaku ? Math.min(older, 1000000) : 0;
  return { start, san, hyaku, within3, older, kojo, kasan: within3 + older - kojo, kubun };
}

type Row = { date: string; man: string };
const INPUT = 'w-full min-w-0 rounded-xl bg-white px-3 py-2.5 text-[16px] font-bold text-slate-900 ring-1 ring-slate-300 outline-none focus:ring-2 focus:ring-sky-600';
const man = (s: string) => {
  const n = Number(s.replace(/[,，\s]/g, ''));
  return Number.isFinite(n) && n > 0 ? Math.round(n * 10000) : 0;
};
const LABEL = { san: '3年以内 → 全額足す', mae: '3年より前 → 足す（100万円の控除あり）', gai: '期間の外 → 足さない' } as const;
const COLOR = { san: 'bg-orange-50 text-orange-800', mae: 'bg-amber-50 text-amber-800', gai: 'bg-slate-100 text-slate-600' } as const;

export default function SeizenKasanCalc({ lpId }: { lpId: string }) {
  const [shibou, setShibou] = useState('');
  const [rows, setRows] = useState<Row[]>([{ date: '', man: '' }, { date: '', man: '' }]);
  const sent = useRef(false);
  const sd = toDate(shibou);
  const gifts = rows.map((r) => ({ date: toDate(r.date), amount: man(r.man) }));
  const valid = gifts.filter((g): g is Gift => !!g.date && g.amount > 0);
  const res = sd ? calcKasan(sd, valid) : null;
  const used = !!sd && valid.length > 0;
  const kubunOf = gifts.map((g, i) => (g.date && g.amount > 0 ? gifts.slice(0, i).filter((x) => x.date && x.amount > 0).length : -1));

  useEffect(() => {
    if (!used || sent.current) return;
    sent.current = true;
    void trackEvent({ lp_id: lpId, event_name: 'seizen_kasan', component_id: 'seizen-kasan' });
  }, [used, lpId]);

  const set = (i: number, patch: Partial<Row>) => setRows((rs) => rs.map((r, k) => (k === i ? { ...r, ...patch } : r)));

  return (
    <div className="flex flex-col gap-4 rounded-2xl border-2 border-sky-200 bg-sky-50/60 p-4">
      <p className="flex items-center gap-2 text-[17px] font-black text-slate-900">
        <Calculator size={22} className="text-sky-700" aria-hidden="true" />足し戻す額の計算<span className="text-[12px] font-bold text-sky-700">無料</span>
      </p>
      <label className="flex flex-col gap-1 text-[13px] font-black text-slate-700">① 亡くなった日
        <input type="date" value={shibou} min="2020-01-01" max="2040-12-31" onChange={(e) => setShibou(e.target.value)} className={INPUT} />
      </label>
      {res && sd && (
        <p className="rounded-xl bg-white px-3 py-2.5 text-[13px] leading-relaxed text-slate-800 ring-1 ring-slate-200">
          足す期間：<b>{jp(res.start)}〜{jp(sd)}</b>
          {res.hyaku && <><br />うち <b>{jp(res.san)}</b> より前の分は、合計から100万円まで引く</>}
        </p>
      )}
      <div className="flex flex-col gap-2">
        <p className="text-[13px] font-black text-slate-700">② 1人が亡くなった人から受けた贈与（暦年課税。1人ずつ計算）</p>
        {rows.map((r, i) => {
          const k = kubunOf[i] >= 0 && res ? res.kubun[kubunOf[i]] : null;
          return (
            <div key={i} className="flex flex-col gap-1.5 rounded-xl bg-white p-2.5 ring-1 ring-slate-200">
              <div className="grid grid-cols-[1.3fr_1fr_auto] items-end gap-2">
                <label className="flex min-w-0 flex-col gap-1 text-[11px] font-bold text-slate-600">贈与の日
                  <input type="date" value={r.date} min="2015-01-01" max="2040-12-31" onChange={(e) => set(i, { date: e.target.value })} className={`${INPUT} px-2 text-[15px]`} />
                </label>
                <label className="flex min-w-0 flex-col gap-1 text-[11px] font-bold text-slate-600">金額（万円）
                  <input inputMode="decimal" value={r.man} placeholder="110" onChange={(e) => set(i, { man: e.target.value })} className={INPUT} />
                </label>
                <button type="button" aria-label="この行を消す" onClick={() => setRows((rs) => rs.filter((_, x) => x !== i))} disabled={rows.length <= 1}
                  className="mb-1 flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 ring-1 ring-slate-200 disabled:opacity-30">
                  <Trash2 size={18} aria-hidden="true" />
                </button>
              </div>
              {k && <p className={`rounded-lg px-2 py-1 text-center text-[12px] font-bold ${COLOR[k]}`}>{LABEL[k]}</p>}
            </div>
          );
        })}
        {rows.length < 12 && (
          <button type="button" onClick={() => setRows((rs) => [...rs, { date: '', man: '' }])}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-white py-2.5 text-[14px] font-bold text-sky-700 ring-1 ring-sky-200">
            <Plus size={16} aria-hidden="true" />贈与を足す
          </button>
        )}
      </div>
      {used && res && (
        <div className="flex flex-col gap-2" aria-live="polite">
          <div className="grid grid-cols-3 gap-1.5 text-center text-[11px]">
            <span className="rounded-lg bg-white py-1.5 ring-1 ring-slate-200">3年以内<b className="block text-[13px]">{yen(res.within3)}</b></span>
            <span className="rounded-lg bg-white py-1.5 ring-1 ring-slate-200">3年より前<b className="block text-[13px]">{yen(res.older)}</b></span>
            <span className="rounded-lg bg-white py-1.5 ring-1 ring-slate-200">引く額<b className="block text-[13px]">{res.kojo ? `−${yen(res.kojo)}` : '0円'}</b></span>
          </div>
          <p className="rounded-xl bg-orange-600 px-3 py-3 text-center text-white">
            <span className="block text-[12px] opacity-90">相続税の計算に足し戻す額</span>
            <span className="text-[22px] font-black">{yen(res.kasan)}</span>
          </p>
        </div>
      )}
      <p className="text-[11px] leading-relaxed text-slate-500">贈与のときの価額で入れます。100万円の控除は受け取った人ごとなので、1人分ずつ計算します。足すのは、相続や遺贈（遺言など）で財産を受け取った人と、相続時精算課税を使った人です。相続時精算課税の贈与、配偶者控除・住宅取得等資金などで非課税になった分は入れません。「3年前の日」は同じ月日（2月29日は2月28日）として、その日の贈与も期間に入れるこのサイトの数え方です。境目の日は税務署に確かめてください。入れた数字は送られません。</p>
    </div>
  );
}
