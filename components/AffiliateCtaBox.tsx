'use client';

import { sendGAEvent } from '@next/third-parties/google';

type SummaryItem = {
  label: string;
  value: string;
};

type AffiliateCtaBoxProps = {
  title: string;
  description: string;
  buttonText: string;
  href: string;
  lpName: string;
  position: 'firstview' | 'bottom';
  programName: string;
  summaryItems?: SummaryItem[];
  operatorName?: string;
  serviceLead?: string;
};

export default function AffiliateCtaBox({
  title,
  description,
  buttonText,
  href,
  lpName,
  position,
  programName,
  summaryItems = [],
  operatorName,
  serviceLead,
}: AffiliateCtaBoxProps) {
  const handleClick = () => {
    sendGAEvent('event', 'affiliate_click', {
      lp_name: lpName,
      position,
      program_name: programName,
    });
  };

  return (
    <section className="my-8 rounded-2xl border border-slate-300 bg-slate-50 p-6 shadow-sm">
      <div className="mb-3">
        <span className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200">
          PR｜専門家・事業者の紹介を含みます
        </span>
      </div>

      <h3 className="text-xl font-bold leading-snug text-slate-900">
        {title}
      </h3>

      {serviceLead && (
        <p className="mt-4 text-sm font-semibold leading-7 text-slate-700">
          {serviceLead}
        </p>
      )}

      <p className="mt-4 text-sm leading-8 text-slate-700">
        {description}
      </p>

      {summaryItems.length > 0 && (
        <div className="mt-5 rounded-xl border border-slate-200 bg-white p-4">
          <dl className="space-y-3">
            {summaryItems.map((item) => (
              <div
                key={item.label}
                className="grid gap-1 sm:grid-cols-[120px_1fr] sm:gap-3"
              >
                <dt className="text-sm font-semibold text-slate-900">
                  {item.label}
                </dt>
                <dd className="text-sm leading-6 text-slate-600">
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {operatorName && (
        <p className="mt-4 text-sm leading-6 text-slate-600">
          運営会社：{operatorName}
        </p>
      )}

      <div className="mt-5">
        <a
          href={href}
          target="_blank"
          rel="sponsored noopener noreferrer"
          onClick={handleClick}
          className="inline-flex min-h-[52px] w-full items-center justify-center rounded-xl bg-slate-950 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          {buttonText}
        </a>
      </div>
    </section>
  );
}