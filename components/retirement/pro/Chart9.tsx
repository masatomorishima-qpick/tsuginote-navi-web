/**
 * components/retirement/pro/Chart9.tsx ── 画面9詳細の図
 *
 * **座標も数字も `lib/retirement/pro/chart9.ts` が作ります。**ここは並べるだけです。
 * §7の7：**図の中は目盛りと凡例だけ。**境目の名前と金額は、図のすぐ下の凡例に出します。
 */

'use client';

import { type Chart9 as Chart9Data, type Kijun, type AB, IRO, FONT, barPath } from '@/lib/retirement/pro/chart9';

const HAI = '#5b6470';
const ME_KOI = '#c9ced4';
const ME_USU = '#e8ebee';

export function Chart9({ c }: { c: Chart9Data }) {
  return (
    <svg viewBox={c.viewBox} width="100%" role="img"
         aria-label="年齢ごとの、保険料の判定に使う所得">
      {c.grid.map((g) => (
        <g key={`g${g.v}`}>
          <line x1={44} y1={g.y} x2={338} y2={g.y} stroke={g.koi ? ME_KOI : ME_USU} strokeWidth={1} />
          <text x={38} y={g.y + 3} textAnchor="end" fontSize={FONT} fill={HAI}>{g.label}</text>
        </g>
      ))}
      {c.bars.map((b, i) => (
        <path key={`b${i}`} d={barPath(b.x, b.y, b.w, b.h)} fill={b.iro} />
      ))}
      {c.ageLabels.map((a) => (
        <text key={`a${a.text}`} x={a.x} y={a.y} textAnchor="middle" fontSize={FONT} fill={HAI}>{a.text}</text>
      ))}
      {c.fuda.map((f, i) => (
        <text key={`f${i}`} x={f.x} y={f.y} textAnchor="middle" fontSize={FONT} fill="#8a4b12">{f.text}</text>
      ))}
      {/* 破線＝境目。**名前と金額は図の外**（§7の7・E-22） */}
      {c.hasen.map((h, i) => (
        <line key={`h${i}`} x1={44} y1={h.y} x2={338} y2={h.y}
              stroke={h.iro} strokeWidth={h.futo} strokeDasharray="4 3" />
      ))}
      {c.ne65.map((v, i) => (
        <text key={`n${i}`} x={v.x} y={v.y} textAnchor="middle" fontSize={FONT}
              fontWeight={700} fill={v.iro}>{v.text}</text>
      ))}
      {c.jiku.map((j, i) => (
        <text key={`j${i}`} x={j.x} y={j.y} textAnchor={j.anchor} fontSize={FONT} fill={HAI}>{j.text}</text>
      ))}
    </svg>
  );
}

/** 図のすぐ下に置く、破線の凡例（§7の7で図の外に出した3行） */
export function KijunHanrei({ kijun }: { kijun: Kijun[] }) {
  return (
    <div className="mt-1.5 rounded-lg border border-[#e6ddd2] bg-[#faf7f3] px-3 py-2.5 text-[13px] leading-relaxed">
      <b className="font-bold text-slate-900">破線＝保険料・医療費の境目</b>
      （濃い線が、あなたが実際に越える境目です）
      <ul className="mt-1 list-disc pl-[18px]">
        {/**
          * ★★★決め1048 の7つめ（2026-09-13・回4）── **金額の字は `chart9.ts` が作ります。**
          *   ★前はここに `Math.trunc(g / 10_000)` と書いていました（★実装側に式を持たせていました）。
          */}
        {kijun.map(([, name, koi, ji]) => (
          <li key={name} style={{ color: koi ? '#8a4b12' : '#8a7a68', fontWeight: koi ? 700 : 400 }}>
            {name} {ji}
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * どちらの色が何年か。
 * 【§7-1】もとの `hanrei()` は **11.5px** でした（モックアップの縮尺）。
 * **本番は注記13px以上**なので、13pxにしています。
 */
/**
 * ★★★2026-09-13・回4 …… **5年・6年の決め打ちをやめました**（★`chart9.ts` の直し1・2と同じ）。
 *   ★字は `{an_a_bun}`・`{an_b_bun}`（★`gamen9shosaiBun.ts` が作ります）を渡してください。
 */
export function Hanrei9({ bun }: { bun: Record<AB, string> }) {
  return (
    <div className="mb-1 flex gap-3.5 text-[13px] text-slate-900">
      {(['a', 'b'] as const).map((k) => (
        <span key={k} className="inline-flex items-center gap-1.5">
          <span aria-hidden className="inline-block h-2.5 w-2.5 rounded-[2px]"
                style={{ background: IRO[k] }} />
          {bun[k]}
        </span>
      ))}
    </div>
  );
}
