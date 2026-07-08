/**
 * lib/shisan/track.ts
 *
 * /shisan のGA4/Clarity計測（クライアント用・共有）。
 * `?ga_debug=1` でConsoleにイベントを出力（検証用）。
 * 会話内容・メールアドレス等のPIIはイベントに含めない（呼び出し側の責務）。
 */

export function track(name: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  if (location.search.includes("ga_debug")) console.log("[track]", name, params ?? {});
  try {
    window.gtag?.("event", name, params ?? {});
    (window as unknown as { clarity?: (...args: unknown[]) => void }).clarity?.("event", name);
  } catch { /* no-op */ }
}
