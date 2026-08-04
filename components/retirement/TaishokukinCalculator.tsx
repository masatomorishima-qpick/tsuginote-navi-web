"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { track } from "@/lib/shisan/track";
/* 運営者フラグ（?op=1）。テスト行除外の共通機構（lib/shisan/op.ts・2026-08-03 修理済み） */
import { captureOpParam, isOperatorClient } from "@/lib/shisan/op";
import {
  comparePlans, manDisp, pensionStartComparison,
  type TaishokukinInput, type PlanComparison, type PensionStartComparison,
} from "@/lib/retirement/taishokukin";

/**
 * 退職金の手取り比較ツール（2026-08-03 新設・駅1指示書3章）
 *
 * 位置づけ：記事9「退職金の受け取り方」の中で完結する軽量ツール。
 * 記事の結論（控除額で区切る）は10年分の税・社保計算を含み読者が手計算できないため、
 * 記事とツールは同時公開が必須（指示書0章）。
 *
 * 計算について（重要）：
 *   数値はすべて lib/retirement/taishokukin.ts（純関数）由来。このコンポーネントでは
 *   税・年金の式を一切書かない。記事の掲載数値とツールの3者一致を保つため。
 *
 * 流儀は LoanCalculator（v2.2）を踏襲（コードは複製・LoanCalculator は無変更）：
 *   非ブロッキングではなく範囲外は警告して結果を出さない（税計算は範囲外で前提が壊れるため。
 *   ここは loan-tool と意図的に違える）／view は useRef ガードでセッション1回／
 *   <details>「この計算の中身を見る」で式を全開示／保存は fire-and-forget。
 */

/* 入力の範囲（指示書3-1） */
const YEARS_MIN = 1, YEARS_MAX = 50;
const AMOUNT_MIN = 1_000_000, AMOUNT_MAX = 100_000_000;
const RATE_MAX = 5;
const PENSION_MAX = 5_000_000;
const RECEIVE_CHOICES = [5, 10, 15, 20] as const;

const inputCls =
  "w-full px-3 py-2.5 border border-slate-200 rounded-xl text-[15px] focus:outline-none focus:ring-2 focus:ring-emerald-600";
const labelCls = "block text-[13px] font-semibold mt-3 mb-1 text-slate-700";
const hintCls = "font-normal text-slate-400 text-xs";
const chipCls = "px-4 py-2 rounded-full text-sm font-semibold border transition";
const btnCls =
  "w-full mt-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-base font-bold transition";
const rowCls = "flex items-baseline justify-between gap-3 border-t border-slate-200 py-2";
/* 式の開示（v2.2 の formulaCls と同じ設計：375px では折り返す） */
const detailsCls = "group mt-3 border-t border-slate-100 pt-2";
const summaryCls = "cursor-pointer list-none select-none text-[13px] text-slate-500 hover:text-slate-700";
const formulaCls =
  "mt-1.5 whitespace-pre-wrap break-words rounded-lg bg-slate-50 px-3 py-2 font-mono text-[12.5px] leading-relaxed text-slate-800";
const explainCls = "mt-2 text-[13px] leading-relaxed text-slate-600";
/* v2.0 比較ブロックの表（375px では overflow-x-auto で横スクロール。min-width は控えめ） */
const cmpTableCls = "w-full min-w-[460px] border-collapse text-[13px]";
const cmpThCls = "border border-slate-200 bg-slate-50 px-2 py-1.5 text-left align-bottom font-semibold text-slate-600";
const cmpThRowCls = "border border-slate-200 px-2 py-1.5 text-left font-semibold text-slate-700 whitespace-nowrap";
const cmpTdCls = "border border-slate-200 px-2 py-1.5 text-slate-700 whitespace-nowrap";

const PLAN_LABEL = { lump: "全額一時金", pension: "全額年金", heiyo: "併用（控除まで一時金＋残りを年金）" } as const;

