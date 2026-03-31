import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-white px-6">
      <div className="text-center">
        <p className="text-[120px] font-bold leading-none text-gray-200 sm:text-[160px]">
          404
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-gray-900 sm:text-3xl">
          Page not found
        </h1>
        <p className="mt-2 text-base text-gray-500">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-xl bg-brand-600 px-6 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-brand-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
          >
            Back to Dashboard
          </Link>
          <Link
            href="/"
            className="text-sm font-medium text-gray-500 transition hover:text-gray-700"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
