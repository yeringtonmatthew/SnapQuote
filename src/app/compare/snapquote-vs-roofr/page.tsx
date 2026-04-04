import Link from 'next/link';
import { Metadata } from 'next';
import { SnapQuoteLogo } from '@/components/SnapQuoteLogo';

export const metadata: Metadata = {
  title: 'SnapQuote vs Roofr — Best Roofr Alternative for Contractors',
  description:
    'Compare SnapQuote and Roofr side-by-side. SnapQuote works for ALL trades at $79/mo. Roofr is roofing-only at $89-249/mo. See why contractors are switching.',
  keywords: ['Roofr alternative', 'SnapQuote vs Roofr', 'roofing estimate software', 'contractor quoting app'],
  openGraph: {
    title: 'SnapQuote vs Roofr — Best Roofr Alternative',
    description: 'AI quotes for every trade at $79/mo vs roofing-only at $89-249/mo. See how SnapQuote compares to Roofr.',
    url: 'https://snapquote.dev/compare/snapquote-vs-roofr',
    type: 'website',
  },
};

const features = [
  { feature: 'Pricing', snapquote: '$79/mo', competitor: '$89-249/mo' },
  { feature: 'Free Trial', snapquote: '14 days', competitor: 'Limited free tier' },
  { feature: 'Trade Support', snapquote: 'All trades — roofing, HVAC, plumbing, electrical, painting, GC', competitor: 'Roofing only' },
  { feature: 'Quote Generation', snapquote: 'AI-powered from photos', competitor: 'Measurement-based proposals' },
  { feature: 'Time to Quote', snapquote: '60 seconds', competitor: '5-15 minutes' },
  { feature: 'Roof Measurements', snapquote: 'AI-detected from photos', competitor: 'Satellite/aerial imagery' },
  { feature: 'Mobile App', snapquote: 'Native iOS app', competitor: 'Web-based' },
  { feature: 'CRM Features', snapquote: 'Focused on quoting', competitor: 'Includes CRM, pipeline tools' },
  { feature: 'Instant Quotes', snapquote: 'Yes — from job site photos', competitor: 'No — requires measurement order' },
  { feature: 'Material Detection', snapquote: 'AI identifies materials automatically', competitor: 'Manual selection' },
];

export default function SnapQuoteVsRoofr() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'SnapQuote vs Roofr Comparison',
    description: 'Detailed comparison of SnapQuote and Roofr contractor quoting tools.',
    url: 'https://snapquote.dev/compare/snapquote-vs-roofr',
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
        {/* Header */}
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          SnapQuote vs Roofr
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-gray-600">
          Roofr built a great measurement and proposal tool for roofers. But if you do anything besides roofing — or
          you just want faster quotes — SnapQuote is the better choice. It costs less, works for every trade, and
          uses AI to generate quotes from job site photos in about 60 seconds. No satellite imagery wait times.
          No measurement orders. Just fast, accurate quotes.
        </p>

        {/* Comparison Table */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900">Side-by-Side Comparison</h2>
          <div className="mt-8 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/80">
                  <th className="px-6 py-4 font-semibold text-gray-500">Feature</th>
                  <th className="px-6 py-4 font-semibold text-blue-600">SnapQuote</th>
                  <th className="px-6 py-4 font-semibold text-gray-400">Roofr</th>
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

        {/* Key Differences */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900">Why Contractors Choose SnapQuote Over Roofr</h2>

          <div className="mt-8 space-y-12">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Every Trade, Not Just Roofing</h3>
              <p className="mt-3 text-gray-600 leading-relaxed">
                Roofr is built exclusively for roofers. If you also do siding, gutters, or any other work — or
                if you&apos;re an HVAC tech, plumber, electrician, or general contractor — Roofr can&apos;t help you.
                SnapQuote works for every trade. One subscription covers roofing jobs, HVAC installs, bathroom
                remodels, electrical panels, and everything in between. Stop paying for multiple tools when one
                handles it all.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900">$79/mo vs $89-249/mo</h3>
              <p className="mt-3 text-gray-600 leading-relaxed">
                Roofr&apos;s plans range from $89 to $249 per month, and their higher tiers are where the real
                features live. SnapQuote is $79/mo for everything — AI-powered quoting, client portal, professional
                proposals, and unlimited quotes. No tiered pricing games. No upsells to get the features you
                actually need. You get the full tool from day one.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900">60-Second Quotes from Photos</h3>
              <p className="mt-3 text-gray-600 leading-relaxed">
                With Roofr, you order a measurement report, wait for it to come back, then build a proposal from
                those measurements. That process takes time. With SnapQuote, you take a photo of the job site
                from your phone, and AI generates a detailed quote with materials, labor, and pricing in about
                60 seconds. You can send the quote to the homeowner before you leave the driveway.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900">Built for Speed, Not Complexity</h3>
              <p className="mt-3 text-gray-600 leading-relaxed">
                Roofr bundles CRM features, pipeline management, and other tools alongside quoting. If you
                need all that, great. But if you already have a CRM — or you just want to send quotes fast —
                you&apos;re paying for features you don&apos;t use. SnapQuote is laser-focused on one thing: getting
                professional quotes into your clients&apos; hands as fast as possible.
              </p>
            </div>
          </div>
        </section>

        {/* Bottom Line */}
        <section className="mt-16 rounded-2xl bg-gray-50 p-8 sm:p-10">
          <h2 className="text-2xl font-bold text-gray-900">The Bottom Line</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Roofr is a solid tool if you exclusively do roofing and want satellite measurements bundled with
            proposals. But if you want faster quotes, lower costs, and support for every trade — SnapQuote is
            the clear winner. At $79/mo vs Roofr&apos;s $89-249/mo, you save money while getting AI-powered quotes
            that take seconds instead of minutes. Try it free for 14 days and see the difference.
          </p>
        </section>

        {/* CTA */}
        <section className="mt-16 text-center">
          <h2 className="text-3xl font-bold text-gray-900">Ready to Quote Faster?</h2>
          <p className="mt-4 text-gray-600">
            Try SnapQuote free for 14 days. No credit card required. Works for every trade, not just roofing.
          </p>
          <Link
            href="/auth/signup"
            className="mt-8 inline-flex rounded-full bg-blue-600 px-8 py-3.5 text-[15px] font-semibold text-white shadow-sm transition-all hover:bg-blue-700 active:scale-[0.97]"
          >
            Try SnapQuote Free for 14 Days
          </Link>
        </section>
      </main>
    </div>
  );
}
