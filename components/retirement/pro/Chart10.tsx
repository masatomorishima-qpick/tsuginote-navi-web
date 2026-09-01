/**
 * components/retirement/pro/Chart10.tsx ── 画面10の図2つ
 *
 * **座標も数字も `lib/retirement/pro/chart10.ts` が作ります。**ここは並べるだけです。
 * §7の7：**判断に使う金額は、どちらの図でも図の外**（凡例と本文）に出しています。
 */

'use client';

import { FONT, type ZuRuikei, type ZuSa } from '@/lib/retirement/pro/chart10';

const HAI = '#5b6470';
const ME_KOI = '#c9ced4';
const ME_USU = '#e8ebee';

function Waku({ z, children, label }: {
  z: { viewBox: string; x0: number; x1: number; labelX: number;
       grid: ZuRuikei['grid']; ageTicks: ZuRuikei['ageTicks']; jiku: ZuRuikei['jiku'] };
  children: React.ReactNode; label: string;
}) {
  return (
    <svg viewBox={z.viewBox} width="100%" role="img" aria-label={label}>
      {z.grid.map((g, i) => (
        <g key={`g${i}`}>
          <line x1={z.x0} y1={g.y} x2={z.x1} y2={g.y}
                stroke={g.koi ? ME_KOI : ME_USU} strokeWidth={g.futo} />
          <text x={z.labelX} y={g.y + 3} textAnchor="end" fontSize={FONT} fill={HAI}>{g.label}</text>
        </g>
      ))}
      {children}
      {z.ageTicks.map((t) => (
        <text key={`t${t.text}`} x={t.x} y={t.y} textAnchor={t.anchor} fontSize={FONT} fill={HAI}>{t.text}</text>
      ))}
      {z.jiku.map((j, i) => (
        <text key={`j${i}`} x={j.x} y={j.y} textAnchor={j.anchor} fontSize={FONT} fill={HAI}>{j.text}</text>
      ))}
    </svg>
  );
}

/** 図1：差（`moto` を0とおいて、`aite` が何円多いか） */
export function ChartSa({ z }: { z: ZuSa }) {
  return (
    <Waku z={z} label="年齢ごとの、2つの受け取り方の差">
      <polyline points={z.points} fill="none" stroke={z.iro} strokeWidth={2.6}
                strokeLinejoin="round" strokeLinecap="round" />
      {/* 金額は図の外。ここは点だけ（§7の7・E-22） */}
      {z.ten.map((t, i) => <circle key={`c${i}`} cx={t.cx} cy={t.cy} r={3} fill={z.iro} />)}
    </Waku>
  );
}

/** 図2：累計＋**全通りの幅の帯** */
export function ChartRuikei({ z }: { z: ZuRuikei }) {
  return (
    <Waku z={z} label="年齢ごとの、あなたの手元に入るお金の累計">
      <polygon points={z.obi} fill="#dfe3e8" opacity={0.85} />
      {z.sen.map((s, i) => (
        <polyline key={`s${i}`} points={s.points} fill="none" stroke={s.iro} strokeWidth={2.4}
                  strokeLinejoin="round" strokeLinecap="round"
                  strokeDasharray={s.hasen ? '7 4' : undefined} />
      ))}
    </Waku>
  );
}
