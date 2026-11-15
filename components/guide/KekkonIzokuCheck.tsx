'use client';

import { useEffect, useRef, useState } from 'react';
import { CircleCheck, CircleMinus, CircleX, Landmark } from 'lucide-react';
import { trackEvent } from '@/lib/trackEvent';
import DATA from '@/lib/hoken/haifu-data.json';

/**
 * 結婚したときの保険の見直し（/guide/shisan-kanri/hoken-minaoshi-kekkon、2026-11-16）。
 * 子のない夫婦で、片方が亡くなったときに公的な遺族年金が出るかの目安。
 * 決まり：日本年金機構「遺族厚生年金（受給要件・対象者・年金額）」（2026-11-12 更新）・「遺族年金ガイド 令和8年度版」。
 *   遺族基礎年金：子のある配偶者か子だけ → 子のない配偶者は出ない。
 *   遺族厚生年金：厚生年金の被保険者などが亡くなったとき。子のない妻は30歳未満なら5年間、子のない夫は55歳以上で60歳から。
 *   中高齢寡婦加算：夫の死亡時に40歳以上65歳未満の子のない妻など。年635,500円（令和8年度）。夫の加入期間20年以上などの条件。
 * 2028年4月からの見直し（厚生労働省、令和7年6月30日更新）：子のない60歳未満の配偶者は原則5年の有期給付。女性は2028年度末に40歳未満の人から。
 *   いまの年齢から 2028年度末（2029-03-31）の年齢を出すのは誕生日しだいで1歳ずれるので、境目は「誕生日しだい」と出す。
 * 使われたかは lp_event_logs の event_name 'kekkon_izoku'（1回目だけ）。入れた内容は送らない。
 */
const K = DATA.kekkon;
type Kekka = { h: string; v: string; d: string; kind: 'ok' | 'part' | 'no' };

/** 2028年度末（2029年3月31日）に何歳か。誕生日がまだならいまの年齢＋(年の差)、来ていれば＋1。範囲で返す。 */
export function age2028End(age: number, today: Date) {
  // 2029年3月までの月数を整数で数える（誕生月が分からないので、年数は切り捨てと切り上げの範囲）
  const months = (2029 - today.getFullYear()) * 12 + (3 - (today.getMonth() + 1));
  return { min: age + Math.floor(months / 12), max: age + Math.ceil(months / 12) };
}

export function hantei(shibou: 'otto' | 'tsuma', kinmu: 'kousei' | 'kokumin', age: number, today: Date) {
  const r: Kekka[] = [];
  r.push({ h: '遺族基礎年金', v: '出ない', d: '受け取れるのは「子のある配偶者」か「子」。子が生まれると対象になる', kind: 'no' });
  if (kinmu === 'kokumin') {
    r.push({ h: '遺族厚生年金', v: 'ふつうは出ない', d: '厚生年金に入っている間に亡くなったときなどの年金。以前の会社員の期間などで出る場合もある', kind: 'no' });
    r.push({ h: '寡婦年金・死亡一時金', v: '出る場合がある', d: '寡婦年金は婚姻10年以上の妻が60〜65歳に受け取る。死亡一時金は保険料を納めた月が36月以上', kind: 'part' });
    return { rows: r, kaisei: '' };
  }
  const nokoru = shibou === 'otto' ? 'tsuma' : 'otto';
  if (nokoru === 'tsuma') {
    if (age < 30) r.push({ h: '遺族厚生年金', v: '5年間だけ', d: '子のない30歳未満の妻は5年間だけ受け取れる。額は報酬比例部分の4分の3', kind: 'part' });
    else r.push({ h: '遺族厚生年金', v: '受け取れる', d: `額は亡くなった夫の老齢厚生年金の報酬比例部分の4分の3${age >= 65 ? '。自分の老齢厚生年金も受け取れる人は、それとの調整がある' : ''}`, kind: 'ok' });
    if (age >= 40 && age < 65) r.push({ h: '中高齢寡婦加算', v: `年${K.chukorei.toLocaleString('ja-JP')}円`, d: `65歳まで足される（${K.nendo}）。夫が厚生年金に入っている間に亡くなったときは加入期間を問わない`, kind: 'ok' });
  } else {
    if (age < 55) r.push({ h: '遺族厚生年金', v: '出ない', d: '子のない夫は55歳以上に限られる', kind: 'no' });
    else if (age < 60) r.push({ h: '遺族厚生年金', v: '60歳から', d: '55歳以上なので受け取れるが、受け取り始めるのは60歳から', kind: 'part' });
    else r.push({ h: '遺族厚生年金', v: '受け取れる', d: `額は亡くなった妻の老齢厚生年金の報酬比例部分の4分の3${age >= 65 ? '。自分の老齢厚生年金も受け取れる人は、それとの調整がある' : ''}`, kind: 'ok' });
  }
  let kaisei = '';
  if (age < 60) {
    if (nokoru === 'otto') kaisei = age < 55
      ? '2028年4月からは、子のない60歳未満の夫も、原則5年間受け取れるようになる予定です（額は今の計算の額の約1.3倍）。'
      : '2028年4月からは、子のない60歳未満の夫は原則5年間の給付に変わる予定で、今の「60歳から」の扱いも変わる見込みです。厚生労働省の案内で確かめてください。';
    else {
      const a = age2028End(age, today);
      if (a.max < 40) kaisei = '2028年4月からの見直しの対象になる見込みです。子のない妻の遺族厚生年金は原則5年間になります（額は今の計算の額の約1.3倍）。';
      else if (a.min < 40) kaisei = '2028年度末に40歳未満かどうかは誕生日しだいです。40歳未満なら、2028年4月からは原則5年間の給付になります（額は今の計算の額の約1.3倍）。';
    }
  }
  return { rows: r, kaisei };
}

