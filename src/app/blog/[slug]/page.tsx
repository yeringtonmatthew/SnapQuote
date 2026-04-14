import Link from 'next/link';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SnapQuoteLogo } from '@/components/SnapQuoteLogo';
import { getArticleBySlug, getAllArticles } from '@/lib/blog';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllArticles().map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) return {};

  return {
    title: `${article.title} | SnapQuote Blog`,
    description: article.metaDescription,
    keywords: [article.targetKeyword, 'SnapQuote blog', 'roofing contractors'],
    openGraph: {
      title: article.title,
      description: article.metaDescription,
      type: 'article',
      publishedTime: article.date,
      authors: ['SnapQuote Team'],
      url: `https://snapquote.dev/blog/${article.slug}`,
      images: [
        {
          url: `https://snapquote.dev/api/og?title=${encodeURIComponent(article.title)}&subtitle=${encodeURIComponent(article.category)}`,
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.metaDescription,
    },
    alternates: {
      canonical: `/blog/${article.slug}`,
    },
  };
}

const categoryColors: Record<string, string> = {
  Sales: 'bg-blue-50 text-blue-700 ring-blue-200/60',
  Tools: 'bg-purple-50 text-purple-700 ring-purple-200/60',
  Business: 'bg-emerald-50 text-emerald-700 ring-emerald-200/60',
};

/** Convert simple markdown to HTML. Handles headings, bold, lists, paragraphs. */
function markdownToHtml(md: string): string {
  const lines = md.split('\n');
  const htmlParts: string[] = [];
  let inList = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith('### ')) {
      if (inList) { htmlParts.push('</ul>'); inList = false; }
      htmlParts.push(`<h3>${line.slice(4)}</h3>`);
    } else if (line.startsWith('## ')) {
      if (inList) { htmlParts.push('</ul>'); inList = false; }
      htmlParts.push(`<h2>${line.slice(3)}</h2>`);
    } else if (line.startsWith('- ')) {
      if (!inList) { htmlParts.push('<ul>'); inList = true; }
      htmlParts.push(`<li>${applyInline(line.slice(2))}</li>`);
    } else if (line.trim() === '') {
      if (inList) { htmlParts.push('</ul>'); inList = false; }
    } else {
      if (inList) { htmlParts.push('</ul>'); inList = false; }
      htmlParts.push(`<p>${applyInline(line)}</p>`);
    }
  }

  if (inList) htmlParts.push('</ul>');
  return htmlParts.join('\n');
}

function applyInline(text: string): string {
  // Bold **text**
  return text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
}

