'use client';

import { useSearchParams } from 'next/navigation';

/**
 * /kyutoki/kokan-hiyou の最初の画面の見出し。広告の意図に合わせて切り替える。
 * - 既定（費用を調べる人）：「ガス給湯器の交換費用」と目安の金額
 * - ?hero=kokan（交換を決めて業者を探す人＝広告グループ A2）：「給湯器の交換 総額の目安」（v6：金額を主役に。3C の結論）
 * 2026-11-01：Clarity で A2 のクリックが記事の途中（#hikaku）に着地し、5〜30秒で離脱していたため、
 * A2 の行き先を先頭に変え、最初の画面の約束を広告文（見積もり無料・最短即日）に揃える。
 * useSearchParams を使うので、呼ぶ側で Suspense に包む（静的に作られたページのため）。
 */
export default function KokanHeroTitle() {
  const hero = useSearchParams().get('hero');
  if (hero === 'kokan') {
    return (
      <>
        <span className="self-start rounded-full bg-white px-3 py-1 text-xs font-bold text-sky-800 ring-1 ring-sky-200">1都3県・工事込み</span>
        <h1 className="text-[32px] font-black leading-[1.15] tracking-tight text-slate-900 min-[380px]:text-[36px]">
          <span className="whitespace-nowrap">給湯器の交換</span><br /><span className="whitespace-nowrap">総額の目安</span>
        </h1>
        <p className="text-[17px] font-bold leading-snug text-slate-700">
          工事込み<span className="text-[24px] text-orange-600">7.98万円〜</span><br />見積もり無料
        </p>
      </>
    );
  }
  return (
    <>
      <span className="self-start rounded-full bg-white px-3 py-1 text-xs font-bold text-sky-800 ring-1 ring-sky-200">給湯器の交換</span>
      <h1 className="text-[32px] font-black leading-[1.15] tracking-tight text-slate-900 min-[380px]:text-[36px]">
        <span className="whitespace-nowrap">ガス給湯器の</span><br /><span className="whitespace-nowrap">交換費用</span>
      </h1>
      <p className="text-[17px] font-bold leading-snug text-slate-700">
        ふろ給湯器なら<br /><span className="text-[24px] text-orange-600">15〜20万円</span>が目安
      </p>
    </>
  );
}
