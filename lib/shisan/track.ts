/**
 * lib/shisan/track.ts
 *
 * /shisan のGA4/Clarity計測（クライアント用・共有）。
 * `?ga_debug=1` でConsoleにイベントを出力（検証用）。
 * 会話内容・メールアドレス等のPIIはイベントに含めない（呼び出し側の責務）。
 *
 * 2026-08-02（顧客の声・指示書2-4）：全イベントに debug パラメータを自動付与する。
 * `?ga_debug=1` が GA4 イベントを除外できない既知の問題の恒久修理で、探索レポートで
 * debug=false に絞ればテスト操作を除外できる。イベント個別に付けるのではなく
 * ここで一括付与する（新旧全イベントが対象・masato確定 2026-08-02）。
 * debug の意味：「URL に ga_debug=1 / debug=1 がある」または「?op=1 で立てた
 * 運営者フラグ（lib/shisan/op.ts）」の OR。op と ga_debug はパラメータとして分離のまま。
 */

import { isOperatorClient } from "./op";

export function track(name: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  let debug = isOperatorClient();
  try {
    const p = new URLSearchParams(location.search);
    debug = debug || p.get("ga_debug") === "1" || p.get("debug") === "1";
  } catch { /* URL解釈に失敗しても計測は続ける */ }
  const payload = { ...(params ?? {}), debug };
  if (location.search.includes("ga_debug")) console.log("[track]", name, payload);
  try {
    window.gtag?.("event", name, payload);
    (window as unknown as { clarity?: (...args: unknown[]) => void }).clarity?.("event", name);
  } catch { /* no-op */ }
}
