import type { ReactNode } from 'react';
import Link from 'next/link';
import { SnapQuoteLogo } from '@/components/SnapQuoteLogo';

export type TemplatePreviewType = 'proposal' | 'estimate' | 'quote' | 'inspection';

interface TemplateSection {
  title: string;
  body: string;
}

interface RelatedLink {
  href: string;
  title: string;
  body: string;
}

interface FAQItem {
  q: string;
  a: string;
}

interface TemplateResourcePageProps {
  eyebrow: string;
  title: string;
  description: string;
  canonicalPath: string;
  webPageName: string;
  webPageDescription: string;
  previewType: TemplatePreviewType;
  previewEyebrow: string;
  previewCaption: string;
  previewBadge?: string;
  chips: string[];
  templateSections: TemplateSection[];
  narrativeTitle: string;
  narrativeParagraphs: string[];
  relatedTitle?: string;
  relatedLinks: RelatedLink[];
  faqs: FAQItem[];
  ctaTitle: string;
  ctaBody: string;
  primaryCtaHref?: string;
  primaryCtaLabel?: string;
  secondaryCtaHref?: string;
  secondaryCtaLabel?: string;
}

function PreviewShell({
  eyebrow,
  caption,
  badge,
  children,
}: {
  eyebrow: string;
  caption: string;
  badge?: string;
  children: ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-[2rem] border border-gray-200 bg-white shadow-[0_35px_120px_rgba(15,23,42,0.12)]">
      <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-5 py-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-blue-600">{eyebrow}</p>
          <p className="mt-1 text-[13px] text-gray-500">{caption}</p>
        </div>
        {badge ? (
          <span className="rounded-full border border-gray-200 bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-500">
            {badge}
          </span>
        ) : null}
      </div>
      {children}
    </div>
  );
}

