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

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
/* 計算エンジンは共有モジュール（Phase1 §6：クライアントとchat APIの両方から参照） */
import {
  RET_AGE, REFI_BASE, type EduPlan, SCENARIO_PHASE, BUCKET_LABEL,
  type Inputs, type BucketId, type Decision,
  yen, man, annFactor, prepayCompression, refinance, eduMonthly,
  judgeScenario, deriveBuckets, computeResult, surplusBand,
} from "@/lib/shisan/calc";
import { track } from "@/lib/shisan/track";
import { ExecuteReportPanel, type ExecReportProps, type ReportSaveResult } from "./ExecuteReportPanel";

/* ===== 定数 ===== */
// v2: 入力単位を円に統一（2026-06-23）。旧 v1 の万円キャッシュを誤読しないよう改番。
const KEY = "shisan_loan_mvp_v2";
/* AI主導フロー転換（追加要件E・2026-07-06）：
 * false＝質問アコーディオン・完了スコア・旧登録ブロックを非表示にし、AI大導線に一本化。
 * true に戻すと従来型（画面内で質問に答える）に復元できる（比較検証用）。 */
const SHOW_INLINE_QUESTIONS = false;

/* ===== 型 ===== */
interface Store {
  inputs: Inputs | null;
  decisions: Partial<Record<BucketId, Decision>>;
  firstVisit: number;
  lastVisit: number | null;
  signup?: SignupFlags; // 会員登録の状態（第一陣・開発依頼書_20260703）
  lastFuture?: number;  // 直近診断の65歳見込み（Wave 2・前回差分の鏡用）
  prevFuture?: number;  // 前回（1つ前）の65歳見込み（A・7/17：再訪でも前回差分を出す）
  deep?: DeepStore;     // 第2段の回答（F・7/17：再訪で深掘り分析を復元）
}
interface DeepStore { open?: boolean; touched?: string[]; assetMix?: string | null; purpose?: string | null; household?: string | null; }
interface SignupFlags { registered?: boolean; closed?: boolean; }

/* シェア導線（第一陣・要件2）。金額・年齢・個人情報はシェア文言に一切含めない。 */
const SHARE_URL = "https://www.tsuginotenavi.jp/shisan";

/* LINE友だち追加URL（ピボット 2026-07-15・再接触権）。運営保有の公式アカウント友だち追加URL。 */
const LINE_ADD_URL = "https://lin.ee/5zqngmK";

/* ===== 二段診断（Wave 2・2-1）：全タップ・全任意。第1段（既存入力）は不変。 ===== */
// label＝選択肢の表示（動詞形）／area＝領域の名詞名（「まだ手をつけていない領域」で使う。C・7/17）
const DEEP_TOUCHED_OPTIONS: { key: string; label: string; area: string }[] = [
  { key: "nisa", label: "NISA・つみたてNISA", area: "NISA" },
  { key: "refi", label: "住宅ローンの借換を検討したことがある", area: "住宅ローンの借り換え" },
  { key: "buffer", label: "生活防衛資金は確保済み", area: "生活防衛資金" },
  { key: "insurance", label: "保険を見直した", area: "保険の見直し" },
  { key: "ideco", label: "iDeCo", area: "iDeCo" },
  { key: "none", label: "どれもまだ", area: "" },
];
const DEEP_ASSET_OPTIONS: { key: string; label: string }[] = [
  { key: "cash", label: "ほぼ現金" },
  { key: "half", label: "半々くらい" },
  { key: "invested", label: "ほぼ運用" },
];
const DEEP_PURPOSE_OPTIONS: { key: string; label: string }[] = [
  { key: "retire_living", label: "老後の生活費" },
  { key: "early_retire", label: "早期リタイア" },
  { key: "family_edu", label: "教育・家族" },
  { key: "enjoy", label: "使う楽しみ" },
  { key: "vague_anxiety", label: "漠然と不安" },
];
const DEEP_HOUSEHOLD_OPTIONS: { key: string; label: string }[] = [
  { key: "single", label: "単身" },
  { key: "couple", label: "夫婦" },
  { key: "kids", label: "子育て中" },
];
// インフレ目減り試算の定数（目安・画面に明記）。エンジンには手を入れず、この定数で単純派生。
const INFLATION_RATE = 0.02;
// 新NISAの年間非課税枠（万円・表示用の目安）。
const NISA_ANNUAL_MAN = 360;

/* 入力の鏡（全面改善 2026-07-14）用の定数。追加入力なし・既存計算の派生のみ。 */
// 借り換えの市場水準（表示用の内部目安・手動更新可。実際の借り換え試算は calc.ts の REFI_BASE を使用）。
const MARKET_RATE_BAND = "変動0.3〜0.5%台";
// 感度の一行「毎月あと¥X 増やすと」の刻み。
const SENSITIVITY_STEP_YEN = 10000;

