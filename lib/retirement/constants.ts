/**
 * lib/retirement/constants.ts — 退職金・年金ツールの制度定数（年次改定でここだけを直す）
 *
 * 2026-08-04 新設（退職金ツール v2.0 指示書2-6）。
 *
 * 2026-08-05（v2.1a 指示書2-4）：持ち越していた速算表・控除・税率をここへ集約した。
 * v2.0 の版では「繰下げ受給の増額率」だけを置き、速算表の集約は v2.1 に持ち越していた
 * （v1 の計算経路に触れると v1 出力の同一性を脅かすため）。今回、集約の前後で
 * comparePlans / pensionStartComparison の全戻り値を JSON で機械比較し、
 * 1円も動かないことを確認したうえで移している（基準ケース＋境界値9パターン）。
 *
 * 丸めの処理も、値ではなく関数としてこのファイルに集約する（指示書2-4）。
 * 丸めの原則（2026-08-05 masato確定）：
 *   「画面に出す値は、出す粒度で丸め、丸めた値を計算にも使う。画面に出さない中間値は丸めない。」
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

/* =====================================================================
 * 税・社会保険の制度定数（2026-08-05・v2.1a 指示書2-4 で taishokukin.ts から集約）
 *
 * 出典は記事9の出典欄（国税庁 タックスアンサー No.1420 / No.1600 /
 * 確定申告の手引き「公的年金等に係る雑所得の速算表」/「所得税の税率」）。
 * 税制改正時はこのファイルだけを更新する（年式運用の共通資産）。
 * ===================================================================== */

/** 退職所得控除（国税庁 No.1420）。勤続年数は1年未満切り上げ済みの整数を渡す前提。 */
export const TAISHOKU_KOJO = {
  /** 勤続20年以下の1年あたり */
  PER_YEAR_UNDER20: 400_000,
  /** 勤続20年超の1年あたり（20年を超えた分に適用） */
  PER_YEAR_OVER20: 700_000,
  /** 勤続20年超の基礎額（40万円×20年） */
  BASE_OVER20: 8_000_000,
  /** 最低保障額 */
  MIN: 800_000,
  /** 20年以下／20年超の境界 */
  BOUNDARY_YEARS: 20,
} as const;

/** 所得税の速算表（復興特別所得税を含まない・国税庁「所得税の税率」）。
 *  upTo は「その課税所得以下」の上限。40%・45% の2区分は、入力上限（退職金1億・勤続1年）で
 *  課税退職所得が約4,960万円に達しうるため 2026-08-03 に追加した（masato承認）。 */
export const INCOME_TAX_BRACKETS = [
  { upTo: 1_950_000, rate: 0.05, deduct: 0 },
  { upTo: 3_300_000, rate: 0.10, deduct: 97_500 },
  { upTo: 6_950_000, rate: 0.20, deduct: 427_500 },
  { upTo: 9_000_000, rate: 0.23, deduct: 636_000 },
  { upTo: 18_000_000, rate: 0.33, deduct: 1_536_000 },
  { upTo: 40_000_000, rate: 0.40, deduct: 2_796_000 },
  { upTo: Number.POSITIVE_INFINITY, rate: 0.45, deduct: 4_796_000 },
] as const;

/** 復興特別所得税（2.1%）を含めるための倍率。所得税額に掛ける。 */
export const FUKKO_MULTIPLIER = 1.021;

/** 公的年金等控除後の雑所得を求める速算表（収入1,000万円以下・他の所得1,000万円以下の場合）。
 *  65歳未満／65歳以上で定額部分の扱いが変わる。 */
export const PENSION_KOJO = {
  /** 65歳以上：この収入までは雑所得0。これを超え TIER_OVER65_LIMIT 未満はこの額を差し引く */
  FLAT_OVER65: 1_100_000,
  /** 65歳以上で定額を差し引く上限 */
  TIER_OVER65_LIMIT: 3_300_000,
  /** 65歳未満：この収入までは雑所得0 */
  FLAT_UNDER65: 600_000,
  /** 65歳未満で定額を差し引く上限 */
  FLAT_UNDER65_LIMIT: 1_300_000,
  /** 定額部分を超えたあとの比例区分（収入が under 未満のとき rate を掛けて deduct を引く） */
  TIERS: [
    { under: 4_100_000, rate: 0.75, deduct: 275_000 },
    { under: 7_700_000, rate: 0.85, deduct: 685_000 },
    { under: 10_000_000, rate: 0.95, deduct: 1_455_000 },
  ],
  /** 収入1,000万円以上のとき収入から差し引く額 */
  OVER_10M_DEDUCT: 1_955_000,
} as const;

/** 基礎控除（このツールは基礎控除のみで計算する。社会保険料控除・配偶者控除は含めない）。 */
export const BASIC_DEDUCTION = {
  INCOME_TAX: 480_000,
  RESIDENT_TAX: 430_000,
} as const;

/** 住民税の率（一律10%。均等割は含めない）。 */
export const RESIDENT_TAX_RATE = 0.10;

/** 国民健康保険料・介護保険料の目安率。
 *  法令に定められた率ではなく、当サイトが用いている概算の率（記事9・記事12の注記で開示）。 */
export const SHAHO_RATE = 0.10;

/* ===== 丸めの処理（値ではなく関数としてここに集約する・指示書2-4） ===== */

/** 課税標準の千円未満切捨て（国税通則法118条1項・地方税法20条の4の2第1項）。負の値は0にする。 */
export function floorToThousand(value: number): number {
  return Math.floor(Math.max(0, value) / 1000) * 1000;
}

/** 1円未満の切捨て（所得税額に復興特別所得税を乗じた後に適用する）。 */
export function floorToYen(value: number): number {
  return Math.floor(value);
}

/** 円への四捨五入（画面に円で出す値は、この関数で丸めてから計算にも使う）。 */
export function roundToYen(value: number): number {
  return Math.round(value);
}

/** 百円単位の端数処理（50円未満切捨て・50円以上100円未満は100円に切上げ）。
 *  厚生年金保険法44条2項・同附則60条2項の端数規定。v2.1b（加給年金）で使う。 */
export function roundToHundred(value: number): number {
  return Math.round(value / 100) * 100;
}
