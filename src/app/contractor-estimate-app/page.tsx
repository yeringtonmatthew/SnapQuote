import Link from 'next/link';
import { Metadata } from 'next';
import { SnapQuoteLogo } from '@/components/SnapQuoteLogo';

export const metadata: Metadata = {
  title: 'Contractor Estimate App — AI-Powered Quotes for Every Trade | SnapQuote',
  description:
    'The best contractor estimate app for painters, plumbers, electricians, and general contractors. AI generates detailed quotes from job site photos in 60 seconds.',
  keywords: ['contractor estimate app', 'contractor quoting software', 'estimate app for contractors', 'quoting app for contractors'],
  openGraph: {
    title: 'Contractor Estimate App — AI-Powered Quotes for Every Trade',
    description: 'Painters, plumbers, electricians, GCs — one app handles quoting for every trade. 60-second AI-powered estimates.',
    url: 'https://snapquote.dev/contractor-estimate-app',
    type: 'website',
  },
};

const trades = [
  {
    name: 'Painters',
    description: 'Quote interior and exterior jobs with square footage, coats, prep work, trim, and ceiling line items auto-generated from photos.',
  },
  {
    name: 'Plumbers',
    description: 'From water heater replacements to bathroom rough-ins, SnapQuote breaks down fixtures, piping, labor, and permits into a clean estimate.',
  },
  {
    name: 'Electricians',
    description: 'Panel upgrades, rewiring, outlet additions — the AI identifies scope from photos and builds quotes with materials, labor, and code requirements.',
  },
  {
    name: 'General Contractors',
    description: 'Handling multi-trade projects? SnapQuote generates comprehensive estimates covering demo, framing, finishes, and subcontractor line items.',
  },
];

const features = [
  {
    title: 'One App for Every Job Type',
    description:
      'Most quoting tools are built for one trade. SnapQuote works for all of them. Whether you\'re quoting a kitchen remodel, a panel upgrade, a repipe, or an exterior paint job — the same app handles it. Take a photo, get a quote. The AI adapts to whatever trade the job requires.',
  },
  {
    title: 'Quote on Site, Close on Site',
    description:
      'The contractor who sends the estimate first usually wins the job. With SnapQuote\'s iOS app, you generate a professional proposal while you\'re still at the client\'s house. No going back to the office. No "I\'ll get you a quote by end of week." You hand them a number on the spot.',
  },
  {
    title: 'Professional Proposals That Win Trust',
    description:
      'Handwritten estimates and plain-text emails don\'t inspire confidence. SnapQuote generates clean, branded PDF proposals with itemized line items, your company logo, and terms. Your quote looks like it came from a company ten times your size — and that wins jobs.',
  },
  {
    title: 'Your Prices, Your Margins',
    description:
      'Set your own labor rates, markup percentages, and material costs. SnapQuote uses your pricing to generate every quote, so your margins are always protected. Adjust for premium clients, negotiate with builders, or run promotions — your pricing, your rules.',
  },
];

const featureGrid = [
  'AI photo analysis',
  'Trade-adaptive line items',
  'Custom labor rates',
  'Material cost tracking',
  'Professional PDF proposals',
  'Client portal',
  'E-signatures',
  'Good-better-best options',
  'Text & email delivery',
  'Company branding',
  'Quote tracking & analytics',
  'Unlimited quotes',
];

export default function ContractorEstimateApp() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'SnapQuote Contractor Estimate App',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'iOS, Web',
    description: 'AI-powered contractor estimate app that generates detailed quotes for every trade from job site photos in 60 seconds.',
    url: 'https://snapquote.dev/contractor-estimate-app',
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
              The Contractor Estimate App That Works as Fast as You Do
            </h1>
            <p className="mt-6 text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
              Painters, plumbers, electricians, general contractors — SnapQuote works for every trade. Snap a
              photo of the job, and AI builds a professional estimate in about 60 seconds. No manual data entry.
              No template fiddling. Just fast, accurate quotes from the field.
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

        {/* Trades Section */}
        <section className="bg-[#f2f2f7] py-16">
          <div className="mx-auto max-w-4xl px-6">
            <h2 className="text-3xl font-bold text-gray-900 text-center">One App. Every Trade.</h2>
            <div className="mt-10 grid sm:grid-cols-2 gap-6">
              {trades.map((trade) => (
                <div key={trade.name} className="rounded-2xl bg-white p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900">{trade.name}</h3>
                  <p className="mt-2 text-sm text-gray-600 leading-relaxed">{trade.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefit Sections */}
        <section className="mx-auto max-w-4xl px-6 py-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center">Why Contractors Switch to SnapQuote</h2>
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
            <h2 className="text-2xl font-bold text-gray-900 text-center">Everything You Need to Quote Any Job</h2>
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
              &ldquo;I do painting, drywall, and light remodeling. Used to take me 20 minutes per estimate, longer
              for bigger jobs. Now I take a couple photos, SnapQuote does the math, and the client has a
              professional proposal in their inbox before I leave the house. Game changer.&rdquo;
            </blockquote>
            <p className="mt-4 font-semibold text-gray-900">Dave L., General Contractor</p>
          </div>
        </section>

        {/* Pricing */}
        <section className="mx-auto max-w-4xl px-6 py-16 text-center">
          <h2 className="text-2xl font-bold text-gray-900">Simple Pricing. No Per-Trade Fees.</h2>
          <div className="mt-8 inline-block rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
            <p className="text-5xl font-bold text-gray-900">$79<span className="text-lg font-normal text-gray-500">/mo</span></p>
            <p className="mt-2 text-gray-500">14-day free trial. Cancel anytime.</p>
            <ul className="mt-6 space-y-2 text-left text-sm text-gray-600">
              <li>Unlimited AI-powered quotes</li>
              <li>Works for every trade</li>
              <li>Client portal with e-signatures</li>
              <li>iOS app for quoting in the field</li>
            </ul>
          </div>
        </section>

        {/* Final CTA */}
        <section className="bg-gray-900 py-16 text-center">
          <div className="mx-auto max-w-2xl px-6">
            <h2 className="text-3xl font-bold text-white">Send Your First Quote in 60 Seconds</h2>
            <p className="mt-4 text-gray-400">
              Try SnapQuote free for 14 days. No credit card. No setup. Just download the app, snap a photo,
              and send a professional estimate. Works for painters, plumbers, electricians, roofers, HVAC techs,
              and general contractors.
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
