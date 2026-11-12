'use client';

import { useEffect, useRef, useState } from 'react';
import { CalendarClock, Check, ListChecks, Search, Wallet } from 'lucide-react';
import { trackEvent } from '@/lib/trackEvent';
import DATA from '@/lib/souzoku/haifu-data.json';

/**
 * 相続財産の調べ方：手がかりのある財産を選ぶと、調べる窓口・取る証明・手数料の目安が出る＋期限（/guide/souzoku/zaisan-shirabekata、2026-11-13）。
 * 窓口と手数料：法務省（所有不動産記録証明）・横浜市（名寄帳）・証券保管振替機構（2026/10/1 改定の費用）・生命保険協会・
 *   全国銀行個人信用情報センター（2026年10月版）・CIC・JICC・デジタル庁（相続時の口座照会）・みずほ銀行（残高証明の例）。
 * 期限：裁判所（相続放棄は知った時から3か月）・国税庁 No.4205（申告は10か月）。同じ日付で数えた目安（相続の手続きチェックリストと同じ）。
 * 手数料の合計は、公式で金額を確かめられたもの（yen > 0）だけを足す。
 * 使われたかは lp_event_logs の event_name 'zaisan_shirabe'（1回目だけ）。入れた内容は送らない。
 */
const D = DATA.shirabe;

