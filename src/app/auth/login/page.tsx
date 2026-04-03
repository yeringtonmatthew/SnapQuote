'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import FormField from '@/components/ui/FormField';
import SocialAuthButtons from '@/components/SocialAuthButtons';
import { SnapQuoteLogo } from '@/components/SnapQuoteLogo';

interface FieldErrors {
  email?: string;
  password?: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

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

    router.push('/dashboard');
  }

  return (
    <main className="flex min-h-dvh flex-col justify-center px-6 py-12">
      <div className="mx-auto w-full max-w-sm">
        {/* Header */}
        <div className="text-center">
          <SnapQuoteLogo size="lg" variant="mark" className="justify-center" />
          <h1 className="mt-4 text-2xl font-bold text-gray-900">
            Welcome back
          </h1>
          <p className="mt-1 text-[15px] text-gray-500">
            Sign in to manage your quotes
          </p>
        </div>

        {/* Social Auth */}
        <div className="mt-8">
          <SocialAuthButtons redirectTo="/dashboard" />
        </div>

        {/* Divider */}
        <div className="relative mt-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-4 text-gray-400">or</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="mt-6 space-y-5" noValidate>
          {error && (
            <div role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
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
            />
          </FormField>

          <FormField label="Password" required error={fieldErrors.password} htmlFor="password">
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setFieldErrors(prev => { const n = {...prev}; delete n.password; return n; }); }}
              placeholder="Your password"
              className="input-field"
              autoComplete="current-password"
            />
          </FormField>

          <div className="text-right">
            <Link
              href="/auth/reset-password"
              className="text-[13px] font-medium text-brand-600 hover:text-brand-500 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 rounded"
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