const ICON = { ok: CircleCheck, part: CircleMinus, no: CircleX };
const COLOR = { ok: 'text-emerald-600', part: 'text-amber-600', no: 'text-slate-400' };

export default function KekkonIzokuCheck({ lpId }: { lpId: string }) {
  const [shibou, setShibou] = useState<'otto' | 'tsuma' | ''>('');
  const [kinmu, setKinmu] = useState<'kousei' | 'kokumin' | ''>('');
  const [age, setAge] = useState('');
  const sent = useRef(false);
  const n = Number(age);
  const ageOk = age.trim() !== '' && Number.isInteger(n) && n >= 16 && n <= 99;
  const ok = !!shibou && !!kinmu && ageOk;
  const res = ok ? hantei(shibou as 'otto' | 'tsuma', kinmu as 'kousei' | 'kokumin', n, new Date()) : null;

  useEffect(() => {
    if (!ok || sent.current) return;
    sent.current = true;
    void trackEvent({ lp_id: lpId, event_name: 'kekkon_izoku', component_id: 'kekkon-izoku' });
  }, [ok, lpId]);

  const btn = (on: boolean) => `rounded-xl px-2 py-2.5 text-[13px] font-bold leading-snug ring-1 ${on ? 'bg-sky-700 text-white ring-sky-700' : 'bg-white text-slate-700 ring-slate-200'}`;

  return (
    <div className="flex flex-col gap-4 rounded-2xl border-2 border-sky-200 bg-sky-50/60 p-4">
      <p className="flex items-center gap-2 text-[17px] font-black text-slate-900">
        <Landmark size={22} className="text-sky-700" aria-hidden="true" />遺族年金が出るかの確認<span className="text-[12px] font-bold text-sky-700">無料</span>
      </p>
      <p className="text-[12px] text-slate-600">子のない夫婦で、どちらかが亡くなった場合</p>
      <div className="flex flex-col gap-1.5">
        <span className="text-[11px] font-bold text-slate-600">亡くなった場合を考える人</span>
        <div className="grid grid-cols-2 gap-1.5" role="radiogroup" aria-label="亡くなった場合を考える人">
          <button type="button" role="radio" aria-checked={shibou === 'otto'} onClick={() => setShibou('otto')} className={btn(shibou === 'otto')}>夫</button>
          <button type="button" role="radio" aria-checked={shibou === 'tsuma'} onClick={() => setShibou('tsuma')} className={btn(shibou === 'tsuma')}>妻</button>
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="text-[11px] font-bold text-slate-600">その人の働き方</span>
        <div className="grid grid-cols-2 gap-1.5" role="radiogroup" aria-label="その人の働き方">
          <button type="button" role="radio" aria-checked={kinmu === 'kousei'} onClick={() => setKinmu('kousei')} className={btn(kinmu === 'kousei')}>会社員・公務員</button>
          <button type="button" role="radio" aria-checked={kinmu === 'kokumin'} onClick={() => setKinmu('kokumin')} className={btn(kinmu === 'kokumin')}>自営業など<span className="block text-[10px] font-normal opacity-80">国民年金だけ</span></button>
        </div>
      </div>
      <label className="flex flex-col gap-1 text-[11px] font-bold text-slate-600">残る人のいまの年齢（歳）
        <input inputMode="numeric" value={age} placeholder="32" onChange={(e) => setAge(e.target.value)}
          className="w-full min-w-0 rounded-xl bg-white px-3 py-2.5 text-[16px] font-bold text-slate-900 ring-1 ring-slate-300 outline-none focus:ring-2 focus:ring-sky-600" />
      </label>
      {res && (
        <div className="flex flex-col gap-2" aria-live="polite">
          <ul className="grid gap-1.5">
            {res.rows.map((x) => {
              const I = ICON[x.kind];
              return (
                <li key={x.h} className="flex items-start gap-2.5 rounded-xl bg-white p-3 ring-1 ring-slate-200">
                  <I size={20} className={`mt-0.5 shrink-0 ${COLOR[x.kind]}`} aria-hidden="true" />
                  <span className="flex flex-1 flex-col">
                    <span className="flex flex-wrap items-baseline justify-between gap-x-2"><span className="text-[14px] font-bold text-slate-800">{x.h}</span><span className="text-[16px] font-black text-slate-900">{x.v}</span></span>
                    <span className="text-[12px] text-slate-600">{x.d}</span>
                  </span>
                </li>
              );
            })}
          </ul>
          {res.kaisei && <p className="rounded-xl bg-orange-50 p-2.5 text-[12px] leading-relaxed text-slate-800 ring-1 ring-orange-200">{res.kaisei}</p>}
          <p className="rounded-xl bg-white px-3 py-2.5 text-center text-[13px] font-bold text-slate-800 ring-1 ring-slate-200">公的な年金で足りない分が、死亡保障で備える額の目安</p>
        </div>
      )}
      <p className="text-[11px] leading-relaxed text-slate-500">{K.keisanNote}入れた内容は送られません。</p>
    </div>
  );
}
