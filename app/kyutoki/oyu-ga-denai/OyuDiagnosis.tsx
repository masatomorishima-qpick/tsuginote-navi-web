'use client';

import { useCallback, useEffect, useRef, useState, type ComponentType } from 'react';
import { sendGAEvent } from '@next/third-parties/google';
import {
  ArrowRight, Bath, Building2, CircleCheck, Clock, Droplet, Droplets, Flame, Gauge,
  House, MonitorOff, Plug, RefreshCw, Scale, Snowflake, Thermometer, TriangleAlert, Waves, Wrench, Zap,
  type LucideProps,
} from 'lucide-react';
import { trackEvent } from '@/lib/trackEvent';
import {
  LP_ID, VERDICT_VERSION, STEPS, activeSteps, stopFor, verdictOf, selfCheck,
  pickPartners, noPartnerReason,
  type Answers, type Step, type StepId, type StopKey, type Partner, type Mode,
} from '@/lib/kyutoki/diagnosis';

/**
 * 給湯器「お湯が出ない」診断（クライアント部品）。
 *
 * 計測（PDCAの土台）── 1回の診断で次のイベントが出る。
 *   GA4（sendGAEvent）
 *     kyutoki_diag_start      … 診断開始
 *     kyutoki_diag_answer     … 各設問の回答（step, answer）
 *     kyutoki_diag_stop       … 送客せずに止めた（reason：gas/freeze/nowater/rent）
 *     kyutoki_diag_result     … 結果表示（verdict, partner：送客先 or none）
 *     affiliate_click         … 送客クリック（★既存のGoogle広告コンバージョン。lp_name で他LPと区別）
 *     kyutoki_partner_click   … 送客クリック（このLP専用。partner, area, type, verdict 付き）
 *     kyutoki_sticky_click    … 画面下の固定ボタンのクリック
 *   Supabase lp_event_logs（trackEvent）… 上と同じ節目を lp_id = LP_ID で保存。
 *     metadata に utm_* / gclid / 版（VERDICT_VERSION）を入れるので、
 *     「どの広告グループ → どの回答 → 送客したか」を SQL で追える。
 *
 * 2026-10-28 v2：文字を減らし、選択肢をアイコン付きのカードにした。画面下に固定の開始ボタンを追加。
 * 2026-10-29 v4：開始ボタンをなくし、最初の質問を最初の画面に出す。kyutoki_diag_start は最初の回答の時点で出す。
 * 2026-10-31 v8：入口ごとに答えを先に入れておける（preset）。/jumyo は「今は使える」を入れた状態で始めるので、
 *   最初の質問が「使い始めて何年ですか？」になる（寿命で検索した人に症状を聞いていた不一致の直し）。
 *   送客ボタンの文言は紹介先の cta（成果地点に合わせた言葉）を使う。
 */

type Icon = ComponentType<LucideProps>;

/** 選択肢ごとのアイコン（キー＝設問ID:値）。ここに無い選択肢はアイコンなしで表示する。 */
const OPT_ICONS: Record<string, Icon> = {
  'symptom:none': Droplets,
  'symptom:lukewarm': Thermometer,
  'symptom:error': Gauge,
  'symptom:remote': MonitorOff,
  'symptom:leak': Waves,
  'symptom:fine': CircleCheck,
  'symptom:gas': Flame,
  'type:gas': Flame,
  'type:eco': Zap,
  'type:elec': Plug,
  'cold:freeze': Snowflake,
  'cold:nowater': Droplet,
  'cold:no': CircleCheck,
  'home:own': House,
  'home:rent': Building2,
};

type View =
  | { kind: 'step'; step: Step }
  | { kind: 'stop'; key: StopKey }
  | { kind: 'result' };

type Attribution = Record<string, string>;
const ATTR_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid'];
const ATTR_STORE = 'kyutoki_attr';

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

