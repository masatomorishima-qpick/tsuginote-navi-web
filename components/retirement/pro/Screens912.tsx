/**
 * components/retirement/pro/Screens912.tsx ── 画面9・9詳細・10・11・12
 *
 * **オーナーの承認（2026-08-23）を受けて着手しました。**
 * 戦術Coworkの2026-08-22「**印が付いていて `data-mada` が無いところは、実装を始めていただけます**」。
 *
 * ──────────────────────────────────────────────────────────
 * 【いま出せるのは 11か所です。37か所ではありません】
 *
 *   そちらの数え（`data-mada` の無い印）は **37か所**でした。**その数は合っています。**
 *   ですが、**かたまり（文・表・箇条書き）の単位で見ると、出せるのは 11か所**です。
 *
 *   残り26か所は、**同じ文・同じ表の中に `data-mada` の印が混ざっている**ためです。
 *   1つの文の途中だけを出すと、残った文が別の意味になります。
 *   3列のうち1列が空いた表は、読めるようで読めません。
 *   ですので**かたまりごと出さない**にしています（`gamenBun.ts`）。
 *
 *     画面9　　　 出せるかたまり 9個／印 **0か所**（表と絞り込みは `data-mada` を含みます）
 *     画面9 詳細　出せるかたまり 7個／印 **0か所**
 *     画面10　　　出せるかたまり 8個／印 **1か所**（`tedori`）
 *     画面11　　　出せるかたまり 4個／印 **6か所**（手数料の表）
 *     画面12　　　出せるかたまり 7個／印 **4か所**（`nenkin_gen` `nenkin_kikan` `shinkoku_iru`）
 *
 *   **見本の方の金額は、1つも画面に出ません。**
 * ──────────────────────────────────────────────────────────
 *
 * 【文言は基準HTMLのままです】
 *   ここに文は1文字も書いていません。`gamen9.ts` 〜 `gamen12.ts` は
 *   `kensa/gamen_chushutsu.mjs` が基準HTML（164,458）から機械で作ったものです。
 */

'use client';

import * as E from '@/lib/retirement/pro/engine';
import { GAMEN9, MADA_NA as MADA9 } from './gamen9';
import { GAMEN9shosai, MADA_NA as MADA9S } from './gamen9shosai';
import { GAMEN10, MADA_NA as MADA10 } from './gamen10';
import { GAMEN11, MADA_NA as MADA11 } from './gamen11';
import { GAMEN12, MADA_NA as MADA12 } from './gamen12';
import { kumitate, en, type BlockKyotsu, type Kumi } from './gamenBun';
import ScreenBlocks from './ScreenBlocks';

/**
 * 5画面が使う、その方のもの。**エンジンが出したものだけ**を受け取ります。
 * **ここで計算しません。**
 */
export type Moto912 = {
  /** その方が選んでいる受け取り方の計算結果 */
  r: E.EvalResult;
  /** その受け取り方（年金の期間などを引きます） */
  plan: E.Plan;
  /** 年金で受け取る支給源の名前（「iDeCo等」「小規模企業共済」など）。**入力から** */
  nenkinGen: string;
  /** 確定申告が要るか。**エンジンの `shinkokuIru()` が出したもの** */
  shinkoku: E.ShinkokuKekka;
};

/**
 * `data-mada` の無い印に、エンジンの値を入れる。
 *
 * **`null` は「その方には存在しない」という意味です。0にしません**
 * （`kumitate()` が、そのかたまりを出さずに数えます）。
 */
export function atai912(m: Moto912): Record<string, string | null> {
  const t = m.r.tesuryo_uchiwake;
  if (!t) throw new Error('`evaluate()` が `tesuryo_uchiwake` を返していません。');
  return {
    // 画面10・画面9（表の中は `data-mada` があるので、実際には出ません）
    tedori: en(m.r.tedori),
    /**
     * 画面11（手数料の表）。
     *
     * **行を出すかどうかは `kyufu_gyou` / `koza_gyou` が決めます**（下の `gyouNashi912()`）。
     * ここでは値だけを作ります。**`null` のときも、いちおう文字にはしません。**
     */
    kyufu_kaisu: `${t.kyufu_kaisu}回`,
    kyufu_kei: en(t.kyufu_kei),
    koza_tanka: t.koza_tanka === null ? null : en(t.koza_tanka),
    koza_tsuki: t.koza_tsuki === null ? null : `${t.koza_tsuki}か月`,
    koza_kei: t.koza_kei === null ? null : en(t.koza_kei),
    tesuryo: en(t.kei),
    // 画面12
    nenkin_gen: m.nenkinGen,
    nenkin_kikan: `${m.plan.nenkin_kikan}年`,
    shinkoku_iru: m.shinkoku.iru ? '必要です' : '不要です',
  };
}

