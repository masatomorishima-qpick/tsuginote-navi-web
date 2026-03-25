'use client';

import { sendGAEvent } from '@next/third-parties/google';

type AffiliateCtaBoxProps = {
  title: string;
  description: string;
  buttonText: string;
  href: string;
  lpName: string;
  position: 'firstview' | 'bottom';
  programName: string;
};

export default function AffiliateCtaBox({
  title,
  description,
  buttonText,
  href,
  lpName,
  position,
  programName,
}: AffiliateCtaBoxProps) {
  const handleClick = () => {
    sendGAEvent('event', 'affiliate_click', {
      lp_name: lpName,
      position,
      program_name: programName,
    });
  };

  return (
    <section className="my-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="mb-3 text-xs font-medium tracking-wide text-slate-500">
        PR｜専門家・事業者の紹介を含みます
      </p>

      <h3 className="text-xl font-bold leading-snug text-slate-900">
        {title}
      </h3>

      <p className="mt-3 text-sm leading-7 text-slate-700">
        {description}
      </p>

      <div className="mt-5">
        <a
          href={href}
          target="_blank"
          rel="sponsored noopener noreferrer"
          onClick={handleClick}
          className="inline-flex min-h-[52px] w-full items-center justify-center rounded-xl bg-slate-900 px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-slate-700"
        >
          {buttonText}
        </a>
      </div>
    </section>
  );
}