'use client';

import Link from 'next/link';

interface TrialBannerProps {
  daysRemaining: number;
  subscriptionStatus: string | null;
}

export default function TrialBanner({ daysRemaining, subscriptionStatus }: TrialBannerProps) {
  // Don't show for active subscribers
  if (subscriptionStatus === 'active') return null;

  // Don't show if more than 7 days left (avoid nagging)
  if (subscriptionStatus === 'trialing' && daysRemaining > 7) return null;

  const isExpired = daysRemaining <= 0;
  const isUrgent = daysRemaining <= 3;

  return (
    <div
      className={`rounded-xl px-4 py-3 text-sm font-medium flex items-center justify-between gap-3 ${
        isExpired
          ? 'bg-red-50 text-red-700 ring-1 ring-red-200'
          : isUrgent
            ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
            : 'bg-brand-50 text-brand-700 ring-1 ring-brand-200'
      }`}
    >
      <span>
        {isExpired
          ? '⚠️ Your free trial has ended.'
          : `⏳ ${daysRemaining} day${daysRemaining === 1 ? '' : 's'} left in your free trial.`}
      </span>
      <Link
        href="/subscribe"
        className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
          isExpired
            ? 'bg-red-600 text-white hover:bg-red-500'
            : 'bg-brand-600 text-white hover:bg-brand-500'
        }`}
      >
        {isExpired ? 'Subscribe Now' : 'Upgrade'}
      </Link>
    </div>
  );
}
