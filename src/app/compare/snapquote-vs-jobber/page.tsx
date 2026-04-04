import Link from 'next/link';
import { Metadata } from 'next';
import { SnapQuoteLogo } from '@/components/SnapQuoteLogo';

export const metadata: Metadata = {
  title: 'SnapQuote vs Jobber — Best Jobber Alternative for Fast Quoting',
  description:
    'Compare SnapQuote and Jobber side-by-side. SnapQuote does one thing better — quoting. AI-powered quotes in 60 seconds at $79/mo vs Jobber at $39-249/mo.',
  keywords: ['Jobber alternative', 'SnapQuote vs Jobber', 'contractor quoting software', 'field service quoting'],
  openGraph: {
    title: 'SnapQuote vs Jobber — Best Jobber Alternative for Quoting',
    description: 'If you just need fast, professional quotes — you don\'t need a $249/mo CRM. See how SnapQuote compares.',
    url: 'https://snapquote.dev/compare/snapquote-vs-jobber',
    type: 'website',
  },
};

const features = [
  { feature: 'Primary Focus', snapquote: 'Quoting & proposals', competitor: 'Full field service management' },
  { feature: 'Pricing', snapquote: '$79/mo', competitor: '$39-249/mo' },
  { feature: 'Free Trial', snapquote: '14 days', competitor: '14 days' },
  { feature: 'Quote Generation', snapquote: 'AI-powered from photos', competitor: 'Manual entry' },
  { feature: 'Time to Quote', snapquote: '60 seconds', competitor: '10-20 minutes' },
  { feature: 'Scheduling', snapquote: 'Not included (focused tool)', competitor: 'Yes' },
  { feature: 'Invoicing', snapquote: 'Quote-to-invoice flow', competitor: 'Full invoicing suite' },
  { feature: 'CRM', snapquote: 'Client management for quoting', competitor: 'Full CRM' },
  { feature: 'Learning Curve', snapquote: 'Minutes — snap a photo, send a quote', competitor: 'Days to weeks of setup' },
  { feature: 'Mobile Experience', snapquote: 'Native iOS, built for the field', competitor: 'Mobile app available' },
];

export default function SnapQuoteVsJobber() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'SnapQuote vs Jobber Comparison',
    description: 'Detailed comparison of SnapQuote and Jobber for contractor quoting.',
    url: 'https://snapquote.dev/compare/snapquote-vs-jobber',
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
          SnapQuote vs Jobber
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-gray-600">
          Jobber is a full field service management platform — scheduling, dispatching, invoicing, CRM, the works.
          It does a lot of things. But if your biggest bottleneck is quoting, Jobber&apos;s quote builder is just a
          small piece of a much larger (and more expensive) platform. SnapQuote does one thing and does it
          better than anyone: getting professional quotes to clients in 60 seconds using AI.
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
                  <th className="px-6 py-4 font-semibold text-gray-400">Jobber</th>
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
          <h2 className="text-2xl font-bold text-gray-900">When SnapQuote Makes More Sense Than Jobber</h2>

          <div className="mt-8 space-y-12">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">You Need Fast Quotes, Not a Full CRM</h3>
              <p className="mt-3 text-gray-600 leading-relaxed">
                Most contractors lose jobs because they&apos;re slow to quote, not because they lack a CRM. If your
                main pain point is getting quotes out the door, you don&apos;t need Jobber&apos;s scheduling engine,
                dispatching tools, and route optimization. You need a tool that turns a job site photo into a
                professional proposal in 60 seconds. That&apos;s SnapQuote.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900">AI Does the Work, Not You</h3>
              <p className="mt-3 text-gray-600 leading-relaxed">
                Jobber&apos;s quoting feature is essentially a digital form: you manually type in line items, quantities,
                and prices. It&apos;s faster than paper, but it still takes 10-20 minutes per quote. SnapQuote&apos;s AI
                analyzes your job site photos, identifies materials and scope, and auto-generates a detailed quote.
                You review it, tweak anything you want, and send. The whole process takes about a minute.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900">Pay for What You Use</h3>
              <p className="mt-3 text-gray-600 leading-relaxed">
                Jobber&apos;s Grow plan — the one with the features most contractors actually need — runs $249/mo.
                That&apos;s a lot to pay when all you really want is better quoting. SnapQuote is $79/mo for unlimited
                AI-powered quotes, a client portal, and professional proposals. If you already use another tool for
                scheduling or invoicing, pairing it with SnapQuote for quoting is cheaper than switching everything
                to Jobber.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900">Zero Learning Curve</h3>
              <p className="mt-3 text-gray-600 leading-relaxed">
                Jobber is a complex platform. Setting it up properly takes days, sometimes weeks. You need to
                configure services, tax rates, team permissions, scheduling rules, and more before you send your
                first quote. SnapQuote? Download the app, snap a photo, send a quote. You can be up and running
                in literally five minutes.
              </p>
            </div>
          </div>
        </section>

        {/* Bottom Line */}
        <section className="mt-16 rounded-2xl bg-gray-50 p-8 sm:p-10">
          <h2 className="text-2xl font-bold text-gray-900">The Bottom Line</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Jobber is a great all-in-one platform if you need scheduling, dispatching, invoicing, and CRM in one
            place. But if quoting is your bottleneck — if you&apos;re losing jobs because your proposals take too
            long — SnapQuote solves that specific problem better and cheaper. At $79/mo vs Jobber&apos;s $249/mo
            Grow plan, you could save over $2,000 a year while actually sending quotes faster. Use SnapQuote for
            quoting, keep your existing tools for everything else.
          </p>
        </section>

        {/* CTA */}
        <section className="mt-16 text-center">
          <h2 className="text-3xl font-bold text-gray-900">Ready to Quote Faster?</h2>
          <p className="mt-4 text-gray-600">
            Try SnapQuote free for 14 days. No credit card required. Send your first AI-powered quote in 60 seconds.
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
