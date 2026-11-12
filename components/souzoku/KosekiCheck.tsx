'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, ListChecks, MapPin, Wallet } from 'lucide-react';
import { trackEvent } from '@/lib/trackEvent';
import DATA from '@/lib/souzoku/haifu-data.json';

/**
 * 相続の戸籍の集め方：誰が相続人か・誰が集めるかを選ぶと、要る戸籍と、広域交付で取れるかが出る＋手数料（/guide/souzoku/koseki-atsumekata、2026-11-13）。
 * 要る戸籍：全国銀行協会（亡くなった人の出生から死亡まで・相続人全員）・裁判所「相続の放棄の申述」（順位ごとに足す戸籍）。
 * 広域交付：法務省（本人・配偶者・直系尊属・直系卑属の戸籍だけ。窓口だけ）。手数料は横浜市の例（450円・750円）。
 * 使われたかは lp_event_logs の event_name 'koseki_atsume'（1回目だけ）。入れた内容は送らない。
 */
const K = DATA.koseki;
type Pat = 'ko' | 'oya' | 'kyoudai';
type Who = 'haigu' | 'ko' | 'mago' | 'oya' | 'kyoudai' | 'oime';
type Res = 'ok' | 'ng' | 'maybe';

const WHO_BY_PAT: Record<Pat, Who[]> = { ko: ['haigu', 'ko', 'mago'], oya: ['haigu', 'oya'], kyoudai: ['haigu', 'kyoudai', 'oime'] };

/** 戸籍の人（亡くなった人から見た続柄）が、集める人の本人・配偶者・直系か。 */
const KOUIKI: Record<string, Record<Who, Res>> = {
  hisouzoku: { haigu: 'ok', ko: 'ok', mago: 'ok', oya: 'ok', kyoudai: 'ng', oime: 'ng' },
  self: { haigu: 'ok', ko: 'ok', mago: 'ok', oya: 'ok', kyoudai: 'ok', oime: 'ok' },
  ko: { haigu: 'maybe', ko: 'ng', mago: 'ok', oya: 'ok', kyoudai: 'ng', oime: 'ng' },
  oya: { haigu: 'ng', ko: 'ok', mago: 'ok', oya: 'ok', kyoudai: 'ok', oime: 'ok' },
  kyoudai: { haigu: 'ng', ko: 'ng', mago: 'ng', oya: 'ok', kyoudai: 'ng', oime: 'ok' },
};

/** 選んだ形で要る戸籍の行。 */
export function kosekiItems(pat: Pat, shiboKo: boolean, shiboKyoudai: boolean) {
  return K.items.filter((it) => {
    switch (it.when) {
      case 'all': return true;
      case 'ko+shibouko': return pat === 'ko' && shiboKo;
      case 'oyakyoudai+shibouko': return pat !== 'ko' && shiboKo;
      case 'kyoudai': return pat === 'kyoudai';
      case 'kyoudai+shiboukyoudai': return pat === 'kyoudai' && shiboKyoudai;
      default: return false;
    }
  });
}

export function kosekiKouiki(whose: string, who: Who): Res {
  return KOUIKI[whose]?.[who] ?? 'ng';
}

export function kosekiHiyou(nKoseki: number, nJoseki: number) {
  return Math.max(0, nKoseki) * K.tesuryo.koseki + Math.max(0, nJoseki) * K.tesuryo.joseki;
}

const LABEL: Record<Res, { t: string; c: string }> = {
  ok: { t: '広域交付で取れる：最寄りの市区町村の窓口', c: 'text-emerald-700' },
  maybe: { t: '自分の子なら広域交付で取れる。そうでなければ本籍地へ', c: 'text-amber-700' },
  ng: { t: '広域交付では取れない：本籍地の市区町村へ', c: 'text-slate-600' },
};

const num = (s: string) => Math.min(99, Number(s.replace(/[^0-9]/g, '')) || 0);

