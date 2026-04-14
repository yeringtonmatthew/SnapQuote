import { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';
import { getAllArticles } from '@/lib/blog';
import { getAllGlossaryTerms } from '@/lib/glossary';

const SITE = 'https://snapquote.dev';

// Competitor slugs used by both /compare and /alternatives routes.
const COMPARE_COMPETITORS = [
  'sumoquote',
  'roofr',
  'jobber',
  'servicetitan',
  'jobnimbus',
  'housecall-pro',
  'buildertrend',
  'contractorforeman',
  'acculynx',
  'leap',
  'markate',
];

// /alternatives uses its own dynamic route — keep in sync with `alternatives` map
// in src/app/alternatives/[competitor]/page.tsx
const ALTERNATIVES_COMPETITORS = [
  'jobber',
  'roofr',
  'servicetitan',
  'jobnimbus',
  'sumoquote',
  'housecall-pro',
  'acculynx',
  'leap',
];

const INTENT_LANDING_PAGES = [
  'roof-quote-generator',
  'roof-inspection-report-template',
  'roofing-estimate-template',
  'roofing-proposal-template',
  'roofing-proposal-software',
  'roofing-quote-template',
  'mobile-roofing-estimate-app',
  'roofing-sales-app',
  'roofing-estimate-software',
  'hvac-quoting-app',
  'contractor-estimate-app',
];

const TOOL_PAGES = [
  'roofing-square-calculator',
  'roof-pitch-calculator',
  'roof-replacement-cost-calculator',
  'roofing-cost-estimator',
  'shingle-calculator',
  'roofing-materials-calculator',
  'squares-to-bundles-calculator',
  'roof-square-footage-calculator',
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE}/terms`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },

    // Hubs
    { url: `${SITE}/compare`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE}/alternatives`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE}/tools`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE}/glossary`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${SITE}/blog`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
  ];

  // Comparison pages
  for (const slug of COMPARE_COMPETITORS) {
    staticPages.push({
      url: `${SITE}/compare/snapquote-vs-${slug}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    });
  }

  // Alternatives pages
  for (const slug of ALTERNATIVES_COMPETITORS) {
    staticPages.push({
      url: `${SITE}/alternatives/${slug}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    });
  }

  // Intent-based landing pages
  for (const slug of INTENT_LANDING_PAGES) {
    staticPages.push({
      url: `${SITE}/${slug}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    });
  }

  // Free tools
  for (const slug of TOOL_PAGES) {
    staticPages.push({
      url: `${SITE}/tools/${slug}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    });
  }

  // Blog articles
  for (const article of getAllArticles()) {
    staticPages.push({
      url: `${SITE}/blog/${article.slug}`,
      lastModified: new Date(article.date),
      changeFrequency: 'monthly',
      priority: 0.7,
    });
  }

  // Glossary terms
  for (const term of getAllGlossaryTerms()) {
    staticPages.push({
      url: `${SITE}/glossary/${term.slug}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    });
  }

  // Dynamically include public contractor profiles
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const { data: profiles } = await supabase
      .from('users')
      .select('profile_slug, updated_at')
      .eq('profile_public', true)
      .not('profile_slug', 'is', null);

    if (profiles) {
      for (const p of profiles) {
        staticPages.push({
          url: `${SITE}/p/${p.profile_slug}`,
          lastModified: p.updated_at ? new Date(p.updated_at) : now,
          changeFrequency: 'weekly',
          priority: 0.6,
        });
      }
    }
  } catch {
    // If DB is unavailable, return static pages only
  }

  return staticPages;
}
