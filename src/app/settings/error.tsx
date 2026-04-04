'use client';

import Link from 'next/link';

export default function SettingsError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-gray-50 dark:bg-gray-950 px-6">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/40">
          <svg className="h-7 w-7 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <h1 className="text-[20px] font-bold text-gray-900 dark:text-white">Settings failed to load</h1>
        <p className="mt-2 max-w-sm text-[14px] leading-relaxed text-gray-500 dark:text-gray-400">
          We hit an unexpected error loading your settings. Please try again.
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
            className="text-[14px] font-medium text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
