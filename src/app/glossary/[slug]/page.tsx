import Link from 'next/link';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SnapQuoteLogo } from '@/components/SnapQuoteLogo';
import { getAllGlossaryTerms, getGlossaryTerm } from '@/lib/glossary';

export async function generateStaticParams() {
  return getAllGlossaryTerms().map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const term = getGlossaryTerm(slug);
  if (!term) return {};
  return {
    title: `${term.term} — Roofing Glossary | SnapQuote`,
    description: term.metaDescription,
    keywords: [term.term.toLowerCase(), `what is ${term.term.toLowerCase()}`, 'roofing glossary', 'roofing definition'],
    openGraph: {
      title: `${term.term} — Roofing Glossary`,
      description: term.metaDescription,
      url: `https://snapquote.dev/glossary/${term.slug}`,
      type: 'article',
    },
    alternates: { canonical: `https://snapquote.dev/glossary/${term.slug}` },
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const term = getGlossaryTerm(slug);
  if (!term) notFound();

  const related = term.relatedTerms
    .map((s) => getGlossaryTerm(s))
    .filter((t): t is NonNullable<typeof t> => !!t);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'DefinedTerm',
    name: term.term,
    description: term.fullDefinition,
    url: `https://snapquote.dev/glossary/${term.slug}`,
    inDefinedTermSet: {
      '@type': 'DefinedTermSet',
      name: 'SnapQuote Roofing Glossary',
      url: 'https://snapquote.dev/glossary',
    },
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

      <main className="mx-auto max-w-3xl px-6 py-16 sm:py-20">
        <Link
          href="/glossary"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-gray-400 transition-colors hover:text-gray-600 mb-8"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Roofing Glossary
        </Link>

        <div className="inline-block rounded-full bg-blue-50 px-3 py-1 text-[12px] font-semibold uppercase tracking-wide text-blue-700">
          {term.category}
        </div>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">{term.term}</h1>
        <p className="mt-4 text-lg italic text-gray-500">{term.shortDefinition}</p>

        <section className="mt-10">
          <h2 className="text-xl font-bold text-gray-900">Definition</h2>
          <p className="mt-4 text-gray-600 leading-relaxed text-lg">{term.fullDefinition}</p>
        </section>

        {related.length > 0 && (
          <section className="mt-12 rounded-2xl bg-gray-50 p-6">
            <h3 className="text-[13px] font-semibold uppercase tracking-wide text-gray-500">Related Terms</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  href={`/glossary/${r.slug}`}
                  className="rounded-full border border-gray-200 bg-white px-4 py-2 text-[13px] text-gray-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                >
                  {r.term}
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="mt-12 grid gap-4 sm:grid-cols-3">
          {[
            {
              href: '/roofing-proposal-template',
              title: 'Roofing proposal template',
              body: 'See how real roofing terms show up in a customer-ready proposal.',
            },
            {
              href: '/tools/roofing-square-calculator',
              title: 'Roofing square calculator',
              body: 'Move from roofing definitions into the actual measurement math.',
            },
            {
              href: '/roofing-proposal-software',
              title: 'Roofing proposal software',
              body: 'Turn roof photos and terminology into a polished proposal in one flow.',
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
        </section>

        <section className="mt-16 rounded-2xl bg-blue-50 border border-blue-100 p-8">
          <h2 className="text-xl font-bold text-gray-900">Quote Roofs Faster with SnapQuote</h2>
          <p className="mt-3 text-gray-600 leading-relaxed">
            SnapQuote is the AI-powered quoting tool built for working roofers. Snap a few photos, get a detailed
            proposal in 60 seconds, and send it before you leave the driveway. $79/mo, 14-day free trial.
          </p>
          <Link
            href="/auth/signup"
            className="mt-5 inline-flex rounded-full bg-blue-600 px-6 py-3 text-[14px] font-semibold text-white shadow-sm transition hover:brightness-110 active:scale-[0.97]"
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
