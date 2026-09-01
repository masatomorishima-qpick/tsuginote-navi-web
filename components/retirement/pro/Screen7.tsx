/**
 * components/retirement/pro/Screen7.tsx
 *
 * 有料版の入力画面（28項目）。
 *
 * 【文言を手で書いていません】
 *   ラベル・補足・ⓘ の説明・見出し・ボタンは、すべて `paidFields.ts` から出しています。
 *   `paidFields.ts` は `kensa/gamen7_chushutsu.mjs` が基準HTMLから機械で作ります。
 *   **文言を6か所落とした反省です。**直したいときは基準HTMLを直して作り直してください。
 *
 * 【守っていること】
 *  §5-2   **ⓘ の中身は、押すまで出しません。**基準HTMLは資料用に破線枠で見せていますが、
 *         本番では出しません。**詳細も、既定では閉じています。**
 *  §7-1   本文16px以上・注記13px以上。
 *  §7-4   大きなボタンはサイトの緑（#127a63）。**橙は購入ボタンにしか使いません。**
 *  §7-5   金額は等幅数字（tabular-nums）。
 *  §2の10 利用者に見せる文に「画面◯」と書きません。
 *  §4-4-2 **既定値を作りません。**`mihon`（基準HTMLの見本の値）は初期値にしません。
 *         「現在の年」は呼び出し側から受け取ります。
 *  §8-3   #18 `pro_paid_input_start`／`pro_paid_input_field`／`pro_paid_input_unknown`／
 *         `pro_paid_detail_open`／`pro_paid_detail_field`／`pro_paid_submit`。
 *
 * 【この画面が持たないもの】
 *   **計算も分岐も持ちません。**値を `PaidInput` に組み立てて親に渡すだけです。
 *   エンジンへの入れ方は `lib/retirement/pro/paidInput.ts`（入力対応表のとおり）にあります。
 */

'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { PAID_FIELDS, PAID_GROUPS, PAID_CHROME, type PaidField } from './paidFields';
import { track } from '@/lib/retirement/pro/track';

type Props = {
  /** サーバーで求めた `Asia/Tokyo` の年。**既定値を作りません**（§4-4-2） */
  genzaiNen: number;
  /** 画面1で入力された5項目（円・年・歳）。**ここで直せます** */
  hikitsugi: Record<string, string>;
  /** 入力が揃ったときに呼ばれる */
  onSubmit: (raw: Record<string, string>) => void;
};

/** ○数字 → 入力欄の id。`⑩-1` のような枝番があるので、そのままでは id に使えません */
const idOf = (no: string, i: number): string => `pro7-f${i}`;

/** 「その項目は何番目か」。台帳の `field_no` に使います（**基準HTMLの並び順**） */
const noToIndex = new Map<string, number>(PAID_FIELDS.map((f, i) => [f.no, i + 1]));

/** ⓘ のダイアログ。**押すまで中身を出しません**（§5-2） */
function InfoDialog({ f, onClose }: { f: PaidField; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={f.label}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[80vh] w-full max-w-[34rem] overflow-y-auto rounded-t-2xl bg-white p-5 shadow-xl outline-none sm:rounded-2xl"
      >
        <p className="text-base font-bold text-slate-900">{f.label}</p>
        <p className="mt-3 text-base leading-relaxed text-slate-800">{f.info}</p>
        <button
          type="button"
          onClick={onClose}
          className="mt-5 w-full rounded-xl bg-slate-100 px-4 py-3 text-base font-bold text-slate-800"
        >
          閉じる
        </button>
      </div>
    </div>
  );
}

