'use client';

import { useEffect, useRef, useState } from 'react';
import { Calculator } from 'lucide-react';
import { trackEvent } from '@/lib/trackEvent';
import { kigenDate, shukuKnown, yasumiAke } from '@/components/souzoku/ZeroShinkokuCheck';
import DATA from '@/lib/souzoku/haifu-data.json';

/**
 * 相続税の申告が遅れたときの延滞税・無申告加算税（/guide/souzoku/shinkoku-okure、2026-11-17）。
 * 期限：知った日の翌日から10か月（国税庁 No.4205）。土日・祝日（2026・2027年）・12/29〜1/3 は翌日。
 * 延滞税（国税通則法60条・国税庁 No.9205・延滞税の計算方法・延滞税の割合）：
 *   法定納期限の翌日から納めた日までの日数。納期限の翌日から2か月を経過する日までは低い割合、その後は高い割合。
 *   納期限は、期限内に申告して納付だけ遅れたときは法定納期限、期限後の申告は申告書を出した日（国税庁「延滞税の計算方法」注2）。
 *   もとの税額は1万円未満切り捨て（通則法118条3項）。年ごと・割合ごとに 税額×割合×日数÷365（1円未満切り捨て）、
 *   合計の100円未満を切り捨て、1,000円未満は0（通則法119条4項）。
 * 無申告加算税（国税庁 No.2024・通則法66条）：調査の通知の前の自主的な申告は5%。通知の後は10%（50万円超15%、300万円超25%）、
 *   指摘の後は15%（20%、30%）。300万円の区分は令和6年1月1日以後に法定申告期限が来る分から。100円未満切り捨て、5,000円未満は0。
 * 答え合わせ：1,000万円・期限 2021/3/15・納付 2021/6/13（期限内申告）→ 2.5%×61日 41,780円＋8.8%×29日 69,917円＝111,600円。
 * 使われたかは lp_event_logs の event_name 'shinkoku_okure'（結果が出た1回目だけ）。入れた数字は送らない。
 */
