import type { User } from '@/types/database';

export type SubscriptionStatus = 'trialing' | 'active' | 'past_due' | 'canceled' | 'expired';

/**
 * Detect if the request is coming from the native iOS app (Capacitor).
 * Capacitor config appends ?native=1 to the server URL, and the iOS
 * WebView user-agent contains "SnapQuote".
 */
export function isNativeApp(request: Request): boolean {
  const url = new URL(request.url);
  if (url.searchParams.has('native')) return true;
  const ua = request.headers.get('user-agent') || '';
  return /SnapQuote|Capacitor/i.test(ua);
}

/**
 * Client-side check for native app context.
 */
export function isNativeAppClient(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.location.href.includes('native=1') ||
    !!(window as any).Capacitor?.isNativePlatform?.()
  );
}

/**
 * Check if a user can access the app (active subscription or valid trial).
 */
export function canAccessApp(user: Pick<User, 'subscription_status' | 'trial_ends_at'>): boolean {
  const status = user.subscription_status;

  // Active or past-due (Stripe retries payment) — always allow
  if (status === 'active' || status === 'past_due') return true;

  // Trialing — check if trial hasn't expired
  if (status === 'trialing' && user.trial_ends_at) {
    return new Date(user.trial_ends_at) > new Date();
  }

  return false;
}

/**
 * Get the number of full days remaining in the trial.
 */
export function getTrialDaysRemaining(user: Pick<User, 'trial_ends_at'>): number {
  if (!user.trial_ends_at) return 0;
  const diff = new Date(user.trial_ends_at).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

/**
 * Check if the user's trial has expired.
 */
export function isTrialExpired(user: Pick<User, 'subscription_status' | 'trial_ends_at'>): boolean {
  if (user.subscription_status !== 'trialing') return false;
  if (!user.trial_ends_at) return true;
  return new Date(user.trial_ends_at) <= new Date();
}

/**
 * Routes that should never be blocked by the paywall.
 */
export const PAYWALL_EXEMPT_ROUTES = [
  '/subscribe',
  '/settings',
  '/api/stripe',
  '/auth',
  '/onboarding',
];

export function isPaywallExempt(pathname: string): boolean {
  return PAYWALL_EXEMPT_ROUTES.some((route) => pathname.startsWith(route));
}
