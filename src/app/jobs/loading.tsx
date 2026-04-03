export default function JobsLoading() {
  return (
    <div className="min-h-dvh bg-[#f2f2f7] dark:bg-gray-950 pb-24 lg:pb-8 lg:pl-[220px]">
      <div className="px-4 pt-14 pb-4 space-y-3">
        <div className="h-8 w-32 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" />
        <div className="h-4 w-48 bg-gray-100 dark:bg-gray-800/60 rounded-lg animate-pulse" />
      </div>
      <div className="px-4 space-y-2">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="rounded-2xl bg-white dark:bg-gray-900 shadow-sm ring-1 ring-black/[0.04] p-4 animate-pulse">
            <div className="h-4 w-40 bg-gray-200 dark:bg-gray-800 rounded mb-2" />
            <div className="h-3 w-60 bg-gray-100 dark:bg-gray-800/60 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
