'use client';

import { useEffect, useRef, useState } from 'react';
import { CalendarClock, Check, CircleCheck, CircleX, FileCheck2, ListChecks } from 'lucide-react';
import { trackEvent } from '@/lib/trackEvent';
import DATA from '@/lib/souzoku/haifu-data.json';

/**
 * 相続税の0円申告の判定（/guide/souzoku/zero-en-shinkoku、2026-11-17）。
 * 判定：特例を使う前の正味の遺産額 ≦ 基礎控除（3,000万円＋600万円×法定相続人の数。国税庁 No.4102）なら申告不要（No.4205）。
 *   超えて、配偶者の税額の軽減か小規模宅地等の特例を使うなら「申告が要る（特例で0円になることがある）」（特例は申告書に書いて出すことが条件。No.4124・No.4158）。
 *   特例の後の税額が本当に0円になるかは、この道具では計算しない（画面に書く）。
 * 期限：知った日の翌日から10か月（No.4205）。翌日から数えて応当日の前の日、応当日がない月はその月の末日（国税通則法10条）。
 *   土日・祝日（内閣府の表の2026・2027年）・12/29〜1/3 は翌日へ。
 * 使われたかは lp_event_logs の event_name 'zero_shinkoku'（1回目だけ）。入れた数字は送らない。
 */
const Z = DATA.zero;
const KISO = DATA.zei.kiso;

export function kigenDate(d: Date, n: number) {
  const next = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
  const y = next.getFullYear();
  const m = next.getMonth() + n;
  const dd = next.getDate() - 1;
  if (dd === 0) return new Date(y, m, 0);
  return new Date(y, m, Math.min(dd, new Date(y, m + 1, 0).getDate()));
}
const SHUKU = new Set(DATA.shukujitsu.days);
const ymd = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
/** 土日・祝日（内閣府の表にある2026・2027年）・12/29〜1/3 なら次の日へ（国税通則法10条2項）。 */
export function yasumiAke(d: Date) {
  const x = new Date(d);
  for (let i = 0; i < 15; i++) {
    const w = x.getDay();
    const mo = x.getMonth() + 1;
    const da = x.getDate();
    if (w === 0 || w === 6 || (mo === 12 && da >= 29) || (mo === 1 && da <= 3) || SHUKU.has(ymd(x))) x.setDate(x.getDate() + 1);
    else break;
  }
  return x;
}
/** 祝日を見られる年か（内閣府の表にある年だけ）。 */
export const shukuKnown = (d: Date) => DATA.shukujitsu.days.some((s) => s.startsWith(`${d.getFullYear()}-`));
const fmt = (d: Date) => `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
const man = (yen: number) => `${(yen / 10000).toLocaleString('ja-JP')}万円`;
const INPUT = 'w-full rounded-xl bg-white px-3 py-2.5 text-[16px] font-bold text-slate-900 ring-1 ring-slate-300 outline-none focus:ring-2 focus:ring-sky-600';

export function hanteiZero(isan: number, ninzu: number, tokurei: boolean) {
  const kiso = KISO.base + KISO.per * ninzu;
  if (isan <= kiso) return { kiso, key: 'fuyo' as const };
  return { kiso, key: tokurei ? ('zero' as const) : ('kakaru' as const) };
}

function Box({ sel, onClick, label, sub }: { sel: boolean; onClick: () => void; label: string; sub?: string }) {
  return (
    <button type="button" aria-pressed={sel} onClick={onClick}
      className={`flex w-full items-center gap-2.5 rounded-xl bg-white p-3 text-left ring-1 ${sel ? 'ring-emerald-300' : 'ring-slate-200'}`}>
      <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md ring-1 ${sel ? 'bg-emerald-600 text-white ring-emerald-600' : 'bg-white text-transparent ring-slate-300'}`}><Check size={16} aria-hidden="true" /></span>
      <span className="flex flex-col"><span className="text-[14px] font-bold text-slate-900">{label}</span>{sub && <span className="text-[11px] text-slate-500">{sub}</span>}</span>
    </button>
  );
}

