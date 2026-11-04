'use client';

import { useCallback, useEffect, useRef, useState, type ComponentType } from 'react';
import { sendGAEvent } from '@next/third-parties/google';
import { ArrowRight, Bath, Building, Building2, CircleCheck, House, Snowflake, Thermometer, type LucideProps } from 'lucide-react';
import { trackEvent } from '@/lib/trackEvent';
import WaitlistPanel from '@/components/kyutoki/WaitlistPanel';
import {
  LP_ID, VERSION, PRICE, PRICE_ROWS, PRICE_SRC_URL, HOME_STEP, CTAS, HELP,
  type Cta, type MHome,
} from '@/lib/kyutoki/mitsumori';

/**
 * 給湯器 B「総額の一覧と2つのボタン」（クライアント部品）。2026-11-02 新設、2026-11-04 b3 で作り替え。
 *
 * b3：質問をやめ、最初の画面に種類別の総額（本体・工事込み）と2つのボタンを置く。
 *   ボタンを押したら「お住まい」を1問だけ聞き、賃貸なら管理会社への案内、それ以外は準備中のお知らせ（WaitlistPanel）。
 *
 * 計測（GA4 と lp_event_logs の両方。lp_id = kyutoki-mitsumori、metadata に utm_* / gclid / 版 / 入口）
 *   kyutoki_m_result  … 総額の一覧とボタンが画面に半分以上入った（form＝shown。ニーズの分母）
 *   kyutoki_cta_click … 「確かめた会社に見積もりを頼む（quotes）」か「手元の見積もりを見てもらう（check）」を押した＝主の数字
 *   kyutoki_m_answer  … 押したあとのお住まい（step＝home）
 *   kyutoki_m_stop    … 賃貸で止めた（reason＝rent。押した数からは外して読む）
 *   kyutoki_need_select / kyutoki_waitlist_submit … WaitlistPanel（いちばん知りたいこと／お知らせ用のメール）
 */

type Icon = ComponentType<LucideProps>;
const KINO_ICONS: Record<string, Icon> = { kyuto: Thermometer, furo: Bath, danbo: Snowflake };
const HOME_ICONS: Record<string, Icon> = { house: House, mansion: Building, rent: Building2 };

const ATTR_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid'];
const ATTR_STORE = 'kyutoki_m_attr';
function readAttribution(): Record<string, string> {
  const out: Record<string, string> = {};
  try {
    const sp = new URLSearchParams(window.location.search);
    ATTR_KEYS.forEach((k) => { const v = sp.get(k); if (v) out[k] = v.slice(0, 200); });
    if (Object.keys(out).length > 0) { sessionStorage.setItem(ATTR_STORE, JSON.stringify(out)); return out; }
    const saved = sessionStorage.getItem(ATTR_STORE);
    return saved ? (JSON.parse(saved) as Record<string, string>) : out;
  } catch {
    return out;
  }
}

