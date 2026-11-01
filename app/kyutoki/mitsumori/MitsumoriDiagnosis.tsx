'use client';

import { useCallback, useEffect, useRef, useState, type ComponentType } from 'react';
import { sendGAEvent } from '@next/third-parties/google';
import {
  Bath, Building, Building2, CalendarClock, CircleCheck, Flame, House, MapPin,
  Plug, Snowflake, Thermometer, Zap, type LucideProps,
} from 'lucide-react';
import { trackEvent } from '@/lib/trackEvent';
import QuoteRequestForm from '@/components/kyutoki/QuoteRequestForm';
import {
  LP_ID, VERSION, M_STEPS, mStopFor, priceOf, lcdOf, canRequest, PRICE_SRC_URL, labelOf,
  type MAnswers, type MStep, type MStepId, type MStopKey,
} from '@/lib/kyutoki/mitsumori';

/**
 * 給湯器 B「見積もりの条件チェック」（クライアント部品）。2026-11-02 新設。
 *
 * 計測（GA4 と lp_event_logs の両方。lp_id = kyutoki-mitsumori、metadata に utm_* / gclid / 版）
 *   kyutoki_m_start   … 最初の回答
 *   kyutoki_m_answer  … 各設問の回答（step, answer, n＝何問目）。段ごとの離脱はこれで見る
 *   kyutoki_m_stop    … 入力欄を出さずに止めた（reason：eco / rent / area）
 *   kyutoki_m_result  … 結果表示（kino, go, jiki, area, home, age）
 *   kyutoki_lead_consent / kyutoki_lead_submit / kyutoki_lead_error … 入力欄
 *   GA4 には送信成功で generate_lead も送る（Google 広告のコンバージョンに取り込む用）。メールアドレスは送らない。
 */

type Icon = ComponentType<LucideProps>;
const OPT_ICONS: Record<string, Icon> = {
  'type:gas': Flame, 'type:eco': Zap, 'type:elec': Plug,
  'home:house': House, 'home:mansion': Building, 'home:rent': Building2,
  'kino:kyuto': Thermometer, 'kino:furo': Bath, 'kino:danbo': Snowflake,
};

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

const STOPS: Record<MStopKey, { icon: Icon; h: string; d: string }> = {
  eco: { icon: Zap, h: 'ガス給湯器だけの受付です', d: 'エコキュート・電気温水器の見積もりは、いまは取り次いでいません。' },
  rent: { icon: Building2, h: 'まず管理会社か大家さんへ', d: '給湯器は建物の設備で、交換の手配と費用の負担は契約で決まっていることが多いです。' },
  area: { icon: MapPin, h: 'いまは1都3県だけです', d: '東京・神奈川・千葉・埼玉の工事会社だけと提携しています。' },
};

function Lcd({ msg, num, fontClass }: { msg: string; num: string; fontClass: string }) {
  return (
    <div className={`flex min-h-[56px] items-center justify-between gap-3 rounded-xl bg-[#1c2a22] px-4 py-2 text-[#b9f5c8] ${fontClass}`}>
      <span className="text-[15px] leading-snug">{msg}</span>
      <span className="whitespace-nowrap text-[26px] leading-none tracking-wider tabular-nums">{num}</span>
    </div>
  );
}

type View = { kind: 'step'; step: MStep } | { kind: 'stop'; key: MStopKey } | { kind: 'result' };

