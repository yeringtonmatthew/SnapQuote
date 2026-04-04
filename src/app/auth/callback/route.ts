import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * Validate that a redirect destination is a safe relative path on this origin.
 * Rejects absolute URLs (http://, //) and anything that is not a leading-slash
 * path, preventing open-redirect attacks where an attacker crafts a callback
 * URL with next=https://evil.com.
 */
function safeRedirectPath(next: string | null, fallback = '/dashboard'): string {
  if (!next) return fallback;
  // Must start with a single '/' and must NOT start with '//'
  if (next.startsWith('/') && !next.startsWith('//') && !next.includes('://')) {
    return next;
  }
  return fallback;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = safeRedirectPath(searchParams.get('next'));

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // For OAuth users: ensure a user profile row exists
        const { data: profile } = await supabase
          .from('users')
          .select('id, onboarded, full_name')
          .eq('id', user.id)
          .single();

        if (!profile) {
          // First-time OAuth signup — create user profile
          const oauthName = user.user_metadata?.full_name
            || user.user_metadata?.name
            || user.user_metadata?.preferred_username
            || '';
          await supabase.from('users').insert({
            id: user.id,
            email: user.email,
            full_name: oauthName,
            onboarded: false,
          });
        } else if (!profile.full_name && user.user_metadata?.full_name) {
          // Backfill name from OAuth metadata if missing
          await supabase.from('users').update({
            full_name: user.user_metadata.full_name,
          }).eq('id', user.id);
        }

        // Check onboarding status — redirect new users to onboarding
        const isOnboarded = profile?.onboarded ?? false;
        if (!isOnboarded) {
          // Fire-and-forget welcome email
          if (user.email) {
            fetch(`${origin}/api/auth/welcome`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: user.email,
                name: user.user_metadata?.full_name || undefined,
              }),
            }).catch(() => {});
          }
          return NextResponse.redirect(`${origin}/onboarding`);
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=Could not authenticate`);
}
