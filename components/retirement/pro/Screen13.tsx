/**
 * components/retirement/pro/Screen13.tsx
 *
 * 画面13（この計算の根拠と、入れていないものについて）。**有料版の最後の画面**です。
 *
 * 【文言を手で書いていません】
 *   見出し・段落・表・箇条書き・最終更新は、すべて `gamen13.ts` から出しています。
 *   `gamen13.ts` は `kensa/gamen13_chushutsu.mjs` が基準HTMLから機械で作ります。
 *   **条文の逐語が入る画面**なので、写し間違えると 19,800円を払った方が条文を引けません。
 *
 * 【守っていること】
 *  §2の7  **根拠の画面は折りたたみません。**長くてかまいません（★73）
 *  §7-1   本文16px以上・注記13px以上
 *  §2の10 利用者に見せる文に「画面◯」と書きません
 *  §4-4-2 **既定値を作りません。**「現在の年」は呼び出し側から受け取ります
 *
 * ──────────────────────────────────────────────────────────
 * 【★ その方によって変わる行が1行あります。ここで止まります】
 *
 *   表の中に**1行だけ**、その方の計算値が入る行があります。
 *
 *     「前に受け取った額が少ない場合」（施行令70条2項）
 *       …あなたの場合、退職金20,000,000円が退職所得控除20,600,000円に満たないので、
 *       前の勤続期間を就職の日から37年（1988年4月〜2025年3月）に縮めます。
 *       あなたのiDeCo等の加入期間（2006年4月〜2026年3月）と重なるのは228か月で、
 *       1年未満を切り捨てて19年。この19年ぶんの控除7,600,000円を減らします。
 *
 *   **これは基準HTMLの見本の方（退職金2,000万円・勤続38年）の数字です。**
 *   **そのまま出すと、別の方の根拠の画面に、その方のものでない数字が出ます。**
 *
 *   **ですので、この行の文は呼び出し側から受け取ります**（`hitogotoBun`）。
 *   **受け取れなければ、例外で止めます。**別の文へ静かに落ちません（★76・E-23 と同じ形）。
 *
 *   **いま、この文を作る場所がありません。**必要な値のうち3つが、エンジンの外に出ていません。
 *   詳しくは 開発Cowork → 戦術Cowork の便に書いています。
 * ──────────────────────────────────────────────────────────
 */

'use client';

import { useEffect, useRef } from 'react';
import { GAMEN13, type Block13 } from './gamen13';
import { track } from '@/lib/retirement/pro/track';

type Props = {
  /** サーバーで求めた `Asia/Tokyo` の年。**既定値を作りません**（§4-4-2） */
  genzaiNen: number;
  /**
   * **その方によって変わる行**の文。左の見出しをかぎにして渡します。
   * **エンジンが出した値から作ってください。**画面側では作りません（§2の「実装側に式を持たせない」）。
   */
  hitogotoBun: Readonly<Record<string, string>>;
};

/** 表の1行。**左は見出し、右は本文** */
function Gyou({ hidari, migi }: { hidari: string; migi: string }) {
  return (
    <div className="border-b border-slate-200 py-3 last:border-b-0 sm:flex sm:gap-4">
      <div className="text-base font-bold text-slate-900 sm:w-[14rem] sm:shrink-0">{hidari}</div>
      <div className="mt-1 text-base leading-relaxed text-slate-800 sm:mt-0">{migi}</div>
    </div>
  );
}

export default function Screen13({ genzaiNen, hitogotoBun }: Props) {
  const sentRef = useRef(false);
  useEffect(() => {
    if (sentRef.current) return;
    sentRef.current = true;
    track('pro_screen13_view');          // §8-3
  }, []);

  const hito = (b: Block13) => {
    if (b.kind !== 'hyo') return;
    for (const g of b.gyou) {
      if (!g.hitogoto) continue;
      if (!hitogotoBun[g.hidari]) {
        /**
         * **黙って見本の数字を出しません。**
         * 別の文へ静かに落ちるより、**止まって気づけるほうが安全です**（★76・E-23）。
         */
        throw new Error(
          `画面13の「${g.hidari}」は、その方によって変わる行です。`
          + 'エンジンが出した値から作った文を hitogotoBun で渡してください。'
          + '**基準HTMLの見本の数字（退職金20,000,000円ほか）を、そのまま出すことはできません。**',
        );
      }
    }
  };
  GAMEN13.forEach(hito);

  return (
    <div>
      {GAMEN13.map((b, i) => {
        if (b.kind === 'midashi') {
          return b.lv === 2 ? (
            <h1 key={i} className="mt-8 text-[24px] font-bold leading-tight text-slate-900 first:mt-0 sm:text-[28px]">
              {b.bun}
            </h1>
          ) : (
            <h2 key={i} className="mt-7 text-[19px] font-bold text-slate-900">{b.bun}</h2>
          );
        }
        if (b.kind === 'hon') {
          return (
            <p key={i} className="mt-3 text-base leading-relaxed text-slate-800">
              {b.bun.split('\n').map((l) => <span key={l} className="block">{l}</span>)}
            </p>
          );
        }
        if (b.kind === 'hako') {
          return (
            <div key={i} className="mt-4 rounded-xl bg-slate-50 p-4 text-base leading-relaxed text-slate-800">
              {b.bun}
            </div>
          );
        }
        if (b.kind === 'kousin') {
          return (
            <p key={i} className="mt-8 text-[13px] leading-relaxed text-[#5b6470]">{b.bun}</p>
          );
        }
        if (b.kind === 'ret') {
          return (
            <ul key={i} className="mt-3 list-disc space-y-1 pl-6 text-base leading-relaxed text-slate-800">
              {b.koumoku.map((k) => <li key={k}>{k}</li>)}
            </ul>
          );
        }
        return (
          <div key={i} className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
            {b.gyou.map((g) => (
              <Gyou
                key={g.hidari}
                hidari={g.hidari}
                migi={g.hitogoto ? hitogotoBun[g.hidari] : g.migi}
              />
            ))}
          </div>
        );
      })}

      {/* 「現在の年」は呼び出し側から受け取ったものだけを使います（§4-4-2） */}
      <span className="hidden" data-genzai-nen={genzaiNen} />
      <div className="h-16" aria-hidden="true" />
    </div>
  );
}
