import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { NextResponse, type NextRequest } from 'next/server';
import { isPaywallExempt, isNativeApp } from '@/lib/subscription';

// Routes that never need auth — skip the getUser() round-trip
const PUBLIC_PREFIXES = [
  '/blog', '/compare', '/roofing-estimate-software', '/hvac-quoting-app',
  '/contractor-estimate-app', '/q/', '/p/', '/privacy', '/terms',
  '/api/leads/public', '/api/quotes/', '/api/sms/incoming', '/api/stripe/webhook',
];

function isPublicRoute(pathname: string): boolean {
  if (pathname === '/') return true;
  if (PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))) {
    // Allow /api/quotes/*/accept, /api/quotes/*/view, /api/quotes/*/checkout through
    // but don't short-circuit other /api/quotes paths that may need auth
    if (pathname.startsWith('/api/quotes/')) {
      return /^\/api\/quotes\/[^/]+\/(accept|view|checkout)$/.test(pathname);
    }
    return true;
  }
  return false;
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } });

  // Native iOS app (Capacitor): detect via ?native=1 param, user-agent, or
  // the persisted cookie set on first visit.  Skip the marketing landing
  // page (redirect "/" → "/dashboard") and set a cookie so the native
  // context persists across navigations after the ?native=1 param is stripped.
  const nativeFromParam = isNativeApp(request);
  const nativeFromCookie = request.cookies.get('snapquote_native')?.value === '1';
  const isNative = nativeFromParam || nativeFromCookie;

  if (isNative) {
    const nativeCookieOpts = {
      httpOnly: true,
      secure: true,
      sameSite: 'lax' as const,
      maxAge: 60 * 60 * 24 * 365, // 1 year
      path: '/',
    };

    // Redirect "/" → "/dashboard" so Apple reviewers see the real app,
    // not the marketing site with pricing text.
    if (request.nextUrl.pathname === '/') {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      url.searchParams.delete('native');
      const redirectResponse = NextResponse.redirect(url);
      if (!nativeFromCookie) {
        redirectResponse.cookies.set('snapquote_native', '1', nativeCookieOpts);
      }
      return redirectResponse;
    }

    // Persist the native flag as a cookie so it survives across page navigations
    // (the ?native=1 query param only appears on the initial Capacitor load).
    if (!nativeFromCookie) {
      response.cookies.set('snapquote_native', '1', nativeCookieOpts);
    }
  }

  // Short-circuit for public routes — no Supabase auth call needed
  if (isPublicRoute(request.nextUrl.pathname)) {
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

  // Public sub-routes that live under otherwise-protected paths
  const publicPaths = ['/quotes/lookup', '/p/'];
  const isPublic = publicPaths.some((path) => request.nextUrl.pathname.startsWith(path));

  // Protected routes — redirect to login if not authenticated
  const protectedPaths = ['/dashboard', '/quotes', '/onboarding', '/settings', '/schedule', '/clients', '/jobs', '/pipeline', '/subscribe'];
  const isProtected = !isPublic && protectedPaths.some((path) => request.nextUrl.pathname.startsWith(path));

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
  const isAuthPage = authPaths.some((path) => request.nextUrl.pathname.startsWith(path));

  if (isAuthPage && user) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  // ── Paywall check ──────────────────────────────────────────────────
  // For authenticated users on protected routes, check subscription status.
  // Skip for routes that should always be accessible (subscribe, settings, api/stripe).
  // IMPORTANT: Native iOS app users bypass the paywall entirely — the app is
  // free to download and Apple requires IAP for in-app purchases. We handle
  // subscriptions on the web only. This resolves App Store Guideline 3.1.1.
  if (isNative) {
    // Native app: skip paywall entirely — no subscription check needed
    return response;
  }
  if (user && isProtected && !isPaywallExempt(request.nextUrl.pathname)) {
    const adminSb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const { data: profile } = await adminSb
      .from('users')
      .select('subscription_status, trial_ends_at')
      .eq('id', user.id)
      .single();

    if (profile) {
      const status = profile.subscription_status;
      const trialValid =
        status === 'trialing' &&
        profile.trial_ends_at &&
        new Date(profile.trial_ends_at) > new Date();

      const hasAccess =
        status === 'active' || status === 'past_due' || trialValid;

      if (!hasAccess) {
        const url = request.nextUrl.clone();
        url.pathname = '/subscribe';
        return NextResponse.redirect(url);
      }
    }
  }

  return response;
}
