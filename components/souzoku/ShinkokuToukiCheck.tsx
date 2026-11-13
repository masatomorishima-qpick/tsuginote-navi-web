'use client';

import { useEffect, useRef, useState } from 'react';
import { CalendarClock, Check, FileCheck2, ListChecks } from 'lucide-react';
import { trackEvent } from '@/lib/trackEvent';
import DATA from '@/lib/souzoku/haifu-data.json';

/**
 * 相続人申告登記の必要書類と期限（/guide/souzoku/souzokunin-shinkoku-touki、2026-11-14）。
 * 書類：法務省「相続人申告登記について」（令和8年3月24日更新）の申出人ごとの戸籍の証明書、住民票の写し（ふりがな・生年月日で省略可）、
 *   委任状（連名なら不要）、法定相続情報一覧図の写しで戸籍に代えられる。
 * 期限：法務省「相続登記の申請義務化について」（取得を知った日から3年。2024/4/1 より前の相続は 2027/3/31 まで）。
 *   遺産分割が成立したら、その日から3年以内に相続登記（相続人申告登記では果たせない）。
 * 使われたかは lp_event_logs の event_name 'shinkoku_touki'（1回目だけ）。入れた内容は送らない。
 */
const T = DATA.shinkokuTouki;
type Zoku = 'haigusha' | 'ko' | 'oya' | 'kyodai';

