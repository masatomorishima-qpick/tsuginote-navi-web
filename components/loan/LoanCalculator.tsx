"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { track } from "@/lib/shisan/track";
import { manOku, manHint } from "@/lib/shisan/format";
import { yen, refinance, REFI_BASE, FLAT35_RATE } from "@/lib/shisan/calc";
import { refinanceTo, breakEvenVariableRate, paymentAtRate } from "@/lib/loan/refi";
/* 2026-07-31 追加：繰り上げ返済モード。計算は lib/loan/prepay.ts（calc.ts の部品の組み替え）。 */
import { prepayShorten, prepayReduce, unpaidInterestLine, formatMonths, manDetail } from "@/lib/loan/prepay";
import { TOOL_MODE, CALC_RESULT, rateTypeCodeOf, type ToolMode } from "@/lib/loan/tool";
import Link from "next/link";

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

export default function LoanCalculator({
  articlePath,
  /* 2026-07-31 追加：初期表示のモード。記事6・7からは繰り上げ返済モードを初期表示にする。
   * 記事1〜5と /loan ハブは指定しないので従来どおり借り換え・金利モードのまま。 */
  defaultMode = TOOL_MODE.KARIKAE,
}: {
  articlePath: string;
  defaultMode?: ToolMode;
}) {
  const [bal, setBal] = useState("30000000");
  const [years, setYears] = useState("20");
  const [rate, setRate] = useState("1.5");
  const [type, setType] = useState<RateType>("変動");
  const [submitted, setSubmitted] = useState(false);
  const [mode, setMode] = useState<ToolMode>(defaultMode);
  const [prepay, setPrepay] = useState("1000000");

  /* 保存用の流入元・デバッグ判定。/shisan（AssetConciergeMvp）と同じ作り方に揃える。
   * 表示にもGAにも使わない（保存の付帯情報としてのみ使う）。 */
  const traffic = useRef<{ referrer: string; utmSource: string; utmMedium: string; utmCampaign: string; debug: boolean }>(
    { referrer: "", utmSource: "", utmMedium: "", utmCampaign: "", debug: false });
  useEffect(() => {
    if (typeof window === "undefined") return;
    const p = new URLSearchParams(window.location.search);
    traffic.current = {
      referrer: document.referrer || "",
      utmSource: p.get("utm_source") || "", utmMedium: p.get("utm_medium") || "", utmCampaign: p.get("utm_campaign") || "",
      debug: p.get("ga_debug") === "1" || p.get("debug") === "1",
    };
  }, []);

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

  /* ===== 繰り上げ返済モード（2026-07-31 追加） =====
   * 既存の calc には一切触れず、別の useMemo として持つ。
   * A ≥ P（全額返済）は計算せず、団信の終了と完済手数料の確認を促す案内に切り替える。 */
  const A = Number(digits(prepay) || 0);
  const isFullRepay = B > 0 && A >= B;

  const prepayCalc = useMemo(() => {
    if (B <= 0 || Y <= 0 || A <= 0 || A >= B) return null;
    const shorten = prepayShorten(B, R, Y, A);
    const reduce = prepayReduce(B, R, Y, A);
    const now = paymentAtRate(B, Y, R);
    if (!shorten || !reduce || now === null) return null;
    // 未払利息ライン：期間短縮型は返済額が変わらず残高だけ減るので上がる。
    // 返済額軽減型は返済額と残高が同じ割合で減るのでラインは動かない（記事6と同じ整理）。
    const lineNow = unpaidInterestLine(now, B);
    const lineAfter = unpaidInterestLine(now, B - A);
    // 参考表示：同じ資金を借り換えに使った場合の正味メリット（既存モードと同じ定数・同じ関数）。
    const refi = refinance(B, R, Y);
    const refiNet = refi ? refi.dInterest - refi.cost : null;
    return { shorten, reduce, now, lineNow, lineAfter, refiNet, zeroRate: R === 0 };
  }, [B, Y, R, A]);

  const onSubmit = () => {
    setSubmitted(true);
    // 副作用は setState の外で行う（StrictMode の二重実行を避けるため）
    /* result の語彙はモードごとに定義する（GA4 は必ず mode でスライスして見るため衝突しない）。
     *   借り換え・金利モード：plus / minus / invalid（従来どおり・変更しない）
     *   繰り上げ返済モード  ：ok / full / invalid（full＝全額返済の案内を出した回数） */
    const result =
      mode === TOOL_MODE.KURIAGE
        ? isFullRepay
          ? CALC_RESULT.FULL
          : prepayCalc
            ? CALC_RESULT.OK
            : CALC_RESULT.INVALID
        : calc
          ? calc.refiNet > 0
            ? CALC_RESULT.PLUS
            : CALC_RESULT.MINUS
          : CALC_RESULT.INVALID;

    track("shisan_loan_tool_calc", {
      article_path: articlePath,
      // GA4 は既存レポートの連続性のため日本語ラベルのまま送る（DB は hendo/kotei の安定コード）。
      rate_type: type,
      mode,
      result,
    });

    /* 入力の匿名保存（2026-07-31 追加）。
     * /shisan と同じ best-effort：fire-and-forget・keepalive・失敗は無音。
     * 保存が落ちても計算結果の表示には一切影響しない。個人情報は送らない。 */
    try {
      const t = traffic.current;
      fetch("/api/shisan/loan-tool", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        keepalive: true,
        body: JSON.stringify({
          mode,
          articlePath,
          balance: B,
          years: Y,
          rate: R,
          rateType: rateTypeCodeOf(type),
          prepayAmount: mode === TOOL_MODE.KURIAGE ? A : null,
          debug: t.debug,
          referrer: t.referrer,
          utmSource: t.utmSource,
          utmMedium: t.utmMedium,
          utmCampaign: t.utmCampaign,
        }),
      }).catch(() => { /* best-effort：失敗しても計算結果の表示に影響しない */ });
    } catch { /* fetch 自体の例外も無音 */ }
  };

  const show = submitted && calc;
  const showPrepay = submitted && mode === TOOL_MODE.KURIAGE;

  return (
    <div className="my-6 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 sm:p-5">
      <h3 className="text-[17px] font-bold text-slate-900">自分の数字で計算する</h3>
      {/* 2026-07-31：説明文をモードで出し分ける。繰り上げモードでは入力が1つ増えるため、
          「4項目だけ」のままだと画面の実態と食い違う。借り換え・金利モードの文は従来どおり。 */}
      <p className="mt-1 text-[13px] leading-relaxed text-slate-600">
        {mode === TOOL_MODE.KURIAGE
          ? "住宅ローンの4項目と繰り上げ額だけで計算します。年収・資産・生活費はお聞きしません。"
          : "住宅ローンの4項目だけで計算します。年収・資産・生活費はお聞きしません。"}
      </p>

      {/* ===== モード切替（2026-07-31 追加） ===== */}
      <div className="mt-3 flex gap-2">
        {([
          [TOOL_MODE.KARIKAE, "借り換え・金利"],
          [TOOL_MODE.KURIAGE, "繰り上げ返済"],
        ] as [ToolMode, string][]).map(([m, label]) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            aria-pressed={mode === m}
            className={`${chipCls} ${
              mode === m
                ? "border-emerald-600 bg-emerald-600 text-white"
                : "border-slate-300 bg-white text-slate-700"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

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

        {/* 繰り上げ額（繰り上げ返済モードのみ・追加する入力はこの1項目だけ） */}
        {mode === TOOL_MODE.KURIAGE && (
          <label className={labelCls}>
            繰り上げ返済する金額 <span className={hintCls}>円</span>
            <input
              type="text"
              inputMode="numeric"
              className={inputCls}
              value={comma(prepay)}
              onChange={(e) => setPrepay(digits(e.target.value))}
              placeholder="1,000,000"
            />
            {manHint(prepay) && (
              <span className="mt-0.5 block text-[11px] font-semibold text-emerald-700">{manHint(prepay)}</span>
            )}
          </label>
        )}

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

      {/* 2026-07-31：既存モードの出力は mode でゲートするだけ。中身は一切変更していない。 */}
      {show && mode === TOOL_MODE.KARIKAE && type === "変動" && (
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

      {show && mode === TOOL_MODE.KARIKAE && type === "固定" && (
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

      {/* ===== 繰り上げ返済モードの出力（2026-07-31 追加） ===== */}
      {showPrepay && isFullRepay && (
        <div className="mt-5">
          <section className="rounded-xl bg-white p-4">
            <h4 className="text-[15px] font-bold text-slate-900">全額繰り上げ返済（一括返済）になります</h4>
            <p className="mt-2 text-[14px] leading-relaxed text-slate-700">
              繰り上げ額が残高以上のため、ここでは計算しません。一括返済は残りの利息を消せる一方で、
              <strong>手元の現金と団体信用生命保険（団信）の保障を手放す選択</strong>になります。完済と同時に団信は終了します。
              また、全額繰り上げ返済は一部繰り上げ返済と手数料の体系が異なる金融機関があるため、借入先の条件を確認してください。
            </p>
            <p className="mt-3 text-[14px] leading-relaxed text-slate-700">
              → 一括返済の代償と中間の選択肢は
              <Link href="/loan/kojo-shuryo-kuriage" className="text-blue-700 underline hover:no-underline">
                住宅ローン控除が終わったら繰り上げ返済すべきか
              </Link>
              で扱っています。
            </p>
          </section>
        </div>
      )}

      {showPrepay && !isFullRepay && !prepayCalc && (
        <p className="mt-4 text-[14px] font-semibold text-amber-800">
          残高・残りの返済年数・繰り上げ返済する金額を入力すると計算できます。
        </p>
      )}

      {showPrepay && !isFullRepay && prepayCalc && (
        <div className="mt-5 space-y-4">
          {/* A・B は並列に置き、優劣を断定しない（記事6と同じ整理） */}
          <section className="rounded-xl bg-white p-4">
            <h4 className="text-[15px] font-bold text-slate-900">A. 期間短縮型（毎月の返済額はそのまま）</h4>
            <div className="mt-2 text-[14px] text-slate-700">
              <div className={rowCls}>
                <span>減る利息</span>
                <span className="font-bold">
                  {prepayCalc.zeroRate ? "0円" : `${manDetail(prepayCalc.shorten.interestSaved)}円`}
                </span>
              </div>
              <div className={rowCls}>
                <span>短縮される期間</span>
                <span className="font-bold">{formatMonths(prepayCalc.shorten.monthsShortened)}</span>
              </div>
            </div>
          </section>

          <section className="rounded-xl bg-white p-4">
            <h4 className="text-[15px] font-bold text-slate-900">B. 返済額軽減型（返済期間はそのまま）</h4>
            <div className="mt-2 text-[14px] text-slate-700">
              <div className={rowCls}>
                <span>減る利息</span>
                <span className="font-bold">
                  {prepayCalc.zeroRate ? "0円" : `${manDetail(prepayCalc.reduce.interestSaved)}円`}
                </span>
              </div>
              <div className={rowCls}>
                <span>毎月の返済額の軽減</span>
                <span className="font-bold">{yen(prepayCalc.reduce.monthlyReduction)}円 軽くなる</span>
              </div>
            </div>
          </section>

          <p className="rounded-lg bg-slate-100 p-3 text-[14px] leading-relaxed text-slate-800">
            {prepayCalc.zeroRate ? (
              <>金利0%のため利息は減りません。期間短縮型では返済期間が{formatMonths(prepayCalc.shorten.monthsShortened)}短くなり、返済額軽減型では毎月の返済が{yen(prepayCalc.reduce.monthlyReduction)}円軽くなります。目的で選んでください。</>
            ) : (
              <>利息の軽減は期間短縮型が大きく、返済額軽減型は毎月の余力が増えます。目的で選んでください。</>
            )}
          </p>

          {/* C. 未払利息ライン（変動のときだけ） */}
          {type === "変動" && prepayCalc.lineNow !== null && prepayCalc.lineAfter !== null && (
            <section className="rounded-xl bg-white p-4">
              <h4 className="text-[15px] font-bold text-slate-900">C. 未払利息が発生する金利のライン</h4>
              <div className="mt-2 text-[14px] text-slate-700">
                <div className={rowCls}>
                  <span>いまのライン</span>
                  <span className="font-bold">年{prepayCalc.lineNow.toFixed(2)}%</span>
                </div>
                <div className={rowCls}>
                  <span>期間短縮型で繰り上げた後</span>
                  <span className="font-bold">
                    年{prepayCalc.lineAfter.toFixed(2)}%
                    <span className="ml-1 text-[13px] text-slate-500">
                      （+{(prepayCalc.lineAfter - prepayCalc.lineNow).toFixed(2)}ポイント）
                    </span>
                  </span>
                </div>
              </div>
              <p className="mt-3 text-[13px] leading-relaxed text-slate-600">
                毎月の返済額×12÷残高で計算した、未払利息が発生し始める金利の目安です。
                <strong>返済額軽減型では、返済額と残高が同じ割合で減るためラインは変わりません。</strong>
                仕組みの詳細は
                <Link href="/loan/5nen-rule" className="text-blue-700 underline hover:no-underline">
                  住宅ローンの5年ルール・125%ルールとは
                </Link>
                で扱っています。
              </p>
            </section>
          )}

          {/* D. 借り換えとの比較（参考表示・変動/固定の両方で出す） */}
          {prepayCalc.refiNet !== null && (
            <section className="rounded-xl bg-white p-4">
              <h4 className="text-[15px] font-bold text-slate-900">D. 参考：借り換えとの比較</h4>
              <p className="mt-2 text-[14px] leading-relaxed text-slate-700">
                {prepayCalc.refiNet > 0 ? (
                  <>
                    同じ資金を使う前提ではありませんが、あなたの条件では借り換えの正味メリットは
                    <strong>約{manOku(prepayCalc.refiNet)}円</strong>です。金利差が大きい場合は先に借り換えを検討する価値があります。
                  </>
                ) : (
                  <>
                    あなたの条件では借り換えは費用の方が大きくなります（約{manOku(Math.abs(prepayCalc.refiNet))}円のマイナス）。
                  </>
                )}
              </p>
              <p className="mt-2 text-[13px] leading-relaxed text-slate-600">
                → 繰り上げ返済と借り換えのどちらを先にすべきかは
                <Link href="/loan/kuriage-hensai" className="text-blue-700 underline hover:no-underline">
                  住宅ローンの繰り上げ返済は得か
                </Link>
                で比較しています。
              </p>
            </section>
          )}
        </div>
      )}

      <p className="mt-4 text-[12px] leading-relaxed text-slate-500">
        毎月の返済額が一定になる返し方（元利均等返済）・ボーナス払いなしで計算した目安です。借り換え費用は事務手数料・登録免許税・司法書士報酬などの概算で、実際の金額は金融機関によって異なります。
        {mode === TOOL_MODE.KURIAGE && "繰り上げ返済の手数料は含んでいません。"}
        特定の金融機関・金融商品を推奨するものではありません。
      </p>
    </div>
  );
}
