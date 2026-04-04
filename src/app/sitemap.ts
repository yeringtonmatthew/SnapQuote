import { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';
import { getAllArticles } from '@/lib/blog';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: 'https://snapquote.dev', lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: 'https://snapquote.dev/auth/login', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: 'https://snapquote.dev/auth/signup', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: 'https://snapquote.dev/privacy', lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: 'https://snapquote.dev/terms', lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    // Comparison pages
    { url: 'https://snapquote.dev/compare/snapquote-vs-sumoquote', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: 'https://snapquote.dev/compare/snapquote-vs-roofr', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: 'https://snapquote.dev/compare/snapquote-vs-jobber', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    // Trade-specific landing pages
    { url: 'https://snapquote.dev/roofing-estimate-software', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: 'https://snapquote.dev/hvac-quoting-app', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: 'https://snapquote.dev/contractor-estimate-app', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
  ];

  // Blog pages
  staticPages.push({
    url: 'https://snapquote.dev/blog',
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  });

  for (const article of getAllArticles()) {
    staticPages.push({
      url: `https://snapquote.dev/blog/${article.slug}`,
      lastModified: new Date(article.date),
      changeFrequency: 'monthly',
      priority: 0.7,
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
          url: `https://snapquote.dev/p/${p.profile_slug}`,
          lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
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
