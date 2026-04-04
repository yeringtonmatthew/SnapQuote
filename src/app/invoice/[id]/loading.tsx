export default function InvoiceLoading() {
  return (
    <div className="min-h-dvh bg-gray-100 dark:bg-gray-950">
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="rounded-2xl bg-white dark:bg-gray-900 shadow-sm ring-1 ring-black/[0.06] dark:ring-white/[0.06] overflow-hidden">
          {/* Header skeleton */}
          <div className="border-b border-gray-100 dark:border-gray-800 px-8 py-8 sm:flex sm:items-start sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-800" />
              <div className="space-y-2">
                <div className="h-5 w-40 animate-pulse rounded-full bg-gray-200 dark:bg-gray-800" />
                <div className="h-3 w-28 animate-pulse rounded-full bg-gray-200 dark:bg-gray-800" />
              </div>
            </div>
            <div className="mt-4 sm:mt-0 sm:text-right space-y-2">
              <div className="h-8 w-32 animate-pulse rounded-full bg-gray-200 dark:bg-gray-800" />
              <div className="h-3 w-24 animate-pulse rounded-full bg-gray-200 dark:bg-gray-800" />
            </div>
          </div>

          {/* Bill To skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 px-8 py-6 border-b border-gray-100 dark:border-gray-800">
            <div className="space-y-2">
              <div className="h-3 w-16 animate-pulse rounded-full bg-gray-200 dark:bg-gray-800" />
              <div className="h-4 w-32 animate-pulse rounded-full bg-gray-200 dark:bg-gray-800" />
              <div className="h-3 w-28 animate-pulse rounded-full bg-gray-200 dark:bg-gray-800" />
            </div>
            <div className="space-y-2">
              <div className="h-3 w-16 animate-pulse rounded-full bg-gray-200 dark:bg-gray-800" />
              <div className="h-4 w-32 animate-pulse rounded-full bg-gray-200 dark:bg-gray-800" />
              <div className="h-3 w-28 animate-pulse rounded-full bg-gray-200 dark:bg-gray-800" />
            </div>
          </div>

          {/* Line items skeleton */}
          <div className="px-8 py-5 border-b border-gray-100 dark:border-gray-800 space-y-3">
            <div className="h-3 w-20 animate-pulse rounded-full bg-gray-200 dark:bg-gray-800" />
            <div className="h-10 w-full animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800" />
            <div className="h-8 w-full animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800" />
            <div className="h-8 w-full animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800" />
          </div>

          {/* Totals skeleton */}
          <div className="px-8 py-5 space-y-2">
            <div className="flex justify-end">
              <div className="w-72 space-y-2">
                <div className="h-4 w-full animate-pulse rounded-full bg-gray-200 dark:bg-gray-800" />
                <div className="h-5 w-full animate-pulse rounded-full bg-gray-200 dark:bg-gray-800" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
