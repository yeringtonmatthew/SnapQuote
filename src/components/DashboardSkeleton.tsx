import { Skeleton } from '@/components/ui/Skeleton';

export function DashboardSkeleton() {
  return (
    <div className="min-h-dvh bg-[#f2f2f7] dark:bg-gray-950 pb-28">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[#f2f2f7]/80 dark:bg-gray-950/80 backdrop-blur-2xl border-b border-black/[0.04] dark:border-white/[0.04] px-5 pt-14 pb-4">
        <div className="mx-auto max-w-lg flex items-center justify-between">
          <div>
            <Skeleton className="h-3 w-32 rounded-full" />
            <Skeleton className="mt-2 h-7 w-40 rounded-full" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-9 rounded-full" />
            <Skeleton className="h-9 w-9 rounded-full" />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 pt-5 space-y-6">
        {/* Smart Actions Bar */}
        <div className="flex gap-2.5 overflow-hidden">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[52px] w-40 rounded-2xl flex-shrink-0" />
          ))}
        </div>

        {/* Hero stat card */}
        <Skeleton className="h-[100px] w-full rounded-2xl" />

        {/* 3-column stat cards */}
        <div className="grid grid-cols-3 gap-2.5">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-2xl bg-white dark:bg-gray-900 p-4 shadow-sm ring-1 ring-black/[0.04] dark:ring-white/[0.06] space-y-2"
            >
              <Skeleton className="h-2.5 w-12" />
              <Skeleton className="h-6 w-14" />
              <Skeleton className="h-2.5 w-16" />
            </div>
          ))}
        </div>

        {/* Today's Schedule */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-4 w-12 rounded-full" />
            </div>
            <Skeleton className="h-3 w-20 rounded-full" />
          </div>
          <Skeleton className="h-[72px] w-full rounded-2xl" />
        </div>

        {/* Quick Actions */}
        <div>
          <Skeleton className="mb-3 ml-1 h-3 w-24 rounded-full" />
          <div className="grid grid-cols-3 gap-2.5">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-[80px] rounded-2xl" />
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <Skeleton className="h-4 w-28 rounded-full" />
            <Skeleton className="h-3 w-16 rounded-full" />
          </div>
          <div className="space-y-1.5">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-2xl bg-white dark:bg-gray-900 px-4 py-3 shadow-sm ring-1 ring-black/[0.04] dark:ring-white/[0.06] min-h-[56px]"
              >
                <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
                <div className="shrink-0 space-y-2 flex flex-col items-end">
                  <Skeleton className="h-4 w-14" />
                  <Skeleton className="h-4 w-12 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