export default function MitsumoriDiagnosis({ entry = 'mitsumori' }: { entry?: string }) {
  const attr = useRef<Record<string, string>>({});
  const boardRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [cta, setCta] = useState<Cta | null>(null);
  const [home, setHome] = useState<MHome | null>(null);

  useEffect(() => { attr.current = readAttribution(); }, []);

  const log = useCallback((event: string, params: Record<string, string | number> = {}, extra: Partial<Parameters<typeof trackEvent>[0]> = {}) => {
    sendGAEvent('event', event, { lp_name: LP_ID, version: VERSION, ...params });
    void trackEvent({ lp_id: LP_ID, event_name: event, ...extra, metadata: { ...params, ...attr.current, version: VERSION, entry } });
  }, [entry]);

  // 総額の一覧とボタンが見えた（初回だけ）＝ニーズの分母
  useEffect(() => {
    const el = boardRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    let done = false;
    const io = new IntersectionObserver((ents) => {
      if (done || !ents.some((e) => e.isIntersecting)) return;
      done = true;
      attr.current = Object.keys(attr.current).length ? attr.current : readAttribution();
      log('kyutoki_m_result', { form: 'shown', layout: 'board' }, { section_id: 'result' });
      io.disconnect();
    }, { threshold: 0.5 });
    io.observe(el);
    return () => io.disconnect();
  }, [log]);

  const scrollToPanel = () => setTimeout(() => panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);

  const pickCta = (k: Cta) => {
    setCta(k);
    setHome(null);
    log('kyutoki_cta_click', { cta: k }, { cta_id: k, section_id: 'result' });
    scrollToPanel();
  };

  const pickHome = (v: MHome) => {
    setHome(v);
    log('kyutoki_m_answer', { step: 'home', answer: v, cta: cta ?? '' }, { question_id: 'home', answer_id: v });
    if (v === 'rent') log('kyutoki_m_stop', { reason: 'rent', cta: cta ?? '' }, { section_id: 'stop' });
  };

  const reset = () => { setCta(null); setHome(null); };

  const help = cta ? HELP[cta] : null;
  const helpCard = help && (
    <div className="flex flex-col gap-3 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
      <p className="text-[18px] font-black text-slate-900">{help.title}</p>
      <ul className="flex flex-col gap-2">
        {help.items.map((t) => (
          <li key={t} className="flex items-start gap-2 text-[14px] leading-snug text-slate-800">
            <CircleCheck size={18} className="mt-px shrink-0 text-emerald-600" aria-hidden="true" />{t}
          </li>
        ))}
      </ul>
      <p className="text-[12px] leading-relaxed text-slate-500">{help.note}</p>
    </div>
  );

  let after: React.ReactNode = null;
  if (cta && !home) {
    after = (
      <div className="flex flex-col gap-3 rounded-2xl border-2 border-sky-200 bg-sky-50/60 p-4">
        <p className="text-[15px] font-bold text-slate-700">{cta === 'check' ? '見積もりを見る受付' : '工事会社の紹介'}は準備中です。始まったらお知らせできます</p>
        <p className="text-[18px] font-black text-slate-900">{HOME_STEP.q}</p>
        <div className="grid grid-cols-3 gap-2">
          {HOME_STEP.opts.map((o) => {
            const I = HOME_ICONS[o.v];
            return (
              <button
                key={o.v}
                type="button"
                onClick={() => pickHome(o.v as MHome)}
                className="flex min-h-[72px] flex-col items-center justify-center gap-1 rounded-2xl border-2 border-slate-200 bg-white px-1 py-2 text-center transition hover:border-sky-500 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-sky-600"
              >
                {I && <I size={22} className="text-sky-700" aria-hidden="true" />}
                <span className="text-[14px] font-bold leading-tight text-slate-800">{o.t}</span>
                {o.s && <span className="text-[11px] leading-tight text-slate-500">{o.s}</span>}
              </button>
            );
          })}
        </div>
      </div>
    );
  } else if (cta && home === 'rent') {
    after = (
      <div className="flex flex-col items-center gap-2 rounded-2xl bg-slate-50 p-5 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-sky-100 text-sky-700"><Building2 size={24} aria-hidden="true" /></span>
        <p className="text-[18px] font-black text-slate-900">まず管理会社か大家さんへ</p>
        <p className="text-[14px] text-slate-600">給湯器は建物の設備で、交換の手配と費用の負担は契約で決まっていることが多いです。</p>
      </div>
    );
  } else if (cta && home) {
    after = (
      <WaitlistPanel
        cta={cta}
        answers={{ home }}
        entry={entry}
        version={VERSION}
        getAttribution={() => attr.current}
        onEvent={(ev, params = {}) => {
          log(ev, params, { section_id: 'lead' });
          if (ev === 'kyutoki_waitlist_submit') sendGAEvent('event', 'generate_lead', { lp_name: LP_ID, version: VERSION, cta });
        }}
      />
    );
  }

  return (
    <div id="check" className="flex scroll-mt-20 flex-col gap-4">
      <div
        ref={boardRef}
        className="flex flex-col gap-3 rounded-[24px] bg-white px-5 pt-4 pb-5 shadow-[0_2px_0_#e2e8f0,0_20px_40px_-24px_rgba(15,40,70,.35)] ring-1 ring-slate-200"
      >
        <div className="flex items-baseline justify-between">
          <p className="text-[15px] font-black text-slate-900">交換の総額の目安</p>
          <span className="text-[11px] font-bold text-slate-500">本体・工事込み・税込</span>
        </div>
        <ul className="flex flex-col divide-y divide-slate-100">
          {PRICE_ROWS.map((r) => {
            const I = KINO_ICONS[r.kino];
            const p = PRICE[r.kino];
            return (
              <li key={r.kino} className="flex items-center gap-3 py-2">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-50 text-sky-700"><I size={19} aria-hidden="true" /></span>
                <span className="flex flex-1 flex-col">
                  <span className="text-[15px] font-bold leading-tight text-slate-800">{r.t}</span>
                  <span className="text-[11px] leading-tight text-slate-500">{r.s}</span>
                </span>
                <span className="whitespace-nowrap text-[22px] font-black tabular-nums text-slate-900">
                  {p.min}〜{p.max}<span className="ml-0.5 text-[13px]">万円</span>
                </span>
              </li>
            );
          })}
        </ul>
        <p className="-mt-1 text-[11px] leading-snug text-slate-500">号数・省エネ型か・置き場所でも変わります</p>

        <p className="text-center text-[15px] font-bold text-slate-800">妥当か、見積もりで確かめる</p>
        <div className="grid gap-2.5">
          {(Object.keys(CTAS) as Cta[]).map((k, i) => (
            <button
              key={k}
              type="button"
              aria-pressed={cta === k}
              onClick={() => pickCta(k)}
              className={i === 0
                ? 'flex min-h-[60px] w-full flex-col items-center justify-center rounded-2xl bg-orange-600 px-5 text-white shadow-[0_8px_20px_-10px_rgba(234,88,12,.8)] transition hover:bg-orange-700 active:scale-[.99]'
                : 'flex min-h-[60px] w-full flex-col items-center justify-center rounded-2xl border-2 border-orange-300 bg-white px-5 text-orange-800 transition hover:border-orange-500 active:scale-[.99]'}
            >
              <span className="flex items-center gap-1.5 text-[17px] font-bold">{CTAS[k].label}<ArrowRight size={18} aria-hidden="true" /></span>
              <span className={`text-[12px] ${i === 0 ? 'text-orange-100' : 'text-slate-500'}`}>{CTAS[k].sub}</span>
            </button>
          ))}
        </div>
        <p className="text-center text-[11px] text-slate-500">無料・名前や電話番号の入力なし</p>
      </div>

      {after && (
        <div ref={panelRef} aria-live="polite" className="flex scroll-mt-20 flex-col gap-3">
          {helpCard}
          {after}
          <button type="button" onClick={reset} className="self-start py-2 text-sm text-slate-500 underline-offset-4 hover:underline">← ボタンを選び直す</button>
        </div>
      )}

      <p className="text-[11px] leading-relaxed text-slate-500">
        目安は<a href={PRICE_SRC_URL} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">東京ガス「給湯器の選び方」</a>の相場（2026年10月確認）。
        号数や置き場所で変わるため、正確な金額は見積もりで確かめます。
      </p>
    </div>
  );
}
