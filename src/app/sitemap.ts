import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: 'https://snapquote.dev', lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: 'https://snapquote.dev/auth/login', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: 'https://snapquote.dev/auth/signup', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: 'https://snapquote.dev/privacy', lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: 'https://snapquote.dev/terms', lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  ];
}
