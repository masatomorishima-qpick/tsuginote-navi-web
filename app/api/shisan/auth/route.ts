/**
 * /api/shisan/auth
 *
 * マジックリンクの着地（Phase1 要件§3）。
 * GET ?token= → 検証OK: セッションcookieを発行しマイページへ（追加要件A：着地変更）。
 *              無効/期限切れ: /shisan/mypage?login_error=1 へ（再送案内はログインパネル側）。
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyToken, createSessionToken, SESSION_COOKIE, sessionCookieOptions } from "@/lib/shisan/auth";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  const signupId = verifyToken(token);

  if (!signupId) {
    return NextResponse.redirect(new URL("/shisan/mypage?login_error=1", req.url));
  }

  const res = NextResponse.redirect(new URL("/shisan/mypage?login=1", req.url));
  res.cookies.set(SESSION_COOKIE, createSessionToken(signupId), sessionCookieOptions());
  return res;
}
