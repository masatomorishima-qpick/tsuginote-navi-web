'use client';

import { useEffect, useRef, useState } from 'react';
import { CalendarClock } from 'lucide-react';
import { trackEvent } from '@/lib/trackEvent';

/**
 * 定年退職のときの健康保険の期限（/guide/shisan-kanri/hoken-minaoshi-teinen、2026-11-17）。
 * 決まり：協会けんぽ「任意継続」とよくある質問（資格喪失日〈退職日の翌日〉から20日以内に申出・必着、
 *   20日目が土日・祝日なら翌営業日、最長2年）。名古屋市・神戸市（国民健康保険は14日以内に届け出、保険料は資格のできた月にさかのぼる）。
 * 数え方：資格喪失日（退職日の翌日）は午前0時から始まるので1日目に数える（民法140条ただし書）。
 *   20日目＝退職日＋20日、14日目＝退職日＋14日。3/31 退職 → 4/1 が1日目 → 任意継続 4/20・国保 4/14。
 *   月末の例：2/28 退職（平年）→ 3/1 が1日目 → 3/20・3/14。
 * 任意継続の2年：資格を取った日（退職日の翌日）から2年。終わりの日の目安＝資格を取った日の2年後の前の日（2026/2/28 退職→2028/2/29、2/29 退職→2年後の2/28）。
 * 祝日は自動では動かさず、曜日を出して「土日・祝日なら次の営業日」と書く。
 * 使われたかは lp_event_logs の event_name 'teinen_kenpo'（1回目だけ）。入れた日付は送らない。
 */
const WD = ['日', '月', '火', '水', '木', '金', '土'];
const fmt = (d: Date) => `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日（${WD[d.getDay()]}）`;

export function kigen(taishoku: Date) {
  const add = (n: number) => new Date(taishoku.getFullYear(), taishoku.getMonth(), taishoku.getDate() + n);
  const s = add(1);
  return {
    soshitsu: s,
    ninkei: add(20),
    kokuho: add(14),
    // 資格を取った日（退職日の翌日）から2年たつ日の前の日。2026/2/28 退職 → 2028/2/29。
    owari: new Date(s.getFullYear() + 2, s.getMonth(), s.getDate() - 1),
  };
}

export default function TeinenKenpoKigen({ lpId }: { lpId: string }) {
  const [day, setDay] = useState('');
  const sent = useRef(false);
  const d = day ? new Date(`${day}T00:00:00`) : null;
  const ok = !!d && !Number.isNaN(d.getTime());
  const r = ok ? kigen(d as Date) : null;

  useEffect(() => {
    if (!ok || sent.current) return;
    sent.current = true;
    void trackEvent({ lp_id: lpId, event_name: 'teinen_kenpo', component_id: 'teinen-kenpo' });
  }, [ok, lpId]);

  const wk = (x: Date) => x.getDay() === 0 || x.getDay() === 6;
  const nextWeekday = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate() + (x.getDay() === 6 ? 2 : 1));
  const rows = r ? [
    { h: '任意継続の申し出の期限', v: fmt(r.ninkei), d: '協会けんぽの支部に必着。郵送は早めに', warn: wk(r.ninkei) },
    { h: '国民健康保険の届け出の期限', v: fmt(r.kokuho), d: '住んでいる市区町村の窓口へ', warn: false },
    { h: '任意継続の終わり（最長2年）', v: `${fmt(r.owari)}ごろ`, d: '申し出れば途中でやめられる。正しい日付は協会けんぽの通知で', warn: false },
  ] : [];

  return (
    <div className="flex flex-col gap-4 rounded-2xl border-2 border-sky-200 bg-sky-50/60 p-4">
      <p className="flex items-center gap-2 text-[17px] font-black text-slate-900">
        <CalendarClock size={22} className="text-sky-700" aria-hidden="true" />健康保険の手続きの期限<span className="text-[12px] font-bold text-sky-700">無料</span>
      </p>
      <label className="flex flex-col gap-1 text-[11px] font-bold text-slate-600">退職日（会社に籍がある最後の日。有給休暇の消化中も含む）
        <input type="date" value={day} onChange={(e) => setDay(e.target.value)}
          className="w-full min-w-0 rounded-xl bg-white px-3 py-2.5 text-[16px] font-bold text-slate-900 ring-1 ring-slate-300 outline-none focus:ring-2 focus:ring-sky-600" />
      </label>
      {r && (
        <div className="flex flex-col gap-1.5" aria-live="polite">
          <p className="text-[12px] text-slate-600">健康保険の資格がなくなる日：<b className="text-slate-900">{fmt(r.soshitsu)}</b>（この日を1日目に数える）</p>
          <ul className="grid gap-1.5">
            {rows.map((x) => (
              <li key={x.h} className="flex flex-col rounded-xl bg-white p-3 ring-1 ring-slate-200">
                <span className="text-[12px] font-bold text-slate-600">{x.h}</span>
                <span className="text-[17px] font-black text-orange-700">{x.v}</span>
                <span className="text-[12px] text-slate-600">{x.d}</span>
                {x.warn && r && <span className="text-[12px] font-bold text-orange-800">この日は土日なので、期限は次の営業日（{fmt(nextWeekday(r.ninkei))}、祝日ならその次）です</span>}
              </li>
            ))}
          </ul>
        </div>
      )}
      <p className="text-[11px] leading-relaxed text-slate-500">期限の日が祝日なら、次の営業日までになります（任意継続）。国民健康保険の数え方は市区町村で確かめてください。家族の被扶養者になるときは、家族の勤め先に早めに伝えます。入れた日付は送られません。</p>
    </div>
  );
}
