/**
 * /shisan/chat — 廃止（2026-07-29）
 *
 * AI相談機能は 2026-07 のピボットで導線を撤去した。復活の予定がないため、
 * 行き止まりを作らないよう /shisan（診断）へ恒久リダイレクトする。
 * 処理側の API ルート（chat / flow / realloc / plan / ask）も同日に無効化済み。
 */
import { redirect } from "next/navigation";

export default function ShisanChatRedirect() {
  redirect("/shisan");
}
