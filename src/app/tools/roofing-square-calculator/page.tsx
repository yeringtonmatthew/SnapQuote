import { Metadata } from 'next';
import Link from 'next/link';
import { SnapQuoteLogo } from '@/components/SnapQuoteLogo';
import { RoofingSquareCalculator } from './RoofingSquareCalculator';

export const metadata: Metadata = {
  title: 'Roofing Square Calculator — Free Roof Measurement Tool | SnapQuote',
  description:
    'Free roofing square calculator. Convert square feet to roofing squares instantly, account for pitch, and estimate bundles of shingles. Built by SnapQuote for roofers.',
  keywords: [
    'roofing square calculator',
    'roof square calculator',
    'how many squares in a roof',
    'square feet to roofing squares',
    'roofing bundles calculator',
    'shingles calculator',
    'roofing material calculator',
  ],
  openGraph: {
    title: 'Free Roofing Square Calculator — SnapQuote',
    description: 'Instantly convert square feet to roofing squares, account for pitch, and estimate shingle bundles.',
    url: 'https://snapquote.dev/tools/roofing-square-calculator',
    type: 'website',
  },
  alternates: { canonical: 'https://snapquote.dev/tools/roofing-square-calculator' },
};

export default function Page() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Roofing Square Calculator',
    description:
      'Free online tool to convert square footage to roofing squares, account for pitch, and estimate shingle bundles.',
    url: 'https://snapquote.dev/tools/roofing-square-calculator',
    applicationCategory: 'UtilityApplication',
    operatingSystem: 'Any',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  };

  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'How many square feet is a roofing square?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'One roofing square equals 100 square feet of roof surface. A 2,000 square foot roof is 20 squares.',
        },
      },
      {
        '@type': 'Question',
        name: 'How do I account for roof pitch in square footage?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Multiply the footprint square footage by the pitch multiplier. For a 6/12 pitch, the multiplier is about 1.118. For 12/12, it is about 1.414.',
        },
      },
      {
        '@type': 'Question',
        name: 'How many bundles of shingles are in a square?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Standard 3-tab shingles come 3 bundles per square. Architectural shingles are typically 3 to 4 bundles per square depending on the brand.',
        },
      },
    ],
  };

  return (
    <div className="force-light min-h-dvh bg-white antialiased">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />

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

        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          Roofing Square Calculator
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-gray-600">
          Free online roofing square calculator. Convert roof footprint to actual surface area, factor in pitch,
          and get an instant shingle bundle count. Built for roofers by a working roofer.
        </p>

        <RoofingSquareCalculator />

        {/* Educational content — what Google wants to see on a ranking page */}
        <section className="mt-16 prose prose-gray max-w-none">
          <h2 className="text-2xl font-bold text-gray-900 !mb-4">What Is a Roofing Square?</h2>
          <p className="text-gray-600 leading-relaxed">
            A roofing square is a standard unit of measurement in the roofing industry. One roofing square equals
            100 square feet of roof surface area. Roofers use squares instead of square feet because it simplifies
            material ordering — shingles, underlayment, and most other roofing products are priced and packaged
            per square.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 !mt-10 !mb-4">How to Calculate Roofing Squares</h2>
          <p className="text-gray-600 leading-relaxed">
            The basic formula is simple: measure the total square footage of the roof surface, then divide by 100.
            A 2,400 square foot roof is 24 squares. But the catch is that the footprint of the house is not the
            same as the actual roof surface area — the pitch adds surface.
          </p>
          <ol className="text-gray-600 leading-relaxed space-y-2">
            <li>
              <strong>1. Measure the footprint.</strong> Measure the length and width of the house (or each section if it&apos;s a complex roof), and multiply to get square footage.
            </li>
            <li>
              <strong>2. Multiply by the pitch factor.</strong> A flat roof has a factor of 1.0. A steep 12/12 pitch has a factor of about 1.414. This converts the footprint to the actual surface area.
            </li>
            <li>
              <strong>3. Divide by 100 to get squares.</strong> That&apos;s how many squares of shingles you&apos;ll need to cover the roof.
            </li>
            <li>
              <strong>4. Add waste.</strong> Most roofers add 10-15% for waste, cuts, and ridge/hip coverage.
            </li>
          </ol>

          <h2 className="text-2xl font-bold text-gray-900 !mt-10 !mb-4">Roof Pitch Multipliers</h2>
          <p className="text-gray-600 leading-relaxed">
            Pitch is the ratio of vertical rise to horizontal run, expressed as rise/run (like 6/12 — a roof that
            rises 6 inches for every 12 inches of horizontal distance). The steeper the pitch, the more actual
            surface area the roof has beyond the footprint.
          </p>
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white !my-6">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/80">
                  <th className="px-6 py-3 font-semibold text-gray-500">Pitch</th>
                  <th className="px-6 py-3 font-semibold text-gray-500">Multiplier</th>
                  <th className="px-6 py-3 font-semibold text-gray-500">Description</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Flat', '1.000', 'No pitch'],
                  ['2/12', '1.014', 'Low slope'],
                  ['4/12', '1.054', 'Common residential'],
                  ['6/12', '1.118', 'Standard residential'],
                  ['8/12', '1.202', 'Steep residential'],
                  ['10/12', '1.302', 'Very steep'],
                  ['12/12', '1.414', '45-degree (premium)'],
                ].map((row, i) => (
                  <tr key={row[0]} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                    <td className="px-6 py-3 font-medium text-gray-900">{row[0]}</td>
                    <td className="px-6 py-3 tabular-nums text-gray-700">{row[1]}</td>
                    <td className="px-6 py-3 text-gray-500">{row[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 !mt-10 !mb-4">How Many Bundles of Shingles in a Square?</h2>
          <p className="text-gray-600 leading-relaxed">
            Most asphalt shingles are packaged so that three bundles cover one square. That&apos;s the standard for
            3-tab shingles. Architectural and premium shingles are often packaged at 3 or 4 bundles per square,
            depending on the weight and manufacturer. Always check the wrapper — the coverage per bundle is
            printed on the label.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 !mt-10 !mb-4">Waste Factor</h2>
          <p className="text-gray-600 leading-relaxed">
            Always order more than you measure. A simple gable roof with few cuts typically adds 10% waste. A
            complex roof with dormers, valleys, and hips can need 15-20%. Running short on shingles in the middle
            of a job is a mess — better to return a bundle than chase a missing one mid-install.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 !mt-10 !mb-4">FAQ</h2>
          <div className="space-y-6 !mt-6">
            <div>
              <h3 className="font-semibold text-gray-900">How many square feet is a roofing square?</h3>
              <p className="text-gray-600 leading-relaxed !mt-2">
                One roofing square equals 100 square feet of roof surface. A 2,000 square foot roof is 20 squares.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">How do I account for roof pitch in square footage?</h3>
              <p className="text-gray-600 leading-relaxed !mt-2">
                Multiply the footprint square footage by the pitch multiplier. For a 6/12 pitch, the multiplier is
                about 1.118. For 12/12, it is about 1.414.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">How many bundles of shingles are in a square?</h3>
              <p className="text-gray-600 leading-relaxed !mt-2">
                Standard 3-tab shingles come 3 bundles per square. Architectural shingles are typically 3 to 4
                bundles per square depending on the brand.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mt-16 rounded-2xl bg-blue-50 border border-blue-100 p-8 sm:p-10">
          <h2 className="text-2xl font-bold text-gray-900">Skip the Calculator Entirely</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            This calculator is free and always will be. But if you want to actually save time on every roof you
            quote, SnapQuote&apos;s AI does this automatically — you snap a few photos, and it generates the
            entire scope-of-work with quantities, pricing, and a professional proposal ready to send. Sixty
            seconds from walk to signed quote.
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
