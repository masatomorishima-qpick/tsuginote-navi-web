"use client";

/**
 * /shisan/mypage：会員マイページ（実装指示書_20260708：3ブロック構成）
 * 構成：①現在地（判定＋余力＋内訳等式） ②毎月の余力と配分（配分表） ③次にやること（next_step＋実行申告を統合）
 * 「詳細：決めた一手と実行状況」コーナーは廃止し、実行申告は③に一本化。
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
  savedAnswers: { id: string; question: string; answer: string; createdAt: string }[];
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
      total: j.total ?? 0, remainingCount: j.remainingCount ?? 0,
      savedAnswers: j.savedAnswers ?? [] });
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

      {/* ブロック3「次にやること」＝打ち手ごとに next_step＋実行申告を統合（実装指示書_20260708 修正1・2・3）。
          詳細コーナーは廃止し、実行申告はここに一本化。 */}
      {data && data.remainingCount === 0 && (() => {
        const planned = data.tasks.filter((t) => t.nextStep);
        const unplanned = data.tasks.filter((t) => !t.nextStep);
        if (planned.length === 0 && unplanned.length === 0) {
          return (
            <div className="rounded-2xl border border-slate-200 bg-white p-4 mb-4 text-[13px] text-slate-500">
              決めた一手はまだありません。<Link href="/shisan/chat" className="underline text-emerald-700" onClick={() => track("shisan_chat_open_click")}>AIと決める →</Link>
            </div>
          );
        }
        return (
          <div className="rounded-2xl border border-slate-200 bg-white p-4 mb-4">
            <h2 className="text-[15px] font-extrabold text-emerald-800 mb-1">次にやること</h2>
            {planned.length > 0 && (
              <p className="text-[12px] text-slate-500 mb-2">
                内容を見直したいときは<Link href="/shisan/chat" className="underline text-emerald-700" onClick={() => track("shisan_chat_open_click")}>AIと見直す →</Link>
              </p>
            )}
            {planned.map((task) => (
              <PlannedTask key={task.id} task={task}
                report={data.reports[task.id] ?? null}
                refiMismatch={task.id === "refi" && data.refiMismatch}
                onSubmit={(status, amount) => submitReport(task.id, status, amount)} />
            ))}
            {/* 次の一歩が未設定の打ち手は1導線に集約（同一文言を複数並べない＝修正2） */}
            {unplanned.length > 0 && (
              <div className="flex items-start gap-2 pt-2 text-[13px] text-slate-600">
                <span className="text-slate-300 mt-[1px]">☐</span>
                <Link href="/shisan/chat" onClick={() => track("shisan_chat_open_click")}
                  className="underline text-emerald-700">
                  次の一歩を決める：{unplanned.map((t) => t.label).join("・")} → AIと決める
                </Link>
              </div>
            )}
          </div>
        );
      })()}

      {/* 保存したアドバイス（修正3・診断結果画面で保存したアクション案の全文＋質問＋日時。配分数字とは非連動） */}
      {data && data.savedAnswers.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 mb-4">
          <h2 className="text-[15px] font-extrabold text-emerald-800 mb-2">保存したアドバイス</h2>
          <div className="space-y-3">
            {data.savedAnswers.map((a) => (
              <div key={a.id} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                <div className="text-[11px] text-slate-400 mb-1">{new Date(a.createdAt).toLocaleString("ja-JP")}</div>
                {a.question && <div className="text-[13px] font-bold text-slate-700 mb-1">Q. {a.question}</div>}
                <div className="text-[13px] text-slate-700 leading-relaxed whitespace-pre-wrap">{a.answer}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AIに相談（自由対話）＝マイページは「決める場」。旧「残り質問／AIと決める」「詳細を相談」を1本に統合（4問フロー撤去） */}
      <div className="mt-5">
        <Link href="/shisan/chat"
          className="block w-full py-4 rounded-2xl text-center text-white text-base font-bold shadow-md bg-emerald-600 hover:bg-emerald-700 transition"
          onClick={() => track("shisan_chat_open_click")}>
          AIに相談する →
        </Link>
        <p className="text-[12px] text-slate-500 text-center mt-1.5">
          教育費・繰り上げ返済と投資・NISA・備えなど、何でも自由に相談できます。決めたら数字に反映します。
        </p>
      </div>
    </main>
  );
}

/* ===== タスク行（ブロック3）：next_step（次の一歩）＋実行申告を1行に統合（実装指示書_20260708 修正1）。
   実行申告UIは共用の ExecuteReportPanel（実行した/まだ/やめた＋改善額）。refiは食い違い警告＋差分反映。 ===== */
function PlannedTask({ task, report, refiMismatch, onSubmit }: {
  task: { id: string; label: string; nextStep: string | null };
  report: { status: string; monthly_amount: number | null } | null;
  refiMismatch: boolean;
  onSubmit: (status: string, amount: number | null) => Promise<ReportSaveResult>;
}) {
  const isDone = report?.status === "done";
  return (
    <div className="py-2 border-b border-slate-50 last:border-b-0">
      <div className="text-[13px] mb-1.5">
        {isDone ? (
          <><span className="text-emerald-700 font-bold">✓ 済</span> <span className="text-slate-400 line-through">{task.nextStep}</span></>
        ) : (
          <>☐ {task.nextStep}</>
        )}
        <span className="text-[11px] text-slate-400">（{task.label}）</span>
      </div>
      {/* 方針と実行の食い違い（refi：数字は調整せず解消をAIへ） */}
      {refiMismatch && (
        <div className="mb-1.5 rounded-lg bg-amber-50 border border-amber-200 px-2.5 py-2 text-[12px] text-amber-800">
          方針（進める）と実行状況（やめた）が食い違っています。
          <Link href="/shisan/chat" className="underline font-bold ml-1">AIと見直しますか？ →</Link>
        </div>
      )}
      <ExecuteReportPanel current={report}
        amountLabel={task.id === "refi" ? AMOUNT_LABEL_REFI : AMOUNT_LABEL_DEFAULT}
        memoNote={task.id !== "refi" ? "※余力には反映されない記録です" : undefined}
        onSubmit={onSubmit} />
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
