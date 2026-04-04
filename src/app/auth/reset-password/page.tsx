'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { SnapQuoteLogo } from '@/components/SnapQuoteLogo';

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/auth/callback?next=/auth/update-password',
    });

    if (resetError) {
      setError(resetError.message);
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  }

  return (
    <div className="flex min-h-dvh flex-col justify-center px-6 py-12 bg-white dark:bg-gray-950 animate-in fade-in duration-500">
      <div className="mx-auto w-full max-w-sm">
        {/* Header */}
        <div className="text-center">
          <SnapQuoteLogo size="lg" variant="mark" className="justify-center" />
          <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-gray-100">
            Reset Password
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Enter your email and we&apos;ll send you a reset link
          </p>
        </div>

        {sent ? (
          <div className="mt-8 space-y-5">
            <div className="rounded-2xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 px-4 py-4 text-center">
              <p className="text-[15px] font-semibold text-green-700 dark:text-green-400">Check your email</p>
              <p className="mt-1 text-[13px] text-green-600 dark:text-green-500">
                We sent a password reset link to {email}
              </p>
            </div>
            <Link
              href="/auth/login"
              className="block text-center text-[14px] font-medium text-brand-600 hover:text-brand-500"
            >
              Back to Sign In
            </Link>
          </div>
        ) : (
          <>
            <form onSubmit={handleReset} className="mt-8 space-y-5">
              {error && (
                <div role="alert" className="rounded-xl bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-600 dark:text-red-400">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="email" className="label">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@smithplumbing.com"
                  className="input-field"
                  autoComplete="email"
                />
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
                    Sending...
                  </span>
                ) : (
                  'Send Reset Link'
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-500">
              <Link
                href="/auth/login"
                className="font-medium text-brand-600 hover:text-brand-500"
              >
                Back to Sign In
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
