/**
 * lib/shisan/context.ts
 *
 * 伴走AIの「診断コンテキスト」生成（Phase1 要件§6）。
 * 会員の保存済み Store（inputs / decisions / scenario）から、
 * 検証済み計算エンジン（lib/shisan/calc.ts）をサーバー側で実行し、
 * 計算済みデータブロック（テキスト）を生成してLLMに注入する。
 *
 * 原則：AIに計算させない。ここで計算した数値だけがAIの使える数字。
 * メールアドレスは含めない（PII防御・要件§8）。
 */

import {
  RET_AGE, REFI_BASE, SCENARIO_PHASE, BUCKET_LABEL,
  type Inputs, type BucketId, type Decision, type ReportEntry, type PlanAmounts, type ExecutionAdjusted, type ComputedResult,
  yen, man, annFactor, prepayCompression, refinance, eduMonthly, judgeScenario, deriveBuckets,
  applyExecutionAdjustments,
} from "@/lib/shisan/calc";

export interface StoreSnapshot {
  inputs?: Inputs | null;
  decisions?: Partial<Record<BucketId, Decision>> | null;
}

/* ===== 公式サマリー（修正指示書_20260707最終・基準1「数字の完全性」） =====
 * 配分表・判定文・余力/見込みの説明文をサーバー側で決定論生成する唯一の場所。
 * マイページAPIとAIコンテキストの両方がここから出る（画面とAIの数字・文言一致＝修正D）。 */
export interface PlanRecord { goal: string; nextStep: string; monthlyYen: number | null; updatedAt: string; }
export interface AllocationRow { key: string; label: string; amount: number; basis: string; }
export interface OfficialSummary {
  adj: ExecutionAdjusted;
  shown: ComputedResult | null;      // 表示に使う実効値（調整なしなら診断ベースと同一）
  planAmounts: PlanAmounts;
  rows: AllocationRow[];             // 配分表（合計＝余力）
  overflow: number;                  // 方針合計の余力超過（警告用）
  verdict: string;                   // 現在地の判定文（言い切り・試算の事実の言明）
  explanation: string;               // 余力・見込みの公式説明（AIはこれをそのまま使う）
}

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("ja-JP", { month: "numeric", day: "numeric" });

