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

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
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

    const { error: signupError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });

    if (signupError) {
      setError(signupError.message);
      setLoading(false);
      return;
    }

    // Update the user profile with full name
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from('users')
        .update({ full_name: fullName })
        .eq('id', user.id);
    }

    router.push('/onboarding');
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

        {/* Form */}
        <form onSubmit={handleSignup} className="mt-6 space-y-5" noValidate>
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
