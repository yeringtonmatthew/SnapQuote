import { Skeleton } from '@/components/ui/Skeleton';

export function QuoteDetailSkeleton() {
  return (
    <div className="min-h-dvh bg-gray-50 pb-8">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white px-4 py-3">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-9 rounded-lg" />
            <div className="space-y-1.5">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-4 w-16 rounded-full" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-16 rounded-xl" />
            <Skeleton className="h-9 w-16 rounded-xl" />
            <Skeleton className="h-9 w-16 rounded-xl" />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-lg space-y-4 px-4 pt-6">
        {/* AI Summary card */}
        <div className="rounded-2xl bg-white p-4 shadow-sm border border-gray-100 space-y-2">
          <div className="flex items-start gap-2">
            <Skeleton className="h-4 w-4 shrink-0 rounded" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        </div>

        {/* Scope of Work card */}
        <div className="rounded-2xl bg-white p-4 shadow-sm border border-gray-100 space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-2/3" />
        </div>

        {/* Customer info card */}
        <div className="rounded-2xl bg-white p-4 shadow-sm border border-gray-100 space-y-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-28" />
        </div>

        {/* Line items */}
        <div>
          <Skeleton className="mb-2 h-4 w-20" />
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`flex items-start justify-between px-4 py-3 ${
                  i < 3 ? 'border-b border-gray-100' : ''
                }`}
              >
                <div className="min-w-0 flex-1 pr-4 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-4 w-16 shrink-0" />
              </div>
            ))}
          </div>
        </div>

        {/* Totals card */}
        <div className="rounded-2xl bg-white p-4 shadow-sm border border-gray-100 space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-6 w-24" />
          </div>
          <div className="flex items-center justify-between border-t border-gray-100 pt-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-6 w-24" />
          </div>
          <div className="flex items-center justify-between">
            <Skeleton className="h-3 w-36" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>

        {/* Photos area */}
        <div>
          <Skeleton className="mb-2 h-4 w-14" />
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="aspect-square w-full rounded-xl" />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
