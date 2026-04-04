import Link from 'next/link';
import { Metadata } from 'next';
import { SnapQuoteLogo } from '@/components/SnapQuoteLogo';

export const metadata: Metadata = {
  title: 'SnapQuote vs SumoQuote — Best SumoQuote Alternative for Contractors',
  description:
    'Compare SnapQuote and SumoQuote side-by-side. SnapQuote uses AI to generate quotes from photos in 60 seconds. See why contractors are switching from SumoQuote.',
  keywords: ['SumoQuote alternative', 'SnapQuote vs SumoQuote', 'contractor quoting software', 'AI quoting tool'],
  openGraph: {
    title: 'SnapQuote vs SumoQuote — Best SumoQuote Alternative',
    description: 'AI-powered quotes in 60 seconds vs manual template building. See how SnapQuote compares to SumoQuote.',
    url: 'https://snapquote.dev/compare/snapquote-vs-sumoquote',
    type: 'website',
  },
};

const features = [
  { feature: 'Quote Generation', snapquote: 'AI-powered from photos', competitor: 'Manual template building' },
  { feature: 'Time to Quote', snapquote: '60 seconds', competitor: '15-30 minutes' },
  { feature: 'Pricing', snapquote: '$79/mo', competitor: 'Unclear (acquired by JobNimbus)' },
  { feature: 'Free Trial', snapquote: '14 days', competitor: 'Unknown' },
  { feature: 'Photo-Based Estimates', snapquote: 'Yes — snap a photo, get a quote', competitor: 'No' },
  { feature: 'Trade Support', snapquote: 'All trades', competitor: 'Primarily roofing & exteriors' },
  { feature: 'Mobile App', snapquote: 'iOS app built for the field', competitor: 'Web-based' },
  { feature: 'Line Item Detection', snapquote: 'AI auto-detects from photos', competitor: 'Manual entry required' },
  { feature: 'Client Portal', snapquote: 'Yes', competitor: 'Yes' },
  { feature: 'Ownership Status', snapquote: 'Independent, focused product', competitor: 'Acquired by JobNimbus' },
];

export default function SnapQuoteVsSumoQuote() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'SnapQuote vs SumoQuote Comparison',
    description: 'Detailed comparison of SnapQuote and SumoQuote contractor quoting tools.',
    url: 'https://snapquote.dev/compare/snapquote-vs-sumoquote',
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
          SnapQuote vs SumoQuote
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-gray-600">
          SumoQuote built a solid template-based quoting tool for contractors. But they got acquired by JobNimbus,
          and their future as a standalone product is uncertain. SnapQuote takes a completely different approach:
          you snap a photo of the job, and AI generates a detailed quote in about 60 seconds. No templates to build.
          No drag-and-drop editors. Just fast, accurate quotes from the field.
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
                  <th className="px-6 py-4 font-semibold text-gray-400">SumoQuote</th>
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
          <h2 className="text-2xl font-bold text-gray-900">Why Contractors Are Switching to SnapQuote</h2>

          <div className="mt-8 space-y-12">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">AI-Powered vs Template-Based</h3>
              <p className="mt-3 text-gray-600 leading-relaxed">
                SumoQuote requires you to build and maintain templates for every type of job. That means hours of
                setup before you send your first quote. SnapQuote skips all of that. Take a photo of the job site,
                and the AI identifies materials, measurements, and labor — then generates a professional quote
                automatically. No templates. No manual line-item entry. Just point, shoot, and send.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900">Clear Pricing vs Acquisition Uncertainty</h3>
              <p className="mt-3 text-gray-600 leading-relaxed">
                SnapQuote is $79/mo with a 14-day free trial. Simple. SumoQuote was acquired by JobNimbus, and
                their pricing and product direction have become unclear. When a tool you depend on gets folded into
                a larger platform, your workflow is at the mercy of someone else&apos;s product roadmap. SnapQuote is
                an independent, focused product — quoting is all we do, and we do it better than anyone.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900">Built for the Field, Not the Office</h3>
              <p className="mt-3 text-gray-600 leading-relaxed">
                SumoQuote is a web-based tool designed for sitting at a desk. SnapQuote has a native iOS app
                built for contractors who are on the roof, in the crawl space, or standing in a client&apos;s kitchen.
                You can generate and send a quote before you leave the job site — while the homeowner is still
                excited about getting the work done.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900">Works for Every Trade</h3>
              <p className="mt-3 text-gray-600 leading-relaxed">
                SumoQuote primarily serves roofing and exterior contractors. SnapQuote works for roofers, HVAC
                techs, plumbers, electricians, painters, general contractors — any trade that needs to send quotes.
                One tool, one subscription, every job type.
              </p>
            </div>
          </div>
        </section>

        {/* Bottom Line */}
        <section className="mt-16 rounded-2xl bg-gray-50 p-8 sm:p-10">
          <h2 className="text-2xl font-bold text-gray-900">The Bottom Line</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            SumoQuote helped contractors move from pen-and-paper to digital templates. That was a step forward.
            SnapQuote is the next leap: AI that does the quoting for you. If you&apos;re spending 15-30 minutes per
            quote with SumoQuote, you could be spending 60 seconds with SnapQuote. And with SumoQuote&apos;s future
            tied to JobNimbus, now is a good time to switch to a tool that&apos;s 100% focused on making your
            quoting faster.
          </p>
        </section>

        {/* CTA */}
        <section className="mt-16 text-center">
          <h2 className="text-3xl font-bold text-gray-900">Ready to Quote Faster?</h2>
          <p className="mt-4 text-gray-600">
            Try SnapQuote free for 14 days. No credit card required. See what AI-powered quoting feels like.
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