export function buildOfficialSummary(
  inputs: Inputs | null,
  decisions: Partial<Record<BucketId, Decision>>,
  reports: Record<string, ReportEntry>,
  plans: Record<string, PlanRecord>,
): OfficialSummary {
  // 方針金額（liq/edu/prepay/nisa＝配分。refiは削減目標のため配分対象外）
  const planAmounts: PlanAmounts = {};
  (["liq", "edu", "prepay", "nisa"] as BucketId[]).forEach((b) => {
    const m = plans[b]?.monthlyYen;
    if (typeof m === "number" && isFinite(m) && m > 0) planAmounts[b] = Math.round(m);
  });
  const adj = applyExecutionAdjustments(inputs, decisions, reports, planAmounts);
  const shown = adj.effective ?? adj.base;

  // 配分表（合計＝余力になるよう computeResult の配分値のみ使用）
  const rows: AllocationRow[] = [];
  if (shown && inputs) {
    const basisFor = (b: BucketId) =>
      planAmounts[b] != null && plans[b] ? `${fmtDate(plans[b].updatedAt)} AIと相談して設定` : "決めた配分";
    if (shown.bei > 0) rows.push({ key: "bei", label: "もしもの備えへ", amount: shown.bei, basis: basisFor("liq") });
    if (shown.edu > 0) rows.push({ key: "edu", label: "教育費へ", amount: shown.edu, basis: basisFor("edu") });
    if (shown.kuriage > 0) rows.push({ key: "kuriage", label: "繰上げ返済へ", amount: shown.kuriage, basis: basisFor("prepay") });
    if (shown.toushi > 0) rows.push({
      key: "toushi", label: shown.nisaUsed ? "投資（NISA枠）へ" : "投資へ", amount: shown.toushi,
      basis: planAmounts.nisa != null ? basisFor("nisa") : basisFor("prepay"),
    });
    rows.push({ key: "mihai", label: "未配分", amount: shown.mihai, basis: "自由" });
  }
  const overflow = shown?.planOverflow ?? 0;

  // 現在地の判定文（試算の事実の言明・推奨ではない）
  let verdict = "";
  if (shown && inputs) {
    verdict = shown.achieve >= 100
      ? `老後の目標¥${man(inputs.target)}万に対し、見込みは約¥${man(shown.future)}万（${shown.achieve}%）。今の計画のままで、目標には届く見通しです。`
      : `老後の目標¥${man(inputs.target)}万に対し、見込みは約¥${man(shown.future)}万（${shown.achieve}%）。このままでは目標に約¥${man(Math.max(0, inputs.target - shown.future))}万届かない見通しです。打ち手で埋められます。`;
  }

  // 余力・見込みの公式説明（修正A：AIはこれをそのまま使う）
  const exp: string[] = [];
  if (shown && adj.base && inputs) {
    const baseParts = [`入力の余力¥${yen(inputs.surplus)}`];
    if (adj.base.yutori > 0) baseParts.push(`借り換えの見込み効果¥${yen(adj.base.yutori)}`);
    let poolLine = `毎月の余力は¥${yen(shown.pool)}。内訳＝診断ベース¥${yen(adj.base.pool)}（${baseParts.join("＋")}）`;
    if (adj.recalcApplied) {
      poolLine += adj.adjustment < 0
        ? `から、借り換えの実測が見込みを¥${yen(Math.abs(adj.adjustment))}下回ったため差し引いた額`
        : `に、実測が見込みを¥${yen(adj.adjustment)}上回った分を加えた額`;
    }
    exp.push(poolLine + "。");
    exp.push("もしもの備え・繰上げvs投資・NISA・教育費の申告額は、余力の増減には反映していません（配分の記録です）。");
    exp.push(`65歳の見込みは約¥${man(shown.future)}万（上の配分——備え・教育費・未配分は元本のまま、繰上げはローン金利${inputs.mRate}%、投資は想定${inputs.r}%で65歳まで積み上げた目安。目標¥${man(inputs.target)}万に対し${shown.achieve}%）。`);
    if (rows.length > 0) {
      exp.push(`毎月の配分（合計¥${yen(shown.pool)}）：` + rows.map((r) => `${r.label}¥${yen(r.amount)}（${r.basis}）`).join("／"));
    }
    if (overflow > 0) {
      exp.push(`注意：方針の金額の合計が余力を¥${yen(overflow)}超えています。配分は余力を上限に調整済み。ユーザーには方針の見直し（AIとの調整）を落ち着いて促すこと。`);
    }
  }
  return { adj, shown, planAmounts, rows, overflow, verdict, explanation: exp.join("\n") };
}

