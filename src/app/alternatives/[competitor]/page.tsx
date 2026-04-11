import Link from 'next/link';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SnapQuoteLogo } from '@/components/SnapQuoteLogo';

interface AlternativeData {
  name: string;
  slug: string;
  competitorDescription: string;
  keyReasons: { title: string; body: string }[];
  pricing: string;
  compareSlug: string; // corresponds to /compare/snapquote-vs-X slug
}

const alternatives: Record<string, AlternativeData> = {
  jobber: {
    name: 'Jobber',
    slug: 'jobber',
    compareSlug: 'jobber',
    pricing: '$39-249/mo',
    competitorDescription:
      'Jobber is a popular all-in-one field service management platform covering scheduling, invoicing, dispatching, and CRM for home service trades.',
    keyReasons: [
      {
        title: 'You Need Quoting Speed, Not a Full CRM',
        body: 'Jobber is a platform. SnapQuote is a scalpel for one specific pain: turning a roof walk into a professional proposal in 60 seconds. If quoting is your bottleneck, a full CRM is the wrong fix.',
      },
      {
        title: 'AI-Generated vs Manual Entry',
        body: "Jobber's quoting is essentially a digital form. SnapQuote uses Claude Vision AI to read your roof photos and draft the entire quote for you. Sixty seconds vs fifteen minutes per quote, multiplied by every proposal you send.",
      },
      {
        title: 'Cheaper Without Losing the Job',
        body: "Jobber's Grow tier — where most of the features contractors actually want live — is $249/mo. SnapQuote is $79/mo flat. Save $2,000+/year and still close jobs faster.",
      },
      {
        title: 'Zero Setup',
        body: "Jobber takes days to configure properly — services, team permissions, scheduling rules, tax settings. SnapQuote works in five minutes. Take a photo, send a quote.",
      },
    ],
  },
  roofr: {
    name: 'Roofr',
    slug: 'roofr',
    compareSlug: 'roofr',
    pricing: '$99-399/mo',
    competitorDescription:
      'Roofr is a roofing-specific CRM with satellite measurement tools, proposals, and project tracking — built for roofing companies wanting an all-in-one solution.',
    keyReasons: [
      {
        title: 'AI Beats Satellite Measurement for Speed',
        body: "Roofr's measurement tool is solid, but you still manually build the proposal around it. SnapQuote's AI drafts the full proposal from your walk-around photos — no stopping to measure, trace, or fill in templates.",
      },
      {
        title: 'Focused Tool vs Full CRM',
        body: "Roofr wants to be your whole CRM — pipeline, projects, team collaboration. SnapQuote is laser-focused on quoting and close-the-job flow. Cheaper, simpler, and faster where it matters.",
      },
      {
        title: 'Flat Pricing vs Tiered',
        body: 'Roofr has tiered pricing that climbs quickly as you unlock features. SnapQuote is $79/mo flat, unlimited, forever. No surprises when your team grows.',
      },
      {
        title: 'You Can Use Both',
        body: "If you already use Roofr for CRM and project tracking, SnapQuote can still be your front-end quoting tool. Generate the AI quote in 60 seconds, then feed the signed job into Roofr for production.",
      },
    ],
  },
  servicetitan: {
    name: 'ServiceTitan',
    slug: 'servicetitan',
    compareSlug: 'servicetitan',
    pricing: 'Custom, typically $300+/mo per user',
    competitorDescription:
      'ServiceTitan is the leading enterprise field service management platform, built for mid-market and enterprise trades with dispatch boards, call centers, and advanced reporting.',
    keyReasons: [
      {
        title: "You're Not Running 20 Trucks",
        body: 'ServiceTitan is priced and built for 10+ tech operations. If you run 1-5 trucks, you are paying for infrastructure you will never use. SnapQuote starts at $79/mo flat — no sales call, no custom quote.',
      },
      {
        title: 'Start in 5 Minutes, Not 6 Weeks',
        body: 'ServiceTitan implementations take weeks with a dedicated specialist. SnapQuote works immediately — download, photo, quote, send.',
      },
      {
        title: 'Transparent Pricing',
        body: "ServiceTitan won't show you pricing without a demo. SnapQuote is listed publicly. Start a free trial yourself in under a minute.",
      },
      {
        title: 'One Problem, Solved Well',
        body: "ServiceTitan does everything. If all you need is to quote faster, paying $400+/mo per user for features you don't use is a bad trade.",
      },
    ],
  },
  jobnimbus: {
    name: 'JobNimbus',
    slug: 'jobnimbus',
    compareSlug: 'jobnimbus',
    pricing: '$25-75/mo per user',
    competitorDescription:
      'JobNimbus is a roofing and contractor CRM with full pipeline management, workflows, and team collaboration — recently expanded with SumoQuote proposal templates.',
    keyReasons: [
      {
        title: 'Flat Pricing Beats Per-User',
        body: 'JobNimbus charges per user. Small teams get expensive fast. SnapQuote is $79/mo flat regardless of how many people on your team use it.',
      },
      {
        title: 'AI Photos vs Manual Templates',
        body: "JobNimbus (via SumoQuote) offers proposal templates you fill in by hand. SnapQuote's AI reads your roof photos and generates the proposal automatically.",
      },
      {
        title: 'Focused Over Full-Stack',
        body: "JobNimbus is a real CRM — pipelines, workflows, automations. Great if you need that. If you just need proposals to go out faster, SnapQuote is a cheaper, simpler tool for that specific job.",
      },
      {
        title: 'Grow Into Other Tools',
        body: "Use SnapQuote for quoting now. If you eventually need a full CRM, add JobNimbus or another tool then. You don't have to buy all your tooling at once.",
      },
    ],
  },
  sumoquote: {
    name: 'SumoQuote',
    slug: 'sumoquote',
    compareSlug: 'sumoquote',
    pricing: 'Part of JobNimbus suite',
    competitorDescription:
      'SumoQuote is a proposal template builder for roofing and contractor companies, now part of the JobNimbus platform, focused on polished PDF proposals.',
    keyReasons: [
      {
        title: 'AI vs Templates',
        body: "SumoQuote's core pitch is pretty templates. SnapQuote's core pitch is AI that writes the proposal for you from your photos. Templates still require manual typing. AI doesn't.",
      },
      {
        title: 'Speed to Proposal',
        body: "SumoQuote is faster than building a proposal in Word, but you are still filling in line items manually. SnapQuote turns a roof walk into a draft proposal in 60 seconds.",
      },
      {
        title: 'Standalone, No JobNimbus Required',
        body: "SumoQuote's acquisition pulls it deeper into the JobNimbus ecosystem. SnapQuote is standalone — it doesn't require you to adopt a whole CRM to use it.",
      },
      {
        title: 'Built-In Signing and Payments',
        body: 'SnapQuote includes eSignature and Stripe deposit collection built in. Quote, sign, deposit — one flow, one tool.',
      },
    ],
  },
  'housecall-pro': {
    name: 'Housecall Pro',
    slug: 'housecall-pro',
    compareSlug: 'housecall-pro',
    pricing: '$49-279/mo',
    competitorDescription:
      'Housecall Pro is a home service platform covering scheduling, dispatching, invoicing, and marketing — strong in HVAC, plumbing, electrical, and cleaning.',
    keyReasons: [
      {
        title: "Built for Roofers Specifically",
        body: "Housecall Pro is excellent for HVAC, plumbing, electrical, and cleaning. SnapQuote was built by a working roofer for roofers — the AI understands squares, pitch, tear-off, and flashing out of the box.",
      },
      {
        title: "Your Bottleneck Isn't Dispatching",
        body: "Housecall Pro's strength is dispatching and scheduling. Great for multi-tech service calls. Roofers don't need that — they need proposals out the door fast. Different tool for different work.",
      },
      {
        title: 'Cheaper Than Most Tiers',
        body: "The Housecall Pro tier with the features most contractors want is $279/mo. SnapQuote is $79/mo flat and solves a bigger pain for roofers.",
      },
      {
        title: 'Photo-First Workflow',
        body: "You are already taking photos of every roof. SnapQuote turns those photos into the quote. Housecall Pro's estimator still requires manual line-item entry.",
      },
    ],
  },
  acculynx: {
    name: 'AccuLynx',
    slug: 'acculynx',
    compareSlug: 'acculynx',
    pricing: 'Custom, typically $125-250+/mo',
    competitorDescription:
      'AccuLynx is a dedicated roofing CRM built for mid-to-large roofing companies with production tracking, supplier integrations, and insurance claim workflows.',
    keyReasons: [
      {
        title: "Small Roofer Pricing",
        body: "AccuLynx is priced for bigger roofing operations and typically requires a sales call to get a custom quote. SnapQuote is $79/mo flat, public pricing, start the trial yourself.",
      },
      {
        title: 'Quote Speed, Not Production',
        body: "AccuLynx is strongest at coordinating production once a job is sold. SnapQuote is strongest at getting the proposal out the door in the first place. If your close rate is the problem, start with SnapQuote.",
      },
      {
        title: 'Zero Onboarding',
        body: "AccuLynx requires real setup and team training. SnapQuote works in five minutes.",
      },
      {
        title: 'Stack Them Together',
        body: 'If you already use AccuLynx, you can still use SnapQuote as your front-end quoting tool. Generate the AI proposal in 60 seconds, hand off the signed job to AccuLynx for production.',
      },
    ],
  },
  leap: {
    name: 'Leap',
    slug: 'leap',
    compareSlug: 'leap',
    pricing: 'Custom, typically $150+/mo per user',
    competitorDescription:
      "Leap is a roofing and home improvement sales platform with in-home presentation tools, financing integrations, and a traditional kitchen-table sales workflow.",
    keyReasons: [
      {
        title: "Walk-the-Roof Workflow, Not Kitchen-Table",
        body: "Leap is built for the classic in-home sales motion. SnapQuote is built for the roofer who quotes on the roof and sends the proposal before leaving the driveway. Different sales motions, different tools.",
      },
      {
        title: 'AI Beats Presentation Builders for Speed',
        body: "Leap's presentation builder is polished but manual. SnapQuote's AI drafts the entire proposal from your photos in 60 seconds.",
      },
      {
        title: 'No Sales Call to Start',
        body: "Leap's pricing requires a demo. SnapQuote is $79/mo, listed, trial-it-yourself. No pitch, no negotiation.",
      },
      {
        title: 'Built-In Deposit Collection',
        body: "SnapQuote includes Stripe Connect deposits right in the proposal flow. Homeowner signs, pays the deposit, done.",
      },
    ],
  },
};

