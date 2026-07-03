"use client";

/**
 * 住宅ローン最適配分コンシェルジュ MVP（テストLP・確定版設計に準拠）
 * 設計：ダッシュボード設計_住宅ローン最適配分_確定版_20260622.md
 *
 * 思想：システムは「あなたの配分が正しいか」を判定しない。
 *      「自分の数字を見た上で、各論点について意思決定を完了したか」を測る（完了率モデル）。
 * - 主役メーター＝意思決定の完了スコア（該当バケツのみ・各バケツ0/1・「しない」も完了）。
 * - 補助メーター＝改善額（"事実の結果"のみ。推奨にしない。教育費は載せない）。
 * - 中立性：助言しない／商品名を出さない／繰上げvs投資は両論併記・断定しない／
 *           想定リターンrはユーザーが置く／借換の内部基準金利を画面明示／A層は別出口。
 * - 計測：GA4（既存 G-YOGL1PWXZH）＋Clarity継承。再訪はlocalStorage＋GA4クライアントID。
 * - 配色：つぎの手ナビ本体に合わせた emerald＋slate。
 * - 金利変動シナリオは次フェーズ（rを変数化しておき後付け可能）。
 */

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";

/* ===== 定数 ===== */
const RET_AGE = 65;
const REFI_BASE = 0.7; // 借り換え試算の内部基準金利(%)・画面に明示・手動更新可
// v2: 入力単位を円に統一（2026-06-23）。旧 v1 の万円キャッシュを誤読しないよう改番。
const KEY = "shisan_loan_mvp_v2";
const EDU_PLANS = { kokukou: 400, shibun: 550, shiri: 700 } as const; // 万円・文科省データ等を典拠とする目安
type EduPlan = keyof typeof EDU_PLANS;

/* ===== 型 ===== */
interface Inputs {
  age: number; income: number; assets: number;
  surplus: number;   // 毎月の投資・貯蓄余力（円）
  living: number;    // 毎月の生活費ざっくり（円）
  hasMortgage: boolean; mBal: number; mYears: number; mRate: number; mType: string;
  childAges: number[];
  eduPlan: EduPlan;
  target: number;    // 65歳での目標額（万円）
  r: number;         // 想定リターン（%）ユーザーが置く
}
type BucketId = "liq" | "edu" | "refi" | "prepay" | "nisa";
interface Decision { choice: string; }
interface Store {
  inputs: Inputs | null;
  decisions: Partial<Record<BucketId, Decision>>;
  firstVisit: number;
  lastVisit: number | null;
  signup?: SignupFlags; // 会員登録の状態（第一陣・開発依頼書_20260703）
}
interface SignupFlags { registered?: boolean; closed?: boolean; }

/* 打ち手カード（あなたの次の一手） */
type ActionExternal = "expense" | "income" | "invest" | "refi";
interface DualCell { label: string; value: string; note: string; }
interface ActionCard {
  id: string;                 // 計測用 action_id
  title: string;              // 行動（商品名は出さない）
  effect?: ReactNode;         // 効果の一行（数字 or 方向性＋理由）
  dual?: { left: DualCell; right: DualCell }; // 繰上げvs投資の対等表示
  bucket?: BucketId;          // タップで開く対応質問（段階3で結線）
  external?: ActionExternal;  // 実行接点（段階4で送客リンク）
}
/* 実行接点（アフィリエイト送客）。URLは後入れ＝空でも枠と計測は動く（差し替え可能）。 */
const AFFILIATE_LINKS: Record<ActionExternal, string> = {
  expense: "", income: "", invest: "", refi: "",
};
const EXEC_LABEL: Record<ActionExternal, string> = {
  expense: "固定費の見直しを調べる →",
  income: "仕事・学びの選択肢を見る →",
  invest: "口座の選択肢を見る →",
  refi: "借り換えを調べる →",
};

/* シェア導線（第一陣・要件2）。金額・年齢・個人情報はシェア文言に一切含めない。 */
const SHARE_URL = "https://www.tsuginotenavi.jp/shisan";
const SCENARIO_PHASE: Record<"A" | "B" | "C", string> = {
  A: "教育費と老後準備の両立フェーズ",
  B: "準備を先に進めるフェーズ",
  C: "家計の土台を固めるフェーズ",
};

// 注：window.gtag の型は lib/analytics/ga4.ts のグローバル宣言を使う
// （ここで再宣言すると型不一致 TS2717 になるため宣言しない）。
declare global {
  interface Window {
    clarity?: (...args: unknown[]) => void;
  }
}

/* ===== 計算 ===== */
const yen = (n: number) => Math.round(n).toLocaleString("ja-JP");
const man = (n: number) => Math.round(n / 10000).toLocaleString("ja-JP");
const annFactor = (n: number, rate: number) => (rate === 0 ? n : (Math.pow(1 + rate, n) - 1) / rate);

function loanPayment(B: number, ratePct: number, years: number): number {
  const i = ratePct / 100 / 12, N = years * 12;
  if (N <= 0) return 0;
  if (i === 0) return B / N;
  return (B * i) / (1 - Math.pow(1 + i, -N));
}
function totalInterest(B: number, ratePct: number, years: number): number {
  return loanPayment(B, ratePct, years) * years * 12 - B;
}
function prepayCompression(B: number, ratePct: number, years: number, prepay: number): number {
  const i = ratePct / 100 / 12;
  if (i === 0 || years <= 0 || B <= 0) return 0;
  const payment = loanPayment(B, ratePct, years);
  const newBal = B - prepay;
  if (newBal <= 0) return totalInterest(B, ratePct, years);
  const newN = -Math.log(1 - (newBal * i) / payment) / Math.log(1 + i);
  if (!isFinite(newN) || newN <= 0) return 0;
  const after = payment * newN - newBal;
  return Math.max(0, totalInterest(B, ratePct, years) - after);
}
function refinance(B: number, curRate: number, years: number) {
  if (B <= 0 || years <= 0) return null;
  const mNow = loanPayment(B, curRate, years);
  const mNew = loanPayment(B, REFI_BASE, years);
  const dMonthly = Math.max(0, mNow - mNew);
  const dInterest = Math.max(0, totalInterest(B, curRate, years) - totalInterest(B, REFI_BASE, years));
  const cost = Math.round(B * 0.022 + 100000); // 諸費用概算（事務手数料2.2%＋登記等10万）
  const months = dMonthly > 0 ? Math.ceil(cost / dMonthly) : Infinity;
  return { mNow, mNew, dMonthly, dInterest, cost, months };
}
function eduMonthly(ages: number[], plan: EduPlan): number {
  const cost = EDU_PLANS[plan] * 10000;
  let sum = 0;
  ages.forEach((a) => { const m = Math.max(0, 18 - a) * 12; if (m > 0) sum += cost / m; });
  return Math.round(sum);
}

/* ===== 計測 ===== */
function track(name: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  if (location.search.includes("ga_debug")) console.log("[track]", name, params ?? {});
  try {
    window.gtag?.("event", name, params ?? {});
    window.clarity?.("event", name);
  } catch { /* no-op */ }
}

