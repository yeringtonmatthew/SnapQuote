import Link from 'next/link';

export default function Home() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'SnapQuote',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    description: 'AI-powered quoting tool for contractors',
    url: 'https://snapquote.dev',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  };

  return (
    <main className="flex min-h-dvh flex-col items-center px-6 pb-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="w-full max-w-sm">

        {/* Hero */}
        <div className="pt-20 pb-10 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-600 shadow-lg shadow-brand-600/20">
            <svg
              className="h-8 w-8 text-white"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              role="img"
              aria-label="Camera icon representing SnapQuote"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z"
              />
            </svg>
          </div>
          <h1 className="mt-5 text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            SnapQuote
          </h1>
          <p className="mt-2 text-lg text-gray-500 dark:text-gray-400">
            Snap a photo. Send a quote. Get paid.
          </p>
        </div>

        {/* Feature highlights */}
        <h2 className="sr-only">Features</h2>
        <div className="mb-10 space-y-4">
          {[
            {
              icon: (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
              ),
              title: 'AI-powered quotes in 30 seconds',
              desc: 'Take a photo of the job, and our AI generates a detailed, itemized quote instantly.',
            },
            {
              icon: (
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
              ),
              title: 'Send via SMS, get e-signatures',
              desc: 'Customers review, sign, and approve quotes right from their phone.',
            },
            {
              icon: (
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75" />
              ),
              title: 'Collect deposits online',
              desc: 'Stripe-powered payments let customers pay their deposit in one tap.',
            },
          ].map((feature, i) => (
            <div key={i} className="flex items-start gap-4 rounded-2xl bg-white dark:bg-gray-900 p-4 shadow-sm border border-gray-100 dark:border-gray-800">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 dark:bg-brand-900/30">
                <svg className="h-5 w-5 text-brand-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
                  {feature.icon}
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{feature.title}</h3>
                <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div className="space-y-3">
          <Link href="/auth/signup" className="btn-primary block focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2">
            Get Started Free
          </Link>
          <Link href="/auth/login" className="btn-secondary block focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2">
            Sign In
          </Link>
        </div>

        <p className="mt-8 text-center text-xs text-gray-500 dark:text-gray-400">
          Built for plumbers, electricians, HVAC techs, and general contractors.
        </p>

        {/* Legal links */}
        <nav aria-label="Legal">
          <div className="mt-4 flex items-center justify-center gap-4">
            <Link href="/privacy" className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 rounded">
              Privacy Policy
            </Link>
            <span className="text-xs text-gray-300 dark:text-gray-600" aria-hidden="true">|</span>
            <Link href="/terms" className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 rounded">
              Terms
            </Link>
          </div>
        </nav>
      </div>
    </main>
  );
}
