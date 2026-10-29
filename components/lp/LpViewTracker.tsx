'use client';

import { useEffect } from 'react';
import { sendGAEvent } from '@next/third-parties/google';
import { trackEvent } from '@/lib/trackEvent';

/**
 * 着地ページの「最初の画面」で何が起きたかを記録する（2026-10-29 追加）。
 *
 * - lp_view      … 着地。画面の高さ、最初のボタンが最初の画面に入っているか、広告の情報
 * - lp_fv_pass   … 最初の画面の半分以上を下にスクロールした（＝最初の画面を越えた）
 * - lp_scroll    … ページ全体の 25 / 50 / 75 / 100% に届いた
 * - lp_leave     … ページを離れた・裏に回した（初回だけ）。滞在秒数、最大の深さ、越えたか、操作したか
 *
 * GA4 と lp_event_logs の両方に、ページごとの lp_id で送る。
 * 画面には何も描かない。
 */

const ATTR_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid'];

function readAttr(): Record<string, string> {
  const out: Record<string, string> = {};
  try {
    const sp = new URLSearchParams(window.location.search);
    ATTR_KEYS.forEach((k) => {
      const v = sp.get(k);
      if (v) out[k] = v.slice(0, 200);
    });
  } catch {
    /* 読めなくても計測は続ける */
  }
  return out;
}

export default function LpViewTracker({ lpId, version }: { lpId: string; version?: string }) {
  useEffect(() => {
    const t0 = performance.now();
    const attr = readAttr();
    const base = { lp_name: lpId, ...(version ? { version } : {}) };
    const send = (event: string, params: Record<string, string | number>) => {
      sendGAEvent('event', event, { ...base, ...params });
      void trackEvent({ lp_id: lpId, event_name: event, metadata: { ...params, ...attr, ...(version ? { version } : {}) } });
    };
    const secs = () => Math.round((performance.now() - t0) / 100) / 10;
    const depth = () => {
      const h = document.documentElement.scrollHeight || 1;
      return Math.min(100, Math.round(((window.scrollY + window.innerHeight) / h) * 100));
    };

    // 着地：最初のボタン（診断の開始）が最初の画面に入っているか
    const cta = document.querySelector('main button');
    const ctaTop = cta ? Math.round(cta.getBoundingClientRect().top + window.scrollY) : -1;
    send('lp_view', {
      vh: window.innerHeight,
      vw: window.innerWidth,
      doc_h: document.documentElement.scrollHeight,
      cta_top: ctaTop,
      cta_in_fv: ctaTop >= 0 && ctaTop + 40 <= window.innerHeight ? 1 : 0,
    });

    let maxDepth = depth();
    let fvPassed = false;
    let interacted = false;
    let left = false;
    const hit = new Set<number>();
    let ticking = false;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        const d = depth();
        if (d > maxDepth) maxDepth = d;
        if (!fvPassed && window.scrollY >= window.innerHeight * 0.5) {
          fvPassed = true;
          send('lp_fv_pass', { sec: secs() });
        }
        [25, 50, 75, 100].forEach((m) => {
          if (d >= m && !hit.has(m)) {
            hit.add(m);
            send('lp_scroll', { depth: m, sec: secs() });
          }
        });
      });
    };
    const onInteract = () => { interacted = true; };
    const onLeave = (e: Event) => {
      if (left) return;
      if (e.type === 'pagehide' || document.visibilityState === 'hidden') {
        left = true;
        send('lp_leave', { sec: secs(), max_depth: maxDepth, fv_pass: fvPassed ? 1 : 0, interacted: interacted ? 1 : 0 });
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('pointerdown', onInteract, { passive: true });
    window.addEventListener('keydown', onInteract);
    document.addEventListener('visibilitychange', onLeave);
    window.addEventListener('pagehide', onLeave);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('pointerdown', onInteract);
      window.removeEventListener('keydown', onInteract);
      document.removeEventListener('visibilitychange', onLeave);
      window.removeEventListener('pagehide', onLeave);
    };
  }, [lpId, version]);

  return null;
}