export default function Screen7({ genzaiNen, hikitsugi, onSubmit }: Props) {
  const [raw, setRaw] = useState<Record<string, string>>(() => ({ ...hikitsugi }));
  const [info, setInfo] = useState<PaidField | null>(null);
  const startedRef = useRef(false);
  const detailSentRef = useRef(false);
  const hajimeRef = useRef<number | null>(null);
  const fieldHajimeRef = useRef<Record<string, number>>({});

  // §8-3 #18。画面が出た時点で1回だけ
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    hajimeRef.current = Date.now();
    track('pro_paid_input_start');
  }, []);

  const byGroup = useMemo(() => {
    const m = new Map<string, PaidField[]>();
    for (const g of PAID_GROUPS) m.set(g, PAID_FIELDS.filter((f) => f.group === g));
    return m;
  }, []);

  const touch = (no: string) => {
    if (fieldHajimeRef.current[no] === undefined) {
      fieldHajimeRef.current[no] = Date.now();
    }
  };

  const done = (f: PaidField) => {
    const fieldNo = noToIndex.get(f.no) ?? 0;
    const t0 = fieldHajimeRef.current[f.no];
    if (f.group === '詳細') {
      track('pro_paid_detail_field', { field_no: fieldNo });
      return;
    }
    // **「わからない」は別に数えます。**どこで詰まるかは、そこにしか出ません
    if (raw[f.no] === 'wakaranai') {
      track('pro_paid_input_unknown', { field_no: fieldNo });
      return;
    }
    track('pro_paid_input_field', {
      field_no: fieldNo,
      elapsed_sec: t0 ? Math.max(0, Math.round((Date.now() - t0) / 1000)) : 0,
    });
  };

  /**
   * 詳細を開いたときに1回だけ数える（§8-3 `pro_paid_detail_open`）。
   * **開け閉めそのものは `<details>` に任せます。**画面の状態を二重に持ちません。
   */
  const openShosai = () => {
    if (detailSentRef.current) return;
    detailSentRef.current = true;
    track('pro_paid_detail_open');
  };

  const submit = () => {
    const t0 = hajimeRef.current;
    track('pro_paid_submit', {
      elapsed_sec_total: t0 ? Math.max(0, Math.round((Date.now() - t0) / 1000)) : 0,
    });
    onSubmit(raw);
  };

  const oneField = (f: PaidField, i: number) => (
    <div key={f.no} className="border-b border-slate-200 py-4 last:border-b-0">
      <label htmlFor={idOf(f.no, i)} className="block text-base font-bold text-slate-900">
        {f.label}
        {f.small || f.info ? (
          <span className="mt-0.5 block text-[13px] font-normal leading-relaxed text-[#5b6470]">
            {f.small}
            {f.info ? (
              <button
                type="button"
                // **押すまで中身を出しません**（§5-2）
                onClick={() => setInfo(f)}
                aria-label={`${f.label}のくわしい説明`}
                className="ml-1.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-slate-400 align-middle text-[13px] font-bold text-slate-600"
              >
                i
              </button>
            ) : null}
          </span>
        ) : null}
      </label>

      <div className="mt-2">
        <input
          id={idOf(f.no, i)}
          type="text"
          inputMode="text"
          autoComplete="off"
          value={raw[f.no] ?? ''}
          onFocus={() => touch(f.no)}
          onChange={(e) => setRaw((r) => ({ ...r, [f.no]: e.target.value }))}
          onBlur={() => done(f)}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-[18px] tabular-nums text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#127a63]"
        />
      </div>
    </div>
  );

  let idx = 0;
  return (
    <div>
      <h1 className="text-[24px] font-bold leading-tight text-slate-900 sm:text-[28px]">
        {PAID_CHROME.h2}
      </h1>

      {PAID_GROUPS.filter((g) => g !== '詳細').map((g) => (
        <section key={g} className="mt-7">
          <h2 className="text-[19px] font-bold text-slate-900">{g}</h2>
          {g === PAID_GROUPS[0] ? (
            <p className="mt-2 text-base leading-relaxed text-slate-800">
              {PAID_CHROME.hikitsugiHon}
            </p>
          ) : null}
          <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
            {(byGroup.get(g) ?? []).map((f) => oneField(f, idx++))}
          </div>
        </section>
      ))}

      {/*
        §5-2：**既定では閉じています。**基準HTMLは資料用に開いています。

        【2026-08-19・戦術Coworkの指摘で直しました】
          前は `{shosaiOpen ? … : null}` で、**閉じているあいだ8項目がDOMにありませんでした。**
          そのため
            ・そちらが描き出したHTMLを見ても、㉕㉖㉗㉔㉓㉑㉒⑰ を**検算できません**
            ・ページ内検索（⌘F）で「配偶者」を探しても**見つかりません**
            ・読み上げソフトにも届きません
          **基準HTML自身が `<details>` を使っています。**同じ形にしました。
          `<details>` は閉じていても**中身がDOMに残ります**。開閉はブラウザがやります。
      */}
      <details
        className="mt-7 rounded-2xl border border-slate-300 bg-white"
        onToggle={(e) => { if ((e.currentTarget as HTMLDetailsElement).open) openShosai(); }}
      >
        <summary className="cursor-pointer list-none p-4">
          <span className="block text-[17px] font-bold text-slate-900">
            {PAID_CHROME.shosaiSummary[0]}
          </span>
          <span className="mt-1 block text-[13px] leading-relaxed text-[#5b6470]">
            {PAID_CHROME.shosaiSummary[1]}
          </span>
          <span className="mt-1.5 block text-[14px] font-bold text-[#8f2f2f]">
            {PAID_CHROME.shosaiWarn}
          </span>
        </summary>
        <div className="border-t border-slate-200 bg-slate-50 p-4 sm:p-5">
          {(byGroup.get('詳細') ?? []).map((f) => oneField(f, idx++))}
        </div>
      </details>

      <button
        type="button"
        onClick={submit}
        className="mt-8 w-full rounded-xl bg-[#127a63] px-4 py-4 text-[18px] font-bold text-white hover:bg-[#0f5f4e]"
      >
        {PAID_CHROME.btn}
      </button>

      {/* 数字キーボードがせり上がっても最後の項目が隠れないよう、下に余白を取る（§5-1と同じ理由） */}
      <div className="h-24" aria-hidden="true" />

      {info ? <InfoDialog f={info} onClose={() => setInfo(null)} /> : null}

      {/* 「現在の年」は呼び出し側から受け取ったものだけを使います（§4-4-2） */}
      <span className="hidden" data-genzai-nen={genzaiNen} />
    </div>
  );
}
