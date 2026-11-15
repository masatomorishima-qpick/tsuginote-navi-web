'use client';

import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, Calculator } from 'lucide-react';
import { trackEvent } from '@/lib/trackEvent';
import DATA from '@/lib/souzoku/haifu-data.json';

/**
 * 相次相続控除の計算（/guide/souzoku/souji-souzoku-kojo、2026-11-16）。
 * 決まり：国税庁 No.4168（令和8年4月1日現在法令等）と同じ質疑応答。
 *   控除額 ＝ A × C/(B−A) × D/C × (10−E)/10。C/(B−A) が 100/100 を超えるときは 100/100。
 *   E は前の相続から今回の相続までの年数（1年未満は切り捨て）。10年以上なら使えない。A が0なら控除は出ない。
 * 答え合わせ：国税庁の例 A=1,000万 B=1億5,000万 C=1億8,000万 D=9,000万 E=4 → 300万円。
 * 使われたかは lp_event_logs の event_name 'souji_kojo'（1回目だけ）。入れた日付・数字は送らない。
 */
const D = DATA.souji;
const yen = (n: number) => `${n.toLocaleString('ja-JP')}円`;
type YMD = { y: number; m: number; d: number };
const toDate = (s: string): YMD | null => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  return m ? { y: +m[1], m: +m[2], d: +m[3] } : null;
};
// 全角の数字・小数点も半角に直して読む
const hankaku = (s: string) => s.replace(/[０-９．]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0));
const num = (s: string) => {
  const v = Number(hankaku(s).replace(/[,，\s]/g, ''));
  return s.trim() !== '' && Number.isFinite(v) && v >= 0 ? v * 10000 : null;
};

/** 前の相続の日から今回の相続の日までの満年数（1年未満は切り捨て）。 */
export function nensu(mae: YMD, ima: YMD) {
  let a = ima.y - mae.y;
  if (ima.m < mae.m || (ima.m === mae.m && ima.d < mae.d)) a -= 1;
  return a;
}

/** 控除の額。円で返す。 */
export function soujiKojo(A: number, B: number, C: number, Dd: number, E: number) {
  if (A <= 0 || E >= 10 || E < 0 || C <= 0) return { wari1: 0, wari2: 0, nokori: 0, gaku: 0 };
  const wari1 = B - A <= 0 ? 1 : Math.min(1, C / (B - A));
  const wari2 = Dd / C;
  const nokori = (10 - E) / 10;
  // 小数の誤差で1円下がらないよう、掛け算を先にして最後に割る
  const gaku = (A * wari1 * Dd * (10 - E)) / (C * 10);
  return { wari1, wari2, nokori, gaku: Math.floor(gaku + 1e-6) };
}

const INPUT = 'w-full min-w-0 rounded-xl bg-white px-3 py-2.5 text-[16px] font-bold text-slate-900 ring-1 ring-slate-300 outline-none focus:ring-2 focus:ring-sky-600';
const pct = (x: number) => `${Math.round(x * 1000) / 10}%`;

