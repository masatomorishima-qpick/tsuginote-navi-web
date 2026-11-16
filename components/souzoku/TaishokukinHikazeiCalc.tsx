'use client';

import { useEffect, useRef, useState } from 'react';
import { Calculator, Plus, Trash2 } from 'lucide-react';
import { trackEvent } from '@/lib/trackEvent';
import { calc, countHeirs } from '@/components/souzoku/HokenkinHikazeiCalc';
import DATA from '@/lib/souzoku/haifu-data.json';

/**
 * 死亡退職金の非課税の計算（/guide/souzoku/shibou-taishokukin-hikazei、2026-11-17）。
 * 式：国税庁 No.4117。限度額＝500万円×法定相続人の数（放棄した人も数える。養子は実子がいれば1人・いなければ2人まで）。
 *   相続人ごとの非課税＝限度額×（その人の退職金÷相続人全員の退職金の合計）。放棄した人・相続人でない人には使えない。
 *   按分の計算は死亡保険金と同じなので HokenkinHikazeiCalc の calc を使う（限度額の 500万円も同じ）。
 * 弔慰金：国税庁 No.4120。業務上の死亡は普通給与の3年分、業務外は半年分まで。超える分は退職手当金等に足す。
 * 答え合わせ：No.4117 の例（配偶者2,000万・長男1,000万・放棄した長女500万、相続人3人）→ 課税 1,000万・500万・500万。
 * 使われたかは lp_event_logs の event_name 'taishokukin_hikazei'（1回目だけ）。入れた数字は送らない。
 */
const T = DATA.taishoku;
const yen = (n: number) => `${Math.round(n).toLocaleString('ja-JP')}円`;
const man = (s: string) => {
  const n = Number(s.replace(/[,，\s]/g, ''));
  return Number.isFinite(n) && n > 0 ? Math.round(n * 10000) : 0;
};

/** 弔慰金のうち、退職手当金等として相続税の対象になる額（No.4120）。 */
export function chouiKazei(choui: number, gekkyu: number, gyomu: boolean) {
  const gendo = gekkyu * (gyomu ? T.choui[0].months : T.choui[1].months);
  return { gendo, kazei: Math.max(0, choui - gendo) };
}

type Row = { name: string; kingaku: string; souzokunin: boolean };
const INPUT = 'w-full rounded-xl bg-white px-3 py-2.5 text-[16px] font-bold text-slate-900 ring-1 ring-slate-300 outline-none focus:ring-2 focus:ring-sky-600';

