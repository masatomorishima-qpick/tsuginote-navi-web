'use client';

import { useEffect, useRef, useState } from 'react';
import { Calculator } from 'lucide-react';
import { trackEvent } from '@/lib/trackEvent';

/**
 * 保険の一覧表のページ：一覧表の「月額の合計」から、これから払う総額を出す（2026-11-24 v5）。
 * 来る人の課題は「家の保険を1枚に整理する」（検索語に「見直し」「相談」は0）。整理した合計を
 * 「これから払う総額」に置き換えると、見直すかどうかを考えるきっかけになる → すぐ下の相談の出口へ。
 * 総額＝月額の合計×12×あと払う年数（ただの掛け算。更新で上がる分・払い終わった保険は含まない、と画面に書く）。
 * 使われたかは lp_event_logs の event_name 'hoken_ichiran_sogaku'（1回目だけ）。入れた数字は送らない。
 */
const yen = (n: number) => `${Math.round(n).toLocaleString('ja-JP')}円`;
const num = (s: string) => Number(s.normalize('NFKC').replace(/[^\d]/g, ''));

export default function HokenIchiranSogaku({ lpId }: { lpId: string }) {
  const [getsu, setGetsu] = useState('');
  const [nen, setNen] = useState('');
  const sent = useRef(false);
  const total = num(getsu) * 12 * num(nen);
  useEffect(() => {
    if (total > 0 && !sent.current) {
      sent.current = true;
      void trackEvent({ lp_id: lpId, event_name: 'hoken_ichiran_sogaku', metadata: {} });
    }
  }, [total, lpId]);
  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-sky-50 p-4 ring-1 ring-sky-200">
      <p className="flex items-center gap-2 text-[15px] font-black text-slate-900">
        <Calculator size={20} className="text-sky-700" aria-hidden="true" />一覧表の合計から、これから払う総額
      </p>
      <div className="grid grid-cols-2 gap-2">
        <label className="flex flex-col gap-1 text-[11px] font-bold text-slate-600">月額の合計
          <span className="flex items-center gap-1 rounded-lg bg-white px-2 ring-1 ring-slate-300">
            <input value={getsu} onChange={(e) => setGetsu(e.target.value)} inputMode="numeric" placeholder="25000" className="w-full bg-transparent py-2 text-right text-[16px] font-black text-slate-900 outline-none placeholder:font-normal placeholder:text-slate-400" />円
          </span>
        </label>
        <label className="flex flex-col gap-1 text-[11px] font-bold text-slate-600">あと払う年数
          <span className="flex items-center gap-1 rounded-lg bg-white px-2 ring-1 ring-slate-300">
            <input value={nen} onChange={(e) => setNen(e.target.value)} inputMode="numeric" placeholder="20" className="w-full bg-transparent py-2 text-right text-[16px] font-black text-slate-900 outline-none placeholder:font-normal placeholder:text-slate-400" />年
          </span>
        </label>
      </div>
      <div className="rounded-xl bg-white p-3 text-center ring-1 ring-slate-200" aria-live="polite">
        <p className="text-[12px] text-slate-600">これから払う保険料の総額</p>
        <p className="text-[26px] font-black text-slate-900">{total > 0 ? yen(total) : '―'}</p>
      </div>
      <p className="text-[11px] leading-relaxed text-slate-500">月額の合計×12×年数の目安です。更新で上がる分や、途中で払い終わる保険は入っていません。</p>
    </div>
  );
}
