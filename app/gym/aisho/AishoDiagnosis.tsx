'use client';

import { useCallback, useEffect, useRef, useState, type ComponentType } from 'react';
import { sendGAEvent } from '@next/third-parties/google';
import {
  Activity, ArrowRight, Brain, CalendarClock, Check, CircleCheck, CircleSlash, ClipboardCheck, Dumbbell,
  HeartHandshake, HeartPulse, History, ListChecks, Mars, MessageSquareHeart, PersonStanding, Receipt,
  Salad, Sparkles, Sprout, Megaphone, ThumbsUp, Undo2, Users, Utensils, Venus, Weight, Hourglass,
  type LucideProps,
} from 'lucide-react';
import { trackEvent } from '@/lib/trackEvent';
import {
  LP_ID, VERSION, STEPS, TYPES, CONTRACT_CHECKS, answered, typeOf, conditionsFor, activeSurvey, pickPartners,
  type Answers, type Step, type StepId, type TypeKey, type Partner, type SurveyAnswers, type SurveyQ,
} from '@/lib/gym/aisho';

/**
 * パーソナルジム「相性診断」（クライアント部品）。
 *
 * 計測 ── 1回の診断で次のイベントが出る。
 *   GA4（sendGAEvent）
 *     gym_diag_start      … 診断開始
 *     gym_diag_answer     … 各設問の回答（step, answer）
 *     gym_diag_result     … 結果表示（type, partner：紹介先 or none, 各回答）
 *     affiliate_click     … 紹介先クリック（既存のGoogle広告コンバージョンと同じ形。lp_name で区別）
 *     gym_partner_click   … 紹介先クリック（このページ専用）
 *     gym_survey_answer   … 任意アンケートの回答（question, answer）
 *     gym_survey_done     … 任意アンケートを最後まで答えた
 *     gym_sticky_click    … 画面下の固定ボタン
 *   Supabase lp_event_logs（trackEvent）… 上と同じ節目を lp_id = LP_ID で保存。
 *     metadata に utm_* / fbclid / gclid / 版（VERSION）を入れる。
 */

type Icon = ComponentType<LucideProps>;

const OPT_ICONS: Record<string, Icon> = {
  'goal:lose': Weight,
  'goal:tone': Dumbbell,
  'goal:fitness': HeartPulse,
  'goal:care': PersonStanding,
  'exp:none': Sprout,
  'exp:past': History,
  'exp:now': Activity,
  'style:praise': ThumbsUp,
  'style:strict': Megaphone,
  'style:logic': Brain,
  'style:leave': Sparkles,
  'food:strict': Salad,
  'food:loose': Utensils,
  'food:none': CircleSlash,
  'gender:female': Venus,
  'gender:male': Mars,
  'gender:any': Users,
};

const TYPE_STYLE: Record<TypeKey, { icon: Icon; tone: string; bg: string }> = {
  bansou: { icon: HeartHandshake, tone: 'text-rose-700', bg: 'bg-rose-100 text-rose-700' },
  kanri: { icon: ClipboardCheck, tone: 'text-orange-700', bg: 'bg-orange-100 text-orange-700' },
  riron: { icon: Brain, tone: 'text-sky-800', bg: 'bg-sky-100 text-sky-800' },
  hippari: { icon: ListChecks, tone: 'text-emerald-700', bg: 'bg-emerald-100 text-emerald-700' },
};

/** 4タイプの並び（図の配置）：左上 伴走 / 右上 管理 / 左下 理論 / 右下 おまかせ */
const TYPE_GRID: TypeKey[] = ['bansou', 'kanri', 'riron', 'hippari'];

const CHECK_ICONS: Record<string, Icon> = { total: Receipt, cancel: Undo2, sameday: Hourglass, booking: CalendarClock };

type View = { kind: 'start' } | { kind: 'step'; step: Step } | { kind: 'result' };

type Attribution = Record<string, string>;
const ATTR_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'fbclid'];
const ATTR_STORE = 'gym_aisho_attr';