function digits(v: string) {
  return v.replace(/[^\d]/g, "");
}
function comma(v: string) {
  const d = digits(v);
  return d ? Number(d).toLocaleString("ja-JP") : "";
}
function rateDigits(v: string) {
  return v.replace(/[^\d.]/g, "").replace(/(\..*)\./g, "$1");
}
/** 円の表示（1円単位・カンマ区切り）。丸めは表示時のみ（計算は taishokukin.ts の仕様どおり） */
function yen(n: number) {
  return Math.round(n).toLocaleString("ja-JP");
}

export default function TaishokukinCalculator({ articlePath }: { articlePath: string }) {
  const [yearsStr, setYearsStr] = useState("25");
  const [amountStr, setAmountStr] = useState("22000000");
  const [rateStr, setRateStr] = useState("2.25");
  const [receiveYears, setReceiveYears] = useState<number>(10);
  const [pensionStr, setPensionStr] = useState("2200000");
  const [submitted, setSubmitted] = useState(false);

  /* 保存用の流入元・デバッグ判定（loan-tool と同じ作り方） */
  const traffic = useRef({ referrer: "", utmSource: "", utmMedium: "", utmCampaign: "", debug: false });
  useEffect(() => {
    if (typeof window === "undefined") return;
    const p = new URLSearchParams(window.location.search);
    traffic.current = {
      referrer: document.referrer || "",
      utmSource: p.get("utm_source") || "", utmMedium: p.get("utm_medium") || "", utmCampaign: p.get("utm_campaign") || "",
      debug: p.get("ga_debug") === "1" || p.get("debug") === "1",
    };
    captureOpParam(); // ?op=1/?op=0 を localStorage に永続化（テスト行除外）
  }, []);

  // 表示イベントは1回だけ（StrictMode の二重実行対策の ref ガード・既存の流儀）。
  // 発火条件はマウント時（shisan_loan_tool_view と同じ useRef 一回）。
  //
  // ただし GA(gtag) は @next/third-parties により afterInteractive で読み込まれるため、
  // マウント直後は window.gtag が未定義のことがある。track() は window.gtag?.() で
  // 送るだけでキュー/再送しないので、そのまま呼ぶと view が無音で欠落する
  // （本番で実測・2026-08-03。shisan_loan_tool_view も同じ理由で欠落していた）。
  // そこで「1回だけ」を保ったまま、gtag が関数になってから送る（未ロードなら短時間待つ）。
  const viewed = useRef(false);
  useEffect(() => {
    if (viewed.current) return;
    const w = window as unknown as { gtag?: unknown };
    const fire = (): boolean => {
      if (viewed.current) return true;
      if (typeof w.gtag === "function") {
        viewed.current = true;
        track("retirement_tool_view", { article_path: articlePath });
        return true;
      }
      return false;
    };
    if (fire()) return;
    // gtag 未ロードなら 200ms 間隔で最大約10秒だけ待つ（読み込めなければ諦める）。
    let tries = 0;
    const id = window.setInterval(() => {
      if (fire() || ++tries >= 50) window.clearInterval(id);
    }, 200);
    return () => window.clearInterval(id);
  }, [articlePath]);

  const years = Number(digits(yearsStr) || 0);
  const amount = Number(digits(amountStr) || 0);
  const ratePct = Number(rateDigits(rateStr) || 0);
  const publicPension = Number(digits(pensionStr) || 0);

  const warn = useMemo(() => {
    const msgs: string[] = [];
    if (years < YEARS_MIN || years > YEARS_MAX) msgs.push(`勤続年数は${YEARS_MIN}〜${YEARS_MAX}年で入力してください（1年未満の端数は切り上げ）。`);
    if (amount < AMOUNT_MIN || amount > AMOUNT_MAX) msgs.push("退職金額は100万円〜1億円で入力してください。");
    if (ratePct < 0 || ratePct > RATE_MAX) msgs.push(`規程の利率は0〜${RATE_MAX}%で入力してください。`);
    if (publicPension < 0 || publicPension > PENSION_MAX) msgs.push("公的年金（年額）は0〜500万円で入力してください。");
    return msgs;
  }, [years, amount, ratePct, publicPension]);

  /* 計算は taishokukin.ts の純関数のみ。範囲外は結果を出さない（税計算の前提が壊れるため）。 */
  const calc: PlanComparison | null = useMemo(() => {
    if (warn.length > 0) return null;
    const input: TaishokukinInput = { years, amount, ratePct, receiveYears, publicPension };
    return comparePlans(input);
  }, [warn, years, amount, ratePct, receiveYears, publicPension]);

  /* v2.0：年金の受け取り開始年齢の比較（全額年金前提の生涯手取り）。3案比較とは別の量。
   * 追加入力なしで現行の5項目から計算する。 */
  const pensionCompare: PensionStartComparison | null = useMemo(() => {
    if (warn.length > 0) return null;
    const input: TaishokukinInput = { years, amount, ratePct, receiveYears, publicPension };
    return pensionStartComparison(input);
  }, [warn, years, amount, ratePct, receiveYears, publicPension]);

  const onSubmit = () => {
    setSubmitted(true);
    track("retirement_tool_calc", {
      article_path: articlePath,
      result: calc ? "ok" : "invalid",
      top: calc ? calc.ranking[0] : "",
      heiyo_shown: calc ? calc.heiyo !== null : false,
      // v2.0：年金開始年齢の比較ブロックが表示された（＝計算成功時に常に表示）ことを示す。
      // 新規イベントは作らず既存 calc にパラメータを1つ追加（v2.0指示書8・masato確定）。
      pension_compare: !!calc,
    });
    /* 入力の匿名保存（fire-and-forget・失敗は無音。loan-tool と同じ） */
    try {
      const t = traffic.current;
      fetch("/api/retirement/tool", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        keepalive: true,
        body: JSON.stringify({
          years, amount, rate: ratePct, receiveYears, publicPension,
          articlePath,
          operator: isOperatorClient(),
          debug: t.debug,
          referrer: t.referrer, utmSource: t.utmSource, utmMedium: t.utmMedium, utmCampaign: t.utmCampaign,
        }),
      }).catch(() => { /* best-effort */ });
    } catch { /* 無音 */ }
  };

  /* 式の開示を開いたときだけ計測（閉じるは数えない・厳しめ/許可フレームと同じ数え方） */
  const onFormulaToggle = (e: React.SyntheticEvent<HTMLDetailsElement>) => {
    if (e.currentTarget.open) track("retirement_tool_formula_open", { article_path: articlePath });
  };

  const show = submitted && calc;

  return (
    <div className="my-6 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 sm:p-5">
      <h3 className="text-[17px] font-bold text-slate-900">自分の数字で計算する</h3>
      <p className="mt-1 text-[13px] leading-relaxed text-slate-600">
        5項目を入れると、全額一時金・全額年金・併用の手取りを比べられます。氏名・連絡先はお聞きしません。
      </p>

      {/* ===== 入力 ===== */}
      <div className="mt-3">
        <div className="flex gap-3">
          <div className="flex-1">
            <label className={labelCls}>
              勤続年数 <span className={hintCls}>年</span>
              <input type="text" inputMode="numeric" className={inputCls} value={yearsStr}
                onChange={(e) => setYearsStr(digits(e.target.value))} placeholder="25" />
            </label>
          </div>
          <div className="flex-1">
            <label className={labelCls}>
              規程の利率 <span className={hintCls}>%</span>
              <input type="text" inputMode="decimal" className={inputCls} value={rateStr}
                onChange={(e) => setRateStr(rateDigits(e.target.value))} placeholder="2.25" />
            </label>
          </div>
        </div>

        <label className={labelCls}>
          退職金額 <span className={hintCls}>円</span>
          <input type="text" inputMode="numeric" className={inputCls} value={comma(amountStr)}
            onChange={(e) => setAmountStr(digits(e.target.value))} placeholder="22,000,000" />
        </label>

        <label className={labelCls}>
          65歳からの公的年金（年額） <span className={hintCls}>円・ねんきん定期便で確認</span>
          <input type="text" inputMode="numeric" className={inputCls} value={comma(pensionStr)}
            onChange={(e) => setPensionStr(digits(e.target.value))} placeholder="2,200,000" />
        </label>

        <div className={labelCls}>受取年数（年金形式の場合）</div>
        <div className="flex flex-wrap gap-2">
          {RECEIVE_CHOICES.map((n) => (
            <button key={n} type="button" onClick={() => setReceiveYears(n)}
              aria-pressed={receiveYears === n}
              className={`${chipCls} ${receiveYears === n
                ? "border-emerald-600 bg-emerald-600 text-white"
                : "border-slate-300 bg-white text-slate-700"}`}>
              {n}年
            </button>
          ))}
        </div>

        {submitted && warn.length > 0 && (
          <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-[12px] leading-relaxed text-amber-800">
            {warn.map((m) => <p key={m}>{m}</p>)}
          </div>
        )}

        <button type="button" className={btnCls} onClick={onSubmit}>計算する</button>
      </div>

      {/* ===== 結果 ===== */}
      {show && calc && (
        <div className="mt-5 space-y-4">
          {/* 手取りの大きい順（指示書3-2-1） */}
          <section className="rounded-xl bg-white p-4">
            <h4 className="text-[15px] font-bold text-slate-900">手取りの比較（大きい順）</h4>
            <div className="mt-2 text-[14px] text-slate-700">
              {calc.ranking.map((k, i) => {
                const net = k === "lump" ? calc.lump.net : k === "pension" ? calc.pension.net : calc.heiyo!.net;
                return (
                  <div key={k} className={rowCls}>
                    <span>
                      {i === 0 && (
                        <span className="mr-1.5 rounded bg-emerald-600 px-1.5 py-0.5 text-[11px] font-bold text-white">1位</span>
                      )}
                      {PLAN_LABEL[k]}
                    </span>
                    <span className="font-bold">{yen(net)}円<span className="ml-1 text-[12px] font-normal text-slate-500">（約{manDisp(net)}円）</span></span>
                  </div>
                );
              })}
            </div>
            {calc.heiyo && (
              <p className="mt-2 text-[13px] leading-relaxed text-slate-600">
                併用の切り方：<strong>{manDisp(calc.heiyo.lumpPart)}円まで一時金（税0円）＋残り{manDisp(calc.heiyo.pensionPart)}円を年金</strong>（あなたの退職所得控除は{manDisp(calc.kojo)}円です）
              </p>
            )}
            {!calc.heiyo && (
              <p className="mt-2 text-[13px] leading-relaxed text-slate-600">
                退職金が退職所得控除（{manDisp(calc.kojo)}円）の範囲内のため、一時金なら税金は0円です。控除の超過分がないため、併用は表示していません。
              </p>
            )}
          </section>

          {/* 一時金の内訳（指示書3-2-3） */}
          <section className="rounded-xl bg-white p-4">
            <h4 className="text-[15px] font-bold text-slate-900">全額一時金の内訳</h4>
            <div className="mt-2 text-[14px] text-slate-700">
              <div className={rowCls}><span>退職所得控除</span><span className="font-bold">{yen(calc.kojo)}円</span></div>
              <div className={rowCls}><span>課税退職所得</span><span className="font-bold">{yen(calc.lump.taxable)}円</span></div>
              <div className={rowCls}><span>所得税（復興税込み）</span><span className="font-bold">{yen(calc.lump.incomeTax)}円</span></div>
              <div className={rowCls}><span>住民税</span><span className="font-bold">{yen(calc.lump.residentTax)}円</span></div>
              <div className={rowCls}><span>手取り</span><span className="font-bold">{yen(calc.lump.net)}円</span></div>
            </div>
            <details className={detailsCls} onToggle={onFormulaToggle}>
              <summary className={summaryCls}>
                <span className="mr-1 inline font-semibold group-open:hidden">＋</span>
                <span className="mr-1 hidden font-semibold group-open:inline">−</span>
                この計算の中身を見る
              </summary>
              <p className={explainCls}>
                一時金は退職所得として分離課税されます。勤続年数で決まる退職所得控除を引き、残りの半分だけが課税対象です（千円未満切捨て）。所得税には復興特別所得税（×1.021）を含み、住民税は一律10%です。
              </p>
              <div className={formulaCls}>{`退職所得控除 = 勤続20年以下：40万円×年数（最低80万円）／20年超：800万円 + 70万円×(年数−20)
課税退職所得 = (退職金 − 控除) ÷ 2
所得税 = 速算表(課税退職所得) × 1.021
住民税 = 課税退職所得 × 10%`}</div>
              <div className={formulaCls}>{`あなたの場合：控除 = ${yen(calc.kojo)}円（勤続${years}年）
課税退職所得 = (${yen(amount)} − ${yen(calc.kojo)}) ÷ 2 = ${yen(calc.lump.taxable)}円
所得税 = ${yen(calc.lump.incomeTax)}円、住民税 = ${yen(calc.lump.residentTax)}円
手取り = ${yen(amount)} − ${yen(calc.lump.incomeTax)} − ${yen(calc.lump.residentTax)} = ${yen(calc.lump.net)}円`}</div>
            </details>
          </section>

          {/* 年金の内訳（指示書3-2-4） */}
          <section className="rounded-xl bg-white p-4">
            <h4 className="text-[15px] font-bold text-slate-900">全額年金（{receiveYears}年）の内訳</h4>
            <div className="mt-2 text-[14px] text-slate-700">
              <div className={rowCls}><span>年額</span><span className="font-bold">{yen(calc.pension.annual)}円</span></div>
              <div className={rowCls}><span>受取総額</span><span className="font-bold">{yen(calc.pension.total)}円</span></div>
              <div className={rowCls}><span>運用による増分</span><span className="font-bold">+{yen(calc.pension.growth)}円</span></div>
              <div className={rowCls}><span>税・社会保険料の増（目安）</span><span className="font-bold">−{yen(calc.pension.burden)}円</span></div>
              <div className={rowCls}><span>手取り</span><span className="font-bold">{yen(calc.pension.net)}円</span></div>
            </div>
            <details className={detailsCls} onToggle={onFormulaToggle}>
              <summary className={summaryCls}>
                <span className="mr-1 inline font-semibold group-open:hidden">＋</span>
                <span className="mr-1 hidden font-semibold group-open:inline">−</span>
                この計算の中身を見る
              </summary>
              <p className={explainCls}>
                年金形式は、据え置き分が規程の利率でふえる代わりに、毎年の受け取りが「公的年金等の雑所得」として課税されます。60歳から受け取り、65歳以降は公的年金と合算して、各年の税（基礎控除のみ）と国民健康保険料・介護保険料の目安（増えた雑所得の約10%）の増加分を合計しています。
              </p>
              <div className={formulaCls}>{`年額 = 元本 × r ÷ (1 − (1 + r)^−受取年数)　（r = 規程の利率。r=0 のときは 元本 ÷ 年数）
各年の負担増 = [税(雑所得(公的年金 + 年額)) − 税(雑所得(公的年金のみ))] + 雑所得の増分 × 10%
手取り = 受取総額 − 負担増の合計`}</div>
              <div className={formulaCls}>{`あなたの場合：年額 = ${yen(calc.pension.annual)}円 × ${receiveYears}年 = 総額 ${yen(calc.pension.total)}円（元本より +${yen(calc.pension.growth)}円）
60〜64歳は公的年金0円、65歳以降は公的年金${yen(publicPension)}円と合算して課税
負担増の合計 = ${yen(calc.pension.burden)}円
手取り = ${yen(calc.pension.total)} − ${yen(calc.pension.burden)} = ${yen(calc.pension.net)}円`}</div>
              <p className="mt-1.5 text-[12px] leading-relaxed text-slate-500">
                ※途中の金額は円未満を丸めて表示しているため、足し引きすると数円ずれることがあります。
              </p>
            </details>
          </section>

          {/* 併用の内訳（超過分が0のときは非表示・指示書3-1） */}
          {calc.heiyo && (
            <section className="rounded-xl bg-white p-4">
              <h4 className="text-[15px] font-bold text-slate-900">併用の内訳</h4>
              <div className="mt-2 text-[14px] text-slate-700">
                <div className={rowCls}><span>一時金部分（＝控除額・税0円）</span><span className="font-bold">{yen(calc.heiyo.lumpPart)}円</span></div>
                <div className={rowCls}><span>年金に回す元本（超過分）</span><span className="font-bold">{yen(calc.heiyo.pensionPart)}円</span></div>
                <div className={rowCls}><span>超過分の年金手取り</span><span className="font-bold">{yen(calc.heiyo.pension.net)}円</span></div>
                <div className={rowCls}><span>手取り合計</span><span className="font-bold">{yen(calc.heiyo.net)}円</span></div>
              </div>
              <details className={detailsCls} onToggle={onFormulaToggle}>
                <summary className={summaryCls}>
                  <span className="mr-1 inline font-semibold group-open:hidden">＋</span>
                  <span className="mr-1 hidden font-semibold group-open:inline">−</span>
                  この計算の中身を見る
                </summary>
                <p className={explainCls}>
                  控除の額までを一時金で受け取ると、その部分の税金は0円です。控除を超えた分だけに、全額年金と同じ計算（雑所得としての税＋社会保険料の目安）を適用します。
                </p>
                <div className={formulaCls}>{`一時金部分 = min(退職金, 退職所得控除) → 税0円
手取り = 一時金部分 + 超過分の年金手取り`}</div>
                <div className={formulaCls}>{`あなたの場合：一時金部分 = ${yen(calc.heiyo.lumpPart)}円（税0円）
超過分 ${yen(calc.heiyo.pensionPart)}円 → 年金${receiveYears}年で手取り ${yen(calc.heiyo.pension.net)}円
手取り合計 = ${yen(calc.heiyo.lumpPart)} + ${yen(calc.heiyo.pension.net)} = ${yen(calc.heiyo.net)}円`}</div>
              </details>
            </section>
          )}

          {/* ===== v2.0：年金の受け取り開始年齢との組み合わせ（指示書2-3） =====
              3案比較（企業年金の受取期間だけの手取り）とは別の量：全額年金を選んだ場合の、
              老齢年金の開始年齢による「生涯手取り（企業年金＋老齢年金を想定寿命まで合計）」。 */}
          {pensionCompare && (
            <section className="rounded-xl bg-white p-4">
              <h4 className="text-[15px] font-bold text-slate-900">年金の受け取り開始年齢と組み合わせると</h4>
              <p className="mt-1 text-[13px] leading-relaxed text-slate-600">
                ここからは<strong>全額年金で受け取った場合</strong>の、老齢年金の開始年齢による<strong>生涯手取り</strong>の比較です。上の3案（企業年金だけの手取り）とは別で、企業年金と老齢年金を<strong>想定寿命まで合計</strong>した金額です。
              </p>

              {/* 表1：生涯手取り */}
              <p className="mt-4 text-[14px] font-bold text-slate-900">何歳まで生きるかで結論が変わります。</p>
              <div className="mt-2 -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
                <table className={cmpTableCls}>
                  <thead>
                    <tr>
                      <th className={cmpThCls}>想定寿命<br /><span className="font-normal text-slate-400">（その年齢まで受け取った合計）</span></th>
                      <th className={cmpThCls}>65歳から受け取る</th>
                      <th className={cmpThCls}>70歳まで繰り下げる</th>
                      <th className={cmpThCls}>75歳まで繰り下げる</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pensionCompare.lifespanRows.map((row) => (
                      <tr key={row.life}>
                        <td className={cmpThRowCls}>{row.life}歳まで</td>
                        {row.byStart.map((b) => {
                          const best = b.startAge === row.bestStartAge;
                          return (
                            <td key={b.startAge} className={`${cmpTdCls} ${best ? "bg-emerald-50 font-bold text-slate-900" : ""}`}>
                              {best && <span className="mr-1 rounded bg-emerald-600 px-1 py-0.5 text-[10px] font-bold text-white">最大</span>}
                              {manDisp(b.net)}円
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* 万円表示の理由の開示（2026-08-04 masato確定）。社保を目安率で概算しているため、
                  円単位で出すと「1円まで分かっている」という誤った精度の表明になる。 */}
              <p className="mt-2 text-[12px] leading-relaxed text-slate-500">
                社会保険料を目安の率で概算しているため、万円単位で表示しています。
              </p>
              <p className="mt-2 text-[12px] leading-relaxed text-slate-500">
                想定寿命は「その年齢まで受け取った場合の合計」です。短命なら繰下げは不利、長命なら有利になり、寿命で結論の符号が変わります。
              </p>

              {/* 分解表示（指示書2-3・65歳 vs 70歳の1本） */}
              {(() => {
                const oap65 = pensionCompare.oapAnnuals.find((o) => o.startAge === 65)!;
                const oap70 = pensionCompare.oapAnnuals.find((o) => o.startAge === 70)!;
                const b65 = pensionCompare.corpPeriodBurden.find((o) => o.startAge === 65)!;
                const b70 = pensionCompare.corpPeriodBurden.find((o) => o.startAge === 70)!;
                return (
                  <p className="mt-4 rounded-lg bg-emerald-50/70 p-3 text-[13px] leading-relaxed text-slate-700">
                    70歳まで繰り下げると、老齢年金の年額は{yen(oap65.annual)}円から{yen(oap70.annual)}円に増えます。
                    それとは別に、<strong>60〜69歳の企業年金にかかる税・社会保険料が {yen(b65.burden)}円 から {yen(b70.burden)}円 に下がります</strong>。65歳から老齢年金を受け取ると、その5年間は企業年金と合算されて課税されるためです。
                  </p>
                );
              })()}

              {/* 表2：老齢年金の年額 */}
              <p className="mt-4 text-[14px] font-bold text-slate-900">老齢年金の年額</p>
              <div className="mt-2 -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
                <table className={cmpTableCls}>
                  <thead>
                    <tr>
                      <th className={cmpThCls}>受け取り開始</th>
                      <th className={cmpThCls}>年額</th>
                      <th className={cmpThCls}>増額率</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pensionCompare.oapAnnuals.map((o) => (
                      <tr key={o.startAge}>
                        <td className={cmpThRowCls}>{o.startAge}歳</td>
                        <td className={cmpTdCls}>{yen(o.annual)}円</td>
                        <td className={cmpTdCls}>{o.increasePct === 0 ? "—" : `+${o.increasePct}%`}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <details className={detailsCls} onToggle={onFormulaToggle}>
                <summary className={summaryCls}>
                  <span className="mr-1 inline font-semibold group-open:hidden">＋</span>
                  <span className="mr-1 hidden font-semibold group-open:inline">−</span>
                  この計算の中身を見る
                </summary>
                <p className={explainCls}>
                  老齢年金は受け取りを繰り下げると増えます（1か月あたり0.7%、75歳で+84%が上限）。一方で、65歳から受け取ると60〜69歳の企業年金と合算され、その期間の税・社会保険料が増えます。繰下げはこの両面を動かすため、60歳から想定寿命までの各年の手取りを合計して比べます。
                </p>
                <div className={formulaCls}>{`増額率 = 0.7% × 繰り下げた月数（65歳0か月が起点。上限 +84% ＝ 75歳）
各年の雑所得 = 公的年金等控除の速算表(企業年金 + 老齢年金)　（65歳未満/以上で表が変わる）
各年の負担 = 所得税(雑所得−48万) × 1.021 + 住民税(雑所得−43万) × 10% + 国保・介護の目安(雑所得 × 10%)
生涯手取り = Σ[60歳〜想定寿命]（その年の収入 − その年の負担）`}</div>
                <div className={formulaCls}>{`あなたの場合：企業年金 年額 = ${yen(pensionCompare.corpAnnual)}円（60〜${pensionCompare.corpLastAge}歳）
老齢年金 = ${yen(publicPension)}円 → 70歳 ${yen(pensionCompare.oapAnnuals[1].annual)}円（+${pensionCompare.oapAnnuals[1].increasePct}%）／75歳 ${yen(pensionCompare.oapAnnuals[2].annual)}円（+${pensionCompare.oapAnnuals[2].increasePct}%）
例）想定寿命90歳：65歳開始 ${manDisp(pensionCompare.lifespanRows[2].byStart[0].net)}円 ／ 70歳開始 ${manDisp(pensionCompare.lifespanRows[2].byStart[1].net)}円 ／ 75歳開始 ${manDisp(pensionCompare.lifespanRows[2].byStart[2].net)}円`}</div>
              </details>
            </section>
          )}

          {/* 固定表示の注記（指示書3-3・内容必須） */}
          <div className="rounded-lg bg-slate-100 p-3 text-[12px] leading-relaxed text-slate-700">
            <p>※国民健康保険料・介護保険料は「増えた所得の約10%」の目安です。保険料率と算定方法は自治体により異なり、賦課限度額は考慮していません。</p>
            <p className="mt-1">※60歳で退職し、60〜64歳に他の収入がない前提です。働きながら受け取る場合は結果が変わります（給与と合算して課税されるため、年金形式の負担は重くなります）。</p>
            <p className="mt-1">※所得控除は基礎控除のみで計算しています（配偶者控除・社会保険料控除などは考慮していません）。</p>
            <p className="mt-1">※勤続5年以下・役員等・iDeCoや企業型DCと近い時期に受け取る場合には対応していません。該当する場合はこの計算を使わないでください。</p>
            <p className="mt-1">※選べる分割の割合は制度により異なります。控除額ちょうどで区切れない場合があります。</p>
            {/* v2.0で追加（指示書2-5・注記6〜10）。年金開始年齢の比較に関する前提。 */}
            <p className="mt-1">※60歳で退職し、60〜64歳に他の収入がない前提です。働きながら受け取る場合、在職老齢年金により結果が変わりますが、このツールでは計算していません。</p>
            <p className="mt-1">※加給年金（65歳未満の配偶者がいる場合の加算）は計算に含めていません。繰下げ待機中は受け取れないため、該当する場合は繰下げの有利さが小さくなります。</p>
            <p className="mt-1">※老齢基礎年金と老齢厚生年金を分けて繰り下げることもできますが、このツールでは一括して扱っています。</p>
            <p className="mt-1">※75歳から後期高齢者医療制度に移行しますが、保険料は全期間を通じて同じ目安率で概算しています。</p>
            <p className="mt-1">※国民健康保険料には賦課限度額があり、高所得の場合、実際の負担はこの計算より小さくなります。</p>
            {/* 率の明示（2026-08-04 masato確定・Aの万円表示と対になる開示）。生涯手取りの
                社保概算は「雑所得の10%」（絶対額）で、注記1のv1側「増えた所得の約10%」（増分）とは
                枠組みが違うため、生涯手取りにスコープして明記する。 */}
            <p className="mt-1">※「年金の受け取り開始年齢と組み合わせると」の生涯手取りでは、国民健康保険料・介護保険料を雑所得の10%という目安で計算しています。</p>
            {/* 開示（2026-08-04 masato確定）。繰下げ待機中の収入空白期間は生涯手取りに
                含めていない。表1が長寿の行で繰下げを「最大」と示すため、収入ゼロ期間に
                気づかず選ぶ誤誘導を防ぐ開示。受取年数に依存しない一般形（具体年齢は書かない）。 */}
            <p className="mt-1">※繰り下げている間、老齢年金は受け取れません。企業年金の受け取りが終わったあと、老齢年金が始まるまでの期間は、公的年金等の収入がない期間になります。この期間の生活費をどうまかなうかは、この計算に含まれていません。</p>
          </div>
        </div>
      )}

      <p className="mt-4 text-[12px] leading-relaxed text-slate-500">
        すべて目安の計算です。特定の金融機関・金融商品を推奨するものではありません。実際の受け取り方は、勤め先の制度と規程をご確認ください。
      </p>
    </div>
  );
}
