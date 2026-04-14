import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { SnapQuoteLogo } from '@/components/SnapQuoteLogo';
import ScrollFadeIn from './(marketing)/ScrollFadeIn';

const displayClass = 'font-sans';

const proofRail = [
  {
    value: 'Photo proof',
    label: 'Start with the roof photos you already captured on site.',
  },
  {
    value: 'Scope drafted',
    label: 'AI turns those photos into findings, scope, and pricing in one pass.',
  },
  {
    value: 'Sign + deposit',
    label: 'The customer can approve and pay inside the same polished proposal.',
  },
  {
    value: 'Field-ready CRM',
    label: 'Follow-up, schedule, maps, and job details stay usable from the truck.',
  },
];

const heroPreviewPoints = [
  {
    title: 'Findings',
    body: 'Show the damage clearly.',
  },
  {
    title: 'Scope',
    body: 'Price it cleanly.',
  },
  {
    title: 'Close',
    body: 'Get approval and deposit.',
  },
];

const proposalReasons = [
  {
    title: 'It looks like a serious company sent it',
    body: 'The layout feels polished and trustworthy before the customer even gets to the price.',
  },
  {
    title: 'The damage is easier to understand',
    body: 'Photos and findings make the job feel concrete instead of sounding like a rough estimate.',
  },
  {
    title: 'The next step is right there',
    body: 'Signature and deposit stay in the same flow, so the sale does not cool off.',
  },
];

const workflow = [
  {
    step: '01',
    title: 'Snap the property',
    body: 'Take the exterior photos and notes while you are already walking the job.',
  },
  {
    step: '02',
    title: 'Let AI build the proposal',
    body: 'SnapQuote turns those photos into a customer-ready quote with findings, scope, and pricing.',
  },
  {
    step: '03',
    title: 'Send, sign, and collect',
    body: 'The customer reviews a polished proposal, then approves and pays without leaving the flow.',
  },
];

const crmMoments = [
  {
    title: 'Cleaner follow-up on mobile',
    body: 'Pipeline and next actions stay obvious when you are in a truck, on a roof, or between jobs.',
  },
  {
    title: 'Scheduling that feels field-ready',
    body: 'Calendar, addresses, and job details stay readable enough to use fast without fighting the screen.',
  },
  {
    title: 'The whole job stays connected',
    body: 'Quote, customer, payment, notes, and schedule live in one place instead of getting scattered later.',
  },
];

const proofSectionPoints = [
  {
    title: 'Built by a contractor',
    body: 'SnapQuote was shaped around the moment roofers actually lose jobs: when the homeowner is waiting and the quote is still stuck in your head or your truck.',
  },
  {
    title: 'The customer sees the problem first',
    body: 'Photos, findings, scope, and price land in one clean flow so the number feels justified instead of dropped out of nowhere.',
  },
  {
    title: 'The close happens in the same motion',
    body: 'Signature and deposit live inside the proposal, so you do not have to send another document once the homeowner is ready.',
  },
];

const resourceLinks = [
  {
    href: '/roofing-proposal-software',
    title: 'Roofing proposal software',
    body: 'See the roofing-first product page built around AI proposals, signatures, and deposits.',
  },
  {
    href: '/roofing-proposal-template',
    title: 'Roofing proposal template',
    body: 'Use a real proposal structure as your model, then automate the whole thing with SnapQuote.',
  },
  {
    href: '/roofing-estimate-template',
    title: 'Roofing estimate template',
    body: 'Own the pricing-first version of the workflow before the estimate turns into a full proposal.',
  },
  {
    href: '/roofing-quote-template',
    title: 'Roofing quote template',
    body: 'See the shorter customer-facing format that turns a number into a cleaner yes.',
  },
  {
    href: '/roof-inspection-report-template',
    title: 'Roof inspection report template',
    body: 'Document the roof condition clearly so the final quote feels earned and easier to trust.',
  },
  {
    href: '/compare',
    title: 'Roofing software comparisons',
    body: 'Compare SnapQuote against Roofr, Jobber, ServiceTitan, JobNimbus, and other contractor tools.',
  },
];

