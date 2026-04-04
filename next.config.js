const { withSentryConfig } = require('@sentry/nextjs');

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },
  experimental: {
    serverComponentsExternalPackages: ['@react-pdf/renderer'],
  },
  redirects: async () => [
    { source: '/login', destination: '/auth/login', permanent: true },
    { source: '/signup', destination: '/auth/signup', permanent: true },
  ],
  headers: async () => {
    const cspDirectives = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' js.stripe.com va.vercel-scripts.com",
      "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
      "img-src 'self' data: blob: *.supabase.co *.stripe.com",
      "font-src 'self' fonts.gstatic.com",
      "connect-src 'self' *.supabase.co *.stripe.com *.sentry.io vitals.vercel-insights.com accounts.google.com appleid.apple.com",
      "frame-src 'self' js.stripe.com accounts.google.com appleid.apple.com",
      "frame-ancestors 'self'",
      "object-src 'none'",
      "base-uri 'self'",
    ].join('; ');

    const sharedSecurityHeaders = [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'X-DNS-Prefetch-Control', value: 'on' },
      { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
      { key: 'Permissions-Policy', value: 'camera=(self), microphone=(), geolocation=()' },
      { key: 'Content-Security-Policy', value: cspDirectives },
    ];

    return [
      {
        // Allow proposal pages to be iframed from our own domain (preview modal)
        source: '/q/:id*',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          ...sharedSecurityHeaders,
        ],
      },
      {
        // Block all other pages from being iframed
        source: '/((?!q/).*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          ...sharedSecurityHeaders,
        ],
      },
    ];
  },
};

module.exports = withSentryConfig(nextConfig, {
  silent: true,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
});