export default function MitsumoriDiagnosis({ lcdFontClass, entry = 'mitsumori' }: { lcdFontClass: string; entry?: string }) {
  const [view, setView] = useState<View>({ kind: 'step', step: M_STEPS[0] });
  const [answers, setAnswers] = useState<MAnswers>({});
  const [history, setHistory] = useState<MStepId[]>([]);
  const attr = useRef<Record<string, string>>({});
  const panelRef = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => { attr.current = readAttribution(); }, []);

  const log = useCallback((event: string, params: Record<string, string | number> = {}, extra: Partial<Parameters<typeof trackEvent>[0]> = {}) => {
    sendGAEvent('event', event, { lp_name: LP_ID, version: VERSION, ...params });
    void trackEvent({ lp_id: LP_ID, event_name: event, ...extra, metadata: { ...params, ...attr.current, version: VERSION, entry } });
  }, [entry]);

  const scrollToPanel = () => panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const choose = (step: MStep, value: string) => {
    if (!started.current) { started.current = true; log('kyutoki_m_start', { first: step.id }); }
    const a = { ...answers, [step.id]: value } as MAnswers;
    setAnswers(a);
    setHistory((h) => [...h, step.id]);
    const n = M_STEPS.findIndex((s) => s.id === step.id) + 1;
    log('kyutoki_m_answer', { step: step.id, answer: value, n }, { question_id: step.id, answer_id: value });
    const stop = mStopFor(step.id, value);
    if (stop) {
      setView({ kind: 'stop', key: stop });
      log('kyutoki_m_stop', { reason: stop }, { section_id: 'stop' });
      scrollToPanel();
      return;
    }
    const next = M_STEPS.find((s) => !(s.id in a));
    setView(next ? { kind: 'step', step: next } : { kind: 'result' });
    scrollToPanel();
  };

  const back = () => {
    const h = [...history];
    const last = h.pop();
    if (!last) return;
    const a = { ...answers };
    delete a[last];
    setHistory(h);
    setAnswers(a);
    const step = M_STEPS.find((s) => s.id === last);
    if (step) setView({ kind: 'step', step });
  };

  const restart = () => { setAnswers({}); setHistory([]); setView({ kind: 'step', step: M_STEPS[0] }); };

  const resultLogged = useRef(false);
  useEffect(() => {
    if (view.kind !== 'result') { resultLogged.current = false; return; }
    if (resultLogged.current) return;
    resultLogged.current = true;
    log('kyutoki_m_result', {
      kino: answers.kino ?? '', go: answers.go ?? '', jiki: answers.jiki ?? '',
      area: answers.area ?? '', home: answers.home ?? '', age: answers.age ?? '',
      form: canRequest(answers) ? 'shown' : 'hidden',
    }, { section_id: 'result' });
  }, [view, answers, log]);

  const navRow = (
    <div className="flex items-center justify-between pt-1 text-sm">
      <button type="button" onClick={back} className="py-2 text-slate-500 underline-offset-4 hover:underline">← 戻る</button>
      {view.kind !== 'step' && <button type="button" onClick={restart} className="py-2 text-slate-500 underline-offset-4 hover:underline">最初から</button>}
    </div>
  );

  let body: React.ReactNode;

  if (view.kind === 'step') {
    const step = view.step;
    const idx = M_STEPS.findIndex((s) => s.id === step.id);
    const withIcons = step.opts.some((o) => OPT_ICONS[`${step.id}:${o.v}`]);
    body = (
      <>
        <Lcd msg={answers.kino ? '総額の目安' : '条件チェック'} num={lcdOf(answers, step.lcd)} fontClass={lcdFontClass} />
        <div className="flex gap-1.5" aria-hidden="true">
          {M_STEPS.map((s, i) => <span key={s.id} className={`h-1.5 flex-1 rounded-full ${i <= idx ? 'bg-sky-600' : 'bg-slate-200'}`} />)}
        </div>
        <div className="flex items-baseline justify-between">
          <p className="text-[22px] font-bold leading-snug text-slate-900">{step.q}</p>
          <span className="shrink-0 text-xs font-bold text-slate-400">{idx + 1} / {M_STEPS.length}</span>
        </div>
        {step.hint && <p className="-mt-3 text-sm text-slate-500">{step.hint}</p>}
        <div className={`grid gap-2.5 ${step.cols === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
          {step.opts.map((o) => {
            const I = OPT_ICONS[`${step.id}:${o.v}`];
            return (
              <button
                key={o.v}
                type="button"
                onClick={() => choose(step, o.v)}
                className={`flex min-h-[64px] flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-slate-200 bg-white px-2 py-3 text-center transition hover:-translate-y-0.5 hover:border-sky-500 hover:shadow-md focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-sky-600 ${o.v === 'other' ? 'col-span-full' : ''}`}
              >
                {withIcons && I && (
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-50 text-sky-700"><I size={22} aria-hidden="true" /></span>
                )}
                <span className="text-[15px] font-bold leading-tight text-slate-800">{o.t}</span>
                {o.s && <span className="text-[11px] leading-tight text-slate-500">{o.s}</span>}
              </button>
            );
          })}
        </div>
        {history.length > 0
          ? navRow
          : <p className="text-center text-xs text-slate-500">30秒・名前や電話番号の入力なし</p>}
      </>
    );
  } else if (view.kind === 'stop') {
    const s = STOPS[view.key];
    const I = s.icon;
    body = (
      <>
        <Lcd msg="条件チェック" num="対象外" fontClass={lcdFontClass} />
        <div className="flex flex-col items-center gap-3 pt-2 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-sky-100 text-sky-700"><I size={28} aria-hidden="true" /></span>
          <h2 className="text-[22px] font-bold leading-snug text-slate-900">{s.h}</h2>
          <p className="max-w-[24em] text-[15px] text-slate-600">{s.d}</p>
        </div>
        {navRow}
      </>
    );
  } else {
    const p = priceOf(answers);
    const ok = canRequest(answers);
    const cond = [labelOf('kino', answers.kino), answers.go && answers.go !== 'unknown' ? `${answers.go}号` : '', labelOf('home', answers.home)]
      .filter(Boolean).join('・');
    body = (
      <>
        <Lcd msg="総額の目安" num={p ? `${p.min}-${p.max}万` : '--'} fontClass={lcdFontClass} />
        {p && (
          <div className="flex flex-col items-center gap-1 pt-1 text-center">
            <span className="text-xs font-bold text-slate-500">本体・工事込み</span>
            <p className="text-[34px] font-black leading-none text-slate-900">{p.min}〜{p.max}<span className="ml-1 text-[18px]">万円</span></p>
            <span className="text-[13px] text-slate-500">{cond}</span>
          </div>
        )}
        <ul className="grid grid-cols-2 gap-2 text-[12px]">
          <li className="flex flex-col items-center gap-0.5 rounded-xl bg-slate-50 px-2 py-2.5 text-center">
            <span className="text-slate-500">業者一覧サイトの表示</span><b className="text-slate-800">工事費だけが多い</b>
          </li>
          <li className="flex flex-col items-center gap-0.5 rounded-xl bg-orange-50 px-2 py-2.5 text-center ring-1 ring-orange-200">
            <span className="text-slate-500">この見積もり</span><b className="text-orange-700">本体込みの総額</b>
          </li>
        </ul>

        {answers.jiki === 'now' && ok && (
          <p className="flex items-start gap-2 rounded-xl bg-sky-50 px-4 py-3 text-[13px] text-sky-900">
            <CalendarClock size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
            <span>現地での見積もりは、早くて翌日〜2日後です。今日中に直したいときは、契約中のガス会社のほうが早いこともあります。</span>
          </p>
        )}

        {ok ? (
          <QuoteRequestForm
            answers={answers as Record<string, string | undefined>}
            entry={entry}
            version={VERSION}
            getAttribution={() => attr.current}
            onEvent={(ev, params = {}) => {
              log(ev, params, { section_id: 'lead' });
              if (ev === 'kyutoki_lead_submit') sendGAEvent('event', 'generate_lead', { lp_name: LP_ID, version: VERSION });
            }}
          />
        ) : (
          <p className="flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-3 text-[14px] text-slate-700">
            <CircleCheck size={18} className="shrink-0 text-slate-400" aria-hidden="true" />この条件では、いまは見積もりを取り次げません。
          </p>
        )}

        <p className="text-[11px] leading-relaxed text-slate-500">
          目安は、<a href={PRICE_SRC_URL} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">東京ガス「給湯器の選び方」</a>の相場（工事費込み・税込、2026年10月確認）。
          {p ? `例：${p.ex}。` : ''}号数や置き場所で変わるため、正確な金額は現地で確かめます。
        </p>
        {navRow}
      </>
    );
  }

  return (
    <div
      ref={panelRef}
      id="check"
      aria-live="polite"
      className="flex scroll-mt-20 flex-col gap-5 rounded-[24px] bg-white p-5 shadow-[0_2px_0_#e2e8f0,0_20px_40px_-24px_rgba(15,40,70,.35)] ring-1 ring-slate-200"
    >
      {body}
    </div>
  );
}
