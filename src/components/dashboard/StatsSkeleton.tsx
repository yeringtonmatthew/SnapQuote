import { Skeleton } from '@/components/ui/Skeleton';

export function StatsSkeleton() {
  return (
    <>
      {/* SmartActionsBar skeleton */}
      <div className="lg:col-span-2">
        <div className="flex gap-2.5 overflow-hidden">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[52px] w-40 rounded-2xl flex-shrink-0" />
          ))}
        </div>
      </div>

      {/* Revenue card skeleton */}
      <div className="lg:col-start-1">
        <Skeleton className="h-[100px] w-full rounded-2xl" />

        {/* 3-column stat cards */}
        <div className="grid grid-cols-3 gap-2.5 mt-4">
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
      </div>
    </>
  );
}
