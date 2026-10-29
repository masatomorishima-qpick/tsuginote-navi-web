'use client';

import { useCallback, useEffect, useRef, useState, type ComponentType } from 'react';
import { sendGAEvent } from '@next/third-parties/google';
import {
  ArrowRight, BadgeCheck, Briefcase, Building2, Calculator, CalendarClock, Car, CircleCheck, CircleHelp,
  ClipboardCheck, Cloud, CreditCard, Fuel, Gauge, Globe, Handshake, HardDrive, Hourglass, House, KeyRound, Laptop,
  ListChecks, Lock, Mail, MonitorSmartphone, Network, RefreshCw, ScanSearch, Server, ShieldAlert, ShieldCheck,
  Signature, Star, Store, TriangleAlert, UserCog, UserRoundX, Users, Wifi, X,
  type LucideProps,
} from 'lucide-react';
import { trackEvent } from '@/lib/trackEvent';
import LpViewTracker from '@/components/lp/LpViewTracker';
import { TRENDS } from '@/lib/trend/registry';
import type { IconName, TrendLevel, TrendPartner, TrendStep } from '@/lib/trend/types';

/**
 * トレンド速攻ページの共通部品（診断・結果・送客・計測）。中身は lib/trend/<id>.ts の設定で決まる。
 *
 * 計測（GA4 と lp_event_logs の両方、lp_id = 設定の lpId）
 *   trend_check_start / trend_check_answer（step, answer）/ trend_check_result（level, gaps, partner, 各回答）
 *   affiliate_click（既存のGoogle広告コンバージョンと同じ形）/ trend_partner_click / trend_sticky_click
 *   metadata に utm_* / gclid / 版（version）/ 波の id を入れる。
 */

type Icon = ComponentType<LucideProps>;
const ICONS: Record<IconName, Icon> = {
  building: Building2, users: Users, userCog: UserCog, laptop: Laptop, globe: Globe, refresh: RefreshCw,
  hardDrive: HardDrive, star: Star, shieldCheck: ShieldCheck, shieldAlert: ShieldAlert, network: Network,
  help: CircleHelp, check: CircleCheck, alert: TriangleAlert, clipboard: ClipboardCheck, signature: Signature,
  badge: BadgeCheck, handshake: Handshake, userX: UserRoundX, store: Store, server: Server, cloud: Cloud,
  mail: Mail, key: KeyRound, fuel: Fuel, car: Car, card: CreditCard, calculator: Calculator, lock: Lock,
  scan: ScanSearch, list: ListChecks, hourglass: Hourglass, calendar: CalendarClock, gauge: Gauge,
  briefcase: Briefcase, house: House, wifi: Wifi, device: MonitorSmartphone, x: X,
};

const LEVEL_STYLE: Record<TrendLevel, { bar: number; tone: string; bg: string; icon: Icon }> = {
  high: { bar: 3, tone: 'text-emerald-700', bg: 'bg-emerald-100 text-emerald-700', icon: ShieldCheck },
  mid: { bar: 2, tone: 'text-amber-700', bg: 'bg-amber-100 text-amber-700', icon: Gauge },
  low: { bar: 1, tone: 'text-orange-700', bg: 'bg-orange-100 text-orange-700', icon: ShieldAlert },
};

type View = { kind: 'start' } | { kind: 'step'; step: TrendStep } | { kind: 'result' };
type Attribution = Record<string, string>;
const ATTR_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid'];

function readAttribution(store: string): Attribution {
  const out: Attribution = {};
  try {
    const sp = new URLSearchParams(window.location.search);
    ATTR_KEYS.forEach((k) => {
      const v = sp.get(k);
      if (v) out[k] = v.slice(0, 200);
    });
    if (Object.keys(out).length > 0) {
      sessionStorage.setItem(store, JSON.stringify(out));
      return out;
    }
    const saved = sessionStorage.getItem(store);
    return saved ? (JSON.parse(saved) as Attribution) : out;
  } catch {
    return out;
  }
}

