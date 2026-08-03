"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { track } from "@/lib/shisan/track";
/* 運営者フラグ（?op=1）。テスト行除外の共通機構（lib/shisan/op.ts・2026-08-03 修理済み） */
import { captureOpParam, isOperatorClient } from "@/lib/shisan/op";
import {
  comparePlans, manDisp,
  type TaishokukinInput, type PlanComparison,
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

  // 表示イベントは1回だけ（StrictMode の二重実行対策の ref ガード・既存の流儀）
  const viewed = useRef(false);
  useEffect(() => {
    if (viewed.current) return;
    viewed.current = true;
    track("retirement_tool_view", { article_path: articlePath });
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

  const onSubmit = () => {
    setSubmitted(true);
    track("retirement_tool_calc", {
      article_path: articlePath,
      result: calc ? "ok" : "invalid",
      top: calc ? calc.ranking[0] : "",
      heiyo_shown: calc ? calc.heiyo !== null : false,
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

          {/* 固定表示の注記（指示書3-3・内容必須） */}
          <div className="rounded-lg bg-slate-100 p-3 text-[12px] leading-relaxed text-slate-700">
            <p>※国民健康保険料・介護保険料は「増えた所得の約10%」の目安です。保険料率と算定方法は自治体により異なり、賦課限度額は考慮していません。</p>
            <p className="mt-1">※60歳で退職し、60〜64歳に他の収入がない前提です。働きながら受け取る場合は結果が変わります（給与と合算して課税されるため、年金形式の負担は重くなります）。</p>
            <p className="mt-1">※所得控除は基礎控除のみで計算しています（配偶者控除・社会保険料控除などは考慮していません）。</p>
            <p className="mt-1">※勤続5年以下・役員等・iDeCoや企業型DCと近い時期に受け取る場合には対応していません。該当する場合はこの計算を使わないでください。</p>
            <p className="mt-1">※選べる分割の割合は制度により異なります。控除額ちょうどで区切れない場合があります。</p>
          </div>
        </div>
      )}

      <p className="mt-4 text-[12px] leading-relaxed text-slate-500">
        すべて目安の計算です。特定の金融機関・金融商品を推奨するものではありません。実際の受け取り方は、勤め先の制度と規程をご確認ください。
      </p>
    </div>
  );
}
