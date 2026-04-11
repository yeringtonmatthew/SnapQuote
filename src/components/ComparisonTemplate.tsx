import Link from 'next/link';
import { SnapQuoteLogo } from '@/components/SnapQuoteLogo';

export interface ComparisonFeature {
  feature: string;
  snapquote: string;
  competitor: string;
}

export interface ComparisonSection {
  heading: string;
  body: string;
}

export interface ComparisonTemplateProps {
  competitorName: string;
  competitorSlug: string;
  headline: string;
  intro: string;
  features: ComparisonFeature[];
  whenSnapQuoteWins: ComparisonSection[];
  bottomLine: string;
  urlPath: string; // e.g. "/compare/snapquote-vs-servicetitan"
}

export function ComparisonTemplate({
  competitorName,
  headline,
  intro,
  features,
  whenSnapQuoteWins,
  bottomLine,
  urlPath,
}: ComparisonTemplateProps) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `SnapQuote vs ${competitorName} Comparison`,
    description: `Detailed comparison of SnapQuote and ${competitorName} for contractor quoting.`,
    url: `https://snapquote.dev${urlPath}`,
    mainEntity: {
      '@type': 'SoftwareApplication',
      name: 'SnapQuote',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'iOS, Web',
      offers: { '@type': 'Offer', price: '79', priceCurrency: 'USD' },
    },
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
        <Link
          href="/compare"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-gray-400 transition-colors hover:text-gray-600 mb-8"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          All comparisons
        </Link>

        {/* Header */}
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          {headline}
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-gray-600">
          {intro}
        </p>

        {/* Comparison Table */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900">Side-by-Side Comparison</h2>
          <div className="mt-8 overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/80">
                  <th className="px-6 py-4 font-semibold text-gray-500">Feature</th>
                  <th className="px-6 py-4 font-semibold text-blue-600">SnapQuote</th>
                  <th className="px-6 py-4 font-semibold text-gray-400">{competitorName}</th>
                </tr>
              </thead>
              <tbody>
                {features.map((row, i) => (
                  <tr key={row.feature} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                    <td className="px-6 py-4 font-medium text-gray-900">{row.feature}</td>
                    <td className="px-6 py-4 text-gray-700">{row.snapquote}</td>
                    <td className="px-6 py-4 text-gray-500">{row.competitor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* When SnapQuote Wins */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900">When SnapQuote Makes More Sense Than {competitorName}</h2>
          <div className="mt-8 space-y-12">
            {whenSnapQuoteWins.map((section) => (
              <div key={section.heading}>
                <h3 className="text-xl font-semibold text-gray-900">{section.heading}</h3>
                <p className="mt-3 text-gray-600 leading-relaxed">{section.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom Line */}
        <section className="mt-16 rounded-2xl bg-blue-50 border border-blue-100 p-8 sm:p-10">
          <h2 className="text-2xl font-bold text-gray-900">The Bottom Line</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">{bottomLine}</p>
        </section>

        {/* CTA */}
        <section className="mt-16 text-center">
          <h2 className="text-3xl font-bold text-gray-900">Ready to Quote Faster?</h2>
          <p className="mt-4 text-gray-600">
            Try SnapQuote free for 14 days. No credit card required. Send your first AI-powered quote in 60 seconds.
          </p>
          <Link
            href="/auth/signup"
            className="mt-8 inline-flex rounded-full bg-blue-600 px-8 py-3.5 text-[15px] font-semibold text-white shadow-lg shadow-blue-600/25 transition-all hover:brightness-110 active:scale-[0.97]"
          >
            Try SnapQuote Free for 14 Days
          </Link>
        </section>

        {/* Related comparisons */}
        <section className="mt-20 border-t border-gray-100 pt-12">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-400">Compare more tools</h3>
          <div className="mt-4 flex flex-wrap gap-2">
            {['jobber', 'roofr', 'sumoquote', 'servicetitan', 'jobnimbus', 'housecall-pro', 'buildertrend', 'acculynx', 'leap', 'markate', 'contractorforeman'].map((slug) => (
              <Link
                key={slug}
                href={`/compare/snapquote-vs-${slug}`}
                className="rounded-full border border-gray-200 px-4 py-2 text-[13px] text-gray-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
              >
                vs {slug.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')}
              </Link>
            ))}
          </div>
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