export default function KosekiCheck({ lpId }: { lpId: string }) {
  const [pat, setPat] = useState<Pat>('ko');
  const [who, setWho] = useState<Who>('ko');
  const [shiboKo, setShiboKo] = useState(false);
  const [shiboKyoudai, setShiboKyoudai] = useState(false);
  const [nk, setNk] = useState('');
  const [nj, setNj] = useState('');
  const sent = useRef(false);
  const touched = useRef(false);
  const touch = <V,>(f: (v: V) => void) => (v: V) => { touched.current = true; f(v); };

  useEffect(() => {
    if (!touched.current || sent.current) return;
    sent.current = true;
    void trackEvent({ lp_id: lpId, event_name: 'koseki_atsume', component_id: 'koseki-atsume' });
  });

  const pickPat = (p: Pat) => {
    touched.current = true;
    setPat(p);
    if (!WHO_BY_PAT[p].includes(who)) setWho(WHO_BY_PAT[p][0]);
    if (p !== 'kyoudai') setShiboKyoudai(false);
  };
  const list = kosekiItems(pat, shiboKo, shiboKyoudai);
  const hiyou = kosekiHiyou(num(nk), num(nj));
  const box = (on: boolean) => `flex h-5 w-5 shrink-0 items-center justify-center rounded-full ring-1 ${on ? 'bg-emerald-600 text-white ring-emerald-600' : 'bg-white text-transparent ring-slate-300'}`;

  return (
    <div className="flex flex-col gap-4 rounded-2xl border-2 border-sky-200 bg-sky-50/60 p-4">
      <p className="flex items-center gap-2 text-[17px] font-black text-slate-900">
        <ListChecks size={22} className="text-sky-700" aria-hidden="true" />要る戸籍を一覧に<span className="text-[12px] font-bold text-sky-700">無料</span>
      </p>

      <div className="flex flex-col gap-1.5" role="radiogroup" aria-label="相続人">
        <p className="text-[13px] font-black text-slate-700">相続人は（配偶者がいれば配偶者も）</p>
        {K.patterns.map((p) => (
          <button key={p.key} type="button" role="radio" aria-checked={pat === p.key} onClick={() => pickPat(p.key as Pat)}
            className={`flex w-full items-center gap-2.5 rounded-xl bg-white p-2.5 text-left ring-1 ${pat === p.key ? 'ring-emerald-300' : 'ring-slate-200'}`}>
            <span className={box(pat === p.key)}><Check size={13} aria-hidden="true" /></span>
            <span className="text-[14px] font-bold text-slate-900">{p.h}</span>
          </button>
        ))}
        {[
          { on: shiboKo, set: setShiboKo, h: '亡くなった人の子で、すでに亡くなった人がいる', show: true },
          { on: shiboKyoudai, set: setShiboKyoudai, h: '兄弟姉妹で、すでに亡くなった人がいる', show: pat === 'kyoudai' },
        ].filter((o) => o.show).map((o) => (
          <button key={o.h} type="button" aria-pressed={o.on} onClick={() => touch(o.set)(!o.on)}
            className={`flex w-full items-center gap-2.5 rounded-xl bg-white p-2.5 text-left ring-1 ${o.on ? 'ring-emerald-300' : 'ring-slate-200'}`}>
            <span className={box(o.on).replace('rounded-full', 'rounded-md')}><Check size={13} aria-hidden="true" /></span>
            <span className="text-[13px] font-bold text-slate-900">{o.h}</span>
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-1.5" role="radiogroup" aria-label="集める人">
        <p className="text-[13px] font-black text-slate-700">集める人は、亡くなった人の</p>
        <div className="flex flex-wrap gap-1.5">
          {K.seikyusha.filter((s) => WHO_BY_PAT[pat].includes(s.key as Who)).map((s) => (
            <button key={s.key} type="button" role="radio" aria-checked={who === s.key} onClick={() => touch(setWho)(s.key as Who)}
              className={`rounded-full px-3 py-1.5 text-[13px] font-bold ring-1 ${who === s.key ? 'bg-emerald-600 text-white ring-emerald-600' : 'bg-white text-slate-800 ring-slate-300'}`}>
              {s.h}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2 rounded-xl bg-white p-3 ring-1 ring-slate-200" aria-live="polite">
        <p className="text-[15px] font-black text-orange-700">集める戸籍 {list.length}種類</p>
        <ol className="flex flex-col gap-2">
          {list.map((it, i) => {
            const r = kosekiKouiki(it.whose, who);
            return (
              <li key={it.key} className="flex gap-2 text-[13px]">
                <span className="w-5 shrink-0 text-right font-black text-slate-400">{i + 1}</span>
                <span className="flex flex-col">
                  <span className="font-bold text-slate-900">{it.h}</span>
                  <span className="text-[11px] text-slate-500">{it.d}</span>
                  <span className={`flex items-center gap-1 text-[11px] font-bold ${LABEL[r].c}`}><MapPin size={12} aria-hidden="true" />{it.whose === 'self' ? '自分の分は広域交付で取れる：最寄りの市区町村の窓口' : LABEL[r].t}</span>
                </span>
              </li>
            );
          })}
        </ol>
      </div>

      <div className="flex flex-col gap-2">
        <p className="flex items-center gap-1.5 text-[13px] font-black text-slate-700"><Wallet size={16} aria-hidden="true" />手数料の目安（通数を入れる）</p>
        {[
          { v: nk, set: setNk, h: '今の戸籍', s: `1通${K.tesuryo.koseki}円` },
          { v: nj, set: setNj, h: '除籍・改製原戸籍', s: `1通${K.tesuryo.joseki}円` },
        ].map((f) => (
          <label key={f.h} className="flex items-center gap-2">
            <span className="flex w-32 shrink-0 flex-col text-[13px] font-bold text-slate-700">{f.h}<span className="text-[11px] font-normal text-slate-500">{f.s}</span></span>
            <input inputMode="numeric" value={f.v} onChange={(e) => touch(f.set)(e.target.value)} placeholder="通" aria-label={`${f.h}の通数`}
              className="min-w-0 flex-1 rounded-xl bg-white px-3 py-2.5 text-[16px] font-bold text-slate-900 ring-1 ring-slate-300 outline-none focus:ring-2 focus:ring-sky-600" />
          </label>
        ))}
        {hiyou > 0 && (
          <p className="rounded-xl bg-white p-3 text-[13px] text-slate-700 ring-1 ring-slate-200" aria-live="polite">
            <span className="block text-[18px] font-black text-orange-700">{hiyou.toLocaleString('ja-JP')}円</span>
            今の戸籍 {num(nk)}通 × {K.tesuryo.koseki}円 ＋ 除籍・改製原戸籍 {num(nj)}通 × {K.tesuryo.joseki}円
          </p>
        )}
      </div>
      <p className="text-[11px] leading-relaxed text-slate-500">手数料は横浜市の額です。請求先の市区町村で確かめてください。{K.chuui}入れた内容は送られません。</p>
    </div>
  );
}
