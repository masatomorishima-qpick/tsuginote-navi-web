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
 * 【2026-09-02・A-2a（senjutsu_20260902ae.md 2番）── 欄の出し分け】
 *   A-1 では28項目とも1行の字の欄でした。**欄の種類・鍵・範囲は `lib/retirement/pro/paidRules.ts` の `paidKou()` が持ち、**
 *   ここは種類で欄を出し分けるだけです。
 *     `man`・`en`・`kazu` … `<input inputMode="numeric">`（年月日・年月・歳は `<select>`）／`erabu` … `<select>`／`hai` … ラジオ2つ
 *     複数件（⑪・⑲）… 「もう1件追加する」で1〜5件／「わからない」（⑫⑬）… チェック1つで年月の欄が消える／
 *     「配偶者はいない」（㉕・㉑）・「役員として受け取る退職金はない」（㉓）… チェック1つで、その欄が消える
 *   ★HTML の `required`・`min`・`max` は付けません（検査は `paidRules` の1本で・二重にしない）。
 *   ★誤りの字は親から `ayamari` で受け、その項目の下に1行ずつ出します（字は `paidRules` の `ayamariNoJi()`）。
 *   ★raw は `Record<string,string>`。鍵は `no`／`no/名前`／`no/番号/名前`（`paidRules` の決め）。親へそのまま渡します。
 *   ★「計算結果を見る」は、親が `matteiru` の間は押せません（二度押し・252番）。下に1行（字は親から）。
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
 *   **計算も分岐も持ちません。**値を raw のまま親に渡すだけです。
 *   エンジンへの入れ方は `lib/retirement/pro/paidRules.ts`（raw → PaidInput）と `paidInput.ts`（PaidInput → Jinbutsu）にあります。
 */

'use client';

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { PAID_FIELDS, PAID_GROUPS, PAID_CHROME, type PaidField } from './paidFields';
import { track } from '@/lib/retirement/pro/track';
import {
  paidKou, ayamariNoJi, ranWoHiku, kotekiJogen, seisuNiSuru, JI,
  type Ran, type Kou, type Ayamari,
} from '@/lib/retirement/pro/paidRules';

type Props = {
  /** サーバーで求めた `Asia/Tokyo` の年。**既定値を作りません**（§4-4-2） */
  genzaiNen: number;
  /** 引き継ぎ（通行証の `inputs` から親が作った raw）。**ここで直せます** */
  hikitsugi: Record<string, string>;
  /** 「計算結果を見る」を押したとき（★検査は親が `rawToPaidInput()` で） */
  onSubmit: (raw: Record<string, string>) => void;
  /** 親の検査・口の 400 で返った誤り（★項目の下に出す） */
  ayamari: readonly Ayamari[];
  /** 口の返事を待っている間（ボタンを押せなくする） */
  matteiru: boolean;
  /** 待っている間の1行（戦術の字・親から） */
  matteiruBun: string;
  /** 口が 500 などで返ったときの1文（戦術の字・親から）。無ければ null */
  ayamariBun: string | null;
};

/** ○数字 → 入力欄の id。`⑩-1` のような枝番があるので、そのままでは id に使えません */
const idOf = (kagi: string, i: number): string => `pro7-f${i}-${kagi.replace(/[^A-Za-z0-9]/g, '_')}`;

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

const INPUT_CLS =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-[18px] tabular-nums text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#127a63]';
const SELECT_CLS =
  'rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-[18px] tabular-nums text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#127a63]';

/** 複数件の raw の鍵（`{n}` を番号に） */
const kenKagi = (r: Ran, n: number): string => r.kagi.replace('{n}', String(n));

/** raw に、その件の鍵が1つでも入っているか */
function kenAri(raw: Record<string, string>, kou: Extract<Kou, { katachi: 'ken' }>, n: number): boolean {
  return kou.ran.some((r) => (raw[kenKagi(r, n)] ?? '') !== '');
}

