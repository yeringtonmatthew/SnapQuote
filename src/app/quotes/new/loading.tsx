export default function NewQuoteLoading() {
  return (
    <div className="min-h-dvh bg-[#f2f2f7] dark:bg-gray-950 pb-24 lg:pb-8 lg:pl-[220px]">
      <div className="px-4 pt-14 pb-4">
        <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse mb-4" />
        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
      </div>
      <div className="px-4 mb-6">
        <div className="flex gap-2">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
          ))}
        </div>
      </div>
      <div className="px-4">
        <div className="rounded-2xl bg-white dark:bg-gray-900 shadow-sm ring-1 ring-black/[0.04] p-5 space-y-4 animate-pulse">
          <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded-xl" />
          <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded-xl" />
          <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded-xl" />
          <div className="h-32 w-full bg-gray-200 dark:bg-gray-700 rounded-xl" />
          <div className="h-12 w-full bg-gray-200 dark:bg-gray-700 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
