import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 1.0,
  integrations: [],
  enabled: process.env.NODE_ENV === 'production',
});

// Lazy-load the replay integration so the ~50 kB recorder bundle
// is not included in the initial page load.
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
  import('@sentry/nextjs').then(({ replayIntegration }) => {
    const client = Sentry.getClient();
    if (client) {
      client.addIntegration(replayIntegration());
    }
  });
}