export default async function BlogArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) notFound();

  const contentHtml = markdownToHtml(article.content);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.metaDescription,
    datePublished: article.date,
    dateModified: article.date,
    author: {
      '@type': 'Organization',
      name: 'SnapQuote Team',
      url: 'https://snapquote.dev',
    },
    publisher: {
      '@type': 'Organization',
      name: 'SnapQuote',
      url: 'https://snapquote.dev',
      logo: {
        '@type': 'ImageObject',
        url: 'https://snapquote.dev/icon-512.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://snapquote.dev/blog/${article.slug}`,
    },
    image: `https://snapquote.dev/api/og?title=${encodeURIComponent(article.title)}&subtitle=${encodeURIComponent(article.category)}`,
    articleSection: article.category,
    keywords: article.targetKeyword,
    wordCount: article.content.split(/\s+/).length,
  };

  return (
    <div className="force-light min-h-dvh bg-[#f2f2f7] antialiased">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Nav */}
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

      {/* Article */}
      <main className="mx-auto max-w-3xl px-6 py-12 sm:py-16">
        {/* Breadcrumb */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-gray-400 transition-colors hover:text-gray-600 mb-8"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
            />
          </svg>
          Back to Blog
        </Link>

        {/* Article Header */}
        <header className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ${categoryColors[article.category] || 'bg-gray-50 text-gray-700 ring-gray-200/60'}`}>
              {article.category}
            </span>
            <span className="text-[13px] text-gray-400">
              {article.readingTime}
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl lg:text-[2.5rem] leading-[1.15]">
            {article.title}
          </h1>
          <div className="mt-6 flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-[11px] font-bold text-white">
              SQ
            </div>
            <div>
              <p className="text-[14px] font-semibold text-gray-900">
                SnapQuote Team
              </p>
              <time
                dateTime={article.date}
                className="text-[13px] text-gray-400"
              >
                {new Date(article.date).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </time>
            </div>
          </div>
        </header>

        {/* Article Body */}
        <article
          className="prose prose-gray max-w-none
            prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-gray-900
            prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
            prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
            prose-p:text-[15px] prose-p:leading-[1.8] prose-p:text-gray-600 prose-p:mb-4
            prose-li:text-[15px] prose-li:leading-[1.8] prose-li:text-gray-600
            prose-strong:text-gray-900 prose-strong:font-semibold
            prose-ul:my-4 prose-ul:pl-6
            prose-a:text-brand-600 prose-a:no-underline hover:prose-a:underline"
          dangerouslySetInnerHTML={{ __html: contentHtml }}
        />

        <section className="mt-14 grid gap-4 border-t border-gray-200 pt-10 sm:grid-cols-3">
          {[
            {
              href: '/roofing-proposal-template',
              title: 'Roofing proposal template',
              body: 'See a customer-ready proposal structure you can model or automate.',
            },
            {
              href: '/roofing-proposal-software',
              title: 'Roofing proposal software',
              body: 'Route proposal readers into the exact product page that solves this workflow.',
            },
            {
              href: '/compare',
              title: 'Compare roofing software',
              body: 'Catch buyers researching Jobber, Roofr, ServiceTitan, and other options.',
            },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-2xl border border-gray-200 bg-white p-5 transition-all hover:border-blue-200 hover:shadow-sm"
            >
              <p className="text-[16px] font-semibold text-gray-900">{item.title}</p>
              <p className="mt-2 text-[14px] leading-relaxed text-gray-600">{item.body}</p>
            </Link>
          ))}
        </section>

        {/* CTA Banner */}
        <div className="mt-16 rounded-2xl bg-gray-900 p-8 sm:p-10 text-center">
          <h3 className="text-2xl font-bold text-white">
            Try SnapQuote free for 14 days
          </h3>
          <p className="mt-3 text-[15px] text-gray-400 max-w-md mx-auto">
            Send professional proposals in 60 seconds. AI-powered estimates,
            online payments, and automated follow-ups built for contractors.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/auth/signup"
              className="rounded-full bg-white px-8 py-3 text-[15px] font-semibold text-gray-900 shadow-lg transition-all hover:bg-gray-100 active:scale-[0.97]"
            >
              Start Free Trial
            </Link>
            <Link
              href="/"
              className="rounded-full bg-white/10 px-8 py-3 text-[15px] font-semibold text-white ring-1 ring-white/20 transition-all hover:bg-white/[0.15] active:scale-[0.97]"
            >
              Learn More
            </Link>
          </div>
          <p className="mt-4 text-[12px] text-gray-500">
            No credit card required
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-10 mt-8">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
            <div className="flex items-center gap-4">
              <SnapQuoteLogo size="xs" />
              <span className="text-[13px] text-gray-400">
                &copy; 2026 SnapQuote
              </span>
            </div>
            <nav aria-label="Footer" className="flex items-center gap-6">
              <Link
                href="/blog"
                className="text-[13px] text-gray-400 transition hover:text-gray-600"
              >
                Blog
              </Link>
              <Link
                href="/privacy"
                className="text-[13px] text-gray-400 transition hover:text-gray-600"
              >
                Privacy
              </Link>
              <Link
                href="/terms"
                className="text-[13px] text-gray-400 transition hover:text-gray-600"
              >
                Terms
              </Link>
              <a
                href="mailto:support@snapquote.dev"
                className="text-[13px] text-gray-400 transition hover:text-gray-600"
              >
                Support
              </a>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}
