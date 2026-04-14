import { Skeleton } from '@/components/ui/Skeleton';

export function ActivitySkeleton() {
  return (
    <>
      {/* QuickActions skeleton */}
      <div className="lg:col-start-1">
        <Skeleton className="mb-3 ml-1 h-4 w-24 rounded-full" />
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[92px] rounded-2xl" />
          ))}
        </div>
      </div>

      {/* Active Jobs skeleton */}
      <div className="lg:col-start-1">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-5 w-24 rounded-full" />
          </div>
          <Skeleton className="h-4 w-16 rounded-full" />
        </div>
        {[1, 2].map((i) => (
          <Skeleton key={i} className="mb-2 h-[64px] w-full rounded-2xl" />
        ))}
      </div>

      {/* Recent Activity skeleton */}
      <div className="lg:col-start-2">
        <div className="flex items-center justify-between mb-3 px-1">
          <Skeleton className="h-5 w-32 rounded-full" />
          <Skeleton className="h-4 w-16 rounded-full" />
        </div>
        <div className="space-y-1.5">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex min-h-[64px] items-center gap-3 rounded-2xl bg-white px-5 py-3.5 shadow-sm ring-1 ring-black/[0.04] dark:bg-gray-900 dark:ring-white/[0.06]"
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
    </>
  );
}
