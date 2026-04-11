import Link from 'next/link';
import { Metadata } from 'next';
import { SnapQuoteLogo } from '@/components/SnapQuoteLogo';

export const metadata: Metadata = {
  title: 'Compare SnapQuote vs Roofing & Contractor Software — Side-by-Side',
  description:
    'Side-by-side comparisons of SnapQuote vs Jobber, Roofr, SumoQuote, ServiceTitan, JobNimbus, AccuLynx, Leap, and more. See which roofing software is right for you.',
  keywords: ['roofing software comparison', 'SnapQuote comparison', 'best roofing software', 'contractor software comparison'],
  openGraph: {
    title: 'Compare Roofing Software — SnapQuote vs The Competition',
    description: 'Side-by-side comparisons of SnapQuote against every major roofing and contractor tool.',
    url: 'https://snapquote.dev/compare',
    type: 'website',
  },
  alternates: { canonical: 'https://snapquote.dev/compare' },
};

const comparisons = [
  {
    slug: 'snapquote-vs-jobber',
    name: 'Jobber',
    tagline: 'Full field service CRM',
    bestFor: 'General home services',
    pricing: '$39-249/mo',
    tier: 'mid-market',
  },
  {
    slug: 'snapquote-vs-roofr',
    name: 'Roofr',
    tagline: 'Roofing-specific CRM',
    bestFor: 'Roofers wanting a full CRM',
    pricing: '$99-399/mo',
    tier: 'roofing',
  },
  {
    slug: 'snapquote-vs-sumoquote',
    name: 'SumoQuote',
    tagline: 'Proposal templates',
    bestFor: 'Manual proposal building',
    pricing: 'Acquired by JobNimbus',
    tier: 'proposals',
  },
  {
    slug: 'snapquote-vs-servicetitan',
    name: 'ServiceTitan',
    tagline: 'Enterprise field service',
    bestFor: 'Large multi-truck operations',
    pricing: '$300+/mo per user',
    tier: 'enterprise',
  },
  {
    slug: 'snapquote-vs-jobnimbus',
    name: 'JobNimbus',
    tagline: 'Roofing CRM + workflows',
    bestFor: 'Growing roofing teams',
    pricing: '$25-75/mo/user',
    tier: 'roofing',
  },
  {
    slug: 'snapquote-vs-housecall-pro',
    name: 'Housecall Pro',
    tagline: 'Home service all-in-one',
    bestFor: 'HVAC, plumbing, electrical',
    pricing: '$49-279/mo',
    tier: 'mid-market',
  },
  {
    slug: 'snapquote-vs-buildertrend',
    name: 'Buildertrend',
    tagline: 'Construction PM suite',
    bestFor: 'Custom builders and GCs',
    pricing: '$399-899/mo',
    tier: 'enterprise',
  },
  {
    slug: 'snapquote-vs-contractorforeman',
    name: 'Contractor Foreman',
    tagline: 'Construction ops toolkit',
    bestFor: 'GCs wanting a Swiss Army knife',
    pricing: '$49-249/mo',
    tier: 'mid-market',
  },
  {
    slug: 'snapquote-vs-acculynx',
    name: 'AccuLynx',
    tagline: 'Large roofing operations CRM',
    bestFor: 'Mid-to-large roofing companies',
    pricing: '$125-250+/mo',
    tier: 'roofing',
  },
  {
    slug: 'snapquote-vs-leap',
    name: 'Leap',
    tagline: 'Roofing sales platform',
    bestFor: 'In-home sales operations',
    pricing: '$150+/mo per user',
    tier: 'roofing',
  },
  {
    slug: 'snapquote-vs-markate',
    name: 'Markate',
    tagline: 'All-in-one service suite',
    bestFor: 'Generalist service trades',
    pricing: '$39-129/mo',
    tier: 'mid-market',
  },
];

export default function ComparePage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Roofing Software Comparisons',
    description: 'Side-by-side comparisons of SnapQuote against every major roofing and contractor tool.',
    url: 'https://snapquote.dev/compare',
    hasPart: comparisons.map((c) => ({
      '@type': 'WebPage',
      name: `SnapQuote vs ${c.name}`,
      url: `https://snapquote.dev/compare/${c.slug}`,
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

      <main className="mx-auto max-w-6xl px-6 py-16 sm:py-24">
        <div className="max-w-3xl">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Compare SnapQuote vs Everyone Else
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-gray-600">
            Honest side-by-side comparisons against every major roofing and contractor tool. We&apos;ll tell you when
            SnapQuote is the right fit — and when it isn&apos;t. Most roofers don&apos;t need a full CRM. They need
            faster, better-looking quotes. That&apos;s what SnapQuote does.
          </p>
        </div>

        <section className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900">All Comparisons</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {comparisons.map((c) => (
              <Link
                key={c.slug}
                href={`/compare/${c.slug}`}
                className="group rounded-2xl border border-gray-200 bg-white p-6 transition-all hover:border-blue-200 hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-[13px] font-semibold uppercase tracking-wide text-blue-600">
                      SnapQuote vs
                    </div>
                    <div className="mt-1 text-xl font-bold text-gray-900">{c.name}</div>
                  </div>
                  <div className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-medium uppercase text-gray-500">
                    {c.tier}
                  </div>
                </div>
                <p className="mt-3 text-[14px] text-gray-600">{c.tagline}</p>
                <dl className="mt-4 space-y-1 text-[13px]">
                  <div className="flex justify-between">
                    <dt className="text-gray-400">Best for</dt>
                    <dd className="text-gray-700 text-right">{c.bestFor}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-400">Pricing</dt>
                    <dd className="text-gray-700 text-right">{c.pricing}</dd>
                  </div>
                </dl>
                <div className="mt-5 inline-flex items-center gap-1.5 text-[13px] font-medium text-blue-600 transition group-hover:gap-2.5">
                  See comparison
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-20 rounded-2xl bg-blue-50 border border-blue-100 p-8 sm:p-10">
          <h2 className="text-2xl font-bold text-gray-900">Not Sure Which to Pick?</h2>
          <p className="mt-4 text-gray-600 leading-relaxed max-w-2xl">
            Here&apos;s the simple test: if your biggest pain is <strong>quoting speed</strong> — you&apos;re losing
            jobs because your proposals take too long, or look less professional than the other guy&apos;s — start
            with SnapQuote. It&apos;s $79/mo flat, you can try it free for 14 days, and you&apos;ll be sending AI
            photo-to-proposal quotes in about 5 minutes. If you need a full operations platform with scheduling,
            dispatching, team workflows, and production tracking, look at one of the CRM options above.
          </p>
          <Link
            href="/auth/signup"
            className="mt-6 inline-flex rounded-full bg-blue-600 px-6 py-3 text-[14px] font-semibold text-white shadow-sm transition hover:brightness-110 active:scale-[0.97]"
          >
            Try SnapQuote Free for 14 Days
          </Link>
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