const STOPS: Record<StopKey, { danger?: boolean; icon: Icon; label: string; h: string; lcd: string; items: string[]; note?: string; cont?: string }> = {
  gas: {
    danger: true, icon: TriangleAlert, label: 'いますぐ', lcd: '使用中止',
    h: 'ガス会社へ連絡してください',
    items: ['火を使わない。換気扇や電気のスイッチにも触れない', '窓や玄関の扉を開けて換気する', '屋外のメーターガス栓を閉める', '屋外から、ガス会社の緊急連絡先へ電話'],
  },
  freeze: {
    icon: Snowflake, label: '凍結かもしれません', lcd: '凍結？',
    h: '昼まで待ってみましょう',
    items: ['気温が上がると解けることが多い', '配管に熱湯はかけない', '給湯器の電源プラグは抜かない（凍結を防ぐ機能が止まります）'],
    note: '昼を過ぎても出なければ、故障を疑います。',
    cont: '昼を過ぎても出ない',
  },
  nowater: {
    icon: Droplet, label: '水道の問題かもしれません', lcd: '断水？',
    h: '断水や水道管の凍結を確認',
    items: ['ほかの蛇口から水が出るか', '出なければ水道局の断水情報を見る'],
  },
  rent: {
    icon: Building2, label: '賃貸の場合', lcd: '管理会社',
    h: 'まず管理会社か大家さんへ',
    items: ['給湯器は建物の設備で、手配は管理会社が多い', '費用の負担は賃貸契約で決まっていることが多い', '「症状・いつから・エラー番号」を伝える'],
  },
};

const MODE_STYLE: Record<Mode, { icon: Icon; lcd: string; tone: string; iconBg: string }> = {
  replace: { icon: RefreshCw, lcd: '交換', tone: 'text-orange-700', iconBg: 'bg-orange-100 text-orange-700' },
  both: { icon: Scale, lcd: '比較', tone: 'text-sky-800', iconBg: 'bg-sky-100 text-sky-800' },
  repair: { icon: Wrench, lcd: '修理', tone: 'text-emerald-700', iconBg: 'bg-emerald-100 text-emerald-700' },
};

