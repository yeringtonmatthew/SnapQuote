import Link from 'next/link';
import { SnapQuoteLogo } from '@/components/SnapQuoteLogo';

export interface IntentBenefit {
  title: string;
  body: string;
}

export interface IntentLandingTemplateProps {
  eyebrow: string;
  headline: string;
  subhead: string;
  benefits: IntentBenefit[];
  howItWorks: string[];
  faqs: { q: string; a: string }[];
  urlPath: string;
}

export function IntentLandingTemplate({
  eyebrow,
  headline,
  subhead,
  benefits,
  howItWorks,
  faqs,
  urlPath,
}: IntentLandingTemplateProps) {
  const webPageLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: headline,
    description: subhead,
    url: `https://snapquote.dev${urlPath}`,
  };

  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  const appLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'SnapQuote',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'iOS, Web',
    description: subhead,
    url: `https://snapquote.dev${urlPath}`,
    offers: { '@type': 'Offer', price: '79', priceCurrency: 'USD' },
  };

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'SnapQuote',
        item: 'https://snapquote.dev',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: eyebrow,
        item: `https://snapquote.dev${urlPath}`,
      },
    ],
  };

  return (
    <div className="force-light min-h-dvh bg-white antialiased">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(appLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

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
        <div className="inline-block rounded-full bg-blue-50 px-3 py-1 text-[12px] font-semibold uppercase tracking-wide text-blue-700">
          {eyebrow}
        </div>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">{headline}</h1>
        <p className="mt-6 text-lg leading-relaxed text-gray-600">{subhead}</p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/auth/signup"
            className="inline-flex rounded-full bg-blue-600 px-6 py-3 text-[14px] font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:brightness-110 active:scale-[0.97]"
          >
            Start Free Trial
          </Link>
          <Link
            href="/compare"
            className="inline-flex rounded-full border border-gray-200 px-6 py-3 text-[14px] font-semibold text-gray-700 transition hover:bg-gray-50 active:scale-[0.97]"
          >
            Compare Tools
          </Link>
        </div>

        {/* Benefits */}
        <section className="mt-20">
          <h2 className="text-2xl font-bold text-gray-900">Why Roofers Pick SnapQuote</h2>
          <div className="mt-8 grid gap-8 sm:grid-cols-2">
            {benefits.map((b) => (
              <div key={b.title} className="rounded-2xl border border-gray-100 bg-gray-50/50 p-6">
                <h3 className="text-lg font-semibold text-gray-900">{b.title}</h3>
                <p className="mt-2 text-[14px] text-gray-600 leading-relaxed">{b.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="mt-20">
          <h2 className="text-2xl font-bold text-gray-900">How It Works</h2>
          <ol className="mt-8 space-y-5">
            {howItWorks.map((step, i) => (
              <li key={i} className="flex gap-4">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-[14px] font-bold text-white">
                  {i + 1}
                </div>
                <p className="pt-1.5 text-[15px] text-gray-700 leading-relaxed">{step}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* FAQ */}
        <section className="mt-20">
          <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions</h2>
          <div className="mt-8 space-y-6">
            {faqs.map((f) => (
              <div key={f.q} className="rounded-2xl border border-gray-100 bg-white p-6">
                <h3 className="font-semibold text-gray-900">{f.q}</h3>
                <p className="mt-2 text-[14px] text-gray-600 leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mt-20 rounded-2xl bg-blue-50 border border-blue-100 p-8 sm:p-10 text-center">
          <h2 className="text-2xl font-bold text-gray-900">Ready to Quote Faster?</h2>
          <p className="mt-3 text-gray-600">$79/mo. 14-day free trial. No credit card required.</p>
          <Link
            href="/auth/signup"
            className="mt-6 inline-flex rounded-full bg-blue-600 px-8 py-3.5 text-[15px] font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:brightness-110 active:scale-[0.97]"
          >
            Try SnapQuote Free for 14 Days
          </Link>
        </section>

        <section className="mt-16 border-t border-gray-100 pt-10">
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-400">Keep Exploring</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {[
              {
                href: '/roofing-proposal-template',
                title: 'Roofing proposal template',
                body: 'See what a customer-ready roofing proposal should include before you automate it.',
              },
              {
                href: '/compare',
                title: 'Roofing software comparisons',
                body: 'Compare SnapQuote against Jobber, Roofr, ServiceTitan, JobNimbus, and more.',
              },
              {
                href: '/tools',
                title: 'Free roofing calculators',
                body: 'Use free roofing calculators to estimate squares, pitch, materials, and replacement cost.',
              },
              {
                href: '/glossary',
                title: 'Roofing glossary',
                body: 'Turn roofing terms, inspection language, and proposal jargon into plain English.',
              },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-2xl border border-gray-200 bg-white p-5 transition-all hover:border-blue-200 hover:shadow-md"
              >
                <p className="text-[16px] font-semibold text-gray-900">{item.title}</p>
                <p className="mt-2 text-[14px] leading-relaxed text-gray-600">{item.body}</p>
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
              <Link href="/roofing-proposal-template" className="text-[13px] text-gray-400 transition hover:text-gray-600">Proposal Template</Link>
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
