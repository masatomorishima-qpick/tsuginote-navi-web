"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { track } from "@/lib/shisan/track";
/* 2026-08-02 追加（顧客の声・指示書2-4）：運営者フラグ。?op=1 で立てた localStorage フラグを
 * 入力保存の body に載せ、is_operator を確実に立てる（3経路共通の修理）。 */
import { captureOpParam, isOperatorClient } from "@/lib/shisan/op";
import { manOku, manHint } from "@/lib/shisan/format";
/* 2026-08-01 追加（v2.2）：REFI_MARKET_BAND・REFI_COST_* は「計算の中身」の表示専用。
 * 時変の値を文言にベタ書きせず定数を参照する（金利更新時にここだけ古く残る事故を防ぐ・指示書2-5）。 */
import { yen, refinance, REFI_BASE, FLAT35_RATE, REFI_MARKET_BAND, REFI_COST_RATE, REFI_COST_FIXED } from "@/lib/shisan/calc";
import { refinanceTo, breakEvenVariableRate, paymentAtRate } from "@/lib/loan/refi";
/* 2026-07-31 追加：繰り上げ返済モード。計算は lib/loan/prepay.ts（calc.ts の部品の組み替え）。 */
import { prepayShorten, prepayReduce, unpaidInterestLine, formatMonths, manDetail } from "@/lib/loan/prepay";
import { TOOL_MODE, CALC_RESULT, rateTypeCodeOf, type ToolMode } from "@/lib/loan/tool";
/* 2026-07-31 追加（v2.1）：Excel出力。生成ロジックは UI から独立した純関数（lib/loan/excel.ts）。
 * ライブラリ本体はボタン押下時に動的import するので、記事の初期表示のバンドルは増えない。 */
import { buildLoanWorkbook, todayJst, workbookFileName } from "@/lib/loan/excel";
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

/* ===== 計算式の見える化（2026-08-01 追加・v2.2） =====
 * 中立性ポリシー第5項「試算の前提（金利・費用・税率など）は、記事とツールの中ですべて開示します」の
 * ツール側の実装。各結果ブロックの末尾に <details>「この計算の中身を見る」を置く。
 * - 素の details/summary。radix は使わず、JSなしで開閉できるネイティブ要素のまま
 * - 表示のための再計算はしない。calc / prepayCalc の計算済みの値を文字列に組むだけ
 * - 開閉は GA4 に送らない（過剰計測を避ける・指示書2-1）
 * - 数式の見た目は記事8のコードブロックに合わせるが、whitespace-pre-wrap で「折り返す」点だけ違う。
 *   記事8は横スクロール（whitespace-pre）だが、ツールの完了条件は「375pxで折り返して読める」なので要件が逆 */
const detailsCls = "group mt-3 border-t border-slate-100 pt-2";
const summaryCls = "cursor-pointer list-none select-none text-[13px] text-slate-500 hover:text-slate-700";
const formulaCls =
  "mt-1.5 whitespace-pre-wrap break-words rounded-lg bg-slate-50 px-3 py-2 font-mono text-[12.5px] leading-relaxed text-slate-800";
const explainCls = "mt-2 text-[13px] leading-relaxed text-slate-600";

/** 月利（年利% ÷ 100 ÷ 12）の表示用文字列。1.5% なら 0.00125。有効数字3桁・表示専用で、計算には使わない。 */
function monthlyRateStr(ratePct: number): string {
  if (ratePct <= 0) return "0";
  return String(Number((ratePct / 100 / 12).toPrecision(3)));
}

/** 「この計算の中身を見る」開閉ブロック。＋/− の切り替えは /souzoku-houki のFAQと同じ group-open 方式。 */
function CalcInside({ children }: { children: ReactNode }) {
  return (
    <details className={detailsCls}>
      <summary className={summaryCls}>
        <span className="mr-1 inline font-semibold group-open:hidden">＋</span>
        <span className="mr-1 hidden font-semibold group-open:inline">−</span>
        この計算の中身を見る
      </summary>
      {children}
    </details>
  );
}

/** 借り換えの正味メリットの「計算の中身」。②（変動）・固定切替時・繰り上げモードDの3箇所で同じ内容を出す。
 *  値は計算済みの refi オブジェクトから受け取るだけで、ここでは何も計算しない（費用率などの定数参照と表示整形のみ）。 */
