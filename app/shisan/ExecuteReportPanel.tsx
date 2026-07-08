"use client";

/**
 * 実行申告パネル（Phase1 §7-1・改善額ファクトの収集装置）。
 * 診断画面の質問カード内とマイページ（追加要件A）で共用。
 */

import { useState } from "react";
import { yen } from "@/lib/shisan/calc";

/** 申告保存の結果（修正B-3：再計算の即時フィードバック用） */
export interface ReportSaveResult {
  ok: boolean;
  recalc?: boolean;
  beforeMan?: string | null;
  afterMan?: string | null;
}
export interface ExecReportProps {
  current: { status: string; monthly_amount: number | null } | null;
  onSubmit: (status: string, amount: number | null) => Promise<ReportSaveResult>;
  /** 金額入力の文言（修正B-2：refi以外は「毎月の家計はいくら変わりましたか」で定義を明確化） */
  amountLabel?: string;
  /** 実行メモの注記（基準1：意味を説明できない数字の格下げ表示。例「※余力には反映されない記録です」） */
  memoNote?: string;
}

export function ExecuteReportPanel({ current, onSubmit, amountLabel, memoNote }: ExecReportProps) {
  const [phase, setPhase] = useState<"idle" | "amount" | "saving" | "saved">("idle");
  const [amount, setAmount] = useState("");
  const [savedAmount, setSavedAmount] = useState<number | null>(current?.status === "done" ? current.monthly_amount : null);
  const [savedStatus, setSavedStatus] = useState<string | null>(current?.status ?? null);
  const [recalcInfo, setRecalcInfo] = useState<{ beforeMan: string; afterMan: string } | null>(null);
  const [error, setError] = useState("");
  const small = "px-2.5 py-1.5 rounded-lg text-[12px] font-semibold border transition";

  const save = async (status: string, amt: number | null) => {
    setPhase("saving"); setError("");
    const res = await onSubmit(status, amt);
    if (res.ok) {
      setSavedStatus(status); setSavedAmount(amt);
      setRecalcInfo(res.recalc && res.beforeMan && res.afterMan ? { beforeMan: res.beforeMan, afterMan: res.afterMan } : null);
      setPhase("saved");
    } else { setError("記録に失敗しました。時間をおいてお試しください。"); setPhase("idle"); }
  };

  if (phase === "saved" || (phase === "idle" && savedStatus)) {
    const label = savedStatus === "done" ? "実行した" : savedStatus === "not_yet" ? "まだ" : "やめた";
    return (
      <div className="rounded-lg bg-slate-50 p-2.5 text-[12px] text-slate-600">
        {phase === "saved" ? (
          <>
            <span className="font-bold text-emerald-700">記録しました。あなたの決断は前に進んでいます。</span>
            {recalcInfo ? (
              <span className="block mt-0.5">あなたの実行で、65歳の見込みが <b>約¥{recalcInfo.beforeMan}万 → 約¥{recalcInfo.afterMan}万</b> になりました。</span>
            ) : (savedStatus === "done" && savedAmount != null && savedAmount > 0 && (
              <span className="block mt-0.5">月¥{yen(savedAmount)} × 継続で<b>年¥{yen(savedAmount * 12)}</b>の改善です。</span>
            ))}
          </>
        ) : (
          <span className="text-slate-400">実行メモ：{label}{savedStatus === "done" && savedAmount != null && savedAmount > 0 && <>（申告額 月¥{yen(savedAmount)}）</>}{memoNote && <span className="block text-[10px]">{memoNote}</span>}</span>
        )}
        {/* 「更新する」リンクは撤去（修正指示書_20260707 修正1-2。見直しはAI経由） */}
      </div>
    );
  }

  if (phase === "amount") {
    return (
      <div className="rounded-lg bg-slate-50 p-2.5">
        <div className="text-[12px] font-semibold text-slate-700 mb-1.5">{amountLabel ?? "月いくら変わりましたか？（任意・概算でOK）"}</div>
        <div className="flex gap-2 items-center flex-wrap">
          <input type="text" inputMode="numeric" value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ""))}
            className="w-28 px-2.5 py-1.5 border border-slate-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-emerald-600"
            placeholder="3,000" />
          <span className="text-[12px] text-slate-500">円/月</span>
          <button type="button" className={`${small} bg-emerald-600 text-white border-emerald-600`}
            onClick={() => save("done", amount ? parseInt(amount, 10) : null)}>記録する</button>
          <button type="button" className={`${small} bg-white text-slate-500 border-slate-300`}
            onClick={() => save("done", null)}>金額はスキップ</button>
        </div>
        {error && <p className="text-[11px] text-red-600 mt-1">{error}</p>}
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-slate-50 p-2.5 flex items-center gap-2 flex-wrap">
      <span className="text-[12px] font-semibold text-slate-700">実行しましたか？</span>
      <button type="button" disabled={phase === "saving"} className={`${small} bg-white text-emerald-700 border-emerald-600 hover:bg-emerald-600 hover:text-white`}
        onClick={() => setPhase("amount")}>実行した</button>
      <button type="button" disabled={phase === "saving"} className={`${small} bg-white text-slate-600 border-slate-300`}
        onClick={() => save("not_yet", null)}>まだ</button>
      <button type="button" disabled={phase === "saving"} className={`${small} bg-white text-slate-600 border-slate-300`}
        onClick={() => save("stopped", null)}>やめた</button>
      {error && <p className="text-[11px] text-red-600 w-full">{error}</p>}
    </div>
  );
}