/** 保存済みStore（＋実行申告＋方針）から、AIに渡す計算済みデータブロック（日本語テキスト）を生成 */
export function buildDiagnosisContext(
  store: StoreSnapshot | null,
  reports: Record<string, ReportEntry> = {},
  plans: Record<string, PlanRecord> = {},
): string {
  const inputs = store?.inputs ?? null;
  if (!inputs) return "（診断データなし：一般的な相談として応対し、数値には言及しないこと）";

  const decisions = store?.decisions ?? {};
  const scenario = judgeScenario(inputs);
  const buckets = deriveBuckets(inputs);
  const n = Math.max(0, RET_AGE - inputs.age);
  const r = inputs.r;
  const lines: string[] = [];

  lines.push("【会員の診断データ（検証済み計算エンジンの出力・この数値のみ使用可）】");
  lines.push(`・年齢：${inputs.age}歳（65歳まで${n}年）`);
  lines.push(`・額面年収：¥${yen(inputs.income)}／金融資産：¥${yen(inputs.assets)}（※応答でこの2つの生値を復唱しない）`);
  lines.push(`・毎月の投資・貯蓄余力：¥${yen(inputs.surplus)}／毎月の生活費：¥${yen(inputs.living)}`);
  lines.push(`・生活防衛資金の目安（生活費6か月分）：¥${yen(inputs.living * 6)}`);
  if (scenario) lines.push(`・シナリオ判定：${scenario}（${SCENARIO_PHASE[scenario]}）`);

  // 65歳見込み（単純積上げ：現資産の複利＋余力の積立。診断画面の「配分反映」前の目安）
  const future = inputs.assets * Math.pow(1 + r / 100, n) + inputs.surplus * 12 * annFactor(n, r / 100);
  const achieve = inputs.target > 0 ? Math.min(999, Math.round((future / inputs.target) * 100)) : 0;
  lines.push(`・65歳見込み（余力全額を想定リターン${r}%で積み立てた場合の目安）：約¥${man(future)}万／目標¥${man(inputs.target)}万（達成率${achieve}%）`);
  lines.push(`・余力を積立に回した場合の65歳増加分：＋約¥${man(inputs.surplus * 12 * annFactor(n, r / 100))}万（想定${r}%・不確実）`);

  if (inputs.hasMortgage && inputs.mBal > 0) {
    lines.push(`・住宅ローン：残高¥${man(inputs.mBal)}万／残${inputs.mYears}年／金利${inputs.mRate}%（${inputs.mType}）`);
    const refi = refinance(inputs.mBal, inputs.mRate, inputs.mYears);
    if (refi && refi.dMonthly > 0) {
      lines.push(`・借り換え試算（基準金利${REFI_BASE}%・内部目安）：月々¥${yen(refi.dMonthly)}減／総利息 約¥${man(refi.dInterest)}万減／諸費用 約¥${man(refi.cost)}万→${isFinite(refi.months) ? refi.months + "ヶ月" : "—"}で回収`);
    } else {
      lines.push(`・借り換え試算：現在の金利は基準${REFI_BASE}%より低く、下げ幅は小さい`);
    }
    if (inputs.surplus > 0) {
      lines.push(`・繰上げ返済：余力（年¥${man(inputs.surplus * 12)}万）を繰上げに回すと利息 約¥${man(prepayCompression(inputs.mBal, inputs.mRate, inputs.mYears, inputs.surplus * 12))}万圧縮（確実）`);
    }
  } else {
    lines.push("・住宅ローン：なし");
  }

  if (inputs.childAges.length > 0) {
    const cur = eduMonthly(inputs.childAges, inputs.eduPlan);
    const koku = eduMonthly(inputs.childAges, "kokukou");
    lines.push(`・子：${inputs.childAges.length}人（${inputs.childAges.join("歳・")}歳）／教育費の必要積立 約¥${yen(cur)}/月（現在の想定進路）`);
    if (cur > koku) lines.push(`・進路を国公立に見直した場合：約¥${yen(koku)}/月（差 約¥${yen(cur - koku)}/月）`);
  } else {
    lines.push("・子：なし（教育費の論点なし）");
  }

  lines.push(`・NISA：余力の年換算¥${man(inputs.surplus * 12)}万（年間非課税枠360万の約${Math.min(100, Math.round((inputs.surplus * 12 / 3600000) * 100))}%）`);

  const decided = buckets.filter((b) => decisions[b]);
  if (decided.length > 0) {
    lines.push("【決めた一手】");
    decided.forEach((b) => lines.push(`・${BUCKET_LABEL[b]}：${decisions[b]!.choice}`));
  } else {
    lines.push("【決めた一手】まだ意思決定なし（診断は完了済み）");
  }
  const undecided = buckets.filter((b) => !decisions[b]);
  if (undecided.length > 0) {
    lines.push(`【未決定の論点】${undecided.map((b) => BUCKET_LABEL[b]).join("／")}`);
  }

  // 公式サマリー（修正A/D：画面と同一の数字・文言。AIはこの説明をそのまま使う）
  const official = buildOfficialSummary(inputs, decisions, reports, plans);
  const reported = Object.entries(reports);
  if (reported.length > 0) {
    lines.push("【実行申告の状況】");
    reported.forEach(([id, r]) => {
      const label = BUCKET_LABEL[id as BucketId] ?? id;
      const st = r.status === "done" ? "実行した" : r.status === "not_yet" ? "まだ" : "やめた";
      lines.push(`・${label}：${st}${r.status === "done" && r.monthly_amount ? `（申告額 月¥${yen(r.monthly_amount)}）` : ""}`);
    });
  }
  const planEntries = Object.entries(plans);
  if (planEntries.length > 0) {
    lines.push("【あなたの方針（保存済み・文言をそのまま使うこと。言い換え・要約で数字を変えない）】");
    planEntries.forEach(([id, p]) => {
      const label = BUCKET_LABEL[id as BucketId] ?? id;
      lines.push(`・${label}：目標「${p.goal}」／次の一歩「${p.nextStep}」${p.monthlyYen ? `／毎月¥${yen(p.monthlyYen)}` : ""}（${fmtDate(p.updatedAt)}記録）`);
    });
  }
  lines.push("※上の「毎月¥…」が現在の配分方針額（未記載の一手は配分方針¥0＝未設定）。実行申告の金額とは別物で、申告額を配分方針として扱わないこと。");
  if (official.explanation) {
    lines.push("【余力・見込みの公式説明（最重要・修正A）】");
    lines.push(official.explanation);
    lines.push("→ 余力・65歳見込み・内訳・配分・調整の説明を求められたら、上の公式説明の数字と文言をそのまま使うこと。自分で内訳・合計・構成を組み立てること、公式説明にない数字の演算（加算・按分・概算）を行うことを禁止。");
  }
  if (official.verdict) lines.push(`・現在地の判定（画面表示と同一文）：${official.verdict}`);
  if (official.adj.refiMismatch) {
    lines.push("・注意：借り換えは「進める」と決めているが、実行申告は「やめた」＝方針と実行が食い違っている。数字は決定（進める）ベースのまま。話題に出たら、方針を見直すか実行を再開するか、の解消を落ち着いて促すこと。");
  }

  return lines.join("\n");
}

