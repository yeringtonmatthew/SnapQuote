import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { NextResponse, type NextRequest } from 'next/server';
import { canAccessApp, isPaywallExempt, isNativeApp } from '@/lib/subscription';

// Routes that never need auth — skip the getUser() round-trip
const PUBLIC_PREFIXES = [
  '/blog', '/compare', '/roofing-estimate-software', '/hvac-quoting-app',
  '/contractor-estimate-app', '/q/', '/p/', '/privacy', '/terms',
  '/api/leads/public', '/api/leads/inbound', '/api/quotes/', '/api/sms/incoming',
  '/api/stripe/webhook', '/api/auth/welcome', '/api/og',
];

function isPublicRoute(pathname: string): boolean {
  if (pathname === '/') return true;
  if (PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))) {
    // Allow /api/quotes/*/accept, /api/quotes/*/view, /api/quotes/*/checkout through
    // but don't short-circuit other /api/quotes paths that may need auth
    if (pathname.startsWith('/api/quotes/')) {
      return /^\/api\/quotes\/[^/]+\/(accept|view|checkout)$/.test(pathname)
        || /^\/api\/quotes\/[^/]+\/invoice\/public$/.test(pathname);
    }
    return true;
  }
  return false;
}

function isProtectedApiRoute(pathname: string): boolean {
  if (!pathname.startsWith('/api/')) return false;
  if (isPublicRoute(pathname)) return false;
  if (pathname.startsWith('/api/stripe')) return false;
  return true;
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } });

  // Native shell: skip the marketing homepage, but do not grant any special
  // subscription access. Billing is enforced identically on web and native.
  if (isNativeApp(request) && request.nextUrl.pathname === '/') {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    url.searchParams.delete('native');
    return NextResponse.redirect(url);
  }

  // Short-circuit for public routes — no Supabase auth call needed
  const pathname = request.nextUrl.pathname;
  if (isPublicRoute(pathname)) {
    return response;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const isApiRoute = pathname.startsWith('/api/');

  // Public sub-routes that live under otherwise-protected paths
  const publicPaths = ['/quotes/lookup', '/p/'];
  const isPublic = publicPaths.some((path) => pathname.startsWith(path));

  // Protected routes — redirect to login if not authenticated
  const protectedPaths = ['/dashboard', '/quotes', '/onboarding', '/settings', '/schedule', '/clients', '/jobs', '/pipeline', '/subscribe'];
  const isProtected = !isPublic && protectedPaths.some((path) => pathname.startsWith(path));

  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    // Preserve the original destination so login can redirect the user back
    // after authentication rather than always dropping them at /dashboard.
    const originalPath = request.nextUrl.pathname + request.nextUrl.search;
    url.pathname = '/auth/login';
    url.search = `?next=${encodeURIComponent(originalPath)}`;
    return NextResponse.redirect(url);
  }

  // Redirect authenticated users away from auth pages
  const authPaths = ['/auth/login', '/auth/signup'];
  const isAuthPage = authPaths.some((path) => pathname.startsWith(path));

  if (isAuthPage && user) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  // ── Paywall check ──────────────────────────────────────────────────
  // Enforce billing on both page routes and authenticated API access.
  const shouldEnforceSubscription =
    !!user &&
    !isPaywallExempt(pathname) &&
    (isProtected || isProtectedApiRoute(pathname));

  if (shouldEnforceSubscription) {
    const adminSb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const { data: profile } = await adminSb
      .from('users')
      .select('subscription_status, trial_ends_at')
      .eq('id', user.id)
      .single();

    if (!profile || !canAccessApp(profile)) {
      if (isApiRoute) {
        return NextResponse.json(
          {
            error: 'Subscription required',
            code: 'subscription_required',
            redirect_to: '/subscribe',
          },
          { status: 402 }
        );
      }

      const url = request.nextUrl.clone();
      url.pathname = '/subscribe';
      return NextResponse.redirect(url);
    }
  }

  return response;
}
