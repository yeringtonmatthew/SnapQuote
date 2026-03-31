'use client';
import * as Sentry from '@sentry/nextjs';
import Link from 'next/link';
import { useEffect } from 'react';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-[#f2f2f7] px-6">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
          <svg className="h-7 w-7 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <h1 className="text-[20px] font-bold text-gray-900">Something went wrong</h1>
        <p className="mt-2 max-w-sm text-[14px] leading-relaxed text-gray-500">
          We hit an unexpected error. This has been reported and we&apos;re looking into it.
        </p>
        <div className="mt-6 flex flex-col items-center gap-3">
          <button
            onClick={reset}
            className="rounded-2xl bg-brand-600 px-8 py-3 text-[15px] font-semibold text-white hover:bg-brand-700 transition-colors"
          >
            Try Again
          </button>
          <Link
            href="/dashboard"
            className="text-[14px] font-medium text-gray-400 hover:text-gray-600 transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
