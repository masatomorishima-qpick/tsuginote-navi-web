/**
 * components/retirement/pro/Screen1.tsx
 *
 * 入力画面（無料・5項目）。文言は添付HTMLの基準どおりです。
 *
 * 【守っていること】
 *  §5-1  入力は5項目のまま。**増やさない。**
 *        数字入力でスマホのキーボードがせり上がるので、**⑤が隠れないよう下部の余白を広く取る。**
 *  §7-1  本文16px以上・注記13px以上。モックアップの12.5px／11.5pxは使わない。
 *  §7-4  大きなボタンはサイトの緑（#127a63→#0f5f4e）。**橙（#c2410c）は購入ボタンにしか使わない。**
 *  §7-5  金額は等幅数字（tabular-nums）。
 *  §2の10 利用者に見せる文に「画面◯」と書かない。
 *  §8-2  #2 `pro_input_start`（①に最初に触れた）／#3 `pro_input_field`（各項目を入れ終えるたび）／
 *        #4 `pro_calc_click`。
 */

'use client';

import { useRef, useState } from 'react';
import { FIELDS, type FieldNo, type FreeInput } from './types';
import { track } from '@/lib/retirement/pro/track';
import { REI, REI_MIDASHI, REI_ZERO, REI_SHUTTEN } from './rei1';

type Props = {
  /** 入力が揃ったときに呼ばれる。親が計算して結果に切り替える */
  onSubmit: (v: FreeInput) => void;
  /** 「戻る」で入力画面に戻ったときに、打った内容を消さずに再表示するための初期値（保存はしません） */
  initial?: Partial<Record<keyof FreeInput, string>>;
  onChangeRaw?: (raw: Record<string, string>) => void;
};

/** 全角数字と区切り記号を落として半角の数字だけにする（55〜65歳の利用者は全角で打つことがある） */
function toHankakuDigits(s: string): string {
  return s
    .replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0))
    .replace(/[^0-9]/g, '');
}

const withComma = (s: string): string =>
  s === '' ? '' : Number(s).toLocaleString('en-US');