function readAttribution(): Attribution {
  const out: Attribution = {};
  try {
    const sp = new URLSearchParams(window.location.search);
    ATTR_KEYS.forEach((k) => {
      const v = sp.get(k);
      if (v) out[k] = v.slice(0, 200);
    });
    if (Object.keys(out).length > 0) {
      sessionStorage.setItem(ATTR_STORE, JSON.stringify(out));
      return out;
    }
    const saved = sessionStorage.getItem(ATTR_STORE);
    return saved ? (JSON.parse(saved) as Attribution) : out;
  } catch {
    return out;
  }
}

function Nav({ onBack, onRestart }: { onBack: () => void; onRestart?: () => void }) {
  return (
    <div className="flex items-center justify-between pt-1 text-sm">
      <button type="button" onClick={onBack} className="py-2 text-slate-500 underline-offset-4 hover:underline">← 戻る</button>
      {onRestart && (
        <button type="button" onClick={onRestart} className="py-2 text-slate-500 underline-offset-4 hover:underline">最初から</button>
      )}
    </div>
  );
}

const optBtn = 'flex min-h-[64px] flex-col items-center justify-center gap-1.5 rounded-2xl border-2 bg-white px-2 py-3 text-center transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-rose-600';
const primaryBtn = 'flex min-h-[60px] w-full items-center justify-center gap-2 rounded-2xl bg-rose-600 px-5 text-lg font-bold text-white shadow-[0_8px_20px_-10px_rgba(225,29,72,.8)] transition hover:bg-rose-700 active:scale-[.99]';

