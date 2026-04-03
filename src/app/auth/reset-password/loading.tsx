export default function ResetPasswordLoading() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-[#f2f2f7] dark:bg-gray-950 px-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center">
          <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
          <div className="mt-4 h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
          <div className="mt-2 h-4 w-56 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
        </div>
        <div className="rounded-2xl bg-white dark:bg-gray-900 shadow-sm ring-1 ring-black/[0.04] p-6 space-y-4 animate-pulse">
          <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded-xl" />
          <div className="h-12 w-full bg-gray-200 dark:bg-gray-700 rounded-2xl" />
        </div>
        <div className="h-4 w-32 mx-auto bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
      </div>
    </div>
  );
}