/**
 * **その方には、その行が無い**もの（`engine.py` の `kyufu_gyou` / `koza_gyou` の写し）。
 *
 * 【`data-mada` とは別のものです・2026-08-23。戦術Coworkのご指摘】
 *   `data-mada` … エンジンに出口が無い。**作れば埋まります**（帯に数えます）
 *   ここ　　　　 … **エンジンが「この方にはこの行は無い」と決めた。**ふつうの分岐です
 *                  （**帯に数えません。**数えると、その方の帯が永久に消えません）
 *
 *   実測（戦術Cowork・400人）では、**口座管理の月数が0の方が41人（10.3%）**です。
 *   その方は `koza_tsuki` が `null` ではなく **`0`** なので、
 *   「口座管理手数料 66円×0か月　0円」がそのまま出てしまいます。
 */
export function gyouNashi912(m: Moto912): string[] {
  const t = m.r.tesuryo_uchiwake;
  if (!t) throw new Error('`evaluate()` が `tesuryo_uchiwake` を返していません。');
  const out: string[] = [];
  if (!t.kyufu_gyou) out.push('kyufu_tanka', 'kyufu_kaisu', 'kyufu_kei');
  if (!t.koza_gyou) out.push('koza_tanka', 'koza_tsuki', 'koza_kei');
  return out;
}

/** 5画面ぶんを組み立てる。**出せなかった数も返します** */
export function kumi912(m: Moto912): Record<string, Kumi> {
  const a = atai912(m);
  const nashi = gyouNashi912(m);
  const hitotsu = (blocks: readonly BlockKyotsu[], mada: readonly string[]) => {
    // **その画面に出てこない名前は渡しません。**渡すと「使っていない値」が見えなくなります
    const dero = new Set<string>();
    const hirou = (s: string) => { for (const x of s.matchAll(/\{([a-zA-Z0-9_]+)\}/g)) dero.add(x[1]); };
    for (const b of blocks) {
      if (b.kind === 'hyo') for (const g of b.gyou) hirou(g.cells.join(' '));
      else if (b.kind === 'ret') for (const k of b.koumoku) hirou(k.bun);
      else hirou(b.bun);
    }
    const madaSet = new Set(mada);
    const sono: Record<string, string | null> = {};
    for (const na of dero) if (!madaSet.has(na) && na in a) sono[na] = a[na];
    return kumitate(blocks, mada, sono, nashi);
  };
  return {
    画面9: hitotsu(GAMEN9 as readonly BlockKyotsu[], MADA9),
    '画面9 詳細': hitotsu(GAMEN9shosai as readonly BlockKyotsu[], MADA9S),
    画面10: hitotsu(GAMEN10 as readonly BlockKyotsu[], MADA10),
    画面11: hitotsu(GAMEN11 as readonly BlockKyotsu[], MADA11),
    画面12: hitotsu(GAMEN12 as readonly BlockKyotsu[], MADA12),
  };
}

export function Screen9({ m }: { m: Moto912 }) { return <ScreenBlocks kumi={kumi912(m)['画面9']} />; }
export function Screen9Shosai({ m }: { m: Moto912 }) { return <ScreenBlocks kumi={kumi912(m)['画面9 詳細']} />; }
export function Screen10({ m }: { m: Moto912 }) { return <ScreenBlocks kumi={kumi912(m)['画面10']} />; }
export function Screen11({ m }: { m: Moto912 }) { return <ScreenBlocks kumi={kumi912(m)['画面11']} />; }
export function Screen12({ m }: { m: Moto912 }) { return <ScreenBlocks kumi={kumi912(m)['画面12']} />; }
