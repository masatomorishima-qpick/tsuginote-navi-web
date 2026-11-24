'use client';

import { useEffect, useRef, useState } from 'react';
import { CalendarCheck } from 'lucide-react';
import { trackEvent } from '@/lib/trackEvent';

/**
 * 青色申告の承認申請書（法人・設立1期目）の期限の目安（2026-11-25）。
 * 国税庁 C1-19：設立の日以後3月を経過した日と、その事業年度終了の日とのうち、いずれか早い日の前日まで。
 * 1期目が3か月より短いときは、2期目から青色にする期限も「設立の日以後3月を経過した日と2期目の終わりの早いほうの前日」。
 * 数え方：設立の日を1日目として3か月を数え、その最後の日を「3か月の終わり」とする（応当日の前日。応当日がない月は月末）。
 *   設立の日を数えない読み方より1日早くなるので、この日までに出せば間に合う側の目安になる。
 * 休日：期限が土日祝などに当たると翌日に延びる取り扱い（国税通則法第10条第2項）があるが、表示は延ばさない（早い側の目安）。
 * 使われたかは lp_event_logs の event_name 'aoiro_kigen'（1回目だけ）。入れた日付は送らない。
 */
const DAY = 86400000;
const WD = ['日', '月', '火', '水', '木', '金', '土'];

function parse(s: string): number | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) return null;
  return Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}

/** 設立の日を1日目として3か月を数えた最後の日 */
function sankagetsuEnd(t: number): number {
  const d = new Date(t);
  const y = d.getUTCFullYear(), mo = d.getUTCMonth() + 3, day = d.getUTCDate();
  const lastDay = new Date(Date.UTC(y, mo + 1, 0)).getUTCDate();
  if (day <= lastDay) return Date.UTC(y, mo, day) - DAY;
  return Date.UTC(y, mo, lastDay);
}

function fmt(t: number): string {
  const d = new Date(t);
  return `${d.getUTCFullYear()}年${d.getUTCMonth() + 1}月${d.getUTCDate()}日（${WD[d.getUTCDay()]}）`;
}

export default function AoiroKigen({ lpId }: { lpId: string }) {
  const [setsu, setSetsu] = useState('');
  const [owari, setOwari] = useState('');
  const sent = useRef(false);

  const s = parse(setsu);
  const e = parse(owari);
  const ok = s !== null && e !== null && e > s;
  const a = s !== null ? sankagetsuEnd(s) : 0;
  const b = e !== null ? e - DAY : 0;
  const kigen = ok ? Math.min(a, b) : 0;
  const short = ok && b < a;
  const weekend = ok && [0, 6].includes(new Date(kigen).getUTCDay());

  useEffect(() => {
    if (ok && !sent.current) {
      sent.current = true;
      void trackEvent({ lp_id: lpId, event_name: 'aoiro_kigen', metadata: {} });
    }
  }, [ok, lpId]);

  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-sky-50 p-4 ring-1 ring-sky-200">
      <p className="flex items-center gap-2 text-[15px] font-black text-slate-900">
        <CalendarCheck size={20} className="text-sky-700" aria-hidden="true" />1期目から青色にする期限
      </p>
      <div className="grid grid-cols-2 gap-2">
        <label className="flex flex-col gap-1 text-[11px] font-bold text-slate-600">設立の日（登記の日）
          <input type="date" value={setsu} onChange={(ev) => setSetsu(ev.target.value)} className="rounded-lg bg-white px-2 py-2 text-[15px] font-bold text-slate-900 ring-1 ring-slate-300 outline-none" />
        </label>
        <label className="flex flex-col gap-1 text-[11px] font-bold text-slate-600">1期目の終わりの日
          <input type="date" value={owari} onChange={(ev) => setOwari(ev.target.value)} className="rounded-lg bg-white px-2 py-2 text-[15px] font-bold text-slate-900 ring-1 ring-slate-300 outline-none" />
        </label>
      </div>
      <div className="rounded-xl bg-white p-3 text-center ring-1 ring-slate-200" aria-live="polite">
        <p className="text-[12px] text-slate-600">この日までに出す</p>
        <p className="text-[22px] font-black text-slate-900">{ok ? fmt(kigen) : '―'}</p>
        {ok && <p className="mt-1 text-[12px] text-slate-600">{short ? '1期目の終わりの前日のほうが早い' : '設立から3か月の終わりのほうが早い'}</p>}
      </div>
      {s !== null && e !== null && !ok && <p className="text-[12px] font-bold text-orange-700">1期目の終わりの日は、設立の日より後の日を入れてください。</p>}
      {short && <p className="text-[12px] leading-relaxed text-slate-700">1期目が3か月より短い会社は、2期目から青色にすることもできます。その期限は {fmt(a)} です。</p>}
      {weekend && <p className="text-[12px] leading-relaxed text-slate-700">この日が土日です。土日祝などに当たる期限は翌日に延びる取り扱いがありますが、早めに出すのが安全です。</p>}
      <p className="text-[11px] leading-relaxed text-slate-500">設立の日を1日目として3か月を数えた目安です。数え方で1日遅くなる読み方もあるため、早いほうに合わせています。祝日は見ていません。</p>
    </div>
  );
}
