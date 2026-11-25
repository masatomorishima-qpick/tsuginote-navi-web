'use client';

import { useEffect, useRef, useState } from 'react';
import { CalendarCheck } from 'lucide-react';
import { trackEvent } from '@/lib/trackEvent';

/**
 * 源泉所得税の納期の特例：申請書を出す月から、いつ払う給与から年2回になるかと、最初の納付期限の目安（2026-11-25）。
 * 国税庁 No.2505：申請書を提出した月の翌月に源泉徴収する所得税から特例の対象。1月〜6月分は7月10日、7月〜12月分は翌年1月20日。
 *   例（同ページの表）：2月中に提出 → 2月支給分の納期限は3月10日、3月〜6月支給分は7月10日。
 * 国税庁 A2-8：提出した月の翌月末日までに通知がなければ、翌月末日に承認があったものとされる。
 * 期限が土日・祝日に当たるときは休み明けの日（No.2505）。祝日は国民の祝日の決まり（固定の日・ハッピーマンデー・振替休日）で計算。
 *   期限は10日・20日だけなので、春分・秋分の日と国民の休日は当たらない。却下されたときは通常どおり（翌月10日）。
 * 使われたかは lp_event_logs の event_name 'noki_tokurei'（1回目だけ）。入れた月は送らない。
 */
const MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const WD = ['日', '月', '火', '水', '木', '金', '土'];
const FIXED = ['1-1', '2-11', '2-23', '4-29', '5-3', '5-4', '5-5', '8-11', '11-3', '11-23'];

/** n番目の月曜日（ハッピーマンデー） */
function nthMonday(y: number, m: number, n: number): number {
  const first = new Date(Date.UTC(y, m - 1, 1)).getUTCDay();
  return 1 + ((8 - first) % 7) + (n - 1) * 7;
}

function isShukujitsu(y: number, m: number, d: number): boolean {
  if (FIXED.includes(`${m}-${d}`)) return true;
  if (m === 1 && d === nthMonday(y, 1, 2)) return true; // 成人の日
  if (m === 7 && d === nthMonday(y, 7, 3)) return true; // 海の日
  if (m === 9 && d === nthMonday(y, 9, 3)) return true; // 敬老の日
  if (m === 10 && d === nthMonday(y, 10, 2)) return true; // スポーツの日
  return false;
}

function isFurikae(t: number): boolean {
  // 祝日が日曜なら、その後の最初の祝日でない日が振替休日
  let u = t - 86400000;
  while (true) {
    const x = new Date(u);
    if (!isShukujitsu(x.getUTCFullYear(), x.getUTCMonth() + 1, x.getUTCDate())) return false;
    if (x.getUTCDay() === 0) return true;
    u -= 86400000;
  }
}

/** 土日・祝日なら休み明けの日へ */
function kigen(y: number, m: number, d: number): string {
  let t = Date.UTC(y, m - 1, d);
  for (;;) {
    const x = new Date(t);
    const off = [0, 6].includes(x.getUTCDay()) || isShukujitsu(x.getUTCFullYear(), x.getUTCMonth() + 1, x.getUTCDate()) || isFurikae(t);
    if (!off) break;
    t += 86400000;
  }
  const x = new Date(t);
  const moved = t !== Date.UTC(y, m - 1, d);
  return `${x.getUTCFullYear()}年${x.getUTCMonth() + 1}月${x.getUTCDate()}日（${WD[x.getUTCDay()]}）${moved ? '※' : ''}`;
}

function calc(y: number, m: number) {
  // 提出した月の給与：通常どおり翌月10日
  const ny = m === 12 ? y + 1 : y;
  const nm = m === 12 ? 1 : m + 1;
  // 特例が始まる月（提出の翌月）
  const sy = ny, sm = nm;
  // 最初の特例の納付期限：始まる月が1〜6月ならその年の7月10日、7〜12月なら翌年1月20日
  const first = sm <= 6 ? { y: sy, m: 7, d: 10, range: `${sm}月〜6月` } : { y: sy + 1, m: 1, d: 20, range: `${sm}月〜12月` };
  return { tsujo: kigen(ny, nm, 10), start: `${sy}年${sm}月`, first: kigen(first.y, first.m, first.d), range: first.range };
}

export default function NokiTokurei({ lpId }: { lpId: string }) {
  const [ym, setYm] = useState('');
  const sent = useRef(false);
  const mt = /^(\d{4})-(\d{1,2})$/.exec(ym);
  const y = mt ? Number(mt[1]) : 0;
  const m = mt ? Number(mt[2]) : 0;
  const ok = y >= 2020 && y <= 2100 && MONTHS.includes(m);
  const r = ok ? calc(y, m) : null;

  useEffect(() => {
    if (ok && !sent.current) {
      sent.current = true;
      void trackEvent({ lp_id: lpId, event_name: 'noki_tokurei', metadata: {} });
    }
  }, [ok, lpId]);

  const thisYear = 2026;
  const options: string[] = [];
  for (const yy of [thisYear, thisYear + 1]) for (const mm of MONTHS) options.push(`${yy}-${mm}`);

  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-sky-50 p-4 ring-1 ring-sky-200">
      <p className="flex items-center gap-2 text-[15px] font-black text-slate-900">
        <CalendarCheck size={20} className="text-sky-700" aria-hidden="true" />申請書を出す月から計算
      </p>
      <label className="flex flex-col gap-1 text-[11px] font-bold text-slate-600">納期の特例の申請書を出す月
        <select value={ym} onChange={(ev) => setYm(ev.target.value)} className="rounded-lg bg-white px-2 py-2.5 text-[15px] font-bold text-slate-900 ring-1 ring-slate-300 outline-none">
          <option value="">選んでください</option>
          {options.map((o) => { const [a, b] = o.split('-'); return <option key={o} value={o}>{a}年{b}月</option>; })}
        </select>
      </label>
      <ol className="grid gap-2" aria-live="polite">
        <li className="flex flex-col rounded-xl bg-white p-3 ring-1 ring-slate-200">
          <span className="text-[12px] text-slate-600">出した月に払う給与の分</span>
          <span className="text-[18px] font-black text-slate-900">{r ? `${r.tsujo}まで` : '―'}</span>
          <span className="text-[11px] text-slate-500">いつもどおり翌月10日</span>
        </li>
        <li className="flex flex-col rounded-xl bg-white p-3 ring-1 ring-slate-200">
          <span className="text-[12px] text-slate-600">年2回にまとめて納める対象になる給与</span>
          <span className="text-[18px] font-black text-slate-900">{r ? `${r.start}に払う分から` : '―'}</span>
          <span className="text-[11px] text-slate-500">出した月の翌月から</span>
        </li>
        <li className="flex flex-col rounded-xl bg-white p-3 ring-2 ring-orange-300">
          <span className="text-[12px] text-slate-600">最初にまとめて納める期限</span>
          <span className="text-[20px] font-black text-orange-600">{r ? r.first : '―'}</span>
          {r && <span className="text-[11px] text-slate-500">{r.range}に払う給与の分</span>}
        </li>
      </ol>
      <p className="text-[11px] leading-relaxed text-slate-500">国税庁の案内の決まりから出した目安です。期限が土日・祝日に当たるときは休み明けの日になり、※をつけています。却下されたときは毎月10日のままです。</p>
    </div>
  );
}