/* ===== 任意アンケート ===== */
function Survey({ log }: { log: (e: string, p?: Record<string, string | number>, x?: Partial<Parameters<typeof trackEvent>[0]>) => void }) {
  const [s, setS] = useState<SurveyAnswers>({});
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  const qs = activeSurvey(s);
  const q: SurveyQ | undefined = qs[i];

  const commit = (value: string | string[]) => {
    if (!q) return;
    const next = { ...s, [q.id]: value };
    setS(next);
    setPicked([]);
    const answer = Array.isArray(value) ? value.join(',') : value;
    log('gym_survey_answer', { question: q.id, answer }, { question_id: q.id, answer_id: answer, section_id: 'survey' });
    const nextQs = activeSurvey(next);
    if (i + 1 >= nextQs.length) {
      setDone(true);
      log('gym_survey_done', { quit: String(next.quit ?? '') }, { section_id: 'survey' });
    } else {
      setI(i + 1);
    }
  };

  if (done) {
    return (
      <div className="flex items-center gap-3 rounded-2xl bg-rose-50 p-4 text-[14px] font-bold text-rose-800">
        <MessageSquareHeart size={22} className="shrink-0" aria-hidden="true" />
        ありがとうございます。診断の改善に使います。
      </div>
    );
  }
  if (!q) return null;

  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-slate-50 p-4">
      <div className="flex items-center justify-between text-xs font-bold text-slate-500">
        <span className="flex items-center gap-1.5"><MessageSquareHeart size={15} aria-hidden="true" />ひとこと教えてください</span>
        <span>任意・匿名 {i + 1}/{qs.length}</span>
      </div>
      <p className="text-[17px] font-bold leading-snug text-slate-900">{q.q}</p>
      <div className="flex flex-wrap gap-2">
        {q.opts.map((o) => {
          const on = picked.includes(o.v);
          return (
            <button
              key={o.v}
              type="button"
              aria-pressed={q.multi ? on : undefined}
              onClick={() => (q.multi ? setPicked((p) => (on ? p.filter((x) => x !== o.v) : [...p, o.v])) : commit(o.v))}
              className={`flex min-h-[44px] items-center gap-1.5 rounded-full border-2 px-4 text-[14px] font-bold transition ${on ? 'border-rose-500 bg-rose-50 text-rose-800' : 'border-slate-200 bg-white text-slate-700 hover:border-rose-400'}`}
            >
              {on && <Check size={15} aria-hidden="true" />}{o.t}
            </button>
          );
        })}
      </div>
      {q.multi && (
        <button
          type="button"
          disabled={picked.length === 0}
          onClick={() => commit(picked)}
          className="flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-slate-800 font-bold text-white disabled:opacity-30"
        >
          次へ <ArrowRight size={18} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

export default function AishoDiagnosis() {
  const [view, setView] = useState<View>({ kind: 'start' });
  const [answers, setAnswers] = useState<Answers>({});
  const [history, setHistory] = useState<StepId[]>([]);
  const [panelVisible, setPanelVisible] = useState(true);
  const attr = useRef<Attribution>({});
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    attr.current = readAttribution();
  }, []);

  useEffect(() => {
    const el = panelRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([e]) => setPanelVisible(e.isIntersecting), { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const log = useCallback((event: string, params: Record<string, string | number> = {}, extra: Partial<Parameters<typeof trackEvent>[0]> = {}) => {
    sendGAEvent('event', event, { lp_name: LP_ID, version: VERSION, ...params });
    void trackEvent({
      lp_id: LP_ID,
      event_name: event,
      ...extra,
      metadata: { ...params, ...attr.current, version: VERSION },
    });
  }, []);

  const scrollToPanel = () => {
    panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const goNext = (a: Answers) => {
    const next = STEPS.find((s) => !answered(s, a));
    setView(next ? { kind: 'step', step: next } : { kind: 'result' });
    scrollToPanel();
  };

  const start = () => {
    log('gym_diag_start');
    goNext({});
  };

  const choose = (step: Step, value: string) => {
    const a = { ...answers, [step.id]: value } as Answers;
    setAnswers(a);
    setHistory((h) => [...h, step.id]);
    log('gym_diag_answer', { step: step.id, answer: value }, { question_id: step.id, answer_id: value });
    goNext(a);
  };

  /** 「通い方と予算」：2つそろったら次へ */
  const choosePair = (step: Step, key: 'freq' | 'budget', value: string) => {
    const a = { ...answers, [key]: value } as Answers;
    setAnswers(a);
    if (a.freq && a.budget) {
      setHistory((h) => [...h, step.id]);
      log('gym_diag_answer', { step: step.id, answer: `${a.freq}_${a.budget}` }, { question_id: step.id, answer_id: `${a.freq}_${a.budget}` });
      goNext(a);
    }
  };

  const back = () => {
    const h = [...history];
    const last = h.pop();
    if (!last) {
      setAnswers({});
      setView({ kind: 'start' });
      return;
    }
    const a = { ...answers };
    if (last === 'plan') {
      delete a.freq;
      delete a.budget;
    } else {
      delete a[last as keyof Answers];
    }
    setHistory(h);
    setAnswers(a);
    const step = STEPS.find((s) => s.id === last);
    if (step) setView({ kind: 'step', step });
  };

  const restart = () => {
    setAnswers({});
    setHistory([]);
    setView({ kind: 'start' });
  };

  const onSticky = () => {
    log('gym_sticky_click', { view: view.kind });
    if (view.kind === 'start') start();
    else scrollToPanel();
  };

  const resultLogged = useRef(false);
  useEffect(() => {
    if (view.kind !== 'result') {
      resultLogged.current = false;
      return;
    }
    if (resultLogged.current) return;
    resultLogged.current = true;
    const t = typeOf(answers);
    const ps = pickPartners(answers);
    log('gym_diag_result', {
      type: t.key,
      partner: ps.length ? ps.map((p) => p.key).join(',') : 'none',
      goal: answers.goal ?? '', exp: answers.exp ?? '', style: answers.style ?? '', food: answers.food ?? '',
      gender: answers.gender ?? '', freq: answers.freq ?? '', budget: answers.budget ?? '', area: answers.area ?? '',
    }, { section_id: 'result' });
  }, [view, answers, log]);

  const onPartnerClick = (p: Partner, position: number) => {
    const t = typeOf(answers);
    sendGAEvent('event', 'affiliate_click', { lp_name: LP_ID, position: String(position), program_name: p.name });
    log('gym_partner_click', {
      partner: p.key, position, type: t.key, goal: answers.goal ?? '', area: answers.area ?? '', reward: p.reward,
    }, { cta_id: `${p.key}-${position}`, partner_category: 'gym', source_section: 'result' });
  };

  /* ===== 表示 ===== */
  let body: React.ReactNode;

  if (view.kind === 'start') {
    body = (
      <>
        <div className="grid grid-cols-4 gap-2" aria-hidden="true">
          {TYPE_GRID.map((k) => {
            const I = TYPE_STYLE[k].icon;
            return (
              <span key={k} className={`flex aspect-square items-center justify-center rounded-2xl ${TYPE_STYLE[k].bg}`}>
                <I size={26} />
              </span>
            );
          })}
        </div>
        <p className="text-center text-[15px] font-bold text-slate-700">
          あなたに合うのは、<br />4タイプのどのトレーナー？
        </p>
        <button type="button" onClick={start} className={primaryBtn}>
          7問で診断する <ArrowRight size={20} aria-hidden="true" />
        </button>
        <p className="text-center text-xs text-slate-500">無料・登録不要・名前や連絡先は聞きません</p>
      </>
    );
  } else if (view.kind === 'step') {
    const step = view.step;
    const idx = STEPS.findIndex((s) => s.id === step.id);
    body = (
      <>
        <div className="text-xs font-bold text-slate-500">質問 {idx + 1} / {STEPS.length}</div>
        <div className="flex gap-1.5" aria-hidden="true">
          {STEPS.map((s, i) => (
            <span key={s.id} className={`h-1.5 flex-1 rounded-full ${i <= idx ? 'bg-rose-500' : 'bg-slate-200'}`} />
          ))}
        </div>
        <p className="pt-1 text-[22px] font-bold leading-snug text-slate-900">{step.q}</p>
        {step.pairs ? (
          <div className="flex flex-col gap-4">
            {step.pairs.map((pr) => (
              <div key={pr.key} className="flex flex-col gap-2">
                <span className="text-sm font-bold text-slate-500">{pr.label}</span>
                <div className="grid grid-cols-3 gap-2">
                  {pr.opts.map((o) => {
                    const on = answers[pr.key] === o.v;
                    return (
                      <button
                        key={o.v}
                        type="button"
                        aria-pressed={on}
                        onClick={() => choosePair(step, pr.key, o.v)}
                        className={`${optBtn} min-h-[56px] ${on ? 'border-rose-500 bg-rose-50' : 'border-slate-200 hover:border-rose-400'}`}
                      >
                        <span className={`text-[16px] font-bold ${on ? 'text-rose-800' : 'text-slate-800'}`}>{o.t}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={`grid gap-2.5 ${step.opts && step.opts.length === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
            {step.opts?.map((o) => {
              const I = OPT_ICONS[`${step.id}:${o.v}`];
              return (
                <button
                  key={o.v}
                  type="button"
                  onClick={() => choose(step, o.v)}
                  className={`${optBtn} border-slate-200 hover:border-rose-400 ${step.grid && o.v === 'other' ? 'col-span-full' : ''}`}
                >
                  {I && (
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-50 text-rose-700">
                      <I size={22} aria-hidden="true" />
                    </span>
                  )}
                  <span className="text-[15px] font-bold leading-tight text-slate-800">{o.t}</span>
                </button>
              );
            })}
          </div>
        )}
        <Nav onBack={back} />
      </>
    );
  } else {
    const t = typeOf(answers);
    const ts = TYPE_STYLE[t.key];
    const TI = ts.icon;
    const conds = conditionsFor(answers);
    const ps = pickPartners(answers);
    body = (
      <>
        <div className="flex flex-col items-center gap-2 pt-1 text-center">
          <span className="text-xs font-bold text-slate-500">あなたに合うトレーナー</span>
          <span className={`flex h-16 w-16 items-center justify-center rounded-full ${ts.bg}`}>
            <TI size={32} aria-hidden="true" />
          </span>
          <h2 className={`text-[30px] font-black leading-tight ${ts.tone}`}>{t.name}</h2>
          <p className="text-[16px] font-bold text-slate-800">{t.h}</p>
          <p className="max-w-[24em] text-[14px] text-slate-600 [text-wrap:balance]">{t.why}</p>
        </div>

        {/* 4タイプの中での位置 */}
        <div className="grid grid-cols-2 gap-2" role="img" aria-label={`4タイプのうち${t.name}`}>
          {TYPE_GRID.map((k) => {
            const on = k === t.key;
            const I = TYPE_STYLE[k].icon;
            return (
              <span
                key={k}
                className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-[13px] font-bold ${on ? `${TYPE_STYLE[k].bg} ring-2 ring-current` : 'bg-slate-50 text-slate-400'}`}
              >
                <I size={18} aria-hidden="true" />{TYPES[k].name}
              </span>
            );
          })}
        </div>

        <ul className="flex flex-wrap justify-center gap-1.5">
          {t.traits.map((x) => (
            <li key={x} className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-700 ring-1 ring-slate-200">{x}</li>
          ))}
        </ul>

        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="mb-2 text-sm font-bold text-slate-700">ジムを選ぶ条件</p>
          <ul className="grid gap-1.5">
            {conds.map((c) => (
              <li key={c} className="flex items-start gap-2 text-[14px] text-slate-700">
                <CircleCheck size={17} className="mt-0.5 shrink-0 text-emerald-600" aria-hidden="true" />{c}
              </li>
            ))}
          </ul>
        </div>

        {ps.length > 0 && (
          <div className="flex flex-col gap-3">
            {ps.map((p, i) => (
              <div key={p.key} className="flex flex-col gap-3 rounded-2xl border-2 border-rose-200 bg-rose-50/60 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-rose-800">{p.only === 'female' ? '女性専用' : '条件に合うジム'}</span>
                  <span className="rounded border border-rose-300 px-1.5 text-[10px] tracking-widest text-rose-800">PR</span>
                </div>
                <p className="text-xl font-black text-slate-900">{p.name}</p>
                {p.points.length > 0 && (
                  <ul className="flex flex-wrap gap-1.5">
                    {p.points.map((x) => (
                      <li key={x} className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-700 ring-1 ring-rose-200">{x}</li>
                    ))}
                  </ul>
                )}
                <a
                  href={p.href}
                  target="_blank"
                  rel="sponsored noopener noreferrer"
                  onClick={() => onPartnerClick(p, i + 1)}
                  className={primaryBtn}
                >
                  体験でトレーナーを確かめる <ArrowRight size={20} aria-hidden="true" />
                </a>
                <p className="text-center text-[11px] text-slate-500">{p.name}のサイトに移動します</p>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-col gap-2">
          <p className="text-sm font-bold text-slate-700">体験の前に、この4つ</p>
          <ul className="grid grid-cols-2 gap-2">
            {CONTRACT_CHECKS.map((c) => {
              const I = CHECK_ICONS[c.key] ?? CircleCheck;
              return (
                <li key={c.key} className="flex flex-col gap-1 rounded-xl bg-white p-3 ring-1 ring-slate-200">
                  <span className="flex items-center gap-1.5 text-[14px] font-black text-slate-900">
                    <I size={17} className="text-rose-600" aria-hidden="true" />{c.h}
                  </span>
                  <span className="text-[12px] leading-snug text-slate-500">{c.d}</span>
                </li>
              );
            })}
          </ul>
        </div>

        <Survey log={log} />

        <Nav onBack={back} onRestart={restart} />
      </>
    );
  }

  const showSticky = !panelVisible && (view.kind === 'start' || view.kind === 'step');

  return (
    <>
      <div
        ref={panelRef}
        id="shindan"
        aria-live="polite"
        className="flex scroll-mt-20 flex-col gap-5 rounded-[24px] bg-white p-5 shadow-[0_2px_0_#e2e8f0,0_20px_40px_-24px_rgba(15,40,70,.35)] ring-1 ring-slate-200"
      >
        {body}
      </div>
      {showSticky && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-4 pt-3 pb-[calc(12px+env(safe-area-inset-bottom,0px))] backdrop-blur sm:hidden">
          <button type="button" onClick={onSticky} className={primaryBtn}>
            {view.kind === 'start' ? '7問で診断する' : '診断の続きへ'} <ArrowRight size={20} aria-hidden="true" />
          </button>
        </div>
      )}
    </>
  );
}
