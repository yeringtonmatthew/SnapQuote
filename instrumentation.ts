import * as Sentry from '@sentry/nextjs';

const sentryServerConfig = {
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  enabled: process.env.NODE_ENV === 'production',
};

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    Sentry.init(sentryServerConfig);
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    Sentry.init(sentryServerConfig);
  }
}

export const onRequestError = Sentry.captureRequestError;
