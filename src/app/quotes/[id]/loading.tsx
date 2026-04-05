export default function QuoteDetailLoading() {
  return (
    <div className="min-h-dvh bg-[#f2f2f7] dark:bg-gray-950 animate-page-enter">
      {/* Header skeleton */}
      <div className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/60 dark:border-white/10 safe-area-top">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="h-5 w-16 rounded-lg animate-shimmer" />
          <div className="h-5 w-32 rounded-lg animate-shimmer" />
          <div className="h-8 w-24 rounded-xl animate-shimmer" />
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-6 space-y-4">
        {/* Customer info card */}
        <div className="rounded-2xl bg-white dark:bg-gray-900 p-5 shadow-sm ring-1 ring-black/[0.04] dark:ring-white/[0.06]">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-full animate-shimmer" />
            <div className="space-y-2 flex-1">
              <div className="h-4 w-36 rounded-lg animate-shimmer" />
              <div className="h-3 w-48 rounded-lg animate-shimmer" />
            </div>
          </div>
          <div className="h-3 w-24 rounded-lg animate-shimmer" />
        </div>

        {/* Line items skeleton */}
        <div className="rounded-2xl bg-white dark:bg-gray-900 p-5 shadow-sm ring-1 ring-black/[0.04] dark:ring-white/[0.06] space-y-4">
          <div className="h-4 w-24 rounded-lg animate-shimmer" />
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
              <div className="space-y-2 flex-1">
                <div className="h-4 w-44 rounded-lg animate-shimmer" />
                <div className="h-3 w-28 rounded-lg animate-shimmer" />
              </div>
              <div className="h-4 w-16 rounded-lg animate-shimmer" />
            </div>
          ))}
          {/* Total */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="h-5 w-12 rounded-lg animate-shimmer" />
            <div className="h-6 w-24 rounded-lg animate-shimmer" />
          </div>
        </div>

        {/* Photos skeleton */}
        <div className="rounded-2xl bg-white dark:bg-gray-900 p-5 shadow-sm ring-1 ring-black/[0.04] dark:ring-white/[0.06]">
          <div className="h-4 w-16 rounded-lg animate-shimmer mb-3" />
          <div className="flex gap-2">
            <div className="h-20 w-20 rounded-xl animate-shimmer" />
            <div className="h-20 w-20 rounded-xl animate-shimmer" />
          </div>
        </div>
      </div>
    </div>
  );
}