export default function TaishokukinHikazeiCalc({ lpId }: { lpId: string }) {
  const [haigusha, setHaigusha] = useState(1);
  const [jitsu, setJitsu] = useState(2);
  const [yoshi, setYoshi] = useState(0);
  const [rows, setRows] = useState<Row[]>([{ name: '配偶者', kingaku: '', souzokunin: true }, { name: '子', kingaku: '', souzokunin: true }]);
  const [choui, setChoui] = useState('');
  const [gekkyu, setGekkyu] = useState('');
  const [gyomu, setGyomu] = useState(false);
  const sent = useRef(false);
  const ninzu = countHeirs(jitsu, yoshi, haigusha);
  const parsed = rows.map((r) => ({ kingaku: man(r.kingaku), souzokunin: r.souzokunin }));
  const used = parsed.some((r) => r.kingaku > 0) || man(choui) > 0;
  const res = calc(ninzu, parsed);
  const sumKazei = res.rows.reduce((a, r) => a + r.kazei, 0);
  const ch = chouiKazei(man(choui), man(gekkyu), gyomu);

  useEffect(() => {
    if (!used || sent.current) return;
    sent.current = true;
    void trackEvent({ lp_id: lpId, event_name: 'taishokukin_hikazei', component_id: 'taishokukin-hikazei' });
  }, [used, lpId]);

  const set = (i: number, patch: Partial<Row>) => setRows((rs) => rs.map((r, k) => (k === i ? { ...r, ...patch } : r)));
  const sel = (v: number, on: (n: number) => void, max: number, label: string) => (
    <label className="flex flex-col gap-1 text-[11px] font-bold text-slate-600">{label}
      <select value={v} onChange={(e) => on(Number(e.target.value))} className={INPUT}>
        {Array.from({ length: max + 1 }, (_, n) => <option key={n} value={n}>{n}人</option>)}
      </select>
    </label>
  );

  return (
    <div className="flex flex-col gap-4 rounded-2xl border-2 border-sky-200 bg-sky-50/60 p-4">
      <p className="flex items-center gap-2 text-[17px] font-black text-slate-900">
        <Calculator size={22} className="text-sky-700" aria-hidden="true" />死亡退職金の非課税の計算<span className="text-[12px] font-bold text-sky-700">無料</span>
      </p>
      <div className="flex flex-col gap-2">
        <p className="text-[13px] font-black text-slate-700">① 法定相続人（相続を放棄した人も数える）</p>
        <div className="grid grid-cols-3 gap-2">
          {sel(haigusha, setHaigusha, 1, '配偶者')}
          {sel(jitsu, setJitsu, 8, '実の子')}
          {sel(yoshi, setYoshi, 5, '養子')}
        </div>
        <p className="text-[11px] text-slate-500">子がいないときは、親か兄弟姉妹の人数を「実の子」の欄に入れます。</p>
        <p className="rounded-xl bg-white px-3 py-2 text-center text-[14px] font-black text-slate-900 ring-1 ring-slate-200">
          数える人数 {ninzu}人 → 非課税の限度額 <span className="text-orange-700">{yen(res.gendo)}</span>
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-[13px] font-black text-slate-700">② 受け取った死亡退職金（万円）</p>
        {rows.map((r, i) => (
          <div key={i} className="flex flex-col gap-1.5 rounded-xl bg-white p-2.5 ring-1 ring-slate-200">
            <div className="grid grid-cols-[1fr_1fr_auto] items-end gap-2">
              <label className="flex flex-col gap-1 text-[11px] font-bold text-slate-600">受け取った人
                <input value={r.name} onChange={(e) => set(i, { name: e.target.value })} className={INPUT} />
              </label>
              <label className="flex flex-col gap-1 text-[11px] font-bold text-slate-600">金額（万円）
                <input inputMode="numeric" value={r.kingaku} placeholder="1000" onChange={(e) => set(i, { kingaku: e.target.value })} className={INPUT} />
              </label>
              <button type="button" aria-label="この行を消す" onClick={() => setRows((rs) => rs.filter((_, k) => k !== i))} disabled={rows.length <= 1}
                className="mb-1 flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 ring-1 ring-slate-200 disabled:opacity-30">
                <Trash2 size={18} aria-hidden="true" />
              </button>
            </div>
            <label className="flex items-center gap-2 text-[12px] font-bold text-slate-700">
              <input type="checkbox" checked={!r.souzokunin} onChange={(e) => set(i, { souzokunin: !e.target.checked })} className="h-4 w-4" />
              相続人でない・相続を放棄した（非課税なし）
            </label>
            {man(r.kingaku) > 0 && (
              <p className="grid grid-cols-2 gap-1 text-center text-[12px]">
                <span className="rounded-lg bg-emerald-50 py-1.5 text-emerald-800">非課税 <b className="text-[14px]">{yen(res.rows[i].hikazei)}</b></span>
                <span className="rounded-lg bg-orange-50 py-1.5 text-orange-800">相続税の対象 <b className="text-[14px]">{yen(res.rows[i].kazei)}</b></span>
              </p>
            )}
          </div>
        ))}
        {rows.length < 6 && (
          <button type="button" onClick={() => setRows((rs) => [...rs, { name: '', kingaku: '', souzokunin: true }])}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-white py-2.5 text-[14px] font-bold text-sky-700 ring-1 ring-sky-200">
            <Plus size={16} aria-hidden="true" />受け取った人を足す
          </button>
        )}
      </div>
      <details className="rounded-xl bg-white p-3 ring-1 ring-slate-200">
        <summary className="cursor-pointer text-[13px] font-black text-slate-700">③ 会社から弔慰金も受け取ったとき</summary>
        <div className="mt-2 flex flex-col gap-2">
          <div className="grid grid-cols-2 gap-2">
            <label className="flex flex-col gap-1 text-[11px] font-bold text-slate-600">弔慰金（万円）
              <input inputMode="numeric" value={choui} placeholder="300" onChange={(e) => setChoui(e.target.value)} className={INPUT} />
            </label>
            <label className="flex flex-col gap-1 text-[11px] font-bold text-slate-600">亡くなったときの月の普通給与（万円）
              <input inputMode="numeric" value={gekkyu} placeholder="40" onChange={(e) => setGekkyu(e.target.value)} className={INPUT} />
            </label>
          </div>
          <label className="flex items-center gap-2 text-[12px] font-bold text-slate-700">
            <input type="checkbox" checked={gyomu} onChange={(e) => setGyomu(e.target.checked)} className="h-4 w-4" />
            仕事中の死亡（業務上）だった
          </label>
          {man(choui) > 0 && man(gekkyu) > 0 && (
            <p className="grid grid-cols-2 gap-1 text-center text-[12px]" aria-live="polite">
              <span className="rounded-lg bg-emerald-50 py-1.5 text-emerald-800">弔慰金として非課税<b className="block text-[14px]">{yen(Math.min(man(choui), ch.gendo))}</b></span>
              <span className="rounded-lg bg-orange-50 py-1.5 text-orange-800">退職金に足す額<b className="block text-[14px]">{yen(ch.kazei)}</b></span>
            </p>
          )}
          <p className="text-[11px] text-slate-500">「退職金に足す額」は、受け取った人の②の金額に足して計算します。退職給与規程で退職手当金にあたると決まっている分は、規程で判断します。</p>
        </div>
      </details>
      {used && (
        <p className="rounded-xl bg-orange-600 px-3 py-3 text-center text-white" aria-live="polite">
          <span className="block text-[12px] opacity-90">遺産に足す死亡退職金の合計</span>
          <span className="text-[20px] font-black">{yen(sumKazei)}</span>
          <span className="block text-[11px] opacity-90">死亡保険金も受け取ったときは、それとは別に {yen(res.gendo)} の非課税があります</span>
        </p>
      )}
      <p className="text-[11px] leading-relaxed text-slate-500">亡くなった後3年以内に支給が確定した退職金が対象です。1円未満は切り捨てて表示します。入れた数字は送られません。</p>
    </div>
  );
}
