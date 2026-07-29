import { NextResponse } from "next/server";

/**
 * /api/shisan/ask（診断直後の相談・Anthropic を使用／Wave1 で UI 撤去後は呼び出し元ゼロ） — 廃止（2026-07-29）
 *
 * AI相談機能（/shisan/chat）は 2026-07 のピボットで導線を撤去し、復活の予定はない。
 * ページを塞いでも API を直接叩ける状態では ANTHROPIC_API_KEY が消費されうるため、
 * ルート自体を 404 を返すだけの実装に置き換えた。
 *
 * 元の実装は git 履歴（4c54665 以前）から復元できる。
 */

export async function GET() {
  return NextResponse.json({ error: "not_found" }, { status: 404 });
}

export async function POST() {
  return NextResponse.json({ error: "not_found" }, { status: 404 });
}
