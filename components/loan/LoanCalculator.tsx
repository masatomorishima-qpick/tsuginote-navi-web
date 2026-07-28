"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { track } from "@/lib/shisan/track";
import { manOku, manHint } from "@/lib/shisan/format";
import { yen, refinance, REFI_BASE, FLAT35_RATE } from "@/lib/shisan/calc";
import { refinanceTo, breakEvenVariableRate, paymentAtRate } from "@/lib/loan/refi";

/**
 * 住宅ローン専用の計算ツール（2026-07-29 新設）
 *
 * 位置づけ：記事の中で完結させるための軽量ツール。/shisan（家計全体の診断）は
 * 年収・資産・生活費まで聞くため、借り換えを調べに来た人には摩擦が大きすぎる。
 * ここで聞くのは4項目だけで、年収・資産・生活費は聞かない。
 *
 * 計算について（重要）：
 *   数値はすべて lib/shisan/calc.ts の計算エンジン由来。このファイルでは
 *   金利や返済額の式を新たに書いていない。記事の表・/shisan の診断・このツールの
 *   3者で数字が一致する状態を保つため。
 *
 * 判定の考え方（masato の決定・2026-07-29）：
 *   「借り換えて安くなるか」と「固定に変えるべきか」は別の問いなので、判定を2つに分ける。
 *   ・借り換え → 費用を引いた正味の正負で**断定する**（計算で白黒がつくため）
 *   ・固定化   → **断定しない**。分岐点と現在金利の差を示すにとどめる。
 *              判断を分けるのは金利がどこまで上がるかではなく「上がったときに家計が
 *              耐えられるか」であり、家計の情報は入力されていないため断定できない。
 *              ただし残り年数が短い場合の不利は計算で言えるので補足する。
 *
 * サーバー出力への影響：
 *   このコンポーネントはクライアント側で動くが、記事の本文・表・数値は
 *   従来どおりサーバーでHTMLとして出力される（JSを実行しないクローラー対策）。
 */

/** 残り年数がこれ以下なら「固定への切り替えはメリットが出にくい」と補足する。
 *  記事3の分岐（残り10年前後で費用倒れ）に合わせている。 */
const SHORT_YEARS = 10;

/** 極端な入力の目安（非ブロッキング警告のしきい値）。計算は止めない。 */
const MAX_BALANCE = 300_000_000;
const MAX_YEARS = 50;
const MAX_RATE = 10;

type RateType = "変動" | "固定";

const inputCls =
  "w-full px-3 py-2.5 border border-slate-200 rounded-xl text-[15px] focus:outline-none focus:ring-2 focus:ring-emerald-600";
const labelCls = "block text-[13px] font-semibold mt-3 mb-1 text-slate-700";
const hintCls = "font-normal text-slate-400 text-xs";
const chipCls = "px-4 py-2 rounded-full text-sm font-semibold border transition";
const btnCls =
  "w-full mt-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-base font-bold transition";
const rowCls = "flex items-baseline justify-between gap-3 border-t border-slate-200 py-2";

function digits(v: string) {
  return v.replace(/[^\d]/g, "");
}
function comma(v: string) {
  const d = digits(v);
  return d ? Number(d).toLocaleString("ja-JP") : "";
}
/** 金利は小数を許す */
function rateDigits(v: string) {
  return v.replace(/[^\d.]/g, "").replace(/(\..*)\./g, "$1");
}