export default function Screen1({ onSubmit, initial, onChangeRaw }: Props) {
  const [raw, setRaw] = useState<Record<string, string>>(() => ({
    taishokukinMan: initial?.taishokukinMan ?? '',
    kinzokuNensu: initial?.kinzokuNensu ?? '',
    idecoMan: initial?.idecoMan ?? '',
    kanyuNensu: initial?.kanyuNensu ?? '',
    taishokuAge: initial?.taishokuAge ?? '',
  }));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const startedRef = useRef(false);
  const fieldSentRef = useRef<Set<FieldNo>>(new Set());

  const setValue = (key: string, next: string) => {
    if (!startedRef.current) {
      startedRef.current = true;
      track('pro_input_start');            // §8-2 #2
    }
    const v = { ...raw, [key]: toHankakuDigits(next) };
    setRaw(v);
    onChangeRaw?.(v);
  };

  /** 入れ終えたとき（フォーカスが外れたとき）に1度だけ送る。§8-2 #3 */
  const onBlurField = (no: FieldNo, key: string) => {
    if (raw[key] !== '' && !fieldSentRef.current.has(no)) {
      fieldSentRef.current.add(no);
      track('pro_input_field', { field_no: no });
    }
  };

  const validate = (): FreeInput | null => {
    const e: Record<string, string> = {};
    const out: Record<string, number> = {};
    for (const f of FIELDS) {
      const s = raw[f.key];
      if (s === '') { e[f.key] = 'ご入力ください'; continue; }
      const n = Number(s);
      if (!Number.isFinite(n)) { e[f.key] = '数字でご入力ください'; continue; }
      if (n < f.min || n > f.max) {
        e[f.key] = `${f.min.toLocaleString('en-US')}〜${f.max.toLocaleString('en-US')}${f.unit}の範囲でご入力ください`;
        continue;
      }
      out[f.key] = n;
    }
    // 入社年齢の整合。判定側と同じ考え方（⑤−②が18歳未満だと勤め始めが早すぎる）
    if (!e.kinzokuNensu && !e.taishokuAge && out.taishokuAge - out.kinzokuNensu < 15) {
      e.kinzokuNensu = 'ご入力の勤続年数だと、勤め始めが15歳より前になります。ご確認ください';
    }
    setErrors(e);
    if (Object.keys(e).length) {
      // 最初の誤りへ移動する（55〜65歳の利用者に、どこが問題かを探させない）
      const first = FIELDS.find((f) => e[f.key]);
      if (first) document.getElementById(`pro-f${first.no}`)?.focus();
      return null;
    }
    return out as unknown as FreeInput;
  };

  const submit = () => {
    const v = validate();
    if (!v) return;
    track('pro_calc_click');                 // §8-2 #4
    onSubmit(v);
  };

  return (
    <div>
      <h1 className="text-[26px] font-bold leading-tight text-slate-900 sm:text-[30px]">
        退職金とiDeCoの受け取り方で、あなたの手取りはこれだけ変わります
      </h1>

      <p className="mt-4 text-base leading-relaxed text-slate-800">
        退職所得控除の<b className="font-bold">2026年（令和8年）改正</b>に対応しています。
        <br />
        <b className="font-bold">無料版では、あなたの手取りがいくら変わるかをお出しします。</b>
        <br />
        <b className="font-bold">
          有料版では、あなたの公的年金・保険料・医療費の負担まで見て、最大41,216通りの手取りシミュレーションを抽出します。
        </b>
        <br />
        まず、あなたの数字を5つ入力してください。
      </p>

      {/*
        【判断ログ ★81・2026-08-20】画面1に「当社が計算した例」を3つ置きます。

        【なぜ置くか】いまの画面1には**金額が1つも出ていませんでした。**数字は「41,216通り」
          だけで、これは見本の方の通り数です。「これだけ変わります」と書いておきながら、
          **いくら変わるのかがどこにも書いていませんでした**（オーナー指摘）。

        【ここで守っていること】
          ・**金額は `rei1.ts` から出します。**それは `kensa/gamen1_chushutsu.mjs` が
            基準HTMLから機械で作ったものです。**実装側で計算し直しません**（§5-1-2 のお願い1）。
          ・**「◯%の方は◯円変わります」という割合の文を足しません**（同3）。
            格子の組み方だけで「差0円」の割合が 12%→15.0%→25.7% と動きます。
            どれも実測ですが、**どれも来訪者の分布ではありません。**出どころに答えられません。
          ・**「差が出ない方もいます」を、例と同じブロックに、本文と同じ大きさで出します**（★81）。
            小さく書くと後出しになります（§2の5）。**16px です。**
          ・**人物は輪郭だけの絵**です。写真は「お客様の声」と読まれるおそれがあります。
            **「実在の方ではありません」**を見出しに書いています。
          ・見出し（h1）は変えていません（★81）。
      */}
      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
        <p className="text-base leading-relaxed text-slate-800">{REI_MIDASHI}</p>

        <ul className="mt-3 space-y-3">
          {REI.map((r) => (
            <li key={r.sa} className="flex items-start gap-3 rounded-xl bg-slate-50 p-3 sm:p-4">
              {/* 輪郭だけの絵。**写真は使いません**（★81） */}
              <svg
                viewBox="0 0 40 40"
                aria-hidden="true"
                className="mt-0.5 h-10 w-10 shrink-0 fill-[#9aa5b1]"
              >
                <circle cx="20" cy="13" r="7.6" />
                <path d="M5.8 36c0-7.8 6.4-14.2 14.2-14.2S34.2 28.2 34.2 36z" />
              </svg>
              <div className="min-w-0">
                <p className="text-[15px] leading-relaxed text-slate-700">
                  {r.jouken.map((line) => (
                    <span key={line} className="block">{line}</span>
                  ))}
                </p>
                <p className="mt-1.5 text-[20px] font-bold tabular-nums text-[#127a63]">{r.sa}</p>
                <p className="mt-0.5 text-[15px] tabular-nums text-slate-700">{r.maeAto}</p>
              </div>
            </li>
          ))}
        </ul>

        {/* **本文と同じ 16px。**同じブロックの中に置きます（★81） */}
        <p className="mt-4 text-base leading-relaxed text-slate-800">
          {REI_ZERO.split('\n').map((line, k) => (
            <span key={line} className="block">
              {k === 0 ? <b className="font-bold">差が出ない方もいます。</b> : null}
              {k === 0 ? line.replace('差が出ない方もいます。', '') : line}
            </span>
          ))}
        </p>

        <p className="mt-3 text-[13px] leading-relaxed text-[#5b6470]">{REI_SHUTTEN}</p>
      </section>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
        {FIELDS.map((f) => (
          <div key={f.key} className="border-b border-slate-200 py-4 last:border-b-0">
            <label htmlFor={`pro-f${f.no}`} className="block text-base font-bold text-slate-900">
              {f.label}
              {f.note ? (
                <span className="mt-0.5 block text-[13px] font-normal text-[#5b6470]">{f.note}</span>
              ) : null}
            </label>

            <div className="mt-2 flex items-baseline gap-2">
              <input
                id={`pro-f${f.no}`}
                // type="text" ＋ inputMode="numeric"：スマホで数字キーボードを出しつつ、
                // number 型のスピナーと入力途中の空文字問題を避ける
                type="text"
                inputMode="numeric"
                autoComplete="off"
                enterKeyHint={f.no === 5 ? 'go' : 'next'}
                aria-describedby={errors[f.key] ? `pro-e${f.no}` : undefined}
                aria-invalid={errors[f.key] ? true : undefined}
                className={[
                  'w-full max-w-[10rem] rounded-lg border bg-white px-3 py-2.5',
                  'text-right text-[22px] font-bold tabular-nums text-slate-900',
                  'focus:outline-none focus:ring-2 focus:ring-[#127a63]',
                  errors[f.key] ? 'border-[#8f2f2f]' : 'border-slate-300',
                ].join(' ')}
                placeholder={f.placeholder}
                value={withComma(raw[f.key])}
                onChange={(ev) => setValue(f.key, ev.target.value)}
                onBlur={() => onBlurField(f.no, f.key)}
                onKeyDown={(ev) => { if (ev.key === 'Enter' && f.no === 5) submit(); }}
              />
              <span className="text-base text-slate-700">{f.unit}</span>
            </div>

            {errors[f.key] ? (
              <p id={`pro-e${f.no}`} role="alert" className="mt-1.5 text-[13px] text-[#8f2f2f]">
                {errors[f.key]}
              </p>
            ) : null}
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={submit}
        className="mt-6 w-full rounded-xl bg-gradient-to-b from-[#127a63] to-[#0f5f4e] px-6 py-4
                   text-[18px] font-bold text-white
                   focus:outline-none focus:ring-2 focus:ring-[#0f5f4e] focus:ring-offset-2"
      >
        無料で計算する
      </button>

      <p className="mt-3 text-[13px] leading-relaxed text-[#5b6470]">
        入力された内容は保存されません。
        <br />
        金融商品の販売はありません。
      </p>

      {/*
        §5-1：スマホの数字キーボードがせり上がっても⑤が隠れないよう、下に大きく余白を取る。
        キーボードの高さは端末で違うので、実機（iPhone SE 相当の375px幅）で必ず確認すること。
      */}
      <div aria-hidden className="h-[45vh] min-h-[18rem]" />
    </div>
  );
}
