'use client';

import { useState, Suspense, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import FormField from '@/components/ui/FormField';
import SocialAuthButtons from '@/components/SocialAuthButtons';
import { SnapQuoteLogo } from '@/components/SnapQuoteLogo';

interface FieldErrors {
  email?: string;
  password?: string;
}

const SOCIAL_AUTH_ENABLED = process.env.NEXT_PUBLIC_SOCIAL_AUTH_ENABLED === 'true';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Validated server-side by the callback route; validate here too for safety.
  const rawNext = searchParams.get('next') ?? '';
  const nextPath =
    rawNext.startsWith('/') && !rawNext.startsWith('//') && !rawNext.includes('://')
      ? rawNext
      : '/dashboard';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const togglePassword = useCallback(() => setShowPassword(v => !v), []);

  function validate(): boolean {
    const errors: FieldErrors = {};

    if (!email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Enter a valid email address';
    }

    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);
    setError(null);

    const supabase = createClient();

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError) {
      setError(loginError.message);
      setLoading(false);
      return;
    }

    // Check if user has completed onboarding
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from('users')
        .select('onboarded')
        .eq('id', user.id)
        .single();

      if (profile && !profile.onboarded) {
        router.push('/onboarding');
        return;
      }
    }

    router.push(nextPath);
  }

  return (
    <main className="flex min-h-dvh flex-col justify-center px-6 py-12 bg-white dark:bg-gray-950">
      <div className="mx-auto w-full max-w-sm animate-fade-up">
        {/* Header */}
        <div className="text-center">
          <SnapQuoteLogo size="lg" variant="mark" className="justify-center" />
          <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-gray-100">
            Welcome back
          </h1>
          <p className="mt-1 text-[15px] text-gray-500">
            Sign in to manage your quotes
          </p>
        </div>

        {SOCIAL_AUTH_ENABLED && (
          <>
            {/* Social Auth */}
            <div className="mt-8">
              <SocialAuthButtons redirectTo="/dashboard" />
            </div>

            {/* Divider */}
            <div className="relative mt-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-800" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white dark:bg-gray-950 px-4 text-gray-400">or</span>
              </div>
            </div>
          </>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} method="post" action="/auth/login" className="mt-6 space-y-5" noValidate>
          {error && (
            <div role="alert" className="rounded-xl bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <FormField label="Email" required error={fieldErrors.email} htmlFor="email">
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setFieldErrors(prev => { const n = {...prev}; delete n.email; return n; }); }}
              placeholder="john@smithplumbing.com"
              className="input-field"
              autoComplete="email"
              autoFocus
            />
          </FormField>

          <FormField label="Password" required error={fieldErrors.password} htmlFor="password">
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setFieldErrors(prev => { const n = {...prev}; delete n.password; return n; }); }}
                placeholder="Your password"
                className="input-field pr-11"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={togglePassword}
                tabIndex={-1}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                    <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </FormField>

          <div className="text-right">
            <Link
              href="/auth/reset-password"
              className="inline-block min-h-[44px] py-2 text-[13px] font-medium text-brand-600 hover:text-brand-500 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 rounded"
            >
              Forgot Password?
            </Link>
          </div>

          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="h-5 w-5 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Signing in...
              </span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Don&apos;t have an account?{' '}
          <Link
            href="/auth/signup"
            className="font-medium text-brand-600 hover:text-brand-500 rounded focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
          >
            Create one
          </Link>
        </p>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <main className="flex min-h-dvh flex-col justify-center px-6 py-12 bg-white dark:bg-gray-950">
        <div className="mx-auto w-full max-w-sm">
          <div className="text-center">
            <SnapQuoteLogo size="lg" variant="mark" className="justify-center" />
            <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-gray-100">Welcome back</h1>
            <p className="mt-1 text-[15px] text-gray-500">Sign in to manage your quotes</p>
          </div>
          <div className="mt-8 space-y-5">
            <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
            <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded-xl" />
            <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
            <div className="h-12 w-full bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse" />
          </div>
        </div>
      </main>
    }>
      <LoginForm />
    </Suspense>
  );
}
