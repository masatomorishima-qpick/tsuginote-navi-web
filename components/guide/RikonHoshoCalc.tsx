'use client';

import { useEffect, useRef, useState } from 'react';
import { Baby, Calculator } from 'lucide-react';
import { trackEvent } from '@/lib/trackEvent';
import DATA from '@/lib/hoken/haifu-data.json';
import { lastDay } from '@/components/guide/IzokuNenkinCalc';
import { nendoEnd } from '@/components/guide/DokuritsuIzokuCalc';

/**
 * 離婚したときの保険の見直し（/guide/shisan-kanri/hoken-minaoshi-rikon、2026-11-20）。
 * 子どもを引き取った人が亡くなったときの、死亡保障の目安（生命保険文化センター：支出の見込み − 収入の見込み）。
 * 遺族基礎年金（日本年金機構、令和8年4月分から）：子が受け取るときは 847,300円＋2人目 243,800円＋3人目から各81,300円。
 *   いまの決まり：子に生計を同じくする父または母がいる間は、子に支給されない → 元配偶者が引き取るときは 0 として数える。
 *   2028年4月から：父または母と生計を同じくしていても子が受け取れるように見直す予定（厚生労働省「年金制度改正法の概要」事例3）。
 *   それより前に亡くなった場合の経過の扱いは資料で確かめられないため、元配偶者のときは「いまの決まり」と「見直し後に亡くなった場合」を並べて出す。
 *   子は18歳になった年度の3月31日まで（lastDay は出産のページと同じ）。遺族厚生年金は入れない。
 * 使われたかは lp_event_logs の event_name 'rikon_hosho'（1回目だけ）。入れた内容は送らない。
 */
const Z = DATA.rikon.izoku;

/** 子が受け取るときの年額（子の数 n）。 */
export function nengakuKo(n: number) {
  if (n <= 0) return 0;
  return Z.base + (n >= 2 ? Z.add2 : 0) + Z.add3 * Math.max(n - 2, 0);
}

/** 仮に today の月に亡くなった場合の、翌月分からの合計の目安（子が受け取るとき）。 */
export function izokuKoTotal(births: Date[], today: Date) {
  const ends = births.map(lastDay);
  let total = 0;
  let cur = new Date(today.getFullYear(), today.getMonth() + 1, 1);
  for (let guard = 0; guard < 30; guard++) {
    const nendo = cur.getMonth() >= 3 ? cur.getFullYear() : cur.getFullYear() - 1;
    const end = new Date(nendo + 1, 2, 31);
    const n = ends.filter((e) => e >= end).length;
    if (n === 0) break;
    const months = (nendo + 1 - cur.getFullYear()) * 12 + (3 - cur.getMonth());
    total += Math.round((nengakuKo(n) * months) / 12);
    cur = new Date(nendo + 1, 3, 1);
  }
  return total;
}

/** 翌月から end の月までの月数。 */
export function monthsUntil(today: Date, end: Date) {
  const m = (end.getFullYear() - today.getFullYear()) * 12 + (end.getMonth() - today.getMonth());
  return Math.max(0, m);
}

const man = (v: number) => (v === 0 ? "0円" : `${(Math.round(v / 1000) / 10).toLocaleString("ja-JP")}万円`);
const num = (s: string) => {
  const v = Number(s.replace(/[^\d.]/g, ''));
  return Number.isFinite(v) ? v : 0;
};

