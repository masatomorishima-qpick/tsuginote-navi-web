/**
 * components/retirement/pro/PaidApp.tsx — 有料版の親（A-2a-1・senjutsu_20260902ad.md 1番）
 *
 * ★★1つの頁（`/retirement/pro/kekka`）の中で `step` を切り替えます（ProApp と同じ形・§6-14）。URL は変えません。
 *
 * 【この便で出すもの】画面7（入力）→ 口（`/retirement/pro/inputs`）→ 画面8（結果）→「詳細を見る」の「根拠」→ 画面13。
 * 【この便で出さないもの】画面9〜12・一覧・図（ア／イの決めのあと）。★「一覧」「比較」「計算過程」「手続き」の行は、押しても何もしません。
 *
 * ★決め
 *   ・props は `unknown` で受け、親の中で形を確かめます（形が違えば「入力から」に落とす）
 *   ・最初の姿 … `kekka` が有る（形が合う）→ 画面8から／無い → 画面7から
 *   ・画面7の `onSubmit(raw)` → **親が `rawToPaidInput(raw, genzaiNen)`**（誤りがあれば画面7に戻す・字は paidRules）→ 通れば口へ POST
 *     → 返事の `kekka` を state に → 画面8
 *   ・待つ間 … ボタンを押せなくし、1行（★字は戦術の・下の `BUN`）。時間の数は書かない
 *   ・口が 500／通信の失敗 … `ayamariBun` の1文を置き、画面7に戻す／口が 401 … `/retirement/pro/kekka` へ（頁が①の姿を出す）
 *   ・★「この計算の根拠」を押したら、**差し込んだところまで画面を動かす**（A-2a2・下の `useEffect`）
 *   ・画面8の上に小さく2行（★戦術の字・基準HTMLに無い部品・判断ログに残す）
 *       `ご利用いただける期間は、{kigen}までです。`／`[入力を変更する]` → 画面7（raw を入れて戻る・★字は A-2a2→A-2a3 で2度直しました）
 *   ・Excel … `onDownload` → fetch → blob → 保存（ボタンを押せなくし、1行）。`kekka` が無い間はボタンが出ない（画面8が無い）
 *   ・★`track()` はここで呼びません（画面7・8・13が自分で呼びます。A-2b で決め直す分は触らない）
 *   ・★「現在の年」は頁から受けたものだけ（既定値を作らない）
 */

'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Screen7 from './Screen7';
import Screen8 from './Screen8';
import Screen13 from './Screen13';
import { hitogotoBun } from './gamen13Bun';
import { rawToPaidInput, inputsKaraRaw, type Ayamari } from '@/lib/retirement/pro/paidRules';
import { kekkaKa, type Kekka } from '@/lib/retirement/pro/kekkaKata';

/** ★戦術の字（senjutsu_20260902ad.md 1-2・1-4・3番・y.md 1番）。1文字も変えないでください */
const BUN = {
  matteiru: '計算しています。そのままお待ちください。この画面を閉じないでください。',
  shippai: '計算できませんでした。しばらくたってから、もう一度「計算結果を見る」を押してください。それでも計算できないときは、support@tsuginotenavi.jp までご連絡ください。',
  /**
   * ★★★【2026-09-15・決め1222】**戦術Coworkが `tome.md` B の「`PaidApp.tsx` を触らない」を、
   *   ★この1つの字だけ、明示に解かれました**（★`senjutsu_20260915c.md` 4-1）。
   *
   * ★★【なぜ直すか】…… ★前は「ファイルを作っています。そのままお待ちください。」だけで、
   *   ★★**何通り計算しているかも、時間がかかることも、出ていませんでした**。
   *   ★★★**通り数のいちばん多い方（41,216通り）は、押してから待つ時間があります。**
   *     ★★【2026-09-15・決め1226】**ここに秒数を書きません。**
   *       ★前はここに「実測 …… 18秒以上」と書いていました。★★**こちらの誤りです** ──
   *       ★その数は、同じ便の中で「器の忙しさが混じっていた」と自分で直した数でした
   *         （★同じ本を測り直すと 13.8秒でした）。
   *       ★★★**器で測った秒数を、条件なしに「実測」と書かない。**
   *         ★書くなら「いつ・どの器で・何回まわしたまん中か」まで。★書けないなら**数を書かない**。
   *       ★★**本当の数は Vercel でしか出ません。**
   * ★★字は**基準HTML 891行から1字1句写しました**（★`tsuginote_gamen_base.html` 187,926／`67b25af7…`）。
   * ★★★**秒数（「◯秒ほどかかります」）は、まだ書きません**（★Vercel で測っていません・決め1222）。
   *
   * ★★★**通り数は、こちらで組み立てていません。**★`gamen8Bun()` が作った字
   *   （`Bun8.toorisuJi`）を、そのまま受け取ります（★§2の3・実装側に式を持たせない）。
   */
  excelMatteiru: (toorisuJi: string) =>
    `あなたの${toorisuJi}をすべて計算して、ファイルにまとめています。`
    + '少し時間がかかります。この画面を閉じないでください。',
  kigen: (k: string) => `ご利用いただける期間は、${k}までです。`,
  // 【2026-09-03・A-2a3（senjutsu_20260903g.md 2番）】森嶋さんの決めで「入力を変更する」に。
  //   ★「ご入力の内容を直す」（A-2a）→「入力した内容を変える」（A-2a2）→「入力を変更する」（A-2a3）。
  //   ★ほかのボタン（「計算結果を見る」「詳細を見る」）と、動きの言い方でそろえています。
  naosu: '入力を変更する',
} as const;