function TemplatePreview({ type }: { type: TemplatePreviewType }) {
  if (type === 'proposal') {
    return (
      <img
        src="/landing-proposal-preview-v2.png"
        alt="A sample SnapQuote roofing proposal preview showing branded presentation, findings, pricing, and payment flow"
        className="w-full object-cover object-top"
      />
    );
  }

  if (type === 'estimate') {
    return (
      <div className="bg-[#f8fafc] p-5 sm:p-6">
        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Roofing estimate</p>
              <p className="mt-2 text-[18px] font-semibold text-slate-950">1029 Island Brooks Lane</p>
              <p className="mt-1 text-[13px] text-slate-500">Residential reroof estimate for tear-off and replacement</p>
            </div>
            <span className="rounded-full bg-slate-950 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white">
              Draft
            </span>
          </div>

          <div className="mt-5 space-y-2">
            {[
              ['Tear-off + disposal', '$3,250'],
              ['Architectural shingles', '$8,940'],
              ['Underlayment + flashing', '$2,180'],
              ['Labor + cleanup', '$4,090'],
            ].map(([label, value]) => (
              <div
                key={label}
                className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
              >
                <span className="text-[14px] font-medium text-slate-700">{label}</span>
                <span className="text-[14px] font-semibold text-slate-950">{value}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            {['30.4 squares', 'Labor included', 'Allowance notes'].map((item) => (
              <div key={item} className="rounded-2xl border border-slate-200 px-3 py-3 text-[12px] font-semibold text-slate-500">
                {item}
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-[1.4rem] bg-slate-950 px-4 py-4 text-white">
            <div className="flex items-center justify-between">
              <span className="text-[12px] uppercase tracking-[0.16em] text-white/55">Total estimate</span>
              <span className="text-[22px] font-bold">$18,460</span>
            </div>
            <p className="mt-2 text-[13px] text-white/62">Pricing-first layout for the homeowner who wants the number fast.</p>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'quote') {
    return (
      <div className="bg-[#f8fafc] p-5 sm:p-6">
        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Roofing quote</p>
              <p className="mt-2 text-[18px] font-semibold text-slate-950">Customer-ready pricing</p>
              <p className="mt-1 text-[13px] text-slate-500">Shorter than a full proposal, but still built to win trust.</p>
            </div>
            <span className="rounded-full bg-blue-600 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white">
              Sent today
            </span>
          </div>

          <div className="mt-5 rounded-[1.35rem] border border-slate-200 bg-slate-50 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Scope summary</p>
            <p className="mt-2 text-[14px] leading-relaxed text-slate-700">
              Remove existing shingles, replace underlayment, install new architectural shingle system, flashing,
              ridge vent, cleanup, and final walkthrough.
            </p>
          </div>

          <div className="mt-4 grid gap-3">
            {[
              ['Preferred system', '30-year architectural shingle'],
              ['Quote total', '$19,240'],
              ['Quote expires', '30 days from issue date'],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3">
                <span className="text-[13px] font-medium text-slate-500">{label}</span>
                <span className="text-[14px] font-semibold text-slate-950">{value}</span>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-[1.4rem] bg-blue-600 px-4 py-4 text-white">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/70">Next step</p>
                <p className="mt-1 text-[15px] font-semibold">Approve quote and schedule the job</p>
              </div>
              <span className="rounded-full bg-white px-4 py-2 text-[12px] font-semibold text-blue-700">Approve</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f8fafc] p-5 sm:p-6">
      <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Inspection report</p>
            <p className="mt-2 text-[18px] font-semibold text-slate-950">Condition findings</p>
            <p className="mt-1 text-[13px] text-slate-500">Document what you found before the price conversation starts.</p>
          </div>
          <span className="rounded-full bg-amber-100 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-amber-800">
            Field notes
          </span>
        </div>

        <div className="mt-5 space-y-3">
          {[
            ['Lifted shingles on rear slope', 'High'],
            ['Pipe flashing wear at vent stack', 'Medium'],
            ['Granule loss near valley transition', 'Monitor'],
          ].map(([label, level]) => (
            <div
              key={label}
              className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
            >
              <span className="text-[14px] font-medium text-slate-700">{label}</span>
              <span className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-slate-500">{level}</span>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-[1.35rem] border border-amber-200 bg-amber-50 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-700">Recommended work</p>
          <p className="mt-2 text-[14px] leading-relaxed text-amber-950">
            Replace shingle system, install new flashing, and attach photos to the final quote so the homeowner sees
            exactly why the work is needed.
          </p>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {['Photo-backed findings', 'Insurance-ready language'].map((item) => (
            <div key={item} className="rounded-2xl border border-slate-200 px-3 py-3 text-[12px] font-semibold text-slate-500">
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function TemplateResourcePage({
  eyebrow,
  title,
  description,
  canonicalPath,
  webPageName,
  webPageDescription,
  previewType,
  previewEyebrow,
  previewCaption,
  previewBadge,
  chips,
  templateSections,
  narrativeTitle,
  narrativeParagraphs,
  relatedTitle = 'Best pages to visit next',
  relatedLinks,
  faqs,
  ctaTitle,
  ctaBody,
  primaryCtaHref = '/auth/signup',
  primaryCtaLabel = 'Start Free Trial',
  secondaryCtaHref = '/roofing-proposal-software',
  secondaryCtaLabel = 'See the software',
}: TemplateResourcePageProps) {
  const webPageLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: webPageName,
    description: webPageDescription,
    url: `https://snapquote.dev${canonicalPath}`,
  };

  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.a,
      },
    })),
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
        name: webPageName,
        item: `https://snapquote.dev${canonicalPath}`,
      },
    ],
  };

  return (
    <div className="force-light min-h-dvh bg-white antialiased">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <nav className="sticky top-0 z-50 border-b border-black/[0.04] bg-white/70 backdrop-blur-2xl backdrop-saturate-[1.8]">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
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
              Start Free
            </Link>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-6 py-16 sm:py-24">
        <div className="grid items-start gap-14 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16">
          <div className="max-w-xl">
            <div className="inline-block rounded-full bg-blue-50 px-3 py-1 text-[12px] font-semibold uppercase tracking-wide text-blue-700">
              {eyebrow}
            </div>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">{title}</h1>
            <p className="mt-6 text-lg leading-relaxed text-gray-600">{description}</p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href={primaryCtaHref}
                className="rounded-full bg-blue-600 px-7 py-3.5 text-center text-[15px] font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:brightness-110 active:scale-[0.97]"
              >
                {primaryCtaLabel}
              </Link>
              <Link
                href={secondaryCtaHref}
                className="rounded-full border border-gray-200 px-7 py-3.5 text-center text-[15px] font-semibold text-gray-700 transition hover:bg-gray-50 active:scale-[0.97]"
              >
                {secondaryCtaLabel}
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] text-gray-500">
              {chips.map((chip, index) => (
                <div key={chip} className="flex items-center gap-4">
                  {index > 0 ? <span className="h-1 w-1 rounded-full bg-gray-300" /> : null}
                  <span>{chip}</span>
                </div>
              ))}
            </div>
          </div>

          <PreviewShell eyebrow={previewEyebrow} caption={previewCaption} badge={previewBadge}>
            <TemplatePreview type={previewType} />
          </PreviewShell>
        </div>

        <section className="mt-16 grid gap-6 md:grid-cols-3">
          {templateSections.map((section) => (
            <div key={section.title} className="rounded-2xl border border-gray-200 bg-gray-50/70 p-6">
              <h2 className="text-[18px] font-semibold text-gray-900">{section.title}</h2>
              <p className="mt-3 text-[14px] leading-relaxed text-gray-600">{section.body}</p>
            </div>
          ))}
        </section>

        <section className="mt-16 grid gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900">{narrativeTitle}</h2>
            <div className="mt-5 space-y-4 text-[15px] leading-relaxed text-gray-600">
              {narrativeParagraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-8">
            <h2 className="text-2xl font-bold text-gray-900">{relatedTitle}</h2>
            <div className="mt-5 grid gap-4">
              {relatedLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-2xl border border-blue-100 bg-white p-5 transition-all hover:border-blue-200 hover:shadow-sm"
                >
                  <p className="text-[16px] font-semibold text-gray-900">{item.title}</p>
                  <p className="mt-2 text-[14px] leading-relaxed text-gray-600">{item.body}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900">Frequently asked questions</h2>
          <div className="mt-6 space-y-4">
            {faqs.map((faq) => (
              <div key={faq.q} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="text-[17px] font-semibold text-gray-900">{faq.q}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-gray-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16 rounded-3xl border border-gray-200 bg-gray-900 px-8 py-10 text-center text-white sm:px-10">
          <h2 className="text-3xl font-bold tracking-tight">{ctaTitle}</h2>
          <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-relaxed text-gray-300">{ctaBody}</p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href={primaryCtaHref}
              className="rounded-full bg-white px-8 py-3 text-[15px] font-semibold text-gray-900 transition hover:bg-gray-100 active:scale-[0.97]"
            >
              {primaryCtaLabel}
            </Link>
            <Link
              href="/compare"
              className="rounded-full bg-white/10 px-8 py-3 text-[15px] font-semibold text-white ring-1 ring-white/20 transition hover:bg-white/[0.15] active:scale-[0.97]"
            >
              Compare SnapQuote
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-100 bg-white py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-6 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-4">
            <SnapQuoteLogo size="xs" />
            <span className="text-[13px] text-gray-400">&copy; 2026 SnapQuote</span>
          </div>
          <nav aria-label="Footer" className="flex flex-wrap items-center gap-6">
            <Link href="/roofing-proposal-software" className="text-[13px] text-gray-400 transition hover:text-gray-600">
              Proposal Software
            </Link>
            <Link href="/roofing-proposal-template" className="text-[13px] text-gray-400 transition hover:text-gray-600">
              Proposal Template
            </Link>
            <Link href="/roofing-estimate-template" className="text-[13px] text-gray-400 transition hover:text-gray-600">
              Estimate Template
            </Link>
            <Link href="/roof-inspection-report-template" className="text-[13px] text-gray-400 transition hover:text-gray-600">
              Inspection Template
            </Link>
            <Link href="/blog" className="text-[13px] text-gray-400 transition hover:text-gray-600">
              Blog
            </Link>
            <Link href="/privacy" className="text-[13px] text-gray-400 transition hover:text-gray-600">
              Privacy
            </Link>
            <Link href="/terms" className="text-[13px] text-gray-400 transition hover:text-gray-600">
              Terms
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