export default function RikonHoshoCalc({ lpId }: { lpId: string }) {
  const [kids, setKids] = useState(['']);
  const [moto, setMoto] = useState(true);
  const [seikatsu, setSeikatsu] = useState('15');
  const [age, setAge] = useState(22);
  const [ichiji, setIchiji] = useState('300');
  const [yokin, setYokin] = useState('0');
  const sent = useRef(false);
  const touched = useRef(false);
  const touch = () => { touched.current = true; };

  useEffect(() => {
    if (!touched.current || sent.current) return;
    sent.current = true;
    void trackEvent({ lp_id: lpId, event_name: 'rikon_hosho', component_id: 'rikon-hosho' });
  });

  const births = kids.map((k) => (k ? new Date(`${k}T00:00:00`) : null)).filter((d): d is Date => !!d && !Number.isNaN(d.getTime()));
  const today = new Date();
  const youngest = births.length ? births.reduce((a, b) => (a > b ? a : b)) : null;
  const months = youngest ? monthsUntil(today, nendoEnd(youngest, age)) : 0;
  const shishutsu = num(seikatsu) * 10000 * months + num(ichiji) * 10000;
  const izokuSofu = births.length ? izokuKoTotal(births, today) : 0;
  const izoku = moto ? 0 : izokuSofu;
  const fusoku = Math.max(0, shishutsu - izoku - num(yokin) * 10000);
  const fusokuGo = Math.max(0, shishutsu - izokuSofu - num(yokin) * 10000);

  const field = 'w-[88px] rounded-xl bg-white px-2 py-2 text-right text-[16px] font-bold text-slate-900 ring-1 ring-slate-300 outline-none focus:ring-2 focus:ring-sky-600';
  const row = 'flex items-center justify-between gap-2 text-[13px] font-bold text-slate-700';
  return (
    <div className="flex flex-col gap-4 rounded-2xl border-2 border-sky-200 bg-sky-50/60 p-4">
      <p className="flex items-center gap-2 text-[17px] font-black text-slate-900">
        <Calculator size={22} className="text-sky-700" aria-hidden="true" />離婚後に必要な死亡保障の計算<span className="text-[12px] font-bold text-sky-700">無料</span>
      </p>
      <div className="flex flex-col gap-2">
        {kids.map((v, i) => (
          <label key={i} className="flex items-center gap-2">
            <span className="flex w-[84px] shrink-0 items-center gap-1 text-[13px] font-bold text-slate-700"><Baby size={16} aria-hidden="true" />子 {i + 1}人目</span>
            <input type="date" value={v} onChange={(e) => { touch(); setKids(kids.map((x, k) => (k === i ? e.target.value : x))); }} aria-label={`${i + 1}人目の子の生年月日`}
              className="min-w-0 flex-1 rounded-xl bg-white px-3 py-2.5 text-[16px] font-bold text-slate-900 ring-1 ring-slate-300 outline-none focus:ring-2 focus:ring-sky-600" />
          </label>
        ))}
        {kids.length < 5 && <button type="button" onClick={() => setKids([...kids, ''])} className="self-start rounded-lg bg-white px-2.5 py-1.5 text-[12px] font-bold text-sky-800 ring-1 ring-sky-200">＋ 子を足す</button>}
      </div>
      <fieldset className="flex flex-col gap-1.5">
        <legend className="mb-1 text-[13px] font-bold text-slate-700">自分が亡くなったら、子を育てるのは</legend>
        {[{ v: true, t: '元配偶者（子の父または母）' }, { v: false, t: '祖父母など、子の父母でない人' }].map((o) => (
          <label key={o.t} className={`flex items-center gap-2 rounded-xl bg-white px-3 py-2.5 text-[14px] font-bold ring-1 ${moto === o.v ? 'text-sky-900 ring-2 ring-sky-600' : 'text-slate-700 ring-slate-300'}`}>
            <input type="radio" name="sodate" checked={moto === o.v} onChange={() => { touch(); setMoto(o.v); }} className="accent-sky-700" />{o.t}
          </label>
        ))}
      </fieldset>
      <div className="flex flex-col gap-2">
        <label className={row}>残したい子の生活費（月）<span className="flex items-center gap-1"><input inputMode="numeric" value={seikatsu} onChange={(e) => { touch(); setSeikatsu(e.target.value); }} className={field} />万円</span></label>
        <label className={row}>末の子が独立する年齢
          <select value={age} onChange={(e) => { touch(); setAge(Number(e.target.value)); }} className="rounded-xl bg-white px-2 py-2 text-[16px] font-bold text-slate-900 ring-1 ring-slate-300">
            {[18, 20, 22, 24].map((a) => <option key={a} value={a}>{a}歳の年度末</option>)}
          </select>
        </label>
        <label className={row}>教育費・葬儀などのまとまったお金<span className="flex items-center gap-1"><input inputMode="numeric" value={ichiji} onChange={(e) => { touch(); setIchiji(e.target.value); }} className={field} />万円</span></label>
        <label className={row}>預貯金・勤務先の死亡退職金など<span className="flex items-center gap-1"><input inputMode="numeric" value={yokin} onChange={(e) => { touch(); setYokin(e.target.value); }} className={field} />万円</span></label>
      </div>
      {youngest && (
        <div className="flex flex-col gap-2 rounded-xl bg-white p-3 ring-1 ring-slate-200" aria-live="polite">
          <p className="text-[13px] text-slate-600">{moto ? '必要な死亡保障の目安（いまの決まり。2028年3月までに亡くなった場合）' : '必要な死亡保障の目安（いま亡くなった場合）'}</p>
          <p className="text-[24px] font-black text-orange-700">約{man(fusoku)}</p>
          <table className="w-full text-[13px]">
            <tbody>
              <tr className="border-t border-slate-100"><td className="py-1.5 text-slate-600">支出の見込み（{months}か月分の生活費＋まとまったお金）</td><td className="py-1.5 text-right font-bold text-slate-900">{man(shishutsu)}</td></tr>
              <tr className="border-t border-slate-100"><td className="py-1.5 text-slate-600">子の遺族基礎年金（{Z.nendo}の額）</td><td className="py-1.5 text-right font-bold text-slate-900">−{man(izoku)}</td></tr>
              <tr className="border-t border-slate-100"><td className="py-1.5 text-slate-600">預貯金・死亡退職金など</td><td className="py-1.5 text-right font-bold text-slate-900">−{man(num(yokin) * 10000)}</td></tr>
            </tbody>
          </table>
          <p className="rounded-lg bg-orange-50 px-3 py-2 text-[13px] font-bold text-slate-800">
            {moto
              ? <>いまの決まりでは、元配偶者が引き取って一緒に暮らすと子に遺族基礎年金は支給されないため、0円で数えています。2028年4月からは子に遺族基礎年金が出る予定です。見直し後の決まりで、いま亡くなったとして数えると、遺族基礎年金は約{man(izokuSofu)}、目安は<span className="text-orange-700">約{man(fusokuGo)}</span>です。</>
              : <>いまの決まりでは、元配偶者が引き取って一緒に暮らすことになると子に遺族基礎年金は支給されず、目安が約{man(izokuSofu)}増えます（2028年4月から見直しの予定）。</>}
          </p>
        </div>
      )}
      <p className="text-[11px] leading-relaxed text-slate-500">{DATA.rikon.keisanNote} 入れた内容は送られません。</p>
    </div>
  );
}
