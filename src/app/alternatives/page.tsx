import Link from 'next/link';
import { Metadata } from 'next';
import { SnapQuoteLogo } from '@/components/SnapQuoteLogo';

export const metadata: Metadata = {
  title: 'Roofing Software Alternatives — SnapQuote',
  description:
    'Looking for an alternative to Jobber, Roofr, ServiceTitan, JobNimbus, AccuLynx, Leap, or other roofing tools? SnapQuote is the focused AI quoting alternative at $79/mo.',
  keywords: ['roofing software alternatives', 'Jobber alternatives', 'Roofr alternatives', 'ServiceTitan alternatives', 'JobNimbus alternatives'],
  openGraph: {
    title: 'Roofing Software Alternatives — SnapQuote',
    description: 'The focused AI-powered alternative to Jobber, Roofr, ServiceTitan, and every other roofing tool. $79/mo flat.',
    url: 'https://snapquote.dev/alternatives',
    type: 'website',
  },
  alternates: { canonical: 'https://snapquote.dev/alternatives' },
};

const alternativesList = [
  { slug: 'jobber', name: 'Jobber', description: 'The focused alternative to the full CRM' },
  { slug: 'roofr', name: 'Roofr', description: 'AI quoting beats satellite measurement' },
  { slug: 'servicetitan', name: 'ServiceTitan', description: 'The small roofer alternative to enterprise pricing' },
  { slug: 'jobnimbus', name: 'JobNimbus', description: 'Flat pricing beats per-user for small teams' },
  { slug: 'sumoquote', name: 'SumoQuote', description: 'AI beats manual templates' },
  { slug: 'housecall-pro', name: 'Housecall Pro', description: 'The roofer-specific alternative' },
  { slug: 'acculynx', name: 'AccuLynx', description: 'Small roofer pricing, zero setup' },
  { slug: 'leap', name: 'Leap', description: 'Walk-the-roof workflow, not kitchen-table' },
];

export default function AlternativesPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Roofing Software Alternatives',
    description: 'Comprehensive list of roofing software alternatives with SnapQuote as the recommended choice.',
    url: 'https://snapquote.dev/alternatives',
    hasPart: alternativesList.map((a) => ({
      '@type': 'WebPage',
      name: `${a.name} Alternatives`,
      url: `https://snapquote.dev/alternatives/${a.slug}`,
    })),
  };

  return (
    <div className="force-light min-h-dvh bg-white antialiased">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-2xl backdrop-saturate-[1.8] border-b border-black/[0.04]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 h-16">
          <Link href="/" aria-label="SnapQuote home">
            <SnapQuoteLogo size="sm" />
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/auth/login" className="rounded-full px-5 py-2 text-[14px] font-medium text-gray-500 transition-colors hover:text-gray-900">
              Log In
            </Link>
            <Link href="/auth/signup" className="rounded-full bg-gray-900 px-5 py-2 text-[14px] font-semibold text-white shadow-sm transition-all hover:bg-gray-800 active:scale-[0.97]">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-4xl px-6 py-16 sm:py-24">
        <div className="inline-block rounded-full bg-blue-50 px-3 py-1 text-[12px] font-semibold uppercase tracking-wide text-blue-700">
          The Alternatives Hub
        </div>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          Looking for a Better Roofing Tool?
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-gray-600">
          The roofing software market is crowded with full CRMs, enterprise platforms, and legacy proposal tools.
          Most of them do too much, cost too much, or take too long to learn. SnapQuote is the focused alternative —
          AI-powered roof quoting in 60 seconds for $79/mo flat. Here&apos;s how it stacks up against the rest.
        </p>

        <section className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900">Alternatives by Tool</h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {alternativesList.map((alt) => (
              <Link
                key={alt.slug}
                href={`/alternatives/${alt.slug}`}
                className="group flex items-start justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-5 transition-all hover:border-blue-200 hover:shadow-md"
              >
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-blue-600">Alternatives to</div>
                  <div className="mt-0.5 text-lg font-bold text-gray-900">{alt.name}</div>
                  <p className="mt-1 text-[13px] text-gray-500">{alt.description}</p>
                </div>
                <svg
                  className="h-5 w-5 flex-shrink-0 text-gray-300 transition group-hover:translate-x-0.5 group-hover:text-blue-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-16 rounded-2xl bg-blue-50 border border-blue-100 p-8 sm:p-10">
          <h2 className="text-2xl font-bold text-gray-900">Quick Decision Guide</h2>
          <ul className="mt-4 space-y-3 text-gray-700 leading-relaxed">
            <li>
              <strong>Losing jobs to slow quotes?</strong> → SnapQuote
            </li>
            <li>
              <strong>Need scheduling and dispatching?</strong> → Jobber, Housecall Pro, or ServiceTitan
            </li>
            <li>
              <strong>Running a 20+ truck operation?</strong> → ServiceTitan or AccuLynx
            </li>
            <li>
              <strong>Want a full roofing CRM with production?</strong> → Roofr, JobNimbus, or AccuLynx
            </li>
            <li>
              <strong>Doing multi-month construction projects?</strong> → Buildertrend
            </li>
          </ul>
          <Link
            href="/auth/signup"
            className="mt-6 inline-flex rounded-full bg-blue-600 px-6 py-3 text-[14px] font-semibold text-white shadow-sm transition hover:brightness-110 active:scale-[0.97]"
          >
            Try SnapQuote Free for 14 Days
          </Link>
        </section>

        <section className="mt-12 grid gap-4 border-t border-gray-100 pt-10 sm:grid-cols-3">
          {[
            {
              href: '/compare',
              title: 'Side-by-side comparisons',
              body: 'Move alternative-search traffic into direct competitor comparison pages.',
            },
            {
              href: '/roofing-proposal-template',
              title: 'Roofing proposal template',
              body: 'Show visitors what a polished roofing proposal should actually contain.',
            },
            {
              href: '/roofing-proposal-software',
              title: 'Roofing proposal software',
              body: 'Bring alternative buyers into the product page built around quoting speed and trust.',
            },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-2xl border border-gray-200 bg-white p-5 transition-all hover:border-blue-200 hover:shadow-md"
            >
              <p className="text-[16px] font-semibold text-gray-900">{item.title}</p>
              <p className="mt-2 text-[14px] leading-relaxed text-gray-600">{item.body}</p>
            </Link>
          ))}
        </section>
      </main>

      <footer className="border-t border-gray-100 bg-white py-10">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
            <div className="flex items-center gap-4">
              <SnapQuoteLogo size="xs" />
              <span className="text-[13px] text-gray-400">&copy; 2026 SnapQuote</span>
            </div>
            <nav aria-label="Footer" className="flex items-center gap-6">
              <Link href="/compare" className="text-[13px] text-gray-400 transition hover:text-gray-600">Compare</Link>
              <Link href="/alternatives" className="text-[13px] text-gray-400 transition hover:text-gray-600">Alternatives</Link>
              <Link href="/tools" className="text-[13px] text-gray-400 transition hover:text-gray-600">Tools</Link>
              <Link href="/roofing-proposal-template" className="text-[13px] text-gray-400 transition hover:text-gray-600">Proposal Template</Link>
              <Link href="/glossary" className="text-[13px] text-gray-400 transition hover:text-gray-600">Glossary</Link>
              <Link href="/blog" className="text-[13px] text-gray-400 transition hover:text-gray-600">Blog</Link>
              <Link href="/privacy" className="text-[13px] text-gray-400 transition hover:text-gray-600">Privacy</Link>
              <Link href="/terms" className="text-[13px] text-gray-400 transition hover:text-gray-600">Terms</Link>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}
