'use client';

import { ArrowRight, Check } from 'lucide-react';
import { sendGAEvent } from '@next/third-parties/google';
import { trackEvent } from '@/lib/trackEvent';

/**
 * 保険の一覧表のページの出口（1ページに1つ）。2026-11-05 新設。
 * 紹介先：保険見直し本舗（レントラックス、プロダクト 7502、提携中。成果＝新規の無料面談の完了、14,520円）。
 * 広告主の条件：出演者の名前・画像は使わない。店舗数などの数字は公式の最新と違えば載せない（だから数字は書かない）。
 * 記録：GA4 の affiliate_click と、lp_event_logs の partner_click（partner_category=hoken）。
 */
const HREF = 'https://www.rentracks.jp/adx/r.html?idx=0.75552.390675.5121.7502&dna=98943';
const BEACON = 'https://www.rentracks.jp/adx/p.gifx?idx=0.75552.390675.5121.7502&dna=98943';

export const HOKEN_LP_ID = 'guide-hoken-ichiran';

const DEFAULT_POINTS = ['相談は無料', 'この一覧表を見せれば、話が早い', '入りすぎ・重なりを、プロと確かめる'];

/** lpId・points を渡せば、保険の一覧表以外のページでも使える（2026-11-10、保険の記事を足すため）。 */
export default function HokenSoudanBox({
  position, lead, beacon = false, lpId = HOKEN_LP_ID, points = DEFAULT_POINTS,
}: { position: string; lead: string; beacon?: boolean; lpId?: string; points?: string[] }) {
  const onClick = () => {
    sendGAEvent('event', 'affiliate_click', { lp_name: lpId, position, program_name: '保険見直し本舗' });
    void trackEvent({
      lp_id: lpId,
      event_name: 'partner_click',
      cta_id: `hokenhonpo-${position}`,
      partner_category: 'hoken',
      source_section: position,
      metadata: { partner: 'hokenhonpo', position, reward: 14520, asp: 'rentracks' },
    });
  };
  return (
    <div className="flex flex-col gap-3 rounded-2xl border-2 border-orange-200 bg-orange-50/60 p-5">
      <p className="text-[17px] font-bold text-slate-900">{lead}</p>
      <ul className="flex flex-col gap-1.5">
        {points.map((t) => (
          <li key={t} className="flex items-start gap-2 text-[15px] text-slate-800">
            <Check size={18} className="mt-1 shrink-0 text-orange-600" aria-hidden="true" />{t}
          </li>
        ))}
      </ul>
      <a
        href={HREF}
        target="_blank"
        rel="sponsored noopener"
        onClick={onClick}
        className="flex min-h-[56px] w-full items-center justify-center gap-2 rounded-2xl bg-orange-600 px-5 text-[17px] font-bold text-white transition hover:bg-orange-700"
      >
        無料の保険相談を予約する <ArrowRight size={20} aria-hidden="true" />
      </a>
      <p className="text-center text-[12px] text-slate-500">保険見直し本舗のサイトに移動します</p>
      {beacon && (
        // 表示計測（1×1の画像）。広告リンクと一緒に置く決まり。
        // eslint-disable-next-line @next/next/no-img-element
        <img src={BEACON} width={1} height={1} alt="" className="absolute h-px w-px opacity-0" />
      )}
    </div>
  );
}
