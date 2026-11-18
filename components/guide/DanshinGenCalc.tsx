'use client';

import { useEffect, useRef, useState } from 'react';
import { Home } from 'lucide-react';
import { trackEvent } from '@/lib/trackEvent';
import DATA from '@/lib/hoken/haifu-data.json';

/**
 * 住宅ローンの団信で減らせる死亡保障の目安（/guide/shisan-kanri/hoken-minaoshi-danshin、2026-11-19）。
 * 考え方：必要保障額＝遺族の支出の見込み−遺族の収入の見込み（生命保険文化センター）。同センターの例では住居費（家賃＋共益費）を別枠で見込む。
 *   団信に入ったローンは、加入者が亡くなると保険金で返され、以後の返済が要らない（住宅金融支援機構）。
 *   → 支出の見込みの住居費を「ローンのあとも残る住まいのお金」に置き換えた差＝減らせる目安。
 *   減らせる目安＝max(0, (見込んでいた住居費の月額 − 残る住まいのお金の月額)) × 12 × 年数。
 *   例：月10万円を25年見込んでいた、残る分が月2.5万円 → (100,000−25,000)×12×25＝22,500,000円。
 * 使われたかは lp_event_logs の event_name 'danshin_gen'（1回目だけ）。入れた数字は送らない。
 */
export function genGaku(mikomi: number, nokoru: number, nen: number) {
  return Math.max(0, mikomi - nokoru) * 12 * nen;
}

const num = (s: string) => {
  const n = Number(s.replace(/[,，\s]/g, ''));
  return Number.isFinite(n) && n > 0 ? n : 0;
};
const man = (v: number) => `${(Math.round(v / 1000) / 10).toLocaleString('ja-JP')}万円`;
const INPUT = 'w-full min-w-0 rounded-xl bg-white px-3 py-2.5 text-[16px] font-bold text-slate-900 ring-1 ring-slate-300 outline-none focus:ring-2 focus:ring-sky-600';

export default function DanshinGenCalc({ lpId }: { lpId: string }) {
  const [mikomi, setMikomi] = useState('');
  const [nokoru, setNokoru] = useState('');
  const [nen, setNen] = useState('');
  const [ima, setIma] = useState('');
  const sent = useRef(false);
  const touched = useRef(false);

  useEffect(() => {
    if (!touched.current || sent.current) return;
    sent.current = true;
    void trackEvent({ lp_id: lpId, event_name: 'danshin_gen', component_id: 'danshin-gen' });
  });

  const m = num(mikomi) * 10000;
  const n = num(nokoru) * 10000;
  const y = Math.min(num(nen), 60);
  const gen = m > 0 && y > 0 ? genGaku(m, n, y) : null;
  const imaYen = num(ima) * 10000;
  const on = (f: (v: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => { touched.current = true; f(e.target.value); };

  return (
    <div className="flex flex-col gap-4 rounded-2xl border-2 border-sky-200 bg-sky-50/60 p-4">
      <p className="flex items-center gap-2 text-[17px] font-black text-slate-900">
        <Home size={22} className="text-sky-700" aria-hidden="true" />団信で減らせる死亡保障の計算<span className="text-[12px] font-bold text-sky-700">無料</span>
      </p>
      <div className="grid gap-2.5">
        <label className="flex flex-col gap-1 text-[11px] font-bold text-slate-600">死亡保障で見込んでいた住居費（月・万円。家賃なら家賃＋共益費）
          <input inputMode="decimal" value={mikomi} onChange={on(setMikomi)} placeholder="例：10" className={INPUT} />
        </label>
        <label className="flex flex-col gap-1 text-[11px] font-bold text-slate-600">見込んでいた年数（年。配偶者が住み続ける年数など）
          <input inputMode="numeric" value={nen} onChange={on(setNen)} placeholder="例：25" className={INPUT} />
        </label>
        <label className="flex flex-col gap-1 text-[11px] font-bold text-slate-600">ローンのあとも残る住まいのお金（月・万円。管理費・修繕積立金・固定資産税÷12 など）
          <input inputMode="decimal" value={nokoru} onChange={on(setNokoru)} placeholder="例：2.5" className={INPUT} />
        </label>
        <label className="flex flex-col gap-1 text-[11px] font-bold text-slate-600">今の死亡保障の合計（万円。分かれば）
          <input inputMode="decimal" value={ima} onChange={on(setIma)} placeholder="例：3000" className={INPUT} />
        </label>
      </div>
      {gen !== null && (
        <div className="flex flex-col gap-1.5 rounded-xl bg-white p-3 ring-1 ring-slate-200" aria-live="polite">
          <p className="text-[13px] text-slate-600">死亡保障から減らせる目安</p>
          <p className="text-[24px] font-black text-orange-700">約{man(gen)}</p>
          {gen === 0 && <p className="text-[12px] font-bold text-orange-800">残る住まいのお金が、見込んでいた住居費以上なので、減らせる額はありません</p>}
          <p className="text-[12px] text-slate-600">（{(m / 10000).toLocaleString('ja-JP')}万円 − {(n / 10000).toLocaleString('ja-JP')}万円）× 12か月 × {y}年</p>
          {imaYen > 0 && (
            <p className="text-[14px] font-bold text-slate-900">見直し後の死亡保障の目安：約{man(Math.max(0, imaYen - gen))}
              {imaYen - gen < 0 && <span className="block text-[12px] font-bold text-orange-800">減らせる目安が、今の保障の額を超えました。教育費や生活費の見込みも入れて、計算し直してください</span>}
            </p>
          )}
        </div>
      )}
      <p className="text-[11px] leading-relaxed text-slate-500">{DATA.danshin.keisanNote} 入れた数字は送られません。</p>
    </div>
  );
}
