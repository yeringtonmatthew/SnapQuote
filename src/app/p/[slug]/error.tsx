'use client';

export default function ProfileError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-[#f2f2f7] px-6">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
          <svg className="h-7 w-7 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <h1 className="text-[20px] font-bold text-gray-900">Something went wrong</h1>
        <p className="mt-2 text-[14px] text-gray-500">We couldn't load this profile. Please try again.</p>
        <button
          onClick={reset}
          className="mt-6 rounded-xl bg-gray-900 px-6 py-3 text-[14px] font-semibold text-white hover:bg-gray-800 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
