export const NATIVE_APP_ROUTE_PREFIXES = [
  '/dashboard',
  '/quotes',
  '/clients',
  '/jobs',
  '/pipeline',
  '/schedule',
  '/settings',
  '/invoices',
  '/payments',
  '/onboarding',
  '/subscribe',
] as const;

const NATIVE_ENTRY_ROUTE_PREFIXES = [
  '/',
  '/auth/login',
  '/auth/signup',
] as const;

export const APP_ROUTE_PREFETCHES = [
  '/dashboard',
  '/quotes',
  '/quotes/new',
  '/clients',
  '/jobs',
  '/pipeline',
  '/schedule',
  '/invoices',
  '/payments',
  '/settings',
] as const;

export const MORE_MENU_ROUTE_PREFIXES = [
  '/jobs',
  '/invoices',
  '/pipeline',
  '/payments',
  '/settings',
] as const;

export function isNativeAppRoute(pathname: string): boolean {
  return NATIVE_APP_ROUTE_PREFIXES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

export function getActiveMoreMenuRoute(pathname: string): string | null {
  return (
    MORE_MENU_ROUTE_PREFIXES.find((route) => pathname === route || pathname.startsWith(`${route}/`)) ??
    null
  );
}

export function shouldResumeNativeUserIntoApp(pathname: string): boolean {
  return NATIVE_ENTRY_ROUTE_PREFIXES.some((route) => pathname === route);
}

export function sanitizeNativeAppPath(candidate: string | null | undefined): string | null {
  if (!candidate) return null;
  if (!candidate.startsWith('/')) return null;
  if (candidate.startsWith('//') || candidate.includes('://')) return null;

  const [pathname] = candidate.split('?');
  if (!pathname || !isNativeAppRoute(pathname)) return null;

  return candidate;
}

export function getNativeResumeTarget(
  currentPathname: string,
  lastKnownAppPath: string | null | undefined
): string | null {
  if (!shouldResumeNativeUserIntoApp(currentPathname)) return null;
  return sanitizeNativeAppPath(lastKnownAppPath) ?? '/dashboard';
}