const primaryBtn = 'flex min-h-[60px] w-full items-center justify-center gap-2 rounded-2xl bg-orange-600 px-5 text-lg font-bold text-white shadow-[0_8px_20px_-10px_rgba(234,88,12,.8)] transition hover:bg-orange-700 active:scale-[.99]';

export default function TrendCheck({ id }: { id: string }) {
  const cfg = TRENDS[id];
  const [view, setView] = useState<View>({ kind: 'start' });
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [history, setHistory] = useState<string[]>([]);
  const [panelVisible, setPanelVisible] = useState(true);
  const attr = useRef<Attribution>({});
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    attr.current = readAttribution(`trend_attr_${id}`);
  }, [id]);

  useEffect(() => {
    const el = panelRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([e]) => setPanelVisible(e.isIntersecting), { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const log = useCallback((event: string, params: Record<string, string | number> = {}, extra: Partial<Parameters<typeof trackEvent>[0]> = {}) => {
    sendGAEvent('event', event, { lp_name: cfg.lpId, version: cfg.version, trend: cfg.id, ...params });
    void trackEvent({
      lp_id: cfg.lpId,
      event_name: event,
      ...extra,
      metadata: { ...params, ...attr.current, version: cfg.version, trend: cfg.id },
    });
  }, [cfg]);

  const scrollToPanel = () => panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const goNext = (a: Record<string, string>) => {
    const next = cfg.steps.find((s) => !(s.id in a));
    setView(next ? { kind: 'step', step: next } : { kind: 'result' });
    scrollToPanel();
  };

  const start = () => {
    log('trend_check_start');
    goNext({});
  };

  const choose = (step: TrendStep, value: string) => {
    const a = { ...answers, [step.id]: value };
    setAnswers(a);
    setHistory((h) => [...h, step.id]);
    log('trend_check_answer', { step: step.id, answer: value }, { question_id: step.id, answer_id: value });
    goNext(a);
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
    delete a[last];
    setHistory(h);
    setAnswers(a);
    const step = cfg.steps.find((s) => s.id === last);
    if (step) setView({ kind: 'step', step });
  };

  const restart = () => {
    setAnswers({});
    setHistory([]);
    setView({ kind: 'start' });
  };

  const shown = (keys: string[]): TrendPartner[] =>
    keys.map((k) => cfg.partners[k]).filter((p): p is TrendPartner => !!p && !!p.href && p.vetted).slice(0, 2);

  const resultLogged = useRef(false);
  useEffect(() => {
    if (view.kind !== 'result') {
      resultLogged.current = false;
      return;
    }
    if (resultLogged.current) return;
    resultLogged.current = true;
    const r = cfg.judge(answers);
    const ps = shown(r.partners);
    log('trend_check_result', {
      level: r.level, gaps: r.gaps.length, partner: ps.length ? ps.map((p) => p.key).join(',') : 'none', ...answers,
    }, { section_id: 'result' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, answers, log]);

  const onPartnerClick = (p: TrendPartner, position: number) => {
    sendGAEvent('event', 'affiliate_click', { lp_name: cfg.lpId, position: String(position), program_name: p.name });
    log('trend_partner_click', { partner: p.key, position, reward: p.reward }, { cta_id: `${p.key}-${position}`, partner_category: `trend-${cfg.id}`, source_section: 'result' });
  };

  const onSticky = () => {
    log('trend_sticky_click', { view: view.kind });
    if (view.kind === 'start') start();
    else scrollToPanel();
  };

  let body: React.ReactNode;

  if (view.kind === 'start') {
    body = (
      <>
        <ol className="grid grid-cols-3 gap-2 text-center">
          {cfg.intro.map(({ icon, t }) => {
            const I = ICONS[icon];
            return (
              <li key={t} className="flex flex-col items-center gap-1.5 rounded-xl bg-slate-50 px-1 py-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-sky-700 ring-1 ring-slate-200">
                  <I size={18} aria-hidden="true" />
                </span>
                <span className="text-[12px] font-bold leading-tight text-slate-700">{t}</span>
              </li>
            );
          })}
        </ol>
        <button type="button" onClick={start} className={primaryBtn}>
          {cfg.startLabel} <ArrowRight size={20} aria-hidden="true" />
        </button>
        <p className="text-center text-xs text-slate-500">無料・登録不要。会社名や連絡先の入力はありません</p>
      </>
    );
  } else if (view.kind === 'step') {
    const step = view.step;
    const idx = cfg.steps.findIndex((s) => s.id === step.id);
    const cols = step.cols === 3 ? 'grid-cols-3' : 'grid-cols-2';
    body = (
      <>
        <div className="text-xs font-bold text-slate-500">質問 {idx + 1} / {cfg.steps.length}</div>
        <div className="flex gap-1.5" aria-hidden="true">
          {cfg.steps.map((s, i) => (
            <span key={s.id} className={`h-1.5 flex-1 rounded-full ${i <= idx ? 'bg-sky-600' : 'bg-slate-200'}`} />
          ))}
        </div>
        <p className="pt-1 text-[22px] font-bold leading-snug text-slate-900">{step.q}</p>
        {step.hint && <p className="-mt-2 text-sm text-slate-500">{step.hint}</p>}
        <div className={`grid gap-2.5 ${cols}`}>
          {step.opts.map((o) => {
            const I = o.icon ? ICONS[o.icon] : null;
            return (
              <button
                key={o.v}
                type="button"
                onClick={() => choose(step, o.v)}
                className="flex min-h-[64px] flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-slate-200 bg-white px-2 py-3 text-center transition hover:-translate-y-0.5 hover:border-sky-500 hover:shadow-md focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-sky-600"
              >
                {I && (
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-50 text-sky-700">
                    <I size={22} aria-hidden="true" />
                  </span>
                )}
                <span className="text-[15px] font-bold leading-tight text-slate-800">{o.t}</span>
              </button>
            );
          })}
        </div>
        <div className="pt-1 text-sm">
          <button type="button" onClick={back} className="py-2 text-slate-500 underline-offset-4 hover:underline">← 戻る</button>
        </div>
      </>
    );
  } else {
    const r = cfg.judge(answers);
    const ls = LEVEL_STYLE[r.level];
    const LI = ls.icon;
    const ps = shown(r.partners);
    body = (
      <>
        <div className="flex flex-col items-center gap-2 pt-1 text-center">
          <span className="text-xs font-bold text-slate-500">準備状況</span>
          <span className={`flex h-16 w-16 items-center justify-center rounded-full ${ls.bg}`}>
            <LI size={32} aria-hidden="true" />
          </span>
          <div className="flex gap-1.5" role="img" aria-label={`3段階中${ls.bar}段階目`}>
            {[1, 2, 3].map((n) => (
              <span key={n} className={`h-2 w-10 rounded-full ${n <= ls.bar ? 'bg-current ' + ls.tone : 'bg-slate-200'}`} />
            ))}
          </div>
          <h2 className={`text-[26px] font-black leading-tight ${ls.tone}`}>{r.title}</h2>
          <p className="max-w-[24em] text-[14px] text-slate-600 [text-wrap:balance]">{r.lead}</p>
        </div>

        {r.gaps.length > 0 && (
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="mb-2 text-sm font-bold text-slate-700">不足している可能性がある対策</p>
            <ul className="grid gap-2">
              {r.gaps.map((g) => {
                const I = ICONS[g.icon];
                return (
                  <li key={g.t} className="flex items-start gap-2.5 text-[14px] text-slate-700">
                    <I size={18} className="mt-0.5 shrink-0 text-orange-600" aria-hidden="true" />{g.t}
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {ps.map((p, i) => (
          <div key={p.key} className="flex flex-col gap-3 rounded-2xl border-2 border-orange-200 bg-orange-50/60 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-orange-800">不足している対策に役立つサービス</span>
              <span className="rounded border border-orange-300 px-1.5 text-[10px] tracking-widest text-orange-800">PR</span>
            </div>
            <p className="text-lg font-black text-slate-900">{p.name}</p>
            <p className="text-sm text-slate-600">{p.pitch}</p>
            <a href={p.href} target="_blank" rel="sponsored noopener" onClick={() => onPartnerClick(p, i + 1)} className={primaryBtn}>
              {p.cta} <ArrowRight size={20} aria-hidden="true" />
            </a>
            <p className="text-center text-[11px] text-slate-500">{p.name}の公式サイトに移動します</p>
            {p.beacon && (
              // A8 の表示計測（1×1の画像）。広告リンクと一緒に置く決まり。
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.beacon} width={1} height={1} alt="" className="absolute h-px w-px opacity-0" />
            )}
          </div>
        ))}

        <div className="flex flex-col gap-2">
          <p className="text-sm font-bold text-slate-700">次にやるべきこと</p>
          <ol className="grid gap-2">
            {cfg.nextSteps.map((s, i) => {
              const I = ICONS[s.icon];
              const inner = (
                <>
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-50 text-sky-700">
                    <I size={18} aria-hidden="true" />
                  </span>
                  <span className="flex flex-col">
                    <span className="text-[14px] font-black text-slate-900"><span className="mr-1 text-sky-700">{i + 1}</span>{s.h}</span>
                    <span className="text-[12px] text-slate-500">{s.d}</span>
                  </span>
                </>
              );
              return (
                <li key={s.h}>
                  {s.href ? (
                    <a href={s.href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-xl bg-white p-3 ring-1 ring-slate-200 hover:ring-sky-400">{inner}</a>
                  ) : (
                    <div className="flex items-center gap-3 rounded-xl bg-white p-3 ring-1 ring-slate-200">{inner}</div>
                  )}
                </li>
              );
            })}
          </ol>
        </div>

        {ps.length === 0 && (
          <a href={cfg.fallback.href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4 hover:bg-slate-100">
            <Handshake size={22} className="shrink-0 text-slate-500" aria-hidden="true" />
            <span className="flex flex-col">
              <span className="text-[14px] font-bold text-slate-900">{cfg.fallback.h}</span>
              <span className="text-[12px] text-slate-600">{cfg.fallback.d}</span>
              <span className="mt-1 text-[12px] font-bold text-sky-800 underline underline-offset-2">{cfg.fallback.label}</span>
            </span>
          </a>
        )}

        <p className="text-[11px] leading-relaxed text-slate-400">{cfg.disclaimer}</p>

        <div className="flex items-center justify-between pt-1 text-sm">
          <button type="button" onClick={back} className="py-2 text-slate-500 underline-offset-4 hover:underline">← 戻る</button>
          <button type="button" onClick={restart} className="flex items-center gap-1 py-2 text-slate-500 underline-offset-4 hover:underline">
            <RefreshCw size={14} aria-hidden="true" />最初からやり直す
          </button>
        </div>
      </>
    );
  }

  const showSticky = !panelVisible && (view.kind === 'start' || view.kind === 'step');

  return (
    <>
      <LpViewTracker lpId={cfg.lpId} version={cfg.version} />
      <div
        ref={panelRef}
        id="check"
        aria-live="polite"
        className="flex scroll-mt-20 flex-col gap-5 rounded-[24px] bg-white p-5 shadow-[0_2px_0_#e2e8f0,0_20px_40px_-24px_rgba(15,40,70,.35)] ring-1 ring-slate-200"
      >
        {body}
      </div>
      {showSticky && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-4 pt-3 pb-[calc(12px+env(safe-area-inset-bottom,0px))] backdrop-blur sm:hidden">
          <button type="button" onClick={onSticky} className={primaryBtn}>
            {view.kind === 'start' ? cfg.startLabel : '診断の続きへ'} <ArrowRight size={20} aria-hidden="true" />
          </button>
        </div>
      )}
    </>
  );
}
