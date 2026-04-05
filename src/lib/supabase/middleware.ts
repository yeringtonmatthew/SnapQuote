import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

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
  const protectedPaths = ['/dashboard', '/quotes', '/onboarding', '/settings', '/schedule', '/clients', '/jobs', '/pipeline'];
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

  return response;
}
