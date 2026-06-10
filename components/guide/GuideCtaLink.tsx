'use client';

import Link from 'next/link';
import { sendGA4Event } from '@/lib/analytics/ga4';

/**
 * 役立ちガイド記事内の「無料で始める」CTA用リンク。
 * クリック時に GA4 イベント `guide_cta_click` を送信し、
 * どの記事（area=パス名）のどの位置（location）から登録へ進んだかを計測する。
 * 見た目は通常の <Link> と同じ（className をそのまま渡す）。
 */
export default function GuideCtaLink({
  href,
  className,
  children,
  location = 'footer_cta',
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
  location?: string;
}) {
  return (
    <Link
      href={href}
      className={className}
      onClick={() => {
        sendGA4Event('guide_cta_click', {
          area: typeof window !== 'undefined' ? window.location.pathname : undefined,
          location,
        });
      }}
    >
      {children}
    </Link>
  );
}
