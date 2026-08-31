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
 * 11ブロックあり、**測るのは `photo` を除く10**（先頭は必ず見えるため）。
 *
 * 【一度だけ】同じブロックは何度画面に入っても1回しか送らない。
 * スクロールで行き来すると数が水増しされ、到達率が読めなくなる。
 */

'use client';

import { trackOnce, type PricingBlock } from './track';

/** §8-5 の一覧。**`photo` は測らない。** */
export const MEASURED_BLOCKS: readonly PricingBlock[] = [
  '4views', 'different', 'ai', 'included',
  'cannot', 'notincluded', 'notfor', 'inputs', 'prepare', 'price',
] as const;

const NOT_MEASURED = 'photo';

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
    if (v !== NOT_MEASURED && !isMeasured(v)) {
      console.warn(`[pro:blocks] §8-5 の一覧にない data-block-start があります: "${v}"`);
    }
  }

  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      const v = (e.target as HTMLElement).dataset.blockStart ?? '';
      if (!isMeasured(v)) continue;            // photo と未知の値は測らない
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
export function observeScrollDepth(
  name: 'pro_result_scroll' | 'pro_pricing_scroll',
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
