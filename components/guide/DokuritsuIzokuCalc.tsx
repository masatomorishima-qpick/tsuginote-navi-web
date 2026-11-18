'use client';

import { useEffect, useRef, useState } from 'react';
import { Baby, GraduationCap } from 'lucide-react';
import { trackEvent } from '@/lib/trackEvent';
import DATA from '@/lib/hoken/haifu-data.json';
import { izokuTotal, lastDay } from '@/components/guide/IzokuNenkinCalc';

/**
 * 子どもが独立したときの保険の見直し（/guide/shisan-kanri/hoken-minaoshi-dokuritsu、2026-11-19）。
 * 遺族基礎年金：日本年金機構（令和8年4月分から。847,300円＋子の加算 1人目・2人目 各243,800円、3人目から 各81,300円）。
 *   子は18歳になった年度の3月31日まで（障害等級1・2級は20歳未満。ここでは入れない）。lastDay・izokuTotal は出産のページと同じ計算。
 * 独立の時期：入れた年齢になった年度の3月31日（例 22歳）。遺族基礎年金が終わってから独立までの年数を出す（教育費が続くのに年金がない期間）。
 * 使われたかは lp_event_logs の event_name 'dokuritsu_izoku'（1回目だけ）。入れた内容は送らない。
 */
const Z = DATA.dokuritsu.izoku;

/** 子が age 歳になった年度の3月31日。 */
export function nendoEnd(birth: Date, age: number) {
  const y = birth.getFullYear() + age;
  let bd = new Date(y, birth.getMonth(), birth.getDate());
  if (bd.getMonth() !== birth.getMonth()) bd = new Date(y, birth.getMonth() + 1, 1);
  const reach = new Date(bd.getFullYear(), bd.getMonth(), bd.getDate() - 1);
  const fy = reach.getMonth() >= 3 ? reach.getFullYear() + 1 : reach.getFullYear();
  return new Date(fy, 2, 31);
}

const man = (v: number) => `${(Math.round(v / 1000) / 10).toLocaleString('ja-JP')}万円`;
const fmt = (d: Date) => `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;

export default function DokuritsuIzokuCalc({ lpId }: { lpId: string }) {
  const [kids, setKids] = useState(['']);
  const [age, setAge] = useState(22);
  const sent = useRef(false);
  const touched = useRef(false);

  useEffect(() => {
    if (!touched.current || sent.current) return;
    sent.current = true;
    void trackEvent({ lp_id: lpId, event_name: 'dokuritsu_izoku', component_id: 'dokuritsu-izoku' });
  });

  const births = kids.map((k) => (k ? new Date(`${k}T00:00:00`) : null)).filter((d): d is Date => !!d && !Number.isNaN(d.getTime()));
  const today = new Date();
  const r = births.length ? izokuTotal(births, today) : null;
  const youngest = births.length ? births.reduce((a, b) => (a > b ? a : b)) : null;
  const end18 = youngest ? lastDay(youngest) : null;
  const endDoku = youngest ? nendoEnd(youngest, age) : null;
  const gap = end18 && endDoku ? endDoku.getFullYear() - end18.getFullYear() : 0;

  return (
    <div className="flex flex-col gap-4 rounded-2xl border-2 border-sky-200 bg-sky-50/60 p-4">
      <p className="flex items-center gap-2 text-[17px] font-black text-slate-900">
        <GraduationCap size={22} className="text-sky-700" aria-hidden="true" />遺族基礎年金が終わる日<span className="text-[12px] font-bold text-sky-700">無料</span>
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
        <label className="flex items-center gap-2 text-[13px] font-bold text-slate-700">末の子が独立する年齢
          <select value={age} onChange={(e) => { touched.current = true; setAge(Number(e.target.value)); }} className="rounded-xl bg-white px-2 py-2 text-[16px] font-bold text-slate-900 ring-1 ring-slate-300">
            {[18, 20, 22, 24].map((a) => <option key={a} value={a}>{a}歳の年度末</option>)}
          </select>
        </label>
      </div>
      {r && end18 && endDoku && (
        <div className="flex flex-col gap-2 rounded-xl bg-white p-3 ring-1 ring-slate-200" aria-live="polite">
          <p className="text-[13px] text-slate-600">末の子が対象から外れる日（遺族基礎年金が終わる）</p>
          <p className="text-[20px] font-black text-orange-700">{fmt(end18)}</p>
          {gap > 0 && <p className="text-[13px] font-bold text-slate-800">独立（{fmt(endDoku)}）まで、遺族基礎年金のない期間が約{gap}年あります</p>}
          {r.rows.length === 0 ? (
            <p className="text-[14px] font-bold text-slate-800">対象になる子がもういないため、いま亡くなっても遺族基礎年金は出ません。死亡保障の計算の「収入の見込み」から外します。</p>
          ) : (
            <p className="text-[14px] font-bold text-slate-800">いま亡くなった場合に受け取れる遺族基礎年金の合計：約<span className="text-orange-700">{man(r.total)}</span>
              <span className="block text-[12px] font-normal text-slate-600">年額 {r.now.toLocaleString('ja-JP')}円（{Z.nendo}）から始まり、上の日で終わる</span>
            </p>
          )}
        </div>
      )}
      <p className="text-[11px] leading-relaxed text-slate-500">{DATA.dokuritsu.keisanNote} 入れた日付は送られません。</p>
    </div>
  );
}