/** 「知った日から n 年以内」の最後の日：翌日から数えて n 年後の前の日（2025/2/28→2028/2/29）。 */
export function addYears(d: Date, n: number) {
  // 翌日から数えて、応当日の前の日。応当日がない月はその月の末日（国税通則法10条と同じ数え方）。
  const next = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
  const y = next.getFullYear();
  const m = next.getMonth() + n * 12;
  const dd = next.getDate() - 1;
  if (dd === 0) return new Date(y, m, 0);
  return new Date(y, m, Math.min(dd, new Date(y, m + 1, 0).getDate()));
}
const fmt = (d: Date) => `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;

/** 選んだ続柄と状況から、そろえる書類の一覧を返す。 */
export function shoruiList(z: Zoku, o: { ichiranzu: boolean; furigana: boolean; jusho: boolean; kanpu: boolean; dairi: boolean }) {
  const zk = T.zokugara.find((x) => x.key === z)!;
  const out: { h: string; saki: string; d?: string }[] = [{ h: T.common[0].h, saki: T.common[0].saki, d: T.common[0].d }];
  if (o.ichiranzu) out.push({ h: '法定相続情報一覧図の写し（または、申出書に法定相続情報番号を書く）', saki: '法務局で交付を受けたもの', d: '戸籍の代わりになる' });
  else zk.koseki.forEach((h) => out.push({ h, saki: '本籍地の市区町村' }));
  const byKey = Object.fromEntries(T.common.map((c) => [c.key, c]));
  if (!o.furigana) out.push({ h: byKey.jumin.h, saki: byKey.jumin.saki, d: 'マイナンバーの記載がないもの' });
  if (o.jusho) out.push({ h: byKey.joki.h, saki: byKey.joki.saki, d: byKey.joki.d });
  if (o.kanpu) out.push({ h: byKey.setsumeizu.h, saki: byKey.setsumeizu.saki, d: byKey.setsumeizu.d });
  if (o.dairi) out.push({ h: byKey.ininjo.h, saki: byKey.ininjo.saki, d: '相続人が連名で申し出るなら要らない' });
  return out;
}

export default function ShinkokuToukiCheck({ lpId }: { lpId: string }) {
  const [z, setZ] = useState<Zoku>('ko');
  const [opt, setOpt] = useState({ ichiranzu: false, furigana: true, jusho: false, kanpu: false, dairi: false });
  const [day, setDay] = useState('');
  const [bday, setBday] = useState('');
  const sent = useRef(false);
  const touched = useRef(false);

  useEffect(() => {
    if (!touched.current || sent.current) return;
    sent.current = true;
    void trackEvent({ lp_id: lpId, event_name: 'shinkoku_touki', component_id: 'shinkoku-touki' });
  });

  const list = shoruiList(z, opt);
  const base = day ? new Date(`${day}T00:00:00`) : null;
  const valid = !!base && !Number.isNaN(base.getTime());
  // 施行日（2024/4/1）までに知った分は 2027/3/31（施行日から3年）。
  const old = valid && base! <= new Date(`${T.gimuStart}T00:00:00`);
  const kigen = valid ? (old ? new Date(`${T.kigenOld}T00:00:00`) : addYears(base!, 3)) : null;
  const bbase = bday ? new Date(`${bday}T00:00:00`) : null;
  const bkigen = bbase && !Number.isNaN(bbase.getTime()) ? addYears(bbase, 3) : null;

  const OPTS: { k: keyof typeof opt; h: string }[] = [
    { k: 'ichiranzu', h: '法定相続情報一覧図の写しがある' },
    { k: 'furigana', h: '申出書にふりがなと生年月日を書く' },
    { k: 'jusho', h: '亡くなった人の登記簿の住所と本籍が違う' },
    { k: 'kanpu', h: '戸籍・住民票の原本を返してほしい' },
    { k: 'dairi', h: '代理人に頼む' },
  ];

  return (
    <div className="flex flex-col gap-4 rounded-2xl border-2 border-sky-200 bg-sky-50/60 p-4">
      <p className="flex items-center gap-2 text-[17px] font-black text-slate-900">
        <ListChecks size={22} className="text-sky-700" aria-hidden="true" />要る書類を一覧に<span className="text-[12px] font-bold text-sky-700">無料</span>
      </p>
      <div className="flex flex-col gap-1.5" role="radiogroup" aria-label="申し出る人と亡くなった人の続柄">
        <p className="text-[13px] font-black text-slate-700">申し出る人は、亡くなった人の</p>
        <div className="grid grid-cols-2 gap-1.5">
          {T.zokugara.map((k) => {
            const sel = z === k.key;
            return (
              <button key={k.key} type="button" role="radio" aria-checked={sel} onClick={() => { touched.current = true; setZ(k.key as Zoku); }}
                className={`flex items-center gap-2 rounded-xl bg-white p-2.5 text-left ring-1 ${sel ? 'ring-emerald-300' : 'ring-slate-200'}`}>
                <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ring-1 ${sel ? 'bg-emerald-600 text-white ring-emerald-600' : 'bg-white text-transparent ring-slate-300'}`}><Check size={12} aria-hidden="true" /></span>
                <span className="text-[13px] font-bold leading-tight text-slate-900">{k.h}</span>
              </button>
            );
          })}
        </div>
        {OPTS.map((o) => (
          <button key={o.k} type="button" aria-pressed={opt[o.k]} onClick={() => { touched.current = true; setOpt((s) => ({ ...s, [o.k]: !s[o.k] })); }}
            className={`flex w-full items-center gap-2.5 rounded-xl bg-white p-3 text-left ring-1 ${opt[o.k] ? 'ring-emerald-300' : 'ring-slate-200'}`}>
            <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md ring-1 ${opt[o.k] ? 'bg-emerald-600 text-white ring-emerald-600' : 'bg-white text-transparent ring-slate-300'}`}><Check size={16} aria-hidden="true" /></span>
            <span className="text-[14px] font-bold text-slate-900">{o.h}</span>
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2 rounded-xl bg-white p-3 ring-1 ring-slate-200" aria-live="polite">
        <p className="flex items-center gap-1.5 text-[15px] font-black text-orange-700"><FileCheck2 size={18} aria-hidden="true" />そろえる書類 {list.length}点</p>
        <ol className="flex flex-col gap-1.5">
          {list.map((it, i) => (
            <li key={it.h} className="flex gap-2 text-[13px]">
              <span className="w-5 shrink-0 text-right font-black text-slate-400">{i + 1}</span>
              <span className="flex flex-col"><span className="font-bold text-slate-900">{it.h}</span>
                <span className="text-[11px] text-slate-500">{it.saki}{it.d && `｜${it.d}`}</span></span>
            </li>
          ))}
        </ol>
        <p className="text-[11px] text-slate-500">登録免許税はかかりません。</p>
      </div>

      <label className="flex flex-col gap-1.5">
        <span className="flex items-center gap-1.5 text-[13px] font-black text-slate-700"><CalendarClock size={16} aria-hidden="true" />相続で不動産を取得したと知った日（ふつうは亡くなった日）</span>
        <input type="date" value={day} onChange={(e) => { touched.current = true; setDay(e.target.value); }} aria-label="取得を知った日"
          className="rounded-xl bg-white px-3 py-3 text-[17px] font-bold text-slate-900 ring-1 ring-slate-300 outline-none focus:ring-2 focus:ring-sky-600" />
      </label>
      {kigen && (
        <p className="rounded-xl bg-orange-50 p-3 text-[14px] font-black text-orange-800 ring-1 ring-orange-200">
          申し出の期限：{fmt(kigen)}まで（目安）
          <span className="mt-0.5 block text-[11px] font-bold text-orange-700">{old ? '知った日が2024年4月1日までなので、2027年3月31日まで' : '知った日から3年'}</span>
        </p>
      )}
      <label className="flex flex-col gap-1.5">
        <span className="text-[13px] font-black text-slate-700">相続人申告登記をした後に、遺産分割がまとまった日</span>
        <input type="date" value={bday} onChange={(e) => { touched.current = true; setBday(e.target.value); }} aria-label="遺産分割が成立した日"
          className="rounded-xl bg-white px-3 py-3 text-[17px] font-bold text-slate-900 ring-1 ring-slate-300 outline-none focus:ring-2 focus:ring-sky-600" />
      </label>
      {bkigen && (
        <p className="rounded-xl bg-orange-50 p-3 text-[14px] font-black text-orange-800 ring-1 ring-orange-200">
          相続登記の期限：{fmt(bkigen)}まで（目安）
          <span className="mt-0.5 block text-[11px] font-bold text-orange-700">遺産分割が成立した日から3年。相続人申告登記では果たせない。申し出をしていないなら、上の期限のほうが先</span>
        </p>
      )}
      <p className="text-[11px] leading-relaxed text-slate-500">期限は、翌日から数えた目安です。戸籍は1通で分かることは1通で足ります。入れた内容は送られません。</p>
    </div>
  );
}
