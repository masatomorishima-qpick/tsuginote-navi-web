'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { sendGAEvent } from '@next/third-parties/google';
import { trackEvent } from '@/lib/trackEvent';
import {
  LP_ID, VERDICT_VERSION, STEPS, activeSteps, stopFor, verdictOf, selfCheck,
  pickPartners, noPartnerReason,
  type Answers, type Step, type StepId, type StopKey, type Partner,
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
 *   Supabase lp_event_logs（trackEvent）… 上と同じ節目を lp_id = LP_ID で保存。
 *     metadata に utm_* / gclid / 版（VERDICT_VERSION）を入れるので、
 *     「どの広告グループ → どの回答 → 送客したか」を SQL で追える。
 */

type View =
  | { kind: 'start' }
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

const STOPS: Record<StopKey, { tone: 'danger' | 'info'; label: string; h: string; lcd: string; items: string[]; note?: string; cont?: string }> = {
  gas: {
    tone: 'danger', label: '今すぐの対応が必要です', lcd: '使用中止',
    h: '給湯器を使わず、ガス会社へ連絡してください',
    items: [
      '火を使わない。換気扇や照明のスイッチにも触れない',
      '窓と扉を開けて換気する',
      '屋外で、契約中のガス会社の緊急連絡先へ電話する（請求書やガスメーターに書いてあります）',
    ],
  },
  freeze: {
    tone: 'info', label: '凍結の可能性が高いです', lcd: '凍結?',
    h: 'まずは自然に解けるのを待ちましょう',
    items: ['気温が上がると、昼までに解けることが多いです', '配管に熱湯をかけない（破損のおそれ）', 'リモコンの電源は入れたままにする'],
    note: '昼を過ぎても出ない、または水漏れが見えるときは、凍結以外の故障を疑います。',
    cont: '解けても直らないので先へ進む',
  },
  nowater: {
    tone: 'info', label: '給湯器ではなく水道の問題かもしれません', lcd: '断水?',
    h: '断水や水道管の凍結を確かめましょう',
    items: ['台所など、ほかの蛇口から水が出るかを見る', 'どこも出なければ、自治体の水道局の断水情報を確かめる', '冷え込んだ朝なら、水道管の凍結が考えられます'],
  },
  rent: {
    tone: 'info', label: '賃貸の場合', lcd: '管理会社へ',
    h: '先に管理会社か大家さんへ連絡してください',
    items: [
      '給湯器は建物の設備なので、多くの場合は管理会社が業者を手配します',
      '費用の負担も賃貸契約で決まっています',
      '連絡のときは「症状」「いつから」「リモコンのエラー番号」を伝えると話が早いです',
    ],
  },
};

const MODE_LCD = { replace: '交換', both: '比較', repair: '修理' } as const;
const TAG_CLS = {
  replace: 'bg-orange-50 text-orange-700',
  both: 'bg-sky-50 text-sky-800',
  repair: 'bg-emerald-50 text-emerald-800',
} as const;

function Lcd({ msg, num, blink = false, fontClass }: { msg: string; num: string; blink?: boolean; fontClass: string }) {
  return (
    <div className={`flex min-h-[58px] items-baseline justify-between gap-3 rounded-[10px] bg-[#1c2a22] px-4 py-2.5 text-[#b9f5c8] ${fontClass}`}>
      <span className="text-[15px] leading-snug">{msg}</span>
      <span className="whitespace-nowrap text-[30px] leading-none tracking-wider tabular-nums">
        {blink ? <span className="animate-pulse motion-reduce:animate-none">--</span> : num}
        {blink ? '℃' : ''}
      </span>
    </div>
  );
}

function Nav({ onBack, onRestart }: { onBack: () => void; onRestart?: () => void }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <button type="button" onClick={onBack} className="py-1.5 text-sky-800 underline underline-offset-4">ひとつ戻る</button>
      {onRestart && (
        <button type="button" onClick={onRestart} className="py-1.5 text-sky-800 underline underline-offset-4">最初からやり直す</button>
      )}
    </div>
  );
}

