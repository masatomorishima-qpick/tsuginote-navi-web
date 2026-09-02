/**
 * lib/retirement/pro/pass.ts — 通行証（B-2）
 *
 * 3つだけ置きます。
 *   1  鍵を作る            … tsuukoushoKagi()
 *   2  期限を計算する       … kigenWoKimeru(買った時刻)
 *   3  無料版5項目を確かめる … freeInputWoTashikameru(なにか)
 *
 * ★決め（案件の決め・senjutsu_20260902f.md / g.md）
 *   ・既定値を作らない。とくに「いまの時刻」は**呼び出し側から渡す**（この本の中で new Date() を作らない）
 *   ・単位は**画面のまま**（万円・年・歳）。円に直すのは A-2（`manToYen`）。ここでは直さない
 *   ・範囲は `components/retirement/pro/types.ts` の `FIELDS` を**そのまま見る**。書き写さない
 *   ・★いまは lib が components を見ています。A-2 で FIELDS と検証を1か所にまとめ、向きを揃えます（判断ログ239番）
 *   ・★⑤−②≧15（勤め始めが15歳より前）の当ては、**ここには書きません**。
 *     いま `Screen1.tsx` の中にしかなく、写すと字が2か所になります。A-2 で1か所にまとめます
 *     （senjutsu_20260902g.md 4番）。いまの穴は、画面を通さず口を直に叩いた場合だけで、
 *     A-2 の門で止まります
 */

import 'server-only';
import { randomBytes } from 'node:crypto';
import { FIELDS, type FreeInput } from '@/components/retirement/pro/types';

/** 通行証の鍵。32バイトの乱数を base64url にした43文字 */
export function tsuukoushoKagi(): string {
  return randomBytes(32).toString('base64url');
}

/**
 * 期限を決める。**買った時刻の1年後・JST で同じ月日・同じ時刻**。
 *
 * ★2月29日に買った方は、翌年 2月28日（同じ時刻）。
 * ★既定値を作りません。買った時刻は、必ず呼び出し側から渡してください。
 *
 * @param kattaToki 買った時刻（Stripe の知らせの `created` から作った Date）
 */
export function kigenWoKimeru(kattaToki: Date): Date {
  const ms = kattaToki.getTime();
  if (!Number.isFinite(ms)) throw new Error('買った時刻が日付ではありません。');

  // JST（UTC+9）の暦の上で、年を1つ進めます
  const JST = 9 * 60 * 60 * 1000;
  const j = new Date(ms + JST);
  const nen = j.getUTCFullYear();
  const tsuki = j.getUTCMonth();      // 0〜11
  const hi = j.getUTCDate();
  const nokori = ms + JST - Date.UTC(nen, tsuki, hi); // その日の 0時からの経過（時刻そのもの）

  const tsugiNoNen = nen + 1;
  // その月の日数（翌年）。2月29日 → 翌年は28日まで
  const sonoTsukiNoHi = new Date(Date.UTC(tsugiNoNen, tsuki + 1, 0)).getUTCDate();
  const hiOsaeta = Math.min(hi, sonoTsukiNoHi);

  return new Date(Date.UTC(tsugiNoNen, tsuki, hiOsaeta) + nokori - JST);
}

/** 確かめた結果。だめだったときは、どの鍵がだめかだけを返します（画面には出しません） */
export type Tashikame =
  | { ok: true; value: FreeInput }
  | { ok: false; dameNaKagi: string[] };

/**
 * 無料版の5項目を確かめる。
 *
 * 見るのは3つだけ（senjutsu_20260902g.md 4番）。
 *   1  5つの鍵が全部あること
 *   2  5つとも数で、**整数**であること
 *   3  `FIELDS` の min／max の中にあること
 */
export function freeInputWoTashikameru(nanika: unknown): Tashikame {
  const dame: string[] = [];
  if (typeof nanika !== 'object' || nanika === null || Array.isArray(nanika)) {
    return { ok: false, dameNaKagi: FIELDS.map((f) => f.key) };
  }
  const moto = nanika as Record<string, unknown>;
  const dekita: Record<string, number> = {};

  for (const f of FIELDS) {
    const v = moto[f.key];
    if (typeof v !== 'number' || !Number.isFinite(v) || !Number.isInteger(v)) {
      dame.push(f.key);
      continue;
    }
    if (v < f.min || v > f.max) {
      dame.push(f.key);
      continue;
    }
    dekita[f.key] = v;
  }

  // 5つ以外の鍵が混ざっていたら、そこで落とします（余計なものを Stripe に預けない）
  for (const k of Object.keys(moto)) {
    if (!FIELDS.some((f) => f.key === k)) dame.push(k);
  }

  if (dame.length > 0) return { ok: false, dameNaKagi: [...new Set(dame)] };
  return { ok: true, value: dekita as unknown as FreeInput };
}

/** `metadata` に載せる形（★万円のまま。鍵は FreeInput の名前と同じ） */
export function metadataNiNoseru(v: FreeInput): Record<string, string> {
  const out: Record<string, string> = {};
  for (const f of FIELDS) out[f.key] = String(v[f.key]);
  return out;
}

/** `metadata` から戻す（webhook 側）。★戻したものも、もう一度確かめます */
export function metadataKaraModosu(m: unknown): Tashikame {
  if (typeof m !== 'object' || m === null) {
    return { ok: false, dameNaKagi: FIELDS.map((f) => f.key) };
  }
  const moto = m as Record<string, unknown>;
  const kazu: Record<string, unknown> = {};
  for (const f of FIELDS) {
    const s = moto[f.key];
    // Stripe の metadata は文字で返ります。整数の字だけを通します
    if (typeof s === 'string' && /^-?\d+$/.test(s)) kazu[f.key] = Number(s);
    else kazu[f.key] = s;
  }
  return freeInputWoTashikameru(kazu);
}
