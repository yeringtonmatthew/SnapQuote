import { Skeleton } from '@/components/ui/Skeleton';

export function DashboardSkeleton() {
  return (
    <div className="min-h-dvh bg-[#f2f2f7] pb-28">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[#f2f2f7]/90 backdrop-blur-xl border-b border-black/5 px-5 pt-14 pb-4">
        <div className="mx-auto max-w-lg flex items-center justify-between">
          <div>
            <Skeleton className="h-3 w-20 rounded-full" />
            <Skeleton className="mt-2 h-6 w-32 rounded-full" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-28 rounded-full" />
            <Skeleton className="h-9 w-9 rounded-full" />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 pt-5 space-y-5">
        {/* Stat cards — 2x2 grid */}
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="rounded-2xl bg-white p-4 shadow-sm border border-gray-100 space-y-2"
            >
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-7 w-20" />
              <Skeleton className="h-3 w-24" />
            </div>
          ))}
        </div>

        {/* Section label */}
        <div>
          <Skeleton className="mb-3 ml-1 h-3 w-24 rounded-full" />

          {/* Quote list items */}
          <div className="space-y-2.5">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex items-center gap-4 rounded-2xl bg-white px-4 py-3.5 shadow-sm"
              >
                {/* Photo thumbnail */}
                <Skeleton className="h-14 w-14 shrink-0 rounded-xl" />

                {/* Info */}
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>

                {/* Right side — price + status */}
                <div className="shrink-0 space-y-2 flex flex-col items-end">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-12 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
