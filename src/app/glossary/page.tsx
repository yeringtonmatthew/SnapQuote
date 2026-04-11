import Link from 'next/link';
import { Metadata } from 'next';
import { SnapQuoteLogo } from '@/components/SnapQuoteLogo';
import { getAllGlossaryTerms } from '@/lib/glossary';

export const metadata: Metadata = {
  title: 'Roofing Glossary — Definitions of Every Roofing Term | SnapQuote',
  description:
    'Free roofing glossary with definitions for every common roofing term — from squares and pitch to flashing, underlayment, and insurance claims language.',
  keywords: ['roofing glossary', 'roofing terms', 'roofing definitions', 'roofing dictionary', 'what is a roofing square'],
  openGraph: {
    title: 'Roofing Glossary — SnapQuote',
    description: 'Free glossary of every common roofing term, built for roofers and homeowners.',
    url: 'https://snapquote.dev/glossary',
    type: 'website',
  },
  alternates: { canonical: 'https://snapquote.dev/glossary' },
};

export default function GlossaryPage() {
  const terms = getAllGlossaryTerms();
  const grouped = terms.reduce((acc, t) => {
    if (!acc[t.category]) acc[t.category] = [];
    acc[t.category].push(t);
    return acc;
  }, {} as Record<string, typeof terms>);

  const categoryOrder: Array<keyof typeof grouped> = ['structure', 'materials', 'techniques', 'business', 'insurance'];
  const categoryLabels: Record<string, string> = {
    structure: 'Roof Structure',
    materials: 'Materials & Components',
    techniques: 'Techniques & Procedures',
    business: 'Estimating & Business',
    insurance: 'Insurance & Claims',
  };

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'DefinedTermSet',
    name: 'SnapQuote Roofing Glossary',
    description: 'Free glossary of every common roofing term, built for roofers and homeowners.',
    url: 'https://snapquote.dev/glossary',
    hasDefinedTerm: terms.map((t) => ({
      '@type': 'DefinedTerm',
      name: t.term,
      description: t.shortDefinition,
      url: `https://snapquote.dev/glossary/${t.slug}`,
    })),
  };

  return (
    <div className="force-light min-h-dvh bg-white antialiased">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

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
          Roofing Glossary
        </div>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          Every Roofing Term, Defined
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-gray-600">
          Plain-English definitions of every common roofing term — from basic structure to insurance-claim
          language. Built for working roofers and homeowners trying to understand a contractor&apos;s proposal.
        </p>

        {categoryOrder.map((cat) => {
          const list = grouped[cat];
          if (!list?.length) return null;
          return (
            <section key={cat} className="mt-16">
              <h2 className="text-2xl font-bold text-gray-900">{categoryLabels[cat]}</h2>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {list.map((t) => (
                  <Link
                    key={t.slug}
                    href={`/glossary/${t.slug}`}
                    className="group flex items-start justify-between gap-3 rounded-2xl border border-gray-200 bg-white p-5 transition-all hover:border-blue-200 hover:shadow-md"
                  >
                    <div>
                      <div className="font-semibold text-gray-900">{t.term}</div>
                      <p className="mt-1 text-[13px] text-gray-500 line-clamp-2">{t.shortDefinition}</p>
                    </div>
                    <svg
                      className="h-5 w-5 flex-shrink-0 text-gray-300 transition group-hover:translate-x-0.5 group-hover:text-blue-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}

        <section className="mt-20 rounded-2xl bg-blue-50 border border-blue-100 p-8 sm:p-10">
          <h2 className="text-2xl font-bold text-gray-900">Quoting Roofs Should Be Simpler Than This</h2>
          <p className="mt-4 text-gray-600 leading-relaxed max-w-2xl">
            This glossary is free. If you want to skip the manual math entirely, SnapQuote&apos;s AI reads your
            roof photos and generates a full proposal — with proper line items, pricing, and terminology — in
            60 seconds.
          </p>
          <Link
            href="/auth/signup"
            className="mt-6 inline-flex rounded-full bg-blue-600 px-6 py-3 text-[14px] font-semibold text-white shadow-sm transition hover:brightness-110 active:scale-[0.97]"
          >
            Try SnapQuote Free for 14 Days
          </Link>
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