export async function generateStaticParams() {
  return Object.keys(alternatives).map((competitor) => ({ competitor }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ competitor: string }>;
}): Promise<Metadata> {
  const { competitor } = await params;
  const data = alternatives[competitor];
  if (!data) return {};
  return {
    title: `${data.name} Alternatives — SnapQuote is the Fast AI Quoting Tool`,
    description: `Looking for a ${data.name} alternative? SnapQuote is the focused AI-powered roofing quoter at $79/mo. Photo-to-proposal in 60 seconds. 14-day free trial.`,
    keywords: [`${data.name} alternative`, `${data.name} alternatives`, `cheaper than ${data.name}`, `replace ${data.name}`, 'roofing software', 'contractor quoting tool'],
    openGraph: {
      title: `${data.name} Alternatives — SnapQuote`,
      description: `SnapQuote is the focused AI-powered alternative to ${data.name}. $79/mo flat, 60-second photo-to-quote.`,
      url: `https://snapquote.dev/alternatives/${data.slug}`,
      type: 'website',
    },
    alternates: { canonical: `https://snapquote.dev/alternatives/${data.slug}` },
  };
}

export default async function Page({ params }: { params: Promise<{ competitor: string }> }) {
  const { competitor } = await params;
  const data = alternatives[competitor];
  if (!data) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `${data.name} Alternatives`,
    description: `SnapQuote is the AI-powered ${data.name} alternative for roofing contractors at $79/mo flat.`,
    url: `https://snapquote.dev/alternatives/${data.slug}`,
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
        <Link
          href="/alternatives"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-gray-400 transition-colors hover:text-gray-600 mb-8"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          All alternatives
        </Link>

        <div className="inline-block rounded-full bg-blue-50 px-3 py-1 text-[12px] font-semibold uppercase tracking-wide text-blue-700">
          {data.name} Alternative
        </div>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          Looking for a {data.name} Alternative?
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-gray-600">
          {data.competitorDescription} If you&apos;re shopping for something cheaper, faster, or more focused,
          SnapQuote is the AI-powered roofing quote tool at <strong>$79/mo flat</strong> that turns a roof walk
          into a professional proposal in 60 seconds.
        </p>

        <section className="mt-12 rounded-2xl bg-blue-50 border border-blue-100 p-6">
          <div className="text-[13px] font-semibold uppercase tracking-wide text-blue-700">The short answer</div>
          <h2 className="mt-2 text-xl font-bold text-gray-900">SnapQuote vs {data.name} at a glance</h2>
          <dl className="mt-4 grid gap-3 sm:grid-cols-2">
            <div>
              <dt className="text-[12px] font-medium uppercase text-gray-500">SnapQuote</dt>
              <dd className="text-[14px] font-semibold text-gray-900">$79/mo flat, 60-sec AI quotes</dd>
            </div>
            <div>
              <dt className="text-[12px] font-medium uppercase text-gray-500">{data.name}</dt>
              <dd className="text-[14px] font-semibold text-gray-900">{data.pricing}</dd>
            </div>
          </dl>
        </section>

        <section className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900">Why Roofers Pick SnapQuote Over {data.name}</h2>
          <div className="mt-8 space-y-10">
            {data.keyReasons.map((reason) => (
              <div key={reason.title}>
                <h3 className="text-xl font-semibold text-gray-900">{reason.title}</h3>
                <p className="mt-3 text-gray-600 leading-relaxed">{reason.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16 text-center">
          <h2 className="text-3xl font-bold text-gray-900">Try SnapQuote Risk-Free</h2>
          <p className="mt-4 text-gray-600">
            14-day free trial. No credit card. Send your first AI-powered roof quote in 60 seconds.
          </p>
          <Link
            href="/auth/signup"
            className="mt-8 inline-flex rounded-full bg-blue-600 px-8 py-3.5 text-[15px] font-semibold text-white shadow-lg shadow-blue-600/25 transition-all hover:brightness-110 active:scale-[0.97]"
          >
            Start Free Trial
          </Link>
          <p className="mt-4 text-[13px] text-gray-400">
            Want a deeper look?{' '}
            <Link href={`/compare/snapquote-vs-${data.compareSlug}`} className="text-blue-600 hover:underline">
              See the full SnapQuote vs {data.name} comparison
            </Link>
          </p>
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
