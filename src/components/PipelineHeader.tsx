'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import LeadCreateSheet from './LeadCreateSheet';

interface PipelineHeaderProps {
  activeCount: number;
  totalValue: number;
  isEmpty: boolean;
}

export default function PipelineHeader({ activeCount, totalValue, isEmpty }: PipelineHeaderProps) {
  const router = useRouter();
  const [showLeadSheet, setShowLeadSheet] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-10 bg-[#f2f2f7]/90 dark:bg-gray-950/90 backdrop-blur-xl border-b border-black/5 dark:border-white/5 px-5 pt-14 lg:pt-6 pb-4">
        <div className="mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-[28px] font-bold tracking-tight text-gray-900 dark:text-gray-100">
              Pipeline
            </h1>
            {!isEmpty && (
              <p className="text-[13px] text-gray-500 dark:text-gray-400 tabular-nums mt-0.5">
                {activeCount} active
                <span className="mx-1.5 text-gray-300 dark:text-gray-600">&middot;</span>
                ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowLeadSheet(true)}
              className="flex items-center gap-1.5 rounded-full bg-white dark:bg-gray-800 px-3.5 py-2 text-[13px] font-semibold text-gray-700 dark:text-gray-300 shadow-sm ring-1 ring-black/[0.04] dark:ring-white/[0.06] press-scale transition-colors"
            >
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Lead
            </button>
            <Link
              href="/quotes/new"
              className="flex items-center gap-1.5 rounded-full bg-brand-600 px-4 py-2 text-[13px] font-semibold text-white shadow-sm press-scale transition-colors focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
            >
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={3}
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Quote
            </Link>
          </div>
        </div>
      </header>

      <LeadCreateSheet
        open={showLeadSheet}
        onClose={() => setShowLeadSheet(false)}
        onCreated={() => router.refresh()}
      />
    </>
  );
}
