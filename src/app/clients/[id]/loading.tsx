export default function ClientDetailLoading() {
  return (
    <div className="min-h-dvh bg-[#f2f2f7] dark:bg-gray-950 pb-24 lg:pb-8 lg:pl-[220px]">
      <div className="px-4 pt-14 pb-4 space-y-3">
        <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
        <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
      </div>
      <div className="px-4 space-y-4">
        <div className="rounded-2xl bg-white dark:bg-gray-900 shadow-sm ring-1 ring-black/[0.04] p-5 space-y-3 animate-pulse">
          <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
        <div className="rounded-2xl bg-white dark:bg-gray-900 shadow-sm ring-1 ring-black/[0.04] p-5 space-y-3 animate-pulse">
          <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 w-full bg-gray-200 dark:bg-gray-700 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
