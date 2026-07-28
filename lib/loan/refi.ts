/**
 * lib/loan/refi.ts
 *
 * /loan の計算ツール用の薄いラッパ（2026-07-29 新設）。
 *
 * 方針（重要）：
 *   **新しい計算式は書かない。** ここにあるのは、lib/shisan/calc.ts が export している
 *   loanPayment / totalInterest / REFI_COST_* を組み替えているだけである。
 *   記事・/shisan の診断・このツールの3者で数字が一致する状態を保つのが目的。
 *
 * なぜラッパが要るか：
 *   calc.ts の refinance() は借り換え先の金利が REFI_BASE(1.0%) に固定されており、
 *   引数で変えられない。「固定（フラット35 3.14%）に切り替えたら」を出すには
 *   目標金利を指定できる形が必要になるため、同じ部品で組み直している。
 *   目標金利に REFI_BASE を渡した場合、refinance() と完全に同じ値になる
 *   （lib/loan/__checks__ ではなく、実機検証で突き合わせ済み）。
 */

import {
  loanPayment,
  totalInterest,
  REFI_COST_RATE,
  REFI_COST_FIXED,
  REFI_BASE,
  FLAT35_RATE,
} from "@/lib/shisan/calc";

/** 借り換え諸費用の概算（calc.ts の refinance() と同じ式）。 */
export function refiCost(balanceYen: number): number {
  return Math.round(balanceYen * REFI_COST_RATE + REFI_COST_FIXED);
}

export interface RefiTo {
  /** 現在の毎月返済額 */
  mNow: number;
  /** 借り換え後の毎月返済額 */
  mNew: number;
  /** 毎月の差（借り換え後 − 現在。プラスなら増える） */
  dMonthlySigned: number;
  /** 総支払額の差（借り換え後 − 現在。プラスなら増える） */
  dTotalSigned: number;
  /** 諸費用の概算 */
  cost: number;
  /** 費用を引いた正味メリット（プラスなら得） */
  netBenefit: number;
}

/**
 * 目標金利を指定した借り換え試算。
 * calc.ts の refinance() と同じ部品・同じ費用式で組み立てている。
 *
 * 返り値の符号の約束：
 *   dMonthlySigned / dTotalSigned は「借り換え後 − 現在」。
 *   金利が下がる借り換えならマイナス（＝減る）、固定への切り替えならプラス（＝増える）になる。
 *   refinance() は「減る額」を正で返す仕様だが、固定への切り替えでは増えるケースが
 *   主役になるため、ここでは符号付きで持つ。
 */
export function refinanceTo(
  balanceYen: number,
  currentRate: number,
  years: number,
  targetRate: number,
): RefiTo | null {
  if (balanceYen <= 0 || years <= 0) return null;
  const mNow = loanPayment(balanceYen, currentRate, years);
  const mNew = loanPayment(balanceYen, targetRate, years);
  const dTotalSigned = totalInterest(balanceYen, targetRate, years) - totalInterest(balanceYen, currentRate, years);
  const cost = refiCost(balanceYen);
  return {
    mNow,
    mNew,
    dMonthlySigned: mNew - mNow,
    dTotalSigned,
    cost,
    // 総支払が減った分から費用を引く（減っていなければマイナスになる）
    netBenefit: -dTotalSigned - cost,
  };
}

/**
 * 「いま固定に切り替える」と「変動のまま」が並ぶ変動金利（損益分岐点）。
 *
 * 定義：変動のまま完済したときの総利息が、固定へ切り替えたときの総利息＋諸費用と等しくなる金利。
 * これより上まで変動が上がって完済まで続くなら、いま固定にしたほうが総支払額は少なくなる。
 *
 * 既存に実装はないため二分探索で求める。使うのは totalInterest と費用定数のみ。
 * 公開済みの記事1の分岐点（残20年で3.38% 等）と一致することを確認済み。
 */
export function breakEvenVariableRate(
  balanceYen: number,
  years: number,
  fixedRate: number = FLAT35_RATE,
): number | null {
  if (balanceYen <= 0 || years <= 0) return null;
  const target = totalInterest(balanceYen, fixedRate, years) + refiCost(balanceYen);
  let lo = 0;
  let hi = 20;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    if (totalInterest(balanceYen, mid, years) > target) hi = mid;
    else lo = mid;
  }
  return (lo + hi) / 2;
}

/** 金利が上がったときの毎月返済額（変動のまま据え置いた場合）。 */
export function paymentAtRate(balanceYen: number, years: number, ratePct: number): number | null {
  if (balanceYen <= 0 || years <= 0) return null;
  return loanPayment(balanceYen, ratePct, years);
}

export { REFI_BASE, FLAT35_RATE };
