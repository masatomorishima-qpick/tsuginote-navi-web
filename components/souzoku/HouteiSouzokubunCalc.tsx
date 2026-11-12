'use client';

import { useEffect, useRef, useState } from 'react';
import { Minus, Plus, Scale, Users } from 'lucide-react';
import { trackEvent } from '@/lib/trackEvent';

/**
 * 法定相続分の計算（/guide/souzoku/houtei-souzokubun、2026-11-12）。
 * 家族の形を選ぶと、誰が何分のいくつ・いくらか、遺留分の割合の目安を出す。
 * きまり：民法 887・889・890・900・901・939条、1042条（遺留分）。国税庁 No.4132。
 *   ・先に亡くなった子の分は孫が受ける（901条）。放棄した人は初めから相続人でない（939条）＝人数に入れない。
 *   ・父母の片方だけ同じ兄弟姉妹は、両方同じ兄弟姉妹の2分の1（900条4号ただし書）。
 *   ・兄弟姉妹の代襲は、その子（おい・めい）まで（889条2項は887条2項だけを準用）。
 *   ・遺留分：親だけが相続人なら3分の1、それ以外は2分の1。兄弟姉妹（おい・めい）はなし（1042条）。
 *     配偶者と兄弟姉妹のときは、遺留分を持つのは配偶者だけなので配偶者が2分の1（11/12 確認役の指摘で直した）。
 * 使われたかは lp_event_logs の event_name 'houtei_souzokubun'（1回目だけ）。入れた内容は送らない。
 */

type F = [number, number];
const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
const fr = (n: number, d: number): F => { const g = gcd(n, d) || 1; return [n / g, d / g]; };
const mul = (a: F, b: F): F => fr(a[0] * b[0], a[1] * b[1]);
export const frText = (f: F) => (f[0] === 0 ? 'なし' : f[0] === f[1] ? 'すべて' : `${f[1]}分の${f[0]}`);

type Row = { who: string; share: F; iryu: F };
type Sib = { full: boolean; oi: number };

export function calcHoutei(o: { haigusha: boolean; ko: number; daishu: number[]; oya: number; kyodaiFull: number; kyodaiHalf: number; kyodaiShibou: Sib[] }) {
  const rows: Row[] = [];
  const units = o.ko + o.daishu.filter((g) => g > 0).length;
  let kind: 'ko' | 'oya' | 'kyodai' | 'haigusha' | 'none' = 'none';
  if (units > 0) {
    kind = 'ko';
    const rest: F = o.haigusha ? [1, 2] : [1, 1];
    if (o.haigusha) rows.push({ who: '配偶者', share: [1, 2], iryu: [0, 1] });
    const each = mul(rest, [1, units]);
    for (let i = 0; i < o.ko; i++) rows.push({ who: `子${o.ko > 1 ? ` ${i + 1}` : ''}`, share: each, iryu: [0, 1] });
    o.daishu.forEach((g, i) => {
      for (let j = 0; j < g; j++) rows.push({ who: `孫（亡くなった子${o.daishu.length > 1 ? ` ${i + 1}` : ''}の子${g > 1 ? ` ${j + 1}` : ''}）`, share: mul(each, [1, g]), iryu: [0, 1] });
    });
  } else if (o.oya > 0) {
    kind = 'oya';
    const rest: F = o.haigusha ? [1, 3] : [1, 1];
    if (o.haigusha) rows.push({ who: '配偶者', share: [2, 3], iryu: [0, 1] });
    for (let i = 0; i < o.oya; i++) rows.push({ who: o.oya > 1 ? (i === 0 ? '父' : '母') : '親', share: mul(rest, [1, o.oya]), iryu: [0, 1] });
  } else if (o.kyodaiFull + o.kyodaiHalf + o.kyodaiShibou.filter((s) => s.oi > 0).length > 0) {
    kind = 'kyodai';
    const rest: F = o.haigusha ? [1, 4] : [1, 1];
    if (o.haigusha) rows.push({ who: '配偶者', share: [3, 4], iryu: [0, 1] });
    const dead = o.kyodaiShibou.filter((s) => s.oi > 0);
    const W = o.kyodaiFull * 2 + o.kyodaiHalf + dead.reduce((a, s) => a + (s.full ? 2 : 1), 0);
    for (let i = 0; i < o.kyodaiFull; i++) rows.push({ who: `兄弟姉妹${o.kyodaiFull > 1 ? ` ${i + 1}` : ''}`, share: mul(rest, [2, W]), iryu: [0, 1] });
    for (let i = 0; i < o.kyodaiHalf; i++) rows.push({ who: `父母の片方だけ同じ兄弟姉妹${o.kyodaiHalf > 1 ? ` ${i + 1}` : ''}`, share: mul(rest, [1, W]), iryu: [0, 1] });
    dead.forEach((s, i) => {
      for (let j = 0; j < s.oi; j++) rows.push({ who: `おい・めい（亡くなった兄弟姉妹${dead.length > 1 ? ` ${i + 1}` : ''}の子${s.oi > 1 ? ` ${j + 1}` : ''}）`, share: mul(rest, [s.full ? 2 : 1, W * s.oi]), iryu: [0, 1] });
    });
  } else if (o.haigusha) {
    kind = 'haigusha';
    rows.push({ who: '配偶者', share: [1, 1], iryu: [0, 1] });
  }
  // 遺留分：親だけが相続人なら3分の1、それ以外は2分の1。兄弟姉妹・おい・めいはなし。
  const sotai: F = kind === 'oya' && !o.haigusha ? [1, 3] : [1, 2];
  for (const r of rows) {
    const sib = r.who.startsWith('兄弟姉妹') || r.who.startsWith('父母の片方') || r.who.startsWith('おい');
    // 配偶者と兄弟姉妹のときは、遺留分を持つのが配偶者だけなので、配偶者に2分の1（総体の遺留分すべて）。
    r.iryu = sib ? [0, 1] : kind === 'kyodai' && r.who === '配偶者' ? [1, 2] : mul(sotai, r.share);
  }
  return { rows, kind };
}