export default function SoujiKojoCalc({ lpId }: { lpId: string }) {
  const [mae, setMae] = useState('');
  const [ima, setIma] = useState('');
  const [v, setV] = useState({ A: '', B: '', C: '', D: '' });
  const sent = useRef(false);
  const m = toDate(mae);
  const i = toDate(ima);
  const dateOk = !!m && !!i && Date.UTC(i.y, i.m - 1, i.d) > Date.UTC(m.y, m.m - 1, m.d);
  const E = dateOk ? nensu(m!, i!) : -1;
  const A = num(v.A), B = num(v.B), C = num(v.C), Dd = num(v.D);
  const ok = dateOk && A !== null && B !== null && C !== null && Dd !== null && C > 0;
  const dOver = ok && Dd! > C!;
  const r = ok ? soujiKojo(A!, B!, C!, Dd!, E) : null;
  const gyaku = !!m && !!i && !dateOk;
  const riyu = E >= 10 ? '前の相続から10年以上たっているため' : A === 0 ? '前の相続で納めた相続税（A）が0円のため' : 'あなたの純資産（D）が0円か、ごく小さいため';

  useEffect(() => {
    if (!ok || sent.current) return;
    sent.current = true;
    void trackEvent({ lp_id: lpId, event_name: 'souji_kojo', component_id: 'souji-kojo' });
  }, [ok, lpId]);

  const field = (k: 'A' | 'B' | 'C' | 'D', label: string, ph: string) => (
    <label className="flex min-w-0 flex-col gap-1 text-[11px] font-bold text-slate-600">
      <span><b className="mr-1 text-sky-700">{k}</b>{label}</span>
      <input inputMode="decimal" value={v[k]} placeholder={ph} onChange={(e) => setV({ ...v, [k]: e.target.value })} className={INPUT} />
    </label>
  );

  return (
    <div className="flex flex-col gap-4 rounded-2xl border-2 border-sky-200 bg-sky-50/60 p-4">
      <p className="flex items-center gap-2 text-[17px] font-black text-slate-900">
        <Calculator size={22} className="text-sky-700" aria-hidden="true" />相次相続控除の計算<span className="text-[12px] font-bold text-sky-700">無料</span>
      </p>
      <div className="grid grid-cols-2 gap-2">
        <label className="flex min-w-0 flex-col gap-1 text-[11px] font-bold text-slate-600">前の相続の日
          <input type="date" value={mae} min="1990-01-01" max="2040-12-31" onChange={(e) => setMae(e.target.value)} className={`${INPUT} px-2 text-[15px]`} />
        </label>
        <label className="flex min-w-0 flex-col gap-1 text-[11px] font-bold text-slate-600">今回の相続の日
          <input type="date" value={ima} min="1990-01-01" max="2040-12-31" onChange={(e) => setIma(e.target.value)} className={`${INPUT} px-2 text-[15px]`} />
        </label>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {field('A', '前の相続税（万円）', '1000')}
        {field('B', '前に受け取った純資産（万円）', '15000')}
        {field('C', '今回の全員の純資産（万円）', '18000')}
        {field('D', '今回のあなたの純資産（万円）', '9000')}
      </div>
      {gyaku && (
        <p className="rounded-xl bg-amber-50 p-2.5 text-[12px] text-amber-900 ring-1 ring-amber-200">今回の相続の日は、前の相続の日より後の日を入れてください。</p>
      )}
      {ok && r && (
        <div className="flex flex-col gap-2" aria-live="polite">
          <p className="rounded-xl bg-white px-3 py-2 text-center text-[13px] text-slate-800 ring-1 ring-slate-200">
            年数 <b>E＝{E}年</b>（1年未満は切り捨て）
          </p>
          {r.gaku > 0 && (
            <div className="grid grid-cols-3 gap-1.5 text-center text-[11px]">
              <span className="rounded-lg bg-white py-1.5 text-slate-700 ring-1 ring-slate-200">C÷(B−A)<b className="block text-[14px] text-slate-900">{pct(r.wari1)}</b>{r.wari1 === 1 && <span className="block text-[10px]">1を超えたら1</span>}</span>
              <span className="rounded-lg bg-white py-1.5 text-slate-700 ring-1 ring-slate-200">D÷C<b className="block text-[14px] text-slate-900">{pct(r.wari2)}</b></span>
              <span className="rounded-lg bg-white py-1.5 text-slate-700 ring-1 ring-slate-200">(10−E)÷10<b className="block text-[14px] text-slate-900">{pct(r.nokori)}</b></span>
            </div>
          )}
          <p className="rounded-xl bg-orange-600 px-3 py-3 text-center text-white">
            <span className="block text-[12px] opacity-90">あなたの相続税から引ける額（相続税が上限）</span>
            <span className="text-[22px] font-black">{r.gaku > 0 ? yen(r.gaku) : '使えません'}</span>
            {r.gaku <= 0 && <span className="block text-[12px]">{riyu}</span>}
          </p>
          {dOver && (
            <p className="flex items-start gap-2 rounded-xl bg-amber-50 p-2.5 text-[12px] leading-relaxed text-amber-900 ring-1 ring-amber-200">
              <AlertTriangle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
              D（あなたの分）が C（全員の合計）より大きくなっています。C は財産を受け取った全員の分を足した額です。
            </p>
          )}
        </div>
      )}
      <p className="text-[11px] leading-relaxed text-slate-500">{D.keisanNote}円未満は切り捨てて表示しています。入れた内容は送られません。</p>
    </div>
  );
}