const KUCHI_INPUTS = '/retirement/pro/inputs';
const KUCHI_EXCEL = '/retirement/pro/excel';
const KEKKA_PATH = '/retirement/pro/kekka';
const EXCEL_FILENAME = 'tsuginote_kekka.xlsx';

type Props = {
  /** 頁が `tokyoYear(new Date())` で作った今年 */
  genzaiNen: number;
  /** 期限の字（`kigenNoJi(expires_at)`・頁が作る） */
  kigen: string;
  /** 通行証の `inputs`（形は親で確かめる） */
  inputs: unknown;
  /** 通行証の `kekka`（形は親で確かめる。null＝まだ計算していない） */
  kekka: unknown;
};

type Step = 'input' | 'result';

export default function PaidApp({ genzaiNen, kigen, inputs, kekka: kekkaMoto }: Props) {
  const hajimeKekka = useMemo(() => (kekkaKa(kekkaMoto) ? kekkaMoto : null), [kekkaMoto]);
  const [step, setStep] = useState<Step>(hajimeKekka ? 'result' : 'input');
  const [raw, setRaw] = useState<Record<string, string>>(() => inputsKaraRaw(inputs));
  const [kekka, setKekka] = useState<Kekka | null>(hajimeKekka);
  const [matteiru, setMatteiru] = useState(false);
  const [ayamari, setAyamari] = useState<Ayamari[]>([]);
  const [ayamariBun, setAyamariBun] = useState<string | null>(null);
  const [konkyo, setKonkyo] = useState(false);
  const konkyoRef = useRef<HTMLDivElement | null>(null);
  const [excelMatteiru, setExcelMatteiru] = useState(false);
  const okuttaRef = useRef(false);

  /**
   * ★「この計算の根拠」を押したら、**差し込んだところまで画面を動かす**（A-2a2・senjutsu_20260903b.md 3-1）。
   *
   * 【なぜ要るか】画面13は画面8の**下**に足すだけで、押した所と見出しの間に 136px あります。
   *   ★★押した場所が画面の下端だと、**何も起きていないように見えます**（森嶋さんが本番で「出てこない」と言われた所）。
   *   ★描いたあとに動かすので、`useEffect` で `konkyo` を見ます（★描く前に動かすと、まだ場所がありません）。
   */
  useEffect(() => {
    if (!konkyo) return;
    konkyoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [konkyo]);

  // ---- 画面7 → 口 → 画面8 -------------------------------------------------
  const onSubmit = useCallback(async (r: Record<string, string>) => {
    if (okuttaRef.current) return;                 // ★二度押し（252番）
    setRaw(r);
    setAyamariBun(null);
    // ★先に親で検査（口と同じ1本）。誤りがあれば画面7のまま（字を出す）
    const y = rawToPaidInput(r, genzaiNen);
    if (!y.ok) { setAyamari(y.ayamari); return; }
    setAyamari([]);
    okuttaRef.current = true;
    setMatteiru(true);
    try {
      const res = await fetch(KUCHI_INPUTS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ raw: r }),
        credentials: 'same-origin',
        cache: 'no-store',
      });
      if (res.status === 401) {
        // ★Cookie が切れた・通行証が無い → 頁が①③の姿を出します
        window.location.href = KEKKA_PATH;
        return;
      }
      if (res.status === 400) {
        const j = (await res.json().catch(() => null)) as { ayamari?: unknown } | null;
        if (Array.isArray(j?.ayamari)) {
          setAyamari(j!.ayamari as Ayamari[]);
        } else {
          setAyamariBun(BUN.shippai);
        }
        return;
      }
      if (res.status !== 200) {
        setAyamariBun(BUN.shippai);
        return;
      }
      const j = (await res.json()) as { kekka?: unknown };
      if (!kekkaKa(j.kekka)) {
        setAyamariBun(BUN.shippai);
        return;
      }
      setKekka(j.kekka);
      setKonkyo(false);
      setStep('result');
      window.scrollTo({ top: 0, behavior: 'auto' });
    } catch {
      setAyamariBun(BUN.shippai);
    } finally {
      okuttaRef.current = false;
      setMatteiru(false);
    }
  }, [genzaiNen]);

  // ---- Excel --------------------------------------------------------------
  const onDownload = useCallback(async () => {
    if (excelMatteiru) return;
    setExcelMatteiru(true);
    try {
      const res = await fetch(KUCHI_EXCEL, { credentials: 'same-origin', cache: 'no-store' });
      if (res.status === 401) { window.location.href = KEKKA_PATH; return; }
      if (res.status !== 200) return;              // ★409／422／500 は、そのまま（ボタンは戻す）
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = EXCEL_FILENAME;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
    } catch {
      /* 通信の失敗。ボタンを戻すだけ */
    } finally {
      setExcelMatteiru(false);
    }
  }, [excelMatteiru]);

  // ---- 描く ---------------------------------------------------------------
  if (step === 'input' || kekka === null) {
    return (
      <Screen7
        genzaiNen={genzaiNen}
        hikitsugi={raw}
        onSubmit={onSubmit}
        ayamari={ayamari}
        matteiru={matteiru}
        matteiruBun={BUN.matteiru}
        ayamariBun={ayamariBun}
      />
    );
  }

  return (
    <div>
      {/* ★戦術の字2つ（基準HTMLに無い部品・ad.md 1-4） */}
      <p className="text-[13px] leading-relaxed text-[#5b6470]">{BUN.kigen(kigen)}</p>
      <p className="mt-1 text-[13px] leading-relaxed">
        <button
          type="button"
          onClick={() => { setAyamari([]); setAyamariBun(null); setStep('input'); window.scrollTo({ top: 0, behavior: 'auto' }); }}
          className="font-medium text-emerald-700 underline hover:text-emerald-800"
        >
          {BUN.naosu}
        </button>
      </p>

      <div className="mt-6">
        <Screen8
          b={kekka.bun8}
          pattern={kekka.pattern}
          onSusumu={(saki) => {
            // ★この便では「根拠」だけ。ほかは 9〜12 の便で決めます（押しても何もしない）
            if (saki === 'konkyo') setKonkyo(true);
          }}
          onDownload={onDownload}
          downloadMatteiru={excelMatteiru}
          // ★★★決め1222 …… 字が通り数を受け取る形になりましたので、この1行も動いています
          //   （tome.md B の解きは BUN.excelMatteiru の1つでしたので、便に書きました）
          downloadBun={BUN.excelMatteiru(kekka.bun8.toorisuJi)}
        />
      </div>

      {konkyo ? (
        <div ref={konkyoRef} className="mt-10 border-t border-slate-200 pt-8">
          <Screen13
            genzaiNen={genzaiNen}
            hitogotoBun={hitogotoBun(kekka.hitogoto13)}
            hitogotoAri={kekka.hitogoto13.ari}
          />
        </div>
      ) : null}
    </div>
  );
}