export default function Screen7({
  genzaiNen, hikitsugi, onSubmit, ayamari, matteiru, matteiruBun, ayamariBun,
}: Props) {
  const [raw, setRaw] = useState<Record<string, string>>(() => ({ ...hikitsugi }));
  const [info, setInfo] = useState<PaidField | null>(null);
  const startedRef = useRef(false);
  const detailSentRef = useRef(false);
  const hajimeRef = useRef<number | null>(null);
  const fieldHajimeRef = useRef<Record<string, number>>({});

  // ★28項目の決まり（欄の種類・鍵・範囲）。★「現在の年」は親から受けたものだけ（⑥の年の選択肢に使います）
  const kou = useMemo(() => paidKou(genzaiNen), [genzaiNen]);
  const kouByNo = useMemo(() => new Map(kou.map((k) => [k.no, k])), [kou]);

  /** 複数件の「いま出している件数」（★raw に入っている件から起こす。0件なら0） */
  const [kenSu, setKenSu] = useState<Record<string, number>>(() => {
    const out: Record<string, number> = {};
    for (const k of kou) {
      if (k.katachi !== 'ken') continue;
      let n = 0;
      for (let i = 1; i <= k.max; i++) if (kenAri(hikitsugi, k, i)) n = i;
      out[k.no] = n;
    }
    return out;
  });

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

  /** ★「いない」「ない」のチェックで隠す鍵（全部の項目から集める） */
  const kakusu = useMemo(() => {
    const s = new Set<string>();
    for (const k of kou) {
      if (k.katachi !== 'kumi' || !k.nai) continue;
      if (raw[k.nai.kagi] === 'hai') for (const x of k.nai.kakusu) s.add(x);
    }
    return s;
  }, [kou, raw]);

  /**
   * ★⑳の選択肢の上限（af.md 2番イ）── ⑥が入ったら、その方の繰下げの上限（70 か 75）までに絞ります。
   *   ★式は `zeisei.ts` の `kurisageJogenAge`（`paidRules.kotekiJogen`）。⑥が空の間は絞りません（60〜75）。★検査（ア）は親と口が同じ1本で
   */
  const jogen20 = useMemo(() => {
    const y = seisuNiSuru(raw['⑥/nen'] ?? '');
    if (!y.ok) return null;
    const t = seisuNiSuru(raw['⑥/tsuki'] ?? ''), h = seisuNiSuru(raw['⑥/hi'] ?? '');
    const umare: [number, number] | null = t.ok && h.ok ? [t.n, h.n] : null;
    return kotekiJogen(y.n, umare);
  }, [raw]);

  /** 項目ごとの誤りの字 */
  const ayamariByNo = useMemo(() => {
    const m = new Map<string, string[]>();
    for (const a of ayamari) {
      const ji = ayamariNoJi(a, ranWoHiku(kou, a.kagi));
      const xs = m.get(a.no) ?? [];
      if (!xs.includes(ji)) xs.push(ji);
      m.set(a.no, xs);
    }
    return m;
  }, [ayamari, kou]);

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
    if (matteiru) return;
    const t0 = hajimeRef.current;
    track('pro_paid_submit', {
      elapsed_sec_total: t0 ? Math.max(0, Math.round((Date.now() - t0) / 1000)) : 0,
    });
    onSubmit(raw);
  };

  const set = (kagi: string, v: string) => setRaw((r) => ({ ...r, [kagi]: v }));

  /** 複数件の1件を消す（★あとの件を前に詰める。鍵を並べ直す） */
  const kenWoKesu = (k: Extract<Kou, { katachi: 'ken' }>, n: number) => {
    setRaw((r) => {
      const out = { ...r };
      const su = kenSu[k.no] ?? 0;
      for (let i = n; i < su; i++) for (const ran of k.ran) out[kenKagi(ran, i)] = r[kenKagi(ran, i + 1)] ?? '';
      for (const ran of k.ran) delete out[kenKagi(ran, su)];
      return out;
    });
    setKenSu((s) => ({ ...s, [k.no]: Math.max(0, (s[k.no] ?? 0) - 1) }));
  };

  // ---- 欄1つ -------------------------------------------------------------
  const ran1 = (f: PaidField, r: Ran, i: number) => {
    if (kakusu.has(r.kagi)) return null;
    const id = idOf(r.kagi, i);
    const v = raw[r.kagi] ?? '';
    const onBlur = () => done(f);
    let naka: ReactNode;
    if (r.shurui === 'hai') {
      naka = (
        <span className="inline-flex gap-4">
          {([['hai', JI.hai], ['iie', JI.iie]] as const).map(([val, ji]) => (
            <label key={val} className="inline-flex items-center gap-1.5 text-[17px] text-slate-900">
              <input
                type="radio"
                name={id}
                value={val}
                checked={v === val}
                onChange={() => { touch(f.no); set(r.kagi, val); done(f); }}
                className="h-5 w-5"
              />
              {ji}
            </label>
          ))}
        </span>
      );
    } else if (r.shurui === 'erabu' || r.select) {
      const opts = r.shurui === 'erabu'
        ? (r.sentaku ?? [])
            .filter((s) => !(r.kagi === '⑳' && jogen20 !== null && Number(s.kagi) > jogen20))
            .map((s) => ({ kagi: s.kagi, ji: s.ji }))
        : Array.from({ length: (r.max ?? 0) - (r.min ?? 0) + 1 }, (_, j) => {
            const n = (r.min ?? 0) + j;
            return { kagi: String(n), ji: String(n) };
          });
      naka = (
        <select
          id={id}
          value={v}
          onFocus={() => touch(f.no)}
          onChange={(e) => set(r.kagi, e.target.value)}
          onBlur={onBlur}
          className={SELECT_CLS}
        >
          <option value="" />
          {opts.map((o) => <option key={o.kagi} value={o.kagi}>{o.ji}</option>)}
        </select>
      );
    } else {
      naka = (
        <input
          id={id}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          value={v}
          onFocus={() => touch(f.no)}
          onChange={(e) => set(r.kagi, e.target.value)}
          onBlur={onBlur}
          className={INPUT_CLS}
        />
      );
    }
    const hako = (
      <div key={r.kagi} className="mt-2 flex flex-wrap items-center gap-2">
        {r.ji ? <label htmlFor={id} className="text-[15px] text-slate-800">{r.ji}</label> : null}
        <div className={r.select || r.shurui === 'erabu' || r.shurui === 'hai' ? '' : 'min-w-[10rem] flex-1'}>{naka}</div>
        {r.tani && r.shurui !== 'hai' ? <span className="text-[15px] text-slate-800">{r.tani}</span> : null}
      </div>
    );
    // ★期間の組の上に小さく1行（⑲・㉓。字は `RAN_JI`・senjutsu_20260902ai.md 2番の2）
    if (!r.kumiJi) return hako;
    return (
      <div key={r.kagi}>
        <p className="mt-3 text-[14px] text-slate-600">{r.kumiJi}</p>
        {hako}
      </div>
    );
  };

  /** 項目の欄（形ごと） */
  const ranZenbu = (f: PaidField, k: Kou | undefined, i: number) => {
    if (!k) return null;
    if (k.katachi === 'tan') return ran1(f, k.ran, i);
    if (k.katachi === 'kumi') {
      return (
        <>
          {k.nai ? (
            <label className="mt-2 inline-flex items-center gap-2 text-[17px] text-slate-900">
              <input
                type="checkbox"
                checked={raw[k.nai.kagi] === 'hai'}
                onChange={(e) => { touch(f.no); set(k.nai!.kagi, e.target.checked ? 'hai' : ''); done(f); }}
                className="h-5 w-5"
              />
              {k.nai.ji}
            </label>
          ) : null}
          {k.ran.map((r) => ran1(f, r, i))}
        </>
      );
    }
    if (k.katachi === 'kikan') {
      const wak = raw[k.no] === 'wakaranai';
      return (
        <>
          <label className="mt-2 inline-flex items-center gap-2 text-[17px] text-slate-900">
            <input
              type="checkbox"
              checked={wak}
              onChange={(e) => { touch(f.no); set(k.no, e.target.checked ? 'wakaranai' : ''); done(f); }}
              className="h-5 w-5"
            />
            {JI.wakaranai}
          </label>
          {wak ? null : k.ran.map((r) => ran1(f, r, i))}
        </>
      );
    }
    // 複数件
    const su = kenSu[k.no] ?? 0;
    return (
      <>
        {Array.from({ length: su }, (_, j) => j + 1).map((n) => (
          <div key={n} className="mt-3 rounded-xl border border-slate-200 bg-white p-3">
            {k.ran.map((r) => ran1(f, { ...r, kagi: kenKagi(r, n) }, i))}
            <button
              type="button"
              onClick={() => kenWoKesu(k, n)}
              className="mt-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-[15px] font-bold text-slate-800"
            >
              {JI.sakujo}
            </button>
          </div>
        ))}
        {su < k.max ? (
          <button
            type="button"
            onClick={() => { touch(f.no); setKenSu((s) => ({ ...s, [k.no]: (s[k.no] ?? 0) + 1 })); }}
            className="mt-3 rounded-lg border border-[#127a63] bg-white px-3 py-2 text-[15px] font-bold text-[#127a63]"
          >
            {JI.tsuika}
          </button>
        ) : null}
      </>
    );
  };

  const oneField = (f: PaidField, i: number) => {
    const k = kouByNo.get(f.no);
    // ★㉑は「配偶者はいない」（㉕）で欄ごと消えます。項目ごと出しません
    if (k && k.katachi === 'kumi' && k.ran.every((r) => kakusu.has(r.kagi)) && !k.nai) return null;
    const ay = ayamariByNo.get(f.no) ?? [];
    return (
      <div key={f.no} className="border-b border-slate-200 py-4 last:border-b-0">
        <span className="block text-base font-bold text-slate-900">
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
                  className="ml-1.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-slate-400 align-middle text-[13px] font-bold text-slate-700"
                >
                  i
                </button>
              ) : null}
            </span>
          ) : null}
        </span>

        {ranZenbu(f, k, i)}

        {ay.map((ji) => (
          <p key={ji} className="mt-2 text-[15px] font-bold leading-relaxed text-[#8f2f2f]">{ji}</p>
        ))}
      </div>
    );
  };

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

      {ayamariBun ? (
        <p className="mt-6 text-base font-bold leading-relaxed text-[#8f2f2f]">{ayamariBun}</p>
      ) : null}

      <button
        type="button"
        onClick={submit}
        disabled={matteiru}
        className="mt-8 w-full rounded-xl bg-[#127a63] px-4 py-4 text-[18px] font-bold text-white hover:bg-[#0f5f4e] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {PAID_CHROME.btn}
      </button>
      {matteiru ? (
        <p className="mt-3 text-base leading-relaxed text-slate-800">{matteiruBun}</p>
      ) : null}

      {/* 数字キーボードがせり上がっても最後の項目が隠れないよう、下に余白を取る（§5-1と同じ理由） */}
      <div className="h-24" aria-hidden="true" />

      {info ? <InfoDialog f={info} onClose={() => setInfo(null)} /> : null}

      {/* 「現在の年」は呼び出し側から受け取ったものだけを使います（§4-4-2） */}
      <span className="hidden" data-genzai-nen={genzaiNen} />
    </div>
  );
}
