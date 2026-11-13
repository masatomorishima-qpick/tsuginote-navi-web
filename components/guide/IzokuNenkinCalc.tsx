'use client';

import { useEffect, useRef, useState } from 'react';
import { Baby, Check, ListChecks, Users } from 'lucide-react';
import { trackEvent } from '@/lib/trackEvent';
import DATA from '@/lib/hoken/haifu-data.json';

/**
 * 子どもが生まれたときの保険の見直し（/guide/shisan-kanri/hoken-minaoshi-shussan、2026-11-14）。
 * 遺族基礎年金の目安：日本年金機構（令和8年4月分から。847,300円＋子の加算 1人目・2人目 各243,800円、3人目から 各81,300円）。
 *   子は18歳になった日以後の最初の3月31日まで（18歳になるのは誕生日の前の日。4月1日生まれは18歳の誕生日の前の日＝3月31日が最後）。
 *   仮に今月亡くなった場合として、翌月分から年度（4月〜3月）ごとに数える。年度の中では子の数が変わらないので、年額×月数/12。
 * チェック：生命保険文化センター（必要保障額＝支出の見込み−収入の見込み）ほか。
 * 使われたかは lp_event_logs の event_name 'izoku_nenkin'（1回目だけ）。入れた内容は送らない。
 */
const Z = DATA.shussan.izoku;
const C = DATA.shussan.check;

/** 子が加算の対象になる最後の日（18歳になった年度の3月31日）。 */
export function lastDay(birth: Date) {
  // 18歳になる日＝18回目の誕生日の前の日（年齢計算ニ関スル法律）。応当日がない（2/29生まれ）ときは2/28。
  const y = birth.getFullYear() + 18;
  let bd = new Date(y, birth.getMonth(), birth.getDate());
  if (bd.getMonth() !== birth.getMonth()) bd = new Date(y, birth.getMonth() + 1, 1);
  const reach = new Date(bd.getFullYear(), bd.getMonth(), bd.getDate() - 1);
  const fy = reach.getMonth() >= 3 ? reach.getFullYear() + 1 : reach.getFullYear();
  return new Date(fy, 2, 31);
}

/** 子の数ごとの年額。 */
export function nengaku(n: number) {
  if (n <= 0) return 0;
  return Z.base + Z.add12 * Math.min(n, 2) + Z.add3 * Math.max(n - 2, 0);
}

/** 仮に today の月に亡くなった場合の、翌月分からの合計の目安。年度ごとの行も返す。 */
export function izokuTotal(births: Date[], today: Date) {
  const ends = births.map(lastDay);
  const rows: { nendo: number; n: number; months: number; gaku: number }[] = [];
  // 翌月の1日から
  let cur = new Date(today.getFullYear(), today.getMonth() + 1, 1);
  for (let guard = 0; guard < 30; guard++) {
    const nendo = cur.getMonth() >= 3 ? cur.getFullYear() : cur.getFullYear() - 1;
    const nendoEnd = new Date(nendo + 1, 2, 31);
    const n = ends.filter((e) => e >= nendoEnd).length;
    if (n === 0) break;
    const months = (nendo + 1 - cur.getFullYear()) * 12 + (3 - cur.getMonth());
    rows.push({ nendo, n, months, gaku: Math.round((nengaku(n) * months) / 12) });
    cur = new Date(nendo + 1, 3, 1);
  }
  return { rows, total: rows.reduce((a, r) => a + r.gaku, 0), now: rows[0] ? nengaku(rows[0].n) : 0, last: rows.length ? new Date(rows[rows.length - 1].nendo + 1, 2, 31) : null };
}

