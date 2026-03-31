import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/dashboard', '/quotes', '/settings', '/api'] },
    sitemap: 'https://snapquote.dev/sitemap.xml',
  };
}
