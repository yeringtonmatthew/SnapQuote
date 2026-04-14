'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import FormField from '@/components/ui/FormField';
import SocialAuthButtons from '@/components/SocialAuthButtons';
import { SnapQuoteLogo } from '@/components/SnapQuoteLogo';

interface FieldErrors {
  fullName?: string;
  email?: string;
  password?: string;
}

function getPasswordStrength(pw: string): 0 | 1 | 2 | 3 {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw) || /[^a-zA-Z0-9]/.test(pw)) score++;
  return score as 0 | 1 | 2 | 3;
}

const strengthLabels = ['', 'Weak', 'Medium', 'Strong'];
const strengthColors = ['', 'bg-red-500', 'bg-yellow-500', 'bg-green-500'];
const SOCIAL_AUTH_ENABLED = process.env.NEXT_PUBLIC_SOCIAL_AUTH_ENABLED === 'true';

function getFriendlySignupError(message: string): string {
  const normalized = message.toLowerCase();

  if (normalized.includes('email rate limit exceeded')) {
    return 'We just hit our confirmation email sending limit. Please wait a minute and try again.';
  }

  if (normalized.includes('email address') && normalized.includes('is invalid')) {
    return 'Enter a valid email address.';
  }

  return message;
}

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [confirmationEmail, setConfirmationEmail] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const passwordStrength = useMemo(() => getPasswordStrength(password), [password]);

  function validate(): boolean {
    const errors: FieldErrors = {};

    if (!fullName.trim()) {
      errors.fullName = 'Full name is required';
    }

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

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);
    setError(null);

    const supabase = createClient();
    const emailRedirectTo =
      typeof window !== 'undefined'
        ? `${window.location.origin}/auth/callback?next=${encodeURIComponent('/onboarding')}`
        : undefined;

    const { data, error: signupError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        ...(emailRedirectTo ? { emailRedirectTo } : {}),
      },
    });

    if (signupError) {
      setError(getFriendlySignupError(signupError.message));
      setLoading(false);
      return;
    }

    // When email confirmation is enabled in Supabase, signUp may not create a
    // session immediately. In that case keep the user on a success state rather
    // than bouncing them into /auth/login?next=/onboarding.
    if (!data.session) {
      setConfirmationEmail(email);
      setLoading(false);
      return;
    }

    // Update the user profile with full name
    const user = data.user;
    if (user) {
      await supabase
        .from('users')
        .update({
          full_name: fullName,
          subscription_status: 'trialing',
          trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .eq('id', user.id);
    }

    router.push('/onboarding');
  }

  if (confirmationEmail) {
    return (
      <main className="flex min-h-dvh flex-col justify-center px-6 py-12 bg-white dark:bg-gray-950">
        <div className="mx-auto w-full max-w-sm animate-fade-up text-center">
          <SnapQuoteLogo size="lg" variant="mark" className="justify-center" />
          <div className="mx-auto mt-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 8.25v8.25A2.25 2.25 0 0119.5 18.75h-15A2.25 2.25 0 012.25 16.5V8.25m19.5 0A2.25 2.25 0 0019.5 6h-15a2.25 2.25 0 00-2.25 2.25m19.5 0l-8.69 5.517a2.25 2.25 0 01-2.12 0L2.25 8.25" />
            </svg>
          </div>
          <h1 className="mt-6 text-2xl font-bold text-gray-900 dark:text-gray-100">
            Check your email
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-gray-500 dark:text-gray-400">
            We sent a confirmation link to <span className="font-medium text-gray-900 dark:text-gray-100">{confirmationEmail}</span>.
            Open it to finish setting up your account, and we&apos;ll bring you straight into onboarding.
          </p>

          <div className="mt-8 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-5 text-left">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Next step</p>
            <p className="mt-2 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
              If the email doesn&apos;t show up in a minute, check spam or promotions and then come back here.
            </p>
          </div>

          <div className="mt-8 space-y-3">
            <Link href="/auth/login" className="btn-primary block">
              Back to Login
            </Link>
            <button
              type="button"
              onClick={() => setConfirmationEmail(null)}
              className="w-full rounded-full px-5 py-3 text-sm font-medium text-gray-500 transition hover:text-gray-700"
            >
              Use a different email
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-dvh flex-col justify-center px-6 py-12 bg-white dark:bg-gray-950">
      <div className="mx-auto w-full max-w-sm animate-fade-up">
        {/* Header */}
        <div className="text-center">
          <SnapQuoteLogo size="lg" variant="mark" className="justify-center" />
          <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-gray-100">
            Create your account
          </h1>
          <p className="mt-1 text-[15px] text-gray-500">
            Start sending AI-powered quotes in minutes
          </p>
        </div>

        {SOCIAL_AUTH_ENABLED && (
          <>
            {/* Social Auth */}
            <div className="mt-8">
              <SocialAuthButtons redirectTo="/onboarding" />
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
        <form onSubmit={handleSignup} method="post" action="/auth/signup" className="mt-6 space-y-5" noValidate>
          {error && (
            <div role="alert" className="rounded-xl bg-red-50 dark:bg-red-950/40 px-4 py-3 text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <FormField label="Full Name" required error={fieldErrors.fullName} htmlFor="fullName">
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => { setFullName(e.target.value); setFieldErrors(prev => { const n = {...prev}; delete n.fullName; return n; }); }}
              placeholder="John Smith"
              className="input-field"
              autoComplete="name"
              autoFocus
            />
          </FormField>

          <FormField label="Email" required error={fieldErrors.email} htmlFor="email">
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setFieldErrors(prev => { const n = {...prev}; delete n.email; return n; }); }}
              placeholder="john@smithplumbing.com"
              className="input-field"
              autoComplete="email"
            />
          </FormField>

          <FormField label="Password" required error={fieldErrors.password} htmlFor="password">
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setFieldErrors(prev => { const n = {...prev}; delete n.password; return n; }); }}
                placeholder="At least 6 characters"
                className="input-field pr-11"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
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
            {password && (
              <div className="mt-2">
                <div className="flex gap-1.5">
                  {[1, 2, 3].map((seg) => (
                    <div
                      key={seg}
                      className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                        seg <= passwordStrength
                          ? strengthColors[passwordStrength]
                          : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                    />
                  ))}
                </div>
                <p className={`mt-1 text-xs ${
                  passwordStrength === 1 ? 'text-red-500' :
                  passwordStrength === 2 ? 'text-yellow-600 dark:text-yellow-400' :
                  passwordStrength === 3 ? 'text-green-600 dark:text-green-400' : ''
                }`}>
                  {strengthLabels[passwordStrength]}
                </p>
              </div>
            )}
          </FormField>

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
                Creating account...
              </span>
            ) : (
              'Create Account'
            )}
          </button>

          <p className="text-center text-xs text-gray-400 leading-relaxed">
            By creating an account, you agree to our{' '}
            <Link href="/terms" className="text-brand-600 underline underline-offset-2">Terms</Link>
            {' '}and{' '}
            <Link href="/privacy" className="text-brand-600 underline underline-offset-2">Privacy Policy</Link>.
          </p>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link
            href="/auth/login"
            className="font-medium text-brand-600 hover:text-brand-500"
          >
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
