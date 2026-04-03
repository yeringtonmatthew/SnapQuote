'use client';

import Link from 'next/link';

export default function JobsError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <div className="h-12 w-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
        <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
      </div>
      <h2 className="text-lg font-bold text-gray-900 mb-1">Something went wrong</h2>
      <p className="text-sm text-gray-500 mb-6">We hit an unexpected error. This has been reported and we&apos;re looking into it.</p>
      <button onClick={() => reset()} className="btn-primary mb-3">Try Again</button>
      <Link href="/dashboard" className="text-sm text-gray-400">Go to Dashboard</Link>
    </div>
  );
}
