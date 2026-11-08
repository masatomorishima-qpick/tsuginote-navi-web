'use client';

import { useRef, useState } from 'react';
import { Gauge, Leaf, Search } from 'lucide-react';
import { trackEvent } from '@/lib/trackEvent';

/**
 * 型番から号数とエコジョーズかを読む（P10 /kyutoki/kataban、2026-11-08）。
 * 読み方は東京ガスの記載だけ：号数＝ハイフンのあとの最初の数字2けた（16・20・24）、
 * エコジョーズ＝ハイフンのあとにリンナイ・パロマは E、ノーリツは C（lib/kyutoki/haifu-data.json の kataban）。
 * 使われたかは lp_event_logs の event_name 'kataban_check'（1回目だけ送る）。
 */
const MAKERS = [
  { key: 'rinnai', label: 'リンナイ', eco: 'E', ph: '例：RUF-A2400SAW' },
  { key: 'noritz', label: 'ノーリツ', eco: 'C', ph: '例：GT-2427SAWX' },
  { key: 'paloma', label: 'パロマ', eco: 'E', ph: '例：FH-E204AWADL' },
] as const;
type MakerKey = (typeof MAKERS)[number]['key'];

function read(maker: MakerKey, raw: string) {
  const s = raw.normalize('NFKC').toUpperCase().replace(/[\s‐－–—ー]/g, (c) => (/\s/.test(c) ? '' : '-'));
  const i = s.indexOf('-');
  if (i < 0) return null;
  const after = s.slice(i + 1);
  const m = after.match(/\d{2}/);
  const gosuN = m ? Number(m[0]) : NaN;
  const gosu = [16, 20, 24].includes(gosuN) ? gosuN : null;
  const head = after.match(/^[A-Z]*/)?.[0] ?? '';
  const eco = head.includes(MAKERS.find((x) => x.key === maker)!.eco);
  return { gosu, eco };
}

export default function KatabanCheck({ lpId }: { lpId: string }) {
  const [maker, setMaker] = useState<MakerKey>('rinnai');
  const [text, setText] = useState('');
  const sent = useRef(false);
  const r = text.trim() ? read(maker, text) : null;
  const ph = MAKERS.find((x) => x.key === maker)!.ph;

  function onChange(v: string) {
    setText(v);
    const res = v.trim() ? read(maker, v) : null;
    if (res && res.gosu && !sent.current) {
      sent.current = true;
      void trackEvent({ lp_id: lpId, event_name: 'kataban_check', component_id: 'kataban-check', metadata: { maker, gosu: res.gosu, eco: res.eco } });
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
      <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="メーカー">
        {MAKERS.map((m) => (
          <button
            key={m.key}
            type="button"
            role="radio"
            aria-checked={maker === m.key}
            onClick={() => setMaker(m.key)}
            className={`rounded-xl px-2 py-2.5 text-[15px] font-bold ring-1 ${maker === m.key ? 'bg-sky-700 text-white ring-sky-700' : 'bg-white text-slate-800 ring-slate-300'}`}
          >
            {m.label}
          </button>
        ))}
      </div>
      <label className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 ring-1 ring-slate-300 focus-within:ring-2 focus-within:ring-sky-600">
        <Search size={18} className="shrink-0 text-slate-500" aria-hidden="true" />
        <span className="sr-only">型番</span>
        <input
          value={text}
          onChange={(e) => onChange(e.target.value)}
          placeholder={ph}
          inputMode="text"
          autoCapitalize="characters"
          autoComplete="off"
          className="w-full bg-transparent py-3 font-mono text-[17px] font-bold text-slate-900 outline-none placeholder:font-sans placeholder:text-[15px] placeholder:font-normal placeholder:text-slate-400"
        />
      </label>
      {r === null && text.trim() !== '' && <p className="text-[13px] text-slate-600">ハイフン（-）まで入れてください</p>}
      {r && (
        <div className="grid grid-cols-2 gap-2" aria-live="polite">
          <div className="flex flex-col items-center gap-1 rounded-xl bg-sky-50 p-3 ring-1 ring-sky-200">
            <Gauge size={22} className="text-sky-700" aria-hidden="true" />
            <span className="text-[12px] text-slate-600">号数</span>
            <span className="text-[22px] font-black text-slate-900">{r.gosu ? `${r.gosu}号` : '読めない'}</span>
          </div>
          <div className="flex flex-col items-center gap-1 rounded-xl bg-emerald-50 p-3 ring-1 ring-emerald-200">
            <Leaf size={22} className="text-emerald-700" aria-hidden="true" />
            <span className="text-[12px] text-slate-600">省エネの型</span>
            <span className="text-[18px] font-black text-slate-900">{r.eco ? 'エコジョーズ' : '従来型'}</span>
          </div>
        </div>
      )}
      {r && !r.gosu && <p className="text-[12px] text-slate-600">16・20・24号以外か、読み方の違う型番です。</p>}
    </div>
  );
}
