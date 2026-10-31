'use client';

import { ArrowRight, CalendarCheck, ChevronRight, Clock, CreditCard, Handshake, ShieldCheck, Tag } from 'lucide-react';
import { sendGAEvent } from '@next/third-parties/google';
import { trackEvent } from '@/lib/trackEvent';
import { PARTNERS, type PartnerKey } from '@/lib/kyutoki/diagnosis';

function sendPartnerClick(lpId: string, partner: PartnerKey, position: string, extra?: Record<string, string>) {
  const p = PARTNERS[partner];
  sendGAEvent('event', 'affiliate_click', { lp_name: lpId, position, program_name: p.name });
  void trackEvent({
    lp_id: lpId,
    event_name: 'kyutoki_partner_click',
    cta_id: `${p.key}-${position}`,
    partner_category: 'kyutoki',
    source_section: position,
    metadata: { partner: p.key, position, reward: p.reward, ...extra },
  });
}

const CARD_ICONS = { tag: Tag, calendar: CalendarCheck, card: CreditCard, shield: ShieldCheck, clock: Clock, handshake: Handshake } as const;
export type PartnerCardIcon = keyof typeof CARD_ICONS;

/**
 * 紹介先の「売り」を並べるカード。Clarity で、押せないカードが一番タップされていた
 * （2026-11-01「最短即日。当日お湯が出る仮付けも」4回、ボタン0回）ので、カードごと紹介先へのリンクにする。
 * 記録は PartnerLink と同じ形。position は「hero-card」のように置き場所、metadata.item に押された文言を入れる。
 */
export function PartnerValueCards({
  lpId, partner, position, items,
}: {
  lpId: string;
  partner: PartnerKey;
  position: string;
  items: { icon: PartnerCardIcon; t: string }[];
}) {
  const p = PARTNERS[partner];
  if (!p.href) return null;
  return (
    <ul className="grid grid-cols-2 gap-2">
      {items.map(({ icon, t }) => {
        const I = CARD_ICONS[icon];
        return (
          <li key={t}>
            <a
              href={p.href}
              target="_blank"
              rel="sponsored noopener"
              onClick={() => sendPartnerClick(lpId, partner, position, { item: t })}
              className="flex min-h-[48px] items-center gap-2 rounded-xl bg-white px-2.5 py-2 text-[12px] font-bold leading-tight text-slate-700 ring-1 ring-orange-200 transition hover:bg-orange-50 active:scale-[.99]"
            >
              <I size={16} className="shrink-0 text-orange-600" aria-hidden="true" />
              <span className="flex-1">{t}</span>
              <ChevronRight size={14} className="shrink-0 text-orange-400" aria-hidden="true" />
            </a>
          </li>
        );
      })}
    </ul>
  );
}

/**
 * 給湯器の記事型ページ（/kyutoki/kokan-hiyou など）から紹介先へ送るボタン。
 * 診断ページと同じ形で記録する：GA4 の affiliate_click（Google広告のコンバージョン）と、
 * lp_event_logs の kyutoki_partner_click（partner・position 付き）。
 * href が空の紹介先は出さない（提携前のリンクを踏ませないため）。
 */
export default function PartnerLink({
  lpId, partner, position, label, variant = 'primary', note, beacon = false,
}: {
  lpId: string;
  partner: PartnerKey;
  /** どこのボタンか（hero / table / bottom / sticky など） */
  position: string;
  label: string;
  variant?: 'primary' | 'secondary';
  note?: string;
  /** 表示計測の画像を置くか。同じ紹介先のボタンが複数あるときは1か所だけ true にする（表示回数を重ねて数えないため） */
  beacon?: boolean;
}) {
  const p = PARTNERS[partner];
  if (!p.href) return null;

  const onClick = () => sendPartnerClick(lpId, partner, position);

  const cls = variant === 'primary'
    ? 'flex min-h-[58px] w-full items-center justify-center gap-2 rounded-2xl bg-orange-600 px-5 text-[17px] font-bold text-white shadow-[0_8px_20px_-10px_rgba(234,88,12,.8)] transition hover:bg-orange-700 active:scale-[.99]'
    : 'flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 text-[15px] font-bold text-orange-700 ring-2 ring-orange-300 transition hover:bg-orange-50 active:scale-[.99]';

  return (
    <div className="flex flex-col gap-1.5">
      <a href={p.href} target="_blank" rel="sponsored noopener" onClick={onClick} className={cls}>
        <span className="whitespace-nowrap">{label}</span> <ArrowRight size={variant === 'primary' ? 20 : 18} aria-hidden="true" />
      </a>
      {note && <p className="text-center text-[11px] text-slate-500">{note}</p>}
      {beacon && p.beacon && (
        // 表示計測（1×1の画像）。広告リンクと一緒に置く決まり。
        // eslint-disable-next-line @next/next/no-img-element
        <img src={p.beacon} width={1} height={1} alt="" className="absolute h-px w-px opacity-0" />
      )}
    </div>
  );
}
