/**
 * lib/shisan/op.ts
 *
 * 運営者（テスト操作）除外フラグ（2026-08-03・テストA指示書1-4）。
 * 初出は 2026-08-02 の「顧客の声収集装置」だが、同件は白紙化されたため本ファイルは
 * 修理部分（テスト行除外）だけを切り出した再実装。テストA以降の全実験の前提
 * （運用規律「テスト時は ?op=1」・事業戦略まとめ 2026-08-03 §5）。
 *
 * 背景：is_operator の判定は従来、会員セッションのメールアドレスを
 * SHISAN_OPERATOR_EMAILS と照合する方式だった（diagnosis のみ）。会員モデルが
 * 07-17 に廃止されてログイン手段がなくなり、事実上どの経路でも立たなくなっていた
 * （7/31〜8/1 のローンツールのオペレータ入力24行が全行 false で素通りした実害あり）。
 *
 * 仕組み：`?op=1` 付きでサイトを開くと localStorage に永続フラグを立て、以後この端末
 * からの全送信（diagnosis・ローンツールの2経路）の body に operator: true を付ける。
 * `?op=0` で解除。GA4 には lib/shisan/track.ts が全イベント共通の debug パラメータ
 * として OR で載せる（op と ga_debug はパラメータとして分離・masato確定）。
 *
 * 信頼水準について：localStorage 由来の自己申告であり、セキュリティ境界ではない。
 * 目的はテスト行の機械的除外（debug_flag と同じ水準）。サーバー側では従来の
 * セッション判定と OR で併用し、既存の判定は壊さない。
 */

const KEY = "tsuginote_op";

/** URL に ?op=1 / ?op=0 があれば localStorage に反映する。ページ表示時に一度呼ぶ。 */
export function captureOpParam(): void {
  if (typeof window === "undefined") return;
  try {
    const v = new URLSearchParams(window.location.search).get("op");
    if (v === "1") window.localStorage.setItem(KEY, "1");
    else if (v === "0") window.localStorage.removeItem(KEY);
  } catch {
    /* localStorage 不可（プライベートモード等）は諦める（best-effort） */
  }
}

/** この端末が運営者としてマークされているか。 */
export function isOperatorClient(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}
