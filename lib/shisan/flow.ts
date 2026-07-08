/**
 * lib/shisan/flow.ts
 *
 * AI主導の意思決定フロー（追加要件G）。
 * 該当バケツを1問ずつ進行するための質問文・選択肢を、
 * 検証済み計算エンジン（calc.ts）の数値から生成する。
 *
 * 原則：質問文・選択肢・数値はすべてサーバー側で決定論的に生成（LLMに作らせない）。
 * 選択肢の文字列は既存 decisions の choice と完全一致させる（画面・集計との整合）。
 */

import {
  REFI_BASE, BUCKET_LABEL,
  type Inputs, type BucketId, type Decision,
  yen, man, annFactor, prepayCompression, refinance, eduMonthly, deriveBuckets,
} from "@/lib/shisan/calc";

export interface FlowQuestion {
  bucket: BucketId;
  label: string;      // 表示ラベル（もしもの備え 等）
  question: string;   // 数字入りの質問文（プレーンテキスト）
  choices: string[];  // 既存 decisions.choice と同一の文字列
}

/** 未決定バケツ（既存の出し分けロジックに従う・順序維持） */
export function undecidedBuckets(
  inputs: Inputs | null,
  decisions: Partial<Record<BucketId, Decision>>,
): BucketId[] {
  return deriveBuckets(inputs).filter((b) => !decisions[b]);
}

/** バケツ別の質問（数字は計算エンジンの値のみ） */
export function buildQuestion(bucket: BucketId, inputs: Inputs): FlowQuestion {
  const label = BUCKET_LABEL[bucket];

  if (bucket === "liq") {
    return {
      bucket, label,
      question: `もしもの備え（生活防衛資金）から決めましょう。目安は生活費6ヶ月分＝¥${yen(inputs.living * 6)}です。一般に「投資や繰上げより先に確保」と言われますが、決めるのはあなたです。`,
      choices: ["確保している/する", "今は見送る"],
    };
  }
  if (bucket === "edu") {
    const monthly = eduMonthly(inputs.childAges, inputs.eduPlan);
    return {
      bucket, label,
      question: `教育費です。お子さん${inputs.childAges.length}人ぶんを大学入学（18歳）までに用意するには、約¥${yen(monthly)}/月の積立が必要（目安・現在の想定進路）。いくら積みますか？`,
      choices: ["必要額を積む", "一部を積む", "今は積まない"],
    };
  }
  if (bucket === "refi") {
    const refi = refinance(inputs.mBal, inputs.mRate, inputs.mYears);
    const fact = refi && refi.dMonthly > 0
      ? `現在${inputs.mRate}%→基準${REFI_BASE}%（内部目安）に借り換えた場合：月々¥${yen(refi.dMonthly)}減・総利息 約¥${man(refi.dInterest)}万減・諸費用 約¥${man(refi.cost)}万は${isFinite(refi.months) ? refi.months + "ヶ月" : "—"}で回収の試算です。`
      : `現在の金利${inputs.mRate}%は基準${REFI_BASE}%より低く、借り換えの余地は小さいようです。`;
    return {
      bucket, label,
      question: `住宅ローンの借り換えです。${fact}「得/損」は判定しません。進めますか？`,
      choices: ["進める", "しない"],
    };
  }
  if (bucket === "prepay") {
    const comp = prepayCompression(inputs.mBal, inputs.mRate, inputs.mYears, inputs.surplus * 12);
    const n = Math.max(0, 65 - inputs.age);
    const inv = inputs.surplus * 12 * annFactor(n, inputs.r / 100);
    return {
      bucket, label,
      question: `余ったお金の使い道です。余力（年¥${man(inputs.surplus * 12)}万）を繰上げ返済に回すと利息 約¥${man(comp)}万圧縮（確実）。同じ額を投資に回すと65歳で約¥${man(inv)}万（想定${inputs.r}%・不確実）。性質が違うだけで、正解は決めつけません。どうしますか？`,
      choices: ["繰上げ中心", "投資中心", "両方に分ける"],
    };
  }
  // nisa
  const annual = inputs.surplus * 12;
  return {
    bucket, label,
    question: `NISAの非課税枠です。年間360万円の枠に対し、あなたの余力は年換算¥${man(annual)}万（枠の約${Math.min(100, Math.round((annual / 3600000) * 100))}%）。枠を使いますか？（特定の商品や金融機関はご案内しません）`,
    choices: ["枠を使う", "今は使わない"],
  };
}

/** 選択肢の妥当性チェック */
export function isValidChoice(bucket: BucketId, inputs: Inputs, choice: string): boolean {
  return buildQuestion(bucket, inputs).choices.includes(choice);
}

/* ===== フローの挨拶（修正指示書_20260707 修正1/2：決定論的に生成・LLM任せにしない） ===== */
const INTERRUPT_OK = "迷ったら、その場で質問してください——お答えしてから続けます。";

export function flowGreeting(total: number, remaining: number, hasHistory: boolean): string {
  if (total === 0) {
    // 診断データなし（通常の伴走挨拶は呼び出し側で）
    return "こんにちは。実行で迷ったこと、何でも聞いてください。";
  }
  if (remaining === 0) {
    // 全問決定済み（旧アコーディオン回答済み含む）→ 伴走モードで開始
    return "あなたの方針は決まっています。変更したい項目があれば、そのまま言ってください。\n\n実行で迷ったことも、何でも聞いてください（税務・法律の個別判断は専門家の領域です）。";
  }
  if (hasHistory) {
    return `おかえりなさい。方針決めの続きから始めましょう（残り${remaining}問）。\n\n${INTERRUPT_OK}`;
  }
  if (remaining < total) {
    // 一部決定済み（スキップして未決定のみ）
    return `こんにちは。あなたの診断結果を把握しています。\n\nすでに決めた${total - remaining}問はそのままに、残り${remaining}問で方針を一緒に決めます。${INTERRUPT_OK}`;
  }
  return `こんにちは。あなたの診断結果を把握しています。\n\n最初に${total}つの質問で、あなたの方針を一緒に決めます。${INTERRUPT_OK}\n\n（税務・法律の個別判断は専門家の領域です）`;
}
