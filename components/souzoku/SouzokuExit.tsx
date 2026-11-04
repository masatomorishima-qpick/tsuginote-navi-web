'use client';

import { ArrowRight, Check } from 'lucide-react';
import { sendGAEvent } from '@next/third-parties/google';
import { trackEvent } from '@/lib/trackEvent';
import { SOUZOKU_PARTNERS, type SouzokuPartnerKey } from '@/lib/souzoku/partners';

/**
 * 相続のページの出口の箱。href が空なら何も出さない。
 * 記録：GA4 の affiliate_click と、lp_event_logs の partner_click（partner_category=souzoku）。
 */
export default function SouzokuExit({
  lpId, partner, position, lead, beacon = false,
}: { lpId: string; partner: SouzokuPartnerKey; position: string; lead: string; beacon?: boolean }) {
  const p = SOUZOKU_PARTNERS[partner];
  if (!p.href) return null;
  const onClick = () => {
    sendGAEvent('event', 'affiliate_click', { lp_name: lpId, position, program_name: p.name });
    void trackEvent({
      lp_id: lpId,
      event_name: 'partner_click',
      cta_id: `${p.key}-${position}`,
      partner_category: 'souzoku',
      source_section: position,
      metadata: { partner: p.key, position, reward: p.reward, asp: p.asp },
    });
  };
  return (
    <div className="flex flex-col gap-3 rounded-2xl border-2 border-orange-200 bg-orange-50/60 p-4">
      <p className="text-[16px] font-black text-slate-900">{lead}</p>
      {p.points.length > 0 && (
        <ul className="flex flex-col gap-1.5">
          {p.points.map((t) => (
            <li key={t} className="flex items-start gap-2 text-[14px] text-slate-800">
              <Check size={18} className="mt-0.5 shrink-0 text-orange-600" aria-hidden="true" />{t}
            </li>
          ))}
        </ul>
      )}
      <a
        href={p.href}
        target="_blank"
        rel="sponsored noopener"
        onClick={onClick}
        className="flex min-h-[56px] w-full items-center justify-center gap-2 rounded-2xl bg-orange-600 px-5 text-[16px] font-bold text-white transition hover:bg-orange-700"
      >
        {p.cta} <ArrowRight size={20} aria-hidden="true" />
      </a>
      <p className="text-center text-[11px] text-slate-500">{p.name}のサイトに移動します{p.checkedAt && `（記載は公式サイト、${p.checkedAt} 確認）`}</p>
      {beacon && p.beacon && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={p.beacon} width={1} height={1} alt="" className="absolute h-px w-px opacity-0" />
      )}
    </div>
  );
}

export function SouzokuExitSticky({ lpId, partner }: { lpId: string; partner: SouzokuPartnerKey }) {
  const p = SOUZOKU_PARTNERS[partner];
  if (!p.href) return null;
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-4 pt-3 pb-[calc(12px+env(safe-area-inset-bottom,0px))] backdrop-blur sm:hidden">
      <a
        href={p.href}
        target="_blank"
        rel="sponsored noopener"
        onClick={() => {
          sendGAEvent('event', 'affiliate_click', { lp_name: lpId, position: 'sticky', program_name: p.name });
          void trackEvent({ lp_id: lpId, event_name: 'partner_click', cta_id: `${p.key}-sticky`, partner_category: 'souzoku', source_section: 'sticky', metadata: { partner: p.key, position: 'sticky', reward: p.reward, asp: p.asp } });
        }}
        className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-orange-600 px-5 text-[16px] font-bold text-white"
      >
        {p.cta} <ArrowRight size={18} aria-hidden="true" />
      </a>
    </div>
  );
}