export default function LoanCalculator({ articlePath }: { articlePath: string }) {
  const [bal, setBal] = useState("30000000");
  const [years, setYears] = useState("20");
  const [rate, setRate] = useState("1.5");
  const [type, setType] = useState<RateType>("変動");
  const [submitted, setSubmitted] = useState(false);

  // 表示イベントは1回だけ（StrictMode の二重実行で2件送られないようにする）
  const viewed = useRef(false);
  useEffect(() => {
    if (viewed.current) return;
    viewed.current = true;
    track("shisan_loan_tool_view", { article_path: articlePath });
  }, [articlePath]);

  const B = Number(digits(bal) || 0);
  const Y = Number(digits(years) || 0);
  const R = Number(rateDigits(rate) || 0);

  const warn = useMemo(() => {
    const msgs: string[] = [];
    if (B <= 0) msgs.push("残高が入力されていません。");
    else if (B > MAX_BALANCE) msgs.push("残高が大きすぎるようです。単位（円）をご確認ください。");
    if (Y <= 0) msgs.push("残りの返済年数が0年になっています。");
    else if (Y > MAX_YEARS) msgs.push("残りの返済年数が長すぎるようです。");
    if (R <= 0) msgs.push("金利が0%になっています。");
    else if (R > MAX_RATE) msgs.push("金利が高すぎるようです。単位（%）をご確認ください。");
    return msgs;
  }, [B, Y, R]);

  const calc = useMemo(() => {
    if (B <= 0 || Y <= 0) return null;

    // ② より低い変動（基準金利）へ借り換えた場合。calc.ts の refinance() をそのまま使う。
    const refi = refinance(B, R, Y);
    // ③ 固定（フラット35）へ切り替えた場合
    const toFixed = refinanceTo(B, R, Y, FLAT35_RATE);
    const breakEven = breakEvenVariableRate(B, Y);
    // ① このまま金利が上がった場合
    const now = paymentAtRate(B, Y, R);
    const up1 = paymentAtRate(B, Y, R + 1);
    const up2 = paymentAtRate(B, Y, R + 2);
    if (!refi || !toFixed || breakEven === null || now === null || up1 === null || up2 === null) return null;

    const refiNet = refi.dInterest - refi.cost;
    return { refi, refiNet, toFixed, breakEven, now, up1, up2 };
  }, [B, Y, R]);

  const onSubmit = () => {
    setSubmitted(true);
    // 副作用は setState の外で行う（StrictMode の二重実行を避けるため）
    track("shisan_loan_tool_calc", {
      article_path: articlePath,
      rate_type: type,
      result: calc ? (calc.refiNet > 0 ? "plus" : "minus") : "invalid",
    });
    /* 将来ここに入力値の保存（残高・残年数・金利・金利タイプ）を差し込む。
     * 利用実態を見てから判断するため、今回は実装しない。
     * 実装する場合は /shisan と同じく best-effort（fire-and-forget・keepalive）にし、
     * 失敗しても画面には影響させないこと。 */
  };

  const show = submitted && calc;

  return (
    <div className="my-6 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 sm:p-5">
      <h3 className="text-[17px] font-bold text-slate-900">自分の数字で計算する</h3>
      <p className="mt-1 text-[13px] leading-relaxed text-slate-600">
        住宅ローンの4項目だけで計算します。年収・資産・生活費はお聞きしません。
      </p>

      {/* ===== 入力 ===== */}
      <div className="mt-3">
        <label className={labelCls}>
          住宅ローンの残高 <span className={hintCls}>円</span>
          <input
            type="text"
            inputMode="numeric"
            className={inputCls}
            value={comma(bal)}
            onChange={(e) => setBal(digits(e.target.value))}
            placeholder="30,000,000"
          />
          {manHint(bal) && (
            <span className="mt-0.5 block text-[11px] font-semibold text-emerald-700">{manHint(bal)}</span>
          )}
        </label>

        <div className="flex gap-3">
          <div className="flex-1">
            <label className={labelCls}>
              残りの返済年数 <span className={hintCls}>年</span>
              <input
                type="text"
                inputMode="numeric"
                className={inputCls}
                value={years}
                onChange={(e) => setYears(digits(e.target.value))}
                placeholder="20"
              />
            </label>
          </div>
          <div className="flex-1">
            <label className={labelCls}>
              現在の金利 <span className={hintCls}>%</span>
              <input
                type="text"
                inputMode="decimal"
                className={inputCls}
                value={rate}
                onChange={(e) => setRate(rateDigits(e.target.value))}
                placeholder="1.5"
              />
            </label>
          </div>
        </div>

        <div className={labelCls}>金利タイプ</div>
        <div className="flex gap-2">
          {(["変動", "固定"] as RateType[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`${chipCls} ${
                type === t
                  ? "border-emerald-600 bg-emerald-600 text-white"
                  : "border-slate-300 bg-white text-slate-700"
              }`}
            >
              {t}金利
            </button>
          ))}
        </div>

        {warn.length > 0 && (
          <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-[12px] leading-relaxed text-amber-800">
            {warn.map((m) => (
              <p key={m}>{m}</p>
            ))}
          </div>
        )}

        <button type="button" className={btnCls} onClick={onSubmit}>
          計算する
        </button>
      </div>

      {/* ===== 結果 ===== */}
      {submitted && !calc && (
        <p className="mt-4 text-[14px] font-semibold text-amber-800">
          残高と残りの返済年数を入力すると計算できます。
        </p>
      )}

      {show && type === "変動" && (
        <div className="mt-5 space-y-4">
          {/* ① このまま金利が上がったら */}
          <section className="rounded-xl bg-white p-4">
            <h4 className="text-[15px] font-bold text-slate-900">① このまま変動で、金利が上がったら</h4>
            <div className="mt-2 text-[14px] text-slate-700">
              <div className={rowCls}>
                <span>いまの毎月の返済</span>
                <span className="font-bold">{yen(calc.now)}円</span>
              </div>
              <div className={rowCls}>
                <span>金利が+1%（{(R + 1).toFixed(2)}%）</span>
                <span className="font-bold">
                  {yen(calc.up1)}円<span className="ml-1 text-[13px] text-slate-500">（+{yen(calc.up1 - calc.now)}円）</span>
                </span>
              </div>
              <div className={rowCls}>
                <span>金利が+2%（{(R + 2).toFixed(2)}%）</span>
                <span className="font-bold">
                  {yen(calc.up2)}円<span className="ml-1 text-[13px] text-slate-500">（+{yen(calc.up2 - calc.now)}円）</span>
                </span>
              </div>
            </div>
          </section>

          {/* ② より低い変動へ借り換えたら（＝この記事群の主題） */}
          <section className="rounded-xl bg-white p-4">
            <h4 className="text-[15px] font-bold text-slate-900">
              ② より低い変動（年{REFI_BASE.toFixed(1)}%）へ借り換えたら
            </h4>
            <div className="mt-2 text-[14px] text-slate-700">
              <div className={rowCls}>
                <span>毎月の返済</span>
                <span className="font-bold">
                  {calc.refi.dMonthly > 0 ? `${yen(calc.refi.dMonthly)}円 軽くなる` : "変わらない"}
                </span>
              </div>
              <div className={rowCls}>
                <span>総支払額</span>
                <span className="font-bold">
                  {calc.refi.dInterest > 0 ? `約${manOku(calc.refi.dInterest)}円 減る` : "変わらない"}
                </span>
              </div>
              <div className={rowCls}>
                <span>借り換え費用の概算</span>
                <span className="font-bold">約{manOku(calc.refi.cost)}円</span>
              </div>
            </div>
            {/* 判定：計算で白黒がつくので断定する */}
            {calc.refiNet > 0 ? (
              <p className="mt-3 rounded-lg bg-emerald-100 p-3 text-[14px] font-bold leading-relaxed text-emerald-900">
                費用を引いても、約{manOku(calc.refiNet)}円のメリットが見込めます。
              </p>
            ) : (
              <p className="mt-3 rounded-lg bg-slate-100 p-3 text-[14px] font-bold leading-relaxed text-slate-800">
                費用のほうが上回ります。
                {R <= REFI_BASE && (
                  <span className="block font-normal">
                    いまの金利は借り換えの水準（年{REFI_BASE.toFixed(1)}%）と同じか、それより低い水準です。
                  </span>
                )}
              </p>
            )}
            {/* 送客枠：提携先が決まったらここにリンクを置く。決まるまでは何も出さない（「準備中」も出さない）。 */}
          </section>

          {/* ③ 固定へ切り替えたら（断定しない） */}
          <section className="rounded-xl bg-white p-4">
            <h4 className="text-[15px] font-bold text-slate-900">
              ③ 固定（フラット35 年{FLAT35_RATE}%）へ切り替えたら
            </h4>
            <div className="mt-2 text-[14px] text-slate-700">
              <div className={rowCls}>
                <span>毎月の返済</span>
                <span className="font-bold">{yen(Math.abs(calc.toFixed.dMonthlySigned))}円 {calc.toFixed.dMonthlySigned >= 0 ? "増える" : "軽くなる"}</span>
              </div>
              <div className={rowCls}>
                <span>総支払額</span>
                <span className="font-bold">
                  約{manOku(Math.abs(calc.toFixed.dTotalSigned))}円 {calc.toFixed.dTotalSigned >= 0 ? "増える" : "減る"}
                </span>
              </div>
              <div className={rowCls}>
                <span>損益分岐となる変動金利</span>
                <span className="font-bold">年{calc.breakEven.toFixed(2)}%</span>
              </div>
            </div>
            <p className="mt-3 rounded-lg bg-slate-100 p-3 text-[14px] leading-relaxed text-slate-800">
              変動が<b className="font-bold">年{calc.breakEven.toFixed(2)}%</b>まで上がってそれが完済まで続く場合に、いま固定にしたほうが総支払額は少なくなります。現在の金利との差は
              <b className="font-bold">{Math.max(0, calc.breakEven - R).toFixed(2)}%</b>です。
              この差をどう見るかは、金利が上がったときに家計が耐えられるかで判断してください。
              {Y <= SHORT_YEARS && (
                <span className="mt-2 block">
                  残り{Y}年では、固定に切り替えるメリットは出にくくなります。
                </span>
              )}
            </p>
          </section>
        </div>
      )}

      {show && type === "固定" && (
        <div className="mt-5">
          <section className="rounded-xl bg-white p-4">
            <h4 className="text-[15px] font-bold text-slate-900">
              いまの水準（年{REFI_BASE.toFixed(1)}%）へ借り換えたら
            </h4>
            <div className="mt-2 text-[14px] text-slate-700">
              <div className={rowCls}>
                <span>毎月の返済</span>
                <span className="font-bold">
                  {calc.refi.dMonthly > 0 ? `${yen(calc.refi.dMonthly)}円 軽くなる` : "変わらない"}
                </span>
              </div>
              <div className={rowCls}>
                <span>総支払額</span>
                <span className="font-bold">
                  {calc.refi.dInterest > 0 ? `約${manOku(calc.refi.dInterest)}円 減る` : "変わらない"}
                </span>
              </div>
              <div className={rowCls}>
                <span>借り換え費用の概算</span>
                <span className="font-bold">約{manOku(calc.refi.cost)}円</span>
              </div>
            </div>
            {calc.refiNet > 0 ? (
              <p className="mt-3 rounded-lg bg-emerald-100 p-3 text-[14px] font-bold leading-relaxed text-emerald-900">
                費用を引いても、約{manOku(calc.refiNet)}円のメリットが見込めます。
              </p>
            ) : (
              <p className="mt-3 rounded-lg bg-slate-100 p-3 text-[14px] font-bold leading-relaxed text-slate-800">
                費用のほうが上回ります。
                {R <= REFI_BASE && (
                  <span className="block font-normal">
                    いまの金利は借り換えの水準（年{REFI_BASE.toFixed(1)}%）と同じか、それより低い水準です。
                  </span>
                )}
              </p>
            )}
            {/* 送客枠：提携先が決まったらここにリンクを置く。 */}
          </section>
        </div>
      )}

      <p className="mt-4 text-[12px] leading-relaxed text-slate-500">
        毎月の返済額が一定になる返し方（元利均等返済）・ボーナス払いなしで計算した目安です。借り換え費用は事務手数料・登録免許税・司法書士報酬などの概算で、実際の金額は金融機関によって異なります。特定の金融機関・金融商品を推奨するものではありません。
      </p>
    </div>
  );
}
