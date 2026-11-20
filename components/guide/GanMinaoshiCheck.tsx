'use client';

import { useEffect, useRef, useState } from 'react';
import { CalendarDays, ClipboardCheck } from 'lucide-react';
import { trackEvent } from '@/lib/trackEvent';
import DATA from '@/lib/hoken/haifu-data.json';

/**
 * がん保険の見直しチェック（/guide/shisan-kanri/hoken-minaoshi-gan、2026-11-21）。
 * 保険証券・約款を見て、6つの問いに「はい・いいえ・分からない」で答えると、見直しで確かめる点が並ぶ。
 * 問いの元：生命保険文化センター「がん保険（主契約の種類）」（診断給付金の回数・支払いの対象にならないがん・通院・抗がん剤）、
 *   先進医療給付金は療養時点で先進医療に当たる治療が対象（同ページ）、「手引」その4（更新型は更新のときの年齢で保険料を計算し直す）。
 * 待ち期間：生命保険文化センター「一般的に契約してから90日（待ち期間）経過後に保障が開始」。
 *   数え方と保障が始まる日は商品で違うため、契約日の90日後を「目安」として出すだけにする。
 * 使われたかは lp_event_logs の event_name 'gan_minaoshi'（1回目だけ）。入れた内容は送らない。
 */
const P = DATA.gan;
const QS = P.check.filter((c) => c.tool);
type Ans = '' | 'yes' | 'no' | 'unknown';
const OPTS: { v: Ans; label: string }[] = [
  { v: 'yes', label: 'はい' },
  { v: 'no', label: 'いいえ' },
  { v: 'unknown', label: '分からない' },
];

/** 契約日の n 日後（その日を含めずに数える）。 */
export function addDays(d: Date, n: number) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
}

const fmt = (d: Date) => `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;

export default function GanMinaoshiCheck({ lpId }: { lpId: string }) {
  const [ans, setAns] = useState<Record<string, Ans>>({});
  const [kei, setKei] = useState('');
  const sent = useRef(false);
  const touched = useRef(false);

  useEffect(() => {
    if (!touched.current || sent.current) return;
    sent.current = true;
    void trackEvent({ lp_id: lpId, event_name: 'gan_minaoshi', component_id: 'gan-minaoshi' });
  });

  const set = (k: string, v: Ans) => { touched.current = true; setAns((a) => ({ ...a, [k]: v })); };
  const answered = QS.filter((q) => ans[q.key]);
  const miss = QS.filter((q) => ans[q.key] === 'no');
  const unk = QS.filter((q) => ans[q.key] === 'unknown');
  const kd = kei ? new Date(`${kei}T00:00:00`) : null;
  const machiEnd = kd && !Number.isNaN(kd.getTime()) ? addDays(kd, P.machi) : null;

  return (
    <div className="flex flex-col gap-4 rounded-2xl border-2 border-sky-200 bg-white p-4">
      <p className="flex items-center gap-2 text-[16px] font-black text-slate-900"><ClipboardCheck size={20} className="text-sky-700" aria-hidden="true" />保険証券・約款を見て答える6つの問い</p>
      <p className="-mt-2 text-[12px] text-slate-600">「はい」は保障があるという意味です。「いいえ」は続けるか考える点として、「分からない」は確かめる点として下に出ます。</p>
      <ol className="flex flex-col gap-3">
        {QS.map((q, i) => (
          <li key={q.key} className="flex flex-col gap-2 rounded-xl bg-slate-50 p-3">
            <span className="text-[14px] font-bold text-slate-900">{i + 1}. {q.q}</span>
            <span className="grid grid-cols-3 gap-1.5" role="radiogroup" aria-label={q.q}>
              {OPTS.map((o) => (
                <button
                  key={o.v}
                  type="button"
                  role="radio"
                  aria-checked={ans[q.key] === o.v}
                  onClick={() => set(q.key, o.v)}
                  className={`rounded-lg px-2 py-2 text-[14px] font-bold ring-1 ${ans[q.key] === o.v ? 'bg-sky-700 text-white ring-sky-700' : 'bg-white text-slate-700 ring-slate-300'}`}
                >{o.label}</button>
              ))}
            </span>
          </li>
        ))}
      </ol>
      <div className="flex flex-col gap-2 rounded-xl bg-orange-50 p-3.5 ring-1 ring-orange-200" aria-live="polite">
        {answered.length === 0 ? (
          <p className="text-[14px] text-slate-700">答えると、見直しで確かめる点がここに出ます。</p>
        ) : (
          <>
            <p className="text-[15px] font-black text-slate-900">
              確かめる点 <span className="text-[22px] text-orange-700">{miss.length + unk.length}</span> つ
              <span className="ml-1 text-[12px] font-bold text-slate-500">（{answered.length}/{QS.length} 問に回答）</span>
            </p>
            {miss.length + unk.length === 0 ? (
              <p className="text-[14px] text-slate-700">答えた問いでは、確かめる点はありませんでした。保障の額が今の暮らしに合うかは、下のチェックリストで確かめます。</p>
            ) : (
              <ul className="flex flex-col gap-1.5">
                {miss.map((q) => <li key={q.key} className="text-[14px] text-slate-800"><b className="text-orange-700">考える点</b>　{q.h}</li>)}
                {unk.map((q) => <li key={q.key} className="text-[14px] text-slate-800"><b className="text-slate-600">証券・約款で確かめる</b>　{q.h}</li>)}
              </ul>
            )}
          </>
        )}
      </div>
      <div className="flex flex-col gap-2 border-t border-slate-200 pt-3">
        <label htmlFor="gan-kei" className="flex items-center gap-2 text-[14px] font-bold text-slate-900"><CalendarDays size={18} className="text-sky-700" aria-hidden="true" />乗り換えるなら：新しいがん保険の契約日</label>
        <input id="gan-kei" type="date" value={kei} onChange={(e) => { touched.current = true; setKei(e.target.value); }} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-[16px]" />
        {machiEnd && (
          <p className="text-[14px] text-slate-800">待ち期間（{P.machi}日）が明けて保障が始まるのは、早くても <b className="text-orange-700">{fmt(machiEnd)}</b> ごろ。古い契約の解約は、新しい契約の保障が始まる日を証券で確かめ、その日を過ぎてからにします。</p>
        )}
        <p className="text-[11px] text-slate-500">{P.keisanNote}</p>
      </div>
    </div>
  );
}
