'use client';

import { ArrowRight, Check } from 'lucide-react';
import { sendGAEvent } from '@next/third-parties/google';
import { trackEvent } from '@/lib/trackEvent';

/**
 * スマホのパスワードのページの出口（1ページに1つ）。2026-11-16 新設（オーナー了承）。
 * 紹介先：Digital Keeper（レントラックス、プロダクト 16230、提携中。成果＝新規申込後の決済完了、報酬＝成約定率70.40%）。
 * リンクはレントラックスの管理画面で、サイト「つぎの手ナビ」（390675）を選んで発行したもの。書き換えない。
 * 売りは公式サイト（digitalkeeper.jp、2026-11-16 確認）の記載だけ。
 * 記録：GA4 の affiliate_click と、lp_event_logs の partner_click（partner_category=password）。
 */
const HREF = 'https://www.rentracks.jp/adx/r.html?idx=0.75552.390675.11379.16230&dna=182435';
const BEACON = 'https://www.rentracks.jp/adx/p.gifx?idx=0.75552.390675.11379.16230&dna=182435';

export const PASSWORD_LP_ID = 'guide-sumaho-password';

const POINTS = [
  'スマホ・パソコンのログイン情報を、もしものときに指定した家族へ引き継ぐ',
  '定期的な「お元気ですかメール」で見守り、返事がないと家族に知らせる',
  '月額330円（税込）',
];

export default function DigitalKeeperBox({ position, lead }: { position: string; lead: string }) {
  const onClick = () => {
    sendGAEvent('event', 'affiliate_click', { lp_name: PASSWORD_LP_ID, position, program_name: 'Digital Keeper' });
    void trackEvent({
      lp_id: PASSWORD_LP_ID,
      event_name: 'partner_click',
      cta_id: `digitalkeeper-${position}`,
      partner_category: 'password',
      source_section: position,
      metadata: { partner: 'digitalkeeper', position, asp: 'rentracks', programId: '16230' },
    });
  };
  return (
    <div className="relative mt-8 flex flex-col gap-3 rounded-2xl border-2 border-orange-200 bg-orange-50/60 p-5">
      <p className="text-[17px] font-bold text-slate-900">{lead}</p>
      <ul className="flex flex-col gap-1.5">
        {POINTS.map((t) => (
          <li key={t} className="flex items-start gap-2 text-[15px] leading-7 text-slate-800">
            <Check size={18} className="mt-1.5 shrink-0 text-orange-600" aria-hidden="true" />{t}
          </li>
        ))}
      </ul>
      <a
        href={HREF}
        target="_blank"
        rel="sponsored noopener"
        onClick={onClick}
        className="flex min-h-[56px] w-full items-center justify-center gap-2 rounded-2xl bg-orange-600 px-5 text-[17px] font-bold text-white no-underline transition hover:bg-orange-700"
      >
        Digital Keeper を見てみる <ArrowRight size={20} aria-hidden="true" />
      </a>
      <p className="text-center text-[12px] text-slate-500">Digital Keeper のサイトに移動します（記載は公式サイト、2026年11月16日 確認）</p>
      {/* 表示計測（1×1の画像）。広告リンクと一緒に置く決まり。 */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={BEACON} width={1} height={1} alt="" className="absolute h-px w-px opacity-0" />
    </div>
  );
}
