'use client';

import { useEffect, useRef, useState } from 'react';
import { CalendarClock, Check, FileCheck2, ListChecks, Receipt } from 'lucide-react';
import { trackEvent } from '@/lib/trackEvent';
import DATA from '@/lib/souzoku/haifu-data.json';

/**
 * 相続登記の必要書類を、分け方を選ぶと一覧にする＋期限＋登録免許税（/guide/souzoku/touki-shorui、2026-11-12）。
 * 書類：法務局「相続による所有権の登記の申請に必要な書類とその入手先等」。
 * 期限：法務省「相続登記の申請義務化について」（取得を知った日から3年。2024/4/1 より前の相続は 2027/3/31 まで）。
 * 登録免許税：国税庁 No.7191（相続は1,000分の4、2027/3/31 までは価額100万円以下の土地は免税）、
 *   法務局「登録免許税の計算」（課税価格は1,000円未満切り捨て・1,000円未満なら1,000円、税額は100円未満切り捨て・1,000円未満なら1,000円）。
 * 使われたかは lp_event_logs の event_name 'touki_shorui'（1回目だけ）。入れた内容は送らない。
 */
const T = DATA.touki;
type CaseKey = 'bunkatsu' | 'houtei' | 'yuigon';

/** 「知った日から n 年以内」の最後の日：翌日から数えて n 年後の前の日（2025/2/28→2028/2/29）。 */
function addYears(d: Date, n: number) {
  // 翌日から数えて、応当日の前の日。応当日がない月はその月の末日（国税通則法10条と同じ数え方）。
  const next = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
  const y = next.getFullYear();
  const m = next.getMonth() + n * 12;
  const dd = next.getDate() - 1;
  if (dd === 0) return new Date(y, m, 0);
  return new Date(y, m, Math.min(dd, new Date(y, m + 1, 0).getDate()));
}
const fmt = (d: Date) => `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;

/** 登録免許税（相続）。tochi は土地1筆ずつの価格、tatemono は建物の価格の合計。 */
export function calcToumenzei(tochi: number[], tatemono: number) {
  const kazeiTochi = tochi.filter((v) => v > T.menzei);
  const menzeiN = tochi.filter((v) => v > 0 && v <= T.menzei).length;
  const sum = kazeiTochi.reduce((a, v) => a + v, 0) + tatemono;
  if (sum <= 0) return { kakaku: 0, zei: 0, menzeiN };
  const kakaku = Math.max(1000, Math.floor(sum / 1000) * 1000);
  const zei = Math.max(1000, Math.floor((kakaku * T.zeiritsu) / 100) * 100);
  return { kakaku, zei, menzeiN };
}

const num = (s: string) => Number(s.replace(/[^0-9]/g, '')) || 0;

export default function ToukiShoruiCheck({ lpId }: { lpId: string }) {
  const [c, setC] = useState<CaseKey>('bunkatsu');
  const [dairi, setDairi] = useState(false);
  const [kanpu, setKanpu] = useState(true);
  const [day, setDay] = useState('');
  const [tochi, setTochi] = useState(['', '']);
  const [tate, setTate] = useState('');
  const sent = useRef(false);
  const touched = useRef(false);
  const touch = <V,>(f: (v: V) => void) => (v: V) => { touched.current = true; f(v); };

  useEffect(() => {
    if (!touched.current || sent.current) return;
    sent.current = true;
    void trackEvent({ lp_id: lpId, event_name: 'touki_shorui', component_id: 'touki-shorui' });
  });

  const list = T.items.filter((it) => it.cases.includes(c) && (it.key !== 'ininjo' || dairi) && (it.key !== 'setsumeizu' || kanpu));
  const base = day ? new Date(`${day}T00:00:00`) : null;
  const valid = !!base && !Number.isNaN(base.getTime());
  const old = valid && base! < new Date(`${T.gimuStart}T00:00:00`);
  const kigen = valid ? (old ? new Date(`${T.kigenOld}T00:00:00`) : addYears(base!, 3)) : null;
  const z = calcToumenzei(tochi.map(num), num(tate));
  const anyPrice = tochi.some((v) => num(v) > 0) || num(tate) > 0;

  return (
    <div className="flex flex-col gap-4 rounded-2xl border-2 border-sky-200 bg-sky-50/60 p-4">
      <p className="flex items-center gap-2 text-[17px] font-black text-slate-900">
        <ListChecks size={22} className="text-sky-700" aria-hidden="true" />要る書類を一覧に<span className="text-[12px] font-bold text-sky-700">無料</span>
      </p>
      <div className="flex flex-col gap-1.5" role="radiogroup" aria-label="分け方">
        <p className="text-[13px] font-black text-slate-700">分け方を選ぶ</p>
        {T.cases.map((k) => {
          const sel = c === k.key;
          return (
            <button key={k.key} type="button" role="radio" aria-checked={sel} onClick={() => touch(setC)(k.key as CaseKey)}
              className={`flex w-full items-center gap-2.5 rounded-xl bg-white p-3 text-left ring-1 ${sel ? 'ring-emerald-300' : 'ring-slate-200'}`}>
              <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ring-1 ${sel ? 'bg-emerald-600 text-white ring-emerald-600' : 'bg-white text-transparent ring-slate-300'}`}><Check size={14} aria-hidden="true" /></span>
              <span className="text-[14px] font-bold text-slate-900">{k.h}</span>
            </button>
          );
        })}
        {[
          { on: dairi, set: setDairi, h: '代わりの人（代理人）に申請を頼む' },
          { on: kanpu, set: setKanpu, h: '戸籍の原本を返してほしい' },
        ].map((o) => (
          <button key={o.h} type="button" aria-pressed={o.on} onClick={() => touch(o.set)(!o.on)}
            className={`flex w-full items-center gap-2.5 rounded-xl bg-white p-3 text-left ring-1 ${o.on ? 'ring-emerald-300' : 'ring-slate-200'}`}>
            <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md ring-1 ${o.on ? 'bg-emerald-600 text-white ring-emerald-600' : 'bg-white text-transparent ring-slate-300'}`}><Check size={16} aria-hidden="true" /></span>
            <span className="text-[14px] font-bold text-slate-900">{o.h}</span>
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2 rounded-xl bg-white p-3 ring-1 ring-slate-200" aria-live="polite">
        <p className="flex items-center gap-1.5 text-[15px] font-black text-orange-700"><FileCheck2 size={18} aria-hidden="true" />そろえる書類 {list.length}点</p>
        <ol className="flex flex-col gap-1.5">
          {list.map((it, i) => (
            <li key={it.key} className="flex gap-2 text-[13px]">
              <span className="w-5 shrink-0 text-right font-black text-slate-400">{i + 1}</span>
              <span className="flex flex-col"><span className="font-bold text-slate-900">{it.h}</span>
                <span className="text-[11px] text-slate-500">{it.saki}{it.d && `｜${it.d}`}</span></span>
            </li>
          ))}
        </ol>
      </div>

      <label className="flex flex-col gap-1.5">
        <span className="flex items-center gap-1.5 text-[13px] font-black text-slate-700"><CalendarClock size={16} aria-hidden="true" />相続で不動産を取得したと知った日（ふつうは亡くなった日）</span>
        <input type="date" value={day} onChange={(e) => touch(setDay)(e.target.value)} aria-label="取得を知った日"
          className="rounded-xl bg-white px-3 py-3 text-[17px] font-bold text-slate-900 ring-1 ring-slate-300 outline-none focus:ring-2 focus:ring-sky-600" />
      </label>
      {kigen && (
        <p className="rounded-xl bg-orange-50 p-3 text-[14px] font-black text-orange-800 ring-1 ring-orange-200">
          登記の期限：{fmt(kigen)}まで（目安）
          <span className="mt-0.5 block text-[11px] font-bold text-orange-700">{old ? '2024年4月1日より前の相続なので、2027年3月31日まで' : '知った日から3年'}</span>
        </p>
      )}

      <div className="flex flex-col gap-2">
        <p className="flex items-center gap-1.5 text-[13px] font-black text-slate-700"><Receipt size={16} aria-hidden="true" />登録免許税（課税明細書の「価格」を円で）</p>
        {tochi.map((v, i) => (
          <label key={i} className="flex items-center gap-2">
            <span className="w-16 shrink-0 text-[13px] font-bold text-slate-700">土地 {i + 1}</span>
            <input inputMode="numeric" value={v} onChange={(e) => touch(setTochi)(tochi.map((x, k) => (k === i ? e.target.value : x)))} placeholder="例：5125300" aria-label={`土地${i + 1}の価格（円）`}
              className="min-w-0 flex-1 rounded-xl bg-white px-3 py-2.5 text-[16px] font-bold text-slate-900 ring-1 ring-slate-300 outline-none focus:ring-2 focus:ring-sky-600" />
          </label>
        ))}
        {tochi.length < 5 && <button type="button" onClick={() => setTochi([...tochi, ''])} className="self-start rounded-lg bg-white px-2.5 py-1.5 text-[12px] font-bold text-sky-800 ring-1 ring-sky-200">＋ 土地を足す</button>}
        <label className="flex items-center gap-2">
          <span className="w-16 shrink-0 text-[13px] font-bold text-slate-700">建物</span>
          <input inputMode="numeric" value={tate} onChange={(e) => touch(setTate)(e.target.value)} placeholder="合計" aria-label="建物の価格（円）"
            className="min-w-0 flex-1 rounded-xl bg-white px-3 py-2.5 text-[16px] font-bold text-slate-900 ring-1 ring-slate-300 outline-none focus:ring-2 focus:ring-sky-600" />
        </label>
        {anyPrice && (
          <p className="rounded-xl bg-white p-3 text-[13px] text-slate-700 ring-1 ring-slate-200" aria-live="polite">
            <span className="block text-[18px] font-black text-orange-700">{z.zei.toLocaleString('ja-JP')}円</span>
            課税価格 {z.kakaku.toLocaleString('ja-JP')}円 × 1,000分の4{z.menzeiN > 0 && `（100万円以下の土地 ${z.menzeiN}筆は免税として計算）`}
          </p>
        )}
      </div>
      <p className="text-[11px] leading-relaxed text-slate-500">期限は、知った日の翌日から数えた目安です。登録免許税は相続人が取得する場合の目安で、免税は2027年3月31日までに登記するときです。入れた内容は送られません。</p>
    </div>
  );
}
