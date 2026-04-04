import Link from 'next/link';
import { Metadata } from 'next';
import { SnapQuoteLogo } from '@/components/SnapQuoteLogo';

export const metadata: Metadata = {
  title: 'HVAC Quoting App — AI-Powered Estimates in 60 Seconds | SnapQuote',
  description:
    'The fastest HVAC quoting app for technicians and contractors. Snap a photo of the unit, get a detailed estimate for installs, repairs, and ductwork in 60 seconds.',
  keywords: ['HVAC quoting app', 'HVAC estimate software', 'HVAC proposal tool', 'HVAC contractor software'],
  openGraph: {
    title: 'HVAC Quoting App — AI-Powered Estimates in 60 Seconds',
    description: 'Stop hand-writing HVAC estimates. SnapQuote uses AI to generate detailed proposals for installs, repairs, and ductwork.',
    url: 'https://snapquote.dev/hvac-quoting-app',
    type: 'website',
  },
};

const features = [
  {
    title: 'Installs, Repairs, and Ductwork — All Covered',
    description:
      'Whether you\'re quoting a full system replacement, a condenser swap, ductwork modification, or a simple repair, SnapQuote handles it. Take a photo of the existing unit or the job area, and AI generates line items for equipment, materials, refrigerant, and labor.',
  },
  {
    title: 'Tonnage and Equipment Specs in the Quote',
    description:
      'SnapQuote understands HVAC work. Your quotes include the details homeowners and property managers expect: unit tonnage, SEER ratings, equipment brands, ductwork linear footage, and labor hours. No more scribbling specs on the back of a business card.',
  },
  {
    title: 'Quote From the Mechanical Room',
    description:
      'With SnapQuote\'s native iOS app, you generate the estimate while you\'re still on site. Standing in front of a 15-year-old furnace? Snap a photo, review the AI-generated quote, and text it to the homeowner before you walk back to your van. First quote in wins the job.',
  },
  {
    title: 'Tiered Options for Every Budget',
    description:
      'HVAC jobs are big-ticket items. Homeowners want options. SnapQuote makes it easy to present good-better-best packages — standard efficiency, high efficiency, or premium — so customers pick what fits their budget without you building three separate quotes.',
  },
];

const featureGrid = [
  'AI photo analysis',
  'HVAC-specific line items',
  'Equipment & tonnage specs',
  'Custom labor rates',
  'Material cost tracking',
  'Professional PDF proposals',
  'Client portal',
  'E-signatures',
  'Text & email delivery',
  'Good-better-best options',
  'Company branding',
  'Quote tracking',
];

export default function HvacQuotingApp() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'SnapQuote HVAC Quoting App',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'iOS, Web',
    description: 'AI-powered HVAC quoting app that generates detailed estimates from job site photos in 60 seconds.',
    url: 'https://snapquote.dev/hvac-quoting-app',
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
              The HVAC Quoting App That Keeps Up With You
            </h1>
            <p className="mt-6 text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
              You run 4-5 service calls a day. You don&apos;t have time to sit in the van typing up estimates.
              SnapQuote lets you snap a photo of the unit, and AI builds a detailed HVAC quote — tonnage,
              equipment, ductwork, labor — in about 60 seconds.
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
          <h2 className="text-3xl font-bold text-gray-900 text-center">Built for HVAC Techs Who Work Fast</h2>
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
            <h2 className="text-2xl font-bold text-gray-900 text-center">Everything You Need to Quote HVAC Jobs</h2>
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
              &ldquo;Between installs and service calls, I barely had time to quote new work. Now I snap a photo of
              the unit, SnapQuote builds the estimate, and I text it to the customer before I leave. My close rate
              went up because I&apos;m always the first bid they get.&rdquo;
            </blockquote>
            <p className="mt-4 font-semibold text-gray-900">Carlos M., HVAC Contractor</p>
          </div>
        </section>

        {/* Pricing */}
        <section className="mx-auto max-w-4xl px-6 py-16 text-center">
          <h2 className="text-2xl font-bold text-gray-900">Simple Pricing for HVAC Pros</h2>
          <div className="mt-8 inline-block rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
            <p className="text-5xl font-bold text-gray-900">$79<span className="text-lg font-normal text-gray-500">/mo</span></p>
            <p className="mt-2 text-gray-500">14-day free trial. Cancel anytime.</p>
            <ul className="mt-6 space-y-2 text-left text-sm text-gray-600">
              <li>Unlimited AI-powered quotes</li>
              <li>HVAC-specific line items and specs</li>
              <li>Client portal with e-signatures</li>
              <li>iOS app for quoting on site</li>
            </ul>
          </div>
        </section>

        {/* Final CTA */}
        <section className="bg-gray-900 py-16 text-center">
          <div className="mx-auto max-w-2xl px-6">
            <h2 className="text-3xl font-bold text-white">Start Quoting HVAC Jobs in 60 Seconds</h2>
            <p className="mt-4 text-gray-400">
              The fastest HVAC quoting app on the market. Try SnapQuote free for 14 days and close more jobs
              by being the first contractor to send a professional estimate.
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
