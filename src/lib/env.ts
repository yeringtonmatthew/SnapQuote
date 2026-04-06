/**
 * Runtime validation of required environment variables.
 *
 * Import this module early (e.g. from middleware or layout) to get a clear
 * error message at startup when a critical env var is missing instead of a
 * cryptic "Cannot read properties of undefined" somewhere deep in application
 * code.
 */

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}. ` +
      `Check your .env.local or hosting provider's environment settings.`
    );
  }
  return value;
}

/** Required for Supabase to function at all */
export const NEXT_PUBLIC_SUPABASE_URL = requireEnv('NEXT_PUBLIC_SUPABASE_URL');
export const NEXT_PUBLIC_SUPABASE_ANON_KEY = requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');

/** Optional — features degrade gracefully when missing */
export const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY ?? null;
export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET ?? null;
export const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID ?? null;
export const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN ?? null;
export const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER ?? null;
export const TWILIO_MESSAGING_SERVICE_SID = process.env.TWILIO_MESSAGING_SERVICE_SID ?? null;
export const RESEND_API_KEY = process.env.RESEND_API_KEY ?? null;
export const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? 'SnapQuote <quotes@snapquote.dev>';
export const NEXT_PUBLIC_APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://snapquote.dev';
export const NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? null;
/** Server-only Google Maps key — falls back to the public key for backward compatibility */
export const GOOGLE_MAPS_SERVER_KEY = process.env.GOOGLE_MAPS_SERVER_KEY ?? process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? null;
export const SNAPQUOTE_ANTHROPIC_KEY = process.env.SNAPQUOTE_ANTHROPIC_KEY ?? process.env.ANTHROPIC_API_KEY ?? null;
export const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? null;
export const CRON_SECRET = process.env.CRON_SECRET ?? null;
export const INTERNAL_API_SECRET = process.env.INTERNAL_API_SECRET ?? null;
export const UPSTASH_REDIS_REST_URL = process.env.UPSTASH_REDIS_REST_URL ?? null;
export const UPSTASH_REDIS_REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN ?? null;
