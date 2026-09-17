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

import { useEffect, useRef, useState } from 'react';
import { FIELDS, type FieldNo, type FreeInput } from './types';
import { track } from '@/lib/retirement/pro/track';
import { observeScrollDepth } from '@/lib/retirement/pro/blocks';
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
  const rootRef = useRef<HTMLDivElement>(null);

  /**
   * ★★★【2026-09-17・戦術Cowork「まとめ便」お願い5】★**画面1の読み進みを測ります。**
   *   ★★**画面2（`Screen2.tsx` 51行）・画面5-6（`Screen56.tsx` 55行）と同じ形**です
   *     ── ★同じ `observeScrollDepth`（`lib/retirement/pro/blocks.ts` 83行）を呼びます。
   *   ★★★**名前は `pro_lp_scroll`**（★25/50/75/100・同じ深さは一度だけ）。
   *   ★★**測る高さは、このかたまり全部**です ── ★いちばん下の
   *     「キーボードよけの余白」（★`h-[45vh] min-h-[18rem]`）も入ります。
   *     ★★★**つまり100%は「余白の底まで来た」であって、「⑤を入れ終えた」ではありません。**
   *     ★読むときは、この1行を思い出してください。
   */
  useEffect(() => {
    if (!rootRef.current) return;
    return observeScrollDepth('pro_lp_scroll', rootRef.current);
  }, []);

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
    <div ref={rootRef}>
      {/*
        ★★★2026-09-16・決め1296（★戦術Cowork `senjutsu_20260916h.md` 2-1・森嶋さんのお決め）
          ★★**見出し（h1）を、ツール名にしました。**★★★**見出しと副題を入れ替えたものです。**
          ★前 …… 「退職金・iDeCo・企業型DCの受け取り方で、あなたの手取りはいくら変わるか」
            ★★その字は、下の**副題**に移りました（★消していません）。
          ★さらに前（決め1263まで） …… 「退職金とiDeCoの受け取り方で、あなたの手取りは**これだけ変わります**」
          ★★基準HTML **552行**から1字1句写しています。
      */}
      {/*
        ★★★2026-09-17・決め1306（★戦術Cowork `senjutsu_20260917.md` 2節・森嶋さんのお決め）
          ★★**見出しから【2026年改正対応】を外しました。**
          ★理由 …… ★★**3行下の本文に「退職所得控除の2026年（令和8年）改正に対応しています。」が在り、
            同じことを2回申し上げていました**（★基準HTML 552行と555行）。
          ★★★**`<title>`（`PAGE_TITLE`）と OGP の「【2026年改正対応】」は、外しません**（★決め1306）──
            ★①`<title>` は**検索結果に出る字**で、★頁を開く前に「何に対応しているか」を伝える役目です。
            ★②★★**替えると GA4 の画面名がまた切れます**（★2026-09-16 に1度切れたばかりです）。
          ★★基準HTML **552行**から1字1句写しています。
      */}
      <h1 className="text-[26px] font-bold leading-tight text-slate-900 sm:text-[30px]">
        老後のお金の受け取りシミュレーション
      </h1>

      {/*
        ★★★2026-09-16・決め1296（★戦術Cowork `senjutsu_20260916h.md` 2-1）── ★**副題**です。
          ★★**見出しのすぐ下**に置きます。★基準HTML **554行**から1字1句写しています。
          ★★★**前の副題「公的年金を受け取り始める年齢も変えて、全通りを計算します。」は入れません。**
            ★理由 …… ★★**無料版は「受け取る年だけ」を計算します。**★購入前の副題で
            「全通りを計算します」と申し上げるのは言い過ぎでした（★戦術Coworkの自認）。
            ★中身は、下の本文の**有料版の2行**に入っています。
          ★★基準HTMLは `<p class="hon"><b>…</b></p>`（★**本文・太字**）です。
      */}
      <p className="mt-4 text-base font-bold leading-relaxed text-slate-900">
        退職金・iDeCo・企業型DCの受け取り方で、あなたの手取りはいくら変わるか
      </p>

      <p className="mt-4 text-base leading-relaxed text-slate-800">
        退職所得控除の<b className="font-bold">2026年（令和8年）改正</b>に対応しています。
        <br />
        <b className="font-bold">無料版では、あなたの手取りがいくら変わるかをお出しします。</b>
        <br />
        {/*
          ★★★2026-09-16・決め1296（★戦術Cowork `senjutsu_20260916h.md` 2-2）── ★**2行に分けました。**
            ★前 …… 「有料版では、あなたの公的年金・保険料・医療費の負担まで見て、
              最大41,216通りの手取りシミュレーションを抽出します。」
            ★★理由 …… ★★★**41,216通りを生んでいるのは iDeCo等の受け取り方と公的年金の年齢なのに、
              その字が1つも入っていませんでした**（★基準HTML 664行「この5つを組み合わせると 41,216通り」と食い違い）。
            ★「抽出します」→「比べます」…… ★基準HTML 674行「比べるのは、有料版です」に揃えました。
          ★★基準HTML **555行**から1字1句写しています（★`<br>` の分け方も）。
        */}
        <b className="font-bold">
          有料版では、あなたのiDeCo・企業型DCを、いつ・どの形で受け取るかまで計算します。
        </b>
        <br />
        <b className="font-bold">
          公的年金を受け取り始める年齢と組み合わせて、保険料・医療費の負担まで見て、最大41,216通りの手取りを比べます。
        </b>
        <br />
        まず、あなたの数字を5つ入力してください。
      </p>

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

      {/*
        ★★★2026-09-16・決め1297（★戦術Cowork `senjutsu_20260916i.md` 1節・森嶋さんのお決め）
          ★前 …… 「入力された内容は保存されません。」
          ★★★**消しませんでした。★字を替えました。**
          ★★この1行は「リセットされます」という便利さの字ではありません ── ★★★**2026-08-18 に、
            `taishokukin`・`ideco` を GA4 へ送るのをやめて「帯」にさせた約束の字**です
            （★`lib/retirement/pro/track.ts` 140〜141行・`lib/retirement/pro/band.ts` 5行）。
          ★★替えた理由 …… ★「保存されません」は受け身で、**誰が持たないか**が書いてありません／
            ★**主語に「あなたの」を入れる**（★移管指示書5）／★**「金額」と書くと、何を持たないかが分かります**。
          ★★★**「Googleにも残りません」とは書きません** …… ★**帯（範囲）は送っています**
            （★`pro_result_view` の `taishoku_band`・`ideco_band`）。★書けない字は書きません。
          ★★基準HTML **566行**から1字1句写しています。
      */}
      <p className="mt-3 text-[13px] leading-relaxed text-[#5b6470]">
        あなたが入力した金額を、当社は保存しません。
        <br />
        金融商品の販売はありません。
      </p>

      {/*
        ★★★2026-09-16・決め1296（★戦術Cowork `senjutsu_20260916h.md` 2-4・森嶋さんのお決め）
          ★★**この「当社が計算した例」を、入力欄より後ろに下げました**（★前は入力欄の前に在りました）。
          ★★★理由 …… ★本文の終わりが「**まず、あなたの数字を5つ入力してください。**」ですので、
            ★**その次に入力欄が在るのが筋**です（★前は、例のカード3枚が間に挟まっていました）。
          ★★基準HTML **557〜566行が入力欄・ボタン・注記、568行から例**です（★同じ順に並べています）。
          ★★★**画面1の形が変わった日 ＝ 2026-09-16**（★GA4 の数を並べるときの切れ目です）。

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
          ・★81 の回は、見出し（h1）を変えていません。
            ★★**その後、決め1263（2026-09-16）と決め1296（同日）で2度変わりました。**
            ★いまの h1 は「老後のお金の受け取りシミュレーション【2026年改正対応】」です。
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

      {/*
        §5-1：スマホの数字キーボードがせり上がっても⑤が隠れないよう、下に大きく余白を取る。
        キーボードの高さは端末で違うので、実機（iPhone SE 相当の375px幅）で必ず確認すること。
      */}
      <div aria-hidden className="h-[45vh] min-h-[18rem]" />
    </div>
  );
}
