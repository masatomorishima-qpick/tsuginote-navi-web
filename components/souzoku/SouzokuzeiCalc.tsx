'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Calculator, Minus, Plus } from 'lucide-react';
import { trackEvent } from '@/lib/trackEvent';
import DATA from '@/lib/souzoku/haifu-data.json';

/**
 * 相続税のかんたん計算（/guide/souzoku/souzokuzei-keisan、2026-11-10）。
 * 計算は国税庁 No.4152・4155・4158・4132 の手順どおり：
 *   基礎控除＝3,000万円＋600万円×法定相続人の数 → 課税遺産総額を法定相続分で分ける（千円未満切り捨て）
 *   → 速算表 → 合計＝相続税の総額。納める目安は「法定相続分どおりに分けた」と仮定し、
 *   配偶者は税額の軽減で0、兄弟姉妹は2割加算。小規模宅地の特例などは入れない（画面に書く）。
 * 使われたかは lp_event_logs の event_name 'souzokuzei_calc'（結果が出た1回目だけ）。
 */
const Z = DATA.zei;
const man = (yen: number) => {
  const m = Math.round(yen / 10000);
  if (m === 0) return '0円';
  if (m >= 10000) {
    const oku = Math.floor(m / 10000);
    const rest = m % 10000;
    return rest ? `${oku}億${rest.toLocaleString('ja-JP')}万円` : `${oku}億円`;
  }
  return `${m.toLocaleString('ja-JP')}万円`;
};

function taxOf(amount: number) {
  for (const r of Z.hayami) {
    if (r.upto === null || amount <= r.upto) return Math.max(0, amount * r.rate - r.kojo);
  }
  return 0;
}

export function calcSouzokuzei(isan: number, spouse: boolean, ko: number, oya: number, kyodai: number) {
  const kind: 'ko' | 'oya' | 'kyodai' | 'none' = ko > 0 ? 'ko' : oya > 0 ? 'oya' : kyodai > 0 ? 'kyodai' : 'none';
  const others = kind === 'ko' ? ko : kind === 'oya' ? oya : kind === 'kyodai' ? kyodai : 0;
  const ninzu = (spouse ? 1 : 0) + others;
  if (ninzu === 0) return null;
  const kiso = Z.kiso.base + Z.kiso.per * ninzu;
  const kazei = Math.max(0, Math.floor((isan - kiso) / 1000) * 1000);
  const sShare = !spouse ? 0 : kind === 'ko' ? Z.bun.koKo.haigusha : kind === 'oya' ? Z.bun.oya.haigusha : kind === 'kyodai' ? Z.bun.kyodai.haigusha : 1;
  const oShare = others > 0 ? (1 - sShare) / others : 0;
  let sogaku = 0;
  if (spouse) sogaku += taxOf(Math.floor((kazei * sShare) / 1000) * 1000);
  for (let i = 0; i < others; i++) sogaku += taxOf(Math.floor((kazei * oShare) / 1000) * 1000);
  // 納める目安：配偶者は法定相続分どおりなら軽減で0。兄弟姉妹は2割加算（No.4152）。
  const othersTax = sogaku * (1 - sShare) * (kind === 'kyodai' ? 1.2 : 1);
  return { ninzu, kiso, kazei, sogaku, nofu: othersTax, kakaru: kazei > 0, kind };
}

function Stepper({ label, value, set, max }: { label: string; value: number; set: (n: number) => void; max: number }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2 ring-1 ring-slate-200">
      <span className="text-[14px] font-bold text-slate-800">{label}</span>
      <span className="flex items-center gap-2">
        <button type="button" aria-label={`${label}を減らす`} onClick={() => set(Math.max(0, value - 1))} className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-700 disabled:opacity-40" disabled={value <= 0}><Minus size={16} /></button>
        <span className="w-8 text-center text-[18px] font-black text-slate-900" aria-live="polite">{value}人</span>
        <button type="button" aria-label={`${label}を増やす`} onClick={() => set(Math.min(max, value + 1))} className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-700 disabled:opacity-40" disabled={value >= max}><Plus size={16} /></button>
      </span>
    </div>
  );
}

const PRESETS = [3000, 5000, 8000, 10000, 20000];

