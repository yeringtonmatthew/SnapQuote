'use client';

import Link from 'next/link';

export default function QuickActions() {
  return (
    <div className="grid grid-cols-3 gap-3">
      {/* New Quote — primary */}
      <Link
        href="/quotes/new"
        prefetch
        className="flex min-h-[92px] flex-col items-center justify-center gap-2.5 rounded-2xl bg-brand-600 p-4 shadow-sm shadow-brand-600/20 transition-all active:scale-[0.97]"
      >
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20">
          <svg className="h-5.5 w-5.5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </div>
        <span className="text-[13px] font-semibold text-white">New Quote</span>
      </Link>

      {/* Add Customer */}
      <Link
        href="/clients/new"
        prefetch
        className="flex min-h-[92px] flex-col items-center justify-center gap-2.5 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/[0.04] transition-all active:scale-[0.97] dark:bg-gray-900 dark:ring-white/[0.06]"
      >
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800">
          <svg className="h-5.5 w-5.5 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
          </svg>
        </div>
        <span className="text-[13px] font-semibold text-gray-700 dark:text-gray-300">Add Customer</span>
      </Link>

      {/* Open Quote Board */}
      <Link
        href="/pipeline"
        prefetch
        className="flex min-h-[92px] flex-col items-center justify-center gap-2.5 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/[0.04] transition-all active:scale-[0.97] dark:bg-gray-900 dark:ring-white/[0.06]"
      >
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800">
          <svg className="h-5.5 w-5.5 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 4.5h14.25M3 9h9.75M3 13.5h5.25m5.25-.75L17.25 9m0 0L21 12.75M17.25 9v12" />
          </svg>
        </div>
        <span className="text-[13px] font-semibold text-gray-700 dark:text-gray-300">Quote Board</span>
      </Link>
    </div>
  );
}
