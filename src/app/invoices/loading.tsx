export default function InvoicesLoading() {
  return (
    <div className="min-h-dvh bg-[#f2f2f7] dark:bg-gray-950 pb-24 lg:pb-8 lg:pl-[220px]">
      <div className="px-4 pt-14 pb-4 space-y-3 lg:px-8">
        <div className="h-8 w-36 rounded-xl bg-gray-200 dark:bg-gray-800 animate-pulse" />
        <div className="h-4 w-44 rounded-lg bg-gray-100 dark:bg-gray-800/60 animate-pulse" />
      </div>
      <div className="px-4 lg:px-8 space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-2xl bg-white dark:bg-gray-900 p-4 shadow-sm ring-1 ring-black/[0.04] dark:ring-white/[0.06] animate-pulse"
          >
            <div className="flex items-start gap-3.5">
              <div className="h-11 w-11 rounded-full bg-gray-200 dark:bg-gray-800" />
              <div className="flex-1 space-y-2.5">
                <div className="flex items-center justify-between gap-3">
                  <div className="h-4 w-40 rounded bg-gray-200 dark:bg-gray-800" />
                  <div className="h-4 w-20 rounded bg-gray-200 dark:bg-gray-800" />
                </div>
                <div className="h-3 w-56 rounded bg-gray-100 dark:bg-gray-800/60" />
                <div className="flex items-center gap-2">
                  <div className="h-5 w-24 rounded-full bg-gray-100 dark:bg-gray-800/60" />
                  <div className="h-5 w-16 rounded-full bg-gray-100 dark:bg-gray-800/60" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

