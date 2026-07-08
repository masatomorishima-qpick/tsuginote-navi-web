/**
 * /api/shisan/logout
 *
 * セッションcookieの破棄。POST → cookie削除。
 * （テスト・サポート用途。画面上のUIは現状なし）
 */

import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/shisan/auth";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  return res;
}