function Lcd({ msg, num, blink = false, fontClass }: { msg: string; num: string; blink?: boolean; fontClass: string }) {
  return (
    <div className={`flex min-h-[56px] items-center justify-between gap-3 rounded-xl bg-[#1c2a22] px-4 py-2 text-[#b9f5c8] ${fontClass}`}>
      <span className="text-[15px] leading-snug">{msg}</span>
      <span className="whitespace-nowrap text-[28px] leading-none tracking-wider tabular-nums">
        {blink ? <span className="animate-pulse motion-reduce:animate-none">--</span> : num}
        {blink ? '℃' : ''}
      </span>
    </div>
  );
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

/** 最初の質問（開始ボタンを挟まず、最初の画面から答えられるようにする。2026-10-29 v4）。preset で答え済みの設問は飛ばす。 */
function firstStepOf(preset: Answers): Step {
  return activeSteps(preset).find((s) => !(s.id in preset)) ?? activeSteps({})[0];
}

export default function OyuDiagnosis({ lcdFontClass, preset = {} }: { lcdFontClass: string; preset?: Answers }) {
  const FIRST_STEP = firstStepOf(preset);
  const [view, setView] = useState<View>({ kind: 'step', step: FIRST_STEP });
  const [answers, setAnswers] = useState<Answers>(preset);
  const [history, setHistory] = useState<StepId[]>([]);
  const [panelVisible, setPanelVisible] = useState(true);
  const attr = useRef<Attribution>({});
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    attr.current = readAttribution();
  }, []);

  // 診断パネルが画面外にあるときだけ、画面下の固定ボタンを出す
  useEffect(() => {
    const el = panelRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([e]) => setPanelVisible(e.isIntersecting), { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const log = useCallback((event: string, params: Record<string, string | number> = {}, extra: Partial<Parameters<typeof trackEvent>[0]> = {}) => {
    sendGAEvent('event', event, { lp_name: LP_ID, version: VERDICT_VERSION, ...params });
    void trackEvent({
      lp_id: LP_ID,
      event_name: event,
      ...extra,
      metadata: { ...params, ...attr.current, version: VERDICT_VERSION },
    });
  }, []);

  const scrollToPanel = () => {
    panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const goNext = (a: Answers) => {
    const next = activeSteps(a).find((s) => !(s.id in a));
    setView(next ? { kind: 'step', step: next } : { kind: 'result' });
    scrollToPanel();
  };

  // 「診断開始」は最初の質問に答えた時点で数える（開始ボタンをなくしたため）
  const started = useRef(false);

  const choose = (step: Step, value: string) => {
    if (!started.current) {
      started.current = true;
      log('kyutoki_diag_start', { first: step.id });
    }
    const a = { ...answers, [step.id]: value } as Answers;
    setAnswers(a);
    setHistory((h) => [...h, step.id]);
    log('kyutoki_diag_answer', { step: step.id, answer: value }, { question_id: step.id, answer_id: value });
    const stop = stopFor(step.id, value);
    if (stop) {
      setView({ kind: 'stop', key: stop });
      log('kyutoki_diag_stop', { reason: stop }, { section_id: 'stop' });
      scrollToPanel();
      return;
    }
    goNext(a);
  };

  const back = () => {
    const h = [...history];
    const last = h.pop();
    if (!last) {
      setView({ kind: 'step', step: FIRST_STEP });
      return;
    }
    const a = { ...answers };
    delete a[last];
    setHistory(h);
    setAnswers(a);
    const step = STEPS.find((s) => s.id === last);
    if (step) setView({ kind: 'step', step });
  };

  const restart = () => {
    setAnswers(preset);
    setHistory([]);
    setView({ kind: 'step', step: FIRST_STEP });
  };

  const continueAfterFreeze = () => {
    const a: Answers = { ...answers, cold: 'no' };
    setAnswers(a);
    log('kyutoki_diag_answer', { step: 'cold', answer: 'freeze_continue' }, { question_id: 'cold', answer_id: 'freeze_continue' });
    goNext(a);
  };

  const onSticky = () => {
    log('kyutoki_sticky_click', { view: view.kind });
    scrollToPanel();
  };

  // 結果表示のログは、表示された時に1回だけ出す
  const resultLogged = useRef(false);
  useEffect(() => {
    if (view.kind !== 'result') {
      resultLogged.current = false;
      return;
    }
    if (resultLogged.current) return;
    resultLogged.current = true;
    const v = verdictOf(answers);
    const pk = pickPartners(answers, v);
    log('kyutoki_diag_result', {
      verdict: v.mode,
      partner: pk ? pk.main.key : 'none',
      area: answers.area ?? '',
      type: answers.type ?? '',
      symptom: answers.symptom ?? '',
      age: answers.age ?? '',
    }, { section_id: 'result' });
  }, [view, answers, log]);

  const onPartnerClick = (p: Partner, position: 'main' | 'sub') => {
    const v = verdictOf(answers);
    // 既存のGoogle広告コンバージョン（AffiliateCtaBox と同じイベント名・同じ引数の形）
    sendGAEvent('event', 'affiliate_click', { lp_name: LP_ID, position, program_name: p.name });
    log('kyutoki_partner_click', {
      partner: p.key, position, area: answers.area ?? '', type: answers.type ?? '', verdict: v.mode, reward: p.reward,
    }, { cta_id: `${p.key}-${position}`, partner_category: 'kyutoki', source_section: 'result' });
  };

  /* ===== 表示 ===== */
  // 入口で答え済みの設問は、進み具合の表示に数えない
  const steps = activeSteps(answers).filter((s) => !(s.id in preset));
  const primaryBtn = 'flex min-h-[60px] w-full items-center justify-center gap-2 rounded-2xl bg-orange-600 px-5 text-lg font-bold text-white shadow-[0_8px_20px_-10px_rgba(234,88,12,.8)] transition hover:bg-orange-700 active:scale-[.99]';

  let body: React.ReactNode;

  if (view.kind === 'step') {
    const step = view.step;
    const idx = Math.max(0, steps.findIndex((s) => s.id === step.id));
    const withIcons = step.opts.some((o) => OPT_ICONS[`${step.id}:${o.v}`]);
    const cols = step.id === 'type' || step.id === 'cold' ? 'grid-cols-3' : 'grid-cols-2';
    body = (
      <>
        <div className="flex items-center justify-between text-xs font-bold text-slate-500">
          <span>質問 {idx + 1} / {steps.length}</span>
          <span className={`${lcdFontClass} text-sm text-slate-400`}>{step.lcd}</span>
        </div>
        <div className="flex gap-1.5" aria-hidden="true">
          {steps.map((s, i) => (
            <span key={s.id} className={`h-1.5 flex-1 rounded-full ${i <= idx ? 'bg-sky-600' : 'bg-slate-200'}`} />
          ))}
        </div>
        <p className="pt-1 text-[22px] font-bold leading-snug text-slate-900">{step.q}</p>
        {step.hint && <p className="-mt-2 text-sm text-slate-500">{step.hint}</p>}
        <div className={`grid gap-2.5 ${cols}`}>
          {step.opts.map((o) => {
            const I = OPT_ICONS[`${step.id}:${o.v}`];
            const danger = o.danger;
            return (
              <button
                key={o.v}
                type="button"
                onClick={() => choose(step, o.v)}
                className={`flex min-h-[64px] flex-col items-center justify-center gap-1.5 rounded-2xl border-2 bg-white px-2 py-3 text-center transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-sky-600 ${danger ? 'col-span-full border-red-200 bg-red-50 hover:border-red-400' : 'border-slate-200 hover:border-sky-500'}`}
              >
                {withIcons && I && (
                  <span className={`flex h-10 w-10 items-center justify-center rounded-full ${danger ? 'bg-red-100 text-red-600' : 'bg-sky-50 text-sky-700'}`}>
                    <I size={22} aria-hidden="true" />
                  </span>
                )}
                <span className={`text-[15px] font-bold leading-tight ${danger ? 'text-red-700' : 'text-slate-800'}`}>{o.t}</span>
                {o.s && <span className="text-[11px] leading-tight text-slate-500">{o.s}</span>}
              </button>
            );
          })}
        </div>
        {step.howto && (
          <details className="rounded-xl bg-slate-50 px-4 py-3 text-sm">
            <summary className="cursor-pointer font-bold text-sky-800">見分け方がわからない</summary>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-slate-600">
              <li>本体に「エコキュート」と書いてあればエコキュート</li>
              <li>ガスの請求書が来ていればガス給湯器</li>
            </ul>
          </details>
        )}
        {history.length > 0 ? (
          <Nav onBack={back} />
        ) : (
          <p className="text-center text-xs text-slate-500">無料・登録不要。名前や連絡先の入力はありません</p>
        )}
      </>
    );
  } else if (view.kind === 'stop') {
    const s = STOPS[view.key];
    const I = s.icon;
    body = (
      <>
        <Lcd msg="診断結果" num={s.lcd} fontClass={lcdFontClass} />
        <div className="flex flex-col items-center gap-3 pt-2 text-center">
          <span className={`flex h-14 w-14 items-center justify-center rounded-full ${s.danger ? 'bg-red-100 text-red-600' : 'bg-sky-100 text-sky-700'}`}>
            <I size={28} aria-hidden="true" />
          </span>
          <span className={`text-xs font-bold ${s.danger ? 'text-red-700' : 'text-sky-800'}`}>{s.label}</span>
          <h2 className="text-[24px] font-bold leading-snug text-slate-900">{s.h}</h2>
        </div>
        <ul className="grid gap-2">
          {s.items.map((t) => (
            <li key={t} className="flex items-start gap-2.5 rounded-xl bg-slate-50 px-4 py-3 text-[15px] text-slate-700">
              <CircleCheck size={18} className="mt-0.5 shrink-0 text-sky-600" aria-hidden="true" />{t}
            </li>
          ))}
        </ul>
        {s.note && <p className="text-center text-sm text-slate-500">{s.note}</p>}
        {s.cont && (
          <button type="button" onClick={continueAfterFreeze} className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl border-2 border-slate-200 bg-white font-bold text-slate-800 hover:border-sky-500">
            {s.cont} <ArrowRight size={18} aria-hidden="true" />
          </button>
        )}
        <Nav onBack={back} onRestart={restart} />
      </>
    );
  } else {
    const v = verdictOf(answers);
    const pk = pickPartners(answers, v);
    // v6：今は使えて7年未満の人には「修理」と出さない（直すものがないため）。
    const ms = answers.symptom === 'fine' && answers.age === 'lt7'
      ? { icon: CircleCheck, lcd: '良好', tone: 'text-emerald-700', iconBg: 'bg-emerald-100 text-emerald-700' }
      : MODE_STYLE[v.mode];
    const VI = ms.icon;
    body = (
      <>
        <Lcd msg="診断結果" num={ms.lcd} fontClass={lcdFontClass} />
        <div className="flex flex-col items-center gap-3 pt-2 text-center">
          <span className={`flex h-16 w-16 items-center justify-center rounded-full ${ms.iconBg}`}>
            <VI size={32} aria-hidden="true" />
          </span>
          <span className="flex items-center gap-1 text-xs font-bold text-slate-500"><Clock size={14} aria-hidden="true" />使用年数 {v.label}</span>
          <h2 className={`text-[28px] font-black leading-tight ${ms.tone}`}>{v.h}</h2>
          <p className="max-w-[24em] text-[15px] text-slate-600 [text-wrap:balance]">{v.why}</p>
          {answers.symptom === 'leak' && (
            <p className="rounded-xl bg-red-50 px-4 py-2 text-sm text-red-800">水漏れ中は、電源を切って給水の元栓を閉めてください。</p>
          )}
        </div>

        {pk ? (
          <div className="flex flex-col gap-3 rounded-2xl border-2 border-orange-200 bg-orange-50/60 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-orange-800">あなたの地域に対応する会社</span>
              <span className="rounded border border-orange-300 px-1.5 text-[10px] tracking-widest text-orange-800">PR</span>
            </div>
            <div>
              <p className="text-xl font-black text-slate-900">{pk.main.name}</p>
              <p className="text-sm text-slate-600">{pk.main.who}</p>
            </div>
            <ul className="flex flex-wrap gap-1.5">
              {pk.main.points.map((t) => (
                <li key={t} className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-700 ring-1 ring-orange-200">{t}</li>
              ))}
            </ul>
            {/* v7（10/31）：ガスで交換を考える判定のとき、押す前に費用の目安を1行。10/30の記録で「交換の時期」と出た4人が誰も押さなかったため。数字は /kyutoki/kokan-hiyou と同じ出典 */}
            {answers.type === 'gas' && v.mode !== 'repair' && (
              <p className="flex flex-col items-center gap-0.5 rounded-xl bg-white px-4 py-3 text-center ring-1 ring-orange-200">
                <span className="text-[12px] text-slate-500">交換の目安（工事費込み）</span>
                <span className="text-[14px] text-slate-700">ふろ給湯器で<b className="ml-1 text-[22px] font-black text-slate-900">15〜20万円</b></span>
              </p>
            )}
            <a
              href={pk.main.href}
              target="_blank"
              rel="sponsored noopener"
              onClick={() => onPartnerClick(pk.main, 'main')}
              className={primaryBtn}
            >
              <span className="whitespace-nowrap">{pk.main.cta}</span> <ArrowRight size={20} aria-hidden="true" />
            </a>
            <p className="text-center text-[11px] text-slate-500">
              断っても費用はかかりません。{pk.main.name}のサイトに移動します
              {answers.type === 'gas' && v.mode !== 'repair' && <><br />費用の目安：東京ガスの公表相場（2026年10月）</>}
            </p>
            {pk.main.beacon && (
              // A8 の表示計測（1×1の画像）。広告リンクと一緒に置く決まり。
              // eslint-disable-next-line @next/next/no-img-element
              <img src={pk.main.beacon} width={1} height={1} alt="" className="absolute h-px w-px opacity-0" />
            )}
            {pk.sub?.beacon && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={pk.sub.beacon} width={1} height={1} alt="" className="absolute h-px w-px opacity-0" />
            )}
            {pk.sub && (
              <a
                href={pk.sub.href}
                target="_blank"
                rel="sponsored noopener"
                onClick={() => onPartnerClick(pk.sub as Partner, 'sub')}
                className="text-center text-sm font-bold text-sky-800 underline underline-offset-4"
              >
                交換の見積もりを {pk.sub.name} でも取る
              </a>
            )}
          </div>
        ) : (
          <div className="flex gap-3 rounded-2xl bg-slate-50 p-4 text-[14px] text-slate-700">
            <Bath size={22} className="mt-0.5 shrink-0 text-slate-400" aria-hidden="true" />
            <div className="grid gap-1">
              <b className="text-slate-900">{noPartnerReason(answers, v)}</b>
              <span>{answers.symptom === 'fine' && answers.age === 'lt7'
                ? '10年が近づいたら、もう一度診断してください。'
                : 'メーカーの修理窓口か、契約中のガス会社へ。型番と製造年を伝えると早く進みます。'}</span>
            </div>
          </div>
        )}

        {/* v5：自己点検は紹介先の下に、折りたたみで。結果まで来た人が点検項目を読んで帰る流れ（10/30 の記録：2〜5分滞在して未クリック）を切るため */}
        <details className="group rounded-2xl bg-slate-50 px-4 py-3" onToggle={(e) => { if ((e.currentTarget as HTMLDetailsElement).open) log('kyutoki_selfcheck_open'); }}>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-bold text-slate-700">
            呼ぶ前に自分で試せること（{selfCheck(answers).length}つ）
            <span aria-hidden="true" className="text-xl text-slate-400 transition group-open:rotate-45">＋</span>
          </summary>
          <ul className="mt-3 grid gap-1.5">
            {selfCheck(answers).map((t) => (
              <li key={t} className="flex items-start gap-2 text-[14px] text-slate-700">
                <CircleCheck size={17} className="mt-0.5 shrink-0 text-emerald-600" aria-hidden="true" />{t}
              </li>
            ))}
          </ul>
        </details>
        <Nav onBack={back} onRestart={restart} />
      </>
    );
  }

  const showSticky = !panelVisible && view.kind === 'step';

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
            {history.length === 0 ? '30秒で診断する' : '診断の続きへ'} <ArrowRight size={20} aria-hidden="true" />
          </button>
        </div>
      )}
    </>
  );
}