/* ===== 計測は lib/shisan/track.ts に共有化（Phase1）。冒頭でimport ===== */

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
  const [screen, setScreen] = useState<"hook" | "input" | "dash">("input");
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
  /* 統計・分析用の一次データ保存（2026-07-15・裏側のみ・UI/GA/ファネル不変）：
   * 入力開始時刻（所要時間）・流入元（referrer/utm/debug）・訪問種別（新規/再訪/再診断）を控える。 */
  const formStartAt = useRef(Date.now());
  const traffic = useRef<{ referrer: string; utmSource: string; utmMedium: string; utmCampaign: string; debug: boolean }>(
    { referrer: "", utmSource: "", utmMedium: "", utmCampaign: "", debug: false });
  const visitKind = useRef<"new" | "return" | "reenter">("new");
  /* 二段診断（Wave 2・2-1）：第2段の展開・回答・保存。全タップ・全任意。 */
  const [deepOpen, setDeepOpen] = useState(false);
  const [deepTouched, setDeepTouched] = useState<string[]>([]);
  const [deepAssetMix, setDeepAssetMix] = useState<string | null>(null);
  const [deepPurpose, setDeepPurpose] = useState<string | null>(null);
  const [deepHousehold, setDeepHousehold] = useState<string | null>(null);
  const deepStartAt = useRef(0);
  const deepSubmitted = useRef(false);
  /* 前回差分の鏡（Wave 2・2-2／A・7/17）：前回見込み（円）。再訪でも表示できるよう store から復元する。 */
  const [prevFuture, setPrevFuture] = useState<number | null>(null);
  /* 生活費0のインライン警告（D・7/17）：ネイティブconfirmを廃し、非ブロッキングに。 */
  const [livingWarn, setLivingWarn] = useState(false);
  /* 会員登録導線（第一陣・要件1） */
  const signupViewed = useRef(false);
  const [signupFlags, setSignupFlags] = useState<SignupFlags>({});
  const [lastDecided, setLastDecided] = useState<BucketId | null>(null);
  const [justRegistered, setJustRegistered] = useState(false);
  /* ログイン状態＋実行申告（Phase1 §7-1。ログイン済み会員のみ表示） */
  const [loggedIn, setLoggedIn] = useState(false);
  /* 会員の再診断フロー（修正指示書_20260708・修正1）：
   * マイページから ?reenter=1 で来た会員は、入力画面に直行（プリフィル）→確定でマイページへ戻る。 */
  const [returnToMypage, setReturnToMypage] = useState(false);
  const router = useRouter();
  const [reports, setReports] = useState<Record<string, { status: string; monthly_amount: number | null }>>({});
  useEffect(() => {
    // ピボット（2026-07-15）：会員モデル廃止。マイページへの自動送りは撤去（マイページは /shisan へリダイレクト）。
    // 既存の実行申告データがあれば拾うのみ（表示は SHOW_INLINE_QUESTIONS=false のため出ない・害なし）。
    fetch("/api/shisan/me").then((r) => r.json()).then((me) => {
      if (!me?.authenticated) return;
      setLoggedIn(true);
      fetch("/api/shisan/report").then((r) => r.json()).then((j) => { if (j?.ok) setReports(j.reports ?? {}); }).catch(() => {});
    }).catch(() => {});
  }, []);
  /* 再診断とサーバーデータの同期（追加要件C・訴求の根幹）。
   * ログイン済みなら、診断確定時とダッシュボード表示時に store をサーバーへ同期し、
   * AIが常に最新の数字で話せるようにする（未ログインは次回ログイン中の表示時に追いつく）。 */
  const syncServerStore = (inputsForSync?: Inputs | null, opts?: { force?: boolean }): Promise<unknown> | undefined => {
    if (!loggedIn && !opts?.force) return; // 未ログインは対象外（次回ログイン中の表示時に追いつく）。再診断復帰は force で確実に同期
    const i = inputsForSync ?? inputs;
    if (!i) return;
    let s: Store | null = null;
    try { s = JSON.parse(localStorage.getItem(KEY) || "null"); } catch { s = null; }
    return fetch("/api/shisan/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        scenario: judgeScenario(i),
        store: { inputs: i, decisions: s?.decisions ?? decisions, firstVisit: s?.firstVisit ?? null },
      }),
    }).catch(() => { /* 未ログイン(401)・失敗は無音（次の機会に同期） */ });
  };
  useEffect(() => {
    // ログイン確認後、表示中の診断データをサーバーへ追いつかせる
    if (loggedIn && inputs) syncServerStore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loggedIn]);

  const submitReport = async (b: BucketId, status: string, amount: number | null): Promise<ReportSaveResult> => {
    try {
      const res = await fetch("/api/shisan/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actionId: b, status, monthlyAmount: amount }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok || !j.ok) return { ok: false };
      setReports((p) => ({ ...p, [b]: { status, monthly_amount: amount } }));
      track("shisan_execute_report", { action_id: b, status, recalc: !!j.recalc });
      return { ok: true, recalc: j.recalc, beforeMan: j.beforeMan, afterMan: j.afterMan };
    } catch { return { ok: false }; }
  };

  /* 復元＋再訪判定 */
  useEffect(() => {
    let s: Store | null = null;
    try { s = JSON.parse(localStorage.getItem(KEY) || "null"); } catch { s = null; }
    // 会員の再診断（?reenter=1）：診断結果ページを経由せず、入力画面に直行（プリフィル）→確定でマイページへ（修正1）
    const reenter = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("reenter") === "1";
    // 分析用メタを控える（裏側のみ・表示やGAは不変）：流入元・デバッグ判定・訪問種別。
    if (typeof window !== "undefined") {
      const p = new URLSearchParams(window.location.search);
      traffic.current = {
        referrer: document.referrer || "",
        utmSource: p.get("utm_source") || "", utmMedium: p.get("utm_medium") || "", utmCampaign: p.get("utm_campaign") || "",
        debug: p.get("ga_debug") === "1" || p.get("debug") === "1",
      };
      visitKind.current = reenter && s?.inputs ? "reenter" : s?.inputs ? "return" : "new";
      formStartAt.current = Date.now();
    }
    if (s?.inputs && reenter) {
      setInputs(s.inputs); setDecisions(s.decisions || {}); setSignupFlags(s.signup ?? {});
      setForm({
        age: String(s.inputs.age), income: String(s.inputs.income), assets: String(s.inputs.assets),
        surplus: String(s.inputs.surplus), living: String(s.inputs.living),
        mBal: String(s.inputs.mBal), mYears: String(s.inputs.mYears), mRate: String(s.inputs.mRate),
        mType: s.inputs.mType, eduPlan: s.inputs.eduPlan, target: String(s.inputs.target), r: String(s.inputs.r),
      });
      setHasMortgage(s.inputs.hasMortgage); setChildCount(s.inputs.childAges.length);
      setChildAges(s.inputs.childAges.map(String));
      setReturnToMypage(true); setScreen("input");
      track("shisan_reenter");
    } else if (s?.inputs) {
      setInputs(s.inputs); setDecisions(s.decisions || {}); setSignupFlags(s.signup ?? {}); setScreen("dash");
      track("shisan_dashboard_view"); track("shisan_result_view");
      // A（7/17）：再訪でも前回差分を出す。／F（7/17）：第2段の回答と深掘り分析を復元。
      if (typeof s.prevFuture === "number") setPrevFuture(s.prevFuture);
      if (s.deep) {
        setDeepTouched(s.deep.touched ?? []);
        setDeepAssetMix(s.deep.assetMix ?? null);
        setDeepPurpose(s.deep.purpose ?? null);
        setDeepHousehold(s.deep.household ?? null);
        const hasAns = (s.deep.touched?.length ?? 0) > 0 || !!s.deep.assetMix || !!s.deep.purpose || !!s.deep.household;
        if (s.deep.open || hasAns) { setDeepOpen(true); deepSubmitted.current = true; }
      }
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
      // A/F（7/17）：前回差分・直近見込み・第2段の回答を保持（マウント時に消さない）。
      lastFuture: s?.lastFuture, prevFuture: s?.prevFuture, deep: s?.deep,
    };
    localStorage.setItem(KEY, JSON.stringify(next));
    track("shisan_start");
  }, []);

  const persist = (patch: Partial<Store>) => {
    let cur: Store; try { cur = JSON.parse(localStorage.getItem(KEY) || "null") || ({} as Store); } catch { cur = {} as Store; }
    localStorage.setItem(KEY, JSON.stringify({ ...cur, ...patch }));
  };

  /* 統計・分析用の一次データ保存（2026-07-15）：診断完了時に非会員も含め入力をサーバーへ best-effort 送信。
   * fire-and-forget＝応答は使わない。UI・GA・ファネル・入力項目には一切影響しない。保存失敗は無音。 */
  const saveDiagnosis = (i: Inputs) => {
    try {
      const durationSec = Math.round((Date.now() - formStartAt.current) / 1000);
      const t = traffic.current;
      fetch("/api/shisan/diagnosis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        keepalive: true, // 再診断→マイページ遷移時も送信を取りこぼさない
        body: JSON.stringify({
          inputs: i,
          durationSec,
          referrer: t.referrer, utmSource: t.utmSource, utmMedium: t.utmMedium, utmCampaign: t.utmCampaign,
          debug: t.debug,
          isReenter: visitKind.current === "reenter",
          isNew: visitKind.current === "new",
        }),
      }).catch(() => { /* best-effort：失敗しても診断表示に影響しない */ });
    } catch { /* fetch自体の例外も無音 */ }
  };
  const showToast = (m: string) => { setToast(m); if (toastTimer.current) clearTimeout(toastTimer.current); toastTimer.current = setTimeout(() => setToast(""), 2400); };

  // 再訪導線の「URLコピー／自分にメール」コーナーは第一陣で削除
  // （保存導線を会員登録ブロックに一本化・2026-07-03 ユーザー決定）
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
  // 1-5：金額フィールドの単位ミス（例：年収「60」）防止。入力値の万円換算を即時表示（内部単位は円のまま・保存/計算に影響なし）。
  const manHint = (v?: string): string => {
    const d = (v ?? "").replace(/[^\d]/g, "");
    if (!d) return "";
    const n = Number(d);
    return n >= 10000 ? `＝${Math.round(n / 10000).toLocaleString("ja-JP")}万円` : "";
  };

  /* 子の人数→年齢入力欄 */
  const onChildCount = (e: React.ChangeEvent<HTMLInputElement>) => {
    const c = Math.max(0, Math.min(6, parseInt(e.target.value) || 0));
    setChildCount(c);
    setChildAges((prev) => Array.from({ length: c }, (_, i) => prev[i] ?? ""));
  };

  const submit = async () => {
    if (!num("age") || !num("income") || !num("assets")) { showToast("年齢・年収・金融資産を入力してください"); return; }
    // D（7/17）：生活費0のインライン警告（非ブロッキング）。1回目は警告表示のみで止め、もう一度押すと続行。
    if (num("living") <= 0 && !livingWarn) { setLivingWarn(true); return; }
    const surplus = num("surplus");
    const i: Inputs = {
      age: num("age"), income: num("income"), assets: num("assets"),
      surplus, living: num("living"),
      hasMortgage, mBal: num("mBal"), mYears: num("mYears"), mRate: num("mRate"), mType: form.mType || "変動",
      childAges: childAges.map((a) => parseFloat(a) || 0),
      eduPlan: (form.eduPlan as EduPlan) || "shibun",
      target: num("target") || 2000, r: num("r") || 3,
    };
    setInputs(i); persist({ inputs: i });
    // A（7/17）：前回差分。旧 lastFuture を「前回」として控え（store にも保存＝再訪でも表示）、今回の見込みを lastFuture へ更新。
    try {
      const prevStore = JSON.parse(localStorage.getItem(KEY) || "null") as Store | null;
      const prev = typeof prevStore?.lastFuture === "number" ? prevStore.lastFuture : null;
      const newFuture = computeResult(i, {})?.future;
      setPrevFuture(prev);
      persist({ prevFuture: prev ?? undefined, lastFuture: typeof newFuture === "number" ? Math.round(newFuture) : undefined });
    } catch { /* 前回差分は best-effort */ }
    // GA計測：非会員の家計属性を「帯」で計測（生の金額＝PIIは送らない・区分のみ）。
    // scenario/bucketsは i から決定論的に導出（stateの反映を待たない）。
    track("shisan_input_complete", {
      surplus_band: surplusBand(surplus),
      buckets_count: deriveBuckets(i).length,
      scenario: judgeScenario(i) ?? "",
    });
    // 統計・分析用の一次データ保存（2026-07-15）：非会員も含め診断入力をサーバーへ best-effort 保存。
    // fire-and-forget・keepalive で、この後の遷移（再診断→マイページ）でも送信を取りこぼさない。応答・UI・GAには不干渉。
    saveDiagnosis(i);
    // 会員の再診断復帰（修正1）：サーバーstoreを確実に同期してからマイページへ戻る（結果ページを経由しない）
    if (returnToMypage) {
      try { await syncServerStore(i, { force: true }); } catch { /* 失敗時もマイページで最新化を試みる */ }
      track("shisan_reenter_complete");
      router.push("/shisan/mypage");
      return;
    }
    syncServerStore(i); // 再診断の確定をサーバーへ同期（追加要件C）
    // ピボット 1-6（2026-07-15）：余力ゼロ以下の別出口（exit）を廃止。余力ゼロでも診断結果（65歳見込み＋鏡）を表示する。
    track("shisan_dashboard_view"); track("shisan_result_view");
    setScreen("dash"); window.scrollTo(0, 0);
  };

  /* 該当バケツ（ロジックは lib/shisan/calc.ts に共有化） */
  const buckets = useMemo<BucketId[]>(() => deriveBuckets(inputs), [inputs]);

  const decidedCount = buckets.filter((b) => decisions[b]).length;
  const score = buckets.length ? Math.round((decidedCount / buckets.length) * 100) : 0;
  const allDone = buckets.length > 0 && decidedCount === buckets.length; // 全質問完了（Phase1 §2-2）

  /* シナリオ自動判定（A/B/C）。ロジックは lib/shisan/calc.ts の judgeScenario に共有化。 */
  const scenario = useMemo<"A" | "B" | "C" | null>(() => judgeScenario(inputs), [inputs]);
  /* 初回ダッシュボード表示時、最初の未決カードを自動で開く */
  useEffect(() => {
    if (screen === "dash" && !autoOpened.current && buckets.length) {
      setOpenBucket(buckets.find((b) => !decisions[b]) ?? null);
      autoOpened.current = true;
    }
  }, [screen, buckets, decisions]);

  /* 試算結果（A'案3ブロック。ロジックは lib/shisan/calc.ts の computeResult に共有化） */
  const result = useMemo(() => computeResult(inputs, decisions), [inputs, decisions]);

  /* 65歳見込みの「0%リターン時」の目安（変更6・前提の揺らぎを一行で示すため。既存エンジンを r=0 で再計算） */
  const result0 = useMemo(
    () => computeResult(inputs ? { ...inputs, r: 0 } : null, decisions),
    [inputs, decisions],
  );

  /* 先延ばしコストの鏡（鏡④・2026-07-15）：開始が1年遅れた場合の65歳見込み。
   * 既存エンジンをそのまま流用し、age を +1（＝積立期間 n を1年短縮）して再計算する。
   * 配分は age に依存しないため現状と同一で、n だけが1年短くなる（＝上部の見込みとロジック同一・ズレなし）。 */
  const resultDelay1 = useMemo(
    () => computeResult(inputs ? { ...inputs, age: inputs.age + 1 } : null, decisions),
    [inputs, decisions],
  );
  /* 先延ばしコストの表示値（万円・整数）。差額は表示中の2値の差（画面上の引き算と一致させる）。
   * 表示条件：積立期間 n>1 かつ 差額>0（ゼロ差は非表示＝既存の¥0非表示方針と同じ）。 */
  const delayCost = useMemo(() => {
    if (!result || !resultDelay1 || result.n <= 1) return null;
    const nowMan = Math.round(result.future / 10000);
    const delayMan = Math.round(resultDelay1.future / 10000);
    const diffMan = nowMan - delayMan;
    return diffMan > 0 ? { nowMan, delayMan, diffMan } : null;
  }, [result, resultDelay1]);

  /* ===== 二段診断（Wave 2）：ハンドラ＋解錠される鏡の派生値 ===== */
  const openDeep = () => {
    if (deepOpen) return;
    setDeepOpen(true);
    deepStartAt.current = Date.now();
    persistDeep({ open: true });
    track("shisan_deep_open", { scenario: scenario ?? "" });
  };
  // F（7/17）：第2段の回答を localStorage に保存（再訪で深掘り分析ごと復元）。
  const persistDeep = (patch: Partial<DeepStore>) => {
    let cur: Store; try { cur = JSON.parse(localStorage.getItem(KEY) || "null") || ({} as Store); } catch { cur = {} as Store; }
    localStorage.setItem(KEY, JSON.stringify({ ...cur, deep: { ...(cur.deep ?? {}), ...patch } }));
  };
  // 第2段の回答を best-effort でサーバーへ（最新の diagnoses 行を更新）。deep_submit は最初の1回だけ発火。
  const saveDeep = (override: Partial<{ touched: string[]; assetMix: string | null; purpose: string | null; household: string | null }> = {}) => {
    if (!deepSubmitted.current) { track("shisan_deep_submit", { scenario: scenario ?? "" }); deepSubmitted.current = true; }
    const payload = {
      touched: override.touched ?? deepTouched,
      assetMix: override.assetMix ?? deepAssetMix,
      purpose: override.purpose ?? deepPurpose,
      household: override.household ?? deepHousehold,
      durationSec: deepStartAt.current ? Math.round((Date.now() - deepStartAt.current) / 1000) : null,
    };
    try {
      fetch("/api/shisan/diagnosis/deep", {
        method: "POST", headers: { "Content-Type": "application/json" }, keepalive: true,
        body: JSON.stringify(payload),
      }).catch(() => { /* best-effort */ });
    } catch { /* 無音 */ }
  };
  const toggleTouched = (key: string) => {
    const prev = deepTouched;
    let next: string[];
    if (key === "none") next = prev.includes("none") ? [] : ["none"];
    else { const base = prev.filter((k) => k !== "none"); next = base.includes(key) ? base.filter((k) => k !== key) : [...base, key]; }
    setDeepTouched(next); saveDeep({ touched: next }); persistDeep({ touched: next });
  };
  const chooseAsset = (k: string) => { setDeepAssetMix(k); saveDeep({ assetMix: k }); persistDeep({ assetMix: k }); };
  const choosePurpose = (k: string) => { setDeepPurpose(k); saveDeep({ purpose: k }); persistDeep({ purpose: k }); };
  const chooseHousehold = (k: string) => { setDeepHousehold(k); saveDeep({ household: k }); persistDeep({ household: k }); };

  /* 解錠される新しい鏡（2-2）：すべて既存エンジン流用＋単純派生。AIに計算させない。 */
  const deepMirror = useMemo(() => {
    if (!inputs || !result) return null;
    const cashRatio = deepAssetMix === "cash" ? 1 : deepAssetMix === "half" ? 0.5 : 0;
    const inflationErosionYen = Math.round(inputs.assets * cashRatio * INFLATION_RATE);
    const nisaTouched = deepTouched.includes("nisa");
    const untouched = deepTouched.length > 0
      ? DEEP_TOUCHED_OPTIONS.filter((o) => o.key !== "none" && !deepTouched.includes(o.key))
      : [];
    return { cashRatio, inflationErosionYen, nisaTouched, untouched };
  }, [inputs, result, deepAssetMix, deepTouched]);

  /* 感度の鏡（7/18）：第2段「何のために」で老後/漠然と不安 のとき、余力を +1万/+3万 にした場合の65歳見込みを見せる。
   * 3値はすべて computeResult（calc.ts）由来（フロントで金額計算はしない）。外部基準（平均・必要額）は持ち込まない。
   * 余力ゼロ以下や差が出ないときは、現状ゼロでも成立する片側表現に切り替える。 */
  const sensitivity = useMemo(() => {
    if (!inputs || !result || result.n <= 0) return null;
    const base = Math.max(inputs.surplus, 0); // 余力<=0でも「作れば動く」を示すため 0 を起点に加算
    const futureAt = (extra: number) => computeResult({ ...inputs, surplus: base + extra }, decisions)?.future ?? 0;
    const nowMan = Math.round(result.future / 10000);
    const man1 = Math.round(futureAt(10000) / 10000);
    const man3 = Math.round(futureAt(30000) / 10000);
    const oneSided = inputs.surplus <= 0 || nowMan <= 0 || man3 - nowMan < 1;
    return { nowMan, man1, man3, oneSided, surplusMan: Math.round(inputs.surplus / 10000) };
  }, [inputs, result, decisions]);

  /* 入力の鏡（変更2・全面改善 2026-07-14）：追加入力なし・既存の計算式の派生のみ。
   *  a. 住宅ローン金利の市場比較（借り換え余地＝既存 refinance を流用）
   *  b. 生活防衛資金（手元資産÷月間生活費。目安6ヶ月）
   *  c. 感度の一行（毎月+¥10,000を投資に回したときの65歳増分＝既存の複利 annFactor） */
  const mirror = useMemo(() => {
    if (!inputs) return null;
    const n = Math.max(0, RET_AGE - inputs.age);
    const refi = inputs.hasMortgage && inputs.mBal > 0
      ? refinance(inputs.mBal, inputs.mRate, inputs.mYears) : null;
    const refiRoomYen = refi ? Math.round(refi.dMonthly) : 0;
    // B（7/17）：借換カード統合用。手数料込みの正味メリット（総利息差 − 概算手数料）も持たせる。
    const refiCostYen = refi ? Math.round(refi.cost) : 0;
    const refiNetYen = refi ? Math.round(refi.dInterest - refi.cost) : 0;
    const monthsCovered = inputs.living > 0 ? inputs.assets / inputs.living : null;
    const sensitivityYen = SENSITIVITY_STEP_YEN * 12 * annFactor(n, inputs.r / 100);
    return { hasLoan: !!refi, refiRoomYen, refiCostYen, refiNetYen, monthsCovered, sensitivityYen };
  }, [inputs]);

  const setR = (v: number) => {
    if (!inputs) return;
    const ni = { ...inputs, r: v };
    setInputs(ni); persist({ inputs: ni });
    syncServerStore(ni); // 想定リターン変更もサーバーへ同期（追加要件C）
    track("shisan_set_return", { r: v });
  };

  const decide = (b: BucketId, choice: string) => {
    const next = { ...decisions, [b]: { choice } };
    setDecisions(next); persist({ decisions: next }); setOpenBucket(null);
    syncServerStore(); // 決めた一手もサーバーへ同期（AIのコンテキスト最新化・追加要件C）
    setLastDecided(b); // 登録ブロックの表示位置（意思決定したバケツの直下・要件1）
    track("shisan_task_execute", { task_id: b, choice });
    const willAll = buckets.every((x) => next[x]);
    if (willAll) track("shisan_decision_complete", { buckets: buckets.length });
    showToast("記録しました");
  };

  /* ===== 会員登録導線（第一陣・要件1）＋シェア（要件2） ===== */
  // 表示位置：質問リストの一番下に固定（2026-07-03 ユーザー決定。リストを分断しない）。
  // 表示開始は初回の意思決定後（decide済みバケツが1つ以上）・常に1つだけ。
  const hasDecision = lastDecided !== null || buckets.some((b) => decisions[b]);
  const showSignup =
    hasDecision && !!scenario && !signupFlags.registered && !signupFlags.closed;

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
  // 確認メール用サマリー（追加依頼_20260703）。既存の表示値をそのまま流用（新規計算なし）。
  // 年収・資産の生値は含めない（結果値のみ）。
  const signupSummary = () => {
    if (!scenario || !result || !inputs) return null;
    return {
      phase: SCENARIO_PHASE[scenario],
      poolYen: yen(result.pool),           // 画面②「毎月の余力 ¥X の使い道」と同じ値
      future65Man: man(result.future),     // 画面③「約¥X万」と同じ値
      r: inputs.r,
      decisions: buckets.filter((b) => decisions[b])
        .map((b) => ({ label: BUCKET_LABEL[b], choice: decisions[b]!.choice })),
    };
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
            <div className="flex-1"><label className={label}>額面年収 <span className={hint}>円</span><input type="text" inputMode="numeric" className={inputCls} value={comma(form.income)} onChange={setNum("income")} placeholder="7,000,000" />{manHint(form.income) && <span className="block text-[11px] font-semibold text-emerald-700 mt-0.5">{manHint(form.income)}</span>}</label></div>
          </div>
          <label className={label}>金融資産（ざっくり） <span className={hint}>円・現預金＋投資</span><input type="text" inputMode="numeric" className={inputCls} value={comma(form.assets)} onChange={setNum("assets")} placeholder="10,000,000" />{manHint(form.assets) && <span className="block text-[11px] font-semibold text-emerald-700 mt-0.5">{manHint(form.assets)}</span>}</label>
          <div className="flex gap-2.5">
            <div className="flex-1"><label className={label}>毎月の投資・貯蓄余力 <span className={hint}>円</span><input type="text" inputMode="numeric" className={inputCls} value={comma(form.surplus)} onChange={setNum("surplus")} placeholder="60,000" />{manHint(form.surplus) && <span className="block text-[11px] font-semibold text-emerald-700 mt-0.5">{manHint(form.surplus)}</span>}</label></div>
            <div className="flex-1"><label className={label}>毎月の生活費 <span className={hint}>円</span><input type="text" inputMode="numeric" className={inputCls} value={comma(form.living)} onChange={(e) => { setNum("living")(e); if (livingWarn) setLivingWarn(false); }} placeholder="250,000" />{manHint(form.living) && <span className="block text-[11px] font-semibold text-emerald-700 mt-0.5">{manHint(form.living)}</span>}</label></div>
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
                <div className="flex-[2]"><label className={label}>残高 <span className={hint}>円</span><input type="text" inputMode="numeric" className={inputCls} value={comma(form.mBal)} onChange={setNum("mBal")} placeholder="30,000,000" />{manHint(form.mBal) && <span className="block text-[11px] font-semibold text-emerald-700 mt-0.5">{manHint(form.mBal)}</span>}</label></div>
                <div className="w-[72px] flex-shrink-0"><label className={label}>残年数<input type="text" inputMode="numeric" className={inputCls} value={form.mYears ?? ""} onChange={set("mYears")} placeholder="28" /></label></div>
                <div className="w-[72px] flex-shrink-0"><label className={label}>金利 <span className={hint}>%</span><input type="text" inputMode="decimal" className={inputCls} value={form.mRate ?? ""} onChange={set("mRate")} placeholder="1.0" /></label></div>
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
          <label className={label}>65歳での目標額 <span className={hint}>円・変更可</span><input type="text" inputMode="numeric" className={inputCls} value={comma(form.target)} onChange={setNum("target")} placeholder="20,000,000" />{manHint(form.target) && <span className="block text-[11px] font-semibold text-emerald-700 mt-0.5">{manHint(form.target)}</span>}</label>
        </div>

        {/* D（7/17）：生活費0のインライン警告（非ブロッキング）。もう一度「診断する」で続行。 */}
        {livingWarn && (
          <div className="mb-2 p-3 rounded-lg bg-amber-50 border border-amber-200 text-[12px] text-amber-800 leading-relaxed">
            毎月の生活費が未入力（0円）のようです。このままだと生活防衛資金の分析は出せません。金額を入れると精度が上がります。もう一度「診断する」を押すと、このまま診断します。
          </div>
        )}
        <button className={btn} onClick={submit}>診断する →</button>
        <p className="text-[11px] text-slate-400 border-t border-dashed border-slate-200 pt-3 mt-4">
          すべて目安です。前提：インフレ未反映／借り換え試算の基準金利は{REFI_BASE}%（内部目安・手動更新）。特定の商品・サービスの推奨や投資助言は行いません。入力データはこの端末内（ブラウザ）に保存されます。
        </p>
        {toast && <Toast msg={toast} />}
      </main>
    );
  }

  /* ============ 画面2：ダッシュボード ============ */
  return (
    <main className="max-w-2xl mx-auto px-4 pt-6 pb-24 text-slate-800">
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-[22px] font-extrabold leading-tight">診断結果</h1>
        {/* ピボット（2026-07-15）：会員モデル廃止に伴い、ヘッダーのマイページ導線を撤去。 */}
      </div>

      {/* ===== 診断結果コーナー（全面改善 2026-07-14）：結論＝65歳見込みを最上部に（変更1） ===== */}
      <div className="rounded-2xl shadow-sm p-5 mb-4 text-white bg-gradient-to-br from-emerald-700 to-emerald-900">
        {/* 完了スコアは質問前提のUIのためAI主導フローでは非表示（追加要件E-1） */}
        {SHOW_INLINE_QUESTIONS && (<>
          <div className="flex items-center justify-end mb-1">
            <div className="text-[13px] opacity-90">答えた質問 <b><CountUp value={decidedCount} /> / {buckets.length}</b></div>
          </div>
          <div className="h-2 bg-white/25 rounded-full overflow-hidden mb-5"><div className="h-full bg-white transition-all duration-500" style={{ width: `${score}%` }} /></div>
        </>)}

        {/* 結論：65歳の見込み（目安）＋目標比％（変更1-1）
            修正1（2026-07-15）：金額は必ず1行。clamp()で幅に応じ縮小＋whitespace-nowrap、右ブロックは shrink-0。 */}
        <div className="text-[13px] font-bold opacity-90 mb-1">65歳の見込み（目安）</div>
        <div className="flex justify-between items-end gap-2">
          <div className="font-extrabold leading-none whitespace-nowrap" style={{ fontSize: "clamp(24px, 7.5vw, 34px)" }}>約¥<CountUp value={result ? Math.round(result.future / 10000) : 0} />万</div>
          <div className="text-right shrink-0">
            <div className="font-extrabold leading-none whitespace-nowrap" style={{ fontSize: "clamp(20px, 6vw, 26px)" }}>{result?.achieve}%</div>
            <span className="text-[11px] opacity-85 whitespace-nowrap">目標 ¥{inputs ? man(inputs.target) : 0}万</span>
          </div>
        </div>
        {/* 変更6：前提と揺らぎの一行（想定リターンと0%時の目安） */}
        <div className="text-[11px] opacity-80 mt-2 leading-relaxed">
          想定リターン{inputs?.r}%の場合の目安（備え・教育費は元本のまま反映）。{result0 && <>0%なら約¥{man(result0.future)}万。</>}
        </div>
        {/* 変更5：目標を上回る見込みの人への出口 */}
        {result && result.achieve > 100 && (
          <div className="mt-3 p-3 rounded-lg bg-white/15 text-[12px] leading-relaxed">
            目標を上回る見込みです。その余裕の使い道（教育費の上積み・早期リタイア・使う楽しみ）も考えてみる余地があります。
          </div>
        )}

        {/* 入力の鏡（修正2・2026-07-15：緑カード内テキストへ統合。カードinカードにしない／ラベル廃止）。
            見出しは本文より一段大きく・太字、本文中の数字は太字。緑背景で読めるコントラスト。 */}
        {mirror && inputs && (
          <div className="mt-4">
            {/* 前回との差（A・7/17：深掘りを開かなくても主カードに表示。再診断・再訪の両方で出る） */}
            {result && prevFuture != null && Math.round(prevFuture / 10000) !== Math.round(result.future / 10000) && (
              <div className="pt-3.5 border-t border-white/20">
                <div className="text-[15px] font-extrabold mb-0.5">前回との差</div>
                <p className="text-[13px] leading-relaxed opacity-95">
                  前回：約¥{man(prevFuture)}万 → 今回：<b className="font-extrabold">約¥{man(result.future)}万</b>（{result.future >= prevFuture ? "＋" : "−"}約¥{man(Math.abs(result.future - prevFuture))}万）。
                </p>
              </div>
            )}
            {/* 1-6（2026-07-15）：余力ゼロ以下でも結果を見せる。追い返さず中立の一文を鏡群の先頭に置く。 */}
            {inputs.surplus <= 0 && (
              <div className="pt-3.5 border-t border-white/20">
                <div className="text-[15px] font-extrabold mb-0.5">毎月の余力がない状態です</div>
                <p className="text-[13px] leading-relaxed opacity-95">
                  いまの入力では、毎月の投資・貯蓄に回せる金額がありません。固定費の見直しや、下の「住宅ローンの借り換え」の余地が、最初の一歩になります。
                </p>
              </div>
            )}
            {/* 住宅ローンの借り換え（B・7/17：金利／手取り／損益分岐の3枚を1項目に統合。
                月々の余地＋手数料込みの正味メリットを1文で。重複を解消。 */}
            {mirror.hasLoan && (
              <div className="pt-3.5 border-t border-white/20">
                <div className="text-[15px] font-extrabold mb-0.5">住宅ローンの借り換え</div>
                {mirror.refiRoomYen > 0 ? (
                  <p className="text-[13px] leading-relaxed opacity-95">
                    あなたの金利<b className="font-extrabold">{inputs.mRate}%</b>は、現在の借り換え水準（{MARKET_RATE_BAND}）より高めです。借り換えで<b className="font-extrabold">月々約¥{yen(mirror.refiRoomYen)}</b>軽くでき、残<b className="font-extrabold">{inputs.mYears}年</b>で概算手数料（約¥{man(mirror.refiCostYen)}万）を引いても
                    {mirror.refiNetYen > 0
                      ? <> <b className="font-extrabold">約¥{man(mirror.refiNetYen)}万のメリット</b>が見込めます。</>
                      : <> <b className="font-extrabold">逆ザヤの可能性</b>があります。</>}
                  </p>
                ) : (
                  <p className="text-[13px] leading-relaxed opacity-95">
                    あなたの金利<b className="font-extrabold">{inputs.mRate}%</b>は、現在の借り換え水準（{MARKET_RATE_BAND}）と同水準かそれより低めです。今の金利では借り換えの余地は小さめです。
                  </p>
                )}
                <div className="text-[10px] opacity-75 mt-1">※水準・手数料は概算の内部目安。基準金利は{REFI_BASE}%前提。</div>
              </div>
            )}

            {/* ② 生活防衛資金の目安（living>0のとき） */}
            {mirror.monthsCovered != null && (
              <div className="pt-3.5 border-t border-white/20">
                <div className="text-[15px] font-extrabold mb-0.5">生活防衛資金の目安</div>
                <p className="text-[13px] leading-relaxed opacity-95">
                  手元の資産は生活費の<b className="font-extrabold">約{Math.round(mirror.monthsCovered)}ヶ月分</b>。目安の6ヶ月分に対して
                  {mirror.monthsCovered >= 6
                    ? <> <b className="font-extrabold">約{Math.round(mirror.monthsCovered - 6)}ヶ月分（約{man(Math.round(mirror.monthsCovered - 6) * inputs.living)}万円）</b>の余裕があります。</>
                    : <> <b className="font-extrabold">約{Math.round(6 - mirror.monthsCovered)}ヶ月分（約{man(Math.round(6 - mirror.monthsCovered) * inputs.living)}万円）</b>足りません。</>}
                </p>
              </div>
            )}

            {/* ③ あと少し増やすと（1-6：余力ゼロでは意味をなさないため surplus>0 のみ表示） */}
            {inputs.surplus > 0 && (
              <div className="pt-3.5 border-t border-white/20">
                <div className="text-[15px] font-extrabold mb-0.5">あと少し増やすと</div>
                <p className="text-[13px] leading-relaxed opacity-95">
                  毎月あと<b className="font-extrabold">¥{yen(SENSITIVITY_STEP_YEN)}</b>を投資に回すと、65歳見込みは<b className="font-extrabold">＋約{man(mirror.sensitivityYen)}万円</b>（想定{inputs.r}%）。
                </p>
              </div>
            )}

            {/* ④ 先延ばしコストの鏡（2026-07-15）：開始が1年遅れた場合の差額。中立維持（推奨・急かしなし・事実の差分のみ）。
                表示条件：差額>0 かつ 積立期間 n>1 のときのみ（ゼロ差は非表示＝既存の¥0非表示方針と同じ）。
                現在の見込み＝result.future（上部と同一値）／1年遅延＝resultDelay1.future（age+1でn-1）。
                1-6：余力ゼロでは意味をなさないため surplus>0 のみ表示。 */}
            {inputs.surplus > 0 && delayCost && (
              <div className="pt-3.5 border-t border-white/20">
                <div className="text-[15px] font-extrabold mb-0.5">始める時期でこれだけ変わります</div>
                <p className="text-[13px] leading-relaxed opacity-95">
                  いまの配分を<b className="font-extrabold">今月から</b>始めた場合、65歳見込みは<b className="font-extrabold">約¥{yen(delayCost.nowMan)}万</b>。
                </p>
                <p className="text-[13px] leading-relaxed opacity-95">
                  <b className="font-extrabold">1年後に</b>始めた場合は<b className="font-extrabold">約¥{yen(delayCost.delayMan)}万</b>。
                </p>
                <p className="text-[13px] leading-relaxed mt-1.5">
                  <span className="bg-yellow-300/25 font-extrabold rounded px-1 py-0.5 box-decoration-clone">開始が1年遅れると、約¥{yen(delayCost.diffMan)}万の差になります</span>（想定{inputs.r}%）。
                </p>
              </div>
            )}
          </div>
        )}

        {/* LINE友だち追加（ピボット 2026-07-15）：会員化に代わる再接触権。緑カード内・鏡群の直後（スクロール一等地・最下部には置かない）。
            誇大回避＝個別パーソナライズは約束せず「再計算のきっかけをお知らせ」に留める。GA：shisan_line_click。 */}
        <div className="mt-4 pt-4 border-t border-white/20">
          <div className="text-[15px] font-extrabold mb-1">この診断、覚えておきます</div>
          <p className="text-[13px] leading-relaxed opacity-95 mb-3">
            金利や制度が変わったら、あなたの条件で再計算のきっかけをLINEでお知らせします。配信は月1〜2回。
          </p>
          <a href={LINE_ADD_URL} target="_blank" rel="noopener noreferrer"
            onClick={() => track("shisan_line_click", { scenario: scenario ?? "" })}
            style={{ backgroundColor: "#06C755" }}
            className="block w-full py-3 rounded-xl text-white text-center text-[15px] font-bold hover:opacity-90 transition">
            LINEで受け取る
          </a>
        </div>

        {/* シェア導線（結果カード内下部）。X intent・文言に金額/年齢/個人情報は入れない。 */}
        {scenario && (
          <button type="button" onClick={shareToX}
            className="mt-3 w-full py-2.5 rounded-xl bg-white/15 text-white text-sm font-bold hover:bg-white/25 transition">
            この診断をシェアする
          </button>
        )}
      </div>

      {/* ===== 二段診断（Wave 2・2-1）：第1段の結果の後に「あと30秒で分析を深める」。全タップ・全任意・第1段は不変。 ===== */}
      {!deepOpen && inputs && (
        <button type="button" onClick={openDeep}
          className="w-full mb-4 py-3 rounded-xl border border-emerald-600 bg-white text-emerald-700 text-sm font-bold hover:bg-emerald-50 transition">
          あと30秒で、分析を深める →
        </button>
      )}
      {deepOpen && inputs && (
        <section className="mb-4 space-y-3">
          {/* 第2段の4問（全タップ・全任意） */}
          <div className="rounded-2xl bg-white border border-slate-200 p-4 space-y-4">
            <p className="text-[12px] text-slate-400">30秒で分析を深めます（すべて任意・タップだけ）。</p>
            <div>
              <div className="text-[13px] font-bold text-slate-700 mb-1.5">すでに手をつけているもの（複数可）</div>
              <div className="flex flex-wrap gap-2">
                {DEEP_TOUCHED_OPTIONS.map((o) => (
                  <button key={o.key} type="button" onClick={() => toggleTouched(o.key)}
                    className={`px-3 py-1.5 rounded-full text-[13px] border transition ${deepTouched.includes(o.key) ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-slate-600 border-slate-300"}`}>{o.label}</button>
                ))}
              </div>
            </div>
            <div>
              <div className="text-[13px] font-bold text-slate-700 mb-1.5">資産の内訳は？</div>
              <div className="flex flex-wrap gap-2">
                {DEEP_ASSET_OPTIONS.map((o) => (
                  <button key={o.key} type="button" onClick={() => chooseAsset(o.key)}
                    className={`px-3 py-1.5 rounded-full text-[13px] border transition ${deepAssetMix === o.key ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-slate-600 border-slate-300"}`}>{o.label}</button>
                ))}
              </div>
            </div>
            <div>
              <div className="text-[13px] font-bold text-slate-700 mb-1.5">何のために？</div>
              <div className="flex flex-wrap gap-2">
                {DEEP_PURPOSE_OPTIONS.map((o) => (
                  <button key={o.key} type="button" onClick={() => choosePurpose(o.key)}
                    className={`px-3 py-1.5 rounded-full text-[13px] border transition ${deepPurpose === o.key ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-slate-600 border-slate-300"}`}>{o.label}</button>
                ))}
              </div>
            </div>
            <div>
              <div className="text-[13px] font-bold text-slate-700 mb-1.5">世帯構成は？</div>
              <div className="flex flex-wrap gap-2">
                {DEEP_HOUSEHOLD_OPTIONS.map((o) => (
                  <button key={o.key} type="button" onClick={() => chooseHousehold(o.key)}
                    className={`px-3 py-1.5 rounded-full text-[13px] border transition ${deepHousehold === o.key ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-slate-600 border-slate-300"}`}>{o.label}</button>
                ))}
              </div>
            </div>
          </div>

          {/* 解錠される新しい鏡（2-2）：既存エンジン流用＋単純派生・中立維持。回答に応じて表示。 */}
          {deepMirror && result && (
            <div className="rounded-2xl shadow-sm p-5 text-white bg-gradient-to-br from-emerald-700 to-emerald-900">
              <div className="text-[13px] font-bold opacity-90">深掘り分析（目安）</div>

              {/* 感度の鏡（7/18）：第2段「何のために」＝老後の生活費／漠然と不安 のときだけ表示。
                  そのユーザー自身の数字が余力の増減でどう動くかを見せる（外部基準なし）。金額は computeResult 由来。 */}
              {sensitivity && (deepPurpose === "retire_living" || deepPurpose === "vague_anxiety") && (
                <div className="mt-3 pt-3.5 border-t border-white/20">
                  <div className="text-[15px] font-extrabold mb-0.5">老後に向けて、今できること</div>
                  {sensitivity.oneSided ? (
                    <p className="text-[13px] leading-relaxed opacity-95">
                      毎月の余力を<b className="font-extrabold">+1万円</b>つくれると、65歳の見込みが<b className="font-extrabold">約¥{yen(sensitivity.man1)}万</b>になります。
                    </p>
                  ) : (
                    <>
                      <p className="text-[13px] leading-relaxed opacity-95">
                        あなたの65歳時点の見込みは<b className="font-extrabold">約¥{yen(sensitivity.nowMan)}万</b>です。もし毎月の余力を<b className="font-extrabold">+1万円</b>増やせると、見込みは<b className="font-extrabold">約¥{yen(sensitivity.man1)}万</b>に。<b className="font-extrabold">+3万円</b>なら<b className="font-extrabold">約¥{yen(sensitivity.man3)}万</b>まで届きます。
                      </p>
                      <div className="text-[10px] opacity-75 mt-1">※いまの余力（月{sensitivity.surplusMan}万円）を前提に、追加で積み立てた場合の目安です。</div>
                    </>
                  )}
                </div>
              )}

              {/* 現金比率×インフレ（②） */}
              {deepMirror.cashRatio > 0 && (
                <div className="mt-3 pt-3.5 border-t border-white/20">
                  <div className="text-[15px] font-extrabold mb-0.5">現金とインフレ</div>
                  <p className="text-[13px] leading-relaxed opacity-95">
                    資産<b className="font-extrabold">{man(inputs.assets)}万円</b>のうち{deepMirror.cashRatio === 1 ? "ほぼ現金" : "半分ほどが現金"}なら、インフレ2%で実質<b className="font-extrabold">年約¥{man(deepMirror.inflationErosionYen)}万</b>の目減り（購買力ベースの目安）。
                  </p>
                </div>
              )}

              {/* NISA枠（①） */}
              <div className="mt-3 pt-3.5 border-t border-white/20">
                <div className="text-[15px] font-extrabold mb-0.5">NISAの非課税枠</div>
                <p className="text-[13px] leading-relaxed opacity-95">
                  {deepMirror.nisaTouched
                    ? "新NISAの非課税枠を、使い切れているかが次の論点です。"
                    : <>新NISAの年間非課税枠<b className="font-extrabold">{NISA_ANNUAL_MAN}万円</b>が、まだ使われていません。</>}
                </p>
              </div>

              {/* 未対策領域（①）：C（7/17）＝選択肢の動詞形ラベルではなく領域の名詞名（area）で並べる */}
              {deepMirror.untouched.length > 0 && (
                <div className="mt-3 pt-3.5 border-t border-white/20">
                  <div className="text-[15px] font-extrabold mb-0.5">まだ手をつけていない領域</div>
                  <p className="text-[13px] leading-relaxed opacity-95">{deepMirror.untouched.map((o) => o.area).join("・")}。</p>
                </div>
              )}

              {/* 世帯構成の観点（④・文言調整のみ・エンジン改修なし） */}
              {deepHousehold && (
                <div className="mt-3 pt-3.5 border-t border-white/20">
                  <div className="text-[15px] font-extrabold mb-0.5">世帯構成の観点</div>
                  <p className="text-[13px] leading-relaxed opacity-95">
                    {deepHousehold === "single" && "単身世帯では、生活防衛資金はご自身の生活費が基準です。まずは手元の備えの確認から。"}
                    {deepHousehold === "couple" && "ご夫婦では、二人分の生活費と将来の使い道をあわせて見ると目安が立てやすくなります。"}
                    {deepHousehold === "kids" && "子育て中は、教育費と老後準備の両立が論点です。どちらも「目安」で並べて見ると判断しやすくなります。"}
                  </p>
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {/* ===== 従来型（画面内で質問に答える）＝比較検証用に温存（追加要件E-1） ===== */}
      {SHOW_INLINE_QUESTIONS && (<>
        <h2 className="text-[16px] font-extrabold text-emerald-700 border-t border-slate-200 pt-5 mt-6 mb-1">資産づくりの質問（{buckets.length}つ）</h2>
        <p className="text-[13px] text-slate-500 mb-3">下の質問に答えると、診断結果が変わります。</p>
        {buckets.map((b, idx) => (
          <BucketCard key={b} id={b} index={idx} inputs={inputs!} decision={decisions[b]} open={openBucket === b}
            onToggle={() => setOpenBucket(openBucket === b ? null : b)} onDecide={(c) => decide(b, c)} onSetR={setR}
            execReport={loggedIn && decisions[b] ? { current: reports[b] ?? null, onSubmit: (s, a) => submitReport(b, s, a) } : undefined} />
        ))}
        {allDone && (
          <section className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 my-4">
            <h2 className="text-[17px] font-extrabold text-emerald-900 mb-1">おつかれさまでした。あなたの次の一手が決まりました。</h2>
            <ul className="text-[13px] text-slate-700 mb-1">
              {buckets.filter((b) => decisions[b]).map((b) => (
                <li key={b}>・{BUCKET_LABEL[b]}：{decisions[b]!.choice}</li>
              ))}
            </ul>
            <MemberCta registered={!!signupFlags.registered} justRegistered={justRegistered} showSignup={showSignup}
              scenario={scenario} snapshot={signupSnapshot} summary={signupSummary}
              onView={onSignupView} onClose={closeSignup} onRegistered={onSignupRegistered} />
          </section>
        )}
        {!allDone && (
          <MemberCta registered={!!signupFlags.registered} justRegistered={justRegistered} showSignup={showSignup}
            scenario={scenario} snapshot={signupSnapshot} summary={signupSummary}
            onView={onSignupView} onClose={closeSignup} onRegistered={onSignupRegistered} />
        )}
      </>)}

      <button className={`${btnSm} bg-slate-100 text-slate-700`} onClick={editAgain}>入力を修正する</button>
      <p className="text-[11px] text-slate-400 border-t border-dashed border-slate-200 pt-3 mt-4">
        一般的な情報とあなたの数字による試算のみを提供します。繰り上げ返済と投資のどちらが有利かは状況により異なり、特定の金融商品・保険・サービスの推奨や投資助言は行いません。借り換え試算の基準金利は{REFI_BASE}%（内部目安）。すべて目安です。
      </p>
      {toast && <Toast msg={toast} />}
    </main>
  );
}

/* ===== バケツカード ===== */
function BucketCard({ id, index, inputs, decision, open, onToggle, onDecide, onSetR, execReport }: {
  id: BucketId; index: number; inputs: Inputs; decision?: Decision; open: boolean; onToggle: () => void; onDecide: (c: string) => void; onSetR: (v: number) => void;
  execReport?: ExecReportProps;
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
      {/* 実行申告（Phase1 §7-1）：意思決定済み＋ログイン済みの会員のみ */}
      {done && execReport && (
        <div className="px-3.5 pb-3.5">
          <ExecuteReportPanel {...execReport} />
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

/* ===== 会員CTA（Phase1 §2-2/2-3）＝登録状態に応じて出し分け =====
 * 未登録：登録ブロック（SignupBlock）／登録直後：完了表示／登録済み：AIに相談ボタン */
function MemberCta({ registered, justRegistered, showSignup, scenario, snapshot, summary, onView, onClose, onRegistered }: {
  registered: boolean;
  justRegistered: boolean;
  showSignup: boolean;
  scenario: "A" | "B" | "C" | null;
  snapshot: () => Record<string, unknown>;
  summary: () => Record<string, unknown> | null;
  onView: () => void;
  onClose: () => void;
  onRegistered: () => void;
}) {
  if (justRegistered || (showSignup && scenario)) {
    return (
      <SignupBlock done={justRegistered} scenario={scenario ?? "B"} snapshot={snapshot} summary={summary}
        onView={onView} onClose={onClose} onRegistered={onRegistered} />
    );
  }
  if (registered) {
    return (
      <Link href="/shisan/mypage"
        className="block w-full my-4 py-3.5 rounded-2xl text-center text-white text-base font-bold shadow-sm bg-gradient-to-br from-emerald-700 to-emerald-900 hover:opacity-95 transition"
        onClick={() => track("shisan_chat_open_click")}>
        マイページで見返す →
        <span className="block text-[11px] font-normal text-white/80 mt-0.5">あなたの診断結果と決めたことが残っています</span>
      </Link>
    );
  }
  return null;
}

/* ===== 会員登録ブロック（第一陣・要件1） =====
 * 初回の意思決定直後に、そのバケツカードの直下へインライン表示（モーダル禁止）。
 * メール1フィールドのみ。保存先は /api/shisan/signup（Supabase upsert＋完了メール）。
 * メールアドレスは GA・localStorage に入れない（PII禁止）。 */
function SignupBlock({ done, scenario, snapshot, summary, onView, onClose, onRegistered }: {
  done: boolean;
  scenario: "A" | "B" | "C";
  snapshot: () => Record<string, unknown>;
  summary: () => Record<string, unknown> | null;
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
        body: JSON.stringify({ email: v, scenario, store: snapshot(), summary: summary() }),
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

  /* 濃緑パネル（診断結果カードと同トーン）＝白・薄緑の質問カードと明確に区別する独立コーナー */
  const panel = "rounded-2xl shadow-sm text-white bg-gradient-to-br from-emerald-700 to-emerald-900 p-4 my-4";
  if (done) {
    return (
      <div className={`${panel} text-sm`}>
        <span className="font-bold">✅ 登録しました。</span>
        <span className="block mt-1 text-white/85 text-[13px]">お送りしたメールの「AIに相談を始める」リンクから、相談を始められます。</span>
      </div>
    );
  }
  return (
    <div className={`relative ${panel}`}>
      <button type="button" aria-label="閉じる" onClick={onClose}
        className="absolute top-2 right-3 text-white/60 hover:text-white text-xl leading-none">×</button>
      <div className="font-bold text-[16px] pr-6">迷ったら、いつでも相談できます</div>
      <p className="text-[13px] text-white/85 mt-1 leading-relaxed">
        あなたの診断結果を知っているAIに、無料で相談できます。売り込みは一切ありません。
      </p>
      <div className="flex gap-2 mt-3 flex-wrap">
        <input type="email" inputMode="email" autoComplete="email"
          className="flex-1 min-w-[180px] px-3 py-2.5 rounded-xl text-[15px] bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-white"
          placeholder="メールアドレス"
          value={email} onChange={(e) => setEmail(e.target.value)} disabled={sending} />
        <button type="button" onClick={submit} disabled={sending}
          className={`${btnSm} bg-white text-emerald-700 hover:bg-emerald-50 disabled:opacity-60 whitespace-nowrap`}>
          {sending ? "送信中…" : "無料ではじめる"}
        </button>
      </div>
      {error && <p className="text-[12px] text-red-200 mt-1.5">{error}</p>}
      <p className="text-[11px] mt-2">
        <a href="/privacy" target="_blank" rel="noopener noreferrer" className="underline text-white/80">プライバシーポリシー</a>
      </p>
    </div>
  );
}

function Toast({ msg }: { msg: string }) {
  return (
    <div className="fixed left-1/2 bottom-6 -translate-x-1/2 bg-slate-800 text-white px-5 py-3 rounded-full text-sm font-bold z-50 shadow-lg">{msg}</div>
  );
}
