'use client';

import { useState, type ReactNode } from 'react';
import { CheckCircle2 } from 'lucide-react';
import SouzokuExit from '@/components/souzoku/SouzokuExit';
import type { SouzokuPartnerKey } from '@/lib/souzoku/partners';

/**
 * 配布物を取ったすぐ下に「次の一歩」を出す（2026-11-15）。
 * 相続・保険のページは閲覧91のうち配布物の押下33（36%）、紹介先の押下1（約1%）で、配布物を取った人がそのまま帰っていた。
 * 保険の一覧表（#99）と同じ形を、相続のページ全体に広げる。中の a[download] が押されたときだけ開く（押下の数え方は今のまま。二重に数えない）。
 * 紹介先は各ページの出口と同じ1つ（出口は1ページに1つの決まりは変わらない）。
 */
export default function AfterDownload({
  children, lpId, partner, lead,
}: { children: ReactNode; lpId: string; partner: SouzokuPartnerKey; lead: string }) {
  const [done, setDone] = useState(false);
  return (
    <div
      className="flex flex-col gap-3"
      onClickCapture={(e) => {
        const a = (e.target as HTMLElement).closest('a[download]');
        if (a) setDone(true);
      }}
    >
      {children}
      {done && (
        <div className="flex flex-col gap-3 leading-normal" aria-live="polite">
          <p className="flex items-center gap-2 text-[15px] font-black text-slate-900">
            <CheckCircle2 size={20} className="text-emerald-600" aria-hidden="true" />
            書き出したら、次はこちら
          </p>
          <SouzokuExit lpId={lpId} partner={partner} position="after-download" lead={lead} />
        </div>
      )}
    </div>
  );
}
