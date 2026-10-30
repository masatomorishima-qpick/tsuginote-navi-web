'use client';

import { useEffect, useRef } from 'react';

/**
 * A8 のバナー広告（ブランドセーフ版）を置く部品。
 * 案件によっては「バナータイプの広告リンクのみ使用可」のものがあり（例：東急でんき＆ガス）、
 * その場合は文字のボタンではなく、A8 が発行したバナーをそのまま出す必要がある。
 *
 * A8 の発行コードは brandsafe.js を読み込み、brandsafe_js_async(...) を呼ぶと
 * id="div_admane_async_<site>_<article>_<link>" の div を探してバナーを差し込む（document.write は使わない）。
 * 差し込み後に div の id は書き換えられるので、React 側で id を変えないこと。
 */

const SCRIPT_SRC = 'https://ad-verification.a8.net/ad/js/brandsafe.js';
const BS_DOMAIN = '//ad-verification.a8.net/ad';

type BrandsafeWindow = Window & {
  brandsafe_js_async?: (domain: string, arg: string, p1?: string, p2?: string) => void;
};

export type A8BannerSpec = {
  site: string;
  article: string;
  link: string;
  image: string;
  /** プログラムID（sad） */
  mid: string;
  /** 発行コードの第3引数（数字の列） */
  token: string;
  /** 発行コードの第4引数（a8mat） */
  a8mat: string;
  /** 1×1画像のホスト名（発行コードの www18 など。省略時 www19） */
  beaconHost?: string;
};

let loading: Promise<void> | null = null;
function loadScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if ((window as BrandsafeWindow).brandsafe_js_async) return Promise.resolve();
  if (!loading) {
    loading = new Promise<void>((resolve, reject) => {
      const s = document.createElement('script');
      s.src = SCRIPT_SRC;
      s.async = true;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error('brandsafe.js load failed'));
      document.body.appendChild(s);
    });
  }
  return loading;
}

export default function A8BrandsafeBanner({ spec, onClick }: { spec: A8BannerSpec; onClick?: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const done = useRef(false);
  const divId = `div_admane_async_${spec.site}_${spec.article}_${spec.link}`;

  useEffect(() => {
    if (done.current) return;
    done.current = true;
    let cancelled = false;
    loadScript()
      .then(() => {
        if (cancelled) return;
        const fn = (window as BrandsafeWindow).brandsafe_js_async;
        if (!fn || !ref.current) return;
        // 差し込み先の div が見つかるように、呼ぶ直前に id を合わせ直す
        ref.current.id = divId;
        fn(BS_DOMAIN, `_site=${spec.site}&_article=${spec.article}&_link=${spec.link}&_image=${spec.image}&sad=${spec.mid}`, spec.token, spec.a8mat);
      })
      .catch(() => { /* 広告が出ないだけ。ページは動く */ });
    return () => { cancelled = true; };
  }, [divId, spec]);

  return (
    <div className="flex flex-col items-center gap-2">
      <div ref={ref} id={divId} onClickCapture={onClick} className="flex min-h-[60px] w-full justify-center [&_img]:h-auto [&_img]:max-w-full" />
      {/* A8 の表示計測（1×1の画像）。広告リンクと一緒に置く決まり。 */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`https://${spec.beaconHost ?? 'www19'}.a8.net/0.gif?a8mat=${spec.a8mat}`} width={1} height={1} alt="" className="absolute h-px w-px opacity-0" />
    </div>
  );
}
