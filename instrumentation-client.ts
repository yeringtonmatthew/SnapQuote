import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 1.0,
  integrations: [],
  enabled: process.env.NODE_ENV === 'production',
});

// Lazy-load the replay integration so the recorder bundle stays
// out of the initial page payload until we actually need it.
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
  import('@sentry/nextjs').then(({ replayIntegration }) => {
    const client = Sentry.getClient();
    if (client) {
      client.addIntegration(replayIntegration());
    }
  });
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
