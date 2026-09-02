/**
 * lib/retirement/pro/hyouji.ts — 日時を字にする（B-3・senjutsu_20260902s.md 3番）
 *
 * 2つだけ置きます。
 *   kigenNoJi(d)  … 2027年9月2日 13時00分（日本時間）
 *   hidukeNoJi(d) … 2027年9月2日
 *
 * ★決め
 *   ・★`server-only` を**付けません**。`mailBun.ts`（文を作る本）と `kekka/page.tsx`（頁）の
 *     **両方が見ます**。★字を2か所に置かないためです（判断ログ239番と同じ向き）
 *   ・月・日・時は**0を付けません**（9月2日／13時）。★分だけ2桁（00分・05分）
 *   ・★「（日本時間）」まで、この本が付けます。呼ぶ側が足しません
 *   ・★`Intl` を使いません。★同じ入れ物でも国の設定でも、いつも同じ字になるようにするためです
 *   ・★既定値を作りません。時刻は必ず呼び出し側から渡してください
 */

/** 日本時間は UTC より9時間先 */
const JST = 9 * 60 * 60 * 1000;

type Buhin = { nen: number; tsuki: number; hi: number; ji: number; fun: number };

/** 日本時間の暦の上での、年・月・日・時・分に分けます */
function jstNoBuhin(d: Date): Buhin {
  const ms = d.getTime();
  if (!Number.isFinite(ms)) throw new Error('日付ではありません。');
  const j = new Date(ms + JST);
  return {
    nen: j.getUTCFullYear(),
    tsuki: j.getUTCMonth() + 1,
    hi: j.getUTCDate(),
    ji: j.getUTCHours(),
    fun: j.getUTCMinutes(),
  };
}

/** 分だけ2桁にします（0分 → 00分） */
function futaKeta(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

/**
 * 期限の字。**時刻まで**出します。
 *
 * 例 … `2027年9月2日 13時00分（日本時間）`
 */
export function kigenNoJi(d: Date): string {
  const b = jstNoBuhin(d);
  return `${b.nen}年${b.tsuki}月${b.hi}日 ${b.ji}時${futaKeta(b.fun)}分（日本時間）`;
}

/**
 * 日付だけの字。★期限が切れた頁で使います（時刻は出しません）。
 *
 * 例 … `2027年9月2日`
 */
export function hidukeNoJi(d: Date): string {
  const b = jstNoBuhin(d);
  return `${b.nen}年${b.tsuki}月${b.hi}日`;
}
