/**
 * lib/retirement/constants.ts — 退職金・年金ツールの制度定数（年次改定でここだけを直す）
 *
 * 2026-08-04 新設（退職金ツール v2.0 指示書2-6）。
 *
 * この版では「繰下げ受給の増額率」だけを集約する（v2.0指示書 Q1・masato確定 2026-08-04）。
 * 所得税・公的年金等控除の速算表は現状 lib/retirement/taishokukin.ts に実装があり、
 * それを移すと v1 の計算経路に触れて完了条件5（v1出力の完全同一）を脅かすため、
 * 速算表の集約は v2.1 に持ち越す（集約時は v1 全出力を集約前後で機械比較する）。
 */

/**
 * 老齢年金の繰下げ受給による増額率。
 * 増額率 = 0.7% × 繰り下げた月数（65歳0か月を起点）。上限は75歳（120か月＝+84%）。
 *
 * 出典：日本年金機構「年金の繰下げ受給」
 *   （https://www.nenkin.go.jp/service/jukyu/roureinenkin/kuriage-kurisage/20140421-02.html）
 * 改定年月：2022-04（繰下げの上限年齢が70歳→75歳に引き上げられ、最大+84%になった）。
 */
export const KURISAGE = {
  /** 起点年齢（この年齢からの繰下げ月数で増額を計算する） */
  BASE_AGE: 65,
  /** 繰下げ上限年齢（これより後には繰り下げられない） */
  MAX_AGE: 75,
  /** 1か月あたりの増額率 */
  RATE_PER_MONTH: 0.007,
  /** 増額率の上限（75歳＝120か月＝0.7%×120＝+84%） */
  MAX_INCREASE: 0.84,
} as const;

/**
 * 老齢年金の受給開始年齢の比較対象（v2.0は65/70/75の3点固定・入力は増やさない）。
 * 66〜74歳の任意開始は扱わない（v2.0指示書2-1）。
 */
export const PENSION_START_AGES = [65, 70, 75] as const;

/**
 * 生涯手取りの比較で並べる想定寿命（v2.0は80/85/90/95の4本固定・入力は増やさない）。
 * 「想定寿命まで inclusive」＝その年齢まで受け取った場合の合計（例：80歳＝60〜80歳の21年分）。
 */
export const LIFESPANS = [80, 85, 90, 95] as const;

/** 繰下げ後の増額率（倍率）。65歳=1.0、70歳=1.42、75歳=1.84（上限）。 */
export function kurisageMultiplier(startAge: number): number {
  const months = Math.max(0, (startAge - KURISAGE.BASE_AGE) * 12);
  const increase = Math.min(KURISAGE.RATE_PER_MONTH * months, KURISAGE.MAX_INCREASE);
  return 1 + increase;
}