export default function ZeroShinkokuCheck({ lpId }: { lpId: string }) {
  const [isanMan, setIsanMan] = useState('');
  const [ninzu, setNinzu] = useState(2);
  const [on, setOn] = useState<Record<string, boolean>>({});
  const [day, setDay] = useState('');
  const sent = useRef(false);
  const touched = useRef(false);

  const isanNum = Number(isanMan.replace(/[,，\s]/g, ''));
  const isan = Number.isFinite(isanNum) && isanNum > 0 ? Math.round(isanNum * 10000) : 0;
  const tokurei = !!on.haigusha || !!on.takuchi;
  const res = isan > 0 ? hanteiZero(isan, ninzu, tokurei) : null;
  const h = res ? Z.hantei.find((x) => x.key === res.key)! : null;
  const base = day ? new Date(`${day}T00:00:00`) : null;
  const valid = !!base && !Number.isNaN(base.getTime());
  const kigen = valid ? kigenDate(base!, Z.kigenN) : null;
  const kigenAke = kigen ? yasumiAke(kigen) : null;

  useEffect(() => {
    if (!touched.current || sent.current || !res) return;
    sent.current = true;
    void trackEvent({ lp_id: lpId, event_name: 'zero_shinkoku', component_id: 'zero-shinkoku' });
  });

  const need = (when: string) => when === 'always' || !!on[when];
  const hyo = Z.hyo.filter((x) => need(x.when));
  const shorui = Z.shorui.filter((x) => need(x.when));
  const toggle = (k: string) => { touched.current = true; setOn((s) => ({ ...s, [k]: !s[k] })); };
  return (
    <div className="flex flex-col gap-4 rounded-2xl border-2 border-sky-200 bg-sky-50/60 p-4">
      <p className="flex items-center gap-2 text-[17px] font-black text-slate-900">
        <ListChecks size={22} className="text-sky-700" aria-hidden="true" />0円申告が要るかの判定<span className="text-[12px] font-bold text-sky-700">無料</span>
      </p>

      <label className="flex flex-col gap-1 text-[13px] font-black text-slate-700">① 正味の遺産額（特例を使う前・万円）
        <input inputMode="numeric" value={isanMan} placeholder="8000" onChange={(e) => { touched.current = true; setIsanMan(e.target.value); }} className={INPUT} />
        <span className="text-[11px] font-bold text-slate-500">{Z.isanNote}</span>
      </label>
      <label className="flex flex-col gap-1 text-[13px] font-black text-slate-700">② 法定相続人の数
        <select value={ninzu} onChange={(e) => { touched.current = true; setNinzu(Number(e.target.value)); }} className={INPUT}>
          {Array.from({ length: 10 }, (_, n) => n + 1).map((n) => <option key={n} value={n}>{n}人</option>)}
        </select>
        <span className="text-[11px] font-bold text-slate-500">相続を放棄した人も数える。養子は実子がいれば1人、いなければ2人まで</span>
      </label>
      <div className="flex flex-col gap-1.5">
        <p className="text-[13px] font-black text-slate-700">③ 使う特例と、当てはまること</p>
        {Z.tokurei.map((t) => <Box key={t.key} sel={!!on[t.key]} onClick={() => toggle(t.key)} label={t.h} sub={t.s} />)}
        <Box sel={!!on.saimu} onClick={() => toggle('saimu')} label="借金や葬式費用を差し引く" />
        <Box sel={!!on.mibunkatsu} onClick={() => toggle('mibunkatsu')} label="期限までに分け方が決まりそうにない" />
      </div>

      {res && h && (
        <div className={`flex items-start gap-2 rounded-xl px-3 py-3 ring-1 ${res.key === 'fuyo' ? 'bg-emerald-50 text-emerald-900 ring-emerald-200' : 'bg-orange-50 text-orange-900 ring-orange-200'}`} aria-live="polite">
          {res.key === 'fuyo' ? <CircleX size={22} className="mt-0.5 shrink-0 text-emerald-600" aria-hidden="true" /> : <CircleCheck size={22} className="mt-0.5 shrink-0 text-orange-600" aria-hidden="true" />}
          <span className="flex flex-col">
            <span className="text-[18px] font-black">{h.h}</span>
            <span className="text-[12px] font-bold">基礎控除 {man(res.kiso)}（3,000万円＋600万円×{ninzu}人）に対して、遺産額 {man(isan)}。{h.d}</span>
            {res.key === 'zero' && on.mibunkatsu && <span className="mt-1 text-[12px] font-bold">{Z.mibunkatsuMsg}</span>}
          </span>
        </div>
      )}

      <label className="flex flex-col gap-1.5">
        <span className="flex items-center gap-1.5 text-[13px] font-black text-slate-700"><CalendarClock size={16} aria-hidden="true" />④ 亡くなったことを知った日（ふつうは亡くなった日）</span>
        <input type="date" value={day} onChange={(e) => { touched.current = true; setDay(e.target.value); }} aria-label="亡くなったことを知った日" className={INPUT} />
      </label>
      {kigen && kigenAke && (
        <p className="rounded-xl bg-white p-3 text-[14px] font-black text-orange-800 ring-1 ring-orange-200">
          申告の期限：{fmt(kigenAke)}まで
          {kigenAke.getTime() !== kigen.getTime() && <span className="block text-[11px] font-bold text-slate-600">{fmt(kigen)}が休みなので、休みの明けた日</span>}
          {!shukuKnown(kigen) && <span className="block text-[11px] font-bold text-slate-600">この年の祝日は見ていません。祝日に当たるときは翌日になります</span>}
        </p>
      )}

      {res && res.key !== 'fuyo' && (
        <div className="flex flex-col gap-2 rounded-xl bg-white p-3 ring-1 ring-slate-200" aria-live="polite">
          <p className="flex items-center gap-1.5 text-[15px] font-black text-orange-700"><FileCheck2 size={18} aria-hidden="true" />作る表 {hyo.length}枚・付ける書類 {shorui.length}点</p>
          <ol className="flex flex-col gap-1">
            {hyo.map((x, i) => (
              <li key={x.no} className="flex gap-2 text-[13px]"><span className="w-5 shrink-0 text-right font-black text-slate-400">{i + 1}</span><span><b className="text-slate-900">{x.no}</b> <span className="text-[11px] text-slate-500">{x.h}</span></span></li>
            ))}
          </ol>
          <ul className="flex flex-col gap-1 border-t border-slate-100 pt-2">
            {shorui.map((x) => (
              <li key={x.h} className="flex gap-2 text-[13px]"><Check size={15} className="mt-0.5 shrink-0 text-emerald-600" aria-hidden="true" /><span className="flex flex-col"><b className="text-slate-900">{x.h}</b><span className="text-[11px] text-slate-500">{x.d}</span></span></li>
            ))}
          </ul>
        </div>
      )}
      <p className="text-[11px] leading-relaxed text-slate-500">特例を使った後に税額が本当に0円になるかは、この道具では計算しません。死亡保険金・死亡退職金の非課税の分は、引いた後の額を入れてください。入れた数字は送られません。</p>
    </div>
  );
}
