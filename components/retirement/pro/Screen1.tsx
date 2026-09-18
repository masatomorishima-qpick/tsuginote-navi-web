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

/**
 * 画面1のアイコン4つ（決め1337・1338）。基準HTML（219,643 ／ 988e520d）の `div.ic4` から1字1句写しています。
 * 当社が作ったものです。iDeCo公式のロゴ・キャラクターは使っていません（決め1333）。
 */
const ICON_P = { viewBox: '0 0 48 48', width: 34, height: 34, fill: 'none', stroke: 'currentColor',
  strokeWidth: 2.4, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true } as const;
const ICON4: { label: string; svg: React.ReactNode }[] = [
  { label: '退職金', svg: <svg {...ICON_P}><rect x="8" y="17" width="32" height="21" rx="3"/><path d="M18 17v-3.5a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3V17"/><path d="M8 25h32"/></svg> },
  { label: 'iDeCo', svg: <svg {...ICON_P}><circle cx="18" cy="15.5" r="5.5"/><path d="M8 38c0-5.8 4.5-9.5 10-9.5"/><path d="M32 38V22"/><path d="M26.5 27.5L32 22l5.5 5.5"/></svg> },
  { label: '企業型DC', svg: <svg {...ICON_P}><rect x="8" y="12" width="19" height="26" rx="2"/><path d="M12.5 18h4M19 18h4M12.5 25h4M19 25h4"/><path d="M15.5 38v-6h4v6"/><path d="M35 38V22"/><path d="M29.5 27.5L35 22l5.5 5.5"/></svg> },
  { label: '公的年金', svg: <svg {...ICON_P}><path d="M8 20h32L24 11 8 20z"/><path d="M13 23v12M20.3 23v12M27.7 23v12M35 23v12"/><path d="M7 38h34"/></svg> },
];

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
        【2026-09-18・決め1337・1343（戦術Cowork `kaihatsu_ate_20260918d.md` 3-1・森嶋さんの承認済み）】
          画面1の上半分を、基準HTML（219,643 ／ 988e520d）の `div.hero` のとおりに替えました。
          中央揃え／アイコンは丸の中／STEP1 のすぐ下に入力欄／
          「退職所得控除の2026年（令和8年）改正に対応しています」はボタンの中。
          字とSVGは、基準HTMLの画面1から1字1句写しています（`<br>` の位置も）。

          外した字（基準HTMLから外れたもの。こちらで足したり消したりはしていません）
            副題「退職金・iDeCo・企業型DCの受け取り方で、あなたの手取りはいくら変わるか」
              → 「税金と保険料まで見て、あなたに合う受け取り方を探せます」
            本文5行（改正対応／無料版では…／有料版では…2行／まず、あなたの数字を5つ入力してください。）
              → STEP1・STEP2 と、ボタンの中の1行に替わりました。

          字の大きさは、実装指示書 v4 77行「2. 絶対に守ること」5番（本文16px以上・注記13px以上）に合わせています。
            基準HTMLの 15px・14px・12.5px・11.5px は、本文16px／注記13px に上げました（字は変えていません）。

          アイコン4つは当社が作ったものです。iDeCo公式のロゴ・キャラクターは使っていません（決め1333）。
          `aria-hidden` です。文字のラベル（`<span>`）と組でだけ意味を持つので、ラベルを外さないでください。
      */}
      <div className="text-center">
        {/* 見出しは決め1296・1306 のまま（基準HTMLの `.hero h2`）。`<title>` と OGP は触っていません */}
        <h1 className="mt-0.5 mb-2.5 text-[26px] font-bold leading-[1.35] tracking-[-0.02em] text-slate-900 sm:text-[30px]">
          老後のお金の受け取りシミュレーション
        </h1>
        <p className="text-base font-bold leading-[1.7] text-slate-900">
          税金と保険料まで見て、
          <br />
          あなたに合う受け取り方を探せます
        </p>
        <div className="mt-[18px] mb-1.5 flex justify-center gap-1.5">
          {ICON4.map((ic) => (
            <div key={ic.label} className="flex-1 text-center">
              <div className="mx-auto flex h-[62px] w-[62px] items-center justify-center rounded-full bg-[#e8f3f0] text-[#0f5f4e]">
                {ic.svg}
              </div>
              <span className="mt-1.5 block text-[13px] font-bold tracking-[-0.04em] text-slate-900">{ic.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-2.5 rounded-[14px] border-[1.5px] border-[#0f5f4e] bg-[#e8f3f0] px-[15px] py-[13px]">
        <div className="mb-[3px] text-[13px] font-bold tracking-[0.04em] text-[#0f5f4e]">STEP 1　無料</div>
        <div className="text-base font-bold leading-[1.65] text-slate-900">まずは受け取り方で手取りの違いがあるかを確認しましょう</div>
      </div>

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

      <div className="mt-2.5 rounded-[14px] border-[1.5px] border-slate-200 bg-white px-[15px] py-[13px]">
        <div className="mb-[3px] text-[13px] font-bold tracking-[0.04em] text-[#5b6470]">STEP 2　有料版</div>
        <div className="text-base font-bold leading-[1.65] text-slate-900">公的年金を受け取り始める年齢まで動かして、保険料・医療費の負担も見て、あなたが選べる受け取り方を全部比べます</div>
      </div>

      {/* 決め1337：「退職所得控除の2026年（令和8年）改正に対応しています」はボタンの中（基準HTML `span.btnsub`） */}
      <button
        type="button"
        onClick={submit}
        className="mt-4 w-full rounded-xl bg-gradient-to-b from-[#127a63] to-[#0f5f4e] px-6 py-4
                   text-[18px] font-bold text-white
                   focus:outline-none focus:ring-2 focus:ring-[#0f5f4e] focus:ring-offset-2"
      >
        無料で計算する
        <span className="mt-[3px] block text-[13px] font-medium tracking-normal opacity-90">退職所得控除の2026年（令和8年）改正に対応しています</span>
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
      {/* 決め1337：字は1文字も変えていません。見せ方だけ、札2つに替えました（基準HTML `div.anshin`） */}
      <div className="mt-3 mb-0.5 flex flex-col items-center gap-1.5">
        <p className="inline-flex items-center gap-[5px] rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[13px] text-[#5b6470]">
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shrink-0 text-[#0f5f4e]"><rect x="4" y="10.5" width="16" height="10" rx="2"/><path d="M8 10.5V7a4 4 0 0 1 8 0v3.5"/></svg>
          あなたが入力した金額を、当社は保存しません。
        </p>
        <p className="inline-flex items-center gap-[5px] rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[13px] text-[#5b6470]">
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shrink-0 text-[#0f5f4e]"><circle cx="12" cy="12" r="8.5"/><path d="M6.2 6.2l11.6 11.6"/></svg>
          金融商品の販売はありません。
        </p>
      </div>

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
      {/*
        【2026-09-18・決め1338（戦術Cowork `kaihatsu_ate_20260918d.md` 3-1・森嶋さんの承認済み）】
          例のカードを横3枚にし、金額を先に大きく・条件を下に小さくしました（基準HTML `div.reix.big`）。
          人物の絵は、横3枚では出しません（基準HTML `.reix.big .rei-av{display:none}`）。
          0円のカードは置きません（「差が出ない方もいます」は下の字に在ります）。
          2枚めの金額は紺（#2c4a7c）です（基準HTML 418行 `.rei-av.b + .rei-b .rei-n`）。
          条件の字は 13px です（基準HTMLは 10.5px。実装指示書 v4「2. 絶対に守ること」5番で 13px に上げました）。
      */}
      {/* 基準HTMLの `div.reix.big` は、外枠を持ちません（前はこの section に枠と内側の余白が在りました。横3枚にすると1枚の幅が約22px狭くなるので外しました） */}
      <section className="mt-6">
        <p className="text-center text-base font-bold leading-relaxed text-slate-900 [text-wrap:balance]">{REI_MIDASHI}</p>

        <ul className="mt-3 flex gap-2">
          {REI.map((r, k) => (
            <li key={r.sa} className="flex min-w-0 flex-1 flex-col items-center gap-1.5 rounded-xl bg-slate-50 px-2.5 py-3.5 text-center">
              <p className={`text-[20px] font-bold leading-tight tracking-[-0.04em] tabular-nums ${k === 1 ? 'text-[#2c4a7c]' : 'text-[#127a63]'}`}>{r.sa}</p>
              <p className="mt-1.5 text-[13px] leading-[1.55] text-slate-700 [word-break:keep-all] [overflow-wrap:anywhere]">
                {r.jouken.map((line) => (
                  <span key={line} className="block">{line}</span>
                ))}
              </p>
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