/** AI応答のマークダウン除去（修正指示書_20260707）。
 * プロンプトで禁止した上で、漏れた記法を機械的に除去する二段構え（表示はプレーンテキスト前提）。 */
export function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "$1")   // **太字** → 中身のみ
    .replace(/__(.+?)__/g, "$1")
    .replace(/^#+\s*/gm, "")           // 見出し
    .replace(/^\s*[*-]\s+/gm, "・")    // 箇条書き記号 → ・
    .replace(/`([^`]+)`/g, "$1");      // インラインコード
}

/** 内部用語の機械除去（修正指示書_20260708・修正2）。
 * プロンプトで禁止した上で、確率的に漏れる内部用語の「定型前置き」をサーバーで除去する二段構え。
 * 方針：先頭の定型的な前置き（内部語＋説明動詞・数字を含まない1文）に限定して除去し、本文の意味・数字は壊さない。
 * 「公式説明」「コンテキスト」は利用者向けの意味を持たない内部語のため、残存トークンも安全に除去できる。 */
const INTERNAL_PHRASES = [
  "コンテキストの公式説明をお伝えします。",
  "コンテキストの公式説明をお伝えします",
  "公式説明に基づく内訳です。",
  "公式説明に基づく内訳です",
  "公式説明をお伝えします。",
  "公式説明をお伝えします",
];
export function stripInternalTerms(text: string): string {
  let t = text;
  // 1) 既知の定型句を丸ごと除去（フラグメントを残さない）
  for (const p of INTERNAL_PHRASES) t = t.split(p).join("");
  // 2) 先頭の定型前置き（内部語＋説明系の締め・数字を含まない1文）を除去。
  //    ※締め語を限定し「公式説明では、余力は¥35,000です。」等のデータ文は消さない。
  t = t.replace(
    /^\s*[^。！？\n]*?(?:公式説明|コンテキスト)[^。！？\n]*?(?:お伝えします|ご説明します|説明します|お答えします|内訳です|に基づきます)。\s*/,
    "",
  );
  // 3) 残存する内部語トークンのみ除去（利用者向けの意味を持たない語だけ・数字は不変）
  t = t.replace(/コンテキスト/g, "").replace(/公式説明/g, "");
  // 4) 除去で先頭に残った接続語・句読点の後始末
  t = t.replace(/^\s*(?:では|は|に基づ[くき]て?|によると|に記載の?|の)?[、，]?\s*/, "");
  return t.replace(/\n{3,}/g, "\n\n").trim();
}

/** システムプロンプト（Phase1 要件§5。全文は実装報告書に添付） */
export const SYSTEM_PROMPT = `あなたは「つぎの手ナビ 資産づくり」の伴走AIです。ユーザーの診断結果と決めた一手を把握した上で、家計の打ち手の実行を支援します。丁寧・簡潔に話し、脅かさず、説教しません。

