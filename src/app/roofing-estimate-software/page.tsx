import Link from 'next/link';
import { Metadata } from 'next';
import { SnapQuoteLogo } from '@/components/SnapQuoteLogo';

export const metadata: Metadata = {
  title: 'Roofing Estimate Software — AI-Powered Quotes in 60 Seconds | SnapQuote',
  description:
    'The fastest roofing estimate software on the market. Snap a photo of the roof, get a detailed quote with shingles, tear-off, underlayment, and ridge caps in 60 seconds.',
  keywords: ['roofing estimate software', 'roofing quote app', 'roof estimate tool', 'roofing proposal software'],
  openGraph: {
    title: 'Roofing Estimate Software — AI-Powered Quotes in 60 Seconds',
    description: 'Stop spending 30 minutes per roofing estimate. SnapQuote uses AI to generate detailed roofing proposals from job site photos.',
    url: 'https://snapquote.dev/roofing-estimate-software',
    type: 'website',
  },
};

const features = [
  {
    title: 'Shingles, Tear-Off, Underlayment — All Auto-Detected',
    description:
      'Take a photo of the roof and SnapQuote\'s AI identifies the scope: architectural shingles, tear-off layers, synthetic underlayment, ice & water shield, drip edge, ridge caps, and starter strip. Every line item shows up on the quote automatically.',
  },
  {
    title: 'Material + Labor Pricing Built In',
    description:
      'SnapQuote comes loaded with current material pricing for roofing supplies. Set your labor rates once, and every quote automatically calculates total cost with your margins built in. No more guessing or looking up prices on your supplier\'s website.',
  },
  {
    title: 'Send Quotes From the Roof',
    description:
      'With SnapQuote\'s native iOS app, you can generate and send a professional roofing proposal while you\'re still standing in the homeowner\'s driveway. Close the deal before your competitor even gets a chance to bid.',
  },
  {
    title: 'Good-Better-Best Options',
    description:
      'Homeowners love choices. SnapQuote lets you present tiered options — 3-tab shingles, architectural, or premium — so the homeowner picks the package that fits their budget. Upselling happens naturally without any pressure.',
  },
];

const featureGrid = [
  'AI photo analysis',
  'Automatic line items',
  'Custom labor rates',
  'Material cost tracking',
  'Professional PDF proposals',
  'Client portal',
  'E-signatures',
  'Quote templates',
  'Instant delivery via text or email',
  'Tiered pricing options',
  'Company branding',
  'Quote tracking & analytics',
];

export default function RoofingEstimateSoftware() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'SnapQuote Roofing Estimate Software',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'iOS, Web',
    description: 'AI-powered roofing estimate software that generates detailed quotes from job site photos in 60 seconds.',
    url: 'https://snapquote.dev/roofing-estimate-software',
    offers: { '@type': 'Offer', price: '79', priceCurrency: 'USD', billingPeriod: 'P1M', description: '14-day free trial' },
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

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[600px] w-[900px] rounded-full bg-gradient-to-b from-blue-100/50 via-blue-50/25 to-transparent blur-[100px]" />
          </div>
          <div className="relative mx-auto max-w-4xl px-6 py-20 sm:py-28 text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
              The Fastest Roofing Estimate Software on the Market
            </h1>
            <p className="mt-6 text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
              Stop spending 30 minutes building roofing proposals from scratch. Snap a photo of the roof,
              and SnapQuote&apos;s AI generates a detailed estimate — shingles, tear-off, underlayment, ridge
              caps, and labor — in about 60 seconds.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/auth/signup"
                className="rounded-full bg-blue-600 px-8 py-3.5 text-[15px] font-semibold text-white shadow-sm transition-all hover:bg-blue-700 active:scale-[0.97]"
              >
                Start 14-Day Free Trial
              </Link>
              <span className="text-sm text-gray-500">$79/mo after trial. No credit card required.</span>
            </div>
          </div>
        </section>

        {/* Benefit Sections */}
        <section className="mx-auto max-w-4xl px-6 py-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center">Built for Roofers, by People Who Get Roofing</h2>
          <div className="mt-12 space-y-16">
            {features.map((f) => (
              <div key={f.title}>
                <h3 className="text-xl font-semibold text-gray-900">{f.title}</h3>
                <p className="mt-3 text-gray-600 leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Feature Grid */}
        <section className="bg-[#f2f2f7] py-16">
          <div className="mx-auto max-w-4xl px-6">
            <h2 className="text-2xl font-bold text-gray-900 text-center">Everything You Need to Quote Roofing Jobs Fast</h2>
            <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 gap-4">
              {featureGrid.map((item) => (
                <div key={item} className="rounded-2xl bg-white px-5 py-4 text-sm font-medium text-gray-700 shadow-sm">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonial */}
        <section className="mx-auto max-w-4xl px-6 py-16">
          <div className="rounded-2xl bg-gray-50 p-8 sm:p-10">
            <blockquote className="text-lg text-gray-700 leading-relaxed">
              &ldquo;I used to spend 20-30 minutes per roofing estimate, typing in every line item by hand. With
              SnapQuote, I take a photo and the whole quote is done in a minute. I&apos;m closing more jobs because
              I&apos;m the first one to get the homeowner a number.&rdquo;
            </blockquote>
            <p className="mt-4 font-semibold text-gray-900">Mike R., Roofing Contractor</p>
          </div>
        </section>

        {/* Pricing */}
        <section className="mx-auto max-w-4xl px-6 py-16 text-center">
          <h2 className="text-2xl font-bold text-gray-900">Simple Pricing for Roofers</h2>
          <div className="mt-8 inline-block rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
            <p className="text-5xl font-bold text-gray-900">$79<span className="text-lg font-normal text-gray-500">/mo</span></p>
            <p className="mt-2 text-gray-500">14-day free trial. Cancel anytime.</p>
            <ul className="mt-6 space-y-2 text-left text-sm text-gray-600">
              <li>Unlimited AI-powered quotes</li>
              <li>Professional PDF proposals</li>
              <li>Client portal with e-signatures</li>
              <li>iOS app for quoting in the field</li>
            </ul>
          </div>
        </section>

        {/* Final CTA */}
        <section className="bg-gray-900 py-16 text-center">
          <div className="mx-auto max-w-2xl px-6">
            <h2 className="text-3xl font-bold text-white">Start Closing Roofing Jobs Faster</h2>
            <p className="mt-4 text-gray-400">
              The contractor who quotes first wins the job. Try SnapQuote free for 14 days and see how fast
              roofing estimates can be.
            </p>
            <Link
              href="/auth/signup"
              className="mt-8 inline-flex rounded-full bg-blue-600 px-8 py-3.5 text-[15px] font-semibold text-white shadow-sm transition-all hover:bg-blue-700 active:scale-[0.97]"
            >
              Start 14-Day Free Trial
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
