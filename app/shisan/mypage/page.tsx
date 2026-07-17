/**
 * /shisan/mypage
 *
 * ピボット（2026-07-15）：会員モデル廃止に伴いマイページを抹消。
 * 行き止まりを作らないため、/shisan（診断結果／新TOP）へ恒久リダイレクトする。
 * 旧マイページUIのコードは撤去（導線ゼロ）。再訪は /shisan 側の localStorage 復元で結果画面を表示。
 */
import { redirect } from "next/navigation";

export default function ShisanMypageRedirect() {
  redirect("/shisan");
}
