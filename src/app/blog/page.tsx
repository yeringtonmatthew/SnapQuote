import Link from 'next/link';
import { Metadata } from 'next';
import { SnapQuoteLogo } from '@/components/SnapQuoteLogo';
import { getAllArticles } from '@/lib/blog';

export const metadata: Metadata = {
  title: 'SnapQuote Blog - Roofing Business Tips, Estimating Guides & More',
  description:
    'Practical advice for roofing contractors. Learn how to write better proposals, collect deposits, choose estimating software, and grow your business.',
  openGraph: {
    title: 'SnapQuote Blog - Roofing Business Tips & Guides',
    description:
      'Practical advice for roofing contractors. Proposals, estimating, deposits, and business growth.',
    type: 'website',
    url: 'https://snapquote.dev/blog',
    images: [
      {
        url: 'https://snapquote.dev/api/og?title=SnapQuote+Blog&subtitle=Tips+for+Roofing+Contractors',
        width: 1200,
        height: 630,
      },
    ],
  },
  alternates: {
    canonical: '/blog',
  },
};

const categoryColors: Record<string, string> = {
  Sales: 'bg-blue-50 text-blue-700 ring-blue-200/60',
  Tools: 'bg-purple-50 text-purple-700 ring-purple-200/60',
  Business: 'bg-emerald-50 text-emerald-700 ring-emerald-200/60',
};

export default function BlogIndex() {
  const articles = getAllArticles();

  return (
    <div className="force-light min-h-dvh bg-[#f2f2f7] antialiased">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-2xl backdrop-saturate-[1.8] border-b border-black/[0.04]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 h-16">
          <Link href="/" aria-label="SnapQuote home">
            <SnapQuoteLogo size="sm" />
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/auth/login"
              className="rounded-full px-5 py-2 text-[14px] font-medium text-gray-500 transition-colors hover:text-gray-900"
            >
              Log In
            </Link>
            <Link
              href="/auth/signup"
              className="rounded-full bg-gray-900 px-5 py-2 text-[14px] font-semibold text-white shadow-sm transition-all hover:bg-gray-800 active:scale-[0.97]"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Header */}
      <header className="bg-white border-b border-gray-100">
        <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-gray-400 transition-colors hover:text-gray-600 mb-6"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
              />
            </svg>
            Back to Home
          </Link>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            SnapQuote Blog
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-gray-500">
            Practical tips for roofing contractors who want to close more jobs,
            get paid faster, and run a tighter business.
          </p>
        </div>
      </header>

      {/* Article Grid */}
      <main className="mx-auto max-w-6xl px-6 py-12 sm:py-16">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <Link
              key={article.slug}
              href={`/blog/${article.slug}`}
              className="group flex flex-col rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 transition-all duration-300 hover:shadow-lg hover:ring-gray-200"
            >
              {/* Category + Reading Time */}
              <div className="flex items-center gap-3 mb-4">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ${
                    categoryColors[article.category] ||
                    'bg-gray-50 text-gray-600 ring-gray-200/60'
                  }`}
                >
                  {article.category}
                </span>
                <span className="text-[12px] text-gray-400">
                  {article.readingTime}
                </span>
              </div>

              {/* Title */}
              <h2 className="text-[17px] font-semibold leading-snug text-gray-900 group-hover:text-blue-600 transition-colors">
                {article.title}
              </h2>

              {/* Excerpt */}
              <p className="mt-3 flex-1 text-[14px] leading-relaxed text-gray-500">
                {article.excerpt}
              </p>

              {/* Date + Arrow */}
              <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4">
                <time
                  dateTime={article.date}
                  className="text-[13px] text-gray-400"
                >
                  {new Date(article.date).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </time>
                <svg
                  className="h-4 w-4 text-gray-300 transition-transform group-hover:translate-x-1 group-hover:text-blue-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                  />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-10">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
            <div className="flex items-center gap-4">
              <SnapQuoteLogo size="xs" />
              <span className="text-[13px] text-gray-400">
                &copy; 2026 SnapQuote
              </span>
            </div>
            <nav aria-label="Footer" className="flex items-center gap-6">
              <Link
                href="/privacy"
                className="text-[13px] text-gray-400 transition hover:text-gray-600"
              >
                Privacy
              </Link>
              <Link
                href="/terms"
                className="text-[13px] text-gray-400 transition hover:text-gray-600"
              >
                Terms
              </Link>
              <a
                href="mailto:support@snapquote.dev"
                className="text-[13px] text-gray-400 transition hover:text-gray-600"
              >
                Support
              </a>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}
