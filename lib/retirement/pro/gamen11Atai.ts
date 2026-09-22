/**
 * lib/retirement/pro/gamen11Atai.ts ── ★★★**画面11の印に、エンジンの値を入れる（正本）**
 *
 * ★★【なぜ要るか・2026-09-15・戦術Cowork `senjutsu_20260915e.md` 決め1231】
 *   ★★★**Excel シート4に「計算の全ステップ」を入れる**ことになりました。
 *   ★そのためには、★`gamen11.ts`（★基準HTMLから機械で抜き出したかたまり）の `{名前}` に、
 *     ★`gamen11Bun()` が作った値を入れる要りがあります。
 *
 * ★★★【なぜここに置くか】…… ★この当てはめは、これまで `Screens912.tsx` の `atai912()` の中だけに在りました。
 *   ★★`Screens912.tsx` は **`'use client'`** です。★`excel.ts` は **`server-only`** です。
 *   ★★★**サーバーの本から、client の本の関数は呼べません。**
 *   ★★ですので、★**写しを作らず、この本を正本にして、両方から呼びます**（★決め1219）。
 *     ・`Screens912.tsx` …… `...atai11(...)` を広げて使います
 *     ・`excel.ts` ………… `kumitate(GAMEN11, MADA_NA, atai11(...), gyouNashi11(...))` で行にします
 *
 * ★★★**ここに式はありません。**★`gamen11Bun()` が作ったものを、★**字にするだけ**です
 *   （★§2の3・実装側に式を持たせない）。
 *   ★1つだけ例外に見えるのが `setaiNoJi()` です ── ★下に理由を書きました。
 */
import type * as E from './engine';
import type { Bun11 } from './gamen11Bun';
import * as S from './sakaime';
import { en, enFu } from '@/components/retirement/pro/gamenBun';

/** ★`null` は「その方には存在しない」。★0にしません（★かたまりごと落ちます） */
const enKa = (n: number | null) => (n === null ? null : en(n));

/**
 * ★★★画面11が要るもの。★**どれも、ここでは作りません。**
 *
 * ★`setaiKubun`・`hikazeiGendo` は、**画面9詳細と同じ字**です（★基準HTML 1137〜1138行）。
 *   ★★呼ぶ側から渡します ── ★`Screens912.tsx` は `bun9s` から、★`excel.ts` は `setaiNoJi()` から。
 */
export type Moto11 = {
  bun11: Bun11;
  /** ★`EvalResult.tesuryo_uchiwake`（★呼ぶ側が `undefined` でないことを確かめてから渡します） */
  tesuryo: E.TesuryoUchiwake;
  /** 年金で受け取る支給源の名前（★入力から） */
  nenkinGen: string;
  /** ⑤（退職の年齢）。★**呼ぶ側から渡します**（★既定値を作りません） */
  taishokuAge: number;
  /** 「単身・1級地」の形（★決め1056） */
  setaiKubun: string;
  /** 住民税の非課税限度額（★「450,000円」の形） */
  hikazeiGendo: string;
};

/**
 * ★★★画面11の48種類に値を入れます（★`gamen11.ts` の `{名前}` を数えたもの・実測48）。
 *
 * ★★**`null` は、そのまま渡します** …… ★「その方には存在しない」で、
 *   `kumitate()` がかたまりごと落とします。
 */
