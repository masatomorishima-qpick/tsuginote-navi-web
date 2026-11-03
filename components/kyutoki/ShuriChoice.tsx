'use client';

import { useEffect, useRef } from 'react';
import { ArrowRight, Bath, CircleCheck, Flame, type LucideIcon } from 'lucide-react';
import { PARTNERS, type PartnerKey } from '@/lib/kyutoki/diagnosis';
import { sendPartnerClick } from '@/components/kyutoki/PartnerLink';

/**
 * 修理の見積もりへ直接つなぐ2枚のカード（/kyutoki/shuri 用。2026-11-04 新設）。
 * 診断をはさまない。給湯器の種類を選ぶ＝紹介先を選ぶ。
 * 送客の記録に広告の印（utm・gclid）を入れる。紹介先クリックを広告の言葉ごとに数えるため
 * （11/3 の発見③：PartnerLink の記録には広告の印が入っていなかった）。
 */

const ATTR_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid'];

type Card = { partner: PartnerKey; icon: LucideIcon; h: string; hint: string };

const CARDS: Card[] = [
  { partner: 'oyu', icon: Flame, h: 'ガス給湯器', hint: '壁や床にある四角い機械' },
  { partner: 'kyutto', icon: Bath, h: 'エコキュート', hint: '大きなタンクがある機械' },
];

export default function ShuriChoice({ lpId }: { lpId: string }) {
  const attr = useRef<Record<string, string>>({});

  useEffect(() => {
    try {
      const sp = new URLSearchParams(window.location.search);
      ATTR_KEYS.forEach((k) => {
        const v = sp.get(k);
        if (v) attr.current[k] = v.slice(0, 200);
      });
    } catch {
      /* 読めなくても送客は続ける */
    }
  }, []);

  return (
    <ul className="grid gap-3">
      {CARDS.map(({ partner, icon: I, h, hint }) => {
        const p = PARTNERS[partner];
        if (!p.href) return null;
        return (
          <li key={partner} className="flex flex-col gap-3 rounded-3xl bg-white p-4 ring-1 ring-slate-200">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
                <I size={26} aria-hidden="true" />
              </span>
              <span className="flex flex-col">
                <span className="text-[20px] font-black leading-tight text-slate-900">{h}</span>
                <span className="text-[12px] text-slate-500">{hint}</span>
              </span>
            </div>
            <ul className="flex flex-wrap gap-x-3 gap-y-1">
              {p.points.map((t) => (
                <li key={t} className="flex items-center gap-1 text-[13px] font-bold text-slate-700">
                  <CircleCheck size={14} className="text-emerald-600" aria-hidden="true" />
                  {t}
                </li>
              ))}
            </ul>
            <a
              href={p.href}
              target="_blank"
              rel="sponsored noopener"
              onClick={() => sendPartnerClick(lpId, partner, `card-${partner}`, attr.current)}
              className="flex min-h-[58px] w-full items-center justify-center gap-2 rounded-2xl bg-orange-600 px-5 text-[17px] font-bold text-white shadow-[0_8px_20px_-10px_rgba(234,88,12,.8)] transition hover:bg-orange-700 active:scale-[.99]"
            >
              <span className="whitespace-nowrap">{p.cta}</span>
              <ArrowRight size={20} aria-hidden="true" />
            </a>
            <p className="text-center text-[11px] text-slate-500">{p.name}（{p.who}）の公式サイトへ</p>
            {p.beacon && (
              // 表示計測（1×1の画像）。広告リンクと一緒に置く決まり。
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.beacon} width={1} height={1} alt="" className="absolute h-px w-px opacity-0" />
            )}
          </li>
        );
      })}
    </ul>
  );
}
