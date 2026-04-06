import { Skeleton } from '@/components/ui/Skeleton';

export function ScheduleSkeleton() {
  return (
    <section className="lg:col-start-2 lg:row-start-2 lg:row-span-2">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-4 w-12 rounded-full" />
        </div>
        <Skeleton className="h-3 w-20 rounded-full" />
      </div>
      {[1, 2].map((i) => (
        <Skeleton key={i} className="h-[72px] w-full rounded-2xl mb-2" />
      ))}
    </section>
  );
}