function RefiInside({
  balance,
  years,
  refi,
}: {
  balance: number;
  years: number;
  refi: { mNow: number; mNew: number; dMonthly: number; dInterest: number; cost: number; months: number };
}) {
  const n = years * 12;
  const costRatePct = (REFI_COST_RATE * 100).toFixed(1);
  return (
    <CalcInside>
      <p className={explainCls}>
        借り換えで減る返済額の合計から、借り換えにかかる費用を引いたものが正味のメリットです。費用は借入額に比例する部分（事務手数料と登録免許税）と、比例しない部分（司法書士報酬・印紙税など）に分かれます。
      </p>
      <div className={formulaCls}>{`借り換え費用 = 残高 × ${costRatePct}% + ${yen(REFI_COST_FIXED)}円
正味メリット = (いまの毎月 − 借り換え後の毎月) × 回数 − 借り換え費用`}</div>
      <div className={formulaCls}>{`あなたの場合：費用 = ${yen(balance)} × ${costRatePct}% + ${yen(REFI_COST_FIXED)} = ${yen(refi.cost)}円
借り換え後の毎月 = ${yen(refi.mNew)}円（月々 ${yen(refi.dMonthly)}円 減る）
正味メリット = ${yen(refi.dMonthly)} × ${n}回 − ${yen(refi.cost)} = ${yen(refi.dInterest - refi.cost)}円`}</div>
      {/* 2026-08-01（A案・masato確定）：途中の金額は円未満を丸めるため、読者が電卓で検算すると数十円ずれる。
          その説明を1行添える（記事8の「銀行の表と数十円ずれるのは正常」と同じ整理）。 */}
      <p className="mt-1.5 text-[12px] leading-relaxed text-slate-500">
        ※途中の金額は円未満を丸めて表示しているため、掛け算の結果とは数十円ずれることがあります。※借り換え先の金利は年
        {REFI_BASE.toFixed(1)}%を想定しています（当サイトの基準値。市場の実勢は「{REFI_MARKET_BAND}」）。
      </p>
    </CalcInside>
  );
}

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
    captureOpParam(); // 2026-08-02（指示書2-4）：?op=1/?op=0 を localStorage に永続化
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
    /* 2026-08-01（v2.2）：Dの「計算の中身」で費用・借り換え後の毎月を見せるため、refiNet だけでなく
     * refi オブジェクトごと公開する。ここで計算済みの値の公開であり、表示のための再計算ではない。 */
    return { shorten, reduce, now, lineNow, lineAfter, refi, refiNet, zeroRate: R === 0 };
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
          operator: isOperatorClient(), // 2026-08-02（指示書2-4）：運営者フラグ（3経路共通）
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

  /* ===== Excel出力（2026-07-31 追加・v2.1） =====
   * 結果が出ている状態のときだけボタンを出す。全額返済の案内中は計算していないので出さない。 */
  const canDownload =
    mode === TOOL_MODE.KURIAGE ? Boolean(showPrepay && !isFullRepay && prepayCalc) : Boolean(show);
  const [downloading, setDownloading] = useState(false);

  const onDownloadExcel = async () => {
    if (downloading) return;
    setDownloading(true);
    // GAイベントは既存の流儀（track）で。この件数が Excel 需要の実測データになる。
    track("shisan_loan_tool_excel", { article_path: articlePath, mode });
    try {
      // 出力日は JST 固定（サイトの日付表記に揃える。海外からのアクセスで1日ずれると
      // 「いつの試算か」を後から照合するときに混乱するため）。
      const dateJst = todayJst(new Date());
      const sheets = buildLoanWorkbook({
        mode,
        balance: B,
        years: Y,
        rate: R,
        rateType: type,
        prepay: mode === TOOL_MODE.KURIAGE ? A : undefined,
        dateJst,
      });
      const { default: writeXlsxFile } = await import("write-excel-file/browser");
      await writeXlsxFile(sheets as never).toFile(workbookFileName(dateJst));
    } catch {
      /* 生成に失敗しても計算結果の表示には影響させない（best-effort） */
    } finally {
      setDownloading(false);
    }
  };

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
            {/* 2026-08-01（v2.2）：計算式の見える化。値は calc から取るだけで再計算しない。 */}
            <CalcInside>
              <p className={explainCls}>
                毎月の返済額は、残高・1か月あたりの利率・返済の回数から決まります。1か月あたりの利率（月利）は、年利を12で割ったものです。金利が上がった場合の行は、同じ式で月利だけを変えて計算しています。
              </p>
              {R > 0 ? (
                <>
                  <div className={formulaCls}>{"毎月の返済額 = 残高 × 月利 ÷ (1 − (1 + 月利)^−回数)"}</div>
                  <div className={formulaCls}>{`あなたの場合：月利 = ${R}% ÷ 100 ÷ 12 = ${monthlyRateStr(R)}、回数 = ${Y}年 × 12 = ${Y * 12}回
→ 毎月の返済額 ${yen(calc.now)}円
金利+1%（${(R + 1).toFixed(2)}%）なら月利 ${monthlyRateStr(R + 1)} → ${yen(calc.up1)}円
金利+2%（${(R + 2).toFixed(2)}%）なら月利 ${monthlyRateStr(R + 2)} → ${yen(calc.up2)}円`}</div>
                </>
              ) : (
                <div className={formulaCls}>{`金利0%のため、毎月の返済額 = 残高 ÷ 回数 = ${yen(B)} ÷ ${Y * 12} = ${yen(calc.now)}円
金利が上がった場合の行は、上の式（残高 × 月利 ÷ (1 − (1 + 月利)^−回数)）で月利だけを変えて計算しています。`}</div>
              )}
            </CalcInside>
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
            {/* 2026-08-01（v2.2）：計算式の見える化（変動②と固定切替時の両方に同じ内容を出す）。 */}
            <RefiInside balance={B} years={Y} refi={calc.refi} />
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
            {/* 2026-08-01（v2.2）：損益分岐は閉じた式がない（breakEvenVariableRate の二分探索）ので、
                何を等しくする金利を探しているかを言葉で開示する。 */}
            <CalcInside>
              <p className={explainCls}>
                変動金利が何%まで上がると、いま固定（フラット35 年{FLAT35_RATE}%）に切り替えた場合と総支払額が並ぶかを求めています。「切り替えにかかる費用を、金利差で取り返せる水準」がこの数字です。ひとつの式では書けないため、「変動のまま完済したときの利息の総額」が「固定に切り替えたときの利息の総額＋切り替え費用」と等しくなる金利を、計算エンジンが数値的に探しています。
              </p>
              <div className={formulaCls}>{`あなたの場合：固定（フラット35）を年${FLAT35_RATE}%として、損益分岐は 年${calc.breakEven.toFixed(2)}%
ここまで上がって完済まで続く場合に、いま固定へ切り替えた方が総支払額は少なくなります。`}</div>
            </CalcInside>
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
            {/* 2026-08-01（v2.2）：計算式の見える化（固定金利タイプでも借り換えの中身は同じ）。 */}
            <RefiInside balance={B} years={Y} refi={calc.refi} />
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
            {/* 2026-08-01（v2.2）：計算式の見える化。指示書2-3の「毎月の返済額（A・B両方の前提として最初に置く）」は、
                繰り上げモードの画面に毎月の返済額のブロックが無いため、最初のブロックであるAの中身の冒頭に置いた。 */}
            <CalcInside>
              <p className={explainCls}>
                前提として、毎月の返済額は、残高・1か月あたりの利率・返済の回数から決まります。1か月あたりの利率（月利）は、年利を12で割ったものです。
              </p>
              {prepayCalc.zeroRate ? (
                <div className={formulaCls}>{`金利0%のため、毎月の返済額 = 残高 ÷ 回数 = ${yen(B)} ÷ ${Y * 12} = ${yen(prepayCalc.now)}円
利息が発生していないため、減る利息は0円です。短縮される期間 = 繰り上げ額 ÷ 毎月の返済額 で求めています。`}</div>
              ) : (
                <>
                  <div className={formulaCls}>{"毎月の返済額 = 残高 × 月利 ÷ (1 − (1 + 月利)^−回数)"}</div>
                  <div className={formulaCls}>{`あなたの場合：月利 = ${R}% ÷ 100 ÷ 12 = ${monthlyRateStr(R)}、回数 = ${Y}年 × 12 = ${Y * 12}回
→ 毎月の返済額 ${yen(prepayCalc.now)}円`}</div>
                  <p className={explainCls}>
                    繰り上げ返済した分は、全額が元金（借入の残高そのもの）に充てられます。毎月の返済額を変えないので、返済の回数が減ります。回数は「毎月の返済額で、減った残高を何回で返し終わるか」を逆算して求めます。
                  </p>
                  <div className={formulaCls}>{`繰り上げ後の残高 = 残高 − 繰り上げ額
減る利息 = (繰り上げ前の総利息) − (繰り上げ後の総利息)`}</div>
                  <div className={formulaCls}>{`あなたの場合：繰り上げ後の残高 = ${yen(B)} − ${yen(A)} = ${yen(B - A)}円
残り回数 = ${Y * 12}回 → ${(Y * 12 - prepayCalc.shorten.monthsShortened).toFixed(1)}回（${prepayCalc.shorten.monthsShortened.toFixed(1)}か月短縮）
減る利息 = ${yen(prepayCalc.shorten.interestSaved)}円（約${manDetail(prepayCalc.shorten.interestSaved)}円）`}</div>
                </>
              )}
            </CalcInside>
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
            {/* 2026-08-01（v2.2）：計算式の見える化。 */}
            <CalcInside>
              <p className={explainCls}>
                返済の回数は変えずに、繰り上げで減った残高をもとに毎月の返済額を計算し直します。式は毎月の返済額を求める式と同じで、残高だけが小さくなります。
              </p>
              {prepayCalc.zeroRate ? (
                <div className={formulaCls}>{`金利0%のため、新しい毎月の返済額 = (残高 − 繰り上げ額) ÷ 回数 です。
利息が発生していないため、減る利息は0円です。`}</div>
              ) : (
                <>
                  <div className={formulaCls}>{"新しい毎月の返済額 = (残高 − 繰り上げ額) × 月利 ÷ (1 − (1 + 月利)^−回数)"}</div>
                  <div className={formulaCls}>{`あなたの場合：新しい毎月の返済額 = ${yen(prepayCalc.now - prepayCalc.reduce.monthlyReduction)}円（${yen(prepayCalc.reduce.monthlyReduction)}円 軽くなる）
減る利息 = ${yen(prepayCalc.reduce.interestSaved)}円（約${manDetail(prepayCalc.reduce.interestSaved)}円）`}</div>
                </>
              )}
            </CalcInside>
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
              {/* 2026-08-01（v2.2）：計算式の見える化。lineNow / lineAfter は上の描画条件で非null確定。 */}
              <CalcInside>
                <p className={explainCls}>
                  未払利息とは、毎月の返済額でその月の利息をまかないきれなくなったときに、不足分が残高に上乗せされることです。1年分の返済額が、残高に対して何%にあたるかで、発生し始める金利の目安が出ます。
                </p>
                <div className={formulaCls}>{"未払利息が発生する金利 = 毎月の返済額 × 12 ÷ 残高 × 100"}</div>
                <div className={formulaCls}>{`あなたの場合：${yen(prepayCalc.now)} × 12 ÷ ${yen(B)} × 100 = ${prepayCalc.lineNow.toFixed(2)}%
期間短縮型で繰り上げた後：${yen(prepayCalc.now)} × 12 ÷ ${yen(B - A)} × 100 = ${prepayCalc.lineAfter.toFixed(2)}%`}</div>
              </CalcInside>
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
              {/* 2026-08-01（v2.2）：計算式の見える化。refi は prepayCalc で計算済みのオブジェクト。 */}
              {prepayCalc.refi && <RefiInside balance={B} years={Y} refi={prepayCalc.refi} />}
            </section>
          )}
        </div>
      )}

      {/* ===== Excel出力（2026-07-31 追加・v2.1） =====
          位置は結果ブロックの末尾・免責の上。結果を見終えた直後という導線で、
          免責が常に最後に来る形も崩さない。既存の「計算する」と主従が逆転しないよう副次ボタンにする。 */}
      {canDownload && (
        <div className="mt-5">
          <button
            type="button"
            onClick={onDownloadExcel}
            disabled={downloading}
            className="w-full rounded-xl border border-emerald-600 bg-white py-3 text-[15px] font-bold text-emerald-700 transition hover:bg-emerald-50 disabled:opacity-60"
          >
            {downloading ? "作成しています…" : "Excelでダウンロード（数式つき）"}
          </button>
          <p className="mt-2 text-[12px] leading-relaxed text-slate-500">
            入力シートの数字を書き換えると、返済予定表もあわせて計算し直されます。
            {mode === TOOL_MODE.KARIKAE &&
              "ファイルには、いまのローンの返済予定表が入ります（借り換えの試算は金利の前提が変わるため含みません）。"}
          </p>
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
