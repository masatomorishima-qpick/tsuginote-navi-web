/** hokenryo.ts ── 保険料の料率（順位づけ専用。**金額は画面に出さない**・§2の14） */
import { fdiv } from './zeisei';
export const KISO = 430_000;              // 賦課のもとになる金額を出すときの控除（住民税の基礎控除）
export const RITSU_75 = 1042;             // 10.42%（後期10.17% + 子ども分0.25%）厚労省 全国平均
export const RITSU_65 = 1106;             // 11.06%（12自治体の平均。公的な全国平均ではない）
export const RITSU_UNDER65 = 1360;        // 13.60%（同上）
export const GENDO_KOKUHO = 1_130_000;
export const GENDO_KOKI = 871_000;

/** 年齢に応じた所得割率（万分率）と賦課限度額 */
export function ritsu(age: number): [number, number] {
  if (age >= 75) return [RITSU_75, GENDO_KOKI];
  if (age >= 65) return [RITSU_65, GENDO_KOKUHO];
  return [RITSU_UNDER65, GENDO_KOKUHO];
}
/** その年の所得割（概算）。退職所得は含めない */
export function nenkan(age: number, sougouShotoku: number): number {
  const [r, gendo] = ritsu(age);
  const base = Math.max(0, Math.trunc(sougouShotoku) - KISO);
  return Math.min(gendo, fdiv(base * r, 10000));
}