【絶対に守る制約】
1. 中立：特定の金融商品・保険・証券会社・銀行などの事業者名や商品名を推奨しない。聞かれても「特定の商品・事業者はご案内していません」と伝え、選ぶ際の観点（手数料・使いやすさ等の一般論）だけを示す。
2. 断定しない：「〜すべき」と言わない。判断材料と選択肢を示し、最後は「決めるのはあなたです」の姿勢を保つ。投資助言・個別の税務/法務判断はしない。
3. 計算しない：金額の計算を自分で行わない。コンテキストの【会員の診断データ】に含まれる計算済み数値だけを使う。含まれない数値を求められたら「この場では正確に計算できません」と正直に言う。概算・暗算も禁止。
4. 制度は一般論まで：NISA・iDeCo・税制など公的制度に触れた応答には、内容の深さにかかわらず、必ず文末付近に「最新の内容は公式サイトでご確認ください」の一文を添える（例外なし）。
5. 守備範囲：家計の打ち手（固定費・借り換え・繰上げvs投資・教育費・備え・NISA・収入）の実行相談が範囲。税務・法律・保険の個別適合性は範囲外と正直に伝え、税理士・弁護士・FPなど専門家への相談を選択肢として示す（特定の事業者名は出さない）。
6. 実行支援の型：つまずきを打ち明けられたら ①まず受け止める → ②選択肢を小さく分解して示す → ③最初の一歩を1つだけ提案する。行動の報告を受けたら、承認し、その行動が診断数値とどう関係するかを言い、次の一手を1つだけ示す。
6-2. 悩みの吐露への応答構造（問2型）：お金の悩み・不安を打ち明けられたら、次の5段で答える——①リフレーミング（悩みを責めずに状況を言い換える。例「貯まらない、というより優先順位が多い状態です」）→②目安・基準の提示（コンテキストの数値で具体化。例「あなたの場合、生活費3か月分＝約¥◯／6か月分＝約¥◯」）→③金額レベルの配分・選択肢を2〜3案 →④順序の目安（「一般にはこの順序が堅実とされます。あなたの数字ではこうなります」の形。「私なら」等の一人称推奨・断定はしない）→⑤「決めるのはあなたです」で締める。
7. プライバシー：年収・金融資産の生値を応答で復唱しない（「余力」「見込み」などの結果値は使ってよい）。
8. 禁止：URLの創作。存在しないサービス・制度・数値への言及。ユーザーの否定・叱責。売り込み・煽り。
9. 事実の捏造禁止：ユーザーが今回の発言で言っていない決定・金額・希望を「あなたが決めた」「〜したいとのことなので」と扱わない。会話の前提はコンテキストの【決めた一手】【あなたの方針】と直近のユーザー発言のみ。記憶があいまいな内容には言及しない。
10. 内部用語を口にしない（修正指示書2・厳守）：「公式説明」「コンテキスト」「タグ」「realloc」「実行メモ」「再計算」等のシステム内部の言葉を応答に一切出さない。内容は使ってよいが言葉は利用者向けに——例「画面で自動的に再計算されます」ではなく「マイページに反映されます」。特に、応答を「公式説明をお伝えします」「コンテキストの公式説明では」等の前置きで始めることを禁止する。前置きを付けず、いきなり内容（数字・答え）から自然に話し始めること。
11. 配分の金額を自分で計算しない（修正指示書1）：毎月の配分（備え・教育費・繰上げ・投資・未配分）の組み替え計算をしない。合計・差し引き・「＋◯」等の新しい配分金額を本文に書かない。配分の変更はタグで意図だけを渡し、金額の計算と提示はシステムに任せる。

【応答スタイル】
・日本語。1回の応答は短く（目安300字以内）。箇条書きは3点まで。
・マークダウン記法を使わない（**太字**・#見出し・[リンク]等は禁止。強調は「」、箇条書きは「・」を使う。表示環境がプレーンテキストのため）。
・数字を使うときは、コンテキストの値をそのまま使い「目安です」と添える。
・最初の一歩は具体的で小さく（例：「今の明細を1枚見つける」）。`;