export const metadata: Metadata = {
  title: 'SnapQuote | AI Roofing Proposal Software for Contractors',
  description:
    'Snap a roof photo and let AI build a polished proposal with findings, scope, signature, and deposit built in. Roofing-first quoting software for contractors.',
  keywords: [
    'roofing proposal software',
    'roofing quote software',
    'ai roofing estimate software',
    'roofing sales app',
    'roof quote generator',
  ],
  alternates: {
    canonical: 'https://snapquote.dev',
  },
  openGraph: {
    title: 'SnapQuote | AI Roofing Proposal Software for Contractors',
    description:
      'Snap a roof photo and let AI build a polished proposal with findings, scope, signature, and deposit built in.',
    url: 'https://snapquote.dev',
    type: 'website',
    images: [
      {
        url: 'https://snapquote.dev/api/og?title=SnapQuote&subtitle=AI+Roofing+Proposal+Software',
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SnapQuote | AI Roofing Proposal Software for Contractors',
    description:
      'Snap a roof photo and let AI build a polished proposal with findings, scope, signature, and deposit built in.',
    images: ['https://snapquote.dev/api/og?title=SnapQuote&subtitle=AI+Roofing+Proposal+Software'],
  },
};

function SectionEyebrow({
  children,
  dark = true,
}: {
  children: ReactNode;
  dark?: boolean;
}) {
  return (
    <p
      className={`text-[12px] font-semibold uppercase tracking-[0.28em] ${
        dark ? 'text-white/55' : 'text-slate-500'
      }`}
    >
      {children}
    </p>
  );
}

function HeroProductPlane({ className = '' }: { className?: string }) {
  return (
    <div className={`relative mx-auto w-full max-w-[21rem] sm:max-w-[24rem] xl:max-w-[31rem] ${className}`}>
      <div
        className="absolute inset-x-[14%] top-[10%] h-[70%] rounded-full bg-[#2E7BFF]/28 blur-[72px]"
        style={{ animation: 'landing-breathe 7s ease-in-out infinite' }}
        aria-hidden="true"
      />
      <div
        className="relative overflow-hidden rounded-[2.2rem] border border-white/14 bg-black/24 p-3 shadow-[0_40px_120px_rgba(0,0,0,0.42)] backdrop-blur-2xl"
        style={{ animation: 'landing-float 9s ease-in-out infinite 0.35s' }}
      >
        <div className="overflow-hidden rounded-[1.7rem] border border-white/10 bg-[#09101a]">
          <div className="flex items-center justify-between border-b border-white/8 px-4 pb-3 pt-4 sm:px-5">
            <div className="flex min-w-0 items-center gap-2.5">
              <SnapQuoteLogo size="xs" variant="mark" />
              <div className="min-w-0">
                <p className="truncate text-[13px] font-semibold text-white">Proposal ready to send</p>
                <p className="truncate text-[11px] text-white/45">Built from on-site photos</p>
              </div>
            </div>
            <span className="shrink-0 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/72">
              Roofing quote
            </span>
          </div>

          <img
            src="/landing-proposal-preview-v2.png"
            alt="SnapQuote proposal preview showing a polished customer-ready quote with findings and payment flow"
            className="h-[18rem] w-full object-cover object-top sm:h-[20rem] xl:h-[23rem]"
          />

          <div className="grid grid-cols-3 gap-2 border-t border-white/8 bg-slate-950 px-3 py-3 sm:px-4">
            {heroPreviewPoints.map((item, index) => (
              <div
                key={item.title}
                className="rounded-[1rem] border border-white/10 bg-white/[0.04] px-3 py-3"
                style={{ animation: `landing-rise 0.45s ease-out ${index * 90}ms both` }}
              >
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/72">{item.title}</p>
                <p className="mt-1 text-[11px] leading-relaxed text-white/52">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductPhone({
  src,
  alt,
  className = '',
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  return (
    <div
      className={`overflow-hidden rounded-[2.4rem] border border-white/10 bg-white/[0.04] p-2 shadow-[0_35px_100px_rgba(0,0,0,0.4)] ${className}`}
    >
      <div className="overflow-hidden rounded-[1.8rem] bg-[#eef2f8]">
        <img src={src} alt={alt} className="h-full w-full object-cover object-top" />
      </div>
    </div>
  );
}

function HomeProofBoard() {
  return (
    <div className="relative overflow-hidden rounded-[2.2rem] border border-slate-200 bg-slate-950 p-5 shadow-[0_35px_120px_rgba(15,23,42,0.22)] sm:p-6">
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 18% 18%, rgba(46,123,255,0.18), transparent 24%), radial-gradient(circle at 82% 12%, rgba(255,255,255,0.08), transparent 20%)',
        }}
        aria-hidden="true"
      />

      <div className="relative grid gap-4">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,0.68fr)_minmax(0,1.32fr)]">
          <div className="overflow-hidden rounded-[1.6rem] border border-white/10 bg-white/[0.04]">
            <img
              src="/landing-hero-photo-v2.png"
              alt="Job-site roof photo used as the start of the SnapQuote workflow"
              className="h-48 w-full object-cover object-center"
            />
            <div className="p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45">Job-site photo</p>
              <p className="mt-2 text-[14px] leading-relaxed text-white/74">
                The workflow starts with what you actually saw on the property, not a blank proposal screen later that
                night.
              </p>
            </div>
          </div>

          <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.05] p-4 sm:p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8cb9ff]">AI proof stack</p>
                <p className="mt-2 text-[22px] font-semibold tracking-tight text-white">The customer sees the case before the price.</p>
              </div>
              <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/68">
                Driveway ready
              </span>
            </div>

            <div className="mt-5 space-y-3">
              {[
                ['Lifted shingles on rear slope', 'Documented'],
                ['Flashing wear around vent stack', 'In findings'],
                ['Replace underlayment + ridge system', 'In scope'],
              ].map(([label, status]) => (
                <div
                  key={label}
                  className="flex items-center justify-between gap-4 rounded-[1rem] border border-white/10 bg-black/20 px-4 py-3"
                >
                  <span className="text-[14px] font-medium text-white/84">{label}</span>
                  <span className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-slate-950">{status}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-[1.25rem] bg-white px-4 py-4 text-slate-950">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Customer next step</p>
                  <p className="mt-1 text-[16px] font-semibold">Review proposal, sign, and pay deposit</p>
                </div>
                <span className="rounded-full bg-[#2E7BFF] px-4 py-2 text-[12px] font-semibold text-white">Ready</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {['Photos attached to the quote', 'Findings and scope drafted together', 'Signature and deposit in one flow'].map((item) => (
            <div key={item} className="rounded-[1rem] border border-white/10 bg-white/[0.04] px-4 py-3 text-[13px] font-semibold text-white/72">
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'SnapQuote',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'iOS, Web',
    description:
      'AI-powered quoting and CRM platform for contractors. Build professional proposals from job-site photos and get paid faster.',
    url: 'https://snapquote.dev',
    offers: {
      '@type': 'Offer',
      price: '79',
      priceCurrency: 'USD',
      billingPeriod: 'P1M',
      description: '14-day free trial',
    },
  };

  return (
    <div className="force-light min-h-dvh bg-[#05070b] text-white antialiased">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main>
        <section className="relative overflow-hidden border-b border-white/10 bg-[#05070b]">
          <img
            src="/landing-hero-photo-v2.png"
            alt="A residential property photographed on site, representing the kind of job SnapQuote turns into a polished proposal"
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(90deg, rgba(5,7,11,0.88) 0%, rgba(5,7,11,0.74) 34%, rgba(5,7,11,0.42) 58%, rgba(5,7,11,0.66) 100%), linear-gradient(180deg, rgba(5,7,11,0.12) 0%, rgba(5,7,11,0.22) 45%, rgba(5,7,11,0.76) 100%)',
            }}
            aria-hidden="true"
          />
          <div
            className="absolute inset-0 opacity-90"
            style={{
              backgroundImage:
                'radial-gradient(circle at 18% 18%, rgba(46,123,255,0.22), transparent 28%), radial-gradient(circle at 78% 24%, rgba(255,255,255,0.08), transparent 22%)',
            }}
            aria-hidden="true"
          />

          <nav className="absolute inset-x-0 top-0 z-30">
            <div className="mx-auto flex h-[4.75rem] max-w-7xl items-center justify-between px-6">
              <Link href="/" aria-label="SnapQuote home" className="inline-flex items-center gap-3">
                <SnapQuoteLogo size="sm" variant="mark" />
                <span className={`text-[1.08rem] font-semibold tracking-tight text-white ${displayClass}`}>
                  Snap<span className="text-[#8cb9ff]">Quote</span>
                </span>
              </Link>

              <div className="flex items-center gap-2">
                <Link
                  href="/auth/login"
                  className="rounded-full px-4 py-2 text-[14px] font-medium text-white/68 transition-colors hover:text-white"
                >
                  Log In
                </Link>
                <Link
                  href="/auth/signup"
                  className="rounded-full bg-white px-5 py-2 text-[14px] font-semibold text-slate-950 transition-all hover:bg-slate-100 active:scale-[0.97]"
                >
                  Start Free
                </Link>
              </div>
            </div>
          </nav>

          <div className="relative z-20 mx-auto flex min-h-[100svh] max-w-7xl flex-col justify-end px-6 pb-9 pt-28 sm:pb-10 lg:pt-32">
            <div className="grid items-end gap-12 lg:grid-cols-[minmax(0,34rem)_minmax(0,1fr)] lg:gap-14">
              <div className="max-w-[25rem] sm:max-w-[36rem]">
                <ScrollFadeIn>
                  <p className="text-[13px] font-semibold uppercase tracking-[0.24em] text-[#8cb9ff]">
                    SnapQuote
                  </p>
                </ScrollFadeIn>

                <ScrollFadeIn delay={70}>
                  <h1
                    className={`mt-5 text-[clamp(3.3rem,13vw,6.9rem)] font-bold leading-[0.92] tracking-[-0.055em] text-white ${displayClass}`}
                  >
                    <span className="block">Snap a photo.</span>
                    <span className="block">AI builds the</span>
                    <span className="block">proposal.</span>
                  </h1>
                </ScrollFadeIn>

                <ScrollFadeIn delay={140}>
                  <p className="mt-5 max-w-[21rem] text-[18px] leading-relaxed text-white/72 sm:max-w-[30rem] sm:text-[19px]">
                    Turn on-site photos into a polished roofing proposal, then get signature and deposit before you
                    leave the property.
                  </p>
                </ScrollFadeIn>

                <ScrollFadeIn delay={210}>
                  <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                    <Link
                      href="/auth/signup"
                      className="rounded-full bg-[#2E7BFF] px-7 py-4 text-center text-[15px] font-semibold text-white shadow-[0_18px_40px_rgba(46,123,255,0.28)] transition-all hover:brightness-110 active:scale-[0.97]"
                    >
                      Start Free for 14 Days
                    </Link>
                    <a
                      href="#proof"
                      className="rounded-full border border-white/14 bg-white/[0.06] px-7 py-4 text-center text-[15px] font-semibold text-white/84 backdrop-blur-xl transition-all hover:bg-white/[0.1] hover:text-white active:scale-[0.97]"
                    >
                      See the Proof
                    </a>
                  </div>
                </ScrollFadeIn>

                <ScrollFadeIn delay={280}>
                  <div className="mt-7 flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] text-white/54">
                    <span>Roofing-first</span>
                    <span className="h-1 w-1 rounded-full bg-white/18" />
                    <span>14-day free trial</span>
                    <span className="h-1 w-1 rounded-full bg-white/18" />
                    <span>$79/month after</span>
                    <span className="h-1 w-1 rounded-full bg-white/18" />
                    <span>Web + iPhone</span>
                  </div>
                </ScrollFadeIn>
              </div>

              <ScrollFadeIn delay={170} className="lg:justify-self-end">
                <HeroProductPlane />
              </ScrollFadeIn>
            </div>

            <div className="mt-10 border-t border-white/10 pt-6 sm:mt-12 sm:pt-7">
              <div className="grid gap-6 md:grid-cols-4 md:gap-0">
                {proofRail.map((item, index) => (
                  <ScrollFadeIn key={item.value} delay={index * 70}>
                    <div className={`md:px-6 ${index > 0 ? 'md:border-l md:border-white/10' : ''}`}>
                      <p className={`text-[1.55rem] font-bold tracking-tight text-white ${displayClass}`}>{item.value}</p>
                      <p className="mt-2 max-w-[17rem] text-[13px] leading-relaxed text-white/56">{item.label}</p>
                    </div>
                  </ScrollFadeIn>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="proof" className="bg-[#edf2f7] py-20 text-[#081019] sm:py-24">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid items-start gap-14 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-20">
              <div className="max-w-[31rem]">
                <ScrollFadeIn>
                  <SectionEyebrow dark={false}>Proof the roofer can feel</SectionEyebrow>
                  <h2
                    className={`mt-4 max-w-[12ch] text-[clamp(2.4rem,5vw,4.5rem)] font-bold leading-[0.98] tracking-[-0.045em] text-slate-950 ${displayClass}`}
                  >
                    This is built for the moment the homeowner is waiting.
                  </h2>
                  <p className="mt-5 max-w-[31rem] text-[16px] leading-relaxed text-slate-600">
                    SnapQuote was built by a contractor who got tired of taking proposals home, typing them at night,
                    and cooling off the sale. The proof is not a dashboard. It is the fact that the customer sees the
                    roof photos, the scope, the price, and the next step in one clean flow.
                  </p>
                </ScrollFadeIn>

                <div className="mt-10 space-y-5">
                  {proofSectionPoints.map((item, index) => (
                    <ScrollFadeIn key={item.title} delay={index * 90}>
                      <div className="border-t border-slate-200 pt-5 first:border-t-0 first:pt-0">
                        <p className="text-[18px] font-semibold text-slate-950">{item.title}</p>
                        <p className="mt-2 text-[14px] leading-relaxed text-slate-600">{item.body}</p>
                      </div>
                    </ScrollFadeIn>
                  ))}
                </div>
              </div>

              <ScrollFadeIn delay={130}>
                <HomeProofBoard />
              </ScrollFadeIn>
            </div>
          </div>
        </section>

        <section id="proposal" className="bg-[#f3f5f8] py-20 text-[#081019] sm:py-24">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid items-start gap-14 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-20">
              <ScrollFadeIn>
                <div className="overflow-hidden rounded-[2.1rem] border border-slate-200 bg-white shadow-[0_35px_120px_rgba(15,23,42,0.12)]">
                  <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-4 sm:px-6">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-sky-600">
                        Customer-ready proposal
                      </p>
                      <p className="mt-1 text-[13px] text-slate-500">Built from the photos you already captured on site</p>
                    </div>
                    <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                      Roofing quote
                    </span>
                  </div>
                  <img
                    src="/landing-proposal-preview-v2.png"
                    alt="A full SnapQuote proposal preview showing inspection proof, pricing, and customer-facing trust elements"
                    className="w-full object-cover object-top"
                  />
                </div>
              </ScrollFadeIn>

              <div className="max-w-xl">
                <ScrollFadeIn>
                  <SectionEyebrow dark={false}>Why customers say yes faster</SectionEyebrow>
                  <h2
                    className={`mt-4 max-w-[11ch] text-[clamp(2.5rem,5vw,4.6rem)] font-bold leading-[0.98] tracking-[-0.045em] text-slate-950 ${displayClass}`}
                  >
                    The proposal does the trust-building for you.
                  </h2>
                  <p className="mt-5 max-w-[30rem] text-[16px] leading-relaxed text-slate-600">
                    Instead of sending a rough estimate, you send something that explains the job clearly, looks premium,
                    and gives the customer a clean place to sign and pay.
                  </p>
                </ScrollFadeIn>

                <div className="mt-10 space-y-5">
                  {proposalReasons.map((item, index) => (
                    <ScrollFadeIn key={item.title} delay={index * 90}>
                      <div className="border-t border-slate-200 pt-5 first:border-t-0 first:pt-0">
                        <p className="text-[18px] font-semibold text-slate-950">{item.title}</p>
                        <p className="mt-2 text-[14px] leading-relaxed text-slate-600">{item.body}</p>
                      </div>
                    </ScrollFadeIn>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-16 grid gap-6 border-t border-slate-200 pt-8 md:grid-cols-3">
              {workflow.map((item, index) => (
                <ScrollFadeIn key={item.step} delay={index * 90}>
                  <div className={`md:px-5 ${index > 0 ? 'md:border-l md:border-slate-200' : ''}`}>
                    <p className={`text-[1.05rem] font-bold tracking-tight text-[#2E7BFF] ${displayClass}`}>{item.step}</p>
                    <p className="mt-3 text-[18px] font-semibold text-slate-950">{item.title}</p>
                    <p className="mt-2 max-w-[19rem] text-[14px] leading-relaxed text-slate-600">{item.body}</p>
                  </div>
                </ScrollFadeIn>
              ))}
            </div>
          </div>
        </section>

        <section className="overflow-hidden border-y border-white/10 bg-[#06090f] py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid items-start gap-14 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:gap-20">
              <div className="max-w-[30rem]">
                <ScrollFadeIn>
                  <SectionEyebrow>Everything after the quote</SectionEyebrow>
                  <h2
                    className={`mt-4 max-w-[11ch] text-[clamp(2.4rem,5vw,4.4rem)] font-bold leading-[0.98] tracking-[-0.045em] text-white ${displayClass}`}
                  >
                    The CRM still feels fast when you are on the move.
                  </h2>
                  <p className="mt-5 text-[16px] leading-relaxed text-white/62">
                    SnapQuote hooks contractors with the proposal, then keeps follow-up, schedule, maps, customer
                    details, and payments clear enough to use from a phone.
                  </p>
                </ScrollFadeIn>

                <div className="mt-10 space-y-5">
                  {crmMoments.map((item, index) => (
                    <ScrollFadeIn key={item.title} delay={index * 90}>
                      <div className="border-t border-white/10 pt-5 first:border-t-0 first:pt-0">
                        <p className="text-[18px] font-semibold text-white">{item.title}</p>
                        <p className="mt-2 text-[14px] leading-relaxed text-white/58">{item.body}</p>
                      </div>
                    </ScrollFadeIn>
                  ))}
                </div>
              </div>

              <div className="relative">
                <div className="grid gap-5 md:grid-cols-2 lg:min-h-[48rem]">
                  <ScrollFadeIn delay={100} className="lg:absolute lg:left-0 lg:top-16 lg:w-[45%]">
                    <ProductPhone
                      src="/landing-mobile-pipeline.png"
                      alt="SnapQuote mobile pipeline showing grouped follow-up and quote workflow"
                    />
                  </ScrollFadeIn>

                  <ScrollFadeIn delay={180} className="lg:absolute lg:right-0 lg:top-0 lg:w-[45%]">
                    <ProductPhone
                      src="/landing-mobile-schedule.png"
                      alt="SnapQuote mobile schedule showing calendar and job details"
                    />
                  </ScrollFadeIn>
                </div>

                <ScrollFadeIn delay={240}>
                  <div className="mt-6 rounded-[1.8rem] border border-white/10 bg-white/[0.05] px-5 py-5 text-white/74 backdrop-blur-xl lg:absolute lg:bottom-6 lg:left-[16%] lg:right-[12%]">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/46">
                      Mobile-first by design
                    </p>
                    <p className="mt-2 text-[15px] leading-relaxed">
                      Quote, follow-up, schedule, and directions stay one or two taps away instead of feeling like back-office software crammed onto a phone.
                    </p>
                  </div>
                </ScrollFadeIn>
              </div>
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden bg-[#05070b] py-20 sm:py-24">
          <img
            src="/landing-hero-photo-v2.png"
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-center opacity-[0.12]"
            aria-hidden="true"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(180deg, rgba(5,7,11,0.82) 0%, rgba(5,7,11,0.94) 100%), radial-gradient(circle at 22% 12%, rgba(46,123,255,0.18), transparent 28%)',
            }}
            aria-hidden="true"
          />

          <div className="relative mx-auto max-w-6xl px-6">
            <ScrollFadeIn>
              <SectionEyebrow>Ready to see it live</SectionEyebrow>
              <div className="mt-5 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-3xl">
                  <h2
                    className={`text-[clamp(2.7rem,5vw,4.8rem)] font-bold leading-[0.95] tracking-[-0.05em] text-white ${displayClass}`}
                  >
                    Start closing before you leave the property.
                  </h2>
                  <p className="mt-5 max-w-2xl text-[16px] leading-relaxed text-white/62">
                    Start the 14-day trial, build a quote from real job-site photos, and feel what contractor-first quoting
                    looks like when the proposal is this polished and the CRM stays this usable on mobile.
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/auth/signup"
                    className="rounded-full bg-[#2E7BFF] px-7 py-4 text-center text-[15px] font-semibold text-white shadow-[0_18px_40px_rgba(46,123,255,0.28)] transition-all hover:brightness-110 active:scale-[0.97]"
                  >
                    Start Free
                  </Link>
                  <Link
                    href="/auth/login"
                    className="rounded-full border border-white/12 bg-white/[0.05] px-7 py-4 text-center text-[15px] font-semibold text-white/82 backdrop-blur-xl transition-all hover:bg-white/[0.09] hover:text-white active:scale-[0.97]"
                  >
                    Log In
                  </Link>
                </div>
              </div>

              <div className="mt-7 flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] text-white/48">
                <span>Built for contractors</span>
                <span className="h-1 w-1 rounded-full bg-white/16" />
                <span>14-day free trial</span>
                <span className="h-1 w-1 rounded-full bg-white/16" />
                <span>Signature + deposit built in</span>
              </div>
            </ScrollFadeIn>

            <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {resourceLinks.map((item, index) => (
                <ScrollFadeIn key={item.href} delay={index * 70}>
                  <Link
                    href={item.href}
                    className="block rounded-[1.6rem] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl transition-all hover:border-white/18 hover:bg-white/[0.07]"
                  >
                    <p className="text-[15px] font-semibold text-white">{item.title}</p>
                    <p className="mt-2 text-[13px] leading-relaxed text-white/56">{item.body}</p>
                  </Link>
                </ScrollFadeIn>
              ))}
            </div>

            <footer className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-6 text-[13px] text-white/42 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-3">
                <span>SnapQuote</span>
                <span className="h-1 w-1 rounded-full bg-white/16" />
                <span>AI proposals for contractors</span>
                <span className="h-1 w-1 rounded-full bg-white/16" />
                <span>2026</span>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <Link href="/roofing-proposal-template" className="transition-colors hover:text-white/70">
                  Proposal Template
                </Link>
                <Link href="/compare" className="transition-colors hover:text-white/70">
                  Compare
                </Link>
                <Link href="/tools" className="transition-colors hover:text-white/70">
                  Tools
                </Link>
                <Link href="/glossary" className="transition-colors hover:text-white/70">
                  Glossary
                </Link>
                <Link href="/blog" className="transition-colors hover:text-white/70">
                  Blog
                </Link>
                <Link href="/privacy" className="transition-colors hover:text-white/70">
                  Privacy
                </Link>
                <Link href="/terms" className="transition-colors hover:text-white/70">
                  Terms
                </Link>
              </div>
            </footer>
          </div>
        </section>
      </main>
    </div>
  );
}
