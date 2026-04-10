'use client';

import { useRouter } from 'next/navigation';

type BackButtonProps = {
  fallbackHref: string;
  className?: string;
  label?: string;
};

export default function BackButton({
  fallbackHref,
  className = '',
  label = '戻る',
}: BackButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
      return;
    }

    router.push(fallbackHref);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={className}
    >
      {label}
    </button>
  );
}