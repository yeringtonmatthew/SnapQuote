export default function InvoiceDetailLoading() {
  return (
    <div className="min-h-dvh bg-[#f2f2f7] dark:bg-gray-950 pb-24 lg:pb-8 lg:pl-[220px]">
      <div className="sticky top-0 z-20 bg-[#f2f2f7]/80 dark:bg-gray-950/80 backdrop-blur-xl border-b border-black/5 dark:border-white/5 px-4 pt-[60px] pb-4 lg:px-8 lg:pt-8">
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-2">
            <div className="h-7 w-36 rounded-xl bg-gray-200 dark:bg-gray-800 animate-pulse" />
            <div className="h-4 w-52 rounded-lg bg-gray-100 dark:bg-gray-800/60 animate-pulse" />
          </div>
          <div className="h-10 w-24 rounded-xl bg-gray-200 dark:bg-gray-800 animate-pulse" />
        </div>
      </div>

      <div className="px-4 py-4 lg:px-8 space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-2xl bg-white dark:bg-gray-900 p-5 shadow-sm ring-1 ring-black/[0.04] dark:ring-white/[0.06] animate-pulse"
          >
            <div className="space-y-3">
              <div className="h-4 w-32 rounded bg-gray-200 dark:bg-gray-800" />
              <div className="h-3 w-full rounded bg-gray-100 dark:bg-gray-800/60" />
              <div className="h-3 w-3/4 rounded bg-gray-100 dark:bg-gray-800/60" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
