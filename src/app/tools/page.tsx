import Link from 'next/link';
import { Metadata } from 'next';
import { SnapQuoteLogo } from '@/components/SnapQuoteLogo';

export const metadata: Metadata = {
  title: 'Free Roofing Tools & Calculators — SnapQuote',
  description:
    'Free online calculators and tools for roofers and homeowners — roofing square, pitch, cost, material, bundle, and square footage calculators. Built by a working roofer.',
  keywords: ['free roofing calculators', 'roofing tools', 'roofing square calculator', 'roof pitch calculator', 'roofing cost calculator'],
  openGraph: {
    title: 'Free Roofing Tools & Calculators — SnapQuote',
    description: 'Free calculators and tools built for working roofers and homeowners.',
    url: 'https://snapquote.dev/tools',
    type: 'website',
  },
  alternates: { canonical: 'https://snapquote.dev/tools' },
};

const tools = [
  {
    slug: 'roofing-square-calculator',
    name: 'Roofing Square Calculator',
    description: 'Convert square footage to roofing squares, account for pitch, and estimate shingle bundles.',
    tag: 'Most popular',
  },
  {
    slug: 'roof-pitch-calculator',
    name: 'Roof Pitch Calculator',
    description: 'Convert rise/run to degrees, percentage, and the surface-area multiplier for any roof.',
  },
  {
    slug: 'roof-replacement-cost-calculator',
    name: 'Roof Replacement Cost Calculator',
    description: 'Estimate the cost of a new roof by size, pitch, material, and tear-off scope.',
    tag: 'Homeowners',
  },
  {
    slug: 'roofing-cost-estimator',
    name: 'Roofing Cost Estimator',
    description: 'Per-square and total cost estimates by material type and overhead markup.',
  },
  {
    slug: 'shingle-calculator',
    name: 'Shingle Calculator',
    description: 'Calculate exactly how many bundles of shingles you need for any roof.',
  },
  {
    slug: 'roofing-materials-calculator',
    name: 'Roofing Materials Calculator',
    description: 'Complete materials list — shingles, underlayment, nails, drip edge, and more.',
  },
  {
    slug: 'squares-to-bundles-calculator',
    name: 'Squares to Bundles Calculator',
    description: 'Quick conversion tool to turn roofing squares into shingle bundles.',
  },
  {
    slug: 'roof-square-footage-calculator',
    name: 'Roof Square Footage Calculator',
    description: 'Convert home footprint and pitch to actual roof surface area in square feet.',
  },
];

export default function ToolsPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'SnapQuote Free Roofing Tools',
    description: 'Free calculators and tools built for working roofers and homeowners.',
    url: 'https://snapquote.dev/tools',
    hasPart: tools.map((t) => ({
      '@type': 'WebApplication',
      name: t.name,
      url: `https://snapquote.dev/tools/${t.slug}`,
    })),
  };

  return (
    <div className="force-light min-h-dvh bg-white antialiased">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

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

      <main className="mx-auto max-w-5xl px-6 py-16 sm:py-24">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">Free Roofing Tools</h1>
        <p className="mt-6 text-lg leading-relaxed text-gray-600 max-w-2xl">
          Free calculators built for working roofers and homeowners. No signup required. No email capture.
          Everything just works.
        </p>

        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          {tools.map((tool) => (
            <Link
              key={tool.slug}
              href={`/tools/${tool.slug}`}
              className="group rounded-2xl border border-gray-200 bg-white p-6 transition-all hover:border-blue-200 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-xl font-bold text-gray-900">{tool.name}</h2>
                {tool.tag && (
                  <span className="flex-shrink-0 rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700">
                    {tool.tag}
                  </span>
                )}
              </div>
              <p className="mt-2 text-[14px] text-gray-600 leading-relaxed">{tool.description}</p>
              <div className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-blue-600 transition group-hover:gap-2.5">
                Open calculator
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </div>
            </Link>
          ))}
        </div>

        <section className="mt-20 rounded-2xl bg-blue-50 border border-blue-100 p-8 sm:p-10">
          <h2 className="text-2xl font-bold text-gray-900">Stop Calculating. Start Quoting.</h2>
          <p className="mt-4 text-gray-600 leading-relaxed max-w-2xl">
            These free calculators are great when you need to do the math. But on every real job, calculators
            are just the first step — you still have to build the proposal, format the quote, collect the
            signature, and chase the deposit. SnapQuote does all of that automatically from your roof photos.
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
