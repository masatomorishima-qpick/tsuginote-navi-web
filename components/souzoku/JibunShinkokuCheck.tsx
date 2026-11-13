'use client';

import { useEffect, useRef, useState } from 'react';
import { CalendarClock, Check, FileSpreadsheet, ListChecks } from 'lucide-react';
import { trackEvent } from '@/lib/trackEvent';
import DATA from '@/lib/souzoku/haifu-data.json';

/**
 * 相続税の申告を自分でする手順（/guide/souzoku/shinkoku-jibun、2026-11-14）。
 * 期限：国税庁 No.4205（知った日の翌日から10か月以内）。翌日から数えて10か月後の前の日（月末に知ったら10か月後の月末）。
 *   手順ごとの「何か月目まで」は期限から逆算した目安（国税庁の決まりではない。ページにもそう書く）。
 * 作る表：国税庁「相続税の申告のしかた（令和8年分用）」の申告書の記載の順序（第9表→…→第15表→第11表→第1表→第2表→第4表…）。
 * 使われたかは lp_event_logs の event_name 'jibun_shinkoku'（1回目だけ）。入れた内容は送らない。
 */
const J = DATA.jibun;

/** 「知った日の翌日から n か月以内」の最後の日：翌日から数えて n か月後の前の日（月末に知ったら n か月後の月末）。 */
export function kigenDate(d: Date, n: number) {
  // 翌日から数えて、応当日の前の日。応当日がない月はその月の末日（国税通則法10条と同じ数え方）。
  const next = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
  const y = next.getFullYear();
  const m = next.getMonth() + n;
  const dd = next.getDate() - 1;
  if (dd === 0) return new Date(y, m, 0);
  return new Date(y, m, Math.min(dd, new Date(y, m + 1, 0).getDate()));
}
/** 期限が土日・12月29日〜1月3日に当たるときは、次の平日に送る（国税通則法10条2項。祝日は入れていない）。 */
export function kyujitsuAke(d: Date) {
  let x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  for (let i = 0; i < 10; i++) {
    const m = x.getMonth();
    const day = x.getDate();
    const nenmatsu = (m === 11 && day >= 29) || (m === 0 && day <= 3);
    if (!nenmatsu && x.getDay() !== 0 && x.getDay() !== 6) return x;
    x = new Date(x.getFullYear(), x.getMonth(), x.getDate() + 1);
  }
  return x;
}
const fmt = (d: Date) => `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;

/** 当てはまる状況から、作る表を国税庁の順で返す。 */
export function hyoList(on: Record<string, boolean>) {
  return J.hyo.filter((h) => h.when === 'always' || on[h.when]);
}

export default function JibunShinkokuCheck({ lpId }: { lpId: string }) {
  const [day, setDay] = useState('');
  const [on, setOn] = useState<Record<string, boolean>>({});
  const sent = useRef(false);
  const touched = useRef(false);

  useEffect(() => {
    if (!touched.current || sent.current) return;
    sent.current = true;
    void trackEvent({ lp_id: lpId, event_name: 'jibun_shinkoku', component_id: 'jibun-shinkoku' });
  });

  const base = day ? new Date(`${day}T00:00:00`) : null;
  const valid = !!base && !Number.isNaN(base.getTime());
  const list = hyoList(on);
  const kigen = valid ? kigenDate(base!, J.kigenN) : null;
  const ake = kigen ? kyujitsuAke(kigen) : null;

  return (
    <div className="flex flex-col gap-4 rounded-2xl border-2 border-sky-200 bg-sky-50/60 p-4">
      <p className="flex items-center gap-2 text-[17px] font-black text-slate-900">
        <ListChecks size={22} className="text-sky-700" aria-hidden="true" />期限と作る表を出す<span className="text-[12px] font-bold text-sky-700">無料</span>
      </p>
      <label className="flex flex-col gap-1.5">
        <span className="flex items-center gap-1.5 text-[13px] font-black text-slate-700"><CalendarClock size={16} aria-hidden="true" />亡くなったことを知った日（ふつうは亡くなった日）</span>
        <input type="date" value={day} onChange={(e) => { touched.current = true; setDay(e.target.value); }} aria-label="亡くなったことを知った日"
          className="rounded-xl bg-white px-3 py-3 text-[17px] font-bold text-slate-900 ring-1 ring-slate-300 outline-none focus:ring-2 focus:ring-sky-600" />
      </label>
      {valid && (
        <div className="flex flex-col gap-2 rounded-xl bg-white p-3 ring-1 ring-slate-200" aria-live="polite">
          <p className="rounded-lg bg-orange-50 p-2.5 text-[15px] font-black text-orange-800 ring-1 ring-orange-200">申告と納税の期限：{fmt(ake!)}
            {ake!.getTime() !== kigen!.getTime() && <span className="mt-0.5 block text-[11px] font-bold text-orange-700">{fmt(kigen!)}が土日・年末年始に当たるため、次の平日</span>}
            <span className="mt-0.5 block text-[11px] font-bold text-orange-700">祝日に当たるときは、その翌日が期限</span></p>
          <ol className="flex flex-col gap-1.5">
            {J.steps.map((s, i) => (
              <li key={s.key} className="flex items-baseline gap-2 text-[13px]">
                <span className="w-5 shrink-0 text-right font-black text-slate-400">{i + 1}</span>
                <span className="flex-1 font-bold text-slate-900">{s.h}</span>
                <span className="shrink-0 text-[12px] font-bold text-sky-800">{fmt(s.ato === J.kigenN ? ake! : kigenDate(base!, s.ato))}</span>
              </li>
            ))}
          </ol>
          <p className="text-[11px] text-slate-500">右の日付は、期限から逆算した「ここまでに済ませたい」目安です。</p>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <p className="text-[13px] font-black text-slate-700">当てはまるものを選ぶ</p>
        {J.jokyo.map((k) => {
          const sel = !!on[k.key];
          return (
            <button key={k.key} type="button" aria-pressed={sel} onClick={() => { touched.current = true; setOn((s) => ({ ...s, [k.key]: !s[k.key] })); }}
              className={`flex w-full items-center gap-2.5 rounded-xl bg-white p-3 text-left ring-1 ${sel ? 'ring-emerald-300' : 'ring-slate-200'}`}>
              <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md ring-1 ${sel ? 'bg-emerald-600 text-white ring-emerald-600' : 'bg-white text-transparent ring-slate-300'}`}><Check size={16} aria-hidden="true" /></span>
              <span className="text-[14px] font-bold text-slate-900">{k.h}</span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-2 rounded-xl bg-white p-3 ring-1 ring-slate-200" aria-live="polite">
        <p className="flex items-center gap-1.5 text-[15px] font-black text-orange-700"><FileSpreadsheet size={18} aria-hidden="true" />作る表 {list.length}枚（この順で）</p>
        <ol className="flex flex-col gap-1.5">
          {list.map((h, i) => (
            <li key={h.no} className="flex gap-2 text-[13px]">
              <span className="w-5 shrink-0 text-right font-black text-slate-400">{i + 1}</span>
              <span className="flex flex-col"><span className="font-black text-slate-900">{h.no}</span><span className="text-[12px] text-slate-600">{h.h}</span></span>
            </li>
          ))}
        </ol>
      </div>
      <p className="text-[11px] leading-relaxed text-slate-500">期限は、知った日の翌日から数えた目安です。表は主なものだけで、ほかの表が要ることもあります。入れた内容は送られません。</p>
    </div>
  );
}