const O = DATA.okure;
const DAY = 86400000;
const yen = (n: number) => `${Math.floor(n).toLocaleString('ja-JP')}円`;
const fmt = (d: Date) => `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
const toDate = (s: string) => { const d = s ? new Date(`${s}T00:00:00`) : null; return d && !Number.isNaN(d.getTime()) ? d : null; };
const days = (a: Date, b: Date) => Math.round((b.getTime() - a.getTime()) / DAY) + 1; // a〜b の両端を含む日数

function rateOf(y: number) {
  const hit = O.wariai.find((w) => w.y === y);
  if (hit) return { ...hit, kari: false };
  const last = O.wariai[O.wariai.length - 1];
  return y > last.y ? { ...last, y, kari: true } : null;
}
export const FIRST_YEAR = O.wariai[0].y;
/** 税額×割合（年%）×日数÷365 の1円未満切り捨て。小数の誤差を避けるため、割合を10倍して整数で計算する。 */
const entaiOf = (base: number, r: number, d: number) => Math.floor((base * Math.round(r * 10) * d) / 365000);

export type Kasan = 'mae' | 'tsuchigo' | 'shiteki';

export function calcOkure(shitta: Date, pay: Date, tax: number, kigengo: boolean, kasan: Kasan) {
  const houtei = yasumiAke(kigenDate(shitta, O.kigenN));
  const base = Math.floor(tax / 10000) * 10000;
  if (pay.getTime() <= houtei.getTime() || tax <= 0) return { houtei, late: 0, rows: [], entai: 0, kasan: 0, base, kari: false, mae: false };
  if (houtei.getFullYear() < FIRST_YEAR) return { houtei, late: -1, rows: [], entai: 0, kasan: 0, base, kari: false, mae: true };
  const nouki = kigengo ? pay : houtei; // 期限後の申告は、申告した日（＝この道具では納めた日と同じ）が納期限
  const loEnd = kigenDate(nouki, 2); // 納期限の翌日から2か月を経過する日
  const start = new Date(houtei.getTime() + DAY);
  const rows: { y: number; kind: 'lo' | 'hi'; r: number; d: number; amt: number; kari: boolean }[] = [];
  let kari = false;
  for (let y = start.getFullYear(); y <= pay.getFullYear(); y++) {
    const ys = new Date(Math.max(start.getTime(), new Date(y, 0, 1).getTime()));
    const ye = new Date(Math.min(pay.getTime(), new Date(y, 11, 31).getTime()));
    if (ye < ys) continue;
    const rt = rateOf(y)!;
    if (rt.kari) kari = true;
    const loE = new Date(Math.min(ye.getTime(), loEnd.getTime()));
    if (loE >= ys) { const d = days(ys, loE); rows.push({ y, kind: 'lo', r: rt.lo, d, amt: entaiOf(base, rt.lo, d), kari: rt.kari }); }
    const hiS = new Date(Math.max(ys.getTime(), loEnd.getTime() + DAY));
    if (ye >= hiS) { const d = days(hiS, ye); rows.push({ y, kind: 'hi', r: rt.hi, d, amt: entaiOf(base, rt.hi, d), kari: rt.kari }); }
  }
  let entai = Math.floor(rows.reduce((s, r) => s + r.amt, 0) / 100) * 100;
  if (entai < 1000) entai = 0;
  let k = 0;
  if (kigengo) {
    const t = O.kasan.find((x) => x.key === kasan)!;
    const shin = houtei.getTime() >= new Date(2024, 0, 1).getTime();
    let prev = 0;
    for (const r of t.rates) {
      const upto = r.upto === null || (!shin && r.upto === 3000000) ? Infinity : r.upto;
      if (base > prev) k += ((Math.min(base, upto) - prev) * r.r) / 100;
      prev = upto;
      if (upto === Infinity) break;
    }
    k = Math.floor(k / 100) * 100;
    if (k < 5000) k = 0;
  }
  return { houtei, late: days(start, pay), rows, entai, kasan: k, base, kari, mae: false };
}

const INPUT = 'w-full rounded-xl bg-white px-3 py-2.5 text-[16px] font-bold text-slate-900 ring-1 ring-slate-300 outline-none focus:ring-2 focus:ring-sky-600';

export default function OkureKeisanCalc({ lpId }: { lpId: string }) {
  const [shitta, setShitta] = useState('');
  const [pay, setPay] = useState('');
  const [taxMan, setTaxMan] = useState('');
  const [kigengo, setKigengo] = useState(true);
  const [kasan, setKasan] = useState<Kasan>('mae');
  const sent = useRef(false);

  const n = Number(taxMan.replace(/[,，\s]/g, ''));
  const tax = Number.isFinite(n) && n > 0 ? Math.round(n * 10000) : 0;
  const sd = toDate(shitta);
  const pd = toDate(pay);
  const res = sd && pd && tax > 0 ? calcOkure(sd, pd, tax, kigengo, kasan) : null;
  const ready = !!res;

  useEffect(() => {
    if (!ready || sent.current) return;
    sent.current = true;
    void trackEvent({ lp_id: lpId, event_name: 'shinkoku_okure', component_id: 'shinkoku-okure' });
  }, [ready, lpId]);

  return (
    <div className="flex flex-col gap-4 rounded-2xl border-2 border-sky-200 bg-sky-50/60 p-4">
      <p className="flex items-center gap-2 text-[17px] font-black text-slate-900">
        <Calculator size={22} className="text-sky-700" aria-hidden="true" />延滞税と無申告加算税の計算<span className="text-[12px] font-bold text-sky-700">無料</span>
      </p>
      <div className="grid grid-cols-2 gap-2">
        <label className="flex flex-col gap-1 text-[12px] font-black text-slate-700">① 亡くなったことを知った日
          <input type="date" value={shitta} onChange={(e) => setShitta(e.target.value)} className={INPUT} />
        </label>
        <label className="flex flex-col gap-1 text-[12px] font-black text-slate-700">{kigengo ? '② 申告して納める日' : '② 納める日'}
          <input type="date" value={pay} onChange={(e) => setPay(e.target.value)} className={INPUT} />
        </label>
      </div>
      <label className="flex flex-col gap-1 text-[13px] font-black text-slate-700">③ 納める相続税（万円）
        <input inputMode="numeric" value={taxMan} placeholder="300" onChange={(e) => setTaxMan(e.target.value)} className={INPUT} />
      </label>
      <label className="flex flex-col gap-1 text-[13px] font-black text-slate-700">④ 申告は
        <select value={kigengo ? '1' : '0'} onChange={(e) => setKigengo(e.target.value === '1')} className={INPUT}>
          <option value="1">期限を過ぎてから出す</option>
          <option value="0">期限内に出した（納めるのだけ遅れた）</option>
        </select>
      </label>
      {kigengo && (
        <label className="flex flex-col gap-1 text-[13px] font-black text-slate-700">⑤ 税務署の調査は
          <select value={kasan} onChange={(e) => setKasan(e.target.value as Kasan)} className={INPUT}>
            {O.kasan.map((k) => <option key={k.key} value={k.key}>{k.h}</option>)}
          </select>
        </label>
      )}

      {res && res.late === 0 && <p className="rounded-xl bg-emerald-50 p-3 text-[14px] font-bold text-emerald-900 ring-1 ring-emerald-200" aria-live="polite">期限（{fmt(res.houtei)}）までなので、延滞税も加算税もかかりません。</p>}
      {res && res.late < 0 && <p className="rounded-xl bg-white p-3 text-[13px] font-bold text-slate-700 ring-1 ring-slate-200" aria-live="polite">期限が{FIRST_YEAR}年より前の分は、この道具では計算しません。</p>}
      {res && res.late > 0 && res.base < 10000 && <p className="rounded-xl bg-emerald-50 p-3 text-[14px] font-bold text-emerald-900 ring-1 ring-emerald-200" aria-live="polite">もとの税額が1万円未満なので、延滞税も加算税もかかりません。</p>}
      {res && res.late > 0 && res.base >= 10000 && (
        <div className="flex flex-col gap-1.5" aria-live="polite">
          <p className="text-[12px] font-bold text-slate-700">申告の期限 {fmt(res.houtei)}・遅れ {res.late}日（もとの税額 {yen(res.base)}）</p>
          <div className="overflow-hidden rounded-xl bg-white ring-1 ring-slate-200">
            <table className="w-full text-[12px]">
              <thead className="bg-slate-50 text-[11px] text-slate-600"><tr><th className="px-2 py-1.5 text-left">期間</th><th className="px-2 py-1.5 text-right">割合</th><th className="px-2 py-1.5 text-right">日数</th><th className="px-2 py-1.5 text-right">額</th></tr></thead>
              <tbody>
                {res.rows.map((r) => (
                  <tr key={`${r.y}${r.kind}`} className="border-t border-slate-100">
                    <td className="px-2 py-1.5">{r.y}年・{r.kind === 'lo' ? '2か月まで' : '2か月の後'}{r.kari && '（仮）'}</td>
                    <td className="px-2 py-1.5 text-right">{r.r}%</td><td className="px-2 py-1.5 text-right">{r.d}日</td><td className="px-2 py-1.5 text-right font-bold">{yen(r.amt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="grid grid-cols-2 gap-1.5 text-center text-[12px]">
            <span className="rounded-lg bg-white py-2 text-slate-700 ring-1 ring-slate-200">延滞税<b className="block text-[16px] text-slate-900">{yen(res.entai)}</b></span>
            <span className="rounded-lg bg-white py-2 text-slate-700 ring-1 ring-slate-200">無申告加算税<b className="block text-[16px] text-slate-900">{kigengo ? yen(res.kasan) : 'かからない'}</b></span>
          </p>
          <p className="rounded-xl bg-orange-600 px-3 py-3 text-center text-white">
            <span className="block text-[12px] opacity-90">相続税 {yen(tax)} に足して納める額</span>
            <span className="text-[22px] font-black">{yen(res.entai + res.kasan)}</span>
          </p>
          {kigengo && kasan === 'mae' && pd!.getTime() <= kigenDate(res.houtei, 1).getTime() && <p className="text-[12px] font-bold text-emerald-800">{O.menjoShort}</p>}
          {!shukuKnown(res.houtei) && <p className="text-[11px] font-bold text-slate-600">期限の年の祝日は見ていません。祝日に当たるときは翌日が期限です。</p>}
          {res.kari && <p className="text-[11px] font-bold text-orange-700">令和9年以後の日は、令和8年の割合で仮に計算しています。</p>}
        </div>
      )}
      <p className="text-[11px] leading-relaxed text-slate-500">期限が土日・祝日・年末年始に当たるときは翌日にしています（祝日は2026・2027年の分）。期限後の申告は、申告した日に納める前提です。重加算税、過去5年以内に加算税を課された分の上乗せは入れていません。入れた数字は送られません。</p>
    </div>
  );
}