const man = (v: number) => `${(Math.round(v / 1000) / 10).toLocaleString('ja-JP')}万円`;
const fmt = (d: Date) => `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;

export default function IzokuNenkinCalc({ lpId }: { lpId: string }) {
  const [kids, setKids] = useState(['']);
  const [on, setOn] = useState<Record<string, boolean>>({});
  const sent = useRef(false);
  const touched = useRef(false);

  useEffect(() => {
    if (!touched.current || sent.current) return;
    sent.current = true;
    void trackEvent({ lp_id: lpId, event_name: 'izoku_nenkin', component_id: 'izoku-nenkin' });
  });

  const births = kids.map((k) => (k ? new Date(`${k}T00:00:00`) : null)).filter((d): d is Date => !!d && !Number.isNaN(d.getTime()));
  const r = births.length ? izokuTotal(births, new Date()) : null;
  const done = C.filter((c) => on[c.key]).length;

  return (
    <div className="flex flex-col gap-4 rounded-2xl border-2 border-sky-200 bg-sky-50/60 p-4">
      <p className="flex items-center gap-2 text-[17px] font-black text-slate-900">
        <Users size={22} className="text-sky-700" aria-hidden="true" />遺族基礎年金の目安<span className="text-[12px] font-bold text-sky-700">無料</span>
      </p>
      <div className="flex flex-col gap-2">
        {kids.map((v, i) => (
          <label key={i} className="flex items-center gap-2">
            <span className="flex w-[84px] shrink-0 items-center gap-1 text-[13px] font-bold text-slate-700"><Baby size={16} aria-hidden="true" />子 {i + 1}人目</span>
            <input type="date" value={v} onChange={(e) => { touched.current = true; setKids(kids.map((x, k) => (k === i ? e.target.value : x))); }} aria-label={`${i + 1}人目の子の生年月日`}
              className="min-w-0 flex-1 rounded-xl bg-white px-3 py-2.5 text-[16px] font-bold text-slate-900 ring-1 ring-slate-300 outline-none focus:ring-2 focus:ring-sky-600" />
          </label>
        ))}
        {kids.length < 5 && <button type="button" onClick={() => setKids([...kids, ''])} className="self-start rounded-lg bg-white px-2.5 py-1.5 text-[12px] font-bold text-sky-800 ring-1 ring-sky-200">＋ 子を足す</button>}
        <p className="text-[11px] text-slate-500">生まれる前なら予定日を入れると、生まれた後の目安になります。</p>
      </div>
      {r && (
        <div className="flex flex-col gap-2 rounded-xl bg-white p-3 ring-1 ring-slate-200" aria-live="polite">
          {r.rows.length === 0 ? (
            <p className="text-[14px] font-bold text-slate-700">来月以降に対象になる子（18歳になった年度の3月31日まで）がいないため、遺族基礎年金の目安は出ません。</p>
          ) : (
            <>
              <p className="text-[13px] text-slate-600">子のある配偶者が受け取る額（{Z.nendo}）</p>
              <p className="text-[15px] font-black text-slate-900">年額 <span className="text-[20px] text-orange-700">{r.now.toLocaleString('ja-JP')}円</span></p>
              <p className="text-[15px] font-black text-slate-900">合計 <span className="text-[20px] text-orange-700">約{man(r.total)}</span>
                <span className="block text-[12px] font-bold text-slate-600">{r.last && `${fmt(r.last)}まで（末の子が18歳になった年度の末）`}</span></p>
              <details className="text-[12px] text-slate-600">
                <summary className="cursor-pointer font-bold text-sky-800">年度ごとの内訳</summary>
                <table className="mt-2 w-full">
                  <tbody>
                    {r.rows.map((x) => (
                      <tr key={x.nendo} className="border-t border-slate-100"><td className="py-1">{x.nendo}年度</td><td className="py-1">子{x.n}人・{x.months}か月</td><td className="py-1 text-right font-bold">{x.gaku.toLocaleString('ja-JP')}円</td></tr>
                    ))}
                  </tbody>
                </table>
              </details>
            </>
          )}
          <p className="text-[11px] leading-relaxed text-slate-500">{DATA.shussan.keisanNote}</p>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <p className="flex items-center gap-1.5 text-[13px] font-black text-slate-700"><ListChecks size={16} aria-hidden="true" />見直しのチェック（{done}/{C.length}）</p>
        {C.map((c) => {
          const sel = !!on[c.key];
          return (
            <button key={c.key} type="button" aria-pressed={sel} onClick={() => { touched.current = true; setOn((s) => ({ ...s, [c.key]: !s[c.key] })); }}
              className={`flex w-full items-start gap-2.5 rounded-xl bg-white p-3 text-left ring-1 ${sel ? 'ring-emerald-300' : 'ring-slate-200'}`}>
              <span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md ring-1 ${sel ? 'bg-emerald-600 text-white ring-emerald-600' : 'bg-white text-transparent ring-slate-300'}`}><Check size={16} aria-hidden="true" /></span>
              <span className="flex min-w-0 flex-col"><span className="text-[14px] font-bold text-slate-900">{c.h}</span><span className="text-[12px] text-slate-500">{c.g}｜{c.d}</span></span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
