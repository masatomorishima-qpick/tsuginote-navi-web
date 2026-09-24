/**
 * lib/retirement/pro/blocks.ts
 *
 * 画面5-6のブロック単位の到達計測（§8-2 #10 `pro_pricing_block_view`／§8-5）。
 *
 * 【なぜ必要か】§8-4「ここを削ると、離脱の原因が永久に分からなくなります」。
 * CV2率が落ちたときに最初に見る数字が、このブロック別到達です（§11の週次4）。
 *
 * 【区切りの決め方】モックアップの `data-block-start="..."` の印から、
 * **次の印の直前まで**が1ブロック（§8-5）。解釈の余地をなくすため、印はHTML側に置く。
 * 10ブロックあり、**測るのは `nayami` を除く9**（先頭は必ず見えるため）。
 *
 * ★★【2026-09-22・決め1401】**頭の印が `photo` から `nayami` に替わりました。**
 *   ★基準HTMLの写真の箱（`data-block-start="photo"`）が、悩みのカード3枚に置き換わったためです。
 *   ★★**測らない扱いは、そのまま引き継ぎます。**★頭のかたまりは必ず見えますので、
 *     測っても全員になり、離脱の場所が分かりません（★上の「先頭は必ず見えるため」と同じ理由です）。
 *   ★★★**測るブロックの顔ぶれ（`MEASURED_BLOCKS` の9つ）は、1つも変えていません。**
 *     ★GA4の `pro_pricing_block_view` の数の並びが、この日で切れません。
 *
 * 【一度だけ】同じブロックは何度画面に入っても1回しか送らない。
 * スクロールで行き来すると数が水増しされ、到達率が読めなくなる。
 */

'use client';

import { trackOnce, type PricingBlock } from './track';

/** §8-5 の一覧。**`nayami`・`riyu`・`seido` は測らない（`NOT_MEASURED`）。** */
/**
 * ★★★【2026-09-17・決め1313（★戦術Cowork `senjutsu_20260917d.md` 2-2）】
 *   ★**`'ai'` を外しました。**★`Screen56.tsx` から「AIに聞けば無料でできるのでは」の
 *     かたまりを外したためです（★決め1312）。
 *   ★★**なぜ外すか** …… ★下の門は「**一覧に無い印が画面に在る**」ときだけ鳴ります。
 *     ★★★**逆（★一覧に在るのに画面に無い）は、黙って通ります。**
 *     ★そのままだと `pro_pricing_block_view` の `ai` がただ 0件になり、
 *     ★★**「ai で全員落ちた」と読まれる道が在ります。**
 *   ★★`PricingBlock`（`track.ts`）からも同じ日に外しています。
 */
export const MEASURED_BLOCKS: readonly PricingBlock[] = [
  '4views', 'different', 'included',
  'cannot', 'notincluded', 'notfor', 'inputs', 'prepare', 'price',
] as const;

/**
 * ★測らない印（★送りません）。
 * ★★【2026-09-23・決め1415 の回】`riyu`（手取りに差が出る理由）と `seido`（悩みの見出しの直後のリード文）が入りました。
 *   ★前は `nayami` の1つだけで、★この2つは「一覧に無い印」として開発中に console に出るだけで、送ってはいませんでした。
 *   ★★送るかどうかは戦術Coworkの決めです（★便 `kaihatsu_20260923c.md` で尋ねています）。★それまでは、いまと同じく**送りません**。
 */
export const NOT_MEASURED: readonly string[] = ['nayami', 'riyu', 'seido'];

function isMeasured(v: string): v is PricingBlock {
  return (MEASURED_BLOCKS as readonly string[]).includes(v);
}

/**
 * `root` の中の `[data-block-start]` を監視する。戻り値を呼ぶと監視をやめる。
 *
 * 印が付いているのに §8-5 の一覧にない値は、**開発中に気づけるよう console に出す。**
 * （HTMLの印を増やしたのに、この一覧に足し忘れる事故を防ぐ）
 */
export function observePricingBlocks(root: ParentNode = document): () => void {
  if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') {
    return () => {};
  }
  const nodes = Array.from(root.querySelectorAll<HTMLElement>('[data-block-start]'));

  for (const el of nodes) {
    const v = el.dataset.blockStart ?? '';
    if (!NOT_MEASURED.includes(v) && !isMeasured(v)) {
      console.warn(`[pro:blocks] §8-5 の一覧にない data-block-start があります: "${v}"`);
    }
  }

  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      const v = (e.target as HTMLElement).dataset.blockStart ?? '';
      if (!isMeasured(v)) continue;            // NOT_MEASURED（nayami・riyu・seido）と未知の値は測らない
      trackOnce(`block:${v}`, 'pro_pricing_block_view', { block: v });
      io.unobserve(e.target);                  // 一度でよい
    }
  }, {
    // 画面に「入った」の定義：印の位置が画面に現れた時点。
    // 印は各ブロックの**先頭**に付いているので、閾値は0でよい（§8-5の区切りの定義どおり）。
    threshold: 0,
  });

  for (const el of nodes) {
    if (isMeasured(el.dataset.blockStart ?? '')) io.observe(el);
  }
  return () => io.disconnect();
}

/** 25/50/75/100% の到達（§8-2 #6・#11）。同じ深さは一度だけ送る。 */
/**
 * ★★★【2026-09-17・戦術Cowork「まとめ便」お願い5】★**`pro_lp_scroll` を足しました**（★画面1）。
 *   ★★**この関数の中身は1字も変えていません。**★受け取れる名前を1つ増やしただけです
 *     （★`Screen1.tsx` から呼べるようにするため）。
 *   ★★**名前は `track.ts` の `FreeEvent` にも同じ日に足しています**（★片方だけだと tsc が止まります）。
 */
export function observeScrollDepth(
  name: 'pro_lp_scroll' | 'pro_result_scroll' | 'pro_pricing_scroll',
  el: HTMLElement,
): () => void {
  if (typeof window === 'undefined') return () => {};
  const onScroll = () => {
    const r = el.getBoundingClientRect();
    const total = r.height - window.innerHeight;
    if (total <= 0) return;
    const seen = Math.min(1, Math.max(0, -r.top / total));
    for (const d of [25, 50, 75, 100] as const) {
      if (seen * 100 >= d) trackOnce(`${name}:${d}`, name, { depth: d });
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  return () => window.removeEventListener('scroll', onScroll);
}