export function atai11(m: Moto11): Record<string, string | null> {
  const t = m.tesuryo;
  const b = m.bun11;
  return {
    // ── 案の札（★決め1030）
    an_bun: b.an_bun,
    // ── 退職金の表（★決め1113・回3）
    tai_age: `${m.taishokuAge}歳`,
    tai_gen: b.tai_gen,
    /**
     * ★★★【2026-09-22・決め（便k 3節）】退職の年に退職所得が無い方は、`tai_gen` から `jumin_taishoku` までが `null`
     *   ＝ 退職の段が節ごと落ち、★代わりに `tai_nashi_bun`（節の外）が出ます。★`zentei_tai_bun` は画面10の1文目です。
     *   ★どちらも、基準HTML 232,032 ／ 5095f522…（2026-09-22・便l 2-1）で印が入り、効いています。
     */
    tai_nashi_bun: b.tai_nashi_bun,
    zentei_tai_bun: b.zentei_tai_bun,
    tai_uchiwake_bun: b.tai_uchiwake_bun,
    kojo_shiki: b.kojo_shiki,
    kojo: enKa(b.kojo),
    shunyu: enKa(b.shunyu),
    tai_hantei_bun: b.tai_hantei_bun,
    shotoku: enKa(b.shotoku),
    shotokuzei_tai: enKa(b.shotokuzei_tai),
    jumin_taishoku: enKa(b.jumin_taishoku),
    kubun_bun: b.kubun_bun,
    // ── 2本目の表（★決め1101）。★その年が無い方は9種類とも `null` ＝ 見出しごと落ちます
    ichiji_gen: b.ichiji_gen,
    ichiji_age: b.ichiji_age,
    ichiji_kojo_shiki: b.ichiji_kojo_shiki,
    ichiji_kojo: enKa(b.ichiji_kojo),
    ichiji_shunyu: enKa(b.ichiji_shunyu),
    ichiji_hantei_bun: b.ichiji_hantei_bun,
    ichiji_shotoku: enKa(b.ichiji_shotoku),
    ichiji_shotokuzei: enKa(b.ichiji_shotokuzei),
    ichiji_jumin: enKa(b.ichiji_jumin),
    ichiji_kubun_bun: b.ichiji_kubun_bun,
    // ── 年金の表（★決め1085・1086・1181）
    nenkin_gen: m.nenkinGen,
    nenkin_setsu_midashi: b.nenkin_setsu_midashi,
    nenkin_nashi_bun: b.nenkin_nashi_bun,
    nenkin_toshi_bun: b.nenkin_toshi_bun,
    nenkin_shunyu: en(b.nenkin_shunyu),
    nenkin_kojo_kubun: b.nenkin_kojo_kubun,
    /** ★引く数ですので、**符号を付けるのはこちら**です（★`gamen11Bun()` は額を返します） */
    nenkin_kojo: b.nenkin_kojo === null ? null : enFu(-b.nenkin_kojo),
    zatsu: en(b.zatsu),
    zatsu_zero_bun: b.zatsu_zero_bun,
    kyuyo: en(b.kyuyo),
    kojo_uchiwake: b.kojo_uchiwake,
    /** ★所得控除が9項目ぜんぶ0円の年にだけ出す一文（★決め・便j 2-2／便k 1節）。★基準HTML 5095f522…（便l 2-1(3)）で印が入りました */
    kojo_zero_bun: b.kojo_zero_bun,
    kojo_goukei: en(b.kojo_goukei),
    shotokuzei: en(b.shotokuzei),
    setai_kubun: m.setaiKubun,
    hikazei_gendo: m.hikazeiGendo,
    jumin_hantei_bun: b.jumin_hantei_bun,
    jumin: en(b.jumin),
    kokuho_kiso: en(b.kokuho_kiso),
    hoken_hantei_bun: b.hoken_hantei_bun,
    hoken_kekka: b.hoken_kekka,
    // ── 手数料の表。★行を出すかどうかは `gyouNashi11()` が決めます
    kyufu_kaisu: `${t.kyufu_kaisu}回`,
    kyufu_kei: en(t.kyufu_kei),
    koza_tanka: t.koza_tanka === null ? null : en(t.koza_tanka),
    koza_tsuki: t.koza_tsuki === null ? null : `${t.koza_tsuki}か月`,
    koza_kei: t.koza_kei === null ? null : en(t.koza_kei),
    tesuryo: en(t.kei),
  };
}

