'use client';

import { ArrowUp } from 'lucide-react';
import { sendGAEvent } from '@next/third-parties/google';
import { trackEvent } from '@/lib/trackEvent';

/**
 * 説明の節を読み終えた所に置く、診断への入口。画面上の診断パネル（id="check"）へ戻す。
 * 2026-10-30：/check/scs の記録で、来た人の1/3が一番下まで読んで診断を始めずに帰っていた
 * （パソコンには画面下の固定ボタンが出ない）ため追加。押した回数を trend_entry_click（section 付き）で記録する。
 */
export default function CheckEntryButton({ lpId, section, label }: { lpId: string; section: string; label: string }) {
  const onClick = () => {
    sendGAEvent('event', 'trend_entry_click', { lp_name: lpId, section });
    void trackEvent({ lp_id: lpId, event_name: 'trend_entry_click', section_id: section, cta_id: 'entry' });
    document.getElementById('check')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 text-[15px] font-bold text-orange-700 ring-2 ring-orange-300 transition hover:bg-orange-50 active:scale-[.99]"
    >
      {label} <ArrowUp size={18} aria-hidden="true" />
    </button>
  );
}