export default function SouzokuzeiCalc({ lpId }: { lpId: string }) {
  const [isanMan, setIsanMan] = useState<string>('');
  const [spouse, setSpouse] = useState(true);
  const [ko, setKo] = useState(2);
  const [oya, setOya] = useState(0);
  const [kyodai, setKyodai] = useState(0);
  const sent = useRef(false);

  const isan = Number(isanMan.replace(/[^\d]/g, '')) * 10000;
  const r = useMemo(() => (isan > 0 ? calcSouzokuzei(isan, spouse, ko, ko > 0 ? 0 : oya, ko > 0 || oya > 0 ? 0 : kyodai) : null), [isan, spouse, ko, oya, kyodai]);

  useEffect(() => {
    if (!r || sent.current) return;
    sent.current = true;
    void trackEvent({ lp_id: lpId, event_name: 'souzokuzei_calc', component_id: 'souzokuzei-calc', metadata: { kakaru: r.kakaru, ninzu: r.ninzu } });
  }, [r, lpId]);

  return (
    <div className="flex flex-col gap-3 rounded-2xl border-2 border-sky-200 bg-sky-50/60 p-4">
      <p className="flex items-center gap-2 text-[17px] font-black text-slate-900">
        <Calculator size={22} className="text-sky-700" aria-hidden="true" />相続税のかんたん計算<span className="text-[12px] font-bold text-sky-700">無料</span>
      </p>
      <label className="flex flex-col gap-1.5">
        <span className="text-[13px] font-bold text-slate-700">遺産の合計</span>
        <span className="flex items-center gap-2 rounded-xl bg-white px-3 ring-1 ring-slate-300 focus-within:ring-2 focus-within:ring-sky-600">
          <input
            value={isanMan}
            onChange={(e) => setIsanMan(e.target.value.normalize('NFKC'))}
            inputMode="numeric"
            placeholder="例：8000"
            className="w-full bg-transparent py-3 text-right text-[20px] font-black text-slate-900 outline-none placeholder:text-[16px] placeholder:font-normal placeholder:text-slate-400"
            aria-label="遺産の合計（万円）"
          />
          <span className="shrink-0 text-[15px] font-bold text-slate-700">万円</span>
        </span>
      </label>
      <div className="flex flex-wrap gap-1.5">
        {PRESETS.map((v) => (
          <button key={v} type="button" onClick={() => setIsanMan(String(v))} className="rounded-lg bg-white px-2.5 py-1 text-[13px] font-bold text-sky-800 ring-1 ring-sky-200">{man(v * 10000)}</button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="配偶者">
        {[true, false].map((v) => (
          <button key={String(v)} type="button" role="radio" aria-checked={spouse === v} onClick={() => setSpouse(v)}
            className={`rounded-xl py-2.5 text-[14px] font-bold ring-1 ${spouse === v ? 'bg-sky-700 text-white ring-sky-700' : 'bg-white text-slate-800 ring-slate-300'}`}>
            配偶者{v ? 'がいる' : 'はいない'}
          </button>
        ))}
      </div>
      <Stepper label="子ども" value={ko} set={setKo} max={6} />
      {ko === 0 && <Stepper label="父母" value={oya} set={setOya} max={2} />}
      {ko === 0 && oya === 0 && <Stepper label="兄弟姉妹" value={kyodai} set={setKyodai} max={6} />}

      {r === null && isan > 0 && <p className="text-[13px] text-slate-600">相続人を1人以上にしてください</p>}
      {r && (
        <div className="flex flex-col gap-2" aria-live="polite">
          <div className={`rounded-xl p-3 text-center ${r.kakaru ? 'bg-orange-600 text-white' : 'bg-emerald-600 text-white'}`}>
            <p className="text-[13px] font-bold opacity-90">{!r.kakaru ? '基礎控除の内。相続税はかからない見込み' : r.nofu > 0 ? '相続税がかかる見込み' : '申告が要る見込み'}</p>
            {r.kakaru && r.nofu > 0 && <p className="text-[26px] font-black leading-tight">納める目安 約{man(r.nofu)}</p>}
            {r.kakaru && r.nofu === 0 && <p className="text-[16px] font-black leading-snug">配偶者の税額の軽減で、納める額は0円の見込み</p>}
          </div>
          <dl className="grid grid-cols-3 gap-1.5 text-center">
            {[
              { k: '基礎控除', v: man(r.kiso), s: `相続人${r.ninzu}人` },
              { k: '課税される遺産', v: man(r.kazei), s: '遺産−基礎控除' },
              { k: '相続税の総額', v: man(r.sogaku), s: '分ける前' },
            ].map((x) => (
              <div key={x.k} className="flex flex-col gap-0.5 rounded-xl bg-white px-1.5 py-2 ring-1 ring-slate-200">
                <dt className="text-[11px] text-slate-500">{x.k}</dt>
                <dd className="text-[14px] font-black text-slate-900">{x.v}</dd>
                <dd className="text-[10px] text-slate-400">{x.s}</dd>
              </div>
            ))}
          </dl>
          <p className="text-[11px] leading-relaxed text-slate-600">
            法定相続分どおりに分けたときの目安です。{spouse && '配偶者は「配偶者の税額の軽減」で0円として計算。'}{r.kind === 'kyodai' && '兄弟姉妹は2割加算を入れています。'}小規模宅地の特例などは入れていません。
          </p>
        </div>
      )}
      <p className="text-[11px] leading-relaxed text-slate-500">遺産の合計は、借金と葬式の費用を引き、死亡保険金は非課税の分（500万円×相続人の数）を引いた額で入れます。入れた数字は送られません。</p>
    </div>
  );
}
