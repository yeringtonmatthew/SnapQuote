import Link from 'next/link';
import { SnapQuoteLogo } from '@/components/SnapQuoteLogo';

export interface CalculatorPageShellProps {
  eyebrow: string;
  title: string;
  description: string;
  urlPath: string;
  jsonLd?: Record<string, unknown>;
  faqLd?: Record<string, unknown>;
  children: React.ReactNode;
  educational: React.ReactNode;
  ctaHeadline?: string;
  ctaBody?: string;
}

export function CalculatorPageShell({
  eyebrow,
  title,
  description,
  urlPath,
  jsonLd,
  faqLd,
  children,
  educational,
  ctaHeadline,
  ctaBody,
}: CalculatorPageShellProps) {
  const defaultJsonLd = jsonLd ?? {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: title,
    description,
    url: `https://snapquote.dev${urlPath}`,
    applicationCategory: 'UtilityApplication',
    operatingSystem: 'Any',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  };

  return (
    <div className="force-light min-h-dvh bg-white antialiased">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(defaultJsonLd) }} />
      {faqLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      )}

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

      <main className="mx-auto max-w-4xl px-6 py-16 sm:py-20">
        <Link
          href="/tools"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-gray-400 transition-colors hover:text-gray-600 mb-8"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          All tools
        </Link>

        <div className="inline-block rounded-full bg-blue-50 px-3 py-1 text-[12px] font-semibold uppercase tracking-wide text-blue-700">
          {eyebrow}
        </div>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">{title}</h1>
        <p className="mt-6 text-lg leading-relaxed text-gray-600">{description}</p>

        {children}

        <section className="mt-16 prose prose-gray max-w-none">{educational}</section>

        <section className="mt-16 rounded-2xl bg-blue-50 border border-blue-100 p-8 sm:p-10">
          <h2 className="text-2xl font-bold text-gray-900">
            {ctaHeadline ?? 'Skip the Calculator Entirely'}
          </h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            {ctaBody ??
              "This calculator is free and always will be. But if you want to save time on every roof you quote, SnapQuote's AI generates the entire scope-of-work and proposal from your photos in 60 seconds. No manual math, no templates."}
          </p>
          <Link
            href="/auth/signup"
            className="mt-6 inline-flex rounded-full bg-blue-600 px-6 py-3 text-[14px] font-semibold text-white shadow-sm transition hover:brightness-110 active:scale-[0.97]"
          >
            Try SnapQuote Free for 14 Days
          </Link>
        </section>

        <section className="mt-16 border-t border-gray-100 pt-10">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-400">More free tools</h3>
          <div className="mt-4 flex flex-wrap gap-2">
            {[
              { href: '/tools/roofing-square-calculator', label: 'Square Calculator' },
              { href: '/tools/roof-pitch-calculator', label: 'Pitch Calculator' },
              { href: '/tools/roof-replacement-cost-calculator', label: 'Replacement Cost' },
              { href: '/tools/roofing-cost-estimator', label: 'Cost Estimator' },
              { href: '/tools/shingle-calculator', label: 'Shingle Calculator' },
              { href: '/tools/roofing-materials-calculator', label: 'Materials Calculator' },
              { href: '/tools/roof-square-footage-calculator', label: 'Square Footage' },
              { href: '/tools/squares-to-bundles-calculator', label: 'Squares to Bundles' },
            ].map((t) => (
              <Link
                key={t.href}
                href={t.href}
                className="rounded-full border border-gray-200 px-4 py-2 text-[13px] text-gray-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
              >
                {t.label}
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
