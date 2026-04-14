import { Skeleton } from '@/components/ui/Skeleton';

export function ActionsSkeleton() {
  return (
    <>
      {/* DoThisNow skeleton */}
      <div className="lg:col-start-1">
        <div className="flex items-center gap-2 mb-3 px-1">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-4 w-28 rounded-full" />
        </div>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="mb-2 h-[80px] w-full rounded-2xl" />
        ))}
      </div>
    </>
  );
}