function Count({ label, value, set, max = 10 }: { label: string; value: number; set: (n: number) => void; max?: number }) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-xl bg-white px-3 py-2 ring-1 ring-slate-200">
      <span className="text-[14px] font-bold text-slate-900">{label}</span>
      <span className="flex items-center gap-2">
        <button type="button" onClick={() => set(Math.max(0, value - 1))} aria-label={`${label}を1人減らす`} className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-700"><Minus size={16} aria-hidden="true" /></button>
        <span className="w-8 text-center text-[17px] font-black text-slate-900" aria-live="polite">{value}</span>
        <button type="button" onClick={() => set(Math.min(max, value + 1))} aria-label={`${label}を1人増やす`} className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-700"><Plus size={16} aria-hidden="true" /></button>
      </span>
    </div>
  );
}

const yen = (n: number) => `${Math.floor(n).toLocaleString('ja-JP')}円`;

export default function HouteiSouzokubunCalc({ lpId }: { lpId: string }) {
  const [haigusha, setHaigusha] = useState(true);
  const [ko, setKo] = useState(2);
  const [daishu, setDaishu] = useState<number[]>([]);
  const [oya, setOya] = useState(0);
  const [kf, setKf] = useState(0);
  const [kh, setKh] = useState(0);
  const [ks, setKs] = useState<Sib[]>([]);
  const [man, setMan] = useState('');
  const sent = useRef(false);
  const touched = useRef(false);
  const touch = <T,>(f: (v: T) => void) => (v: T) => { touched.current = true; f(v); };

  const { rows } = calcHoutei({ haigusha, ko, daishu, oya, kyodaiFull: kf, kyodaiHalf: kh, kyodaiShibou: ks });
  const isan = Number(man.replace(/[^0-9.]/g, '')) * 10000;
  const hasKo = ko + daishu.filter((g) => g > 0).length > 0;

  useEffect(() => {
    if (!touched.current || sent.current) return;
    sent.current = true;
    void trackEvent({ lp_id: lpId, event_name: 'houtei_souzokubun', component_id: 'houtei-souzokubun' });
  });

  return (
    <div className="flex flex-col gap-4 rounded-2xl border-2 border-sky-200 bg-sky-50/60 p-4">
      <p className="flex items-center gap-2 text-[17px] font-black text-slate-900">
        <Scale size={22} className="text-sky-700" aria-hidden="true" />法定相続分の計算<span className="text-[12px] font-bold text-sky-700">無料</span>
      </p>

      <div className="flex flex-col gap-2">
        <p className="flex items-center gap-1.5 text-[13px] font-black text-slate-700"><Users size={16} aria-hidden="true" />亡くなった人の家族（相続放棄した人は入れない）</p>
        <div className="grid grid-cols-2 gap-2" role="group" aria-label="配偶者">
          {[true, false].map((v) => (
            <button key={String(v)} type="button" aria-pressed={haigusha === v} onClick={() => touch(setHaigusha)(v)}
              className={`rounded-xl px-3 py-2.5 text-[14px] font-bold ring-1 ${haigusha === v ? 'bg-sky-700 text-white ring-sky-700' : 'bg-white text-slate-800 ring-slate-200'}`}>
              配偶者{v ? 'がいる' : 'はいない'}
            </button>
          ))}
        </div>
        <Count label="子（生きている）" value={ko} set={touch(setKo)} />
        {daishu.map((g, i) => (
          <div key={i} className="ml-3 flex flex-col gap-1">
            <Count label={`先に亡くなった子${daishu.length > 1 ? ` ${i + 1}` : ''}の子（孫）`} value={g} set={touch((n: number) => setDaishu((a) => a.map((x, k) => (k === i ? n : x))))} />
          </div>
        ))}
        <div className="flex gap-2 text-[12px]">
          <button type="button" onClick={() => touch(setDaishu)([...daishu, 1])} className="rounded-lg bg-white px-2.5 py-1.5 font-bold text-sky-800 ring-1 ring-sky-200">＋ 先に亡くなった子がいる</button>
          {daishu.length > 0 && <button type="button" onClick={() => touch(setDaishu)(daishu.slice(0, -1))} className="rounded-lg bg-white px-2.5 py-1.5 font-bold text-slate-600 ring-1 ring-slate-200">1人消す</button>}
        </div>

        {!hasKo && (
          <>
            <Count label="親（父母で生きている人）" value={oya} set={touch(setOya)} max={2} />
            {oya === 0 && (
              <>
                <Count label="兄弟姉妹（父母とも同じ）" value={kf} set={touch(setKf)} />
                <Count label="兄弟姉妹（父母の片方だけ同じ）" value={kh} set={touch(setKh)} />
                {ks.map((s, i) => (
                  <div key={i} className="ml-3 flex flex-col gap-1.5 rounded-xl bg-white/70 p-2 ring-1 ring-slate-200">
                    <div className="grid grid-cols-2 gap-1.5">
                      {[true, false].map((v) => (
                        <button key={String(v)} type="button" aria-pressed={s.full === v} onClick={() => touch(setKs)(ks.map((x, k) => (k === i ? { ...x, full: v } : x)))}
                          className={`rounded-lg px-2 py-1.5 text-[12px] font-bold ring-1 ${s.full === v ? 'bg-sky-700 text-white ring-sky-700' : 'bg-white text-slate-700 ring-slate-200'}`}>
                          {v ? '父母とも同じ' : '片方だけ同じ'}
                        </button>
                      ))}
                    </div>
                    <Count label={`先に亡くなった兄弟姉妹${ks.length > 1 ? ` ${i + 1}` : ''}の子（おい・めい）`} value={s.oi} set={touch((n: number) => setKs((a) => a.map((x, k) => (k === i ? { ...x, oi: n } : x))))} />
                  </div>
                ))}
                <div className="flex gap-2 text-[12px]">
                  <button type="button" onClick={() => touch(setKs)([...ks, { full: true, oi: 1 }])} className="rounded-lg bg-white px-2.5 py-1.5 font-bold text-sky-800 ring-1 ring-sky-200">＋ 先に亡くなった兄弟姉妹がいる</button>
                  {ks.length > 0 && <button type="button" onClick={() => touch(setKs)(ks.slice(0, -1))} className="rounded-lg bg-white px-2.5 py-1.5 font-bold text-slate-600 ring-1 ring-slate-200">1人消す</button>}
                </div>
              </>
            )}
          </>
        )}
      </div>

      <label className="flex flex-col gap-1.5">
        <span className="text-[13px] font-black text-slate-700">遺産の額（分かれば。万円）</span>
        <input inputMode="numeric" value={man} onChange={(e) => touch(setMan)(e.target.value)} placeholder="例：10000（1億円）"
          className="rounded-xl bg-white px-3 py-3 text-[17px] font-bold text-slate-900 ring-1 ring-slate-300 outline-none focus:ring-2 focus:ring-sky-600" aria-label="遺産の額（万円）" />
      </label>

      <div className="flex flex-col gap-2 rounded-xl bg-white p-3 ring-1 ring-slate-200" aria-live="polite">
        {rows.length === 0 ? (
          <p className="text-[14px] font-bold text-slate-700">相続人がいない形です。家族の人数を入れてください。</p>
        ) : (
          <table className="w-full text-[13px]">
            <thead className="text-[11px] text-slate-500">
              <tr><th className="py-1 text-left font-bold">相続人</th><th className="py-1 text-right font-bold">法定相続分</th>{isan > 0 && <th className="py-1 text-right font-bold">金額</th>}<th className="py-1 text-right font-bold">遺留分</th></tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.who} className="border-t border-slate-100 align-top">
                  <td className="py-2 pr-1 font-bold text-slate-900">{r.who}</td>
                  <td className="py-2 text-right text-[15px] font-black text-orange-700">{frText(r.share)}</td>
                  {isan > 0 && <td className="py-2 pl-1 text-right font-bold text-slate-900">{yen((isan * r.share[0]) / r.share[1])}</td>}
                  <td className="py-2 pl-1 text-right text-slate-600">{frText(r.iryu)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!hasKo && oya === 0 && <p className="text-[11px] text-slate-500">父母がどちらもいなくても、祖父母が生きていれば祖父母が相続人で、兄弟姉妹は相続人になりません（この計算では祖父母は扱いません）。</p>}
      </div>
      <p className="text-[11px] leading-relaxed text-slate-500">遺留分は、遺言があっても受け取れる最低限の割合の目安です。金額は1円未満を切り捨て。入れた内容は送られません。</p>
    </div>
  );
}
