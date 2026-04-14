import { Skeleton } from '@/components/ui/Skeleton';

export function StatsSkeleton() {
  return (
    <>
      {/* SmartActionsBar skeleton */}
      <div className="lg:col-span-2">
        <div className="flex gap-2.5 overflow-hidden">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[56px] w-44 rounded-2xl flex-shrink-0" />
          ))}
        </div>
      </div>

      {/* Revenue card skeleton */}
      <div className="lg:col-start-1">
        <Skeleton className="h-[116px] w-full rounded-2xl" />

        {/* 3-column stat cards */}
        <div className="mt-4 grid grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="space-y-2 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/[0.04] dark:bg-gray-900 dark:ring-white/[0.06]"
            >
              <Skeleton className="h-3 w-14" />
              <Skeleton className="h-7 w-16" />
              <Skeleton className="h-3 w-20" />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