/* ===== カウントアップ ===== */
function CountUp({ value }: { value: number }) {
  const [disp, setDisp] = useState(value);
  const prev = useRef(value);
  useEffect(() => {
    const from = prev.current, to = value, start = performance.now(), dur = 500;
    let raf = 0;
    const step = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      setDisp(Math.round(from + (to - from) * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(step); else prev.current = to;
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <>{disp.toLocaleString("ja-JP")}</>;
}

/* ===== UIクラス ===== */
const card = "bg-white border border-slate-200 rounded-2xl shadow-sm p-5 mb-4";
const inputCls = "w-full px-3 py-2.5 border border-slate-200 rounded-xl text-[15px] focus:outline-none focus:ring-2 focus:ring-emerald-600";
const label = "block text-[13px] font-semibold mt-3 mb-1 text-slate-700";
const hint = "font-normal text-slate-400 text-xs";
const btn = "w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-base font-bold transition";
const btnSm = "px-3.5 py-2 rounded-lg text-sm font-bold transition";
const chip = "px-3 py-1.5 rounded-full text-sm font-semibold border transition";

export default function AssetConciergeMvp() {
  // 入力フォームから開始（従来フロー維持。別LP画面は挟まない）。
  const [screen, setScreen] = useState<"hook" | "input" | "dash" | "exit">("input");
  const [form, setForm] = useState<Record<string, string>>({ target: "20000000", r: "3", eduPlan: "shibun", mType: "変動" });
  // 住宅ローンは「任意の一要素」。賃貸・完済層も対象に入るため既定オフ。
  const [hasMortgage, setHasMortgage] = useState(false);
  const [childCount, setChildCount] = useState(0);
  const [childAges, setChildAges] = useState<string[]>([]);
  const [inputs, setInputs] = useState<Inputs | null>(null);
  const [decisions, setDecisions] = useState<Partial<Record<BucketId, Decision>>>({});
  const [openBucket, setOpenBucket] = useState<BucketId | null>(null);
  const [toast, setToast] = useState("");
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoOpened = useRef(false);
  const actionsViewed = useRef(false);
  /* 会員登録導線（第一陣・要件1） */
  const signupViewed = useRef(false);
  const [signupFlags, setSignupFlags] = useState<SignupFlags>({});
  const [lastDecided, setLastDecided] = useState<BucketId | null>(null);
  const [justRegistered, setJustRegistered] = useState(false);

  /* 復元＋再訪判定 */
  useEffect(() => {
    let s: Store | null = null;
    try { s = JSON.parse(localStorage.getItem(KEY) || "null"); } catch { s = null; }
    if (s?.inputs) {
      setInputs(s.inputs); setDecisions(s.decisions || {}); setSignupFlags(s.signup ?? {}); setScreen("dash");
      track("shisan_dashboard_view"); track("shisan_result_view");
      if (s.lastVisit) {
        const prev = new Date(s.lastVisit), now = new Date();
        const monthsApart = (now.getFullYear() - prev.getFullYear()) * 12 + (now.getMonth() - prev.getMonth());
        if (monthsApart >= 1) track("shisan_return", { months_apart: monthsApart });
      }
    } else {
      track("shisan_input_start");
    }
    const next: Store = {
      inputs: s?.inputs ?? null, decisions: s?.decisions ?? {},
      firstVisit: s?.firstVisit ?? Date.now(), lastVisit: Date.now(),
      signup: s?.signup,
    };
    localStorage.setItem(KEY, JSON.stringify(next));
    track("shisan_start");
  }, []);

  const persist = (patch: Partial<Store>) => {
    let cur: Store; try { cur = JSON.parse(localStorage.getItem(KEY) || "null") || ({} as Store); } catch { cur = {} as Store; }
    localStorage.setItem(KEY, JSON.stringify({ ...cur, ...patch }));
  };
  const showToast = (m: string) => { setToast(m); if (toastTimer.current) clearTimeout(toastTimer.current); toastTimer.current = setTimeout(() => setToast(""), 2400); };

  // 再訪のための保存（バックエンド不要・個人情報を取得しない）
  const copyUrl = () => {
    if (typeof window === "undefined") return;
    navigator.clipboard?.writeText(window.location.href);
    track("shisan_copy_url");
    showToast("URLをコピーしました。ブックマークや保存にどうぞ。");
  };
  const emailSelf = () => {
    if (typeof window === "undefined") return;
    const url = window.location.href;
    const subject = encodeURIComponent("つぎの手ナビ 資産づくり｜診断の続き");
    const body = encodeURIComponent(`このURLから、いつでも診断の続きに戻れます：\n${url}\n\n※入力内容はご利用の端末（ブラウザ）に保存されています。`);
    track("shisan_email_self");
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };
  const recommend = () => {
    if (typeof window === "undefined") return;
    const url = window.location.href;
    const subject = encodeURIComponent("お金の判断、これで整理できたよ");
    const body = encodeURIComponent(`繰り上げ・投資・借り換え・教育費を、自分の数字で整理できる無料ツールです：\n${url}`);
    track("shisan_share_intent");
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };
  const num = (k: string) => parseFloat(form[k]) || 0;
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));
  // 金額入力用：内部は数字のみ（カンマ無し）で保持し、表示時にカンマ区切りを付ける。
  // type="number" はカンマ表示できないため、金額欄は type="text" + inputMode="numeric" にする。
  const comma = (v?: string) => {
    const digits = (v ?? "").replace(/[^\d]/g, "");
    return digits === "" ? "" : Number(digits).toLocaleString("ja-JP");
  };
  const setNum = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value.replace(/[^\d]/g, "") }));

  /* 子の人数→年齢入力欄 */
  const onChildCount = (e: React.ChangeEvent<HTMLInputElement>) => {
    const c = Math.max(0, Math.min(6, parseInt(e.target.value) || 0));
    setChildCount(c);
    setChildAges((prev) => Array.from({ length: c }, (_, i) => prev[i] ?? ""));
  };

  const submit = () => {
    if (!num("age") || !num("income") || !num("assets")) { showToast("年齢・年収・金融資産を入力してください"); return; }
    const surplus = num("surplus");
    const i: Inputs = {
      age: num("age"), income: num("income"), assets: num("assets"),
      surplus, living: num("living"),
      hasMortgage, mBal: num("mBal"), mYears: num("mYears"), mRate: num("mRate"), mType: form.mType || "変動",
      childAges: childAges.map((a) => parseFloat(a) || 0),
      eduPlan: (form.eduPlan as EduPlan) || "shibun",
      target: num("target") || 2000, r: num("r") || 3,
    };
    setInputs(i); persist({ inputs: i }); track("shisan_input_complete");
    // A層判定：毎月の余力が極小＝困窮の可能性 → 別出口
    if (surplus <= 0) { track("shisan_a_layer_exit"); setScreen("exit"); window.scrollTo(0, 0); return; }
    track("shisan_dashboard_view"); track("shisan_result_view");
    setScreen("dash"); window.scrollTo(0, 0);
  };

  /* 該当バケツ */
  const buckets = useMemo<BucketId[]>(() => {
    if (!inputs) return [];
    const b: BucketId[] = ["liq"];
    if (inputs.childAges.length > 0) b.push("edu");
    if (inputs.hasMortgage && inputs.mBal > 0) { b.push("refi"); if (inputs.surplus > 0) b.push("prepay"); }
    if (inputs.surplus > 0) b.push("nisa");
    return b;
  }, [inputs]);

  const decidedCount = buckets.filter((b) => decisions[b]).length;
  const score = buckets.length ? Math.round((decidedCount / buckets.length) * 100) : 0;
  const allDone = buckets.length > 0 && decidedCount === buckets.length;

  /* シナリオ自動判定（A/B/C）
   * 評価順序が優先順位：①C（余力が薄い）を最初に弾く → ②A（未成年の子あり）→ ③B（既定）。
   * 0以下の余力は submit() で別画面(exit)へ除外済み。閾値3万は仮（実データで調整可）。
   * ローンは分類を変えず、ありの時だけ A の切迫度を表示で強調する（loanBurden）。 */
  const SURPLUS_THIN = 30000; // 円/月・余力が薄いライン（仮）
  const scenario = useMemo<"A" | "B" | "C" | null>(() => {
    if (!inputs) return null;
    if (inputs.surplus <= 0) return null; // 余力0以下は別出口＝打ち手を出さない（復元経路の保険）
    if (inputs.surplus < SURPLUS_THIN) return "C"; // ①最優先：余力薄ければ土台固め
    if (inputs.childAges.some((a) => a < 18)) return "A"; // ②未成年の子あり
    return "B"; // ③それ以外（子なし/全員独立）
  }, [inputs]);
  /* 初回ダッシュボード表示時、最初の未決カードを自動で開く */
  useEffect(() => {
    if (screen === "dash" && !autoOpened.current && buckets.length) {
      setOpenBucket(buckets.find((b) => !decisions[b]) ?? null);
      autoOpened.current = true;
    }
  }, [screen, buckets, decisions]);

  /* 試算結果（A'案：生む／配分／65歳見込みの3ブロック） */
  const result = useMemo(() => {
    if (!inputs) return null;
    const n = Math.max(0, RET_AGE - inputs.age);
    const r = inputs.r / 100;
    const i = inputs.mRate / 100;
    const S = inputs.surplus;                 // 毎月の余力
    const assetsYen = inputs.assets;          // 円入力（2026-06-23 単位を円に統一）
    const livingTarget = inputs.living * 6;   // 生活防衛資金の目安

    // ブロック1：毎月生まれたゆとり（借換で手取り純増。＋のみ）
    const refi = inputs.hasMortgage ? refinance(inputs.mBal, inputs.mRate, inputs.mYears) : null;
    const yutori = decisions.refi?.choice === "進める" && refi ? Math.round(refi.dMonthly) : 0;

    // ブロック2：毎月の余力の使い道（優先カスケードで自動推定・符号なし配置）
    const pool = S + yutori;
    let remaining = pool;
    let bei = 0;
    if (decisions.liq && decisions.liq.choice !== "今は見送る") {
      const gap = Math.max(0, livingTarget - assetsYen);
      bei = gap > 0 ? Math.min(remaining, Math.round(gap / 12)) : 0; // 約1年で確保／既に充足なら0
    }
    remaining -= bei;
    let edu = 0;
    if (decisions.edu) {
      const need = eduMonthly(inputs.childAges, inputs.eduPlan);
      if (decisions.edu.choice === "必要額を積む") edu = Math.min(remaining, need);
      else if (decisions.edu.choice === "一部を積む") edu = Math.min(remaining, Math.round(need / 2));
    }
    remaining -= edu;
    let kuriage = 0, toushi = 0;
    if (decisions.prepay) {
      const amt = remaining;
      if (decisions.prepay.choice === "繰上げ中心") kuriage = amt;
      else if (decisions.prepay.choice === "投資中心") toushi = amt;
      else if (decisions.prepay.choice === "両方に分ける") { kuriage = Math.round(amt / 2); toushi = amt - kuriage; }
    }
    remaining -= (kuriage + toushi);
    const mihai = Math.max(0, remaining); // 未配分（まだ自由に使えるお金）
    const nisaUsed = decisions.nisa?.choice === "枠を使う";

    // ブロック3：65歳見込み（配分反映・目安）
    // 投資→想定リターンr／繰上げ→ローン金利i（債務圧縮の利回り）／備え・教育・未配分→元本（運用しない）
    const grow = (m: number, rate: number) => m * 12 * annFactor(n, rate);
    const future =
      assetsYen * Math.pow(1 + r, n) +
      grow(toushi, r) +
      grow(kuriage, i) +
      (bei + edu + mihai) * 12 * n;
    const achieve = Math.min(999, Math.round((future / inputs.target) * 100));

    // 教育費（＋備え）で余力を使い切り、繰上げ/投資・未配分が0＝トレードオフが顕在化した状態
    const eduCrowdsOut = edu > 0 && kuriage === 0 && toushi === 0 && mihai === 0;

    return { n, yutori, pool, bei, edu, kuriage, toushi, mihai, nisaUsed, future, achieve, eduCrowdsOut };
  }, [inputs, decisions]);

  /* 打ち手カード群「あなたの次の一手」（シナリオ別・推奨順・数字は既存関数流用） */
  const actions = useMemo<ActionCard[]>(() => {
    if (!inputs || !scenario) return [];
    const n = Math.max(0, RET_AGE - inputs.age);
    const hasLoan = inputs.hasMortgage && inputs.mBal > 0;
    const invMan = man(inputs.surplus * 12 * annFactor(n, inputs.r / 100)); // 投資の65歳将来額
    const refi = hasLoan ? refinance(inputs.mBal, inputs.mRate, inputs.mYears) : null;
    const refiEffect: ReactNode = refi && refi.dMonthly > 0
      ? <>月々 <b>¥{yen(refi.dMonthly)}</b> 軽くなる</>
      : <>今の金利では下げ幅は小さめ</>;
    const list: ActionCard[] = [];

    if (scenario === "A") {
      const cur = eduMonthly(inputs.childAges, inputs.eduPlan);
      const save = Math.max(0, cur - eduMonthly(inputs.childAges, "kokukou"));
      list.push({
        id: "edu_review", bucket: "edu", title: "教育費の目標を見直す",
        effect: save > 0
          ? <>私立→国公立で、月 <b>約¥{yen(save)}</b> 軽くなる</>
          : <>必要な積立は 月 <b>約¥{yen(cur)}</b></>,
      });
      if (inputs.surplus > 0) list.push({
        id: "invest_more", bucket: "nisa", external: "invest", title: "積立を増やす",
        effect: <>65歳で <b>＋約{invMan}万</b>（想定{inputs.r}%）</>,
      });
      list.push({
        id: "income_up", external: "income", title: "収入を増やす",
        effect: <>支出だけでは届きにくいとき効く</>,
      });
    }

    if (scenario === "B") {
      if (inputs.surplus > 0) list.push({
        id: "invest_more", bucket: "nisa", external: "invest", title: "積立を増やす",
        effect: <>65歳で <b>＋約{invMan}万</b>（想定{inputs.r}%）</>,
      });
      if (hasLoan && inputs.surplus > 0) {
        const compMan = man(prepayCompression(inputs.mBal, inputs.mRate, inputs.mYears, inputs.surplus * 12));
        list.push({
          id: "prepay_vs_invest", bucket: "prepay", title: "繰上げ vs 投資",
          dual: {
            left: { label: "繰上げ", value: `利息 約${compMan}万圧縮`, note: "確実・無リスク" },
            right: { label: "投資", value: `65歳 ＋約${invMan}万`, note: `想定${inputs.r}%・不確実` },
          },
        });
      }
      if (hasLoan) list.push({ id: "refi", bucket: "refi", external: "refi", title: "借り換え", effect: refiEffect });
      if (!hasLoan && inputs.surplus > 0) {
        const annualMan = man(inputs.surplus * 12);
        const usedPct = Math.min(100, Math.round((inputs.surplus * 12 / 3600000) * 100));
        list.push({
          id: "nisa_fill", bucket: "nisa", external: "invest", title: "NISA枠を使い切る",
          effect: <>年 <b>¥{annualMan}万</b>（枠360万の約{usedPct}%）</>,
        });
      }
    }

    if (scenario === "C") {
      list.push({
        id: "expense_cut", external: "expense", title: "固定費を見直す",
        effect: <>通信や保険から、余力を生む</>,
      });
      if (hasLoan) list.push({ id: "refi", bucket: "refi", external: "refi", title: "借り換え", effect: refiEffect });
      list.push({
        id: "buffer", bucket: "liq", title: "もしもの備え",
        effect: <>目安 <b>¥{man(inputs.living * 6)}万</b>（生活費6か月）</>,
      });
    }

    return list;
  }, [inputs, scenario]);

  /* 打ち手ブロック表示時に一度だけ shisan_actions_view（GA・段階5） */
  useEffect(() => {
    if (screen === "dash" && actions.length > 0 && !actionsViewed.current) {
      track("shisan_actions_view", { scenario, count: actions.length });
      actionsViewed.current = true;
    }
  }, [screen, actions, scenario]);

  const setR = (v: number) => {
    if (!inputs) return;
    const ni = { ...inputs, r: v };
    setInputs(ni); persist({ inputs: ni });
    track("shisan_set_return", { r: v });
  };

  // 打ち手カード本体タップ → 対応する質問（バケツ）を開いてスクロール＋select計測（段階3/5）
  // rank＝推奨順位（先頭=0）。仮説D（推奨先頭のまま/下位から選び直し）の検証データ。
  const selectAction = (a: ActionCard, rank: number) => {
    if (!a.bucket) return; // 送客のみのカードは executeAction 側
    track("shisan_action_select", { action_id: a.id, rank });
    setOpenBucket(a.bucket);
    if (typeof document !== "undefined") {
      const el = document.getElementById(`bucket-${a.bucket}`);
      if (el) requestAnimationFrame(() => el.scrollIntoView({ behavior: "smooth", block: "start" }));
    }
  };

  // 打ち手カード → 実行接点（送客・段階4/5）。select とは別イベント。URL未設定でも計測は動く。
  const executeAction = (a: ActionCard, rank: number) => {
    if (!a.external) return;
    track("shisan_action_execute_click", { external: a.external, action_id: a.id, rank });
    const url = AFFILIATE_LINKS[a.external];
    if (url) window.open(url, "_blank", "noopener,noreferrer");
    else showToast("ご案内を準備中です。");
  };

  const decide = (b: BucketId, choice: string) => {
    const next = { ...decisions, [b]: { choice } };
    setDecisions(next); persist({ decisions: next }); setOpenBucket(null);
    setLastDecided(b); // 登録ブロックの表示位置（意思決定したバケツの直下・要件1）
    track("shisan_task_execute", { task_id: b, choice });
    const willAll = buckets.every((x) => next[x]);
    if (willAll) track("shisan_decision_complete", { buckets: buckets.length });
    showToast("意思決定を記録しました（結論の中身は評価しません）");
  };

  /* ===== 会員登録導線（第一陣・要件1）＋シェア（要件2） ===== */
  // 表示位置：最後に意思決定したバケツカードの直下。復元時（リロード後）は
  // 決定済みバケツのうち並び順で最後のものの直下（表示維持・常に1つだけ）。
  const signupAnchor: BucketId | null =
    lastDecided ?? [...buckets].reverse().find((b) => decisions[b]) ?? null;
  const showSignup =
    !!signupAnchor && !!scenario && !signupFlags.registered && !signupFlags.closed;

  const onSignupView = () => {
    if (!signupViewed.current) {
      track("shisan_signup_view", { scenario });
      signupViewed.current = true;
    }
  };
  const closeSignup = () => {
    const next = { ...signupFlags, closed: true };
    setSignupFlags(next); persist({ signup: next });
  };
  const onSignupRegistered = () => {
    const next = { ...signupFlags, registered: true };
    setSignupFlags(next); persist({ signup: next });
    setJustRegistered(true); // 直後は完了表示を見せる（リロード後は非表示）
    track("shisan_signup_submit", { scenario });
  };
  // Supabase に保存するスナップショット（メールアドレスは localStorage / GA に入れない）
  const signupSnapshot = () => {
    let s: Store | null = null;
    try { s = JSON.parse(localStorage.getItem(KEY) || "null"); } catch { s = null; }
    return { inputs, decisions, firstVisit: s?.firstVisit ?? null };
  };

  const shareToX = () => {
    if (!scenario) return;
    track("shisan_share_click", { scenario });
    const text = `老後資金の“次の一手”がわかる無料診断をやってみた。私のフェーズは【${SCENARIO_PHASE[scenario]}】でした。→`;
    const intent = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(SHARE_URL)}`;
    window.open(intent, "_blank", "noopener,noreferrer");
  };

  const editAgain = () => {
    if (inputs) {
      setForm({
        age: String(inputs.age), income: String(inputs.income), assets: String(inputs.assets),
        surplus: String(inputs.surplus), living: String(inputs.living),
        mBal: String(inputs.mBal), mYears: String(inputs.mYears), mRate: String(inputs.mRate),
        mType: inputs.mType, eduPlan: inputs.eduPlan, target: String(inputs.target), r: String(inputs.r),
      });
      setHasMortgage(inputs.hasMortgage); setChildCount(inputs.childAges.length);
      setChildAges(inputs.childAges.map(String));
    }
    setScreen("input"); window.scrollTo(0, 0);
  };

  /* ============ 画面0：入口LP（老後・ライフプランフック・断定しない） ============ */
  if (screen === "hook") {
    return (
      <main className="max-w-2xl mx-auto px-4 pt-12 pb-24 text-slate-800">
        <h1 className="text-[26px] font-extrabold leading-tight mb-3 sm:text-[30px]">
          あなたの老後資金、
          <br />
          このままで足りる？
        </h1>
        <p className="text-slate-600 text-[15px] leading-relaxed mb-2">
          人生で必要なお金を、あなたの数字で見える化。今の家計から、65 歳の見込みと「次の一手」まで。
        </p>
        <p className="text-slate-500 text-[13px] mb-8">
          2〜3 分・登録不要・売らない中立診断。まずは現在地を知るところから。
        </p>
        <button
          className={btn}
          onClick={() => {
            track("shisan_lp_cta_click");
            track("shisan_input_start");
            setScreen("input");
            window.scrollTo(0, 0);
          }}
        >
          無料で診断する →
        </button>
        <p className="text-[11px] text-slate-400 mt-4">
          一般的な情報とあなたの数字による試算のみを提供します。特定の商品の推奨や投資助言は行いません。すべて目安です。
        </p>
      </main>
    );
  }

  /* ============ 画面1：入力 ============ */
  if (screen === "input") {
    return (
      <main className="max-w-2xl mx-auto px-4 pt-6 pb-24 text-slate-800">
        <h1 className="text-[20px] font-extrabold leading-tight mb-1">つぎの手ナビ 資産づくり<span className="text-[12px] font-bold text-slate-400 ml-2">β</span></h1>
        <p className="text-slate-500 text-[13px] mb-4">あなたの数字を入れると、今月の“次の一手”が見えてきます（2〜3分）。</p>

        <div className={card}>
          <div className="flex gap-2.5">
            <div className="flex-1"><label className={label}>年齢<input type="number" className={inputCls} value={form.age ?? ""} onChange={set("age")} placeholder="42" /></label></div>
            <div className="flex-1"><label className={label}>額面年収 <span className={hint}>円</span><input type="text" inputMode="numeric" className={inputCls} value={comma(form.income)} onChange={setNum("income")} placeholder="7,000,000" /></label></div>
          </div>
          <label className={label}>金融資産（ざっくり） <span className={hint}>円・現預金＋投資</span><input type="text" inputMode="numeric" className={inputCls} value={comma(form.assets)} onChange={setNum("assets")} placeholder="10,000,000" /></label>
          <div className="flex gap-2.5">
            <div className="flex-1"><label className={label}>毎月の投資・貯蓄余力 <span className={hint}>円</span><input type="text" inputMode="numeric" className={inputCls} value={comma(form.surplus)} onChange={setNum("surplus")} placeholder="60,000" /></label></div>
            <div className="flex-1"><label className={label}>毎月の生活費 <span className={hint}>円</span><input type="text" inputMode="numeric" className={inputCls} value={comma(form.living)} onChange={setNum("living")} placeholder="250,000" /></label></div>
          </div>
        </div>

        <div className={card}>
          <div className="flex items-center gap-2">
            <input type="checkbox" className="w-[18px] h-[18px]" checked={hasMortgage} onChange={(e) => setHasMortgage(e.target.checked)} id="mort" />
            <label htmlFor="mort" className="text-[13px] font-semibold text-slate-700">住宅ローンあり</label>
          </div>
          {hasMortgage && (
            <>
              <div className="flex gap-2.5 mt-1">
                <div className="flex-[2]"><label className={label}>残高 <span className={hint}>円</span><input type="text" inputMode="numeric" className={inputCls} value={comma(form.mBal)} onChange={setNum("mBal")} placeholder="30,000,000" /></label></div>
                <div className="w-[72px] flex-shrink-0"><label className={label}>残年数<input type="number" className={inputCls} value={form.mYears ?? ""} onChange={set("mYears")} placeholder="28" /></label></div>
                <div className="w-[72px] flex-shrink-0"><label className={label}>金利 <span className={hint}>%</span><input type="number" step="0.01" className={inputCls} value={form.mRate ?? ""} onChange={set("mRate")} placeholder="1.0" /></label></div>
              </div>
              <div className="flex gap-2 mt-2">
                {["変動", "固定"].map((t) => (
                  <button key={t} type="button" onClick={() => setForm((f) => ({ ...f, mType: t }))}
                    className={`${chip} ${form.mType === t ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-slate-600 border-slate-300"}`}>{t}金利</button>
                ))}
              </div>
            </>
          )}
        </div>

        <div className={card}>
          <label className={label}>子の人数 <span className={hint}>0〜6</span><input type="number" min="0" max="6" className={inputCls} value={String(childCount)} onChange={onChildCount} /></label>
          {childCount > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {childAges.map((a, idx) => (
                <div key={idx} style={{ width: "30%" }}>
                  <label className="text-xs text-slate-500">子{idx + 1}の年齢
                    <input type="number" className={inputCls} value={a} onChange={(e) => setChildAges((p) => p.map((v, i) => (i === idx ? e.target.value : v)))} placeholder="8" />
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={card}>
          <label className={label}>65歳での目標額 <span className={hint}>円・変更可</span><input type="text" inputMode="numeric" className={inputCls} value={comma(form.target)} onChange={setNum("target")} placeholder="20,000,000" /></label>
        </div>

        <button className={btn} onClick={submit}>診断する →</button>
        <p className="text-[11px] text-slate-400 border-t border-dashed border-slate-200 pt-3 mt-4">
          すべて目安です。前提：インフレ未反映／借り換え試算の基準金利は{REFI_BASE}%（内部目安・手動更新）。特定の商品・サービスの推奨や投資助言は行いません。入力データはこの端末内（ブラウザ）にのみ保存され、サーバには送信されません。
        </p>
        {toast && <Toast msg={toast} />}
      </main>
    );
  }

  /* ============ 別出口：A層（余力が小さい） ============ */
  if (screen === "exit") {
    return (
      <main className="max-w-2xl mx-auto px-4 pt-10 pb-24 text-slate-800">
        <div className={card}>
          <h1 className="text-xl font-bold mb-2">まずは家計の土台を整えるのが安心かもしれません</h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            入力いただいた毎月の余力が小さいようです。無理な資産形成より、固定費の見直しや、
            <b>お住まいの自治体の生活相談窓口</b>など公的な支援の活用を先にご検討ください。
            （具体的な窓口名は状況により変わるため、ここでは一般的なご案内に留めています）
          </p>
          <p className="text-xs text-slate-400 mt-3">本ツールは住宅ローンの返済余力がある方向けの試算です。状況が変わったら、いつでも戻ってきてください。</p>
        </div>
        <button className={`${btnSm} bg-slate-100 text-slate-700`} onClick={editAgain}>入力に戻る</button>
      </main>
    );
  }

  /* ============ 画面2：ダッシュボード ============ */
  return (
    <main className="max-w-2xl mx-auto px-4 pt-6 pb-24 text-slate-800">
      <h1 className="text-[22px] font-extrabold leading-tight mb-3">診断結果</h1>

      {/* 診断結果コーナー（緑・A'案 3ブロック・全ブロック緑で統一） */}
      <div className="rounded-2xl shadow-sm p-5 mb-5 text-white bg-gradient-to-br from-emerald-600 to-emerald-800">
        <div className="flex items-center justify-end mb-1">
          <div className="text-[13px] opacity-90">答えた質問 <b><CountUp value={decidedCount} /> / {buckets.length}</b></div>
        </div>
        <div className="h-2 bg-white/25 rounded-full overflow-hidden mb-5"><div className="h-full bg-white transition-all duration-500" style={{ width: `${score}%` }} /></div>

        {/* ① 毎月生まれたゆとり */}
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="w-5 h-5 rounded-full bg-white/25 text-[11px] font-bold flex items-center justify-center">1</span>
            <span className="text-[14px] font-bold">毎月生まれたゆとり</span>
          </div>
          <div className="text-[28px] font-extrabold leading-tight">＋¥<CountUp value={result?.yutori ?? 0} /><span className="text-sm font-bold">/月</span></div>
          <div className="text-[11px] opacity-80">借り換えなどで手取りが増えた分です。</div>
        </div>

        {/* ② 毎月の余力の使い道（緑上のバー行で統一） */}
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-5 h-5 rounded-full bg-white/25 text-[11px] font-bold flex items-center justify-center">2</span>
            <span className="text-[14px] font-bold">毎月の余力 ¥{result ? yen(result.pool) : 0} の使い道</span>
          </div>
          {result && [
            { k: "備え", v: result.bei },
            { k: "教育費", v: result.edu },
            { k: "繰上げ", v: result.kuriage },
            { k: result.nisaUsed ? "投資（NISA枠）" : "投資", v: result.toushi },
            { k: "未配分（自由）", v: result.mihai },
          ].filter((s) => s.v > 0).map((s) => (
            <div key={s.k} className="flex items-center gap-2 mb-1.5">
              <span className="text-[12px] w-24 shrink-0 opacity-90">{s.k}</span>
              <div className="flex-1 h-2.5 bg-white/20 rounded-full overflow-hidden"><div className="h-full bg-white rounded-full" style={{ width: `${result.pool > 0 ? (s.v / result.pool) * 100 : 0}%` }} /></div>
              <span className="text-[12px] font-bold w-20 text-right">¥{yen(s.v)}</span>
            </div>
          ))}
          <div className="text-[11px] opacity-80 mt-1.5">配ったお金は減ったのではなく、目的が決まったお金です。</div>

          {result?.eduCrowdsOut && inputs && (
            <div className="mt-3 p-3 rounded-lg bg-white/15 text-[12px] leading-relaxed">
              <div className="font-bold mb-1">今の余力では、教育費と投資の“両取り”は難しい状態です</div>
              教育費の目標（¥{yen(eduMonthly(inputs.childAges, inputs.eduPlan))}/月）を満たすと、繰上げ・投資に回す分は残りません。投資が0なのは失敗ではなく「教育費を最優先に決めた」という意思決定です。
              <div className="opacity-85 mt-1.5">投資にも回したいなら（どれも正解ではありません）：①教育費の目標を見直す ②余力を増やす（借換・固定費）③今は教育費を優先と決める。</div>
            </div>
          )}
        </div>

        {/* ③ 65歳の見込み */}
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="w-5 h-5 rounded-full bg-white/25 text-[11px] font-bold flex items-center justify-center">3</span>
            <span className="text-[14px] font-bold">65歳の見込み（目安）</span>
          </div>
          <div className="flex justify-between items-end">
            <div className="text-[28px] font-extrabold leading-tight">約¥<CountUp value={result ? Math.round(result.future / 10000) : 0} />万</div>
            <div className="text-right"><span className="text-[12px] opacity-85">目標 ¥{inputs ? man(inputs.target) : 0}万</span><div className="text-[22px] font-extrabold leading-tight">{result?.achieve}%</div></div>
          </div>
          <div className="text-[11px] opacity-80 mt-1">想定リターン{inputs?.r}%の目安（備え・教育費は元本のまま反映）。</div>
        </div>
      </div>

      {/* あなたの次の一手（行動導線）＝面で囲って独立させ、肝を肝に見せる */}
      {actions.length > 0 && (
        <section className="mb-6 rounded-2xl bg-emerald-50 border border-emerald-100 p-4">
          <h2 className="text-[20px] font-extrabold text-emerald-900 leading-tight mb-0.5">あなたの次の一手</h2>
          <p className="text-[11px] text-slate-400 mb-3">いまのあなたに効く順に並べています。</p>
          {actions.map((a, i) => (
            <ActionCardView key={a.id} a={a} rank={i} primary={i === 0} onSelect={selectAction} onExecute={executeAction} />
          ))}
          <p className="text-[13px] mt-1">
            <span className="font-bold text-emerald-800">できることは、ちゃんとあります。</span>
            <span className="text-slate-500"> 正解はひとつじゃない。選ぶのはあなた。</span>
          </p>
          {/* シェア導線（第一陣・要件2）：X intent・文言に金額/年齢は入れない */}
          <button type="button" onClick={shareToX}
            className="mt-3 w-full py-2.5 rounded-xl border border-emerald-600 bg-white text-emerald-700 text-sm font-bold hover:bg-emerald-600 hover:text-white transition">
            この診断をシェアする
          </button>
        </section>
      )}

      {/* 資産づくりの質問（意思決定フロー）＝新コーナーの区切り（緑見出し＋上罫線） */}
      <h2 className="text-[16px] font-extrabold text-emerald-700 border-t border-slate-200 pt-5 mt-6 mb-1">資産づくりの質問（{buckets.length}つ）</h2>
      <p className="text-[13px] text-slate-500 mb-3">下の質問に答えると、診断結果が変わります。</p>
      {buckets.map((b, idx) => (
        <div key={b}>
          <BucketCard id={b} index={idx} inputs={inputs!} decision={decisions[b]} open={openBucket === b}
            onToggle={() => setOpenBucket(openBucket === b ? null : b)} onDecide={(c) => decide(b, c)} onSetR={setR} />
          {b === signupAnchor && (showSignup || justRegistered) && (
            <SignupBlock done={justRegistered} scenario={scenario!} snapshot={signupSnapshot}
              onView={onSignupView} onClose={closeSignup} onRegistered={onSignupRegistered} />
          )}
        </div>
      ))}

      {/* 保存して、また戻る（再訪導線・バックエンド不要） */}
      <div className={`${card} border-emerald-300 bg-emerald-50`}>
        <p className="font-bold mb-1">{allDone ? "🎉 5つすべて、自分で決めきりました。" : "途中まで診断できています。"}</p>
        <p className="text-sm text-slate-600 mb-3">
          入力はこの端末（ブラウザ）に保存されています。<b>URLを保存しておくと、いつでも続きから戻れます。</b>
          {!allDone && "残りの質問も、あとで診断できます。"}
        </p>
        <div className="flex flex-wrap gap-2">
          <button className={`${btnSm} bg-emerald-600 text-white hover:bg-emerald-700`} onClick={copyUrl}>URLをコピー</button>
          <button className={`${btnSm} bg-white border border-slate-300 text-slate-700`} onClick={emailSelf}>自分にメールで送る</button>
        </div>
        {allDone && (
          <button className="text-xs text-emerald-700 underline mt-3" onClick={recommend}>同じように迷っている人にもすすめる</button>
        )}
      </div>

      <button className={`${btnSm} bg-slate-100 text-slate-700`} onClick={editAgain}>入力を修正する</button>
      <p className="text-[11px] text-slate-400 border-t border-dashed border-slate-200 pt-3 mt-4">
        一般的な情報とあなたの数字による試算のみを提供します。繰り上げ返済と投資のどちらが有利かは状況により異なり、特定の金融商品・保険・サービスの推奨や投資助言は行いません。借り換え試算の基準金利は{REFI_BASE}%（内部目安）。すべて目安です。
      </p>
      {toast && <Toast msg={toast} />}
    </main>
  );
}

/* ===== バケツカード ===== */
function BucketCard({ id, index, inputs, decision, open, onToggle, onDecide, onSetR }: {
  id: BucketId; index: number; inputs: Inputs; decision?: Decision; open: boolean; onToggle: () => void; onDecide: (c: string) => void; onSetR: (v: number) => void;
}) {
  const done = !!decision;
  const n = Math.max(0, RET_AGE - inputs.age);
  const meta: Record<BucketId, { title: string; preview: string }> = {
    liq: { title: "もしもの備えは足りてる？", preview: "急な出費や収入減に備えるお金。生活費6ヶ月分で目安を計算します。" },
    edu: { title: "教育費、毎月いくら貯めれば間に合う？", preview: "大学入学までの期間から、必要な毎月の積立額を逆算します。" },
    refi: { title: "住宅ローンを借り換えたら、いくら変わる？", preview: "今の金利を基準と比べ、諸費用を何ヶ月で回収できるかを計算します。" },
    prepay: { title: "余ったお金、繰り上げ返済と投資どっち？", preview: "あなたのローン金利と想定リターンを並べて比べます。正解は決めつけません。" },
    nisa: { title: "NISAの非課税枠、どれくらい使える？", preview: "年間360万円の枠に対し、あなたの余力がどれくらいかを見ます。" },
  };

  return (
    <div id={`bucket-${id}`} className={`scroll-mt-20 border rounded-xl mb-2.5 transition ${done ? "bg-emerald-50 border-emerald-500" : "border-slate-200"}`}>
      <button className="w-full flex justify-between items-start gap-3 p-3.5 text-left" onClick={onToggle}>
        <div className="flex gap-3">
          <span className="flex-none w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center mt-0.5">{index + 1}</span>
          <div>
            <div className="font-bold text-[15px] leading-snug">{meta[id].title}</div>
            <div className="text-xs text-slate-500 mt-1 leading-relaxed">{meta[id].preview}</div>
            <div className="text-xs mt-1.5 font-semibold" style={{ color: done ? "#059669" : "#0d9488" }}>{done ? `✓ 決めた：${decision!.choice}` : (open ? "下で数字を見て決める" : "タップして数字を見る →")}</div>
          </div>
        </div>
        <span className="text-slate-400 text-xs flex-none mt-1">{open ? "閉じる" : "開く"}</span>
      </button>
      {open && (
        <div className="px-3.5 pb-4 border-t border-slate-100 pt-3">
          <BucketPanel id={id} inputs={inputs} n={n} onDecide={onDecide} onSetR={onSetR} />
        </div>
      )}
    </div>
  );
}

/* ===== バケツ別の数字パネル＋意思決定 ===== */
function BucketPanel({ id, inputs, n, onDecide, onSetR }: { id: BucketId; inputs: Inputs; n: number; onDecide: (c: string) => void; onSetR: (v: number) => void; }) {
  const box = "p-3 rounded-xl bg-slate-50 text-sm text-slate-700 leading-relaxed mb-3";
  const note = "text-[11px] text-slate-400 mb-3";
  const choices = "flex flex-wrap gap-2";
  const cbtn = `${btnSm} bg-white border border-emerald-600 text-emerald-700 hover:bg-emerald-600 hover:text-white`;
  const cbtnGray = `${btnSm} bg-white border border-slate-300 text-slate-600 hover:bg-slate-100`;

  if (id === "liq") {
    const target = inputs.living * 6;
    return (<>
      <div className={box}>生活防衛資金の目安＝生活費6ヶ月分＝<b>¥{yen(target)}</b>。<br />一般に「投資や繰上げより先に確保」と言われますが、決めるのはあなたです。</div>
      <div className={choices}>
        <button className={cbtn} onClick={() => onDecide("確保している/する")}>確保している / する</button>
        <button className={cbtnGray} onClick={() => onDecide("今は見送る")}>今は見送る</button>
      </div>
    </>);
  }

  if (id === "edu") {
    const planLabel: Record<EduPlan, string> = { kokukou: "国公立(400万)", shibun: "私立文系(550万)", shiri: "私立理系(700万)" };
    const monthly = eduMonthly(inputs.childAges, inputs.eduPlan);
    return (<>
      <div className={box}>
        想定する進路：<b>{planLabel[inputs.eduPlan]}</b>（子1人あたり・文科省データ等の目安）。<br />
        子{inputs.childAges.length}人ぶんを大学入学（18歳）までに用意するには、<b>約¥{yen(monthly)}/月</b>の積立が必要（目安）。<br />
        ＝必要額 ÷ 入学までの残月数。<b>いくら積むかを決めてください。</b>
      </div>
      <p className={note}>※「いくら必要か・いつまでか」だけを出します。どの商品で積むか（学資保険など）には踏み込みません。</p>
      <div className={choices}>
        <button className={cbtn} onClick={() => onDecide("必要額を積む")}>必要額（¥{yen(monthly)}/月）を積む</button>
        <button className={cbtn} onClick={() => onDecide("一部を積む")}>一部を積む</button>
        <button className={cbtnGray} onClick={() => onDecide("今は積まない")}>今は積まない</button>
      </div>
    </>);
  }

  if (id === "refi") {
    const refi = refinance(inputs.mBal, inputs.mRate, inputs.mYears);
    return (<>
      <div className={box}>
        <div className="text-[11px] text-slate-500 mb-1">この試算は基準金利 {REFI_BASE}% を前提にしています（内部目安）。</div>
        現在 <b>{inputs.mRate}%</b> → 基準 <b>{REFI_BASE}%</b> に借り換えた場合（残高¥{man(inputs.mBal)}万・残{inputs.mYears}年）：<br />
        {refi && refi.dMonthly > 0 ? (<>
          ・月々の返済：<b>¥{yen(refi.dMonthly)}/月 減</b><br />
          ・総支払利息：<b>約¥{man(refi.dInterest)}万 減</b><br />
          ・諸費用：約¥{man(refi.cost)}万 → <b>{isFinite(refi.months) ? refi.months : "—"}ヶ月で回収</b>
        </>) : "現在の金利は基準より低く、借り換えの余地は小さいようです。"}
      </div>
      <p className={note}>※「得/損」は判定しません。事実（いくら減り、諸費用を何ヶ月で回収するか）だけを出します。金利が下がっても必ず得とは限りません。</p>
      <div className={choices}>
        <button className={cbtn} onClick={() => onDecide("進める")}>借り換えを進める</button>
        <button className={cbtnGray} onClick={() => onDecide("しない")}>しない</button>
      </div>
    </>);
  }

  if (id === "prepay") {
    const i = inputs.mRate, r = inputs.r;
    const comp = prepayCompression(inputs.mBal, inputs.mRate, inputs.mYears, inputs.surplus * 12);
    const invFuture = inputs.surplus * 12 * annFactor(n, r / 100);
    return (<>
      <div className={box}>
        <div className="text-[11px] text-slate-500 mb-1">この比較は想定リターン <b>{r}%</b> を前提にしています（あなたが置いた値）。</div>
        数字の大小：ローン金利 <b>{i}%</b> ／ 想定リターン <b>{r}%</b>。<br />
        {i > r ? "数字上は繰上げ側が出発点。" : i < r ? "数字上は投資側が出発点。" : "ほぼ拮抗。"}
        <div className="mt-2 text-[13px]">
          ・余力（年¥{man(inputs.surplus * 12)}万）を<b>繰上げ</b>に回すと利息 <b>約¥{man(comp)}万</b> 圧縮（確定）。<br />
          ・同じ額を<b>投資</b>に回すと65歳で <b>約¥{man(invFuture)}万</b>（想定{r}%・不確実）。
        </div>
      </div>
      <p className={note}>※これは数字の大小であって正解ではありません。繰上げ＝確実・無リスク・流動性低下／投資＝期待値は高いが不確実。どちらを重視するかはあなた次第。方向は評価しません。</p>
      <div className="flex items-center gap-2 mb-3 text-sm flex-wrap">
        <span className="text-slate-500 text-xs">想定リターンは自分で置く：</span>
        {[1, 3, 5].map((v) => (
          <button key={v} type="button" onClick={() => onSetR(v)}
            className={`${chip} ${inputs.r === v ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-slate-600 border-slate-300"}`}>{v}%</button>
        ))}
        <span className="text-[11px] text-slate-400">押すと上の数字が変わります</span>
      </div>
      <div className={choices}>
        <button className={cbtn} onClick={() => onDecide("繰上げ中心")}>繰上げ中心で決めた</button>
        <button className={cbtn} onClick={() => onDecide("投資中心")}>投資中心で決めた</button>
        <button className={cbtn} onClick={() => onDecide("両方に分ける")}>両方に分ける</button>
      </div>
    </>);
  }

  // nisa
  const annualInvest = inputs.surplus * 12;
  const used = Math.min(100, Math.round((annualInvest / 3600000) * 100));
  return (<>
    <div className={box}>
      新NISAの年間非課税枠は <b>360万円</b>（つみたて投資枠＋成長投資枠）。<br />
      あなたの毎月の投資・貯蓄余力 ¥{yen(inputs.surplus)} を年換算すると ¥{man(annualInvest)}万（枠の約{used}%）。<br />
      枠を使うか、今は使わないかを決めてください。
    </div>
    <p className={note}>※一般的な制度の説明のみ。特定の商品名や金融機関は出しません。</p>
    <div className={choices}>
      <button className={cbtn} onClick={() => onDecide("枠を使う")}>枠を使う</button>
      <button className={cbtnGray} onClick={() => onDecide("今は使わない")}>今は使わない</button>
    </div>
  </>);
}

/* ===== 打ち手カード（行動名＋数字ひとつ） =====
 * 本体タップ：バケツありカード＝select（質問を開く）／送客のみカード＝execute（送客）。
 * バケツあり＋外部接点のカードは、本体=select・別リンク=execute の2導線（別イベントで区別）。 */
function ActionCardView({ a, rank, primary, onSelect, onExecute }: {
  a: ActionCard; rank: number; primary?: boolean;
  onSelect?: (a: ActionCard, rank: number) => void;
  onExecute?: (a: ActionCard, rank: number) => void;
}) {
  // 要件3（第一陣）：URL未設定（空文字）の送客導線は出さない。
  // 送客のみカードはタップ無効＋押せる見た目なしの情報カードとして静置。
  // AFFILIATE_LINKS にURLを入れるだけで、リンク表示・タップ・execute計測が自動復帰する。
  const hasUrl = !!a.external && !!AFFILIATE_LINKS[a.external];
  const bodyOpens = !!a.bucket && !!onSelect;                          // 本体＝質問を開く
  const bodyExecs = !a.bucket && !!a.external && !!onExecute && hasUrl; // 本体＝送客（バケツなし・URL設定時のみ）
  const bodyClickable = bodyOpens || bodyExecs;
  const showExecLink = !!a.bucket && !!a.external && !!onExecute && hasUrl; // 質問＋送客の2導線（URL設定時のみ）
  const onBody = () => { if (bodyOpens) onSelect!(a, rank); else if (bodyExecs) onExecute!(a, rank); };
  const body = (
    <>
      {primary && <div className="text-[10px] font-bold text-emerald-700 mb-1">まず、これ</div>}
      <div className="flex items-center justify-between gap-2">
        <div className="font-bold text-[15px] leading-snug">{a.title}</div>
        {bodyClickable && <span className="text-slate-300 text-lg leading-none">›</span>}
      </div>
      {a.dual ? (
        <div className="mt-2">
          {/* 2つの数字は対等表示（同サイズ・同色・どちらも強調しない＝中立） */}
          <div className="flex gap-2">
            {[a.dual.left, a.dual.right].map((d, i) => (
              <div key={i} className="flex-1 rounded-lg bg-slate-50 p-2.5 text-center">
                <div className="text-[11px] text-slate-500">{d.label}</div>
                <div className="text-[13px] font-bold text-slate-700 mt-0.5">{d.value}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{d.note}</div>
              </div>
            ))}
          </div>
          <div className="text-[11px] text-slate-500 mt-1.5">性質が違います。</div>
        </div>
      ) : (
        <div className="text-[13px] text-slate-600 leading-relaxed mt-0.5">{a.effect}</div>
      )}
    </>
  );
  const cls = `rounded-xl p-3.5 mb-2.5 ${primary ? "bg-emerald-100 border border-emerald-300 border-l-4 border-l-emerald-600" : "bg-white border border-slate-200"}`;
  return (
    <div className={cls}>
      {bodyClickable
        ? <button type="button" className="block w-full text-left" onClick={onBody}>{body}</button>
        : <div>{body}</div>}
      {showExecLink && (
        <button type="button" onClick={() => onExecute!(a, rank)}
          className="mt-2.5 text-[12px] font-semibold text-emerald-700 underline underline-offset-2">
          {EXEC_LABEL[a.external!]}
        </button>
      )}
    </div>
  );
}

/* ===== 会員登録ブロック（第一陣・要件1） =====
 * 初回の意思決定直後に、そのバケツカードの直下へインライン表示（モーダル禁止）。
 * メール1フィールドのみ。保存先は /api/shisan/signup（Supabase upsert＋完了メール）。
 * メールアドレスは GA・localStorage に入れない（PII禁止）。 */
function SignupBlock({ done, scenario, snapshot, onView, onClose, onRegistered }: {
  done: boolean;
  scenario: "A" | "B" | "C";
  snapshot: () => Record<string, unknown>;
  onView: () => void;
  onClose: () => void;
  onRegistered: () => void;
}) {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => { onView(); }, [onView]); // 発火の一意性は親側の useRef で担保

  const submit = async () => {
    const v = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) { setError("メールアドレスの形式をご確認ください。"); return; }
    setError(""); setSending(true);
    try {
      const res = await fetch("/api/shisan/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: v, scenario, store: snapshot() }),
      });
      const json: { ok?: boolean } = await res.json().catch(() => ({}));
      if (res.ok && json.ok) { onRegistered(); }
      else { setError("保存に失敗しました。時間をおいてお試しください。"); }
    } catch {
      setError("通信に失敗しました。時間をおいてお試しください。");
    } finally {
      setSending(false);
    }
  };

  if (done) {
    return (
      <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-4 mb-2.5 text-sm font-bold text-emerald-800">
        ✅ 保存しました。
      </div>
    );
  }
  return (
    <div className="relative rounded-xl border border-emerald-300 bg-emerald-50 p-4 mb-2.5">
      <button type="button" aria-label="閉じる" onClick={onClose}
        className="absolute top-2 right-3 text-slate-400 hover:text-slate-600 text-xl leading-none">×</button>
      <div className="font-bold text-[15px] text-emerald-900 pr-6">この結果と、決めた一手を保存する</div>
      <p className="text-[13px] text-slate-600 mt-1 leading-relaxed">
        保存しておくと、次に来たとき、あなたの一手がどれだけ効いたかを見届けられます。
      </p>
      <div className="flex gap-2 mt-2.5 flex-wrap">
        <input type="email" inputMode="email" autoComplete="email"
          className={`${inputCls} flex-1 min-w-[180px]`} placeholder="メールアドレス"
          value={email} onChange={(e) => setEmail(e.target.value)} disabled={sending} />
        <button type="button" onClick={submit} disabled={sending}
          className={`${btnSm} bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 whitespace-nowrap`}>
          {sending ? "保存中…" : "無料で保存する"}
        </button>
      </div>
      {error && <p className="text-[12px] text-red-600 mt-1.5">{error}</p>}
      <p className="text-[11px] text-slate-400 mt-2">
        登録は無料。いつでも削除できます。
        <a href="/privacy" target="_blank" rel="noopener noreferrer" className="underline ml-1">プライバシーポリシー</a>
      </p>
    </div>
  );
}

function Toast({ msg }: { msg: string }) {
  return (
    <div className="fixed left-1/2 bottom-6 -translate-x-1/2 bg-slate-800 text-white px-5 py-3 rounded-full text-sm font-bold z-50 shadow-lg">{msg}</div>
  );
}
