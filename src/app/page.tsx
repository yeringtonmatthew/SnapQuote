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
    <div className="force-light min-h-dvh bg-[#f2f2f7]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ===== NAV ===== */}
      <nav className="bg-white border-b border-gray-100">
        <div className="mx-auto max-w-4xl flex items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600">
              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
            </div>
            <span className="text-[17px] font-bold text-gray-900 tracking-tight">SnapQuote</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/auth/login"
              className="rounded-lg px-4 py-2 text-[14px] font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
            >
              Log In
            </Link>
            <Link
              href="/auth/signup"
              className="rounded-lg bg-brand-600 px-4 py-2 text-[14px] font-semibold text-white hover:bg-brand-700 transition-colors"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* ===== HERO ===== */}
      <section className="bg-white pb-20 pt-16">
        <div className="mx-auto max-w-4xl px-6">
          <div className="flex flex-col items-center gap-12 lg:flex-row lg:items-center lg:gap-16">
            {/* Text */}
            <div className="flex-1 text-center lg:text-left">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-brand-50 px-4 py-1.5 text-sm font-medium text-brand-600">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
                AI-Powered Quoting
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                Create Professional Quotes in 60 Seconds
              </h1>
              <p className="mt-5 text-lg leading-relaxed text-gray-500">
                Snap photos of the job site. AI generates a detailed quote with inspection findings. Send it to your customer and get paid — all from your phone.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
                <Link
                  href="/auth/signup"
                  className="rounded-xl bg-brand-600 px-6 py-3.5 text-center font-semibold text-white shadow-lg shadow-brand-600/20 transition hover:bg-brand-700"
                >
                  Start Free
                </Link>
                <a
                  href="#how-it-works"
                  className="rounded-xl border border-gray-200 bg-white px-6 py-3.5 text-center font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                  See How It Works
                </a>
              </div>
            </div>

            {/* Phone Mockup */}
            <div className="flex-shrink-0">
              <div className="relative mx-auto w-[260px]">
                {/* Phone frame */}
                <div className="rounded-[2.5rem] border-[6px] border-gray-900 bg-gray-900 p-2 shadow-2xl">
                  {/* Notch */}
                  <div className="absolute left-1/2 top-2 z-10 h-6 w-24 -translate-x-1/2 rounded-b-2xl bg-gray-900" />
                  {/* Screen */}
                  <div className="overflow-hidden rounded-[2rem] bg-white">
                    {/* Status bar */}
                    <div className="flex items-center justify-between bg-white px-5 pb-1 pt-8">
                      <span className="text-[11px] font-semibold text-gray-900">9:41</span>
                      <div className="flex items-center gap-1">
                        <div className="h-2.5 w-2.5 rounded-full bg-gray-900" />
                        <div className="h-2.5 w-4 rounded-sm bg-gray-900" />
                      </div>
                    </div>
                    {/* Mini quote preview */}
                    <div className="px-4 pb-6 pt-2">
                      <div className="mb-3 flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600">
                          <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                          </svg>
                        </div>
                        <span className="text-[13px] font-bold text-gray-900">SnapQuote</span>
                      </div>
                      <div className="mb-3 rounded-xl bg-[#f2f2f7] p-3">
                        <p className="text-[10px] font-semibold text-gray-400">PROPOSAL</p>
                        <p className="mt-1 text-[13px] font-bold text-gray-900">Roof Replacement</p>
                        <p className="text-[11px] text-gray-500">142 Oak Street</p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-gray-500">Tear-off existing shingles</span>
                          <span className="font-semibold tabular-nums text-gray-900">$2,400</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-gray-500">Install underlayment</span>
                          <span className="font-semibold tabular-nums text-gray-900">$1,800</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-gray-500">Architectural shingles</span>
                          <span className="font-semibold tabular-nums text-gray-900">$4,200</span>
                        </div>
                        <div className="my-2 border-t border-gray-200" />
                        <div className="flex items-center justify-between text-[12px]">
                          <span className="font-bold text-gray-900">Total</span>
                          <span className="font-bold tabular-nums text-gray-900">$8,400</span>
                        </div>
                      </div>
                      <div className="mt-4 rounded-lg bg-brand-600 py-2 text-center text-[11px] font-semibold text-white">
                        Accept & Sign
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== SOCIAL PROOF BAR ===== */}
      <section className="border-y border-gray-200 bg-white py-6">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-4 px-6 sm:flex-row sm:justify-center sm:gap-8">
          {/* Stars */}
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <svg key={i} className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" clipRule="evenodd" />
              </svg>
            ))}
          </div>
          <p className="text-sm font-medium text-gray-600">
            Trusted by <span className="font-bold text-gray-900">500+</span> contractors
          </p>
          {/* Avatar circles */}
          <div className="flex -space-x-2">
            {[
              { initials: 'MR', bg: 'bg-blue-500' },
              { initials: 'ST', bg: 'bg-emerald-500' },
              { initials: 'JD', bg: 'bg-orange-500' },
            ].map((a) => (
              <div
                key={a.initials}
                className={`flex h-8 w-8 items-center justify-center rounded-full ${a.bg} text-xs font-bold text-white ring-2 ring-white`}
              >
                {a.initials}
              </div>
            ))}
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-[10px] font-bold text-gray-600 ring-2 ring-white">
              +497
            </div>
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section id="how-it-works" className="bg-[#f2f2f7] py-20">
        <div className="mx-auto max-w-4xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              How It Works
            </h2>
            <p className="mt-3 text-gray-500">
              Three steps. No learning curve. Start closing deals today.
            </p>
          </div>
          <div className="mt-14 grid gap-8 sm:grid-cols-3">
            {[
              {
                num: '01',
                title: 'Snap Photos',
                desc: 'Take photos of the job site from your phone. Roof damage, gutters, siding — capture everything.',
                icon: (
                  <svg className="h-6 w-6 text-brand-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                  </svg>
                ),
              },
              {
                num: '02',
                title: 'AI Generates Your Quote',
                desc: 'Our AI analyzes every photo, identifies damage, and builds a detailed quote with inspection findings, line items, and pricing.',
                icon: (
                  <svg className="h-6 w-6 text-brand-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
                  </svg>
                ),
              },
              {
                num: '03',
                title: 'Send & Get Paid',
                desc: 'Send a professional proposal via text or email. Customers sign and pay their deposit online.',
                icon: (
                  <svg className="h-6 w-6 text-brand-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                  </svg>
                ),
              },
            ].map((step) => (
              <div key={step.num} className="rounded-2xl bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center gap-3">
                  <span className="text-3xl font-bold text-brand-600/20">{step.num}</span>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50">
                    {step.icon}
                  </div>
                </div>
                <h3 className="text-lg font-bold text-gray-900">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURES GRID ===== */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-4xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              Everything You Need to Win More Jobs
            </h2>
            <p className="mt-3 text-gray-500">
              Built for contractors who want to look professional and get paid faster.
            </p>
          </div>
          <div className="mt-14 grid gap-4 sm:grid-cols-2">
            {[
              {
                title: 'AI Inspection Reports',
                desc: 'Per-photo findings with severity ratings',
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m5.231 13.481L15 17.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v16.5c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9zm3.75 11.625a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                ),
              },
              {
                title: 'Professional Proposals',
                desc: 'Branded proposals your customers will trust',
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                ),
              },
              {
                title: 'Online Payments',
                desc: 'Collect deposits via Stripe, right from the quote',
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                ),
              },
              {
                title: 'One-Tap Send',
                desc: 'SMS or email delivery in seconds',
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.282 48.282 0 005.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                ),
              },
              {
                title: 'E-Signatures',
                desc: 'Legally binding signatures captured on any device',
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                ),
              },
              {
                title: 'Works Offline',
                desc: 'Create quotes even without signal. Syncs when you\'re back online.',
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                ),
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="flex items-start gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50">
                  <svg className="h-5 w-5 text-brand-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
                    {feature.icon}
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">{feature.title}</h3>
                  <p className="mt-0.5 text-sm leading-relaxed text-gray-500">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section className="bg-[#f2f2f7] py-20">
        <div className="mx-auto max-w-4xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              Contractors Love SnapQuote
            </h2>
          </div>
          <div className="mt-14 grid gap-6 sm:grid-cols-3">
            {[
              {
                quote: 'SnapQuote cut my quoting time from 2 hours to 5 minutes. My close rate went up 40%.',
                name: 'Mike R.',
                role: 'Roofing Contractor',
                bg: 'bg-blue-500',
              },
              {
                quote: 'The AI inspection reports blow my customers away. They see the damage, understand the urgency, and sign on the spot.',
                name: 'Sarah T.',
                role: 'General Contractor',
                bg: 'bg-emerald-500',
              },
              {
                quote: 'I used to lose deals because my quotes looked unprofessional. Now I look like a Fortune 500 company.',
                name: 'James D.',
                role: 'HVAC Technician',
                bg: 'bg-orange-500',
              },
            ].map((t) => (
              <div key={t.name} className="flex flex-col rounded-2xl bg-white p-6 shadow-sm">
                {/* Stars */}
                <div className="mb-4 flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="h-4 w-4 text-yellow-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" clipRule="evenodd" />
                    </svg>
                  ))}
                </div>
                <p className="flex-1 text-sm leading-relaxed text-gray-700">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="mt-5 flex items-center gap-3">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-full ${t.bg} text-xs font-bold text-white`}>
                    {t.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== BOTTOM CTA ===== */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Ready to close more deals?
          </h2>
          <p className="mt-4 text-lg text-gray-500">
            Join 500+ contractors using AI to win more jobs.
          </p>
          <div className="mt-8">
            <Link
              href="/auth/signup"
              className="inline-block rounded-xl bg-brand-600 px-8 py-3.5 font-semibold text-white shadow-lg shadow-brand-600/20 transition hover:bg-brand-700"
            >
              Get Started Free
            </Link>
          </div>
          <p className="mt-4 text-sm text-gray-400">
            No credit card required. Free for your first 10 quotes.
          </p>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-gray-200 bg-[#f2f2f7] py-8">
        <div className="mx-auto max-w-4xl px-6">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-600">
                <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                </svg>
              </div>
              <span className="text-sm font-bold text-gray-900">SnapQuote</span>
            </div>
            <nav aria-label="Footer" className="flex items-center gap-6">
              <Link href="/privacy" className="text-sm text-gray-500 hover:text-gray-700">
                Privacy
              </Link>
              <Link href="/terms" className="text-sm text-gray-500 hover:text-gray-700">
                Terms
              </Link>
            </nav>
          </div>
          <p className="mt-6 text-center text-xs text-gray-400">
            &copy; 2026 SnapQuote. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
