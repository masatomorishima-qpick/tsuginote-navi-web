/**
 * lib/shisan/reallocExtract.ts
 *
 * 配分変更（realloc）のサーバー側フォールバック抽出（修正指示書_20260707・修正1の堅牢化）。
 *
 * 背景：伴走LLM（Haiku）は <realloc> タグを毎回は出さない（実測 3回中1回）。
 *   タグが出ないと承認カードが出ない＝「タグ発行」が単一障害点。会話履歴が
 *   「AIが数字を喋って確定を聞く」実例で汚れると、モデルがその型を真似て
 *   タグを出さなくなる（few-shot汚染）。本番では履歴は必ず汚れるため、確率的な
 *   タグ発行に数字の正確性を賭けない。
 *
 * 対策：タグが無くても、①ユーザー発言に配分変更の意図（金額＋バケツ/動詞）がある、
 *   または②AIが「確定しますか」等の確認表現＋金額を出した場合は、専用の抽出パス
 *   （単機能のJSON抽出。会話をこなす本応答より遥かに追従が安定）で意図を組み立て、
 *   承認カードを強制表示する。抽出結果は既存の validateReallocIntent で検証する。
 */

import { validateReallocIntent, type ReallocIntent } from "@/lib/shisan/plan";

/** 金額らしき表現（¥6,000／6000円／月15000／1.5万 など） */
const AMOUNT_RE =
  /(?:[¥￥]\s*[\d,]{2,})|(?:[\d,]{2,}\s*(?:万|円))|(?:月\s*[\d,]{2,})|(?:[\d.]+\s*万)/;
/** 配分バケツを指す語 */
const BUCKET_RE = /(備え|もしも|教育|繰[り]?上げ|返済|投資|NISA|ニーサ|積立|積み立て)/;
/** 配分を動かす動詞 */
const VERB_RE =
  /(にしたい|にする|に変え|に増や|に減ら|減らし|増やし|回し|回す|振り分|割り振|配分|移し|移す)/;
/** AIが配分の確認・提示に踏み込んだ表現 */
const AI_CONFIRM_RE =
  /(確定しますか|でよろしいですか|よろしいですか|その方針で|変更後の配分|になります|回せるのは|に増やす|に減らす)/;

/**
 * フォールバック抽出を起動すべきターン（配分変更の気配）か。
 * ここは「気配」の粗いゲート（コスト抑制のため）。真の判定は抽出LLM＋検証が行う。
 */
export function hasAllocSignal(message: string, aiReply: string): boolean {
  const userSignal = AMOUNT_RE.test(message) && (BUCKET_RE.test(message) || VERB_RE.test(message));
  const aiSignal = AI_CONFIRM_RE.test(aiReply) && AMOUNT_RE.test(aiReply);
  return userSignal || aiSignal;
}

const EXTRACT_SYSTEM = `あなたは配分変更の意図を抽出するJSON抽出器です。会員の「毎月の余力」を次の4バケツに配分します：liq=もしもの備え、edu=教育費、prepay=繰り上げ返済、nisa=NISA/投資。
直近の会話と最新のユーザー発言から、「特定のバケツの毎月の配分額を、ある金額に変えたい」という意図を読み取り、JSONだけを出力してください（前置き・説明・マークダウン・コードブロックは一切禁止）。
出力はいずれか1つ：
{"target":"liq|edu|prepay|nisa","monthly_yen":整数,"source":"liq|edu|prepay|nisa|unallocated|null"}
{"none":true}
ルール：
- target＝増やす/設定したい対象バケツ。monthly_yen＝その対象の希望月額（円の整数）。会話から対象や金額が特定できなければ {"none":true}。
- source＝減らす補填元。「投資から」→nisa、「繰り上げ返済から」→prepay、「未配分/余りから」→unallocated、明示がなければnull。
- 「投資」は既定でnisa（NISA・積立の文脈）。繰り上げ返済を明確に指す場合のみprepay。「備え/もしも」→liq、「教育」→edu。
- 金額は円に正規化（例「1万5千」「1.5万」→15000、「6,000円」→6000）。
- 配分変更ではない（雑談・情報質問・実行の申告など）場合は必ず {"none":true}。`;

interface ExtractArgs {
  apiKey: string;
  model: string;
  history: { role: "user" | "assistant"; content: string }[];
  message: string;
  aiReply: string;
}

/** 会話を1本のプレーンな転記にまとめる（役割ラベルつき・直近のみ） */
function buildTranscript(history: ExtractArgs["history"], message: string): string {
  const recent = history.slice(-6);
  const lines = recent.map((m) => `${m.role === "user" ? "利用者" : "AI"}: ${m.content}`);
  lines.push(`利用者（最新）: ${message}`);
  return lines.join("\n");
}

/**
 * タグ欠落時のフォールバック抽出。配分変更意図を単機能LLMで抽出→検証。
 * 意図が読めなければ null（＝カードを出さない）。monthly_yen<=0 も null 扱い（誤爆抑制）。
 */
export async function extractReallocFallback(args: ExtractArgs): Promise<ReallocIntent | null> {
  const { apiKey, model, history, message, aiReply } = args;
  if (!hasAllocSignal(message, aiReply)) return null;
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model,
        max_tokens: 150,
        system: EXTRACT_SYSTEM,
        messages: [{ role: "user", content: buildTranscript(history, message) }],
      }),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { content?: { type: string; text?: string }[] };
    const text = (json.content ?? [])
      .filter((c) => c.type === "text" && c.text)
      .map((c) => c.text)
      .join("")
      .trim();
    const m = text.match(/\{[\s\S]*\}/);
    if (!m) return null;
    let parsed: unknown;
    try { parsed = JSON.parse(m[0]); } catch { return null; }
    if (parsed && typeof parsed === "object" && (parsed as Record<string, unknown>).none) return null;
    const intent = validateReallocIntent(parsed);
    if (!intent) return null;
    if (intent.monthlyYen <= 0) return null; // フォールバックは正の金額のみ（0は誤爆とみなす）
    return intent;
  } catch {
    return null;
  }
}
