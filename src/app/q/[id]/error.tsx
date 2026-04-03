'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export default function ProposalError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => { Sentry.captureException(error); }, [error]);
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-[#f7f7f8] px-6">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
          <svg className="h-7 w-7 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <h1 className="text-[20px] font-bold text-gray-900">Something went wrong</h1>
        <p className="mt-2 text-[14px] text-gray-500">We couldn't load this proposal. Please try again.</p>
        <button
          onClick={reset}
          className="mt-6 rounded-xl bg-brand-600 px-6 py-3 text-[14px] font-semibold text-white hover:bg-brand-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
