"use client";

/**
 * /shisan/mypage：会員マイページ（追加要件A・最小形）
 * 構成：①診断サマリー ②決めた一手と実行状況（申告UIの正） ③伴走AIへの導線
 * ログイン必須（未ログインは共通のログイン案内）。データはサーバー保存値が正。
 */

import { useEffect, useRef, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { track } from "@/lib/shisan/track";
import { LoginPanel } from "../LoginPanel";
import { ExecuteReportPanel, type ReportSaveResult } from "../ExecuteReportPanel";
import { yen } from "@/lib/shisan/calc";

interface MypageData {
  summary: {
    phase: string | null; scenario: string | null;
    poolYen: string; future65Man: string; achieve: number; targetMan: string; r: number;
    recalcApplied: boolean; adjustmentYen: number; basePoolYen: string | null; baseFuture65Man: string | null;
  } | null;
  refiMismatch: boolean;
  decisions: { id: string; label: string; choice: string }[];
  reports: Record<string, { status: string; monthly_amount: number | null }>;
  plans: Record<string, { goal: string; nextStep: string; monthlyYen: number | null; updatedAt: string }>;
  verdict: string;
  allocation: { rows: { key: string; label: string; amountYen: string; basis: string }[]; totalYen: string | null; overflowYen: string | null };
  tasks: { id: string; label: string; nextStep: string | null; done: boolean; cta: string }[];
  total: number;
  remainingCount: number;
}

const AMOUNT_LABEL_DEFAULT = "この一手で、毎月の家計はいくら変わりましたか？（変わらない場合は空欄でOK）";
const AMOUNT_LABEL_REFI = "月いくら変わりましたか？（任意・概算でOK）";

function MypageInner() {
  const params = useSearchParams();
  const [state, setState] = useState<"loading" | "login" | "ready">("loading");
  const [data, setData] = useState<MypageData | null>(null);
  const loginTracked = useRef(false);

  const loadData = async (): Promise<boolean> => {
    const res = await fetch("/api/shisan/mypage");
    if (res.status === 401) return false;
    const j = (await res.json()) as { ok?: boolean } & MypageData;
    if (!j.ok) return false;
    setData({ summary: j.summary, refiMismatch: !!j.refiMismatch,
      decisions: j.decisions ?? [], reports: j.reports ?? {}, plans: j.plans ?? {},
      verdict: j.verdict ?? "", allocation: j.allocation ?? { rows: [], totalYen: null, overflowYen: null },
      tasks: j.tasks ?? [],
      total: j.total ?? 0, remainingCount: j.remainingCount ?? 0 });
    return true;
  };

  useEffect(() => {
    (async () => {
      try {
        const ok = await loadData();
        if (!ok) { setState("login"); return; }
        if (params.get("login") === "1" && !loginTracked.current) {
          track("shisan_login_success");
          loginTracked.current = true;
        }
        setState("ready");
      } catch {
        setState("login");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submitReport = async (actionId: string, status: string, amount: number | null): Promise<ReportSaveResult> => {
    try {
      const res = await fetch("/api/shisan/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actionId, status, monthlyAmount: amount }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok || !j.ok) return { ok: false };
      track("shisan_execute_report", { action_id: actionId, status, recalc: !!j.recalc });
      loadData().catch(() => {}); // サマリー（実効値・内訳・食い違い表示）を更新
      return { ok: true, recalc: j.recalc, beforeMan: j.beforeMan, afterMan: j.afterMan };
    } catch { return { ok: false }; }
  };

  if (state === "loading") {
    return <main className="max-w-2xl mx-auto px-4 pt-10 pb-24 text-slate-400 text-sm">読み込み中…</main>;
  }
  if (state === "login") {
    return <LoginPanel loginError={params.get("login_error") === "1"} />;
  }

  const s = data?.summary ?? null;
  return (
    <main className="max-w-2xl mx-auto px-4 pt-6 pb-24 text-slate-800">
      <h1 className="text-[22px] font-extrabold leading-tight mb-3">マイページ</h1>

      {/* ブロック1「現在地」＝①私は大丈夫か（判定の言い切り・試算の事実の言明） */}
      {s ? (
        <div className="rounded-2xl shadow-sm p-5 mb-4 text-white bg-gradient-to-br from-emerald-600 to-emerald-800">
          <div className="text-[13px] font-bold opacity-90 mb-1">現在地{s.phase ? `｜${s.phase}` : ""}</div>
          {data?.verdict && <div className="text-[16px] font-extrabold leading-relaxed mb-3">{data.verdict}</div>}
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <div>
              <div className="text-[11px] opacity-80">毎月の余力</div>
              <div className="text-[20px] font-extrabold">¥{s.poolYen}</div>
            </div>
            <div>
              <div className="text-[11px] opacity-80">65歳の見込み（目安）</div>
              <div className="text-[20px] font-extrabold">約¥{s.future65Man}万<span className="text-[13px] font-bold ml-2">目標¥{s.targetMan}万・{s.achieve}%</span></div>
            </div>
          </div>
          {/* 内訳の透明性（修正B-2）：調整があるときのみ。数字が黙って変わることは絶対にない */}
          {s.recalcApplied && s.basePoolYen && (
            <div className="text-[11px] opacity-90 mt-2 rounded-lg bg-white/15 px-2.5 py-1.5">
              内訳：診断ベース ¥{s.basePoolYen} {s.adjustmentYen > 0 ? "＋" : "−"} 実行による調整 ¥{yen(Math.abs(s.adjustmentYen))} ＝ ¥{s.poolYen}
              <span className="block mt-0.5">65歳の見込みは、実行結果を反映した見込みです。</span>
            </div>
          )}
          <div className="text-[11px] opacity-80 mt-2">想定リターン{s.r}%の目安。すべて目安です。</div>
          <Link href="/shisan?reenter=1" className="inline-block mt-3 text-[12px] font-semibold underline underline-offset-2 text-white/90">再診断する →</Link>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 p-5 mb-4 text-sm text-slate-600">
          診断データがまだありません。<Link href="/shisan" className="underline text-emerald-700">診断をはじめる →</Link>
        </div>
      )}

      {/* ブロック2「毎月の余力と使い道」＝②いくら動かせて、どう振り分けているか（配分表・合計＝余力） */}
      {s && data && data.allocation.rows.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 mb-4">
          <h2 className="text-[15px] font-extrabold text-emerald-800 mb-2">毎月¥{data.allocation.totalYen}を自由に配分できます</h2>
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-[11px] text-slate-400 border-b border-slate-100">
                <th className="text-left font-semibold py-1">使い道</th>
                <th className="text-right font-semibold py-1">毎月</th>
                <th className="text-right font-semibold py-1">根拠</th>
              </tr>
            </thead>
            <tbody>
              {data.allocation.rows.map((row) => (
                <tr key={row.key} className="border-b border-slate-50">
                  <td className="py-1.5">{row.label}</td>
                  <td className="py-1.5 text-right font-bold">¥{row.amountYen}</td>
                  <td className="py-1.5 text-right text-[11px] text-slate-500">{row.basis}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {data.allocation.overflowYen && (
            <div className="mt-2 rounded-lg bg-amber-50 border border-amber-200 px-2.5 py-2 text-[12px] text-amber-800">
              ⚠ 方針の合計が余力を¥{data.allocation.overflowYen}超えています。
              <Link href="/shisan/chat" className="underline font-bold ml-1">AIと調整してください →</Link>
            </div>
          )}
        </div>
      )}

      {/* ブロック3「次にやること」＝③次に何をするか（チェック＝実行申告） */}
      {data && data.tasks.length > 0 && data.remainingCount === 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 mb-4">
          <h2 className="text-[15px] font-extrabold text-emerald-800 mb-2">次にやること</h2>
          {data.tasks.map((task) => (
            <TaskRow key={task.id} task={task}
              onCheck={(amount) => submitReport(task.id, "done", amount)} />
          ))}
        </div>
      )}

      {/* ② 出し分け（修正指示書_20260707 修正1-2）：未完了＝AIへ誘導／完了＝決めた一手＋実行申告 */}
      {data && data.remainingCount > 0 && (
        <div className="rounded-2xl border border-emerald-300 bg-emerald-50 p-4 mb-4">
          <div className="font-bold text-[15px] text-emerald-900 mb-1">
            あなたの方針を決める質問が残っています（残り{data.remainingCount}問）
          </div>
          <p className="text-[12px] text-slate-600 mb-3">質問に答える場所はAIチャットです。途中からでも続けられます。</p>
          <Link href="/shisan/chat" onClick={() => track("shisan_chat_open_click")}
            className="block w-full py-3 rounded-xl text-center text-white text-[15px] font-bold bg-emerald-600 hover:bg-emerald-700 transition">
            AIと決める →
          </Link>
        </div>
      )}

      <h2 className="text-[16px] font-extrabold text-emerald-700 mb-2">{data && data.remainingCount === 0 ? "詳細：決めた一手と実行状況" : "決めた一手"}</h2>
      {data && data.remainingCount === 0 && data.decisions.length > 0 && (
        <p className="text-[12px] text-slate-500 mb-2">
          内容を見直したいときは<Link href="/shisan/chat" className="underline text-emerald-700">AIと見直す →</Link>
        </p>
      )}
      {data && data.decisions.length > 0 ? (
        data.decisions.map((d) => (
          <div key={d.id} className="bg-white border border-slate-200 rounded-xl p-3.5 mb-2.5">
            <div className="flex items-baseline justify-between gap-2">
              <span className="font-bold text-[14px]">{d.label}</span>
              <span className="text-[12px] text-emerald-700 font-semibold">決めた：{d.choice}</span>
            </div>
            {/* あなたの方針（修正A：AIとの合意の固定。変更はAI経由のみ） */}
            {data.plans[d.id] && (
              <div className="mt-2 rounded-lg bg-emerald-50 border border-emerald-100 px-2.5 py-2 text-[12px] text-slate-700">
                <div><span className="font-bold text-emerald-800">あなたの方針：</span>{data.plans[d.id].goal}</div>
                <div><span className="font-bold text-emerald-800">次の一歩：</span>{data.plans[d.id].nextStep}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  {new Date(data.plans[d.id].updatedAt).toLocaleDateString("ja-JP", { month: "numeric", day: "numeric" })} AIと相談
                </div>
              </div>
            )}
            {/* 方針と実行の食い違い（Q3c：数字は調整せず、解消をAIへ） */}
            {d.id === "refi" && data.refiMismatch && (
              <div className="mt-2 rounded-lg bg-amber-50 border border-amber-200 px-2.5 py-2 text-[12px] text-amber-800">
                方針（進める）と実行状況（やめた）が食い違っています。
                <Link href="/shisan/chat" className="underline font-bold ml-1">AIと見直しますか？ →</Link>
              </div>
            )}
            {/* 実行申告は全問完了後のみ（未完了時は状態表示に徹する） */}
            {data.remainingCount === 0 && (
              <div className="mt-2">
                <ExecuteReportPanel current={data.reports[d.id] ?? null}
                  amountLabel={d.id === "refi" ? AMOUNT_LABEL_REFI : AMOUNT_LABEL_DEFAULT}
                  memoNote={d.id !== "refi" ? "※余力には反映されない記録です" : undefined}
                  onSubmit={(status, amount) => submitReport(d.id, status, amount)} />
              </div>
            )}
          </div>
        ))
      ) : (
        <p className="text-[13px] text-slate-500 mb-2">まだ決めた一手はありません。上の「AIと決める」から始められます。</p>
      )}

      {/* ③ 伴走AIに相談 */}
      <Link href="/shisan/chat"
        className="block w-full mt-5 py-4 rounded-2xl text-center text-white text-base font-bold shadow-sm bg-gradient-to-br from-emerald-600 to-emerald-800 hover:opacity-95 transition"
        onClick={() => track("shisan_chat_open_click")}>
        AIに相談する →
        <span className="block text-[11px] font-normal text-white/80 mt-0.5">あなたの診断結果を知っています。売り込みはありません。直近の会話の続きから</span>
      </Link>
    </main>
  );
}

/* ===== タスク行（ブロック3）：チェック＝実行申告。refiのみ金額入力（スキップ可＝Q3条件） ===== */
function TaskRow({ task, onCheck }: {
  task: { id: string; label: string; nextStep: string | null; done: boolean; cta: string };
  onCheck: (amount: number | null) => Promise<ReportSaveResult>;
}) {
  const [phase, setPhase] = useState<"idle" | "amount" | "saving" | "done">(task.done ? "done" : "idle");
  const [amount, setAmount] = useState("");
  const [fb, setFb] = useState<{ beforeMan: string; afterMan: string } | null>(null);
  const [error, setError] = useState("");

  const save = async (amt: number | null) => {
    setPhase("saving"); setError("");
    const res = await onCheck(amt);
    if (res.ok) {
      setFb(res.recalc && res.beforeMan && res.afterMan ? { beforeMan: res.beforeMan, afterMan: res.afterMan } : null);
      setPhase("done");
    } else { setError("記録に失敗しました。時間をおいてお試しください。"); setPhase("idle"); }
  };

  if (!task.nextStep) {
    return (
      <div className="flex items-start gap-2 py-1.5 border-b border-slate-50 text-[13px] text-slate-600">
        <span className="text-slate-300 mt-[1px]">☐</span>
        <Link href={`/shisan/chat?topic=${task.id}`} onClick={() => track("shisan_chat_open_click")}
          className="underline text-emerald-700">{task.cta} →</Link>
      </div>
    );
  }
  if (phase === "done") {
    return (
      <div className="py-1.5 border-b border-slate-50 text-[13px]">
        <span className="text-emerald-700 font-bold">✓ 済</span>
        <span className="ml-2 text-slate-400 line-through">{task.nextStep}</span>
        <span className="ml-1 text-[11px] text-slate-400">（{task.label}）</span>
        {fb && <div className="text-[12px] text-emerald-700 mt-0.5">あなたの実行で、65歳の見込みが 約¥{fb.beforeMan}万 → 約¥{fb.afterMan}万 になりました。</div>}
      </div>
    );
  }
  if (phase === "amount") {
    return (
      <div className="py-1.5 border-b border-slate-50">
        <div className="text-[13px] mb-1">☐ {task.nextStep} <span className="text-[11px] text-slate-400">（{task.label}）</span></div>
        <div className="flex gap-2 items-center flex-wrap text-[12px]">
          <span className="text-slate-600">月いくら変わりましたか？（任意）</span>
          <input type="text" inputMode="numeric" value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ""))}
            className="w-24 px-2 py-1 border border-slate-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-emerald-600"
            placeholder="5,000" />
          <span className="text-slate-500">円/月</span>
          <button type="button" className="px-2.5 py-1 rounded-lg text-[12px] font-bold bg-emerald-600 text-white"
            onClick={() => save(amount ? parseInt(amount, 10) : null)}>記録する</button>
          <button type="button" className="px-2.5 py-1 rounded-lg text-[12px] font-semibold border border-slate-300 text-slate-500"
            onClick={() => save(null)}>あとで入力（見込み通りとして記録）</button>
        </div>
        {error && <p className="text-[11px] text-red-600 mt-1">{error}</p>}
      </div>
    );
  }
  return (
    <div className="py-1.5 border-b border-slate-50">
      <button type="button" disabled={phase === "saving"}
        onClick={() => (task.id === "refi" ? setPhase("amount") : save(null))}
        className="flex items-start gap-2 text-left text-[13px] w-full hover:bg-slate-50 rounded-lg px-1 py-0.5">
        <span className="text-emerald-600 font-bold mt-[1px]">☐</span>
        <span>{task.nextStep} <span className="text-[11px] text-slate-400">（{task.label}）</span>
          <span className="block text-[10px] text-slate-400">タップで「実行した」を記録</span></span>
      </button>
      {error && <p className="text-[11px] text-red-600 mt-1">{error}</p>}
    </div>
  );
}

export default function MypagePage() {
  return (
    <Suspense fallback={<main className="max-w-2xl mx-auto px-4 pt-10 pb-24 text-slate-400 text-sm">読み込み中…</main>}>
      <MypageInner />
    </Suspense>
  );
}