export default function OyuDiagnosis({ lcdFontClass }: { lcdFontClass: string }) {
  const [view, setView] = useState<View>({ kind: 'start' });
  const [answers, setAnswers] = useState<Answers>({});
  const [history, setHistory] = useState<StepId[]>([]);
  const attr = useRef<Attribution>({});
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    attr.current = readAttribution();
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
    if (next) {
      setView({ kind: 'step', step: next });
    } else {
      setView({ kind: 'result' });
    }
    scrollToPanel();
  };

  const start = () => {
    log('kyutoki_diag_start');
    goNext({});
  };

  const choose = (step: Step, value: string) => {
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
      setView({ kind: 'start' });
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
    setAnswers({});
    setHistory([]);
    setView({ kind: 'start' });
  };

  const continueAfterFreeze = () => {
    const a: Answers = { ...answers, cold: 'no' };
    setAnswers(a);
    log('kyutoki_diag_answer', { step: 'cold', answer: 'freeze_continue' }, { question_id: 'cold', answer_id: 'freeze_continue' });
    goNext(a);
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
  const steps = activeSteps(answers);

  const optCls = 'flex w-full min-h-[56px] items-center justify-between gap-3 rounded-xl border-[1.5px] border-slate-200 bg-slate-50 px-4 py-3.5 text-left text-base leading-normal transition hover:border-sky-700 hover:bg-sky-50 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-sky-700';

  let body: React.ReactNode;

  if (view.kind === 'start') {
    body = (
      <>
        <Lcd msg="お湯が出ない？" num="" blink fontClass={lcdFontClass} />
        <p className="text-xl font-bold">5つの質問で、次にやることが分かります</p>
        <p className="text-sm text-slate-600">症状 → 給湯器の種類 → 住まい → 使用年数 → 地域。入力した内容に名前や連絡先は含まれません。</p>
        <button type="button" onClick={start} className="flex min-h-[58px] w-full items-center justify-center rounded-xl bg-orange-700 text-lg font-bold text-white transition hover:bg-orange-800">
          30秒で診断する
        </button>
      </>
    );
  } else if (view.kind === 'step') {
    const step = view.step;
    const idx = steps.findIndex((s) => s.id === step.id);
    body = (
      <>
        <Lcd msg={step.lcd} num={`${idx + 1}/${steps.length}`} fontClass={lcdFontClass} />
        <div className="flex gap-1.5" aria-hidden="true">
          {steps.map((s, i) => (
            <span key={s.id} className={`h-1 flex-1 rounded ${i <= idx ? 'bg-sky-700' : 'bg-slate-200'}`} />
          ))}
        </div>
        <p className="text-xl font-bold">{step.q}</p>
        {step.hint && <p className="text-sm text-slate-600">{step.hint}</p>}
        <div className={`grid gap-2.5 ${step.grid ? 'grid-cols-2' : ''}`}>
          {step.opts.map((o) => (
            <button
              key={o.v}
              type="button"
              onClick={() => choose(step, o.v)}
              className={`${optCls} ${o.danger ? 'border-red-600' : ''} ${step.grid ? 'justify-center text-center' : ''}`}
            >
              <span>
                {o.t}
                {o.s && <small className="block text-[13px] text-slate-600">{o.s}</small>}
              </span>
              {!step.grid && <span aria-hidden="true" className="text-2xl text-slate-400">›</span>}
            </button>
          ))}
        </div>
        {step.howto && (
          <details className="rounded-[10px] bg-sky-50 px-3 py-2.5 text-sm">
            <summary className="cursor-pointer font-bold text-sky-800">見分け方がわからないとき</summary>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>リモコンや本体に「エコキュート」と書いてあればエコキュート</li>
              <li>ガスの請求書が届いていて、屋外の箱から排気が出ていればガス給湯器</li>
              <li>それでも不明なら、本体ラベルの写真を撮っておくと見積もりが早く進みます</li>
            </ul>
          </details>
        )}
        {history.length > 0 && <Nav onBack={back} />}
      </>
    );
  } else if (view.kind === 'stop') {
    const s = STOPS[view.key];
    body = (
      <>
        <Lcd msg="診断結果" num={s.lcd} fontClass={lcdFontClass} />
        <div className="flex flex-col gap-2.5">
          <span className={`self-start rounded-full px-2.5 py-0.5 text-xs font-bold ${s.tone === 'danger' ? 'bg-red-50 text-red-700' : 'bg-sky-50 text-sky-800'}`}>{s.label}</span>
          <h2 className="text-[22px] font-bold leading-snug">{s.h}</h2>
          <ol className="list-decimal space-y-1 pl-5 text-[15px]">
            {s.items.map((t) => <li key={t}>{t}</li>)}
          </ol>
          {s.note && <p className="text-sm text-slate-600">{s.note}</p>}
        </div>
        {s.cont && (
          <button type="button" onClick={continueAfterFreeze} className={optCls}>
            <span>{s.cont}</span><span aria-hidden="true" className="text-2xl text-slate-400">›</span>
          </button>
        )}
        <Nav onBack={back} onRestart={restart} />
      </>
    );
  } else {
    const v = verdictOf(answers);
    const pk = pickPartners(answers, v);
    body = (
      <>
        <Lcd msg="診断結果" num={MODE_LCD[v.mode]} fontClass={lcdFontClass} />
        <div className="flex flex-col gap-2.5">
          <span className={`self-start rounded-full px-2.5 py-0.5 text-xs font-bold ${TAG_CLS[v.mode]}`}>{v.label}</span>
          <h2 className="text-[22px] font-bold leading-snug">{v.h}</h2>
          <p className="text-[15px] leading-relaxed">{v.why}</p>
          {answers.symptom === 'leak' && (
            <p className="text-sm text-slate-600"><b>水漏れ・煙があるときは</b>、給湯器の電源を切り、給水の元栓を閉めてから見積もりを依頼してください。</p>
          )}
        </div>
        <div className="flex flex-col gap-2 border-t border-dashed border-slate-200 pt-3.5">
          <h3 className="text-[15px] font-bold">業者を呼ぶ前に1分チェック</h3>
          <ol className="list-decimal space-y-1 pl-5 text-[15px]">
            {selfCheck(answers).map((t) => <li key={t}>{t}</li>)}
          </ol>
        </div>
        {pk ? (
          <div className="flex flex-col gap-2 rounded-2xl bg-orange-50 p-4">
            <span className="text-[13px] text-slate-600">あなたの条件に対応している紹介先（PR）</span>
            <span className="text-lg font-bold">{pk.main.name}｜{pk.main.who}</span>
            <ul className="list-disc space-y-0.5 pl-5 text-sm">
              {pk.main.points.map((t) => <li key={t}>{t}</li>)}
            </ul>
            <a
              href={pk.main.href}
              target="_blank"
              rel="sponsored noopener noreferrer"
              onClick={() => onPartnerClick(pk.main, 'main')}
              className="flex min-h-[58px] w-full items-center justify-center rounded-xl bg-orange-700 text-lg font-bold text-white transition hover:bg-orange-800"
            >
              無料で見積もりを申し込む
            </a>
            <p className="text-xs leading-relaxed text-slate-600">申し込み先は{pk.main.name}のサイトです。料金や対応時間は申し込み先でご確認ください。</p>
            {pk.sub && (
              <a
                href={pk.sub.href}
                target="_blank"
                rel="sponsored noopener noreferrer"
                onClick={() => onPartnerClick(pk.sub as Partner, 'sub')}
                className="mt-1 text-center text-sm text-sky-800 underline underline-offset-4"
              >
                交換の見積もりを {pk.sub.name} でも取る（PR）
              </a>
            )}
          </div>
        ) : (
          <div className="grid gap-1.5 rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-[15px]">
            <b>{noPartnerReason(answers, v)}</b>
            <span>本体に書かれたメーカーの修理受付か、ガス給湯器なら契約中のガス会社へ相談してください。型番と製造年を伝えると見積もりが早く進みます。</span>
          </div>
        )}
        <Nav onBack={back} onRestart={restart} />
      </>
    );
  }

  return (
    <div
      ref={panelRef}
      id="shindan"
      aria-live="polite"
      className="flex scroll-mt-20 flex-col gap-4 rounded-[18px] border border-slate-200 bg-white p-4 shadow-[0_1px_0_#e2e8f0,0_10px_30px_-18px_rgba(14,40,60,.35)]"
    >
      {body}
    </div>
  );
}
