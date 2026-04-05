import Link from 'next/link';
import { SnapQuoteLogo } from '@/components/SnapQuoteLogo';
import TypewriterHero from './(marketing)/TypewriterHero';
import FeatureTabs from './(marketing)/FeatureTabs';
import ROICalculator from './(marketing)/ROICalculator';
import FAQAccordion from './(marketing)/FAQAccordion';
import ScrollFadeIn from './(marketing)/ScrollFadeIn';

export default function Home() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'SnapQuote',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'iOS, Web',
    description:
      'AI-powered quoting tool for contractors. Send professional proposals in 60 seconds from your iPhone.',
    url: 'https://snapquote.dev',
    offers: { '@type': 'Offer', price: '79', priceCurrency: 'USD', billingPeriod: 'P1M', description: '14-day free trial' },
  };

  return (
    <div className="force-light min-h-dvh bg-white antialiased">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ═══════════════════════════════════════════════════════
          NAV — Apple-style: minimal, frosted, confident
          ═══════════════════════════════════════════════════════ */}
      <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-2xl backdrop-saturate-[1.8] border-b border-black/[0.04]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 h-16">
          <Link href="/" aria-label="SnapQuote home">
            <SnapQuoteLogo size="sm" />
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/auth/login"
              className="rounded-full px-5 py-2 text-[14px] font-medium text-gray-500 transition-colors hover:text-gray-900"
            >
              Log In
            </Link>
            <Link
              href="/auth/signup"
              className="rounded-full bg-gray-900 px-5 py-2 text-[14px] font-semibold text-white shadow-sm transition-all hover:bg-gray-800 active:scale-[0.97]"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ═══════════════════════════════════════════════════════
          HERO — One massive statement. No clutter.
          "If you need more than two sentences, you don't
          understand your product." — Steve Jobs
          ═══════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden">
        {/* Ambient light — subtle, not circus */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[800px] w-[1000px] rounded-full bg-gradient-to-b from-brand-100/60 via-brand-50/30 to-transparent blur-[100px]" />
          <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-blue-100/30 blur-[120px]" />
        </div>

        <div className="relative mx-auto max-w-6xl px-6 pb-20 pt-20 sm:pb-32 sm:pt-28 lg:pb-40 lg:pt-32">
          <div className="flex flex-col items-center gap-16 lg:flex-row lg:items-center lg:gap-20">
            {/* Left: Copy */}
            <div className="flex-1 text-center lg:text-left">
              {/* Social proof — small, real, trust-building */}
              <div className="mb-8 inline-flex items-center gap-2.5 rounded-full border border-gray-200/80 bg-white/80 px-4 py-2 shadow-sm backdrop-blur-sm">
                <span className="flex -space-x-2">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white ring-2 ring-white">MR</span>
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white ring-2 ring-white">ST</span>
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white ring-2 ring-white">JD</span>
                </span>
                <span className="text-[13px] text-gray-600">
                  Built by contractors, for contractors
                </span>
                <span className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="h-3 w-3 text-yellow-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" clipRule="evenodd" /></svg>
                  ))}
                </span>
              </div>

              <h1 className="text-[clamp(2.5rem,6vw,4.5rem)] font-bold leading-[1.05] tracking-tight text-gray-900">
                Professional quotes<br className="hidden sm:block" /> in 60{' '}
                <TypewriterHero />
              </h1>

              <p className="mt-6 text-[18px] leading-relaxed text-gray-500 lg:max-w-[480px] sm:text-[20px]">
                Snap photos. AI builds the estimate. Your customer signs and pays.{' '}
                <span className="text-gray-900 font-medium">All from your iPhone.</span>
              </p>

              {/* CTA cluster */}
              <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
                <Link
                  href="/auth/signup"
                  className="group relative overflow-hidden rounded-full bg-brand-600 px-10 py-4 text-center text-[17px] font-semibold text-white shadow-lg shadow-brand-600/25 transition-all hover:shadow-xl hover:shadow-brand-600/30 hover:brightness-110 active:scale-[0.97]"
                >
                  Start 14-Day Free Trial
                </Link>
                <a
                  href="#how-it-works"
                  className="rounded-full border border-gray-200 bg-white px-8 py-4 text-center text-[17px] font-semibold text-gray-700 transition-all hover:border-gray-300 hover:shadow-sm active:scale-[0.97]"
                >
                  See How It Works
                </a>
              </div>

              {/* App Store badge + reassurance */}
              <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row lg:justify-start">
                <a href="https://apps.apple.com/app/snapquote" className="flex items-center gap-2.5 rounded-xl bg-gray-900 px-5 py-2.5 text-white shadow-sm transition hover:bg-gray-800 active:scale-[0.97]">
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                  </svg>
                  <div className="leading-tight">
                    <p className="text-[10px] font-medium text-gray-400">Download on the</p>
                    <p className="text-[15px] font-semibold -mt-0.5">App Store</p>
                  </div>
                </a>
                <p className="text-[13px] text-gray-400">14-day free trial &middot; No card required</p>
              </div>
            </div>

            {/* Right: Phone — feels alive */}
            <div className="relative flex-shrink-0 w-[280px] sm:w-[300px] lg:w-[320px]">
              {/* Ambient glow behind phone */}
              <div className="absolute -inset-16 rounded-full bg-brand-400/[0.12] blur-[60px] animate-[pulse_5s_ease-in-out_infinite]" aria-hidden="true" />
              <div className="absolute -inset-8 rounded-full bg-brand-300/[0.08] blur-[40px]" aria-hidden="true" />

              {/* iPhone frame */}
              <div className="relative rounded-[3rem] border-[8px] border-gray-900 bg-gray-900 p-1.5 shadow-2xl shadow-black/30">
                {/* Dynamic Island */}
                <div className="absolute left-1/2 top-3 z-10 h-[28px] w-[100px] -translate-x-1/2 rounded-full bg-gray-900" />
                {/* Screen */}
                <div className="overflow-hidden rounded-[2.25rem] bg-white">
                  {/* Status bar */}
                  <div className="flex items-center justify-between px-7 pb-1 pt-[38px]">
                    <span className="text-[13px] font-semibold text-gray-900">9:41</span>
                    <div className="flex items-center gap-1.5">
                      <svg className="h-3 w-3 text-gray-900" viewBox="0 0 24 24" fill="currentColor"><path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z" opacity="0.3"/><path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z" opacity="0.3"/></svg>
                      <svg className="h-3.5 w-3.5 text-gray-900" viewBox="0 0 24 24" fill="currentColor"><path d="M18.375 2.25c-1.035 0-1.875.84-1.875 1.875v15.75c0 1.035.84 1.875 1.875 1.875h.75c1.035 0 1.875-.84 1.875-1.875V4.125c0-1.036-.84-1.875-1.875-1.875h-.75zM9.75 8.625c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v11.25c0 1.035-.84 1.875-1.875 1.875h-.75a1.875 1.875 0 01-1.875-1.875V8.625zM3 13.125c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v6.75c0 1.035-.84 1.875-1.875 1.875h-.75A1.875 1.875 0 013 19.875v-6.75z" /></svg>
                      <div className="flex h-3 w-6 items-center rounded-sm border border-gray-900/30 px-[2px]">
                        <div className="h-1.5 w-3/4 rounded-[1px] bg-gray-900" />
                      </div>
                    </div>
                  </div>

                  {/* App content — quote preview */}
                  <div className="px-5 pb-6 pt-3">
                    {/* App header */}
                    <div className="mb-4 flex items-center gap-2.5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 shadow-sm">
                        <svg className="h-[18px] w-[18px] text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" /><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" /></svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-bold text-gray-900">SnapQuote</p>
                      </div>
                      <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-[10px] font-bold text-green-700 uppercase tracking-wide">Sent</span>
                    </div>

                    {/* Quote card */}
                    <div className="mb-3 rounded-2xl bg-gray-50 p-3.5">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Proposal</p>
                      <p className="mt-1 text-[15px] font-bold text-gray-900">Roof Replacement</p>
                      <p className="text-[12px] text-gray-500">142 Oak Street</p>
                    </div>

                    {/* Line items */}
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between text-[12px]">
                        <span className="text-gray-500">Tear-off existing shingles</span>
                        <span className="font-semibold tabular-nums text-gray-900">$2,400</span>
                      </div>
                      <div className="flex items-center justify-between text-[12px]">
                        <span className="text-gray-500">Install underlayment</span>
                        <span className="font-semibold tabular-nums text-gray-900">$1,800</span>
                      </div>
                      <div className="flex items-center justify-between text-[12px]">
                        <span className="text-gray-500">Architectural shingles</span>
                        <span className="font-semibold tabular-nums text-gray-900">$4,200</span>
                      </div>
                      <div className="border-t border-gray-200 pt-2.5 flex items-center justify-between text-[13px]">
                        <span className="font-bold text-gray-900">Total</span>
                        <span className="font-bold tabular-nums text-gray-900">$8,400</span>
                      </div>
                    </div>

                    {/* CTA button */}
                    <div className="mt-4 rounded-xl bg-brand-600 py-3 text-center text-[13px] font-bold text-white shadow-sm">
                      Accept &amp; Pay Deposit
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          OUTCOMES — Four numbers that tell the whole story.
          Clean. No fluff. Just results.
          ═══════════════════════════════════════════════════════ */}
      <section className="border-y border-gray-100 bg-gray-50/50">
        <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
          <div className="grid grid-cols-2 gap-y-12 gap-x-8 sm:grid-cols-4">
            {[
              { value: '60', unit: 's', label: 'To create a quote', color: 'text-brand-600' },
              { value: '40', unit: '%', label: 'Higher close rate', color: 'text-brand-600' },
              { value: '$2.1', unit: 'K', label: 'More per job avg.', color: 'text-brand-600' },
              { value: '4.9', unit: '\u2605', label: 'Customer rating', color: 'text-brand-600' },
            ].map((stat, i) => (
              <ScrollFadeIn key={stat.label} className="text-center" delay={i * 80}>
                <p className="text-[clamp(2.5rem,5vw,3.5rem)] font-bold tracking-tight text-gray-900 tabular-nums">
                  {stat.value}<span className={stat.color}>{stat.unit}</span>
                </p>
                <p className="mt-1 text-[13px] font-medium text-gray-500">{stat.label}</p>
              </ScrollFadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          THE OLD WAY vs. SNAPQUOTE — Visceral contrast.
          Show the pain, then show the cure.
          ═══════════════════════════════════════════════════════ */}
      <section className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <ScrollFadeIn>
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl lg:text-[2.75rem]">
                The old way is costing you jobs.
              </h2>
              <p className="mt-4 text-lg text-gray-500">
                Every hour spent on quotes is an hour you&apos;re not on a roof making money.
              </p>
            </div>
          </ScrollFadeIn>

          <div className="mt-16 grid gap-6 sm:grid-cols-2">
            {/* Old Way */}
            <ScrollFadeIn delay={0}>
              <div className="relative rounded-3xl bg-gray-50 p-8 sm:p-10 ring-1 ring-gray-200/80">
                <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-red-50 px-3.5 py-1.5 text-[13px] font-semibold text-red-600">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  Without SnapQuote
                </div>
                <ul className="space-y-4">
                  {[
                    { text: '2+ hours measuring and writing each quote', icon: '01' },
                    { text: 'Messy spreadsheets or paper notes', icon: '02' },
                    { text: 'Customer ghosts you after 3 days', icon: '03' },
                    { text: 'Unprofessional proposals lose to competitors', icon: '04' },
                    { text: 'No way to collect payments online', icon: '05' },
                  ].map((item) => (
                    <li key={item.icon} className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-200 text-[10px] font-bold text-gray-500">{item.icon}</span>
                      <span className="text-[15px] text-gray-600 leading-snug">{item.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </ScrollFadeIn>

            {/* SnapQuote Way */}
            <ScrollFadeIn delay={100}>
              <div className="relative rounded-3xl bg-brand-600 p-8 sm:p-10 text-white ring-1 ring-brand-500 shadow-xl shadow-brand-600/15">
                <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1.5 text-[13px] font-semibold text-white backdrop-blur-sm">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                  With SnapQuote
                </div>
                <ul className="space-y-4">
                  {[
                    { text: '60-second AI-generated quotes from photos', icon: '01' },
                    { text: 'Professional branded proposals, every time', icon: '02' },
                    { text: 'Customer gets it instantly via text or email', icon: '03' },
                    { text: 'Good / Better / Best tiers boost your ticket 40%', icon: '04' },
                    { text: 'One-tap signatures and Stripe payments', icon: '05' },
                  ].map((item) => (
                    <li key={item.icon} className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/20 text-[10px] font-bold text-white">{item.icon}</span>
                      <span className="text-[15px] text-brand-100 leading-snug">{item.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </ScrollFadeIn>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          HOW IT WORKS — Three steps. Dead simple.
          ═══════════════════════════════════════════════════════ */}
      <section id="how-it-works" className="bg-gray-50/50 py-24 sm:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <ScrollFadeIn>
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-[13px] font-semibold uppercase tracking-widest text-brand-600">Simple by design</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl lg:text-[2.75rem]">
                Three steps. Zero learning curve.
              </h2>
            </div>
          </ScrollFadeIn>

          <div className="relative mt-20 grid gap-6 sm:grid-cols-3">
            {/* Connector line */}
            <div className="absolute top-[72px] left-[16.67%] right-[16.67%] hidden h-px bg-gradient-to-r from-brand-200 via-brand-400 to-brand-200 sm:block" aria-hidden="true" />

            {[
              {
                num: '1',
                title: 'Snap Photos',
                desc: 'Walk the job site. Snap photos of the roof, damage, or scope of work. That\u2019s it.',
                icon: (
                  <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" /><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" /></svg>
                ),
              },
              {
                num: '2',
                title: 'AI Builds Your Quote',
                desc: 'AI analyzes every photo. Line items, pricing, inspection findings \u2014 generated in seconds.',
                icon: (
                  <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" /></svg>
                ),
              },
              {
                num: '3',
                title: 'Send & Get Paid',
                desc: 'Text or email the proposal. Customer signs and pays their deposit \u2014 one tap.',
                icon: (
                  <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>
                ),
              },
            ].map((step, i) => (
              <ScrollFadeIn key={step.num} delay={i * 120}>
                <div className="group relative rounded-3xl bg-white p-8 shadow-sm ring-1 ring-gray-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:ring-brand-200/60">
                  {/* Step circle */}
                  <div className="relative z-10 mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-100">
                    {step.icon}
                  </div>
                  {/* Faded step number */}
                  <span className="absolute right-6 top-6 text-[56px] font-extrabold leading-none text-gray-100 transition-colors group-hover:text-brand-100" aria-hidden="true">{step.num}</span>
                  <h3 className="text-xl font-bold text-gray-900">{step.title}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-gray-500">{step.desc}</p>
                </div>
              </ScrollFadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          FEATURE TABS — Interactive deep-dive
          ═══════════════════════════════════════════════════════ */}
      <section className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <ScrollFadeIn>
            <div className="mx-auto max-w-2xl text-center mb-16">
              <p className="text-[13px] font-semibold uppercase tracking-widest text-brand-600">Full toolkit</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl lg:text-[2.75rem]">
                Everything you need to win more jobs
              </h2>
              <p className="mt-4 text-lg text-gray-500">
                Quotes, proposals, payments, pipeline, scheduling. One app.
              </p>
            </div>
          </ScrollFadeIn>
          <FeatureTabs />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          TESTIMONIALS — Real contractors, real results
          ═══════════════════════════════════════════════════════ */}
      <section className="bg-gray-50/50 py-24 sm:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <ScrollFadeIn>
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-[13px] font-semibold uppercase tracking-widest text-brand-600">Real results</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl lg:text-[2.75rem]">
                Contractors close more with SnapQuote
              </h2>
            </div>
          </ScrollFadeIn>

          <div className="mt-16 grid gap-6 sm:grid-cols-3">
            {[
              {
                quote: 'I went from spending 2 hours on quotes to under 5 minutes. My close rate jumped 42% in the first month.',
                name: 'Mike Rodriguez',
                role: 'Summit Roofing Co.',
                bg: 'bg-blue-600',
                result: '$48K closed first month',
              },
              {
                quote: 'The AI inspection reports blow my customers away. They see the damage, understand the urgency, and sign on the spot.',
                name: 'Sarah Thompson',
                role: 'Thompson Builds LLC',
                bg: 'bg-emerald-600',
                result: '42% higher close rate',
              },
              {
                quote: 'Customers tell me I look like a Fortune 500 company. My average ticket is up $2,100 since switching.',
                name: 'James Davis',
                role: 'Davis Climate Solutions',
                bg: 'bg-amber-500',
                result: '+$2,100 avg. ticket',
              },
            ].map((t, i) => (
              <ScrollFadeIn key={t.name} delay={i * 80}>
                <div className="group flex h-full flex-col rounded-3xl bg-white p-8 shadow-sm ring-1 ring-gray-100 transition-all duration-300 hover:shadow-lg hover:ring-gray-200">
                  {/* Stars */}
                  <div className="mb-4 flex gap-0.5">
                    {[...Array(5)].map((_, j) => (
                      <svg key={j} className="h-[18px] w-[18px] text-yellow-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" clipRule="evenodd" /></svg>
                    ))}
                  </div>
                  <p className="flex-1 text-[15px] leading-relaxed text-gray-700">&ldquo;{t.quote}&rdquo;</p>
                  {/* Result badge */}
                  <div className="mt-5 inline-flex self-start items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-[12px] font-semibold text-green-700 ring-1 ring-green-100">
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22" /></svg>
                    {t.result}
                  </div>
                  {/* Author */}
                  <div className="mt-6 flex items-center gap-3 border-t border-gray-100 pt-6">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full ${t.bg} text-[11px] font-bold text-white`}>
                      {t.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="text-[14px] font-semibold text-gray-900">{t.name}</p>
                      <p className="text-[12px] text-gray-500">{t.role}</p>
                    </div>
                  </div>
                </div>
              </ScrollFadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          ROI CALCULATOR — Make it personal
          ═══════════════════════════════════════════════════════ */}
      <section className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <ScrollFadeIn>
            <div className="mx-auto max-w-2xl text-center mb-14">
              <p className="text-[13px] font-semibold uppercase tracking-widest text-brand-600">Your savings</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl lg:text-[2.75rem]">
                How much could you save?
              </h2>
              <p className="mt-4 text-lg text-gray-500">
                Drag the slider. See your numbers.
              </p>
            </div>
          </ScrollFadeIn>
          <ROICalculator />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          PRICING — Simple. Transparent. No BS.
          ═══════════════════════════════════════════════════════ */}
      <section className="bg-gray-50/50 py-24 sm:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <ScrollFadeIn>
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-[13px] font-semibold uppercase tracking-widest text-brand-600">Pricing</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl lg:text-[2.75rem]">
                One quote pays for your entire year
              </h2>
            </div>
          </ScrollFadeIn>

          <div className="mx-auto mt-16 max-w-lg">
            <ScrollFadeIn delay={0}>
              <div className="relative flex flex-col rounded-3xl bg-gray-900 p-8 sm:p-10 shadow-2xl shadow-gray-900/20 ring-1 ring-gray-800">
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-brand-500 px-5 py-1.5 text-[12px] font-bold text-white shadow-lg shadow-brand-500/30">
                  14-Day Free Trial
                </div>
                <div className="text-center">
                  <p className="mt-4 flex items-baseline justify-center gap-1">
                    <span className="text-[52px] font-bold tracking-tight text-white">$79</span>
                    <span className="text-[15px] text-gray-500">/mo</span>
                  </p>
                  <p className="mt-1.5 text-[13px] text-gray-500">$63/mo billed annually &mdash; save 20%</p>
                  <p className="mt-1 text-[13px] text-gray-400">No card required to start</p>
                </div>
                <ul className="mt-10 space-y-4 flex-1">
                  {[
                    'Unlimited quotes',
                    'AI-powered quote generation',
                    'SMS & email delivery',
                    'Online payments & e-signatures',
                    'Good / Better / Best pricing tiers',
                    'Automated follow-up sequences',
                    'CRM pipeline & scheduling',
                    'Custom branding & logo',
                    'iOS & web app',
                    'Priority support',
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-[14px] text-gray-300">
                      <svg className="h-5 w-5 shrink-0 text-brand-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                      {item}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/auth/signup"
                  className="mt-10 block rounded-full bg-brand-600 py-3.5 text-center text-[15px] font-semibold text-white shadow-lg shadow-brand-600/25 transition-all hover:bg-brand-500 active:scale-[0.97]"
                >
                  Start 14-Day Free Trial
                </Link>
                <p className="mt-4 flex items-center justify-center gap-1.5 text-[12px] text-gray-500">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>
                  30-day money-back guarantee
                </p>
              </div>
            </ScrollFadeIn>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          TRADES BAR — Shows breadth
          ═══════════════════════════════════════════════════════ */}
      <section className="border-y border-gray-100 bg-white py-10">
        <div className="mx-auto max-w-6xl px-6">
          <p className="text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-400">
            Built for every trade
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-[14px] font-medium text-gray-400">
            {[
              { label: 'Roofing', d: 'M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205l3 1m1.5.5l-1.5-.5M6.75 7.364V3h-3v18m3-13.636l10.5-3.819' },
              { label: 'HVAC', d: 'M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z' },
              { label: 'Plumbing', d: 'M21.75 6.75a4.5 4.5 0 01-4.884 4.484c-1.076-.091-2.264.071-2.95.904l-7.152 8.684a2.548 2.548 0 11-3.586-3.586l8.684-7.152c.833-.686.995-1.874.904-2.95a4.5 4.5 0 016.336-4.486l-3.276 3.276a3.004 3.004 0 002.25 2.25l3.276-3.276c.256.565.398 1.192.398 1.852z' },
              { label: 'Electrical', d: 'M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z' },
              { label: 'Painting', d: 'M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42' },
              { label: 'Contracting', d: 'M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21' },
            ].map(trade => (
              <span key={trade.label} className="flex items-center gap-2">
                <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d={trade.d} /></svg>
                {trade.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          FAQ
          ═══════════════════════════════════════════════════════ */}
      <section className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <ScrollFadeIn>
            <div className="mx-auto max-w-2xl text-center mb-14">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Frequently Asked Questions
              </h2>
            </div>
          </ScrollFadeIn>
          <FAQAccordion />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          FINAL CTA — Make it impossible to say no
          ═══════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden py-28 sm:py-36">
        {/* Rich gradient background */}
        <div className="absolute inset-0 bg-gray-900" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.15),transparent_60%)]" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-400/40 to-transparent" />

        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <ScrollFadeIn>
            {/* Launch pulse */}
            <div className="mb-10 inline-flex items-center gap-2.5 rounded-full bg-white/[0.08] px-5 py-2 text-[13px] font-semibold text-white ring-1 ring-white/[0.12] backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-400" />
              </span>
              Now live on the App Store
            </div>
          </ScrollFadeIn>

          <ScrollFadeIn delay={80}>
            <h2 className="text-[clamp(2rem,5vw,3.25rem)] font-bold tracking-tight text-white leading-[1.1]">
              Stop losing jobs<br className="hidden sm:block" /> to slow quotes.
            </h2>
          </ScrollFadeIn>

          <ScrollFadeIn delay={160}>
            <p className="mx-auto mt-6 max-w-lg text-[18px] leading-relaxed text-gray-400">
              Join hundreds of contractors sending proposals in seconds, not hours. Try free for 14 days.
            </p>
          </ScrollFadeIn>

          <ScrollFadeIn delay={240}>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/auth/signup"
                className="rounded-full bg-white px-12 py-[18px] text-[17px] font-semibold text-gray-900 shadow-xl shadow-white/10 transition-all hover:bg-gray-100 active:scale-[0.97]"
              >
                Start Free Trial
              </Link>
              <a
                href="https://apps.apple.com/app/snapquote"
                className="flex items-center gap-2.5 rounded-full bg-white/[0.08] px-8 py-4 text-[15px] font-semibold text-white ring-1 ring-white/[0.12] backdrop-blur-sm transition-all hover:bg-white/[0.12] active:scale-[0.97]"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
                Download for iOS
              </a>
            </div>
          </ScrollFadeIn>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          FOOTER — Clean, minimal, confident
          ═══════════════════════════════════════════════════════ */}
      <footer className="border-t border-gray-100 bg-white py-10">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
            <div className="flex items-center gap-4">
              <SnapQuoteLogo size="xs" />
              <span className="text-[13px] text-gray-400">&copy; 2026 SnapQuote</span>
            </div>
            <nav aria-label="Footer" className="flex items-center gap-6">
              <Link href="/blog" className="text-[13px] text-gray-400 transition hover:text-gray-600">Blog</Link>
              <Link href="/privacy" className="text-[13px] text-gray-400 transition hover:text-gray-600">Privacy</Link>
              <Link href="/terms" className="text-[13px] text-gray-400 transition hover:text-gray-600">Terms</Link>
              <a href="mailto:support@snapquote.dev" className="text-[13px] text-gray-400 transition hover:text-gray-600">Support</a>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}