function addMonths(d: Date, n: number) {
  const r = new Date(d.getFullYear(), d.getMonth() + n, d.getDate());
  if (r.getDate() !== d.getDate()) return new Date(d.getFullYear(), d.getMonth() + n + 1, 0);
  return r;
}
const fmt = (d: Date) => `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
const yen = (n: number) => `${n.toLocaleString('ja-JP')}円`;

type Row = (typeof D.items)[number]['rows'][number] & { yenIchiranzu?: number };

/** 選んだ財産の、金額が確かめられた手数料の合計。ichiranzu は法定相続情報一覧図があるか。 */
export function sumHiyou(keys: string[], ichiranzu: boolean) {
  let total = 0;
  let unknown = 0;
  for (const it of D.items) {
    if (!keys.includes(it.key)) continue;
    for (const r of it.rows as Row[]) {
      const v = ichiranzu && r.yenIchiranzu ? r.yenIchiranzu : r.yen;
      if (v > 0) total += v;
      else unknown += 1;
    }
  }
  return { total, unknown };
}

export default function ZaisanShirabeCheck({ lpId }: { lpId: string }) {
  const [sel, setSel] = useState<string[]>(['yokin', 'fudosan']);
  const [ichiranzu, setIchiranzu] = useState(false);
  const [day, setDay] = useState('');
  const sent = useRef(false);
  const touched = useRef(false);

  useEffect(() => {
    if (!touched.current || sent.current) return;
    sent.current = true;
    void trackEvent({ lp_id: lpId, event_name: 'zaisan_shirabe', component_id: 'zaisan-shirabe' });
  });

  const toggle = (k: string) => { touched.current = true; setSel((s) => (s.includes(k) ? s.filter((x) => x !== k) : [...s, k])); };
  const base = day ? new Date(`${day}T00:00:00`) : null;
  const valid = !!base && !Number.isNaN(base.getTime());
  const h = sumHiyou(sel, ichiranzu);
  const items = D.items.filter((it) => sel.includes(it.key));

  return (
    <div className="flex flex-col gap-4 rounded-2xl border-2 border-sky-200 bg-sky-50/60 p-4">
      <p className="flex items-center gap-2 text-[17px] font-black text-slate-900">
        <Search size={22} className="text-sky-700" aria-hidden="true" />調べる先を一覧に<span className="text-[12px] font-bold text-sky-700">無料</span>
      </p>

      <div className="flex flex-col gap-1.5">
        <p className="text-[13px] font-black text-slate-700">手がかりのある財産を選ぶ（いくつでも）</p>
        <div className="grid grid-cols-2 gap-1.5">
          {D.items.map((it) => {
            const on = sel.includes(it.key);
            return (
              <button key={it.key} type="button" aria-pressed={on} onClick={() => toggle(it.key)}
                className={`flex items-center gap-2 rounded-xl bg-white p-2.5 text-left ring-1 ${on ? 'ring-emerald-300' : 'ring-slate-200'}`}>
                <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md ring-1 ${on ? 'bg-emerald-600 text-white ring-emerald-600' : 'bg-white text-transparent ring-slate-300'}`}><Check size={14} aria-hidden="true" /></span>
                <span className="text-[13px] font-bold text-slate-900">{it.h}</span>
              </button>
            );
          })}
        </div>
        <button type="button" aria-pressed={ichiranzu} onClick={() => { touched.current = true; setIchiranzu(!ichiranzu); }}
          className={`flex w-full items-center gap-2.5 rounded-xl bg-white p-2.5 text-left ring-1 ${ichiranzu ? 'ring-emerald-300' : 'ring-slate-200'}`}>
          <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md ring-1 ${ichiranzu ? 'bg-emerald-600 text-white ring-emerald-600' : 'bg-white text-transparent ring-slate-300'}`}><Check size={14} aria-hidden="true" /></span>
          <span className="text-[13px] font-bold text-slate-900">法定相続情報一覧図の写しがある</span>
        </button>
      </div>

      {items.length > 0 && (
        <div className="flex flex-col gap-2" aria-live="polite">
          <p className="flex items-center gap-1.5 text-[15px] font-black text-orange-700"><ListChecks size={18} aria-hidden="true" />調べる先 {items.reduce((a, it) => a + it.rows.length, 0)}か所</p>
          {items.map((it) => (
            <div key={it.key} className="flex flex-col gap-1.5 rounded-xl bg-white p-3 ring-1 ring-slate-200">
              <p className="text-[14px] font-black text-slate-900">{it.h}<span className="ml-1.5 text-[11px] font-bold text-slate-500">手がかり：{it.tegakari}</span></p>
              <ul className="flex flex-col gap-2">
                {(it.rows as Row[]).map((r) => (
                  <li key={r.saki} className="flex flex-col border-t border-slate-100 pt-1.5 text-[12px]">
                    <span className="text-[13px] font-bold text-sky-800">{r.saki}</span>
                    <span className="text-slate-800">{r.shomei}</span>
                    <span className="text-slate-500">費用：{ichiranzu && r.yenIchiranzu ? `${yen(r.yenIchiranzu)}（一覧図あり）` : r.hiyou}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <p className="flex items-center gap-1.5 rounded-xl bg-white p-3 text-[13px] text-slate-700 ring-1 ring-slate-200">
            <Wallet size={18} className="shrink-0 text-orange-700" aria-hidden="true" />
            <span>手数料の合計 <b className="text-[17px] text-orange-700">{yen(h.total)}</b>{h.unknown > 0 && `＋窓口で確かめる分 ${h.unknown}か所`}</span>
          </p>
        </div>
      )}

      <label className="flex flex-col gap-1.5">
        <span className="flex items-center gap-1.5 text-[13px] font-black text-slate-700"><CalendarClock size={16} aria-hidden="true" />亡くなった日（相続を知った日）</span>
        <input type="date" value={day} onChange={(e) => { touched.current = true; setDay(e.target.value); }} aria-label="亡くなった日"
          className="rounded-xl bg-white px-3 py-3 text-[17px] font-bold text-slate-900 ring-1 ring-slate-300 outline-none focus:ring-2 focus:ring-sky-600" />
      </label>
      {valid && (
        <ul className="flex flex-col gap-1.5" aria-live="polite">
          {D.kigen.map((k) => (
            <li key={k.h} className="rounded-xl bg-orange-50 p-3 text-[14px] font-black text-orange-800 ring-1 ring-orange-200">
              {k.h}：{fmt(addMonths(base!, k.n))}まで（目安）
              <span className="mt-0.5 block text-[11px] font-bold text-orange-700">{k.n}か月以内。{k.d}</span>
            </li>
          ))}
        </ul>
      )}
      <p className="text-[11px] leading-relaxed text-slate-500">{D.hiyouNote}期限は同じ日付で数えた目安で、土日・祝日なら翌日になることがあります。入れた内容は送られません。</p>
    </div>
  );
}
