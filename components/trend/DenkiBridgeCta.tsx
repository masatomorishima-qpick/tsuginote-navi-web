'use client';

import { sendGAEvent } from '@next/third-parties/google';
import { trackEvent } from '@/lib/trackEvent';
import { DENKI } from '@/lib/trend/denki';
import A8BrandsafeBanner from '@/components/trend/A8BrandsafeBanner';

/**
 * /check/denki/norikae（橋型）の申込の入口。
 * 東急でんき＆ガスは A8 の掲載条件が「バナーのみ使用可」なので、文字のボタンは出さず A8 のバナーをそのまま出す。
 * 記録は診断側（TrendCheck）と同じ形：affiliate_click（Google 広告の成果）と trend_partner_click（lp_event_logs、position 付き）。
 */
export default function DenkiBridgeCta({ position, version }: { position: string; version: string }) {
  const p = DENKI.partners.tokyu;
  if (!p?.a8Banner || !p.href) return null;
  const onClick = () => {
    sendGAEvent('event', 'affiliate_click', { lp_name: DENKI.lpId, position, program_name: p.name });
    void trackEvent({
      lp_id: DENKI.lpId,
      event_name: 'trend_partner_click',
      cta_id: `${p.key}-${position}`,
      partner_category: `trend-${DENKI.id}`,
      source_section: position,
      metadata: { partner: p.key, position, reward: p.reward, version, trend: DENKI.id },
    });
  };
  return (
    <div className="flex flex-col gap-2 rounded-2xl border-2 border-orange-200 bg-orange-50/60 p-4">
      {/* 11/2：バナーの絵柄は「東急線沿線なら」。沿線でない人が自分は対象外と思って離れないよう、対象を先に言い切る */}
      <p className="text-center text-[15px] font-black leading-snug text-slate-900">沿線でなくても大丈夫<br /><span className="text-[13px] font-bold text-slate-700">関東7都県のご家庭なら申し込めます</span></p>
      <A8BrandsafeBanner spec={p.a8Banner} onClick={onClick} />
      <p className="text-center text-[12px] font-bold text-slate-700">↑ この画像から公式サイトへ（申し込み5分ほど）</p>
      <p className="text-center text-[11px] text-slate-500">工事・立ち会いはありません。東京・神奈川・千葉・埼玉・茨城・栃木・群馬が対象（一部の市区町村を除く）</p>
    </div>
  );
}
