import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getTrialDaysRemaining, canAccessApp } from '@/lib/subscription';

export default async function SubscribePage() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const adminSb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const { data: profile } = await adminSb
    .from('users')
    .select('subscription_status, trial_ends_at, business_name')
    .eq('id', user.id)
    .single();

  // If they already have access, send them to the dashboard
  if (profile && canAccessApp(profile)) {
    redirect('/dashboard');
  }

  const daysLeft = profile ? getTrialDaysRemaining(profile) : 0;
  const isExpired = daysLeft <= 0;

  return (
    <div className="min-h-dvh bg-gradient-to-b from-gray-50 to-white flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md text-center">
        {/* Logo */}
        <div className="mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-white text-2xl font-bold">
            ⚡
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          {isExpired ? 'Your free trial has ended' : `${daysLeft} days left in your trial`}
        </h1>
        <p className="mt-3 text-gray-500 text-[16px] leading-relaxed">
          {isExpired
            ? 'Subscribe to keep using SnapQuote — unlimited quotes, AI generation, payments, and more.'
            : 'Subscribe now to lock in your access when your trial ends.'}
        </p>

        {/* Pricing card */}
        <div className="mt-10 rounded-2xl bg-white p-8 shadow-lg ring-1 ring-gray-100">
          <p className="text-sm font-semibold text-brand-600 uppercase tracking-wide">SnapQuote Pro</p>
          <p className="mt-4 flex items-baseline justify-center gap-1">
            <span className="text-5xl font-bold text-gray-900">$79</span>
            <span className="text-gray-500">/month</span>
          </p>
          <p className="mt-2 text-sm text-gray-400">Cancel anytime</p>

          <ul className="mt-8 space-y-3 text-left text-[14px] text-gray-700">
            {[
              'Unlimited quotes',
              'AI-powered quote generation',
              'SMS & email delivery',
              'Online payments & e-signatures',
              'Automated follow-up sequences',
              'CRM pipeline & scheduling',
              'iOS & web app',
            ].map((item) => (
              <li key={item} className="flex items-center gap-2.5">
                <svg className="h-4 w-4 text-brand-500 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                {item}
              </li>
            ))}
          </ul>

          <Link
            href="/api/stripe/subscribe"
            className="mt-8 block w-full rounded-full bg-brand-600 py-3.5 text-center text-[15px] font-semibold text-white shadow-lg shadow-brand-600/25 transition-all hover:bg-brand-500 active:scale-[0.97]"
          >
            Subscribe — $79/month
          </Link>

          <p className="mt-4 text-xs text-gray-400">
            Powered by Stripe · 30-day money-back guarantee
          </p>
        </div>

        {/* Back link */}
        <Link href="/settings" className="mt-6 inline-block text-sm text-gray-400 hover:text-gray-600">
          ← Back to settings
        </Link>
      </div>
    </div>
  );
}