/**
 * ★★画面11で、**行ごと落とすもの**（★画面と Excel の**両方**が、この1本を読みます）。
 *
 * ★手数料の表 …… `kyufu_gyou`／`koza_gyou` が `false` の方は、★その行が**存在しません**
 *   （★「0回」「0か月」と書くと、かかったように読めます）。
 *
 * ★★★退職金の表 …… **`tai_uchiwake_bun` が `null`（★1本だけの方）は、その行だけを落とします**（★決め1180）。
 *   ★★★【2026-09-22・開発Coworkの落ち】★決め1180（2026-09-14）で、この行を**画面側（`Screens912.tsx` の
 *     `gyouNashi912()`）にだけ**足し、★**Excel（`excel.ts` 828行）には足していませんでした。**
 *     ★Excel は `gyouNashi11(t)` しか渡していませんので、★`tai_uchiwake_bun` の `null` が
 *     `kumitate()` の「かたまりごと落ちる」に当たり、★★★**1本だけの方の Excel のシート4から、
 *     退職金の表が丸ごと消えていました**（★golden 250人・画面8に出した案 564本のうち **202本＝35.8%**）。
 *   ★★見本の Excel（森嶋さんの入力）は iDeCo等を一時金で受け取る**2本の方**でしたので、見つかりませんでした。
 *   ★★★**同じ決めを2か所に書いていたのが原因です。**★ここを1本の正本にし、画面側はこれを呼ぶだけにしました。
 *   ★`kensa/excel_g11_mon.tsx` が、★画面側と Excel 側の `kumitate()` が**1かたまりも違わない**ことを数えます。
 */
export function gyouNashi11(t: E.TesuryoUchiwake, b11: Pick<Bun11, 'tai_uchiwake_bun'>): string[] {
  const out: string[] = [];
  if (!t.kyufu_gyou) out.push('kyufu_tanka', 'kyufu_kaisu', 'kyufu_kei');
  if (!t.koza_gyou) out.push('koza_tanka', 'koza_tsuki', 'koza_kei');
  if (b11.tai_uchiwake_bun === null) out.push('tai_uchiwake_bun');
  return out;
}

/**
 * ★★★**「単身・1級地」と、住民税の非課税限度額**（★決め1056）。
 *
 * ★★【なぜここに置くか】…… ★この2つは**画面9詳細と画面11の両方**に出ます（★基準HTML 1137〜1138行）。
 *   ★これまでは `gamen9shosaiBun.ts` の中だけに在りました。
 *   ★★★`excel.ts` は**画面9詳細を作りません**（★1案あたりの重さが増えます）ので、
 *     ★**この2つだけを取り出せる正本**をここに置き、★`gamen9shosaiBun.ts` からも呼びます。
 *
 * ★★**額を写していません** …… ★`sakaimeList()` の `hikazei` から読みます。
 *
 * @param p               その方
 * @param kyuchiHabuita   ⑰（お住まいの級地）を**省いてお答えになったか**（★`toJinbutsu()` が返します）
 * @param hihokensha      国民健康保険の被保険者数（★呼ぶ側が決めて渡します。★既定値ではありません）
 * @param kyuyoShotokusha 給与所得者等の数（★同じく、呼ぶ側が決めて渡します）
 */
export function setaiNoJi(p: E.Jinbutsu, kyuchiHabuita: boolean,
                          hihokensha: number, kyuyoShotokusha: number,
): { setaiKubun: string; hikazeiGendo: string; hikazeiGaku: number; fuyou: number } {
  const fuyou = p.fuyouKei();
  const setaiKubun = `${fuyou === 0 ? '単身' : `扶養${fuyou}人`}・${p.kyuchi}級地`
    + (kyuchiHabuita ? '（お答えがないため）' : '');
  const s = S.sakaimeList(hihokensha, kyuyoShotokusha, p.kyuchi, fuyou).find((x) => x.key === 'hikazei');
  if (!s) throw new Error('`sakaimeList()` に hikazei が在りません。');
  /** ★字と数の**両方**を返します（★画面9詳細は、この額で「超える／超えない」を判じます） */
  return { setaiKubun, hikazeiGendo: en(s.gaku), hikazeiGaku: s.gaku, fuyou };
}
