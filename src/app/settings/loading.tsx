export default function SettingsLoading() {
  return (
    <div className="min-h-dvh bg-[#f2f2f7] px-4 pt-14 pb-8">
      <div className="mx-auto max-w-lg space-y-6">
        {/* Logo / profile card skeleton */}
        <div className="flex flex-col items-center rounded-2xl bg-white px-6 py-6 shadow-sm">
          <div className="h-20 w-20 animate-pulse rounded-full bg-gray-200" />
          <div className="mt-4 h-4 w-32 animate-pulse rounded-full bg-gray-200" />
          <div className="mt-2 h-3 w-44 animate-pulse rounded-full bg-gray-200" />
        </div>

        {/* Business info card skeleton */}
        <div className="rounded-2xl bg-white px-5 py-5 shadow-sm space-y-4">
          <div className="h-3 w-16 animate-pulse rounded-full bg-gray-200" />
          <div className="h-10 w-full animate-pulse rounded-xl bg-gray-200" />
          <div className="h-10 w-full animate-pulse rounded-xl bg-gray-200" />
          <div className="h-10 w-full animate-pulse rounded-xl bg-gray-200" />
        </div>

        {/* Pricing card skeleton */}
        <div className="rounded-2xl bg-white px-5 py-5 shadow-sm space-y-4">
          <div className="h-3 w-28 animate-pulse rounded-full bg-gray-200" />
          <div className="h-10 w-full animate-pulse rounded-xl bg-gray-200" />
          <div className="h-10 w-full animate-pulse rounded-xl bg-gray-200" />
        </div>

        {/* Save button skeleton */}
        <div className="h-12 w-full animate-pulse rounded-2xl bg-gray-200" />
      </div>
    </div>
  );
}
