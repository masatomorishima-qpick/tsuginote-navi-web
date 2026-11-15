'use client';

import { useState } from 'react';
import { ArrowRight, Check, MapPin } from 'lucide-react';
import { sendGAEvent } from '@next/third-parties/google';
import { trackEvent } from '@/lib/trackEvent';
import { SOUZOKU_PARTNERS, regionAlt, type SouzokuPartner, type SouzokuPartnerKey } from '@/lib/souzoku/partners';

/**
 * 相続のページの出口の箱。href が空なら何も出さない。
 * 記録：GA4 の affiliate_click と、lp_event_logs の partner_click（partner_category=souzoku）。
 */
export default function SouzokuExit({
  lpId, partner, position, lead, beacon = false,
}: { lpId: string; partner: SouzokuPartnerKey; position: string; lead: string; beacon?: boolean }) {
  const p = SOUZOKU_PARTNERS[partner];
  const split = regionAlt(partner);
  const [area, setArea] = useState<'in' | 'out' | null>(null);
  if (!p.href) return null;
  if (split) {
    const choose = (v: 'in' | 'out') => {
      setArea(v);
      void trackEvent({ lp_id: lpId, event_name: 'region_choice', component_id: `region-${position}`, metadata: { area: v, position } });
    };
    const btn = (v: 'in' | 'out', label: string) => (
      <button type="button" aria-pressed={area === v} onClick={() => choose(v)}
        className={`w-full rounded-xl px-3 py-3 text-[14px] font-bold ring-1 ${area === v ? 'bg-slate-900 text-white ring-slate-900' : 'bg-white text-slate-800 ring-slate-300'}`}>
        {label}
      </button>
    );
    return (
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-2 rounded-2xl bg-white p-3 ring-1 ring-slate-200">
          <p className="flex items-center gap-1.5 text-[14px] font-black text-slate-900"><MapPin size={16} className="text-sky-700" aria-hidden="true" />お住まいの地域</p>
          <div className="flex flex-col gap-2">{btn('in', split.areas)}{btn('out', 'それ以外の地域')}</div>
        </div>
        {area === 'in' && <ExitBox lpId={lpId} p={p} position={position} lead={lead} beacon={beacon} />}
        {area === 'out' && <ExitBox lpId={lpId} p={split.alt} position={position} lead={lead} beacon={beacon} />}
      </div>
    );
  }
  return <ExitBox lpId={lpId} p={p} position={position} lead={lead} beacon={beacon} />;
}

function ExitBox({ lpId, p, position, lead, beacon }: { lpId: string; p: SouzokuPartner; position: string; lead: string; beacon: boolean }) {
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
  if (regionAlt(partner)) {
    // 地域で出口を分けるときは、下の出口の箱（住まいを選ぶ所）へ移るだけにする
    return (
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-4 pt-3 pb-[calc(12px+env(safe-area-inset-bottom,0px))] backdrop-blur sm:hidden">
        <a href="#exit" className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-orange-600 px-5 text-[16px] font-bold text-white">
          {p.cta} <ArrowRight size={18} aria-hidden="true" />
        </a>
      </div>
    );
  }
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
