'use client';

import { ArrowRight, Check } from 'lucide-react';
import { sendGAEvent } from '@next/third-parties/google';
import { trackEvent } from '@/lib/trackEvent';
import { HOUJIN_PARTNERS, type HoujinPartnerKey } from '@/lib/houjin/partners';

/**
 * 法人成りのページの出口の箱（2026-11-16）。href が空なら何も出さない。
 * 記録：GA4 の affiliate_click と、lp_event_logs の partner_click（partner_category=houjin）。
 */
export default function HoujinExit({
  lpId, partner, position, lead, note,
}: { lpId: string; partner: HoujinPartnerKey; position: string; lead: string; note?: string }) {
  const p = HOUJIN_PARTNERS[partner];
  if (!p.href) return null;
  const onClick = () => {
    sendGAEvent('event', 'affiliate_click', { lp_name: lpId, position, program_name: p.name });
    void trackEvent({
      lp_id: lpId,
      event_name: 'partner_click',
      cta_id: `${p.key}-${position}`,
      partner_category: 'houjin',
      source_section: position,
      metadata: { partner: p.key, position, reward: p.reward, asp: p.asp },
    });
  };
  return (
    <div className="flex flex-col gap-3 rounded-2xl border-2 border-orange-200 bg-orange-50/60 p-4">
      <p className="text-[16px] font-black text-slate-900">{lead}</p>
      <ul className="flex flex-col gap-1.5">
        {p.points.map((t) => (
          <li key={t} className="flex items-start gap-2 text-[14px] text-slate-800">
            <Check size={18} className="mt-0.5 shrink-0 text-orange-600" aria-hidden="true" />{t}
          </li>
        ))}
      </ul>
      {note && <p className="text-[12px] leading-relaxed text-slate-600">{note}</p>}
      <a
        href={p.href}
        target="_blank"
        rel="sponsored noopener"
        onClick={onClick}
        className="flex min-h-[56px] w-full items-center justify-center gap-2 rounded-2xl bg-orange-600 px-5 text-[16px] font-bold text-white transition hover:bg-orange-700"
      >
        {p.cta} <ArrowRight size={20} aria-hidden="true" />
      </a>
      <p className="text-center text-[11px] text-slate-500">{p.name}のサイトに移動します（記載は公式の情報、{p.checkedAt} 確認）</p>
    </div>
  );
}
