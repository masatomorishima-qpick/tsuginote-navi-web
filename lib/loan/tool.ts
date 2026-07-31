/**
 * lib/loan/tool.ts — 住宅ローン計算ツールの共有コード（2026-07-31 新設）
 *
 * ここに置く理由：
 *   モードや金利タイプの「保存用コード」を、クライアント（LoanCalculator）と
 *   サーバー（/api/shisan/loan-tool）の両方から同じ定義で参照するため。
 *   どちらか一方に書くと、片側だけ直したときに保存値がずれる。
 *
 * 保存値に日本語ラベルを使わない理由（2026-07-31 masato 決定）：
 *   画面のラベルは将来変わりうる（「変動」→「変動金利」など）。ラベルをそのまま
 *   保存すると、変えた瞬間に過去データと繋がらなくなる。表示と保存を分離し、
 *   保存側は安定コードで固定する。mode を2値に固定したのと同じ理由。
 */

/** ツールのモード。DB の check 制約（mode in ('karikae','kuriage')）と一致させること。 */
export const TOOL_MODE = {
  /** 借り換え・金利モード（既存・デフォルト） */
  KARIKAE: 'karikae',
  /** 繰り上げ返済モード（2026-07-31 追加） */
  KURIAGE: 'kuriage',
} as const;
export type ToolMode = (typeof TOOL_MODE)[keyof typeof TOOL_MODE];

/** 金利タイプの保存用コード。画面表示は日本語ラベルのままで、保存だけこの値に変換する。 */
export const RATE_TYPE_CODE = {
  HENDO: 'hendo',
  KOTEI: 'kotei',
} as const;
export type RateTypeCode = (typeof RATE_TYPE_CODE)[keyof typeof RATE_TYPE_CODE];

/**
 * 画面ラベル → 保存用コード。
 * GA4 は既存レポートの連続性のため日本語ラベルのまま送り続ける（masato 決定）。
 * したがって「GA4＝変動/固定」「DB＝hendo/kotei」の対応で運用する。
 */
export function rateTypeCodeOf(label: string): RateTypeCode {
  return label === '固定' ? RATE_TYPE_CODE.KOTEI : RATE_TYPE_CODE.HENDO;
}

/** モードとして妥当な値かを判定する（API 側の検証用）。 */
export function isToolMode(v: unknown): v is ToolMode {
  return v === TOOL_MODE.KARIKAE || v === TOOL_MODE.KURIAGE;
}

/**
 * GA4 の result パラメータの語彙。
 * mode でスライスしてから見る前提なので、モードごとに語彙が違っても衝突しない。
 * （繰り上げモードの 'full' は「一括返済を考えている層の規模」を測る観測データ）
 */
export const CALC_RESULT = {
  /** 既存モード：費用を引いても得 */
  PLUS: 'plus',
  /** 既存モード：費用のほうが上回る */
  MINUS: 'minus',
  /** 繰り上げモード：正常に計算できた */
  OK: 'ok',
  /** 繰り上げモード：繰り上げ額が残高以上＝全額返済の案内を表示した */
  FULL: 'full',
  /** 両モード共通：入力が足りず計算できない */
  INVALID: 'invalid',
} as const;
export type CalcResult = (typeof CALC_RESULT)[keyof typeof CALC_RESULT];
